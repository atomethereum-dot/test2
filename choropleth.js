(() => {
  const viewport = document.getElementById("choroViewport");
  const zoomInBtn = document.getElementById("choroZoomIn");
  const zoomOutBtn = document.getElementById("choroZoomOut");
  const slider = document.getElementById("choroSlider");
  const legendDot = document.getElementById("choroLegendDot");
  const legendName = document.getElementById("choroLegendName");
  if (!viewport || typeof CHORO_RANKED === "undefined") return;

  let zoom = 1;
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 3.2;
  const ZOOM_STEP = 0.4;

  function applyZoom() {
    viewport.style.transform = `scale(${zoom})`;
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      zoom = Math.min(ZOOM_MAX, zoom + ZOOM_STEP);
      applyZoom();
    });
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      zoom = Math.max(ZOOM_MIN, zoom - ZOOM_STEP);
      applyZoom();
    });
  }

  const countryPaths = document.querySelectorAll(".choro-country");
  const byName = new Map();
  countryPaths.forEach((el) => {
    byName.set(el.dataset.name, el);
  });

  let activeEl = null;

  function highlight(index) {
    const entry = CHORO_RANKED[index];
    if (!entry) return;
    const [name, value, color] = entry;

    if (activeEl) activeEl.classList.remove("is-active");
    const el = byName.get(name);
    if (el) {
      el.classList.add("is-active");
      activeEl = el;
    }

    if (legendDot) legendDot.style.background = color;
    if (legendName) legendName.textContent = name;
  }

  if (slider) {
    slider.max = String(CHORO_RANKED.length - 1);
    slider.addEventListener("input", () => {
      highlight(parseInt(slider.value, 10));
    });
    highlight(parseInt(slider.value, 10));
  }
})();
