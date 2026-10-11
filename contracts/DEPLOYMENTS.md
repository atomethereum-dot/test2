# Contratos desplegados

## Ethereum Mainnet

### SectoraHolderRewards (staking)

| | |
|---|---|
| Dirección | `0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0` |
| Etherscan | https://etherscan.io/address/0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0 |
| Fecha | 9 oct 2026 |
| Desplegado desde | `0x9f5F7e78c32861059d1EAA634dE3a000e146f96E`, con Remix e Injected Provider |
| Código | `flattened/SectoraHolderRewards.copy.sol` (el de la revisión, commit 821d041) |
| Compilador | v0.8.24+commit.e11b9ed9, optimización 200 runs, EVM **cancun** |
| Constructor | `_token` = `0x8C9984B06281f1CA9416e493c2E602AaB08513db` (#SECT) |
| Constructor ABI-encoded | `0000000000000000000000008c9984b06281f1ca9416e493c2e602aab08513db` |

Leído en Remix justo después de desplegar:

| Lectura | Valor |
|---|---|
| `owner()` | `0x9f5F7e78c32861059d1EAA634dE3a000e146f96E` |
| `token()` | `0x8C9984B06281f1CA9416e493c2E602AaB08513db` |
| `rateBps()` | `1490` |
| `depositsPaused()` | `true` |

Pendiente:
- [x] Verificado en Etherscan.
- [ ] `transferOwnership` a la Safe y `acceptOwnership` desde la Safe (el dueño decidió seguir con su wallet por ahora).
- [x] Fondo cargado: 1.490.000 #SECT desde la wallet de la fundación `0x09ae50654Fd92F9B62a1a7c97dfA2985e4Fd84FD`.
- [x] Depósitos abiertos (`setDepositsPaused(false)`).
- [x] `staking/staking-chain.js` conectado al contrato.

Blockaid (avisos de MetaMask) marcó el contrato como malicioso tras el lanzamiento; se envió un informe de falso positivo.

**11 oct 2026: Blockaid quitó la alerta y el staking vuelve a estar publicado.** Portada: nueva sección
"03 Holder rewards" encima del Hash Market (tasa y fondo leídos del contrato en vivo), menú, fila 05 de
Developments, hoja de ruta y placa en "live"; whitepaper (web y PDF) como antes de ocultarlo; `/staking/`
sin `noindex` y de vuelta en `sitemap.xml`.

Lo que se hizo mientras estuvo marcado (ya revertido):
- Portada: menú, fila 05 de Developments, hoja de ruta y placa vuelven a "In progress", sin enlace a /staking.
- Whitepaper (web y PDF): §04 ya no menciona el staking; la hoja de ruta dice "Staking — in progress".
- `/staking/` sigue funcionando con el enlace directo (para que quien ya depositó pueda reclamar o retirar), pero lleva `noindex` y salió de `sitemap.xml`.

Para volver a publicarlo: revertir el commit "Hide staking until Blockaid clears the alert".
