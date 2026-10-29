/* ═══════════ /testv2: Hash Market sin Sepolia ═══════════
   Los mismos paquetes de siempre, sin pagos ni red de pruebas:
   - el plan del airdrop (Node Kit, 50 TH/s) va incluido con el staking: con 100 SECT o mas en staking
     queda activo solo al conectar la wallet (lo dice nodo.js en window.__v2Estado);
   - los demas paquetes se activan al conectar, gratis, y se guardan en este navegador. No cuentan
     para el airdrop: para el airdrop solo cuenta el plan de 50 TH/s con staking.
   Usa las piezas del mercado del dashboard (PK, kind, sel, mio, reg, conectado) y reemplaza su
   resumen, sus paquetes y su plan. Los clics de comprar y del plan no llegan a la compra en Sepolia. */
(function () {
  "use strict";
  var tt = function (k, f) { var v = window.SECTORA_T && window.SECTORA_T(k); return v && v !== k ? v : f; };
  var $ = function (s) { return document.querySelector(s); };
  var KIT = "1-0";                                    // Node Kit 50 TH/s, el plan del airdrop
  var est = function () { return window.__v2Estado || null; };
  var conStake = function () { var e = est(); return !!(e && e.lv > 0); };
  var clave = function () { var e = est(); return e ? "sectora:v2:pk:" + e.addr.toLowerCase() : ""; };
  function activos() { try { return JSON.parse(localStorage.getItem(clave()) || "[]"); } catch (e) { return []; } }
  function guarda(l) { try { localStorage.setItem(clave(), JSON.stringify(l)); } catch (e) {} }
  var activo = function (id) { return id === KIT ? conStake() : est() ? activos().indexOf(id) >= 0 : false; };
  var elegido = function () { return sel === null ? null : PK[kind][sel]; };

  // hash en pantalla: el plan con staking + lo activado
  function suma() {
    var h = 0;
    if (conectado && est()) {
      if (conStake()) h += 50;
      activos().forEach(function (id) { var p = id.split("-"); var x = PK[+p[0]] && PK[+p[0]][+p[1]]; if (x && id !== KIT) h += x.h; });
    }
    mio = h; reg = conStake();
  }

  pintaPks = function () {
    var box = $("#pks"); if (!box) return;
    box.innerHTML = PK[kind].map(function (p, i) {
      var id = kind + "-" + i, on = activo(id);
      return '<button class="pk' + (sel === i ? " on" : "") + (on ? " v2-on" : "") + '" data-i="' + i + '" type="button">' +
        (p.tag ? '<span class="pk-tag">' + t(p.tagk, p.tag) + "</span>" : "") +
        '<span class="pk-h num">' + p.h + "<em>TH/s</em></span>" +
        '<span class="pk-p">' + (on ? "✓ " + tt("hashdash.v2.buy.on", "Active") : tt("hashdash.v2.pk.free", "Free on testnet")) + "</span>" +
        '<span class="pk-n">' + t(p.notak, p.nota) + "</span></button>";
    }).join("");
    box.querySelectorAll(".pk").forEach(function (b) { b.onclick = function () { sel = +b.dataset.i; pintaPks(); resumen(); }; });
  };

  resumen = function () {
    var p = elegido(); if (!$("#sName")) return;
    $("#sName").textContent = p ? t(p.nk, p.n) : "—";
    $("#sHash").textContent = p ? p.h + " TH/s" : "—";
    $("#sPrice").textContent = p ? (kind + "-" + sel === KIT ? tt("hashdash.v2.plan.pr", "Included with your staking") : tt("hashdash.v2.pk.free", "Free on testnet")) : "—";
    var b = $("#bBuy"); if (!b) return;
    var id = p ? kind + "-" + sel : "", leyendo = conectado && !est();
    b.dataset.v2 = "";
    if (!conectado) { b.disabled = false; b.dataset.v2 = "connect"; b.textContent = tt("hashdash.v2.buy.connect", "Connect wallet to activate"); }
    else if (!p) { b.disabled = true; b.textContent = t("hashdash.buy.selectPackage", "Select a package"); }
    else if (leyendo) { b.disabled = true; b.textContent = tt("hashdash.v2.card.reading", "Reading your staking…"); }
    else if (id === KIT && !conStake()) { b.disabled = false; b.dataset.v2 = "stake"; b.textContent = tt("hashdash.v2.buy.kitNeed", "Needs 100 SECT in staking"); }
    else if (activo(id)) { b.disabled = true; b.textContent = id === KIT ? tt("hashdash.v2.buy.kitOn", "Included with your staking ✓") : "✓ " + tt("hashdash.v2.buy.on", "Active"); }
    else { b.disabled = false; b.dataset.v2 = "act"; b.textContent = tt("hashdash.v2.buy.act", "Activate {h} TH/s").replace("{h}", p.h); }
  };

  /* nombre y ubicacion del nodo (formulario dentro del recuadro del plan, ubicacion automatica de
     dashboard-node-geo.js): al activar se guardan en este navegador y el nodo aparece en el mapa.
     Los nodos ya registrados en la red no necesitan nada: ya estan en el mapa. */
  var enMapa = {}, esperas = 0;
  var nodoKey = function () { var e = est(); return e ? "sectora:v2:node:" + e.addr.toLowerCase() : ""; };
  function nodoLeer() { try { return JSON.parse(localStorage.getItem(nodoKey()) || "null"); } catch (e) { return null; } }
  // encender el nodo no pide staking: basta la wallet conectada
  function activa(manual) {
    var e = est(); if (!e) return false;
    if (e.reg) return true;
    var n = nodoLeer();
    if (!n) {
      var la = parseFloat(($("#nLat") || {}).value), lo = parseFloat(($("#nLon") || {}).value);
      if (!isFinite(la) || !isFinite(lo) || Math.abs(la) > 85 || Math.abs(lo) > 180) {
        if (manual) { var f = $(".v2-reg .form"); if (f) f.classList.remove("geo-auto"); var x = $("#nLat"); if (x) x.focus(); }
        return false;
      }
      var g = $("#nGeo b");
      n = { name: (($("#nName") || {}).value || "").trim().slice(0, 48) || "Sectora Node", lat: la, lon: lo, place: g ? g.textContent : "" };
      try { localStorage.setItem(nodoKey(), JSON.stringify(n)); } catch (er) {}
      var w = window.__sectoraWallet; if (w && w.aviso) w.aviso(tt("hashdash.v2.reg.toast", "Node “{n}” activated").replace("{n}", n.name));
      document.dispatchEvent(new Event("v2:nodo"));
    }
    if (!enMapa[nodoKey()]) {
      enMapa[nodoKey()] = 1;
      if (typeof window.__sectoraMapAdd === "function") window.__sectoraMapAdd(n.lon, n.lat, n.name);
      if (typeof window.__sectoraAddNode === "function") window.__sectoraAddNode(n.lon, n.lat);
    }
    return true;
  }
  function resumenNodo(on) {
    var reg = $(".v2-reg"), sum = $("#v2Sum"); if (!reg || !sum) return;
    reg.hidden = on; sum.hidden = !on;
    if (!on) return;
    var e = est(), n = nodoLeer(), sp = sum.querySelector("span");
    if (e && e.reg) sp.textContent = tt("hashdash.v2.reg.old", "Your node is already registered on the network map.");
    else if (n) { sp.innerHTML = ""; var b = document.createElement("b"); b.textContent = n.name; sp.appendChild(b); if (n.place) sp.appendChild(document.createTextNode(" · " + n.place)); }
  }

  /* el recuadro del plan hace todo: "Activar mi nodo" conecta la wallet y deja el nodo activado ahi mismo.
     El staking va aparte: con el nodo activado y 100 SECT en staking (en cualquier orden) el airdrop queda activo */
  plan = function () {
    var st = $("#planSt"), bp = $("#bPlan"); if (!st || !bp) return;
    var txt, ok = 0, act, lbl;
    if (!conectado) { txt = tt("hashdash.v2.plan.st0", "Connect your wallet to activate the plan."); act = "connect"; lbl = tt("hashdash.v2.plan.btn", "Activate my node"); }
    else if (!est()) { txt = tt("hashdash.v2.card.reading", "Reading your staking…"); act = "wait"; lbl = txt; }
    else if (activa(false) && conStake()) { txt = tt("hashdash.v2.plan2.stBoth", "Node active · Airdrop active."); ok = 2; act = "on"; lbl = tt("hashdash.v2.plan.btnOn", "Node active ✓"); }
    else if (activa(false)) { txt = tt("hashdash.v2.plan2.stNode", "Node active. To activate your airdrop, put 100 SECT in staking."); ok = 2; act = "stake"; lbl = tt("hashdash.v2.card.stake", "Go to staking"); }
    else {
      // falta la ubicacion: se espera a que llegue sola o a que se escriba y se pulse el boton
      txt = tt("hashdash.node.geoWait", "Detecting your node's location…"); act = "save"; lbl = tt("hashdash.v2.plan.btn", "Activate my node");
      if (esperas++ < 40) setTimeout(function () { plan(); }, 700);
    }
    st.querySelector("span").textContent = txt;
    st.className = "plan-st" + (ok === 2 ? " ok" : "");
    bp.hidden = false; bp.dataset.act = act;
    bp.disabled = act === "wait" || act === "on";
    bp.classList.toggle("v2-ok", act === "on");
    bp.querySelector("span").textContent = lbl;
    resumenNodo(ok === 2);
  };

  function todo() { suma(); pintaPks(); resumen(); progreso(); }

  // los clics de comprar y del plan se quedan aqui: nunca llegan a la compra en Sepolia
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#bBuy, #bPlan");
    if (!b) return;
    e.stopPropagation(); e.preventDefault();
    var a = b.id === "bPlan" ? b.dataset.act : b.dataset.v2;
    if (a === "connect") { var bc = $("#bConnect"); if (bc) bc.click(); }
    else if (a === "stake") location.href = "/staking/";
    else if (a === "save") { if (activa(true)) todo(); }
    else if (a === "act") {
      var p = elegido(); if (!p) return;
      var l = activos(), id = kind + "-" + sel;
      if (l.indexOf(id) < 0) { l.push(id); guarda(l); }
      todo();
      if (window.__sectoraWallet && window.__sectoraWallet.aviso) window.__sectoraWallet.aviso(tt("hashdash.v2.buy.toast", "{h} TH/s activated").replace("{h}", p.h));
    }
  }, true);

  // el hash y el registro salen del staking, no de Sepolia
  function engancha() {
    var mk = window.__sectoraMarket;
    if (!mk) return setTimeout(engancha, 150);
    mk.setHash = function () { todo(); };
    mk.setReg = function () { todo(); };
    var w = window.__sectoraWallet;
    if (w) { var oc = w.onConnect, od = w.onDisconnect;
      w.onConnect = function (d, b) { if (oc) oc.call(w, d, b); todo(); };
      w.onDisconnect = function () { if (od) od.call(w); todo(); }; }
    todo();
  }
  document.addEventListener("v2:estado", todo);
  document.addEventListener("sectora:langchange", function () { setTimeout(todo, 0); });
  var css = document.createElement("style");
  css.textContent = ".plan-r .v2-reg[hidden],.plan-r #bReg{display:none!important}.plan-r .form{display:flex;flex-direction:column;align-items:stretch;gap:10px}.plan-r .v2-sum[hidden]{display:none!important}" +
    ".plan-r .node-geo{margin:2px 0 0;flex-wrap:nowrap;align-items:flex-start}.plan-r .node-geo i{margin-top:7px}.plan-r .node-geo span{flex:1;min-width:0}.plan-r .node-geo button{flex:none;margin-left:6px;padding:0}.plan-r .node-geo-n{margin:0}.plan-r .node-geo-a{margin:10px 0 0}.plan-r .v2-reg{display:flex;flex-direction:column;gap:10px}.plan-r .v2-sum{margin:2px 0 0}.plan-r .v2-sum b{color:#fff;font-weight:500}" +
    "#bPlan.v2-ok,#bPlan.v2-ok:disabled{background:rgba(62,207,142,.1)!important;border:1px solid rgba(62,207,142,.55)!important;color:var(--live)!important;opacity:1!important;cursor:default}.pk.v2-on .pk-p{color:var(--live)}.buy .split{display:none!important}.plan-pr{font-size:13px;letter-spacing:.04em;color:var(--live)}";
  document.head.appendChild(css);
  engancha();
})();
