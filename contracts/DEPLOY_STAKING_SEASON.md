# SectoraStakingSeason — despliegue en Ethereum Mainnet

El programa de staking de 12 meses, pagado por la tesorería como estrategia
de marketing y crecimiento en lugar de un airdrop.

## Las reglas (fijas en el contrato)

| | |
|---|---|
| Recompensa | **7 % al mes** sobre lo depositado, devengo por segundo, sin interés compuesto |
| Cobro mensual | **3,5 % al mes**, se cobra una vez al mes (`claimMonthly`) |
| Cobro final | **3,5 % al mes**, acumulado, se cobra al cerrar la temporada (`claimFinal`) |
| Duración | **12 meses** desde el despliegue (`seasonEnd`) |
| Total si se queda los 12 meses | **84 %**: 42 % en mensualidades + 42 % al final |
| Bloqueo | **Ninguno**: `unstake` funciona siempre |
| Tope del programa | **10.000.000 #SECT** en staking como máximo. Coste máximo para la tesorería: **8.400.000 #SECT** |
| Ventana de 24 h | Si alguien retira por debajo de su máximo, tiene 24 h para volver a depositar. Si no vuelve, pierde todo lo **no cobrado** (mensual y final). Lo ya cobrado no se toca. |

La tasa, el reparto 50/50, los 12 meses, el tope de 10M y las 24 h son **constantes**. Nadie,
tampoco el dueño, puede cambiarlos después de desplegar.

---

## Los datos

| | |
|---|---|
| Red | **Ethereum Mainnet** (chainId 1) |
| Token | **`0x8C9984B06281f1CA9416e493c2E602AaB08513db`** (#SECT, 18 decimales) |
| Contrato a desplegar | `SectoraStakingSeason` |
| Código para pegar | `flattened/SectoraStakingSeason.flattened.sol` |
| Compilador | **0.8.24**, optimizador **activado**, runs **200** |
| Constructor | un solo campo: `_stakingToken` = la dirección del token de arriba |

---

## Lo que cuesta en gas (medido)

| Operación | Gas | Quién paga |
|---|---|---|
| Desplegar | **2.069.369** | tú, una vez |
| `approve` del fondo | ~46.000 | tú |
| `fundRewards` | ~98.000 | tú, cada recarga |
| `setStakingPaused(false)` | ~25.000 | tú, una vez |
| `stake` | ~176.000 (primer depósito) | el usuario |
| `claimMonthly` | ~137.000 | el usuario |
| `claimFinal` | ~73.000 | el usuario |
| `unstake` | ~68.000–130.000 | el usuario |

Coste = gas × precio del gas. Mira etherscan.io/gastracker y despliega cuando
esté barato. Ten en la wallet unos **0,05–0,1 ETH** de margen.

---

## ⚠️ Antes de desplegar: el reloj arranca al desplegar

`seasonEnd` = momento del despliegue + 12 meses. **Despliega el mismo día que
vayas a cargar el fondo y abrir el staking.** Si despliegas hoy y abres en
dos semanas, la temporada durará 11,5 meses para todos.

El contrato nace con los **depósitos cerrados** (`stakingPaused = true`), para
que nadie pueda depositar antes de que el fondo esté cargado.

---

## Paso 1 — Desplegar

1. Abre **remix.ethereum.org**.
2. Archivo nuevo `SectoraStakingSeason.sol`. Pega entero el contenido de
   `flattened/SectoraStakingSeason.flattened.sol`.
3. **Solidity Compiler**: versión **0.8.24**, **Enable optimization** con
   **200** runs. Compila; no debe salir ningún error.
4. **Deploy & Run**:
   - Environment: **Injected Provider — MetaMask**, red **Ethereum Mainnet**.
   - Contract: **SectoraStakingSeason**.
   - Campo `_stakingToken`: `0x8C9984B06281f1CA9416e493c2E602AaB08513db`
     (cópialo, no lo escribas a mano).
5. **Deploy** → confirma en MetaMask → copia la dirección del contrato.

La wallet que despliega queda como **dueña**. Recomendado: una multifirma
(Safe) o una hardware wallet.

## Paso 2 — Verificar en Etherscan

En Remix, plugin **Contract Verification** → Etherscan mainnet, con el mismo
archivo aplanado y la misma configuración (0.8.24, optimizador 200). O en
Etherscan → *Verify and Publish* → *Solidity (Single file)*.

## Paso 3 — Cargar el fondo de recompensas

El contrato **no acuña**: cada token que paga tiene que haber entrado antes.

1. Contrato de **#SECT** en Etherscan → *Write Contract* → `approve`:
   `spender` = dirección de SectoraStakingSeason, `amount` en 18 decimales.

   | #SECT | valor a escribir |
   |---|---|
   | 100.000 | `100000000000000000000000` |
   | 1.000.000 | `1000000000000000000000000` |
   | 5.000.000 | `5000000000000000000000000` |

2. **SectoraStakingSeason** → *Write Contract* → `fundRewards` con la misma
   cantidad.
3. *Read Contract* → `rewardPool()` debe devolver lo cargado.

### Cuánto cargar

```
fondo necesario = total depositado × 0,84      (12 meses completos)
```

| Si la gente deposita | El fondo necesita |
|---|---|
| 1.000.000 #SECT | 840.000 #SECT |
| 5.000.000 #SECT | 4.200.000 #SECT |
| 10.000.000 #SECT (el tope) | 8.400.000 #SECT (el máximo posible) |

Puedes cargar por tramos. Dos lecturas te dicen si vas bien:

- `fundingGap()` → cuánto falta para cubrir **el resto de la temporada** con
  lo depositado hoy. Si es mayor que 0, recarga.
- `runwaySeconds()` → cuántos segundos aguanta el fondo actual. ÷ 86400 = días.

Si el fondo llega a cero, el devengo **se para** (no promete lo que no puede
pagar) y se reanuda al recargar, sin pagar el hueco. Eso son holders
enfadados: vigila `fundingGap()` cada semana.

**Lo que cargues se queda hasta el final.** El dueño no puede retirar el
fondo durante los 12 meses (`withdrawRewards` y `withdrawAllRewards`
revierten hasta `seasonEnd`). Es la garantía que ven los holders: la
tesorería no puede echarse atrás a mitad de temporada. Por eso conviene
cargar por tramos según crezcan los depósitos.

## Paso 4 — Abrir los depósitos

*Write Contract* → `setStakingPaused` → `false`.

Si algún día quieres cerrar la entrada de gente nueva (por ejemplo, porque
ya no quieres financiar más), `setStakingPaused(true)`: quien ya está sigue
cobrando, retirando y todo lo demás.

## Paso 5 — Conectar la web

Pásame la dirección y lo hago yo. Es una línea en `staking/staking-chain.js`:

```js
staking: "0x...",   // <-- dirección del paso 1
```

Con eso la página de staking pasa sola de "vista previa" a "en vivo": botón
de conectar wallet, depositar, cobrar mensual, cobrar final y retirar, con
la cuenta atrás de la ventana de 24 h y del próximo cobro mensual.

---

## Comprobaciones antes de anunciarlo

En *Read Contract*:

- `stakingToken()` → `0x8C9984B06281f1CA9416e493c2E602AaB08513db`
- `RATE_BPS()` → `8400`   (84 % anual = 7 % mensual)
- `MONTHLY_SHARE_BPS()` → `5000`   (mitad mensual, mitad al final)
- `seasonEnd()` → fecha de despliegue + 365 días (conviértela en
  epochconverter.com)
- `rewardPool()` → lo que cargaste
- `MAX_TOTAL_STAKED()` → `10000000000000000000000000` (10M con 18 decimales)
- `remainingCapacity()` → cuánto cupo queda
- `stakingPaused()` → `false`
- `owner()` → tu wallet

Luego una prueba real con poco desde otra wallet: deposita 10 #SECT, mira
que `earned()` sube, retira 5, vuelve a depositarlos antes de 24 h y
comprueba con `accountView` que no perdiste nada.

---

## Lo que el contrato ya protege

- El depósito de un usuario **nunca** puede salir como recompensa de otro, y
  ninguna función del dueño toca depósitos ni recompensas ya devengadas.
- `unstake` y `emergencyWithdraw` funcionan siempre, aunque el fondo esté
  vacío o los depósitos cerrados.
- El tope de 10M se aplica a gente nueva, no a quien repone lo suyo: si
  alguien retira y el programa se llena mientras tanto, puede volver a
  depositar lo suyo dentro de las 24 h igualmente. Así un programa lleno
  nunca le quita a nadie lo acumulado.
- El atajo de sacar el 99,9 % dejando 1 wei dentro no funciona: la ventana
  de 24 h se abre en cuanto el saldo baja de su máximo.
- Con la ventana abierta no se puede cobrar el mensual, así que nadie puede
  sacar el depósito, cobrar e irse con lo que la ventana iba a quitarle.
- Lo que pierde quien no vuelve regresa al fondo de recompensas, no al dueño.
- `nonReentrant` en toda función que mueve tokens, y la cantidad recibida se
  mide en vez de suponerse.

Probado en cadena local: **61 pruebas, todas pasan**
(`node scripts/test-season.js`), incluida una temporada completa de 12 meses
que paga exactamente 84 % (420 en mensualidades + 420 al final sobre 1.000).

## Lo que no protege, y depende de ti

- **No está auditado.** Las pruebas comprueban lo que se me ocurrió
  comprobar. Para un contrato que va a guardar dinero de la gente, una
  auditoría antes de abrirlo al público es lo recomendable.
- **Financiar el fondo.** Con el programa lleno (10M) son 8,4M #SECT de la
  tesorería en 12 meses. Carga por tramos según vaya entrando gente y
  vigila `fundingGap()`.
