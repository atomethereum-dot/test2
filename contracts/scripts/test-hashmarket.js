// Pruebas del marketplace de hash de testnet: faucet de 5.000 tSECT,
// compra con 80% quemado como recompra, 20% a la reserva, APY fijo del 25%
// sobre lo gastado, cobro de recompensas y registro de nodo.
// Corre contra `npx hardhat node` en 127.0.0.1:8545.
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const ART = path.join(__dirname, "..", "artifacts-manual");
const load = (n) => JSON.parse(fs.readFileSync(path.join(ART, n + ".json"), "utf8"));
let n = 0;
function ok(cond, msg) {
  if (!cond) throw new Error("FALLA: " + msg);
  n++;
  console.log("  ok:", msg);
}
async function fails(p, frag, msg) {
  try { await (await p).wait?.(); } catch (e) {
    ok(String(e.message || e).includes(frag), msg); return;
  }
  throw new Error("FALLA (no revirtió): " + msg);
}
const E = ethers.parseEther;
const YEAR = 365n * 24n * 3600n;

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545", undefined, { cacheTimeout: -1 }); // sin cache: ethers reutiliza 250 ms un estimateGas fallido
  const deployer = await provider.getSigner(0);
  const alice = await provider.getSigner(1);
  const bob = await provider.getSigner(2);
  const warp = async (s) => { await provider.send("evm_increaseTime", [Number(s)]); await provider.send("evm_mine", []); };

  const tA = load("SectoraToken"), mA = load("SectoraHashMarket"), rA = load("ValidatorRegistry");
  const token = await (await new ethers.ContractFactory(tA.abi, tA.bytecode, deployer).deploy(E("50000000"))).waitForDeployment();
  const market = await (await new ethers.ContractFactory(mA.abi, mA.bytecode, deployer).deploy(await token.getAddress())).waitForDeployment();
  const registry = await (await new ethers.ContractFactory(rA.abi, rA.bytecode, deployer).deploy(await market.getAddress(), 50)).waitForDeployment();
  const M = await market.getAddress();

  // reserva inicial de recompensas
  await (await token.mint(M, E("5000000"))).wait();
  ok((await market.rewardReserve()) === E("5000000"), "reserva inicial de 5M tSECT");

  // faucet
  const tAl = token.connect(alice), mAl = market.connect(alice);
  await (await tAl.faucet()).wait();
  ok((await token.balanceOf(alice.address)) === E("5000"), "faucet entrega 5.000 tSECT");
  await fails(tAl.faucet(), "cooldown", "faucet bloqueado durante 24 h");

  // compra Standard (2.200 tSECT, 25 TH/s)
  const supplyAntes = await token.totalSupply();
  await (await tAl.approve(M, E("2200"))).wait();
  await (await mAl.purchase(1)).wait();
  ok((await market.hashPower(alice.address)) === 25n, "Alice tiene 25 TH/s");
  ok((await market.principal(alice.address)) === E("2200"), "principal = 2.200 tSECT gastados");
  ok(supplyAntes - (await token.totalSupply()) === E("1760"), "80% (1.760 tSECT) quemado como recompra");
  ok((await market.rewardReserve()) === E("5000440"), "20% (440 tSECT) va a la reserva");
  ok((await market.totalBoughtBack()) === E("1760"), "totalBoughtBack registra 1.760");
  ok((await market.buyerCount()) === 1n, "1 comprador");

  // rendimiento: 25% anual sobre 2.200 = 550 tSECT/año
  ok((await market.rewardsPerDay(alice.address)) === (E("2200") * 2500n * 86400n) / (10000n * YEAR), "rewardsPerDay = 2.200*25%/365");
  await warp(YEAR / 2n);
  const p = await market.pendingRewards(alice.address);
  ok(p >= E("274.99") && p <= E("275.01"), "a los 6 meses ~275 tSECT pendientes (" + ethers.formatEther(p) + ")");

  // cobrar
  const balAntes = await token.balanceOf(alice.address);
  await (await mAl.claim()).wait();
  const cobrado = (await token.balanceOf(alice.address)) - balAntes;
  ok(cobrado >= E("274.99") && cobrado <= E("275.01"), "claim transfiere ~275 tSECT");
  ok((await market.pendingRewards(alice.address)) < E("0.001"), "pendiente vuelve a ~0 tras cobrar");
  ok((await market.totalRewardsClaimed()) === cobrado, "totalRewardsClaimed actualizado");

  // segunda compra acumula sin perder lo devengado
  await warp(YEAR / 4n);
  const antes2 = await market.pendingRewards(alice.address);
  await (await tAl.faucet()).wait();
  await (await tAl.approve(M, E("4300"))).wait();
  await (await mAl.purchase(3)).wait();
  const tras2 = await market.pendingRewards(alice.address);
  ok(tras2 >= antes2, "comprar más no borra lo ya devengado");
  ok((await market.principal(alice.address)) === E("6500"), "principal sube a 6.500");
  ok((await market.buyerCount()) === 1n, "la misma wallet no cuenta dos veces");

  // registro de nodo (minimo 50 TH/s)
  const rAl = registry.connect(alice);
  await (await rAl.register("Nodo MAD-1", 40416800, -3703800)).wait();
  ok((await registry.validatorCount()) === 1n, "Alice registra su nodo con 75 TH/s");
  await (await token.connect(bob).faucet()).wait();
  await (await token.connect(bob).approve(M, E("490"))).wait();
  await (await market.connect(bob).purchase(0)).wait();
  await fails(registry.connect(bob).register("Nodo B", 0, 0), "not enough hash", "Bob con 5 TH/s no puede registrar");

  // sin fondos / paquete inválido / nada que cobrar
  await fails(market.connect(bob).purchase(99), "bad package", "paquete inexistente revierte");
  const vacio = (await provider.getSigner(5));
  await fails(market.connect(vacio).claim(), "nothing to claim", "sin compras no hay nada que cobrar");

  // reserva vacía
  const t2 = await (await new ethers.ContractFactory(tA.abi, tA.bytecode, deployer).deploy(0)).waitForDeployment();
  const m2 = await (await new ethers.ContractFactory(mA.abi, mA.bytecode, deployer).deploy(await t2.getAddress())).waitForDeployment();
  await (await t2.connect(bob).faucet()).wait();
  await (await t2.connect(bob).approve(await m2.getAddress(), E("490"))).wait();
  await (await m2.connect(bob).purchase(0)).wait();
  await warp(YEAR * 3n);
  await fails(m2.connect(bob).claim(), "reserve empty", "si la reserva no alcanza, claim revierte sin perder lo devengado");
  ok((await m2.pendingRewards(bob.address)) > E("98"), "lo devengado sigue pendiente");
  await (await t2.mint(await m2.getAddress(), E("1000"))).wait();
  await (await m2.connect(bob).claim()).wait();
  ok((await m2.pendingRewards(bob.address)) < E("0.001"), "tras recargar la reserva se cobra todo");

  // APY ajustable: lo ganado antes del cambio se respeta, el nuevo cuenta desde ese segundo
  const m3 = await (await new ethers.ContractFactory(mA.abi, mA.bytecode, deployer).deploy(await t2.getAddress())).waitForDeployment();
  const M3 = await m3.getAddress();
  await (await t2.mint(M3, E("1000000"))).wait();
  const carol = await provider.getSigner(6);
  await (await t2.mint(carol.address, E("10000"))).wait();
  await (await t2.connect(carol).approve(M3, E("4300"))).wait();
  await (await m3.connect(carol).purchase(3)).wait();          // 4.300 gastados
  ok((await m3.apyBps()) === 2500n, "APY inicial 25%");
  await warp(YEAR / 2n);
  const antesCambio = await m3.pendingRewards(carol.address); // ~537.5
  ok(antesCambio >= E("537.49") && antesCambio <= E("537.51"), "6 meses al 25% = ~537,5 tSECT");
  await fails(m3.connect(carol).setApy(5000), "revert", "solo el dueño puede cambiar el APY");
  await fails(m3.setApy(10001), "above ceiling", "el APY no puede pasar del 100%");
  await (await m3.setApy(5000)).wait();
  ok((await m3.apyBps()) === 5000n, "APY cambiado a 50%");
  await warp(YEAR / 2n);
  const trasCambio = await m3.pendingRewards(carol.address);   // 537.5 + 1075
  ok(trasCambio >= E("1612.4") && trasCambio <= E("1612.6"), "6 meses al 25% + 6 meses al 50% = ~1.612,5 (" + ethers.formatEther(trasCambio) + ")");
  ok((await m3.rewardsPerDay(carol.address)) === (E("4300") * 5000n * 86400n) / (10000n * YEAR), "rewardsPerDay usa el nuevo APY");
  await (await m3.connect(carol).claim()).wait();
  ok((await m3.pendingRewards(carol.address)) < E("0.01"), "cobro correcto tras el cambio de APY");

  // stats
  const s = await market.getStats();
  ok(s.buyers === 2n && s.hashSold === 80n, "getStats: 2 compradores, 80 TH/s vendidos");
  const acc = await market.getAccount(alice.address);
  ok(acc.hash === 75n && acc.purchases === 2n, "getAccount de Alice correcto");

  console.log(`\n${n} PRUEBAS PASADAS`);
}
main().catch((e) => { console.error(e); process.exit(1); });
