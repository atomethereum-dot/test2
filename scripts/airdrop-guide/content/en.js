/* Guia del Airdrop Genesis · English (texto base; los demas idiomas copian esta misma estructura).
   {ui:clave} = boton de la web con su texto en este idioma (labels.json); {en:Texto} = boton de la pagina
   de staking, que solo existe en ingles. */
module.exports = {
  name: "English", locale: "en-US", dir: "ltr",
  meta: {
    title: "Airdrop Genesis Guide — Sectora Foundation",
    desc: "Step-by-step guide to join Sectora Airdrop Genesis: stake your #SECT, turn on your Hash Node with the same wallet and check your airdrop. With screenshots and a downloadable PDF."
  },
  nav: { sub: "Airdrop guide", back: "Airdrop page", pdf: "PDF", lang: "Language" },
  common: {
    part: "Part", step: "Step", stepOf: "Step {n} of 16", illus: "Illustration · your wallet may look a little different",
    example: "The screenshots show an example wallet (0x4b2f…4b3c) and example amounts. Your screen shows your own.",
    phone: "On a phone", computer: "On a computer", yes: "YES", no: "NO", minutes: "minutes", page: "page",
    stakingEnglish: ""
  },
  cover: {
    tag: "Official guide · Edition 1.1", kicker: "Airdrop Genesis · Participation guide",
    h1: "How to join<br>the Sectora <b>airdrop.</b>",
    p: "Step by step, with screenshots: from your very first click to a Hash Node that is on and counting. Read one step, do it, then go to the next.",
    parts: [["Part A", "Stake your #SECT", "Ethereum · steps 1–7"], ["Part B", "Turn on your node", "Free testnet · steps 8–14"], ["Part C", "Check your airdrop", "One minute · steps 15–16"]],
    issued: "Issued by", entity: "Entity", activity: "Activity", activityV: "Cybersecurity company", location: "Location", locationV: "Chicago, Illinois, United States",
    file: "Illinois file", ein: "EIN", contracts: "Official contracts · Ethereum mainnet", token: "#SECT token", staking: "Staking", web: "Website", support: "Support",
    date: "October 2026 · English"
  },
  toc: { k: "Contents", h: "Everything in this guide", start: "Start here", before: "Before you start", problems: "Problems and support" },
  hero: {
    k: "Airdrop Genesis · Step-by-step guide",
    h1: "How to join the Sectora airdrop, <b>step by step.</b>",
    lede: "This guide takes you from your <strong>very first click</strong> to a <strong>Hash Node that is on and counting</strong>. Every step says exactly what to press, what you should see and what not to do, with a screenshot. Read one step, do it, then go to the next. <strong>About 20 minutes.</strong>",
    pdf: "Download the PDF guide", start: "Start the guide"
  },
  need: {
    k: "The whole airdrop in one sentence", h: "You need only two things, <b>with the same wallet:</b>",
    r1: ["#SECT in staking", "At least 100 #SECT in the official staking, on Ethereum. Part A."],
    r2: ["Your Hash Node turned on", "On the Sectora test network. 100% free. Part B."],
    foot: "When both are true, your airdrop count starts by itself. <b>No sign-up, no forms.</b>"
  },
  already: {
    h: "Already staking #SECT? You're already in.",
    p: "You don't have to do anything else with your staking. <b>Don't withdraw anything.</b> Skip Part A and go straight to Part B: just turn on your Hash Node <b>with the same wallet you stake with</b>, and you start taking part.",
    btn: "Go to Part B"
  },
  map: [
    ["Part A · steps 1–7", "Stake your #SECT", "Ethereum mainnet. Uses your real #SECT and a little ETH for the fee.", "≈ 5 minutes"],
    ["Part B · steps 8–14", "Turn on your Hash Node", "Sectora test network. Free test coins: you spend no real money.", "≈ 10 minutes"],
    ["Part C · steps 15–16", "Check your airdrop", "See your level, your prize and your count growing.", "≈ 1 minute"]
  ],
  before: {
    k: "00 · Before you start", h: "Have these <b>four things</b> ready.",
    items: [
      ["01", "A crypto wallet", "MetaMask, Trust Wallet, Coinbase Wallet, OKX, Binance Wallet or any Ethereum wallet. On your phone or your computer."],
      ["02", "At least 100 #SECT", "In that wallet. Don't have them yet? Buy them on Uniswap with our <a href=\"/guide/\">step-by-step buying guide</a>."],
      ["03", "A little ETH", "On Ethereum, in the same wallet. It pays the network fees (a few dollars)."],
      ["04 · Most important", "ONE wallet for everything", "Your staking and your node must use the <b>same wallet address</b>. Using two different wallets is the most common mistake."]
    ],
    rulesH: "Three safety rules. Never break them.",
    rules: "<b>1.</b> Never give anyone your secret recovery phrase (the 12 or 24 words) or your private key. Sectora will never ask for them. <b>2.</b> Only use <b>sectoraorg.com</b>: check the address bar every time. <b>3.</b> Nobody from Sectora will message you first to “help” you. If someone does, it is a scam."
  },
  phone: {
    k: "On a phone", h: "Using a phone? <b>Read this first.</b>",
    p: "Everything in this guide works on a phone. You only need your wallet app installed (MetaMask, Trust Wallet, Coinbase Wallet…).",
    steps: [
      "<b>Staking (Part A):</b> open <b>sectoraorg.com/staking</b> in Chrome or Safari and press {en:Connect wallet}. Tap your wallet app in the list, approve there and come back to the browser.",
      "<b>Node (Part B):</b> open <b>sectoraorg.com/dashboard</b> and press {ui:connect}. On a phone it shows {ui:openMM} (or your wallet): tap it and the dashboard opens <b>inside your wallet app</b>. Continue there.",
      "<b>Inside the wallet app</b> everything connects directly. Use the same wallet app for everything."
    ],
    note: "If the wallet app doesn't open, open it yourself, find its built-in browser (often called <b>Browser</b>, <b>Explore</b> or <b>Discover</b>) and type the address there."
  },
  parts: {
    A: { k: "Part A · Steps 1–7 · ≈ 5 minutes", h: "Stake your #SECT", sub: "You put your #SECT in the official staking. They stay yours, earn staking rewards every second and count for the airdrop. Already staking? <a href=\"#part-b\">Skip to Part B</a>.", tags: ["Ethereum mainnet · real #SECT", "Needs a little ETH for fees", "No lock-up"] },
    B: { k: "Part B · Steps 8–14 · ≈ 10 minutes", h: "Turn on your Hash Node", sub: "The Hash Node runs on Sectora's test network (Sepolia). <b>Everything in Part B is free:</b> you use free test coins that have no value. You never spend real money here.", tags: ["Free · test network", "Same wallet as your staking", "Stays on by itself"] },
    C: { k: "Part C · Steps 15–16 · ≈ 1 minute", h: "Check your airdrop", sub: "See your level, your prize and the three requirements, read live from the blockchain. Looking is free: no signature, no transaction.", tags: ["Read-only · free", "Any time"] }
  },
  s: {
    1: { k: "Browser", h: "Open the staking page",
      do: ["Open your browser: Chrome, Safari, or the browser inside your wallet app.", "Type exactly <b>sectoraorg.com/staking</b> and open it.", "Scroll down until you see the white box called <b>“Staking console”</b>."],
      warn: "<b>Check the address bar.</b> The only real page is <b>sectoraorg.com/staking</b>. If it says anything else, close it." },
    2: { k: "Staking console", h: "Press “Connect wallet”",
      do: ["At the bottom of the Staking console there is a big blue button.", "Press {en:Connect wallet}."],
      cap: "The Staking console. The button you press is marked in blue." },
    3: { k: "Your wallet", h: "Choose your wallet",
      do: ["A list opens under the button.", "<b>On a computer:</b> press your wallet (for example <b>MetaMask</b>). Your wallet opens: press <b>Connect</b>.", "<b>On a phone (Chrome or Safari):</b> tap your wallet app. The app opens: press <b>Connect</b> there, then <b>go back to the browser tab</b>."],
      capPc: "On a computer: your browser wallet appears first.", capPhone: "On a phone: the list of wallet apps." },
    4: { k: "Check", h: "Check that you are connected",
      do: ["Look at the big blue button: it now shows <b>your wallet address</b>, short, like <code>0x4b2f…4b3c</code>.", "Under it you now see three buttons: {en:Deposit #SECT} {en:Withdraw} {en:Withdraw all}."],
      see: "<b>It worked</b> if you see your address on the button.",
      warn: "<b>Red message “Switch your wallet to the Ethereum network”?</b> Open your wallet, change the network to <b>Ethereum</b> (Ethereum Mainnet) and reload the page." },
    5: { k: "Amount", h: "Type how many #SECT you stake",
      do: ["Press the box <b>“You deposit”</b>.", "Type the number of #SECT. Only the number, for example <b>1000</b>. No dots, no commas."],
      how: "<b>How much?</b> At least <b>100 #SECT</b> to take part in the airdrop. The more you stake, the higher your level:",
      prize: "prize {n} SECT", nomax: "no maximum" },
    6: { k: "Wallet · confirmation 1 of 2", h: "Press “Deposit #SECT” and approve",
      do: ["Press {en:Deposit #SECT}.", "Your wallet opens and asks you to <b>approve</b> a “spending cap”. This only allows the staking contract to take <b>exactly</b> the amount you typed, never more. Nothing moves yet.", "Check the details below, then press <b>Confirm</b> in your wallet.", "<b>Wait.</b> Don't close the page. It takes from a few seconds to a minute."],
      checkH: "Check this in your wallet before you press Confirm",
      check: [["Request", "Approve · spending cap"], ["Amount", "The exact #SECT you typed"], ["Contract", "<code>0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0</code>"], ["Fee", "A small amount of ETH (your wallet shows it)"]] },
    7: { k: "Wallet · confirmation 2 of 2", h: "Confirm the deposit",
      do: ["When the approval is done, your wallet opens <b>a second time</b> by itself, now for the <b>deposit</b>.", "Press <b>Confirm</b> again. Wait a few seconds.", "A green box appears: <b>“Your rewards · accruing every second”</b>, with <b>“Deposited”</b> and your amount."],
      cap: "Your staking is done: the deposit shows and your rewards grow every second.",
      warn: "<b>Leave your #SECT in the staking.</b> Only staked #SECT count for the airdrop. Keep them there until you complete your time. You still earn your normal staking rewards.",
      done: ["Part A done.", "Your #SECT are staked. Now turn on your node with this same wallet."] },
    8: { k: "Dashboard", h: "Open the dashboard and press “{ui:connect}”",
      do: ["Open <b>sectoraorg.com/dashboard</b>.", "At the top right, press {ui:connect}.", "<b>On a phone (Chrome or Safari):</b> a list appears. Tap {ui:openMM} (or your wallet) and the dashboard opens inside your wallet app. Press {ui:connect} again there."],
      warn: "<b>Use the SAME wallet you staked with.</b> If your node is on another wallet, it does not count for your airdrop.",
      lang: "",
      capPhone: "On a phone: {ui:connect} at the top.", capPhone2: "On a phone without a wallet: {ui:openMM}." },
    9: { k: "Your wallet", h: "Choose your wallet and accept the test network",
      do: ["In the list <b>“{ui:wselTitle}”</b>, press your wallet (it says <b>{ui:detected}</b>).", "In your wallet, press <b>Connect</b>.", "The dashboard moves your wallet to the <b>Sepolia</b> test network by itself. If your wallet asks to switch or add the network, press <b>Approve</b> or <b>Switch network</b>."],
      tip: "<b>Your wallet doesn't show Sepolia?</b> Open your wallet settings and turn on <b>“Show test networks”</b>. Then try again." },
    10: { k: "Free gas", h: "Get free Sepolia ETH for gas",
      do: ["Every action on the test network needs a little <b>Sepolia ETH</b>. It is a free test coin with no value.", "In the dashboard, go down a little to <b>“{ui:howTitle}”</b>. In box <b>02 “{ui:howGas}”</b>, press {ui:howGasBtn}.", "A Google Cloud page opens. Check that the network is <b>Ethereum Sepolia</b>, paste your wallet address in <b>“Wallet address or ENS name”</b> and press <b>Get 0.05 Sepolia ETH</b>. If it asks, sign in with a Google account.", "Come back to the dashboard tab."],
      copy: "<b>How do I copy my address?</b> Open your wallet and tap your account name or address at the top: it copies by itself.",
      warn: "<b>Google says you need 0.001 ETH on Ethereum Mainnet?</b> Google's faucet only gives Sepolia ETH to wallets that hold at least 0.001 real ETH on Ethereum. Keep a little ETH in your wallet (you need it for Part A anyway) and try again.",
      capHow: "In the dashboard: {ui:howTitle} → box 02 → {ui:howGasBtn}.", capDash: "The same button is also further down, in {ui:tnTitle}.", capGoogle: "The Google Cloud faucet: (1) your address · (2) Get 0.05 Sepolia ETH." },
    11: { k: "Free test tokens", h: "Claim 5,000 free tSECT",
      do: ["In the same box, press {ui:faucetBtn}.", "Your wallet opens: press <b>Confirm</b>.", "Wait a few seconds. <b>“{ui:balance}”</b> now shows <b>5,000 tSECT</b>."],
      tip: "tSECT are <b>test tokens with no money value</b>. You can claim them again every 24 hours." },
    12: { k: "Hash market", h: "Buy the Node Kit · 50 TH/s",
      do: ["Go down to <b>“{ui:market}”</b>.", "Open the tab {ui:physical} <b>(1)</b>.", "Press the card <b>50 TH/s · 4,300 tSECT</b>, marked <b>{ui:airdropPlan}</b> <b>(2)</b>. This is the node that works for the airdrop.", "Press {ui:buy50} <b>(3)</b>.", "Your wallet opens <b>two times</b>: first to allow the payment, then to confirm the purchase. Press <b>Confirm</b> both times."],
      cap1: "(1) {ui:physical} · (2) 50 TH/s · {ui:airdropPlan}", cap2: "(3) {ui:buy50}",
      see: "The 4,300 tSECT come from the 5,000 free tSECT of step 11. <b>No real money.</b>" },
    13: { k: "Your node", h: "Register your node. The location is automatic.",
      do: ["Go down to <b>“{ui:node}”</b>.", "Your node's location is <b>already detected (1)</b> and its name is <b>already filled in</b>. You don't type anything.", "Press {ui:register} <b>(2)</b>.", "Your wallet opens: press <b>Confirm</b>."],
      cap: "(1) Location detected automatically · (2) {ui:register}",
      tip: "<b>About the location.</b> Our systems detect your node's approximate location from your connection and fill it in for you. Only the <b>city</b> is saved on the network, <b>never your address</b>. The location is wrong (for example because of a VPN)? Press <b>“{ui:change}”</b> and correct it.",
      planH: "Step 13 · Plan B · only if you see “{ui:geoFail}”",
      plan: [["Why", "Sometimes a VPN, an ad-blocker or a strict browser blocks the detection. Then two boxes appear: <b>{ui:lat}</b> and <b>{ui:lon}</b>."],
        ["Find the numbers", "Open Google Maps and search for <b>your city</b>. On a computer, right-click the city center; on a phone, press and hold it. You see two numbers, like <code>40.4168, -3.7038</code>."],
        ["Fill them in", "The <b>first</b> number goes in <b>{ui:lat} (1)</b>. The <b>second</b> number goes in <b>{ui:lon} (2)</b>. Keep the minus sign if there is one."],
        ["Then", "Press {ui:register} and confirm in your wallet. Use your city, not your home."]],
      planCap: "Only when the location could not be detected: (1) {ui:lat} · (2) {ui:lon}" },
    14: { k: "Done", h: "Done: your node is on",
      do: ["The button changes to {ui:registered}.", "Your node appears on the network map. From now on, it counts."],
      onoff: [["YES", "You can close the tab", "Your node stays on in the network by itself."], ["YES", "You can turn off your computer", "Your node does not depend on your computer or your phone."], ["NO", "Never deactivate your node", "A deactivated node stops counting until you turn it on again."]],
      done: ["Part B done. You are in the airdrop.", "Staking + node on, with the same wallet. Your count is running."] },
    15: { k: "My Airdrop", h: "Open My Airdrop",
      do: ["Open <b>sectoraorg.com/myairdrop</b>.", "Press {ui:myConnect}, or paste your wallet address and press {ui:myCheck}.", "You see what you have earned so far, your <b>level</b>, your <b>prize</b> and the three requirements."],
      cap: "Example: 1,000 #SECT staked = Guardian, prize 750 SECT.",
      checkH: "The three requirements",
      check: [["✓ 100+ SECT in staking", "Done in Part A."], ["✓ Hash Node on", "Done in Part B."], ["30 days inside", "Starts by itself when the two above are true. Just wait and don't touch anything."]] },
    16: { k: "Airdrop page", h: "Quick check on the airdrop page",
      do: ["Open the airdrop page, <b>sectoraorg.com/airdrop</b>, and press {ui:takePart}.", "Connect your wallet. The window <b>“Your airdrop”</b> shows what you have earned so far, your prize and your level."],
      cap1: "The airdrop page: press {ui:takePart}.", cap2: "Example of the “Your airdrop” window.",
      see: "<b>When do I receive my SECT?</b> On SectoraEVM, at its mainnet launch. You will be able to follow it on <a href=\"/sectorascan/\">SectoraScan</a>." }
  },
  wallet: {
    site: "sectoraorg.com",
    connect: { h: "Connect to this site", p: "sectoraorg.com wants to see your account address and ask you to approve actions.", no: "Cancel", yes: "Connect" },
    approve: { h: "Spending cap request", rows: [["Token", "#SECT"], ["Spending cap", "1,000 SECT"], ["Spender", "0x79Cb…20E0"], ["Network fee", "paid in ETH"]], no: "Reject", yes: "Confirm" },
    deposit: { h: "Transaction request", rows: [["Interacting with", "0x79Cb…20E0"], ["Action", "Deposit"], ["Network fee", "paid in ETH"]], no: "Reject", yes: "Confirm" },
    sw: { h: "Allow this site to switch the network?", from: "Ethereum", to: "Sepolia", no: "Cancel", yes: "Switch network" }
  },
  faq: {
    k: "Problems · quick answers", h: "Something didn't work? <b>Look here first.</b>",
    items: [
      ["“Not enough ETH” on the staking page", "Part A uses real Ethereum. Add a little ETH (on Ethereum) to the same wallet and try again."],
      ["“Not enough gas” on the dashboard", "Part B uses free Sepolia ETH. Repeat <a href=\"#step-10\">step 10</a>."],
      ["Google's faucet asks for 0.001 ETH on Ethereum", "Your wallet needs at least 0.001 real ETH on Ethereum to use Google's faucet. Keep a little ETH in it and try again, or write to support."],
      ["My wallet doesn't show Sepolia", "In your wallet settings, turn on “Show test networks”. Then reload the dashboard."],
      ["“Switch your wallet to the Ethereum network”", "You are on the staking page with the wrong network. In your wallet, choose Ethereum (Ethereum Mainnet) and reload."],
      ["“You do not have that many #SECT in your wallet”", "Type a smaller amount, or buy more #SECT with our <a href=\"/guide/\">buying guide</a>."],
      ["I don't have enough tSECT to buy the Node Kit", "Claim 5,000 tSECT in <a href=\"#step-11\">step 11</a>. Already claimed today? Wait 24 hours and claim again."],
      ["I used a different wallet for the node", "It doesn't count. Connect your <b>staking wallet</b> on the dashboard and repeat Part B with it."],
      ["The location wasn't detected, or it is wrong", "Press “{ui:change}”, or follow Plan B in <a href=\"#step-13\">step 13</a>. Use your city, not your home."],
      ["The wallet window didn't open", "Open your wallet app or extension yourself: the request is waiting there. On a phone, after approving, go back to the browser tab."],
      ["Do I have to keep my computer on?", "No. Once registered, your node stays on by itself. Just never deactivate it."],
      ["Do I have to withdraw my staking to join?", "No. Never. Your staked #SECT count as they are, and you keep earning your staking rewards."],
      ["Does Part B cost money?", "No. tSECT and Sepolia ETH are free test coins with no value."]
    ]
  },
  help: {
    k: "Support", h: "Still stuck? <b>Write to us.</b>",
    p: "Send an email to our support team with the subject <b>“Airdrop Connection”</b>. To help you fast, include:",
    list: ["Your <b>public</b> wallet address (starts with 0x).", "The <b>step number</b> where you got stuck.", "A <b>screenshot</b> of the error."],
    email: "Email", subject: "Subject", subjectV: "Airdrop Connection", btn: "Write to support",
    never: "<b>Never</b> send your recovery phrase (12 or 24 words) or your private key. Not to us, not to anyone."
  },
  foot: {
    legal: "<b>Sectora Foundation IL</b> · Cybersecurity company · Chicago, Illinois, United States · Illinois file number 18523639 · EIN 32-0868576",
    token: "#SECT token (Ethereum, ERC-20)", staking: "Staking contract", support: "Support: support@sectoraorg.com · Subject “Airdrop Connection”",
    online: "Online version with live links: sectoraorg.com/airdrop-guide",
    nav: ["Airdrop", "Staking", "Hash Node", "My Airdrop", "Legal"]
  }
};
