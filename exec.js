(() => {
  const containers = document.querySelectorAll(".exec-bars");
  if (!containers.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function randomHeight() {
    if (Math.random() < 0.16) {
      return 55 + Math.random() * 40;
    }
    return 4 + Math.random() * 34;
  }

  containers.forEach((container) => {
    const isCandle = container.classList.contains("exec-bars--candle");
    const BAR_COUNT = isCandle ? 150 : 170;
    let html = "";
    for (let i = 0; i < BAR_COUNT; i++) {
      if (isCandle) {
        html += '<div class="exec-bar ' + (Math.random() < 0.55 ? "is-up" : "is-down") + '"></div>';
      } else {
        html += `<div class="exec-bar"></div>`;
      }
    }
    container.innerHTML = html;
    const bars = Array.from(container.querySelectorAll(".exec-bar"));

    function tick() {
      bars.forEach((bar) => {
        if (Math.random() < 0.5) {
          bar.style.height = `${Math.min(96, randomHeight())}%`;
          if (isCandle && Math.random() < 0.2) {
            const up = Math.random() < 0.55;
            bar.classList.toggle("is-up", up);
            bar.classList.toggle("is-down", !up);
          }
        }
      });
    }

    tick();
    if (!reduced) {
      setInterval(tick, 200);
    }
  });
})();
