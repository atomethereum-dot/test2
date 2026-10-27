/* ═══════════ Guia del Hash Node: boton flotante + panel con capturas ═══════════
   Seis pasos para registrar el nodo en la testnet, con capturas del propio dash
   (media/guia-nodo/, en espanol y en ingles). Marca como hechos los pasos que la
   cuenta conectada ya cumple. Se abre tambien con el enlace #guia-nodo. */
(function () {
  "use strict";
  var IMG = "/media/guia-nodo/";
  var tr = function (k, f) { var v = window.SECTORA_T && window.SECTORA_T(k); return v && v !== k ? v : f; };
  // nombre de un boton tal como se ve en el dash, sin flecha final
  var ui = function (k, f) { return tr(k, f).replace(/\s*↗\s*$/, ""); };
  var lang = function () {
    var l = (document.documentElement.lang || "en").slice(0, 2);
    try { l = localStorage.getItem("sectora_lang") || l; } catch (e) {}
    return T[l] ? l : "en";
  };

  var T = {
    es: { fab: "Guía del nodo", k: "Hash Node · paso a paso", h: "Activa tu nodo en 6 pasos",
      sub: "Unos 10 minutos. Todo es gratis: es la red de pruebas y no gastas dinero real.",
      note: "¿Participas en el Airdrop Genesis? Conecta la misma wallet donde tienes tus SECT en staking y no pauses el nodo: el tiempo en pausa no suma.",
      done: "Hecho", close: "Cerrar", zoom: "Toca una imagen para verla en grande",
      s: [
        ["Conecta tu wallet", "Pulsa «{connect}» arriba a la derecha y elige tu wallet: MetaMask, Trust Wallet, Coinbase Wallet, OKX, Bitget, Rainbow, TokenPocket u otra de Ethereum. En el móvil, abre el dash dentro de la app de tu wallet. El dash te cambia solo a la red de pruebas Sepolia.", "Conectar ahora"],
        ["Consigue gas gratis", "Cada paso necesita un poco de ETH de Sepolia, una moneda de prueba gratuita que paga la red. Pulsa «{gas}», pega la dirección de tu wallet y pide ETH. Con lo que te dan alcanza para todos los pasos.", "Abrir el grifo de Sepolia"],
        ["Reclama 5.000 tSECT", "En «{tn}», pulsa «{faucet}» y confirma en tu wallet. Es gratis y puedes repetirlo cada 24 horas.", "Ir al faucet"],
        ["Compra el Node Kit", "En «{market}», abre la pestaña «{phys}» (1) y elige el {kit} de 50 TH/s por 4.300 tSECT (2): con eso llegas al mínimo para validar. Pulsa «{buy}» (3). Tu wallet pide dos confirmaciones: primero aprobar el pago y después la compra.", "Ir al mercado"],
        ["Registra tu nodo", "En «{node}», escribe un nombre y la ubicación aproximada de tu ciudad (latitud y longitud: las encuentras en Google Maps al marcar un punto). Pulsa «{reg}» y confirma en tu wallet.", "Ir a mi nodo"],
        ["Listo: déjalo encendido", "El botón cambia a «{registered}» y tu nodo aparece en el mapa de la red. Mantenlo encendido: si lo pausas, deja de contar.", "Ver el mapa"]
      ],
      help: "¿Algo falla? Si dice que no tienes ETH de Sepolia, vuelve al paso 2. Si no te alcanzan los tSECT, al paso 3. Si tu wallet está en otra red, toca el aviso de arriba para cambiar a Sepolia. Si tu wallet no muestra Sepolia, activa las redes de prueba en sus ajustes." },
    en: { fab: "Node guide", k: "Hash Node · step by step", h: "Turn on your node in 6 steps",
      sub: "About 10 minutes. Everything is free: it's the test network and you don't spend real money.",
      note: "Joining Airdrop Genesis? Connect the same wallet that holds your staked SECT and don't pause the node: paused time doesn't count.",
      done: "Done", close: "Close", zoom: "Tap an image to see it larger",
      s: [
        ["Connect your wallet", "Press “{connect}” at the top right and choose your wallet: MetaMask, Trust Wallet, Coinbase Wallet, OKX, Bitget, Rainbow, TokenPocket or any other Ethereum wallet. On your phone, open the dash inside your wallet app. The dash moves you to the Sepolia test network on its own.", "Connect now"],
        ["Get free gas", "Every step needs a little Sepolia ETH, a free test coin that pays the network. Press “{gas}”, paste your wallet address and request ETH. What you get is enough for every step.", "Open the Sepolia faucet"],
        ["Claim 5,000 tSECT", "In “{tn}”, press “{faucet}” and confirm in your wallet. It's free and you can do it again every 24 hours.", "Go to the faucet"],
        ["Buy the Node Kit", "In “{market}”, open the “{phys}” tab (1) and pick the {kit}: 50 TH/s for 4,300 tSECT (2), enough to reach the validator minimum. Press “{buy}” (3). Your wallet asks twice: first to allow the payment, then to confirm the purchase.", "Go to the market"],
        ["Register your node", "In “{node}”, type a name and the rough location of your city (latitude and longitude: Google Maps shows them when you drop a pin). Press “{reg}” and confirm in your wallet.", "Go to my node"],
        ["Done: keep it on", "The button changes to “{registered}” and your node shows up on the network map. Keep it on: if you pause it, it stops counting.", "See the map"]
      ],
      help: "Something wrong? If it says you have no Sepolia ETH, go back to step 2. If you're short on tSECT, step 3. If your wallet is on another network, tap the notice at the top to switch to Sepolia. If your wallet doesn't show Sepolia, turn on test networks in its settings." },
    pt: { fab: "Guia do nó", k: "Hash Node · passo a passo", h: "Ative seu nó em 6 passos",
      sub: "Uns 10 minutos. Tudo é grátis: é a rede de testes e você não gasta dinheiro real.",
      note: "Participa do Airdrop Genesis? Conecte a mesma carteira onde estão seus SECT em staking e não pause o nó: o tempo em pausa não conta.",
      done: "Feito", close: "Fechar", zoom: "Toque em uma imagem para vê-la maior",
      s: [
        ["Conecte sua carteira", "Toque em “{connect}” no canto superior direito e escolha sua carteira: MetaMask, Trust Wallet, Coinbase Wallet, OKX, Bitget, Rainbow, TokenPocket ou outra de Ethereum. No celular, abra o dash dentro do app da sua carteira. O dash muda sozinho para a rede de testes Sepolia.", "Conectar agora"],
        ["Pegue gás grátis", "Cada passo precisa de um pouco de ETH da Sepolia, uma moeda de teste gratuita que paga a rede. Toque em “{gas}”, cole o endereço da sua carteira e peça ETH. O que você recebe dá para todos os passos.", "Abrir a torneira da Sepolia"],
        ["Resgate 5.000 tSECT", "Em “{tn}”, toque em “{faucet}” e confirme na carteira. É grátis e dá para repetir a cada 24 horas.", "Ir à torneira"],
        ["Compre o Node Kit", "Em “{market}”, abra a aba “{phys}” (1) e escolha o {kit} de 50 TH/s por 4.300 tSECT (2): com isso você chega ao mínimo para validar. Toque em “{buy}” (3). A carteira pede duas confirmações: primeiro aprovar o pagamento e depois a compra.", "Ir ao mercado"],
        ["Registre seu nó", "Em “{node}”, escreva um nome e a localização aproximada da sua cidade (latitude e longitude: o Google Maps mostra ao marcar um ponto). Toque em “{reg}” e confirme na carteira.", "Ir ao meu nó"],
        ["Pronto: deixe ligado", "O botão muda para “{registered}” e seu nó aparece no mapa da rede. Mantenha ligado: se pausar, ele para de contar.", "Ver o mapa"]
      ],
      help: "Algo deu errado? Se disser que você não tem ETH da Sepolia, volte ao passo 2. Se faltar tSECT, ao passo 3. Se a carteira estiver em outra rede, toque no aviso no topo para mudar para a Sepolia. Se a carteira não mostrar a Sepolia, ative as redes de teste nas configurações." }
  };
  // capturas de cada paso y adonde lleva su boton
  var STEPS = [
    { img: ["1-conectar", "1b-elegir"], go: "connect" },
    { img: ["2-gas"], href: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia" },
    { img: ["3-faucet"], go: "#rewards" },
    { img: ["4b-kit", "4c-comprar"], go: "#market" },
    { img: ["5-registrar"], go: "#node" },
    { img: ["6-listo"], go: "#network" }
  ];

  var css = [
    ".ng-fab{position:fixed;right:20px;bottom:20px;z-index:380;display:flex;align-items:center;gap:10px;padding:12px 16px 12px 13px;",
    "  background:rgba(10,13,19,.92);border:1px solid var(--rule);color:var(--ink);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);",
    "  font:500 11px/1 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;",
    "  box-shadow:0 10px 30px rgba(0,0,0,.45);transition:border-color .2s,transform .2s var(--ease)}",
    ".ng-fab:hover{border-color:var(--blue);transform:translateY(-2px)}",
    ".ng-fab i{position:relative;display:grid;place-items:center;width:26px;height:26px;background:var(--blue);color:#fff}",
    ".ng-fab i svg{width:15px;height:15px}",
    ".ng-fab.new i::after{content:'';position:absolute;inset:-5px;border:1px solid var(--blue);animation:ngp 1.8s ease-out infinite}",
    /* en la portada del panel, bajo el texto: ya no flota encima del contenido */
    ".ng-fab.in{position:relative;right:auto;bottom:auto;z-index:2;display:inline-flex;align-self:flex-start;justify-self:start;width:max-content;margin-top:26px;box-shadow:none}",
    "@keyframes ngp{from{opacity:.9;transform:scale(.8)}to{opacity:0;transform:scale(1.5)}}",
    ".ng{position:fixed;inset:0;z-index:410;display:none}",
    ".ng.on{display:block}",
    ".ng-bg{position:absolute;inset:0;background:rgba(2,4,8,.66);opacity:0;transition:opacity .25s}",
    ".ng.vis .ng-bg{opacity:1}",
    ".ng-p{position:absolute;top:0;right:0;bottom:0;width:min(580px,100%);display:flex;flex-direction:column;background:#080b11;",
    "  border-left:1px solid var(--rule);transform:translateX(30px);opacity:0;transition:transform .3s var(--ease),opacity .25s}",
    ".ng.vis .ng-p{transform:none;opacity:1}",
    ".ng-h{display:flex;align-items:flex-start;gap:16px;padding:22px 24px 18px;border-bottom:1px solid var(--hair)}",
    ".ng-h > div{flex:1;min-width:0}",
    ".ng-k{font:500 10px/1.4 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:var(--blue2)}",
    ".ng-h h2{margin-top:8px;font-size:26px}",
    ".ng-h .ng-sub{margin-top:8px;color:var(--ink2);font-size:14px;line-height:1.55}",
    ".ng-x{flex:none;padding:8px 10px;border:1px solid var(--rule);color:var(--ink3);font:500 10px/1 'IBM Plex Mono',monospace;letter-spacing:.14em;text-transform:uppercase}",
    ".ng-x:hover{color:var(--ink);border-color:var(--ink3)}",
    ".ng-b{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:20px 24px 32px}",
    ".ng-note{padding:14px 16px;border:1px solid rgba(21,105,255,.45);background:rgba(21,105,255,.09);color:var(--ink);font-size:14px;line-height:1.55}",
    ".ng-zoom{margin-top:14px;color:var(--ink4);font:500 10px/1.4 'IBM Plex Mono',monospace;letter-spacing:.14em;text-transform:uppercase}",
    ".ng-s{position:relative;margin-top:18px;padding:20px 18px 18px 64px;border:1px solid var(--hair);background:var(--surf)}",
    ".ng-n{position:absolute;left:18px;top:18px;display:grid;place-items:center;width:30px;height:30px;border:1px solid var(--blue);color:var(--blue2);",
    "  font:600 12px/1 'IBM Plex Mono',monospace}",
    ".ng-s.ok .ng-n{background:var(--live);border-color:var(--live);color:#04140c}",
    ".ng-s h3{font-size:18px;font-weight:400;display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
    ".ng-ok{display:none;padding:3px 7px;border:1px solid rgba(62,207,142,.5);color:var(--live);font:500 9px/1 'IBM Plex Mono',monospace;letter-spacing:.16em;text-transform:uppercase}",
    ".ng-s.ok .ng-ok{display:inline-block}",
    ".ng-s p{margin-top:8px;color:var(--ink2);font-size:14px;line-height:1.6}",
    ".ng-s figure{margin-top:14px;display:grid;gap:10px}",
    ".ng-s img{display:block;width:100%;height:auto;border:1px solid var(--hair);cursor:zoom-in;background:#05070b}",
    ".ng-go{margin-top:14px;display:inline-flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid var(--rule);",
    "  font:500 10px/1 'IBM Plex Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--ink)}",
    ".ng-go:hover{border-color:var(--blue);color:#fff}",
    ".ng-help{margin-top:22px;padding-top:16px;border-top:1px solid var(--hair);color:var(--ink3);font-size:13px;line-height:1.6}",
    ".ng-lb{position:fixed;inset:0;z-index:430;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(2,4,8,.92);cursor:zoom-out}",
    ".ng-lb.on{display:flex}",
    ".ng-lb img{max-width:100%;max-height:100%;border:1px solid var(--rule)}",
    "@media (max-width:640px){",
    "  .ng-fab{right:14px;bottom:14px;padding:11px 13px 11px 11px;font-size:10px}",
    "  .ng-fab.in{margin-top:20px}",
    "  .ng-h{padding:18px 16px 14px}.ng-h h2{font-size:22px}",
    "  .ng-b{padding:14px 16px 28px}.ng-s{padding:16px 14px 16px 54px}.ng-n{left:12px;top:16px}",
    "}",
    "@media (prefers-reduced-motion:reduce){.ng-fab.new i::after{animation:none}.ng-p,.ng-bg{transition:none}}"
  ].join("\n");

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="6" rx="1"/><rect x="4" y="14" width="16" height="6" rx="1"/><path d="M8 7h.01M8 17h.01"/></svg>';
  var fab, box, list, lb;

  function fill(s) {
    var v = {
      connect: ui("hashdash.top.connect", "Connect wallet"), gas: ui("hashdash.tn.gasLink", "Get Sepolia ETH"),
      tn: ui("hashdash.tn.title", "Faucet & rewards"), faucet: ui("hashdash.tn.faucetBtn", "Claim 5,000 tSECT"),
      market: ui("hashdash.market.title", "Hash market"), phys: ui("hashdash.market.tab.physical", "Physical node"),
      kit: ui("hashdash.pk.kit.n", "Node Kit"), buy: ui("hashdash.buy.buyN", "Buy {h} TH/s").replace("{h}", "50"),
      node: ui("hashdash.node.title", "Your node"), reg: ui("hashdash.node.register", "Register node"),
      registered: ui("hashdash.node.registered", "Registered")
    };
    return s.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? "<b>" + v[k] + "</b>" : m; });
  }

  function render() {
    var L = T[lang()], pre = lang() === "es" ? "es-" : "en-";
    fab.querySelector("span").textContent = L.fab;
    box.setAttribute("aria-label", L.h);
    box.querySelector(".ng-k").textContent = L.k;
    box.querySelector("h2").textContent = L.h;
    box.querySelector(".ng-sub").textContent = L.sub;
    box.querySelector(".ng-x").textContent = L.close;
    list.innerHTML = '<p class="ng-note">' + L.note + '</p><p class="ng-zoom">' + L.zoom + "</p>" +
      STEPS.map(function (st, i) {
        var s = L.s[i];
        var act = st.href ? '<a class="ng-go" href="' + st.href + '" target="_blank" rel="noopener noreferrer">' + s[2] + " ↗</a>"
          : '<button class="ng-go" type="button" data-go="' + st.go + '">' + s[2] + " →</button>";
        return '<section class="ng-s" data-i="' + i + '"><span class="ng-n">' + (i + 1) + "</span>" +
          "<h3>" + s[0] + '<span class="ng-ok">' + L.done + "</span></h3><p>" + fill(s[1]) + "</p>" +
          "<figure>" + st.img.map(function (f) { return '<img src="' + IMG + pre + f + '.jpg?v=3" alt="" loading="lazy" decoding="async">'; }).join("") + "</figure>" +
          act + "</section>";
      }).join("") + '<p class="ng-help">' + L.help + "</p>";
    marks();
  }

  // pasos ya cumplidos por la cuenta conectada
  function marks() {
    var cuenta = window.__sectoraCuenta && window.__sectoraCuenta();
    var est = window.__sectoraWallet && window.__sectoraWallet.estado ? window.__sectoraWallet.estado() : {};
    var hash = parseFloat((document.getElementById("pNow") || {}).textContent) || 0;
    var reg = document.getElementById("bReg");
    var registered = !!(reg && reg.disabled && cuenta && reg.textContent.trim() === ui("hashdash.node.registered", "Registered"));
    var done = [!!cuenta, false, false, !!cuenta && hash >= 50, registered, registered];
    done[2] = !!cuenta && ((est.saldo || 0) >= 1 || done[3]);
    done[1] = done[2];
    list.querySelectorAll(".ng-s").forEach(function (el, i) { el.classList.toggle("ok", done[i]); });
  }

  function open() {
    render();
    box.classList.add("on");
    requestAnimationFrame(function () { box.classList.add("vis"); });
    document.documentElement.style.overflow = "hidden";
    fab.classList.remove("new");
    try { localStorage.setItem("sectora:node-guide", "1"); } catch (e) {}
    box.querySelector(".ng-x").focus();
  }
  function close() {
    box.classList.remove("vis");
    document.documentElement.style.overflow = "";
    setTimeout(function () { box.classList.remove("on"); }, 220);
    fab.focus();
  }

  function mount() {
    if (document.getElementById("ngFab")) return;
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    fab = document.createElement("button");
    fab.type = "button"; fab.id = "ngFab"; fab.className = "ng-fab";
    fab.innerHTML = "<i>" + ICON + "</i><span></span>";
    try { if (!localStorage.getItem("sectora:node-guide")) fab.classList.add("new"); } catch (e) {}
    box = document.createElement("div");
    box.className = "ng"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    box.innerHTML = '<div class="ng-bg"></div><div class="ng-p"><div class="ng-h"><div><p class="ng-k"></p><h2></h2><p class="ng-sub"></p></div>' +
      '<button class="ng-x" type="button"></button></div><div class="ng-b"></div></div>';
    lb = document.createElement("div"); lb.className = "ng-lb"; lb.innerHTML = '<img alt="">';
    // va en la portada, justo bajo el texto principal; si no la encuentra, flota abajo a la derecha
    var sub = document.querySelector('#state [data-i18n="hashdash.hero.sub"]');
    if (sub) { fab.classList.add("in"); sub.parentNode.insertBefore(fab, sub.nextSibling); } else document.body.appendChild(fab);
    document.body.appendChild(box); document.body.appendChild(lb);
    list = box.querySelector(".ng-b");
    fab.querySelector("span").textContent = T[lang()].fab;

    fab.addEventListener("click", open);
    box.querySelector(".ng-x").addEventListener("click", close);
    box.querySelector(".ng-bg").addEventListener("click", close);
    list.addEventListener("click", function (e) {
      var img = e.target.closest("img");
      if (img) { lb.querySelector("img").src = img.src; lb.classList.add("on"); return; }
      var b = e.target.closest("[data-go]"); if (!b) return;
      var go = b.getAttribute("data-go");
      close();
      setTimeout(function () {
        if (go === "connect") { var c = document.getElementById("bConnect"); if (c && !(window.__sectoraCuenta && window.__sectoraCuenta())) c.click(); return; }
        var t = document.querySelector(go); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 240);
    });
    lb.addEventListener("click", function () { lb.classList.remove("on"); });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (lb.classList.contains("on")) lb.classList.remove("on");
      else if (box.classList.contains("on")) close();
    });
    document.addEventListener("sectora:langchange", function () {
      fab.querySelector("span").textContent = T[lang()].fab;
      if (box.classList.contains("on")) render();
    });
    if (/^#(guia-nodo|node-guide)$/.test(location.hash)) setTimeout(open, 600);
    window.addEventListener("hashchange", function () { if (/^#(guia-nodo|node-guide)$/.test(location.hash)) open(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
