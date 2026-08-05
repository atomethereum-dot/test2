(() => {
  const stage = document.getElementById("showcaseStage");
  const logo = document.getElementById("showcaseLogo");
  const glow = document.getElementById("showcaseGlow");
  if (!stage || !logo) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const MAX_TILT = 16;
  const MAX_MOVE = 26;
  const EASE = 0.08;

  let targetRX = 0, targetRY = 0;
  let curRX = 0, curRY = 0;
  let targetMX = 0, targetMY = 0;
  let curMX = 0, curMY = 0;
  let rafId = null;

  function onMove(e) {
    const rect = stage.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetRY = nx * MAX_TILT;
    targetRX = -ny * MAX_TILT;
    targetMX = nx * MAX_MOVE;
    targetMY = ny * MAX_MOVE;
    schedule();
  }

  function onLeave() {
    targetRX = 0;
    targetRY = 0;
    targetMX = 0;
    targetMY = 0;
    schedule();
  }

  function schedule() {
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    rafId = null;
    curRX += (targetRX - curRX) * EASE;
    curRY += (targetRY - curRY) * EASE;
    curMX += (targetMX - curMX) * EASE;
    curMY += (targetMY - curMY) * EASE;

    logo.style.transform =
      `translate(${curMX}px, ${curMY}px) rotateX(${curRX}deg) rotateY(${curRY}deg)`;
    if (glow) {
      glow.style.transform = `translate(${curMX * 0.5}px, ${curMY * 0.5}px)`;
    }

    const settled =
      Math.abs(targetRX - curRX) < 0.01 &&
      Math.abs(targetRY - curRY) < 0.01 &&
      Math.abs(targetMX - curMX) < 0.01 &&
      Math.abs(targetMY - curMY) < 0.01;
    if (!settled) schedule();
  }

  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);
})();
