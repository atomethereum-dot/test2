/* ---- Sectora Staking: la intro, la rejilla de la portada y los margenes.
   Todo sale de index.html de la web principal, con un solo cambio: al
   salir de la intro, en vez de deshacerse en celdas, la camara entra por
   el aro y la pagina aparece por su centro (zoom). ---- */

/* ===== intro =====
   Del mismo taller que la de la portada (campo azul, rejilla, marco de
   registro, haz de escaneo, registro de arranque) pero con su propia
   pieza: un dial de 60 marcas, una por segundo, que se va encendiendo
   mientras el contador del centro sube hasta el APY. Al completarse la
   vuelta las marcas se funden en el aro de la marca, las escuadras lo
   enganchan y la camara entra por el aro: la pagina aparece por su
   centro, como por un ojo de buey. */
(function () {
  const el = document.getElementById("intro");
  const cv = document.getElementById("intro-grid");
  const apyEl = document.getElementById("intro-apy");
  const numEl = document.getElementById("intro-num");
  const word = document.getElementById("intro-word");
  const est = document.getElementById("intro-state");
  const pctE = document.getElementById("intro-pct");
  const fill = document.getElementById("intro-fill");
  const stage = document.getElementById("stage");

  let listo;
  window.SECT_INTRO = new Promise((r) => { listo = r; });
  if (!el || !cv) { if (el) el.remove(); listo(); return; }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.remove(); listo(); return; }

  let corto = false;
  try { corto = sessionStorage.getItem("sect_stk_intro") === "1"; } catch (e) {}
  const F = corto ? 0.45 : 1;
  const APY = 14.9;

  const T_SWEEP = 600 * F;
  const T0_TICK = 220 * F, T_TICK = 1300 * F;        // la vuelta del dial
  const T0_FUSE = T0_TICK + T_TICK, T_FUSE = 440 * F; // las marcas se funden en el aro
  const T0_HOLD = T0_FUSE + T_FUSE, T_HOLD = 420 * F;
  const T_TOTAL = T0_HOLD + T_HOLD;
  const T_EXIT = 1250 * (corto ? 0.8 : 1);

  const AZUL = "#1569ff";
  const CIAN = "52,231,255";
  const VIOL = "168,85,247";
  const SCAN_T = 1730;
  const scanY = (t) => H * 1.12 - ((t % SCAN_T) / SCAN_T) * (H * 1.24);

  document.documentElement.classList.add("intro-lock");
  document.body.classList.add("intro-lock");
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  const ctx = cv.getContext("2d");
  let W = 0, H = 0, CELL = 40, celdas = [], R = 0, SW = 0, cxG = 0, cyG = 0, MONO = "";
  function medir() {
    W = window.innerWidth; H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, W < 900 ? 1.5 : 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CELL = W < 700 ? 26 : 40;
    const vmin = Math.min(W, H);
    R = vmin * 0.24;            // el aro de la portada: 54.5vmin con r=44 sobre 100
    SW = vmin * 0.0538;         // y su trazo
    cxG = W / 2; cyG = H / 2;
    MONO = "500 " + (W < 700 ? 8.5 : 9.5) + "px 'IBM Plex Mono', monospace";
    const nX = Math.ceil(W / CELL / 2) + 2, nY = Math.ceil(H / CELL / 2) + 2;
    const diag = nX * 2 + nY * 2 || 1;
    celdas = [];
    for (let j = -nY; j < nY; j++) {
      for (let i = -nX; i < nX; i++) {
        const x = cxG + i * CELL, y = cyG + j * CELL;
        if (x > W || y > H || x < -CELL || y < -CELL) continue;
        const dx = (i + 0.5) * CELL, dy = (j + 0.5) * CELL, d = Math.hypot(dx, dy);
        if (d < R * 1.25) continue;      // el centro queda limpio para el dial
        const sem = Math.abs((Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1);
        celdas.push({ x, y, cx: x + CELL / 2, cy: y + CELL / 2, rad: d, sem, diag: ((i + nX) + (j + nY)) / diag });
      }
    }
  }
  const cl = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
  const sw = (t) => { t = cl(t); return t * t * (3 - 2 * t); };
  const io = (t) => { t = cl(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const out = (t) => { t = cl(t); return 1 - Math.pow(1 - t, 3); };
  const ang = (i) => -Math.PI / 2 + (i / 60) * Math.PI * 2;

  function escuadras(half, L, alfa) {
    ctx.save();
    ctx.shadowColor = "rgba(" + CIAN + ",.9)"; ctx.shadowBlur = 12;
    ctx.strokeStyle = "rgba(255,255,255," + alfa.toFixed(3) + ")"; ctx.lineWidth = 1.4;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const x = cxG + sx * half, y = cyG + sy * half;
      ctx.beginPath(); ctx.moveTo(x, y + sy * -L); ctx.lineTo(x, y); ctx.lineTo(x + sx * -L, y); ctx.stroke();
    }
    ctx.restore();
  }

  function pintar(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = AZUL; ctx.fillRect(0, 0, W, H);
    const pS = cl(t / T_SWEEP);
    const pT = cl((t - T0_TICK) / T_TICK);
    const pF = cl((t - T0_FUSE) / T_FUSE);
    const pH = cl((t - T0_HOLD) / T_HOLD);
    const vuelta = io(pT);                      // fraccion del dial encendida
    const sy = scanY(t), ALC = CELL * 2.4;

    // rejilla de fondo: barrido diagonal y el haz que la recorre, apagandose al fundir
    const apaga = sw(pF);
    for (let k = 0; k < celdas.length; k++) {
      const q = celdas[k];
      const kk = (pS - q.diag * 0.82 + q.sem * 0.06) / 0.16;
      const base = kk > 0 ? Math.max(0, (1 - Math.abs(kk - 1)) * 0.2) : 0;
      const db = Math.abs(q.cy - sy);
      const luz = db < ALC ? (1 - db / ALC) * 0.26 : 0;
      const a = (base + luz) * (1 - apaga * 0.85);
      if (a < 0.012) continue;
      if (q.sem > 0.94) {
        ctx.font = MONO; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(" + CIAN + "," + Math.min(1, a * 3).toFixed(3) + ")";
        ctx.fillText(((q.sem * 65535) | 0).toString(16).toUpperCase().padStart(4, "0"), q.cx, q.cy);
      } else {
        ctx.fillStyle = "rgba(255,255,255," + a.toFixed(3) + ")";
        ctx.fillRect(q.x, q.y, CELL - 1, CELL - 1);
      }
    }

    // halo cian del dial
    const apar = sw(cl(t / (T0_TICK + 300 * F)));
    {
      const g2 = ctx.createRadialGradient(cxG, cyG, R * 0.52, cxG, cyG, R * 1.58);
      const f = apar * (0.6 + 0.4 * pF);
      g2.addColorStop(0, "rgba(" + CIAN + ",0)");
      g2.addColorStop(0.34, "rgba(" + CIAN + "," + (f * 0.14).toFixed(3) + ")");
      g2.addColorStop(0.47, "rgba(" + CIAN + "," + (f * 0.36).toFixed(3) + ")");
      g2.addColorStop(0.6, "rgba(" + CIAN + "," + (f * 0.14).toFixed(3) + ")");
      g2.addColorStop(1, "rgba(" + CIAN + ",0)");
      ctx.fillStyle = g2; ctx.fillRect(cxG - R * 1.6, cyG - R * 1.6, R * 3.2, R * 3.2);
    }

    // estela del barrido: un abanico tenue detras de la aguja
    if (pT > 0 && pT < 1) {
      const a1 = ang(0) + vuelta * Math.PI * 2;
      const g = ctx.createConicGradient ? ctx.createConicGradient(a1 - 0.9, cxG, cyG) : null;
      if (g) {
        g.addColorStop(0, "rgba(" + CIAN + ",0)");
        g.addColorStop(0.143, "rgba(" + CIAN + ",.16)");
        g.addColorStop(0.1431, "rgba(" + CIAN + ",0)");
        g.addColorStop(1, "rgba(" + CIAN + ",0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cxG, cyG, R * 1.12, 0, Math.PI * 2); ctx.fill();
      }
    }

    // las 60 marcas: cada una es un segundo
    const largoMax = SW * 1.35, largoMin = SW * 0.8;
    const fundir = io(pF);
    for (let i = 0; i < 60; i++) {
      const a = ang(i);
      const enc = vuelta * 60 - i;            // >0 ya encendida
      const grande = i % 5 === 0;
      let L = grande ? largoMax : largoMin;
      let alfa = apar * 0.2;
      if (enc > 0) alfa = Math.min(1, 0.55 + enc * 0.45);
      // al fundir: todas crecen hacia el grosor del aro y se apagan bajo el trazo continuo
      L = L * (1 - fundir) + SW * fundir;
      alfa *= 1 - fundir;
      if (alfa < 0.01) continue;
      const ancho = Math.max(1.5, (grande ? 0.012 : 0.0075) * Math.min(W, H));
      const r1 = R - L / 2, r2 = R + L / 2;
      ctx.save();
      const lider = enc > 0 && enc < 1.6 && pT < 1;
      if (lider) { ctx.shadowColor = "rgba(" + CIAN + ",1)"; ctx.shadowBlur = 16; }
      ctx.strokeStyle = lider ? "rgba(" + CIAN + ",1)" : "rgba(255,255,255," + alfa.toFixed(3) + ")";
      ctx.lineWidth = ancho; ctx.lineCap = "butt";
      ctx.beginPath();
      ctx.moveTo(cxG + Math.cos(a) * r1, cyG + Math.sin(a) * r1);
      ctx.lineTo(cxG + Math.cos(a) * r2, cyG + Math.sin(a) * r2);
      ctx.stroke();
      ctx.restore();
    }
    // la aguja que barre el dial
    if (pT > 0 && pT < 1) {
      const a = ang(0) + vuelta * Math.PI * 2;
      ctx.save();
      ctx.shadowColor = "rgba(" + CIAN + ",1)"; ctx.shadowBlur = 12;
      ctx.strokeStyle = "rgba(" + CIAN + ",.85)"; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cxG + Math.cos(a) * R * 0.62, cyG + Math.sin(a) * R * 0.62);
      ctx.lineTo(cxG + Math.cos(a) * (R + largoMax), cyG + Math.sin(a) * (R + largoMax));
      ctx.stroke(); ctx.restore();
    }
    // el aro continuo de la marca, naciendo de las marcas fundidas
    if (pF > 0) {
      ctx.save();
      ctx.shadowColor = "rgba(" + CIAN + ",.9)"; ctx.shadowBlur = 20 * fundir;
      ctx.strokeStyle = "rgba(255,255,255," + fundir.toFixed(3) + ")";
      ctx.lineWidth = SW * (0.55 + 0.45 * fundir);
      ctx.beginPath(); ctx.arc(cxG, cyG, R, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      // ondas y escuadras del enganche
      for (let n = 0; n < 2; n++) {
        const o = cl((pF - n * 0.16) / 0.7);
        if (o <= 0 || o >= 1) continue;
        ctx.save();
        ctx.shadowColor = "rgba(" + CIAN + ",.9)"; ctx.shadowBlur = 18 * (1 - o);
        ctx.strokeStyle = n === 0 ? "rgba(255,255,255," + ((1 - o) * 0.55).toFixed(3) + ")" : "rgba(" + VIOL + "," + ((1 - o) * 0.4).toFixed(3) + ")";
        ctx.lineWidth = 2 * (1 - o) + 0.4;
        ctx.beginPath(); ctx.arc(cxG, cyG, R * (1 + o * 1.7), 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      escuadras(R * (2.5 - 1.08 * out(pF)), R * 0.3, Math.min(1, pF * 2.4) * 0.95);
      if (pF > 0.06 && pF < 0.14) {
        ctx.save(); ctx.globalCompositeOperation = "difference"; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H); ctx.restore();
      }
    }
    if (pH > 0) {
      const gir = (t / 1100) % 1, rr = R * 1.17;
      ctx.save();
      ctx.shadowColor = "rgba(" + CIAN + ",1)"; ctx.shadowBlur = 14;
      ctx.strokeStyle = "rgba(" + CIAN + ",.85)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(cxG, cyG, rr, gir * Math.PI * 2, gir * Math.PI * 2 + 0.5); ctx.stroke();
      ctx.restore();
      const o = sw(cl(pH / 0.7));
      ctx.font = MONO; ctx.textBaseline = "middle";
      ctx.strokeStyle = "rgba(255,255,255," + (o * 0.4).toFixed(3) + ")";
      ctx.fillStyle = "rgba(255,255,255," + (o * 0.75).toFixed(3) + ")";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cxG + R * 1.34, cyG); ctx.lineTo(cxG + R * 1.62, cyG); ctx.stroke();
      ctx.textAlign = "left"; ctx.fillText("60 / 60 S", cxG + R * 1.7, cyG);
      ctx.beginPath(); ctx.moveTo(cxG - R * 1.34, cyG); ctx.lineTo(cxG - R * 1.62, cyG); ctx.stroke();
      ctx.textAlign = "right"; ctx.fillText("EVERY 1S", cxG - R * 1.7, cyG);
    }
    // haz de escaneo
    if (sy > -60 && sy < H + 60) {
      const halo = CELL * 2.6;
      const g = ctx.createLinearGradient(0, sy - halo, 0, sy + halo);
      g.addColorStop(0, "rgba(" + CIAN + ",0)"); g.addColorStop(0.38, "rgba(" + CIAN + ",.18)");
      g.addColorStop(0.5, "rgba(" + CIAN + ",.40)"); g.addColorStop(0.62, "rgba(" + CIAN + ",.18)");
      g.addColorStop(1, "rgba(" + CIAN + ",0)");
      ctx.fillStyle = g; ctx.fillRect(0, sy - halo, W, halo * 2);
      ctx.save(); ctx.shadowColor = "rgba(" + CIAN + ",1)"; ctx.shadowBlur = 16;
      ctx.fillStyle = "rgba(235,252,255,.95)"; ctx.fillRect(0, sy - 1, W, 2); ctx.restore();
      ctx.fillStyle = "rgba(224,238,255,.9)"; ctx.fillRect(0, sy - 6, 2, 12); ctx.fillRect(W - 2, sy - 6, 2, 12);
    }

    // contador del centro: sube con el dial hasta el APY
    if (apyEl) {
      apyEl.style.opacity = apar.toFixed(3);
      apyEl.style.transform = "scale(" + (0.94 + 0.06 * apar).toFixed(4) + ")";
    }
    if (numEl) numEl.textContent = (APY * out(pT)).toFixed(1);
    if (word) {
      const wv = sw(cl((pF - 0.2) / 0.8));
      word.style.opacity = wv.toFixed(3);
      word.style.letterSpacing = (0.9 - 0.48 * wv).toFixed(3) + "em";
      word.style.transform = "translateX(-50%) translateY(" + ((1 - wv) * 8).toFixed(1) + "px)";
    }
  }

  /* salida: la camara entra por el aro. El aro crece con escala
     exponencial hasta que su hueco pasa de las esquinas; el azul lleva ese
     hueco recortado y la portada se ve por el desde el primer instante */
  function salir(k) {
    ctx.clearRect(0, 0, W, H);
    const e = io(k);
    const rIn = R - SW / 2;
    const z = Math.pow((Math.hypot(W, H) / 2) / rIn * 1.18, e);
    ctx.fillStyle = AZUL;
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(cxG, cyG, Math.max(0, rIn * z - 0.5), 0, Math.PI * 2, true); ctx.fill("evenodd");
    ctx.save();
    ctx.shadowColor = "rgba(" + CIAN + ",.9)"; ctx.shadowBlur = 22;
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = SW * z;
    ctx.beginPath(); ctx.arc(cxG, cyG, R * z, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    const fe = 1 - cl(k * 2.2);
    if (fe > 0.01) escuadras(R * 1.42 * z, R * 0.3 * Math.min(z, 3), fe * 0.95);
    if (stage) {
      stage.style.transform = "scale(" + (0.8 + 0.2 * out(k)).toFixed(4) + ")";
      stage.style.opacity = (0.35 + 0.65 * cl(k * 1.4)).toFixed(3);
    }
    if (apyEl) {
      apyEl.style.opacity = (1 - cl(k * 3.2)).toFixed(3);
      apyEl.style.transform = "scale(" + (1 + 0.6 * e).toFixed(4) + ")";
    }
  }

  let cargado = false;
  const fuentes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const pagina = document.readyState === "complete" ? Promise.resolve()
    : new Promise((r) => window.addEventListener("load", r, { once: true }));
  Promise.all([fuentes, pagina]).then(() => { cargado = true; });

  medir();
  window.addEventListener("resize", medir);

  const t0 = performance.now();
  let saliendo = false, tSal = 0, estado = 0, preparado = false;
  function rotulo(txt) { if (est && est.lastChild) est.lastChild.nodeValue = txt; }
  const logEls = [...document.querySelectorAll("#intro-log span")];
  const logT = [T_SWEEP * 0.4, T0_TICK + T_TICK * 0.3, T0_TICK + T_TICK * 0.75, T0_FUSE + T_FUSE * 0.4];
  let logN = 0;

  function ciclo(now) {
    const t = now - t0;
    if (!saliendo) {
      pintar(t);
      const porTiempo = cl(t / T_TOTAL);
      const p = cargado ? porTiempo : Math.min(porTiempo, 0.96);
      if (pctE) pctE.textContent = String(Math.round(p * 100)).padStart(2, "0");
      if (fill) fill.style.transform = "scaleX(" + p.toFixed(4) + ")";
      while (logN < logEls.length && t > logT[logN]) { logEls[logN].classList.add("on"); logN++; }
      if (estado === 0 && t > T0_TICK) { estado = 1; rotulo("Counting"); }
      if (estado === 1 && t > T0_FUSE) { estado = 2; rotulo("Signal locked"); }
      if (estado === 2 && p >= 1) { estado = 3; rotulo("Ready"); if (est) est.classList.add("ok"); }
      if ((t >= T_TOTAL && cargado) || t > 6600) { saliendo = true; tSal = now; }
    } else {
      if (!preparado) {
        preparado = true;
        el.style.background = "transparent";
        if (typeof window.SECT_IGNITE === "function") window.SECT_IGNITE();
        listo();
      }
      const k = cl((now - tSal) / T_EXIT);
      salir(k);
      if (word) word.style.opacity = (1 - cl(k * 2.6)).toFixed(3);
      const fr = el.querySelector(".intro-frame"), hu = el.querySelector(".intro-hud");
      if (fr) fr.style.opacity = (1 - cl(k * 2.0)).toFixed(3);
      if (hu) hu.style.opacity = (1 - cl(k * 2.0)).toFixed(3);
      if (k >= 1) { fin(); return; }
    }
    requestAnimationFrame(ciclo);
  }

  function fin() {
    document.documentElement.classList.remove("intro-lock");
    document.body.classList.remove("intro-lock");
    if (stage) { stage.style.transform = ""; stage.style.opacity = ""; }
    el.remove();
    try { sessionStorage.setItem("sect_stk_intro", "1"); } catch (e) {}
    listo();
    if (location.hash && location.hash.length > 1) {
      const d = document.querySelector(location.hash);
      if (d) setTimeout(() => d.scrollIntoView({ behavior: "smooth" }), 250);
    }
  }
  setTimeout(() => { if (document.getElementById("intro") && document.visibilityState === "visible" && !saliendo) { saliendo = true; tSal = performance.now(); } }, 9000);
  requestAnimationFrame(ciclo);
})();

/* ===== portada: titular, entrada, progreso y altura de la cabecera ===== */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let hecho = false;
  function play() {
    if (hecho) return;
    hecho = true;
    requestAnimationFrame(() => document.body.classList.add("played"));
  }
  const arranque = window.SECT_INTRO || Promise.resolve();
  const fuentes = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.all([fuentes, arranque]).then(play);
  setTimeout(play, 7500);
  if (reduce) play();

  const bar = document.getElementById("progress");
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const head = document.querySelector(".top");
  function measureHead() { if (head) document.documentElement.style.setProperty("--head-h", head.offsetHeight + "px"); }
  measureHead();
  window.addEventListener("resize", measureHead);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureHead);
})();

/* ===== rejilla del hero: la de la portada, con sus celdas azules ===== */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("grid");
  const stage = document.getElementById("stage");
  if (!canvas || !stage) return;
  const ctx = canvas.getContext("2d");
  const CELL = 54;
  let cols = 0, rows = 0, heat = null, tone = null, W = 0, H = 0, dpr = 1;
  const lineLayer = document.createElement("canvas");
  const lctx = lineLayer.getContext("2d");

  function paintLines() {
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lctx.clearRect(0, 0, W, H);
    lctx.lineWidth = 1;
    lctx.strokeStyle = "rgba(255,255,255,.034)";
    lctx.beginPath();
    for (let c = 0; c <= cols; c++) { lctx.moveTo(c * CELL + 0.5, 0); lctx.lineTo(c * CELL + 0.5, H); }
    for (let r = 0; r <= rows; r++) { lctx.moveTo(0, r * CELL + 0.5); lctx.lineTo(W, r * CELL + 0.5); }
    lctx.stroke();
  }
  function rnd(c, r) { const x = Math.sin(c * 127.1 + r * 311.7) * 43758.5453; return x - Math.floor(x); }
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (w < 1 || h < 1) return;
    W = w; H = h;
    dpr = Math.min(window.devicePixelRatio || 1, W < 900 ? 1.5 : 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / CELL); rows = Math.ceil(H / CELL);
    heat = new Float32Array(cols * rows);
    tone = new Float32Array(cols * rows);
    for (let i = 0; i < tone.length; i++) tone[i] = rnd(i % cols, (i / cols) | 0);
    lineLayer.width = W * dpr; lineLayer.height = H * dpr;
    paintLines();
    seedWalkers();
  }
  const idx = (c, r) => r * cols + c;

  let walkers = [];
  function seedWalkers() {
    const n = W < 700 ? 4 : 7;
    walkers = [];
    for (let i = 0; i < n; i++) walkers.push({ c: (Math.random() * cols) | 0, r: (Math.random() * rows) | 0, dc: Math.random() < 0.5 ? 1 : -1, dr: 0, next: 0 });
  }
  function stepWalkers(t, fast) {
    for (const w of walkers) {
      if (t < w.next) continue;
      w.next = t + (fast ? 60 + Math.random() * 60 : 105 + Math.random() * 130);
      if (Math.random() < 0.3) {
        if (w.dc !== 0) { w.dr = Math.random() < 0.5 ? 1 : -1; w.dc = 0; }
        else { w.dc = Math.random() < 0.5 ? 1 : -1; w.dr = 0; }
      }
      w.c += w.dc; w.r += w.dr;
      if (w.c < 0) { w.c = 0; w.dc = 1; }
      if (w.c >= cols) { w.c = cols - 1; w.dc = -1; }
      if (w.r < 0) { w.r = 0; w.dr = 1; }
      if (w.r >= rows) { w.r = rows - 1; w.dr = -1; }
      heat[idx(w.c, w.r)] = fast ? 0.8 : 0.5;
    }
  }
  let startT = 0;
  const INTRO_MS = 1150;
  function intro(t) {
    const e = t - startT;
    if (e > INTRO_MS) return;
    const p = e / INTRO_MS;
    const front = p * (cols + rows + 6);
    for (let r = 0; r < rows; r++) {
      const c0 = Math.round(front - r);
      for (let k = -2; k <= 2; k++) {
        const c = c0 + k;
        if (c >= 0 && c < cols) {
          const v = (1 - Math.abs(k) / 2.7) * (1 - p * 0.3), i = idx(c, r);
          if (heat[i] < v) heat[i] = v;
        }
      }
    }
  }
  let nextPop = 0;
  function pops(t) {
    if (t < nextPop) return;
    nextPop = t + 80 + Math.random() * 90;
    const n = 2 + ((Math.random() * 3) | 0);
    for (let k = 0; k < n; k++) {
      const i = idx((Math.random() * cols) | 0, (Math.random() * rows) | 0);
      const v = 0.55 + Math.random() * 0.4;
      if (heat[i] < v) heat[i] = v;
    }
  }
  let sweepStart = -1;
  const SWEEP_MS = 1900, SWEEP_GAP = 6500;
  function sweep(t) {
    const phase = t - sweepStart;
    if (phase < 0) return;
    if (phase > SWEEP_MS) { sweepStart = t + SWEEP_GAP; return; }
    const front = (phase / SWEEP_MS) * (cols + rows);
    for (let r = 0; r < rows; r++) {
      const c0 = Math.round(front - r);
      for (let k = -1; k <= 1; k++) {
        const c = c0 + k;
        if (c >= 0 && c < cols) {
          const v = 0.34 * (1 - Math.abs(k) / 1.6), i = idx(c, r);
          if (heat[i] < v) heat[i] = v;
        }
      }
    }
  }

  window.addEventListener("pointermove", (e) => {
    if (!heat || reduce) return;
    const rect = canvas.getBoundingClientRect();
    const c = ((e.clientX - rect.left) / CELL) | 0, r = ((e.clientY - rect.top) / CELL) | 0;
    if (c >= 0 && r >= 0 && c < cols && r < rows && e.clientY >= rect.top && e.clientY <= rect.bottom) heat[idx(c, r)] = 1;
  }, { passive: true });

  function draw() {
    if (!heat) return;
    ctx.clearRect(0, 0, W, H);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = idx(c, r), v = heat[i];
        if (v > 0.015) {
          const g = tone[i];
          const R = (12 + 62 * g) | 0, G = (74 + 96 * g) | 0, B = (198 + 57 * g) | 0;
          ctx.fillStyle = "rgba(" + R + "," + G + "," + B + "," + (Math.min(v, 1) * 0.82).toFixed(3) + ")";
          ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        }
      }
    }
    if (lineLayer.width > 1) ctx.drawImage(lineLayer, 0, 0, W, H);
  }

  // la intro llama a esto al abrirse: frente circular desde el centro
  let ignicion = -1;
  window.SECT_IGNITE = () => { ignicion = performance.now(); startT = 0; sweepStart = -1; };

  let last = 0, tabVisible = true, heroVisible = true;
  document.addEventListener("visibilitychange", () => { tabVisible = !document.hidden; });
  new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; }, { rootMargin: "10% 0px" }).observe(stage);

  function frame(t) {
    requestAnimationFrame(frame);
    if (!tabVisible || !heroVisible) { last = t; return; }
    if (!lineLayer.width) { resize(); if (!lineLayer.width) { last = t; return; } }
    const dt = Math.min(t - last, 50); last = t;
    if (!startT) { startT = t; sweepStart = t + INTRO_MS + 4500; }
    const intoIntro = t - startT < INTRO_MS;
    intro(t);
    if (ignicion > 0) {
      const e = (performance.now() - ignicion) / 620;
      if (e >= 1.2) ignicion = -1;
      else {
        const ccx = W / 2 / CELL, ccy = H / 2 / CELL;
        const frente = e * (Math.hypot(cols, rows) * 0.62);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const v = 1 - Math.abs(Math.hypot(c - ccx, r - ccy) - frente) / 1.6;
            if (v > 0) { const i = idx(c, r), a = v * (1 - e * 0.55); if (heat[i] < a) heat[i] = a; }
          }
        }
      }
    }
    stepWalkers(t, intoIntro);
    if (!intoIntro) pops(t);
    sweep(t);
    const decay = Math.pow(intoIntro ? 0.915 : 0.922, dt / 16.7);
    for (let i = 0; i < heat.length; i++) heat[i] *= decay;
    draw();
  }
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
  resize();
  if (reduce) draw(); else requestAnimationFrame(frame);
})();

/* ===== cursor de coordenadas en todo el documento: se ancla a la celda
   de 54px y cambia de tono sobre las hojas claras ===== */
(function () {
  const reticle = document.getElementById("reticle"), readout = document.getElementById("readout");
  if (!reticle || !readout) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rx = reticle.querySelector(".rx"), ry = reticle.querySelector(".ry");
  const CELL = 54;
  let claro = false, ultimaLum = 0;
  function fondoClaro(x, y) {
    if (performance.now() - ultimaLum < 140) return claro;
    ultimaLum = performance.now();
    let el = document.elementFromPoint(x, y), n = 0;
    while (el && n < 8) {
      const bg = getComputedStyle(el).backgroundColor;
      const m = bg && bg.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const v = m[1].split(",").map(parseFloat);
        if ((v.length > 3 ? v[3] : 1) > 0.35) { claro = (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255 > 0.5; return claro; }
      }
      // las hojas claras pintan su papel con un degradado, no con color
      if (el.classList && el.classList.contains("paper")) { claro = true; return claro; }
      el = el.parentElement; n++;
    }
    return claro;
  }
  window.addEventListener("pointermove", (e) => {
    const gx = Math.floor((e.clientX + window.scrollX) / CELL) * CELL - window.scrollX;
    const gy = Math.floor((e.clientY + window.scrollY) / CELL) * CELL - window.scrollY;
    const cc = Math.floor((e.clientX + window.scrollX) / CELL), cr = Math.floor((e.clientY + window.scrollY) / CELL);
    readout.style.transform = "translate3d(" + gx + "px," + gy + "px,0)";
    readout.textContent = String(Math.abs(cc) % 100).padStart(2, "0") + " · " + String(Math.abs(cr) % 100).padStart(2, "0");
    rx.style.transform = "translate3d(0," + gy + "px,0)";
    ry.style.transform = "translate3d(" + gx + "px,0,0)";
    reticle.classList.add("on"); readout.classList.add("on");
    const c2 = fondoClaro(e.clientX, e.clientY);
    reticle.classList.toggle("on-light", c2); readout.classList.toggle("on-light", c2);
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => { reticle.classList.remove("on"); readout.classList.remove("on"); });
})();

/* ===== margenes de las hojas claras: la regla mide donde estas dentro de
   la seccion, la luz sigue al puntero y el titular sube al entrar ===== */
(function () {
  const reglas = [...document.querySelectorAll(".gauge")].map((el) => ({ el, u: el.querySelector("u"), sec: el.parentElement }));
  let pend = false;
  function medir() {
    pend = false;
    const vh = innerHeight;
    for (const r of reglas) {
      const c = r.sec.getBoundingClientRect();
      const dentro = c.top < vh * 0.5 && c.bottom > vh * 0.5;
      r.el.classList.toggle("on", dentro);
      if (!dentro) continue;
      const p = Math.max(0, Math.min(1, (vh - c.top) / (vh + c.height)));
      r.u.style.transform = "translateY(" + (p * c.height).toFixed(1) + "px)";
    }
  }
  addEventListener("scroll", () => { if (!pend) { pend = true; requestAnimationFrame(medir); } }, { passive: true });
  addEventListener("resize", () => { if (!pend) { pend = true; requestAnimationFrame(medir); } }, { passive: true });
  medir();

  if (matchMedia("(hover:hover)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    const luces = [...document.querySelectorAll(".lux")].map((el) => ({ el, host: el.parentElement, x: 0, y: 0, on: false }));
    let p2 = false;
    const pintar = () => {
      p2 = false;
      for (const l of luces) {
        l.el.style.transform = "translate3d(" + l.x.toFixed(1) + "px," + l.y.toFixed(1) + "px,0)";
        l.el.classList.toggle("on", l.on);
      }
    };
    addEventListener("pointermove", (e) => {
      for (const l of luces) {
        const c = l.host.getBoundingClientRect();
        l.on = e.clientY >= c.top && e.clientY <= c.bottom;
        if (l.on) { l.x = e.clientX - c.left; l.y = e.clientY - c.top; }
      }
      if (!p2) { p2 = true; requestAnimationFrame(pintar); }
    }, { passive: true });
  }

  const secs = document.querySelectorAll(".paper");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
    }, { threshold: 0.12 });
    secs.forEach((s) => io.observe(s));
  } else secs.forEach((s) => s.classList.add("on"));
})();

/* ===== ojo de buey: el circulo se abre con el scroll =====
   El motor del iris de la portada, para cada transicion. La escena queda
   fija mientras dura su recorrido; el circulo crece del centro hasta
   cubrir la pantalla con el fondo de la seccion que viene. Las celdas
   azules se simulan una sola vez por escena y se pintan en los dos
   lienzos (el de fuera y el de dentro del circulo), asi coinciden a
   ambos lados del filo. */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const escenas = [...document.querySelectorAll(".port")].map((sec) => {
    const lienzos = sec.querySelectorAll(".port-cells");
    return {
      sec, pin: sec.querySelector(".port-pin"),
      panel: sec.querySelector(".port-panel"), edge: sec.querySelector(".port-edge"),
      cue: sec.querySelector(".zoom-cue"),
      oscuraFuera: sec.classList.contains("to-light"),
      fuera: lienzos[0], dentro: lienzos[1], heat: null, cols: 0, rows: 0, W: 0, H: 0,
      walkers: [], nextPop: 0, visible: false,
    };
  });
  if (!escenas.length) return;

  let cola = false;
  function pintar() {
    cola = false;
    const vh = window.innerHeight, maxR = Math.hypot(window.innerWidth, vh) * 0.58;
    for (const e of escenas) {
      const r = e.sec.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      const span = r.height - vh;
      if (span <= 0) { e.panel.style.clipPath = "none"; continue; }
      const p = Math.max(0, Math.min(1, -r.top / span));
      let k = (p - 0.08) / 0.78;
      k = k < 0 ? 0 : k > 1 ? 1 : k;
      k = k * k * (3 - 2 * k);
      const rad = k * maxR;
      e.panel.style.clipPath = "circle(" + rad.toFixed(1) + "px at 50% 50%)";
      const d = (rad * 2).toFixed(1);
      e.edge.style.width = d + "px"; e.edge.style.height = d + "px";
      e.edge.style.opacity = k > 0.004 && k < 0.985 ? "1" : "0";
      if (e.cue) e.cue.classList.toggle("off", p > 0.9);
    }
  }
  const pedir = () => { if (!cola) { cola = true; requestAnimationFrame(pintar); } };
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  pintar();

  // ---- celdas ----
  const CELL = 54;
  function medir(e) {
    const w = e.pin.clientWidth, h = e.pin.clientHeight;
    if (w < 1 || h < 1) return;
    e.W = w; e.H = h;
    const dpr = Math.min(window.devicePixelRatio || 1, w < 900 ? 1.5 : 2);
    for (const c of [e.fuera, e.dentro]) {
      c.width = w * dpr; c.height = h * dpr;
      c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    e.cols = Math.ceil(w / CELL); e.rows = Math.ceil(h / CELL);
    e.heat = new Float32Array(e.cols * e.rows);
    e.walkers = [];
    for (let i = 0; i < (w < 700 ? 3 : 6); i++) e.walkers.push({ c: (Math.random() * e.cols) | 0, r: (Math.random() * e.rows) | 0, dc: Math.random() < 0.5 ? 1 : -1, dr: 0, next: 0 });
  }
  function paso(e, t, dt) {
    const idx = (c, r) => r * e.cols + c;
    for (const w of e.walkers) {
      if (t < w.next) continue;
      w.next = t + 120 + Math.random() * 150;
      if (Math.random() < 0.3) {
        if (w.dc !== 0) { w.dr = Math.random() < 0.5 ? 1 : -1; w.dc = 0; } else { w.dc = Math.random() < 0.5 ? 1 : -1; w.dr = 0; }
      }
      w.c += w.dc; w.r += w.dr;
      if (w.c < 0) { w.c = 0; w.dc = 1; } if (w.c >= e.cols) { w.c = e.cols - 1; w.dc = -1; }
      if (w.r < 0) { w.r = 0; w.dr = 1; } if (w.r >= e.rows) { w.r = e.rows - 1; w.dr = -1; }
      e.heat[idx(w.c, w.r)] = 0.62;
    }
    if (t >= e.nextPop) {
      e.nextPop = t + 95 + Math.random() * 110;
      for (let k = 0; k < 2 + ((Math.random() * 3) | 0); k++) {
        const i = idx((Math.random() * e.cols) | 0, (Math.random() * e.rows) | 0), v = 0.5 + Math.random() * 0.4;
        if (e.heat[i] < v) e.heat[i] = v;
      }
    }
    const decay = Math.pow(0.93, dt / 16.7);
    for (let i = 0; i < e.heat.length; i++) e.heat[i] *= decay;
  }
  function dibujar(e) {
    const a = e.fuera.getContext("2d"), b = e.dentro.getContext("2d");
    a.clearRect(0, 0, e.W, e.H); b.clearRect(0, 0, e.W, e.H);
    // en la parte oscura las celdas son azul vivo; en la clara, un azul tenue
    const oscuro = (v) => "rgba(21,105,255," + (Math.min(v, 1) * 0.85).toFixed(3) + ")";
    const claro = (v) => "rgba(13,63,216," + (Math.min(v, 1) * 0.3).toFixed(3) + ")";
    for (let r = 0; r < e.rows; r++) {
      for (let c = 0; c < e.cols; c++) {
        const v = e.heat[r * e.cols + c];
        if (v <= 0.015) continue;
        a.fillStyle = e.oscuraFuera ? oscuro(v) : claro(v);
        b.fillStyle = e.oscuraFuera ? claro(v) : oscuro(v);
        a.fillRect(c * CELL, r * CELL, CELL, CELL);
        b.fillRect(c * CELL, r * CELL, CELL, CELL);
      }
    }
  }
  escenas.forEach((e) => {
    medir(e);
    new IntersectionObserver((es) => { e.visible = es[0].isIntersecting; }).observe(e.sec);
  });
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => escenas.forEach(medir), 120); });
  if (reduce) { escenas.forEach(dibujar); return; }
  let last = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    const dt = Math.min(t - last, 50); last = t;
    if (document.hidden) return;
    for (const e of escenas) {
      if (!e.visible || !e.heat) continue;
      paso(e, t, dt);
      dibujar(e);
    }
  }
  requestAnimationFrame(frame);
})();
