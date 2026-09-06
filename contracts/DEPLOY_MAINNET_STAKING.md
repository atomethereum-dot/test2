# SectoraStaking — despliegue en Ethereum Mainnet

Desplegar `SectoraStaking` en Ethereum Mainnet, contra el #SECT real.

---

## Los datos

| | |
|---|---|
| Red | **Ethereum Mainnet** (chainId 1) |
| Token a depositar | **`0x8C9984B06281f1CA9416e493c2E602AaB08513db`** |
| Decimales | **18** |
| Contrato a desplegar | `SectoraStaking` |
| Código para pegar | `flattened/SectoraStaking.flattened.sol` |
| Compilador | **0.8.24**, optimizador **activado**, runs **200** |

Los tres valores del compilador tienen que coincidir exactamente con esos, o
la verificación en Etherscan fallará después.

---

## Antes de empezar: lo que esto va a costar

Gas medido de verdad, ejecutando cada operación:

| Operación | Gas | Quién paga |
|---|---|---|
| Desplegar el contrato | **1.694.499** | tú, una vez |
| `approve` para cargar el fondo | 26.514 | tú |
| `fundRewards` | 98.070 | tú, cada vez que cargues |
| `stake` | 174.829 | el usuario |
| `claim` | 108.430 | el usuario |
| `unstake` | 91.277 | el usuario |

Para calcular el coste: **gas × precio del gas**. A 20 gwei, el despliegue
sale por ~0,034 ETH. A 50 gwei, ~0,085 ETH. Mira el precio actual en
etherscan.io/gastracker y despliega en un momento barato — no hay ninguna
prisa y la diferencia entre 15 y 60 gwei es cuádruple.

Ten en la wallet **al menos 0,15 ETH** para tener margen.

---

## Paso 1 — Decidir los tres parámetros del constructor

El constructor pide tres cosas. Decídelas antes de abrir Remix.

### `_stakingToken`

```
0x8C9984B06281f1CA9416e493c2E602AaB08513db
```

Cópialo de aquí, no lo escribas a mano. Una dirección mal tecleada
despliega un contrato inútil y el gas no se recupera.

### `_rateBps` — la tasa anual en puntos básicos

Para el **14,9 %** que anuncia la web: **`1490`**.

El contrato no admite más de `10000` (100 %). Se puede cambiar después con
`setRate`, y el cambio se aplica desde ese momento: lo ya devengado al ritmo
viejo queda liquidado antes.

### `_lockPeriod` — segundos que un depósito debe quedarse

| Bloqueo | Valor |
|---|---|
| Sin bloqueo | `0` |
| 7 días | `604800` |
| 30 días | `2592000` |
| 90 días (máximo) | `7776000` |

El contrato no admite más de 90 días. Dos cosas que conviene saber:

- El bloqueo **se congela al depositar**. Si lo subes después, no alarga los
  depósitos que ya estaban dentro.
- `emergencyWithdraw` siempre permite sacar el principal saltándose el
  bloqueo, cediendo lo devengado. Nadie queda encerrado.

---

## Paso 2 — Desplegar

1. Abre **remix.ethereum.org**.
2. Archivo nuevo `SectoraStaking.sol`. Pega el contenido de
   `flattened/SectoraStaking.flattened.sol` entero.
3. Pestaña **Solidity Compiler**:
   - Compiler: **0.8.24**
   - **Enable optimization**: activado, **200** runs
   - Compila. No debe salir ningún error.
4. Pestaña **Deploy & Run**:
   - Environment: **Injected Provider — MetaMask**
   - En MetaMask, red **Ethereum Mainnet**. Compruébalo dos veces.
   - Contract: **SectoraStaking**
   - Despliega el desplegable junto a *Deploy* y rellena los tres campos del
     paso 1.
5. **Deploy**, confirma en MetaMask.
6. Copia la dirección del contrato desplegado.

**La wallet que despliega queda como dueña del contrato.** Usa la que quieras
que lo administre.

---

## Paso 3 — Verificar en Etherscan

Hazlo ahora, no después. Es lo que permite a cualquiera leer el código, y en
un proyecto que vende seguridad, un contrato sin verificar se lee fatal.

En Remix, plugin **Contract Verification**, conectado a Etherscan mainnet.
Pega el mismo `.flattened.sol`, con el mismo compilador y la misma
configuración de optimización. Si no coinciden exactamente, falla.

---

## Paso 4 — Cargar el fondo de recompensas

**Sin esto, el staking no paga nada.** El contrato no acuña: cada token que
reparte tiene que haber entrado antes. Es a propósito — #SECT está renunciado
y sin función de emisión, así que no hay otra forma honesta de hacerlo.

Desde la wallet que tiene los #SECT:

1. En Etherscan, ve al **contrato de #SECT** →
   *Contract* → *Write Contract* → **Connect to Web3** → `approve`:
   - `spender`: la dirección de **SectoraStaking**
   - `amount`: en unidades mínimas (18 decimales)

   | #SECT | valor a escribir |
   |---|---|
   | 10.000 | `10000000000000000000000` |
   | 100.000 | `100000000000000000000000` |
   | 1.000.000 | `1000000000000000000000000` |

2. En **SectoraStaking** → *Write Contract* → `fundRewards` con esa misma
   cantidad.
3. Comprueba en *Read Contract* que `rewardPool()` devuelve lo aportado.

### Cuánto cargar

Haz la cuenta antes:

```
#SECT al año = total depositado × 0,149
```

Por cada **1.000.000 #SECT** que la gente deposite, el fondo se come
**149.000 #SECT al año**. Sobre un suministro fijo de 50M con una quema del
50 % programada, eso no es despreciable.

`runwaySeconds()` te dice en cualquier momento cuántos segundos aguanta el
fondo al ritmo y al volumen actuales. Divídelo entre 86400 para días.
**Vigila esa cifra**: si llega a cero el devengo se pausa solo —el contrato
no promete lo que no puede pagar— pero eso son holders enfadados.

Para recuperar lo no asignado usa **`withdrawAllRewards(to)`**, no
`withdrawRewards`: esta última compara contra el fondo ya actualizado, así
que pasarle la cifra que acabas de leer siempre revierte por unas milésimas.

---

## Paso 5 — Conectar la web

Una sola línea en `staking/staking-chain.js`:

```js
const CONTRACTS = {
  chainId: "0x1",                                          // ya está
  token:   "0x8C9984B06281f1CA9416e493c2E602AaB08513db",   // ya está
  staking: "0x...",   // <-- pega aquí la dirección del paso 2
};
```

Mientras siga en ceros, el módulo se retira solo y la página de staking se
queda en la vista previa actual, sin botones muertos.

Al conectar, la página comprueba que `stakingToken()` del contrato coincide
con el token configurado. Si pegaste una dirección equivocada, no aparece
ningún botón y sale un aviso, en vez de dejar que alguien apruebe el gasto
del token que no es.

---

## Después de desplegar, comprueba esto

En *Read Contract* de Etherscan, antes de anunciarlo a nadie:

- `stakingToken()` → `0x8C9984B06281f1CA9416e493c2E602AaB08513db`
- `rateBps()` → `1490`
- `lockPeriod()` → el que elegiste
- `rewardPool()` → lo que cargaste
- `owner()` → tu wallet
- `totalStaked()` → `0`

Y haz una prueba real con poco: deposita 10 #SECT desde otra wallet, espera
un rato, mira que `earned()` sube, cobra, y retira. Con 10 tokens el riesgo
es cero y confirmas el circuito entero.

---

## Lo que el contrato ya te protege

Para que sepas qué no tienes que vigilar:

- El principal de un usuario **nunca** puede pagarse como recompensa de otro.
  `totalStaked` y `rewardPool` van separados y cada pago se comprueba contra
  el fondo. Ninguna función del dueño puede tocar el principal.
- Si el fondo se seca, el devengo se pausa en el último segundo financiado en
  vez de acumular una deuda impagable. Refinanciar lo reanuda, sin devengo
  retroactivo por el hueco.
- El bloqueo se congela al depositar, y tiene tope de 90 días.
- `emergencyWithdraw` devuelve el principal saltándose el bloqueo.
- `setStakingPaused` frena depósitos nuevos, pero retirar, cobrar y la salida
  de emergencia siguen abiertos: no sirve para encerrar a nadie.
- La cantidad recibida se mide, no se asume, por si el token cobrase comisión
  al transferir.
- `nonReentrant` en toda función que mueve tokens.

## Lo que no te protege, y depende de ti

- **El contrato no está auditado.** 54 pruebas locales pasando y una prueba de
  punta a punta en navegador no son una auditoría: comprueban lo que se me
  ocurrió comprobar.
- **La llave del dueño.** No puede tocar el principal, pero sí vaciar el fondo
  de recompensas y subir la tasa hasta el 100 %. Si se compromete, los
  holders no pierden lo depositado pero sí sus recompensas. Con dinero real,
  eso pide una **multifirma** como dueño.
