/* Mi Airdrop: conectar la wallet desde cualquier navegador, tambien Chrome o Safari del movil.

   Mismo enfoque que el selector de /staking (staking-wallet.js), adaptado a una pagina que solo lee:
   aqui solo hace falta la direccion, nunca se firma ni se envia nada.
   - Con una wallet inyectada (extension del PC o navegador de la app en el movil): directa.
   - En Chrome o Safari del movil: lista de apps. MetaMask, Trust y Rainbow (y cualquier otra por
     WalletConnect) se abren para aprobar y se vuelve a esta pestana ya conectada; Binance, Coinbase y
     OKX abren esta pagina en su navegador, donde la wallet ya esta inyectada.
   - En el PC sin extension: un QR para conectar la wallet del telefono.
   WalletConnect (../walletconnect-provider.min.js) solo se descarga al abrir el selector o para
   restaurar una sesion abierta aqui. Las sesiones de esta pagina se guardan aparte (prefijo propio),
   asi que conectar o desconectar aqui no toca la sesion de /staking. */
(function () {
  "use strict";
  var WC_PROJECT_ID = "a491fc0784a2751d886adfc7a687c8cb";   // el mismo del panel y del staking
  var WC_JS = "/walletconnect-provider.min.js?v=20260809a";
  var QR_JS = "/qrcode-generator.min.js?v=20260809a";
  var LOGOS_JS = "/dashboard-wallet-logos.js";
  var PREFIJO = "sect-myairdrop";                             // almacen propio de WalletConnect
  var MARCA = "ma-wc";                                        // hay (o hubo) una sesion de WalletConnect aqui
  var ua = navigator.userAgent || "";
  var MOVIL = /Android|iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var AQUI = location.origin + location.pathname;
  var enc = encodeURIComponent;

  var T = {
    en: { pickM: "Choose your wallet app", pickD: "Connect a wallet", close: "Close", det: "Detected in this browser", ext: "Browser extension",
      wc: "Approve in the app", brw: "Opens this page in the app", other: "Other wallets", otherS: "Any WalletConnect wallet",
      phone: "Wallet on your phone", phoneS: "Scan a QR code with your phone", prep: "Preparing a secure connection…",
      tapM: "Tap your wallet app. Approve the connection there, then come back to this tab.", tapD: "Scan the code with your phone to connect.",
      appr: "Approve the connection in {a}, then come back to this tab.", apprO: "Approve the connection in your wallet, then come back to this tab.",
      qr: "Scan with your phone’s wallet app (MetaMask, Trust, Binance, Coinbase…) and approve there.", copy: "Copy connection link", copied: "Copied",
      fail: "WalletConnect did not load. Check your connection and try again.", rej: "The connection was rejected in the wallet.", exp: "The link expired.",
      retry: "Try again", noqr: "Could not draw the QR code. Use Copy connection link.", own: "Prefer your wallet’s own browser? Open this page in ",
      or: " or ", only: "Only your address is read: no signature, no transaction." },
    es: { pickM: "Elige tu app de wallet", pickD: "Conectar una wallet", close: "Cerrar", det: "Detectada en este navegador", ext: "Extensión del navegador",
      wc: "Aprueba en la app", brw: "Abre esta página en la app", other: "Otras wallets", otherS: "Cualquier wallet con WalletConnect",
      phone: "Wallet en tu teléfono", phoneS: "Escanea un código QR con tu teléfono", prep: "Preparando una conexión segura…",
      tapM: "Toca tu app de wallet. Aprueba la conexión ahí y vuelve a esta pestaña.", tapD: "Escanea el código con tu teléfono para conectar.",
      appr: "Aprueba la conexión en {a} y vuelve a esta pestaña.", apprO: "Aprueba la conexión en tu wallet y vuelve a esta pestaña.",
      qr: "Escanéalo con la app de wallet de tu teléfono (MetaMask, Trust, Binance, Coinbase…) y aprueba ahí.", copy: "Copiar enlace de conexión", copied: "Copiado",
      fail: "WalletConnect no cargó. Revisa tu conexión y prueba de nuevo.", rej: "La conexión se rechazó en la wallet.", exp: "El enlace caducó.",
      retry: "Probar de nuevo", noqr: "No se pudo dibujar el QR. Usa Copiar enlace de conexión.", own: "¿Prefieres el navegador de tu wallet? Abre esta página en ",
      or: " o ", only: "Solo se lee tu dirección: sin firmas ni transacciones." },
    pt: { pickM: "Escolha seu app de carteira", pickD: "Conectar uma carteira", close: "Fechar", det: "Detectada neste navegador", ext: "Extensão do navegador",
      wc: "Aprove no app", brw: "Abre esta página no app", other: "Outras carteiras", otherS: "Qualquer carteira com WalletConnect",
      phone: "Carteira no seu celular", phoneS: "Escaneie um QR code com seu celular", prep: "Preparando uma conexão segura…",
      tapM: "Toque no seu app de carteira. Aprove a conexão lá e volte para esta aba.", tapD: "Escaneie o código com seu celular para conectar.",
      appr: "Aprove a conexão em {a} e volte para esta aba.", apprO: "Aprove a conexão na sua carteira e volte para esta aba.",
      qr: "Escaneie com o app de carteira do seu celular (MetaMask, Trust, Binance, Coinbase…) e aprove lá.", copy: "Copiar link de conexão", copied: "Copiado",
      fail: "O WalletConnect não carregou. Verifique sua conexão e tente de novo.", rej: "A conexão foi recusada na carteira.", exp: "O link expirou.",
      retry: "Tentar de novo", noqr: "Não foi possível desenhar o QR. Use Copiar link de conexão.", own: "Prefere o navegador da sua carteira? Abra esta página no ",
      or: " ou ", only: "Só o seu endereço é lido: sem assinaturas nem transações." }
  };
  if (window.MA_WALLET_I18N) for (var lk in window.MA_WALLET_I18N) T[lk] = window.MA_WALLET_I18N[lk];
  function t(k, v) { var l = (document.documentElement.lang || "en").slice(0, 2), s = (T[l] || T.en)[k]; if (v) for (var x in v) s = s.split("{" + x + "}").join(v[x]); return s; }

  function binance() {
    var dentro = new URL("bnc://app.binance.com/mp/app");
    dentro.searchParams.set("appId", "yFK5FCqYprrXDiVFbhyRx7");
    dentro.searchParams.set("startPagePath", btoa("/pages/browser/index"));
    dentro.searchParams.set("startPageQuery", btoa("url=" + enc(location.href.split("#")[0]) + "&defaultChainId=1"));
    var u = new URL("https://app.binance.com/en/download");
    u.searchParams.set("_dp", btoa(dentro.toString()));
    return u.toString();
  }
  var APPS = [
    { id: "metamask", nombre: "MetaMask", logo: "metaMask", nativo: "metamask://", navegador: function () { return "https://metamask.app.link/dapp/" + AQUI.replace(/^https?:\/\//, ""); } },
    { id: "trust", nombre: "Trust Wallet", logo: "trust", nativo: "trust://", navegador: function () { return "https://link.trustwallet.com/open_url?coin_id=60&url=" + enc(AQUI); } },
    { id: "binance", nombre: "Binance Wallet", logo: "binance", navegador: binance },
    { id: "coinbase", nombre: "Coinbase Wallet", logo: "coinbase", navegador: function () { return "https://go.cb-w.com/dapp?cb_url=" + enc(AQUI); } },
    { id: "okx", nombre: "OKX Wallet", logo: "okx", navegador: function () { return "https://www.okx.com/download?deeplink=" + enc("okx://wallet/dapp/url?dappUrl=" + enc(AQUI)); } },
    { id: "rainbow", nombre: "Rainbow", logo: "rainbow", nativo: "rainbow://" }
  ];
  var OTRAS = { id: "otras", nombre: "", logo: "walletConnect" };
  function conWC(a) { return !!a.nativo; }
  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function guardar(k, v) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }

  /* wallets inyectadas (EIP-6963 y, si no anuncia ninguna, window.ethereum) */
  var anunciadas = new Map();
  window.addEventListener("eip6963:announceProvider", function (e) {
    var d = e.detail || {};
    if (d.info && d.info.uuid && d.provider && !anunciadas.has(d.info.uuid)) anunciadas.set(d.info.uuid, d);
  });
  window.dispatchEvent(new Event("eip6963:requestProvider"));
  function inyectadas() {
    var l = Array.from(anunciadas.values()).map(function (d) { return { nombre: d.info.name || "Browser wallet", icono: d.info.icon, proveedor: d.provider }; });
    if (!l.length && window.ethereum) l.push({ nombre: "Browser wallet", icono: null, proveedor: window.ethereum });
    return l;
  }

  var cargas = {};
  function cargar(src, listo) {
    if (listo()) return Promise.resolve();
    if (!cargas[src]) cargas[src] = new Promise(function (ok, mal) {
      var s = document.createElement("script"); s.src = src;
      s.onload = function () { listo() ? ok() : mal(new Error("vacio")); };
      s.onerror = function () { delete cargas[src]; mal(new Error("no carga")); };
      document.head.appendChild(s);
    });
    return cargas[src];
  }

  /* ---------- WalletConnect ---------- */
  var wcPromesa = null, wc = null, conectado = null, alDir = function () {}, alSalir = function () {};
  function proveedorWC() {
    if (wcPromesa) return wcPromesa;
    wcPromesa = cargar(WC_JS, function () { return !!window.WalletConnectEthereumProvider; })
      .then(function () {
        return window.WalletConnectEthereumProvider.EthereumProvider.init({
          projectId: WC_PROJECT_ID, chains: [1], optionalChains: [1], rpcMap: { 1: "https://ethereum-rpc.publicnode.com" },
          showQrModal: false, customStoragePrefix: PREFIJO,
          metadata: { name: "Sectora · My Airdrop", description: "Your Sectora airdrop, Hash Node and staking, read-only.", url: location.origin, icons: [location.origin + "/icons/v2/icon-192.png"] }
        });
      })
      .then(function (p) {
        wc = p;
        // la sesion puede llegar sin la promesa de connect(): la pagina se recargo mientras se aprobaba
        p.on("connect", function () { entregar(p); });
        p.on("disconnect", olvidarWC);
        p.on("session_delete", olvidarWC);
        p.on("accountsChanged", function (a) { if (conectado === p && a && a[0]) alDir(a[0], via()); });
        return p;
      })
      .catch(function (e) { wcPromesa = null; throw e; });
    return wcPromesa;
  }
  function nombreSesion(p) {
    var m = p && p.session && p.session.peer && p.session.peer.metadata, n = m && typeof m.name === "string" ? m.name.trim().slice(0, 40) : "";
    return n || "WalletConnect";
  }
  function via() { return conectado && conectado === wc ? nombreSesion(wc) + " · WalletConnect" : ""; }
  function entregar(p) {
    if (!p.session || !p.accounts || !p.accounts.length) return;
    conectado = p; guardar(MARCA, "1"); cerrar();
    alDir(p.accounts[0], via());
  }
  function olvidarWC() {
    guardar(MARCA, null);
    if (conectado && conectado === wc) { conectado = null; alSalir(); }
  }

  /* ---------- el selector ---------- */
  var ov = null, caja = null, uri = "", pidiendo = false, logosPedidos = false;
  function nodo(tag, clase, texto) { var n = document.createElement(tag); if (clase) n.className = clase; if (texto) n.textContent = texto; return n; }
  function estilos() {
    if (document.getElementById("maw-css")) return;
    var s = document.createElement("style"); s.id = "maw-css";
    s.textContent = [
      ".maw{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.7);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
      ".maw[hidden]{display:none}",
      ".maw-p{position:relative;width:min(440px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#07090d;border:1px solid rgba(255,255,255,.12);padding:20px}",
      ".maw-p::before{content:'';position:absolute;left:-1px;right:-1px;top:-1px;height:3px;background:#1569ff}",
      ".maw-h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:2px 0 6px;color:#c6ccd8}",
      ".maw-x{padding:8px 0 8px 12px;color:#7c8496;font:inherit;letter-spacing:inherit;text-transform:inherit}",
      ".maw-st{min-height:20px;margin:0 0 12px;color:#7c8496;font-size:13px;line-height:1.5}",
      ".maw-st i{display:inline-block;width:10px;height:10px;margin-right:8px;border:1.5px solid #4a5164;border-top-color:#1569ff;border-radius:50%;animation:mawsp .8s linear infinite;vertical-align:-1px}",
      "@keyframes mawsp{to{transform:rotate(360deg)}}",
      ".maw-st.err{color:#e0a030}",
      ".maw-st button{margin-left:10px;color:#4d8dff;text-decoration:underline}",
      ".maw-l{display:flex;flex-direction:column;border-top:1px solid rgba(255,255,255,.08)}",
      ".maw-r{display:flex;align-items:center;gap:14px;padding:12px 4px;border-bottom:1px solid rgba(255,255,255,.08);color:#fff;text-decoration:none;text-align:left;width:100%}",
      ".maw-r:hover{background:rgba(255,255,255,.03)}",
      ".maw-r[aria-disabled=true]{opacity:.45;pointer-events:none}",
      ".maw-i{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:8px;background:#11151d;color:#fff;font-weight:500;overflow:hidden}",
      "img.maw-i{object-fit:contain;background:none}",
      ".maw-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}",
      ".maw-n{font-size:15px;font-weight:400}",
      ".maw-s{color:#7c8496;font-size:10px}",
      ".maw-g{color:#4d8dff}",
      ".maw-f{margin-top:14px;display:flex;flex-direction:column;gap:12px}",
      ".maw-c{min-height:40px;border:1px solid rgba(255,255,255,.12);color:#fff}",
      ".maw-c:disabled{opacity:.4}",
      ".maw-a,.maw-o{margin:0;color:#7c8496;font-size:12.5px;line-height:1.6}",
      ".maw-a a{color:#4d8dff}",
      ".maw-q{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:6px}",
      ".maw-qb{width:232px;height:232px;display:grid;place-items:center;background:#fff;padding:8px}",
      ".maw-qb svg{width:100%;height:100%;display:block}",
      ".maw-qt{margin:0;color:#7c8496;font-size:13px;line-height:1.5;text-align:center}",
      "@media (max-width:560px){.maw{align-items:flex-end;padding:0}.maw-p{width:100%;max-height:88vh;border-left:0;border-right:0;border-bottom:0;padding:18px 16px calc(18px + env(safe-area-inset-bottom))}}",
      "@media (prefers-reduced-motion:reduce){.maw-st i{animation:none}}"
    ].join("\n");
    document.head.appendChild(s);
  }
  function montar() {
    if (ov) return;
    estilos();
    ov = nodo("div", "maw"); ov.hidden = true; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    caja = nodo("div", "maw-p"); ov.appendChild(caja); document.body.appendChild(ov);
    ov.addEventListener("click", function (e) { if (e.target === ov) cerrar(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && ov && !ov.hidden) cerrar(); });
  }
  function icono(logo, nombre, src) {
    var url = src || (window.SECTORA_WALLET_LOGOS || {})[logo];
    // los logos son SVG en data URI: siempre por propiedad del DOM, nunca dentro de innerHTML
    if (url && /^data:image\/|^https:\/\//.test(url)) { var i = nodo("img", "maw-i"); i.src = url; i.alt = ""; i.width = 32; i.height = 32; return i; }
    var s = nodo("span", "maw-i", (nombre || "?").charAt(0)); if (logo) s.dataset.logo = logo; return s;
  }
  function pedirLogos() {
    if (logosPedidos) return; logosPedidos = true;
    cargar(LOGOS_JS, function () { return !!window.SECTORA_WALLET_LOGOS; }).then(function () {
      if (!caja) return;
      caja.querySelectorAll("span.maw-i[data-logo]").forEach(function (s) { var u = window.SECTORA_WALLET_LOGOS[s.dataset.logo]; if (u) s.replaceWith(icono(s.dataset.logo, "", u)); });
    }).catch(function () {});
  }
  function fila(tag, app, nombre, sub, ic) {
    var f = nodo(tag, "maw-r"); f.dataset.app = app.id; if (tag === "button") f.type = "button";
    f.appendChild(icono(app.logo, nombre, ic));
    var tx = nodo("span", "maw-t"); tx.appendChild(nodo("span", "maw-n", nombre)); tx.appendChild(nodo("span", "maw-s mono", sub)); f.appendChild(tx);
    f.appendChild(nodo("span", "maw-g", "→"));
    return f;
  }
  function estado(texto, error) {
    var e = caja && caja.querySelector(".maw-st"); if (!e) return;
    e.textContent = ""; if (!error) e.appendChild(nodo("i")); e.appendChild(document.createTextNode(texto)); e.classList.toggle("err", !!error);
  }
  function cabecera(titulo) {
    var h = nodo("div", "maw-h mono"); h.appendChild(nodo("span", "", titulo));
    var x = nodo("button", "maw-x mono", t("close")); x.type = "button"; x.addEventListener("click", cerrar); h.appendChild(x);
    caja.appendChild(h); caja.appendChild(nodo("p", "maw-st"));
  }
  function copiar() {
    var b = nodo("button", "maw-c mono", t("copy")); b.type = "button"; b.disabled = !uri;
    b.addEventListener("click", function () { if (!uri) return; try { navigator.clipboard.writeText(uri).then(function () { b.textContent = t("copied"); setTimeout(function () { b.textContent = t("copy"); }, 1600); }); } catch (e) {} });
    return b;
  }
  function vistaMovil() {
    caja.textContent = ""; cabecera(t("pickM"));
    var lista = nodo("div", "maw-l");
    inyectadas().forEach(function (w) { var f = fila("button", { id: "iny" }, w.nombre, t("det"), w.icono); f.addEventListener("click", function () { usar(w.proveedor); }); lista.appendChild(f); });
    APPS.forEach(function (a) {
      var f = fila("a", a, a.nombre, conWC(a) ? t("wc") : t("brw"));
      if (conWC(a)) {
        f.setAttribute("aria-disabled", "true");
        f.addEventListener("click", function (e) { if (!uri) { e.preventDefault(); return; } estado(t("appr", { a: a.nombre })); });
      } else { f.href = a.navegador(); f.rel = "noopener"; }
      lista.appendChild(f);
    });
    var o = fila("a", OTRAS, t("other"), t("otherS")); o.setAttribute("aria-disabled", "true");
    o.addEventListener("click", function (e) { if (!uri) { e.preventDefault(); return; } estado(t("apprO")); });
    lista.appendChild(o); caja.appendChild(lista);
    var pie = nodo("div", "maw-f"); pie.appendChild(copiar());
    var alt = nodo("p", "maw-a"); alt.append(t("own"));
    var conNav = APPS.filter(function (a) { return conWC(a) && a.navegador; });
    conNav.forEach(function (a, i) { var l = nodo("a", "", a.nombre); l.href = a.navegador(); l.rel = "noopener"; alt.append(l, i < conNav.length - 2 ? ", " : i === conNav.length - 2 ? t("or") : "."); });
    pie.appendChild(alt); pie.appendChild(nodo("p", "maw-o", t("only"))); caja.appendChild(pie);
  }
  function vistaPC() {
    caja.textContent = ""; cabecera(t("pickD"));
    var lista = nodo("div", "maw-l"), ext = inyectadas();
    ext.forEach(function (w) { var f = fila("button", { id: "iny" }, w.nombre, t("ext"), w.icono); f.addEventListener("click", function () { usar(w.proveedor); }); lista.appendChild(f); });
    caja.appendChild(lista);
    var qr = nodo("div", "maw-q");
    if (ext.length) { var f = fila("button", OTRAS, t("phone"), t("phoneS")); f.addEventListener("click", function () { f.remove(); mostrarQR(qr); }); lista.appendChild(f); }
    caja.appendChild(qr);
    var pie = nodo("div", "maw-f"); pie.appendChild(nodo("p", "maw-o", t("only"))); caja.appendChild(pie);
    if (!ext.length) mostrarQR(qr);
  }
  function mostrarQR(qr) {
    qr.textContent = ""; qr.appendChild(nodo("div", "maw-qb")); qr.appendChild(nodo("p", "maw-qt", t("qr"))); qr.appendChild(copiar());
    qr.dataset.on = "1"; pedirConexion();
  }
  function filasWC() {
    if (!caja) return [];
    return Array.from(caja.querySelectorAll("a.maw-r")).filter(function (f) { var a = APPS.find(function (x) { return x.id === f.dataset.app; }); return f.dataset.app === "otras" || (a && conWC(a)); });
  }
  function pintarUri() {
    if (!caja) return;
    filasWC().forEach(function (f) { var a = APPS.find(function (x) { return x.id === f.dataset.app; }); f.href = a ? a.nativo + "wc?uri=" + enc(uri) : uri; f.removeAttribute("aria-disabled"); });
    caja.querySelectorAll(".maw-c").forEach(function (b) { b.disabled = false; });
    var box = caja.querySelector(".maw-qb");
    if (box) cargar(QR_JS, function () { return !!window.SectoraQR; }).then(function () {
      var q = window.SectoraQR(0, "M"); q.addData(uri); q.make(); box.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2 });   // SVG generado aqui
    }).catch(function () { estado(t("noqr"), true); });
    estado(MOVIL ? t("tapM") : t("tapD"));
  }
  /* el enlace se pide antes del toque: en Safari del iPhone la app solo se abre si el enlace sale directo del toque */
  function pedirConexion() {
    if (pidiendo) { if (uri) pintarUri(); return; }
    pidiendo = true; estado(t("prep"));
    proveedorWC().then(function (p) {
      if (p.session && p.accounts && p.accounts.length) { pidiendo = false; entregar(p); return; }
      var alUri = function (u) { if (typeof u === "string" && /^wc:/.test(u)) { uri = u; pintarUri(); } };
      p.on("display_uri", alUri);
      return p.connect().then(function () { entregar(p); }, function (e) {
        uri = "";
        if (ov && !ov.hidden) {
          estado(/reject|denied|cancel/i.test((e && e.message) || "") ? t("rej") : t("exp"), true);
          var otra = nodo("button", "mono", t("retry")); otra.type = "button"; otra.addEventListener("click", function () { abrir(); });
          caja.querySelector(".maw-st").appendChild(otra);
          filasWC().forEach(function (f) { f.removeAttribute("href"); f.setAttribute("aria-disabled", "true"); });
          caja.querySelectorAll(".maw-c").forEach(function (b) { b.disabled = true; });
          var box = caja.querySelector(".maw-qb"); if (box) box.textContent = "";
        }
      }).then(function () { if (p.removeListener) p.removeListener("display_uri", alUri); pidiendo = false; });
    }).catch(function () { pidiendo = false; estado(t("fail"), true); });
  }
  function usar(proveedor) {
    cerrar();
    proveedor.request({ method: "eth_requestAccounts" }).then(function (a) {
      if (a && a[0]) { conectado = proveedor; alDir(a[0], ""); }
    }).catch(function () {});
  }
  function abrir() {
    montar();
    var iny = inyectadas();
    // dentro del navegador de una wallet se conecta directa (Brave y Opera traen su propia wallet: ahi se deja elegir)
    if (MOVIL && iny.length && !iny[0].proveedor.isBraveWallet && !/OPR\//.test(ua)) { usar(iny[0].proveedor); return; }
    pedirLogos();
    if (MOVIL) { vistaMovil(); ov.hidden = false; if (uri) pintarUri(); else pedirConexion(); }
    else { vistaPC(); ov.hidden = false; if (uri && caja.querySelector(".maw-q[data-on]")) pintarUri(); }
  }
  function cerrar() { if (ov) ov.hidden = true; }
  function salir() {
    var p = conectado; conectado = null;
    if (p && p === wc) { try { wc.disconnect().catch(function () {}); } catch (e) {} guardar(MARCA, null); }
  }
  /* al volver a la pagina: la sesion de WalletConnect abierta aqui (en el navegador de una wallet manda la inyectada) */
  function restaurar() {
    if (leer(MARCA) !== "1" || (MOVIL && inyectadas().length)) return;
    proveedorWC().then(function (p) { if (p.session && p.accounts && p.accounts.length) entregar(p); else guardar(MARCA, null); }).catch(function () {});
  }

  window.SectoraMyWallet = {
    abrir: abrir, cerrar: cerrar, salir: salir, restaurar: restaurar,
    alDir: function (cb) { alDir = cb; }, alSalir: function (cb) { alSalir = cb; },
    proveedor: function () { return conectado; }, movil: MOVIL
  };
})();
