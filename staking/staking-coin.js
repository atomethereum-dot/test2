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
    new THREE.MeshStandardMaterial({ color: BLUE, metalness: 0.55, roughness: 0.32 })
  );
  body.rotation.x = Math.PI / 2;
  coin.add(body);

  const ringGeo = new THREE.TorusGeometry(0.52, 0.06, 20, 72);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.35, emissive: 0x0b1220, emissiveIntensity: 0.15 });
  const ringFront = new THREE.Mesh(ringGeo, ringMat);
  ringFront.position.z = 0.11;
  coin.add(ringFront);
  const ringBack = new THREE.Mesh(ringGeo, ringMat);
  ringBack.position.z = -0.11;
  coin.add(ringBack);

  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 24, 18),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.3 })
  );
  dot.position.z = 0.15;
  coin.add(dot);
  const dotBack = dot.clone();
  dotBack.position.z = -0.15;
  coin.add(dotBack);

  scene.add(new THREE.AmbientLight(0x2a3550, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(2.4, 3, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4d8dff, 1.1);
  rim.position.set(-3, -1.4, -2);
  scene.add(rim);

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

  let raf = 0, spin = 0.4;
  function frame() {
    raf = visible ? requestAnimationFrame(frame) : 0;
    if (!visible) return;
    resize();
    curX += (tx - curX) * 0.06;
    curY += (ty - curY) * 0.06;
    spin += 0.0032;
    coin.rotation.y = spin + curX * 0.5;
    coin.rotation.x = -curY * 0.28;
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
