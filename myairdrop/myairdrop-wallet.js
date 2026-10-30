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
  var INSTALAR = [
    { id: "i-metamask", nombre: "MetaMask", logo: "metaMask", m: /metamask/i, web: "https://metamask.io/download/" },
    { id: "i-phantom", nombre: "Phantom", icono: PHANTOM, m: /phantom/i, web: "https://phantom.com/download" },
    { id: "i-trust", nombre: "Trust Wallet", logo: "trust", m: /trust/i, web: "https://trustwallet.com/download" },
    { id: "i-binance", nombre: "Binance Wallet", logo: "binance", m: /binance/i },
    { id: "i-coinbase", nombre: "Coinbase Wallet", logo: "coinbase", m: /coinbase/i, web: "https://www.coinbase.com/wallet/downloads" },
    { id: "i-okx", nombre: "OKX Wallet", logo: "okx", m: /okx/i, web: "https://www.okx.com/web3" },
    { id: "i-bitget", nombre: "Bitget Wallet", logo: "bitget", m: /bitget/i, web: "https://web3.bitget.com/" },
    { id: "i-tokenpocket", nombre: "TokenPocket", logo: "tokenPocket", m: /tokenpocket/i },
    { id: "i-imtoken", nombre: "imToken", logo: "imToken", m: /imtoken/i },
    { id: "i-rainbow", nombre: "Rainbow", logo: "rainbow", m: /rainbow/i, web: "https://rainbow.me/download" }
  ];
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
  // textos del modo temporal SOLO_APP (abrir la pagina en la app de la wallet)
  var SOLO = {"en": {"soloT": "Open this page in your wallet", "soloS": "To connect from your phone, open this page inside your wallet app. Tap your wallet:", "soloF": "Your node, staking and airdrop work the same inside your wallet app. On a computer you can also connect as usual."}, "es": {"soloT": "Abre esta página en tu wallet", "soloS": "Para conectar desde el teléfono, abre esta página dentro de la app de tu wallet. Toca tu wallet:", "soloF": "Tu nodo, tu staking y tu airdrop funcionan igual dentro de la app de tu wallet. En el ordenador también puedes conectar como siempre."}, "pt": {"soloT": "Abra esta página na sua carteira", "soloS": "Para conectar pelo celular, abra esta página dentro do app da sua carteira. Toque na sua carteira:", "soloF": "Seu nó, seu staking e seu airdrop funcionam igual dentro do app da sua carteira. No computador você também pode conectar como sempre."}, "fr": {"soloT": "Ouvrez cette page dans votre wallet", "soloS": "Pour vous connecter depuis votre téléphone, ouvrez cette page dans l’app de votre wallet. Touchez votre wallet :", "soloF": "Votre nœud, votre staking et votre airdrop fonctionnent de la même façon dans l’app de votre wallet. Sur ordinateur, vous pouvez aussi vous connecter comme d’habitude."}, "de": {"soloT": "Öffne diese Seite in deiner Wallet", "soloS": "Um dich vom Handy aus zu verbinden, öffne diese Seite in der App deiner Wallet. Tippe auf deine Wallet:", "soloF": "Dein Node, dein Staking und dein Airdrop funktionieren in der App deiner Wallet genauso. Am Computer kannst du dich auch wie gewohnt verbinden."}, "ru": {"soloT": "Откройте эту страницу в своём кошельке", "soloS": "Чтобы подключиться с телефона, откройте эту страницу в приложении своего кошелька. Выберите кошелёк:", "soloF": "Узел, стейкинг и аирдроп работают так же внутри приложения кошелька. На компьютере можно подключаться как обычно."}, "zh": {"soloT": "在你的钱包中打开此页面", "soloS": "如需在手机上连接，请在钱包 App 内打开此页面。选择你的钱包：", "soloF": "在钱包 App 内，你的节点、质押和空投一切照常。在电脑上也可以照常连接。"}, "ja": {"soloT": "このページをウォレットで開いてください", "soloS": "スマホから接続するには、ウォレットアプリ内でこのページを開いてください。ウォレットを選んでください：", "soloF": "ノード、ステーキング、エアドロップはウォレットアプリ内でも同じように使えます。パソコンからはこれまで通り接続できます。"}, "ko": {"soloT": "이 페이지를 지갑에서 여세요", "soloS": "휴대폰에서 연결하려면 지갑 앱 안에서 이 페이지를 여세요. 지갑을 선택하세요:", "soloF": "노드, 스테이킹, 에어드랍은 지갑 앱 안에서도 똑같이 작동합니다. 컴퓨터에서는 평소처럼 연결할 수 있습니다."}, "ar": {"soloT": "افتح هذه الصفحة في محفظتك", "soloS": "للاتصال من هاتفك، افتح هذه الصفحة داخل تطبيق محفظتك. اختر محفظتك:", "soloF": "عقدتك وتخزينك والإيردروب تعمل بالطريقة نفسها داخل تطبيق محفظتك. ويمكنك على الحاسوب الاتصال كالمعتاد."}, "hi": {"soloT": "यह पेज अपने वॉलेट में खोलें", "soloS": "फ़ोन से कनेक्ट करने के लिए यह पेज अपने वॉलेट ऐप के अंदर खोलें। अपना वॉलेट चुनें:", "soloF": "आपका नोड, स्टेकिंग और एयरड्रॉप वॉलेट ऐप के अंदर भी वैसे ही चलते हैं। कंप्यूटर पर आप हमेशा की तरह कनेक्ट कर सकते हैं।"}};
  var OTRA = {"en": {"soloOtherN": "Another wallet", "soloOtherS": "Copy the link and open it in your wallet’s browser", "soloCopied": "Link copied. Open your wallet app, go to its browser and paste it."}, "es": {"soloOtherN": "Otra wallet", "soloOtherS": "Copia el enlace y ábrelo en el navegador de tu wallet", "soloCopied": "Enlace copiado. Abre la app de tu wallet, entra en su navegador y pégalo."}, "pt": {"soloOtherN": "Outra carteira", "soloOtherS": "Copie o link e abra no navegador da sua carteira", "soloCopied": "Link copiado. Abra o app da sua carteira, vá ao navegador dela e cole."}, "fr": {"soloOtherN": "Un autre wallet", "soloOtherS": "Copiez le lien et ouvrez-le dans le navigateur de votre wallet", "soloCopied": "Lien copié. Ouvrez l’app de votre wallet, allez dans son navigateur et collez-le."}, "de": {"soloOtherN": "Andere Wallet", "soloOtherS": "Kopiere den Link und öffne ihn im Browser deiner Wallet", "soloCopied": "Link kopiert. Öffne deine Wallet-App, geh in ihren Browser und füge ihn ein."}, "ru": {"soloOtherN": "Другой кошелёк", "soloOtherS": "Скопируйте ссылку и откройте её в браузере кошелька", "soloCopied": "Ссылка скопирована. Откройте приложение кошелька, перейдите в его браузер и вставьте её."}, "zh": {"soloOtherN": "其他钱包", "soloOtherS": "复制链接并在钱包的浏览器中打开", "soloCopied": "链接已复制。打开你的钱包 App，进入其浏览器并粘贴。"}, "ja": {"soloOtherN": "その他のウォレット", "soloOtherS": "リンクをコピーしてウォレットのブラウザで開いてください", "soloCopied": "リンクをコピーしました。ウォレットアプリを開き、ブラウザに貼り付けてください。"}, "ko": {"soloOtherN": "다른 지갑", "soloOtherS": "링크를 복사해 지갑의 브라우저에서 여세요", "soloCopied": "링크가 복사되었습니다. 지갑 앱을 열고 브라우저에 붙여 넣으세요."}, "ar": {"soloOtherN": "محفظة أخرى", "soloOtherS": "انسخ الرابط وافتحه في متصفح محفظتك", "soloCopied": "تم نسخ الرابط. افتح تطبيق محفظتك وادخل إلى متصفحه والصقه."}, "hi": {"soloOtherN": "कोई और वॉलेट", "soloOtherS": "लिंक कॉपी करें और अपने वॉलेट के ब्राउज़र में खोलें", "soloCopied": "लिंक कॉपी हो गया। अपना वॉलेट ऐप खोलें, उसके ब्राउज़र में जाएँ और पेस्ट करें।"}};
  // ordenador sin QR mientras dura SOLO_APP: extensiones y el enlace para el telefono
  var PC = {"en": {"soloPc": "To connect here, install a wallet extension. On your phone, open this page inside your wallet app.", "inst": "Install the browser extension", "others": "Other compatible wallets", "wcOnlyS": "Wallets without their own browser · WalletConnect", "wcWarn": "Only for wallets without their own browser (Tangem, Ledger Live, Safe…). While WalletConnect reviews our domain, your wallet may show a security warning by mistake. Sectora and its contracts are verified on Etherscan, and connecting only reads your address.", "wcPaste": "Copy the connection link, open your wallet, go to WalletConnect and paste it. Then come back to this tab.", "wcScanOnly": "Scan this QR code with your wallet, or copy the connection link and paste it in its WalletConnect section."}, "es": {"soloPc": "Para conectar aquí, instala una extensión de wallet. En el teléfono, abre esta página dentro de la app de tu wallet.", "inst": "Instala la extensión del navegador", "others": "Otras wallets compatibles", "wcOnlyS": "Wallets sin navegador propio · WalletConnect", "wcWarn": "Solo para wallets sin navegador propio (Tangem, Ledger Live, Safe…). Mientras WalletConnect revisa nuestro dominio, tu wallet puede mostrar un aviso de seguridad por error. Sectora y sus contratos están verificados en Etherscan, y conectar solo lee tu dirección.", "wcPaste": "Copia el enlace de conexión, abre tu wallet, entra en WalletConnect y pégalo. Después vuelve a esta pestaña.", "wcScanOnly": "Escanea este QR con tu wallet, o copia el enlace de conexión y pégalo en su apartado de WalletConnect."}, "pt": {"soloPc": "Para conectar aqui, instale uma extensão de carteira. No celular, abra esta página dentro do app da sua carteira.", "inst": "Instale a extensão do navegador", "others": "Outras carteiras compatíveis", "wcOnlyS": "Carteiras sem navegador próprio · WalletConnect", "wcWarn": "Só para carteiras sem navegador próprio (Tangem, Ledger Live, Safe…). Enquanto o WalletConnect revisa nosso domínio, sua carteira pode mostrar um aviso de segurança por engano. A Sectora e seus contratos são verificados no Etherscan, e conectar só lê o seu endereço.", "wcPaste": "Copie o link de conexão, abra sua carteira, vá ao WalletConnect e cole. Depois volte para esta aba.", "wcScanOnly": "Escaneie este QR com sua carteira, ou copie o link de conexão e cole na seção WalletConnect dela."}, "fr": {"soloPc": "Pour vous connecter ici, installez une extension de wallet. Sur votre téléphone, ouvrez cette page dans l’app de votre wallet.", "inst": "Installez l’extension du navigateur", "others": "Autres wallets compatibles", "wcOnlyS": "Wallets sans navigateur intégré · WalletConnect", "wcWarn": "Uniquement pour les wallets sans navigateur intégré (Tangem, Ledger Live, Safe…). Pendant que WalletConnect examine notre domaine, votre wallet peut afficher un avertissement de sécurité par erreur. Sectora et ses contrats sont vérifiés sur Etherscan, et la connexion ne lit que votre adresse.", "wcPaste": "Copiez le lien de connexion, ouvrez votre wallet, allez dans WalletConnect et collez-le. Revenez ensuite sur cet onglet.", "wcScanOnly": "Scannez ce QR code avec votre wallet, ou copiez le lien de connexion et collez-le dans sa section WalletConnect."}, "de": {"soloPc": "Um dich hier zu verbinden, installiere eine Wallet-Erweiterung. Auf dem Handy öffne diese Seite in deiner Wallet-App.", "inst": "Browser-Erweiterung installieren", "others": "Weitere kompatible Wallets", "wcOnlyS": "Wallets ohne eigenen Browser · WalletConnect", "wcWarn": "Nur für Wallets ohne eigenen Browser (Tangem, Ledger Live, Safe…). Während WalletConnect unsere Domain prüft, kann deine Wallet irrtümlich eine Sicherheitswarnung anzeigen. Sectora und seine Verträge sind auf Etherscan verifiziert, und beim Verbinden wird nur deine Adresse gelesen.", "wcPaste": "Kopiere den Verbindungslink, öffne deine Wallet, gehe zu WalletConnect und füge ihn ein. Komm dann zu diesem Tab zurück.", "wcScanOnly": "Scanne diesen QR-Code mit deiner Wallet oder kopiere den Verbindungslink und füge ihn im WalletConnect-Bereich ein."}, "ru": {"soloPc": "Чтобы подключиться здесь, установите расширение кошелька. На телефоне откройте эту страницу в приложении кошелька.", "inst": "Установить расширение браузера", "others": "Другие совместимые кошельки", "wcOnlyS": "Кошельки без своего браузера · WalletConnect", "wcWarn": "Только для кошельков без своего браузера (Tangem, Ledger Live, Safe…). Пока WalletConnect проверяет наш домен, кошелёк может по ошибке показать предупреждение безопасности. Sectora и её контракты верифицированы на Etherscan, а подключение только считывает ваш адрес.", "wcPaste": "Скопируйте ссылку подключения, откройте кошелёк, перейдите в WalletConnect и вставьте её. Затем вернитесь на эту вкладку.", "wcScanOnly": "Отсканируйте этот QR-код кошельком или скопируйте ссылку подключения и вставьте её в разделе WalletConnect."}, "zh": {"soloPc": "要在此连接，请安装钱包浏览器扩展。在手机上，请在钱包 App 内打开此页面。", "inst": "安装浏览器扩展", "others": "其他兼容钱包", "wcOnlyS": "没有内置浏览器的钱包 · WalletConnect", "wcWarn": "仅适用于没有内置浏览器的钱包（Tangem、Ledger Live、Safe…）。在 WalletConnect 审核我们的域名期间，你的钱包可能会误报安全警告。Sectora 及其合约已在 Etherscan 上验证，连接只会读取你的地址。", "wcPaste": "复制连接链接，打开你的钱包，进入 WalletConnect 并粘贴。然后回到此页面。", "wcScanOnly": "用你的钱包扫描此二维码，或复制连接链接并粘贴到钱包的 WalletConnect 中。"}, "ja": {"soloPc": "ここで接続するには、ウォレットの拡張機能をインストールしてください。スマホでは、ウォレットアプリ内でこのページを開いてください。", "inst": "ブラウザ拡張機能をインストール", "others": "その他の対応ウォレット", "wcOnlyS": "ブラウザのないウォレット · WalletConnect", "wcWarn": "ブラウザを持たないウォレット（Tangem、Ledger Live、Safe…）専用です。WalletConnect が当サイトのドメインを確認している間、ウォレットに誤ってセキュリティ警告が表示されることがあります。Sectora とそのコントラクトは Etherscan で検証済みで、接続してもアドレスを読み取るだけです。", "wcPaste": "接続リンクをコピーし、ウォレットを開いて WalletConnect に貼り付けてください。その後このタブに戻ってください。", "wcScanOnly": "このQRコードをウォレットでスキャンするか、接続リンクをコピーしてウォレットの WalletConnect に貼り付けてください。"}, "ko": {"soloPc": "여기서 연결하려면 지갑 확장 프로그램을 설치하세요. 휴대폰에서는 지갑 앱 안에서 이 페이지를 여세요.", "inst": "브라우저 확장 프로그램 설치", "others": "기타 호환 지갑", "wcOnlyS": "자체 브라우저가 없는 지갑 · WalletConnect", "wcWarn": "자체 브라우저가 없는 지갑(Tangem, Ledger Live, Safe…) 전용입니다. WalletConnect가 저희 도메인을 검토하는 동안 지갑에 보안 경고가 잘못 표시될 수 있습니다. Sectora와 컨트랙트는 Etherscan에서 검증되었으며, 연결 시 주소만 읽습니다.", "wcPaste": "연결 링크를 복사하고 지갑을 열어 WalletConnect에 붙여 넣으세요. 그런 다음 이 탭으로 돌아오세요.", "wcScanOnly": "지갑으로 이 QR 코드를 스캔하거나, 연결 링크를 복사해 지갑의 WalletConnect에 붙여 넣으세요."}, "ar": {"soloPc": "للاتصال هنا، ثبّت إضافة محفظة. على هاتفك، افتح هذه الصفحة داخل تطبيق محفظتك.", "inst": "ثبّت إضافة المتصفح", "others": "محافظ متوافقة أخرى", "wcOnlyS": "محافظ بدون متصفح خاص · WalletConnect", "wcWarn": "فقط للمحافظ التي ليس لها متصفح خاص (Tangem وLedger Live وSafe…). أثناء مراجعة WalletConnect لنطاقنا، قد تعرض محفظتك تحذيرًا أمنيًا عن طريق الخطأ. Sectora وعقودها موثّقة على Etherscan، والاتصال يقرأ عنوانك فقط.", "wcPaste": "انسخ رابط الاتصال، وافتح محفظتك، وادخل إلى WalletConnect والصقه. ثم عد إلى هذه الصفحة.", "wcScanOnly": "امسح رمز QR هذا بمحفظتك، أو انسخ رابط الاتصال والصقه في قسم WalletConnect فيها."}, "hi": {"soloPc": "यहाँ कनेक्ट करने के लिए वॉलेट एक्सटेंशन इंस्टॉल करें। फ़ोन पर, यह पेज अपने वॉलेट ऐप के अंदर खोलें।", "inst": "ब्राउज़र एक्सटेंशन इंस्टॉल करें", "others": "अन्य संगत वॉलेट", "wcOnlyS": "बिना अपने ब्राउज़र वाले वॉलेट · WalletConnect", "wcWarn": "सिर्फ़ उन वॉलेट के लिए जिनका अपना ब्राउज़र नहीं है (Tangem, Ledger Live, Safe…)। जब तक WalletConnect हमारे डोमेन की समीक्षा कर रहा है, आपका वॉलेट गलती से सुरक्षा चेतावनी दिखा सकता है। Sectora और उसके कॉन्ट्रैक्ट Etherscan पर सत्यापित हैं, और कनेक्ट करने पर सिर्फ़ आपका पता पढ़ा जाता है।", "wcPaste": "कनेक्शन लिंक कॉपी करें, अपना वॉलेट खोलें, WalletConnect में जाकर पेस्ट करें। फिर इस टैब पर लौटें।", "wcScanOnly": "इस QR कोड को अपने वॉलेट से स्कैन करें, या कनेक्शन लिंक कॉपी करके उसके WalletConnect सेक्शन में पेस्ट करें।"}};
  for (var pl in PC) { SOLO[pl] = SOLO[pl] || {}; for (var pk in PC[pl]) SOLO[pl][pk] = PC[pl][pk]; }
  for (var ol in OTRA) { SOLO[ol] = SOLO[ol] || {}; for (var ok2 in OTRA[ol]) SOLO[ol][ok2] = OTRA[ol][ok2]; }
  for (var sl in SOLO) { T[sl] = T[sl] || {}; for (var sk in SOLO[sl]) T[sl][sk] = SOLO[sl][sk]; }
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
    { id: "trust", nombre: "Trust Wallet", logo: "trust", nativo: "trust://", navegador: function () { return "https://link.trustwallet.com/open_url?coin_id=60&url=" + enc(AQUI); } },
    { id: "binance", nombre: "Binance Wallet", logo: "binance", navegador: binance },
    { id: "coinbase", nombre: "Coinbase Wallet", logo: "coinbase", navegador: function () { return "https://go.cb-w.com/dapp?cb_url=" + enc(AQUI); } },
    { id: "okx", nombre: "OKX Wallet", logo: "okx", navegador: function () { return "https://www.okx.com/download?deeplink=" + enc("okx://wallet/dapp/url?dappUrl=" + enc(AQUI)); } },
    // mas wallets con navegador propio: abren esta pagina dentro de su app
    { id: "bitget", nombre: "Bitget Wallet", logo: "bitget", navegador: function () { return "https://bkcode.vip?action=dapp&url=" + enc(AQUI); } },
    { id: "tokenpocket", nombre: "TokenPocket", logo: "tokenPocket", navegador: function () { return "tpdapp://open?params=" + enc(JSON.stringify({ url: AQUI, chain: "ETH", source: "Sectora" })); } },
    { id: "imtoken", nombre: "imToken", logo: "imToken", navegador: function () { return "imtokenv2://navigate/DappView?url=" + enc(AQUI); } },
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
      ".maw-w{margin:0;padding:11px 12px;border:1px solid rgba(232,180,92,.35);background:rgba(232,180,92,.07);color:#f1d6a4;font-size:13px;line-height:1.55}",
      ".maw-qt{margin:0;color:#a3abbb;font-size:13px;line-height:1.5;text-align:center}",
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
  // copia esta pagina para abrirla en el navegador de la wallet (sin WalletConnect)
  function copiaAqui() {
    var ok = function () { estado(t("soloCopied")); };
    (navigator.clipboard ? navigator.clipboard.writeText(AQUI) : Promise.reject()).then(ok, function () { estado(AQUI); });
  }
  // mientras dura SOLO_APP, WalletConnect solo para las wallets sin navegador propio ni extension (Tangem,
  // Ledger Live, Safe...): primero un aviso; luego el QR en el ordenador y el enlace para pegar en el movil
  function filaSoloWC(qr) {
    var f = fila("button", { id: "solo-wc", logo: "walletConnect" }, "Tangem, Ledger Live, Safe…", t("wcOnlyS"));
    f.addEventListener("click", function () { f.remove(); panelWC(qr); });
    return f;
  }
  function panelWC(qr) {
    qr.textContent = ""; qr.appendChild(nodo("p", "maw-w", t("wcWarn")));
    if (!MOVIL) { qr.appendChild(nodo("div", "maw-qb")); qr.appendChild(nodo("p", "maw-qt", t("wcScanOnly"))); }
    qr.appendChild(copiar());
    qr.dataset.on = "1"; pedirConexion();
  }
  // movil sin wallet, mientras dura SOLO_APP: solo abrir esta pagina en la app de la wallet
  function vistaSoloApp() {
    caja.textContent = ""; cabecera(t("soloT")); estado(t("soloS"));
    var lista = nodo("div", "maw-l");
    inyectadas().forEach(function (w) { var f = fila("button", { id: "iny" }, w.nombre, t("det"), w.icono); f.addEventListener("click", function () { usar(w.proveedor); }); lista.appendChild(f); });
    APPS.filter(function (a) { return a.navegador; }).forEach(function (a) { var f = fila("a", a, a.nombre, t("brw")); f.href = a.navegador(); f.rel = "noopener"; lista.appendChild(f); });
    // cualquier otra wallet con navegador: copiar el enlace y abrirlo ahi (sin WalletConnect)
    var otra = fila("button", { id: "otra" }, t("soloOtherN"), t("soloOtherS"), ENLACE);
    otra.addEventListener("click", copiaAqui);
    lista.appendChild(otra);
    var qrm = nodo("div", "maw-q"); lista.appendChild(filaSoloWC(qrm));
    caja.appendChild(lista); caja.appendChild(qrm);
    var pie = nodo("div", "maw-f"); pie.appendChild(nodo("p", "maw-a", t("soloF"))); pie.appendChild(nodo("p", "maw-o", t("only"))); caja.appendChild(pie);
  }
  function vistaMovil() {
    if (SOLO_APP) { vistaSoloApp(); return; }
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
      var tel = fila("button", { id: "otra" }, t("phone"), t("soloOtherS"), ENLACE); tel.addEventListener("click", copiaAqui); lista.appendChild(tel);
      var qrp = nodo("div", "maw-q"); lista.appendChild(filaSoloWC(qrp)); caja.appendChild(qrp);
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
