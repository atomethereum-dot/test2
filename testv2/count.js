/* Conteo del Airdrop Genesis, calculado en el navegador con datos publicos de la blockchain.
   No hay lista publicada: se leen los eventos Deposited / Withdrawn del staking (Ethereum) y el
   registro de nodos (Sepolia), y con eso se rehace la historia de cada wallet.

   Reglas que aplica:
   - Todos tienen el mismo tiempo para completar su premio (DUR, 150 dias; en la web no se dice el
     numero), contado desde que entran. Las entregas empiezan el 25 mar 2027, 10 dias despues de la
     quema: quien ya completo su tiempo cobra ese dia; quien entro despues, al completarlo. Asi las
     entregas se reparten en el tiempo.
   - Premio = % del nivel sobre todo lo que tiene en staking: Scout 55 % (desde 100 SECT),
     Sentinel 65 % (500), Guardian 75 % (1.000) y Titan 90 % (4.000, sin maximo). 2.000 SECT = 1.500.
     Cada saldo alcanzado es una capa con lo que suma al premio (p. ej. de 1.000 a 1.500: +375), asi
     que lo que se agrega tarde solo suma desde ese dia.
   - Una capa suma mientras el saldo esta en su umbral o mas (no antes de la apertura ni del registro
     del nodo). Si el saldo baja, la capa se pausa con los dias que lleva; si vuelve a subir, sigue
     donde quedo: las horas fuera no suman y su fecha de cobro se corre lo mismo. Con menos de 30
     dias dentro no gana nada; desde el dia 30 lo ganado es suyo. Nunca paga mas que su parte del premio.
   - El nodo: se lee su historial en Sepolia (apagados y encendidos del registro). El tiempo con el
     nodo apagado no suma, igual que estar fuera del staking: la parte se pausa y sigue al encenderlo.
   Usado por el verificador publico (una wallet) y por el panel privado (todas).

   PRUEBA /testv2 - nodo activado en el Dashboard, sin Sepolia: al pulsar "Activar mi nodo" la web envia un
   aviso (ntfy.sh) y GitHub lo guarda en nodos/activaciones.json con la hora del servidor. El nodo de una wallet
   es su registro en Sepolia (igual que siempre) mas su activacion: lo de antes no cambia y desde la activacion
   queda encendido. El airdrop cuenta con nodo y staking, en el orden que sea. */
(function (root) {
  "use strict";
  var STAKING = "0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0";
  var REGISTRY = "0x8dba83ffA1dF76B4136B39C9edfCD6Ca0B2e9BF1";
  var MAINNET = ["https://ethereum-rpc.publicnode.com", "https://eth.drpc.org", "https://1rpc.io/eth"];
  // historial de eventos: varios nodos gratis no dan bloques antiguos (piden token de archivo o devuelven vacio); estos si
  var LOGS = ["https://gateway.tenderly.co/public/mainnet", "https://rpc.mevblocker.io", "https://ethereum-rpc.publicnode.com"];
  var SEPOLIA = ["https://ethereum-sepolia-rpc.publicnode.com", "https://sepolia.gateway.tenderly.co"];
  var T_DEP = "0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4"; // Deposited(address,uint256)
  var T_WD = "0x7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d5";  // Withdrawn(address,uint256)
  var SEL = { indexPlusOne: "0x7f0b8642", validators: "0x35aa2e44", count: "0x0f43a677" };
  // registro de nodos: apagado, encendido y nuevo registro (que tambien lo enciende)
  var T_OFF = "0x23d934bfe7f1275bc6fd70432159c9cc1c0075d069f89da6a40f43bfe7a94ed3"; // ValidatorDeactivated(address)
  var T_ON = "0x65cf6d2b9cf96b1ffffa32041ec7c360f76b05f5f4f5e13c7f19495246d6f4f4";  // ValidatorReactivated(address)
  var T_UPD = "0xc2d41a2c5080290dc5fce01cd3232300d606ae866d8685d46b8ba3814adc5823"; // ValidatorUpdated(address,string,int32,int32,uint256)
  // el staking se desplego el 9 oct 2026: se leen eventos desde un dia antes
  var DEPLOYED = Date.UTC(2026, 9, 8);
  // apertura oficial del airdrop (ms): 27 oct 2026, dia del lanzamiento
  var OPEN = Date.UTC(2026, 9, 27);
  // fecha prevista (interna) del lanzamiento de SectoraEVM, cuando empiezan las entregas; la web no la muestra
  var END = Date.UTC(2027, 2, 25);
  var DAY = 864e5, MIN = 30, BAG = 7e6, DUR = 150 * DAY;
  // nodos activados en el Dashboard (los guarda la tarea "Nodos activados" de GitHub)
  var ACT_URL = "https://raw.githubusercontent.com/atomethereum-dot/test2/refs/heads/claude/website-build-i9rofc/nodos/activaciones.json";
  var LEVELS = [100, 500, 1000, 4000];
  var RATE = { 0: 0, 1: 0.55, 2: 0.65, 3: 0.75, 4: 0.9 };

  /* ---------- red ---------- */
  function post(url, body) {
    var ctl = new AbortController(), tm = setTimeout(function () { ctl.abort(); }, 15000);
    return fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: ctl.signal })
      .then(function (r) { clearTimeout(tm); return r.json(); }, function (e) { clearTimeout(tm); throw e; });
  }
  function rpc(urls, method, params) {
    var i = 0;
    function next() {
      if (i >= urls.length) return Promise.reject(new Error("rpc " + method));
      return post(urls[i++], { jsonrpc: "2.0", id: 1, method: method, params: params })
        .then(function (j) { if (!j || j.error || j.result === undefined) throw new Error("rpc"); return j.result; })
        .catch(next);
    }
    return next();
  }
  // varias llamadas en un solo envio; si el nodo no acepta lotes, una por una
  function batch(urls, calls) {
    if (!calls.length) return Promise.resolve([]);
    var out = [], size = 25, chunks = [];
    for (var k = 0; k < calls.length; k += size) chunks.push(calls.slice(k, k + size));
    return chunks.reduce(function (p, ch, ci) {
      return p.then(function () {
        var body = ch.map(function (c, j) { return { jsonrpc: "2.0", id: j, method: c[0], params: c[1] }; });
        return post(urls[0], body).then(function (res) {
          if (!Array.isArray(res)) throw new Error("batch");
          var byId = {}; res.forEach(function (r) { byId[r.id] = r; });
          ch.forEach(function (c, j) { var r = byId[j]; if (!r || r.error) throw new Error("batch item"); out[ci * size + j] = r.result; });
        }).catch(function () {
          return ch.reduce(function (q, c, j) { return q.then(function () { return rpc(urls, c[0], c[1]).then(function (v) { out[ci * size + j] = v; }); }); }, Promise.resolve());
        });
      });
    }, Promise.resolve()).then(function () { return out; });
  }
  function hex(n) { return "0x" + n.toString(16); }
  function pad(a) { return "0x" + a.toLowerCase().replace(/^0x/, "").padStart(64, "0"); }
  function word(h, n) { return BigInt("0x" + (h.slice(2 + 64 * n, 2 + 64 * (n + 1)) || "0")); }
  function sect(big) { return Number(big / 10n ** 14n) / 1e4; }

  // eventos de un contrato desde `since`, por tramos (12 s por bloque); si el nodo rechaza el tramo, se parte a la mitad
  function scan(urls, address, topics, since) {
    return rpc(urls, "eth_blockNumber", []).then(function (h) {
      var latest = parseInt(h, 16), from = Math.max(0, latest - Math.ceil((Date.now() - since) / 12000) - 2000);
      var all = [], step = 50000;
      function go(a) {
        if (a > latest) return Promise.resolve(all);
        var b = Math.min(latest, a + step - 1);
        return rpc(urls, "eth_getLogs", [{ address: address, fromBlock: hex(a), toBlock: hex(b), topics: topics }])
          .then(function (r) { all = all.concat(r); return go(b + 1); })
          .catch(function (e) { if (step <= 500) throw e; step = Math.floor(step / 2); return go(a); });
      }
      return go(from);
    });
  }
  // hora de cada evento (si el nodo no la trae) y orden de la cadena
  function times(urls, list) {
    var need = {}; list.forEach(function (l) { if (!l.blockTimestamp) need[l.blockNumber] = 1; });
    var blocks = Object.keys(need);
    return batch(urls, blocks.map(function (b) { return ["eth_getBlockByNumber", [b, false]]; })).then(function (res) {
      var t = {}; blocks.forEach(function (b, i) { t[b] = res[i] && res[i].timestamp; });
      return list.map(function (l) { return { l: l, t: parseInt(l.blockTimestamp || t[l.blockNumber], 16) * 1000, bn: parseInt(l.blockNumber, 16), li: parseInt(l.logIndex, 16) }; })
        .sort(function (x, y) { return x.bn - y.bn || x.li - y.li; });
    });
  }
  function logs(topic1) { return scan(LOGS, STAKING, [[T_DEP, T_WD], topic1 || null], DEPLOYED); }
  function stamp(list) {
    return times(LOGS, list).then(function (x) {
      return x.map(function (o) {
        var l = o.l;
        return { who: "0x" + l.topics[1].slice(26).toLowerCase(), dep: l.topics[0] === T_DEP, amt: sect(BigInt(l.data)), t: o.t, bn: o.bn, li: o.li, tx: l.transactionHash || "" };
      });
    });
  }
  // tramos con el nodo encendido: desde el registro, cortados por cada apagado y reabiertos al encender
  function spans(n, evs) {
    var out = [], cur = n.at;
    evs.forEach(function (e) {
      if (e.t < n.at) return;
      if (!e.on && cur != null) { if (e.t > cur) out.push([cur, e.t]); cur = null; }
      else if (e.on && cur == null) cur = e.t;
    });
    if (cur != null && n.active) out.push([cur, Infinity]);   // si no cuadra con el estado actual, lo seguro: apagado
    return out;
  }
  // historial de los nodos en Sepolia; si no se puede leer, se queda sin `spans` y cuenta solo el estado actual
  function history(nd, topic1) {
    var list = Object.keys(nd).map(function (k) { return nd[k]; });
    if (!list.length) return Promise.resolve(nd);
    var since = Math.min.apply(null, list.map(function (n) { return n.at; }));
    return scan(SEPOLIA, REGISTRY, [[T_OFF, T_ON, T_UPD], topic1 || null], since).then(function (l) { return times(SEPOLIA, l); }).then(function (x) {
      var by = {};
      x.forEach(function (o) { var w = "0x" + o.l.topics[1].slice(26).toLowerCase(); (by[w] = by[w] || []).push({ t: o.t, on: o.l.topics[0] !== T_OFF }); });
      list.forEach(function (n) { n.spans = spans(n, by[n.who] || []); });
      return nd;
    }).catch(function () { return nd; });
  }
  function node(addr) {
    return rpc(SEPOLIA, "eth_call", [{ to: REGISTRY, data: SEL.indexPlusOne + pad(addr).slice(2) }, "latest"]).then(function (h) {
      var n = word(h, 0); if (n === 0n) return null;
      return rpc(SEPOLIA, "eth_call", [{ to: REGISTRY, data: SEL.validators + pad((n - 1n).toString(16)).slice(2) }, "latest"]).then(parseNode);
    });
  }
  function accounts(list) {
    return batch(MAINNET, list.map(function (w) { return ["eth_call", [{ to: STAKING, data: "0xf85b90e2" + pad(w).slice(2) }, "latest"]]; }))
      .then(function (res) { var m = {}; list.forEach(function (w, i) { var h = res[i]; if (h && h.length >= 2 + 64 * 3) m[w] = { staked: sect(word(h, 0)), claimable: sect(word(h, 1)), wallet: sect(word(h, 2)) }; }); return m; });
  }
  // int32 con signo en una palabra de 256 bits (latitud y longitud en micro-grados)
  function i32(v, n) { var b = word(v, n); if (b >> 255n) b -= 1n << 256n; return Number(b) / 1e6; }
  function parseNode(v) { return { who: "0x" + v.slice(26, 66).toLowerCase(), at: Number(word(v, 5)) * 1000, active: word(v, 6) === 1n, lat: i32(v, 2), lon: i32(v, 3) }; }
  function nodes() {
    return rpc(SEPOLIA, "eth_call", [{ to: REGISTRY, data: SEL.count }, "latest"]).then(function (h) {
      var n = Number(word(h, 0)), calls = [];
      for (var i = 0; i < n; i++) calls.push(["eth_call", [{ to: REGISTRY, data: SEL.validators + pad(i.toString(16)).slice(2) }, "latest"]]);
      return batch(SEPOLIA, calls);
    }).then(function (res) { var m = {}; res.forEach(function (v) { if (v) { var x = parseNode(v); m[x.who] = x; } }); return m; });
  }

  // activaciones: { wallet: { t, n, c, la, lo } }; si no se pueden leer, como si no hubiera ninguna
  var actP = null;
  function activos() {
    if (!actP) actP = fetch(ACT_URL + "?m=" + Math.floor(Date.now() / 60000), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("act"); return r.json(); })
      .then(function (j) { return (j && j.nodos) || {}; })
      .catch(function () { actP = null; return {}; });
    return actP;
  }
  // el nodo de una wallet: su registro en Sepolia (con sus encendidos y apagados) mas su activacion
  function junta(n, a, who) {
    if (!a || !isFinite(a.t)) return n;
    var sp = n ? (n.spans || (n.active ? [[n.at, Infinity]] : [])).map(function (x) { return x.slice(); }) : [];
    sp.push([a.t, Infinity]); sp.sort(function (x, y) { return x[0] - y[0]; });
    var out = [];
    sp.forEach(function (x) { var l = out[out.length - 1]; if (l && x[0] <= l[1]) l[1] = Math.max(l[1], x[1]); else out.push(x); });
    return { who: who, at: n ? Math.min(n.at, a.t) : a.t, active: true, spans: out, reg: !!n, act: a, lat: n ? n.lat : a.la, lon: n ? n.lon : a.lo };
  }

  /* ---------- reglas ---------- */
  function level(b) { return b < 100 ? 0 : b < 500 ? 1 : b < 1000 ? 2 : b < 4000 ? 3 : 4; }
  function prize(b) { return b * RATE[level(b)]; }
  // capas abiertas y cerradas a partir de la historia del saldo
  function layers(ev) {
    var bal = 0, max = 0, steps = [];
    ev.forEach(function (e) { bal = Math.max(0, bal + (e.dep ? e.amt : -e.amt)); max = Math.max(max, bal); steps.push({ t: e.t, b: bal }); });
    // umbrales: los de cada nivel y cada saldo alcanzado; cada capa vale lo que suma al premio
    var at = {}; LEVELS.forEach(function (x) { if (x <= max) at[x] = 1; });
    steps.forEach(function (s) { if (s.b >= 100) at[s.b] = 1; });
    var th = [], prev = 0;
    Object.keys(at).map(Number).sort(function (a, b) { return a - b; }).forEach(function (x) { th.push({ at: x, p: prize(x) - prize(prev) }); prev = x; });
    var out = [];
    th.forEach(function (x) {
      var cur = null;
      steps.forEach(function (s) {
        if (!cur && s.b >= x.at) cur = { at: x.at, p: x.p, start: s.t, end: null };
        else if (cur && s.b < x.at) { cur.end = s.t; out.push(cur); cur = null; }
      });
      if (cur) out.push(cur);
    });
    return { bal: bal, layers: out };
  }
  /* estado de una wallet en el instante `now` con apertura `open` */
  function evaluate(ev, nd, open, now) {
    var h = layers(ev), lv = level(h.bal);
    var r = { bal: h.bal, level: lv, rate: RATE[lv], prize: prize(h.bal), node: nd ? (nd.active ? "on" : "off") : "none",
      earned: 0, secured: 0, closed: 0, proj: 0, items: [], lay: [], pays: [], day: 0, left: 0, status: "", start: 0, end: 0, deliver: 0, nodeAt: nd ? nd.at : 0 };
    if (!open || now < open) { r.status = lv ? (nd && nd.active ? "pre" : "nonode") : (nd ? "p2" : "out"); return r; }
    if (!nd) { r.status = lv ? "nonode" : "out"; return r; }
    var on = nd.spans || (nd.active ? [[nd.at, Infinity]] : []);
    var base = null, last = 0, pays = {}, by = {};
    h.layers.forEach(function (L) { (by[L.at] = by[L.at] || []).push(L); });
    var lo = 0;   // umbral anterior: lo que esta capa suma al staking (para el bono de referidos)
    Object.keys(by).map(Number).sort(function (a, b) { return a - b; }).forEach(function (at) {
      var P = by[at][0].p, acc = 0, paid = 0, prevE = 0, segs = [], below = lo; lo = at;
      by[at].forEach(function (L) {
        var s0 = Math.max(L.start, open), e0 = L.end == null ? now : L.end;
        // solo suma el tiempo con el nodo encendido: con el nodo apagado, la parte se pausa
        on.forEach(function (sp) {
          var s = Math.max(s0, sp[0]), e = Math.min(e0, sp[1]);
          if (e > s) segs.push({ s: s, e: e, end: L.end == null && sp[1] === Infinity ? null : e });
        });
      });
      if (!segs.length) return;
      // los dias dentro se acumulan: si sale, la parte se pausa; si vuelve, sigue donde quedo
      var row = { at: at, lo: below, p: P, s: segs[0].s, end: null, d: 0, gap: 0, got: 0, state: "" };
      segs.forEach(function (g, i) {
        if (i) {
          row.gap += g.s - prevE;
          // si le toco cobrar mientras estaba fuera, eso ya se pago y no se vuelve a pagar
          var due = Math.max(END, prevE), amt = Math.min(P, P * acc / DUR) - paid;
          if (acc >= MIN * DAY && due < g.s && amt > 0) { pays[due] = (pays[due] || 0) + amt; paid += amt; }
        }
        acc += g.e - g.s; prevE = g.e;
      });
      var z = segs[segs.length - 1], inNow = z.end == null, got = Math.min(P, P * acc / DUR), d = acc / DAY;
      row.end = z.end; row.d = d; r.lay.push(row);
      if (!inNow && d < MIN) { row.state = "lost"; return; }   // fuera con menos de 30 dias: nada, salvo que vuelva
      row.got = got; r.earned += got; if (d >= MIN) r.secured += got;
      // cada parte se paga por separado: al completar su tiempo, nunca antes del 25 de marzo
      if (inNow) {
        var s2 = now - acc;                           // inicio corrido: las horas fuera no suman
        r.items.push({ s: s2, p: P, sp: DUR }); r.proj += P;
        if (!base || at < base.at) base = { at: at, s: s2 };
        last = Math.max(last, s2 + DUR); row.due = Math.max(END, s2 + DUR);
        row.state = acc >= DUR ? "full" : d >= MIN ? "run" : "early";
        if (P - paid > 0) pays[row.due] = (pays[row.due] || 0) + P - paid;
      } else {
        row.state = got >= P - 1e-9 ? "full" : "closed"; row.due = Math.max(END, z.e - Math.max(0, acc - DUR));
        r.closed += got; r.proj += got;
        if (got - paid > 0) pays[row.due] = (pays[row.due] || 0) + got - paid;
      }
    });
    // pagos por fecha; r.deliver es el primero y r.end el dia que completa la ultima parte
    r.pays = Object.keys(pays).map(Number).sort(function (a, b) { return a - b; }).map(function (t) { return { t: t, p: pays[t] }; });
    r.deliver = r.pays.length ? r.pays[0].t : 0;
    if (base) { r.day = Math.floor((now - base.s) / DAY) + 1; r.end = last; r.left = Math.max(0, Math.ceil((r.end - now) / DAY)); r.start = base.s; }
    r.status = base ? (now >= r.end ? "full" : r.day < MIN ? "early" : "run") :
      lv && !nd.active ? "nonode" : r.closed > 0 ? "left" : lv ? "out" : "p2";
    return r;
  }
  // lo ganado en un instante, solo con las capas abiertas (para el contador en vivo)
  function liveEarned(items, closed, now) {
    var s = closed; items.forEach(function (it) { s += it.p * Math.min(1, Math.max(0, (now - it.s) / it.sp)); }); return s;
  }

  /* ---------- una wallet (verificador) o todas (panel) ---------- */
  function wallet(addr) {
    var nd = node(addr).then(function (n) {
      return n ? history({ x: n }, pad(addr)).then(function () { return n; }) : null;
    }).catch(function () { return null; });
    return Promise.all([logs(pad(addr)).then(stamp), nd, activos()])
      .then(function (r) { var a = addr.toLowerCase(); return { ev: r[0], node: junta(r[1] && Object.assign(r[1], { reg: true }), r[2][a], a) }; });
  }
  function everyone(onStep) {
    onStep && onStep("staking");
    return logs(null).then(function (l) { onStep && onStep("horas"); return stamp(l); }).then(function (ev) {
      onStep && onStep("nodos");
      return Promise.all([nodes().catch(function () { return {}; }).then(function (nd) { onStep && onStep("historial"); return history(nd); }), activos()]).then(function (z) {
        var nd = z[0], act = z[1];
        // tambien quien solo activo el nodo en el Dashboard (aun sin staking)
        var by = {}; ev.forEach(function (e) { (by[e.who] = by[e.who] || []).push(e); });
        Object.keys(nd).forEach(function (w) { by[w] = by[w] || []; });
        Object.keys(act).forEach(function (w) { by[w] = by[w] || []; });
        var list = Object.keys(by);
        onStep && onStep("saldos");
        return accounts(list).catch(function () { return {}; }).then(function (acc) {
          return list.map(function (w) { return { who: w, ev: by[w], node: junta(nd[w] ? Object.assign(nd[w], { reg: true }) : null, act[w], w), acc: acc[w] || null }; });
        });
      });
    });
  }

  /* ---------- referidos ----------
     El padrino queda en la red sin pasos extra: al registrar su nodo desde el link de invitacion, el Dashboard
     anade al final de esa misma transaccion la marca REF_TAG + la wallet del padrino (el contrato ignora esos bytes).
     Quien ya tenia el nodo puede dejarlo enviando 0,0001 tSECT (la moneda de pruebas, sin valor) a su padrino.
     Las dos cosas solo las puede firmar el invitado: nadie puede apuntarse invitados ajenos, y no hace falta
     ningun contrato nuevo ni servidor. Reglas:
     - cuenta la primera constancia de cada wallet; no vale invitarse a si mismo; en una invitacion mutua vale la primera;
     - tiene que quedar hecha antes de entrar en el airdrop o hasta 7 dias despues (REF_WIN);
     - el padrino gana el 12 % de los SECT que su invitado tiene en staking, al mismo ritmo que el premio del invitado
       (si el invitado sale antes de 30 dias, nada), y se entrega con el airdrop. El padrino tambien tiene que estar dentro.
     - el panel marca ademas si los SECT del invitado salieron de la wallet del padrino (no cuenta).
     - bolsa propia de 840.000 SECT (REF_POOL), aparte de los 7.000.000 del airdrop: si los bonos la superan, se reparte en proporcion. */
  var TSECT = "0x189a39081D99bB9D964dfF7FA756978645592Cf3";
  var SECT = "0x8C9984B06281f1CA9416e493c2E602AaB08513db";
  var T_TR = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"; // Transfer(address,address,uint256)
  var T_REG = "0xa99a387835fe9175c623942eef94297ff971af8cb2893a2f6bfdd49ecb828aaf"; // ValidatorRegistered(address,string,int32,int32,uint256,uint256)
  var REF_TAG = "5ec7a4ef";   // 4 bytes antes de la wallet del padrino, al final del registro del nodo
  var MARK = 10n ** 14n, REF_BONUS = 0.12, REF_WIN = 7 * DAY, REF_POOL = 840000;
  var REF_SINCE = Date.UTC(2026, 9, 28);   // el programa empieza el 28 oct 2026
  var ZERO = /^0x0{40}$/;
  function addr(topic) { return "0x" + topic.slice(26).toLowerCase(); }
  function chunks(list, n) { var out = []; for (var i = 0; i < list.length; i += n) out.push(list.slice(i, i + n)); return out; }
  // constancias (transferencias de 0,0001 tSECT) que casan con los filtros; las listas largas van por tandas
  function transfers(from, to) {
    var tf = from ? chunks(from.map(pad), 40) : [null], tt = to ? chunks(to.map(pad), 40) : [null], jobs = [];
    tf.forEach(function (a) { tt.forEach(function (b) { jobs.push([T_TR, a, b]); }); });
    return jobs.reduce(function (p, topics) {
      return p.then(function (all) { return scan(SEPOLIA, TSECT, topics, REF_SINCE).then(function (l) { return all.concat(l); }); });
    }, Promise.resolve([])).then(function (l) {
      l = l.filter(function (x) { return x.topics.length === 3 && x.data && x.data !== "0x" && BigInt(x.data) === MARK; });
      return times(SEPOLIA, l);
    }).then(function (x) {
      return x.map(function (o) { return { from: addr(o.l.topics[1]), to: addr(o.l.topics[2]), t: o.t, bn: o.bn, li: o.li, tx: o.l.transactionHash || "" }; });
    });
  }
  // padrino que el Dashboard dejo al final del registro del nodo (solo si la firmo la propia wallet, directo al registro)
  function tagOf(tx, who) {
    if (!tx || !tx.input || (tx.from || "").toLowerCase() !== who || (tx.to || "").toLowerCase() !== REGISTRY.toLowerCase()) return "";
    var d = tx.input.toLowerCase(), k = d.length - 48;
    if (k < 10 || (k - 10) % 64 || d.slice(k, k + 8) !== REF_TAG) return "";
    var a = "0x" + d.slice(k + 8);
    return ZERO.test(a) ? "" : a;
  }
  var regAll = null;
  function regs(from) {
    if (!from && regAll) return regAll;
    var p = (from ? chunks(from.map(pad), 40) : [null]).reduce(function (q, a) {
      return q.then(function (all) { return scan(SEPOLIA, REGISTRY, [[T_REG, T_UPD], a], REF_SINCE).then(function (l) { return all.concat(l); }); });
    }, Promise.resolve([])).then(function (l) { return times(SEPOLIA, l); }).then(function (x) {
      return batch(SEPOLIA, x.map(function (o) { return ["eth_getTransactionByHash", [o.l.transactionHash]]; })).then(function (txs) {
        var out = [];
        x.forEach(function (o, i) { var w = addr(o.l.topics[1]), r = tagOf(txs[i], w); if (r) out.push({ from: w, to: r, t: o.t, bn: o.bn, li: o.li, tx: o.l.transactionHash || "" }); });
        return out;
      });
    });
    if (!from) regAll = p.catch(function (e) { regAll = null; throw e; });
    return p;
  }
  // todas las constancias (registro del nodo y transferencias), en el orden de la cadena
  function marks(from, to) {
    return Promise.all([transfers(from, to), regs(from)]).then(function (r) {
      return r[0].concat(r[1].filter(function (m) { return !to || to.indexOf(m.to) >= 0; }))
        .sort(function (a, b) { return a.bn - b.bn || a.li - b.li; });
    });
  }
  // la primera constancia valida de cada wallet; una invitacion mutua solo vale la primera
  function resolve(list) {
    var by = {}, out = [];
    list.forEach(function (m) { if (m.from !== m.to && !ZERO.test(m.from) && !ZERO.test(m.to) && !by[m.from]) by[m.from] = m; });
    Object.keys(by).forEach(function (w) {
      var m = by[w], back = by[m.to];
      var mutua = back && back.to === w && (back.bn < m.bn || (back.bn === m.bn && back.li < m.li));
      out.push({ invitee: w, referrer: m.to, t: m.t, tx: m.tx, bad: mutua ? "mutual" : "" });
    });
    return out.sort(function (a, b) { return a.t - b.t; });
  }
  // quien invito a esta wallet (o null); una invitacion mutua posterior no cuenta
  function refOf(a) {
    a = a.toLowerCase();
    return marks([a], null).then(function (l) {
      var r = resolve(l).filter(function (x) { return x.invitee === a; })[0];
      if (!r) return null;
      return marks([a, r.referrer], null).then(function (l2) {
        var x = resolve(l2).filter(function (y) { return y.invitee === a; })[0];
        return x && !x.bad ? x : null;
      });
    });
  }
  /* invitaciones hechas mas de 7 dias despues de entrar el invitado (no cuentan). Solo se rehace la historia de
     las dudosas: si la constancia llego antes de 7 dias desde el registro del nodo (o la apertura), no puede ser tarde */
  function refLate(list) {
    var open = root.SA_OPEN !== undefined ? root.SA_OPEN : OPEN;
    return Promise.all(list.map(function (x) {
      return node(x.invitee).catch(function () { return null; }).then(function (n) {
        if (!n || x.t <= Math.max(n.at, open) + REF_WIN) return false;
        return wallet(x.invitee).then(function (w) {
          var b = refBonus(evaluate(w.ev, w.node, open, Date.now()));
          return !!b.entry && x.t > b.entry + REF_WIN;
        }).catch(function () { return false; });
      });
    })).then(function (r) { var out = {}; list.forEach(function (x, i) { if (r[i]) out[x.invitee] = 1; }); return out; });
  }
  // a quien invito esta wallet: candidatos que le enviaron la constancia, comprobando que fue su primera
  function refInvitees(a) {
    a = a.toLowerCase();
    return marks(null, [a]).then(function (l) {
      var c = []; l.forEach(function (m) { if (c.indexOf(m.from) < 0 && m.from !== a) c.push(m.from); });
      if (!c.length) return [];
      return marks(c.concat([a]), null).then(function (all) { return resolve(all).filter(function (x) { return x.referrer === a; }); });
    });
  }
  function referrals() { return marks(null, null).then(resolve); }
  // bono del padrino a partir del estado del invitado (evaluate): el 12 % del staking de cada capa, al ritmo de su premio
  function refBonus(r) {
    var got = 0, proj = 0, entry = 0;
    (r.lay || []).forEach(function (row) {
      var s = REF_BONUS * (row.at - (row.lo || 0)), f = row.p ? row.got / row.p : 0;
      if (!entry || row.s < entry) entry = row.s;
      if (row.state === "lost") return;
      got += s * f; proj += row.end == null ? s : s * f;
    });
    return { got: got, proj: proj, entry: entry };
  }
  // pares en los que el padrino envio SECT (Ethereum) a su invitado desde junio de 2026
  function fundedBy(pairs) {
    if (!pairs.length) return Promise.resolve({});
    var refs = [], invs = [];
    pairs.forEach(function (p) { if (refs.indexOf(p.referrer) < 0) refs.push(p.referrer); if (invs.indexOf(p.invitee) < 0) invs.push(p.invitee); });
    var jobs = []; chunks(refs.map(pad), 40).forEach(function (a) { chunks(invs.map(pad), 40).forEach(function (b) { jobs.push([T_TR, a, b]); }); });
    return jobs.reduce(function (p, topics) {
      return p.then(function (all) { return scan(LOGS, SECT, topics, Date.UTC(2026, 5, 1)).then(function (l) { return all.concat(l); }); });
    }, Promise.resolve([])).then(function (l) {
      var m = {}; l.forEach(function (x) { if (x.topics.length === 3) m[addr(x.topics[1]) + ">" + addr(x.topics[2])] = (m[addr(x.topics[1]) + ">" + addr(x.topics[2])] || 0) + sect(BigInt(x.data)); });
      var out = {}; pairs.forEach(function (p) { var k = p.referrer + ">" + p.invitee; if (m[k]) out[p.invitee] = m[k]; });
      return out;
    });
  }

  root.SACount = { OPEN: root.SA_OPEN !== undefined ? root.SA_OPEN : OPEN, END: END, activos: activos, junta: junta, DAY: DAY, DUR: DUR, MIN: MIN, BAG: BAG, RATE: RATE, prize: prize,
    level: level, layers: layers, evaluate: evaluate, liveEarned: liveEarned, wallet: wallet, everyone: everyone,
    REF: { TSECT: TSECT, MARK: MARK, TAG: REF_TAG, BONUS: REF_BONUS, WIN: REF_WIN, SINCE: REF_SINCE, POOL: REF_POOL },
    refOf: refOf, refInvitees: refInvitees, referrals: referrals, refBonus: refBonus, refLate: refLate, fundedBy: fundedBy };
})(window);
