/* Sectora — notice on the staking page: "Meet the utility built to add value to SECT" (Sectora Labs).
 * A compact notice, not a full-screen panel: the Sectora mark, the headline, three short facts, the HOLD 2027
 * note and two clear buttons ("Discover Sectora Labs" / "Not now"). Shows once per visit, 1.5 s after the
 * page's intro ends; closes with "Not now", the ×, the backdrop or Escape. Follows the page language
 * (the "sectora:lang" event of staking-i18n.js), 12 languages. ?popup=1 always shows it (for testing). */
(function () {
  "use strict";
  var KEY = "sectora.labsPopup1";
  try { if (sessionStorage.getItem(KEY) === "1" && !/[?&]popup=1/.test(location.search)) return; } catch (e) {}
  var TX = {
    en: { eb: "SectoraEVM · Utility", t1: "Meet the utility built", t2: "to add value to SECT.", p: "Sectora Labs, one of the utilities inside SectoraEVM, is already built and ready for launch.", chip: "Built · Ready for launch",
      a_t: "Every payment buys SECT", a_p: "Reserves are paid in ETH or USDT and the contract turns each payment into a market buy of SECT.",
      b_t: "98 % locked forever", b_p: "At launch, 98 % of that SECT is locked in the coin’s pool with the LP burned.",
      c_t: "Fees burned in SECT", c_p: "Half of the 1 % fee is burned on every launch.", go: "Discover Sectora Labs", guide: "Read the guide", later: "Not now", close: "Close", h1: "SECT is designed to grow in 2027, once every event on its roadmap is complete. Holding now means being part of the start of a great stage.", h2: "Remember: Sectora is not a pump-and-dump token. It is an ecosystem built on rules: written into its contracts, with liquidity locked until 2035 and a foundation registered in the United States." },
    es: { eb: "SectoraEVM · Utilidad", t1: "Conoce la utilidad creada", t2: "para darle más valor a SECT.", p: "Sectora Labs, una de las utilidades dentro de SectoraEVM, ya está construida y lista para su lanzamiento.", chip: "Construida · Lista para lanzar",
      a_t: "Cada pago compra SECT", a_p: "Las reservas se pagan en ETH o USDT y el contrato convierte cada pago en una compra de SECT en el mercado.",
      b_t: "98 % bloqueado para siempre", b_p: "Al lanzar, el 98 % de ese SECT queda bloqueado en el pool de la moneda con el LP quemado.",
      c_t: "Comisiones quemadas en SECT", c_p: "La mitad de la comisión del 1 % se quema en cada lanzamiento.", go: "Conocer Sectora Labs", guide: "Leer la guía", later: "Ahora no", close: "Cerrar", h1: "SECT está diseñado para crecer en 2027, cuando se completen todos los eventos de su roadmap. Holdear ahora es formar parte del inicio de una gran etapa.", h2: "Recuerda: Sectora no es un token de pump and dump. Es un ecosistema construido con reglas: escritas en sus contratos, con la liquidez bloqueada hasta 2035 y una fundación registrada en Estados Unidos." },
    pt: { eb: "SectoraEVM · Utilidade", t1: "Conheça a utilidade criada", t2: "para dar mais valor ao SECT.", p: "A Sectora Labs, uma das utilidades dentro da SectoraEVM, já está construída e pronta para o lançamento.", chip: "Construída · Pronta para lançar",
      a_t: "Cada pagamento compra SECT", a_p: "As reservas são pagas em ETH ou USDT e o contrato transforma cada pagamento em uma compra de SECT no mercado.",
      b_t: "98 % travado para sempre", b_p: "No lançamento, 98 % desse SECT fica travado no pool da moeda, com o LP queimado.",
      c_t: "Taxas queimadas em SECT", c_p: "Metade da taxa de 1 % é queimada em cada lançamento.", go: "Conhecer a Sectora Labs", guide: "Ler o guia", later: "Agora não", close: "Fechar", h1: "O SECT foi pensado para crescer em 2027, quando todos os eventos do seu roadmap estiverem concluídos. Holdar agora é fazer parte do início de uma grande etapa.", h2: "Lembre-se: a Sectora não é um token de pump and dump. É um ecossistema construído com regras: escritas nos contratos, com a liquidez travada até 2035 e uma fundação registrada nos Estados Unidos." },
    fr: { eb: "SectoraEVM · Utilité", t1: "Découvrez l’utilité conçue", t2: "pour donner plus de valeur au SECT.", p: "Sectora Labs, l’une des utilités de SectoraEVM, est déjà construite et prête à être lancée.", chip: "Construite · Prête au lancement",
      a_t: "Chaque paiement achète du SECT", a_p: "Les réserves se paient en ETH ou en USDT et le contrat transforme chaque paiement en achat de SECT sur le marché.",
      b_t: "98 % bloqués pour toujours", b_p: "Au lancement, 98 % de ce SECT est bloqué dans le pool de la pièce, avec le LP brûlé.",
      c_t: "Frais brûlés en SECT", c_p: "La moitié des frais de 1 % est brûlée à chaque lancement.", go: "Découvrir Sectora Labs", guide: "Lire le guide", later: "Plus tard", close: "Fermer", h1: "Le SECT est conçu pour croître en 2027, une fois tous les événements de sa feuille de route terminés. Holder maintenant, c’est faire partie du début d’une grande étape.", h2: "Rappel : Sectora n’est pas un token de pump and dump. C’est un écosystème construit sur des règles : inscrites dans ses contrats, avec une liquidité bloquée jusqu’en 2035 et une fondation enregistrée aux États-Unis." },
    de: { eb: "SectoraEVM · Utility", t1: "Lerne die Utility kennen,", t2: "die SECT mehr Wert geben soll.", p: "Sectora Labs, eine der Utilities in SectoraEVM, ist bereits gebaut und bereit für den Start.", chip: "Gebaut · Startbereit",
      a_t: "Jede Zahlung kauft SECT", a_p: "Reserven werden in ETH oder USDT bezahlt, und der Vertrag macht aus jeder Zahlung einen Marktkauf von SECT.",
      b_t: "98 % für immer gesperrt", b_p: "Beim Start werden 98 % dieses SECT im Pool des Coins gesperrt, das LP wird verbrannt.",
      c_t: "Gebühren in SECT verbrannt", c_p: "Die Hälfte der Gebühr von 1 % wird bei jedem Launch verbrannt.", go: "Sectora Labs entdecken", guide: "Zum Leitfaden", later: "Nicht jetzt", close: "Schließen", h1: "SECT ist darauf ausgelegt, 2027 zu wachsen, sobald alle Ereignisse seiner Roadmap abgeschlossen sind. Wer jetzt hält, ist Teil des Beginns einer großen Phase.", h2: "Denk daran: Sectora ist kein Pump-and-Dump-Token. Es ist ein Ökosystem mit Regeln: in den Verträgen festgeschrieben, mit bis 2035 gesperrter Liquidität und einer in den USA registrierten Stiftung." },
    it: { eb: "SectoraEVM · Utility", t1: "Scopri l’utility creata", t2: "per dare più valore a SECT.", p: "Sectora Labs, una delle utility di SectoraEVM, è già costruita e pronta per il lancio.", chip: "Costruita · Pronta al lancio",
      a_t: "Ogni pagamento compra SECT", a_p: "Le riserve si pagano in ETH o USDT e il contratto trasforma ogni pagamento in un acquisto di SECT sul mercato.",
      b_t: "98 % bloccato per sempre", b_p: "Al lancio, il 98 % di quel SECT resta bloccato nel pool della moneta, con l’LP bruciato.",
      c_t: "Commissioni bruciate in SECT", c_p: "Metà della commissione dell’1 % viene bruciata a ogni lancio.", go: "Scopri Sectora Labs", guide: "Leggi la guida", later: "Non ora", close: "Chiudi", h1: "SECT è pensato per crescere nel 2027, quando tutti gli eventi della sua roadmap saranno completati. Fare hold ora significa far parte dell’inizio di una grande fase.", h2: "Ricorda: Sectora non è un token pump and dump. È un ecosistema costruito su regole: scritte nei suoi contratti, con la liquidità bloccata fino al 2035 e una fondazione registrata negli Stati Uniti." },
    ru: { eb: "SectoraEVM · Утилита", t1: "Знакомьтесь: утилита,", t2: "созданная, чтобы добавить ценность SECT.", p: "Sectora Labs — одна из утилит внутри SectoraEVM — уже построена и готова к запуску.", chip: "Построена · Готова к запуску",
      a_t: "Каждый платёж покупает SECT", a_p: "Резервы оплачиваются в ETH или USDT, и контракт превращает каждый платёж в рыночную покупку SECT.",
      b_t: "98 % заблокировано навсегда", b_p: "При запуске 98 % этих SECT блокируются в пуле монеты, а LP сжигается.",
      c_t: "Комиссии сжигаются в SECT", c_p: "Половина комиссии 1 % сжигается при каждом запуске.", go: "Открыть Sectora Labs", guide: "Читать руководство", later: "Не сейчас", close: "Закрыть", h1: "SECT создан для роста в 2027 году, когда все события его дорожной карты будут завершены. Холдить сейчас — значит быть частью начала большого этапа.", h2: "Помните: Sectora — не токен для pump and dump. Это экосистема, построенная по правилам: они записаны в контрактах, ликвидность заблокирована до 2035 года, а фонд зарегистрирован в США." },
    zh: { eb: "SectoraEVM · 实用功能", t1: "认识这项", t2: "为 SECT 增值而打造的功能。", p: "Sectora Labs 是 SectoraEVM 中的功能之一，已经建成，随时可以上线。", chip: "已建成 · 准备上线",
      a_t: "每笔付款都会买入 SECT", a_p: "预留以 ETH 或 USDT 支付，合约会把每笔付款转换为在市场上买入 SECT。",
      b_t: "98 % 永久锁定", b_p: "上线时，这些 SECT 中的 98 % 会锁定在代币的流动性池中，LP 被销毁。",
      c_t: "手续费以 SECT 销毁", c_p: "每次发行，1 % 手续费的一半都会被销毁。", go: "了解 Sectora Labs", guide: "阅读指南", later: "以后再说", close: "关闭", h1: "SECT 的设计目标是在 2027 年成长，届时路线图上的所有事件都将完成。现在持有，就是成为一个伟大阶段开端的一部分。", h2: "请记住：Sectora 不是拉高出货的代币。它是一个按规则构建的生态系统：规则写在合约中，流动性锁定至 2035 年，基金会在美国注册。" },
    ja: { eb: "SectoraEVM · ユーティリティ", t1: "SECT に価値を加えるために", t2: "作られたユーティリティ。", p: "SectoraEVM のユーティリティのひとつ、Sectora Labs はすでに完成し、ローンチの準備ができています。", chip: "完成 · ローンチ準備完了",
      a_t: "すべての支払いが SECT を購入", a_p: "リザーブは ETH または USDT で支払われ、コントラクトが各支払いを市場での SECT 購入に変えます。",
      b_t: "98 % を永久ロック", b_p: "ローンチ時、その SECT の 98 % はコインのプールにロックされ、LP はバーンされます。",
      c_t: "手数料は SECT でバーン", c_p: "1 % の手数料の半分がローンチごとにバーンされます。", go: "Sectora Labs を見る", guide: "ガイドを読む", later: "あとで", close: "閉じる", h1: "SECT は、ロードマップのすべてのイベントが完了する 2027 年に成長するよう設計されています。今ホールドすることは、大きなステージの始まりに加わることです。", h2: "忘れないでください：Sectora はパンプ・アンド・ダンプのトークンではありません。ルールに基づいて作られたエコシステムです。ルールはコントラクトに書かれ、流動性は 2035 年までロックされ、財団は米国で登録されています。" },
    ko: { eb: "SectoraEVM · 유틸리티", t1: "SECT에 가치를 더하도록", t2: "만든 유틸리티를 만나보세요.", p: "SectoraEVM 안의 유틸리티 중 하나인 Sectora Labs는 이미 완성되어 출시 준비를 마쳤습니다.", chip: "완성 · 출시 준비 완료",
      a_t: "모든 결제가 SECT를 매수", a_p: "리저브는 ETH 또는 USDT로 결제되며, 컨트랙트가 각 결제를 시장에서의 SECT 매수로 바꿉니다.",
      b_t: "98 % 영구 잠금", b_p: "출시 시 그 SECT의 98 %가 코인 풀에 잠기고 LP는 소각됩니다.",
      c_t: "수수료는 SECT로 소각", c_p: "1 % 수수료의 절반이 출시마다 소각됩니다.", go: "Sectora Labs 알아보기", guide: "가이드 읽기", later: "나중에", close: "닫기", h1: "SECT는 로드맵의 모든 이벤트가 완료되는 2027년에 성장하도록 설계되었습니다. 지금 홀딩하는 것은 큰 단계의 시작에 함께하는 것입니다.", h2: "기억하세요: Sectora는 펌프 앤 덤프 토큰이 아닙니다. 규칙 위에 세워진 생태계입니다. 규칙은 컨트랙트에 쓰여 있고, 유동성은 2035년까지 잠겨 있으며, 재단은 미국에 등록되어 있습니다." },
    ar: { eb: "SectoraEVM · منفعة", t1: "تعرّف على المنفعة", t2: "التي صُمّمت لتمنح SECT قيمة أكبر.", p: "Sectora Labs، إحدى المنافع داخل SectoraEVM، مبنية بالكامل وجاهزة للإطلاق.", chip: "مبنية · جاهزة للإطلاق",
      a_t: "كل دفعة تشتري SECT", a_p: "تُدفع الاحتياطيات بـ ETH أو USDT، ويحوّل العقد كل دفعة إلى شراء SECT من السوق.",
      b_t: "98 % مقفلة إلى الأبد", b_p: "عند الإطلاق، تُقفل 98 % من هذا الـ SECT في مجمّع العملة ويُحرق الـ LP.",
      c_t: "رسوم تُحرق بـ SECT", c_p: "يُحرق نصف رسوم 1 % في كل إطلاق.", go: "اكتشف Sectora Labs", guide: "اقرأ الدليل", later: "ليس الآن", close: "إغلاق", h1: "صُمّم SECT لينمو في 2027، بعد اكتمال جميع أحداث خارطة الطريق. الاحتفاظ الآن يعني أن تكون جزءًا من بداية مرحلة كبيرة.", h2: "تذكّر: Sectora ليست عملة ضخّ وتفريغ. إنها منظومة مبنية على قواعد: مكتوبة في عقودها، مع سيولة مقفلة حتى 2035 ومؤسسة مسجّلة في الولايات المتحدة." },
    hi: { eb: "SectoraEVM · यूटिलिटी", t1: "मिलिए उस यूटिलिटी से", t2: "जो SECT का मूल्य बढ़ाने के लिए बनी है।", p: "Sectora Labs, SectoraEVM के अंदर की यूटिलिटीज़ में से एक, बनकर तैयार है और लॉन्च के लिए रेडी है।", chip: "तैयार · लॉन्च के लिए रेडी",
      a_t: "हर भुगतान SECT खरीदता है", a_p: "रिज़र्व का भुगतान ETH या USDT में होता है और कॉन्ट्रैक्ट हर भुगतान को बाज़ार में SECT की खरीद में बदल देता है।",
      b_t: "98 % हमेशा के लिए लॉक", b_p: "लॉन्च पर उस SECT का 98 % कॉइन के पूल में लॉक हो जाता है और LP बर्न हो जाता है।",
      c_t: "फ़ीस SECT में बर्न", c_p: "हर लॉन्च पर 1 % फ़ीस का आधा हिस्सा बर्न होता है।", go: "Sectora Labs देखें", guide: "गाइड पढ़ें", later: "अभी नहीं", close: "बंद करें", h1: "SECT को 2027 में बढ़ने के लिए बनाया गया है, जब इसके रोडमैप के सभी इवेंट पूरे हो जाएँगे। अभी होल्ड करना एक बड़े दौर की शुरुआत का हिस्सा बनना है।", h2: "याद रखें: Sectora पंप एंड डंप टोकन नहीं है। यह नियमों पर बना इकोसिस्टम है: नियम इसके कॉन्ट्रैक्ट में लिखे हैं, लिक्विडिटी 2035 तक लॉक है और फ़ाउंडेशन अमेरिका में रजिस्टर्ड है।" }
  };
  var URL_LABS = "https://sectoralabs.com/", URL_GUIDE = "https://sectoralabs.com/intro";

  var CSS =
    ".slp-bd{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(4,7,13,.5);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);opacity:0;transition:opacity .3s ease}" +
    ".slp-bd.on{opacity:1}" +
    ".slp{position:relative;width:min(400px,100%);max-height:calc(100dvh - 32px);overflow:auto;overscroll-behavior:contain;scrollbar-width:none;background:#fff;color:#0a0f1a;border-radius:20px;padding:20px 20px 16px;box-shadow:0 24px 70px rgba(0,0,0,.35),0 0 0 1px rgba(10,15,26,.06);font-family:'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;text-align:start;transform:translateY(12px) scale(.97);transition:transform .4s cubic-bezier(.2,.9,.25,1.05)}" +
    ".slp::-webkit-scrollbar{display:none}.slp:focus{outline:none}.slp-bd.on .slp{transform:none}.slp *{box-sizing:border-box}" +
    ".slp-top{display:flex;align-items:center;gap:12px;padding-right:34px}" +
    ".slp-mark{width:40px;height:40px;border-radius:24%;background:#1569ff;display:grid;place-items:center;flex:none;box-shadow:0 6px 16px rgba(21,105,255,.3)}" +
    ".slp-mark i{display:block;width:52%;height:52%;border-radius:50%;border:3.5px solid #fff}" +
    ".slp-eb{display:block;font-family:'IBM Plex Mono',ui-monospace,monospace;font-weight:500;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#1569ff}" +
    "[lang=ar] .slp-eb,[lang=zh] .slp-eb,[lang=ja] .slp-eb,[lang=ko] .slp-eb,[lang=hi] .slp-eb{letter-spacing:.03em}" +
    ".slp-chip{display:inline-flex;align-items:center;gap:6px;margin-top:4px;font-size:11.5px;font-weight:500;color:#067647}" +
    ".slp-chip i{width:6px;height:6px;border-radius:50%;background:#12b76a;box-shadow:0 0 0 3px rgba(18,183,106,.18);display:block}" +
    ".slp-x{position:absolute;top:14px;right:14px;width:30px;height:30px;border-radius:50%;border:0;background:#f1f4f9;color:#3c4352;display:grid;place-items:center;cursor:pointer;padding:0}" +
    ".slp-x:hover{background:#e6ebf3;color:#0a0f1a}.slp-x svg{width:13px;height:13px}[dir=rtl] .slp-x{right:auto;left:14px}[dir=rtl] .slp-top{padding-right:0;padding-left:34px}" +
    ".slp h2{margin:14px 0 0;font-size:19px;line-height:1.25;font-weight:600;letter-spacing:-.015em;color:#0a0f1a;overflow-wrap:anywhere}" +
    ".slp h2 span{color:#1569ff}" +
    ".slp-p{margin:8px 0 0;font-size:13.5px;line-height:1.55;color:#3c4352}.slp-p b{font-weight:600;color:#0a0f1a}" +
    ".slp-k{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:7px}" +
    ".slp-k li{display:flex;align-items:flex-start;gap:9px;font-size:13px;line-height:1.4;font-weight:500;color:#0a0f1a}" +
    ".slp-k li svg{width:16px;height:16px;flex:none;margin-top:1px;color:#1569ff}" +
    ".slp-hold{margin-top:14px;padding:12px 13px;border-radius:14px;background:linear-gradient(140deg,#d9e7ff 0%,#c7dbff 100%);border:1px solid #a9c6ff}" +
    ".slp-hold-h{display:flex;align-items:center;justify-content:space-between;gap:10px}" +
    ".slp-hold-l{display:inline-flex;align-items:center;gap:9px}" +
    ".slp-hold-m{width:24px;height:24px;border-radius:24%;background:#1569ff;display:grid;place-items:center;flex:none}" +
    ".slp-hold-m i{display:block;width:52%;height:52%;border-radius:50%;border:2.5px solid #fff}" +
    ".slp-hold-t{font-family:'IBM Plex Mono',ui-monospace,monospace;font-weight:500;font-size:14px;letter-spacing:.28em;color:#0a0f1a}" +
    ".slp-hold-y{font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.14em;color:#1569ff;background:#fff;padding:3px 8px;border:1px solid rgba(21,105,255,.45);border-radius:99px}" +
    ".slp-hold p{margin:8px 0 0;font-size:12.5px;line-height:1.5;color:#0f1626}" +
    ".slp-hold p.n{margin-top:6px;font-size:11.5px;color:#3c4352}" +
    ".slp-cta{display:flex;gap:8px;margin-top:16px}" +
    ".slp-cta a,.slp-cta button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:0 14px;border-radius:12px;font:inherit;font-size:14px;font-weight:500;text-decoration:none;text-align:center;line-height:1.2;cursor:pointer}" +
    ".slp-go{flex:1.5 1 0;background:#1569ff;color:#fff;border:0;box-shadow:0 8px 20px rgba(21,105,255,.3)}.slp-go:hover{background:#0f57db}" +
    ".slp-go svg{width:15px;height:15px;flex:none}[dir=rtl] .slp-go svg{transform:scaleX(-1)}" +
    ".slp-later{flex:1 1 0;background:#fff;color:#0a0f1a;border:1.5px solid #cfd6e2}.slp-later:hover{border-color:#0a0f1a}" +
    ".slp-gd{display:block;margin-top:10px;text-align:center;font-size:12px;color:#5b6374;text-decoration:underline;text-underline-offset:2px}.slp-gd:hover{color:#1569ff}" +
    "@media (max-width:440px){.slp{padding:16px 16px 12px;border-radius:18px}.slp-mark{width:34px;height:34px}.slp-mark i{border-width:3px}.slp h2{margin-top:11px;font-size:17px}.slp-p{font-size:13px;line-height:1.5}.slp-k{margin-top:10px;gap:5px}.slp-k li{font-size:12.5px}.slp-hold{margin-top:11px;padding:10px 11px}.slp-hold p{margin-top:6px;font-size:12px;line-height:1.45}.slp-hold p.n{font-size:11px;line-height:1.4}.slp-cta{margin-top:12px}.slp-cta a,.slp-cta button{min-height:40px;font-size:13.5px}.slp-gd{margin-top:8px}}" +
    "@media (max-width:360px){.slp-cta{flex-direction:column}.slp-go,.slp-later{flex:none;width:100%}}" +
    "@media (prefers-reduced-motion:reduce){.slp-bd,.slp{transition:none}}";
  var ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var XICO = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.5" fill="currentColor" opacity=".14"/><path d="M4.8 8.2l2.1 2.1 4.3-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function lang() { var l = (window.SectoraStakeLang && window.SectoraStakeLang()) || document.documentElement.lang || "en"; l = String(l).slice(0, 2).toLowerCase(); return TX[l] ? l : "en"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var bd, box, lastFocus = null, closed = false;
  function text() {
    var L = lang(), T = TX[L];
    box.setAttribute("lang", L); box.setAttribute("dir", L === "ar" ? "rtl" : "ltr");
    box.innerHTML =
      '<button type="button" class="slp-x" aria-label="' + esc(T.close) + '">' + XICO + "</button>" +
      '<div class="slp-top"><span class="slp-mark"><i></i></span><div><span class="slp-eb">' + esc(T.eb) + '</span><span class="slp-chip"><i></i>' + esc(T.chip) + "</span></div></div>" +
      '<h2 id="slpT">' + esc(T.t1) + " <span>" + esc(T.t2) + "</span></h2>" +
      '<p class="slp-p">' + esc(T.p).replace("Sectora Labs", "<b>Sectora Labs</b>") + "</p>" +
      '<ul class="slp-k"><li>' + CHECK + esc(T.a_t) + "</li><li>" + CHECK + esc(T.b_t) + "</li><li>" + CHECK + esc(T.c_t) + "</li></ul>" +
      '<div class="slp-hold"><div class="slp-hold-h"><span class="slp-hold-l"><span class="slp-hold-m"><i></i></span><span class="slp-hold-t">HOLD</span></span><span class="slp-hold-y">2027</span></div><p>' + esc(T.h1) + '</p><p class="n">' + esc(T.h2) + "</p></div>" +
      '<div class="slp-cta"><a class="slp-go" href="' + URL_LABS + '" target="_blank" rel="noopener">' + esc(T.go) + ARROW + '</a><button type="button" class="slp-later">' + esc(T.later) + "</button></div>" +
      '<a class="slp-gd" href="' + URL_GUIDE + '" target="_blank" rel="noopener">' + esc(T.guide) + "</a>";
    box.querySelector(".slp-x").addEventListener("click", close);
    box.querySelector(".slp-later").addEventListener("click", close);
  }
  function keys(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    var f = box.querySelectorAll("a,button"), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function open() {
    try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
    var st = document.createElement("style"); st.id = "slpCss"; st.textContent = CSS; document.head.appendChild(st);
    bd = document.createElement("div"); bd.className = "slp-bd";
    bd.innerHTML = '<div class="slp" role="dialog" aria-modal="true" aria-labelledby="slpT" tabindex="-1"></div>';
    box = bd.firstChild;
    document.body.appendChild(bd);
    text();
    bd.addEventListener("click", function (e) { if (e.target === bd) close(); });
    document.addEventListener("keydown", keys);
    window.addEventListener("sectora:lang", text);
    lastFocus = document.activeElement;
    document.documentElement.style.overflow = "hidden";
    requestAnimationFrame(function () { bd.classList.add("on"); box.focus({ preventScroll: true }); });
  }
  function close() {
    if (closed) return; closed = true;
    document.removeEventListener("keydown", keys); window.removeEventListener("sectora:lang", text);
    bd.classList.remove("on"); document.documentElement.style.overflow = "";
    setTimeout(function () { if (bd.parentNode) bd.parentNode.removeChild(bd); var s = document.getElementById("slpCss"); if (s) s.remove(); }, 350);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  // after the page's own intro (#intro, html.intro-lock) is over, so they never overlap; starts as soon as the
  // page is parsed (not on "load": on phones a slow image, font or wallet script can hold "load" back)
  function start() {
    var waited = 0;
    (function wait() {
      var busy = document.getElementById("intro") || document.documentElement.classList.contains("intro-lock");
      if (busy && waited < 12000) { waited += 250; setTimeout(wait, 250); return; }
      setTimeout(open, 1500);
    })();
  }
  if (document.readyState !== "loading") start(); else document.addEventListener("DOMContentLoaded", start);
})();
