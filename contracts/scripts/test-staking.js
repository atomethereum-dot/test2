/* Pruebas de SectoraStaking contra un nodo local.
 *
 *   npx hardhat node          (en otra terminal)
 *   node scripts/compile.js
 *   node scripts/test-staking.js
 *
 * Se prueba sobre todo lo que puede salir mal, no el camino feliz: que el
 * fondo de recompensas no pueda pagar con el principal de otro, que un
 * fondo agotado no genere una deuda impagable, y que nadie quede atrapado.
 *
 * NOTA SOBRE EL ARNES: todas las transacciones van con gasLimit explicito.
 * Despues de un salto temporal con evm_increaseTime, eth_estimateGas de
 * Hardhat simula contra un bloque que aun no lleva aplicado el
 * desplazamiento y da por revertidas transacciones que en realidad pasan
 * (comprobado: la misma llamada revertia en la estimacion y se minaba con
 * status=1). Con gasLimit fijo no hay estimacion, y un revert de verdad se
 * sigue detectando porque la transaccion se mina con status 0 y .wait()
 * lanza.
 */
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const ARTIFACTS = path.join(__dirname, "..", "artifacts-manual");
const load = (n) => JSON.parse(fs.readFileSync(path.join(ARTIFACTS, n + ".json"), "utf8"));
const GAS = { gasLimit: 500000 };

let pasan = 0;
let fallan = 0;
function ok(cond, msg) {
  if (cond) { pasan++; console.log("  ok   ", msg); }
  else { fallan++; console.log("  FALLA", msg); }
}
async function revierte(fn, msg) {
  try {
    const tx = await fn();
    await tx.wait();
    fallan++; console.log("  FALLA", msg, "(no revirtio)");
  } catch (e) {
    pasan++; console.log("  ok   ", msg);
  }
}

const E = ethers.parseEther;
const N = (x) => Number(ethers.formatEther(x));

async function main() {
  const p = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const deployer = await p.getSigner(0);
  const alice = await p.getSigner(2);
  const bob = await p.getSigner(3);

  const avanzar = async (segundos) => {
    await p.send("evm_increaseTime", [segundos]);
    await p.send("evm_mine", []);
  };

  const tokenArt = load("SectoraToken");
  const stakeArt = load("SectoraStaking");

  const token = await new ethers.ContractFactory(tokenArt.abi, tokenArt.bytecode, deployer)
    .deploy(E("1000000"));
  await token.waitForDeployment();

  const RATE = 1490n;           // 14,90 % anual, lo que anuncia la web
  const LOCK = 7 * 24 * 3600;   // 7 dias
  const staking = await new ethers.ContractFactory(stakeArt.abi, stakeArt.bytecode, deployer)
    .deploy(await token.getAddress(), RATE, LOCK);
  await staking.waitForDeployment();
  const dir = await staking.getAddress();
  const A = await alice.getAddress();
  const B = await bob.getAddress();
  const D = await deployer.getAddress();

  console.log("\n== despliegue ==");
  ok((await staking.rateBps()) === RATE, "la tasa queda en 1490 pb (14,90 %)");
  ok((await staking.lockPeriod()) === BigInt(LOCK), "el bloqueo queda en 7 dias");
  ok((await staking.stakingToken()) === (await token.getAddress()), "apunta al token correcto");
  await revierte(
    () => new ethers.ContractFactory(stakeArt.abi, stakeArt.bytecode, deployer)
      .deploy(token.getAddress(), 10001n, 0, GAS),
    "rechaza una tasa por encima del maximo"
  );
  await revierte(
    () => new ethers.ContractFactory(stakeArt.abi, stakeArt.bytecode, deployer)
      .deploy(ethers.ZeroAddress, RATE, 0, GAS),
    "rechaza el token en cero"
  );

  await (await token.transfer(A, E("10000"), GAS)).wait();
  await (await token.transfer(B, E("10000"), GAS)).wait();

  console.log("\n== depositar ==");
  await (await token.connect(alice).approve(dir, E("100000"), GAS)).wait();
  await revierte(() => staking.connect(alice).stake(0, GAS), "rechaza depositar cero");
  await (await staking.connect(alice).stake(E("1000"), GAS)).wait();
  ok(N(await staking.totalStaked()) === 1000, "totalStaked recoge el deposito");
  ok(N((await staking.accounts(A)).amount) === 1000, "la cuenta guarda su principal");
  ok(N(await staking.rewardPool()) === 0, "el fondo de recompensas sigue vacio");
  ok((await staking.stakerCount()) === 1n, "stakerCount sube a 1");
  await (await staking.connect(alice).stake(E("10"), GAS)).wait();
  ok((await staking.stakerCount()) === 1n, "un segundo deposito del mismo no lo cuenta dos veces");

  console.log("\n== el fondo vacio no puede pagar ==");
  await avanzar(30 * 24 * 3600);
  ok(N(await staking.earned(A)) === 0, "sin fondo no se devenga nada, aunque pase un mes");
  await revierte(() => staking.connect(alice).claim(GAS), "no se puede cobrar de un fondo vacio");

  console.log("\n== el principal ajeno es intocable ==");
  await (await token.connect(bob).approve(dir, E("100000"), GAS)).wait();
  await (await staking.connect(bob).stake(E("1000"), GAS)).wait();
  ok(N(await token.balanceOf(dir)) === 2010, "el contrato tiene 2010 en total");
  ok(N(await staking.rewardPool()) === 0,
     "y aun asi el fondo es cero: el principal no cuenta como recompensa");
  await revierte(() => staking.withdrawRewards(D, E("100"), GAS),
     "el dueño no puede sacar el principal disfrazado de recompensa");

  console.log("\n== financiar y devengar ==");
  await (await token.approve(dir, E("100000"), GAS)).wait();
  await (await staking.fundRewards(E("1000"), GAS)).wait();
  ok(N(await staking.rewardPool()) === 1000, "el fondo recibe los 1000");

  await avanzar(365 * 24 * 3600);   // un año exacto
  const gAlice = await staking.earned(A);
  // 1000 depositados al 14,9 % durante un año = 149
  ok(Math.abs(N(gAlice) - 150.5) < 2,
     "un año al 14,9 % sobre 1010 devenga ~150,5 (leido " + N(gAlice).toFixed(2) + ")");
  const gBob = await staking.earned(B);
  ok(Math.abs(N(gAlice) - N(gBob)) < 3,
     "los dos devengan en proporcion a su deposito (" + N(gBob).toFixed(2) + ")");

  console.log("\n== cobrar ==");
  const antes = await token.balanceOf(A);
  await (await staking.connect(alice).claim(GAS)).wait();
  const cobrado = (await token.balanceOf(A)) - antes;
  ok(Math.abs(N(cobrado) - 150.5) < 2, "cobra lo devengado (" + N(cobrado).toFixed(2) + ")");
  ok(N(await staking.totalStaked()) === 2010, "cobrar no toca el principal");
  ok(N((await staking.accounts(A)).pending) === 0, "el pendiente queda a cero");

  console.log("\n== el bloqueo ==");
  await (await staking.connect(bob).stake(E("500"), GAS)).wait();  // reinicia su bloqueo
  await revierte(() => staking.connect(bob).unstake(E("100"), GAS),
     "no puede retirar dentro del bloqueo");
  await avanzar(8 * 24 * 3600);
  await (await staking.connect(bob).unstake(E("100"), GAS)).wait();
  ok(N((await staking.accounts(B)).amount) === 1400, "retira pasado el bloqueo");
  await revierte(() => staking.connect(bob).unstake(E("99999"), GAS),
     "no puede retirar mas de lo que tiene");

  console.log("\n== fondo agotado ==");
  // withdrawRewards(pool) con el valor recien leido siempre revienta: _update
  // encoge el fondo entre la lectura y la comprobacion. Para eso esta la
  // variante que lee el importe ya dentro de la llamada.
  await revierte(() => staking.withdrawRewards(D, staking.rewardPool(), GAS),
     "pasar el fondo recien leido revienta, como debe");
  await (await staking.withdrawAllRewards(D, GAS)).wait();
  ok(N(await staking.rewardPool()) === 0, "withdrawAllRewards vacia el fondo de una vez");
  await avanzar(365 * 24 * 3600);
  await (await staking.connect(bob).unstake(E("1"), GAS)).wait();  // fuerza un _update
  ok(await staking.accrualPaused(), "con el fondo seco el devengo se pausa");
  const antesBob = await token.balanceOf(B);
  await (await staking.connect(bob).unstake(E("1399"), GAS)).wait();
  ok(N((await token.balanceOf(B)) - antesBob) === 1399,
     "recupera su principal integro aunque el fondo este seco");
  ok(N((await staking.accounts(B)).amount) === 0, "queda a cero");
  ok((await staking.stakerCount()) === 1n, "al vaciar su posicion baja el contador");

  console.log("\n== refinanciar reanuda ==");
  await (await staking.fundRewards(E("500"), GAS)).wait();
  ok(!(await staking.accrualPaused()), "al refinanciar se reanuda el devengo");
  ok(N(await staking.rewardPool()) === 500, "el fondo vuelve a tener saldo");

  console.log("\n== salida de emergencia ==");
  await (await staking.connect(alice).stake(E("100"), GAS)).wait();  // vuelve a bloquear
  await avanzar(30 * 24 * 3600);
  ok(N(await staking.earned(A)) > 0, "tiene recompensas pendientes");
  const balAntes = await token.balanceOf(A);
  await (await staking.connect(alice).emergencyWithdraw(GAS)).wait();
  const sacado = (await token.balanceOf(A)) - balAntes;
  ok(N(sacado) === 1110, "saca su principal integro saltandose el bloqueo (" + N(sacado) + ")");
  ok(N((await staking.accounts(A)).amount) === 0, "queda sin principal");
  ok(N((await staking.accounts(A)).pending) === 0, "y sin recompensas: las cede");
  ok((await staking.stakerCount()) === 0n, "la salida de emergencia tambien descuenta");

  console.log("\n== solvencia ==");
  const saldo = await token.balanceOf(dir);
  const deuda = (await staking.totalStaked()) + (await staking.rewardPool());
  ok(saldo >= deuda,
     "el contrato tiene al menos lo que debe: saldo " + N(saldo).toFixed(2) +
     " >= principal+fondo " + N(deuda).toFixed(2));

  console.log("\n== permisos ==");
  await revierte(() => staking.connect(alice).setRate(500n, GAS), "un cualquiera no cambia la tasa");
  await revierte(() => staking.connect(alice).setLockPeriod(0, GAS), "un cualquiera no cambia el bloqueo");
  await revierte(() => staking.connect(alice).withdrawRewards(A, 1n, GAS), "un cualquiera no vacia el fondo");
  await revierte(() => staking.setRate(10001n, GAS), "ni el dueño puede pasarse del maximo");
  await (await staking.setRate(2000n, GAS)).wait();
  ok((await staking.rateBps()) === 2000n, "el dueño si puede cambiar la tasa");

  console.log("\n== vistas para la interfaz ==");
  const av = await staking.accountView(A);
  ok(av.length === 5, "accountView devuelve los cinco campos");
  const pv = await staking.poolView();
  ok(pv.length === 7, "poolView devuelve los siete campos");
  ok(pv[2] === 2000n, "poolView refleja la tasa nueva");
  ok(pv[5] === (await staking.stakerCount()), "poolView trae el contador de stakers");
  ok(Number(pv[6]) > 1700000000, "poolView trae la hora de la cadena");

  console.log("\n-----------------------------");
  console.log("pasan: %d   fallan: %d", pasan, fallan);
  process.exit(fallan === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
