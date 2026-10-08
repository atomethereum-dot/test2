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
      pv.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:80;padding:9px 13px;border:1px solid rgba(232,180,92,.45);' +
        'background:rgba(10,13,19,.92);color:var(--amber);font:400 10.5px/1.4 "IBM Plex Mono",monospace;letter-spacing:.14em;text-transform:uppercase';
      document.body.appendChild(pv);
    }

    if(window.SECTORA_APPLY_LANG) window.SECTORA_APPLY_LANG(window.SECTORA_CURRENT_LANG || 'en', { silent:true });

    q('#tnFaucet').onclick = reclamaFaucet;
    q('#tnAdd').onclick = anadeToken;
    q('#tnClaim').onclick = cobra;
  }

  /* ----------------------------------------------------------- lecturas */
  function pintaPreview(){
    const pv = q('#tnPreview');
    if(pv) pv.textContent = tr('hashdash.tn.preview', 'Preview · {n} simulated validators').replace('{n}', PREVIEW);
  }

  function pintaApy(){
    const pct = (Math.round(APY * 1000) / 10).toString().replace(/\.0$/, '');
    const a = q('#tnApy'), b = q('#tnApyBig'), sub = q('#tnSub');
    if(a) a.textContent = pct + '% APY';
    if(b) b.textContent = pct + '%';
    if(sub) sub.textContent = tr('hashdash.tn.sub', '25% APY on the tSECT you spend on hash').replace(/25\s?%/, pct + '%');
    document.querySelectorAll('.tn-apy-v').forEach(el => { el.textContent = pct + '%'; });   /* guia "como funciona" */
  }

  async function leeRed(){
    try{ APY = Number(await marketRO.apyBps()) / 10000; }catch(e){}
    pintaApy();
    try{
      const [s, act] = await Promise.all([marketRO.getStats(), registryRO.activeValidatorCount()]);
      const val = Number(act) + PREVIEW;
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
    try{
      const n = Number(await registryRO.validatorCount());
      const lote = await registryRO.getValidators(0, Math.min(n, 200));
      for(const v of lote){
        if(!v.active) continue;
        window.__sectoraMapAdd(Number(v.lonMicro) / 1e6, Number(v.latMicro) / 1e6, v.name);
      }
    }catch(e){}
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
    pintaCuenta();
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
  function tic(){
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
    if(/insufficient funds/i.test(m)) return tr('hashdash.tn.errGas','You need a little Sepolia ETH for gas');
    if(/reserve empty/i.test(m)) return tr('hashdash.tn.errReserve','Reward reserve is being refilled, try again later');
    if(/not enough hash/i.test(m)) return tr('hashdash.toast.needHash','Not enough hash power to register');
    return m.length > 140 ? m.slice(0, 140) + '…' : m;
  }

  async function conBloqueo(fn){
    if(ocupado) return;
    ocupado = true; pintaCuenta();
    try{ await fn(); }
    catch(e){ toast(errorLegible(e)); }
    finally{ ocupado = false; await leeCuenta(); leeRed(); }
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
      const tx = await rg.register(n.slice(0, 64), Math.round(la * 1e6), Math.round(lo * 1e6));
      toast(tr('hashdash.tn.waiting','Waiting for the network…'));
      await tx.wait();
      if(typeof window.__sectoraMapAdd === 'function') window.__sectoraMapAdd(lo, la, n);
      if(typeof window.__sectoraAddNode === 'function') window.__sectoraAddNode(lo, la);
      toast(tr('hashdash.toast.registered','Node "{n}" registered · live on the network map').replace('{n}', n));
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
      w.onConnect = (dir, bal) => { oc && oc(dir, bal); acct = dir; leeCuenta(); };
      w.onDisconnect = () => { od && od(); acct = null; me = null; pintaCuenta(); };
      const get = window.__sectoraCuenta; if(get && get()){ acct = get(); }
    }

    leeRed(); pintaNodos(); leeCuenta();
    setInterval(leeRed, 30000);
    setInterval(() => { if(acct && !ocupado) leeCuenta(); }, 20000);
    setInterval(pintaFaucet, 30000);
    pintaPreview();
    document.addEventListener('sectora:langchange', () => { pintaCuenta(); pintaApy(); pintaPreview(); });
    requestAnimationFrame(tic);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranca);
  else arranca();
})();
