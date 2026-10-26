/* Ventana "Tu airdrop": al conectar la wallet lee, sin firmas ni
   transacciones, los SECT de la wallet y los del staking (una sola llamada
   a accountView del contrato de staking en Ethereum) y el nodo de la testnet
   (ValidatorRegistry en Sepolia). Con eso muestra el premio fijo de su nivel,
   que solo se gana con el Hash Node encendido. Para el nivel solo cuentan los
   SECT en staking; los de la wallet se muestran para invitar a stakearlos:
   - Scout, menos de 500 SECT = 150 SECT (wallets con historial en Ethereum, tope de 1.000.000 SECT);
   - Sentinel, desde 500 SECT = 250 SECT;
   - Guardian, desde 1.000 SECT = 600 SECT;
   - Titan, una plaza de 2.800 SECT por cada 4.000 SECT, sin maximo.
   Cada persona tiene dos fases de 90 dias desde que entra (mitad del premio en cada una); cada mitad
   se entrega en SectoraEVM al terminar su fase, o al lanzarse la mainnet si llega despues.
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

  var L = {
    en: { loc: "en-US", k: "Sectora // Airdrop Genesis", pv: "Preview", h: "Your airdrop",
      intro: "Connect your wallet to see how much you win in the airdrop.",
      connect: "Connect wallet", nowallet: "No wallet in this browser?", openmm: "Open in MetaMask",
      or: "Or check an address", check: "Check", reading: "Reading the network…",
      r1: "Wallet connected", r2: "{n} SECT in staking", r2s: "Only staked SECT count · in your wallet: {w}",
      win: "You win {n} SECT", wOn: "Phase 1: 90 days with your node on and your SECT in staking wins half. Phase 2: 90 more days wins the other half. Days count from the day you join (from the opening day if you were already staking). Delivered on SectoraEVM.", wOff: "Once your Hash Node is on with this wallet.",
      lv1: "Level 1 · Scout", lv2: "Level 2 · Sentinel", lv3: "Level 3 · Guardian", lv4: "Level 4 · Titan",
      up1: "With 500 SECT in staking you become Sentinel and win 250 SECT.", up2: "With 1,000 SECT in staking you become Guardian and win 600 SECT.", up3: "With 4,000 SECT in staking you become Titan and win 2,800 SECT.", up4: "Every 4,000 SECT more in staking is another Titan spot: +2,800 SECT.", sreq: "Scout only counts wallets that already used Ethereum before the announcement (30 days and 5 transactions). Up to 1,000,000 SECT for all Scouts.", lv4s: "Level 4 · Titan · {s} spots",
      stk: "Staker detected", stks: "You're already in. You only need to connect your node and you're done.",
      todo: "Activate your Hash Node", todos: "Turn on your node on the testnet with this same wallet. No node, no prize.",
      node: "Activate my Hash Node", done: "Hash Node active", dones: "This wallet's node is on.",
      paused: "Hash Node paused", pauseds: "Your node is registered but paused. Turn it back on to win your prize.", stake: "Stake my SECT", reopen: "Open the dashboard",
      rule: "Scout 150 SECT · Sentinel (500 in staking) 250 SECT · Guardian (1,000) 600 SECT · Titan 2,800 SECT per 4,000 in staking, no maximum · only staking counts",
      foot: "We only read public data: no signature, no transaction, nothing leaves your wallet. Your level is checked once a day.",
      err: "We couldn't read the network. Try again in a moment.", bad: "That address doesn't look right.",
      rej: "The wallet didn't share an address.", close: "Close", other: "Check another wallet" },
    es: { loc: "es-ES", k: "Sectora // Airdrop Genesis", pv: "Vista previa", h: "Tu airdrop",
      intro: "Conecta tu wallet para ver cuánto ganas en el airdrop.",
      connect: "Conectar wallet", nowallet: "¿No tienes wallet en este navegador?", openmm: "Abrir en MetaMask",
      or: "O revisa una dirección", check: "Revisar", reading: "Leyendo la red…",
      r1: "Wallet conectada", r2: "{n} SECT en staking", r2s: "Solo cuentan los SECT en staking · en tu wallet: {w}",
      win: "Ganas {n} SECT", wOn: "Fase 1: 90 días con tu nodo encendido y tus SECT en staking ganan la mitad. Fase 2: 90 días más ganan la otra mitad. Los días cuentan desde que entras (desde la apertura si ya hacías staking). Se entrega en SectoraEVM.", wOff: "Cuando tu Hash Node esté encendido con esta wallet.",
      lv1: "Nivel 1 · Scout", lv2: "Nivel 2 · Sentinel", lv3: "Nivel 3 · Guardian", lv4: "Nivel 4 · Titan",
      up1: "Con 500 SECT en staking pasas a Sentinel y ganas 250 SECT.", up2: "Con 1.000 SECT en staking pasas a Guardian y ganas 600 SECT.", up3: "Con 4.000 SECT en staking pasas a Titan y ganas 2.800 SECT.", up4: "Cada 4.000 SECT más en staking es otra plaza Titan: +2.800 SECT.", sreq: "Scout solo cuenta wallets que ya usaban Ethereum antes del anuncio (30 días y 5 transacciones). Hasta 1.000.000 SECT para todos los Scouts.", lv4s: "Nivel 4 · Titan · {s} plazas",
      stk: "Staker detectado", stks: "Ya estás dentro. Solo te falta conectar el nodo y listo.",
      todo: "Activa tu Hash Node", todos: "Enciende tu nodo en la testnet con esta misma wallet. Sin nodo no hay premio.",
      node: "Activar mi Hash Node", done: "Hash Node activo", dones: "El nodo de esta wallet está encendido.",
      paused: "Hash Node pausado", pauseds: "Tu nodo está registrado pero pausado. Vuelve a encenderlo para ganar tu premio.", stake: "Hacer staking de mis SECT", reopen: "Abrir el panel",
      rule: "Scout 150 SECT · Sentinel (500 en staking) 250 SECT · Guardian (1.000) 600 SECT · Titan 2.800 SECT por cada 4.000 en staking, sin máximo · solo cuenta el staking",
      foot: "Solo leemos datos públicos: no hay firmas ni transacciones y nada sale de tu wallet. Tu nivel se revisa una vez al día.",
      err: "No pudimos leer la red. Prueba de nuevo en un momento.", bad: "Esa dirección no es válida.",
      rej: "La wallet no compartió una dirección.", close: "Cerrar", other: "Revisar otra wallet" },
    pt: { loc: "pt-BR", k: "Sectora // Airdrop Genesis", pv: "Prévia", h: "Seu airdrop",
      intro: "Conecte sua carteira para ver quanto você ganha no airdrop.",
      connect: "Conectar carteira", nowallet: "Sem carteira neste navegador?", openmm: "Abrir no MetaMask",
      or: "Ou verifique um endereço", check: "Verificar", reading: "Lendo a rede…",
      r1: "Carteira conectada", r2: "{n} SECT em staking", r2s: "Só contam os SECT em staking · na sua carteira: {w}",
      win: "Você ganha {n} SECT", wOn: "Fase 1: 90 dias com seu nó ligado e seus SECT em staking ganham metade. Fase 2: mais 90 dias ganham a outra metade. Os dias contam desde que você entra (desde a abertura se já fazia staking). Entregue na SectoraEVM.", wOff: "Quando o seu Hash Node estiver ligado com esta carteira.",
      lv1: "Nível 1 · Scout", lv2: "Nível 2 · Sentinel", lv3: "Nível 3 · Guardian", lv4: "Nível 4 · Titan",
      up1: "Com 500 SECT em staking você vira Sentinel e ganha 250 SECT.", up2: "Com 1.000 SECT em staking você vira Guardian e ganha 600 SECT.", up3: "Com 4.000 SECT em staking você vira Titan e ganha 2.800 SECT.", up4: "Cada 4.000 SECT a mais em staking é outra vaga Titan: +2.800 SECT.", sreq: "Scout só conta carteiras que já usavam a Ethereum antes do anúncio (30 dias e 5 transações). Até 1.000.000 SECT para todos os Scouts.", lv4s: "Nível 4 · Titan · {s} vagas",
      stk: "Staker detectado", stks: "Você já está dentro. Só falta conectar o nó e pronto.",
      todo: "Ative seu Hash Node", todos: "Ligue seu nó na testnet com esta mesma carteira. Sem nó não há prêmio.",
      node: "Ativar meu Hash Node", done: "Hash Node ativo", dones: "O nó desta carteira está ligado.",
      paused: "Hash Node pausado", pauseds: "Seu nó está registrado, mas pausado. Ligue de novo para ganhar seu prêmio.", stake: "Fazer staking dos meus SECT", reopen: "Abrir o painel",
      rule: "Scout 150 SECT · Sentinel (500 em staking) 250 SECT · Guardian (1.000) 600 SECT · Titan 2.800 SECT a cada 4.000 em staking, sem máximo · só conta o staking",
      foot: "Só lemos dados públicos: sem assinatura, sem transação, nada sai da sua carteira. Seu nível é verificado uma vez por dia.",
      err: "Não conseguimos ler a rede. Tente de novo em um instante.", bad: "Esse endereço não é válido.",
      rej: "A carteira não compartilhou um endereço.", close: "Fechar", other: "Verificar outra carteira" }
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
    return Promise.all([a, b]).then(function (r) { return { staked: r[0].staked, wallet: r[0].wallet, node: r[1] }; });
  }
  function level(total) { return total < 500n ? 1 : total < 1000n ? 2 : total < 4000n ? 3 : 4; }
  var PRIZE = { 1: 150, 2: 250, 3: 600, 4: 2800 };
  function fmt(n) { return new Intl.NumberFormat(L[lang()].loc, { maximumFractionDigits: 0, useGrouping: "always" }).format(Number(n)); }
  function short(a) { return a.slice(0, 6) + "…" + a.slice(-4); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- pantallas ---------- */
  function head() { ov.querySelector(".el-k").textContent = t("k"); ov.querySelector(".el-pv").textContent = t("pv"); ov.querySelector(".el-x").setAttribute("aria-label", t("close")); }
  function start(msg) {
    head(); cur = null;
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
    head(); cur = addr; curConn = connected;
    bd.innerHTML = '<h3>' + t("h") + '</h3><p class="el-in"><span class="el-sp"></span>' + t("reading") + '</p>';
    read(addr).then(function (r) {
      if (cur !== addr) return;
      // para el nivel solo cuentan los SECT en staking
      var total = r.staked, lv = level(total), on = r.node === "active";
      // Titan: una plaza por cada 4.000 SECT en staking, sin maximo
      var spots = lv === 4 ? Number(total / 4000n) : 1, prize = PRIZE[lv] * spots;
      var rows = [];
      rows.push(li("ok", "", connected ? t("r1") : short(addr), connected ? short(addr) : ""));
      // el premio de su nivel (en Titan, por plaza); solo cuenta con el nodo encendido
      rows.push(li(on ? "ok" : "wait", on ? "" : "p", '<span class="el-big">' + t("win", { n: "<em>" + fmt(prize) + "</em>" }) + "</span>",
        (on ? t("wOn") : t("wOff")) + (lv === 1 ? "<br>" + t("sreq") : ""), spots > 1 ? t("lv4s", { s: fmt(spots) }) : t("lv" + lv)));
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
    }).catch(function () { if (cur === addr) start(t("err")); });
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
  function close() { ov.classList.remove("on"); document.documentElement.style.overflow = ""; }
  if (window.ethereum && window.ethereum.on) window.ethereum.on("accountsChanged", function (a) { if (ov.classList.contains("on") && a && a[0]) show(a[0], true); });

  window.SAElig = { open: open, close: close };
})();
