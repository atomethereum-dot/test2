(() => {
  const el = document.getElementById("sectionTransition");
  const barsEl = document.getElementById("sectionTransitionBars");
  if (!el || !barsEl) return;

  const BAR_COUNT = 90;
  const bars = [];
  const DARK = [6, 10, 18];
  const BRIGHT = [130, 195, 255];

  function colorFor(level) {
    const r = Math.round(DARK[0] + (BRIGHT[0] - DARK[0]) * level);
    const g = Math.round(DARK[1] + (BRIGHT[1] - DARK[1]) * level);
    const b = Math.round(DARK[2] + (BRIGHT[2] - DARK[2]) * level);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Smoothed random-walk brightness per bar, so bars cluster into dark
  // and bright bands (like a barcode) instead of pure per-bar noise.
  function buildBars() {
    barsEl.innerHTML = "";
    bars.length = 0;
    let level = Math.random();
    for (let i = 0; i < BAR_COUNT; i++) {
      level += (Math.random() - 0.5) * 0.5;
      level = Math.max(0.04, Math.min(1, level));
      const bar = document.createElement("div");
      bar.className = "section-transition-bar";
      bar.style.background = colorFor(level);
      barsEl.appendChild(bar);
      bars.push({ el: bar, level });
    }
  }
  buildBars();

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let flickerTimer = null;
  function startFlicker() {
    if (flickerTimer || reduced) return;
    flickerTimer = setInterval(() => {
      bars.forEach((bar) => {
        if (Math.random() < 0.35) {
          const next = Math.max(0.04, Math.min(1, bar.level + (Math.random() - 0.5) * 0.6));
          bar.level = next;
          bar.el.style.background = colorFor(next);
        }
      });
    }, 90);
  }
  function stopFlicker() {
    if (flickerTimer) {
      clearInterval(flickerTimer);
      flickerTimer = null;
    }
  }

  let ticking = false;
  function updateFromScroll() {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const mid = rect.top + rect.height / 2;
    const dist = Math.abs(mid - vh / 2);
    const range = vh / 2 + rect.height / 2;
    const proximity = 1 - Math.min(1, dist / range);
    const opacity = Math.max(0, Math.pow(proximity, 1.6));

    el.style.opacity = opacity.toFixed(3);
    el.style.pointerEvents = "none";

    if (opacity > 0.02) {
      startFlicker();
    } else {
      stopFlicker();
    }
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateFromScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", updateFromScroll);

  updateFromScroll();
})();
