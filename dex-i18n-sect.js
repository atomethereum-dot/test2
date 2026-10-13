/* Textos del mercado real SECT/USDT del DEX, en los 11 idiomas del
   selector. i18n.js los mezcla con translations.js (SECTORA_I18N_EXTRA);
   lo que falte en un idioma sale en ingles. */
(function () {
  var K = ["marketTitle", "tokenTitle", "price", "change", "high", "low", "vol", "mcap", "pool", "network",
    "liquidity", "locked", "supply", "tax", "contract", "updated", "buyTitle", "buySub", "pay", "receive",
    "rate", "fee", "buyBtn", "buyNote", "tag", "live", "snapshot"];
  var T = {
    en: ["Market data", "Token", "Price", "24h change", "24h high", "24h low", "24h volume", "Market cap", "Pool", "Network",
      "Liquidity", "Locked · Team Finance", "Supply", "Buy / sell tax", "Contract", "Updated", "Buy SECT",
      "Real market · Uniswap V3 on Ethereum", "You pay", "You receive (estimate)", "Price", "Pool fee", "Buy SECT on Uniswap",
      "You confirm the swap in your own wallet on Uniswap. Always check the contract address:", "Real market", "Live", "Snapshot"],
    es: ["Datos de mercado", "Token", "Precio", "Cambio 24h", "Máximo 24h", "Mínimo 24h", "Volumen 24h", "Capitalización", "Pool", "Red",
      "Liquidez", "Bloqueada · Team Finance", "Suministro", "Impuesto compra / venta", "Contrato", "Actualizado", "Comprar SECT",
      "Mercado real · Uniswap V3 en Ethereum", "Pagas", "Recibes (estimado)", "Precio", "Comisión del pool", "Comprar SECT en Uniswap",
      "Confirmas el intercambio en tu propia wallet en Uniswap. Comprueba siempre la dirección del contrato:", "Mercado real", "En vivo", "Instantánea"],
    pt: ["Dados de mercado", "Token", "Preço", "Variação 24h", "Máxima 24h", "Mínima 24h", "Volume 24h", "Capitalização", "Pool", "Rede",
      "Liquidez", "Bloqueada · Team Finance", "Oferta", "Taxa de compra / venda", "Contrato", "Atualizado", "Comprar SECT",
      "Mercado real · Uniswap V3 na Ethereum", "Você paga", "Você recebe (estimativa)", "Preço", "Taxa do pool", "Comprar SECT na Uniswap",
      "Você confirma a troca na sua própria carteira na Uniswap. Confira sempre o endereço do contrato:", "Mercado real", "Ao vivo", "Instantâneo"],
    fr: ["Données de marché", "Jeton", "Prix", "Variation 24 h", "Plus haut 24 h", "Plus bas 24 h", "Volume 24 h", "Capitalisation", "Pool", "Réseau",
      "Liquidité", "Bloquée · Team Finance", "Offre", "Taxe achat / vente", "Contrat", "Mis à jour", "Acheter du SECT",
      "Marché réel · Uniswap V3 sur Ethereum", "Vous payez", "Vous recevez (estimation)", "Prix", "Frais du pool", "Acheter du SECT sur Uniswap",
      "Vous confirmez l’échange dans votre propre wallet sur Uniswap. Vérifiez toujours l’adresse du contrat :", "Marché réel", "En direct", "Instantané"],
    de: ["Marktdaten", "Token", "Preis", "24h-Änderung", "24h-Hoch", "24h-Tief", "24h-Volumen", "Marktkapitalisierung", "Pool", "Netzwerk",
      "Liquidität", "Gesperrt · Team Finance", "Angebot", "Kauf- / Verkaufssteuer", "Vertrag", "Aktualisiert", "SECT kaufen",
      "Echter Markt · Uniswap V3 auf Ethereum", "Du zahlst", "Du erhältst (Schätzung)", "Preis", "Pool-Gebühr", "SECT auf Uniswap kaufen",
      "Du bestätigst den Tausch in deiner eigenen Wallet auf Uniswap. Prüfe immer die Vertragsadresse:", "Echter Markt", "Live", "Momentaufnahme"],
    ru: ["Рыночные данные", "Токен", "Цена", "Изменение за 24 ч", "Максимум за 24 ч", "Минимум за 24 ч", "Объём за 24 ч", "Капитализация", "Пул", "Сеть",
      "Ликвидность", "Заблокирована · Team Finance", "Предложение", "Налог на покупку / продажу", "Контракт", "Обновлено", "Купить SECT",
      "Реальный рынок · Uniswap V3 в Ethereum", "Вы платите", "Вы получите (оценка)", "Цена", "Комиссия пула", "Купить SECT на Uniswap",
      "Обмен подтверждается в вашем собственном кошельке на Uniswap. Всегда проверяйте адрес контракта:", "Реальный рынок", "Онлайн", "Снимок"],
    zh: ["市场数据", "代币", "价格", "24小时涨跌", "24小时最高", "24小时最低", "24小时成交量", "市值", "资金池", "网络",
      "流动性", "已锁定 · Team Finance", "供应量", "买入 / 卖出税", "合约", "更新于", "购买 SECT",
      "真实市场 · 以太坊上的 Uniswap V3", "支付", "获得（估算）", "价格", "资金池手续费", "在 Uniswap 购买 SECT",
      "兑换需在您自己的钱包中于 Uniswap 上确认。请务必核对合约地址：", "真实市场", "实时", "快照"],
    ja: ["マーケットデータ", "トークン", "価格", "24時間変動", "24時間高値", "24時間安値", "24時間出来高", "時価総額", "プール", "ネットワーク",
      "流動性", "ロック済み · Team Finance", "供給量", "売買税", "コントラクト", "更新", "SECTを購入",
      "実際の市場 · Ethereum上のUniswap V3", "支払い", "受け取り（概算）", "価格", "プール手数料", "UniswapでSECTを購入",
      "スワップはUniswap上でご自身のウォレットで承認します。必ずコントラクトアドレスを確認してください：", "実際の市場", "ライブ", "スナップショット"],
    ko: ["시장 데이터", "토큰", "가격", "24시간 변동", "24시간 최고", "24시간 최저", "24시간 거래량", "시가총액", "풀", "네트워크",
      "유동성", "잠김 · Team Finance", "공급량", "매수 / 매도 세금", "컨트랙트", "업데이트", "SECT 구매",
      "실제 시장 · 이더리움의 Uniswap V3", "지불", "수령 (예상)", "가격", "풀 수수료", "Uniswap에서 SECT 구매",
      "스왑은 Uniswap에서 본인의 지갑으로 승인합니다. 항상 컨트랙트 주소를 확인하세요:", "실제 시장", "실시간", "스냅샷"],
    ar: ["بيانات السوق", "الرمز", "السعر", "التغير خلال 24 ساعة", "الأعلى خلال 24 ساعة", "الأدنى خلال 24 ساعة", "حجم التداول خلال 24 ساعة", "القيمة السوقية", "المجمع", "الشبكة",
      "السيولة", "مقفلة · Team Finance", "المعروض", "ضريبة الشراء / البيع", "العقد", "آخر تحديث", "شراء SECT",
      "سوق حقيقي · Uniswap V3 على إيثريوم", "تدفع", "تستلم (تقدير)", "السعر", "رسوم المجمع", "شراء SECT على Uniswap",
      "تؤكد عملية المبادلة في محفظتك الخاصة على Uniswap. تحقق دائمًا من عنوان العقد:", "سوق حقيقي", "مباشر", "لقطة"],
    hi: ["बाज़ार डेटा", "टोकन", "कीमत", "24 घंटे का बदलाव", "24 घंटे का उच्च", "24 घंटे का निम्न", "24 घंटे का वॉल्यूम", "मार्केट कैप", "पूल", "नेटवर्क",
      "लिक्विडिटी", "लॉक · Team Finance", "सप्लाई", "खरीद / बिक्री टैक्स", "कॉन्ट्रैक्ट", "अपडेट", "SECT खरीदें",
      "असली बाज़ार · Ethereum पर Uniswap V3", "आप देते हैं", "आपको मिलेगा (अनुमान)", "कीमत", "पूल शुल्क", "Uniswap पर SECT खरीदें",
      "स्वैप की पुष्टि आप Uniswap पर अपने वॉलेट में करते हैं। हमेशा कॉन्ट्रैक्ट पता जाँचें:", "असली बाज़ार", "लाइव", "स्नैपशॉट"]
  };

  // tarjetas que rellenan las columnas del DEX
  var K2 = ["recentTitle", "howTitle", "step1", "step2", "step3", "verifyTitle", "lock", "audit", "whitepaper", "promoTitle", "promoTrade", "promoBuy", "moversTitle", "gainers", "losers", "tradesTitle", "promoSub"];
  var T2 = {
    en: ["Recent prices", "How to buy SECT", "Open Uniswap with the official button. It already carries the SECT/USDT pair.", "Connect your wallet on Ethereum and choose how many USDT to pay.", "Before confirming, check the contract address:", "Verify", "Liquidity lock", "Audit", "Whitepaper", "Our market", "Trade SECT/USDT", "Buy on Uniswap", "Top movers · 24h", "Gainers", "Losers", "Trades", "Real market · Uniswap V3 on Ethereum"],
    es: ["Precios recientes", "Cómo comprar SECT", "Abre Uniswap con el botón oficial. Ya lleva el par SECT/USDT.", "Conecta tu wallet en Ethereum y elige cuántos USDT pagar.", "Antes de confirmar, comprueba la dirección del contrato:", "Verificar", "Bloqueo de liquidez", "Auditoría", "Whitepaper", "Nuestro mercado", "Operar SECT/USDT", "Comprar en Uniswap", "Más movidos · 24h", "Suben", "Bajan", "Operaciones", "Mercado real · Uniswap V3 en Ethereum"],
    pt: ["Preços recentes", "Como comprar SECT", "Abra a Uniswap com o botão oficial. O par SECT/USDT já vem selecionado.", "Conecte sua carteira na Ethereum e escolha quantos USDT pagar.", "Antes de confirmar, confira o endereço do contrato:", "Verificar", "Bloqueio de liquidez", "Auditoria", "Whitepaper", "Nosso mercado", "Negociar SECT/USDT", "Comprar na Uniswap", "Maiores variações · 24h", "Em alta", "Em baixa", "Negociações", "Mercado real · Uniswap V3 na Ethereum"],
    fr: ["Prix récents", "Comment acheter du SECT", "Ouvrez Uniswap avec le bouton officiel. La paire SECT/USDT est déjà sélectionnée.", "Connectez votre wallet sur Ethereum et choisissez combien d’USDT payer.", "Avant de confirmer, vérifiez l’adresse du contrat :", "Vérifier", "Blocage de la liquidité", "Audit", "Livre blanc", "Notre marché", "Trader SECT/USDT", "Acheter sur Uniswap", "Plus fortes variations · 24 h", "Hausses", "Baisses", "Transactions", "Marché réel · Uniswap V3 sur Ethereum"],
    de: ["Letzte Preise", "So kaufst du SECT", "Öffne Uniswap über den offiziellen Button. Das Paar SECT/USDT ist schon ausgewählt.", "Verbinde deine Wallet auf Ethereum und wähle, wie viele USDT du zahlst.", "Prüfe vor dem Bestätigen die Vertragsadresse:", "Prüfen", "Liquiditätssperre", "Audit", "Whitepaper", "Unser Markt", "SECT/USDT handeln", "Auf Uniswap kaufen", "Top-Bewegungen · 24h", "Gewinner", "Verlierer", "Trades", "Echter Markt · Uniswap V3 auf Ethereum"],
    ru: ["Последние цены", "Как купить SECT", "Откройте Uniswap официальной кнопкой. Пара SECT/USDT уже выбрана.", "Подключите кошелёк в сети Ethereum и укажите, сколько USDT заплатить.", "Перед подтверждением проверьте адрес контракта:", "Проверить", "Блокировка ликвидности", "Аудит", "Whitepaper", "Наш рынок", "Торговать SECT/USDT", "Купить на Uniswap", "Лидеры движения · 24 ч", "Рост", "Падение", "Сделки", "Реальный рынок · Uniswap V3 в Ethereum"],
    zh: ["最新价格", "如何购买 SECT", "通过官方按钮打开 Uniswap，已自动选好 SECT/USDT 交易对。", "在以太坊上连接您的钱包，并选择支付多少 USDT。", "确认之前，请核对合约地址：", "核验", "流动性锁定", "审计", "白皮书", "我们的市场", "交易 SECT/USDT", "在 Uniswap 购买", "24小时涨跌榜", "上涨", "下跌", "成交", "真实市场 · 以太坊上的 Uniswap V3"],
    ja: ["最近の価格", "SECTの購入方法", "公式ボタンでUniswapを開きます。SECT/USDTペアが選択済みです。", "Ethereumでウォレットを接続し、支払うUSDTの額を選びます。", "確定する前にコントラクトアドレスを確認してください：", "確認する", "流動性ロック", "監査", "ホワイトペーパー", "私たちのマーケット", "SECT/USDTを取引", "Uniswapで購入", "24時間の値動き上位", "上昇", "下落", "約定", "実際の市場 · Ethereum上のUniswap V3"],
    ko: ["최근 가격", "SECT 구매 방법", "공식 버튼으로 Uniswap을 엽니다. SECT/USDT 페어가 이미 선택되어 있습니다.", "이더리움에서 지갑을 연결하고 지불할 USDT 금액을 정합니다.", "확인하기 전에 컨트랙트 주소를 확인하세요:", "확인", "유동성 잠금", "감사", "백서", "우리 시장", "SECT/USDT 거래", "Uniswap에서 구매", "24시간 변동 상위", "상승", "하락", "체결", "실제 시장 · 이더리움의 Uniswap V3"],
    ar: ["أحدث الأسعار", "كيفية شراء SECT", "افتح Uniswap من الزر الرسمي، فالزوج SECT/USDT محدد مسبقًا.", "اربط محفظتك على إيثريوم واختر كمية USDT التي ستدفعها.", "قبل التأكيد، تحقق من عنوان العقد:", "تحقق", "قفل السيولة", "التدقيق", "الورقة البيضاء", "سوقنا", "تداول SECT/USDT", "شراء على Uniswap", "الأكثر تحركًا · 24 ساعة", "صاعدة", "هابطة", "الصفقات", "سوق حقيقي · Uniswap V3 على إيثريوم"],
    hi: ["हाल की कीमतें", "SECT कैसे खरीदें", "आधिकारिक बटन से Uniswap खोलें। SECT/USDT जोड़ी पहले से चुनी हुई है।", "Ethereum पर अपना वॉलेट कनेक्ट करें और तय करें कितने USDT देने हैं।", "पुष्टि करने से पहले कॉन्ट्रैक्ट पता जाँचें:", "सत्यापित करें", "लिक्विडिटी लॉक", "ऑडिट", "व्हाइटपेपर", "हमारा बाज़ार", "SECT/USDT ट्रेड करें", "Uniswap पर खरीदें", "24 घंटे में सबसे ज़्यादा बदलाव", "बढ़त", "गिरावट", "ट्रेड", "असली बाज़ार · Ethereum पर Uniswap V3"]
  };
  var K3 = ["levPerpTitle", "levFutTitle", "levMarket", "levPrice", "levChange", "levFunding", "levOI", "levBasis", "levExpiry"];
  var T3 = {
    en: ["Perpetual markets", "Futures markets", "Market", "Price", "24h", "Funding", "Open interest", "Basis", "Expiry"],
    es: ["Mercados perpetuos", "Mercados de futuros", "Mercado", "Precio", "24h", "Financiación", "Interés abierto", "Base", "Vencimiento"],
    pt: ["Mercados perpétuos", "Mercados futuros", "Mercado", "Preço", "24h", "Financiamento", "Contratos em aberto", "Base", "Vencimento"],
    fr: ["Marchés perpétuels", "Marchés à terme", "Marché", "Prix", "24 h", "Financement", "Intérêt ouvert", "Base", "Échéance"],
    de: ["Perpetual-Märkte", "Futures-Märkte", "Markt", "Preis", "24h", "Funding", "Open Interest", "Basis", "Fälligkeit"],
    ru: ["Бессрочные рынки", "Фьючерсные рынки", "Рынок", "Цена", "24 ч", "Фандинг", "Открытый интерес", "Базис", "Экспирация"],
    zh: ["永续合约市场", "期货市场", "市场", "价格", "24小时", "资金费率", "未平仓量", "基差", "到期"],
    ja: ["無期限市場", "先物市場", "マーケット", "価格", "24時間", "資金調達率", "建玉", "ベーシス", "満期"],
    ko: ["무기한 시장", "선물 시장", "시장", "가격", "24시간", "펀딩", "미결제약정", "베이시스", "만기"],
    ar: ["أسواق العقود الدائمة", "أسواق العقود الآجلة", "السوق", "السعر", "24 ساعة", "التمويل", "الفائدة المفتوحة", "الأساس", "الاستحقاق"],
    hi: ["परपेचुअल बाज़ार", "फ्यूचर्स बाज़ार", "बाज़ार", "कीमत", "24 घंटे", "फंडिंग", "ओपन इंटरेस्ट", "बेसिस", "समाप्ति"]
  };
  var extra = window.SECTORA_I18N_EXTRA || {};
  Object.keys(T).forEach(function (lang) {
    var row = extra[lang] = extra[lang] || {};
    K.forEach(function (k, i) { row["dex.sect." + k] = T[lang][i]; });
    if (T2[lang]) K2.forEach(function (k, i) { row["dex.sect." + k] = T2[lang][i]; });
    if (T3[lang]) K3.forEach(function (k, i) { row["dex.sect." + k] = T3[lang][i]; });
  });
  window.SECTORA_I18N_EXTRA = extra;
})();
