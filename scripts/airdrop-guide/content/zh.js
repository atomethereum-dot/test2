/* Guia del Airdrop Genesis · 中文 (misma estructura que en.js) */
module.exports = {
  name: "中文", locale: "zh-CN", dir: "ltr",
  meta: {
    title: "Airdrop Genesis 参与指南 — Sectora Foundation",
    desc: "一步一步参与 Sectora Airdrop Genesis：质押你的 #SECT，用同一个钱包开启 Hash Node，并查看你的空投。附截图和可下载的 PDF。"
  },
  nav: { sub: "空投指南", back: "空投页面", pdf: "PDF", lang: "语言" },
  common: {
    part: "{p} 部分", step: "步骤", stepOf: "第 {n} 步，共 16 步", illus: "示意图 · 你的钱包界面可能略有不同",
    example: "截图中使用的是示例钱包（0x4b2f…4b3c）和示例数量。你的屏幕上会显示你自己的。",
    phone: "在手机上", computer: "在电脑上", yes: "可以", no: "不要", minutes: "分钟", page: "页",
    stakingEnglish: "质押页面是英文的。这里每个按钮都按页面上的样子显示，括号里是中文意思。"
  },
  cover: {
    tag: "官方指南 · 第 1.1 版", kicker: "Airdrop Genesis · 参与指南",
    h1: "如何参与<br>Sectora <b>空投</b>",
    p: "一步一步，配有截图：从第一次点击，到 Hash Node 开启并开始计数。读一步，做一步，再进入下一步。",
    parts: [["A 部分", "质押你的 #SECT", "以太坊 · 第 1–7 步"], ["B 部分", "开启你的节点", "免费测试网 · 第 8–14 步"], ["C 部分", "查看你的空投", "一分钟 · 第 15–16 步"]],
    issued: "发布方", entity: "实体", activity: "业务", activityV: "网络安全公司", location: "地址", locationV: "美国伊利诺伊州芝加哥",
    file: "伊利诺伊州登记号", ein: "EIN", contracts: "官方合约 · 以太坊主网", token: "#SECT 代币", staking: "质押", web: "网站", support: "客服",
    date: "2026 年 10 月 · 中文"
  },
  toc: { k: "目录", h: "本指南的全部内容", start: "从这里开始", before: "开始之前", problems: "问题与客服" },
  hero: {
    k: "Airdrop Genesis · 分步指南",
    h1: "如何参与 Sectora 空投，<b>一步一步来。</b>",
    lede: "本指南带你从<strong>第一次点击</strong>走到<strong>Hash Node 开启并开始计数</strong>。每一步都准确告诉你按哪里、应该看到什么、不要做什么，并配有截图。读一步，做一步，再进入下一步。<strong>大约 20 分钟。</strong>",
    pdf: "下载 PDF 指南", start: "开始阅读"
  },
  need: {
    k: "一句话说清整个空投", h: "你只需要两件事，<b>用同一个钱包：</b>",
    r1: ["质押中的 #SECT", "在以太坊官方质押中至少 100 #SECT。A 部分。"],
    r2: ["开启你的 Hash Node", "在 Sectora 测试网上。完全免费。B 部分。"],
    foot: "两件事都满足后，你的空投计数会自动开始。<b>无需注册，无需填表。</b>"
  },
  already: {
    h: "已经在质押 #SECT？你已经在里面了。",
    p: "质押这边你什么都不用再做。<b>不要取出任何东西。</b>跳过 A 部分，直接去 B 部分：只要<b>用你质押时用的同一个钱包</b>开启 Hash Node，就开始参与了。",
    btn: "前往 B 部分"
  },
  map: [
    ["A 部分 · 第 1–7 步", "质押你的 #SECT", "以太坊主网。使用你真实的 #SECT 和少量 ETH 支付手续费。", "≈ 5 分钟"],
    ["B 部分 · 第 8–14 步", "开启你的 Hash Node", "Sectora 测试网。免费测试币：不花真钱。", "≈ 10 分钟"],
    ["C 部分 · 第 15–16 步", "查看你的空投", "查看你的等级、奖励和不断增长的计数。", "≈ 1 分钟"]
  ],
  before: {
    k: "00 · 开始之前", h: "准备好这<b>四样东西</b>。",
    items: [
      ["01", "一个加密钱包", "MetaMask、Trust Wallet、Coinbase Wallet、OKX、Binance Wallet 或任何以太坊钱包。手机或电脑都可以。"],
      ["02", "至少 100 #SECT", "放在这个钱包里。还没有？用我们的<a href=\"/guide/\">购买指南</a>（英文）在 Uniswap 上购买。"],
      ["03", "少量 ETH", "在以太坊上，同一个钱包里。用来支付网络手续费（几美元）。"],
      ["04 · 最重要", "所有事情只用一个钱包", "你的质押和你的节点必须使用<b>同一个钱包地址</b>。用两个不同的钱包是最常见的错误。"]
    ],
    rulesH: "三条安全规则。永远不要违反。",
    rules: "<b>1.</b> 永远不要把你的助记词（12 或 24 个单词）或私钥给任何人。Sectora 永远不会向你索要。<b>2.</b> 只使用 <b>sectoraorg.com</b>：每次都检查地址栏。<b>3.</b> Sectora 的人永远不会主动私信你说要“帮你”。如果有人这么做，那就是诈骗。"
  },
  phone: {
    k: "在手机上", h: "用手机？<b>先读这一段。</b>",
    p: "本指南的所有内容都能在手机上完成。你只需要安装好钱包 App（MetaMask、Trust Wallet、Coinbase Wallet 等）。",
    steps: [
      "<b>质押（A 部分）：</b>在 Chrome 或 Safari 打开 <b>sectoraorg.com/staking</b>，点 {en:Connect wallet}（连接钱包）。在列表里点你的钱包 App，在 App 里批准，然后回到浏览器。",
      "<b>节点（B 部分）：</b>打开 <b>sectoraorg.com/dashboard</b>，点 {ui:connect}。手机上会出现 {ui:openMM}（或你的钱包）：点它，控制面板会在<b>你的钱包 App 里</b>打开。在那里继续。",
      "<b>在钱包 App 里</b>一切都会直接连接。所有步骤都用同一个钱包 App。"
    ],
    note: "如果钱包 App 没有打开，就自己打开它，找到内置浏览器（通常叫<b>浏览器</b>、<b>发现</b>或 <b>Discover</b>），在里面输入网址。"
  },
  parts: {
    A: { k: "A 部分 · 第 1–7 步 · ≈ 5 分钟", h: "质押你的 #SECT", sub: "你把 #SECT 放进官方质押。它们仍然属于你，每秒都有奖励，并且计入空投。已经在质押？<a href=\"#part-b\">直接去 B 部分</a>。", tags: ["以太坊主网 · 真实 #SECT", "需要少量 ETH 付手续费", "无锁定期"] },
    B: { k: "B 部分 · 第 8–14 步 · ≈ 10 分钟", h: "开启你的 Hash Node", sub: "Hash Node 运行在 Sectora 测试网（Sepolia）上。<b>B 部分完全免费：</b>你使用的是没有价值的免费测试币。这里你永远不会花真钱。", tags: ["免费 · 测试网", "与质押同一个钱包", "自动保持开启"] },
    C: { k: "C 部分 · 第 15–16 步 · ≈ 1 分钟", h: "查看你的空投", sub: "查看你的等级、奖励和三个条件，数据直接实时读取自区块链。查看免费：无需签名，无需交易。", tags: ["只读 · 免费", "随时可看"] }
  },
  s: {
    1: { k: "浏览器", h: "打开质押页面",
      do: ["打开浏览器：Chrome、Safari 或钱包 App 里的浏览器。", "准确输入 <b>sectoraorg.com/staking</b> 并打开。", "往下滑，直到看到名为 <b>“Staking console”</b> 的白色方框。"],
      warn: "<b>检查地址栏。</b>唯一真实的页面是 <b>sectoraorg.com/staking</b>。如果显示其他地址，请立即关闭。" },
    2: { k: "质押控制台", h: "点 “Connect wallet”",
      do: ["Staking console 底部有一个蓝色大按钮。", "点 {en:Connect wallet}（连接钱包）。"],
      cap: "Staking console。要点的按钮用蓝色框标出。" },
    3: { k: "你的钱包", h: "选择你的钱包",
      do: ["按钮下方会打开一个列表。", "<b>在电脑上：</b>点你的钱包（例如 <b>MetaMask</b>）。钱包会打开：点<b>连接</b>。", "<b>在手机上（Chrome 或 Safari）：</b>点你的钱包 App。App 打开后点<b>连接</b>，然后<b>回到浏览器标签页</b>。"],
      capPc: "在电脑上：浏览器钱包排在第一个。", capPhone: "在手机上：钱包 App 列表。" },
    4: { k: "检查", h: "检查是否已连接",
      do: ["看蓝色大按钮：现在显示的是<b>你的钱包地址</b>（缩写），例如 <code>0x4b2f…4b3c</code>。", "下面出现三个按钮：{en:Deposit #SECT}（存入）{en:Withdraw}（取出）{en:Withdraw all}（全部取出）。"],
      see: "如果按钮上显示了你的地址，<b>就成功了</b>。",
      warn: "<b>出现红色提示 “Switch your wallet to the Ethereum network”？</b>意思是“请把钱包切换到以太坊网络”。打开钱包，把网络切换到 <b>Ethereum</b>（以太坊主网），然后刷新页面。" },
    5: { k: "数量", h: "输入你要质押的 #SECT 数量",
      do: ["点 <b>“You deposit”</b>（你存入）方框。", "输入 #SECT 的数量。只输入数字，例如 <b>1000</b>。不要加点或逗号。"],
      how: "<b>质押多少？</b>参与空投至少需要 <b>100 #SECT</b>。质押越多，等级越高：",
      prize: "奖励 {n} SECT", nomax: "无上限" },
    6: { k: "钱包 · 确认 1/2", h: "点 “Deposit #SECT” 并批准",
      do: ["点 {en:Deposit #SECT}（存入 #SECT）。", "钱包会打开，请你<b>批准</b>一个“支出上限”。这只允许质押合约拿走你输入的<b>准确</b>数量，绝不会更多。此时还没有任何资金转移。", "核对下面的信息，然后在钱包里点<b>确认</b>。", "<b>请等待。</b>不要关闭页面。需要几秒到一分钟。"],
      checkH: "点确认之前，在钱包里核对这些",
      check: [["请求", "批准 · 支出上限"], ["数量", "就是你输入的 #SECT 数量"], ["合约", "<code>0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0</code>"], ["手续费", "少量 ETH（钱包会显示）"]] },
    7: { k: "钱包 · 确认 2/2", h: "确认存入",
      do: ["批准完成后，钱包会<b>第二次</b>自动打开，这次是<b>存入</b>。", "再点一次<b>确认</b>。等几秒钟。", "会出现一个绿色方框：<b>“Your rewards · accruing every second”</b>（你的奖励，每秒累积），显示 <b>“Deposited”</b>（已存入）和你的数量。"],
      cap: "质押完成：显示了你的存入，奖励每秒都在增长。",
      warn: "<b>把 #SECT 留在质押里。</b>只有质押中的 #SECT 才计入空投。一直放到你的时间完成。你仍然会获得正常的质押奖励。",
      done: ["A 部分完成。", "你的 #SECT 已经在质押中。现在用同一个钱包开启你的节点。"] },
    8: { k: "控制面板", h: "打开控制面板并点 “{ui:connect}”",
      do: ["打开 <b>sectoraorg.com/dashboard</b>。", "在右上角点 {ui:connect}。", "<b>在手机上（Chrome 或 Safari）：</b>会出现一个列表。点 {ui:openMM}（或你的钱包），控制面板会在钱包 App 里打开。在那里再点一次 {ui:connect}。"],
      warn: "<b>使用和质押时相同的钱包。</b>如果节点在另一个钱包上，就不会计入你的空投。",
      lang: "控制面板默认是英文。用顶部的国旗菜单切换到中文，就会和这些截图一样。",
      capPhone: "在手机上：顶部的 {ui:connect}。", capPhone2: "手机上没有钱包时：{ui:openMM}。" },
    9: { k: "你的钱包", h: "选择钱包并接受测试网",
      do: ["在 <b>“{ui:wselTitle}”</b> 列表里，点你的钱包（显示 <b>{ui:detected}</b>）。", "在钱包里点<b>连接</b>。", "控制面板会自动把钱包切换到 <b>Sepolia</b> 测试网。如果钱包询问是否切换或添加网络，点<b>批准</b>或<b>切换网络</b>。"],
      tip: "<b>钱包里没有 Sepolia？</b>打开钱包设置，开启<b>“显示测试网络”</b>。然后再试一次。" },
    10: { k: "免费 Gas", h: "领取免费的 Sepolia ETH 作为 Gas",
      do: ["测试网上的每个操作都需要少量 <b>Sepolia ETH</b>。这是一种免费、没有价值的测试币。", "在控制面板里稍微往下滑到 <b>“{ui:howTitle}”</b>。在 <b>02 “{ui:howGas}”</b> 方框里，点 {ui:howGasBtn}。", "会打开一个 Google Cloud 页面（英文）。确认网络是 <b>Ethereum Sepolia</b>，把你的钱包地址粘贴到 <b>“Wallet address or ENS name”</b>，然后点 <b>Get 0.05 Sepolia ETH</b>。如果要求，请登录一个 Google 账号。", "回到控制面板的标签页。"],
      copy: "<b>怎么复制我的地址？</b>打开钱包，点顶部的账户名或地址，就会自动复制。",
      warn: "<b>Google 提示需要在以太坊主网有 0.001 ETH？</b>Google 水龙头只给在以太坊上至少持有 0.001 真实 ETH 的钱包发放 Sepolia ETH。在钱包里留一点 ETH（A 部分本来就需要），然后再试。",
      capHow: "在控制面板：{ui:howTitle} → 02 方框 → {ui:howGasBtn}。", capDash: "同样的按钮在更下面的 {ui:tnTitle} 里也有。", capGoogle: "Google Cloud 水龙头：(1) 你的地址 · (2) Get 0.05 Sepolia ETH。" },
    11: { k: "免费测试代币", h: "领取 5,000 个免费 tSECT",
      do: ["在同一个方框里，点 {ui:faucetBtn}。", "钱包打开：点<b>确认</b>。", "等几秒钟。<b>“{ui:balance}”</b>现在显示 <b>5,000 tSECT</b>。"],
      tip: "tSECT 是<b>没有货币价值的测试代币</b>。每 24 小时可以再领一次。" },
    12: { k: "算力市场", h: "购买 Node Kit · 50 TH/s",
      do: ["往下滑到 <b>“{ui:market}”</b>。", "打开 {ui:physical} 标签 <b>(1)</b>。", "点标有 <b>{ui:airdropPlan}</b> 的 <b>50 TH/s · 4,300 tSECT</b> 卡片 <b>(2)</b>。这就是适用于空投的节点。", "点 {ui:buy50} <b>(3)</b>。", "钱包会打开<b>两次</b>：第一次允许付款，第二次确认购买。两次都点<b>确认</b>。"],
      cap1: "(1) {ui:physical} · (2) 50 TH/s · {ui:airdropPlan}", cap2: "(3) {ui:buy50}",
      see: "这 4,300 tSECT 来自第 11 步领取的 5,000 个免费 tSECT。<b>不花真钱。</b>" },
    13: { k: "你的节点", h: "注册你的节点。位置自动填写。",
      do: ["往下滑到 <b>“{ui:node}”</b>。", "你的节点位置<b>已经检测好 (1)</b>，名字也<b>已经填好</b>。你什么都不用输入。", "点 {ui:register} <b>(2)</b>。", "钱包打开：点<b>确认</b>。"],
      cap: "(1) 自动检测的位置 · (2) {ui:register}",
      tip: "<b>关于位置。</b>我们的系统会根据你的网络连接检测节点的大致位置并自动填写。网络上只保存<b>城市</b>，<b>绝不保存你的住址</b>。位置不对（例如因为 VPN）？点 <b>“{ui:change}”</b> 进行修改。",
      planH: "第 13 步 · 备用方案 · 仅当你看到 “{ui:geoFail}” 时",
      plan: [["原因", "有时 VPN、广告拦截器或非常严格的浏览器会阻止检测。这时会出现两个输入框：<b>{ui:lat}</b> 和 <b>{ui:lon}</b>。"],
        ["找到数字", "打开 Google 地图，搜索<b>你的城市</b>。电脑上在城市中心点右键；手机上长按。你会看到两个数字，例如 <code>40.4168, -3.7038</code>。"],
        ["填写", "<b>第一个</b>数字填到 <b>{ui:lat} (1)</b>。<b>第二个</b>数字填到 <b>{ui:lon} (2)</b>。有负号的话要保留。"],
        ["然后", "点 {ui:register} 并在钱包里确认。填城市，不要填你家的位置。"]],
      planCap: "仅在无法检测位置时：(1) {ui:lat} · (2) {ui:lon}" },
    14: { k: "完成", h: "完成：你的节点已开启",
      do: ["按钮变成 {ui:registered}。", "你的节点出现在网络地图上。从现在开始计数。"],
      onoff: [["可以", "可以关闭标签页", "你的节点会自己在网络上保持开启。"], ["可以", "可以关闭电脑", "你的节点不依赖你的电脑或手机。"], ["不要", "永远不要停用节点", "不要点击任何按钮，也不要签署任何会停用或关闭节点的交易。节点关闭期间不计数，直到你重新开启。"]],
      done: ["B 部分完成。你已加入空投。", "质押 + 节点开启，同一个钱包。你的计数正在进行。"] },
    15: { k: "我的空投", h: "打开“我的空投”",
      do: ["打开 <b>sectoraorg.com/myairdrop</b>。", "点 {ui:myConnect}，或粘贴你的钱包地址后点 {ui:myCheck}。", "你会看到目前已获得的数量、你的<b>等级</b>、<b>奖励</b>和三个条件。"],
      cap: "示例：质押 1,000 #SECT = Guardian，奖励 750 SECT。",
      checkH: "三个条件",
      check: [["✓ 质押 100+ SECT", "在 A 部分完成。"], ["✓ Hash Node 已开启", "在 B 部分完成。"], ["持续 30 天", "前两个条件满足后自动开始。只需等待，什么都不要动。"]] },
    16: { k: "空投页面", h: "在空投页面快速查看",
      do: ["打开空投页面 <b>sectoraorg.com/airdrop</b>，点 {ui:takePart}。", "连接你的钱包。<b>“你的空投”</b>窗口会显示你目前获得的数量、奖励和等级。"],
      cap1: "空投页面：点 {ui:takePart}。", cap2: "“你的空投”窗口示例。",
      see: "<b>什么时候收到我的 SECT？</b>在 SectoraEVM 主网上线时发放。你可以在 <a href=\"/sectorascan/\">SectoraScan</a> 上关注。" }
  },
  wallet: {
    site: "sectoraorg.com",
    connect: { h: "连接到此网站", p: "sectoraorg.com 想查看你的账户地址，并请求你批准操作。", no: "取消", yes: "连接" },
    approve: { h: "支出上限请求", rows: [["代币", "#SECT"], ["支出上限", "1,000 SECT"], ["授权给", "0x79Cb…20E0"], ["网络手续费", "以 ETH 支付"]], no: "拒绝", yes: "确认" },
    deposit: { h: "交易请求", rows: [["交互对象", "0x79Cb…20E0"], ["操作", "存入"], ["网络手续费", "以 ETH 支付"]], no: "拒绝", yes: "确认" },
    sw: { h: "允许此网站切换网络吗？", from: "Ethereum", to: "Sepolia", no: "取消", yes: "切换网络" }
  },
  faq: {
    k: "问题 · 快速解答", h: "有什么不对？<b>先看这里。</b>",
    items: [
      ["质押页面显示 “Not enough ETH”", "A 部分使用真实的以太坊。在同一个钱包里添加少量 ETH（以太坊上的），然后再试。"],
      ["控制面板提示 Gas 不足", "B 部分使用免费的 Sepolia ETH。重做<a href=\"#step-10\">第 10 步</a>。"],
      ["Google 水龙头要求以太坊上有 0.001 ETH", "使用 Google 水龙头，钱包里需要在以太坊上至少有 0.001 真实 ETH。留一点 ETH 再试，或联系客服。"],
      ["我的钱包里没有 Sepolia", "在钱包设置里开启“显示测试网络”，然后刷新控制面板。"],
      ["“Switch your wallet to the Ethereum network”", "你在质押页面上用了错误的网络。在钱包里选择 Ethereum（以太坊主网）并刷新。"],
      ["“You do not have that many #SECT in your wallet”", "意思是你的 #SECT 不够。输入更小的数量，或用我们的<a href=\"/guide/\">购买指南</a>再买一些。"],
      ["tSECT 不够买 Node Kit", "在<a href=\"#step-11\">第 11 步</a>领取 5,000 tSECT。今天已经领过了？等 24 小时再领。"],
      ["我用了另一个钱包开节点", "不会计入。在控制面板连接你的<b>质押钱包</b>，用它重做 B 部分。"],
      ["没有检测到位置，或位置不对", "点 “{ui:change}”，或按照<a href=\"#step-13\">第 13 步</a>的备用方案操作。填城市，不要填你家。"],
      ["钱包窗口没有打开", "自己打开钱包 App 或扩展：请求正在那里等你。在手机上批准后，回到浏览器标签页。"],
      ["电脑需要一直开着吗？", "不需要。注册后，节点会自己保持开启。只是永远不要停用它。"],
      ["参与需要取出质押吗？", "不需要。永远不要。质押中的 #SECT 原样计入，你也会继续获得质押奖励。"],
      ["B 部分要花钱吗？", "不要。tSECT 和 Sepolia ETH 都是免费、没有价值的测试币。"]
    ]
  },
  help: {
    k: "客服", h: "还是卡住了？<b>给我们写信。</b>",
    p: "给我们的客服团队发邮件，主题写 <b>“Airdrop Connection”</b>。为了更快帮到你，请附上：",
    list: ["你的<b>公开</b>钱包地址（以 0x 开头）。", "你卡住的<b>步骤编号</b>。", "错误的<b>截图</b>。"],
    email: "邮箱", subject: "主题", subjectV: "Airdrop Connection", btn: "联系客服",
    never: "<b>永远不要</b>发送你的助记词（12 或 24 个单词）或私钥。不要发给我们，也不要发给任何人。"
  },
  foot: {
    legal: "<b>Sectora Foundation IL</b> · 网络安全公司 · 美国伊利诺伊州芝加哥 · 伊利诺伊州登记号 18523639 · EIN 32-0868576",
    token: "#SECT 代币（以太坊，ERC-20）", staking: "质押合约", support: "客服：support@sectoraorg.com · 主题 “Airdrop Connection”",
    online: "在线版（含链接）：sectoraorg.com/airdrop-guide/zh",
    nav: ["空投", "质押", "Hash Node", "我的空投", "法律信息"]
  }
};
