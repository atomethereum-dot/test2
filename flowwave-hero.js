import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';

/* ================= Flow Wave — adapted for the sectoraorg.com hero =================
   Same scene as /staking/flowwave.js (recolored to Sectora blue), but scoped to the
   .stage section instead of the whole page: the canvas is absolutely positioned inside
   .stage (not fixed), sized to the stage's own box, and the scroll-driven camera dive
   tracks the stage's own scroll-through-viewport progress instead of the whole
   document's scroll. It replaces the old pixel-grid #grid canvas as the hero backdrop. */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- fixed parameters (recolored to Sectora blue, matches /staking) ----
const bgColor       = '#03060c';
const flameColor    = '#1569ff';
const flameColor2   = '#9fc4ff';
const flameAmt      = 0.16;
const atmoColor     = '#7fb2ff';
const atmoCount     = 220;
const atmoSize      = 22;
const atmoSpeed     = 1.0;
const colorLow      = '#03060c';
const colorHigh     = '#4d8dff';
const opacity       = 0.24;
const pointSize     = 5.0;
const brightness    = 0.5;
const waveHeight    = 3;
const flow          = 1;
const tilt          = 0;
const scale         = 0.275;
const scrollRise    = 1.0;
const camStartY = 7,  camStartZ = 16;
const camEndY   = 0.8, camEndZ  = -2;
const lookStartZ = 2, lookEndZ  = -16;
const parallax        = 1.2;
const pointerRadius   = 7.0;
const pointerStrength = 0.9;

const Lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function hexToVec3(hex) {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const canvas = document.getElementById('flowWave');
const stage = document.getElementById('stage');
if (canvas && stage) (function () {

  const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 };

  const renderer = new THREE.WebGL1Renderer({ canvas, antialias: true, alpha: false });
  const dpr = Math.min(window.devicePixelRatio || 1, reduced ? 1 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 0, 15);

  const stageSize = () => ({ w: Math.max(1, stage.clientWidth), h: Math.max(1, stage.clientHeight) });
  const s0 = stageSize();
  const camera = new THREE.PerspectiveCamera(45, s0.w / s0.h, 0.1, 400);
  camera.position.set(0, camStartY, camStartZ);
  camera.layers.enable(LAYERS.TORUS_SCENE);
  camera.layers.enable(LAYERS.BLOOM_SCENE);
  camera.layers.enable(LAYERS.ENTIRE_SCENE);
  scene.add(camera);

  // ---- Simplex noise (verbatim) ----
  const SNOISE = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx; vec3 x2 = x0 - i2 + 2.0 * C.xxx; vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0; vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}`;

  // ---- wave points ----
  const waveGeo = new THREE.SphereGeometry(4.2, 200, 600);
  const waveUniforms = {
    uTime: { value: 0 }, uStream: { value: 0 }, uAppear: { value: 0 },
    uColLow: { value: hexToVec3(colorLow) }, uColHigh: { value: hexToVec3(colorHigh) },
    uOpacity: { value: opacity }, uSize: { value: pointSize }, uBrightness: { value: brightness },
    uWaveHeight: { value: waveHeight }, uFlow: { value: flow }, uScale: { value: scale },
    uCursor: { value: new THREE.Vector3() }, uRepelRadius: { value: pointerRadius },
    uRepelStrength: { value: pointerStrength }, uActivity: { value: 0 },
  };
  const waveVert = `
uniform float uTime; uniform float uStream; uniform float uSize; uniform float uWaveHeight; uniform float uFlow; uniform float uScale;
uniform vec3 uColLow; uniform vec3 uColHigh;
uniform vec3 uCursor; uniform float uRepelRadius; uniform float uRepelStrength; uniform float uActivity;
varying float vFade; varying vec3 vColor;
${SNOISE}
void main() {
  vec3 wp = vec3(position.x * 13.0, 0.0, position.z * 25.0);
  wp.x += position.y * 6.0;
  float zc = wp.z + uStream;
  float wn = snoise(vec3(wp.x * 0.08, zc * 0.08, uTime * 0.15 * uFlow)) * 2.0;
  wn += snoise(vec3(wp.x * 0.16, zc * 0.16, uTime * 0.3 * uFlow)) * 0.8;
  wp.y += wn * uWaveHeight;

  vec3 finalPos = wp * uScale;
  vec4 modelPosition = modelMatrix * vec4(finalPos, 1.0);
  vec3 toP = modelPosition.xyz - uCursor;
  float cd = length(toP);
  float fall = smoothstep(uRepelRadius, 0.0, cd);
  modelPosition.xyz += normalize(toP + vec3(0.0001)) * fall * uRepelStrength * uActivity;
  vec4 mvPosition = viewMatrix * modelPosition;

  float colMix = smoothstep(-3.0, 3.0, position.y + position.x * 0.5);
  vColor = mix(uColLow, uColHigh, clamp(colMix, 0.0, 1.0));
  vFade = 1.0;

  gl_PointSize = uSize * (10.0 / -mvPosition.z);
  gl_PointSize = max(gl_PointSize, 1.5);
  gl_Position = projectionMatrix * mvPosition;
}`;
  const waveFrag = `
uniform float uOpacity; uniform float uBrightness; uniform float uAppear;
varying float vFade; varying vec3 vColor;
void main() {
  vec2 xy = gl_PointCoord - 0.5;
  float ll = length(xy);
  if (ll > 0.5) discard;
  float a = smoothstep(0.5, 0.1, ll);
  gl_FragColor = vec4(vColor * uBrightness, vFade * a * uOpacity * uAppear);
}`;
  const waveMat = new THREE.ShaderMaterial({
    uniforms: waveUniforms, vertexShader: waveVert, fragmentShader: waveFrag,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const wavePoints = new THREE.Points(waveGeo, waveMat);
  wavePoints.frustumCulled = false;
  wavePoints.layers.enable(LAYERS.ENTIRE_SCENE);
  const group = new THREE.Group();
  group.add(wavePoints);
  scene.add(group);

  // ---- ambient motes ----
  const N = Math.round(atmoCount);
  const positions = new Float32Array(N * 3);
  const sizes = new Float32Array(N);
  const seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    positions[i * 3] = 2 * Math.random() - 1;
    positions[i * 3 + 1] = 2 * Math.random() - 1;
    positions[i * 3 + 2] = 2 * Math.random() - 1;
    sizes[i] = atmoSize * (0.4 + Math.random());
    seeds[i] = Math.random();
  }
  const atmoGeo = new THREE.BufferGeometry();
  atmoGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  atmoGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  atmoGeo.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));
  const atmoUniforms = {
    uTime: { value: 0 }, uColor: { value: hexToVec3(atmoColor) },
    uRes: { value: new THREE.Vector2(s0.w * dpr, s0.h * dpr) },
  };
  const atmoVert = `
attribute float size; attribute float seed; uniform float uTime; uniform vec2 uRes;
varying float vA;
vec3 warp(vec3 p, float t){ float c=0.9,a=1.9,b=0.02,s=0.05; p*=2.;
  p.x+=c*sin(s*t+a*p.y)+t*b; p.y+=c*cos(s*t+a*p.x); p.y+=c*sin(s*t+a*p.z)+t*b;
  p.z+=c*cos(s*t+a*p.y); p.z+=c*sin(s*t+a*p.x)+t*b; p.x+=c*cos(s*t+a*p.z);
  return cos(p+vec3(1,2,4)); }
void main(){
  vec3 v = position*4.0 + warp(position, uTime)*1.2;
  vec4 mv = modelViewMatrix * vec4(v, 1.0);
  float r = length(v); float farF = 1.0 - smoothstep(5.0, 6.5, r); float nearF = smoothstep(0.0, 0.5, -mv.z);
  vA = farF * nearF;
  gl_PointSize = size * uRes.y / 900.0 / -mv.z; gl_PointSize = max(gl_PointSize, 1.0);
  gl_Position = projectionMatrix * mv;
}`;
  const atmoFrag = `
uniform vec3 uColor; varying float vA;
void main(){ vec2 p = gl_PointCoord - 0.5; float l = length(p); if (l > 0.5) discard;
  float tex = smoothstep(0.5, 0.0, l); gl_FragColor = vec4(uColor * tex, tex * vA * 0.6); }`;
  const atmoMat = new THREE.ShaderMaterial({
    uniforms: atmoUniforms, vertexShader: atmoVert, fragmentShader: atmoFrag,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
  });
  const atmoPts = new THREE.Points(atmoGeo, atmoMat);
  atmoPts.frustumCulled = false;
  atmoPts.layers.enable(LAYERS.ENTIRE_SCENE);
  atmoPts.onBeforeRender = function () {
    const t = performance.now() / 1000;
    atmoMat.uniforms.uTime.value = t * atmoSpeed * 8.0;
    atmoPts.position.copy(camera.position);
    finalPass.uniforms.iTime.value = t;
  };
  scene.add(atmoPts);

  // ---- FinalPass composite ----
  const finalPass = new ShaderPass({
    uniforms: {
      iTime: { value: 0 }, tDiffuse: { value: null },
      torusTexture: { value: null }, bloomTexture: { value: null }, haloTexture: { value: null },
      uBg: { value: hexToVec3(bgColor) }, uFlameA: { value: hexToVec3(flameColor) },
      uFlameB: { value: hexToVec3(flameColor2) }, uFlameAmt: { value: flameAmt },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`,
    fragmentShader: `
uniform float iTime; uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; uniform sampler2D torusTexture; uniform sampler2D haloTexture;
uniform vec3 uBg; uniform vec3 uFlameA; uniform vec3 uFlameB; uniform float uFlameAmt;
varying vec2 vUv;
vec3 warp3d(vec3 pos, float t){ float curv=.8,a=1.9,b=0.7; pos*=2.;
  pos.x+=curv*sin(t+a*pos.y)+t*b; pos.y+=curv*cos(t+a*pos.x);
  pos.y+=curv*sin(t+a*pos.z)+t*b; pos.z+=curv*cos(t+a*pos.y);
  pos.z+=curv*sin(t+a*pos.x)+t*b; pos.x+=curv*cos(t+a*pos.z);
  return 0.5+0.5*cos(pos.xyz+vec3(1,2,4)); }
void main(){
  vec2 uv = 2.*vUv - 1.;
  vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime*1.5), vec3(1.5));
  vec3 flame = 1.5*uFlameA*w.x; flame*=w.y; flame += uFlameB*w.z;
  flame *= smoothstep(0.25, 1., abs(uv.y));
  float md = smoothstep(-0.7, 1., -uv.y*uv.x); flame *= md*md;
  vec3 bg = uBg * (1.0 - 0.4 * length(uv));
  vec3 halo = texture2D(haloTexture, vUv).xyz;
  gl_FragColor = vec4(bg + flame*uFlameAmt + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
}`,
  });

  // ---- composers ----
  const renderPass = new RenderPass(scene, camera);

  const torusComposer = new EffectComposer(renderer);
  torusComposer.renderToScreen = false;
  torusComposer.addPass(renderPass);
  torusComposer.addPass(new ShaderPass(GammaCorrectionShader));
  torusComposer.addPass(new UnrealBloomPass(new THREE.Vector2(s0.w, s0.h), 0.22, 0.2, 0));
  torusComposer.addPass(new ShaderPass(CopyShader));

  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderPass);
  bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(s0.w, s0.h), 0.4, 0.55, 0));
  bloomComposer.addPass(new ShaderPass(GammaCorrectionShader));

  finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture;
  finalPass.uniforms.torusTexture.value = torusComposer.renderTarget1.texture;

  const finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderPass);
  finalComposer.addPass(finalPass);

  // ---- scroll state, scoped to how far .stage itself has scrolled through the
  // viewport (0 = stage top at viewport top, 1 = stage has scrolled fully past) ----
  let scrollTarget = 0, scrollSmooth = 0, scrollCurrent = 0;
  function onScroll() {
    const r = stage.getBoundingClientRect();
    const total = r.height;
    const passed = clamp(-r.top, 0, total);
    scrollTarget = total > 0 ? passed / total : 0;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---- pointer, scoped to the canvas's own bounds (not the whole window) ----
  const mouseTarget = { x: 0, y: 0 }, mouse = { x: 0, y: 0 };
  const POINTER = { world: new THREE.Vector3(), activity: 0, active: false, lastMove: performance.now() };
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      POINTER.active = false;
      return;
    }
    mouseTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseTarget.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    POINTER.active = true;
    POINTER.lastMove = performance.now();
  }, { passive: true });
  window.addEventListener('mouseout', () => { POINTER.active = false; });

  const _ndc = new THREE.Vector3(), _dir = new THREE.Vector3(), _tgt = new THREE.Vector3();
  function updatePointerWorld() {
    _tgt.set(0, 0, 0);
    if (POINTER.active) {
      _ndc.set(mouse.x, mouse.y, 0.5).unproject(camera);
      _dir.copy(_ndc).sub(camera.position).normalize();
      const dn = _dir.z;
      if (Math.abs(dn) > 1e-4) {
        const tt = -camera.position.z / dn;
        if (tt > 0 && Number.isFinite(tt)) _tgt.copy(camera.position).addScaledVector(_dir, tt);
      }
    }
    POINTER.world.lerp(_tgt, 0.12);
    const idle = (performance.now() - POINTER.lastMove) / 1000;
    POINTER.activity += (((POINTER.active && idle < 3) ? 1 : 0) - POINTER.activity) * 0.06;
  }

  const state = { stream: 0, t0: performance.now() / 1000, appearStart: performance.now() };
  function updateScene(scroll, m) {
    const t = performance.now() / 1000;
    const dt = Math.min(0.05, t - state.t0); state.t0 = t;
    waveUniforms.uTime.value = t;

    state.stream += dt * (flow * 2.0) * 4.0;
    waveUniforms.uStream.value = state.stream;
    waveUniforms.uWaveHeight.value = waveHeight * (1 + scroll * scrollRise);

    const ea = Math.min(scroll / 0.35, 1.0);
    const e = ea * ea * (3 - 2 * ea);
    const camY = Lerp(camStartY, camEndY, e);
    const camZ = Lerp(camStartZ, camEndZ, e);
    camera.position.set(m.x * parallax, camY + m.y * parallax * 0.3, camZ);
    camera.lookAt(m.x * parallax * 0.5, Lerp(0.0, 0.6, e), Lerp(lookStartZ, lookEndZ, e));
    group.rotation.x = -tilt;
    group.rotation.y = 0;
    updatePointerWorld();

    waveUniforms.uCursor.value.copy(POINTER.world);
    waveUniforms.uActivity.value = POINTER.activity;
    const elapsed = (performance.now() - state.appearStart) / 1000;
    waveUniforms.uAppear.value = Math.max(0, Math.min(1, (elapsed - 0.2) / 1.4));
  }

  function resize() {
    const { w, h } = stageSize();
    const dpr = Math.min(window.devicePixelRatio || 1, reduced ? 1 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    for (const c of [torusComposer, bloomComposer, finalComposer]) {
      c.setPixelRatio(dpr);
      c.setSize(w, h);
    }
    atmoUniforms.uRes.value.set(w * dpr, h * dpr);
    onScroll();
  }
  window.addEventListener('resize', resize);
  resize();

  // ---- pause the RAF loop once the hero scrolls out of view or the tab is hidden,
  // matching the convention the old pixel-grid canvas used on this same section ----
  let tabVisible = true, stageVisible = true;
  document.addEventListener('visibilitychange', () => { tabVisible = !document.hidden; });
  new IntersectionObserver((es) => { stageVisible = es[0].isIntersecting; }, { rootMargin: '10% 0px' }).observe(stage);

  let raf = null;
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!tabVisible || !stageVisible) return;
    scrollSmooth = Lerp(scrollSmooth, scrollTarget, 0.10);
    scrollCurrent = Lerp(scrollCurrent, scrollSmooth, 0.06);
    mouse.x = Lerp(mouse.x, mouseTarget.x, 0.06);
    mouse.y = Lerp(mouse.y, mouseTarget.y, 0.06);
    updateScene(scrollCurrent, mouse);
    camera.layers.set(LAYERS.TORUS_SCENE);  torusComposer.render();
    camera.layers.set(LAYERS.BLOOM_SCENE);  bloomComposer.render();
    camera.layers.set(LAYERS.ENTIRE_SCENE); finalComposer.render();
  }
  frame();
})();
