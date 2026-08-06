(() => {
  const particleLayer = document.getElementById("stackParticles");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (particleLayer) {
    const COUNT = 26;
    let html = "";
    for (let i = 0; i < COUNT; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = 1 + Math.random() * 2;
      const duration = (3 + Math.random() * 4).toFixed(2);
      const delay = (-Math.random() * 6).toFixed(2);
      html += `<span style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;animation-duration:${duration}s;animation-delay:${delay}s"></span>`;
    }
    particleLayer.innerHTML = html;
  }

  const captions = document.querySelectorAll(".stack-caption");

  if (captions.length) {
    if (reduced || !("IntersectionObserver" in window)) {
      captions.forEach((el) => el.classList.add("active"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("active", entry.isIntersecting);
          });
        },
        { threshold: 0.5 }
      );
      captions.forEach((el) => observer.observe(el));
    }
  }

  const stackSection = document.querySelector(".stack");
  const layers = document.querySelectorAll(".stack-layer");
  if (!stackSection || !layers.length || reduced) return;

  const MAX_OFFSET = 34;
  let rafId = null;

  function updateExplode() {
    rafId = null;
    const rect = stackSection.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
    layers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth || "0");
      layer.style.transform = `translateY(${(depth * MAX_OFFSET * progress).toFixed(2)}px)`;
      if (depth !== 0) {
        layer.style.opacity = `${(1 - progress * 0.6).toFixed(2)}`;
      }
    });
  }

  function scheduleExplode() {
    if (rafId === null) rafId = requestAnimationFrame(updateExplode);
  }

  window.addEventListener("scroll", scheduleExplode, { passive: true });
  window.addEventListener("resize", scheduleExplode);
  updateExplode();
})();
