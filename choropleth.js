(() => {
  const wrap = document.querySelector(".choro-map-wrap");
  const viewport = document.getElementById("choroViewport");
  const zoomInBtn = document.getElementById("choroZoomIn");
  const zoomOutBtn = document.getElementById("choroZoomOut");
  const slider = document.getElementById("choroSlider");
  const legendDot = document.getElementById("choroLegendDot");
  const legendName = document.getElementById("choroLegendName");
  if (!viewport || typeof CHORO_RANKED === "undefined") return;

  let zoom = 1;
  let panX = 0;
  let panY = 0;
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 3.2;
  const ZOOM_STEP = 0.4;

  function clampPan() {
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const maxX = (rect.width * (zoom - 1)) / 2;
    const maxY = (rect.height * (zoom - 1)) / 2;
    panX = Math.max(-maxX, Math.min(maxX, panX));
    panY = Math.max(-maxY, Math.min(maxY, panY));
  }

  function applyTransform() {
    viewport.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    viewport.classList.toggle("is-zoomed", zoom > ZOOM_MIN);
  }

  function setZoom(next) {
    zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next));
    if (zoom === ZOOM_MIN) {
      panX = 0;
      panY = 0;
    } else {
      clampPan();
    }
    applyTransform();
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => setZoom(zoom + ZOOM_STEP));
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => setZoom(zoom - ZOOM_STEP));
  }

  // Drag-to-pan (mouse + touch via Pointer Events) once zoomed in
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startPanX = 0;
  let startPanY = 0;

  viewport.addEventListener("pointerdown", (e) => {
    if (zoom === ZOOM_MIN) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startPanX = panX;
    startPanY = panY;
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add("is-dragging");
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    panX = startPanX + (e.clientX - startX);
    panY = startPanY + (e.clientY - startY);
    clampPan();
    applyTransform();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("is-dragging");
    if (e.pointerId !== undefined && viewport.hasPointerCapture(e.pointerId)) {
      viewport.releasePointerCapture(e.pointerId);
    }
  }
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  window.addEventListener("resize", clampPan);

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
