/* ---- Sectora Staking: interfaz.
   Calculadora, grafico, cantidades rapidas, preguntas, reloj del pie y
   pequeños detalles. La intro, la rejilla y los margenes van en
   staking-fx.js; la cadena (wallet, deposito, cobro, retiro), en
   staking-chain.js, que usa los mismos id de siempre. ---- */
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  // ---- grafico: recompensa acumulada mes a mes, una barra por mes ----
  const grafico = (() => {
    const cv = $("growthChart");
    let actual = 0, meta = 0, raf = 0, vacio = true;
    function dibujar(principal) {
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = cv.clientWidth || 600, H = cv.clientHeight || 150;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      }
      const ctx = cv.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const p = principal > 0 ? principal : 1000;     // sin cantidad: forma de referencia, atenuada
      const porMes = p * APY / MONTHS;
      const max = porMes * MONTHS * 1.12 || 1;
      const padT = 10, padB = 18, plotH = H - padT - padB;
      const slot = W / MONTHS, barW = Math.max(3, slot * 0.5);
      const y = (v) => padT + plotH - (v / max) * plotH;
      const a = vacio ? 0.35 : 1;
      ctx.strokeStyle = "rgba(0,0,0,.07)"; ctx.lineWidth = 1;
      for (let g = 0; g <= 3; g++) {
        const gy = Math.round(padT + (plotH / 3) * g) + 0.5;
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }
      ctx.font = "9.5px 'IBM Plex Mono', monospace"; ctx.textAlign = "center";
      for (let m = 1; m <= MONTHS; m++) {
        const cx = slot * (m - 0.5), top = y(porMes * m), base = y(0);
        ctx.fillStyle = m === MONTHS ? "rgba(7,8,10," + a + ")" : "rgba(21,105,255," + a + ")";
        ctx.fillRect(Math.round(cx - barW / 2), top, Math.round(barW), base - top);
        ctx.fillStyle = "rgba(7,8,10,.4)";
        ctx.fillText(String(m), cx, H - 4);
      }
    }
    function paso() {
      actual += (meta - actual) * 0.18;
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
  if (entrada) entrada.addEventListener("input", recalc);
  window.addEventListener("resize", () => { clearTimeout(window.__chartRt); window.__chartRt = setTimeout(grafico.redibujar, 150); });

  /* tasa leida del contrato: cada cifra de APY de la pagina (.apy-n) y la
     calculadora pasan a la tasa real */
  window.addEventListener("sectora:apy", (e) => {
    const bps = Number(e.detail);
    if (!(bps >= 0)) return;
    APY = bps / 10000;
    const txt = (bps / 100).toFixed(2).replace(/\.?0+$/, "");
    document.querySelectorAll(".apy-n").forEach((el) => { el.textContent = txt; });
    recalc();
  });
  recalc();

  // ---------------------------------------------------------------
  // cifras en vivo de la ficha: destello cuando cambian. staking-chain.js
  // sustituye esos nodos por clones al arrancar, asi que se vigila la ficha
  // ---------------------------------------------------------------
  const ficha = document.querySelector(".sheet dl");
  if (ficha) {
    const previos = {};
    new MutationObserver(() => {
      ["lvStaked", "lvStakers"].forEach((id) => {
        const n = $(id);
        if (!n) return;
        const t = n.textContent.trim();
        if (previos[id] && previos[id] !== t && previos[id] !== "—") {
          n.classList.add("flash"); setTimeout(() => n.classList.remove("flash"), 1200);
        }
        previos[id] = t;
      });
    }).observe(ficha, { childList: true, subtree: true, characterData: true });
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

  // ---------------------------------------------------------------
  // preguntas: abren y cierran con altura animada
  // ---------------------------------------------------------------
  document.querySelectorAll(".q").forEach((d) => {
    const s = d.querySelector("summary"), a = d.querySelector(".q-a");
    if (!s || !a || reduced || !a.animate) return;
    s.addEventListener("click", (e) => {
      e.preventDefault();
      const ops = { duration: 480, easing: "cubic-bezier(.16,1,.3,1)" };
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
  // pie: hora de Illinois, copiar el correo y volver arriba
  // ---------------------------------------------------------------
  const hora = $("ft-time");
  if (hora) {
    const f = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const tic = () => { hora.textContent = f.format(new Date()); };
    tic(); setInterval(tic, 1000);
  }
  document.querySelectorAll(".ft-copy").forEach((b) => b.addEventListener("click", () => {
    const v = b.dataset.copy || "";
    const ok = () => { b.textContent = "Copied"; b.classList.add("ok"); setTimeout(() => { b.textContent = "Copy"; b.classList.remove("ok"); }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(ok, () => {});
  }));
  const arriba = $("ft-up");
  if (arriba) arriba.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
})();
