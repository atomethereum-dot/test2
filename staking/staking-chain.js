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
    chainId: "0xaa36a7", // Sepolia
    token: "0x0000000000000000000000000000000000000000",
    staking: "0x0000000000000000000000000000000000000000",
  };

  const TOKEN_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function faucet()",
  ];

  const STAKING_ABI = [
    "function stake(uint256 amount)",
    "function unstake(uint256 amount)",
    "function claim()",
    "function emergencyWithdraw()",
    "function earned(address) view returns (uint256)",
    "function accountView(address) view returns (uint256 staked, uint256 pendingRewards, uint256 unlocksAt, uint256 walletBalance, uint256 allowance)",
    "function poolView() view returns (uint256 staked, uint256 pool, uint256 rate, uint256 lock, bool paused, uint256 stakers, uint256 chainTime)",
    "function stakerCount() view returns (uint256)",
    "function runwaySeconds() view returns (uint256)",
    "function totalStaked() view returns (uint256)",
    "function rewardPool() view returns (uint256)",
    "function rateBps() view returns (uint256)",
  ];

  const ZERO = "0x0000000000000000000000000000000000000000";
  const desplegado = CONTRACTS.token !== ZERO && CONTRACTS.staking !== ZERO;

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

  const fmt = (v, dec) =>
    Number(ethers.formatEther(v)).toLocaleString("en-US", {
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
    if (/user rejected|ACTION_REJECTED/i.test(m)) return "Cancelado en la cartera.";
    if (/still locked/i.test(m)) return "Todavía dentro del periodo de bloqueo.";
    if (/nothing to claim/i.test(m)) return "No hay recompensas que cobrar.";
    if (/amount above stake/i.test(m)) return "Más de lo que tienes depositado.";
    if (/insufficient allowance|ERC20InsufficientAllowance/i.test(m))
      return "Falta aprobar el gasto del token.";
    if (/insufficient balance|ERC20InsufficientBalance/i.test(m))
      return "Saldo insuficiente.";
    return m.slice(0, 140) || "La transacción falló.";
  }

  // ---------------------------------------------------------------
  // lectura
  // ---------------------------------------------------------------

  let horaCadena = 0;

  async function pintarPool() {
    try {
      const pv = await staking.poolView();
      horaCadena = Number(pv.chainTime);
      if (elStaked) elStaked.textContent = fmt(pv.staked, 0) + " #SECT";
      if (elStakers) elStakers.textContent = pv.stakers.toString();

      // el anillo y la calculadora de staking.js usan 14,9 fijo; si el
      // contrato lleva otra tasa, manda el contrato
      const apy = Number(pv.rate) / 100;
      document.querySelectorAll("[data-apy]").forEach((el) => {
        el.textContent = apy.toFixed(2) + "%";
      });

      if (pv.paused) {
        aviso("Devengo en pausa: el fondo de recompensas está agotado.", true);
      }
    } catch (e) {
      console.warn("[sectora] no pude leer poolView", e);
    }
  }

  async function pintarCuenta() {
    if (!cuenta) return;
    try {
      const v = await staking.accountView(cuenta);
      const partes = [];
      partes.push("Depositado " + fmt(v.staked) + " #SECT");
      partes.push("pendiente " + fmt(v.pendingRewards, 4));
      if (v.staked > 0n) {
        // contra el reloj de la cadena, no el del navegador: en la prueba de
        // punta a punta los dos iban separados por años y el aviso decia
        // "se desbloquea en 3225 d" sobre un deposito sin bloqueo
        const ahora = horaCadena || Math.floor(Date.now() / 1000);
        const faltan = Number(v.unlocksAt) - ahora;
        partes.push(
          faltan > 0
            ? "se desbloquea en " + Math.ceil(faltan / 86400) + " d"
            : "desbloqueado"
        );
      }
      aviso(partes.join(" · "));
    } catch (e) {
      console.warn("[sectora] no pude leer accountView", e);
    }
  }

  // ---------------------------------------------------------------
  // escritura
  // ---------------------------------------------------------------

  async function enviar(nombre, hacer) {
    try {
      aviso(nombre + "…");
      const tx = await hacer();
      aviso(nombre + ": confirmando…");
      await tx.wait();
      aviso(nombre + ": hecho.");
      await pintarPool();
      await pintarCuenta();
    } catch (e) {
      aviso(explicar(e), true);
    }
  }

  async function depositar() {
    const txt = entrada && entrada.value ? entrada.value.replace(/,/g, "") : "";
    const n = Number(txt);
    if (!txt || !isFinite(n) || n <= 0) {
      aviso("Escribe una cantidad primero.", true);
      return;
    }
    const cantidad = ethers.parseEther(txt);

    const v = await staking.accountView(cuenta);
    if (v.walletBalance < cantidad) {
      aviso("No tienes tantos #SECT en la cartera.", true);
      return;
    }
    // aprobar solo si hace falta: una aprobación de más es una firma de más
    if (v.allowance < cantidad) {
      await enviar("Aprobando", () =>
        token.connect(firmante).approve(CONTRACTS.staking, cantidad)
      );
      const v2 = await staking.accountView(cuenta);
      if (v2.allowance < cantidad) return; // la aprobación no salió
    }
    await enviar("Depositando", () => staking.connect(firmante).stake(cantidad));
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

    nuevo("Depositar", depositar);
    nuevo("Cobrar", () => enviar("Cobrando", () => staking.connect(firmante).claim()));
    nuevo("Retirar", async () => {
      const v = await staking.accountView(cuenta);
      if (v.staked === 0n) return aviso("No tienes nada depositado.", true);
      enviar("Retirando", () => staking.connect(firmante).unstake(v.staked));
    });

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
      aviso("Cambia la cartera a la red Sepolia.", true);
      return;
    }

    token = new ethers.Contract(CONTRACTS.token, TOKEN_ABI, proveedor);
    staking = new ethers.Contract(CONTRACTS.staking, STAKING_ABI, proveedor);

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
    if (d.info && d.provider) anunciados.set(d.info.rdns, d.provider);
  });
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  function elegirProveedor() {
    if (anunciados.size > 0) return anunciados.values().next().value;
    return window.ethereum || null;
  }

  async function pedirConexion() {
    const eip1193 = elegirProveedor();
    if (!eip1193) {
      aviso("No se detecta ninguna cartera en este navegador.", true);
      return;
    }
    try {
      const cuentas = await eip1193.request({ method: "eth_requestAccounts" });
      if (!cuentas || !cuentas.length) return;
      await conectar(eip1193, cuentas[0]);

      eip1193.on && eip1193.on("accountsChanged", (c) => {
        if (c && c.length) conectar(eip1193, c[0]);
        else { clearInterval(refrescoId); cuenta = null; aviso(""); }
      });
      // un cambio de red invalida los contratos ya instanciados: lo mas
      // seguro y lo que hacen las dapps serias es recargar
      eip1193.on && eip1193.on("chainChanged", () => window.location.reload());
    } catch (e) {
      aviso(explicar(e), true);
    }
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
    if (btn) btn.addEventListener("click", pedirConexion);

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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
