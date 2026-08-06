(() => {
  const el = document.getElementById("loadIntro");
  if (!el) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.remove();
    return;
  }

  function dismiss() {
    el.classList.add("is-hidden");
    setTimeout(() => el.remove(), 700);
  }

  if (document.readyState === "complete") {
    setTimeout(dismiss, 500);
  } else {
    window.addEventListener("load", () => setTimeout(dismiss, 500));
  }

  // Safety net in case load never fires cleanly.
  setTimeout(dismiss, 2500);
})();
