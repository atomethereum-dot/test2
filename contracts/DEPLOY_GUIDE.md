# Sectora Testnet — despliegue en Sepolia

Tres contratos, compilados y probados en local (`scripts/test-hashmarket.js`, 26/26):

1. **SectoraToken (tSECT)**: token de prueba sin valor real, 50.000.000 iniciales,
   faucet de **5.000 tSECT cada 24 h** por wallet. Quemable.
2. **SectoraHashMarket**: compra de hash con tSECT. Los mismos paquetes que muestra el dash:
   - Online: Starter (490 tSECT, 5 TH/s), Standard (2.200, 25 TH/s), Pro (8.200, 100 TH/s).
   - Físico: Node Kit (4.300, 50 TH/s), Node Kit XL (19.500, 250 TH/s).
   - De cada compra, el **80% se quema** (recompra simulada) y el **20% queda en la reserva**.
   - Cada wallet gana un **25% APY fijo** sobre los tSECT gastados en hash, por segundo,
     y lo cobra cuando quiere (`claim`). La reserva se recarga con `fundRewards` o
     acuñando tSECT directamente al contrato.
3. **ValidatorRegistry**: registro de nodos, mínimo **50 TH/s** comprados.

## Desplegar (10 minutos, desde el navegador)

El entorno de desarrollo no tiene salida a ningún RPC, así que el despliegue se hace
con tu MetaMask:

1. MetaMask en la red **Sepolia** con unos 0,05 ETH de prueba
   (faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia).
2. Abre **https://sectoraorg.com/dash/deploy.html** y pulsa *Conectar MetaMask y desplegar*.
3. Confirma 4 transacciones: token, marketplace, registro y la reserva inicial de
   5.000.000 tSECT para el APY. Si algo se corta, vuelve a pulsar: la página continúa
   donde se quedó.
4. Copia las direcciones que muestra al final y envíalas. Se pegan en
   `dash/testnet-config.json` y el dash pasa de modo demo a la cadena real.

## Verificar en Etherscan (opcional)

En https://sepolia.etherscan.io → contrato → *Verify and Publish*: Solidity single file,
compilador **v0.8.24**, optimizador **sí, 200 runs**, licencia MIT, y pega el
`.flattened.sol` correspondiente de `contracts/flattened/`. Argumentos del constructor:
token `50000000000000000000000000`; marketplace la dirección del token;
registro la dirección del marketplace y `50`.

## Recompilar

`node scripts/compile.js` (artefactos para las pruebas), `node scripts/flatten.js` y
`node scripts/build-web-artifacts.js` (bytecode que usa la página de despliegue, compilado
desde los mismos `.flattened.sol` que se verifican).
