/* Ventana "Tu airdrop": al conectar la wallet lee, sin firmas ni
   transacciones, los SECT de la wallet y los del staking (una sola llamada
   a accountView del contrato de staking en Ethereum) y el nodo de la testnet
   (ValidatorRegistry en Sepolia). Con eso muestra el premio fijo de su nivel,
   que solo se gana con el Hash Node encendido. Para el nivel solo cuentan los
   SECT en staking; los de la wallet se muestran para invitar a stakearlos:
   - sin staking (menos de 100 SECT): sin premio en SECT, queda registrado para la fase 2;
   - Scout, desde 100 SECT = 40 SECT;
   - Sentinel, desde 500 SECT = 250 SECT;
   - Guardian, desde 1.000 SECT = 600 SECT;
   - Titan, una plaza de 3.400 SECT por cada 4.000 SECT, sin maximo.
   Cada persona tiene sus propios 150 dias desde que entra; los SECT se entregan en SectoraEVM
   desde el 25 de marzo de 2027 (10 dias despues de la quema), o el dia 150 si llega despues.
   Ya abierto el airdrop, lo ganado sube en vivo como en el staking: premio x dias / 150, por
   plaza, desde el inicio de cada plaza. Minimo 30 dias: si sale antes del dia 30 no gana nada. Los inicios salen de progress.json, que escribe el
   programa diario: { "open": ms, "wallets": { "0x…": [inicio plaza 1, inicio plaza 2, …] } }.
   Sin ese archivo (antes de la apertura) se muestra el premio y "empieza a sumar el dia de la apertura".
   Si la wallet tiene staking y aun no tiene el nodo activo, sale el aviso
   "solo te falta conectar el nodo". */
(function () {
  "use strict";
  var STAKING = "0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0";
  var REGISTRY = "0x8dba83ffA1dF76B4136B39C9edfCD6Ca0B2e9BF1";
  var MAINNET = ["https://ethereum-rpc.publicnode.com", "https://eth.drpc.org", "https://1rpc.io/eth"];
  var SEPOLIA = ["https://ethereum-sepolia-rpc.publicnode.com", "https://sepolia.drpc.org"];
  var SEL = { accountView: "0xf85b90e2", indexPlusOne: "0x7f0b8642", validators: "0x35aa2e44" };
  var DASH = "/dash/";
  var STAKE = "/staking/";
  var MM = "https://metamask.app.link/dapp/sectoraorg.com/airdroptesting/";
  var PROG = "/airdroptesting/progress.json";
  var DAYS = 150, MIN = 30, DAY = 864e5;

  var L = {
    en: { loc: "en-US", k: "Sectora // Airdrop Genesis", pv: "Preview", h: "Your airdrop",
      intro: "Connect your wallet to see how much you win in the airdrop.",
      connect: "Connect wallet", nowallet: "No wallet in this browser?", openmm: "Open in MetaMask",
      or: "Or check an address", check: "Check", reading: "Reading the network…",
      r1: "Wallet connected", r2: "{n} SECT in staking", r2s: "Only staked SECT count · in your wallet: {w}",
      win: "You win {n} SECT", wOn: "Keep your node on and your SECT in staking for 150 days from the day you join (from the opening day if you were already staking). Delivered on SectoraEVM.", wOff: "Once your Hash Node is on with this wallet.",
      lv0: "Phase 2 · registered", lv1: "Level 1 · Scout", lv2: "Level 2 · Sentinel", lv3: "Level 3 · Guardian", lv4: "Level 4 · Titan",
      up0: "With 100 SECT in staking you become Scout and win 40 SECT.", up1: "With 500 SECT in staking you become Sentinel and win 250 SECT.", up2: "With 1,000 SECT in staking you become Guardian and win 600 SECT.", up3: "With 4,000 SECT in staking you become Titan and win 3,400 SECT.", up4: "Every 4,000 SECT more in staking is another Titan spot: +3,400 SECT.", p2: "Phase 2 benefits", p2s: "Testing the node for free registers you for phase 2. To win SECT now, stake 100 SECT and you become Scout.", lv4s: "Level 4 · Titan · {s} spots",
      stk: "Staker detected", stks: "You're already in. You only need to connect your node and you're done.",
      todo: "Activate your Hash Node", todos: "Turn on your node on the testnet with this same wallet. No node, no prize.",
      node: "Activate my Hash Node", done: "Hash Node active", dones: "This wallet's node is on.",
      paused: "Hash Node paused", pauseds: "Your node is registered but paused. Turn it back on to win your prize.", stake: "Stake my SECT", reopen: "Open the dashboard",
      rule: "Scout (100 in staking) 40 SECT · Sentinel (500) 250 SECT · Guardian (1,000) 600 SECT · Titan 3,400 SECT per 4,000 in staking, no maximum · only staking counts",
      foot: "We only read public data: no signature, no transaction, nothing leaves your wallet. Your level is checked once a day.",
      err: "We couldn't read the network. Try again in a moment.", bad: "That address doesn't look right.",
      rej: "The wallet didn't share an address.", close: "Close", other: "Check another wallet",
      acc: "You've earned {n} SECT", of: "of {n} SECT · full prize at day 150", day: "Day {d} of 150 · {r} days to the full prize", lock: "Day {d} of 150 · what you earn is secured on day 30", full: "Full prize complete · delivered on SectoraEVM",
      pre: "Starts adding up on opening day. 150 days with your node on and your SECT in staking = full prize.", wait: "Your count will show as soon as the network confirms your staking." },
    es: { loc: "es-ES", k: "Sectora // Airdrop Genesis", pv: "Vista previa", h: "Tu airdrop",
      intro: "Conecta tu wallet para ver cuánto ganas en el airdrop.",
      connect: "Conectar wallet", nowallet: "¿No tienes wallet en este navegador?", openmm: "Abrir en MetaMask",
      or: "O revisa una dirección", check: "Revisar", reading: "Leyendo la red…",
      r1: "Wallet conectada", r2: "{n} SECT en staking", r2s: "Solo cuentan los SECT en staking · en tu wallet: {w}",
      win: "Ganas {n} SECT", wOn: "Mantén tu nodo encendido y tus SECT en staking durante 150 días desde que entras (desde la apertura si ya hacías staking). Se entrega en SectoraEVM.", wOff: "Cuando tu Hash Node esté encendido con esta wallet.",
      lv0: "Fase 2 · registrado", lv1: "Nivel 1 · Scout", lv2: "Nivel 2 · Sentinel", lv3: "Nivel 3 · Guardian", lv4: "Nivel 4 · Titan",
      up0: "Con 100 SECT en staking pasas a Scout y ganas 40 SECT.", up1: "Con 500 SECT en staking pasas a Sentinel y ganas 250 SECT.", up2: "Con 1.000 SECT en staking pasas a Guardian y ganas 600 SECT.", up3: "Con 4.000 SECT en staking pasas a Titan y ganas 3.400 SECT.", up4: "Cada 4.000 SECT más en staking es otra plaza Titan: +3.400 SECT.", p2: "Beneficios de la fase 2", p2s: "Probar el nodo gratis te registra para la fase 2. Para ganar SECT ahora, pon 100 SECT en staking y pasas a Scout.", lv4s: "Nivel 4 · Titan · {s} plazas",
      stk: "Staker detectado", stks: "Ya estás dentro. Solo te falta conectar el nodo y listo.",
      todo: "Activa tu Hash Node", todos: "Enciende tu nodo en la testnet con esta misma wallet. Sin nodo no hay premio.",
      node: "Activar mi Hash Node", done: "Hash Node activo", dones: "El nodo de esta wallet está encendido.",
      paused: "Hash Node pausado", pauseds: "Tu nodo está registrado pero pausado. Vuelve a encenderlo para ganar tu premio.", stake: "Hacer staking de mis SECT", reopen: "Abrir el panel",
      rule: "Scout (100 en staking) 40 SECT · Sentinel (500) 250 SECT · Guardian (1.000) 600 SECT · Titan 3.400 SECT por cada 4.000 en staking, sin máximo · solo cuenta el staking",
      foot: "Solo leemos datos públicos: no hay firmas ni transacciones y nada sale de tu wallet. Tu nivel se revisa una vez al día.",
      err: "No pudimos leer la red. Prueba de nuevo en un momento.", bad: "Esa dirección no es válida.",
      rej: "La wallet no compartió una dirección.", close: "Cerrar", other: "Revisar otra wallet",
      acc: "Llevas {n} SECT", of: "de {n} SECT · premio completo el día 150", day: "Día {d} de 150 · faltan {r} días para el premio completo", lock: "Día {d} de 150 · lo ganado queda asegurado el día 30", full: "Premio completo · se entrega en SectoraEVM",
      pre: "Empieza a sumar el día de la apertura. 150 días con tu nodo encendido y tus SECT en staking = premio completo.", wait: "Tu conteo aparecerá en cuanto la red confirme tu staking." },
    pt: { loc: "pt-BR", k: "Sectora // Airdrop Genesis", pv: "Prévia", h: "Seu airdrop",
      intro: "Conecte sua carteira para ver quanto você ganha no airdrop.",
      connect: "Conectar carteira", nowallet: "Sem carteira neste navegador?", openmm: "Abrir no MetaMask",
      or: "Ou verifique um endereço", check: "Verificar", reading: "Lendo a rede…",
      r1: "Carteira conectada", r2: "{n} SECT em staking", r2s: "Só contam os SECT em staking · na sua carteira: {w}",
      win: "Você ganha {n} SECT", wOn: "Mantenha seu nó ligado e seus SECT em staking por 150 dias desde que você entra (desde a abertura se já fazia staking). Entregue na SectoraEVM.", wOff: "Quando o seu Hash Node estiver ligado com esta carteira.",
      lv0: "Fase 2 · registrado", lv1: "Nível 1 · Scout", lv2: "Nível 2 · Sentinel", lv3: "Nível 3 · Guardian", lv4: "Nível 4 · Titan",
      up0: "Com 100 SECT em staking você vira Scout e ganha 40 SECT.", up1: "Com 500 SECT em staking você vira Sentinel e ganha 250 SECT.", up2: "Com 1.000 SECT em staking você vira Guardian e ganha 600 SECT.", up3: "Com 4.000 SECT em staking você vira Titan e ganha 3.400 SECT.", up4: "Cada 4.000 SECT a mais em staking é outra vaga Titan: +3.400 SECT.", p2: "Benefícios da fase 2", p2s: "Testar o nó de graça registra você para a fase 2. Para ganhar SECT agora, coloque 100 SECT em staking e você vira Scout.", lv4s: "Nível 4 · Titan · {s} vagas",
      stk: "Staker detectado", stks: "Você já está dentro. Só falta conectar o nó e pronto.",
      todo: "Ative seu Hash Node", todos: "Ligue seu nó na testnet com esta mesma carteira. Sem nó não há prêmio.",
      node: "Ativar meu Hash Node", done: "Hash Node ativo", dones: "O nó desta carteira está ligado.",
      paused: "Hash Node pausado", pauseds: "Seu nó está registrado, mas pausado. Ligue de novo para ganhar seu prêmio.", stake: "Fazer staking dos meus SECT", reopen: "Abrir o painel",
      rule: "Scout (100 em staking) 40 SECT · Sentinel (500) 250 SECT · Guardian (1.000) 600 SECT · Titan 3.400 SECT a cada 4.000 em staking, sem máximo · só conta o staking",
      foot: "Só lemos dados públicos: sem assinatura, sem transação, nada sai da sua carteira. Seu nível é verificado uma vez por dia.",
      err: "Não conseguimos ler a rede. Tente de novo em um instante.", bad: "Esse endereço não é válido.",
      rej: "A carteira não compartilhou um endereço.", close: "Fechar", other: "Verificar outra carteira",
      acc: "Você já tem {n} SECT", of: "de {n} SECT · prêmio completo no dia 150", day: "Dia {d} de 150 · faltam {r} dias para o prêmio completo", lock: "Dia {d} de 150 · o que você ganha fica garantido no dia 30", full: "Prêmio completo · entregue na SectoraEVM",
      pre: "Começa a somar no dia da abertura. 150 dias com seu nó ligado e seus SECT em staking = prêmio completo.", wait: "Sua contagem vai aparecer assim que a rede confirmar seu staking." }
  };
  function lang() { var l = (document.documentElement.lang || "en").slice(0, 2); return L[l] ? l : "en"; }
  function t(k, v) { var s = L[lang()][k]; if (v) for (var x in v) s = s.replace("{" + x + "}", v[x]); return s; }

  /* ---------- estilos ---------- */
  var css = [
    /* una sola ventana: tarjeta redondeada que recorta su contenido; si la pantalla
       es baja, solo el cuerpo se desplaza y sin barra visible */
    ".el-ov{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,7,12,.6);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);opacity:0;visibility:hidden;transition:opacity .28s ease,visibility 0s linear .28s}",
    ".el-ov.on{opacity:1;visibility:visible;transition:opacity .28s ease}",
    ".el{position:relative;display:flex;flex-direction:column;width:min(540px,100%);max-height:calc(100dvh - 32px);overflow:hidden;background:#fff;color:#07080a;border-radius:20px;box-shadow:0 40px 100px -24px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.06);font-family:'IBM Plex Sans',system-ui,sans-serif;font-weight:300;transform:translateY(18px) scale(.97);opacity:0;transition:transform .5s cubic-bezier(.2,.8,.2,1),opacity .3s ease}",
    ".el-ov.on .el{transform:none;opacity:1}",
    ".el::before{content:'';position:absolute;left:0;right:0;top:0;height:3px;background:#1569ff;z-index:2}",
    ".el-hd{flex:none;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 18px 14px 22px;border-bottom:1px solid rgba(7,8,10,.07)}",
    ".el .mono{font-family:'IBM Plex Mono',monospace;font-size:10.5px;font-weight:500;letter-spacing:.14em;text-transform:uppercase}",
    ".el-k{color:#0d4fd8}.el-pv{color:#6b7280;margin-left:10px}",
    ".el-x{flex:none;appearance:none;display:grid;place-items:center;width:34px;height:34px;padding:0;border:0;border-radius:50%;background:#f1f2f4;color:#07080a;cursor:pointer;font-size:19px;line-height:1;transition:background .2s}",
    ".el-x:hover{background:#e4e6ea}",
    ".el-bd{flex:1 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;-ms-overflow-style:none;padding:20px 22px 22px}",
    ".el-bd::-webkit-scrollbar{display:none}",
    ".el h3{font-size:28px;font-weight:300;letter-spacing:-.02em;line-height:1.1}",
    ".el-in{margin-top:8px;font-size:15.5px;line-height:1.55;color:#3c414c}",
    ".el-b{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;margin-top:16px;padding:15px 18px;border:0;background:#07080a;color:#fff;border-radius:12px;cursor:pointer;text-decoration:none;transition:filter .2s,transform .2s}",
    ".el-b:hover{filter:brightness(1.08)}.el-b:active{transform:scale(.99)}",
    ".el-b.go{background:#1569ff}",
    ".el-b + .el-b{margin-top:10px}",
    ".el-alt{margin-top:16px;padding-top:14px;border-top:1px solid rgba(7,8,10,.07);font-size:14px;color:#6b7280}",
    ".el-alt a{color:#0d4fd8}",
    ".el-f{display:flex;gap:8px;margin-top:10px}",
    ".el-f input{flex:1;min-width:0;padding:12px 14px;border:1px solid rgba(7,8,10,.16);border-radius:10px;background:#fff;color:#07080a;font-family:'IBM Plex Mono',monospace;font-size:14px;outline:none}",
    ".el-f input:focus{border-color:#1569ff;box-shadow:0 0 0 3px rgba(21,105,255,.15)}",
    ".el-f button{padding:0 16px;border:1px solid #07080a;background:#fff;color:#07080a;border-radius:10px;cursor:pointer}",
    ".el-rows{list-style:none;margin-top:14px}",
    ".el-rows li{display:grid;grid-template-columns:28px minmax(0,1fr);column-gap:14px;padding:11px 0;border-top:1px solid rgba(7,8,10,.07)}",
    ".el-rows li:first-child{border-top:0}",
    ".el-ic{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#1569ff}",
    ".el-ic svg{width:14px;height:14px;display:block}",
    ".el-ic.p{background:#fff8ec;border:1.5px dashed #e0a030}",
    ".el-rows b{display:block;font-size:17px;font-weight:400;letter-spacing:-.01em;line-height:1.3}",
    ".el-rows span{display:block;margin-top:2px;font-size:14px;line-height:1.45;color:#6b7280}",
    ".el-rows .chip{display:inline-block;margin-top:8px;padding:5px 9px;border:1px solid rgba(21,105,255,.35);background:rgba(21,105,255,.07);color:#0d4fd8;border-radius:999px}",
    ".el-rows b .el-big{display:block;margin:0;font-size:36px;font-weight:300;letter-spacing:-.03em;line-height:1.05;color:#07080a}",
    ".el-rows b .el-big em{font-style:normal;font-weight:400;color:#1569ff}",
    "@media (max-width:520px){.el{border-radius:18px}.el-rows b .el-big{font-size:30px}.el h3{font-size:25px}.el-bd{padding:18px 18px 20px}.el-hd{padding-left:18px}}",
    ".el-rule{margin-top:14px;color:#3c414c;line-height:1.7}",
    ".el-st{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px 14px;align-items:center;margin-top:14px;padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,#1569ff,#0b46c4);color:#fff;overflow:hidden}",
    ".el-st::after{content:'';position:absolute;right:-30px;top:-40px;width:120px;height:120px;border-radius:50%;border:14px solid rgba(255,255,255,.08)}",
    ".el-st i{grid-row:1 / 3;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.16);font-style:normal}",
    ".el-st i svg{width:16px;height:16px;display:block}",
    ".el-st b{font-size:16px;font-weight:500;letter-spacing:-.01em}",
    ".el-st span{font-size:14.5px;line-height:1.45;color:rgba(255,255,255,.88)}",
    /* pantallas bajas (iPhone SE): todo mas junto para que quepa sin desplazar */
    "@media (max-height:720px){.el-hd{padding-top:12px;padding-bottom:10px}.el-bd{padding-top:14px;padding-bottom:16px}.el h3{font-size:23px}.el-rows{margin-top:8px}.el-rows li{padding:8px 0}.el-rows span{font-size:13px}.el-rows b .el-big{font-size:27px}.el-rows .chip{margin-top:6px}.el-b{margin-top:12px;padding:13px 16px}.el-rule{margin-top:10px;line-height:1.55}.el-st{margin-top:10px;padding:11px 14px}.el-ft{font-size:12px}.el-lnk{margin-top:8px}}",
    ".el-ft{margin-top:8px;font-size:12.5px;line-height:1.5;color:#6b7280}",
    ".el-msg{margin-top:12px;font-size:14px;color:#b42318}",
    ".el-sp{display:inline-block;width:14px;height:14px;border:2px solid rgba(7,8,10,.15);border-top-color:#1569ff;border-radius:50%;animation:elsp .8s linear infinite;vertical-align:-2px;margin-right:8px}",
    "@keyframes elsp{to{transform:rotate(360deg)}}",
    ".el-lnk{margin-top:12px;background:none;border:0;padding:0;color:#0d4fd8;cursor:pointer;font-size:14px;text-decoration:underline;text-underline-offset:3px}",
    /* lo ganado en vivo: numero que sube, barra hasta el dia 150 y dias que faltan */
    ".el-rows b .el-big em[data-acc]{font-variant-numeric:tabular-nums}",
    ".el-rows .el-bar{display:block;height:8px;margin-top:10px;border-radius:99px;background:rgba(21,105,255,.12);overflow:hidden}",
    ".el-rows .el-bar i{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#1569ff,#4d8dff)}",
    ".el-rows .el-days{margin-top:8px;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:#0d4fd8}",
    "@media (prefers-reduced-motion:reduce){.el-ov,.el{transition:none}}"
  ].join("\n");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var ov = document.createElement("div"); ov.className = "el-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
  ov.innerHTML = '<div class="el"><div class="el-hd"><div><span class="mono el-k"></span><span class="mono el-pv"></span></div>' +
    '<button class="el-x" type="button">×</button></div><div class="el-bd"></div></div>';
  document.body.appendChild(ov);
  var bd = ov.querySelector(".el-bd");
  ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
  ov.querySelector(".el-x").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  var cur = null, curConn = false; // direccion revisada y si vino de la wallet

  /* ---------- lectura publica ---------- */
  function pad(a) { return a.toLowerCase().replace(/^0x/, "").padStart(64, "0"); }
  function call(rpcs, to, data) {
    var i = 0;
    function next() {
      if (i >= rpcs.length) return Promise.reject(new Error("rpc"));
      var url = rpcs[i++];
      var ctl = new AbortController(); var tm = setTimeout(function () { ctl.abort(); }, 7000);
      return fetch(url, { method: "POST", headers: { "content-type": "application/json" }, signal: ctl.signal,
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: to, data: data }, "latest"] }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { clearTimeout(tm); if (!j || !j.result || j.error) throw new Error("rpc"); return j.result; })
        .catch(function () { clearTimeout(tm); return next(); });
    }
    return next();
  }
  function word(hex, n) { return BigInt("0x" + (hex.slice(2 + 64 * n, 2 + 64 * (n + 1)) || "0")); }
  var WEI = 10n ** 18n;
  function read(addr) {
    var a = call(MAINNET, STAKING, SEL.accountView + pad(addr)).then(function (h) {
      return { staked: word(h, 0) / WEI, wallet: word(h, 2) / WEI };
    });
    var b = call(SEPOLIA, REGISTRY, SEL.indexPlusOne + pad(addr)).then(function (h) {
      var n = word(h, 0);
      if (n === 0n) return "none";
      return call(SEPOLIA, REGISTRY, SEL.validators + pad((n - 1n).toString(16))).then(function (v) {
        return word(v, 6) === 1n ? "active" : "paused";
      });
    }).catch(function () { return "unknown"; });
    var C = window.SACount, hist = C && C.OPEN && Date.now() >= C.OPEN ? C.wallet(addr).catch(function () { return null; }) : null;
    return Promise.all([a, b, prog(), hist]).then(function (r) { return { staked: r[0].staked, wallet: r[0].wallet, node: r[1], prog: r[2], hist: r[3] }; });
  }
  // inicios de cada plaza; el archivo cambia una vez al dia, se pide como mucho una vez por hora
  function prog() {
    return fetch(PROG + "?h=" + Math.floor(Date.now() / 36e5))
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function level(total) { return total < 100n ? 0 : total < 500n ? 1 : total < 1000n ? 2 : total < 4000n ? 3 : 4; }
  var PRIZE = { 0: 0, 1: 40, 2: 250, 3: 600, 4: 3400 };
  function fmt(n) { return new Intl.NumberFormat(L[lang()].loc, { maximumFractionDigits: 0, useGrouping: "always" }).format(Number(n)); }
  function short(a) { return a.slice(0, 6) + "…" + a.slice(-4); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- pantallas ---------- */
  function head() { ov.querySelector(".el-k").textContent = t("k"); ov.querySelector(".el-pv").textContent = t("pv"); ov.querySelector(".el-x").setAttribute("aria-label", t("close")); }
  function start(msg) {
    stop(); head(); cur = null;
    var hasW = !!window.ethereum;
    bd.innerHTML = '<h3>' + t("h") + '</h3><p class="el-in">' + t("intro") + '</p>' +
      (hasW ? '<button class="el-b go mono" type="button" data-a="connect"><span>' + t("connect") + '</span><span>→</span></button>' : "") +
      (msg ? '<p class="el-msg">' + esc(msg) + '</p>' : "") +
      '<div class="el-alt">' + (hasW ? "" : t("nowallet") + ' <a href="' + MM + '">' + t("openmm") + ' ↗</a><br><br>') +
      t("or") + '<form class="el-f"><input name="a" placeholder="0x…" autocomplete="off" spellcheck="false" aria-label="' + t("or") + '"><button class="mono" type="submit">' + t("check") + '</button></form></div>' +
      '<p class="mono el-rule">' + t("rule") + '</p>';
    var b = bd.querySelector('[data-a="connect"]'); if (b) b.addEventListener("click", connect);
    bd.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault(); var v = this.a.value.trim();
      if (!/^0x[0-9a-fA-F]{40}$/.test(v)) { start(t("bad")); return; }
      show(v, false);
    });
  }
  function connect() {
    window.ethereum.request({ method: "eth_requestAccounts" }).then(function (acc) {
      if (acc && acc[0]) show(acc[0], true); else start(t("rej"));
    }).catch(function () { start(t("rej")); });
  }
  function show(addr, connected) {
    stop(); head(); cur = addr; curConn = connected;
    bd.innerHTML = '<h3>' + t("h") + '</h3><p class="el-in"><span class="el-sp"></span>' + t("reading") + '</p>';
    read(addr).then(function (r) {
      if (cur !== addr) return;
      // para el nivel solo cuentan los SECT en staking
      var total = r.staked, lv = level(total), on = r.node === "active";
      // Titan: una plaza por cada 4.000 SECT en staking, sin maximo
      var spots = lv === 4 ? Number(total / 4000n) : 1, prize = PRIZE[lv] * spots;
      // antes de la apertura se muestra el premio; despues, lo ganado sube en vivo
      var P = r.prog, C = window.SACount, now = Date.now(), items = null, closed = 0, state;
      var listed = P && P.open && now >= P.open && P.wallets && P.wallets[addr.toLowerCase()];
      if (lv === 0) state = "p2";
      else if (!on) state = "off";
      else if (listed && listed.length) {
        // lista publicada: un inicio por plaza
        state = "run"; items = listed.slice(0, spots).map(function (s) { return { s: s, p: PRIZE[lv] }; });
      } else if (r.hist && C) {
        // sin lista: se rehace la historia de esta wallet con la blockchain
        var ev = C.evaluate(r.hist.ev, r.hist.node, C.OPEN, now);
        if (ev.items.length) { state = "run"; items = ev.items; closed = ev.closed; } else state = "wait";
      } else state = (C && C.OPEN && now >= C.OPEN) || (P && P.open && now >= P.open) ? "wait" : "pre";
      var rows = [];
      rows.push(li("ok", "", connected ? t("r1") : short(addr), connected ? short(addr) : ""));
      // el premio de su nivel (en Titan, por plaza); solo cuenta con el nodo encendido
      var winT, winS;
      if (state === "run") {
        winT = '<span class="el-big">' + t("acc", { n: "<em data-acc>0</em>" }) + "</span>";
        winS = t("of", { n: fmt(prize) }) + '<span class="el-bar"><i data-bar></i></span><span class="el-days" data-days></span>';
      } else if (state === "p2") {
        winT = '<span class="el-big">' + t("p2") + "</span>";
        winS = on ? t("p2s") : t("wOff");
      } else {
        winT = '<span class="el-big">' + t("win", { n: "<em>" + fmt(prize) + "</em>" }) + "</span>";
        winS = state === "off" ? t("wOff") : state === "pre" ? t("pre") : t("wait");
      }
      rows.push(li(on ? "ok" : "wait", on ? "" : "p", winT, winS,
        spots > 1 ? t("lv4s", { s: fmt(spots) }) : t("lv" + lv)));
      if (on) rows.push(li("ok", "", t("done"), t("dones")));
      else if (r.node === "paused") rows.push(li("warn", "p", t("paused"), t("pauseds")));
      else rows.push(li("wait", "p", t("todo"), t("todos")));
      rows.push(li("ok", "", t("r2", { n: fmt(total) }), t("r2s", { w: fmt(r.wallet) }) + "<br>" + t("up" + lv)));
      // con staking y sin nodo encendido: el aviso de que solo falta el nodo
      var stk = r.staked > 0n && !on ? '<p class="el-st"><i>' + ICON.bolt + "</i><b>" + t("stk") + "</b><span>" + t("stks") + "</span></p>" : "";
      var btn = (on ? "" :
        '<a class="el-b go mono" href="' + DASH + '"><span>' + (r.node === "paused" ? t("reopen") : t("node")) + '</span><span>↗</span></a>') +
        '<a class="el-b mono" href="' + STAKE + '"><span>' + t("stake") + '</span><span>↗</span></a>';
      bd.innerHTML = '<h3>' + t("h") + '</h3>' + stk + '<ul class="el-rows">' + rows.join("") + "</ul>" + btn +
        '<p class="mono el-rule">' + t("rule") + '</p><p class="el-ft">' + t("foot") + '</p>' +
        '<button class="el-lnk" type="button" data-a="other">' + t("other") + "</button>";
      bd.querySelector('[data-a="other"]').addEventListener("click", function () { start(); });
      if (state === "run") live(items, closed, prize);
    }).catch(function () { if (cur === addr) start(t("err")); });
  }
  /* lo ganado sube como en el staking: premio de la plaza x dias / 150, desde el inicio de cada plaza */
  var timer = 0;
  function stop() { if (timer) { clearInterval(timer); timer = 0; } }
  function live(items, closed, prize) {
    var acc = bd.querySelector("[data-acc]"), bar = bd.querySelector("[data-bar]"), days = bd.querySelector("[data-days]");
    var nf = new Intl.NumberFormat(L[lang()].loc, { minimumFractionDigits: 4, maximumFractionDigits: 4, useGrouping: "always" });
    var st = items.map(function (it) { return it.s; }), first = Math.min.apply(null, st), last = Math.max.apply(null, st);
    function tick() {
      var now = Date.now(), earned = 0;
      earned = closed; items.forEach(function (it) { earned += it.p * Math.min(1, Math.max(0, (now - it.s) / (DAYS * DAY))); });
      acc.textContent = nf.format(earned);
      bar.style.width = Math.min(100, earned / prize * 100) + "%";
      var left = Math.ceil((last + DAYS * DAY - now) / DAY);
      var d = Math.min(DAYS, Math.max(1, Math.floor((now - first) / DAY) + 1));
      // minimo de 30 dias: antes de eso, lo ganado aun no esta asegurado
      days.textContent = left <= 0 ? t("full") : d < MIN ? t("lock", { d: d }) : t("day", { d: d, r: left });
    }
    stop(); tick(); timer = setInterval(tick, 100);
  }
  var ICON = {
    ok: '<svg viewBox="0 0 16 16"><path d="M3.2 8.4l3 3 6.6-7" fill="none" stroke="#fff" stroke-width="2.2"/></svg>',
    wait: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.6" fill="#e0a030"/></svg>',
    warn: '<svg viewBox="0 0 16 16"><path d="M8 3.5v6" stroke="#b26b00" stroke-width="2.2"/><circle cx="8" cy="12.4" r="1.3" fill="#b26b00"/></svg>',
    bolt: '<svg viewBox="0 0 16 16"><path d="M9.2 1.5L3.6 9h3.9l-.9 5.5L12.4 7H8.4z" fill="#fff"/></svg>'
  };
  function li(ic, cls, title, sub, chip) {
    return '<li><span class="el-ic ' + cls + '">' + ICON[ic] + "</span><div><b>" + title + "</b>" + (sub ? "<span>" + sub + "</span>" : "") +
      (chip ? '<span class="chip mono">' + chip + "</span>" : "") + "</div></li>";
  }

  function open() { ov.classList.add("on"); document.documentElement.style.overflow = "hidden"; if (cur) show(cur, curConn); else start(); }
  function close() { stop(); ov.classList.remove("on"); document.documentElement.style.overflow = ""; }
  if (window.ethereum && window.ethereum.on) window.ethereum.on("accountsChanged", function (a) { if (ov.classList.contains("on") && a && a[0]) show(a[0], true); });

  window.SAElig = { open: open, close: close };
})();
