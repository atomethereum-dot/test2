(() => {
  const canvas = document.getElementById("globeCanvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = reducedMotionQuery.matches;
  reducedMotionQuery.addEventListener("change", (e) => {
    reducedMotion = e.matches;
    scheduleFrame();
  });

  const ACCENT = "77, 166, 255"; // rgb triplet for the network dots/arcs

  // ---- sphere point field (fibonacci distribution) ----
  const NUM_POINTS = 240;
  const points = [];
  {
    const offset = 2 / NUM_POINTS;
    const increment = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < NUM_POINTS; i++) {
      const y = i * offset - 1 + offset / 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = i * increment;
      points.push({
        x: Math.cos(phi) * r,
        y: y,
        z: Math.sin(phi) * r,
        hub: false,
      });
    }
  }

  // pick a spread of "hub" nodes and connect them to sketch a network
  const hubIndices = [];
  for (let i = 0; i < 10; i++) {
    hubIndices.push(Math.floor((i / 10) * NUM_POINTS + (i * 37) % 17));
  }
  hubIndices.forEach((i) => {
    if (points[i]) points[i].hub = true;
  });

  const connections = [];
  for (let i = 0; i < hubIndices.length; i++) {
    const a = hubIndices[i];
    const b = hubIndices[(i + 1) % hubIndices.length];
    connections.push([a, b]);
  }
  // a couple of long cross-globe links for visual interest
  connections.push([hubIndices[0], hubIndices[4]]);
  connections.push([hubIndices[2], hubIndices[7]]);

  function slerp(p0, p1, t) {
    let dot = p0.x * p1.x + p0.y * p1.y + p0.z * p1.z;
    dot = Math.min(1, Math.max(-1, dot));
    const theta = Math.acos(dot) * t;
    const relX = p1.x - p0.x * dot;
    const relY = p1.y - p0.y * dot;
    const relZ = p1.z - p0.z * dot;
    const len = Math.sqrt(relX * relX + relY * relY + relZ * relZ) || 1;
    const rx = relX / len, ry = relY / len, rz = relZ / len;
    const cosT = Math.cos(theta), sinT = Math.sin(theta);
    return {
      x: p0.x * cosT + rx * sinT,
      y: p0.y * cosT + ry * sinT,
      z: p0.z * cosT + rz * sinT,
    };
  }

  const arcs = connections.map(([ai, bi]) => {
    const p0 = points[ai], p1 = points[bi];
    const segs = 40;
    const path = [];
    for (let s = 0; s <= segs; s++) path.push(slerp(p0, p1, s / segs));
    return path;
  });

  // ---- state ----
  let cssWidth = 0, cssHeight = 0, dpr = 1;
  let R = 100, cx = 0, cy = 0;
  const CAMERA_MULT = 2.5;

  let rotY = 0.4;
  let rotX = -0.15;
  const autoSpeed = 0.09; // radians / second

  let isDragging = false;
  let lastPointerX = 0, lastPointerY = 0;
  let lastFrameTime = 0;
  let rafId = null;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    cssWidth = rect.width;
    cssHeight = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    canvas.height = Math.max(1, Math.round(cssHeight * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const wide = window.innerWidth >= 1024;
    R = Math.min(cssWidth, cssHeight) * (wide ? 0.36 : 0.42);
    cx = wide ? cssWidth * 0.66 : cssWidth * 0.5;
    cy = cssHeight * (wide ? 0.48 : 0.4);
    scheduleFrame();
  }

  function project(p) {
    const x = p.x * R, y = p.y * R, z = p.z * R;
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    const D = R * CAMERA_MULT;
    const persp = D / (D + z2);
    return {
      x: cx + x1 * persp,
      y: cy + y1 * persp,
      z: z2,
      persp,
    };
  }

  function render() {
    if (cssWidth === 0) return;
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const nearest = R * CAMERA_MULT / (R * CAMERA_MULT - R);
    const sphereRadius = R * nearest;

    const grad = ctx.createRadialGradient(
      cx - sphereRadius * 0.3, cy - sphereRadius * 0.3, sphereRadius * 0.05,
      cx, cy, sphereRadius
    );
    grad.addColorStop(0, "rgba(18, 34, 64, 0.85)");
    grad.addColorStop(0.7, "rgba(8, 16, 32, 0.55)");
    grad.addColorStop(1, "rgba(6, 10, 20, 0)");
    ctx.beginPath();
    ctx.arc(cx, cy, sphereRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, sphereRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(120, 170, 255, 0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // arcs (network connections) — drawn first, under the dots
    ctx.lineWidth = 1;
    arcs.forEach((path) => {
      let drawing = false;
      for (let i = 0; i < path.length; i++) {
        const proj = project(path[i]);
        if (proj.z > R * 0.02) {
          drawing = false;
          continue;
        }
        const alpha = Math.max(0.08, Math.min(0.55, 1 - Math.abs(proj.z) / R));
        if (!drawing) {
          ctx.beginPath();
          ctx.moveTo(proj.x, proj.y);
          drawing = true;
        } else {
          ctx.strokeStyle = `rgba(${ACCENT}, ${alpha})`;
          ctx.lineTo(proj.x, proj.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(proj.x, proj.y);
        }
      }
    });

    // dots, sorted back-to-front for a correct painter's-algorithm overlap
    const projected = points.map((p) => ({ p, proj: project(p) }));
    projected.sort((a, b) => b.proj.z - a.proj.z);

    projected.forEach(({ p, proj }) => {
      if (proj.z > R * 0.04) return; // behind the globe
      const alpha = Math.max(0.15, Math.min(1, 1 - proj.z / (R * 0.9)));
      const baseR = p.hub ? 2.6 : 1.5;
      const radius = baseR * proj.persp;

      if (p.hub) {
        ctx.shadowColor = `rgba(${ACCENT}, 0.9)`;
        ctx.shadowBlur = 8;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, Math.max(0.6, radius), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT}, ${alpha})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function scheduleFrame() {
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function tick(now) {
    rafId = null;
    const dt = lastFrameTime ? (now - lastFrameTime) / 1000 : 0;
    lastFrameTime = now;

    let keepGoing = false;
    if (isDragging) {
      keepGoing = true;
    } else if (!reducedMotion) {
      rotY += autoSpeed * dt;
      keepGoing = true;
    }

    render();
    if (keepGoing) scheduleFrame();
  }

  function onPointerDown(e) {
    isDragging = true;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
    lastFrameTime = 0;
    scheduleFrame();
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - lastPointerX;
    const dy = e.clientY - lastPointerY;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
    rotY += dx * 0.006;
    rotX = Math.max(-1.1, Math.min(1.1, rotX + dy * 0.006));
    scheduleFrame();
  }

  function onPointerUp(e) {
    isDragging = false;
    canvas.classList.remove("dragging");
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    lastFrameTime = 0;
    if (!reducedMotion) scheduleFrame();
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  resize();
  lastFrameTime = 0;
  scheduleFrame();
})();
