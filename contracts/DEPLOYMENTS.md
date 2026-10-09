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
- [ ] Verificación en Etherscan (Sourcify enviada desde Remix).
- [ ] `transferOwnership` a la Safe y `acceptOwnership` desde la Safe.
- [ ] Cargar el fondo con `approve` + `fundRewards`, desde la Safe.
- [ ] `setDepositsPaused(false)`.
- [ ] Conectar `staking/staking-chain.js`.
