/* ---- Sectora Staking: la transicion de la portada a la guia (#curva).

   Al bajar se dibuja la recompensa acumulada de un ejemplo de 1.000 #SECT
   durante 12 meses, a la tasa que muestra la pagina (la del contrato en
   cuanto staking-chain.js la lee). Es una recta: el contrato no capitaliza,
   cada segundo paga lo mismo, y la grafica no debe sugerir otra cosa.

   Tramos del scroll (p de 0 a 1 mientras el bloque esta fijo):
     0.06 - 0.60  la linea avanza mes a mes con su punto vivo y su etiqueta
     0.60 - 0.68  quieta, completa
     0.66 - 0.86  el azul sube como una marea hasta cubrir la pantalla
     0.86 - 1     se queda en azul, el de la guia que viene detras

   El lienzo solo se repinta cuando cambia el avance, y la posicion sale de
   scrollY con la geometria medida al cargar y al cambiar de tamano. ---- */
(function () {
  "use strict";

  const sec = document.getElementById("curva");
  if (!sec) return;
  const $ = (id) => document.getElementById(id);
  const pin = sec.querySelector(".curva-pin");
  const cv = $("curva-cv");
  const ctx = cv.getContext("2d");
  const tip = $("curva-tip"), tipM = $("curva-tip-m"), tipV = $("curva-tip-v");
  const ganado = $("curva-ganado"), elDia = $("curva-dia"), elMes = $("curva-mes"), elAno = $("curva-ano");
  const st = $("curva-st"), fill = $("curva-fill"), pc = $("curva-pc"), pasoEl = $("curva-paso");
  const stats = sec.querySelector(".curva-stats"), hud = sec.querySelector(".curva-hud");
  const cue = $("curva-cue"), cueSub = $("curva-cue-sub");
  const quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const VERDE = "62,207,142";
  const DEPOSITO = 1000;
  const PASOS = ["Get #SECT and a little ETH", "Open sectoraorg.com/staking", "Connect your wallet", "Check you are on Ethereum",
    "Type the amount", "Approve the exact amount", "Confirm the deposit", "Claim or withdraw any time"];

  const clamp = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const suave = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const f2 = (v) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // la tasa de la pagina; staking.js la cambia en todas las .apy-n
  let ano = 149;
  function leerTasa() {
    const el = document.querySelector(".sheet .apy-n") || document.querySelector(".apy-n");
    const v = parseFloat(el && el.textContent);
    ano = DEPOSITO * (isFinite(v) ? v : 14.9) / 100;
    if (elDia) elDia.textContent = f2(ano / 365);
    if (elMes) elMes.textContent = f2(ano / 12);
    if (elAno) elAno.textContent = f2(ano);
  }
  leerTasa();
  window.addEventListener("sectora:apy", () => setTimeout(() => { leerTasa(); mesEjes = -1; ant = -1; pedir(); }, 0));

  // entrada del titular al asomar la seccion
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { sec.classList.add("on"); io.disconnect(); }
    }, { rootMargin: "0px 0px -30% 0px" });
    io.observe(sec);
  } else sec.classList.add("on");

  // ---------------------------------------------------------------
  // geometria
  // ---------------------------------------------------------------
  const ejesCv = $("curva-ejes"), ejes = ejesCv.getContext("2d"), marea = $("curva-marea");
  let top = 0, alto = 0, W = 0, H = 0, dpr = 1, movil = false;
  let x0 = 0, x1 = 0, y0 = 0, yT = 0, bx = 0, by = 0, mesEjes = -1;

  function medir() {
    const r = sec.getBoundingClientRect();
    top = r.top + window.scrollY;
    alto = sec.offsetHeight;
    const b = pin.getBoundingClientRect();
    W = Math.round(b.width); H = Math.round(b.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    movil = W <= 760;
    const pad = Math.min(72, Math.max(20, W * 0.044));
    x0 = pad + (movil ? 30 : 58);
    x1 = W - pad;
    y0 = H - (movil ? 84 : Math.max(96, H * 0.13));
    // la grafica empieza bajo el titular y las cifras, midiendo donde acaban de
    // verdad (en el movil cambian de sitio al mostrarse u ocultarse la barra
    // del navegador); en pantallas muy bajas se le guarda una altura minima
    // en telefonos muy bajos solo queda "Earned": la fila de cifras no cabe
    pin.classList.toggle("bajo", movil && H < 640);
    const arriba = sec.querySelector(".curva-top");
    const fondo = arriba ? arriba.offsetTop + arriba.offsetHeight : 0;
    yT = Math.max(H * (movil ? 0.5 : 0.47), fondo + (movil ? 56 : 48));
    yT = Math.min(yT, y0 - (movil ? 150 : 170));
    ejesCv.width = Math.round(W * dpr); ejesCv.height = Math.round(H * dpr);
    // el lienzo de la linea solo cubre la grafica (y el halo del punto)
    bx = Math.floor(x0 - 24); by = Math.floor(yT - 30);
    const bw = Math.ceil(x1 + 30 - bx), bh = Math.ceil(y0 + 8 - by);
    cv.width = Math.round(bw * dpr); cv.height = Math.round(bh * dpr);
    cv.style.width = bw + "px"; cv.style.height = bh + "px";
    cv.style.transform = "translate(" + bx + "px," + by + "px)";
    mesEjes = -1; ant = -1;
    pedir();
  }

  const X = (u) => x0 + (x1 - x0) * u;          // u: fraccion del ano
  const Y = (u) => y0 - (y0 - yT) * u;          // recta: lo ganado crece igual cada segundo
  const mono = (n) => n + "px 'IBM Plex Mono', monospace";

  // ejes, niveles, meses y la recta prevista: solo cambian al pasar de mes
  function pintarEjes(mes) {
    const c = ejes;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, ejesCv.width, ejesCv.height);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.lineWidth = 1;
    c.font = mono(movil ? 9 : 10); c.textAlign = "right"; c.textBaseline = "middle";
    for (let i = 0; i <= 4; i++) {
      const y = y0 - (y0 - yT) * i / 4;
      c.strokeStyle = i ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.22)";
      c.setLineDash(i ? [2, 6] : []);
      c.beginPath(); c.moveTo(x0, y + 0.5); c.lineTo(x1, y + 0.5); c.stroke();
      c.fillStyle = "rgba(255,255,255,.4)";
      c.fillText((i ? "+" : "") + Math.round(ano * i / 4), x0 - 12, y);
    }
    c.setLineDash([]);
    c.textAlign = "center"; c.textBaseline = "top";
    for (let m = 0; m <= 12; m++) {
      const x = X(m / 12), pasado = mes >= m;
      c.strokeStyle = pasado ? "rgba(255,255,255,.45)" : "rgba(255,255,255,.18)";
      c.beginPath(); c.moveTo(x + 0.5, y0); c.lineTo(x + 0.5, y0 + 6); c.stroke();
      if (!movil || m % 3 === 0) {
        c.fillStyle = pasado ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.3)";
        c.fillText(m ? "M" + String(m).padStart(2, "0") : "Start", x, y0 + 12);
      }
    }
    // hacia donde va: la recta completa en discontinuo; la linea la tapa al pasar
    c.strokeStyle = "rgba(255,255,255,.2)"; c.setLineDash([4, 7]);
    c.beginPath(); c.moveTo(X(0), Y(0)); c.lineTo(X(1), Y(1)); c.stroke(); c.setLineDash([]);
    c.fillStyle = "rgba(255,255,255,.4)"; c.textAlign = "right"; c.textBaseline = "bottom";
    c.fillText("+" + f2(ano) + " in 12 months", X(1), Y(1) - 12);
  }

  // la linea con su area, los puntos de cada mes y el punto vivo
  function pintar(a) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (a <= 0) return;
    ctx.setTransform(dpr, 0, 0, dpr, -bx * dpr, -by * dpr);
    const hx = X(a), hy = Y(a);
    const g = ctx.createLinearGradient(0, yT, 0, y0);
    g.addColorStop(0, "rgba(21,105,255,.78)"); g.addColorStop(1, "rgba(21,105,255,.06)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(hx, hy); ctx.lineTo(hx, y0); ctx.closePath(); ctx.fill();
    ctx.lineCap = "round";
    // resplandor azul de la linea (un trazo ancho y tenue: sin shadowBlur, que es caro)
    ctx.strokeStyle = "rgba(21,105,255,.45)"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(hx, hy); ctx.stroke();
    // el tramo recien ganado, con un verde muy suave
    const u0 = Math.max(0, a - 0.14);
    const gv = ctx.createLinearGradient(X(u0), 0, hx, 0);
    gv.addColorStop(0, `rgba(${VERDE},0)`); gv.addColorStop(1, `rgba(${VERDE},.55)`);
    ctx.strokeStyle = gv; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(X(u0), Y(u0)); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.lineCap = "butt"; ctx.lineWidth = 1;
    for (let m = 1; m <= 12; m++) {
      const u = m / 12;
      if (u > a + 1e-6) break;
      const recien = a * 12 - m < 0.6;
      ctx.fillStyle = recien ? `rgb(${VERDE})` : "#fff";
      ctx.beginPath(); ctx.arc(X(u), Y(u), recien ? 3.5 : 2.5, 0, 6.283); ctx.fill();
    }
    ctx.strokeStyle = `rgba(${VERDE},.4)`; ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.moveTo(hx + 0.5, hy); ctx.lineTo(hx + 0.5, y0); ctx.stroke(); ctx.setLineDash([]);
    const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, 22);
    halo.addColorStop(0, `rgba(${VERDE},.45)`); halo.addColorStop(1, `rgba(${VERDE},0)`);
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(hx, hy, 22, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(hx, hy, 5, 0, 6.283); ctx.fill();
    ctx.fillStyle = `rgb(${VERDE})`; ctx.beginPath(); ctx.arc(hx, hy, 3, 0, 6.283); ctx.fill();
  }

  // ---------------------------------------------------------------
  // avance
  // ---------------------------------------------------------------
  let ant = -1, cola = false, cerca = true, pasoAnt = -1;
  function cuadro() {
    cola = false;
    if (!cerca) return;
    const span = alto - window.innerHeight;
    let p = span > 0 ? (window.scrollY - top) / span : 1;
    p = quieto ? 0.62 : clamp(p);
    if (Math.abs(p - ant) < 0.0004) return;
    ant = p;

    const a = suave(seg(p, 0.06, 0.6)), b = suave(seg(p, 0.66, 0.86)), c = seg(p, 0.86, 0.93);
    const mes = Math.floor(a * 12 + 1e-6);
    if (mes !== mesEjes) { mesEjes = mes; pintarEjes(mes); }
    if (b < 1) pintar(a);
    ejesCv.style.opacity = b > 0 ? String(1 - suave(b * 2.2)) : "";
    // llega justo a 0: cubre hasta el ultimo pixel de abajo y su filo blanco queda fuera por arriba
    marea.style.transform = "translateY(" + (102 * (1 - b)).toFixed(2) + "%)";

    // etiqueta del punto vivo
    const verTip = a > 0.02 && b <= 0;
    tip.style.opacity = verTip ? "1" : "0";
    if (verTip) {
      const meses = a * 12;
      tipM.textContent = "Month " + String(Math.min(12, Math.max(1, Math.ceil(meses - 1e-6)))).padStart(2, "0");
      tipV.textContent = "+" + f2(ano * a) + " #SECT";
      const tw = tip.offsetWidth || 150;
      let tx = X(a) + 16, ty = Y(a) - 56;
      if (tx + tw > W - 10) tx = X(a) - tw - 16;
      tip.style.transform = "translate(" + Math.round(tx) + "px," + Math.round(ty) + "px)";
    }
    if (ganado) ganado.textContent = "+" + f2(ano * a);

    // panel inferior: avance, estado y paso de la guia
    const pct = Math.round(100 * seg(p, 0.06, 0.6));
    fill.style.width = pct + "%";
    pc.textContent = pct + "%";
    st.textContent = pct >= 100 ? "12 months accrued" : "Accruing";
    const k = Math.min(8, Math.floor(seg(p, 0.06, 0.6) * 8) + 1);
    if (k !== pasoAnt) { pasoAnt = k; pasoEl.textContent = String(k).padStart(2, "0") + " / 08 · " + PASOS[k - 1]; }
    // las cifras se retiran al subir la marea; antes, las maneja la entrada del CSS
    if (stats) stats.style.opacity = b > 0 ? String(1 - suave(b * 2)) : "";
    // el panel de abajo se retira al final: queda el azul, el titular y el aviso
    hud.style.opacity = c > 0 ? String(1 - c) : "";

    // aviso de seguir bajando: antes de que arranque la linea y al terminar
    const final = p > 0.9, inicio = p < 0.05;
    cue.classList.toggle("on", inicio || final);
    if (inicio || final) {
      const cy = final ? H * 0.5 : (yT + y0) / 2;
      cue.style.transform = "translate(" + Math.round(W / 2) + "px," + Math.round(cy) + "px) translate(-50%,-50%)";
      const txt = final ? "Next · the guide, 8 steps" : "Scroll to draw 12 months";
      if (cueSub.textContent !== txt) cueSub.textContent = txt;
    }
  }
  function pedir() { if (!cola) { cola = true; requestAnimationFrame(cuadro); } }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => { cerca = es[0].isIntersecting; if (cerca) pedir(); }, { rootMargin: "200px 0px" }).observe(sec);
  }
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", medir);
  window.addEventListener("load", medir);
  if ("ResizeObserver" in window) new ResizeObserver(medir).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);   // las fuentes cambian la altura del titular
  medir();
})();
