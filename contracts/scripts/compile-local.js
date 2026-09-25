// Compila con el solc que ya viene en node_modules, sin descargar nada.
// Hardhat quiere bajarse el binario de binaries.soliditylang.org y ese host
// esta bloqueado en este entorno; el paquete solc trae el mismo 0.8.24.
const fs = require("fs");
const path = require("path");
const solc = require("solc");

const RAIZ = path.resolve(__dirname, "..");
const objetivo = process.argv[2] || "contracts/SectoraStakingSeason.sol";

function leer(ruta) {
  // import "@openzeppelin/..." -> node_modules/@openzeppelin/...
  const candidatos = [
    path.resolve(RAIZ, ruta),
    path.resolve(RAIZ, "node_modules", ruta),
  ];
  for (const c of candidatos) {
    if (fs.existsSync(c)) return fs.readFileSync(c, "utf8");
  }
  throw new Error("no encuentro " + ruta);
}

const entrada = {
  language: "Solidity",
  sources: { [objetivo]: { content: leer(objetivo) } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] } },
  },
};

const salida = JSON.parse(
  solc.compile(JSON.stringify(entrada), {
    import: (ruta) => {
      try {
        return { contents: leer(ruta) };
      } catch (e) {
        return { error: e.message };
      }
    },
  })
);

let errores = 0;
for (const e of salida.errors || []) {
  if (e.severity === "error") errores++;
  console.log(`[${e.severity}] ${e.formattedMessage.trim()}`);
}

if (errores) {
  console.log(`\n${errores} ERROR(ES) — no compila`);
  process.exit(1);
}

const dir = path.resolve(RAIZ, "artifacts-local");
fs.mkdirSync(dir, { recursive: true });
for (const [fichero, contratos] of Object.entries(salida.contracts || {})) {
  for (const [nombre, c] of Object.entries(contratos)) {
    const bytes = c.evm.deployedBytecode.object.length / 2;
    console.log(`  ${nombre.padEnd(26)} deployed ${bytes} bytes  (limite EIP-170: 24576)`);
    if (bytes > 24576) console.log("    !! EXCEDE EL LIMITE DE TAMANO");
    fs.writeFileSync(path.join(dir, nombre + ".abi.json"), JSON.stringify(c.abi, null, 2));
    fs.writeFileSync(path.join(dir, nombre + ".bin"), c.evm.bytecode.object);
  }
}
console.log("\nCOMPILA SIN ERRORES");
