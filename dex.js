/* ---- Sectora DEX preview: trade / P2P / swap, all client-side and
   simulated. Real-time quotes come from the public CoinGecko API (with a
   Binance fallback), exactly like supply-scenarios.js on the main site —
   only order execution, the order book and P2P offers are simulated.
   No wallet ever actually connects and no funds move; every action-taking
   button opens the same "development preview" disclaimer modal. ---- */
(function () {
  "use strict";

  const root = document.querySelector(".dx");
  if (!root) return;

  function t(key, fallback) {
    return window.SECTORA_T ? window.SECTORA_T(key) : fallback;
  }

  // ---------------------------------------------------------------------
  // Assets
  // ---------------------------------------------------------------------

  const ASSETS = [
    { id: "sect", cg: null, bsym: null, name: "Sectora", ticker: "#SECT", color: "#ffffff", chain: "Sectora on Ethereum", base: 0.1, live: false, tier: 3 },
    { id: "bitcoin", cg: "bitcoin", bsym: "BTCUSDT", name: "Bitcoin", ticker: "BTC", color: "#f7931a", chain: "Bitcoin Network", base: 64940, live: false, tier: 1 },
    { id: "ethereum", cg: "ethereum", bsym: "ETHUSDT", name: "Ethereum", ticker: "ETH", color: "#8c9eff", chain: "Ethereum", base: 1897, live: false, tier: 1 },
    { id: "bitcoin-cash", cg: "bitcoin-cash", bsym: "BCHUSDT", name: "Bitcoin Cash", ticker: "BCH", color: "#0ac18e", chain: "Bitcoin Cash Network", base: 216.69, live: false, tier: 2 },
    { id: "solana", cg: "solana", bsym: "SOLUSDT", name: "Solana", ticker: "SOL", color: "#9945ff", chain: "Solana", base: 73.8, live: false, tier: 2 },
    { id: "litecoin", cg: "litecoin", bsym: "LTCUSDT", name: "Litecoin", ticker: "LTC", color: "#b0b3b8", chain: "Litecoin Network", base: 45.69, live: false, tier: 2 },
    { id: "ripple", cg: "ripple", bsym: "XRPUSDT", name: "XRP", ticker: "XRP", color: "#3fa4e0", chain: "XRP Ledger", base: 2.85, live: false, tier: 2 },
    { id: "sui", cg: "sui", bsym: "SUIUSDT", name: "Sui", ticker: "SUI", color: "#4da2ff", chain: "Sui Network", base: 3.4, live: false, tier: 3 },
    { id: "hyperliquid", cg: "hyperliquid", bsym: "HYPEUSDT", name: "Hyperliquid", ticker: "HYPE", color: "#14e0a0", chain: "Hyperliquid L1", base: 28.5, live: false, tier: 3 },
  ];
  const BY_ID = {};
  ASSETS.forEach((a) => {
    a.price = a.base;
    a.open24h = a.base;
    a.high24h = a.base;
    a.low24h = a.base;
    a.change24h = 0;
    a.vol24h = 0;
    a.candles = {};
    BY_ID[a.id] = a;
  });
  const QUOTE = "USDX";
  const COINGECKO_URL =
    "https://api.coingecko.com/api/v3/simple/price?ids=" +
    ASSETS.filter((a) => a.cg).map((a) => a.cg).join(",") +
    "&vs_currencies=usd";
  const BINANCE_URL = "https://api.binance.com/api/v3/ticker/price";
  const TIMEFRAMES = { "1m": 60000, "5m": 300000, "15m": 900000, "1h": 3600000 };

  let activeSymbol = "sect";
  let activeTf = "1m";

  // ---------------------------------------------------------------------
  // Formatters
  // ---------------------------------------------------------------------

  function fmtPrice(v) {
    if (!isFinite(v)) return "$0.00";
    if (v >= 1000) return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    if (v >= 1) return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }
  function fmtPricePlain(v) {
    return fmtPrice(v).slice(1);
  }
  function fmtAmt(v, max) {
    if (!isFinite(v)) return "0";
    return v.toLocaleString("en-US", { maximumFractionDigits: max == null ? 4 : max });
  }
  function fmtCompactUSD(v) {
    if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
    if (v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
    if (v >= 1e3) return "$" + (v / 1e3).toFixed(1) + "K";
    return "$" + v.toFixed(0);
  }
  function fmtPct(v) {
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

  // ---------------------------------------------------------------------
  // Asset icon (self-hosted: colored initials disc, no external logos)
  // ---------------------------------------------------------------------

  function iconHTML(asset, size) {
    size = size || 22;
    if (asset.id === "sect") {
      return (
        '<span class="dx-icon-disc dx-icon-sect" style="width:' + size + "px;height:" + size + 'px">' +
        '<svg viewBox="56.8 34.4 86.4 134.4"><path d="M85.6 34.4 L56.8 52.0 L56.8 122.4 L85.6 104.8 Z M82.0 68.0 L82.0 104.8 L58.5 86.4 Z" fill="#0a0a0a" fill-rule="evenodd"/><path d="M114.4 52.0 L141.6 68.0 L141.6 120.8 L114.4 135.2 L85.6 120.8 L85.6 68.0 Z M114.4 126.0 L114.4 89.2 L142.4 107.6 Z" fill="#0a0a0a" fill-rule="evenodd"/><path d="M114.4 159.6 L143.2 142.0 L143.2 71.6 L114.4 89.2 Z M117.9 126.0 L117.9 89.2 L141.4 107.6 Z" fill="#0a0a0a" fill-rule="evenodd"/></svg>' +
        "</span>"
      );
    }
    const letters = asset.ticker.replace("#", "").slice(0, 3);
    return (
      '<span class="dx-icon-disc" style="width:' + size + "px;height:" + size + "px;background:" + asset.color + ';font-size:' + Math.round(size * 0.36) + 'px">' +
      letters +
      "</span>"
    );
  }

  // ---------------------------------------------------------------------
  // Candle history — seeded synthetic backfill, then updated from live
  // ticks + a fast local random-walk so the chart never looks frozen.
  // ---------------------------------------------------------------------

  function seedCandles(asset) {
    Object.keys(TIMEFRAMES).forEach((tf) => {
      const step = TIMEFRAMES[tf];
      const n = 90;
      const vol = asset.tier === 1 ? 0.003 : asset.tier === 2 ? 0.005 : 0.008;
      let price = asset.base * rand(0.94, 1.06);
      const now = Math.floor(Date.now() / step) * step;
      const candles = [];
      for (let i = n; i >= 0; i--) {
        const openT = now - i * step;
        const open = price;
        const drift = 1 + rand(-vol, vol);
        const close = Math.max(0.00001, open * drift);
        const high = Math.max(open, close) * (1 + rand(0, vol * 0.6));
        const low = Math.min(open, close) * (1 - rand(0, vol * 0.6));
        const volume = asset.base * rand(4, 40) * (asset.tier === 1 ? 8 : asset.tier === 2 ? 2 : 1);
        candles.push({ t: openT, o: open, h: high, l: low, c: close, v: volume });
        price = close;
      }
      asset.candles[tf] = candles;
    });
    asset.price = asset.candles["1m"][asset.candles["1m"].length - 1].c;
  }
  ASSETS.forEach(seedCandles);

  function pushTick(asset, price) {
    const now = Date.now();
    Object.keys(TIMEFRAMES).forEach((tf) => {
      const step = TIMEFRAMES[tf];
      const bucket = Math.floor(now / step) * step;
      const list = asset.candles[tf];
      const last = list[list.length - 1];
      if (last && last.t === bucket) {
        last.c = price;
        if (price > last.h) last.h = price;
        if (price < last.l) last.l = price;
        last.v += asset.base * rand(0.1, 1.2);
      } else {
        list.push({ t: bucket, o: last ? last.c : price, h: price, l: price, c: price, v: asset.base * rand(1, 4) });
        if (list.length > 140) list.shift();
      }
    });
  }

  // ---------------------------------------------------------------------
  // Live price engine (CoinGecko primary, Binance fallback) + fast local
  // jitter for constant on-screen movement between polls.
  // ---------------------------------------------------------------------

  function applyPrice(asset, price, isRealTick) {
    if (!price || !isFinite(price)) return;
    asset.price = price;
    if (price > asset.high24h) asset.high24h = price;
    if (price < asset.low24h) asset.low24h = price;
    asset.change24h = ((price - asset.open24h) / asset.open24h) * 100;
    pushTick(asset, price);
    if (isRealTick) asset.live = true;
  }

  function fetchCoinGecko() {
    return fetch(COINGECKO_URL, { cache: "no-store" }).then((res) => {
      if (!res.ok) throw new Error("coingecko_http_" + res.status);
      return res.json();
    });
  }
  function fetchBinance() {
    return fetch(BINANCE_URL, { cache: "no-store" }).then((res) => {
      if (!res.ok) throw new Error("binance_http_" + res.status);
      return res.json();
    });
  }

  function pollLive() {
    fetchCoinGecko()
      .then((data) => {
        let any = false;
        ASSETS.forEach((a) => {
          if (!a.cg) return;
          const entry = data[a.cg];
          const price = entry && typeof entry.usd === "number" ? entry.usd : null;
          if (price) {
            any = true;
            applyPrice(a, price, true);
          }
        });
        if (!any) throw new Error("coingecko_empty");
      })
      .catch(() => {
        fetchBinance()
          .then((list) => {
            const bySymbol = {};
            (Array.isArray(list) ? list : []).forEach((row) => {
              bySymbol[row.symbol] = parseFloat(row.price);
            });
            ASSETS.forEach((a) => {
              if (!a.bsym) return;
              const price = bySymbol[a.bsym];
              if (price && !isNaN(price)) applyPrice(a, price, true);
            });
          })
          .catch(() => {
            /* stay on last known / simulated price */
          });
      });
  }

  function localJitter() {
    ASSETS.forEach((a) => {
      const vol = a.id === "sect" ? 0.0009 : a.tier === 1 ? 0.0006 : a.tier === 2 ? 0.0011 : 0.0016;
      const next = a.price * (1 + rand(-vol, vol));
      applyPrice(a, next, false);
    });
    onPriceTick();
  }

  // ---------------------------------------------------------------------
  // Ticker marquee
  // ---------------------------------------------------------------------

  const tickerEl = document.getElementById("dexTicker");
  const tickerDupEl = document.getElementById("dexTickerDup");

  function tickerRowHTML() {
    return ASSETS.map((a) => {
      const dir = a.change24h >= 0 ? "up" : "down";
      return (
        '<span class="dx-ticker-item dx-ticker-item--' + dir + '" data-symbol="' + a.id + '">' +
        '<span class="dx-ticker-sym">' + a.ticker + "</span>" +
        '<span class="mono">' + fmtPrice(a.price) + "</span>" +
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
  }

  // ---------------------------------------------------------------------
  // Chart (canvas candlesticks, self-hosted, no external lib)
  // ---------------------------------------------------------------------

  const chartCanvas = document.getElementById("dexChart");
  const chartCtx = chartCanvas ? chartCanvas.getContext("2d") : null;

  function resizeChart() {
    if (!chartCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = chartCanvas.clientWidth;
    const h = chartCanvas.clientHeight;
    if (!w || !h) return;
    chartCanvas.width = Math.round(w * dpr);
    chartCanvas.height = Math.round(h * dpr);
    chartCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawChart() {
    if (!chartCtx) return;
    const asset = BY_ID[activeSymbol];
    const candles = asset.candles[activeTf];
    const w = chartCanvas.clientWidth;
    const h = chartCanvas.clientHeight;
    if (!w || !h || !candles.length) return;
    chartCtx.clearRect(0, 0, w, h);

    const volH = Math.round(h * 0.16);
    const chartH = h - volH - 4;
    const visible = candles.slice(-72);
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

    // grid
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
      chartCtx.fillText(fmtPricePlain(priceAtLine), 6, py + 12);
    }

    // candles
    visible.forEach((c, i) => {
      const cx = i * slot + slot / 2;
      const up = c.c >= c.o;
      chartCtx.strokeStyle = up ? "#14e0a0" : "#ff5c6c";
      chartCtx.fillStyle = up ? "#14e0a0" : "#ff5c6c";
      chartCtx.lineWidth = 1;
      chartCtx.beginPath();
      chartCtx.moveTo(cx, y(c.h));
      chartCtx.lineTo(cx, y(c.l));
      chartCtx.stroke();
      const yo = y(c.o), yc = y(c.c);
      const top = Math.min(yo, yc);
      const bh = Math.max(1.5, Math.abs(yc - yo));
      chartCtx.fillRect(cx - bodyW / 2, top, bodyW, bh);

      const vh = (c.v / (maxVol || 1)) * (volH - 2);
      chartCtx.globalAlpha = 0.35;
      chartCtx.fillRect(cx - bodyW / 2, h - vh, bodyW, vh);
      chartCtx.globalAlpha = 1;
    });

    // current price dashed line
    const last = visible[visible.length - 1];
    const py = y(last.c);
    chartCtx.setLineDash([4, 4]);
    chartCtx.strokeStyle = last.c >= last.o ? "rgba(20,224,160,0.7)" : "rgba(255,92,108,0.7)";
    chartCtx.beginPath();
    chartCtx.moveTo(0, py + 0.5);
    chartCtx.lineTo(w, py + 0.5);
    chartCtx.stroke();
    chartCtx.setLineDash([]);
    const label = fmtPricePlain(last.c);
    chartCtx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--font-mono");
    const tw = chartCtx.measureText(label).width + 10;
    chartCtx.fillStyle = last.c >= last.o ? "#14e0a0" : "#ff5c6c";
    chartCtx.fillRect(w - tw, py - 8, tw, 16);
    chartCtx.fillStyle = "#04120c";
    chartCtx.fillText(label, w - tw + 5, py + 4);
  }

  // ---------------------------------------------------------------------
  // Order book (synthetic depth around live mid price)
  // ---------------------------------------------------------------------

  const bookAsksEl = document.getElementById("dexBookAsks");
  const bookBidsEl = document.getElementById("dexBookBids");
  const bookSpreadEl = document.getElementById("dexBookSpread");

  function buildBookSide(asset, mid, isAsk) {
    const levels = [];
    const rows = 12;
    const tickPct = asset.tier === 1 ? 0.00012 : asset.tier === 2 ? 0.0006 : 0.0018;
    let cum = 0;
    for (let i = 1; i <= rows; i++) {
      const drift = 1 + tickPct * i * (isAsk ? 1 : -1) + rand(-tickPct * 0.2, tickPct * 0.2);
      const price = mid * drift;
      const size = rand(0.02, asset.tier === 1 ? 1.2 : asset.tier === 2 ? 40 : 800) * (1 + rand(0, 1.4));
      cum += size;
      levels.push({ price, size, cum });
    }
    return isAsk ? levels.reverse() : levels;
  }

  let bookState = { asks: [], bids: [] };
  function regenerateBook() {
    const asset = BY_ID[activeSymbol];
    bookState.asks = buildBookSide(asset, asset.price, true);
    bookState.bids = buildBookSide(asset, asset.price, false);
  }
  function renderBook() {
    const asset = BY_ID[activeSymbol];
    if (!bookState.asks.length) regenerateBook();
    const maxCum = Math.max(
      bookState.asks[bookState.asks.length - 1] ? bookState.asks[bookState.asks.length - 1].cum : 1,
      bookState.bids[bookState.bids.length - 1] ? bookState.bids[bookState.bids.length - 1].cum : 1
    );
    function rowHTML(level, isAsk) {
      const pct = Math.min(100, (level.cum / maxCum) * 100);
      return (
        '<div class="dx-book-row dx-book-row--' + (isAsk ? "ask" : "bid") + '">' +
        '<span class="dx-book-depth" style="width:' + pct + '%"></span>' +
        '<span class="dx-book-price mono">' + fmtPricePlain(level.price) + "</span>" +
        '<span class="dx-book-size mono">' + fmtAmt(level.size, asset.tier === 1 ? 3 : 2) + "</span>" +
        '<span class="dx-book-total mono">' + fmtAmt(level.cum, asset.tier === 1 ? 2 : 1) + "</span>" +
        "</div>"
      );
    }
    if (bookAsksEl) bookAsksEl.innerHTML = bookState.asks.map((l) => rowHTML(l, true)).join("");
    if (bookBidsEl) bookBidsEl.innerHTML = bookState.bids.map((l) => rowHTML(l, false)).join("");
    const midEl = document.querySelector("#dexBookMid .dx-book-mid-price");
    if (midEl) {
      midEl.textContent = fmtPrice(asset.price);
      midEl.className = "dx-book-mid-price mono " + (asset.change24h >= 0 ? "is-up" : "is-down");
    }
    if (bookSpreadEl) {
      const bestAsk = bookState.asks[bookState.asks.length - 1];
      const bestBid = bookState.bids[0];
      if (bestAsk && bestBid) {
        const spread = bestAsk.price - bestBid.price;
        const bp = (spread / asset.price) * 10000;
        bookSpreadEl.textContent = t("dex.trade.orderbook.spread", "spread") + " " + fmtPricePlain(spread) + " · " + bp.toFixed(1) + "bp";
      }
    }
  }

  // ---------------------------------------------------------------------
  // Recent trades tape
  // ---------------------------------------------------------------------

  const tradesListEl = document.getElementById("dexTradesList");
  let tradeTape = [];
  function pushSimTrade() {
    const asset = BY_ID[activeSymbol];
    const side = Math.random() > 0.5 ? "buy" : "sell";
    const drift = 1 + rand(-0.0006, 0.0006);
    const price = asset.price * drift;
    const size = rand(0.01, asset.tier === 1 ? 0.6 : asset.tier === 2 ? 20 : 300);
    tradeTape.unshift({ price, size, side, ts: Date.now() });
    if (tradeTape.length > 40) tradeTape.length = 40;
    renderTrades();
  }
  function renderTrades() {
    if (!tradesListEl) return;
    const asset = BY_ID[activeSymbol];
    tradesListEl.innerHTML = tradeTape
      .map(
        (tr) =>
          '<div class="dx-trade-row dx-trade-row--' + tr.side + '">' +
          '<span class="dx-book-price mono">' + fmtPricePlain(tr.price) + "</span>" +
          '<span class="dx-book-size mono">' + fmtAmt(tr.size, asset.tier === 1 ? 3 : 2) + "</span>" +
          '<span class="dx-trade-time mono">' + fmtClock(tr.ts) + "</span>" +
          "</div>"
      )
      .join("");
  }

  // ---------------------------------------------------------------------
  // Market list (all pairs)
  // ---------------------------------------------------------------------

  const marketTableEl = document.getElementById("dexMarketTable");
  function renderMarketTable() {
    if (!marketTableEl) return;
    marketTableEl.innerHTML = ASSETS.map((a) => {
      const up = a.change24h >= 0;
      return (
        '<button class="dx-market-row' + (a.id === activeSymbol ? " is-active" : "") + '" type="button" data-symbol="' + a.id + '">' +
        '<span class="dx-market-row-name">' + iconHTML(a, 20) + '<span class="dx-market-row-ticker">' + a.ticker + "/" + QUOTE + "</span></span>" +
        '<span class="mono">' + fmtPrice(a.price) + "</span>" +
        '<span class="mono ' + (up ? "is-up" : "is-down") + '">' + fmtPct(a.change24h) + "</span>" +
        '<span class="mono dx-market-row-vol">' + fmtCompactUSD(a.vol24h) + "</span>" +
        "</button>"
      );
    }).join("");
    marketTableEl.querySelectorAll("[data-symbol]").forEach((btn) => {
      btn.addEventListener("click", () => setSymbol(btn.dataset.symbol));
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
    const a = BY_ID[activeSymbol];
    if (symbolIconEl) symbolIconEl.innerHTML = iconHTML(a, 30);
    if (symbolPairEl) symbolPairEl.textContent = a.ticker + "-" + QUOTE;
    if (symbolFullEl) symbolFullEl.textContent = a.name;
    if (statMarkEl) statMarkEl.textContent = fmtPrice(a.price);
    if (statChangeEl) {
      statChangeEl.textContent = fmtPct(a.change24h);
      statChangeEl.className = "dx-stat-value mono " + (a.change24h >= 0 ? "is-up" : "is-down");
    }
    if (statHighEl) statHighEl.textContent = fmtPrice(a.high24h);
    if (statLowEl) statLowEl.textContent = fmtPrice(a.low24h);
    if (statVolEl) statVolEl.textContent = fmtCompactUSD(a.vol24h);
    if (amountSuffixEl) amountSuffixEl.textContent = a.ticker;
    if (priceInputEl && !priceInputEl.dataset.userEdited) priceInputEl.value = fmtPricePlain(a.price).replace(/,/g, "");
    updateFormTotals();
    document.title = a.ticker + "/" + QUOTE + " " + fmtPrice(a.price) + " · Sectora DEX";
  }

  function setSymbol(id) {
    if (!BY_ID[id] || id === activeSymbol) return;
    activeSymbol = id;
    if (priceInputEl) delete priceInputEl.dataset.userEdited;
    bookState = { asks: [], bids: [] };
    tradeTape = [];
    renderSymbolHeader();
    renderMarketTable();
    renderBook();
    renderTrades();
    resizeChart();
    drawChart();
  }

  document.getElementById("dexSymbolBtn").addEventListener("click", (e) => {
    openPicker(e.currentTarget, setSymbol);
  });

  // ---------------------------------------------------------------------
  // Asset picker popover (reused by trade symbol + swap tokens)
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
  function openPicker(anchor, onPick) {
    closePicker();
    pickerEl = document.createElement("div");
    pickerEl.className = "dx-picker";
    pickerEl.innerHTML = ASSETS.map(
      (a) =>
        '<button type="button" class="dx-picker-row" data-symbol="' + a.id + '">' +
        iconHTML(a, 22) +
        '<span class="dx-picker-name">' + a.name + '<span class="dx-picker-ticker">' + a.ticker + "</span></span>" +
        '<span class="mono">' + fmtPrice(a.price) + "</span>" +
        "</button>"
    ).join("");
    root.appendChild(pickerEl);
    const r = anchor.getBoundingClientRect();
    const top = r.bottom + window.scrollY + 6;
    let left = r.left + window.scrollX;
    const maxLeft = window.scrollX + document.documentElement.clientWidth - pickerEl.offsetWidth - 12;
    pickerEl.style.top = top + "px";
    pickerEl.style.left = Math.min(left, Math.max(12, maxLeft)) + "px";
    pickerEl.querySelectorAll("[data-symbol]").forEach((btn) => {
      btn.addEventListener("click", () => {
        onPick(btn.dataset.symbol);
        closePicker();
      });
    });
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
  const SIM_BALANCE_BASE = {};
  ASSETS.forEach((a) => { SIM_BALANCE_BASE[a.id] = a.id === "sect" ? 12000 : a.tier === 1 ? 0.35 : a.tier === 2 ? 25 : 900; });

  function currentTradePrice() {
    if (formType === "limit" && priceInputEl && priceInputEl.value) {
      const v = parseFloat(priceInputEl.value.replace(/,/g, ""));
      if (!isNaN(v) && v > 0) return v;
    }
    return BY_ID[activeSymbol].price;
  }

  function updateFormTotals() {
    const asset = BY_ID[activeSymbol];
    const amt = parseFloat((amountInputEl && amountInputEl.value || "0").replace(/,/g, "")) || 0;
    const price = currentTradePrice();
    if (orderValueEl) orderValueEl.textContent = "$" + fmtAmt(amt * price, 2);
    if (availableEl) {
      availableEl.textContent =
        formSide === "buy" ? fmtAmt(SIM_BALANCE_QUOTE, 2) + " " + QUOTE : fmtAmt(SIM_BALANCE_BASE[asset.id], 4) + " " + asset.ticker;
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
      const pct = Number(amountRangeEl.value) / 100;
      if (formSide === "buy") {
        const amt = (SIM_BALANCE_QUOTE * pct) / currentTradePrice();
        if (amountInputEl) amountInputEl.value = fmtAmt(amt, 4);
      } else {
        const amt = SIM_BALANCE_BASE[asset.id] * pct;
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

  function populateP2pAssetSelect() {
    if (!p2pAssetSelect) return;
    p2pAssetSelect.innerHTML = ASSETS.map((a) => '<option value="' + a.id + '">' + a.ticker + " · " + a.name + "</option>").join("");
    p2pAssetSelect.value = "sect";
  }

  function paymentChip(method) {
    const key = method === "bank" ? "dex.p2p.payBank" : method === "card" ? "dex.p2p.payCard" : "dex.p2p.payWallet";
    const fallback = method === "bank" ? "Bank Transfer" : method === "card" ? "Card" : "Wallet Transfer";
    return '<span class="dx-chip">' + t(key, fallback) + "</span>";
  }

  function renderP2p() {
    if (!p2pListEl) return;
    const assetId = p2pAssetSelect ? p2pAssetSelect.value : "sect";
    const paymentFilter = p2pPaymentSelect ? p2pPaymentSelect.value : "";
    const asset = BY_ID[assetId];
    const methods = ["bank", "card", "wallet"];
    const rows = [];
    for (let i = 0; i < 10; i++) {
      const spreadPct = rand(0.002, 0.028) * (p2pSide === "buy" ? 1 : -1);
      const price = asset.price * (1 + spreadPct);
      const rowMethods = [methods[i % 3], methods[(i + 1) % 3]].filter((m, idx, arr) => arr.indexOf(m) === idx);
      if (paymentFilter && rowMethods.indexOf(paymentFilter) === -1) continue;
      const avail = rand(200, asset.tier === 1 ? 40000 : 15000);
      const limMin = Math.round(avail * 0.02);
      const limMax = Math.round(avail * rand(0.4, 0.95));
      rows.push({
        name: TRADER_NAMES[(i * 3 + assetId.length) % TRADER_NAMES.length],
        rating: (96 + (i % 4)).toFixed(0),
        trades: 80 + i * 37 + (assetId.length % 20),
        price,
        avail,
        limMin,
        limMax,
        methods: rowMethods,
      });
    }
    p2pListEl.innerHTML = rows
      .map(
        (r) =>
          '<div class="dx-p2p-row">' +
          '<span class="dx-p2p-trader"><span class="dx-p2p-avatar">' + r.name.charAt(0) + "</span>" +
          '<span><span class="dx-p2p-trader-name">' + r.name + '</span><span class="dx-p2p-trader-meta">' +
          r.rating + "% &middot; " + r.trades + " " + t("dex.p2p.trades", "trades") + "</span></span></span>" +
          '<span class="mono dx-p2p-price">' + fmtPrice(r.price) + "</span>" +
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
  let swapTo = "sect";
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
    if (swapFromIconEl) swapFromIconEl.innerHTML = iconHTML(from, 24);
    if (swapToIconEl) swapToIconEl.innerHTML = iconHTML(to, 24);
    if (swapFromSymbolEl) swapFromSymbolEl.textContent = from.ticker;
    if (swapToSymbolEl) swapToSymbolEl.textContent = to.ticker;
    if (swapFromChainEl) swapFromChainEl.textContent = from.chain;
    if (swapToChainEl) swapToChainEl.textContent = to.chain;
    if (swapFromBalanceEl) swapFromBalanceEl.textContent = fmtAmt(SIM_BALANCE_BASE[from.id], 4);
    if (swapToBalanceEl) swapToBalanceEl.textContent = fmtAmt(SIM_BALANCE_BASE[to.id], 4);
    const rate = from.price / to.price;
    if (swapRateEl) swapRateEl.textContent = "1 " + from.ticker + " = " + fmtAmt(rate, rate >= 1 ? 2 : 6) + " " + to.ticker;
    const feeUsd = from.tier === 1 ? rand(0.8, 3.2) : from.tier === 2 ? rand(0.05, 0.4) : rand(0.01, 0.08);
    if (swapFeeEl) swapFeeEl.textContent = "~$" + feeUsd.toFixed(2);
    recomputeSwapOutput();
  }
  function recomputeSwapOutput() {
    const from = BY_ID[swapFrom], to = BY_ID[swapTo];
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
    const a = pick(ASSETS.filter((x) => x.id !== "sect"));
    const b = Math.random() > 0.5 ? BY_ID.sect : pick(ASSETS.filter((x) => x.id !== a.id));
    const amt = rand(0.05, a.tier === 1 ? 1.4 : a.tier === 2 ? 60 : 900);
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
          '<span class="mono">' + fmtAmt(s.out, 3) + " " + s.b.ticker + "</span>" +
          '<span class="dx-swap-feed-time mono">' + fmtClock(s.ts) + "</span>" +
          "</div>"
      )
      .join("");
  }

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

  [document.getElementById("dexConnectBtn"), submitBtn, document.getElementById("dexSwapBtn")].forEach((btn) => {
    if (btn) btn.addEventListener("click", openModal);
  });

  // ---------------------------------------------------------------------
  // Ticks / render loop
  // ---------------------------------------------------------------------

  function onPriceTick() {
    renderTicker();
    renderMarketTable();
    if (BY_ID[activeSymbol]) {
      renderSymbolHeader();
      drawChart();
    }
  }

  window.addEventListener("resize", () => {
    resizeChart();
    drawChart();
  });

  document.addEventListener("sectora:langchange", () => {
    renderBook();
    renderTrades();
    renderP2p();
  });

  function init() {
    ASSETS.forEach((a) => {
      a.vol24h = a.base * a.price * rand(4000, a.tier === 1 ? 60000 : a.tier === 2 ? 9000 : 1800);
    });
    populateP2pAssetSelect();
    renderTicker();
    renderMarketTable();
    renderSymbolHeader();
    regenerateBook();
    renderBook();
    for (let i = 0; i < 14; i++) pushSimTrade();
    renderTrades();
    renderSwapSides();
    for (let i = 0; i < 6; i++) pushSimSwap();
    renderP2p();
    resizeChart();
    drawChart();

    pollLive();
    setInterval(pollLive, 12000);
    setInterval(localJitter, 1500);
    setInterval(() => { regenerateBook(); renderBook(); }, 2200);
    setInterval(pushSimTrade, 2600);
    setInterval(pushSimSwap, 5200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
