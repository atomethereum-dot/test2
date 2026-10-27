/* Sectora Airdrop · staking panel
   A window that sits beside the staking console and tells stakers where they
   stand in Airdrop Genesis: step 1 (SECT in staking) is done, their level and
   spots for what they have staked, the prize that adds up to, and that the only
   thing left is to connect their Hash Node. Prize = SECT in staking x the rate
   of the level (Scout 55, Sentinel 65, Guardian 75, Titan 90 per 100 SECT);
   spots = SECT in staking / the minimum of the level.
   It reads what the staking page already shows (#earnDep, the amount deposited
   by the connected wallet) and, when the page announces the connected address
   (the "sectora:account" event, only in /stakingtest for now), it looks that
   address up in the Hash Node registry on Sepolia to mark step 2. It never
   talks to the wallet or to the staking contract. */
(function () {
  "use strict";
  if (document.querySelector(".sad")) return;

  var AIRDROP_URL = "/airdroptesting/";
  var NODE_URL = "/dashboard.html#guia-nodo";
  /* solo pruebas: apertura simulada para ver el contador en vivo. Al lanzar se quita: la fecha real va en count.js */
  var TEST_OPEN = Date.UTC(2026, 9, 27);
  var COUNT_JS = "/airdroptesting/count.js?v=11";
  var REGISTRY = "0x8dba83ffA1dF76B4136B39C9edfCD6Ca0B2e9BF1";
  var SEPOLIA = ["https://ethereum-sepolia-rpc.publicnode.com", "https://sepolia.gateway.tenderly.co", "https://ethereum-sepolia.publicnode.com"];
  var SEL = { indexPlusOne: "0x7f0b8642", validators: "0x35aa2e44" };
  var LV = [{ min: 100, rate: .55, n: "Scout" }, { min: 500, rate: .65, n: "Sentinel" }, { min: 1000, rate: .75, n: "Guardian" }, { min: 4000, rate: .9, n: "Titan" }];

  var T = {
    en: { loc: "en-US", bar: "airdrop genesis", band: "Airdrop Genesis", k: "Your airdrop",
      h0: "Connect your wallet to see <b>your level.</b>", p0: "Your staking counts for the airdrop, without withdrawing anything.",
      h1: "You need <b>{x} SECT</b> more to join.", p1: "With 100 SECT in staking you're Scout and you're in the airdrop.",
      h2: "Step 1 <b>completed.</b>", p2: "Your SECT in staking already count. All that's left is to connect your Hash Node.",
      s1: "Step 1 · SECT in staking", s1min: "Min. 100", s2: "Step 2 · Connect your Hash Node", s2t: "Last step",
      lv: "Your level", lvs: "Level {n}", sp: "Spots", sps: "of {l}", pz: "Your prize", pzs: "SECT on completing your time",
      up: "With {x} SECT more you move up to {l} and your prize rises to {p} SECT.", top: "Titan has no maximum: every 1,000 SECT more add 900 SECT.",
      cta: "Connect my Hash Node", more: "See the airdrop", have: "Already on? Check it in the airdrop.",
      note: "No lock-up: if you withdraw, your count pauses and continues when you come back.", min: "Minimise", max: "Open", done: "Step 1 ✓", wait: "Connect wallet",
      h3: "You're in the <b>airdrop.</b>", p3: "Staking and Hash Node ready. Keep both until you complete your time to win your prize.",
      p1n: "Your Hash Node is already on. With 100 SECT in staking you're in the airdrop.", poff: "Your Hash Node is off: turn it on so your count keeps going.",
      on: "On", off: "Off", chk: "Checking…", ctaOn: "See my airdrop", ctaOff: "Turn on my Hash Node", both: "2/2 ✓",
      hw: "How to turn on your Hash Node", hw1: "Get free Sepolia ETH for the gas", hw2: "Buy the 50 TH/s plan", hw3: "Register your node with this same wallet", hwp: "Open the plan", hwn: "Go to your node",
      acc: "Generated so far", of: "of {n} SECT on completing your time", calc: "Calculating with the network…", pre: "It starts counting the day the airdrop opens.", lock: "From {d} (30 days in) what you generate is yours.", mine: "What you generate is already yours.",
      who: "Wallet {a}", wNone: "no node registered with this wallet", wOn: "node on", wOff: "node off", wChk: "checking its node…", wErr: "couldn't check the network, retrying…" },
    es: { loc: "es-ES", bar: "airdrop genesis", band: "Airdrop Genesis", k: "Tu airdrop",
      h0: "Conecta tu wallet para ver <b>tu nivel.</b>", p0: "Tu staking cuenta para el airdrop, sin retirar nada.",
      h1: "Te faltan <b>{x} SECT</b> para entrar.", p1: "Con 100 SECT en staking eres Scout y entras al airdrop.",
      h2: "Paso 1 <b>completado.</b>", p2: "Tus SECT en staking ya cuentan. Solo te falta conectar tu Hash Node.",
      s1: "Paso 1 · SECT en staking", s1min: "Mín. 100", s2: "Paso 2 · Conecta tu Hash Node", s2t: "Último paso",
      lv: "Tu nivel", lvs: "Nivel {n}", sp: "Plazas", sps: "de {l}", pz: "Tu premio", pzs: "SECT al completar tu tiempo",
      up: "Con {x} SECT más subes a {l} y tu premio pasa a {p} SECT.", top: "Titan no tiene máximo: cada 1.000 SECT más suman 900 SECT.",
      cta: "Conectar mi Hash Node", more: "Ver el airdrop", have: "¿Ya lo tienes encendido? Compruébalo en el airdrop.",
      note: "Sin bloqueo: si retiras, tu conteo se pausa y sigue al volver.", min: "Minimizar", max: "Abrir", done: "Paso 1 ✓", wait: "Conecta tu wallet",
      h3: "Ya participas en el <b>airdrop.</b>", p3: "Staking y Hash Node listos. Mantén los dos hasta completar tu tiempo para ganar tu premio.",
      p1n: "Tu Hash Node ya está encendido. Con 100 SECT en staking entras al airdrop.", poff: "Tu Hash Node está apagado: enciéndelo para que tu conteo siga.",
      on: "Encendido", off: "Apagado", chk: "Comprobando…", ctaOn: "Ver mi airdrop", ctaOff: "Encender mi Hash Node", both: "2/2 ✓",
      hw: "Cómo encender tu Hash Node", hw1: "Consigue ETH de Sepolia gratis para el gas", hw2: "Compra el plan de 50 TH/s", hw3: "Registra tu nodo con esta misma wallet", hwp: "Abrir el plan", hwn: "Ir a tu nodo",
      acc: "Llevas generado", of: "de {n} SECT al completar tu tiempo", calc: "Calculando con la red…", pre: "Empieza a contar el día de la apertura del airdrop.", lock: "Desde el {d} (30 días dentro) lo generado es tuyo.", mine: "Lo generado ya es tuyo.",
      who: "Wallet {a}", wNone: "sin nodo registrado con esta wallet", wOn: "nodo encendido", wOff: "nodo apagado", wChk: "comprobando su nodo…", wErr: "no se pudo consultar la red, reintentando…" },
    pt: { loc: "pt-BR", bar: "airdrop genesis", band: "Airdrop Genesis", k: "Seu airdrop",
      h0: "Conecte sua carteira para ver <b>seu nível.</b>", p0: "Seu staking conta para o airdrop, sem sacar nada.",
      h1: "Faltam <b>{x} SECT</b> para você entrar.", p1: "Com 100 SECT em staking você é Scout e entra no airdrop.",
      h2: "Passo 1 <b>concluído.</b>", p2: "Seus SECT em staking já contam. Só falta conectar seu Hash Node.",
      s1: "Passo 1 · SECT em staking", s1min: "Mín. 100", s2: "Passo 2 · Conecte seu Hash Node", s2t: "Último passo",
      lv: "Seu nível", lvs: "Nível {n}", sp: "Vagas", sps: "de {l}", pz: "Seu prêmio", pzs: "SECT ao completar seu tempo",
      up: "Com mais {x} SECT você sobe para {l} e seu prêmio passa a {p} SECT.", top: "Titan não tem máximo: cada 1.000 SECT a mais somam 900 SECT.",
      cta: "Conectar meu Hash Node", more: "Ver o airdrop", have: "Já está ligado? Confira no airdrop.",
      note: "Sem bloqueio: se você sacar, sua contagem pausa e continua quando voltar.", min: "Minimizar", max: "Abrir", done: "Passo 1 ✓", wait: "Conecte a carteira",
      h3: "Você já participa do <b>airdrop.</b>", p3: "Staking e Hash Node prontos. Mantenha os dois até completar seu tempo para ganhar seu prêmio.",
      p1n: "Seu Hash Node já está ligado. Com 100 SECT em staking você entra no airdrop.", poff: "Seu Hash Node está desligado: ligue-o para sua contagem continuar.",
      on: "Ligado", off: "Desligado", chk: "Verificando…", ctaOn: "Ver meu airdrop", ctaOff: "Ligar meu Hash Node", both: "2/2 ✓",
      hw: "Como ligar seu Hash Node", hw1: "Pegue ETH da Sepolia grátis para o gás", hw2: "Compre o plano de 50 TH/s", hw3: "Registre seu nó com esta mesma carteira", hwp: "Abrir o plano", hwn: "Ir ao seu nó",
      acc: "Você já gerou", of: "de {n} SECT ao completar seu tempo", calc: "Calculando com a rede…", pre: "Começa a contar no dia da abertura do airdrop.", lock: "A partir de {d} (30 dias dentro) o que você gera é seu.", mine: "O que você gerou já é seu.",
      who: "Carteira {a}", wNone: "sem nó registrado nesta carteira", wOn: "nó ligado", wOff: "nó desligado", wChk: "verificando o nó…", wErr: "não foi possível consultar a rede, tentando de novo…" }
  };
  function pick() {
    var l = "";
    try { l = localStorage.getItem("sa_lang") || ""; } catch (e) {}
    if (!T[l]) l = (navigator.language || "").slice(0, 2);
    return T[l] ? l : "en";
  }
  var L = T[pick()];

  /* same look as the staking console beside it: a band and a white card with
     the blue top line; a level box in light grey and the node step in blue */
  var css = "" +
    ".sad{--b:#1569ff;--bd:#0d4fd8;--ink:#07080a;--ink2:#3c414c;--ink3:#6b7280;--ink4:#9aa0ab;--line:rgba(0,0,0,.11);--ok:#0f8f52;" +
    "position:relative;margin:0 0 clamp(18px,2.4vw,28px);padding:clamp(14px,1.4vw,20px);border:1px solid var(--line);border-radius:22px;background:rgba(255,255,255,.35);" +
    "font-family:'IBM Plex Sans',system-ui,sans-serif;font-weight:300;color:var(--ink)}" +
    ".sad .m{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:400}" +
    ".sad-band{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;font-size:10.5px}" +
    ".sad-band span{color:var(--ink3)}" +
    ".sad-band b{color:var(--b);font-weight:500}" +
    ".sad-card{position:relative;overflow:hidden;background:#fff;color:var(--ink);padding:clamp(18px,2vw,26px);border:1px solid rgba(0,0,0,.08);border-radius:16px;" +
    "box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 24px 60px -36px rgba(7,8,10,.28)}" +
    ".sad-card::after{content:'';position:absolute;left:0;right:0;top:0;height:3px;background:var(--b)}" +
    ".sad-head{display:flex;align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--line);font-size:9.5px;color:var(--ink4)}" +
    ".sad-head .sp{flex:1}" +
    ".sad-cnt{display:none;color:var(--bd)}" +
    ".sad.min .sad-cnt{display:inline}" +
    ".sad-min{display:grid;place-items:center;width:28px;height:24px;padding:0;border:1px solid var(--line);border-radius:8px;background:none;color:var(--ink3);cursor:pointer;font:inherit;transition:border-color .3s,color .3s}" +
    ".sad-min:hover{border-color:var(--ink3);color:var(--ink)}" +
    ".sad-min i{display:block;width:10px;height:1px;background:currentColor;position:relative}" +
    ".sad.min .sad-min i::after{content:'';position:absolute;left:0;top:0;width:10px;height:1px;background:currentColor;transform:rotate(90deg)}" +
    ".sad-body{padding-top:18px}" +
    ".sad.min .sad-body{display:none}" +
    ".sad-k{color:var(--b)}" +
    ".sad h3{margin:10px 0 0;font-size:clamp(22px,1.9vw,27px);font-weight:300;letter-spacing:-.02em;line-height:1.15;color:var(--ink)}" +
    ".sad h3 b{font-weight:400;color:var(--b)}" +
    ".sad-p{margin:10px 0 0;font-size:14.5px;line-height:1.6;color:var(--ink2)}" +
    /* the two steps */
    ".sad-steps{list-style:none;margin:18px 0 0;padding:0;border-top:1px solid var(--line)}" +
    ".sad-steps li{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:12px;align-items:center;padding:13px 0;border-bottom:1px solid var(--line);font-size:14.5px;line-height:1.4;color:var(--ink2)}" +
    ".sad-ic{position:relative;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;border:1.5px solid #c3c7cf;color:transparent;font-size:12px;line-height:1;font-weight:500}" +
    ".sad-steps li.done{color:var(--ink)}" +
    ".sad-steps li.done .sad-ic{border-color:var(--ok);background:var(--ok);color:#fff}" +
    ".sad-steps li.next .sad-ic{border-color:var(--b);box-shadow:0 0 0 4px rgba(21,105,255,.12)}" +
    ".sad-steps li.next .sad-ic::after{content:'';position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:var(--b);animation:sadPulse 1.8s ease-in-out infinite}" +
    "@keyframes sadPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}" +
    ".sad-steps .v{font-variant-numeric:tabular-nums;color:var(--ink);font-weight:400;white-space:nowrap}" +
    ".sad-steps li .tg{color:var(--ink4);white-space:nowrap}" +
    ".sad-steps li.next .tg{color:var(--bd)}" +
    ".sad-steps li.done .tg{color:var(--ok)}" +
    ".sad-steps li.off .tg{color:#a86400}" +
    ".sad-who{margin:10px 0 0;font-size:9.5px;line-height:1.6;color:var(--ink3)}" +
    ".sad-acc{margin-top:14px;padding:14px 16px;border-radius:12px;border:1px solid rgba(15,143,82,.28);background:linear-gradient(135deg,rgba(15,143,82,.08),rgba(15,143,82,.02))}" +
    ".sad-acc .m{color:var(--ok);font-size:9.5px}" +
    ".sad-acc b{display:block;margin-top:6px;font-size:clamp(26px,2.4vw,32px);font-weight:300;letter-spacing:-.02em;line-height:1.1;color:var(--ink);font-variant-numeric:tabular-nums}" +
    ".sad-acc b em{font-style:normal;font-weight:400}" +
    ".sad-acc .bar{display:block;height:6px;margin-top:10px;border-radius:99px;background:rgba(15,143,82,.12);overflow:hidden}" +
    ".sad-acc .bar i{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#0f8f52,#3ecf8e)}" +
    ".sad-acc small{display:block;margin-top:8px;font-size:12.5px;line-height:1.45;color:var(--ink3)}" +
    ".sad-how{margin-top:14px;padding:12px 14px;border-radius:12px;background:#f7f7f5;border:1px solid rgba(0,0,0,.08)}" +
    ".sad-how .m{color:var(--b);font-size:9.5px}" +
    ".sad-how ol{list-style:none;margin:8px 0 0;padding:0}" +
    ".sad-how li{display:grid;grid-template-columns:22px minmax(0,1fr);column-gap:10px;padding:7px 0;font-size:13.5px;line-height:22px;color:var(--ink);font-weight:400}" +
    ".sad-how li + li{border-top:1px solid rgba(0,0,0,.07)}" +
    ".sad-how li > span{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#fff;border:1px solid rgba(21,105,255,.4);color:var(--bd);font-family:'IBM Plex Mono',monospace;font-size:11px}" +
    ".sad-how em{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;font-style:normal}" +
    ".sad-how a{padding:3px 9px;border-radius:999px;border:1px solid rgba(21,105,255,.35);background:#fff;color:var(--bd);text-decoration:none;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;line-height:18px}" +
    ".sad-how a:hover{background:rgba(21,105,255,.08)}" +
    ".sad-who b{font-weight:500;color:var(--ink2)}" +
    /* level, spots and prize */
    ".sad-lv{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:16px;border:1px solid rgba(0,0,0,.12);border-radius:12px;background:#f7f7f5}" +
    ".sad-lv > div{padding:14px 14px 13px;min-width:0}" +
    ".sad-lv > div + div{border-left:1px solid rgba(0,0,0,.09)}" +
    ".sad-lv .m{display:block;color:var(--ink3);font-size:9.5px}" +
    ".sad-lv b{display:block;margin-top:8px;font-size:clamp(20px,1.8vw,25px);font-weight:300;letter-spacing:-.02em;line-height:1.05;color:var(--ink);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".sad-lv .lv b{color:var(--bd);font-weight:400}" +
    ".sad-lv small{display:block;margin-top:5px;font-size:12px;line-height:1.35;color:var(--ink3)}" +
    ".sad-up{margin:12px 0 0;font-size:13.5px;line-height:1.55;color:var(--ink2)}" +
    ".sad-up b{font-weight:500;color:var(--ink)}" +
    /* buttons and notes */
    ".sad-cta{position:relative;overflow:hidden;display:flex;justify-content:center;align-items:center;gap:11px;margin-top:18px;padding:17px 22px;border-radius:12px;background:var(--b);color:#fff;text-decoration:none;font-size:10.5px}" +
    ".sad-cta::before{content:'';position:absolute;inset:0;background:var(--bd);transform:translateY(101%);transition:transform .42s cubic-bezier(.22,.72,.24,1)}" +
    ".sad-cta:hover::before{transform:none}" +
    ".sad-cta span,.sad-cta i{position:relative;font-style:normal}" +
    ".sad-links{display:flex;justify-content:space-between;align-items:center;gap:8px 14px;flex-wrap:wrap;margin-top:12px;font-size:13px;line-height:1.45;color:var(--ink3)}" +
    ".sad-links a{color:var(--ink2);text-decoration:underline;text-decoration-color:rgba(0,0,0,.22);text-underline-offset:3px;transition:text-decoration-color .3s,color .3s}" +
    ".sad-links a:hover{color:var(--ink);text-decoration-color:var(--b)}" +
    ".sad-links a.m{font-size:9.5px;text-decoration:none;color:var(--bd)}" +
    ".sad-note{display:flex;gap:9px;align-items:flex-start;margin:14px 0 0;padding:11px 13px;border-radius:10px;background:rgba(21,105,255,.06);border:1px solid rgba(21,105,255,.18);font-size:12.5px;line-height:1.5;color:var(--ink2)}" +
    ".sad-note svg{flex:none;width:16px;height:16px;margin-top:1px;fill:none;stroke:var(--b);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}" +
    ".sad [hidden]{display:none!important}" +
    ".sad-min:focus-visible,.sad-cta:focus-visible,.sad-links a:focus-visible{outline:2px solid var(--b);outline-offset:3px}" +
    /* beside the console: the window takes the top of the right column, the steps go below it */
    ".pp-body.sad-on > .frame{grid-row:1 / span 2}" +
    ".pp-body.sad-on > .sad{grid-column:2;grid-row:1}" +
    ".pp-body.sad-on > .steps{grid-column:2;grid-row:2}" +
    "@media (max-width:980px){.pp-body.sad-on{grid-template-rows:none}.pp-body.sad-on > .frame,.pp-body.sad-on > .sad,.pp-body.sad-on > .steps{grid-column:auto;grid-row:auto}}" +
    "@media (max-width:420px){.sad-lv{grid-template-columns:1fr 1fr}.sad-lv .pz{grid-column:1 / -1;border-left:0!important;border-top:1px solid rgba(0,0,0,.09)}}" +
    "@media (prefers-reduced-motion:reduce){.sad *{animation:none!important;transition:none!important}}";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 7.6-1.7"/></svg>';

  function mount() {
    var body = document.querySelector("#stake .pp-body");
    var steps = body && body.querySelector(".steps");
    if (!body || !steps) return;

    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    var el = document.createElement("aside");
    el.className = "sad";
    el.setAttribute("aria-label", "Sectora Airdrop");
    el.innerHTML =
      '<div class="sad-band m"><span>' + esc(L.band) + '</span><b>SA&middot;ST&middot;01&middot;26</b></div>' +
      '<div class="sad-card">' +
        '<div class="sad-head m"><span>Sectora &nbsp;//&nbsp; ' + esc(L.bar) + '</span><span class="sp"></span><span class="sad-cnt"></span>' +
          '<button type="button" class="sad-min" aria-expanded="true" aria-label="' + esc(L.min) + '"><i></i></button>' +
        "</div>" +
        '<div class="sad-body">' +
          '<p class="sad-k m">' + esc(L.k) + "</p>" +
          '<h3 class="sad-h"></h3>' +
          '<p class="sad-p"></p>' +
          '<ul class="sad-steps">' +
            '<li class="s1"><span class="sad-ic">✓</span><span>' + esc(L.s1) + '</span><span class="v"></span></li>' +
            '<li class="s2"><span class="sad-ic"></span><span>' + esc(L.s2) + '</span><span class="tg m">' + esc(L.s2t) + "</span></li>" +
          "</ul>" +
          '<p class="sad-who m" hidden></p>' +
          '<div class="sad-acc" hidden><span class="m">' + esc(L.acc) + '</span><b><em>0</em> SECT</b><i class="bar"><i></i></i><small></small></div>' +
          '<div class="sad-how" hidden><p class="m">' + esc(L.hw) + "</p><ol>" +
            '<li><span>1</span><div>' + esc(L.hw1) + '<em><a href="https://faucet.quicknode.com/ethereum/sepolia" target="_blank" rel="noopener noreferrer">QuickNode ↗</a><a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank" rel="noopener noreferrer">Google ↗</a></em></div></li>' +
            '<li><span>2</span><div>' + esc(L.hw2) + '<em><a href="/dashboard.html#plan">' + esc(L.hwp) + " ↗</a></em></div></li>" +
            '<li><span>3</span><div>' + esc(L.hw3) + '<em><a href="/dashboard.html#node">' + esc(L.hwn) + " ↗</a></em></div></li></ol></div>" +
          '<div class="sad-lv" hidden>' +
            '<div class="lv"><span class="m">' + esc(L.lv) + '</span><b></b><small></small></div>' +
            '<div class="spt"><span class="m">' + esc(L.sp) + '</span><b></b><small></small></div>' +
            '<div class="pz"><span class="m">' + esc(L.pz) + '</span><b></b><small>' + esc(L.pzs) + "</small></div>" +
          "</div>" +
          '<p class="sad-up" hidden></p>' +
          '<a class="sad-cta m" href="' + NODE_URL + '"><span>' + esc(L.cta) + "</span><i>→</i></a>" +
          '<div class="sad-links"><a href="' + AIRDROP_URL + '">' + esc(L.have) + '</a><a class="m" href="' + AIRDROP_URL + '">' + esc(L.more) + " →</a></div>" +
          '<p class="sad-note">' + LOCK + "<span>" + esc(L.note) + "</span></p>" +
        "</div>" +
      "</div>";
    body.insertBefore(el, steps);
    body.classList.add("sad-on");

    var $ = function (s) { return el.querySelector(s); };
    var hEl = $(".sad-h"), pEl = $(".sad-p"), s1 = $(".s1"), s1v = $(".s1 .v"), s2 = $(".s2"), s2t = $(".s2 .tg"), lvBox = $(".sad-lv"), up = $(".sad-up"), cnt = $(".sad-cnt");
    var cta = $(".sad-cta"), ctaT = $(".sad-cta span"), have = $(".sad-links a:not(.m)"), who = $(".sad-who");
    var minBtn = $(".sad-min");
    try { if (localStorage.getItem("sad_min") === "1") setMin(true); } catch (e) {}

    function setMin(on) {
      el.classList.toggle("min", on);
      minBtn.setAttribute("aria-expanded", String(!on));
      minBtn.setAttribute("aria-label", on ? L.max : L.min);
      try { localStorage.setItem("sad_min", on ? "1" : "0"); } catch (e) {}
    }
    minBtn.addEventListener("click", function () { setMin(!el.classList.contains("min")); });

    /* the deposited amount, as the staking page prints it for the connected wallet */
    function deposited() {
      var d = document.getElementById("earnDep");
      if (!d || !d.isConnected) return null;
      var n = parseFloat((d.textContent || "").replace(/[^0-9.]/g, ""));
      return isFinite(n) ? n : null;
    }
    function fmt(n, dec) {
      var o = { maximumFractionDigits: dec == null ? 2 : dec };
      try { o.useGrouping = "always"; return new Intl.NumberFormat(L.loc, o).format(n); }
      catch (e) { delete o.useGrouping; return new Intl.NumberFormat(L.loc, o).format(n); }
    }
    /* el Hash Node de la wallet conectada, leido del registro en Sepolia (como el verificador del airdrop) */
    var addr = null, node = null, nodeT = 0;
    function pad(a) { return a.toLowerCase().replace(/^0x/, "").padStart(64, "0"); }
    function call(to, data) {
      var i = 0;
      function next() {
        if (i >= SEPOLIA.length) return Promise.reject(new Error("rpc"));
        var url = SEPOLIA[i++], ctl = new AbortController(), tm = setTimeout(function () { ctl.abort(); }, 7000);
        return fetch(url, { method: "POST", headers: { "content-type": "application/json" }, signal: ctl.signal,
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: to, data: data }, "latest"] }) })
          .then(function (r) { return r.json(); })
          .then(function (j) { clearTimeout(tm); if (!j || !j.result || j.error) throw new Error("rpc"); return j.result; })
          .catch(function () { clearTimeout(tm); return next(); });
      }
      return next();
    }
    function word(hex, n) { return BigInt("0x" + (hex.slice(2 + 64 * n, 2 + 64 * (n + 1)) || "0")); }
    function checkNode() {
      var a = addr; if (!a) return;
      if (node === null) { node = "checking"; paint(); }
      nodeT = Date.now();
      call(REGISTRY, SEL.indexPlusOne + pad(a)).then(function (h) {
        var n = word(h, 0);
        if (n === 0n) return "none";
        return call(REGISTRY, SEL.validators + pad((n - 1n).toString(16))).then(function (v) { return word(v, 6) === 1n ? "active" : "paused"; });
      }).catch(function () { return "unknown"; }).then(function (r) { if (a === addr) { node = r; paint(); } });
    }
    /* lo generado en vivo, con la misma regla que el verificador del airdrop (count.js) */
    var accBox = $(".sad-acc"), accN = $(".sad-acc em"), accBar = $(".sad-acc .bar i"), accTxt = $(".sad-acc small");
    var hist = null, histFor = "", histT = 0, histBusy = false;
    var nf4 = new Intl.NumberFormat(L.loc, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    function loadCount(cb) {
      if (window.SACount) return cb();
      if (window.SA_OPEN === undefined) window.SA_OPEN = TEST_OPEN;
      var sc = document.createElement("script"); sc.src = COUNT_JS; sc.onload = cb; document.head.appendChild(sc);
    }
    function readCount() {
      var a = addr; if (!a || histBusy) return;
      histBusy = true; histT = Date.now();
      loadCount(function () {
        var C = window.SACount;
        if (!C.OPEN || Date.now() < C.OPEN) { histBusy = false; hist = { pre: true }; histFor = a; return; }
        C.wallet(a).then(function (h) {
          var ev = C.evaluate(h.ev, h.node, C.OPEN, Date.now()), proj = ev.closed;
          ev.items.forEach(function (it) { proj += it.p; });
          if (a === addr) { hist = { items: ev.items, closed: ev.closed, proj: proj, first: ev.start }; histFor = a; }
        }).catch(function () {}).then(function () { histBusy = false; });
      });
    }
    function tickCount() {
      var show = !!addr && node === "active" && accBox.dataset.lv === "1";
      accBox.hidden = !show; if (!show) return;
      if (histFor !== addr || Date.now() - histT > 3e5) readCount();
      if (!hist || histFor !== addr) { accN.textContent = nf4.format(0); accTxt.textContent = L.calc; return; }
      if (hist.pre) { accN.textContent = nf4.format(0); accBar.style.width = "0%"; accTxt.textContent = L.pre; return; }
      var now = Date.now(), e = hist.closed;
      hist.items.forEach(function (it) { e += it.p * Math.min(1, Math.max(0, (now - it.s) / it.sp)); });
      accN.textContent = nf4.format(e);
      accBar.style.width = (hist.proj ? Math.min(100, e / hist.proj * 100) : 0) + "%";
      var lockAt = hist.first + 30 * 864e5;
      accTxt.textContent = tpl(L.of, { n: fmt(hist.proj, 0) }) + " · " + (hist.first && now < lockAt ?
        tpl(L.lock, { d: new Intl.DateTimeFormat(L.loc, { day: "numeric", month: "short" }).format(lockAt) }) : L.mine);
    }
    setInterval(tickCount, 200);

    function setAddr(a) {
      a = a && /^0x[0-9a-fA-F]{40}$/.test(a) ? a : null;
      if (a === addr) return;
      addr = a; node = null; paint();
      if (addr) checkNode();
    }
    window.addEventListener("sectora:account", function (e) { setAddr(e.detail); });

    function tpl(s, m) { return s.replace(/\{(\w)\}/g, function (_, k) { return m[k]; }); }

    var lastKey = "";
    function paint() {
      var dep = deposited(), key = dep + "|" + addr + "|" + node;
      if (key === lastKey) return;
      lastKey = key;
      var lv = -1;
      if (dep !== null) for (var i = 0; i < LV.length; i++) if (dep >= LV[i].min) lv = i;

      var on = node === "active", paused = node === "paused";
      if (dep === null) { hEl.innerHTML = L.h0; pEl.textContent = L.p0; }
      else if (lv < 0) { hEl.innerHTML = tpl(L.h1, { x: fmt(100 - dep) }); pEl.textContent = on ? L.p1n : L.p1; }
      else if (on) { hEl.innerHTML = L.h3; pEl.textContent = L.p3; }
      else { hEl.innerHTML = L.h2; pEl.textContent = paused ? L.poff : L.p2; }

      s1.classList.toggle("done", lv >= 0);
      s1.querySelector(".sad-ic").textContent = lv >= 0 ? "✓" : "";
      s1.classList.toggle("next", lv < 0);
      s1v.textContent = dep === null ? "—" : lv < 0 ? fmt(dep) + " / 100" : fmt(dep) + " SECT";
      s2.classList.toggle("done", on);
      s2.classList.toggle("off", paused);
      s2.classList.toggle("next", lv >= 0 && !on);
      s2.querySelector(".sad-ic").textContent = on ? "✓" : "";
      s2t.textContent = on ? L.on : paused ? L.off : node === "checking" ? L.chk : L.s2t;
      cnt.textContent = dep === null ? L.wait : lv >= 0 && on ? L.both : lv >= 0 ? L.done : fmt(dep) + " / 100";
      cta.href = on ? AIRDROP_URL : NODE_URL; ctaT.textContent = on ? (lv >= 0 ? L.ctaOn : L.more) : paused ? L.ctaOff : L.cta;
      have.parentNode.hidden = on;
      accBox.dataset.lv = lv >= 0 ? "1" : "0";
      $(".sad-how").hidden = on || dep === null;
      /* que wallet se comprobo y que dijo la red de nodos */
      who.hidden = !addr;
      if (addr) who.innerHTML = tpl(esc(L.who), { a: "<b>" + addr.slice(0, 6) + "…" + addr.slice(-4) + "</b>" }) + " · " +
        esc(on ? L.wOn : paused ? L.wOff : node === "none" ? L.wNone : node === "unknown" ? L.wErr : L.wChk);

      lvBox.hidden = lv < 0; up.hidden = lv < 0;
      if (lv >= 0) {
        var c = LV[lv], spots = Math.floor(dep / c.min * 10) / 10;
        $(".lv b").textContent = c.n; $(".lv small").textContent = tpl(L.lvs, { n: lv + 1 });
        $(".spt b").textContent = fmt(spots, 1); $(".spt small").textContent = tpl(L.sps, { l: c.n });
        $(".pz b").textContent = fmt(Math.floor(dep * c.rate * 100) / 100);
        if (lv < LV.length - 1) { var nx = LV[lv + 1];
          up.innerHTML = tpl(esc(L.up), { x: "<b>" + fmt(nx.min - dep) + "</b>", l: "<b>" + nx.n + "</b>", p: "<b>" + fmt(nx.min * nx.rate) + "</b>" }); }
        else up.textContent = L.top;
      }
    }
    paint();
    if (window.__sectoraAccount) setAddr(window.__sectoraAccount);
    /* si la pagina no avisa de la wallet (p. ej. una version guardada en cache), se le pregunta a la
       wallet del navegador que cuenta tiene abierta: solo lectura, sin ventanas ni firmas */
    var t0 = Date.now(), askT = 0;
    function askWallet() {
      askT = Date.now();
      var w = window.ethereum;
      if (w && w.request) w.request({ method: "eth_accounts" }).then(function (a) { if (!addr && a && a[0]) setAddr(a[0]); }).catch(function () {});
    }
    /* cada 1,5 s repinta lo que muestra la consola; el nodo se vuelve a mirar cada minuto (10 s si fallo la red) */
    setInterval(function () {
      paint();
      if (!addr && deposited() !== null && Date.now() - t0 > 2500 && Date.now() - askT > 1e4) askWallet();
      if (addr && Date.now() - nodeT > (node === "unknown" ? 1e4 : 6e4)) checkNode();
    }, 1500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
