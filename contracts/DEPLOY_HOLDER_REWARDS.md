# SectoraHolderRewards — despliegue en Ethereum Mainnet

El programa de recompensas para holders de #SECT: **14,9 % APY**, pagado por
la tesorería de Sectora Foundation.

## Las reglas (fijas en el contrato)

| | |
|---|---|
| Recompensa | **14,9 % APY**, se acumula cada segundo, sin interés compuesto |
| Cobro | **Cuando quieran** (`claim`) |
| Retiro | **Cuando quieran, sin penalización** (`withdraw`). Lo ganado sigue cobrable después de retirar |
| Tope | **10.000.000 #SECT** depositados como máximo |
| Duración | Sin fecha de fin |
| Fondo de recompensas | Lo carga la tesorería. **Sin bloqueo**: el dueño puede retirar en cualquier momento la parte que nadie ha ganado todavía |

La tasa (14,9 %) y el tope (10M) son **constantes**: nadie puede cambiarlos
después de desplegar.

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
| Desplegar | **1.472.251** | tú, una vez |
| `approve` del fondo | ~46.000 | tú |
| `fundRewards` | ~98.000 | tú, en cada recarga |
| `setDepositsPaused(false)` | ~25.000 | tú, una vez |
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
recompensas al año = total depositado × 0,149
```

| Si la gente deposita | Cuesta al año | Al mes |
|---|---|---|
| 1.000.000 #SECT | 149.000 #SECT | ~12.400 |
| 5.000.000 #SECT | 745.000 #SECT | ~62.100 |
| 10.000.000 #SECT (el tope) | 1.490.000 #SECT | ~124.200 |

Puedes cargar por tramos según vayan entrando depósitos. Vigila
`runwaySeconds()`: los segundos que aguanta el fondo al ritmo actual
(÷ 86400 = días). Si el fondo se queda a cero, las recompensas **se paran**
(no se promete lo que no hay) y se reanudan al recargar, sin pagar el hueco.
Eso son holders enfadados: recarga antes de que llegue a cero.

## Paso 4 — Abrir los depósitos

*Write Contract* → `setDepositsPaused` → `false`.

Para cerrar la entrada de gente nueva en el futuro: `setDepositsPaused(true)`.
Quien ya está sigue pudiendo retirar y cobrar.

## Paso 5 — Conectar la web

Pásame la dirección del contrato y conecto la página. Con eso pasa sola de
"vista previa" a "en vivo": conectar wallet, depositar, cobrar y retirar.

---

## Comprobaciones antes de anunciarlo

En *Read Contract*:

- `token()` → `0x8C9984B06281f1CA9416e493c2E602AaB08513db`
- `RATE_BPS()` → `1490`
- `MAX_TOTAL_DEPOSITED()` → `10000000000000000000000000`
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
- La tasa y el tope no se pueden cambiar.
- No se crean tokens: todo lo que se paga entró antes con `fundRewards`.
- `nonReentrant` en toda función que mueve tokens, y la cantidad recibida se
  mide en vez de suponerse.

Probado en cadena local: **35 pruebas, todas pasan**
(`node scripts/test-rewards.js`), incluido un año completo que paga
exactamente el 14,9 %.

## Lo que depende de ti

- **No está auditado.** Las pruebas comprueban lo que se me ocurrió comprobar.
  Una auditoría antes de abrirlo al público es lo recomendable.
- **El fondo sin bloqueo.** Lo elegiste así para tener flexibilidad: puedes
  retirar la parte no ganada cuando quieras. La otra cara es que los holders
  no tienen la garantía de que el fondo vaya a seguir ahí; lo que ya ganaron
  sí está protegido. Si algún día quieres dar más confianza, puedes anunciar
  públicamente un calendario de recargas.
