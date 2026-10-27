/* Idiomas de la pagina de staking: los mismos 12 de la portada.
   Sin claves en el marcado: el motor guarda el texto original (en ingles) de cada nodo de texto y lo
   cambia por su traduccion; lo que los scripts escriben despues (mensajes del staking, selector de
   wallet, guia, intro) se traduce al aparecer. Solo cambia el texto de los nodos y algunos atributos
   (aria-label, title): nunca crea ni quita botones o enlaces, ni toca la logica del staking.
   Las traducciones viven en staking/i18n/<idioma>.js (salen de scripts/staking-i18n) y se piden
   solo al elegir un idioma. La pagina abre en ingles; el idioma elegido vale para la visita, o con
   ?lang=xx. La ventana del Airdrop se traduce sola: escucha el evento "sectora:lang". */
(function () {
  "use strict";
  var IDIOMAS = [["en", "English"], ["es", "Español"], ["zh", "中文"], ["hi", "हिन्दी"], ["ar", "العربية"], ["pt", "Português"],
    ["fr", "Français"], ["ru", "Русский"], ["de", "Deutsch"], ["ja", "日本語"], ["ko", "한국어"], ["it", "Italiano"]];
  var BANDERAS = {"en": "<rect width=\"24\" height=\"16\" fill=\"#b22234\"/><path d=\"M0 2h24M0 4.6h24M0 7.2h24M0 9.8h24M0 12.4h24M0 15h24\" stroke=\"#fff\" stroke-width=\"1.2\"/><rect width=\"10\" height=\"8.6\" fill=\"#3c3b6e\"/><circle cx=\"0.9\" cy=\"1\" r=\".45\" fill=\"#fff\"/><circle cx=\"2.6\" cy=\"1\" r=\".45\" fill=\"#fff\"/><circle cx=\"4.3\" cy=\"1\" r=\".45\" fill=\"#fff\"/><circle cx=\"6\" cy=\"1\" r=\".45\" fill=\"#fff\"/><circle cx=\"7.7\" cy=\"1\" r=\".45\" fill=\"#fff\"/><circle cx=\"9.1\" cy=\"1\" r=\".45\" fill=\"#fff\"/><circle cx=\"1.75\" cy=\"2.8\" r=\".45\" fill=\"#fff\"/><circle cx=\"3.45\" cy=\"2.8\" r=\".45\" fill=\"#fff\"/><circle cx=\"5.15\" cy=\"2.8\" r=\".45\" fill=\"#fff\"/><circle cx=\"6.85\" cy=\"2.8\" r=\".45\" fill=\"#fff\"/><circle cx=\"8.5\" cy=\"2.8\" r=\".45\" fill=\"#fff\"/><circle cx=\"0.9\" cy=\"4.6\" r=\".45\" fill=\"#fff\"/><circle cx=\"2.6\" cy=\"4.6\" r=\".45\" fill=\"#fff\"/><circle cx=\"4.3\" cy=\"4.6\" r=\".45\" fill=\"#fff\"/><circle cx=\"6\" cy=\"4.6\" r=\".45\" fill=\"#fff\"/><circle cx=\"7.7\" cy=\"4.6\" r=\".45\" fill=\"#fff\"/><circle cx=\"9.1\" cy=\"4.6\" r=\".45\" fill=\"#fff\"/><circle cx=\"1.75\" cy=\"6.4\" r=\".45\" fill=\"#fff\"/><circle cx=\"3.45\" cy=\"6.4\" r=\".45\" fill=\"#fff\"/><circle cx=\"5.15\" cy=\"6.4\" r=\".45\" fill=\"#fff\"/><circle cx=\"6.85\" cy=\"6.4\" r=\".45\" fill=\"#fff\"/><circle cx=\"8.5\" cy=\"6.4\" r=\".45\" fill=\"#fff\"/><circle cx=\"0.9\" cy=\"8\" r=\".45\" fill=\"#fff\"/><circle cx=\"2.6\" cy=\"8\" r=\".45\" fill=\"#fff\"/><circle cx=\"4.3\" cy=\"8\" r=\".45\" fill=\"#fff\"/><circle cx=\"6\" cy=\"8\" r=\".45\" fill=\"#fff\"/><circle cx=\"7.7\" cy=\"8\" r=\".45\" fill=\"#fff\"/><circle cx=\"9.1\" cy=\"8\" r=\".45\" fill=\"#fff\"/>", "es": "<rect width=\"24\" height=\"16\" fill=\"#c60b1e\"/><rect y=\"4\" width=\"24\" height=\"8\" fill=\"#ffc400\"/>", "zh": "<rect width=\"24\" height=\"16\" fill=\"#de2910\"/><circle cx=\"5\" cy=\"4.4\" r=\"2.1\" fill=\"#ffde00\"/><circle cx=\"9.4\" cy=\"2.2\" r=\".8\" fill=\"#ffde00\"/><circle cx=\"11\" cy=\"4.6\" r=\".8\" fill=\"#ffde00\"/><circle cx=\"10.6\" cy=\"7.6\" r=\".8\" fill=\"#ffde00\"/><circle cx=\"8.4\" cy=\"9.4\" r=\".8\" fill=\"#ffde00\"/>", "hi": "<rect width=\"24\" height=\"16\" fill=\"#ff9933\"/><rect y=\"5.33\" width=\"24\" height=\"5.34\" fill=\"#fff\"/><rect y=\"10.67\" width=\"24\" height=\"5.33\" fill=\"#138808\"/><circle cx=\"12\" cy=\"8\" r=\"2\" fill=\"none\" stroke=\"#000080\" stroke-width=\"1\"/>", "ar": "<rect width=\"24\" height=\"16\" fill=\"#165d31\"/><rect x=\"4\" y=\"6.6\" width=\"16\" height=\"1.5\" fill=\"#fff\"/><rect x=\"4\" y=\"9.4\" width=\"11\" height=\"1.2\" fill=\"#fff\"/>", "pt": "<rect width=\"24\" height=\"16\" fill=\"#009c3b\"/><path d=\"M12 2.2 22 8l-10 5.8L2 8z\" fill=\"#ffdf00\"/><circle cx=\"12\" cy=\"8\" r=\"3.1\" fill=\"#002776\"/>", "fr": "<rect width=\"24\" height=\"16\" fill=\"#fff\"/><rect width=\"8\" height=\"16\" fill=\"#002395\"/><rect x=\"16\" width=\"8\" height=\"16\" fill=\"#ed2939\"/>", "ru": "<rect width=\"24\" height=\"16\" fill=\"#fff\"/><rect y=\"5.33\" width=\"24\" height=\"5.34\" fill=\"#0039a6\"/><rect y=\"10.67\" width=\"24\" height=\"5.33\" fill=\"#d52b1e\"/>", "de": "<rect width=\"24\" height=\"16\" fill=\"#000\"/><rect y=\"5.33\" width=\"24\" height=\"5.34\" fill=\"#dd0000\"/><rect y=\"10.67\" width=\"24\" height=\"5.33\" fill=\"#ffce00\"/>", "ja": "<rect width=\"24\" height=\"16\" fill=\"#fff\"/><circle cx=\"12\" cy=\"8\" r=\"4.6\" fill=\"#bc002d\"/>", "ko": "<rect width=\"24\" height=\"16\" fill=\"#fff\"/><path d=\"M12 3.6a4.4 4.4 0 0 1 0 8.8 2.2 2.2 0 0 0 0-4.4 2.2 2.2 0 0 1 0-4.4z\" fill=\"#cd2e3a\"/><path d=\"M12 3.6a2.2 2.2 0 0 1 0 4.4 2.2 2.2 0 0 0 0 4.4 4.4 4.4 0 0 1 0-8.8z\" fill=\"#0047a0\"/>", "it": "<rect width=\"24\" height=\"16\" fill=\"#fff\"/><rect width=\"8\" height=\"16\" fill=\"#009246\"/><rect x=\"16\" width=\"8\" height=\"16\" fill=\"#ce2b37\"/>"};
  var VER = "1";
  var CLAVE = "sectora_stake_lang";
  var NO = "script,style,svg,canvas,textarea,input,select,.sad,.sad-msg,.sad-new,#stkLang";
  var TR = window.__STK_TR = window.__STK_TR || {};
  var actual = "en", dic = null, pats = [];
  var orig = new WeakMap();
  var norm = function (s) { return s.replace(/\s+/g, " ").trim(); };
  var tiene = function (s) { return /[A-Za-z]{2}/.test(s); };

  function pedir(l) {
    if (l === "en" || TR[l]) return Promise.resolve();
    return new Promise(function (ok, mal) {
      var sc = document.createElement("script");
      sc.src = "/staking/i18n/" + l + ".js?v=" + VER;
      sc.onload = function () { TR[l] ? ok() : mal(); };
      sc.onerror = mal;
      document.head.appendChild(sc);
    });
  }
  // claves con {0}, {1}: mensajes con una cantidad, un nombre o un paso dentro
  function patrones(d) {
    pats = [];
    if (!d) return;
    Object.keys(d).forEach(function (k) {
      if (k.indexOf("{") < 0) return;
      var lit = k.replace(/\{\d\}/g, "");
      var re = new RegExp("^" + k.split(/(\{\d\})/).map(function (p) {
        return /^\{\d\}$/.test(p) ? "(.+?)" : p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }).join("") + "$");
      pats.push({ re: re, v: d[k], n: lit.length });
    });
    pats.sort(function (a, b) { return b.n - a.n; });
  }
  function tr(s, hondo) {
    if (!dic || !s) return null;
    var v = dic[s];
    if (typeof v === "string") return v;
    if ((hondo || 0) > 2) return null;
    for (var i = 0; i < pats.length; i++) {
      var m = pats[i].re.exec(s);
      if (!m) continue;
      return pats[i].v.replace(/\{(\d)\}/g, function (_, j) {
        var c = m[+j + 1] || "", x = tiene(c) ? tr(c, (hondo || 0) + 1) : null;
        return x === null ? c : x;
      });
    }
    return null;
  }
  // el original de cada nodo se guarda la primera vez; si un script escribe otro texto, ese es el nuevo original.
  // "forzar": al cambiar de idioma se vuelve a traducir desde el original lo que ya estaba traducido
  function nodo(n, forzar) {
    var r = orig.get(n), val = n.nodeValue;
    if (r && val === r.t) { if (!forzar) return; }
    else { r = { o: val, t: val }; orig.set(n, r); }
    var o = r.o, out = o;
    if (dic && tiene(o)) {
      var x = tr(norm(o));
      if (x !== null) out = o.match(/^\s*/)[0] + x + o.match(/\s*$/)[0];
    }
    r.t = out;
    if (val !== out) n.nodeValue = out;
  }
  function todo(n) { nodo(n, true); }
  var ATR = ["aria-label", "title"];
  function atributos(el) {
    ATR.forEach(function (a) {
      if (!el.hasAttribute(a)) return;
      var o = el.getAttribute("data-en-" + a);
      if (o === null) { o = el.getAttribute(a); if (!tiene(o)) return; el.setAttribute("data-en-" + a, o); }
      var x = dic ? tr(norm(o)) : null;
      el.setAttribute(a, x === null ? o : x);
    });
  }
  function recorrer(el, fn) {
    if (el.nodeType === 3) { if (!(el.parentElement && el.parentElement.closest(NO))) fn(el); return; }
    if (el.nodeType !== 1 || el.matches(NO)) return;
    if (el.closest && el.closest(NO)) return;
    atributos(el);
    for (var c = el.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 3) fn(c);
      else if (c.nodeType === 1 && !c.matches(NO)) recorrer(c, fn);
    }
  }

  /* ---- selector con banderas, como el de la portada ---- */
  var css = "" +
    ".lang{position:relative;flex:none}" +
    ".lang-b{display:inline-flex;align-items:center;gap:9px;cursor:pointer;background:transparent;border:1px solid var(--hair);border-radius:0;color:var(--ink);padding:10px 15px;white-space:nowrap;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;transition:color .3s,border-color .3s}" +
    ".lang-b:hover,.lang.on .lang-b{color:#fff;border-color:rgba(255,255,255,.42)}" +
    ".lang-b .cv{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;opacity:.7;transition:transform .28s ease}" +
    ".lang.on .lang-b .cv{transform:rotate(180deg)}" +
    ".lang .fl{width:19px;height:13px;flex:none;border-radius:1px;display:block;shape-rendering:geometricPrecision;box-shadow:0 0 0 .5px rgba(0,0,0,.32)}" +
    ".lang-l{position:absolute;top:calc(100% + 6px);right:0;z-index:120;margin:0;padding:5px;list-style:none;min-width:162px;max-height:62vh;overflow:auto;background:#0d1014;border:1px solid rgba(255,255,255,.14);border-radius:3px;box-shadow:0 16px 38px rgba(0,0,0,.5);opacity:0;visibility:hidden;transform:translateY(-5px);transition:opacity .2s ease,transform .2s ease,visibility .2s}" +
    ".lang.on .lang-l{opacity:1;visibility:visible;transform:none}" +
    ".lang-l li{display:flex;align-items:center;gap:10px;padding:7px 9px;cursor:pointer;border-radius:2px;color:rgba(255,255,255,.72);font-size:12.5px;font-family:'IBM Plex Sans',system-ui,sans-serif;letter-spacing:0;text-transform:none;transition:background .16s ease,color .16s ease}" +
    ".lang-l li:hover{background:rgba(21,105,255,.14);color:#fff}" +
    ".lang-l li[aria-selected=true]{color:#4d8dff}" +
    "@media (max-width:700px){.lang-b span{display:none}.lang-b{padding:10px 12px;gap:7px}.lang-l{min-width:140px}}" +
    /* en otros idiomas una etiqueta de la tabla de condiciones puede ser mas larga: que no se monte sobre su valor */
    ".lg-row dt{min-width:min-content}" +
    /* arabe: cada parrafo toma su direccion, sin dar la vuelta a la maqueta de la consola */
    "html[lang=ar] :is(p,h1,h2,h3,h4,li,dt,dd,summary,figcaption,label,small){unicode-bidi:plaintext;text-align:start}";
  var sel = null, bt = null, lst = null;
  var svg = function (c) { return '<svg class="fl" viewBox="0 0 24 16" aria-hidden="true">' + (BANDERAS[c] || "") + "</svg>"; };
  function pintar() {
    if (!bt) return;
    var it = IDIOMAS.filter(function (x) { return x[0] === actual; })[0] || IDIOMAS[0];
    bt.innerHTML = svg(it[0]) + "<span>" + it[1] + '</span><svg class="cv" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.5l6 6 6-6"/></svg>';
    lst.querySelectorAll("li").forEach(function (li) { li.setAttribute("aria-selected", String(li.dataset.c === actual)); });
  }
  function abrir(v) { sel.classList.toggle("on", v); bt.setAttribute("aria-expanded", v ? "true" : "false"); }
  function montar() {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    var fin = document.querySelector(".top .nav-end");
    if (!fin) return;
    sel = document.createElement("div"); sel.className = "lang"; sel.id = "stkLang";
    sel.innerHTML = '<button type="button" class="lang-b mono" aria-haspopup="listbox" aria-expanded="false" aria-label="Language"></button><ul class="lang-l" role="listbox" tabindex="-1"></ul>';
    fin.insertBefore(sel, fin.firstChild);
    bt = sel.querySelector(".lang-b"); lst = sel.querySelector(".lang-l");
    lst.innerHTML = IDIOMAS.map(function (x) { return '<li role="option" data-c="' + x[0] + '" lang="' + x[0] + '">' + svg(x[0]) + "<span>" + x[1] + "</span></li>"; }).join("");
    pintar();
    bt.addEventListener("click", function (e) { e.stopPropagation(); abrir(!sel.classList.contains("on")); });
    lst.addEventListener("click", function (e) { var li = e.target.closest("li"); if (!li) return; abrir(false); poner(li.dataset.c, true); });
    document.addEventListener("click", function (e) { if (!sel.contains(e.target)) abrir(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") abrir(false); });
  }

  var tituloEn = document.title;
  function poner(l, elegido) {
    if (!IDIOMAS.some(function (x) { return x[0] === l; })) l = "en";
    return pedir(l).then(function () {
      actual = l; dic = l === "en" ? null : TR[l]; patrones(dic);
      recorrer(document.body, todo);
      var t = dic ? tr(tituloEn) : null; document.title = t === null ? tituloEn : t;
      document.documentElement.lang = l;
      pintar();
      if (elegido) { try { sessionStorage.setItem(CLAVE, l); } catch (e) {} }
      window.SECTORA_STAKE_LANG = l;
      window.dispatchEvent(new CustomEvent("sectora:lang", { detail: l }));
    }, function () {});
  }
  // para los textos que se dibujan en un canvas (la grafica de la guia)
  window.SectoraStakeT = function (s) { var x = dic ? tr(s) : null; return x === null ? s : x; };
  window.SectoraStakeLang = function () { return actual; };

  function arrancar() {
    montar();
    // lo que aparece despues (mensajes, selector de wallet, contador): se traduce al llegar
    new MutationObserver(function (ms) {
      if (!dic) return;
      ms.forEach(function (m) {
        if (m.type === "characterData") { if (!(m.target.parentElement && m.target.parentElement.closest(NO))) nodo(m.target); return; }
        m.addedNodes.forEach(function (n) { recorrer(n, nodo); });
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    var l = "en";
    var q = /[?&]lang=([a-z]{2})/.exec(location.search);
    if (q) l = q[1];
    else { try { l = sessionStorage.getItem(CLAVE) || "en"; } catch (e) {} }
    if (l !== "en") poner(l, !!q);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar);
  else arrancar();
})();
