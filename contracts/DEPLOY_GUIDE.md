# Sectora Testnet — Guía de despliegue real en Sepolia

Los 3 contratos ya están escritos, compilados y probados (20/20 tests pasando
localmente, cubriendo faucet, staking con recompensas por tiempo real, y
registro de validadores). Yo no puedo enviar la transacción de despliegue
porque este entorno no tiene salida de red hacia ningún RPC de blockchain —
tenés que hacer el despliegue vos mismo desde tu navegador, con tu MetaMask.
Son ~10 minutos, sin instalar nada.

## Paso 0 — Preparar la wallet

1. Abrí MetaMask, cambiá a la red **Sepolia** (si no la tenés, activala en
   Configuración → Redes → Mostrar redes de testnet).
2. Conseguí ETH de prueba gratis en un faucet, por ejemplo:
   https://sepoliafaucet.com o https://www.alchemy.com/faucets/ethereum-sepolia
   (necesitás muy poco, ~0.05 ETH de test alcanza para los 3 despliegues).

## Paso 1 — Abrir Remix

Andá a **https://remix.ethereum.org** (IDE de Solidity, corre en tu navegador,
no requiere cuenta).

## Paso 2 — Pegar y desplegar SectoraToken

1. En el panel de archivos de Remix, creá un archivo nuevo: `SectoraToken.sol`.
2. Pegá el contenido de `SectoraToken.flattened.sol` (adjunto).
3. Andá a la pestaña **Solidity Compiler** (ícono de Solidity), seleccioná
   versión **0.8.24**, activá el optimizador (200 runs), y hacé clic en
   **Compile SectoraToken.sol**.
4. Andá a la pestaña **Deploy & Run Transactions**. En "Environment" elegí
   **Injected Provider - MetaMask** (esto conecta tu MetaMask real).
   Confirmá en MetaMask que estás en Sepolia.
5. En el campo del constructor (`initialSupply`), poné:
   ```
   1000000000000000000000000
   ```
   (esto es 1,000,000 tSECT con 18 decimales).
6. Hacé clic en **Deploy**, confirmá la transacción en MetaMask.
7. **Copiá la dirección del contrato desplegado** (aparece abajo, en
   "Deployed Contracts") — la vas a necesitar para los próximos pasos.

## Paso 3 — Pegar y desplegar SectoraStaking

1. Archivo nuevo `SectoraStaking.sol`, pegá `SectoraStaking.flattened.sol`.
2. Compilá igual que antes (0.8.24, optimizador 200 runs).
3. En el constructor (`_stakeToken`), pegá la **dirección de SectoraToken**
   del paso anterior.
4. Deploy, confirmá en MetaMask, copiá la dirección desplegada.

## Paso 4 — Pegar y desplegar ValidatorRegistry

1. Archivo nuevo `ValidatorRegistry.sol`, pegá `ValidatorRegistry.flattened.sol`.
2. Compilá igual.
3. No tiene argumentos de constructor — Deploy directo, confirmá, copiá la
   dirección.

## Paso 5 — Fondear las recompensas de staking (opcional pero recomendado)

Para que el staking realmente pague recompensas:

1. En el contrato **SectoraToken** ya desplegado (panel "Deployed Contracts"),
   buscá la función `approve`. Llamala con:
   - `spender`: la dirección de SectoraStaking
   - `amount`: `50000000000000000000000` (50,000 tSECT de reserva)
2. En el contrato **SectoraStaking**, llamá a `fundRewards` con:
   - `amount`: `50000000000000000000000`
3. Llamá a `setApyBps` con:
   - `apyBps`: `800` (= 8% APY)
   - `referenceStake`: `100000000000000000000000` (100,000 tSECT como
     referencia — el APY real mostrado en vivo se ajusta según cuánto se
     stakee de verdad)

## Paso 6 — Pasarme las 3 direcciones

Una vez desplegado, pasame:
- Dirección de **SectoraToken**
- Dirección de **SectoraStaking**
- Dirección de **ValidatorRegistry**

Con eso conecto el Dashboard para que lea y escriba contra estos contratos
reales (faucet, stake/unstake real desde la wallet conectada, node map con
validadores registrados de verdad), usando la conexión de wallet que ya está
armada.

## Verificar en Etherscan (opcional, para que se vea el código fuente público)

Remix tiene un plugin "Contract Verification" — buscalo en el ícono de
plugins (enchufe) → "CONTRACT VERIFICATION - REMIX", conectalo a Sepolia
Etherscan, y verificá cada contrato pegando el mismo archivo `.flattened.sol`
que usaste para desplegar. Esto hace público el código fuente en
https://sepolia.etherscan.io — no es obligatorio pero le da más
credibilidad/transparencia al testnet.
