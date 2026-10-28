/* Guia del Airdrop Genesis · Deutsch (misma estructura que en.js) */
module.exports = {
  name: "Deutsch", locale: "de-DE", dir: "ltr",
  meta: {
    title: "Anleitung zum Airdrop Genesis — Sectora Foundation",
    desc: "Schritt-für-Schritt-Anleitung für den Sectora Airdrop Genesis: #SECT staken, den Hash Node mit derselben Wallet einschalten und den Airdrop prüfen. Mit Screenshots und PDF zum Herunterladen."
  },
  nav: { sub: "Airdrop-Anleitung", back: "Airdrop-Seite", pdf: "PDF", lang: "Sprache" },
  common: {
    part: "Teil", step: "Schritt", stepOf: "Schritt {n} von 16", illus: "Illustration · deine Wallet kann etwas anders aussehen",
    example: "Die Screenshots zeigen eine Beispiel-Wallet (0x4b2f…4b3c) und Beispielbeträge. Auf deinem Bildschirm siehst du deine eigenen.",
    phone: "Auf dem Handy", computer: "Am Computer", yes: "JA", no: "NEIN", minutes: "Minuten", page: "Seite",
    stakingEnglish: "Die Staking-Seite öffnet sich auf Englisch; die Sprache änderst du mit der Flagge oben rechts. Hier siehst du jeden Button so, wie er auf Englisch dort steht, mit der Übersetzung in Klammern."
  },
  cover: {
    tag: "Offizielle Anleitung · Ausgabe 1.1", kicker: "Airdrop Genesis · Anleitung zur Teilnahme",
    h1: "So nimmst du<br>am Sectora-<b>Airdrop</b> teil.",
    p: "Schritt für Schritt, mit Screenshots: vom allerersten Klick bis zu einem Hash Node, der läuft und zählt. Lies einen Schritt, mach ihn, dann den nächsten.",
    parts: [["Teil A", "#SECT staken", "Ethereum · Schritte 1–7"], ["Teil B", "Node einschalten", "Gratis-Testnet · Schritte 8–14"], ["Teil C", "Airdrop prüfen", "Nur lesen · Schritte 15–16"]],
    issued: "Herausgeber", entity: "Unternehmen", activity: "Tätigkeit", activityV: "Cybersecurity-Unternehmen", location: "Standort", locationV: "Chicago, Illinois, Vereinigte Staaten",
    file: "Illinois-Registernr.", ein: "EIN", contracts: "Offizielle Verträge · Ethereum Mainnet", token: "#SECT-Token", staking: "Staking", web: "Website", support: "Support",
    date: "Oktober 2026 · Deutsch"
  },
  toc: { k: "Inhalt", h: "Alles in dieser Anleitung", start: "Hier beginnen", before: "Bevor du startest", problems: "Probleme und Support" },
  hero: {
    k: "Airdrop Genesis · Schritt-für-Schritt-Anleitung",
    h1: "So nimmst du am Sectora-Airdrop teil, <b>Schritt für Schritt.</b>",
    lede: "Diese Anleitung führt dich vom <strong>allerersten Klick</strong> bis zu einem <strong>Hash Node, der läuft und zählt</strong>. Jeder Schritt sagt genau, was du drücken musst, was du sehen solltest und was du nicht tun darfst, mit Screenshot. Lies einen Schritt, mach ihn, dann den nächsten.",
    pdf: "PDF-Anleitung herunterladen", start: "Anleitung starten"
  },
  need: {
    k: "Der ganze Airdrop in einem Satz", h: "Du brauchst nur zwei Dinge, <b>mit derselben Wallet:</b>",
    r1: ["#SECT im Staking", "Mindestens 100 #SECT im offiziellen Staking, auf Ethereum. Teil A."],
    r2: ["Dein Hash Node eingeschaltet", "Im Testnetz von Sectora. 100 % kostenlos. Teil B."],
    foot: "Wenn beides stimmt, startet dein Airdrop-Zähler von selbst. <b>Keine Anmeldung, keine Formulare.</b>"
  },
  already: {
    h: "Du stakest schon #SECT? Dann bist du schon dabei.",
    p: "Mit deinem Staking musst du nichts weiter tun. <b>Zieh nichts ab.</b> Überspring Teil A und geh direkt zu Teil B: Schalte einfach deinen Hash Node <b>mit derselben Wallet ein, mit der du stakest</b>, und du bist dabei.",
    btn: "Zu Teil B"
  },
  map: [
    ["Teil A · Schritte 1–7", "#SECT staken", "Ethereum Mainnet. Nutzt deine echten #SECT und etwas ETH für die Gebühr."],
    ["Teil B · Schritte 8–14", "Hash Node einschalten", "Testnetz von Sectora. Gratis-Testcoins: du gibst kein echtes Geld aus."],
    ["Teil C · Schritte 15–16", "Airdrop prüfen", "Sieh dein Level, deinen Preis und deinen Zähler wachsen."]
  ],
  before: {
    k: "00 · Bevor du startest", h: "Leg diese <b>vier Dinge</b> bereit.",
    items: [
      ["01", "Eine Krypto-Wallet", "MetaMask, Trust Wallet, Coinbase Wallet, OKX, Binance Wallet oder jede Ethereum-Wallet. Auf dem Handy oder am Computer."],
      ["02", "Mindestens 100 #SECT", "In dieser Wallet. Noch keine? Kauf sie auf Uniswap mit unserer <a href=\"/guide/\">Kaufanleitung</a> (auf Englisch)."],
      ["03", "Etwas ETH", "Auf Ethereum, in derselben Wallet. Damit zahlst du die Netzwerkgebühren (ein paar Dollar)."],
      ["04 · Am wichtigsten", "EINE Wallet für alles", "Dein Staking und dein Node müssen <b>dieselbe Wallet-Adresse</b> nutzen. Zwei verschiedene Wallets sind der häufigste Fehler."]
    ],
    rulesH: "Drei Sicherheitsregeln. Brich sie nie.",
    rules: "<b>1.</b> Gib niemandem deine geheime Wiederherstellungsphrase (die 12 oder 24 Wörter) oder deinen privaten Schlüssel. Sectora fragt nie danach. <b>2.</b> Nutze nur <b>sectoraorg.com</b>: prüfe jedes Mal die Adressleiste. <b>3.</b> Niemand von Sectora schreibt dir zuerst, um dir zu „helfen“. Wenn das jemand tut, ist es Betrug."
  },
  devices: { k: "Computer oder Handy", h: "Computer oder Handy? <b>Beides geht.</b>",
    p: "Nimm, was du hast. Die Schritte sind gleich: Nur wie sich deine Wallet öffnet, ist anders." },
  computer: {
    h: "Am Computer? <b>So geht’s.</b>",
    p: "Am Computer ist deine Wallet eine <b>Browser-Erweiterung</b> (Chrome, Brave oder Edge). Sie öffnet sich als kleines Fenster oben rechts.",
    steps: [
      "<b>Installiere deine Wallet</b> in Chrome, Brave oder Edge (zum Beispiel MetaMask, nur von der offiziellen Website). Öffne sie und entsperre sie mit deinem Passwort.",
      "<b>Staking (Teil A):</b> Öffne <b>sectoraorg.com/staking</b> und klicke auf {en:Connect wallet} (Wallet verbinden). Klicke in der Liste auf deine Wallet <b>(1)</b>. Das Wallet-Fenster öffnet sich oben rechts: Klicke auf <b>Verbinden</b> <b>(2)</b>.",
      "<b>Node (Teil B):</b> Öffne <b>sectoraorg.com/dashboard</b> im selben Browser, klicke auf {ui:connect} und wähle <b>dieselbe Wallet</b>."
    ],
    note: "<b>Du siehst das Wallet-Fenster nicht?</b> Klicke oben rechts im Browser auf das Puzzle-Symbol und dann auf deine Wallet. <b>Keine Erweiterung?</b> Wähle in der Liste {en:Wallet on your phone} (Wallet auf deinem Handy) und scanne den QR-Code mit dem Handy.",
    cap: "(1) Deine Wallet in der Liste · (2) Verbinden im Wallet-Fenster."
  },
  phone: {
    k: "Auf dem Handy", h: "Du nutzt ein Handy? <b>Lies das zuerst.</b>",
    p: "Alles in dieser Anleitung funktioniert auf dem Handy. Du brauchst nur die App deiner Wallet (MetaMask, Trust Wallet, Coinbase Wallet …).",
    steps: [
      "<b>Staking (Teil A):</b> Öffne <b>sectoraorg.com/staking</b> in Chrome oder Safari und tippe auf {en:Connect wallet} (Wallet verbinden). Tippe in der Liste auf deine Wallet-App, bestätige dort und geh zurück in den Browser.",
      "<b>Node (Teil B):</b> Öffne <b>sectoraorg.com/dashboard</b> und tippe auf {ui:connect}. Auf dem Handy erscheint {ui:openMM} (oder deine Wallet): Tippe darauf und das Dashboard öffnet sich <b>in deiner Wallet-App</b>. Mach dort weiter.",
      "<b>In der Wallet-App</b> verbindet sich alles direkt. Nutze für alles dieselbe Wallet-App."
    ],
    note: "Öffnet sich die Wallet-App nicht, öffne sie selbst, such ihren eingebauten Browser (oft <b>Browser</b>, <b>Entdecken</b> oder <b>Explore</b> genannt) und gib dort die Adresse ein."
  },
  parts: {
    A: { k: "Teil A · Schritte 1–7", h: "#SECT staken", sub: "Du legst deine #SECT ins offizielle Staking. Sie bleiben deine, bringen jede Sekunde Belohnungen und zählen für den Airdrop. Du stakest schon? <a href=\"#part-b\">Spring zu Teil B</a>.", tags: ["Ethereum Mainnet · echte #SECT", "Etwas ETH für Gebühren nötig", "Keine Sperrfrist"] },
    B: { k: "Teil B · Schritte 8–14", h: "Hash Node einschalten", sub: "Der Hash Node läuft im Testnetz von Sectora (Sepolia). <b>Alles in Teil B ist kostenlos:</b> du nutzt Gratis-Testcoins ohne Wert. Hier gibst du nie echtes Geld aus.", tags: ["Gratis · Testnetz", "Dieselbe Wallet wie beim Staking", "Bleibt von selbst an"] },
    C: { k: "Teil C · Schritte 15–16", h: "Airdrop prüfen", sub: "Sieh dein Level, deinen Preis und die drei Bedingungen, live aus der Blockchain gelesen. Ansehen ist kostenlos: keine Signatur, keine Transaktion.", tags: ["Nur lesen · gratis", "Jederzeit"] }
  },
  s: {
    1: { k: "Browser", h: "Öffne die Staking-Seite",
      do: ["Öffne deinen Browser: Chrome, Safari oder den Browser in deiner Wallet-App.", "Gib genau <b>sectoraorg.com/staking</b> ein und öffne die Seite.", "Scroll nach unten, bis du den weißen Kasten <b>„Staking console“</b> siehst."],
      warn: "<b>Prüf die Adressleiste.</b> Die einzige echte Seite ist <b>sectoraorg.com/staking</b>. Steht dort etwas anderes, schließ sie." },
    2: { k: "Staking-Konsole", h: "Drück auf „Connect wallet“",
      do: ["Unten in der Staking console ist ein großer blauer Button.", "Drück auf {en:Connect wallet} (Wallet verbinden)."],
      cap: "Die Staking console. Der Button, den du drückst, ist blau markiert." },
    3: { k: "Deine Wallet", h: "Wähle deine Wallet",
      do: ["Unter dem Button öffnet sich eine Liste.", "<b>Am Computer:</b> Klick auf deine Wallet (zum Beispiel <b>MetaMask</b>). Deine Wallet öffnet sich: klick auf <b>Verbinden</b>.", "<b>Auf dem Handy (Chrome oder Safari):</b> Tippe auf deine Wallet-App. Die App öffnet sich: tippe dort auf <b>Verbinden</b> und <b>geh dann zurück zum Browser-Tab</b>."],
      capPc: "Am Computer: deine Browser-Wallet steht ganz oben.", capPhone: "Auf dem Handy: die Liste der Wallet-Apps." },
    4: { k: "Prüfen", h: "Prüfe, ob du verbunden bist",
      do: ["Schau auf den großen blauen Button: Er zeigt jetzt <b>deine Wallet-Adresse</b>, gekürzt, etwa <code>0x4b2f…4b3c</code>.", "Darunter stehen jetzt drei Buttons: {en:Deposit #SECT} (Einzahlen) {en:Withdraw} (Abheben) {en:Withdraw all} (Alles abheben)."],
      see: "<b>Es hat geklappt</b>, wenn du deine Adresse auf dem Button siehst.",
      warn: "<b>Rote Meldung „Switch your wallet to the Ethereum network“?</b> Das heißt: „Stell deine Wallet auf das Ethereum-Netzwerk um“. Öffne deine Wallet, wähle das Netzwerk <b>Ethereum</b> (Ethereum Mainnet) und lade die Seite neu." },
    5: { k: "Betrag", h: "Gib ein, wie viele #SECT du stakest",
      do: ["Drück auf das Feld <b>„You deposit“</b> (Du zahlst ein).", "Gib die Anzahl #SECT ein. Nur die Zahl, zum Beispiel <b>1000</b>. Ohne Punkte, ohne Kommas."],
      how: "<b>Wie viel?</b> Mindestens <b>100 #SECT</b>, um am Airdrop teilzunehmen. Je mehr du stakest, desto höher dein Level:",
      prize: "Preis {n} SECT", nomax: "ohne Obergrenze" },
    6: { k: "Wallet · Bestätigung 1 von 2", h: "Drück auf „Deposit #SECT“ und genehmige",
      do: ["Drück auf {en:Deposit #SECT} (#SECT einzahlen).", "Deine Wallet öffnet sich und fragt nach einer <b>Genehmigung</b> („Ausgabelimit“). Damit darf der Staking-Vertrag nur <b>genau</b> den eingegebenen Betrag nehmen, nie mehr. Noch bewegt sich nichts.", "Prüf die Angaben unten und drück dann in deiner Wallet auf <b>Bestätigen</b>.", "<b>Warte.</b> Schließ die Seite nicht. Es dauert ein paar Sekunden bis eine Minute."],
      checkH: "Prüf das in deiner Wallet, bevor du auf Bestätigen drückst",
      check: [["Anfrage", "Genehmigen · Ausgabelimit"], ["Betrag", "Genau die #SECT, die du eingegeben hast"], ["Vertrag", "<code>0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0</code>"], ["Gebühr", "Etwas ETH (deine Wallet zeigt sie an)"]] },
    7: { k: "Wallet · Bestätigung 2 von 2", h: "Bestätige die Einzahlung",
      do: ["Ist die Genehmigung fertig, öffnet sich deine Wallet <b>ein zweites Mal</b> von selbst, jetzt für die <b>Einzahlung</b>.", "Drück wieder auf <b>Bestätigen</b>. Warte ein paar Sekunden.", "Ein grüner Kasten erscheint: <b>„Your rewards · accruing every second“</b> (deine Belohnungen, jede Sekunde), mit <b>„Deposited“</b> (eingezahlt) und deinem Betrag."],
      cap: "Dein Staking ist fertig: die Einzahlung erscheint und deine Belohnungen wachsen jede Sekunde.",
      warn: "<b>Lass deine #SECT im Staking.</b> Nur gestakte #SECT zählen für den Airdrop. Lass sie dort, bis deine Zeit voll ist. Deine normalen Staking-Belohnungen bekommst du weiterhin.",
      done: ["Teil A erledigt.", "Deine #SECT sind gestakt. Schalte jetzt deinen Node mit derselben Wallet ein."] },
    8: { k: "Dashboard", h: "Öffne das Dashboard und drück auf „{ui:connect}“",
      do: ["Öffne <b>sectoraorg.com/dashboard</b>.", "Oben rechts drückst du auf {ui:connect}.", "<b>Auf dem Handy (Chrome oder Safari):</b> Eine Liste erscheint. Tippe auf {ui:openMM} (oder deine Wallet) und das Dashboard öffnet sich in deiner Wallet-App. Drück dort noch einmal auf {ui:connect}."],
      warn: "<b>Nutze DIESELBE Wallet wie beim Staking.</b> Läuft dein Node auf einer anderen Wallet, zählt er nicht für deinen Airdrop.",
      lang: "Das Dashboard öffnet sich auf Englisch. Stell es oben im Flaggen-Menü auf Deutsch um: Dann sieht es aus wie auf diesen Screenshots.",
      capPhone: "Auf dem Handy: {ui:connect} oben.", capPhone2: "Auf dem Handy ohne Wallet: {ui:openMM}." },
    9: { k: "Deine Wallet", h: "Wähle deine Wallet und akzeptiere das Testnetz",
      do: ["Drück in der Liste <b>„{ui:wselTitle}“</b> auf deine Wallet (dort steht <b>{ui:detected}</b>).", "Drück in deiner Wallet auf <b>Verbinden</b>.", "Das Dashboard stellt deine Wallet von selbst auf das Testnetz <b>Sepolia</b> um. Fragt deine Wallet, ob sie das Netzwerk wechseln oder hinzufügen darf, drück auf <b>Genehmigen</b> oder <b>Netzwerk wechseln</b>."],
      tip: "<b>Deine Wallet zeigt Sepolia nicht?</b> Öffne die Einstellungen deiner Wallet und schalte <b>„Testnetzwerke anzeigen“</b> ein. Dann versuch es noch einmal." },
    10: { k: "Gratis-Gas", h: "Hol dir kostenloses Sepolia-ETH für Gas",
      do: ["Jede Aktion im Testnetz braucht etwas <b>Sepolia-ETH</b>. Das ist ein kostenloser Testcoin ohne Wert.", "Scroll im Dashboard ein Stück nach unten zu <b>„{ui:howTitle}“</b>. Drück im Kasten <b>02 „{ui:howGas}“</b> auf {ui:howGasBtn}.", "Eine Google-Cloud-Seite öffnet sich (auf Englisch). Prüf, dass das Netzwerk <b>Ethereum Sepolia</b> ist, füg deine Wallet-Adresse in <b>„Wallet address or ENS name“</b> ein und drück auf <b>Get 0.05 Sepolia ETH</b>. Wenn verlangt, melde dich mit einem Google-Konto an.", "Geh zurück zum Dashboard-Tab."],
      copy: "<b>Wie kopiere ich meine Adresse?</b> Öffne deine Wallet und tippe oben auf deinen Kontonamen oder deine Adresse: Sie wird von selbst kopiert.",
      warn: "<b>Google sagt, du brauchst 0.001 ETH auf Ethereum Mainnet?</b> Der Google-Faucet gibt Sepolia-ETH nur an Wallets mit mindestens 0,001 echtem ETH auf Ethereum. Lass etwas ETH in deiner Wallet (für Teil A brauchst du es sowieso) und versuch es erneut.",
      capHow: "Im Dashboard: {ui:howTitle} → Kasten 02 → {ui:howGasBtn}.", capDash: "Denselben Button gibt es weiter unten auch in {ui:tnTitle}.", capGoogle: "Der Google-Cloud-Faucet: (1) deine Adresse · (2) Get 0.05 Sepolia ETH." },
    11: { k: "Gratis-Testtokens", h: "Hol dir 5.000 kostenlose tSECT",
      do: ["Drück im selben Kasten auf {ui:faucetBtn}.", "Deine Wallet öffnet sich: Drück auf <b>Bestätigen</b>.", "Warte ein paar Sekunden. <b>„{ui:balance}“</b> zeigt jetzt <b>5.000 tSECT</b>."],
      tip: "tSECT sind <b>Testtokens ohne Geldwert</b>. Du kannst sie alle 24 Stunden erneut abholen." },
    12: { k: "Hash-Markt", h: "Kauf das Node Kit · 50 TH/s",
      do: ["Scroll zu <b>„{ui:market}“</b>.", "Öffne den Tab {ui:physical} <b>(1)</b>.", "Drück auf die Karte <b>50 TH/s · 4.300 tSECT</b>, markiert mit <b>{ui:airdropPlan}</b> <b>(2)</b>. Das ist der Node, der für den Airdrop zählt.", "Drück auf {ui:buy50} <b>(3)</b>.", "Deine Wallet öffnet sich <b>zweimal</b>: zuerst, um die Zahlung zu erlauben, dann, um den Kauf zu bestätigen. Drück beide Male auf <b>Bestätigen</b>."],
      cap1: "(1) {ui:physical} · (2) 50 TH/s · {ui:airdropPlan}", cap2: "(3) {ui:buy50}",
      see: "Die 4.300 tSECT kommen aus den 5.000 Gratis-tSECT von Schritt 11. <b>Kein echtes Geld.</b>" },
    13: { k: "Dein Node", h: "Registriere deinen Node. Der Standort kommt automatisch.",
      do: ["Scroll zu <b>„{ui:node}“</b>.", "Der Standort deines Nodes ist <b>schon erkannt (1)</b> und sein Name ist <b>schon eingetragen</b>. Du tippst nichts ein.", "Drück auf {ui:register} <b>(2)</b>.", "Deine Wallet öffnet sich: Drück auf <b>Bestätigen</b>."],
      cap: "(1) Standort automatisch erkannt · (2) {ui:register}",
      tip: "<b>Zum Standort.</b> Unsere Systeme erkennen den ungefähren Standort deines Nodes über deine Verbindung und tragen ihn für dich ein. Im Netzwerk wird nur die <b>Stadt</b> gespeichert, <b>nie deine Adresse</b>. Der Standort stimmt nicht (zum Beispiel wegen eines VPN)? Drück auf <b>„{ui:change}“</b> und korrigiere ihn.",
      planH: "Schritt 13 · Plan B · nur wenn du „{ui:geoFail}“ siehst",
      plan: [["Warum", "Manchmal blockiert ein VPN, ein Werbeblocker oder ein sehr strenger Browser die Erkennung. Dann erscheinen zwei Felder: <b>{ui:lat}</b> und <b>{ui:lon}</b>."],
        ["Zahlen finden", "Öffne Google Maps und such <b>deine Stadt</b>. Am Computer: Rechtsklick in die Stadtmitte; am Handy: lange drücken. Du siehst zwei Zahlen, etwa <code>40.4168, -3.7038</code>."],
        ["Eintragen", "Die <b>erste</b> Zahl kommt in <b>{ui:lat} (1)</b>. Die <b>zweite</b> Zahl kommt in <b>{ui:lon} (2)</b>. Ein Minuszeichen bleibt stehen."],
        ["Danach", "Drück auf {ui:register} und bestätige in deiner Wallet. Nimm deine Stadt, nicht deine Wohnung."]],
      planCap: "Nur wenn der Standort nicht erkannt werden konnte: (1) {ui:lat} · (2) {ui:lon}" },
    14: { k: "Fertig", h: "Fertig: dein Node läuft",
      do: ["Der Button wechselt zu {ui:registered}.", "Dein Node erscheint auf der Netzwerkkarte. Ab jetzt zählt er."],
      onoff: [["JA", "Du kannst den Tab schließen", "Dein Node bleibt von selbst im Netzwerk an."], ["JA", "Du kannst den Computer ausschalten", "Dein Node hängt nicht von deinem Computer oder Handy ab."], ["NEIN", "Deaktiviere deinen Node nie", "Drück keinen Button und unterschreib keine Transaktion, die deinen Node deaktiviert oder ausschaltet. Solange er aus ist, zählt er nicht, bis du ihn wieder einschaltest."]],
      done: ["Teil B erledigt. Du bist im Airdrop.", "Staking + Node an, mit derselben Wallet. Dein Zähler läuft."] },
    15: { k: "Mein Airdrop", h: "Öffne „Mein Airdrop“",
      do: ["Öffne <b>sectoraorg.com/myairdrop</b>.", "Drück auf {ui:myConnect} oder füg deine Wallet-Adresse ein und drück auf {ui:myCheck}.", "Du siehst, was du bisher verdient hast, dein <b>Level</b>, deinen <b>Preis</b> und die drei Bedingungen."],
      cap: "Beispiel: 1.000 #SECT gestakt = Guardian, Preis 750 SECT.",
      checkH: "Die drei Bedingungen",
      check: [["✓ 100+ SECT im Staking", "Erledigt in Teil A."], ["✓ Hash Node an", "Erledigt in Teil B."], ["30 Tage dabei", "Startet von selbst, sobald die zwei oberen erfüllt sind. Einfach warten und nichts anfassen."]] },
    16: { k: "Airdrop-Seite", h: "Schneller Check auf der Airdrop-Seite",
      do: ["Öffne die Airdrop-Seite, <b>sectoraorg.com/airdrop</b>, und drück auf {ui:takePart}.", "Verbinde deine Wallet. Das Fenster <b>„Dein Airdrop“</b> zeigt, was du bisher verdient hast, deinen Preis und dein Level."],
      cap1: "Die Airdrop-Seite: drück auf {ui:takePart}.", cap2: "Beispiel des Fensters „Dein Airdrop“.",
      see: "<b>Wann bekomme ich meine SECT?</b> Auf SectoraEVM, bei seinem Mainnet-Start. Du kannst es auf <a href=\"/sectorascan/\">SectoraScan</a> verfolgen." }
  },
  wallet: {
    site: "sectoraorg.com",
    connect: { h: "Mit dieser Seite verbinden", p: "sectoraorg.com möchte deine Kontoadresse sehen und dich um Genehmigungen bitten.", no: "Abbrechen", yes: "Verbinden" },
    approve: { h: "Anfrage für Ausgabelimit", rows: [["Token", "#SECT"], ["Ausgabelimit", "1.000 SECT"], ["Empfänger", "0x79Cb…20E0"], ["Netzwerkgebühr", "in ETH bezahlt"]], no: "Ablehnen", yes: "Bestätigen" },
    deposit: { h: "Transaktionsanfrage", rows: [["Interagiert mit", "0x79Cb…20E0"], ["Aktion", "Einzahlen"], ["Netzwerkgebühr", "in ETH bezahlt"]], no: "Ablehnen", yes: "Bestätigen" },
    sw: { h: "Darf diese Seite das Netzwerk wechseln?", from: "Ethereum", to: "Sepolia", no: "Abbrechen", yes: "Netzwerk wechseln" }
  },
  faq: {
    k: "Probleme · schnelle Antworten", h: "Etwas hat nicht geklappt? <b>Schau zuerst hier.</b>",
    items: [
      ["„Not enough ETH“ auf der Staking-Seite", "Teil A nutzt echtes Ethereum. Leg etwas ETH (auf Ethereum) in dieselbe Wallet und versuch es erneut."],
      ["„Nicht genug Gas“ im Dashboard", "Teil B nutzt kostenloses Sepolia-ETH. Wiederhole <a href=\"#step-10\">Schritt 10</a>."],
      ["Der Google-Faucet verlangt 0.001 ETH auf Ethereum", "Deine Wallet braucht mindestens 0,001 echtes ETH auf Ethereum, um den Google-Faucet zu nutzen. Lass etwas ETH darin und versuch es erneut, oder schreib dem Support."],
      ["Meine Wallet zeigt Sepolia nicht", "Schalte in den Wallet-Einstellungen „Testnetzwerke anzeigen“ ein. Dann lade das Dashboard neu."],
      ["„Switch your wallet to the Ethereum network“", "Du bist auf der Staking-Seite im falschen Netzwerk. Wähle in deiner Wallet Ethereum (Ethereum Mainnet) und lade neu."],
      ["„You do not have that many #SECT in your wallet“", "Das heißt, du hast nicht so viele #SECT. Gib einen kleineren Betrag ein oder kauf mehr mit unserer <a href=\"/guide/\">Kaufanleitung</a>."],
      ["Ich habe nicht genug tSECT für das Node Kit", "Hol dir 5.000 tSECT in <a href=\"#step-11\">Schritt 11</a>. Heute schon abgeholt? Warte 24 Stunden und hol sie erneut."],
      ["Ich habe für den Node eine andere Wallet genutzt", "Das zählt nicht. Verbinde deine <b>Staking-Wallet</b> im Dashboard und wiederhole Teil B damit."],
      ["Der Standort wurde nicht erkannt oder ist falsch", "Drück auf „{ui:change}“ oder folge Plan B in <a href=\"#step-13\">Schritt 13</a>. Nimm deine Stadt, nicht deine Wohnung."],
      ["Das Wallet-Fenster hat sich nicht geöffnet", "Öffne die Wallet-App oder -Erweiterung selbst: Die Anfrage wartet dort. Auf dem Handy geh nach dem Bestätigen zurück zum Browser-Tab."],
      ["Muss mein Computer an bleiben?", "Nein. Einmal registriert, bleibt dein Node von selbst an. Deaktiviere ihn nur nie."],
      ["Muss ich mein Staking abheben, um mitzumachen?", "Nein. Niemals. Deine gestakten #SECT zählen so, wie sie sind, und du bekommst weiter deine Staking-Belohnungen."],
      ["Kostet Teil B Geld?", "Nein. tSECT und Sepolia-ETH sind kostenlose Testcoins ohne Wert."]
    ]
  },
  help: {
    k: "Support", h: "Kommst du nicht weiter? <b>Schreib uns.</b>",
    p: "Schick eine E-Mail an unser Support-Team mit dem Betreff <b>„Airdrop Connection“</b>. Damit wir schnell helfen können, schick mit:",
    list: ["Deine <b>öffentliche</b> Wallet-Adresse (beginnt mit 0x).", "Die <b>Schrittnummer</b>, bei der du hängst.", "Einen <b>Screenshot</b> des Fehlers."],
    email: "E-Mail", subject: "Betreff", subjectV: "Airdrop Connection", btn: "Support schreiben",
    never: "Schick <b>niemals</b> deine Wiederherstellungsphrase (12 oder 24 Wörter) oder deinen privaten Schlüssel. Weder uns noch sonst jemandem."
  },
  foot: {
    legal: "<b>Sectora Foundation IL</b> · Cybersecurity-Unternehmen · Chicago, Illinois, Vereinigte Staaten · Illinois-Registernummer 18523639 · EIN 32-0868576",
    token: "#SECT-Token (Ethereum, ERC-20)", staking: "Staking-Vertrag", support: "Support: support@sectoraorg.com · Betreff „Airdrop Connection“",
    online: "Online-Version mit Links: sectoraorg.com/airdrop-guide/de",
    nav: ["Airdrop", "Staking", "Hash Node", "Mein Airdrop", "Rechtliches"]
  }
};
