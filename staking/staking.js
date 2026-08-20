(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
