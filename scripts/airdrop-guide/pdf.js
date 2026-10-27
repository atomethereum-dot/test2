/* PDF de la guia del airdrop, uno por idioma, desde airdrop-guide/print/<idioma>.html.
   Necesita la web servida en local (python3 -m http.server 8768 desde la raiz del repo) y, para chino,
   japones, coreano, arabe e hindi, las fuentes Noto de @fontsource en FONTS (npm i @fontsource/noto-sans-sc ...).
   Comprueba que nada se salga de ninguna hoja y que cada captura cargue.
   Uso: FONTS=/ruta/node_modules/@fontsource node scripts/airdrop-guide/pdf.js [en,es,...] */
"use strict";
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const OUTDIR = path.join(ROOT, "airdrop-guide", "pdf");
const BASE = process.env.BASE || "http://127.0.0.1:8768";
const FONTS = process.env.FONTS || "";
const LANGS = (process.argv[2] || "en,es,zh,pt,ru,fr,ja,ko,ar,de,hi").split(",");
const NOTO = { zh: "noto-sans-sc", ja: "noto-sans-jp", ko: "noto-sans-kr", ar: "noto-sans-arabic", hi: "noto-sans-devanagari" };
const FAMILY = { zh: "Noto Sans SC", ja: "Noto Sans JP", ko: "Noto Sans KR", ar: "Noto Sans Arabic", hi: "Noto Sans Devanagari" };

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const b = await chromium.launch();
  let bad = 0;
  for (const l of LANGS) {
    const p = await b.newPage({ viewport: { width: 1240, height: 1754 } });
    await p.route(/analytics|googletagmanager/, (r) => r.abort());
    // fuentes Noto servidas desde node_modules
    await p.route(/\/__fonts\//, (r) => {
      const f = path.join(FONTS, decodeURIComponent(new URL(r.request().url()).pathname.replace(/^\/__fonts\//, "")));
      if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: "" });
      r.fulfill({ status: 200, contentType: f.endsWith(".css") ? "text/css" : "font/woff2", body: fs.readFileSync(f) });
    });
    const t0 = Date.now(), T = (m) => process.env.DEBUG && console.log(l, ((Date.now() - t0) / 1000).toFixed(1) + "s", m);
    await p.goto(BASE + "/airdrop-guide/print/" + l + ".html", { waitUntil: "load" }); T("load");
    if (NOTO[l]) {
      if (!FONTS) throw new Error("falta FONTS para " + l);
      const css = [300, 400, 500].map((w) => fs.readFileSync(path.join(FONTS, NOTO[l], w + ".css"), "utf8").replace(/url\(\.\/files\//g, "url(/__fonts/" + NOTO[l] + "/files/")).join("\n");
      await p.addStyleTag({ content: css + "\n:root{--intl:'" + FAMILY[l] + "'}" });
    }
    await p.emulateMedia({ media: "print" });
    await p.evaluate(async (intl) => {
      // carga explicita de cada fuente con el texto de la guia (si no, Chrome imprime antes de tenerlas)
      const txt = document.body.innerText.slice(0, 30000);
      const fams = ["IBM Plex Sans", "IBM Plex Mono"].concat(intl ? [intl] : []);
      await Promise.all(fams.flatMap((f) => [200, 300, 400, 500].map((w) => document.fonts.load(w + ' 16px "' + f + '"', txt).catch(() => 0))));
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
    }, FAMILY[l] || "");
    const missing = await p.evaluate(() => ["IBM Plex Sans", "IBM Plex Mono"].filter((f) => !document.fonts.check('400 16px "' + f + '"', "Ab")));
    if (missing.length) console.log(l, "fuentes sin cargar:", missing.join(", "));
    T("fonts+imgs");
    await p.evaluate(() => window.fitPages());
    await p.waitForTimeout(300); T("fit");
    // nada fuera de su hoja: el ultimo bloque de cada hoja termina antes del pie
    const probs = await p.evaluate(() => {
      const out = [];
      document.querySelectorAll(".pg").forEach((pg) => {
        const b = pg.querySelector(".pg-b"), r = b.getBoundingClientRect(), pad = parseFloat(getComputedStyle(b).paddingBottom);
        let low = 0; b.querySelectorAll(":scope > *").forEach((c) => { low = Math.max(low, c.getBoundingClientRect().bottom); });
        if (low > r.bottom - pad + 1) out.push(pg.dataset.id + " se sale " + Math.round(low - (r.bottom - pad)) + "px");
        pg.querySelectorAll("img").forEach((i) => { if (!i.naturalWidth) out.push(pg.dataset.id + " sin imagen " + i.getAttribute("src")); });
        b.querySelectorAll(".vis").forEach((v) => { if (v.clientHeight < 90) out.push(pg.dataset.id + " captura muy pequena (" + v.clientHeight + "px)"); });
      });
      return out;
    });
    if (probs.length) { bad++; console.log(l, "PROBLEMAS:", probs.join(" | ")); }
    const file = path.join(OUTDIR, "Sectora-Airdrop-Guide-" + l.toUpperCase() + ".pdf");
    await p.pdf({ path: file, preferCSSPageSize: true, printBackground: true, timeout: 120000 }); T("pdf");
    console.log(l, "ok", Math.round(fs.statSync(file).size / 1024) + " KB", probs.length ? "" : "· sin problemas");
    await p.close();
  }
  await b.close();
  if (bad) process.exitCode = 1;
})().catch((e) => { console.error(e); process.exit(1); });
