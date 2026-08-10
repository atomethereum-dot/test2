(() => {
  const containers = document.querySelectorAll(".exec-bars");
  if (!containers.length) return;

  const BAR_COUNT = 170;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function randomHeight() {
    if (Math.random() < 0.16) {
      return 55 + Math.random() * 40;
    }
    return 4 + Math.random() * 34;
  }

  containers.forEach((container) => {
    let html = "";
    for (let i = 0; i < BAR_COUNT; i++) {
      html += `<div class="exec-bar"></div>`;
    }
    container.innerHTML = html;
    const bars = Array.from(container.querySelectorAll(".exec-bar"));

    function tick() {
      bars.forEach((bar) => {
        if (Math.random() < 0.5) {
          bar.style.height = `${Math.min(96, randomHeight())}%`;
        }
      });
    }

    tick();
    if (!reduced) {
      setInterval(tick, 200);
    }
  });
})();
