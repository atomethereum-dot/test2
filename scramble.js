(() => {
  const el = document.querySelector("[data-scramble]");
  if (!el) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finalText = el.textContent;

  if (reduced) return;

  const CHARS = "!<>-_\\/[]{}=+*^?#$%&@~";

  function frameHTML(revealCount) {
    let html = "";
    for (let i = 0; i < finalText.length; i++) {
      const ch = finalText[i];
      if (ch === " ") {
        html += " ";
      } else if (i < revealCount) {
        html += `<span class="scramble-done">${ch}</span>`;
      } else {
        const rand = CHARS[(Math.random() * CHARS.length) | 0];
        html += `<span class="scramble-live">${rand}</span>`;
      }
    }
    el.innerHTML = html;
  }

  function run() {
    const len = finalText.length;
    let frame = 0;
    const stepFrames = 2;
    const timer = setInterval(() => {
      const revealCount = Math.min(len, Math.floor(frame / stepFrames));
      frameHTML(revealCount);
      frame++;
      if (revealCount >= len) {
        clearInterval(timer);
        el.textContent = finalText;
      }
    }, 28);
  }

  setTimeout(run, 1900);
})();
