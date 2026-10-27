# Traducciones de la pagina de staking.
# keys.json: cada texto en ingles con su id (k000...). src/<idioma>.json: id -> traduccion.
# Escribe staking/i18n/<idioma>.js (ingles -> traduccion), que pide staking/staking-i18n.js.
# Comprueba que esten todas las claves y que se conserven los {0}, {1} de cada mensaje.
# Uso: python3 scripts/staking-i18n/build.py
import json, os, re, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "..", "..", "staking", "i18n")
LANGS = ["es", "zh", "hi", "ar", "pt", "fr", "ru", "de", "ja", "ko", "it"]

keys = json.load(open(os.path.join(AQUI, "keys.json"), encoding="utf-8"))
os.makedirs(SALIDA, exist_ok=True)
mal = 0
for l in LANGS:
    f = os.path.join(AQUI, "src", l + ".json")
    if not os.path.exists(f):
        print(l, "sin archivo"); mal += 1; continue
    src = json.load(open(f, encoding="utf-8"))
    out, faltan = {}, []
    for k in keys:
        v = src.get(k["id"])
        if v is None: faltan.append(k["id"]); continue
        if sorted(re.findall(r"\{\d\}", k["en"])) != sorted(re.findall(r"\{\d\}", v)):
            print(l, k["id"], "marcadores distintos:", v); mal += 1
        out[k["en"]] = v
    sobran = set(src) - {k["id"] for k in keys}
    if faltan or sobran:
        print(l, "faltan", faltan[:12], "sobran", sorted(sobran)[:12]); mal += 1
    js = "window.__STK_TR=window.__STK_TR||{};window.__STK_TR[" + json.dumps(l) + "]=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"
    open(os.path.join(SALIDA, l + ".js"), "w", encoding="utf-8").write(js)
    print(l, len(out), "textos")
sys.exit(1 if mal else 0)
