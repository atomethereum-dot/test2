/* ---- Sectora Staking: cableado real de la pagina de staking.

   Va en un archivo aparte y no dentro de staking.js a proposito: aquel son
   16 KB de lienzos, anillos y graficas que funcionan, y mezclar la cadena
   ahi dentro solo anade riesgo. Este modulo se limita a tomar el control de
   lo que deja de ser simulado.

   CONTRACTS empieza con direcciones a cero, igual que dashboard-hashmarket.js.
   Mientras esten a cero el modulo NO toca nada: la pagina se queda tal cual
   esta hoy, con su vista previa simulada. En cuanto se peguen las direcciones
   desplegadas, este archivo toma el mando y no hace falta cambiar nada mas.

   Depende solo de ../ethers.min.js. La conexion de cartera va aqui dentro
   porque dashboard-wallet.js no sirve en esta pagina: arranca con
   "if (!root || !btn) return" sobre el widget del panel, que aqui no existe,
   asi que nunca llega a definir window.SectoraWallet. Traer ese widget y su
   CSS a esta pagina seria mas codigo y le cambiaria el diseno; se usa el
   boton que la pagina ya tiene. Si algun dia SectoraWallet existiera aqui,
   se prefiere ese.
---- */
(function () {
  "use strict";

  const CONTRACTS = {
    // MAINNET: aqui se mueve #SECT de verdad
    chainId: "0x1", // Ethereum mainnet
    token: "0x8C9984B06281f1CA9416e493c2E602AaB08513db", // #SECT
    staking: "0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0", // SectoraHolderRewards, desplegado el 9 oct 2026
  };

  // nodos publicos de mainnet para leer la tasa y el programa sin wallet
  const RPCS = ["https://ethereum-rpc.publicnode.com", "https://eth.drpc.org", "https://1rpc.io/eth"];

  const TOKEN_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)",
  ];

  // SectoraHolderRewards: 14,9% APY al arrancar (ajustable por el dueño con
  // setRate), sin bloqueo, cobro libre, sin tope de depositos.
  // Ver contracts/DEPLOY_HOLDER_REWARDS.md
  const STAKING_ABI = [
    "function deposit(uint256 amount)",
    "function withdraw(uint256 amount)",
    "function claim()",
    "function earned(address) view returns (uint256)",
    "function accountView(address) view returns (uint256 deposited, uint256 claimable, uint256 walletBalance, uint256 allowance)",
    "function poolView() view returns (uint256 deposited, uint256 pool, uint256 rate, bool paused, bool depositsClosed, uint256 depositors, uint256 chainTime)",
    "function token() view returns (address)",
  ];

  const ZERO = "0x0000000000000000000000000000000000000000";
  const desplegado = CONTRACTS.token !== ZERO && CONTRACTS.staking !== ZERO;

  /* El estado de la pagina cuelga de esta unica clase. Sin ella el marcado
     dice la verdad de hoy: el contrato no esta desplegado, no se puede
     depositar y el boton no hace nada. Al pegar la direccion de arriba, la
     clase aparece y con ella el texto de "en vivo". Asi no hay una lista de
     sitios que acordarse de cambiar el dia del despliegue: es una linea. */
  if (desplegado) document.documentElement.classList.add("cadena-viva");

  // Sin direcciones no hay nada que cablear: se deja la vista previa intacta
  // en vez de dejar la pagina a medias con botones que no responden.
  if (!desplegado) {
    console.info(
      "[sectora] staking on-chain inactivo: faltan direcciones en CONTRACTS. " +
      "La pagina sigue en modo vista previa."
    );
    return;
  }

  if (typeof ethers === "undefined") {
    console.warn("[sectora] falta ethers.js; el staking sigue en vista previa");
    return;
  }

  // Dentro de un iframe de otra web no se conecta nada: evita que alguien
  // la incruste y haga pulsar botones encima (clickjacking).
  if (window.top !== window.self) {
    console.warn("[sectora] pagina incrustada en otra web: staking desactivado");
    return;
  }

  // Direcciones con checksum valido o no se arranca: un caracter mal pegado
  // no puede llegar nunca a una aprobacion.
  try {
    if (ethers.getAddress(CONTRACTS.staking) !== CONTRACTS.staking ||
        ethers.getAddress(CONTRACTS.token) !== CONTRACTS.token) throw new Error("checksum");
  } catch (e) {
    console.error("[sectora] direccion de CONTRACTS invalida o sin checksum", e);
    return;
  }

  // ---------------------------------------------------------------
  // estado
  // ---------------------------------------------------------------

  let proveedor = null;   // BrowserProvider
  let firmante = null;
  let cuenta = null;
  let token = null;
  let staking = null;
  let refrescoId = null;

  const $ = (id) => document.getElementById(id);
  let btn = $("connectBtn");
  const entrada = $("sectIn");
  let elStaked = $("lvStaked");
  let elStakers = $("lvStakers");

  // #SECT es de 18 decimales (confirmado). Aun asi se leen del token en vez
  // de fijarlos: cuesta una llamada, da igual con cualquier valor, y si algun
  // dia este modulo apunta a otro token no hay nada que recordar cambiar.
  const fmt = (v, dec) =>
    Number(ethers.formatUnits(v, decimales)).toLocaleString("en-US", {
      maximumFractionDigits: dec === undefined ? 2 : dec,
    });

  function aviso(texto, error) {
    let caja = $("chainMsg");
    if (!caja) {
      caja = document.createElement("p");
      caja.id = "chainMsg";
      caja.style.cssText =
        "margin:12px 0 0;font-family:'IBM Plex Mono',monospace;font-size:11px;" +
        "letter-spacing:.08em;text-transform:uppercase;";
      if (btn && btn.parentNode) btn.parentNode.appendChild(caja);
    }
    caja.style.color = error ? "#ff6e7c" : "#9aa4b2";
    caja.textContent = texto || "";
  }

  /** Traduce un fallo de cadena a algo que una persona pueda leer. */
  function explicar(e) {
    const m = (e && (e.shortMessage || e.reason || e.message)) || "";
    if (/user rejected|ACTION_REJECTED/i.test(m)) return "Cancelled in your wallet.";
    if (/deposits paused/i.test(m)) return "Deposits are not open yet.";
    if (/nothing to claim/i.test(m)) return "Nothing to claim yet.";
    if (/amount above deposit/i.test(m)) return "More than you have deposited.";
    if (/insufficient allowance|ERC20InsufficientAllowance/i.test(m))
      return "The token spend has not been approved.";
    if (/insufficient balance|ERC20InsufficientBalance/i.test(m))
      return "Not enough balance.";
    if (/network changed|NETWORK_ERROR/i.test(m))
      return "Your wallet changed network. Reload the page.";
    return m.slice(0, 140) || "The transaction failed.";
  }

  // ---------------------------------------------------------------
  // lectura
  // ---------------------------------------------------------------

  let decimales = 18;   // provisional hasta leerlo del token

  let ultimaTasa = null;
  let ultimoPausado = false;
  async function pintarPool(c) {
    try {
      const pv = await (c || staking).poolView();
      ultimoPausado = pv.paused;
      // la tasa es la del contrato, no la escrita en la pagina
      if (pv.rate !== ultimaTasa) {
        ultimaTasa = pv.rate;
        window.dispatchEvent(new CustomEvent("sectora:apy", { detail: Number(pv.rate) }));
      }
      if (elStaked) elStaked.textContent = fmt(pv.deposited, 0) + " #SECT";
      if (elStakers) elStakers.textContent = pv.depositors.toString();

      if (pv.paused) aviso("Rewards paused: the reward pool is waiting to be refilled.", true);
      else if (pv.depositsClosed) aviso("Deposits are not open yet.");
    } catch (e) {
      console.warn("[sectora] no pude leer poolView", e);
    }
  }

  /* Contador en vivo: el contrato suma recompensas cada segundo. Cada 15 s
     se lee lo cobrable de la cadena y entre lecturas la cifra avanza con
     deposito x tasa, asi el usuario ve llegar lo que gana segundo a
     segundo. Cobrar sigue siendo un claim suyo. */
  const ANO_S = 365n * 86400n;
  const contador = { base: 0, porSeg: 0, t0: 0, id: null };
  const fmtVivo = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 6 });

  function montarContador() {
    if ($("earnLive") || !btn || !btn.parentNode) return;
    const caja = document.createElement("div");
    caja.id = "earnLive";
    caja.className = "earn-live";
    caja.innerHTML =
      '<div class="earn-head"><span>Your rewards · accruing every second</span><i aria-hidden="true"></i></div>' +
      '<b class="earn-n"><span id="earnN">0.000000</span> <small>#SECT</small></b>' +
      '<div class="earn-sub"><span>Deposited <b id="earnDep">0</b> #SECT</span><span>+<b id="earnMin">0</b> #SECT / min</span></div>' +
      '<button type="button" class="btn primary wide earn-claim" id="earnClaim">Claim rewards</button>';
    btn.parentNode.insertBefore(caja, btn);
    $("earnClaim").addEventListener("click", accion(() =>
      enviar("Claiming", () => staking.connect(firmante).claim())
    ));
    clearInterval(contador.id);
    contador.id = setInterval(() => {
      const el = $("earnN");
      if (!el || !contador.t0) return;
      el.textContent = fmtVivo(contador.base + contador.porSeg * (Date.now() - contador.t0) / 1000);
    }, 200);
  }

  async function pintarCuenta() {
    if (!cuenta) return;
    try {
      const v = await staking.accountView(cuenta);
      montarContador();
      const tasa = ultimaTasa === null ? 0n : ultimaTasa;
      const porSegWei = ultimoPausado ? 0n : (v.deposited * tasa) / (10000n * ANO_S);
      contador.base = Number(ethers.formatUnits(v.claimable, decimales));
      contador.porSeg = Number(ethers.formatUnits(porSegWei, decimales));
      contador.t0 = Date.now();
      const dep = $("earnDep"), min = $("earnMin");
      if (dep) dep.textContent = fmt(v.deposited);
      if (min) min.textContent = (contador.porSeg * 60).toLocaleString("en-US", { maximumFractionDigits: 4 });
      $("earnN").textContent = fmtVivo(contador.base);
    } catch (e) {
      console.warn("[sectora] no pude leer accountView", e);
    }
  }

  // ---------------------------------------------------------------
  // escritura
  // ---------------------------------------------------------------

  /* Una accion a la vez: los botones se apagan mientras hay una en curso
     (un doble clic no manda dos depositos) y cualquier fallo, tambien de
     lectura, acaba en un aviso legible en vez de en silencio. */
  let ocupado = false;
  function accion(fn) {
    return async () => {
      if (ocupado) return;
      ocupado = true;
      document.querySelectorAll("#chainActions button, #earnClaim").forEach((b) => (b.disabled = true));
      try {
        await fn();
      } catch (e) {
        aviso(explicar(e), true);
      } finally {
        ocupado = false;
        document.querySelectorAll("#chainActions button, #earnClaim").forEach((b) => (b.disabled = false));
      }
    };
  }

  /** La red y la cuenta de la wallet, comprobadas justo antes de firmar. */
  async function mismaWallet() {
    const red = await proveedor.send("eth_chainId", []);
    const cs = await proveedor.send("eth_accounts", []);
    if (red !== CONTRACTS.chainId) throw new Error("Your wallet is not on the Ethereum network.");
    if (!cs || !cs[0] || cs[0].toLowerCase() !== cuenta.toLowerCase())
      throw new Error("Your wallet account changed. Reload the page.");
  }

  /* Cantidad escrita: solo cifras con punto decimal opcional y como mucho
     los decimales del token. Nada de signos, comas, notacion cientifica ni
     ceros: si no es valida no se hace nada. */
  function leerCantidad() {
    const t = ((entrada && entrada.value) || "").trim();
    if (!/^\d+(\.\d+)?$/.test(t)) return null;
    try {
      const v = ethers.parseUnits(t, decimales);
      return v > 0n ? v : null;
    } catch (e) {
      return null;
    }
  }

  async function enviar(nombre, hacer) {
    try {
      await mismaWallet();
      aviso(nombre + "…");
      const tx = await hacer();
      aviso(nombre + ": confirming…");
      await tx.wait();
      aviso(nombre + ": done.");
      await pintarPool();
      await pintarCuenta();
    } catch (e) {
      aviso(explicar(e), true);
    }
  }

  async function depositar() {
    const cantidad = leerCantidad();
    if (cantidad === null) {
      aviso("Enter a valid amount, like 1000 or 1000.5.", true);
      return;
    }
    const pv = await staking.poolView();
    if (pv.depositsClosed) {
      aviso("Deposits are not open yet.", true);
      return;
    }

    const v = await staking.accountView(cuenta);
    if (v.walletBalance < cantidad) {
      aviso("You do not have that many #SECT in your wallet.", true);
      return;
    }
    // aprobar solo si hace falta, y solo por la cantidad exacta que se va a
    // depositar: nunca una aprobacion ilimitada. El deposito la gasta entera,
    // asi que despues no queda nada aprobado.
    if (v.allowance < cantidad) {
      const exacto = ethers.formatUnits(cantidad, decimales).replace(/\.0$/, "");
      await enviar("Approving exactly " + exacto + " #SECT (nothing more)", () =>
        token.connect(firmante).approve(CONTRACTS.staking, cantidad)
      );
      const v2 = await staking.accountView(cuenta);
      if (v2.allowance < cantidad) return; // la aprobación no salió
    }
    await enviar("Depositing", () => staking.connect(firmante).deposit(cantidad));
  }

  // ---------------------------------------------------------------
  // botonera
  // ---------------------------------------------------------------

  function montarAcciones() {
    if ($("chainActions") || !btn || !btn.parentNode) return;
    const caja = document.createElement("div");
    caja.id = "chainActions";
    caja.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;margin-top:14px;";

    const nuevo = (texto, alPulsar) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = texto;
      b.style.cssText =
        "font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.14em;" +
        "text-transform:uppercase;padding:10px 16px;border-radius:8px;cursor:pointer;" +
        "border:1px solid rgba(255,255,255,.22);background:transparent;color:inherit;";
      b.addEventListener("click", alPulsar);
      caja.appendChild(b);
      return b;
    };

    nuevo("Deposit #SECT", accion(depositar));
    // cobrar va en el contador en vivo (montarContador)
    // retirar usa solo la cantidad escrita; para sacarlo todo hay un boton
    // aparte, asi una cantidad mal escrita nunca se convierte en "todo"
    nuevo("Withdraw", accion(async () => {
      const cantidad = leerCantidad();
      if (cantidad === null) return aviso("Enter the amount to withdraw, or use Withdraw all.", true);
      const v = await staking.accountView(cuenta);
      if (cantidad > v.deposited) return aviso("More than you have deposited.", true);
      await enviar("Withdrawing", () => staking.connect(firmante).withdraw(cantidad));
    }));
    nuevo("Withdraw all", accion(async () => {
      const v = await staking.accountView(cuenta);
      if (v.deposited === 0n) return aviso("You have nothing deposited.", true);
      await enviar("Withdrawing all", () => staking.connect(firmante).withdraw(v.deposited));
    }));

    btn.parentNode.appendChild(caja);
  }

  // ---------------------------------------------------------------
  // conexión
  // ---------------------------------------------------------------

  async function conectar(eip1193, direccion) {
    proveedor = new ethers.BrowserProvider(eip1193);
    firmante = await proveedor.getSigner();
    cuenta = direccion;

    const red = await eip1193.request({ method: "eth_chainId" });
    if (red !== CONTRACTS.chainId) {
      aviso("Switch your wallet to the Ethereum network.", true);
      return;
    }

    token = new ethers.Contract(CONTRACTS.token, TOKEN_ABI, proveedor);
    staking = new ethers.Contract(CONTRACTS.staking, STAKING_ABI, proveedor);

    try {
      decimales = Number(await token.decimals());
    } catch (e) {
      aviso("Could not read the token decimals; stopping here.", true);
      return;   // antes que arriesgarse a mover una cantidad mal escalada
    }
    if (decimales !== 18) {
      aviso("Unexpected token decimals; stopping here.", true);
      return;
    }

    // Esta es la comprobacion que de verdad protege al pegar direcciones: si
    // el contrato de staking apunta a un token distinto del que tiene esta
    // pagina, todo lo demas parece funcionar --saldos, aprobaciones-- y el
    // usuario acabaria aprobando el token equivocado. Se para en seco.
    try {
      const suyo = await staking.token();
      if (suyo.toLowerCase() !== CONTRACTS.token.toLowerCase()) {
        aviso("Misconfigured: the staking contract points at a different token.", true);
        console.error("[sectora] token esperado", CONTRACTS.token, "pero el staking usa", suyo);
        staking = null;
        return;
      }
    } catch (e) {
      aviso("Could not verify the contract token; stopping here.", true);
      return;
    }

    if (btn) btn.textContent = direccion.slice(0, 6) + "…" + direccion.slice(-4);
    montarAcciones();
    await pintarPool();
    await pintarCuenta();

    clearInterval(refrescoId);
    refrescoId = setInterval(() => {
      pintarPool();
      pintarCuenta();
    }, 15000);
  }

  // --- descubrimiento de carteras (EIP-6963), con window.ethereum de red ---
  const anunciados = new Map();
  window.addEventListener("eip6963:announceProvider", (e) => {
    const d = e.detail || {};
    // por uuid: un anuncio posterior con el mismo rdns no puede sustituir
    // a la cartera que ya se anuncio
    if (d.info && d.info.uuid && d.provider && !anunciados.has(d.info.uuid)) anunciados.set(d.info.uuid, d.provider);
  });
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  function elegirProveedor() {
    if (anunciados.size > 0) return anunciados.values().next().value;
    return window.ethereum || null;
  }

  const oyentes = new WeakSet();
  async function pedirConexion() {
    const eip1193 = elegirProveedor();
    if (!eip1193) {
      aviso("No wallet detected in this browser.", true);
      return;
    }
    try {
      const cuentas = await eip1193.request({ method: "eth_requestAccounts" });
      if (!cuentas || !cuentas.length) return;
      await conectar(eip1193, cuentas[0]);

      if (oyentes.has(eip1193)) return;   // volver a pulsar no duplica oyentes
      oyentes.add(eip1193);
      eip1193.on && eip1193.on("accountsChanged", (c) => {
        if (c && c.length) conectar(eip1193, c[0]);
        else {
          clearInterval(refrescoId); cuenta = null; aviso("");
          clearInterval(contador.id); contador.t0 = 0;
          const caja = $("earnLive"); if (caja) caja.remove();
        }
      });
      // un cambio de red invalida los contratos ya instanciados: lo mas
      // seguro y lo que hacen las dapps serias es recargar
      eip1193.on && eip1193.on("chainChanged", () => window.location.reload());
    } catch (e) {
      aviso(explicar(e), true);
    }
  }

  /* Sin wallet tambien se lee el contrato: la tasa puede haber cambiado
     (setRate) y la pagina no debe seguir mostrando la de su texto. */
  async function lecturaPublica() {
    // se pregunta a dos nodos publicos y, si contestan los dos, tienen que
    // coincidir en la tasa: un solo nodo mentiroso no puede inventar el APY
    const buenos = [];
    for (const url of RPCS) {
      if (buenos.length === 2) break;
      try {
        const p = new ethers.JsonRpcProvider(url, Number(CONTRACTS.chainId), { staticNetwork: true });
        const c = new ethers.Contract(CONTRACTS.staking, STAKING_ABI, p);
        const pv = await Promise.race([
          c.poolView(),
          new Promise((_, no) => setTimeout(() => no(new Error("timeout")), 6000)),
        ]);
        buenos.push({ c, rate: pv.rate });
      } catch (e) {
        console.warn("[sectora] lectura publica fallo en", url, e && e.message);
      }
    }
    if (!buenos.length) return;
    if (buenos.length === 2 && buenos[0].rate !== buenos[1].rate) {
      console.warn("[sectora] los nodos publicos no coinciden; no se muestra su lectura");
      return;
    }
    if (!staking) await pintarPool(buenos[0].c);   // con wallet conectada, manda la wallet
  }

  function arrancar() {
    // staking.js tambien escucha este boton para su vista previa: se
    // sustituye por un clon limpio para que no queden dos manejadores
    // peleando por el mismo click
    if (btn && btn.parentNode) {
      const clon = btn.cloneNode(true);
      btn.parentNode.replaceChild(clon, btn);
      btn = clon;   // sin esto, btn apuntaria al nodo viejo ya desconectado
                    // y todo lo que se le colgase despues no se veria
    }
    // El boton nace apagado en el marcado, que es la verdad mientras no haya
    // contrato. Despertarlo es cosa de este modulo y solo aqui: si se
    // olvidase, el dia del despliegue la pagina quedaria con un boton muerto.
    if (btn) {
      btn.disabled = false;
      btn.addEventListener("click", pedirConexion);
    }

    // staking.js guarda referencias a estos dos nodos y les escribe cifras
    // simuladas cada 4,6 s. Sustituirlos por clones deja aquellas escrituras
    // yendo a nodos desconectados, sin tener que tocar staking.js.
    ["lvStaked", "lvStakers"].forEach((id) => {
      const el = $(id);
      if (el && el.parentNode) {
        const clon = el.cloneNode(true);
        el.parentNode.replaceChild(clon, el);
      }
    });
    elStaked = $("lvStaked");
    elStakers = $("lvStakers");

    // si algun dia el conector compartido existe en esta pagina, manda el
    if (window.SectoraWallet) {
      window.SectoraWallet.onChange((direccion, eip1193) => {
        if (direccion && eip1193) conectar(eip1193, direccion);
      });
    }

    // la direccion oficial a la vista: quien la compare con la que muestra
    // su wallet al aprobar detecta una copia falsa de la pagina
    if (btn && btn.parentNode && !$("stakeAddr")) {
      const nota = document.createElement("p");
      nota.id = "stakeAddr";
      nota.className = "stake-note stake-addr";
      nota.append("Staking contract: ");
      const a = document.createElement("a");
      a.href = "https://etherscan.io/address/" + CONTRACTS.staking;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = CONTRACTS.staking;
      nota.append(a, ". You only approve the exact amount you deposit, never more, and your wallet must show this same address when you approve.");
      btn.parentNode.appendChild(nota);
    }

    lecturaPublica();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
