/* ═══════════ Dashboard: tu Hash Node ═══════════
   Al conectar la wallet (en cualquier red, sin cambiar a Sepolia) lee su staking en Ethereum y su
   registro de nodo con /airdrop/count.js. Nodo y staking van por separado: el nodo se activa en el plan
   (mercado.js) y el airdrop queda activo con los dos, en cualquier orden.
   La tarjeta tiene dos columnas: los datos, y a la derecha un mapa con la ubicacion del nodo y una
   consola con lo que va sumando en el airdrop, segundo a segundo. Solo lectura: no firma ni envia nada.
   Sin % en premios, solo SECT. */
(function () {
  "use strict";
  var t = function (k, f) { var v = window.SECTORA_T && window.SECTORA_T(k); return v && v !== k ? v : f; };
  var LV = ["", "Scout", "Sentinel", "Guardian", "Titan"];
  var W0 = "At {l} level you had {g} SECT generated. Deposit your previous balance ({b} SECT in staking) and it runs again.", N0 = "Now: {l} level with {s} SECT in staking · prize {p} SECT.";
  var C0 = function () { return window.SACount; };
  var DAY = 864e5;
  // aviso de activacion: lo recoge la tarea "Nodos activados" de GitHub (nodos/activaciones.json)
  var NTFY = "https://ntfy.sh/sectora-hn-1ux29d4rgvyv5l";
  var est = null;          // { addr, carga } | { addr, r, nd, reg } | { addr, err }
  var turno = 0;
  // lo que el mercado necesita saber (mercado.js): wallet y nivel de staking
  function avisa(e) { window.__v2Estado = e; document.dispatchEvent(new Event("v2:estado")); }

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var idioma = function () { return window.SECTORA_CURRENT_LANG || "en"; };
  var num = function (n, d, min) { return Number(n).toLocaleString(idioma(), { minimumFractionDigits: min || 0, maximumFractionDigits: d == null ? 0 : d }); };
  var corta = function (a) { return a.slice(0, 6) + "…" + a.slice(-4); };

  function caja() {
    var c = document.getElementById("v2Node");
    if (c) return c;
    var head = document.getElementById("node");
    if (!head) return null;
    c = document.createElement("div");
    c.className = "card rv on v2-node"; c.id = "v2Node";
    c.innerHTML = '<div class="v2-l" id="v2L"></div><div class="v2-vis" id="v2Vis">' +
      '<div class="v2-map"><canvas id="v2Map"></canvas><span class="v2-tag" id="v2MapK"></span><span class="v2-pin" id="v2Pin" hidden></span><span class="v2-cap" id="v2Cap"></span></div>' +
      '<div class="v2-con"><div class="v2-con-h"><span id="v2ConK"></span><span class="v2-live" id="v2Live" hidden><i></i><em></em></span></div>' +
      '<div class="v2-tot"><span id="v2TotK"></span><b id="v2Tot">—</b></div><div class="v2-log" id="v2Log" role="log" aria-live="off"></div></div></div>';
    head.parentNode.insertBefore(c, head.nextSibling);
    return c;
  }

  // el nodo activado: el guardado en este navegador o, si no, el del registro publico de activaciones
  function nodo() {
    var n = null;
    try { n = est && est.addr ? JSON.parse(localStorage.getItem("sectora:v2:node:" + est.addr.toLowerCase()) || "null") : null; } catch (e) {}
    if (!n && est && est.nd && est.nd.act) { var a = est.nd.act; n = { name: a.n, place: a.c, lat: a.la, lon: a.lo }; }
    return n;
  }
  // deja constancia publica de la activacion (sin firmas ni gas); se repite si a los 20 min aun no esta guardada
  function envia(addr, n) {
    var k = "sectora:v2:sent:" + addr.toLowerCase();
    try { if (Date.now() - (+localStorage.getItem(k) || 0) < 20 * 60000) return; localStorage.setItem(k, String(Date.now())); } catch (e) {}
    var msg = JSON.stringify({ w: addr.toLowerCase(), n: n.name, c: n.place || "", la: n.lat, lo: n.lon });
    try { fetch(NTFY, { method: "POST", body: msg, keepalive: true }).catch(function () {}); } catch (e) {}
  }
  window.__v2Envia = envia;
  function fila(k, v) { return '<div class="row"><span class="lbl">' + esc(k) + "</span><b>" + v + "</b></div>"; }
  // estado del nodo y del airdrop
  function estado() {
    if (!est || !est.r) return null;
    var on = est.reg || !!nodo(), stk = est.r.level > 0;
    return { on: on, stk: stk, ad: on && stk };
  }
  // donde esta el nodo: el guardado al activarlo, o el del registro en la red
  // coordenadas imposibles: 0,0 o en el borde del mapa (algunos nodos de Sepolia se registraron escribiendolas mal a mano)
  function mala(la, lo) { return !isFinite(la) || !isFinite(lo) || (Math.abs(la) < 0.01 && Math.abs(lo) < 0.01) || Math.abs(la) >= 84.9 || Math.abs(lo) >= 179.9; }
  function lugar() {
    var n = nodo();
    if (n && !mala(n.lat, n.lon)) return { lat: n.lat, lon: n.lon, name: n.name, place: n.place || "" };
    if (est && est.reg && est.nd && !mala(est.nd.lat, est.nd.lon)) return { lat: est.nd.lat, lon: est.nd.lon, name: "", place: "" };
    // si lo guardado no sirve, la ubicacion aproximada que el dashboard detecta ahora (dashboard-node-geo.js)
    var g = window.__sectoraGeo;
    if ((n || (est && est.reg)) && g && !mala(g.lat, g.lon)) return { lat: g.lat, lon: g.lon, name: n ? n.name : "", place: g.place || "" };
    return null;
  }

  function pinta() {
    var c = caja(); if (!c) return;
    var L = c.querySelector("#v2L");
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
      var r = est.r, s = estado(), on = s.on, stk = s.stk, ad = s.ad;
      var sub = !on ? t("hashdash.v2.card2.offSub", "Press “Activate my node” in the plan above. It's free.")
        : ad ? t("hashdash.v2.card2.bothSub", "Your node is on and your airdrop is active.")
        : t("hashdash.v2.card2.onSub", "Your node is on. To activate your airdrop, put 100 SECT in staking.");
      h += '<div class="v2-st ' + (on ? "on" : "off") + '"><i></i><b>' + esc(on ? t("hashdash.v2.card.on", "Node on") : t("hashdash.v2.card.off", "Node off")) + "</b></div>" +
        '<p class="note v2-n">' + esc(sub) + "</p>" +
        '<div class="v2-rows">' +
        fila(t("hashdash.v2.card.wallet", "Wallet"), esc(corta(est.addr))) +
        (nodo() ? fila(t("hashdash.node.name", "Node name"), esc(nodo().name) + (nodo().place ? " · " + esc(nodo().place) : "")) : "") +
        fila(t("hashdash.v2.card.staked", "SECT in staking"), num(r.bal, 2) + " SECT") +
        fila(t("hashdash.v2.card2.airdrop", "Airdrop"), ad ? '<span class="v2-ok">' + esc(t("hashdash.v2.card2.adOn", "Active ✓")) + "</span>"
          : esc(!on && !stk ? t("hashdash.v2.card2.adBoth", "Needs your node and 100 SECT in staking") : !on ? t("hashdash.v2.card2.adNode", "Needs your node on") : t("hashdash.v2.card2.adStake", "Needs 100 SECT in staking"))) +
        (ad ? fila(t("hashdash.v2.card.level", "Level"), LV[r.level]) +
          fila(t("hashdash.v2.card.prize", "Your airdrop prize"), num(r.prize) + " SECT") : "") +
        "</div>" +
        // el airdrop de este nodo: lo liberado hasta ahora (en vivo), lo que generara y cuando se entrega
        (ad ? '<div class="v2-ad"><span class="lbl">' + esc(t("hashdash.v2.box.k", "Airdrop of this node")) + "</span>" +
          '<div class="v2-ad-g"><div><span>' + esc(t("hashdash.v2.box.earned", "Released so far")) + '</span><b id="v2Rel">' + num(vivo(), 6, 6) + " SECT</b></div>" +
          "<div><span>" + esc(t("hashdash.v2.box.total", "This node will generate")) + "</span><b>" + num(r.proj || r.prize) + " SECT</b><small>" + esc(t("hashdash.v2.box.totalS", "on completing your time")) + "</small></div></div>" +
          (r.outGot > 0.00005 ? '<p class="v2-ad-p"><b>' + esc(t("hashdash.v2.box.was", W0).replace("{l}", LV[C0().level(r.outTop)] || "").replace("{g}", num(r.outGot, 4, 4)).replace("{b}", num(r.outTop))) + "</b>" +
            (r.level > 0 && r.level < C0().level(r.outTop) ? "<br>" + esc(t("hashdash.v2.box.now", N0).replace("{l}", LV[r.level]).replace("{s}", num(r.bal, 2)).replace("{p}", num(r.prize))) : "") + "</p>" : "") +
          '<p class="v2-ad-d"><i></i>' + esc(t("hashdash.v2.box.deliv", "Delivered at the launch of SectoraEVM")) + "</p>" +
          '<div class="v2-a"><a class="btn key" href="/myairdrop/?a=' + est.addr + '">' + esc(t("hashdash.v2.box.btn", "Airdrop panel")) + " ↗</a></div></div>" : "") +
        (stk ? "" : '<div class="v2-lv"><span class="lbl">' + esc(t("hashdash.v2.lv.k", "Airdrop levels: the higher, the bigger your reward")) + "</span><div>" +
          LV.slice(1).map(function (n, i) { return "<i><em>" + (i + 1) + "</em>" + n + "</i>"; }).join("") + "</div></div>") +
        (!on ? '<div class="v2-a"><button class="btn key" type="button" data-v2="plan">' + esc(t("hashdash.v2.plan.btn", "Activate my node")) + "</button></div>"
          : !stk ? '<div class="v2-a"><a class="btn key" href="/staking/">' + esc(t("hashdash.v2.card.stake", "Go to staking")) + " ↗</a></div>" : "");
    }
    L.innerHTML = h;
    var b = L.querySelector("[data-v2]");
    if (b) b.addEventListener("click", function () {
      if (b.getAttribute("data-v2") === "retry" && est) return carga(est.addr);
      if (b.getAttribute("data-v2") === "plan") { var bp = document.getElementById("bPlan"), pl = document.getElementById("plan");
        if (pl) pl.scrollIntoView({ behavior: "smooth", block: "center" }); if (bp && !bp.disabled) bp.click(); return; }
      var bc = document.getElementById("bConnect"); if (bc) bc.click();
    });
    visual();
  }

  /* ---------- mapa: puntos de tierra alrededor del nodo y el nodo latiendo ---------- */
  var M = { cv: null, base: null, key: "", raf: 0, sitio: null, mask: null, maskSrc: null };
  // mascara de tierra del globo del dashboard (blanco = tierra), reducida a 0,5 grados por pixel
  function tierra() {
    var src = window.__sectoraLand;
    if (!src) return null;
    if (M.mask && M.maskSrc === src && !M.sucia) return M.mask;
    var c = document.createElement("canvas"); c.width = 720; c.height = 360;
    var g = c.getContext("2d"); g.drawImage(src, 0, 0, 720, 360);
    try { M.mask = g.getImageData(0, 0, 720, 360).data; } catch (e) { return null; }
    M.maskSrc = src; M.sucia = false;
    return M.mask;
  }
  var esTierra = function (m, lat, lon) {
    lon = ((lon + 540) % 360) - 180;
    var x = Math.min(719, Math.max(0, Math.floor((lon + 180) * 2))), y = Math.min(359, Math.max(0, Math.floor((90 - lat) * 2)));
    return m[(y * 720 + x) * 4] > 110;
  };
  function vista(s) {
    // con nodo: 90 x 45 grados centrados en el; sin nodo: el mundo entero
    if (!s) return { lon0: -180, lat1: 85, w: 360, h: 170, paso: 3 };
    var h = 46, w = 92, lat1 = Math.min(85, Math.max(-85 + h, s.lat + h / 2));
    return { lon0: s.lon - w / 2, lat1: lat1, w: w, h: h, paso: 1.15 };
  }
  function base() {
    var cv = M.cv, W = cv.width, H = cv.height, s = M.sitio, v = vista(s);
    var key = W + "x" + H + ":" + (s ? s.lat.toFixed(2) + "," + s.lon.toFixed(2) : "mundo") + ":" + (M.mask ? 1 : 0);
    if (M.base && M.key === key) return M.base;
    var b = document.createElement("canvas"); b.width = W; b.height = H;
    var g = b.getContext("2d"), m = tierra(), dpr = W / cv.clientWidth || 1;
    var px = function (lon) { return (lon - v.lon0) / v.w * W; }, py = function (lat) { return (v.lat1 - lat) / v.h * H; };
    g.fillStyle = "#04070d"; g.fillRect(0, 0, W, H);
    // reticula
    g.strokeStyle = "rgba(77,141,255,.07)"; g.lineWidth = 1;
    for (var gl = Math.ceil(v.lon0 / 10) * 10; gl <= v.lon0 + v.w; gl += 10) { g.beginPath(); g.moveTo(px(gl), 0); g.lineTo(px(gl), H); g.stroke(); }
    for (var gt = Math.ceil((v.lat1 - v.h) / 10) * 10; gt <= v.lat1; gt += 10) { g.beginPath(); g.moveTo(0, py(gt)); g.lineTo(W, py(gt)); g.stroke(); }
    // tierra en puntos; los cercanos al nodo, mas encendidos
    if (m) {
      var r = Math.max(1, (v.paso / v.w) * W * 0.3);
      for (var lat = v.lat1 - v.paso / 2; lat > v.lat1 - v.h; lat -= v.paso) {
        for (var lon = v.lon0 + v.paso / 2; lon < v.lon0 + v.w; lon += v.paso) {
          if (!esTierra(m, lat, lon)) continue;
          var a = 0.22;
          if (s) { var d = Math.hypot(lon - s.lon, lat - s.lat); a = 0.16 + 0.5 * Math.max(0, 1 - d / 22); }
          g.fillStyle = "rgba(120,160,230," + a.toFixed(3) + ")";
          g.beginPath(); g.arc(px(lon), py(lat), r, 0, 6.2832); g.fill();
        }
      }
    }
    // borde con degradado para que el mapa se funda con la tarjeta
    var vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, "rgba(4,7,13,0)"); vg.addColorStop(1, "rgba(4,7,13,.85)");
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    M.base = b; M.key = key; M.px = px; M.py = py; M.dpr = dpr;
    return b;
  }
  function dibuja(ts) {
    M.raf = 0;
    var cv = M.cv; if (!cv || !cv.isConnected) return;
    var W = Math.round(cv.clientWidth * (window.devicePixelRatio || 1)), H = Math.round(cv.clientHeight * (window.devicePixelRatio || 1));
    if (!W || !H) return;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    var g = cv.getContext("2d"), b = base(), s = M.sitio;
    g.drawImage(b, 0, 0);
    var pin = document.getElementById("v2Pin");
    if (s) {
      var x = M.px(s.lon), y = M.py(s.lat), dpr = M.dpr, k = ((ts || 0) % 2400) / 2400;
      // cruz de coordenadas
      g.strokeStyle = "rgba(62,207,142,.22)"; g.lineWidth = dpr; g.setLineDash([3 * dpr, 4 * dpr]);
      g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); g.setLineDash([]);
      // ondas
      for (var i = 0; i < 2; i++) {
        var f = (k + i / 2) % 1;
        g.strokeStyle = "rgba(62,207,142," + (0.55 * (1 - f)).toFixed(3) + ")"; g.lineWidth = 1.5 * dpr;
        g.beginPath(); g.arc(x, y, (6 + f * 30) * dpr, 0, 6.2832); g.stroke();
      }
      var gl = g.createRadialGradient(x, y, 0, x, y, 16 * dpr);
      gl.addColorStop(0, "rgba(62,207,142,.55)"); gl.addColorStop(1, "rgba(62,207,142,0)");
      g.fillStyle = gl; g.beginPath(); g.arc(x, y, 16 * dpr, 0, 6.2832); g.fill();
      g.fillStyle = "#3ecf8e"; g.beginPath(); g.arc(x, y, 4.2 * dpr, 0, 6.2832); g.fill();
      g.fillStyle = "#eafff5"; g.beginPath(); g.arc(x, y, 1.6 * dpr, 0, 6.2832); g.fill();
      if (pin) { pin.hidden = false; pin.style.left = (x / dpr) + "px"; pin.style.top = (y / dpr) + "px"; }
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) M.raf = requestAnimationFrame(dibuja);
    } else if (pin) pin.hidden = true;
  }
  function gms(v, pos, neg) { return Math.abs(v).toFixed(2) + "°" + (v >= 0 ? pos : neg); }
  function mapa() {
    M.cv = document.getElementById("v2Map"); if (!M.cv) return;
    var s = estado() && estado().on ? lugar() : null;
    M.sitio = s;
    document.getElementById("v2MapK").textContent = t("hashdash.v2.vis.map", "Node location");
    var pin = document.getElementById("v2Pin"), cap = document.getElementById("v2Cap");
    if (s) {
      pin.innerHTML = "<b></b><span></span>";
      pin.querySelector("b").textContent = s.place || s.name || t("hashdash.v2.card.on", "Node on");
      pin.querySelector("span").textContent = gms(s.lat, "N", "S") + " · " + gms(s.lon, "E", "W");
      cap.textContent = "";
    } else {
      cap.textContent = !est ? t("hashdash.v2.vis.mapConn", "Connect your wallet to see your node on the map.") :
        est.r ? t("hashdash.v2.vis.mapOff", "Activate your node to see it on the map.") : "";
    }
    if (!M.raf) M.raf = requestAnimationFrame(dibuja);
  }

  /* ---------- consola del airdrop: lo ganado, segundo a segundo ---------- */
  var K = { timer: 0, tic: 0, rec: 0, intentos: 0, ult: null, lineas: [] };
  var hora = function () { var d = new Date(); return [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (x) { return String(x).padStart(2, "0"); }).join(":"); };
  function linea(txt, cls) {
    K.lineas.push({ h: hora(), txt: txt, cls: cls || "" });
    if (K.lineas.length > 7) K.lineas.shift();
    var el = document.getElementById("v2Log"); if (!el) return;
    el.innerHTML = K.lineas.map(function (l) { return '<p class="' + l.cls + '"><time>' + l.h + "</time>" + esc(l.txt) + "</p>"; }).join("") + '<p class="v2-cur"><time>' + hora() + "</time><i></i></p>";
  }
  function vivo() { var C = window.SACount, r = est && est.r; return C && r ? C.liveEarned(r.items || [], r.closed || 0, Date.now()) : 0; }
  function porDia() { var r = est && est.r, n = Date.now(); return (r && r.items || []).reduce(function (a, it) { return n < it.s + it.sp ? a + it.p / (it.sp / DAY) : a; }, 0); }
  function consola() {
    clearInterval(K.timer); clearInterval(K.tic); clearTimeout(K.rec); K.lineas = []; K.ult = null;
    document.getElementById("v2ConK").textContent = t("hashdash.v2.vis.con", "Airdrop console");
    document.getElementById("v2TotK").textContent = t("hashdash.v2.vis.total", "Earned in the airdrop");
    var live = document.getElementById("v2Live"), tot = document.getElementById("v2Tot"), s = estado();
    live.querySelector("em").textContent = t("hashdash.v2.vis.live", "Live");
    live.hidden = !(s && s.ad);
    if (!est || est.carga || est.err || !s) {
      tot.textContent = "—";
      linea(est && est.carga ? t("hashdash.v2.card.reading", "Reading your staking…") : t("hashdash.v2.vis.lConn", "waiting for your wallet…"), "c-dim");
      return;
    }
    var n = nodo(), p = lugar();
    if (s.on) linea(t("hashdash.v2.vis.lNode", "node “{n}” online").replace("{n}", n && n.name ? n.name : "Hash Node") + (p && p.place ? " · " + p.place : ""), "c-ok");
    else linea(t("hashdash.v2.vis.lOff", "node off: press “Activate my node”"), "c-warn");
    linea(t("hashdash.v2.vis.lStake", "staking: {s} SECT").replace("{s}", num(est.r.bal, 2)), s.stk ? "" : "c-warn");
    if (s.stk) linea(t("hashdash.v2.vis.lLevel", "level {l} · reward {p} SECT").replace("{l}", LV[est.r.level]).replace("{p}", num(est.r.prize)), "c-up");
    if (!s.ad) {
      tot.textContent = num(est.r.earned, 4, 4) + " SECT";
      linea(!s.stk ? t("hashdash.v2.vis.lWait", "airdrop on hold: 100 SECT in staking needed") : t("hashdash.v2.vis.lWaitNode", "airdrop on hold: activate your node"), "c-dim");
      return;
    }
    var pd = porDia();
    // recien activado: aun no hay tiempo dentro (o el reloj va un poco detras); se recalcula en un momento
    if (!(est.r.items || []).length && est.w && K.intentos < 60) {
      K.intentos++;
      K.rec = setTimeout(function () { if (est && est.w) { calcula(est.addr, est.w); consola(); } }, 2000);
    } else if ((est.r.items || []).length) K.intentos = 0;
    linea(t("hashdash.v2.vis.lStart", "airdrop active · {r} SECT per day").replace("{r}", num(pd, 4)), "c-ok");
    K.ult = vivo();
    var pinta = function () { var v = num(vivo(), 6, 6) + " SECT", rel = document.getElementById("v2Rel"); tot.textContent = v; if (rel) rel.textContent = v; };
    pinta(); K.tic = setInterval(pinta, 250);
    K.timer = setInterval(function () {
      var v = vivo(), d = v - K.ult; K.ult = v;
      if (d > 0) linea("+" + num(d, 6, 6) + " SECT · " + t("hashdash.v2.vis.lTot", "total") + " " + num(v, 6, 6) + " SECT", "c-up");
    }, 3000);
  }

  var firma = "";
  function visual() {
    var s = estado(), f = JSON.stringify([est && est.addr, est && !!est.carga, est && !!est.err, s, nodo(), idioma()]);
    mapa();
    if (f !== firma) { firma = f; consola(); }
  }

  function local(addr) { try { return JSON.parse(localStorage.getItem("sectora:v2:node:" + addr.toLowerCase()) || "null"); } catch (e) { return null; } }
  /* estado del airdrop. Si el nodo se activo en este navegador y la constancia publica aun no esta guardada
     (la tarea de GitHub tarda hasta 10 minutos), se cuenta desde la hora de activacion de aqui mientras tanto */
  function calcula(addr, w) {
    var C = window.SACount, nd = w.node, loc = local(addr);
    if (loc && !(nd && nd.act) && C.junta) nd = C.junta(nd, { t: loc.t || Date.now(), n: loc.name, c: loc.place, la: loc.lat, lo: loc.lon }, addr.toLowerCase());
    est = { addr: addr, w: w, r: C.evaluate(w.ev, nd, C.OPEN, Date.now()), nd: nd, reg: !!(w.node && w.node.reg) };
  }
  function carga(addr) {
    var C = window.SACount, mio = ++turno;
    est = { addr: addr, carga: true }; K.intentos = 0; pinta(); avisa(null);
    if (!C) { est = { addr: addr, err: true }; pinta(); return; }
    C.wallet(addr).then(function (w) {
      if (mio !== turno) return;
      var act = (w.node && w.node.act) || null;
      calcula(addr, w);
      // activado en este navegador pero aun sin constancia publica: se vuelve a enviar
      var loc = local(addr);
      if (loc && !act && !est.reg) envia(addr, loc);
      pinta(); avisa({ addr: addr, lv: est.r.level, bal: est.r.bal, reg: est.reg, act: act });
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
    // la tierra del globo llega mejor definida un poco despues: el mapa se repinta
    var rp = window.__sectoraLandRepaint;
    window.__sectoraLandRepaint = function () { if (rp) rp.apply(this, arguments); M.sucia = true; M.base = null; mapa(); };
    var rt; addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { M.base = null; mapa(); }, 200); });
    document.addEventListener("sectora:geo", function () { M.base = null; mapa(); });
  }

  var css = document.createElement("style");
  css.textContent =
    ".v2-node{margin-bottom:clamp(13px,1.6vw,18px);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:clamp(18px,2.6vw,36px);align-items:start}" +
    "@media (max-width:900px){.v2-node{grid-template-columns:1fr}}" +
    ".v2-node .v2-h{margin:12px 0 0;font-size:18px;line-height:1.4;color:var(--ink)}" +
    ".v2-node .v2-n{margin:8px 0 0;max-width:68ch;text-transform:none;letter-spacing:0;font:300 13.5px/1.6 'IBM Plex Sans',system-ui,sans-serif;color:var(--ink3)}" +
    ".v2-node .v2-a{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.v2-node .v2-a .btn{padding:13px 20px;text-decoration:none}" +
    ".v2-node .v2-st{display:flex;align-items:center;gap:12px;margin-top:14px}" +
    ".v2-node .v2-st i{width:12px;height:12px;border-radius:50%;flex:none}" +
    ".v2-node .v2-st b{font-weight:400;font-size:clamp(24px,2.4vw,30px);letter-spacing:-.02em;color:var(--ink)}" +
    ".v2-node .v2-st.on i{background:var(--live);box-shadow:0 0 0 5px rgba(62,207,142,.16),0 0 18px rgba(62,207,142,.55);animation:v2p 2.4s ease-in-out infinite}" +
    ".v2-node .v2-st.on b{color:var(--live)}" +
    ".v2-node .v2-st.off i{background:transparent;border:1.5px solid var(--ink4)}" +
    ".v2-node .v2-rows{margin-top:16px}.v2-node .v2-ok{color:var(--live)}" +
    ".v2-node .v2-wait i{display:inline-block;width:9px;height:9px;margin-right:10px;border-radius:50%;background:var(--blue);animation:v2p 1.2s ease-in-out infinite}" +
    ".v2-node .v2-ad{margin-top:20px;padding:16px 18px;border:1px solid rgba(62,207,142,.28);background:rgba(62,207,142,.04)}" +
    ".v2-ad-g{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px}@media (max-width:520px){.v2-ad-g{grid-template-columns:1fr}}" +
    ".v2-ad-g span{display:block;font:400 9.5px/1.3 'IBM Plex Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--ink3)}" +
    ".v2-ad-g b{display:block;margin-top:6px;font-weight:400;font-size:clamp(18px,1.7vw,22px);color:#fff;font-variant-numeric:tabular-nums;letter-spacing:-.01em}" +
    ".v2-ad-g small{display:block;margin-top:3px;font-size:12px;color:var(--ink3)}" +
    ".v2-ad-d{display:flex;align-items:center;gap:8px;margin:14px 0 0;font:400 10px/1.4 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--live)}" +
    ".v2-ad-p{margin:12px 0 0;font-size:12.5px;line-height:1.55;color:var(--ink3)}" +
    ".v2-ad-d i{width:6px;height:6px;border-radius:50%;background:var(--live);flex:none}.v2-node .v2-ad .v2-a{margin-top:14px}" +
    ".v2-lv{margin-top:18px}.v2-lv > div{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}" +
    ".v2-lv i{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid rgba(21,105,255,.38);background:rgba(21,105,255,.06);font:400 11px/1 'IBM Plex Mono',monospace;font-style:normal;letter-spacing:.1em;text-transform:uppercase;color:var(--ink)}" +
    ".v2-lv i em{font-style:normal;color:var(--blue2);font-size:10px}" +
    ".v2-vis{display:flex;flex-direction:column;gap:12px;min-width:0}" +
    ".v2-map{position:relative;aspect-ratio:2/1;border:1px solid var(--hair);background:#04070d;overflow:hidden}" +
    ".v2-map canvas{position:absolute;inset:0;width:100%;height:100%;display:block}" +
    ".v2-tag{position:absolute;left:12px;top:10px;font:400 9px/1.2 'IBM Plex Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--ink3)}" +
    ".v2-cap{position:absolute;left:0;right:0;bottom:12px;text-align:center;font-size:12.5px;color:var(--ink3);padding:0 16px}" +
    ".v2-pin{position:absolute;transform:translate(14px,-50%);padding:6px 9px;border:1px solid rgba(62,207,142,.4);background:rgba(4,7,13,.82);white-space:nowrap;pointer-events:none}" +
    ".v2-pin b{display:block;font-weight:500;font-size:12px;color:#fff}.v2-pin span{display:block;margin-top:2px;font:400 9.5px/1.3 'IBM Plex Mono',monospace;letter-spacing:.06em;color:var(--live)}" +
    ".v2-con{border:1px solid var(--hair);background:#04070d;font-family:'IBM Plex Mono',monospace}" +
    ".v2-con-h{display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-bottom:1px solid var(--hair);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink3)}" +
    ".v2-live{display:inline-flex;align-items:center;gap:6px;color:var(--live)}.v2-live[hidden]{display:none}.v2-live i{width:6px;height:6px;border-radius:50%;background:var(--live);animation:v2p 1.2s ease-in-out infinite}.v2-live em{font-style:normal}" +
    ".v2-tot{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:12px 12px 4px}" +
    ".v2-tot span{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink4)}.v2-tot b{font-weight:400;font-size:clamp(17px,1.6vw,21px);color:#fff;font-variant-numeric:tabular-nums;letter-spacing:-.01em}" +
    ".v2-log{padding:6px 12px 12px;min-height:150px;font-size:11.5px;line-height:1.75;color:var(--ink2);overflow:hidden}" +
    ".v2-log p{margin:0;padding-left:72px;text-indent:-72px;overflow-wrap:anywhere}.v2-log time{margin-right:10px;color:var(--ink4)}" +
    ".v2-log .c-ok{color:var(--live)}.v2-log .c-up{color:#9fd0ff}.v2-log .c-warn{color:var(--amber)}.v2-log .c-dim{color:var(--ink3)}" +
    ".v2-log .v2-cur i{display:inline-block;width:7px;height:12px;vertical-align:-2px;background:var(--live);animation:v2p 1s steps(1) infinite}" +
    "@keyframes v2p{50%{opacity:.35}}";
  document.head.appendChild(css);
  document.addEventListener("sectora:langchange", function () { firma = ""; pinta(); });
  document.addEventListener("v2:nodo", function () { if (est && est.w) calcula(est.addr, est.w); pinta(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", engancha); else engancha();
})();
