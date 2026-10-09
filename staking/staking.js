/* ---- Sectora Staking: interfaz.
   Calculadora, titulos que entran palabra a palabra, cabecera, barra de
   progreso, preguntas, botones magneticos y el cursor de coordenadas del
   sitio. Lo visual pesado (intro, cielo, anillos, cinta, pasos en
   horizontal) va en staking-fx.js; la cadena, en staking-chain.js. ---- */
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer:coarse)").matches;
  const $ = (id) => document.getElementById(id);

  // ---------------------------------------------------------------
  // calculadora
  // ---------------------------------------------------------------
  // APY lineal, sin compuesto. Arranca en 14,9% (rateBps = 1490 de
  // SectoraHolderRewards); la fundacion puede cambiarla con setRate, y con el
  // contrato en vivo staking-chain.js lee la tasa y avisa con "sectora:apy".
  let APY = 0.149;
  const MONTHS = 12;
  const ANO_S = 365 * 86400;
  const fmt2 = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtSeg = (n) => {
    const d = n >= 100 ? 4 : n >= 1 ? 6 : 8;
    return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  };

  const entrada = $("sectIn");
  const chips = document.querySelectorAll(".chips button");

  function recalc() {
    const amt = entrada ? parseFloat(entrada.value) || 0 : 0;
    const yearly = amt * APY;
    const put = (id, txt) => { const el = $(id); if (el) el.textContent = txt; };
    put("outSec", fmtSeg(yearly / ANO_S) + " #SECT");
    put("outDay", fmt2(yearly / 365) + " #SECT");
    put("outMonth", fmt2(yearly / 12) + " #SECT");
    put("outYear", fmt2(yearly) + " #SECT");
    put("outYearSm", fmt2(yearly) + " #SECT");
    chips.forEach((c) => c.classList.toggle("on", Number(c.dataset.v) === amt));
    grafico.objetivo(amt);
  }

  // solo rellenan la casilla para la estimacion; no tocan la cadena
  chips.forEach((c) => c.addEventListener("click", () => {
    if (!entrada) return;
    entrada.value = c.dataset.v;
    entrada.dispatchEvent(new Event("input", { bubbles: true }));
  }));

  // ---- grafico: recompensa acumulada mes a mes, una barra por mes ----
  const grafico = (() => {
    const cv = $("growthChart");
    let actual = 0, meta = 0, raf = 0, vacio = true;
    function dibujar(principal) {
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = cv.clientWidth || 600, H = cv.clientHeight || 170;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      }
      const ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const p = principal > 0 ? principal : 1000;     // sin cantidad: forma de referencia, atenuada
      const porMes = p * APY / MONTHS;
      const max = porMes * MONTHS * 1.12 || 1;
      const padT = 12, padB = 20, plotH = H - padT - padB;
      const slot = W / MONTHS, barW = Math.max(3, slot * 0.34);
      const y = (v) => padT + plotH - (v / max) * plotH;
      const a = vacio ? 0.35 : 1;

      ctx.strokeStyle = "rgba(255,255,255,.06)"; ctx.lineWidth = 1;
      for (let g = 0; g <= 3; g++) {
        const gy = Math.round(padT + (plotH / 3) * g) + 0.5;
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }
      // linea de tendencia por las cimas
      ctx.beginPath();
      for (let m = 1; m <= MONTHS; m++) {
        const cx = slot * (m - 0.5), cy = y(porMes * m);
        if (m === 1) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
      }
      ctx.strokeStyle = "rgba(52,231,255," + (0.45 * a) + ")"; ctx.lineWidth = 1; ctx.stroke();

      ctx.font = "9.5px 'IBM Plex Mono', monospace"; ctx.textAlign = "center";
      for (let m = 1; m <= MONTHS; m++) {
        const cx = slot * (m - 0.5), top = y(porMes * m), base = y(0);
        const gr = ctx.createLinearGradient(0, top, 0, base);
        if (m === MONTHS) { gr.addColorStop(0, "rgba(255,255,255," + a + ")"); gr.addColorStop(1, "rgba(255,255,255," + 0.15 * a + ")"); }
        else { gr.addColorStop(0, "rgba(77,141,255," + a + ")"); gr.addColorStop(1, "rgba(21,105,255," + 0.08 * a + ")"); }
        ctx.fillStyle = gr;
        ctx.fillRect(cx - barW / 2, top, barW, base - top);
        ctx.fillStyle = m === MONTHS ? "rgba(255,255,255," + a + ")" : "rgba(52,231,255," + 0.9 * a + ")";
        ctx.beginPath(); ctx.arc(cx, top, m === MONTHS ? 3 : 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.34)";
        ctx.fillText(String(m), cx, H - 5);
      }
    }
    function paso() {
      actual += (meta - actual) * 0.16;
      if (Math.abs(meta - actual) < Math.max(0.001, meta * 0.0005)) actual = meta;
      dibujar(actual);
      raf = actual === meta ? 0 : requestAnimationFrame(paso);
    }
    return {
      objetivo(v) {
        vacio = !(v > 0);
        meta = v > 0 ? v : 0;
        if (reduced || !actual) { actual = meta; dibujar(actual); return; }
        if (!raf) raf = requestAnimationFrame(paso);
      },
      redibujar() { dibujar(actual); },
    };
  })();

  if (entrada) entrada.addEventListener("input", recalc);
  window.addEventListener("resize", () => { clearTimeout(window.__chartRt); window.__chartRt = setTimeout(grafico.redibujar, 150); });

  /* tasa leida del contrato: cada cifra de APY de la pagina (.apy-n), la
     calculadora y el grafico pasan a la tasa real */
  window.addEventListener("sectora:apy", (e) => {
    const bps = Number(e.detail);
    if (!(bps >= 0)) return;
    APY = bps / 10000;
    const txt = (bps / 100).toFixed(2).replace(/\.?0+$/, "");
    document.querySelectorAll(".apy-n").forEach((el) => { el.textContent = txt; });
    recalc();
    window.dispatchEvent(new Event("sectora:relayout"));
  });
  recalc();

  // ---------------------------------------------------------------
  // cifras en vivo: "1,234 #SECT" -> numero grande y la unidad en pequeño,
  // con un destello cuando cambian. staking-chain.js sustituye estos nodos
  // por clones al arrancar, asi que se vigila la tarjeta, no el nodo.
  // ---------------------------------------------------------------
  document.querySelectorAll(".stats .st").forEach((st) => {
    let previo = "";
    const ordenar = () => {
      const n = st.querySelector(".st-n.num");
      if (!n || n.querySelector("small")) return;
      const t = n.textContent.trim();
      const m = t.match(/^(.*?)\s*#SECT$/);
      if (m) { n.textContent = m[1]; const s = document.createElement("small"); s.textContent = "#SECT"; n.appendChild(s); }
      if (t !== previo && previo && previo !== "—") {
        n.classList.add("flash"); setTimeout(() => n.classList.remove("flash"), 900);
      }
      previo = t;
    };
    new MutationObserver(ordenar).observe(st, { childList: true, subtree: true, characterData: true });
  });

  // ---------------------------------------------------------------
  // titulos palabra a palabra y apariciones al hacer scroll
  // ---------------------------------------------------------------
  function partir(el) {
    const nodos = Array.from(el.childNodes);
    el.textContent = "";
    let i = 0;
    const palabra = (contenido) => {
      const w = document.createElement("span"); w.className = "w";
      const s = document.createElement("span"); s.style.setProperty("--i", i++);
      s.append(contenido); w.appendChild(s); el.appendChild(w);
    };
    nodos.forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) el.appendChild(document.createTextNode(" "));
          else palabra(p);
        });
      } else palabra(n);   // un elemento (por ejemplo .apy-n) entra entero
    });
  }
  document.querySelectorAll(".split").forEach(partir);

  const vistos = document.querySelectorAll(".reveal, .split");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    vistos.forEach((el) => io.observe(el));
  } else {
    vistos.forEach((el) => el.classList.add("in"));
  }

  // ---------------------------------------------------------------
  // cabecera: se esconde al bajar, vuelve al subir; barra de progreso;
  // seccion activa en el menu
  // ---------------------------------------------------------------
  const top = $("top"), barra = $("progBar");
  const enlaces = Array.from(document.querySelectorAll(".top-nav a"));
  const secciones = enlaces.map((a) => document.querySelector(a.getAttribute("href")));
  let ultimoY = window.scrollY, pendiente = false;
  function alScroll() {
    pendiente = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (barra) barra.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    if (top) {
      top.classList.toggle("scrolled", y > 30);
      const bajando = y > ultimoY + 4, subiendo = y < ultimoY - 4;
      if (bajando && y > window.innerHeight * 0.6) top.classList.add("hide");
      else if (subiendo || y < 80) top.classList.remove("hide");
    }
    let activa = -1;
    secciones.forEach((s, i) => { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.45) activa = i; });
    enlaces.forEach((a, i) => a.classList.toggle("on", i === activa));
    ultimoY = y;
  }
  window.addEventListener("scroll", () => { if (!pendiente) { pendiente = true; requestAnimationFrame(alScroll); } }, { passive: true });
  alScroll();

  // ---------------------------------------------------------------
  // preguntas: abren y cierran con altura animada
  // ---------------------------------------------------------------
  document.querySelectorAll(".faq-item").forEach((d) => {
    const s = d.querySelector("summary"), a = d.querySelector(".faq-a");
    if (!s || !a || reduced || !a.animate) return;
    s.addEventListener("click", (e) => {
      e.preventDefault();
      const ops = { duration: 520, easing: "cubic-bezier(.16,1,.3,1)" };
      if (d.open) {
        const h = a.offsetHeight;
        a.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], ops).onfinish = () => { d.open = false; };
      } else {
        d.open = true;
        const h = a.offsetHeight;
        a.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], ops);
      }
    });
  });

  // ---------------------------------------------------------------
  // botones magneticos y luz que sigue al puntero en los paneles
  // ---------------------------------------------------------------
  if (!reduced && !coarse) {
    document.querySelectorAll(".mag").forEach((el) => {
      const fuerza = el.classList.contains("badge") ? 0.35 : 0.22;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.classList.add("pull");
        el.style.transform = "translate3d(" + (dx * fuerza).toFixed(1) + "px," + (dy * fuerza).toFixed(1) + "px,0)";
      });
      el.addEventListener("pointerleave", () => { el.classList.remove("pull"); el.style.transform = ""; });
    });
    document.querySelectorAll(".panel").forEach((p) => {
      p.addEventListener("pointermove", (e) => {
        const r = p.getBoundingClientRect();
        p.style.setProperty("--mx", (e.clientX - r.left) + "px");
        p.style.setProperty("--my", (e.clientY - r.top) + "px");
      }, { passive: true });
    });
  }

  // ---------------------------------------------------------------
  // reloj UTC de la portada: el segundo en que se acumula lo ganado
  // ---------------------------------------------------------------
  const reloj = $("utcClock");
  if (reloj) {
    const tic = () => { reloj.textContent = "UTC " + new Date().toISOString().slice(11, 19); };
    tic();
    setInterval(tic, 1000);
  }

  // el boton pasa a mostrar la direccion conectada: sin mayusculas ("0x", no "0X")
  const acciones = document.querySelector(".con-actions");
  if (acciones) {
    const mirar = () => {
      const bt = $("connectBtn");
      if (bt) bt.classList.toggle("addr", /^0x[0-9a-f]{4}/i.test(bt.textContent.trim()));
    };
    new MutationObserver(mirar).observe(acciones, { childList: true, subtree: true, characterData: true });
  }

  // marcas del dial del paso 02 (60 segundos)
  const dial = document.querySelector(".art-earn .a-ticks");
  if (dial) {
    const ns = "http://www.w3.org/2000/svg";
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2, big = i % 5 === 0;
      const r1 = big ? 44 : 47, r2 = 52;
      const l = document.createElementNS(ns, "line");
      l.setAttribute("x1", (100 + Math.sin(a) * r1).toFixed(2)); l.setAttribute("y1", (70 - Math.cos(a) * r1).toFixed(2));
      l.setAttribute("x2", (100 + Math.sin(a) * r2).toFixed(2)); l.setAttribute("y2", (70 - Math.cos(a) * r2).toFixed(2));
      if (big) l.setAttribute("class", "big");
      dial.appendChild(l);
    }
  }
})();

/* ===== cursor de coordenadas: reticula + lectura, el mismo sistema de la
   portada, la de seguridad y el panel, ajustado a la celda de 54 px ===== */
(() => {
  const reticle = document.getElementById("reticle");
  const readout = document.getElementById("readout");
  if (!reticle || !readout) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rx = reticle.querySelector(".rx"), ry = reticle.querySelector(".ry");
  const CELL = 54;
  window.addEventListener("pointermove", (e) => {
    const gx = Math.floor((e.clientX + window.scrollX) / CELL) * CELL - window.scrollX;
    const gy = Math.floor((e.clientY + window.scrollY) / CELL) * CELL - window.scrollY;
    const cc = Math.floor((e.clientX + window.scrollX) / CELL);
    const cr = Math.floor((e.clientY + window.scrollY) / CELL);
    readout.style.transform = "translate3d(" + gx + "px," + gy + "px,0)";
    readout.textContent = String(Math.abs(cc) % 100).padStart(2, "0") + " · " + String(Math.abs(cr) % 100).padStart(2, "0");
    rx.style.transform = "translate3d(0," + gy + "px,0)";
    ry.style.transform = "translate3d(" + gx + "px,0,0)";
    reticle.classList.add("on");
    readout.classList.add("on");
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => {
    reticle.classList.remove("on");
    readout.classList.remove("on");
  });
})();
