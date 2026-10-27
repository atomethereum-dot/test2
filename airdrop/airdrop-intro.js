/* Intro del Airdrop Genesis (opcion 06 · Horizonte, con la salida de 03 · Red).
   Un cielo de estrellas sobre el borde de un planeta: la atmosfera se enciende
   de azul y el logo sale por el horizonte como un sol, con un destello. Luego
   la camara entra en el logo hasta llenar la pantalla de azul y la capa se
   funde con la portada. Canvas 2D, sin dependencias. Un clic, una tecla, la
   rueda o un toque la saltan. Con ?shot el tiempo lo pone quien graba (setT). */
(function () {
  "use strict";
  const capa = document.getElementById("aint");
  const acabar = rapido => { if (window.SA_INTRO_END) window.SA_INTRO_END(rapido); };
  if (!capa) return;
  const SHOT = /[?&]shot\b/.test(location.search);
  if (!SHOT && (matchMedia("(prefers-reduced-motion: reduce)").matches || scrollY > 40)) { acabar(true); return; }

  const D = 6.0, TAU = Math.PI * 2;
  const cl = v => v < 0 ? 0 : v > 1 ? 1 : v, seg = (t, a, b) => cl((t - a) / (b - a)), lerp = (a, b, k) => a + (b - a) * k;
  const eo = k => 1 - Math.pow(1 - k, 3), ei = k => k * k * k, eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const pk = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w);
  const hs = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

  /* textos en el idioma de la pagina */
  const L = {
    en: { k: "Sectora Foundation · Official campaign", s: "<b>7,000,000 SECT</b> for those who build the network", sk: "Skip →" },
    es: { k: "Sectora Foundation · Campaña oficial", s: "<b>7.000.000 SECT</b> para quienes construyen la red", sk: "Saltar →" },
    pt: { k: "Sectora Foundation · Campanha oficial", s: "<b>7.000.000 SECT</b> para quem constrói a rede", sk: "Pular →" },
    zh: { k: "Sectora Foundation · 官方活动", s: "<b>7,000,000 SECT</b> 献给建设网络的人", sk: "跳过 →" },
    ru: { k: "Sectora Foundation · Официальная кампания", s: "<b>7 000 000 SECT</b> для тех, кто строит сеть", sk: "Пропустить →" },
    fr: { k: "Sectora Foundation · Campagne officielle", s: "<b>7 000 000 SECT</b> pour ceux qui construisent le réseau", sk: "Passer →" },
    ja: { k: "Sectora Foundation · 公式キャンペーン", s: "ネットワークを築く人へ <b>7,000,000 SECT</b>", sk: "スキップ →" },
    ko: { k: "Sectora Foundation · 공식 캠페인", s: "네트워크를 만드는 사람들을 위한 <b>7,000,000 SECT</b>", sk: "건너뛰기 →" },
    ar: { k: "Sectora Foundation · الحملة الرسمية", s: "<b>7,000,000 SECT</b> لمن يبنون الشبكة", sk: "تخطَّ ←" },
    de: { k: "Sectora Foundation · Offizielle Kampagne", s: "<b>7.000.000 SECT</b> für alle, die das Netzwerk aufbauen", sk: "Überspringen →" },
    hi: { k: "Sectora Foundation · आधिकारिक अभियान", s: "नेटवर्क बनाने वालों के लिए <b>7,000,000 SECT</b>", sk: "छोड़ें →" }
  }[(document.documentElement.lang || "en").slice(0, 2)] || null;
  const tx = L || { k: "Sectora Foundation · Official campaign", s: "<b>7,000,000 SECT</b> for those who build the network", sk: "Skip →" };
  const LOGO = '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="9" fill="#1569ff"/><circle cx="50" cy="50" r="27.2" fill="none" stroke="#fff" stroke-width="6.1"/></svg>';
  capa.innerHTML = '<canvas class="aint-cv"></canvas><div class="aint-ly">' +
    '<div class="aint-top aint-m"><span class="lg">' + LOGO + '<span>Sectora · Airdrop Genesis</span></span><span class="r">Sectora Foundation</span></div>' +
    '<p class="aint-tx aint-k aint-m">' + tx.k + '</p><h2 class="aint-tx aint-h">Airdrop <b>Genesis</b></h2><p class="aint-tx aint-s">' + tx.s + '</p>' +
    '<div class="aint-bot aint-m"><span class="pc">0%</span><span class="bar"><i></i></span><button type="button" class="sk aint-m">' + tx.sk + '</button></div></div>';
  const cv = capa.querySelector(".aint-cv"), x = cv.getContext("2d");
  const k = capa.querySelector(".aint-k"), h = capa.querySelector(".aint-h"), s = capa.querySelector(".aint-s");
  const top = capa.querySelector(".aint-top"), bot = capa.querySelector(".aint-bot"), barI = bot.querySelector("i"), pc = bot.querySelector(".pc");
  window.__aintOn = true;

  let W = 0, H = 0;
  function ajusta() { const dpr = SHOT ? 1 : Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); x.setTransform(dpr, 0, 0, dpr, 0, 0); }
  ajusta(); addEventListener("resize", ajusta);

  function glow(cx, cy, r, rgb, a) { if (a <= 0 || r <= 0) return; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, "rgba(" + rgb + "," + a + ")"); g.addColorStop(1, "rgba(" + rgb + ",0)"); x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2); }
  function logo(cx, cy, sz, a, ring) { if (a <= 0) return; x.save(); x.globalAlpha = a; x.fillStyle = "#1569ff"; x.beginPath();
    if (x.roundRect) x.roundRect(cx - sz / 2, cy - sz / 2, sz, sz, sz * .09); else x.rect(cx - sz / 2, cy - sz / 2, sz, sz); x.fill();
    if (ring > 0) { x.strokeStyle = "#fff"; x.lineWidth = sz * .061; x.lineCap = "round"; x.beginPath(); x.arc(cx, cy, sz * .272, -Math.PI / 2, -Math.PI / 2 + TAU * ring); x.stroke(); }
    x.restore(); }
  function fx(el, v, dy, blur) { el.style.opacity = v; el.style.transform = v < 1 ? "translateY(" + ((1 - eo(v)) * dy) + "px)" : "";
    el.style.filter = blur && v < 1 ? "blur(" + ((1 - eo(v)) * blur) + "px)" : ""; }

  function render(t) {
    const m = Math.min(W, H), mob = W < H, hy = H * (mob ? .58 : .64), R = W * (mob ? 2.6 : 1.7), pcx = W / 2, pcy = hy + R, sz = m * (mob ? .2 : .15);
    const rise = eo(seg(t, 1.25, 2.9)), crest = pk(t, 2.0, .9), ly0 = lerp(hy + sz * .9, hy - sz * (mob ? 1.15 : 1.25), rise);
    const z = ei(seg(t, D - 1.3, D - .55));                // entrada en el logo
    x.clearRect(0, 0, W, H); x.fillStyle = "#05070c"; x.fillRect(0, 0, W, H);
    x.save(); x.translate(W / 2, ly0); x.scale(1 + z * 2.2, 1 + z * 2.2); x.translate(-W / 2, -ly0); x.globalAlpha = 1 - z;
    const sky = x.createLinearGradient(0, 0, 0, hy); sky.addColorStop(0, "#04060b"); sky.addColorStop(1, "#071022"); x.fillStyle = sky; x.fillRect(0, 0, W, H);
    // estrellas con un leve parpadeo
    for (let i = 0; i < 220; i++) { const X = hs(i, 1) * W, Y = hs(i, 2) * hy * 1.05, r = hs(i, 3) < .92 ? .8 : 1.6;
      const tw = .55 + .45 * Math.sin(t * (1.5 + hs(i, 5) * 2) + i), a = (.15 + .6 * hs(i, 6)) * tw * seg(t, .05 + hs(i, 7) * .6, .5 + hs(i, 7) * .6);
      x.fillStyle = "rgba(210,225,255," + a + ")"; x.fillRect(X, Y, r, r); }
    // luz detras del horizonte y atmosfera
    glow(W / 2, hy, W * .7, "21,105,255", .18 * seg(t, .3, 1.6) + .22 * rise);
    const at = eo(seg(t, .3, 1.8)), ag = x.createRadialGradient(pcx, pcy, R * .998, pcx, pcy, R * (1 + .045 * (mob ? .6 : 1)));
    ag.addColorStop(0, "rgba(77,141,255," + .55 * at + ")"); ag.addColorStop(.25, "rgba(21,105,255," + .22 * at + ")"); ag.addColorStop(1, "rgba(21,105,255,0)");
    x.fillStyle = ag; x.fillRect(0, 0, W, H);
    const fl = pk(t, 2.05, .75); glow(W / 2, hy, W * .22, "200,225,255", .3 * fl);
    // el logo sale por el horizonte; al final crece hasta llenar la pantalla
    const sol = () => { glow(W / 2, ly0, sz * 2.6 * (1 + z), "77,141,255", (.35 * rise + .25 * crest) * (1 - z * .6));
      logo(W / 2, ly0, sz * (1 + z * 26), seg(t, 1.2, 1.6), eio(seg(t, 1.9, 2.8))); };
    if (z <= 0) sol();
    // el planeta tapa lo que queda por debajo del horizonte
    const pl = x.createRadialGradient(pcx, pcy, R * .9, pcx, pcy, R); pl.addColorStop(0, "#020306"); pl.addColorStop(1, "#060b16");
    x.fillStyle = pl; x.beginPath(); x.arc(pcx, pcy, R, 0, TAU); x.fill();
    const rim = x.createLinearGradient(0, 0, W, 0), ra = .9 * at; rim.addColorStop(0, "rgba(160,200,255,0)"); rim.addColorStop(.5, "rgba(200,225,255," + ra + ")"); rim.addColorStop(1, "rgba(160,200,255,0)");
    x.lineWidth = 1.6; x.strokeStyle = rim; x.beginPath(); x.arc(pcx, pcy, R, 0, TAU); x.stroke();
    // destello horizontal cuando el logo cruza el horizonte
    if (fl > 0) { const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, "rgba(120,170,255,0)"); g.addColorStop(.5, "rgba(230,240,255," + .9 * fl + ")"); g.addColorStop(1, "rgba(120,170,255,0)");
      x.fillStyle = g; x.fillRect(0, hy - 1.5, W, 3); }
    glow(W / 2, hy + H * .04, W * .35, "21,105,255", .08 * rise);
    x.restore();
    if (z > 0) sol();
    if (z > .85) { x.fillStyle = "rgba(21,105,255," + seg(z, .85, 1) + ")"; x.fillRect(0, 0, W, H); }
    const vg = x.createRadialGradient(W / 2, H / 2, m * .25, W / 2, H / 2, Math.hypot(W, H) * .62); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0," + .5 * (1 - z) + ")");
    x.fillStyle = vg; x.fillRect(0, 0, W, H);
    // titulo sobre la superficie del planeta
    const out = 1 - seg(t, D - 1.5, D - 1.15);
    k.style.top = (hy + (mob ? 34 : 44)) + "px"; h.style.top = (hy + (mob ? 64 : 76)) + "px"; s.style.top = (hy + (mob ? 64 : 76) + h.offsetHeight + (mob ? 14 : 20)) + "px";
    fx(k, seg(t, 2.55, 3.0) * out, 10); fx(h, seg(t, 2.7, 3.35) * out, 18, 10); fx(s, seg(t, 2.95, 3.5) * out, 12);
    // marco: marca arriba, carga y "Saltar" abajo
    const fo = 1 - seg(t, D - 1.05, D - .7); top.style.opacity = seg(t, .15, .7) * fo; bot.style.opacity = seg(t, .25, .8) * fo;
    const kb = eo(seg(t, .25, D - 1.1)); barI.style.transform = "scaleX(" + kb + ")"; pc.textContent = Math.round(kb * 100) + "%";
    // salida: la capa se funde con la portada
    const e = eio(seg(t, D - .55, D)); capa.style.opacity = 1 - e;
  }

  if (SHOT) { window.setT = render; render(0); (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(() => { render(0); document.body.dataset.ok = 1; }, 120)); return; }

  let t0 = null, fin = false, raf = 0;
  const cierra = rapido => { if (fin) return; fin = true; cancelAnimationFrame(raf); ["click", "keydown", "wheel", "touchstart"].forEach(ev => removeEventListener(ev, salta, true)); acabar(rapido); };
  function salta(e) { if (e.type === "keydown" && (e.metaKey || e.ctrlKey || e.altKey)) return; capa.style.transition = "opacity .45s ease"; capa.style.opacity = 0; cierra(true); }
  ["click", "keydown", "wheel", "touchstart"].forEach(ev => addEventListener(ev, salta, { capture: true, passive: true }));
  function loop(now) { if (fin) return; if (t0 === null) t0 = now; const t = (now - t0) / 1000; render(Math.min(t, D)); if (t >= D) { cierra(false); return; } raf = requestAnimationFrame(loop); }
  const go = () => { render(0); raf = requestAnimationFrame(loop); };
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 600))]).then(go); else go();
})();
