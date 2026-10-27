/* Guia del Airdrop Genesis · Español (misma estructura que en.js) */
module.exports = {
  name: "Español", locale: "es-ES", dir: "ltr",
  meta: {
    title: "Guía del Airdrop Genesis — Sectora Foundation",
    desc: "Guía paso a paso para participar en el Airdrop Genesis de Sectora: pon tus #SECT en staking, enciende tu Hash Node con la misma wallet y revisa tu airdrop. Con capturas y PDF descargable."
  },
  nav: { sub: "Guía del airdrop", back: "Página del airdrop", pdf: "PDF", lang: "Idioma" },
  common: {
    part: "Parte", step: "Paso", stepOf: "Paso {n} de 16", illus: "Ilustración · tu wallet puede verse un poco distinta",
    example: "Las capturas muestran una wallet de ejemplo (0x4b2f…4b3c) y cantidades de ejemplo. En tu pantalla verás las tuyas.",
    phone: "En el teléfono", computer: "En el ordenador", yes: "SÍ", no: "NO", minutes: "minutos", page: "página",
    stakingEnglish: "La página de staking está en inglés. Aquí ves cada botón tal como aparece, con su traducción entre paréntesis."
  },
  cover: {
    tag: "Guía oficial · Edición 1.1", kicker: "Airdrop Genesis · Guía para participar",
    h1: "Cómo participar<br>en el <b>airdrop</b> de Sectora.",
    p: "Paso a paso y con capturas: desde tu primer clic hasta un Hash Node encendido y sumando. Lee un paso, hazlo y pasa al siguiente.",
    parts: [["Parte A", "Pon tus #SECT en staking", "Ethereum · pasos 1–7"], ["Parte B", "Enciende tu nodo", "Testnet gratis · pasos 8–14"], ["Parte C", "Revisa tu airdrop", "Un minuto · pasos 15–16"]],
    issued: "Emitido por", entity: "Entidad", activity: "Actividad", activityV: "Empresa de ciberseguridad", location: "Ubicación", locationV: "Chicago, Illinois, Estados Unidos",
    file: "Registro de Illinois", ein: "EIN", contracts: "Contratos oficiales · Ethereum mainnet", token: "Token #SECT", staking: "Staking", web: "Web", support: "Soporte",
    date: "Octubre 2026 · Español"
  },
  toc: { k: "Contenido", h: "Todo lo que hay en esta guía", start: "Empieza aquí", before: "Antes de empezar", problems: "Problemas y soporte" },
  hero: {
    k: "Airdrop Genesis · Guía paso a paso",
    h1: "Cómo participar en el airdrop de Sectora, <b>paso a paso.</b>",
    lede: "Esta guía te lleva desde tu <strong>primer clic</strong> hasta un <strong>Hash Node encendido y sumando</strong>. Cada paso te dice exactamente qué pulsar, qué debes ver y qué no hacer, con una captura. Lee un paso, hazlo y pasa al siguiente. <strong>Unos 20 minutos.</strong>",
    pdf: "Descargar la guía en PDF", start: "Empezar la guía"
  },
  need: {
    k: "Todo el airdrop en una frase", h: "Solo necesitas dos cosas, <b>con la misma wallet:</b>",
    r1: ["#SECT en staking", "Al menos 100 #SECT en el staking oficial, en Ethereum. Parte A."],
    r2: ["Tu Hash Node encendido", "En la red de pruebas de Sectora. 100% gratis. Parte B."],
    foot: "Cuando se cumplen las dos, tu conteo del airdrop empieza solo. <b>Sin registros ni formularios.</b>"
  },
  already: {
    h: "¿Ya haces staking de #SECT? Ya estás dentro.",
    p: "No tienes que hacer nada más con tu staking. <b>No retires nada.</b> Sáltate la Parte A y ve directo a la Parte B: solo enciende tu Hash Node <b>con la misma wallet con la que haces staking</b> y empiezas a participar.",
    btn: "Ir a la Parte B"
  },
  map: [
    ["Parte A · pasos 1–7", "Pon tus #SECT en staking", "Ethereum mainnet. Usa tus #SECT reales y un poco de ETH para la comisión.", "≈ 5 minutos"],
    ["Parte B · pasos 8–14", "Enciende tu Hash Node", "Red de pruebas de Sectora. Monedas de prueba gratis: no gastas dinero real.", "≈ 10 minutos"],
    ["Parte C · pasos 15–16", "Revisa tu airdrop", "Mira tu nivel, tu premio y tu conteo subiendo.", "≈ 1 minuto"]
  ],
  before: {
    k: "00 · Antes de empezar", h: "Ten listas estas <b>cuatro cosas.</b>",
    items: [
      ["01", "Una wallet de cripto", "MetaMask, Trust Wallet, Coinbase Wallet, OKX, Binance Wallet o cualquier wallet de Ethereum. En el teléfono o en el ordenador."],
      ["02", "Al menos 100 #SECT", "En esa wallet. ¿Aún no los tienes? Cómpralos en Uniswap con nuestra <a href=\"/guide/es/\">guía de compra paso a paso</a>."],
      ["03", "Un poco de ETH", "En Ethereum, en la misma wallet. Paga las comisiones de la red (unos pocos dólares)."],
      ["04 · Lo más importante", "UNA sola wallet para todo", "Tu staking y tu nodo deben usar la <b>misma dirección de wallet</b>. Usar dos wallets distintas es el error más común."]
    ],
    rulesH: "Tres reglas de seguridad. No las rompas nunca.",
    rules: "<b>1.</b> Nunca le des a nadie tu frase secreta de recuperación (las 12 o 24 palabras) ni tu clave privada. Sectora nunca te las pedirá. <b>2.</b> Usa solo <b>sectoraorg.com</b>: revisa la barra de direcciones cada vez. <b>3.</b> Nadie de Sectora te escribirá primero para “ayudarte”. Si alguien lo hace, es una estafa."
  },
  phone: {
    k: "En el teléfono", h: "¿Usas el teléfono? <b>Lee esto primero.</b>",
    p: "Todo lo de esta guía funciona en el teléfono. Solo necesitas tener instalada tu app de wallet (MetaMask, Trust Wallet, Coinbase Wallet…).",
    steps: [
      "<b>Staking (Parte A):</b> abre <b>sectoraorg.com/staking</b> en Chrome o Safari y pulsa {en:Connect wallet} (Conectar wallet). Toca tu app de wallet en la lista, aprueba allí y vuelve al navegador.",
      "<b>Nodo (Parte B):</b> abre <b>sectoraorg.com/dashboard</b> y pulsa {ui:connect}. En el teléfono aparece {ui:openMM} (o tu wallet): tócalo y el dashboard se abre <b>dentro de tu app de wallet</b>. Sigue ahí.",
      "<b>Dentro de la app de wallet</b> todo se conecta directo. Usa la misma app de wallet para todo."
    ],
    note: "Si la app de wallet no se abre, ábrela tú, busca su navegador interno (suele llamarse <b>Navegador</b>, <b>Explorar</b> o <b>Descubrir</b>) y escribe ahí la dirección."
  },
  parts: {
    A: { k: "Parte A · Pasos 1–7 · ≈ 5 minutos", h: "Pon tus #SECT en staking", sub: "Pones tus #SECT en el staking oficial. Siguen siendo tuyos, ganan recompensas cada segundo y cuentan para el airdrop. ¿Ya haces staking? <a href=\"#part-b\">Salta a la Parte B</a>.", tags: ["Ethereum mainnet · #SECT reales", "Necesita un poco de ETH para comisiones", "Sin bloqueo"] },
    B: { k: "Parte B · Pasos 8–14 · ≈ 10 minutos", h: "Enciende tu Hash Node", sub: "El Hash Node funciona en la red de pruebas de Sectora (Sepolia). <b>Todo en la Parte B es gratis:</b> usas monedas de prueba gratuitas que no tienen valor. Aquí nunca gastas dinero real.", tags: ["Gratis · red de pruebas", "La misma wallet que tu staking", "Se queda encendido solo"] },
    C: { k: "Parte C · Pasos 15–16 · ≈ 1 minuto", h: "Revisa tu airdrop", sub: "Mira tu nivel, tu premio y los tres requisitos, leídos en vivo de la blockchain. Mirar es gratis: sin firmas ni transacciones.", tags: ["Solo lectura · gratis", "Cuando quieras"] }
  },
  s: {
    1: { k: "Navegador", h: "Abre la página de staking",
      do: ["Abre tu navegador: Chrome, Safari o el navegador dentro de tu app de wallet.", "Escribe exactamente <b>sectoraorg.com/staking</b> y ábrela.", "Baja hasta ver el recuadro blanco llamado <b>“Staking console”</b>."],
      warn: "<b>Revisa la barra de direcciones.</b> La única página real es <b>sectoraorg.com/staking</b>. Si dice cualquier otra cosa, ciérrala." },
    2: { k: "Consola de staking", h: "Pulsa “Connect wallet”",
      do: ["Abajo de la Staking console hay un botón azul grande.", "Pulsa {en:Connect wallet} (Conectar wallet)."],
      cap: "La Staking console. El botón que pulsas está marcado en azul." },
    3: { k: "Tu wallet", h: "Elige tu wallet",
      do: ["Se abre una lista debajo del botón.", "<b>En el ordenador:</b> pulsa tu wallet (por ejemplo <b>MetaMask</b>). Se abre tu wallet: pulsa <b>Conectar</b>.", "<b>En el teléfono (Chrome o Safari):</b> toca tu app de wallet. Se abre la app: pulsa <b>Conectar</b> allí y luego <b>vuelve a la pestaña del navegador</b>."],
      capPc: "En el ordenador: tu wallet del navegador sale primero.", capPhone: "En el teléfono: la lista de apps de wallet." },
    4: { k: "Comprobar", h: "Comprueba que estás conectado",
      do: ["Mira el botón azul grande: ahora muestra <b>tu dirección de wallet</b>, abreviada, como <code>0x4b2f…4b3c</code>.", "Debajo ves ahora tres botones: {en:Deposit #SECT} (Depositar) {en:Withdraw} (Retirar) {en:Withdraw all} (Retirar todo)."],
      see: "<b>Funcionó</b> si ves tu dirección en el botón.",
      warn: "<b>¿Mensaje rojo “Switch your wallet to the Ethereum network”?</b> Significa “cambia tu wallet a la red Ethereum”. Abre tu wallet, cambia la red a <b>Ethereum</b> (Ethereum Mainnet) y recarga la página." },
    5: { k: "Cantidad", h: "Escribe cuántos #SECT pones en staking",
      do: ["Pulsa el recuadro <b>“You deposit”</b> (Depositas).", "Escribe el número de #SECT. Solo el número, por ejemplo <b>1000</b>. Sin puntos ni comas."],
      how: "<b>¿Cuánto?</b> Al menos <b>100 #SECT</b> para participar en el airdrop. Cuanto más pongas, más alto es tu nivel:",
      prize: "premio {n} SECT", nomax: "sin máximo" },
    6: { k: "Wallet · confirmación 1 de 2", h: "Pulsa “Deposit #SECT” y aprueba",
      do: ["Pulsa {en:Deposit #SECT} (Depositar #SECT).", "Se abre tu wallet y te pide <b>aprobar</b> un “límite de gasto”. Esto solo permite al contrato de staking tomar <b>exactamente</b> la cantidad que escribiste, nunca más. Todavía no se mueve nada.", "Revisa los datos de abajo y pulsa <b>Confirmar</b> en tu wallet.", "<b>Espera.</b> No cierres la página. Tarda entre unos segundos y un minuto."],
      checkH: "Revisa esto en tu wallet antes de pulsar Confirmar",
      check: [["Solicitud", "Aprobar · límite de gasto"], ["Cantidad", "Exactamente los #SECT que escribiste"], ["Contrato", "<code>0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0</code>"], ["Comisión", "Un poco de ETH (tu wallet te la muestra)"]] },
    7: { k: "Wallet · confirmación 2 de 2", h: "Confirma el depósito",
      do: ["Cuando termina la aprobación, tu wallet se abre <b>una segunda vez</b> sola, ahora para el <b>depósito</b>.", "Pulsa <b>Confirmar</b> otra vez. Espera unos segundos.", "Aparece un recuadro verde: <b>“Your rewards · accruing every second”</b> (tus recompensas, sumando cada segundo), con <b>“Deposited”</b> (depositado) y tu cantidad."],
      cap: "Tu staking está hecho: se ve el depósito y tus recompensas suben cada segundo.",
      warn: "<b>Deja tus #SECT en el staking.</b> Solo los #SECT en staking cuentan para el airdrop. Déjalos ahí hasta completar tu tiempo. Sigues ganando tus recompensas normales de staking.",
      done: ["Parte A terminada.", "Tus #SECT están en staking. Ahora enciende tu nodo con esta misma wallet."] },
    8: { k: "Dashboard", h: "Abre el dashboard y pulsa “{ui:connect}”",
      do: ["Abre <b>sectoraorg.com/dashboard</b>.", "Arriba a la derecha, pulsa {ui:connect}.", "<b>En el teléfono (Chrome o Safari):</b> aparece una lista. Toca {ui:openMM} (o tu wallet) y el dashboard se abre dentro de tu app de wallet. Ahí pulsa {ui:connect} otra vez."],
      warn: "<b>Usa la MISMA wallet con la que hiciste staking.</b> Si tu nodo está en otra wallet, no cuenta para tu airdrop.",
      lang: "El dashboard se abre en inglés. Cámbialo a español con el menú de banderas de arriba: así lo verás igual que en estas capturas.",
      capPhone: "En el teléfono: {ui:connect} arriba.", capPhone2: "En el teléfono sin wallet: {ui:openMM}." },
    9: { k: "Tu wallet", h: "Elige tu wallet y acepta la red de pruebas",
      do: ["En la lista <b>“{ui:wselTitle}”</b>, pulsa tu wallet (dice <b>{ui:detected}</b>).", "En tu wallet, pulsa <b>Conectar</b>.", "El dashboard pasa tu wallet a la red de pruebas <b>Sepolia</b> solo. Si tu wallet pide cambiar o añadir la red, pulsa <b>Aprobar</b> o <b>Cambiar de red</b>."],
      tip: "<b>¿Tu wallet no muestra Sepolia?</b> Abre los ajustes de tu wallet y activa <b>“Mostrar redes de prueba”</b>. Luego inténtalo otra vez." },
    10: { k: "Gas gratis", h: "Consigue ETH de Sepolia gratis para el gas",
      do: ["Cada acción en la red de pruebas necesita un poco de <b>ETH de Sepolia</b>. Es una moneda de prueba gratuita y sin valor.", "En el dashboard, baja un poco hasta <b>“{ui:howTitle}”</b>. En el recuadro <b>02 “{ui:howGas}”</b>, pulsa {ui:howGasBtn}.", "Se abre una página de Google Cloud (en inglés). Comprueba que la red es <b>Ethereum Sepolia</b>, pega tu dirección de wallet en <b>“Wallet address or ENS name”</b> y pulsa <b>Get 0.05 Sepolia ETH</b>. Si te lo pide, entra con una cuenta de Google.", "Vuelve a la pestaña del dashboard."],
      copy: "<b>¿Cómo copio mi dirección?</b> Abre tu wallet y toca el nombre de tu cuenta o tu dirección arriba: se copia sola.",
      warn: "<b>¿Google dice que necesitas 0.001 ETH en Ethereum Mainnet?</b> El grifo de Google solo da ETH de Sepolia a wallets con al menos 0,001 ETH real en Ethereum. Deja un poco de ETH en tu wallet (lo necesitas para la Parte A de todas formas) e inténtalo otra vez.",
      capHow: "En el dashboard: {ui:howTitle} → recuadro 02 → {ui:howGasBtn}.", capDash: "El mismo botón también está más abajo, en {ui:tnTitle}.", capGoogle: "El grifo de Google Cloud: (1) tu dirección · (2) Get 0.05 Sepolia ETH." },
    11: { k: "Tokens de prueba gratis", h: "Reclama 5.000 tSECT gratis",
      do: ["En el mismo recuadro, pulsa {ui:faucetBtn}.", "Se abre tu wallet: pulsa <b>Confirmar</b>.", "Espera unos segundos. <b>“{ui:balance}”</b> muestra ahora <b>5.000 tSECT</b>."],
      tip: "Los tSECT son <b>tokens de prueba sin valor en dinero</b>. Puedes reclamarlos otra vez cada 24 horas." },
    12: { k: "Mercado de hash", h: "Compra el Node Kit · 50 TH/s",
      do: ["Baja hasta <b>“{ui:market}”</b>.", "Abre la pestaña {ui:physical} <b>(1)</b>.", "Pulsa la tarjeta <b>50 TH/s · 4.300 tSECT</b>, marcada <b>{ui:airdropPlan}</b> <b>(2)</b>. Es el nodo que sirve para el airdrop.", "Pulsa {ui:buy50} <b>(3)</b>.", "Tu wallet se abre <b>dos veces</b>: primero para permitir el pago y luego para confirmar la compra. Pulsa <b>Confirmar</b> las dos veces."],
      cap1: "(1) {ui:physical} · (2) 50 TH/s · {ui:airdropPlan}", cap2: "(3) {ui:buy50}",
      see: "Los 4.300 tSECT salen de los 5.000 tSECT gratis del paso 11. <b>Sin dinero real.</b>" },
    13: { k: "Tu nodo", h: "Registra tu nodo. La ubicación es automática.",
      do: ["Baja hasta <b>“{ui:node}”</b>.", "La ubicación de tu nodo ya está <b>detectada (1)</b> y su nombre ya está <b>escrito</b>. No escribes nada.", "Pulsa {ui:register} <b>(2)</b>.", "Se abre tu wallet: pulsa <b>Confirmar</b>."],
      cap: "(1) Ubicación detectada automáticamente · (2) {ui:register}",
      tip: "<b>Sobre la ubicación.</b> Nuestros sistemas detectan la ubicación aproximada de tu nodo por tu conexión y la rellenan por ti. En la red solo se guarda la <b>ciudad</b>, <b>nunca tu dirección</b>. ¿La ubicación está mal (por ejemplo por una VPN)? Pulsa <b>“{ui:change}”</b> y corrígela.",
      planH: "Paso 13 · Plan B · solo si ves “{ui:geoFail}”",
      plan: [["Por qué", "A veces una VPN, un bloqueador de anuncios o un navegador muy estricto impide la detección. Entonces aparecen dos casillas: <b>{ui:lat}</b> y <b>{ui:lon}</b>."],
        ["Busca los números", "Abre Google Maps y busca <b>tu ciudad</b>. En el ordenador, haz clic derecho en el centro de la ciudad; en el teléfono, mantén el dedo pulsado. Verás dos números, como <code>40.4168, -3.7038</code>."],
        ["Escríbelos", "El <b>primer</b> número va en <b>{ui:lat} (1)</b>. El <b>segundo</b> número va en <b>{ui:lon} (2)</b>. Si lleva signo menos, déjalo."],
        ["Después", "Pulsa {ui:register} y confirma en tu wallet. Usa tu ciudad, no tu casa."]],
      planCap: "Solo cuando no se pudo detectar la ubicación: (1) {ui:lat} · (2) {ui:lon}" },
    14: { k: "Listo", h: "Listo: tu nodo está encendido",
      do: ["El botón cambia a {ui:registered}.", "Tu nodo aparece en el mapa de la red. Desde ahora, cuenta."],
      onoff: [["SÍ", "Puedes cerrar la pestaña", "Tu nodo sigue encendido en la red por sí solo."], ["SÍ", "Puedes apagar tu ordenador", "Tu nodo no depende de tu ordenador ni de tu teléfono."], ["NO", "Nunca desactives tu nodo", "No pulses ningún botón ni firmes ninguna transacción que desactive o apague tu nodo. Mientras está apagado, deja de contar hasta que lo vuelvas a encender."]],
      done: ["Parte B terminada. Estás en el airdrop.", "Staking + nodo encendido, con la misma wallet. Tu conteo está corriendo."] },
    15: { k: "Mi Airdrop", h: "Abre Mi Airdrop",
      do: ["Abre <b>sectoraorg.com/myairdrop</b>.", "Pulsa {ui:myConnect}, o pega tu dirección de wallet y pulsa {ui:myCheck}.", "Ves lo que llevas generado, tu <b>nivel</b>, tu <b>premio</b> y los tres requisitos."],
      cap: "Ejemplo: 1.000 #SECT en staking = Guardian, premio 750 SECT.",
      checkH: "Los tres requisitos",
      check: [["✓ 100+ SECT en staking", "Hecho en la Parte A."], ["✓ Hash Node encendido", "Hecho en la Parte B."], ["30 días dentro", "Empieza solo cuando se cumplen los dos anteriores. Solo espera y no toques nada."]] },
    16: { k: "Página del airdrop", h: "Revisión rápida en la página del airdrop",
      do: ["Abre la página del airdrop, <b>sectoraorg.com/airdrop</b>, y pulsa {ui:takePart}.", "Conecta tu wallet. La ventana <b>“Tu airdrop”</b> muestra lo que llevas generado, tu premio y tu nivel."],
      cap1: "La página del airdrop: pulsa {ui:takePart}.", cap2: "Ejemplo de la ventana “Tu airdrop”.",
      see: "<b>¿Cuándo recibo mis SECT?</b> En SectoraEVM, en su lanzamiento en mainnet. Podrás seguirlo en <a href=\"/sectorascan/\">SectoraScan</a>." }
  },
  wallet: {
    site: "sectoraorg.com",
    connect: { h: "Conectar con este sitio", p: "sectoraorg.com quiere ver la dirección de tu cuenta y pedirte que apruebes acciones.", no: "Cancelar", yes: "Conectar" },
    approve: { h: "Solicitud de límite de gasto", rows: [["Token", "#SECT"], ["Límite de gasto", "1.000 SECT"], ["Autorizado", "0x79Cb…20E0"], ["Comisión de red", "se paga en ETH"]], no: "Rechazar", yes: "Confirmar" },
    deposit: { h: "Solicitud de transacción", rows: [["Interactúa con", "0x79Cb…20E0"], ["Acción", "Depositar"], ["Comisión de red", "se paga en ETH"]], no: "Rechazar", yes: "Confirmar" },
    sw: { h: "¿Permitir que este sitio cambie la red?", from: "Ethereum", to: "Sepolia", no: "Cancelar", yes: "Cambiar de red" }
  },
  faq: {
    k: "Problemas · respuestas rápidas", h: "¿Algo no funcionó? <b>Mira aquí primero.</b>",
    items: [
      ["“Not enough ETH” en la página de staking", "La Parte A usa Ethereum real. Añade un poco de ETH (en Ethereum) a la misma wallet e inténtalo otra vez."],
      ["“Gas insuficiente” en el dashboard", "La Parte B usa ETH de Sepolia gratis. Repite el <a href=\"#step-10\">paso 10</a>."],
      ["El grifo de Google pide 0.001 ETH en Ethereum", "Tu wallet necesita al menos 0,001 ETH real en Ethereum para usar el grifo de Google. Deja un poco de ETH en ella e inténtalo otra vez, o escribe a soporte."],
      ["Mi wallet no muestra Sepolia", "En los ajustes de tu wallet, activa “Mostrar redes de prueba”. Luego recarga el dashboard."],
      ["“Switch your wallet to the Ethereum network”", "Estás en la página de staking con la red equivocada. En tu wallet, elige Ethereum (Ethereum Mainnet) y recarga."],
      ["“You do not have that many #SECT in your wallet”", "Significa que no tienes tantos #SECT. Escribe una cantidad menor o compra más #SECT con nuestra <a href=\"/guide/es/\">guía de compra</a>."],
      ["No tengo suficientes tSECT para el Node Kit", "Reclama 5.000 tSECT en el <a href=\"#step-11\">paso 11</a>. ¿Ya reclamaste hoy? Espera 24 horas y reclama otra vez."],
      ["Usé otra wallet para el nodo", "No cuenta. Conecta tu <b>wallet del staking</b> en el dashboard y repite la Parte B con ella."],
      ["No se detectó la ubicación, o está mal", "Pulsa “{ui:change}”, o sigue el Plan B del <a href=\"#step-13\">paso 13</a>. Usa tu ciudad, no tu casa."],
      ["No se abrió la ventana de la wallet", "Abre tú la app o la extensión de tu wallet: la solicitud te espera ahí. En el teléfono, después de aprobar, vuelve a la pestaña del navegador."],
      ["¿Tengo que dejar el ordenador encendido?", "No. Una vez registrado, tu nodo se queda encendido solo. Solo no lo desactives nunca."],
      ["¿Tengo que retirar mi staking para participar?", "No. Nunca. Tus #SECT en staking cuentan tal como están, y sigues ganando tus recompensas de staking."],
      ["¿La Parte B cuesta dinero?", "No. Los tSECT y el ETH de Sepolia son monedas de prueba gratis y sin valor."]
    ]
  },
  help: {
    k: "Soporte", h: "¿Sigues atascado? <b>Escríbenos.</b>",
    p: "Envía un correo a nuestro equipo de soporte con el asunto <b>“Airdrop Connection”</b>. Para ayudarte rápido, incluye:",
    list: ["Tu dirección de wallet <b>pública</b> (empieza por 0x).", "El <b>número del paso</b> donde te atascaste.", "Una <b>captura</b> del error."],
    email: "Correo", subject: "Asunto", subjectV: "Airdrop Connection", btn: "Escribir a soporte",
    never: "<b>Nunca</b> envíes tu frase de recuperación (12 o 24 palabras) ni tu clave privada. Ni a nosotros ni a nadie."
  },
  foot: {
    legal: "<b>Sectora Foundation IL</b> · Empresa de ciberseguridad · Chicago, Illinois, Estados Unidos · Registro de Illinois 18523639 · EIN 32-0868576",
    token: "Token #SECT (Ethereum, ERC-20)", staking: "Contrato de staking", support: "Soporte: support@sectoraorg.com · Asunto “Airdrop Connection”",
    online: "Versión en línea con enlaces: sectoraorg.com/airdrop-guide/es",
    nav: ["Airdrop", "Staking", "Hash Node", "Mi Airdrop", "Legal"]
  }
};
