/* ---- Sectora Staking: la guia paso a paso (#guide).

   - El titular (#gd-head) se queda fijo arriba con el paso en curso.
   - Las ocho tarjetas se pegan bajo el titular (position:sticky), cada una
     unos pixeles mas abajo que la anterior, y la siguiente sube por encima.
     Aqui se mide el titular para saber donde se pegan, se iguala el borde
     de abajo de todas (asi al final el mazo sale entero, sin deshacerse) y
     se hunden un poco las que van quedando debajo: escala y una vela gris.
   - El paso en curso es el de la ultima tarjeta que ha subido mas de la
     mitad; el titular repite su numero, su titulo y los ocho tramos.
   Lee posiciones una vez por cuadro y solo escribe transform y opacity. ---- */
(function () {
  "use strict";

  const sec = document.getElementById("guide");
  if (!sec) return;
  const $ = (id) => document.getElementById(id);
  const head = $("gd-head");
  const cartas = Array.from(sec.querySelectorAll(".gd-card"));
  const caras = cartas.map((li) => li.querySelector(".gd-c"));
  const velos = cartas.map((li) => li.querySelector(".gd-velo"));
  const nEl = $("gd-n"), ttEl = $("gd-tt"), wEl = $("gd-w");
  const segs = Array.from(sec.querySelectorAll("#gd-segs i"));
  const quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!head || !cartas.length) return;

  const clamp = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  const titulo = (i) => (cartas[i].querySelector("h3") || {}).textContent || "";
  const aviso = (i) => { const w = cartas[i].querySelector(".gd-wal"); return w ? w.textContent : ""; };

  // ---------------------------------------------------------------
  // geometria: donde se pega cada tarjeta y el borde de abajo comun
  // ---------------------------------------------------------------
  let topes = [], fondo = 0, cola = false, cerca = false, activo = -1;
  const hundido = cartas.map(() => -1);

  function medir() {
    const vh = window.innerHeight;
    const movil = window.innerWidth <= 760;
    const paso = movil ? 7 : 12;
    let base = head.offsetHeight + (movil ? 10 : 16);
    // alto natural de cada tarjeta (sin el relleno que se le pone abajo)
    caras.forEach((c) => { c.style.minHeight = ""; });
    const altos = caras.map((c) => c.offsetHeight);
    // si la mas alta no cabe entera bajo el titular, el mazo se pega mas
    // arriba y las tarjetas se escalonan menos; nunca por encima del titular
    const maxi = Math.max.apply(null, altos.map((h, i) => base + i * paso + h));
    let d = paso;
    if (maxi > vh - 8) d = Math.max(3, paso - Math.ceil((maxi - (vh - 8)) / (cartas.length - 1)));
    topes = cartas.map((li, i) => base + i * d);
    fondo = Math.max.apply(null, altos.map((h, i) => topes[i] + h));
    cartas.forEach((li, i) => {
      li.style.top = topes[i] + "px";
      // todas acaban a la misma altura: la de arriba del todo rellena por abajo
      caras[i].style.minHeight = (fondo - topes[i]) + "px";
    });
    sec.style.setProperty("--gd-top", base + "px");
    hundido.fill(-1); activo = -1;
    cuadro();
  }

  // ---------------------------------------------------------------
  // cada cuadro: cuanto ha subido cada tarjeta sobre la anterior
  // ---------------------------------------------------------------
  function cuadro() {
    cola = false;
    if (!cerca || !topes.length) return;
    // la entrada del titular (.on) la da staking-fx.js al verse un 12 % de la
    // seccion, y esta es tan alta que en un telefono bajo nunca se ve tanto
    if (!sec.classList.contains("on") && sec.getBoundingClientRect().top < window.innerHeight * 0.8) sec.classList.add("on");
    const n = cartas.length;
    const sube = new Array(n).fill(0);
    for (let j = 1; j < n; j++) {
      const t = cartas[j].getBoundingClientRect().top;
      // 0 cuando asoma por el borde de abajo de la anterior, 1 cuando ya esta pegada
      sube[j] = clamp((fondo - t) / Math.max(1, fondo - topes[j]));
    }
    // lo hundida que queda cada una: cuantas tarjetas tiene ya encima
    let encima = 0;
    for (let i = n - 1; i >= 0; i--) {
      const h = Math.min(encima, 4);
      if (!quieto && Math.abs(h - hundido[i]) > 0.002) {
        hundido[i] = h;
        caras[i].style.transform = h > 0 ? "scale(" + (1 - 0.035 * h).toFixed(4) + ")" : "";
        if (velos[i]) velos[i].style.opacity = (0.55 * Math.min(1, h)).toFixed(3);
      }
      encima += sube[i];
    }
    let k = 0;
    for (let j = 1; j < n; j++) if (sube[j] >= 0.5) k = j;
    if (k !== activo) marcar(k);
  }

  function marcar(i) {
    activo = i;
    caras.forEach((c, k) => c.classList.toggle("act", k === i));
    if (nEl) nEl.textContent = String(i + 1).padStart(2, "0");
    if (ttEl) ttEl.textContent = titulo(i);
    if (wEl) wEl.textContent = aviso(i);
    segs.forEach((s, k) => { s.classList.toggle("on", k < i); s.classList.toggle("now", k === i); });
  }

  function pedir() { if (!cola) { cola = true; requestAnimationFrame(cuadro); } }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => { cerca = es[0].isIntersecting; if (cerca) pedir(); }, { rootMargin: "120px 0px" }).observe(sec);
  } else cerca = true;
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", medir);
  window.addEventListener("load", medir);
  if ("ResizeObserver" in window) new ResizeObserver(medir).observe(head);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
  medir();
})();
