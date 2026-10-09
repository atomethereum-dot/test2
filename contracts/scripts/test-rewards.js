/* Pruebas de SectoraHolderRewards contra un nodo local.
 *
 *   npx hardhat node          (en otra terminal)
 *   node scripts/compile.js
 *   node scripts/test-rewards.js
 *
 * El programa: 14,9% APY al arrancar (el dueño puede cambiarla con
 * setRate), sin bloqueo, cobro cuando quieran, sin tope de depositos, fondo
 * pagado por la tesorería y sin bloqueo para el dueño (puede retirar lo que
 * nadie ha ganado todavía).
 *
 * Lo que se prueba es lo que puede costar dinero: que el ritmo sea el
 * anunciado, que retirar funcione siempre y no haga perder lo ganado, que
 * el dueño no pueda tocar depósitos ni recompensas ya ganadas, que no haya
 * tope de depositos y que un fondo vacío pare el devengo en vez de prometer.
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

  // --- 7. sin tope ---------------------------------------------------
  console.log("\n=== 7. sin tope de depositos ===");
  await (await r.connect(dueno).deposit(E("15000000"), GAS)).wait();
  ok((await r.totalDeposited()) > E("10000000"), "entran 15M de una vez: ya no hay tope de 10M");
  await (await r.connect(bob).deposit(E("500"), GAS)).wait();
  ok((await r.totalDeposited()) === E("15010500"), "y se puede seguir depositando encima");
  await (await r.connect(bob).withdraw(E("500"), GAS)).wait();
  ok((await r.poolView()).depositors === 2n, "cuenta bien a los depositantes (alice y el dueño)");

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
  ok((await r2.MAX_RATE_BPS()) === 10n ** 12n, "techo solo tecnico: 1e12 bps");
  await revierte(() => r2.connect(alice).setRate.staticCall(2500, GAS), "solo el dueño cambia la tasa");
  await revierte(() => r2.connect(dueno).setRate.staticCall(10n ** 12n + 1n, GAS), "no puede pasar del techo tecnico", "rate above max");

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

  // 10% al mes = 120% al año = 12000 bps
  await (await r2.connect(alice).deposit(E("10000"), GAS)).wait();
  await (await r2.connect(dueno).setRate(12000, GAS)).wait();
  const antesMes = N(await r2.earned(await dir(alice)));
  await avanzar(ANO / 12);
  cerca(N(await r2.earned(await dir(alice))) - antesMes, 1000, 0.05, "al 10% mensual, un mes sobre 10.000 -> 1.000");

  // el techo tecnico: el fondo se vacia de golpe pero nada se bloquea
  await (await r2.connect(dueno).setRate(10n ** 12n, GAS)).wait();
  ok((await r2.rateBps()) === 10n ** 12n, "el techo exacto se acepta");
  await avanzar(10 * ANO);
  antes = await saldo(alice);
  const todo = N(await r2.earned(await dir(alice)));
  await (await r2.connect(alice).claim(GAS)).wait();
  ok((await r2.poolView()).paused === true && (await r2.rewardPool()) === 0n, "a esa tasa el fondo se agota y el devengo se para");
  await (await r2.connect(alice).withdraw(E("10000"), GAS)).wait();
  cerca((await saldo(alice)) - antes, todo + 10000, 0.05, "aun asi cobra y retira sin bloqueo (10 años sin tocarlo)");
  ok(todo <= 1000000, "nunca paga mas de lo que habia en el fondo");
  const bal2 = N(await tok.balanceOf(r2a));
  ok(bal2 + 1e-9 >= N(await r2.totalDeposited()) + N(await r2.rewardPool()), "el contrato nuevo tambien cuadra");

  // --- 11. blindaje: propiedad, destinatarios, rescates, vistas --------
  console.log("\n=== 11. blindaje ===");
  const r3 = await R.deploy(await tok.getAddress(), { gasLimit: 4000000 });
  await r3.waitForDeployment();
  const r3a = await r3.getAddress();
  const bobA = await dir(bob);
  const aliceA = await dir(alice);
  const tokA = await tok.getAddress();
  await revierte(() => r3.connect(dueno).renounceOwnership.staticCall(GAS), "renounceOwnership esta desactivado", "renounce disabled");
  await (await r3.connect(dueno).transferOwnership(bobA, GAS)).wait();
  ok((await r3.owner()) === yo && (await r3.pendingOwner()) === bobA, "transferir no cambia el dueño hasta que el nuevo acepta");
  await revierte(() => r3.connect(alice).acceptOwnership.staticCall(GAS), "nadie mas puede aceptar la propiedad");
  await (await r3.connect(bob).acceptOwnership(GAS)).wait();
  ok((await r3.owner()) === bobA, "al aceptar, el nuevo dueño manda");
  await revierte(() => r3.connect(dueno).setRate.staticCall(1, GAS), "el dueño anterior ya no puede tocar nada");
  await (await r3.connect(bob).transferOwnership(yo, GAS)).wait();
  await (await r3.connect(dueno).acceptOwnership(GAS)).wait();
  ok((await r3.owner()) === yo, "y se puede devolver con el mismo proceso");

  await (await tok.connect(dueno).approve(r3a, E("100000"), GAS)).wait();
  await (await r3.connect(dueno).fundRewards(E("100000"), GAS)).wait();
  await (await r3.connect(dueno).setDepositsPaused(false, GAS)).wait();
  await revierte(() => r3.connect(dueno).withdrawRewards.staticCall(r3a, E("1"), GAS), "el fondo no se puede 'retirar' al propio contrato", "bad recipient");
  await revierte(() => r3.connect(dueno).withdrawAllRewards.staticCall(r3a, GAS), "tampoco con withdrawAllRewards", "bad recipient");

  await (await tok.connect(alice).approve(r3a, E("100000000"), GAS)).wait();
  await (await r3.connect(alice).deposit(E("10000"), GAS)).wait();
  await avanzar(30 * DIA);
  const runway = Number(await r3.runwaySeconds()) / DIA;
  cerca(runway, (100000 - 10000 * 0.149 * 30 / 365) / (10000 * 0.149) * 365, 0.01, "runwaySeconds cuenta desde ahora (dias)");
  cerca(N((await r3.poolView()).pool), 100000 - 10000 * 0.149 * 30 / 365, 0.01, "poolView da el fondo de este segundo");
  await revierte(() => r3.connect(dueno).recoverSurplus.staticCall(yo, GAS), "sin envios por error no hay nada que recuperar", "no surplus");
  await revierte(() => r3.connect(alice).recoverSurplus.staticCall(aliceA, GAS), "solo el dueño recupera");
  await (await tok.connect(bob).transfer(r3a, E("500"), GAS)).wait();   // alguien envia SECT por error
  antes = await saldo(dueno);
  await (await r3.connect(dueno).recoverSurplus(yo, GAS)).wait();
  cerca((await saldo(dueno)) - antes, 500, 0, "recupera exactamente los 500 enviados por error");
  await revierte(() => r3.connect(dueno).recoverSurplus.staticCall(yo, GAS), "y ni un wei mas", "no surplus");
  antes = await saldo(alice);
  const ganadoR3 = N(await r3.earned(await dir(alice)));
  await (await r3.connect(alice).claim(GAS)).wait();
  await (await r3.connect(alice).withdraw(E("10000"), GAS)).wait();
  cerca((await saldo(alice)) - antes, ganadoR3 + 10000, 0.001, "alice cobra y retira todo despues del rescate");
  const pendA = await r3.earned(aliceA);
  const polvo = (await r3.totalUnclaimed()) - pendA;
  ok(polvo >= 0n && polvo < 10n ** 9n, `totalUnclaimed = lo que alice aun no cobro (${pendA} wei) + polvo de redondeo (${polvo} wei)`);

  const otro = await new ethers.ContractFactory(tokArt.abi, tokArt.bytecode, dueno).deploy(E("1000"), { gasLimit: 4000000 });
  await otro.waitForDeployment();
  await (await otro.connect(dueno).transfer(r3a, E("100"), GAS)).wait();
  const otroA = await otro.getAddress();
  await revierte(() => r3.connect(dueno).rescueToken.staticCall(tokA, yo, E("1"), GAS), "rescueToken nunca toca #SECT", "not for the staking token");
  await revierte(() => r3.connect(alice).rescueToken.staticCall(otroA, aliceA, E("100"), GAS), "solo el dueño rescata");
  await (await r3.connect(dueno).rescueToken(otroA, yo, E("100"), GAS)).wait();
  ok((await otro.balanceOf(r3a)) === 0n, "rescata otro token enviado por error");
  const bal3 = await tok.balanceOf(r3a);
  ok(bal3 >= (await r3.totalDeposited()) + (await r3.rewardPool()) + (await r3.totalUnclaimed()), "cuadra: saldo >= depositos + fondo + pendiente");

  // --- 12. bloqueos (plazo fijo) ---------------------------------------
  console.log("\n=== 12. bloqueos ===");
  const r4 = await R.deploy(tokA, { gasLimit: 6000000 });
  await r4.waitForDeployment();
  const r4a = await r4.getAddress();
  const ops = await r4.allLockOptions();
  ok(ops.length === 3, "nacen 3 opciones de bloqueo");
  ok(ops[0].duration === BigInt(15 * DIA) && ops[1].duration === BigInt(30 * DIA) && ops[2].duration === BigInt(60 * DIA), "de 15, 30 y 60 dias");
  ok(ops.every((o) => !o.enabled && o.rateBps === 0n), "desactivadas y sin tasa");
  await (await tok.connect(dueno).approve(r4a, E("10000000"), GAS)).wait();
  await (await r4.connect(dueno).fundRewards(E("1000000"), GAS)).wait();
  await (await r4.connect(dueno).setDepositsPaused(false, GAS)).wait();
  await (await tok.connect(alice).approve(r4a, E("100000000"), GAS)).wait();
  await revierte(() => r4.connect(alice).lock.staticCall(1, E("10000"), GAS), "con la opcion desactivada no se puede bloquear", "lock option disabled");
  await revierte(() => r4.connect(alice).setLockOption.staticCall(1, 30 * DIA, 2500, true, GAS), "solo el dueño configura los bloqueos");
  await revierte(() => r4.connect(dueno).setLockOption.staticCall(1, 0, 2500, true, GAS), "un plazo de 0 no vale", "bad lock duration");
  await revierte(() => r4.connect(dueno).setLockOption.staticCall(1, 30 * DIA, 10n ** 12n + 1n, true, GAS), "ni una tasa por encima del techo tecnico", "rate above max");
  await revierte(() => r4.connect(dueno).setLockOption.staticCall(9, 30 * DIA, 2500, true, GAS), "ni una opcion que no existe", "no such lock option");

  await (await r4.connect(dueno).setLockOption(1, 30 * DIA, 2500, true, GAS)).wait();   // 1 mes al 25%
  const pool0 = await r4.rewardPool();
  await (await r4.connect(alice).lock(1, E("10000"), GAS)).wait();
  const L1 = (await r4.locksOf(aliceA))[0];
  const premio = 10000 * 0.25 * 30 / 365;
  cerca(N(L1.reward), premio, 0.0001, "el premio del mes se calcula al 25% (205,48)");
  ok(pool0 - (await r4.rewardPool()) === L1.reward, "y se aparta del fondo al bloquear");
  ok((await r4.totalLocked()) === E("10000") && (await r4.totalLockReserved()) === L1.reward, "principal y premio quedan contabilizados aparte");
  ok((await r4.totalDeposited()) === 0n, "el bloqueo no cuenta como deposito flexible");
  await revierte(() => r4.connect(alice).withdrawLock.staticCall(0, GAS), "no se saca antes del plazo", "still locked");
  await revierte(() => r4.connect(alice).exitLockEarly.staticCall(0, GAS), "salir antes esta desactivado", "early exit disabled");

  await avanzar(15 * DIA);
  cerca(N(await r4.lockEarned(aliceA, 0)), premio / 2, 0.01, "a mitad de plazo lleva la mitad del premio");
  await (await r4.connect(dueno).setLockOption(1, 30 * DIA, 100, true, GAS)).wait();   // el dueño la baja al 1%
  await (await r4.connect(dueno).withdrawAllRewards(yo, GAS)).wait();                  // y vacia el fondo
  ok((await r4.totalLockReserved()) === L1.reward, "vaciar el fondo no toca el premio reservado");
  antes = await saldo(alice);
  await (await r4.connect(alice).claimLock(0, GAS)).wait();
  cerca((await saldo(alice)) - antes, premio / 2, 0.01, "cobra lo ganado sin esperar al final");
  await avanzar(20 * DIA);
  cerca(N(await r4.lockEarned(aliceA, 0)), premio / 2, 0.01, "al acabar el plazo deja de sumar; la otra mitad sigue al 25% aunque se bajo la tasa");
  antes = await saldo(alice);
  await (await r4.connect(alice).withdrawLock(0, GAS)).wait();
  cerca((await saldo(alice)) - antes, 10000 + premio / 2, 0.01, "al terminar recupera el principal y el resto del premio");
  ok((await r4.totalLocked()) === 0n && (await r4.totalLockReserved()) === 0n, "con todo pagado, bloqueos y reservas a cero");
  await revierte(() => r4.connect(alice).withdrawLock.staticCall(0, GAS), "no se retira dos veces", "lock already closed");
  await revierte(() => r4.connect(alice).lock.staticCall(1, E("10000"), GAS), "con el fondo vacio no se acepta un bloqueo con premio", "pool too small");

  await (await r4.connect(dueno).fundRewards(E("1000"), GAS)).wait();
  await (await r4.connect(dueno).setLockOption(2, 60 * DIA, 5000, true, GAS)).wait();   // 2 meses al 50%
  await (await r4.connect(alice).lock(2, E("1000"), GAS)).wait();
  const L2 = (await r4.locksOf(aliceA))[1];
  cerca(N(L2.reward), 1000 * 0.5 * 60 / 365, 0.0001, "2 meses al 50% sobre 1.000 -> 82,19");
  await avanzar(10 * DIA);
  await revierte(() => r4.connect(alice).setEarlyExit.staticCall(true, GAS), "solo el dueño activa la salida anticipada");
  await (await r4.connect(dueno).setEarlyExit(true, GAS)).wait();
  const poolAntes = await r4.rewardPool();
  antes = await saldo(alice);
  await (await r4.connect(alice).exitLockEarly(1, GAS)).wait();
  cerca((await saldo(alice)) - antes, 1000, 0, "salida anticipada: recupera el principal entero");
  ok((await r4.rewardPool()) - poolAntes === L2.reward, "y el premio no cobrado vuelve al fondo");
  await revierte(() => r4.connect(alice).claimLock.staticCall(1, GAS), "un bloqueo cerrado ya no cobra", "nothing to claim");

  // flexible y bloqueos juntos
  await (await r4.connect(dueno).fundRewards(E("100000"), GAS)).wait();
  const op3 = await r4.connect(dueno).addLockOption.staticCall(180 * DIA, 4000, true, GAS);
  await (await r4.connect(dueno).addLockOption(180 * DIA, 4000, true, GAS)).wait();
  ok(op3 === 3n && (await r4.allLockOptions()).length === 4, "se puede añadir un plazo nuevo (6 meses)");
  await (await r4.connect(alice).deposit(E("5000"), GAS)).wait();
  await (await r4.connect(alice).lock(3, E("2000"), GAS)).wait();
  await (await r4.connect(alice).lock(1, E("3000"), GAS)).wait();
  await avanzar(40 * DIA);
  const e3 = await r4.lockEarned(aliceA, 2), e4 = await r4.lockEarned(aliceA, 3);
  antes = await saldo(alice);
  await (await r4.connect(alice).claimAllLocks(GAS)).wait();
  cerca((await saldo(alice)) - antes, N(e3 + e4), 0.01, "claimAllLocks cobra todos los bloqueos de una vez");
  await (await tok.connect(bob).transfer(r4a, E("100"), GAS)).wait();   // envio por error
  antes = await saldo(dueno);
  await (await r4.connect(dueno).recoverSurplus(yo, GAS)).wait();
  cerca((await saldo(dueno)) - antes, 100, 0, "recoverSurplus devuelve solo los 100 enviados por error, con bloqueos abiertos");
  await (await r4.connect(dueno).setDepositsPaused(true, GAS)).wait();
  await revierte(() => r4.connect(alice).lock.staticCall(1, E("1"), GAS), "con depositos cerrados tampoco se bloquea", "deposits paused");
  const bal4 = await tok.balanceOf(r4a);
  const deuda4 = (await r4.totalDeposited()) + (await r4.rewardPool()) + (await r4.totalUnclaimed()) + (await r4.totalLocked()) + (await r4.totalLockReserved());
  ok(bal4 >= deuda4, `cuadra: saldo >= depositos + fondo + pendiente + bloqueado + reservado (sobra ${bal4 - deuda4} wei)`);
  await avanzar(200 * DIA);
  antes = await saldo(alice);
  await (await r4.connect(alice).withdrawLock(2, GAS)).wait();
  await (await r4.connect(alice).withdrawLock(3, GAS)).wait();
  await (await r4.connect(alice).claim(GAS)).wait();
  await (await r4.connect(alice).withdraw(E("5000"), GAS)).wait();
  ok((await saldo(alice)) - antes > 10000, "al final todo sale: bloqueos, flexible y recompensas");
  ok((await r4.totalLocked()) === 0n && (await r4.totalLockReserved()) === 0n && (await r4.totalDeposited()) === 0n, "contrato sin deudas con alice");

  console.log(`\n================  ${pasan} pasan, ${fallan} fallan  ================`);
  process.exit(fallan ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
