/* Guia del Airdrop Genesis · Français (misma estructura que en.js) */
module.exports = {
  name: "Français", locale: "fr-FR", dir: "ltr",
  meta: {
    title: "Guide de l’Airdrop Genesis — Sectora Foundation",
    desc: "Guide pas à pas pour participer à l’Airdrop Genesis de Sectora : mettez vos #SECT en staking, allumez votre Hash Node avec le même wallet et vérifiez votre airdrop. Avec captures d’écran et PDF à télécharger."
  },
  nav: { sub: "Guide de l’airdrop", back: "Page de l’airdrop", pdf: "PDF", lang: "Langue" },
  common: {
    part: "Partie", step: "Étape", stepOf: "Étape {n} sur 16", illus: "Illustration · votre wallet peut être un peu différent",
    example: "Les captures montrent un wallet d’exemple (0x4b2f…4b3c) et des montants d’exemple. Votre écran montre les vôtres.",
    phone: "Sur téléphone", computer: "Sur ordinateur", yes: "OUI", no: "NON", minutes: "minutes", page: "page",
    stakingEnglish: "La page de staking est en anglais. Vous voyez ici chaque bouton tel qu’il apparaît, avec sa traduction entre parenthèses."
  },
  cover: {
    tag: "Guide officiel · Édition 1.1", kicker: "Airdrop Genesis · Guide de participation",
    h1: "Comment participer<br>à l’<b>airdrop</b> Sectora.",
    p: "Pas à pas, avec captures : de votre tout premier clic à un Hash Node allumé qui compte. Lisez une étape, faites-la, puis passez à la suivante.",
    parts: [["Partie A", "Mettez vos #SECT en staking", "Ethereum · étapes 1–7"], ["Partie B", "Allumez votre nœud", "Testnet gratuit · étapes 8–14"], ["Partie C", "Vérifiez votre airdrop", "Une minute · étapes 15–16"]],
    issued: "Publié par", entity: "Entité", activity: "Activité", activityV: "Entreprise de cybersécurité", location: "Adresse", locationV: "Chicago, Illinois, États-Unis",
    file: "Dossier Illinois", ein: "EIN", contracts: "Contrats officiels · Ethereum mainnet", token: "Jeton #SECT", staking: "Staking", web: "Site", support: "Support",
    date: "Octobre 2026 · Français"
  },
  toc: { k: "Sommaire", h: "Tout ce que contient ce guide", start: "Commencez ici", before: "Avant de commencer", problems: "Problèmes et support" },
  hero: {
    k: "Airdrop Genesis · Guide pas à pas",
    h1: "Comment participer à l’airdrop Sectora, <b>pas à pas.</b>",
    lede: "Ce guide vous mène de votre <strong>tout premier clic</strong> à un <strong>Hash Node allumé qui compte</strong>. Chaque étape dit exactement sur quoi appuyer, ce que vous devez voir et ce qu’il ne faut pas faire, avec une capture. Lisez une étape, faites-la, puis passez à la suivante. <strong>Environ 20 minutes.</strong>",
    pdf: "Télécharger le guide PDF", start: "Commencer le guide"
  },
  need: {
    k: "Tout l’airdrop en une phrase", h: "Il ne vous faut que deux choses, <b>avec le même wallet :</b>",
    r1: ["Des #SECT en staking", "Au moins 100 #SECT dans le staking officiel, sur Ethereum. Partie A."],
    r2: ["Votre Hash Node allumé", "Sur le réseau de test de Sectora. 100 % gratuit. Partie B."],
    foot: "Quand les deux sont vrais, votre compteur d’airdrop démarre tout seul. <b>Pas d’inscription, pas de formulaire.</b>"
  },
  already: {
    h: "Vous faites déjà du staking de #SECT ? Vous êtes déjà dedans.",
    p: "Vous n’avez rien d’autre à faire avec votre staking. <b>Ne retirez rien.</b> Passez la Partie A et allez directement à la Partie B : allumez simplement votre Hash Node <b>avec le même wallet que votre staking</b> et vous participez.",
    btn: "Aller à la Partie B"
  },
  map: [
    ["Partie A · étapes 1–7", "Mettez vos #SECT en staking", "Ethereum mainnet. Utilise vos vrais #SECT et un peu d’ETH pour les frais.", "≈ 5 minutes"],
    ["Partie B · étapes 8–14", "Allumez votre Hash Node", "Réseau de test de Sectora. Jetons de test gratuits : aucun argent réel.", "≈ 10 minutes"],
    ["Partie C · étapes 15–16", "Vérifiez votre airdrop", "Voyez votre niveau, votre prix et votre compteur qui monte.", "≈ 1 minute"]
  ],
  before: {
    k: "00 · Avant de commencer", h: "Préparez ces <b>quatre choses.</b>",
    items: [
      ["01", "Un wallet crypto", "MetaMask, Trust Wallet, Coinbase Wallet, OKX, Binance Wallet ou n’importe quel wallet Ethereum. Sur téléphone ou ordinateur."],
      ["02", "Au moins 100 #SECT", "Dans ce wallet. Vous n’en avez pas encore ? Achetez-les sur Uniswap avec notre <a href=\"/guide/\">guide d’achat pas à pas</a> (en anglais)."],
      ["03", "Un peu d’ETH", "Sur Ethereum, dans le même wallet. Il paie les frais du réseau (quelques dollars)."],
      ["04 · Le plus important", "UN seul wallet pour tout", "Votre staking et votre nœud doivent utiliser la <b>même adresse de wallet</b>. Utiliser deux wallets différents est l’erreur la plus fréquente."]
    ],
    rulesH: "Trois règles de sécurité. Ne les enfreignez jamais.",
    rules: "<b>1.</b> Ne donnez jamais à personne votre phrase secrète de récupération (les 12 ou 24 mots) ni votre clé privée. Sectora ne vous les demandera jamais. <b>2.</b> Utilisez uniquement <b>sectoraorg.com</b> : vérifiez la barre d’adresse à chaque fois. <b>3.</b> Personne chez Sectora ne vous écrira en premier pour vous « aider ». Si quelqu’un le fait, c’est une arnaque."
  },
  phone: {
    k: "Sur téléphone", h: "Vous utilisez un téléphone ? <b>Lisez ceci d’abord.</b>",
    p: "Tout ce guide fonctionne sur téléphone. Il vous faut seulement l’application de votre wallet (MetaMask, Trust Wallet, Coinbase Wallet…).",
    steps: [
      "<b>Staking (Partie A) :</b> ouvrez <b>sectoraorg.com/staking</b> dans Chrome ou Safari et appuyez sur {en:Connect wallet} (Connecter le wallet). Touchez votre application de wallet dans la liste, approuvez-y puis revenez au navigateur.",
      "<b>Nœud (Partie B) :</b> ouvrez <b>sectoraorg.com/dashboard</b> et appuyez sur {ui:connect}. Sur téléphone, {ui:openMM} (ou votre wallet) apparaît : touchez-le et le dashboard s’ouvre <b>dans l’application de votre wallet</b>. Continuez là-bas.",
      "<b>Dans l’application du wallet</b>, tout se connecte directement. Utilisez la même application de wallet pour tout."
    ],
    note: "Si l’application du wallet ne s’ouvre pas, ouvrez-la vous-même, trouvez son navigateur intégré (souvent appelé <b>Navigateur</b>, <b>Explorer</b> ou <b>Découvrir</b>) et tapez-y l’adresse."
  },
  parts: {
    A: { k: "Partie A · Étapes 1–7 · ≈ 5 minutes", h: "Mettez vos #SECT en staking", sub: "Vous placez vos #SECT dans le staking officiel. Ils restent à vous, rapportent des récompenses chaque seconde et comptent pour l’airdrop. Déjà en staking ? <a href=\"#part-b\">Passez à la Partie B</a>.", tags: ["Ethereum mainnet · vrais #SECT", "Un peu d’ETH pour les frais", "Sans blocage"] },
    B: { k: "Partie B · Étapes 8–14 · ≈ 10 minutes", h: "Allumez votre Hash Node", sub: "Le Hash Node fonctionne sur le réseau de test de Sectora (Sepolia). <b>Tout est gratuit dans la Partie B :</b> vous utilisez des jetons de test gratuits sans valeur. Ici, vous ne dépensez jamais d’argent réel.", tags: ["Gratuit · réseau de test", "Même wallet que votre staking", "Reste allumé tout seul"] },
    C: { k: "Partie C · Étapes 15–16 · ≈ 1 minute", h: "Vérifiez votre airdrop", sub: "Voyez votre niveau, votre prix et les trois conditions, lus en direct sur la blockchain. Regarder est gratuit : aucune signature, aucune transaction.", tags: ["Lecture seule · gratuit", "Quand vous voulez"] }
  },
  s: {
    1: { k: "Navigateur", h: "Ouvrez la page de staking",
      do: ["Ouvrez votre navigateur : Chrome, Safari ou le navigateur intégré à l’application de votre wallet.", "Tapez exactement <b>sectoraorg.com/staking</b> et ouvrez-la.", "Descendez jusqu’au cadre blanc appelé <b>« Staking console »</b>."],
      warn: "<b>Vérifiez la barre d’adresse.</b> La seule vraie page est <b>sectoraorg.com/staking</b>. Si c’est autre chose, fermez-la." },
    2: { k: "Console de staking", h: "Appuyez sur « Connect wallet »",
      do: ["En bas de la Staking console, il y a un grand bouton bleu.", "Appuyez sur {en:Connect wallet} (Connecter le wallet)."],
      cap: "La Staking console. Le bouton sur lequel appuyer est marqué en bleu." },
    3: { k: "Votre wallet", h: "Choisissez votre wallet",
      do: ["Une liste s’ouvre sous le bouton.", "<b>Sur ordinateur :</b> cliquez sur votre wallet (par exemple <b>MetaMask</b>). Votre wallet s’ouvre : cliquez sur <b>Se connecter</b>.", "<b>Sur téléphone (Chrome ou Safari) :</b> touchez l’application de votre wallet. Elle s’ouvre : appuyez sur <b>Se connecter</b> puis <b>revenez à l’onglet du navigateur</b>."],
      capPc: "Sur ordinateur : votre wallet de navigateur apparaît en premier.", capPhone: "Sur téléphone : la liste des applications de wallet." },
    4: { k: "Vérifier", h: "Vérifiez que vous êtes connecté",
      do: ["Regardez le grand bouton bleu : il affiche maintenant <b>l’adresse de votre wallet</b>, en abrégé, comme <code>0x4b2f…4b3c</code>.", "En dessous, trois boutons apparaissent : {en:Deposit #SECT} (Déposer) {en:Withdraw} (Retirer) {en:Withdraw all} (Tout retirer)."],
      see: "<b>C’est bon</b> si vous voyez votre adresse sur le bouton.",
      warn: "<b>Message rouge « Switch your wallet to the Ethereum network » ?</b> Cela veut dire « passez votre wallet sur le réseau Ethereum ». Ouvrez votre wallet, choisissez le réseau <b>Ethereum</b> (Ethereum Mainnet) et rechargez la page." },
    5: { k: "Montant", h: "Tapez combien de #SECT vous mettez en staking",
      do: ["Appuyez sur le cadre <b>« You deposit »</b> (Vous déposez).", "Tapez le nombre de #SECT. Seulement le nombre, par exemple <b>1000</b>. Sans points ni virgules."],
      how: "<b>Combien ?</b> Au moins <b>100 #SECT</b> pour participer à l’airdrop. Plus vous mettez, plus votre niveau est élevé :",
      prize: "prix {n} SECT", nomax: "sans maximum" },
    6: { k: "Wallet · confirmation 1 sur 2", h: "Appuyez sur « Deposit #SECT » et approuvez",
      do: ["Appuyez sur {en:Deposit #SECT} (Déposer des #SECT).", "Votre wallet s’ouvre et vous demande d’<b>approuver</b> un « plafond de dépense ». Cela permet seulement au contrat de staking de prendre <b>exactement</b> le montant tapé, jamais plus. Rien ne bouge encore.", "Vérifiez les informations ci-dessous, puis appuyez sur <b>Confirmer</b> dans votre wallet.", "<b>Attendez.</b> Ne fermez pas la page. Cela prend de quelques secondes à une minute."],
      checkH: "Vérifiez ceci dans votre wallet avant d’appuyer sur Confirmer",
      check: [["Demande", "Approuver · plafond de dépense"], ["Montant", "Exactement les #SECT que vous avez tapés"], ["Contrat", "<code>0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0</code>"], ["Frais", "Un peu d’ETH (votre wallet l’affiche)"]] },
    7: { k: "Wallet · confirmation 2 sur 2", h: "Confirmez le dépôt",
      do: ["Une fois l’approbation faite, votre wallet s’ouvre <b>une deuxième fois</b> tout seul, cette fois pour le <b>dépôt</b>.", "Appuyez de nouveau sur <b>Confirmer</b>. Attendez quelques secondes.", "Un cadre vert apparaît : <b>« Your rewards · accruing every second »</b> (vos récompenses, chaque seconde), avec <b>« Deposited »</b> (déposé) et votre montant."],
      cap: "Votre staking est fait : le dépôt s’affiche et vos récompenses montent chaque seconde.",
      warn: "<b>Laissez vos #SECT dans le staking.</b> Seuls les #SECT en staking comptent pour l’airdrop. Laissez-les jusqu’à la fin de votre durée. Vous gagnez toujours vos récompenses de staking normales.",
      done: ["Partie A terminée.", "Vos #SECT sont en staking. Allumez maintenant votre nœud avec ce même wallet."] },
    8: { k: "Dashboard", h: "Ouvrez le dashboard et appuyez sur « {ui:connect} »",
      do: ["Ouvrez <b>sectoraorg.com/dashboard</b>.", "En haut à droite, appuyez sur {ui:connect}.", "<b>Sur téléphone (Chrome ou Safari) :</b> une liste apparaît. Touchez {ui:openMM} (ou votre wallet) et le dashboard s’ouvre dans l’application de votre wallet. Là, appuyez de nouveau sur {ui:connect}."],
      warn: "<b>Utilisez le MÊME wallet que pour votre staking.</b> Si votre nœud est sur un autre wallet, il ne compte pas pour votre airdrop.",
      lang: "Le dashboard s’ouvre en anglais. Passez-le en français avec le menu des drapeaux en haut : vous le verrez comme sur ces captures.",
      capPhone: "Sur téléphone : {ui:connect} en haut.", capPhone2: "Sur téléphone sans wallet : {ui:openMM}." },
    9: { k: "Votre wallet", h: "Choisissez votre wallet et acceptez le réseau de test",
      do: ["Dans la liste <b>« {ui:wselTitle} »</b>, appuyez sur votre wallet (il indique <b>{ui:detected}</b>).", "Dans votre wallet, appuyez sur <b>Se connecter</b>.", "Le dashboard passe votre wallet sur le réseau de test <b>Sepolia</b> tout seul. Si votre wallet demande de changer ou d’ajouter le réseau, appuyez sur <b>Approuver</b> ou <b>Changer de réseau</b>."],
      tip: "<b>Votre wallet n’affiche pas Sepolia ?</b> Ouvrez les réglages de votre wallet et activez <b>« Afficher les réseaux de test »</b>. Puis réessayez." },
    10: { k: "Gas gratuit", h: "Obtenez de l’ETH Sepolia gratuit pour le gas",
      do: ["Chaque action sur le réseau de test demande un peu d’<b>ETH Sepolia</b>. C’est un jeton de test gratuit, sans valeur.", "Dans le dashboard, descendez un peu jusqu’à <b>« {ui:howTitle} »</b>. Dans le cadre <b>02 « {ui:howGas} »</b>, appuyez sur {ui:howGasBtn}.", "Une page Google Cloud s’ouvre (en anglais). Vérifiez que le réseau est <b>Ethereum Sepolia</b>, collez l’adresse de votre wallet dans <b>« Wallet address or ENS name »</b> et appuyez sur <b>Get 0.05 Sepolia ETH</b>. Si on vous le demande, connectez-vous avec un compte Google.", "Revenez à l’onglet du dashboard."],
      copy: "<b>Comment copier mon adresse ?</b> Ouvrez votre wallet et touchez le nom de votre compte ou votre adresse en haut : elle se copie toute seule.",
      warn: "<b>Google dit qu’il faut 0.001 ETH sur Ethereum Mainnet ?</b> Le faucet de Google ne donne de l’ETH Sepolia qu’aux wallets qui ont au moins 0,001 vrai ETH sur Ethereum. Gardez un peu d’ETH dans votre wallet (il vous le faut pour la Partie A de toute façon) et réessayez.",
      capHow: "Dans le dashboard : {ui:howTitle} → cadre 02 → {ui:howGasBtn}.", capDash: "Le même bouton se trouve aussi plus bas, dans {ui:tnTitle}.", capGoogle: "Le faucet Google Cloud : (1) votre adresse · (2) Get 0.05 Sepolia ETH." },
    11: { k: "Jetons de test gratuits", h: "Réclamez 5 000 tSECT gratuits",
      do: ["Dans le même cadre, appuyez sur {ui:faucetBtn}.", "Votre wallet s’ouvre : appuyez sur <b>Confirmer</b>.", "Attendez quelques secondes. <b>« {ui:balance} »</b> affiche maintenant <b>5 000 tSECT</b>."],
      tip: "Les tSECT sont des <b>jetons de test sans valeur monétaire</b>. Vous pouvez les réclamer à nouveau toutes les 24 heures." },
    12: { k: "Marché du hash", h: "Achetez le Node Kit · 50 TH/s",
      do: ["Descendez jusqu’à <b>« {ui:market} »</b>.", "Ouvrez l’onglet {ui:physical} <b>(1)</b>.", "Appuyez sur la carte <b>50 TH/s · 4 300 tSECT</b>, marquée <b>{ui:airdropPlan}</b> <b>(2)</b>. C’est le nœud qui compte pour l’airdrop.", "Appuyez sur {ui:buy50} <b>(3)</b>.", "Votre wallet s’ouvre <b>deux fois</b> : d’abord pour autoriser le paiement, puis pour confirmer l’achat. Appuyez sur <b>Confirmer</b> les deux fois."],
      cap1: "(1) {ui:physical} · (2) 50 TH/s · {ui:airdropPlan}", cap2: "(3) {ui:buy50}",
      see: "Les 4 300 tSECT viennent des 5 000 tSECT gratuits de l’étape 11. <b>Aucun argent réel.</b>" },
    13: { k: "Votre nœud", h: "Enregistrez votre nœud. L’emplacement est automatique.",
      do: ["Descendez jusqu’à <b>« {ui:node} »</b>.", "L’emplacement de votre nœud est <b>déjà détecté (1)</b> et son nom est <b>déjà rempli</b>. Vous ne tapez rien.", "Appuyez sur {ui:register} <b>(2)</b>.", "Votre wallet s’ouvre : appuyez sur <b>Confirmer</b>."],
      cap: "(1) Emplacement détecté automatiquement · (2) {ui:register}",
      tip: "<b>À propos de l’emplacement.</b> Nos systèmes détectent l’emplacement approximatif de votre nœud grâce à votre connexion et le remplissent pour vous. Seule la <b>ville</b> est enregistrée sur le réseau, <b>jamais votre adresse</b>. L’emplacement est faux (par exemple à cause d’un VPN) ? Appuyez sur <b>« {ui:change} »</b> et corrigez-le.",
      planH: "Étape 13 · Plan B · seulement si vous voyez « {ui:geoFail} »",
      plan: [["Pourquoi", "Parfois un VPN, un bloqueur de publicité ou un navigateur très strict empêche la détection. Deux cases apparaissent alors : <b>{ui:lat}</b> et <b>{ui:lon}</b>."],
        ["Trouvez les nombres", "Ouvrez Google Maps et cherchez <b>votre ville</b>. Sur ordinateur, faites un clic droit au centre de la ville ; sur téléphone, appuyez longuement. Vous voyez deux nombres, comme <code>40.4168, -3.7038</code>."],
        ["Remplissez", "Le <b>premier</b> nombre va dans <b>{ui:lat} (1)</b>. Le <b>deuxième</b> nombre va dans <b>{ui:lon} (2)</b>. Gardez le signe moins s’il y en a un."],
        ["Ensuite", "Appuyez sur {ui:register} et confirmez dans votre wallet. Utilisez votre ville, pas votre domicile."]],
      planCap: "Seulement quand l’emplacement n’a pas pu être détecté : (1) {ui:lat} · (2) {ui:lon}" },
    14: { k: "Terminé", h: "Terminé : votre nœud est allumé",
      do: ["Le bouton devient {ui:registered}.", "Votre nœud apparaît sur la carte du réseau. À partir de maintenant, il compte."],
      onoff: [["OUI", "Vous pouvez fermer l’onglet", "Votre nœud reste allumé tout seul sur le réseau."], ["OUI", "Vous pouvez éteindre votre ordinateur", "Votre nœud ne dépend ni de votre ordinateur ni de votre téléphone."], ["NON", "Ne désactivez jamais votre nœud", "N’appuyez sur aucun bouton et ne signez aucune transaction qui désactive ou éteint votre nœud. Tant qu’il est éteint, il ne compte plus jusqu’à ce que vous le rallumiez."]],
      done: ["Partie B terminée. Vous êtes dans l’airdrop.", "Staking + nœud allumé, avec le même wallet. Votre compteur tourne."] },
    15: { k: "Mon Airdrop", h: "Ouvrez Mon Airdrop",
      do: ["Ouvrez <b>sectoraorg.com/myairdrop</b>.", "Appuyez sur {ui:myConnect}, ou collez l’adresse de votre wallet et appuyez sur {ui:myCheck}.", "Vous voyez ce que vous avez déjà gagné, votre <b>niveau</b>, votre <b>prix</b> et les trois conditions."],
      cap: "Exemple : 1 000 #SECT en staking = Guardian, prix 750 SECT.",
      checkH: "Les trois conditions",
      check: [["✓ 100+ SECT en staking", "Fait dans la Partie A."], ["✓ Hash Node allumé", "Fait dans la Partie B."], ["30 jours dedans", "Démarre tout seul quand les deux conditions ci-dessus sont remplies. Attendez et ne touchez à rien."]] },
    16: { k: "Page de l’airdrop", h: "Vérification rapide sur la page de l’airdrop",
      do: ["Ouvrez la page de l’airdrop, <b>sectoraorg.com/airdrop</b>, et appuyez sur {ui:takePart}.", "Connectez votre wallet. La fenêtre <b>« Votre airdrop »</b> montre ce que vous avez déjà gagné, votre prix et votre niveau."],
      cap1: "La page de l’airdrop : appuyez sur {ui:takePart}.", cap2: "Exemple de la fenêtre « Votre airdrop ».",
      see: "<b>Quand vais-je recevoir mes SECT ?</b> Sur SectoraEVM, lors de son lancement sur le mainnet. Vous pourrez le suivre sur <a href=\"/sectorascan/\">SectoraScan</a>." }
  },
  wallet: {
    site: "sectoraorg.com",
    connect: { h: "Se connecter à ce site", p: "sectoraorg.com veut voir l’adresse de votre compte et vous demander d’approuver des actions.", no: "Annuler", yes: "Se connecter" },
    approve: { h: "Demande de plafond de dépense", rows: [["Jeton", "#SECT"], ["Plafond", "1 000 SECT"], ["Bénéficiaire", "0x79Cb…20E0"], ["Frais de réseau", "payés en ETH"]], no: "Refuser", yes: "Confirmer" },
    deposit: { h: "Demande de transaction", rows: [["Interagit avec", "0x79Cb…20E0"], ["Action", "Dépôt"], ["Frais de réseau", "payés en ETH"]], no: "Refuser", yes: "Confirmer" },
    sw: { h: "Autoriser ce site à changer de réseau ?", from: "Ethereum", to: "Sepolia", no: "Annuler", yes: "Changer de réseau" }
  },
  faq: {
    k: "Problèmes · réponses rapides", h: "Quelque chose n’a pas marché ? <b>Regardez ici d’abord.</b>",
    items: [
      ["« Not enough ETH » sur la page de staking", "La Partie A utilise le vrai Ethereum. Ajoutez un peu d’ETH (sur Ethereum) au même wallet et réessayez."],
      ["« Gas insuffisant » sur le dashboard", "La Partie B utilise de l’ETH Sepolia gratuit. Refaites l’<a href=\"#step-10\">étape 10</a>."],
      ["Le faucet Google demande 0.001 ETH sur Ethereum", "Votre wallet doit avoir au moins 0,001 vrai ETH sur Ethereum pour utiliser le faucet de Google. Gardez-en un peu et réessayez, ou écrivez au support."],
      ["Mon wallet n’affiche pas Sepolia", "Dans les réglages de votre wallet, activez « Afficher les réseaux de test ». Puis rechargez le dashboard."],
      ["« Switch your wallet to the Ethereum network »", "Vous êtes sur la page de staking avec le mauvais réseau. Dans votre wallet, choisissez Ethereum (Ethereum Mainnet) et rechargez."],
      ["« You do not have that many #SECT in your wallet »", "Cela veut dire que vous n’avez pas autant de #SECT. Tapez un montant plus petit, ou achetez-en avec notre <a href=\"/guide/\">guide d’achat</a>."],
      ["Je n’ai pas assez de tSECT pour le Node Kit", "Réclamez 5 000 tSECT à l’<a href=\"#step-11\">étape 11</a>. Déjà réclamé aujourd’hui ? Attendez 24 heures et réclamez à nouveau."],
      ["J’ai utilisé un autre wallet pour le nœud", "Il ne compte pas. Connectez votre <b>wallet de staking</b> sur le dashboard et refaites la Partie B avec lui."],
      ["L’emplacement n’a pas été détecté, ou il est faux", "Appuyez sur « {ui:change} », ou suivez le Plan B de l’<a href=\"#step-13\">étape 13</a>. Utilisez votre ville, pas votre domicile."],
      ["La fenêtre du wallet ne s’est pas ouverte", "Ouvrez vous-même l’application ou l’extension du wallet : la demande vous y attend. Sur téléphone, après avoir approuvé, revenez à l’onglet du navigateur."],
      ["Dois-je laisser mon ordinateur allumé ?", "Non. Une fois enregistré, votre nœud reste allumé tout seul. Ne le désactivez simplement jamais."],
      ["Dois-je retirer mon staking pour participer ?", "Non. Jamais. Vos #SECT en staking comptent tels quels, et vous continuez à gagner vos récompenses de staking."],
      ["La Partie B coûte-t-elle de l’argent ?", "Non. Les tSECT et l’ETH Sepolia sont des jetons de test gratuits et sans valeur."]
    ]
  },
  help: {
    k: "Support", h: "Toujours bloqué ? <b>Écrivez-nous.</b>",
    p: "Envoyez un e-mail à notre équipe de support avec l’objet <b>« Airdrop Connection »</b>. Pour vous aider vite, indiquez :",
    list: ["L’adresse <b>publique</b> de votre wallet (commence par 0x).", "Le <b>numéro de l’étape</b> où vous êtes bloqué.", "Une <b>capture d’écran</b> de l’erreur."],
    email: "E-mail", subject: "Objet", subjectV: "Airdrop Connection", btn: "Écrire au support",
    never: "N’envoyez <b>jamais</b> votre phrase de récupération (12 ou 24 mots) ni votre clé privée. Ni à nous, ni à personne."
  },
  foot: {
    legal: "<b>Sectora Foundation IL</b> · Entreprise de cybersécurité · Chicago, Illinois, États-Unis · Dossier Illinois 18523639 · EIN 32-0868576",
    token: "Jeton #SECT (Ethereum, ERC-20)", staking: "Contrat de staking", support: "Support : support@sectoraorg.com · Objet « Airdrop Connection »",
    online: "Version en ligne avec liens : sectoraorg.com/airdrop-guide/fr",
    nav: ["Airdrop", "Staking", "Hash Node", "Mon Airdrop", "Mentions légales"]
  }
};
