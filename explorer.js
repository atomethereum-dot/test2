(function () {
  "use strict";

  /* ============================================================
     PRNG + basic random helpers (seeded, deterministic per load)
     ============================================================ */
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(20260809 ^ Date.now() & 0xffff);
  const HEX = "0123456789abcdef";
  function randHex(len) {
    let s = "";
    for (let i = 0; i < len; i++) s += HEX[(rand() * 16) | 0];
    return s;
  }
  function randAddress() { return "0x" + randHex(40); }
  function randTxHash() { return "0x" + randHex(64); }
  function pick(arr) { return arr[(rand() * arr.length) | 0]; }
  function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
  function randFloat(min, max) { return rand() * (max - min) + min; }
  function skewSmall(min, max) { return min + Math.pow(rand(), 2.4) * (max - min); }
  function weightedPick(pairs) {
    const total = pairs.reduce((s, p) => s + p[1], 0);
    let r = rand() * total;
    for (const [val, w] of pairs) { r -= w; if (r <= 0) return val; }
    return pairs[0][0];
  }

  /* ============================================================
     Chain identity + known addresses / tokens
     ============================================================ */
  const CHAIN = {
    name: "Sectora L3 Testnet",
    symbol: "SECT",
    layer: "Layer 3",
    settlesTo: "Ethereum",
    blockTimeMs: 2100,
    gasLimit: 30000000,
  };

  const KNOWN = new Map(); // address -> label
  function makeKnown(label) {
    const a = randAddress();
    KNOWN.set(a.toLowerCase(), label);
    return a;
  }

  const ADDR = {
    buyback: makeKnown("Sectora: Buyback Pool"),
    validatorRewards: makeKnown("Sectora: Validator Rewards"),
    bridge: makeKnown("Sectora: L2 Bridge"),
    hashMarket: makeKnown("Sectora: HashMarket"),
    dexRouter: makeKnown("Sectora: DEX Router"),
    usdxPool: makeKnown("Sectora: USDX Liquidity Pool"),
    treasury: makeKnown("Sectora: Foundation Treasury"),
    stakingPool: makeKnown("Sectora: Staking Pool"),
  };

  const VALIDATORS = [];
  for (let i = 1; i <= 9; i++) {
    VALIDATORS.push(makeKnown("Validator: sect-node-" + String(i).padStart(2, "0")));
  }

  const TOKENS = [
    { symbol: "SECT", name: "Sectora", kind: "Native", color: "#468ce6", price: 0.1034, supply: 50000000, holders: 8412, addr: makeKnown("Sectora Token") },
    { symbol: "xAU", name: "Tokenized Gold", kind: "RWA · Metal", color: "#d4af37", price: 2412.5, supply: 1240, holders: 318, addr: makeKnown("Sectora: xAU Vault") },
    { symbol: "xAG", name: "Tokenized Silver", kind: "RWA · Metal", color: "#b7bcc4", price: 28.65, supply: 18500, holders: 542, addr: makeKnown("Sectora: xAG Vault") },
    { symbol: "xSPX", name: "Tokenized S&P 500 Index", kind: "RWA · Index", color: "#14e0a0", price: 5487.2, supply: 640, holders: 214, addr: makeKnown("Sectora: xSPX Index Token") },
    { symbol: "xDJI", name: "Tokenized Dow Jones Index", kind: "RWA · Index", color: "#6c5ce7", price: 40120.75, supply: 210, holders: 96, addr: makeKnown("Sectora: xDJI Index Token") },
    { symbol: "xIXIC", name: "Tokenized Nasdaq Composite", kind: "RWA · Index", color: "#ff8a3d", price: 17890.4, supply: 480, holders: 141, addr: makeKnown("Sectora: xIXIC Index Token") },
    { symbol: "USDX", name: "Sectora USD", kind: "Stablecoin", color: "#3fae72", price: 1.0, supply: 12000000, holders: 1854, addr: makeKnown("Sectora: USDX Stablecoin") },
  ];
  const TOKEN_BY_SYMBOL = new Map(TOKENS.map((t) => [t.symbol.toLowerCase(), t]));
  const TOKEN_BY_ADDR = new Map(TOKENS.map((t) => [t.addr.toLowerCase(), t]));

  const METHODS_NATIVE = [
    ["Transfer", 34], ["Swap", 15], ["Approve", 10], ["Mint", 7],
    ["Bridge Deposit", 7], ["Bridge Withdraw", 5], ["Stake", 6],
    ["Unstake", 3], ["Claim Rewards", 5], ["Buyback Execute", 3], ["Register Asset", 5],
  ];

  /* ============================================================
     Block / transaction generation
     ============================================================ */
  const TIP_START = 5431904;
  const BACKLOG = 260;
  const NOW0 = Date.now();

  const BLOCKS = []; // newest first
  const TXS = []; // newest first
  const BLOCK_BY_NUM = new Map();
  const TX_BY_HASH = new Map();
  const ADDR_TXS = new Map(); // addr(lower) -> [tx,...] newest first
  const TOKEN_TXS = new Map(); // symbol -> [tx,...]
  let currentTip = TIP_START;

  function trackAddrTx(addr, tx) {
    if (!addr) return;
    const k = addr.toLowerCase();
    let list = ADDR_TXS.get(k);
    if (!list) { list = []; ADDR_TXS.set(k, list); }
    list.unshift(tx);
  }

  function randomActor() {
    const r = rand();
    if (r < 0.12) return pick(Object.values(ADDR));
    if (r < 0.16) return pick(VALIDATORS);
    if (r < 0.22) return pick(TOKENS).addr;
    return randAddress();
  }

  function makeTx(blockNumber, ts) {
    const hash = randTxHash();
    const from = randomActor();
    let to = randomActor();
    let guard = 0;
    while (to === from && guard++ < 5) to = randomActor();

    const isTokenTx = rand() < 0.32;
    const gasUsed = randInt(21000, 210000);
    const gasPrice = randFloat(0.6, 3.4); // "Gwei"-style unit on the L3
    const fee = (gasUsed * gasPrice) / 1e9;
    const status = rand() < 0.017 ? "fail" : "success";
    let method, value, token, tokenAmount;

    if (isTokenTx) {
      token = pick(TOKENS).symbol;
      method = weightedPick([["Transfer", 60], ["Approve", 18], ["Mint", 12], ["Burn", 10]]);
      value = 0;
      tokenAmount = token === "SECT" ? skewSmall(1, 25000) : token === "USDX" ? skewSmall(1, 40000) : skewSmall(0.001, token === "xAU" || token === "xAG" ? 12 : 3);
    } else {
      method = weightedPick(METHODS_NATIVE);
      value = method === "Approve" ? 0 : skewSmall(0.0005, 6200);
    }

    const tx = {
      hash, blockNumber, timestamp: ts, from, to, method, status,
      value, token, tokenAmount, fee, gasUsed, gasPrice,
      gasLimit: Math.round(gasUsed * randFloat(1.08, 1.45)),
      nonce: randInt(0, 4200),
      input: method === "Transfer" && !isTokenTx ? "0x" : "0x" + randHex(randInt(8, 136)),
    };
    TX_BY_HASH.set(hash, tx);
    TXS.unshift(tx);
    trackAddrTx(from, tx);
    if (to !== from) trackAddrTx(to, tx);
    if (token) {
      let list = TOKEN_TXS.get(token);
      if (!list) { list = []; TOKEN_TXS.set(token, list); }
      list.unshift(tx);
    }
    return tx;
  }

  function makeBlock(number, ts) {
    const validator = pick(VALIDATORS);
    const gasLimit = CHAIN.gasLimit;
    const txCount = randInt(1, 9);
    const hash = randTxHash();
    const parentHash = BLOCK_BY_NUM.has(number - 1) ? BLOCK_BY_NUM.get(number - 1).hash : "0x" + randHex(64);
    const block = {
      number, timestamp: ts, hash, parentHash, validator,
      txCount, gasLimit, gasUsed: 0, baseFee: randFloat(0.02, 0.38),
      reward: randFloat(0.35, 1.1), txs: [],
    };
    for (let i = 0; i < txCount; i++) {
      const tx = makeTx(number, ts);
      block.txs.push(tx.hash);
      block.gasUsed += tx.gasUsed;
    }
    block.gasUsed = Math.min(block.gasUsed, Math.round(gasLimit * 0.97));
    BLOCK_BY_NUM.set(number, block);
    BLOCKS.unshift(block);
    return block;
  }

  (function seedBacklog() {
    let ts = NOW0 - BACKLOG * CHAIN.blockTimeMs;
    const startNum = TIP_START - BACKLOG + 1;
    for (let i = 0; i < BACKLOG; i++) {
      ts += CHAIN.blockTimeMs * (0.7 + rand() * 0.55);
      makeBlock(startNum + i, Math.min(ts, NOW0));
    }
    currentTip = TIP_START;
  })();

  const MAX_KEEP_BLOCKS = 4000;
  const MAX_KEEP_TXS = 20000;
  function pushLiveBlock() {
    currentTip += 1;
    makeBlock(currentTip, Date.now());
    if (BLOCKS.length > MAX_KEEP_BLOCKS) BLOCKS.length = MAX_KEEP_BLOCKS;
    if (TXS.length > MAX_KEEP_TXS) TXS.length = MAX_KEEP_TXS;
  }

  /* ============================================================
     Formatting helpers
     ============================================================ */
  function fmtInt(n) { return Math.round(n).toLocaleString("en-US"); }
  function fmtNum(n, dec) {
    if (n === undefined || n === null || isNaN(n)) return "0";
    return n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function fmtAmount(n, maxDec = 6) {
    if (n === 0) return "0";
    if (Math.abs(n) < 0.000001) return n.toExponential(2);
    let s = n.toLocaleString("en-US", { maximumFractionDigits: maxDec, minimumFractionDigits: 0 });
    return s;
  }
  function fmtUsd(n) {
    if (n >= 1e9) return "$" + fmtNum(n / 1e9, 2) + "B";
    if (n >= 1e6) return "$" + fmtNum(n / 1e6, 2) + "M";
    if (n >= 1e3) return "$" + fmtNum(n / 1e3, 2) + "K";
    return "$" + fmtNum(n, n < 10 ? 4 : 2);
  }
  function shortHash(h, front = 8, back = 6) {
    if (!h) return "";
    return h.slice(0, front) + "…" + h.slice(-back);
  }
  function shortAddr(a) { return shortHash(a, 6, 4); }
  function timeAgo(ts) {
    let s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 5) return "a few secs ago";
    if (s < 60) return s + " secs ago";
    let m = Math.floor(s / 60);
    if (m < 60) return m + (m === 1 ? " min ago" : " mins ago");
    let h = Math.floor(m / 60);
    if (h < 24) return h + (h === 1 ? " hr ago" : " hrs ago");
    let d = Math.floor(h / 24);
    return d + (d === 1 ? " day ago" : " days ago");
  }
  function fmtDateTime(ts) {
    const d = new Date(ts);
    return d.toUTCString().replace("GMT", "UTC");
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function labelFor(addr) {
    if (!addr) return "";
    return KNOWN.get(addr.toLowerCase()) || "";
  }
  function isKnownContract(addr) { return KNOWN.has((addr || "").toLowerCase()) || TOKEN_BY_ADDR.has((addr || "").toLowerCase()); }

  /* ============================================================
     Icons (self-hosted inline SVG)
     ============================================================ */
  const ICO = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-9 5-9-5V8l9-5 9 5Z"/><path d="M3.3 7.5 12 12.5l8.7-5"/><path d="M12 22V12.5"/></svg>',
    fuel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="15" y2="22"/><line x1="4" y1="9" x2="14" y2="9"/><path d="M4 22V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18"/><path d="m14 8 3.5 3.5a1.5 1.5 0 0 0 2.5-1V6.5"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></svg>',
    check2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
    cross2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
  };
  function copyBtn(text) {
    return '<button type="button" class="ex-copy" data-copy="' + esc(text) + '" title="Copy to clipboard" aria-label="Copy">' + ICO.copy + "</button>";
  }
  // SECT lleva el logo de Sectora (el mismo de la cabecera)
  const SECT_LOGO =
    '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="9" ry="9" fill="#1569ff"/>' +
    '<circle cx="50" cy="50" r="27.2" fill="none" stroke="#fff" stroke-width="6.1"/></svg>';
  // el precio de SECT solo se ensena cuando llego el real de CoinGecko
  function tokenPrice(t) {
    if (t.symbol !== "SECT") return "$" + fmtAmount(t.price, 4);
    return SECT_REAL ? "$" + pcFmt(SECT_REAL.price) : "$—";
  }
  function tokenCap(t) { return t.symbol === "SECT" && !SECT_REAL ? "—" : fmtUsd(t.price * t.supply); }
  function tokenIcon(t, size) {
    size = size || 22;
    if (t.symbol === "SECT") return '<span class="ex-tk-icon ex-tk-icon--logo" style="width:' + size + "px;height:" + size + 'px">' + SECT_LOGO + "</span>";
    const initials = t.symbol.replace(/^x/, "").slice(0, 2).toUpperCase();
    return '<span class="ex-tk-icon" style="width:' + size + "px;height:" + size + "px;background:" + t.color + '22;color:' + t.color + ';border-color:' + t.color + '44">' + esc(initials) + "</span>";
  }
  function statusPill(status) {
    return status === "success"
      ? '<span class="ex-pill ex-pill--ok">' + ICO.check2 + "<span>Success</span></span>"
      : '<span class="ex-pill ex-pill--fail">' + ICO.cross2 + "<span>Fail</span></span>";
  }
  function methodPill(method) {
    const cls = { Transfer: "gray", Swap: "blue", Approve: "amber", Mint: "green", Burn: "red",
      "Bridge Deposit": "blue", "Bridge Withdraw": "blue", Stake: "green", Unstake: "amber",
      "Claim Rewards": "green", "Buyback Execute": "purple", "Register Asset": "purple" }[method] || "gray";
    return '<span class="ex-method ex-method--' + cls + '">' + esc(method) + "</span>";
  }
  function addrLink(addr, opts) {
    opts = opts || {};
    const lbl = labelFor(addr);
    const tok = TOKEN_BY_ADDR.get((addr || "").toLowerCase());
    const inner = tok
      ? tokenIcon(tok, 16) + '<span class="ex-addr-label">' + esc(tok.name) + " (" + esc(tok.symbol) + ")</span>"
      : lbl
      ? '<span class="ex-addr-label">' + esc(lbl) + "</span>"
      : "";
    const codeCls = opts.mono !== false ? "ex-mono" : "";
    return (
      '<a class="ex-addr-link" href="#/address/' + addr + '">' +
      (inner ? inner + '<span class="ex-addr-sub ' + codeCls + '">' + shortAddr(addr) + "</span>" : '<span class="' + codeCls + '">' + shortAddr(addr) + "</span>") +
      "</a>" + copyBtn(addr)
    );
  }

  /* ============================================================
     Router helpers
     ============================================================ */
  function parseRoute() {
    let h = location.hash.replace(/^#\/?/, "");
    const qIdx = h.indexOf("?");
    let pathPart = h, queryPart = "";
    if (qIdx >= 0) { pathPart = h.slice(0, qIdx); queryPart = h.slice(qIdx + 1); }
    const parts = pathPart.split("/").filter(Boolean);
    const params = new URLSearchParams(queryPart);
    return { parts, params };
  }
  function paginate(total, page, perPage) {
    const pages = Math.max(1, Math.ceil(total / perPage));
    page = Math.min(Math.max(1, page || 1), pages);
    return { page, pages, start: (page - 1) * perPage, end: Math.min(total, page * perPage) };
  }
  function pagerHTML(baseHash, page, pages) {
    const link = (p) => baseHash + (baseHash.includes("?") ? "&" : "?") + "page=" + p;
    const dis = (cond) => (cond ? ' aria-disabled="true" tabindex="-1"' : "");
    return (
      '<div class="ex-pager">' +
      '<a class="ex-pager-btn" href="' + link(1) + '"' + dis(page <= 1) + ">First</a>" +
      '<a class="ex-pager-btn" href="' + link(Math.max(1, page - 1)) + '"' + dis(page <= 1) + ">‹ Prev</a>" +
      '<span class="ex-pager-info">Page ' + page + " of " + pages + "</span>" +
      '<a class="ex-pager-btn" href="' + link(Math.min(pages, page + 1)) + '"' + dis(page >= pages) + ">Next ›</a>" +
      '<a class="ex-pager-btn" href="' + link(pages) + '"' + dis(page >= pages) + ">Last</a>" +
      "</div>"
    );
  }

  /* ============================================================
     Small inline chart (SVG bars / line, no library)
     ============================================================ */
  function barChart(values, opts) {
    opts = opts || {};
    const w = opts.w || 560, h = opts.h || 120, gap = 3;
    const n = values.length;
    const bw = (w - gap * (n - 1)) / n;
    const max = Math.max(...values, 1);
    const color = opts.color || "var(--ex-blue)";
    let bars = "";
    for (let i = 0; i < n; i++) {
      const bh = Math.max(2, (values[i] / max) * (h - 18));
      const x = i * (bw + gap);
      const y = h - bh - 14;
      bars += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="2" fill="' + color + '" opacity="0.88"><title>' + fmtInt(values[i]) + "</title></rect>";
    }
    return '<svg class="ex-chart" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none">' + bars + "</svg>";
  }
  /* ============================================================
     Grafica de precio de SECT: datos reales de CoinGecko, nada inventado.
     Ejes con precio y fecha, rangos 24H / 7D / 30D, cursor con tooltip y
     el ultimo precio marcado. Se actualiza sola cada minuto.
     ============================================================ */
  const PC_RANGES = [["24h", "24H", 86400000], ["7d", "7D", 7 * 86400000], ["30d", "30D", 30 * 86400000]];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let PC_RANGE = "30d";
  try { const r = localStorage.getItem("sectorascanPriceRange"); if (PC_RANGES.some((x) => x[0] === r)) PC_RANGE = r; } catch (e) {}
  let PC_ANIM = true;      // la linea se dibuja al aparecer y al cambiar de rango
  let PC_FLASH = "";       // el precio parpadea en verde/rojo cuando cambia
  let PC_SEQ = 0;          // ids unicos para los degradados del SVG
  let PC_VIS = null;       // serie visible, la usa el cursor
  let PC_HOVER = null;     // posicion del cursor (0-1), se repone tras repintar

  function pcFmt(v) { return v >= 1 ? v.toFixed(4) : v.toPrecision(5); }
  function pcPct(v) { return (v >= 0 ? "+" : "") + v.toFixed(2) + "%"; }
  function pcTwo(n) { return (n < 10 ? "0" : "") + n; }
  function pcDate(ms) { const d = new Date(ms); return MONTHS[d.getMonth()] + " " + pcTwo(d.getDate()); }
  function pcTime(ms) { const d = new Date(ms); return pcTwo(d.getHours()) + ":" + pcTwo(d.getMinutes()); }
  function pcNiceStep(span, n) {
    const raw = span / n;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / mag;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * mag;
  }
  // marcas del eje de tiempo alineadas a horas o medianoches locales
  function pcTimeTicks(t0, t1) {
    const H = 3600000, D = 86400000;
    const steps = [H, 2 * H, 3 * H, 4 * H, 6 * H, 12 * H, D, 2 * D, 3 * D, 4 * D, 5 * D, 7 * D];
    let step = steps[steps.length - 1];
    for (const s of steps) if ((t1 - t0) / s <= 6) { step = s; break; }
    const d = new Date(t0);
    if (step >= D) d.setHours(0, 0, 0, 0);
    else { d.setMinutes(0, 0, 0); d.setHours(d.getHours() - (d.getHours() % (step / H))); }
    const out = [];
    for (let t = d.getTime(), guard = 0; t <= t1 && guard < 40; guard++) {
      if (t >= t0) out.push(t);
      if (step >= D) { const n = new Date(t); n.setDate(n.getDate() + step / D); t = n.getTime(); }
      else t += step;
    }
    return { ticks: out, daily: step >= D };
  }
  function pcVisible() {
    if (PRICE_PTS.length < 2) return [];
    const r = PC_RANGES.find((x) => x[0] === PC_RANGE) || PC_RANGES[2];
    const from = PRICE_PTS[PRICE_PTS.length - 1][0] - r[2];
    const vis = PRICE_PTS.filter((p) => p[0] >= from);
    return vis.length >= 2 ? vis : PRICE_PTS.slice(-2);
  }
  function pcLive() { return Date.now() - PRICE_LIVE_AT < 150000; }
  function pcKey(variant) { return [variant, PC_RANGE, PRICE_VER, PRICE_STATE, pcLive() ? 1 : 0].join("|"); }

  function priceChart(variant) {
    const sect = TOKEN_BY_SYMBOL.get("sect");
    const tabs = PC_RANGES.map((r) =>
      '<button type="button" class="ex-pc-tab' + (r[0] === PC_RANGE ? " is-active" : "") + '" data-pc-range="' + r[0] + '" aria-pressed="' + (r[0] === PC_RANGE) + '">' + r[1] + "</button>"
    ).join("");
    const pair = '<p class="ex-pc-pair">' + tokenIcon(sect, 20) + "SECT / USD <span>&middot; CoinGecko</span></p>";
    const vis = pcVisible();
    if (vis.length < 2) {
      const msg = PRICE_STATE === "error" ? "CoinGecko data unavailable right now" : "Loading CoinGecko data…";
      return (
        '<div class="ex-pc ex-pc--' + variant + '" data-pc-key="' + pcKey(variant) + '">' +
        '<div class="ex-pc-head"><div class="ex-pc-id">' + pair + '<div class="ex-pc-now"><b class="ex-pc-price">$—</b></div></div>' +
        '<div class="ex-pc-tabs">' + tabs + "</div></div>" +
        '<div class="ex-pc-plot ex-pc-plot--empty"><span>' + msg + "</span></div></div>"
      );
    }

    const n = vis.length;
    const first = vis[0], last = vis[n - 1];
    const t0 = first[0], t1 = last[0];
    let lo = Infinity, hi = -Infinity, iLo = 0, iHi = 0;
    vis.forEach((p, i) => {
      if (p[1] < lo) { lo = p[1]; iLo = i; }
      if (p[1] > hi) { hi = p[1]; iHi = i; }
    });
    const span = hi - lo || hi * 0.01 || 0.001;
    const yMin = lo - span * 0.16, yMax = hi + span * 0.24;
    const X = (t) => (t - t0) / (t1 - t0 || 1);
    const Y = (v) => 1 - (v - yMin) / (yMax - yMin);
    PC_VIS = { pts: vis, t0: t0, t1: t1, yMin: yMin, yMax: yMax, first: first[1] };

    const up = last[1] >= first[1];
    const rangeChg = (last[1] / first[1] - 1) * 100;
    const chg24 = SECT_REAL ? SECT_REAL.change24h : rangeChg;

    let d = "";
    for (let i = 0; i < n; i++) d += (i ? "L" : "M") + (X(vis[i][0]) * 1000).toFixed(1) + "," + (Y(vis[i][1]) * 300).toFixed(1);
    const gid = "exPcG" + ++PC_SEQ;
    const svg =
      '<svg class="ex-pc-svg" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" style="stop-color:var(--pc);stop-opacity:.28"></stop>' +
      '<stop offset=".75" style="stop-color:var(--pc);stop-opacity:.04"></stop>' +
      '<stop offset="1" style="stop-color:var(--pc);stop-opacity:0"></stop></linearGradient></defs>' +
      '<path d="' + d + 'L1000,300L0,300Z" fill="url(#' + gid + ')"></path>' +
      '<path class="ex-pc-line" d="' + d + '" vector-effect="non-scaling-stroke"></path>' +
      "</svg>";

    // eje de precio: marcas redondas; se ocultan las que pisarian la etiqueta del ultimo precio
    const yLast = Y(last[1]) * 100;
    const step = pcNiceStep(yMax - yMin, 4);
    const dec = Math.max(yMax < 1 ? 4 : 2, Math.min(8, Math.ceil(-Math.log10(step) - 1e-9)));
    let grid = "", yLabels = "";
    for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) {
      const y = Y(v) * 100;
      if (y < 3 || y > 97) continue;
      grid += '<i class="ex-pc-gl" style="top:' + y.toFixed(2) + '%"></i>';
      if (Math.abs(y - yLast) > 7) yLabels += '<span class="ex-pc-yt" style="top:' + y.toFixed(2) + '%">' + v.toFixed(dec) + "</span>";
    }
    // eje de tiempo
    const tt = pcTimeTicks(t0, t1);
    let xLabels = "";
    tt.ticks.forEach((t, i) => {
      const x = X(t) * 100;
      if (x < 5 || x > 95) return;
      const h = new Date(t).getHours();
      const label = tt.daily || h === 0 ? pcDate(t) : pcTime(t);
      xLabels += '<span class="ex-pc-xt' + (i % 2 ? " ex-pc-xt--minor" : "") + '" style="left:' + x.toFixed(2) + '%">' + label + "</span>";
    });
    // maximo y minimo del rango (no se marcan si caen sobre el ultimo precio)
    const marker = (i, kind, label) => {
      const x = X(vis[i][0]) * 100, y = Y(vis[i][1]) * 100;
      if (x > 94) return "";
      const al = x < 12 ? " ex-pc-mk--l" : x > 80 ? " ex-pc-mk--r" : "";
      return '<span class="ex-pc-mk ex-pc-mk--' + kind + al + '" style="left:' + x.toFixed(2) + "%;top:" + y.toFixed(2) + '%"><i></i><em>' + label + " " + pcFmt(vis[i][1]) + "</em></span>";
    };
    const markers = (hi > lo ? marker(iHi, "hi", "High") + marker(iLo, "lo", "Low") : "");

    const days = (t1 - t0) / 86400000;
    const rangeName = PC_RANGE === "30d" && days < 29 ? "Since listing &middot; " + pcDate(t0) : (PC_RANGES.find((x) => x[0] === PC_RANGE) || PC_RANGES[2])[1];
    const live = pcLive();
    const flash = PC_FLASH ? " is-flash-" + PC_FLASH : "";
    PC_FLASH = "";

    return (
      '<div class="ex-pc ex-pc--' + variant + " ex-pc--" + (up ? "up" : "down") + (PC_ANIM ? " is-anim" : "") + '" data-pc-key="' + pcKey(variant) + '" data-pc-ready="1">' +
      '<div class="ex-pc-head"><div class="ex-pc-id">' + pair +
      '<div class="ex-pc-now"><b class="ex-pc-price' + flash + '">$' + pcFmt(last[1]) + "</b>" +
      '<span class="ex-pc-chg ex-pc-chg--' + (chg24 >= 0 ? "up" : "down") + '">' + (chg24 >= 0 ? "&#9650; " : "&#9660; ") + Math.abs(chg24).toFixed(2) + "%<small>24H</small></span></div></div>" +
      '<div class="ex-pc-tabs" role="group" aria-label="Chart range">' + tabs + "</div></div>" +
      '<div class="ex-pc-plot"><div class="ex-pc-canvas">' +
      grid + '<i class="ex-pc-base"></i>' + svg + markers +
      '<i class="ex-pc-last" style="top:' + yLast.toFixed(2) + '%"></i>' +
      '<span class="ex-pc-tag" style="top:' + yLast.toFixed(2) + '%">' + pcFmt(last[1]) + "</span>" +
      '<i class="ex-pc-dot" style="left:100%;top:' + yLast.toFixed(2) + '%"></i>' +
      yLabels + xLabels +
      '<i class="ex-pc-cx"></i><i class="ex-pc-cy"></i><i class="ex-pc-hd"></i><span class="ex-pc-htag"></span>' +
      '<div class="ex-pc-tip"><span class="ex-pc-tip-t"></span><b class="ex-pc-tip-p"></b><span class="ex-pc-tip-c"></span></div>' +
      "</div></div>" +
      '<div class="ex-pc-foot">' +
      '<span class="ex-pc-live">' + (live ? '<i class="ex-led" aria-hidden="true"></i><span>Live' : '<i class="ex-pc-led-off" aria-hidden="true"></i><span>Snapshot') +
      ' &middot; Auto-updates every minute &middot; Updated <span class="ex-age ex-pc-upd" data-ts="' + PRICE_UPDATED + '">' + timeAgo(PRICE_UPDATED) + "</span></span></span>" +
      '<span class="ex-pc-range">' + rangeName + " &middot; High <b>" + pcFmt(hi) + "</b> &middot; Low <b>" + pcFmt(lo) + '</b> &middot; <b class="ex-pc-rc--' + (rangeChg >= 0 ? "up" : "down") + '">' + pcPct(rangeChg) + "</b>" +
      ' &middot; <a href="https://www.coingecko.com/en/coins/sectora" target="_blank" rel="noopener">CoinGecko &#8599;</a></span>' +
      "</div></div>"
    );
  }

  // cursor: linea vertical y horizontal, punto sobre la curva y tooltip
  function pcShowHover(root, ratio) {
    const v = PC_VIS;
    if (!root || !v || !root.hasAttribute("data-pc-ready")) return;
    const t = v.t0 + ratio * (v.t1 - v.t0);
    let a = 0, b = v.pts.length - 1;
    while (b - a > 1) { const m = (a + b) >> 1; if (v.pts[m][0] < t) a = m; else b = m; }
    const p = t - v.pts[a][0] < v.pts[b][0] - t ? v.pts[a] : v.pts[b];
    const x = ((p[0] - v.t0) / (v.t1 - v.t0 || 1)) * 100;
    const y = (1 - (p[1] - v.yMin) / (v.yMax - v.yMin)) * 100;
    const q = (s) => root.querySelector(s);
    root.classList.add("is-hover");
    q(".ex-pc-cx").style.left = x + "%";
    q(".ex-pc-cy").style.top = y + "%";
    const hd = q(".ex-pc-hd"); hd.style.left = x + "%"; hd.style.top = y + "%";
    const ht = q(".ex-pc-htag"); ht.style.top = y + "%"; ht.textContent = pcFmt(p[1]);
    const dt = new Date(p[0]);
    q(".ex-pc-tip-t").textContent = WEEKDAYS[dt.getDay()] + ", " + pcDate(p[0]) + " · " + pcTime(p[0]);
    q(".ex-pc-tip-p").textContent = "$" + pcFmt(p[1]);
    const c = (p[1] / v.first - 1) * 100;
    const tc = q(".ex-pc-tip-c");
    tc.textContent = pcPct(c) + " vs " + pcDate(v.t0);
    tc.className = "ex-pc-tip-c ex-pc-rc--" + (c >= 0 ? "up" : "down");
    const tip = q(".ex-pc-tip");
    if (x > 55) { tip.style.left = "auto"; tip.style.right = "calc(" + (100 - x) + "% + 14px)"; }
    else { tip.style.right = "auto"; tip.style.left = "calc(" + x + "% + 14px)"; }
  }
  function pcHideHover() {
    PC_HOVER = null;
    document.querySelectorAll(".ex-pc.is-hover").forEach((el) => el.classList.remove("is-hover"));
  }
  function pcPointer(e) {
    const plot = e.target && e.target.closest ? e.target.closest(".ex-pc-plot") : null;
    const root = plot && plot.closest(".ex-pc");
    if (!root || !root.hasAttribute("data-pc-ready")) { if (PC_HOVER !== null) pcHideHover(); return; }
    const r = plot.querySelector(".ex-pc-canvas").getBoundingClientRect();
    PC_HOVER = Math.min(1, Math.max(0, (e.clientX - r.left) / (r.width || 1)));
    pcShowHover(root, PC_HOVER);
  }
  // repinta solo las graficas de precio (al llegar un dato o cambiar de rango)
  function refreshPriceCharts() {
    document.querySelectorAll(".ex-pc").forEach((el) => {
      const variant = el.classList.contains("ex-pc--home") ? "home" : "full";
      const hovered = el.classList.contains("is-hover");
      const tmp = document.createElement("div");
      tmp.innerHTML = priceChart(variant);
      const next = tmp.firstElementChild;
      el.replaceWith(next);
      pcSettle(next);
      if (hovered && PC_HOVER !== null) pcShowHover(next, PC_HOVER);
    });
  }
  // la animacion de entrada se hace una vez: luego se quita la clase
  function pcSettle(node) {
    if (!node.hasAttribute("data-pc-ready") || !node.classList.contains("is-anim")) return;
    PC_ANIM = false;
    setTimeout(() => node.classList.remove("is-anim"), 1700);
  }
  function lineChart(values, opts) {
    opts = opts || {};
    const w = opts.w || 560, h = opts.h || 120, pad = 6;
    const n = values.length;
    const max = Math.max(...values), min = Math.min(...values);
    const span = max - min || 1;
    const step = (w - pad * 2) / (n - 1);
    let pts = [];
    for (let i = 0; i < n; i++) {
      const x = pad + i * step;
      const y = pad + (1 - (values[i] - min) / span) * (h - pad * 2);
      pts.push(x.toFixed(1) + "," + y.toFixed(1));
    }
    const color = opts.color || "var(--ex-blue)";
    const path = "M" + pts.join(" L");
    const area = path + " L" + pts[pts.length - 1].split(",")[0] + "," + (h - pad) + " L" + pts[0].split(",")[0] + "," + (h - pad) + " Z";
    return (
      '<svg class="ex-chart" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none">' +
      '<path d="' + area + '" fill="' + color + '" opacity="0.12"></path>' +
      '<path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>' +
      "</svg>"
    );
  }
  function days14Values(base, spread) {
    const out = [];
    let v = base;
    for (let i = 0; i < 14; i++) {
      v = Math.max(base * 0.4, v + (rand() - 0.48) * spread);
      out.push(v);
    }
    return out;
  }
  const DAILY_TX = days14Values(2400, 500);
  const DAILY_ADDR = days14Values(180, 40);
  /* precio real de SECT: lo llena loadSectMarket() con el historial de
     CoinGecko, leido directamente desde el navegador y, como red de
     seguridad, del archivo que publica el robot de precios
     (sect-price-30d.json). Hasta que llega, la grafica avisa de que esta
     cargando: nada inventado */
  let PRICE_PTS = [];      // [[ms, precio usd], ...] ordenado por tiempo
  let PRICE_VER = 0;       // sube cada vez que cambian los datos
  let PRICE_UPDATED = 0;   // ultima lectura buena (ms)
  let PRICE_LIVE_AT = 0;   // ultima lectura directa de CoinGecko (ms)
  let PRICE_STATE = "loading";
  let SECT_REAL = null;
  const TVL_HIST = days14Values(24500000, 900000);

  /* ============================================================
     Render helpers: rows
     ============================================================ */
  function blockRow(b) {
    return (
      '<tr><td><a class="ex-link ex-mono" href="#/block/' + b.number + '">' + fmtInt(b.number) + "</a></td>" +
      '<td class="ex-age" data-ts="' + b.timestamp + '">' + timeAgo(b.timestamp) + "</td>" +
      '<td><a class="ex-link" href="#/block/' + b.number + '">' + b.txCount + " txns</a></td>" +
      "<td>" + addrLink(b.validator) + "</td>" +
      '<td class="ex-num">' + fmtInt(b.gasUsed) + "</td>" +
      '<td class="ex-num ex-hide-sm">' + fmtInt(b.gasLimit) + "</td>" +
      '<td class="ex-num ex-hide-sm">' + fmtAmount(b.reward, 4) + " SECT</td></tr>"
    );
  }
  function txRow(t) {
    const amount = t.token
      ? fmtAmount(t.tokenAmount, 4) + " " + t.token
      : fmtAmount(t.value, 4) + " SECT";
    return (
      '<tr><td><a class="ex-link ex-mono" href="#/tx/' + t.hash + '">' + shortHash(t.hash) + "</a>" + copyBtn(t.hash) + "</td>" +
      "<td>" + methodPill(t.method) + "</td>" +
      '<td><a class="ex-link ex-mono" href="#/block/' + t.blockNumber + '">' + fmtInt(t.blockNumber) + "</a></td>" +
      '<td class="ex-age" data-ts="' + t.timestamp + '">' + timeAgo(t.timestamp) + "</td>" +
      "<td>" + addrLink(t.from) + "</td>" +
      '<td class="ex-dir">' + ICO.arrowRight + "</td>" +
      "<td>" + addrLink(t.to) + "</td>" +
      '<td class="ex-num">' + amount + "</td>" +
      '<td class="ex-num ex-hide-sm">' + fmtAmount(t.fee, 6) + "</td></tr>"
    );
  }

  /* ============================================================
     Views
     ============================================================ */
  function statCards() {
    const sect = TOKEN_BY_SYMBOL.get("sect");
    const change = SECT_REAL ? SECT_REAL.change24h.toFixed(2) : 0;
    return (
      '<div class="ex-stats">' +
      (SECT_REAL
        ? statCard("SECT PRICE", "$" + pcFmt(SECT_REAL.price), (change >= 0 ? "+" : "") + change + "% (24h)", change >= 0 ? "up" : "down")
        : statCard("SECT PRICE", "$—", PRICE_STATE === "error" ? "CoinGecko unavailable" : "Loading CoinGecko…", "flat")) +
      statCard("TRANSACTIONS", fmtInt(TXS.length) + " txns", fmtInt(Math.round(DAILY_TX[DAILY_TX.length - 1])) + " today", "flat") +
      statCard("MED GAS PRICE", fmtAmount(1.6, 2) + " Gwei", "~$0.00002 / txn", "flat") +
      statCard("WALLETS", fmtInt(ADDR_TXS.size) + " addresses", "tracked this session", "flat") +
      "</div>"
    );
  }
  function statCard(label, value, sub, dir) {
    return (
      '<div class="ex-stat-card"><div class="ex-stat-label">' + label + "</div>" +
      '<div class="ex-stat-value">' + value + "</div>" +
      '<div class="ex-stat-sub ex-stat-sub--' + dir + '">' + sub + "</div></div>"
    );
  }

  function rwaSection() {
    const rwaTokens = TOKENS.filter((t) => t.kind.startsWith("RWA"));
    let cards = rwaTokens
      .map((t, i) => {
        const chg = (((t.price / (t.baseline || t.price)) - 1) * 100);
        return (
          '<a class="ex-rwa-card" href="#/token/' + t.addr + '">' +
          '<span class="ex-rwa-top"><span class="ex-rwa-idx">' + String(i + 1).padStart(2, "0") + '</span>' + tokenIcon(t, 30) + '</span>' +
          '<span class="ex-rwa-name">' + esc(t.symbol) + '<small>' + esc(t.name) + "</small></span>" +
          '<span class="ex-rwa-price">$' + fmtAmount(t.price, 2) + "</span>" +
          '<span class="ex-rwa-cap">Mkt Cap ' + fmtUsd(t.price * t.supply) + "</span></a>"
        );
      })
      .join("");
    return (
      '<section class="ex-rwa">' +
      '<div class="ex-rwa-head">' +
      '<p class="ex-eyebrow"><i></i>Real-world assets &middot; On Sectora L3</p>' +
      '<h2>Tokenized Real-World Assets</h2>' +
      '<p>Sectora is a ' + CHAIN.layer + ' network purpose-built to mint, settle and track on-chain representations of off-chain assets &mdash; metals, indices and more &mdash; anchored to ' + CHAIN.settlesTo + '.</p>' +
      "</div>" +
      '<div class="ex-rwa-grid">' + cards + "</div>" +
      '<div class="ex-rwa-links">' +
      '<a class="ex-rwa-more" href="#/tokens">View all tokens ' + ICO.arrowRight + "</a>" +
      '<a class="ex-rwa-more" href="#/tokenize">Tokenize an asset ' + ICO.arrowRight + "</a>" +
      "</div>" +
      "</section>"
    );
  }

  function renderHome() {
    const latestBlocks = BLOCKS.slice(0, 7);
    const latestTxs = TXS.slice(0, 7);
    return (
      '<section class="ex-hero">' +
      '<p class="ex-eyebrow"><i></i>Sectora L3 &middot; Testnet explorer</p>' +
      '<div class="ex-hero-top">' +
      '<h1>The Sectora <b>' + CHAIN.layer + '</b> Explorer</h1>' +
      '<div class="ex-hero-side">' +
      '<p>Search the Sectora Testnet for blocks, transactions, addresses and tokenized real-world assets.</p>' +
      '<span class="ex-live"><i class="ex-led" aria-hidden="true"></i>Testnet live &middot; Block <b id="exHeroBlock">' + fmtInt(currentTip) + '</b></span>' +
      '</div></div>' +
      '<form class="ex-hero-search" id="exHeroSearch">' +
      '<span class="ex-hero-search-icon">' + ICO.search + "</span>" +
      '<input type="text" id="exHeroSearchInput" placeholder="Search by Address / Txn Hash / Block / Token" autocomplete="off" spellcheck="false" />' +
      '<button type="submit">Search</button>' +
      "</form>" +
      '<div class="ex-hero-error" id="exHeroError" hidden></div>' +
      "</section>" +
      statCards() +
      rwaSection() +
      '<section class="ex-cols">' +
      '<div class="ex-panel">' +
      '<div class="ex-panel-head"><h3>' + ICO.cube + " Latest Blocks</h3></div>" +
      '<div class="ex-list" id="exLatestBlocks">' +
      latestBlocks.map(latestBlockCard).join("") +
      "</div>" +
      '<a class="ex-panel-more" href="#/blocks">View all blocks ' + ICO.arrowRight + "</a>" +
      "</div>" +
      '<div class="ex-panel">' +
      '<div class="ex-panel-head"><h3>' + ICO.coins + " Latest Transactions</h3></div>" +
      '<div class="ex-list" id="exLatestTxs">' +
      latestTxs.map(latestTxCard).join("") +
      "</div>" +
      '<a class="ex-panel-more" href="#/txs">View all transactions ' + ICO.arrowRight + "</a>" +
      "</div>" +
      "</section>" +
      '<section class="ex-charts-preview">' +
      '<div class="ex-chart-card ex-pc-card">' + priceChart("home") + "</div>" +
      chartCard("Daily Transactions", "14 Days",
        '<p class="ex-txd-big"><b>' + fmtInt(DAILY_TX[DAILY_TX.length - 1]) + "</b>txns today</p>" +
        barChart(DAILY_TX, { color: "var(--ex-blue)" })) +
      "</section>"
    );
  }
  function latestBlockCard(b) {
    return (
      '<div class="ex-row-card">' +
      '<div class="ex-row-card-icon">' + ICO.cube + "</div>" +
      '<div class="ex-row-card-main">' +
      '<a class="ex-link ex-mono" href="#/block/' + b.number + '">' + fmtInt(b.number) + "</a>" +
      '<span class="ex-age" data-ts="' + b.timestamp + '">' + timeAgo(b.timestamp) + "</span>" +
      "</div>" +
      '<div class="ex-row-card-sub">' + addrLink(b.validator) + "</div>" +
      '<div class="ex-row-card-end"><span>' + b.txCount + " txns</span><small>" + fmtAmount(b.reward, 3) + " SECT</small></div>" +
      "</div>"
    );
  }
  function latestTxCard(t) {
    const amount = t.token ? fmtAmount(t.tokenAmount, 3) + " " + t.token : fmtAmount(t.value, 3) + " SECT";
    return (
      '<div class="ex-row-card">' +
      '<div class="ex-row-card-icon ex-row-card-icon--tx">' + ICO.coins + "</div>" +
      '<div class="ex-row-card-main">' +
      '<a class="ex-link ex-mono" href="#/tx/' + t.hash + '">' + shortHash(t.hash, 10, 6) + "</a>" +
      '<span class="ex-age" data-ts="' + t.timestamp + '">' + timeAgo(t.timestamp) + "</span>" +
      "</div>" +
      '<div class="ex-row-card-sub">' + addrLink(t.from) + ICO.arrowRight + addrLink(t.to) + "</div>" +
      '<div class="ex-row-card-end"><span>' + amount + "</span>" + statusPill(t.status) + "</div>" +
      "</div>"
    );
  }
  function chartCard(title, sub, svg) {
    return '<div class="ex-chart-card"><div class="ex-chart-card-head"><h4>' + title + "</h4><span>" + sub + "</span></div>" + svg + "</div>";
  }

  function renderBlocksList(page) {
    const p = paginate(BLOCKS.length, page, 25);
    const rows = BLOCKS.slice(p.start, p.end).map(blockRow).join("");
    return (
      pageHeader("Blocks", CHAIN.name + " · " + fmtInt(BLOCKS.length) + " blocks tracked this session") +
      '<div class="ex-table-wrap"><table class="ex-table">' +
      "<thead><tr><th>Block</th><th>Age</th><th>Txn</th><th>Validator</th><th>Gas Used</th><th class=\"ex-hide-sm\">Gas Limit</th><th class=\"ex-hide-sm\">Reward</th></tr></thead>" +
      "<tbody>" + rows + "</tbody></table></div>" +
      pagerHTML("#/blocks", p.page, p.pages)
    );
  }
  function renderTxsList(page) {
    const p = paginate(TXS.length, page, 25);
    const rows = TXS.slice(p.start, p.end).map(txRow).join("");
    return (
      pageHeader("Transactions", CHAIN.name + " · " + fmtInt(TXS.length) + " transactions tracked this session") +
      '<div class="ex-table-wrap"><table class="ex-table">' +
      "<thead><tr><th>Txn Hash</th><th>Method</th><th>Block</th><th>Age</th><th>From</th><th></th><th>To</th><th>Amount</th><th class=\"ex-hide-sm\">Fee</th></tr></thead>" +
      "<tbody>" + rows + "</tbody></table></div>" +
      pagerHTML("#/txs", p.page, p.pages)
    );
  }

  function renderBlockDetail(numStr) {
    const number = parseInt(numStr, 10);
    const b = BLOCK_BY_NUM.get(number);
    if (!b) return notFound("Block", numStr);
    const txs = b.txs.map((h) => TX_BY_HASH.get(h)).filter(Boolean);
    const gasPct = ((b.gasUsed / b.gasLimit) * 100).toFixed(1);
    return (
      pageHeader("Block #" + fmtInt(b.number), "") +
      '<div class="ex-detail-card">' +
      detailRow("Block Height", '<span class="ex-mono">' + fmtInt(b.number) + "</span>" + (BLOCK_BY_NUM.has(number - 1) ? ' <a class="ex-link" href="#/block/' + (number - 1) + '">‹ Prev</a>' : "") + (BLOCK_BY_NUM.has(number + 1) ? ' <a class="ex-link" href="#/block/' + (number + 1) + '">Next ›</a>' : "")) +
      detailRow("Status", '<span class="ex-pill ex-pill--ok">' + ICO.check2 + "<span>Finalized</span></span>") +
      detailRow("Timestamp", timeAgo(b.timestamp) + ' <span class="ex-dim">(' + fmtDateTime(b.timestamp) + ")</span>") +
      detailRow("Transactions", '<a class="ex-link" href="#/txs">' + b.txCount + " transactions</a> in this block") +
      detailRow("Validator", addrLink(b.validator)) +
      detailRow("Block Reward", fmtAmount(b.reward, 5) + " SECT") +
      detailRow("Gas Used", fmtInt(b.gasUsed) + " (" + gasPct + "%)") +
      detailRow("Gas Limit", fmtInt(b.gasLimit)) +
      detailRow("Base Fee", fmtAmount(b.baseFee, 4) + " Gwei") +
      detailRow("Hash", '<span class="ex-mono ex-break">' + b.hash + "</span>" + copyBtn(b.hash)) +
      detailRow("Parent Hash", '<a class="ex-link ex-mono ex-break" href="#/block/' + (number - 1) + '">' + b.parentHash + "</a>" + copyBtn(b.parentHash)) +
      "</div>" +
      '<h3 class="ex-subhead">Transactions in this block</h3>' +
      '<div class="ex-table-wrap"><table class="ex-table">' +
      "<thead><tr><th>Txn Hash</th><th>Method</th><th>From</th><th></th><th>To</th><th>Amount</th><th class=\"ex-hide-sm\">Fee</th></tr></thead>" +
      "<tbody>" + txs.map((t) => (
        '<tr><td><a class="ex-link ex-mono" href="#/tx/' + t.hash + '">' + shortHash(t.hash) + "</a>" + copyBtn(t.hash) + "</td>" +
        "<td>" + methodPill(t.method) + "</td>" +
        "<td>" + addrLink(t.from) + "</td>" +
        '<td class="ex-dir">' + ICO.arrowRight + "</td>" +
        "<td>" + addrLink(t.to) + "</td>" +
        '<td class="ex-num">' + (t.token ? fmtAmount(t.tokenAmount, 4) + " " + t.token : fmtAmount(t.value, 4) + " SECT") + "</td>" +
        '<td class="ex-num ex-hide-sm">' + fmtAmount(t.fee, 6) + "</td></tr>"
      )).join("") + "</tbody></table></div>"
    );
  }

  function renderTxDetail(hash) {
    const t = TX_BY_HASH.get(hash.toLowerCase()) || TX_BY_HASH.get(hash);
    if (!t) return notFound("Transaction", hash);
    const amountLine = t.token
      ? fmtAmount(t.tokenAmount, 6) + " " + t.token + " <span class=\"ex-dim\">(" + esc(TOKEN_BY_SYMBOL.get(t.token.toLowerCase()).name) + ")</span>"
      : fmtAmount(t.value, 6) + " SECT";
    const sentence =
      "This transaction " + (t.status === "success" ? "transferred " : "attempted to transfer ") +
      (t.token ? fmtAmount(t.tokenAmount, 4) + " " + t.token : fmtAmount(t.value, 4) + " SECT") +
      " from " + shortAddr(t.from) + " to " + shortAddr(t.to) + " using the " + t.method + " method.";
    return (
      pageHeader("Transaction Details", "") +
      '<div class="ex-detail-card">' +
      detailRow("Transaction Hash", '<span class="ex-mono ex-break">' + t.hash + "</span>" + copyBtn(t.hash)) +
      detailRow("Status", statusPill(t.status)) +
      detailRow("Block", '<a class="ex-link ex-mono" href="#/block/' + t.blockNumber + '">' + fmtInt(t.blockNumber) + "</a>") +
      detailRow("Timestamp", timeAgo(t.timestamp) + ' <span class="ex-dim">(' + fmtDateTime(t.timestamp) + ")</span>") +
      detailRow("From", addrLink(t.from)) +
      detailRow("To", addrLink(t.to) + (isKnownContract(t.to) ? ' <span class="ex-tag">Contract</span>' : "")) +
      detailRow("Value", amountLine) +
      detailRow("Method", methodPill(t.method)) +
      detailRow("Transaction Fee", fmtAmount(t.fee, 8) + " SECT") +
      detailRow("Gas Price", fmtAmount(t.gasPrice, 3) + " Gwei") +
      detailRow("Gas Limit &amp; Usage", fmtInt(t.gasUsed) + " / " + fmtInt(t.gasLimit) + " (" + ((t.gasUsed / t.gasLimit) * 100).toFixed(1) + "%)") +
      detailRow("Nonce", fmtInt(t.nonce)) +
      detailRow("Input Data", '<div class="ex-input-data ex-mono ex-break">' + esc(t.input) + "</div>") +
      detailRow("Summary", '<p class="ex-dim">' + esc(sentence) + "</p>") +
      "</div>"
    );
  }

  function addressHoldings(addrKey) {
    const out = [];
    for (const t of TOKENS) {
      const seedVal = parseInt(addrKey.slice(2, 10), 16) + t.symbol.charCodeAt(0);
      const include = (seedVal % 5) < (isKnownContract("0x" + addrKey.slice(2)) ? 4 : 2);
      if (!include) continue;
      const bal = ((seedVal % 9973) / 9973) * (t.symbol === "SECT" ? 40000 : t.symbol === "USDX" ? 25000 : t.supply * 0.02);
      if (bal <= 0) continue;
      out.push({ token: t, balance: bal });
    }
    return out;
  }

  function renderAddress(addr, tab, page) {
    const key = addr.toLowerCase();
    const list = ADDR_TXS.get(key) || [];
    tab = tab || "txns";
    const lbl = labelFor(addr);
    const tok = TOKEN_BY_ADDR.get(key);
    const holdings = addressHoldings(key);
    const balSeed = parseInt(key.slice(2, 10), 16) % 500000;
    const balance = list.length ? (balSeed / 10000) : 0;
    let body = "";
    if (tab === "transfers") {
      const tlist = list.filter((t) => t.token);
      const p = paginate(tlist.length, page, 25);
      body =
        '<div class="ex-table-wrap"><table class="ex-table">' +
        "<thead><tr><th>Txn Hash</th><th>Age</th><th>From</th><th></th><th>To</th><th>Amount</th></tr></thead>" +
        "<tbody>" + tlist.slice(p.start, p.end).map((t) => (
          '<tr><td><a class="ex-link ex-mono" href="#/tx/' + t.hash + '">' + shortHash(t.hash) + "</a></td>" +
          '<td class="ex-age" data-ts="' + t.timestamp + '">' + timeAgo(t.timestamp) + "</td>" +
          "<td>" + addrLink(t.from) + "</td><td class=\"ex-dir\">" + ICO.arrowRight + "</td><td>" + addrLink(t.to) + "</td>" +
          '<td class="ex-num">' + fmtAmount(t.tokenAmount, 4) + " " + t.token + "</td></tr>"
        )).join("") + "</tbody></table></div>" +
        (tlist.length ? pagerHTML("#/address/" + addr + "?tab=transfers", p.page, p.pages) : emptyState("No token transfers found for this address."));
    } else {
      const p = paginate(list.length, page, 25);
      body =
        '<div class="ex-table-wrap"><table class="ex-table">' +
        "<thead><tr><th>Txn Hash</th><th>Method</th><th>Block</th><th>Age</th><th>From</th><th></th><th>To</th><th>Amount</th></tr></thead>" +
        "<tbody>" + list.slice(p.start, p.end).map((t) => (
          '<tr><td><a class="ex-link ex-mono" href="#/tx/' + t.hash + '">' + shortHash(t.hash) + "</a></td>" +
          "<td>" + methodPill(t.method) + "</td>" +
          '<td><a class="ex-link ex-mono" href="#/block/' + t.blockNumber + '">' + fmtInt(t.blockNumber) + "</a></td>" +
          '<td class="ex-age" data-ts="' + t.timestamp + '">' + timeAgo(t.timestamp) + "</td>" +
          "<td>" + addrLink(t.from) + "</td><td class=\"ex-dir\">" + ICO.arrowRight + "</td><td>" + addrLink(t.to) + "</td>" +
          '<td class="ex-num">' + (t.token ? fmtAmount(t.tokenAmount, 4) + " " + t.token : fmtAmount(t.value, 4) + " SECT") + "</td></tr>"
        )).join("") + "</tbody></table></div>" +
        (list.length ? pagerHTML("#/address/" + addr + "?tab=txns", p.page, p.pages) : emptyState("No transactions found for this address."));
    }
    return (
      pageHeader(tok ? "Token Contract" : "Address", "") +
      '<div class="ex-detail-card">' +
      detailRow("Address", '<span class="ex-mono ex-break">' + addr + "</span>" + copyBtn(addr) + (lbl ? ' <span class="ex-tag">' + esc(lbl) + "</span>" : "") + (tok ? ' <span class="ex-tag ex-tag--blue">Token Contract</span>' : "")) +
      detailRow("Balance", fmtAmount(balance, 4) + " SECT <span class=\"ex-dim\">(≈ " + (SECT_REAL ? fmtUsd(balance * SECT_REAL.price) : "$—") + ")</span>") +
      (holdings.length
        ? detailRow("Token Holdings", '<div class="ex-holdings">' + holdings.map((h) => '<a class="ex-holding-chip" href="#/token/' + h.token.addr + '">' + tokenIcon(h.token, 16) + esc(h.token.symbol) + ": " + fmtAmount(h.balance, 2) + "</a>").join("") + "</div>")
        : "") +
      "</div>" +
      '<div class="ex-tabs2">' +
      '<a class="ex-tab2' + (tab !== "transfers" ? " is-active" : "") + '" href="#/address/' + addr + '?tab=txns">Transactions (' + list.length + ")</a>" +
      '<a class="ex-tab2' + (tab === "transfers" ? " is-active" : "") + '" href="#/address/' + addr + '?tab=transfers">Token Transfers (' + list.filter((t) => t.token).length + ")</a>" +
      "</div>" + body
    );
  }

  function renderTokensList() {
    // SECT siempre primero; el resto por capitalizacion
    const rows = TOKENS.slice()
      .sort((a, b) => (b.symbol === "SECT") - (a.symbol === "SECT") || b.price * b.supply - a.price * a.supply)
      .map((t, i) => (
        '<tr><td>' + (i + 1) + "</td>" +
        '<td><a class="ex-link ex-token-cell" href="#/token/' + t.addr + '">' + tokenIcon(t, 24) + '<span>' + esc(t.symbol) + "<small>" + esc(t.name) + "</small></span></a></td>" +
        '<td class="ex-hide-sm">' + esc(t.kind) + "</td>" +
        '<td class="ex-num">' + tokenPrice(t) + "</td>" +
        '<td class="ex-num">' + tokenCap(t) + "</td>" +
        '<td class="ex-num ex-hide-sm">' + fmtInt(t.holders) + "</td>" +
        '<td class="ex-num ex-hide-sm">' + fmtAmount(t.supply, 0) + " " + esc(t.symbol) + "</td></tr>"
      ))
      .join("");
    return (
      pageHeader("Sectora Token Tracker", fmtInt(TOKENS.length) + " tokens tracked · native + tokenized real-world assets") +
      '<div class="ex-table-wrap"><table class="ex-table">' +
      "<thead><tr><th>#</th><th>Token</th><th class=\"ex-hide-sm\">Type</th><th>Price</th><th>Market Cap</th><th class=\"ex-hide-sm\">Holders</th><th class=\"ex-hide-sm\">Total Supply</th></tr></thead>" +
      "<tbody>" + rows + "</tbody></table></div>"
    );
  }

  function renderTokenDetail(addr, tab, page) {
    const t = TOKEN_BY_ADDR.get(addr.toLowerCase());
    if (!t) return notFound("Token", addr);
    tab = tab || "transfers";
    const transfers = TOKEN_TXS.get(t.symbol) || [];
    let holdersRows = "";
    const nHolders = Math.min(20, t.holders);
    let remaining = t.supply;
    for (let i = 0; i < nHolders; i++) {
      const share = i === 0 ? 0.18 : (rand() * 0.5) / (i + 1);
      const bal = Math.min(remaining, t.supply * share * rand());
      remaining -= bal;
      const a = i < 3 ? pick(Object.values(ADDR)) : randAddress();
      holdersRows +=
        "<tr><td>" + (i + 1) + "</td><td>" + addrLink(a) + "</td>" +
        '<td class="ex-num">' + fmtAmount(bal, 3) + " " + esc(t.symbol) + "</td>" +
        '<td class="ex-num">' + ((bal / t.supply) * 100).toFixed(2) + "%</td></tr>";
    }
    let body;
    if (tab === "holders") {
      body = '<div class="ex-table-wrap"><table class="ex-table"><thead><tr><th>Rank</th><th>Address</th><th>Balance</th><th>% Supply</th></tr></thead><tbody>' + holdersRows + "</tbody></table></div>";
    } else {
      const p = paginate(transfers.length, page, 25);
      body =
        '<div class="ex-table-wrap"><table class="ex-table">' +
        "<thead><tr><th>Txn Hash</th><th>Age</th><th>From</th><th></th><th>To</th><th>Amount</th></tr></thead>" +
        "<tbody>" + transfers.slice(p.start, p.end).map((tx) => (
          '<tr><td><a class="ex-link ex-mono" href="#/tx/' + tx.hash + '">' + shortHash(tx.hash) + "</a></td>" +
          '<td class="ex-age" data-ts="' + tx.timestamp + '">' + timeAgo(tx.timestamp) + "</td>" +
          "<td>" + addrLink(tx.from) + "</td><td class=\"ex-dir\">" + ICO.arrowRight + "</td><td>" + addrLink(tx.to) + "</td>" +
          '<td class="ex-num">' + fmtAmount(tx.tokenAmount, 4) + " " + esc(t.symbol) + "</td></tr>"
        )).join("") + "</tbody></table></div>" +
        (transfers.length ? pagerHTML("#/token/" + addr + "?tab=transfers", p.page, p.pages) : emptyState("No transfers found for this token yet."));
    }
    return (
      pageHeader(t.name + " (" + t.symbol + ")", esc(t.kind)) +
      '<div class="ex-detail-card ex-detail-card--token">' +
      '<div class="ex-token-head">' + tokenIcon(t, 44) + '<div><h2>' + esc(t.name) + '</h2><span class="ex-dim">' + esc(t.symbol) + " · " + esc(t.kind) + "</span></div></div>" +
      detailRow("Contract Address", '<span class="ex-mono ex-break">' + t.addr + "</span>" + copyBtn(t.addr)) +
      detailRow("Price", tokenPrice(t)) +
      detailRow("Market Cap", tokenCap(t)) +
      detailRow("Total Supply", fmtAmount(t.supply, 0) + " " + esc(t.symbol)) +
      detailRow("Holders", fmtInt(t.holders)) +
      detailRow("Decimals", "18") +
      (t.custodian ? detailRow("Custodian", esc(t.custodian)) : "") +
      (t.desc ? detailRow("Description", "<p>" + esc(t.desc) + "</p>") : "") +
      "</div>" +
      '<div class="ex-tabs2">' +
      '<a class="ex-tab2' + (tab !== "holders" ? " is-active" : "") + '" href="#/token/' + addr + '?tab=transfers">Transfers (' + transfers.length + ")</a>" +
      '<a class="ex-tab2' + (tab === "holders" ? " is-active" : "") + '" href="#/token/' + addr + '?tab=holders">Holders (' + t.holders + ")</a>" +
      "</div>" + body
    );
  }

  /* ============================================================
     Tokenize an asset
     ============================================================ */
  const ASSET_CLASSES = [
    { id: "real-estate", label: "Real Estate", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>' },
    { id: "metals", label: "Precious Metals", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="20" height="9" rx="1.5"/><path d="M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>' },
    { id: "bonds", label: "Bonds &amp; Treasuries", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10"/><path d="M7 13h10"/><path d="M7 17h6"/></svg>' },
    { id: "credit", label: "Private Credit", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>' },
    { id: "commodities", label: "Commodities", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/></svg>' },
    { id: "equity", label: "Private Equity", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-4 4"/></svg>' },
    { id: "collectibles", label: "Art &amp; Collectibles", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>' },
    { id: "other", label: "Other Asset", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><path d="M12 17h.01"/></svg>' },
  ];
  const ASSET_CLASS_BY_ID = new Map(ASSET_CLASSES.map((c) => [c.id, c]));
  const TOKZ_COLORS = ["#468ce6", "#14e0a0", "#6c5ce7", "#d4af37", "#ff8a3d", "#d1293b", "#0f9d68", "#b5892c"];

  function renderTokenize() {
    const classCards = ASSET_CLASSES
      .map((c, i) => (
        '<button type="button" class="ex-tokz-class' + (i === 0 ? " is-selected" : "") + '" data-class="' + c.id + '">' + c.icon + "<span>" + c.label + "</span></button>"
      ))
      .join("");
    return (
      pageHeader("Tokenize a Real-World Asset", "Mint an on-chain token backed by an off-chain asset and list it on Sectorascan.") +
      '<p class="ex-tokz-intro">Fill in the asset details below to originate a new tokenized asset on the Sectora ' + CHAIN.layer + ' testnet. Once submitted, the token is minted, assigned a contract address and listed alongside the network’s other tracked real-world assets.</p>' +
      '<form class="ex-tokz-layout" id="exTokenizeForm">' +
      '<div class="ex-tokz-card">' +
      '<p class="ex-tokz-step-label">1 &middot; Asset class</p>' +
      '<div class="ex-tokz-classes" id="exTokzClasses">' + classCards + "</div>" +
      '<input type="hidden" id="exTokzClassInput" value="' + ASSET_CLASSES[0].id + '">' +

      '<p class="ex-tokz-step-label">2 &middot; Asset details</p>' +
      '<div class="ex-tokz-grid2">' +
      '<div class="ex-tokz-field ex-tokz-field--full">' +
      '<label class="ex-tokz-label" for="exTokzName">Asset name</label>' +
      '<input class="ex-tokz-input" id="exTokzName" placeholder="e.g. 200 Park Avenue — Floor 14" required maxlength="80">' +
      "</div>" +
      '<div class="ex-tokz-field ex-tokz-field--full">' +
      '<label class="ex-tokz-label" for="exTokzDesc">Description</label>' +
      '<textarea class="ex-tokz-textarea" id="exTokzDesc" placeholder="Location, provenance, custody arrangement and anything else a holder should know." maxlength="400"></textarea>' +
      "</div>" +
      '<div class="ex-tokz-field">' +
      '<label class="ex-tokz-label" for="exTokzValue">Total appraised value <small>(USD)</small></label>' +
      '<input class="ex-tokz-input" id="exTokzValue" type="number" min="1" step="0.01" placeholder="2500000" required>' +
      "</div>" +
      '<div class="ex-tokz-field">' +
      '<label class="ex-tokz-label" for="exTokzSupply">Total token supply</label>' +
      '<input class="ex-tokz-input" id="exTokzSupply" type="number" min="1" step="1" placeholder="1000" required>' +
      "</div>" +
      '<div class="ex-tokz-field">' +
      '<label class="ex-tokz-label" for="exTokzSymbol">Token symbol <small>(max 6 chars)</small></label>' +
      '<div class="ex-tokz-prefix"><span>x</span><input class="ex-tokz-input" id="exTokzSymbol" placeholder="PARKAVE" maxlength="6" required></div>' +
      "</div>" +
      '<div class="ex-tokz-field">' +
      '<label class="ex-tokz-label" for="exTokzCustodian">Custodian / jurisdiction</label>' +
      '<input class="ex-tokz-input" id="exTokzCustodian" placeholder="e.g. Sectora Custody LLC — Delaware">' +
      "</div>" +
      "</div>" +

      '<p class="ex-tokz-step-label">3 &middot; Supporting documentation</p>' +
      '<label class="ex-tokz-drop" id="exTokzDrop" for="exTokzFile">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4"/><path d="m6 10 6-6 6 6"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>' +
      '<span id="exTokzDropText"><b>Upload</b> proof of ownership, appraisal or title documents</span>' +
      '<input type="file" id="exTokzFile" hidden multiple>' +
      "</label>" +

      '<div class="ex-tokz-note">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>' +
      "<span>Sectorascan is a testnet preview. This form mints a simulated demo token for evaluation purposes — no real assets, documents or funds are transmitted.</span>" +
      "</div>" +

      '<button type="submit" class="ex-tokz-submit" id="exTokzSubmit">Mint tokenized asset</button>' +
      "</div>" +

      '<div class="ex-tokz-preview">' +
      '<div class="ex-tokz-preview-head"><span id="exTokzPreviewSymbol">x&mdash;</span></div>' +
      '<dl>' +
      '<div class="ex-tokz-preview-row"><dt>Asset class</dt><dd id="exTokzPvClass">' + ASSET_CLASSES[0].label + "</dd></div>" +
      '<div class="ex-tokz-preview-row"><dt>Total value</dt><dd id="exTokzPvValue">&mdash;</dd></div>' +
      '<div class="ex-tokz-preview-row"><dt>Token supply</dt><dd id="exTokzPvSupply">&mdash;</dd></div>' +
      '<div class="ex-tokz-preview-row"><dt>Price / token</dt><dd id="exTokzPvPrice">&mdash;</dd></div>' +
      "</dl>" +
      "</div>" +
      "</form>"
    );
  }

  function wireTokenizeForm() {
    const form = document.getElementById("exTokenizeForm");
    if (!form) return;

    const classInput = document.getElementById("exTokzClassInput");
    const pvClass = document.getElementById("exTokzPvClass");
    document.getElementById("exTokzClasses").addEventListener("click", (e) => {
      const btn = e.target.closest(".ex-tokz-class");
      if (!btn) return;
      document.querySelectorAll(".ex-tokz-class").forEach((b) => b.classList.toggle("is-selected", b === btn));
      const id = btn.getAttribute("data-class");
      classInput.value = id;
      pvClass.textContent = ASSET_CLASS_BY_ID.get(id).label.replace("&amp;", "&");
    });

    const symbolInput = document.getElementById("exTokzSymbol");
    const valueInput = document.getElementById("exTokzValue");
    const supplyInput = document.getElementById("exTokzSupply");
    const pvSymbol = document.getElementById("exTokzPreviewSymbol");
    const pvValue = document.getElementById("exTokzPvValue");
    const pvSupply = document.getElementById("exTokzPvSupply");
    const pvPrice = document.getElementById("exTokzPvPrice");

    function refreshPreview() {
      const sym = symbolInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      pvSymbol.textContent = "x" + (sym || "—");
      const value = parseFloat(valueInput.value);
      const supply = parseFloat(supplyInput.value);
      pvValue.textContent = value > 0 ? fmtUsd(value) : "—";
      pvSupply.textContent = supply > 0 ? fmtInt(supply) + " tokens" : "—";
      pvPrice.textContent = value > 0 && supply > 0 ? "$" + fmtAmount(value / supply, 4) : "—";
    }
    [symbolInput, valueInput, supplyInput].forEach((el) => el.addEventListener("input", refreshPreview));

    const fileInput = document.getElementById("exTokzFile");
    const drop = document.getElementById("exTokzDrop");
    const dropText = document.getElementById("exTokzDropText");
    fileInput.addEventListener("change", () => {
      const n = fileInput.files.length;
      drop.classList.toggle("has-file", n > 0);
      dropText.innerHTML = n > 0 ? "<b>" + n + (n === 1 ? " file" : " files") + " attached</b> — ready to submit" : "<b>Upload</b> proof of ownership, appraisal or title documents";
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("exTokzSubmit");
      const name = document.getElementById("exTokzName").value.trim();
      const value = parseFloat(valueInput.value);
      const supply = parseFloat(supplyInput.value);
      let symbol = symbolInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!name || !(value > 0) || !(supply > 0) || !symbol) return;
      symbol = "x" + symbol;
      let unique = symbol, n = 2;
      while (TOKEN_BY_SYMBOL.has(unique.toLowerCase())) unique = symbol + n++;
      symbol = unique;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="ex-tokz-spin" aria-hidden="true"></span> Verifying documentation…';

      const payload = {
        name, symbol, value, supply,
        classId: classInput.value,
        desc: document.getElementById("exTokzDesc").value.trim(),
        custodian: document.getElementById("exTokzCustodian").value.trim(),
      };
      setTimeout(() => mintAsset(payload), 1150);
    });
  }

  function mintAsset(p) {
    const cls = ASSET_CLASS_BY_ID.get(p.classId) || ASSET_CLASSES[0];
    const addr = makeKnown("Sectora: " + p.name + " Vault");
    const t = {
      symbol: p.symbol,
      name: p.name,
      kind: "RWA · " + cls.label.replace("&amp;", "&"),
      color: pick(TOKZ_COLORS),
      price: p.value / p.supply,
      supply: p.supply,
      holders: 1,
      addr,
      desc: p.desc,
      custodian: p.custodian,
    };
    t.baseline = t.price;
    TOKENS.push(t);
    TOKEN_BY_SYMBOL.set(t.symbol.toLowerCase(), t);
    TOKEN_BY_ADDR.set(t.addr.toLowerCase(), t);
    location.hash = "#/token/" + t.addr;
  }

  function renderGasTracker() {
    const low = 0.8 + rand() * 0.3, avg = 1.4 + rand() * 0.4, high = 2.4 + rand() * 0.8;
    const hist = days14Values(1.6, 0.5);
    return (
      pageHeader("Sectora Gas Tracker", "Estimated gas prices for the next block on " + CHAIN.name) +
      '<div class="ex-gas-grid">' +
      gasCard("Low", low, "~4 sec", "gray") +
      gasCard("Average", avg, "~2 sec", "blue") +
      gasCard("High", high, "~1 sec", "green") +
      "</div>" +
      chartCard("Gas Price History", "14 Days · Gwei", lineChart(hist, { color: "var(--ex-blue)" })) +
      '<p class="ex-dim ex-gastext">Sectora is a ' + CHAIN.layer + ' network, so gas fees settle at a small fraction of a cent — base fees shown here are denominated in the network’s own Gwei-equivalent unit.</p>'
    );
  }
  function gasCard(label, gwei, eta, tone) {
    return (
      '<div class="ex-gas-card ex-gas-card--' + tone + '">' + ICO.fuel +
      '<div class="ex-gas-label">' + label + "</div>" +
      '<div class="ex-gas-value">' + fmtAmount(gwei, 2) + " <small>Gwei</small></div>" +
      '<div class="ex-gas-eta">' + eta + "</div></div>"
    );
  }

  function renderCharts() {
    return (
      pageHeader("Charts &amp; Statistics", "Network activity across " + CHAIN.name) +
      '<div class="ex-charts-grid">' +
      '<div class="ex-chart-card ex-pc-card">' + priceChart("full") + "</div>" +
      chartCard("Daily Transactions", "14 Days", barChart(DAILY_TX, { color: "var(--ex-blue)" })) +
      chartCard("Daily Active Addresses", "14 Days", barChart(DAILY_ADDR, { color: "var(--ex-purple)" })) +
      chartCard("Total Value Tokenized", "14 Days", lineChart(TVL_HIST, { color: "var(--ex-gold)" })) +
      "</div>"
    );
  }

  function pageHeader(title, sub) {
    return '<div class="ex-page-head"><p class="ex-eyebrow"><i></i>Sectorascan &middot; Sectora L3 testnet</p><h1>' + title + "</h1>" + (sub ? "<p>" + sub + "</p>" : "") + "</div>";
  }
  function detailRow(label, valueHtml) {
    return '<div class="ex-detail-row"><div class="ex-detail-label">' + label + '</div><div class="ex-detail-value">' + valueHtml + "</div></div>";
  }
  function emptyState(msg) {
    return '<div class="ex-empty">' + msg + "</div>";
  }
  function notFound(kind, q) {
    return (
      pageHeader(kind + " Not Found", "") +
      '<div class="ex-empty ex-empty--big">No matching ' + kind.toLowerCase() + ' record found for <span class="ex-mono">' + esc(q) + '</span>.<br><a class="ex-link" href="#/">Return home</a></div>'
    );
  }

  /* ============================================================
     Search
     ============================================================ */
  function handleSearch(raw, errEl) {
    const q = (raw || "").trim();
    if (errEl) { errEl.hidden = true; errEl.textContent = ""; }
    if (!q) return;
    if (/^\d+$/.test(q)) {
      location.hash = "#/block/" + q;
      return;
    }
    if (/^0x[0-9a-fA-F]{64}$/.test(q)) {
      location.hash = "#/tx/" + q.toLowerCase();
      return;
    }
    if (/^0x[0-9a-fA-F]{40}$/.test(q)) {
      location.hash = "#/address/" + q.toLowerCase();
      return;
    }
    const bySymbol = TOKEN_BY_SYMBOL.get(q.toLowerCase());
    if (bySymbol) { location.hash = "#/token/" + bySymbol.addr; return; }
    const byName = TOKENS.find((t) => t.name.toLowerCase().includes(q.toLowerCase()));
    if (byName) { location.hash = "#/token/" + byName.addr; return; }
    if (errEl) { errEl.hidden = false; errEl.textContent = 'No matching records found for "' + q + '".'; }
    else alert('No matching records found for "' + q + '".');
  }

  /* ============================================================
     Main render / router
     ============================================================ */
  const mainEl = () => document.getElementById("exMain");

  function render(opts) {
    const preserveScroll = !!(opts && opts.preserveScroll);
    const { parts, params } = parseRoute();
    const view = parts[0] || "home";
    const page = parseInt(params.get("page") || "1", 10);
    let html;
    switch (view) {
      case "home":
      case "":
        html = renderHome();
        break;
      case "blocks":
        html = renderBlocksList(page);
        break;
      case "block":
        html = renderBlockDetail(parts[1]);
        break;
      case "txs":
        html = renderTxsList(page);
        break;
      case "tx":
        html = renderTxDetail(parts[1] || "");
        break;
      case "address":
        html = renderAddress(parts[1] || "", params.get("tab"), page);
        break;
      case "tokens":
        html = renderTokensList();
        break;
      case "token":
        html = renderTokenDetail(parts[1] || "", params.get("tab"), page);
        break;
      case "gastracker":
        html = renderGasTracker();
        break;
      case "charts":
        html = renderCharts();
        break;
      case "tokenize":
        html = renderTokenize();
        break;
      default:
        html = notFound("Page", view);
    }
    const el = mainEl();
    // la grafica de precio se conserva si no cambio: la portada se repinta
    // cada pocos segundos y asi no se pierde el cursor ni las animaciones
    // (sin sacarla del documento: al reinsertarla, sus animaciones empezarian de cero)
    if (el) {
      const oldPc = el.querySelector(".ex-pc");
      const tpl = document.createElement("div");
      tpl.innerHTML = html;
      const newPc = tpl.querySelector(".ex-pc");
      if (oldPc && newPc && oldPc.getAttribute("data-pc-key") === newPc.getAttribute("data-pc-key")) {
        const top = (node, root) => { while (node.parentNode !== root) node = node.parentNode; return node; };
        const keep = top(oldPc, el), skip = top(newPc, tpl);
        Array.from(el.childNodes).forEach((c) => { if (c !== keep) el.removeChild(c); });
        let before = true;
        Array.from(tpl.childNodes).forEach((c) => {
          if (c === skip) { before = false; return; }
          if (before) el.insertBefore(c, keep); else el.appendChild(c);
        });
      } else {
        el.innerHTML = "";
        while (tpl.firstChild) el.appendChild(tpl.firstChild);
      }
      el.querySelectorAll(".ex-pc.is-anim").forEach(pcSettle);
    }
    updateNavActive(view);
    if (!preserveScroll) window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    updateAges();
    if (view === "tokenize") wireTokenizeForm();
  }

  function updateNavActive(view) {
    document.querySelectorAll(".ex-navlink").forEach((a) => {
      const match = a.getAttribute("data-view");
      a.classList.toggle("is-active", match === view || (match === "home" && (view === "" || view === "home")));
    });
  }

  function updateAges() {
    document.querySelectorAll(".ex-age").forEach((el) => {
      const ts = parseInt(el.getAttribute("data-ts"), 10);
      if (!isNaN(ts)) el.textContent = timeAgo(ts);
    });
  }

  /* ============================================================
     Header ticker (live, persists across route changes)
     ============================================================ */
  function updateHeaderTicker() {
    const sect = TOKEN_BY_SYMBOL.get("sect");
    const bh = document.getElementById("exTickerBlock");
    const gp = document.getElementById("exTickerGas");
    const pr = document.getElementById("exTickerPrice");
    if (bh) bh.textContent = fmtInt(currentTip);
    const hb = document.getElementById("exHeroBlock");
    if (hb) hb.textContent = fmtInt(currentTip);
    if (gp) gp.textContent = fmtAmount(1.2 + rand() * 0.8, 2) + " Gwei";
    // sin dato real de CoinGecko no se muestra ningun precio
    if (pr) pr.textContent = SECT_REAL ? "$" + pcFmt(SECT_REAL.price) : "$—";
  }

  /* ============================================================
     Token price jitter (keeps the RWA section feeling alive)
     ============================================================ */
  TOKENS.forEach((t) => { t.baseline = t.price; });
  function jitterPrices() {
    TOKENS.forEach((t) => {
      if (SECT_REAL && t.symbol === "SECT") return;   // el precio real no se toca
      const drift = (rand() - 0.5) * 0.004;
      t.price = Math.max(t.baseline * 0.85, t.price * (1 + drift));
    });
  }

  /* ============================================================
     Event wiring
     ============================================================ */
  function wireEvents() {
    document.addEventListener("click", (e) => {
      const pcTab = e.target.closest(".ex-pc-tab");
      if (pcTab) {
        const r = pcTab.getAttribute("data-pc-range");
        if (r && r !== PC_RANGE) {
          PC_RANGE = r;
          PC_ANIM = true;
          try { localStorage.setItem("sectorascanPriceRange", r); } catch (err) {}
          refreshPriceCharts();
        }
        return;
      }
      const copyEl = e.target.closest(".ex-copy");
      if (copyEl) {
        const text = copyEl.getAttribute("data-copy");
        if (navigator.clipboard && text) {
          navigator.clipboard.writeText(text).then(() => {
            copyEl.classList.add("is-copied");
            const prev = copyEl.innerHTML;
            copyEl.innerHTML = ICO.check;
            setTimeout(() => { copyEl.innerHTML = prev; copyEl.classList.remove("is-copied"); }, 1100);
          }).catch(() => {});
        }
      }
    });

    const headerForm = document.getElementById("exHeaderSearch");
    if (headerForm) {
      headerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("exHeaderSearchInput");
        handleSearch(input.value, null);
      });
    }

    document.addEventListener("submit", (e) => {
      if (e.target && e.target.id === "exHeroSearch") {
        e.preventDefault();
        const input = document.getElementById("exHeroSearchInput");
        const err = document.getElementById("exHeroError");
        handleSearch(input.value, err);
      }
    });

    const navToggle = document.getElementById("exNavToggle");
    const navMobile = document.getElementById("exNavMobile");
    if (navToggle && navMobile) {
      navToggle.addEventListener("click", () => {
        const open = navMobile.classList.toggle("is-open");
        navToggle.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      navMobile.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
        navMobile.classList.remove("is-open");
        navToggle.classList.remove("is-open");
      }));
    }

    const themeToggle = document.getElementById("exThemeToggle");
    if (themeToggle) {
      // la barra del navegador en movil se pinta con theme-color: si no se
      // actualiza al cambiar de tema, se queda del color del tema anterior
      const themeMeta = document.getElementById("exThemeColor");
      const syncLabel = () => {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
        if (themeMeta) themeMeta.setAttribute("content", isDark ? "#05070c" : "#f2f2ef");
      };
      syncLabel();
      themeToggle.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        if (next === "dark") document.documentElement.setAttribute("data-theme", "dark");
        else document.documentElement.removeAttribute("data-theme");
        // se guarda siempre el valor elegido, tambien "light": es lo que
        // distingue "el visitante quiere claro" de "aun no ha elegido nada",
        // que ahora significa oscuro
        try { localStorage.setItem("sectorascanTheme", next); } catch (e) {}
        syncLabel();
      });
    }

    document.addEventListener("pointermove", pcPointer, { passive: true });
    document.addEventListener("pointerdown", pcPointer, { passive: true });
    // con el dedo el tooltip se queda hasta tocar fuera; con raton se va al salir
    document.documentElement.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") pcHideHover(); });

    window.addEventListener("hashchange", () => render());
  }

  /* ============================================================
     Precio real de SECT (CoinGecko)
     Dos fuentes, por orden de frescura:
       1. CoinGecko directo desde el navegador: 30 dias por horas al abrir
          y las ultimas 24 h cada 5 min, releidas cada minuto.
       2. sect-price-30d.json del repo: lo escribe el robot de GitHub
          Actions, que en la practica se retrasa horas, asi que solo sirve
          de red de seguridad (CoinGecko caido, limite de peticiones, etc).
     ============================================================ */
  const SECT_CONTRACT = "0x8c9984b06281f1ca9416e493c2e602aab08513db";
  const CG_PATHS = [
    "https://api.coingecko.com/api/v3/coins/ethereum/contract/" + SECT_CONTRACT + "/market_chart",
    "https://api.coingecko.com/api/v3/coins/sectora/market_chart",
  ];
  let cgPath = 0, cgPausedUntil = 0, cgLastTry = 0;

  function cgFetch(days) {
    if (Date.now() < cgPausedUntil) return Promise.resolve(null);
    return fetch(CG_PATHS[cgPath] + "?vs_currency=usd&days=" + days)
      .then((r) => {
        if (r.status === 429) { cgPausedUntil = Date.now() + 300000; return null; }
        if (!r.ok) { if (r.status === 404 && cgPath < CG_PATHS.length - 1) cgPath++; return null; }
        return r.json();
      })
      .then((d) => (d && Array.isArray(d.prices) ? d.prices : null))
      .catch(() => null);
  }

  // mezcla una serie nueva: sustituye lo que habia en su tramo de tiempo
  function mergePrices(raw, live) {
    let pts = (raw || [])
      .filter((p) => Array.isArray(p) && isFinite(p[0]) && isFinite(p[1]) && p[1] > 0)
      .map((p) => [+p[0], +p[1]])
      .sort((a, b) => a[0] - b[0]);
    if (!live && PRICE_PTS.length) {
      // el archivo del robot solo aporta lo que sea mas nuevo que lo que hay
      const lastT = PRICE_PTS[PRICE_PTS.length - 1][0];
      pts = pts.filter((p) => p[0] > lastT);
    }
    if (!pts.length || (!PRICE_PTS.length && pts.length < 2)) return false;
    const from = pts[0][0], to = pts[pts.length - 1][0];
    let all = PRICE_PTS.filter((p) => p[0] < from || p[0] > to).concat(pts).sort((a, b) => a[0] - b[0]);
    const endT = all[all.length - 1][0];
    all = all.filter((p) => p[0] >= endT - 31 * 86400000);
    const before = PRICE_PTS.length ? PRICE_PTS[PRICE_PTS.length - 1] : null;
    const same = before && all.length === PRICE_PTS.length && before[0] === endT && before[1] === all[all.length - 1][1] && all[0][0] === PRICE_PTS[0][0];
    if (same) return false;
    if (before && before[1] !== all[all.length - 1][1]) PC_FLASH = all[all.length - 1][1] > before[1] ? "up" : "down";
    PRICE_PTS = all;
    PRICE_VER++;
    return true;
  }

  // aplica los datos al resto de la pagina: cinta, tarjeta de precio y graficas
  function onPrices(changed) {
    if (PRICE_PTS.length >= 2) {
      PRICE_STATE = "ok";
      const last = PRICE_PTS[PRICE_PTS.length - 1];
      if (!PRICE_UPDATED) PRICE_UPDATED = last[0];
      let prev = PRICE_PTS[0];
      for (const p of PRICE_PTS) { if (p[0] <= last[0] - 86400000) prev = p; else break; }
      const sect = TOKEN_BY_SYMBOL.get("sect");
      sect.price = last[1]; sect.baseline = last[1];
      SECT_REAL = { price: last[1], change24h: (last[1] / prev[1] - 1) * 100 };
      updateHeaderTicker();
    } else if (PRICE_STATE === "loading") {
      PRICE_STATE = "error";
      changed = true;
    }
    // las paginas de tokens ensenan el precio de SECT: se repintan con el dato nuevo
    const view = parseRoute().parts[0] || "home";
    if (changed && (view === "tokens" || view === "token" || view === "address")) render({ preserveScroll: true });
    const hasLive = document.querySelector(".ex-pc-live .ex-led") !== null;
    if (changed || hasLive !== pcLive()) refreshPriceCharts();
    document.querySelectorAll(".ex-pc-upd").forEach((el) => el.setAttribute("data-ts", PRICE_UPDATED));
    updateAges();
  }

  function loadSectFile() {
    return fetch("sect-price-30d.json?t=" + Math.floor(Date.now() / 300000), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }

  // primera carga: archivo del robot + CoinGecko (30 dias y 24 h) a la vez;
  // se pinta una sola vez con lo que haya llegado en 2.5 s
  function loadSectMarket() {
    cgLastTry = Date.now();
    const cap = (pr) => Promise.race([pr, new Promise((res) => setTimeout(() => res(undefined), 2500))]);
    const file = loadSectFile();
    const cg30 = cgFetch(30);
    const cg1 = cg30.then(() => cgFetch(1));
    Promise.all([file, cap(cg30), cap(cg1)]).then(([f, a, b]) => {
      let changed = false;
      if (f && Array.isArray(f.prices) && mergePrices(f.prices, false)) { changed = true; PRICE_UPDATED = Math.max(PRICE_UPDATED, +f.updatedAt || 0); }
      [a, b].forEach((pr) => { if (pr) { changed = mergePrices(pr, true) || changed; PRICE_LIVE_AT = PRICE_UPDATED = Date.now(); } });
      onPrices(changed);
      // si CoinGecko tardo mas de 2.5 s, su dato entra cuando llegue
      [[a, cg30], [b, cg1]].forEach(([got, pr]) => {
        if (got !== undefined) return;
        pr.then((late) => { if (late) { const c = mergePrices(late, true); PRICE_LIVE_AT = PRICE_UPDATED = Date.now(); onPrices(c); } });
      });
    });
  }

  // cada minuto, con la pestana visible: ultimas 24 h de CoinGecko
  function liveTick() {
    if (document.hidden || Date.now() - cgLastTry < 55000) return;
    cgLastTry = Date.now();
    cgFetch(1).then((pr) => {
      if (pr) {
        const c = mergePrices(pr, true);
        PRICE_LIVE_AT = PRICE_UPDATED = Date.now();
        onPrices(c);
      } else if (!pcLive()) {
        // CoinGecko no responde: se mira si el robot dejo algo mas nuevo
        loadSectFile().then((f) => {
          const c = !!(f && Array.isArray(f.prices) && mergePrices(f.prices, false));
          if (c) PRICE_UPDATED = Math.max(PRICE_UPDATED, +f.updatedAt || 0);
          onPrices(c);
        });
      }
    });
  }

  function init() {
    if (!location.hash) location.hash = "#/";
    wireEvents();
    render();
    updateHeaderTicker();
    loadSectMarket();
    setInterval(liveTick, 60000);
    document.addEventListener("visibilitychange", liveTick);
    setInterval(() => { pushLiveBlock(); }, CHAIN.blockTimeMs);
    setInterval(() => {
      const { parts, params } = parseRoute();
      const view = parts[0] || "home";
      const page = parseInt(params.get("page") || "1", 10);
      if (view === "" || view === "home" || ((view === "blocks" || view === "txs") && page === 1)) {
        render({ preserveScroll: true });
      } else {
        updateAges();
      }
      updateHeaderTicker();
    }, CHAIN.blockTimeMs);
    setInterval(() => { jitterPrices(); if ((parseRoute().parts[0] || "home") === "home") render({ preserveScroll: true }); }, 3200);
    setInterval(updateAges, 5000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
