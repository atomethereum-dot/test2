/* Mi Airdrop (sectoraorg.com/myairdrop): todo lo que una wallet tiene en Sectora, leido de la blockchain.
   - Premio del Airdrop Genesis: nivel, plazas, premio y lo generado subiendo en vivo (las mismas reglas
     que /airdroptesting, con count.js).
   - Staking en Ethereum: SECT en staking, recompensas por reclamar y SECT en la wallet (accountView).
   - Hash Node en la testnet (Sepolia): estado, nombre, fecha de registro, poder de hash y tiempo encendido.
   - Recompensas de la testnet: tSECT, tSECT gastados en hash, rendimiento por reclamar (sube en vivo),
     lo ya cobrado, ETH de Sepolia para el gas y el grifo.
   - Historial: depositos y retiros del staking y encendidos y apagados del nodo.
   Solo lectura: no pide firmas ni envia transacciones. */
(function () {
  "use strict";
  var C = window.SACount;
  var STAKING = "0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0";
  var TOKEN_T = "0x189a39081D99bB9D964dfF7FA756978645592Cf3";   // tSECT (Sepolia)
  var MARKET = "0x8C9984B06281f1CA9416e493c2E602AaB08513db";    // SectoraHashMarket (Sepolia)
  var REGISTRY = "0x8dba83ffA1dF76B4136B39C9edfCD6Ca0B2e9BF1";  // ValidatorRegistry (Sepolia)
  var MAINNET = ["https://ethereum-rpc.publicnode.com", "https://eth.drpc.org", "https://1rpc.io/eth"];
  var SEPOLIA = ["https://ethereum-sepolia-rpc.publicnode.com", "https://sepolia.gateway.tenderly.co", "https://ethereum-sepolia.publicnode.com"];
  var SEL = {
    accountView: "0xf85b90e2", balanceOf: "0x70a08231", lastFaucet: "0x8a877205", cooldown: "0x7d1d5d19",
    hashPower: "0x9173e163", principal: "0x2ce0f9d6", pending: "0x31d7a262", perDay: "0x1bfff8ac", claimed: "0xc884ef83",
    minHash: "0xe0b42843", indexPlusOne: "0x7f0b8642", validators: "0x35aa2e44"
  };
  var MM = "https://metamask.app.link/dapp/sectoraorg.com/myairdrop/";
  var LEVELS = [{ min: 100, n: "Scout", r: 0.55 }, { min: 500, n: "Sentinel", r: 0.65 }, { min: 1000, n: "Guardian", r: 0.75 }, { min: 4000, n: "Titan", r: 0.9 }];
  var DAY = 864e5, MIN = C ? C.MIN : 30, END = C ? C.END : Date.UTC(2027, 2, 25);

  var T = {
    en: { loc: "en-US", brand: "My Airdrop", h1: "My <b>Airdrop</b>", lead: "Everything your wallet has in Sectora, read live from the blockchain.",
      foot: "Read-only: no signatures, no transactions, nothing leaves your wallet.",
      connect: "Connect wallet", nowallet: "No wallet in this browser?", openmm: "Open in MetaMask", or: "Or check any address", check: "Check",
      intro: "Connect your wallet to see your airdrop reward, your Hash Node, your staking and your testnet rewards.",
      reading: "Reading the blockchain…", err: "We couldn't read the network. Try again in a moment.", bad: "That address doesn't look right.", rej: "The wallet didn't share an address.",
      conn: "Connected", view: "Viewing", change: "Change wallet", refresh: "Refresh", copy: "Copy", copied: "Copied", upd: "Updated {t}",
      ak: "Airdrop Genesis reward", earned: "earned so far", of: "of {n} SECT when you complete your time", win: "Your prize: {n} SECT",
      pre: "Starts adding up on opening day. Everyone has the same time to complete the prize, counted from the day they join. Deliveries start at the launch of SectoraEVM.",
      wait: "Your count will show as soon as the network confirms your staking.", off: "Your count starts when your Hash Node is on with this wallet.",
      none: "You need at least 100 SECT in staking and your Hash Node on to take part.",
      day: "Delivered at the launch of SectoraEVM", day2: "You complete your time on {d} · delivered on SectoraEVM",
      day3: "Each part is delivered on SectoraEVM when it completes its time · the next one completes on {d}", lock: "What you earn is secured on {d}",
      full: "Full prize complete · delivered on SectoraEVM",
      lvl: "Level", spots: "Spots", prize: "Prize", lvn: "Level {n}", spf: "of {l}", sect: "SECT on completing your time", nolv: "No level yet",
      up: "With <b>{x} SECT</b> more in staking you become <b>{l}</b> and win <b>{p} SECT</b>.", top: "Titan, the top level: everything you add to staking increases your prize, with no maximum.",
      rq1: "100+ SECT in staking", rq1s: "You have {n} SECT in staking", rq2: "Hash Node on", rq2on: "On with this wallet", rq2off: "Not on yet",
      rq3: "30 days inside", rq3s: "Day {d} of 30 · then what you earn is secured", rq3ok: "What you earn is secured", rq3w: "Starts when you meet the two above",
      sk: "Staking · Ethereum", stk: "SECT in staking", cl: "Staking rewards to claim", w: "SECT in your wallet", tot: "Total SECT",
      sgo: "Go to staking", nk: "Hash Node · testnet", nOn: "On", nPaused: "Paused", nNone: "Not registered", nUnk: "Couldn't check",
      nName: "Name", nSince: "Registered", nHash: "Hash power", nMin: "minimum to validate: {m} TH/s", nTime: "Time on", nReg: "Hash at registration",
      ngo: "Open the dashboard", nguide: "Guide to connect your node",
      tk: "Testnet rewards · Sepolia", tPend: "hash rewards to claim", tPer: "{n} tSECT per day", tBal: "tSECT in your wallet", tSpent: "tSECT spent on hash",
      tCl: "Already claimed", tGas: "Sepolia ETH (gas)", tFau: "Faucet", tNow: "Available now", tIn: "Next in {t}", tNote: "Testnet: tSECT has no monetary value.",
      hk: "History", hDep: "Staked", hWd: "Withdrawn from staking", hReg: "Node registered and on", hOn: "Node on", hOff: "Node off",
      hEmpty: "No movements yet.", hErr: "We couldn't read the history right now. Try Refresh in a moment.", d: "d", h: "h", m: "min" },
    es: { loc: "es-ES", brand: "Mi Airdrop", h1: "Mi <b>Airdrop</b>", lead: "Todo lo que tiene tu wallet en Sectora, leído en vivo de la blockchain.",
      foot: "Solo lectura: sin firmas ni transacciones, nada sale de tu wallet.",
      connect: "Conectar wallet", nowallet: "¿No tienes wallet en este navegador?", openmm: "Abrir en MetaMask", or: "O revisa cualquier dirección", check: "Revisar",
      intro: "Conecta tu wallet para ver tu premio del airdrop, tu Hash Node, tu staking y tus recompensas de la testnet.",
      reading: "Leyendo la blockchain…", err: "No pudimos leer la red. Prueba de nuevo en un momento.", bad: "Esa dirección no es válida.", rej: "La wallet no compartió una dirección.",
      conn: "Conectada", view: "Viendo", change: "Cambiar wallet", refresh: "Actualizar", copy: "Copiar", copied: "Copiada", upd: "Actualizado {t}",
      ak: "Premio del Airdrop Genesis", earned: "llevas generado", of: "de {n} SECT al completar tu tiempo", win: "Tu premio: {n} SECT",
      pre: "Empieza a sumar el día de la apertura. Todos tienen el mismo tiempo para completar el premio, contado desde que entran. Las entregas empiezan en el lanzamiento de SectoraEVM.",
      wait: "Tu conteo aparecerá en cuanto la red confirme tu staking.", off: "Tu conteo empieza cuando tu Hash Node esté encendido con esta wallet.",
      none: "Necesitas al menos 100 SECT en staking y tu Hash Node encendido para participar.",
      day: "Se entrega en el lanzamiento de SectoraEVM", day2: "Completas tu tiempo el {d} · se entrega en SectoraEVM",
      day3: "Cada parte se entrega en SectoraEVM al completar su tiempo · la próxima se completa el {d}", lock: "Lo ganado queda asegurado el {d}",
      full: "Premio completo · se entrega en SectoraEVM",
      lvl: "Nivel", spots: "Plazas", prize: "Premio", lvn: "Nivel {n}", spf: "de {l}", sect: "SECT al completar tu tiempo", nolv: "Aún sin nivel",
      up: "Con <b>{x} SECT</b> más en staking pasas a <b>{l}</b> y ganas <b>{p} SECT</b>.", top: "Titan, el nivel más alto: todo lo que sumes al staking aumenta tu premio, sin máximo.",
      rq1: "100+ SECT en staking", rq1s: "Tienes {n} SECT en staking", rq2: "Hash Node encendido", rq2on: "Encendido con esta wallet", rq2off: "Aún no está encendido",
      rq3: "30 días dentro", rq3s: "Día {d} de 30 · después lo ganado queda asegurado", rq3ok: "Lo ganado ya está asegurado", rq3w: "Empieza cuando cumples los dos anteriores",
      sk: "Staking · Ethereum", stk: "SECT en staking", cl: "Recompensas de staking por reclamar", w: "SECT en tu wallet", tot: "SECT en total",
      sgo: "Ir al staking", nk: "Hash Node · testnet", nOn: "Encendido", nPaused: "Pausado", nNone: "Sin registrar", nUnk: "No se pudo comprobar",
      nName: "Nombre", nSince: "Registrado", nHash: "Poder de hash", nMin: "mínimo para validar: {m} TH/s", nTime: "Tiempo encendido", nReg: "Hash al registrar",
      ngo: "Abrir el dashboard", nguide: "Guía para conectar tu nodo",
      tk: "Recompensas testnet · Sepolia", tPend: "rendimiento del hash por reclamar", tPer: "{n} tSECT al día", tBal: "tSECT en tu wallet", tSpent: "tSECT gastados en hash",
      tCl: "Ya cobrado", tGas: "ETH de Sepolia (gas)", tFau: "Grifo", tNow: "Disponible ahora", tIn: "Próximo en {t}", tNote: "Testnet: el tSECT no tiene valor monetario.",
      hk: "Historial", hDep: "Depósito en staking", hWd: "Retiro del staking", hReg: "Nodo registrado y encendido", hOn: "Nodo encendido", hOff: "Nodo apagado",
      hEmpty: "Aún no hay movimientos.", hErr: "No pudimos leer el historial ahora. Pulsa Actualizar en un momento.", d: "d", h: "h", m: "min" },
    pt: { loc: "pt-BR", brand: "Meu Airdrop", h1: "Meu <b>Airdrop</b>", lead: "Tudo o que sua carteira tem na Sectora, lido ao vivo da blockchain.",
      foot: "Só leitura: sem assinaturas nem transações, nada sai da sua carteira.",
      connect: "Conectar carteira", nowallet: "Sem carteira neste navegador?", openmm: "Abrir no MetaMask", or: "Ou verifique qualquer endereço", check: "Verificar",
      intro: "Conecte sua carteira para ver seu prêmio do airdrop, seu Hash Node, seu staking e suas recompensas da testnet.",
      reading: "Lendo a blockchain…", err: "Não conseguimos ler a rede. Tente de novo em um instante.", bad: "Esse endereço não é válido.", rej: "A carteira não compartilhou um endereço.",
      conn: "Conectada", view: "Visualizando", change: "Trocar carteira", refresh: "Atualizar", copy: "Copiar", copied: "Copiado", upd: "Atualizado {t}",
      ak: "Prêmio do Airdrop Genesis", earned: "você já gerou", of: "de {n} SECT ao completar seu tempo", win: "Seu prêmio: {n} SECT",
      pre: "Começa a somar no dia da abertura. Todos têm o mesmo tempo para completar o prêmio, contado desde que entram. As entregas começam no lançamento da SectoraEVM.",
      wait: "Sua contagem vai aparecer assim que a rede confirmar seu staking.", off: "Sua contagem começa quando seu Hash Node estiver ligado com esta carteira.",
      none: "Você precisa de pelo menos 100 SECT em staking e do seu Hash Node ligado para participar.",
      day: "Entregue no lançamento da SectoraEVM", day2: "Você completa seu tempo em {d} · entregue na SectoraEVM",
      day3: "Cada parte é entregue na SectoraEVM ao completar seu tempo · a próxima se completa em {d}", lock: "O que você ganha fica garantido em {d}",
      full: "Prêmio completo · entregue na SectoraEVM",
      lvl: "Nível", spots: "Vagas", prize: "Prêmio", lvn: "Nível {n}", spf: "de {l}", sect: "SECT ao completar seu tempo", nolv: "Ainda sem nível",
      up: "Com mais <b>{x} SECT</b> em staking você vira <b>{l}</b> e ganha <b>{p} SECT</b>.", top: "Titan, o nível mais alto: tudo o que você somar ao staking aumenta seu prêmio, sem máximo.",
      rq1: "100+ SECT em staking", rq1s: "Você tem {n} SECT em staking", rq2: "Hash Node ligado", rq2on: "Ligado com esta carteira", rq2off: "Ainda não está ligado",
      rq3: "30 dias dentro", rq3s: "Dia {d} de 30 · depois o que você ganhou fica garantido", rq3ok: "O que você ganhou já está garantido", rq3w: "Começa quando você cumpre os dois anteriores",
      sk: "Staking · Ethereum", stk: "SECT em staking", cl: "Recompensas de staking a resgatar", w: "SECT na sua carteira", tot: "SECT no total",
      sgo: "Ir ao staking", nk: "Hash Node · testnet", nOn: "Ligado", nPaused: "Pausado", nNone: "Não registrado", nUnk: "Não foi possível verificar",
      nName: "Nome", nSince: "Registrado", nHash: "Poder de hash", nMin: "mínimo para validar: {m} TH/s", nTime: "Tempo ligado", nReg: "Hash ao registrar",
      ngo: "Abrir o dashboard", nguide: "Guia para conectar seu nó",
      tk: "Recompensas testnet · Sepolia", tPend: "rendimento do hash a resgatar", tPer: "{n} tSECT por dia", tBal: "tSECT na sua carteira", tSpent: "tSECT gastos em hash",
      tCl: "Já resgatado", tGas: "ETH da Sepolia (gás)", tFau: "Faucet", tNow: "Disponível agora", tIn: "Próximo em {t}", tNote: "Testnet: o tSECT não tem valor monetário.",
      hk: "Histórico", hDep: "Depósito em staking", hWd: "Saque do staking", hReg: "Nó registrado e ligado", hOn: "Nó ligado", hOff: "Nó desligado",
      hEmpty: "Ainda não há movimentos.", hErr: "Não conseguimos ler o histórico agora. Toque em Atualizar em um instante.", d: "d", h: "h", m: "min" }
  };

  /* idioma: abre siempre en ingles; el que se elija arriba se mantiene solo durante esa visita */
  // los otros 8 idiomas de sectoraorg.com (i18n-more.js)
  if (window.MA_I18N) for (var lk in window.MA_I18N) T[lk] = window.MA_I18N[lk];
  var lang = "en";
  try { var sv = sessionStorage.getItem("sa_lang_visit"); if (sv && T[sv]) lang = sv; } catch (e) {}
  function t(k, v) { var s = T[lang][k] != null ? T[lang][k] : T.en[k]; if (v) for (var x in v) s = s.split("{" + x + "}").join(v[x]); return s; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function nf(d) { return new Intl.NumberFormat(T[lang].loc, { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0, useGrouping: "always" }); }
  function fmt(n, d) { return nf(d).format(n); }
  function date(ms) { return new Intl.DateTimeFormat(T[lang].loc, { day: "numeric", month: "short", year: "numeric" }).format(ms); }
  function dtime(ms) { return new Intl.DateTimeFormat(T[lang].loc, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(ms); }
  function dur(ms) {
    var m = Math.max(0, Math.floor(ms / 6e4)), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60);
    return d ? d + " " + t("d") + " " + h + " " + t("h") : h ? h + " " + t("h") + " " + (m % 60) + " " + t("m") : (m % 60) + " " + t("m");
  }
  function short(a) { return a.slice(0, 6) + "…" + a.slice(-4); }

  /* ---------- red ---------- */
  function pad(a) { return a.toLowerCase().replace(/^0x/, "").padStart(64, "0"); }
  function rpc(urls, method, params) {
    var i = 0;
    function next() {
      if (i >= urls.length) return Promise.reject(new Error("rpc"));
      var ctl = new AbortController(), tm = setTimeout(function () { ctl.abort(); }, 8000);
      return fetch(urls[i++], { method: "POST", headers: { "content-type": "application/json" }, signal: ctl.signal,
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: method, params: params }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { clearTimeout(tm); if (!j || j.error || j.result == null) throw new Error("rpc"); return j.result; })
        .catch(function () { clearTimeout(tm); return next(); });
    }
    return next();
  }
  function call(urls, to, data) { return rpc(urls, "eth_call", [{ to: to, data: data }, "latest"]); }
  function word(h, n) { return BigInt("0x" + (h.slice(2 + 64 * n, 2 + 64 * (n + 1)) || "0")); }
  function units(b) { return Number(b / 10n ** 12n) / 1e6; }            // 18 decimales a numero (6 decimales)
  function u256(h) { return units(word(h, 0)); }
  function soft(p) { return p.then(function (v) { return v; }, function () { return null; }); }

  function readNode(addr) {
    return call(SEPOLIA, REGISTRY, SEL.indexPlusOne + pad(addr)).then(function (h) {
      var n = word(h, 0);
      if (n === 0n) return { st: "none" };
      return call(SEPOLIA, REGISTRY, SEL.validators + pad((n - 1n).toString(16))).then(function (v) {
        var off = Number(word(v, 1)), len = Number(BigInt("0x" + (v.slice(2 + off * 2, 2 + off * 2 + 64) || "0"))), name = "";
        try { var hex = v.slice(2 + off * 2 + 64, 2 + off * 2 + 64 + len * 2), bytes = new Uint8Array(hex.length / 2);
          for (var k = 0; k < bytes.length; k++) bytes[k] = parseInt(hex.substr(k * 2, 2), 16);
          name = new TextDecoder().decode(bytes); } catch (e) {}
        return { st: word(v, 6) === 1n ? "on" : "paused", name: name, hashAtReg: Number(word(v, 4)), at: Number(word(v, 5)) * 1000 };
      });
    }).catch(function () { return { st: "unknown" }; });
  }
  function read(addr) {
    var a = pad(addr);
    var stake = call(MAINNET, STAKING, SEL.accountView + a).then(function (h) { return { staked: units(word(h, 0)), claim: units(word(h, 1)), wallet: units(word(h, 2)) }; });
    var tn = Promise.all([
      soft(call(SEPOLIA, TOKEN_T, SEL.balanceOf + a).then(u256)),
      soft(call(SEPOLIA, MARKET, SEL.hashPower + a).then(function (h) { return Number(word(h, 0)); })),
      soft(call(SEPOLIA, MARKET, SEL.principal + a).then(u256)),
      soft(call(SEPOLIA, MARKET, SEL.pending + a).then(u256)),
      soft(call(SEPOLIA, MARKET, SEL.perDay + a).then(u256)),
      soft(call(SEPOLIA, MARKET, SEL.claimed + a).then(u256)),
      soft(call(SEPOLIA, TOKEN_T, SEL.lastFaucet + a).then(function (h) { return Number(word(h, 0)) * 1000; })),
      soft(call(SEPOLIA, TOKEN_T, SEL.cooldown).then(function (h) { return Number(word(h, 0)) * 1000; })),
      soft(call(SEPOLIA, REGISTRY, SEL.minHash).then(function (h) { return Number(word(h, 0)); })),
      soft(rpc(SEPOLIA, "eth_getBalance", [addr, "latest"]).then(function (h) { return units(BigInt(h)); }))
    ]).then(function (r) { return { bal: r[0], hash: r[1], spent: r[2], pend: r[3], perDay: r[4], claimed: r[5], lastFau: r[6], cool: r[7], minHash: r[8], gas: r[9] }; });
    var hist = C && C.wallet ? C.wallet(addr).catch(function () { return null; }) : Promise.resolve(null);
    return Promise.all([stake, readNode(addr), tn, hist]).then(function (r) {
      return { addr: addr, stake: r[0], node: r[1], tn: r[2], hist: r[3], at: Date.now() };
    });
  }

  /* ---------- estado del airdrop (mismas reglas que /airdroptesting) ---------- */
  function levelOf(b) { var lv = -1; LEVELS.forEach(function (x, i) { if (b >= x.min) lv = i; }); return lv; }
  function airdrop(d) {
    var staked = d.stake.staked, lv = levelOf(staked), on = d.node.st === "on", now = Date.now();
    var a = { lv: lv, prize: lv >= 0 ? staked * LEVELS[lv].r : 0, on: on, state: "", items: null, closed: 0, proj: 0, first: 0 };
    var open = C && C.OPEN && now >= C.OPEN;
    if (lv < 0) a.state = "none";
    else if (!on) a.state = "off";
    else if (!open) a.state = "pre";
    else if (d.hist && C) {
      var ev = C.evaluate(d.hist.ev, d.hist.node, C.OPEN, now);
      if (ev.items.length) { a.state = "run"; a.items = ev.items; a.closed = ev.closed; a.proj = ev.closed;
        ev.items.forEach(function (it) { a.proj += it.p; }); a.first = Math.min.apply(null, ev.items.map(function (it) { return it.s; })); }
      else a.state = "wait";
    } else a.state = "wait";
    return a;
  }

  /* ---------- pantallas ---------- */
  var picker = null, app = document.getElementById("app"), cur = null, conn = false, via = "", data = null, timer = 0, busy = false;
  var ICON = {
    ok: '<svg viewBox="0 0 16 16"><path d="M4 8.4l2.8 2.7 5.4-5.9" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    wait: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.6" fill="#e0a030"/></svg>'
  };

  function statics() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-t]").forEach(function (el) { var v = t(el.getAttribute("data-t")); if (el.hasAttribute("data-html")) el.innerHTML = v; else el.textContent = v; });
    if (picker) picker.refresh();
    document.title = "My AirDrop - Sectora Foundation";
  }
  function stop() { if (timer) { clearInterval(timer); timer = 0; } }

  function start(msg) {
    stop(); cur = null; data = null;
    // con el selector de wallets se conecta desde cualquier navegador (tambien Chrome o Safari del movil)
    var hasW = !!window.SectoraMyWallet || !!window.ethereum;
    app.innerHTML = '<div class="start"><p>' + esc(t("intro")) + '</p>' +
      (hasW ? '<button class="btn go mono" type="button" data-a="connect" style="margin-top:18px"><span>' + esc(t("connect")) + '</span><span>→</span></button>' : "") +
      (msg ? '<p class="msg">' + esc(msg) + "</p>" : "") +
      '<p class="alt">' + (hasW ? "" : esc(t("nowallet")) + ' <a href="' + MM + '">' + esc(t("openmm")) + " ↗</a><br><br>") + esc(t("or")) + "</p>" +
      '<form class="f"><input name="a" placeholder="0x…" autocomplete="off" spellcheck="false" aria-label="' + esc(t("or")) + '"><button class="mono" type="submit">' + esc(t("check")) + "</button></form></div>";
    var b = app.querySelector('[data-a="connect"]'); if (b) b.addEventListener("click", connect);
    app.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault(); var v = this.a.value.trim();
      if (!/^0x[0-9a-fA-F]{40}$/.test(v)) { start(t("bad")); return; }
      show(v, false);
    });
  }
  function connect() {
    if (window.SectoraMyWallet) { window.SectoraMyWallet.abrir(); return; }
    window.ethereum.request({ method: "eth_requestAccounts" }).then(function (acc) {
      if (acc && acc[0]) show(acc[0], true); else start(t("rej"));
    }).catch(function () { start(t("rej")); });
  }
  function show(addr, connected, how) {
    stop(); cur = addr; conn = connected; via = connected ? how || "" : "";
    try { localStorage.setItem("ma_addr", addr); } catch (e) {}
    if (!data || data.addr.toLowerCase() !== addr.toLowerCase()) app.innerHTML = '<p class="loading"><span class="spin"></span>' + esc(t("reading")) + "</p>";
    busy = true;
    read(addr).then(function (d) { busy = false; if (cur !== addr) return; data = d; render(); })
      .catch(function () { busy = false; if (cur === addr) start(t("err")); });
  }

  function render() {
    stop();
    var d = data, a = airdrop(d), s = d.stake, n = d.node, tn = d.tn, now = Date.now();
    var lvName = a.lv >= 0 ? LEVELS[a.lv].n : t("nolv");

    /* barra de la wallet */
    var html = '<div class="wbar"><div class="who"><i class="dot"></i><div><span class="mono st">' + esc(conn ? t("conn") + (via ? " · " + via : "") : t("view")) + '</span><br><span class="ad">' + esc(d.addr) + "</span></div></div>" +
      '<div class="acts"><button class="btn sm mono" type="button" data-a="copy">' + esc(t("copy")) + '</button><button class="btn sm mono" type="button" data-a="refresh">' + esc(t("refresh")) + " ↻</button>" +
      '<button class="btn sm mono" type="button" data-a="change">' + esc(t("change")) + "</button></div></div>";

    /* premio del airdrop */
    var chips = '<span class="chip mono' + (a.lv >= 0 ? " ok" : "") + '">' + esc(a.lv >= 0 ? t("lvn", { n: a.lv + 1 }) + " · " + lvName : t("nolv")) + "</span>" +
      '<span class="chip mono' + (a.on ? " ok" : " warn") + '">Hash Node · ' + esc(a.on ? t("nOn") : n.st === "paused" ? t("nPaused") : n.st === "unknown" ? t("nUnk") : t("nNone")) + "</span>";
    html += '<section class="hero"><div class="hero-k mono"><span>' + esc(t("ak")) + '</span><span class="chips">' + chips + "</span></div>";
    if (a.state === "run") {
      html += '<p class="big num"><em data-acc>0</em><small class="mono">SECT · ' + esc(t("earned")) + "</small></p>" +
        '<p class="of">' + esc(t("of", { n: fmt(Math.round(a.proj)) })) + '</p><div class="bar"><i data-bar></i></div><p class="days mono" data-days></p>';
    } else {
      html += '<p class="big num"><em>' + fmt(a.prize) + '</em><small class="mono">SECT</small></p>' +
        '<p class="note">' + esc(a.state === "none" ? t("none") : a.state === "off" ? t("off") : a.state === "pre" ? t("pre") : t("wait")) + "</p>";
    }
    var spots = a.lv >= 0 ? Math.floor(s.staked / LEVELS[a.lv].min * 10) / 10 : 0;
    html += '<div class="trio"><div><span class="m mono">' + esc(t("lvl")) + "</span><b>" + esc(lvName) + "</b><small>" + esc(a.lv >= 0 ? t("lvn", { n: a.lv + 1 }) : "—") + "</small></div>" +
      '<div><span class="m mono">' + esc(t("spots")) + '</span><b class="num">' + (a.lv >= 0 ? fmt(spots, 1) : "0") + "</b><small>" + esc(a.lv >= 0 ? t("spf", { l: lvName }) : "—") + "</small></div>" +
      '<div><span class="m mono">' + esc(t("prize")) + '</span><b class="num">' + fmt(Math.floor(a.prize * 100) / 100, a.prize % 1 ? 2 : 0) + "</b><small>" + esc(t("sect")) + "</small></div></div>";
    if (a.lv < LEVELS.length - 1) { var nx = LEVELS[a.lv + 1];
      html += '<p class="up">' + t("up", { x: fmt(Math.ceil(nx.min - s.staked)), l: nx.n, p: fmt(nx.min * nx.r) }) + "</p>"; }
    else html += '<p class="up">' + esc(t("top")) + "</p>";
    html += "</section>";

    /* requisitos */
    var in30 = a.state === "run" ? Math.floor((now - a.first) / DAY) + 1 : 0;
    html += '<ul class="req">' +
      li(a.lv >= 0, t("rq1"), t("rq1s", { n: fmt(s.staked, s.staked % 1 ? 2 : 0) })) +
      li(a.on, t("rq2"), a.on ? t("rq2on") : t("rq2off")) +
      li(a.state === "run" && in30 > MIN, t("rq3"), a.state !== "run" ? t("rq3w") : in30 > MIN ? t("rq3ok") : t("rq3s", { d: in30 })) + "</ul>";

    /* tarjetas */
    var onMs = 0, spans = d.hist && d.hist.node && d.hist.node.spans;
    if (spans) spans.forEach(function (sp) { onMs += Math.min(sp[1], now) - sp[0]; });
    else if (n.st === "on" && n.at) onMs = now - n.at;
    var fauNext = tn.lastFau != null && tn.cool != null ? tn.lastFau + tn.cool : null;
    html += '<div class="cards">' +
      card(t("sk"), fmt(s.staked, 2), "SECT", t("stk"), [
        [t("cl"), fmt(s.claim, 4) + " SECT"], [t("w"), fmt(s.wallet, 2) + " SECT"], [t("tot"), fmt(s.staked + s.wallet + s.claim, 2) + " SECT"]
      ], '<a class="btn go mono" href="/staking/"><span>' + esc(t("sgo")) + "</span><span>↗</span></a>") +
      card(t("nk"), esc(n.st === "on" ? t("nOn") : n.st === "paused" ? t("nPaused") : n.st === "unknown" ? t("nUnk") : t("nNone")), "", n.name ? esc(n.name) : "Hash Node", [
        [t("nHash"), tn.hash != null ? fmt(tn.hash) + " TH/s" + (tn.minHash ? "<small>" + esc(t("nMin", { m: fmt(tn.minHash) })) + "</small>" : "") : "—", tn.hash != null && tn.minHash && tn.hash >= tn.minHash ? "ok" : "warn"],
        [t("nSince"), n.at ? esc(dtime(n.at)) : "—"],
        [t("nTime"), onMs > 0 ? esc(dur(onMs)) : "—"],
        [t("nReg"), n.hashAtReg != null && n.st !== "none" && n.st !== "unknown" ? fmt(n.hashAtReg) + " TH/s" : "—"]
      ], '<a class="btn mono" href="/dashboard.html#guia-nodo"><span>' + esc(t("nguide")) + '</span><span>↗</span></a><a class="btn go mono" href="/dashboard.html"><span>' + esc(t("ngo")) + "</span><span>↗</span></a>",
        n.st === "on" ? "ok" : "warn") +
      card(t("tk"), '<span data-pend>' + (tn.pend != null ? fmt(tn.pend, 4) : "—") + "</span>", "tSECT", t("tPend") + (tn.perDay ? " · " + t("tPer", { n: fmt(tn.perDay, 2) }) : ""), [
        [t("tBal"), tn.bal != null ? fmt(tn.bal, 2) + " tSECT" : "—"], [t("tSpent"), tn.spent != null ? fmt(tn.spent, 2) + " tSECT" : "—"],
        [t("tCl"), tn.claimed != null ? fmt(tn.claimed, 4) + " tSECT" : "—"], [t("tGas"), tn.gas != null ? fmt(tn.gas, 4) + " ETH" : "—", tn.gas != null && tn.gas > 0 ? "" : "warn"],
        [t("tFau"), fauNext == null ? "—" : now >= fauNext ? esc(t("tNow")) : esc(t("tIn", { t: dur(fauNext - now) })), fauNext != null && now >= fauNext ? "ok" : ""]
      ], '<a class="btn go mono" href="/dashboard.html"><span>' + esc(t("ngo")) + '</span><span>↗</span></a>', "", t("tNote")) +
      "</div>";

    /* historial */
    html += '<section class="hist"><h2 class="mono">' + esc(t("hk")) + "</h2>" + history(d) + "</section>";
    html += '<p class="fine mono">' + esc(t("upd", { t: dtime(d.at) })) + "</p>";
    app.innerHTML = html;

    app.querySelector('[data-a="refresh"]').addEventListener("click", function () { if (!busy) show(d.addr, conn); });
    app.querySelector('[data-a="change"]').addEventListener("click", function () {
      try { localStorage.removeItem("ma_addr"); } catch (e) {}
      if (window.SectoraMyWallet) window.SectoraMyWallet.salir();
      start();
    });
    app.querySelector('[data-a="copy"]').addEventListener("click", function () {
      var b = this; try { navigator.clipboard.writeText(d.addr).then(function () { b.textContent = t("copied"); setTimeout(function () { b.textContent = t("copy"); }, 1400); }); } catch (e) {}
    });
    live(a, tn);
  }
  function li(ok, title, sub) {
    return '<li><span class="ic ' + (ok ? "ok" : "wait") + '">' + (ok ? ICON.ok : ICON.wait) + "</span><div><b>" + esc(title) + "</b><span>" + esc(sub) + "</span></div></li>";
  }
  function card(k, big, unit, cap, rows, acts, kcls, fine) {
    return '<section class="card"><h2 class="mono"><span>' + esc(k) + "</span></h2>" +
      '<p class="lead2 num' + (kcls ? " " + kcls : "") + '">' + big + (unit ? "<small class=\"mono\">" + esc(unit) + "</small>" : "") + '</p><p class="cap">' + cap + "</p>" +
      '<ul class="kv">' + rows.map(function (r) { return "<li><span>" + esc(r[0]) + '</span><b class="' + (r[2] || "") + '">' + r[1] + "</b></li>"; }).join("") + "</ul>" +
      (fine ? '<p class="fine">' + esc(fine) + "</p>" : "") + '<div class="acts">' + acts + "</div></section>";
  }
  function history(d) {
    if (!d.hist) return '<p class="empty">' + esc(t("hErr")) + "</p>";
    var rows = [];
    (d.hist.ev || []).forEach(function (e) {
      rows.push({ t: e.t, tag: e.dep ? "" : "out", txt: (e.dep ? t("hDep") : t("hWd")) + " · " + fmt(e.amt, e.amt % 1 ? 2 : 0) + " SECT",
        link: e.tx ? "https://etherscan.io/tx/" + e.tx : "" });
    });
    var nd = d.hist.node;
    if (nd && nd.spans) nd.spans.forEach(function (sp, i) {
      rows.push({ t: sp[0], tag: "node", txt: i === 0 && Math.abs(sp[0] - nd.at) < 6e4 ? t("hReg") : t("hOn"), link: "https://sepolia.etherscan.io/address/" + d.addr });
      if (sp[1] !== Infinity) rows.push({ t: sp[1], tag: "off", txt: t("hOff"), link: "https://sepolia.etherscan.io/address/" + d.addr });
    });
    else if (nd && nd.at) rows.push({ t: nd.at, tag: "node", txt: t("hReg"), link: "https://sepolia.etherscan.io/address/" + d.addr });
    if (!rows.length) return '<p class="empty">' + esc(t("hEmpty")) + "</p>";
    rows.sort(function (x, y) { return y.t - x.t; });
    return "<ol>" + rows.slice(0, 30).map(function (r) {
      return '<li><span class="d">' + esc(dtime(r.t)) + '</span><span><i class="tag ' + r.tag + '"></i>' + esc(r.txt) + "</span>" +
        (r.link ? '<a class="x mono" href="' + r.link + '" target="_blank" rel="noopener noreferrer">Etherscan ↗</a>' : "<span></span>") + "</li>";
    }).join("") + "</ol>";
  }

  /* lo generado sube en vivo (como en /airdroptesting) y el rendimiento de la testnet tambien */
  function live(a, tn) {
    var acc = app.querySelector("[data-acc]"), bar = app.querySelector("[data-bar]"), days = app.querySelector("[data-days]"), pend = app.querySelector("[data-pend]");
    var n4 = nf(4), t0 = Date.now();
    var items = a.items || [], fin = items.map(function (it) { return it.s + it.sp; }), done = fin.length ? Math.max.apply(null, fin) : 0;
    var late = fin.filter(function (x) { return x > END; });
    var many = late.length && (late.length < fin.length || late.some(function (x) { return x !== late[0]; }));
    function tick() {
      var now = Date.now();
      if (acc) {
        var earned = C ? C.liveEarned(items, a.closed, now) : 0;
        acc.textContent = n4.format(earned);
        bar.style.width = (a.proj ? Math.min(100, earned / a.proj * 100) : 0) + "%";
        var next = Math.min.apply(null, late.filter(function (x) { return x > now; }).concat(done));
        days.textContent = now >= done ? t("full") : now - a.first < MIN * DAY ? t("lock", { d: date(a.first + MIN * DAY) }) :
          done <= END ? t("day") : many ? t("day3", { d: date(next) }) : t("day2", { d: date(done) });
      }
      if (pend && tn.pend != null && tn.perDay) pend.textContent = n4.format(tn.pend + tn.perDay * (now - t0) / DAY);
    }
    tick(); timer = setInterval(tick, 100);
  }

  /* ---------- arranque ---------- */
  // selector de idioma con banderas, el mismo del dashboard (lang-pick.js)
  var host = document.getElementById("langPick");
  if (host && window.SALangPick) picker = window.SALangPick(host, function () { return lang; }, function (c) {
    if (!T[c]) return;
    lang = c; try { sessionStorage.setItem("sa_lang_visit", lang); } catch (e) {}
    statics(); if (data && cur) render(); else if (!cur) start();
  });
  statics();
  var MW = window.SectoraMyWallet;
  if (MW) {
    MW.alDir(function (a, how) { show(a, true, how); });
    MW.alSalir(function () { if (conn) start(); });
  }
  var q = (location.search.match(/[?&]a(?:ddress)?=(0x[0-9a-fA-F]{40})/) || [])[1];
  if (q) show(q, false);
  else {
    start();
    var w = window.ethereum, saved = null;
    try { saved = localStorage.getItem("ma_addr"); } catch (e) {}
    // la wallet ya conectada a este sitio; si no hay, la ultima direccion revisada en este navegador
    var again = function () { if (!cur && saved && /^0x[0-9a-fA-F]{40}$/.test(saved)) show(saved, false); };
    if (w && w.request) w.request({ method: "eth_accounts" }).then(function (acc) { if (!cur && acc && acc[0]) show(acc[0], true); else again(); }).catch(again);
    else again();
    if (MW) MW.restaurar();   // la sesion de WalletConnect que se abrio aqui (por ejemplo, desde Safari del movil)
    if (w && w.on) w.on("accountsChanged", function (acc) { if (acc && acc[0] && conn) show(acc[0], true); });
  }
})();
