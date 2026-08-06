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
  if (!captions.length) return;

  if (reduced || !("IntersectionObserver" in window)) {
    captions.forEach((el) => el.classList.add("active"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("active", entry.isIntersecting);
      });
    },
    { threshold: 0.5 }
  );

  captions.forEach((el) => observer.observe(el));
})();
