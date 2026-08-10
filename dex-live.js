/* ---- Sectora homepage "Live Markets" strip: same real, keyless price
   sources as the rest of the site (CoinGecko primary, Binance klines as
   fallback) — nothing here is fabricated. Sparkline is the real 7-day
   (CoinGecko) or 7-day hourly (Binance fallback) price history. ---- */
(() => {
  const grid = document.getElementById("dexLiveGrid");
  if (!grid) return;
  const statusEl = document.getElementById("dexLiveStatus");

  const IDS = ["bitcoin", "ethereum", "solana", "ripple", "sui", "hyperliquid"];
  const BINANCE_SYMBOLS = {
    bitcoin: "BTCUSDT",
    ethereum: "ETHUSDT",
    solana: "SOLUSDT",
    ripple: "XRPUSDT",
    sui: "SUIUSDT",
    hyperliquid: "HYPEUSDT",
  };
  const MARKETS_URL =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=" +
    IDS.join(",") +
    "&price_change_percentage=24h&sparkline=true";
  const POLL_MS = 30000;
  const GREEN = "#14e0a0";

  let liveShown = false;

  function t(key, fallback) {
    return window.SECTORA_T ? window.SECTORA_T(key) : fallback;
  }

  function fmtPrice(n) {
    if (n >= 1000) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    if (n >= 1) return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 4 });
  }

  function drawSpark(canvas, points) {
    if (!canvas || !points || points.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 240;
    const h = canvas.clientHeight || 56;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const min = Math.min.apply(null, points);
    const max = Math.max.apply(null, points);
    const range = max - min || 1;
    const pad = 4;
    const step = w / (points.length - 1);
    const toXY = (i, v) => [i * step, pad + (1 - (v - min) / range) * (h - pad * 2)];

    ctx.beginPath();
    points.forEach((v, i) => {
      const [x, y] = toXY(i, v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(20, 224, 160, 0.28)");
    grad.addColorStop(1, "rgba(20, 224, 160, 0)");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    points.forEach((v, i) => {
      const [x, y] = toXY(i, v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }

  function renderCard(card, price, changePct, points) {
    const priceEl = card.querySelector(".dexlive-price");
    const chgEl = card.querySelector(".dexlive-chg");
    const canvas = card.querySelector(".dexlive-spark");
    if (priceEl) priceEl.textContent = fmtPrice(price);
    if (chgEl && typeof changePct === "number" && isFinite(changePct)) {
      const up = changePct >= 0;
      chgEl.textContent = (up ? "+" : "") + changePct.toFixed(2) + "%";
      chgEl.classList.toggle("is-up", up);
      chgEl.classList.toggle("is-down", !up);
    }
    drawSpark(canvas, points);
  }

  function markLive() {
    if (liveShown || !statusEl) return;
    liveShown = true;
    statusEl.textContent = t("dexLive.live", "LIVE · Sectora DEX");
    statusEl.classList.add("is-live");
  }

  async function fetchCoinGecko() {
    const res = await fetch(MARKETS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("coingecko failed");
    const data = await res.json();
    let ok = false;
    data.forEach((coin) => {
      const card = grid.querySelector('[data-id="' + coin.id + '"]');
      if (!card) return;
      const points = coin.sparkline_in_7d && coin.sparkline_in_7d.price;
      if (typeof coin.current_price === "number") {
        renderCard(card, coin.current_price, coin.price_change_percentage_24h, points);
        ok = true;
      }
    });
    return ok;
  }

  async function fetchBinanceFallback() {
    let ok = false;
    await Promise.all(
      IDS.map(async (id) => {
        const card = grid.querySelector('[data-id="' + id + '"]');
        if (!card) return;
        const symbol = BINANCE_SYMBOLS[id];
        try {
          const res = await fetch(
            "https://api.binance.com/api/v3/klines?symbol=" + symbol + "&interval=1h&limit=168",
            { cache: "no-store" }
          );
          if (!res.ok) return;
          const klines = await res.json();
          const closes = klines.map((k) => parseFloat(k[4]));
          if (!closes.length) return;
          const last = closes[closes.length - 1];
          const first = closes[0];
          const changePct = ((last - first) / first) * 100;
          renderCard(card, last, changePct, closes);
          ok = true;
        } catch (e) {
          /* leave placeholder, retried next poll */
        }
      })
    );
    return ok;
  }

  async function poll() {
    try {
      const ok = await fetchCoinGecko();
      if (ok) {
        markLive();
        return;
      }
      throw new Error("empty coingecko response");
    } catch (e) {
      try {
        const ok = await fetchBinanceFallback();
        if (ok) markLive();
      } catch (e2) {
        /* keep placeholders, try again next poll */
      }
    }
  }

  poll();
  setInterval(poll, POLL_MS);
})();
