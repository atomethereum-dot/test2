/* ---- Sectora Staking: efectos.
   1. Intro: el anillo de la marca se dibuja entre estrellas, se cierra en el
      logo y la camara entra por su centro; el hueco del anillo es la ventana
      por la que aparece la pagina.
   2. Cielo fijo: estrellas en tres profundidades, constelaciones alrededor
      del puntero y alguna estrella fugaz.
   3. Anillos de la portada: el 14.9% es el planeta. Lo que pasa por delante
      se pinta en un lienzo encima del numero y lo de atras en otro debajo.
      El anillo del dial marca el segundo real (las recompensas se acumulan
      cada segundo) y cada segundo sale un pulso.
   4. Cinta que acelera con el scroll, pasos en horizontal y el pie.
   Sin librerias externas: esta pagina pide firmas a la wallet y no carga
   codigo de terceros. ---- */
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer:coarse)").matches;
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dprMax = () => Math.min(window.devicePixelRatio || 1, 2);
  const E = {
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  };

  // puntero compartido, suavizado
  const ptr = { x: -9999, y: -9999, nx: 0, ny: 0, sx: 0, sy: 0, on: false };
  window.addEventListener("pointermove", (e) => {
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true;
    ptr.nx = e.clientX / window.innerWidth - 0.5; ptr.ny = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => { ptr.on = false; });

  // brillo pre-dibujado para estrellas grandes y particulas
  function sprite(color, size) {
    const c = document.createElement("canvas"); c.width = c.height = size;
    const g = c.getContext("2d"), r = size / 2;
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.18, color.replace("A", "0.95"));
    gr.addColorStop(0.45, color.replace("A", "0.25"));
    gr.addColorStop(1, color.replace("A", "0"));
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    return c;
  }
  const GLOW_W = sprite("rgba(190,215,255,A)", 64);
  const GLOW_C = sprite("rgba(52,231,255,A)", 64);
  const GLOW_B = sprite("rgba(77,141,255,A)", 64);

  // =================================================================
  // 1. intro
  // =================================================================
  let terminarIntro = () => {};
  const intro = (() => {
    const el = $("intro");
    if (!el || !root.classList.contains("intro-on")) { root.classList.add("ready"); return null; }
    root.classList.add("intro-run");
    try { history.scrollRestoration = "manual"; } catch (e) {}
    window.scrollTo(0, 0);
    try { sessionStorage.setItem("sectStkIntro", "1"); } catch (e) {}

    const corta = root.classList.contains("intro-corta");
    const cv = $("introSky"), ctx = cv.getContext("2d");
    const core = $("introCore"), sq = core.querySelector(".im-sq"), ring = core.querySelector(".im-ring");
    const word = $("introWord"), pct = $("introPct"), bar = $("introBar");
    const logs = Array.from(($("introLog") || { children: [] }).children);
    const hud = el.querySelector(".intro-hud"), frame = el.querySelector(".intro-frame"), skip = $("introSkip");
    const hero = $("hero");

    // tiempos en ms
    const T = corta
      ? { dibujo: [0, 0], cierre: [0, 0], zoom: 120, zoomDur: 1000 }
      : { dibujo: [180, 1350], cierre: [1350, 1800], zoom: 1800, zoomDur: 1250 };
    const FIN = T.zoom + T.zoomDur;

    let W = 0, H = 0, d = 1, S = 180;
    const stars = [];
    function medir() {
      d = dprMax(); W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * d); cv.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0);
      S = core.offsetWidth || 180;
    }
    medir();
    const N = coarse ? 420 : 820;
    for (let i = 0; i < N; i++) stars.push({ x: (Math.random() * 2 - 1) * 1.4, y: (Math.random() * 2 - 1) * 1.4, z: Math.random() * 0.98 + 0.02, pz: 0 });
    window.addEventListener("resize", medir);

    let t0 = performance.now(), ultimo = t0, saltado = false, acabado = false, ondaHecha = false;
    const ondas = [];
    // kMax: el hueco del anillo (radio interior 24.15 de 100) tiene que
    // pasar de la esquina de la pantalla
    const kMax = () => (Math.hypot(W, H) / 2) / (S * 0.2415) * 1.12;

    function cielo(t, vel, alfa) {
      const cx = W / 2, cy = H / 2, f = Math.min(W, H) * 0.62;
      ctx.clearRect(0, 0, W, H);
      const rayas = vel > 0.004;
      ctx.lineCap = "round";
      for (const s of stars) {
        s.pz = s.z;
        s.z -= vel;
        if (s.z <= 0.02) { s.x = (Math.random() * 2 - 1) * 1.4; s.y = (Math.random() * 2 - 1) * 1.4; s.z = 1; s.pz = 1; continue; }
        const sx = cx + (s.x / s.z) * f, sy = cy + (s.y / s.z) * f;
        if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) continue;
        const b = clamp((1 - s.z) * 1.35, 0, 1) * alfa;
        if (rayas) {
          const px = cx + (s.x / s.pz) * f, py = cy + (s.y / s.pz) * f;
          ctx.strokeStyle = "rgba(200,225,255," + b.toFixed(3) + ")";
          ctx.lineWidth = Math.max(0.6, (1 - s.z) * 2.4);
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
        } else {
          const r = Math.max(0.5, (1 - s.z) * 2.1);
          ctx.fillStyle = "rgba(225,235,255," + b.toFixed(3) + ")";
          ctx.fillRect(sx - r / 2, sy - r / 2, r, r);
        }
      }
      // ondas del cierre del anillo
      for (let i = ondas.length - 1; i >= 0; i--) {
        const o = ondas[i], p = (t - o.t) / 1100;
        if (p < 0) continue;
        if (p >= 1) { ondas.splice(i, 1); continue; }
        const r = S * 0.272 * (1 + E.outCubic(p) * (2.4 + i * 0.6));
        ctx.strokeStyle = "rgba(52,231,255," + ((1 - p) * 0.55).toFixed(3) + ")";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }
    }

    // durante el zoom el logo se pinta en el lienzo: un SVG escalado 30 veces
    // con transform se ve borroso; dibujado a su tamaño real queda nitido
    function logo(k) {
      const cx = W / 2, cy = H / 2, lado = S * k, rr = lado * 0.09;
      ctx.fillStyle = "#1569ff";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cx - lado / 2, cy - lado / 2, lado, lado, rr);
      else ctx.rect(cx - lado / 2, cy - lado / 2, lado, lado);
      ctx.fill();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = S * 0.061 * k;
      ctx.shadowColor = "rgba(190,220,255,.55)"; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(cx, cy, S * 0.272 * k, 0, Math.PI * 2); ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function mascara(r) {
      const v = r <= 0 ? "none" :
        "radial-gradient(circle at 50% 50%, transparent " + r.toFixed(1) + "px, #000 " + (r + 1.5).toFixed(1) + "px)";
      el.style.webkitMaskImage = v; el.style.maskImage = v;
    }

    function cuadro(ahora) {
      if (acabado) return;
      let t = ahora - t0;
      if (saltado && t < T.zoom) { t0 -= T.zoom - t; t = T.zoom; }
      const dt = Math.min(50, ahora - ultimo); ultimo = ahora;

      // A. el anillo se dibuja
      const pA = corta ? 1 : E.inOutSine(clamp((t - T.dibujo[0]) / (T.dibujo[1] - T.dibujo[0]), 0, 1));
      ring.style.strokeDashoffset = (1 - pA).toFixed(4);
      if (!corta) {
        const n = Math.round(pA * 100);
        pct.textContent = String(n).padStart(3, "0");
        bar.style.transform = "scaleX(" + pA.toFixed(4) + ")";
        logs.forEach((l, i) => l.classList.toggle("on", t > T.dibujo[0] + 260 + i * 280));
      }
      // B. cierre: aparece el cuadrado azul detras del anillo y el nombre
      const pB = corta ? 1 : clamp((t - T.cierre[0]) / (T.cierre[1] - T.cierre[0]), 0, 1);
      if (!ondaHecha && pB > 0) { ondaHecha = true; ondas.push({ t: ahora }); ondas.push({ t: ahora + 140 }); }
      const eB = E.outExpo(pB);
      sq.style.opacity = eB.toFixed(3);
      sq.style.transform = "scale(" + (0.4 + 0.6 * eB).toFixed(4) + ")";
      if (!corta) {
        word.style.opacity = eB.toFixed(3);
        word.style.letterSpacing = (0.9 - 0.48 * eB).toFixed(3) + "em";
      }
      // C. zoom: la camara entra por el anillo
      const pC = clamp((t - T.zoom) / T.zoomDur, 0, 1);
      const eC = E.inOutCubic(pC);
      const k = Math.pow(kMax(), eC);           // escala exponencial: velocidad de camara constante
      core.style.visibility = pC > 0 ? "hidden" : "";
      mascara(pC > 0 ? S * 0.2415 * k - 0.5 : 0);
      if (pC > 0.12 && !root.classList.contains("ready")) root.classList.add("ready");   // el 14.9% entra mientras se acerca
      const fuera = clamp(1 - pC * 3.2, 0, 1);
      if (hud) hud.style.opacity = fuera; if (frame) frame.style.opacity = fuera;
      if (skip) skip.style.opacity = fuera * 1; if (!corta) word.style.opacity = (eB * fuera).toFixed(3);
      if (hero) {
        const z = 0.62 + 0.38 * E.outCubic(pC);
        hero.style.transform = pC > 0 ? "scale(" + z.toFixed(4) + ")" : "scale(.62)";
        hero.style.opacity = (0.25 + 0.75 * pC).toFixed(3);
      }
      const vel = (0.0011 + 0.075 * Math.pow(pC, 1.6)) * (dt / 16.7);
      cielo(ahora, vel, 1 - Math.pow(pC, 4));
      if (pC > 0) logo(k);

      if (t >= FIN) return terminar();
      requestAnimationFrame(cuadro);
    }

    function terminar() {
      if (acabado) return;
      acabado = true;
      el.remove();
      if (hero) { hero.style.transform = ""; hero.style.opacity = ""; }
      root.classList.remove("intro-on", "intro-run", "intro-larga", "intro-corta");
      root.classList.add("ready");
      window.removeEventListener("keydown", tecla);
      window.dispatchEvent(new Event("sectora:relayout"));
      if (location.hash && location.hash.length > 1) {
        const destino = document.querySelector(location.hash);
        if (destino) setTimeout(() => destino.scrollIntoView({ behavior: "smooth" }), 350);
      }
    }
    terminarIntro = terminar;

    function saltar() { saltado = true; }
    function tecla(e) { if (["Escape", "Enter", " "].includes(e.key)) saltar(); }
    el.addEventListener("click", saltar);
    window.addEventListener("keydown", tecla);
    if (hero) { hero.style.transform = "scale(.62)"; hero.style.opacity = ".25"; }

    requestAnimationFrame(cuadro);
    // por si la pestana estaba en segundo plano o algo se atasca
    setTimeout(() => { if (!acabado && document.visibilityState === "visible") terminar(); }, FIN + 2500);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && !acabado && performance.now() - t0 > FIN + 1000) terminar();
    });
    return el;
  })();

  // =================================================================
  // 2. cielo fijo
  // =================================================================
  (() => {
    const cv = $("sky");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, d = 1, stars = [];
    let fugaz = null, sigFugaz = performance.now() + 3500;
    function construir() {
      d = dprMax(); W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * d); cv.height = Math.round(H * d); ctx.setTransform(d, 0, 0, d, 0, 0);
      const n = Math.min(950, Math.round((W * H) / (coarse ? 4200 : 2300)));
      stars = [];
      for (let i = 0; i < n; i++) {
        const z = Math.pow(Math.random(), 1.7);
        stars.push({ x: Math.random() * W, y: Math.random() * H, z, r: 0.45 + z * 1.35, a: 0.2 + Math.random() * 0.6,
          ph: Math.random() * 6.283, sp: 0.5 + Math.random() * 1.8, c: Math.random() < 0.13 });
      }
    }
    construir();
    let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(construir, 150); });

    const cerca = [];
    function cuadro(t) {
      ptr.sx += (ptr.nx - ptr.sx) * 0.05; ptr.sy += (ptr.ny - ptr.sy) * 0.05;
      ctx.clearRect(0, 0, W, H);
      const sy = window.scrollY;
      cerca.length = 0;
      for (const s of stars) {
        let y = (s.y - sy * (0.015 + s.z * 0.11) - ptr.sy * s.z * 16) % H; if (y < 0) y += H;
        let x = (s.x - ptr.sx * s.z * 22) % W; if (x < 0) x += W;
        const tw = reduced ? 1 : 0.62 + 0.38 * Math.sin(t * 0.001 * s.sp + s.ph);
        const a = s.a * tw;
        if (s.r > 1.35) {
          const g = s.c ? GLOW_C : GLOW_W, sz = s.r * 7;
          ctx.globalAlpha = a * 0.9; ctx.drawImage(g, x - sz / 2, y - sz / 2, sz, sz); ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = s.c ? "rgba(150,215,255," + a.toFixed(3) + ")" : "rgba(235,240,255," + a.toFixed(3) + ")";
          ctx.fillRect(x, y, s.r, s.r);
        }
        if (ptr.on && !coarse && s.z > 0.25) {
          const dx = x - ptr.x, dy = y - ptr.y, dd = dx * dx + dy * dy;
          if (dd < 190 * 190 && cerca.length < 26) cerca.push({ x, y, dd });
        }
      }
      // constelacion alrededor del puntero
      if (cerca.length > 1) {
        ctx.lineWidth = 0.7;
        for (let i = 0; i < cerca.length; i++) {
          const a = cerca[i];
          for (let j = i + 1; j < cerca.length; j++) {
            const b = cerca[j], dx = a.x - b.x, dy = a.y - b.y, dd = dx * dx + dy * dy;
            if (dd > 115 * 115) continue;
            const f = (1 - Math.sqrt(dd) / 115) * (1 - Math.sqrt(Math.max(a.dd, b.dd)) / 190);
            ctx.strokeStyle = "rgba(120,170,255," + (f * 0.55).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      // estrella fugaz
      if (!reduced) {
        if (!fugaz && t > sigFugaz) {
          const ang = Math.PI * (0.16 + Math.random() * 0.1);
          fugaz = { x: Math.random() * W * 0.8 + W * 0.1, y: Math.random() * H * 0.35, vx: Math.cos(ang), vy: Math.sin(ang), t };
        }
        if (fugaz) {
          const p = (t - fugaz.t) / 900;
          if (p >= 1) { fugaz = null; sigFugaz = t + 6000 + Math.random() * 9000; }
          else {
            const dist = 520 * E.outCubic(p), largo = 140 * Math.sin(Math.PI * p);
            const hx = fugaz.x + fugaz.vx * dist, hy = fugaz.y + fugaz.vy * dist;
            const gr = ctx.createLinearGradient(hx, hy, hx - fugaz.vx * largo, hy - fugaz.vy * largo);
            gr.addColorStop(0, "rgba(255,255,255," + (0.9 * Math.sin(Math.PI * p)).toFixed(3) + ")");
            gr.addColorStop(1, "rgba(77,141,255,0)");
            ctx.strokeStyle = gr; ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - fugaz.vx * largo, hy - fugaz.vy * largo); ctx.stroke();
          }
        }
      }
      if (!reduced) requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);
    if (reduced) {
      let p = false;
      const otra = () => { if (!p) { p = true; requestAnimationFrame((t) => { p = false; cuadro(t); }); } };
      window.addEventListener("scroll", otra, { passive: true });
      window.addEventListener("resize", otra);
    }
  })();

  // =================================================================
  // 3. anillos de la portada
  // =================================================================
  (() => {
    const back = $("orbitBack"), front = $("orbitFront"), hero = $("hero");
    const num = document.querySelector(".hx-n");
    if (!back || !front || !hero || !num) return;
    const cb = back.getContext("2d"), cf = front.getContext("2d");
    let W = 0, H = 0, d = 1, cx = 0, cy = 0, base = 200, visible = true, hp = 0;

    // radios en multiplos de la mitad del ancho del numero
    const ANILLOS = [
      { k: 1.08, a: 0.55, w: 1.1, parts: [0.1, 2.3], sp: 0.075 },
      { k: 1.2, a: 0.22, w: 1, parts: [], sp: 0 , dash: true },
      { k: 1.34, a: 0.0, w: 1, parts: [], sp: 0, dial: true },
      { k: 1.52, a: 0.32, w: 1, parts: [1.2, 3.4, 5.1], sp: -0.045 },
      { k: 1.86, a: 0.14, w: 1, parts: [0.6, 4.0], sp: 0.028 },
    ];
    const INC = 0.2, ROT = -0.13;

    function medir() {
      d = dprMax(); W = hero.clientWidth; H = hero.clientHeight;
      for (const c of [back, front]) { c.width = Math.round(W * d); c.height = Math.round(H * d); }
      cb.setTransform(d, 0, 0, d, 0, 0); cf.setTransform(d, 0, 0, d, 0, 0);
      // posicion del numero sin transformaciones (offset*, no getBoundingClientRect)
      let x = 0, y = 0, n = num;
      while (n && n !== hero) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      if (n !== hero) { x = (W - num.offsetWidth) / 2; y = H * 0.4; }
      cx = x + num.offsetWidth / 2; cy = y + num.offsetHeight * 0.52;
      base = Math.max(120, num.offsetWidth / 2);
      if (W < 700) base = Math.min(base, W * 0.4);
    }
    medir();
    let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(medir, 120); });
    window.addEventListener("sectora:relayout", medir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);
    window.addEventListener("scroll", () => {
      hp = clamp(window.scrollY / (hero.offsetHeight * 0.85), 0, 1);
      hero.style.setProperty("--hp", hp.toFixed(4));
    }, { passive: true });

    // punto del anillo de radio a en el angulo th; z>0 = delante del numero
    function punto(a, th, inc, rot) {
      const ex = a * Math.cos(th), ey = a * inc * Math.sin(th);
      return { x: cx + ex * Math.cos(rot) - ey * Math.sin(rot), y: cy + ex * Math.sin(rot) + ey * Math.cos(rot), z: Math.sin(th) };
    }

    function arco(a, inc, rot, alfa, ancho, color, dash) {
      // 48 tramos: cada uno al lienzo de delante o al de detras segun su lado
      const SEG = 96;
      for (let i = 0; i < SEG; i++) {
        const t1 = (i / SEG) * Math.PI * 2, t2 = ((i + 1) / SEG) * Math.PI * 2;
        if (dash && i % 2) continue;
        const p1 = punto(a, t1, inc, rot), p2 = punto(a, t2, inc, rot);
        const z = Math.sin((t1 + t2) / 2);
        const ctx = z > 0 ? cf : cb;
        const f = z > 0 ? 0.55 + 0.45 * z : 0.5 + 0.25 * (1 + z);
        ctx.strokeStyle = color + (alfa * f).toFixed(3) + ")";
        ctx.lineWidth = ancho;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }
    }

    function cuadro(t) {
      if (!visible && !reduced) { requestAnimationFrame(cuadro); return; }
      cb.clearRect(0, 0, W, H); cf.clearRect(0, 0, W, H);
      const ahora = Date.now();
      const inc = INC + (coarse ? 0 : ptr.sy * 0.08);
      const rot = ROT + (coarse ? 0 : ptr.sx * 0.12) + hp * 0.35;
      const esc = 1 + hp * 0.5;
      const alfaG = 1 - hp * 0.85;
      cb.globalAlpha = cf.globalAlpha = alfaG;

      // nucleo: halo azul detras del numero
      const gr = cb.createRadialGradient(cx, cy, 0, cx, cy, base * 1.25 * esc);
      gr.addColorStop(0, "rgba(21,105,255,.22)"); gr.addColorStop(0.5, "rgba(21,105,255,.07)"); gr.addColorStop(1, "rgba(21,105,255,0)");
      cb.save(); cb.translate(cx, cy); cb.scale(1, 0.62); cb.translate(-cx, -cy);
      cb.fillStyle = gr; cb.fillRect(cx - base * 1.4 * esc, cy - base * 1.4 * esc, base * 2.8 * esc, base * 2.8 * esc); cb.restore();

      for (const R of ANILLOS) {
        const a = base * R.k * esc;
        if (R.dial) {
          // dial de 60 marcas: el segundo actual en cian y una estela detras
          const seg = Math.floor(ahora / 1000) % 60, frac = (ahora % 1000) / 1000;
          for (let i = 0; i < 60; i++) {
            const th = (i / 60) * Math.PI * 2 - Math.PI / 2;
            const atras = (seg - i + 60) % 60;
            const p1 = punto(a, th, inc, rot), p2 = punto(a * (i % 5 ? 1.035 : 1.07), th, inc, rot);
            const ctx = p1.z > 0 ? cf : cb;
            let al = (i % 5 ? 0.16 : 0.34) * (p1.z > 0 ? 1 : 0.6), col = "rgba(255,255,255,";
            if (atras === 0) { al = 1; col = "rgba(52,231,255,"; }
            else if (atras < 12) { al = Math.max(al, 0.75 * (1 - atras / 12)); col = "rgba(77,141,255,"; }
            ctx.strokeStyle = col + al.toFixed(3) + ")"; ctx.lineWidth = atras === 0 ? 2 : 1;
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            if (atras === 0) {
              const g = GLOW_C, sz = 26;
              ctx.globalAlpha = alfaG * (1 - frac * 0.5); ctx.drawImage(g, p2.x - sz / 2, p2.y - sz / 2, sz, sz); ctx.globalAlpha = alfaG;
            }
          }
          // pulso de cada segundo, saliendo del numero
          if (!reduced) {
            const ap = base * (0.92 + 0.9 * E.outCubic(frac)) * esc;
            arco(ap, inc, rot, (1 - frac) * 0.45, 1, "rgba(52,231,255,", false);
          }
          continue;
        }
        if (R.a > 0) arco(a, inc, rot, R.a, R.w, "rgba(160,190,255,", R.dash);
        for (const ph of R.parts) {
          const th = ph + (reduced ? 0 : (t / 1000) * R.sp * Math.PI * 2 / 6);
          const p = punto(a, th, inc, rot);
          const ctx = p.z > 0 ? cf : cb;
          const sz = (p.z > 0 ? 18 : 12) * (0.8 + 0.35 * p.z);
          ctx.globalAlpha = alfaG * (p.z > 0 ? 1 : 0.55);
          ctx.drawImage(p.z > 0 ? GLOW_W : GLOW_B, p.x - sz / 2, p.y - sz / 2, sz, sz);
          ctx.globalAlpha = alfaG;
        }
      }
      if (!reduced) requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);
    if (reduced) window.addEventListener("sectora:relayout", () => requestAnimationFrame(cuadro));
  })();

  // =================================================================
  // 4. cinta, pasos en horizontal y pie
  // =================================================================
  (() => {
    const track = $("mqTrack");
    if (!track) return;
    const set = track.querySelector(".mq-set");
    // copias suficientes para cubrir dos anchos de pantalla
    const rellenar = () => {
      while (track.children.length > 1) track.lastChild.remove();
      const w = set.offsetWidth || 1;
      const n = Math.max(2, Math.ceil((window.innerWidth * 2) / w) + 1);
      for (let i = 1; i < n; i++) track.appendChild(set.cloneNode(true));
    };
    rellenar();
    window.addEventListener("resize", rellenar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rellenar);
    if (reduced) return;
    let x = 0, dir = 1, vel = 0, ultimoY = window.scrollY, ultimoT = performance.now();
    window.addEventListener("scroll", () => {
      const y = window.scrollY, dy = y - ultimoY; ultimoY = y;
      if (Math.abs(dy) > 0.5) dir = dy > 0 ? 1 : -1;
      vel = Math.min(2400, vel + Math.abs(dy) * 6);
    }, { passive: true });
    function cuadro(t) {
      const dt = Math.min(50, t - ultimoT) / 1000; ultimoT = t;
      vel *= Math.pow(0.04, dt);
      const w = set.offsetWidth || 1;
      x -= dir * (55 + vel) * dt;
      if (x <= -w) x += w; if (x > 0) x -= w;
      track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
      requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);
  })();

  (() => {
    const sec = $("how"), track = $("howTrack"), now = $("howNow"), bar = $("howBar");
    if (!sec || !track) return;
    let activo = false, dist = 0, topSec = 0;
    function maquetar() {
      if (window.innerWidth < 900 || reduced) {
        activo = false; sec.style.height = ""; track.style.transform = ""; return;
      }
      activo = true;
      track.style.transform = "";
      dist = Math.max(0, track.scrollWidth - track.clientWidth);
      sec.style.height = (window.innerHeight + dist) + "px";
      topSec = sec.getBoundingClientRect().top + window.scrollY;
      mover();
    }
    function mover() {
      if (!activo) return;
      const p = dist > 0 ? clamp((window.scrollY - topSec) / dist, 0, 1) : 0;
      track.style.transform = "translate3d(" + (-p * dist).toFixed(1) + "px,0,0)";
      if (bar) bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
      if (now) now.textContent = "0" + Math.min(3, 1 + Math.round(p * 2));
    }
    maquetar();
    let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(maquetar, 150); });
    window.addEventListener("sectora:relayout", maquetar);
    window.addEventListener("load", maquetar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(maquetar);
    window.addEventListener("scroll", () => requestAnimationFrame(mover), { passive: true });
  })();

  (() => {
    const pie = document.querySelector(".ft"), palabra = document.querySelector(".ft-word span");
    if (!pie || !palabra || reduced) return;
    window.addEventListener("scroll", () => {
      const r = pie.getBoundingClientRect();
      const p = clamp((window.innerHeight - r.top) / (r.height || 1), 0, 1);
      palabra.style.setProperty("--fw", p.toFixed(3));
    }, { passive: true });
  })();
})();
