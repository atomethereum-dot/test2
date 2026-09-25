/* Pruebas de SectoraStakingSeason contra un nodo local.
 *
 *   npx hardhat node          (en otra terminal)
 *   node scripts/compile.js
 *   node scripts/test-season.js
 *
 * Lo que se prueba es la parte nueva y la que puede costar dinero: que
 * nadie cobre antes de tiempo, que la racha se rompa cuando debe, que NO
 * se rompa cuando el staker vuelve a tiempo, y sobre todo que no exista el
 * atajo de sacar el 99,9% dejando un wei dentro para no "salir" nunca.
 *
 * NOTA SOBRE EL ARNES: todas las transacciones van con gasLimit explicito.
 * Despues de un salto temporal con evm_increaseTime, eth_estimateGas de
 * Hardhat simula contra un bloque que aun no lleva aplicado el
 * desplazamiento y da por revertidas transacciones que en realidad pasan.
 */
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const ARTIFACTS = path.join(__dirname, "..", "artifacts-manual");
const load = (n) => JSON.parse(fs.readFileSync(path.join(ARTIFACTS, n + ".json"), "utf8"));
const GAS = { gasLimit: 800000 };

let pasan = 0, fallan = 0;
function ok(cond, msg) {
  if (cond) { pasan++; console.log("  ok    ", msg); }
  else { fallan++; console.log("  FALLA ", msg); }
}
function cerca(a, b, tol, msg) {
  const d = Math.abs(a - b);
  ok(d <= tol, `${msg}  (${a.toFixed(4)} vs ${b.toFixed(4)}, tol ${tol})`);
}
async function revierte(fn, msg) {
  try { const tx = await fn(); await tx.wait(); fallan++; console.log("  FALLA ", msg, "(no revirtio)"); }
  catch (e) { pasan++; console.log("  ok    ", msg); }
}

const E = ethers.parseEther;
const N = (x) => Number(ethers.formatEther(x));

const DIA = 86400;
const MES = Math.round((365 * DIA) / 12);   // 2629800 s, el mes que usa el 7%
const TEMPORADA = 7 * MES;                   // 7 meses

async function main() {
  const p = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const deployer = await p.getSigner(0);
  const alice = await p.getSigner(2);
  const bob = await p.getSigner(3);
  const carol = await p.getSigner(4);

  const avanzar = async (s) => { await p.send("evm_increaseTime", [s]); await p.send("evm_mine", []); };

  // --- despliegue -------------------------------------------------
  const tokArt = load("SectoraToken");
  const segArt = load("SectoraStakingSeason");

  const Tok = new ethers.ContractFactory(tokArt.abi, tokArt.bytecode, deployer);
  const tok = await Tok.deploy(E("50000000"), { gasLimit: 4000000 });
  await tok.waitForDeployment();

  const Seg = new ethers.ContractFactory(segArt.abi, segArt.bytecode, deployer);
  const seg = await Seg.deploy(await tok.getAddress(), 8400, TEMPORADA, { gasLimit: 4000000 });
  await seg.waitForDeployment();

  console.log("\n=== parametros ===");
  const pv0 = await seg.poolView();
  ok(pv0[2] === 8400n, "rate 8400 bps = 84% anual = 7% mensual");
  const fin = Number(pv0[3]);
  const ahora = Number(pv0[6]);
  cerca((fin - ahora) / MES, 7, 0.01, "la temporada dura 7 meses");

  // repartir y aprobar
  for (const [q, cant] of [[alice, "10000"], [bob, "10000"], [carol, "10000"]]) {
    await (await tok.connect(deployer).transfer(await q.getAddress(), E(cant), GAS)).wait();
    await (await tok.connect(q).approve(await seg.getAddress(), E("1000000"), GAS)).wait();
  }
  await (await tok.connect(deployer).approve(await seg.getAddress(), E("10000000"), GAS)).wait();
  await (await seg.connect(deployer).fundRewards(E("1000000"), GAS)).wait();

  // --- 1. devengo al 7% mensual -----------------------------------
  console.log("\n=== 1. devengo ===");
  await (await seg.connect(alice).stake(E("1000"), GAS)).wait();
  await avanzar(MES);
  await p.send("evm_mine", []);
  cerca(N(await seg.earned(await alice.getAddress())), 70, 0.5, "1 mes sobre 1000 -> ~70 (7%)");

  // --- 2. no se puede cobrar antes de tiempo ----------------------
  console.log("\n=== 2. nadie cobra antes del final ===");
  await revierte(() => seg.connect(alice).claim(GAS), "claim() revierte durante la temporada");

  // --- 3. la racha se conserva si vuelve dentro de 24 h -----------
  console.log("\n=== 3. vuelve a tiempo -> conserva ===");
  const antesBob = await (async () => {
    await (await seg.connect(bob).stake(E("1000"), GAS)).wait();
    await avanzar(MES);
    await p.send("evm_mine", []);
    return N(await seg.earned(await bob.getAddress()));
  })();
  ok(antesBob > 60, `bob lleva devengado ${antesBob.toFixed(2)}`);
  await (await seg.connect(bob).unstake(E("600"), GAS)).wait();
  const av = await seg.accountView(await bob.getAddress());
  ok(av[3] > 0n, "al bajar del pico se abre la ventana de 24 h");
  await avanzar(20 * 3600); // 20 h, dentro de la ventana
  await (await seg.connect(bob).stake(E("600"), GAS)).wait();
  const av2 = await seg.accountView(await bob.getAddress());
  ok(av2[3] === 0n, "al restaurar el saldo la ventana se cierra");
  ok(N(await seg.earned(await bob.getAddress())) >= antesBob, "no perdio nada de lo devengado");

  // --- 4. la racha se rompe si no vuelve --------------------------
  console.log("\n=== 4. no vuelve -> pierde ===");
  await (await seg.connect(carol).stake(E("1000"), GAS)).wait();
  await avanzar(MES);
  await p.send("evm_mine", []);
  const antesCarol = N(await seg.earned(await carol.getAddress()));
  ok(antesCarol > 60, `carol lleva devengado ${antesCarol.toFixed(2)}`);
  await (await seg.connect(carol).unstake(E("1000"), GAS)).wait();
  await avanzar(25 * 3600); // 25 h: la ventana ya cerro
  ok(N(await seg.earned(await carol.getAddress())) === 0, "earned() ya devuelve 0 tras cerrarse la ventana");
  // tocar la cuenta ejecuta el olvido; el evento dice cuanto se perdio
  const rec = await (await seg.connect(carol).stake(E("1000"), GAS)).wait();
  ok(N(await seg.earned(await carol.getAddress())) < 1, "lo devengado se perdio de verdad");
  // rewardPool no se puede comparar antes/despues a secas: entre medias
  // devenga para los demas stakers y baja por su cuenta. Lo que prueba que
  // el importe vuelve al fondo y no al dueño es el evento, que se emite en
  // la misma sentencia que hace rewardPool += lost
  const roto = rec.logs
    .map((l) => { try { return seg.interface.parseLog(l); } catch { return null; } })
    .find((l) => l && l.name === "StreakBroken");
  ok(roto !== undefined, "se emite StreakBroken");
  cerca(N(roto.args[1]), antesCarol, 0.5, "lo perdido es exactamente lo devengado, y vuelve al fondo");

  // --- 5. el atajo del wei ----------------------------------------
  console.log("\n=== 5. el atajo de dejar 1 wei dentro ===");
  const d = await p.getSigner(5);
  await (await tok.connect(deployer).transfer(await d.getAddress(), E("10000"), GAS)).wait();
  await (await tok.connect(d).approve(await seg.getAddress(), E("1000000"), GAS)).wait();
  await (await seg.connect(d).stake(E("1000"), GAS)).wait();
  await avanzar(MES);
  await p.send("evm_mine", []);
  const antesD = N(await seg.earned(await d.getAddress()));
  ok(antesD > 60, `lleva devengado ${antesD.toFixed(2)}`);
  // saca todo menos 1 wei: nunca "sale", su saldo nunca es 0
  await (await seg.connect(d).unstake(E("1000") - 1n, GAS)).wait();
  const avd = await seg.accountView(await d.getAddress());
  ok(avd[0] === 1n, "sigue con 1 wei dentro, nunca salio");
  ok(avd[3] > 0n, "aun asi se le abrio la ventana, por bajar del pico");
  await avanzar(25 * 3600);
  ok(N(await seg.earned(await d.getAddress())) === 0, "el atajo NO funciona: pierde igual");

  // --- 6. el devengo para al cerrar la temporada ------------------
  console.log("\n=== 6. la temporada se cierra sola ===");
  const e1 = N(await seg.earned(await alice.getAddress()));
  await avanzar(TEMPORADA); // muy pasado el final
  await p.send("evm_mine", []);
  const e2 = N(await seg.earned(await alice.getAddress()));
  ok(e2 > e1, "devengo hasta el cierre");
  await avanzar(2 * MES);
  await p.send("evm_mine", []);
  cerca(N(await seg.earned(await alice.getAddress())), e2, 0.0001, "despues del cierre ya no devenga mas");
  await revierte(() => seg.connect(alice).stake(E("1"), GAS), "stake() revierte con la temporada cerrada");

  // --- 7. cobro final ---------------------------------------------
  console.log("\n=== 7. cobro al final ===");
  const saldoAntes = N(await tok.balanceOf(await alice.getAddress()));
  const debido = N(await seg.earned(await alice.getAddress()));
  await (await seg.connect(alice).claim(GAS)).wait();
  const saldoDespues = N(await tok.balanceOf(await alice.getAddress()));
  cerca(saldoDespues - saldoAntes, debido, 0.01, "cobra exactamente lo devengado");
  const totalAlice = debido / 1000 * 100;
  console.log(`         alice mantuvo 1000 toda la temporada -> ${totalAlice.toFixed(1)}% (esperado ~49%)`);
  cerca(totalAlice, 49, 1.5, "una temporada completa paga ~49%");

  // --- 8. el dueño no puede tocar lo ya devengado -----------------
  console.log("\n=== 8. limites del dueño ===");
  const pool = (await seg.poolView())[1];
  const dueno = await deployer.getAddress();
  await revierte(
    () => seg.connect(deployer).withdrawRewards(dueno, pool + E("1"), GAS),
    "withdrawRewards no puede pasar de rewardPool"
  );
  const pendienteBob = await seg.earned(await bob.getAddress());
  await (await seg.connect(deployer).withdrawAllRewards(dueno, GAS)).wait();
  ok((await seg.earned(await bob.getAddress())) === pendienteBob,
     "vaciar el fondo entero no toca lo ya devengado de bob");
  await (await seg.connect(bob).claim(GAS)).wait();
  ok(true, "bob cobra aunque el dueño vacio el fondo no asignado");

  console.log(`\n================  ${pasan} pasan, ${fallan} fallan  ================`);
  process.exit(fallan ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
