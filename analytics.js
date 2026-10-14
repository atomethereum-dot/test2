/* Google Analytics 4 de sectoraorg.com.
   Solo se carga si el visitante acepto la analitica en el aviso de cookies
   de la portada ("Accept all"). La eleccion se guarda en localStorage
   ('sectora:consent'), que comparten todas las paginas del dominio, asi que
   una vez aceptada se mide en cualquier pagina. Si el visitante la retira
   desde el pie, el envio se corta en ese mismo momento. */
(function(){
  var ID = 'G-GH62720QZH';
  var cargado = false;

  function acepta(){
    try{
      var g = JSON.parse(localStorage.getItem('sectora:consent') || 'null');
      return !!(g && g.estado === 'all');
    }catch(e){ return false; }
  }

  function cargar(){
    window['ga-disable-' + ID] = false;
    if(cargado) return;
    cargado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  if(acepta()) cargar();
  addEventListener('sectora:consent', function(e){
    if(e.detail && e.detail.analytics) cargar();
    else window['ga-disable-' + ID] = true;
  });

  /* clics de compra: los enlaces a Uniswap son la compra real de $SECT */
  function clic(e){
    if(!cargado || window['ga-disable-' + ID]) return;
    if(e.type === 'auxclick' && e.button !== 1) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if(!a) return;
    var href = a.href, evento = null;
    if(/(^|\.)app\.uniswap\.org\//.test(href.replace(/^https?:\/\//,''))) evento = 'buy_click';
    else if(/sectoraorg\.com\/dex|\/dex(\.html)?(\?|#|$)/.test(href)) evento = 'dex_open';
    if(!evento) return;
    var zona = a.id || ((a.closest('section[id]') || {}).id) || '';
    window.gtag('event', evento, {
      link_url: href.slice(0, 100),
      link_text: (a.textContent || '').replace(/\s+/g,' ').trim().slice(0, 60),
      zona: zona,
      pagina: location.pathname
    });
  }
  document.addEventListener('click', clic, true);
  document.addEventListener('auxclick', clic, true);
})();
