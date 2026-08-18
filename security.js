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
