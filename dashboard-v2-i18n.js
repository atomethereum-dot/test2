/* Textos del Dashboard con el nodo simplificado. Se suman a los del dashboard antes de que
   i18n.js los aplique. Sin % en premios: solo cantidades de SECT. */
(function () {
  var V = {
    en: {
      "hashdash.v2.how.sub": "Testnet · 3 easy steps",
      "hashdash.v2.how.lead": "Your Hash Node now turns on with your staking. <b>No Sepolia, no faucet, no buying hash and no gas.</b>",
      "hashdash.v2.s1.t": "Stake #SECT",
      "hashdash.v2.s1.p": "Put at least <b>100 SECT</b> in staking. Your staking is what turns your node on.",
      "hashdash.v2.s1.go": "Go to staking",
      "hashdash.v2.s2.t": "Connect your wallet",
      "hashdash.v2.s2.p": "Use the <b>same wallet you stake with</b>, on the normal Ethereum network. No network switch and nothing to pay.",
      "hashdash.v2.s3.t": "Your node is on",
      "hashdash.v2.s3.p": "The dashboard reads your staking and shows your Hash Node on. That's it: you're in Airdrop Genesis.",
      "hashdash.v2.s3.go": "See my node",
      "hashdash.v2.f1.t": "Nothing to pay",
      "hashdash.v2.f1.p": "Connecting only reads your public address. The dashboard never moves funds.",
      "hashdash.v2.f2.t": "Nodes already registered",
      "hashdash.v2.f2.p": "Nodes registered before keep their date and their days. Nothing changes for them.",
      "hashdash.v2.f3.t": "Your staking stays as it is",
      "hashdash.v2.f3.p": "The dashboard only reads your staking. To add or withdraw SECT, use the staking page.",
      "hashdash.v2.node.sub": "Turns on with your staking",
      "hashdash.v2.card.k": "Your Hash Node",
      "hashdash.v2.card.connect": "Connect your wallet to see your node.",
      "hashdash.v2.card.connectSub": "Use the same wallet you stake with. Connecting doesn't move funds.",
      "hashdash.v2.card.reading": "Reading your staking…",
      "hashdash.v2.card.on": "Node on",
      "hashdash.v2.card.off": "Node off",
      "hashdash.v2.card.onSub": "Your node is on thanks to your staking. You're in Airdrop Genesis.",
      "hashdash.v2.card.offSub": "Your node turns on with 100 SECT in staking.",
      "hashdash.v2.card.staked": "SECT in staking",
      "hashdash.v2.card.level": "Level",
      "hashdash.v2.card.since": "On since",
      "hashdash.v2.card.prize": "Your airdrop prize",
      "hashdash.v2.card.earned": "Earned so far",
      "hashdash.v2.card.wallet": "Wallet",
      "hashdash.v2.card.stake": "Go to staking",
      "hashdash.v2.card.err": "Couldn't read the network. Try again in a moment.",
      "hashdash.v2.card.retry": "Retry",
      "hashdash.v2.wsel.foot": "Sectora never asks for your seed phrase · Ethereum"
    },
    es: {
      "hashdash.v2.how.sub": "Testnet · 3 pasos sencillos",
      "hashdash.v2.how.lead": "Tu Hash Node ahora se enciende con tu staking. <b>Sin Sepolia, sin faucet, sin comprar hash y sin gas.</b>",
      "hashdash.v2.s1.t": "Haz staking de #SECT",
      "hashdash.v2.s1.p": "Pon al menos <b>100 SECT</b> en staking. Tu staking es lo que enciende tu nodo.",
      "hashdash.v2.s1.go": "Ir al staking",
      "hashdash.v2.s2.t": "Conecta tu wallet",
      "hashdash.v2.s2.p": "Usa la <b>misma wallet del staking</b>, en la red normal de Ethereum. Sin cambiar de red y sin pagar nada.",
      "hashdash.v2.s3.t": "Tu nodo está encendido",
      "hashdash.v2.s3.p": "El dashboard lee tu staking y muestra tu Hash Node encendido. Y listo: ya estás en el Airdrop Genesis.",
      "hashdash.v2.s3.go": "Ver mi nodo",
      "hashdash.v2.f1.t": "Nada que pagar",
      "hashdash.v2.f1.p": "Conectar solo lee tu dirección pública. El dashboard nunca mueve fondos.",
      "hashdash.v2.f2.t": "Nodos ya registrados",
      "hashdash.v2.f2.p": "Los nodos registrados antes conservan su fecha y sus días. Para ellos no cambia nada.",
      "hashdash.v2.f3.t": "Tu staking sigue igual",
      "hashdash.v2.f3.p": "El dashboard solo lee tu staking. Para añadir o retirar SECT, usa la página de staking.",
      "hashdash.v2.node.sub": "Se enciende con tu staking",
      "hashdash.v2.card.k": "Tu Hash Node",
      "hashdash.v2.card.connect": "Conecta tu wallet para ver tu nodo.",
      "hashdash.v2.card.connectSub": "Usa la misma wallet del staking. Conectar no mueve fondos.",
      "hashdash.v2.card.reading": "Leyendo tu staking…",
      "hashdash.v2.card.on": "Nodo encendido",
      "hashdash.v2.card.off": "Nodo apagado",
      "hashdash.v2.card.onSub": "Tu nodo está encendido gracias a tu staking. Ya estás en el Airdrop Genesis.",
      "hashdash.v2.card.offSub": "Tu nodo se enciende con 100 SECT en staking.",
      "hashdash.v2.card.staked": "SECT en staking",
      "hashdash.v2.card.level": "Nivel",
      "hashdash.v2.card.since": "Encendido desde",
      "hashdash.v2.card.prize": "Tu premio del airdrop",
      "hashdash.v2.card.earned": "Ganado hasta ahora",
      "hashdash.v2.card.wallet": "Wallet",
      "hashdash.v2.card.stake": "Ir al staking",
      "hashdash.v2.card.err": "No se pudo leer la red. Prueba de nuevo en un momento.",
      "hashdash.v2.card.retry": "Reintentar",
      "hashdash.v2.wsel.foot": "Sectora nunca te pide tu frase semilla · Ethereum"
    },
    pt: {
      "hashdash.v2.how.sub": "Testnet · 3 passos simples",
      "hashdash.v2.how.lead": "Seu Hash Node agora liga com o seu staking. <b>Sem Sepolia, sem faucet, sem comprar hash e sem gas.</b>",
      "hashdash.v2.s1.t": "Faça staking de #SECT",
      "hashdash.v2.s1.p": "Coloque pelo menos <b>100 SECT</b> em staking. É o seu staking que liga o seu nó.",
      "hashdash.v2.s1.go": "Ir ao staking",
      "hashdash.v2.s2.t": "Conecte sua carteira",
      "hashdash.v2.s2.p": "Use a <b>mesma carteira do staking</b>, na rede normal do Ethereum. Sem trocar de rede e sem pagar nada.",
      "hashdash.v2.s3.t": "Seu nó está ligado",
      "hashdash.v2.s3.p": "O dashboard lê seu staking e mostra seu Hash Node ligado. Pronto: você já está no Airdrop Genesis.",
      "hashdash.v2.s3.go": "Ver meu nó",
      "hashdash.v2.f1.t": "Nada a pagar",
      "hashdash.v2.f1.p": "Conectar só lê seu endereço público. O dashboard nunca movimenta fundos.",
      "hashdash.v2.f2.t": "Nós já registrados",
      "hashdash.v2.f2.p": "Os nós registrados antes mantêm a data e os dias. Para eles nada muda.",
      "hashdash.v2.f3.t": "Seu staking continua igual",
      "hashdash.v2.f3.p": "O dashboard só lê seu staking. Para adicionar ou retirar SECT, use a página de staking.",
      "hashdash.v2.node.sub": "Liga com o seu staking",
      "hashdash.v2.card.k": "Seu Hash Node",
      "hashdash.v2.card.connect": "Conecte sua carteira para ver seu nó.",
      "hashdash.v2.card.connectSub": "Use a mesma carteira do staking. Conectar não movimenta fundos.",
      "hashdash.v2.card.reading": "Lendo seu staking…",
      "hashdash.v2.card.on": "Nó ligado",
      "hashdash.v2.card.off": "Nó desligado",
      "hashdash.v2.card.onSub": "Seu nó está ligado graças ao seu staking. Você já está no Airdrop Genesis.",
      "hashdash.v2.card.offSub": "Seu nó liga com 100 SECT em staking.",
      "hashdash.v2.card.staked": "SECT em staking",
      "hashdash.v2.card.level": "Nível",
      "hashdash.v2.card.since": "Ligado desde",
      "hashdash.v2.card.prize": "Seu prêmio do airdrop",
      "hashdash.v2.card.earned": "Ganho até agora",
      "hashdash.v2.card.wallet": "Carteira",
      "hashdash.v2.card.stake": "Ir ao staking",
      "hashdash.v2.card.err": "Não foi possível ler a rede. Tente de novo em instantes.",
      "hashdash.v2.card.retry": "Tentar de novo",
      "hashdash.v2.wsel.foot": "A Sectora nunca pede sua frase semente · Ethereum"
    },
    fr: {
      "hashdash.v2.how.sub": "Testnet · 3 étapes simples",
      "hashdash.v2.how.lead": "Votre Hash Node s’allume désormais avec votre staking. <b>Sans Sepolia, sans faucet, sans acheter de hash et sans gas.</b>",
      "hashdash.v2.s1.t": "Stakez des #SECT",
      "hashdash.v2.s1.p": "Mettez au moins <b>100 SECT</b> en staking. C’est votre staking qui allume votre nœud.",
      "hashdash.v2.s1.go": "Aller au staking",
      "hashdash.v2.s2.t": "Connectez votre wallet",
      "hashdash.v2.s2.p": "Utilisez le <b>même wallet que pour le staking</b>, sur le réseau Ethereum normal. Aucun changement de réseau, rien à payer.",
      "hashdash.v2.s3.t": "Votre nœud est allumé",
      "hashdash.v2.s3.p": "Le dashboard lit votre staking et affiche votre Hash Node allumé. C’est tout : vous participez à l’Airdrop Genesis.",
      "hashdash.v2.s3.go": "Voir mon nœud",
      "hashdash.v2.f1.t": "Rien à payer",
      "hashdash.v2.f1.p": "La connexion lit seulement votre adresse publique. Le dashboard ne déplace jamais de fonds.",
      "hashdash.v2.f2.t": "Nœuds déjà enregistrés",
      "hashdash.v2.f2.p": "Les nœuds enregistrés avant gardent leur date et leurs jours. Rien ne change pour eux.",
      "hashdash.v2.f3.t": "Votre staking ne change pas",
      "hashdash.v2.f3.p": "Le dashboard lit seulement votre staking. Pour ajouter ou retirer des SECT, utilisez la page de staking.",
      "hashdash.v2.node.sub": "S’allume avec votre staking",
      "hashdash.v2.card.k": "Votre Hash Node",
      "hashdash.v2.card.connect": "Connectez votre wallet pour voir votre nœud.",
      "hashdash.v2.card.connectSub": "Utilisez le même wallet que pour le staking. La connexion ne déplace pas de fonds.",
      "hashdash.v2.card.reading": "Lecture de votre staking…",
      "hashdash.v2.card.on": "Nœud allumé",
      "hashdash.v2.card.off": "Nœud éteint",
      "hashdash.v2.card.onSub": "Votre nœud est allumé grâce à votre staking. Vous participez à l’Airdrop Genesis.",
      "hashdash.v2.card.offSub": "Votre nœud s’allume avec 100 SECT en staking.",
      "hashdash.v2.card.staked": "SECT en staking",
      "hashdash.v2.card.level": "Niveau",
      "hashdash.v2.card.since": "Allumé depuis",
      "hashdash.v2.card.prize": "Votre prix de l’airdrop",
      "hashdash.v2.card.earned": "Gagné jusqu’ici",
      "hashdash.v2.card.wallet": "Wallet",
      "hashdash.v2.card.stake": "Aller au staking",
      "hashdash.v2.card.err": "Impossible de lire le réseau. Réessayez dans un instant.",
      "hashdash.v2.card.retry": "Réessayer",
      "hashdash.v2.wsel.foot": "Sectora ne demande jamais votre phrase de récupération · Ethereum"
    },
    de: {
      "hashdash.v2.how.sub": "Testnet · 3 einfache Schritte",
      "hashdash.v2.how.lead": "Dein Hash Node geht jetzt mit deinem Staking an. <b>Kein Sepolia, kein Faucet, kein Hash-Kauf und kein Gas.</b>",
      "hashdash.v2.s1.t": "#SECT staken",
      "hashdash.v2.s1.p": "Lege mindestens <b>100 SECT</b> ins Staking. Dein Staking schaltet deinen Node ein.",
      "hashdash.v2.s1.go": "Zum Staking",
      "hashdash.v2.s2.t": "Wallet verbinden",
      "hashdash.v2.s2.p": "Nutze <b>dieselbe Wallet wie beim Staking</b>, im normalen Ethereum-Netzwerk. Kein Netzwerkwechsel, nichts zu bezahlen.",
      "hashdash.v2.s3.t": "Dein Node ist an",
      "hashdash.v2.s3.p": "Das Dashboard liest dein Staking und zeigt deinen Hash Node eingeschaltet. Fertig: Du bist beim Airdrop Genesis dabei.",
      "hashdash.v2.s3.go": "Meinen Node ansehen",
      "hashdash.v2.f1.t": "Nichts zu bezahlen",
      "hashdash.v2.f1.p": "Beim Verbinden wird nur deine öffentliche Adresse gelesen. Das Dashboard bewegt nie Guthaben.",
      "hashdash.v2.f2.t": "Bereits registrierte Nodes",
      "hashdash.v2.f2.p": "Früher registrierte Nodes behalten ihr Datum und ihre Tage. Für sie ändert sich nichts.",
      "hashdash.v2.f3.t": "Dein Staking bleibt, wie es ist",
      "hashdash.v2.f3.p": "Das Dashboard liest dein Staking nur. Um SECT hinzuzufügen oder abzuheben, nutze die Staking-Seite.",
      "hashdash.v2.node.sub": "Geht mit deinem Staking an",
      "hashdash.v2.card.k": "Dein Hash Node",
      "hashdash.v2.card.connect": "Verbinde deine Wallet, um deinen Node zu sehen.",
      "hashdash.v2.card.connectSub": "Nutze dieselbe Wallet wie beim Staking. Verbinden bewegt kein Guthaben.",
      "hashdash.v2.card.reading": "Dein Staking wird gelesen…",
      "hashdash.v2.card.on": "Node an",
      "hashdash.v2.card.off": "Node aus",
      "hashdash.v2.card.onSub": "Dein Node ist dank deines Stakings an. Du bist beim Airdrop Genesis dabei.",
      "hashdash.v2.card.offSub": "Dein Node geht mit 100 SECT im Staking an.",
      "hashdash.v2.card.staked": "SECT im Staking",
      "hashdash.v2.card.level": "Stufe",
      "hashdash.v2.card.since": "An seit",
      "hashdash.v2.card.prize": "Dein Airdrop-Preis",
      "hashdash.v2.card.earned": "Bisher verdient",
      "hashdash.v2.card.wallet": "Wallet",
      "hashdash.v2.card.stake": "Zum Staking",
      "hashdash.v2.card.err": "Das Netzwerk konnte nicht gelesen werden. Versuche es gleich noch einmal.",
      "hashdash.v2.card.retry": "Erneut versuchen",
      "hashdash.v2.wsel.foot": "Sectora fragt nie nach deiner Seed-Phrase · Ethereum"
    },
    ru: {
      "hashdash.v2.how.sub": "Testnet · 3 простых шага",
      "hashdash.v2.how.lead": "Теперь ваш Hash Node включается вашим стейкингом. <b>Без Sepolia, без крана, без покупки хэша и без газа.</b>",
      "hashdash.v2.s1.t": "Застейкайте #SECT",
      "hashdash.v2.s1.p": "Положите в стейкинг не менее <b>100 SECT</b>. Именно стейкинг включает ваш узел.",
      "hashdash.v2.s1.go": "Перейти к стейкингу",
      "hashdash.v2.s2.t": "Подключите кошелёк",
      "hashdash.v2.s2.p": "Используйте <b>тот же кошелёк, что и для стейкинга</b>, в обычной сети Ethereum. Без смены сети и без оплаты.",
      "hashdash.v2.s3.t": "Ваш узел включён",
      "hashdash.v2.s3.p": "Дашборд читает ваш стейкинг и показывает, что Hash Node включён. Готово: вы участвуете в Airdrop Genesis.",
      "hashdash.v2.s3.go": "Мой узел",
      "hashdash.v2.f1.t": "Платить ничего не нужно",
      "hashdash.v2.f1.p": "При подключении читается только ваш публичный адрес. Дашборд никогда не перемещает средства.",
      "hashdash.v2.f2.t": "Уже зарегистрированные узлы",
      "hashdash.v2.f2.p": "Узлы, зарегистрированные раньше, сохраняют свою дату и свои дни. Для них ничего не меняется.",
      "hashdash.v2.f3.t": "Ваш стейкинг не меняется",
      "hashdash.v2.f3.p": "Дашборд только читает ваш стейкинг. Чтобы добавить или вывести SECT, используйте страницу стейкинга.",
      "hashdash.v2.node.sub": "Включается вашим стейкингом",
      "hashdash.v2.card.k": "Ваш Hash Node",
      "hashdash.v2.card.connect": "Подключите кошелёк, чтобы увидеть свой узел.",
      "hashdash.v2.card.connectSub": "Используйте тот же кошелёк, что и для стейкинга. Подключение не перемещает средства.",
      "hashdash.v2.card.reading": "Читаем ваш стейкинг…",
      "hashdash.v2.card.on": "Узел включён",
      "hashdash.v2.card.off": "Узел выключен",
      "hashdash.v2.card.onSub": "Ваш узел включён благодаря стейкингу. Вы участвуете в Airdrop Genesis.",
      "hashdash.v2.card.offSub": "Ваш узел включается при 100 SECT в стейкинге.",
      "hashdash.v2.card.staked": "SECT в стейкинге",
      "hashdash.v2.card.level": "Уровень",
      "hashdash.v2.card.since": "Включён с",
      "hashdash.v2.card.prize": "Ваш приз эйрдропа",
      "hashdash.v2.card.earned": "Заработано на сегодня",
      "hashdash.v2.card.wallet": "Кошелёк",
      "hashdash.v2.card.stake": "Перейти к стейкингу",
      "hashdash.v2.card.err": "Не удалось прочитать сеть. Попробуйте ещё раз через минуту.",
      "hashdash.v2.card.retry": "Повторить",
      "hashdash.v2.wsel.foot": "Sectora никогда не просит вашу сид-фразу · Ethereum"
    },
    zh: {
      "hashdash.v2.how.sub": "测试网 · 3 个简单步骤",
      "hashdash.v2.how.lead": "现在你的 Hash Node 由质押开启。<b>无需 Sepolia、无需水龙头、无需购买算力，也无需 gas。</b>",
      "hashdash.v2.s1.t": "质押 #SECT",
      "hashdash.v2.s1.p": "质押至少 <b>100 SECT</b>。正是你的质押开启了你的节点。",
      "hashdash.v2.s1.go": "前往质押",
      "hashdash.v2.s2.t": "连接钱包",
      "hashdash.v2.s2.p": "使用<b>与质押相同的钱包</b>，在普通的以太坊网络上即可。无需切换网络，无需付费。",
      "hashdash.v2.s3.t": "你的节点已开启",
      "hashdash.v2.s3.p": "Dashboard 读取你的质押并显示你的 Hash Node 已开启。就这样：你已加入 Airdrop Genesis。",
      "hashdash.v2.s3.go": "查看我的节点",
      "hashdash.v2.f1.t": "无需付费",
      "hashdash.v2.f1.p": "连接只读取你的公开地址。Dashboard 从不转移资金。",
      "hashdash.v2.f2.t": "已注册的节点",
      "hashdash.v2.f2.p": "之前注册的节点保留其日期和天数。对它们来说没有任何变化。",
      "hashdash.v2.f3.t": "你的质押保持不变",
      "hashdash.v2.f3.p": "Dashboard 只读取你的质押。如需增加或取出 SECT，请使用质押页面。",
      "hashdash.v2.node.sub": "由你的质押开启",
      "hashdash.v2.card.k": "你的 Hash Node",
      "hashdash.v2.card.connect": "连接钱包即可查看你的节点。",
      "hashdash.v2.card.connectSub": "使用与质押相同的钱包。连接不会转移资金。",
      "hashdash.v2.card.reading": "正在读取你的质押…",
      "hashdash.v2.card.on": "节点已开启",
      "hashdash.v2.card.off": "节点未开启",
      "hashdash.v2.card.onSub": "你的节点因质押而开启。你已加入 Airdrop Genesis。",
      "hashdash.v2.card.offSub": "质押 100 SECT 即可开启你的节点。",
      "hashdash.v2.card.staked": "质押中的 SECT",
      "hashdash.v2.card.level": "等级",
      "hashdash.v2.card.since": "开启自",
      "hashdash.v2.card.prize": "你的空投奖励",
      "hashdash.v2.card.earned": "目前已获得",
      "hashdash.v2.card.wallet": "钱包",
      "hashdash.v2.card.stake": "前往质押",
      "hashdash.v2.card.err": "无法读取网络，请稍后再试。",
      "hashdash.v2.card.retry": "重试",
      "hashdash.v2.wsel.foot": "Sectora 从不索要你的助记词 · Ethereum"
    },
    ja: {
      "hashdash.v2.how.sub": "テストネット · かんたん 3 ステップ",
      "hashdash.v2.how.lead": "Hash Node はステーキングでオンになります。<b>Sepolia も、フォーセットも、ハッシュの購入も、ガスも不要です。</b>",
      "hashdash.v2.s1.t": "#SECT をステーキング",
      "hashdash.v2.s1.p": "<b>100 SECT</b> 以上をステーキングしてください。ステーキングがノードをオンにします。",
      "hashdash.v2.s1.go": "ステーキングへ",
      "hashdash.v2.s2.t": "ウォレットを接続",
      "hashdash.v2.s2.p": "<b>ステーキングと同じウォレット</b>を、通常の Ethereum ネットワークで使います。ネットワークの切り替えも支払いも不要です。",
      "hashdash.v2.s3.t": "ノードがオンに",
      "hashdash.v2.s3.p": "ダッシュボードがステーキングを読み取り、Hash Node をオンと表示します。これだけで Airdrop Genesis に参加できます。",
      "hashdash.v2.s3.go": "自分のノードを見る",
      "hashdash.v2.f1.t": "支払いは不要",
      "hashdash.v2.f1.p": "接続で読み取るのは公開アドレスだけです。ダッシュボードが資金を動かすことはありません。",
      "hashdash.v2.f2.t": "登録済みのノード",
      "hashdash.v2.f2.p": "以前に登録したノードは、日付と日数がそのまま残ります。何も変わりません。",
      "hashdash.v2.f3.t": "ステーキングはそのまま",
      "hashdash.v2.f3.p": "ダッシュボードはステーキングを読み取るだけです。SECT の追加や引き出しはステーキングページで行います。",
      "hashdash.v2.node.sub": "ステーキングでオン",
      "hashdash.v2.card.k": "あなたの Hash Node",
      "hashdash.v2.card.connect": "ウォレットを接続するとノードが表示されます。",
      "hashdash.v2.card.connectSub": "ステーキングと同じウォレットを使ってください。接続で資金は動きません。",
      "hashdash.v2.card.reading": "ステーキングを読み取り中…",
      "hashdash.v2.card.on": "ノード オン",
      "hashdash.v2.card.off": "ノード オフ",
      "hashdash.v2.card.onSub": "ステーキングによりノードはオンです。Airdrop Genesis に参加しています。",
      "hashdash.v2.card.offSub": "100 SECT のステーキングでノードがオンになります。",
      "hashdash.v2.card.staked": "ステーキング中の SECT",
      "hashdash.v2.card.level": "レベル",
      "hashdash.v2.card.since": "オンになった日",
      "hashdash.v2.card.prize": "エアドロップの報酬",
      "hashdash.v2.card.earned": "これまでの獲得",
      "hashdash.v2.card.wallet": "ウォレット",
      "hashdash.v2.card.stake": "ステーキングへ",
      "hashdash.v2.card.err": "ネットワークを読み取れませんでした。少し待ってからもう一度お試しください。",
      "hashdash.v2.card.retry": "再試行",
      "hashdash.v2.wsel.foot": "Sectora がシードフレーズを求めることはありません · Ethereum"
    },
    ko: {
      "hashdash.v2.how.sub": "테스트넷 · 간단한 3단계",
      "hashdash.v2.how.lead": "이제 Hash Node는 스테이킹으로 켜집니다. <b>Sepolia, 포싯, 해시 구매, 가스 모두 필요 없습니다.</b>",
      "hashdash.v2.s1.t": "#SECT 스테이킹",
      "hashdash.v2.s1.p": "최소 <b>100 SECT</b>를 스테이킹하세요. 스테이킹이 노드를 켭니다.",
      "hashdash.v2.s1.go": "스테이킹으로 이동",
      "hashdash.v2.s2.t": "지갑 연결",
      "hashdash.v2.s2.p": "<b>스테이킹에 쓴 지갑과 같은 지갑</b>을 일반 이더리움 네트워크에서 사용하세요. 네트워크 변경도, 결제도 필요 없습니다.",
      "hashdash.v2.s3.t": "노드가 켜졌습니다",
      "hashdash.v2.s3.p": "대시보드가 스테이킹을 읽고 Hash Node가 켜졌다고 표시합니다. 끝: Airdrop Genesis에 참여했습니다.",
      "hashdash.v2.s3.go": "내 노드 보기",
      "hashdash.v2.f1.t": "결제 없음",
      "hashdash.v2.f1.p": "연결은 공개 주소만 읽습니다. 대시보드는 자금을 절대 옮기지 않습니다.",
      "hashdash.v2.f2.t": "이미 등록된 노드",
      "hashdash.v2.f2.p": "이전에 등록된 노드는 날짜와 일수가 그대로 유지됩니다. 아무것도 바뀌지 않습니다.",
      "hashdash.v2.f3.t": "스테이킹은 그대로",
      "hashdash.v2.f3.p": "대시보드는 스테이킹을 읽기만 합니다. SECT를 추가하거나 인출하려면 스테이킹 페이지를 이용하세요.",
      "hashdash.v2.node.sub": "스테이킹으로 켜짐",
      "hashdash.v2.card.k": "내 Hash Node",
      "hashdash.v2.card.connect": "지갑을 연결하면 내 노드를 볼 수 있습니다.",
      "hashdash.v2.card.connectSub": "스테이킹에 쓴 지갑을 사용하세요. 연결해도 자금은 움직이지 않습니다.",
      "hashdash.v2.card.reading": "스테이킹을 읽는 중…",
      "hashdash.v2.card.on": "노드 켜짐",
      "hashdash.v2.card.off": "노드 꺼짐",
      "hashdash.v2.card.onSub": "스테이킹 덕분에 노드가 켜져 있습니다. Airdrop Genesis에 참여 중입니다.",
      "hashdash.v2.card.offSub": "100 SECT를 스테이킹하면 노드가 켜집니다.",
      "hashdash.v2.card.staked": "스테이킹 중인 SECT",
      "hashdash.v2.card.level": "레벨",
      "hashdash.v2.card.since": "켜진 날짜",
      "hashdash.v2.card.prize": "에어드롭 보상",
      "hashdash.v2.card.earned": "지금까지 획득",
      "hashdash.v2.card.wallet": "지갑",
      "hashdash.v2.card.stake": "스테이킹으로 이동",
      "hashdash.v2.card.err": "네트워크를 읽지 못했습니다. 잠시 후 다시 시도하세요.",
      "hashdash.v2.card.retry": "다시 시도",
      "hashdash.v2.wsel.foot": "Sectora는 시드 문구를 절대 요구하지 않습니다 · Ethereum"
    },
    ar: {
      "hashdash.v2.how.sub": "الشبكة التجريبية · 3 خطوات سهلة",
      "hashdash.v2.how.lead": "أصبح Hash Node الخاص بك يعمل الآن بالتخزين (الستاكينغ). <b>بلا Sepolia، بلا صنبور، بلا شراء هاش وبلا غاز.</b>",
      "hashdash.v2.s1.t": "خزّن #SECT",
      "hashdash.v2.s1.p": "ضع <b>100 SECT</b> على الأقل في التخزين. تخزينك هو ما يشغّل عقدتك.",
      "hashdash.v2.s1.go": "الذهاب إلى التخزين",
      "hashdash.v2.s2.t": "اربط محفظتك",
      "hashdash.v2.s2.p": "استخدم <b>المحفظة نفسها التي خزّنت بها</b>، على شبكة إيثريوم العادية. بلا تغيير للشبكة وبلا دفع.",
      "hashdash.v2.s3.t": "عقدتك تعمل",
      "hashdash.v2.s3.p": "تقرأ لوحة التحكم تخزينك وتُظهر أن Hash Node يعمل. هذا كل شيء: أنت في Airdrop Genesis.",
      "hashdash.v2.s3.go": "عرض عقدتي",
      "hashdash.v2.f1.t": "لا شيء للدفع",
      "hashdash.v2.f1.p": "الربط يقرأ عنوانك العام فقط. لوحة التحكم لا تنقل الأموال أبدًا.",
      "hashdash.v2.f2.t": "العقد المسجّلة مسبقًا",
      "hashdash.v2.f2.p": "العقد المسجّلة سابقًا تحتفظ بتاريخها وأيامها. لا يتغيّر لها شيء.",
      "hashdash.v2.f3.t": "تخزينك يبقى كما هو",
      "hashdash.v2.f3.p": "لوحة التحكم تقرأ تخزينك فقط. لإضافة SECT أو سحبها، استخدم صفحة التخزين.",
      "hashdash.v2.node.sub": "تعمل بتخزينك",
      "hashdash.v2.card.k": "Hash Node الخاص بك",
      "hashdash.v2.card.connect": "اربط محفظتك لرؤية عقدتك.",
      "hashdash.v2.card.connectSub": "استخدم المحفظة نفسها التي خزّنت بها. الربط لا ينقل الأموال.",
      "hashdash.v2.card.reading": "جارٍ قراءة تخزينك…",
      "hashdash.v2.card.on": "العقدة تعمل",
      "hashdash.v2.card.off": "العقدة متوقفة",
      "hashdash.v2.card.onSub": "عقدتك تعمل بفضل تخزينك. أنت في Airdrop Genesis.",
      "hashdash.v2.card.offSub": "تعمل عقدتك عند تخزين 100 SECT.",
      "hashdash.v2.card.staked": "SECT في التخزين",
      "hashdash.v2.card.level": "المستوى",
      "hashdash.v2.card.since": "تعمل منذ",
      "hashdash.v2.card.prize": "جائزتك من الإيردروب",
      "hashdash.v2.card.earned": "ما رُبح حتى الآن",
      "hashdash.v2.card.wallet": "المحفظة",
      "hashdash.v2.card.stake": "الذهاب إلى التخزين",
      "hashdash.v2.card.err": "تعذّرت قراءة الشبكة. حاول مجددًا بعد قليل.",
      "hashdash.v2.card.retry": "إعادة المحاولة",
      "hashdash.v2.wsel.foot": "لا تطلب Sectora عبارة الاسترداد أبدًا · Ethereum"
    },
    hi: {
      "hashdash.v2.how.sub": "टेस्टनेट · 3 आसान कदम",
      "hashdash.v2.how.lead": "अब आपका Hash Node आपकी स्टेकिंग से चालू होता है। <b>न Sepolia, न फ़ॉसेट, न हैश ख़रीदना और न गैस।</b>",
      "hashdash.v2.s1.t": "#SECT स्टेक करें",
      "hashdash.v2.s1.p": "कम से कम <b>100 SECT</b> स्टेकिंग में रखें। आपकी स्टेकिंग ही आपका नोड चालू करती है।",
      "hashdash.v2.s1.go": "स्टेकिंग पर जाएँ",
      "hashdash.v2.s2.t": "वॉलेट कनेक्ट करें",
      "hashdash.v2.s2.p": "<b>स्टेकिंग वाला वही वॉलेट</b> सामान्य Ethereum नेटवर्क पर इस्तेमाल करें। न नेटवर्क बदलना, न कोई भुगतान।",
      "hashdash.v2.s3.t": "आपका नोड चालू है",
      "hashdash.v2.s3.p": "डैशबोर्ड आपकी स्टेकिंग पढ़कर आपका Hash Node चालू दिखाता है। बस: आप Airdrop Genesis में हैं।",
      "hashdash.v2.s3.go": "मेरा नोड देखें",
      "hashdash.v2.f1.t": "कुछ भी भुगतान नहीं",
      "hashdash.v2.f1.p": "कनेक्ट करने पर सिर्फ़ आपका सार्वजनिक पता पढ़ा जाता है। डैशबोर्ड कभी फ़ंड नहीं हिलाता।",
      "hashdash.v2.f2.t": "पहले से रजिस्टर्ड नोड",
      "hashdash.v2.f2.p": "पहले रजिस्टर हुए नोड अपनी तारीख़ और दिन बनाए रखते हैं। उनके लिए कुछ नहीं बदलता।",
      "hashdash.v2.f3.t": "आपकी स्टेकिंग वैसी ही रहती है",
      "hashdash.v2.f3.p": "डैशबोर्ड सिर्फ़ आपकी स्टेकिंग पढ़ता है। SECT जोड़ने या निकालने के लिए स्टेकिंग पेज का उपयोग करें।",
      "hashdash.v2.node.sub": "आपकी स्टेकिंग से चालू",
      "hashdash.v2.card.k": "आपका Hash Node",
      "hashdash.v2.card.connect": "अपना नोड देखने के लिए वॉलेट कनेक्ट करें।",
      "hashdash.v2.card.connectSub": "स्टेकिंग वाला वही वॉलेट इस्तेमाल करें। कनेक्ट करने से फ़ंड नहीं हिलते।",
      "hashdash.v2.card.reading": "आपकी स्टेकिंग पढ़ी जा रही है…",
      "hashdash.v2.card.on": "नोड चालू",
      "hashdash.v2.card.off": "नोड बंद",
      "hashdash.v2.card.onSub": "आपकी स्टेकिंग की वजह से आपका नोड चालू है। आप Airdrop Genesis में हैं।",
      "hashdash.v2.card.offSub": "100 SECT स्टेकिंग में रखने पर आपका नोड चालू होता है।",
      "hashdash.v2.card.staked": "स्टेकिंग में SECT",
      "hashdash.v2.card.level": "स्तर",
      "hashdash.v2.card.since": "कब से चालू",
      "hashdash.v2.card.prize": "आपका एयरड्रॉप इनाम",
      "hashdash.v2.card.earned": "अब तक कमाया",
      "hashdash.v2.card.wallet": "वॉलेट",
      "hashdash.v2.card.stake": "स्टेकिंग पर जाएँ",
      "hashdash.v2.card.err": "नेटवर्क नहीं पढ़ा जा सका। थोड़ी देर में फिर कोशिश करें।",
      "hashdash.v2.card.retry": "फिर कोशिश करें",
      "hashdash.v2.wsel.foot": "Sectora कभी आपका सीड फ़्रेज़ नहीं माँगता · Ethereum"
    }
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; Object.keys(V[l]).forEach(function (k) { d[k] = V[l][k]; }); });
})();
/* Hash Market: plan de 50 TH/s con el staking y paquetes que se activan al conectar */
(function () {
  var V = {
    en: { "hashdash.v2.plan.p": "The Node Kit gives exactly 50 TH/s, the minimum for your Hash Node. It comes with your staking: connect your wallet and it turns on by itself.",
      "hashdash.v2.plan.s0": "Stake at least 100 SECT", "hashdash.v2.plan.s1": "Connect your wallet (the same one you stake with)", "hashdash.v2.plan.s2": "Your 50 TH/s plan turns on by itself", "hashdash.v2.plan.s3": "Your Hash Node is on: you're in the airdrop",
      "hashdash.v2.plan.pr": "Included with your staking", "hashdash.v2.plan.st0": "Connect your wallet to activate the plan.", "hashdash.v2.plan.stOk": "Plan active · your node is on.", "hashdash.v2.plan.stNeed": "You need 100 SECT in staking to activate the plan.",
      "hashdash.v2.pk.free": "Free on testnet", "hashdash.v2.buy.connect": "Connect wallet to activate", "hashdash.v2.buy.act": "Activate {h} TH/s", "hashdash.v2.buy.on": "Active", "hashdash.v2.buy.kitOn": "Included with your staking ✓", "hashdash.v2.buy.kitNeed": "Needs 100 SECT in staking", "hashdash.v2.buy.toast": "{h} TH/s activated",
      "hashdash.v2.buy.note": "50 TH/s is the minimum for your Hash Node, and your staking gives it to you. Extra packages add up.",
      "hashdash.v2.market.note": "Free on testnet: connect your wallet and activate any package. For the airdrop, only the 50 TH/s plan with your staking counts." },
    es: { "hashdash.v2.plan.p": "El Node Kit da exactamente 50 TH/s, el mínimo para tu Hash Node. Va incluido con tu staking: conecta tu wallet y se activa solo.",
      "hashdash.v2.plan.s0": "Haz staking de al menos 100 SECT", "hashdash.v2.plan.s1": "Conecta tu wallet (la misma del staking)", "hashdash.v2.plan.s2": "Tu plan de 50 TH/s se activa solo", "hashdash.v2.plan.s3": "Tu Hash Node queda encendido: ya estás en el airdrop",
      "hashdash.v2.plan.pr": "Incluido con tu staking", "hashdash.v2.plan.st0": "Conecta tu wallet para activar el plan.", "hashdash.v2.plan.stOk": "Plan activo · tu nodo está encendido.", "hashdash.v2.plan.stNeed": "Necesitas 100 SECT en staking para activar el plan.",
      "hashdash.v2.pk.free": "Gratis en testnet", "hashdash.v2.buy.connect": "Conecta tu wallet para activar", "hashdash.v2.buy.act": "Activar {h} TH/s", "hashdash.v2.buy.on": "Activo", "hashdash.v2.buy.kitOn": "Incluido con tu staking ✓", "hashdash.v2.buy.kitNeed": "Necesita 100 SECT en staking", "hashdash.v2.buy.toast": "{h} TH/s activados",
      "hashdash.v2.buy.note": "50 TH/s es el mínimo para tu Hash Node y te lo da tu staking. Los paquetes extra se suman.",
      "hashdash.v2.market.note": "Gratis en testnet: conecta tu wallet y activa el paquete que quieras. Para el airdrop solo cuenta el plan de 50 TH/s con tu staking." },
    pt: { "hashdash.v2.plan.p": "O Node Kit dá exatamente 50 TH/s, o mínimo para o seu Hash Node. Vem incluído com o seu staking: conecte sua carteira e ele se ativa sozinho.",
      "hashdash.v2.plan.s0": "Faça staking de pelo menos 100 SECT", "hashdash.v2.plan.s1": "Conecte sua carteira (a mesma do staking)", "hashdash.v2.plan.s2": "Seu plano de 50 TH/s se ativa sozinho", "hashdash.v2.plan.s3": "Seu Hash Node fica ligado: você já está no airdrop",
      "hashdash.v2.plan.pr": "Incluído com o seu staking", "hashdash.v2.plan.st0": "Conecte sua carteira para ativar o plano.", "hashdash.v2.plan.stOk": "Plano ativo · seu nó está ligado.", "hashdash.v2.plan.stNeed": "Você precisa de 100 SECT em staking para ativar o plano.",
      "hashdash.v2.pk.free": "Grátis na testnet", "hashdash.v2.buy.connect": "Conecte a carteira para ativar", "hashdash.v2.buy.act": "Ativar {h} TH/s", "hashdash.v2.buy.on": "Ativo", "hashdash.v2.buy.kitOn": "Incluído com o seu staking ✓", "hashdash.v2.buy.kitNeed": "Precisa de 100 SECT em staking", "hashdash.v2.buy.toast": "{h} TH/s ativados",
      "hashdash.v2.buy.note": "50 TH/s é o mínimo para o seu Hash Node, e o seu staking dá isso a você. Pacotes extras se somam.",
      "hashdash.v2.market.note": "Grátis na testnet: conecte sua carteira e ative o pacote que quiser. Para o airdrop só conta o plano de 50 TH/s com o seu staking." },
    fr: { "hashdash.v2.plan.p": "Le Node Kit donne exactement 50 TH/s, le minimum pour votre Hash Node. Il est inclus avec votre staking : connectez votre wallet et il s’active tout seul.",
      "hashdash.v2.plan.s0": "Stakez au moins 100 SECT", "hashdash.v2.plan.s1": "Connectez votre wallet (le même que pour le staking)", "hashdash.v2.plan.s2": "Votre plan de 50 TH/s s’active tout seul", "hashdash.v2.plan.s3": "Votre Hash Node est allumé : vous participez à l’airdrop",
      "hashdash.v2.plan.pr": "Inclus avec votre staking", "hashdash.v2.plan.st0": "Connectez votre wallet pour activer le plan.", "hashdash.v2.plan.stOk": "Plan actif · votre nœud est allumé.", "hashdash.v2.plan.stNeed": "Il vous faut 100 SECT en staking pour activer le plan.",
      "hashdash.v2.pk.free": "Gratuit sur le testnet", "hashdash.v2.buy.connect": "Connectez le wallet pour activer", "hashdash.v2.buy.act": "Activer {h} TH/s", "hashdash.v2.buy.on": "Actif", "hashdash.v2.buy.kitOn": "Inclus avec votre staking ✓", "hashdash.v2.buy.kitNeed": "Nécessite 100 SECT en staking", "hashdash.v2.buy.toast": "{h} TH/s activés",
      "hashdash.v2.buy.note": "50 TH/s est le minimum pour votre Hash Node, et votre staking vous le donne. Les paquets en plus s’additionnent.",
      "hashdash.v2.market.note": "Gratuit sur le testnet : connectez votre wallet et activez le paquet de votre choix. Pour l’airdrop, seul compte le plan de 50 TH/s avec votre staking." },
    de: { "hashdash.v2.plan.p": "Das Node Kit liefert genau 50 TH/s, das Minimum für deinen Hash Node. Es ist bei deinem Staking dabei: Verbinde deine Wallet und es schaltet sich selbst ein.",
      "hashdash.v2.plan.s0": "Stake mindestens 100 SECT", "hashdash.v2.plan.s1": "Verbinde deine Wallet (dieselbe wie beim Staking)", "hashdash.v2.plan.s2": "Dein 50-TH/s-Plan schaltet sich selbst ein", "hashdash.v2.plan.s3": "Dein Hash Node ist an: Du bist beim Airdrop dabei",
      "hashdash.v2.plan.pr": "In deinem Staking enthalten", "hashdash.v2.plan.st0": "Verbinde deine Wallet, um den Plan zu aktivieren.", "hashdash.v2.plan.stOk": "Plan aktiv · dein Node ist an.", "hashdash.v2.plan.stNeed": "Du brauchst 100 SECT im Staking, um den Plan zu aktivieren.",
      "hashdash.v2.pk.free": "Kostenlos im Testnet", "hashdash.v2.buy.connect": "Wallet verbinden zum Aktivieren", "hashdash.v2.buy.act": "{h} TH/s aktivieren", "hashdash.v2.buy.on": "Aktiv", "hashdash.v2.buy.kitOn": "In deinem Staking enthalten ✓", "hashdash.v2.buy.kitNeed": "Braucht 100 SECT im Staking", "hashdash.v2.buy.toast": "{h} TH/s aktiviert",
      "hashdash.v2.buy.note": "50 TH/s sind das Minimum für deinen Hash Node, und dein Staking gibt sie dir. Zusätzliche Pakete addieren sich.",
      "hashdash.v2.market.note": "Kostenlos im Testnet: Verbinde deine Wallet und aktiviere ein beliebiges Paket. Für den Airdrop zählt nur der 50-TH/s-Plan mit deinem Staking." },
    ru: { "hashdash.v2.plan.p": "Node Kit даёт ровно 50 TH/s — минимум для вашего Hash Node. Он входит в ваш стейкинг: подключите кошелёк, и он включится сам.",
      "hashdash.v2.plan.s0": "Застейкайте не менее 100 SECT", "hashdash.v2.plan.s1": "Подключите кошелёк (тот же, что для стейкинга)", "hashdash.v2.plan.s2": "Ваш план 50 TH/s включается сам", "hashdash.v2.plan.s3": "Ваш Hash Node включён: вы участвуете в эйрдропе",
      "hashdash.v2.plan.pr": "Входит в ваш стейкинг", "hashdash.v2.plan.st0": "Подключите кошелёк, чтобы активировать план.", "hashdash.v2.plan.stOk": "План активен · ваш узел включён.", "hashdash.v2.plan.stNeed": "Для активации плана нужно 100 SECT в стейкинге.",
      "hashdash.v2.pk.free": "Бесплатно в тестнете", "hashdash.v2.buy.connect": "Подключите кошелёк для активации", "hashdash.v2.buy.act": "Активировать {h} TH/s", "hashdash.v2.buy.on": "Активен", "hashdash.v2.buy.kitOn": "Входит в ваш стейкинг ✓", "hashdash.v2.buy.kitNeed": "Нужно 100 SECT в стейкинге", "hashdash.v2.buy.toast": "{h} TH/s активировано",
      "hashdash.v2.buy.note": "50 TH/s — минимум для вашего Hash Node, и его даёт ваш стейкинг. Дополнительные пакеты суммируются.",
      "hashdash.v2.market.note": "Бесплатно в тестнете: подключите кошелёк и активируйте любой пакет. Для эйрдропа учитывается только план 50 TH/s с вашим стейкингом." },
    zh: { "hashdash.v2.plan.p": "Node Kit 正好提供 50 TH/s，这是 Hash Node 的最低要求。它随质押附带：连接钱包即可自动开启。",
      "hashdash.v2.plan.s0": "质押至少 100 SECT", "hashdash.v2.plan.s1": "连接钱包（与质押相同的钱包）", "hashdash.v2.plan.s2": "你的 50 TH/s 计划会自动开启", "hashdash.v2.plan.s3": "你的 Hash Node 已开启：你已加入空投",
      "hashdash.v2.plan.pr": "随质押附带", "hashdash.v2.plan.st0": "连接钱包以开启计划。", "hashdash.v2.plan.stOk": "计划已开启 · 你的节点已开启。", "hashdash.v2.plan.stNeed": "需要质押 100 SECT 才能开启计划。",
      "hashdash.v2.pk.free": "测试网免费", "hashdash.v2.buy.connect": "连接钱包以开启", "hashdash.v2.buy.act": "开启 {h} TH/s", "hashdash.v2.buy.on": "已开启", "hashdash.v2.buy.kitOn": "随质押附带 ✓", "hashdash.v2.buy.kitNeed": "需要质押 100 SECT", "hashdash.v2.buy.toast": "已开启 {h} TH/s",
      "hashdash.v2.buy.note": "50 TH/s 是 Hash Node 的最低要求，由你的质押提供。额外的套餐会累加。",
      "hashdash.v2.market.note": "测试网免费：连接钱包即可开启任意套餐。空投只计算随质押附带的 50 TH/s 计划。" },
    ja: { "hashdash.v2.plan.p": "Node Kit はちょうど 50 TH/s で、Hash Node の最低条件です。ステーキングに含まれており、ウォレットを接続すると自動でオンになります。",
      "hashdash.v2.plan.s0": "100 SECT 以上をステーキング", "hashdash.v2.plan.s1": "ウォレットを接続（ステーキングと同じもの）", "hashdash.v2.plan.s2": "50 TH/s プランが自動でオンに", "hashdash.v2.plan.s3": "Hash Node がオン：エアドロップに参加中",
      "hashdash.v2.plan.pr": "ステーキングに含まれます", "hashdash.v2.plan.st0": "ウォレットを接続してプランを有効にしてください。", "hashdash.v2.plan.stOk": "プラン有効 · ノードはオンです。", "hashdash.v2.plan.stNeed": "プランを有効にするには 100 SECT のステーキングが必要です。",
      "hashdash.v2.pk.free": "テストネットでは無料", "hashdash.v2.buy.connect": "ウォレットを接続して有効化", "hashdash.v2.buy.act": "{h} TH/s を有効化", "hashdash.v2.buy.on": "有効", "hashdash.v2.buy.kitOn": "ステーキングに含まれます ✓", "hashdash.v2.buy.kitNeed": "100 SECT のステーキングが必要", "hashdash.v2.buy.toast": "{h} TH/s を有効化しました",
      "hashdash.v2.buy.note": "50 TH/s は Hash Node の最低条件で、ステーキングで得られます。追加パッケージは加算されます。",
      "hashdash.v2.market.note": "テストネットでは無料：ウォレットを接続して好きなパッケージを有効化できます。エアドロップで数えるのは、ステーキングに含まれる 50 TH/s プランだけです。" },
    ko: { "hashdash.v2.plan.p": "Node Kit는 정확히 50 TH/s로, Hash Node의 최소 조건입니다. 스테이킹에 포함되어 있어 지갑을 연결하면 자동으로 켜집니다.",
      "hashdash.v2.plan.s0": "최소 100 SECT 스테이킹", "hashdash.v2.plan.s1": "지갑 연결 (스테이킹에 쓴 지갑)", "hashdash.v2.plan.s2": "50 TH/s 플랜이 자동으로 켜짐", "hashdash.v2.plan.s3": "Hash Node 켜짐: 에어드롭 참여 완료",
      "hashdash.v2.plan.pr": "스테이킹에 포함", "hashdash.v2.plan.st0": "지갑을 연결해 플랜을 활성화하세요.", "hashdash.v2.plan.stOk": "플랜 활성 · 노드가 켜져 있습니다.", "hashdash.v2.plan.stNeed": "플랜을 활성화하려면 100 SECT 스테이킹이 필요합니다.",
      "hashdash.v2.pk.free": "테스트넷 무료", "hashdash.v2.buy.connect": "지갑을 연결해 활성화", "hashdash.v2.buy.act": "{h} TH/s 활성화", "hashdash.v2.buy.on": "활성", "hashdash.v2.buy.kitOn": "스테이킹에 포함 ✓", "hashdash.v2.buy.kitNeed": "100 SECT 스테이킹 필요", "hashdash.v2.buy.toast": "{h} TH/s 활성화됨",
      "hashdash.v2.buy.note": "50 TH/s는 Hash Node의 최소 조건이며 스테이킹으로 받습니다. 추가 패키지는 합산됩니다.",
      "hashdash.v2.market.note": "테스트넷 무료: 지갑을 연결하고 원하는 패키지를 활성화하세요. 에어드롭에는 스테이킹에 포함된 50 TH/s 플랜만 반영됩니다." },
    ar: { "hashdash.v2.plan.p": "يمنح Node Kit تمامًا 50 TH/s، وهو الحد الأدنى لـ Hash Node. وهو مشمول مع تخزينك: اربط محفظتك فيعمل تلقائيًا.",
      "hashdash.v2.plan.s0": "خزّن 100 SECT على الأقل", "hashdash.v2.plan.s1": "اربط محفظتك (نفسها التي خزّنت بها)", "hashdash.v2.plan.s2": "تعمل خطة 50 TH/s تلقائيًا", "hashdash.v2.plan.s3": "Hash Node يعمل: أنت في الإيردروب",
      "hashdash.v2.plan.pr": "مشمول مع تخزينك", "hashdash.v2.plan.st0": "اربط محفظتك لتفعيل الخطة.", "hashdash.v2.plan.stOk": "الخطة مفعّلة · عقدتك تعمل.", "hashdash.v2.plan.stNeed": "تحتاج 100 SECT في التخزين لتفعيل الخطة.",
      "hashdash.v2.pk.free": "مجانًا على الشبكة التجريبية", "hashdash.v2.buy.connect": "اربط المحفظة للتفعيل", "hashdash.v2.buy.act": "تفعيل {h} TH/s", "hashdash.v2.buy.on": "مفعّل", "hashdash.v2.buy.kitOn": "مشمول مع تخزينك ✓", "hashdash.v2.buy.kitNeed": "يحتاج 100 SECT في التخزين", "hashdash.v2.buy.toast": "تم تفعيل {h} TH/s",
      "hashdash.v2.buy.note": "50 TH/s هو الحد الأدنى لـ Hash Node ويمنحك إياه تخزينك. الحزم الإضافية تُضاف.",
      "hashdash.v2.market.note": "مجانًا على الشبكة التجريبية: اربط محفظتك وفعّل أي حزمة. في الإيردروب تُحتسب فقط خطة 50 TH/s المشمولة مع تخزينك." },
    hi: { "hashdash.v2.plan.p": "Node Kit ठीक 50 TH/s देता है, जो आपके Hash Node के लिए न्यूनतम है। यह आपकी स्टेकिंग के साथ शामिल है: वॉलेट कनेक्ट करें और यह अपने-आप चालू हो जाता है।",
      "hashdash.v2.plan.s0": "कम से कम 100 SECT स्टेक करें", "hashdash.v2.plan.s1": "वॉलेट कनेक्ट करें (स्टेकिंग वाला वही)", "hashdash.v2.plan.s2": "आपका 50 TH/s प्लान अपने-आप चालू होता है", "hashdash.v2.plan.s3": "आपका Hash Node चालू: आप एयरड्रॉप में हैं",
      "hashdash.v2.plan.pr": "आपकी स्टेकिंग में शामिल", "hashdash.v2.plan.st0": "प्लान चालू करने के लिए वॉलेट कनेक्ट करें।", "hashdash.v2.plan.stOk": "प्लान चालू · आपका नोड चालू है।", "hashdash.v2.plan.stNeed": "प्लान चालू करने के लिए स्टेकिंग में 100 SECT चाहिए।",
      "hashdash.v2.pk.free": "टेस्टनेट पर मुफ़्त", "hashdash.v2.buy.connect": "चालू करने के लिए वॉलेट कनेक्ट करें", "hashdash.v2.buy.act": "{h} TH/s चालू करें", "hashdash.v2.buy.on": "चालू", "hashdash.v2.buy.kitOn": "आपकी स्टेकिंग में शामिल ✓", "hashdash.v2.buy.kitNeed": "स्टेकिंग में 100 SECT चाहिए", "hashdash.v2.buy.toast": "{h} TH/s चालू हुए",
      "hashdash.v2.buy.note": "50 TH/s आपके Hash Node के लिए न्यूनतम है, और यह आपकी स्टेकिंग से मिलता है। अतिरिक्त पैकेज जुड़ते जाते हैं।",
      "hashdash.v2.market.note": "टेस्टनेट पर मुफ़्त: वॉलेट कनेक्ट करें और कोई भी पैकेज चालू करें। एयरड्रॉप के लिए सिर्फ़ स्टेकिंग वाला 50 TH/s प्लान गिना जाता है।" }
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; Object.keys(V[l]).forEach(function (k) { d[k] = V[l][k]; }); });
})();
/* boton del plan: activar el nodo desde el mismo recuadro */
(function () {
  var V = {
    en: ["Activate my node", "Node active ✓"], es: ["Activar mi nodo", "Nodo activado ✓"], pt: ["Ativar meu nó", "Nó ativado ✓"],
    fr: ["Activer mon nœud", "Nœud activé ✓"], de: ["Meinen Node aktivieren", "Node aktiviert ✓"], ru: ["Активировать мой узел", "Узел активирован ✓"],
    zh: ["激活我的节点", "节点已激活 ✓"], ja: ["ノードを有効にする", "ノード有効 ✓"], ko: ["내 노드 활성화", "노드 활성화됨 ✓"],
    ar: ["تفعيل عقدتي", "تم تفعيل العقدة ✓"], hi: ["मेरा नोड चालू करें", "नोड चालू ✓"]
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; d["hashdash.v2.plan.btn"] = V[l][0]; d["hashdash.v2.plan.btnOn"] = V[l][1]; });
})();
/* ubicacion y nombre del nodo dentro del recuadro del plan (sustituye los textos del registro en Sepolia) */
(function () {
  var V = {
    en: ["Our systems detect your node's location automatically, so no coordinates are needed. Just press “Activate my node” and connect your wallet: your node turns on with your staking.", "Only an approximate location (city level) is used, never your address.", "Your node is already registered on the network map.", "Node “{n}” activated"],
    es: ["Nuestros sistemas detectan la ubicación de tu nodo automáticamente, no necesitas coordenadas. Solo pulsa «Activar mi nodo» y conecta tu wallet: tu nodo se enciende con tu staking.", "Solo se usa una ubicación aproximada (a nivel de ciudad), nunca tu dirección.", "Tu nodo ya está registrado en el mapa de la red.", "Nodo «{n}» activado"],
    pt: ["Nossos sistemas detectam a localização do seu nó automaticamente, sem coordenadas. Basta tocar em “Ativar meu nó” e conectar sua carteira: seu nó liga com o seu staking.", "Só é usada uma localização aproximada (nível de cidade), nunca o seu endereço.", "Seu nó já está registrado no mapa da rede.", "Nó “{n}” ativado"],
    fr: ["Nos systèmes détectent automatiquement l’emplacement de votre nœud, aucune coordonnée à saisir. Appuyez simplement sur « Activer mon nœud » et connectez votre wallet : votre nœud s’allume avec votre staking.", "Seul un emplacement approximatif (à l’échelle de la ville) est utilisé, jamais votre adresse.", "Votre nœud est déjà enregistré sur la carte du réseau.", "Nœud « {n} » activé"],
    de: ["Unsere Systeme erkennen den Standort deines Nodes automatisch, du brauchst keine Koordinaten. Tippe einfach auf „Meinen Node aktivieren“ und verbinde deine Wallet: Dein Node geht mit deinem Staking an.", "Es wird nur ein ungefährer Standort (Stadtebene) verwendet, nie deine Adresse.", "Dein Node ist bereits auf der Netzwerkkarte registriert.", "Node „{n}“ aktiviert"],
    ru: ["Наши системы определяют местоположение узла автоматически, координаты не нужны. Просто нажмите «Активировать мой узел» и подключите кошелёк: узел включится вашим стейкингом.", "Используется только примерное местоположение (на уровне города), никогда ваш адрес.", "Ваш узел уже зарегистрирован на карте сети.", "Узел «{n}» активирован"],
    zh: ["我们的系统会自动检测你的节点位置，无需填写坐标。只需点击「激活我的节点」并连接钱包：你的节点会随质押开启。", "只使用大致位置（城市级别），绝不使用你的地址。", "你的节点已在网络地图上注册。", "节点「{n}」已激活"],
    ja: ["ノードの位置は自動で検出されるため、座標の入力は不要です。「ノードを有効にする」を押してウォレットを接続するだけで、ステーキングによりノードがオンになります。", "使うのはおおよその位置（市区町村レベル）だけで、住所は使いません。", "あなたのノードはすでにネットワークマップに登録されています。", "ノード「{n}」を有効にしました"],
    ko: ["노드 위치는 자동으로 감지되므로 좌표가 필요 없습니다. ‘내 노드 활성화’를 누르고 지갑을 연결하세요. 스테이킹으로 노드가 켜집니다.", "대략적인 위치(도시 수준)만 사용하며 주소는 절대 사용하지 않습니다.", "내 노드는 이미 네트워크 지도에 등록되어 있습니다.", "노드 ‘{n}’ 활성화됨"],
    ar: ["تكتشف أنظمتنا موقع عقدتك تلقائيًا، فلا حاجة للإحداثيات. ما عليك سوى الضغط على «تفعيل عقدتي» وربط محفظتك: تعمل عقدتك بتخزينك.", "يُستخدم موقع تقريبي فقط (على مستوى المدينة)، وليس عنوانك أبدًا.", "عقدتك مسجّلة بالفعل على خريطة الشبكة.", "تم تفعيل العقدة «{n}»"],
    hi: ["हमारे सिस्टम आपके नोड की लोकेशन अपने-आप पहचान लेते हैं, निर्देशांक की ज़रूरत नहीं। बस “मेरा नोड चालू करें” दबाएँ और वॉलेट कनेक्ट करें: आपका नोड आपकी स्टेकिंग से चालू हो जाता है।", "सिर्फ़ अनुमानित लोकेशन (शहर स्तर) इस्तेमाल होती है, कभी आपका पता नहीं।", "आपका नोड पहले से नेटवर्क मैप पर रजिस्टर्ड है।", "नोड “{n}” चालू हुआ"]
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {};
    d["hashdash.node.geoAuto"] = V[l][0]; d["hashdash.node.geoNote"] = V[l][1]; d["hashdash.v2.reg.old"] = V[l][2]; d["hashdash.v2.reg.toast"] = V[l][3]; });
})();
/* la wallet ya tiene una peticion de conexion abierta (MetaMask -32002) */
(function () {
  var V = {
    en: "Your wallet already has a connection request open: open it and approve it.", es: "Tu wallet ya tiene una solicitud de conexión abierta: ábrela y apruébala.",
    pt: "Sua carteira já tem um pedido de conexão aberto: abra-a e aprove.", fr: "Votre wallet a déjà une demande de connexion en attente : ouvrez-le et approuvez-la.",
    de: "Deine Wallet hat bereits eine offene Verbindungsanfrage: Öffne sie und bestätige sie.", ru: "В кошельке уже есть открытый запрос на подключение: откройте его и подтвердите.",
    zh: "你的钱包已有一个待处理的连接请求：请打开钱包并批准。", ja: "ウォレットに接続リクエストが保留中です。ウォレットを開いて承認してください。",
    ko: "지갑에 이미 열린 연결 요청이 있습니다. 지갑을 열어 승인하세요.", ar: "لدى محفظتك طلب اتصال مفتوح بالفعل: افتحها ووافق عليه.",
    hi: "आपके वॉलेट में पहले से एक कनेक्शन अनुरोध खुला है: वॉलेट खोलें और उसे मंज़ूर करें।"
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { (X[l] = X[l] || {})["hashdash.v2.wallet.pending"] = V[l]; });
})();
/* nodo y staking por separado: el airdrop se activa con los dos, en cualquier orden */
(function () {
  var K = ["hashdash.v2.how2.lead", "hashdash.v2.how2.s1.t", "hashdash.v2.how2.s1.p", "hashdash.v2.how2.s2.t", "hashdash.v2.how2.s2.p", "hashdash.v2.how2.s3.t", "hashdash.v2.how2.s3.p",
    "hashdash.v2.plan2.p", "hashdash.v2.plan2.s0", "hashdash.v2.plan2.s1", "hashdash.v2.plan2.s2", "hashdash.v2.plan2.pr", "hashdash.v2.plan2.stBoth", "hashdash.v2.plan2.stNode",
    "hashdash.v2.card2.offSub", "hashdash.v2.card2.onSub", "hashdash.v2.card2.bothSub", "hashdash.v2.card2.airdrop", "hashdash.v2.card2.adOn", "hashdash.v2.card2.adBoth", "hashdash.v2.card2.adNode", "hashdash.v2.card2.adStake",
    "hashdash.v2.node2.sub", "hashdash.node.geoAuto"];
  var V = {
    en: ["Two separate steps, in any order: <b>activate your node</b> and <b>stake #SECT</b>. With both, your airdrop is active. No Sepolia, no faucet and no gas.",
      "Activate your node", "Connect your wallet and press <b>Activate my node</b>. It's free and doesn't need staking.",
      "Stake #SECT", "Put at least <b>100 SECT</b> in staking, before or after activating your node.",
      "Airdrop active", "With your node on and your staking, in any order, you're in Airdrop Genesis.",
      "The Node Kit gives exactly 50 TH/s, the minimum for your Hash Node. It's free: connect your wallet and activate it. Staking is a separate step: with both, your airdrop is active.",
      "Connect your wallet and activate your node (free)", "Stake at least 100 SECT", "In any order: with both done, your airdrop is active",
      "Free · just connect your wallet", "Node active · Airdrop active.", "Node active. To activate your airdrop, put 100 SECT in staking.",
      "Press “Activate my node” in the plan above. It's free.", "Your node is on. To activate your airdrop, put 100 SECT in staking.", "Your node is on and your airdrop is active.",
      "Airdrop", "Active ✓", "Needs your node and 100 SECT in staking", "Needs your node on", "Needs 100 SECT in staking",
      "Free · separate from staking",
      "Our systems detect your node's location automatically, so no coordinates are needed. Just press “Activate my node” and connect your wallet: your node turns on right away."],
    es: ["Dos pasos por separado, en el orden que quieras: <b>activa tu nodo</b> y <b>haz staking de #SECT</b>. Con los dos, tu airdrop queda activo. Sin Sepolia, sin faucet y sin gas.",
      "Activa tu nodo", "Conecta tu wallet y pulsa <b>Activar mi nodo</b>. Es gratis y no necesita staking.",
      "Haz staking de #SECT", "Pon al menos <b>100 SECT</b> en staking, antes o después de activar tu nodo.",
      "Airdrop activo", "Con tu nodo encendido y tu staking, en cualquier orden, ya estás en el Airdrop Genesis.",
      "El Node Kit da exactamente 50 TH/s, el mínimo para tu Hash Node. Es gratis: conecta tu wallet y actívalo. El staking es un paso aparte: con los dos, tu airdrop queda activo.",
      "Conecta tu wallet y activa tu nodo (gratis)", "Haz staking de al menos 100 SECT", "En cualquier orden: con las dos cosas hechas, tu airdrop queda activo",
      "Gratis · solo conecta tu wallet", "Nodo activado · Airdrop activo.", "Nodo activado. Para activar tu airdrop, pon 100 SECT en staking.",
      "Pulsa «Activar mi nodo» en el plan de arriba. Es gratis.", "Tu nodo está encendido. Para activar tu airdrop, pon 100 SECT en staking.", "Tu nodo está encendido y tu airdrop está activo.",
      "Airdrop", "Activo ✓", "Falta tu nodo y 100 SECT en staking", "Falta encender tu nodo", "Faltan 100 SECT en staking",
      "Gratis · aparte del staking",
      "Nuestros sistemas detectan la ubicación de tu nodo automáticamente, no necesitas coordenadas. Solo pulsa «Activar mi nodo» y conecta tu wallet: tu nodo se enciende al momento."],
    pt: ["Dois passos separados, na ordem que quiser: <b>ative seu nó</b> e <b>faça staking de #SECT</b>. Com os dois, seu airdrop fica ativo. Sem Sepolia, sem faucet e sem gas.",
      "Ative seu nó", "Conecte sua carteira e toque em <b>Ativar meu nó</b>. É grátis e não precisa de staking.",
      "Faça staking de #SECT", "Coloque pelo menos <b>100 SECT</b> em staking, antes ou depois de ativar seu nó.",
      "Airdrop ativo", "Com seu nó ligado e seu staking, em qualquer ordem, você já está no Airdrop Genesis.",
      "O Node Kit dá exatamente 50 TH/s, o mínimo para o seu Hash Node. É grátis: conecte sua carteira e ative. O staking é um passo à parte: com os dois, seu airdrop fica ativo.",
      "Conecte sua carteira e ative seu nó (grátis)", "Faça staking de pelo menos 100 SECT", "Em qualquer ordem: com as duas coisas feitas, seu airdrop fica ativo",
      "Grátis · só conecte sua carteira", "Nó ativado · Airdrop ativo.", "Nó ativado. Para ativar seu airdrop, coloque 100 SECT em staking.",
      "Toque em “Ativar meu nó” no plano acima. É grátis.", "Seu nó está ligado. Para ativar seu airdrop, coloque 100 SECT em staking.", "Seu nó está ligado e seu airdrop está ativo.",
      "Airdrop", "Ativo ✓", "Falta seu nó e 100 SECT em staking", "Falta ligar seu nó", "Faltam 100 SECT em staking",
      "Grátis · separado do staking",
      "Nossos sistemas detectam a localização do seu nó automaticamente, sem coordenadas. Basta tocar em “Ativar meu nó” e conectar sua carteira: seu nó liga na hora."],
    fr: ["Deux étapes séparées, dans l’ordre de votre choix : <b>activez votre nœud</b> et <b>stakez des #SECT</b>. Avec les deux, votre airdrop est actif. Sans Sepolia, sans faucet et sans gas.",
      "Activez votre nœud", "Connectez votre wallet et appuyez sur <b>Activer mon nœud</b>. C’est gratuit et sans staking.",
      "Stakez des #SECT", "Mettez au moins <b>100 SECT</b> en staking, avant ou après avoir activé votre nœud.",
      "Airdrop actif", "Avec votre nœud allumé et votre staking, dans n’importe quel ordre, vous participez à l’Airdrop Genesis.",
      "Le Node Kit donne exactement 50 TH/s, le minimum pour votre Hash Node. C’est gratuit : connectez votre wallet et activez-le. Le staking est une étape à part : avec les deux, votre airdrop est actif.",
      "Connectez votre wallet et activez votre nœud (gratuit)", "Stakez au moins 100 SECT", "Dans n’importe quel ordre : avec les deux, votre airdrop est actif",
      "Gratuit · connectez simplement votre wallet", "Nœud activé · Airdrop actif.", "Nœud activé. Pour activer votre airdrop, mettez 100 SECT en staking.",
      "Appuyez sur « Activer mon nœud » dans le plan ci-dessus. C’est gratuit.", "Votre nœud est allumé. Pour activer votre airdrop, mettez 100 SECT en staking.", "Votre nœud est allumé et votre airdrop est actif.",
      "Airdrop", "Actif ✓", "Il manque votre nœud et 100 SECT en staking", "Il manque votre nœud allumé", "Il manque 100 SECT en staking",
      "Gratuit · séparé du staking",
      "Nos systèmes détectent automatiquement l’emplacement de votre nœud, aucune coordonnée à saisir. Appuyez simplement sur « Activer mon nœud » et connectez votre wallet : votre nœud s’allume aussitôt."],
    de: ["Zwei getrennte Schritte, in beliebiger Reihenfolge: <b>Node aktivieren</b> und <b>#SECT staken</b>. Mit beiden ist dein Airdrop aktiv. Kein Sepolia, kein Faucet und kein Gas.",
      "Aktiviere deinen Node", "Verbinde deine Wallet und tippe auf <b>Meinen Node aktivieren</b>. Kostenlos und ohne Staking.",
      "#SECT staken", "Lege mindestens <b>100 SECT</b> ins Staking, vor oder nach dem Aktivieren deines Nodes.",
      "Airdrop aktiv", "Mit eingeschaltetem Node und deinem Staking, in beliebiger Reihenfolge, bist du beim Airdrop Genesis dabei.",
      "Das Node Kit liefert genau 50 TH/s, das Minimum für deinen Hash Node. Es ist kostenlos: Verbinde deine Wallet und aktiviere ihn. Das Staking ist ein eigener Schritt: Mit beiden ist dein Airdrop aktiv.",
      "Wallet verbinden und Node aktivieren (kostenlos)", "Mindestens 100 SECT staken", "In beliebiger Reihenfolge: Mit beidem ist dein Airdrop aktiv",
      "Kostenlos · nur Wallet verbinden", "Node aktiv · Airdrop aktiv.", "Node aktiv. Um deinen Airdrop zu aktivieren, lege 100 SECT ins Staking.",
      "Tippe oben im Plan auf „Meinen Node aktivieren“. Kostenlos.", "Dein Node ist an. Um deinen Airdrop zu aktivieren, lege 100 SECT ins Staking.", "Dein Node ist an und dein Airdrop ist aktiv.",
      "Airdrop", "Aktiv ✓", "Es fehlen dein Node und 100 SECT im Staking", "Dein Node muss an sein", "Es fehlen 100 SECT im Staking",
      "Kostenlos · getrennt vom Staking",
      "Unsere Systeme erkennen den Standort deines Nodes automatisch, du brauchst keine Koordinaten. Tippe einfach auf „Meinen Node aktivieren“ und verbinde deine Wallet: Dein Node geht sofort an."],
    ru: ["Два отдельных шага в любом порядке: <b>активируйте узел</b> и <b>застейкайте #SECT</b>. С обоими ваш эйрдроп активен. Без Sepolia, без крана и без газа.",
      "Активируйте узел", "Подключите кошелёк и нажмите <b>Активировать мой узел</b>. Бесплатно и без стейкинга.",
      "Застейкайте #SECT", "Положите в стейкинг не менее <b>100 SECT</b> — до или после активации узла.",
      "Эйрдроп активен", "С включённым узлом и стейкингом, в любом порядке, вы участвуете в Airdrop Genesis.",
      "Node Kit даёт ровно 50 TH/s — минимум для вашего Hash Node. Это бесплатно: подключите кошелёк и активируйте его. Стейкинг — отдельный шаг: с обоими ваш эйрдроп активен.",
      "Подключите кошелёк и активируйте узел (бесплатно)", "Застейкайте не менее 100 SECT", "В любом порядке: когда сделано и то и другое, эйрдроп активен",
      "Бесплатно · просто подключите кошелёк", "Узел активен · Эйрдроп активен.", "Узел активен. Чтобы активировать эйрдроп, положите 100 SECT в стейкинг.",
      "Нажмите «Активировать мой узел» в плане выше. Это бесплатно.", "Ваш узел включён. Чтобы активировать эйрдроп, положите 100 SECT в стейкинг.", "Ваш узел включён, и эйрдроп активен.",
      "Эйрдроп", "Активен ✓", "Нужны узел и 100 SECT в стейкинге", "Нужно включить узел", "Нужно 100 SECT в стейкинге",
      "Бесплатно · отдельно от стейкинга",
      "Наши системы определяют местоположение узла автоматически, координаты не нужны. Просто нажмите «Активировать мой узел» и подключите кошелёк: узел включится сразу."],
    zh: ["两个独立步骤，顺序不限：<b>激活你的节点</b>和<b>质押 #SECT</b>。两者都完成后，你的空投即生效。无需 Sepolia、水龙头或 gas。",
      "激活你的节点", "连接钱包并点击<b>激活我的节点</b>。免费，无需质押。",
      "质押 #SECT", "质押至少 <b>100 SECT</b>，在激活节点之前或之后都可以。",
      "空投已生效", "节点开启并完成质押（顺序不限），你就加入了 Airdrop Genesis。",
      "Node Kit 正好提供 50 TH/s，这是 Hash Node 的最低要求。它是免费的：连接钱包即可激活。质押是单独的一步：两者都完成，空投即生效。",
      "连接钱包并激活你的节点（免费）", "质押至少 100 SECT", "顺序不限：两件事都完成后，空投即生效",
      "免费 · 只需连接钱包", "节点已激活 · 空投已生效。", "节点已激活。质押 100 SECT 即可激活空投。",
      "在上方的计划中点击「激活我的节点」。免费。", "你的节点已开启。质押 100 SECT 即可激活空投。", "你的节点已开启，空投已生效。",
      "空投", "已生效 ✓", "需要开启节点并质押 100 SECT", "需要开启节点", "需要质押 100 SECT",
      "免费 · 与质押分开",
      "我们的系统会自动检测你的节点位置，无需填写坐标。只需点击「激活我的节点」并连接钱包：节点会立即开启。"],
    ja: ["2 つの別々のステップを好きな順番で：<b>ノードを有効にする</b>ことと <b>#SECT をステーキング</b>すること。両方そろうとエアドロップが有効になります。Sepolia、フォーセット、ガスは不要です。",
      "ノードを有効にする", "ウォレットを接続して<b>ノードを有効にする</b>を押します。無料で、ステーキングは不要です。",
      "#SECT をステーキング", "<b>100 SECT</b> 以上をステーキングします。ノードを有効にする前でも後でも構いません。",
      "エアドロップ有効", "ノードがオンでステーキングもあれば、順番に関係なく Airdrop Genesis に参加できます。",
      "Node Kit はちょうど 50 TH/s で、Hash Node の最低条件です。無料です：ウォレットを接続して有効にしてください。ステーキングは別のステップで、両方そろうとエアドロップが有効になります。",
      "ウォレットを接続してノードを有効にする（無料）", "100 SECT 以上をステーキング", "順番は自由：両方そろうとエアドロップが有効に",
      "無料 · ウォレットを接続するだけ", "ノード有効 · エアドロップ有効。", "ノード有効。エアドロップを有効にするには 100 SECT をステーキングしてください。",
      "上のプランで「ノードを有効にする」を押してください。無料です。", "ノードはオンです。エアドロップを有効にするには 100 SECT をステーキングしてください。", "ノードはオンで、エアドロップも有効です。",
      "エアドロップ", "有効 ✓", "ノードと 100 SECT のステーキングが必要", "ノードをオンにする必要があります", "100 SECT のステーキングが必要",
      "無料 · ステーキングとは別",
      "ノードの位置は自動で検出されるため、座標の入力は不要です。「ノードを有効にする」を押してウォレットを接続するだけで、ノードがすぐにオンになります。"],
    ko: ["순서와 상관없는 두 개의 별도 단계: <b>노드 활성화</b>와 <b>#SECT 스테이킹</b>. 둘 다 하면 에어드롭이 활성화됩니다. Sepolia, 포싯, 가스 모두 필요 없습니다.",
      "노드 활성화", "지갑을 연결하고 <b>내 노드 활성화</b>를 누르세요. 무료이며 스테이킹이 필요 없습니다.",
      "#SECT 스테이킹", "노드 활성화 전이든 후든 최소 <b>100 SECT</b>를 스테이킹하세요.",
      "에어드롭 활성", "노드가 켜져 있고 스테이킹도 했다면, 순서와 관계없이 Airdrop Genesis에 참여합니다.",
      "Node Kit는 정확히 50 TH/s로, Hash Node의 최소 조건입니다. 무료입니다: 지갑을 연결하고 활성화하세요. 스테이킹은 별도 단계이며, 둘 다 하면 에어드롭이 활성화됩니다.",
      "지갑을 연결하고 노드 활성화 (무료)", "최소 100 SECT 스테이킹", "순서는 자유: 둘 다 하면 에어드롭 활성",
      "무료 · 지갑만 연결", "노드 활성 · 에어드롭 활성.", "노드 활성. 에어드롭을 활성화하려면 100 SECT를 스테이킹하세요.",
      "위의 플랜에서 ‘내 노드 활성화’를 누르세요. 무료입니다.", "노드가 켜져 있습니다. 에어드롭을 활성화하려면 100 SECT를 스테이킹하세요.", "노드가 켜져 있고 에어드롭이 활성 상태입니다.",
      "에어드롭", "활성 ✓", "노드와 100 SECT 스테이킹이 필요합니다", "노드를 켜야 합니다", "100 SECT 스테이킹이 필요합니다",
      "무료 · 스테이킹과 별도",
      "노드 위치는 자동으로 감지되므로 좌표가 필요 없습니다. ‘내 노드 활성화’를 누르고 지갑을 연결하면 노드가 바로 켜집니다."],
    ar: ["خطوتان منفصلتان بأي ترتيب: <b>فعّل عقدتك</b> و<b>خزّن #SECT</b>. مع الاثنتين يصبح الإيردروب مفعّلًا. بلا Sepolia ولا صنبور ولا غاز.",
      "فعّل عقدتك", "اربط محفظتك واضغط <b>تفعيل عقدتي</b>. مجانًا ولا يحتاج إلى تخزين.",
      "خزّن #SECT", "ضع <b>100 SECT</b> على الأقل في التخزين، قبل تفعيل عقدتك أو بعده.",
      "الإيردروب مفعّل", "مع عقدة تعمل وتخزينك، بأي ترتيب، أنت في Airdrop Genesis.",
      "يمنح Node Kit تمامًا 50 TH/s، وهو الحد الأدنى لـ Hash Node. إنه مجاني: اربط محفظتك وفعّله. التخزين خطوة منفصلة: مع الاثنتين يصبح الإيردروب مفعّلًا.",
      "اربط محفظتك وفعّل عقدتك (مجانًا)", "خزّن 100 SECT على الأقل", "بأي ترتيب: عند إتمام الأمرين يصبح الإيردروب مفعّلًا",
      "مجانًا · فقط اربط محفظتك", "العقدة مفعّلة · الإيردروب مفعّل.", "العقدة مفعّلة. لتفعيل الإيردروب، ضع 100 SECT في التخزين.",
      "اضغط «تفعيل عقدتي» في الخطة أعلاه. مجانًا.", "عقدتك تعمل. لتفعيل الإيردروب، ضع 100 SECT في التخزين.", "عقدتك تعمل والإيردروب مفعّل.",
      "الإيردروب", "مفعّل ✓", "تحتاج إلى عقدتك و100 SECT في التخزين", "تحتاج إلى تشغيل عقدتك", "تحتاج إلى 100 SECT في التخزين",
      "مجانًا · منفصل عن التخزين",
      "تكتشف أنظمتنا موقع عقدتك تلقائيًا، فلا حاجة للإحداثيات. ما عليك سوى الضغط على «تفعيل عقدتي» وربط محفظتك: تعمل عقدتك فورًا."],
    hi: ["दो अलग कदम, किसी भी क्रम में: <b>अपना नोड चालू करें</b> और <b>#SECT स्टेक करें</b>। दोनों होने पर आपका एयरड्रॉप सक्रिय हो जाता है। न Sepolia, न फ़ॉसेट, न गैस।",
      "अपना नोड चालू करें", "वॉलेट कनेक्ट करें और <b>मेरा नोड चालू करें</b> दबाएँ। यह मुफ़्त है और स्टेकिंग की ज़रूरत नहीं।",
      "#SECT स्टेक करें", "नोड चालू करने से पहले या बाद में कम से कम <b>100 SECT</b> स्टेकिंग में रखें।",
      "एयरड्रॉप सक्रिय", "नोड चालू और स्टेकिंग, किसी भी क्रम में — आप Airdrop Genesis में हैं।",
      "Node Kit ठीक 50 TH/s देता है, जो आपके Hash Node के लिए न्यूनतम है। यह मुफ़्त है: वॉलेट कनेक्ट करें और इसे चालू करें। स्टेकिंग अलग कदम है: दोनों होने पर आपका एयरड्रॉप सक्रिय होता है।",
      "वॉलेट कनेक्ट करें और नोड चालू करें (मुफ़्त)", "कम से कम 100 SECT स्टेक करें", "किसी भी क्रम में: दोनों होने पर आपका एयरड्रॉप सक्रिय",
      "मुफ़्त · बस वॉलेट कनेक्ट करें", "नोड चालू · एयरड्रॉप सक्रिय।", "नोड चालू। एयरड्रॉप सक्रिय करने के लिए 100 SECT स्टेकिंग में रखें।",
      "ऊपर प्लान में “मेरा नोड चालू करें” दबाएँ। यह मुफ़्त है।", "आपका नोड चालू है। एयरड्रॉप सक्रिय करने के लिए 100 SECT स्टेकिंग में रखें।", "आपका नोड चालू है और आपका एयरड्रॉप सक्रिय है।",
      "एयरड्रॉप", "सक्रिय ✓", "नोड और स्टेकिंग में 100 SECT चाहिए", "नोड चालू करना है", "स्टेकिंग में 100 SECT चाहिए",
      "मुफ़्त · स्टेकिंग से अलग",
      "हमारे सिस्टम आपके नोड की लोकेशन अपने-आप पहचान लेते हैं, निर्देशांक की ज़रूरत नहीं। बस “मेरा नोड चालू करें” दबाएँ और वॉलेट कनेक्ट करें: आपका नोड तुरंत चालू हो जाता है।"]
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; K.forEach(function (k, i) { d[k] = V[l][i]; }); });
})();
/* texto de la red de validadores, debajo de los pasos del plan */
(function () {
  var K = ["hashdash.v2.why.h", "hashdash.v2.why.p", "hashdash.v2.why.l1", "hashdash.v2.why.l2", "hashdash.v2.why.l3"];
  var V = {
    en: ["Be part of the network that secures SectoraEVM.", "Join our network of security validator nodes and help build SectoraEVM: a 100% decentralized network, protected by security analysis from nodes all over the world. Every node makes the network stronger, and with Airdrop Genesis you earn rewards for building it with us as part of the Sectora team.", "Global validator network", "100% decentralized", "Rewards with Airdrop Genesis"],
    es: ["Forma parte de la red que protege SectoraEVM.", "Únete a nuestra red de validadores con nodos de seguridad y ayuda a construir SectoraEVM: una red 100 % descentralizada, protegida por el análisis de seguridad de nodos en todo el mundo. Cada nodo hace la red más fuerte y, con el Airdrop Genesis, recibes recompensas por construirla con nosotros como parte del equipo Sectora.", "Red global de validadores", "100 % descentralizada", "Recompensas con el Airdrop Genesis"],
    pt: ["Faça parte da rede que protege a SectoraEVM.", "Junte-se à nossa rede de validadores com nós de segurança e ajude a construir a SectoraEVM: uma rede 100% descentralizada, protegida pela análise de segurança de nós em todo o mundo. Cada nó deixa a rede mais forte e, com o Airdrop Genesis, você recebe recompensas por construí-la conosco como parte da equipe Sectora.", "Rede global de validadores", "100% descentralizada", "Recompensas com o Airdrop Genesis"],
    fr: ["Faites partie du réseau qui protège SectoraEVM.", "Rejoignez notre réseau de validateurs à nœuds de sécurité et aidez à construire SectoraEVM : un réseau 100 % décentralisé, protégé par l’analyse de sécurité de nœuds du monde entier. Chaque nœud renforce le réseau et, avec l’Airdrop Genesis, vous êtes récompensé pour le construire avec nous au sein de l’équipe Sectora.", "Réseau mondial de validateurs", "100 % décentralisé", "Récompenses avec l’Airdrop Genesis"],
    de: ["Werde Teil des Netzwerks, das SectoraEVM schützt.", "Tritt unserem Netzwerk aus Sicherheits-Validator-Nodes bei und hilf mit, SectoraEVM aufzubauen: ein zu 100 % dezentrales Netzwerk, geschützt durch die Sicherheitsanalyse von Nodes auf der ganzen Welt. Jeder Node macht das Netzwerk stärker, und mit dem Airdrop Genesis wirst du dafür belohnt, es gemeinsam mit uns als Teil des Sectora-Teams aufzubauen.", "Globales Validator-Netzwerk", "100 % dezentral", "Belohnungen mit dem Airdrop Genesis"],
    ru: ["Станьте частью сети, которая защищает SectoraEVM.", "Присоединяйтесь к нашей сети валидаторов с узлами безопасности и помогите построить SectoraEVM — на 100% децентрализованную сеть, защищённую анализом безопасности от узлов по всему миру. Каждый узел делает сеть сильнее, а с Airdrop Genesis вы получаете награды за то, что строите её вместе с нами в команде Sectora.", "Глобальная сеть валидаторов", "100% децентрализация", "Награды в Airdrop Genesis"],
    zh: ["加入守护 SectoraEVM 的网络。", "加入我们的安全节点验证者网络，共同构建 SectoraEVM：一个 100% 去中心化的网络，由遍布全球的节点提供安全分析保护。每个节点都让网络更强大；通过 Airdrop Genesis，你作为 Sectora 团队的一员与我们共建网络，并获得奖励。", "全球验证者网络", "100% 去中心化", "Airdrop Genesis 奖励"],
    ja: ["SectoraEVM を守るネットワークの一員に。", "セキュリティノードのバリデーターネットワークに参加し、SectoraEVM の構築に加わりましょう。SectoraEVM は、世界中のノードによるセキュリティ分析で守られた 100% 分散型のネットワークです。ノードが増えるほどネットワークは強くなり、Airdrop Genesis では Sectora チームの一員として一緒に構築した報酬を受け取れます。", "グローバルなバリデーターネットワーク", "100% 分散型", "Airdrop Genesis の報酬"],
    ko: ["SectoraEVM을 지키는 네트워크의 일원이 되세요.", "보안 노드 검증자 네트워크에 참여해 SectoraEVM 구축을 도와주세요. SectoraEVM은 전 세계 노드의 보안 분석으로 보호되는 100% 탈중앙화 네트워크입니다. 노드 하나하나가 네트워크를 더 강하게 만들며, Airdrop Genesis를 통해 Sectora 팀의 일원으로 함께 구축한 보상을 받습니다.", "글로벌 검증자 네트워크", "100% 탈중앙화", "Airdrop Genesis 보상"],
    ar: ["كن جزءًا من الشبكة التي تحمي SectoraEVM.", "انضم إلى شبكة المدققين لدينا بعُقد الأمان وساعد في بناء SectoraEVM: شبكة لا مركزية 100%، محمية بتحليل أمني من عُقد في جميع أنحاء العالم. كل عقدة تجعل الشبكة أقوى، ومع Airdrop Genesis تحصل على مكافآت لبنائها معنا كجزء من فريق Sectora.", "شبكة مدققين عالمية", "لا مركزية 100%", "مكافآت مع Airdrop Genesis"],
    hi: ["SectoraEVM को सुरक्षित रखने वाले नेटवर्क का हिस्सा बनें।", "हमारे सुरक्षा नोड वैलिडेटर नेटवर्क से जुड़ें और SectoraEVM बनाने में मदद करें: एक 100% विकेंद्रीकृत नेटवर्क, जिसे दुनिया भर के नोड्स के सुरक्षा विश्लेषण से सुरक्षित रखा जाता है। हर नोड नेटवर्क को मज़बूत बनाता है, और Airdrop Genesis के साथ Sectora टीम का हिस्सा बनकर इसे हमारे साथ बनाने के लिए आपको इनाम मिलते हैं।", "वैश्विक वैलिडेटर नेटवर्क", "100% विकेंद्रीकृत", "Airdrop Genesis के साथ इनाम"]
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; K.forEach(function (k, i) { d[k] = V[l][i]; }); });
})();
/* mapa del nodo y consola del airdrop (tarjeta "Tu nodo") */
(function () {
  var K = ["map", "mapConn", "mapOff", "con", "total", "live", "lConn", "lNode", "lOff", "lStake", "lWait", "lWaitNode", "lStart", "lTot"].map(function (k) { return "hashdash.v2.vis." + k; });
  var V = {
    en: ["Node location", "Connect your wallet to see your node on the map.", "Activate your node to see it on the map.", "Airdrop console", "Earned in the airdrop", "Live", "waiting for your wallet…", "node “{n}” online", "node off: press “Activate my node”", "staking: {s} SECT", "airdrop on hold: 100 SECT in staking needed", "airdrop on hold: activate your node", "airdrop active · {r} SECT per day", "total"],
    es: ["Ubicación del nodo", "Conecta tu wallet para ver tu nodo en el mapa.", "Activa tu nodo para verlo en el mapa.", "Consola del airdrop", "Ganado en el airdrop", "En vivo", "esperando tu wallet…", "nodo «{n}» en línea", "nodo apagado: pulsa «Activar mi nodo»", "staking: {s} SECT", "airdrop en espera: faltan 100 SECT en staking", "airdrop en espera: activa tu nodo", "airdrop activo · {r} SECT al día", "total"],
    pt: ["Localização do nó", "Conecte sua carteira para ver seu nó no mapa.", "Ative seu nó para vê-lo no mapa.", "Console do airdrop", "Ganho no airdrop", "Ao vivo", "aguardando sua carteira…", "nó “{n}” online", "nó desligado: toque em “Ativar meu nó”", "staking: {s} SECT", "airdrop em espera: faltam 100 SECT em staking", "airdrop em espera: ative seu nó", "airdrop ativo · {r} SECT por dia", "total"],
    fr: ["Emplacement du nœud", "Connectez votre wallet pour voir votre nœud sur la carte.", "Activez votre nœud pour le voir sur la carte.", "Console de l’airdrop", "Gagné dans l’airdrop", "En direct", "en attente de votre wallet…", "nœud « {n} » en ligne", "nœud éteint : appuyez sur « Activer mon nœud »", "staking : {s} SECT", "airdrop en attente : il faut 100 SECT en staking", "airdrop en attente : activez votre nœud", "airdrop actif · {r} SECT par jour", "total"],
    de: ["Standort des Nodes", "Verbinde deine Wallet, um deinen Node auf der Karte zu sehen.", "Aktiviere deinen Node, um ihn auf der Karte zu sehen.", "Airdrop-Konsole", "Im Airdrop verdient", "Live", "warte auf deine Wallet…", "Node „{n}“ online", "Node aus: tippe auf „Meinen Node aktivieren“", "Staking: {s} SECT", "Airdrop wartet: 100 SECT im Staking nötig", "Airdrop wartet: aktiviere deinen Node", "Airdrop aktiv · {r} SECT pro Tag", "gesamt"],
    ru: ["Местоположение узла", "Подключите кошелёк, чтобы увидеть узел на карте.", "Активируйте узел, чтобы увидеть его на карте.", "Консоль эйрдропа", "Заработано в эйрдропе", "В эфире", "ожидание кошелька…", "узел «{n}» в сети", "узел выключен: нажмите «Активировать мой узел»", "стейкинг: {s} SECT", "эйрдроп ждёт: нужно 100 SECT в стейкинге", "эйрдроп ждёт: активируйте узел", "эйрдроп активен · {r} SECT в день", "всего"],
    zh: ["节点位置", "连接钱包即可在地图上查看你的节点。", "激活你的节点即可在地图上查看。", "空投控制台", "空投已获得", "实时", "等待你的钱包…", "节点「{n}」在线", "节点未开启：请点击「激活我的节点」", "质押：{s} SECT", "空投等待中：需要质押 100 SECT", "空投等待中：请激活你的节点", "空投已生效 · 每天 {r} SECT", "总计"],
    ja: ["ノードの位置", "ウォレットを接続すると地図にノードが表示されます。", "ノードを有効にすると地図に表示されます。", "エアドロップ・コンソール", "エアドロップの獲得", "ライブ", "ウォレットを待っています…", "ノード「{n}」オンライン", "ノード オフ：「ノードを有効にする」を押してください", "ステーキング：{s} SECT", "エアドロップ待機中：100 SECT のステーキングが必要", "エアドロップ待機中：ノードを有効にしてください", "エアドロップ有効 · 1 日 {r} SECT", "合計"],
    ko: ["노드 위치", "지갑을 연결하면 지도에서 노드를 볼 수 있습니다.", "노드를 활성화하면 지도에서 볼 수 있습니다.", "에어드롭 콘솔", "에어드롭 획득", "라이브", "지갑을 기다리는 중…", "노드 ‘{n}’ 온라인", "노드 꺼짐: ‘내 노드 활성화’를 누르세요", "스테이킹: {s} SECT", "에어드롭 대기: 100 SECT 스테이킹 필요", "에어드롭 대기: 노드를 활성화하세요", "에어드롭 활성 · 하루 {r} SECT", "합계"],
    ar: ["موقع العقدة", "اربط محفظتك لرؤية عقدتك على الخريطة.", "فعّل عقدتك لرؤيتها على الخريطة.", "وحدة تحكم الإيردروب", "المكسوب في الإيردروب", "مباشر", "بانتظار محفظتك…", "العقدة «{n}» متصلة", "العقدة متوقفة: اضغط «تفعيل عقدتي»", "التخزين: {s} SECT", "الإيردروب بالانتظار: يلزم 100 SECT في التخزين", "الإيردروب بالانتظار: فعّل عقدتك", "الإيردروب مفعّل · {r} SECT يوميًا", "الإجمالي"],
    hi: ["नोड की लोकेशन", "मैप पर अपना नोड देखने के लिए वॉलेट कनेक्ट करें।", "मैप पर देखने के लिए अपना नोड चालू करें।", "एयरड्रॉप कंसोल", "एयरड्रॉप में कमाया", "लाइव", "आपके वॉलेट का इंतज़ार…", "नोड “{n}” ऑनलाइन", "नोड बंद: “मेरा नोड चालू करें” दबाएँ", "स्टेकिंग: {s} SECT", "एयरड्रॉप रुका है: स्टेकिंग में 100 SECT चाहिए", "एयरड्रॉप रुका है: अपना नोड चालू करें", "एयरड्रॉप सक्रिय · रोज़ {r} SECT", "कुल"]
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; K.forEach(function (k, i) { d[k] = V[l][i]; }); });
})();
/* sin cifras de staking: los niveles y las recompensas (Scout, Sentinel, Guardian, Titan) */
(function () {
  var K = ["hashdash.v2.how2.s2.p", "hashdash.v2.plan2.s1", "hashdash.v2.plan2.stNode", "hashdash.v2.card2.onSub", "hashdash.v2.card2.adBoth", "hashdash.v2.card2.adStake", "hashdash.v2.vis.lWait", "hashdash.v2.buy.kitNeed", "hashdash.v2.vis.lLevel", "hashdash.v2.lv.k"];
  var V = {
    en: ["Stake #SECT and reach your level: <b>Scout, Sentinel, Guardian or Titan</b>. The higher your level, the bigger your airdrop reward.", "Stake #SECT and reach your level (Scout → Titan)", "Node active. Stake #SECT to activate your airdrop: the higher your level, the bigger your rewards.", "Your node is on. Stake #SECT to activate your airdrop: your level sets your rewards.", "Needs your node and your staking", "Needs your staking", "airdrop on hold: stake #SECT to reach your level and start earning", "Needs your staking", "level {l} · reward {p} SECT", "Airdrop levels: the higher, the bigger your reward"],
    es: ["Haz staking de #SECT y alcanza tu nivel: <b>Scout, Sentinel, Guardian o Titan</b>. Cuanto más alto tu nivel, mayor tu recompensa del airdrop.", "Haz staking de #SECT y alcanza tu nivel (de Scout a Titan)", "Nodo activado. Haz staking de #SECT para activar tu airdrop: cuanto más alto tu nivel, mayores tus recompensas.", "Tu nodo está encendido. Haz staking de #SECT para activar tu airdrop: tu nivel define tus recompensas.", "Falta tu nodo y tu staking", "Falta tu staking", "airdrop en espera: haz staking de #SECT para alcanzar tu nivel y empezar a ganar", "Falta tu staking", "nivel {l} · recompensa {p} SECT", "Niveles del airdrop: cuanto más alto, mayor tu recompensa"],
    pt: ["Faça staking de #SECT e alcance seu nível: <b>Scout, Sentinel, Guardian ou Titan</b>. Quanto mais alto o nível, maior a sua recompensa do airdrop.", "Faça staking de #SECT e alcance seu nível (de Scout a Titan)", "Nó ativado. Faça staking de #SECT para ativar seu airdrop: quanto mais alto o nível, maiores as recompensas.", "Seu nó está ligado. Faça staking de #SECT para ativar seu airdrop: seu nível define suas recompensas.", "Falta seu nó e seu staking", "Falta seu staking", "airdrop em espera: faça staking de #SECT para alcançar seu nível e começar a ganhar", "Falta seu staking", "nível {l} · recompensa {p} SECT", "Níveis do airdrop: quanto mais alto, maior a recompensa"],
    fr: ["Stakez des #SECT et atteignez votre niveau : <b>Scout, Sentinel, Guardian ou Titan</b>. Plus votre niveau est élevé, plus votre récompense d’airdrop est grande.", "Stakez des #SECT et atteignez votre niveau (de Scout à Titan)", "Nœud activé. Stakez des #SECT pour activer votre airdrop : plus votre niveau est élevé, plus vos récompenses sont grandes.", "Votre nœud est allumé. Stakez des #SECT pour activer votre airdrop : votre niveau fixe vos récompenses.", "Il manque votre nœud et votre staking", "Il manque votre staking", "airdrop en attente : stakez des #SECT pour atteindre votre niveau et commencer à gagner", "Il manque votre staking", "niveau {l} · récompense {p} SECT", "Niveaux de l’airdrop : plus il est élevé, plus la récompense est grande"],
    de: ["Stake #SECT und erreiche deine Stufe: <b>Scout, Sentinel, Guardian oder Titan</b>. Je höher deine Stufe, desto größer deine Airdrop-Belohnung.", "Stake #SECT und erreiche deine Stufe (von Scout bis Titan)", "Node aktiv. Stake #SECT, um deinen Airdrop zu aktivieren: Je höher deine Stufe, desto größer deine Belohnungen.", "Dein Node ist an. Stake #SECT, um deinen Airdrop zu aktivieren: Deine Stufe bestimmt deine Belohnungen.", "Es fehlen dein Node und dein Staking", "Es fehlt dein Staking", "Airdrop wartet: Stake #SECT, um deine Stufe zu erreichen und zu verdienen", "Es fehlt dein Staking", "Stufe {l} · Belohnung {p} SECT", "Airdrop-Stufen: je höher, desto größer die Belohnung"],
    ru: ["Застейкайте #SECT и достигните своего уровня: <b>Scout, Sentinel, Guardian или Titan</b>. Чем выше уровень, тем больше награда в эйрдропе.", "Застейкайте #SECT и достигните уровня (от Scout до Titan)", "Узел активен. Застейкайте #SECT, чтобы активировать эйрдроп: чем выше уровень, тем больше награды.", "Ваш узел включён. Застейкайте #SECT, чтобы активировать эйрдроп: уровень определяет ваши награды.", "Нужны узел и стейкинг", "Нужен стейкинг", "эйрдроп ждёт: застейкайте #SECT, чтобы получить уровень и начать зарабатывать", "Нужен стейкинг", "уровень {l} · награда {p} SECT", "Уровни эйрдропа: чем выше, тем больше награда"],
    zh: ["质押 #SECT 并达到你的等级：<b>Scout、Sentinel、Guardian 或 Titan</b>。等级越高，空投奖励越多。", "质押 #SECT 并达到你的等级（从 Scout 到 Titan）", "节点已激活。质押 #SECT 即可激活空投：等级越高，奖励越多。", "你的节点已开启。质押 #SECT 即可激活空投：你的等级决定你的奖励。", "需要节点和质押", "需要质押", "空投等待中：质押 #SECT 达到等级即可开始获得奖励", "需要质押", "等级 {l} · 奖励 {p} SECT", "空投等级：等级越高，奖励越多"],
    ja: ["#SECT をステーキングしてレベルを獲得：<b>Scout、Sentinel、Guardian、Titan</b>。レベルが高いほど、エアドロップの報酬は大きくなります。", "#SECT をステーキングしてレベルを獲得（Scout から Titan まで）", "ノード有効。#SECT をステーキングするとエアドロップが有効に：レベルが高いほど報酬は大きくなります。", "ノードはオンです。#SECT をステーキングするとエアドロップが有効に：レベルで報酬が決まります。", "ノードとステーキングが必要", "ステーキングが必要", "エアドロップ待機中：#SECT をステーキングしてレベルを獲得し、報酬を得ましょう", "ステーキングが必要", "レベル {l} · 報酬 {p} SECT", "エアドロップのレベル：高いほど報酬が大きくなります"],
    ko: ["#SECT를 스테이킹하고 레벨을 달성하세요: <b>Scout, Sentinel, Guardian 또는 Titan</b>. 레벨이 높을수록 에어드롭 보상이 커집니다.", "#SECT 스테이킹으로 레벨 달성 (Scout부터 Titan까지)", "노드 활성. #SECT를 스테이킹하면 에어드롭이 활성화됩니다: 레벨이 높을수록 보상이 커집니다.", "노드가 켜져 있습니다. #SECT를 스테이킹하면 에어드롭이 활성화됩니다: 레벨이 보상을 결정합니다.", "노드와 스테이킹이 필요합니다", "스테이킹이 필요합니다", "에어드롭 대기: #SECT를 스테이킹해 레벨을 달성하고 보상을 받으세요", "스테이킹이 필요합니다", "레벨 {l} · 보상 {p} SECT", "에어드롭 레벨: 높을수록 보상이 커집니다"],
    ar: ["خزّن #SECT وحقّق مستواك: <b>Scout أو Sentinel أو Guardian أو Titan</b>. كلما ارتفع مستواك، زادت مكافأتك في الإيردروب.", "خزّن #SECT وحقّق مستواك (من Scout إلى Titan)", "العقدة مفعّلة. خزّن #SECT لتفعيل الإيردروب: كلما ارتفع مستواك، زادت مكافآتك.", "عقدتك تعمل. خزّن #SECT لتفعيل الإيردروب: مستواك يحدد مكافآتك.", "تحتاج إلى عقدتك وتخزينك", "تحتاج إلى التخزين", "الإيردروب بالانتظار: خزّن #SECT لتحقيق مستواك وبدء الربح", "تحتاج إلى التخزين", "المستوى {l} · المكافأة {p} SECT", "مستويات الإيردروب: كلما ارتفع المستوى زادت المكافأة"],
    hi: ["#SECT स्टेक करें और अपना स्तर पाएँ: <b>Scout, Sentinel, Guardian या Titan</b>। स्तर जितना ऊँचा, एयरड्रॉप इनाम उतना बड़ा।", "#SECT स्टेक करें और अपना स्तर पाएँ (Scout से Titan तक)", "नोड चालू। एयरड्रॉप सक्रिय करने के लिए #SECT स्टेक करें: स्तर जितना ऊँचा, इनाम उतने बड़े।", "आपका नोड चालू है। एयरड्रॉप सक्रिय करने के लिए #SECT स्टेक करें: आपका स्तर आपके इनाम तय करता है।", "नोड और स्टेकिंग चाहिए", "स्टेकिंग चाहिए", "एयरड्रॉप रुका है: अपना स्तर पाने और कमाई शुरू करने के लिए #SECT स्टेक करें", "स्टेकिंग चाहिए", "स्तर {l} · इनाम {p} SECT", "एयरड्रॉप स्तर: जितना ऊँचा, उतना बड़ा इनाम"]
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; K.forEach(function (k, i) { d[k] = V[l][i]; }); });
})();
/* el airdrop de este nodo, en la tarjeta "Tu nodo": lo liberado, lo que generara y la entrega */
(function () {
  var K = ["k", "earned", "total", "totalS", "deliv", "btn"].map(function (k) { return "hashdash.v2.box." + k; });
  var V = {
    en: ["Airdrop of this node", "Released so far", "This node will generate", "on completing your time", "Delivered at the launch of SectoraEVM", "Airdrop panel"],
    es: ["Airdrop de este nodo", "Liberado hasta ahora", "Generará este nodo", "al completar tu tiempo", "Se entrega en el lanzamiento de SectoraEVM", "Panel del airdrop"],
    pt: ["Airdrop deste nó", "Liberado até agora", "Este nó vai gerar", "ao completar seu tempo", "Entregue no lançamento da SectoraEVM", "Painel do airdrop"],
    fr: ["Airdrop de ce nœud", "Libéré jusqu’ici", "Ce nœud générera", "en complétant votre temps", "Livré au lancement de SectoraEVM", "Panneau de l’airdrop"],
    de: ["Airdrop dieses Nodes", "Bisher freigegeben", "Dieser Node erzeugt", "nach Abschluss deiner Zeit", "Auszahlung beim Start von SectoraEVM", "Airdrop-Panel"],
    ru: ["Эйрдроп этого узла", "Начислено на данный момент", "Узел сгенерирует", "по завершении вашего срока", "Выдаётся при запуске SectoraEVM", "Панель эйрдропа"],
    zh: ["此节点的空投", "目前已释放", "此节点将产生", "完成你的时间后", "在 SectoraEVM 上线时发放", "空投面板"],
    ja: ["このノードのエアドロップ", "これまでに解放", "このノードが生み出す量", "期間を満了したとき", "SectoraEVM のローンチ時に配布", "エアドロップ・パネル"],
    ko: ["이 노드의 에어드롭", "지금까지 적립", "이 노드가 생성할 양", "기간을 채우면", "SectoraEVM 출시 때 지급", "에어드롭 패널"],
    ar: ["إيردروب هذه العقدة", "المُحرَّر حتى الآن", "ستولّد هذه العقدة", "عند إكمال مدتك", "يُسلَّم عند إطلاق SectoraEVM", "لوحة الإيردروب"],
    hi: ["इस नोड का एयरड्रॉप", "अब तक जारी", "यह नोड जनरेट करेगा", "अपना समय पूरा करने पर", "SectoraEVM के लॉन्च पर दिया जाएगा", "एयरड्रॉप पैनल"]
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; K.forEach(function (k, i) { d[k] = V[l][i]; }); });
})();
/* sin ubicacion detectada: se escribe a mano */
(function () {
  var V = {
    en: "Type your city's latitude and longitude above, then press “Activate my node”.",
    es: "Escribe arriba la latitud y la longitud de tu ciudad y pulsa «Activar mi nodo».",
    pt: "Digite acima a latitude e a longitude da sua cidade e toque em “Ativar meu nó”.",
    fr: "Saisissez ci-dessus la latitude et la longitude de votre ville, puis appuyez sur « Activer mon nœud ».",
    de: "Gib oben Breiten- und Längengrad deiner Stadt ein und tippe auf „Meinen Node aktivieren“.",
    ru: "Введите выше широту и долготу вашего города и нажмите «Активировать мой узел».",
    zh: "在上方输入你所在城市的纬度和经度，然后点击「激活我的节点」。",
    ja: "上に都市の緯度と経度を入力し、「ノードを有効にする」を押してください。",
    ko: "위에 도시의 위도와 경도를 입력한 뒤 ‘내 노드 활성화’를 누르세요.",
    ar: "اكتب في الأعلى خط العرض وخط الطول لمدينتك، ثم اضغط «تفعيل عقدتي».",
    hi: "ऊपर अपने शहर का अक्षांश और देशांतर लिखें, फिर “मेरा नोड चालू करें” दबाएँ।"
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { (X[l] = X[l] || {})["hashdash.v2.plan.stManual"] = V[l]; });
})();
/* lo generado por SECT que salieron antes de 30 dias: queda en pausa, no se borra */
(function () {
  var V = {
    "en": "{n} SECT paused: they continue when your SECT return to staking. To collect them, complete 30 days inside.",
    "es": "{n} SECT en pausa: siguen sumando cuando vuelvas a depositar. Para cobrarlos, completa 30 días dentro.",
    "pt": "{n} SECT em pausa: voltam a somar quando você depositar de novo. Para recebê-los, complete 30 dias dentro.",
    "fr": "{n} SECT en pause : ils reprennent quand vos SECT reviennent en staking. Pour les recevoir, complétez 30 jours.",
    "de": "{n} SECT pausiert: Sie laufen weiter, sobald deine SECT zurück im Staking sind. Für die Auszahlung 30 Tage dabei bleiben.",
    "ru": "{n} SECT на паузе: они продолжат расти, когда SECT вернутся в стейкинг. Чтобы получить их, пробудьте внутри 30 дней.",
    "zh": "{n} SECT 已暂停：SECT 重新质押后继续累计。完成 30 天即可领取。",
    "ja": "{n} SECT は一時停止中：SECT をステーキングに戻すと再開します。受け取るには 30 日間参加してください。",
    "ko": "{n} SECT 일시 중지: SECT를 다시 스테이킹하면 이어서 쌓입니다. 받으려면 30일을 채우세요.",
    "ar": "{n} SECT متوقفة مؤقتًا: تستمر عند إعادة SECT إلى التخزين. لاستلامها، أكمل 30 يومًا.",
    "hi": "{n} SECT रुके हुए हैं: SECT वापस स्टेक करने पर ये फिर जुड़ने लगेंगे। पाने के लिए 30 दिन पूरे करें।"
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { (X[l] = X[l] || {})["hashdash.v2.box.paused"] = V[l]; });
})();
/* retiro y volvio con menos: su nivel anterior en pausa y el nivel nuevo */
(function () {
  var W = {"en": "At {l} level you had {g} SECT generated. Deposit your previous balance ({b} SECT in staking) and it runs again.", "es": "En nivel {l} tenías {g} SECT generados. Deposita tu saldo anterior ({b} SECT en staking) y vuelve a correr.", "pt": "No nível {l} você tinha {g} SECT gerados. Deposite seu saldo anterior ({b} SECT em staking) e volta a correr.", "fr": "Au niveau {l}, vous aviez {g} SECT générés. Redéposez votre solde précédent ({b} SECT en staking) et le compteur repart.", "de": "Auf Stufe {l} hattest du {g} SECT erzielt. Zahle deinen vorherigen Betrag ({b} SECT im Staking) wieder ein, dann läuft es weiter.", "ru": "На уровне {l} у вас было {g} SECT. Внесите прежний баланс ({b} SECT в стейкинге), и счёт продолжится.", "zh": "在 {l} 等级时你已产生 {g} SECT。重新存入之前的余额（质押 {b} SECT）即可继续累计。", "ja": "{l} レベルでは {g} SECT を生み出していました。以前の残高（ステーキング {b} SECT）を再び預けると、また進みます。", "ko": "{l} 레벨에서 {g} SECT를 적립했습니다. 이전 잔액(스테이킹 {b} SECT)을 다시 예치하면 다시 쌓입니다.", "ar": "في مستوى {l} كان لديك {g} SECT. أودِع رصيدك السابق ({b} SECT في التخزين) ليعود العدّاد إلى العمل.", "hi": "{l} स्तर पर आपके {g} SECT बने थे। अपना पिछला बैलेंस ({b} SECT स्टेकिंग में) फिर से जमा करें और यह फिर चलने लगेगा।"};
  var N = {"en": "Now: {l} level with {s} SECT in staking · prize {p} SECT.", "es": "Ahora: nivel {l} con {s} SECT en staking · premio {p} SECT.", "pt": "Agora: nível {l} com {s} SECT em staking · prêmio {p} SECT.", "fr": "Maintenant : niveau {l} avec {s} SECT en staking · prix {p} SECT.", "de": "Jetzt: Stufe {l} mit {s} SECT im Staking · Belohnung {p} SECT.", "ru": "Сейчас: уровень {l}, {s} SECT в стейкинге · награда {p} SECT.", "zh": "现在：{l} 等级，质押 {s} SECT · 奖励 {p} SECT。", "ja": "現在：{l} レベル、ステーキング {s} SECT · 報酬 {p} SECT。", "ko": "현재: {l} 레벨, 스테이킹 {s} SECT · 보상 {p} SECT.", "ar": "الآن: مستوى {l} مع {s} SECT في التخزين · الجائزة {p} SECT.", "hi": "अब: {l} स्तर, स्टेकिंग में {s} SECT · इनाम {p} SECT।"};
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(W).forEach(function (l) { var d = X[l] = X[l] || {}; d["hashdash.v2.box.was"] = W[l]; d["hashdash.v2.box.now"] = N[l]; });
})();
/* ventana de wallets: sin Sepolia (solo se lee la direccion, en cualquier red) */
(function () {
  var S = {"en": "Works with any Ethereum wallet: MetaMask, Trust Wallet, Coinbase Wallet, OKX and more. Connecting only reads your address.", "es": "Funciona con cualquier wallet de Ethereum: MetaMask, Trust Wallet, Coinbase Wallet, OKX y más. Conectar solo lee tu dirección.", "pt": "Funciona com qualquer carteira Ethereum: MetaMask, Trust Wallet, Coinbase Wallet, OKX e outras. Conectar só lê seu endereço.", "fr": "Fonctionne avec tout wallet Ethereum : MetaMask, Trust Wallet, Coinbase Wallet, OKX et d’autres. La connexion lit seulement votre adresse.", "de": "Funktioniert mit jeder Ethereum-Wallet: MetaMask, Trust Wallet, Coinbase Wallet, OKX und mehr. Beim Verbinden wird nur deine Adresse gelesen.", "ru": "Подходит любой кошелёк Ethereum: MetaMask, Trust Wallet, Coinbase Wallet, OKX и другие. При подключении читается только ваш адрес.", "zh": "支持任何以太坊钱包：MetaMask、Trust Wallet、Coinbase Wallet、OKX 等。连接只会读取你的地址。", "ja": "どの Ethereum ウォレットでも使えます：MetaMask、Trust Wallet、Coinbase Wallet、OKX など。接続ではアドレスを読み取るだけです。", "ko": "모든 이더리움 지갑에서 작동합니다: MetaMask, Trust Wallet, Coinbase Wallet, OKX 등. 연결 시 주소만 읽습니다.", "ar": "يعمل مع أي محفظة إيثريوم: MetaMask وTrust Wallet وCoinbase Wallet وOKX وغيرها. الربط يقرأ عنوانك فقط.", "hi": "किसी भी Ethereum वॉलेट के साथ चलता है: MetaMask, Trust Wallet, Coinbase Wallet, OKX और दूसरे। कनेक्ट करने पर सिर्फ़ आपका पता पढ़ा जाता है।"};
  var W = {"en": "Your wallet didn't accept the connection. Try again, or connect with MetaMask, Trust Wallet, OKX or Rabby.", "es": "Tu wallet no aceptó la conexión. Prueba de nuevo o conéctate con MetaMask, Trust Wallet, OKX o Rabby.", "pt": "Sua carteira não aceitou a conexão. Tente de novo ou conecte com MetaMask, Trust Wallet, OKX ou Rabby.", "fr": "Votre wallet n’a pas accepté la connexion. Réessayez ou connectez-vous avec MetaMask, Trust Wallet, OKX ou Rabby.", "de": "Deine Wallet hat die Verbindung nicht angenommen. Versuche es erneut oder verbinde dich mit MetaMask, Trust Wallet, OKX oder Rabby.", "ru": "Кошелёк не принял подключение. Попробуйте снова или подключитесь через MetaMask, Trust Wallet, OKX или Rabby.", "zh": "你的钱包没有接受连接。请重试，或使用 MetaMask、Trust Wallet、OKX 或 Rabby 连接。", "ja": "ウォレットが接続を受け付けませんでした。もう一度試すか、MetaMask、Trust Wallet、OKX、Rabby で接続してください。", "ko": "지갑이 연결을 수락하지 않았습니다. 다시 시도하거나 MetaMask, Trust Wallet, OKX 또는 Rabby로 연결하세요.", "ar": "لم تقبل محفظتك الاتصال. حاول مرة أخرى أو اربط باستخدام MetaMask أو Trust Wallet أو OKX أو Rabby.", "hi": "आपके वॉलेट ने कनेक्शन स्वीकार नहीं किया। फिर से कोशिश करें या MetaMask, Trust Wallet, OKX या Rabby से कनेक्ट करें।"};
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(S).forEach(function (l) { var d = X[l] = X[l] || {}; d["hashdash.wallet.sepolia"] = S[l]; d["hashdash.wallet.wNoSepolia"] = W[l]; });
})();
/* nodo listo: se activa solo al pulsar el boton */
(function () {
  var V = {
    en: "Your node is ready. Press “Activate my node” to turn it on. It's free.",
    es: "Tu nodo está listo. Pulsa «Activar mi nodo» para encenderlo. Es gratis.",
    pt: "Seu nó está pronto. Toque em “Ativar meu nó” para ligá-lo. É grátis.",
    fr: "Votre nœud est prêt. Appuyez sur « Activer mon nœud » pour l’allumer. C’est gratuit.",
    de: "Dein Node ist bereit. Tippe auf „Meinen Node aktivieren“, um ihn einzuschalten. Kostenlos.",
    ru: "Ваш узел готов. Нажмите «Активировать мой узел», чтобы включить его. Это бесплатно.",
    zh: "你的节点已就绪。点击「激活我的节点」即可开启，免费。",
    ja: "ノードの準備ができました。「ノードを有効にする」を押してオンにしてください。無料です。",
    ko: "노드가 준비되었습니다. ‘내 노드 활성화’를 눌러 켜세요. 무료입니다.",
    ar: "عقدتك جاهزة. اضغط «تفعيل عقدتي» لتشغيلها. مجانًا.",
    hi: "आपका नोड तैयार है। इसे चालू करने के लिए “मेरा नोड चालू करें” दबाएँ। यह मुफ़्त है।"
  };
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { (X[l] = X[l] || {})["hashdash.v2.plan.stReady"] = V[l]; });
})();
/* modo temporal SOLO_APP del selector de wallets: en el movil sin wallet, abrir la pagina en la app */
(function () {
  var V = {"en": ["Open this page in your wallet", "To connect from your phone, open this page inside your wallet app. Tap your wallet:", "Your node, staking and airdrop work the same inside your wallet app. On a computer you can also connect as usual."], "es": ["Abre esta página en tu wallet", "Para conectar desde el teléfono, abre esta página dentro de la app de tu wallet. Toca tu wallet:", "Tu nodo, tu staking y tu airdrop funcionan igual dentro de la app de tu wallet. En el ordenador también puedes conectar como siempre."], "pt": ["Abra esta página na sua carteira", "Para conectar pelo celular, abra esta página dentro do app da sua carteira. Toque na sua carteira:", "Seu nó, seu staking e seu airdrop funcionam igual dentro do app da sua carteira. No computador você também pode conectar como sempre."], "fr": ["Ouvrez cette page dans votre wallet", "Pour vous connecter depuis votre téléphone, ouvrez cette page dans l’app de votre wallet. Touchez votre wallet :", "Votre nœud, votre staking et votre airdrop fonctionnent de la même façon dans l’app de votre wallet. Sur ordinateur, vous pouvez aussi vous connecter comme d’habitude."], "de": ["Öffne diese Seite in deiner Wallet", "Um dich vom Handy aus zu verbinden, öffne diese Seite in der App deiner Wallet. Tippe auf deine Wallet:", "Dein Node, dein Staking und dein Airdrop funktionieren in der App deiner Wallet genauso. Am Computer kannst du dich auch wie gewohnt verbinden."], "ru": ["Откройте эту страницу в своём кошельке", "Чтобы подключиться с телефона, откройте эту страницу в приложении своего кошелька. Выберите кошелёк:", "Узел, стейкинг и аирдроп работают так же внутри приложения кошелька. На компьютере можно подключаться как обычно."], "zh": ["在你的钱包中打开此页面", "如需在手机上连接，请在钱包 App 内打开此页面。选择你的钱包：", "在钱包 App 内，你的节点、质押和空投一切照常。在电脑上也可以照常连接。"], "ja": ["このページをウォレットで開いてください", "スマホから接続するには、ウォレットアプリ内でこのページを開いてください。ウォレットを選んでください：", "ノード、ステーキング、エアドロップはウォレットアプリ内でも同じように使えます。パソコンからはこれまで通り接続できます。"], "ko": ["이 페이지를 지갑에서 여세요", "휴대폰에서 연결하려면 지갑 앱 안에서 이 페이지를 여세요. 지갑을 선택하세요:", "노드, 스테이킹, 에어드랍은 지갑 앱 안에서도 똑같이 작동합니다. 컴퓨터에서는 평소처럼 연결할 수 있습니다."], "ar": ["افتح هذه الصفحة في محفظتك", "للاتصال من هاتفك، افتح هذه الصفحة داخل تطبيق محفظتك. اختر محفظتك:", "عقدتك وتخزينك والإيردروب تعمل بالطريقة نفسها داخل تطبيق محفظتك. ويمكنك على الحاسوب الاتصال كالمعتاد."], "hi": ["यह पेज अपने वॉलेट में खोलें", "फ़ोन से कनेक्ट करने के लिए यह पेज अपने वॉलेट ऐप के अंदर खोलें। अपना वॉलेट चुनें:", "आपका नोड, स्टेकिंग और एयरड्रॉप वॉलेट ऐप के अंदर भी वैसे ही चलते हैं। कंप्यूटर पर आप हमेशा की तरह कनेक्ट कर सकते हैं।"]};
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; d["hashdash.wallet.soloT"] = V[l][0]; d["hashdash.wallet.soloS"] = V[l][1]; d["hashdash.wallet.soloF"] = V[l][2]; });
})();
/* modo temporal SOLO_APP: "Otra wallet" copia el enlace para abrirlo en el navegador de la wallet */
(function () {
  var V = {"en": ["Another wallet", "Copy the link and open it in your wallet’s browser", "Link copied. Open your wallet app, go to its browser and paste it."], "es": ["Otra wallet", "Copia el enlace y ábrelo en el navegador de tu wallet", "Enlace copiado. Abre la app de tu wallet, entra en su navegador y pégalo."], "pt": ["Outra carteira", "Copie o link e abra no navegador da sua carteira", "Link copiado. Abra o app da sua carteira, vá ao navegador dela e cole."], "fr": ["Un autre wallet", "Copiez le lien et ouvrez-le dans le navigateur de votre wallet", "Lien copié. Ouvrez l’app de votre wallet, allez dans son navigateur et collez-le."], "de": ["Andere Wallet", "Kopiere den Link und öffne ihn im Browser deiner Wallet", "Link kopiert. Öffne deine Wallet-App, geh in ihren Browser und füge ihn ein."], "ru": ["Другой кошелёк", "Скопируйте ссылку и откройте её в браузере кошелька", "Ссылка скопирована. Откройте приложение кошелька, перейдите в его браузер и вставьте её."], "zh": ["其他钱包", "复制链接并在钱包的浏览器中打开", "链接已复制。打开你的钱包 App，进入其浏览器并粘贴。"], "ja": ["その他のウォレット", "リンクをコピーしてウォレットのブラウザで開いてください", "リンクをコピーしました。ウォレットアプリを開き、ブラウザに貼り付けてください。"], "ko": ["다른 지갑", "링크를 복사해 지갑의 브라우저에서 여세요", "링크가 복사되었습니다. 지갑 앱을 열고 브라우저에 붙여 넣으세요."], "ar": ["محفظة أخرى", "انسخ الرابط وافتحه في متصفح محفظتك", "تم نسخ الرابط. افتح تطبيق محفظتك وادخل إلى متصفحه والصقه."], "hi": ["कोई और वॉलेट", "लिंक कॉपी करें और अपने वॉलेट के ब्राउज़र में खोलें", "लिंक कॉपी हो गया। अपना वॉलेट ऐप खोलें, उसके ब्राउज़र में जाएँ और पेस्ट करें।"]};
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; d["hashdash.wallet.soloOtherN"] = V[l][0]; d["hashdash.wallet.soloOtherS"] = V[l][1]; d["hashdash.wallet.soloCopied"] = V[l][2]; });
})();
/* modo temporal SOLO_APP en el ordenador: sin QR, extensiones y el enlace para el telefono */
(function () {
  var V = {"en": "To connect here, install a wallet extension. On your phone, open this page inside your wallet app.",
    "es": "Para conectar aquí, instala una extensión de wallet. En el teléfono, abre esta página dentro de la app de tu wallet.",
    "pt": "Para conectar aqui, instale uma extensão de carteira. No celular, abra esta página dentro do app da sua carteira.",
    "fr": "Pour vous connecter ici, installez une extension de wallet. Sur votre téléphone, ouvrez cette page dans l’app de votre wallet.",
    "de": "Um dich hier zu verbinden, installiere eine Wallet-Erweiterung. Auf dem Handy öffne diese Seite in deiner Wallet-App.",
    "ru": "Чтобы подключиться здесь, установите расширение кошелька. На телефоне откройте эту страницу в приложении кошелька.",
    "zh": "要在此连接，请安装钱包浏览器扩展。在手机上，请在钱包 App 内打开此页面。",
    "ja": "ここで接続するには、ウォレットの拡張機能をインストールしてください。スマホでは、ウォレットアプリ内でこのページを開いてください。",
    "ko": "여기서 연결하려면 지갑 확장 프로그램을 설치하세요. 휴대폰에서는 지갑 앱 안에서 이 페이지를 여세요.",
    "ar": "للاتصال هنا، ثبّت إضافة محفظة. على هاتفك، افتح هذه الصفحة داخل تطبيق محفظتك.",
    "hi": "यहाँ कनेक्ट करने के लिए वॉलेट एक्सटेंशन इंस्टॉल करें। फ़ोन पर, यह पेज अपने वॉलेट ऐप के अंदर खोलें।"};
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; d["hashdash.wallet.soloPc"] = V[l]; });
})();
/* ordenador: etiqueta de las wallets que son solo app del movil */
(function () {
  var V = {"en": "Phone", "es": "Móvil", "pt": "Celular", "fr": "Mobile", "de": "Handy", "ru": "Телефон", "zh": "手机", "ja": "スマホ", "ko": "휴대폰", "ar": "الهاتف", "hi": "फ़ोन"};
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; d["hashdash.wallet.tagPhone"] = V[l]; });
})();
/* WalletConnect solo para wallets sin navegador propio (Tangem, Ledger Live, Safe...), con aviso previo */
(function () {
  var V = {"en": ["Wallets without their own browser · WalletConnect", "Only for wallets without their own browser (Uniswap Wallet, Tangem, Ledger Live, Safe…). While WalletConnect reviews our domain, your wallet may show a security warning by mistake. Right now WalletConnect is waiting for its history to be updated so this erroneous message is removed. Sectora and its contracts are verified on Etherscan, and connecting only reads your address.", "Copy the connection link, open your wallet, go to WalletConnect and paste it. Then come back to this tab.", "Scan this QR code with your wallet, or copy the connection link and paste it in its WalletConnect section."], "es": ["Wallets sin navegador propio · WalletConnect", "Solo para wallets sin navegador propio (Uniswap Wallet, Tangem, Ledger Live, Safe…). Mientras WalletConnect revisa nuestro dominio, tu wallet puede mostrar un aviso de seguridad por error. En estos momentos WalletConnect está esperando la actualización de su historial para que sea eliminado este mensaje erróneo. Sectora y sus contratos están verificados en Etherscan, y conectar solo lee tu dirección.", "Copia el enlace de conexión, abre tu wallet, entra en WalletConnect y pégalo. Después vuelve a esta pestaña.", "Escanea este QR con tu wallet, o copia el enlace de conexión y pégalo en su apartado de WalletConnect."], "pt": ["Carteiras sem navegador próprio · WalletConnect", "Só para carteiras sem navegador próprio (Uniswap Wallet, Tangem, Ledger Live, Safe…). Enquanto o WalletConnect revisa nosso domínio, sua carteira pode mostrar um aviso de segurança por engano. Neste momento o WalletConnect está aguardando a atualização do seu histórico para que essa mensagem errada seja removida. A Sectora e seus contratos são verificados no Etherscan, e conectar só lê o seu endereço.", "Copie o link de conexão, abra sua carteira, vá ao WalletConnect e cole. Depois volte para esta aba.", "Escaneie este QR com sua carteira, ou copie o link de conexão e cole na seção WalletConnect dela."], "fr": ["Wallets sans navigateur intégré · WalletConnect", "Uniquement pour les wallets sans navigateur intégré (Uniswap Wallet, Tangem, Ledger Live, Safe…). Pendant que WalletConnect examine notre domaine, votre wallet peut afficher un avertissement de sécurité par erreur. En ce moment, WalletConnect attend la mise à jour de son historique pour que ce message erroné soit supprimé. Sectora et ses contrats sont vérifiés sur Etherscan, et la connexion ne lit que votre adresse.", "Copiez le lien de connexion, ouvrez votre wallet, allez dans WalletConnect et collez-le. Revenez ensuite sur cet onglet.", "Scannez ce QR code avec votre wallet, ou copiez le lien de connexion et collez-le dans sa section WalletConnect."], "de": ["Wallets ohne eigenen Browser · WalletConnect", "Nur für Wallets ohne eigenen Browser (Uniswap Wallet, Tangem, Ledger Live, Safe…). Während WalletConnect unsere Domain prüft, kann deine Wallet irrtümlich eine Sicherheitswarnung anzeigen. Derzeit wartet WalletConnect auf die Aktualisierung seines Verlaufs, damit diese fehlerhafte Meldung entfernt wird. Sectora und seine Verträge sind auf Etherscan verifiziert, und beim Verbinden wird nur deine Adresse gelesen.", "Kopiere den Verbindungslink, öffne deine Wallet, gehe zu WalletConnect und füge ihn ein. Komm dann zu diesem Tab zurück.", "Scanne diesen QR-Code mit deiner Wallet oder kopiere den Verbindungslink und füge ihn im WalletConnect-Bereich ein."], "ru": ["Кошельки без своего браузера · WalletConnect", "Только для кошельков без своего браузера (Uniswap Wallet, Tangem, Ledger Live, Safe…). Пока WalletConnect проверяет наш домен, кошелёк может по ошибке показать предупреждение безопасности. Сейчас WalletConnect ожидает обновления своей истории, чтобы это ошибочное сообщение было удалено. Sectora и её контракты верифицированы на Etherscan, а подключение только считывает ваш адрес.", "Скопируйте ссылку подключения, откройте кошелёк, перейдите в WalletConnect и вставьте её. Затем вернитесь на эту вкладку.", "Отсканируйте этот QR-код кошельком или скопируйте ссылку подключения и вставьте её в разделе WalletConnect."], "zh": ["没有内置浏览器的钱包 · WalletConnect", "仅适用于没有内置浏览器的钱包（Uniswap Wallet、Tangem、Ledger Live、Safe…）。在 WalletConnect 审核我们的域名期间，你的钱包可能会误报安全警告。目前 WalletConnect 正在等待其记录更新，以删除这条错误提示。Sectora 及其合约已在 Etherscan 上验证，连接只会读取你的地址。", "复制连接链接，打开你的钱包，进入 WalletConnect 并粘贴。然后回到此页面。", "用你的钱包扫描此二维码，或复制连接链接并粘贴到钱包的 WalletConnect 中。"], "ja": ["ブラウザのないウォレット · WalletConnect", "ブラウザを持たないウォレット（Uniswap Wallet、Tangem、Ledger Live、Safe…）専用です。WalletConnect が当サイトのドメインを確認している間、ウォレットに誤ってセキュリティ警告が表示されることがあります。現在、WalletConnect はこの誤ったメッセージを削除するため、履歴の更新を待っています。Sectora とそのコントラクトは Etherscan で検証済みで、接続してもアドレスを読み取るだけです。", "接続リンクをコピーし、ウォレットを開いて WalletConnect に貼り付けてください。その後このタブに戻ってください。", "このQRコードをウォレットでスキャンするか、接続リンクをコピーしてウォレットの WalletConnect に貼り付けてください。"], "ko": ["자체 브라우저가 없는 지갑 · WalletConnect", "자체 브라우저가 없는 지갑(Uniswap Wallet, Tangem, Ledger Live, Safe…) 전용입니다. WalletConnect가 저희 도메인을 검토하는 동안 지갑에 보안 경고가 잘못 표시될 수 있습니다. 현재 WalletConnect는 이 잘못된 메시지를 삭제하기 위해 기록 업데이트를 기다리고 있습니다. Sectora와 컨트랙트는 Etherscan에서 검증되었으며, 연결 시 주소만 읽습니다.", "연결 링크를 복사하고 지갑을 열어 WalletConnect에 붙여 넣으세요. 그런 다음 이 탭으로 돌아오세요.", "지갑으로 이 QR 코드를 스캔하거나, 연결 링크를 복사해 지갑의 WalletConnect에 붙여 넣으세요."], "ar": ["محافظ بدون متصفح خاص · WalletConnect", "فقط للمحافظ التي ليس لها متصفح خاص (Uniswap Wallet وTangem وLedger Live وSafe…). أثناء مراجعة WalletConnect لنطاقنا، قد تعرض محفظتك تحذيرًا أمنيًا عن طريق الخطأ. في هذه اللحظة، ينتظر WalletConnect تحديث سجله حتى تتم إزالة هذه الرسالة الخاطئة. Sectora وعقودها موثّقة على Etherscan، والاتصال يقرأ عنوانك فقط.", "انسخ رابط الاتصال، وافتح محفظتك، وادخل إلى WalletConnect والصقه. ثم عد إلى هذه الصفحة.", "امسح رمز QR هذا بمحفظتك، أو انسخ رابط الاتصال والصقه في قسم WalletConnect فيها."], "hi": ["बिना अपने ब्राउज़र वाले वॉलेट · WalletConnect", "सिर्फ़ उन वॉलेट के लिए जिनका अपना ब्राउज़र नहीं है (Uniswap Wallet, Tangem, Ledger Live, Safe…)। जब तक WalletConnect हमारे डोमेन की समीक्षा कर रहा है, आपका वॉलेट गलती से सुरक्षा चेतावनी दिखा सकता है। इस समय WalletConnect अपने इतिहास के अपडेट का इंतज़ार कर रहा है, ताकि यह गलत संदेश हटाया जा सके। Sectora और उसके कॉन्ट्रैक्ट Etherscan पर सत्यापित हैं, और कनेक्ट करने पर सिर्फ़ आपका पता पढ़ा जाता है।", "कनेक्शन लिंक कॉपी करें, अपना वॉलेट खोलें, WalletConnect में जाकर पेस्ट करें। फिर इस टैब पर लौटें।", "इस QR कोड को अपने वॉलेट से स्कैन करें, या कनेक्शन लिंक कॉपी करके उसके WalletConnect सेक्शन में पेस्ट करें।"]};
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; d["hashdash.wallet.wcOnlyS"] = V[l][0]; d["hashdash.wallet.wcWarn"] = V[l][1]; d["hashdash.wallet.wcPaste"] = V[l][2]; d["hashdash.wallet.wcScanOnly"] = V[l][3]; });
})();
/* boton "Copiar enlace" de "Otra wallet" y boton para cerrar el panel de WalletConnect */
(function () {
  var V = {"en": ["Copy link", "Copied ✓", "Close WalletConnect"], "es": ["Copiar enlace", "Copiado ✓", "Cerrar WalletConnect"], "pt": ["Copiar link", "Copiado ✓", "Fechar WalletConnect"], "fr": ["Copier le lien", "Copié ✓", "Fermer WalletConnect"], "de": ["Link kopieren", "Kopiert ✓", "WalletConnect schließen"], "ru": ["Копировать ссылку", "Скопировано ✓", "Закрыть WalletConnect"], "zh": ["复制链接", "已复制 ✓", "关闭 WalletConnect"], "ja": ["リンクをコピー", "コピーしました ✓", "WalletConnect を閉じる"], "ko": ["링크 복사", "복사됨 ✓", "WalletConnect 닫기"], "ar": ["نسخ الرابط", "تم النسخ ✓", "إغلاق WalletConnect"], "hi": ["लिंक कॉपी करें", "कॉपी हो गया ✓", "WalletConnect बंद करें"]};
  var X = window.SECTORA_I18N_EXTRA = window.SECTORA_I18N_EXTRA || {};
  Object.keys(V).forEach(function (l) { var d = X[l] = X[l] || {}; d["hashdash.wallet.copyBtn"] = V[l][0]; d["hashdash.wallet.copiedBtn"] = V[l][1]; d["hashdash.wallet.closeWc"] = V[l][2]; });
})();
