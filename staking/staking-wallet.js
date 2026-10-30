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
  const PHANTOM = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" fill="#ab9ff2"/><path d="M7 21.5V13a7 7 0 0 1 14 0v8.5l-2.33-1.75-2.34 1.75L14 19.75l-2.33 1.75-2.34-1.75z" fill="#fff"/><ellipse cx="11.6" cy="13.2" rx="1.15" ry="1.7" fill="#ab9ff2"/><ellipse cx="16.4" cy="13.2" rx="1.15" ry="1.7" fill="#ab9ff2"/></svg>');
  // logos oficiales de Rabby, Magic Eden y Ronin (no estan en dashboard-wallet-logos.js; tomados de RainbowKit)
  const LOGO_EXTRA = {"rabby": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2028%2028%22%3E%3Cg%20clip-path%3D%22url(%23a)%22%3E%3Cpath%20fill%3D%22%238697FF%22%20d%3D%22M28%200H0v28h28V0Z%22%2F%3E%3Cpath%20fill%3D%22url(%23b)%22%20d%3D%22M22.54%2015.078c.677-1.514-2.673-5.744-5.874-7.506-2.017-1.365-4.12-1.178-4.545-.579-.935%201.316%203.094%202.43%205.788%203.731-.58.252-1.125.703-1.446%201.28-1.004-1.096-3.209-2.04-5.796-1.28-1.743.513-3.191%201.721-3.751%203.546a1.097%201.097%200%201%200-.445%202.1c.112%200%20.463-.075.463-.075l5.612.041c-2.244%203.56-4.018%204.081-4.018%204.698s1.697.45%202.335.22c3.05-1.1%206.327-4.531%206.89-5.519%202.36.295%204.345.33%204.786-.657Z%22%2F%3E%3Cpath%20fill%3D%22url(%23c)%22%20fill-rule%3D%22evenodd%22%20d%3D%22m17.885%2010.713.025.01c.125-.049.105-.233.07-.378-.078-.333-1.438-1.676-2.715-2.277-1.743-.82-3.025-.777-3.212-.398.356.726%201.998%201.408%203.714%202.12.723.3%201.46.606%202.118.923Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3Cpath%20fill%3D%22url(%23d)%22%20fill-rule%3D%22evenodd%22%20d%3D%22M15.701%2018.036a10.296%2010.296%200%200%200-1.2-.37c.482-.862.583-2.138.128-2.945-.639-1.133-1.44-1.736-3.304-1.736-1.024%200-3.783.346-3.832%202.648-.005.242%200%20.464.017.667l5.036.037a17.264%2017.264%200%200%201-1.871%202.483c.669.172%201.221.316%201.728.448.48.125.92.24%201.38.357a21.003%2021.003%200%200%200%201.918-1.59Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3Cpath%20fill%3D%22url(%23e)%22%20d%3D%22M6.848%2016.063c.206%201.75%201.2%202.435%203.232%202.638%202.032.203%203.197.067%204.749.208%201.296.118%202.453.778%202.882.55.386-.205.17-.947-.347-1.423-.67-.617-1.597-1.046-3.229-1.199.325-.89.234-2.138-.27-2.817-.731-.982-2.079-1.426-3.785-1.232-1.782.202-3.49%201.08-3.232%203.275Z%22%2F%3E%3C%2Fg%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22b%22%20x1%3D%2210.464%22%20x2%3D%2222.394%22%20y1%3D%2213.737%22%20y2%3D%2217.12%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23fff%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22c%22%20x1%3D%2220.386%22%20x2%3D%2211.779%22%20y1%3D%2213.509%22%20y2%3D%224.879%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%237258DC%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23797DEA%22%20stop-opacity%3D%220%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22d%22%20x1%3D%2215.94%22%20x2%3D%227.673%22%20y1%3D%2218.337%22%20y2%3D%2213.584%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%237461EA%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23BFC2FF%22%20stop-opacity%3D%220%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22e%22%20x1%3D%2211.177%22%20x2%3D%2216.765%22%20y1%3D%2213.648%22%20y2%3D%2220.749%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%22.984%22%20stop-color%3D%22%23D5CEFF%22%2F%3E%3C%2FlinearGradient%3E%3CclipPath%20id%3D%22a%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M0%200h28v28H0z%22%2F%3E%3C%2FclipPath%3E%3C%2Fdefs%3E%3C%2Fsvg%3E", "magicEden": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20800%22%3E%3Cpath%20fill%3D%22%23070B34%22%20d%3D%22M0%200h800v800H0V0Z%22%2F%3E%3Cpath%20fill%3D%22%23F20074%22%20d%3D%22M231.256%20270.826c6.298%205.742%2012.37%2011.679%2018.372%2017.727%201.706%201.719%203.415%203.435%205.126%205.15%203.626%203.637%207.249%207.28%2010.871%2010.922%204.21%204.234%208.423%208.467%2012.64%2012.696a3711.51%203711.51%200%200%201%205.004%205.036c4.85%204.872%209.737%209.63%2014.966%2014.098%202.918%202.554%205.608%205.322%208.312%208.1l3.558%203.61c1.836%201.866%203.669%203.735%205.497%205.608%201.787%201.83%203.584%203.65%205.382%205.47l1.651%201.707c2.724%202.741%204.57%204.333%208.365%205.05l.734-1.621c1.595-2.998%203.529-5.698%205.516-8.442l1.317-1.83c6.075-8.42%2012.26-16.76%2018.433-25.107%206.876-9.303%2013.737-18.614%2020.5-28l3.203-4.426c2.323-3.212%204.619-6.442%206.906-9.68l3.641-5.082%201.643-2.357C398.88%20271.161%20405.78%20265.175%20416%20263c6.03-.458%2012.045-.442%2018.09-.436l5.501-.03c4.963-.027%209.926-.034%2014.889-.036%203.106-.002%206.211-.008%209.317-.016%2010.848-.028%2021.697-.04%2032.545-.038%2010.09.002%2020.18-.03%2030.27-.077%208.682-.04%2017.364-.055%2026.047-.054%205.177.001%2010.354-.007%2015.53-.04%204.872-.028%209.743-.028%2014.615-.007%201.78.004%203.56-.003%205.34-.022%2013.189-.126%2022.483%201.918%2032.856%2010.756%206.503%208.896%209.049%2017.009%208%2028-1.775%208.755-6.222%2015.257-13%2021-9.275%205.858-17.307%207.139-28.044%207.205l-3.018.03c-3.279.032-6.558.057-9.836.081l-6.835.063c-5.988.055-11.975.105-17.962.153-6.114.05-12.227.106-18.34.161-11.988.108-23.977.21-35.965.307%201.582%204.258%203.412%206.822%206.562%2010.125%203.477%203.721%206.803%207.469%2010%2011.437%202.84%203.522%205.75%206.921%208.813%2010.25%2011.073%2012.241%2021.22%2023.89%2020.96%2041.313C541.12%20413.541%20535.777%20421.368%20529%20429a2133.148%202133.148%200%200%200-3.877%204.614c-3.867%204.609-7.792%209.169-11.717%2013.73-1.998%202.324-3.99%204.655-5.98%206.988a734.91%20734.91%200%200%201-2.83%203.29%20629.636%20629.636%200%200%200-3.846%204.503l-2.203%202.57c-1.919%202.396-1.919%202.396-1.547%206.305l3.919.011c12.211.037%2024.423.095%2036.634.173%206.277.04%2012.554.072%2018.832.087%206.062.015%2012.125.05%2018.187.097%202.308.015%204.617.023%206.925.024%203.244.002%206.486.03%209.73.062l2.865-.015c9.907.153%2018.67%203.665%2025.943%2010.463%206.05%206.248%208.278%2011.894%209.402%2020.41-1.286%2010.845-4.897%2019.44-12.812%2026.938-7.221%204.814-13.075%206.868-21.783%206.897l-2.187.011c-2.42.011-4.839.015-7.259.019l-5.204.02c-5.7.02-11.399.031-17.098.041l-5.895.013c-9.235.019-18.47.033-27.705.041-10.643.01-21.287.036-31.93.077-8.237.03-16.473.045-24.71.048-4.914.002-9.828.011-14.743.036-4.629.024-9.258.028-13.887.018-1.692%200-3.383.005-5.075.02-12.98.1-25.384-.966-35.149-10.491-6.527-7.416-8.571-13.407-8.355-23.332%201.817-18.754%2019.567-36.96%2030.355-51.668l3.371-4.617a1435.342%201435.342%200%200%201%2021.036-28.003%20650.426%20650.426%200%200%200%203.733-4.912c1.3-1.726%202.622-3.437%203.958-5.135l2-2.642%201.832-2.365c1.365-2.323%201.365-2.323.394-4.949-1.717-3.083-3.949-5.488-6.387-8.002-4.373-4.637-8.474-9.404-12.472-14.371-3.562-4.34-7.253-8.564-10.949-12.79-2.92-3.346-5.773-6.72-8.516-10.214-2.647.368-3.807.803-5.7%202.74l-1.698%202.283-1.93%202.565-2.047%202.787-2.148%202.873c-2.171%202.909-4.326%205.829-6.477%208.752l-1.856%202.517a3757.548%203757.548%200%200%200-6.852%209.315c-5.018%206.836-10.158%2013.575-15.313%2020.308-4.561%205.967-9.04%2011.99-13.479%2018.047-1.682%202.28-3.365%204.557-5.049%206.835a431.272%20431.272%200%200%200-3.748%205.208c-5.08%206.879-11.178%2011.166-19.703%2012.77-13.241%201.017-21.832-1.495-32-10-4.004-3.73-7.818-7.657-11.65-11.56a1716%201716%200%200%200-5.802-5.875%206465.8%206465.8%200%200%201-16.478-16.687c-3.366-3.42-6.742-6.83-10.123-10.233a924.386%20924.386%200%200%201-3.842-3.902%20915.74%20915.74%200%200%200-5.362-5.422l-1.59-1.643c-3.357-3.341-3.357-3.341-8.153-3.678l-.007%201.909c-.06%2015.358-.135%2030.717-.229%2046.076-.045%207.427-.084%2014.855-.11%2022.282-.023%206.477-.057%2012.955-.103%2019.432-.024%203.427-.042%206.853-.049%2010.28-.01%203.834-.037%207.668-.07%2011.503l.005%203.405c-.153%2012.885-3.972%2022.247-12.562%2031.8-8.35%207.736-16.863%2010.148-27.998%209.958-6.545-.337-11.53-1.729-16.877-5.645l-1.938-1.246c-6.44-4.678-9.604-12.38-12.062-19.754-.1-2.88-.143-5.735-.14-8.614l-.01-2.699c-.008-2.996-.01-5.992-.011-8.988l-.015-6.43c-.013-5.833-.02-11.666-.024-17.5l-.012-10.931c-.013-11.4-.023-22.8-.027-34.2-.004-13.161-.022-26.322-.05-39.483-.023-10.17-.033-20.341-.034-30.512-.001-6.075-.007-12.15-.025-18.225-.016-5.718-.018-11.435-.01-17.153.001-2.096-.003-4.192-.013-6.287-.013-2.868-.007-5.734.004-8.602l-.025-2.496c.089-10.505%204.101-19.22%2011.244-26.86%2014.024-13.103%2034.533-13.23%2049.404-1.194Z%22%2F%3E%3C%2Fsvg%3E", "ronin": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22none%22%3E%3Cpath%20fill%3D%22url(%23a)%22%20d%3D%22M0%200h100v100H0z%22%2F%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M75.984%2037.962V21.32A8.32%208.32%200%200%200%2067.667%2013h-35.35A8.316%208.316%200%200%200%2024%2021.32v48.286a8.32%208.32%200%200%200%203.12%206.49l12.87%2010.338a1.04%201.04%200%200%200%201.695-.811v-34.14a1.04%201.04%200%200%201%201.04-1.04h9.357a6.237%206.237%200%200%201%206.238%206.24v28.94a1.04%201.04%200%200%200%201.69.811l12.87-10.338a8.32%208.32%200%200%200%203.12-6.49V54.603a8.32%208.32%200%200%200-8.317-8.32%208.316%208.316%200%200%200%208.301-8.321m-23.912%204.16h-9.358a1.04%201.04%200%200%201-1.04-1.04V22.36a1.04%201.04%200%200%201%201.04-1.04H57.27a1.04%201.04%200%200%201%201.04%201.04v13.52a6.24%206.24%200%200%201-6.238%206.241%22%2F%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22a%22%20x1%3D%22-3%22%20x2%3D%22104%22%20y1%3D%22103%22%20y2%3D%220%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%230606B7%22%2F%3E%3Cstop%20offset%3D%22.625%22%20stop-color%3D%22%23137CCA%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2318A5D1%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2320A8D0%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3C%2Fsvg%3E"};
  const APPS = [
    { id: "metamask", nombre: "MetaMask", logo: "metaMask", nativo: "metamask://",
      navegador: () => "https://metamask.app.link/dapp/" + AQUI.replace(/^https?:\/\//, "") },
    // Phantom no usa WalletConnect para Ethereum: abre esta pagina en su navegador
    { id: "phantom", nombre: "Phantom", icono: PHANTOM,
      navegador: () => "https://phantom.app/ul/browse/" + enc(AQUI) + "?ref=" + enc(location.origin) },
    { id: "trust", nombre: "Trust Wallet", logo: "trust", nativo: "trust://",
      navegador: () => "https://link.trustwallet.com/open_url?coin_id=60&url=" + enc(AQUI) },
    { id: "binance", nombre: "Binance Wallet", logo: "binance", navegador: binance },
    { id: "coinbase", nombre: "Coinbase Wallet", logo: "coinbase",
      navegador: () => "https://go.cb-w.com/dapp?cb_url=" + enc(AQUI) },
    { id: "okx", nombre: "OKX Wallet", logo: "okx",
      navegador: () => "https://www.okx.com/download?deeplink=" + enc("okx://wallet/dapp/url?dappUrl=" + enc(AQUI)) },
    // mas wallets con navegador propio: abren esta pagina dentro de su app
    { id: "bitget", nombre: "Bitget Wallet", logo: "bitget", navegador: () => "https://bkcode.vip?action=dapp&url=" + enc(AQUI) },
    { id: "tokenpocket", nombre: "TokenPocket", logo: "tokenPocket",
      navegador: () => "tpdapp://open?params=" + enc(JSON.stringify({ url: AQUI, chain: "ETH", source: "Sectora" })) },
    { id: "imtoken", nombre: "imToken", logo: "imToken", navegador: () => "imtokenv2://navigate/DappView?url=" + enc(AQUI) },
    { id: "rainbow", nombre: "Rainbow", logo: "rainbow", nativo: "rainbow://",
      navegador: () => "https://rnbwapp.com/dapp?url=" + enc(AQUI) },
    { id: "rabby", nombre: "Rabby", icono: LOGO_EXTRA.rabby, navegador: () => "https://go.rabby.io/mobile/index.html?_cmd=open-dapp&dapp=" + enc(AQUI) },
    { id: "magiceden", nombre: "Magic Eden", icono: LOGO_EXTRA.magicEden, navegador: () => "magiceden://browser/" + enc(AQUI) },
    { id: "ronin", nombre: "Ronin Wallet", icono: LOGO_EXTRA.ronin, navegador: () => "roninwallet://in_app_browser?url=" + enc(AQUI) },
  ];
  const conWC = (a) => !!a.nativo;
  /* TEMPORAL (30 oct 2026): mientras Reown quita la marca de sectoraorg.com, no se conecta por WalletConnect:
     en el movil sin wallet (Chrome, Safari...) se abre esta pagina dentro de la app de la wallet, donde no
     sale ninguna alerta, y en el ordenador no hay QR (extensiones y el enlace para el telefono). WalletConnect
     queda solo para las wallets sin navegador propio ni extension (Tangem, Ledger Live, Safe...), con aviso previo.
     Para volver a como estaba: SOLO_APP = false. */
  const SOLO_APP = true;
  /* para el ordenador: las que no estan instaladas (web: su pagina oficial de descarga);
     sin web, las que son solo app del movil. m reconoce la extension ya detectada */
  const INSTALAR = [
    { id: "i-metamask", nombre: "MetaMask", logo: "metaMask", m: /metamask/i, web: "https://metamask.io/download/" },
    { id: "i-phantom", nombre: "Phantom", icono: PHANTOM, m: /phantom/i, web: "https://phantom.com/download" },
    { id: "i-trust", nombre: "Trust Wallet", logo: "trust", m: /trust/i, web: "https://trustwallet.com/download" },
    { id: "i-binance", nombre: "Binance Wallet", logo: "binance", m: /binance/i },
    { id: "i-coinbase", nombre: "Coinbase Wallet", logo: "coinbase", m: /coinbase/i, web: "https://www.coinbase.com/wallet/downloads" },
    { id: "i-okx", nombre: "OKX Wallet", logo: "okx", m: /okx/i, web: "https://www.okx.com/web3" },
    { id: "i-bitget", nombre: "Bitget Wallet", logo: "bitget", m: /bitget/i, web: "https://web3.bitget.com/" },
    { id: "i-tokenpocket", nombre: "TokenPocket", logo: "tokenPocket", m: /tokenpocket/i },
    { id: "i-imtoken", nombre: "imToken", logo: "imToken", m: /imtoken/i },
    { id: "i-rainbow", nombre: "Rainbow", logo: "rainbow", m: /rainbow/i, web: "https://rainbow.me/download" },
    { id: "i-rabby", nombre: "Rabby", icono: LOGO_EXTRA.rabby, m: /rabby/i, web: "https://rabby.io/" },
  ];
  const ENLACE = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" fill="#13213d"/><path d="M12.2 15.8l3.6-3.6M11 13.4l-1.6 1.6a2.6 2.6 0 0 0 3.6 3.6l1.6-1.6M17 14.6l1.6-1.6a2.6 2.6 0 0 0-3.6-3.6L13.4 11" fill="none" stroke="#4d8dff" stroke-width="1.6" stroke-linecap="round"/></svg>');
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
  let wcAbierto = false;    // la persona abrio el panel de WalletConnect (Tangem, Ledger Live, Safe...)
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

  // el estado va arriba y, con el panel de WalletConnect abierto, tambien junto a su QR
  function estado(texto, error) {
    if (!caja) return;
    caja.querySelectorAll(".wpick-state").forEach((e) => {
      e.textContent = "";
      if (!error) e.appendChild(nodo("i"));
      e.appendChild(document.createTextNode(texto));
      e.classList.toggle("err", !!error);
    });
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

  // copia esta pagina para abrirla en el navegador de la wallet (sin WalletConnect)
  function copiaAqui() {
    const ok = () => estado("Link copied. Open your wallet app, go to its browser and paste it.");
    (navigator.clipboard ? navigator.clipboard.writeText(AQUI) : Promise.reject()).then(ok, () => estado(AQUI));
  }

  // fila que copia el enlace de esta pagina, con su boton "Copy link" a la vista
  function filaCopiar(nombre) {
    const f = fila("button", { id: "otra", nombre }, "Copy the link and open it in your wallet’s browser", { icono: ENLACE });
    const b = nodo("span", "wpick-copybtn mono", "Copy link");
    f.querySelector(".wpick-go").remove();
    f.querySelector(".wpick-txt").appendChild(b);   // debajo del texto, que se lee entero
    f.addEventListener("click", () => {
      copiaAqui();
      b.textContent = "Copied ✓";
      setTimeout(() => { b.textContent = "Copy link"; }, 2000);
    });
    return f;
  }

  /* Mientras dura SOLO_APP, WalletConnect solo para las wallets sin navegador propio ni extension (Tangem,
     Ledger Live, Safe...): primero un aviso; luego el QR en el ordenador y el enlace para pegar en el movil. */
  function filaSoloWC(qr) {
    const f = fila("button", { id: "solo-wc", nombre: "Tangem, Ledger Live, Safe…", logo: "walletConnect" },
      "Wallets without their own browser · WalletConnect");
    f.addEventListener("click", () => { wcAbierto = true; panelWC(qr); });
    return f;
  }

  function panelWC(qr) {
    qr.textContent = "";
    const x = nodo("button", "wpick-wcx mono", "✕ Close WalletConnect");
    x.type = "button";
    x.addEventListener("click", () => { wcAbierto = false; abrir(); });   // cierra el panel; el resto de la ventana sigue igual
    qr.appendChild(x);
    qr.appendChild(nodo("p", "wpick-warn", "Only for wallets without their own browser (Tangem, Ledger Live, Safe…). " +
      "While WalletConnect reviews our domain, your wallet may show a security warning by mistake. " +
      "Sectora and its contracts are verified on Etherscan, and connecting only reads your address."));
    qr.appendChild(nodo("p", "wpick-state"));
    if (MOVIL) qr.appendChild(copiarBoton());   // en el telefono se copia el enlace: el boton va antes del QR
    qr.appendChild(nodo("div", "wpick-qrbox"));
    qr.appendChild(nodo("p", "wpick-qrtxt", "Scan this QR code with your wallet, or copy the connection link and paste it in its WalletConnect section."));
    if (!MOVIL) qr.appendChild(copiarBoton());
    qr.dataset.on = "1";
    pedirConexionWC();
    if (qr.isConnected) requestAnimationFrame(() => qr.scrollIntoView({ block: "nearest", behavior: "smooth" }));
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
      const f = fila("a", a, "Opens this page in the app", { icono: a.icono });
      f.href = a.navegador();
      f.rel = "noopener";
      lista.appendChild(f);
    });
    // cualquier otra wallet con navegador: copiar el enlace y abrirlo ahi (sin WalletConnect)
    lista.appendChild(filaCopiar("Another wallet"));
    const qr = nodo("div", "wpick-qr");
    lista.appendChild(filaSoloWC(qr));
    caja.appendChild(lista);
    caja.appendChild(qr);
    if (wcAbierto) panelWC(qr);
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
      const f = fila("a", a, conWC(a) ? "Approve in the app" : "Opens this page in the app", { icono: a.icono });
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

    if (SOLO_APP) {
      // mientras dura SOLO_APP, sin QR (WalletConnect): todas las wallets, siempre. Las no instaladas llevan a
      // su extension; las que solo son app del movil y la ultima fila copian el enlace para abrirlo en el telefono
      if (!ext.length) estado("To connect here, install a wallet extension. On your phone, open this page inside your wallet app.");
      else lista.appendChild(nodo("div", "wpick-sec mono", "Other compatible wallets"));
      INSTALAR.filter((w) => !ext.some((e) => w.m.test(e.nombre))).forEach((w) => {
        if (w.web) {
          const f = fila("a", w, "Install the browser extension", { icono: w.icono });
          f.href = w.web;
          f.target = "_blank";
          f.rel = "noopener";
          lista.appendChild(f);
        } else {
          const f = fila("button", w, "Phone app · copy the link and open it there", { icono: w.icono });
          f.addEventListener("click", copiaAqui);
          lista.appendChild(f);
        }
      });
      lista.appendChild(filaCopiar("Wallet on your phone"));
      const qr = nodo("div", "wpick-qr");
      lista.appendChild(filaSoloWC(qr));
      caja.appendChild(qr);
      if (wcAbierto) panelWC(qr);
      return;
    }

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
    if (!caja || SOLO_APP) return [];   // con SOLO_APP ninguna fila de wallet pasa por WalletConnect
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
    estado(MOVIL ? (SOLO_APP ? "Copy the connection link, open your wallet, go to WalletConnect and paste it. Then come back to this tab."
                             : "Tap your wallet app. Approve the connection there, then come back to this tab.")
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
      if (!SOLO_APP || wcAbierto) pintarUri();
    };
    p.on("display_uri", alUri);
    try {
      await p.connect();
      entregar(p);
    } catch (e) {
      // caducado (5 min) o rechazado en la app: se prepara otro enlace si
      // el selector sigue abierto
      uri = "";
      if (caja && !caja.hidden && (!SOLO_APP || wcAbierto)) {
        const rechazo = /reject|denied|cancel/i.test((e && e.message) || "");
        estado(rechazo ? "The connection was rejected in the wallet." : "The link expired.", true);
        caja.querySelectorAll(".wpick-state").forEach((e) => {
          const otra = nodo("button", "wpick-retry mono", "Try again");
          otra.type = "button";
          otra.addEventListener("click", () => { abrir(); });
          e.appendChild(otra);
        });
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
