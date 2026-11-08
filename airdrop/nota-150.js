/* Nota del Airdrop Genesis: el premio se completa en 150 dias y, desde el dia 30, lo ganado es tuyo
   aunque salgas (cada 30 dias se asegura un tramo mas). Solo muestra texto: no lee la blockchain,
   no hace llamadas de red y no toca la wallet.
   Uso: <div data-nota150></div> en /airdrop y /airdrop-guide (con selector de nivel),
        y SANota150.html(lang, {lv, staked, prize}) en /myairdrop (con el nivel real de la wallet). */
(function () {
  "use strict";
  var LV = [{ n: "Scout", min: 100, r: 0.55 }, { n: "Sentinel", min: 500, r: 0.65 }, { n: "Guardian", min: 1000, r: 0.75 }, { n: "Titan", min: 4000, r: 0.9 }];
  var DUR = 150, STEPS = [30, 60, 90, 120, 150], DEF = 2;
  var LOC = { en: "en-US", es: "es-ES", pt: "pt-BR", fr: "fr-FR", de: "de-DE", ru: "ru-RU", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", ar: "en-US", hi: "en-IN" };
  var TX = {
    en: { k: "Important", h: "Your prize is secured in stages",
      p1: "Your prize grows every day for <b>150 days</b>. From <b>day 30</b>, what you’ve earned is secured and it’s yours, even if you leave.",
      ex: "Every 30 days, another part is secured. Example: {lv} with {s} SECT in staking ({p} SECT prize):",
      me: "Every 30 days, another part is secured. Your level: {lv} with {s} SECT in staking ({p} SECT prize):",
      d: "Day {d}", sec: "<b>{n} SECT</b> secured", full: "<b>{n} SECT</b> · full prize",
      p3: "It also keeps adding up every day in between. Your prize is paid in SECT: if the price of SECT goes up, the value of your prize goes up with it.",
      p4: "If you leave and come back, your count continues where it was. You don’t need to do anything: it counts on its own, and My Airdrop shows which day you’re on.",
      pk: "Choose your level" },
    es: { k: "Importante", h: "Tu premio se asegura por etapas",
      p1: "Tu premio crece cada día durante <b>150 días</b>. Desde el <b>día 30</b>, lo que llevas ganado queda asegurado y es tuyo, aunque salgas.",
      ex: "Cada 30 días se asegura un tramo más. Ejemplo: {lv} con {s} SECT en staking (premio de {p} SECT):",
      me: "Cada 30 días se asegura un tramo más. Tu nivel: {lv} con {s} SECT en staking (premio de {p} SECT):",
      d: "Día {d}", sec: "<b>{n} SECT</b> asegurados", full: "<b>{n} SECT</b> · premio completo",
      p3: "Entre un tramo y otro también sigue sumando cada día. Tu premio se paga en SECT: si el precio de SECT sube, el valor de tu premio sube con él.",
      p4: "Si sales y vuelves, tu conteo sigue donde iba. No tienes que hacer nada: cuenta solo, y en Mi Airdrop ves en qué día vas.",
      pk: "Elige tu nivel" },
    pt: { k: "Importante", h: "Seu prêmio fica garantido por etapas",
      p1: "Seu prêmio cresce todos os dias durante <b>150 dias</b>. A partir do <b>dia 30</b>, o que você ganhou fica garantido e é seu, mesmo que você saia.",
      ex: "A cada 30 dias, mais uma parte fica garantida. Exemplo: {lv} com {s} SECT em staking (prêmio de {p} SECT):",
      me: "A cada 30 dias, mais uma parte fica garantida. Seu nível: {lv} com {s} SECT em staking (prêmio de {p} SECT):",
      d: "Dia {d}", sec: "<b>{n} SECT</b> garantidos", full: "<b>{n} SECT</b> · prêmio completo",
      p3: "Entre uma etapa e outra, ele também continua somando todos os dias. Seu prêmio é pago em SECT: se o preço do SECT subir, o valor do seu prêmio sobe junto.",
      p4: "Se você sair e voltar, sua contagem continua de onde parou. Você não precisa fazer nada: ela conta sozinha, e no Meu Airdrop você vê em que dia está.",
      pk: "Escolha seu nível" },
    fr: { k: "Important", h: "Votre récompense est sécurisée par étapes",
      p1: "Votre récompense grandit chaque jour pendant <b>150 jours</b>. À partir du <b>jour 30</b>, ce que vous avez gagné est sécurisé et vous appartient, même si vous partez.",
      ex: "Tous les 30 jours, une nouvelle part est sécurisée. Exemple : {lv} avec {s} SECT en staking (récompense de {p} SECT) :",
      me: "Tous les 30 jours, une nouvelle part est sécurisée. Votre niveau : {lv} avec {s} SECT en staking (récompense de {p} SECT) :",
      d: "Jour {d}", sec: "<b>{n} SECT</b> sécurisés", full: "<b>{n} SECT</b> · récompense complète",
      p3: "Entre deux étapes, elle continue aussi d’augmenter chaque jour. Votre récompense est versée en SECT : si le prix du SECT monte, la valeur de votre récompense monte avec lui.",
      p4: "Si vous partez puis revenez, votre compteur reprend là où il en était. Vous n’avez rien à faire : il compte tout seul, et Mon Airdrop indique à quel jour vous en êtes.",
      pk: "Choisissez votre niveau" },
    de: { k: "Wichtig", h: "Deine Belohnung wird in Etappen gesichert",
      p1: "Deine Belohnung wächst <b>150 Tage</b> lang jeden Tag. Ab <b>Tag 30</b> ist das, was du verdient hast, gesichert und gehört dir, auch wenn du gehst.",
      ex: "Alle 30 Tage wird ein weiterer Teil gesichert. Beispiel: {lv} mit {s} SECT im Staking ({p} SECT Belohnung):",
      me: "Alle 30 Tage wird ein weiterer Teil gesichert. Dein Level: {lv} mit {s} SECT im Staking ({p} SECT Belohnung):",
      d: "Tag {d}", sec: "<b>{n} SECT</b> gesichert", full: "<b>{n} SECT</b> · volle Belohnung",
      p3: "Dazwischen wächst sie ebenfalls jeden Tag weiter. Deine Belohnung wird in SECT ausgezahlt: Wenn der Preis von SECT steigt, steigt der Wert deiner Belohnung mit.",
      p4: "Wenn du gehst und zurückkommst, läuft dein Zähler dort weiter, wo er stand. Du musst nichts tun: Er zählt von selbst, und in Mein Airdrop siehst du, an welchem Tag du bist.",
      pk: "Wähle dein Level" },
    ru: { k: "Важно", h: "Ваш приз закрепляется поэтапно",
      p1: "Ваш приз растёт каждый день в течение <b>150 дней</b>. Начиная с <b>30-го дня</b> заработанное закрепляется за вами и остаётся вашим, даже если вы уйдёте.",
      ex: "Каждые 30 дней закрепляется ещё одна часть. Пример: {lv} с {s} SECT в стейкинге (приз {p} SECT):",
      me: "Каждые 30 дней закрепляется ещё одна часть. Ваш уровень: {lv} с {s} SECT в стейкинге (приз {p} SECT):",
      d: "День {d}", sec: "<b>{n} SECT</b> закреплено", full: "<b>{n} SECT</b> · полный приз",
      p3: "Между этапами он тоже продолжает расти каждый день. Приз выплачивается в SECT: если цена SECT вырастет, вместе с ней вырастет и стоимость вашего приза.",
      p4: "Если вы уйдёте и вернётесь, счётчик продолжится с того места, где остановился. Ничего делать не нужно: он считает сам, а в разделе «Мой аирдроп» видно, какой у вас день.",
      pk: "Выберите уровень" },
    zh: { k: "重要", h: "你的奖励分阶段归你所有",
      p1: "你的奖励在 <b>150 天</b>内每天增长。从<b>第 30 天</b>起，你已赚到的部分就归你所有，即使你离开也是如此。",
      ex: "每 30 天，又有一部分归你所有。示例：{lv}，质押 {s} SECT（奖励 {p} SECT）：",
      me: "每 30 天，又有一部分归你所有。你的等级：{lv}，质押 {s} SECT（奖励 {p} SECT）：",
      d: "第 {d} 天", sec: "<b>{n} SECT</b> 已归你所有", full: "<b>{n} SECT</b> · 全额奖励",
      p3: "两个阶段之间也会每天继续累计。你的奖励以 SECT 发放：如果 SECT 价格上涨，你的奖励价值也会随之上涨。",
      p4: "如果你离开后再回来，计数会从中断处继续。你无需做任何事：它会自动计数，你可以在“我的空投”中查看自己处于第几天。",
      pk: "选择你的等级" },
    ja: { k: "重要", h: "報酬は段階的に確定します",
      p1: "報酬は <b>150 日間</b>、毎日増えます。<b>30 日目</b>以降は、それまでに得た分が確定し、離脱してもあなたのものです。",
      ex: "30 日ごとに、さらに一部が確定します。例：{lv}、{s} SECT をステーキング（報酬 {p} SECT）：",
      me: "30 日ごとに、さらに一部が確定します。あなたのレベル：{lv}、{s} SECT をステーキング（報酬 {p} SECT）：",
      d: "{d} 日目", sec: "<b>{n} SECT</b> 確定", full: "<b>{n} SECT</b> · 報酬全額",
      p3: "段階と段階の間も毎日増え続けます。報酬は SECT で支払われます。SECT の価格が上がれば、報酬の価値も一緒に上がります。",
      p4: "離脱して戻っても、カウントは止まったところから続きます。何もする必要はありません。自動でカウントされ、マイエアドロップで今が何日目か確認できます。",
      pk: "レベルを選択" },
    ko: { k: "중요", h: "보상은 단계별로 확정됩니다",
      p1: "보상은 <b>150일</b> 동안 매일 늘어납니다. <b>30일째</b>부터는 그때까지 얻은 보상이 확정되어, 나가더라도 당신의 것입니다.",
      ex: "30일마다 일부가 추가로 확정됩니다. 예: {lv}, 스테이킹 {s} SECT (보상 {p} SECT):",
      me: "30일마다 일부가 추가로 확정됩니다. 내 레벨: {lv}, 스테이킹 {s} SECT (보상 {p} SECT):",
      d: "{d}일째", sec: "<b>{n} SECT</b> 확정", full: "<b>{n} SECT</b> · 전체 보상",
      p3: "단계 사이에도 매일 계속 늘어납니다. 보상은 SECT로 지급됩니다. SECT 가격이 오르면 보상의 가치도 함께 오릅니다.",
      p4: "나갔다가 돌아와도 카운트는 멈춘 곳에서 이어집니다. 아무것도 할 필요가 없습니다. 자동으로 계산되며, 내 에어드랍에서 지금 며칠째인지 확인할 수 있습니다.",
      pk: "레벨 선택" },
    ar: { k: "مهم", h: "جائزتك تُضمن على مراحل",
      p1: "تنمو جائزتك كل يوم لمدة <b>150 يومًا</b>. ابتداءً من <b>اليوم 30</b>، يصبح ما ربحته مضمونًا وملكًا لك، حتى لو غادرت.",
      ex: "كل 30 يومًا يُضمن جزء آخر. مثال: {lv} مع ‏{s} SECT في التخزين (جائزة ‏{p} SECT):",
      me: "كل 30 يومًا يُضمن جزء آخر. مستواك: {lv} مع ‏{s} SECT في التخزين (جائزة ‏{p} SECT):",
      d: "اليوم {d}", sec: "<b>‏{n} SECT</b> مضمونة", full: "<b>‏{n} SECT</b> · الجائزة كاملة",
      p3: "وبين مرحلة وأخرى تستمر في الزيادة كل يوم. تُدفع جائزتك بعملة SECT: إذا ارتفع سعر SECT، ترتفع قيمة جائزتك معه.",
      p4: "إذا غادرت ثم عدت، يستمر عدّادك من حيث توقف. لا تحتاج إلى فعل أي شيء: فهو يحتسب تلقائيًا، ويمكنك أن ترى في «إيردروب الخاص بي» في أي يوم أنت.",
      pk: "اختر مستواك" },
    hi: { k: "महत्वपूर्ण", h: "आपका इनाम चरणों में सुरक्षित होता है",
      p1: "आपका इनाम <b>150 दिनों</b> तक हर दिन बढ़ता है। <b>दिन 30</b> से, आपने जो कमाया है वह सुरक्षित हो जाता है और आपका है, भले ही आप बाहर निकल जाएँ।",
      ex: "हर 30 दिन में एक और हिस्सा सुरक्षित होता है। उदाहरण: {lv}, स्टेकिंग में {s} SECT ({p} SECT इनाम):",
      me: "हर 30 दिन में एक और हिस्सा सुरक्षित होता है। आपका स्तर: {lv}, स्टेकिंग में {s} SECT ({p} SECT इनाम):",
      d: "दिन {d}", sec: "<b>{n} SECT</b> सुरक्षित", full: "<b>{n} SECT</b> · पूरा इनाम",
      p3: "बीच के दिनों में भी यह हर दिन बढ़ता रहता है। आपका इनाम SECT में दिया जाता है: अगर SECT की कीमत बढ़ती है, तो आपके इनाम का मूल्य भी उसके साथ बढ़ता है।",
      p4: "अगर आप बाहर निकलकर वापस आते हैं, तो आपकी गिनती वहीं से जारी रहती है जहाँ रुकी थी। आपको कुछ नहीं करना है: यह अपने आप गिनती है, और मेरा एयरड्रॉप में आप देख सकते हैं कि आप किस दिन पर हैं।",
      pk: "अपना स्तर चुनें" }
  };
  var CSS = [
    ".n150{margin:32px 0 6px;max-width:920px;padding:24px 28px 22px;border:1px solid var(--n150-bd);border-inline-start:3px solid #1569ff;border-radius:12px;background:var(--n150-bg);text-align:start;font-family:'IBM Plex Sans','IBM Plex Sans Cyr',system-ui,sans-serif;line-height:1.55;letter-spacing:0}",
    ".n150.dk{--n150-bg:rgba(21,105,255,.08);--n150-bd:rgba(77,141,255,.4);--n150-h:#fff;--n150-p:#c6ccd8;--n150-f:#8b93a5;--n150-k:#4d8dff;--n150-tb:rgba(255,255,255,.04);--n150-tl:rgba(255,255,255,.12)}",
    ".n150.lt{--n150-bg:#eef4ff;--n150-bd:rgba(13,79,216,.3);--n150-h:#0b0e14;--n150-p:#3a4150;--n150-f:#5b6474;--n150-k:#0d4fd8;--n150-tb:#fff;--n150-tl:rgba(13,79,216,.18)}",
    ".n150 .n150-k{display:flex;align-items:center;gap:10px;margin:0 0 10px;font:500 11px/1 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.2em;text-transform:uppercase;color:var(--n150-k)}",
    ".n150 .n150-k i{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:#1569ff;color:#fff;font-style:normal;font-size:11px;letter-spacing:0}",
    ".n150 .n150-h{margin:0 0 8px;font-size:22px;font-weight:600;letter-spacing:-.01em;line-height:1.25;color:var(--n150-h)}",
    ".n150 .n150-p{margin:0 0 12px;font-size:15.5px;font-weight:300;color:var(--n150-p)}",
    ".n150 .n150-p b{font-weight:600;color:var(--n150-h)}",
    ".n150 .n150-s{font-size:14.5px}",
    ".n150 .n150-lv{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px;padding:0;border:0}",
    ".n150 .n150-lv button{margin:0;padding:7px 12px;border:1px solid var(--n150-tl);border-radius:999px;background:var(--n150-tb);color:var(--n150-p);font:500 11px/1 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}",
    ".n150 .n150-lv button[aria-pressed=true]{background:#1569ff;border-color:#1569ff;color:#fff}",
    ".n150 .n150-t{list-style:none;margin:0 0 14px;padding:0;display:grid;gap:6px}",
    ".n150 .n150-t li{display:grid;grid-template-columns:92px minmax(0,1fr) 110px;align-items:center;gap:14px;margin:0;padding:10px 14px;border-radius:8px;background:var(--n150-tb);border:1px solid var(--n150-tl)}",
    ".n150 .n150-t li::before{content:none}",
    ".n150 .n150-d{font:500 11px/1.2 'IBM Plex Mono',ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--n150-f)}",
    ".n150 .n150-v{font-size:15.5px;color:var(--n150-p)}",
    ".n150 .n150-v b{font-weight:600;color:var(--n150-h)}",
    ".n150 .n150-b{height:3px;border-radius:2px;background:var(--n150-tl);overflow:hidden}",
    ".n150 .n150-b i{display:block;height:100%;background:#1569ff}",
    ".n150 .n150-t li.n150-full{background:#1569ff;border-color:#1569ff}",
    ".n150 .n150-t li.n150-full .n150-d{color:rgba(255,255,255,.85)}",
    ".n150 .n150-t li.n150-full .n150-v,.n150 .n150-t li.n150-full .n150-v b{color:#fff}",
    ".n150 .n150-t li.n150-full .n150-b{background:rgba(255,255,255,.35)}.n150 .n150-t li.n150-full .n150-b i{background:#fff}",
    ".n150{container-type:inline-size}",
    "@container (max-width:560px){.n150 .n150-t li{grid-template-columns:78px minmax(0,1fr);gap:10px}.n150 .n150-b{display:none}}",
    "@media (max-width:560px){.n150{padding:20px 18px 18px}.n150 .n150-h{font-size:19px}.n150 .n150-t li{grid-template-columns:78px minmax(0,1fr);gap:10px}.n150 .n150-b{display:none}}"
  ].join("\n");

  function code(l) { l = String(l || "en").toLowerCase().slice(0, 2); return TX[l] ? l : "en"; }
  function fill(s, v) { for (var x in v) s = s.split("{" + x + "}").join(v[x]); return s; }
  function num(l, n) { n = Math.round(n * 100) / 100; return new Intl.NumberFormat(LOC[l], { maximumFractionDigits: n % 1 ? 2 : 0, useGrouping: "always" }).format(n); }
  function css() { if (document.getElementById("n150-css")) return; var s = document.createElement("style"); s.id = "n150-css"; s.textContent = CSS; document.head.appendChild(s); }
  // tema segun el fondo real de la pagina (oscuro en /airdrop y /myairdrop, claro en la guia)
  function tema(el) {
    var n = el || document.body;
    while (n && n.nodeType === 1) {
      var cs = getComputedStyle(n), c = cs.backgroundColor, m = c && c.match(/[\d.]+/g);
      if (!(m && (m.length < 4 || +m[3] > 0.5))) {   // fondo hecho con degradado (las secciones claras de /airdrop)
        var bi = cs.backgroundImage || "", g = bi.match(/rgba?\(([^)]+)\)/), s = bi.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/);
        m = g ? g[1].match(/[\d.]+/g) : s ? [s[1] * 255, s[2] * 255, s[3] * 255] : null;
      }
      if (m && (m.length < 4 || +m[3] > 0.5)) return (+m[0] * 0.299 + +m[1] * 0.587 + +m[2] * 0.114) < 128 ? "dk" : "lt";
      n = n.parentElement;
    }
    return "dk";
  }
  // me: {lv, staked, prize} con el nivel real de la wallet; si no, ejemplo con selector (pick = nivel elegido)
  function html(l, me, pick, th) {
    l = code(l); css();
    var T = TX[l], lv, staked, prize, intro;
    if (me && me.lv >= 0 && LV[me.lv]) { lv = LV[me.lv]; staked = me.staked; prize = me.prize; intro = T.me; }
    else { lv = LV[pick == null ? DEF : pick]; staked = lv.min; prize = lv.min * lv.r; intro = T.ex; }
    var rows = STEPS.map(function (d, i) {
      var full = d === DUR, v = full ? prize : Math.round(prize * d / DUR * 100) / 100;
      return '<li class="' + (full ? "n150-full" : "") + '"><span class="n150-d">' + fill(T.d, { d: d }) + '</span><span class="n150-v">' + fill(full ? T.full : T.sec, { n: num(l, v) }) +
        '</span><span class="n150-b" aria-hidden="true"><i style="width:' + ((i + 1) * 20) + '%"></i></span></li>';
    }).join("");
    var picker = me && me.lv >= 0 ? "" : '<div class="n150-lv" role="group" aria-label="' + T.pk + '">' + LV.map(function (x, i) {
      return '<button type="button" data-n150-lv="' + i + '" aria-pressed="' + (x === lv) + '">' + x.n + "</button>"; }).join("") + "</div>";
    return '<aside class="n150 ' + (th || tema()) + '" role="note" data-n150-l="' + l + '"' + (me && me.lv >= 0 ? "" : ' data-n150-pick="' + LV.indexOf(lv) + '"') + ">" +
      '<p class="n150-k"><i>!</i>' + T.k + "</p>" +
      '<h3 class="n150-h">' + T.h + "</h3>" +
      '<p class="n150-p">' + T.p1 + "</p>" +
      picker +
      '<p class="n150-p n150-s">' + fill(intro, { lv: lv.n, s: num(l, staked), p: num(l, prize) }) + "</p>" +
      '<ol class="n150-t">' + rows + "</ol>" +
      '<p class="n150-p n150-s">' + T.p3 + "</p>" +
      '<p class="n150-p n150-s" style="margin-bottom:0">' + T.p4 + "</p></aside>";
  }
  function mount(el, l, pick) { el.innerHTML = html(l || document.documentElement.lang, null, pick, tema(el)); }
  function mountAll() {
    var l = code(document.documentElement.lang), els = document.querySelectorAll("[data-nota150]");
    for (var i = 0; i < els.length; i++) { if (els[i].__n150l === l) continue; els[i].__n150l = l; mount(els[i], l, els[i].__n150); }
  }

  // selector de nivel (sirve tambien para la nota que /myairdrop arma como texto)
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-n150-lv]") : null; if (!b) return;
    var box = b.closest(".n150"); if (!box) return;
    var i = +b.getAttribute("data-n150-lv"), host = box.parentElement;
    if (host && host.hasAttribute && host.hasAttribute("data-nota150")) host.__n150 = i;
    var tmp = document.createElement("div"); tmp.innerHTML = html(box.getAttribute("data-n150-l"), null, i, box.classList.contains("lt") ? "lt" : "dk");
    box.parentNode.replaceChild(tmp.firstChild, box);
  });

  window.SANota150 = { html: html, mount: mount };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll); else mountAll();
  // /airdrop cambia de idioma sin recargar: se vuelve a pintar al cambiar <html lang>
  try { new MutationObserver(mountAll).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
})();
