/* Ventana "Tu airdrop": al conectar la wallet lee, sin firmas ni
   transacciones, los SECT de la wallet y los del staking (una sola llamada
   a accountView del contrato de staking en Ethereum) y el nodo de la testnet
   (ValidatorRegistry en Sepolia). Con eso muestra su premio: el % de su nivel sobre
   todo lo que tiene en staking, que solo se gana con el Hash Node encendido. Solo cuentan
   los SECT en staking; los de la wallet se muestran para invitar a stakearlos:
   - sin staking (menos de 100 SECT): sin premio en SECT, queda registrado para la fase 2;
   - Scout, desde 100 SECT = 55 %;
   - Sentinel, desde 500 SECT = 65 %;
   - Guardian, desde 1.000 SECT = 75 %;
   - Titan, desde 4.000 SECT = 90 %, sin maximo. Ej.: 2.000 SECT en staking = 1.500 SECT.
   Todos tienen el mismo tiempo para completar su premio, contado desde que entran. Las entregas en
   SectoraEVM empiezan en su lanzamiento: quien ya completo su
   tiempo cobra ese dia; quien entro despues, al completarlo.
   Ya abierto el airdrop, lo ganado sube en vivo como en el staking: premio x tiempo dentro / tiempo completo, por
   plaza, desde el inicio de cada plaza. Si sale, se pausa y sigue al volver. Minimo 30 dias dentro. Los inicios salen de progress.json, que escribe el
   programa diario: { "open": ms, "wallets": { "0x…": [inicio plaza 1, inicio plaza 2, …] } }.
   Sin ese archivo (antes de la apertura) se muestra el premio y "empieza a sumar el dia de la apertura".
   Si la wallet tiene staking y aun no tiene el nodo activo, sale el aviso
   "solo te falta conectar el nodo". */
(function () {
  "use strict";
  var STAKING = "0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0";
  var REGISTRY = "0x8dba83ffA1dF76B4136B39C9edfCD6Ca0B2e9BF1";
  var MAINNET = ["https://ethereum-rpc.publicnode.com", "https://eth.drpc.org", "https://1rpc.io/eth"];
  var SEPOLIA = ["https://ethereum-sepolia-rpc.publicnode.com", "https://sepolia.gateway.tenderly.co", "https://ethereum-sepolia.publicnode.com"];
  var SEL = { accountView: "0xf85b90e2", indexPlusOne: "0x7f0b8642", validators: "0x35aa2e44" };
  var DASH = "/dash/";
  var STAKE = "/staking/";
  var MM = "https://metamask.app.link/dapp/sectoraorg.com/airdrop/";
  var PROG = "/airdrop/progress.json";
  // END: fecha prevista (interna) del lanzamiento de SectoraEVM, no se muestra; DUR: el mismo tiempo para todos
  var MIN = 30, DAY = 864e5, END = Date.UTC(2027, 2, 25), DUR = 150 * DAY;

  var L = {
    en: { loc: "en-US", k: "Sectora // Airdrop Genesis", pv: "Preview", h: "Your airdrop",
      intro: "Connect your wallet to see how much you win in the airdrop.",
      connect: "Connect wallet", nowallet: "No wallet in this browser?", openmm: "Open in MetaMask",
      or: "Or check an address", check: "Check", reading: "Reading the network…",
      r1: "Wallet connected", r2: "{n} SECT in staking", r2s: "Only staked SECT count · in your wallet: {w}",
      win: "You win {n} SECT", wOn: "Keep your node on and your SECT in staking until you complete your time. Delivered on SectoraEVM.", wOff: "Once your Hash Node is on with this wallet.",
      lv0: "Phase 2 · registered", lv1: "Level 1 · Scout", lv2: "Level 2 · Sentinel", lv3: "Level 3 · Guardian", lv4: "Level 4 · Titan",
      up0: "With 100 SECT in staking you become Scout and win 55 SECT.", up1: "With 500 SECT in staking you become Sentinel and win 325 SECT.", up2: "With 1,000 SECT in staking you become Guardian and win 750 SECT.", up3: "With 4,000 SECT in staking you become Titan and win 3,600 SECT.", up4: "Every 1,000 SECT more in staking add 900 SECT, with no maximum.", p2: "Phase 2 benefits", p2s: "Testing the node for free registers you for phase 2. To win SECT now, stake 100 SECT and you become Scout.",
      stk: "Staker detected", stks: "You're already in: you don't have to do anything else. Just turn on your Hash Node with this same wallet and you start taking part.",
      todo: "Activate your Hash Node", hw: "How to turn on your Hash Node", hw1: "Get free Sepolia ETH for the gas", hw2: "Buy the 50 TH/s plan", hw3: "Register your node with this same wallet", hwp: "Open the plan", hwn: "Go to your node", todos: "Turn on your node on the testnet with this same wallet. No node, no prize.", nu: "We couldn't check your Hash Node", nus: "The test network didn't answer. Check again in a few seconds.",
      node: "Activate my Hash Node", done: "Hash Node active", dones: "This wallet's node is on. You can close the tab or turn off your computer: it stays on. Just don't deactivate it.",
      paused: "Hash Node paused", pauseds: "Your node is registered but paused. While it's paused your count doesn't add up: turn it back on and it continues where it left off.", stake: "Stake my SECT", reopen: "Open the dashboard",
      rule: "100 in staking → 55 SECT (Scout) · 500 → 325 (Sentinel) · 1,000 → 750 (Guardian) · 4,000 → 3,600 (Titan) · more, in proportion, no maximum",
      foot: "We only read public data: no signature, no transaction, nothing leaves your wallet. Your level is checked once a day.",
      err: "We couldn't read the network. Try again in a moment.", bad: "That address doesn't look right.",
      rej: "The wallet didn't share an address.", close: "Close", other: "Check another wallet",
      acc: "You've earned {n} SECT", of: "{n} SECT when you complete your time", day: "Delivered at the launch of SectoraEVM", day2: "You complete your time on {d} · delivered on SectoraEVM", day3: "Each part is delivered on SectoraEVM when it completes its time · the next one completes on {d}", lock: "What you earn is secured on {d}", full: "Full prize complete · delivered on SectoraEVM",
      pre: "Starts adding up on opening day. Everyone has the same time to complete the prize, counted from the day they join. Deliveries start at the launch of SectoraEVM.", wait: "Your count will show as soon as the network confirms your staking.",
      demo: "Sample view", demos: "{n} SECT in staking · node on · day {d} of the count",
      rf: "Invite and earn", rfs: "You earn {n} SECT for every 1,000 SECT your invitees keep in staking. It's delivered with your airdrop on SectoraEVM.", rfl: "Your invite link", rfc: "Copy", rfok: "Copied", rfsh: "Share", rfn: "Invitees: {n} · {s} SECT in staking", rfb: "Your bonus: {n} SECT when they complete their time", rf0: "No invitees yet. They confirm your invitation for free in the Dashboard.", rfin: "To collect your bonus you must also be in the airdrop: SECT in staking and your Hash Node on.", rfrev: "Every invitation is reviewed before delivery: self-invites and fake wallets don't count.", rfby: "Invited by {a}", rfbys: "recorded on the network", rfp: "{a} invited you", rfps: "Confirm it in the Dashboard. It's free and you keep your whole airdrop.", rfgo: "Confirm invitation", rfban: "{a} invited you to Airdrop Genesis", rfbanb: "See how to join" },
    es: { loc: "es-ES", k: "Sectora // Airdrop Genesis", pv: "Vista previa", h: "Tu airdrop",
      intro: "Conecta tu wallet para ver cuánto ganas en el airdrop.",
      connect: "Conectar wallet", nowallet: "¿No tienes wallet en este navegador?", openmm: "Abrir en MetaMask",
      or: "O revisa una dirección", check: "Revisar", reading: "Leyendo la red…",
      r1: "Wallet conectada", r2: "{n} SECT en staking", r2s: "Solo cuentan los SECT en staking · en tu wallet: {w}",
      win: "Ganas {n} SECT", wOn: "Mantén tu nodo encendido y tus SECT en staking hasta completar tu tiempo. Se entrega en SectoraEVM.", wOff: "Cuando tu Hash Node esté encendido con esta wallet.",
      lv0: "Fase 2 · registrado", lv1: "Nivel 1 · Scout", lv2: "Nivel 2 · Sentinel", lv3: "Nivel 3 · Guardian", lv4: "Nivel 4 · Titan",
      up0: "Con 100 SECT en staking pasas a Scout y ganas 55 SECT.", up1: "Con 500 SECT en staking pasas a Sentinel y ganas 325 SECT.", up2: "Con 1.000 SECT en staking pasas a Guardian y ganas 750 SECT.", up3: "Con 4.000 SECT en staking pasas a Titan y ganas 3.600 SECT.", up4: "Cada 1.000 SECT más en staking suman 900 SECT, sin máximo.", p2: "Beneficios de la fase 2", p2s: "Probar el nodo gratis te registra para la fase 2. Para ganar SECT ahora, pon 100 SECT en staking y pasas a Scout.",
      stk: "Staker detectado", stks: "Ya estás dentro: no tienes que hacer nada más. Solo enciende tu Hash Node con esta misma wallet y empiezas a participar.",
      todo: "Activa tu Hash Node", hw: "Cómo encender tu Hash Node", hw1: "Consigue ETH de Sepolia gratis para el gas", hw2: "Compra el plan de 50 TH/s", hw3: "Registra tu nodo con esta misma wallet", hwp: "Abrir el plan", hwn: "Ir a tu nodo", todos: "Enciende tu nodo en la testnet con esta misma wallet. Sin nodo no hay premio.", nu: "No pudimos comprobar tu Hash Node", nus: "La red de pruebas no respondió. Vuelve a comprobar en unos segundos.",
      node: "Activar mi Hash Node", done: "Hash Node activo", dones: "El nodo de esta wallet está encendido. Puedes cerrar la pestaña o apagar tu computadora: sigue encendido. Solo no lo desactives.",
      paused: "Hash Node pausado", pauseds: "Tu nodo está registrado pero pausado. Mientras está en pausa tu conteo no suma: enciéndelo y sigue donde quedó.", stake: "Hacer staking de mis SECT", reopen: "Abrir el panel",
      rule: "100 en staking → 55 SECT (Scout) · 500 → 325 (Sentinel) · 1.000 → 750 (Guardian) · 4.000 → 3.600 (Titan) · más, en proporción, sin máximo",
      foot: "Solo leemos datos públicos: no hay firmas ni transacciones y nada sale de tu wallet. Tu nivel se revisa una vez al día.",
      err: "No pudimos leer la red. Prueba de nuevo en un momento.", bad: "Esa dirección no es válida.",
      rej: "La wallet no compartió una dirección.", close: "Cerrar", other: "Revisar otra wallet",
      acc: "Llevas {n} SECT", of: "{n} SECT al completar tu tiempo", day: "Se entrega en el lanzamiento de SectoraEVM", day2: "Completas tu tiempo el {d} · se entrega en SectoraEVM", day3: "Cada parte se entrega en SectoraEVM al completar su tiempo · la próxima se completa el {d}", lock: "Lo ganado queda asegurado el {d}", full: "Premio completo · se entrega en SectoraEVM",
      pre: "Empieza a sumar el día de la apertura. Todos tienen el mismo tiempo para completar el premio, contado desde que entran. Las entregas empiezan en el lanzamiento de SectoraEVM.", wait: "Tu conteo aparecerá en cuanto la red confirme tu staking.",
      demo: "Vista de ejemplo", demos: "{n} SECT en staking · nodo encendido · día {d} del conteo",
      rf: "Invita y gana", rfs: "Ganas {n} SECT por cada 1.000 SECT que tus invitados mantengan en staking. Se entrega con tu airdrop en SectoraEVM.", rfl: "Tu link de invitación", rfc: "Copiar", rfok: "Copiado", rfsh: "Compartir", rfn: "Invitados: {n} · {s} SECT en staking", rfb: "Tu bono: {n} SECT cuando completen su tiempo", rf0: "Aún no tienes invitados. Ellos confirman tu invitación gratis en el Dashboard.", rfin: "Para cobrar tu bono tú también tienes que estar en el airdrop: SECT en staking y tu Hash Node encendido.", rfrev: "Cada invitación se revisa antes de la entrega: las autoinvitaciones y las wallets falsas no cuentan.", rfby: "Te invitó {a}", rfbys: "registrado en la red", rfp: "{a} te invitó", rfps: "Confírmalo en el Dashboard. Es gratis y conservas todo tu airdrop.", rfgo: "Confirmar invitación", rfban: "{a} te invitó al Airdrop Genesis", rfbanb: "Ver cómo participar" },
    pt: { loc: "pt-BR", k: "Sectora // Airdrop Genesis", pv: "Prévia", h: "Seu airdrop",
      intro: "Conecte sua carteira para ver quanto você ganha no airdrop.",
      connect: "Conectar carteira", nowallet: "Sem carteira neste navegador?", openmm: "Abrir no MetaMask",
      or: "Ou verifique um endereço", check: "Verificar", reading: "Lendo a rede…",
      r1: "Carteira conectada", r2: "{n} SECT em staking", r2s: "Só contam os SECT em staking · na sua carteira: {w}",
      win: "Você ganha {n} SECT", wOn: "Mantenha seu nó ligado e seus SECT em staking até completar seu tempo. Entregue na SectoraEVM.", wOff: "Quando o seu Hash Node estiver ligado com esta carteira.",
      lv0: "Fase 2 · registrado", lv1: "Nível 1 · Scout", lv2: "Nível 2 · Sentinel", lv3: "Nível 3 · Guardian", lv4: "Nível 4 · Titan",
      up0: "Com 100 SECT em staking você vira Scout e ganha 55 SECT.", up1: "Com 500 SECT em staking você vira Sentinel e ganha 325 SECT.", up2: "Com 1.000 SECT em staking você vira Guardian e ganha 750 SECT.", up3: "Com 4.000 SECT em staking você vira Titan e ganha 3.600 SECT.", up4: "Cada 1.000 SECT a mais em staking somam 900 SECT, sem máximo.", p2: "Benefícios da fase 2", p2s: "Testar o nó de graça registra você para a fase 2. Para ganhar SECT agora, coloque 100 SECT em staking e você vira Scout.",
      stk: "Staker detectado", stks: "Você já está dentro: não precisa fazer mais nada. Só ligue seu Hash Node com esta mesma carteira e você começa a participar.",
      todo: "Ative seu Hash Node", hw: "Como ligar seu Hash Node", hw1: "Pegue ETH da Sepolia grátis para o gás", hw2: "Compre o plano de 50 TH/s", hw3: "Registre seu nó com esta mesma carteira", hwp: "Abrir o plano", hwn: "Ir ao seu nó", todos: "Ligue seu nó na testnet com esta mesma carteira. Sem nó não há prêmio.", nu: "Não conseguimos verificar seu Hash Node", nus: "A rede de teste não respondeu. Verifique de novo em alguns segundos.",
      node: "Ativar meu Hash Node", done: "Hash Node ativo", dones: "O nó desta carteira está ligado. Você pode fechar a aba ou desligar o computador: ele continua ligado. Só não o desative.",
      paused: "Hash Node pausado", pauseds: "Seu nó está registrado, mas pausado. Enquanto está pausado sua contagem não soma: ligue de novo e ela continua de onde parou.", stake: "Fazer staking dos meus SECT", reopen: "Abrir o painel",
      rule: "100 em staking → 55 SECT (Scout) · 500 → 325 (Sentinel) · 1.000 → 750 (Guardian) · 4.000 → 3.600 (Titan) · mais, em proporção, sem máximo",
      foot: "Só lemos dados públicos: sem assinatura, sem transação, nada sai da sua carteira. Seu nível é verificado uma vez por dia.",
      err: "Não conseguimos ler a rede. Tente de novo em um instante.", bad: "Esse endereço não é válido.",
      rej: "A carteira não compartilhou um endereço.", close: "Fechar", other: "Verificar outra carteira",
      acc: "Você já tem {n} SECT", of: "{n} SECT ao completar seu tempo", day: "Entregue no lançamento da SectoraEVM", day2: "Você completa seu tempo em {d} · entregue na SectoraEVM", day3: "Cada parte é entregue na SectoraEVM ao completar seu tempo · a próxima se completa em {d}", lock: "O que você ganha fica garantido em {d}", full: "Prêmio completo · entregue na SectoraEVM",
      pre: "Começa a somar no dia da abertura. Todos têm o mesmo tempo para completar o prêmio, contado desde que entram. As entregas começam no lançamento da SectoraEVM.", wait: "Sua contagem vai aparecer assim que a rede confirmar seu staking.",
      demo: "Visualização de exemplo", demos: "{n} SECT em staking · nó ligado · dia {d} da contagem",
      rf: "Convide e ganhe", rfs: "Você ganha {n} SECT a cada 1.000 SECT que seus convidados mantiverem em staking. É entregue com seu airdrop na SectoraEVM.", rfl: "Seu link de convite", rfc: "Copiar", rfok: "Copiado", rfsh: "Compartilhar", rfn: "Convidados: {n} · {s} SECT em staking", rfb: "Seu bônus: {n} SECT quando completarem o tempo", rf0: "Você ainda não tem convidados. Eles confirmam seu convite de graça no Dashboard.", rfin: "Para receber seu bônus você também precisa estar no airdrop: SECT em staking e seu Hash Node ligado.", rfrev: "Cada convite é revisado antes da entrega: autoconvites e carteiras falsas não contam.", rfby: "Convidado por {a}", rfbys: "registrado na rede", rfp: "{a} convidou você", rfps: "Confirme no Dashboard. É grátis e você mantém todo o seu airdrop.", rfgo: "Confirmar convite", rfban: "{a} convidou você para o Airdrop Genesis", rfbanb: "Ver como participar" }
  };
  function lang() {
    var l = (document.documentElement.lang || "en").slice(0, 2), P = window.SA_LANG_PACK && window.SA_LANG_PACK[l];
    if (!L[l] && P && P.elig) L[l] = P.elig;   // los otros idiomas llegan con el paquete del idioma (i18n/<idioma>.js)
    return L[l] ? l : "en";
  }
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
    /* lo ganado en vivo: numero que sube, barra hasta completar su tiempo y fecha de cobro */
    ".el-rows b .el-big em[data-acc]{font-variant-numeric:tabular-nums}",
    ".el-rows .el-bar{display:block;height:8px;margin-top:10px;border-radius:99px;background:rgba(21,105,255,.12);overflow:hidden}",
    ".el-rows .el-bar i{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#1569ff,#4d8dff)}",
    ".el-rows .el-days{margin-top:8px;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:#0d4fd8}",
    "@media (prefers-reduced-motion:reduce){.el-ov,.el{transition:none}}",
    /* ajuste fino: ventana mas estrecha, textos mas contenidos, checks verdes centrados con el titulo */
    ".el{width:min(500px,100%)}",
    ".el .mono{font-size:10px;letter-spacing:.12em}",
    ".el-hd .el-k,.el-hd .el-pv{white-space:nowrap}",
    ".el h3{font-size:24px;letter-spacing:-.015em}",
    ".el-in{font-size:14.5px}",
    ".el-rows{margin-top:10px}",
    ".el-rows li{grid-template-columns:24px minmax(0,1fr);column-gap:14px;align-items:start;padding:13px 0}",
    ".el-rows .el-ic{display:grid;place-items:center;width:24px;height:24px;margin:0;border-radius:50%;background:#16a34a;box-shadow:0 0 0 4px rgba(22,163,74,.12)}",
    ".el-rows .el-ic svg{width:13px;height:13px}",
    ".el-rows .el-ic.p{background:#fff7e8;border:1.5px dashed #e0a030;box-shadow:none}",
    ".el-rows b{font-size:15.5px;line-height:24px;letter-spacing:-.005em}",
    ".el-rows span{margin-top:1px;font-size:13.5px;line-height:1.5}",
    ".el-rows b .el-big{font-size:28px;line-height:24px;padding:2px 0 4px;letter-spacing:-.025em}",
    ".el-rows .chip{margin-top:8px;padding:4px 9px;font-size:9.5px;letter-spacing:.12em}",
    ".el-b{margin-top:14px;padding:14px 16px}",
    ".el-st{padding:13px 15px;gap:2px 12px}.el-st i{width:30px;height:30px}.el-st b{font-size:15px}.el-st span{font-size:13.5px}",
    ".el .el-rule{margin-top:14px;padding:10px 12px;border-radius:10px;background:#f6f7f9;font-family:'IBM Plex Sans',system-ui,sans-serif;font-size:12.5px;font-weight:400;letter-spacing:0;text-transform:none;line-height:1.6;color:#3c414c}",
    ".el-ft{font-size:12px}",
    ".el-how{margin-top:12px;padding:12px 14px;border-radius:12px;background:#f6f7f9;border:1px solid rgba(7,8,10,.06)}",
    ".el-how p{color:#0d4fd8}",
    ".el-how ol{list-style:none;margin-top:8px}",
    ".el-how li{display:grid;grid-template-columns:22px minmax(0,1fr);column-gap:10px;padding:7px 0;font-size:13.5px;line-height:22px;color:#07080a;font-weight:400}",
    ".el-how li + li{border-top:1px solid rgba(7,8,10,.06)}",
    ".el-how li > span{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#fff;border:1px solid rgba(21,105,255,.4);color:#0d4fd8;font-family:'IBM Plex Mono',monospace;font-size:11px}",
    ".el-how em{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;font-style:normal}",
    ".el-how a{padding:3px 9px;border-radius:999px;border:1px solid rgba(21,105,255,.35);background:#fff;color:#0d4fd8;text-decoration:none;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;line-height:18px}",
    ".el-how a:hover{background:rgba(21,105,255,.08)}",
    "@media (max-width:520px){.el-pv{display:none}.el h3{font-size:22px}.el-bd{padding:16px 18px 18px}.el-rows li{padding:11px 0}.el-rows b .el-big{font-size:25px}}",
    "@media (max-height:720px){.el-rows li{padding:9px 0}.el-rows b .el-big{font-size:23px}}",
    /* referidos: tu link de invitacion, tus invitados y quien te invito */
    ".el-rf{margin-top:14px;padding:14px;border-radius:12px;border:1px solid rgba(21,105,255,.25);background:linear-gradient(180deg,rgba(21,105,255,.07),rgba(21,105,255,.02))}",
    ".el-rf > p{color:#0d4fd8}",
    ".el-rf-s,.el-rf-l,.el-rf-n,.el-rf-w,.el-rf-r{display:block}",
    ".el-rf-s{margin-top:6px;font-size:13.5px;line-height:1.5;color:#3c414c}",
    ".el-rf-l{margin-top:12px;font:500 10px/1.3 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#6b7280}",
    ".el-rf-c{display:flex;gap:6px;margin-top:6px}",
    ".el-rf-c code{flex:1;min-width:0;padding:10px 12px;border-radius:9px;background:#fff;border:1px solid rgba(7,8,10,.12);font:400 12.5px/1.3 'IBM Plex Mono',monospace;color:#07080a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".el-rf-c button{flex:none;padding:0 12px;border-radius:9px;border:1px solid #1569ff;background:#1569ff;color:#fff;cursor:pointer;font-size:10px;letter-spacing:.1em}",
    ".el-rf-c button[data-s]{background:#fff;color:#0d4fd8}",
    ".el-rf-n{margin-top:10px;font-size:13.5px;line-height:1.5;color:#07080a}",
    ".el-rf-n b{font-weight:500;color:#1569ff}",
    ".el-rf-w{margin-top:8px;font-size:12.5px;line-height:1.5;color:#b26b00}",
    ".el-rf-r{margin-top:8px;font-size:12px;line-height:1.5;color:#6b7280}",
    ".el-rf-me{display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(7,8,10,.08);font-size:13.5px;color:#07080a}",
    ".el-rf-me i{flex:none;display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#16a34a}.el-rf-me i svg{width:11px;height:11px}",
    ".el-rf-me small{color:#6b7280;font-size:12px}",
    ".el-rf-p{margin-bottom:12px;padding:12px;border-radius:10px;background:#fff8ec;border:1px solid rgba(224,160,48,.45)}",
    ".el-rf-p b{display:block;font-size:14.5px;font-weight:500;color:#07080a}.el-rf-p span{display:block;margin-top:3px;font-size:13px;line-height:1.5;color:#3c414c}",
    ".el-rf-p a{display:inline-flex;margin-top:9px;padding:9px 13px;border-radius:9px;background:#07080a;color:#fff;text-decoration:none;font:500 10px/1.2 'IBM Plex Mono',monospace;letter-spacing:.1em;text-transform:uppercase}",
    /* aviso al llegar con un link de invitacion */
    ".el-ban{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:150;display:flex;align-items:center;gap:10px;width:max-content;max-width:calc(100% - 24px);padding:9px 9px 9px 16px;border-radius:999px;background:#07080a;color:#fff;box-shadow:0 18px 40px -12px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.08);font:400 13.5px/1.35 'IBM Plex Sans',system-ui,sans-serif}",
    ".el-ban span{min-width:0}",
    ".el-ban button[data-go]{flex:none;padding:9px 13px;border:0;border-radius:999px;background:#1569ff;color:#fff;cursor:pointer;font:500 10px/1.2 'IBM Plex Mono',monospace;letter-spacing:.1em;text-transform:uppercase}",
    ".el-ban-x{flex:none;width:28px;height:28px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;font-size:16px;line-height:1}",
    "@media (max-width:520px){.el-ban{left:12px;right:12px;width:auto;transform:none;max-width:none;border-radius:16px}}"
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
  /* vista de ejemplo (solo para capturas y la guia): ?demo=<SECT en staking>&d=<dias dentro>. No lee la red:
     muestra como ve la ventana un participante con el nodo encendido, con su premio y el contador subiendo */
  var DEMO = +((location.search.match(/[?&]demo=(\d+)/) || [])[1] || 0), DEMO_D = +((location.search.match(/[?&]d=(\d+)/) || [])[1] || 12);
  var DEMO_A = "0x0000000000000000000000000000000000de0000";
  function demo() {
    var s = Date.now() - DEMO_D * DAY, w = {}; w[DEMO_A] = [s];
    return { staked: BigInt(DEMO), wallet: 0n, node: "active", prog: { open: s, wallets: w }, hist: null, demo: true };
  }

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
    if (DEMO && addr === DEMO_A) return Promise.resolve(demo());
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
  var RATE = { 0: 0, 1: 0.55, 2: 0.65, 3: 0.75, 4: 0.9 };
  function fmt(n) { return new Intl.NumberFormat(L[lang()].loc, { maximumFractionDigits: 0, useGrouping: "always" }).format(Number(n)); }
  function short(a) { return a.slice(0, 6) + "…" + a.slice(-4); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- pantallas ---------- */
  function head() { ov.querySelector(".el-k").textContent = t("k"); ov.querySelector(".el-pv").textContent = DEMO ? t("pv") : ""; ov.querySelector(".el-x").setAttribute("aria-label", t("close")); }
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
      // el % de su nivel sobre todo lo que tiene en staking, sin maximo
      var prize = Number(total) * RATE[lv];
      // antes de la apertura se muestra el premio; despues, lo ganado sube en vivo
      var P = r.prog, C = window.SACount, now = Date.now(), items = null, closed = 0, state;
      var listed = P && P.open && now >= P.open && P.wallets && P.wallets[addr.toLowerCase()];
      if (lv === 0) state = "p2";
      else if (!on) state = "off";
      else if (listed && listed.length) {
        // lista publicada: el inicio de su conteo
        state = "run"; items = [{ s: listed[0], p: prize, sp: DUR }];
      } else if (r.hist && C) {
        // sin lista: se rehace la historia de esta wallet con la blockchain
        var ev = C.evaluate(r.hist.ev, r.hist.node, C.OPEN, now);
        if (ev.items.length) { state = "run"; items = ev.items; closed = ev.closed; } else state = "wait";
      } else state = (C && C.OPEN && now >= C.OPEN) || (P && P.open && now >= P.open) ? "wait" : "pre";
      var rows = [];
      if (r.demo) rows.push(li("ok", "", t("demo"), t("demos", { n: fmt(total), d: DEMO_D + 1 })));
      else rows.push(li("ok", "", connected ? t("r1") : short(addr), connected ? short(addr) : ""));
      // su premio (el % de su nivel sobre su staking); solo cuenta con el nodo encendido
      var winT, winS;
      if (state === "run") {
        winT = '<span class="el-big">' + t("acc", { n: "<em data-acc>0</em>" }) + "</span>";
        var proj = closed; items.forEach(function (it) { proj += it.p; });
        winS = t("of", { n: fmt(Math.round(proj)) }) + '<span class="el-bar"><i data-bar></i></span><span class="el-days" data-days></span>';
      } else if (state === "p2") {
        winT = '<span class="el-big">' + t("p2") + "</span>";
        winS = on ? t("p2s") : t("wOff");
      } else {
        winT = '<span class="el-big">' + t("win", { n: "<em>" + fmt(prize) + "</em>" }) + "</span>";
        winS = state === "off" ? t("wOff") : state === "pre" ? t("pre") : t("wait");
      }
      rows.push(li(on ? "ok" : "wait", on ? "" : "p", winT, winS, t("lv" + lv)));
      if (on) rows.push(li("ok", "", t("done"), t("dones")));
      else if (r.node === "paused") rows.push(li("warn", "p", t("paused"), t("pauseds")));
      else if (r.node === "unknown") rows.push(li("warn", "p", t("nu"), t("nus")));
      else rows.push(li("wait", "p", t("todo"), t("todos")));
      rows.push(li("ok", "", t("r2", { n: fmt(total) }), t("r2s", { w: fmt(r.wallet) }) + "<br>" + t("up" + lv)));
      // con staking y sin nodo encendido: el aviso de que solo falta el nodo
      var stk = r.staked > 0n && !on ? '<p class="el-st"><i>' + ICON.bolt + "</i><b>" + t("stk") + "</b><span>" + t("stks") + "</span></p>" : "";
      var btn = (on ? "" :
        '<a class="el-b go mono" href="' + DASH + '"><span>' + (r.node === "paused" ? t("reopen") : t("node")) + '</span><span>↗</span></a>') +
        '<a class="el-b mono" href="' + STAKE + '"><span>' + t("stake") + '</span><span>↗</span></a>';
      /* sin nodo: los pasos para encenderlo, con el gas de Sepolia primero */
      var how = on || r.node === "unknown" ? "" : '<div class="el-how"><p class="mono">' + t("hw") + "</p><ol>" +
        '<li><span>1</span><div>' + t("hw1") + '<em><a href="https://faucet.quicknode.com/ethereum/sepolia" target="_blank" rel="noopener noreferrer">QuickNode ↗</a><a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank" rel="noopener noreferrer">Google ↗</a></em></div></li>' +
        '<li><span>2</span><div>' + t("hw2") + '<em><a href="/dashboard.html#plan">' + t("hwp") + " ↗</a></em></div></li>" +
        '<li><span>3</span><div>' + t("hw3") + '<em><a href="/dashboard.html#node">' + t("hwn") + " ↗</a></em></div></li></ol></div>";
      bd.innerHTML = '<h3>' + t("h") + '</h3>' + stk + '<ul class="el-rows">' + rows.join("") + "</ul>" + how + btn +
        (r.demo ? "" : '<div class="el-rf" data-rf></div>') +
        '<p class="mono el-rule">' + t("rule") + '</p><p class="el-ft">' + t("foot") + '</p>' +
        '<button class="el-lnk" type="button" data-a="other">' + t("other") + "</button>";
      bd.querySelector('[data-a="other"]').addEventListener("click", function () { start(); });
      if (state === "run") live(items, closed, proj);
      if (!r.demo) refFill(addr, lv > 0 && on);
    }).catch(function () { if (cur === addr) start(t("err")); });
  }
  /* lo ganado sube como en el staking: premio de la plaza x tiempo dentro / tiempo completo, desde el inicio de cada plaza */
  var timer = 0;
  function stop() { if (timer) { clearInterval(timer); timer = 0; } }
  function live(items, closed, proj) {
    var acc = bd.querySelector("[data-acc]"), bar = bd.querySelector("[data-bar]"), days = bd.querySelector("[data-days]");
    var nf = new Intl.NumberFormat(L[lang()].loc, { minimumFractionDigits: 4, maximumFractionDigits: 4, useGrouping: "always" });
    // cada parte se paga por separado al completar su tiempo, desde el lanzamiento de SectoraEVM.
    // END es la fecha prevista (interna) del lanzamiento: nunca se muestra; solo se muestran fechas posteriores
    var first = Math.min.apply(null, items.map(function (it) { return it.s; }));
    var fin = items.map(function (it) { return it.s + it.sp; }), done = Math.max.apply(null, fin);
    var late = fin.filter(function (x) { return x > END; });
    var many = late.length && (late.length < fin.length || late.some(function (x) { return x !== late[0]; }));
    var df = new Intl.DateTimeFormat(L[lang()].loc, { day: "numeric", month: "short", year: "numeric" });
    function tick() {
      var now = Date.now(), earned = closed;
      items.forEach(function (it) { earned += it.p * Math.min(1, Math.max(0, (now - it.s) / it.sp)); });
      acc.textContent = nf.format(earned);
      bar.style.width = (proj ? Math.min(100, earned / proj * 100) : 0) + "%";
      // minimo de 30 dias: antes de eso, lo ganado aun no esta asegurado
      var next = Math.min.apply(null, late.filter(function (x) { return x > now; }).concat(done));
      days.textContent = now >= done ? t("full") : now - first < MIN * DAY ? t("lock", { d: df.format(first + MIN * DAY) }) :
        done <= END ? t("day") : many ? t("day3", { d: df.format(next) }) : t("day2", { d: df.format(done) });
    }
    stop(); tick(); timer = setInterval(tick, 100);
  }
  var ICON = {
    ok: '<svg viewBox="0 0 16 16"><path d="M4 8.4l2.8 2.7 5.4-5.9" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    wait: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.6" fill="#e0a030"/></svg>',
    warn: '<svg viewBox="0 0 16 16"><path d="M8 3.5v6" stroke="#b26b00" stroke-width="2.2"/><circle cx="8" cy="12.4" r="1.3" fill="#b26b00"/></svg>',
    bolt: '<svg viewBox="0 0 16 16"><path d="M9.2 1.5L3.6 9h3.9l-.9 5.5L12.4 7H8.4z" fill="#fff"/></svg>'
  };
  function li(ic, cls, title, sub, chip) {
    return '<li><span class="el-ic ' + cls + '">' + ICON[ic] + "</span><div><b>" + title + "</b>" + (sub ? "<span>" + sub + "</span>" : "") +
      (chip ? '<span class="chip mono">' + chip + "</span>" : "") + "</div></li>";
  }

  /* ---------- referidos ----------
     Cada wallet tiene su link (/airdrop/?ref=0x…). Quien llega con el queda guardado en este navegador y confirma la
     invitacion en el Dashboard (0,0001 tSECT de prueba a su padrino, en Sepolia). Aqui solo se lee: tu link, tus
     invitados con su staking y quien te invito. Las reglas y el control de trampas estan en count.js y en el panel. */
  var REF_KEY = "sectora:ref";
  function refGet() { try { return (localStorage.getItem(REF_KEY) || "").toLowerCase(); } catch (e) { return ""; } }
  var OK = '<i><svg viewBox="0 0 16 16"><path d="M4 8.4l2.8 2.7 5.4-5.9" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></i>';
  function refFill(addr, inside) {
    var box = bd.querySelector("[data-rf]"), C = window.SACount;
    if (!box || !C || !C.refInvitees) { if (box) box.remove(); return; }
    var me = addr.toLowerCase(), link = location.origin + "/referidos-bbsl4u2mr3/airdrop/?ref=" + me;
    box.innerHTML = '<div data-rfme></div><p class="mono">' + t("rf") + '</p><span class="el-rf-s">' + t("rfs", { n: fmt(C.REF.BONUS * 1000) }) + "</span>" +
      '<span class="el-rf-l">' + t("rfl") + '</span><div class="el-rf-c"><code>' + esc(link.replace(/^https?:\/\//, "")) + "</code>" +
      '<button type="button" class="mono" data-c>' + t("rfc") + "</button>" + (navigator.share ? '<button type="button" class="mono" data-s>' + t("rfsh") + "</button>" : "") + "</div>" +
      '<span class="el-rf-n" data-n><span class="el-sp"></span></span>' + (inside ? "" : '<span class="el-rf-w">' + t("rfin") + "</span>") +
      '<span class="el-rf-r">' + t("rfrev") + "</span>";
    var cb = box.querySelector("[data-c]");
    cb.addEventListener("click", function () {
      (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(function () {
        cb.textContent = t("rfok"); setTimeout(function () { cb.textContent = t("rfc"); }, 1600);
      }, function () { window.prompt(t("rfl"), link); });
    });
    var sb = box.querySelector("[data-s]");
    if (sb) sb.addEventListener("click", function () { navigator.share({ title: "Sectora Airdrop Genesis", url: link }).catch(function () {}); });
    // tus invitados: su staking y su nodo; el bono es el 12 % del staking de los que estan dentro, al completar su tiempo
    C.refInvitees(me).then(function (all) {
      all = all.filter(function (x) { return !x.bad; });
      return C.refLate(all).then(function (late) { return all.filter(function (x) { return !late[x.invitee]; }); });
    }).then(function (list) {
      if (cur !== addr) return;
      var n = box.querySelector("[data-n]");
      if (!list.length) { n.textContent = t("rf0"); return; }
      return Promise.all(list.slice(0, 60).map(function (x) {
        var a = call(MAINNET, STAKING, SEL.accountView + pad(x.invitee)).then(function (h) { return word(h, 0) / WEI; }).catch(function () { return 0n; });
        var b = call(SEPOLIA, REGISTRY, SEL.indexPlusOne + pad(x.invitee)).then(function (h) {
          var k = word(h, 0); if (k === 0n) return false;
          return call(SEPOLIA, REGISTRY, SEL.validators + pad((k - 1n).toString(16))).then(function (v) { return word(v, 6) === 1n; });
        }).catch(function () { return false; });
        return Promise.all([a, b]);
      })).then(function (res) {
        if (cur !== addr) return;
        var tot = 0n, ok = 0n;
        res.forEach(function (x) { tot += x[0]; if (x[1] && x[0] >= 100n) ok += x[0]; });
        n.innerHTML = t("rfn", { n: fmt(list.length), s: fmt(tot) }) + (ok > 0n ? "<br><b>" + t("rfb", { n: fmt(Number(ok) * C.REF.BONUS) }) + "</b>" : "");
      });
    }).catch(function () { var n = box.querySelector("[data-n]"); if (n) n.textContent = ""; });
    // quien te invito: registrado en la red, o pendiente de confirmar en el Dashboard
    C.refOf(me).then(function (x) {
      if (cur !== addr) return;
      var top = box.querySelector("[data-rfme]"), pend = refGet();
      if (x) top.innerHTML = '<div class="el-rf-me">' + OK + "<span>" + t("rfby", { a: short(x.referrer) }) + " <small>· " + t("rfbys") + "</small></span></div>";
      else if (/^0x[0-9a-f]{40}$/.test(pend) && pend !== me)
        top.innerHTML = '<div class="el-rf-p"><b>' + t("rfp", { a: short(pend) }) + "</b><span>" + t("rfps") + '</span><a href="/referidos-bbsl4u2mr3/dashboard.html?ref=' + pend + '#tnRef">' + t("rfgo") + " ↗</a></div>";
    }).catch(function () {});
  }
  // aviso al llegar con un link de invitacion
  function refBanner(a) {
    var b = document.createElement("div"); b.className = "el-ban"; b.setAttribute("role", "status");
    b.innerHTML = '<span></span><button type="button" data-go></button><button type="button" class="el-ban-x" aria-label="×">×</button>';
    function txt() { b.querySelector("span").textContent = t("rfban", { a: short(a) }); b.querySelector("[data-go]").textContent = t("rfbanb"); }
    txt(); document.addEventListener("sa:lang", txt);
    b.querySelector("[data-go]").addEventListener("click", function () { b.remove(); open(); });
    b.querySelector(".el-ban-x").addEventListener("click", function () { b.remove(); });
    document.body.appendChild(b);
  }
  (function () {
    var m = /[?&]ref=(0x[0-9a-fA-F]{40})(?![0-9a-fA-F])/.exec(location.search);
    if (m) { try { localStorage.setItem(REF_KEY, m[1].toLowerCase()); } catch (e) {} refBanner(m[1].toLowerCase()); }
  })();

  function open() { ov.classList.add("on"); document.documentElement.style.overflow = "hidden"; if (cur) show(cur, curConn); else start(); }
  function close() { stop(); ov.classList.remove("on"); document.documentElement.style.overflow = ""; }
  if (window.ethereum && window.ethereum.on) window.ethereum.on("accountsChanged", function (a) { if (ov.classList.contains("on") && a && a[0]) show(a[0], true); });

  document.addEventListener("sa:lang", function () { if (ov.classList.contains("on")) { if (cur) show(cur, curConn); else start(); } });
  window.SAElig = { open: open, close: close };
  if (location.hash === "#my" && !DEMO) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", open); else open(); }
  if (DEMO) { cur = DEMO_A; if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", open); else open(); }
})();
