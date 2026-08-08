(() => {
  const section = document.getElementById("supply-scenarios");
  if (!section) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fmtPrice(n) {
    if (n >= 1000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function runBars() {
    section.querySelectorAll(".supply-bar-fill").forEach((fill) => {
      const pct = fill.dataset.pct;
      if (reduced) {
        fill.style.width = pct + "%";
        return;
      }
      requestAnimationFrame(() => {
        fill.style.width = pct + "%";
      });
    });
  }

  function animateCount(el) {
    const target = parseFloat(el.dataset.target);

    if (reduced) {
      el.textContent = fmtPrice(target);
      return;
    }

    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmtPrice(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function runCounts() {
    section.querySelectorAll("[data-count]").forEach(animateCount);
  }

  if (!("IntersectionObserver" in window)) {
    runBars();
    runCounts();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runBars();
          runCounts();
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(section);
})();
