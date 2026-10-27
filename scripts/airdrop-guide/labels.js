/* Textos de los botones de la web, tal como los ve cada idioma, para que la guia los nombre igual.
   Se leen de los diccionarios del dashboard, de la pagina del airdrop y de Mi Airdrop.
   Uso: node scripts/airdrop-guide/labels.js  ->  scripts/airdrop-guide/labels.json */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..", "..");
const LANGS = ["en", "es", "zh", "pt", "ru", "fr", "ja", "ko", "ar", "de", "hi"];
const rd = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
function run(files) { const w = { window: {} }; w.window.window = w.window; vm.createContext(w); files.forEach((f) => vm.runInContext(rd(f), w)); return w.window; }

// dashboard
const dw = run(["translations.js", "dashboard-i18n-extra.js"]);
const DASH = {
  connect: "hashdash.top.connect", wselTitle: "hashdash.wsel.title", detected: "hashdash.wallet.detected",
  tnTitle: "hashdash.tn.title", faucetCard: "hashdash.tn.faucet", faucetBtn: "hashdash.tn.faucetBtn", gasLink: "hashdash.tn.gasLink", balance: "hashdash.tn.balance",
  market: "hashdash.market.title", physical: "hashdash.market.tab.physical", airdropPlan: "hashdash.pk.tag.airdrop", buyN: "hashdash.buy.buyN",
  node: "hashdash.node.title", register: "hashdash.node.register", registered: "hashdash.node.registered", change: "hashdash.node.geoEdit",
  geoFail: "hashdash.node.geoFail", lat: "hashdash.node.lat", lon: "hashdash.node.lon", nodeName: "hashdash.node.name",
  openIn: "hashdash.wallet.openIn"
};
const dashHtml = rd("dashboard.html") + rd("dashboard-testnet.js");
function dashEn(key) { const m = dashHtml.match(new RegExp('data-i18n="' + key.replace(/\./g, "\\.") + '"[^>]*>([^<]*)<')); return m ? m[1] : null; }
function dash(l, key) {
  const x = (dw.SECTORA_I18N_EXTRA && dw.SECTORA_I18N_EXTRA[l] && dw.SECTORA_I18N_EXTRA[l][key]) || (dw.SECTORA_I18N && dw.SECTORA_I18N[l] && dw.SECTORA_I18N[l][key]);
  return x || (dw.SECTORA_I18N_EXTRA.en && dw.SECTORA_I18N_EXTRA.en[key]) || (dw.SECTORA_I18N.en && dw.SECTORA_I18N.en[key]) || dashEn(key);
}

// pagina del airdrop: ingles en el HTML, espanol y portugues en linea, el resto en paquetes
const air = rd("airdroptesting/index.html");
const packs = run(LANGS.filter((l) => !["en", "es", "pt"].includes(l)).map((l) => "airdroptesting/i18n/" + l + ".js")).SA_LANG_PACK || {};
function airL(l, key) {
  if (l === "en") { const m = air.match(new RegExp('data-i="' + key.replace(/\./g, "\\.") + '">([^<]*)<')); return m && m[1]; }
  if (l === "es" || l === "pt") {
    const all = [...air.matchAll(new RegExp('"' + key.replace(/\./g, "\\.") + '":"([^"]*)"', "g"))].map((m) => m[1]);
    return l === "es" ? all[0] : all[1];
  }
  return packs[l] && packs[l].t && packs[l].t[key];
}

// Mi Airdrop
const mw = run(["myairdrop/i18n-more.js"]);
const myjs = rd("myairdrop/myairdrop.js");
function myL(l, key) {
  if (mw.MA_I18N && mw.MA_I18N[l] && mw.MA_I18N[l][key]) return mw.MA_I18N[l][key];
  const i = myjs.indexOf("    " + l + ": { loc:"); if (i < 0) return null;
  const m = myjs.slice(i, i + 6000).match(new RegExp("[ ,{]" + key + ': "([^"]*)"')); return m && m[1];
}

const out = {};
for (const l of LANGS) {
  const o = {};
  for (const k in DASH) o[k] = String(dash(l, DASH[k]) || "").replace(/\s*↗\s*$/, "").replace(/&amp;/g, "&");
  o.buy50 = o.buyN.replace("{h}", "50"); o.openMM = o.openIn.replace("{name}", "MetaMask");
  o.takePart = airL(l, "b.join"); o.viewMy = airL(l, "b.my");
  o.myConnect = myL(l, "connect"); o.myCheck = myL(l, "check");
  out[l] = o;
}
fs.writeFileSync(path.join(__dirname, "labels.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.en), "\n", JSON.stringify(out.ja));
const miss = []; for (const l of LANGS) for (const k in out[l]) if (!out[l][k]) miss.push(l + "." + k);
console.log("missing:", miss.join(", ") || "none");
