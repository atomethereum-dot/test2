/* Shield Check (Sectora Shield, beta).
 * Lee datos publicos de seguridad desde el navegador del visitante: GoPlus Security (token, direccion,
 * aprobaciones y phishing) y DexScreener (mercado). No pide conectar wallet ni firmar nada.
 * Cada hallazgo tiene una severidad; la puntuacion es 100 menos el peso de los hallazgos. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const GP = 'https://api.gopluslabs.io/api/v1', GP2 = 'https://api.gopluslabs.io/api/v2';
  const DS = 'https://api.dexscreener.com/latest/dex/tokens/';
  const CHAINS = {
    1: { n: 'Ethereum', ds: 'ethereum', ex: 'https://etherscan.io' },
    56: { n: 'BNB Chain', ds: 'bsc', ex: 'https://bscscan.com' },
    8453: { n: 'Base', ds: 'base', ex: 'https://basescan.org' },
    42161: { n: 'Arbitrum', ds: 'arbitrum', ex: 'https://arbiscan.io' },
    137: { n: 'Polygon', ds: 'polygon', ex: 'https://polygonscan.com' },
    10: { n: 'Optimism', ds: 'optimism', ex: 'https://optimistic.etherscan.io' },
    43114: { n: 'Avalanche', ds: 'avalanche', ex: 'https://snowtrace.io' },
    4663: { n: 'Robinhood Chain', ds: 'robinhood', ex: 'https://robinhoodchain.blockscout.com' },
    sol: { n: 'Solana', ds: 'solana', ex: 'https://solscan.io', sol: true }
  };
  const exTok = (c, a) => c.ex + '/token/' + a, exAcc = (c, a) => c.ex + (c.sol ? '/account/' : '/address/') + a;
  const DS2ID = Object.fromEntries(Object.entries(CHAINS).map(([id, c]) => [c.ds, id]));
  const ZERO = '0x0000000000000000000000000000000000000000', DEAD = '0x000000000000000000000000000000000000dead';
  const hAddr = h => h.address || h.account || h.token_account || '';
  const isBurn = a => { a = (a || '').toLowerCase(); return a === ZERO || a === DEAD || /^0x0{30,}/.test(a) || a.endsWith('dead'); };
  const ADDR = /^0x[a-fA-F0-9]{40}$/, SOL = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  const st = x => x && typeof x === 'object' && !Array.isArray(x) ? x.status : x;
  /* direcciones conocidas del ecosistema Sectora, con su nombre en la lista de holders */
  const KNOWN = { '0x79cb8b3b3e81a2b25c6d7250c3c5a742aa8320e0': 'APY Contract' };

  /* ---------------- textos ---------------- */
  const T = {
    en: {
      tNft: 'NFT', hintNft: 'Contract address of an NFT collection on an EVM network.', phNft: '0x… NFT collection address', stNft: 'Reading the NFT contract', stDapp: 'Reading dApp security data',
      nftNf: 'There is no NFT security data for this address on {c}. Check the address or pick another network.', sumCritN: 'Critical risk: {x}. Avoid this collection.',
      kStd: 'Standard', kItems: 'Items', kOwners: 'Owners', kSales: 'Sales 24h', nftAuto: 'Showing {c}. Pick another network to check the collection there.',
      dTitle: 'dApp security', dAudit: 'Audit · {f}', dNoAudit: 'No audits on record', dTrusted: 'Trusted dApp', dContracts: 'Contracts',
      dNone: 'No dApp security data for this site. That’s normal for websites that aren’t dApps.', dOpen: 'open source', dClosed: 'code not verified', dMal: 'malicious', dMalT: 'Malicious dApp contract',
      dMalSum: 'One of this dApp’s contracts is flagged as malicious. Don’t connect your wallet.',
      fNft: 'Before you mint or buy: can the owner mint at will, burn your NFTs or move them without your approval?',
      fSeal: 'Projects can show their live Shield Check result on their own website with one line of code.',
      sealEyebrow: 'Shield Seal', sealTitle: 'Show this result on your website', sealText: 'Paste this code on your site. The seal checks the token live every time it loads, so it always shows the current result, good or bad.',
      sealDark: 'Dark', sealLight: 'Light', sealCopy: 'Copy seal code', sealChecking: 'Checking…', sealFail: 'Check unavailable', sealOpen: 'Open the full Shield Check report',
      navShield: 'Sectora Shield', navHome: 'Main site', eyebrow: 'Sectora Shield · free security scanner',
      h1a: 'Check before', h1b: 'you trust.',
      lead: 'Paste any token, wallet or link. Shield Check reads public on-chain security data and explains every risk in plain language, in seconds.',
      tToken: 'Token', tWallet: 'Wallet', tApprovals: 'Approvals', tLink: 'Website', network: 'Network', auto: 'Auto-detect', scan: 'Scan',
      hintToken: 'Token address on Ethereum, Solana, Base, BNB Chain, Robinhood Chain and more. Shield Check finds the network for you.', errSolMode: 'On Solana, Shield Check checks tokens for now. Use the Token tab.',
      hintWallet: 'Any wallet or contract address. See if it is linked to scams before you send funds.',
      hintApprovals: 'Your wallet address. See which contracts can spend your tokens. No connection needed.',
      hintLink: 'A website or dApp link you received in a DM, an ad or a comment. We check phishing lists and the dApp’s audits and contracts.',
      phToken: '0x… or Solana token address', phWallet: '0x… wallet address', phApprovals: '0x… your wallet address', phLink: 'https://…',
      try: 'Try', sChecks: 'security checks', sChains: 'networks', sTools: 'tools',
      fEyebrow: 'Five tools and a live seal',
      fToken: 'Honeypots, hidden owners, mint functions, changeable fees, blacklists, liquidity, locks and holder concentration.',
      fWallet: 'Before you send funds: is this address linked to phishing, theft, sanctions, mixers or scam contracts?',
      fApprovals: 'See which contracts can spend your tokens, spot unlimited and risky approvals, and revoke them.',
      fLink: 'Got a link in a DM or an ad? Check phishing lists and the dApp’s audits and contracts before you connect your wallet.',
      hEyebrow: 'How it works', hTitle: 'Public data, read for you.',
      hText: 'Shield Check never asks you to connect a wallet or sign anything. It reads public security data from GoPlus Security and market data from DexScreener, scores every finding and tells you what it means.',
      h1: 'Paste an address or link', h2: 'We read the contract, trading and holders', h3: 'You get a score and a plain-language report',
      disclaimer: 'Shield Check is an automated tool based on public data. It is not financial advice and a clean result does not guarantee a project is safe. Always do your own research.',
      sources: 'Data',
      errAddr: 'That doesn’t look like an address. EVM addresses start with 0x and have 42 characters; Solana addresses have 32 to 44 letters and numbers.',
      errUrl: 'That doesn’t look like a link. Example: https://example.com',
      scanning: 'Scanning', stDetect: 'Detecting the network', stContract: 'Reading contract security', stMarket: 'Checking liquidity and trading',
      stScore: 'Scoring the risk', stWallet: 'Checking address reputation', stApprovals: 'Reading token approvals', stLink: 'Checking phishing databases',
      failTitle: 'We couldn’t reach the security data', failText: 'The data provider didn’t respond. It may be busy or blocked by your network or an ad blocker. Try again in a moment.',
      retry: 'Try again', nfTitle: 'Token not found on {c}', nfText: 'There is no security data or market for this address on {c}. Check the address or pick another network.',
      partial: 'GoPlus hasn’t analyzed this contract yet, so only market data is shown. Treat it as unverified.',
      score: 'score', vOk: 'Low risk', vMed: 'Medium risk', vHigh: 'High risk', vCrit: 'Danger', vNa: 'Not enough data',
      sumOk: 'No major risks found in the public data.', sumMed: 'Mostly fine, with a few points worth checking.',
      sumHigh: 'High-risk findings. Read them carefully before you buy.', sumCrit: 'Critical risk: {x}. Avoid this token.',
      sumNa: 'There isn’t enough public data to score this token.',
      kPrice: 'Price', kLiq: 'Liquidity', kVol: 'Volume 24h', kHolders: 'Holders', kAge: 'Market age', kMcap: 'Market cap',
      gContract: 'Contract', gTrading: 'Trading', gLiquidity: 'Liquidity', gHolders: 'Holders',
      all: 'All checks', issues: 'Issues only', passed: 'passed', warnings: 'warnings', critical: 'critical',
      sOk: 'Pass', sLow: 'Low', sMed: 'Medium', sHigh: 'High', sCrit: 'Critical', sInfo: 'Info', sNa: 'n/a',
      copyLink: 'Copy link', shareX: 'Share on X', copySum: 'Copy summary', copied: 'Copied', explorer: 'Explorer', chart: 'Chart',
      topHolders: 'Top holders', exNote: 'Grey bars are pools, lockers, contracts or burn addresses.',
      tContract: 'contract', tLocked: 'locked', tBurn: 'burn', unknown: 'unknown', d: 'd', h: 'h', ago: '{x} ago',
      wFlags: 'flags', wOk: 'No red flags', wBad: 'Flagged address', wSumOk: 'This address isn’t on the public risk lists we check.', wSumBad: 'This address is linked to: {x}. Don’t send funds to it.',
      wContract: 'This address is a smart contract.', wNote: 'A clean result means the address isn’t on known risk lists. New scam wallets may not be listed yet.',
      apTitle: 'Token approvals', apNone: 'No active approvals found on {c}.', apSum: '{n} approvals · {r} risky', apUnl: 'Unlimited',
      apRevoke: 'Revoke on revoke.cash', apBad: 'Malicious', apWarn: 'Check', apOk: 'OK', apAuto: 'Showing {c}. Pick another network to check it there.',
      apSumOk: 'No risky approvals found.', apSumBad: '{r} approvals need your attention. Revoke the ones you don’t use.',
      lOk: 'Not on phishing lists', lBad: 'Known phishing site', lSumOk: 'This site isn’t in the phishing databases we check.', lPhFail: 'Phishing check unavailable', lSumPhFail: 'The phishing database didn’t answer right now. Try again in a minute; the dApp data below is still valid.',
      lSumBad: 'This site is reported as phishing. Don’t connect your wallet or enter your seed phrase.',
      lNote: 'New phishing sites appear every day. Always check the address letter by letter and never type your seed phrase on a website.',
      stamp: 'Data: GoPlus Security · DexScreener · {t}', stampGp: 'Data: GoPlus Security · {t}',
      xText: 'I checked {s} with Shield Check by @sectora__: {v} ({n}/100). Check any token before you trust it.'
    },
    es: {
      tNft: 'NFT', hintNft: 'Dirección del contrato de una colección NFT en una red EVM.', phNft: '0x… dirección de la colección NFT', stNft: 'Leyendo el contrato NFT', stDapp: 'Leyendo los datos de seguridad del dApp',
      nftNf: 'No hay datos de seguridad NFT para esta dirección en {c}. Revisa la dirección o elige otra red.', sumCritN: 'Riesgo crítico: {x}. Evita esta colección.',
      kStd: 'Estándar', kItems: 'NFTs', kOwners: 'Dueños', kSales: 'Ventas 24 h', nftAuto: 'Mostrando {c}. Elige otra red para revisar la colección allí.',
      dTitle: 'Seguridad del dApp', dAudit: 'Auditoría · {f}', dNoAudit: 'Sin auditorías registradas', dTrusted: 'dApp de confianza', dContracts: 'Contratos',
      dNone: 'No hay datos de seguridad de dApp para este sitio. Es normal en webs que no son dApps.', dOpen: 'código abierto', dClosed: 'código no verificado', dMal: 'malicioso', dMalT: 'Contrato malicioso en el dApp',
      dMalSum: 'Uno de los contratos de este dApp está marcado como malicioso. No conectes tu wallet.',
      fNft: 'Antes de mintear o comprar: ¿el dueño puede mintear cuando quiera, quemar tus NFTs o moverlos sin tu permiso?',
      fSeal: 'Los proyectos pueden mostrar su resultado de Shield Check en vivo en su propia web con una línea de código.',
      sealEyebrow: 'Sello Shield', sealTitle: 'Muestra este resultado en tu web', sealText: 'Pega este código en tu web. El sello revisa el token en vivo cada vez que carga, así que siempre muestra el resultado actual, bueno o malo.',
      sealDark: 'Oscuro', sealLight: 'Claro', sealCopy: 'Copiar código del sello', sealChecking: 'Revisando…', sealFail: 'Revisión no disponible', sealOpen: 'Abrir el informe completo de Shield Check',
      navShield: 'Sectora Shield', navHome: 'Web principal', eyebrow: 'Sectora Shield · escáner de seguridad gratis',
      h1a: 'Revisa antes', h1b: 'de confiar.',
      lead: 'Pega cualquier token, wallet o enlace. Shield Check lee datos públicos de seguridad en la blockchain y te explica cada riesgo en lenguaje sencillo, en segundos.',
      tToken: 'Token', tWallet: 'Wallet', tApprovals: 'Aprobaciones', tLink: 'Web', network: 'Red', auto: 'Detectar red', scan: 'Revisar',
      hintToken: 'Dirección del token en Ethereum, Solana, Base, BNB Chain, Robinhood Chain y más. Shield Check encuentra la red por ti.', errSolMode: 'En Solana, por ahora Shield Check revisa tokens. Usa la pestaña Token.',
      hintWallet: 'Cualquier wallet o contrato. Mira si está vinculado a estafas antes de enviar fondos.',
      hintApprovals: 'La dirección de tu wallet. Mira qué contratos pueden gastar tus tokens. No hace falta conectarla.',
      hintLink: 'Una web o dApp que te llegó por mensaje, anuncio o comentario. Revisamos listas de phishing y las auditorías y contratos del dApp.',
      phToken: '0x… o token de Solana', phWallet: '0x… dirección de la wallet', phApprovals: '0x… dirección de tu wallet', phLink: 'https://…',
      try: 'Prueba', sChecks: 'revisiones', sChains: 'redes', sTools: 'herramientas',
      fEyebrow: 'Cinco herramientas y un sello en vivo',
      fToken: 'Honeypots, dueños ocultos, funciones de mint, comisiones modificables, listas negras, liquidez, bloqueos y concentración de holders.',
      fWallet: 'Antes de enviar fondos: ¿esta dirección está vinculada a phishing, robos, sanciones, mezcladores o contratos estafa?',
      fApprovals: 'Mira qué contratos pueden gastar tus tokens, detecta aprobaciones ilimitadas o peligrosas y revócalas.',
      fLink: '¿Te llegó un enlace por mensaje o anuncio? Revisa las listas de phishing y las auditorías y contratos del dApp antes de conectar tu wallet.',
      hEyebrow: 'Cómo funciona', hTitle: 'Datos públicos, leídos por ti.',
      hText: 'Shield Check nunca te pide conectar la wallet ni firmar nada. Lee datos públicos de seguridad de GoPlus Security y datos de mercado de DexScreener, puntúa cada hallazgo y te explica qué significa.',
      h1: 'Pega una dirección o enlace', h2: 'Leemos el contrato, el trading y los holders', h3: 'Recibes una puntuación y un informe sencillo',
      disclaimer: 'Shield Check es una herramienta automática basada en datos públicos. No es asesoría financiera y un resultado limpio no garantiza que un proyecto sea seguro. Investiga siempre por tu cuenta.',
      sources: 'Datos',
      errAddr: 'Eso no parece una dirección. Las de EVM empiezan con 0x y tienen 42 caracteres; las de Solana tienen de 32 a 44 letras y números.',
      errUrl: 'Eso no parece un enlace. Ejemplo: https://ejemplo.com',
      scanning: 'Revisando', stDetect: 'Detectando la red', stContract: 'Leyendo la seguridad del contrato', stMarket: 'Revisando liquidez y trading',
      stScore: 'Calculando el riesgo', stWallet: 'Revisando la reputación de la dirección', stApprovals: 'Leyendo las aprobaciones', stLink: 'Revisando bases de phishing',
      failTitle: 'No pudimos obtener los datos de seguridad', failText: 'El proveedor de datos no respondió. Puede estar saturado o bloqueado por tu red o un bloqueador de anuncios. Inténtalo de nuevo en un momento.',
      retry: 'Reintentar', nfTitle: 'Token no encontrado en {c}', nfText: 'No hay datos de seguridad ni mercado para esta dirección en {c}. Revisa la dirección o elige otra red.',
      partial: 'GoPlus aún no ha analizado este contrato, así que solo se muestran datos de mercado. Trátalo como no verificado.',
      score: 'puntos', vOk: 'Riesgo bajo', vMed: 'Riesgo medio', vHigh: 'Riesgo alto', vCrit: 'Peligro', vNa: 'Datos insuficientes',
      sumOk: 'No se encontraron riesgos importantes en los datos públicos.', sumMed: 'En general bien, con algunos puntos que conviene revisar.',
      sumHigh: 'Hay hallazgos de riesgo alto. Léelos con calma antes de comprar.', sumCrit: 'Riesgo crítico: {x}. Evita este token.',
      sumNa: 'No hay suficientes datos públicos para puntuar este token.',
      kPrice: 'Precio', kLiq: 'Liquidez', kVol: 'Volumen 24 h', kHolders: 'Holders', kAge: 'Antigüedad', kMcap: 'Capitalización',
      gContract: 'Contrato', gTrading: 'Trading', gLiquidity: 'Liquidez', gHolders: 'Holders',
      all: 'Todas', issues: 'Solo problemas', passed: 'superadas', warnings: 'avisos', critical: 'críticas',
      sOk: 'Bien', sLow: 'Bajo', sMed: 'Medio', sHigh: 'Alto', sCrit: 'Crítico', sInfo: 'Info', sNa: 'n/d',
      copyLink: 'Copiar enlace', shareX: 'Compartir en X', copySum: 'Copiar resumen', copied: 'Copiado', explorer: 'Explorador', chart: 'Gráfica',
      topHolders: 'Principales holders', exNote: 'Las barras grises son pools, bloqueadores, contratos o direcciones de quema.',
      tContract: 'contrato', tLocked: 'bloqueado', tBurn: 'quema', unknown: 'desconocido', d: 'd', h: 'h', ago: 'hace {x}',
      wFlags: 'alertas', wOk: 'Sin alertas', wBad: 'Dirección señalada', wSumOk: 'Esta dirección no está en las listas públicas de riesgo que revisamos.', wSumBad: 'Esta dirección está vinculada a: {x}. No le envíes fondos.',
      wContract: 'Esta dirección es un contrato inteligente.', wNote: 'Un resultado limpio significa que no está en listas de riesgo conocidas. Las wallets de estafa nuevas pueden no estar registradas todavía.',
      apTitle: 'Aprobaciones de tokens', apNone: 'No se encontraron aprobaciones activas en {c}.', apSum: '{n} aprobaciones · {r} de riesgo', apUnl: 'Ilimitada',
      apRevoke: 'Revocar en revoke.cash', apBad: 'Maliciosa', apWarn: 'Revisar', apOk: 'Bien', apAuto: 'Mostrando {c}. Elige otra red para revisarla allí.',
      apSumOk: 'No se encontraron aprobaciones de riesgo.', apSumBad: '{r} aprobaciones necesitan tu atención. Revoca las que no uses.',
      lOk: 'No está en listas de phishing', lBad: 'Sitio de phishing conocido', lSumOk: 'Este sitio no está en las bases de phishing que revisamos.', lPhFail: 'Revisión de phishing no disponible', lSumPhFail: 'La base de phishing no respondió ahora. Inténtalo en un minuto; los datos del dApp de abajo siguen siendo válidos.',
      lSumBad: 'Este sitio está reportado como phishing. No conectes tu wallet ni escribas tu frase semilla.',
      lNote: 'Cada día aparecen sitios de phishing nuevos. Revisa siempre la dirección letra por letra y nunca escribas tu frase semilla en una web.',
      stamp: 'Datos: GoPlus Security · DexScreener · {t}', stampGp: 'Datos: GoPlus Security · {t}',
      xText: 'Revisé {s} con Shield Check de @sectora__: {v} ({n}/100). Revisa cualquier token antes de confiar.'
    },
    pt: {
      tNft: 'NFT', hintNft: 'Endereço do contrato de uma coleção NFT em uma rede EVM.', phNft: '0x… endereço da coleção NFT', stNft: 'Lendo o contrato NFT', stDapp: 'Lendo os dados de segurança do dApp',
      nftNf: 'Não há dados de segurança NFT para esse endereço em {c}. Confira o endereço ou escolha outra rede.', sumCritN: 'Risco crítico: {x}. Evite esta coleção.',
      kStd: 'Padrão', kItems: 'NFTs', kOwners: 'Donos', kSales: 'Vendas 24 h', nftAuto: 'Mostrando {c}. Escolha outra rede para verificar a coleção lá.',
      dTitle: 'Segurança do dApp', dAudit: 'Auditoria · {f}', dNoAudit: 'Sem auditorias registradas', dTrusted: 'dApp confiável', dContracts: 'Contratos',
      dNone: 'Não há dados de segurança de dApp para este site. É normal em sites que não são dApps.', dOpen: 'código aberto', dClosed: 'código não verificado', dMal: 'malicioso', dMalT: 'Contrato malicioso no dApp',
      dMalSum: 'Um dos contratos deste dApp está marcado como malicioso. Não conecte sua carteira.',
      fNft: 'Antes de mintar ou comprar: o dono pode mintar quando quiser, queimar seus NFTs ou movê-los sem sua aprovação?',
      fSeal: 'Projetos podem mostrar o resultado do Shield Check ao vivo no próprio site com uma linha de código.',
      sealEyebrow: 'Selo Shield', sealTitle: 'Mostre este resultado no seu site', sealText: 'Cole este código no seu site. O selo verifica o token ao vivo toda vez que carrega, então sempre mostra o resultado atual, bom ou ruim.',
      sealDark: 'Escuro', sealLight: 'Claro', sealCopy: 'Copiar código do selo', sealChecking: 'Verificando…', sealFail: 'Verificação indisponível', sealOpen: 'Abrir o relatório completo do Shield Check',
      navShield: 'Sectora Shield', navHome: 'Site principal', eyebrow: 'Sectora Shield · scanner de segurança grátis',
      h1a: 'Verifique antes', h1b: 'de confiar.',
      lead: 'Cole qualquer token, carteira ou link. O Shield Check lê dados públicos de segurança na blockchain e explica cada risco em linguagem simples, em segundos.',
      tToken: 'Token', tWallet: 'Carteira', tApprovals: 'Aprovações', tLink: 'Site', network: 'Rede', auto: 'Detectar rede', scan: 'Verificar',
      hintToken: 'Endereço do token na Ethereum, Solana, Base, BNB Chain, Robinhood Chain e mais. O Shield Check encontra a rede para você.', errSolMode: 'Na Solana, por enquanto o Shield Check verifica tokens. Use a aba Token.',
      hintWallet: 'Qualquer carteira ou contrato. Veja se está ligado a golpes antes de enviar fundos.',
      hintApprovals: 'O endereço da sua carteira. Veja quais contratos podem gastar seus tokens. Sem conectar nada.',
      hintLink: 'Um site ou dApp que você recebeu por mensagem, anúncio ou comentário. Verificamos listas de phishing e as auditorias e contratos do dApp.',
      phToken: '0x… ou token da Solana', phWallet: '0x… endereço da carteira', phApprovals: '0x… endereço da sua carteira', phLink: 'https://…',
      try: 'Teste', sChecks: 'verificações', sChains: 'redes', sTools: 'ferramentas',
      fEyebrow: 'Cinco ferramentas e um selo ao vivo',
      fToken: 'Honeypots, donos ocultos, funções de mint, taxas alteráveis, listas negras, liquidez, bloqueios e concentração de holders.',
      fWallet: 'Antes de enviar fundos: esse endereço está ligado a phishing, roubos, sanções, mixers ou contratos golpe?',
      fApprovals: 'Veja quais contratos podem gastar seus tokens, encontre aprovações ilimitadas ou perigosas e revogue-as.',
      fLink: 'Recebeu um link por mensagem ou anúncio? Verifique as listas de phishing e as auditorias e contratos do dApp antes de conectar a carteira.',
      hEyebrow: 'Como funciona', hTitle: 'Dados públicos, lidos para você.',
      hText: 'O Shield Check nunca pede para conectar a carteira nem assinar nada. Ele lê dados públicos de segurança da GoPlus Security e dados de mercado da DexScreener, pontua cada achado e explica o que significa.',
      h1: 'Cole um endereço ou link', h2: 'Lemos o contrato, o trading e os holders', h3: 'Você recebe uma nota e um relatório simples',
      disclaimer: 'O Shield Check é uma ferramenta automática baseada em dados públicos. Não é recomendação financeira e um resultado limpo não garante que um projeto seja seguro. Sempre faça sua própria pesquisa.',
      sources: 'Dados',
      errAddr: 'Isso não parece um endereço. Os da EVM começam com 0x e têm 42 caracteres; os da Solana têm de 32 a 44 letras e números.',
      errUrl: 'Isso não parece um link. Exemplo: https://exemplo.com',
      scanning: 'Verificando', stDetect: 'Detectando a rede', stContract: 'Lendo a segurança do contrato', stMarket: 'Verificando liquidez e trading',
      stScore: 'Calculando o risco', stWallet: 'Verificando a reputação do endereço', stApprovals: 'Lendo as aprovações', stLink: 'Verificando bases de phishing',
      failTitle: 'Não conseguimos obter os dados de segurança', failText: 'O provedor de dados não respondeu. Pode estar sobrecarregado ou bloqueado pela sua rede ou por um bloqueador de anúncios. Tente de novo em instantes.',
      retry: 'Tentar de novo', nfTitle: 'Token não encontrado em {c}', nfText: 'Não há dados de segurança nem mercado para esse endereço em {c}. Confira o endereço ou escolha outra rede.',
      partial: 'A GoPlus ainda não analisou este contrato, então só aparecem dados de mercado. Trate como não verificado.',
      score: 'nota', vOk: 'Risco baixo', vMed: 'Risco médio', vHigh: 'Risco alto', vCrit: 'Perigo', vNa: 'Dados insuficientes',
      sumOk: 'Nenhum risco importante encontrado nos dados públicos.', sumMed: 'No geral bem, com alguns pontos que vale conferir.',
      sumHigh: 'Há achados de risco alto. Leia com atenção antes de comprar.', sumCrit: 'Risco crítico: {x}. Evite este token.',
      sumNa: 'Não há dados públicos suficientes para pontuar este token.',
      kPrice: 'Preço', kLiq: 'Liquidez', kVol: 'Volume 24 h', kHolders: 'Holders', kAge: 'Idade do mercado', kMcap: 'Valor de mercado',
      gContract: 'Contrato', gTrading: 'Trading', gLiquidity: 'Liquidez', gHolders: 'Holders',
      all: 'Todas', issues: 'Só problemas', passed: 'aprovadas', warnings: 'alertas', critical: 'críticas',
      sOk: 'OK', sLow: 'Baixo', sMed: 'Médio', sHigh: 'Alto', sCrit: 'Crítico', sInfo: 'Info', sNa: 'n/d',
      copyLink: 'Copiar link', shareX: 'Compartilhar no X', copySum: 'Copiar resumo', copied: 'Copiado', explorer: 'Explorador', chart: 'Gráfico',
      topHolders: 'Maiores holders', exNote: 'Barras cinzas são pools, bloqueadores, contratos ou endereços de queima.',
      tContract: 'contrato', tLocked: 'bloqueado', tBurn: 'queima', unknown: 'desconhecido', d: 'd', h: 'h', ago: 'há {x}',
      wFlags: 'alertas', wOk: 'Sem alertas', wBad: 'Endereço sinalizado', wSumOk: 'Este endereço não está nas listas públicas de risco que verificamos.', wSumBad: 'Este endereço está ligado a: {x}. Não envie fundos para ele.',
      wContract: 'Este endereço é um contrato inteligente.', wNote: 'Um resultado limpo significa que ele não está em listas de risco conhecidas. Carteiras de golpe novas podem ainda não estar listadas.',
      apTitle: 'Aprovações de tokens', apNone: 'Nenhuma aprovação ativa encontrada em {c}.', apSum: '{n} aprovações · {r} de risco', apUnl: 'Ilimitada',
      apRevoke: 'Revogar no revoke.cash', apBad: 'Maliciosa', apWarn: 'Conferir', apOk: 'OK', apAuto: 'Mostrando {c}. Escolha outra rede para verificar lá.',
      apSumOk: 'Nenhuma aprovação de risco encontrada.', apSumBad: '{r} aprovações precisam da sua atenção. Revogue as que você não usa.',
      lOk: 'Não está em listas de phishing', lBad: 'Site de phishing conhecido', lSumOk: 'Este site não está nas bases de phishing que verificamos.', lPhFail: 'Verificação de phishing indisponível', lSumPhFail: 'A base de phishing não respondeu agora. Tente de novo em um minuto; os dados do dApp abaixo continuam válidos.',
      lSumBad: 'Este site é reportado como phishing. Não conecte sua carteira nem digite sua frase-semente.',
      lNote: 'Novos sites de phishing surgem todos os dias. Confira sempre o endereço letra por letra e nunca digite sua frase-semente em um site.',
      stamp: 'Dados: GoPlus Security · DexScreener · {t}', stampGp: 'Dados: GoPlus Security · {t}',
      xText: 'Verifiquei {s} com o Shield Check da @sectora__: {v} ({n}/100). Verifique qualquer token antes de confiar.'
    }
  };
  /* textos de cada revision: [ok, mal, descripcion ok, descripcion mal] */
  const C = {
    en: {
      nftMal: ['Not a malicious contract', 'Malicious NFT contract', 'Not flagged as malicious.', 'This contract is flagged as malicious. Don’t interact with it.'],
      nftMint: ['No privileged minting', 'Owner can mint at will', 'Only the normal mint rules apply.', 'The owner can mint new NFTs whenever they want, diluting the collection.'],
      nftBurn: ['Owner can’t burn your NFTs', 'Owner can burn your NFTs', 'No one can destroy your NFTs.', 'The owner can destroy NFTs held by other wallets.'],
      nftMove: ['No transfers without approval', 'Owner can move your NFTs', 'Your NFTs only move with your approval.', 'The owner can move NFTs out of your wallet without your approval.'],
      nftAppr: ['Approvals work normally', 'Approvals are restricted', 'You can list it on any marketplace.', 'The contract limits which marketplaces can be approved. Selling may be harder.'],
      nftOver: ['Supply limit enforced', 'Can mint past max supply', 'Minting respects the max supply.', 'More NFTs can be minted than the stated max supply.'],
      nftVer: ['Verified collection', 'Recognized by major marketplaces.'],
      solMint: ['Mint authority revoked', 'Mint authority active', 'No one can create more tokens.', 'Someone can still create new tokens, diluting every holder.'],
      solFreeze: ['No freeze authority', 'Freeze authority active', 'No one can freeze your tokens.', 'Someone can freeze token accounts so you can’t sell. Most Solana honeypots work this way. Normal only for regulated stablecoins.'],
      solBal: ['Balances can’t be changed', 'Balances can be changed', 'No authority can edit balances.', 'An authority can change token balances, including yours.'],
      solClose: ['Accounts can’t be closed', 'Accounts can be closed', 'No authority can close token accounts.', 'An authority can close token accounts.'],
      solMeta: ['Name and logo are fixed', 'Name and logo can change', 'The token’s metadata is locked.', 'The owner can change the token’s name, symbol or logo.'],
      solNT: ['Tokens can be transferred', 'Tokens can’t be transferred', 'You can move and sell this token.', 'This token can’t be transferred or sold.'],
      solHook: ['No transfer hook', 'Transfer hook', 'No custom code runs on transfers.', 'Custom code runs on every transfer and could block or charge it.'],
      solFee: ['No transfer fee', 'Transfer fee', 'Transfers have no built-in fee.', 'Every transfer pays a built-in fee.'],
      solFeeUp: ['Fee can’t be changed', 'Fee can be changed', 'The transfer fee is fixed.', 'The transfer fee can be raised later.'],
      src: ['Source code verified', 'Source code not verified', 'The code is public on the explorer, so anyone can review it.', 'Nobody can read what this contract really does. Most scam tokens hide their code.'],
      owner: ['No active owner', 'Owner still has control', 'Ownership is renounced or there is no owner, so no one can use admin functions.', 'An owner wallet can still use admin functions. The other checks show what those functions can do.'],
      hidden: ['No hidden owner', 'Hidden owner', 'No secret admin was found.', 'The contract keeps a secret owner that can act even if ownership looks renounced.'],
      retake: ['Ownership can’t be reclaimed', 'Ownership can be reclaimed', 'Once renounced, control can’t be taken back.', 'The deployer can take control back after renouncing it.'],
      bal: ['Balances can’t be edited', 'Owner can edit balances', 'No one can change your balance.', 'The owner can change any wallet’s balance, including yours.'],
      mint: ['Fixed supply', 'New tokens can be minted', 'There is no function to create more tokens.', 'More tokens can be created, which dilutes every holder.'],
      proxy: ['Code can’t be swapped', 'Upgradeable contract', 'The contract logic is final.', 'The code can be replaced later. Common in large projects, risky in small ones.'],
      selfd: ['No self-destruct', 'Can self-destruct', 'The contract can’t be destroyed.', 'The contract can be destroyed, wiping its logic.'],
      ext: ['No external calls', 'Depends on other contracts', 'Its behavior doesn’t depend on outside contracts.', 'Part of its behavior depends on other contracts that can change.'],
      honeypot: ['Not a honeypot', 'Honeypot: you can’t sell', 'Simulated buys and sells go through.', 'You can buy but you can’t sell. Do not buy this token.'],
      sellall: ['You can sell everything', 'You can’t sell all your tokens', 'No limit on selling your full balance.', 'The contract stops you from selling 100% of what you hold.'],
      buy: ['Buying works', 'Buying is blocked', 'Buy transactions go through.', 'The token can’t be bought right now.'],
      taxmod: ['Fees are fixed', 'Fees can be changed', 'No one can raise the fees later.', 'The owner can raise fees at any time, even to 100%.'],
      ptax: ['Same fees for everyone', 'Fees can target wallets', 'No per-wallet fees.', 'The owner can set a special fee for specific wallets.'],
      pause: ['Trading can’t be paused', 'Trading can be paused', 'No one can freeze transfers.', 'The owner can freeze all transfers.'],
      black: ['No blacklist', 'Has a blacklist', 'No wallet can be blocked.', 'Specific wallets can be blocked from trading. Normal for regulated stablecoins, a red flag for small tokens.'],
      white: ['No whitelist', 'Has a whitelist', 'Anyone can trade.', 'At times only approved wallets may be able to trade.'],
      cool: ['No trading cooldown', 'Trading cooldown', 'You can trade any time.', 'You may have to wait between trades.'],
      whale: ['Wallet limits are fixed', 'Wallet limits can be changed', 'Max-wallet rules can’t be edited.', 'The owner can change how much a wallet may hold or sell.'],
      dex: ['Trading on a DEX', 'Not on any DEX', 'There is a public market for this token.', 'No decentralized market was found.'],
      airdrop: ['Not an airdrop scam', 'Airdrop scam', 'Not used in airdrop scams.', 'This token is used in airdrop scams to lure wallets.'],
      samecr: ['Clean creator history', 'Creator made honeypots before', 'No honeypots linked to the deployer.', 'The same deployer created honeypot tokens before.'],
      fake: ['Original token', 'Impersonates another token', 'Not a copy of a known token.', 'This looks like a copy of a well-known token. Check the official address.'],
      tax: ['Buy tax {b} · Sell tax {s}', 'No fees on trades.', 'Every trade pays this fee to the contract.', 'High fees take a big cut of every trade.'],
      liq: ['Liquidity {v}', 'Enough liquidity for normal trades.', 'Low liquidity: bigger trades move the price a lot.', 'Very low liquidity: even small trades move the price and exits are hard.'],
      lplock: ['Liquidity {p} locked', 'Only {p} of liquidity locked', 'Most of the pool tokens are locked or burned.', 'Unlocked liquidity can be removed by its owner.', 'Liquidity lock not detectable', 'This pool uses concentrated-liquidity positions (Uniswap V3/V4). Verify the lock on the locker’s page.'],
      age: ['Market created {x}', 'The market has some history.', 'Young market: there is little price history yet.', 'Very new market. Most rug pulls happen in the first days.'],
      holders: ['{n} holders', 'A broad base of holders.', 'Few holders: the price can be moved easily.'],
      top10: ['Top wallets hold {p}', 'Supply is reasonably spread out.', 'A few wallets could sell and crash the price.', 'Excluding pools, lockers, contracts and burn addresses.'],
      creator: ['Creator holds {p}', 'The deployer holds little or none of the supply.', 'The deployer still holds a big share of supply.'],
      trust: ['On GoPlus trusted list', 'Recognized, widely used token.']
    },
    es: {
      nftMal: ['No es un contrato malicioso', 'Contrato NFT malicioso', 'No está marcado como malicioso.', 'Este contrato está marcado como malicioso. No interactúes con él.'],
      nftMint: ['Sin minteo privilegiado', 'El dueño puede mintear cuando quiera', 'Solo aplican las reglas normales de minteo.', 'El dueño puede mintear NFTs nuevos cuando quiera, diluyendo la colección.'],
      nftBurn: ['El dueño no puede quemar tus NFTs', 'El dueño puede quemar tus NFTs', 'Nadie puede destruir tus NFTs.', 'El dueño puede destruir NFTs de otras wallets.'],
      nftMove: ['Sin transferencias sin permiso', 'El dueño puede mover tus NFTs', 'Tus NFTs solo se mueven con tu aprobación.', 'El dueño puede sacar NFTs de tu wallet sin tu aprobación.'],
      nftAppr: ['Las aprobaciones funcionan normal', 'Aprobaciones restringidas', 'Puedes listarlo en cualquier marketplace.', 'El contrato limita qué marketplaces se pueden aprobar. Vender puede ser más difícil.'],
      nftOver: ['Respeta el suministro máximo', 'Puede mintear más del máximo', 'El minteo respeta el suministro máximo.', 'Se pueden mintear más NFTs que el máximo anunciado.'],
      nftVer: ['Colección verificada', 'Reconocida por los principales marketplaces.'],
      solMint: ['Autoridad de mint revocada', 'Autoridad de mint activa', 'Nadie puede crear más tokens.', 'Alguien todavía puede crear tokens nuevos, lo que diluye a todos los holders.'],
      solFreeze: ['Sin autoridad de congelar', 'Autoridad de congelar activa', 'Nadie puede congelar tus tokens.', 'Alguien puede congelar cuentas para que no puedas vender. Así funcionan la mayoría de los honeypots en Solana. Solo es normal en stablecoins reguladas.'],
      solBal: ['Los saldos no se pueden cambiar', 'Los saldos se pueden cambiar', 'Ninguna autoridad puede editar saldos.', 'Una autoridad puede cambiar saldos, incluido el tuyo.'],
      solClose: ['Las cuentas no se pueden cerrar', 'Las cuentas se pueden cerrar', 'Ninguna autoridad puede cerrar cuentas del token.', 'Una autoridad puede cerrar cuentas del token.'],
      solMeta: ['Nombre y logo fijos', 'Nombre y logo se pueden cambiar', 'Los metadatos del token están bloqueados.', 'El dueño puede cambiar el nombre, el símbolo o el logo.'],
      solNT: ['Se puede transferir', 'No se puede transferir', 'Puedes mover y vender este token.', 'Este token no se puede transferir ni vender.'],
      solHook: ['Sin transfer hook', 'Transfer hook', 'No se ejecuta código extra al transferir.', 'Se ejecuta código propio en cada transferencia y podría bloquearla o cobrarla.'],
      solFee: ['Sin comisión por transferencia', 'Comisión por transferencia', 'Las transferencias no tienen comisión integrada.', 'Cada transferencia paga una comisión integrada.'],
      solFeeUp: ['Comisión fija', 'La comisión se puede cambiar', 'La comisión de transferencia es fija.', 'La comisión de transferencia se puede subir después.'],
      src: ['Código verificado', 'Código no verificado', 'El código es público en el explorador, así que cualquiera puede revisarlo.', 'Nadie puede leer qué hace realmente este contrato. La mayoría de los tokens estafa ocultan su código.'],
      owner: ['Sin dueño activo', 'El dueño mantiene el control', 'La propiedad está renunciada o no hay dueño, así que nadie puede usar funciones de administrador.', 'Una wallet dueña todavía puede usar funciones de administrador. Las otras revisiones muestran qué pueden hacer.'],
      hidden: ['Sin dueño oculto', 'Dueño oculto', 'No se encontró un administrador secreto.', 'El contrato guarda un dueño secreto que puede actuar aunque la propiedad parezca renunciada.'],
      retake: ['La propiedad no se puede recuperar', 'La propiedad se puede recuperar', 'Una vez renunciada, nadie puede retomar el control.', 'El creador puede recuperar el control después de renunciar.'],
      bal: ['Los saldos no se pueden editar', 'El dueño puede editar saldos', 'Nadie puede cambiar tu saldo.', 'El dueño puede cambiar el saldo de cualquier wallet, incluida la tuya.'],
      mint: ['Suministro fijo', 'Se pueden crear tokens nuevos', 'No existe función para crear más tokens.', 'Se pueden crear más tokens, lo que diluye a todos los holders.'],
      proxy: ['El código no se puede cambiar', 'Contrato actualizable', 'La lógica del contrato es definitiva.', 'El código se puede reemplazar más adelante. Normal en proyectos grandes, riesgoso en pequeños.'],
      selfd: ['Sin autodestrucción', 'Se puede autodestruir', 'El contrato no se puede destruir.', 'El contrato se puede destruir y borrar su lógica.'],
      ext: ['Sin llamadas externas', 'Depende de otros contratos', 'Su funcionamiento no depende de contratos externos.', 'Parte de su funcionamiento depende de otros contratos que pueden cambiar.'],
      honeypot: ['No es honeypot', 'Honeypot: no puedes vender', 'Las compras y ventas simuladas funcionan.', 'Puedes comprar pero no vender. No compres este token.'],
      sellall: ['Puedes vender todo', 'No puedes vender todo tu saldo', 'No hay límite para vender todo tu saldo.', 'El contrato te impide vender el 100% de lo que tienes.'],
      buy: ['Se puede comprar', 'La compra está bloqueada', 'Las compras funcionan.', 'Ahora mismo no se puede comprar este token.'],
      taxmod: ['Comisiones fijas', 'Las comisiones se pueden cambiar', 'Nadie puede subir las comisiones después.', 'El dueño puede subir las comisiones cuando quiera, incluso al 100%.'],
      ptax: ['Mismas comisiones para todos', 'Comisiones por wallet', 'No hay comisiones especiales por wallet.', 'El dueño puede poner una comisión especial a wallets concretas.'],
      pause: ['El trading no se puede pausar', 'El trading se puede pausar', 'Nadie puede congelar las transferencias.', 'El dueño puede congelar todas las transferencias.'],
      black: ['Sin lista negra', 'Tiene lista negra', 'Ninguna wallet puede ser bloqueada.', 'Se pueden bloquear wallets concretas. Normal en stablecoins reguladas, mala señal en tokens pequeños.'],
      white: ['Sin lista blanca', 'Tiene lista blanca', 'Cualquiera puede operar.', 'En algunos momentos solo wallets aprobadas podrían operar.'],
      cool: ['Sin espera entre operaciones', 'Espera entre operaciones', 'Puedes operar cuando quieras.', 'Puede que tengas que esperar entre una operación y otra.'],
      whale: ['Límites por wallet fijos', 'Los límites por wallet se pueden cambiar', 'Las reglas de máximo por wallet no se pueden editar.', 'El dueño puede cambiar cuánto puede tener o vender una wallet.'],
      dex: ['Se negocia en un DEX', 'No está en ningún DEX', 'Hay un mercado público para este token.', 'No se encontró ningún mercado descentralizado.'],
      airdrop: ['No es estafa de airdrop', 'Estafa de airdrop', 'No se usa en estafas de airdrop.', 'Este token se usa en estafas de airdrop para atraer wallets.'],
      samecr: ['Creador con historial limpio', 'El creador hizo honeypots antes', 'No hay honeypots vinculados al creador.', 'El mismo creador lanzó tokens honeypot antes.'],
      fake: ['Token original', 'Imita a otro token', 'No es una copia de un token conocido.', 'Parece una copia de un token conocido. Revisa la dirección oficial.'],
      tax: ['Comisión compra {b} · venta {s}', 'Sin comisiones al operar.', 'Cada operación paga esta comisión al contrato.', 'Comisiones altas que se llevan una gran parte de cada operación.'],
      liq: ['Liquidez {v}', 'Liquidez suficiente para operaciones normales.', 'Liquidez baja: las operaciones grandes mueven mucho el precio.', 'Liquidez muy baja: hasta operaciones pequeñas mueven el precio y salir es difícil.'],
      lplock: ['Liquidez bloqueada {p}', 'Solo {p} de la liquidez bloqueada', 'La mayoría de los tokens del pool están bloqueados o quemados.', 'La liquidez no bloqueada puede ser retirada por su dueño.', 'Bloqueo de liquidez no detectable', 'Este pool usa posiciones de liquidez concentrada (Uniswap V3/V4). Verifica el bloqueo en la página del bloqueador.'],
      age: ['Mercado creado {x}', 'El mercado tiene algo de historial.', 'Mercado joven: todavía hay poco historial de precio.', 'Mercado muy nuevo. La mayoría de los rug pulls ocurren en los primeros días.'],
      holders: ['{n} holders', 'Una base amplia de holders.', 'Pocos holders: el precio se puede mover fácilmente.'],
      top10: ['Las mayores wallets tienen {p}', 'El suministro está razonablemente repartido.', 'Unas pocas wallets podrían vender y hundir el precio.', 'Sin contar pools, bloqueadores, contratos ni direcciones de quema.'],
      creator: ['El creador tiene {p}', 'El creador tiene poco o nada del suministro.', 'El creador todavía tiene una parte grande del suministro.'],
      trust: ['En la lista de confianza de GoPlus', 'Token reconocido y muy usado.']
    },
    pt: {
      nftMal: ['Não é um contrato malicioso', 'Contrato NFT malicioso', 'Não está marcado como malicioso.', 'Este contrato está marcado como malicioso. Não interaja com ele.'],
      nftMint: ['Sem mint privilegiado', 'O dono pode mintar quando quiser', 'Só valem as regras normais de mint.', 'O dono pode mintar novos NFTs quando quiser, diluindo a coleção.'],
      nftBurn: ['O dono não pode queimar seus NFTs', 'O dono pode queimar seus NFTs', 'Ninguém pode destruir seus NFTs.', 'O dono pode destruir NFTs de outras carteiras.'],
      nftMove: ['Sem transferências sem aprovação', 'O dono pode mover seus NFTs', 'Seus NFTs só se movem com sua aprovação.', 'O dono pode tirar NFTs da sua carteira sem sua aprovação.'],
      nftAppr: ['Aprovações funcionam normalmente', 'Aprovações restritas', 'Você pode listar em qualquer marketplace.', 'O contrato limita quais marketplaces podem ser aprovados. Vender pode ser mais difícil.'],
      nftOver: ['Respeita a oferta máxima', 'Pode mintar além do máximo', 'O mint respeita a oferta máxima.', 'Podem ser mintados mais NFTs que o máximo anunciado.'],
      nftVer: ['Coleção verificada', 'Reconhecida pelos principais marketplaces.'],
      solMint: ['Autoridade de mint revogada', 'Autoridade de mint ativa', 'Ninguém pode criar mais tokens.', 'Alguém ainda pode criar novos tokens, diluindo todos os holders.'],
      solFreeze: ['Sem autoridade de congelar', 'Autoridade de congelar ativa', 'Ninguém pode congelar seus tokens.', 'Alguém pode congelar contas para você não conseguir vender. A maioria dos honeypots na Solana funciona assim. Normal só em stablecoins reguladas.'],
      solBal: ['Saldos não podem ser alterados', 'Saldos podem ser alterados', 'Nenhuma autoridade pode editar saldos.', 'Uma autoridade pode alterar saldos, inclusive o seu.'],
      solClose: ['Contas não podem ser fechadas', 'Contas podem ser fechadas', 'Nenhuma autoridade pode fechar contas do token.', 'Uma autoridade pode fechar contas do token.'],
      solMeta: ['Nome e logo fixos', 'Nome e logo podem mudar', 'Os metadados do token estão bloqueados.', 'O dono pode mudar o nome, o símbolo ou o logo.'],
      solNT: ['Pode ser transferido', 'Não pode ser transferido', 'Você pode mover e vender este token.', 'Este token não pode ser transferido nem vendido.'],
      solHook: ['Sem transfer hook', 'Transfer hook', 'Nenhum código extra roda nas transferências.', 'Um código próprio roda em cada transferência e pode bloqueá-la ou cobrá-la.'],
      solFee: ['Sem taxa de transferência', 'Taxa de transferência', 'As transferências não têm taxa embutida.', 'Cada transferência paga uma taxa embutida.'],
      solFeeUp: ['Taxa fixa', 'A taxa pode mudar', 'A taxa de transferência é fixa.', 'A taxa de transferência pode ser aumentada depois.'],
      src: ['Código verificado', 'Código não verificado', 'O código é público no explorador, então qualquer um pode revisar.', 'Ninguém consegue ler o que este contrato realmente faz. A maioria dos tokens golpe esconde o código.'],
      owner: ['Sem dono ativo', 'O dono mantém o controle', 'A propriedade foi renunciada ou não há dono, então ninguém pode usar funções de administrador.', 'Uma carteira dona ainda pode usar funções de administrador. As outras verificações mostram o que elas fazem.'],
      hidden: ['Sem dono oculto', 'Dono oculto', 'Nenhum administrador secreto encontrado.', 'O contrato mantém um dono secreto que pode agir mesmo que a propriedade pareça renunciada.'],
      retake: ['A propriedade não pode ser retomada', 'A propriedade pode ser retomada', 'Depois de renunciada, ninguém retoma o controle.', 'O criador pode retomar o controle depois de renunciar.'],
      bal: ['Saldos não podem ser editados', 'O dono pode editar saldos', 'Ninguém pode alterar seu saldo.', 'O dono pode alterar o saldo de qualquer carteira, inclusive a sua.'],
      mint: ['Oferta fixa', 'Novos tokens podem ser criados', 'Não existe função para criar mais tokens.', 'Mais tokens podem ser criados, o que dilui todos os holders.'],
      proxy: ['O código não pode ser trocado', 'Contrato atualizável', 'A lógica do contrato é definitiva.', 'O código pode ser substituído depois. Comum em grandes projetos, arriscado em pequenos.'],
      selfd: ['Sem autodestruição', 'Pode se autodestruir', 'O contrato não pode ser destruído.', 'O contrato pode ser destruído, apagando sua lógica.'],
      ext: ['Sem chamadas externas', 'Depende de outros contratos', 'O funcionamento não depende de contratos externos.', 'Parte do funcionamento depende de outros contratos que podem mudar.'],
      honeypot: ['Não é honeypot', 'Honeypot: você não consegue vender', 'Compras e vendas simuladas funcionam.', 'Você consegue comprar, mas não vender. Não compre este token.'],
      sellall: ['Você pode vender tudo', 'Você não pode vender todo o saldo', 'Sem limite para vender todo o seu saldo.', 'O contrato impede vender 100% do que você tem.'],
      buy: ['A compra funciona', 'A compra está bloqueada', 'As compras funcionam.', 'Agora não é possível comprar este token.'],
      taxmod: ['Taxas fixas', 'As taxas podem mudar', 'Ninguém pode aumentar as taxas depois.', 'O dono pode aumentar as taxas a qualquer momento, até 100%.'],
      ptax: ['Mesmas taxas para todos', 'Taxas por carteira', 'Não há taxas especiais por carteira.', 'O dono pode definir uma taxa especial para carteiras específicas.'],
      pause: ['O trading não pode ser pausado', 'O trading pode ser pausado', 'Ninguém pode congelar as transferências.', 'O dono pode congelar todas as transferências.'],
      black: ['Sem lista negra', 'Tem lista negra', 'Nenhuma carteira pode ser bloqueada.', 'Carteiras específicas podem ser bloqueadas. Normal em stablecoins reguladas, mau sinal em tokens pequenos.'],
      white: ['Sem lista branca', 'Tem lista branca', 'Qualquer um pode negociar.', 'Em alguns momentos só carteiras aprovadas podem negociar.'],
      cool: ['Sem espera entre operações', 'Espera entre operações', 'Você pode negociar quando quiser.', 'Talvez você precise esperar entre uma operação e outra.'],
      whale: ['Limites por carteira fixos', 'Os limites por carteira podem mudar', 'As regras de máximo por carteira não podem ser editadas.', 'O dono pode mudar quanto uma carteira pode ter ou vender.'],
      dex: ['Negociado em uma DEX', 'Não está em nenhuma DEX', 'Existe um mercado público para este token.', 'Nenhum mercado descentralizado foi encontrado.'],
      airdrop: ['Não é golpe de airdrop', 'Golpe de airdrop', 'Não é usado em golpes de airdrop.', 'Este token é usado em golpes de airdrop para atrair carteiras.'],
      samecr: ['Criador com histórico limpo', 'O criador já fez honeypots', 'Nenhum honeypot ligado ao criador.', 'O mesmo criador já lançou tokens honeypot.'],
      fake: ['Token original', 'Imita outro token', 'Não é cópia de um token conhecido.', 'Parece uma cópia de um token conhecido. Confira o endereço oficial.'],
      tax: ['Taxa compra {b} · venda {s}', 'Sem taxas nas operações.', 'Cada operação paga essa taxa ao contrato.', 'Taxas altas levam uma grande parte de cada operação.'],
      liq: ['Liquidez {v}', 'Liquidez suficiente para operações normais.', 'Liquidez baixa: operações maiores movem muito o preço.', 'Liquidez muito baixa: até operações pequenas movem o preço e sair é difícil.'],
      lplock: ['Liquidez bloqueada {p}', 'Só {p} da liquidez bloqueada', 'A maior parte dos tokens do pool está bloqueada ou queimada.', 'Liquidez não bloqueada pode ser retirada pelo dono.', 'Bloqueio de liquidez não detectável', 'Este pool usa posições de liquidez concentrada (Uniswap V3/V4). Confira o bloqueio na página do bloqueador.'],
      age: ['Mercado criado {x}', 'O mercado já tem algum histórico.', 'Mercado jovem: ainda há pouco histórico de preço.', 'Mercado muito novo. A maioria dos rug pulls acontece nos primeiros dias.'],
      holders: ['{n} holders', 'Uma base ampla de holders.', 'Poucos holders: o preço pode ser movido facilmente.'],
      top10: ['As maiores carteiras têm {p}', 'A oferta está razoavelmente distribuída.', 'Poucas carteiras poderiam vender e derrubar o preço.', 'Sem contar pools, bloqueadores, contratos e endereços de queima.'],
      creator: ['O criador tem {p}', 'O criador tem pouco ou nada da oferta.', 'O criador ainda tem uma parte grande da oferta.'],
      trust: ['Na lista confiável da GoPlus', 'Token reconhecido e muito usado.']
    }
  };
  const FLAGS = {
    cybercrime: ['Cybercrime', 'Ciberdelito', 'Cibercrime'], money_laundering: ['Money laundering', 'Lavado de dinero', 'Lavagem de dinheiro'],
    financial_crime: ['Financial crime', 'Delito financiero', 'Crime financeiro'], phishing_activities: ['Phishing', 'Phishing', 'Phishing'],
    stealing_attack: ['Theft attacks', 'Robos', 'Ataques de roubo'], blackmail_activities: ['Blackmail', 'Extorsión', 'Extorsão'],
    sanctioned: ['Sanctioned', 'Sancionada', 'Sancionado'], mixer: ['Mixer use', 'Uso de mezcladores', 'Uso de mixers'],
    darkweb_transactions: ['Darkweb transactions', 'Transacciones en la darkweb', 'Transações na darkweb'],
    honeypot_related_address: ['Linked to honeypots', 'Vinculada a honeypots', 'Ligado a honeypots'],
    number_of_malicious_contracts_created: ['Created malicious contracts', 'Creó contratos maliciosos', 'Criou contratos maliciosos'],
    fake_kyc: ['Fake KYC', 'KYC falso', 'KYC falso'], malicious_mining_activities: ['Malicious mining', 'Minería maliciosa', 'Mineração maliciosa'],
    fake_token: ['Fake tokens', 'Tokens falsos', 'Tokens falsos'], gas_abuse: ['Gas abuse', 'Abuso de gas', 'Abuso de gas'],
    blacklist_doubt: ['Suspicious lists', 'Listas sospechosas', 'Listas suspeitas']
  };

  let lang = 'en';
  try { lang = localStorage.getItem('sc_lang') || ''; } catch (e) { lang = ''; }
  if (!T[lang]) { const n = (navigator.language || 'en').slice(0, 2); lang = T[n] ? n : 'en'; }
  const tr = (k, v) => { let s = (T[lang] && T[lang][k]) || T.en[k] || k; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; };
  const ct = id => (C[lang] && C[lang][id]) || C.en[id];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fill = (s, v) => { for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; };

  /* ---------------- utilidades ---------------- */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function getJSON(url, ms) {
    const c = new AbortController(), t = setTimeout(() => c.abort(), ms || 15000);
    try {
      const r = await fetch(url, { signal: c.signal });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }
  const short = a => a ? a.slice(0, 6) + '…' + a.slice(-4) : '';
  const num = v => { const n = parseFloat(v); return isFinite(n) ? n : null; };
  const on = v => v === '1' || v === 1 || v === true;
  const known = v => v !== undefined && v !== null && v !== '';
  function money(v) {
    if (v == null) return '—';
    const a = Math.abs(v);
    if (a >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
    if (a >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'K';
    return '$' + v.toFixed(a >= 1 ? 2 : 4);
  }
  function price(v) {
    if (v == null) return '—';
    if (v >= 1) return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 4 });
    if (v >= 0.0001) return '$' + v.toPrecision(4);
    return '$' + v.toExponential(2);
  }
  const pct = (f, d) => (f * 100).toFixed(d == null ? (f * 100 < 10 ? 2 : 1) : d).replace(/\.0+$/, '') + '%';
  function ageTxt(ms) {
    const h = ms / 3.6e6;
    return h < 48 ? Math.max(1, Math.round(h)) + ' ' + tr('h') : Math.round(h / 24) + ' ' + tr('d');
  }
  /* fracciones de GoPlus: normalmente 0..1; si llegan en 0..100, se escalan */
  function frac(list) {
    const vals = list.map(x => num(x.percent) || 0);
    const scale = vals.some(v => v > 1.0001) ? 100 : 1;
    return vals.map(v => v / scale);
  }
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.k); toast.k = setTimeout(() => t.classList.remove('on'), 1800); }
  async function copy(text) { try { await navigator.clipboard.writeText(text); toast(tr('copied')); } catch (e) { const a = document.createElement('textarea'); a.value = text; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); toast(tr('copied')); } catch (x) {} a.remove(); } }

  /* ---------------- escudo de pixeles ---------------- */
  const GW = 24, GH = 28, SHIELD = [];
  (function () {
    const c = document.createElement('canvas').getContext('2d');
    const P = new Path2D('M12 0.6 L23.2 4 V14 C23.2 20.5 18.5 25 12 27.6 C5.5 25 0.8 20.5 0.8 14 V4 Z');
    const inS = (x, y) => c.isPointInPath(P, x, y), inI = (x, y) => c.isPointInPath(P, 12 + (x - 12) / 0.8, 14 + (y - 14) / 0.8);
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const px = x + .5, py = y + .5, d = Math.hypot(px - 12, py - 13.6);
      if (inS(px, py) && !inI(px, py)) SHIELD.push([x, y, 0]); else if (d >= 4.1 && d <= 6.5) SHIELD.push([x, y, 1]);
    }
  })();
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  function drawMark(cv, t, build) {
    const g = cv.getContext('2d'), W = cv.width, H = cv.height, u = Math.min(W / GW, H / GH);
    const ox = (W - GW * u) / 2, oy = (H - GH * u) / 2;
    g.clearRect(0, 0, W, H);
    SHIELD.forEach(([x, y, ring], i) => {
      const at = build ? .1 + (y / GH) * 1.1 + rnd(i) * .25 : -1, d = t - at;
      if (d < 0) return;
      const k = Math.min(1, d / .25), s = u * (build ? (k < 1 ? 1.35 - .35 * k : 1) : 1);
      const tw = .5 + .5 * Math.sin(t * 2.2 + i * .7), sweep = Math.max(0, 1 - Math.abs(((t * .35) % 1.3) - y / GH) * 7);
      const a = ring ? .92 + .08 * tw : .55 + .2 * tw + .45 * sweep;
      g.fillStyle = d < .12 ? '#ffffff' : ring ? `rgba(255,255,255,${a})` : `rgba(${Math.round(79 + 120 * sweep)},${Math.round(139 + 90 * sweep)},255,${Math.min(1, a)})`;
      g.fillRect(ox + x * u + (u - s) / 2, oy + y * u + (u - s) / 2, s - u * .08, s - u * .08);
    });
  }
  /* ---------------- datos del token: los usan el informe y la pagina del sello ---------------- */
  async function loadToken(addr, chainSel, step, quick) {
    const pause = ms => quick ? null : sleep(ms), mark = step || (() => {});
    const auto = chainSel === 'auto';
    let si = 0, pairs = null, chain = auto ? null : chainSel, gp = null, gpFail = false;
    const t = performance.now();
    const dsP = getJSON(DS + addr).then(j => j && Array.isArray(j.pairs) ? j.pairs : []).catch(() => null);
    if (auto) {
      mark(si, 'run'); pairs = await dsP;
      const best = (pairs || []).filter(p => DS2ID[p.chainId] && p.chainId !== 'solana').sort((a, b) => ((b.liquidity || {}).usd || 0) - ((a.liquidity || {}).usd || 0))[0];
      chain = best ? DS2ID[best.chainId] : '1';
      await pause(Math.max(0, 450 - (performance.now() - t))); mark(si++, 'done');
    }
    mark(si, 'run');
    try {
      const j = await getJSON(CHAINS[chain].sol ? `${GP}/solana/token_security?contract_addresses=${addr}` : `${GP}/token_security/${chain}?contract_addresses=${addr}`);
      const r = j && j.result ? j.result : {}, ks = Object.keys(r);
      const key = ks.find(k => k === addr) || ks.find(k => k.toLowerCase() === addr.toLowerCase()) || (CHAINS[chain].sol && ks.length === 1 ? ks[0] : null);
      gp = key ? r[key] : null;
    } catch (e) { gpFail = true; }
    await pause(350); mark(si++, gpFail ? 'fail' : 'done');
    mark(si, 'run');
    if (!auto) pairs = await dsP;
    await pause(350); mark(si++, pairs ? 'done' : 'fail');
    mark(si, 'run'); await pause(300); mark(si, 'done');
    const mine = (pairs || []).filter(p => p.chainId === CHAINS[chain].ds).sort((a, b) => ((b.liquidity || {}).usd || 0) - ((a.liquidity || {}).usd || 0));
    return { chain, gp, gpFail, mine };
  }
  /* la pagina del sello carga este archivo sin la interfaz: solo se expone el motor */
  if (!document.getElementById('form')) {
    window.ShieldEngine = { CHAINS, ADDR, SOL, tr, setLang: l => { if (T[l]) lang = l; }, loadToken, buildToken, drawMark };
    return;
  }
  const heroCv = $('#mark'); let t0 = performance.now();
  function heroLoop(now) { drawMark(heroCv, (now - t0) / 1000, true); requestAnimationFrame(heroLoop); }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) drawMark(heroCv, 5, false); else requestAnimationFrame(heroLoop);

  /* ---------------- formulario ---------------- */
  const EX = {
    token: [['$SECT', '0x8C9984B06281f1CA9416e493c2E602AaB08513db'], ['USDT', '0xdAC17F958D2ee523a2206206994597C13D831ec7'], ['USDC', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'], ['PEPE', '0x6982508145454Ce325dDbE47a25d4ec3d2311933'], ['USDC · SOL', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'], ['BONK · SOL', 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263']],
    wallet: [['vitalik.eth', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']],
    approvals: [['vitalik.eth', '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']],
    nft: [['BAYC', '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'], ['Pudgy Penguins', '0xBd3531dA5CF5857e7CfAA92426877b022e612cf8']],
    link: [['app.uniswap.org', 'https://app.uniswap.org'], ['sectoraorg.com', 'https://sectoraorg.com']]
  };
  let mode = 'token', last = null;
  const HINT = { token: 'hintToken', wallet: 'hintWallet', approvals: 'hintApprovals', nft: 'hintNft', link: 'hintLink' };
  const PH = { token: 'phToken', wallet: 'phWallet', approvals: 'phApprovals', nft: 'phNft', link: 'phLink' };
  function setMode(m) {
    mode = m;
    $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
    $('#chainWrap').hidden = m === 'link';
    const so = $('#chain option[value="sol"]'); if (so) { so.disabled = m !== 'token'; if (m !== 'token' && $('#chain').value === 'sol') $('#chain').value = 'auto'; }
    $('#hint').textContent = tr(HINT[m]); $('#q').placeholder = tr(PH[m]);
    $('#formErr').hidden = true;
    $('#examples').innerHTML = `<span class="lbl">${tr('try')}:</span>` + EX[m].map(([l, v]) => `<button type="button" data-v="${esc(v)}">${esc(l)}</button>`).join('');
  }
  $$('.tabs button').forEach(b => b.addEventListener('click', () => { setMode(b.dataset.mode); $('#q').value = ''; $('#q').focus(); }));
  $('#examples').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if (!b) return; $('#q').value = b.dataset.v; $('#form').requestSubmit(); });
  $('#form').addEventListener('submit', e => { e.preventDefault(); run(mode, $('#q').value.trim(), $('#chain').value); });

  function applyLang() {
    document.documentElement.lang = lang;
    $$('[data-i]').forEach(el => { const k = el.dataset.i; if (T.en[k]) el.textContent = tr(k); });
    $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
    setMode(mode);
    if (last) last();
  }
  $$('.lang button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; try { localStorage.setItem('sc_lang', lang); } catch (e) {} applyLang(); }));

  /* ---------------- escaneo ---------------- */
  const out = $('#out');
  let busy = false;
  function scanningView(target, steps) {
    out.innerHTML = `<div class="panel scanning"><div class="radar"><i></i><canvas width="120" height="140"></canvas></div><div><span class="eyebrow"><i></i>${tr('scanning')}</span><h3>${esc(target.label)}</h3><p class="tgt">${esc(target.sub || '')}</p><ul class="steplist">${steps.map((s, i) => `<li id="st${i}"><i></i>${tr(s)}</li>`).join('')}</ul></div></div>`;
    drawMark(out.querySelector('.radar canvas'), 5, false);
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const step = (i, st) => { const e = $('#st' + i); if (e) e.className = st; };
  function failView(retry) {
    last = () => failView(retry);
    out.innerHTML = `<div class="panel"><div class="failbox"><span class="ic">!</span><div><h3>${tr('failTitle')}</h3><p>${tr('failText')}</p><button type="button" id="retry">${tr('retry')}</button></div></div></div>`;
    $('#retry').addEventListener('click', retry);
  }
  function shareUrl(m, q, chain) {
    const u = new URL(location.href.split('?')[0]);
    u.searchParams.set('mode', m); u.searchParams.set('q', q); if (chain && m !== 'link') u.searchParams.set('chain', chain);
    return u.toString();
  }

  async function run(m, q, chainSel) {
    if (busy) return;
    const err = $('#formErr'); err.hidden = true;
    if (m === 'link') {
      if (!/^https?:\/\//i.test(q)) q = 'https://' + q;
      try { const u = new URL(q); if (!u.hostname.includes('.')) throw 0; } catch (e) { err.textContent = tr('errUrl'); err.hidden = false; return; }
    } else if (SOL.test(q) && !q.startsWith('0x')) {
      if (m !== 'token') { err.textContent = tr('errSolMode'); err.hidden = false; return; }
      chainSel = 'sol';
    } else if (!ADDR.test(q)) { err.textContent = tr('errAddr'); err.hidden = false; return; }
    else if (chainSel === 'sol') chainSel = 'auto';
    busy = true; $('#go').disabled = true;
    try {
      if (m === 'token') await runToken(q, chainSel);
      else if (m === 'wallet') await runWallet(q, chainSel);
      else if (m === 'approvals') await runApprovals(q, chainSel);
      else if (m === 'nft') await runNft(q, chainSel);
      else await runLink(q);
      try { history.replaceState(null, '', shareUrl(m, q, chainSel === 'auto' ? '' : chainSel)); } catch (e) {}
    } finally { busy = false; $('#go').disabled = false; }
  }

  /* ---------------- token ---------------- */
  async function runToken(addr, chainSel) {
    const auto = chainSel === 'auto';
    const steps = auto ? ['stDetect', 'stContract', 'stMarket', 'stScore'] : ['stContract', 'stMarket', 'stScore'];
    scanningView({ label: short(addr), sub: addr }, steps);
    const { chain, gp, gpFail, mine } = await loadToken(addr, chainSel, step, false);
    if (gpFail && !mine.length) return failView(() => run('token', addr, chainSel));
    if (!gp && !mine.length) return notFound(chain);
    const at = new Date();
    /* se reconstruye al cambiar de idioma para que los textos de cada revision tambien cambien */
    last = () => renderToken(buildToken(addr, chain, gp, mine, at), chainSel);
    last();
  }
  function notFound(chain) {
    const c = CHAINS[chain].n;
    last = () => notFound(chain);
    out.innerHTML = `<div class="panel"><div class="failbox"><span class="ic">?</span><div><h3>${tr('nfTitle', { c })}</h3><p>${tr('nfText', { c })}</p></div></div></div>`;
  }

  function buildToken(addr, chain, gp, pairs, at) {
    const L = [];
    const add = (g, id, sev, title, desc) => L.push({ g, id, sev, title, desc });
    const flag = (g, id, field, badSev) => {
      if (!gp || !known(gp[field])) return;
      const x = ct(id), bad = on(gp[field]);
      add(g, id, bad ? badSev : 'ok', bad ? x[1] : x[0], bad ? x[3] : x[2]);
    };
    const flagInv = (g, id, field, badSev) => { /* campo que vale 1 cuando esta bien */
      if (!gp || !known(gp[field])) return;
      const x = ct(id), good = on(gp[field]);
      add(g, id, good ? 'ok' : badSev, good ? x[0] : x[1], good ? x[2] : x[3]);
    };
    let ownerActive = false;
    const SOLC = CHAINS[chain].sol;
    if (gp && SOLC) {
      const sflag = (g, id, val, badSev) => { if (val === undefined || val === null || val === '') return; const x = ct(id), bad = on(st(val)); add(g, id, bad ? badSev : 'ok', bad ? x[1] : x[0], bad ? x[3] : x[2]); };
      const trusted = on(gp.trusted_token);
      sflag('c', 'solMint', gp.mintable, 'high');
      sflag('c', 'solFreeze', gp.freezable, trusted ? 'low' : 'high');
      sflag('c', 'solBal', gp.balance_mutable_authority, 'crit');
      sflag('c', 'solClose', gp.closable, 'high');
      sflag('c', 'solMeta', gp.metadata_mutable, 'low');
      sflag('t', 'solNT', gp.non_transferable, 'crit');
      if (gp.transfer_hook !== undefined) { const h = gp.transfer_hook, bad = Array.isArray(h) ? h.length > 0 : on(st(h)), x = ct('solHook'); add('t', 'solHook', bad ? 'med' : 'ok', bad ? x[1] : x[0], bad ? x[3] : x[2]); }
      if (gp.transfer_fee !== undefined) { const f = gp.transfer_fee, bad = f && typeof f === 'object' ? Object.keys(f).length > 0 : on(f), x = ct('solFee'); add('t', 'solFee', bad ? 'med' : 'ok', bad ? x[1] : x[0], bad ? x[3] : x[2]); }
      sflag('t', 'solFeeUp', gp.transfer_fee_upgradable, 'high');
    }
    if (gp && !SOLC) {
      flagInv('c', 'src', 'is_open_source', 'high');
      if (gp.owner_address !== undefined) {
        ownerActive = !!gp.owner_address && !isBurn(gp.owner_address);
        const x = ct('owner'); add('c', 'owner', ownerActive ? 'low' : 'ok', ownerActive ? x[1] : x[0], ownerActive ? x[3] + ' (' + short(gp.owner_address) + ')' : x[2]);
      }
      flag('c', 'hidden', 'hidden_owner', 'crit');
      flag('c', 'retake', 'can_take_back_ownership', 'crit');
      flag('c', 'bal', 'owner_change_balance', 'crit');
      flag('c', 'mint', 'is_mintable', ownerActive ? 'high' : 'low');
      flag('c', 'proxy', 'is_proxy', 'med');
      flag('c', 'selfd', 'selfdestruct', 'high');
      flag('c', 'ext', 'external_call', 'low');
      flag('t', 'honeypot', 'is_honeypot', 'crit');
      flag('t', 'sellall', 'cannot_sell_all', 'high');
      flag('t', 'buy', 'cannot_buy', 'high');
      const bt = num(gp.buy_tax), st = num(gp.sell_tax);
      if (bt != null || st != null) {
        const mx = Math.max(bt || 0, st || 0), x = ct('tax');
        add('t', 'tax', mx >= .1 ? 'high' : mx >= .05 ? 'med' : mx > 0 ? 'low' : 'ok', fill(x[0], { b: bt == null ? '?' : pct(bt), s: st == null ? '?' : pct(st) }), mx >= .1 ? x[3] : mx > 0 ? x[2] : x[1]);
      }
      flag('t', 'taxmod', 'slippage_modifiable', 'high');
      flag('t', 'ptax', 'personal_slippage_modifiable', 'high');
      flag('t', 'pause', 'transfer_pausable', 'med');
      flag('t', 'black', 'is_blacklisted', 'med');
      flag('t', 'white', 'is_whitelisted', 'med');
      flag('t', 'cool', 'trading_cooldown', 'low');
      flag('t', 'whale', 'anti_whale_modifiable', 'low');
      flagInv('l', 'dex', 'is_in_dex', 'med');
    }
    if (gp && SOLC && Array.isArray(gp.dex)) { const x = ct('dex'), ok = gp.dex.length > 0 || pairs.length > 0; add('l', 'dex', ok ? 'ok' : 'med', ok ? x[0] : x[1], ok ? x[2] : x[3]); }
    /* mercado */
    const top = pairs[0] || null;
    const liqUsd = pairs.reduce((s, p) => s + ((p.liquidity || {}).usd || 0), 0) || null;
    const vol = pairs.reduce((s, p) => s + ((p.volume || {}).h24 || 0), 0);
    if (pairs.length) {
      const x = ct('liq');
      add('l', 'liq', liqUsd < 10000 ? 'high' : liqUsd < 50000 ? 'med' : 'ok', fill(x[0], { v: money(liqUsd) }), liqUsd < 10000 ? x[3] : liqUsd < 50000 ? x[2] : x[1]);
      const created = pairs.map(p => p.pairCreatedAt).filter(Boolean).sort((a, b) => a - b)[0];
      if (created) {
        const ms = Date.now() - created, dd = ms / 864e5, x2 = ct('age');
        add('l', 'age', dd < 7 ? 'med' : dd < 30 ? 'low' : 'ok', fill(x2[0], { x: tr('ago', { x: ageTxt(ms) }) }), dd < 7 ? x2[3] : dd < 30 ? x2[2] : x2[1]);
      }
    }
    if (gp) {
      const lp = !SOLC && Array.isArray(gp.lp_holders) ? gp.lp_holders : [];
      const v3 = (gp.dex || []).some(d => /v3|v4|concentrated/i.test((d.liquidity_type || '') + ' ' + (d.name || '')));
      const x = ct('lplock');
      if (lp.length) {
        const f = frac(lp), locked = lp.reduce((s, h, i) => s + ((on(h.is_locked) || isBurn(h.address)) ? f[i] : 0), 0);
        add('l', 'lplock', locked >= .9 ? 'ok' : locked >= .5 ? 'low' : 'med', fill(locked >= .9 ? x[0] : x[1], { p: pct(Math.min(1, locked), 0) }), locked >= .9 ? x[2] : x[3]);
      } else if (!SOLC && (v3 || pairs.length)) add('l', 'lplock', 'info', x[4], x[5]);
      /* holders */
      const hc = num(gp.holder_count);
      if (hc != null) { const x3 = ct('holders'); add('h', 'holders', hc < 100 ? 'low' : 'ok', fill(x3[0], { n: hc.toLocaleString('en-US') }), hc < 100 ? x3[2] : x3[1]); }
      const hs = Array.isArray(gp.holders) ? gp.holders : [];
      if (hs.length) {
        const f = frac(hs);
        const eoa = hs.reduce((s, h, i) => s + ((on(h.is_contract) || on(h.is_locked) || isBurn(hAddr(h)) || (SOLC && h.tag)) ? 0 : f[i]), 0);
        const x4 = ct('top10');
        add('h', 'top10', eoa > .5 ? 'high' : eoa > .3 ? 'med' : 'ok', fill(x4[0], { p: pct(eoa, 1) }), (eoa > .3 ? x4[2] : x4[1]) + ' ' + x4[3]);
      }
      const cp = num(gp.creator_percent);
      if (cp != null) { const f = cp > 1.0001 ? cp / 100 : cp, x5 = ct('creator'); add('h', 'creator', f > .5 ? 'high' : f > .2 ? 'med' : 'ok', fill(x5[0], { p: pct(f, 1) }), f > .2 ? x5[2] : x5[1]); }
      flag('h', 'airdrop', 'is_airdrop_scam', 'crit');
      flag('h', 'samecr', 'honeypot_with_same_creator', 'high');
      if (gp.fake_token && on(gp.fake_token.value)) { const x6 = ct('fake'); add('h', 'fake', 'crit', x6[1], x6[3]); }
      if (on(gp.trust_list) || on(gp.trusted_token)) { const x7 = ct('trust'); add('h', 'trust', 'info', x7[0], x7[1]); }
    }
    /* puntuacion */
    const W = { crit: 45, high: 18, med: 8, low: 3 };
    const pts = L.reduce((s, c) => s + (W[c.sev] || 0), 0);
    const crit = L.filter(c => c.sev === 'crit');
    let score = Math.max(0, 100 - pts); if (crit.length) score = Math.min(score, 15);
    const v = !gp ? 'na' : crit.length ? 'crit' : score >= 80 ? 'ok' : score >= 55 ? 'med' : 'high';
    const meta = gp && gp.metadata && typeof gp.metadata === 'object' ? gp.metadata : {};
    const name = (gp && (gp.token_name || meta.name)) || (top && top.baseToken && top.baseToken.address.toLowerCase() === addr.toLowerCase() ? top.baseToken.name : '') || short(addr);
    const sym = (gp && (gp.token_symbol || meta.symbol)) || (top && top.baseToken && top.baseToken.address.toLowerCase() === addr.toLowerCase() ? top.baseToken.symbol : '') || '';
    return { addr, chain, gp, pairs, top, liqUsd, vol, list: L, score, v, crit, name, sym, at: at || new Date() };
  }

  const ICO = {
    ok: '<svg viewBox="0 0 12 12"><path d="M2.5 6.2l2.3 2.3 4.7-5"/></svg>',
    bad: '<svg viewBox="0 0 12 12"><path d="M6 2.5v4.2M6 9.3v.1"/></svg>',
    x: '<svg viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6"/></svg>',
    info: '<svg viewBox="0 0 12 12"><path d="M6 5.5v3.5M6 3v.1"/></svg>'
  };
  const SEVK = { ok: 'sOk', low: 'sLow', med: 'sMed', high: 'sHigh', crit: 'sCrit', info: 'sInfo', na: 'sNa' };
  const VK = { ok: 'vOk', med: 'vMed', high: 'vHigh', crit: 'vCrit', na: 'vNa' };
  const VCOL = { ok: '#2fd27f', med: '#f0b44c', high: '#ff7a45', crit: '#ff4d5e', na: '#7d879a' };
  const ring = (score, v) => {
    const C = 2 * Math.PI * 78, off = C * (1 - (v === 'na' ? 0 : score) / 100);
    return `<div class="ring"><svg viewBox="0 0 176 176"><circle class="tr" cx="88" cy="88" r="78"/><circle class="vl" cx="88" cy="88" r="78" stroke="${VCOL[v]}" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-off="${off}" style="filter:drop-shadow(0 0 10px ${VCOL[v]}88)"/></svg><div class="sc"><b class="num" data-to="${v === 'na' ? '' : score}">${v === 'na' ? '—' : '0'}</b><span>${tr('score')}</span></div></div>`;
  };
  function animateRing() {
    const vl = out.querySelector('.ring .vl'), b = out.querySelector('.ring b');
    if (!vl) return;
    requestAnimationFrame(() => requestAnimationFrame(() => { vl.style.strokeDashoffset = vl.dataset.off; }));
    const to = parseInt(b.dataset.to, 10); if (!isFinite(to)) return;
    const st = performance.now();
    (function tick(n) { const k = Math.min(1, (n - st) / 1300), e = 1 - Math.pow(1 - k, 3); b.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(tick); })(st);
  }
  const chk = c => {
    const ic = c.sev === 'ok' ? ICO.ok : c.sev === 'crit' || c.sev === 'high' ? ICO.x : c.sev === 'info' || c.sev === 'na' ? ICO.info : ICO.bad;
    return `<div class="chk s-${c.sev}"><span class="ic">${ic}</span><div><b>${esc(c.title)}</b><p>${esc(c.desc)}</p></div><span class="sev">${tr(SEVK[c.sev])}</span></div>`;
  };

  function renderToken(r, chainSel) {
    const ch = CHAINS[r.chain], url = shareUrl('token', r.addr, r.chain);
    const cnt = { ok: r.list.filter(c => c.sev === 'ok').length, warn: r.list.filter(c => c.sev === 'low' || c.sev === 'med' || c.sev === 'high').length, crit: r.crit.length };
    const sum = r.v === 'na' ? tr('sumNa') : r.v === 'crit' ? tr('sumCrit', { x: r.crit[0].title }) : tr(r.v === 'ok' ? 'sumOk' : r.v === 'med' ? 'sumMed' : 'sumHigh');
    const p = r.top, chg = p && p.priceChange ? num(p.priceChange.h24) : null;
    const created = r.pairs.map(x => x.pairCreatedAt).filter(Boolean).sort((a, b) => a - b)[0];
    const hc = r.gp ? num(r.gp.holder_count) : null;
    const mcap = p ? (p.marketCap || p.fdv || null) : null;
    const kpis = [
      [tr('kPrice'), p ? price(num(p.priceUsd)) : '—', chg == null ? '' : `<small class="${chg >= 0 ? 'up' : 'dn'}">${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%</small>`],
      [tr('kLiq'), money(r.liqUsd), ''], [tr('kVol'), r.pairs.length ? money(r.vol) : '—', ''],
      [tr('kHolders'), hc == null ? '—' : hc.toLocaleString('en-US'), ''],
      [tr('kAge'), created ? ageTxt(Date.now() - created) : '—', ''], [tr('kMcap'), money(mcap), '']
    ];
    const G = [['c', 'gContract'], ['t', 'gTrading'], ['l', 'gLiquidity'], ['h', 'gHolders']];
    const ord = { crit: 0, high: 1, med: 2, low: 3, info: 4, na: 5, ok: 6 };
    const groups = G.map(([g, k]) => {
      const items = r.list.filter(c => c.g === g).sort((a, b) => ord[a.sev] - ord[b.sev]);
      if (!items.length) return '';
      const bad = items.filter(c => !['ok', 'info', 'na'].includes(c.sev)).length;
      return `<div class="group"><h4><span>${tr(k)}</span><span>${items.length - bad}/${items.length}</span></h4>${items.map(chk).join('')}</div>`;
    }).join('');
    const hs = r.gp && Array.isArray(r.gp.holders) ? r.gp.holders : [];
    let holdersHtml = '';
    if (hs.length) {
      const f = frac(hs), mx = Math.max(...f, .0001);
      holdersHtml = `<div class="holders"><h4 class="m" style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--ink3);padding:14px 0 8px;font-weight:500">${tr('topHolders')}</h4>` +
        hs.slice(0, 10).map((h, i) => {
          const ha = hAddr(h), ex = on(h.is_contract) || on(h.is_locked) || isBurn(ha) || (ch.sol && !!h.tag);
          const tags = (isBurn(ha) ? `<span class="tg">${tr('tBurn')}</span>` : '') + (on(h.is_locked) ? `<span class="tg lk">${tr('tLocked')}</span>` : '') + (KNOWN[ha.toLowerCase()] ? `<span class="tg kn">${KNOWN[ha.toLowerCase()]}</span>` : on(h.is_contract) && !isBurn(ha) ? `<span class="tg">${tr('tContract')}</span>` : '') + (h.tag ? `<span class="tg">${esc(h.tag)}</span>` : '');
          return `<div class="hrow"><span class="n">${String(i + 1).padStart(2, '0')}</span><span><a href="${exAcc(ch, esc(ha))}" target="_blank" rel="noopener noreferrer">${short(ha)}</a>${tags}</span><span class="hbar${ex ? ' ex' : ''}"><i data-w="${(f[i] / mx) * 100}"></i></span><span class="p">${pct(f[i])}</span></div>`;
        }).join('') + `<p class="stamp" style="margin-top:10px">${tr('exNote')}</p></div>`;
    }
    const xt = encodeURIComponent(tr('xText', { s: r.sym ? '$' + r.sym : r.name, v: tr(VK[r.v]), n: r.v === 'na' ? '—' : r.score }));
    out.innerHTML = `<div class="panel">
      <div class="rhead">
        ${ring(r.score, r.v)}
        <div>
          <span class="verdict v-${r.v}"><i></i>${tr(VK[r.v])}</span>
          <h2 class="tname">${esc(r.name)}${r.sym ? `<small>$${esc(r.sym)}</small>` : ''}</h2>
          <p class="summary">${esc(sum)}</p>
          <div class="idrow">
            <span class="chipx">${esc(ch.n)}</span>
            <button type="button" class="chipx" data-copy="${esc(r.addr)}"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/></svg>${short(r.addr)}</button>
            <a class="chipx" href="${exTok(ch, esc(r.addr))}" target="_blank" rel="noopener noreferrer">${tr('explorer')} ↗</a>
            ${p && p.url ? `<a class="chipx" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${tr('chart')} ↗</a>` : ''}
          </div>
        </div>
        <div class="share">
          <a class="x" href="https://x.com/intent/post?text=${xt}&url=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" style="fill:currentColor;stroke:none"><path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>${tr('shareX')}</a>
          <button type="button" data-copy="${esc(url)}"><svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></svg>${tr('copyLink')}</button>
          <button type="button" id="copySum"><svg viewBox="0 0 24 24"><path d="M5 5h14v14H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>${tr('copySum')}</button>
        </div>
      </div>
      ${r.gp ? '' : `<p class="note">${tr('partial')}</p>`}
      <div class="kpis">${kpis.map(([k, v, s]) => `<div class="kpi"><span>${k}</span><b class="num">${v}</b>${s}</div>`).join('')}</div>
      <div class="tools">
        <div class="tally"><span class="c-ok"><b>${cnt.ok}</b>${tr('passed')}</span><span class="c-med"><b>${cnt.warn}</b>${tr('warnings')}</span><span class="c-crit"><b>${cnt.crit}</b>${tr('critical')}</span></div>
        <div class="filter"><button type="button" class="on" data-f="all">${tr('all')}</button><button type="button" data-f="issues">${tr('issues')}</button></div>
      </div>
      <div class="groups" id="groups">${groups}</div>
      ${holdersHtml}
      ${sealHtml(r)}
      <p class="stamp">${tr('stamp', { t: r.at.toLocaleString() })}</p>
    </div>`;
    bindCommon(); bindSeal(r);
    out.querySelectorAll('.filter button').forEach(b => b.addEventListener('click', () => {
      out.querySelectorAll('.filter button').forEach(x => x.classList.toggle('on', x === b));
      $('#groups').classList.toggle('only-issues', b.dataset.f === 'issues');
    }));
    $('#copySum').addEventListener('click', () => {
      const lines = [`Shield Check · ${r.name}${r.sym ? ' ($' + r.sym + ')' : ''} · ${ch.n}`, `${tr(VK[r.v])}${r.v === 'na' ? '' : ' · ' + r.score + '/100'}`, sum, ''];
      r.list.filter(c => !['ok', 'info', 'na'].includes(c.sev)).forEach(c => lines.push(`• [${tr(SEVK[c.sev])}] ${c.title}`));
      lines.push('', url); copy(lines.join('\n'));
    });
    animateRing();
    requestAnimationFrame(() => requestAnimationFrame(() => out.querySelectorAll('.hbar i').forEach(i => { i.style.width = i.dataset.w + '%'; })));
  }
  function bindCommon() { out.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => copy(b.dataset.copy))); }

  /* ---------------- sello Shield ---------------- */
  const SEAL = new URL('seal/', location.href.split(/[?#]/)[0].replace(/[^/]*$/, '')).toString();
  let sealStyle = 'dark';
  const sealSrc = (r, s) => `${SEAL}?c=${encodeURIComponent(r.chain)}&t=${encodeURIComponent(r.addr)}&s=${s}&l=${lang}`;
  const sealCode = (r, s) => `<iframe src="${sealSrc(r, s)}" width="340" height="104" style="border:0;max-width:100%" loading="lazy" title="Sectora Shield Seal"></iframe>`;
  function sealHtml(r) {
    return `<div class="seal"><div class="seal-l"><span class="eyebrow"><i></i>${tr('sealEyebrow')}</span><h3>${tr('sealTitle')}</h3><p>${tr('sealText')}</p>
      <div class="filter" id="sealStyle"><button type="button" data-s="dark" class="${sealStyle === 'dark' ? 'on' : ''}">${tr('sealDark')}</button><button type="button" data-s="light" class="${sealStyle === 'light' ? 'on' : ''}">${tr('sealLight')}</button></div></div>
      <div class="seal-r"><div class="seal-prev ${sealStyle}" id="sealPrev"><iframe src="${esc(sealSrc(r, sealStyle))}" width="340" height="104" title="Sectora Shield Seal" loading="lazy"></iframe></div>
      <textarea id="sealCode" readonly rows="3" aria-label="${tr('sealCopy')}">${esc(sealCode(r, sealStyle))}</textarea>
      <button type="button" class="seal-copy" id="sealCopy"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/></svg>${tr('sealCopy')}</button></div></div>`;
  }
  function bindSeal(r) {
    const box = $('#sealStyle'); if (!box) return;
    box.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      sealStyle = b.dataset.s;
      box.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      $('#sealPrev').className = 'seal-prev ' + sealStyle;
      $('#sealPrev iframe').src = sealSrc(r, sealStyle); $('#sealCode').value = sealCode(r, sealStyle);
    }));
    $('#sealCopy').addEventListener('click', () => copy($('#sealCode').value));
  }

  /* ---------------- wallet ---------------- */
  async function runWallet(addr, chainSel) {
    scanningView({ label: short(addr), sub: addr }, ['stWallet', 'stScore']);
    step(0, 'run');
    let res = null;
    try {
      const j = await getJSON(`${GP}/address_security/${addr}` + (chainSel !== 'auto' ? `?chain_id=${chainSel}` : ''));
      res = j && j.result ? j.result : null;
    } catch (e) { res = null; }
    await sleep(450);
    if (!res) { step(0, 'fail'); return failView(() => run('wallet', addr, chainSel)); }
    step(0, 'done'); step(1, 'run'); await sleep(300); step(1, 'done');
    const r = { addr, chainSel, res, at: new Date() };
    last = () => renderWallet(r); renderWallet(r);
  }
  function renderWallet(r) {
    const li = { en: 0, es: 1, pt: 2 }[lang];
    const items = Object.keys(FLAGS).filter(k => known(r.res[k])).map(k => {
      const bad = k === 'number_of_malicious_contracts_created' ? (num(r.res[k]) || 0) > 0 : on(r.res[k]);
      return { k, bad, label: FLAGS[k][li] };
    }).sort((a, b) => b.bad - a.bad);
    const bad = items.filter(i => i.bad);
    const v = bad.length ? 'crit' : 'ok', url = shareUrl('wallet', r.addr, r.chainSel === 'auto' ? '' : r.chainSel);
    out.innerHTML = `<div class="panel">
      <div class="rhead">
        <div class="ring sm"><svg viewBox="0 0 176 176"><circle class="tr" cx="88" cy="88" r="78"/><circle class="vl" cx="88" cy="88" r="78" stroke="${VCOL[v]}" stroke-dasharray="490" stroke-dashoffset="0"/></svg><div class="sc"><b class="num">${bad.length}</b><span>${tr('wFlags')}</span></div></div>
        <div><span class="verdict v-${v}"><i></i>${tr(bad.length ? 'wBad' : 'wOk')}</span>
          <h2 class="tname" style="font-family:'PlexMono';font-size:clamp(18px,2vw,26px)">${esc(r.addr)}</h2>
          <p class="summary">${bad.length ? esc(tr('wSumBad', { x: bad.map(b => b.label).join(', ') })) : tr('wSumOk')}</p>
          <div class="idrow">${on(r.res.contract_address) ? `<span class="chipx">${tr('wContract')}</span>` : ''}<button type="button" class="chipx" data-copy="${esc(url)}">${tr('copyLink')}</button></div>
        </div>
      </div>
      <div class="flags">${items.map(i => `<div class="flag ${i.bad ? 'bad' : 'ok'}"><span class="ic">${i.bad ? ICO.x : ICO.ok}</span>${esc(i.label)}</div>`).join('')}</div>
      <p class="note">${tr('wNote')}</p>
      <p class="stamp">${tr('stampGp', { t: r.at.toLocaleString() })}</p></div>`;
    bindCommon();
  }

  /* ---------------- aprobaciones ---------------- */
  async function runApprovals(addr, chainSel) {
    const chain = chainSel === 'auto' ? '1' : chainSel;
    scanningView({ label: short(addr), sub: addr }, ['stApprovals', 'stScore']);
    step(0, 'run');
    let res = null;
    try {
      const j = await getJSON(`${GP2}/token_approval_security/${chain}?addresses=${addr}`, 20000);
      res = j && (j.code === 1 || j.result) ? (Array.isArray(j.result) ? j.result : []) : null;
    } catch (e) { res = null; }
    await sleep(450);
    if (!res) { step(0, 'fail'); return failView(() => run('approvals', addr, chainSel)); }
    step(0, 'done'); step(1, 'run'); await sleep(300); step(1, 'done');
    const rows = [];
    res.forEach(tk => (tk.approved_list || []).forEach(a => {
      const info = a.address_info || {};
      const amtRaw = a.approved_amount, amtN = num(amtRaw);
      const unl = /unlimit/i.test(String(amtRaw)) || (amtN != null && amtN > 1e30);
      const mal = on(tk.malicious_address) || (Array.isArray(info.malicious_behavior) && info.malicious_behavior.length > 0) || on(info.doubt_list);
      const trusted = on(info.trust_list);
      const risk = mal ? 'bad' : (unl && !trusted) || info.is_open_source === 0 || info.is_open_source === '0' ? 'warn' : 'ok';
      rows.push({ sym: tk.token_symbol || tk.token_name || short(tk.token_address), tokenAddr: tk.token_address, spender: a.approved_contract, sname: info.contract_name || info.tag || '', unl, amt: amtRaw, time: num(a.approved_time), risk });
    }));
    rows.sort((a, b) => ({ bad: 0, warn: 1, ok: 2 }[a.risk] - { bad: 0, warn: 1, ok: 2 }[b.risk]));
    const r = { addr, chain, chainSel, rows, at: new Date() };
    last = () => renderApprovals(r); renderApprovals(r);
  }
  function renderApprovals(r) {
    const ch = CHAINS[r.chain], risky = r.rows.filter(x => x.risk !== 'ok').length;
    const v = r.rows.some(x => x.risk === 'bad') ? 'crit' : risky ? 'med' : 'ok';
    const revoke = `https://revoke.cash/address/${r.addr}?chainId=${r.chain}`;
    const lab = { bad: 'apBad', warn: 'apWarn', ok: 'apOk' };
    out.innerHTML = `<div class="panel">
      <div class="rhead">
        <div class="ring sm"><svg viewBox="0 0 176 176"><circle class="tr" cx="88" cy="88" r="78"/><circle class="vl" cx="88" cy="88" r="78" stroke="${VCOL[v]}" stroke-dasharray="490" stroke-dashoffset="0"/></svg><div class="sc"><b class="num">${r.rows.length}</b><span>${tr('tApprovals')}</span></div></div>
        <div><span class="verdict v-${v}"><i></i>${tr('apSum', { n: r.rows.length, r: risky })}</span>
          <h2 class="tname" style="font-family:'PlexMono';font-size:clamp(18px,2vw,26px)">${esc(r.addr)}</h2>
          <p class="summary">${risky ? tr('apSumBad', { r: risky }) : tr('apSumOk')}</p>
          <div class="idrow"><span class="chipx">${esc(ch.n)}</span><a class="chipx" href="${revoke}" target="_blank" rel="noopener noreferrer">${tr('apRevoke')} ↗</a></div>
        </div>
      </div>
      ${r.chainSel === 'auto' ? `<p class="note">${tr('apAuto', { c: ch.n })}</p>` : ''}
      ${r.rows.length ? `<div class="apv">${r.rows.map(x => `<div class="ap ${x.risk === 'ok' ? '' : x.risk}"><div><b>${esc(x.sym)}</b><small>${esc(short(x.tokenAddr || ''))}</small></div><div class="who"><b style="font-weight:400">${esc(x.sname || short(x.spender))}</b><small><a href="${exAcc(ch, esc(x.spender))}" target="_blank" rel="noopener noreferrer">${esc(x.spender || '')}</a></small></div><span class="amt">${x.unl ? tr('apUnl') : esc(x.amt == null ? '—' : String(x.amt).slice(0, 18))}</span><span class="sev" style="color:${x.risk === 'bad' ? 'var(--crit)' : x.risk === 'warn' ? 'var(--med)' : 'var(--ok)'}">${tr(lab[x.risk])}</span></div>`).join('')}</div>` : `<div class="empty">${tr('apNone', { c: ch.n })}</div>`}
      <p class="stamp">${tr('stampGp', { t: r.at.toLocaleString() })}</p></div>`;
    bindCommon();
  }

  /* ---------------- NFT ---------------- */
  async function runNft(addr, chainSel) {
    const chain = chainSel === 'auto' ? '1' : chainSel;
    scanningView({ label: short(addr), sub: addr }, ['stNft', 'stScore']);
    step(0, 'run');
    let res;
    try {
      const j = await getJSON(`${GP}/nft_security/${chain}?contract_addresses=${addr}`, 20000);
      const r = j && j.result && typeof j.result === 'object' ? j.result : {};
      const k = Object.keys(r).find(x => x.toLowerCase() === addr.toLowerCase());
      res = k && typeof r[k] === 'object' ? r[k] : (r.nft_name !== undefined || r.nft_address !== undefined || r.nft_erc !== undefined ? r : null);
    } catch (e) { res = undefined; }
    await sleep(450);
    if (res === undefined) { step(0, 'fail'); return failView(() => run('nft', addr, chainSel)); }
    step(0, 'done'); step(1, 'run'); await sleep(300); step(1, 'done');
    if (!res) { const c = CHAINS[chain].n; last = () => { out.innerHTML = `<div class="panel"><div class="failbox"><span class="ic">?</span><div><h3>${tr('nfTitle', { c })}</h3><p>${tr('nftNf', { c })}</p></div></div></div>`; }; return last(); }
    const at = new Date();
    last = () => renderNft(buildNft(addr, chain, chainSel, res, at)); last();
  }
  function buildNft(addr, chain, chainSel, d, at) {
    const L = [], val = x => x && typeof x === 'object' && !Array.isArray(x) ? x.value : x;
    const add = (g, id, sev, title, desc) => L.push({ g, id, sev, title, desc });
    const flag = (g, id, v, badSev) => { if (!known(v)) return; const x = ct(id), bad = on(v); add(g, id, bad ? badSev : 'ok', bad ? x[1] : x[0], bad ? x[3] : x[2]); };
    flag('c', 'nftMal', val(d.malicious_nft_contract), 'crit');
    if (known(d.nft_open_source)) { const x = ct('src'), g = on(d.nft_open_source); add('c', 'src', g ? 'ok' : 'high', g ? x[0] : x[1], g ? x[2] : x[3]); }
    flag('c', 'proxy', val(d.nft_proxy), 'med');
    flag('c', 'selfd', val(d.self_destruct), 'high');
    flag('t', 'nftMove', val(d.transfer_without_approval), 'crit');
    flag('t', 'nftBurn', val(d.privileged_burn), 'high');
    flag('t', 'nftMint', val(d.privileged_minting), 'high');
    flag('t', 'nftOver', val(d.oversupply_minting), 'high');
    flag('t', 'nftAppr', val(d.restricted_approval), 'med');
    if (on(d.nft_verified)) { const x = ct('nftVer'); add('c', 'nftVer', 'info', x[0], x[1]); }
    if (on(d.trust_list)) { const x = ct('trust'); add('c', 'trust', 'info', x[0], x[1]); }
    const W = { crit: 45, high: 18, med: 8, low: 3 }, crit = L.filter(c => c.sev === 'crit');
    let score = Math.max(0, 100 - L.reduce((s, c) => s + (W[c.sev] || 0), 0)); if (crit.length) score = Math.min(score, 15);
    const v = !L.length ? 'na' : crit.length ? 'crit' : score >= 80 ? 'ok' : score >= 55 ? 'med' : 'high';
    return { addr, chain, chainSel, d, list: L, score, v, crit, name: d.nft_name || short(addr), sym: d.nft_symbol || '', at };
  }
  function renderNft(r) {
    const ch = CHAINS[r.chain], d = r.d, url = shareUrl('nft', r.addr, r.chainSel === 'auto' ? '' : r.chain);
    const sum = r.v === 'na' ? tr('sumNa') : r.v === 'crit' ? tr('sumCritN', { x: r.crit[0].title }) : tr(r.v === 'ok' ? 'sumOk' : r.v === 'med' ? 'sumMed' : 'sumHigh');
    const link = (u, l) => /^https?:\/\//i.test(u || '') ? `<a class="chipx" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${l} ↗</a>` : '';
    const n = x => { const v = num(x); return v == null ? '—' : v.toLocaleString('en-US'); };
    const kpis = [[tr('kStd'), d.nft_erc ? String(d.nft_erc).toUpperCase() : '—'], [tr('kItems'), n(d.nft_items)], [tr('kOwners'), n(d.nft_owner_number)], [tr('kSales'), n(d.sales_24h)]];
    const ord = { crit: 0, high: 1, med: 2, low: 3, info: 4, na: 5, ok: 6 };
    const groups = [['c', 'gContract'], ['t', 'gTrading']].map(([g, k]) => {
      const items = r.list.filter(c => c.g === g).sort((a, b) => ord[a.sev] - ord[b.sev]);
      if (!items.length) return '';
      const bad = items.filter(c => !['ok', 'info', 'na'].includes(c.sev)).length;
      return `<div class="group"><h4><span>${tr(k)}</span><span>${items.length - bad}/${items.length}</span></h4>${items.map(chk).join('')}</div>`;
    }).join('');
    out.innerHTML = `<div class="panel">
      <div class="rhead">
        ${ring(r.score, r.v)}
        <div>
          <span class="verdict v-${r.v}"><i></i>${tr(VK[r.v])}</span>
          <h2 class="tname">${esc(r.name)}${r.sym ? `<small>${esc(r.sym)}</small>` : ''}</h2>
          <p class="summary">${esc(sum)}</p>
          <div class="idrow">
            <span class="chipx">${esc(ch.n)} · NFT</span>
            <button type="button" class="chipx" data-copy="${esc(r.addr)}">${short(r.addr)}</button>
            <a class="chipx" href="${exTok(ch, esc(r.addr))}" target="_blank" rel="noopener noreferrer">${tr('explorer')} ↗</a>
            ${link(d.website_url, 'Web')}${link(d.twitter_url, 'X')}${link(d.discord_url, 'Discord')}
          </div>
        </div>
        <div class="share"><button type="button" data-copy="${esc(url)}">${tr('copyLink')}</button></div>
      </div>
      ${r.chainSel === 'auto' ? `<p class="note">${tr('nftAuto', { c: ch.n })}</p>` : ''}
      <div class="kpis kpis4">${kpis.map(([k, v]) => `<div class="kpi"><span>${k}</span><b class="num">${v}</b></div>`).join('')}</div>
      <div class="groups" style="margin-top:24px">${groups}</div>
      <p class="stamp">${tr('stampGp', { t: r.at.toLocaleString() })}</p></div>`;
    bindCommon(); animateRing();
  }

  /* ---------------- enlace ---------------- */
  async function runLink(url) {
    const host = (() => { try { return new URL(url).hostname; } catch (e) { return url; } })();
    scanningView({ label: host, sub: url }, ['stLink', 'stDapp', 'stScore']);
    step(0, 'run'); step(1, 'run');
    const ph = getJSON(`${GP}/phishing_site?url=${encodeURIComponent(url)}`).then(j => j && j.result ? j.result : undefined).catch(() => undefined);
    const da = getJSON(`${GP}/dapp_security?url=${encodeURIComponent(url)}`).then(j => j && j.result && typeof j.result === 'object' && Object.keys(j.result).length ? j.result : null).catch(() => null);
    const [p, d] = await Promise.all([ph, da]);
    await sleep(450);
    step(0, p === undefined ? 'fail' : 'done'); step(1, 'done');
    if (p === undefined && !d) return failView(() => run('link', url));
    step(2, 'run'); await sleep(300); step(2, 'done');
    const r = { url, host, bad: p ? on(p.phishing_site) : false, ph: p !== undefined, dapp: d, at: new Date() };
    last = () => renderLink(r); renderLink(r);
  }
  function dappInfo(d) {
    if (!d) return null;
    const audits = (Array.isArray(d.audit_info) ? d.audit_info : []).filter(a => a && (a.audit_firm || a.audit_link));
    const cons = [];
    (Array.isArray(d.contracts_security) ? d.contracts_security : []).forEach(g => (g.contracts || []).forEach(c => cons.push({
      chain: String(g.chain_id || ''), addr: c.contract_address || '', open: known(c.is_open_source) ? on(c.is_open_source) : null,
      mal: on(c.malicious_contract) || on(c.malicious_creator) || (Array.isArray(c.malicious_behavior) && c.malicious_behavior.length > 0)
    })));
    return { name: d.project_name || '', audits, cons, trusted: on(d.trust_list), mal: cons.some(c => c.mal) };
  }
  function renderLink(r) {
    const di = dappInfo(r.dapp), v = r.bad || (di && di.mal) ? 'crit' : r.ph ? 'ok' : 'na';
    const title = r.bad ? tr('lBad') : di && di.mal ? tr('dMalT') : r.ph ? tr('lOk') : tr('lPhFail');
    const sum = r.bad ? tr('lSumBad') : di && di.mal ? tr('dMalSum') : r.ph ? tr('lSumOk') : tr('lSumPhFail');
    const dapp = !di ? `<div class="empty">${tr('dNone')}</div>` : `<div class="dapp">
        <div class="dapp-h"><b>${esc(di.name || r.host)}</b>${di.trusted ? `<span class="chipx ok">${tr('dTrusted')}</span>` : ''}
          ${di.audits.length ? di.audits.map(a => /^https?:\/\//i.test(a.audit_link || '') ? `<a class="chipx" href="${esc(a.audit_link)}" target="_blank" rel="noopener noreferrer">${esc(tr('dAudit', { f: a.audit_firm || '—' }))} ↗</a>` : `<span class="chipx">${esc(tr('dAudit', { f: a.audit_firm || '—' }))}</span>`).join('') : `<span class="chipx">${tr('dNoAudit')}</span>`}</div>
        ${di.cons.length ? `<h4 class="m">${tr('dContracts')} · ${di.cons.length}</h4><div class="dcons">${di.cons.slice(0, 40).map(c => { const chn = CHAINS[c.chain]; return `<div class="dcon${c.mal ? ' bad' : ''}"><span>${esc(chn ? chn.n : 'Chain ' + c.chain)}</span>${chn ? `<a href="${exAcc(chn, esc(c.addr))}" target="_blank" rel="noopener noreferrer">${short(c.addr)}</a>` : `<span class="m">${short(c.addr)}</span>`}<em class="${c.mal ? 'b' : c.open === false ? 'w' : 'g'}">${c.mal ? tr('dMal') : c.open === false ? tr('dClosed') : c.open ? tr('dOpen') : '—'}</em></div>`; }).join('')}</div>` : ''}
      </div>`;
    out.innerHTML = `<div class="panel">
      <div class="rhead">
        <div class="ring sm"><svg viewBox="0 0 176 176"><circle class="tr" cx="88" cy="88" r="78"/><circle class="vl" cx="88" cy="88" r="78" stroke="${VCOL[v]}" stroke-dasharray="490" stroke-dashoffset="0"/></svg><div class="sc">${v === 'crit' ? '<b style="font-size:40px;color:var(--crit)">!</b>' : v === 'na' ? `<b style="font-size:36px;color:${VCOL.na}">?</b>` : '<b style="font-size:34px;color:var(--ok)">✓</b>'}</div></div>
        <div><span class="verdict v-${v}"><i></i>${esc(title)}</span>
          <h2 class="tname" style="word-break:break-all">${esc(r.host)}</h2>
          <p class="summary">${esc(sum)}</p>
          <div class="idrow"><span class="chipx">${esc(r.url.slice(0, 60))}</span><button type="button" class="chipx" data-copy="${esc(shareUrl('link', r.url))}">${tr('copyLink')}</button></div>
        </div>
      </div>
      <h3 class="subh">${tr('dTitle')}</h3>
      ${dapp}
      <p class="note">${tr('lNote')}</p>
      <p class="stamp">${tr('stampGp', { t: r.at.toLocaleString() })}</p></div>`;
    bindCommon();
  }

  /* ---------------- inicio ---------------- */
  applyLang();
  const qs = new URLSearchParams(location.search), qm = qs.get('mode'), qq = qs.get('q');
  if (qm && EX[qm]) setMode(qm);
  if (qs.get('chain') && CHAINS[qs.get('chain')]) $('#chain').value = qs.get('chain');
  if (qq) { $('#q').value = qq; run(mode, qq.trim(), $('#chain').value); }
})();
