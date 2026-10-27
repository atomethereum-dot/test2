/* Grifos de ETH de Sepolia. El de Google falla a menudo (limite diario, cuenta o
   saldo en la red principal), asi que cada enlace al grifo de Google del dash
   (paso 2 de "Como funciona", la nota de Faucet & rewards y la guia del nodo)
   abre esta ventana con varios grifos en orden: si uno falla, el siguiente.
   Si hay wallet conectada, muestra su direccion para copiarla y pegarla. */
(function () {
  "use strict";
  var GOOGLE = "https://cloud.google.com/application/web3/faucet/ethereum/sepolia";
  var GRIFOS = [
    { id: "qn", url: "https://faucet.quicknode.com/ethereum/sepolia", name: "QuickNode", best: true },
    { id: "gg", url: GOOGLE, name: "Google Cloud" },
    { id: "pow", url: "https://sepolia-faucet.pk910.de/", name: "Sepolia PoW Faucet" }
  ];
  var T = {
    en: { k: "Free gas · Sepolia", h: "Get free Sepolia ETH", p: "Copy your address, open a faucet and paste it. If one fails, try the next one: a little Sepolia ETH covers every step.",
      qn: "No account and no balance needed · every 12 h", gg: "With your Google account · once a day", pow: "No requirements: leave the tab open a few minutes while it fills up",
      best: "Recommended", open: "Open", addr: "Your address", copy: "Copy", copied: "Copied", noacct: "Connect your wallet to copy your address here.", close: "Close" },
    es: { k: "Gas gratis · Sepolia", h: "Consigue ETH de Sepolia gratis", p: "Copia tu dirección, abre un grifo y pégala. Si uno falla, prueba el siguiente: con un poco de ETH de Sepolia te alcanza para todos los pasos.",
      qn: "Sin cuenta ni saldo previo · cada 12 h", gg: "Con tu cuenta de Google · una vez al día", pow: "Sin requisitos: deja la pestaña abierta unos minutos mientras se llena",
      best: "Recomendado", open: "Abrir", addr: "Tu dirección", copy: "Copiar", copied: "Copiada", noacct: "Conecta tu wallet para copiar aquí tu dirección.", close: "Cerrar" },
    pt: { k: "Gás grátis · Sepolia", h: "Consiga ETH da Sepolia grátis", p: "Copie seu endereço, abra uma torneira e cole. Se uma falhar, tente a próxima: um pouco de ETH da Sepolia basta para todos os passos.",
      qn: "Sem conta e sem saldo · a cada 12 h", gg: "Com sua conta Google · uma vez por dia", pow: "Sem requisitos: deixe a aba aberta alguns minutos enquanto enche",
      best: "Recomendado", open: "Abrir", addr: "Seu endereço", copy: "Copiar", copied: "Copiado", noacct: "Conecte sua carteira para copiar seu endereço aqui.", close: "Fechar" },
    fr: { k: "Gas gratuit · Sepolia", h: "Obtenez de l’ETH Sepolia gratuit", p: "Copiez votre adresse, ouvrez un faucet et collez-la. Si l’un échoue, essayez le suivant : un peu d’ETH Sepolia suffit pour toutes les étapes.",
      qn: "Sans compte ni solde · toutes les 12 h", gg: "Avec votre compte Google · une fois par jour", pow: "Sans conditions : laissez l’onglet ouvert quelques minutes pendant qu’il se remplit",
      best: "Recommandé", open: "Ouvrir", addr: "Votre adresse", copy: "Copier", copied: "Copiée", noacct: "Connectez votre wallet pour copier votre adresse ici.", close: "Fermer" },
    de: { k: "Gratis-Gas · Sepolia", h: "Kostenloses Sepolia-ETH holen", p: "Kopiere deine Adresse, öffne einen Faucet und füge sie ein. Wenn einer nicht klappt, nimm den nächsten: etwas Sepolia-ETH reicht für alle Schritte.",
      qn: "Ohne Konto und ohne Guthaben · alle 12 h", gg: "Mit deinem Google-Konto · einmal am Tag", pow: "Ohne Voraussetzungen: Tab ein paar Minuten offen lassen, bis er sich füllt",
      best: "Empfohlen", open: "Öffnen", addr: "Deine Adresse", copy: "Kopieren", copied: "Kopiert", noacct: "Verbinde deine Wallet, um deine Adresse hier zu kopieren.", close: "Schließen" },
    ru: { k: "Бесплатный газ · Sepolia", h: "Получите бесплатный Sepolia ETH", p: "Скопируйте адрес, откройте кран и вставьте его. Если один не сработал, попробуйте следующий: немного Sepolia ETH хватит на все шаги.",
      qn: "Без аккаунта и баланса · каждые 12 ч", gg: "С аккаунтом Google · раз в день", pow: "Без условий: оставьте вкладку открытой на несколько минут, пока она наполняется",
      best: "Рекомендуем", open: "Открыть", addr: "Ваш адрес", copy: "Копировать", copied: "Скопировано", noacct: "Подключите кошелёк, чтобы скопировать адрес здесь.", close: "Закрыть" },
    zh: { k: "免费 Gas · Sepolia", h: "免费领取 Sepolia ETH", p: "复制你的地址，打开一个水龙头并粘贴。如果一个失败，就试下一个：少量 Sepolia ETH 就足够完成所有步骤。",
      qn: "无需账户，无需余额 · 每 12 小时", gg: "使用你的 Google 账户 · 每天一次", pow: "无任何要求：让标签页保持打开几分钟，等它累积",
      best: "推荐", open: "打开", addr: "你的地址", copy: "复制", copied: "已复制", noacct: "连接钱包后可在此复制你的地址。", close: "关闭" },
    ja: { k: "無料ガス · Sepolia", h: "Sepolia ETH を無料で入手", p: "アドレスをコピーし、フォーセットを開いて貼り付けます。うまくいかなければ次を試してください。少しの Sepolia ETH ですべての手順に足ります。",
      qn: "アカウント・残高不要 · 12 時間ごと", gg: "Google アカウントで · 1 日 1 回", pow: "条件なし：数分間タブを開いたままにして貯める",
      best: "おすすめ", open: "開く", addr: "あなたのアドレス", copy: "コピー", copied: "コピー済み", noacct: "ウォレットを接続すると、ここでアドレスをコピーできます。", close: "閉じる" },
    ko: { k: "무료 가스 · Sepolia", h: "Sepolia ETH 무료로 받기", p: "주소를 복사하고 포싯을 열어 붙여넣으세요. 하나가 안 되면 다음 것을 시도하세요. 약간의 Sepolia ETH로 모든 단계를 진행할 수 있습니다.",
      qn: "계정·잔액 필요 없음 · 12시간마다", gg: "Google 계정으로 · 하루 한 번", pow: "조건 없음: 탭을 몇 분간 열어 두면 채워집니다",
      best: "추천", open: "열기", addr: "내 주소", copy: "복사", copied: "복사됨", noacct: "지갑을 연결하면 여기서 주소를 복사할 수 있습니다.", close: "닫기" },
    ar: { k: "غاز مجاني · Sepolia", h: "احصل على ETH على Sepolia مجانًا", p: "انسخ عنوانك وافتح صنبورًا والصقه. إذا فشل أحدها جرّب التالي: القليل من ETH على Sepolia يكفي لكل الخطوات.",
      qn: "بلا حساب وبلا رصيد · كل 12 ساعة", gg: "بحساب Google · مرة يوميًا", pow: "بلا شروط: اترك التبويب مفتوحًا بضع دقائق حتى يمتلئ",
      best: "موصى به", open: "فتح", addr: "عنوانك", copy: "نسخ", copied: "تم النسخ", noacct: "اربط محفظتك لنسخ عنوانك هنا.", close: "إغلاق" },
    hi: { k: "मुफ़्त गैस · Sepolia", h: "मुफ़्त Sepolia ETH पाएँ", p: "अपना पता कॉपी करें, एक फ़ॉसेट खोलें और पेस्ट करें। एक न चले तो अगला आज़माएँ: थोड़ा Sepolia ETH सभी चरणों के लिए काफ़ी है।",
      qn: "न खाता, न बैलेंस · हर 12 घंटे", gg: "अपने Google खाते से · दिन में एक बार", pow: "कोई शर्त नहीं: टैब कुछ मिनट खुला छोड़ें, वह भरता जाएगा",
      best: "सुझाया गया", open: "खोलें", addr: "आपका पता", copy: "कॉपी", copied: "कॉपी हुआ", noacct: "अपना पता यहाँ कॉपी करने के लिए वॉलेट जोड़ें।", close: "बंद करें" }
  };
  function L() { var l = (document.documentElement.lang || "en").slice(0, 2); return T[l] || T.en; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var css = "" +
    ".gas{position:fixed;inset:0;z-index:470;display:none;padding:12vh 20px 20px;justify-content:center;align-items:flex-start;background:rgba(2,4,8,.78);opacity:0;transition:opacity .22s ease}" +
    ".gas.on{display:flex}.gas.vis{opacity:1}" +
    ".gas-box{position:relative;width:min(480px,100%);max-height:80vh;overflow:auto;background:#080b11;border:1px solid var(--rule,rgba(255,255,255,.12));box-shadow:0 30px 90px rgba(0,0,0,.7);" +
    "padding:22px 22px 18px;transform:translateY(-8px) scale(.985);transition:transform .28s cubic-bezier(.22,1,.36,1);color:var(--ink,#f2f5fa)}" +
    ".gas.vis .gas-box{transform:none}" +
    ".gas-box::before{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:var(--blue,#1569ff)}" +
    ".gas-k{font:500 10px/1 'IBM Plex Mono',monospace;letter-spacing:.2em;text-transform:uppercase;color:#4d8dff}" +
    ".gas-x{position:absolute;right:12px;top:12px;width:30px;height:30px;border:1px solid rgba(255,255,255,.12);background:none;color:#b6c0d1;cursor:pointer;font-size:16px;line-height:1}" +
    ".gas h3{margin:12px 0 0;font-size:23px;font-weight:300;letter-spacing:-.015em}" +
    ".gas-p{margin:8px 0 0;font-size:14px;line-height:1.55;color:#b6c0d1}" +
    ".gas-ad{display:flex;align-items:center;gap:10px;margin-top:16px;padding:10px 12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03)}" +
    ".gas-ad span{font:400 10px/1 'IBM Plex Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#7b8598;flex:none}" +
    ".gas-ad code{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:400 13px 'IBM Plex Mono',monospace;color:#f2f5fa}" +
    ".gas-ad button{flex:none;padding:7px 10px;border:1px solid #1569ff;background:rgba(21,105,255,.12);color:#9cc0ff;cursor:pointer;font:500 10px/1 'IBM Plex Mono',monospace;letter-spacing:.14em;text-transform:uppercase}" +
    ".gas-na{margin-top:16px;font-size:13px;color:#7b8598}" +
    ".gas-l{list-style:none;margin:14px 0 0;padding:0;border-top:1px solid rgba(255,255,255,.08)}" +
    ".gas-l li{border-bottom:1px solid rgba(255,255,255,.08)}" +
    ".gas-l a{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:12px;align-items:center;padding:14px 4px;color:inherit;text-decoration:none;transition:background .2s}" +
    ".gas-l a:hover{background:rgba(21,105,255,.07)}" +
    ".gas-l .n{font:500 11px/1 'IBM Plex Mono',monospace;color:#7b8598}" +
    ".gas-l b{display:block;font-size:15.5px;font-weight:400}" +
    ".gas-l b i{margin-left:8px;padding:3px 6px;border:1px solid rgba(61,220,151,.45);color:#3ddc97;font:500 9px/1 'IBM Plex Mono',monospace;letter-spacing:.14em;text-transform:uppercase;font-style:normal;vertical-align:2px}" +
    ".gas-l small{display:block;margin-top:4px;font-size:12.5px;line-height:1.45;color:#7b8598}" +
    ".gas-l .go{font:500 10px/1 'IBM Plex Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#4d8dff;white-space:nowrap}" +
    "@media (prefers-reduced-motion:reduce){.gas,.gas-box{transition:none}}";

  var box = null, addr = null;
  function build() {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    box = document.createElement("div"); box.className = "gas"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    document.body.appendChild(box);
    box.addEventListener("click", function (e) { if (e.target === box || e.target.closest(".gas-x")) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box.classList.contains("on")) close(); });
  }
  function paint() {
    var t = L();
    var rows = GRIFOS.map(function (g, i) {
      return '<li><a href="' + g.url + '" target="_blank" rel="noopener noreferrer"><span class="n">0' + (i + 1) + "</span><span><b>" + esc(g.name) +
        (g.best ? "<i>" + esc(t.best) + "</i>" : "") + "</b><small>" + esc(t[g.id]) + '</small></span><span class="go">' + esc(t.open) + " ↗</span></a></li>";
    }).join("");
    box.innerHTML = '<div class="gas-box"><button type="button" class="gas-x" aria-label="' + esc(t.close) + '">×</button>' +
      '<p class="gas-k">' + esc(t.k) + "</p><h3>" + esc(t.h) + '</h3><p class="gas-p">' + esc(t.p) + "</p>" +
      (addr ? '<div class="gas-ad"><span>' + esc(t.addr) + "</span><code>" + esc(addr) + '</code><button type="button" class="gas-cp">' + esc(t.copy) + "</button></div>"
            : '<p class="gas-na">' + esc(t.noacct) + "</p>") +
      '<ul class="gas-l">' + rows + "</ul></div>";
    var cp = box.querySelector(".gas-cp");
    if (cp) cp.addEventListener("click", function () {
      var done = function () { cp.textContent = t.copied; setTimeout(function () { cp.textContent = t.copy; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(addr).then(done, function () {}); else done();
    });
  }
  function open() {
    if (!box) build();
    addr = null; paint();
    box.classList.add("on"); requestAnimationFrame(function () { box.classList.add("vis"); });
    /* la wallet conectada del dash, solo para mostrar su direccion (lectura, sin firmar nada) */
    var get = window.__sectoraEIP1193, p = get && get();
    if (p && p.request) p.request({ method: "eth_accounts" }).then(function (a) { if (a && a[0]) { addr = a[0]; paint(); } }).catch(function () {});
  }
  function close() { box.classList.remove("vis"); setTimeout(function () { box.classList.remove("on"); }, 220); }

  /* cualquier enlace al grifo de Google abre la ventana con todos los grifos */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="' + GOOGLE + '"]');
    if (!a || (box && box.contains(a))) return;
    e.preventDefault(); open();
  }, true);
  window.SectoraGas = { open: open };
})();
