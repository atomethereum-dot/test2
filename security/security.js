(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- hero pixel grid: same ambient cell system as the main site's
  // cover (walkers + random pops + decay), recolored to gray ----
  (() => {
    const canvas = document.getElementById("secGrid");
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
    // the main site's cover used to have ----
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

  const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  // ---- protected products grid ----
  const PRODUCTS = [
    { name: "Custody & Verification", metric: () => randInt(99990, 100000) / 1000 + "%", tag: "integrity" },
    { name: "Multi-Trade DEX", metric: () => randInt(1200, 4800).toLocaleString() + "/hr", tag: "requests screened" },
    { name: "Hash Market & Validators", metric: () => randInt(180, 420).toLocaleString(), tag: "nodes covered" },
    { name: "RWA Tokenization", metric: () => randInt(99990, 100000) / 1000 + "%", tag: "record integrity" },
    { name: "USD-SEC Stablecoin", metric: () => randInt(99990, 100000) / 1000 + "%", tag: "reserve checks" },
    { name: "L3 Network", metric: () => "100.00%", tag: "uptime" },
    { name: "Dashboard & Explorer data", metric: () => randInt(900, 3200).toLocaleString() + "/hr", tag: "feeds verified" },
  ];
  const prodGrid = document.getElementById("prodGrid");
  if (prodGrid) {
    prodGrid.innerHTML = PRODUCTS.map((p, i) => `
      <div class="prod-card">
        <div class="prod-top">
          <span class="prod-name">${p.name}</span>
          <span class="prod-status"><i class="dot"></i>Protected</span>
        </div>
        <div class="prod-metric"><b class="num" id="pm${i}">${p.metric()}</b><span>${p.tag}</span></div>
      </div>
    `).join("");
    if (!reduced) {
      setInterval(() => {
        PRODUCTS.forEach((p, i) => {
          const el = document.getElementById("pm" + i);
          if (el) el.textContent = p.metric();
        });
      }, 3200);
    }
  }

  // ---- live threat feed ----
  const THREATS = [
    { verb: "Replay attack blocked", target: "Custody Ledger" },
    { verb: "Signature forgery attempt blocked", target: "Multi-Trade DEX" },
    { verb: "Anomalous withdrawal pattern flagged", target: "Hash Market" },
    { verb: "Brute-force auth attempt blocked", target: "Validator Node" },
    { verb: "Malformed transaction rejected", target: "L3 Network" },
    { verb: "Rate-limit triggered on suspicious origin", target: "Explorer API" },
    { verb: "Key-rotation integrity check passed", target: "Custody Ledger" },
    { verb: "Unverified contract call blocked", target: "Multi-Trade DEX" },
    { verb: "Sybil-pattern node registration rejected", target: "Validator Node" },
    { verb: "Stale oracle price rejected", target: "USD-SEC Stablecoin" },
    { verb: "Duplicate custody claim rejected", target: "RWA Tokenization" },
    { verb: "Session token anomaly isolated", target: "Dashboard" },
  ];
  const feedList = document.getElementById("feedList");
  const threatCounter = document.getElementById("sThreats");
  let threatCount = 0;
  let lastThreat = null;

  function pickThreat() {
    let th = pick(THREATS);
    while (th === lastThreat) th = pick(THREATS);
    lastThreat = th;
    return th;
  }

  function timeAgoLabel(sec) {
    if (sec < 1) return "now";
    if (sec < 60) return sec + "s ago";
    return Math.floor(sec / 60) + "m ago";
  }

  function addFeedItem() {
    const th = pickThreat();
    const row = document.createElement("div");
    row.className = "feed-item";
    row.dataset.born = Date.now();
    row.innerHTML = `
      <span class="feed-ic">${CHECK_ICON}</span>
      <span class="feed-tx"><b>${th.verb}</b> · ${th.target}</span>
      <span class="feed-meta">
        <span class="feed-tag">${randHex(8)}</span>
        <span class="feed-t">now</span>
      </span>`;
    feedList.prepend(row);
    while (feedList.children.length > 24) feedList.removeChild(feedList.lastChild);

    threatCount += 1;
    if (threatCounter) threatCounter.textContent = threatCount.toLocaleString("en-US");
  }

  function refreshFeedTimes() {
    feedList.querySelectorAll(".feed-item").forEach((row) => {
      const sec = (Date.now() - Number(row.dataset.born)) / 1000;
      const t = row.querySelector(".feed-t");
      if (t) t.textContent = timeAgoLabel(sec);
    });
  }

  if (feedList) {
    for (let i = 0; i < 8; i++) addFeedItem();
    threatCount = randInt(1400, 3600);
    if (threatCounter) threatCounter.textContent = threatCount.toLocaleString("en-US");
    if (!reduced) {
      setInterval(addFeedItem, 2600);
      setInterval(refreshFeedTimes, 1000);
    }
  }

  // ---- integrity ledger ----
  const ledgerList = document.getElementById("ledgerList");
  const integrityEl = document.getElementById("sIntegrity");
  let verified = randInt(180000, 420000);

  function addLedgerItem() {
    const row = document.createElement("div");
    row.className = "ledger-item";
    row.dataset.born = Date.now();
    row.innerHTML = `
      <span class="ledger-ok">${CHECK_ICON}</span>
      <span class="ledger-id">0x${randHex(40)}</span>
      <span class="ledger-t">now</span>`;
    ledgerList.prepend(row);
    while (ledgerList.children.length > 18) ledgerList.removeChild(ledgerList.lastChild);

    verified += randInt(1, 6);
    if (integrityEl) integrityEl.textContent = "100.000%";
  }

  function refreshLedgerTimes() {
    ledgerList.querySelectorAll(".ledger-item").forEach((row) => {
      const sec = (Date.now() - Number(row.dataset.born)) / 1000;
      const t = row.querySelector(".ledger-t");
      if (t) t.textContent = timeAgoLabel(sec);
    });
  }

  if (ledgerList) {
    for (let i = 0; i < 6; i++) addLedgerItem();
    if (!reduced) {
      setInterval(addLedgerItem, 1900);
      setInterval(refreshLedgerTimes, 1000);
    }
  }

  // ---- resilience bars animate in on scroll ----
  const resBox = document.querySelector(".res-box");
  if (resBox && "IntersectionObserver" in window) {
    const bars = resBox.querySelectorAll(".res-bar i");
    bars.forEach((b) => { b.style.setProperty("--w0", b.style.getPropertyValue("--w")); b.style.width = "0%"; });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          bars.forEach((b) => { b.style.width = getComputedStyle(b).getPropertyValue("--w"); });
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(resBox);
  }
})();

/* ===== coordinate cursor: reticle + readout, ported from the main site =====
   a thin crosshair plus a coordinate readout that follows the pointer,
   snapped to the same 54px cell grid used across the site, and switching
   to a darker tone over light backgrounds. */
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
