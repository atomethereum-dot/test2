/* Guia del Airdrop Genesis: genera la web (11 idiomas) y las paginas para el PDF.
   Contenido: content/<idioma>.js (misma estructura que content/en.js).
   Botones de la web: labels.json (node labels.js). Capturas: airdrop-guide/img.
   Uso: node scripts/airdrop-guide/build.js
   Salida: airdrop-guide/index.html (ingles), airdrop-guide/<idioma>/index.html y airdrop-guide/print/<idioma>.html */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const OUT = path.join(ROOT, "airdrop-guide");
const LANGS = ["en", "es", "zh", "pt", "ru", "fr", "ja", "ko", "ar", "de", "hi"];
const LABELS = require("./labels.json");
const EN = require("./content/en.js");
const BASE = "https://sectoraorg.com/airdrop-guide/";
const TOKEN = "0x8C9984B06281f1CA9416e493c2E602AaB08513db", STAKING = "0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0";
const PDF = (l) => "/airdrop-guide/pdf/Sectora-Airdrop-Guide-" + l.toUpperCase() + ".pdf";
const PAGE = (l) => "/airdrop-guide/" + (l === "en" ? "" : l + "/");

/* ---------- utilidades ---------- */
// misma forma que el ingles: mismas claves y listas del mismo largo
function sameShape(a, b, at, errs) {
  if (Array.isArray(a)) { if (!Array.isArray(b) || a.length !== b.length) errs.push(at + " (lista)"); else a.forEach((x, i) => sameShape(x, b[i], at + "[" + i + "]", errs)); return; }
  if (a && typeof a === "object") { if (!b || typeof b !== "object") { errs.push(at); return; } for (const k in a) { if (!(k in b)) errs.push(at + "." + k); else sameShape(a[k], b[k], at + "." + k, errs); } return; }
  if (typeof b !== "string") errs.push(at + " (texto)");
}
function jpg(file) {
  const b = fs.readFileSync(file); let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1], len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  throw new Error("jpg sin tamano: " + file);
}
// captura en el idioma; si no existe, la inglesa; si tampoco, la comun (staking, solo en ingles)
function img(l, name) {
  for (const rel of [l + "/" + name + ".jpg", "en/" + name + ".jpg", name + ".jpg"]) {
    const f = path.join(OUT, "img", rel);
    if (fs.existsSync(f)) { const s = jpg(f); return { src: "/airdrop-guide/img/" + rel + "?v=2", w: s.w, h: s.h }; }
  }
  return null;
}
const ICON = {
  see: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.01"/></svg>',
  tip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></svg>',
  done: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z"/><path d="M12 8v5M12 16.5v.01"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12.5h2M3 9h18"/></svg>'
};
const LOGO = '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="9" fill="#1569ff"/><circle cx="50" cy="50" r="27.2" fill="none" stroke="#fff" stroke-width="6.1"/></svg>';

/* ---------- una pagina por idioma ---------- */
function build(l) {
  const C = require("./content/" + l + ".js"), U = LABELS[l];
  const errs = []; sameShape(EN, C, l, errs);
  if (errs.length) throw new Error("estructura distinta en " + l + ": " + errs.slice(0, 8).join(", "));
  // {ui:clave} boton de la web en este idioma · {en:Texto} boton de la pagina de staking (solo ingles)
  const chip = (s) => String(s).replace(/\{ui:([a-zA-Z0-9]+)\}/g, (m, k) => '<span class="ui">' + (U[k] || EN_LAB[k] || k) + "</span>").replace(/\{en:([^}]+)\}/g, '<span class="ui en" lang="en">$1</span>');
  const plain = (s) => String(s).replace(/\{ui:([a-zA-Z0-9]+)\}/g, (m, k) => U[k] || k).replace(/\{en:([^}]+)\}/g, "$1");
  const strip = (s) => plain(s).replace(/<[^>]+>/g, "");
  const box = (kind, html) => '<div class="' + kind + '"><i>' + ICON[kind] + "</i><span>" + chip(html) + "</span></div>";
  const dos = (list) => '<ol class="do">' + list.map((x) => "<li>" + chip(x) + "</li>").join("") + "</ol>";
  const done = (d) => '<div class="done">' + ICON.done + "<div><b>" + d[0] + "</b><p>" + d[1] + "</p></div></div>";
  const check = (h, rows) => '<div class="check"><p class="m">' + chip(h) + "</p><dl>" + rows.map((r) => "<dt>" + chip(r[0]) + "</dt><dd>" + chip(r[1]) + "</dd>").join("") + "</dl></div>";
  const urlbar = (p) => '<div class="urlbar" aria-hidden="true"><div class="ub-t"><i></i><i></i><i></i></div><div class="ub-u">' + ICON.lock + "<b>sectoraorg.com</b><span>/" + p + "</span></div></div>";
  const lv = (s5) => '<div class="lv">' + [["Scout", "100", "55"], ["Sentinel", "500", "325"], ["Guardian", "1,000", "750"], ["Titan", "4,000", "3,600"]].map((x, i) =>
    "<div><span>" + x[0] + "</span><b>" + x[1] + " #SECT</b><small>" + s5.prize.replace("{n}", x[2]) + (i === 3 ? " · " + s5.nomax : "") + "</small></div>").join("") + "</div>";
  // ventana de wallet dibujada (sin marca); el boton que se pulsa lleva el anillo azul
  function wallet(kind) {
    const W = C.wallet, w = W[kind];
    let body = '<span class="wm-site">' + W.site + "</span><h4>" + w.h + "</h4>";
    if (w.p) body += "<p>" + w.p + "</p>";
    if (w.rows) body += "<dl>" + w.rows.map((r) => "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>").join("") + "</dl>";
    if (kind === "sw") body += '<div class="wm-sw"><span>' + w.from + "</span><i>→</i><span>" + w.to + "</span></div>";
    body += '<div class="wm-btns"><span class="wm-no">' + w.no + '</span><span class="wm-yes">' + w.yes + "</span></div>";
    return '<figure class="wm"><div class="wm-card"><div class="wm-top"><i>' + ICON.wallet + "</i>Wallet<b>" + (kind === "sw" ? "Ethereum" : kind === "connect" ? "Ethereum" : "Ethereum") + '</b></div><div class="wm-in">' + body + "</div></div><figcaption>" + C.common.illus + "</figcaption></figure>";
  }
  // captura: web (con barra del navegador si es una pagina clara) o movil
  function shot(name, o) {
    o = o || {}; const I = img(l, name); if (!I) return "";
    const alt = strip(o.alt || o.cap || "");
    const pic = '<img src="' + I.src + '" width="' + I.w + '" height="' + I.h + '" alt="' + alt.replace(/"/g, "&quot;") + '" loading="lazy" decoding="async">';
    const cap = o.cap ? "<figcaption>" + chip(o.cap) + "</figcaption>" : "";
    if (o.phone) return '<figure class="shot ph"><div class="phone">' + pic + "</div>" + cap + "</figure>";
    const bar = o.bar ? '<div class="bar"><i></i><i></i><i></i><span><b>sectoraorg.com</b>/' + o.bar + "</span></div>" : "";
    return '<figure class="shot ' + (o.size || "") + '"><div class="fr' + (o.light ? " light" : "") + '">' + bar + pic + "</div>" + cap + "</figure>";
  }
  const S = C.s;
  /* cada paso: cabecera + bloques; "vis" son las imagenes (en el PDF ocupan el espacio libre) */
  const STEPS = {
    1: [["do"], ["urlbar", "staking"], ["warn"]],
    2: [["do"], ["vis", [shot("stk-1-connect", { light: true, bar: "staking", size: "mid", cap: S[2].cap })]]],
    3: [["do"], ["vis", [shot("stk-2-wallet", { light: true, bar: "staking", cap: S[3].capPc }), shot("stk-phone-2", { phone: true, cap: S[3].capPhone })], "ph2"], ["vis", [wallet("connect")]]],
    4: [["do"], ["vis", [shot("stk-3c-connected", { light: true, bar: "staking", size: "mid" })]], ["see"], ["warn"]],
    5: [["do"], ["vis", [shot("stk-3-amount", { light: true, bar: "staking", size: "mid" })]], ["txt", S[5].how], ["lv"]],
    6: [["do"], ["vis", [shot("stk-3b-deposit", { light: true, bar: "staking" }), wallet("approve")], "w2"], ["check", S[6].checkH, S[6].check]],
    7: [["do"], ["vis", [shot("stk-4-done", { light: true, bar: "staking", cap: S[7].cap }), wallet("deposit")], "w2"], ["warn"], ["done", S[7].done]],
    8: [["do"], ["lang"], ["vis", [shot("dsh-1-connect", { bar: "dashboard" })]], ["vis", [shot("dsh-phone-1", { phone: true, cap: S[8].capPhone }), shot("dsh-phone-2", { phone: true, cap: S[8].capPhone2 })], "phones"], ["warn"]],
    9: [["do"], ["vis", [shot("dsh-2-wallet", { size: "narrow" }), wallet("sw")], "w2"], ["tip"]],
    10: [["do"], ["vis", [shot("dsh-3-how", { bar: "dashboard", cap: S[10].capHow })]], ["tipx", S[10].copy], ["vis", [shot("fct", { cap: S[10].capGoogle }), shot("dsh-3-gas", { cap: S[10].capDash })], "two"], ["warn"]],
    11: [["do"], ["vis", [shot("dsh-4-faucet", { size: "mid" })]], ["tip"]],
    12: [["do"], ["vis", [shot("dsh-5-kit", { cap: S[12].cap1 }), shot("dsh-6-buy", { cap: S[12].cap2 })], "two"], ["see"]],
    13: [["do"], ["vis", [shot("dsh-7-register", { cap: S[13].cap })]], ["tip"], ["break"], ["check", S[13].planH, S[13].plan, "manual"], ["vis", [shot("dsh-7b-manual", { cap: S[13].planCap })]]],
    14: [["do"], ["vis", [shot("dsh-8-done")]], ["onoff"], ["done", S[14].done]],
    15: [["do"], ["vis", [shot("my-1-panel", { bar: "myairdrop", cap: S[15].cap })]], ["check", S[15].checkH, S[15].check]],
    16: [["do"], ["vis", [shot("air-1-page", { cap: S[16].cap1 }), shot("air-2-status", { size: "narrow", cap: S[16].cap2 })], "two"], ["see"]]
  };
  const PART = { 1: "A", 8: "B", 15: "C" };
  const partOf = (n) => (n <= 7 ? "A" : n <= 14 ? "B" : "C");
  function block(n, b, print) {
    const c = S[n];
    switch (b[0]) {
      case "do": return dos(c.do);
      case "urlbar": return urlbar(b[1]);
      case "see": case "warn": case "tip": return c[b[0]] ? box(b[0], c[b[0]]) : "";
      case "tipx": return box("tip", b[1]);
      case "txt": return '<p class="txt">' + chip(b[1]) + "</p>";
      case "lv": return lv(c);
      case "lang": return c.lang ? '<p class="lang-note">' + chip(c.lang) + "</p>" : "";
      case "check": return b[3] ? check(b[1], b[2]).replace('<div class="check">', '<div class="check" id="' + b[3] + '">') : check(b[1], b[2]);
      case "done": return done(b[1]);
      case "onoff": return '<div class="onoff">' + c.onoff.map((x, i) => '<div class="' + (i === 2 ? "no" : "") + '"><span>' + x[0] + "</span><b>" + x[1] + "</b><small>" + x[2] + "</small></div>").join("") + "</div>";
      case "vis": {
        const items = b[1].filter(Boolean); if (!items.length) return "";
        if (print) return '<div class="vis ' + (b[2] || "") + '">' + items.join("") + "</div>";
        if (items.length === 1) return items[0];
        return '<div class="' + (b[2] === "w2" ? "vis2" : b[2] === "phones" ? "phone-row" : "shots2" + (b[2] === "ph2" ? " ph2" : "")) + '">' + items.join("") + "</div>";
      }
      case "break": return print ? "\u0000" : "";
    }
    return "";
  }
  const partLabel = (P) => (C.common.part.indexOf("{p}") >= 0 ? C.common.part.replace("{p}", P) : C.common.part + " " + P);
  const head = (n) => '<div class="st-n">' + String(n).padStart(2, "0") + "<small>" + partLabel(partOf(n)) + '</small></div>';

  /* ---------- web ---------- */
  function stepWeb(n) {
    const c = S[n];
    return '<li class="step" id="step-' + n + '">' + head(n) + '<div><p class="st-k m">' + chip(c.k) + "</p><h3>" + plain(c.h) + "</h3>" +
      STEPS[n].map((b) => block(n, b, false)).join("") + "</div></li>";
  }
  function partWeb(P, from, to) {
    const p = C.parts[P];
    let steps = ""; for (let n = from; n <= to; n++) steps += stepWeb(n);
    return '<section class="sec part" id="part-' + P.toLowerCase() + '"><div class="wrap"><div class="part-h"><span class="part-l" aria-hidden="true">' + P + '</span><div><p class="m">' + p.k + "</p><h2>" + p.h + '</h2><p class="sub">' + p.sub + "</p>" +
      (P === "A" && C.common.stakingEnglish ? '<p class="lang-note">' + C.common.stakingEnglish + "</p>" : "") +
      '<div class="tags">' + p.tags.map((t, i) => '<span class="' + (P === "A" && i === 0 ? "real" : (P !== "A" && i === 0 ? "free" : "")) + '">' + t + "</span>").join("") + '</div></div></div><ol class="steps">' + steps + "</ol></div></section>";
  }
  const alt = LANGS.map((x) => '<link rel="alternate" hreflang="' + x + '" href="' + BASE + (x === "en" ? "" : x + "/") + '">').join("\n") + '\n<link rel="alternate" hreflang="x-default" href="' + BASE + '">';
  const web = `<!DOCTYPE html>
<html lang="${l}" dir="${C.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light">
<title>${C.meta.title}</title>
<meta name="description" content="${C.meta.desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="${BASE}${l === "en" ? "" : l + "/"}">
<meta property="og:title" content="${C.meta.title}">
<meta property="og:description" content="${C.meta.desc}">
<meta property="og:image" content="https://sectoraorg.com/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="192x192" href="/icons/v2/icon-192.png">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/v2/favicon-32x32.png">
<link rel="icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/icons/v2/apple-touch-icon.png">
<link rel="canonical" href="${BASE}${l === "en" ? "" : l + "/"}">
${alt}
<meta name="theme-color" content="#ffffff">
<link rel="preload" href="/fonts/IBMPlexSans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/airdrop-guide/guide.css?v=3">
<script src="/analytics.js" defer></script>
</head>
<body>
<header class="top">
  <div class="wrap">
    <a class="brand" href="https://sectoraorg.com/">${LOGO}<b>SECTORA</b><span class="m">${C.nav.sub}</span></a>
    <div class="top-r">
      <span id="langPick" aria-label="${C.nav.lang}"></span>
      <a class="back m" href="/airdrop/">← ${C.nav.back}</a>
      <a class="dl m" href="${PDF(l)}" download>${C.nav.pdf} ↓</a>
    </div>
  </div>
</header>
<main>
<section class="hero paper">
  <div class="wrap">
    <div class="hero-g">
      <div>
        <p class="eyebrow m"><i></i>${C.hero.k}</p>
        <h1>${C.hero.h1}</h1>
        <p class="lede">${C.hero.lede}</p>
        <div class="ctas">
          <a class="btn pri" href="${PDF(l)}" download>${C.hero.pdf} <small>↓</small></a>
          <a class="btn alt" href="#before">${C.hero.start} ↓</a>
        </div>
        <p class="hero-note">${C.common.example}</p>
      </div>
      <aside class="need2">
        <p class="m">${C.need.k}</p>
        <h2>${C.need.h}</h2>
        <ul class="req">
          <li><span>1</span><div><b>${C.need.r1[0]}</b><small>${C.need.r1[1]}</small></div></li>
          <li><span>2</span><div><b>${C.need.r2[0]}</b><small>${C.need.r2[1]}</small></div></li>
        </ul>
        <p class="req-f">${C.need.foot}</p>
      </aside>
    </div>
    <div class="already">
      <span class="already-i" aria-hidden="true">${ICON.see}</span>
      <div><h2>${C.already.h}</h2><p>${C.already.p}</p></div>
      <a class="btn" href="#part-b">${C.already.btn} →</a>
    </div>
    <nav class="map">
      ${C.map.map((m, i) => '<a href="#part-' + "abc"[i] + '"><span class="m">' + m[0] + "</span><b>" + m[1] + "</b><small>" + m[2] + "</small><em>" + m[3] + "</em></a>").join("\n      ")}
    </nav>
  </div>
</section>
<section class="sec" id="before">
  <div class="wrap">
    <p class="eyebrow m"><i></i>${C.before.k}</p>
    <h2 class="big">${C.before.h}</h2>
    <div class="before">
      ${C.before.items.map((x, i) => '<div' + (i === 3 ? ' class="key"' : "") + '><span class="m">' + x[0] + "</span><b>" + x[1] + "</b><small>" + x[2] + "</small></div>").join("\n      ")}
    </div>
    <div class="rules"><span class="rules-i" aria-hidden="true">${ICON.shield}</span><div><h3>${C.before.rulesH}</h3><p>${C.before.rules}</p></div></div>
    <div class="phone-sec" id="phone">
      <div>
        <p class="eyebrow m"><i></i>${C.phone.k}</p>
        <h3 style="margin-top:12px;font-size:clamp(22px,2.4vw,30px);font-weight:300;letter-spacing:-.02em;line-height:1.15">${C.phone.h}</h3>
        <p style="margin-top:10px;color:var(--ink-2)">${C.phone.p}</p>
        ${dos(C.phone.steps)}
        <p class="note2">${C.phone.note}</p>
      </div>
      <div class="phone-pair">${["stk-phone-2", "dsh-phone-2"].map((n) => { const I = img(l, n); return I ? '<div class="phone"><img src="' + I.src + '" width="' + I.w + '" height="' + I.h + '" alt="" loading="lazy" decoding="async"></div>' : ""; }).join("")}</div>
    </div>
  </div>
</section>
${partWeb("A", 1, 7)}
${partWeb("B", 8, 14)}
${partWeb("C", 15, 16)}
<section class="sec part" id="help">
  <div class="wrap">
    <p class="eyebrow m"><i></i>${C.faq.k}</p>
    <h2 class="big">${C.faq.h}</h2>
    <div class="faq">
      ${C.faq.items.map((q) => "<div><h3>" + chip(q[0]) + "</h3><p>" + chip(q[1]) + "</p></div>").join("\n      ")}
    </div>
    <div class="help" id="support">
      <div>
        <p class="eyebrow m" style="color:#8a93a3"><i></i>${C.help.k}</p>
        <h3 style="margin-top:14px">${C.help.h}</h3>
        <p>${C.help.p}</p>
        <ol>${C.help.list.map((x) => "<li>" + x + "</li>").join("")}</ol>
      </div>
      <div class="mail">
        <div><span>${C.help.email}</span><b>support@sectoraorg.com</b></div>
        <div><span>${C.help.subject}</span><b>${C.help.subjectV}</b></div>
        <a class="btn" href="mailto:support@sectoraorg.com?subject=Airdrop%20Connection">${C.help.btn} →</a>
        <p class="no">${C.help.never}</p>
      </div>
    </div>
  </div>
</section>
</main>
<footer>
  <div class="wrap">
    <p>${C.foot.legal}<br>${C.foot.token}: <span class="addr">${TOKEN}</span> · ${C.foot.staking}: <span class="addr">${STAKING}</span><br>${C.foot.support}</p>
    <nav>${["/airdrop/", "/staking/", "/dashboard", "/myairdrop/", "/docs/#s02"].map((h, i) => '<a href="' + h + '">' + C.foot.nav[i] + "</a>").join("")}</nav>
  </div>
</footer>
<script src="/airdrop/lang-pick.js?v=2"></script>
<script>
(function () {
  var URLS = ${JSON.stringify(Object.fromEntries(LANGS.map((x) => [x, PAGE(x)])))};
  var host = document.getElementById("langPick");
  if (host && window.SALangPick) window.SALangPick(host, function () { return "${l}"; }, function (c) { if (c !== "${l}" && URLS[c]) location.href = URLS[c] + location.hash; });
})();
</script>
</body>
</html>
`;
  const webDir = l === "en" ? OUT : path.join(OUT, l);
  fs.mkdirSync(webDir, { recursive: true });
  fs.writeFileSync(path.join(webDir, "index.html"), web);

  /* ---------- PDF: paginas A4 fijas ---------- */
  const pages = [];
  const hdr = (right) => '<header class="pg-h"><span class="pg-brand">' + LOGO + "<b>SECTORA</b><i>" + C.nav.sub + "</i></span><span>" + right + "</span></header>";
  const pg = (id, right, body, cls) => pages.push('<section class="pg ' + (cls || "") + '" data-id="' + id + '">' + hdr(right) + '<div class="pg-b">' + body + '</div><footer class="pg-f"><span>sectoraorg.com/airdrop-guide</span><span>support@sectoraorg.com</span><span class="pn"></span></footer></section>');
  const partName = (P) => partLabel(P) + " · " + C.parts[P].h;
  // indice
  const tocRows = [["start", C.toc.start, ""], ["before", C.toc.before, ""], ["phone", C.phone.k, ""]]
    .concat([["A", partName("A"), "pt"]]).concat([1, 2, 3, 4, 5, 6, 7].map((n) => ["s" + n, String(n).padStart(2, "0") + " · " + plain(S[n].h), ""]))
    .concat([["B", partName("B"), "pt"]]).concat([8, 9, 10, 11, 12, 13, 14].map((n) => ["s" + n, String(n).padStart(2, "0") + " · " + plain(S[n].h), ""]))
    .concat([["C", partName("C"), "pt"]]).concat([15, 16].map((n) => ["s" + n, String(n).padStart(2, "0") + " · " + plain(S[n].h), ""]))
    .concat([["faq", C.toc.problems, "pt"]]);
  pg("toc", C.toc.k, '<p class="kick">' + C.toc.k + "</p><h1 class=\"pt-h\">" + C.toc.h + '</h1><p class="note">' + C.common.example + '</p><ol class="toc">' +
    tocRows.map((r) => '<li class="' + r[2] + '" data-to="' + (r[0].length === 1 ? "s" + { A: 1, B: 8, C: 15 }[r[0]] : r[0]) + '"><span>' + r[1] + "</span><em></em></li>").join("") + "</ol>");
  // empieza aqui
  pg("start", C.toc.start, '<p class="kick">' + C.hero.k + '</p><h1 class="pt-h big">' + C.hero.h1 + '</h1><p class="lede">' + C.hero.lede + "</p>" +
    '<div class="need"><p class="kick">' + C.need.k + "</p><h2>" + C.need.h + '</h2><div class="req2"><div><span>1</span><b>' + C.need.r1[0] + "</b><small>" + C.need.r1[1] + '</small></div><div><span>2</span><b>' + C.need.r2[0] + "</b><small>" + C.need.r2[1] + '</small></div></div><p class="foot">' + C.need.foot + "</p></div>" +
    '<div class="already"><i>' + ICON.see + "</i><div><b>" + C.already.h + "</b><p>" + C.already.p + "</p></div></div>" +
    '<div class="map">' + C.map.map((m) => "<div><span>" + m[0] + "</span><b>" + m[1] + "</b><small>" + m[2] + "</small><em>" + m[3] + "</em></div>").join("") + "</div>");
  // antes de empezar
  pg("before", C.toc.before, '<p class="kick">' + C.before.k + '</p><h1 class="pt-h">' + C.before.h + '</h1><div class="before">' +
    C.before.items.map((x, i) => '<div class="' + (i === 3 ? "key" : "") + '"><span>' + x[0] + "</span><b>" + x[1] + "</b><small>" + x[2] + "</small></div>").join("") + "</div>" +
    '<div class="rules"><i>' + ICON.shield + "</i><div><b>" + C.before.rulesH + "</b><p>" + C.before.rules + "</p></div></div>");
  // con el telefono
  pg("phone", C.phone.k, '<p class="kick">' + C.phone.k + '</p><h1 class="pt-h">' + C.phone.h + '</h1><p class="lede">' + C.phone.p + "</p>" + dos(C.phone.steps) +
    '<div class="vis phones">' + [["stk-phone-2", "sectoraorg.com/staking"], ["dsh-phone-2", "sectoraorg.com/dashboard"]].map((x) => { const I = img(l, x[0]); return I ? '<figure><div class="phone"><img src="' + I.src + '" alt=""></div><figcaption>' + x[1] + "</figcaption></figure>" : ""; }).join("") + "</div>" + box("tip", C.phone.note));
  // pasos
  for (let n = 1; n <= 16; n++) {
    const c = S[n], P = partOf(n);
    let top = "";
    if (PART[n]) { const p = C.parts[P]; top = '<div class="pband"><span class="pl">' + P + '</span><div><p class="kick">' + p.k + "</p><h2>" + p.h + "</h2><p>" + p.sub + "</p>" + (P === "A" && C.common.stakingEnglish ? '<p class="en-note">' + C.common.stakingEnglish + "</p>" : "") + "</div></div>"; }
    const sh = '<div class="ps-h"><span class="ps-n">' + String(n).padStart(2, "0") + '</span><div><p class="kick">' + C.common.stepOf.replace("{n}", n) + " · " + chip(c.k) + "</p><h2>" + plain(c.h) + "</h2></div></div>";
    const body = STEPS[n].map((b) => block(n, b, true)).join("");
    const halves = body.split("\u0000");
    pg("s" + n, partName(P), top + sh + halves[0], PART[n] ? "first" : "");
    if (halves[1]) pg("s" + n + "b", partName(P), '<div class="ps-h"><span class="ps-n">' + String(n).padStart(2, "0") + '</span><div><p class="kick">' + C.common.stepOf.replace("{n}", n) + " · Plan B</p><h2>" + plain(c.h) + "</h2></div></div>" + halves[1]);
  }
  // problemas y soporte
  pg("faq", C.toc.problems, '<p class="kick">' + C.faq.k + '</p><h1 class="pt-h">' + C.faq.h + '</h1><div class="faq">' + C.faq.items.map((q) => "<div><b>" + chip(q[0]) + "</b><p>" + chip(q[1]) + "</p></div>").join("") + "</div>");
  pg("support", C.help.k, '<p class="kick">' + C.help.k + '</p><h1 class="pt-h">' + C.help.h + '</h1><div class="help"><div><p>' + C.help.p + "</p><ol>" + C.help.list.map((x) => "<li>" + x + "</li>").join("") + "</ol></div>" +
    '<div class="mail"><div><span>' + C.help.email + "</span><b>support@sectoraorg.com</b></div><div><span>" + C.help.subject + "</span><b>" + C.help.subjectV + '</b></div><p class="no">' + C.help.never + "</p></div></div>" +
    '<div class="rules"><i>' + ICON.shield + "</i><div><b>" + C.before.rulesH + "</b><p>" + C.before.rules + "</p></div></div>" +
    '<div class="legal"><p>' + C.foot.legal + "</p><p>" + C.foot.token + ": <code>" + TOKEN + "</code></p><p>" + C.foot.staking + ": <code>" + STAKING + "</code></p><p>" + C.foot.online + "</p></div>");
  const cv = C.cover;
  const cover = `<section class="cover">
  <div class="cv-top"><div class="cv-brand">${LOGO}<div><b>SECTORA</b><small>Sectora Foundation</small></div></div><span class="cv-tag">${cv.tag}</span></div>
  <svg class="cv-mark" viewBox="0 0 100 100" aria-hidden="true"><rect x=".5" y=".5" width="99" height="99" rx="9"/><circle cx="50" cy="50" r="27.2" fill="none" stroke="#1569ff" stroke-width="6.1" opacity=".9"/><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.12)" stroke-width=".4"/></svg>
  <div class="cv-mid">
    <p class="m"><i></i>${cv.kicker}</p>
    <h1>${cv.h1}</h1>
    <p>${cv.p}</p>
    <div class="cv-steps">${cv.parts.map((x) => "<div><span>" + x[0] + "</span><b>" + x[1] + "</b><small>" + x[2] + "</small></div>").join("")}</div>
  </div>
  <div class="cv-bot">
    <div class="cv-legal">
      <div><p class="h">${cv.issued}</p><dl><dt>${cv.entity}</dt><dd>Sectora Foundation IL</dd><dt>${cv.activity}</dt><dd>${cv.activityV}</dd><dt>${cv.location}</dt><dd>${cv.locationV}</dd><dt>${cv.file}</dt><dd>18523639</dd><dt>${cv.ein}</dt><dd>32-0868576</dd></dl></div>
      <div><p class="h">${cv.contracts}</p><dl><dt>${cv.token}</dt><dd><code>${TOKEN}</code></dd><dt>${cv.staking}</dt><dd><code>${STAKING}</code></dd><dt>${cv.web}</dt><dd>sectoraorg.com</dd><dt>${cv.support}</dt><dd>support@sectoraorg.com</dd></dl></div>
    </div>
    <div class="cv-foot"><span>sectoraorg.com/airdrop-guide</span><span>${cv.date}</span></div>
  </div>
</section>`;
  const print = `<!DOCTYPE html>
<html lang="${l}" dir="${C.dir}">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<title>${C.meta.title} · PDF</title>
<link rel="stylesheet" href="/airdrop-guide/print.css?v=2">
</head>
<body>
${cover}
${pages.join("\n")}
<script>
/* numeros de pagina e indice; las imagenes de cada pagina se ajustan al espacio libre */
(function () {
  var pgs = document.querySelectorAll(".pg"), N = pgs.length + 1;
  pgs.forEach(function (p, i) { p.querySelector(".pn").textContent = (i + 2) + " / " + N; p.dataset.n = i + 2; });
  document.querySelectorAll(".toc li").forEach(function (li) { var p = document.querySelector('.pg[data-id="' + li.dataset.to + '"]'); if (p) li.querySelector("em").textContent = p.dataset.n; });
  window.fitPages = function () {
    document.querySelectorAll(".pg-b").forEach(function (b) {
      var vis = b.querySelectorAll(".vis"); if (!vis.length) return;
      vis.forEach(function (v) { v.style.height = "0px"; });
      var bottom = b.getBoundingClientRect().bottom - parseFloat(getComputedStyle(b).paddingBottom);
      var free = Math.max(0, bottom - b.lastElementChild.getBoundingClientRect().bottom);
      var each = Math.floor(free / vis.length);
      vis.forEach(function (v) {
        v.style.height = each + "px";
        var tall = 0;
        v.querySelectorAll("figure").forEach(function (f) {
          var cap = f.querySelector("figcaption"), ch = cap ? cap.offsetHeight + 8 : 0;
          // la barra del navegador encima de la captura tambien ocupa su alto
          var bar = f.querySelector(".bar"); if (bar) ch += bar.offsetHeight;
          var im = f.querySelector("img"); if (im) im.style.maxHeight = Math.max(40, each - ch - (f.querySelector(".phone") ? 22 : 4)) + "px";
          var wm = f.querySelector(".wm-card"); if (wm) { wm.style.transform = ""; var s = Math.min(1, (each - ch) / wm.offsetHeight); if (s < 1) { wm.style.transform = "scale(" + s + ")"; wm.style.transformOrigin = "top center"; f.style.height = (wm.offsetHeight * s + ch) + "px"; } }
        });
        // la caja mide lo que miden sus capturas: el texto sigue justo debajo y el sobrante queda al final de la hoja
        v.style.height = "auto";
        v.querySelectorAll("figure").forEach(function (f) { tall = Math.max(tall, f.getBoundingClientRect().height); });
        v.style.height = Math.min(each, Math.ceil(tall) + 2) + "px";
      });
    });
  };
})();
</script>
</body>
</html>
`;
  fs.mkdirSync(path.join(OUT, "print"), { recursive: true });
  fs.writeFileSync(path.join(OUT, "print", l + ".html"), print.replace(/ loading="lazy"/g, ""));
  return pages.length + 1;
}
const EN_LAB = LABELS.en;
const only = (process.argv[2] || LANGS.join(",")).split(",");
for (const l of only) { if (!fs.existsSync(path.join(__dirname, "content", l + ".js"))) { console.log("sin contenido:", l); continue; } console.log(l, "paginas PDF:", build(l)); }
