const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const ARTIFACTS = path.join(__dirname, "..", "artifacts-manual");
function loadArtifact(name) {
  return JSON.parse(fs.readFileSync(path.join(ARTIFACTS, name + ".json"), "utf8"));
}

function assert(cond, msg) {
  if (!cond) throw new Error("ASSERTION FAILED: " + msg);
  console.log("  ok:", msg);
}

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  // Hardhat Network's built-in unlocked dev accounts (test-only) — using the
  // node's own signer avoids needing to hardcode any private key.
  const deployer = await provider.getSigner(0);
  const alice = await provider.getSigner(1);
  const bob = await provider.getSigner(2);

  console.log("Deployer:", deployer.address);
  console.log("Alice:   ", alice.address);
  console.log("Bob:     ", bob.address);

  const tokenArt = loadArtifact("SectoraToken");
  const stakingArt = loadArtifact("SectoraStaking");
  const registryArt = loadArtifact("ValidatorRegistry");

  console.log("\n== Deploying SectoraToken ==");
  const TokenFactory = new ethers.ContractFactory(tokenArt.abi, tokenArt.bytecode, deployer);
  const initialSupply = ethers.parseEther("1000000"); // 1,000,000 tSECT
  const token = await TokenFactory.deploy(initialSupply);
  await token.waitForDeployment();
  console.log("SectoraToken deployed at", await token.getAddress());

  assert((await token.totalSupply()) === initialSupply, "initial supply minted correctly");
  assert((await token.balanceOf(deployer.address)) === initialSupply, "deployer holds initial supply");

  console.log("\n== Deploying SectoraStaking ==");
  const StakingFactory = new ethers.ContractFactory(stakingArt.abi, stakingArt.bytecode, deployer);
  const staking = await StakingFactory.deploy(await token.getAddress());
  await staking.waitForDeployment();
  console.log("SectoraStaking deployed at", await staking.getAddress());

  console.log("\n== Deploying ValidatorRegistry ==");
  const RegistryFactory = new ethers.ContractFactory(registryArt.abi, registryArt.bytecode, deployer);
  const registry = await RegistryFactory.deploy();
  await registry.waitForDeployment();
  console.log("ValidatorRegistry deployed at", await registry.getAddress());

  console.log("\n== Faucet: Alice and Bob claim test tokens ==");
  const tokenAsAlice = token.connect(alice);
  const tokenAsBob = token.connect(bob);
  await (await tokenAsAlice.faucet()).wait();
  await (await tokenAsBob.faucet()).wait();
  const faucetAmount = await token.FAUCET_AMOUNT();
  assert((await token.balanceOf(alice.address)) === faucetAmount, "Alice received faucet amount");
  assert((await token.balanceOf(bob.address)) === faucetAmount, "Bob received faucet amount");

  console.log("\n== Faucet cooldown enforced ==");
  let cooldownEnforced = false;
  try {
    await (await tokenAsAlice.faucet()).wait();
  } catch (e) {
    cooldownEnforced = true;
  }
  assert(cooldownEnforced, "second immediate faucet claim reverts (cooldown)");

  console.log("\n== Fund staking reward reserve ==");
  const rewardReserve = ethers.parseEther("50000");
  await (await token.approve(await staking.getAddress(), rewardReserve)).wait();
  await (await staking.fundRewards(rewardReserve)).wait();
  assert((await token.balanceOf(await staking.getAddress())) === rewardReserve, "staking contract holds reward reserve");

  console.log("\n== Set 10% APY (reference stake = 100,000 tSECT) ==");
  await (await staking.setApyBps(1000, ethers.parseEther("100000"))).wait();
  const rate = await staking.rewardRate();
  assert(rate > 0n, "reward rate is nonzero after setApyBps");

  console.log("\n== Alice stakes 1,000 tSECT ==");
  const stakeAmount = ethers.parseEther("1000");
  await (await tokenAsAlice.approve(await staking.getAddress(), stakeAmount)).wait();
  const stakingAsAlice = staking.connect(alice);
  await (await stakingAsAlice.stake(stakeAmount)).wait();
  assert((await staking.stakedBalance(alice.address)) === stakeAmount, "Alice's staked balance recorded");
  assert((await staking.totalStaked()) === stakeAmount, "totalStaked reflects Alice's stake");

  console.log("\n== Advance time 30 days, check rewards accrued ==");
  await provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
  await provider.send("evm_mine", []);
  const earned = await staking.earned(alice.address);
  console.log("  Alice earned so far:", ethers.formatEther(earned), "tSECT");
  assert(earned > 0n, "Alice has accrued nonzero rewards after 30 days");

  console.log("\n== Alice claims reward ==");
  const balBefore = await token.balanceOf(alice.address);
  await (await stakingAsAlice.claimReward()).wait();
  const balAfter = await token.balanceOf(alice.address);
  assert(balAfter > balBefore, "Alice's token balance increased after claiming reward");

  console.log("\n== Alice unstakes everything ==");
  await (await stakingAsAlice.unstake(stakeAmount)).wait();
  assert((await staking.stakedBalance(alice.address)) === 0n, "Alice's staked balance is zero after full unstake");
  assert((await staking.totalStaked()) === 0n, "totalStaked back to zero");

  console.log("\n== Bob registers as a validator ==");
  const registryAsBob = registry.connect(bob);
  // Buenos Aires: -34.6037, -58.3816 (scaled by 1e6)
  await (await registryAsBob.register("Sectora Node BA-1", -34603700, -58381600)).wait();
  assert((await registry.validatorCount()) === 1n, "validator count is 1 after registration");
  const v = await registry.validators(0);
  assert(v.operator === bob.address, "registered validator operator matches Bob");
  assert(v.name === "Sectora Node BA-1", "registered validator name matches");
  assert(v.active === true, "registered validator is active");

  console.log("\n== Bob updates his validator entry (re-register) ==");
  await (await registryAsBob.register("Sectora Node BA-1 (updated)", -34603700, -58381600)).wait();
  assert((await registry.validatorCount()) === 1n, "validator count still 1 after update (no duplicate)");
  const vUpdated = await registry.validators(0);
  assert(vUpdated.name === "Sectora Node BA-1 (updated)", "validator name updated in place");

  console.log("\n== Bob deactivates his validator ==");
  await (await registryAsBob.deactivate()).wait();
  assert((await registry.activeValidatorCount()) === 0n, "active validator count is 0 after deactivation");
  assert((await registry.validatorCount()) === 1n, "total validator count unchanged after deactivation");

  console.log("\n== getValidators pagination ==");
  const page = await registry.getValidators(0, 10);
  assert(page.length === 1, "getValidators returns the 1 registered validator");

  console.log("\nALL LOCAL TESTS PASSED");
  console.log(
    JSON.stringify(
      {
        token: await token.getAddress(),
        staking: await staking.getAddress(),
        registry: await registry.getAddress(),
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error("TEST FAILED:", e);
  process.exit(1);
});
