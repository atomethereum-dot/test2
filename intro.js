(() => {
  const el = document.getElementById("loadIntro");
  const fill = document.getElementById("loadIntroFill");
  const markWrap = document.getElementById("loadIntroMarkWrap");
  if (!el) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.remove();
    return;
  }

  function dismiss() {
    if (markWrap) markWrap.classList.add("is-exiting");
    el.classList.add("is-hidden");
    setTimeout(() => el.remove(), 700);
  }

  function start() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (fill) fill.classList.add("is-filling");
      });
    });
    setTimeout(dismiss, 1550);
  }

  if (document.readyState === "complete") {
    start();
  } else {
    window.addEventListener("load", start);
  }

  // Safety net in case load never fires cleanly.
  setTimeout(dismiss, 3200);
})();
