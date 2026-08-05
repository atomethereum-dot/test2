(() => {
  const starsLayer = document.querySelector(".hero-stars");
  if (starsLayer) {
    const STAR_COUNT = 70;
    let stars = "";
    for (let i = 0; i < STAR_COUNT; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 70;
      const size = Math.random() < 0.15 ? 2 : 1;
      const opacity = (Math.random() * 0.6 + 0.3).toFixed(2);
      stars += `<span style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;opacity:${opacity};animation-delay:${(Math.random() * 4).toFixed(2)}s"></span>`;
    }
    starsLayer.innerHTML = stars;
  }

  const words = document.querySelectorAll("#heroWords li");
  if (words.length) {
    let active = 0;
    setInterval(() => {
      words[active].classList.remove("active");
      active = (active + 1) % words.length;
      words[active].classList.add("active");
    }, 2600);
  }

  const stage = document.getElementById("heroCenterpiece");
  const mark = document.getElementById("heroMark");
  const glow = document.getElementById("heroMarkGlow");
  if (!stage || !mark) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const MAX_TILT = 10;
  const MAX_MOVE = 20;
  const EASE = 0.07;

  let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;
  let targetMX = 0, targetMY = 0, curMX = 0, curMY = 0;
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

    mark.style.transform =
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

  window.addEventListener("pointermove", onMove);
  document.addEventListener("mouseleave", onLeave);
})();
