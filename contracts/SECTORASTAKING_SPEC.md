# SectoraStaking — especificación completa

Referencia del contrato de staking de #SECT. Todo lo de aquí sale de la ABI
compilada y del código, no de memoria.

| | |
|---|---|
| Contrato | `SectoraStaking` |
| Solidity | 0.8.24, optimizador activado, 200 runs |
| Hereda | `Ownable`, `ReentrancyGuard` (OpenZeppelin 5) |
| Bytecode | 7.730 bytes |
| Token | el que se pase al desplegar. En mainnet, #SECT `0x8C9984B06281f1CA9416e493c2E602AaB08513db` (18 decimales) |

---

## 1. Cómo funciona el APY

### La fórmula

El devengo es **lineal y por segundo**, sobre el total depositado:

```
recompensa del periodo = totalStaked × rateBps × segundos
                         ─────────────────────────────────
                              10.000 × 31.536.000
```

Donde `10.000` es `BPS` (base de puntos básicos) y `31.536.000` es `YEAR`
(365 días en segundos).

Con `rateBps = 1490` eso es un **14,90 % anual simple**. No es compuesto: el
contrato no reinvierte tus recompensas solo. Si quieres componer, cobras con
`claim()` y vuelves a depositar con `stake()`.

**Comprobado**: 1.000 tokens depositados un año exacto devengan 149,00.

### Cómo se reparte entre varios

Se usa un acumulador (`accRewardPerToken`), el patrón estándar: cada cuenta
guarda una marca (`rewardDebt`) del acumulador en su último movimiento, y lo
devengado es la diferencia. Consecuencias prácticas:

- **Reparto proporcional al depósito y al tiempo.** Quien pone el doble
  devenga el doble.
- **Coste constante.** Entrar o salir cuesta lo mismo con 10 participantes
  que con 10.000. No hay bucles.

### La tasa es un objetivo, no una promesa

**El contrato no acuña nada.** Cada token que paga entró antes por
`fundRewards()`. Si el fondo se agota:

1. Se paga lo que quede en el fondo.
2. `accrualPaused` pasa a `true` y **el devengo se detiene**.
3. Al refinanciar, se reanuda **sin devengo retroactivo** por el hueco.

Es deliberado: la alternativa —seguir devengando— crearía una deuda que el
contrato no puede pagar, y los primeros en cobrar se llevarían el principal
de los demás.

### Cuánto cuesta mantenerlo

```
#SECT al año = total depositado × (rateBps / 10.000)
```

Con 1490 pb: **por cada 1.000.000 depositados, 149.000 al año.**

`runwaySeconds()` devuelve cuántos segundos aguanta el fondo al ritmo y
volumen actuales. Entre 86.400 para días.

---

## 2. Funciones de escritura

### Para cualquiera

| Función | Qué hace |
|---|---|
| `stake(uint256 amount)` | Deposita. Requiere `approve` previo en el token. Reinicia tu bloqueo y congela el bloqueo vigente. Revierte si `stakingPaused`. |
| `unstake(uint256 amount)` | Retira principal. Revierte si sigues dentro de tu bloqueo o si pides más de lo que tienes. Las recompensas pendientes **se conservan**. |
| `claim()` | Cobra lo devengado. Revierte si es cero. No toca el principal. |
| `emergencyWithdraw()` | Saca **todo** el principal saltándose el bloqueo, **cediendo** las recompensas pendientes, que vuelven al fondo. La salida de seguridad. |
| `fundRewards(uint256 amount)` | Aporta tokens al fondo de recompensas. **Abierta a cualquiera**: no hay razón para impedir una donación. Requiere `approve` previo. |

### Solo el dueño

| Función | Qué hace | Límite |
|---|---|---|
| `setRate(uint256 newRateBps)` | Cambia la tasa. Liquida lo devengado al ritmo viejo antes de aplicar el nuevo. | ≤ `10000` (100 %) |
| `setLockPeriod(uint256 s)` | Cambia el bloqueo **para depósitos futuros**. | ≤ `7776000` (90 días) |
| `setStakingPaused(bool)` | Frena depósitos nuevos. Retirar, cobrar y la salida de emergencia **siguen abiertos**. | — |
| `withdrawRewards(address to, uint256 amount)` | Retira del fondo no asignado. | ≤ `rewardPool` |
| `withdrawAllRewards(address to)` | Vacía el fondo no asignado de una vez. | — |
| `transferOwnership(address)` | Cede la propiedad. | — |
| `renounceOwnership()` | Renuncia a la propiedad. **Irreversible.** | — |

> `withdrawRewards` con la cifra que acabas de leer **siempre revierte**:
> `_update()` encoge el fondo entre la lectura y la comprobación. Para vaciar,
> usa `withdrawAllRewards`.

---

## 3. Funciones de lectura

### Para la interfaz

**`accountView(address)`** → todo lo de una cuenta en una llamada:

| Campo | Significado |
|---|---|
| `staked` | principal depositado |
| `pendingRewards` | devengado y sin cobrar, al segundo actual |
| `unlocksAt` | marca de tiempo en que se puede retirar (0 si no hay depósito) |
| `walletBalance` | saldo del token en la cartera |
| `allowance` | cuánto tiene aprobado hacia el contrato |

**`poolView()`** → el estado global:

| Campo | Significado |
|---|---|
| `staked` | total depositado por todos |
| `pool` | fondo de recompensas disponible |
| `rate` | tasa en puntos básicos |
| `lock` | bloqueo actual en segundos |
| `paused` | si el devengo está detenido por fondo agotado |
| `stakers` | número de cuentas con depósito |
| `chainTime` | `block.timestamp`, para comparar el desbloqueo contra el reloj de la cadena y no el del navegador |

### Individuales

| Función | Devuelve |
|---|---|
| `earned(address)` | devengado sin cobrar, incluida la ventana desde la última escritura |
| `runwaySeconds()` | segundos que aguanta el fondo al ritmo actual |
| `totalStaked()` | total depositado |
| `rewardPool()` | fondo disponible |
| `stakerCount()` | participantes con depósito |
| `rateBps()` | tasa en puntos básicos |
| `lockPeriod()` | bloqueo actual en segundos |
| `stakingPaused()` | si los depósitos están frenados |
| `accrualPaused()` | si el devengo está detenido |
| `stakingToken()` | dirección del token |
| `owner()` | dirección del dueño |
| `accounts(address)` | struct crudo: `amount`, `rewardDebt`, `pending`, `stakedAt`, `lockAtStake` |
| `accRewardPerToken()` | acumulador, escalado 1e18 |
| `lastUpdate()` | último instante en que se movió el acumulador |

### Constantes

| Constante | Valor | Qué es |
|---|---|---|
| `BPS` | `10000` | base de puntos básicos |
| `YEAR` | `31536000` | 365 días en segundos |
| `MAX_RATE_BPS` | `10000` | tope de tasa: 100 % anual |
| `MAX_LOCK_PERIOD` | `7776000` | tope de bloqueo: 90 días |

---

## 4. Eventos

| Evento | Cuándo |
|---|---|
| `Staked(account, amount)` | alguien deposita |
| `Unstaked(account, amount)` | alguien retira principal |
| `RewardClaimed(account, amount)` | alguien cobra |
| `EmergencyWithdrawn(account, amount, forfeited)` | salida de emergencia, con lo cedido |
| `RewardsFunded(from, amount, poolAfter)` | se aporta al fondo |
| `RewardsWithdrawn(to, amount, poolAfter)` | el dueño retira del fondo |
| `RateChanged(oldRateBps, newRateBps)` | cambio de tasa |
| `LockPeriodChanged(oldLockPeriod, newLockPeriod)` | cambio de bloqueo |
| `StakingPausedChanged(paused)` | freno de depósitos |
| `AccrualPaused(atTimestamp, poolRemaining)` | el fondo se agotó |
| `AccrualResumed(atTimestamp, poolRemaining)` | se refinanció |
| `OwnershipTransferred(previousOwner, newOwner)` | cambio de dueño |

---

## 5. Garantías de seguridad

Lo que el contrato impide por diseño:

1. **El principal de un usuario nunca sale como recompensa de otro.**
   `totalStaked` y `rewardPool` se llevan separados, y cada pago se comprueba
   contra el fondo. Ninguna función del dueño puede tocar el principal.
2. **No se puede prometer lo impagable.** Con el fondo seco, el devengo se
   detiene en el último segundo financiado.
3. **Nadie queda encerrado.** `emergencyWithdraw` devuelve el principal
   saltándose el bloqueo, y el freno de depósitos no cierra las salidas.
4. **El bloqueo no se puede alargar retroactivamente.** Cada cuenta guarda
   en `lockAtStake` el bloqueo vigente cuando depositó.
5. **Tope al bloqueo**: 90 días, para que un bloqueo desmedido no sea una
   herramienta de secuestro.
6. **Tope a la tasa**: 100 %, que acota lo rápido que una llave comprometida
   podría vaciar el fondo.
7. **Cantidad medida, no asumida.** En `stake` y `fundRewards` se mide el
   saldo antes y después, por si el token cobrase comisión al transferir.
8. **`nonReentrant`** en toda función que mueve tokens.

### Lo que NO cubre

- **El contrato no está auditado.** 54 pruebas locales pasando y una prueba
  de punta a punta en navegador no son una auditoría.
- **La llave del dueño.** No puede tocar el principal, pero sí vaciar el
  fondo de recompensas y subir la tasa. Con dinero real, el dueño debería
  ser una **multifirma**.

---

## 6. Estado de las pruebas

54 pruebas contra un nodo local, todas pasando. Cubren:

- despliegue y rechazo de parámetros inválidos
- depósito, contador de participantes y doble depósito
- fondo vacío: no devenga ni deja cobrar
- el principal ajeno es intocable por el dueño
- devengo a un año: 149,00 sobre 1.000 al 14,9 %
- reparto proporcional entre dos cuentas
- cobro, y que no toque el principal
- bloqueo: impide retirar dentro, permite fuera
- fondo agotado: pausa el devengo, el principal sigue retirable
- refinanciación: reanuda
- salida de emergencia: saca principal, cede recompensas
- solvencia: saldo ≥ principal + fondo
- permisos: nadie ajeno cambia tasa, bloqueo, fondo ni freno
- subir el bloqueo no alarga depósitos ya hechos
- con el freno puesto no entran depósitos pero sí se puede salir

Para ejecutarlas:

```
npx hardhat node          # en otra terminal
node scripts/compile.js
node scripts/test-staking.js
```
