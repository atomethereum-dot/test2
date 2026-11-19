/* ==========================================================================
   Sectora Launch — cinematic boot intro (same visual language as the main
   site's intro): blue field, cell sweep with hex readouts, scan beam, the
   Sectora ring drawing itself, the bonding curve tracing inside it up to
   graduation, corner brackets snapping in, a one-frame invert, then the blue
   field dissolves into cells from the centre outwards to reveal the page.
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
  try { fast = sessionStorage.getItem("sl_intro") === "1"; sessionStorage.setItem("sl_intro", "1"); } catch (e) {}
  var F = fast ? 0.45 : 1;
  var T_SWEEP = 650 * F, T_RING = 900 * F, T_CURVE = 820 * F, T_LOCK = 440 * F, T_HOLD = 380 * F, T_EXIT = 950;
  var T0_RING = T_SWEEP * 0.55, T0_CURVE = T0_RING + T_RING * 0.8, T0_LOCK = T0_CURVE + T_CURVE, T0_HOLD = T0_LOCK + T_LOCK, T_TOTAL = T0_HOLD + T_HOLD;

  var BLUE = "#1569ff", CYAN = "52,231,255", VIOL = "168,85,247", GREEN = "62,207,142";
  var root = document.documentElement;
  root.classList.add("li-run");

  var ctx = cv.getContext("2d");
  var W = 0, H = 0, CELL = 40, R = 0, cx = 0, cy = 0, MONO = "", cells = [], diagMax = 1, curve = [];
  var pctEl = document.getElementById("liPct"), fillEl = document.getElementById("liFill"), stEl = document.getElementById("liState");
  var logs = el.querySelectorAll(".li-log span");

  function measure() {
    W = innerWidth; H = innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, W < 900 ? 1.5 : 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CELL = W < 700 ? 26 : 40;
    R = Math.min(W, H) * (W < 700 ? 0.27 : 0.22);
    cx = W / 2; cy = H / 2;
    MONO = "500 " + (W < 700 ? 8.5 : 9.5) + "px 'IBM Plex Mono', monospace";
    diagMax = Math.hypot(W, H) / 2;
    var nX = Math.ceil(W / CELL / 2) + 2, nY = Math.ceil(H / CELL / 2) + 2, span = nX * 2 + nY * 2 || 1;
    cells = [];
    for (var j = -nY; j < nY; j++) for (var i = -nX; i < nX; i++) {
      var x = cx + i * CELL, y = cy + j * CELL;
      if (x > W || y > H || x < -CELL || y < -CELL) continue;
      var dx = (i + 0.5) * CELL, dy = (j + 0.5) * CELL, d = Math.hypot(dx, dy);
      var sem = Math.abs((Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1);
      cells.push({ x: x, y: y, mx: x + CELL / 2, my: y + CELL / 2, rad: d, sem: sem,
        diag: ((i + nX) + (j + nY)) / span,
        death: (d / diagMax) * 0.62 + sem * 0.34,
        hex: sem > 0.935 ? ((sem * 65535) | 0).toString(16).toUpperCase().padStart(4, "0") : "" });
    }
    // bonding curve inside the ring: same constant-product shape as the contract
    curve = [];
    var N = 60, V0 = 30000, T0 = 1.073e9, CT = 8e8, p0 = V0 / T0, pg = V0 * T0 / Math.pow(T0 - CT, 2);
    for (var k = 0; k <= N; k++) {
      var vt = T0 - CT * k / N, pr = V0 * T0 / vt / vt, u = (pr - p0) / (pg - p0);
      curve.push([cx - R * 0.56 + R * 1.1 * k / N, cy + R * 0.36 - R * 0.86 * u]);
    }
  }

  var cl = function (t) { return t < 0 ? 0 : t > 1 ? 1 : t; };
  var sm = function (t) { t = cl(t); return t * t * (3 - 2 * t); };
  var io = function (t) { t = cl(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var out = function (t) { t = cl(t); return 1 - Math.pow(1 - t, 3); };
  var SCAN = 1650;
  function scanY(t) { return H * 1.12 - ((t % SCAN) / SCAN) * (H * 1.24); }

  function cellsLayer(t, pS, fade) {
    var sy = scanY(t), reach = CELL * 2.4;
    ctx.font = MONO; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (var k = 0; k < cells.length; k++) {
      var q = cells[k];
      var kk = (pS - q.diag * 0.82 + q.sem * 0.06) / 0.16;
      var base = kk > 0 ? Math.max(0, (1 - Math.abs(kk - 1)) * 0.2) : 0;
      var db = Math.abs(q.my - sy), light = db < reach ? (1 - db / reach) * 0.3 : 0;
      var a = (base + light) * fade;
      if (a < 0.012) continue;
      if (q.hex) { ctx.fillStyle = "rgba(" + CYAN + "," + Math.min(1, a * 3).toFixed(3) + ")"; ctx.fillText(q.hex, q.mx, q.my); }
      else { ctx.fillStyle = "rgba(255,255,255," + a.toFixed(3) + ")"; ctx.fillRect(q.x, q.y, CELL - 1, CELL - 1); }
    }
  }
  function beam(t) {
    var sy = scanY(t);
    if (sy < -60 || sy > H + 60) return;
    var halo = CELL * 2.6, g = ctx.createLinearGradient(0, sy - halo, 0, sy + halo);
    g.addColorStop(0, "rgba(" + CYAN + ",0)"); g.addColorStop(0.42, "rgba(" + CYAN + ",.18)");
    g.addColorStop(0.5, "rgba(" + CYAN + ",.42)"); g.addColorStop(0.58, "rgba(" + CYAN + ",.18)"); g.addColorStop(1, "rgba(" + CYAN + ",0)");
    ctx.fillStyle = g; ctx.fillRect(0, sy - halo, W, halo * 2);
    ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fillRect(0, sy - 0.75, W, 1.5);
  }
  function ring(enc, alpha, scale) {
    if (enc <= 0) return;
    ctx.save();
    ctx.shadowColor = "rgba(" + CYAN + ",.95)"; ctx.shadowBlur = 26;
    ctx.strokeStyle = "rgba(255,255,255," + alpha.toFixed(3) + ")";
    ctx.lineWidth = R * 0.2 * scale; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(cx, cy, R * scale, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * enc); ctx.stroke();
    ctx.restore();
  }
  function curveLayer(pC, alpha) {
    if (pC <= 0) return;
    var n = Math.max(1, Math.round(pC * (curve.length - 1)));
    ctx.save();
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    // soft area under the curve
    var g = ctx.createLinearGradient(0, cy - R * 0.5, 0, cy + R * 0.4);
    g.addColorStop(0, "rgba(" + CYAN + "," + (0.28 * alpha).toFixed(3) + ")"); g.addColorStop(1, "rgba(" + CYAN + ",0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(curve[0][0], cy + R * 0.36);
    for (var i = 0; i <= n; i++) ctx.lineTo(curve[i][0], curve[i][1]);
    ctx.lineTo(curve[n][0], cy + R * 0.36); ctx.closePath(); ctx.fill();
    ctx.shadowColor = "rgba(" + CYAN + ",1)"; ctx.shadowBlur = 16;
    ctx.strokeStyle = "rgba(255,255,255," + alpha.toFixed(3) + ")"; ctx.lineWidth = Math.max(2, R * 0.022);
    ctx.beginPath();
    for (var j = 0; j <= n; j++) { if (j) ctx.lineTo(curve[j][0], curve[j][1]); else ctx.moveTo(curve[j][0], curve[j][1]); }
    ctx.stroke();
    // runner at the head
    var hd = curve[n];
    ctx.shadowBlur = 22; ctx.fillStyle = "rgba(255,255,255," + alpha.toFixed(3) + ")";
    ctx.beginPath(); ctx.arc(hd[0], hd[1], Math.max(3, R * 0.03), 0, Math.PI * 2); ctx.fill();
    // baseline
    ctx.shadowBlur = 0; ctx.strokeStyle = "rgba(255,255,255," + (0.25 * alpha).toFixed(3) + ")"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(curve[0][0], cy + R * 0.36); ctx.lineTo(curve[curve.length - 1][0], cy + R * 0.36); ctx.stroke();
    ctx.restore();
  }
  function gradPulse(p) {
    var e = curve[curve.length - 1];
    for (var n = 0; n < 2; n++) {
      var o = cl((p - n * 0.2) / 0.7);
      if (o <= 0 || o >= 1) continue;
      ctx.save(); ctx.shadowColor = "rgba(" + GREEN + ",1)"; ctx.shadowBlur = 14;
      ctx.strokeStyle = "rgba(" + GREEN + "," + ((1 - o) * 0.9).toFixed(3) + ")"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(e[0], e[1], 4 + o * R * 0.32, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.shadowColor = "rgba(" + GREEN + ",1)"; ctx.shadowBlur = 18; ctx.fillStyle = "rgb(" + GREEN + ")";
    ctx.beginPath(); ctx.arc(e[0], e[1], Math.max(3.5, R * 0.035), 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function brackets(pK, alpha) {
    var e = out(pK), half = R * (2.4 - 1.02 * e), L = R * 0.3, o = Math.min(1, pK * 2.4) * alpha;
    ctx.save(); ctx.shadowColor = "rgba(" + CYAN + ",.9)"; ctx.shadowBlur = 12;
    ctx.strokeStyle = "rgba(255,255,255," + (o * 0.95).toFixed(3) + ")"; ctx.lineWidth = 1.4;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
      var x = cx + s[0] * half, y = cy + s[1] * half;
      ctx.beginPath(); ctx.moveTo(x, y - s[1] * L); ctx.lineTo(x, y); ctx.lineTo(x - s[0] * L, y); ctx.stroke();
    });
    ctx.restore();
  }
  function shock(pK) {
    for (var n = 0; n < 2; n++) {
      var o = cl((pK - n * 0.16) / 0.62);
      if (o <= 0 || o >= 1) continue;
      ctx.save(); ctx.shadowColor = "rgba(" + CYAN + ",.9)"; ctx.shadowBlur = 18 * (1 - o);
      ctx.strokeStyle = n === 0 ? "rgba(255,255,255," + ((1 - o) * 0.55).toFixed(3) + ")" : "rgba(" + VIOL + "," + ((1 - o) * 0.4).toFixed(3) + ")";
      ctx.lineWidth = 2 * (1 - o) + 0.4;
      ctx.beginPath(); ctx.arc(cx, cy, R * (1 + o * 1.7), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }
  function holdMarks(t, o) {
    var gir = (t / 1100) % 1, rr = R * 1.17;
    ctx.save(); ctx.shadowColor = "rgba(" + CYAN + ",1)"; ctx.shadowBlur = 14;
    ctx.strokeStyle = "rgba(" + CYAN + "," + (0.85 * o).toFixed(3) + ")"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, rr, gir * Math.PI * 2, gir * Math.PI * 2 + 0.5); ctx.stroke(); ctx.restore();
    if (W < 560) return;
    ctx.font = MONO; ctx.textBaseline = "middle";
    ctx.strokeStyle = "rgba(255,255,255," + (o * 0.4).toFixed(3) + ")"; ctx.fillStyle = "rgba(255,255,255," + (o * 0.78).toFixed(3) + ")"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx + R * 1.34, cy); ctx.lineTo(cx + R * 1.62, cy); ctx.stroke();
    ctx.textAlign = "left"; ctx.fillText("GRAD 87.9K SECT", cx + R * 1.7, cy);
    ctx.beginPath(); ctx.moveTo(cx - R * 1.34, cy); ctx.lineTo(cx - R * 1.62, cy); ctx.stroke();
    ctx.textAlign = "right"; ctx.fillText("SUPPLY 1.000B", cx - R * 1.7, cy);
  }

  var logT = [0.12, 0.34, 0.58, 0.8], shown = 0;
  function hud(t) {
    var p = Math.min(1, t / T_TOTAL);
    if (pctEl) pctEl.textContent = String(Math.round(p * 100)).padStart(2, "0");
    if (fillEl) fillEl.style.transform = "scaleX(" + p.toFixed(3) + ")";
    while (shown < logs.length && p >= logT[shown]) { logs[shown].classList.add("on"); shown++; }
    if (p >= 1 && stEl && !stEl.classList.contains("ok")) { stEl.classList.add("ok"); var b = stEl.querySelector("b"); if (b) b.textContent = "Launchpad ready"; }
  }

  function paint(t) {
    ctx.fillStyle = BLUE; ctx.fillRect(0, 0, W, H);
    var pS = cl(t / T_SWEEP), pR = cl((t - T0_RING) / T_RING), pC = cl((t - T0_CURVE) / T_CURVE), pK = cl((t - T0_LOCK) / T_LOCK), pH = cl((t - T0_HOLD) / T_HOLD);
    cellsLayer(t, pS, 1 - sm(cl((pC - 0.1) / 0.7)) * 0.75);
    ring(io(pR), 1, 1);
    curveLayer(io(pC), 1);
    if (pC >= 1) gradPulse(cl((t - T0_LOCK) / (T_LOCK + T_HOLD)));
    if (pK > 0 && pK < 1) shock(pK);
    if (pK > 0) brackets(pK, 1);
    if (pK > 0.04 && pK < 0.12) { ctx.save(); ctx.globalCompositeOperation = "difference"; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (pK >= 1) holdMarks(t, sm(pH / 0.6));
    beam(t);
    hud(t);
  }

  // exit: the blue field breaks into cells from the centre outwards
  function paintExit(t, pe) {
    ctx.clearRect(0, 0, W, H);
    var e = out(pe);
    ctx.fillStyle = BLUE;
    for (var k = 0; k < cells.length; k++) {
      var q = cells[k];
      var life = (q.death - e * 1.05) / 0.12;
      if (life <= 0) continue;
      var s = CELL * Math.min(1, life);
      ctx.globalAlpha = Math.min(1, life);
      ctx.fillRect(q.mx - s / 2, q.my - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    var fade = 1 - sm(pe / 0.55);
    if (fade > 0.01) {
      ring(1, fade, 1 + e * 0.5);
      curveLayer(1, fade);
      brackets(1, fade);
    }
    beam(t);
  }

  var t0 = 0, raf = 0, exiting = false, tEx = 0;
  function startExit(now) {
    if (exiting) return;
    exiting = true; tEx = now;
    el.classList.add("is-out");
    done();
  }
  function loop(now) {
    if (!t0) t0 = now;
    var t = now - t0;
    if (!exiting && t >= T_TOTAL) startExit(now);
    if (!exiting) paint(t);
    else {
      var pe = (now - tEx) / T_EXIT;
      if (pe >= 1) { finish(); return; }
      paintExit(t, pe);
    }
    raf = requestAnimationFrame(loop);
  }
  function finish() {
    cancelAnimationFrame(raf);
    el.remove();
    root.classList.remove("li-run");
    removeEventListener("resize", measure);
  }
  function skip() { if (!exiting) { hud(T_TOTAL); startExit(performance.now()); } }

  measure();
  addEventListener("resize", measure);
  el.addEventListener("pointerdown", skip);
  addEventListener("keydown", function k() { skip(); removeEventListener("keydown", k); });
  function go() { raf = requestAnimationFrame(loop); }
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 400); })]).then(go);
  else go();
  // safety net: never leave the page covered
  setTimeout(function () { if (document.body.contains(el)) { done(); finish(); } }, 9000);
})();
