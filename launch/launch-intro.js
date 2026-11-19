/* ==========================================================================
   Sectora Launch — "Ignition" intro (its own sequence, not the main site's):
   3-2-1 countdown over a warp starfield → ignition: a comet traces the bonding
   curve across the screen shedding sparks → graduation burst at the top →
   the sparks converge into the Sectora ring, the wordmark lands → an iris
   opens from the ring and reveals the page.
   Tap / click / any key skips. Repeat visits in the same session run faster.
   ========================================================================== */
(function () {
  "use strict";
  var el = document.getElementById("li");
  var cv = document.getElementById("liCv");
  var done;
  window.SL_INTRO = new Promise(function (r) { done = r; });
  if (!el || !cv) { if (el) el.remove(); done(); return; }
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { el.remove(); done(); return; }

  var fast = false;
  try { fast = sessionStorage.getItem("sl_intro2") === "1"; sessionStorage.setItem("sl_intro2", "1"); } catch (e) {}
  var F = fast ? 0.5 : 1;
  // timeline (ms)
  var T_COUNT = 1150 * F, T_FLY = 1150 * F, T_BURST = 330 * F, T_FORM = 950 * F, T_HOLD = 520 * F, T_IRIS = 900;
  var A_FLY = T_COUNT, A_BURST = A_FLY + T_FLY, A_FORM = A_BURST + T_BURST, A_HOLD = A_FORM + T_FORM, A_IRIS = A_HOLD + T_HOLD;

  var CYAN = "52,231,255", BLUE = "21,105,255", GREEN = "62,207,142", AMBER = "232,180,92";
  var root = document.documentElement;
  root.classList.add("li-run");
  var ctx = cv.getContext("2d");
  var W, H, M, cx, cy, R, dpr, stars = [], sparks = [], burst = [], path = [];
  var SANS = "'IBM Plex Sans', system-ui, sans-serif", MONO = "'IBM Plex Mono', ui-monospace, monospace";

  function curveY(u) {
    var V0 = 30000, T0 = 1.073e9, CT = 8e8, p0 = V0 / T0, pg = V0 * T0 / Math.pow(T0 - CT, 2), vt = T0 - CT * u;
    return (V0 * T0 / vt / vt - p0) / (pg - p0);
  }
  function measure() {
    W = innerWidth; H = innerHeight; M = Math.min(W, H);
    dpr = Math.min(window.devicePixelRatio || 1, W < 900 ? 1.5 : 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2; cy = H / 2; R = M * (W < 700 ? 0.17 : 0.13);
    stars = [];
    var n = W < 700 ? 160 : 280;
    for (var i = 0; i < n; i++) stars.push({ a: Math.random() * 6.283, d: Math.random(), s: 0.4 + Math.random() * 1.2 });
    path = [];
    var x0 = W * 0.06, x1 = W * 0.94, y0 = H * 0.9, y1 = H * 0.1;
    for (var k = 0; k <= 160; k++) { var u = k / 160; path.push([x0 + (x1 - x0) * u, y0 - (y0 - y1) * curveY(u)]); }
  }
  var cl = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var out = function (x) { x = cl(x); return 1 - Math.pow(1 - x, 3); };
  var inn = function (x) { x = cl(x); return x * x * x; };
  var io = function (x) { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  function at(u) { var f = cl(u) * 160, i = Math.min(159, Math.floor(f)), r = f - i; return [path[i][0] + (path[i + 1][0] - path[i][0]) * r, path[i][1] + (path[i + 1][1] - path[i][1]) * r]; }
  function glowDot(x, y, r, col, a) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255," + a + ")"); g.addColorStop(0.2, "rgba(" + col + "," + (a * 0.8) + ")"); g.addColorStop(1, "rgba(" + col + ",0)");
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function hud(t, a) {
    ctx.save();
    ctx.globalAlpha = a;
    var m = Math.max(16, M * 0.035), L = 16;
    ctx.strokeStyle = "rgba(" + CYAN + ",.7)"; ctx.lineWidth = 1.2; ctx.shadowColor = "rgba(" + CYAN + ",.9)"; ctx.shadowBlur = 8;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(function (c) {
      ctx.beginPath(); ctx.moveTo(c[0], c[1] + c[3] * L); ctx.lineTo(c[0], c[1]); ctx.lineTo(c[0] + c[2] * L, c[1]); ctx.stroke();
    });
    ctx.shadowBlur = 0;
    var fs = W < 700 ? 8.5 : 10;
    ctx.font = "500 " + fs + "px " + MONO; ctx.fillStyle = "rgba(242,245,250,.62)"; ctx.textBaseline = "middle";
    var ls = function (s) { return s.split("").join(String.fromCharCode(8202)); };
    ctx.textAlign = "left"; ctx.fillText(ls("SECTORA LAUNCH"), m + 26, m + 8);
    ctx.textAlign = "right"; ctx.fillText(ls("IGNITION SEQUENCE"), W - m - 26, m + 8);
    var st = t < A_FLY ? "T-MINUS" : t < A_BURST ? "IGNITION" : t < A_HOLD ? "GRADUATION" : "LAUNCHPAD READY";
    ctx.textAlign = "left"; ctx.fillStyle = t >= A_HOLD ? "rgba(" + GREEN + ",.95)" : "rgba(" + CYAN + ",.9)"; ctx.fillText(ls(st), m + 26, H - m - 8);
    ctx.textAlign = "right"; ctx.fillStyle = "rgba(242,245,250,.55)";
    ctx.fillText(ls("SECTORAEVM · T+" + (t / 1000).toFixed(2) + "S"), W - m - 26, H - m - 8);
    ctx.restore();
  }

  function starfield(t, speed, a) {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    var maxR = Math.hypot(W, H) * 0.6;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var d = (s.d + t * 0.00012 * speed * (0.6 + s.s)) % 1;
      var r0 = d * d * maxR, r1 = Math.max(0, (d - 0.012 * speed) ) ;
      r1 = r1 * r1 * maxR;
      var x0 = cx + Math.cos(s.a) * r0, y0 = cy + Math.sin(s.a) * r0, x1 = cx + Math.cos(s.a) * r1, y1 = cy + Math.sin(s.a) * r1;
      var al = Math.min(1, d * 1.6) * 0.75 * a;
      ctx.strokeStyle = "rgba(170,205,255," + al.toFixed(3) + ")"; ctx.lineWidth = s.s * (0.6 + d);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x0, y0); ctx.stroke();
    }
    ctx.restore();
  }

  function countdown(t) {
    var n = Math.min(2, Math.floor(t / (T_COUNT / 3))), lt = (t - n * T_COUNT / 3) / (T_COUNT / 3);
    var num = 3 - n, sc = 1.18 - 0.18 * out(lt * 1.6), a = Math.min(1, lt * 5) * (1 - cl((lt - 0.78) / 0.22));
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(sc, sc);
    ctx.font = "200 " + Math.round(M * 0.3) + "px " + SANS; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(" + CYAN + ",.8)"; ctx.shadowBlur = 30;
    ctx.fillStyle = "rgba(255,255,255," + a.toFixed(3) + ")"; ctx.fillText(String(num), 0, M * 0.012);
    ctx.restore();
    // timer ring draining
    ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(" + CYAN + ",.85)"; ctx.shadowColor = "rgba(" + CYAN + ",1)"; ctx.shadowBlur = 14;
    var p = t / T_COUNT;
    ctx.beginPath(); ctx.arc(cx, cy, M * 0.24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - p)); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.shadowBlur = 0; ctx.beginPath(); ctx.arc(cx, cy, M * 0.24, 0, 6.283); ctx.stroke();
    // ticks
    for (var k = 0; k < 60; k++) {
      var ang = k / 60 * 6.283, r1 = M * 0.262, r2 = r1 + (k % 5 === 0 ? 10 : 5);
      ctx.strokeStyle = "rgba(255,255,255," + (k / 60 < 1 - p ? 0.35 : 0.08) + ")"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1); ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2); ctx.stroke();
    }
    ctx.restore();
  }

  function trail(u, fade) {
    if (u <= 0) return;
    var n = Math.max(2, Math.round(u * 160));
    ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round"; ctx.lineJoin = "round";
    var g = ctx.createLinearGradient(path[0][0], 0, path[160][0], 0);
    g.addColorStop(0, "rgba(" + BLUE + "," + (0.9 * fade) + ")"); g.addColorStop(0.7, "rgba(" + CYAN + "," + fade + ")"); g.addColorStop(1, "rgba(" + GREEN + "," + fade + ")");
    for (var pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = g; ctx.lineWidth = pass ? 2.2 : 10; ctx.globalAlpha = pass ? 1 : 0.18;
      ctx.beginPath(); ctx.moveTo(path[0][0], path[0][1]);
      for (var i = 1; i <= n; i++) ctx.lineTo(path[i][0], path[i][1]);
      ctx.stroke();
    }
    ctx.restore();
  }

  function spawnSparks(x, y, dirx, diry, k) {
    for (var i = 0; i < k; i++) {
      var sp = 0.4 + Math.random() * 2.2, ang = Math.atan2(-diry, -dirx) + (Math.random() - 0.5) * 1.6;
      sparks.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp + 0.4, life: 1, dec: 0.012 + Math.random() * 0.025, c: Math.random() < 0.18 ? AMBER : Math.random() < 0.5 ? CYAN : "255,255,255" });
    }
    if (sparks.length > 900) sparks.splice(0, sparks.length - 900);
  }
  function drawSparks(dt) {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.x += s.vx * dt * 0.06; s.y += s.vy * dt * 0.06; s.vy += 0.03 * dt * 0.06; s.vx *= 0.985; s.life -= s.dec * dt * 0.06;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.fillStyle = "rgba(" + s.c + "," + (s.life * 0.9).toFixed(3) + ")";
      ctx.fillRect(s.x, s.y, 1.8, 1.8);
    }
    ctx.restore();
  }
  function makeBurst() {
    var e = path[160], n = W < 700 ? 180 : 300;
    burst = [];
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * 6.283, sp = 2 + Math.random() * 7;
      var ta = i / n * 6.283; // target on the ring
      burst.push({ x: e[0], y: e[1], vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, tx: cx + Math.cos(ta) * R, ty: cy + Math.sin(ta) * R, ta: ta,
        c: i % 7 === 0 ? GREEN : i % 3 === 0 ? CYAN : "255,255,255", d: Math.random() * 0.25 });
    }
  }
  function drawBurst(t, dt) {
    var pb = cl((t - A_BURST) / T_BURST), pf = cl((t - A_FORM) / T_FORM);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < burst.length; i++) {
      var b = burst[i];
      if (pf <= 0) { b.x += b.vx * dt * 0.06; b.y += b.vy * dt * 0.06; b.vx *= 0.93; b.vy *= 0.93; b.sx = b.x; b.sy = b.y; }
      var k = io(cl((pf - b.d) / (1 - b.d)));
      var x = pf > 0 ? b.sx + (b.tx - b.sx) * k : b.x, y = pf > 0 ? b.sy + (b.ty - b.sy) * k : b.y;
      // slight swirl while converging
      if (pf > 0 && k < 1) { var sw = (1 - k) * 0.9; var dx = x - cx, dy = y - cy; x = cx + dx * Math.cos(sw) - dy * Math.sin(sw); y = cy + dx * Math.sin(sw) + dy * Math.cos(sw); }
      var a = pf > 0.9 ? Math.max(0, 1 - (pf - 0.9) / 0.1) : 1;
      ctx.fillStyle = "rgba(" + b.c + "," + (0.95 * a).toFixed(3) + ")";
      var s = 2.2 - k;
      ctx.fillRect(x - s / 2, y - s / 2, s + 0.6, s + 0.6);
    }
    ctx.restore();
    // shockwave at graduation point
    if (pb > 0 && pb < 1) {
      var e = path[160];
      ctx.save(); ctx.strokeStyle = "rgba(" + GREEN + "," + (1 - pb).toFixed(3) + ")"; ctx.lineWidth = 2; ctx.shadowColor = "rgba(" + GREEN + ",1)"; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(e[0], e[1], 6 + pb * M * 0.25, 0, 6.283); ctx.stroke(); ctx.restore();
      glowDot(e[0], e[1], M * 0.12 * (1 - pb) + 8, GREEN, 0.9 * (1 - pb));
    }
  }
  function ringAndTitle(t) {
    var pf = cl((t - A_FORM) / T_FORM), ph = cl((t - A_HOLD) / T_HOLD), solid = cl((pf - 0.75) / 0.25);
    if (solid <= 0) return;
    ctx.save();
    ctx.shadowColor = "rgba(" + CYAN + ",.95)"; ctx.shadowBlur = 26 + 10 * Math.sin(t / 120);
    ctx.strokeStyle = "rgba(255,255,255," + solid.toFixed(3) + ")"; ctx.lineWidth = R * 0.2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.stroke();
    ctx.restore();
    // orbiting arc
    var g = (t / 900) % 1;
    ctx.save(); ctx.strokeStyle = "rgba(" + CYAN + "," + (0.8 * solid) + ")"; ctx.lineWidth = 1.6; ctx.shadowColor = "rgba(" + CYAN + ",1)"; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.32, g * 6.283, g * 6.283 + 0.7); ctx.stroke(); ctx.restore();
    // wordmark
    var wa = cl((pf - 0.82) / 0.18) * 1;
    if (wa > 0) {
      var fs = Math.round(M * (W < 700 ? 0.085 : 0.075)), y = cy + R * 1.75 + fs * 0.4;
      var word1 = "Sectora ", word2 = "Launch";
      ctx.save(); ctx.textBaseline = "middle"; ctx.textAlign = "left";
      ctx.font = "200 " + fs + "px " + SANS; var w1 = ctx.measureText(word1).width;
      ctx.font = "500 " + fs + "px " + SANS; var w2 = ctx.measureText(word2).width;
      var x = cx - (w1 + w2) / 2, rise = (1 - out(wa)) * fs * 0.4;
      ctx.globalAlpha = wa; ctx.shadowColor = "rgba(" + BLUE + ",.6)"; ctx.shadowBlur = 24;
      ctx.font = "200 " + fs + "px " + SANS; ctx.fillStyle = "#f2f5fa"; ctx.fillText(word1, x, y + rise);
      ctx.font = "500 " + fs + "px " + SANS; ctx.fillStyle = "#4d8dff"; ctx.fillText(word2, x + w1, y + rise);
      var ta = cl(ph * 2);
      ctx.globalAlpha = ta; ctx.shadowBlur = 0;
      ctx.font = "500 " + (W < 700 ? 8.5 : 11) + "px " + MONO; ctx.textAlign = "center"; ctx.fillStyle = "rgba(" + CYAN + ",.95)";
      ctx.fillText("LAUNCH  ·  TRADE  ·  GRADUATE  ·  TOKENIZE".split("").join(String.fromCharCode(8202)), cx, y + fs * 0.95);
      ctx.restore();
    }
  }

  var t0 = 0, last = 0, raf = 0, irisAt = 0, exiting = false, burstMade = false, shake = 0;
  function frame(now) {
    if (!t0) { t0 = now; last = now; }
    var t = now - t0, dt = Math.min(48, now - last); last = now;
    if (!exiting && t >= A_IRIS) { exiting = true; irisAt = now; done(); el.classList.add("is-out"); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (exiting) { drawIris(now - irisAt, t, dt); if (now - irisAt >= T_IRIS) { finish(); return; } raf = requestAnimationFrame(frame); return; }
    // camera shake on ignition / burst
    var sx = 0, sy = 0;
    if (shake > 0) { sx = (Math.random() - 0.5) * shake; sy = (Math.random() - 0.5) * shake; shake *= 0.86; }
    ctx.setTransform(dpr, 0, 0, dpr, sx * dpr, sy * dpr);
    var bgG = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * 0.7);
    bgG.addColorStop(0, "#071027"); bgG.addColorStop(1, "#010205");
    ctx.fillStyle = bgG; ctx.fillRect(-20, -20, W + 40, H + 40);
    var warp = t < A_FLY ? 1 + 5 * inn(t / T_COUNT) : Math.max(0.6, 6 - (t - A_FLY) / 160);
    starfield(t, warp, t < A_HOLD ? 1 : 1 - cl((t - A_HOLD) / T_HOLD) * 0.6);
    if (t < A_FLY) countdown(t);
    else {
      var u = inn((t - A_FLY) / T_FLY) * 0.75 + ((t - A_FLY) / T_FLY) * 0.25;
      u = cl(u);
      var fade = t < A_FORM ? 1 : 1 - cl((t - A_FORM) / (T_FORM * 0.7));
      trail(u, fade);
      if (t < A_BURST) {
        var h = at(u), h2 = at(Math.max(0, u - 0.01));
        spawnSparks(h[0], h[1], h[0] - h2[0], h[1] - h2[1], W < 700 ? 4 : 7);
        glowDot(h[0], h[1], M * 0.07, CYAN, 1);
        glowDot(h[0], h[1], M * 0.02, "255,255,255", 1);
        if (t - A_FLY < 90) { glowDot(path[0][0], path[0][1], M * 0.35 * (1 - (t - A_FLY) / 90), BLUE, 0.9); shake = Math.max(shake, 10); }
      } else if (!burstMade) { burstMade = true; makeBurst(); shake = 14; }
      drawSparks(dt);
      if (burstMade) drawBurst(t, dt);
      ringAndTitle(t);
      // flash on burst
      var pb = (t - A_BURST) / 120;
      if (pb > 0 && pb < 1) { ctx.fillStyle = "rgba(220,240,255," + (0.35 * (1 - pb)).toFixed(3) + ")"; ctx.fillRect(-20, -20, W + 40, H + 40); }
    }
    hud(t, 1);
    raf = requestAnimationFrame(frame);
  }
  function drawIris(e, t, dt) {
    var p = io(e / T_IRIS), maxR = Math.hypot(W, H) * 0.62, r = R * 0.9 + (maxR - R * 0.9) * p;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    var bgG = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * 0.7);
    bgG.addColorStop(0, "#071027"); bgG.addColorStop(1, "#010205");
    ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H);
    starfield(t, 0.6 + 6 * p, 1 - p);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.fill();
    ctx.restore();
    // glowing iris edge
    ctx.save();
    ctx.shadowColor = "rgba(" + CYAN + ",1)"; ctx.shadowBlur = 30;
    ctx.strokeStyle = "rgba(255,255,255," + (0.95 * (1 - p)).toFixed(3) + ")"; ctx.lineWidth = Math.max(2, R * 0.2 * (1 - p));
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.stroke();
    ctx.strokeStyle = "rgba(" + CYAN + "," + (0.6 * (1 - p)).toFixed(3) + ")"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.06, 0, 6.283); ctx.stroke();
    ctx.restore();
    hud(t, 1 - p);
  }
  function finish() {
    cancelAnimationFrame(raf);
    el.remove();
    root.classList.remove("li-run");
    removeEventListener("resize", measure);
  }
  function skip() {
    if (exiting) return;
    t0 = performance.now() - A_IRIS;
    if (!burstMade) { burstMade = true; makeBurst(); }
  }

  measure();
  addEventListener("resize", measure);
  el.addEventListener("pointerdown", skip);
  addEventListener("keydown", function k() { skip(); removeEventListener("keydown", k); });
  function go() { raf = requestAnimationFrame(frame); }
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 450); })]).then(go);
  else go();
  setTimeout(function () { if (document.body.contains(el)) { done(); finish(); } }, 10000);
})();
