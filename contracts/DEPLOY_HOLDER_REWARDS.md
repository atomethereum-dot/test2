# SectoraHolderRewards — despliegue en Ethereum Mainnet

El programa de recompensas para holders de #SECT: **14,9 % APY al arrancar**,
pagado por la tesorería de Sectora Foundation. El dueño puede cambiar la tasa
cuando quiera con `setRate`.

## Las reglas

| | |
|---|---|
| Recompensa | **14,9 % APY** al arrancar, se acumula cada segundo, sin interés compuesto. **Ajustable** por el dueño (`setRate`), sin límite de negocio |
| Cobro | **Cuando quieran** (`claim`) |
| Retiro | **Cuando quieran, sin penalización** (`withdraw`). Lo ganado sigue cobrable después de retirar |
| Tope de depósitos | **Ninguno**. Para frenar la entrada: `setDepositsPaused(true)` |
| Duración | Sin fecha de fin |
| Fondo de recompensas | Lo carga la tesorería. **Sin bloqueo**: el dueño puede retirar en cualquier momento la parte que nadie ha ganado todavía |

No hay tope de depósitos. La tasa se puede cambiar (ver *Cambiar la tasa*
más abajo), y cada cambio cuenta solo desde ese segundo: lo ya ganado nunca
se recalcula.

Las funciones se llaman `deposit`, `withdraw` y `claim`; el contrato no usa
la palabra "stake" en ningún sitio.

---

## Los datos

| | |
|---|---|
| Red | **Ethereum Mainnet** (chainId 1) |
| Token | **`0x8C9984B06281f1CA9416e493c2E602AaB08513db`** (#SECT, 18 decimales) |
| Contrato a desplegar | `SectoraHolderRewards` |
| Código para pegar | `flattened/SectoraHolderRewards.flattened.sol` |
| Compilador | **0.8.24**, optimizador **activado**, runs **200** |
| Constructor | un solo campo: `_token` = la dirección del token de arriba |

---

## Gas (medido)

| Operación | Gas | Quién paga |
|---|---|---|
| Desplegar | **1.495.293** | tú, una vez |
| `approve` del fondo | ~46.000 | tú |
| `fundRewards` | ~98.000 | tú, en cada recarga |
| `setDepositsPaused(false)` | ~25.000 | tú, una vez |
| `setRate` | ~37.000 | tú, cada vez que cambies la tasa |
| `deposit` | ~129.000–141.000 | el holder |
| `claim` | ~70.000 | el holder |
| `withdraw` | ~72.000–99.000 | el holder |

Coste = gas × precio del gas. Mira etherscan.io/gastracker. Con
**0,05 ETH** en la wallet tienes margen de sobra.

---

## Paso 1 — Desplegar

1. Abre **remix.ethereum.org**.
2. Archivo nuevo `SectoraHolderRewards.sol`. Pega **entero** el contenido de
   `flattened/SectoraHolderRewards.flattened.sol`.
3. **Solidity Compiler**: versión **0.8.24**, **Enable optimization** con
   **200** runs. Compila; no debe salir ningún error.
4. **Deploy & Run**:
   - Environment: **Injected Provider — MetaMask**, red **Ethereum Mainnet**.
   - Contract: **SectoraHolderRewards**.
   - Campo `_token`: `0x8C9984B06281f1CA9416e493c2E602AaB08513db`
     (cópialo, no lo escribas a mano).
5. **Deploy** → confirma en MetaMask → copia la dirección del contrato.

La wallet que despliega queda como **dueña**. Recomendado: una hardware
wallet o una multifirma (Safe).

El contrato nace con los **depósitos cerrados**: nadie puede depositar hasta
que cargues el fondo y los abras (pasos 3 y 4).

## Paso 2 — Verificar en Etherscan

Etherscan → la dirección del contrato → *Contract* → **Verify and Publish**
→ *Solidity (Single file)*, compilador **v0.8.24**, licencia **MIT**,
optimización **Yes / 200**. Pega el mismo archivo aplanado. Con el contrato
verificado, cualquiera puede leer el código: es lo que da confianza.

## Paso 3 — Cargar el fondo de recompensas

1. Contrato de **#SECT** en Etherscan → *Write Contract* → `approve`:
   `spender` = dirección de SectoraHolderRewards, `amount` en 18 decimales.

   | #SECT | valor a escribir |
   |---|---|
   | 100.000 | `100000000000000000000000` |
   | 500.000 | `500000000000000000000000` |
   | 1.000.000 | `1000000000000000000000000` |
   | 1.490.000 | `1490000000000000000000000` |

2. **SectoraHolderRewards** → *Write Contract* → `fundRewards`, la misma
   cantidad.
3. *Read Contract* → `rewardPool()` debe devolver lo cargado.

### Cuánto cargar

```
recompensas al año = total depositado × tasa   (0,149 con el 14,9 %)
```

| Si la gente deposita (al 14,9 %) | Cuesta al año | Al mes |
|---|---|---|
| 1.000.000 #SECT | 149.000 #SECT | ~12.400 |
| 5.000.000 #SECT | 745.000 #SECT | ~62.100 |
| 10.000.000 #SECT | 1.490.000 #SECT | ~124.200 |
| 20.000.000 #SECT | 2.980.000 #SECT | ~248.300 |

Puedes cargar por tramos según vayan entrando depósitos. Vigila
`runwaySeconds()`: los segundos que aguanta el fondo al ritmo actual
(÷ 86400 = días). Si el fondo se queda a cero, las recompensas **se paran**
(no se promete lo que no hay) y se reanudan al recargar, sin pagar el hueco.
Eso son holders enfadados: recarga antes de que llegue a cero.

## Paso 4 — Abrir los depósitos

*Write Contract* → `setDepositsPaused` → `false`.

Para cerrar la entrada de gente nueva en el futuro: `setDepositsPaused(true)`.
Quien ya está sigue pudiendo retirar y cobrar.

## Cambiar la tasa (cuando quieras)

Etherscan → **SectoraHolderRewards** → *Write Contract* → conecta la wallet
dueña → `setRate` → escribe la tasa en **puntos básicos** (1 % = 100):

| APY | valor a escribir |
|---|---|
| 10 % | `1000` |
| 14,9 % | `1490` |
| 20 % | `2000` |
| 25 % | `2500` |
| 100 % | `10000` |
| 120 % (10 % al mes) | `12000` |
| 0 % (parar las recompensas) | `0` |

Para pasar de % al mes a lo que escribes: **% mensual × 1200** (10 % al mes →
`12000`). No hay máximo de negocio: el único tope es técnico (`1e12`), para
que las cuentas del contrato nunca desborden y bloqueen los retiros.
**Revisa el número antes de confirmar**: un cero de más paga el fondo entero
en muy poco tiempo a quien tenga depositado. **Write** → confirma en MetaMask. En *Read Contract*,
`rateBps()` devuelve la tasa actual, y la web la lee del contrato y la
muestra sola.

- El cambio cuenta **desde ese segundo**: todo lo ganado antes se queda
  calculado con la tasa anterior.
- Subir la tasa vacía el fondo más rápido. Revisa `runwaySeconds()` después
  de cambiarla y recarga si hace falta.
- Bajarla no quita nada a nadie, pero anúncialo antes: la gente deposita por
  la tasa que ve.

## Paso 5 — Conectar la web

Pásame la dirección del contrato y conecto la página. Con eso pasa sola de
"vista previa" a "en vivo": conectar wallet, depositar, cobrar y retirar.

---

## Comprobaciones antes de anunciarlo

En *Read Contract*:

- `token()` → `0x8C9984B06281f1CA9416e493c2E602AaB08513db`
- `rateBps()` → `1490`
- `MAX_RATE_BPS()` → `1000000000000` (tope técnico)
- `rewardPool()` → lo que cargaste
- `depositsPaused()` → `false`
- `owner()` → tu wallet

Luego una prueba real con poco desde otra wallet: `approve` de 10 #SECT,
`deposit` de 10, espera unos minutos, mira que `earned(tu wallet)` sube,
`claim`, y `withdraw` de 10.

---

## Lo que el contrato protege

- El depósito de un holder **nunca** puede salir como recompensa de otro, y
  ninguna función del dueño toca depósitos ni recompensas ya ganadas.
- `withdraw` funciona siempre, aunque el fondo esté vacío o los depósitos
  cerrados.
- Sin tope de depósitos. La tasa la cambia solo el dueño, sin límite de
  negocio, y sin tocar lo ya ganado. Nunca se paga más de lo que hay en el
  fondo, sea cual sea la tasa o lo depositado.
- No se crean tokens: todo lo que se paga entró antes con `fundRewards`.
- `nonReentrant` en toda función que mueve tokens, y la cantidad recibida se
  mide en vez de suponerse.

Probado en cadena local: **51 pruebas, todas pasan**
(`node scripts/test-rewards.js`), incluido un año completo que paga
exactamente el 14,9 %, depósitos por encima de 10M sin tope, cambios de tasa (14,9 % → 25 % → 0 % → 14,9 %) que
no tocan lo ya ganado, un mes al 10 % mensual que paga exactamente el 10 %, y
la tasa al tope técnico durante 10 años sin que se bloquee ningún retiro.

## Lo que depende de ti

- **No está auditado.** Las pruebas comprueban lo que se me ocurrió comprobar.
  Una auditoría antes de abrirlo al público es lo recomendable.
- **El fondo sin bloqueo.** Lo elegiste así para tener flexibilidad: puedes
  retirar la parte no ganada cuando quieras. La otra cara es que los holders
  no tienen la garantía de que el fondo vaya a seguir ahí; lo que ya ganaron
  sí está protegido. Si algún día quieres dar más confianza, puedes anunciar
  públicamente un calendario de recargas.
