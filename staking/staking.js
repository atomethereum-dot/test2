(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- hero pixel grid: same ambient cell system as security/presale ----
  (() => {
    const canvas = document.getElementById("stkGrid");
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
  function fmtNum(n) { return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  const APY = 0.149;

  // ---- rewards calculator ----
  function recalc() {
    const input = document.getElementById("sectIn");
    const amt = input ? parseFloat(input.value) || 0 : 0;
    const yearly = amt * APY;
    const monthly = yearly / 12;
    const daily = yearly / 365;
    const outDay = document.getElementById("outDay");
    const outMonth = document.getElementById("outMonth");
    const outYear = document.getElementById("outYear");
    if (outDay) outDay.textContent = fmtNum(daily) + " #SECT";
    if (outMonth) outMonth.textContent = fmtNum(monthly) + " #SECT";
    if (outYear) outYear.textContent = fmtNum(yearly) + " #SECT";
  }
  const sectInput = document.getElementById("sectIn");
  if (sectInput) sectInput.addEventListener("input", recalc);
  recalc();

  // ---- simulated live network stats ----
  let staked = 1_840_000 + randInt(0, 40000);
  let stakers = 612 + randInt(0, 30);
  const stakedEl = document.getElementById("lvStaked");
  const stakersEl = document.getElementById("lvStakers");

  function paintStats() {
    if (stakedEl) stakedEl.textContent = Math.round(staked).toLocaleString("en-US") + " #SECT";
    if (stakersEl) stakersEl.textContent = stakers.toLocaleString("en-US");
  }
  paintStats();
  if (!reduced) {
    setInterval(() => {
      staked += rand(200, 3200);
      if (Math.random() < 0.6) stakers += randInt(0, 2);
      paintStats();
    }, 4600);
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
          connectBtn.textContent = "0x" + randHex(4) + "…" + randHex(4) + " — Stake #SECT";
        }, 850);
      } else {
        connectBtn.textContent = "Preview only — use the Dashboard";
        setTimeout(() => {
          connectBtn.textContent = "0x" + randHex(4) + "…" + randHex(4) + " — Stake #SECT";
        }, 1800);
      }
    });
  }

  // ---- network staking activity feed (simulated) ----
  const CHECK_ICON = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>';
  const STAKE_ICON = '<svg viewBox="0 0 24 24"><path d="M12 2v20M5 9l7-7 7 7M5 15l7 7 7-7"/></svg>';
  const feedList = document.getElementById("feedList");

  function timeAgoLabel(sec) {
    if (sec < 1) return "now";
    if (sec < 60) return sec + "s ago";
    return Math.floor(sec / 60) + "m ago";
  }

  function addFeedItem() {
    const isUnstake = Math.random() < 0.18;
    const amt = randInt(80, 42000);
    const row = document.createElement("div");
    row.className = "feed-item";
    row.dataset.born = Date.now();
    row.innerHTML = `
      <span class="feed-ic">${isUnstake ? CHECK_ICON : STAKE_ICON}</span>
      <span class="feed-tx"><b>0x${randHex(4)}…${randHex(4)}</b> ${isUnstake ? "unstaked" : "staked"} ${amt.toLocaleString("en-US")} #SECT</span>
      <span class="feed-meta">
        <span class="feed-tag">${isUnstake ? "unstake" : "stake"}</span>
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
      setInterval(addFeedItem, 5000);
      setInterval(refreshFeedTimes, 1000);
    }
  }
})();
