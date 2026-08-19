(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- hero pixel grid: same ambient cell system as the security page ----
  (() => {
    const canvas = document.getElementById("preGrid");
    if (!canvas) return;
    const hero = canvas.closest(".hero");
    const ctx = canvas.getContext("2d");
    const CELL = 54;
    let cols = 0, rows = 0, heat = null, tone = null, W = 0, H = 0, dpr = 1;

    const lineLayer = document.createElement("canvas");
    const lctx = lineLayer.getContext("2d");

    function paintLines() {
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lctx.clearRect(0, 0, W, H);
      lctx.lineWidth = 1;
      lctx.strokeStyle = "rgba(255,255,255,.034)";
      lctx.beginPath();
      for (let c = 0; c <= cols; c++) { lctx.moveTo(c * CELL + 0.5, 0); lctx.lineTo(c * CELL + 0.5, H); }
      for (let r = 0; r <= rows; r++) { lctx.moveTo(0, r * CELL + 0.5); lctx.lineTo(W, r * CELL + 0.5); }
      lctx.stroke();
    }

    function rnd(c, r) {
      const x = Math.sin(c * 127.1 + r * 311.7) * 43758.5453;
      return x - Math.floor(x);
    }

    function resize() {
      const w = hero.clientWidth, h = hero.clientHeight;
      if (w < 1 || h < 1) return;
      W = w; H = h;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CELL); rows = Math.ceil(H / CELL);
      heat = new Float32Array(cols * rows);
      tone = new Float32Array(cols * rows);
      for (let i = 0; i < tone.length; i++) tone[i] = rnd(i % cols, (i / cols) | 0);
      lineLayer.width = W * dpr; lineLayer.height = H * dpr;
      paintLines();
      seedWalkers();
    }
    const idx = (c, r) => r * cols + c;

    let walkers = [];
    function seedWalkers() {
      const n = W < 700 ? 4 : 7;
      walkers = [];
      for (let i = 0; i < n; i++) walkers.push({
        c: (Math.random() * cols) | 0, r: (Math.random() * rows) | 0,
        dc: Math.random() < 0.5 ? 1 : -1, dr: 0, next: 0,
      });
    }
    function stepWalkers(t) {
      for (const w of walkers) {
        if (t < w.next) continue;
        w.next = t + 105 + Math.random() * 130;
        if (Math.random() < 0.3) {
          if (w.dc !== 0) { w.dr = Math.random() < 0.5 ? 1 : -1; w.dc = 0; }
          else { w.dc = Math.random() < 0.5 ? 1 : -1; w.dr = 0; }
        }
        w.c += w.dc; w.r += w.dr;
        if (w.c < 0) { w.c = 0; w.dc = 1; }
        if (w.c >= cols) { w.c = cols - 1; w.dc = -1; }
        if (w.r < 0) { w.r = 0; w.dr = 1; }
        if (w.r >= rows) { w.r = rows - 1; w.dr = -1; }
        heat[idx(w.c, w.r)] = 0.5;
      }
    }

    let nextPop = 0;
    function pops(t) {
      if (t < nextPop) return;
      nextPop = t + 80 + Math.random() * 90;
      const n = 2 + ((Math.random() * 3) | 0);
      for (let k = 0; k < n; k++) {
        const i = idx((Math.random() * cols) | 0, (Math.random() * rows) | 0);
        const v = 0.55 + Math.random() * 0.4;
        if (heat[i] < v) heat[i] = v;
      }
    }

    function draw() {
      if (!heat) return;
      ctx.clearRect(0, 0, W, H);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = idx(c, r);
          const v = heat[i];
          if (v > 0.015) {
            const g = tone[i];
            const s = (100 + 70 * g) | 0;
            ctx.fillStyle = "rgba(" + s + "," + s + "," + s + "," + (Math.min(v, 1) * 0.5).toFixed(3) + ")";
            ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
          }
        }
      }
      if (lineLayer.width > 1) ctx.drawImage(lineLayer, 0, 0, W, H);
    }

    let last = 0, visible = true;
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { rootMargin: "10% 0px" }).observe(hero);
    document.addEventListener("visibilitychange", () => { visible = visible && !document.hidden; });

    function frame(t) {
      requestAnimationFrame(frame);
      if (!visible) { last = t; return; }
      if (!lineLayer.width) { resize(); if (!lineLayer.width) { last = t; return; } }
      const dt = Math.min(t - last, 50); last = t;
      stepWalkers(t);
      pops(t);
      const decay = Math.pow(0.922, dt / 16.7);
      for (let i = 0; i < heat.length; i++) heat[i] *= decay;
      draw();
    }

    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
    resize();
    if (reduced) { draw(); } else { requestAnimationFrame(frame); }
  })();

  function rand(min, max) { return min + Math.random() * (max - min); }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function randHex(len) {
    let s = "";
    for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 16).toString(16);
    return s;
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function fmtUSD(n) { return "$" + Math.round(n).toLocaleString("en-US"); }

  const PRICE = 0.07;
  const GOAL = 2_000_000;
  const TIERS = [
    { id: "tier1", from: 0, to: 500_000, bonus: 0.15 },
    { id: "tier2", from: 500_000, to: 1_250_000, bonus: 0.08 },
    { id: "tier3", from: 1_250_000, to: 2_000_000, bonus: 0 },
  ];

  const CLOSE_AT = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const closesOnEl = document.getElementById("closesOn");
  if (closesOnEl) {
    closesOnEl.textContent = CLOSE_AT.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) + " UTC";
  }

  function currentTier(raised) {
    return TIERS.find((t) => raised >= t.from && raised < t.to) || TIERS[TIERS.length - 1];
  }

  function fmtCountdown(ms) {
    if (ms <= 0) return "closed";
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return d + "d " + h + "h " + m + "m";
  }

  function tickCountdown() {
    const ms = CLOSE_AT - Date.now();
    const label = fmtCountdown(ms);
    const top = document.getElementById("topCountdown");
    if (top) top.textContent = label;
  }
  tickCountdown();
  setInterval(tickCountdown, 60000);

  // ---- simulated live raise progress ----
  let raised = 214_300;
  let buyers = 386;
  const raisedEl = document.getElementById("pcRaised");
  const fillEl = document.getElementById("pcFill");
  const pctEl = document.getElementById("pcPct");
  const buyersEl = document.getElementById("pcBuyers");
  const breakdownPriceEl = document.querySelector("#buyBreakdown div:first-child b");

  function paintProgress() {
    const pct = Math.min(100, (raised / GOAL) * 100);
    if (raisedEl) raisedEl.textContent = fmtUSD(raised);
    if (fillEl) fillEl.style.setProperty("--w", pct.toFixed(2) + "%");
    if (pctEl) pctEl.textContent = pct.toFixed(1) + "%";
    if (buyersEl) buyersEl.textContent = buyers.toLocaleString("en-US") + " buyers";

    const active = currentTier(raised);
    TIERS.forEach((t) => {
      const el = document.getElementById(t.id);
      if (!el) return;
      el.classList.toggle("on", t.id === active.id);
      el.classList.toggle("done", raised >= t.to);
    });
    recalcBuy(active);
  }

  function recalcBuy(activeTier) {
    const tier = activeTier || currentTier(raised);
    const input = document.getElementById("usdtIn");
    const usdt = input ? parseFloat(input.value) || 0 : 0;
    const base = usdt / PRICE;
    const bonus = base * tier.bonus;
    const out = base + bonus;
    const sectOut = document.getElementById("sectOut");
    const bBase = document.getElementById("bBase");
    const bBonus = document.getElementById("bBonus");
    if (sectOut) sectOut.textContent = out.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (bBase) bBase.textContent = base.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " #SECT";
    if (bBonus) bBonus.textContent = "+" + bonus.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " #SECT (" + Math.round(tier.bonus * 100) + "%)";
  }

  const usdtInput = document.getElementById("usdtIn");
  if (usdtInput) usdtInput.addEventListener("input", () => recalcBuy());

  paintProgress();
  if (!reduced) {
    setInterval(() => {
      if (raised >= GOAL) return;
      raised = Math.min(GOAL, raised + rand(180, 2400));
      if (Math.random() < 0.7) buyers += randInt(1, 3);
      paintProgress();
    }, 4200);
  }

  // ---- wallet connect (simulated preview, no real wallet integration) ----
  const connectBtn = document.getElementById("connectBtn");
  let connected = false;
  if (connectBtn) {
    connectBtn.addEventListener("click", () => {
      if (connectBtn.disabled) return;
      if (!connected) {
        connectBtn.disabled = true;
        connectBtn.textContent = "Connecting…";
        setTimeout(() => {
          connected = true;
          connectBtn.disabled = false;
          connectBtn.textContent = "0x" + randHex(4) + "…" + randHex(4) + " — Buy #SECT";
        }, 850);
      } else {
        connectBtn.textContent = "Preview only — not live yet";
        setTimeout(() => {
          connectBtn.textContent = "0x" + randHex(4) + "…" + randHex(4) + " — Buy #SECT";
        }, 1800);
      }
    });
  }

  // ---- live commitments feed (simulated) ----
  const CHECK_ICON = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>';
  const feedList = document.getElementById("feedList");

  function timeAgoLabel(sec) {
    if (sec < 1) return "now";
    if (sec < 60) return sec + "s ago";
    return Math.floor(sec / 60) + "m ago";
  }

  function addFeedItem() {
    const amt = randInt(50, 24000);
    const tier = currentTier(raised);
    const sect = (amt / PRICE) * (1 + tier.bonus);
    const row = document.createElement("div");
    row.className = "feed-item";
    row.dataset.born = Date.now();
    row.innerHTML = `
      <span class="feed-ic">${CHECK_ICON}</span>
      <span class="feed-tx"><b>0x${randHex(4)}…${randHex(4)}</b> committed ${fmtUSD(amt)} → ${sect.toLocaleString("en-US", { maximumFractionDigits: 0 })} #SECT</span>
      <span class="feed-meta">
        <span class="feed-tag">${tier.id}</span>
        <span class="feed-t">now</span>
      </span>`;
    feedList.prepend(row);
    while (feedList.children.length > 24) feedList.removeChild(feedList.lastChild);
  }

  function refreshFeedTimes() {
    feedList.querySelectorAll(".feed-item").forEach((row) => {
      const sec = (Date.now() - Number(row.dataset.born)) / 1000;
      const t = row.querySelector(".feed-t");
      if (t) t.textContent = timeAgoLabel(sec);
    });
  }

  if (feedList) {
    for (let i = 0; i < 7; i++) addFeedItem();
    if (!reduced) {
      setInterval(addFeedItem, 5200);
      setInterval(refreshFeedTimes, 1000);
    }
  }
})();
