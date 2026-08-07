(() => {
  const canvas = document.getElementById("globeCanvas");
  if (!canvas || typeof GLOBE_RINGS === "undefined") return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const TILT = (-16 * Math.PI) / 180;
  const cosT = Math.cos(TILT);
  const sinT = Math.sin(TILT);
  let rotation = 0.6;
  const ROT_SPEED = 0.0014;

  const PINS = [
    { lon: -74.0, lat: 40.7 },
    { lon: -0.13, lat: 51.5 },
    { lon: 103.8, lat: 1.35 },
    { lon: 55.3, lat: 25.2 },
    { lon: 139.7, lat: 35.7 },
    { lon: -46.6, lat: -23.5 },
  ];

  let dpr = 1;
  let w = 0;
  let h = 0;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = size;
    h = size;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function project(lonDeg, latDeg, rot, R, cx, cy) {
    const lon = (lonDeg * Math.PI) / 180 + rot;
    const lat = (latDeg * Math.PI) / 180;
    const x = Math.cos(lat) * Math.sin(lon);
    const y0 = Math.sin(lat);
    const z0 = Math.cos(lat) * Math.cos(lon);
    const y = y0 * cosT - z0 * sinT;
    const z = y0 * sinT + z0 * cosT;
    return { x: cx + x * R, y: cy - y * R, visible: z > 0.02, z };
  }

  function strokePath(points, R, cx, cy, step) {
    ctx.beginPath();
    let started = false;
    for (const p of points) {
      const proj = project(p[0], p[1], rotation, R, cx, cy);
      if (proj.visible) {
        if (!started) {
          ctx.moveTo(proj.x, proj.y);
          started = true;
        } else {
          ctx.lineTo(proj.x, proj.y);
        }
      } else {
        started = false;
      }
    }
    ctx.stroke();
  }

  function draw() {
    const cx = w / 2;
    const cy = h / 2;
    const R = (Math.min(w, h) / 2) * 0.94;

    ctx.clearRect(0, 0, w, h);

    const sphere = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.42, R * 0.08, cx, cy, R);
    sphere.addColorStop(0, "#0e2038");
    sphere.addColorStop(0.55, "#060d1b");
    sphere.addColorStop(1, "#020407");
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = sphere;
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(77,166,255,0.14)";
    for (let lon = -180; lon < 180; lon += 30) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 4) pts.push([lon, lat]);
      strokePath(pts, R, cx, cy);
    }
    for (let lat = -80; lat <= 80; lat += 20) {
      const pts = [];
      for (let lon = -180; lon <= 180; lon += 4) pts.push([lon, lat]);
      strokePath(pts, R, cx, cy);
    }

    ctx.strokeStyle = "rgba(198,222,255,0.55)";
    ctx.lineWidth = 1;
    for (const ring of GLOBE_RINGS) {
      strokePath(ring, R, cx, cy);
    }

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(120,180,255,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (const pin of PINS) {
      const p = project(pin.lon, pin.lat, rotation, R, cx, cy);
      if (!p.visible) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#19f352";
      ctx.shadowColor = "#19f352";
      ctx.shadowBlur = 9;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (!reduced) {
      rotation += ROT_SPEED;
      requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
})();
