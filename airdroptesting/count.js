/* Conteo del Airdrop Genesis, calculado en el navegador con datos publicos de la blockchain.
   No hay lista publicada: se leen los eventos Deposited / Withdrawn del staking (Ethereum) y el
   registro de nodos (Sepolia), y con eso se rehace la historia de cada wallet.

   Reglas que aplica:
   - Cada umbral es una capa con su parte del premio y sus propios 150 dias: Scout 100 SECT = 40,
     Sentinel 500 = +210 (250), Guardian 1.000 = +350 (600), Titan 4.000 = +2.800 (3.400) y cada
     4.000 mas es otra plaza de 3.400. Asi, subir de nivel tarde solo cuenta desde ese dia.
   - Una capa empieza cuando el saldo cruza su umbral (no antes de la apertura ni del registro
     del nodo) y termina si el saldo baja de el. Si termina antes del dia 30 no gana nada;
     desde el dia 30 se queda con lo ganado. Si vuelve a cruzar, empieza de nuevo.
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
  var DAY = 864e5, DAYS = 150, MIN = 30, BAG = 7e6;
  var LAYERS = [[100, 40, 1], [500, 210, 2], [1000, 350, 3], [4000, 2800, 4]];
  var SPOT = 4000, SPOT_PRIZE = 3400;
  var PRIZE = { 0: 0, 1: 40, 2: 250, 3: 600, 4: 3400 };

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
  // capas abiertas y cerradas a partir de la historia del saldo
  function layers(ev) {
    var bal = 0, max = 0, steps = [];
    ev.forEach(function (e) { bal = Math.max(0, bal + (e.dep ? e.amt : -e.amt)); max = Math.max(max, bal); steps.push({ t: e.t, b: bal }); });
    var th = LAYERS.map(function (l) { return { at: l[0], p: l[1] }; });
    for (var k = 2; k * SPOT <= max; k++) th.push({ at: k * SPOT, p: SPOT_PRIZE });
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
    var h = layers(ev), lv = level(h.bal), spots = lv === 4 ? Math.floor(h.bal / SPOT) : (lv ? 1 : 0);
    var r = { bal: h.bal, level: lv, spots: spots, prize: lv ? PRIZE[lv] * Math.max(1, spots) : 0, node: nd ? (nd.active ? "on" : "off") : "none",
      earned: 0, secured: 0, closed: 0, items: [], lay: [], day: 0, left: 0, status: "", start: 0, end: 0, nodeAt: nd ? nd.at : 0 };
    if (!open || now < open) { r.status = lv ? (nd && nd.active ? "pre" : "nonode") : (nd ? "p2" : "out"); return r; }
    if (!lv) { r.status = nd ? "p2" : "out"; return r; }
    if (!nd || !nd.active) { r.status = "nonode"; return r; }
    var base = null, last = 0;
    h.layers.forEach(function (L) {
      var s = Math.max(L.start, open, nd.at), e = L.end == null ? now : L.end;
      var d = (e - s) / DAY;
      var row = { at: L.at, p: L.p, s: s, end: L.end, d: Math.max(0, d), got: 0, state: L.end == null ? (d >= DAYS ? "full" : d >= MIN ? "run" : "early") : (d < MIN ? "lost" : "closed") };
      r.lay.push(row);
      if (d <= 0) { row.state = L.end == null ? "early" : "lost"; return; }
      if (L.end != null && d < MIN) return;           // salio antes del dia 30: nada
      var got = L.p * Math.min(1, d / DAYS); row.got = got;
      r.earned += got; if (d >= MIN) r.secured += got; if (L.end != null) r.closed += got;
      if (L.end == null) { r.items.push({ s: s, p: L.p }); if (!base || L.at < base.at) base = { at: L.at, s: s }; last = Math.max(last, s); }
    });
    if (base) { r.day = Math.min(DAYS, Math.floor((now - base.s) / DAY) + 1); r.left = Math.max(0, Math.ceil((last + DAYS * DAY - now) / DAY)); r.start = base.s; r.end = last + DAYS * DAY; }
    r.status = !base ? "out" : r.left <= 0 ? "full" : r.day < MIN ? "early" : "run";
    return r;
  }
  // lo ganado en un instante, solo con las capas abiertas (para el contador en vivo)
  function liveEarned(items, closed, now) {
    var s = closed; items.forEach(function (it) { s += it.p * Math.min(1, Math.max(0, (now - it.s) / (DAYS * DAY))); }); return s;
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

  root.SACount = { OPEN: root.SA_OPEN !== undefined ? root.SA_OPEN : OPEN, DAY: DAY, DAYS: DAYS, MIN: MIN, BAG: BAG, PRIZE: PRIZE,
    level: level, layers: layers, evaluate: evaluate, liveEarned: liveEarned, wallet: wallet, everyone: everyone };
})(window);
