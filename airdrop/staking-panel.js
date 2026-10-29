/* Sectora Airdrop · staking panel
   A window that sits beside the staking console and tells stakers where they
   stand in Airdrop Genesis: step 1 (SECT in staking) is done, their level and
   spots for what they have staked, the prize that adds up to, and that the only
   thing left is to connect their Hash Node. Prize = SECT in staking x the rate
   of the level (Scout 55, Sentinel 65, Guardian 75, Titan 90 per 100 SECT);
   spots = SECT in staking / the minimum of the level.
   When the page announces the connected address (the "sectora:account" event
   from staking-chain.js), it reads that address's deposit from the staking
   contract (accountView, a public read) and looks it up in the Hash Node registry
   on Sepolia, or among the nodes activated in the dashboard (count.js), to mark step 2. The amount the console prints (#earnDep) is only a
   fallback and a signal to read again: a translator such as Google Translate
   rewrites "4,000" as "4.000", which would read as 4. It never asks the wallet to
   sign anything: staking works exactly the same with or without it. It also puts a small "Airdrop Genesis is open" tag under the
   "Live" tag of the hero, which scrolls down to this window. */
(function () {
  "use strict";
  if (document.querySelector(".sad")) return;

  var AIRDROP_URL = "/airdrop/";
  var MY_URL = "/myairdrop/";
  var NODE_URL = "/dashboard.html#guia-nodo";
  var COUNT_JS = "/airdrop/count.js?v=22";
  var REGISTRY = "0x8dba83ffA1dF76B4136B39C9edfCD6Ca0B2e9BF1";
  var SEPOLIA = ["https://ethereum-sepolia-rpc.publicnode.com", "https://sepolia.gateway.tenderly.co", "https://ethereum-sepolia.publicnode.com"];
  var STAKING = "0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0";
  var MAINNET = ["https://ethereum-rpc.publicnode.com", "https://eth.drpc.org", "https://1rpc.io/eth"];
  var SEL = { indexPlusOne: "0x7f0b8642", validators: "0x35aa2e44", accountView: "0xf85b90e2" };
  var LV = [{ min: 100, rate: .55, n: "Scout" }, { min: 500, rate: .65, n: "Sentinel" }, { min: 1000, rate: .75, n: "Guardian" }, { min: 4000, rate: .9, n: "Titan" }];

  var T = {
    en: { loc: "en-US", bar: "airdrop genesis", band: "Airdrop Genesis", k: "Your airdrop",
      h0: "Connect your wallet to see <b>your level.</b>", p0: "Your staking counts for the airdrop, without withdrawing anything.",
      h1: "You need <b>{x} SECT</b> more to join.", p1: "With 100 SECT in staking you're Scout and you're in the airdrop.",
      h2: "Step 1 <b>completed.</b>", p2: "You're already in: you don't have to do anything else. Just turn on your Hash Node with this same wallet and you start taking part.",
      s1: "Step 1 · SECT in staking", s1min: "Min. 100", s2: "Step 2 · Connect your Hash Node", s2t: "Last step",
      lv: "Your level", lvs: "Level {n}", sp: "Spots", sps: "of {l}", pz: "Your prize", pzs: "SECT on completing your time",
      up: "With {x} SECT more you move up to {l} and your prize rises to {p} SECT.", top: "Titan has no maximum: every 1,000 SECT more add 900 SECT.",
      cta: "Connect my Hash Node", more: "See the airdrop", have: "Already on? Check it in the airdrop.",
      note: "No lock-up: if you withdraw, your count pauses and continues when you come back.", min: "Minimise", max: "Open", done: "Step 1 ✓", wait: "Connect wallet",
      h3: "You're in the <b>airdrop.</b>", p3: "Staking and Hash Node ready. Keep both until you complete your time to win your prize.",
      p1n: "Your Hash Node is already on. With 100 SECT in staking you're in the airdrop.", poff: "Your Hash Node is off: turn it on so your count keeps going.",
      on: "On", off: "Off", chk: "Checking…", ctaOn: "See my airdrop", ctaOff: "Turn on my Hash Node", both: "2/2 ✓",
      hw: "How to turn on your Hash Node", hw1: "Open the dashboard and connect this same wallet", hw2: "Press “Activate my node”: free, one click, no gas", hw3: "Your node turns on right away. With your staking, your airdrop counts", hwp: "Open the dashboard", hwn: "Go to your node",
      acc: "Generated so far", of: "of {n} SECT on completing your time", calc: "Calculating with the network…", pre: "It starts counting the day the airdrop opens.", lock: "From {d} (30 days in) what you generate is yours.", mine: "What you generate is already yours.",
      who: "Wallet {a}", pzW: "At {l} level you had {g} SECT generated. Deposit your previous balance ({b} SECT in staking) and it runs again.", pzN: "Now: {l} level with {s} SECT in staking · prize {p} SECT.", wNone: "no node activated with this wallet yet", wOn: "node on", wOff: "node off", wChk: "checking its node…", wErr: "couldn't check the network, retrying…",
      keep: "Your staking keeps working as usual. Joining our validator network is optional: just connect a Hash Node and you can add Airdrop Genesis rewards on top.",
      newB: "New", newT: "Airdrop Genesis is open",
      msgK: "Message for stakers · Airdrop Genesis",
      msgT: "Airdrop Genesis is now open. Your staking keeps working exactly as it does today: the same rewards, no lock-up and nothing to withdraw. Taking part is optional: connect a Hash Node with this same wallet and your staked SECT also count toward Airdrop Genesis.",
      msgA: "Your airdrop window", msgR: "Read the rules", cInfo: "Airdrop website info", cMy: "My Airdrop panel",
      dK: "Airdrop delivery", dT: "Delivered at the SectoraEVM launch.", dP: "The #SECT you generate in Airdrop Genesis are delivered when SectoraEVM launches, after the March 15, 2027 supply reduction. Your staking rewards stay separate and can be claimed at any time.",
      d1a: "Now", d1b: "You generate", d2a: "Mar 15, 2027", d2b: "Supply reduction", d3a: "SectoraEVM", d3b: "Delivery" },
    es: { loc: "es-ES", bar: "airdrop genesis", band: "Airdrop Genesis", k: "Tu airdrop",
      h0: "Conecta tu wallet para ver <b>tu nivel.</b>", p0: "Tu staking cuenta para el airdrop, sin retirar nada.",
      h1: "Te faltan <b>{x} SECT</b> para entrar.", p1: "Con 100 SECT en staking eres Scout y entras al airdrop.",
      h2: "Paso 1 <b>completado.</b>", p2: "Ya estás dentro: no tienes que hacer nada más. Solo enciende tu Hash Node con esta misma wallet y empiezas a participar.",
      s1: "Paso 1 · SECT en staking", s1min: "Mín. 100", s2: "Paso 2 · Conecta tu Hash Node", s2t: "Último paso",
      lv: "Tu nivel", lvs: "Nivel {n}", sp: "Plazas", sps: "de {l}", pz: "Tu premio", pzs: "SECT al completar tu tiempo",
      up: "Con {x} SECT más subes a {l} y tu premio pasa a {p} SECT.", top: "Titan no tiene máximo: cada 1.000 SECT más suman 900 SECT.",
      cta: "Conectar mi Hash Node", more: "Ver el airdrop", have: "¿Ya lo tienes encendido? Compruébalo en el airdrop.",
      note: "Sin bloqueo: si retiras, tu conteo se pausa y sigue al volver.", min: "Minimizar", max: "Abrir", done: "Paso 1 ✓", wait: "Conecta tu wallet",
      h3: "Ya participas en el <b>airdrop.</b>", p3: "Staking y Hash Node listos. Mantén los dos hasta completar tu tiempo para ganar tu premio.",
      p1n: "Tu Hash Node ya está encendido. Con 100 SECT en staking entras al airdrop.", poff: "Tu Hash Node está apagado: enciéndelo para que tu conteo siga.",
      on: "Encendido", off: "Apagado", chk: "Comprobando…", ctaOn: "Ver mi airdrop", ctaOff: "Encender mi Hash Node", both: "2/2 ✓",
      hw: "Cómo encender tu Hash Node", hw1: "Abre el panel y conecta esta misma wallet", hw2: "Pulsa «Activar mi nodo»: gratis, un clic y sin gas", hw3: "Tu nodo se enciende al momento. Con tu staking, tu airdrop cuenta", hwp: "Abrir el panel", hwn: "Ir a tu nodo",
      acc: "Llevas generado", of: "de {n} SECT al completar tu tiempo", calc: "Calculando con la red…", pre: "Empieza a contar el día de la apertura del airdrop.", lock: "Desde el {d} (30 días dentro) lo generado es tuyo.", mine: "Lo generado ya es tuyo.",
      who: "Wallet {a}", pzW: "En nivel {l} tenías {g} SECT generados. Deposita tu saldo anterior ({b} SECT en staking) y vuelve a correr.", pzN: "Ahora: nivel {l} con {s} SECT en staking · premio {p} SECT.", wNone: "aún sin nodo activado con esta wallet", wOn: "nodo encendido", wOff: "nodo apagado", wChk: "comprobando su nodo…", wErr: "no se pudo consultar la red, reintentando…",
      keep: "Tu staking sigue funcionando con normalidad. Unirte a nuestra red de validadores es opcional: solo conecta un Hash Node y podrás sumar recompensas de Airdrop Genesis.",
      newB: "Nuevo", newT: "Airdrop Genesis abierto",
      msgK: "Mensaje para los usuarios del stake · Airdrop Genesis",
      msgT: "Airdrop Genesis ya está abierto. Tu staking sigue funcionando exactamente igual que hoy: las mismas recompensas, sin bloqueo y sin retirar nada. Participar es opcional: conecta un Hash Node con esta misma wallet y tus SECT en staking también cuentan para Airdrop Genesis.",
      msgA: "Tu ventana del airdrop", msgR: "Leer las reglas", cInfo: "Info web del airdrop", cMy: "Mi panel de Airdrop",
      dK: "Entrega del airdrop", dT: "Se entrega en el lanzamiento de SectoraEVM.", dP: "Los #SECT que generas en Airdrop Genesis se entregan cuando se lance SectoraEVM, después de la reducción de supply del 15 de marzo de 2027. Tus recompensas de staking van aparte y puedes cobrarlas en cualquier momento.",
      d1a: "Ahora", d1b: "Generas", d2a: "15 mar 2027", d2b: "Reducción de supply", d3a: "SectoraEVM", d3b: "Entrega" },
    pt: { loc: "pt-BR", bar: "airdrop genesis", band: "Airdrop Genesis", k: "Seu airdrop",
      h0: "Conecte sua carteira para ver <b>seu nível.</b>", p0: "Seu staking conta para o airdrop, sem sacar nada.",
      h1: "Faltam <b>{x} SECT</b> para você entrar.", p1: "Com 100 SECT em staking você é Scout e entra no airdrop.",
      h2: "Passo 1 <b>concluído.</b>", p2: "Você já está dentro: não precisa fazer mais nada. Só ligue seu Hash Node com esta mesma carteira e você começa a participar.",
      s1: "Passo 1 · SECT em staking", s1min: "Mín. 100", s2: "Passo 2 · Conecte seu Hash Node", s2t: "Último passo",
      lv: "Seu nível", lvs: "Nível {n}", sp: "Vagas", sps: "de {l}", pz: "Seu prêmio", pzs: "SECT ao completar seu tempo",
      up: "Com mais {x} SECT você sobe para {l} e seu prêmio passa a {p} SECT.", top: "Titan não tem máximo: cada 1.000 SECT a mais somam 900 SECT.",
      cta: "Conectar meu Hash Node", more: "Ver o airdrop", have: "Já está ligado? Confira no airdrop.",
      note: "Sem bloqueio: se você sacar, sua contagem pausa e continua quando voltar.", min: "Minimizar", max: "Abrir", done: "Passo 1 ✓", wait: "Conecte a carteira",
      h3: "Você já participa do <b>airdrop.</b>", p3: "Staking e Hash Node prontos. Mantenha os dois até completar seu tempo para ganhar seu prêmio.",
      p1n: "Seu Hash Node já está ligado. Com 100 SECT em staking você entra no airdrop.", poff: "Seu Hash Node está desligado: ligue-o para sua contagem continuar.",
      on: "Ligado", off: "Desligado", chk: "Verificando…", ctaOn: "Ver meu airdrop", ctaOff: "Ligar meu Hash Node", both: "2/2 ✓",
      hw: "Como ligar seu Hash Node", hw1: "Abra o painel e conecte esta mesma carteira", hw2: "Toque em “Ativar meu nó”: grátis, um clique e sem gás", hw3: "Seu nó liga na hora. Com seu staking, seu airdrop conta", hwp: "Abrir o painel", hwn: "Ir ao seu nó",
      acc: "Você já gerou", of: "de {n} SECT ao completar seu tempo", calc: "Calculando com a rede…", pre: "Começa a contar no dia da abertura do airdrop.", lock: "A partir de {d} (30 dias dentro) o que você gera é seu.", mine: "O que você gerou já é seu.",
      who: "Carteira {a}", pzW: "No nível {l} você tinha {g} SECT gerados. Deposite seu saldo anterior ({b} SECT em staking) e volta a correr.", pzN: "Agora: nível {l} com {s} SECT em staking · prêmio {p} SECT.", wNone: "ainda sem nó ativado nesta carteira", wOn: "nó ligado", wOff: "nó desligado", wChk: "verificando o nó…", wErr: "não foi possível consultar a rede, tentando de novo…",
      keep: "Seu staking continua funcionando normalmente. Entrar na nossa rede de validadores é opcional: basta conectar um Hash Node e você pode somar recompensas do Airdrop Genesis.",
      newB: "Novo", newT: "Airdrop Genesis aberto",
      msgK: "Mensagem para quem faz staking · Airdrop Genesis",
      msgT: "O Airdrop Genesis já está aberto. Seu staking continua funcionando exatamente como hoje: as mesmas recompensas, sem bloqueio e sem retirar nada. Participar é opcional: conecte um Hash Node com esta mesma carteira e seus SECT em staking também contam para o Airdrop Genesis.",
      msgA: "Sua janela do airdrop", msgR: "Ler as regras", cInfo: "Info do site do airdrop", cMy: "Meu painel do Airdrop",
      dK: "Entrega do airdrop", dT: "Entregue no lançamento da SectoraEVM.", dP: "Os #SECT que você gera no Airdrop Genesis são entregues quando a SectoraEVM for lançada, depois da redução de oferta de 15 de março de 2027. Suas recompensas de staking ficam separadas e podem ser resgatadas a qualquer momento.",
      d1a: "Agora", d1b: "Você gera", d2a: "15 mar 2027", d2b: "Redução de oferta", d3a: "SectoraEVM", d3b: "Entrega" },
    zh: { loc: "zh-CN", bar: "airdrop genesis", band: "Airdrop Genesis", k: "你的空投",
      h0: "连接钱包，查看<b>你的等级。</b>", p0: "你的质押计入空投，无需取出任何东西。",
      h1: "还差 <b>{x} SECT</b> 即可加入。", p1: "质押 100 SECT 即为 Scout，进入空投。",
      h2: "第 1 步<b>已完成。</b>", p2: "你已经在其中：无需再做任何事。只需用同一个钱包开启你的 Hash Node，即可开始参与。",
      s1: "第 1 步 · 质押 SECT", s1min: "最少 100", s2: "第 2 步 · 连接你的 Hash Node", s2t: "最后一步",
      lv: "你的等级", lvs: "等级 {n}", sp: "名额", sps: "{l} 名额", pz: "你的奖励", pzs: "完成时长后可得 SECT",
      up: "再质押 {x} SECT 即升到 {l}，奖励提高到 {p} SECT。", top: "Titan 没有上限：每多 1,000 SECT 多得 900 SECT。",
      cta: "连接我的 Hash Node", more: "查看空投", have: "已经开启？在空投页面查看。",
      note: "无锁定：如果取出，计数会暂停，回来后继续。", min: "最小化", max: "打开", done: "第 1 步 ✓", wait: "连接钱包",
      h3: "你已进入<b>空投。</b>", p3: "质押和 Hash Node 均已就绪。两者都保持到完成时长，即可赢得奖励。",
      p1n: "你的 Hash Node 已开启。质押 100 SECT 即可进入空投。", poff: "你的 Hash Node 已关闭：开启它，计数才会继续。",
      on: "已开启", off: "已关闭", chk: "检查中…", ctaOn: "查看我的空投", ctaOff: "开启我的 Hash Node", both: "2/2 ✓",
      hw: "如何开启你的 Hash Node", hw1: "打开仪表盘并连接同一个钱包", hw2: "点击「激活我的节点」：免费、一键、无需 gas", hw3: "节点立即开启。加上质押，你的空投开始计算", hwp: "打开仪表盘", hwn: "前往你的节点",
      acc: "目前已产生", of: "完成时长后共 {n} SECT", calc: "正在与网络计算…", pre: "从空投开放当天开始计数。", lock: "自 {d}（满 30 天）起，产生的部分归你所有。", mine: "已产生的部分归你所有。",
      who: "钱包 {a}", pzW: "在 {l} 等级时你已产生 {g} SECT。重新存入之前的余额（质押 {b} SECT）即可继续累计。", pzN: "现在：{l} 等级，质押 {s} SECT · 奖励 {p} SECT。", wNone: "此钱包尚未激活节点", wOn: "节点已开启", wOff: "节点已关闭", wChk: "正在检查节点…", wErr: "无法查询网络，正在重试…",
      keep: "你的质押照常运行。加入我们的验证者网络是可选的：只需连接一个 Hash Node，就能额外获得 Airdrop Genesis 奖励。",
      newB: "新", newT: "Airdrop Genesis 已开放",
      msgK: "致质押用户 · Airdrop Genesis",
      msgT: "Airdrop Genesis 现已开放。你的质押和现在完全一样：同样的奖励、无锁定、无需取出任何东西。参与是可选的：用同一个钱包连接一个 Hash Node，你质押的 SECT 也会计入 Airdrop Genesis。",
      msgA: "你的空投窗口", msgR: "阅读规则", cInfo: "空投网站信息", cMy: "我的空投面板",
      dK: "空投发放", dT: "在 SectoraEVM 上线时发放。", dP: "你在 Airdrop Genesis 中产生的 #SECT 将在 SectoraEVM 上线时发放，时间在 2027年3月15日供应量削减之后。你的质押奖励与空投分开，随时都可以领取。",
      d1a: "现在", d1b: "持续产生", d2a: "2027年3月15日", d2b: "供应量削减", d3a: "SectoraEVM", d3b: "发放" },
    hi: { loc: "hi-IN", bar: "airdrop genesis", band: "Airdrop Genesis", k: "आपका एयरड्रॉप",
      h0: "<b>अपना लेवल</b> देखने के लिए वॉलेट कनेक्ट करें।", p0: "आपकी स्टेकिंग एयरड्रॉप में गिनी जाती है, कुछ भी निकाले बिना।",
      h1: "जुड़ने के लिए <b>{x} SECT</b> और चाहिए।", p1: "100 SECT स्टेकिंग में होने पर आप Scout हैं और एयरड्रॉप में हैं।",
      h2: "चरण 1 <b>पूरा।</b>", p2: "आप पहले से शामिल हैं: और कुछ नहीं करना है। बस इसी वॉलेट से अपना Hash Node चालू करें और भाग लेना शुरू करें।",
      s1: "चरण 1 · स्टेकिंग में SECT", s1min: "न्यूनतम 100", s2: "चरण 2 · अपना Hash Node कनेक्ट करें", s2t: "आख़िरी चरण",
      lv: "आपका लेवल", lvs: "लेवल {n}", sp: "स्थान", sps: "{l} स्थान", pz: "आपका इनाम", pzs: "अपना समय पूरा करने पर SECT",
      up: "{x} SECT और जोड़ें तो आप {l} पर पहुँचेंगे और इनाम {p} SECT हो जाएगा।", top: "Titan की कोई सीमा नहीं: हर 1,000 SECT और पर 900 SECT जुड़ते हैं।",
      cta: "मेरा Hash Node कनेक्ट करें", more: "एयरड्रॉप देखें", have: "पहले से चालू है? एयरड्रॉप में जाँचें।",
      note: "कोई लॉक-अप नहीं: निकालने पर आपकी गिनती रुकती है और लौटने पर जारी रहती है।", min: "छोटा करें", max: "खोलें", done: "चरण 1 ✓", wait: "वॉलेट कनेक्ट करें",
      h3: "आप <b>एयरड्रॉप</b> में हैं।", p3: "स्टेकिंग और Hash Node तैयार हैं। इनाम जीतने के लिए समय पूरा होने तक दोनों रखें।",
      p1n: "आपका Hash Node पहले से चालू है। 100 SECT स्टेकिंग में होने पर आप एयरड्रॉप में हैं।", poff: "आपका Hash Node बंद है: उसे चालू करें ताकि गिनती चलती रहे।",
      on: "चालू", off: "बंद", chk: "जाँच हो रही है…", ctaOn: "मेरा एयरड्रॉप देखें", ctaOff: "मेरा Hash Node चालू करें", both: "2/2 ✓",
      hw: "अपना Hash Node कैसे चालू करें", hw1: "डैशबोर्ड खोलें और यही वॉलेट कनेक्ट करें", hw2: "“मेरा नोड चालू करें” दबाएँ: मुफ़्त, एक क्लिक, बिना गैस", hw3: "आपका नोड तुरंत चालू हो जाता है। स्टेकिंग के साथ आपका एयरड्रॉप गिना जाता है", hwp: "डैशबोर्ड खोलें", hwn: "अपने नोड पर जाएँ",
      acc: "अब तक बना", of: "समय पूरा होने पर {n} SECT में से", calc: "नेटवर्क से गणना हो रही है…", pre: "गिनती एयरड्रॉप खुलने के दिन से शुरू होती है।", lock: "{d} से (30 दिन बाद) जो बनता है वह आपका है।", mine: "जो बना है वह अब आपका है।",
      who: "वॉलेट {a}", pzW: "{l} स्तर पर आपके {g} SECT बने थे। अपना पिछला बैलेंस ({b} SECT स्टेकिंग में) फिर से जमा करें और यह फिर चलने लगेगा।", pzN: "अब: {l} स्तर, स्टेकिंग में {s} SECT · इनाम {p} SECT।", wNone: "इस वॉलेट से अभी कोई नोड चालू नहीं", wOn: "नोड चालू", wOff: "नोड बंद", wChk: "नोड जाँचा जा रहा है…", wErr: "नेटवर्क नहीं जाँच सके, फिर कोशिश हो रही है…",
      keep: "आपकी स्टेकिंग पहले की तरह चलती रहती है। हमारे वैलिडेटर नेटवर्क से जुड़ना वैकल्पिक है: बस एक Hash Node कनेक्ट करें और आप Airdrop Genesis इनाम भी जोड़ सकते हैं।",
      newB: "नया", newT: "Airdrop Genesis खुला है",
      msgK: "स्टेकर्स के लिए संदेश · Airdrop Genesis",
      msgT: "Airdrop Genesis अब खुला है। आपकी स्टेकिंग बिल्कुल आज की तरह चलती रहती है: वही इनाम, कोई लॉक-अप नहीं और कुछ भी निकालना नहीं। भाग लेना वैकल्पिक है: इसी वॉलेट से एक Hash Node कनेक्ट करें और स्टेकिंग में आपके SECT भी Airdrop Genesis में गिने जाएँगे।",
      msgA: "आपकी एयरड्रॉप विंडो", msgR: "नियम पढ़ें", cInfo: "एयरड्रॉप वेबसाइट जानकारी", cMy: "मेरा एयरड्रॉप पैनल",
      dK: "एयरड्रॉप डिलीवरी", dT: "SectoraEVM लॉन्च पर दिया जाएगा।", dP: "Airdrop Genesis में आप जो #SECT बनाते हैं, वे 15 मार्च 2027 की सप्लाई कमी के बाद, SectoraEVM के लॉन्च पर दिए जाएँगे। आपके स्टेकिंग रिवॉर्ड अलग रहते हैं और आप उन्हें कभी भी क्लेम कर सकते हैं।",
      d1a: "अभी", d1b: "आप बनाते हैं", d2a: "15 मार्च 2027", d2b: "सप्लाई में कमी", d3a: "SectoraEVM", d3b: "डिलीवरी" },
    ar: { loc: "ar-u-nu-latn", bar: "airdrop genesis", band: "Airdrop Genesis", k: "إيردروبك",
      h0: "اربط محفظتك لترى <b>مستواك.</b>", p0: "تُحتسب عملية التخزين لديك في الإيردروب، دون سحب أي شيء.",
      h1: "تحتاج إلى <b>{x} SECT</b> إضافية للانضمام.", p1: "مع 100 SECT في التخزين تصبح Scout وتدخل الإيردروب.",
      h2: "الخطوة 1 <b>مكتملة.</b>", p2: "أنت مشارك بالفعل: لا داعي لفعل أي شيء آخر. فقط شغّل Hash Node بالمحفظة نفسها وتبدأ المشاركة.",
      s1: "الخطوة 1 · SECT في التخزين", s1min: "الحد الأدنى 100", s2: "الخطوة 2 · اربط Hash Node", s2t: "الخطوة الأخيرة",
      lv: "مستواك", lvs: "المستوى {n}", sp: "المقاعد", sps: "من {l}", pz: "جائزتك", pzs: "SECT عند إكمال مدتك",
      up: "مع {x} SECT إضافية تنتقل إلى {l} وترتفع جائزتك إلى {p} SECT.", top: "لا حد أقصى لـ Titan: كل 1,000 SECT إضافية تضيف 900 SECT.",
      cta: "اربط Hash Node الخاص بي", more: "عرض الإيردروب", have: "مشغّل بالفعل؟ تحقّق منه في الإيردروب.",
      note: "بلا قفل: إذا سحبت، يتوقف العد مؤقتًا ويستمر عند عودتك.", min: "تصغير", max: "فتح", done: "الخطوة 1 ✓", wait: "اربط المحفظة",
      h3: "أنت في <b>الإيردروب.</b>", p3: "التخزين وHash Node جاهزان. حافظ عليهما حتى تكمل مدتك لتربح جائزتك.",
      p1n: "Hash Node لديك يعمل بالفعل. مع 100 SECT في التخزين تدخل الإيردروب.", poff: "Hash Node لديك متوقف: شغّله ليستمر العد.",
      on: "يعمل", off: "متوقف", chk: "جارٍ التحقق…", ctaOn: "عرض إيردروبي", ctaOff: "شغّل Hash Node الخاص بي", both: "2/2 ✓",
      hw: "كيف تشغّل Hash Node", hw1: "افتح اللوحة واربط المحفظة نفسها", hw2: "اضغط «تفعيل عقدتي»: مجانًا، نقرة واحدة، بلا غاز", hw3: "تعمل عقدتك فورًا. مع تخزينك، يُحتسب الإيردروب", hwp: "فتح اللوحة", hwn: "اذهب إلى عقدتك",
      acc: "ما تولّد حتى الآن", of: "من {n} SECT عند إكمال مدتك", calc: "جارٍ الحساب مع الشبكة…", pre: "يبدأ العد يوم افتتاح الإيردروب.", lock: "اعتبارًا من {d} (بعد 30 يومًا) يصبح ما يتولّد ملكك.", mine: "ما تولّد أصبح ملكك.",
      who: "المحفظة {a}", pzW: "في مستوى {l} كان لديك {g} SECT. أودِع رصيدك السابق ({b} SECT في التخزين) ليعود العدّاد إلى العمل.", pzN: "الآن: مستوى {l} مع {s} SECT في التخزين · الجائزة {p} SECT.", wNone: "لا توجد عقدة مفعّلة بهذه المحفظة بعد", wOn: "العقدة تعمل", wOff: "العقدة متوقفة", wChk: "جارٍ التحقق من العقدة…", wErr: "تعذّر الاتصال بالشبكة، جارٍ إعادة المحاولة…",
      keep: "يستمر التخزين لديك كالمعتاد. الانضمام إلى شبكة المدققين لدينا اختياري: فقط اربط Hash Node ويمكنك إضافة مكافآت Airdrop Genesis.",
      newB: "جديد", newT: "Airdrop Genesis مفتوح",
      msgK: "رسالة لمستخدمي التخزين · Airdrop Genesis",
      msgT: "Airdrop Genesis مفتوح الآن. يستمر التخزين لديك تمامًا كما هو اليوم: المكافآت نفسها، بلا قفل ودون سحب أي شيء. المشاركة اختيارية: اربط Hash Node بالمحفظة نفسها وستُحتسب SECT المخزّنة لديك أيضًا في Airdrop Genesis.",
      msgA: "نافذة الإيردروب الخاصة بك", msgR: "اقرأ القواعد", cInfo: "معلومات موقع الإيردروب", cMy: "لوحة الإيردروب الخاصة بي",
      dK: "تسليم الإيردروب", dT: "يُسلَّم عند إطلاق SectoraEVM.", dP: "تُسلَّم ⁦#SECT⁩ التي تولّدها في Airdrop Genesis عند إطلاق SectoraEVM، بعد خفض المعروض في 15 مارس 2027. ومكافآت التخزين منفصلة ويمكنك استلامها في أي وقت.",
      d1a: "الآن", d1b: "تولّد", d2a: "15 مارس 2027", d2b: "خفض المعروض", d3a: "SectoraEVM", d3b: "التسليم" },
    fr: { loc: "fr-FR", bar: "airdrop genesis", band: "Airdrop Genesis", k: "Votre airdrop",
      h0: "Connectez votre wallet pour voir <b>votre niveau.</b>", p0: "Votre staking compte pour l’airdrop, sans rien retirer.",
      h1: "Il vous manque <b>{x} SECT</b> pour participer.", p1: "Avec 100 SECT en staking, vous êtes Scout et vous entrez dans l’airdrop.",
      h2: "Étape 1 <b>terminée.</b>", p2: "Vous y êtes déjà : vous n’avez rien d’autre à faire. Allumez simplement votre Hash Node avec ce même wallet et vous commencez à participer.",
      s1: "Étape 1 · SECT en staking", s1min: "Min. 100", s2: "Étape 2 · Connectez votre Hash Node", s2t: "Dernière étape",
      lv: "Votre niveau", lvs: "Niveau {n}", sp: "Places", sps: "de {l}", pz: "Votre prix", pzs: "SECT à la fin de votre durée",
      up: "Avec {x} SECT de plus, vous passez à {l} et votre prix monte à {p} SECT.", top: "Titan n’a pas de maximum : chaque 1 000 SECT de plus ajoutent 900 SECT.",
      cta: "Connecter mon Hash Node", more: "Voir l’airdrop", have: "Déjà allumé ? Vérifiez-le dans l’airdrop.",
      note: "Sans blocage : si vous retirez, votre décompte se met en pause et reprend à votre retour.", min: "Réduire", max: "Ouvrir", done: "Étape 1 ✓", wait: "Connecter le wallet",
      h3: "Vous êtes dans <b>l’airdrop.</b>", p3: "Staking et Hash Node prêts. Gardez les deux jusqu’à la fin de votre durée pour gagner votre prix.",
      p1n: "Votre Hash Node est déjà allumé. Avec 100 SECT en staking, vous entrez dans l’airdrop.", poff: "Votre Hash Node est éteint : allumez-le pour que votre décompte continue.",
      on: "Allumé", off: "Éteint", chk: "Vérification…", ctaOn: "Voir mon airdrop", ctaOff: "Allumer mon Hash Node", both: "2/2 ✓",
      hw: "Comment allumer votre Hash Node", hw1: "Ouvrez le dashboard et connectez ce même wallet", hw2: "Appuyez sur « Activer mon nœud » : gratuit, un clic, sans gas", hw3: "Votre nœud s’allume aussitôt. Avec votre staking, votre airdrop compte", hwp: "Ouvrir le dashboard", hwn: "Aller à votre nœud",
      acc: "Généré jusqu’ici", of: "sur {n} SECT à la fin de votre durée", calc: "Calcul avec le réseau…", pre: "Le décompte commence le jour de l’ouverture de l’airdrop.", lock: "À partir du {d} (30 jours dedans), ce que vous générez vous appartient.", mine: "Ce que vous avez généré vous appartient déjà.",
      who: "Wallet {a}", pzW: "Au niveau {l}, vous aviez {g} SECT générés. Redéposez votre solde précédent ({b} SECT en staking) et le compteur repart.", pzN: "Maintenant : niveau {l} avec {s} SECT en staking · prix {p} SECT.", wNone: "aucun nœud activé avec ce wallet pour l’instant", wOn: "nœud allumé", wOff: "nœud éteint", wChk: "vérification de son nœud…", wErr: "impossible de consulter le réseau, nouvel essai…",
      keep: "Votre staking continue de fonctionner normalement. Rejoindre notre réseau de validateurs est facultatif : connectez simplement un Hash Node et vous pourrez ajouter des récompenses Airdrop Genesis.",
      newB: "Nouveau", newT: "Airdrop Genesis est ouvert",
      msgK: "Message aux utilisateurs du staking · Airdrop Genesis",
      msgT: "Airdrop Genesis est maintenant ouvert. Votre staking fonctionne exactement comme aujourd’hui : les mêmes récompenses, sans blocage et sans rien retirer. Participer est facultatif : connectez un Hash Node avec ce même wallet et vos SECT en staking comptent aussi pour Airdrop Genesis.",
      msgA: "Votre fenêtre airdrop", msgR: "Lire les règles", cInfo: "Infos du site airdrop", cMy: "Mon panneau airdrop",
      dK: "Livraison de l’airdrop", dT: "Livré au lancement de SectoraEVM.", dP: "Les #SECT que vous générez dans Airdrop Genesis sont livrés au lancement de SectoraEVM, après la réduction de l’offre du 15 mars 2027. Vos récompenses de staking restent à part et peuvent être réclamées à tout moment.",
      d1a: "Maintenant", d1b: "Vous générez", d2a: "15 mars 2027", d2b: "Réduction de l’offre", d3a: "SectoraEVM", d3b: "Livraison" },
    ru: { loc: "ru-RU", bar: "airdrop genesis", band: "Airdrop Genesis", k: "Ваш аирдроп",
      h0: "Подключите кошелёк, чтобы увидеть <b>свой уровень.</b>", p0: "Ваш стейкинг засчитывается в аирдроп, ничего выводить не нужно.",
      h1: "Чтобы участвовать, не хватает <b>{x} SECT</b>.", p1: "Со 100 SECT в стейкинге вы Scout и участвуете в аирдропе.",
      h2: "Шаг 1 <b>выполнен.</b>", p2: "Вы уже участвуете: больше ничего делать не нужно. Просто включите свой Hash Node с этим же кошельком — и вы начнёте участвовать.",
      s1: "Шаг 1 · SECT в стейкинге", s1min: "Мин. 100", s2: "Шаг 2 · Подключите Hash Node", s2t: "Последний шаг",
      lv: "Ваш уровень", lvs: "Уровень {n}", sp: "Места", sps: "уровня {l}", pz: "Ваш приз", pzs: "SECT по завершении срока",
      up: "Добавьте {x} SECT — перейдёте на {l}, и приз вырастет до {p} SECT.", top: "У Titan нет максимума: каждые 1 000 SECT сверху добавляют 900 SECT.",
      cta: "Подключить мой Hash Node", more: "Открыть аирдроп", have: "Уже включён? Проверьте в аирдропе.",
      note: "Без блокировки: если выведете, счёт встанет на паузу и продолжится, когда вернётесь.", min: "Свернуть", max: "Открыть", done: "Шаг 1 ✓", wait: "Подключить кошелёк",
      h3: "Вы участвуете в <b>аирдропе.</b>", p3: "Стейкинг и Hash Node готовы. Сохраняйте оба до конца срока, чтобы получить приз.",
      p1n: "Ваш Hash Node уже включён. Со 100 SECT в стейкинге вы участвуете в аирдропе.", poff: "Ваш Hash Node выключен: включите его, чтобы счёт продолжился.",
      on: "Включён", off: "Выключен", chk: "Проверка…", ctaOn: "Мой аирдроп", ctaOff: "Включить мой Hash Node", both: "2/2 ✓",
      hw: "Как включить Hash Node", hw1: "Откройте дашборд и подключите этот же кошелёк", hw2: "Нажмите «Активировать мой узел»: бесплатно, один клик, без газа", hw3: "Узел включится сразу. Со стейкингом ваш эйрдроп засчитывается", hwp: "Открыть дашборд", hwn: "К вашему узлу",
      acc: "Уже накоплено", of: "из {n} SECT по завершении срока", calc: "Расчёт по данным сети…", pre: "Счёт начнётся в день открытия аирдропа.", lock: "С {d} (30 дней внутри) накопленное — ваше.", mine: "Накопленное уже ваше.",
      who: "Кошелёк {a}", pzW: "На уровне {l} у вас было {g} SECT. Внесите прежний баланс ({b} SECT в стейкинге), и счёт продолжится.", pzN: "Сейчас: уровень {l}, {s} SECT в стейкинге · награда {p} SECT.", wNone: "с этим кошельком узел ещё не активирован", wOn: "узел включён", wOff: "узел выключен", wChk: "проверяем узел…", wErr: "не удалось проверить сеть, повторяем…",
      keep: "Ваш стейкинг работает как обычно. Присоединиться к нашей сети валидаторов — по желанию: просто подключите Hash Node, и вы сможете дополнительно получать награды Airdrop Genesis.",
      newB: "Новое", newT: "Airdrop Genesis открыт",
      msgK: "Сообщение для участников стейкинга · Airdrop Genesis",
      msgT: "Airdrop Genesis уже открыт. Ваш стейкинг работает точно так же, как сегодня: те же награды, без блокировки и без вывода. Участие — по желанию: подключите Hash Node с этим же кошельком, и ваши SECT в стейкинге тоже будут засчитываться в Airdrop Genesis.",
      msgA: "Ваше окно аирдропа", msgR: "Читать правила", cInfo: "Сайт аирдропа", cMy: "Моя панель аирдропа",
      dK: "Выдача аирдропа", dT: "Выдаётся при запуске SectoraEVM.", dP: "#SECT, которые вы генерируете в Airdrop Genesis, выдаются при запуске SectoraEVM, после сокращения предложения 15 марта 2027 года. Награды за стейкинг идут отдельно, и их можно забрать в любой момент.",
      d1a: "Сейчас", d1b: "Вы генерируете", d2a: "15 мар 2027", d2b: "Сокращение предложения", d3a: "SectoraEVM", d3b: "Выдача" },
    de: { loc: "de-DE", bar: "airdrop genesis", band: "Airdrop Genesis", k: "Dein Airdrop",
      h0: "Verbinde deine Wallet, um <b>dein Level</b> zu sehen.", p0: "Dein Staking zählt für den Airdrop, ohne dass du etwas abhebst.",
      h1: "Dir fehlen noch <b>{x} SECT</b>, um dabei zu sein.", p1: "Mit 100 SECT im Staking bist du Scout und im Airdrop dabei.",
      h2: "Schritt 1 <b>erledigt.</b>", p2: "Du bist schon dabei: Du musst nichts weiter tun. Schalte einfach deinen Hash Node mit derselben Wallet ein und du nimmst teil.",
      s1: "Schritt 1 · SECT im Staking", s1min: "Min. 100", s2: "Schritt 2 · Verbinde deinen Hash Node", s2t: "Letzter Schritt",
      lv: "Dein Level", lvs: "Level {n}", sp: "Plätze", sps: "von {l}", pz: "Dein Preis", pzs: "SECT nach Ablauf deiner Zeit",
      up: "Mit {x} SECT mehr steigst du zu {l} auf und dein Preis wächst auf {p} SECT.", top: "Titan hat kein Maximum: je 1.000 SECT mehr kommen 900 SECT dazu.",
      cta: "Meinen Hash Node verbinden", more: "Zum Airdrop", have: "Schon an? Prüf es im Airdrop.",
      note: "Keine Sperre: Wenn du abhebst, pausiert dein Zähler und läuft weiter, wenn du zurückkommst.", min: "Minimieren", max: "Öffnen", done: "Schritt 1 ✓", wait: "Wallet verbinden",
      h3: "Du bist im <b>Airdrop.</b>", p3: "Staking und Hash Node bereit. Behalte beides, bis deine Zeit um ist, um deinen Preis zu gewinnen.",
      p1n: "Dein Hash Node ist schon an. Mit 100 SECT im Staking bist du im Airdrop dabei.", poff: "Dein Hash Node ist aus: Schalte ihn ein, damit dein Zähler weiterläuft.",
      on: "An", off: "Aus", chk: "Wird geprüft…", ctaOn: "Mein Airdrop", ctaOff: "Meinen Hash Node einschalten", both: "2/2 ✓",
      hw: "So schaltest du deinen Hash Node ein", hw1: "Öffne das Dashboard und verbinde dieselbe Wallet", hw2: "Tippe auf „Meinen Node aktivieren“: kostenlos, ein Klick, kein Gas", hw3: "Dein Node geht sofort an. Mit deinem Staking zählt dein Airdrop", hwp: "Dashboard öffnen", hwn: "Zu deinem Node",
      acc: "Bisher erzeugt", of: "von {n} SECT nach Ablauf deiner Zeit", calc: "Wird mit dem Netzwerk berechnet…", pre: "Die Zählung beginnt am Tag der Airdrop-Eröffnung.", lock: "Ab dem {d} (30 Tage dabei) gehört dir, was du erzeugst.", mine: "Was du erzeugt hast, gehört schon dir.",
      who: "Wallet {a}", pzW: "Auf Stufe {l} hattest du {g} SECT erzielt. Zahle deinen vorherigen Betrag ({b} SECT im Staking) wieder ein, dann läuft es weiter.", pzN: "Jetzt: Stufe {l} mit {s} SECT im Staking · Belohnung {p} SECT.", wNone: "noch kein Node mit dieser Wallet aktiviert", wOn: "Node an", wOff: "Node aus", wChk: "Node wird geprüft…", wErr: "Netzwerk nicht erreichbar, neuer Versuch…",
      keep: "Dein Staking läuft ganz normal weiter. Unserem Validator-Netzwerk beizutreten ist freiwillig: Verbinde einfach einen Hash Node und du kannst zusätzlich Airdrop-Genesis-Belohnungen erhalten.",
      newB: "Neu", newT: "Airdrop Genesis ist offen",
      msgK: "Nachricht an alle Staker · Airdrop Genesis",
      msgT: "Airdrop Genesis ist jetzt offen. Dein Staking läuft genau wie heute weiter: dieselben Belohnungen, keine Sperre und nichts abzuheben. Mitmachen ist freiwillig: Verbinde einen Hash Node mit derselben Wallet und deine SECT im Staking zählen auch für Airdrop Genesis.",
      msgA: "Dein Airdrop-Fenster", msgR: "Regeln lesen", cInfo: "Airdrop-Website-Infos", cMy: "Mein Airdrop-Panel",
      dK: "Airdrop-Auszahlung", dT: "Ausgezahlt zum Start von SectoraEVM.", dP: "Die #SECT, die du in Airdrop Genesis erzeugst, werden zum Start von SectoraEVM ausgezahlt, nach der Angebotsreduzierung am 15. März 2027. Deine Staking-Belohnungen bleiben getrennt und lassen sich jederzeit abholen.",
      d1a: "Jetzt", d1b: "Du erzeugst", d2a: "15. März 2027", d2b: "Angebots\u00adreduzierung", d3a: "SectoraEVM", d3b: "Auszahlung" },
    ja: { loc: "ja-JP", bar: "airdrop genesis", band: "Airdrop Genesis", k: "あなたのエアドロップ",
      h0: "ウォレットを接続して<b>レベルを確認。</b>", p0: "ステーキングはそのままエアドロップの対象です。何も引き出す必要はありません。",
      h1: "参加まであと <b>{x} SECT</b>。", p1: "100 SECT をステーキングすれば Scout としてエアドロップに参加できます。",
      h2: "ステップ 1 <b>完了。</b>", p2: "すでに参加しています。ほかに必要なことはありません。同じウォレットで Hash Node をオンにすれば参加が始まります。",
      s1: "ステップ 1 · ステーキング中の SECT", s1min: "最低 100", s2: "ステップ 2 · Hash Node を接続", s2t: "最後のステップ",
      lv: "あなたのレベル", lvs: "レベル {n}", sp: "枠", sps: "{l} の枠", pz: "あなたの賞品", pzs: "期間を満了すると受け取れる SECT",
      up: "あと {x} SECT で {l} に上がり、賞品は {p} SECT になります。", top: "Titan に上限はありません：1,000 SECT 増えるごとに 900 SECT 加算。",
      cta: "Hash Node を接続", more: "エアドロップを見る", have: "すでにオン？エアドロップで確認。",
      note: "ロックなし：引き出すとカウントは一時停止し、戻ると再開します。", min: "最小化", max: "開く", done: "ステップ 1 ✓", wait: "ウォレットを接続",
      h3: "<b>エアドロップ</b>に参加中です。", p3: "ステーキングと Hash Node の準備完了。期間を満了するまで両方を維持すると賞品を獲得できます。",
      p1n: "Hash Node はすでにオンです。100 SECT をステーキングすればエアドロップに参加できます。", poff: "Hash Node がオフです。カウントを続けるにはオンにしてください。",
      on: "オン", off: "オフ", chk: "確認中…", ctaOn: "マイエアドロップ", ctaOff: "Hash Node をオンにする", both: "2/2 ✓",
      hw: "Hash Node をオンにする方法", hw1: "ダッシュボードを開き、この同じウォレットを接続", hw2: "「ノードを有効にする」を押す：無料・ワンクリック・ガス不要", hw3: "ノードはすぐにオンに。ステーキングと合わせてエアドロップがカウントされます", hwp: "ダッシュボードを開く", hwn: "ノードへ",
      acc: "これまでの生成量", of: "期間満了で {n} SECT のうち", calc: "ネットワークで計算中…", pre: "エアドロップ開始日からカウントが始まります。", lock: "{d}（30 日経過）以降、生成分はあなたのものです。", mine: "生成分はすでにあなたのものです。",
      who: "ウォレット {a}", pzW: "{l} レベルでは {g} SECT を生み出していました。以前の残高（ステーキング {b} SECT）を再び預けると、また進みます。", pzN: "現在：{l} レベル、ステーキング {s} SECT · 報酬 {p} SECT。", wNone: "このウォレットで有効化されたノードはまだありません", wOn: "ノード オン", wOff: "ノード オフ", wChk: "ノードを確認中…", wErr: "ネットワークを確認できません。再試行中…",
      keep: "ステーキングはこれまでどおり動きます。バリデーターネットワークへの参加は任意です。Hash Node を接続するだけで Airdrop Genesis の報酬を上乗せできます。",
      newB: "新着", newT: "Airdrop Genesis 開始",
      msgK: "ステーキング利用者へのお知らせ · Airdrop Genesis",
      msgT: "Airdrop Genesis が始まりました。ステーキングは今日とまったく同じように動きます。報酬も同じ、ロックなし、引き出しも不要です。参加は任意です。同じウォレットで Hash Node を接続すると、ステーキング中の SECT も Airdrop Genesis の対象になります。",
      msgA: "エアドロップ画面", msgR: "ルールを読む", cInfo: "エアドロップサイト情報", cMy: "マイエアドロップパネル",
      dK: "エアドロップの配布", dT: "SectoraEVM のローンチ時に配布されます。", dP: "Airdrop Genesis で生成した #SECT は、2027年3月15日の供給量削減の後、SectoraEVM のローンチ時に配布されます。ステーキング報酬はエアドロップとは別で、いつでも受け取れます。",
      d1a: "現在", d1b: "生成中", d2a: "2027年3月15日", d2b: "供給量削減", d3a: "SectoraEVM", d3b: "配布" },
    ko: { loc: "ko-KR", bar: "airdrop genesis", band: "Airdrop Genesis", k: "내 에어드롭",
      h0: "지갑을 연결해 <b>내 레벨</b>을 확인하세요.", p0: "스테이킹은 아무것도 출금하지 않고 그대로 에어드롭에 반영됩니다.",
      h1: "참여까지 <b>{x} SECT</b> 더 필요합니다.", p1: "100 SECT를 스테이킹하면 Scout로 에어드롭에 참여합니다.",
      h2: "1단계 <b>완료.</b>", p2: "이미 참여 중입니다. 더 할 일은 없습니다. 같은 지갑으로 Hash Node를 켜기만 하면 참여가 시작됩니다.",
      s1: "1단계 · 스테이킹 중인 SECT", s1min: "최소 100", s2: "2단계 · Hash Node 연결", s2t: "마지막 단계",
      lv: "내 레벨", lvs: "레벨 {n}", sp: "자리", sps: "{l} 자리", pz: "내 보상", pzs: "기간을 채우면 받는 SECT",
      up: "{x} SECT를 더하면 {l}로 올라가고 보상은 {p} SECT가 됩니다.", top: "Titan은 상한이 없습니다: 1,000 SECT마다 900 SECT가 더해집니다.",
      cta: "내 Hash Node 연결", more: "에어드롭 보기", have: "이미 켜져 있나요? 에어드롭에서 확인하세요.",
      note: "잠금 없음: 출금하면 집계가 일시 중지되고 돌아오면 이어집니다.", min: "최소화", max: "열기", done: "1단계 ✓", wait: "지갑 연결",
      h3: "<b>에어드롭</b>에 참여 중입니다.", p3: "스테이킹과 Hash Node 준비 완료. 보상을 받으려면 기간을 채울 때까지 둘 다 유지하세요.",
      p1n: "Hash Node는 이미 켜져 있습니다. 100 SECT를 스테이킹하면 에어드롭에 참여합니다.", poff: "Hash Node가 꺼져 있습니다. 집계가 계속되도록 켜 주세요.",
      on: "켜짐", off: "꺼짐", chk: "확인 중…", ctaOn: "내 에어드롭 보기", ctaOff: "내 Hash Node 켜기", both: "2/2 ✓",
      hw: "Hash Node 켜는 방법", hw1: "대시보드를 열고 이 지갑을 연결하세요", hw2: "‘내 노드 활성화’를 누르세요: 무료, 클릭 한 번, 가스 없음", hw3: "노드가 바로 켜집니다. 스테이킹과 함께 에어드롭이 집계됩니다", hwp: "대시보드 열기", hwn: "내 노드로",
      acc: "지금까지 생성", of: "기간 완료 시 {n} SECT 중", calc: "네트워크로 계산 중…", pre: "에어드롭이 열리는 날부터 집계가 시작됩니다.", lock: "{d}(30일 경과)부터 생성분은 당신의 것입니다.", mine: "생성분은 이미 당신의 것입니다.",
      who: "지갑 {a}", pzW: "{l} 레벨에서 {g} SECT를 적립했습니다. 이전 잔액(스테이킹 {b} SECT)을 다시 예치하면 다시 쌓입니다.", pzN: "현재: {l} 레벨, 스테이킹 {s} SECT · 보상 {p} SECT.", wNone: "이 지갑으로 활성화된 노드가 아직 없음", wOn: "노드 켜짐", wOff: "노드 꺼짐", wChk: "노드 확인 중…", wErr: "네트워크를 확인할 수 없어 다시 시도 중…",
      keep: "스테이킹은 평소대로 작동합니다. 검증자 네트워크 참여는 선택 사항입니다. Hash Node만 연결하면 Airdrop Genesis 보상을 추가로 받을 수 있습니다.",
      newB: "신규", newT: "Airdrop Genesis 오픈",
      msgK: "스테이킹 이용자 안내 · Airdrop Genesis",
      msgT: "Airdrop Genesis가 열렸습니다. 스테이킹은 지금과 똑같이 작동합니다. 같은 보상, 잠금 없음, 출금할 필요도 없습니다. 참여는 선택 사항입니다. 같은 지갑으로 Hash Node를 연결하면 스테이킹 중인 SECT도 Airdrop Genesis에 반영됩니다.",
      msgA: "내 에어드롭 창", msgR: "규칙 읽기", cInfo: "에어드롭 웹사이트 정보", cMy: "내 에어드롭 패널",
      dK: "에어드롭 지급", dT: "SectoraEVM 출시 때 지급됩니다.", dP: "Airdrop Genesis에서 생성한 #SECT는 2027년 3월 15일 공급량 감축 이후, SectoraEVM 출시 때 지급됩니다. 스테이킹 보상은 별도이며 언제든 받을 수 있습니다.",
      d1a: "지금", d1b: "생성 중", d2a: "2027년 3월 15일", d2b: "공급량 감축", d3a: "SectoraEVM", d3b: "지급" },
    it: { loc: "it-IT", bar: "airdrop genesis", band: "Airdrop Genesis", k: "Il tuo airdrop",
      h0: "Collega il wallet per vedere <b>il tuo livello.</b>", p0: "Il tuo staking conta per l’airdrop, senza ritirare nulla.",
      h1: "Ti mancano <b>{x} SECT</b> per entrare.", p1: "Con 100 SECT in staking sei Scout ed entri nell’airdrop.",
      h2: "Passo 1 <b>completato.</b>", p2: "Sei già dentro: non devi fare altro. Accendi il tuo Hash Node con questo stesso wallet e inizi a partecipare.",
      s1: "Passo 1 · SECT in staking", s1min: "Min. 100", s2: "Passo 2 · Collega il tuo Hash Node", s2t: "Ultimo passo",
      lv: "Il tuo livello", lvs: "Livello {n}", sp: "Posti", sps: "di {l}", pz: "Il tuo premio", pzs: "SECT al termine del tuo periodo",
      up: "Con altri {x} SECT sali a {l} e il tuo premio arriva a {p} SECT.", top: "Titan non ha massimo: ogni 1.000 SECT in più aggiungono 900 SECT.",
      cta: "Collega il mio Hash Node", more: "Vedi l’airdrop", have: "Già acceso? Controllalo nell’airdrop.",
      note: "Nessun blocco: se ritiri, il conteggio si mette in pausa e riprende quando torni.", min: "Riduci", max: "Apri", done: "Passo 1 ✓", wait: "Collega il wallet",
      h3: "Sei nell’<b>airdrop.</b>", p3: "Staking e Hash Node pronti. Mantienili entrambi fino al termine del tuo periodo per vincere il premio.",
      p1n: "Il tuo Hash Node è già acceso. Con 100 SECT in staking entri nell’airdrop.", poff: "Il tuo Hash Node è spento: accendilo perché il conteggio continui.",
      on: "Acceso", off: "Spento", chk: "Verifica…", ctaOn: "Il mio airdrop", ctaOff: "Accendi il mio Hash Node", both: "2/2 ✓",
      hw: "Come accendere il tuo Hash Node", hw1: "Apri la dashboard e collega questo stesso wallet", hw2: "Premi “Attiva il mio nodo”: gratis, un clic, senza gas", hw3: "Il nodo si accende subito. Con il tuo staking, il tuo airdrop conta", hwp: "Apri la dashboard", hwn: "Vai al tuo nodo",
      acc: "Generato finora", of: "su {n} SECT al termine del periodo", calc: "Calcolo con la rete…", pre: "Il conteggio parte il giorno di apertura dell’airdrop.", lock: "Dal {d} (30 giorni dentro) ciò che generi è tuo.", mine: "Ciò che hai generato è già tuo.",
      who: "Wallet {a}", pzW: "Al livello {l} avevi {g} SECT generati. Deposita di nuovo il saldo precedente ({b} SECT in staking) e il conteggio riparte.", pzN: "Ora: livello {l} con {s} SECT in staking · premio {p} SECT.", wNone: "nessun nodo ancora attivato con questo wallet", wOn: "nodo acceso", wOff: "nodo spento", wChk: "verifica del nodo…", wErr: "impossibile consultare la rete, nuovo tentativo…",
      keep: "Il tuo staking continua a funzionare come sempre. Unirti alla nostra rete di validatori è facoltativo: collega un Hash Node e potrai aggiungere le ricompense di Airdrop Genesis.",
      newB: "Novità", newT: "Airdrop Genesis è aperto",
      msgK: "Messaggio per chi fa staking · Airdrop Genesis",
      msgT: "Airdrop Genesis è aperto. Il tuo staking funziona esattamente come oggi: stesse ricompense, nessun blocco e niente da ritirare. Partecipare è facoltativo: collega un Hash Node con questo stesso wallet e i tuoi SECT in staking contano anche per Airdrop Genesis.",
      msgA: "La tua finestra airdrop", msgR: "Leggi le regole", cInfo: "Info sito airdrop", cMy: "Il mio pannello airdrop",
      dK: "Consegna dell’airdrop", dT: "Consegnato al lancio di SectoraEVM.", dP: "I #SECT che generi in Airdrop Genesis vengono consegnati al lancio di SectoraEVM, dopo la riduzione dell’offerta del 15 marzo 2027. Le tue ricompense di staking restano separate e puoi riscuoterle in qualsiasi momento.",
      d1a: "Ora", d1b: "Generi", d2a: "15 mar 2027", d2b: "Riduzione dell’offerta", d3a: "SectoraEVM", d3b: "Consegna" }
  };
  // el idioma de la pagina: el que el visitante elige en su selector (staking-i18n.js); abre en ingles
  function pick() {
    var l = window.SECTORA_STAKE_LANG || "";
    // sin el selector de la pagina (staking-i18n.js), el idioma del navegador
    if (!l && !window.SectoraStakeT) {
      try { l = localStorage.getItem("sa_lang") || ""; } catch (e) {}
      if (!T[l]) l = (navigator.language || "").slice(0, 2);
    }
    return T[l] ? l : "en";
  }
  var L = T[pick()];

  /* same look as the staking console beside it: a band and a white card with
     the blue top line; a level box in light grey and the node step in blue */
  var css = "" +
    ".sad{--b:#1569ff;--bd:#0d4fd8;--ink:#07080a;--ink2:#3c414c;--ink3:#6b7280;--ink4:#9aa0ab;--line:rgba(0,0,0,.11);--ok:#0f8f52;" +
    "position:relative;margin:0 0 clamp(18px,2.4vw,28px);padding:clamp(14px,1.4vw,20px);border:1px solid var(--line);border-radius:22px;background:rgba(255,255,255,.35);" +
    "font-family:'IBM Plex Sans',system-ui,sans-serif;font-weight:300;color:var(--ink)}" +
    ".sad .m{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:400}" +
    ".sad-band{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;font-size:10.5px}" +
    ".sad-band span{color:var(--ink3)}" +
    ".sad-band b{color:var(--b);font-weight:500}" +
    ".sad-card{position:relative;overflow:hidden;background:#fff;color:var(--ink);padding:clamp(18px,2vw,26px);border:1px solid rgba(0,0,0,.08);border-radius:16px;" +
    "box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 24px 60px -36px rgba(7,8,10,.28)}" +
    ".sad-card::after{content:'';position:absolute;left:0;right:0;top:0;height:3px;background:var(--b)}" +
    ".sad-head{display:flex;align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--line);font-size:9.5px;color:var(--ink4)}" +
    ".sad-head .sp{flex:1}" +
    ".sad-cnt{display:none;color:var(--bd)}" +
    ".sad.min .sad-cnt{display:inline}" +
    ".sad-min{display:grid;place-items:center;width:28px;height:24px;padding:0;border:1px solid var(--line);border-radius:8px;background:none;color:var(--ink3);cursor:pointer;font:inherit;transition:border-color .3s,color .3s}" +
    ".sad-min:hover{border-color:var(--ink3);color:var(--ink)}" +
    ".sad-min i{display:block;width:10px;height:1px;background:currentColor;position:relative}" +
    ".sad.min .sad-min i::after{content:'';position:absolute;left:0;top:0;width:10px;height:1px;background:currentColor;transform:rotate(90deg)}" +
    ".sad-body{padding-top:18px}" +
    ".sad.min .sad-body{display:none}" +
    ".sad-k{color:var(--b)}" +
    ".sad h3{margin:10px 0 0;font-size:clamp(22px,1.9vw,27px);font-weight:300;letter-spacing:-.02em;line-height:1.15;color:var(--ink)}" +
    ".sad h3 b{font-weight:400;color:var(--b)}" +
    ".sad-p{margin:10px 0 0;font-size:14.5px;line-height:1.6;color:var(--ink2)}" +
    /* the two steps */
    ".sad-steps{list-style:none;margin:18px 0 0;padding:0;border-top:1px solid var(--line)}" +
    ".sad-steps li{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:12px;align-items:center;padding:13px 0;border-bottom:1px solid var(--line);font-size:14.5px;line-height:1.4;color:var(--ink2)}" +
    ".sad-ic{position:relative;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;border:1.5px solid #c3c7cf;color:transparent;font-size:12px;line-height:1;font-weight:500}" +
    ".sad-steps li.done{color:var(--ink)}" +
    ".sad-steps li.done .sad-ic{border-color:var(--ok);background:var(--ok);color:#fff}" +
    ".sad-steps li.next .sad-ic{border-color:var(--b);box-shadow:0 0 0 4px rgba(21,105,255,.12)}" +
    ".sad-steps li.next .sad-ic::after{content:'';position:absolute;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:var(--b);animation:sadPulse 1.8s ease-in-out infinite}" +
    "@keyframes sadPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}" +
    ".sad-steps .v{font-variant-numeric:tabular-nums;color:var(--ink);font-weight:400;white-space:nowrap}" +
    ".sad-steps li .tg{color:var(--ink4);white-space:nowrap}" +
    ".sad-steps li.next .tg{color:var(--bd)}" +
    ".sad-steps li.done .tg{color:var(--ok)}" +
    ".sad-steps li.off .tg{color:#a86400}" +
    ".sad-who{margin:10px 0 0;font-size:9.5px;line-height:1.6;color:var(--ink3)}" +
    ".sad-acc{margin-top:14px;padding:14px 16px;border-radius:12px;border:1px solid rgba(15,143,82,.28);background:linear-gradient(135deg,rgba(15,143,82,.08),rgba(15,143,82,.02))}" +
    ".sad-acc .m{color:var(--ok);font-size:9.5px}" +
    ".sad-acc b{display:block;margin-top:6px;font-size:clamp(26px,2.4vw,32px);font-weight:300;letter-spacing:-.02em;line-height:1.1;color:var(--ink);font-variant-numeric:tabular-nums}" +
    ".sad-acc b em{font-style:normal;font-weight:400}" +
    ".sad-acc .bar{display:block;height:6px;margin-top:10px;border-radius:99px;background:rgba(15,143,82,.12);overflow:hidden}" +
    ".sad-acc .bar i{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#0f8f52,#3ecf8e)}" +
    ".sad-acc small{display:block;margin-top:8px;font-size:12.5px;line-height:1.45;color:var(--ink3)}" +
    ".sad-how{margin-top:14px;padding:12px 14px;border-radius:12px;background:#f7f7f5;border:1px solid rgba(0,0,0,.08)}" +
    ".sad-how .m{color:var(--b);font-size:9.5px}" +
    ".sad-how ol{list-style:none;margin:8px 0 0;padding:0}" +
    ".sad-how li{display:grid;grid-template-columns:22px minmax(0,1fr);column-gap:10px;padding:7px 0;font-size:13.5px;line-height:22px;color:var(--ink);font-weight:400}" +
    ".sad-how li + li{border-top:1px solid rgba(0,0,0,.07)}" +
    ".sad-how li > span{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#fff;border:1px solid rgba(21,105,255,.4);color:var(--bd);font-family:'IBM Plex Mono',monospace;font-size:11px}" +
    ".sad-how em{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;font-style:normal}" +
    ".sad-how a{padding:3px 9px;border-radius:999px;border:1px solid rgba(21,105,255,.35);background:#fff;color:var(--bd);text-decoration:none;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;line-height:18px}" +
    ".sad-how a:hover{background:rgba(21,105,255,.08)}" +
    ".sad-who b{font-weight:500;color:var(--ink2)}" +
    /* level, spots and prize */
    ".sad-lv{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:16px;border:1px solid rgba(0,0,0,.12);border-radius:12px;background:#f7f7f5}" +
    ".sad-lv > div{padding:14px 14px 13px;min-width:0}" +
    ".sad-lv > div + div{border-left:1px solid rgba(0,0,0,.09)}" +
    ".sad-lv .m{display:block;color:var(--ink3);font-size:9.5px}" +
    ".sad-lv b{display:block;margin-top:8px;font-size:clamp(20px,1.8vw,25px);font-weight:300;letter-spacing:-.02em;line-height:1.05;color:var(--ink);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".sad-lv .lv b{color:var(--bd);font-weight:400}" +
    ".sad-lv small{display:block;margin-top:5px;font-size:12px;line-height:1.35;color:var(--ink3)}" +
    ".sad-pz{margin:12px 0 0;padding:12px 14px;border-radius:12px;border:1px solid rgba(168,100,0,.32);background:rgba(168,100,0,.06);font-size:13px;line-height:1.55;color:var(--ink2)}.sad-pz[hidden]{display:none}" +
    ".sad-pz b{display:block;font-weight:500;color:var(--ink)}.sad-pz span{display:block;margin-top:4px;color:var(--ink3)}" +
    ".sad-up{margin:12px 0 0;font-size:13.5px;line-height:1.55;color:var(--ink2)}" +
    ".sad-up b{font-weight:500;color:var(--ink)}" +
    /* buttons and notes */
    ".sad-cta{position:relative;overflow:hidden;display:flex;justify-content:center;align-items:center;gap:11px;margin-top:18px;padding:17px 22px;border-radius:12px;background:var(--b);color:#fff;text-decoration:none;font-size:10.5px}" +
    ".sad-cta::before{content:'';position:absolute;inset:0;background:var(--bd);transform:translateY(101%);transition:transform .42s cubic-bezier(.22,.72,.24,1)}" +
    ".sad-cta:hover::before{transform:none}" +
    ".sad-cta span,.sad-cta i{position:relative;font-style:normal}" +
    ".sad-ctas{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;margin-top:18px}" +
    ".sad-ctas > .sad-cta{margin-top:0}" +
    ".sad-ctas.two{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}" +
    ".sad-ctas.two > .sad-cta{padding:17px 12px;gap:8px;text-align:center}" +
    ".sad-ctas.two > .sad-cta:first-child{background:#fff;color:var(--bd);box-shadow:inset 0 0 0 1px var(--b)}" +
    ".sad-ctas.two > .sad-cta:first-child::before{background:rgba(21,105,255,.08)}" +
    "@media (max-width:520px){.sad-ctas.two > .sad-cta{padding:14px 8px;letter-spacing:.1em;line-height:1.5}.sad-ctas.two > .sad-cta i{display:none}}" +
    ".sad-links{display:flex;justify-content:space-between;align-items:center;gap:8px 14px;flex-wrap:wrap;margin-top:12px;font-size:13px;line-height:1.45;color:var(--ink3)}" +
    ".sad-links a{color:var(--ink2);text-decoration:underline;text-decoration-color:rgba(0,0,0,.22);text-underline-offset:3px;transition:text-decoration-color .3s,color .3s}" +
    ".sad-links a:hover{color:var(--ink);text-decoration-color:var(--b)}" +
    ".sad-links a.m{font-size:9.5px;text-decoration:none;color:var(--bd)}" +
    ".sad-note{display:flex;gap:9px;align-items:flex-start;margin:14px 0 0;padding:11px 13px;border-radius:10px;background:rgba(21,105,255,.06);border:1px solid rgba(21,105,255,.18);font-size:12.5px;line-height:1.5;color:var(--ink2)}" +
    ".sad-note svg{flex:none;width:16px;height:16px;margin-top:1px;fill:none;stroke:var(--b);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}" +
    ".sad-dlv{display:flex;flex-direction:column;justify-content:center;margin-top:16px;padding:16px 18px 18px;border-radius:12px;background:linear-gradient(180deg,rgba(21,105,255,.075),rgba(21,105,255,.03));border:1px solid rgba(21,105,255,.22)}" +
    ".sad.min .sad-dlv{display:none}" +
    ".sad-dlv-k{display:flex;align-items:center;gap:8px;margin:0;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--bd)}" +
    ".sad-dlv-k svg{flex:none;width:16px;height:16px;fill:none;stroke:var(--b);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}" +
    ".sad-dlv-t{margin:10px 0 0;font-size:17px;line-height:1.3;font-weight:500;color:var(--ink)}" +
    ".sad-dlv-p{margin:6px 0 0;font-size:13.5px;line-height:1.55;color:var(--ink2)}" +
    ".sad-dlv-tl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:16px 0 0;padding:0;list-style:none}" +
    ".sad-dlv-tl li{position:relative;min-width:0;padding:20px 8px 0 0;overflow-wrap:break-word}" +
    ".sad-dlv-tl li::before{content:'';position:absolute;left:0;top:2px;width:10px;height:10px;border-radius:50%;background:#fff;border:2px solid var(--b);box-sizing:border-box}" +
    ".sad-dlv-tl li::after{content:'';position:absolute;left:16px;right:6px;top:7px;height:1px;background:rgba(21,105,255,.35)}" +
    ".sad-dlv-tl li:first-child::before{background:var(--b)}" +
    ".sad-dlv-tl li:last-child::before{background:var(--b);box-shadow:0 0 0 4px rgba(21,105,255,.16)}" +
    ".sad-dlv-tl li:last-child::after{display:none}" +
    "html[lang=ar] .sad-dlv :is(.sad-dlv-k,b,li > span){letter-spacing:0;font-family:'IBM Plex Mono',system-ui,sans-serif}" +
    // en el movil la linea de tiempo va en vertical
    "@media (max-width:560px){.sad-dlv-tl{grid-template-columns:minmax(0,1fr);row-gap:12px}.sad-dlv-tl li{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:8px;padding:0 0 0 22px}" +
    ".sad-dlv-tl li::after{left:4px;right:auto;top:15px;bottom:-11px;width:2px;height:auto;background:rgba(21,105,255,.22)}.sad-dlv-tl li > span{margin-top:0}}" +
    ".sad-dlv-tl b{display:block;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;font-weight:500;color:var(--ink)}" +
    ".sad-dlv-tl li > span{display:block;margin-top:4px;font-size:11.5px;letter-spacing:.02em;color:var(--ink3)}" +
    ".sad-keep{display:flex;gap:10px;align-items:flex-start;margin:0 0 16px;padding:12px 14px;border-radius:12px;background:rgba(15,143,82,.07);border:1px solid rgba(15,143,82,.26);font-size:13.5px;line-height:1.5;color:var(--ink)}" +
    ".sad-keep svg{flex:none;width:18px;height:18px;margin-top:1px;fill:none;stroke:var(--ok);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}" +
    ".sad [hidden]{display:none!important}" +
    /* la etiqueta azul bajo la de "Live" en la cabecera de la pagina */
    ".sad-new{display:flex;width:max-content;max-width:100%;align-items:center;gap:12px;margin:-10px 0 22px;padding:10px 14px;border:1px solid rgba(77,141,255,.55);background:rgba(21,105,255,.14);" +
    "color:#dbe6ff;text-decoration:none;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap;animation:sadIn .8s ease .4s both;transition:border-color .3s,background-color .3s}" +
    ".sad-new b{color:#7fa8ff;font-weight:500}" +
    ".sad-new i{font-style:normal;color:#7fa8ff}" +
    ".sad-new .d{width:7px;height:7px;border-radius:50%;background:#4d8dff;box-shadow:0 0 10px 2px rgba(77,141,255,.7);flex:none}" +
    ".sad-new:hover{border-color:#7fa8ff;background:rgba(21,105,255,.24)}" +
    "@keyframes sadIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}" +
    ".sad-min:focus-visible,.sad-cta:focus-visible,.sad-links a:focus-visible{outline:2px solid var(--b);outline-offset:3px}" +
    /* beside the console: the window takes the right column; the three steps go below both, side by side */
    ".pp-body.sad-on > .frame{grid-row:1}" +
    ".pp-body.sad-on > .sad{grid-column:2;grid-row:1}" +
    ".pp-body.sad-on > .sad-lede{grid-column:1 / -1;grid-row:2;margin:0 0 calc(18px - clamp(24px,3.4vw,56px));max-width:62ch;color:var(--p-ink-2);font-size:clamp(15px,1.15vw,18px);line-height:1.65;font-weight:300}" +
    ".pp-body.sad-on > .steps{grid-column:1 / -1;grid-row:3}" +
    "@media (min-width:981px){" +
      ".pp-body.sad-on > .steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-bottom:1px solid var(--p-line)}" +
      ".pp-body.sad-on > .steps > .step{grid-template-rows:auto 1fr auto;padding:clamp(22px,2.2vw,30px) clamp(18px,2vw,30px);border-bottom:0;border-left:1px solid var(--p-line)}" +
      ".pp-body.sad-on > .steps > .step:first-child{padding-left:0;border-left:0}" +
      ".pp-body.sad-on > .steps > .step:last-child{padding-right:0}" +
      ".pp-body.sad-on > .steps .fact{align-self:end}" +
    "}" +
    "@media (max-width:980px){.pp-body.sad-on{grid-template-rows:none}.pp-body.sad-on > .frame,.pp-body.sad-on > .sad,.pp-body.sad-on > .sad-lede,.pp-body.sad-on > .steps{grid-column:auto;grid-row:auto}}" +
    /* en la cabecera, donde estaba ese texto: el mensaje para quienes ya hacen staking */
    /* el mismo ancho que la ventana del Airdrop de abajo (las dos columnas de la cabecera son las de las
       consolas) y a la altura del titulo; esquinas en cruz como la consola, fondo azulado, etiqueta
       "Nuevo", linea azul arriba con un brillo que la recorre y un boton azul a la ventana */
    "@media (min-width:981px){.pp-head.sad-msg-on{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,3.4vw,56px);align-items:start}" +
      ".pp-head.sad-msg-on .hw{padding-top:0}}" +
    ".sad-msg{position:relative;padding:18px 22px 18px;background:linear-gradient(135deg,#fff 0%,#f3f7ff 100%);border:1px solid rgba(21,105,255,.3);box-shadow:0 26px 54px -34px rgba(21,105,255,.55);font-family:'IBM Plex Sans',system-ui,sans-serif}" +
    ".sad-msg::before{content:'';position:absolute;left:-1px;right:-1px;top:-1px;height:2px;background:#1569ff}" +
    ".sad-msg::after{content:'';position:absolute;top:-1px;left:-1px;height:2px;width:30%;background:linear-gradient(90deg,transparent,#9cc0ff,#fff,#9cc0ff,transparent);animation:sadShine 3.6s ease-in-out infinite}" +
    "@keyframes sadShine{0%{transform:translateX(-40%);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateX(370%);opacity:0}}" +
    ".pp-head .sad-msg-k{max-width:none;display:flex;align-items:center;flex-wrap:wrap;gap:8px 10px;margin:0 0 10px;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#0d4fd8;font-weight:500;line-height:1.5}" +
    ".sad-msg-k b{display:inline-flex;align-items:center;gap:7px;padding:3px 8px;background:#1569ff;color:#fff;font-weight:500;letter-spacing:.14em}" +
    ".sad-msg-k b i{width:6px;height:6px;border-radius:50%;background:#fff;animation:sadBeat 1.8s ease-in-out infinite}" +
    "@keyframes sadBeat{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.7)}50%{box-shadow:0 0 0 4px rgba(255,255,255,0)}}" +
    ".pp-head .sad-msg-t{max-width:none;margin:0;color:#2b303a;font-size:14px;line-height:1.6;font-weight:300}" +
    ".sad-msg-a{display:flex;flex-wrap:wrap;align-items:center;gap:10px 20px;margin-top:14px}" +
    ".sad-msg-a a{color:#0d4fd8;font-weight:400;font-size:13px;text-decoration:none;border-bottom:1px solid rgba(13,79,216,.32);padding-bottom:1px;transition:color .3s,border-color .3s,background .3s}" +
    ".sad-msg-a a:hover{color:#1569ff;border-color:#1569ff}" +
    ".sad-msg-a a.sad-msg-go{padding:10px 16px;border:0;background:#1569ff;color:#fff;font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase}" +
    ".sad-msg-a a.sad-msg-go:hover{background:#0d4fd8;color:#fff}" +
    "@media (max-width:620px){.sad-msg{padding:16px 16px 15px}.pp-head .sad-msg-t{font-size:13.5px}}" +
    "@media (prefers-reduced-motion:reduce){.sad-msg::after,.sad-msg-k b i{animation:none}.sad-msg::after{display:none}}" +
    "@media (max-width:420px){.sad-lv{grid-template-columns:1fr 1fr}.sad-lv .pz{grid-column:1 / -1;border-left:0!important;border-top:1px solid rgba(0,0,0,.09)}}" +
    "@media (prefers-reduced-motion:reduce){.sad *{animation:none!important;transition:none!important}}" +
    /* the same frame as the staking console: square corners, blue + marks on the corners, the same
       padding and a 2px blue top line; on desktop both windows share the row at the same size */
    ".sad{border-radius:0;margin:0;display:flex;flex-direction:column}" +
    ".sad-card{flex:1;overflow:visible;border-radius:0;padding:clamp(20px,2.4vw,32px)}" +
    ".sad-card::after{left:-1px;right:-1px;top:-1px;height:2px}" +
    ".sad-min,.sad-keep,.sad-acc,.sad-acc .bar,.sad-how,.sad-how a,.sad-lv,.sad-cta,.sad-note{border-radius:0}" +
    "@media (min-width:981px){" +
      ".pp-body.sad-on{grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:stretch}" +
      ".pp-body.sad-on > .frame{display:flex;flex-direction:column}" +
      ".pp-body.sad-on > .frame > .console{flex:1}" +
      "@media (min-width:981px){.pp-body.sad-on > .frame > .console{display:flex;flex-direction:column}.pp-body.sad-on .stk-msg{flex:1 0 auto}" +
      ".pp-body.sad-on > .sad > .sad-card{display:flex;flex-direction:column}.pp-body.sad-on .sad-dlv{flex:1 0 auto}}" +
      ".pp-body.sad-on > .sad.min{align-self:start}" +
    "}" +
    "@media (max-width:620px){.sad{padding:10px}.sad-card{padding:18px 16px}}";

  function tt(k) { return '<span data-t="' + k + '">' + esc(L[k]) + "</span>"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 7.6-1.7"/></svg>';
  var BOX = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7.6 12 3.2l8.5 4.4v8.8L12 20.8l-8.5-4.4z"/><path d="M3.5 7.6 12 12l8.5-4.4M12 12v8.8"/></svg>';
  var OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6z"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/></svg>';

  function mount() {
    var body = document.querySelector("#stake .pp-body");
    var steps = body && body.querySelector(".steps");
    if (!body || !steps) return;

    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    var el = document.createElement("aside");
    el.className = "sad";
    el.setAttribute("aria-label", "Sectora Airdrop");
    el.id = "airdrop-genesis";
    el.innerHTML =
      '<span class="frame-plus" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
      '<div class="sad-band m"><span>' + tt("band") + '</span><b>SA&middot;ST&middot;01&middot;26</b></div>' +
      '<div class="sad-card">' +
        '<div class="sad-head m"><span>Sectora &nbsp;//&nbsp; airdrop genesis</span><span class="sp"></span><span class="sad-cnt"></span>' +
          '<button type="button" class="sad-min" aria-expanded="true" aria-label="' + esc(L.min) + '"><i></i></button>' +
        "</div>" +
        '<div class="sad-body">' +
          '<p class="sad-keep">' + OK + "<span>" + tt("keep") + "</span></p>" +
          '<p class="sad-k m">' + tt("k") + "</p>" +
          '<h3 class="sad-h"></h3>' +
          '<p class="sad-p"></p>' +
          '<ul class="sad-steps">' +
            '<li class="s1"><span class="sad-ic">✓</span><span>' + tt("s1") + '</span><span class="v"></span></li>' +
            '<li class="s2"><span class="sad-ic"></span><span>' + tt("s2") + '</span><span class="tg m">' + esc(L.s2t) + "</span></li>" +
          "</ul>" +
          '<p class="sad-who m" hidden></p>' +
          '<div class="sad-acc" hidden><span class="m">' + tt("acc") + '</span><b><em>0</em> SECT</b><i class="bar"><i></i></i><small></small></div>' +
          '<p class="sad-pz" hidden></p>' +
          '<div class="sad-how" hidden><p class="m">' + tt("hw") + "</p><ol>" +
            '<li><span>1</span><div>' + tt("hw1") + '<em><a href="/dashboard.html#plan">' + tt("hwp") + " ↗</a></em></div></li>" +
            '<li><span>2</span><div>' + tt("hw2") + "</div></li>" +
            '<li><span>3</span><div>' + tt("hw3") + "</div></li></ol></div>" +
          '<div class="sad-lv" hidden>' +
            '<div class="lv"><span class="m">' + tt("lv") + '</span><b></b><small></small></div>' +
            '<div class="spt"><span class="m">' + tt("sp") + '</span><b></b><small></small></div>' +
            '<div class="pz"><span class="m">' + tt("pz") + '</span><b></b><small>' + tt("pzs") + "</small></div>" +
          "</div>" +
          '<p class="sad-up" hidden></p>' +
          '<div class="sad-ctas"><a class="sad-cta m" href="' + NODE_URL + '"><span>' + esc(L.cta) + "</span><i>→</i></a>" +
            '<a class="sad-cta sad-cta2 m" href="' + MY_URL + '" hidden><span data-t="cMy">' + esc(L.cMy) + "</span><i>→</i></a></div>" +
          '<div class="sad-links"><a href="' + AIRDROP_URL + '">' + tt("have") + '</a><a class="m" href="' + AIRDROP_URL + '">' + tt("more") + " →</a></div>" +
          '<p class="sad-note">' + LOCK + "<span>" + tt("note") + "</span></p>" +
        "</div>" +
        // cuando se entrega lo generado en el airdrop (aparte de las recompensas del staking)
        '<div class="sad-dlv">' +
          '<p class="sad-dlv-k m">' + BOX + tt("dK") + "</p>" +
          '<p class="sad-dlv-t">' + tt("dT") + "</p>" +
          '<p class="sad-dlv-p">' + tt("dP") + "</p>" +
          '<ol class="sad-dlv-tl m">' + [1, 2, 3].map(function (i) { return '<li><b>' + tt("d" + i + "a") + "</b><span>" + tt("d" + i + "b") + "</span></li>"; }).join("") + "</ol>" +
        "</div>" +
      "</div>";
    body.insertBefore(el, steps);
    body.classList.add("sad-on");

    var lede = document.querySelector("#stake .pp-head > p");
    if (lede && !document.querySelector(".sad-msg")) {
      var msg = document.createElement("div");
      msg.className = "sad-msg";
      msg.innerHTML = '<span class="frame-plus" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
        '<p class="sad-msg-k"><b><i aria-hidden="true"></i>' + tt("newB") + "</b>" + tt("msgK") + "</p>" +
        '<p class="sad-msg-t">' + tt("msgT") + "</p>" +
        '<div class="sad-msg-a"><a href="#airdrop-genesis" class="sad-msg-go">' + tt("msgA") + ' ↓</a><a href="' + AIRDROP_URL + '">' + tt("msgR") + " →</a></div>";
      lede.parentNode.classList.add("sad-msg-on");
      lede.parentNode.replaceChild(msg, lede);
      lede.classList.add("sad-lede");
      body.insertBefore(lede, steps);
      msg.querySelector(".sad-msg-go").addEventListener("click", function (e) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (el.classList.contains("min")) setMin(false);
      });
    }

    /* la etiqueta de la cabecera: lleva a esta ventana */
    var live = document.querySelector(".hero .hero-new");
    if (live && !document.querySelector(".sad-new")) {
      var tag = document.createElement("a");
      tag.className = "sad-new"; tag.href = "#airdrop-genesis";
      tag.innerHTML = '<span class="d" aria-hidden="true"></span><b>' + tt("newB") + "</b><span>" + tt("newT") + '</span><i aria-hidden="true">↓</i>';
      tag.addEventListener("click", function (e) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (el.classList.contains("min")) setMin(false);
      });
      live.parentNode.insertBefore(tag, live.nextSibling);
    }

    var $ = function (s) { return el.querySelector(s); };
    var hEl = $(".sad-h"), pEl = $(".sad-p"), s1 = $(".s1"), s1v = $(".s1 .v"), s2 = $(".s2"), s2t = $(".s2 .tg"), lvBox = $(".sad-lv"), up = $(".sad-up"), cnt = $(".sad-cnt");
    var cta = $(".sad-cta"), ctaT = $(".sad-cta span"), cta2 = $(".sad-cta2"), ctas = $(".sad-ctas"), have = $(".sad-links a:not(.m)"), who = $(".sad-who");
    var minBtn = $(".sad-min");
    try { if (localStorage.getItem("sad_min") === "1") setMin(true); } catch (e) {}

    function setMin(on) {
      el.classList.toggle("min", on);
      minBtn.setAttribute("aria-expanded", String(!on));
      minBtn.setAttribute("aria-label", on ? L.max : L.min);
      try { localStorage.setItem("sad_min", on ? "1" : "0"); } catch (e) {}
    }
    minBtn.addEventListener("click", function () { setMin(!el.classList.contains("min")); });

    /* the deposited amount of the connected wallet: read from the staking contract; until that read
       arrives, what the console prints (only if no translator has rewritten it) */
    var chainDep = null, depFor = "", depT = 0, depTxt = "";
    function shown() {
      var d = document.getElementById("earnDep");
      if (!d || !d.isConnected) return null;
      if (!d.classList.contains("notranslate")) { d.classList.add("notranslate"); d.setAttribute("translate", "no"); }
      var h = document.documentElement;
      if (d.querySelector("font") || /\btranslated-(ltr|rtl)\b/.test(h.className)) return null;
      var n = parseFloat((d.textContent || "").replace(/[^0-9.]/g, ""));
      return isFinite(n) ? n : null;
    }
    function deposited() {
      if (addr && depFor === addr && chainDep !== null) return chainDep;
      return shown();
    }
    function readDep() {
      var a = addr; if (!a) return;
      depT = Date.now();
      call(STAKING, SEL.accountView + pad(a), MAINNET).then(function (h) {
        if (a !== addr) return;
        chainDep = Number(word(h, 0) / 10n ** 14n) / 1e4; depFor = a; paint();
      }).catch(function () {});
    }
    function fmt(n, dec) {
      var o = { maximumFractionDigits: dec == null ? 2 : dec };
      try { o.useGrouping = "always"; return new Intl.NumberFormat(L.loc, o).format(n); }
      catch (e) { delete o.useGrouping; return new Intl.NumberFormat(L.loc, o).format(n); }
    }
    /* el Hash Node de la wallet conectada, leido del registro en Sepolia (como el verificador del airdrop) */
    var addr = null, node = null, nodeT = 0;
    function pad(a) { return a.toLowerCase().replace(/^0x/, "").padStart(64, "0"); }
    function call(to, data, rpcs) {
      var i = 0; rpcs = rpcs || SEPOLIA;
      function next() {
        if (i >= rpcs.length) return Promise.reject(new Error("rpc"));
        var url = rpcs[i++], ctl = new AbortController(), tm = setTimeout(function () { ctl.abort(); }, 7000);
        return fetch(url, { method: "POST", headers: { "content-type": "application/json" }, signal: ctl.signal,
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: to, data: data }, "latest"] }) })
          .then(function (r) { return r.json(); })
          .then(function (j) { clearTimeout(tm); if (!j || !j.result || j.error) throw new Error("rpc"); return j.result; })
          .catch(function () { clearTimeout(tm); return next(); });
      }
      return next();
    }
    function word(hex, n) { return BigInt("0x" + (hex.slice(2 + 64 * n, 2 + 64 * (n + 1)) || "0")); }
    function checkNode() {
      var a = addr; if (!a) return;
      if (node === null) { node = "checking"; paint(); }
      nodeT = Date.now();
      call(REGISTRY, SEL.indexPlusOne + pad(a)).then(function (h) {
        var n = word(h, 0);
        if (n === 0n) return "none";
        return call(REGISTRY, SEL.validators + pad((n - 1n).toString(16))).then(function (v) { return word(v, 6) === 1n ? "active" : "paused"; });
      }).catch(function () { return "unknown"; }).then(function (r) {
        // sin nodo encendido en Sepolia: puede estar activado en el Dashboard (un clic, sin Sepolia)
        return r === "active" ? r : activated(a).then(function (on) { return on ? "active" : r; });
      }).then(function (r) { if (a === addr) { node = r; paint(); } });
    }
    /* nodo activado en el Dashboard: el de este navegador (recien activado) o el registro publico de activaciones */
    function localAct(a) {
      try { var x = JSON.parse(localStorage.getItem("sectora:v2:node:" + a.toLowerCase()) || "null");
        return x ? { t: x.t || Date.now(), n: x.name || "Sectora Node", c: x.place || "", la: x.lat, lo: x.lon } : null; } catch (e) { return null; }
    }
    function activated(a) {
      if (localAct(a)) return Promise.resolve(true);
      return new Promise(function (ok) {
        loadCount(function () {
          var C = window.SACount;
          if (!C || !C.activos) return ok(false);
          C.activos().then(function (m) { ok(!!m[a.toLowerCase()]); }, function () { ok(false); });
        });
      });
    }
    /* lo generado en vivo, con la misma regla que el verificador del airdrop (count.js) */
    var accBox = $(".sad-acc"), accN = $(".sad-acc em"), accBar = $(".sad-acc .bar i"), accTxt = $(".sad-acc small");
    var hist = null, histFor = "", histT = 0, histBusy = false;
    var nf4 = new Intl.NumberFormat(L.loc, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    function loadCount(cb) {
      if (window.SACount) return cb();
      var sc = document.createElement("script"); sc.src = COUNT_JS; sc.onload = cb; document.head.appendChild(sc);
    }
    function readCount() {
      var a = addr; if (!a || histBusy) return;
      histBusy = true; histT = Date.now();
      loadCount(function () {
        var C = window.SACount;
        if (!C.OPEN || Date.now() < C.OPEN) { histBusy = false; hist = { pre: true }; histFor = a; return; }
        C.wallet(a).then(function (h) {
          var loc = localAct(a), nd = h.node;
          if (loc && C.junta && !(nd && nd.act)) nd = C.junta(nd, loc, a.toLowerCase());
          var ev = C.evaluate(h.ev, nd, C.OPEN, Date.now()), proj = ev.closed;
          ev.items.forEach(function (it) { proj += it.p; });
          if (a === addr) { hist = { items: ev.items, closed: ev.closed, proj: proj, first: ev.start, paused: ev.outGot || 0, top: ev.outTop || 0 }; histFor = a; }
        }).catch(function () {}).then(function () { histBusy = false; });
      });
    }
    /* retiro y volvio con menos: lo de su nivel anterior queda en pausa hasta que vuelva su saldo */
    function paintPz() {
      var pz = $(".sad-pz"); if (!pz) return;
      var on = !!addr && !!hist && histFor === addr && hist.paused > 0.00005;
      pz.hidden = !on; if (!on) return;
      var dep = deposited(), now = -1, was = 0, i;
      if (dep !== null) for (i = 0; i < LV.length; i++) if (dep >= LV[i].min) now = i;
      for (i = 0; i < LV.length; i++) if (hist.top >= LV[i].min) was = i;
      var key = [hist.paused.toFixed(4), hist.top, dep, L.loc].join("|"); if (pz.dataset.k === key) return; pz.dataset.k = key;
      pz.innerHTML = "<b>" + esc(tpl(L.pzW, { l: LV[was].n, g: fmt(hist.paused, 4), b: fmt(hist.top) })) + "</b>" +
        (now >= 0 && now < was ? "<span>" + esc(tpl(L.pzN, { l: LV[now].n, s: fmt(dep), p: fmt(Math.floor(dep * LV[now].rate * 100) / 100) })) + "</span>" : "");
    }
    function tickCount() {
      var show = !!addr && node === "active" && accBox.dataset.lv === "1";
      accBox.hidden = !show;
      if (addr && node === "active" && (histFor !== addr || Date.now() - histT > 3e5)) readCount();
      paintPz();
      if (!show) return;
      if (!hist || histFor !== addr) { accN.textContent = nf4.format(0); accTxt.textContent = L.calc; return; }
      if (hist.pre) { accN.textContent = nf4.format(0); accBar.style.width = "0%"; accTxt.textContent = L.pre; return; }
      var now = Date.now(), e = hist.closed;
      hist.items.forEach(function (it) { e += it.p * Math.min(1, Math.max(0, (now - it.s) / it.sp)); });
      accN.textContent = nf4.format(e);
      accBar.style.width = (hist.proj ? Math.min(100, e / hist.proj * 100) : 0) + "%";
      var lockAt = hist.first + 30 * 864e5;
      accTxt.textContent = tpl(L.of, { n: fmt(hist.proj, 0) }) + " · " + (hist.first && now < lockAt ?
        tpl(L.lock, { d: new Intl.DateTimeFormat(L.loc, { day: "numeric", month: "short" }).format(lockAt) }) : L.mine);
    }
    setInterval(tickCount, 200);

    function setAddr(a) {
      a = a && /^0x[0-9a-fA-F]{40}$/.test(a) ? a : null;
      if (a === addr) return;
      addr = a; node = null; chainDep = null; depFor = ""; paint();
      if (addr) { checkNode(); readDep(); }
    }
    window.addEventListener("sectora:account", function (e) { setAddr(e.detail); });
    /* el visitante cambia el idioma de la pagina: los textos fijos (data-t), el boton de minimizar y lo que pinta paint() */
    window.addEventListener("sectora:lang", function (e) {
      var nuevo = T[e.detail] || T.en;
      if (nuevo === L) return;
      L = nuevo;
      nf4 = new Intl.NumberFormat(L.loc, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
      document.querySelectorAll(".sad [data-t], .sad-msg [data-t], .sad-new [data-t]").forEach(function (n) { n.textContent = L[n.getAttribute("data-t")]; });
      minBtn.setAttribute("aria-label", el.classList.contains("min") ? L.max : L.min);
      lastKey = ""; paint(); tickCount();
    });

    function tpl(s, m) { return s.replace(/\{(\w)\}/g, function (_, k) { return m[k]; }); }

    var lastKey = "";
    function paint() {
      var dep = deposited(), key = dep + "|" + addr + "|" + node;
      if (key === lastKey) return;
      lastKey = key;
      var lv = -1;
      if (dep !== null) for (var i = 0; i < LV.length; i++) if (dep >= LV[i].min) lv = i;

      var on = node === "active", paused = node === "paused";
      if (dep === null) { hEl.innerHTML = L.h0; pEl.textContent = L.p0; }
      else if (lv < 0) { hEl.innerHTML = tpl(L.h1, { x: fmt(100 - dep) }); pEl.textContent = on ? L.p1n : L.p1; }
      else if (on) { hEl.innerHTML = L.h3; pEl.textContent = L.p3; }
      else { hEl.innerHTML = L.h2; pEl.textContent = paused ? L.poff : L.p2; }

      s1.classList.toggle("done", lv >= 0);
      s1.querySelector(".sad-ic").textContent = lv >= 0 ? "✓" : "";
      s1.classList.toggle("next", lv < 0);
      s1v.textContent = dep === null ? "—" : lv < 0 ? fmt(dep) + " / 100" : fmt(dep) + " SECT";
      s2.classList.toggle("done", on);
      s2.classList.toggle("off", paused);
      s2.classList.toggle("next", lv >= 0 && !on);
      s2.querySelector(".sad-ic").textContent = on ? "✓" : "";
      s2t.textContent = on ? L.on : paused ? L.off : node === "checking" ? L.chk : L.s2t;
      cnt.textContent = dep === null ? L.wait : lv >= 0 && on ? L.both : lv >= 0 ? L.done : fmt(dep) + " / 100";
      cta.href = on ? AIRDROP_URL : NODE_URL; ctaT.textContent = on ? (lv >= 0 ? L.cInfo : L.more) : paused ? L.ctaOff : L.cta;
      // ya participa: dos botones del mismo alto que el de antes, la web del airdrop y su panel (Mi Airdrop)
      cta2.hidden = !(on && lv >= 0); ctas.classList.toggle("two", on && lv >= 0);
      have.parentNode.hidden = on;
      accBox.dataset.lv = lv >= 0 ? "1" : "0";
      $(".sad-how").hidden = on || dep === null;
      /* que wallet se comprobo y que dijo la red de nodos */
      who.hidden = !addr;
      if (addr) who.innerHTML = tpl(esc(L.who), { a: "<b>" + addr.slice(0, 6) + "…" + addr.slice(-4) + "</b>" }) + " · " +
        esc(on ? L.wOn : paused ? L.wOff : node === "none" ? L.wNone : node === "unknown" ? L.wErr : L.wChk);

      lvBox.hidden = lv < 0; up.hidden = lv < 0;
      if (lv >= 0) {
        var c = LV[lv], spots = Math.floor(dep / c.min * 10) / 10;
        $(".lv b").textContent = c.n; $(".lv small").textContent = tpl(L.lvs, { n: lv + 1 });
        $(".spt b").textContent = fmt(spots, 1); $(".spt small").textContent = tpl(L.sps, { l: c.n });
        $(".pz b").textContent = fmt(Math.floor(dep * c.rate * 100) / 100);
        if (lv < LV.length - 1) { var nx = LV[lv + 1];
          up.innerHTML = tpl(esc(L.up), { x: "<b>" + fmt(nx.min - dep) + "</b>", l: "<b>" + nx.n + "</b>", p: "<b>" + fmt(nx.min * nx.rate) + "</b>" }); }
        else up.textContent = L.top;
      }
    }
    paint();
    if (window.__sectoraAccount) setAddr(window.__sectoraAccount);
    /* si la pagina no avisa de la wallet (p. ej. una version guardada en cache), se le pregunta a la
       wallet del navegador que cuenta tiene abierta: solo lectura, sin ventanas ni firmas */
    var t0 = Date.now(), askT = 0;
    function askWallet() {
      askT = Date.now();
      var w = window.ethereum;
      if (w && w.request) w.request({ method: "eth_accounts" }).then(function (a) { if (!addr && a && a[0]) setAddr(a[0]); }).catch(function () {});
    }
    /* cada 1,5 s repinta lo que muestra la consola; el deposito se vuelve a leer cuando la consola cambia
       (deposito o retiro) y cada minuto; el nodo, cada minuto (10 s si fallo la red) */
    setInterval(function () {
      var d = document.getElementById("earnDep"), tx = d ? d.textContent : "";
      if (addr && (tx !== depTxt ? Date.now() - depT > 4000 : Date.now() - depT > (depFor === addr ? 6e4 : 1e4))) { depTxt = tx; readDep(); }
      paint();
      if (!addr && deposited() !== null && Date.now() - t0 > 2500 && Date.now() - askT > 1e4) askWallet();
      if (addr && Date.now() - nodeT > (node === "unknown" ? 1e4 : 6e4)) checkNode();
    }, 1500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
