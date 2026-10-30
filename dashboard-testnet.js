/* ═══════════ Sectora testnet: el dash contra los contratos reales ═══════════
   Lee las direcciones de /dash/testnet-config.json. Mientras esten vacias
   (contratos sin desplegar) no toca nada y el dash sigue en modo demo.
   Con direcciones:
     - faucet: 5.000 tSECT cada 24 h por wallet
     - compra de hash real (approve + purchase) en SectoraHashMarket
     - rendimiento: APY sobre los tSECT gastados en hash (25% al lanzar,
       ajustable por el dueño del contrato), que se
       acumula cada segundo y se cobra cuando se quiera
     - registro real del nodo en ValidatorRegistry
     - cifras de la portada y de la red leidas de la cadena
   Todo es testnet: tSECT no tiene valor monetario. */
(function(){
  "use strict";

  const CFG_URL = '/dash/testnet-config.json';
  const ZERO = /^0x0{40}$/i;
  const TOKEN_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address,address) view returns (uint256)',
    'function approve(address,uint256) returns (bool)',
    'function faucet()',
    'function lastFaucetClaim(address) view returns (uint256)',
    'function FAUCET_AMOUNT() view returns (uint256)',
    'function FAUCET_COOLDOWN() view returns (uint256)'
  ];
  const MARKET_ABI = [
    'function packages(uint256) view returns (string name, uint8 kind, uint256 priceInToken, uint256 hashPower, bool active)',
    'function purchase(uint256)',
    'function claim()',
    'function hashPower(address) view returns (uint256)',
    'function principal(address) view returns (uint256)',
    'function pendingRewards(address) view returns (uint256)',
    'function rewardsPerDay(address) view returns (uint256)',
    'function claimed(address) view returns (uint256)',
    'function apyBps() view returns (uint256)',
    'function getStats() view returns (uint256 hashSold, uint256 boughtBack, uint256 spent, uint256 rewardsClaimed, uint256 buyers, uint256 reserve)'
  ];
  const REGISTRY_ABI = [
    'function register(string,int32,int32)',
    'function validatorIndexPlusOne(address) view returns (uint256)',
    'function activeValidatorCount() view returns (uint256)',
    'function validatorCount() view returns (uint256)',
    'function minHashToValidate() view returns (uint256)',
    'function getValidators(uint256,uint256) view returns (tuple(address operator, string name, int32 latMicro, int32 lonMicro, uint256 hashPowerAtRegistration, uint64 registeredAt, bool active)[])'
  ];

  const tr = (k, f) => {
    if(!window.SECTORA_T) return f;
    const v = window.SECTORA_T(k);
    return (v && v !== k) ? v : f;
  };
  const q = s => document.querySelector(s);
  const toast = m => { const w = window.__sectoraWallet; if(w && w.aviso) w.aviso(m); };
  const fmt = (wei, dec) => {
    const n = Number(window.ethers.formatEther(wei));
    return n.toLocaleString('en-US', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });
  };

  let cfg = null, ro = null, tokenRO, marketRO, registryRO;
  let acct = null;           /* cuenta conectada */
  let me = null;             /* ultimo estado leido de la cuenta */
  let ocupado = false;
  let desfase = 0;           /* segundos que la cadena va por delante del reloj local */
  let APY = 0.25;            /* lo lee del contrato: apyBps / 10000 */
  /* vista previa (?preview=N): suma validadores simulados en pantalla,
     con un aviso visible. */
  /* Ejemplo activo por defecto (temporal, para la exposicion): el dash
     abre con 131 validadores simulados mas lo real, siempre con la
     etiqueta "Preview" a la vista. ?preview=0 muestra solo lo real.
     Para volver a datos reales por defecto: PREVIEW_DEFECTO = 0. */
  const PREVIEW_DEFECTO = 131;
  const PREVIEW = (() => {
    try{
      const v = new URLSearchParams(location.search).get('preview');
      if(v === null) return PREVIEW_DEFECTO;
      const n = parseInt(v, 10);
      return n >= 0 ? Math.min(n, 500) : PREVIEW_DEFECTO;
    }catch(e){ return PREVIEW_DEFECTO; }
  })();
  /* compra media de cada validador simulado, sacada de una mezcla real de
     paquetes (por cada 30: 18 Node Kit, 6 Node Kit + Standard,
     3 Node Kit + Pro, 3 Node Kit XL) = 85 TH/s y 7.080 tSECT gastados */
  const PREVIEW_TH = 85, PREVIEW_SPENT = 7080;

  function cargaEthers(){
    if(window.ethers) return Promise.resolve();
    return new Promise((ok, mal) => {
      const s = document.createElement('script');
      s.src = '/ethers.min.js'; s.onload = ok; s.onerror = mal;
      document.head.appendChild(s);
    });
  }

  /* ---------------------------------------------------------------- UI */
  function montaUI(){
    const nodo = document.getElementById('node');
    if(!nodo || document.getElementById('rewards')) return;
    const head = document.createElement('div');
    head.className = 'head'; head.id = 'rewards';
    head.innerHTML = '<h2 data-i18n="hashdash.tn.title">Faucet &amp; rewards</h2>' +
      '<span id="tnSub"></span>';
    const grid = document.createElement('div');
    grid.className = 'g2 rv on'; grid.id = 'tnGrid';
    grid.innerHTML =
      '<div class="card tn-card">' +
        '<span class="lbl" data-i18n="hashdash.tn.faucet">Testnet faucet</span>' +
        '<span class="big num" id="tnFaucetAmt">5,000 tSECT</span>' +
        '<p class="note" style="margin:10px 0 18px" data-i18n="hashdash.tn.faucetNote">Claim free test tokens every 24 hours to try the hash market. tSECT has no monetary value.</p>' +
        '<button class="btn key" id="tnFaucet" type="button" style="width:100%;padding:14px" disabled>' + tr('hashdash.tn.connectFirst','Connect wallet to claim') + '</button>' +
        '<span class="sub" id="tnFaucetNext" style="display:block;margin-top:10px"></span>' +
        '<div style="margin:18px 0 16px">' +
          '<div class="row"><span class="lbl" data-i18n="hashdash.tn.balance">Your balance</span><b id="tnBal">—</b></div>' +
        '</div>' +
        '<button class="btn" id="tnAdd" type="button" style="width:100%;padding:12px">' + tr('hashdash.tn.addToken','Add tSECT to your wallet') + '</button>' +
        '<p class="note" style="margin-top:14px"><span data-i18n="hashdash.tn.gasNote">You also need a little Sepolia ETH to pay gas.</span> ' +
          '<a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank" rel="noopener noreferrer" style="color:var(--blue)" data-i18n="hashdash.tn.gasLink">Get Sepolia ETH ↗</a></p>' +
        /* datos para agregarlos a mano si la wallet no los muestra sola */
        '<div class="tn-man">' +
          '<span class="lbl" data-i18n="hashdash.tn.manK">Add manually</span>' +
          '<p class="note" data-i18n="hashdash.tn.manP">If Sepolia ETH or tSECT does not appear in your wallet automatically, please add it manually using the details below.</p>' +
          '<div class="tn-man-r"><span data-i18n="hashdash.tn.manNet">Sepolia network</span><div><code>Chain ID ' + cfg.chainId + '</code></div></div>' +
          '<div class="tn-man-r"><span data-i18n="hashdash.tn.manRpc">RPC URL</span><div><code>' + (cfg.rpc || 'https://ethereum-sepolia-rpc.publicnode.com') + '</code><button type="button" data-cp="' + (cfg.rpc || 'https://ethereum-sepolia-rpc.publicnode.com') + '" data-i18n="hashdash.tn.manCopy">Copy</button></div></div>' +
          '<div class="tn-man-r"><span data-i18n="hashdash.tn.manEth">Sepolia ETH</span><div><em data-i18n="hashdash.tn.manEthV">Native currency of the Sepolia network. It has no contract address: it appears once your wallet is on Sepolia.</em></div></div>' +
          '<div class="tn-man-r"><span data-i18n="hashdash.tn.manTok">tSECT contract</span><div><code>' + cfg.token + '</code><button type="button" data-cp="' + cfg.token + '" data-i18n="hashdash.tn.manCopy">Copy</button></div>' +
            '<em data-i18n="hashdash.tn.manTokV">Symbol tSECT · 18 decimals · Sepolia network</em></div>' +
        '</div>' +
      '</div>' +
      '<div class="card tn-card">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px">' +
          '<span class="lbl" data-i18n="hashdash.tn.pending">Pending rewards</span>' +
          '<span class="pill" style="border-color:rgba(62,207,142,.28);color:var(--live)"><i class="dot"></i><span id="tnApy">25% APY</span></span>' +
        '</div>' +
        '<span class="big num" id="tnPending" style="font-variant-numeric:tabular-nums">0.000000</span>' +
        '<div style="margin:14px 0 16px">' +
          '<div class="row"><span class="lbl" data-i18n="hashdash.tn.myHash">Your hash power</span><b id="tnHash">—</b></div>' +
          '<div class="row"><span class="lbl" data-i18n="hashdash.tn.spent">tSECT spent on hash</span><b id="tnSpent">—</b></div>' +
          '<div class="row"><span class="lbl" data-i18n="hashdash.tn.perDay">Earning per day</span><b id="tnDay">—</b></div>' +
          '<div class="row"><span class="lbl" data-i18n="hashdash.tn.claimed">Claimed to date</span><b id="tnClaimed">—</b></div>' +
        '</div>' +
        '<button class="btn key" id="tnClaim" type="button" style="width:100%;padding:14px" disabled>' + tr('hashdash.tn.claim','Claim rewards') + '</button>' +
      '</div>';
    nodo.parentNode.insertBefore(head, nodo);
    nodo.parentNode.insertBefore(grid, nodo);
    /* invitacion del airdrop: el invitado confirma quien lo invito (ver "referidos" mas abajo) */
    const rf = document.createElement('div');
    rf.className = 'card tn-ref'; rf.id = 'tnRef'; rf.hidden = true;
    rf.innerHTML = '<span class="lbl" data-i18n="hashdash.ref.title">Airdrop invitation</span><div id="tnRefB"></div>';
    nodo.parentNode.insertBefore(rf, nodo);
    if(!document.getElementById('tnRefCss')){
      const st = document.createElement('style'); st.id = 'tnRefCss';
      st.textContent = '.tn-ref{margin:18px 0 0}.tn-ref .rf-h{display:block;margin-top:10px;font-size:17px;line-height:1.4;color:var(--ink)}' +
        '.tn-ref .rf-n{margin:6px 0 0;color:var(--ink3);font-size:13.5px;line-height:1.6;max-width:72ch}' +
        '.tn-ref .rf-a{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:14px}' +
        '.tn-ref .rf-a .btn{padding:12px 18px}.tn-ref .rf-ok{color:var(--live)}' +
        '.tn-ref form{display:flex;gap:8px;margin-top:12px;max-width:620px}' +
        '.tn-ref input{flex:1;min-width:0;padding:11px 12px;background:transparent;border:1px solid var(--rule);color:var(--ink);font:400 13px/1.2 "IBM Plex Mono",monospace;outline:none}' +
        '.tn-ref input:focus{border-color:var(--blue)}.tn-ref .rf-e{margin-top:8px;color:var(--amber);font-size:12.5px}' +
        '.tn-ref .rf-m{display:inline-block;margin-top:12px;color:var(--blue2);font-size:12.5px;text-decoration:underline;text-underline-offset:3px}';
      document.head.appendChild(st);
    }

    /* la tarjeta de APY de la red pasa a mostrar la tasa real de testnet */
    const apy = [...document.querySelectorAll('#network ~ .g3 .card')].find(c => c.querySelector('[data-i18n="hashdash.network.apy"]'));
    if(apy){
      const big = apy.querySelector('.big'); if(big){ big.id = 'tnApyBig'; big.textContent = '25%'; }
      const sub = apy.querySelector('[data-i18n="hashdash.network.apySub"]');
      if(sub) sub.setAttribute('data-i18n', 'hashdash.tn.apySub');
    }
    /* "A recompras" pasa de dolares simulados a tSECT quemados */
    const kb = q('#kBuy');
    if(kb){ const s = kb.parentNode.querySelector('.sub'); if(s) s.setAttribute('data-i18n','hashdash.tn.burnedSub'); }

    if(PREVIEW){
      const pv = document.createElement('div');
      pv.id = 'tnPreview';
      pv.setAttribute('role', 'status');
      /* banda fina encima de la cabecera: no choca con el boton de la guia del nodo */
      pv.style.cssText = 'position:relative;z-index:61;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;column-gap:9px;row-gap:2px;padding:6px 16px;' +
        'border-bottom:1px solid rgba(62,207,142,.22);background:rgba(62,207,142,.07);color:#3ecf8e;font:400 10px/1.4 "IBM Plex Mono",monospace;letter-spacing:.14em;text-transform:uppercase;text-align:center';
      const top = q('header.top');
      if(top) top.parentNode.insertBefore(pv, top); else document.body.prepend(pv);
    }

    if(window.SECTORA_APPLY_LANG) window.SECTORA_APPLY_LANG(window.SECTORA_CURRENT_LANG || 'en', { silent:true });

    q('#tnFaucet').onclick = reclamaFaucet;
    q('#tnAdd').onclick = anadeToken;
    /* copiar la RPC o el contrato del tSECT */
    grid.querySelectorAll('.tn-man [data-cp]').forEach(bt => bt.addEventListener('click', () => {
      const v = bt.getAttribute('data-cp');
      const ok = () => { bt.textContent = tr('hashdash.tn.manCopied','Copied'); setTimeout(() => { bt.textContent = tr('hashdash.tn.manCopy','Copy'); }, 1600); };
      (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(ok, () => window.prompt('', v));
    }));
    if(!document.getElementById('tnManCss')){
      const st = document.createElement('style'); st.id = 'tnManCss';
      st.textContent = '.tn-man{margin-top:18px;padding-top:16px;border-top:1px solid var(--hair)}.tn-man .note{margin:8px 0 8px;font:300 13.5px/1.6 "IBM Plex Sans",system-ui,sans-serif;letter-spacing:0;text-transform:none;color:var(--ink3)}' +
        '.tn-man-r{display:grid;grid-template-columns:minmax(0,130px) minmax(0,1fr);gap:4px 14px;align-items:start;padding:10px 0;border-top:1px solid var(--hair)}' +
        '.tn-man-r > span{font:400 9px/1.6 "IBM Plex Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--ink4)}' +
        '.tn-man-r > div{display:flex;align-items:center;gap:8px;min-width:0}' +
        '.tn-man-r code{flex:1;min-width:0;overflow-wrap:anywhere;font:400 12px/1.45 "IBM Plex Mono",monospace;color:var(--ink)}' +
        '.tn-man-r em{grid-column:2;font-style:normal;font-size:12.5px;line-height:1.5;color:var(--ink3)}.tn-man-r > div em{grid-column:auto}' +
        '.tn-man-r button{flex:none;padding:6px 9px;border:1px solid var(--rule);background:transparent;color:var(--ink2);cursor:pointer;font:400 9px/1 "IBM Plex Mono",monospace;letter-spacing:.14em;text-transform:uppercase}' +
        '.tn-man-r button:hover{color:var(--ink);border-color:var(--blue)}' +
        '@media (max-width:520px){.tn-man-r{grid-template-columns:1fr}.tn-man-r em{grid-column:1}}';
      document.head.appendChild(st);
    }
    q('#tnClaim').onclick = cobra;
  }

  /* ----------------------------------------------------------- lecturas */
  function pintaPreview(){
    const pv = q('#tnPreview');
    if(!pv) return;
    /* "Testnet online" a la vista; debajo, en pequeno, que los nodos simulados son de ejemplo */
    const t = tr('hashdash.tn.preview', 'Testnet online · incl. {n} example nodes').replace('{n}', PREVIEW).split(' · ');
    pv.textContent = '';
    const dot = document.createElement('i');
    dot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:#3ecf8e;box-shadow:0 0 0 3px rgba(62,207,142,.18);flex:none';
    const main = document.createElement('span'); main.textContent = t[0];
    pv.append(dot, main);
    if(t[1]){ const sub = document.createElement('span'); sub.textContent = t[1];
      sub.style.cssText = 'color:rgba(233,239,248,.45);letter-spacing:.04em;text-transform:none;font-size:10px'; pv.append(sub); }
  }

  function pintaApy(){
    const pct = (Math.round(APY * 1000) / 10).toString().replace(/\.0$/, '');
    const a = q('#tnApy'), b = q('#tnApyBig'), sub = q('#tnSub');
    if(a) a.textContent = pct + '% APY';
    if(b) b.textContent = pct + '%';
    if(sub) sub.textContent = tr('hashdash.tn.sub', '25% APY on the tSECT you spend on hash').replace(/25\s?%/, pct + '%');
    document.querySelectorAll('.tn-apy-v').forEach(el => { el.textContent = pct + '%'; });   /* guia "como funciona" */
  }

  /* nodos activados con el boton del Dashboard (sin Sepolia): los guarda la tarea "Nodos activados" de GitHub
     en nodos/activaciones.json. Se suman a los activos del registro de Sepolia, sin contar dos veces una wallet */
  function leeActivados(){
    return fetch('/nodos/activaciones.json?t=' + Math.floor(Date.now() / 3e5))
      .then(r => r.ok ? r.json() : null).then(j => (j && j.nodos) || {}).catch(() => ({}));
  }
  /* los activos del registro de Sepolia, por wallet (null si no se pudo leer) */
  async function activosRegistro(){
    try{
      const n = Number(await registryRO.validatorCount());
      const lote = await registryRO.getValidators(0, Math.min(n, 200));
      return lote.filter(v => v.active);
    }catch(e){ return null; }
  }

  async function leeRed(){
    try{ APY = Number(await marketRO.apyBps()) / 10000; }catch(e){}
    pintaApy();
    try{
      const [s, act, lista, nodos] = await Promise.all([marketRO.getStats(), registryRO.activeValidatorCount(), activosRegistro(), leeActivados()]);
      const enRegistro = new Set((lista || []).map(v => String(v.operator).toLowerCase()));
      /* sin la lista del registro no se puede saber quien ya esta contado: no se suma nada para no inflar */
      const nuevos = lista ? Object.keys(nodos).filter(w => !enRegistro.has(w)).length : 0;
      const val = Number(act) + nuevos + PREVIEW;
      const kv = q('#kVal'), mv = q('#mVal'), kh = q('#kHash'), kb = q('#kBuy');
      if(kv) kv.textContent = val.toLocaleString('en-US');
      if(mv) mv.textContent = val.toLocaleString('en-US');
      if(kh) kh.textContent = (Number(s.hashSold) + PREVIEW * PREVIEW_TH).toLocaleString('en-US');
      if(kb) kb.textContent = fmt(s.boughtBack + window.ethers.parseEther(String(PREVIEW * PREVIEW_SPENT * 0.8)));
      const mk = window.__sectoraMarket; if(mk) mk.setValid(val);
      /* en la vista previa el mapa cuenta los mismos nodos que el contador */
      if(PREVIEW){ window.__sectoraMapN = val.toLocaleString('en-US'); const mn = q('#mapN'); if(mn) mn.textContent = window.__sectoraMapN; }
    }catch(e){ /* sin red: se queda lo que hubiera */ }
  }

  async function pintaNodos(){
    if(typeof window.__sectoraMapAdd !== 'function') return;
    const [lista, nodos] = await Promise.all([activosRegistro(), leeActivados()]);
    const enRegistro = new Set();
    for(const v of lista || []){
      enRegistro.add(String(v.operator).toLowerCase());
      window.__sectoraMapAdd(Number(v.lonMicro) / 1e6, Number(v.latMicro) / 1e6, v.name);
    }
    /* y los activados con el boton del Dashboard que no estan ya en el registro */
    for(const [w, x] of Object.entries(nodos)){
      if(enRegistro.has(w) || !isFinite(x.lo) || !isFinite(x.la)) continue;
      window.__sectoraMapAdd(Number(x.lo), Number(x.la), x.n);
    }
  }

  let turno = 0;             /* solo vale la lectura mas reciente */
  async function leeCuenta(){
    const mio = ++turno;
    if(!acct){ me = null; pintaCuenta(); return; }
    try{
      const [bal, hash, spent, pend, day, cl, last, reg] = await Promise.all([
        tokenRO.balanceOf(acct), marketRO.hashPower(acct), marketRO.principal(acct),
        marketRO.pendingRewards(acct), marketRO.rewardsPerDay(acct), marketRO.claimed(acct),
        tokenRO.lastFaucetClaim(acct), registryRO.validatorIndexPlusOne(acct)
      ]);
      try{ const bl = await ro.getBlock('latest'); if(bl) desfase = Number(bl.timestamp) - Date.now() / 1000; }catch(e){}
      if(mio !== turno) return;   /* llego tarde: ya hay una lectura mas nueva */
      me = { bal, hash:Number(hash), spent, pend, day, cl, last:Number(last), reg:Number(reg) > 0, t0: Date.now() };
      /* el resto del panel trabaja con estas cifras */
      const w = window.__sectoraWallet;
      if(w && w.onBalance) w.onBalance(Number(window.ethers.formatEther(bal)));
      const mk = window.__sectoraMarket; if(mk) mk.setHash(me.hash);
    }catch(e){ if(mio !== turno) return; }
    pintaCuenta(); pintaRef();
  }

  function pintaCuenta(){
    const fb = q('#tnFaucet'), cb = q('#tnClaim');
    if(!fb) return;
    if(!acct || !me){
      fb.disabled = true; fb.textContent = tr('hashdash.tn.connectFirst','Connect wallet to claim');
      cb.disabled = true;
      ['#tnHash','#tnSpent','#tnDay','#tnClaimed','#tnBal'].forEach(s => q(s).textContent = '—');
      q('#tnPending').textContent = '0.000000';
      q('#tnFaucetNext').textContent = '';
      return;
    }
    q('#tnBal').textContent = fmt(me.bal, 2) + ' tSECT';
    q('#tnHash').textContent = me.hash.toLocaleString('en-US') + ' TH/s';
    q('#tnSpent').textContent = fmt(me.spent) + ' tSECT';
    q('#tnDay').textContent = fmt(me.day, 4) + ' tSECT';
    q('#tnClaimed').textContent = fmt(me.cl, 4) + ' tSECT';
    cb.disabled = ocupado || me.spent === 0n;
    cb.textContent = tr('hashdash.tn.claim','Claim rewards');
    pintaFaucet();
    const br = q('#bReg');
    if(br && me.reg){ br.disabled = true; br.textContent = tr('hashdash.node.registered','Registered'); }
    /* el plan del airdrop sabe si el nodo de esta wallet ya esta registrado */
    const mk = window.__sectoraMarket; if(mk && mk.setReg) mk.setReg(me.reg);
  }

  function pintaFaucet(){
    const fb = q('#tnFaucet'); if(!fb || !me) return;
    const falta = ((me.last + 86400) - (Date.now() / 1000 + desfase)) * 1000;
    if(me.last && falta > 0){
      fb.disabled = true;
      fb.textContent = tr('hashdash.tn.claimedToday','Claimed · come back tomorrow');
      const h = Math.floor(falta / 3.6e6), m = Math.floor((falta % 3.6e6) / 6e4);
      q('#tnFaucetNext').textContent = tr('hashdash.tn.next','Next claim in {h}h {m}m').replace('{h}', h).replace('{m}', m);
    }else{
      fb.disabled = ocupado;
      fb.textContent = tr('hashdash.tn.faucetBtn','Claim 5,000 tSECT');
      q('#tnFaucetNext').textContent = '';
    }
  }

  /* el pendiente sube en vivo entre lecturas: 25% anual sobre lo gastado */
  /* 4 veces por segundo basta para el contador; antes reescribia el texto en cada cuadro */
  let ticT = 0;
  function tic(now){
    if(now - ticT < 250){ requestAnimationFrame(tic); return; }
    ticT = now;
    const el = q('#tnPending');
    if(el && me){
      const seg = (Date.now() - me.t0) / 1000;
      const extra = Number(window.ethers.formatEther(me.spent)) * APY * seg / (365 * 86400);
      const v = Number(window.ethers.formatEther(me.pend)) + extra;
      el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
    }
    requestAnimationFrame(tic);
  }

  /* ----------------------------------------------------------- escritura */
  async function firmante(){
    const get = window.__sectoraEIP1193;
    const p = get && get();
    if(!p || !acct) throw new Error(tr('hashdash.tn.errConnect','Connect your wallet first'));
    let cid = await p.request({ method:'eth_chainId' });
    if(parseInt(cid, 16) !== cfg.chainId){
      try{ await p.request({ method:'wallet_switchEthereumChain', params:[{ chainId:'0x' + cfg.chainId.toString(16) }] }); }
      catch(e){ throw new Error(tr('hashdash.tn.errNetwork','Switch your wallet to the Sepolia test network')); }
    }
    const bp = new window.ethers.BrowserProvider(p);
    return bp.getSigner(acct);
  }

  function errorLegible(e){
    const m = (e && (e.shortMessage || e.reason || e.message)) || String(e);
    if(/user rejected|denied|ACTION_REJECTED|4001/i.test(m)) return tr('hashdash.tn.errRejected','Transaction cancelled in your wallet');
    if(/cooldown/i.test(m)) return tr('hashdash.tn.claimedToday','Claimed · come back tomorrow');
    if(/insufficient funds/i.test(m)){ if(window.SectoraGas) setTimeout(window.SectoraGas.open, 700); return tr('hashdash.tn.errGas','You need a little Sepolia ETH for gas'); }
    if(/reserve empty/i.test(m)) return tr('hashdash.tn.errReserve','Reward reserve is being refilled, try again later');
    if(/not enough hash/i.test(m)) return tr('hashdash.toast.needHash','Not enough hash power to register');
    return m.length > 140 ? m.slice(0, 140) + '…' : m;
  }

  async function conBloqueo(fn){
    if(ocupado) return;
    ocupado = true; pintaCuenta(); pintaRef();
    try{ await fn(); }
    catch(e){ toast(errorLegible(e)); }
    finally{ ocupado = false; await leeCuenta(); leeRed(); pintaRef(); }
  }

  function reclamaFaucet(){
    return conBloqueo(async () => {
      const s = await firmante();
      const tk = new window.ethers.Contract(cfg.token, TOKEN_ABI, s);
      toast(tr('hashdash.tn.confirm','Confirm in your wallet…'));
      const tx = await tk.faucet();
      toast(tr('hashdash.tn.waiting','Waiting for the network…'));
      await tx.wait();
      toast(tr('hashdash.tn.faucetOk','5,000 tSECT added to your wallet'));
    });
  }

  /* añade tSECT a la lista de tokens de la wallet (EIP-747) */
  async function anadeToken(){
    const get = window.__sectoraEIP1193, p = get && get();
    if(!p){ toast(tr('hashdash.tn.errConnect','Connect your wallet first')); return; }
    try{
      const ok = await p.request({ method:'wallet_watchAsset', params:{ type:'ERC20',
        options:{ address: cfg.token, symbol:'tSECT', decimals:18, image: location.origin + '/icons/v2/icon-192.png' } } });
      if(ok) toast(tr('hashdash.tn.addOk','tSECT added to your wallet'));
    }catch(e){ toast(errorLegible(e)); }
  }

  function cobra(){
    return conBloqueo(async () => {
      const s = await firmante();
      const mk = new window.ethers.Contract(cfg.hashMarket, MARKET_ABI, s);
      toast(tr('hashdash.tn.confirm','Confirm in your wallet…'));
      const tx = await mk.claim();
      toast(tr('hashdash.tn.waiting','Waiting for the network…'));
      await tx.wait();
      toast(tr('hashdash.tn.claimOk','Rewards claimed'));
    });
  }

  function compra(){
    const pick = window.__sectoraMarket && window.__sectoraMarket.pick();
    if(!pick) return;
    const id = (pick.kind === 0 ? 0 : 3) + pick.sel;
    return conBloqueo(async () => {
      const s = await firmante();
      const mk = new window.ethers.Contract(cfg.hashMarket, MARKET_ABI, s);
      const tk = new window.ethers.Contract(cfg.token, TOKEN_ABI, s);
      const pkg = await marketRO.packages(id);
      const bal = await tokenRO.balanceOf(acct);
      if(bal < pkg.priceInToken){ toast(tr('hashdash.toast.noFunds','Not enough tSECT') + ' · ' + tr('hashdash.tn.useFaucet','claim from the faucet')); return; }
      const al = await tokenRO.allowance(acct, cfg.hashMarket);
      if(al < pkg.priceInToken){
        toast(tr('hashdash.tn.approve','Step 1 of 2 · approve tSECT in your wallet'));
        await (await tk.approve(cfg.hashMarket, pkg.priceInToken)).wait();
      }
      toast(tr('hashdash.tn.buyConfirm','Step 2 of 2 · confirm the purchase'));
      const tx = await mk.purchase(id);
      toast(tr('hashdash.tn.waiting','Waiting for the network…'));
      await tx.wait();
      toast(tr('hashdash.toast.purchased','{h} TH/s purchased · {b} tSECT to buybacks')
        .replace('{h}', Number(pkg.hashPower)).replace('{b}', fmt(pkg.priceInToken * 8n / 10n)));
    });
  }

  function registra(){
    const n = q('#nName').value.trim();
    if(!n){ toast(tr('hashdash.toast.needName','Give the node a name')); q('#nName').focus(); return; }
    const la = parseFloat(q('#nLat').value), lo = parseFloat(q('#nLon').value);
    if(!isFinite(la) || la < -85 || la > 85){ toast(tr('hashdash.toast.badLat','Latitude must be between -85 and 85')); q('#nLat').focus(); return; }
    if(!isFinite(lo) || lo < -180 || lo > 180){ toast(tr('hashdash.toast.badLon','Longitude must be between -180 and 180')); q('#nLon').focus(); return; }
    return conBloqueo(async () => {
      const s = await firmante();
      const rg = new window.ethers.Contract(cfg.registry, REGISTRY_ABI, s);
      toast(tr('hashdash.tn.confirm','Confirm in your wallet…'));
      /* si llego con un link de invitacion, el padrino viaja al final de este mismo registro (el contrato
         ignora esos bytes): queda confirmado sin firmar nada mas */
      const yo = (await s.getAddress()).toLowerCase(), pad = refLee();
      const conRef = !!pad && pad !== yo && !(refEst.cuenta === yo && refEst.hecho);
      const args = [n.slice(0, 64), Math.round(la * 1e6), Math.round(lo * 1e6)];
      let tx;
      if(conRef){
        const p = await rg.register.populateTransaction(...args);
        p.data += REF_TAG + pad.slice(2);
        tx = await s.sendTransaction(p);
      } else tx = await rg.register(...args);
      toast(tr('hashdash.tn.waiting','Waiting for the network…'));
      await tx.wait();
      if(conRef){ refEst = { cuenta: yo, hecho: { to: pad, tx: tx.hash }, leido: true }; pintaRef(); }
      if(typeof window.__sectoraMapAdd === 'function') window.__sectoraMapAdd(lo, la, n);
      if(typeof window.__sectoraAddNode === 'function') window.__sectoraAddNode(lo, la);
      toast(tr('hashdash.toast.registered','Node "{n}" registered · live on the network map').replace('{n}', n));
    });
  }

  /* ----------------------------------------------------------- referidos
     El link de invitacion (/airdrop/?ref=0x… o /dashboard.html?ref=0x…) deja al padrino guardado en este
     navegador. Aqui el invitado lo confirma enviando 0,0001 tSECT (de prueba) a su padrino: queda en la red,
     solo el propio invitado puede hacerlo y vale la primera. Las reglas del bono estan en airdrop/count.js. */
  /* referidos ocultos por ahora: la tarjeta no se muestra y el ?ref no se pone en la direccion.
     El link se sigue guardando y, si lo hay, viaja al registrar el nodo, como antes */
  const REF_ON = false;
  const REF_KEY = 'sectora:ref', REF_MARK = 10n ** 14n, REF_SINCE = Date.UTC(2026, 9, 28) / 1000, REF_TAG = '5ec7a4ef';
  const T_TR = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  const T_REG = '0xa99a387835fe9175c623942eef94297ff971af8cb2893a2f6bfdd49ecb828aaf';   // ValidatorRegistered
  const T_UPD = '0xc2d41a2c5080290dc5fce01cd3232300d606ae866d8685d46b8ba3814adc5823';   // ValidatorUpdated
  const refDir = v => { const m = /0x[0-9a-fA-F]{40}/.exec(String(v || '')); return m ? m[0].toLowerCase() : ''; };
  const refLee = () => { try{ return refDir(localStorage.getItem(REF_KEY)); }catch(e){ return ''; } };
  const refGuarda = a => { try{ localStorage.setItem(REF_KEY, a); }catch(e){} };
  const corto = a => a.slice(0, 6) + '…' + a.slice(-4);
  /* el link puede traer ?ref=; y si ya habia uno guardado, se pone en la direccion para que viaje
     al abrir el dashboard dentro de la app de una wallet (otro navegador, otra memoria) */
  (() => {
    try{
      const u = new URL(location.href), r = refDir(u.searchParams.get('ref'));
      if(r) refGuarda(r);
      else if(REF_ON && refLee()){ u.searchParams.set('ref', refLee()); history.replaceState(history.state, '', u.toString()); }
    }catch(e){}
  })();
  let refEst = { cuenta: '', hecho: null, leido: false };
  /* la primera constancia de esta wallet: su registro de nodo con el padrino al final, o una transferencia
     de 0,0001 tSECT a otra wallet (la que llego antes a la red) */
  async function refBusca(a){
    const fin = await ro.getBlockNumber(), yo = a.toLowerCase();
    const ini = Math.max(0, fin - Math.ceil((Date.now() / 1000 - REF_SINCE) / 12) - 2000);
    const tema = window.ethers.zeroPadValue(a, 32), ok = to => to !== yo && !/^0x0{40}$/.test(to);
    const antes = (x, y) => !y || x.bn < y.bn || (x.bn === y.bn && x.li < y.li);
    let tr1 = null, rg1 = null;
    for(let x = ini; x <= fin && !tr1 && !rg1; x += 45000){
      const hasta = Math.min(fin, x + 44999);
      if(!tr1){
        const l = await ro.getLogs({ address: cfg.token, topics: [T_TR, tema], fromBlock: x, toBlock: hasta });
        for(const g of l){
          if(g.topics.length !== 3 || !g.data || g.data === '0x' || BigInt(g.data) !== REF_MARK) continue;
          const to = '0x' + g.topics[2].slice(26).toLowerCase();
          if(ok(to)){ tr1 = { to, tx: g.transactionHash, bn: g.blockNumber, li: g.index }; break; }
        }
      }
      if(!rg1){
        const l = await ro.getLogs({ address: cfg.registry, topics: [[T_REG, T_UPD], tema], fromBlock: x, toBlock: hasta });
        for(const g of l){
          const t = await ro.getTransaction(g.transactionHash);
          const d = t && t.data ? t.data.toLowerCase() : '', k = d.length - 48;
          if(!t || (t.from || '').toLowerCase() !== yo || (t.to || '').toLowerCase() !== cfg.registry.toLowerCase()) continue;
          if(k < 10 || (k - 10) % 64 || d.slice(k, k + 8) !== REF_TAG) continue;
          const to = '0x' + d.slice(k + 8);
          if(ok(to)){ rg1 = { to, tx: g.transactionHash, bn: g.blockNumber, li: g.index }; break; }
        }
      }
    }
    if(tr1 && rg1) return antes(tr1, rg1) ? tr1 : rg1;
    return tr1 || rg1;
  }
  async function refCarga(){
    const a = acct; if(!a) return;
    refEst = { cuenta: a.toLowerCase(), hecho: null, leido: false }; pintaRef();
    let h = null; try{ h = await refBusca(a); }catch(e){ h = null; }
    if(!acct || acct.toLowerCase() !== a.toLowerCase()) return;
    refEst = { cuenta: a.toLowerCase(), hecho: h, leido: true }; pintaRef();
  }
  const conNodo = () => !!(me && me.reg);
  function pintaRef(){
    const c = q('#tnRef'), b = q('#tnRefB');
    if(!REF_ON){ if(c) c.hidden = true; return; }
    if(!c || !b) return;
    if(!acct){ c.hidden = true; return; }
    c.hidden = false;
    const me = acct.toLowerCase(), pend = refLee();
    const mio = '<a class="rf-m" href="/airdrop/#my">' + tr('hashdash.ref.mine','Invite friends and earn: get your link in My airdrop ↗') + '</a>';
    if(refEst.cuenta !== me || !refEst.leido){ b.innerHTML = '<p class="rf-n">' + tr('hashdash.tn.waiting','Waiting for the network…') + '</p>'; return; }
    if(refEst.hecho){
      b.innerHTML = '<span class="rf-h rf-ok"></span><p class="rf-n"></p>' + mio;
      b.querySelector('.rf-h').textContent = '✓ ' + tr('hashdash.ref.done','Invitation recorded · invited by {a}').replace('{a}', corto(refEst.hecho.to));
      b.querySelector('.rf-n').textContent = tr('hashdash.ref.doneSub','Saved on the network. It can\'t be changed.');
      return;
    }
    /* sin nodo todavia: el padrino viaja solo al registrarlo, sin firmar nada mas */
    if(pend && pend !== me && !conNodo()){
      b.innerHTML = '<span class="rf-h"></span><p class="rf-n"></p>' + mio;
      b.querySelector('.rf-h').textContent = tr('hashdash.ref.by','{a} invited you to Airdrop Genesis').replace('{a}', corto(pend));
      b.querySelector('.rf-n').textContent = tr('hashdash.ref.auto','It\'s confirmed automatically when you register your Hash Node. Nothing else to do, and you keep your whole airdrop.');
      return;
    }
    if(pend && pend !== me){
      b.innerHTML = '<span class="rf-h"></span><p class="rf-n"></p><div class="rf-a"><button class="btn key" type="button" id="tnRefGo"></button></div>' + mio;
      b.querySelector('.rf-h').textContent = tr('hashdash.ref.by','{a} invited you to Airdrop Genesis').replace('{a}', corto(pend));
      b.querySelector('.rf-n').textContent = tr('hashdash.ref.note','Confirm it so your sponsor gets their bonus. It\'s free: you send 0.0001 tSECT (test token) and you keep your whole airdrop.');
      const g = q('#tnRefGo'); g.textContent = tr('hashdash.ref.btn','Confirm invitation'); g.disabled = ocupado; g.onclick = refConfirma;
      return;
    }
    b.innerHTML = '<span class="rf-h"></span><form><input name="r" placeholder="sectoraorg.com/airdrop/?ref=0x…" autocomplete="off" spellcheck="false"><button class="btn" type="submit"></button></form><p class="rf-e" hidden></p>' + mio;
    b.querySelector('.rf-h').textContent = tr('hashdash.ref.ask','Did someone invite you? Paste their invite link');
    b.querySelector('button').textContent = tr('hashdash.ref.save','Save');
    const e = b.querySelector('.rf-e');
    if(pend === me){ e.hidden = false; e.textContent = tr('hashdash.ref.self','You can\'t invite yourself'); }
    b.querySelector('form').onsubmit = ev => {
      ev.preventDefault();
      const r = refDir(ev.target.r.value);
      if(!r){ e.hidden = false; e.textContent = tr('hashdash.ref.bad','That link or address isn\'t valid'); return; }
      if(r === me){ e.hidden = false; e.textContent = tr('hashdash.ref.self','You can\'t invite yourself'); return; }
      refGuarda(r); pintaRef();
    };
  }
  function refConfirma(){
    const to = refLee();
    if(!to || !acct || to === acct.toLowerCase()) return;
    return conBloqueo(async () => {
      if(me && me.bal < REF_MARK){ toast(tr('hashdash.ref.needT','First claim tSECT from the faucet')); return; }
      const s = await firmante();
      const tk = new window.ethers.Contract(cfg.token, ['function transfer(address,uint256) returns (bool)'], s);
      toast(tr('hashdash.tn.confirm','Confirm in your wallet…'));
      const tx = await tk.transfer(window.ethers.getAddress(to), REF_MARK);
      toast(tr('hashdash.tn.waiting','Waiting for the network…'));
      await tx.wait();
      refEst = { cuenta: acct.toLowerCase(), hecho: { to, tx: tx.hash }, leido: true };
      toast(tr('hashdash.ref.ok','Invitation confirmed'));
      pintaRef();
    });
  }

  /* ------------------------------------------------------------ arranque */
  async function arranca(){
    const demo = () => document.dispatchEvent(new CustomEvent('sectora:demo'));
    try{ cfg = await (await fetch(CFG_URL, { cache:'no-store' })).json(); }catch(e){ demo(); return; }
    const dirs = [cfg && cfg.token, cfg && cfg.hashMarket, cfg && cfg.registry];
    if(!dirs.every(d => typeof d === 'string' && /^0x[0-9a-fA-F]{40}$/.test(d) && !ZERO.test(d))){ demo(); return; }   /* modo demo */
    cfg.chainId = Number(cfg.chainId || 11155111);
    window.__SECT_TESTNET = cfg;
    /* hasta la primera lectura de la cadena, guion: nunca cifras de demo */
    ['#kVal','#mVal','#kHash','#kBuy'].forEach(s => { const el = q(s); if(el) el.textContent = '—'; });
    await cargaEthers();
    const net = window.ethers.Network.from(cfg.chainId);
    /* nodos publicos de Sepolia: si el primero no responde en ese movil o
       esa red, se prueba el siguiente; las lecturas nunca se quedan sin datos */
    const RPCS = [cfg.rpc || 'https://ethereum-sepolia-rpc.publicnode.com',
                  'https://sepolia.drpc.org', 'https://1rpc.io/sepolia', 'https://rpc.sepolia.org']
                 .filter((u, i, a) => u && a.indexOf(u) === i);
    const conecta = u => {
      ro = new window.ethers.JsonRpcProvider(u, net, { staticNetwork: net, cacheTimeout: -1 });
      tokenRO = new window.ethers.Contract(cfg.token, TOKEN_ABI, ro);
      marketRO = new window.ethers.Contract(cfg.hashMarket, MARKET_ABI, ro);
      registryRO = new window.ethers.Contract(cfg.registry, REGISTRY_ABI, ro);
    };
    const prueba = u => { const pr = new window.ethers.JsonRpcProvider(u, net, { staticNetwork: net });
      return Promise.race([pr.getBlockNumber(), new Promise((_, mal) => setTimeout(() => mal(new Error('lento')), 5000))]); };
    let elegido = RPCS[0];
    for(const u of RPCS){ try{ await prueba(u); elegido = u; break; }catch(e){} }
    conecta(elegido);

    montaUI();
    const bb = q('#bBuy'); if(bb) bb.onclick = compra;
    const br = q('#bReg'); if(br) br.onclick = registra;

    /* la capa de cartera avisa al conectar y desconectar */
    const w = window.__sectoraWallet;
    if(w){
      const oc = w.onConnect, od = w.onDisconnect;
      w.onConnect = (dir, bal) => { oc && oc(dir, bal); const otra = !acct || acct.toLowerCase() !== dir.toLowerCase(); acct = dir; leeCuenta(); if(otra) refCarga(); };
      w.onDisconnect = () => { od && od(); acct = null; me = null; pintaCuenta(); pintaRef(); };
      const get = window.__sectoraCuenta; if(get && get()){ acct = get(); refCarga(); }
    }

    leeRed(); pintaNodos(); leeCuenta();
    setInterval(leeRed, 30000);
    setInterval(() => { if(acct && !ocupado) leeCuenta(); }, 20000);
    setInterval(pintaFaucet, 30000);
    pintaPreview();
    document.addEventListener('sectora:langchange', () => { pintaCuenta(); pintaApy(); pintaPreview(); pintaRef(); });
    requestAnimationFrame(tic);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca);
  else arranca();
})();
