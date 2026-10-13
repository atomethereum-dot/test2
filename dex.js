/* ---- Sectora DEX preview: trade / P2P / swap, all client-side.
   Every listed price (crypto, precious metals, NY indices) is real and
   polled from public, keyless APIs — CoinGecko for ~108 cryptocurrencies
   plus tokenized gold/silver (Binance as a fallback if CoinGecko is
   unreachable), and Yahoo Finance's public chart endpoint for the Dow
   Jones / S&P 500 / Nasdaq. Nothing about the price itself is fabricated.
   Only the order book, recent-trades tape and P2P offers are simulated
   trading activity layered on top of those real prices — no wallet ever
   actually connects and no funds move; every action-taking button opens
   the same "development preview" disclaimer modal.
   SECT/USDT is the exception: it is #SECT's real market (Uniswap V3 on
   Ethereum). Its price, 24h stats and chart come only from CoinGecko,
   it has no simulated order book or trades, and its Buy button opens the
   official Uniswap link. ---- */
(function () {
  "use strict";

  const root = document.querySelector(".dx");
  if (!root) return;

  function t(key, fallback) {
    return window.SECTORA_T ? window.SECTORA_T(key) : fallback;
  }

  // ---------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------

  const QUOTE = "USDX";

  // Kept intentionally small — the exact same shape (one /simple/price
  // call, a handful of ids) as the main site's live Supply table, which is
  // proven to work. A much larger, chunked version of this was tried and
  // turned out unreliable, so this stays at the original scale.
  // [id, ticker, name, approxRank] — approxRank only drives local tiering
  // (order-book depth, trade sizes), not display order.
  // 5th field is a starting price shown the instant the page loads (before
  // the first live poll lands), so the market never sits on an empty "—"
  // while a request is in flight or if a single poll fails — same
  // resilience behavior as the very first version of this page. Live
  // polling still overwrites this with the real price a few seconds later.
  const COIN_DEFS = [
    ["bitcoin", "BTC", "Bitcoin", 1, 65000], ["ethereum", "ETH", "Ethereum", 2, 1900],
    ["bitcoin-cash", "BCH", "Bitcoin Cash", 18, 220], ["solana", "SOL", "Solana", 5, 75],
    ["litecoin", "LTC", "Litecoin", 21, 46], ["ripple", "XRP", "XRP", 6, 2.9],
    ["sui", "SUI", "Sui", 24, 3.5], ["hyperliquid", "HYPE", "Hyperliquid", 30, 29],
  ];
  const METAL_DEFS = [
    ["pax-gold", "PAXG", "Gold", 2650],
    ["kinesis-silver", "KAG", "Silver", 31],
  ];
  const METAL_IDS = { "pax-gold": "Gold", "kinesis-silver": "Silver" };
  const ALL_COIN_IDS = COIN_DEFS.map((c) => c[0]).concat(METAL_DEFS.map((m) => m[0]));
  const SIMPLE_PRICE_URL =
    "https://api.coingecko.com/api/v3/simple/price?ids=" + ALL_COIN_IDS.join(",") +
    "&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true";

  const INDEX_DEFS = [
    { symbol: "^DJI", ticker: "DJI", name: "Dow Jones" },
    { symbol: "^GSPC", ticker: "SPX", name: "S&P 500" },
    { symbol: "^IXIC", ticker: "IXIC", name: "Nasdaq Composite" },
  ];
  const YAHOO_HOSTS = ["https://query1.finance.yahoo.com", "https://query2.finance.yahoo.com"];

  // Used only if the CoinGecko call fails outright — keeps the DEX
  // populated with real prices for the major pairs instead of an empty
  // list. Binance's public 24hr ticker also returns real market data.
  const BINANCE_FALLBACK = [
    ["BTCUSDT", "bitcoin", "Bitcoin", 1], ["ETHUSDT", "ethereum", "Ethereum", 2],
    ["BCHUSDT", "bitcoin-cash", "Bitcoin Cash", 18], ["SOLUSDT", "solana", "Solana", 5],
    ["LTCUSDT", "litecoin", "Litecoin", 21], ["XRPUSDT", "ripple", "XRP", 6],
    ["SUIUSDT", "sui", "Sui", 24], ["HYPEUSDT", "hyperliquid", "Hyperliquid", 30],
  ];

  // Real DEX/exchange screens don't poll — they hold one socket open and
  // paint every tick as it arrives. Binance's public market-data stream is
  // free, keyless and needs no origin allowlist (it's not a browser CORS
  // request at all), so it's used here for that same feel: prices move the
  // instant a trade happens instead of waiting on a fixed interval. Only
  // pairs that actually trade on Binance can stream this way — gold
  // (PAXGUSDT) does, silver (kinesis-silver) doesn't, so silver and the NY
  // indices still ride the polling path below.
  const BINANCE_WS_URL = "wss://stream.binance.com:9443/stream?streams=";
  const BINANCE_WS_SYMBOLS = [
    ["btcusdt", "bitcoin"], ["ethusdt", "ethereum"], ["bchusdt", "bitcoin-cash"],
    ["solusdt", "solana"], ["ltcusdt", "litecoin"], ["xrpusdt", "ripple"],
    ["suiusdt", "sui"], ["hypeusdt", "hyperliquid"], ["paxgusdt", "pax-gold"],
  ];
  const WS_ID_BY_STREAM = {};
  BINANCE_WS_SYMBOLS.forEach(([stream, id]) => { WS_ID_BY_STREAM[stream + "@ticker"] = id; });

  const CRYPTO_POLL_MS = 20000;
  const INDEX_POLL_MS = 30000;
  const TIMEFRAMES = { "1m": 60000, "5m": 300000, "15m": 900000, "1h": 3600000 };

  let ASSETS = [];
  let BY_ID = {};
  let activeSymbol = "sect";      // el DEX abre en el mercado real SECT/USDT
  let activeTf = "1m";
  let dataReady = false;
  let activeCategory = "all";
  let searchQuery = "";

  // ---------------------------------------------------------------------
  // SECT/USDT: el mercado real de #SECT en Uniswap V3 (Ethereum).
  // Todo lo que se ve de este par sale de CoinGecko: precio, cambio,
  // maximo y minimo de 24 h, volumen y la grafica. No tiene libro de
  // ordenes ni operaciones simuladas; la compra se hace en Uniswap.
  //   1. CoinGecko directo desde el navegador: 30 dias por horas al abrir
  //      y las ultimas 24 h cada 5 min, releidas cada minuto.
  //   2. sect-price-30d.json del repo (el robot de precios), solo como red
  //      de seguridad si CoinGecko no responde.
  // ---------------------------------------------------------------------
  const SECT_ID = "sect";
  const SECT_CONTRACT = "0x8c9984b06281f1ca9416e493c2e602aab08513db";
  const SECT_SUPPLY = 50000000;
  const SECT_UNISWAP = "https://app.uniswap.org/swap?inputCurrency=0xdAC17F958D2ee523a2206206994597C13D831ec7&outputCurrency=0x8C9984B06281f1CA9416e493c2E602AaB08513db&chain=ethereum";
  const SECT_CG = [
    "https://api.coingecko.com/api/v3/coins/ethereum/contract/" + SECT_CONTRACT + "/market_chart",
    "https://api.coingecko.com/api/v3/coins/sectora/market_chart",
  ];
  // [duracion visible, tamano de vela] por rango
  const SECT_RANGES = { "24h": [86400000, 1200000], "7d": [7 * 86400000, 7200000], "30d": [30 * 86400000, 21600000] };
  const SECT = {
    id: SECT_ID, ticker: "SECT", name: "Sectora", category: "sect",
    pts: [], price: null, change24h: null, high24h: null, low24h: null, vol24h: null,
    updatedAt: 0, liveAt: 0,
  };
  let sectRange = "30d";
  let sectCgPath = 0, sectPausedUntil = 0, sectLastTry = 0;

  function sectFetch(days) {
    if (Date.now() < sectPausedUntil) return Promise.resolve(null);
    return fetch(SECT_CG[sectCgPath] + "?vs_currency=usd&days=" + days)
      .then((r) => {
        if (r.status === 429) { sectPausedUntil = Date.now() + 300000; return null; }
        if (!r.ok) { if (r.status === 404 && sectCgPath < SECT_CG.length - 1) sectCgPath++; return null; }
        return r.json();
      })
      .then((d) => (d && Array.isArray(d.prices) ? d : null))
      .catch(() => null);
  }
  function sectFile() {
    return fetch("sect-price-30d.json?t=" + Math.floor(Date.now() / 300000), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  // mezcla una serie: sustituye lo que habia en su tramo de tiempo
  function sectMerge(raw, live) {
    let pts = (raw || [])
      .filter((p) => Array.isArray(p) && isFinite(p[0]) && isFinite(p[1]) && p[1] > 0)
      .map((p) => [+p[0], +p[1]])
      .sort((a, b) => a[0] - b[0]);
    if (!live && SECT.pts.length) {
      const lastT = SECT.pts[SECT.pts.length - 1][0];
      pts = pts.filter((p) => p[0] > lastT);
    }
    if (!pts.length || (!SECT.pts.length && pts.length < 2)) return false;
    const from = pts[0][0], to = pts[pts.length - 1][0];
    let all = SECT.pts.filter((p) => p[0] < from || p[0] > to).concat(pts).sort((a, b) => a[0] - b[0]);
    const endT = all[all.length - 1][0];
    SECT.pts = all.filter((p) => p[0] >= endT - 31 * 86400000);
    return true;
  }
  function sectApply(d) {
    if (!d) return;
    sectMerge(d.prices, true);
    SECT.liveAt = SECT.updatedAt = Date.now();
    const vols = d.total_volumes;
    if (Array.isArray(vols) && vols.length && isFinite(vols[vols.length - 1][1])) SECT.vol24h = +vols[vols.length - 1][1];
  }
  function sectRecompute() {
    const P = SECT.pts;
    if (P.length < 2) return;
    const last = P[P.length - 1];
    const from = last[0] - 86400000;
    let prev = P[0], hi = -Infinity, lo = Infinity;
    for (const p of P) {
      if (p[0] <= from) prev = p;
      else { if (p[1] > hi) hi = p[1]; if (p[1] < lo) lo = p[1]; }
    }
    if (prev[1] > hi) hi = prev[1];
    if (prev[1] < lo) lo = prev[1];
    SECT.price = last[1];
    SECT.change24h = (last[1] / prev[1] - 1) * 100;
    SECT.high24h = hi;
    SECT.low24h = lo;
    if (!SECT.updatedAt) SECT.updatedAt = last[0];
  }
  // velas a partir de los precios reales de CoinGecko: apertura = cierre
  // de la vela anterior; maximo, minimo y cierre, los precios de su tramo
  function sectCandles() {
    const P = SECT.pts;
    if (P.length < 2) return [];
    const r = SECT_RANGES[sectRange] || SECT_RANGES["30d"];
    const start = P[P.length - 1][0] - r[0];
    const out = [];
    let cur = null;
    for (const p of P) {
      if (p[0] < start) continue;
      const b = Math.floor(p[0] / r[1]) * r[1];
      if (!cur || cur.t !== b) {
        if (cur) out.push(cur);
        const o = cur ? cur.c : p[1];
        cur = { t: b, o: o, h: Math.max(o, p[1]), l: Math.min(o, p[1]), c: p[1], v: 0 };
      } else {
        if (p[1] > cur.h) cur.h = p[1];
        if (p[1] < cur.l) cur.l = p[1];
        cur.c = p[1];
      }
    }
    if (cur) out.push(cur);
    return out;
  }
  function sectLive() { return Date.now() - SECT.liveAt < 150000; }
  function sectMatches(q) {
    q = (q || "").trim().toLowerCase();
    return !q || "sect sectora usdt sect/usdt".indexOf(q) !== -1;
  }
  function sectBuyHref() {
    const pay = parseFloat(((sectPayEl && sectPayEl.value) || "").replace(/,/g, ""));
    return SECT_UNISWAP + (pay > 0 ? "&exactAmount=" + encodeURIComponent(String(pay)) + "&exactField=input" : "");
  }
  // primera carga: archivo del robot + CoinGecko (30 dias y 24 h) a la
  // vez; se pinta con lo que haya llegado en 2.5 s
  function sectLoad() {
    sectLastTry = Date.now();
    const cap = (pr) => Promise.race([pr, new Promise((res) => setTimeout(() => res(undefined), 2500))]);
    const file = sectFile();
    const a = sectFetch(30);
    const b = a.then(() => sectFetch(1));
    Promise.all([file, cap(a), cap(b)]).then(([f, x, y]) => {
      if (f && Array.isArray(f.prices) && sectMerge(f.prices, false)) SECT.updatedAt = Math.max(SECT.updatedAt, +f.updatedAt || 0);
      if (x) sectApply(x);
      if (y) sectApply(y);
      sectRecompute();
      sectRender();
      [[x, a], [y, b]].forEach(([got, pr]) => {
        if (got !== undefined) return;
        pr.then((d) => { if (d) { sectApply(d); sectRecompute(); sectRender(); } });
      });
    });
  }
  // cada minuto, con la pestana visible: ultimas 24 h de CoinGecko
  function sectTick() {
    if (document.hidden || Date.now() - sectLastTry < 55000) return;
    sectLastTry = Date.now();
    sectFetch(1).then((d) => {
      if (d) { sectApply(d); sectRecompute(); sectRender(); return; }
      if (sectLive()) return;
      sectFile().then((f) => {
        if (f && Array.isArray(f.prices) && sectMerge(f.prices, false)) {
          SECT.updatedAt = Math.max(SECT.updatedAt, +f.updatedAt || 0);
          sectRecompute();
        }
        sectRender();
      });
    });
  }

  // ---------------------------------------------------------------------
  // Formatters
  // ---------------------------------------------------------------------

  function fmtPrice(v) {
    if (v == null || !isFinite(v)) return "—";
    if (v >= 1000) return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (v >= 1) return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (v >= 0.01) return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    if (v >= 0.0001) return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 6 });
    return "$" + v.toPrecision(4);
  }
  function fmtPricePlain(v) {
    const s = fmtPrice(v);
    return s === "—" ? s : s.slice(1);
  }
  function fmtIndexValue(v) {
    if (v == null || !isFinite(v)) return "—";
    return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fmtSect(v) {
    if (v == null || !isFinite(v)) return "—";
    return v >= 1 ? v.toFixed(4) : v.toPrecision(5);
  }
  function displayPrice(asset, v) {
    if (asset.category === "sect") return v == null || !isFinite(v) ? "—" : "$" + fmtSect(v);
    return asset.category === "index" ? fmtIndexValue(v) : fmtPrice(v);
  }
  function displayPricePlain(asset, v) {
    if (asset.category === "sect") return fmtSect(v);
    return asset.category === "index" ? fmtIndexValue(v) : fmtPricePlain(v);
  }
  // CSS zoom de monitores grandes (lo pone dex.html en --dxz)
  function dxZoom() {
    return parseFloat(document.documentElement.style.getPropertyValue("--dxz")) || 1;
  }
  function fmtAmt(v, max) {
    if (v == null || !isFinite(v)) return "0";
    return v.toLocaleString("en-US", { maximumFractionDigits: max == null ? 4 : max });
  }
  function fmtCompactUSD(v) {
    if (v == null || !isFinite(v)) return "—";
    if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
    if (v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
    if (v >= 1e3) return "$" + (v / 1e3).toFixed(1) + "K";
    return "$" + v.toFixed(0);
  }
  function fmtPct(v) {
    if (v == null || !isFinite(v)) return "—";
    const s = v >= 0 ? "+" : "";
    return s + v.toFixed(2) + "%";
  }
  function fmtClock(ts) {
    return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function tierOf(asset) {
    if (asset.category === "index") return 1;
    if (asset.category === "metal") return 2;
    if (asset.rank && asset.rank <= 10) return 1;
    if (asset.rank && asset.rank <= 50) return 2;
    return 3;
  }
  function colorForSymbol(sym) {
    let hash = 0;
    for (let i = 0; i < sym.length; i++) hash = (hash * 31 + sym.charCodeAt(i)) >>> 0;
    const hue = hash % 360;
    return "hsl(" + hue + ", 62%, 46%)";
  }

  // ---------------------------------------------------------------------
  // Asset icons — self-hosted inline SVG marks (no external logo CDN).
  // Each is a small hand-drawn glyph/shape in the asset's brand color;
  // anything without a def here (indices) falls back to a colored
  // initials disc.
  // ---------------------------------------------------------------------

  const ICON_DEFS = {
    "bitcoin": { bg: "#f7931a", fg: "#fff", type: "glyph", glyph: "₿" },
    "bitcoin-cash": { bg: "#0ac18e", fg: "#fff", type: "glyph", glyph: "₿" },
    "ethereum": { bg: "#627eea", type: "diamond" },
    "litecoin": { bg: "#345d9d", fg: "#fff", type: "glyph", glyph: "Ł" },
    "ripple": { bg: "#0f6fbe", fg: "#fff", type: "glyph", glyph: "X" },
    "solana": { bg: "#000000", type: "bars", ring: true },
    "sui": { bg: "#4da2ff", type: "drop" },
    "hyperliquid": { bg: "#14e0a0", fg: "#06231a", type: "glyph", glyph: "H" },
    "pax-gold": { bg: "#d9b544", fg: "#3a2c05", type: "ingot" },
    "kinesis-silver": { bg: "#b8bec4", fg: "#20242a", type: "ingot" },
  };

  const SECT_LOGO_SVG =
    '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true"><rect width="100" height="100" rx="9" ry="9" fill="#1569ff"/>' +
    '<circle cx="50" cy="50" r="27.2" fill="none" stroke="#fff" stroke-width="6.1"/></svg>';
  let iconSeq = 0;
  function iconHTML(asset, size) {
    size = size || 22;
    if (asset.id === "sect") {
      return '<span class="dx-icon-disc dx-icon-logo" style="width:' + size + "px;height:" + size + 'px">' + SECT_LOGO_SVG + "</span>";
    }
    const def = ICON_DEFS[asset.id];
    if (!def) {
      const letters = asset.ticker.replace(/[#^]/g, "").slice(0, 3);
      const color = asset.color || colorForSymbol(asset.ticker || asset.id);
      return (
        '<span class="dx-icon-disc" style="width:' + size + "px;height:" + size + "px;background:" + color + ';font-size:' + Math.round(size * (letters.length > 2 ? 0.3 : 0.38)) + 'px">' +
        letters +
        "</span>"
      );
    }
    const uid = "dxic-" + asset.id.replace(/[^a-z0-9]/gi, "") + "-" + (++iconSeq);
    let inner = "";
    if (def.type === "glyph") {
      inner = '<text x="16" y="21.5" text-anchor="middle" font-size="17" font-weight="700" font-family="inherit" fill="' + def.fg + '">' + def.glyph + "</text>";
    } else if (def.type === "diamond") {
      inner =
        '<polygon points="16,4 25,16 16,20 7,16" fill="#ffffff" fill-opacity="0.92"/>' +
        '<polygon points="16,22 25,17.5 16,29 7,17.5" fill="#ffffff" fill-opacity="0.58"/>';
    } else if (def.type === "bars") {
      inner =
        '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#9945ff"/><stop offset="1" stop-color="#14f195"/></linearGradient></defs>' +
        '<rect x="6" y="8.6" width="20" height="3.6" rx="1.8" fill="url(#' + uid + ')"/>' +
        '<rect x="6" y="14.2" width="20" height="3.6" rx="1.8" fill="url(#' + uid + ')" opacity="0.72"/>' +
        '<rect x="6" y="19.8" width="20" height="3.6" rx="1.8" fill="url(#' + uid + ')"/>';
    } else if (def.type === "drop") {
      inner = '<path d="M16 6c4.5 5 7 8.7 7 12a7 7 0 1 1-14 0c0-3.3 2.5-7 7-12z" fill="#ffffff"/>';
    } else if (def.type === "ingot") {
      inner =
        '<rect x="9" y="9" width="14" height="3" rx="1" fill="' + def.fg + '"/>' +
        '<path d="M9 12h14l3 8H6z" fill="' + def.fg + '" fill-opacity="0.88"/>';
    }
    return (
      '<span class="dx-icon-disc dx-icon-svg' + (def.ring ? " dx-icon-ring" : "") + '" style="width:' + size + "px;height:" + size + 'px;background:' + def.bg + '">' +
      '<svg viewBox="0 0 32 32" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' + inner + "</svg>" +
      "</span>"
    );
  }

  // ---------------------------------------------------------------------
  // Candle history — seeded from the real fetched price, then advanced
  // only by real poll ticks (no fabricated price movement). Order book
  // and trade tape (below) supply the moment-to-moment "alive" feel.
  // ---------------------------------------------------------------------

  function seedCandles(asset) {
    Object.keys(TIMEFRAMES).forEach((tf) => {
      const step = TIMEFRAMES[tf];
      const n = 90;
      const vol = tierOf(asset) === 1 ? 0.002 : tierOf(asset) === 2 ? 0.004 : 0.007;
      let price = asset.price;
      // walk backward from the real current price to synthesize a
      // plausible history trail (no historical OHLC API available for
      // free); the *current*, most recent candle always ends on the
      // real price fetched from the API.
      const now = Math.floor(Date.now() / step) * step;
      const backCandles = [];
      let p = price;
      for (let i = 0; i <= n; i++) {
        const drift = 1 + rand(-vol, vol);
        const openT = now - i * step;
        const close = p;
        const open = i === n ? close : close / drift;
        const high = Math.max(open, close) * (1 + rand(0, vol * 0.6));
        const low = Math.min(open, close) * (1 - rand(0, vol * 0.6));
        const volume = close * rand(4, 40) * (tierOf(asset) === 1 ? 8 : tierOf(asset) === 2 ? 2 : 1);
        backCandles.unshift({ t: openT, o: open, h: high, l: low, c: close, v: volume });
        p = open;
      }
      asset.candles[tf] = backCandles;
    });
  }

  // Re-seeds an asset's candle history from its *real* price exactly once
  // -- the first time a real price (poll, fallback snapshot, or Binance
  // WS tick) lands for it -- so the synthetic 90-candle backfill built
  // from the rough COIN_DEFS/METAL_DEFS placeholder never has to absorb a
  // large one-time jump as a single outlier candle. Returns true if it
  // reseeded (caller should skip pushTick for this same update).
  function seedCandlesOnce(asset) {
    if (asset.candlesReal) return false;
    seedCandles(asset);
    asset.candlesReal = true;
    return true;
  }

  function pushTick(asset, price) {
    const now = Date.now();
    Object.keys(TIMEFRAMES).forEach((tf) => {
      const step = TIMEFRAMES[tf];
      const bucket = Math.floor(now / step) * step;
      const list = asset.candles[tf];
      if (!list) return;
      const last = list[list.length - 1];
      if (last && last.t === bucket) {
        last.c = price;
        if (price > last.h) last.h = price;
        if (price < last.l) last.l = price;
      } else if (last) {
        list.push({ t: bucket, o: last.c, h: price, l: price, c: price, v: price * rand(1, 4) });
        if (list.length > 140) list.shift();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Live data — CoinGecko (crypto + tokenized gold/silver) and Yahoo
  // Finance (indices). Both are public, keyless, CORS-enabled endpoints.
  // A failed poll simply keeps the last known real values (same
  // resilience pattern as the main site's supply/marketcap table).
  // ---------------------------------------------------------------------

  const COIN_DEF_BY_ID = {};
  COIN_DEFS.forEach((c) => { COIN_DEF_BY_ID[c[0]] = c; });
  METAL_DEFS.forEach((m) => { COIN_DEF_BY_ID[m[0]] = m; });

  // Fills ASSETS with a starting price for every coin/metal right away, so
  // the market list is never empty on load — the live poll then overwrites
  // these with real numbers within a couple seconds.
  function seedAssetsFromDefs() {
    COIN_DEFS.concat(METAL_DEFS).forEach((def) => {
      const id = def[0];
      const isMetal = !!METAL_IDS[id];
      const base = def[isMetal ? 3 : 4];
      if (BY_ID[id] || typeof base !== "number") return;
      const asset = {
        id: id,
        ticker: def[1],
        name: def[2],
        category: isMetal ? "metal" : "crypto",
        color: colorForSymbol(def[1]),
        chain: isMetal ? def[2] + " (tokenized)" : def[2] + " Network",
        rank: isMetal ? 9999 : def[3],
        price: base,
        open24h: base,
        high24h: base,
        low24h: base,
        change24h: 0,
        vol24h: 0,
        candles: {},
      };
      if (isMetal) asset.subLabel = def[2] + " (" + def[1] + ")";
      asset.tier = tierOf(asset);
      BY_ID[id] = asset;
      ASSETS.push(asset);
    });
    ASSETS.sort((a, b) => (a.rank || 9999) - (b.rank || 9999));
    ASSETS.forEach(seedCandles);
  }

  // Row shape here matches CoinGecko's /simple/price response for one id:
  // { usd, usd_market_cap, usd_24h_vol, usd_24h_change }. That endpoint
  // doesn't return an intraday high/low, so it's derived from the real
  // price + real 24h change (open = price / (1 + change%), high/low
  // bracket that range with a small buffer) rather than fabricated.
  function upsertAssetFromSimplePrice(id, row) {
    const def = COIN_DEF_BY_ID[id];
    if (!def) return null;
    const isMetal = !!METAL_IDS[id];
    let asset = BY_ID[id];
    if (!asset) {
      asset = {
        id: id,
        ticker: def[1],
        name: isMetal ? def[2] : def[2],
        category: isMetal ? "metal" : "crypto",
        color: colorForSymbol(def[1]),
        chain: isMetal ? def[2] + " (tokenized)" : def[2] + " Network",
        rank: isMetal ? 9999 : def[3],
        candles: {},
      };
      BY_ID[id] = asset;
      ASSETS.push(asset);
      if (isMetal) asset.subLabel = def[2] + " (" + def[1] + ")";
    }
    const price = row.usd;
    if (typeof price !== "number") return asset;
    asset.price = price;
    const change = typeof row.usd_24h_change === "number" ? row.usd_24h_change : asset.change24h;
    asset.change24h = change;
    const openPrice = typeof change === "number" ? price / (1 + change / 100) : price;
    asset.high24h = Math.max(price, openPrice) * 1.006;
    asset.low24h = Math.min(price, openPrice) * 0.994;
    asset.vol24h = typeof row.usd_24h_vol === "number" ? row.usd_24h_vol : asset.vol24h;
    asset.marketCap = row.usd_market_cap;
    asset.tier = tierOf(asset);
    return asset;
  }

  function upsertIndex(def, meta) {
    let asset = BY_ID[def.symbol];
    if (!asset) {
      asset = {
        id: def.symbol, ticker: def.ticker, name: def.name, category: "index",
        color: colorForSymbol(def.ticker), chain: "NYSE / Nasdaq", rank: 0, candles: {},
      };
      BY_ID[def.symbol] = asset;
      ASSETS.push(asset);
    }
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose;
    if (typeof price === "number") asset.price = price;
    if (typeof price === "number" && typeof prevClose === "number" && prevClose) {
      asset.change24h = ((price - prevClose) / prevClose) * 100;
    }
    if (typeof meta.regularMarketDayHigh === "number") asset.high24h = meta.regularMarketDayHigh;
    if (typeof meta.regularMarketDayLow === "number") asset.low24h = meta.regularMarketDayLow;
    if (typeof meta.regularMarketVolume === "number") asset.vol24h = meta.regularMarketVolume;
    asset.tier = 1;
    return asset;
  }

  function fetchJson(url) {
    return fetch(url, { cache: "no-store" }).then((res) => {
      if (!res.ok) {
        return res
          .text()
          .catch(() => "")
          .then((body) => {
            throw new Error("HTTP " + res.status + (body ? ": " + body.slice(0, 140) : ""));
          });
      }
      return res.json();
    });
  }

  // Some browsers/networks block a direct cross-origin fetch() to these
  // price APIs (the request never gets a response at all — CORS/security
  // policy, not a server error), even though the same URL loads fine when
  // typed directly into the address bar. If the direct attempt fails,
  // retry the exact same request through a public CORS-relay so the
  // response can actually reach the page — same live data, same 20s
  // cadence, just re-wrapped so the browser will hand it over.
  const CORS_RELAYS = [
    (url) => "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
    (url) => "https://corsproxy.io/?url=" + encodeURIComponent(url),
  ];

  function fetchJsonResilient(url) {
    function attempt(i) {
      const target = i === 0 ? url : CORS_RELAYS[i - 1](url);
      return fetchJson(target).catch((err) => {
        if (i < CORS_RELAYS.length) return attempt(i + 1);
        throw err;
      });
    }
    return attempt(0);
  }

  // idPriceMap: { [coinId]: { usd, usd_24h_change, usd_24h_vol, usd_market_cap } }
  function applyPriceMap(idPriceMap) {
    const ids = Object.keys(idPriceMap || {});
    if (!ids.length) return false;
    const touched = [];
    ids.forEach((id) => {
      const asset = upsertAssetFromSimplePrice(id, idPriceMap[id]);
      if (asset) touched.push(asset);
    });
    if (!touched.length) return false;
    touched.forEach((a) => {
      if (!seedCandlesOnce(a)) pushTick(a, a.price);
    });
    return true;
  }

  function fetchBinanceFallback() {
    const symbols = BINANCE_FALLBACK.map((r) => r[0]);
    const url = "https://api.binance.com/api/v3/ticker/24hr?symbols=" + encodeURIComponent(JSON.stringify(symbols));
    return fetchJsonResilient(url).then((list) => {
      if (!Array.isArray(list)) throw new Error("binance_bad_response");
      const bySymbol = {};
      list.forEach((row) => { bySymbol[row.symbol] = row; });
      const map = {};
      BINANCE_FALLBACK.forEach(([bsym, id]) => {
        const row = bySymbol[bsym];
        if (!row) return;
        map[id] = {
          usd: parseFloat(row.lastPrice),
          usd_24h_change: parseFloat(row.priceChangePercent),
          usd_24h_vol: parseFloat(row.quoteVolume),
        };
      });
      return map;
    });
  }

  let lastFetchErrorText = "";

  // A GitHub Action (.github/workflows/update-dex-prices.yml) fetches real
  // prices server-side every few minutes and commits them to this file, so
  // the browser can read them from our own site — no cross-origin request
  // at all, which sidesteps whatever blocks the direct/proxied calls above
  // for some visitors' browsers or networks.
  function fetchLocalSnapshot() {
    return fetchJson("dex-prices.json?t=" + Date.now());
  }

  // CoinGecko's /simple/price is the same proven, keyless endpoint the
  // main site's live Supply table already relies on, with the same small
  // id-list shape. If the direct/proxied call and the Binance fallback both
  // fail outright, fall back to our own periodically-updated snapshot so
  // the DEX never sits on stale numbers because of one unreachable
  // provider.
  function pollCrypto() {
    return fetchJsonResilient(SIMPLE_PRICE_URL)
      .then((idPriceMap) => {
        if (!applyPriceMap(idPriceMap)) throw new Error("empty_response");
        lastFetchErrorText = "";
        return true;
      })
      .catch((err) => {
        const errText = String(err.message || err);
        console.warn("[dex] CoinGecko /simple/price failed (" + errText + "), trying Binance fallback");
        return fetchBinanceFallback()
          .then((fallbackMap) => {
            if (!applyPriceMap(fallbackMap)) throw new Error("binance_empty_response");
            lastFetchErrorText = "";
            return true;
          })
          .catch((binErr) => {
            console.warn("[dex] Binance fallback failed (" + String(binErr.message || binErr) + "), trying local snapshot");
            return fetchLocalSnapshot()
              .then((snap) => {
                const ok = applyPriceMap((snap && snap.coins) || {});
                lastFetchErrorText = ok ? "" : errText;
                return ok;
              })
              .catch(() => {
                lastFetchErrorText = errText + " / binance: " + String(binErr.message || binErr);
                return false;
              });
          });
      });
  }

  function fetchYahoo(symbol) {
    let attempt = 0;
    function tryHost() {
      const host = YAHOO_HOSTS[attempt];
      return fetch(host + "/v8/finance/chart/" + encodeURIComponent(symbol) + "?range=1d&interval=5m", { cache: "no-store" })
        .then((res) => {
          if (!res.ok) throw new Error("http_" + res.status);
          return res.json();
        })
        .catch((err) => {
          attempt += 1;
          if (attempt < YAHOO_HOSTS.length) return tryHost();
          throw err;
        });
    }
    return tryHost();
  }

  function pollIndices() {
    const isFirstLoad = !ASSETS.some((a) => a.category === "index");
    return fetchLocalSnapshot()
      .catch(() => null)
      .then((snap) => {
        const snapIndices = (snap && snap.indices) || {};
        return Promise.all(
          INDEX_DEFS.map((def) =>
            fetchYahoo(def.symbol)
              .then((data) => {
                const result = data && data.chart && data.chart.result && data.chart.result[0];
                const meta = result && result.meta;
                if (!meta || typeof meta.regularMarketPrice !== "number") throw new Error("bad_yahoo_response");
                return upsertIndex(def, meta);
              })
              .catch(() => {
                const meta = snapIndices[def.symbol];
                if (!meta || typeof meta.regularMarketPrice !== "number") return null;
                return upsertIndex(def, meta);
              })
          )
        );
      })
      .then((results) => {
        const touched = results.filter(Boolean);
        if (!touched.length) return false;
        if (isFirstLoad) touched.forEach(seedCandles);
        else touched.forEach((a) => pushTick(a, a.price));
        return true;
      });
  }

  let cryptoFailures = 0;
  let marketLiveEl = null;
  function setMarketLive(isLive) {
    if (!marketLiveEl) marketLiveEl = document.getElementById("dexMarketLive");
    if (!marketLiveEl) return;
    marketLiveEl.classList.toggle("is-stale", !isLive);
    const labelEl = marketLiveEl.querySelector("span:last-child");
    if (labelEl) {
      labelEl.textContent = isLive
        ? t("dex.trade.markets.liveNote", "LIVE · updates ~20s")
        : t("dex.trade.markets.staleNote", "Live feed unreachable — showing last known prices");
    }
  }

  function applyWsTicker(id, data) {
    const asset = BY_ID[id];
    if (!asset) return;
    const price = parseFloat(data.c);
    if (!isFinite(price)) return;
    asset.price = price;
    const change = parseFloat(data.P);
    if (isFinite(change)) asset.change24h = change;
    const high = parseFloat(data.h);
    const low = parseFloat(data.l);
    if (isFinite(high)) asset.high24h = high;
    if (isFinite(low)) asset.low24h = low;
    const quoteVol = parseFloat(data.q);
    if (isFinite(quoteVol)) asset.vol24h = quoteVol;
    asset.tier = tierOf(asset);
    if (!seedCandlesOnce(asset)) pushTick(asset, price);
  }

  let binanceWs = null;
  let wsConnected = false;
  let wsReconnectDelay = 2000;
  let wsReconnectTimer = null;
  let wsRenderPending = false;

  function scheduleWsRender() {
    if (wsRenderPending) return;
    wsRenderPending = true;
    requestAnimationFrame(() => {
      wsRenderPending = false;
      onDataChanged();
    });
  }

  function scheduleWsReconnect() {
    if (wsReconnectTimer) return;
    wsReconnectTimer = setTimeout(() => {
      wsReconnectTimer = null;
      connectBinanceWs();
    }, wsReconnectDelay);
    wsReconnectDelay = Math.min(wsReconnectDelay * 2, 30000);
  }

  // Streams every tick for the pairs Binance lists, the instant a trade
  // happens — no polling interval involved. If this socket can't connect
  // or drops (retried with backoff), the 20s REST poll below keeps the
  // market covered so it's never actually blank.
  function connectBinanceWs() {
    if (typeof WebSocket === "undefined") return;
    const streams = BINANCE_WS_SYMBOLS.map(([s]) => s + "@ticker").join("/");
    let socket;
    try {
      socket = new WebSocket(BINANCE_WS_URL + streams);
    } catch (e) {
      scheduleWsReconnect();
      return;
    }
    binanceWs = socket;
    socket.onopen = () => {
      wsReconnectDelay = 2000;
      wsConnected = true;
      cryptoFailures = 0;
      setMarketLive(true);
    };
    socket.onmessage = (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch (e) {
        return;
      }
      const id = msg && msg.stream && WS_ID_BY_STREAM[msg.stream];
      if (!id || !msg.data) return;
      applyWsTicker(id, msg.data);
      scheduleWsRender();
    };
    socket.onclose = () => {
      binanceWs = null;
      wsConnected = false;
      if (cryptoFailures > 0) setMarketLive(false);
      scheduleWsReconnect();
    };
  }

  // The market is "live" if either channel is up — the streaming socket
  // (instant ticks) or the REST poll (20s). Only mark it stale when both
  // have failed, so a slow/blocked REST call doesn't flip the badge while
  // the socket is still streaming real prices just fine.
  function tick() {
    pollCrypto()
      .then((ok) => {
        cryptoFailures = ok ? 0 : cryptoFailures + 1;
        setMarketLive(ok || wsConnected);
        onFirstReadyOrTick();
      })
      .catch((err) => {
        cryptoFailures += 1;
        console.warn("[dex] Price feed unreachable (CoinGecko + Binance fallback both failed):", err);
        setMarketLive(wsConnected);
        onFirstReadyOrTick();
      });
  }

  function onFirstReadyOrTick() {
    if (!dataReady && ASSETS.length > 0) {
      dataReady = true;
      if (activeSymbol !== SECT_ID && !BY_ID[activeSymbol] && ASSETS[0]) activeSymbol = ASSETS[0].id;
      hideLoading();
    }
    onDataChanged();
  }

  // ---------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------

  function hideLoading() {
    const empty = document.getElementById("dexMarketTable");
    if (empty) empty.classList.remove("is-loading");
  }

  // ---------------------------------------------------------------------
  // Ticker marquee
  // ---------------------------------------------------------------------

  const tickerEl = document.getElementById("dexTicker");
  const tickerDupEl = document.getElementById("dexTickerDup");

  function tickerRowHTML() {
    const sectItem = SECT.price == null ? "" :
      '<span class="dx-ticker-item dx-ticker-item--sect dx-ticker-item--' + ((SECT.change24h || 0) >= 0 ? "up" : "down") + '" data-symbol="' + SECT_ID + '">' +
      '<span class="dx-ticker-sym">SECT/USDT</span>' +
      '<span class="mono">$' + fmtSect(SECT.price) + "</span>" +
      '<span class="dx-ticker-chg mono">' + fmtPct(SECT.change24h) + "</span>" +
      "</span>";
    return sectItem + ASSETS.filter((a) => a.price != null).map((a) => {
      const dir = (a.change24h || 0) >= 0 ? "up" : "down";
      return (
        '<span class="dx-ticker-item dx-ticker-item--' + dir + '" data-symbol="' + a.id + '">' +
        '<span class="dx-ticker-sym">' + a.ticker + "</span>" +
        '<span class="mono">' + displayPrice(a, a.price) + "</span>" +
        '<span class="dx-ticker-chg mono">' + fmtPct(a.change24h) + "</span>" +
        "</span>"
      );
    }).join("");
  }
  function renderTicker() {
    if (!tickerEl) return;
    const html = tickerRowHTML();
    tickerEl.innerHTML = html;
    if (tickerDupEl) tickerDupEl.innerHTML = html;
    root.querySelectorAll(".dx-ticker-item").forEach((el) => {
      el.addEventListener("click", () => setSymbol(el.dataset.symbol));
    });
    const items = ASSETS.filter((a) => a.price != null).length;
    const duration = Math.max(20, items * 1.6);
    [tickerEl, tickerDupEl].forEach((el) => { if (el) el.style.animationDuration = duration + "s"; });
  }

  // ---------------------------------------------------------------------
  // Chart (canvas candlesticks, self-hosted, no external lib)
  // ---------------------------------------------------------------------

  function createChartController(canvasId, getAsset, getTf) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas ? canvas.getContext("2d") : null;
    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * dxZoom();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw() {
      if (!ctx) return;
      const asset = getAsset();
      const tf = getTf();
      const candles = asset && asset.candles[tf];
      renderCandles(ctx, canvas, asset, candles);
    }
    return { canvas, ctx, resize, draw };
  }

  const tradeChart = createChartController("dexChart", () => BY_ID[activeSymbol], () => activeTf);
  function resizeChart() { tradeChart.resize(); }
  function drawChart() {
    if (activeSymbol === SECT_ID) drawSectChart();
    else tradeChart.draw();
  }

  let perpSymbol = "bitcoin", perpTf = "1m";
  let futSymbol = "bitcoin", futTf = "1m";
  const perpChart = createChartController("dexPerpChart", () => BY_ID[perpSymbol], () => perpTf);
  const futChart = createChartController("dexFutChart", () => BY_ID[futSymbol], () => futTf);

  const UP_COLOR = "#3ddc97", DOWN_COLOR = "#ff6e7c";
  function renderCandles(chartCtx, chartCanvas, asset, candles, opts) {
    if (!chartCtx) return;
    opts = opts || {};
    const w = chartCanvas.clientWidth;
    const h = chartCanvas.clientHeight;
    if (!asset || !w || !h || !candles || !candles.length) return;
    chartCtx.clearRect(0, 0, w, h);

    // SECT/USDT no tiene volumen por vela: esa franja lleva las fechas
    const volH = opts.times ? 22 : Math.round(h * 0.16);
    const chartH = h - volH - 4;
    const visible = opts.all ? candles : candles.slice(-72);
    let min = Infinity, max = -Infinity, maxVol = 0;
    visible.forEach((c) => {
      if (c.l < min) min = c.l;
      if (c.h > max) max = c.h;
      if (c.v > maxVol) maxVol = c.v;
    });
    if (min === max) { min *= 0.995; max *= 1.005; }
    const pad = (max - min) * 0.08;
    min -= pad; max += pad;

    const n = visible.length;
    const slot = w / n;
    const bodyW = Math.max(2, slot * 0.58);

    function y(price) {
      return chartH - ((price - min) / (max - min)) * chartH;
    }

    chartCtx.strokeStyle = "rgba(255,255,255,0.06)";
    chartCtx.lineWidth = 1;
    chartCtx.font = "10px " + getComputedStyle(document.body).getPropertyValue("--font-mono");
    chartCtx.fillStyle = "rgba(255,255,255,0.32)";
    for (let i = 0; i <= 4; i++) {
      const py = (chartH / 4) * i;
      chartCtx.beginPath();
      chartCtx.moveTo(0, py + 0.5);
      chartCtx.lineTo(w, py + 0.5);
      chartCtx.stroke();
      const priceAtLine = max - (i / 4) * (max - min);
      chartCtx.fillText(displayPricePlain(asset, priceAtLine), 6, py + 12);
    }

    visible.forEach((c, i) => {
      const cx = i * slot + slot / 2;
      const up = c.c >= c.o;
      chartCtx.strokeStyle = up ? UP_COLOR : DOWN_COLOR;
      chartCtx.fillStyle = up ? UP_COLOR : DOWN_COLOR;
      chartCtx.lineWidth = 1;
      chartCtx.beginPath();
      chartCtx.moveTo(cx, y(c.h));
      chartCtx.lineTo(cx, y(c.l));
      chartCtx.stroke();
      const yo = y(c.o), yc = y(c.c);
      const top = Math.min(yo, yc);
      const bh = Math.max(1.5, Math.abs(yc - yo));
      chartCtx.fillRect(cx - bodyW / 2, top, bodyW, bh);

      if (!opts.times) {
        const vh = (c.v / (maxVol || 1)) * (volH - 2);
        chartCtx.globalAlpha = 0.35;
        chartCtx.fillRect(cx - bodyW / 2, h - vh, bodyW, vh);
        chartCtx.globalAlpha = 1;
      }
    });

    if (opts.times && n > 1) {
      const span = visible[n - 1].t - visible[0].t;
      const daily = span > 2 * 86400000;
      chartCtx.font = "10px " + getComputedStyle(document.body).getPropertyValue("--font-mono");
      chartCtx.fillStyle = "rgba(255,255,255,0.38)";
      chartCtx.strokeStyle = "rgba(255,255,255,0.10)";
      chartCtx.beginPath();
      chartCtx.moveTo(0, chartH + 0.5);
      chartCtx.lineTo(w, chartH + 0.5);
      chartCtx.stroke();
      const marks = Math.max(2, Math.min(6, Math.floor(w / 130)));
      for (let k = 1; k < marks; k++) {
        const i = Math.round((k / marks) * (n - 1));
        const d = new Date(visible[i].t);
        const label = daily
          ? d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase()
          : String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
        const cx = i * slot + slot / 2;
        const tw = chartCtx.measureText(label).width;
        chartCtx.fillText(label, Math.min(w - tw - 2, Math.max(2, cx - tw / 2)), h - 6);
      }
    }

    const last = visible[visible.length - 1];
    const py = y(last.c);
    chartCtx.setLineDash([4, 4]);
    chartCtx.strokeStyle = last.c >= last.o ? "rgba(61,220,151,0.7)" : "rgba(255,110,124,0.7)";
    chartCtx.beginPath();
    chartCtx.moveTo(0, py + 0.5);
    chartCtx.lineTo(w, py + 0.5);
    chartCtx.stroke();
    chartCtx.setLineDash([]);
    const label = displayPricePlain(asset, last.c);
    chartCtx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--font-mono");
    const tw = chartCtx.measureText(label).width + 10;
    chartCtx.fillStyle = last.c >= last.o ? UP_COLOR : DOWN_COLOR;
    chartCtx.fillRect(w - tw, py - 8, tw, 16);
    chartCtx.fillStyle = "#05070c";
    chartCtx.fillText(label, w - tw + 5, py + 4);
  }

  // ---------------------------------------------------------------------
  // Order book (synthetic depth around the real live mid price) — this
  // layer, the trades tape and P2P offers are the acknowledged simulated
  // parts of the DEX; the mid price they're built around is always real.
  // ---------------------------------------------------------------------

  const bookAsksEl = document.getElementById("dexBookAsks");
  const bookBidsEl = document.getElementById("dexBookBids");
  const bookSpreadEl = document.getElementById("dexBookSpread");

  function buildBookSide(asset, mid, isAsk) {
    const levels = [];
    const rows = 12;
    const tier = tierOf(asset);
    const tickPct = tier === 1 ? 0.00012 : tier === 2 ? 0.0006 : 0.0018;
    let cum = 0;
    for (let i = 1; i <= rows; i++) {
      const drift = 1 + tickPct * i * (isAsk ? 1 : -1) + rand(-tickPct * 0.2, tickPct * 0.2);
      const price = mid * drift;
      const size = rand(0.02, tier === 1 ? 1.2 : tier === 2 ? 40 : 800) * (1 + rand(0, 1.4));
      cum += size;
      levels.push({ price, size, cum });
    }
    return isAsk ? levels.reverse() : levels;
  }

  let bookState = { asks: [], bids: [] };
  function regenerateBook() {
    const asset = BY_ID[activeSymbol];
    if (!asset || asset.price == null) return;
    bookState.asks = buildBookSide(asset, asset.price, true);
    bookState.bids = buildBookSide(asset, asset.price, false);
  }
  function renderBook() {
    const asset = BY_ID[activeSymbol];
    if (!asset) return;
    if (!bookState.asks.length) regenerateBook();
    if (!bookState.asks.length) return;
    const tier = tierOf(asset);
    const maxCum = Math.max(
      bookState.asks[bookState.asks.length - 1] ? bookState.asks[bookState.asks.length - 1].cum : 1,
      bookState.bids[bookState.bids.length - 1] ? bookState.bids[bookState.bids.length - 1].cum : 1
    );
    function rowHTML(level, isAsk) {
      const pct = Math.min(100, (level.cum / maxCum) * 100);
      return (
        '<div class="dx-book-row dx-book-row--' + (isAsk ? "ask" : "bid") + '">' +
        '<span class="dx-book-depth" style="width:' + pct + '%"></span>' +
        '<span class="dx-book-price mono">' + displayPricePlain(asset, level.price) + "</span>" +
        '<span class="dx-book-size mono">' + fmtAmt(level.size, tier === 1 ? 3 : 2) + "</span>" +
        '<span class="dx-book-total mono">' + fmtAmt(level.cum, tier === 1 ? 2 : 1) + "</span>" +
        "</div>"
      );
    }
    if (bookAsksEl) bookAsksEl.innerHTML = bookState.asks.map((l) => rowHTML(l, true)).join("");
    if (bookBidsEl) bookBidsEl.innerHTML = bookState.bids.map((l) => rowHTML(l, false)).join("");
    const midEl = document.querySelector("#dexBookMid .dx-book-mid-price");
    if (midEl) {
      midEl.textContent = displayPrice(asset, asset.price);
      midEl.className = "dx-book-mid-price mono " + ((asset.change24h || 0) >= 0 ? "is-up" : "is-down");
    }
    if (bookSpreadEl) {
      const bestAsk = bookState.asks[bookState.asks.length - 1];
      const bestBid = bookState.bids[0];
      if (bestAsk && bestBid) {
        const spread = bestAsk.price - bestBid.price;
        const bp = (spread / asset.price) * 10000;
        bookSpreadEl.textContent = t("dex.trade.orderbook.spread", "spread") + " " + displayPricePlain(asset, spread) + " · " + bp.toFixed(1) + "bp";
      }
    }
  }

  // ---------------------------------------------------------------------
  // Recent trades tape (simulated fills around the real price)
  // ---------------------------------------------------------------------

  const tradesListEl = document.getElementById("dexTradesList");
  let tradeTape = [];
  function pushSimTrade() {
    const asset = BY_ID[activeSymbol];
    if (!asset || asset.price == null) return;
    const tier = tierOf(asset);
    const side = Math.random() > 0.5 ? "buy" : "sell";
    const drift = 1 + rand(-0.0006, 0.0006);
    const price = asset.price * drift;
    const size = rand(0.01, tier === 1 ? 0.6 : tier === 2 ? 20 : 300);
    tradeTape.unshift({ price, size, side, ts: Date.now(), assetId: asset.id });
    if (tradeTape.length > 40) tradeTape.length = 40;
    renderTrades();
  }
  function seedTape(asset) {
    if (!asset || asset.price == null) return;
    if (tradeTape.filter((tr) => tr.assetId === asset.id).length >= 8) return;
    const tier = tierOf(asset);
    let ts = Date.now();
    for (let i = 0; i < 18; i++) {
      ts -= rand(1500, 6000);
      tradeTape.push({
        price: asset.price * (1 + rand(-0.0006, 0.0006)),
        size: rand(0.01, tier === 1 ? 0.6 : tier === 2 ? 20 : 300),
        side: Math.random() > 0.5 ? "buy" : "sell",
        ts: ts,
        assetId: asset.id,
      });
    }
    tradeTape.sort((a, b) => b.ts - a.ts);
    if (tradeTape.length > 60) tradeTape.length = 60;
  }
  function renderTrades() {
    if (!tradesListEl) return;
    const asset = BY_ID[activeSymbol];
    if (!asset) return;
    const tier = tierOf(asset);
    tradesListEl.innerHTML = tradeTape
      .filter((tr) => tr.assetId === asset.id)
      .map(
        (tr) =>
          '<div class="dx-trade-row dx-trade-row--' + tr.side + '">' +
          '<span class="dx-book-price mono">' + displayPricePlain(asset, tr.price) + "</span>" +
          '<span class="dx-book-size mono">' + fmtAmt(tr.size, tier === 1 ? 3 : 2) + "</span>" +
          '<span class="dx-trade-time mono">' + fmtClock(tr.ts) + "</span>" +
          "</div>"
      )
      .join("");
  }

  // ---------------------------------------------------------------------
  // Market list (all assets, searchable + filterable by category)
  // ---------------------------------------------------------------------

  const marketTableEl = document.getElementById("dexMarketTable");
  function filteredAssets() {
    const q = searchQuery.trim().toLowerCase();
    return ASSETS.filter((a) => {
      if (a.price == null) return false;
      if (activeCategory !== "all" && a.category !== activeCategory) return false;
      if (!q) return true;
      return (a.ticker || "").toLowerCase().indexOf(q) !== -1 || (a.name || "").toLowerCase().indexOf(q) !== -1;
    });
  }
  function sectRowHTML() {
    const up = (SECT.change24h || 0) >= 0;
    return (
      '<button class="dx-market-row dx-market-row--sect' + (activeSymbol === SECT_ID ? " is-active" : "") + '" type="button" data-symbol="' + SECT_ID + '">' +
      '<span class="dx-market-row-name">' + iconHTML(SECT, 24) +
      '<span class="dx-market-row-text"><span class="dx-market-row-ticker">SECT/USDT<span class="dx-sect-badge">' + t("dex.sect.tag", "Real market") + "</span></span>" +
      '<span class="dx-market-row-sub">Sectora · Uniswap V3</span></span></span>' +
      '<span class="mono">' + displayPrice(SECT, SECT.price) + "</span>" +
      '<span class="mono ' + (SECT.change24h == null ? "" : up ? "is-up" : "is-down") + '">' + fmtPct(SECT.change24h) + "</span>" +
      '<span class="mono dx-market-row-vol">' + fmtCompactUSD(SECT.vol24h) + "</span>" +
      "</button>"
    );
  }
  function renderMarketTable() {
    if (!marketTableEl) return;
    const list = filteredAssets();
    const showSect = (activeCategory === "all" || activeCategory === "crypto") && sectMatches(searchQuery);
    if (!list.length && !showSect) {
      marketTableEl.innerHTML = '<div class="dx-market-empty">' +
        (dataReady ? t("dex.trade.markets.empty", "No markets match your search.") : t("dex.trade.markets.loading", "Loading live prices…")) +
        "</div>";
      return;
    }
    marketTableEl.innerHTML = (showSect ? sectRowHTML() : "") + list.map((a) => {
      const up = (a.change24h || 0) >= 0;
      const sub = a.subLabel || (a.category === "index" ? a.name : null);
      return (
        '<button class="dx-market-row' + (a.id === activeSymbol ? " is-active" : "") + '" type="button" data-symbol="' + a.id + '">' +
        '<span class="dx-market-row-name">' + iconHTML(a, 24) +
        '<span class="dx-market-row-text"><span class="dx-market-row-ticker">' + a.ticker + (a.category === "index" ? "" : "/" + QUOTE) + "</span>" +
        (sub ? '<span class="dx-market-row-sub">' + sub + "</span>" : "") + "</span></span>" +
        '<span class="mono">' + displayPrice(a, a.price) + "</span>" +
        '<span class="mono ' + (up ? "is-up" : "is-down") + '">' + fmtPct(a.change24h) + "</span>" +
        '<span class="mono dx-market-row-vol">' + fmtCompactUSD(a.vol24h) + "</span>" +
        "</button>"
      );
    }).join("");
    marketTableEl.querySelectorAll("[data-symbol]").forEach((btn) => {
      btn.addEventListener("click", () => setSymbol(btn.dataset.symbol));
    });
  }

  const catTabsEl = document.getElementById("dexCatTabs");
  if (catTabsEl) {
    catTabsEl.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.cat;
        catTabsEl.querySelectorAll("[data-cat]").forEach((b) => b.classList.toggle("is-active", b === btn));
        renderMarketTable();
      });
    });
  }
  const marketSearchEl = document.getElementById("dexMarketSearch");
  if (marketSearchEl) {
    marketSearchEl.addEventListener("input", () => {
      searchQuery = marketSearchEl.value;
      renderMarketTable();
    });
  }

  // ---------------------------------------------------------------------
  // Symbol header + trade form wiring
  // ---------------------------------------------------------------------

  const symbolIconEl = document.getElementById("dexSymbolIcon");
  const symbolPairEl = document.getElementById("dexSymbolPair");
  const symbolFullEl = document.getElementById("dexSymbolFull");
  const statMarkEl = document.getElementById("dexStatMark");
  const statChangeEl = document.getElementById("dexStatChange");
  const statHighEl = document.getElementById("dexStatHigh");
  const statLowEl = document.getElementById("dexStatLow");
  const statVolEl = document.getElementById("dexStatVol");
  const amountSuffixEl = document.getElementById("dexAmountSuffix");
  const priceInputEl = document.getElementById("dexPriceInput");

  function renderSymbolHeader() {
    if (activeSymbol === SECT_ID) { renderSectHeader(); return; }
    const a = BY_ID[activeSymbol];
    if (!a || a.price == null) return;
    if (symbolIconEl) symbolIconEl.innerHTML = iconHTML(a, 34);
    if (symbolPairEl) symbolPairEl.textContent = a.category === "index" ? a.ticker : a.ticker + "-" + QUOTE;
    if (symbolFullEl) symbolFullEl.textContent = a.subLabel || a.name;
    if (statMarkEl) statMarkEl.textContent = displayPrice(a, a.price);
    if (statChangeEl) {
      statChangeEl.textContent = fmtPct(a.change24h);
      statChangeEl.className = "dx-stat-value mono " + ((a.change24h || 0) >= 0 ? "is-up" : "is-down");
    }
    if (statHighEl) statHighEl.textContent = displayPrice(a, a.high24h);
    if (statLowEl) statLowEl.textContent = displayPrice(a, a.low24h);
    if (statVolEl) statVolEl.textContent = fmtCompactUSD(a.vol24h);
    if (amountSuffixEl) amountSuffixEl.textContent = a.ticker;
    if (priceInputEl && !priceInputEl.dataset.userEdited) priceInputEl.value = displayPricePlain(a, a.price).replace(/,/g, "");
    updateFormTotals();
    document.title = a.ticker + (a.category === "index" ? "" : "/" + QUOTE) + " " + displayPrice(a, a.price) + " · Sectora DEX";
  }

  function setSymbol(id) {
    if ((!BY_ID[id] && id !== SECT_ID) || id === activeSymbol) return;
    activeSymbol = id;
    applySectMode();
    if (priceInputEl) delete priceInputEl.dataset.userEdited;
    bookState = { asks: [], bids: [] };
    if (id !== SECT_ID) seedTape(BY_ID[id]);
    renderSymbolHeader();
    renderMarketTable();
    regenerateBook();
    renderBook();
    renderTrades();
    if (id === SECT_ID) renderSectPanels();
    resizeChart();
    drawChart();
  }

  document.getElementById("dexSymbolBtn").addEventListener("click", (e) => {
    openPicker(e.currentTarget, setSymbol, { sect: true });
  });

  // ---------------------------------------------------------------------
  // SECT/USDT: cabecera, ficha del mercado, compra en Uniswap y grafica
  // ---------------------------------------------------------------------

  const tradeGridEl = document.querySelector("#dexTrade .dx-trade-grid");
  const sectPayEl = document.getElementById("dexSectPay");
  const sectReceiveEl = document.getElementById("dexSectReceive");
  const sectRateEl = document.getElementById("dexSectRate");
  const sectBuyBtnEl = document.getElementById("dexSectBuyBtn");
  const sectHeadBuyEl = document.getElementById("dexSectHeadBuy");

  function applySectMode() {
    if (tradeGridEl) tradeGridEl.classList.toggle("is-sect", activeSymbol === SECT_ID);
  }
  function setText(id, txt, cls) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = txt;
    if (cls !== undefined) el.className = cls;
  }
  function renderSectHeader() {
    if (symbolIconEl) symbolIconEl.innerHTML = iconHTML(SECT, 34);
    if (symbolPairEl) symbolPairEl.textContent = "SECT-USDT";
    if (symbolFullEl) symbolFullEl.textContent = "Sectora · Uniswap V3";
    const up = (SECT.change24h || 0) >= 0;
    if (statMarkEl) statMarkEl.textContent = displayPrice(SECT, SECT.price);
    if (statChangeEl) {
      statChangeEl.textContent = fmtPct(SECT.change24h);
      statChangeEl.className = "dx-stat-value mono " + (SECT.change24h == null ? "" : up ? "is-up" : "is-down");
    }
    if (statHighEl) statHighEl.textContent = displayPrice(SECT, SECT.high24h);
    if (statLowEl) statLowEl.textContent = displayPrice(SECT, SECT.low24h);
    if (statVolEl) statVolEl.textContent = fmtCompactUSD(SECT.vol24h);
    document.title = "SECT/USDT " + displayPrice(SECT, SECT.price) + " · Sectora DEX";
  }
  function renderSectBuy() {
    const pay = parseFloat(((sectPayEl && sectPayEl.value) || "").replace(/,/g, ""));
    if (sectReceiveEl) sectReceiveEl.textContent = SECT.price && pay > 0 ? "≈ " + fmtAmt(pay / SECT.price, 2) : "—";
    if (sectRateEl) sectRateEl.textContent = SECT.price ? "1 SECT = $" + fmtSect(SECT.price) : "—";
    const href = sectBuyHref();
    if (sectBuyBtnEl) sectBuyBtnEl.href = href;
    if (sectHeadBuyEl) sectHeadBuyEl.href = href;
  }
  function renderSectPanels() {
    const up = (SECT.change24h || 0) >= 0;
    setText("dexSectPrice", displayPrice(SECT, SECT.price));
    setText("dexSectChange", fmtPct(SECT.change24h), "mono " + (SECT.change24h == null ? "" : up ? "is-up" : "is-down"));
    setText("dexSectHigh", displayPrice(SECT, SECT.high24h));
    setText("dexSectLow", displayPrice(SECT, SECT.low24h));
    setText("dexSectVol", fmtCompactUSD(SECT.vol24h));
    setText("dexSectCap", SECT.price == null ? "—" : fmtCompactUSD(SECT.price * SECT_SUPPLY));
    setText("dexSectUpdated", SECT.updatedAt ? new Date(SECT.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—");
    const live = sectLive();
    setText("dexSectSrcText", "CoinGecko · " + (live ? t("dex.sect.live", "Live") : t("dex.sect.snapshot", "Snapshot")));
    root.querySelectorAll("#dexSectSrc, #dexSectChartSrc").forEach((el) => el.classList.toggle("is-stale", !live));
    renderSectBuy();
    renderSectRecent();
  }
  // ultimos precios reales de CoinGecko, del mas nuevo al mas viejo
  function renderSectRecent() {
    const el = document.getElementById("dexSectRecent");
    if (!el) return;
    const P = SECT.pts;
    if (P.length < 2) {
      el.innerHTML = '<div class="dx-recent-empty">' + (SECT.price == null ? "Loading CoinGecko data…" : "—") + "</div>";
      return;
    }
    const today = new Date().toDateString();
    const rows = [];
    for (let i = P.length - 1; i > 0 && rows.length < 12; i--) {
      const d = new Date(P[i][0]);
      const hm = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
      const when = d.toDateString() === today ? hm : d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase() + " " + hm;
      let chg = (P[i][1] / P[i - 1][1] - 1) * 100;
      if (Math.abs(chg) < 0.005) chg = 0;
      rows.push(
        '<div class="dx-recent-row"><span>' + when + "</span><span>$" + fmtSect(P[i][1]) + '</span><span class="' +
        (chg > 0 ? "is-up" : chg < 0 ? "is-down" : "") + '">' + (chg > 0 ? "+" : "") + chg.toFixed(2) + "%</span></div>"
      );
    }
    el.innerHTML = rows.join("");
  }

  // ---------------------------------------------------------------------
  // Tarjetas que rellenan las columnas: el mercado real SECT/USDT y los
  // activos que mas suben y bajan en 24 h (datos reales del feed)
  // ---------------------------------------------------------------------
  function sectSparkSVG() {
    const P = SECT.pts;
    if (P.length < 2) return "";
    const from = P[P.length - 1][0] - 7 * 86400000;
    let pts = P.filter((p) => p[0] >= from);
    if (pts.length < 2) pts = P.slice(-2);
    const step = Math.max(1, Math.floor(pts.length / 140));
    pts = pts.filter((p, i) => i % step === 0 || i === pts.length - 1);
    let lo = Infinity, hi = -Infinity;
    pts.forEach((p) => { if (p[1] < lo) lo = p[1]; if (p[1] > hi) hi = p[1]; });
    const span = hi - lo || hi * 0.01 || 1;
    const t0 = pts[0][0], t1 = pts[pts.length - 1][0];
    let d = "";
    pts.forEach((p, i) => {
      const x = ((p[0] - t0) / (t1 - t0 || 1)) * 300;
      const y = 54 - ((p[1] - lo) / span) * 48;
      d += (i ? "L" : "M") + x.toFixed(1) + "," + y.toFixed(1);
    });
    return (
      '<svg class="dx-promo-spark" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="dxSpkG' + (++iconSeq) + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3ddc97" stop-opacity=".28"/>' +
      '<stop offset="1" stop-color="#3ddc97" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + d + 'L300,60L0,60Z" fill="url(#dxSpkG' + iconSeq + ')"/>' +
      '<path d="' + d + '" fill="none" stroke="#3ddc97" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>'
    );
  }
  function promoHTML() {
    const up = (SECT.change24h || 0) >= 0;
    return (
      '<div class="dx-card-head"><span>' + t("dex.sect.promoTitle", "Our market") + '</span><span class="dx-sect-badge">' + t("dex.sect.tag", "Real market") + "</span></div>" +
      '<div class="dx-promo-main">' + iconHTML(SECT, 38) +
      '<span class="dx-promo-name"><b>SECT/USDT</b><small>Sectora · Uniswap V3</small></span>' +
      '<span class="dx-promo-price"><b>' + displayPrice(SECT, SECT.price) + "</b>" +
      '<small class="' + (SECT.change24h == null ? "" : up ? "is-up" : "is-down") + '">' + fmtPct(SECT.change24h) + " · 24H</small></span></div>" +
      sectSparkSVG() +
      '<div class="dx-promo-range"><span>7D · CoinGecko</span><span>Uniswap V3 · Ethereum</span></div>' +
      '<div class="dx-promo-btns"><button type="button" data-go-symbol="' + SECT_ID + '">' + t("dex.sect.promoTrade", "Trade SECT/USDT") + "</button>" +
      '<a href="' + SECT_UNISWAP + '" target="_blank" rel="noopener">' + t("dex.sect.promoBuy", "Buy on Uniswap") + " ↗</a></div>"
    );
  }
  function moversHTML() {
    const list = ASSETS.filter((a) => a.price != null && isFinite(a.change24h));
    if (!list.length) return "";
    const sorted = list.slice().sort((a, b) => b.change24h - a.change24h);
    const row = (a) =>
      '<button type="button" class="dx-mover" data-go-symbol="' + a.id + '">' + iconHTML(a, 20) +
      '<span class="dx-mover-sym">' + a.ticker + "</span>" +
      '<span class="mono ' + (a.change24h >= 0 ? "is-up" : "is-down") + '">' + fmtPct(a.change24h) + "</span></button>";
    return (
      '<div class="dx-card-head"><span>' + t("dex.sect.moversTitle", "Top movers · 24h") + '</span><span class="dx-live-dot" aria-hidden="true"></span></div>' +
      '<div class="dx-movers"><div><span class="dx-movers-label">' + t("dex.sect.gainers", "Gainers") + "</span>" +
      sorted.filter((a) => a.change24h > 0).slice(0, 4).map(row).join("") + "</div>" +
      "<div><span class=\"dx-movers-label\">" + t("dex.sect.losers", "Losers") + "</span>" +
      sorted.filter((a) => a.change24h < 0).slice(-4).reverse().map(row).join("") + "</div></div>"
    );
  }
  // cada tarjeta se genera aparte: los iconos con degradado llevan ids
  // unicos y no pueden repetirse entre copias
  function renderExtras() {
    root.querySelectorAll('[data-dx-extra="promo"]').forEach((el) => { el.innerHTML = promoHTML(); });
    root.querySelectorAll('[data-dx-extra="movers"]').forEach((el) => { const h = moversHTML(); el.innerHTML = h; el.hidden = !h; });
  }
  // un clic en la tarjeta lleva al mercado en la pestana Trade
  root.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go-symbol]");
    if (!go) return;
    const tabBtn = root.querySelector('#dexTabs [data-tab="trade"]');
    if (tabBtn && !tabBtn.classList.contains("is-active")) tabBtn.click();
    setSymbol(go.getAttribute("data-go-symbol"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  function drawSectChart() {
    const ctx = tradeChart.ctx, cv = tradeChart.canvas;
    if (!ctx || !cv) return;
    const candles = sectCandles();
    if (candles.length >= 2) { renderCandles(ctx, cv, SECT, candles, { all: true, times: true }); return; }
    const w = cv.clientWidth, h = cv.clientHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--font-mono");
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    const msg = "LOADING COINGECKO DATA…";
    ctx.fillText(msg, (w - ctx.measureText(msg).width) / 2, h / 2);
  }
  function sectRender() {
    renderMarketTable();
    renderTicker();
    renderExtras();
    if (activeSymbol === SECT_ID) {
      renderSectHeader();
      renderSectPanels();
      drawChart();
    }
  }
  root.querySelectorAll("#dexSectRange [data-srange]").forEach((btn) => {
    btn.addEventListener("click", () => {
      sectRange = btn.dataset.srange;
      root.querySelectorAll("#dexSectRange [data-srange]").forEach((b) => b.classList.toggle("is-active", b === btn));
      drawChart();
    });
  });
  if (sectPayEl) sectPayEl.addEventListener("input", renderSectBuy);
  root.querySelectorAll("#dexSectQuick [data-usdt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (sectPayEl) sectPayEl.value = btn.dataset.usdt;
      renderSectBuy();
    });
  });

  // ---------------------------------------------------------------------
  // Asset picker popover (reused by trade symbol + swap tokens), with a
  // live search box since the full list now runs past 100 items.
  // ---------------------------------------------------------------------

  let pickerEl = null;
  function closePicker() {
    if (pickerEl) {
      pickerEl.remove();
      pickerEl = null;
      document.removeEventListener("mousedown", onPickerOutside);
    }
  }
  function onPickerOutside(e) {
    if (pickerEl && !pickerEl.contains(e.target)) closePicker();
  }
  function pickerRowsHTML(list) {
    if (!list.length) return '<div class="dx-picker-empty">' + t("dex.trade.markets.empty", "No markets match your search.") + "</div>";
    return list.map(
      (a) =>
        '<button type="button" class="dx-picker-row" data-symbol="' + a.id + '">' +
        iconHTML(a, 26) +
        '<span class="dx-picker-name">' + a.name + '<span class="dx-picker-ticker">' + a.ticker + "</span></span>" +
        '<span class="mono">' + displayPrice(a, a.price) + "</span>" +
        "</button>"
    ).join("");
  }
  function openPicker(anchor, onPick, opts) {
    opts = opts || {};
    closePicker();
    pickerEl = document.createElement("div");
    pickerEl.className = "dx-picker";
    const all = ASSETS.filter((a) => a.price != null).sort((a, b) => (a.rank || 0) - (b.rank || 0));
    const rowsFor = (q) => {
      const list = !q ? all : all.filter((a) => a.ticker.toLowerCase().indexOf(q) !== -1 || a.name.toLowerCase().indexOf(q) !== -1);
      const sectRow = opts.sect && sectMatches(q)
        ? '<button type="button" class="dx-picker-row dx-picker-row--sect" data-symbol="' + SECT_ID + '">' + iconHTML(SECT, 26) +
          '<span class="dx-picker-name">Sectora<span class="dx-picker-ticker">SECT/USDT · Uniswap V3</span></span>' +
          '<span class="mono">' + displayPrice(SECT, SECT.price) + "</span></button>"
        : "";
      return sectRow + (list.length || !sectRow ? pickerRowsHTML(list) : "");
    };
    pickerEl.innerHTML =
      '<div class="dx-picker-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
      '<input type="text" id="dexPickerSearch" placeholder="' + t("dex.trade.markets.search", "Search markets…") + '" /></div>' +
      '<div id="dexPickerRows">' + rowsFor("") + "</div>";
    root.appendChild(pickerEl);
    // el picker vive dentro de .dx, que lleva el zoom de monitores grandes:
    // las coordenadas de pantalla se pasan a las suyas
    const z = dxZoom();
    const r = anchor.getBoundingClientRect();
    const top = (r.bottom + window.scrollY) / z + 6;
    let left = (r.left + window.scrollX) / z;
    const maxLeft = (window.scrollX + document.documentElement.clientWidth) / z - pickerEl.offsetWidth - 12;
    pickerEl.style.top = top + "px";
    pickerEl.style.left = Math.min(left, Math.max(12, maxLeft)) + "px";
    function wireRows() {
      pickerEl.querySelectorAll("[data-symbol]").forEach((btn) => {
        btn.addEventListener("click", () => {
          onPick(btn.dataset.symbol);
          closePicker();
        });
      });
    }
    wireRows();
    const searchInput = pickerEl.querySelector("#dexPickerSearch");
    const rowsEl = pickerEl.querySelector("#dexPickerRows");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim().toLowerCase();
        rowsEl.innerHTML = rowsFor(q);
        wireRows();
      });
      setTimeout(() => searchInput.focus(), 30);
    }
    setTimeout(() => document.addEventListener("mousedown", onPickerOutside), 0);
  }

  // ---------------------------------------------------------------------
  // Trade form: side / type / amount / totals
  // ---------------------------------------------------------------------

  const priceFieldEl = document.getElementById("dexPriceField");
  const amountInputEl = document.getElementById("dexAmountInput");
  const amountRangeEl = document.getElementById("dexAmountRange");
  const availableEl = document.getElementById("dexAvailable");
  const orderValueEl = document.getElementById("dexOrderValue");
  const submitBtn = document.getElementById("dexSubmitBtn");
  let formSide = "buy";
  let formType = "market";
  const SIM_BALANCE_QUOTE = 5000;

  function simBalanceFor(asset) {
    if (!asset.simBalance) {
      const tier = tierOf(asset);
      const base = tier === 1 ? 2500 / Math.max(asset.price || 1, 1) : tier === 2 ? 25000 / Math.max(asset.price || 1, 1) : 12000;
      asset.simBalance = Math.max(base, 0.001);
    }
    return asset.simBalance;
  }

  function currentTradePrice() {
    const asset = BY_ID[activeSymbol];
    if (formType === "limit" && priceInputEl && priceInputEl.value) {
      const v = parseFloat(priceInputEl.value.replace(/,/g, ""));
      if (!isNaN(v) && v > 0) return v;
    }
    return asset ? asset.price : 0;
  }

  function updateFormTotals() {
    const asset = BY_ID[activeSymbol];
    if (!asset) return;
    const amt = parseFloat((amountInputEl && amountInputEl.value || "0").replace(/,/g, "")) || 0;
    const price = currentTradePrice();
    if (orderValueEl) orderValueEl.textContent = "$" + fmtAmt(amt * price, 2);
    if (availableEl) {
      availableEl.textContent =
        formSide === "buy" ? fmtAmt(SIM_BALANCE_QUOTE, 2) + " " + QUOTE : fmtAmt(simBalanceFor(asset), 4) + " " + asset.ticker;
    }
  }

  function setSide(side) {
    formSide = side;
    root.querySelectorAll("[data-side]").forEach((b) => b.classList.toggle("is-active", b.dataset.side === side));
    if (submitBtn) submitBtn.classList.toggle("is-buy", side === "buy");
    if (submitBtn) submitBtn.classList.toggle("is-sell", side === "sell");
    updateFormTotals();
  }
  function setType(type) {
    formType = type;
    root.querySelectorAll("[data-type]").forEach((b) => b.classList.toggle("is-active", b.dataset.type === type));
    if (priceFieldEl) priceFieldEl.hidden = type !== "limit";
    updateFormTotals();
  }
  root.querySelectorAll("[data-side]").forEach((b) => b.addEventListener("click", () => setSide(b.dataset.side)));
  root.querySelectorAll("[data-type]").forEach((b) => b.addEventListener("click", () => setType(b.dataset.type)));
  if (amountInputEl) amountInputEl.addEventListener("input", updateFormTotals);
  if (priceInputEl)
    priceInputEl.addEventListener("input", () => {
      priceInputEl.dataset.userEdited = "1";
      updateFormTotals();
    });
  if (amountRangeEl)
    amountRangeEl.addEventListener("input", () => {
      const asset = BY_ID[activeSymbol];
      if (!asset) return;
      const pct = Number(amountRangeEl.value) / 100;
      if (formSide === "buy") {
        const amt = (SIM_BALANCE_QUOTE * pct) / currentTradePrice();
        if (amountInputEl) amountInputEl.value = fmtAmt(amt, 4);
      } else {
        const amt = simBalanceFor(asset) * pct;
        if (amountInputEl) amountInputEl.value = fmtAmt(amt, 4);
      }
      updateFormTotals();
    });

  // ---------------------------------------------------------------------
  // Timeframe + book/trades tab switching
  // ---------------------------------------------------------------------

  root.querySelectorAll("#dexTfGroup [data-tf]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTf = btn.dataset.tf;
      root.querySelectorAll("#dexTfGroup [data-tf]").forEach((b) => b.classList.toggle("is-active", b === btn));
      drawChart();
    });
  });
  root.querySelectorAll("#dexPerpTfGroup [data-tf]").forEach((btn) => {
    btn.addEventListener("click", () => {
      perpTf = btn.dataset.tf;
      root.querySelectorAll("#dexPerpTfGroup [data-tf]").forEach((b) => b.classList.toggle("is-active", b === btn));
      perpChart.draw();
    });
  });
  root.querySelectorAll("#dexFutTfGroup [data-tf]").forEach((btn) => {
    btn.addEventListener("click", () => {
      futTf = btn.dataset.tf;
      root.querySelectorAll("#dexFutTfGroup [data-tf]").forEach((b) => b.classList.toggle("is-active", b === btn));
      futChart.draw();
    });
  });

  const bookViewEl = document.getElementById("dexBookView");
  const tradesViewEl = document.getElementById("dexTradesView");
  root.querySelectorAll("[data-booktab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const showBook = btn.dataset.booktab === "book";
      root.querySelectorAll("[data-booktab]").forEach((b) => b.classList.toggle("is-active", b === btn));
      if (bookViewEl) bookViewEl.hidden = !showBook;
      if (tradesViewEl) tradesViewEl.hidden = showBook;
    });
  });

  // ---------------------------------------------------------------------
  // Tabs (Trade / P2P / Swap)
  // ---------------------------------------------------------------------

  root.querySelectorAll("#dexTabs [data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      root.querySelectorAll("#dexTabs [data-tab]").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      root.querySelectorAll(".dx-panel").forEach((p) => {
        p.hidden = p.dataset.panel !== tab;
        p.classList.toggle("is-active", p.dataset.panel === tab);
      });
      if (tab === "trade") { resizeChart(); drawChart(); }
      if (tab === "perps") { perpChart.resize(); perpChart.draw(); renderPerpPositions(); }
      if (tab === "futures") { futChart.resize(); futChart.draw(); renderFutPositions(); }
      if (tab === "bot") { renderBotStrategies(); renderActiveBots(); }
    });
  });

  // ---------------------------------------------------------------------
  // P2P marketplace
  // ---------------------------------------------------------------------

  const TRADER_NAMES = [
    "AtlasNode", "ZeroSlip", "VaultKeeper", "OrbitTrade", "NorthStarFi", "ClearLedger",
    "GraniteSwap", "MeridianOTC", "SilverCircuit", "PelicanChain", "IonicTrust", "QuietHash",
    "CobaltRoute", "FalconLiquid", "AmberDesk", "TerraLinkFi",
  ];
  const p2pAssetSelect = document.getElementById("dexP2pAsset");
  const p2pPaymentSelect = document.getElementById("dexP2pPayment");
  const p2pListEl = document.getElementById("dexP2pList");
  let p2pSide = "buy";
  let p2pPopulated = false;

  function populateP2pAssetSelect() {
    if (!p2pAssetSelect || p2pPopulated) return;
    const list = ASSETS.filter((a) => a.price != null).sort((a, b) => (a.rank || 0) - (b.rank || 0));
    if (!list.length) return;
    p2pAssetSelect.innerHTML = list.map((a) => '<option value="' + a.id + '">' + a.ticker + " · " + a.name + "</option>").join("");
    p2pAssetSelect.value = BY_ID.bitcoin ? "bitcoin" : list[0].id;
    p2pPopulated = true;
  }

  function paymentChip(method) {
    const key = method === "bank" ? "dex.p2p.payBank" : method === "card" ? "dex.p2p.payCard" : "dex.p2p.payWallet";
    const fallback = method === "bank" ? "Bank Transfer" : method === "card" ? "Card" : "Wallet Transfer";
    return '<span class="dx-chip">' + t(key, fallback) + "</span>";
  }

  function renderP2p() {
    if (!p2pListEl) return;
    populateP2pAssetSelect();
    const assetId = p2pAssetSelect ? p2pAssetSelect.value : "bitcoin";
    const asset = BY_ID[assetId];
    if (!asset || asset.price == null) {
      p2pListEl.innerHTML = '<div class="dx-market-empty">' + t("dex.trade.markets.loading", "Loading live prices…") + "</div>";
      return;
    }
    const paymentFilter = p2pPaymentSelect ? p2pPaymentSelect.value : "";
    const tier = tierOf(asset);
    const methods = ["bank", "card", "wallet"];
    const rows = [];
    for (let i = 0; i < 10; i++) {
      const spreadPct = rand(0.002, 0.028) * (p2pSide === "buy" ? 1 : -1);
      const price = asset.price * (1 + spreadPct);
      const rowMethods = [methods[i % 3], methods[(i + 1) % 3]].filter((m, idx, arr) => arr.indexOf(m) === idx);
      if (paymentFilter && rowMethods.indexOf(paymentFilter) === -1) continue;
      const avail = rand(200, tier === 1 ? 40000 : 15000);
      const limMin = Math.round(avail * 0.02);
      const limMax = Math.round(avail * rand(0.4, 0.95));
      rows.push({
        name: TRADER_NAMES[(i * 3 + assetId.length) % TRADER_NAMES.length],
        rating: (96 + (i % 4)).toFixed(0),
        trades: 80 + i * 37 + (assetId.length % 20),
        price, avail, limMin, limMax, methods: rowMethods,
      });
    }
    p2pListEl.innerHTML = rows
      .map(
        (r) =>
          '<div class="dx-p2p-row">' +
          '<span class="dx-p2p-trader"><span class="dx-p2p-avatar">' + r.name.charAt(0) + "</span>" +
          '<span><span class="dx-p2p-trader-name">' + r.name + '</span><span class="dx-p2p-trader-meta">' +
          r.rating + "% &middot; " + r.trades + " " + t("dex.p2p.trades", "trades") + "</span></span></span>" +
          '<span class="mono dx-p2p-price">' + displayPrice(asset, r.price) + "</span>" +
          '<span class="dx-p2p-limits"><span class="mono">' + fmtAmt(r.avail, 2) + " " + asset.ticker + "</span>" +
          '<span class="dx-p2p-limits-sub">' + fmtCompactUSD(r.limMin) + " - " + fmtCompactUSD(r.limMax) + "</span></span>" +
          '<span class="dx-p2p-methods">' + r.methods.map(paymentChip).join("") + "</span>" +
          '<button type="button" class="dx-p2p-action is-' + p2pSide + '" data-p2p-buy>' +
          (p2pSide === "buy" ? t("dex.trade.form.buy", "Buy") : t("dex.trade.form.sell", "Sell")) +
          "</button>" +
          "</div>"
      )
      .join("");
    p2pListEl.querySelectorAll("[data-p2p-buy]").forEach((btn) => btn.addEventListener("click", openModal));
  }

  root.querySelectorAll("[data-p2pside]").forEach((btn) => {
    btn.addEventListener("click", () => {
      p2pSide = btn.dataset.p2pside;
      root.querySelectorAll("[data-p2pside]").forEach((b) => b.classList.toggle("is-active", b === btn));
      renderP2p();
    });
  });
  if (p2pAssetSelect) p2pAssetSelect.addEventListener("change", renderP2p);
  if (p2pPaymentSelect) p2pPaymentSelect.addEventListener("change", renderP2p);
  const postOfferBtn = document.getElementById("dexPostOfferBtn");
  if (postOfferBtn) postOfferBtn.addEventListener("click", openModal);

  // ---------------------------------------------------------------------
  // Swap
  // ---------------------------------------------------------------------

  let swapFrom = "bitcoin";
  let swapTo = "ethereum";
  const swapFromAmountEl = document.getElementById("dexSwapFromAmount");
  const swapToAmountEl = document.getElementById("dexSwapToAmount");
  const swapFromIconEl = document.getElementById("dexSwapFromIcon");
  const swapToIconEl = document.getElementById("dexSwapToIcon");
  const swapFromSymbolEl = document.getElementById("dexSwapFromSymbol");
  const swapToSymbolEl = document.getElementById("dexSwapToSymbol");
  const swapFromChainEl = document.getElementById("dexSwapFromChain");
  const swapToChainEl = document.getElementById("dexSwapToChain");
  const swapFromBalanceEl = document.getElementById("dexSwapFromBalance");
  const swapToBalanceEl = document.getElementById("dexSwapToBalance");
  const swapRateEl = document.getElementById("dexSwapRate");
  const swapFeeEl = document.getElementById("dexSwapFee");

  function renderSwapSides() {
    const from = BY_ID[swapFrom], to = BY_ID[swapTo];
    if (!from || !to || from.price == null || to.price == null) return;
    if (swapFromIconEl) swapFromIconEl.innerHTML = iconHTML(from, 26);
    if (swapToIconEl) swapToIconEl.innerHTML = iconHTML(to, 26);
    if (swapFromSymbolEl) swapFromSymbolEl.textContent = from.ticker;
    if (swapToSymbolEl) swapToSymbolEl.textContent = to.ticker;
    if (swapFromChainEl) swapFromChainEl.textContent = from.chain || from.name;
    if (swapToChainEl) swapToChainEl.textContent = to.chain || to.name;
    if (swapFromBalanceEl) swapFromBalanceEl.textContent = fmtAmt(simBalanceFor(from), 4);
    if (swapToBalanceEl) swapToBalanceEl.textContent = fmtAmt(simBalanceFor(to), 4);
    const rate = from.price / to.price;
    if (swapRateEl) swapRateEl.textContent = "1 " + from.ticker + " = " + fmtAmt(rate, rate >= 1 ? 2 : 6) + " " + to.ticker;
    const tier = tierOf(from);
    const feeUsd = tier === 1 ? rand(0.8, 3.2) : tier === 2 ? rand(0.05, 0.4) : rand(0.01, 0.08);
    if (swapFeeEl) swapFeeEl.textContent = "~$" + feeUsd.toFixed(2);
    recomputeSwapOutput();
  }
  function recomputeSwapOutput() {
    const from = BY_ID[swapFrom], to = BY_ID[swapTo];
    if (!from || !to) return;
    const amt = parseFloat((swapFromAmountEl && swapFromAmountEl.value || "0").replace(/,/g, "")) || 0;
    const out = (amt * from.price) / to.price;
    if (swapToAmountEl) swapToAmountEl.value = amt ? fmtAmt(out, 6) : "";
  }
  if (swapFromAmountEl) swapFromAmountEl.addEventListener("input", recomputeSwapOutput);
  document.getElementById("dexSwapFromBtn").addEventListener("click", (e) => {
    openPicker(e.currentTarget, (id) => {
      if (id === swapTo) swapTo = swapFrom;
      swapFrom = id;
      renderSwapSides();
    });
  });
  document.getElementById("dexSwapToBtn").addEventListener("click", (e) => {
    openPicker(e.currentTarget, (id) => {
      if (id === swapFrom) swapFrom = swapTo;
      swapTo = id;
      renderSwapSides();
    });
  });
  document.getElementById("dexSwapFlipBtn").addEventListener("click", () => {
    const tmp = swapFrom;
    swapFrom = swapTo;
    swapTo = tmp;
    if (swapFromAmountEl && swapToAmountEl) swapFromAmountEl.value = swapToAmountEl.value;
    renderSwapSides();
  });

  const swapRecentListEl = document.getElementById("dexSwapRecentList");
  let swapFeed = [];
  function pushSimSwap() {
    const priced = ASSETS.filter((a) => a.price != null);
    if (priced.length < 2) return;
    const a = pick(priced);
    const b = pick(priced.filter((x) => x.id !== a.id));
    if (!b) return;
    const tier = tierOf(a);
    const amt = rand(0.05, tier === 1 ? 1.4 : tier === 2 ? 60 : 900);
    const out = (amt * a.price) / b.price;
    swapFeed.unshift({ a, b, amt, out, ts: Date.now() });
    if (swapFeed.length > 24) swapFeed.length = 24;
    renderSwapFeed();
  }
  function renderSwapFeed() {
    if (!swapRecentListEl) return;
    swapRecentListEl.innerHTML = swapFeed
      .map(
        (s) =>
          '<div class="dx-swap-feed-row">' +
          '<span class="mono">' + fmtAmt(s.amt, 3) + " " + s.a.ticker + "</span>" +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
          '<span class="mono">' + fmtAmt(s.out, s.out < 0.01 ? 6 : 3) + " " + s.b.ticker + "</span>" +
          '<span class="dx-swap-feed-time mono">' + fmtClock(s.ts) + "</span>" +
          "</div>"
      )
      .join("");
  }

  // ---------------------------------------------------------------------
  // Perpetuals + Futures (shared helpers: liq price, PnL, funding, expiry)
  // ---------------------------------------------------------------------

  function estLiqPrice(entry, lev, side) {
    const move = (1 / lev) * 0.9;
    return side === "long" ? entry * (1 - move) : entry * (1 + move);
  }
  function positionPnl(p, asset) {
    if (!asset || asset.price == null) return 0;
    const dir = p.side === "long" ? 1 : -1;
    return (asset.price - p.entry) * dir * p.size;
  }
  function positionPnlPct(p, asset) {
    const pnl = positionPnl(p, asset);
    const margin = (p.entry * p.size) / p.lev;
    return margin ? (pnl / margin) * 100 : 0;
  }
  function nextFundingBoundary(now) {
    now = now || Date.now();
    const period = 8 * 3600000;
    return Math.ceil((now + 1) / period) * period;
  }
  function fundingRateFor(asset) {
    const boundary = nextFundingBoundary();
    if (asset._fundingBoundary !== boundary) {
      asset._fundingBoundary = boundary;
      asset._funding = rand(-0.015, 0.02);
    }
    return asset._funding;
  }
  function nextFundingCountdown() {
    const ms = nextFundingBoundary() - Date.now();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h + "h " + m + "m";
  }
  function openInterestFor(asset) {
    if (asset._oi == null) {
      const tier = tierOf(asset);
      asset._oi = tier === 1 ? rand(40e6, 260e6) : tier === 2 ? rand(4e6, 40e6) : rand(200e3, 4e6);
    }
    return asset._oi;
  }
  function quarterlyExpiries() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const months = [2, 5, 8, 11];
    const dates = [];
    [year, year + 1].forEach((y) => {
      months.forEach((m) => {
        const d = new Date(Date.UTC(y, m + 1, 0));
        const offset = (d.getUTCDay() - 5 + 7) % 7;
        d.setUTCDate(d.getUTCDate() - offset);
        dates.push(d);
      });
    });
    return dates.sort((a, b) => a - b);
  }
  function nextExpiry() {
    const list = quarterlyExpiries();
    const now = new Date();
    return list.find((d) => d > now) || list[list.length - 1];
  }
  function contractLabel(d) {
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return months[d.getUTCMonth()] + String(d.getUTCFullYear()).slice(-2);
  }
  function fmtExpiryCountdown(d) {
    const ms = d.getTime() - Date.now();
    if (ms <= 0) return "—";
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    return days + "d " + hours + "h";
  }
  function futuresPriceFor(asset, expiry) {
    const days = Math.max(0, (expiry.getTime() - Date.now()) / 86400000);
    const premium = 1 + (0.04 * days) / 365;
    return asset.price * premium;
  }

  // tablas de mercados de perpetuos y futuros (precio y cambio reales; la
  // financiacion, el interes abierto y la base son parte de la vista previa)
  function renderLevMarkets() {
    const list = ASSETS.filter((a) => a.price != null && a.category !== "index");
    const exp = nextExpiry();
    const perpEl = document.getElementById("dexPerpMarkets");
    const futEl = document.getElementById("dexFutMarkets");
    const row = (a, kind) => {
      const up = (a.change24h || 0) >= 0;
      const isFut = kind === "fut";
      const active = isFut ? a.id === futSymbol : a.id === perpSymbol;
      const price = isFut ? futuresPriceFor(a, exp) : a.price;
      const extra = isFut
        ? ((price / a.price - 1) * 100).toFixed(2) + "%"
        : (fundingRateFor(a) >= 0 ? "+" : "") + fundingRateFor(a).toFixed(4) + "%";
      const last = isFut ? fmtExpiryCountdown(exp) : fmtCompactUSD(openInterestFor(a));
      return (
        '<button type="button" class="dx-lev-mk-row' + (active ? " is-active" : "") + '" data-lev-pick="' + kind + '" data-id="' + a.id + '">' +
        '<span class="dx-market-row-name">' + iconHTML(a, 22) + '<span class="dx-market-row-ticker">' + a.ticker + (isFut ? "-" + contractLabel(exp) : "-PERP") + "</span></span>" +
        '<span class="mono">' + displayPrice(a, price) + "</span>" +
        '<span class="mono ' + (up ? "is-up" : "is-down") + '">' + fmtPct(a.change24h) + "</span>" +
        '<span class="mono">' + extra + "</span>" +
        '<span class="mono dx-lev-hide">' + last + "</span></button>"
      );
    };
    if (perpEl) perpEl.innerHTML = list.map((a) => row(a, "perp")).join("");
    if (futEl) futEl.innerHTML = list.map((a) => row(a, "fut")).join("");
  }
  root.addEventListener("click", (e) => {
    const r = e.target.closest("[data-lev-pick]");
    if (!r) return;
    const id = r.getAttribute("data-id");
    if (r.getAttribute("data-lev-pick") === "fut") { futSymbol = id; renderFutHeader(); futChart.resize(); futChart.draw(); }
    else { perpSymbol = id; renderPerpHeader(); perpChart.resize(); perpChart.draw(); }
    renderLevMarkets();
  });

  function renderPositionsRows(list, containerId, withExpiry, onClose) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!list.length) {
      el.innerHTML = '<div class="dx-positions-empty">' + t("dex.perps.positions.empty", "No open positions yet.") + "</div>";
      return;
    }
    el.innerHTML = list.map((p, i) => {
      const asset = BY_ID[p.id];
      if (!asset || asset.price == null) return "";
      const pnl = positionPnl(p, asset);
      const pnlPct = positionPnlPct(p, asset);
      const up = pnl >= 0;
      const lastCol = withExpiry ? fmtExpiryCountdown(p.expiry) : displayPricePlain(asset, estLiqPrice(p.entry, p.lev, p.side));
      return (
        '<div class="dx-positions-row">' +
        '<span class="dx-positions-symbol">' + iconHTML(asset, 24) +
        '<span>' + asset.ticker + '</span><span class="dx-positions-side is-' + p.side + '">' + p.side + " " + p.lev + "&times;</span></span>" +
        '<span class="mono">' + fmtAmt(p.size, 4) + "</span>" +
        '<span class="mono">' + displayPricePlain(asset, p.entry) + "</span>" +
        '<span class="mono">' + displayPricePlain(asset, asset.price) + "</span>" +
        '<span class="mono dx-positions-pnl is-' + (up ? "up" : "down") + '">' + (up ? "+$" : "-$") + fmtAmt(Math.abs(pnl), 2) + " (" + fmtPct(pnlPct) + ")</span>" +
        '<span class="mono">' + lastCol + "</span>" +
        '<button type="button" class="dx-positions-close" data-close="' + i + '">' + t("dex.perps.positions.close", "Close") + "</button>" +
        "</div>"
      );
    }).join("");
    el.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => {
        list.splice(parseInt(btn.dataset.close, 10), 1);
        onClose();
      });
    });
  }
  function renderPerpPositions() { renderPositionsRows(perpPositions, "dexPerpPositions", false, renderPerpPositions); }
  function renderFutPositions() { renderPositionsRows(futPositions, "dexFutPositions", true, renderFutPositions); }

  let perpPositions = [];
  let futPositions = [];
  function seedPositions() {
    const btc = BY_ID["bitcoin"], eth = BY_ID["ethereum"];
    if (!perpPositions.length && btc && btc.price != null && eth && eth.price != null) {
      perpPositions = [
        { id: "bitcoin", side: "long", size: 0.15, entry: btc.price * 0.97, lev: 10 },
        { id: "ethereum", side: "short", size: 2.4, entry: eth.price * 1.02, lev: 8 },
      ];
    }
    if (!futPositions.length && btc && btc.price != null) {
      futPositions = [{ id: "bitcoin", side: "long", size: 0.08, entry: btc.price * 0.985, lev: 5, expiry: nextExpiry() }];
    }
  }

  // ---- perps form ----

  let perpSide = "long", perpMargin = "cross", perpLev = 10;

  function renderPerpHeader() {
    const a = BY_ID[perpSymbol];
    if (!a || a.price == null) return;
    const iconEl = document.getElementById("dexPerpSymbolIcon");
    const pairEl = document.getElementById("dexPerpSymbolPair");
    const fullEl = document.getElementById("dexPerpSymbolFull");
    const markEl = document.getElementById("dexPerpMark");
    const indexEl = document.getElementById("dexPerpIndex");
    const fundingEl = document.getElementById("dexPerpFunding");
    const nextFundingEl = document.getElementById("dexPerpNextFunding");
    const oiEl = document.getElementById("dexPerpOI");
    if (iconEl) iconEl.innerHTML = iconHTML(a, 34);
    if (pairEl) pairEl.textContent = a.ticker + "-PERP";
    if (fullEl) fullEl.textContent = a.subLabel || a.name;
    if (markEl) markEl.textContent = displayPrice(a, a.price);
    if (indexEl) indexEl.textContent = displayPrice(a, a.price * (1 + rand(-0.0006, 0.0006)));
    if (fundingEl) {
      const funding = fundingRateFor(a);
      fundingEl.textContent = fmtPct(funding * 100);
      fundingEl.className = "dx-stat-value mono " + (funding >= 0 ? "is-up" : "is-down");
    }
    if (nextFundingEl) nextFundingEl.textContent = nextFundingCountdown();
    if (oiEl) oiEl.textContent = fmtCompactUSD(openInterestFor(a));
    updatePerpFormTotals();
  }
  function updatePerpFormTotals() {
    const a = BY_ID[perpSymbol];
    const amtEl = document.getElementById("dexPerpAmountInput");
    const posSizeEl = document.getElementById("dexPerpPosSize");
    const marginEl = document.getElementById("dexPerpMargin");
    const liqEl = document.getElementById("dexPerpLiqPrice");
    if (!a || a.price == null) return;
    const amt = parseFloat(((amtEl && amtEl.value) || "0").replace(/,/g, "")) || 0;
    if (posSizeEl) posSizeEl.textContent = fmtAmt((amt * perpLev) / a.price, 5) + " " + a.ticker;
    if (marginEl) marginEl.textContent = fmtAmt(amt, 2) + " " + QUOTE;
    if (liqEl) liqEl.textContent = amt > 0 ? displayPricePlain(a, estLiqPrice(a.price, perpLev, perpSide)) : "—";
  }
  root.querySelectorAll("[data-pside]").forEach((b) => b.addEventListener("click", () => {
    perpSide = b.dataset.pside;
    root.querySelectorAll("[data-pside]").forEach((x) => x.classList.toggle("is-active", x === b));
    const submitEl = document.getElementById("dexPerpSubmitBtn");
    if (submitEl) { submitEl.classList.toggle("is-buy", perpSide === "long"); submitEl.classList.toggle("is-sell", perpSide === "short"); }
    updatePerpFormTotals();
  }));
  root.querySelectorAll("[data-pmargin]").forEach((b) => b.addEventListener("click", () => {
    perpMargin = b.dataset.pmargin;
    root.querySelectorAll("[data-pmargin]").forEach((x) => x.classList.toggle("is-active", x === b));
  }));
  const perpLevRange = document.getElementById("dexPerpLevRange");
  const perpLevValueEl = document.getElementById("dexPerpLevValue");
  if (perpLevRange) perpLevRange.addEventListener("input", () => {
    perpLev = parseInt(perpLevRange.value, 10) || 1;
    if (perpLevValueEl) perpLevValueEl.textContent = perpLev + "×";
    updatePerpFormTotals();
  });
  const perpAmountInput = document.getElementById("dexPerpAmountInput");
  const perpAmountRange = document.getElementById("dexPerpAmountRange");
  if (perpAmountInput) perpAmountInput.addEventListener("input", updatePerpFormTotals);
  if (perpAmountRange) perpAmountRange.addEventListener("input", () => {
    const pct = parseInt(perpAmountRange.value, 10) || 0;
    if (perpAmountInput) perpAmountInput.value = fmtAmt((SIM_BALANCE_QUOTE * pct) / 100, 2);
    updatePerpFormTotals();
  });
  const dexPerpSymbolBtn = document.getElementById("dexPerpSymbolBtn");
  if (dexPerpSymbolBtn) dexPerpSymbolBtn.addEventListener("click", (e) => {
    openPicker(e.currentTarget, (id) => { perpSymbol = id; renderPerpHeader(); perpChart.resize(); perpChart.draw(); });
  });

  // ---- futures form ----

  let futSide = "long", futLev = 5;
  const futContracts = quarterlyExpiries().filter((d) => d.getTime() > Date.now()).slice(0, 4);
  let futContractIdx = 0;
  const futContractSelectEl = document.getElementById("dexFutContractSelect");
  if (futContractSelectEl) {
    futContractSelectEl.innerHTML = futContracts.map((d, i) => '<option value="' + i + '">' + contractLabel(d) + "</option>").join("");
    futContractSelectEl.addEventListener("change", (e) => {
      futContractIdx = parseInt(e.target.value, 10) || 0;
      renderFutHeader();
    });
  }
  function renderFutHeader() {
    const a = BY_ID[futSymbol];
    if (!a || a.price == null) return;
    const expiry = futContracts[futContractIdx] || nextExpiry();
    const iconEl = document.getElementById("dexFutSymbolIcon");
    const pairEl = document.getElementById("dexFutSymbolPair");
    const fullEl = document.getElementById("dexFutSymbolFull");
    const priceEl = document.getElementById("dexFutPrice");
    const indexEl = document.getElementById("dexFutIndex");
    const basisEl = document.getElementById("dexFutBasis");
    const expiryEl = document.getElementById("dexFutExpiry");
    if (iconEl) iconEl.innerHTML = iconHTML(a, 34);
    if (pairEl) pairEl.textContent = a.ticker + "-" + contractLabel(expiry);
    if (fullEl) fullEl.textContent = a.subLabel || a.name;
    const futPrice = futuresPriceFor(a, expiry);
    if (priceEl) priceEl.textContent = displayPrice(a, futPrice);
    if (indexEl) indexEl.textContent = displayPrice(a, a.price);
    if (basisEl) {
      const basis = ((futPrice - a.price) / a.price) * 100;
      basisEl.textContent = fmtPct(basis);
      basisEl.className = "dx-stat-value mono " + (basis >= 0 ? "is-up" : "is-down");
    }
    if (expiryEl) expiryEl.textContent = fmtExpiryCountdown(expiry);
    updateFutFormTotals();
  }
  function updateFutFormTotals() {
    const a = BY_ID[futSymbol];
    const amtEl = document.getElementById("dexFutAmountInput");
    const posSizeEl = document.getElementById("dexFutPosSize");
    const marginEl = document.getElementById("dexFutMargin");
    const liqEl = document.getElementById("dexFutLiqPrice");
    if (!a || a.price == null) return;
    const amt = parseFloat(((amtEl && amtEl.value) || "0").replace(/,/g, "")) || 0;
    if (posSizeEl) posSizeEl.textContent = fmtAmt((amt * futLev) / a.price, 5) + " " + a.ticker;
    if (marginEl) marginEl.textContent = fmtAmt(amt, 2) + " " + QUOTE;
    if (liqEl) liqEl.textContent = amt > 0 ? displayPricePlain(a, estLiqPrice(a.price, futLev, futSide)) : "—";
  }
  root.querySelectorAll("[data-fside]").forEach((b) => b.addEventListener("click", () => {
    futSide = b.dataset.fside;
    root.querySelectorAll("[data-fside]").forEach((x) => x.classList.toggle("is-active", x === b));
    const submitEl = document.getElementById("dexFutSubmitBtn");
    if (submitEl) { submitEl.classList.toggle("is-buy", futSide === "long"); submitEl.classList.toggle("is-sell", futSide === "short"); }
    updateFutFormTotals();
  }));
  const futLevRange = document.getElementById("dexFutLevRange");
  const futLevValueEl = document.getElementById("dexFutLevValue");
  if (futLevRange) futLevRange.addEventListener("input", () => {
    futLev = parseInt(futLevRange.value, 10) || 1;
    if (futLevValueEl) futLevValueEl.textContent = futLev + "×";
    updateFutFormTotals();
  });
  const futAmountInput = document.getElementById("dexFutAmountInput");
  const futAmountRange = document.getElementById("dexFutAmountRange");
  if (futAmountInput) futAmountInput.addEventListener("input", updateFutFormTotals);
  if (futAmountRange) futAmountRange.addEventListener("input", () => {
    const pct = parseInt(futAmountRange.value, 10) || 0;
    if (futAmountInput) futAmountInput.value = fmtAmt((SIM_BALANCE_QUOTE * pct) / 100, 2);
    updateFutFormTotals();
  });
  const dexFutSymbolBtn = document.getElementById("dexFutSymbolBtn");
  if (dexFutSymbolBtn) dexFutSymbolBtn.addEventListener("click", (e) => {
    openPicker(e.currentTarget, (id) => { futSymbol = id; renderFutHeader(); futChart.resize(); futChart.draw(); });
  });

  // ---------------------------------------------------------------------
  // AI Bot: strategy cards, grid bot builder, active bots
  // ---------------------------------------------------------------------

  const BOT_STRATEGIES = [
    {
      id: "grid", nameKey: "dex.bot.strategies.grid.name", nameFallback: "Grid Trading",
      descKey: "dex.bot.strategies.grid.desc", descFallback: "Automatically buy low and sell high within a set price range.",
      apy: "12–38%",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>',
    },
    {
      id: "dca", nameKey: "dex.bot.strategies.dca.name", nameFallback: "DCA",
      descKey: "dex.bot.strategies.dca.desc", descFallback: "Invest a fixed amount on a schedule to smooth out entry price.",
      apy: "6–18%",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    },
    {
      id: "trend", nameKey: "dex.bot.strategies.trend.name", nameFallback: "Trend Following",
      descKey: "dex.bot.strategies.trend.desc", descFallback: "Ride sustained moves using momentum signals, exit on reversal.",
      apy: "10–30%",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>',
    },
    {
      id: "arb", nameKey: "dex.bot.strategies.arb.name", nameFallback: "Arbitrage Scanner",
      descKey: "dex.bot.strategies.arb.desc", descFallback: "Scan spreads across markets and flag low-risk arbitrage windows.",
      apy: "4–12%",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    },
  ];
  function renderBotStrategies() {
    const el = document.getElementById("dexBotStrategies");
    if (!el) return;
    el.innerHTML = BOT_STRATEGIES.map((s) =>
      '<div class="dx-bot-card' + (s.id === "grid" ? " is-active" : "") + '">' +
      '<span class="dx-bot-card-icon">' + s.icon + "</span>" +
      '<span class="dx-bot-card-name">' + t(s.nameKey, s.nameFallback) + "</span>" +
      '<span class="dx-bot-card-desc">' + t(s.descKey, s.descFallback) + "</span>" +
      '<span class="dx-bot-card-foot"><span class="dx-bot-card-apy">' + t("dex.bot.strategies.apy", "Avg. APY") + " <strong>" + s.apy + "</strong></span>" +
      '<button type="button" class="dx-bot-card-cta" data-strategy="' + s.id + '">' +
      (s.id === "grid" ? t("dex.bot.strategies.active", "Active") : t("dex.bot.strategies.use", "Use")) +
      "</button></span></div>"
    ).join("");
    el.querySelectorAll("[data-strategy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.strategy !== "grid") { openModal(); return; }
        const card = document.getElementById("dexGridBotCard");
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  let botSymbol = "bitcoin";
  function renderBotSymbol() {
    const a = BY_ID[botSymbol];
    if (!a || a.price == null) return;
    const iconEl = document.getElementById("dexBotSymbolIcon");
    const pairEl = document.getElementById("dexBotSymbolPair");
    const fullEl = document.getElementById("dexBotSymbolFull");
    const lowerEl = document.getElementById("dexBotLowerInput");
    const upperEl = document.getElementById("dexBotUpperInput");
    if (iconEl) iconEl.innerHTML = iconHTML(a, 34);
    if (pairEl) pairEl.textContent = a.ticker + "-" + QUOTE;
    if (fullEl) fullEl.textContent = a.subLabel || a.name;
    if (lowerEl && !lowerEl.dataset.userEdited) lowerEl.value = displayPricePlain(a, a.price * 0.9).replace(/,/g, "");
    if (upperEl && !upperEl.dataset.userEdited) upperEl.value = displayPricePlain(a, a.price * 1.1).replace(/,/g, "");
    computeGridBot();
  }
  function computeGridBot() {
    const a = BY_ID[botSymbol];
    const lowerEl = document.getElementById("dexBotLowerInput");
    const upperEl = document.getElementById("dexBotUpperInput");
    const investEl = document.getElementById("dexBotInvestInput");
    const gridsEl = document.getElementById("dexBotGridsRange");
    const stepEl = document.getElementById("dexBotGridStep");
    const profitEl = document.getElementById("dexBotGridProfit");
    const lower = parseFloat(((lowerEl && lowerEl.value) || "0").replace(/,/g, "")) || 0;
    const upper = parseFloat(((upperEl && upperEl.value) || "0").replace(/,/g, "")) || 0;
    const invest = parseFloat(((investEl && investEl.value) || "0").replace(/,/g, "")) || 0;
    const grids = parseInt((gridsEl && gridsEl.value) || "1", 10) || 1;
    if (!a || upper <= lower) {
      if (stepEl) stepEl.textContent = "—";
      if (profitEl) profitEl.textContent = "—";
      return;
    }
    const step = (upper - lower) / grids;
    const profitPct = step / lower;
    const profitPerGrid = (invest / grids) * profitPct;
    if (stepEl) stepEl.textContent = displayPricePlain(a, step);
    if (profitEl) profitEl.textContent = invest > 0 ? "+$" + fmtAmt(profitPerGrid, 3) + " (" + fmtPct(profitPct * 100) + ")" : "—";
  }
  ["dexBotLowerInput", "dexBotUpperInput", "dexBotInvestInput"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => { el.dataset.userEdited = "1"; computeGridBot(); });
  });
  const botGridsRange = document.getElementById("dexBotGridsRange");
  const botGridsValueEl = document.getElementById("dexBotGridsValue");
  if (botGridsRange) botGridsRange.addEventListener("input", () => {
    if (botGridsValueEl) botGridsValueEl.textContent = botGridsRange.value;
    computeGridBot();
  });
  const dexBotSymbolBtn = document.getElementById("dexBotSymbolBtn");
  if (dexBotSymbolBtn) dexBotSymbolBtn.addEventListener("click", (e) => {
    openPicker(e.currentTarget, (id) => {
      botSymbol = id;
      const lowerEl = document.getElementById("dexBotLowerInput");
      const upperEl = document.getElementById("dexBotUpperInput");
      if (lowerEl) delete lowerEl.dataset.userEdited;
      if (upperEl) delete upperEl.dataset.userEdited;
      renderBotSymbol();
    });
  });

  let activeBots = [];
  function seedActiveBots() {
    if (activeBots.length) return;
    if (!BY_ID["bitcoin"] || !BY_ID["ethereum"] || !BY_ID["solana"]) return;
    if (BY_ID["bitcoin"].price == null || BY_ID["ethereum"].price == null || BY_ID["solana"].price == null) return;
    activeBots = [
      { id: "bitcoin", strategyKey: "dex.bot.strategies.grid.name", strategyFallback: "Grid Trading", invested: 1200, startedAt: Date.now() - 36 * 3600000, status: "running", pnl: 0 },
      { id: "ethereum", strategyKey: "dex.bot.strategies.dca.name", strategyFallback: "DCA", invested: 800, startedAt: Date.now() - 180 * 3600000, status: "running", pnl: 0 },
      { id: "solana", strategyKey: "dex.bot.strategies.trend.name", strategyFallback: "Trend Following", invested: 500, startedAt: Date.now() - 12 * 3600000, status: "paused", pnl: 0 },
    ];
  }
  function tickActiveBots() {
    activeBots.forEach((b) => { if (b.status === "running") b.pnl += b.invested * rand(-0.004, 0.006); });
  }
  function fmtRuntime(startedAt) {
    const h = Math.floor((Date.now() - startedAt) / 3600000);
    return h < 24 ? h + "h" : Math.floor(h / 24) + "d " + (h % 24) + "h";
  }
  function renderActiveBots() {
    seedActiveBots();
    const el = document.getElementById("dexActiveBots");
    if (!el) return;
    if (!activeBots.length) {
      el.innerHTML = '<div class="dx-botlist-empty">' + t("dex.bot.active.empty", "No active bots yet. Create one above.") + "</div>";
      return;
    }
    el.innerHTML = activeBots.map((b, i) => {
      const a = BY_ID[b.id];
      const up = b.pnl >= 0;
      return (
        '<div class="dx-botlist-row">' +
        '<span class="dx-botlist-name"><span class="dx-botlist-icon">#' + (i + 1) + "</span>" + t(b.strategyKey, b.strategyFallback) + "</span>" +
        '<span class="mono">' + a.ticker + "-" + QUOTE + "</span>" +
        '<span class="mono">' + fmtAmt(b.invested, 2) + " " + QUOTE + "</span>" +
        '<span class="mono dx-botlist-pnl is-' + (up ? "up" : "down") + '">' + (up ? "+$" : "-$") + fmtAmt(Math.abs(b.pnl), 2) + "</span>" +
        '<span class="mono">' + fmtRuntime(b.startedAt) + "</span>" +
        '<span class="dx-botlist-status is-' + b.status + '">' + (b.status === "running" ? t("dex.bot.active.statusRunning", "Running") : t("dex.bot.active.statusPaused", "Paused")) + "</span>" +
        '<button type="button" class="dx-botlist-stop' + (b.status === "running" ? "" : " is-resume") + '" data-stopbot="' + i + '">' + (b.status === "running" ? t("dex.bot.active.pause", "Pause") : t("dex.bot.active.resume", "Resume")) + "</button>" +
        "</div>"
      );
    }).join("");
    el.querySelectorAll("[data-stopbot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.stopbot, 10);
        activeBots[idx].status = activeBots[idx].status === "running" ? "paused" : "running";
        renderActiveBots();
      });
    });
  }
  const dexBotCreateBtn = document.getElementById("dexBotCreateBtn");
  if (dexBotCreateBtn) dexBotCreateBtn.addEventListener("click", openModal);

  // ---------------------------------------------------------------------
  // Modal (disclaimer for every action button)
  // ---------------------------------------------------------------------

  const modalOverlay = document.getElementById("dexModalOverlay");
  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.hidden = false;
    requestAnimationFrame(() => modalOverlay.classList.add("is-open"));
  }
  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("is-open");
    setTimeout(() => { modalOverlay.hidden = true; }, 200);
  }
  const modalCloseBtn = document.getElementById("dexModalClose");
  const modalOkBtn = document.getElementById("dexModalOk");
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalOkBtn) modalOkBtn.addEventListener("click", closeModal);
  if (modalOverlay) modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  [
    document.getElementById("dexConnectBtn"), submitBtn, document.getElementById("dexSwapBtn"),
    document.getElementById("dexPerpSubmitBtn"), document.getElementById("dexFutSubmitBtn"),
  ].forEach((btn) => {
    if (btn) btn.addEventListener("click", openModal);
  });

  // ---------------------------------------------------------------------
  // Render loop driven by real data changes
  // ---------------------------------------------------------------------

  function onDataChanged() {
    renderTicker();
    renderMarketTable();
    renderExtras();
    if (activeSymbol === SECT_ID) {
      renderSectHeader();
      renderSectPanels();
    } else if (BY_ID[activeSymbol] && BY_ID[activeSymbol].price != null) {
      renderSymbolHeader();
      if (!bookState.asks.length) regenerateBook();
      renderBook();
      drawChart();
    }
    renderP2p();
    renderSwapSides();

    seedPositions();
    if (BY_ID[perpSymbol] && BY_ID[perpSymbol].price != null) { renderPerpHeader(); perpChart.draw(); renderPerpPositions(); }
    if (BY_ID[futSymbol] && BY_ID[futSymbol].price != null) { renderFutHeader(); futChart.draw(); renderFutPositions(); }
    if (BY_ID[botSymbol] && BY_ID[botSymbol].price != null) renderBotSymbol();
    tickActiveBots();
    renderActiveBots();
    renderLevMarkets();
  }

  window.addEventListener("resize", () => {
    resizeChart();
    drawChart();
    perpChart.resize();
    perpChart.draw();
    futChart.resize();
    futChart.draw();
  });

  document.addEventListener("sectora:langchange", () => {
    sectRender();
    renderBook();
    renderTrades();
    renderP2p();
    setMarketLive(cryptoFailures === 0);
    renderPerpPositions();
    renderFutPositions();
    renderBotStrategies();
    renderActiveBots();
  });

  function init() {
    seedAssetsFromDefs();
    // dataReady flips true in onFirstReadyOrTick(), once the first real
    // price poll resolves — this lets pollCrypto's isFirstLoad check see
    // that first real load and re-seed candle history from the true price
    // (see applyPriceMap) instead of leaving it anchored to the rough
    // placeholder prices in COIN_DEFS/METAL_DEFS, which for lower-cap
    // assets (e.g. SUI, XRP, HYPE, PAXG, KAG) can be far enough off the
    // live price to render as one giant outlier candle against a flat
    // synthetic history.
    if (activeSymbol !== SECT_ID && !BY_ID[activeSymbol] && ASSETS[0]) activeSymbol = ASSETS[0].id;
    applySectMode();

    renderMarketTable();
    renderTicker();
    renderTrades();
    renderSwapFeed();
    renderBotStrategies();
    onDataChanged();
    for (let i = 0; i < 7; i++) pushSimSwap();
    let swapT = Date.now();
    swapFeed.forEach((sw) => { swapT -= rand(9000, 26000); sw.ts = swapT; });
    renderSwapFeed();

    tick();
    setInterval(tick, CRYPTO_POLL_MS);
    connectBinanceWs();
    pollIndices().then(() => onDataChanged());
    setInterval(() => pollIndices().then(() => onDataChanged()), INDEX_POLL_MS);

    setInterval(() => { if (dataReady) { regenerateBook(); renderBook(); } }, 2200);
    setInterval(() => { if (dataReady) pushSimTrade(); }, 2600);
    setInterval(() => { if (dataReady) pushSimSwap(); }, 5200);

    resizeChart();
    perpChart.resize();
    futChart.resize();
    drawChart();

    sectLoad();
    setInterval(sectTick, 60000);
    document.addEventListener("visibilitychange", sectTick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
