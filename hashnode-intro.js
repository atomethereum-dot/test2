/* Intro del Hash Node (opcion 02 · Ignicion).
   Sobre fondo negro primero se encienden los nodos, despues aparece la Tierra
   y la camara entrega el globo en el sitio exacto del globo real de la portada;
   el titular entra en el mismo lugar que el h1 y la capa se funde con la pagina.
   Sin WebGL o con movimiento reducido no se reproduce. Un clic, una tecla o la
   rueda la saltan. */
(function () {
  "use strict";
  const capa = document.getElementById("hni");
  const acabar = rapido => { if (window.SECTORA_BOOT) window.SECTORA_BOOT(rapido); };
  if (!capa) return;
  const T = window.THREE;
  if (!T || !window.SECTORA_GLOBE_TOPOLOGY || matchMedia("(prefers-reduced-motion: reduce)").matches || scrollY > 40) { acabar(true); return; }

  const D = Math.PI / 180;
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => cl((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const o3 = x => 1 - Math.pow(1 - x, 3), o5 = x => 1 - Math.pow(1 - x, 5);
  const io3 = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const io5 = x => x < .5 ? 16 * Math.pow(x, 5) : 1 - Math.pow(-2 * x + 2, 5) / 2;
  function rng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hex(n, seed) { let s = "", a = seed | 0; for (let i = 0; i < n; i++) { a = (a * 1103515245 + 12345) & 0x7fffffff; s += "0123456789abcdef"[a % 16]; } return s; }
  const $ = s => capa.querySelector(s);

  /* en vertical el globo arranca centrado y mas lejos */
  const VERT = innerWidth < innerHeight;
  const PEQ = Math.min(innerWidth, innerHeight) < 620;

  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: $(".hni-gl"), antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { acabar(true); return; }
  const dpr = PEQ ? Math.min(devicePixelRatio || 1, 2) : Math.min(2, Math.max(1.5, devicePixelRatio || 1));
  renderer.setPixelRatio(dpr); renderer.setClearColor(0x000000, 0);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, 0.05, 200);
  function ajusta() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  ajusta(); addEventListener("resize", ajusta);

  /* ---------- mascara de tierra (world-atlas 110m local) ---------- */
  function mascara(W) {
    const H = W / 2, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"); g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    const X = lon => (lon + 180) / 360 * W, Y = lat => (90 - lat) / 180 * H;
    const topo = window.SECTORA_GLOBE_TOPOLOGY;
    const [sx, sy] = topo.transform.scale, [tx, ty] = topo.transform.translate;
    const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(d => { x += d[0]; y += d[1]; return [x * sx + tx, y * sy + ty]; }); });
    const ring = idx => { const o = []; for (const i of idx) { const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; for (let k = o.length ? 1 : 0; k < a.length; k++) o.push(a[k]); } return o; };
    const unwrap = r => { const o = [[r[0][0], r[0][1]]]; for (let i = 1; i < r.length; i++) { let lon = r[i][0]; const p = o[i - 1][0]; while (lon - p > 180) lon -= 360; while (p - lon > 180) lon += 360; o.push([lon, r[i][1]]); } return o; };
    const geom = topo.objects.land, src = geom.type === "GeometryCollection" ? geom.geometries : [geom];
    g.fillStyle = "#fff";
    for (const gg of src) {
      const polys = gg.type === "MultiPolygon" ? gg.arcs : [gg.arcs];
      for (const p of polys) {
        const rings = p.map(ring).map(unwrap);
        let lo = Infinity, hi = -Infinity; for (const r of rings) for (const q of r) { lo = Math.min(lo, q[0]); hi = Math.max(hi, q[0]); }
        const offs = [0]; if (hi > 180) offs.push(-360); if (lo < -180) offs.push(360);
        for (const off of offs) { g.beginPath(); for (const r of rings) { r.forEach((q, i) => { const x = X(q[0] + off), y = Y(q[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); } g.fill("evenodd"); }
      }
    }
    const tex = new T.CanvasTexture(c); tex.wrapS = T.RepeatWrapping; tex.minFilter = T.LinearMipmapLinearFilter; tex.magFilter = T.LinearFilter;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  /* ---------- globo: mismos materiales que el de la portada ---------- */
  const globe = new T.Group(); scene.add(globe);
  const surfMat = new T.ShaderMaterial({
    transparent: true,
    uniforms: { uMask: { value: mascara(PEQ ? 1024 : 2048) }, uLand: { value: 1 }, uDiss: { value: 1 }, uTint: { value: 0 }, uL: { value: new T.Vector3(-0.35, 0.75, 0.55).normalize() } },
    vertexShader: `
      varying vec2 vUv; varying vec3 vN; varying vec3 vNv;
      void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vNv = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D uMask; uniform float uLand, uDiss, uTint; uniform vec3 uL;
      varying vec2 vUv; varying vec3 vN; varying vec3 vNv;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        float land = texture2D(uMask, vUv).r * uLand;
        vec3 base = mix(vec3(0.020, 0.027, 0.050), vec3(0.125, 0.145, 0.190), land);
        float lam = clamp(dot(vN, uL) * 0.5 + 0.5, 0.0, 1.0);
        base *= 0.32 + 0.95 * pow(lam, 1.35);
        float edge = 1.0 - abs(vNv.z);
        base += vec3(1.0) * pow(edge, 13.5) * 0.80 * (0.5 + 0.5 * lam);
        base += vec3(1.0) * pow(edge, 4.5) * 0.075;
        base = mix(base, base * vec3(0.55, 0.8, 1.6) + vec3(0.0, 0.02, 0.08) * land, uTint);
        /* la superficie aparece por celdas de ruido */
        float vis = step(h21(floor(vUv * vec2(96.0, 48.0))), uDiss);
        if (vis < 0.5) discard;
        gl_FragColor = vec4(base, 1.0);
      }`
  });
  globe.add(new T.Mesh(new T.SphereGeometry(1, PEQ ? 128 : 192, PEQ ? 90 : 132), surfMat));

  const axisMat = new T.LineBasicMaterial({ color: 0x6f8ec9, transparent: true, opacity: 0, depthWrite: false });
  globe.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0, -1.42, 0), new T.Vector3(0, 1.42, 0)]), axisMat));
  const poleMat = new T.MeshBasicMaterial({ color: 0x8fa9dc, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false });
  [-1.42, 1.42].forEach(y => { const m = new T.Mesh(new T.RingGeometry(0.028, 0.048, 32), poleMat); m.position.y = y; m.rotation.x = Math.PI / 2; globe.add(m); });

  const orbit = new T.Group(); orbit.rotation.z = 0.32; orbit.rotation.x = 0.14; scene.add(orbit);
  const RL = 2.15, opts = [];
  for (let i = 0; i <= 220; i++) { const a = i / 220 * Math.PI * 2; opts.push(new T.Vector3(Math.cos(a) * RL, 0, Math.sin(a) * RL)); }
  const orbitMat = new T.LineBasicMaterial({ color: 0x7d9ad4, transparent: true, opacity: 0, depthWrite: false });
  orbit.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(opts), orbitMat));
  const moonMat = new T.ShaderMaterial({ transparent: true, uniforms: { uA: { value: 0 } },
    vertexShader: `varying vec3 vP; varying vec3 vN; varying vec3 vNv; void main(){ vP=position; vN=normalize(mat3(modelMatrix)*normal); vNv=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `uniform float uA; varying vec3 vP; varying vec3 vN; varying vec3 vNv;
      float hs(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453123);}
      float rnd(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hs(i),hs(i+vec3(1,0,0)),f.x),mix(hs(i+vec3(0,1,0)),hs(i+vec3(1,1,0)),f.x),f.y),mix(mix(hs(i+vec3(0,0,1)),hs(i+vec3(1,0,1)),f.x),mix(hs(i+vec3(0,1,1)),hs(i+vec3(1,1,1)),f.x),f.y),f.z);}
      float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*rnd(p);p*=2.03;a*=.5;}return s;}
      void main(){ vec3 q=normalize(vP)*2.3+7.3; float c=fbm(q*2.6); float cr=smoothstep(.52,.6,c)-smoothstep(.6,.68,c);
        vec3 col=mix(vec3(.17,.17,.19),vec3(.34,.34,.36),smoothstep(.38,.68,c)); col=mix(col,vec3(.48,.48,.5),cr*.8);
        float lam=clamp(dot(vN,normalize(vec3(-.35,.75,.55)))*.5+.5,0.,1.); col*=.13+1.2*pow(lam,1.4);
        float e=1.-abs(vNv.z); col+=vec3(.66,.74,.92)*pow(e,8.)*.42*lam; gl_FragColor=vec4(col,uA);} ` });
  const moon = new T.Mesh(new T.SphereGeometry(0.20, 48, 32), moonMat); orbit.add(moon);

  /* estrellas sobre el negro */
  const R = rng(2027), NS = PEQ ? 1400 : 2600, spos = new Float32Array(NS * 3), ssz = new Float32Array(NS), sfa = new Float32Array(NS);
  for (let i = 0; i < NS; i++) { const r = 13 + R() * 17, th = R() * 6.2832, ph = Math.acos(2 * R() - 1); spos[i * 3] = r * Math.sin(ph) * Math.cos(th); spos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); spos[i * 3 + 2] = r * Math.cos(ph); ssz[i] = 0.9 + Math.pow(R(), 2.6) * 4.2; sfa[i] = R() * 6.283; }
  const sg = new T.BufferGeometry(); sg.setAttribute("position", new T.BufferAttribute(spos, 3)); sg.setAttribute("aSize", new T.BufferAttribute(ssz, 1)); sg.setAttribute("aFase", new T.BufferAttribute(sfa, 1));
  const starMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uDpr: { value: dpr }, uT: { value: 0 }, uA: { value: 0 } },
    vertexShader: `attribute float aSize; attribute float aFase; uniform float uDpr, uT; varying float vA; varying float vG;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); float pp = 0.72 + 0.28 * sin(uT * 1.15 + aFase); vA = (0.46 + 0.54 * (aSize/5.1)) * pp; vG = aSize/5.1; gl_PointSize = max(1.0, aSize * uDpr); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uA; varying float vA; varying float vG; void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard; float nu = smoothstep(0.42, 0.02, d); float ha = smoothstep(0.5, 0.12, d) * 0.35 * vG; gl_FragColor = vec4(vec3(0.86,0.91,1.0), (nu + ha) * vA * uA); }` });
  const stars = new T.Points(sg, starMat); scene.add(stars);

  const haloMat = new T.ShaderMaterial({ transparent: true, side: T.BackSide, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uA: { value: 0 } },
    vertexShader: `varying vec3 vNv; varying vec3 vN; void main(){ vNv=normalize(normalMatrix*normal); vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `uniform float uA; varying vec3 vNv; varying vec3 vN; void main(){ float f=pow(1.0-abs(vNv.z),2.6); float lam=clamp(dot(vN,normalize(vec3(-.35,.75,.55)))*.5+.5,0.,1.); gl_FragColor=vec4(vec3(.16,.38,.95), f*.30*(.25+.75*lam)*uA);} ` });
  globe.add(new T.Mesh(new T.SphereGeometry(1.42, 48, 36), haloMat));
  const atmoMat = new T.ShaderMaterial({ transparent: true, side: T.BackSide, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uA: { value: 0 } },
    vertexShader: haloMat.vertexShader,
    fragmentShader: `uniform float uA; varying vec3 vNv; varying vec3 vN; void main(){ float f=pow(1.0-abs(vNv.z),6.5); float lam=clamp(dot(vN,normalize(vec3(-.35,.75,.55)))*.5+.5,0.,1.); gl_FragColor=vec4(vec3(1.0), f*.17*(.35+.65*lam)*uA);} ` });
  globe.add(new T.Mesh(new T.SphereGeometry(1.075, 64, 48), atmoMat));

  /* nodos: los mismos grupos que el panel */
  const toXYZ = (lon, lat, r) => { const t = (90 - lat) * D, p = (lon + 180) * D; return new T.Vector3(-r * Math.cos(p) * Math.sin(t), r * Math.cos(t), r * Math.sin(p) * Math.sin(t)); };
  const NR = rng(131), gauss = () => (NR() + NR() + NR() - 1.5) / 1.5;
  const CL = [[-0.1,51.5,26,2.6],[2.3,48.9,20,2.4],[8.4,50.1,34,3.4],[4.9,52.4,16,1.8],[6.1,46.5,10,1.6],[12.5,41.9,18,3.2],[-3.7,40.4,14,3.0],[-8.6,40.2,6,1.6],[18.6,50.1,24,3.4],[24.1,56.2,16,3.4],[30.5,50.4,18,3.6],[37.6,55.7,20,3.4],[12.6,56.2,14,3.2],[17.6,63.5,8,4.0],[25.5,62.3,9,3.4],[10.7,59.9,8,2.4],[5.4,60.4,6,2.2],[28.9,41.0,14,2.6],[23.6,45.5,11,2.6],[20.5,44.2,12,2.8],[21.0,52.2,14,2.4],[14.4,50.1,12,2.0],[16.4,48.2,10,2.0],[-6.3,53.3,7,1.8],[-22.0,64.1,4,1.2],[-3.2,55.9,8,2.2],[-1.9,52.5,10,2.0],[45.0,42.5,7,3.4],[51.4,35.7,8,2.8],[55.3,25.2,12,2.6],[47.0,29.5,6,2.6],[35.2,31.9,6,1.8],[31.2,30.0,9,2.4],[3.4,6.5,9,2.6],[-1.0,7.0,5,3.0],[28.0,-26.2,7,2.6],[36.8,-1.3,6,2.8],[77.6,12.9,58,3.6],[80.3,13.1,20,1.8],[78.5,17.4,22,2.4],[72.9,19.1,28,2.2],[77.2,28.6,32,2.6],[88.4,22.6,14,2.2],[90.4,23.8,15,2.0],[75.8,26.9,12,2.6],[67.0,24.9,11,2.4],[74.3,31.5,10,2.2],[79.9,7.0,5,1.4],[85.1,25.6,10,2.4],[73.9,18.5,12,1.8],[100.5,13.7,9,2.6],[106.8,-6.2,13,2.8],[103.8,1.4,7,1.4],[121.5,31.2,15,3.4],[116.4,39.9,13,3.2],[113.3,23.1,11,2.4],[139.7,35.7,11,2.6],[127.0,37.5,8,1.8],[121.0,14.6,7,2.0],[105.8,21.0,6,2.0],[-74.0,40.7,22,3.0],[-87.6,41.9,12,3.2],[-122.4,37.8,16,2.4],[-118.2,34.1,12,2.6],[-80.2,26.0,9,2.6],[-95.4,29.8,8,2.6],[-84.4,33.7,8,2.4],[-79.4,43.7,9,2.6],[-123.1,49.3,6,2.0],[-99.1,19.4,9,2.6],[-46.6,-23.5,11,3.2],[-43.2,-22.9,7,2.0],[-58.4,-34.6,7,2.8],[-70.7,-33.4,5,2.0],[-74.1,4.7,5,2.2],[151.2,-33.9,9,2.6],[144.9,-37.8,6,2.2],[174.8,-36.9,4,1.8],[60.6,56.8,9,4.4],[82.9,55.0,7,4.6],[104.3,52.3,4,4.0],[49.1,55.8,7,3.2],[30.3,59.9,10,2.4],[13.4,52.5,18,2.0],[9.2,45.5,10,1.8]];
  const nodes = [];
  for (const [lon, lat, n, s] of CL) for (let i = 0; i < n; i++) nodes.push({ lon: lon + gauss() * s * 1.6, lat: lat + gauss() * s, size: 2.4 + Math.pow(NR(), 3) * 2.6 });
  for (let i = 0; i < 70; i++) nodes.push({ lon: -180 + NR() * 360, lat: -55 + NR() * 120, size: 2.4 + NR() * 0.6 });
  for (let i = 0; i < 6; i++) nodes[(NR() * nodes.length) | 0].size = 6.2;
  const NN = nodes.length, np = new Float32Array(NN * 3), nsz = new Float32Array(NN), nord = new Float32Array(NN);
  nodes.forEach((n, i) => { const v = toXYZ(n.lon, n.lat, 1.004); n.v = v; np.set([v.x, v.y, v.z], i * 3); nsz[i] = n.size; nord[i] = NR(); });
  const ng = new T.BufferGeometry(); ng.setAttribute("position", new T.BufferAttribute(np, 3)); ng.setAttribute("aSize", new T.BufferAttribute(nsz, 1)); ng.setAttribute("aOrd", new T.BufferAttribute(nord, 1));
  const nodeMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    uniforms: { uDpr: { value: dpr }, uRev: { value: 0 }, uBoost: { value: 0 } },
    vertexShader: `attribute float aSize; attribute float aOrd; uniform float uDpr, uRev, uBoost; varying float vOn;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0);
        float k = clamp((uRev - aOrd) * 12.0, 0.0, 1.0); vOn = k; float pop = 1.0 + 2.2 * k * (1.0 - k) * 4.0 * 0.25;
        gl_PointSize = max(1.0, aSize * uDpr * (2.9 / -mv.z) * pop * (1.0 + uBoost)); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying float vOn; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; float core = smoothstep(0.40, 0.12, d); float halo = smoothstep(0.50, 0.10, d) * 0.18;
        vec3 c = mix(vec3(0.082,0.412,1.0), vec3(0.30,0.55,1.0), core * 0.65); gl_FragColor = vec4(c, min(1.0, core * 0.88 + halo) * vOn); }` });
  globe.add(new T.Points(ng, nodeMat));

  /* pulsos y arcos con hora fija dentro de la intro */
  const ringTex = (() => { const s = 128, c = document.createElement("canvas"); c.width = c.height = s; const g = c.getContext("2d"); const grd = g.createRadialGradient(s / 2, s / 2, s * .32, s / 2, s / 2, s * .5); grd.addColorStop(0, "rgba(90,130,255,0)"); grd.addColorStop(.55, "rgba(120,160,255,0.55)"); grd.addColorStop(1, "rgba(90,130,255,0)"); g.fillStyle = grd; g.beginPath(); g.arc(s / 2, s / 2, s / 2, 0, 6.284); g.fill(); return new T.CanvasTexture(c); })();
  const pulses = [], arcs = [];
  function addPulse(t0, i, dur) { const sp = new T.Sprite(new T.SpriteMaterial({ map: ringTex, transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: 0 })); sp.position.copy(nodes[i].v).multiplyScalar(1.002); sp.visible = false; globe.add(sp); pulses.push({ sp, t0, dur }); }
  function addArc(t0, i, j) { const a = nodes[i].v, b = nodes[j].v; const mid = a.clone().add(b).multiplyScalar(.5).normalize().multiplyScalar(1 + a.distanceTo(b) * .26);
    const pts = new T.QuadraticBezierCurve3(a.clone().multiplyScalar(1.004), mid, b.clone().multiplyScalar(1.004)).getPoints(96);
    const geo = new T.BufferGeometry().setFromPoints(pts); geo.setDrawRange(0, 2);
    const line = new T.Line(geo, new T.LineBasicMaterial({ color: 0x8fb4ff, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending }));
    line.visible = false; globe.add(line); arcs.push({ line, t0, n: pts.length }); }
  const r7 = rng(7);
  for (let i = 0; i < 40; i++) addPulse(.4 + i * .07, (r7() * NN) | 0, 1.4);
  for (let i = 0; i < 16; i++) { const a = (r7() * NN) | 0, b = (r7() * NN) | 0; addArc(.9 + i * .16, a, b); }

  /* ---------- textos: los mismos de la portada, ya traducidos ---------- */
  const txt = (sel, f) => { const e = document.querySelector(sel); return (e && e.textContent.trim()) || f; };
  const nodosTxt = txt('[data-i18n="hashdash.hero.strip.validatorsSub"]', "Security nodes");
  $(".hni-tr").textContent = txt('[data-i18n="hashdash.hero.eyebrow"]', "Validation & hash power");
  $(".hni-bl").textContent = txt('[data-i18n="hashdash.top.testnet"]', "Testnet");
  $(".hni-br").textContent = nodosTxt;
  $(".hni-lbl").textContent = nodosTxt + " · Online";
  const CIUDADES = ["FRANKFURT", "LONDON", "BENGALURU", "NEW YORK", "SAO PAULO", "TOKYO", "SINGAPORE", "PARIS", "MADRID", "SEOUL", "SYDNEY", "CHICAGO"];
  const log = $(".hni-log");
  log.innerHTML = CIUDADES.map((c, i) => `<div>NODE 0x${hex(4, i * 7 + 3)}…${hex(4, i * 5 + 1)} · ${c} <b>· ONLINE</b></div>`).join("");
  const filas = [...log.children], big = $(".hni-big"), ovc = $(".hni-ov");

  /* la marca queda en el sitio de la de la cabecera: se funde con ella */
  const marca = document.querySelector(".top .sb-brand");
  if (marca) {
    const r = marca.getBoundingClientRect(), m = document.createElement("div");
    m.className = "sb-brand hni-brand"; m.innerHTML = marca.innerHTML;
    m.style.left = r.left + "px"; m.style.top = r.top + "px"; capa.appendChild(m);
  }

  /* el titular se copia del h1 real (idioma, tamano y cortes de linea) cuando entra */
  let lineas = null;
  function titular() {
    const h = document.querySelector(".band h1"); lineas = [];
    if (!h) return;
    const r = h.getBoundingClientRect(), cs = getComputedStyle(h), c = document.createElement("div");
    c.className = "hni-hero"; c.setAttribute("aria-hidden", "true"); c.innerHTML = h.innerHTML;
    Object.assign(c.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", fontFamily: cs.fontFamily, fontSize: cs.fontSize,
      fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, color: cs.color, textAlign: cs.textAlign });
    const rb = h.querySelector("b");
    if (rb) { const bs = getComputedStyle(rb); c.querySelectorAll("b").forEach(b => { b.style.fontWeight = bs.fontWeight; b.style.letterSpacing = bs.letterSpacing; b.style.color = bs.color; }); }
    capa.appendChild(c);
    lineas = [...c.querySelectorAll(".ln>span")];
    if (!lineas.length) { c.innerHTML = '<span class="ln"><span>' + c.innerHTML + "</span></span>"; lineas = [c.querySelector(".ln>span")]; }
  }

  /* estado del globo real (lo publica la portada); sin el, su posicion inicial */
  const HOME = { dist: 1.85, rx: 0.50, ry: -Math.PI / 2 - 22 * D, px: 0.95, py: -0.42, luna: 1.1 };
  function destino() {
    const g = window.__bandGlobe && window.__bandGlobe();
    return g ? { dist: g.dist, rx: g.rx, ry: g.ry, px: 0.95, py: g.y, luna: g.luna } : HOME;
  }

  const FIN = 5.05, FUNDE = 0.75;
  window.__hniOn = true;
  window.__hniHold = true;                 /* el globo real no se dibuja mientras esta tapado */
  let t0 = 0, raf = 0, saltoEn = -1, cerrada = false;

  function cuadro(t) {
    const H = destino();
    const A = VERT ? { dist: 6.4, px: 0, py: -.62, rx: .32, ry: H.ry + .9 } : { dist: 3.3, px: .42, py: -.04, rx: .32, ry: H.ry + .9 };
    const m = io5(seg(t, 3.1, FIN)), s = o3(seg(t, 2.2, 3.4));
    const ry = lerp(A.ry, H.ry, m) - .25 * (1 - seg(t, 0, 5));
    globe.position.set(lerp(A.px, H.px, m), lerp(A.py, H.py, m), 0);
    globe.rotation.set(lerp(A.rx, H.rx, m), ry, 0);
    orbit.position.copy(globe.position);
    camera.position.set(0, 0, lerp(A.dist, H.dist, m)); camera.lookAt(0, 0, 0);
    moon.position.set(Math.cos(H.luna) * RL, 0, Math.sin(H.luna) * RL); moon.rotation.y = -H.luna;

    surfMat.uniforms.uDiss.value = s; surfMat.uniforms.uLand.value = o3(seg(t, 2.6, 3.6)); surfMat.uniforms.uTint.value = .8 * (1 - seg(t, 2.6, 4));
    nodeMat.uniforms.uRev.value = o3(seg(t, .2, 2.4)) * 1.1; nodeMat.uniforms.uBoost.value = .7 * (1 - seg(t, 1.6, 3.4));
    haloMat.uniforms.uA.value = seg(t, 2.4, 3.6); atmoMat.uniforms.uA.value = seg(t, 2.2, 3.4);
    axisMat.opacity = .30 * seg(t, 3.2, 4.2); poleMat.opacity = .42 * seg(t, 3.2, 4.2);
    orbitMat.opacity = .22 * seg(t, 3.4, 4.4); moonMat.uniforms.uA.value = seg(t, 3.6, 4.6);
    starMat.uniforms.uT.value = t; starMat.uniforms.uA.value = .35 + .65 * seg(t, 1, 4); stars.rotation.y = t * .012;
    for (const p of pulses) { const k = (t - p.t0) / p.dur; p.sp.visible = k >= 0 && k < 1; if (p.sp.visible) { p.sp.scale.setScalar(.015 + k * .26); p.sp.material.opacity = .8 * (1 - k); } }
    for (const a of arcs) { const e = t - a.t0; a.line.visible = e >= 0 && e < 3.8; if (a.line.visible) { a.line.geometry.setDrawRange(0, Math.max(2, Math.floor(Math.min(1, e / 1.4) * a.n))); a.line.material.opacity = e < 1 ? e * .5 : Math.max(0, .5 - (e - 2.4) * .26); } }

    big.textContent = String(Math.round(131 * o3(seg(t, .2, 2.4)))).padStart(3, "0");
    filas.forEach((d, i) => { const k = seg(t, .5 + i * .17, .7 + i * .17); d.style.opacity = k; d.style.transform = `translateX(${(1 - o3(k)) * -14}px)`; });
    log.style.transform = `translateY(${-Math.max(0, t - 1.6) * (VERT ? 8 : 26)}px)`;
    const fuera = 1 - seg(t, 3.3, 3.9);
    big.style.opacity = fuera; $(".hni-lbl").style.opacity = fuera; log.style.opacity = fuera;
    if (t >= 3.45 && !lineas) titular();
    if (lineas) lineas.forEach((sp, i) => { const k = o5(seg(t, 3.6 + i * .12, 4.4 + i * .12)); sp.style.transform = `translateY(${(1 - k) * 110}%)`; });
    ovc.style.opacity = 1 - io3(seg(t, 4.8, 5.2));
    if (t > FIN - .25) window.__hniHold = false;
    renderer.render(scene, camera);
  }

  function cerrar() {
    if (cerrada) return; cerrada = true;
    cancelAnimationFrame(raf); window.__hniHold = false;
    ["pointerdown", "keydown", "wheel", "touchmove"].forEach(e => removeEventListener(e, saltar, true));
    removeEventListener("resize", ajusta);
    acabar(false);
    setTimeout(() => { renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); }, 100);
  }
  /* saltar: la capa se funde desde donde este */
  function saltar() { if (saltoEn < 0) { saltoEn = performance.now(); window.__hniHold = false; } }

  function bucle(now) {
    const t = (now - t0) / 1000;
    let a = 1 - io3(seg(t, FIN, FIN + FUNDE));
    if (saltoEn >= 0) a = Math.min(a, 1 - o3(seg(now, saltoEn, saltoEn + 450)));
    capa.style.opacity = a;
    if (a <= 0.001) { cerrar(); return; }
    cuadro(Math.min(t, FIN + FUNDE));
    raf = requestAnimationFrame(bucle);
  }

  function empezar() {
    if (cerrada || t0) return;
    ["pointerdown", "keydown", "wheel", "touchmove"].forEach(e => addEventListener(e, saltar, true));
    cuadro(0);
    t0 = performance.now();
    raf = requestAnimationFrame(bucle);
  }
  /* espera a las fuentes (como mucho 1,2 s) para que el contador no salte */
  const listas = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([listas, new Promise(r => setTimeout(r, 1200))]).then(empezar);
  /* salvavidas: pase lo que pase, la capa se retira */
  setTimeout(() => { if (!cerrada) { capa.style.transition = "opacity .5s"; capa.style.opacity = 0; setTimeout(cerrar, 520); } }, 14000);
})();
