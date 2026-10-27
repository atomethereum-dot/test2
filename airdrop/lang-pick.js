/* Selector de idioma con banderas (el mismo del dashboard): boton con la bandera y el nombre,
   y una lista con los 11 idiomas de sectoraorg.com. Lo usan /airdrop, /myairdrop y /airdrop-guide.
   SALangPick(host, actual, elegir): host = contenedor; actual() = codigo actual; elegir(codigo). */
(function () {
  "use strict";
  var FLAGS = {
    en: '<rect width="24" height="16" fill="#b22234"/><path d="M0 1.85h24M0 4.31h24M0 6.77h24M0 9.23h24M0 11.69h24M0 14.15h24" stroke="#fff" stroke-width="1.23"/><rect width="9.6" height="8.6" fill="#3c3b6e"/>',
    es: '<rect width="24" height="16" fill="#c60b1e"/><rect y="4" width="24" height="8" fill="#ffc400"/>',
    zh: '<rect width="24" height="16" fill="#de2910"/><circle cx="5" cy="4.4" r="2.1" fill="#ffde00"/><circle cx="9.4" cy="2.2" r=".8" fill="#ffde00"/><circle cx="11" cy="4.6" r=".8" fill="#ffde00"/><circle cx="10.6" cy="7.6" r=".8" fill="#ffde00"/><circle cx="8.4" cy="9.4" r=".8" fill="#ffde00"/>',
    pt: '<rect width="24" height="16" fill="#009c3b"/><path d="M12 2.2 22 8l-10 5.8L2 8z" fill="#ffdf00"/><circle cx="12" cy="8" r="3.1" fill="#002776"/>',
    ru: '<rect width="24" height="16" fill="#fff"/><rect y="5.33" width="24" height="5.34" fill="#0039a6"/><rect y="10.67" width="24" height="5.33" fill="#d52b1e"/>',
    fr: '<rect width="24" height="16" fill="#fff"/><rect width="8" height="16" fill="#002395"/><rect x="16" width="8" height="16" fill="#ed2939"/>',
    ja: '<rect width="24" height="16" fill="#fff"/><circle cx="12" cy="8" r="4.6" fill="#bc002d"/>',
    ko: '<rect width="24" height="16" fill="#fff"/><path d="M12 3.6a4.4 4.4 0 0 1 0 8.8 2.2 2.2 0 0 0 0-4.4 2.2 2.2 0 0 1 0-4.4z" fill="#cd2e3a"/><path d="M12 3.6a2.2 2.2 0 0 1 0 4.4 2.2 2.2 0 0 0 0 4.4 4.4 4.4 0 0 1 0-8.8z" fill="#0047a0"/>',
    ar: '<rect width="24" height="16" fill="#165d31"/><rect x="4" y="6.6" width="16" height="1.5" fill="#fff"/><rect x="4" y="9.4" width="11" height="1.2" fill="#fff"/>',
    de: '<rect width="24" height="16" fill="#000"/><rect y="5.33" width="24" height="5.34" fill="#dd0000"/><rect y="10.67" width="24" height="5.33" fill="#ffce00"/>',
    hi: '<rect width="24" height="16" fill="#ff9933"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.67" width="24" height="5.33" fill="#138808"/><circle cx="12" cy="8" r="2" fill="none" stroke="#000080" stroke-width="1"/>'
  };
  var NAMES = { en: "English", es: "Español", zh: "中文", pt: "Português", ru: "Русский", fr: "Français", ja: "日本語", ko: "한국어", ar: "العربية", de: "Deutsch", hi: "हिन्दी" };
  var ORDER = ["en", "es", "zh", "pt", "ru", "fr", "ja", "ko", "ar", "de", "hi"];
  var CSS = [
    ".lp{position:relative;flex:none}",
    ".lp-b{display:inline-flex;align-items:center;gap:9px;height:38px;padding:0 11px;border:1px solid rgba(255,255,255,.14);background:rgba(10,13,19,.9);color:#fff;",
    "  font:400 11px/1 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}",
    ".lp-b:hover{border-color:rgba(255,255,255,.3)}",
    ".lp .fl{display:block;width:18px;height:12px;flex:none;border-radius:1px}",
    ".lp .cv{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2;transition:transform .2s}",
    ".lp.on .cv{transform:rotate(180deg)}",
    ".lp-l{position:absolute;top:calc(100% + 6px);inset-inline-end:0;z-index:80;display:none;min-width:190px;max-height:min(420px,70vh);overflow:auto;margin:0;padding:6px 0;list-style:none;",
    "  background:#0a0d13;border:1px solid rgba(255,255,255,.14);box-shadow:0 18px 40px rgba(0,0,0,.55)}",
    ".lp.on .lp-l{display:block}",
    ".lp-l li{display:flex;align-items:center;gap:11px;padding:10px 14px;color:#c6ccd8;font:400 14px/1.2 'IBM Plex Sans',system-ui,sans-serif;letter-spacing:0;text-transform:none;cursor:pointer}",
    ".lp-l li:hover,.lp-l li[aria-selected=true]{background:rgba(255,255,255,.06);color:#fff}",
    ".lp-b .cd{display:none}",
    "@media (max-width:700px){.lp-b .nm{display:none}.lp-b .cd{display:inline}}"
  ].join("\n");
  function flag(c) { return '<svg class="fl" viewBox="0 0 24 16" aria-hidden="true">' + (FLAGS[c] || "") + "</svg>"; }
  window.SALangPick = function (host, actual, elegir) {
    if (!document.getElementById("lp-css")) { var s = document.createElement("style"); s.id = "lp-css"; s.textContent = CSS; document.head.appendChild(s); }
    host.innerHTML = "";
    var box = document.createElement("div"); box.className = "lp";
    var bt = document.createElement("button"); bt.type = "button"; bt.className = "lp-b"; bt.setAttribute("aria-haspopup", "listbox"); bt.setAttribute("aria-expanded", "false"); bt.setAttribute("aria-label", "Language");
    var ul = document.createElement("ul"); ul.className = "lp-l"; ul.setAttribute("role", "listbox");
    box.appendChild(bt); box.appendChild(ul); host.appendChild(box);
    function paint() {
      var c = actual();
      bt.innerHTML = flag(c) + '<span class="nm">' + NAMES[c] + '</span><span class="cd">' + c.toUpperCase() + '</span><svg class="cv" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg>';
      ul.innerHTML = ORDER.map(function (k) { return '<li role="option" data-c="' + k + '" aria-selected="' + (k === c) + '" lang="' + k + '">' + flag(k) + "<span>" + NAMES[k] + "</span></li>"; }).join("");
    }
    function open(v) { box.classList.toggle("on", v); bt.setAttribute("aria-expanded", v ? "true" : "false"); }
    bt.addEventListener("click", function (e) { e.stopPropagation(); open(!box.classList.contains("on")); });
    ul.addEventListener("click", function (e) { var li = e.target.closest("li"); if (!li) return; open(false); elegir(li.getAttribute("data-c")); paint(); });
    document.addEventListener("click", function (e) { if (!box.contains(e.target)) open(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") open(false); });
    paint();
    return { refresh: paint };
  };
  window.SALangPick.codes = ORDER;
})();
