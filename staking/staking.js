(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- hero pixel grid: same ambient cell system as the main site's cover
  // and the security page (walkers + random pops + decay), recolored to gray ----
  (() => {
    const canvas = document.getElementById("stakeGrid");
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

    // solo se detiene si la portada sale del viewport por scroll; sigue
    // corriendo aunque se cambie de pestana (setInterval, a diferencia de
    // requestAnimationFrame, el navegador no lo suspende en segundo plano)
    let last = performance.now(), visible = true;
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { rootMargin: "10% 0px" }).observe(hero);

    function frame() {
      const t = performance.now();
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
    if (reduced) { draw(); } else { setInterval(frame, 16); }

    // ---- pointer: lights up the exact cell under the cursor, same effect
    // used across the site's other grid covers ----
    window.addEventListener("pointermove", (e) => {
      if (!heat) return;
      const rect = canvas.getBoundingClientRect();
      const c = ((e.clientX - rect.left) / CELL) | 0;
      const r = ((e.clientY - rect.top) / CELL) | 0;
      if (c >= 0 && r >= 0 && c < cols && r < rows &&
          e.clientY >= rect.top && e.clientY <= rect.bottom) heat[idx(c, r)] = 1;
    }, { passive: true });
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
  const monthlyRate = Math.pow(1 + APY, 1 / 12) - 1;

  function recalc() {
    const input = document.getElementById("sectIn");
    const amt = input ? parseFloat(input.value) || 0 : 0;
    const yearly = amt * APY;
    const monthly = yearly / 12;
    const daily = yearly / 365;
    const outDay = document.getElementById("outDay");
    const outMonth = document.getElementById("outMonth");
    const outYear = document.getElementById("outYear");
    const outYearSm = document.getElementById("outYearSm");
    if (outDay) outDay.textContent = fmtNum(daily) + " #SECT";
    if (outMonth) outMonth.textContent = fmtNum(monthly) + " #SECT";
    if (outYear) outYear.textContent = fmtNum(yearly) + " #SECT";
    if (outYearSm) outYearSm.textContent = fmtNum(yearly) + " #SECT";
    drawGrowthChart(amt || 1000);
  }
  const sectInput = document.getElementById("sectIn");
  if (sectInput) sectInput.addEventListener("input", recalc);
  recalc();

  // ---- APY ring gauge ----
  function drawRingGauge(canvas, segments, opts) {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth || canvas.width;
    const cssH = canvas.clientHeight || canvas.height;
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cx = cssW / 2, cy = cssH / 2;
    const r = Math.min(cx, cy) - (opts.stroke / 2) - 2;
    const start = -Math.PI / 2;
    ctx.clearRect(0, 0, cssW, cssH);

    // track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,.07)";
    ctx.lineWidth = opts.stroke;
    ctx.stroke();

    let a0 = start;
    segments.forEach((seg) => {
      const a1 = a0 + Math.PI * 2 * seg.frac;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a1);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = opts.stroke;
      ctx.lineCap = "round";
      if (opts.glow) { ctx.shadowColor = seg.color; ctx.shadowBlur = 10; }
      ctx.stroke();
      ctx.shadowBlur = 0;
      a0 = a1;
    });
  }

  const apyRing = document.getElementById("apyRing");
  const splitRing = document.getElementById("splitRing");
  function paintRings() {
    drawRingGauge(apyRing, [{ frac: 0.149, color: "#4d8dff" }], { stroke: 9, glow: true });
    drawRingGauge(splitRing, [
      { frac: 0.80, color: "#1569ff" },
      { frac: 0.20, color: "#e8b45c" },
    ], { stroke: 10, glow: false });
  }
  paintRings();
  window.addEventListener("resize", () => { clearTimeout(window.__ringRt); window.__ringRt = setTimeout(paintRings, 150); });

  // ---- 12-month compounding growth chart ----
  function drawGrowthChart(principal) {
    const canvas = document.getElementById("growthChart");
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth || 600;
    const cssH = canvas.clientHeight || 180;
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const months = 13;
    const values = [];
    let v = principal;
    for (let i = 0; i < months; i++) { values.push(v); v *= 1 + monthlyRate; }
    const max = Math.max(...values) * 1.06;
    const min = Math.min(...values) * 0.98;
    const padL = 4, padR = 4, padT = 10, padB = 10;
    const plotW = cssW - padL - padR, plotH = cssH - padT - padB;
    const x = (i) => padL + (i / (months - 1)) * plotW;
    const y = (val) => padT + plotH - ((val - min) / (max - min || 1)) * plotH;

    // gridlines
    ctx.strokeStyle = "rgba(255,255,255,.06)";
    ctx.lineWidth = 1;
    for (let g = 0; g <= 3; g++) {
      const gy = padT + (plotH / 3) * g;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(cssW - padR, gy); ctx.stroke();
    }

    // area fill
    const grad = ctx.createLinearGradient(0, padT, 0, cssH - padB);
    grad.addColorStop(0, "rgba(77,141,255,.28)");
    grad.addColorStop(1, "rgba(77,141,255,0)");
    ctx.beginPath();
    ctx.moveTo(x(0), y(values[0]));
    values.forEach((val, i) => ctx.lineTo(x(i), y(val)));
    ctx.lineTo(x(months - 1), cssH - padB);
    ctx.lineTo(x(0), cssH - padB);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    values.forEach((val, i) => { const px = x(i), py = y(val); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
    ctx.strokeStyle = "#4d8dff";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // endpoint dot
    const ex = x(months - 1), ey = y(values[months - 1]);
    ctx.beginPath();
    ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#4d8dff";
    ctx.shadowColor = "#4d8dff";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // ---- 3D tilt on every panel card: pointer-tracked perspective rotation
  // plus a glare sweep, matching a premium fintech "hover depth" feel ----
  if (!reduced && !window.matchMedia("(pointer:coarse)").matches) {
    const TILT_MAX = 7; // degrees
    document.querySelectorAll(".panel").forEach((card) => {
      let raf = 0;
      function onMove(e) {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          const ry = (px - 0.5) * TILT_MAX * 2;
          const rx = (0.5 - py) * TILT_MAX * 2;
          card.style.setProperty("--rx", rx.toFixed(2) + "deg");
          card.style.setProperty("--ry", ry.toFixed(2) + "deg");
          card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
          card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        });
      }
      card.addEventListener("pointerenter", () => card.classList.add("tilting"));
      card.addEventListener("pointermove", onMove, { passive: true });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  // ---- hero parallax: background layers drift at different rates as the
  // pointer moves, giving the cover a sense of depth ----
  (() => {
    const hero = document.querySelector(".hero");
    if (!hero || reduced || window.matchMedia("(pointer:coarse)").matches) return;
    let raf = 0, tx = 0, ty = 0;
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        hero.style.setProperty("--px", tx.toFixed(3));
        hero.style.setProperty("--py", ty.toFixed(3));
      });
    }, { passive: true });
    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--px", "0");
      hero.style.setProperty("--py", "0");
    });
  })();

  // ---- reveal on scroll ----
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  }

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

/* ===== footer: ported from the main site =====
   local time, copy-to-clipboard, back-to-top, watermark that follows the
   scroll, and a very dim version of the hero's cell grid. Everything stops
   when the footer is off-screen. */
(() => {
  const ft = document.getElementById("footer");
  if (!ft) return;

  const y = document.getElementById("ft-year");
  if (y) y.textContent = new Date().getFullYear();

  const t = document.getElementById("ft-time");
  let clock = null, visible = false;
  function tick() {
    if (!t) return;
    try {
      t.textContent = new Date().toLocaleTimeString("en-US", { timeZone: "America/Chicago", hour12: false });
    } catch (e) {
      t.textContent = new Date().toLocaleTimeString("en-US", { hour12: false });
    }
  }

  const word = document.getElementById("ft-word");
  let pending = false;
  function moveWord() {
    if (pending || !visible || !word) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      const r = ft.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, 1 - r.top / window.innerHeight));
      word.style.transform = "translateX(-50%) translateY(" + ((1 - p) * 34).toFixed(1) + "px)";
      word.style.opacity = (0.012 + p * 0.03).toFixed(3);
    });
  }
  window.addEventListener("scroll", moveWord, { passive: true });

  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (visible) {
      tick();
      if (!clock) clock = setInterval(tick, 1000);
      moveWord();
    } else if (clock) { clearInterval(clock); clock = null; }
  }, { rootMargin: "20% 0px" }).observe(ft);

  ft.addEventListener("click", async (e) => {
    const b = e.target.closest(".ft-copy");
    if (!b) return;
    const txt = b.dataset.copy;
    let ok = false;
    try {
      await navigator.clipboard.writeText(txt);
      ok = true;
    } catch (err) {
      try {
        const ta = document.createElement("textarea");
        ta.value = txt; ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (e2) { ok = false; }
    }
    b.textContent = ok ? "Copied" : "Select";
    b.classList.toggle("ok", ok);
    clearTimeout(b._t);
    b._t = setTimeout(() => { b.textContent = "Copy"; b.classList.remove("ok"); }, 1800);
  });

  (() => {
    const cv = document.getElementById("ft-cells");
    if (!cv) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = cv.getContext("2d");
    const CELL = 54;
    let W = 0, H = 0, cols = 0, rows = 0, heat = null, tone = null, walkers = [];

    function resize() {
      const w = ft.clientWidth, h = ft.clientHeight;
      if (w < 1 || h < 1) return;
      W = w; H = h;
      const dpr = Math.min(window.devicePixelRatio || 1, reduced ? 1 : 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CELL); rows = Math.ceil(H / CELL);
      heat = new Float32Array(cols * rows);
      tone = new Float32Array(cols * rows);
      for (let i = 0; i < tone.length; i++) tone[i] = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
      const n = W < 700 ? 2 : 4;
      walkers = [];
      for (let i = 0; i < n; i++) walkers.push({
        c: (Math.random() * cols) | 0, r: (Math.random() * rows) | 0,
        dc: Math.random() < 0.5 ? 1 : -1, dr: 0, next: 0,
      });
    }
    const idx = (c, r) => r * cols + c;

    function stepWalkers(t) {
      for (const w of walkers) {
        if (t < w.next) continue;
        w.next = t + 240 + Math.random() * 320;
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
      nextPop = t + 180 + Math.random() * 260;
      const n = 1 + ((Math.random() * 2) | 0);
      for (let k = 0; k < n; k++) {
        const i = idx((Math.random() * cols) | 0, (Math.random() * rows) | 0);
        const v = 0.35 + Math.random() * 0.35;
        if (heat[i] < v) heat[i] = v;
      }
    }

    let sweepStart = -1;
    function sweep(t) {
      if (sweepStart < 0) { sweepStart = t + 4000; return; }
      const f = t - sweepStart;
      if (f < 0) return;
      if (f > 2400) { sweepStart = t + 9000; return; }
      const front = (f / 2400) * (cols + rows);
      for (let r = 0; r < rows; r++) {
        const c0 = Math.round(front - r);
        for (let k = -1; k <= 1; k++) {
          const c = c0 + k;
          if (c >= 0 && c < cols) {
            const v = 0.22 * (1 - Math.abs(k) / 1.6);
            const i = idx(c, r);
            if (heat[i] < v) heat[i] = v;
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = idx(c, r);
          const v = heat[i];
          if (v > 0.015) {
            const g = tone[i];
            const R = (12 + 62 * g) | 0, G = (74 + 96 * g) | 0, B = (198 + 57 * g) | 0;
            ctx.fillStyle = "rgba(" + R + "," + G + "," + B + "," + (Math.min(v, 1) * 0.3).toFixed(3) + ")";
            ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1);
          }
        }
      }
    }

    let raf = 0, last = 0;
    function frame(t) {
      raf = visible ? requestAnimationFrame(frame) : 0;
      if (!visible || document.hidden || !heat) { last = t; return; }
      const dt = Math.min(t - last, 50); last = t;
      stepWalkers(t); pops(t); sweep(t);
      const decay = Math.pow(0.945, dt / 16.7);
      for (let i = 0; i < heat.length; i++) heat[i] *= decay;
      draw();
    }

    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 140); });
    resize();
    if (reduced) { draw(); return; }
    new IntersectionObserver((es) => {
      if (es[0].isIntersecting && !raf) raf = requestAnimationFrame(frame);
    }, { rootMargin: "25% 0px" }).observe(ft);
  })();

  const up = document.getElementById("ft-up");
  if (up) up.addEventListener("click", () => {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
  });
})();

/* ===== coordinate cursor: reticle + readout, same system used on the main
   site, security and dashboard — a thin crosshair plus a coordinate readout
   that follows the pointer, snapped to the same 54px cell grid, switching to
   a darker tone over light backgrounds. ===== */
(() => {
  const reticle = document.getElementById("reticle");
  const readout = document.getElementById("readout");
  if (!reticle || !readout) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rx = reticle.querySelector(".rx");
  const ry = reticle.querySelector(".ry");
  const CELL = 54;

  let claro = false, ultimaLum = 0;
  function fondoClaro(x, y) {
    if (performance.now() - ultimaLum < 140) return claro;
    ultimaLum = performance.now();
    let el = document.elementFromPoint(x, y);
    let n = 0;
    while (el && n < 6) {
      const bg = getComputedStyle(el).backgroundColor;
      const m = bg && bg.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const v = m[1].split(",").map(parseFloat);
        const a = v.length > 3 ? v[3] : 1;
        if (a > 0.35) {
          const L = (0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]) / 255;
          claro = L > 0.5;
          return claro;
        }
      }
      el = el.parentElement; n++;
    }
    return claro;
  }

  window.addEventListener("pointermove", (e) => {
    if (reduced) return;
    const gx = Math.floor((e.clientX + window.scrollX) / CELL) * CELL - window.scrollX;
    const gy = Math.floor((e.clientY + window.scrollY) / CELL) * CELL - window.scrollY;
    const cc = Math.floor((e.clientX + window.scrollX) / CELL);
    const cr = Math.floor((e.clientY + window.scrollY) / CELL);

    readout.style.transform = "translate3d(" + gx + "px," + gy + "px,0)";
    readout.textContent = String(Math.abs(cc) % 100).padStart(2, "0") + " · " + String(Math.abs(cr) % 100).padStart(2, "0");
    rx.style.transform = "translate3d(0," + gy + "px,0)";
    ry.style.transform = "translate3d(" + gx + "px,0,0)";
    reticle.classList.add("on");
    readout.classList.add("on");

    const cl2 = fondoClaro(e.clientX, e.clientY);
    reticle.classList.toggle("on-light", cl2);
    readout.classList.toggle("on-light", cl2);
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    reticle.classList.remove("on");
    readout.classList.remove("on");
  });
})();
