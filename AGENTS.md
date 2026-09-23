# AGENTS.md

Instrucciones para agentes de código (Codex con GPT-6 Astra, Claude Code, etc.)
que trabajen en este repositorio.

## Qué es este proyecto

Web de Sectora Foundation, publicada con GitHub Pages (`CNAME`, `.nojekyll`).
Es un sitio estático: HTML, CSS y JavaScript sueltos, **sin build, sin
bundler y sin framework**. Lo que hay en la raíz se sirve tal cual.

- `index.html`: página principal, autocontenida (estilos y scripts dentro).
  Lee el comentario de cabecera antes de tocarla: explica constantes de
  ajuste (`CG_KEY`, `T_SWEEP`, `FACTOR`...) y lo que queda pendiente.
- `dashboard*.{html,css,js}`, `dex*`, `explorer*`, `whitepaper*`: resto de
  páginas y sus recursos, en la raíz.
- `dash/`, `dex/`, `docs/`, `legal/`, `security/`, `staking/`, `tokenize/`,
  `sectorascan/`: rutas limpias (`/dex/`, `/staking/`...) con su `index.html`.
- `contracts/`: contratos Solidity con Hardhat y OpenZeppelin. Tiene su
  propio `package.json` y es independiente de la web.
- `scripts/fetch_dex_prices.py` + `.github/workflows/update-dex-prices.yml`:
  cada 5 minutos regeneran `dex-prices.json` y lo commitean.

## Reglas

- No introduzcas build, npm ni frameworks en la web. Todo debe funcionar
  abriendo el HTML directamente.
- Las librerías de terceros van vendorizadas en la raíz (`three.min.js`,
  `ethers.min.js`, `walletconnect-provider.min.js`...). No las edites.
- No edites a mano `dex-prices.json`; lo escribe el workflow.
- Textos visibles: se traducen con claves en `translations.js`
  (`window.SECTORA_I18N`) y `i18n.js`, y también en
  `dashboard-i18n-extra.js` y `whitepaper-translations.js`. Si añades o
  cambias un texto, actualiza la clave en **todos** los idiomas.
- Nada de claves privadas, API keys ni `.env` en el repositorio. La web es
  pública: cualquier secreto en el JS queda expuesto.
- Mantén el diseño responsive (móvil primero) y el tema oscuro existente.
- Mensajes de commit en español, cortos y descriptivos, como el historial.

## Comprobaciones

Web: sirve la raíz en local y revisa en el navegador que no haya errores en
consola.

```sh
python3 -m http.server 8000
```

Contratos:

```sh
cd contracts
npm install
npx hardhat node            # en otra terminal
node scripts/compile.js     # genera artifacts-manual/
node scripts/test-local.js
node scripts/test-staking.js
```
