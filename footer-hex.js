(() => {
  const container = document.getElementById("footerHex");
  if (!container) return;

  const ROWS = 6;
  const COLS = 16;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let html = "";
  for (let r = 0; r < ROWS; r++) {
    const offsetClass = r % 2 === 1 ? " footer-hex-row--offset" : "";
    html += `<div class="footer-hex-row${offsetClass}">`;
    for (let c = 0; c < COLS; c++) {
      const variant = 1 + ((r + c) % 3);
      const style = reduced
        ? ""
        : `animation-duration:${(3 + Math.random() * 2.5).toFixed(2)}s;animation-delay:${(-Math.random() * 5).toFixed(2)}s`;
      html += `<span class="footer-hex-tile footer-hex-tile--${variant}" style="${style}"></span>`;
    }
    html += `</div>`;
  }
  container.innerHTML = html;
})();
