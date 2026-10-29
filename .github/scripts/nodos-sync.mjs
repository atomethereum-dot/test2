// Nodos activados: recoge los avisos que el Dashboard envia a ntfy.sh al pulsar "Activar mi nodo"
// y los guarda en nodos/activaciones.json. Vale la primera activacion de cada wallet, con la hora que
// pone el servidor de ntfy (nadie puede adelantarla). ntfy guarda los avisos 12 horas: esto corre
// cada 10 minutos, asi que no se pierde ninguno. Sin dependencias.
//   node nodos-sync.mjs [topic] [archivo]
import fs from "node:fs";

const TOPIC = process.argv[2] || "sectora-hn-1ux29d4rgvyv5l";
const FILE = process.argv[3] || "nodos/activaciones.json";

const texto = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max);
const r1 = x => Math.round(x * 10) / 10;

const db = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : { nodos: {} };
db.nodos = db.nodos || {};

const res = await fetch(`https://ntfy.sh/${TOPIC}/json?poll=1&since=all`);
if (!res.ok) throw new Error("ntfy " + res.status);
const lineas = (await res.text()).split("\n").filter(Boolean);
let nuevos = 0, malos = 0;
for (const l of lineas) {
  let ev; try { ev = JSON.parse(l); } catch (e) { continue; }
  if (ev.event !== "message" || !ev.message || !ev.time) continue;
  let m; try { m = JSON.parse(ev.message); } catch (e) { malos++; continue; }
  const w = String(m.w || "").toLowerCase();
  const la = Number(m.la), lo = Number(m.lo);
  if (!/^0x[0-9a-f]{40}$/.test(w) || /^0x0{40}$/.test(w) || !isFinite(la) || !isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) { malos++; continue; }
  const t = ev.time * 1000, prev = db.nodos[w];
  if (prev && prev.t <= t) continue;             // vale la primera
  db.nodos[w] = { t, n: texto(m.n, 48) || "Sectora Node", c: texto(m.c, 40), la: r1(la), lo: r1(lo) };
  nuevos++;
}
// orden estable para que el historial de git muestre solo lo nuevo
const orden = {};
Object.keys(db.nodos).sort((a, b) => db.nodos[a].t - db.nodos[b].t || (a < b ? -1 : 1)).forEach(k => { orden[k] = db.nodos[k]; });
const salida = JSON.stringify({ nodos: orden }, null, 2) + "\n";
const antes = fs.existsSync(FILE) ? fs.readFileSync(FILE, "utf8") : "";
if (salida !== antes) fs.writeFileSync(FILE, salida);
console.log(`avisos ${lineas.length} · nuevos ${nuevos} · descartados ${malos} · nodos activados ${Object.keys(orden).length}`);
