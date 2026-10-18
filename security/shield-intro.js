/* Intro de Sectora Shield (C9 · Ciudad): sobrevolamos de noche una ciudad de
   datos, cada ataque cae sobre un edificio y una cupula de Shield lo para; con
   el ataque cuantico la ciudad se pone en rojo y Shield levanta una cupula que
   cubre toda la ciudad. Sale en cada visita y se salta con un toque. */
(function(){
var el=document.getElementById('shIntro');if(!el)return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.remove();return;}
var tc=document.createElement('canvas');if(!tc.getContext('webgl2')){el.remove();return;}
var MOB0=innerWidth/innerHeight<1.1,DPR=Math.min(devicePixelRatio||1,MOB0?2:1.5),QS=MOB0?Math.min(.9,700/(innerWidth*DPR)):Math.min(1,Math.sqrt(1.4e6/(innerWidth*innerHeight*DPR*DPR)));
/* base comun de las 10 intros de Sectora Shield. Guion: el motor arranca,
   bloquea cuatro ataques (uno por capa: orden falsificada, registro
   alterado, contraseña robada, salida anomala), resiste un ataque cuantico
   de recuperacion de claves y queda "Don't trust. Verify.". Con ?shot el
   tiempo lo pone setT(t). */
const S = {};
S.cl=(v,a=0,b=1)=>v<a?a:v>b?b:v;
S.seg=(t,a,b)=>S.cl((t-a)/(b-a));
S.eo=k=>1-Math.pow(1-k,3); S.eo5=k=>1-Math.pow(1-k,5);
S.eio=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
S.lerp=(a,b,k)=>a+(b-a)*k;
S.h=(a,b=0)=>{const s=Math.sin(a*127.1+b*311.7)*43758.5453;return s-Math.floor(s);};
S.pk=(t,t0,d=.25)=>{const k=(t-t0)/d;return k<0||k>1?0:Math.pow(1-k,2.2);};
S.shake=(t,t0,amp,dur=.35)=>{const k=S.seg(t,t0,t0+dur);if(k<=0||k>=1)return[0,0];const a=amp*Math.pow(1-k,2);return[Math.sin(t*93.1)*a,Math.cos(t*71.7)*a];};
S.rot=(p,ax,ay,az=0)=>{let [x,y,z]=p,c=Math.cos(ax),s=Math.sin(ax);[y,z]=[y*c-z*s,y*s+z*c];c=Math.cos(ay);s=Math.sin(ay);[x,z]=[x*c+z*s,-x*s+z*c];if(az){c=Math.cos(az);s=Math.sin(az);[x,y]=[x*c-y*s,x*s+y*c];}return[x,y,z];};
S.pr=(p,cx,cy,f,D)=>{const k=f/(D+p[2]);return[cx+p[0]*k,cy+p[1]*k,k,p[2]];};
S.RED='#ff3b3b';S.RED2='#ff6a6a';S.BLUE='#1569ff';S.BLUE2='#4d8dff';
/* guion */
S.EV=[.75,1.1,1.45,1.8]; S.M=[1.95,3.1]; S.HEAD=3.15; S.EXIT=4.55; S.END=5.15; S.IN=.22;
S.st=(i,t)=>t>=S.EV[i]?2:t>=S.EV[i]-S.IN?1:0;            /* 0 nada, 1 entrando, 2 bloqueado */
S.inc=(i,t)=>S.seg(t,S.EV[i]-S.IN,S.EV[i]);               /* avance del ataque i hasta el bloqueo */
S.blocked=t=>S.EV.filter(e=>t>=e).length;
S.mp=t=>S.seg(t,S.M[0],S.M[1]);                           /* avance del ataque cuantico */
S.safe=t=>S.seg(t,S.M[1],S.M[1]+.4);                      /* todo asegurado */
S.NAMES=['Spoofed order','Tampered record','Stolen password','Abnormal outflow'];
S.LAYERS=['Signed at origin','Integrity ledger','Authenticated channel','On-chain monitoring'];
S.log=t=>{
  if(t<.55) return ['','Initializing post-quantum engine'];
  if(t>=S.M[1]) return ['b','All four layers held · Secured'];
  if(t>=S.M[0]) return ['r','Quantum attack · ECDSA key recovery · '+Math.round(S.mp(t)*100)+'%'];
  for(let i=3;i>=0;i--){
    if(t>=S.EV[i]) return ['b','Blocked · '+S.NAMES[i]+' · '+S.LAYERS[i]];
    if(t>=S.EV[i]-S.IN) return ['r','Threat · '+S.NAMES[i]];
  }
  return ['','Monitoring custody, trading and data'];
};
S.canvas=id=>{const c=document.getElementById(id),x=c.getContext('2d');const size=()=>{const d=Math.min(window.devicePixelRatio||1,2);c.width=Math.round(innerWidth*d);c.height=Math.round(innerHeight*d);x.setTransform(d,0,0,d,0,0);x.W=innerWidth;x.H=innerHeight;};size();addEventListener('resize',size);return x;};
/* borra con degradado lo que el lienzo 2D pinte bajo el bloque de texto */
S.mask=x=>{const r=S.el.ui.querySelector('.md').getBoundingClientRect(),W=x.W,H=x.H;x.save();x.globalCompositeOperation='destination-out';let g;
  if(W/H<1.1){const y=r.top-14;g=x.createLinearGradient(0,y-50,0,y);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,1)');x.fillStyle=g;x.fillRect(0,y-50,W,H);}
  else{const xr=Math.min(r.right,r.left+S.el.nm.getBoundingClientRect().width+40);g=x.createLinearGradient(xr,0,xr+80,0);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,xr+80,H);}
  const tb=S.el.tp.getBoundingClientRect().bottom-8;g=x.createLinearGradient(0,tb,0,tb+36);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,tb+36);
  x.restore();};
/* lo mismo para un shader: vec4(vertical, borde, ancho del degradado, cabecera) en pixeles del lienzo */
S.mk=c=>{const d=c.width/innerWidth,H=innerHeight,r=S.el.ui.querySelector('.md').getBoundingClientRect(),tb=S.el.tp.getBoundingClientRect().bottom;
  if(innerWidth/H<1.1)return[1,(H-r.top+14)*d,50*d,(H-tb+8)*d];
  return[0,Math.min(r.right,r.left+S.el.nm.getBoundingClientRect().width+40)*d,(S.mkw||80)*d,(H-tb+8)*d];};
S.MK='uniform vec4 uMk;float mk(){vec2 f=gl_FragCoord.xy;float m=uMk.x>.5?smoothstep(uMk.y,uMk.y+uMk.z,f.y):smoothstep(uMk.y,uMk.y+uMk.z,f.x);return m*(1.-smoothstep(uMk.w-uMk.z*.7,uMk.w,f.y));}\n';
/* mascara CSS para capas DOM: la misma zona libre que S.mask */
S.cssMask=el=>{const r=S.el.ui.querySelector('.md').getBoundingClientRect(),tb=S.el.tp.getBoundingClientRect().bottom,W=innerWidth,H=innerHeight;let m;
  if(W/H<1.1)m='linear-gradient(180deg,transparent '+(tb-8)+'px,#000 '+(tb+28)+'px,#000 '+(r.top-64)+'px,transparent '+(r.top-14)+'px)';
  else{const xr=Math.min(r.right,r.left+S.el.nm.getBoundingClientRect().width+40);m='linear-gradient(90deg,transparent '+xr+'px,#000 '+(xr+(S.mkw||80))+'px),linear-gradient(180deg,transparent '+(tb-8)+'px,#000 '+(tb+28)+'px)';el.style.webkitMaskComposite='source-in';el.style.maskComposite='intersect';}
  el.style.webkitMaskImage=m;el.style.maskImage=m;};
/* rotulo en mono que nunca se sale de la pantalla ni pisa la cabecera */
S.label=(x,txt,X,Y,col,right)=>{const w=x.measureText(txt).width,tb=S.el.tp.getBoundingClientRect().bottom+34;if(right)X-=w;
  X=S.cl(X,14,x.W-14-w);Y=Math.max(Y,tb);x.fillStyle=col;x.fillText(txt,X,Y);};
S.gl=(id,fs,scale=1)=>{
  const c=document.getElementById(id),g=c.getContext('webgl',{antialias:false,alpha:false,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!g)return null;
  const sh=(ty,src)=>{const s=g.createShader(ty);g.shaderSource(s,src);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))console.error(g.getShaderInfoLog(s));return s;};
  const p=g.createProgram();g.attachShader(p,sh(g.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
  g.attachShader(p,sh(g.FRAGMENT_SHADER,'precision highp float;\nuniform vec2 uRes;uniform float uT;\n'+fs));g.bindAttribLocation(p,0,'a');g.linkProgram(p);g.useProgram(p);
  const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),g.STATIC_DRAW);g.enableVertexAttribArray(0);g.vertexAttribPointer(0,2,g.FLOAT,false,0,0);
  const loc={},L=k=>k in loc?loc[k]:(loc[k]=g.getUniformLocation(p,k));
  const size=()=>{const d=Math.min(window.devicePixelRatio||1,2)*scale;c.width=Math.round(innerWidth*d);c.height=Math.round(innerHeight*d);g.viewport(0,0,c.width,c.height);};size();addEventListener('resize',size);
  let tex=null;
  return {g,c,L,
    texture(src){if(!tex){tex=g.createTexture();g.bindTexture(g.TEXTURE_2D,tex);[g.TEXTURE_WRAP_S,g.TEXTURE_WRAP_T].forEach(k=>g.texParameteri(g.TEXTURE_2D,k,g.CLAMP_TO_EDGE));[g.TEXTURE_MIN_FILTER,g.TEXTURE_MAG_FILTER].forEach(k=>g.texParameteri(g.TEXTURE_2D,k,g.LINEAR));}
      g.bindTexture(g.TEXTURE_2D,tex);g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,true);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,src);g.uniform1i(L('uTex'),0);},
    draw(t,u={}){g.uniform2f(L('uRes'),c.width,c.height);g.uniform1f(L('uT'),t);
      for(const k in u){const v=u[k],l=L(k);if(l===null)continue;if(typeof v==='number')g.uniform1f(l,v);else if(v instanceof Float32Array)g.uniform1fv(l,v);else if(v.length===2)g.uniform2fv(l,v);else if(v.length===3)g.uniform3fv(l,v);else g.uniform4fv(l,v);}
      g.drawArrays(g.TRIANGLE_STRIP,0,4);}};
};
const GLY='ABCDEF0123456789#/<>=+';
S.scr=(txt,p,t,seed=0)=>{const n=txt.length,r=Math.floor(p*n*1.0001);let o='';for(let i=0;i<n;i++){const c=txt[i];o+=(i<r||c===' ')?c:GLY[Math.floor(S.h(i+seed,Math.floor(t*28))*GLY.length)];}return o;};
const SLOGO='<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="9" fill="#1569ff"/><circle cx="50" cy="50" r="27.2" fill="none" stroke="#fff" stroke-width="6.1"/></svg>';
S.mount=layout=>{
  const ui=document.createElement('div');ui.className='ui L-'+layout;
  ui.innerHTML='<div class="tp"><div class="lg">'+SLOGO+'Sectora Shield<i>Post-quantum</i></div><div class="m"><b></b>Live monitoring · Testnet</div></div>'+
   '<div class="md"><div class="hd"><div class="k m">Quantum-resistant security engine</div><div class="nm"><span class="a">Sectora</span><br><span class="b">Shield.</span></div><div class="log m"><i></i><span></span></div></div>'+
   '<div class="st"><h2><span class="g">Don\'t trust. Verify.</span><span class="v"></span></h2><p>Post-quantum protection for custody, trading and data across the Sectora network.</p>'+
   '<div class="chips"><span>ML-KEM · FIPS 203</span><span>ML-DSA · FIPS 204</span><span>SLH-DSA · FIPS 205</span></div></div></div>'+
   '<div class="bt"><div class="br"><i></i></div><div class="lb m"><span>Loading Sectora Shield</span><span class="pc">0%</span></div></div>';
  document.getElementById('shIntro').appendChild(ui);
  const q=s=>ui.querySelector(s);
  S.el={ui,tp:q('.tp'),k:q('.k'),nm:q('.nm'),log:q('.log'),logt:q('.log span'),h2:q('.st h2 .v'),p:q('.st p'),chips:q('.chips'),bt:q('.bt'),fill:q('.br i'),pc:q('.pc')};
};
const fade=(el,k,dy=10)=>{el.style.opacity=k;el.style.transform=k<1?'translateY('+((1-S.eo(k))*dy)+'px)':'';};
S.ui=t=>{
  const e=S.el;
  fade(e.tp,S.seg(t,.1,.6),-8);fade(e.k,S.seg(t,.3,.8));e.k.textContent=S.scr('Quantum-resistant security engine',S.seg(t,.3,1.0),t,3);
  fade(e.nm,S.seg(t,.4,.9),14);
  const [c,tx]=S.log(t);e.log.className='log m '+c;e.logt.textContent=tx;fade(e.log,S.seg(t,.45,.8),6);
  const kh=S.seg(t,S.HEAD,S.HEAD+.5);fade(e.h2,kh,14);
  if(kh>0){const s=S.scr("Don't trust. Verify.",S.seg(t,S.HEAD,S.HEAD+.55),t,9);e.h2.innerHTML=s.slice(0,13).replace(/</g,'&lt;')+'<em>'+s.slice(13).replace(/</g,'&lt;')+'</em>';}else e.h2.textContent='';
  fade(e.p,S.seg(t,S.HEAD+.18,S.HEAD+.65),12);fade(e.chips,S.seg(t,S.HEAD+.32,S.HEAD+.8),12);
  e.bt.style.opacity=S.seg(t,.2,.6);
  const b=1-Math.pow(1-S.seg(t,.25,S.EXIT-.15),2.2);e.fill.style.transform='scaleX('+b+')';e.pc.textContent=Math.round(b*100)+'%';
  const x=S.seg(t,S.EXIT,S.END),si=document.getElementById('shIntro');si.style.opacity=1-S.eio(x);si.style.transform=x>0?'scale('+(1+.05*S.eio(x))+')':'';
};
S.run=render=>{
  const shot=/shot/.test(location.search);window.setT=t=>render(t);
  const go=()=>{document.body.dataset.ok=1;if(shot){render(0);return;}const T0=performance.now();(function f(){render(((performance.now()-T0)/1000)%(S.END+.6));requestAnimationFrame(f);})();};
  (document.fonts?Promise.all([document.fonts.load("500 100px 'IBM Plex Sans'"),document.fonts.load("300 100px 'IBM Plex Sans'"),document.fonts.load("500 12px 'IBM Plex Mono'")]):Promise.resolve()).then(go,go);
};

/* serie T: tuberia de postproduccion comun. La escena (un shader HDR y/o un
   lienzo 2D) se pinta en una textura de coma flotante, se le saca el brillo
   en tres niveles de desenfoque y se compone con un hombro suave que no
   lava el azul de marca, vinyeta, grano fino y la mascara del texto.
   S.fx({scene:'glsl'|null, ss:1.5, th:.62, bw:[.55,.7,.9], vig:.35, grain:.025, ca:.0012, fx2d:true}) */
S.fx=(o={})=>{
  const c=document.getElementById(o.canvas||'shCv');
  const g=c.getContext('webgl2',{antialias:false,alpha:false,premultipliedAlpha:false,preserveDrawingBuffer:false});
  const hf=!!g.getExtension('EXT_color_buffer_float');S.mkw=o.mkw||200;
  const VS='attribute vec2 a;varying vec2 vUv;void main(){vUv=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
  const prog=fs=>{const mk=(ty,src)=>{const s=g.createShader(ty);g.shaderSource(s,src);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))console.error(g.getShaderInfoLog(s));return s;};
    const p=g.createProgram();g.attachShader(p,mk(g.VERTEX_SHADER,VS));g.attachShader(p,mk(g.FRAGMENT_SHADER,'precision highp float;\nvarying vec2 vUv;\n'+fs));g.bindAttribLocation(p,0,'a');g.linkProgram(p);
    if(!g.getProgramParameter(p,g.LINK_STATUS))console.error(g.getProgramInfoLog(p));const loc={};return{p,L:k=>k in loc?loc[k]:(loc[k]=g.getUniformLocation(p,k))};};
  const buf=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,buf);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),g.STATIC_DRAW);g.enableVertexAttribArray(0);g.vertexAttribPointer(0,2,g.FLOAT,false,0,0);
  const SC=o.scene?prog('uniform vec2 uRes;uniform float uT;\n'+o.scene):null;
  const MIX=prog('uniform sampler2D uA,uB;uniform float uHasA,uGain;void main(){vec4 b=texture2D(uB,vUv);vec3 a=uHasA>.5?texture2D(uA,vUv).rgb:vec3(0.);gl_FragColor=vec4(a*(1.-b.a)+b.rgb*uGain,1.);}');
  const BR=prog('uniform sampler2D uS;uniform vec2 uPx;uniform float uTh;void main(){vec3 c=(texture2D(uS,vUv+uPx*vec2(-1.,-1.)).rgb+texture2D(uS,vUv+uPx*vec2(1.,-1.)).rgb+texture2D(uS,vUv+uPx*vec2(-1.,1.)).rgb+texture2D(uS,vUv+uPx).rgb)*.25;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(uTh,uTh+.4,l),1.);}');
  const DN=prog('uniform sampler2D uS;uniform vec2 uPx;void main(){gl_FragColor=vec4((texture2D(uS,vUv+uPx*vec2(-1.,-1.)).rgb+texture2D(uS,vUv+uPx*vec2(1.,-1.)).rgb+texture2D(uS,vUv+uPx*vec2(-1.,1.)).rgb+texture2D(uS,vUv+uPx).rgb)*.25,1.);}');
  const BL=prog('uniform sampler2D uS;uniform vec2 uDir;void main(){vec3 c=texture2D(uS,vUv).rgb*.2270;c+=(texture2D(uS,vUv+uDir*1.3846).rgb+texture2D(uS,vUv-uDir*1.3846).rgb)*.3162;c+=(texture2D(uS,vUv+uDir*3.2308).rgb+texture2D(uS,vUv-uDir*3.2308).rgb)*.0703;gl_FragColor=vec4(c,1.);}');
  const CP=prog(S.MK+'uniform sampler2D uS,uB1,uB2,uB3;uniform vec3 uBw;uniform float uVig,uGrain,uCA,uT,uExp,uGl,uScan;uniform vec2 uRes;'+
    'float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}'+
    'vec3 sh(vec3 c){return mix(c,.82+.18*(1.-exp(-(c-.82)/.18)),step(.82,c));}'+
    'void main(){vec2 uv=vUv;if(uGl>0.){float row=floor(uv.y*48.);float r=hs(vec2(row,floor(uT*24.)));if(r<uGl*.35)uv.x+=(hs(vec2(row*1.3,floor(uT*24.)+7.))-.5)*.06*uGl;}'+
    'vec2 d=uv-.5;float ca=uCA*(1.+uGl*7.);vec3 c;if(ca>0.){c.r=texture2D(uS,uv+d*ca).r;c.g=texture2D(uS,uv).g;c.b=texture2D(uS,uv-d*ca).b;}else c=texture2D(uS,uv).rgb;'+
    'c+=texture2D(uB1,vUv).rgb*uBw.x+texture2D(uB2,vUv).rgb*uBw.y+texture2D(uB3,vUv).rgb*uBw.z;c*=uExp;c=sh(c);'+
    'c*=1.-uScan*(.5+.5*cos(gl_FragCoord.y*3.14159));c+=vec3(.04,.09,.2)*uScan*4.*exp(-pow((vUv.y-fract(-uT*.3))*40.,2.));'+
    'c*=1.-uVig*dot(d*vec2(uRes.x/uRes.y,1.),d*vec2(uRes.x/uRes.y,1.))*.9;c+=(hs(gl_FragCoord.xy+fract(uT*7.3)*91.)-.5)*uGrain;gl_FragColor=vec4(clamp(c,0.,1.)*mk(),1.);}');
  const T=(w,h)=>{const t=g.createTexture();g.bindTexture(g.TEXTURE_2D,t);g.texImage2D(g.TEXTURE_2D,0,hf?g.RGBA16F:g.RGBA8,w,h,0,g.RGBA,hf?g.HALF_FLOAT:g.UNSIGNED_BYTE,null);
    [g.TEXTURE_WRAP_S,g.TEXTURE_WRAP_T].forEach(k=>g.texParameteri(g.TEXTURE_2D,k,g.CLAMP_TO_EDGE));[g.TEXTURE_MIN_FILTER,g.TEXTURE_MAG_FILTER].forEach(k=>g.texParameteri(g.TEXTURE_2D,k,g.LINEAR));
    const f=g.createFramebuffer();g.bindFramebuffer(g.FRAMEBUFFER,f);g.framebufferTexture2D(g.FRAMEBUFFER,g.COLOR_ATTACHMENT0,g.TEXTURE_2D,t,0);return{t,f,w,h};};
  const tx2=g.createTexture();g.bindTexture(g.TEXTURE_2D,tx2);[g.TEXTURE_WRAP_S,g.TEXTURE_WRAP_T].forEach(k=>g.texParameteri(g.TEXTURE_2D,k,g.CLAMP_TO_EDGE));[g.TEXTURE_MIN_FILTER,g.TEXTURE_MAG_FILTER].forEach(k=>g.texParameteri(g.TEXTURE_2D,k,g.LINEAR));
  /* lienzo 2D de efectos, del tamano del lienzo de salida */
  let x=null,xc=null;if(o.fx2d){xc=document.createElement('canvas');x=xc.getContext('2d');}
  let F={},d=1;
  const size=()=>{d=Math.min(window.devicePixelRatio||1,innerWidth/innerHeight<1.1?2:1.5);c.width=Math.round(innerWidth*d);c.height=Math.round(innerHeight*d);const W=c.width,H=c.height,s=o.ss||1;
    F={S:T(Math.round(W*s),Math.round(H*s)),M:T(Math.round(W*s),Math.round(H*s)),A1:T(W>>1,H>>1),B1:T(W>>1,H>>1),A2:T(W>>2,H>>2),B2:T(W>>2,H>>2),A3:T(W>>3,H>>3),B3:T(W>>3,H>>3)};
    if(xc){xc.width=W;xc.height=H;x.setTransform(d,0,0,d,0,0);x.W=innerWidth;x.H=innerHeight;}};
  size();addEventListener('resize',size);
  const set=(P,u)=>{for(const k in u){const v=u[k],l=P.L(k);if(l===null)continue;if(typeof v==='number')g.uniform1f(l,v);else if(v instanceof Float32Array)g.uniform1fv(l,v);else if(v.length===2)g.uniform2fv(l,v);else if(v.length===3)g.uniform3fv(l,v);else g.uniform4fv(l,v);}};
  const pass=(P,dst,tex,u)=>{g.useProgram(P.p);g.bindFramebuffer(g.FRAMEBUFFER,dst?dst.f:null);g.viewport(0,0,dst?dst.w:c.width,dst?dst.h:c.height);
    tex.forEach(([name,t],i)=>{g.activeTexture(g.TEXTURE0+i);g.bindTexture(g.TEXTURE_2D,t);g.uniform1i(P.L(name),i);});set(P,u);g.drawArrays(g.TRIANGLE_STRIP,0,4);};
  const blur=(A,B,r)=>{pass(BL,B,[['uS',A.t]],{uDir:[r/A.w,0]});pass(BL,A,[['uS',B.t]],{uDir:[0,r/A.h]});};
  return{g,c,x,ss(v){o.ss=v;size();},
    draw(t,u={},post={}){
      let base=null;
      if(SC){pass(SC,F.S,[],Object.assign({uRes:[F.S.w,F.S.h],uT:t},u));base=F.S;}
      if(x){x.save();x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.fillStyle='rgba(0,0,0,.004)';x.fillRect(0,0,1,1);x.restore();g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,tx2);g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,true);g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,xc);
        pass(MIX,F.M,[['uA',base?base.t:F.S.t],['uB',tx2]],{uHasA:base?1:0,uGain:post.gain||1});base=F.M;}
      pass(BR,F.A1,[['uS',base.t]],{uPx:[.5/F.A1.w,.5/F.A1.h],uTh:post.th!=null?post.th:(o.th!=null?o.th:.62)});blur(F.A1,F.B1,1);
      pass(DN,F.A2,[['uS',F.A1.t]],{uPx:[.5/F.A2.w,.5/F.A2.h]});blur(F.A2,F.B2,1.4);
      pass(DN,F.A3,[['uS',F.A2.t]],{uPx:[.5/F.A3.w,.5/F.A3.h]});blur(F.A3,F.B3,1.8);
      pass(CP,null,[['uS',base.t],['uB1',F.A1.t],['uB2',F.A2.t],['uB3',F.A3.t]],{uBw:post.bw||o.bw||[.5,.65,.85],uVig:o.vig!=null?o.vig:.35,uGrain:o.grain!=null?o.grain:.022,uCA:o.ca!=null?o.ca:.0012,uT:t,uExp:post.exp||1,uGl:post.gl||0,uScan:o.scan||0,uRes:[c.width,c.height],uMk:S.mk(c),uLk:S.lk?S.lk(c):[0,0,1,1]});
    }};
};

/* serie C: pantalla completa y HUD cibernetico. Se carga despues de slib.js
   y fx.js y sustituye la composicion de columna por una centrada: la escena
   ocupa toda la pantalla, el estado va abajo al centro y al final la pieza
   central se convierte en el logo del titulo, que aparece centrado. */
S.M=[1.9,2.85];S.HEAD=3.2;S.EXIT=4.7;S.END=5.3;
S.mountC=()=>{
  const ui=document.createElement('div');ui.className='ui L-c';
  ui.innerHTML='<div class="tp"><div class="lg">'+SLOGO+'Sectora Shield<i>Post-quantum</i></div><div class="m"><b></b>Live monitoring · Testnet</div></div>'+
   '<div class="tag"></div>'+
   '<div class="lk"><div class="slot"></div><div class="nm"><span class="a">Sectora</span> <span class="b">Shield.</span></div>'+
   '<div class="st"><h2><span class="g">Don\'t trust. Verify.</span><span class="v"></span></h2><p>Post-quantum protection for custody, trading and data across the Sectora network.</p>'+
   '<div class="chips"><span>ML-KEM · FIPS 203</span><span>ML-DSA · FIPS 204</span><span>SLH-DSA · FIPS 205</span></div></div></div>'+
   '<div class="ft"><div class="k m">Quantum-resistant security engine</div><div class="log m"><i></i><span></span></div></div>'+
   '<div class="bt"><div class="br"><i></i></div><div class="lb m"><span>Loading Sectora Shield</span><span class="pc">0%</span></div></div>';
  document.getElementById('shIntro').appendChild(ui);
  const q=s=>ui.querySelector(s);
  S.el={ui,tp:q('.tp'),tag:q('.tag'),lk:q('.lk'),slot:q('.slot'),k:q('.ft .k'),ft:q('.ft'),nm:q('.lk .nm'),log:q('.log'),logt:q('.log span'),h2:q('.st h2 .v'),p:q('.st p'),chips:q('.chips'),bt:q('.bt'),fill:q('.br i'),pc:q('.pc')};
  if(innerWidth/innerHeight<1.1)S.el.nm.innerHTML='<span class="a">Sectora</span><br><span class="b">Shield.</span>';
};
/* zonas: cabecera arriba, pie (estado) abajo, titulo al final */
S.zone=()=>{const tb=S.el.tp.getBoundingClientRect().bottom,ft=S.el.ft.getBoundingClientRect().top;return{top:tb+18,bot:ft-16};};
S.lockK=t=>S.eio(S.seg(t,S.HEAD-.35,S.HEAD+.15));
S.slot=()=>{const r=S.el.slot.getBoundingClientRect();return{cx:r.left+r.width/2,cy:r.top+r.height/2,s:r.width};};
S.mask=()=>{};
S.label=(x,txt,X,Y,col,right)=>{const w=x.measureText(txt).width,z=S.zone();if(right)X-=w;X=S.cl(X,14,x.W-14-w);Y=S.cl(Y,z.top+16,z.bot-10);x.fillStyle=col;x.fillText(txt,X,Y);};
S.MK='uniform vec4 uMk,uLk;float mk(){vec2 f=gl_FragCoord.xy;float m=1.-smoothstep(uMk.x-uMk.z,uMk.x,f.y);m*=mix(.2,1.,smoothstep(uMk.y-uMk.z*.6,uMk.y+uMk.z*.4,f.y));'+
  'float d=length((f-uLk.xy)/uLk.zw);m*=1.-uMk.w*(.3+.62*(1.-smoothstep(.55,1.2,d)));return m;}\n';
S.dim=0;
S.mk=c=>{const d=c.width/innerWidth,H=innerHeight,tb=S.el.tp.getBoundingClientRect().bottom,ft=S.el.ft.getBoundingClientRect().top;return[(H-tb+4)*d,(H-ft+8)*d,40*d,S.dim];};
S.lk=c=>{const d=c.width/innerWidth,H=innerHeight,r=S.el.lk.getBoundingClientRect();return[(r.left+r.width/2)*d,(H-r.top-r.height/2)*d,Math.max(r.width*.62,180)*d,Math.max(r.height*.75,120)*d];};
/* logo nitido (va en el lienzo de rotulos, fuera de la postproduccion) */
S.logo=(o,cx,cy,s,a=1,glow=0,on=1)=>{if(a<=0||s<=0)return;o.save();o.globalAlpha=a;if(glow>0){o.shadowBlur=glow;o.shadowColor='#4d8dff';}
  const m=(p,q)=>p.map((v,i)=>Math.round(v+(q[i]-v)*on));o.fillStyle='rgb('+m([18,22,32],[21,105,255])+')';o.beginPath();o.roundRect(cx-s/2,cy-s/2,s,s,s*.09);o.fill();o.shadowBlur=0;
  o.strokeStyle='#fff';o.lineWidth=s*.061;o.beginPath();o.arc(cx,cy,s*.272,0,Math.PI*2);o.stroke();o.restore();};
/* HUD del marco: esquinas, reglas, lecturas y marcas de escaneo */
S.hud=(o,t)=>{
  const W=o.W,H=o.H,mob=W/H<1.1,mon=t>=S.M[0]&&t<S.M[1],on=t>=S.M[1],a=S.eo(S.seg(t,.05,.6))*(1-S.seg(t,S.EXIT,S.END));
  const bl=mon?(Math.sin(t*22)>0?1:.45):1,col=mon?'255,90,80':'127,176,255';
  o.save();o.globalAlpha=a;o.lineWidth=1.5;o.strokeStyle='rgba('+col+','+(.7*bl)+')';
  const g=mob?10:16,L=mob?18:28;[[g,g,1,1],[W-g,g,-1,1],[W-g,H-g,-1,-1],[g,H-g,1,-1]].forEach(([x,y,sx,sy])=>{o.beginPath();o.moveTo(x+sx*L,y);o.lineTo(x,y);o.lineTo(x,y+sy*L);o.stroke();});
  if(!mob){
    /* reglas laterales */
    const y0=H*.24,y1=H*.76;o.font='500 9px "IBM Plex Mono"';o.textBaseline='middle';
    for(const side of[0,1]){const x=side?W-g-2:g+2,dir=side?-1:1;o.strokeStyle='rgba('+col+',.35)';o.beginPath();o.moveTo(x,y0);o.lineTo(x,y1);o.stroke();
      const off=(t*(side?-24:24))%24;for(let y=y0-24+off;y<y1;y+=6){if(y<y0)continue;const k=Math.round((y-off)/6);const l=k%4===0?10:4;o.strokeStyle='rgba('+col+','+(k%4===0?.55:.3)+')';o.beginPath();o.moveTo(x,y);o.lineTo(x+dir*l,y);o.stroke();}
      o.fillStyle='rgba('+col+',.55)';o.textAlign=side?'right':'left';o.fillText((side?'Z ':'Y ')+(((t*137.3+side*400)%1000)|0).toString().padStart(3,'0'),x+dir*14,y0-12);}
    /* lecturas en las esquinas de abajo */
    o.font='500 10px "IBM Plex Mono"';o.textBaseline='alphabetic';const yb=H-88,blk=S.blocked(t)+(on?1:0);
    const Lh=[['NODE','SECT-L3 · 07'],['PQC','ML-KEM-768'],['UPTIME','99.998%']],Rh=[['THREATS BLOCKED',String(blk).padStart(2,'0')],['LATENCY',(0.7+0.2*Math.sin(t*3)).toFixed(2)+' MS'],['STATUS',mon?'UNDER ATTACK':on?'SECURED':'ARMED']];
    Lh.forEach((r,i)=>{o.textAlign='left';o.fillStyle='rgba(170,190,225,.45)';o.fillText(r[0],g+2,yb-36+i*16);o.fillStyle='rgba('+col+',.9)';o.fillText(r[1],g+70,yb-36+i*16);});
    Rh.forEach((r,i)=>{o.textAlign='right';o.fillStyle='rgba(170,190,225,.45)';o.fillText(r[0],W-g-2-(r[0].length>8?96:96),yb-36+i*16);o.fillStyle=i===2&&mon?'rgba(255,100,90,'+bl+')':'rgba('+col+',.9)';o.fillText(r[1],W-g-2,yb-36+i*16);});
  }
  o.restore();
};
S.ui=t=>{
  const e=S.el,W=innerWidth,H=innerHeight;
  fade(e.tp,S.seg(t,.1,.6),-8);
  e.k.textContent=S.scr('Quantum-resistant security engine',S.seg(t,.3,1.0),t,3);
  const [c,tx]=S.log(t);e.log.className='log m '+c;e.logt.textContent=tx;
  const lkR=e.lk.getBoundingClientRect(),ftR=e.ft.getBoundingClientRect(),clash=lkR.bottom>ftR.top-8;
  fade(e.ft,S.seg(t,.3,.8)*(clash?1-S.seg(t,S.HEAD-.2,S.HEAD):1),6);
  /* etiqueta de alerta bajo la cabecera */
  const mon=t>=S.M[0]&&t<S.M[1];e.tag.style.top=(e.tp.getBoundingClientRect().bottom+8)+'px';
  if(mon){e.tag.className='tag r';e.tag.textContent='⚠ Quantum intrusion · '+Math.round(S.mp(t)*100)+'%';e.tag.style.opacity=S.seg(t,S.M[0],S.M[0]+.1)*(Math.sin(t*22)>0?1:.55);}
  else if(t>=S.M[1]&&t<S.HEAD){e.tag.className='tag b';e.tag.textContent='Threat neutralized';e.tag.style.opacity=1-S.seg(t,S.HEAD-.15,S.HEAD);}
  else e.tag.style.opacity=0;
  /* titulo centrado */
  const k=S.lockK(t);e.lk.style.opacity=k>0?1:0;S.dim=k;
  const kn=S.seg(t,S.HEAD+.05,S.HEAD+.45);e.nm.style.opacity=kn;e.nm.style.transform='translateY('+(1-S.eo(kn))*14+'px)';e.nm.style.letterSpacing=S.lerp(.06,-.045,S.eo(kn))+'em';
  const kh=S.seg(t,S.HEAD+.2,S.HEAD+.7);fade(e.h2,kh,12);
  if(kh>0){const s=S.scr("Don't trust. Verify.",S.seg(t,S.HEAD+.2,S.HEAD+.75),t,9);e.h2.innerHTML=s.slice(0,13).replace(/</g,'&lt;')+'<em>'+s.slice(13).replace(/</g,'&lt;')+'</em>';}else e.h2.textContent='';
  fade(e.p,S.seg(t,S.HEAD+.38,S.HEAD+.85),12);fade(e.chips,S.seg(t,S.HEAD+.52,S.HEAD+1),12);
  e.bt.style.opacity=S.seg(t,.2,.6);
  const b=1-Math.pow(1-S.seg(t,.25,S.EXIT-.15),2.2);e.fill.style.transform='scaleX('+b+')';e.pc.textContent=Math.round(b*100)+'%';
  const x=S.seg(t,S.EXIT,S.END),si=document.getElementById('shIntro');si.style.opacity=1-S.eio(x);si.style.transform=x>0?'scale('+(1+.05*S.eio(x))+')':'';
};
/* rotulos de impacto con caja tipo HUD */
S.tagAt=(o,txt,X,Y,col,right,a=1)=>{if(a<=0)return;o.save();o.globalAlpha=a;const w=o.measureText(txt).width+14,h=18,z=S.zone();let x0=right==='c'?X-w/2:right?X-w:X;x0=S.cl(x0,14,o.W-14-w);const y0=S.cl(Y-h/2,z.top+24,z.bot-h);
  o.fillStyle='rgba(0,0,0,.55)';o.fillRect(x0,y0,w,h);o.strokeStyle=col;o.lineWidth=1;o.strokeRect(x0+.5,y0+.5,w-1,h-1);o.fillStyle=col;o.fillRect(right?x0+w-3:x0,y0,3,h);
  o.textBaseline='middle';o.textAlign='left';o.fillText(txt,x0+(right?6:9),y0+h/2+.5);o.restore();};
/* cuanto glitch meter en la postproduccion */
S.glit=t=>{let g=0;S.EV.forEach(e=>{g=Math.max(g,S.pk(t,e,.16)*.45);});
  if(t>=S.M[0]&&t<S.M[1])g=Math.max(g,(.12+.5*S.mp(t))*(S.h(Math.floor(t*14),3)<.45?1:.25));
  return Math.max(g,S.pk(t,S.M[1],.32)*.9);};
/* centro y tamano de la pieza en pantalla completa */
S.stage=()=>{const W=innerWidth,H=innerHeight,mob=W/H<1.1,z=S.zone();
  if(mob)return{mob,W,H,cx:W/2,cy:z.top+(z.bot-z.top)*.46,u:Math.min(W*.2,(z.bot-z.top)*.15),z};
  return{mob,W,H,cx:W/2,cy:(z.top+z.bot)/2,u:Math.min(W*.1,(z.bot-z.top)*.17),z};};
/* lienzo de rotulos en CPU: con aceleracion, algunos navegadores sin GPU muestran un fotograma viejo */
S.canvas=id=>{const c=document.getElementById(id),x=c.getContext('2d');const size=()=>{const d=Math.min(window.devicePixelRatio||1,2);c.width=Math.round(innerWidth*d);c.height=Math.round(innerHeight*d);x.setTransform(d,0,0,d,0,0);x.W=innerWidth;x.H=innerHeight;};size();addEventListener('resize',size);return x;};


/* en la web: se reproduce una vez, se salta con un toque o una tecla y
   se retira del todo al terminar */
S.run=render=>{
  const root=document.documentElement,ov=root.style.overflow;root.style.overflow='hidden';
  /* el reloj avanza como mucho 0,1 s por fotograma: si el movil se atasca
     (compilar el shader, cargar la pagina) la intro no se salta escenas;
     si va muy lento, a los 14 s se retira igualmente */
  let done=false,t=0,last=0,w0=0,fr=0,acc=0,q=QS;
  const end=()=>{if(done)return;done=true;root.style.overflow=ov;el.remove();removeEventListener('keydown',sk);};
  const sk=()=>{if(t<S.EXIT)t=S.EXIT;};
  el.addEventListener('pointerdown',sk);addEventListener('keydown',sk);
  const go=()=>{if(w0)return;w0=last=performance.now()||1;el.style.animation='none';(function f(){if(done)return;const now=performance.now(),dt=Math.max(now-last,0);t+=Math.min(dt,100)/1000;last=now;
    /* si el equipo no llega a ~20 fps en los primeros fotogramas, baja la resolucion de la escena */
    if(++fr>4&&fr<=64){acc+=dt;if(fr%15===4){if(acc/15>40&&q>.42){q=Math.max(.42,q*.72);try{S.R.ss(q);}catch(e){}}acc=0;}}
    if(t>=S.END||now-w0>14000){end();return;}try{render(t);}catch(e){end();return;}requestAnimationFrame(f);})();};
  const fl=document.fonts?Promise.all([document.fonts.load("500 100px 'IBM Plex Sans'"),document.fonts.load("300 100px 'IBM Plex Sans'"),document.fonts.load("500 12px 'IBM Plex Mono'")]):Promise.resolve();
  Promise.race([fl,new Promise(r=>setTimeout(r,1200))]).then(go,go);
};

/* C9 · Ciudad: sobrevolamos de noche una ciudad de datos de neon, la red de
   Sectora. En el centro, la torre de Shield. Cada ataque es un rayo rojo que
   cae sobre un edificio y una cupula azul de Shield lo para. Con el ataque
   cuantico la ciudad entera se apaga en rojo; Shield levanta una cupula
   sobre todo y la torre proyecta el logo hacia el cielo. Raymarching de una
   ciudad procedural, con niebla y reflejos en el suelo. */
S.mountC();
/* guion mas largo: mas tiempo entre ataques y el final con la cupula se sostiene */
S.EV=[1.,1.5,2.,2.5];S.IN=.35;S.M=[2.75,3.9];S.HEAD=4.3;S.EXIT=6.4;S.END=7.;
/* en movil: objetivo mas angular y camara mas lejos (edificios mas pequenos), postproduccion mas limpia */
const MOB=innerWidth/innerHeight<1.1,FOC=MOB?1.:1.5;
const R=S.R=S.fx({ss:QS,fx2d:true,th:.75,bw:MOB?[.45,.62,.85]:[.6,.8,1.05],scan:MOB?.025:.07,ca:MOB?.0005:.0016,grain:MOB?.018:.03,scene:`
uniform vec2 uCt;uniform vec3 uRo,uTa;uniform float uFoc;uniform float uMon,uM,uOn,uIn,uDome,uDa,uWave,uFo;uniform vec4 uA0,uA1,uA2,uA3;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
const float CS=1.;
float bh(vec2 c){float h=h2(c);float d=length(c);if(d<.5)return 5.5;return (.25+pow(h,3.)*2.6)*smoothstep(14.,4.,d)*step(.18,h2(c+7.));}
float bw(vec2 c){return length(c)<.5?.22:.3+.1*h2(c+3.);}
/* rayo contra la ciudad: recorre la rejilla celda a celda (DDA) y en cada celda corta el rayo
   con la caja de su edificio. Cada caja cabe en su celda, asi que el primer corte es el bueno.
   Sustituye a la marcha por distancias (120 pasos x 9 cajas por pixel). */
float trace(vec3 ro,vec3 rd,out vec3 n){
  vec3 r=mix(vec3(1e-6),rd,step(vec3(1e-6),abs(rd)));vec3 iv=1./r;
  float tb=r.y<0.?-ro.y*iv.y:1e9;n=vec3(0.,1.,0.);
  vec3 t0=(vec3(-14.5,0.,-14.5)-ro)*iv,t1=(vec3(14.5,5.6,14.5)-ro)*iv,tn=min(t0,t1),tx=max(t0,t1);
  float ta=max(max(tn.x,tn.y),max(tn.z,0.)),te=min(min(tx.x,tx.y),tx.z);
  if(te>ta){vec2 c=floor(ro.xz+r.xz*(ta+1e-4)+.5),sg=sign(r.xz),dt=abs(iv.xz),tm=(c+sg*.5-ro.xz)*iv.xz;
    for(int i=0;i<64;i++){float h=bh(c);
      if(h>0.){float w=bw(c);vec3 q0=(vec3(c.x-w,0.,c.y-w)-ro)*iv,q1=(vec3(c.x+w,h,c.y+w)-ro)*iv,qn=min(q0,q1),qx=max(q0,q1);
        float a=max(max(qn.x,qn.y),qn.z),b=min(min(qx.x,qx.y),qx.z);
        if(b>=a&&a>0.&&a<tb){tb=a;n=a==qn.x?vec3(-sg.x,0.,0.):a==qn.y?vec3(0.,1.,0.):vec3(0.,0.,-sg.y);break;}}
      float nx=min(tm.x,tm.y);if(nx>te||nx>tb)break;
      if(tm.x<tm.y){c.x+=sg.x;tm.x+=dt.x;}else{c.y+=sg.y;tm.y+=dt.y;}}}
  return tb;}
float eo3(float k){k=clamp(k,0.,1.);return 1.-(1.-k)*(1.-k)*(1.-k);}
/* burbuja de Shield: elipsoide que envuelve el edificio atacado (ancho x alto x ancho) */
vec3 bubR(vec4 A){float h=max(bh(A.xy),.5);return vec3(bw(A.xy)*1.7+.5,h*1.1+.35,bw(A.xy)*1.7+.5)*eo3(A.w/.3);}
/* ataque: el rayo que baja del cielo, el destello del impacto y la cupula pequena de Shield,
   todo dentro de la escena: los edificios de delante los tapan */
vec3 strike(vec4 A,vec3 ro,vec3 rd,float th){vec3 c=vec3(0.);
  if(A.z<=0.&&A.w<0.)return c;
  vec3 top=vec3(A.x,max(bh(A.xy),0.)+.02,A.y);
  if(A.w<0.){vec3 a=vec3(A.x+2.,14.,A.y-1.),b=mix(a,top,A.z),ba=b-a,w0=ro-a;
    float B=dot(rd,ba),C=dot(ba,ba),D=dot(rd,w0),E=dot(ba,w0);
    float sp=clamp((E-B*D)/max(C-B*B,1e-5),0.,1.),tt=max(sp*B-D,0.);
    float d=length(ro+rd*tt-(a+ba*sp));
    if(tt<th){float w=.022+tt*.0014;c+=vec3(1.,.42,.32)*exp(-d*d/(w*w))*1.8+vec3(1.,.14,.07)*exp(-d/(w*6.))*.4;}
    vec3 hp=b-ro;float ht=dot(hp,rd);
    if(ht>0.&&ht<th+.2){float hd=length(hp-rd*ht),w=.05+ht*.003;c+=(vec3(1.,.75,.65)*exp(-hd*hd/(w*w))*1.6+vec3(1.,.2,.1)*exp(-hd/(w*5.))*.35)*A.z;}}
  else{float tau=A.w;
    float fl=max(0.,1.-tau/.32);fl*=fl;
    if(fl>0.){vec3 hp=top-ro;float ht=dot(hp,rd);if(ht>0.&&ht<th+.35){float hd=length(hp-rd*ht),w=.07+ht*.004;
      c+=(vec3(.85,.92,1.)*exp(-hd*hd/(w*w))*2.4+vec3(.3,.55,1.)*exp(-hd/(w*7.))*.7)*fl;}}
    float fd=1.-smoothstep(.25,1.,tau);
    if(fd>0.){vec3 R=bubR(A);if(R.x>.01){vec3 oc=(ro-vec3(A.x,0.,A.y))/R,rq=rd/R;float qa=dot(rq,rq),qb=dot(oc,rq),hh=qb*qb-qa*(dot(oc,oc)-1.);
      if(hh>0.){float sq=sqrt(hh);for(int k=0;k<2;k++){float ts=(k==0?-qb-sq:-qb+sq)/qa;vec3 u=oc+rq*ts;if(ts<=0.||u.y<0.||ts>th)continue;
        vec3 nn=normalize(u/R);float fr=pow(1.-abs(dot(nn,rd)),2.);
        vec2 hx=vec2(atan(u.z,u.x)*5.,asin(clamp(u.y,-1.,1.))*7.);vec2 g=abs(fract(hx)-.5);float ln=smoothstep(.08,0.,min(g.x,g.y));
        c+=vec3(.25,.55,1.)*(fr*1.05+ln*(.12+.35*fr)+.045)*fd*(k==0?1.:.45);}}}}}
  return c;}
/* anillo que deja la cupula pequena en el suelo */
vec3 bubRing(vec4 A,vec3 p){if(A.w<0.)return vec3(0.);float fd=1.-smoothstep(.25,1.,A.w);if(fd<=0.)return vec3(0.);
  float R=bubR(A).x,d=length(p.xz-A.xy);float q=(d-R)/.06;return vec3(.3,.6,1.)*(exp(-q*q)*.9+exp(-max(R-d,0.)*2.5)*step(d,R)*.12)*fd;}
vec3 alarm(vec4 A,vec2 cell){if(A.z<=0.&&A.w<0.)return vec3(0.);if(length(cell-A.xy)>.5)return vec3(0.);float red=A.w<0.?A.z:0.,blu=A.w>=0.?exp(-A.w*3.):0.;return vec3(1.,.12,.08)*red*.9+vec3(.3,.6,1.)*blu*.9;}
float EW=.035;
vec3 bcol(vec3 p,vec3 n){vec2 cell=floor(p.xz/CS+.5);float h=bh(cell),id=h2(cell);
  vec3 neon=mix(vec3(.15,.42,1.),vec3(1.,.15,.1),uMon*smoothstep(0.,1.,uM*2.-length(cell)*.12+id*.3));
  vec3 c=vec3(.003,.004,.008);
  float w=length(cell)<.5?.22:.3+.1*h2(cell+3.);vec3 q=p-vec3(cell.x*CS,0.,cell.y*CS);
  /* aristas de neon: verticales en las esquinas y el borde del tejado */
  float ev=abs(n.x)>.5?w-abs(q.z):w-abs(q.x);float eg=smoothstep(EW,.0,ev)*step(n.y,.5)+smoothstep(EW*1.15,.0,h-p.y)*step(n.y,.5)+smoothstep(EW,.0,w-max(abs(q.x),abs(q.z)))*step(.5,n.y);
  c+=neon*eg*(.9+.4*id);
  if(n.y<.5){vec2 f=vec2(dot(p.xz,vec2(n.z,-n.x))*6.,p.y*7.);vec2 g=fract(f);float win=step(.2,g.x)*step(g.x,.8)*step(.25,g.y)*step(g.y,.75);float lit=step(.55,h2(floor(f)+cell*13.));
    c+=neon*win*lit*(.06+.22*id)*(.6+.4*sin(uT*2.+id*20.));
    }
  else c+=neon*.02;
  /* aristas verticales */
  c+=alarm(uA0,cell)+alarm(uA1,cell)+alarm(uA2,cell)+alarm(uA3,cell);
  if(length(cell)<.5){c=vec3(.01,.015,.035)+vec3(.3,.6,1.)*(.2+uOn*.6)*smoothstep(.0,.1,fract(p.y*1.5-uT*.8))*.35+vec3(.4,.7,1.)*eg*(1.2+uOn);}
  if(uWave>0.){float q=(length(p.xz)-uWave*uDome)/.35;c+=vec3(.4,.7,1.)*exp(-q*q)*(1.-uWave)*.8;}
  return c;}
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;vec3 ro=uRo;vec3 fw=normalize(uTa-ro),rt=normalize(cross(vec3(0.,1.,0.),fw)),up=cross(fw,rt);vec3 rd=normalize(fw*uFoc+rt*(uv.x-uCt.x)+up*(uv.y-uCt.y));
  vec3 sky=vec3(.003,.004,.01)+vec3(.02,.05,.16)*exp(-abs(rd.y-.02)*9.)*(1.+uOn*.8);sky=mix(sky,vec3(.003)+vec3(.16,.02,.02)*exp(-abs(rd.y-.02)*7.),uMon*uM*.8);
  vec3 col=sky;vec3 n;float t=trace(ro,rd,n);bool hit=t<1e8;vec3 p=ro+rd*t;
  if(hit){vec3 c;
    if(n.y>.5&&p.y<.001){/* suelo con reflejo de neon y reticula */vec2 g=abs(fract(p.xz*2.)-.5);float ln=smoothstep(.03,.0,min(g.x,g.y));
      vec3 neon=mix(vec3(.15,.42,1.),vec3(1.,.15,.1),uMon*uM);c=vec3(.004,.006,.012)+neon*ln*.12;
      vec3 rr=reflect(rd,vec3(0.,1.,0.)),n2;vec3 p2=p+rr*.002;float t2=trace(p2,rr,n2);
      if(t2<12.){vec3 q=p2+rr*t2;if(q.y>.001)c+=bcol(q,n2)*.25*(1.-t2/12.);}
      if(uWave>0.){float q=(length(p.xz)-uWave*uDome)/.4;c+=vec3(.4,.7,1.)*exp(-q*q)*(1.-uWave)*1.5;}
      /* anillo de luz donde la cupula toca el suelo */
      if(uDome>0.){float q=(length(p.xz)-uDome)/.3;c+=vec3(.15,.4,1.)*exp(-q*q)*uDa*.75;}
      c+=bubRing(uA0,p)+bubRing(uA1,p)+bubRing(uA2,p)+bubRing(uA3,p);}
    else{EW=max(.035,t*.0018);c=bcol(p,n);}
    col=mix(sky,c,exp(-max(t-uFo,0.)*.05));}
  col+=strike(uA0,ro,rd,t)+strike(uA1,ro,rd,t)+strike(uA2,ro,rd,t)+strike(uA3,ro,rd,t);
  /* haz de la torre hacia el cielo */
  /* cupula de Shield: media esfera de radio uDome que cubre toda la ciudad */
  if(uDome>0.){float R=uDome;float b=dot(ro,rd),h=b*b-dot(ro,ro)+R*R;if(h>0.){float sq=sqrt(h);
    for(int k=0;k<2;k++){float ts=k==0?-b-sq:-b+sq;vec3 q=ro+rd*ts;if(ts<=0.||q.y<0.||ts>t)continue;vec3 n=normalize(q);float fr=pow(1.-abs(dot(n,rd)),2.5);
      vec2 hx=vec2(atan(n.z,n.x)*9.,asin(n.y)*14.);vec2 g=abs(fract(hx)-.5);float ln=smoothstep(.07,0.,min(g.x,g.y));
      float base=exp(-q.y*1.2);
      col+=vec3(.16,.42,1.)*(fr*.6+ln*(.12+.25*fr)+.03+base*.14)*uDa*(k==0?1.:.4);}}}
  gl_FragColor=vec4(col*uIn,1.);}`});
const x=R.x,o=S.canvas('shOv');const TAU=Math.PI*2;
const AC=[[3,-2],[-2,-3],[4,2],[-3,2]];
function render(t){
  const st=S.stage(),W=st.W,H=st.H,mob=st.mob;
  const mp=S.mp(t),mon=t>=S.M[0]&&t<S.M[1],on=S.eo(S.seg(t,S.M[1],S.M[1]+.4)),kin=S.eo(S.seg(t,0,1)),lk=S.lockK(t),sl=S.slot();
  /* al final la camara se aleja y sube para ver la cupula cubriendo toda la ciudad */
  const pull=S.eio(S.seg(t,S.M[1]-.1,S.M[1]+1.25)),DR=15.5;
  const ang=-.6+t*.12-pull*.25,rad=(mob?S.lerp(17.5,15,S.eo(S.seg(t,0,S.END))):S.lerp(13,10.5,S.eo(S.seg(t,0,S.END))))+pull*(mob?19:21),hgt=(mob?S.lerp(8,7,S.eo(S.seg(t,0,S.END))):S.lerp(5.2,4.2,S.eo(S.seg(t,0,S.END))))+pull*(mob?8:8.5);
  const ro=[Math.cos(ang)*rad,hgt,Math.sin(ang)*rad],ta=[0,S.lerp(mob?1.6:2.2,mob?6.5:4.6,pull),0],ct=[(st.cx-W/2)/H,(H/2-st.cy)/H];
  const dome=DR*S.eo(S.seg(t,S.M[1],S.M[1]+1.1));
  const A=AC.map((c,i)=>{const s0=S.st(i,t);return[c[0],c[1],s0===1?S.eio(S.inc(i,t)):s0===2?1:0,s0===2?t-S.EV[i]:-1];});
  /* proyeccion de puntos del mundo */
  const fw=[ta[0]-ro[0],ta[1]-ro[1],ta[2]-ro[2]],fl=Math.hypot(...fw);fw.forEach((v,i)=>fw[i]=v/fl);const rt0=[fw[2],0,-fw[0]],rl=Math.hypot(...rt0);const rt=rt0.map(v=>v/rl);
  const up=[fw[1]*rt[2]-fw[2]*rt[1],fw[2]*rt[0]-fw[0]*rt[2],fw[0]*rt[1]-fw[1]*rt[0]];
  const pj=P=>{const d=[P[0]-ro[0],P[1]-ro[1],P[2]-ro[2]];const z=d[0]*fw[0]+d[1]*fw[1]+d[2]*fw[2];const X=d[0]*rt[0]+d[1]*rt[1]+d[2]*rt[2],Y=d[0]*up[0]+d[1]*up[1]+d[2]*up[2];return[W/2+(ct[0]+FOC*X/z)*H,H/2-(ct[1]+FOC*Y/z)*H,z];};
  x.clearRect(0,0,W,H);x.save();x.globalCompositeOperation='lighter';
  /* ataque cuantico: tormenta de rayos */
  if(mon){for(let k=0;k<3;k++){const seed=Math.floor(t*10)+k*7;const tx=(S.h(seed,1)-.5)*12,tz=(S.h(seed,2)-.5)*12;let p=pj([tx+2,16,tz-1]);const e=pj([tx,1,tz]);x.strokeStyle='rgba(255,'+(70+k*30)+',60,'+(.5+.5*mp)+')';x.lineWidth=1.6;x.beginPath();x.moveTo(p[0],p[1]);
    for(let j=1;j<=8;j++){const f=j/8;x.lineTo(S.lerp(p[0],e[0],f)+(S.h(seed,j)-.5)*40,S.lerp(p[1],e[1],f));}x.stroke();}}
  /* haz de la torre */
  {const b=pj([0,5.6,0]),sky=pj([0,40,0]);const a=S.lerp(.25,1,on)*kin*(mon?.3:1);const g=x.createLinearGradient(b[0],b[1],sky[0],sky[1]);g.addColorStop(0,'rgba(120,180,255,'+a+')');g.addColorStop(1,'rgba(60,130,255,0)');x.strokeStyle=g;x.lineWidth=4+10*on;x.beginPath();x.moveTo(b[0],b[1]);x.lineTo(sky[0],sky[1]);x.stroke();}
  x.restore();
  R.draw(t,{uCt:ct,uRo:ro,uTa:ta,uFoc:FOC,uMon:mon?1:0,uM:mp,uOn:on,uIn:kin,uDome:dome,uDa:S.eo(S.seg(t,S.M[1],S.M[1]+.3))*(1-S.seg(lk,.4,1)*.2),uFo:pull*(Math.hypot(rad,hgt)-12),uWave:S.seg(t,S.M[1],S.M[1]+1.1),uA0:A[0],uA1:A[1],uA2:A[2],uA3:A[3]},{gl:S.glit(t),exp:1+S.pk(t,S.M[1],.4)*.5});
  o.clearRect(0,0,W,H);o.font='500 '+(mob?9:11)+'px "IBM Plex Mono"';
  for(let i=0;i<4;i++){const s0=S.st(i,t);if(!s0)continue;const p=pj([AC[i][0],3.4,AC[i][1]]),rt2=p[0]<st.cx;
    if(s0===1)S.tagAt(o,'STRIKE · '+S.NAMES[i].toUpperCase(),p[0]+(rt2?18:-18),p[1]-18,'rgba(255,110,100,1)',!rt2);
    if(s0===2&&!(i<3&&S.st(i+1,t)>0))S.tagAt(o,'SHIELDED · '+S.LAYERS[i].toUpperCase(),p[0]+(rt2?18:-18),p[1]-18,'rgba(140,190,255,1)',!rt2,1-S.seg(t-S.EV[i],.28,.4));}
  if(mon){const p=pj([0,7,0]);S.tagAt(o,'CITY-WIDE QUANTUM ATTACK · '+Math.round(mp*100)+'%',p[0],p[1],'rgba(255,110,100,1)','c');}
  /* logo proyectado sobre la torre que sube al titulo */
  {const p=pj([0,6.4,0]),ap=S.seg(t,S.M[1]+.05,S.M[1]+.3);if(ap>0){const s=S.lerp(st.u*1.1,sl.s,lk);S.logo(o,S.lerp(p[0],sl.cx,lk),S.lerp(p[1],sl.cy,lk),s,ap,30);}}
  S.hud(o,t);
  S.ui(t);
}
S.run(render);

})();
