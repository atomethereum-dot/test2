/* ===== coordinate cursor: reticle + readout, ported from the main site =====
   a thin crosshair plus a coordinate readout that follows the pointer,
   snapped to the same 54px cell grid used across the site, and switching
   to a darker tone over light backgrounds. */
(() => {
  const reticle = document.getElementById("reticle");
  const readout = document.getElementById("readout");
  if (!reticle || !readout) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rx = reticle.querySelector(".rx");
  const ry = reticle.querySelector(".ry");
  const CELL = 54;

  let claro = false, ultimaLum = 0;
  function fondoClaro(x, y) {
    if (performance.now() - ultimaLum < 140) return claro;
    ultimaLum = performance.now();
    let el = document.elementFromPoint(x, y);
    let n = 0;
    while (el && n < 6) {
      const bg = getComputedStyle(el).backgroundColor;
      const m = bg && bg.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const v = m[1].split(",").map(parseFloat);
        const a = v.length > 3 ? v[3] : 1;
        if (a > 0.35) {
          const L = (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255;
          claro = L > 0.5;
          return claro;
        }
      }
      el = el.parentElement; n++;
    }
    return claro;
  }

  window.addEventListener("pointermove", (e) => {
    if (reduced) return;
    // el dashboard no tiene la cuadricula de fondo que si tienen la
    // portada y security: aqui la cruz sigue al cursor pixel a pixel en
    // vez de saltar de celda en celda, para que se sienta fluida
    const cc = Math.floor((e.clientX + window.scrollX) / CELL);
    const cr = Math.floor((e.clientY + window.scrollY) / CELL);

    readout.style.transform = "translate3d(" + e.clientX + "px," + e.clientY + "px,0)";
    readout.textContent = String(Math.abs(cc) % 100).padStart(2, "0") + " · " + String(Math.abs(cr) % 100).padStart(2, "0");
    rx.style.transform = "translate3d(0," + e.clientY + "px,0)";
    ry.style.transform = "translate3d(" + e.clientX + "px,0,0)";
    reticle.classList.add("on");
    readout.classList.add("on");

    const cl2 = fondoClaro(e.clientX, e.clientY);
    reticle.classList.toggle("on-light", cl2);
    readout.classList.toggle("on-light", cl2);
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    reticle.classList.remove("on");
    readout.classList.remove("on");
  });
})();
