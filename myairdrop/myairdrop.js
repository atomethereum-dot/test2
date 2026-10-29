/* Mi Airdrop (sectoraorg.com/myairdrop): todo lo que una wallet tiene en Sectora, leido de la blockchain.
   - Premio del Airdrop Genesis: nivel, plazas, premio y lo generado subiendo en vivo (las mismas reglas
     que /airdrop, con count.js).
   - Staking en Ethereum: SECT en staking, recompensas por reclamar y SECT en la wallet (accountView).
   - Hash Node: activado en el Dashboard (registro publico de activaciones, count.js) o registrado antes en
     Sepolia: estado, nombre, lugar, desde cuando y tiempo encendido.
   - Historial: depositos y retiros del staking y encendidos y apagados del nodo.
   Solo lectura: no pide firmas ni envia transacciones. */
(function () {
  "use strict";
  var C = window.SACount;
  var REF_ON = false;   // referidos ocultos por ahora
  var STAKING = "0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0";
  var REGISTRY = "0x8dba83ffA1dF76B4136B39C9edfCD6Ca0B2e9BF1";  // ValidatorRegistry (Sepolia)
  var MAINNET = ["https://ethereum-rpc.publicnode.com", "https://eth.drpc.org", "https://1rpc.io/eth"];
  var SEPOLIA = ["https://ethereum-sepolia-rpc.publicnode.com", "https://sepolia.gateway.tenderly.co", "https://ethereum-sepolia.publicnode.com"];
  var SEL = {
    accountView: "0xf85b90e2", indexPlusOne: "0x7f0b8642", validators: "0x35aa2e44"
  };
  var MM = "https://metamask.app.link/dapp/sectoraorg.com/myairdrop/";
  var LEVELS = [{ min: 100, n: "Scout", r: 0.55 }, { min: 500, n: "Sentinel", r: 0.65 }, { min: 1000, n: "Guardian", r: 0.75 }, { min: 4000, n: "Titan", r: 0.9 }];
  var DAY = 864e5, MIN = C ? C.MIN : 30, END = C ? C.END : Date.UTC(2027, 2, 25);

  var T = {
    en: { loc: "en-US", brand: "My Airdrop", h1: "My <b>Airdrop</b>", lead: "Everything your wallet has in Sectora, read live from the blockchain.",
      foot: "Read-only: no signatures, no transactions, nothing leaves your wallet.",
      connect: "Connect wallet", nowallet: "No wallet in this browser?", openmm: "Open in MetaMask", or: "Or check any address", check: "Check",
      intro: "Connect your wallet to see your airdrop reward, your Hash Node and your staking.",
      reading: "Reading the blockchain…", err: "We couldn't read the network. Try again in a moment.", bad: "That address doesn't look right.", rej: "The wallet didn't share an address.",
      conn: "Connected", view: "Viewing", change: "Change wallet", refresh: "Refresh", copy: "Copy", copied: "Copied", upd: "Updated {t}",
      ak: "Airdrop Genesis reward", earned: "earned so far", of: "of {n} SECT when you complete your time", win: "Your prize: {n} SECT",
      pre: "Starts adding up on opening day. Everyone has the same time to complete the prize, counted from the day they join. Deliveries start at the launch of SectoraEVM.",
      wait: "Your count will show as soon as the network confirms your staking.", off: "With your staking you're already in: just turn on your Hash Node with this same wallet and you start taking part.",
      none: "You need at least 100 SECT in staking and your Hash Node on to take part.",
      day: "Delivered at the launch of SectoraEVM", day2: "You complete your time on {d} · delivered on SectoraEVM",
      day3: "Each part is delivered on SectoraEVM when it completes its time · the next one completes on {d}", lock: "What you earn is secured on {d}",
      full: "Full prize complete · delivered on SectoraEVM",
      lvl: "Level", spots: "Spots", prize: "Prize", lvn: "Level {n}", spf: "of {l}", sect: "SECT on completing your time", nolv: "No level yet",
      up: "With <b>{x} SECT</b> more in staking you become <b>{l}</b> and win <b>{p} SECT</b>.", top: "Titan, the top level: everything you add to staking increases your prize, with no maximum.",
      rq1: "100+ SECT in staking", rq1s: "You have {n} SECT in staking", rq2: "Hash Node on", rq2on: "On · you can close the tab or turn off your computer", rq2off: "Not on yet",
      rq3: "30 days inside", rq3s: "Day {d} of 30 · then what you earn is secured", rq3ok: "What you earn is secured", rq3w: "Starts when you meet the two above",
      sk: "Staking · Ethereum", stk: "SECT in staking", cl: "Staking rewards to claim", w: "SECT in your wallet", tot: "Total SECT",
      sgo: "Go to staking", nk: "Hash Node", nPlace: "Location", nact: "Activate my node", nOn: "On", nPaused: "Paused", nNone: "Not activated", nUnk: "Couldn't check",
      nName: "Name", nSince: "Active since", nTime: "Time on", ngo: "Open the dashboard",
      hk: "History", hDep: "Staked", hWd: "Withdrawn from staking", hReg: "Node registered and on", hAct: "Node activated in the dashboard", hOn: "Node on", hOff: "Node off",
      hEmpty: "No movements yet.", hErr: "We couldn't read the history right now. Try Refresh in a moment.",
      rfk: "Invite and earn", rfcap: "your bonus when your invitees complete their time", rfinv: "Invitees", rfst: "Their SECT in staking", rfon: "node on", rfoff: "node off", rfs: "You earn {n} SECT for every 1,000 SECT your invitees keep in staking. It's delivered with your airdrop on SectoraEVM.", rfl: "Your invite link", rfsh: "Share", rf0: "No invitees yet. Their invitation is confirmed automatically when they register their Hash Node through your link.", rfin: "To collect your bonus you must also be in the airdrop: SECT in staking and your Hash Node on.", rfrev: "Every invitation is reviewed before delivery: self-invites and fake wallets don't count.", rfby: "Invited by {a}", rfbys: "recorded on the network", rfp: "{a} invited you", rfps: "It's confirmed automatically when you register your Hash Node in the Dashboard. If you already have one, confirm it there with one click. Free, and you keep your whole airdrop.", rfgo: "Go to the Dashboard", rfpool: "Referral pool: 840,000 SECT, separate from the 7,000,000 SECT of the airdrop. If it runs out, it is shared in proportion.", d: "d", h: "h", m: "min" },
    es: { loc: "es-ES", brand: "Mi Airdrop", h1: "Mi <b>Airdrop</b>", lead: "Todo lo que tiene tu wallet en Sectora, leído en vivo de la blockchain.",
      foot: "Solo lectura: sin firmas ni transacciones, nada sale de tu wallet.",
      connect: "Conectar wallet", nowallet: "¿No tienes wallet en este navegador?", openmm: "Abrir en MetaMask", or: "O revisa cualquier dirección", check: "Revisar",
      intro: "Conecta tu wallet para ver tu premio del airdrop, tu Hash Node y tu staking.",
      reading: "Leyendo la blockchain…", err: "No pudimos leer la red. Prueba de nuevo en un momento.", bad: "Esa dirección no es válida.", rej: "La wallet no compartió una dirección.",
      conn: "Conectada", view: "Viendo", change: "Cambiar wallet", refresh: "Actualizar", copy: "Copiar", copied: "Copiada", upd: "Actualizado {t}",
      ak: "Premio del Airdrop Genesis", earned: "llevas generado", of: "de {n} SECT al completar tu tiempo", win: "Tu premio: {n} SECT",
      pre: "Empieza a sumar el día de la apertura. Todos tienen el mismo tiempo para completar el premio, contado desde que entran. Las entregas empiezan en el lanzamiento de SectoraEVM.",
      wait: "Tu conteo aparecerá en cuanto la red confirme tu staking.", off: "Con tu staking ya estás dentro: solo enciende tu Hash Node con esta misma wallet y empiezas a participar.",
      none: "Necesitas al menos 100 SECT en staking y tu Hash Node encendido para participar.",
      day: "Se entrega en el lanzamiento de SectoraEVM", day2: "Completas tu tiempo el {d} · se entrega en SectoraEVM",
      day3: "Cada parte se entrega en SectoraEVM al completar su tiempo · la próxima se completa el {d}", lock: "Lo ganado queda asegurado el {d}",
      full: "Premio completo · se entrega en SectoraEVM",
      lvl: "Nivel", spots: "Plazas", prize: "Premio", lvn: "Nivel {n}", spf: "de {l}", sect: "SECT al completar tu tiempo", nolv: "Aún sin nivel",
      up: "Con <b>{x} SECT</b> más en staking pasas a <b>{l}</b> y ganas <b>{p} SECT</b>.", top: "Titan, el nivel más alto: todo lo que sumes al staking aumenta tu premio, sin máximo.",
      rq1: "100+ SECT en staking", rq1s: "Tienes {n} SECT en staking", rq2: "Hash Node encendido", rq2on: "Encendido · puedes cerrar la pestaña o apagar tu computadora", rq2off: "Aún no está encendido",
      rq3: "30 días dentro", rq3s: "Día {d} de 30 · después lo ganado queda asegurado", rq3ok: "Lo ganado ya está asegurado", rq3w: "Empieza cuando cumples los dos anteriores",
      sk: "Staking · Ethereum", stk: "SECT en staking", cl: "Recompensas de staking por reclamar", w: "SECT en tu wallet", tot: "SECT en total",
      sgo: "Ir al staking", nk: "Hash Node", nPlace: "Ubicación", nact: "Activar mi nodo", nOn: "Encendido", nPaused: "Pausado", nNone: "Sin activar", nUnk: "No se pudo comprobar",
      nName: "Nombre", nSince: "Activo desde", nTime: "Tiempo encendido", ngo: "Abrir el dashboard",
      hk: "Historial", hDep: "Depósito en staking", hWd: "Retiro del staking", hReg: "Nodo registrado y encendido", hAct: "Nodo activado en el dashboard", hOn: "Nodo encendido", hOff: "Nodo apagado",
      hEmpty: "Aún no hay movimientos.", hErr: "No pudimos leer el historial ahora. Pulsa Actualizar en un momento.",
      rfk: "Invita y gana", rfcap: "tu bono cuando tus invitados completen su tiempo", rfinv: "Invitados", rfst: "Sus SECT en staking", rfon: "nodo encendido", rfoff: "nodo apagado", rfs: "Ganas {n} SECT por cada 1.000 SECT que tus invitados mantengan en staking. Se entrega con tu airdrop en SectoraEVM.", rfl: "Tu link de invitación", rfsh: "Compartir", rf0: "Aún no tienes invitados. Su invitación se confirma sola cuando registran su Hash Node con tu link.", rfin: "Para cobrar tu bono tú también tienes que estar en el airdrop: SECT en staking y tu Hash Node encendido.", rfrev: "Cada invitación se revisa antes de la entrega: las autoinvitaciones y las wallets falsas no cuentan.", rfby: "Te invitó {a}", rfbys: "registrado en la red", rfp: "{a} te invitó", rfps: "Se confirma sola al registrar tu Hash Node en el Dashboard. Si ya lo tenías, confírmala allí con un clic. Es gratis y conservas todo tu airdrop.", rfgo: "Ir al Dashboard", rfpool: "Bolsa de referidos: 840.000 SECT, aparte de los 7.000.000 SECT del airdrop. Si se agota, se reparte en proporción.", d: "d", h: "h", m: "min" },
    pt: { loc: "pt-BR", brand: "Meu Airdrop", h1: "Meu <b>Airdrop</b>", lead: "Tudo o que sua carteira tem na Sectora, lido ao vivo da blockchain.",
      foot: "Só leitura: sem assinaturas nem transações, nada sai da sua carteira.",
      connect: "Conectar carteira", nowallet: "Sem carteira neste navegador?", openmm: "Abrir no MetaMask", or: "Ou verifique qualquer endereço", check: "Verificar",
      intro: "Conecte sua carteira para ver seu prêmio do airdrop, seu Hash Node e seu staking.",
      reading: "Lendo a blockchain…", err: "Não conseguimos ler a rede. Tente de novo em um instante.", bad: "Esse endereço não é válido.", rej: "A carteira não compartilhou um endereço.",
      conn: "Conectada", view: "Visualizando", change: "Trocar carteira", refresh: "Atualizar", copy: "Copiar", copied: "Copiado", upd: "Atualizado {t}",
      ak: "Prêmio do Airdrop Genesis", earned: "você já gerou", of: "de {n} SECT ao completar seu tempo", win: "Seu prêmio: {n} SECT",
      pre: "Começa a somar no dia da abertura. Todos têm o mesmo tempo para completar o prêmio, contado desde que entram. As entregas começam no lançamento da SectoraEVM.",
      wait: "Sua contagem vai aparecer assim que a rede confirmar seu staking.", off: "Com seu staking você já está dentro: só ligue seu Hash Node com esta mesma carteira e você começa a participar.",
      none: "Você precisa de pelo menos 100 SECT em staking e do seu Hash Node ligado para participar.",
      day: "Entregue no lançamento da SectoraEVM", day2: "Você completa seu tempo em {d} · entregue na SectoraEVM",
      day3: "Cada parte é entregue na SectoraEVM ao completar seu tempo · a próxima se completa em {d}", lock: "O que você ganha fica garantido em {d}",
      full: "Prêmio completo · entregue na SectoraEVM",
      lvl: "Nível", spots: "Vagas", prize: "Prêmio", lvn: "Nível {n}", spf: "de {l}", sect: "SECT ao completar seu tempo", nolv: "Ainda sem nível",
      up: "Com mais <b>{x} SECT</b> em staking você vira <b>{l}</b> e ganha <b>{p} SECT</b>.", top: "Titan, o nível mais alto: tudo o que você somar ao staking aumenta seu prêmio, sem máximo.",
      rq1: "100+ SECT em staking", rq1s: "Você tem {n} SECT em staking", rq2: "Hash Node ligado", rq2on: "Ligado · você pode fechar a aba ou desligar o computador", rq2off: "Ainda não está ligado",
      rq3: "30 dias dentro", rq3s: "Dia {d} de 30 · depois o que você ganhou fica garantido", rq3ok: "O que você ganhou já está garantido", rq3w: "Começa quando você cumpre os dois anteriores",
      sk: "Staking · Ethereum", stk: "SECT em staking", cl: "Recompensas de staking a resgatar", w: "SECT na sua carteira", tot: "SECT no total",
      sgo: "Ir ao staking", nk: "Hash Node", nPlace: "Localização", nact: "Ativar meu nó", nOn: "Ligado", nPaused: "Pausado", nNone: "Não ativado", nUnk: "Não foi possível verificar",
      nName: "Nome", nSince: "Ativo desde", nTime: "Tempo ligado", ngo: "Abrir o dashboard",
      hk: "Histórico", hDep: "Depósito em staking", hWd: "Saque do staking", hReg: "Nó registrado e ligado", hAct: "Nó ativado no dashboard", hOn: "Nó ligado", hOff: "Nó desligado",
      hEmpty: "Ainda não há movimentos.", hErr: "Não conseguimos ler o histórico agora. Toque em Atualizar em um instante.",
      rfk: "Convide e ganhe", rfcap: "seu bônus quando seus convidados completarem o tempo", rfinv: "Convidados", rfst: "SECT deles em staking", rfon: "nó ligado", rfoff: "nó desligado", rfs: "Você ganha {n} SECT a cada 1.000 SECT que seus convidados mantiverem em staking. É entregue com seu airdrop na SectoraEVM.", rfl: "Seu link de convite", rfsh: "Compartilhar", rf0: "Você ainda não tem convidados. O convite é confirmado automaticamente quando eles registram o Hash Node pelo seu link.", rfin: "Para receber seu bônus você também precisa estar no airdrop: SECT em staking e seu Hash Node ligado.", rfrev: "Cada convite é revisado antes da entrega: autoconvites e carteiras falsas não contam.", rfby: "Convidado por {a}", rfbys: "registrado na rede", rfp: "{a} convidou você", rfps: "É confirmado automaticamente quando você registra seu Hash Node no Dashboard. Se você já tinha um, confirme lá com um clique. É grátis e você mantém todo o seu airdrop.", rfgo: "Ir ao Dashboard", rfpool: "Bolsa de indicações: 840.000 SECT, separada dos 7.000.000 SECT do airdrop. Se acabar, é dividida proporcionalmente.", d: "d", h: "h", m: "min" }
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
    var hist = C && C.wallet ? C.wallet(addr).catch(function () { return null; }) : Promise.resolve(null);
    // nodo activado en el Dashboard: el registro publico de activaciones o, recien activado, el de este navegador
    var me = addr.toLowerCase();
    var act = C && C.activos ? C.activos().then(function (m) { return m[me] || null; }, function () { return null; }) : Promise.resolve(null);
    return Promise.all([stake, readNode(addr), hist, act]).then(function (r) {
      var n = r[1], h = r[2], ac = r[3], loc = ac ? null : local(me);
      // la constancia publica tarda hasta 10 minutos: mientras tanto cuenta la de este navegador, como en el Dashboard
      if (loc && h && C.junta && !(h.node && h.node.act)) h.node = C.junta(h.node, loc, me);
      ac = ac || loc;
      if (ac) n = { st: "on", name: n.st === "on" && n.name ? n.name : ac.n, place: ac.c || "",
        at: n.at && (n.st === "on" || n.st === "paused") ? Math.min(n.at, ac.t) : ac.t };
      return { addr: addr, stake: r[0], node: n, hist: h, at: Date.now() };
    });
  }
  function local(me) {
    try { var x = JSON.parse(localStorage.getItem("sectora:v2:node:" + me) || "null");
      return x ? { t: x.t || Date.now(), n: x.name || "Sectora Node", c: x.place || "", la: x.lat, lo: x.lon } : null; } catch (e) { return null; }
  }

  /* ---------- estado del airdrop (mismas reglas que /airdrop) ---------- */
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
    var d = data, a = airdrop(d), s = d.stake, n = d.node, now = Date.now();
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
    html += '<div class="cards">' +
      card(t("sk"), fmt(s.staked, 2), "SECT", t("stk"), [
        [t("cl"), fmt(s.claim, 4) + " SECT"], [t("w"), fmt(s.wallet, 2) + " SECT"], [t("tot"), fmt(s.staked + s.wallet + s.claim, 2) + " SECT"]
      ], '<a class="btn go mono" href="/staking/"><span>' + esc(t("sgo")) + "</span><span>↗</span></a>") +
      card(t("nk"), esc(n.st === "on" ? t("nOn") : n.st === "paused" ? t("nPaused") : n.st === "unknown" ? t("nUnk") : t("nNone")), "", n.name ? esc(n.name) : "Hash Node",
        (n.place ? [[t("nPlace"), esc(n.place)]] : []).concat([
        [t("nSince"), n.at ? esc(dtime(n.at)) : "—"],
        [t("nTime"), onMs > 0 ? esc(dur(onMs)) : "—"]
      ]), '<a class="btn go mono" href="/dashboard.html#plan"><span>' + esc(n.st === "on" ? t("ngo") : t("nact")) + "</span><span>↗</span></a>",
        n.st === "on" ? "ok" : "warn") +
      "</div>";

    /* referidos: tu link, tus invitados y tu bono */
    if (REF_ON) html += '<section class="card rfc" data-rf></section>';

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
    live(a);
    if (REF_ON) refFill(d, a.lv >= 0 && a.on);
  }

  /* ---------- referidos ----------
     Tu link (/airdrop/?ref=0x…), tus invitados con su staking y su nodo, tu bono y quien te invito. El bono es el 12 %
     de los SECT en staking de tus invitados que estan dentro, al completar su tiempo, y se entrega con el airdrop.
     Solo lectura: el invitado confirma la invitacion en el Dashboard; las reglas estan en count.js y en el panel. */
  var OKI = '<i class="rf-ok"><svg viewBox="0 0 16 16"><path d="M4 8.4l2.8 2.7 5.4-5.9" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></i>';
  function refFill(d, inside) {
    var box = app.querySelector("[data-rf]");
    if (!box || !C || !C.refInvitees) { if (box) box.remove(); return; }
    var addr = d.addr, me = addr.toLowerCase(), link = location.origin + "/airdrop/?ref=" + me;
    box.innerHTML = '<h2 class="mono"><span>' + esc(t("rfk")) + "</span></h2><div data-rfme></div>" +
      '<p class="lead2 num"><em data-rfb>—</em><small class="mono">SECT</small></p><p class="cap">' + esc(t("rfcap")) + "</p>" +
      '<p class="rf-s">' + esc(t("rfs", { n: fmt(C.REF.BONUS * 1000) })) + "</p>" +
      '<p class="rf-l mono">' + esc(t("rfl")) + '</p><div class="rf-c"><code>' + esc(link.replace(/^https?:\/\//, "")) + "</code>" +
      '<button class="btn sm go mono" type="button" data-c>' + esc(t("copy")) + "</button>" +
      (navigator.share ? '<button class="btn sm mono" type="button" data-s>' + esc(t("rfsh")) + "</button>" : "") + "</div>" +
      '<ul class="kv"><li><span>' + esc(t("rfinv")) + '</span><b data-rfn><span class="spin"></span></b></li><li><span>' + esc(t("rfst")) + '</span><b data-rfs>—</b></li></ul>' +
      '<ul class="rf-list" data-rfl></ul>' + (inside ? "" : '<p class="rf-w">' + esc(t("rfin")) + "</p>") +
      '<p class="fine">' + esc(t("rfpool")) + "<br>" + esc(t("rfrev")) + "</p>";
    var cb = box.querySelector("[data-c]");
    cb.addEventListener("click", function () {
      (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(function () {
        cb.textContent = t("copied"); setTimeout(function () { cb.textContent = t("copy"); }, 1600);
      }, function () { window.prompt(t("rfl"), link); });
    });
    var sb = box.querySelector("[data-s]");
    if (sb) sb.addEventListener("click", function () { navigator.share({ title: "Sectora Airdrop Genesis", url: link }).catch(function () {}); });
    C.refInvitees(me).then(function (all) {
      all = all.filter(function (x) { return !x.bad; });
      return C.refLate(all).then(function (late) { return all.filter(function (x) { return !late[x.invitee]; }); });
    }).then(function (list) {
      if (cur !== addr) return;
      var nEl = box.querySelector("[data-rfn]");
      if (!list.length) {
        nEl.textContent = "0"; box.querySelector("[data-rfb]").textContent = "0";
        box.querySelector("[data-rfl]").outerHTML = '<p class="rf-s rf-0">' + esc(t("rf0")) + "</p>"; return;
      }
      return Promise.all(list.slice(0, 60).map(function (x) {
        return Promise.all([soft(call(MAINNET, STAKING, SEL.accountView + pad(x.invitee)).then(function (h) { return units(word(h, 0)); })), readNode(x.invitee)])
          .then(function (r) { return { a: x.invitee, st: r[0] || 0, on: r[1].st === "on" }; });
      })).then(function (rows) {
        if (cur !== addr) return;
        var tot = 0, ok = 0;
        rows.forEach(function (r) { tot += r.st; if (r.on && r.st >= 100) ok += r.st; });
        var bonus = ok * C.REF.BONUS;
        nEl.textContent = fmt(list.length);
        box.querySelector("[data-rfs]").textContent = fmt(tot, tot % 1 ? 2 : 0) + " SECT";
        box.querySelector("[data-rfb]").textContent = fmt(bonus, bonus % 1 ? 2 : 0);
        rows.sort(function (x, y) { return y.st - x.st; });
        box.querySelector("[data-rfl]").innerHTML = rows.slice(0, 20).map(function (r) {
          return "<li><span>" + esc(short(r.a)) + "</span><span>" + fmt(r.st, r.st % 1 ? 2 : 0) + ' SECT · <em class="' + (r.on ? "on" : "off") + '">' + esc(r.on ? t("rfon") : t("rfoff")) + "</em></span></li>";
        }).join("");
      });
    }).catch(function () { var n = box.querySelector("[data-rfn]"); if (n) n.textContent = "—"; });
    C.refOf(me).then(function (x) {
      if (cur !== addr) return;
      var top = box.querySelector("[data-rfme]"), pend = "";
      try { pend = (localStorage.getItem("sectora:ref") || "").toLowerCase(); } catch (e) {}
      if (x) top.innerHTML = '<p class="rf-me">' + OKI + "<span>" + esc(t("rfby", { a: short(x.referrer) })) + " · " + esc(t("rfbys")) + "</span></p>";
      else if (/^0x[0-9a-f]{40}$/.test(pend) && pend !== me)
        top.innerHTML = '<div class="rf-p"><b>' + esc(t("rfp", { a: short(pend) })) + "</b><span>" + esc(t("rfps")) + '</span><a class="btn sm go mono" href="/dashboard.html?ref=' + pend + '#tnRef"><span>' + esc(t("rfgo")) + "</span><span>↗</span></a></div>";
    }).catch(function () {});
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
    var nd = d.hist.node, ac = nd && nd.act;
    if (nd && nd.spans) nd.spans.forEach(function (sp, i) {
      // activado en el Dashboard: no hay transaccion que enlazar
      if (ac && Math.abs(sp[0] - ac.t) < 6e4) rows.push({ t: sp[0], tag: "node", txt: t("hAct"), link: "" });
      else rows.push({ t: sp[0], tag: "node", txt: i === 0 && Math.abs(sp[0] - nd.at) < 6e4 ? t("hReg") : t("hOn"), link: "https://sepolia.etherscan.io/address/" + d.addr });
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

  /* lo generado sube en vivo (como en /airdrop) */
  function live(a) {
    var acc = app.querySelector("[data-acc]"), bar = app.querySelector("[data-bar]"), days = app.querySelector("[data-days]");
    var n4 = nf(4);
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
