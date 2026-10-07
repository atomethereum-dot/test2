// Compila los .flattened.sol de testnet (los mismos que se pegan en
// Etherscan para verificar) y deja ABI + bytecode en ../dash/testnet-artifacts.json
// para que la pagina de despliegue los lance desde MetaMask.
const fs = require("fs");
const path = require("path");
const solc = require("solc");

const ROOT = path.join(__dirname, "..");
const NAMES = ["SectoraToken", "SectoraHashMarket", "ValidatorRegistry"];
const sources = {};
for (const n of NAMES) {
  sources[n + ".flattened.sol"] = { content: fs.readFileSync(path.join(ROOT, "flattened", n + ".flattened.sol"), "utf8") };
}
const input = {
  language: "Solidity",
  sources,
  settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
};
const out = JSON.parse(solc.compile(JSON.stringify(input)));
const errs = (out.errors || []).filter((e) => e.severity === "error");
if (errs.length) { errs.forEach((e) => console.error(e.formattedMessage)); process.exit(1); }
const res = { compiler: solc.version(), optimizer: 200, contracts: {} };
for (const n of NAMES) {
  const c = out.contracts[n + ".flattened.sol"][n];
  res.contracts[n] = { abi: c.abi, bytecode: "0x" + c.evm.bytecode.object };
  console.log(n, c.evm.bytecode.object.length / 2, "bytes");
}
fs.writeFileSync(path.join(ROOT, "..", "dash", "testnet-artifacts.json"), JSON.stringify(res));
console.log("-> dash/testnet-artifacts.json", solc.version());
