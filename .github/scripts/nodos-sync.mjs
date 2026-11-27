// Nodos activados: recoge los avisos que el Dashboard envia a ntfy.sh al pulsar "Activar mi nodo"
// y los guarda en nodos/activaciones.json. Vale la primera activacion de cada wallet, con la hora que
// pone el servidor de ntfy (nadie puede adelantarla). ntfy guarda los avisos 12 horas: esto corre
// cada 5-10 minutos, asi que no se pierde ninguno. Sin dependencias.
//
// Filtro anti-bots: el tema de ntfy es publico, asi que cualquiera puede mandar direcciones inventadas
// (el 26-27 nov 2026 un bot metio 3.000 wallets que nunca habian hecho nada). Una wallet nueva solo entra
// en el registro publico si tiene actividad real en Ethereum: al menos una transaccion o saldo de SECT.
// Si aun no la tiene, espera en nodos/pendientes.json (no se muestra en ningun sitio) y se vuelve a mirar
// cada 6 horas durante 30 dias: en cuanto la wallet hace algo (por ejemplo, el staking), entra con la hora
// de su primera activacion. Si la red no responde, nadie entra ni se pierde: se reintenta en la siguiente vuelta.
// Las wallets que ya estaban en el registro no se tocan.
//   node nodos-sync.mjs [topic] [archivo] [pendientes]
//   NTFY_FILE=avisos.jsonl node nodos-sync.mjs ...   (pruebas: lee los avisos de un archivo)
import fs from "node:fs";

const TOPIC = process.argv[2] || "sectora-hn-1ux29d4rgvyv5l";
const FILE = process.argv[3] || "nodos/activaciones.json";
const PEND = process.argv[4] || (/activaciones\.json$/.test(FILE) ? FILE.replace(/activaciones\.json$/, "pendientes.json") : FILE + ".pendientes.json");
const SECT = "0x8c9984b06281f1ca9416e493c2e602aab08513db";
const RPCS = ["https://ethereum-rpc.publicnode.com", "https://eth.llamarpc.com", "https://rpc.ankr.com/eth", "https://cloudflare-eth.com"];
const H = 3600e3, RECHEQUEO = 6 * H, CADUCA = 30 * 24 * H, MAX_PEND = 6000, MAX_CHEQUEO = 1500;

const texto = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);
const r1 = x => Math.round(x * 10) / 10;
const lee = (f, vacio) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : vacio);

const db = lee(FILE, { nodos: {} }); db.nodos = db.nodos || {};
const pd = lee(PEND, { pendientes: {} }); pd.pendientes = pd.pendientes || {};
const ahora = Date.now();

// ---------- avisos de ntfy ----------
let txt;
if (process.env.NTFY_FILE) txt = fs.readFileSync(process.env.NTFY_FILE, "utf8");
else {
  const res = await fetch(`https://ntfy.sh/${TOPIC}/json?poll=1&since=all`);
  if (!res.ok) throw new Error("ntfy " + res.status);
  txt = await res.text();
}
const lineas = txt.split("\n").filter(Boolean);
let nuevos = 0, malos = 0, enEspera = 0;
for (const l of lineas) {
  let ev; try { ev = JSON.parse(l); } catch (e) { continue; }
  if (ev.event !== "message" || !ev.message || !ev.time) continue;
  let m; try { m = JSON.parse(ev.message); } catch (e) { malos++; continue; }
  const w = String(m.w || "").toLowerCase();
  const la = Number(m.la), lo = Number(m.lo);
  if (!/^0x[0-9a-f]{40}$/.test(w) || /^0x0{40}$/.test(w) || !isFinite(la) || !isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) { malos++; continue; }
  const t = ev.time * 1000;
  const dato = { t, n: texto(m.n, 48) || "Sectora Node", c: texto(m.c, 40), la: r1(la), lo: r1(lo) };
  const prev = db.nodos[w];
  if (prev) { if (t < prev.t) db.nodos[w] = dato; continue; }      // ya en el registro: vale la primera
  const p = pd.pendientes[w];
  if (!p) { pd.pendientes[w] = dato; enEspera++; }
  else if (t < p.t) pd.pendientes[w] = Object.assign(dato, p.chk ? { chk: p.chk } : {});
}

// ---------- actividad real en Ethereum: transacciones o saldo de SECT ----------
async function rpc(batch) {
  for (const url of RPCS) {
    try {
      const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(batch), signal: AbortSignal.timeout(30000) });
      if (!r.ok) continue;
      const j = await r.json();
      if (!Array.isArray(j) || j.length !== batch.length || j.some(x => x.error || x.result == null)) continue;
      const out = {}; for (const x of j) out[x.id] = x.result; return out;
    } catch (e) { /* siguiente nodo */ }
  }
  return null;
}
const big = h => BigInt(h && h !== "0x" ? h : "0x0");
async function activas(ws) {
  const si = new Set(), mirada = new Set();
  for (let i = 0; i < ws.length; i += 40) {
    const lote = ws.slice(i, i + 40), b = [];
    lote.forEach((w, k) => {
      b.push({ jsonrpc: "2.0", id: 2 * k, method: "eth_getTransactionCount", params: [w, "latest"] });
      b.push({ jsonrpc: "2.0", id: 2 * k + 1, method: "eth_call", params: [{ to: SECT, data: "0x70a08231" + w.slice(2).padStart(64, "0") }, "latest"] });
    });
    const r = await rpc(b);
    if (!r) continue;                                 // sin red: se queda en espera, sin decidir
    lote.forEach((w, k) => {
      mirada.add(w);
      if (big(r[2 * k]) > 0n || big(r[2 * k + 1]) > 0n) si.add(w);
    });
  }
  return { si, mirada };
}

for (const [w, p] of Object.entries(pd.pendientes)) if (ahora - p.t > CADUCA) delete pd.pendientes[w];
const toca = Object.entries(pd.pendientes)
  .filter(([, p]) => !p.chk || ahora - p.chk >= RECHEQUEO)
  .sort((a, b) => (a[1].chk || 0) - (b[1].chk || 0) || b[1].t - a[1].t)
  .slice(0, MAX_CHEQUEO).map(([w]) => w);
const { si, mirada } = await activas(toca);
for (const w of toca) {
  if (si.has(w)) { const p = pd.pendientes[w]; db.nodos[w] = { t: p.t, n: p.n, c: p.c, la: p.la, lo: p.lo }; delete pd.pendientes[w]; nuevos++; }
  else if (mirada.has(w)) pd.pendientes[w].chk = ahora;
}
// tope de la lista de espera: se quedan las mas recientes
const pendOrd = Object.entries(pd.pendientes).sort((a, b) => b[1].t - a[1].t).slice(0, MAX_PEND);

// ---------- escribir (orden estable para que el historial de git muestre solo lo nuevo) ----------
function escribe(f, clave, entradas) {
  const orden = {};
  entradas.sort((a, b) => a[1].t - b[1].t || (a[0] < b[0] ? -1 : 1)).forEach(([k, v]) => { orden[k] = v; });
  const salida = JSON.stringify({ [clave]: orden }, null, 2) + "\n";
  const antes = fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
  if (salida !== antes) fs.writeFileSync(f, salida);
  return Object.keys(orden).length;
}
const total = escribe(FILE, "nodos", Object.entries(db.nodos));
const espera = escribe(PEND, "pendientes", pendOrd);
console.log(`avisos ${lineas.length} · nuevos ${nuevos} · en espera nuevos ${enEspera} · revisadas ${mirada.size}/${toca.length} · descartados ${malos} · nodos activados ${total} · en espera ${espera}`);
