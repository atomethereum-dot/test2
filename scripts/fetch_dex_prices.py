#!/usr/bin/env python3
"""Fetches real crypto/metal/index prices server-side (no browser CORS
involved) and writes dex-prices.json at the repo root. Run on a schedule by
.github/workflows/update-dex-prices.yml. A partial failure keeps whatever
was already on disk for the ids that couldn't be fetched this run, so one
bad run never wipes out good data."""
import json
import sys
import time
import urllib.request

COIN_IDS = [
    "bitcoin", "ethereum", "bitcoin-cash", "solana", "litecoin",
    "ripple", "sui", "hyperliquid", "pax-gold", "kinesis-silver",
    "dogecoin", "cardano", "tron", "chainlink",
]
INDEX_SYMBOLS = ["^DJI", "^GSPC", "^IXIC"]
OUT_PATH = "dex-prices.json"

# Precio real de $SECT en CoinGecko, ultimos 30 dias, para la grafica de
# Sectorascan. Se busca por la direccion del contrato (no depende de como
# CoinGecko haya llamado a la moneda) y, si falla, por su id.
SECT_CONTRACT = "0x8c9984b06281f1ca9416e493c2e602aab08513db"
SECT_OUT_PATH = "sect-price-30d.json"


def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (SectoraDexBot)"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_coins():
    url = (
        "https://api.coingecko.com/api/v3/simple/price?ids="
        + ",".join(COIN_IDS)
        + "&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true"
    )
    return fetch_json(url)


def fetch_indices():
    out = {}
    for sym in INDEX_SYMBOLS:
        try:
            url = "https://query1.finance.yahoo.com/v8/finance/chart/" + sym + "?range=1d&interval=5m"
            data = fetch_json(url)
            meta = data["chart"]["result"][0]["meta"]
            out[sym] = {
                "regularMarketPrice": meta.get("regularMarketPrice"),
                "chartPreviousClose": meta.get("chartPreviousClose") or meta.get("previousClose"),
                "regularMarketDayHigh": meta.get("regularMarketDayHigh"),
                "regularMarketDayLow": meta.get("regularMarketDayLow"),
                "regularMarketVolume": meta.get("regularMarketVolume"),
            }
        except Exception as e:
            print("yahoo failed for " + sym + ": " + str(e), file=sys.stderr)
    return out


def fetch_sect_chart():
    urls = [
        "https://api.coingecko.com/api/v3/coins/ethereum/contract/" + SECT_CONTRACT + "/market_chart?vs_currency=usd&days=30",
        "https://api.coingecko.com/api/v3/coins/sectora/market_chart?vs_currency=usd&days=30",
    ]
    for url in urls:
        try:
            data = fetch_json(url)
            pts = []
            for p in data.get("prices", []):
                if isinstance(p, list) and len(p) >= 2 and p[1]:
                    pts.append([int(p[0]), float("%.6g" % float(p[1]))])
            if len(pts) >= 2:
                return pts
        except Exception as e:
            print("coingecko sect chart failed (" + url + "): " + str(e), file=sys.stderr)
    return None


def write_sect_chart():
    """Escribe sect-price-30d.json solo si CoinGecko respondio: un fallo deja
    el archivo anterior tal cual."""
    pts = fetch_sect_chart()
    if not pts:
        return
    out = {"updatedAt": int(time.time() * 1000), "source": "coingecko", "contract": SECT_CONTRACT, "prices": pts}
    with open(SECT_OUT_PATH, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print("wrote " + SECT_OUT_PATH + " (" + str(len(pts)) + " points)")


def main():
    try:
        write_sect_chart()
    except Exception as e:
        print("sect chart step failed: " + str(e), file=sys.stderr)

    coins = {}
    indices = {}
    try:
        coins = fetch_coins()
    except Exception as e:
        print("coingecko failed: " + str(e), file=sys.stderr)

    try:
        indices = fetch_indices()
    except Exception as e:
        print("indices fetch failed: " + str(e), file=sys.stderr)

    existing = {"coins": {}, "indices": {}}
    try:
        with open(OUT_PATH) as f:
            existing = json.load(f)
    except Exception:
        pass

    merged_coins = dict(existing.get("coins", {}))
    merged_coins.update(coins)
    merged_indices = dict(existing.get("indices", {}))
    merged_indices.update(indices)

    if not merged_coins and not merged_indices:
        print("nothing fetched and nothing on disk, skipping write", file=sys.stderr)
        return 1

    out = {"updatedAt": int(time.time() * 1000), "coins": merged_coins, "indices": merged_indices}
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, separators=(",", ":"))
    print("wrote " + OUT_PATH + " (" + str(len(merged_coins)) + " coins, " + str(len(merged_indices)) + " indices)")
    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
