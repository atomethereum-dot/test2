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
  var DASH = "/dashboard.html#plan";
  var STAKE = "/staking/";
  var MM = "https://metamask.app.link/dapp/sectoraorg.com/airdrop/";
  /* sin wallet en este navegador: en el movil, abrir esta pagina dentro de la app de cada wallet; en el
     ordenador, su pagina oficial de descarga */
  var MOVIL = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "") || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // logos: los mismos del Dashboard y del staking (dashboard-wallet-logos.js) y el de Phantom aqui mismo
  var PHANTOM = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" fill="#ab9ff2"/><path d="M7 21.5V13a7 7 0 0 1 14 0v8.5l-2.33-1.75-2.34 1.75L14 19.75l-2.33 1.75-2.34-1.75z" fill="#fff"/><ellipse cx="11.6" cy="13.2" rx="1.15" ry="1.7" fill="#ab9ff2"/><ellipse cx="16.4" cy="13.2" rx="1.15" ry="1.7" fill="#ab9ff2"/></svg>');
  var KEY = { "MetaMask": "metaMask", "Trust Wallet": "trust", "Binance Wallet": "binance", "Coinbase Wallet": "coinbase", "OKX Wallet": "okx",
    "Bitget Wallet": "bitget", "TokenPocket": "tokenPocket", "imToken": "imToken", "Rainbow": "rainbow" };
  var WT = {
    en: ["Opens this page in the app", "Download"], es: ["Abre esta página en la app", "Descargar"], pt: ["Abre esta página no app", "Baixar"],
    fr: ["Ouvre cette page dans l’app", "Télécharger"], de: ["Öffnet diese Seite in der App", "Herunterladen"], ru: ["Открывает эту страницу в приложении", "Скачать"],
    zh: ["在 App 中打开此页面", "下载"], ja: ["アプリでこのページを開きます", "ダウンロード"], ko: ["앱에서 이 페이지를 엽니다", "다운로드"],
    ar: ["يفتح هذه الصفحة في التطبيق", "تنزيل"], hi: ["यह पेज ऐप में खोलता है", "डाउनलोड करें"]
  };
  var logosPedidos = false;
  function pideLogos() {
    if (window.SECTORA_WALLET_LOGOS || logosPedidos) return;
    logosPedidos = true;
    var sc = document.createElement("script"); sc.src = "/dashboard-wallet-logos.js";
    sc.onload = ponLogos;
    document.head.appendChild(sc);
  }
  // los logos son SVG en data URI con comillas: se ponen por propiedad del DOM, nunca dentro del HTML
  function ponLogos() {
    var L0 = window.SECTORA_WALLET_LOGOS; if (!L0) return;
    document.querySelectorAll(".el-wl [data-logo]").forEach(function (sp) {
      var src = L0[sp.getAttribute("data-logo")]; if (!src) return;
      var im = document.createElement("img"); im.alt = ""; im.src = src; sp.replaceWith(im);
    });
  }
  // logos oficiales de Rabby, Magic Eden y Ronin (no estan en dashboard-wallet-logos.js; tomados de RainbowKit)
  var LOGO_EXTRA = {"Rabby": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2028%2028%22%3E%3Cg%20clip-path%3D%22url(%23a)%22%3E%3Cpath%20fill%3D%22%238697FF%22%20d%3D%22M28%200H0v28h28V0Z%22%2F%3E%3Cpath%20fill%3D%22url(%23b)%22%20d%3D%22M22.54%2015.078c.677-1.514-2.673-5.744-5.874-7.506-2.017-1.365-4.12-1.178-4.545-.579-.935%201.316%203.094%202.43%205.788%203.731-.58.252-1.125.703-1.446%201.28-1.004-1.096-3.209-2.04-5.796-1.28-1.743.513-3.191%201.721-3.751%203.546a1.097%201.097%200%201%200-.445%202.1c.112%200%20.463-.075.463-.075l5.612.041c-2.244%203.56-4.018%204.081-4.018%204.698s1.697.45%202.335.22c3.05-1.1%206.327-4.531%206.89-5.519%202.36.295%204.345.33%204.786-.657Z%22%2F%3E%3Cpath%20fill%3D%22url(%23c)%22%20fill-rule%3D%22evenodd%22%20d%3D%22m17.885%2010.713.025.01c.125-.049.105-.233.07-.378-.078-.333-1.438-1.676-2.715-2.277-1.743-.82-3.025-.777-3.212-.398.356.726%201.998%201.408%203.714%202.12.723.3%201.46.606%202.118.923Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3Cpath%20fill%3D%22url(%23d)%22%20fill-rule%3D%22evenodd%22%20d%3D%22M15.701%2018.036a10.296%2010.296%200%200%200-1.2-.37c.482-.862.583-2.138.128-2.945-.639-1.133-1.44-1.736-3.304-1.736-1.024%200-3.783.346-3.832%202.648-.005.242%200%20.464.017.667l5.036.037a17.264%2017.264%200%200%201-1.871%202.483c.669.172%201.221.316%201.728.448.48.125.92.24%201.38.357a21.003%2021.003%200%200%200%201.918-1.59Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3Cpath%20fill%3D%22url(%23e)%22%20d%3D%22M6.848%2016.063c.206%201.75%201.2%202.435%203.232%202.638%202.032.203%203.197.067%204.749.208%201.296.118%202.453.778%202.882.55.386-.205.17-.947-.347-1.423-.67-.617-1.597-1.046-3.229-1.199.325-.89.234-2.138-.27-2.817-.731-.982-2.079-1.426-3.785-1.232-1.782.202-3.49%201.08-3.232%203.275Z%22%2F%3E%3C%2Fg%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22b%22%20x1%3D%2210.464%22%20x2%3D%2222.394%22%20y1%3D%2213.737%22%20y2%3D%2217.12%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23fff%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22c%22%20x1%3D%2220.386%22%20x2%3D%2211.779%22%20y1%3D%2213.509%22%20y2%3D%224.879%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%237258DC%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23797DEA%22%20stop-opacity%3D%220%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22d%22%20x1%3D%2215.94%22%20x2%3D%227.673%22%20y1%3D%2218.337%22%20y2%3D%2213.584%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%237461EA%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23BFC2FF%22%20stop-opacity%3D%220%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22e%22%20x1%3D%2211.177%22%20x2%3D%2216.765%22%20y1%3D%2213.648%22%20y2%3D%2220.749%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%22.984%22%20stop-color%3D%22%23D5CEFF%22%2F%3E%3C%2FlinearGradient%3E%3CclipPath%20id%3D%22a%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M0%200h28v28H0z%22%2F%3E%3C%2FclipPath%3E%3C%2Fdefs%3E%3C%2Fsvg%3E", "Magic Eden": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20800%22%3E%3Cpath%20fill%3D%22%23070B34%22%20d%3D%22M0%200h800v800H0V0Z%22%2F%3E%3Cpath%20fill%3D%22%23F20074%22%20d%3D%22M231.256%20270.826c6.298%205.742%2012.37%2011.679%2018.372%2017.727%201.706%201.719%203.415%203.435%205.126%205.15%203.626%203.637%207.249%207.28%2010.871%2010.922%204.21%204.234%208.423%208.467%2012.64%2012.696a3711.51%203711.51%200%200%201%205.004%205.036c4.85%204.872%209.737%209.63%2014.966%2014.098%202.918%202.554%205.608%205.322%208.312%208.1l3.558%203.61c1.836%201.866%203.669%203.735%205.497%205.608%201.787%201.83%203.584%203.65%205.382%205.47l1.651%201.707c2.724%202.741%204.57%204.333%208.365%205.05l.734-1.621c1.595-2.998%203.529-5.698%205.516-8.442l1.317-1.83c6.075-8.42%2012.26-16.76%2018.433-25.107%206.876-9.303%2013.737-18.614%2020.5-28l3.203-4.426c2.323-3.212%204.619-6.442%206.906-9.68l3.641-5.082%201.643-2.357C398.88%20271.161%20405.78%20265.175%20416%20263c6.03-.458%2012.045-.442%2018.09-.436l5.501-.03c4.963-.027%209.926-.034%2014.889-.036%203.106-.002%206.211-.008%209.317-.016%2010.848-.028%2021.697-.04%2032.545-.038%2010.09.002%2020.18-.03%2030.27-.077%208.682-.04%2017.364-.055%2026.047-.054%205.177.001%2010.354-.007%2015.53-.04%204.872-.028%209.743-.028%2014.615-.007%201.78.004%203.56-.003%205.34-.022%2013.189-.126%2022.483%201.918%2032.856%2010.756%206.503%208.896%209.049%2017.009%208%2028-1.775%208.755-6.222%2015.257-13%2021-9.275%205.858-17.307%207.139-28.044%207.205l-3.018.03c-3.279.032-6.558.057-9.836.081l-6.835.063c-5.988.055-11.975.105-17.962.153-6.114.05-12.227.106-18.34.161-11.988.108-23.977.21-35.965.307%201.582%204.258%203.412%206.822%206.562%2010.125%203.477%203.721%206.803%207.469%2010%2011.437%202.84%203.522%205.75%206.921%208.813%2010.25%2011.073%2012.241%2021.22%2023.89%2020.96%2041.313C541.12%20413.541%20535.777%20421.368%20529%20429a2133.148%202133.148%200%200%200-3.877%204.614c-3.867%204.609-7.792%209.169-11.717%2013.73-1.998%202.324-3.99%204.655-5.98%206.988a734.91%20734.91%200%200%201-2.83%203.29%20629.636%20629.636%200%200%200-3.846%204.503l-2.203%202.57c-1.919%202.396-1.919%202.396-1.547%206.305l3.919.011c12.211.037%2024.423.095%2036.634.173%206.277.04%2012.554.072%2018.832.087%206.062.015%2012.125.05%2018.187.097%202.308.015%204.617.023%206.925.024%203.244.002%206.486.03%209.73.062l2.865-.015c9.907.153%2018.67%203.665%2025.943%2010.463%206.05%206.248%208.278%2011.894%209.402%2020.41-1.286%2010.845-4.897%2019.44-12.812%2026.938-7.221%204.814-13.075%206.868-21.783%206.897l-2.187.011c-2.42.011-4.839.015-7.259.019l-5.204.02c-5.7.02-11.399.031-17.098.041l-5.895.013c-9.235.019-18.47.033-27.705.041-10.643.01-21.287.036-31.93.077-8.237.03-16.473.045-24.71.048-4.914.002-9.828.011-14.743.036-4.629.024-9.258.028-13.887.018-1.692%200-3.383.005-5.075.02-12.98.1-25.384-.966-35.149-10.491-6.527-7.416-8.571-13.407-8.355-23.332%201.817-18.754%2019.567-36.96%2030.355-51.668l3.371-4.617a1435.342%201435.342%200%200%201%2021.036-28.003%20650.426%20650.426%200%200%200%203.733-4.912c1.3-1.726%202.622-3.437%203.958-5.135l2-2.642%201.832-2.365c1.365-2.323%201.365-2.323.394-4.949-1.717-3.083-3.949-5.488-6.387-8.002-4.373-4.637-8.474-9.404-12.472-14.371-3.562-4.34-7.253-8.564-10.949-12.79-2.92-3.346-5.773-6.72-8.516-10.214-2.647.368-3.807.803-5.7%202.74l-1.698%202.283-1.93%202.565-2.047%202.787-2.148%202.873c-2.171%202.909-4.326%205.829-6.477%208.752l-1.856%202.517a3757.548%203757.548%200%200%200-6.852%209.315c-5.018%206.836-10.158%2013.575-15.313%2020.308-4.561%205.967-9.04%2011.99-13.479%2018.047-1.682%202.28-3.365%204.557-5.049%206.835a431.272%20431.272%200%200%200-3.748%205.208c-5.08%206.879-11.178%2011.166-19.703%2012.77-13.241%201.017-21.832-1.495-32-10-4.004-3.73-7.818-7.657-11.65-11.56a1716%201716%200%200%200-5.802-5.875%206465.8%206465.8%200%200%201-16.478-16.687c-3.366-3.42-6.742-6.83-10.123-10.233a924.386%20924.386%200%200%201-3.842-3.902%20915.74%20915.74%200%200%200-5.362-5.422l-1.59-1.643c-3.357-3.341-3.357-3.341-8.153-3.678l-.007%201.909c-.06%2015.358-.135%2030.717-.229%2046.076-.045%207.427-.084%2014.855-.11%2022.282-.023%206.477-.057%2012.955-.103%2019.432-.024%203.427-.042%206.853-.049%2010.28-.01%203.834-.037%207.668-.07%2011.503l.005%203.405c-.153%2012.885-3.972%2022.247-12.562%2031.8-8.35%207.736-16.863%2010.148-27.998%209.958-6.545-.337-11.53-1.729-16.877-5.645l-1.938-1.246c-6.44-4.678-9.604-12.38-12.062-19.754-.1-2.88-.143-5.735-.14-8.614l-.01-2.699c-.008-2.996-.01-5.992-.011-8.988l-.015-6.43c-.013-5.833-.02-11.666-.024-17.5l-.012-10.931c-.013-11.4-.023-22.8-.027-34.2-.004-13.161-.022-26.322-.05-39.483-.023-10.17-.033-20.341-.034-30.512-.001-6.075-.007-12.15-.025-18.225-.016-5.718-.018-11.435-.01-17.153.001-2.096-.003-4.192-.013-6.287-.013-2.868-.007-5.734.004-8.602l-.025-2.496c.089-10.505%204.101-19.22%2011.244-26.86%2014.024-13.103%2034.533-13.23%2049.404-1.194Z%22%2F%3E%3C%2Fsvg%3E", "Ronin Wallet": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22none%22%3E%3Cpath%20fill%3D%22url(%23a)%22%20d%3D%22M0%200h100v100H0z%22%2F%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M75.984%2037.962V21.32A8.32%208.32%200%200%200%2067.667%2013h-35.35A8.316%208.316%200%200%200%2024%2021.32v48.286a8.32%208.32%200%200%200%203.12%206.49l12.87%2010.338a1.04%201.04%200%200%200%201.695-.811v-34.14a1.04%201.04%200%200%201%201.04-1.04h9.357a6.237%206.237%200%200%201%206.238%206.24v28.94a1.04%201.04%200%200%200%201.69.811l12.87-10.338a8.32%208.32%200%200%200%203.12-6.49V54.603a8.32%208.32%200%200%200-8.317-8.32%208.316%208.316%200%200%200%208.301-8.321m-23.912%204.16h-9.358a1.04%201.04%200%200%201-1.04-1.04V22.36a1.04%201.04%200%200%201%201.04-1.04H57.27a1.04%201.04%200%200%201%201.04%201.04v13.52a6.24%206.24%200%200%201-6.238%206.241%22%2F%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22a%22%20x1%3D%22-3%22%20x2%3D%22104%22%20y1%3D%22103%22%20y2%3D%220%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%230606B7%22%2F%3E%3Cstop%20offset%3D%22.625%22%20stop-color%3D%22%23137CCA%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2318A5D1%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2320A8D0%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3C%2Fsvg%3E"};
  function filaW(w) {
    var tw = WT[lang()] || WT.en, k = KEY[w[0]];
    var ico = w[0] === "Phantom" ? '<img alt="" src="' + PHANTOM + '">' : LOGO_EXTRA[w[0]] ? '<img alt="" src="' + LOGO_EXTRA[w[0]] + '">' : '<span class="ph" data-logo="' + (k || "") + '">' + w[0].slice(0, 1) + "</span>";
    return '<a href="' + esc(w[1]) + '" rel="noopener" data-w="' + esc(w[0]) + '">' + ico + "<span><b>" + w[0] + "</b><small>" + (MOVIL ? tw[0] : tw[1]) + "</small></span><i>→</i></a>";
  }
  function wallets() {
    var u = location.origin + "/airdrop/", e = encodeURIComponent;
    if (!MOVIL) return [["MetaMask", "https://metamask.io/download/"], ["Phantom", "https://phantom.com/download"], ["Trust Wallet", "https://trustwallet.com/download"],
      ["Coinbase Wallet", "https://www.coinbase.com/wallet/downloads"], ["OKX Wallet", "https://www.okx.com/web3"], ["Bitget Wallet", "https://web3.bitget.com/"],
      ["Rainbow", "https://rainbow.me/download"], ["Rabby", "https://rabby.io/"]];
    // enlace oficial de Binance (getDeepLink de @binance/w3w-utils): direccion y base64 tal cual; en Android su enlace
    // propio (bnc://), como hace la libreria de Binance, y el web en el iPhone
    var bnc = "bnc://app.binance.com/mp/app?appId=yFK5FCqYprrXDiVFbhyRx7&startPagePath=" + btoa("/pages/browser/index") +
      "&startPageQuery=" + btoa("url=" + u + "&defaultChainId=1");
    var bu = /Android/i.test(navigator.userAgent) ? bnc : "https://app.binance.com/en/download?_dp=" + btoa(bnc);
    return [["MetaMask", MM], ["Trust Wallet", "https://link.trustwallet.com/open_url?coin_id=60&url=" + e(u)], ["Phantom", "https://phantom.app/ul/browse/" + e(u) + "?ref=" + e(location.origin)],
      ["Binance Wallet", bu], ["Coinbase Wallet", "https://go.cb-w.com/dapp?cb_url=" + e(u)], ["OKX Wallet", "https://www.okx.com/download?deeplink=" + e("okx://wallet/dapp/url?dappUrl=" + e(u))],
      ["Bitget Wallet", "https://bkcode.vip?action=dapp&url=" + e(u)], ["TokenPocket", "tpdapp://open?params=" + e(JSON.stringify({ url: u, chain: "ETH", source: "Sectora" }))],
      ["imToken", "imtokenv2://navigate/DappView?url=" + e(u)], ["Rainbow", "https://rnbwapp.com/dapp?url=" + e(u)],
      ["Rabby", "https://go.rabby.io/mobile/index.html?_cmd=open-dapp&dapp=" + e(u)], ["Magic Eden", "magiceden://browser/" + e(u)],
      ["Ronin Wallet", "roninwallet://in_app_browser?url=" + e(u)]];
  }
  // la wallet del navegador: window.ethereum o, si solo esta Phantom, su proveedor de Ethereum
  function prov() { return window.ethereum || (window.phantom && window.phantom.ethereum) || null; }
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
      todo: "Activate your Hash Node", hw: "How to turn on your Hash Node", hw1: "Open the dashboard and connect this same wallet", hw2: "Press “Activate my node”: free, one click, no gas", hw3: "Your node turns on right away. With your staking, your airdrop counts", hwp: "Open the dashboard", hwn: "Go to your node", todos: "Activate your node in the dashboard with this same wallet. No node, no prize.", nu: "We couldn't check your Hash Node", nus: "The network didn't answer. Check again in a few seconds.", pzW: "At {l} level you had {g} SECT generated. Deposit your previous balance ({b} SECT in staking) and it runs again.", pzN: "Now: {l} level with {s} SECT in staking · prize {p} SECT.",
      node: "Activate my Hash Node", done: "Hash Node active", dones: "This wallet's node is on. You can close the tab or turn off your computer: it stays on. Just don't deactivate it.",
      paused: "Hash Node paused", pauseds: "Your node is registered but paused. While it's paused your count doesn't add up: turn it back on and it continues where it left off.", stake: "Stake my SECT", reopen: "Open the dashboard",
      rule: "100 in staking → 55 SECT (Scout) · 500 → 325 (Sentinel) · 1,000 → 750 (Guardian) · 4,000 → 3,600 (Titan) · more, in proportion, no maximum",
      foot: "We only read public data: no signature, no transaction, nothing leaves your wallet. Your level is checked once a day.",
      err: "We couldn't read the network. Try again in a moment.", bad: "That address doesn't look right.",
      rej: "The wallet didn't share an address.", close: "Close", other: "Check another wallet",
      acc: "You've earned {n} SECT", of: "{n} SECT when you complete your time", day: "Delivered at the launch of SectoraEVM", day2: "You complete your time on {d} · delivered on SectoraEVM", day3: "Each part is delivered on SectoraEVM when it completes its time · the next one completes on {d}", lock: "What you earn is secured on {d}", full: "Full prize complete · delivered on SectoraEVM",
      pre: "Starts adding up on opening day. Everyone has the same time to complete the prize, counted from the day they join. Deliveries start at the launch of SectoraEVM.", wait: "Your count will show as soon as the network confirms your staking.",
      demo: "Sample view", demos: "{n} SECT in staking · node on · day {d} of the count",
      rf: "Invite and earn", rfs: "You earn {n} SECT for every 1,000 SECT your invitees keep in staking. It's delivered with your airdrop on SectoraEVM.", rfl: "Your invite link", rfc: "Copy", rfok: "Copied", rfsh: "Share", rfn: "Invitees: {n} · {s} SECT in staking", rfb: "Your bonus: {n} SECT when they complete their time", rf0: "No invitees yet. Their invitation is confirmed automatically when they register their Hash Node through your link.", rfin: "To collect your bonus you must also be in the airdrop: SECT in staking and your Hash Node on.", rfrev: "Every invitation is reviewed before delivery: self-invites and fake wallets don't count.", rfby: "Invited by {a}", rfbys: "recorded on the network", rfp: "{a} invited you", rfps: "It's confirmed automatically when you register your Hash Node in the Dashboard. If you already have one, confirm it there with one click. Free, and you keep your whole airdrop.", rfgo: "Go to the Dashboard", rfban: "{a} invited you to Airdrop Genesis", rfbanb: "See how to join", rfpool: "Referral pool: 840,000 SECT, separate from the 7,000,000 SECT of the airdrop. If it runs out, it is shared in proportion." },
    es: { loc: "es-ES", k: "Sectora // Airdrop Genesis", pv: "Vista previa", h: "Tu airdrop",
      intro: "Conecta tu wallet para ver cuánto ganas en el airdrop.",
      connect: "Conectar wallet", nowallet: "¿No tienes wallet en este navegador?", openmm: "Abrir en MetaMask",
      or: "O revisa una dirección", check: "Revisar", reading: "Leyendo la red…",
      r1: "Wallet conectada", r2: "{n} SECT en staking", r2s: "Solo cuentan los SECT en staking · en tu wallet: {w}",
      win: "Ganas {n} SECT", wOn: "Mantén tu nodo encendido y tus SECT en staking hasta completar tu tiempo. Se entrega en SectoraEVM.", wOff: "Cuando tu Hash Node esté encendido con esta wallet.",
      lv0: "Fase 2 · registrado", lv1: "Nivel 1 · Scout", lv2: "Nivel 2 · Sentinel", lv3: "Nivel 3 · Guardian", lv4: "Nivel 4 · Titan",
      up0: "Con 100 SECT en staking pasas a Scout y ganas 55 SECT.", up1: "Con 500 SECT en staking pasas a Sentinel y ganas 325 SECT.", up2: "Con 1.000 SECT en staking pasas a Guardian y ganas 750 SECT.", up3: "Con 4.000 SECT en staking pasas a Titan y ganas 3.600 SECT.", up4: "Cada 1.000 SECT más en staking suman 900 SECT, sin máximo.", p2: "Beneficios de la fase 2", p2s: "Probar el nodo gratis te registra para la fase 2. Para ganar SECT ahora, pon 100 SECT en staking y pasas a Scout.",
      stk: "Staker detectado", stks: "Ya estás dentro: no tienes que hacer nada más. Solo enciende tu Hash Node con esta misma wallet y empiezas a participar.",
      todo: "Activa tu Hash Node", hw: "Cómo encender tu Hash Node", hw1: "Abre el panel y conecta esta misma wallet", hw2: "Pulsa «Activar mi nodo»: gratis, un clic y sin gas", hw3: "Tu nodo se enciende al momento. Con tu staking, tu airdrop cuenta", hwp: "Abrir el panel", hwn: "Ir a tu nodo", todos: "Activa tu nodo en el panel con esta misma wallet. Sin nodo no hay premio.", nu: "No pudimos comprobar tu Hash Node", nus: "La red no respondió. Vuelve a comprobar en unos segundos.", pzW: "En nivel {l} tenías {g} SECT generados. Deposita tu saldo anterior ({b} SECT en staking) y vuelve a correr.", pzN: "Ahora: nivel {l} con {s} SECT en staking · premio {p} SECT.",
      node: "Activar mi Hash Node", done: "Hash Node activo", dones: "El nodo de esta wallet está encendido. Puedes cerrar la pestaña o apagar tu computadora: sigue encendido. Solo no lo desactives.",
      paused: "Hash Node pausado", pauseds: "Tu nodo está registrado pero pausado. Mientras está en pausa tu conteo no suma: enciéndelo y sigue donde quedó.", stake: "Hacer staking de mis SECT", reopen: "Abrir el panel",
      rule: "100 en staking → 55 SECT (Scout) · 500 → 325 (Sentinel) · 1.000 → 750 (Guardian) · 4.000 → 3.600 (Titan) · más, en proporción, sin máximo",
      foot: "Solo leemos datos públicos: no hay firmas ni transacciones y nada sale de tu wallet. Tu nivel se revisa una vez al día.",
      err: "No pudimos leer la red. Prueba de nuevo en un momento.", bad: "Esa dirección no es válida.",
      rej: "La wallet no compartió una dirección.", close: "Cerrar", other: "Revisar otra wallet",
      acc: "Llevas {n} SECT", of: "{n} SECT al completar tu tiempo", day: "Se entrega en el lanzamiento de SectoraEVM", day2: "Completas tu tiempo el {d} · se entrega en SectoraEVM", day3: "Cada parte se entrega en SectoraEVM al completar su tiempo · la próxima se completa el {d}", lock: "Lo ganado queda asegurado el {d}", full: "Premio completo · se entrega en SectoraEVM",
      pre: "Empieza a sumar el día de la apertura. Todos tienen el mismo tiempo para completar el premio, contado desde que entran. Las entregas empiezan en el lanzamiento de SectoraEVM.", wait: "Tu conteo aparecerá en cuanto la red confirme tu staking.",
      demo: "Vista de ejemplo", demos: "{n} SECT en staking · nodo encendido · día {d} del conteo",
      rf: "Invita y gana", rfs: "Ganas {n} SECT por cada 1.000 SECT que tus invitados mantengan en staking. Se entrega con tu airdrop en SectoraEVM.", rfl: "Tu link de invitación", rfc: "Copiar", rfok: "Copiado", rfsh: "Compartir", rfn: "Invitados: {n} · {s} SECT en staking", rfb: "Tu bono: {n} SECT cuando completen su tiempo", rf0: "Aún no tienes invitados. Su invitación se confirma sola cuando registran su Hash Node con tu link.", rfin: "Para cobrar tu bono tú también tienes que estar en el airdrop: SECT en staking y tu Hash Node encendido.", rfrev: "Cada invitación se revisa antes de la entrega: las autoinvitaciones y las wallets falsas no cuentan.", rfby: "Te invitó {a}", rfbys: "registrado en la red", rfp: "{a} te invitó", rfps: "Se confirma sola al registrar tu Hash Node en el Dashboard. Si ya lo tenías, confírmala allí con un clic. Es gratis y conservas todo tu airdrop.", rfgo: "Ir al Dashboard", rfban: "{a} te invitó al Airdrop Genesis", rfbanb: "Ver cómo participar", rfpool: "Bolsa de referidos: 840.000 SECT, aparte de los 7.000.000 SECT del airdrop. Si se agota, se reparte en proporción." },
    pt: { loc: "pt-BR", k: "Sectora // Airdrop Genesis", pv: "Prévia", h: "Seu airdrop",
      intro: "Conecte sua carteira para ver quanto você ganha no airdrop.",
      connect: "Conectar carteira", nowallet: "Sem carteira neste navegador?", openmm: "Abrir no MetaMask",
      or: "Ou verifique um endereço", check: "Verificar", reading: "Lendo a rede…",
      r1: "Carteira conectada", r2: "{n} SECT em staking", r2s: "Só contam os SECT em staking · na sua carteira: {w}",
      win: "Você ganha {n} SECT", wOn: "Mantenha seu nó ligado e seus SECT em staking até completar seu tempo. Entregue na SectoraEVM.", wOff: "Quando o seu Hash Node estiver ligado com esta carteira.",
      lv0: "Fase 2 · registrado", lv1: "Nível 1 · Scout", lv2: "Nível 2 · Sentinel", lv3: "Nível 3 · Guardian", lv4: "Nível 4 · Titan",
      up0: "Com 100 SECT em staking você vira Scout e ganha 55 SECT.", up1: "Com 500 SECT em staking você vira Sentinel e ganha 325 SECT.", up2: "Com 1.000 SECT em staking você vira Guardian e ganha 750 SECT.", up3: "Com 4.000 SECT em staking você vira Titan e ganha 3.600 SECT.", up4: "Cada 1.000 SECT a mais em staking somam 900 SECT, sem máximo.", p2: "Benefícios da fase 2", p2s: "Testar o nó de graça registra você para a fase 2. Para ganhar SECT agora, coloque 100 SECT em staking e você vira Scout.",
      stk: "Staker detectado", stks: "Você já está dentro: não precisa fazer mais nada. Só ligue seu Hash Node com esta mesma carteira e você começa a participar.",
      todo: "Ative seu Hash Node", hw: "Como ligar seu Hash Node", hw1: "Abra o painel e conecte esta mesma carteira", hw2: "Toque em “Ativar meu nó”: grátis, um clique e sem gás", hw3: "Seu nó liga na hora. Com seu staking, seu airdrop conta", hwp: "Abrir o painel", hwn: "Ir ao seu nó", todos: "Ative seu nó no painel com esta mesma carteira. Sem nó não há prêmio.", nu: "Não conseguimos verificar seu Hash Node", nus: "A rede não respondeu. Verifique de novo em alguns segundos.", pzW: "No nível {l} você tinha {g} SECT gerados. Deposite seu saldo anterior ({b} SECT em staking) e volta a correr.", pzN: "Agora: nível {l} com {s} SECT em staking · prêmio {p} SECT.",
      node: "Ativar meu Hash Node", done: "Hash Node ativo", dones: "O nó desta carteira está ligado. Você pode fechar a aba ou desligar o computador: ele continua ligado. Só não o desative.",
      paused: "Hash Node pausado", pauseds: "Seu nó está registrado, mas pausado. Enquanto está pausado sua contagem não soma: ligue de novo e ela continua de onde parou.", stake: "Fazer staking dos meus SECT", reopen: "Abrir o painel",
      rule: "100 em staking → 55 SECT (Scout) · 500 → 325 (Sentinel) · 1.000 → 750 (Guardian) · 4.000 → 3.600 (Titan) · mais, em proporção, sem máximo",
      foot: "Só lemos dados públicos: sem assinatura, sem transação, nada sai da sua carteira. Seu nível é verificado uma vez por dia.",
      err: "Não conseguimos ler a rede. Tente de novo em um instante.", bad: "Esse endereço não é válido.",
      rej: "A carteira não compartilhou um endereço.", close: "Fechar", other: "Verificar outra carteira",
      acc: "Você já tem {n} SECT", of: "{n} SECT ao completar seu tempo", day: "Entregue no lançamento da SectoraEVM", day2: "Você completa seu tempo em {d} · entregue na SectoraEVM", day3: "Cada parte é entregue na SectoraEVM ao completar seu tempo · a próxima se completa em {d}", lock: "O que você ganha fica garantido em {d}", full: "Prêmio completo · entregue na SectoraEVM",
      pre: "Começa a somar no dia da abertura. Todos têm o mesmo tempo para completar o prêmio, contado desde que entram. As entregas começam no lançamento da SectoraEVM.", wait: "Sua contagem vai aparecer assim que a rede confirmar seu staking.",
      demo: "Visualização de exemplo", demos: "{n} SECT em staking · nó ligado · dia {d} da contagem",
      rf: "Convide e ganhe", rfs: "Você ganha {n} SECT a cada 1.000 SECT que seus convidados mantiverem em staking. É entregue com seu airdrop na SectoraEVM.", rfl: "Seu link de convite", rfc: "Copiar", rfok: "Copiado", rfsh: "Compartilhar", rfn: "Convidados: {n} · {s} SECT em staking", rfb: "Seu bônus: {n} SECT quando completarem o tempo", rf0: "Você ainda não tem convidados. O convite é confirmado automaticamente quando eles registram o Hash Node pelo seu link.", rfin: "Para receber seu bônus você também precisa estar no airdrop: SECT em staking e seu Hash Node ligado.", rfrev: "Cada convite é revisado antes da entrega: autoconvites e carteiras falsas não contam.", rfby: "Convidado por {a}", rfbys: "registrado na rede", rfp: "{a} convidou você", rfps: "É confirmado automaticamente quando você registra seu Hash Node no Dashboard. Se você já tinha um, confirme lá com um clique. É grátis e você mantém todo o seu airdrop.", rfgo: "Ir ao Dashboard", rfban: "{a} convidou você para o Airdrop Genesis", rfbanb: "Ver como participar", rfpool: "Bolsa de indicações: 840.000 SECT, separada dos 7.000.000 SECT do airdrop. Se acabar, é dividida proporcionalmente." }
  };
  function lang() {
    var l = (document.documentElement.lang || "en").slice(0, 2), P = window.SA_LANG_PACK && window.SA_LANG_PACK[l];
    if (!L[l] && P && P.elig) L[l] = P.elig;   // los otros idiomas llegan con el paquete del idioma (i18n/<idioma>.js)
    return L[l] ? l : "en";
  }
  function t(k, v) { var s = L[lang()][k]; if (v) for (var x in v) s = s.replace("{" + x + "}", v[x]); return s; }
  // nodo recien activado: el registro publico lo guarda en unos minutos (en todos los idiomas, aqui mismo)
  var SYNC = {"en": {"syncT": "Hash Node activated · syncing", "syncS": "Your node is already active in the Dashboard. This panel will update within a few minutes; your time counts from the exact moment you activated it.", "syncH": "Already activated it in the Dashboard? It will appear here within a few minutes, and your time counts from the exact moment of activation."}, "es": {"syncT": "Hash Node activado · sincronizando", "syncS": "Tu nodo ya está activo en el Dashboard. Este panel se actualizará en unos minutos; tu tiempo cuenta desde el momento exacto en que lo activaste.", "syncH": "¿Ya lo activaste en el Dashboard? Aparecerá aquí en unos minutos y tu tiempo cuenta desde el momento exacto de la activación."}, "pt": {"syncT": "Hash Node ativado · sincronizando", "syncS": "Seu nó já está ativo no Dashboard. Este painel será atualizado em poucos minutos; seu tempo conta desde o momento exato em que você o ativou.", "syncH": "Já ativou no Dashboard? Ele aparecerá aqui em poucos minutos, e seu tempo conta desde o momento exato da ativação."}, "fr": {"syncT": "Hash Node activé · synchronisation", "syncS": "Votre nœud est déjà actif dans le Dashboard. Ce panneau se mettra à jour d’ici quelques minutes ; votre temps compte depuis le moment exact de l’activation.", "syncH": "Déjà activé dans le Dashboard ? Il apparaîtra ici d’ici quelques minutes, et votre temps compte depuis le moment exact de l’activation."}, "de": {"syncT": "Hash Node aktiviert · wird synchronisiert", "syncS": "Dein Node ist im Dashboard bereits aktiv. Dieses Panel aktualisiert sich in wenigen Minuten; deine Zeit zählt ab dem genauen Moment der Aktivierung.", "syncH": "Schon im Dashboard aktiviert? Er erscheint hier in wenigen Minuten, und deine Zeit zählt ab dem genauen Moment der Aktivierung."}, "ru": {"syncT": "Hash Node активирован · синхронизация", "syncS": "Ваш узел уже активен в Dashboard. Эта панель обновится в течение нескольких минут; ваше время считается с точного момента активации.", "syncH": "Уже активировали в Dashboard? Узел появится здесь в течение нескольких минут, а время считается с точного момента активации."}, "zh": {"syncT": "Hash Node 已激活 · 同步中", "syncS": "你的节点已在 Dashboard 中激活。此面板将在几分钟内更新；你的时间从激活的那一刻开始计算。", "syncH": "已在 Dashboard 中激活？几分钟内会显示在这里，你的时间从激活的那一刻开始计算。"}, "ja": {"syncT": "Hash Node 有効化済み · 同期中", "syncS": "ノードは Dashboard ですでに有効です。このパネルは数分以内に更新されます。時間は有効化した瞬間からカウントされます。", "syncH": "Dashboard ですでに有効化しましたか？数分以内にここに表示され、時間は有効化した瞬間からカウントされます。"}, "ko": {"syncT": "Hash Node 활성화됨 · 동기화 중", "syncS": "노드는 이미 Dashboard에서 활성화되었습니다. 이 패널은 몇 분 안에 업데이트되며, 시간은 활성화한 정확한 순간부터 계산됩니다.", "syncH": "이미 Dashboard에서 활성화했나요? 몇 분 안에 여기에 표시되며, 시간은 활성화한 정확한 순간부터 계산됩니다."}, "ar": {"syncT": "تم تفعيل Hash Node · جارٍ المزامنة", "syncS": "عقدتك نشطة بالفعل في Dashboard. ستُحدَّث هذه اللوحة خلال بضع دقائق، ويُحتسب وقتك من لحظة التفعيل بالضبط.", "syncH": "هل فعّلتها بالفعل في Dashboard؟ ستظهر هنا خلال بضع دقائق، ويُحتسب وقتك من لحظة التفعيل بالضبط."}, "hi": {"syncT": "Hash Node सक्रिय · सिंक हो रहा है", "syncS": "आपका नोड Dashboard में पहले से सक्रिय है। यह पैनल कुछ ही मिनटों में अपडेट होगा; आपका समय सक्रिय करने के सटीक पल से गिना जाता है।", "syncH": "क्या Dashboard में पहले ही सक्रिय कर दिया? यह कुछ ही मिनटों में यहाँ दिखेगा, और आपका समय सक्रिय करने के सटीक पल से गिना जाता है।"}};
  function sy(k) { var l = lang(); return (SYNC[l] || SYNC.en)[k]; }
  // activado en este navegador (el Dashboard lo guarda al pulsar) en las ultimas 12 h y aun sin constancia publica
  function recien(addr) {
    try { var x = JSON.parse(localStorage.getItem("sectora:v2:node:" + String(addr).toLowerCase()) || "null");
      return !!(x && x.t && Date.now() - x.t < 12 * 36e5); } catch (e) { return false; }
  }

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
    ".el-wl{display:grid;gap:8px;margin-top:12px}",
    ".el-wl a{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid rgba(7,8,10,.1);border-radius:12px;color:#07080a;text-decoration:none;background:#fff}",
    ".el-wl a:hover{border-color:#0d4fd8}",
    ".el-wl img,.el-wl .ph{width:34px;height:34px;border-radius:9px;flex:none;object-fit:cover}",
    ".el-wl .ph{display:grid;place-items:center;background:#eef2f7;color:#6b7280;font-weight:500}",
    ".el-wl b{display:block;font-weight:500;font-size:15px;line-height:1.3}",
    ".el-wl small{display:block;font-size:12px;color:#6b7280;line-height:1.3}",
    ".el-wl i{margin-left:auto;font-style:normal;color:#0d4fd8;font-size:16px}",
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
    // el nodo tambien cuenta si se activo en el Dashboard (nodos/activaciones.json)
    var act = C && C.activos ? C.activos().catch(function () { return {}; }) : Promise.resolve({});
    return Promise.all([a, b, prog(), hist, act]).then(function (r) {
      var node = r[1] !== "active" && r[4][addr.toLowerCase()] ? "active" : r[1];
      return { staked: r[0].staked, wallet: r[0].wallet, node: node, prog: r[2], hist: r[3] };
    });
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
    var hasW = !!prov();
    bd.innerHTML = '<h3>' + t("h") + '</h3><p class="el-in">' + t("intro") + '</p>' +
      (hasW ? '<button class="el-b go mono" type="button" data-a="connect"><span>' + t("connect") + '</span><span>→</span></button>' : "") +
      (msg ? '<p class="el-msg">' + esc(msg) + '</p>' : "") +
      '<div class="el-alt">' + (hasW ? "" : t("nowallet") + '<div class="el-wl">' + wallets().map(filaW).join("") + '</div><br>') +
      t("or") + '<form class="el-f"><input name="a" placeholder="0x…" autocomplete="off" spellcheck="false" aria-label="' + t("or") + '"><button class="mono" type="submit">' + t("check") + '</button></form></div>' +
      '<p class="mono el-rule">' + t("rule") + '</p>';
    var b = bd.querySelector('[data-a="connect"]'); if (b) b.addEventListener("click", connect);
    if (!hasW) { pideLogos(); ponLogos(); }
    bd.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault(); var v = this.a.value.trim();
      if (!/^0x[0-9a-fA-F]{40}$/.test(v)) { start(t("bad")); return; }
      show(v, false);
    });
  }
  function connect() {
    prov().request({ method: "eth_requestAccounts" }).then(function (acc) {
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
      else if (!r.demo && recien(addr)) rows.push(li("wait", "p", sy("syncT"), sy("syncS")));
      else rows.push(li("wait", "p", t("todo"), t("todos") + (r.demo ? "" : "<br>" + sy("syncH"))));
      rows.push(li("ok", "", t("r2", { n: fmt(total) }), t("r2s", { w: fmt(r.wallet) }) + "<br>" + t("up" + lv)));
      // retiro y volvio con menos: lo de su nivel anterior queda en pausa hasta que vuelva su saldo
      var evp = r.hist && C && C.OPEN && now >= C.OPEN ? C.evaluate(r.hist.ev, r.hist.node, C.OPEN, now) : null;
      if (evp && evp.outGot > 0.00005) {
        var NM = ["", "Scout", "Sentinel", "Guardian", "Titan"], was = level(evp.outTop);
        rows.push(li("warn", "p", t("pzW", { l: NM[was], g: new Intl.NumberFormat(L[lang()].loc, { minimumFractionDigits: 4, maximumFractionDigits: 4, useGrouping: "always" }).format(evp.outGot), b: fmt(evp.outTop) }),
          lv > 0 && lv < was ? t("pzN", { l: NM[lv], s: fmt(total), p: fmt(prize) }) : ""));
      }
      // con staking y sin nodo encendido: el aviso de que solo falta el nodo
      var stk = r.staked > 0n && !on ? '<p class="el-st"><i>' + ICON.bolt + "</i><b>" + t("stk") + "</b><span>" + t("stks") + "</span></p>" : "";
      var btn = (on ? "" :
        '<a class="el-b go mono" href="' + DASH + '"><span>' + (r.node === "paused" ? t("reopen") : t("node")) + '</span><span>↗</span></a>') +
        '<a class="el-b mono" href="' + STAKE + '"><span>' + t("stake") + '</span><span>↗</span></a>';
      /* sin nodo: los pasos para encenderlo (un clic en el Dashboard, sin Sepolia ni gas) */
      var how = on || r.node === "unknown" ? "" : '<div class="el-how"><p class="mono">' + t("hw") + "</p><ol>" +
        '<li><span>1</span><div>' + t("hw1") + '<em><a href="' + DASH + '">' + t("hwp") + " ↗</a></em></div></li>" +
        '<li><span>2</span><div>' + t("hw2") + "</div></li>" +
        '<li><span>3</span><div>' + t("hw3") + "</div></li></ol></div>";
      bd.innerHTML = '<h3>' + t("h") + '</h3>' + stk + '<ul class="el-rows">' + rows.join("") + "</ul>" + how + btn +
        (r.demo || !REF_ON ? "" : '<div class="el-rf" data-rf></div>') +
        '<p class="mono el-rule">' + t("rule") + '</p><p class="el-ft">' + t("foot") + '</p>' +
        '<button class="el-lnk" type="button" data-a="other">' + t("other") + "</button>";
      bd.querySelector('[data-a="other"]').addEventListener("click", function () { start(); });
      if (state === "run") live(items, closed, proj);
      if (!r.demo && REF_ON) refFill(addr, lv > 0 && on);
    }).catch(function () { if (cur === addr) start(t("err")); });
  }
  /* lo ganado sube como en el staking: premio de la plaza x tiempo dentro / tiempo completo, desde el inicio de cada plaza */
  var timer = 0;
  function stop() { if (timer) { clearInterval(timer); timer = 0; } }
  function live(items, closed, proj) {
    var acc = bd.querySelector("[data-acc]"), bar = bd.querySelector("[data-bar]"), days = bd.querySelector("[data-days]");
    // 6 decimales, como el Dashboard: la cifra se ve subir sin parar
    var nf = new Intl.NumberFormat(L[lang()].loc, { minimumFractionDigits: 6, maximumFractionDigits: 6, useGrouping: "always" });
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
  // referidos ocultos por ahora: no se muestran ni el bloque, ni el aviso del link, ni el ?ref en los links (el link se sigue guardando)
  var REF_ON = false;
  function refGet() { try { return (localStorage.getItem(REF_KEY) || "").toLowerCase(); } catch (e) { return ""; } }
  var OK = '<i><svg viewBox="0 0 16 16"><path d="M4 8.4l2.8 2.7 5.4-5.9" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></i>';
  function refFill(addr, inside) {
    var box = bd.querySelector("[data-rf]"), C = window.SACount;
    if (!box || !C || !C.refInvitees) { if (box) box.remove(); return; }
    var me = addr.toLowerCase(), link = location.origin + "/airdrop/?ref=" + me;
    box.innerHTML = '<div data-rfme></div><p class="mono">' + t("rf") + '</p><span class="el-rf-s">' + t("rfs", { n: fmt(C.REF.BONUS * 1000) }) + "</span>" +
      '<span class="el-rf-l">' + t("rfl") + '</span><div class="el-rf-c"><code>' + esc(link.replace(/^https?:\/\//, "")) + "</code>" +
      '<button type="button" class="mono" data-c>' + t("rfc") + "</button>" + (navigator.share ? '<button type="button" class="mono" data-s>' + t("rfsh") + "</button>" : "") + "</div>" +
      '<span class="el-rf-n" data-n><span class="el-sp"></span></span>' + (inside ? "" : '<span class="el-rf-w">' + t("rfin") + "</span>") +
      '<span class="el-rf-r">' + t("rfpool") + "<br>" + t("rfrev") + "</span>";
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
        top.innerHTML = '<div class="el-rf-p"><b>' + t("rfp", { a: short(pend) }) + "</b><span>" + t("rfps") + '</span><a href="/dashboard.html?ref=' + pend + '#tnRef">' + t("rfgo") + " ↗</a></div>";
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
    if (m) { try { localStorage.setItem(REF_KEY, m[1].toLowerCase()); } catch (e) {} if (REF_ON) refBanner(m[1].toLowerCase()); }
  })();
  // los links al Dashboard llevan al padrino: asi viaja aunque se abran en la app de una wallet (otra memoria)
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href*="dashboard.html"], a[href^="/dash/"]'), r = refGet();
    if (!REF_ON || !a || !/^0x[0-9a-f]{40}$/.test(r) || /[?&]ref=/.test(a.getAttribute("href"))) return;
    var u = new URL(a.getAttribute("href").replace(/^\/dash\/$/, "/dashboard.html"), location.href);
    u.searchParams.set("ref", r); a.href = u.toString();
  }, true);

  function open() { ov.classList.add("on"); document.documentElement.style.overflow = "hidden"; if (cur) show(cur, curConn); else start(); }
  function close() { stop(); ov.classList.remove("on"); document.documentElement.style.overflow = ""; }
  if (window.ethereum && window.ethereum.on) window.ethereum.on("accountsChanged", function (a) { if (ov.classList.contains("on") && a && a[0]) show(a[0], true); });

  document.addEventListener("sa:lang", function () { if (ov.classList.contains("on")) { if (cur) show(cur, curConn); else start(); } });
  window.SAElig = { open: open, close: close };
  if (location.hash === "#my" && !DEMO) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", open); else open(); }
  if (DEMO) { cur = DEMO_A; if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", open); else open(); }
})();
