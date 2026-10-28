// Convierte las capturas del movil (390x664 @2x, solo la web) en la pantalla completa de un iPhone:
// barra de estado con la isla dinamica arriba y la barra de Safari abajo (390x844 @2x = 780x1688).
// Solo toca las que aun tienen el tamano original, asi que se puede volver a lanzar sin problema.
//   node scripts/airdrop-guide/iphone.js
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..", "..", "airdrop-guide", "img");
const W = 390, H = 844, TOP = 54, BOTTOM = 126;

function files(dir) {
  let out = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) out = out.concat(files(p));
    else if (/-phone-\d\.jpg$/.test(f.name)) out.push(p);
  }
  return out;
}

const ICON = {
  signal: '<svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="7.6" width="3.2" height="4.4" rx="1"/><rect x="4.8" y="5.2" width="3.2" height="6.8" rx="1"/><rect x="9.6" y="2.6" width="3.2" height="9.4" rx="1"/><rect x="14.4" y="0" width="3.2" height="12" rx="1"/></svg>',
  wifi: '<svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.6c2.2 0 4.3.8 5.9 2.3.1.1.3.1.4 0l1.2-1.2c.1-.1.1-.3 0-.4C13.5 1.4 10.8.3 8 .3S2.5 1.4.5 3.3c-.1.1-.1.3 0 .4l1.2 1.2c.1.1.3.1.4 0C3.7 3.4 5.8 2.6 8 2.6zm0 3.9c1.2 0 2.4.5 3.3 1.3.1.1.3.1.4 0l1.2-1.2c.1-.1.1-.3 0-.4C11.6 5 9.8 4.3 8 4.3S4.4 5 3.1 6.2c-.1.1-.1.3 0 .4l1.2 1.2c.1.1.3.1.4 0 .9-.8 2.1-1.3 3.3-1.3zm2.3 2.7c.1-.1.1-.3 0-.4C9.7 8.3 8.9 8 8 8s-1.7.3-2.3.8c-.1.1-.1.3 0 .4l2.1 2.1c.1.1.3.1.4 0l2.1-2.1z"/></svg>',
  battery: '<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.6" fill="none" stroke="currentColor" stroke-opacity=".38"/><rect x="2" y="2" width="20" height="9" rx="2.2"/><path d="M25 4.4v4.2c.8-.3 1.4-1.1 1.4-2.1s-.6-1.8-1.4-2.1z" fill-opacity=".45"/></svg>',
  back: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4.5 7.5 12l7.5 7.5"/></svg>',
  fwd: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 4.5 7.5 7.5L9 19.5"/></svg>',
  share: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 9.5H7a1.8 1.8 0 0 0-1.8 1.8v8.4A1.8 1.8 0 0 0 7 21.5h10a1.8 1.8 0 0 0 1.8-1.8v-8.4A1.8 1.8 0 0 0 17 9.5h-1.5M12 2.5v12.5M8.6 5.9 12 2.5l3.4 3.4"/></svg>',
  book: '<svg width="26" height="24" viewBox="0 0 26 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M2.5 5.2c3.2-1.3 7.2-1.2 10.5 1.1 3.3-2.3 7.3-2.4 10.5-1.1v14c-3.2-1.2-7.2-1.1-10.5 1.1-3.3-2.2-7.3-2.3-10.5-1.1zM13 6.3v14"/></svg>',
  tabs: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><rect x="8" y="3" width="13" height="13" rx="2.6"/><path d="M16 16.2v2.2a2.6 2.6 0 0 1-2.6 2.6H5.6A2.6 2.6 0 0 1 3 18.4v-7.8A2.6 2.6 0 0 1 5.6 8H8"/></svg>',
  lock: '<svg width="10" height="13" viewBox="0 0 10 13"><path d="M2.4 5.4V3.9a2.6 2.6 0 0 1 5.2 0v1.5h.6c.7 0 1.3.6 1.3 1.3v4.8c0 .7-.6 1.3-1.3 1.3H1.8c-.7 0-1.3-.6-1.3-1.3V6.7c0-.7.6-1.3 1.3-1.3zm1.3 0h2.6V3.9a1.3 1.3 0 0 0-2.6 0z"/></svg>',
  reload: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.6 9.6A5.7 5.7 0 1 1 13 5.1"/><path d="M13.6 1.9v3.6H10"/></svg>',
};

function html(src, url, top, dark) {
  const lum = (0.2126 * top[0] + 0.7152 * top[1] + 0.0722 * top[2]) / 255;
  const ink = lum > 0.6 ? "#000" : "#fff";
  const S = dark
    ? { bar: "rgba(28,28,30,.97)", line: "rgba(255,255,255,.08)", pill: "#323235", ink: "#fff", sub: "#8e8e93", tint: "#0a84ff", off: "#48484a", home: "#fff" }
    : { bar: "rgba(247,247,248,.97)", line: "rgba(0,0,0,.1)", pill: "#fff", ink: "#000", sub: "#8a8a8e", tint: "#007aff", off: "#c4c4c8", home: "#000" };
  return `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:rgb(${top.join(",")});font-family:-apple-system,"SF Pro Text","Helvetica Neue","Liberation Sans",Arial,sans-serif;-webkit-font-smoothing:antialiased}
.sb{position:absolute;left:0;top:0;width:${W}px;height:${TOP}px;color:${ink}}
.tm{position:absolute;left:0;width:112px;top:17px;text-align:center;font-size:17px;font-weight:700;letter-spacing:-.2px;line-height:22px}
.ic{position:absolute;right:26px;top:22px;display:flex;align-items:center;gap:5px;fill:currentColor}
.ic svg{display:block}
.di{position:absolute;left:${(W - 125) / 2}px;top:11px;width:125px;height:37px;border-radius:19px;background:#000}
.pg{position:absolute;left:0;top:${TOP}px;width:${W}px;height:${H - TOP - BOTTOM}px;object-fit:cover;object-position:top}
.sf{position:absolute;left:0;bottom:0;width:${W}px;height:${BOTTOM}px;background:${S.bar};border-top:.5px solid ${S.line}}
.pill{position:absolute;left:9px;right:9px;top:8px;height:44px;border-radius:13px;background:${S.pill};box-shadow:0 1px 5px rgba(0,0,0,${dark ? 0 : 0.1});display:flex;align-items:center;color:${S.ink}}
.aa{position:absolute;left:14px;top:0;height:44px;display:flex;align-items:baseline;line-height:44px;font-weight:500}
.aa i{font-style:normal;font-size:12px}.aa b{font-weight:500;font-size:17px}
.url{flex:1;display:flex;justify-content:center;align-items:center;gap:5px;font-size:17px;letter-spacing:-.25px}
.url svg{fill:${S.sub}}
.rl{position:absolute;right:13px;top:13px;color:${S.ink}}
.tb{position:absolute;left:0;right:0;top:56px;height:44px;display:grid;grid-template-columns:repeat(5,1fr);place-items:center;color:${S.tint}}
.tb .off{color:${S.off}}
.home{position:absolute;left:${(W - 134) / 2}px;bottom:8px;width:134px;height:5px;border-radius:3px;background:${S.home}}
</style>
<div class="sb"><div class="tm">9:41</div><div class="di"></div><div class="ic">${ICON.signal}${ICON.wifi}${ICON.battery}</div></div>
<img class="pg" src="${src}">
<div class="sf">
  <div class="pill"><div class="aa"><i>A</i><b>A</b></div><div class="url">${ICON.lock}<span>${url}</span></div><div class="rl">${ICON.reload}</div></div>
  <div class="tb"><span>${ICON.back}</span><span class="off">${ICON.fwd}</span><span>${ICON.share}</span><span>${ICON.book}</span><span>${ICON.tabs}</span></div>
  <div class="home"></div>
</div>`;
}

(async () => {
  const todo = files(ROOT);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  let n = 0;
  for (const f of todo) {
    const buf = fs.readFileSync(f);
    // tamano del JPEG sin dependencias: lee el marcador SOF
    let i = 2, w = 0, h = 0;
    while (i < buf.length) {
      const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xc3) { h = buf.readUInt16BE(i + 5); w = buf.readUInt16BE(i + 7); break; }
      i += 2 + len;
    }
    if (!(w === 2 * W && h === 2 * (H - TOP - BOTTOM))) continue;
    const src = "data:image/jpeg;base64," + buf.toString("base64");
    await p.setContent('<img id="x" src="' + src + '">');
    const [top, dark] = await p.evaluate(() => new Promise((ok) => {
      const im = document.getElementById("x");
      const go = () => {
        const c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight;
        const g = c.getContext("2d"); g.drawImage(im, 0, 0);
        const px = g.getImageData(4, 30, 1, 1).data;
        const all = g.getImageData(0, 0, c.width, c.height).data;
        let s = 0, k = 0;
        for (let j = 0; j < all.length; j += 4 * 97) { s += 0.2126 * all[j] + 0.7152 * all[j + 1] + 0.0722 * all[j + 2]; k++; }
        ok([[px[0], px[1], px[2]], s / k / 255 < 0.35]);
      };
      im.complete ? go() : (im.onload = go);
    }));
    const url = /stk-/.test(path.basename(f)) ? "sectoraorg.com" : "sectoraorg.com";
    await p.setContent(html(src, url, top, dark));
    await p.waitForFunction(() => document.querySelector(".pg").complete);
    await p.screenshot({ path: f, type: "jpeg", quality: 82 });
    n++;
  }
  await b.close();
  console.log("iPhone:", n, "de", todo.length);
})().catch((e) => { console.log("iPhone ERROR", e.message); process.exitCode = 1; });
