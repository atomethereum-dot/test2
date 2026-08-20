/* ===== 3D #SECT coin: a small Three.js scene rendered into the hero,
   built from plain geometry (no textures) matching the site's blue brand
   mark — a coin body with the logo's ring embossed on both faces. Idles
   with a slow spin and tilts gently toward the pointer. Pauses off-screen
   and respects prefers-reduced-motion. ===== */
(() => {
  const canvas = document.getElementById("stakeCoin");
  if (!canvas || typeof THREE === "undefined") return;
  const hero = canvas.closest(".hero");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer:coarse)").matches;
  if (coarse) return; // hidden on mobile via CSS too; skip the WebGL cost entirely

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
  camera.position.set(0, 0, 5.6);

  const coin = new THREE.Group();
  scene.add(coin);

  const BLUE = 0x1569ff;
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 0.2, 72, 1, false),
    new THREE.MeshPhysicalMaterial({ color: BLUE, metalness: 0.7, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.25 })
  );
  body.rotation.x = Math.PI / 2;
  coin.add(body);

  const edge = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.028, 12, 72),
    new THREE.MeshPhysicalMaterial({ color: 0x0a2e8a, metalness: 0.8, roughness: 0.3 })
  );
  coin.add(edge);

  const ringGeo = new THREE.TorusGeometry(0.52, 0.06, 20, 72);
  const ringMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.15, roughness: 0.25, clearcoat: 0.5 });
  const ringFront = new THREE.Mesh(ringGeo, ringMat);
  ringFront.position.z = 0.11;
  coin.add(ringFront);
  const ringBack = new THREE.Mesh(ringGeo, ringMat);
  ringBack.position.z = -0.11;
  coin.add(ringBack);

  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 24, 18),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.15, roughness: 0.2, clearcoat: 0.6 })
  );
  dot.position.z = 0.16;
  coin.add(dot);
  const dotBack = dot.clone();
  dotBack.position.z = -0.16;
  coin.add(dotBack);

  // ---- orbiting halo ring: a thin, dim ring tilted off-axis that spins
  // counter to the coin, giving it a "sci-fi token" sense of motion even
  // when the pointer isn't nearby ----
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.012, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0x4d8dff, transparent: true, opacity: 0.4 })
  );
  halo.rotation.x = Math.PI / 2.6;
  scene.add(halo);
  const halo2 = new THREE.Mesh(
    new THREE.TorusGeometry(1.78, 0.008, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.16 })
  );
  halo2.rotation.x = Math.PI / 2.2;
  halo2.rotation.z = 0.6;
  scene.add(halo2);

  scene.add(new THREE.AmbientLight(0x2a3550, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(2.4, 3, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4d8dff, 1.3);
  rim.position.set(-3, -1.4, -2);
  scene.add(rim);
  const spark = new THREE.PointLight(0xffffff, 1.1, 8);
  spark.position.set(0, 0, 4.2);
  scene.add(spark);

  let W = 0, H = 0;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w < 1 || h < 1 || (w === W && h === H)) return;
    W = w; H = h;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }

  let tx = 0, ty = 0, curX = 0, curY = 0;
  window.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { rootMargin: "10% 0px" }).observe(hero);

  let raf = 0, spin = 0.4, t0 = performance.now();
  function frame() {
    raf = visible ? requestAnimationFrame(frame) : 0;
    if (!visible) return;
    resize();
    const t = (performance.now() - t0) / 1000;
    curX += (tx - curX) * 0.06;
    curY += (ty - curY) * 0.06;
    spin += 0.0032;
    coin.rotation.y = spin + curX * 0.5;
    coin.rotation.x = -curY * 0.28;
    coin.position.y = Math.sin(t * 0.7) * 0.06;
    halo.rotation.z = t * 0.18;
    halo2.rotation.z = -t * 0.12;
    renderer.render(scene, camera);
  }

  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
  resize();

  if (reduced) {
    coin.rotation.y = 0.5;
    renderer.render(scene, camera);
    return;
  }
  new IntersectionObserver((es) => {
    if (es[0].isIntersecting && !raf) raf = requestAnimationFrame(frame);
  }, { rootMargin: "10% 0px" }).observe(hero);
})();
