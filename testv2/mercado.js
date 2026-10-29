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

  /* el recuadro del plan hace todo: "Activar mi nodo" conecta la wallet y, al leer el staking, queda
     "Nodo activado" ahi mismo (o pide los 100 SECT). No lleva a ninguna otra parte de la pagina */
  plan = function () {
    var st = $("#planSt"), bp = $("#bPlan"); if (!st || !bp) return;
    var txt, ok = 0, act, lbl;
    if (!conectado) { txt = tt("hashdash.v2.plan.st0", "Connect your wallet to activate the plan."); act = "connect"; lbl = tt("hashdash.v2.plan.btn", "Activate my node"); }
    else if (!est()) { txt = tt("hashdash.v2.card.reading", "Reading your staking…"); act = "wait"; lbl = txt; }
    else if (conStake()) { txt = tt("hashdash.v2.plan.stOk", "Plan active · your node is on."); ok = 2; act = "on"; lbl = tt("hashdash.v2.plan.btnOn", "Node active ✓"); }
    else { txt = tt("hashdash.v2.plan.stNeed", "You need 100 SECT in staking to activate the plan."); act = "stake"; lbl = tt("hashdash.v2.card.stake", "Go to staking"); }
    st.querySelector("span").textContent = txt;
    st.className = "plan-st" + (ok === 2 ? " ok" : "");
    bp.hidden = false; bp.dataset.act = act;
    bp.disabled = act === "wait" || act === "on";
    bp.classList.toggle("v2-ok", act === "on");
    bp.querySelector("span").textContent = lbl;
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
  css.textContent = "#bPlan.v2-ok,#bPlan.v2-ok:disabled{background:rgba(62,207,142,.1)!important;border:1px solid rgba(62,207,142,.55)!important;color:var(--live)!important;opacity:1!important;cursor:default}.pk.v2-on .pk-p{color:var(--live)}.buy .split{display:none!important}.plan-pr{font-size:13px;letter-spacing:.04em;color:var(--live)}";
  document.head.appendChild(css);
  engancha();
})();
