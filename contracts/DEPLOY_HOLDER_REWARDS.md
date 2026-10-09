# SectoraHolderRewards — despliegue en Ethereum Mainnet

El staking de #SECT: los holders depositan #SECT, ganan recompensas cada
segundo a la tasa que fije el dueño (14,9 % al arrancar) y cobran cuando
quieren. Las recompensas salen de un fondo que carga la fundación.

## Las reglas

| | |
|---|---|
| Recompensa | Cada segundo, a `rateBps`. Arranca en 14,9 %. El dueño la cambia cuando quiera con `setRate`, sin límite de negocio |
| Cobro | Cuando quieran (`claim`) |
| Retiro | Cuando quieran, sin penalización (`withdraw`). Funciona siempre |
| Tope de depósitos | Ninguno. Para frenar la entrada: `setDepositsPaused(true)` |
| Fondo de recompensas | Lo carga la fundación. El dueño puede retirar en cualquier momento la parte que nadie ha ganado todavía |
| Propiedad | En dos pasos: transferir + aceptar. `renounceOwnership` está desactivado |
| Depósitos de los holders | Nadie puede tocarlos, tampoco el dueño |
| Bloqueos (15 días, 1 mes, 2 meses) | Incluidos pero **desactivados**. Los activas cuando quieras con `setLockOption`, cada uno con su APY |

---

## 0. Antes de desplegar (obligatorio)

### 0.1 Comprueba el token #SECT en Etherscan

Abre `0x8C9984B06281f1CA9416e493c2E602AaB08513db` en etherscan.io →
*Contract* → *Code*. El staking da por hecho que #SECT es un ERC-20 normal.
Confirma cada punto:

- [ ] **La reducción de 50M a 25M del 15 mar 2027 es una quema** desde una
      wallet, y **no** un cambio automático de los saldos de todo el mundo
      (rebase). Si fuera un rebase, el staking se quedaría sin fondos para
      devolver los depósitos.
- [ ] **No es un proxy**: no aparece *Read as Proxy* ni *Write as Proxy*.
- [ ] **`owner()` es `0x0000…0000`** y no hay otros roles de administrador
      (admin, minter, operator…).
- [ ] **0 % de comisión** al transferir, y ninguna función para activarla.
- [ ] **No tiene pausa, lista negra, límite por transacción, límite por
      wallet ni enfriamiento entre transferencias.**

Si algo de esto no se cumple, **no despliegues** y avísame.

### 0.2 Las wallets

- **No despliegues desde la MetaMask de todos los días.** La dirección del
  Hash Market en Sepolia coincide con la del #SECT de mainnet: eso indica que
  la misma wallet desplegó ambos, y es una wallet que se usa a diario para
  pruebas.
- Despliega desde una **hardware wallet** (Ledger o Trezor) conectada a
  MetaMask.
- Crea una **Safe** (safe.global), multifirma 2 de 3 con firmantes en
  hardware wallets. Va a ser la **dueña** del staking y conviene que guarde
  también la tesorería de #SECT.

### 0.3 La web

- 2FA con llave física en GitHub para todo el que pueda subir cambios.
- Protege la rama que publica la web (revisión obligatoria antes de
  publicar).
- 2FA y bloqueo de transferencia del dominio en el registrador.

Quien controle el repositorio o el dominio podría cambiar la dirección del
contrato en la página y robar a los usuarios que aprueben.

---

## Los datos

| | |
|---|---|
| Red | **Ethereum Mainnet** (chainId 1) |
| Token | **`0x8C9984B06281f1CA9416e493c2E602AaB08513db`** (#SECT, 18 decimales) |
| Contrato a desplegar | `SectoraHolderRewards` |
| Código para pegar | `flattened/SectoraHolderRewards.copy.sol` (sin comentarios, 692 líneas) o `flattened/SectoraHolderRewards.flattened.sol` (con comentarios). Compilan al mismo contrato; usa el mismo archivo para desplegar y para verificar |
| Compilador | **0.8.24**, optimizador **activado**, runs **200**, EVM version **por defecto** |
| Constructor | un solo campo: `_token` = la dirección del token de arriba |

## Gas (medido)

| Operación | Gas | Quién paga |
|---|---|---|
| Desplegar | **1.772.212** | tú, una vez |
| `transferOwnership` | ~48.000 | tú, una vez |
| `acceptOwnership` | ~28.000 | la Safe, una vez |
| `approve` del fondo | ~46.000 | la Safe |
| `fundRewards` | ~100.000 | la Safe, en cada recarga |
| `setDepositsPaused` | ~25.000 | la Safe |
| `setRate` | ~37.000 | la Safe |
| `deposit` | ~130.000–145.000 | el holder |
| `claim` | ~70.000 | el holder |
| `withdraw` | ~70.000–100.000 | el holder |

Coste = gas × precio del gas (etherscan.io/gastracker). Con **0,05 ETH** en
la wallet que despliega hay margen.

---

## Paso 1 — Desplegar

1. Abre **remix.ethereum.org**. Escríbelo tú o usa un marcador; no entres
   desde un buscador.
2. Archivo nuevo `SectoraHolderRewards.sol` → pega **entero**
   `flattened/SectoraHolderRewards.flattened.sol`.
3. **Solidity Compiler**: versión **0.8.24**, *Advanced Configurations* →
   **Enable optimization** con **200**. EVM version: por defecto. Compila; no
   debe salir ningún error.
4. **Deploy & Run**:
   - Environment: **Injected Provider — MetaMask**, con MetaMask en
     **Ethereum Mainnet** y la **hardware wallet** seleccionada.
   - Contract: **`SectoraHolderRewards`**. El desplegable también muestra
     `SafeERC20` y `StorageSlot`: elige el que tiene el campo `_token`.
   - `_token`: `0x8C9984B06281f1CA9416e493c2E602AaB08513db` (cópialo, no lo
     escribas a mano).
5. **Deploy** → confirma en la hardware wallet.
6. Copia la dirección del contrato **desde Remix** (*Deployed Contracts*) o
   desde la transacción de creación en Etherscan. **Nunca** desde el
   historial de la wallet: ahí pueden colarse direcciones falsas parecidas.

El contrato nace con los **depósitos cerrados** y con la wallet que despliega
como dueña.

## Paso 2 — Verificar en Etherscan

Lo más fácil es el plugin **Etherscan** de Remix (*Plugin manager* →
Etherscan → *Verify*).

A mano: Etherscan → la dirección → *Contract* → **Verify and Publish** →
*Solidity (Single file)*:
- compilador **v0.8.24**, licencia **MIT**, optimización **Yes / 200**;
- pega el mismo archivo;
- *Constructor Arguments ABI-encoded*:
  `0000000000000000000000008c9984b06281f1ca9416e493c2e602aab08513db`

Con el contrato verificado, cualquiera puede leer el código y aparecen las
pestañas *Read* y *Write*.

## Paso 3 — Pasar la propiedad a la Safe (antes de cargar nada)

1. Etherscan → staking → *Write Contract* → conecta la wallet que desplegó →
   **`transferOwnership`** → `newOwner` = la dirección de tu **Safe**.
2. En *Read Contract*: `owner()` sigue siendo tu wallet y `pendingOwner()` es
   la Safe. Todavía no ha cambiado nada: falta aceptar.
3. En la Safe (app.safe.global) → *New transaction* → **Transaction
   Builder** → dirección del staking. El ABI se carga solo porque está
   verificado. Elige **`acceptOwnership`** → *Create batch* → firman 2 de 3 →
   *Execute*.
4. *Read Contract* → `owner()` = **la Safe**.

Si te equivocas de dirección en el punto 1, no pasa nada: esa dirección
nunca podrá aceptar. Repite `transferOwnership` con la buena.

A partir de aquí todas las funciones de dueño se hacen **desde la Safe**.

## Paso 4 — Cargar el fondo (por tramos)

Carga lo de **1 a 3 meses** de recompensas, no todo de golpe. Si alguien
robara las llaves de dueño, solo podría llevarse lo que haya cargado en el
fondo.

En la Safe → Transaction Builder, **un solo lote** con dos llamadas:
1. Contrato **#SECT** → `approve`: `spender` = staking, `amount` = la
   cantidad exacta.
2. **Staking** → `fundRewards`: la misma cantidad.

| #SECT | valor a escribir (18 decimales) |
|---|---|
| 100.000 | `100000000000000000000000` |
| 500.000 | `500000000000000000000000` |
| 1.000.000 | `1000000000000000000000000` |
| 10.000.000 | `10000000000000000000000000` |

**No uses nunca "Enviar" / `transfer` para mandar #SECT al staking.** Lo
enviado así no entra en el fondo. Se puede recuperar con `recoverSurplus`
(ver abajo), pero cuesta una transacción más.

*Read Contract* → `rewardPool()` debe dar lo cargado.

### Cuánto cuesta

```
recompensas al año = total depositado × tasa   (0,149 con el 14,9 %)
```

| Depositado (al 14,9 %) | Al año | Al mes |
|---|---|---|
| 1.000.000 #SECT | 149.000 | ~12.400 |
| 10.000.000 #SECT | 1.490.000 | ~124.200 |
| 20.000.000 #SECT | 2.980.000 | ~248.300 |

Quien reinvierte sus recompensas gana algo más (con 14,9 %, hasta un 16,1 %
efectivo). Vigila `runwaySeconds()`: son los segundos que aguanta el fondo
desde ahora (÷ 86400 = días). Si llega a 0 las recompensas se paran (no se
promete lo que no hay) y vuelven al recargar, sin pagar el hueco.

## Paso 5 — Abrir los depósitos

Safe → staking → `setDepositsPaused(false)`.

## Paso 6 — Conectar la web

Pásame la dirección del contrato y la pongo en `staking/staking-chain.js`.
Antes de anunciarlo, abre tú
`https://sectoraorg.com/staking/staking-chain.js` y comprueba que la
dirección que aparece es exactamente la tuya.

## Paso 7 — Prueba real con poco

Desde **otra** wallet, en sectoraorg.com/staking:
1. Deposita 10 #SECT. En la ventana de aprobación, el *spender* tiene que
   ser la dirección del staking y la cantidad, 10.
2. Mira que el contador sube.
3. *Claim*, y después *Withdraw all*.

---

## Cambiar la tasa

Safe → staking → `setRate` → la tasa en **puntos básicos al año**:

| Tasa | Escribes |
|---|---|
| 14,9 % al año | `1490` |
| 25 % al año | `2500` |
| 10 % al mes | `12000` |
| 100 % al mes | `120000` |
| Parar recompensas | `0` |

% al mes × 1200 = lo que escribes. Solo hay un tope técnico (`1e12`) para que
las cuentas nunca desborden.

- El cambio cuenta desde ese segundo: lo ya ganado no se recalcula.
- **Revisa el número antes de firmar:** un cero de más reparte el fondo entero
  en poco tiempo entre quienes tengan depositado, y eso no tiene vuelta.
- Después de subirla, mira `runwaySeconds()`.

## Retirar el fondo

- **`withdrawAllRewards(to)`**: saca todo lo que nadie ha ganado todavía. Es
  la que conviene usar.
- `withdrawRewards(to, amount)`: una cantidad concreta (18 decimales). Si
  pides justo lo que marcaba `rewardPool` hace un momento, puede fallar por
  muy poco, porque el fondo baja cada segundo. Pide algo menos o usa la de
  arriba.
- Ninguna de las dos toca depósitos ni recompensas ya ganadas. No se puede
  usar el propio contrato como destino.

## Bloqueos (vienen desactivados)

El contrato trae tres opciones de bloqueo, **apagadas y con tasa 0**:

| Opción | Plazo | Para escribir el plazo |
|---|---|---|
| `0` | 15 días | `1296000` |
| `1` | 30 días | `2592000` |
| `2` | 60 días | `5184000` |

**Cómo funciona para el holder:**
- Elige la opción y la cantidad (`lock(opción, cantidad)`).
- **El APY queda fijo para su bloqueo** aunque luego lo cambies.
- **La recompensa entera se aparta del fondo al bloquear.** Está garantizada y
  tú no la puedes retirar. Si el fondo no tiene suficiente, el bloqueo no se
  acepta.
- **La recompensa se gana cada segundo** y la cobra cuando quiera
  (`claimLock` o `claimAllLocks`).
- **El principal no sale hasta que acaba el plazo** (`withdrawLock`). Al
  acabar deja de ganar.
- Salir antes **no se puede**, salvo que actives `setEarlyExit(true)`. Si lo
  activas, quien salga antes recupera el principal y lo que no había cobrado
  de ese bloqueo vuelve al fondo.

**Cómo los activas (desde la Safe):**
- `setLockOption(opción, plazo, tasa, true)`. Por ejemplo, 1 mes al 25 %:
  `setLockOption(1, 2592000, 2500, true)`.
- Para apagar una opción: la misma llamada con `false`. Los bloqueos ya hechos
  siguen hasta su fin.
- `addLockOption(plazo, tasa, true)` añade un plazo nuevo, por ejemplo 6 meses
  = `15552000`.
- La tasa se escribe igual que en `setRate`: % al año × 100.

**Antes de activarlos, avísame:** hay que añadir a la página de staking los
botones para bloquear, ver los bloqueos y retirarlos. Hoy no aparecen porque
están apagados.

## Recuperar envíos por error

- **`recoverSurplus(to)`**: devuelve los #SECT que llegaron al contrato fuera
  de `deposit`/`fundRewards`, por ejemplo con "Enviar". Solo sale lo que
  sobra después de cubrir todos los depósitos, el fondo, todo lo ganado
  pendiente de cobrar, lo bloqueado y lo reservado para los bloqueos.
- **`rescueToken(token, to, amount)`**: devuelve **otros** tokens enviados por
  error (USDT, etc.). No puede tocar #SECT.

## Cerrar el programa (si algún día hace falta)

1. `setDepositsPaused(true)`: no entra nadie nuevo.
2. `setRate(0)`: deja de sumar.
3. `withdrawAllRewards(Safe)`: recuperas el fondo no ganado.
4. Cada holder retira y cobra lo suyo cuando quiera.

---

## Comprobaciones (Read Contract)

- `token()` → `0x8C9984B06281f1CA9416e493c2E602AaB08513db`
- `owner()` → **la Safe** · `pendingOwner()` → `0x0000…0000`
- `rateBps()` → `1490` (o la que hayas puesto)
- `MAX_RATE_BPS()` → `1000000000000` (tope técnico)
- `rewardPool()` → lo que queda en el fondo
- `totalDeposited()`, `depositorCount()`, `totalUnclaimed()`
- `runwaySeconds()` → días de fondo × 86400
- `depositsPaused()` → `false` cuando esté abierto

## Lo que el contrato protege

- **Los depósitos de los holders no los puede tocar nadie**, tampoco el dueño
  ni quien le robe las llaves. `withdraw` funciona siempre, aunque el fondo
  esté vacío o los depósitos cerrados.
- **Lo ya ganado tampoco:** sale del fondo al ganarse y queda fuera del
  alcance del dueño.
- **Nunca se paga más de lo que hay en el fondo**, sea cual sea la tasa o lo
  depositado.
- **Redondeo siempre a favor del contrato:** a cada holder se le acredita su
  parte exacta redondeada hacia abajo, así el último en salir siempre puede
  retirar entero.
- **Propiedad en dos pasos y sin renuncia:** un error al escribir la dirección
  no entrega el contrato, y no se puede dejar sin dueño por accidente.
- **Sin reentrada:** `nonReentrant` en todo lo que mueve tokens. La cantidad
  recibida se mide en vez de suponerse.
- **Sin bucles**, así que no hay límite de gas que alcanzar con muchos
  holders.

## Revisión

- **71 pruebas propias, todas pasan** (`node scripts/test-rewards.js`).
- **Cuatro revisiones independientes:**
  - permisos del dueño;
  - cuentas y solvencia, con un fuzzing de miles de operaciones al azar
    comparado wei a wei con un modelo exacto;
  - ataques externos (reentrada, préstamos flash, adelantarse a las
    transacciones del dueño, donaciones);
  - la web y la operativa.
- **Ninguna encontró forma de robar depósitos ni recompensas.** Lo que sí
  encontraron ya está corregido:
  - redondeo de 1 wei;
  - propiedad en dos pasos;
  - renuncia desactivada;
  - destino inválido al retirar el fondo;
  - recuperación de envíos por error;
  - vistas del fondo en tiempo real.

## Lo que depende de ti

- **No es una auditoría profesional.** Para un contrato que puede llegar a
  guardar mucho dinero de holders, una auditoría externa sigue siendo lo
  recomendable.
- **Las llaves:** hardware wallet + Safe. Es la protección más importante;
  ningún código protege unas llaves robadas.
- **Avisos:** pon alertas (Etherscan → *Watch list*, o un servicio como
  Tenderly) para `RateChanged`, `RewardsWithdrawn`, `OwnershipTransferStarted`,
  `OwnershipTransferred`, `DepositsPausedChanged` y `SurplusRecovered`. Vigila
  también que `runwaySeconds` no baje demasiado.
- **Legal:** un APY pagado a holders puede considerarse producto de inversión
  regulado. Consúltalo.
