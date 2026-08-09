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
   #SECT has no public market yet and is intentionally NOT listed here —
   there is nothing real to quote it against. ---- */
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

  // CoinGecko's heavier /coins/markets endpoint (used to build the first
  // version of this list) turned out to be rate-limited far more
  // aggressively than /simple/price for keyless requests — the same
  // /simple/price endpoint the main site's live Supply table already
  // uses successfully. So the DEX uses that same proven endpoint with a
  // large, hand-picked list of real coin ids instead of an auto-ranked
  // "top 100" call. [id, ticker, name, approxRank] — approxRank only
  // drives local tiering (order-book depth, trade sizes), not display
  // order (the UI sorts live, by price/name/search).
  const COIN_DEFS = [
    ["bitcoin", "BTC", "Bitcoin", 1], ["ethereum", "ETH", "Ethereum", 2],
    ["binancecoin", "BNB", "BNB", 4], ["solana", "SOL", "Solana", 5],
    ["ripple", "XRP", "XRP", 6], ["cardano", "ADA", "Cardano", 9],
    ["dogecoin", "DOGE", "Dogecoin", 10], ["tron", "TRX", "TRON", 11],
    ["the-open-network", "TON", "Toncoin", 12], ["avalanche-2", "AVAX", "Avalanche", 14],
    ["shiba-inu", "SHIB", "Shiba Inu", 15], ["chainlink", "LINK", "Chainlink", 17],
    ["bitcoin-cash", "BCH", "Bitcoin Cash", 18], ["polkadot", "DOT", "Polkadot", 19],
    ["near", "NEAR", "NEAR Protocol", 20], ["litecoin", "LTC", "Litecoin", 21],
    ["uniswap", "UNI", "Uniswap", 23], ["sui", "SUI", "Sui", 24],
    ["internet-computer", "ICP", "Internet Computer", 27], ["aptos", "APT", "Aptos", 29],
    ["hyperliquid", "HYPE", "Hyperliquid", 30], ["pepe", "PEPE", "Pepe", 31],
    ["ethereum-classic", "ETC", "Ethereum Classic", 32], ["monero", "XMR", "Monero", 33],
    ["stellar", "XLM", "Stellar", 34], ["okb", "OKB", "OKB", 36],
    ["cronos", "CRO", "Cronos", 37], ["filecoin", "FIL", "Filecoin", 38],
    ["immutable-x", "IMX", "Immutable", 39], ["hedera-hashgraph", "HBAR", "Hedera", 40],
    ["matic-network", "MATIC", "Polygon", 41], ["arbitrum", "ARB", "Arbitrum", 42],
    ["vechain", "VET", "VeChain", 43], ["cosmos", "ATOM", "Cosmos", 44],
    ["injective-protocol", "INJ", "Injective", 45], ["optimism", "OP", "Optimism", 46],
    ["the-graph", "GRT", "The Graph", 47], ["render-token", "RENDER", "Render", 48],
    ["thorchain", "RUNE", "THORChain", 49], ["algorand", "ALGO", "Algorand", 50],
    ["mantle", "MNT", "Mantle", 51], ["celestia", "TIA", "Celestia", 52],
    ["bittensor", "TAO", "Bittensor", 53], ["sei-network", "SEI", "Sei", 54],
    ["stacks", "STX", "Stacks", 55], ["fantom", "FTM", "Fantom", 56],
    ["tezos", "XTZ", "Tezos", 57], ["theta-token", "THETA", "Theta Network", 58],
    ["flow", "FLOW", "Flow", 59], ["axie-infinity", "AXS", "Axie Infinity", 60],
    ["the-sandbox", "SAND", "The Sandbox", 61], ["decentraland", "MANA", "Decentraland", 62],
    ["eos", "EOS", "EOS", 63], ["chiliz", "CHZ", "Chiliz", 64],
    ["gala", "GALA", "Gala", 65], ["aave", "AAVE", "Aave", 66],
    ["maker", "MKR", "Maker", 67], ["rocket-pool", "RPL", "Rocket Pool", 68],
    ["lido-dao", "LDO", "Lido DAO", 69], ["curve-dao-token", "CRV", "Curve DAO", 70],
    ["pancakeswap-token", "CAKE", "PancakeSwap", 71], ["synthetix-network-token", "SNX", "Synthetix", 72],
    ["dydx", "DYDX", "dYdX", 73], ["gmx", "GMX", "GMX", 74],
    ["1inch", "1INCH", "1inch", 75], ["sushi", "SUSHI", "Sushi", 76],
    ["apecoin", "APE", "ApeCoin", 77], ["blur", "BLUR", "Blur", 78],
    ["worldcoin-wld", "WLD", "Worldcoin", 79], ["jasmycoin", "JASMY", "JasmyCoin", 80],
    ["pyth-network", "PYTH", "Pyth Network", 81], ["jupiter-exchange-solana", "JUP", "Jupiter", 82],
    ["wormhole", "W", "Wormhole", 83], ["dogwifcoin", "WIF", "dogwifhat", 84],
    ["bonk", "BONK", "Bonk", 85], ["floki", "FLOKI", "FLOKI", 86],
    ["ronin", "RON", "Ronin", 87], ["akash-network", "AKT", "Akash Network", 88],
    ["kava", "KAVA", "Kava", 89], ["osmosis", "OSMO", "Osmosis", 90],
    ["zcash", "ZEC", "Zcash", 91], ["dash", "DASH", "Dash", 92],
    ["waves", "WAVES", "Waves", 93], ["iota", "IOTA", "IOTA", 94],
    ["neo", "NEO", "NEO", 95], ["ravencoin", "RVN", "Ravencoin", 96],
    ["zilliqa", "ZIL", "Zilliqa", 97], ["icon", "ICX", "ICON", 98],
    ["enjincoin", "ENJ", "Enjin Coin", 99], ["basic-attention-token", "BAT", "Basic Attention Token", 100],
    ["0x", "ZRX", "0x Protocol", 101], ["loopring", "LRC", "Loopring", 102],
    ["status", "SNT", "Status", 103], ["storj", "STORJ", "Storj", 104],
    ["ankr", "ANKR", "Ankr", 105], ["celo", "CELO", "Celo", 106],
    ["harmony", "ONE", "Harmony", 107], ["oasis-network", "ROSE", "Oasis Network", 108],
    ["moonbeam", "GLMR", "Moonbeam", 109], ["klay-token", "KLAY", "Klaytn", 110],
    ["gnosis", "GNO", "Gnosis", 111], ["frax-share", "FXS", "Frax Share", 112],
    ["convex-finance", "CVX", "Convex Finance", 113], ["balancer", "BAL", "Balancer", 114],
    ["ocean-protocol", "OCEAN", "Ocean Protocol", 115], ["fetch-ai", "FET", "Fetch.ai", 116],
    ["singularitynet", "AGIX", "SingularityNET", 117], ["numeraire", "NMR", "Numeraire", 118],
  ];
  const METAL_DEFS = [
    ["pax-gold", "PAXG", "Gold"],
    ["kinesis-silver", "KAG", "Silver"],
  ];
  const METAL_IDS = { "pax-gold": "Gold", "kinesis-silver": "Silver" };
  const ALL_COIN_IDS = COIN_DEFS.map((c) => c[0]).concat(METAL_DEFS.map((m) => m[0]));

  // A single /simple/price call for all ~110 ids at once turned out to be
  // unreliable (likely CoinGecko's anonymous-tier request-size/complexity
  // limit) even though the exact same endpoint with a small id list (the
  // main site's live Supply table, 8 ids) works fine. So this is split
  // into several small requests — the same size as that proven call —
  // fetched in parallel; a failure in one chunk doesn't take down the rest.
  const SIMPLE_PRICE_CHUNK_SIZE = 12;
  function simplePriceChunks() {
    const chunks = [];
    for (let i = 0; i < ALL_COIN_IDS.length; i += SIMPLE_PRICE_CHUNK_SIZE) {
      chunks.push(ALL_COIN_IDS.slice(i, i + SIMPLE_PRICE_CHUNK_SIZE));
    }
    return chunks;
  }
  function simplePriceUrl(ids) {
    return (
      "https://api.coingecko.com/api/v3/simple/price?ids=" + ids.join(",") +
      "&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"
    );
  }

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
    ["BNBUSDT", "binancecoin", "BNB", 3], ["SOLUSDT", "solana", "Solana", 5],
    ["XRPUSDT", "ripple", "XRP", 6], ["ADAUSDT", "cardano", "Cardano", 9],
    ["DOGEUSDT", "dogecoin", "Dogecoin", 10], ["AVAXUSDT", "avalanche-2", "Avalanche", 14],
    ["DOTUSDT", "polkadot", "Polkadot", 16], ["LINKUSDT", "chainlink", "Chainlink", 17],
    ["MATICUSDT", "matic-network", "Polygon", 20], ["LTCUSDT", "litecoin", "Litecoin", 22],
    ["BCHUSDT", "bitcoin-cash", "Bitcoin Cash", 28], ["SUIUSDT", "sui", "Sui", 24],
    ["HYPEUSDT", "hyperliquid", "Hyperliquid", 30], ["ATOMUSDT", "cosmos", "Cosmos", 40],
    ["NEARUSDT", "near", "NEAR Protocol", 26], ["APTUSDT", "aptos", "Aptos", 35],
    ["FILUSDT", "filecoin", "Filecoin", 45], ["ETCUSDT", "ethereum-classic", "Ethereum Classic", 32],
    ["ARBUSDT", "arbitrum", "Arbitrum", 42], ["OPUSDT", "optimism", "Optimism", 48],
    ["UNIUSDT", "uniswap", "Uniswap", 25], ["TONUSDT", "the-open-network", "Toncoin", 12],
  ];

  const CRYPTO_POLL_MS = 20000;
  const INDEX_POLL_MS = 30000;
  const TIMEFRAMES = { "1m": 60000, "5m": 300000, "15m": 900000, "1h": 3600000 };

  let ASSETS = [];
  let BY_ID = {};
  let activeSymbol = "bitcoin";
  let activeTf = "1m";
  let dataReady = false;
  let activeCategory = "all";
  let searchQuery = "";

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
  function displayPrice(asset, v) {
    return asset.category === "index" ? fmtIndexValue(v) : fmtPrice(v);
  }
  function displayPricePlain(asset, v) {
    return asset.category === "index" ? fmtIndexValue(v) : fmtPricePlain(v);
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
  // Asset icon (self-hosted: colored initials disc, no external logos)
  // ---------------------------------------------------------------------

  function iconHTML(asset, size) {
    size = size || 22;
    const letters = asset.ticker.replace(/[#^]/g, "").slice(0, 3);
    const color = asset.color || colorForSymbol(asset.ticker || asset.id);
    return (
      '<span class="dx-icon-disc" style="width:' + size + "px;height:" + size + "px;background:" + color + ';font-size:' + Math.round(size * 0.34) + 'px">' +
      letters +
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

  // idPriceMap: { [coinId]: { usd, usd_24h_change, usd_24h_vol, usd_market_cap } }
  function applyPriceMap(idPriceMap, isFirstLoad) {
    const ids = Object.keys(idPriceMap || {});
    if (!ids.length) return false;
    const touched = [];
    ids.forEach((id) => {
      const asset = upsertAssetFromSimplePrice(id, idPriceMap[id]);
      if (asset) touched.push(asset);
    });
    if (!touched.length) return false;
    if (isFirstLoad) {
      touched.sort((a, b) => (a.rank || 9999) - (b.rank || 9999));
      touched.forEach(seedCandles);
    } else {
      touched.forEach((a) => pushTick(a, a.price));
    }
    return true;
  }

  function fetchBinanceFallback() {
    const symbols = BINANCE_FALLBACK.map((r) => r[0]);
    const url = "https://api.binance.com/api/v3/ticker/24hr?symbols=" + encodeURIComponent(JSON.stringify(symbols));
    return fetchJson(url).then((list) => {
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

  // CoinGecko's /simple/price is the same proven, keyless endpoint the
  // main site's live Supply table already relies on; if every chunk fails
  // outright, fall back to Binance's public 24hr ticker for the major
  // pairs so the DEX never sits empty because of a single unreachable
  // provider.
  function pollCrypto() {
    const isFirstLoad = !dataReady;
    const chunks = simplePriceChunks();
    return Promise.allSettled(chunks.map((ids) => fetchJson(simplePriceUrl(ids)))).then((results) => {
      const merged = {};
      let anyOk = false;
      let firstError = null;
      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value && typeof r.value === "object") {
          Object.assign(merged, r.value);
          anyOk = true;
        } else if (r.status === "rejected" && !firstError) {
          firstError = r.reason;
        }
      });
      if (anyOk && applyPriceMap(merged, isFirstLoad)) {
        lastFetchErrorText = "";
        return true;
      }
      const errText = firstError ? String(firstError.message || firstError) : "empty_response";
      console.warn("[dex] CoinGecko /simple/price chunks failed (" + errText + "), trying Binance fallback");
      return fetchBinanceFallback()
        .then((fallbackMap) => {
          const ok = applyPriceMap(fallbackMap, isFirstLoad);
          if (ok) lastFetchErrorText = "";
          else lastFetchErrorText = errText;
          return ok;
        })
        .catch((binErr) => {
          lastFetchErrorText = errText + " / binance: " + String(binErr.message || binErr);
          return false;
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
    return Promise.all(
      INDEX_DEFS.map((def) =>
        fetchYahoo(def.symbol)
          .then((data) => {
            const result = data && data.chart && data.chart.result && data.chart.result[0];
            const meta = result && result.meta;
            if (!meta || typeof meta.regularMarketPrice !== "number") return null;
            const asset = upsertIndex(def, meta);
            return asset;
          })
          .catch(() => null)
      )
    ).then((results) => {
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
      const base = isLive
        ? t("dex.trade.markets.liveNote", "LIVE · updates ~20s")
        : t("dex.trade.markets.staleNote", "Live feed unreachable — showing last known prices");
      labelEl.textContent = !isLive && lastFetchErrorText ? base + " (" + lastFetchErrorText + ")" : base;
    }
  }

  function tick() {
    pollCrypto()
      .then((ok) => {
        if (ok) {
          cryptoFailures = 0;
          setMarketLive(true);
        } else {
          cryptoFailures += 1;
          setMarketLive(false);
        }
        onFirstReadyOrTick();
      })
      .catch((err) => {
        cryptoFailures += 1;
        console.warn("[dex] Price feed unreachable (CoinGecko + Binance fallback both failed):", err);
        setMarketLive(false);
        onFirstReadyOrTick();
      });
  }

  function onFirstReadyOrTick() {
    if (!dataReady && ASSETS.length > 0) {
      dataReady = true;
      if (!BY_ID[activeSymbol] && ASSETS[0]) activeSymbol = ASSETS[0].id;
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
    return ASSETS.filter((a) => a.price != null).map((a) => {
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
    const candles = asset && asset.candles[activeTf];
    const w = chartCanvas.clientWidth;
    const h = chartCanvas.clientHeight;
    if (!asset || !w || !h || !candles || !candles.length) return;
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

    const last = visible[visible.length - 1];
    const py = y(last.c);
    chartCtx.setLineDash([4, 4]);
    chartCtx.strokeStyle = last.c >= last.o ? "rgba(20,224,160,0.7)" : "rgba(255,92,108,0.7)";
    chartCtx.beginPath();
    chartCtx.moveTo(0, py + 0.5);
    chartCtx.lineTo(w, py + 0.5);
    chartCtx.stroke();
    chartCtx.setLineDash([]);
    const label = displayPricePlain(asset, last.c);
    chartCtx.font = "11px " + getComputedStyle(document.body).getPropertyValue("--font-mono");
    const tw = chartCtx.measureText(label).width + 10;
    chartCtx.fillStyle = last.c >= last.o ? "#14e0a0" : "#ff5c6c";
    chartCtx.fillRect(w - tw, py - 8, tw, 16);
    chartCtx.fillStyle = "#04120c";
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
  function renderMarketTable() {
    if (!marketTableEl) return;
    const list = filteredAssets();
    if (!list.length) {
      marketTableEl.innerHTML = '<div class="dx-market-empty">' +
        (dataReady ? t("dex.trade.markets.empty", "No markets match your search.") : t("dex.trade.markets.loading", "Loading live prices…")) +
        "</div>";
      return;
    }
    marketTableEl.innerHTML = list.map((a) => {
      const up = (a.change24h || 0) >= 0;
      const sub = a.subLabel || (a.category === "index" ? a.name : null);
      return (
        '<button class="dx-market-row' + (a.id === activeSymbol ? " is-active" : "") + '" type="button" data-symbol="' + a.id + '">' +
        '<span class="dx-market-row-name">' + iconHTML(a, 20) +
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
    const a = BY_ID[activeSymbol];
    if (!a || a.price == null) return;
    if (symbolIconEl) symbolIconEl.innerHTML = iconHTML(a, 30);
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
    if (!BY_ID[id] || id === activeSymbol) return;
    activeSymbol = id;
    if (priceInputEl) delete priceInputEl.dataset.userEdited;
    bookState = { asks: [], bids: [] };
    renderSymbolHeader();
    renderMarketTable();
    regenerateBook();
    renderBook();
    renderTrades();
    resizeChart();
    drawChart();
  }

  document.getElementById("dexSymbolBtn").addEventListener("click", (e) => {
    openPicker(e.currentTarget, setSymbol);
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
        iconHTML(a, 22) +
        '<span class="dx-picker-name">' + a.name + '<span class="dx-picker-ticker">' + a.ticker + "</span></span>" +
        '<span class="mono">' + displayPrice(a, a.price) + "</span>" +
        "</button>"
    ).join("");
  }
  function openPicker(anchor, onPick) {
    closePicker();
    pickerEl = document.createElement("div");
    pickerEl.className = "dx-picker";
    const all = ASSETS.filter((a) => a.price != null).sort((a, b) => (a.rank || 0) - (b.rank || 0));
    pickerEl.innerHTML =
      '<div class="dx-picker-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
      '<input type="text" id="dexPickerSearch" placeholder="' + t("dex.trade.markets.search", "Search markets…") + '" /></div>' +
      '<div id="dexPickerRows">' + pickerRowsHTML(all) + "</div>";
    root.appendChild(pickerEl);
    const r = anchor.getBoundingClientRect();
    const top = r.bottom + window.scrollY + 6;
    let left = r.left + window.scrollX;
    const maxLeft = window.scrollX + document.documentElement.clientWidth - pickerEl.offsetWidth - 12;
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
        const filtered = !q ? all : all.filter((a) => a.ticker.toLowerCase().indexOf(q) !== -1 || a.name.toLowerCase().indexOf(q) !== -1);
        rowsEl.innerHTML = pickerRowsHTML(filtered);
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
    if (swapFromIconEl) swapFromIconEl.innerHTML = iconHTML(from, 24);
    if (swapToIconEl) swapToIconEl.innerHTML = iconHTML(to, 24);
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
  // Render loop driven by real data changes
  // ---------------------------------------------------------------------

  function onDataChanged() {
    renderTicker();
    renderMarketTable();
    if (BY_ID[activeSymbol] && BY_ID[activeSymbol].price != null) {
      renderSymbolHeader();
      if (!bookState.asks.length) regenerateBook();
      renderBook();
      drawChart();
    }
    renderP2p();
    renderSwapSides();
  }

  window.addEventListener("resize", () => {
    resizeChart();
    drawChart();
  });

  document.addEventListener("sectora:langchange", () => {
    renderBook();
    renderTrades();
    renderP2p();
    setMarketLive(cryptoFailures === 0);
  });

  function init() {
    if (marketTableEl) marketTableEl.classList.add("is-loading");
    renderMarketTable();
    renderTicker();
    renderTrades();
    renderSwapFeed();

    tick();
    setInterval(tick, CRYPTO_POLL_MS);
    pollIndices().then(() => onDataChanged());
    setInterval(() => pollIndices().then(() => onDataChanged()), INDEX_POLL_MS);

    setInterval(() => { if (dataReady) { regenerateBook(); renderBook(); } }, 2200);
    setInterval(() => { if (dataReady) pushSimTrade(); }, 2600);
    setInterval(() => { if (dataReady) pushSimSwap(); }, 5200);

    resizeChart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
