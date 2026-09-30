/* Pruebas de SectoraStakingSeason contra un nodo local.
 *
 *   npx hardhat node          (en otra terminal)
 *   node scripts/compile.js
 *   node scripts/test-season.js
 *
 * El programa: 7% al mes durante 12 meses, sin bloqueo. La mitad (3,5% al
 * mes) se cobra una vez al mes; la otra mitad (3,5% al mes) se cobra al
 * cerrar la temporada. Si alguien saca su deposito tiene 24 h para volver a
 * ponerlo; si no, pierde todo lo que no haya cobrado todavia.
 *
 * Lo que se prueba es lo que puede costar dinero: que nadie cobre antes de
 * tiempo, que la racha se rompa cuando debe y NO cuando el staker vuelve a
 * tiempo, que no exista el atajo de dejar un wei dentro, que lo ya cobrado
 * no se pierda, y que el dueño no pueda llevarse el fondo durante la
 * temporada ni tocar lo ya devengado despues.
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
// El motivo se lee con staticCall: con gasLimit explicito ethers no sabe
// decodificar el revert de una transaccion real ("could not coalesce error")
async function revierte(fn, msg, motivo) {
  try { await fn(); fallan++; console.log("  FALLA ", msg, "(no revirtio)"); }
  catch (e) {
    const m = (e && (e.reason || e.shortMessage || e.message)) || "";
    if (motivo && !m.includes(motivo)) { fallan++; console.log("  FALLA ", msg, "(motivo: " + m.slice(0, 120) + ")"); return; }
    pasan++; console.log("  ok    ", msg + (motivo ? `  [${motivo}]` : ""));
  }
}
function evento(rec, c, nombre) {
  return rec.logs
    .map((l) => { try { return c.interface.parseLog(l); } catch { return null; } })
    .find((l) => l && l.name === nombre);
}

const E = ethers.parseEther;
const N = (x) => Number(ethers.formatEther(x));

const HORA = 3600;
const DIA = 86400;
const MES = (365 * DIA) / 12;   // 2628000 s, el mismo MONTH del contrato

async function main() {
  const p = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const deployer = await p.getSigner(0);
  const alice = await p.getSigner(2);
  const bob = await p.getSigner(3);
  const carol = await p.getSigner(4);
  const dave = await p.getSigner(5);
  const dir = async (s) => s.getAddress();

  const avanzar = async (s) => { await p.send("evm_increaseTime", [Math.round(s)]); await p.send("evm_mine", []); };
  const saldo = async (s) => N(await tok.balanceOf(await dir(s)));

  // --- despliegue -------------------------------------------------
  const tokArt = load("SectoraToken");
  const segArt = load("SectoraStakingSeason");

  const Tok = new ethers.ContractFactory(tokArt.abi, tokArt.bytecode, deployer);
  const tok = await Tok.deploy(E("50000000"), { gasLimit: 4000000 });
  await tok.waitForDeployment();

  const Seg = new ethers.ContractFactory(segArt.abi, segArt.bytecode, deployer);
  const seg = await Seg.deploy(await tok.getAddress(), { gasLimit: 4000000 });
  const recDeploy = await seg.deploymentTransaction().wait();
  const segAddr = await seg.getAddress();

  console.log("\n=== 0. parametros ===");
  console.log(`         gas del despliegue: ${recDeploy.gasUsed}`);
  const pv0 = await seg.poolView();
  ok(pv0.rate === 8400n, "rate 8400 bps = 84% anual = 7% mensual");
  ok((await seg.MONTHLY_SHARE_BPS()) === 5000n, "mitad al mes (3,5%), mitad al final (3,5%)");
  cerca((Number(pv0.endsAt) - Number(pv0.chainTime)) / MES, 12, 0.001, "la temporada dura 12 meses");
  ok(pv0.depositsPaused === true, "los depositos nacen cerrados hasta cargar el fondo");

  for (const q of [alice, bob, carol, dave]) {
    await (await tok.connect(deployer).transfer(await dir(q), E("10000"), GAS)).wait();
    await (await tok.connect(q).approve(segAddr, E("1000000"), GAS)).wait();
  }
  await revierte(() => seg.connect(alice).stake.staticCall(E("1000"), GAS), "stake() revierte con depositos cerrados", "deposits paused");
  await revierte(() => seg.connect(alice).setStakingPaused.staticCall(false, GAS), "solo el dueño abre los depositos");

  await (await tok.connect(deployer).approve(segAddr, E("10000000"), GAS)).wait();
  await (await seg.connect(deployer).fundRewards(E("1000000"), GAS)).wait();
  await (await seg.connect(deployer).setStakingPaused(false, GAS)).wait();

  for (const q of [alice, bob, carol, dave]) await (await seg.connect(q).stake(E("1000"), GAS)).wait();
  ok((await seg.stakerCount()) === 4n, "4 stakers");

  // --- 1. cobro mensual -------------------------------------------
  console.log("\n=== 1. el 3,5% mensual ===");
  await revierte(() => seg.connect(alice).claimMonthly.staticCall(GAS), "claimMonthly() revierte antes del primer mes", "monthly not ready");
  await avanzar(MES);
  const [m1, d1] = await seg.earnedSplit(await dir(alice));
  cerca(N(m1) + N(d1), 70, 0.1, "1 mes sobre 1000 -> 70 (7%)");
  cerca(N(m1), 35, 0.05, "35 al saldo mensual (3,5%)");
  cerca(N(d1), 35, 0.05, "35 al saldo final (3,5%)");

  let cobradoAlice = 0;
  let antes = await saldo(alice);
  await (await seg.connect(alice).claimMonthly(GAS)).wait();
  const cobro1 = (await saldo(alice)) - antes;
  cobradoAlice += cobro1;
  cerca(cobro1, 35, 0.05, "alice cobra su 3,5% del primer mes");
  await revierte(() => seg.connect(alice).claimMonthly.staticCall(GAS), "no puede cobrar dos veces en el mismo mes", "monthly not ready");
  await revierte(() => seg.connect(alice).claimFinal.staticCall(GAS), "claimFinal() revierte durante la temporada", "not over yet");
  const av = await seg.accountView(await dir(alice));
  cerca(N(av.finalRewards), 35, 0.05, "el otro 3,5% sigue guardado para el final");

  // --- 2. vuelve dentro de 24 h -> conserva -----------------------
  console.log("\n=== 2. vuelve a tiempo -> conserva ===");
  const antesBob = N(await seg.earned(await dir(bob)));
  ok(antesBob > 69, `bob lleva devengado ${antesBob.toFixed(2)}`);
  await (await seg.connect(bob).unstake(E("600"), GAS)).wait();
  ok((await seg.accountView(await dir(bob))).restoreBy > 0n, "al bajar del pico se abre la ventana de 24 h");
  await revierte(() => seg.connect(bob).claimMonthly.staticCall(GAS), "con la ventana abierta no se cobra el mensual", "restore your stake first");
  await avanzar(20 * HORA);
  await (await seg.connect(bob).stake(E("600"), GAS)).wait();
  ok((await seg.accountView(await dir(bob))).restoreBy === 0n, "al reponer el saldo la ventana se cierra");
  ok(N(await seg.earned(await dir(bob))) >= antesBob, "no perdio nada de lo devengado");
  antes = await saldo(bob);
  await (await seg.connect(bob).claimMonthly(GAS)).wait();
  ok((await saldo(bob)) - antes > 35, "y ya puede cobrar su mensual");

  // --- 3. no vuelve -> pierde lo no cobrado, conserva lo cobrado --
  console.log("\n=== 3. no vuelve -> pierde ===");
  antes = await saldo(carol);
  await (await seg.connect(carol).claimMonthly(GAS)).wait();
  const cobradoCarol = (await saldo(carol)) - antes;
  ok(cobradoCarol > 35, `carol cobro su mensual: ${cobradoCarol.toFixed(2)}`);
  const pendCarol = N(await seg.earned(await dir(carol)));
  await (await seg.connect(carol).unstake(E("1000"), GAS)).wait();
  ok((await seg.stakerCount()) === 3n, "al sacar todo deja de contar como staker");
  await avanzar(25 * HORA); // la ventana ya cerro
  ok(N(await seg.earned(await dir(carol))) === 0, "earned() ya devuelve 0 tras cerrarse la ventana");
  const rec = await (await seg.connect(carol).stake(E("1000"), GAS)).wait();
  const roto = evento(rec, seg, "StreakBroken");
  ok(roto !== undefined, "se emite StreakBroken al volver tarde");
  cerca(N(roto.args[1]), pendCarol, 0.05, "pierde exactamente lo no cobrado, y vuelve al fondo");
  cerca(await saldo(carol), 10000 - 1000 + cobradoCarol, 0.0001, "lo que ya cobro sigue en su wallet");

  // --- 4. el atajo del wei ----------------------------------------
  console.log("\n=== 4. el atajo de dejar 1 wei dentro ===");
  const antesD = N(await seg.earned(await dir(dave)));
  ok(antesD > 69, `dave lleva devengado ${antesD.toFixed(2)}`);
  await (await seg.connect(dave).unstake(E("1000") - 1n, GAS)).wait();
  const avd = await seg.accountView(await dir(dave));
  ok(avd.staked === 1n, "sigue con 1 wei dentro, nunca salio");
  ok(avd.restoreBy > 0n, "aun asi se le abrio la ventana, por bajar del pico");
  await avanzar(25 * HORA);
  ok(N(await seg.earned(await dir(dave))) === 0, "el atajo NO funciona: pierde igual");

  // --- 5. el dueño no puede vaciar el fondo durante la temporada --
  console.log("\n=== 5. limites del dueño durante la temporada ===");
  const yo = await dir(deployer);
  await revierte(() => seg.connect(deployer).withdrawRewards.staticCall(yo, E("1"), GAS),
    "withdrawRewards revierte durante la temporada", "not over yet");
  await revierte(() => seg.connect(deployer).withdrawAllRewards.staticCall(yo, GAS),
    "withdrawAllRewards revierte durante la temporada", "not over yet");
  const gap = N(await seg.fundingGap());
  ok(gap === 0, "con 1M en el fondo no falta nada para cubrir la temporada");

  // --- 6. alice cobra cada mes hasta el final ---------------------
  console.log("\n=== 6. los 12 meses ===");
  for (let mes = 2; mes <= 12; mes++) {
    await avanzar(MES);
    antes = await saldo(alice);
    await (await seg.connect(alice).claimMonthly(GAS)).wait();
    cobradoAlice += (await saldo(alice)) - antes;
  }
  console.log(`         alice cobro ${cobradoAlice.toFixed(2)} en mensualidades`);
  cerca(cobradoAlice, 420, 1, "12 mensualidades de 3,5% = 42%");

  const pv = await seg.poolView();
  ok(pv.chainTime >= pv.endsAt, "la temporada ya cerro");
  const e1 = N(await seg.earned(await dir(alice)));
  await avanzar(2 * MES);
  cerca(N(await seg.earned(await dir(alice))), e1, 0.000001, "despues del cierre ya no devenga mas");
  await revierte(() => seg.connect(alice).stake.staticCall(E("1"), GAS), "stake() revierte con la temporada cerrada", "closed");

  // --- 7. cobro final ---------------------------------------------
  console.log("\n=== 7. el 3,5% final ===");
  antes = await saldo(alice);
  await (await seg.connect(alice).claimFinal(GAS)).wait();
  const final = (await saldo(alice)) - antes;
  cerca(final, 420, 1, "al final cobra el otro 42%");
  const total = cobradoAlice + final;
  console.log(`         alice mantuvo 1000 toda la temporada -> ${(total / 10).toFixed(2)}% (esperado 84%)`);
  cerca(total, 840, 0.5, "la temporada completa paga 84% (7% x 12)");
  await revierte(() => seg.connect(alice).claimFinal.staticCall(GAS), "no puede cobrar el final dos veces", "nothing to claim");
  antes = await saldo(alice);
  await (await seg.connect(alice).unstake(E("1000"), GAS)).wait();
  cerca((await saldo(alice)) - antes, 1000, 0, "y recupera su deposito completo");
  ok((await seg.accountView(await dir(alice))).restoreBy === 0n, "salir despues del cierre no abre ventana");

  // --- 8. despues del cierre el dueño recupera solo lo sobrante ---
  console.log("\n=== 8. el sobrante ===");
  const pendienteBob = await seg.earned(await dir(bob));
  await (await seg.connect(deployer).withdrawAllRewards(await dir(deployer), GAS)).wait();
  ok((await seg.earned(await dir(bob))) === pendienteBob, "vaciar el sobrante no toca lo ya devengado de bob");
  antes = await saldo(bob);
  await (await seg.connect(bob).claimFinal(GAS)).wait();
  cerca((await saldo(bob)) - antes, N(pendienteBob), 0.0001, "bob cobra entero despues de que el dueño retiro el sobrante");
  await (await seg.connect(bob).unstake(E("1000"), GAS)).wait();
  await (await seg.connect(carol).claimFinal(GAS)).wait();
  await (await seg.connect(carol).unstake(E("1000"), GAS)).wait();
  await (await seg.connect(dave).unstake(1n, GAS)).wait();
  // lo que perdio dave se liquida al tocar su cuenta y vuelve al fondo,
  // de donde el dueño lo recupera como sobrante
  await (await seg.connect(deployer).withdrawAllRewards(await dir(deployer), GAS)).wait();
  ok((await seg.totalStaked()) === 0n && (await seg.rewardPool()) === 0n, "no queda deposito ni fondo");
  const resto = N(await tok.balanceOf(segAddr));
  ok(resto < 0.001, `el contrato queda vacio salvo polvo de redondeo (${resto.toExponential(2)})`);

  // --- 9. fondo que se acaba --------------------------------------
  console.log("\n=== 9. fondo insuficiente ===");
  const seg2 = await Seg.deploy(await tok.getAddress(), { gasLimit: 4000000 });
  await seg2.waitForDeployment();
  const s2 = await seg2.getAddress();
  await (await tok.connect(deployer).approve(s2, E("1000000"), GAS)).wait();
  await (await tok.connect(alice).approve(s2, E("1000000"), GAS)).wait();
  await (await seg2.connect(deployer).fundRewards(E("35"), GAS)).wait();  // medio mes para 1000
  await (await seg2.connect(deployer).setStakingPaused(false, GAS)).wait();
  await (await seg2.connect(alice).stake(E("1000"), GAS)).wait();
  cerca(N(await seg2.fundingGap()), 840 - 35, 0.1, "fundingGap dice cuanto falta para los 12 meses");
  await avanzar(MES);
  cerca(N(await seg2.earned(await dir(alice))), 35, 0.001, "sin fondo el devengo se para en lo cargado, no promete de mas");
  await (await seg2.connect(deployer).fundRewards(E("1000"), GAS)).wait();
  ok((await seg2.poolView()).paused === false, "al recargar el fondo el devengo se reanuda");
  antes = await saldo(alice);
  await (await seg2.connect(alice).emergencyWithdraw(GAS)).wait();
  cerca((await saldo(alice)) - antes, 1000, 0, "emergencyWithdraw devuelve el deposito siempre");

  // --- gas de cada operacion para la guia -------------------------
  console.log(`\n================  ${pasan} pasan, ${fallan} fallan  ================`);
  process.exit(fallan ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
