/* ---- Sectora Staking: eleccion de wallet.

   Hasta ahora la pagina solo hablaba con una wallet inyectada (window.ethereum),
   que en el movil solo existe dentro del navegador de la propia app de la
   wallet. En Chrome o Safari del movil no habia nada a lo que conectarse.

   Este modulo pone un selector debajo del boton de conectar:
   - con una wallet inyectada en el movil (navegador de MetaMask, Trust...)
     se conecta directa, como siempre;
   - en Chrome o Safari del movil lista las apps: las que aceptan WalletConnect
     se abren para aprobar y la persona vuelve a esta misma pestana ya
     conectada; Binance y OKX abren esta pagina en su navegador, donde la
     wallet ya esta inyectada;
   - en el ordenador ofrece las extensiones detectadas y un QR para conectar
     la wallet del telefono.

   WalletConnect es el mismo paquete local que usa el panel
   (../walletconnect-provider.min.js, 2 MB): solo se descarga al abrir el
   selector, nunca al cargar la pagina, salvo para restaurar una sesion que
   la persona ya abrio con el.

   No firma ni lee nada: entrega el proveedor EIP-1193 a staking-chain.js,
   que sigue haciendo todas las comprobaciones de red, cuenta y contrato. ---- */
(function () {
  "use strict";

  const WC_PROJECT_ID = "a491fc0784a2751d886adfc7a687c8cb";   // el mismo del panel
  const WC_JS = "../walletconnect-provider.min.js?v=20260809a";
  const QR_JS = "../qrcode-generator.min.js?v=20260809a";
  const LOGOS_JS = "../dashboard-wallet-logos.js";
  const RPC = "https://ethereum-rpc.publicnode.com";
  const MARCA = "sect-wc";                       // hay (o hubo) una sesion de WalletConnect
  const ELEGIDA = "sect-wc-app";                 // que app se eligio en el movil
  const DEEPLINK = "WALLETCONNECT_DEEPLINK_CHOICE"; // el SDK la lee para abrir la app al firmar

  const ua = navigator.userAgent || "";
  const MOVIL = /Android|iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);   // iPadOS se presenta como Mac

  // esta misma pagina, para abrirla dentro del navegador de una wallet
  const AQUI = location.origin + location.pathname;
  const enc = encodeURIComponent;

  function binance() {
    // el formato que usa Reown AppKit para abrir una web en Binance Wallet
    const dentro = new URL("bnc://app.binance.com/mp/app");
    dentro.searchParams.set("appId", "yFK5FCqYprrXDiVFbhyRx7");
    dentro.searchParams.set("startPagePath", btoa("/pages/browser/index"));
    dentro.searchParams.set("startPageQuery", btoa("url=" + enc(location.href.split("#")[0]) + "&defaultChainId=1"));
    const u = new URL("https://app.binance.com/en/download");
    u.searchParams.set("_dp", btoa(dentro.toString()));
    return u.toString();
  }

  /* nativo: esquema de la app. Con "wc?uri=" detras abre la peticion de
     conexion; solo, trae la app al frente para firmar. Es lo que hace Reown
     AppKit: un esquema propio no saca a la pestana de esta pagina, mientras
     que un enlace https puede acabar en una web intermedia y perderla.
     navegador: abre esta pagina dentro de la app, con la wallet inyectada.
     Coinbase va asi tambien en AppKit. */
  const APPS = [
    { id: "metamask", nombre: "MetaMask", logo: "metaMask", nativo: "metamask://",
      navegador: () => "https://metamask.app.link/dapp/" + AQUI.replace(/^https?:\/\//, "") },
    { id: "trust", nombre: "Trust Wallet", logo: "trust", nativo: "trust://",
      navegador: () => "https://link.trustwallet.com/open_url?coin_id=60&url=" + enc(AQUI) },
    { id: "binance", nombre: "Binance Wallet", logo: "binance", navegador: binance },
    { id: "coinbase", nombre: "Coinbase Wallet", logo: "coinbase",
      navegador: () => "https://go.cb-w.com/dapp?cb_url=" + enc(AQUI) },
    { id: "okx", nombre: "OKX Wallet", logo: "okx",
      navegador: () => "https://www.okx.com/download?deeplink=" + enc("okx://wallet/dapp/url?dappUrl=" + enc(AQUI)) },
    { id: "rainbow", nombre: "Rainbow", logo: "rainbow", nativo: "rainbow://" },
  ];
  const conWC = (a) => !!a.nativo;
  /* TEMPORAL (30 oct 2026): mientras Reown quita la marca de sectoraorg.com, en el movil sin wallet
     (Chrome, Safari...) no se conecta por WalletConnect: se abre esta pagina dentro de la app de la wallet,
     donde no sale ninguna alerta. Para volver a como estaba: SOLO_APP = false. */
  const SOLO_APP = true;
  const OTRAS = { id: "otras", nombre: "Other wallets", logo: "walletConnect" };

  const $ = (id) => document.getElementById(id);
  const leer = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const guardar = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };

  // ---------------------------------------------------------------
  // wallets inyectadas (EIP-6963 y, si no anuncia ninguna, window.ethereum)
  // ---------------------------------------------------------------
  const anunciadas = new Map();
  window.addEventListener("eip6963:announceProvider", (e) => {
    const d = e.detail || {};
    // por uuid: un anuncio posterior no puede sustituir a una wallet ya anunciada
    if (d.info && d.info.uuid && d.provider && !anunciadas.has(d.info.uuid)) anunciadas.set(d.info.uuid, d);
  });
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  function inyectadas() {
    const l = Array.from(anunciadas.values()).map((d) => ({
      nombre: d.info.name || "Browser wallet", icono: d.info.icon, proveedor: d.provider,
    }));
    if (!l.length && window.ethereum) l.push({ nombre: "Browser wallet", icono: null, proveedor: window.ethereum });
    return l;
  }

  // ---------------------------------------------------------------
  // carga perezosa de scripts
  // ---------------------------------------------------------------
  const cargas = {};
  function cargar(src, listo) {
    if (listo()) return Promise.resolve();
    if (!cargas[src]) {
      cargas[src] = new Promise((ok, mal) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => (listo() ? ok() : mal(new Error("vacio: " + src)));
        s.onerror = () => { delete cargas[src]; mal(new Error("no carga: " + src)); };
        document.head.appendChild(s);
      });
    }
    return cargas[src];
  }

  // ---------------------------------------------------------------
  // WalletConnect
  // ---------------------------------------------------------------
  let wcPromesa = null;   // un solo proveedor por pagina
  let wc = null;
  let alConectar = () => {};
  let alDesconectar = () => {};
  let conectadoCon = null;   // el proveedor ya entregado a staking-chain.js

  function proveedorWC() {
    if (wcPromesa) return wcPromesa;
    wcPromesa = cargar(WC_JS, () => !!window.WalletConnectEthereumProvider)
      .then(() => window.WalletConnectEthereumProvider.EthereumProvider.init({
        projectId: WC_PROJECT_ID,
        // chains marca mainnet como la red de la sesion; al ir tambien
        // optionalChains, el SDK no la exige y ninguna wallet la rechaza
        chains: [1],
        optionalChains: [1],
        rpcMap: { 1: RPC },
        showQrModal: false,
        metadata: {
          name: "Sectora Foundation",
          description: "#SECT holder rewards on Ethereum mainnet.",
          url: location.origin,
          icons: [location.origin + "/icons/v2/icon-192.png"],
        },
      }))
      .then((p) => {
        wc = p;
        // la sesion puede llegar sin la promesa de connect(): la pagina se
        // recargo mientras la persona aprobaba en la app
        p.on("connect", () => entregar(p));
        p.on("disconnect", olvidarWC);
        p.on("session_delete", olvidarWC);
        return p;
      })
      .catch((e) => { wcPromesa = null; throw e; });
    return wcPromesa;
  }

  /* MetaMask y otras aprueban la sesion con todas sus redes (Linea, Base...)
     y el SDK toma la primera que la wallet lista, que no tiene por que ser
     Ethereum. Si mainnet esta entre las aprobadas, el propio SDK cambia de
     red en local, sin pedir nada a la wallet; si no esta, staking-chain.js
     avisa de que hay que cambiar de red. */
  async function aMainnet(p) {
    const ns = (p.session && p.session.namespaces && p.session.namespaces.eip155) || {};
    const conMainnet = (ns.accounts || []).some((a) => a.indexOf("eip155:1:") === 0);
    if (!conMainnet) return;
    try {
      await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x1" }] });
    } catch (e) {
      console.warn("[sectora] no pude fijar mainnet en la sesion", e);
    }
  }

  async function entregar(p) {
    if (!p.session || !p.accounts || !p.accounts.length) return;
    if (conectadoCon === p) return;
    conectadoCon = p;
    await aMainnet(p);
    guardar(MARCA, "1");
    if (MOVIL) recordarApp(p); else guardar(DEEPLINK, null);   // en el PC el SDK no debe abrir apps
    cerrar();
    alConectar(p, { wc: true, nombre: nombreSesion(p) });
  }

  function olvidarWC() {
    guardar(MARCA, null);
    guardar(ELEGIDA, null);
    guardar(DEEPLINK, null);
    if (conectadoCon && conectadoCon === wc) {
      conectadoCon = null;
      alDesconectar();
    }
  }

  // solo enlaces que abren una app o una web segura: nada de javascript:, data:...
  function enlaceSeguro(u) {
    if (typeof u !== "string" || u.length > 300) return null;
    const m = /^([a-z][a-z0-9+.-]*):/i.exec(u.trim());
    if (!m) return null;
    const esquema = m[1].toLowerCase();
    if (["javascript", "data", "vbscript", "file", "blob", "about", "http"].includes(esquema)) return null;
    return u.trim();
  }

  function appElegida() {
    const id = leer(ELEGIDA);
    return APPS.find((a) => a.id === id) || null;
  }

  function nombreSesion(p) {
    const m = p && p.session && p.session.peer && p.session.peer.metadata;
    const n = m && typeof m.name === "string" ? m.name.trim().slice(0, 40) : "";
    return n || (appElegida() || {}).nombre || "your wallet";
  }

  /** Enlace para traer la wallet al frente cuando hay que firmar. */
  function enlaceApp(p) {
    const m = p && p.session && p.session.peer && p.session.peer.metadata;
    const r = (m && m.redirect) || {};
    const a = appElegida();
    return enlaceSeguro(r.native) || (a && a.nativo) || enlaceSeguro(r.universal) || null;
  }

  function recordarApp(p) {
    const href = enlaceApp(p);
    if (href) guardar(DEEPLINK, JSON.stringify({ href: href, name: nombreSesion(p) }));
  }

  // ---------------------------------------------------------------
  // el selector
  // ---------------------------------------------------------------
  let caja = null;
  let uri = "";
  let pidiendo = false;     // hay un connect() de WalletConnect en curso
  let logosPedidos = false;

  function nodo(tag, clase, texto) {
    const n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto) n.textContent = texto;
    return n;
  }

  function icono(logo, nombre, src) {
    const url = src || (window.SECTORA_WALLET_LOGOS || {})[logo];
    // los logos son SVG en data URI con comillas sin escapar: siempre por
    // propiedad del DOM, nunca dentro de innerHTML
    if (url && /^data:image\/|^https:\/\//.test(url)) {
      const i = nodo("img", "wpick-ico");
      i.src = url; i.alt = ""; i.width = 28; i.height = 28;
      return i;
    }
    const s = nodo("span", "wpick-ico", (nombre || "?").charAt(0));
    if (logo) s.dataset.logo = logo;
    return s;
  }

  function pedirLogos() {
    if (logosPedidos) return;
    logosPedidos = true;
    cargar(LOGOS_JS, () => !!window.SECTORA_WALLET_LOGOS).then(() => {
      if (!caja) return;
      caja.querySelectorAll("span.wpick-ico[data-logo]").forEach((s) => {
        const url = window.SECTORA_WALLET_LOGOS[s.dataset.logo];
        if (url) s.replaceWith(icono(s.dataset.logo, "", url));
      });
    }).catch(() => {});
  }

  function fila(tag, app, sub, extra) {
    const f = nodo(tag, "wpick-row");
    f.dataset.app = app.id;
    if (tag === "button") f.type = "button";
    f.appendChild(icono(app.logo, app.nombre, extra && extra.icono));
    const t = nodo("span", "wpick-txt");
    t.appendChild(nodo("span", "wpick-name", app.nombre));
    const s = nodo("span", "wpick-sub mono", sub);
    t.appendChild(s);
    f.appendChild(t);
    f.appendChild(nodo("span", "wpick-go", "→"));
    return f;
  }

  function estado(texto, error) {
    const e = caja && caja.querySelector(".wpick-state");
    if (!e) return;
    e.textContent = "";
    if (!error) e.appendChild(nodo("i"));
    e.appendChild(document.createTextNode(texto));
    e.classList.toggle("err", !!error);
  }

  function montarCaja() {
    if (caja) return caja;
    const btn = $("connectBtn");
    if (!btn || !btn.parentNode) return null;
    caja = nodo("div", "wpick");
    caja.id = "walletPick";
    caja.setAttribute("role", "region");
    caja.setAttribute("aria-label", "Choose a wallet");
    caja.hidden = true;
    btn.insertAdjacentElement("afterend", caja);
    return caja;
  }

  function cabecera(titulo) {
    const h = nodo("div", "wpick-head mono");
    h.appendChild(nodo("span", "", titulo));
    const x = nodo("button", "wpick-x", "Close");
    x.type = "button";
    x.addEventListener("click", cerrar);
    h.appendChild(x);
    caja.appendChild(h);
    caja.appendChild(nodo("p", "wpick-state"));
  }

  function copiarBoton() {
    const b = nodo("button", "wpick-copy mono", "Copy connection link");
    b.type = "button";
    b.disabled = !uri;
    b.addEventListener("click", async () => {
      if (!uri) return;
      try {
        await navigator.clipboard.writeText(uri);
        b.textContent = "Copied";
        setTimeout(() => { b.textContent = "Copy connection link"; }, 1600);
      } catch (e) {}
    });
    return b;
  }

  /** Movil sin wallet inyectada, mientras dura SOLO_APP: solo abrir esta pagina en la app de la wallet. */
  function vistaSoloApp() {
    caja.textContent = "";
    cabecera("Open this page in your wallet");
    estado("To connect from your phone, open this page inside your wallet app. Tap your wallet:");
    const e = caja.querySelector(".wpick-state"); if (e) e.classList.add("solo");
    const lista = nodo("div", "wpick-list");
    inyectadas().forEach((w) => {
      const f = fila("button", { id: "inyectada", nombre: w.nombre }, "Detected in this browser", { icono: w.icono });
      f.addEventListener("click", () => usarInyectada(w.proveedor));
      lista.appendChild(f);
    });
    APPS.filter((a) => a.navegador).forEach((a) => {
      const f = fila("a", a, "Opens this page in the app");
      f.href = a.navegador();
      f.rel = "noopener";
      lista.appendChild(f);
    });
    caja.appendChild(lista);
    const pie = nodo("div", "wpick-foot");
    pie.appendChild(nodo("p", "wpick-alt", "Your staking, rewards and withdrawals work the same inside your wallet app. On a computer you can also connect as usual."));
    caja.appendChild(pie);
  }

  /** Vista del movil sin wallet inyectada: Chrome, Safari, Samsung Internet... */
  function vistaMovil() {
    if (SOLO_APP) { vistaSoloApp(); return; }
    caja.textContent = "";
    cabecera("Choose your wallet app");
    const lista = nodo("div", "wpick-list");
    inyectadas().forEach((w) => {
      const f = fila("button", { id: "inyectada", nombre: w.nombre }, "Detected in this browser", { icono: w.icono });
      f.addEventListener("click", () => usarInyectada(w.proveedor));
      lista.appendChild(f);
    });
    APPS.forEach((a) => {
      const f = fila("a", a, conWC(a) ? "Approve in the app" : "Opens this page in the app");
      if (conWC(a)) {
        f.setAttribute("aria-disabled", "true");
        f.addEventListener("click", (e) => {
          if (!uri) { e.preventDefault(); return; }
          guardar(ELEGIDA, a.id);
          guardar(DEEPLINK, JSON.stringify({ href: a.nativo, name: a.nombre }));
          estado("Approve the connection in " + a.nombre + ", then come back to this tab.");
        });
      } else {
        f.href = a.navegador();
        f.rel = "noopener";
      }
      lista.appendChild(f);
    });
    const o = fila("a", OTRAS, "Any WalletConnect wallet");
    o.setAttribute("aria-disabled", "true");
    o.addEventListener("click", (e) => {
      if (!uri) { e.preventDefault(); return; }
      guardar(ELEGIDA, null);
      guardar(DEEPLINK, null);
      estado("Approve the connection in your wallet, then come back to this tab.");
    });
    lista.appendChild(o);
    caja.appendChild(lista);

    const pie = nodo("div", "wpick-foot");
    pie.appendChild(copiarBoton());
    const alt = nodo("p", "wpick-alt");
    alt.append("Prefer your wallet’s own browser? Open this page in ");
    APPS.filter((a) => conWC(a) && a.navegador).forEach((a, i, l) => {
      const l1 = nodo("a", "", a.nombre);
      l1.href = a.navegador();
      l1.rel = "noopener";
      alt.append(l1, i < l.length - 2 ? ", " : i === l.length - 2 ? " or " : ".");
    });
    pie.appendChild(alt);
    caja.appendChild(pie);
  }

  /** Vista del ordenador: extensiones detectadas y QR para el telefono. */
  function vistaPC() {
    caja.textContent = "";
    cabecera("Connect a wallet");
    const lista = nodo("div", "wpick-list");
    const ext = inyectadas();
    ext.forEach((w) => {
      const f = fila("button", { id: "inyectada", nombre: w.nombre }, "Browser extension", { icono: w.icono });
      f.addEventListener("click", () => usarInyectada(w.proveedor));
      lista.appendChild(f);
    });
    caja.appendChild(lista);

    const qr = nodo("div", "wpick-qr");
    if (ext.length) {
      const f = fila("button", OTRAS, "Scan a QR code with your phone");
      f.querySelector(".wpick-name").textContent = "Wallet on your phone";
      f.addEventListener("click", () => { f.remove(); mostrarQR(qr); });
      lista.appendChild(f);
    }
    caja.appendChild(qr);
    if (!ext.length) mostrarQR(qr);
  }

  function mostrarQR(qr) {
    qr.textContent = "";
    qr.appendChild(nodo("div", "wpick-qrbox"));
    qr.appendChild(nodo("p", "wpick-qrtxt",
      "Scan with your phone’s wallet app (MetaMask, Trust, Binance, Coinbase…) and approve there."));
    qr.appendChild(copiarBoton());
    qr.dataset.on = "1";
    pedirConexionWC();
  }

  // las filas que conectan por WalletConnect (no las que abren el navegador de la app)
  function filasWC() {
    if (!caja) return [];
    return Array.from(caja.querySelectorAll("a.wpick-row")).filter((f) => {
      const a = APPS.find((x) => x.id === f.dataset.app);
      return f.dataset.app === "otras" || (a && conWC(a));
    });
  }

  function pintarUri() {
    if (!caja) return;
    filasWC().forEach((f) => {
      const a = APPS.find((x) => x.id === f.dataset.app);
      f.href = a ? a.nativo + "wc?uri=" + enc(uri) : uri;
      f.removeAttribute("aria-disabled");
    });
    caja.querySelectorAll(".wpick-copy").forEach((b) => (b.disabled = false));
    const box = caja.querySelector(".wpick-qrbox");
    if (box) {
      cargar(QR_JS, () => !!window.SectoraQR).then(() => {
        const q = window.SectoraQR(0, "M");
        q.addData(uri);
        q.make();
        box.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2 });   // SVG generado aqui, sin texto ajeno
      }).catch(() => estado("Could not draw the QR code. Use Copy connection link.", true));
    }
    estado(MOVIL ? "Tap your wallet app. Approve the connection there, then come back to this tab."
                 : "Scan the code with your phone to connect.");
  }

  /* Pide el enlace de conexion antes de que la persona toque su app: en
     Safari del iPhone la app solo se abre si el enlace sale directo del
     toque, sin esperas de por medio. */
  async function pedirConexionWC() {
    if (pidiendo) {   // ya hay uno en curso: se reusa su enlace
      if (uri) pintarUri();
      return;
    }
    pidiendo = true;
    estado("Preparing a secure connection…");
    let p;
    try {
      p = await proveedorWC();
    } catch (e) {
      pidiendo = false;
      estado("WalletConnect did not load. Check your connection and try again.", true);
      return;
    }
    if (p.session && p.accounts && p.accounts.length) {   // ya habia sesion
      pidiendo = false;
      entregar(p);
      return;
    }
    const alUri = (u) => {
      if (typeof u !== "string" || !/^wc:/.test(u)) return;
      uri = u;
      pintarUri();
    };
    p.on("display_uri", alUri);
    try {
      await p.connect();
      entregar(p);
    } catch (e) {
      // caducado (5 min) o rechazado en la app: se prepara otro enlace si
      // el selector sigue abierto
      uri = "";
      if (caja && !caja.hidden) {
        const rechazo = /reject|denied|cancel/i.test((e && e.message) || "");
        estado(rechazo ? "The connection was rejected in the wallet." : "The link expired.", true);
        const otra = nodo("button", "wpick-retry mono", "Try again");
        otra.type = "button";
        otra.addEventListener("click", () => { abrir(); });
        caja.querySelector(".wpick-state").appendChild(otra);
        filasWC().forEach((f) => { f.removeAttribute("href"); f.setAttribute("aria-disabled", "true"); });
        caja.querySelectorAll(".wpick-copy").forEach((b) => (b.disabled = true));
        const box = caja.querySelector(".wpick-qrbox");
        if (box) box.textContent = "";
      }
    } finally {
      p.removeListener && p.removeListener("display_uri", alUri);
      pidiendo = false;
    }
  }

  function usarInyectada(proveedor) {
    cerrar();
    conectadoCon = proveedor;
    alConectar(proveedor, { wc: false });
  }

  /** Vista con la wallet ya conectada: a quien y como desconectar. */
  function vistaConectada(direccion) {
    caja.textContent = "";
    cabecera("Connected");
    const via = conectadoCon && conectadoCon === wc ? nombreSesion(wc) + " · WalletConnect" : "Browser wallet";
    estado(via + " · " + direccion.slice(0, 6) + "…" + direccion.slice(-4));
    const b = nodo("button", "wpick-copy mono", "Disconnect");
    b.type = "button";
    b.addEventListener("click", desconectar);
    const pie = nodo("div", "wpick-foot");
    pie.appendChild(b);
    caja.appendChild(pie);
  }

  function abrir(direccion) {
    if (!montarCaja()) return;
    if (direccion && conectadoCon) {
      vistaConectada(direccion);
      caja.hidden = false;
      return;
    }
    const iny = inyectadas();
    // dentro del navegador de una wallet se conecta directa, como siempre
    // (Brave y Opera traen su propia wallet: ahi se deja elegir)
    if (MOVIL && iny.length && !iny[0].proveedor.isBraveWallet && !/OPR\//.test(ua)) {
      usarInyectada(iny[0].proveedor);
      return;
    }
    pedirLogos();
    if (MOVIL) {
      vistaMovil();
      caja.hidden = false;
      if (!SOLO_APP) { if (uri) pintarUri(); else pedirConexionWC(); }
    } else {
      vistaPC();
      caja.hidden = false;
      if (uri && caja.querySelector(".wpick-qr[data-on]")) pintarUri();
    }
  }

  function cerrar() {
    if (caja) caja.hidden = true;
  }

  async function desconectar() {
    const p = conectadoCon;
    cerrar();
    if (p && p === wc) {
      try { await wc.disconnect(); } catch (e) {}
      olvidarWC();
      return;
    }
    if (p && p.request) {
      try { await p.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] }); } catch (e) {}
    }
    conectadoCon = null;
    alDesconectar();
  }

  // ---------------------------------------------------------------
  // al firmar con WalletConnect en el movil: un boton para volver a la app
  // ---------------------------------------------------------------
  function firmando(si) {
    let b = $("wcFirma");
    if (!si || !conectadoCon || conectadoCon !== wc) {
      if (b) b.hidden = true;
      return;
    }
    const btn = $("connectBtn");
    if (!b && btn && btn.parentNode) {
      b = nodo("a", "btn btn-ghost wide mono wc-firma");
      b.id = "wcFirma";
      btn.parentNode.appendChild(b);
    }
    if (!b) return;
    const nombre = nombreSesion(wc);
    const href = MOVIL ? enlaceApp(wc) : null;
    if (href) {
      b.href = href;
      b.textContent = "Open " + nombre + " to confirm";
    } else {
      b.removeAttribute("href");
      b.textContent = MOVIL ? "Confirm in " + nombre : "Confirm on your phone in " + nombre;
    }
    b.hidden = false;
  }

  // ---------------------------------------------------------------
  // restaurar una sesion de WalletConnect al volver a la pagina
  // ---------------------------------------------------------------
  function restaurar() {
    if (leer(MARCA) !== "1") return;
    // dentro del navegador de una wallet manda la wallet inyectada
    if (MOVIL && inyectadas().length) return;
    proveedorWC().then((p) => {
      if (p.session && p.accounts && p.accounts.length) entregar(p);
      else guardar(MARCA, null);
    }).catch(() => {});
  }

  window.SectoraStakeWallet = {
    alConectar: (cb) => { alConectar = cb; },
    alDesconectar: (cb) => { alDesconectar = cb; },
    abrir: abrir,
    cerrar: cerrar,
    desconectar: desconectar,
    firmando: firmando,
    restaurar: restaurar,
    esWC: (p) => !!p && p === wc,
  };
})();
