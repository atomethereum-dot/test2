/* Sectora Airdrop · staking panel
   A window that sits beside the staking console and tells stakers that their
   deposit already counts for the airdrop, so nobody withdraws to take part.
   It only reads what the staking page already shows (#earnDep, the amount
   deposited by the connected wallet): it never talks to the wallet or to the
   contract, and it can be dropped into /staking/ with one script tag. */
(function () {
  "use strict";
  if (document.querySelector(".sad")) return;

  var AIRDROP_URL = "/airdroptesting/";
  var X_URL = "https://x.com/sectora__";
  var TG_URL = "https://t.me/sectoraorg";

  var T = {
    en: { loc: "en-US", bar: "Sectora Airdrop · Genesis", k: "For stakers",
      h: "Complete your <b>staking airdrop</b>",
      p: "Your staking already counts for the airdrop. Don't withdraw anything: keep earning and collect stars.",
      st: "Your SECT in staking", none: "Connect your wallet", chip: "Counts 2.5×",
      stars: "{n} of 6 stars", hint: "Connect your wallet in the console to check your staking.",
      t: { stake: "Stake SECT", sentinel: "500 SECT staked", guardian: "1,000 SECT staked", x: "Follow Sectora on X", tg: "Join the Telegram", reg: "Sign up for the airdrop" },
      s1: "Season 1", cta: "See the airdrop", note: "Preview · points start in Season 1", min: "Minimise", max: "Open" },
    es: { loc: "es-ES", bar: "Sectora Airdrop · Genesis", k: "Para quien hace staking",
      h: "Completa tu <b>airdrop de staking</b>",
      p: "Tu staking ya cuenta para el airdrop. No retires nada: sigue ganando y junta estrellas.",
      st: "Tus SECT en staking", none: "Conecta tu wallet", chip: "Cuenta 2,5×",
      stars: "{n} de 6 estrellas", hint: "Conecta tu wallet en la consola para ver tu staking.",
      t: { stake: "Haz staking", sentinel: "500 SECT en staking", guardian: "1.000 SECT en staking", x: "Sigue a Sectora en X", tg: "Únete al Telegram", reg: "Inscríbete en el airdrop" },
      s1: "Temporada 1", cta: "Ver el airdrop", note: "Vista previa · los puntos empiezan en la temporada 1", min: "Minimizar", max: "Abrir" },
    pt: { loc: "pt-BR", bar: "Sectora Airdrop · Genesis", k: "Para quem faz staking",
      h: "Complete seu <b>airdrop de staking</b>",
      p: "Seu staking já conta para o airdrop. Não saque nada: continue ganhando e junte estrelas.",
      st: "Seus SECT em staking", none: "Conecte sua carteira", chip: "Conta 2,5×",
      stars: "{n} de 6 estrelas", hint: "Conecte sua carteira no console para ver seu staking.",
      t: { stake: "Faça staking", sentinel: "500 SECT em staking", guardian: "1.000 SECT em staking", x: "Siga a Sectora no X", tg: "Entre no Telegram", reg: "Inscreva-se no airdrop" },
      s1: "Temporada 1", cta: "Ver o airdrop", note: "Prévia · os pontos começam na temporada 1", min: "Minimizar", max: "Abrir" }
  };
  function pick() {
    var l = "";
    try { l = localStorage.getItem("sa_lang") || ""; } catch (e) {}
    if (!T[l]) l = (navigator.language || "").slice(0, 2);
    return T[l] ? l : "en";
  }
  var L = T[pick()];

  /* six stars: three read from the staked amount, two social, one for Season 1 */
  var TASKS = [
    { id: "stake", tag: "+100", auto: function (d) { return d > 0; } },
    { id: "sentinel", tag: "Sentinel", auto: function (d) { return d >= 500; } },
    { id: "guardian", tag: "Guardian", auto: function (d) { return d >= 1000; } },
    { id: "x", tag: "+25", href: X_URL },
    { id: "tg", tag: "+25", href: TG_URL },
    { id: "reg", tag: L.s1, lock: true }
  ];

  var css = "" +
    ".sad{--b:#1569ff;--bl:#4d8dff;position:relative;isolation:isolate;margin-bottom:clamp(18px,2.4vw,28px);background:#05070c;color:#fff;" +
    "border:1px solid rgba(21,105,255,.45);border-radius:3px;overflow:hidden;font-family:'IBM Plex Sans',system-ui,sans-serif;font-weight:300;" +
    "box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 40px 90px -50px rgba(21,105,255,.85)}" +
    ".sad::before{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;" +
    "background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:27px 27px;" +
    "-webkit-mask-image:radial-gradient(90% 70% at 85% 0%,#000,transparent 80%);mask-image:radial-gradient(90% 70% at 85% 0%,#000,transparent 80%)}" +
    ".sad::after{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:var(--b)}" +
    ".sad .m{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:400}" +
    ".sad-bar{display:flex;align-items:center;gap:10px;padding:12px 14px 11px;border-bottom:1px solid rgba(255,255,255,.1);color:#c6ccd8}" +
    ".sad-bar svg{width:18px;height:18px;flex:none;border-radius:2px}" +
    ".sad-bar .sp{flex:1}" +
    ".sad-cnt{display:none;color:var(--bl)}" +
    ".sad.min .sad-cnt{display:inline}" +
    ".sad-min{display:grid;place-items:center;width:28px;height:24px;padding:0;border:1px solid rgba(255,255,255,.16);background:none;color:#c6ccd8;cursor:pointer;font:inherit;transition:border-color .3s,color .3s}" +
    ".sad-min:hover{border-color:var(--bl);color:#fff}" +
    ".sad-min i{display:block;width:10px;height:1px;background:currentColor;position:relative}" +
    ".sad.min .sad-min i::after{content:'';position:absolute;left:0;top:0;width:10px;height:1px;background:currentColor;transform:rotate(90deg)}" +
    ".sad-body{padding:20px 20px 18px}" +
    ".sad.min .sad-body{display:none}" +
    ".sad-k{color:var(--bl)}" +
    ".sad h3{margin:10px 0 0;font-size:clamp(22px,1.9vw,27px);font-weight:300;letter-spacing:-.02em;line-height:1.15;color:#fff}" +
    ".sad h3 b{font-weight:400;color:var(--bl)}" +
    ".sad-p{margin:10px 0 0;font-size:14.5px;line-height:1.6;color:#c6ccd8}" +
    ".sad-st{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-top:18px;padding:14px 0;border-top:1px solid rgba(255,255,255,.1);border-bottom:1px solid rgba(255,255,255,.1)}" +
    ".sad-st .m{display:block;color:#7c8496}" +
    ".sad-st b{display:block;margin-top:8px;font-size:26px;font-weight:200;letter-spacing:-.02em;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap}" +
    ".sad-st b.off{font-size:16px;font-weight:300;color:#7c8496;letter-spacing:0}" +
    ".sad-chip{padding:5px 9px;border:1px solid rgba(77,141,255,.45);background:rgba(77,141,255,.1);color:#8fb4ff;white-space:nowrap}" +
    ".sad-stars{display:flex;align-items:center;gap:6px;margin-top:16px}" +
    ".sad-stars svg{width:22px;height:22px;flex:none}" +
    ".sad-stars span{margin-left:auto;color:#c6ccd8}" +
    ".sad-star path{fill:none;stroke:rgba(255,255,255,.28);stroke-width:1.3;transition:fill .4s,stroke .4s}" +
    ".sad-star.on path{fill:var(--bl);stroke:var(--bl)}" +
    ".sad-star.on{filter:drop-shadow(0 0 6px rgba(77,141,255,.75))}" +
    ".sad-star.pop{animation:sadPop .6s cubic-bezier(.22,.72,.24,1)}" +
    "@keyframes sadPop{0%{transform:scale(.4)}60%{transform:scale(1.25)}100%{transform:scale(1)}}" +
    ".sad-hint{margin:12px 0 0;font-size:13px;line-height:1.5;color:#7c8496}" +
    ".sad-tasks{list-style:none;margin:10px 0 0;padding:0}" +
    ".sad-tasks li{display:grid;grid-template-columns:16px minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:14.5px;line-height:1.4;color:#c6ccd8}" +
    ".sad-tasks li svg{width:16px;height:16px}" +
    ".sad-tasks li.done{color:#fff}" +
    ".sad-tasks li .tg{color:#7c8496}" +
    ".sad-tasks li.done .tg{color:var(--bl)}" +
    ".sad-tasks li.lock{opacity:.5}" +
    ".sad-tasks a{color:inherit;text-decoration:underline;text-decoration-color:rgba(255,255,255,.28);text-underline-offset:3px;transition:text-decoration-color .3s}" +
    ".sad-tasks a:hover{text-decoration-color:var(--bl)}" +
    ".sad-cta{position:relative;overflow:hidden;display:flex;justify-content:space-between;align-items:center;margin-top:16px;height:50px;padding:0 16px;background:var(--b);color:#fff;text-decoration:none}" +
    ".sad-cta::before{content:'';position:absolute;inset:0;background:#0d4fd8;transform:translateY(101%);transition:transform .42s cubic-bezier(.22,.72,.24,1)}" +
    ".sad-cta:hover::before{transform:none}" +
    ".sad-cta span,.sad-cta i{position:relative;font-style:normal}" +
    ".sad-note{margin:12px 0 0;color:#4a5164;line-height:1.6}" +
    ".sad-min:focus-visible,.sad-cta:focus-visible,.sad-tasks a:focus-visible{outline:2px solid var(--bl);outline-offset:3px}" +
    /* beside the console: the window takes the top of the right column, the steps go below it */
    ".pp-body.sad-on{grid-template-rows:auto 1fr}" +
    ".pp-body.sad-on > .frame{grid-row:1 / span 2}" +
    ".pp-body.sad-on > .sad{grid-column:2;grid-row:1}" +
    ".pp-body.sad-on > .steps{grid-column:2;grid-row:2}" +
    "@media (max-width:980px){.pp-body.sad-on{grid-template-rows:none}.pp-body.sad-on > .frame,.pp-body.sad-on > .sad,.pp-body.sad-on > .steps{grid-column:auto;grid-row:auto}}" +
    "@media (prefers-reduced-motion:reduce){.sad *{animation:none!important;transition:none!important}}";

  function star(cls) {
    return '<svg class="sad-star ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.75 5.6 6.15.9-4.45 4.34 1.05 6.12L12 16.87l-5.5 2.89 1.05-6.12L3.1 9.3l6.15-.9z"/></svg>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

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
    var stars = ""; for (var i = 0; i < 6; i++) stars += star();
    var rows = TASKS.map(function (t) {
      var label = t.href ? '<a href="' + t.href + '" target="_blank" rel="noopener">' + esc(L.t[t.id]) + "</a>" : esc(L.t[t.id]);
      return '<li data-t="' + t.id + '"' + (t.lock ? ' class="lock"' : "") + ">" + star() + "<span>" + label + '</span><span class="tg m">' + esc(t.tag) + "</span></li>";
    }).join("");
    el.innerHTML =
      '<div class="sad-bar m">' +
        '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="9" fill="#1569ff"/><circle cx="50" cy="50" r="27.2" fill="none" stroke="#fff" stroke-width="7"/></svg>' +
        "<span>" + esc(L.bar) + '</span><span class="sp"></span><span class="sad-cnt"></span>' +
        '<button type="button" class="sad-min" aria-expanded="true" aria-label="' + esc(L.min) + '"><i></i></button>' +
      "</div>" +
      '<div class="sad-body">' +
        '<p class="sad-k m">' + esc(L.k) + "</p>" +
        "<h3>" + L.h + "</h3>" +
        '<p class="sad-p">' + esc(L.p) + "</p>" +
        '<div class="sad-st"><div><span class="m">' + esc(L.st) + '</span><b class="sad-dep off">' + esc(L.none) + '</b></div><span class="sad-chip m">' + esc(L.chip) + "</span></div>" +
        '<div class="sad-stars" role="img">' + stars + '<span class="m"></span></div>' +
        '<p class="sad-hint"></p>' +
        '<ul class="sad-tasks">' + rows + "</ul>" +
        '<a class="sad-cta m" href="' + AIRDROP_URL + '"><span>' + esc(L.cta) + "</span><i>→</i></a>" +
        '<p class="sad-note m">' + esc(L.note) + "</p>" +
      "</div>";
    body.insertBefore(el, steps);
    body.classList.add("sad-on");

    var depEl = el.querySelector(".sad-dep"), hint = el.querySelector(".sad-hint"), cnt = el.querySelector(".sad-cnt");
    var starRow = el.querySelector(".sad-stars"), starLbl = starRow.querySelector("span");
    var minBtn = el.querySelector(".sad-min");
    var social = {};
    try { social = JSON.parse(localStorage.getItem("sad_tasks") || "{}") || {}; } catch (e) {}
    try { if (localStorage.getItem("sad_min") === "1") setMin(true); } catch (e) {}

    function setMin(on) {
      el.classList.toggle("min", on);
      minBtn.setAttribute("aria-expanded", String(!on));
      minBtn.setAttribute("aria-label", on ? L.max : L.min);
      try { localStorage.setItem("sad_min", on ? "1" : "0"); } catch (e) {}
    }
    minBtn.addEventListener("click", function () { setMin(!el.classList.contains("min")); });

    el.querySelectorAll(".sad-tasks a").forEach(function (a) {
      a.addEventListener("click", function () {
        var id = a.closest("li").getAttribute("data-t");
        social[id] = 1;
        try { localStorage.setItem("sad_tasks", JSON.stringify(social)); } catch (e) {}
        paint();
      });
    });

    /* the deposited amount, as the staking page prints it for the connected wallet */
    function deposited() {
      var d = document.getElementById("earnDep");
      if (!d || !d.isConnected) return null;
      var n = parseFloat((d.textContent || "").replace(/[^0-9.]/g, ""));
      return isFinite(n) ? n : null;
    }

    function fmt(n) {
      try { return new Intl.NumberFormat(L.loc, { maximumFractionDigits: 2, useGrouping: "always" }).format(n); }
      catch (e) { return new Intl.NumberFormat(L.loc, { maximumFractionDigits: 2 }).format(n); }
    }
    var lastKey = "", seen = false, shown = [];
    function paint() {
      var dep = deposited();
      var done = TASKS.map(function (t) {
        if (t.auto) return dep !== null && t.auto(dep);
        if (t.href) return !!social[t.id];
        return false;
      });
      var n = done.filter(Boolean).length;
      var key = dep + "|" + done.join("");
      if (key === lastKey) return;
      lastKey = key;

      if (dep === null) { depEl.textContent = L.none; depEl.classList.add("off"); hint.textContent = L.hint; hint.hidden = false; }
      else { depEl.textContent = fmt(dep) + " SECT"; depEl.classList.remove("off"); hint.hidden = true; }

      el.querySelectorAll(".sad-tasks li").forEach(function (li, i) {
        li.classList.toggle("done", done[i]);
        li.querySelector(".sad-star").classList.toggle("on", done[i]);
      });
      var big = starRow.querySelectorAll(".sad-star");
      for (var i = 0; i < 6; i++) {
        var on = i < n;
        if (on && !shown[i] && seen) { big[i].classList.remove("pop"); void big[i].getBoundingClientRect(); big[i].classList.add("pop"); }
        big[i].classList.toggle("on", on);
        shown[i] = on;
      }
      var txt = L.stars.replace("{n}", n);
      starLbl.textContent = n + " / 6";
      starRow.setAttribute("aria-label", txt);
      cnt.textContent = "★ " + n + " / 6";
    }
    paint();

    /* stars light up one by one the first time the window is seen */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        io.disconnect(); seen = true;
        var big = starRow.querySelectorAll(".sad-star.on");
        big.forEach(function (s, i) { setTimeout(function () { s.classList.remove("pop"); void s.getBoundingClientRect(); s.classList.add("pop"); }, 120 * i); });
      }, { threshold: .4 });
      io.observe(el);
    } else seen = true;

    setInterval(paint, 1500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
