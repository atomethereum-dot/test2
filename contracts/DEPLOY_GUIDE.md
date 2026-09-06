# Sectora Testnet — Guía de despliegue real en Sepolia

Los 4 contratos ya están escritos, compilados y probados localmente: 27/27
para token, mercado de hash y registro de validadores, y 49/49 para el
staking (devengo, bloqueo, fondo agotado, salida de emergencia, permisos y
solvencia).

Yo no puedo enviar la transacción de despliegue porque este entorno no tiene
salida de red hacia ningún RPC de blockchain — tenés que hacer el despliegue
vos mismo desde tu navegador, con tu MetaMask. Son ~10 minutos, sin instalar
nada.

## Cómo funciona el sistema

1. **SectoraToken (tSECT)** — token de prueba, sin valor real, con faucet
   (1,000 tSECT gratis cada 24h por wallet).
2. **SectoraHashMarket** — acá se "compra" Hash (poder de cómputo) pagando
   con tSECT. Hay 6 paquetes predefinidos:
   - *Online* (alquiler de hash): Starter Hash (100 tSECT → 10 hash),
     Pro Hash (450 tSECT → 50 hash), Enterprise Hash (1,800 tSECT → 220 hash).
   - *Físico* (equipo de validación): Home Validator Kit (300 tSECT → 45
     hash), Pro Rack Node (1,200 tSECT → 200 hash), Datacenter Node (5,000
     tSECT → 950 hash) — mejor precio por hash, simulando que es una compra
     de hardware propio.
   - El pago va a una wallet **tesorería** que vos elegís al desplegar.
3. **SectoraStaking** — depositás tSECT y devengás recompensas de un fondo
   aportado, a la tasa que fijás al desplegar (1490 pb = 14,9 %). No acuña:
   todo lo que paga entró antes por `fundRewards`. Si el fondo se seca, el
   devengo se pausa en vez de generar una deuda impagable, y el principal
   siempre se puede retirar.
4. **ValidatorRegistry** — para registrarte como validador necesitás tener
   un mínimo de Hash comprado (lo definís al desplegar, ej. 40). Si no
   comprás Hash primero, el registro falla.

## Paso 0 — Preparar la wallet

1. Abrí MetaMask, cambiá a la red **Sepolia** (Configuración → Redes →
   Mostrar redes de testnet).
2. Conseguí ETH de prueba gratis: https://sepoliafaucet.com o
   https://www.alchemy.com/faucets/ethereum-sepolia (con ~0.05 ETH de test
   alcanza para los 3 despliegues).

## Paso 1 — Abrir Remix

Andá a **https://remix.ethereum.org** (corre en tu navegador, sin cuenta).

## Paso 2 — Desplegar SectoraToken

1. Archivo nuevo `SectoraToken.sol`, pegá `SectoraToken.flattened.sol`.
2. Pestaña **Solidity Compiler**: versión **0.8.24**, optimizador activado
   (200 runs), **Compile**.
3. Pestaña **Deploy & Run Transactions**, Environment = **Injected Provider
   - MetaMask** (confirmá que estás en Sepolia).
4. Constructor `initialSupply`, poné:
   ```
   50000000000000000000000000
   ```
   (50,000,000 tSECT con 18 decimales — mismo supply inicial que
   tendrá el token real en mainnet).
5. **Deploy**, confirmá en MetaMask, **copiá la dirección desplegada**.

## Paso 3 — Desplegar SectoraHashMarket

1. Archivo nuevo `SectoraHashMarket.sol`, pegá `SectoraHashMarket.flattened.sol`.
2. Compilá igual (0.8.24, optimizador 200 runs).
3. Constructor:
   - `_paymentToken`: la dirección de **SectoraToken** del paso 2.
   - `_treasury`: la dirección de wallet que va a recibir los pagos (puede
     ser la misma que estás usando para desplegar, u otra).
4. Deploy, confirmá, copiá la dirección.

## Paso 4 — Desplegar ValidatorRegistry

1. Archivo nuevo `ValidatorRegistry.sol`, pegá `ValidatorRegistry.flattened.sol`.
2. Compilá igual.
3. Constructor:
   - `_hashMarket`: la dirección de **SectoraHashMarket** del paso 3.
   - `_minHashToValidate`: el mínimo de hash requerido para poder
     registrarse como validador. Recomendado: `40` (así, comprar solo
     "Starter Hash" no alcanza, pero un "Home Validator Kit" o combinar
     dos compras online sí).
4. Deploy, confirmá, copiá la dirección.

## Paso 5 — Desplegar SectoraStaking

1. Archivo nuevo `SectoraStaking.sol`, pegá `SectoraStaking.flattened.sol`.
2. Compilá igual (0.8.24, optimizador activado).
3. Constructor:
   - `_stakingToken`: la dirección de **SectoraToken** del paso 2.
   - `_rateBps`: la tasa anual en puntos básicos. Para el 14,9 % que anuncia
     la web: **`1490`**. El contrato no admite más de `10000` (100 %).
   - `_lockPeriod`: segundos que un depósito debe quedarse antes de poder
     retirarse. Recomendado `604800` (7 días). Poné `0` si querés poder
     probar la retirada sin esperar.
4. Deploy, confirmá, copiá la dirección.

### Paso 5b — Cargar el fondo de recompensas (imprescindible)

**El contrato no acuña nada.** Si el fondo está vacío no se devenga ni un
token, por diseño: la web dice que las recompensas salen de los ingresos de
hash, y el contrato lo cumple literalmente en vez de prometer una deuda que
no podría pagar.

Para cargarlo, con la wallet dueña del token:

1. En **SectoraToken**, llamá a `approve` con:
   - `spender`: la dirección de **SectoraStaking**
   - `amount`: lo que vayas a aportar, en wei (ej. 10.000 tSECT =
     `10000000000000000000000`)
2. En **SectoraStaking**, llamá a `fundRewards` con esa misma cantidad.
3. Comprobá que `rewardPool()` devuelve lo aportado.

`runwaySeconds()` te dice cuántos segundos aguanta el fondo al ritmo actual:
es la versión honesta del cartel de APY, porque dice hasta cuándo está
financiada de verdad la tasa anunciada.

Para recuperar lo no asignado usá **`withdrawAllRewards(to)`**, no
`withdrawRewards`: esta última compara contra el fondo ya actualizado, así
que pasarle el valor que acabás de leer siempre revierte por unas milésimas.

## Paso 6 — Pasarme las 4 direcciones

Una vez desplegado, pasame:
- Dirección de **SectoraToken**
- Dirección de **SectoraHashMarket**
- Dirección de **ValidatorRegistry**
- Dirección de **SectoraStaking**

Con eso conecto el Dashboard para que el faucet, la compra de Hash (online y
física) y el registro de validadores funcionen de verdad, y la página de
staking para depositar, cobrar y retirar.

En concreto, para el staking sólo hay que rellenar dos líneas en
`staking/staking-chain.js`:

```js
const CONTRACTS = {
  chainId: "0xaa36a7",   // Sepolia
  token:   "0x...",      // SectoraToken
  staking: "0x...",      // SectoraStaking
};
```

Mientras sigan en cero, ese módulo se retira solo y la página de staking se
queda en la vista previa que tiene hoy — no quedan botones muertos.

## Verificar en Etherscan (opcional)

Remix tiene un plugin "Contract Verification" (ícono de enchufe →
"CONTRACT VERIFICATION - REMIX"), conectalo a Sepolia Etherscan, y verificá
cada contrato pegando el mismo `.flattened.sol` que usaste para desplegar.
No es obligatorio, pero hace público el código fuente en
https://sepolia.etherscan.io.
