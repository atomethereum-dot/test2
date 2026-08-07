(() => {
  const zone = document.querySelector(".section-fade");
  if (!zone) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    zone.style.background = "var(--white)";
    return;
  }

  const FROM = [0, 0, 0];
  const TO = [255, 255, 255];
  let ticking = false;

  function update() {
    ticking = false;
    const rect = zone.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height + vh;
    const scrolled = vh - rect.top;
    const progress = Math.min(1, Math.max(0, scrolled / total));

    const r = Math.round(FROM[0] + (TO[0] - FROM[0]) * progress);
    const g = Math.round(FROM[1] + (TO[1] - FROM[1]) * progress);
    const b = Math.round(FROM[2] + (TO[2] - FROM[2]) * progress);
    zone.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
