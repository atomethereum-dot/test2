/* Conteo del Airdrop Genesis, calculado en el navegador con datos publicos de la blockchain.
   No hay lista publicada: se leen los eventos Deposited / Withdrawn del staking (Ethereum) y el
   registro de nodos (Sepolia), y con eso se rehace la historia de cada wallet.

   Reglas que aplica:
   - Todos tienen el mismo tiempo para completar su premio (DUR, 150 dias; en la web no se dice el
     numero), contado desde que entran. Las entregas empiezan el 25 mar 2027, 10 dias despues de la
     quema: quien ya completo su tiempo cobra ese dia; quien entro despues, al completarlo. Asi las
     entregas se reparten en el tiempo.
   - Premio = % del nivel sobre todo lo que tiene en staking: Scout 40 % (desde 100 SECT),
     Sentinel 50 % (500), Guardian 60 % (1.000) y Titan 85 % (4.000, sin maximo). 1.500 SECT = 900.
     Cada saldo alcanzado es una capa con lo que suma al premio (p. ej. de 1.000 a 1.500: +300), asi
     que lo que se agrega tarde solo suma desde ese dia.
   - Una capa suma mientras el saldo esta en su umbral o mas (no antes de la apertura ni del registro
     del nodo). Si el saldo baja, la capa se pausa con los dias que lleva; si vuelve a subir, sigue
     donde quedo: las horas fuera no suman y su fecha de cobro se corre lo mismo. Con menos de 30
     dias dentro no gana nada; desde el dia 30 lo ganado es suyo. Nunca paga mas que su parte del premio.
   - Sin nodo activo no cuenta (estimacion conservadora: no se conoce cuando se apago).
   Usado por el verificador publico (una wallet) y por el panel privado (todas). */
(function (root) {
  "use strict";
  var STAKING = "0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0";
  var REGISTRY = "0x8dba83ffA1dF76B4136B39C9edfCD6Ca0B2e9BF1";
  var MAINNET = ["https://ethereum-rpc.publicnode.com", "https://eth.drpc.org", "https://1rpc.io/eth"];
  var SEPOLIA = ["https://ethereum-sepolia-rpc.publicnode.com", "https://sepolia.drpc.org"];
  var T_DEP = "0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4"; // Deposited(address,uint256)
  var T_WD = "0x7084f5476618d8e60b11ef0d7d3f06914655adb8793e28ff7f018d4c76d505d5";  // Withdrawn(address,uint256)
  var SEL = { indexPlusOne: "0x7f0b8642", validators: "0x35aa2e44", count: "0x0f43a677" };
  // el staking se desplego el 9 oct 2026: se leen eventos desde un dia antes
  var DEPLOYED = Date.UTC(2026, 9, 8);
  // fecha de apertura del airdrop (ms). null = aun no abre. Ej.: Date.UTC(2026, 10, 1)
  var OPEN = null;
  // entrega: 25 de marzo de 2027, 10 dias despues de la quema del 15 de marzo
  var END = Date.UTC(2027, 2, 25);
  var DAY = 864e5, MIN = 30, BAG = 7e6, DUR = 150 * DAY;
  var LEVELS = [100, 500, 1000, 4000];
  var RATE = { 0: 0, 1: 0.4, 2: 0.5, 3: 0.6, 4: 0.85 };

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

  // eventos del staking por tramos; si el nodo rechaza el tramo, se parte a la mitad
  function logs(topic1) {
    return rpc(MAINNET, "eth_blockNumber", []).then(function (h) {
      var latest = parseInt(h, 16), from = Math.max(0, latest - Math.ceil((Date.now() - DEPLOYED) / 12000) - 2000);
      var all = [], step = 50000;
      function go(a) {
        if (a > latest) return Promise.resolve(all);
        var b = Math.min(latest, a + step - 1);
        return rpc(MAINNET, "eth_getLogs", [{ address: STAKING, fromBlock: hex(a), toBlock: hex(b), topics: [[T_DEP, T_WD], topic1 || null] }])
          .then(function (r) { all = all.concat(r); return go(b + 1); })
          .catch(function (e) { if (step <= 500) throw e; step = Math.floor(step / 2); return go(a); });
      }
      return go(from);
    });
  }
  // hora de cada bloque (si el nodo no la trae en el evento)
  function stamp(list) {
    var need = {}; list.forEach(function (l) { if (!l.blockTimestamp) need[l.blockNumber] = 1; });
    var blocks = Object.keys(need);
    return batch(MAINNET, blocks.map(function (b) { return ["eth_getBlockByNumber", [b, false]]; })).then(function (res) {
      var t = {}; blocks.forEach(function (b, i) { t[b] = res[i] && res[i].timestamp; });
      return list.map(function (l) {
        var ts = parseInt(l.blockTimestamp || t[l.blockNumber], 16) * 1000;
        return { who: "0x" + l.topics[1].slice(26).toLowerCase(), dep: l.topics[0] === T_DEP, amt: sect(BigInt(l.data)), t: ts,
          bn: parseInt(l.blockNumber, 16), li: parseInt(l.logIndex, 16), tx: l.transactionHash || "" };
      }).sort(function (x, y) { return x.bn - y.bn || x.li - y.li; });
    });
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
  function parseNode(v) { return { who: "0x" + v.slice(26, 66).toLowerCase(), at: Number(word(v, 5)) * 1000, active: word(v, 6) === 1n }; }
  function nodes() {
    return rpc(SEPOLIA, "eth_call", [{ to: REGISTRY, data: SEL.count }, "latest"]).then(function (h) {
      var n = Number(word(h, 0)), calls = [];
      for (var i = 0; i < n; i++) calls.push(["eth_call", [{ to: REGISTRY, data: SEL.validators + pad(i.toString(16)).slice(2) }, "latest"]]);
      return batch(SEPOLIA, calls);
    }).then(function (res) { var m = {}; res.forEach(function (v) { if (v) { var x = parseNode(v); m[x.who] = x; } }); return m; });
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
    if (!lv) { r.status = nd ? "p2" : "out"; return r; }
    if (!nd || !nd.active) { r.status = "nonode"; return r; }
    var base = null, last = 0, pays = {}, by = {};
    h.layers.forEach(function (L) { (by[L.at] = by[L.at] || []).push(L); });
    Object.keys(by).map(Number).sort(function (a, b) { return a - b; }).forEach(function (at) {
      var P = by[at][0].p, acc = 0, paid = 0, prevE = 0, segs = [];
      by[at].forEach(function (L) {
        var s = Math.max(L.start, open, nd.at), e = L.end == null ? now : L.end;
        if (e > s) segs.push({ s: s, e: e, end: L.end });
      });
      if (!segs.length) return;
      // los dias dentro se acumulan: si sale, la parte se pausa; si vuelve, sigue donde quedo
      var row = { at: at, p: P, s: segs[0].s, end: null, d: 0, gap: 0, got: 0, state: "" };
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
    r.status = !base ? (r.closed > 0 ? "left" : "out") : now >= r.end ? "full" : r.day < MIN ? "early" : "run";
    return r;
  }
  // lo ganado en un instante, solo con las capas abiertas (para el contador en vivo)
  function liveEarned(items, closed, now) {
    var s = closed; items.forEach(function (it) { s += it.p * Math.min(1, Math.max(0, (now - it.s) / it.sp)); }); return s;
  }

  /* ---------- una wallet (verificador) o todas (panel) ---------- */
  function wallet(addr) {
    return Promise.all([logs(pad(addr)).then(stamp), node(addr).catch(function () { return null; })])
      .then(function (r) { return { ev: r[0], node: r[1] }; });
  }
  function everyone(onStep) {
    onStep && onStep("staking");
    return logs(null).then(function (l) { onStep && onStep("horas"); return stamp(l); }).then(function (ev) {
      onStep && onStep("nodos");
      return nodes().catch(function () { return {}; }).then(function (nd) {
        var by = {}; ev.forEach(function (e) { (by[e.who] = by[e.who] || []).push(e); });
        Object.keys(nd).forEach(function (w) { by[w] = by[w] || []; });
        var list = Object.keys(by);
        onStep && onStep("saldos");
        return accounts(list).catch(function () { return {}; }).then(function (acc) {
          return list.map(function (w) { return { who: w, ev: by[w], node: nd[w] || null, acc: acc[w] || null }; });
        });
      });
    });
  }

  root.SACount = { OPEN: root.SA_OPEN !== undefined ? root.SA_OPEN : OPEN, END: END, DAY: DAY, DUR: DUR, MIN: MIN, BAG: BAG, RATE: RATE, prize: prize,
    level: level, layers: layers, evaluate: evaluate, liveEarned: liveEarned, wallet: wallet, everyone: everyone };
})(window);
