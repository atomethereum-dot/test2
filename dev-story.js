/* ---- "Our Developments" mobile scrollytelling: below the dev-grid's own
   mobile breakpoint (799px) the card stack pins full-screen while
   scrolling and cards cross-fade in one at a time instead of swiping
   sideways. Desktop is untouched — the wrapper elements are
   display:contents there. ---- */
(() => {
  const wrap = document.getElementById("devStory");
  if (!wrap) return;
  const sticky = wrap.querySelector(".dev-story-sticky");
  const grid = document.getElementById("devGrid");
  const dotsEl = document.getElementById("devStoryDots");
  if (!sticky || !grid || !dotsEl) return;
  const cards = Array.from(grid.querySelectorAll(".dev-card"));
  if (!cards.length) return;

  const mq = window.matchMedia("(max-width: 799px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  dotsEl.innerHTML = cards.map(() => '<span class="dev-story-dot"></span>').join("");
  const dotEls = Array.from(dotsEl.querySelectorAll(".dev-story-dot"));

  let currentStage = -1;

  function applyStage(index) {
    cards.forEach((card, i) => card.classList.toggle("is-active", i === index));
    dotEls.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  }

  function stickyTopOffset() {
    const root = getComputedStyle(document.documentElement);
    const announce = parseFloat(root.getPropertyValue("--announce-h")) || 0;
    const nav = parseFloat(root.getPropertyValue("--nav-h")) || 0;
    return announce + nav;
  }

  function onScroll() {
    if (!mq.matches) return;
    const rect = wrap.getBoundingClientRect();
    const stageH = sticky.offsetHeight;
    const scrollRange = wrap.offsetHeight - stageH;
    if (scrollRange <= 0) {
      if (currentStage !== 0) {
        currentStage = 0;
        applyStage(0);
      }
      return;
    }
    const progressPx = stickyTopOffset() - rect.top;
    const p = Math.min(1, Math.max(0, progressPx / scrollRange));
    let stage = Math.floor(p * cards.length);
    if (stage >= cards.length) stage = cards.length - 1;
    if (stage < 0) stage = 0;
    if (stage !== currentStage) {
      currentStage = stage;
      applyStage(stage);
    }
  }

  let ticking = false;
  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      onScroll();
    });
  }

  function init() {
    currentStage = -1;
    applyStage(0);
    onScroll();
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  if (mq.addEventListener) {
    mq.addEventListener("change", init);
  } else if (mq.addListener) {
    mq.addListener(init);
  }
  document.addEventListener("sectora:langchange", () => window.setTimeout(onScroll, 60));

  if (reduced) {
    applyStage(0);
    return;
  }

  init();
})();
