(() => {
  const stage = document.getElementById("showcaseStage");
  const logo = document.getElementById("showcaseLogo");
  const glow = document.getElementById("showcaseGlow");
  if (!stage || !logo) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const MAX_TILT = 16;
  const EASE = 0.08;

  let targetX = 0, targetY = 0;
  let curX = 0, curY = 0;
  let rafId = null;

  function onMove(e) {
    const rect = stage.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetY = nx * MAX_TILT;
    targetX = -ny * MAX_TILT;
    schedule();
  }

  function onLeave() {
    targetX = 0;
    targetY = 0;
    schedule();
  }

  function schedule() {
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    rafId = null;
    curX += (targetX - curX) * EASE;
    curY += (targetY - curY) * EASE;

    logo.style.transform = `rotateX(${curX}deg) rotateY(${curY}deg)`;
    if (glow) {
      glow.style.transform = `translate(${curY * -1.2}px, ${curX * 1.2}px)`;
    }

    if (Math.abs(targetX - curX) > 0.01 || Math.abs(targetY - curY) > 0.01) {
      schedule();
    }
  }

  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);
})();
