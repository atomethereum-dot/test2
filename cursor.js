(() => {
  const glow = document.getElementById("cursorLight");
  if (!glow) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  let visible = false;

  window.addEventListener("pointermove", (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    if (!visible) {
      glow.style.opacity = "1";
      visible = true;
    }
  });

  document.addEventListener("mouseleave", () => {
    glow.style.opacity = "0";
    visible = false;
  });
})();
