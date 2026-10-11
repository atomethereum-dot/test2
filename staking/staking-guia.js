/* ---- Sectora Staking: la guia paso a paso (#guide).

   - Los ocho pasos entran al llegar, como los del Hash Market.
   - El paso que se esta leyendo (el que cruza la linea del 45 % de la
     pantalla) se marca, y el seguidor fijo de la izquierda lo repite:
     numero, titulo, ocho tramos y lo que se vera en la wallet en ese paso.
   - En el movil el seguidor es una barra fija en lo alto de la seccion.
   Solo lee posiciones medidas al cargar y al cambiar de tamano. ---- */
(function () {
  "use strict";

  const sec = document.getElementById("guide");
  if (!sec) return;
  const $ = (id) => document.getElementById(id);
  const pasos = Array.from(sec.querySelectorAll(".gd-step"));
  const nEl = $("gd-n"), ttEl = $("gd-tt"), filas = $("gd-rows"), segs = Array.from(sec.querySelectorAll("#gd-segs i"));
  const bn = $("gd-bn"), bt = $("gd-bt"), bf = $("gd-bf");
  const contrato = "0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0";

  // lo que se ve en la wallet (o en la pagina) en cada paso
  const VER = [
    [["Where", "Uniswap · Ethereum"], ["Swap", "USDT → #SECT"], ["Keep", "A little ETH for fees"]],
    [["Address", "sectoraorg.com/staking"], ["Browser", "Chrome, Safari or your wallet’s"]],
    [["Button", "Connect wallet"], ["Phone", "Approve in the app, come back"], ["Computer", "Extension or QR code"]],
    [["Button", "Your address, 0x…"], ["Console", "Mainnet"], ["If not", "Switch to Ethereum"]],
    [["Field", "You deposit"], ["Preview", "Second · day · month · year"]],
    [["Request", "Approve · spending cap"], ["Amount", "The exact #SECT you typed"], ["Spender", contrato]],
    [["Request", "Deposit"], ["Contract", contrato], ["Starts", "Earning that same second"]],
    [["Buttons", "Claim · Withdraw · Withdraw all"], ["Confirmations", "One each"], ["Lock-up", "None"]],
  ];
  const titulo = (li) => (li.querySelector("h3") || {}).textContent || "";

  // entrada de cada paso al asomar
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("vis"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -12% 0px" });
    pasos.forEach((li) => io.observe(li));
  } else pasos.forEach((li) => li.classList.add("vis"));

  // ---------------------------------------------------------------
  // paso activo
  // ---------------------------------------------------------------
  let tops = [], activo = -1, cola = false, cerca = false;
  function medir() {
    tops = pasos.map((li) => li.getBoundingClientRect().top + window.scrollY);
    activo = -1;
    pedir();
  }

  function pintarFilas(i) {
    if (!filas) return;
    filas.textContent = "";
    VER[i].forEach(([k, v]) => {
      const d = document.createElement("div");
      const dt = document.createElement("dt"); dt.className = "mono"; dt.textContent = k;
      const dd = document.createElement("dd"); dd.className = "mono"; dd.textContent = v;
      d.append(dt, dd); filas.appendChild(d);
    });
    filas.classList.remove("cambia"); void filas.offsetWidth; filas.classList.add("cambia");
  }

  function cuadro() {
    cola = false;
    if (!cerca || !tops.length) return;
    const linea = window.scrollY + window.innerHeight * 0.45;
    let i = 0;
    for (let k = 0; k < tops.length; k++) if (tops[k] <= linea) i = k;
    if (i === activo) return;
    activo = i;
    pasos.forEach((li, k) => li.classList.toggle("act", k === i));
    const n = String(i + 1).padStart(2, "0");
    if (nEl) nEl.textContent = n;
    if (ttEl) ttEl.textContent = titulo(pasos[i]);
    segs.forEach((s, k) => { s.classList.toggle("on", k < i); s.classList.toggle("now", k === i); });
    pintarFilas(i);
    if (bn) bn.textContent = n;
    if (bt) bt.textContent = titulo(pasos[i]);
    if (bf) bf.style.width = ((i + 1) * 12.5) + "%";
  }
  function pedir() { if (!cola) { cola = true; requestAnimationFrame(cuadro); } }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => { cerca = es[0].isIntersecting; if (cerca) pedir(); }, { rootMargin: "100px 0px" }).observe(sec);
  } else cerca = true;
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", medir);
  window.addEventListener("load", medir);
  if ("ResizeObserver" in window) new ResizeObserver(medir).observe(document.body);
  medir();
})();
