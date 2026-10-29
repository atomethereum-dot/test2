/* ═══════════ /testv2: tu Hash Node se enciende con el staking ═══════════
   Al conectar la wallet (en cualquier red, sin cambiar a Sepolia) lee su staking en Ethereum y su
   registro de nodo con /testv2/count.js, y pinta la tarjeta: encendido si tiene 100 SECT o mas en
   staking. Solo lectura: no firma ni envia nada. Sin % en premios, solo SECT. */
(function () {
  "use strict";
  var t = function (k, f) { var v = window.SECTORA_T && window.SECTORA_T(k); return v && v !== k ? v : f; };
  var LV = ["", "Scout", "Sentinel", "Guardian", "Titan"];
  var est = null;          // { addr, carga } | { addr, r, desde } | { addr, err }
  var turno = 0;
  // lo que el mercado necesita saber (mercado.js): wallet y nivel de staking
  function avisa(e) { window.__v2Estado = e; document.dispatchEvent(new Event("v2:estado")); }

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var idioma = function () { return window.SECTORA_CURRENT_LANG || "en"; };
  var num = function (n, d) { return Number(n).toLocaleString(idioma(), { maximumFractionDigits: d == null ? 0 : d }); };
  var fecha = function (ms) { try { return new Date(ms).toLocaleDateString(idioma(), { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return new Date(ms).toISOString().slice(0, 10); } };
  var corta = function (a) { return a.slice(0, 6) + "…" + a.slice(-4); };

  function caja() {
    var c = document.getElementById("v2Node");
    if (c) return c;
    var head = document.getElementById("node");
    if (!head) return null;
    c = document.createElement("div");
    c.className = "card rv on v2-node"; c.id = "v2Node";
    var antes = head.nextElementSibling;   // la tarjeta vieja del registro (oculta en esta prueba)
    head.parentNode.insertBefore(c, antes ? antes.nextSibling : head.nextSibling);
    return c;
  }

  function fila(k, v) { return '<div class="row"><span class="lbl">' + esc(k) + "</span><b>" + v + "</b></div>"; }

  function pinta() {
    var c = caja(); if (!c) return;
    var h = '<span class="lbl">' + esc(t("hashdash.v2.card.k", "Your Hash Node")) + "</span>";
    if (!est) {
      h += '<p class="v2-h">' + esc(t("hashdash.v2.card.connect", "Connect your wallet to see your node.")) + "</p>" +
        '<p class="note v2-n">' + esc(t("hashdash.v2.card.connectSub", "Use the same wallet you stake with. Connecting doesn't move funds.")) + "</p>" +
        '<div class="v2-a"><button class="btn key" type="button" data-v2="connect">' + esc(t("hashdash.top.connect", "Connect wallet")) + "</button></div>";
    } else if (est.carga) {
      h += '<p class="v2-h v2-wait"><i></i>' + esc(t("hashdash.v2.card.reading", "Reading your staking…")) + "</p>" + fila(t("hashdash.v2.card.wallet", "Wallet"), esc(corta(est.addr)));
    } else if (est.err) {
      h += '<p class="v2-h">' + esc(t("hashdash.v2.card.err", "Couldn't read the network. Try again in a moment.")) + "</p>" +
        '<div class="v2-a"><button class="btn" type="button" data-v2="retry">' + esc(t("hashdash.v2.card.retry", "Retry")) + "</button></div>";
    } else {
      var r = est.r, on = r.level > 0;
      h += '<div class="v2-st ' + (on ? "on" : "off") + '"><i></i><b>' + esc(on ? t("hashdash.v2.card.on", "Node on") : t("hashdash.v2.card.off", "Node off")) + "</b></div>" +
        '<p class="note v2-n">' + esc(on ? t("hashdash.v2.card.onSub", "Your node is on thanks to your staking. You're in Airdrop Genesis.") : t("hashdash.v2.card.offSub", "Your node turns on with 100 SECT in staking.")) + "</p>" +
        '<div class="v2-rows">' +
        fila(t("hashdash.v2.card.wallet", "Wallet"), esc(corta(est.addr))) +
        fila(t("hashdash.v2.card.staked", "SECT in staking"), num(r.bal, 2) + " SECT") +
        (on ? fila(t("hashdash.v2.card.level", "Level"), LV[r.level]) +
          fila(t("hashdash.v2.card.since", "On since"), esc(fecha(est.desde))) +
          fila(t("hashdash.v2.card.prize", "Your airdrop prize"), num(r.prize) + " SECT") +
          fila(t("hashdash.v2.card.earned", "Earned so far"), num(r.earned, 2) + " SECT") : "") +
        "</div>" +
        (on ? "" : '<div class="v2-a"><a class="btn key" href="/staking/">' + esc(t("hashdash.v2.card.stake", "Go to staking")) + " ↗</a></div>");
    }
    c.innerHTML = h;
    var b = c.querySelector("[data-v2]");
    if (b) b.addEventListener("click", function () {
      if (b.getAttribute("data-v2") === "retry" && est) return carga(est.addr);
      var bc = document.getElementById("bConnect"); if (bc) bc.click();
    });
  }

  function carga(addr) {
    var C = window.SACount, mio = ++turno;
    est = { addr: addr, carga: true }; pinta(); avisa(null);
    if (!C) { est = { addr: addr, err: true }; pinta(); return; }
    C.wallet(addr).then(function (w) {
      if (mio !== turno) return;
      var r = C.evaluate(w.ev, w.node, C.OPEN, Date.now());
      var sp = (w.node && w.node.spans) || [], ult = sp[sp.length - 1];
      est = { addr: addr, r: r, desde: ult ? Math.max(ult[0], C.OPEN) : C.AUTO };
      pinta(); avisa({ addr: addr, lv: r.level, bal: r.bal });
    }).catch(function () { if (mio === turno) { est = { addr: addr, err: true }; pinta(); } });
  }

  function engancha() {
    var w = window.__sectoraWallet;
    if (!w) return setTimeout(engancha, 200);
    var oc = w.onConnect, od = w.onDisconnect;
    w.onConnect = function (dir, bal) { if (oc) oc.call(w, dir, bal); if (!est || est.addr.toLowerCase() !== dir.toLowerCase()) carga(dir); };
    w.onDisconnect = function () { if (od) od.call(w); turno++; est = null; pinta(); avisa(null); };
    var ya = window.__sectoraCuenta && window.__sectoraCuenta();
    if (ya) carga(ya); else pinta();
  }

  var css = document.createElement("style");
  css.textContent =
    ".v2-node{margin-bottom:clamp(13px,1.6vw,18px)}" +
    ".v2-node .v2-h{margin:12px 0 0;font-size:18px;line-height:1.4;color:var(--ink)}" +
    ".v2-node .v2-n{margin:8px 0 0;max-width:68ch;text-transform:none;letter-spacing:0;font:300 13.5px/1.6 'IBM Plex Sans',system-ui,sans-serif;color:var(--ink3)}" +
    ".v2-node .v2-a{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.v2-node .v2-a .btn{padding:13px 20px;text-decoration:none}" +
    ".v2-node .v2-st{display:flex;align-items:center;gap:12px;margin-top:14px}" +
    ".v2-node .v2-st i{width:12px;height:12px;border-radius:50%;flex:none}" +
    ".v2-node .v2-st b{font-weight:400;font-size:clamp(24px,2.4vw,30px);letter-spacing:-.02em;color:var(--ink)}" +
    ".v2-node .v2-st.on i{background:var(--live);box-shadow:0 0 0 5px rgba(62,207,142,.16),0 0 18px rgba(62,207,142,.55);animation:v2p 2.4s ease-in-out infinite}" +
    ".v2-node .v2-st.on b{color:var(--live)}" +
    ".v2-node .v2-st.off i{background:transparent;border:1.5px solid var(--ink4)}" +
    ".v2-node .v2-rows{margin-top:16px;max-width:560px}" +
    ".v2-node .v2-wait i{display:inline-block;width:9px;height:9px;margin-right:10px;border-radius:50%;background:var(--blue);animation:v2p 1.2s ease-in-out infinite}" +
    "@keyframes v2p{50%{opacity:.35}}";
  document.head.appendChild(css);
  document.addEventListener("sectora:langchange", pinta);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", engancha); else engancha();
})();
