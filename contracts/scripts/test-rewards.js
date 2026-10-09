/* Pruebas de SectoraHolderRewards contra un nodo local.
 *
 *   npx hardhat node          (en otra terminal)
 *   node scripts/compile.js
 *   node scripts/test-rewards.js
 *
 * El programa: 14,9% APY al arrancar (el dueño puede cambiarla con setRate), sin bloqueo, cobro cuando quieran, tope de
 * 10M #SECT depositados, fondo pagado por la tesorería y sin bloqueo para
 * el dueño (puede retirar lo que nadie ha ganado todavía).
 *
 * Lo que se prueba es lo que puede costar dinero: que el ritmo sea el
 * anunciado, que retirar funcione siempre y no haga perder lo ganado, que
 * el dueño no pueda tocar depósitos ni recompensas ya ganadas, que el tope
 * se respete y que un fondo vacío pare el devengo en vez de prometer.
 *
 * NOTA SOBRE EL ARNES: todas las transacciones van con gasLimit explicito y
 * los reverts se comprueban con staticCall, que es lo que permite leer el
 * motivo (ver test-season.js).
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
  ok(Math.abs(a - b) <= tol, `${msg}  (${a.toFixed(4)} vs ${b.toFixed(4)}, tol ${tol})`);
}
async function revierte(fn, msg, motivo) {
  try { await fn(); fallan++; console.log("  FALLA ", msg, "(no revirtio)"); }
  catch (e) {
    const m = (e && (e.reason || e.shortMessage || e.message)) || "";
    if (motivo && !m.includes(motivo)) { fallan++; console.log("  FALLA ", msg, "(motivo: " + m.slice(0, 120) + ")"); return; }
    pasan++; console.log("  ok    ", msg + (motivo ? `  [${motivo}]` : ""));
  }
}

const E = ethers.parseEther;
const N = (x) => Number(ethers.formatEther(x));
const DIA = 86400;
const ANO = 365 * DIA;

async function main() {
  const p = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const dueno = await p.getSigner(0);
  const alice = await p.getSigner(2);
  const bob = await p.getSigner(3);
  const dir = (s) => s.getAddress();
  const avanzar = async (s) => { await p.send("evm_increaseTime", [Math.round(s)]); await p.send("evm_mine", []); };

  const tokArt = load("SectoraToken");
  const rArt = load("SectoraHolderRewards");
  const tok = await new ethers.ContractFactory(tokArt.abi, tokArt.bytecode, dueno).deploy(E("50000000"), { gasLimit: 4000000 });
  await tok.waitForDeployment();
  const R = new ethers.ContractFactory(rArt.abi, rArt.bytecode, dueno);
  const r = await R.deploy(await tok.getAddress(), { gasLimit: 4000000 });
  const recDep = await r.deploymentTransaction().wait();
  const ra = await r.getAddress();
  const saldo = async (s) => N(await tok.balanceOf(await dir(s)));

  // --- 0. parametros ----------------------------------------------
  console.log("\n=== 0. parametros ===");
  console.log(`         gas del despliegue: ${recDep.gasUsed}`);
  const pv = await r.poolView();
  ok(pv.rate === 1490n, "tasa inicial 1490 bps = 14,9% APY");
  ok(pv.cap === E("10000000"), "tope 10.000.000 #SECT");
  ok(pv.depositsClosed === true, "los depositos nacen cerrados");
  for (const q of [alice, bob]) {
    await (await tok.connect(dueno).transfer(await dir(q), E("100000"), GAS)).wait();
    await (await tok.connect(q).approve(ra, E("100000000"), GAS)).wait();
  }
  await revierte(() => r.connect(alice).deposit.staticCall(E("1000"), GAS), "deposit revierte con depositos cerrados", "deposits paused");
  await revierte(() => r.connect(alice).setDepositsPaused.staticCall(false, GAS), "solo el dueño abre los depositos");
  await (await tok.connect(dueno).approve(ra, E("40000000"), GAS)).wait();
  await (await r.connect(dueno).fundRewards(E("1000000"), GAS)).wait();
  await (await r.connect(dueno).setDepositsPaused(false, GAS)).wait();

  // --- 1. el ritmo -------------------------------------------------
  console.log("\n=== 1. 14,9% APY ===");
  await (await r.connect(alice).deposit(E("10000"), GAS)).wait();
  await avanzar(ANO);
  cerca(N(await r.earned(await dir(alice))), 1490, 0.05, "un año sobre 10.000 -> 1.490 (14,9%)");
  await (await r.connect(bob).deposit(E("10000"), GAS)).wait();
  await avanzar(30 * DIA);
  cerca(N(await r.earned(await dir(bob))), 10000 * 0.149 * 30 / 365, 0.01, "30 dias sobre 10.000 -> 122,47");

  // --- 2. cobrar cuando quieran -------------------------------------
  console.log("\n=== 2. cobro libre ===");
  let antes = await saldo(alice);
  const debe = N(await r.earned(await dir(alice)));
  await (await r.connect(alice).claim(GAS)).wait();
  cerca((await saldo(alice)) - antes, debe, 0.01, "alice cobra lo ganado sin esperar a ninguna fecha");
  ok(N(await r.earned(await dir(alice))) < 0.01, "tras cobrar, lo pendiente vuelve a cero");

  // --- 3. retirar sin perder nada -----------------------------------
  console.log("\n=== 3. retiro libre ===");
  const ganadoBob = N(await r.earned(await dir(bob)));
  antes = await saldo(bob);
  await (await r.connect(bob).withdraw(E("10000"), GAS)).wait();
  cerca((await saldo(bob)) - antes, 10000, 0, "bob recupera su deposito entero al instante");
  ok((await r.depositorCount()) === 1n, "deja de contar como depositante");
  await avanzar(10 * DIA);
  cerca(N(await r.earned(await dir(bob))), ganadoBob, 0.01, "lo ganado sigue ahi y ya no crece");
  antes = await saldo(bob);
  await (await r.connect(bob).claim(GAS)).wait();
  cerca((await saldo(bob)) - antes, ganadoBob, 0.01, "y lo cobra despues de haber retirado");
  await revierte(() => r.connect(bob).withdraw.staticCall(E("1"), GAS), "no puede retirar mas de lo depositado", "amount above deposit");
  await revierte(() => r.connect(bob).claim.staticCall(GAS), "no puede cobrar dos veces", "nothing to claim");

  // --- 4. retiro parcial --------------------------------------------
  console.log("\n=== 4. retiro parcial ===");
  await (await r.connect(alice).withdraw(E("4000"), GAS)).wait();
  await avanzar(ANO);
  // los 10 dias del paso 3 alice aun tenia 10.000 dentro; despues, 6.000
  cerca(N(await r.earned(await dir(alice))), 10000 * 0.149 * 10 / 365 + 6000 * 0.149, 0.1,
        "devenga sobre 10.000 hasta el retiro y sobre los 6.000 que quedan despues");

  // --- 5. limites del dueño -----------------------------------------
  console.log("\n=== 5. el dueño no toca depositos ni lo ganado ===");
  const yo = await dir(dueno);
  const ganadoAlice = await r.earned(await dir(alice));
  await revierte(() => r.connect(alice).withdrawRewards.staticCall(yo, E("1"), GAS), "solo el dueño puede retirar fondo");
  const pool = (await r.poolView()).pool;
  await revierte(() => r.connect(dueno).withdrawRewards.staticCall(yo, pool + E("1"), GAS), "no puede pasar del fondo no asignado", "amount above pool");
  await (await r.connect(dueno).withdrawAllRewards(yo, GAS)).wait();
  ok((await r.rewardPool()) === 0n, "el dueño vacia el fondo no asignado (sin bloqueo, como se eligio)");
  ok((await r.earned(await dir(alice))) >= ganadoAlice, "lo ya ganado por alice no se toca");
  antes = await saldo(alice);
  await (await r.connect(alice).claim(GAS)).wait();
  ok((await saldo(alice)) - antes >= N(ganadoAlice) - 0.001, "alice cobra lo ganado aunque el fondo este vacio");
  ok((await r.poolView()).paused === true, "con el fondo vacio el devengo se para");
  await avanzar(30 * DIA);
  ok(N(await r.earned(await dir(alice))) === 0, "y no promete lo que no hay");
  antes = await saldo(alice);
  await (await r.connect(alice).withdraw(E("6000"), GAS)).wait();
  cerca((await saldo(alice)) - antes, 6000, 0, "retirar funciona aunque el fondo este vacio");

  // --- 6. recarga sin devengo retroactivo ---------------------------
  console.log("\n=== 6. recarga ===");
  await (await r.connect(alice).deposit(E("10000"), GAS)).wait();
  await avanzar(20 * DIA);
  await (await r.connect(dueno).fundRewards(E("100000"), GAS)).wait();
  ok((await r.poolView()).paused === false, "al recargar se reanuda");
  ok(N(await r.earned(await dir(alice))) < 0.01, "el hueco sin fondo no se paga despues");
  await avanzar(30 * DIA);
  cerca(N(await r.earned(await dir(alice))), 10000 * 0.149 * 30 / 365, 0.01, "y desde la recarga vuelve a pagar 14,9%");

  // --- 7. tope ------------------------------------------------------
  console.log("\n=== 7. tope de 10M ===");
  const libre = await r.remainingCapacity();
  await (await r.connect(dueno).deposit(libre - E("500"), GAS)).wait();
  cerca(N(await r.remainingCapacity()), 500, 0, "quedan 500 de cupo");
  await revierte(() => r.connect(bob).deposit.staticCall(E("501"), GAS), "no se puede pasar del tope", "program full");
  await (await r.connect(bob).deposit(E("500"), GAS)).wait();
  ok((await r.totalDeposited()) === E("10000000"), "el programa se llena exactamente en 10M");
  await (await r.connect(bob).withdraw(E("500"), GAS)).wait();
  ok((await r.remainingCapacity()) === E("500"), "al retirar se libera cupo");

  // --- 8. cerrar entradas no encierra a nadie -----------------------
  console.log("\n=== 8. cerrar depositos ===");
  await (await r.connect(dueno).setDepositsPaused(true, GAS)).wait();
  await revierte(() => r.connect(bob).deposit.staticCall(E("1"), GAS), "con depositos cerrados no entra nadie", "deposits paused");
  antes = await saldo(alice);
  await (await r.connect(alice).withdraw(E("10000"), GAS)).wait();
  cerca((await saldo(alice)) - antes, 10000, 0, "pero se puede salir");
  await (await r.connect(alice).claim(GAS)).wait();
  ok(true, "y cobrar");

  // --- 9. cuentas cuadran -------------------------------------------
  console.log("\n=== 9. cuadre ===");
  const bal = N(await tok.balanceOf(ra));
  const dep = N(await r.totalDeposited());
  const fondo = N(await r.rewardPool());
  const pendDueno = N(await r.earned(yo));
  ok(bal + 1e-9 >= dep + fondo + pendDueno, `el contrato cubre depositos + fondo + lo ganado (${bal.toFixed(4)} >= ${(dep + fondo + pendDueno).toFixed(4)})`);

  // --- 10. cambio de tasa (contrato nuevo, sin arrastrar lo anterior) --
  console.log("\n=== 10. cambio de tasa ===");
  const r2 = await R.deploy(await tok.getAddress(), { gasLimit: 4000000 });
  await r2.waitForDeployment();
  const r2a = await r2.getAddress();
  await (await tok.connect(dueno).approve(r2a, E("1000000"), GAS)).wait();
  await (await r2.connect(dueno).fundRewards(E("1000000"), GAS)).wait();
  await (await r2.connect(dueno).setDepositsPaused(false, GAS)).wait();
  await (await tok.connect(alice).approve(r2a, E("100000000"), GAS)).wait();
  ok((await r2.rateBps()) === 1490n, "arranca en 14,9%");
  ok((await r2.MAX_RATE_BPS()) === 10000n, "techo del 100%");
  await revierte(() => r2.connect(alice).setRate.staticCall(2500, GAS), "solo el dueño cambia la tasa");
  await revierte(() => r2.connect(dueno).setRate.staticCall(10001, GAS), "no puede pasar del techo", "rate above max");

  await (await r2.connect(alice).deposit(E("10000"), GAS)).wait();
  await avanzar(100 * DIA);
  const a14 = 10000 * 0.149 * 100 / 365;
  cerca(N(await r2.earned(await dir(alice))), a14, 0.05, "100 dias a 14,9% sobre 10.000");
  const rc = await (await r2.connect(dueno).setRate(2500, GAS)).wait();
  const evt = rc.logs.map((l) => { try { return r2.interface.parseLog(l); } catch (e) { return null; } }).find((x) => x && x.name === "RateChanged");
  ok(!!evt && evt.args[0] === 1490n && evt.args[1] === 2500n, "emite RateChanged(1490, 2500)");
  ok((await r2.poolView()).rate === 2500n, "poolView ya da 25%");
  cerca(N(await r2.earned(await dir(alice))), a14, 0.05, "lo ganado antes del cambio no se recalcula");
  await avanzar(100 * DIA);
  const a25 = a14 + 10000 * 0.25 * 100 / 365;
  cerca(N(await r2.earned(await dir(alice))), a25, 0.05, "desde el cambio paga al 25%");

  await (await r2.connect(dueno).setRate(0, GAS)).wait();
  await avanzar(30 * DIA);
  cerca(N(await r2.earned(await dir(alice))), a25, 0.05, "a 0% se para el devengo sin quitar lo ganado");
  await (await r2.connect(dueno).setRate(1490, GAS)).wait();
  await avanzar(30 * DIA);
  cerca(N(await r2.earned(await dir(alice))), a25 + 10000 * 0.149 * 30 / 365, 0.05, "vuelve a 14,9% y retoma desde ahi");

  antes = await saldo(alice);
  const deber = N(await r2.earned(await dir(alice)));
  await (await r2.connect(alice).claim(GAS)).wait();
  await (await r2.connect(alice).withdraw(E("10000"), GAS)).wait();
  cerca((await saldo(alice)) - antes, deber + 10000, 0.05, "cobra todo y recupera su deposito");
  await (await r2.connect(dueno).setRate(10000, GAS)).wait();
  ok((await r2.rateBps()) === 10000n, "el techo exacto se acepta");
  const bal2 = N(await tok.balanceOf(r2a));
  ok(bal2 + 1e-9 >= N(await r2.totalDeposited()) + N(await r2.rewardPool()), "el contrato nuevo tambien cuadra");

  console.log(`\n================  ${pasan} pasan, ${fallan} fallan  ================`);
  process.exit(fallan ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
