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
  /* TEMPORAL (30 oct 2026): mientras Reown quita la marca de sectoraorg.com, en el movil sin wallet (Chrome,
     Safari...) no se conecta por WalletConnect: se abre la pagina en la app de la wallet, donde no sale ninguna
     alerta. Para volver a como estaba: SOLO_APP = false. */
  var SOLO_APP = true;   // en el ordenador, lo mismo: sin QR (extensiones y el enlace para el telefono)
  var PHANTOM = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" fill="#ab9ff2"/><path d="M7 21.5V13a7 7 0 0 1 14 0v8.5l-2.33-1.75-2.34 1.75L14 19.75l-2.33 1.75-2.34-1.75z" fill="#fff"/><ellipse cx="11.6" cy="13.2" rx="1.15" ry="1.7" fill="#ab9ff2"/><ellipse cx="16.4" cy="13.2" rx="1.15" ry="1.7" fill="#ab9ff2"/></svg>');
  // para el ordenador: las que no estan instaladas (web: su pagina oficial de descarga);
  // sin web, las que son solo app del movil. m reconoce la extension ya detectada
  // logos oficiales de Rabby, Magic Eden y Ronin (no estan en dashboard-wallet-logos.js; tomados de RainbowKit)
  var LOGO_EXTRA = {"rabby": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2028%2028%22%3E%3Cg%20clip-path%3D%22url(%23a)%22%3E%3Cpath%20fill%3D%22%238697FF%22%20d%3D%22M28%200H0v28h28V0Z%22%2F%3E%3Cpath%20fill%3D%22url(%23b)%22%20d%3D%22M22.54%2015.078c.677-1.514-2.673-5.744-5.874-7.506-2.017-1.365-4.12-1.178-4.545-.579-.935%201.316%203.094%202.43%205.788%203.731-.58.252-1.125.703-1.446%201.28-1.004-1.096-3.209-2.04-5.796-1.28-1.743.513-3.191%201.721-3.751%203.546a1.097%201.097%200%201%200-.445%202.1c.112%200%20.463-.075.463-.075l5.612.041c-2.244%203.56-4.018%204.081-4.018%204.698s1.697.45%202.335.22c3.05-1.1%206.327-4.531%206.89-5.519%202.36.295%204.345.33%204.786-.657Z%22%2F%3E%3Cpath%20fill%3D%22url(%23c)%22%20fill-rule%3D%22evenodd%22%20d%3D%22m17.885%2010.713.025.01c.125-.049.105-.233.07-.378-.078-.333-1.438-1.676-2.715-2.277-1.743-.82-3.025-.777-3.212-.398.356.726%201.998%201.408%203.714%202.12.723.3%201.46.606%202.118.923Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3Cpath%20fill%3D%22url(%23d)%22%20fill-rule%3D%22evenodd%22%20d%3D%22M15.701%2018.036a10.296%2010.296%200%200%200-1.2-.37c.482-.862.583-2.138.128-2.945-.639-1.133-1.44-1.736-3.304-1.736-1.024%200-3.783.346-3.832%202.648-.005.242%200%20.464.017.667l5.036.037a17.264%2017.264%200%200%201-1.871%202.483c.669.172%201.221.316%201.728.448.48.125.92.24%201.38.357a21.003%2021.003%200%200%200%201.918-1.59Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3Cpath%20fill%3D%22url(%23e)%22%20d%3D%22M6.848%2016.063c.206%201.75%201.2%202.435%203.232%202.638%202.032.203%203.197.067%204.749.208%201.296.118%202.453.778%202.882.55.386-.205.17-.947-.347-1.423-.67-.617-1.597-1.046-3.229-1.199.325-.89.234-2.138-.27-2.817-.731-.982-2.079-1.426-3.785-1.232-1.782.202-3.49%201.08-3.232%203.275Z%22%2F%3E%3C%2Fg%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22b%22%20x1%3D%2210.464%22%20x2%3D%2222.394%22%20y1%3D%2213.737%22%20y2%3D%2217.12%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23fff%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22c%22%20x1%3D%2220.386%22%20x2%3D%2211.779%22%20y1%3D%2213.509%22%20y2%3D%224.879%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%237258DC%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23797DEA%22%20stop-opacity%3D%220%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22d%22%20x1%3D%2215.94%22%20x2%3D%227.673%22%20y1%3D%2218.337%22%20y2%3D%2213.584%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%237461EA%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23BFC2FF%22%20stop-opacity%3D%220%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22e%22%20x1%3D%2211.177%22%20x2%3D%2216.765%22%20y1%3D%2213.648%22%20y2%3D%2220.749%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%22.984%22%20stop-color%3D%22%23D5CEFF%22%2F%3E%3C%2FlinearGradient%3E%3CclipPath%20id%3D%22a%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M0%200h28v28H0z%22%2F%3E%3C%2FclipPath%3E%3C%2Fdefs%3E%3C%2Fsvg%3E", "magicEden": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20800%22%3E%3Cpath%20fill%3D%22%23070B34%22%20d%3D%22M0%200h800v800H0V0Z%22%2F%3E%3Cpath%20fill%3D%22%23F20074%22%20d%3D%22M231.256%20270.826c6.298%205.742%2012.37%2011.679%2018.372%2017.727%201.706%201.719%203.415%203.435%205.126%205.15%203.626%203.637%207.249%207.28%2010.871%2010.922%204.21%204.234%208.423%208.467%2012.64%2012.696a3711.51%203711.51%200%200%201%205.004%205.036c4.85%204.872%209.737%209.63%2014.966%2014.098%202.918%202.554%205.608%205.322%208.312%208.1l3.558%203.61c1.836%201.866%203.669%203.735%205.497%205.608%201.787%201.83%203.584%203.65%205.382%205.47l1.651%201.707c2.724%202.741%204.57%204.333%208.365%205.05l.734-1.621c1.595-2.998%203.529-5.698%205.516-8.442l1.317-1.83c6.075-8.42%2012.26-16.76%2018.433-25.107%206.876-9.303%2013.737-18.614%2020.5-28l3.203-4.426c2.323-3.212%204.619-6.442%206.906-9.68l3.641-5.082%201.643-2.357C398.88%20271.161%20405.78%20265.175%20416%20263c6.03-.458%2012.045-.442%2018.09-.436l5.501-.03c4.963-.027%209.926-.034%2014.889-.036%203.106-.002%206.211-.008%209.317-.016%2010.848-.028%2021.697-.04%2032.545-.038%2010.09.002%2020.18-.03%2030.27-.077%208.682-.04%2017.364-.055%2026.047-.054%205.177.001%2010.354-.007%2015.53-.04%204.872-.028%209.743-.028%2014.615-.007%201.78.004%203.56-.003%205.34-.022%2013.189-.126%2022.483%201.918%2032.856%2010.756%206.503%208.896%209.049%2017.009%208%2028-1.775%208.755-6.222%2015.257-13%2021-9.275%205.858-17.307%207.139-28.044%207.205l-3.018.03c-3.279.032-6.558.057-9.836.081l-6.835.063c-5.988.055-11.975.105-17.962.153-6.114.05-12.227.106-18.34.161-11.988.108-23.977.21-35.965.307%201.582%204.258%203.412%206.822%206.562%2010.125%203.477%203.721%206.803%207.469%2010%2011.437%202.84%203.522%205.75%206.921%208.813%2010.25%2011.073%2012.241%2021.22%2023.89%2020.96%2041.313C541.12%20413.541%20535.777%20421.368%20529%20429a2133.148%202133.148%200%200%200-3.877%204.614c-3.867%204.609-7.792%209.169-11.717%2013.73-1.998%202.324-3.99%204.655-5.98%206.988a734.91%20734.91%200%200%201-2.83%203.29%20629.636%20629.636%200%200%200-3.846%204.503l-2.203%202.57c-1.919%202.396-1.919%202.396-1.547%206.305l3.919.011c12.211.037%2024.423.095%2036.634.173%206.277.04%2012.554.072%2018.832.087%206.062.015%2012.125.05%2018.187.097%202.308.015%204.617.023%206.925.024%203.244.002%206.486.03%209.73.062l2.865-.015c9.907.153%2018.67%203.665%2025.943%2010.463%206.05%206.248%208.278%2011.894%209.402%2020.41-1.286%2010.845-4.897%2019.44-12.812%2026.938-7.221%204.814-13.075%206.868-21.783%206.897l-2.187.011c-2.42.011-4.839.015-7.259.019l-5.204.02c-5.7.02-11.399.031-17.098.041l-5.895.013c-9.235.019-18.47.033-27.705.041-10.643.01-21.287.036-31.93.077-8.237.03-16.473.045-24.71.048-4.914.002-9.828.011-14.743.036-4.629.024-9.258.028-13.887.018-1.692%200-3.383.005-5.075.02-12.98.1-25.384-.966-35.149-10.491-6.527-7.416-8.571-13.407-8.355-23.332%201.817-18.754%2019.567-36.96%2030.355-51.668l3.371-4.617a1435.342%201435.342%200%200%201%2021.036-28.003%20650.426%20650.426%200%200%200%203.733-4.912c1.3-1.726%202.622-3.437%203.958-5.135l2-2.642%201.832-2.365c1.365-2.323%201.365-2.323.394-4.949-1.717-3.083-3.949-5.488-6.387-8.002-4.373-4.637-8.474-9.404-12.472-14.371-3.562-4.34-7.253-8.564-10.949-12.79-2.92-3.346-5.773-6.72-8.516-10.214-2.647.368-3.807.803-5.7%202.74l-1.698%202.283-1.93%202.565-2.047%202.787-2.148%202.873c-2.171%202.909-4.326%205.829-6.477%208.752l-1.856%202.517a3757.548%203757.548%200%200%200-6.852%209.315c-5.018%206.836-10.158%2013.575-15.313%2020.308-4.561%205.967-9.04%2011.99-13.479%2018.047-1.682%202.28-3.365%204.557-5.049%206.835a431.272%20431.272%200%200%200-3.748%205.208c-5.08%206.879-11.178%2011.166-19.703%2012.77-13.241%201.017-21.832-1.495-32-10-4.004-3.73-7.818-7.657-11.65-11.56a1716%201716%200%200%200-5.802-5.875%206465.8%206465.8%200%200%201-16.478-16.687c-3.366-3.42-6.742-6.83-10.123-10.233a924.386%20924.386%200%200%201-3.842-3.902%20915.74%20915.74%200%200%200-5.362-5.422l-1.59-1.643c-3.357-3.341-3.357-3.341-8.153-3.678l-.007%201.909c-.06%2015.358-.135%2030.717-.229%2046.076-.045%207.427-.084%2014.855-.11%2022.282-.023%206.477-.057%2012.955-.103%2019.432-.024%203.427-.042%206.853-.049%2010.28-.01%203.834-.037%207.668-.07%2011.503l.005%203.405c-.153%2012.885-3.972%2022.247-12.562%2031.8-8.35%207.736-16.863%2010.148-27.998%209.958-6.545-.337-11.53-1.729-16.877-5.645l-1.938-1.246c-6.44-4.678-9.604-12.38-12.062-19.754-.1-2.88-.143-5.735-.14-8.614l-.01-2.699c-.008-2.996-.01-5.992-.011-8.988l-.015-6.43c-.013-5.833-.02-11.666-.024-17.5l-.012-10.931c-.013-11.4-.023-22.8-.027-34.2-.004-13.161-.022-26.322-.05-39.483-.023-10.17-.033-20.341-.034-30.512-.001-6.075-.007-12.15-.025-18.225-.016-5.718-.018-11.435-.01-17.153.001-2.096-.003-4.192-.013-6.287-.013-2.868-.007-5.734.004-8.602l-.025-2.496c.089-10.505%204.101-19.22%2011.244-26.86%2014.024-13.103%2034.533-13.23%2049.404-1.194Z%22%2F%3E%3C%2Fsvg%3E", "ronin": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22none%22%3E%3Cpath%20fill%3D%22url(%23a)%22%20d%3D%22M0%200h100v100H0z%22%2F%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M75.984%2037.962V21.32A8.32%208.32%200%200%200%2067.667%2013h-35.35A8.316%208.316%200%200%200%2024%2021.32v48.286a8.32%208.32%200%200%200%203.12%206.49l12.87%2010.338a1.04%201.04%200%200%200%201.695-.811v-34.14a1.04%201.04%200%200%201%201.04-1.04h9.357a6.237%206.237%200%200%201%206.238%206.24v28.94a1.04%201.04%200%200%200%201.69.811l12.87-10.338a8.32%208.32%200%200%200%203.12-6.49V54.603a8.32%208.32%200%200%200-8.317-8.32%208.316%208.316%200%200%200%208.301-8.321m-23.912%204.16h-9.358a1.04%201.04%200%200%201-1.04-1.04V22.36a1.04%201.04%200%200%201%201.04-1.04H57.27a1.04%201.04%200%200%201%201.04%201.04v13.52a6.24%206.24%200%200%201-6.238%206.241%22%2F%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22a%22%20x1%3D%22-3%22%20x2%3D%22104%22%20y1%3D%22103%22%20y2%3D%220%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%230606B7%22%2F%3E%3Cstop%20offset%3D%22.625%22%20stop-color%3D%22%23137CCA%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2318A5D1%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2320A8D0%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3C%2Fsvg%3E"};
  LOGO_EXTRA.uniswap = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2228%22%20height%3D%2228%22%20fill%3D%22none%22%3E%3Cpath%20fill%3D%22%23FFD8EA%22%20d%3D%22M0%200h28v28H0z%22%2F%3E%3Cg%20fill%3D%22%23FF007A%22%20clip-path%3D%22url(%23a)%22%3E%3Cpath%20d%3D%22M9.635%206.068c-.255-.039-.266-.043-.145-.06.23-.035.773.012%201.148.099.874.202%201.67.722%202.519%201.646l.225.246.323-.051c1.36-.213%202.741-.044%203.899.477.319.144.821.43.882.503.022.024.058.173.082.335.086.557.044.982-.13%201.301-.096.173-.101.228-.037.377a.367.367%200%200%200%20.334.206c.287%200%20.597-.454.74-1.086l.056-.252.113.126c.62.685%201.106%201.618%201.189%202.282l.021.174-.103-.158a1.966%201.966%200%200%200-.59-.604c-.415-.268-.855-.36-2.017-.42-1.05-.053-1.645-.141-2.234-.329-1.003-.32-1.508-.744-2.699-2.27-.53-.678-.855-1.053-1.18-1.354-.74-.687-1.466-1.047-2.396-1.187v-.001Z%22%2F%3E%3Cpath%20d%3D%22M18.725%207.581c.026-.453.088-.753.216-1.026.028-.07.063-.136.104-.198a.69.69%200%200%201-.049.178c-.092.266-.108.629-.043%201.052.081.536.126.613.706%201.192.273.272.589.613.704.761l.21.267-.21-.191c-.255-.233-.841-.69-.972-.755-.086-.042-.1-.042-.153.01-.05.048-.06.12-.068.461-.01.532-.084.873-.263%201.213-.096.187-.111.147-.025-.062.066-.155.072-.224.072-.739%200-1.033-.127-1.283-.864-1.707a8.169%208.169%200%200%200-.684-.346%202.614%202.614%200%200%201-.334-.16c.02-.02.74.185%201.029.293.431.163.502.183.555.164.034-.013.051-.113.068-.407h.001Zm-8.595%201.77c-.517-.696-.838-1.764-.768-2.563l.02-.247.119.02c.222.04.603.179.783.286.49.29.703.673.918%201.657.064.288.147.613.185.725.061.178.294.592.483.862.136.194.046.286-.255.26-.46-.04-1.083-.46-1.485-1Zm7.965%205.182c-2.42-.95-3.273-1.777-3.273-3.17%200-.206.007-.374.016-.374.008%200%20.102.067.208.151.491.384%201.04.548%202.563.765.896.128%201.398.231%201.864.382%201.48.478%202.392%201.449%202.61%202.773.063.384.028%201.104-.076%201.484-.082.3-.329.84-.394.861-.019.007-.037-.061-.04-.154-.025-.496-.283-.98-.715-1.343-.49-.412-1.15-.741-2.763-1.375Zm-1.699.396a4.13%204.13%200%200%200-.117-.5l-.062-.18.115.127c.16.173.285.396.391.693.082.227.09.294.09.662%200%20.361-.011.437-.087.64-.104.3-.28.572-.51.794-.443.44-1.011.683-1.833.784-.142.018-.557.047-.922.066-.922.046-1.529.144-2.073.33a.446.446%200%200%201-.156.036c-.021-.021.35-.237.656-.381.431-.204.861-.315%201.825-.47.475-.078.968-.173%201.093-.21%201.178-.352%201.784-1.263%201.59-2.39Z%22%2F%3E%3Cpath%20d%3D%22M17.506%2016.855c-.321-.675-.396-1.327-.22-1.935.02-.067.05-.119.068-.119a.64.64%200%200%201%20.169.09c.149.097.445.261%201.237.682.988.527%201.553.934%201.936%201.4.335.407.542.872.643%201.438.057.32.023%201.093-.061%201.416-.266%201.018-.882%201.818-1.764%202.285a2.129%202.129%200%200%201-.258.124c-.013%200%20.035-.116.104-.259.297-.605.331-1.193.107-1.848-.138-.401-.418-.89-.982-1.718-.657-.96-.817-1.218-.979-1.556Zm-9.095%203.644c.9-.742%202.016-1.267%203.036-1.43a4.85%204.85%200%200%201%201.575.06c.652.163%201.235.528%201.538.962.296.425.423.794.556%201.618.052.324.109.651.125.724.1.427.293.768.532.939.38.272%201.037.29%201.682.044a.853.853%200%200%201%20.21-.064c.023.023-.301.235-.53.347-.27.141-.572.213-.879.208-.59%200-1.08-.294-1.49-.891a7.027%207.027%200%200%201-.402-.784c-.431-.961-.644-1.253-1.145-1.575-.437-.28-1-.329-1.424-.126-.556.266-.71.96-.312%201.4.187.189.43.313.695.354a.75.75%200%200%200%20.589-.174.728.728%200%200%200%20.251-.551c0-.29-.114-.453-.4-.581-.392-.172-.812.029-.81.388%200%20.153.069.249.226.32.1.044.103.046.02.03-.358-.073-.442-.496-.154-.776.347-.336%201.064-.188%201.31.272.103.194.115.578.025.81-.203.52-.79.793-1.387.644-.407-.102-.571-.211-1.06-.703-.852-.856-1.182-1.023-2.408-1.21l-.237-.035.268-.22Z%22%2F%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M4.418%205.179c2.842%203.368%204.8%204.757%205.017%205.05.18.243.112.462-.195.632a1.899%201.899%200%200%201-.699.191c-.2%200-.269-.075-.269-.075-.115-.106-.18-.088-.773-1.116A176.911%20176.911%200%200%200%205.968%207.56c-.044-.04-.042-.04%201.448%202.564.24.543.047.741.047.819%200%20.157-.044.24-.242.457-.332.36-.48.765-.587%201.604-.12.94-.456%201.604-1.39%202.741-.545.666-.635.787-.773%201.056-.174.338-.221.527-.24.952a2.9%202.9%200%200%200%20.16%201.174c.122.378.252.626.582%201.125.285.43.448.75.448.876%200%20.099.019.099.461.001%201.054-.232%201.91-.64%202.392-1.142.298-.311.367-.482.37-.907.002-.277-.008-.336-.085-.496-.125-.26-.353-.477-.855-.813-.66-.44-.942-.794-1.018-1.28-.065-.4.01-.682.373-1.427.377-.773.47-1.103.535-1.88.04-.503.096-.701.244-.861.155-.166.293-.222.676-.272.623-.084%201.018-.24%201.343-.534a1.14%201.14%200%200%200%20.421-.869l.014-.28-.16-.179C9.563%209.34%204.036%204.667%204%204.667c-.007%200%20.18.23.418.512Zm1.325%2013.086a.486.486%200%200%200-.157-.652c-.203-.133-.522-.069-.522.103%200%20.053.03.092.098.125.114.058.122.122.032.254s-.082.248.02.328c.168.126.404.057.529-.158ZM10.683%2012c-.29.086-.575.389-.664.706-.053.194-.022.534.058.638.13.169.255.213.596.212.665-.004%201.243-.283%201.311-.632.054-.286-.2-.68-.55-.855a1.33%201.33%200%200%200-.75-.07Zm.78.593c.102-.143.057-.296-.118-.4-.331-.199-.835-.035-.835.272%200%20.153.262.32.502.32.16%200%20.38-.093.45-.192Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fg%3E%3Cdefs%3E%3CclipPath%20id%3D%22a%22%3E%3Cpath%20fill%3D%22%23fff%22%20d%3D%22M4%204h19v20H4z%22%2F%3E%3C%2FclipPath%3E%3C%2Fdefs%3E%3C%2Fsvg%3E";
  // pagina oficial de Uniswap Wallet: app y extension del navegador
  var UNI_WEB = "https://wallet.uniswap.org/";
  var INSTALAR = [
    { id: "i-metamask", nombre: "MetaMask", logo: "metaMask", m: /metamask/i, web: "https://metamask.io/download/" },
    { id: "i-uniswap", nombre: "Uniswap Wallet", icono: LOGO_EXTRA.uniswap, m: /uniswap/i, web: UNI_WEB },
    { id: "i-phantom", nombre: "Phantom", icono: PHANTOM, m: /phantom/i, web: "https://phantom.com/download" },
    { id: "i-trust", nombre: "Trust Wallet", logo: "trust", m: /trust/i, web: "https://trustwallet.com/download" },
    { id: "i-binance", nombre: "Binance Wallet", logo: "binance", m: /binance/i },
    { id: "i-coinbase", nombre: "Coinbase Wallet", logo: "coinbase", m: /coinbase/i, web: "https://www.coinbase.com/wallet/downloads" },
    { id: "i-okx", nombre: "OKX Wallet", logo: "okx", m: /okx/i, web: "https://www.okx.com/web3" },
    { id: "i-bitget", nombre: "Bitget Wallet", logo: "bitget", m: /bitget/i, web: "https://web3.bitget.com/" },
    { id: "i-tokenpocket", nombre: "TokenPocket", logo: "tokenPocket", m: /tokenpocket/i },
    { id: "i-imtoken", nombre: "imToken", logo: "imToken", m: /imtoken/i },
    { id: "i-rainbow", nombre: "Rainbow", logo: "rainbow", m: /rainbow/i, web: "https://rainbow.me/download" },
    { id: "i-rabby", nombre: "Rabby", icono: LOGO_EXTRA.rabby, m: /rabby/i, web: "https://rabby.io/" }
  ];
  // icono neutro de cartera para la opcion de WalletConnect (sin su logo)
  var CARTERA = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" fill="#13213d"/><path d="M8.5 10.5l8-3.2 1.2 3.2" fill="none" stroke="#4d8dff" stroke-width="1.5" stroke-linejoin="round"/><rect x="7" y="10.5" width="14" height="10" rx="2" fill="none" stroke="#4d8dff" stroke-width="1.5"/><path d="M21 14h-3.5a1.5 1.5 0 0 0 0 3H21" fill="none" stroke="#4d8dff" stroke-width="1.5"/></svg>');
  var ENLACE = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" fill="#13213d"/><path d="M12.2 15.8l3.6-3.6M11 13.4l-1.6 1.6a2.6 2.6 0 0 0 3.6 3.6l1.6-1.6M17 14.6l1.6-1.6a2.6 2.6 0 0 0-3.6-3.6L13.4 11" fill="none" stroke="#4d8dff" stroke-width="1.6" stroke-linecap="round"/></svg>');
  var AQUI = location.origin + location.pathname;
  var enc = encodeURIComponent;

  var T = {
    en: { pickM: "Choose your wallet app", pickD: "Connect a wallet", close: "Close", det: "Detected in this browser", ext: "Browser extension",
      wc: "Approve in the app", brw: "Opens this page in the app", other: "Other wallets", otherS: "Any WalletConnect wallet",
      phone: "Wallet on your phone", phoneS: "Scan a QR code with your phone", prep: "Preparing a secure connection…",
      tapM: "Tap your wallet app. Approve the connection there, then come back to this tab.", tapD: "Scan the code with your phone to connect.",
      appr: "Approve the connection in {a}, then come back to this tab.", apprO: "Approve the connection in your wallet, then come back to this tab.",
      qr: "Scan with your phone’s wallet app (MetaMask, Trust, Binance, Coinbase…) and approve there.", copy: "Copy connection link", copied: "Copied",
      fail: "The connection did not load. Check your connection and try again.", rej: "The connection was rejected in the wallet.", exp: "The link expired.",
      retry: "Try again", noqr: "Could not draw the QR code. Use Copy connection link.", own: "Prefer your wallet’s own browser? Open this page in ",
      or: " or ", only: "Only your address is read: no signature, no transaction." },
    es: { pickM: "Elige tu app de wallet", pickD: "Conectar una wallet", close: "Cerrar", det: "Detectada en este navegador", ext: "Extensión del navegador",
      wc: "Aprueba en la app", brw: "Abre esta página en la app", other: "Otras wallets", otherS: "Cualquier wallet con WalletConnect",
      phone: "Wallet en tu teléfono", phoneS: "Escanea un código QR con tu teléfono", prep: "Preparando una conexión segura…",
      tapM: "Toca tu app de wallet. Aprueba la conexión ahí y vuelve a esta pestaña.", tapD: "Escanea el código con tu teléfono para conectar.",
      appr: "Aprueba la conexión en {a} y vuelve a esta pestaña.", apprO: "Aprueba la conexión en tu wallet y vuelve a esta pestaña.",
      qr: "Escanéalo con la app de wallet de tu teléfono (MetaMask, Trust, Binance, Coinbase…) y aprueba ahí.", copy: "Copiar enlace de conexión", copied: "Copiado",
      fail: "La conexión no cargó. Revisa tu conexión y prueba de nuevo.", rej: "La conexión se rechazó en la wallet.", exp: "El enlace caducó.",
      retry: "Probar de nuevo", noqr: "No se pudo dibujar el QR. Usa Copiar enlace de conexión.", own: "¿Prefieres el navegador de tu wallet? Abre esta página en ",
      or: " o ", only: "Solo se lee tu dirección: sin firmas ni transacciones." },
    pt: { pickM: "Escolha seu app de carteira", pickD: "Conectar uma carteira", close: "Fechar", det: "Detectada neste navegador", ext: "Extensão do navegador",
      wc: "Aprove no app", brw: "Abre esta página no app", other: "Outras carteiras", otherS: "Qualquer carteira com WalletConnect",
      phone: "Carteira no seu celular", phoneS: "Escaneie um QR code com seu celular", prep: "Preparando uma conexão segura…",
      tapM: "Toque no seu app de carteira. Aprove a conexão lá e volte para esta aba.", tapD: "Escaneie o código com seu celular para conectar.",
      appr: "Aprove a conexão em {a} e volte para esta aba.", apprO: "Aprove a conexão na sua carteira e volte para esta aba.",
      qr: "Escaneie com o app de carteira do seu celular (MetaMask, Trust, Binance, Coinbase…) e aprove lá.", copy: "Copiar link de conexão", copied: "Copiado",
      fail: "A conexão não carregou. Verifique sua conexão e tente de novo.", rej: "A conexão foi recusada na carteira.", exp: "O link expirou.",
      retry: "Tentar de novo", noqr: "Não foi possível desenhar o QR. Use Copiar link de conexão.", own: "Prefere o navegador da sua carteira? Abra esta página no ",
      or: " ou ", only: "Só o seu endereço é lido: sem assinaturas nem transações." }
  };
  if (window.MA_WALLET_I18N) for (var lk in window.MA_WALLET_I18N) T[lk] = window.MA_WALLET_I18N[lk];
  // textos del modo temporal SOLO_APP (abrir la pagina en la app de la wallet)
  var SOLO = {"en": {"soloT": "Open this page in your wallet", "soloS": "To connect from your phone, open this page inside your wallet app. Tap your wallet:", "soloF": "Your node, staking and airdrop work the same inside your wallet app. On a computer you can also connect as usual."}, "es": {"soloT": "Abre esta página en tu wallet", "soloS": "Para conectar desde el teléfono, abre esta página dentro de la app de tu wallet. Toca tu wallet:", "soloF": "Tu nodo, tu staking y tu airdrop funcionan igual dentro de la app de tu wallet. En el ordenador también puedes conectar como siempre."}, "pt": {"soloT": "Abra esta página na sua carteira", "soloS": "Para conectar pelo celular, abra esta página dentro do app da sua carteira. Toque na sua carteira:", "soloF": "Seu nó, seu staking e seu airdrop funcionam igual dentro do app da sua carteira. No computador você também pode conectar como sempre."}, "fr": {"soloT": "Ouvrez cette page dans votre wallet", "soloS": "Pour vous connecter depuis votre téléphone, ouvrez cette page dans l’app de votre wallet. Touchez votre wallet :", "soloF": "Votre nœud, votre staking et votre airdrop fonctionnent de la même façon dans l’app de votre wallet. Sur ordinateur, vous pouvez aussi vous connecter comme d’habitude."}, "de": {"soloT": "Öffne diese Seite in deiner Wallet", "soloS": "Um dich vom Handy aus zu verbinden, öffne diese Seite in der App deiner Wallet. Tippe auf deine Wallet:", "soloF": "Dein Node, dein Staking und dein Airdrop funktionieren in der App deiner Wallet genauso. Am Computer kannst du dich auch wie gewohnt verbinden."}, "ru": {"soloT": "Откройте эту страницу в своём кошельке", "soloS": "Чтобы подключиться с телефона, откройте эту страницу в приложении своего кошелька. Выберите кошелёк:", "soloF": "Узел, стейкинг и аирдроп работают так же внутри приложения кошелька. На компьютере можно подключаться как обычно."}, "zh": {"soloT": "在你的钱包中打开此页面", "soloS": "如需在手机上连接，请在钱包 App 内打开此页面。选择你的钱包：", "soloF": "在钱包 App 内，你的节点、质押和空投一切照常。在电脑上也可以照常连接。"}, "ja": {"soloT": "このページをウォレットで開いてください", "soloS": "スマホから接続するには、ウォレットアプリ内でこのページを開いてください。ウォレットを選んでください：", "soloF": "ノード、ステーキング、エアドロップはウォレットアプリ内でも同じように使えます。パソコンからはこれまで通り接続できます。"}, "ko": {"soloT": "이 페이지를 지갑에서 여세요", "soloS": "휴대폰에서 연결하려면 지갑 앱 안에서 이 페이지를 여세요. 지갑을 선택하세요:", "soloF": "노드, 스테이킹, 에어드랍은 지갑 앱 안에서도 똑같이 작동합니다. 컴퓨터에서는 평소처럼 연결할 수 있습니다."}, "ar": {"soloT": "افتح هذه الصفحة في محفظتك", "soloS": "للاتصال من هاتفك، افتح هذه الصفحة داخل تطبيق محفظتك. اختر محفظتك:", "soloF": "عقدتك وتخزينك والإيردروب تعمل بالطريقة نفسها داخل تطبيق محفظتك. ويمكنك على الحاسوب الاتصال كالمعتاد."}, "hi": {"soloT": "यह पेज अपने वॉलेट में खोलें", "soloS": "फ़ोन से कनेक्ट करने के लिए यह पेज अपने वॉलेट ऐप के अंदर खोलें। अपना वॉलेट चुनें:", "soloF": "आपका नोड, स्टेकिंग और एयरड्रॉप वॉलेट ऐप के अंदर भी वैसे ही चलते हैं। कंप्यूटर पर आप हमेशा की तरह कनेक्ट कर सकते हैं।"}};
  var OTRA = {"en": {"soloOtherN": "Another wallet", "soloOtherS": "Copy the link and open it in your wallet’s browser", "soloCopied": "Link copied. Open your wallet app, go to its browser and paste it."}, "es": {"soloOtherN": "Otra wallet", "soloOtherS": "Copia el enlace y ábrelo en el navegador de tu wallet", "soloCopied": "Enlace copiado. Abre la app de tu wallet, entra en su navegador y pégalo."}, "pt": {"soloOtherN": "Outra carteira", "soloOtherS": "Copie o link e abra no navegador da sua carteira", "soloCopied": "Link copiado. Abra o app da sua carteira, vá ao navegador dela e cole."}, "fr": {"soloOtherN": "Un autre wallet", "soloOtherS": "Copiez le lien et ouvrez-le dans le navigateur de votre wallet", "soloCopied": "Lien copié. Ouvrez l’app de votre wallet, allez dans son navigateur et collez-le."}, "de": {"soloOtherN": "Andere Wallet", "soloOtherS": "Kopiere den Link und öffne ihn im Browser deiner Wallet", "soloCopied": "Link kopiert. Öffne deine Wallet-App, geh in ihren Browser und füge ihn ein."}, "ru": {"soloOtherN": "Другой кошелёк", "soloOtherS": "Скопируйте ссылку и откройте её в браузере кошелька", "soloCopied": "Ссылка скопирована. Откройте приложение кошелька, перейдите в его браузер и вставьте её."}, "zh": {"soloOtherN": "其他钱包", "soloOtherS": "复制链接并在钱包的浏览器中打开", "soloCopied": "链接已复制。打开你的钱包 App，进入其浏览器并粘贴。"}, "ja": {"soloOtherN": "その他のウォレット", "soloOtherS": "リンクをコピーしてウォレットのブラウザで開いてください", "soloCopied": "リンクをコピーしました。ウォレットアプリを開き、ブラウザに貼り付けてください。"}, "ko": {"soloOtherN": "다른 지갑", "soloOtherS": "링크를 복사해 지갑의 브라우저에서 여세요", "soloCopied": "링크가 복사되었습니다. 지갑 앱을 열고 브라우저에 붙여 넣으세요."}, "ar": {"soloOtherN": "محفظة أخرى", "soloOtherS": "انسخ الرابط وافتحه في متصفح محفظتك", "soloCopied": "تم نسخ الرابط. افتح تطبيق محفظتك وادخل إلى متصفحه والصقه."}, "hi": {"soloOtherN": "कोई और वॉलेट", "soloOtherS": "लिंक कॉपी करें और अपने वॉलेट के ब्राउज़र में खोलें", "soloCopied": "लिंक कॉपी हो गया। अपना वॉलेट ऐप खोलें, उसके ब्राउज़र में जाएँ और पेस्ट करें।"}};
  // ordenador sin QR mientras dura SOLO_APP: extensiones y el enlace para el telefono
  var PC = {"en": {"soloPc": "To connect here, install a wallet extension. On your phone, open this page inside your wallet app.", "inst": "Install the browser extension", "others": "Other compatible wallets", "wcOnlyS": "Wallets without their own browser", "wcWarn": "Only for wallets without their own browser (Tangem, Ledger Live, Safe…). While our domain is being reviewed, your wallet may show a security warning by mistake. Right now the connection service is waiting for its history to be updated so this erroneous message is removed. Sectora and its contracts are verified on Etherscan, and connecting only reads your address.", "wcPaste": "Copy the connection link, open your wallet, go to its connect section and paste it. Then come back to this tab.", "wcScanOnly": "Scan this QR code with your wallet, or copy the connection link and paste it in its connect section.", "copyBtn": "Copy link", "copiedBtn": "Copied ✓", "closeWc": "Close QR connection"}, "es": {"soloPc": "Para conectar aquí, instala una extensión de wallet. En el teléfono, abre esta página dentro de la app de tu wallet.", "inst": "Instala la extensión del navegador", "others": "Otras wallets compatibles", "wcOnlyS": "Wallets sin navegador propio", "wcWarn": "Solo para wallets sin navegador propio (Tangem, Ledger Live, Safe…). Mientras se revisa nuestro dominio, tu wallet puede mostrar un aviso de seguridad por error. En estos momentos el servicio de conexión está esperando la actualización de su historial para que sea eliminado este mensaje erróneo. Sectora y sus contratos están verificados en Etherscan, y conectar solo lee tu dirección.", "wcPaste": "Copia el enlace de conexión, abre tu wallet, entra en su apartado para conectar y pégalo. Después vuelve a esta pestaña.", "wcScanOnly": "Escanea este QR con tu wallet, o copia el enlace de conexión y pégalo en su apartado para conectar.", "copyBtn": "Copiar enlace", "copiedBtn": "Copiado ✓", "closeWc": "Cerrar conexión por QR"}, "pt": {"soloPc": "Para conectar aqui, instale uma extensão de carteira. No celular, abra esta página dentro do app da sua carteira.", "inst": "Instale a extensão do navegador", "others": "Outras carteiras compatíveis", "wcOnlyS": "Carteiras sem navegador próprio", "wcWarn": "Só para carteiras sem navegador próprio (Tangem, Ledger Live, Safe…). Enquanto nosso domínio é revisado, sua carteira pode mostrar um aviso de segurança por engano. Neste momento o serviço de conexão está aguardando a atualização do seu histórico para que essa mensagem errada seja removida. A Sectora e seus contratos são verificados no Etherscan, e conectar só lê o seu endereço.", "wcPaste": "Copie o link de conexão, abra sua carteira, vá à seção de conectar e cole. Depois volte para esta aba.", "wcScanOnly": "Escaneie este QR com sua carteira, ou copie o link de conexão e cole na seção de conectar dela.", "copyBtn": "Copiar link", "copiedBtn": "Copiado ✓", "closeWc": "Fechar conexão por QR"}, "fr": {"soloPc": "Pour vous connecter ici, installez une extension de wallet. Sur votre téléphone, ouvrez cette page dans l’app de votre wallet.", "inst": "Installez l’extension du navigateur", "others": "Autres wallets compatibles", "wcOnlyS": "Wallets sans navigateur intégré", "wcWarn": "Uniquement pour les wallets sans navigateur intégré (Tangem, Ledger Live, Safe…). Pendant l’examen de notre domaine, votre wallet peut afficher un avertissement de sécurité par erreur. En ce moment, le service de connexion attend la mise à jour de son historique pour que ce message erroné soit supprimé. Sectora et ses contrats sont vérifiés sur Etherscan, et la connexion ne lit que votre adresse.", "wcPaste": "Copiez le lien de connexion, ouvrez votre wallet, allez dans sa section de connexion et collez-le. Revenez ensuite sur cet onglet.", "wcScanOnly": "Scannez ce QR code avec votre wallet, ou copiez le lien de connexion et collez-le dans sa section de connexion.", "copyBtn": "Copier le lien", "copiedBtn": "Copié ✓", "closeWc": "Fermer la connexion par QR"}, "de": {"soloPc": "Um dich hier zu verbinden, installiere eine Wallet-Erweiterung. Auf dem Handy öffne diese Seite in deiner Wallet-App.", "inst": "Browser-Erweiterung installieren", "others": "Weitere kompatible Wallets", "wcOnlyS": "Wallets ohne eigenen Browser", "wcWarn": "Nur für Wallets ohne eigenen Browser (Tangem, Ledger Live, Safe…). Während unsere Domain geprüft wird, kann deine Wallet irrtümlich eine Sicherheitswarnung anzeigen. Derzeit wartet der Verbindungsdienst auf die Aktualisierung seines Verlaufs, damit diese fehlerhafte Meldung entfernt wird. Sectora und seine Verträge sind auf Etherscan verifiziert, und beim Verbinden wird nur deine Adresse gelesen.", "wcPaste": "Kopiere den Verbindungslink, öffne deine Wallet, gehe zum Verbinden-Bereich und füge ihn ein. Komm dann zu diesem Tab zurück.", "wcScanOnly": "Scanne diesen QR-Code mit deiner Wallet oder kopiere den Verbindungslink und füge ihn im Verbinden-Bereich ein.", "copyBtn": "Link kopieren", "copiedBtn": "Kopiert ✓", "closeWc": "QR-Verbindung schließen"}, "ru": {"soloPc": "Чтобы подключиться здесь, установите расширение кошелька. На телефоне откройте эту страницу в приложении кошелька.", "inst": "Установить расширение браузера", "others": "Другие совместимые кошельки", "wcOnlyS": "Кошельки без своего браузера", "wcWarn": "Только для кошельков без своего браузера (Tangem, Ledger Live, Safe…). Пока наш домен проверяется, кошелёк может по ошибке показать предупреждение безопасности. Сейчас сервис подключения ожидает обновления своей истории, чтобы это ошибочное сообщение было удалено. Sectora и её контракты верифицированы на Etherscan, а подключение только считывает ваш адрес.", "wcPaste": "Скопируйте ссылку подключения, откройте кошелёк, перейдите в раздел подключения и вставьте её. Затем вернитесь на эту вкладку.", "wcScanOnly": "Отсканируйте этот QR-код кошельком или скопируйте ссылку подключения и вставьте её в разделе подключения.", "copyBtn": "Копировать ссылку", "copiedBtn": "Скопировано ✓", "closeWc": "Закрыть подключение по QR"}, "zh": {"soloPc": "要在此连接，请安装钱包浏览器扩展。在手机上，请在钱包 App 内打开此页面。", "inst": "安装浏览器扩展", "others": "其他兼容钱包", "wcOnlyS": "没有内置浏览器的钱包", "wcWarn": "仅适用于没有内置浏览器的钱包（Tangem、Ledger Live、Safe…）。在我们的域名审核期间，你的钱包可能会误报安全警告。目前连接服务正在等待其记录更新，以删除这条错误提示。Sectora 及其合约已在 Etherscan 上验证，连接只会读取你的地址。", "wcPaste": "复制连接链接，打开你的钱包，进入连接页面并粘贴。然后回到此页面。", "wcScanOnly": "用你的钱包扫描此二维码，或复制连接链接并粘贴到钱包的连接页面中。", "copyBtn": "复制链接", "copiedBtn": "已复制 ✓", "closeWc": "关闭二维码连接"}, "ja": {"soloPc": "ここで接続するには、ウォレットの拡張機能をインストールしてください。スマホでは、ウォレットアプリ内でこのページを開いてください。", "inst": "ブラウザ拡張機能をインストール", "others": "その他の対応ウォレット", "wcOnlyS": "ブラウザのないウォレット", "wcWarn": "ブラウザを持たないウォレット（Tangem、Ledger Live、Safe…）専用です。当サイトのドメインの確認中は、ウォレットに誤ってセキュリティ警告が表示されることがあります。現在、接続サービスはこの誤ったメッセージを削除するため、履歴の更新を待っています。Sectora とそのコントラクトは Etherscan で検証済みで、接続してもアドレスを読み取るだけです。", "wcPaste": "接続リンクをコピーし、ウォレットを開いて接続の項目に貼り付けてください。その後このタブに戻ってください。", "wcScanOnly": "このQRコードをウォレットでスキャンするか、接続リンクをコピーしてウォレットの接続の項目に貼り付けてください。", "copyBtn": "リンクをコピー", "copiedBtn": "コピーしました ✓", "closeWc": "QR接続を閉じる"}, "ko": {"soloPc": "여기서 연결하려면 지갑 확장 프로그램을 설치하세요. 휴대폰에서는 지갑 앱 안에서 이 페이지를 여세요.", "inst": "브라우저 확장 프로그램 설치", "others": "기타 호환 지갑", "wcOnlyS": "자체 브라우저가 없는 지갑", "wcWarn": "자체 브라우저가 없는 지갑(Tangem, Ledger Live, Safe…) 전용입니다. 저희 도메인을 검토하는 동안 지갑에 보안 경고가 잘못 표시될 수 있습니다. 현재 연결 서비스는 이 잘못된 메시지를 삭제하기 위해 기록 업데이트를 기다리고 있습니다. Sectora와 컨트랙트는 Etherscan에서 검증되었으며, 연결 시 주소만 읽습니다.", "wcPaste": "연결 링크를 복사하고 지갑을 열어 연결 메뉴에 붙여 넣으세요. 그런 다음 이 탭으로 돌아오세요.", "wcScanOnly": "지갑으로 이 QR 코드를 스캔하거나, 연결 링크를 복사해 지갑의 연결 메뉴에 붙여 넣으세요.", "copyBtn": "링크 복사", "copiedBtn": "복사됨 ✓", "closeWc": "QR 연결 닫기"}, "ar": {"soloPc": "للاتصال هنا، ثبّت إضافة محفظة. على هاتفك، افتح هذه الصفحة داخل تطبيق محفظتك.", "inst": "ثبّت إضافة المتصفح", "others": "محافظ متوافقة أخرى", "wcOnlyS": "محافظ بدون متصفح خاص", "wcWarn": "فقط للمحافظ التي ليس لها متصفح خاص (Tangem وLedger Live وSafe…). أثناء مراجعة نطاقنا، قد تعرض محفظتك تحذيرًا أمنيًا عن طريق الخطأ. في هذه اللحظة، تنتظر خدمة الاتصال تحديث سجلها حتى تتم إزالة هذه الرسالة الخاطئة. Sectora وعقودها موثّقة على Etherscan، والاتصال يقرأ عنوانك فقط.", "wcPaste": "انسخ رابط الاتصال، وافتح محفظتك، وادخل إلى قسم الاتصال والصقه. ثم عد إلى هذه الصفحة.", "wcScanOnly": "امسح رمز QR هذا بمحفظتك، أو انسخ رابط الاتصال والصقه في قسم الاتصال فيها.", "copyBtn": "نسخ الرابط", "copiedBtn": "تم النسخ ✓", "closeWc": "إغلاق الاتصال عبر QR"}, "hi": {"soloPc": "यहाँ कनेक्ट करने के लिए वॉलेट एक्सटेंशन इंस्टॉल करें। फ़ोन पर, यह पेज अपने वॉलेट ऐप के अंदर खोलें।", "inst": "ब्राउज़र एक्सटेंशन इंस्टॉल करें", "others": "अन्य संगत वॉलेट", "wcOnlyS": "बिना अपने ब्राउज़र वाले वॉलेट", "wcWarn": "सिर्फ़ उन वॉलेट के लिए जिनका अपना ब्राउज़र नहीं है (Tangem, Ledger Live, Safe…)। जब तक हमारे डोमेन की समीक्षा हो रही है, आपका वॉलेट गलती से सुरक्षा चेतावनी दिखा सकता है। इस समय कनेक्शन सेवा अपने इतिहास के अपडेट का इंतज़ार कर रही है, ताकि यह गलत संदेश हटाया जा सके। Sectora और उसके कॉन्ट्रैक्ट Etherscan पर सत्यापित हैं, और कनेक्ट करने पर सिर्फ़ आपका पता पढ़ा जाता है।", "wcPaste": "कनेक्शन लिंक कॉपी करें, अपना वॉलेट खोलें, उसके कनेक्ट सेक्शन में जाकर पेस्ट करें। फिर इस टैब पर लौटें।", "wcScanOnly": "इस QR कोड को अपने वॉलेट से स्कैन करें, या कनेक्शन लिंक कॉपी करके उसके कनेक्ट सेक्शन में पेस्ट करें।", "copyBtn": "लिंक कॉपी करें", "copiedBtn": "कॉपी हो गया ✓", "closeWc": "QR कनेक्शन बंद करें"}};
  for (var pl in PC) { SOLO[pl] = SOLO[pl] || {}; for (var pk in PC[pl]) SOLO[pl][pk] = PC[pl][pk]; }
  for (var ol in OTRA) { SOLO[ol] = SOLO[ol] || {}; for (var ok2 in OTRA[ol]) SOLO[ol][ok2] = OTRA[ol][ok2]; }
  for (var sl in SOLO) { T[sl] = T[sl] || {}; for (var sk in SOLO[sl]) T[sl][sk] = SOLO[sl][sk]; }
  // Uniswap Wallet solo desde el ordenador (extension de Uniswap), sin WalletConnect
  var UNI = {"en": {"uniS": "Computer only · Uniswap extension", "uniTxt": "Uniswap Wallet connects from your computer: open this page in Chrome with the Uniswap extension, using the same wallet you have in the app. It connects directly.", "uniGet": "Get the Uniswap extension", "uniCopy": "Copy link to open on your computer"}, "es": {"uniS": "Solo desde el ordenador · extensión de Uniswap", "uniTxt": "Uniswap Wallet se conecta desde el ordenador: abre esta página en Chrome con la extensión de Uniswap, usando la misma wallet que tienes en la app. Se conecta directamente.", "uniGet": "Descargar la extensión de Uniswap", "uniCopy": "Copiar enlace para abrirlo en el ordenador"}, "pt": {"uniS": "Só pelo computador · extensão da Uniswap", "uniTxt": "A Uniswap Wallet conecta pelo computador: abra esta página no Chrome com a extensão da Uniswap, usando a mesma carteira que você tem no app. Ela conecta diretamente.", "uniGet": "Baixar a extensão da Uniswap", "uniCopy": "Copiar link para abrir no computador"}, "fr": {"uniS": "Ordinateur uniquement · extension Uniswap", "uniTxt": "Uniswap Wallet se connecte depuis un ordinateur : ouvrez cette page dans Chrome avec l’extension Uniswap, en utilisant le même wallet que dans l’app. La connexion est directe.", "uniGet": "Télécharger l’extension Uniswap", "uniCopy": "Copier le lien pour l’ouvrir sur l’ordinateur"}, "de": {"uniS": "Nur am Computer · Uniswap-Erweiterung", "uniTxt": "Uniswap Wallet verbindet sich am Computer: Öffne diese Seite in Chrome mit der Uniswap-Erweiterung und nutze dieselbe Wallet wie in der App. Die Verbindung erfolgt direkt.", "uniGet": "Uniswap-Erweiterung herunterladen", "uniCopy": "Link kopieren, um ihn am Computer zu öffnen"}, "ru": {"uniS": "Только с компьютера · расширение Uniswap", "uniTxt": "Uniswap Wallet подключается с компьютера: откройте эту страницу в Chrome с расширением Uniswap, используя тот же кошелёк, что и в приложении. Подключение идёт напрямую.", "uniGet": "Скачать расширение Uniswap", "uniCopy": "Скопировать ссылку, чтобы открыть на компьютере"}, "zh": {"uniS": "仅限电脑 · Uniswap 扩展", "uniTxt": "Uniswap Wallet 需在电脑上连接：请在安装了 Uniswap 扩展的 Chrome 中打开此页面，并使用与 App 中相同的钱包。它会直接连接。", "uniGet": "下载 Uniswap 扩展", "uniCopy": "复制链接，在电脑上打开"}, "ja": {"uniS": "パソコンのみ · Uniswap 拡張機能", "uniTxt": "Uniswap Wallet はパソコンから接続します。Uniswap 拡張機能を入れた Chrome でこのページを開き、アプリと同じウォレットを使ってください。そのまま直接接続できます。", "uniGet": "Uniswap 拡張機能を入手", "uniCopy": "パソコンで開くためにリンクをコピー"}, "ko": {"uniS": "컴퓨터 전용 · Uniswap 확장 프로그램", "uniTxt": "Uniswap Wallet은 컴퓨터에서 연결합니다. Uniswap 확장 프로그램이 설치된 Chrome에서 이 페이지를 열고, 앱과 같은 지갑을 사용하세요. 바로 연결됩니다.", "uniGet": "Uniswap 확장 프로그램 받기", "uniCopy": "컴퓨터에서 열 수 있도록 링크 복사"}, "ar": {"uniS": "من الكمبيوتر فقط · إضافة Uniswap", "uniTxt": "تتصل Uniswap Wallet من الكمبيوتر: افتح هذه الصفحة في Chrome مع إضافة Uniswap، باستخدام نفس المحفظة الموجودة في التطبيق. يتم الاتصال مباشرة.", "uniGet": "تنزيل إضافة Uniswap", "uniCopy": "انسخ الرابط لفتحه على الكمبيوتر"}, "hi": {"uniS": "सिर्फ़ कंप्यूटर से · Uniswap एक्सटेंशन", "uniTxt": "Uniswap Wallet कंप्यूटर से कनेक्ट होता है: Uniswap एक्सटेंशन वाले Chrome में यह पेज खोलें और वही वॉलेट इस्तेमाल करें जो आपके ऐप में है। यह सीधे कनेक्ट होता है।", "uniGet": "Uniswap एक्सटेंशन डाउनलोड करें", "uniCopy": "कंप्यूटर पर खोलने के लिए लिंक कॉपी करें"}};
  for (var ul in UNI) { T[ul] = T[ul] || {}; for (var uk in UNI[ul]) T[ul][uk] = UNI[ul][uk]; }
  function t(k, v) { var l = (document.documentElement.lang || "en").slice(0, 2), s = (T[l] || T.en)[k]; if (s == null) s = T.en[k]; if (v) for (var x in v) s = s.split("{" + x + "}").join(v[x]); return s; }

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
    // Phantom no usa WalletConnect para Ethereum: abre esta pagina en su navegador
    { id: "phantom", nombre: "Phantom", icono: PHANTOM, navegador: function () { return "https://phantom.app/ul/browse/" + enc(AQUI) + "?ref=" + enc(location.origin); } },
    { id: "trust", nombre: "Trust Wallet", logo: "trust", nativo: "trust://", navegador: function () { return "https://link.trustwallet.com/open_url?coin_id=60&url=" + enc(AQUI); } },
    { id: "binance", nombre: "Binance Wallet", logo: "binance", navegador: binance },
    { id: "coinbase", nombre: "Coinbase Wallet", logo: "coinbase", navegador: function () { return "https://go.cb-w.com/dapp?cb_url=" + enc(AQUI); } },
    { id: "okx", nombre: "OKX Wallet", logo: "okx", navegador: function () { return "https://www.okx.com/download?deeplink=" + enc("okx://wallet/dapp/url?dappUrl=" + enc(AQUI)); } },
    // mas wallets con navegador propio: abren esta pagina dentro de su app
    { id: "bitget", nombre: "Bitget Wallet", logo: "bitget", navegador: function () { return "https://bkcode.vip?action=dapp&url=" + enc(AQUI); } },
    { id: "tokenpocket", nombre: "TokenPocket", logo: "tokenPocket", navegador: function () { return "tpdapp://open?params=" + enc(JSON.stringify({ url: AQUI, chain: "ETH", source: "Sectora" })); } },
    { id: "imtoken", nombre: "imToken", logo: "imToken", navegador: function () { return "imtokenv2://navigate/DappView?url=" + enc(AQUI); } },
    { id: "rainbow", nombre: "Rainbow", logo: "rainbow", nativo: "rainbow://", navegador: function () { return "https://rnbwapp.com/dapp?url=" + enc(AQUI); } },
    { id: "rabby", nombre: "Rabby", icono: LOGO_EXTRA.rabby, navegador: function () { return "https://go.rabby.io/mobile/index.html?_cmd=open-dapp&dapp=" + enc(AQUI); } },
    { id: "magiceden", nombre: "Magic Eden", icono: LOGO_EXTRA.magicEden, navegador: function () { return "magiceden://browser/" + enc(AQUI); } },
    { id: "ronin", nombre: "Ronin Wallet", icono: LOGO_EXTRA.ronin, navegador: function () { return "roninwallet://in_app_browser?url=" + enc(AQUI); } }
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
    return n || "Wallet";
  }
  function via() { return conectado && conectado === wc ? nombreSesion(wc) : ""; }
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
  var wcAbierto = false;   // la persona abrio el panel de WalletConnect (Tangem, Ledger Live, Safe...)
  function nodo(tag, clase, texto) { var n = document.createElement(tag); if (clase) n.className = clase; if (texto) n.textContent = texto; return n; }
  function estilos() {
    if (document.getElementById("maw-css")) return;
    var s = document.createElement("style"); s.id = "maw-css";
    s.textContent = [
      ".maw{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.7);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
      ".maw[hidden]{display:none}",
      ".maw-p{position:relative;width:min(440px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#07090d;border:1px solid rgba(255,255,255,.12);padding:20px}",
      ".maw-p::before{content:'';position:absolute;left:-1px;right:-1px;top:-1px;height:3px;background:#1569ff}",
      ".maw-h{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:2px 0 8px;color:#e6eaf2;font-size:12px}",
      ".maw-x{padding:8px 0 8px 12px;color:#a3abbb;font:inherit;letter-spacing:inherit;text-transform:inherit}",
      ".maw-st{min-height:20px;margin:0 0 12px;color:#dfe4ec;font-size:14px;line-height:1.5}",
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
      ".maw-s{color:#a3abbb;font-size:11.5px;line-height:1.45;text-transform:none;letter-spacing:.01em}",
      ".maw-sec{margin:0;padding:14px 4px 6px;color:#a3abbb;font-size:11px;letter-spacing:.14em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08)}",
      ".maw-g{color:#4d8dff}",
      ".maw-f{margin-top:14px;display:flex;flex-direction:column;gap:12px}",
      ".maw-c{min-height:40px;border:1px solid rgba(255,255,255,.12);color:#fff}",
      ".maw-c:disabled{opacity:.4}",
      ".maw-a,.maw-o{margin:0;color:#a3abbb;font-size:13px;line-height:1.6}",
      ".maw-a a{color:#4d8dff}",
      ".maw-q{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:6px}",
      ".maw-qb{width:232px;height:232px;display:grid;place-items:center;background:#fff;padding:8px}",
      ".maw-qb svg{width:100%;height:100%;display:block}",
      ".maw-cb{align-self:flex-start;margin-top:6px;padding:7px 10px;border:1px solid rgba(77,141,255,.5);border-radius:6px;background:rgba(21,105,255,.1);color:#7fb0ff;font-size:10px;letter-spacing:.08em;white-space:nowrap}",
      ".maw-wcx{align-self:flex-end;padding:7px 11px;border:1px solid rgba(255,255,255,.18);color:#c6ccd8;font-size:10px;letter-spacing:.1em;text-transform:uppercase}",
      ".maw-w{margin:0;padding:11px 12px;border:1px solid rgba(232,180,92,.35);background:rgba(232,180,92,.07);color:#f1d6a4;font-size:13px;line-height:1.55}",
      ".maw-qt{margin:0;color:#a3abbb;font-size:13px;line-height:1.5;text-align:center}",
      ".maw-ux{display:flex;flex-direction:column;gap:8px;padding:10px 4px 12px;border-bottom:1px solid rgba(255,255,255,.08)}",
      ".maw-ux[hidden]{display:none}",
      ".maw-u{margin:0;padding:11px 12px;border:1px solid rgba(255,0,122,.35);background:rgba(255,0,122,.07);color:#fff;font-size:13px;line-height:1.55}",
      ".maw-ub{display:block;min-height:40px;padding:11px;border:1px solid rgba(255,255,255,.14);color:#c6ccd8;text-align:center;text-decoration:none;font-size:10px;letter-spacing:.12em;text-transform:uppercase}",
      ".maw-ub:hover{color:#fff;border-color:rgba(255,255,255,.3)}",
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
  // el estado va arriba y, con el panel de WalletConnect abierto, tambien junto a su QR
  function estado(texto, error) {
    if (!caja) return;
    caja.querySelectorAll(".maw-st").forEach(function (e) {
      e.textContent = ""; if (!error) e.appendChild(nodo("i")); e.appendChild(document.createTextNode(texto)); e.classList.toggle("err", !!error);
    });
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
  // copia esta pagina para abrirla en el navegador de la wallet (sin WalletConnect)
  function copiaAqui() {
    var ok = function () { estado(t("soloCopied")); };
    (navigator.clipboard ? navigator.clipboard.writeText(AQUI) : Promise.reject()).then(ok, function () { estado(AQUI); });
  }
  // fila que copia el enlace de esta pagina, con su boton "Copiar enlace" a la vista
  function filaCopiar(nombre) {
    var f = fila("button", { id: "otra" }, nombre, t("soloOtherS"), ENLACE);
    var b = nodo("span", "maw-cb mono", t("copyBtn")); f.querySelector(".maw-g").remove(); f.querySelector(".maw-t").appendChild(b);   // debajo del texto
    f.addEventListener("click", function () { copiaAqui(); b.textContent = t("copiedBtn"); setTimeout(function () { b.textContent = t("copyBtn"); }, 2000); });
    return f;
  }
  // mientras dura SOLO_APP, WalletConnect solo para las wallets sin navegador propio ni extension (Tangem,
  // Ledger Live, Safe...): primero un aviso; luego el QR en el ordenador y el enlace para pegar en el movil
  function filaSoloWC(qr) {
    var f = fila("button", { id: "solo-wc" }, "Tangem, Ledger Live, Safe…", t("wcOnlyS"), CARTERA);
    f.addEventListener("click", function () { wcAbierto = true; panelWC(qr); });
    return f;
  }
  function panelWC(qr) {
    qr.textContent = "";
    var x = nodo("button", "maw-wcx mono", "✕ " + t("closeWc")); x.type = "button";
    x.addEventListener("click", function () { wcAbierto = false; abrir(); });   // cierra el panel; el resto de la ventana sigue igual
    qr.appendChild(x); qr.appendChild(nodo("p", "maw-w", t("wcWarn"))); qr.appendChild(nodo("p", "maw-st"));
    if (MOVIL) qr.appendChild(copiar());   // en el telefono se copia el enlace: el boton va antes del QR
    qr.appendChild(nodo("div", "maw-qb")); qr.appendChild(nodo("p", "maw-qt", t("wcScanOnly")));
    if (!MOVIL) qr.appendChild(copiar());
    qr.dataset.on = "1"; pedirConexion();
    if (qr.isConnected) requestAnimationFrame(function () { qr.scrollIntoView({ block: "nearest", behavior: "smooth" }); });
  }
  // mientras dura SOLO_APP, Uniswap Wallet (su app no tiene navegador) se conecta desde el ordenador con su
  // extension, que entra directa sin WalletConnect: en el movil solo se explica, con el enlace para el ordenador
  var uniAbierto = false;
  function filaUni(box) {
    var f = fila("button", { id: "uniswap-pc" }, "Uniswap Wallet", t("uniS"), LOGO_EXTRA.uniswap);
    f.addEventListener("click", function () { uniAbierto = !uniAbierto; panelUni(box); });
    return f;
  }
  function panelUni(box) {
    box.textContent = ""; box.hidden = !uniAbierto;
    if (!uniAbierto) return;
    box.appendChild(nodo("p", "maw-u", t("uniTxt")));
    var c = nodo("button", "maw-ub mono", t("uniCopy")); c.type = "button";
    c.addEventListener("click", function () {
      (navigator.clipboard ? navigator.clipboard.writeText(AQUI) : Promise.reject()).then(function () {
        c.textContent = t("copiedBtn"); setTimeout(function () { c.textContent = t("uniCopy"); }, 2000);
      }, function () { estado(AQUI); });
    });
    box.appendChild(c);
    var a = nodo("a", "maw-ub mono", t("uniGet")); a.href = UNI_WEB; a.target = "_blank"; a.rel = "noopener";
    box.appendChild(a);
    if (box.isConnected) requestAnimationFrame(function () { box.scrollIntoView({ block: "nearest", behavior: "smooth" }); });
  }
  // movil sin wallet, mientras dura SOLO_APP: solo abrir esta pagina en la app de la wallet
  function vistaSoloApp() {
    caja.textContent = ""; cabecera(t("soloT")); estado(t("soloS"));
    var lista = nodo("div", "maw-l");
    inyectadas().forEach(function (w) { var f = fila("button", { id: "iny" }, w.nombre, t("det"), w.icono); f.addEventListener("click", function () { usar(w.proveedor); }); lista.appendChild(f); });
    // Uniswap Wallet va segunda, detras de MetaMask
    APPS.filter(function (a) { return a.navegador; }).forEach(function (a, i) {
      var f = fila("a", a, a.nombre, t("brw"), a.icono); f.href = a.navegador(); f.rel = "noopener"; lista.appendChild(f);
      if (i === 0) { var u = nodo("div", "maw-ux"); lista.appendChild(filaUni(u)); lista.appendChild(u); panelUni(u); }
    });
    // cualquier otra wallet con navegador: copiar el enlace y abrirlo ahi (sin WalletConnect)
    lista.appendChild(filaCopiar(t("soloOtherN")));
    var qrm = nodo("div", "maw-q"); lista.appendChild(filaSoloWC(qrm));
    caja.appendChild(lista); caja.appendChild(qrm); if (wcAbierto) panelWC(qrm);
    var pie = nodo("div", "maw-f"); pie.appendChild(nodo("p", "maw-a", t("soloF"))); pie.appendChild(nodo("p", "maw-o", t("only"))); caja.appendChild(pie);
  }
  function vistaMovil() {
    if (SOLO_APP) { vistaSoloApp(); return; }
    caja.textContent = ""; cabecera(t("pickM"));
    var lista = nodo("div", "maw-l");
    inyectadas().forEach(function (w) { var f = fila("button", { id: "iny" }, w.nombre, t("det"), w.icono); f.addEventListener("click", function () { usar(w.proveedor); }); lista.appendChild(f); });
    APPS.forEach(function (a) {
      var f = fila("a", a, a.nombre, conWC(a) ? t("wc") : t("brw"), a.icono);
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
    if (SOLO_APP) {
      // mientras dura SOLO_APP, sin QR (WalletConnect): el enlace para abrir la pagina en la app del telefono
      // todas las wallets, siempre: las no instaladas llevan a su extension; las que solo son app del movil y
      // la ultima fila copian el enlace para abrirlo en el telefono
      if (!ext.length) estado(t("soloPc"));
      else lista.appendChild(nodo("p", "maw-sec mono", t("others")));
      INSTALAR.filter(function (w) { return !ext.some(function (e) { return w.m.test(e.nombre); }); }).forEach(function (w) {
        var i;
        if (w.web) { i = fila("a", w, w.nombre, t("inst"), w.icono); i.href = w.web; i.target = "_blank"; i.rel = "noopener"; }
        else { i = fila("button", w, w.nombre, t("soloOtherS"), w.icono); i.addEventListener("click", copiaAqui); }
        lista.appendChild(i);
      });
      lista.appendChild(filaCopiar(t("phone")));
      var qrp = nodo("div", "maw-q"); lista.appendChild(filaSoloWC(qrp)); caja.appendChild(qrp); if (wcAbierto) panelWC(qrp);
      var pie0 = nodo("div", "maw-f"); pie0.appendChild(nodo("p", "maw-o", t("only"))); caja.appendChild(pie0);
      return;
    }
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
    if (!caja || SOLO_APP) return [];   // con SOLO_APP ninguna fila de wallet pasa por WalletConnect
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
    estado(MOVIL ? (SOLO_APP ? t("wcPaste") : t("tapM")) : t("tapD"));
  }
  /* el enlace se pide antes del toque: en Safari del iPhone la app solo se abre si el enlace sale directo del toque */
  function pedirConexion() {
    if (pidiendo) { if (uri) pintarUri(); return; }
    pidiendo = true; estado(t("prep"));
    proveedorWC().then(function (p) {
      if (p.session && p.accounts && p.accounts.length) { pidiendo = false; entregar(p); return; }
      var alUri = function (u) { if (typeof u === "string" && /^wc:/.test(u)) { uri = u; if (!SOLO_APP || wcAbierto) pintarUri(); } };
      p.on("display_uri", alUri);
      return p.connect().then(function () { entregar(p); }, function (e) {
        uri = "";
        if (ov && !ov.hidden && (!SOLO_APP || wcAbierto)) {
          estado(/reject|denied|cancel/i.test((e && e.message) || "") ? t("rej") : t("exp"), true);
          caja.querySelectorAll(".maw-st").forEach(function (st) {
            var otra = nodo("button", "mono", t("retry")); otra.type = "button"; otra.addEventListener("click", function () { abrir(); });
            st.appendChild(otra);
          });
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
    if (MOVIL) { vistaMovil(); ov.hidden = false; if (!SOLO_APP) { if (uri) pintarUri(); else pedirConexion(); } }
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
