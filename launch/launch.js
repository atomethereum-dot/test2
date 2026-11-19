/* ==========================================================================
   Sectora Launch — coin launchpad + real-world asset tokenization on SectoraEVM
   Testnet preview: every action runs on a local SectoraEVM testnet ledger kept
   in this browser. Nothing here touches real funds or the Ethereum mainnet.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Protocol parameters (the same rules the SectoraEVM contracts use)   *
   * ------------------------------------------------------------------ */
  var SUPPLY = 1e9;                 // fixed supply of every coin
  var CURVE_TOKENS = 8e8;           // sold on the bonding curve before graduation
  var POOL_TOKENS = 2e8;            // paired with the raised SECT on Sectora DEX
  var V_SECT0 = 30000;              // virtual SECT reserve of the curve
  var V_TOK0 = 1.073e9;             // virtual token reserve of the curve
  var FEE = 0.01;                   // 1 % per trade
  var SPLIT = { creator: 0.5, burn: 0.3, protocol: 0.2 };       // of the 1 %
  var RWA_SPLIT = { burn: 0.6, protocol: 0.4 };                  // of the 1 % on RWA sales
  var LAUNCH_FEE = 50;              // SECT, burned in full (anti-spam)
  var DEV_MAX = 0.05;               // creator buy at launch: max 5 % of supply
  var VEST_CLIFF = 7 * 864e5;       // creator tokens: 7-day cliff
  var VEST_TOTAL = 30 * 864e5;      // ... fully vested after 30 days
  var FAIR_WINDOW = 5 * 60e3;       // anti-sniper window after launch
  var FAIR_MAX = 0.01 * SUPPLY;     // max 1 % of supply per wallet inside it
  var FAUCET = 25000;               // testnet SECT per claim
  var FAUCET_EVERY = 3600e3;        // one claim per hour
  var BURN_TICK = 15e3;             // smoothed burn: one tranche every 15 s
  var BURN_SLICE = 0.1;             // ... burning 10 % of the queue each time
  var MAX_ACCOUNTS = 5;
  var DEAD = "0x000000000000000000000000000000000000dEaD";
  var RESERVED = ["SECT", "SECTORA", "BTC", "ETH", "WETH", "USDT", "USDC", "DAI", "SOL", "BNB", "XRP", "STONK", "PUMP"];
  var GRAD_RAISE = V_SECT0 * V_TOK0 / (V_TOK0 - CURVE_TOKENS) - V_SECT0; // SECT raised at graduation
  var SECT_PAIR = "https://api.dexscreener.com/latest/dex/pairs/ethereum/0xa12a11fc202827b7c734cf2019f2c7a6cf061d69";
  var KEY = "sectoraLaunch.v1", LKEY = "sectoraLaunch.lang", PKEY = "sectoraLaunch.sectUsd";

  /* ------------------------------------------------------------------ *
   * i18n                                                                *
   * ------------------------------------------------------------------ */
  var T = {
    en: {
      hero_l1: "Launch coins and", hero_l2: "tokenize <b>real assets</b>", hero_l3: "<b class=\"k\">without rugs</b>.", viz_price: "Price", viz_sold: "Tokens sold", viz_launch: "Launch", viz_grad: "Graduation · Sectora DEX", viz_burn: "SECT burn", tag1: "Anti-sniper 5 min", tag2: "LP burned", tag3: "0.3 % → SECT burn", tag4: "Shield scan", eyebrow2: "Sectora Launch · SectoraEVM", live: "Testnet", film_eb: "The film", film_t: "Everything you can do on Sectora Launch.", film_s: "Launch, fair window, bonding curve, Shield, SECT burn and real-world assets — in 34 seconds.", film_play: "Play with sound", fc_fair: "Fair window", fc_cap: "1% cap per wallet", fc_shield: "Shield score", fc_grad: "To graduation", fc_burn: "SECT burned · testnet", fc_ex: "Example", fc_live: "Live", banner: "SectoraEVM testnet preview — test SECT and test coins have no real value. Mainnet: March 22, 2027.",
      nav_explore: "Explore", nav_launch: "Launch", nav_tokenize: "Tokenize", nav_assets: "Real assets", nav_me: "Account", nav_stats: "Transparency",
      connect: "Create test account", connect_s: "Test account", net: "SectoraEVM · Testnet",
      eyebrow: "Sectora Launch · on SectoraEVM",
      hero_t: "Launch coins and tokenize real assets — <em>without rugs</em>.",
      hero_s: "Fair launches with anti-sniper limits, liquidity nobody can pull, a Sectora Shield security scan on every coin, and fees that buy back and burn SECT — all written into the contracts.",
      cta_launch: "Launch a coin", cta_tokenize: "Tokenize an asset",
      st_coins: "Coins launched", st_vol: "Volume", st_creators: "Paid to creators", st_burn: "SECT burned", st_rwa: "Real assets tokenized", st_queue: "in burn queue",
      explore: "Explore coins", tab_trend: "Trending", tab_new: "New", tab_soon: "About to graduate", tab_grad: "Graduated",
      search: "Search name, ticker or address",
      empty_t: "No coins on your testnet yet", empty_p: "Create a test account, claim test SECT and launch the first coin. Everything you do stays on this SectoraEVM testnet.",
      empty_f: "No coins match this filter.",
      mc: "Market cap", curve: "curve", graduated: "Graduated", ago: "ago",
      why_t: "Why Sectora Launch is safer", why_s: "We studied where other launchpads fail — snipers, bundled launches, pulled liquidity, opaque fees, copycats — and fixed each one at contract level.",
      w1_t: "Anti-sniper fair launch", w1_p: "For the first 5 minutes no wallet can hold more than 1 % of the supply. Bots lose their edge.", w1_v: "Elsewhere: bots buy the first block and dump on the community.",
      w2_t: "No hidden bundles", w2_p: "The creator can buy at most 5 % at launch, and those tokens are locked with a 7-day cliff and 30-day vesting.", w2_v: "Elsewhere: creators split buys across many wallets and dump.",
      w3_t: "Liquidity nobody can pull", w3_p: "Before graduation the SECT sits inside the curve contract; at graduation the Sectora DEX LP tokens are burned forever.", w3_v: "Elsewhere: \"rug pulls\" when liquidity is withdrawn.",
      w4_t: "Fees written in the contract", w4_p: "1 % per trade: 0.5 % to the creator, 0.3 % buys back and burns SECT, 0.2 % to the protocol. Visible on every coin.", w4_v: "Elsewhere: buybacks are a promise on a web page that can change.",
      w5_t: "Smoothed burns", w5_p: "Buyback-and-burn runs in small tranches over time (10 % of the queue every 15 s) instead of one big spike.", w5_v: "Elsewhere: buybacks swing with daily fees, with no smoothing.",
      w6_t: "Sectora Shield on every coin", w6_p: "Automatic security score: supply, liquidity, creator lock, holder concentration, early-buyer clusters and copycat names.", w6_v: "Elsewhere: you check it yourself — or you don't.",
      w7_t: "Clear prices", w7_p: "Every price is in SECT with a dollar reference at the live SECT price. No confusing index units.", w7_v: "Elsewhere: prices quoted in exotic pair units.",
      w8_t: "Copycat protection", w8_p: "Tickers are unique and look-alike names are flagged before launch and on the coin page.", w8_v: "Elsewhere: fake copies with the same name and ticker.",
      w9_t: "Real assets with proof", w9_p: "Tokenized assets carry SHA-256 fingerprints of their documents, a named custodian and an attestation schedule.", w9_v: "Elsewhere: \"stock\" tokens that give no rights and no documents.",
      w10_t: "A registered company", w10_p: "Sectora Foundation is registered in Illinois (USA) and creators can verify their identity.", w10_v: "Elsewhere: anonymous teams.",
      how_t: "How it works",
      h1_t: "Create", h1_p: "Name, ticker, image and links. Launch costs 50 SECT, burned in full.",
      h2_t: "Trade on the curve", h2_p: "The price rises as people buy. Anti-sniper limits protect the first minutes.",
      h3_t: "Graduate", h3_p: "At ~{raise} SECT raised the coin moves to Sectora DEX and the LP is burned forever.",
      h4_t: "Everyone earns", h4_p: "The creator earns 0.5 % of every trade forever and 0.3 % burns SECT.",
      back: "Back",
      launch_t: "Launch a coin", launch_s: "Your coin goes live on the SectoraEVM testnet with a fixed supply of 1,000,000,000 and the protections built in.",
      f_logo: "Image", f_logo_btn: "Upload image", f_logo_hint: "PNG or JPG. Resized to 128 px.",
      f_name: "Name", f_ticker: "Ticker", f_desc: "Description", f_web: "Website", f_x: "X (Twitter)", f_tg: "Telegram",
      f_dev: "Your buy at launch (optional)", f_dev_hint: "Max 5 % of supply. Locked: 7-day cliff, fully vested in 30 days.",
      f_verify: "Request creator verification (identity check by Sectora Foundation). On testnet it stays pending.",
      f_pair: "Pair", f_pair_v: "SECT (native SectoraEVM token)",
      cost_t: "Summary", cost_fee: "Launch fee (burned)", cost_dev: "Your buy", cost_total: "Total", cost_bal: "Your balance",
      dev_tokens: "≈ {t} tokens ({p} % of supply), locked",
      rules_t: "Built-in rules", r1: "Fixed supply 1,000,000,000 · no mint, no freeze", r2: "Anti-sniper: max 1 % per wallet for 5 min", r3: "Graduates at ~{raise} SECT raised → Sectora DEX, LP burned", r4: "Fees 1 %: 0.5 % creator · 0.3 % SECT burn · 0.2 % protocol",
      btn_launch: "Launch on SectoraEVM", need_acct: "Create a test account first", need_funds: "Not enough test SECT — claim from the faucet",
      e_name: "Name is required (max 32)", e_ticker: "Ticker: 2–10 letters or numbers", e_taken: "That ticker already exists on Sectora Launch", e_reserved: "That ticker is reserved", e_dev: "Your buy exceeds 5 % of the supply",
      w_similar: "Looks similar to “{n}”. Shield will flag it as a possible copy.",
      preview: "Preview",
      price: "Price", holders: "Holders", vol: "Volume", buy: "Buy", sell: "Sell", amount: "Amount", you_get: "You receive", impact: "Price impact", fee_total: "Fee (1 %)",
      to_creator: "To creator", to_burn: "SECT buyback & burn", to_protocol: "Protocol", max: "Max", balance: "Balance",
      fair_on: "Fair-launch window: max 1 % of supply per wallet for {m} more.", fair_cap: "This buy exceeds the 1 % limit of the fair-launch window.",
      no_tokens: "You have no tokens to sell", locked_note: "{a} tokens locked (creator vesting)",
      curve_t: "Bonding curve", curve_p: "{p} % · {r} of ~{g} SECT raised", grad_t: "Graduated to Sectora DEX", grad_p: "Liquidity: {s} SECT + {k} tokens · LP burned forever",
      tab_trades: "Trades", tab_holders: "Holders", tab_shield: "Shield", tab_about: "About",
      th_time: "Time", th_acct: "Account", th_type: "Type", th_sect: "SECT", th_tok: "Tokens", th_price: "Price", th_tx: "Tx",
      no_trades: "No trades yet.", curve_holder: "Bonding curve (contract)", pool_holder: "Sectora DEX pool (LP burned)",
      creator: "Creator", created: "Created", contract: "Contract", verified: "Verified creator", pending: "Verification pending", you: "you",
      fees_t: "Fees of this coin", earned: "Creator earnings", claimable: "Claimable", claim: "Claim", burned_via: "SECT burned via this coin",
      vest_t: "Creator lock", vest_p: "{v} of {a} tokens unlocked · fully vested {d}",
      chart_empty: "The chart starts with the first trade.",
      sh_score: "Shield score", sh_t: "Sectora Shield scan",
      c_supply: "Fixed supply", c_supply_d: "1,000,000,000 tokens. Minting is disabled in the contract.",
      c_freeze: "No freeze or blacklist", c_freeze_d: "Nobody can block your tokens or stop you from selling.",
      c_liq: "Liquidity locked", c_liq_curve: "The SECT stays in the curve contract — no one can withdraw it.", c_liq_pool: "LP tokens burned at graduation: liquidity locked forever.",
      c_dev: "Creator allocation", c_dev_none: "The creator did not reserve tokens.", c_dev_ok: "{p} % bought at launch, locked with vesting.",
      c_top: "Holder concentration", c_top_d: "Top 10 wallets hold {p} % of the supply.",
      c_early: "Early-buyer clusters", c_early_d: "{p} % bought by other wallets in the first 60 seconds.",
      c_sell: "Sell test", c_sell_d: "A sell quote executes correctly (no honeypot).",
      c_ver: "Creator identity", c_ver_ok: "Verified by Sectora Foundation.", c_ver_no: "Not verified yet.",
      c_copy: "Copycat check", c_copy_ok: "No look-alike names on Sectora Launch.", c_copy_bad: "Similar to “{n}”.",
      about_links: "Links",
      tok_t: "Tokenize a real-world asset", tok_s: "Turn an asset into fractions that anyone can buy with SECT. Documents are fingerprinted (SHA-256) in your browser — the files are never uploaded.",
      cls: "Asset class", cl_re: "Real estate", cl_metal: "Metals & commodities", cl_inv: "Invoices", cl_eq: "Company shares", cl_bond: "Bonds & debt", cl_art: "Art & collectibles", cl_veh: "Vehicles & machinery", cl_other: "Other",
      a_name: "Asset name", a_sym: "Symbol", a_desc: "Description", a_jur: "Jurisdiction", a_cust: "Custodian / legal entity", a_val: "Valuation (USD)", a_frac: "Number of fractions", a_price: "Price per fraction", a_att: "Attestation", att_m: "Monthly", att_q: "Quarterly",
      a_docs: "Documents", a_docs_hint: "Title deed, appraisal, custody agreement… Only the SHA-256 fingerprint is stored.", a_docs_btn: "Add documents",
      a_decl: "I declare that I own or legally represent this asset and that the documents are authentic.",
      a_submit: "Submit for tokenization", a_auto: "Suggested from the live SECT price",
      e_aname: "Asset name is required", e_asym: "Symbol: 2–8 letters or numbers", e_aval: "Enter the valuation", e_afrac: "Enter the number of fractions", e_aprice: "Enter the price per fraction", e_adocs: "Add at least one document", e_adecl: "Please confirm the declaration", e_ataken: "That symbol already exists",
      rwa_fee: "Fee 1 % on each purchase: 0.6 % buys back & burns SECT · 0.4 % protocol.",
      assets_t: "Tokenized real assets", assets_s: "Every asset shows its documents' fingerprints, its custodian and its review status.",
      assets_empty: "No tokenized assets yet", assets_empty_p: "Tokenize the first real-world asset on SectoraEVM.",
      st_review: "In review", st_approved: "Tokenized",
      tl1: "Submitted", tl2: "Documents fingerprinted", tl3: "Compliance review", tl4: "Token minted on SectoraEVM",
      tl_note: "On testnet the review is automatic. On mainnet it is performed by the Sectora Foundation compliance team.",
      valuation: "Valuation", fractions: "Fractions", sold: "Sold", per_frac: "Per fraction", custodian: "Custodian", jurisdiction: "Jurisdiction", issuer: "Issuer", attestation: "Attestation", next_att: "Next attestation",
      docs_t: "Document fingerprints (SHA-256)", buy_frac: "Buy fractions", qty: "Quantity", cost: "Cost", fee1: "Fee (1 %)", total: "Total",
      not_ready: "Available once the review is complete.", sold_out: "All fractions are sold.",
      rwa_risk: "Owning fractions gives exposure to the asset as described by the issuer. Always read the documents.",
      me_t: "Your test account", me_s: "Local SectoraEVM testnet accounts. Use several to test trades between wallets.",
      faucet: "Claim {n} test SECT", faucet_wait: "Next claim in {m}", add_acct: "Add account", switch: "Switch",
      my_coins: "Coins you created", my_hold: "Your holdings", my_rwa: "Your real-asset fractions", none: "Nothing yet.", value: "Value",
      reset: "Reset testnet data", reset_q: "Delete every test coin, asset and account in this browser?",
      tr_t: "Transparency", tr_s: "Every fee and every burn on Sectora Launch, live.",
      tr_split: "Where the fees go", tr_burns: "Latest burns", tr_params: "Contract parameters", tr_none: "No burns yet.",
      p_supply: "Supply per coin", p_curve: "Sold on the curve", p_pool: "Added to Sectora DEX", p_grad: "Graduation", p_fee: "Trade fee", p_launch: "Launch fee", p_dev: "Creator buy", p_vest: "Creator vesting", p_fair: "Fair-launch window", p_burn: "Burn smoothing",
      v_vest: "7-day cliff · 30 days", v_fair: "5 min · max 1 % per wallet", v_burn: "10 % of the queue every 15 s", v_launch: "50 SECT (burned)", v_dev: "max 5 % of supply", v_grad: "~{raise} SECT raised",
      tr_note: "On mainnet these rules live in the Sectora Launch contracts and every transaction can be verified on Sectora Scan.",
      tx_wait: "Confirming on SectoraEVM…", tx_ok: "Confirmed", tx_block: "Block {b}",
      t_launched: "Coin launched", t_bought: "Bought {t} {s}", t_sold: "Sold {t} {s}", t_claimed: "Claimed {n} SECT", t_faucet: "{n} test SECT received", t_grad: "{s} graduated to Sectora DEX!", t_rwa: "Asset submitted for review", t_rwa_buy: "Bought {q} fractions of {s}", t_copied: "Copied",
      ev_launch: "Launch", ev_grad: "Graduation",
      ref: "≈ {u} at live SECT price", footer_l: "Testnet preview of Sectora Launch on SectoraEVM. Not financial advice. Tokens on testnet have no value.",
      acct_n: "Account {n}"
    },
    es: {
      hero_l1: "Lanza monedas y", hero_l2: "tokeniza <b>activos reales</b>", hero_l3: "<b class=\"k\">sin estafas</b>.", viz_price: "Precio", viz_sold: "Tokens vendidos", viz_launch: "Lanzamiento", viz_grad: "Graduación · Sectora DEX", viz_burn: "Quema SECT", tag1: "Anti-snipers 5 min", tag2: "LP quemado", tag3: "0,3 % → quema SECT", tag4: "Escáner Shield", eyebrow2: "Sectora Launch · SectoraEVM", live: "Testnet", film_eb: "El film", film_t: "Todo lo que puedes hacer en Sectora Launch.", film_s: "Lanzar, ventana justa, curva, Shield, quema de SECT y activos reales, en 34 segundos.", film_play: "Ver con sonido", fc_fair: "Ventana justa", fc_cap: "Máx. 1 % por cartera", fc_shield: "Puntuación Shield", fc_grad: "Hasta la graduación", fc_burn: "SECT quemado · testnet", fc_ex: "Ejemplo", fc_live: "En vivo", banner: "Vista previa en la testnet de SectoraEVM: el SECT y las monedas de prueba no tienen valor real. Mainnet: 22 de marzo de 2027.",
      nav_explore: "Explorar", nav_launch: "Lanzar", nav_tokenize: "Tokenizar", nav_assets: "Activos reales", nav_me: "Cuenta", nav_stats: "Transparencia",
      connect: "Crear cuenta de prueba", connect_s: "Cuenta de prueba", net: "SectoraEVM · Testnet",
      eyebrow: "Sectora Launch · en SectoraEVM",
      hero_t: "Lanza monedas y tokeniza activos reales, <em>sin estafas</em>.",
      hero_s: "Lanzamientos justos con límites anti-snipers, liquidez que nadie puede retirar, escáner de seguridad Sectora Shield en cada moneda y comisiones que recompran y queman SECT. Todo escrito en los contratos.",
      cta_launch: "Lanzar una moneda", cta_tokenize: "Tokenizar un activo",
      st_coins: "Monedas lanzadas", st_vol: "Volumen", st_creators: "Pagado a creadores", st_burn: "SECT quemado", st_rwa: "Activos reales tokenizados", st_queue: "en cola de quema",
      explore: "Explorar monedas", tab_trend: "Tendencia", tab_new: "Nuevas", tab_soon: "Por graduarse", tab_grad: "Graduadas",
      search: "Buscar nombre, ticker o dirección",
      empty_t: "Aún no hay monedas en tu testnet", empty_p: "Crea una cuenta de prueba, reclama SECT de prueba y lanza la primera moneda. Todo lo que hagas se queda en esta testnet de SectoraEVM.",
      empty_f: "Ninguna moneda coincide con este filtro.",
      mc: "Capitalización", curve: "curva", graduated: "Graduada", ago: "",
      why_t: "Por qué Sectora Launch es más seguro", why_s: "Estudiamos dónde fallan otras plataformas de lanzamiento —snipers, compras agrupadas, liquidez retirada, comisiones opacas, copias— y corregimos cada fallo en el contrato.",
      w1_t: "Lanzamiento justo anti-snipers", w1_p: "Durante los primeros 5 minutos ninguna cartera puede tener más del 1 % del supply. Los bots pierden su ventaja.", w1_v: "En otras: los bots compran el primer bloque y venden encima de la comunidad.",
      w2_t: "Sin compras agrupadas ocultas", w2_p: "El creador puede comprar como máximo un 5 % al lanzar, y esos tokens quedan bloqueados: 7 días sin vender y liberación en 30 días.", w2_v: "En otras: el creador reparte compras en muchas carteras y luego vende.",
      w3_t: "Liquidez que nadie puede retirar", w3_p: "Antes de graduarse, el SECT está dentro del contrato de la curva; al graduarse, los LP de Sectora DEX se queman para siempre.", w3_v: "En otras: \"rug pulls\" retirando la liquidez.",
      w4_t: "Comisiones escritas en el contrato", w4_p: "1 % por operación: 0,5 % al creador, 0,3 % recompra y quema SECT, 0,2 % al protocolo. Visible en cada moneda.", w4_v: "En otras: la recompra es una promesa en una web que puede cambiar.",
      w5_t: "Quema suavizada", w5_p: "La recompra y quema se hace en tramos pequeños (10 % de la cola cada 15 s), sin picos bruscos.", w5_v: "En otras: la recompra sube y baja con las comisiones del día.",
      w6_t: "Sectora Shield en cada moneda", w6_p: "Puntuación de seguridad automática: supply, liquidez, bloqueo del creador, concentración, grupos de primeros compradores y nombres copiados.", w6_v: "En otras: lo revisas tú… o no.",
      w7_t: "Precios claros", w7_p: "Todo en SECT, con referencia en dólares al precio real de SECT. Sin unidades raras.", w7_v: "En otras: precios en unidades de pares exóticos.",
      w8_t: "Protección contra copias", w8_p: "Los tickers son únicos y los nombres parecidos se avisan antes del lanzamiento y en la ficha.", w8_v: "En otras: copias falsas con el mismo nombre y ticker.",
      w9_t: "Activos reales con pruebas", w9_p: "Cada activo tokenizado lleva la huella SHA-256 de sus documentos, un custodio identificado y un calendario de verificación.", w9_v: "En otras: tokens de \"acciones\" sin derechos ni documentos.",
      w10_t: "Empresa registrada", w10_p: "Sectora Foundation está registrada en Illinois (EE. UU.) y los creadores pueden verificar su identidad.", w10_v: "En otras: equipos anónimos.",
      how_t: "Cómo funciona",
      h1_t: "Crea", h1_p: "Nombre, ticker, imagen y enlaces. Lanzar cuesta 50 SECT, que se queman.",
      h2_t: "Opera en la curva", h2_p: "El precio sube a medida que la gente compra. Los límites anti-snipers protegen los primeros minutos.",
      h3_t: "Gradúate", h3_p: "Al reunir ~{raise} SECT, la moneda pasa a Sectora DEX y el LP se quema para siempre.",
      h4_t: "Todos ganan", h4_p: "El creador gana el 0,5 % de cada operación para siempre y el 0,3 % quema SECT.",
      back: "Volver",
      launch_t: "Lanzar una moneda", launch_s: "Tu moneda sale en la testnet de SectoraEVM con un supply fijo de 1.000.000.000 y todas las protecciones incluidas.",
      f_logo: "Imagen", f_logo_btn: "Subir imagen", f_logo_hint: "PNG o JPG. Se reduce a 128 px.",
      f_name: "Nombre", f_ticker: "Ticker", f_desc: "Descripción", f_web: "Web", f_x: "X (Twitter)", f_tg: "Telegram",
      f_dev: "Tu compra al lanzar (opcional)", f_dev_hint: "Máximo 5 % del supply. Bloqueado: 7 días sin vender y liberación total en 30 días.",
      f_verify: "Solicitar verificación de creador (comprobación de identidad por Sectora Foundation). En testnet queda pendiente.",
      f_pair: "Par", f_pair_v: "SECT (token nativo de SectoraEVM)",
      cost_t: "Resumen", cost_fee: "Comisión de lanzamiento (se quema)", cost_dev: "Tu compra", cost_total: "Total", cost_bal: "Tu saldo",
      dev_tokens: "≈ {t} tokens ({p} % del supply), bloqueados",
      rules_t: "Reglas incluidas", r1: "Supply fijo de 1.000.000.000 · sin emisión, sin congelar", r2: "Anti-snipers: máx. 1 % por cartera durante 5 min", r3: "Se gradúa al reunir ~{raise} SECT → Sectora DEX, LP quemado", r4: "Comisión 1 %: 0,5 % creador · 0,3 % quema de SECT · 0,2 % protocolo",
      btn_launch: "Lanzar en SectoraEVM", need_acct: "Primero crea una cuenta de prueba", need_funds: "No tienes suficiente SECT de prueba: reclámalo en el grifo",
      e_name: "El nombre es obligatorio (máx. 32)", e_ticker: "Ticker: de 2 a 10 letras o números", e_taken: "Ese ticker ya existe en Sectora Launch", e_reserved: "Ese ticker está reservado", e_dev: "Tu compra supera el 5 % del supply",
      w_similar: "Se parece a «{n}». Shield lo marcará como posible copia.",
      preview: "Vista previa",
      price: "Precio", holders: "Holders", vol: "Volumen", buy: "Comprar", sell: "Vender", amount: "Cantidad", you_get: "Recibes", impact: "Impacto en el precio", fee_total: "Comisión (1 %)",
      to_creator: "Al creador", to_burn: "Recompra y quema de SECT", to_protocol: "Protocolo", max: "Máx.", balance: "Saldo",
      fair_on: "Ventana de lanzamiento justo: máx. 1 % del supply por cartera durante {m} más.", fair_cap: "Esta compra supera el límite del 1 % de la ventana de lanzamiento justo.",
      no_tokens: "No tienes tokens para vender", locked_note: "{a} tokens bloqueados (liberación del creador)",
      curve_t: "Curva de lanzamiento", curve_p: "{p} % · {r} de ~{g} SECT reunidos", grad_t: "Graduada a Sectora DEX", grad_p: "Liquidez: {s} SECT + {k} tokens · LP quemado para siempre",
      tab_trades: "Operaciones", tab_holders: "Holders", tab_shield: "Shield", tab_about: "Información",
      th_time: "Hora", th_acct: "Cuenta", th_type: "Tipo", th_sect: "SECT", th_tok: "Tokens", th_price: "Precio", th_tx: "Tx",
      no_trades: "Todavía no hay operaciones.", curve_holder: "Curva de lanzamiento (contrato)", pool_holder: "Pool de Sectora DEX (LP quemado)",
      creator: "Creador", created: "Creada", contract: "Contrato", verified: "Creador verificado", pending: "Verificación pendiente", you: "tú",
      fees_t: "Comisiones de esta moneda", earned: "Ganado por el creador", claimable: "Por reclamar", claim: "Reclamar", burned_via: "SECT quemado por esta moneda",
      vest_t: "Bloqueo del creador", vest_p: "{v} de {a} tokens liberados · liberación total {d}",
      chart_empty: "El gráfico empieza con la primera operación.",
      sh_score: "Puntuación Shield", sh_t: "Escáner Sectora Shield",
      c_supply: "Supply fijo", c_supply_d: "1.000.000.000 tokens. La emisión está desactivada en el contrato.",
      c_freeze: "Sin congelar ni lista negra", c_freeze_d: "Nadie puede bloquear tus tokens ni impedirte vender.",
      c_liq: "Liquidez bloqueada", c_liq_curve: "El SECT está en el contrato de la curva: nadie puede retirarlo.", c_liq_pool: "LP quemado al graduarse: liquidez bloqueada para siempre.",
      c_dev: "Reserva del creador", c_dev_none: "El creador no reservó tokens.", c_dev_ok: "{p} % comprado al lanzar, bloqueado con liberación gradual.",
      c_top: "Concentración de holders", c_top_d: "Las 10 mayores carteras tienen el {p} % del supply.",
      c_early: "Grupos de primeros compradores", c_early_d: "{p} % comprado por otras carteras en los primeros 60 segundos.",
      c_sell: "Prueba de venta", c_sell_d: "Una venta se ejecuta correctamente (no es un honeypot).",
      c_ver: "Identidad del creador", c_ver_ok: "Verificado por Sectora Foundation.", c_ver_no: "Aún no verificado.",
      c_copy: "Control de copias", c_copy_ok: "No hay nombres parecidos en Sectora Launch.", c_copy_bad: "Parecido a «{n}».",
      about_links: "Enlaces",
      tok_t: "Tokenizar un activo real", tok_s: "Convierte un activo en fracciones que cualquiera puede comprar con SECT. Los documentos se registran con su huella SHA-256 en tu navegador: los archivos nunca se suben.",
      cls: "Tipo de activo", cl_re: "Inmobiliario", cl_metal: "Metales y materias primas", cl_inv: "Facturas", cl_eq: "Participaciones de empresa", cl_bond: "Bonos y deuda", cl_art: "Arte y coleccionables", cl_veh: "Vehículos y maquinaria", cl_other: "Otro",
      a_name: "Nombre del activo", a_sym: "Símbolo", a_desc: "Descripción", a_jur: "Jurisdicción", a_cust: "Custodio / entidad legal", a_val: "Valoración (USD)", a_frac: "Número de fracciones", a_price: "Precio por fracción", a_att: "Verificación", att_m: "Mensual", att_q: "Trimestral",
      a_docs: "Documentos", a_docs_hint: "Escritura, tasación, contrato de custodia… Solo se guarda la huella SHA-256.", a_docs_btn: "Añadir documentos",
      a_decl: "Declaro que soy propietario o representante legal de este activo y que los documentos son auténticos.",
      a_submit: "Enviar para tokenizar", a_auto: "Sugerido con el precio real de SECT",
      e_aname: "El nombre del activo es obligatorio", e_asym: "Símbolo: de 2 a 8 letras o números", e_aval: "Indica la valoración", e_afrac: "Indica el número de fracciones", e_aprice: "Indica el precio por fracción", e_adocs: "Añade al menos un documento", e_adecl: "Confirma la declaración", e_ataken: "Ese símbolo ya existe",
      rwa_fee: "Comisión del 1 % en cada compra: 0,6 % recompra y quema SECT · 0,4 % protocolo.",
      assets_t: "Activos reales tokenizados", assets_s: "Cada activo muestra la huella de sus documentos, su custodio y el estado de su revisión.",
      assets_empty: "Aún no hay activos tokenizados", assets_empty_p: "Tokeniza el primer activo real en SectoraEVM.",
      st_review: "En revisión", st_approved: "Tokenizado",
      tl1: "Enviado", tl2: "Huella de documentos registrada", tl3: "Revisión de cumplimiento", tl4: "Token emitido en SectoraEVM",
      tl_note: "En testnet la revisión es automática. En mainnet la realiza el equipo de cumplimiento de Sectora Foundation.",
      valuation: "Valoración", fractions: "Fracciones", sold: "Vendidas", per_frac: "Por fracción", custodian: "Custodio", jurisdiction: "Jurisdicción", issuer: "Emisor", attestation: "Verificación", next_att: "Próxima verificación",
      docs_t: "Huellas de los documentos (SHA-256)", buy_frac: "Comprar fracciones", qty: "Cantidad", cost: "Costo", fee1: "Comisión (1 %)", total: "Total",
      not_ready: "Disponible cuando termine la revisión.", sold_out: "Todas las fracciones están vendidas.",
      rwa_risk: "Tener fracciones da exposición al activo tal como lo describe el emisor. Lee siempre los documentos.",
      me_t: "Tu cuenta de prueba", me_s: "Cuentas locales de la testnet de SectoraEVM. Usa varias para probar operaciones entre carteras.",
      faucet: "Reclamar {n} SECT de prueba", faucet_wait: "Próximo reclamo en {m}", add_acct: "Añadir cuenta", switch: "Cambiar",
      my_coins: "Monedas que creaste", my_hold: "Tus tokens", my_rwa: "Tus fracciones de activos reales", none: "Nada todavía.", value: "Valor",
      reset: "Borrar datos de la testnet", reset_q: "¿Borrar todas las monedas, activos y cuentas de prueba de este navegador?",
      tr_t: "Transparencia", tr_s: "Cada comisión y cada quema de Sectora Launch, en directo.",
      tr_split: "A dónde van las comisiones", tr_burns: "Últimas quemas", tr_params: "Parámetros del contrato", tr_none: "Todavía no hay quemas.",
      p_supply: "Supply por moneda", p_curve: "Vendido en la curva", p_pool: "Añadido a Sectora DEX", p_grad: "Graduación", p_fee: "Comisión por operación", p_launch: "Comisión de lanzamiento", p_dev: "Compra del creador", p_vest: "Liberación del creador", p_fair: "Ventana de lanzamiento justo", p_burn: "Quema suavizada",
      v_vest: "7 días sin vender · 30 días", v_fair: "5 min · máx. 1 % por cartera", v_burn: "10 % de la cola cada 15 s", v_launch: "50 SECT (se queman)", v_dev: "máx. 5 % del supply", v_grad: "~{raise} SECT reunidos",
      tr_note: "En mainnet estas reglas viven en los contratos de Sectora Launch y cada transacción se puede verificar en Sectora Scan.",
      tx_wait: "Confirmando en SectoraEVM…", tx_ok: "Confirmado", tx_block: "Bloque {b}",
      t_launched: "Moneda lanzada", t_bought: "Compraste {t} {s}", t_sold: "Vendiste {t} {s}", t_claimed: "Reclamaste {n} SECT", t_faucet: "Recibiste {n} SECT de prueba", t_grad: "¡{s} se graduó a Sectora DEX!", t_rwa: "Activo enviado a revisión", t_rwa_buy: "Compraste {q} fracciones de {s}", t_copied: "Copiado",
      ev_launch: "Lanzamiento", ev_grad: "Graduación",
      ref: "≈ {u} al precio real de SECT", footer_l: "Vista previa de Sectora Launch en la testnet de SectoraEVM. No es asesoramiento financiero. Los tokens de testnet no tienen valor.",
      acct_n: "Cuenta {n}"
    },
    pt: {
      hero_l1: "Lance moedas e", hero_l2: "tokenize <b>ativos reais</b>", hero_l3: "<b class=\"k\">sem golpes</b>.", viz_price: "Preço", viz_sold: "Tokens vendidos", viz_launch: "Lançamento", viz_grad: "Graduação · Sectora DEX", viz_burn: "Queima SECT", tag1: "Anti-snipers 5 min", tag2: "LP queimado", tag3: "0,3 % → queima SECT", tag4: "Verificação Shield", eyebrow2: "Sectora Launch · SectoraEVM", live: "Testnet", film_eb: "O filme", film_t: "Tudo o que você pode fazer no Sectora Launch.", film_s: "Lançar, janela justa, curva, Shield, queima de SECT e ativos reais, em 34 segundos.", film_play: "Ver com som", fc_fair: "Janela justa", fc_cap: "Máx. 1 % por carteira", fc_shield: "Nota Shield", fc_grad: "Até a graduação", fc_burn: "SECT queimado · testnet", fc_ex: "Exemplo", fc_live: "Ao vivo", banner: "Prévia na testnet da SectoraEVM: o SECT e as moedas de teste não têm valor real. Mainnet: 22 de março de 2027.",
      nav_explore: "Explorar", nav_launch: "Lançar", nav_tokenize: "Tokenizar", nav_assets: "Ativos reais", nav_me: "Conta", nav_stats: "Transparência",
      connect: "Criar conta de teste", connect_s: "Conta de teste", net: "SectoraEVM · Testnet",
      eyebrow: "Sectora Launch · na SectoraEVM",
      hero_t: "Lance moedas e tokenize ativos reais, <em>sem golpes</em>.",
      hero_s: "Lançamentos justos com limites anti-snipers, liquidez que ninguém pode retirar, verificação de segurança Sectora Shield em cada moeda e taxas que recompram e queimam SECT. Tudo escrito nos contratos.",
      cta_launch: "Lançar uma moeda", cta_tokenize: "Tokenizar um ativo",
      st_coins: "Moedas lançadas", st_vol: "Volume", st_creators: "Pago aos criadores", st_burn: "SECT queimado", st_rwa: "Ativos reais tokenizados", st_queue: "na fila de queima",
      explore: "Explorar moedas", tab_trend: "Em alta", tab_new: "Novas", tab_soon: "Quase graduando", tab_grad: "Graduadas",
      search: "Buscar nome, ticker ou endereço",
      empty_t: "Ainda não há moedas na sua testnet", empty_p: "Crie uma conta de teste, resgate SECT de teste e lance a primeira moeda. Tudo fica nesta testnet da SectoraEVM.",
      empty_f: "Nenhuma moeda corresponde a este filtro.",
      mc: "Capitalização", curve: "curva", graduated: "Graduada", ago: "",
      why_t: "Por que o Sectora Launch é mais seguro", why_s: "Estudamos onde outras plataformas de lançamento falham — snipers, compras agrupadas, liquidez retirada, taxas opacas, cópias — e corrigimos cada falha no contrato.",
      w1_t: "Lançamento justo anti-snipers", w1_p: "Nos primeiros 5 minutos nenhuma carteira pode ter mais de 1 % do supply. Os bots perdem a vantagem.", w1_v: "Em outras: bots compram o primeiro bloco e vendem em cima da comunidade.",
      w2_t: "Sem compras agrupadas ocultas", w2_p: "O criador pode comprar no máximo 5 % no lançamento, e esses tokens ficam bloqueados: 7 dias sem vender e liberação em 30 dias.", w2_v: "Em outras: o criador divide compras em várias carteiras e vende.",
      w3_t: "Liquidez que ninguém retira", w3_p: "Antes da graduação o SECT fica no contrato da curva; na graduação os LP da Sectora DEX são queimados para sempre.", w3_v: "Em outras: \"rug pulls\" retirando a liquidez.",
      w4_t: "Taxas escritas no contrato", w4_p: "1 % por operação: 0,5 % ao criador, 0,3 % recompra e queima SECT, 0,2 % ao protocolo. Visível em cada moeda.", w4_v: "Em outras: a recompra é uma promessa num site que pode mudar.",
      w5_t: "Queima suavizada", w5_p: "A recompra e queima acontece em pequenas parcelas (10 % da fila a cada 15 s), sem picos.", w5_v: "Em outras: a recompra oscila com as taxas do dia.",
      w6_t: "Sectora Shield em cada moeda", w6_p: "Nota de segurança automática: supply, liquidez, bloqueio do criador, concentração, grupos de primeiros compradores e nomes copiados.", w6_v: "Em outras: você verifica sozinho… ou não.",
      w7_t: "Preços claros", w7_p: "Tudo em SECT, com referência em dólares ao preço real do SECT. Sem unidades estranhas.", w7_v: "Em outras: preços em unidades de pares exóticos.",
      w8_t: "Proteção contra cópias", w8_p: "Os tickers são únicos e nomes parecidos são sinalizados antes do lançamento e na página.", w8_v: "Em outras: cópias falsas com o mesmo nome e ticker.",
      w9_t: "Ativos reais com provas", w9_p: "Cada ativo tokenizado traz a impressão SHA-256 dos documentos, um custodiante identificado e um calendário de verificação.", w9_v: "Em outras: tokens de \"ações\" sem direitos nem documentos.",
      w10_t: "Empresa registrada", w10_p: "A Sectora Foundation é registrada em Illinois (EUA) e os criadores podem verificar sua identidade.", w10_v: "Em outras: equipes anônimas.",
      how_t: "Como funciona",
      h1_t: "Crie", h1_p: "Nome, ticker, imagem e links. Lançar custa 50 SECT, que são queimados.",
      h2_t: "Negocie na curva", h2_p: "O preço sobe conforme as pessoas compram. Limites anti-snipers protegem os primeiros minutos.",
      h3_t: "Gradue", h3_p: "Ao reunir ~{raise} SECT a moeda vai para a Sectora DEX e o LP é queimado para sempre.",
      h4_t: "Todos ganham", h4_p: "O criador ganha 0,5 % de cada operação para sempre e 0,3 % queima SECT.",
      back: "Voltar",
      launch_t: "Lançar uma moeda", launch_s: "Sua moeda entra na testnet da SectoraEVM com supply fixo de 1.000.000.000 e todas as proteções incluídas.",
      f_logo: "Imagem", f_logo_btn: "Enviar imagem", f_logo_hint: "PNG ou JPG. Reduzida para 128 px.",
      f_name: "Nome", f_ticker: "Ticker", f_desc: "Descrição", f_web: "Site", f_x: "X (Twitter)", f_tg: "Telegram",
      f_dev: "Sua compra no lançamento (opcional)", f_dev_hint: "Máximo 5 % do supply. Bloqueado: 7 dias sem vender e liberação total em 30 dias.",
      f_verify: "Solicitar verificação de criador (checagem de identidade pela Sectora Foundation). Na testnet fica pendente.",
      f_pair: "Par", f_pair_v: "SECT (token nativo da SectoraEVM)",
      cost_t: "Resumo", cost_fee: "Taxa de lançamento (queimada)", cost_dev: "Sua compra", cost_total: "Total", cost_bal: "Seu saldo",
      dev_tokens: "≈ {t} tokens ({p} % do supply), bloqueados",
      rules_t: "Regras incluídas", r1: "Supply fixo de 1.000.000.000 · sem emissão, sem congelamento", r2: "Anti-snipers: máx. 1 % por carteira por 5 min", r3: "Gradua ao reunir ~{raise} SECT → Sectora DEX, LP queimado", r4: "Taxa 1 %: 0,5 % criador · 0,3 % queima de SECT · 0,2 % protocolo",
      btn_launch: "Lançar na SectoraEVM", need_acct: "Primeiro crie uma conta de teste", need_funds: "SECT de teste insuficiente: resgate na torneira",
      e_name: "O nome é obrigatório (máx. 32)", e_ticker: "Ticker: de 2 a 10 letras ou números", e_taken: "Esse ticker já existe no Sectora Launch", e_reserved: "Esse ticker é reservado", e_dev: "Sua compra passa de 5 % do supply",
      w_similar: "Parece com «{n}». O Shield vai sinalizar como possível cópia.",
      preview: "Prévia",
      price: "Preço", holders: "Holders", vol: "Volume", buy: "Comprar", sell: "Vender", amount: "Quantidade", you_get: "Você recebe", impact: "Impacto no preço", fee_total: "Taxa (1 %)",
      to_creator: "Ao criador", to_burn: "Recompra e queima de SECT", to_protocol: "Protocolo", max: "Máx.", balance: "Saldo",
      fair_on: "Janela de lançamento justo: máx. 1 % do supply por carteira por mais {m}.", fair_cap: "Esta compra passa do limite de 1 % da janela de lançamento justo.",
      no_tokens: "Você não tem tokens para vender", locked_note: "{a} tokens bloqueados (liberação do criador)",
      curve_t: "Curva de lançamento", curve_p: "{p} % · {r} de ~{g} SECT reunidos", grad_t: "Graduada para a Sectora DEX", grad_p: "Liquidez: {s} SECT + {k} tokens · LP queimado para sempre",
      tab_trades: "Operações", tab_holders: "Holders", tab_shield: "Shield", tab_about: "Sobre",
      th_time: "Hora", th_acct: "Conta", th_type: "Tipo", th_sect: "SECT", th_tok: "Tokens", th_price: "Preço", th_tx: "Tx",
      no_trades: "Ainda não há operações.", curve_holder: "Curva de lançamento (contrato)", pool_holder: "Pool da Sectora DEX (LP queimado)",
      creator: "Criador", created: "Criada", contract: "Contrato", verified: "Criador verificado", pending: "Verificação pendente", you: "você",
      fees_t: "Taxas desta moeda", earned: "Ganho do criador", claimable: "Para resgatar", claim: "Resgatar", burned_via: "SECT queimado por esta moeda",
      vest_t: "Bloqueio do criador", vest_p: "{v} de {a} tokens liberados · liberação total {d}",
      chart_empty: "O gráfico começa com a primeira operação.",
      sh_score: "Nota Shield", sh_t: "Verificação Sectora Shield",
      c_supply: "Supply fixo", c_supply_d: "1.000.000.000 tokens. A emissão está desativada no contrato.",
      c_freeze: "Sem congelamento nem lista negra", c_freeze_d: "Ninguém pode bloquear seus tokens nem impedir a venda.",
      c_liq: "Liquidez bloqueada", c_liq_curve: "O SECT fica no contrato da curva: ninguém pode retirá-lo.", c_liq_pool: "LP queimado na graduação: liquidez bloqueada para sempre.",
      c_dev: "Reserva do criador", c_dev_none: "O criador não reservou tokens.", c_dev_ok: "{p} % comprado no lançamento, bloqueado com liberação gradual.",
      c_top: "Concentração de holders", c_top_d: "As 10 maiores carteiras têm {p} % do supply.",
      c_early: "Grupos de primeiros compradores", c_early_d: "{p} % comprado por outras carteiras nos primeiros 60 segundos.",
      c_sell: "Teste de venda", c_sell_d: "Uma venda é executada corretamente (não é honeypot).",
      c_ver: "Identidade do criador", c_ver_ok: "Verificado pela Sectora Foundation.", c_ver_no: "Ainda não verificado.",
      c_copy: "Controle de cópias", c_copy_ok: "Nenhum nome parecido no Sectora Launch.", c_copy_bad: "Parecido com «{n}».",
      about_links: "Links",
      tok_t: "Tokenizar um ativo real", tok_s: "Transforme um ativo em frações que qualquer pessoa pode comprar com SECT. Os documentos são registrados pela impressão SHA-256 no seu navegador: os arquivos nunca são enviados.",
      cls: "Tipo de ativo", cl_re: "Imobiliário", cl_metal: "Metais e commodities", cl_inv: "Faturas", cl_eq: "Participações de empresa", cl_bond: "Títulos e dívida", cl_art: "Arte e colecionáveis", cl_veh: "Veículos e máquinas", cl_other: "Outro",
      a_name: "Nome do ativo", a_sym: "Símbolo", a_desc: "Descrição", a_jur: "Jurisdição", a_cust: "Custodiante / entidade legal", a_val: "Avaliação (USD)", a_frac: "Número de frações", a_price: "Preço por fração", a_att: "Verificação", att_m: "Mensal", att_q: "Trimestral",
      a_docs: "Documentos", a_docs_hint: "Escritura, laudo, contrato de custódia… Só a impressão SHA-256 é guardada.", a_docs_btn: "Adicionar documentos",
      a_decl: "Declaro que sou proprietário ou representante legal deste ativo e que os documentos são autênticos.",
      a_submit: "Enviar para tokenizar", a_auto: "Sugerido pelo preço real do SECT",
      e_aname: "O nome do ativo é obrigatório", e_asym: "Símbolo: de 2 a 8 letras ou números", e_aval: "Informe a avaliação", e_afrac: "Informe o número de frações", e_aprice: "Informe o preço por fração", e_adocs: "Adicione pelo menos um documento", e_adecl: "Confirme a declaração", e_ataken: "Esse símbolo já existe",
      rwa_fee: "Taxa de 1 % em cada compra: 0,6 % recompra e queima SECT · 0,4 % protocolo.",
      assets_t: "Ativos reais tokenizados", assets_s: "Cada ativo mostra a impressão dos documentos, o custodiante e o status da revisão.",
      assets_empty: "Ainda não há ativos tokenizados", assets_empty_p: "Tokenize o primeiro ativo real na SectoraEVM.",
      st_review: "Em revisão", st_approved: "Tokenizado",
      tl1: "Enviado", tl2: "Impressão dos documentos registrada", tl3: "Revisão de conformidade", tl4: "Token emitido na SectoraEVM",
      tl_note: "Na testnet a revisão é automática. Na mainnet é feita pela equipe de conformidade da Sectora Foundation.",
      valuation: "Avaliação", fractions: "Frações", sold: "Vendidas", per_frac: "Por fração", custodian: "Custodiante", jurisdiction: "Jurisdição", issuer: "Emissor", attestation: "Verificação", next_att: "Próxima verificação",
      docs_t: "Impressões dos documentos (SHA-256)", buy_frac: "Comprar frações", qty: "Quantidade", cost: "Custo", fee1: "Taxa (1 %)", total: "Total",
      not_ready: "Disponível quando a revisão terminar.", sold_out: "Todas as frações foram vendidas.",
      rwa_risk: "Ter frações dá exposição ao ativo como descrito pelo emissor. Leia sempre os documentos.",
      me_t: "Sua conta de teste", me_s: "Contas locais da testnet da SectoraEVM. Use várias para testar operações entre carteiras.",
      faucet: "Resgatar {n} SECT de teste", faucet_wait: "Próximo resgate em {m}", add_acct: "Adicionar conta", switch: "Trocar",
      my_coins: "Moedas que você criou", my_hold: "Seus tokens", my_rwa: "Suas frações de ativos reais", none: "Nada ainda.", value: "Valor",
      reset: "Apagar dados da testnet", reset_q: "Apagar todas as moedas, ativos e contas de teste deste navegador?",
      tr_t: "Transparência", tr_s: "Cada taxa e cada queima do Sectora Launch, ao vivo.",
      tr_split: "Para onde vão as taxas", tr_burns: "Últimas queimas", tr_params: "Parâmetros do contrato", tr_none: "Ainda não há queimas.",
      p_supply: "Supply por moeda", p_curve: "Vendido na curva", p_pool: "Adicionado à Sectora DEX", p_grad: "Graduação", p_fee: "Taxa por operação", p_launch: "Taxa de lançamento", p_dev: "Compra do criador", p_vest: "Liberação do criador", p_fair: "Janela de lançamento justo", p_burn: "Queima suavizada",
      v_vest: "7 dias sem vender · 30 dias", v_fair: "5 min · máx. 1 % por carteira", v_burn: "10 % da fila a cada 15 s", v_launch: "50 SECT (queimados)", v_dev: "máx. 5 % do supply", v_grad: "~{raise} SECT reunidos",
      tr_note: "Na mainnet estas regras ficam nos contratos do Sectora Launch e cada transação pode ser verificada na Sectora Scan.",
      tx_wait: "Confirmando na SectoraEVM…", tx_ok: "Confirmado", tx_block: "Bloco {b}",
      t_launched: "Moeda lançada", t_bought: "Você comprou {t} {s}", t_sold: "Você vendeu {t} {s}", t_claimed: "Você resgatou {n} SECT", t_faucet: "Você recebeu {n} SECT de teste", t_grad: "{s} graduou para a Sectora DEX!", t_rwa: "Ativo enviado para revisão", t_rwa_buy: "Você comprou {q} frações de {s}", t_copied: "Copiado",
      ev_launch: "Lançamento", ev_grad: "Graduação",
      ref: "≈ {u} ao preço real do SECT", footer_l: "Prévia do Sectora Launch na testnet da SectoraEVM. Não é aconselhamento financeiro. Tokens de testnet não têm valor.",
      acct_n: "Conta {n}"
    }
  };
  var LOCALE = { en: "en-US", es: "es-ES", pt: "pt-BR" };
  var L = (function () {
    try { var s = localStorage.getItem(LKEY); if (T[s]) return s; } catch (e) {}
    var n = (navigator.language || "en").slice(0, 2).toLowerCase();
    return T[n] ? n : "en";
  })();
  function t(k, v) {
    var s = (T[L] && T[L][k] != null) ? T[L][k] : (T.en[k] != null ? T.en[k] : k);
    if (v) for (var x in v) s = s.split("{" + x + "}").join(v[x]);
    return s;
  }

  /* ------------------------------------------------------------------ *
   * Formatting helpers                                                   *
   * ------------------------------------------------------------------ */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function nf(n, d) {
    return new Intl.NumberFormat(LOCALE[L], { maximumFractionDigits: d == null ? 2 : d, minimumFractionDigits: 0 }).format(n);
  }
  function compact(n) {
    var a = Math.abs(n);
    if (a >= 1e9) return nf(n / 1e9, 2) + "B";
    if (a >= 1e6) return nf(n / 1e6, 2) + "M";
    if (a >= 1e4) return nf(n / 1e3, 1) + "K";
    return nf(n, a < 10 ? 2 : 0);
  }
  var SUBS = "₀₁₂₃₄₅₆₇₈₉";
  function fmtPrice(p) {
    if (!(p > 0)) return "0";
    if (p >= 1) return nf(p, 4);
    if (p >= 0.001) return nf(p, 6);
    var s = p.toFixed(18).slice(2);
    var z = 0; while (s[z] === "0") z++;
    var sig = s.slice(z, z + 4).replace(/0+$/, "") || "0";
    var dec = new Intl.NumberFormat(LOCALE[L]).format(1.5).charAt(1);
    var zs = String(z).split("").map(function (d) { return SUBS[+d]; }).join("");
    return "0" + dec + "0" + zs + sig;
  }
  function usd(n) {
    if (!(SECT_USD > 0) || !(n >= 0)) return "";
    var v = n * SECT_USD;
    var s = v >= 1 ? "$" + nf(v, v >= 1000 ? 0 : 2) : (v > 0 ? "$" + fmtPrice(v) : "$0");
    return s;
  }
  function refLine(n) { var u = usd(n); return u ? t("ref", { u: u }) : ""; }
  function short(a) { return a ? a.slice(0, 6) + "…" + a.slice(-4) : ""; }
  function ago(ts) {
    var d = (Date.now() - ts) / 1000, rtf = new Intl.RelativeTimeFormat(LOCALE[L], { numeric: "auto", style: "short" });
    if (d < 60) return rtf.format(-Math.max(1, Math.round(d)), "second");
    if (d < 3600) return rtf.format(-Math.round(d / 60), "minute");
    if (d < 86400) return rtf.format(-Math.round(d / 3600), "hour");
    return rtf.format(-Math.round(d / 86400), "day");
  }
  function dur(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    if (s >= 3600) return Math.floor(s / 3600) + " h " + Math.floor((s % 3600) / 60) + " min";
    if (s >= 60) return Math.floor(s / 60) + " min " + (s % 60) + " s";
    return s + " s";
  }
  function dateStr(ts) { return new Intl.DateTimeFormat(LOCALE[L], { day: "numeric", month: "short", year: "numeric" }).format(new Date(ts)); }
  function timeStr(ts) { return new Intl.DateTimeFormat(LOCALE[L], { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(ts)); }
  function hex(n) {
    var b = new Uint8Array(n);
    (window.crypto || window.msCrypto).getRandomValues(b);
    return Array.prototype.map.call(b, function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
  }
  function newAddr() { return "0x" + hex(20); }
  function newTx() { return "0x" + hex(32); }
  function hashHue(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h % 360; }
  function avatar(addr) {
    var h = hashHue(addr || "x"), h2 = (h + 140) % 360;
    return "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + h + ',75%,55%)"/><stop offset="1" stop-color="hsl(' + h2 + ',70%,45%)"/></linearGradient></defs><rect width="40" height="40" fill="url(#g)"/></svg>');
  }
  function coinLogo(c) {
    if (c.img) return c.img;
    var h = hashHue(c.sym), h2 = (h + 50) % 360, ini = esc((c.sym || "?").slice(0, 2));
    return "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + h + ',80%,52%)"/><stop offset="1" stop-color="hsl(' + h2 + ',80%,38%)"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g)"/><text x="32" y="40" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">' + ini + "</text></svg>");
  }
  function safeUrl(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    try { var x = new URL(u); return (x.protocol === "https:" || x.protocol === "http:") ? x.href : ""; } catch (e) { return ""; }
  }

  /* ------------------------------------------------------------------ *
   * Icons                                                                *
   * ------------------------------------------------------------------ */
  var P = {
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2"/><path d="M9 12a13 13 0 0 1 10-9 13 13 0 0 1-9 10"/><path d="M9 12l3 3"/><path d="M8 9H5l2-3h4"/><path d="M15 16v3l-3 2v-4"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M11 21v-3h2v3"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    fire: '<path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3-1-3 0-6 0-8z"/><path d="M6.5 14a5.5 5.5 0 0 0 11 0"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    alert: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h9"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    chart: '<path d="M4 19h16"/><path d="m5 15 4-4 3 3 7-7"/>',
    coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M15 12c3.3 0 6 1.3 6 3v2c0 1.7-2.7 3-6 3-2 0-3.8-.5-4.9-1.2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 15c1.6.6 2.7 2.2 3 5"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    scale: '<path d="M12 3v18M5 21h14"/><path d="m5 7 14-2"/><path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 5l-3 7a3 3 0 0 0 6 0z"/>',
    copycat: '<rect x="3" y="7" width="10" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-6"/>',
    file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/>',
    badge: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
    home: '<path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/>',
    gold: '<path d="M4 18h16l-2-6H6z"/><path d="M8 12l1.5-5h5L16 12"/>',
    invoice: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    pie: '<path d="M12 3v9h9"/><circle cx="12" cy="12" r="9"/>',
    bond: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',
    art: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="8.5" r="1.5"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    dots: '<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  function ico(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || "") + "</svg>"; }
  var CLASSES = [
    { id: "re", i: "home" }, { id: "metal", i: "gold" }, { id: "inv", i: "invoice" }, { id: "eq", i: "pie" },
    { id: "bond", i: "bond" }, { id: "art", i: "art" }, { id: "veh", i: "truck" }, { id: "other", i: "dots" }
  ];
  function clsIcon(id) { for (var i = 0; i < CLASSES.length; i++) if (CLASSES[i].id === id) return CLASSES[i].i; return "dots"; }

  /* ------------------------------------------------------------------ *
   * Testnet ledger (persisted in this browser)                           *
   * ------------------------------------------------------------------ */
  function fresh() {
    return {
      v: 1, accounts: [], active: -1, coins: {}, order: [], assets: {}, aorder: [], trades: [], block: 1204000 + Math.floor(Math.random() * 900),
      proto: { creator: 0, burnQueue: 0, burned: 0, protocol: 0, launchBurned: 0, volume: 0, burns: [], lastTick: Date.now() }
    };
  }
  var MEM = null;
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.v === 1) return s; } catch (e) {}
    return MEM || fresh();
  }
  var S = load();
  function save() {
    MEM = S;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  }
  function acct() { return S.active >= 0 ? S.accounts[S.active] : null; }
  function acctBy(addr) { for (var i = 0; i < S.accounts.length; i++) if (S.accounts[i].addr === addr) return S.accounts[i]; return null; }
  function acctName(addr) {
    var a = acctBy(addr);
    if (!a) return short(addr);
    var me = acct() && acct().addr === addr;
    return esc(a.name) + (me ? ' <span class="faint">(' + t("you") + ")</span>" : "");
  }
  function nextBlock() { S.block += 1 + Math.floor(Math.random() * 3); return S.block; }

  // live SECT price (real, from the Ethereum mainnet pool) — used only as a dollar reference
  var SECT_USD = (function () {
    try { var c = JSON.parse(localStorage.getItem(PKEY) || "null"); if (c && Date.now() - c.t < 6 * 3600e3) return c.p; } catch (e) {}
    return 0;
  })();
  function fetchSectPrice() {
    if (!window.fetch) return;
    fetch(SECT_PAIR).then(function (r) { return r.json(); }).then(function (j) {
      var p = j && j.pairs && j.pairs[0] && parseFloat(j.pairs[0].priceUsd);
      if (p > 0) {
        SECT_USD = p;
        try { localStorage.setItem(PKEY, JSON.stringify({ p: p, t: Date.now() })); } catch (e) {}
        var ae = document.activeElement;
        if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) shell(); else render();
      }
    }).catch(function () {});
  }

  /* ------------------------------------------------------------------ *
   * Coin maths                                                           *
   * ------------------------------------------------------------------ */
  function price(c) { return c.grad ? c.pool.s / c.pool.t : c.vs / c.vt; }
  function mcap(c) { return price(c) * SUPPLY; }
  function sold(c) { return V_TOK0 - c.vt; }
  function progress(c) { return c.grad ? 1 : Math.min(1, sold(c) / CURVE_TOKENS); }
  function raised(c) { return c.grad ? c.pool.s : c.vs - V_SECT0; }
  function bal(c, addr) { return (c.holders && c.holders[addr]) || 0; }
  function lockedOf(c, addr, now) {
    if (!c.dev || c.creator !== addr) return 0;
    now = now || Date.now();
    var el = now - c.dev.start;
    var vested = el < VEST_CLIFF ? 0 : Math.min(1, el / VEST_TOTAL) * c.dev.amt;
    return Math.max(0, c.dev.amt - vested);
  }
  function sellable(c, addr) { return Math.max(0, bal(c, addr) - lockedOf(c, addr)); }
  function inFair(c) { return Date.now() < c.created + FAIR_WINDOW; }

  function quoteBuy(c, sectIn) {
    var r = { tokens: 0, used: 0, fee: 0, impact: 0, capped: false };
    if (!(sectIn > 0)) return r;
    var p0 = price(c), net, out;
    if (c.grad) {
      net = sectIn * (1 - FEE);
      out = c.pool.t - (c.pool.s * c.pool.t) / (c.pool.s + net);
      r.used = sectIn;
      r.after = (c.pool.s + net) / (c.pool.t - out);
    } else {
      var k = c.vs * c.vt, remaining = CURVE_TOKENS - sold(c);
      net = sectIn * (1 - FEE);
      out = c.vt - k / (c.vs + net);
      if (out > remaining) {
        out = remaining;
        net = k / (c.vt - remaining) - c.vs;
        r.capped = true;
      }
      r.used = net / (1 - FEE);
      r.after = (c.vs + net) / (c.vt - out);
    }
    r.net = net; r.fee = r.used * FEE; r.tokens = out;
    r.impact = r.after / p0 - 1;
    return r;
  }
  function quoteSell(c, tok) {
    var r = { out: 0, gross: 0, fee: 0, impact: 0 };
    if (!(tok > 0)) return r;
    var p0 = price(c), gross;
    if (c.grad) { gross = c.pool.s - (c.pool.s * c.pool.t) / (c.pool.t + tok); r.after = (c.pool.s - gross) / (c.pool.t + tok); }
    else { gross = c.vs - (c.vs * c.vt) / (c.vt + tok); r.after = (c.vs - gross) / (c.vt + tok); }
    r.gross = gross; r.fee = gross * FEE; r.out = gross - r.fee;
    r.impact = r.after / p0 - 1;
    return r;
  }
  function splitFee(c, fee) {
    c.creatorFees = (c.creatorFees || 0) + fee * SPLIT.creator;
    c.burnVia = (c.burnVia || 0) + fee * SPLIT.burn;
    S.proto.creator += fee * SPLIT.creator;
    S.proto.burnQueue += fee * SPLIT.burn;
    S.proto.protocol += fee * SPLIT.protocol;
  }
  function record(c, side, who, sect, tok, p, extra) {
    var tr = { c: c.addr, s: side, a: who, x: sect, k: tok, p: p, pa: price(c), t: Date.now(), b: nextBlock(), h: newTx() };
    if (extra) for (var e in extra) tr[e] = extra[e];
    S.trades.unshift(tr);
    if (S.trades.length > 3000) S.trades.length = 3000;
    return tr;
  }
  function doBuy(c, who, sectIn, opts) {
    var q = quoteBuy(c, sectIn);
    if (!(q.tokens > 0)) return null;
    if (c.grad) { c.pool.s += q.net; c.pool.t -= q.tokens; }
    else { c.vs += q.net; c.vt -= q.tokens; }
    c.holders[who] = bal(c, who) + q.tokens;
    splitFee(c, q.fee);
    c.volume = (c.volume || 0) + q.used;
    S.proto.volume += q.used;
    var tr = record(c, "buy", who, q.used, q.tokens, q.used / q.tokens, opts && opts.dev ? { d: 1 } : null);
    c.last = price(c);
    if (!c.grad && sold(c) >= CURVE_TOKENS - 1e-6) graduate(c);
    return { q: q, tr: tr };
  }
  function doSell(c, who, tok) {
    var q = quoteSell(c, tok);
    if (!(q.out > 0)) return null;
    if (c.grad) { c.pool.s -= q.gross; c.pool.t += tok; }
    else { c.vs -= q.gross; c.vt += tok; }
    c.holders[who] = bal(c, who) - tok;
    if (c.holders[who] < 1e-9) delete c.holders[who];
    splitFee(c, q.fee);
    c.volume = (c.volume || 0) + q.gross;
    S.proto.volume += q.gross;
    var tr = record(c, "sell", who, q.out, tok, q.gross / tok);
    c.last = price(c);
    return { q: q, tr: tr };
  }
  function graduate(c) {
    c.grad = true;
    c.gradAt = Date.now();
    c.pool = { s: c.vs - V_SECT0, t: POOL_TOKENS };
    record(c, "grad", DEAD, c.pool.s, POOL_TOKENS, price(c));
    toast(t("t_grad", { s: "$" + esc(c.sym) }), "ok");
  }

  /* ---------- Shield ---------- */
  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
  function lev(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length, d = [], i, j;
    if (!m) return n; if (!n) return m;
    for (i = 0; i <= m; i++) d[i] = [i];
    for (j = 0; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  function similarTo(name, sym, exceptAddr) {
    var nn = norm(name), ns = norm(sym), hit = null;
    var pool = S.order.map(function (a) { return S.coins[a]; }).filter(function (c) { return c && c.addr !== exceptAddr; });
    var known = [{ name: "Sectora", sym: "SECT" }, { name: "Bitcoin", sym: "BTC" }, { name: "Ethereum", sym: "ETH" }, { name: "Tether", sym: "USDT" }, { name: "Stonk", sym: "STONK" }];
    pool.concat(known).some(function (c) {
      var cn = norm(c.name), cs = norm(c.sym);
      var simName = nn && cn && (nn === cn || (nn.length > 3 && cn.length > 3 && lev(nn, cn) <= 1) || (cn.length > 4 && nn.indexOf(cn) >= 0));
      var simSym = ns && cs && ns !== cs && ns.length > 2 && lev(ns, cs) <= 1;
      if (simName || simSym) { hit = c.name + " ($" + c.sym + ")"; return true; }
      return false;
    });
    return hit;
  }
  function shield(c) {
    var checks = [], score = 100;
    function add(st, title, d) { checks.push({ st: st, title: title, d: d }); if (st === "warn") score -= 8; if (st === "fail") score -= 25; }
    add("pass", t("c_supply"), t("c_supply_d"));
    add("pass", t("c_freeze"), t("c_freeze_d"));
    add("pass", t("c_liq"), c.grad ? t("c_liq_pool") : t("c_liq_curve"));
    add("pass", t("c_dev"), c.dev ? t("c_dev_ok", { p: nf(c.dev.amt / SUPPLY * 100, 2) }) : t("c_dev_none"));
    var hs = Object.keys(c.holders).map(function (a) { return c.holders[a]; }).sort(function (a, b) { return b - a; });
    var top = hs.slice(0, 10).reduce(function (s, x) { return s + x; }, 0) / SUPPLY * 100;
    add(top > 50 ? "fail" : top > 30 ? "warn" : "pass", t("c_top"), t("c_top_d", { p: nf(top, 1) }));
    var early = 0;
    S.trades.forEach(function (tr) { if (tr.c === c.addr && tr.s === "buy" && tr.a !== c.creator && tr.t - c.created < 60e3) early += tr.k; });
    var ep = early / SUPPLY * 100;
    add(ep > 15 ? "warn" : "pass", t("c_early"), t("c_early_d", { p: nf(ep, 1) }));
    add(quoteSell(c, 1000).out > 0 ? "pass" : "fail", t("c_sell"), t("c_sell_d"));
    add("info", t("c_ver"), c.verified === true ? t("c_ver_ok") : t("c_ver_no"));
    var sim = similarTo(c.name, c.sym, c.addr);
    add(sim ? "warn" : "pass", t("c_copy"), sim ? t("c_copy_bad", { n: esc(sim) }) : t("c_copy_ok"));
    return { score: Math.max(0, Math.min(100, score)), checks: checks };
  }
  function scoreTag(sc) {
    var cls = sc >= 85 ? "is-good" : sc >= 65 ? "is-mid" : "is-bad";
    return '<span class="sl-tag ' + cls + '" title="' + esc(t("sh_score")) + '">' + ico("shield") + sc + "</span>";
  }

  /* ---------- Smoothed burn ---------- */
  function burnTick(silent) {
    var now = Date.now(), n = Math.min(200, Math.floor((now - S.proto.lastTick) / BURN_TICK));
    if (n <= 0) return false;
    var total = 0;
    for (var i = 0; i < n; i++) {
      var q = S.proto.burnQueue;
      if (q <= 1e-9) break;
      var x = q < 1 ? q : q * BURN_SLICE;
      S.proto.burnQueue -= x; S.proto.burned += x; total += x;
    }
    var changed = total > 0;
    if (changed) {
      S.proto.burns.unshift({ t: now, x: total, b: nextBlock(), h: newTx() });
      if (S.proto.burns.length > 30) S.proto.burns.length = 30;
    }
    S.proto.lastTick = now;
    if (changed) { save(); if (!silent) liveUpdate(); }
    return changed;
  }

  /* ------------------------------------------------------------------ *
   * UI plumbing: toast, tx modal, router                                 *
   * ------------------------------------------------------------------ */
  var toastBox = null;
  function toast(msg, kind) {
    if (!toastBox) { toastBox = document.createElement("div"); toastBox.className = "sl-toast-box"; document.body.appendChild(toastBox); }
    var el = document.createElement("div");
    el.className = "sl-toast" + (kind ? " is-" + kind : "");
    el.innerHTML = msg;
    toastBox.appendChild(el);
    setTimeout(function () { el.style.transition = "opacity .3s"; el.style.opacity = "0"; setTimeout(function () { el.remove(); }, 320); }, 3200);
  }
  function txModal(run) {
    var bg = document.createElement("div");
    bg.className = "sl-modal-bg";
    bg.innerHTML = '<div class="sl-modal" role="dialog" aria-live="polite"><div class="sl-blocks"><i></i><i></i><i></i><i></i></div><h3>' + esc(t("tx_wait")) + '</h3><p class="mono">SectoraEVM · ' + esc(t("tx_block", { b: nf(S.block + 1, 0) })) + "</p></div>";
    document.body.appendChild(bg);
    setTimeout(function () {
      var res;
      try { res = run(); } catch (e) { res = null; }
      var m = bg.querySelector(".sl-modal");
      if (!res) { bg.remove(); render(); return; }
      m.innerHTML = '<div class="sl-okmark">' + ico("check") + "</div><h3>" + esc(t("tx_ok")) + "</h3><p>" + res.msg + '</p><p class="mono">' + esc(t("tx_block", { b: nf(res.block, 0) })) + " · " + esc(res.hash) + "</p>";
      setTimeout(function () {
        bg.style.transition = "opacity .3s"; bg.style.opacity = "0";
        setTimeout(function () { bg.remove(); if (res.go) location.hash = res.go; else render(); }, 280);
      }, 1100);
    }, 900);
  }

  var entering = true;
  var view = "home", arg = "", ui = { tab: "trend", q: "", side: "buy", itab: "trades", ctab: "trades", cls: "re" };
  var booted = false;
  function parseRoute() {
    var h = (location.hash || "#/").replace(/^#\/?/, "").split("/");
    var v = h[0] || "home";
    if (["home", "create", "coin", "tokenize", "assets", "asset", "me", "stats"].indexOf(v) < 0) v = "home";
    return [v, h[1] || ""];
  }
  function route() {
    var r = parseRoute();
    function swap() { view = r[0]; arg = r[1]; entering = true; render(); window.scrollTo(0, 0); }
    if (!booted) { booted = true; swap(); return; }
    sweep(r[0], swap);
  }
  var SWEEP_LBL = { home: "nav_explore", create: "nav_launch", coin: "nav_explore", tokenize: "nav_tokenize", assets: "nav_assets", asset: "nav_assets", me: "nav_me", stats: "nav_stats" };
  var sweeping = false;
  function sweep(target, swap) {
    var w = document.getElementById("slWipe");
    if (!w || sweeping || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) { swap(); return; }
    sweeping = true;
    var b = w.querySelector(".lbl b"); if (b) b.textContent = t(SWEEP_LBL[target] || "nav_explore");
    w.classList.remove("in", "out"); void w.offsetWidth; w.classList.add("in");
    setTimeout(function () {
      swap();
      w.classList.add("out");
      setTimeout(function () { w.classList.remove("in", "out"); sweeping = false; }, 520);
    }, 440);
  }
  var NAV = [
    ["home", "#/", "nav_explore", "compass"], ["create", "#/create", "nav_launch", "rocket"], ["tokenize", "#/tokenize", "nav_tokenize", "building"],
    ["assets", "#/assets", "nav_assets", "layers"], ["stats", "#/stats", "nav_stats", "fire"], ["me", "#/me", "nav_me", "user"]
  ];
  function navOn(id) {
    if (id === view) return true;
    if (id === "home" && view === "coin") return true;
    if (id === "assets" && view === "asset") return true;
    return false;
  }
  function shell() {
    var a = acct();
    var accBtn = a
      ? '<a class="sl-acct is-on" href="#/me"><span class="dot"></span><span class="num">' + compact(a.bal) + ' SECT</span></a>'
      : '<button class="sl-acct" data-a="newacct">' + ico("user").replace("<svg", '<svg width="14" height="14"') + '<span class="l">' + esc(t("connect")) + '</span><span class="s">' + esc(t("connect_s")) + "</span></button>";
    document.getElementById("slTop").innerHTML =
      '<a class="sl-brand" href="#/" aria-label="Sectora Launch"><span class="sl-mark"><i></i></span><span class="sl-word">SECTORA <em>LAUNCH</em></span></a>' +
      '<nav class="sl-nav">' + NAV.map(function (n) { return '<a href="' + n[1] + '"' + (navOn(n[0]) ? ' class="on"' : "") + ">" + esc(t(n[2])) + "</a>"; }).join("") + "</nav>" +
      '<div class="sl-top-r"><span class="sl-pill live"><span class="sl-dot"></span>SectoraEVM · ' + esc(t("live")) + "</span>" +
      '<select class="sl-lang" data-a="lang" aria-label="Language">' + ["en", "es", "pt"].map(function (l) { return '<option value="' + l + '"' + (l === L ? " selected" : "") + ">" + l.toUpperCase() + "</option>"; }).join("") + "</select>" +
      accBtn + "</div>";
    document.getElementById("slBanner").innerHTML = '<span class="sl-dot" style="color:var(--live)"></span><span>' + esc(t("banner")) + "</span>";
    document.getElementById("slTabbar").innerHTML = NAV.filter(function (n) { return n[0] !== "stats"; }).map(function (n) {
      return '<a href="' + n[1] + '"' + (navOn(n[0]) ? ' class="on"' : "") + ">" + ico(n[3]) + "<span>" + esc(t(n[2])) + "</span></a>";
    }).join("");
    document.getElementById("slFoot").innerHTML =
      "<span>" + esc(t("footer_l")) + "</span>" +
      '<span><a href="#/stats">' + esc(t("nav_stats")) + '</a> · <a href="https://sectoraorg.com" target="_blank" rel="noopener">sectoraorg.com</a> · <a href="https://sectoraorg.com/legal" target="_blank" rel="noopener">Legal</a></span>';
    document.documentElement.lang = L;
  }

  function render() {
    shell();
    var m = document.getElementById("slMain"), h = "";
    if (view === "home") h = vHome();
    else if (view === "create") h = vCreate();
    else if (view === "coin") h = vCoin(arg);
    else if (view === "tokenize") h = vTokenize();
    else if (view === "assets") h = vAssets();
    else if (view === "asset") h = vAsset(arg);
    else if (view === "me") h = vMe();
    else if (view === "stats") h = vStats();
    m.innerHTML = h;
    m.className = entering ? "sl-enter" : "";
    if (entering) {
      Array.prototype.forEach.call(m.children, function (el, i) { el.style.setProperty("--k", Math.min(i, 8)); });
      reveal(m);
      var hero = m.querySelector(".sl-hero");
      if (hero) (window.SL_INTRO || Promise.resolve()).then(function () {
        requestAnimationFrame(function () { requestAnimationFrame(function () { m.classList.add("go"); hero.classList.add("go"); countUp(m); }); });
      });
      else m.querySelectorAll("[data-count]").length && countUp(m);
    } else {
      m.classList.add("go"); var hero2 = m.querySelector(".sl-hero"); if (hero2) hero2.classList.add("go");
    }
    entering = false;
    wire();
    if (document.getElementById("slCells")) startMosaic(); else stopMosaic();
    wireFilm();
  }

  /* ---------- live launch field behind the hero: coins launching along bonding curves ---------- */
  var MZ = null;
  function stopMosaic() { if (MZ) { MZ.stop(); MZ = null; } }
  function startMosaic() {
    var cv = document.getElementById("slCells");
    if (MZ && MZ.cv === cv) return;
    stopMosaic();
    var ctx = cv.getContext("2d"), band = cv.parentNode, W = 0, H = 0, raf = 0, last = 0, visible = true, alive = true, stars = [], streaks = [], sparks = [], nextAt = 0;
    var stack = document.getElementById("slStack");
    var COLS = ["21,105,255", "52,231,255", "62,207,142", "77,141,255"];
    function shapeY(u) { var V0 = 30000, T0 = 1.073e9, CT = 8e8, p0 = V0 / T0, pg = V0 * T0 / Math.pow(T0 - CT, 2), vt = T0 - CT * u; return (V0 * T0 / vt / vt - p0) / (pg - p0); }
    function size() {
      var r = band.getBoundingClientRect(); W = r.width; H = r.height;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = []; var n = Math.round(W * H / 9000);
      for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, z: 0.2 + Math.random() * 0.8, p: Math.random() * 6.28 });
    }
    function spawn(x0, y0, big) {
      var w = (big ? 0.5 : 0.35 + Math.random() * 0.5) * W, h = (0.25 + Math.random() * 0.45) * H;
      streaks.push({ x0: x0 == null ? -W * 0.1 + Math.random() * W * 0.6 : x0, y0: y0 == null ? H * (0.6 + Math.random() * 0.45) : y0, w: w, h: h,
        t0: performance.now(), dur: 1600 + Math.random() * 1600, c: COLS[(Math.random() * COLS.length) | 0], grad: Math.random() < 0.35 });
    }
    function draw(now) {
      if (!alive) return;
      raf = requestAnimationFrame(draw);
      if (!visible || now - last < 33) return;
      var dt = Math.min(60, now - last); last = now;
      ctx.clearRect(0, 0, W, H);
      var t = now / 1000, i, s;
      for (i = 0; i < stars.length; i++) {
        s = stars[i]; var a = 0.12 + 0.3 * s.z * (0.6 + 0.4 * Math.sin(t * 1.6 + s.p));
        ctx.fillStyle = "rgba(170,205,255," + a.toFixed(3) + ")"; ctx.fillRect((s.x + t * 6 * s.z) % W, s.y, 1.2 * s.z + 0.4, 1.2 * s.z + 0.4);
      }
      ctx.strokeStyle = "rgba(255,255,255,.028)"; ctx.lineWidth = 1; ctx.beginPath();
      var C = W < 700 ? 40 : 60;
      for (var gx = 0; gx <= W; gx += C) { ctx.moveTo(gx + 0.5, 0); ctx.lineTo(gx + 0.5, H); }
      for (var gy = 0; gy <= H; gy += C) { ctx.moveTo(0, gy + 0.5); ctx.lineTo(W, gy + 0.5); }
      ctx.stroke();
      if (now > nextAt) { spawn(); nextAt = now + 420 + Math.random() * 700; }
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
      for (var k = streaks.length - 1; k >= 0; k--) {
        var st = streaks[k], u = (now - st.t0) / st.dur;
        if (u > 1.7) { streaks.splice(k, 1); continue; }
        var head = Math.min(1, u), tail = Math.max(0, u - 0.5), fade = u > 1 ? Math.max(0, 1 - (u - 1) / 0.7) : 1, seg = 30;
        for (var j = 0; j < seg; j++) {
          var ua = tail + (head - tail) * j / seg, ub = tail + (head - tail) * (j + 1) / seg;
          ctx.strokeStyle = "rgba(" + st.c + "," + ((j / seg) * 0.55 * fade).toFixed(3) + ")"; ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.moveTo(st.x0 + st.w * ua, st.y0 - st.h * shapeY(ua)); ctx.lineTo(st.x0 + st.w * ub, st.y0 - st.h * shapeY(ub)); ctx.stroke();
        }
        if (u <= 1) {
          var hx = st.x0 + st.w * head, hy = st.y0 - st.h * shapeY(head);
          var g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 22);
          g.addColorStop(0, "rgba(255,255,255,.9)"); g.addColorStop(0.25, "rgba(" + st.c + ",.55)"); g.addColorStop(1, "rgba(" + st.c + ",0)");
          ctx.fillStyle = g; ctx.fillRect(hx - 22, hy - 22, 44, 44);
          if (Math.random() < 0.6) sparks.push({ x: hx, y: hy, vx: -0.3 - Math.random() * 0.8, vy: 0.2 + Math.random() * 0.6, l: 1, c: Math.random() < 0.2 ? "232,180,92" : st.c });
        } else if (st.grad && !st.ring) st.ring = now;
        if (st.ring) {
          var pr = (now - st.ring) / 700;
          if (pr < 1) { ctx.strokeStyle = "rgba(62,207,142," + (0.8 * (1 - pr)).toFixed(3) + ")"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(st.x0 + st.w, st.y0 - st.h, 4 + pr * 46, 0, 6.283); ctx.stroke(); }
        }
      }
      for (var q = sparks.length - 1; q >= 0; q--) {
        var p = sparks[q]; p.x += p.vx * dt * 0.06; p.y += p.vy * dt * 0.06; p.vy += 0.02 * dt * 0.06; p.l -= 0.02 * dt * 0.06;
        if (p.l <= 0) { sparks.splice(q, 1); continue; }
        ctx.fillStyle = "rgba(" + p.c + "," + (p.l * 0.8).toFixed(3) + ")"; ctx.fillRect(p.x, p.y, 1.6, 1.6);
      }
      if (sparks.length > 500) sparks.splice(0, sparks.length - 500);
      ctx.restore();
    }
    function onMove(e) {
      var r = band.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
      if (stack && W > 960) {
        stack.style.setProperty("--rx", (((my / H) - 0.5) * -10).toFixed(2) + "deg");
        stack.style.setProperty("--ry", (((mx / W) - 0.5) * 14).toFixed(2) + "deg");
      }
    }
    function onLeave() { if (stack) { stack.style.setProperty("--rx", "0deg"); stack.style.setProperty("--ry", "0deg"); } }
    function onDown(e) {
      if (e.target.closest("a,button,input,select,.sl-fc")) return;
      var r = band.getBoundingClientRect(); spawn(e.clientX - r.left - 40, e.clientY - r.top + 20, true);
    }
    var ob = "IntersectionObserver" in window ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }) : null;
    size(); spawn(null, null, true);
    if (ob) ob.observe(band);
    band.addEventListener("pointermove", onMove, { passive: true });
    band.addEventListener("pointerleave", onLeave);
    band.addEventListener("pointerdown", onDown);
    addEventListener("resize", size);
    var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { visible = true; draw(performance.now() + 40); alive = false; cancelAnimationFrame(raf); }
    else raf = requestAnimationFrame(draw);
    // fair-window clock on the floating card, and the live testnet burn number
    var fairT = document.getElementById("slFairT"), fairA = document.getElementById("slFairArc"), fs0 = performance.now();
    var clock = setInterval(function () {
      if (fairT) {
        var left = 300 - (Math.floor((performance.now() - fs0) / 1000) % 300);
        fairT.textContent = "0" + Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0");
        if (fairA) { var c = 2 * Math.PI * 34; fairA.style.strokeDashoffset = (c * (1 - left / 300)).toFixed(1); }
      }
      var fb = document.getElementById("slFcBurn"); if (fb) fb.textContent = nf(S.proto.burned + S.proto.launchBurned, 2);
    }, 1000);
    MZ = { cv: cv, stop: function () { alive = false; cancelAnimationFrame(raf); clearInterval(clock); if (ob) ob.disconnect(); removeEventListener("resize", size); } };
  }

  /* ---------- the film: silent autoplay while in view, click for sound ---------- */
  var filmObs = null;
  function wireFilm() {
    if (filmObs) { filmObs.disconnect(); filmObs = null; }
    var v = document.getElementById("slFilmV"), btn = document.getElementById("slFilmPlay"), box = document.getElementById("slFilm");
    if (!v || !btn) return;
    var full = false;
    if ("IntersectionObserver" in window) {
      filmObs = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && e.intersectionRatio > 0.35) { if (v.paused && !full) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
          else if (!full && !v.paused) v.pause();
        });
      }, { threshold: [0, 0.35, 0.6] });
      filmObs.observe(v);
    }
    btn.addEventListener("click", function () {
      full = true; v.muted = false; v.loop = false; v.currentTime = 0; v.controls = true;
      box.classList.add("is-playing");
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
    v.addEventListener("ended", function () { full = false; box.classList.remove("is-playing"); v.controls = false; v.muted = true; v.loop = true; v.play().catch(function () {}); });
  }

  /* ------------------------------------------------------------------ *
   * Views                                                                *
   * ------------------------------------------------------------------ */
  function coinsList() { return S.order.map(function (a) { return S.coins[a]; }).filter(Boolean); }
  function assetsList() { return S.aorder.map(function (a) { return S.assets[a]; }).filter(Boolean); }
  function statTiles() {
    var cs = coinsList(), rwa = assetsList().filter(function (x) { return x.status === "approved"; }).reduce(function (s, x) { return s + x.val; }, 0);
    function tile(cls, icon, label, v, kind, unit, sub, id) {
      return '<div class="sl-stat ' + cls + '"><span class="lbl">' + ico(icon) + esc(label) + '</span><b class="big"' + (id ? ' id="' + id + '"' : "") + ' data-count="' + v + '" data-kind="' + kind + '" data-unit="' + (unit || "") + '">' + bigVal(v, kind, unit) + '</b><span class="sub"' + (id ? ' id="' + id + 'U"' : "") + ">" + (sub || "&nbsp;") + "</span></div>";
    }
    var burnedTotal = S.proto.burned + S.proto.launchBurned;
    return '<div class="sl-stats">' +
      tile("", "rocket", t("st_coins"), cs.length, "int", "", "SectoraEVM · " + t("live")) +
      tile("", "chart", t("st_vol"), S.proto.volume, "c", "SECT", usd(S.proto.volume) || "&nbsp;") +
      tile("", "users", t("st_creators"), S.proto.creator, "c", "SECT", usd(S.proto.creator) || "&nbsp;") +
      tile("is-burn", "fire", t("st_burn"), burnedTotal, "c", "SECT", compact(S.proto.burnQueue) + " " + t("st_queue"), "slBurn") +
      tile("is-wide", "building", t("st_rwa"), rwa, "usd", "", nf(assetsList().length, 0) + " · " + t("nav_assets")) +
      "</div>";
  }
  function bigVal(v, kind, unit) {
    var s = kind === "int" ? nf(Math.round(v), 0) : kind === "usd" ? "$" + compact(v) : compact(v);
    return s + (unit ? "<small>" + unit + "</small>" : "");
  }
  function countUp(root) {
    var els = root.querySelectorAll("[data-count]");
    if (!els.length || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var t0 = performance.now(), D = 1300;
    Array.prototype.forEach.call(els, function (el) { el._to = parseFloat(el.getAttribute("data-count")) || 0; });
    function step(now) {
      var k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 4);
      Array.prototype.forEach.call(els, function (el) {
        el.innerHTML = bigVal(el._to * e, el.getAttribute("data-kind"), el.getAttribute("data-unit"));
      });
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var io = null;
  function reveal(root) {
    var els = root.querySelectorAll(".sl-grid > .sl-card, .sl-why-i, .sl-step, .sl-head");
    if (!("IntersectionObserver" in window)) return;
    if (!io) io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(els, function (el, i) {
      var sib = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
      el.classList.add("rv"); el.style.setProperty("--d", (Math.min(sib, 8) * 0.06) + "s");
      io.observe(el);
    });
  }
  function coinCard(c) {
    var sh = shield(c), pr = progress(c);
    return '<a class="sl-card" href="#/coin/' + c.addr + '">' +
      '<div class="sl-card-h"><img class="sl-logo" src="' + coinLogo(c) + '" alt=""><div><b>' + esc(c.name) + "</b><span>$" + esc(c.sym) + "</span></div>" + scoreTag(sh.score) + "</div>" +
      '<p class="sl-card-d">' + esc(c.desc || "") + "</p>" +
      '<div class="sl-card-m"><span class="dim">' + esc(t("mc")) + "</span><span><b>" + compact(mcap(c)) + ' SECT</b> <span class="faint">' + usd(mcap(c)) + "</span></span></div>" +
      '<div class="sl-prog' + (c.grad ? " is-done" : "") + '"><i style="width:' + (pr * 100).toFixed(1) + '%"></i></div>' +
      '<div class="sl-card-f"><span>' + (c.grad ? '<span class="sl-tag is-good">' + ico("check") + esc(t("graduated")) + "</span>" : nf(pr * 100, 1) + " % " + esc(t("curve"))) + "</span><span>" + esc(ago(c.created)) + "</span></div></a>";
  }
  function filteredCoins() {
    var q = ui.q.trim().toLowerCase(), cs = coinsList();
    if (q) cs = cs.filter(function (c) { return (c.name + " " + c.sym + " " + c.addr).toLowerCase().indexOf(q) >= 0; });
    if (ui.tab === "new") cs.sort(function (a, b) { return b.created - a.created; });
    else if (ui.tab === "soon") cs = cs.filter(function (c) { return !c.grad; }).sort(function (a, b) { return progress(b) - progress(a); });
    else if (ui.tab === "grad") cs = cs.filter(function (c) { return c.grad; }).sort(function (a, b) { return b.gradAt - a.gradAt; });
    else {
      var day = Date.now() - 864e5, v = {};
      S.trades.forEach(function (tr) { if (tr.t > day && (tr.s === "buy" || tr.s === "sell")) v[tr.c] = (v[tr.c] || 0) + tr.x; });
      cs.sort(function (a, b) { return (v[b.addr] || 0) - (v[a.addr] || 0) || b.created - a.created; });
    }
    return cs;
  }
  function gridHtml() {
    var cs = filteredCoins();
    if (!coinsList().length) {
      return '<div class="sl-empty">' + ico("rocket") + "<h3>" + esc(t("empty_t")) + "</h3><p>" + esc(t("empty_p")) + '</p><a class="sl-btn sl-btn-p" href="#/create">' + esc(t("cta_launch")) + "</a></div>";
    }
    if (!cs.length) return '<div class="sl-empty"><p>' + esc(t("empty_f")) + "</p></div>";
    return cs.map(coinCard).join("");
  }
  function vHome() {
    var raise = nf(GRAD_RAISE, 0);
    var tabs = [["trend", "tab_trend"], ["new", "tab_new"], ["soon", "tab_soon"], ["grad", "tab_grad"]];
    var why = [["bolt", 1], ["users", 2], ["lock", 3], ["scale", 4], ["fire", 5], ["shield", 6], ["chart", 7], ["copycat", 8], ["file", 9], ["badge", 10]];
    return '<section class="sl-band"><canvas id="slCells" aria-hidden="true"></canvas><div class="sl-band-veil"></div><div class="sl-band-marks"><i></i><i></i><i></i><i></i></div><div class="sl-band-in">' +
      '<section class="sl-hero"><div><span class="sl-eyebrow fade-in" style="--d:.05s"><i class="rule"></i>' + esc(t("eyebrow2")) + "</span>" +
      "<h1>" + ["hero_l1", "hero_l2", "hero_l3"].map(function (k, i) { return '<span class="ln"><span style="--i:' + i + '">' + t(k) + "</span></span>"; }).join("") + "</h1>" +
      '<p class="sl-hero-p fade-in" style="--d:.42s">' + esc(t("hero_s")) + "</p>" +
      '<div class="sl-hero-cta fade-in" style="--d:.55s"><a class="sl-btn sl-btn-p" href="#/create">' + ico("rocket") + esc(t("cta_launch")) + '</a><a class="sl-btn" href="#/tokenize">' + ico("building") + esc(t("cta_tokenize")) + "</a></div></div>" +
      '<div class="fade-in" style="--d:.3s">' + heroStack() + "</div></section>" +
      '<div class="sl-band-foot fade-in" style="--d:.65s"><div class="sl-band-hud"><span class="scroll"><i></i>Scroll</span><span>SectoraEVM · ' + esc(t("live")) + ' · Block <b class="num" id="slBlk">' + nf(S.block, 0) + "</b></span></div>" + statTiles() + "</div></div></section>" + filmSection() +
      '<section class="sl-sec"><div class="sl-head"><div><h2>' + esc(t("explore")) + '</h2><span class="lbl">' + nf(coinsList().length, 0) + " · SectoraEVM</span></div>" +
      '<label class="sl-search">' + ico("search") + '<span class="sr">' + esc(t("search")) + '</span><input class="sl-input" id="slQ" type="search" placeholder="' + esc(t("search")) + '" value="' + esc(ui.q) + '"></label></div>' +
      '<div class="sl-tabs" style="margin-bottom:16px">' +
      tabs.map(function (x) { return '<button data-a="tab" data-v="' + x[0] + '"' + (ui.tab === x[0] ? ' class="on"' : "") + ">" + esc(t(x[1])) + "</button>"; }).join("") + "</div>" +
      '<div class="sl-grid" id="slGrid">' + gridHtml() + "</div></section>" +
      '<section class="sl-sec"><div class="sl-head"><div><h2>' + esc(t("why_t")) + '</h2></div></div><p class="sl-sec-sub">' + esc(t("why_s")) + '</p><div class="sl-why">' +
      why.map(function (w) { return '<div class="sl-why-i">' + ico(w[0]) + "<h4>" + esc(t("w" + w[1] + "_t")) + "</h4><p>" + esc(t("w" + w[1] + "_p")) + '</p><span class="vs">' + esc(t("w" + w[1] + "_v")) + "</span></div>"; }).join("") +
      "</div></section>" +
      '<section class="sl-sec"><div class="sl-head"><div><h2>' + esc(t("how_t")) + '</h2></div></div><div class="sl-steps">' +
      [1, 2, 3, 4].map(function (i) { return '<div class="sl-step"><span class="n">0' + i + "</span><h4>" + esc(t("h" + i + "_t")) + "</h4><p>" + esc(t("h" + i + "_p", { raise: raise })) + "</p></div>"; }).join("") +
      "</div></section>";
  }

  function heroStack() {
    var burned = S.proto.burned + S.proto.launchBurned;
    var ring = function (id, r, col, frac) {
      var c = 2 * Math.PI * r;
      return '<svg viewBox="0 0 ' + (r * 2 + 12) + " " + (r * 2 + 12) + '" style="transform:rotate(-90deg)"><circle cx="' + (r + 6) + '" cy="' + (r + 6) + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6"/><circle' + (id ? ' id="' + id + '"' : "") + ' cx="' + (r + 6) + '" cy="' + (r + 6) + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - frac)).toFixed(1) + '" style="filter:drop-shadow(0 0 6px ' + col + ')"/></svg>';
    };
    return '<div class="sl-stack" id="slStack"><div class="sl-stack-in">' +
      '<div class="sl-fc fc1">' + heroViz() + "</div>" +
      '<div class="sl-fc fc2"><span class="lbl">' + esc(t("fc_fair")) + '</span><div class="fc-row"><div class="fc-ring">' + ring("slFairArc", 34, "#34e7ff", 1) + '</div><div><b class="fc-big" id="slFairT">05:00</b><span class="sub">' + esc(t("fc_cap")) + "</span></div></div></div>" +
      '<div class="sl-fc fc3"><span class="lbl">' + esc(t("fc_shield")) + " <em>· " + esc(t("fc_ex")) + '</em></span><div class="fc-row"><div class="fc-ring">' + ring("", 34, "#3ecf8e", 0.96) + '<b>96</b></div><div class="fc-checks"><span>' + ico("check") + esc(t("c_supply")) + "</span><span>" + ico("check") + esc(t("c_liq")) + "</span><span>" + ico("check") + esc(t("c_dev")) + "</span></div></div></div>" +
      '<div class="sl-fc fc4"><span class="lbl"><span class="sl-dot" style="color:var(--amber)"></span>' + esc(t("fc_burn")) + '</span><b class="fc-big amb" id="slFcBurn">' + nf(burned, 2) + "</b></div>" +
      "</div></div>";
  }
  function filmSection() {
    return '<section class="sl-film" id="slFilm"><div class="sl-head"><div><h2>' + esc(t("film_eb")) + '</h2><span class="lbl">0:34 · Sectora Launch</span></div></div>' +
      '<div class="sl-film-grid"><div class="sl-film-txt"><span class="sl-eyebrow"><i class="rule"></i>Film 01 · SectoraEVM</span><h3>' + esc(t("film_t")) + "</h3><p>" + esc(t("film_s")) + "</p></div>" +
      '<div class="sl-film-frame"><i class="cm tl"></i><i class="cm tr"></i><i class="cm bl"></i><i class="cm br"></i>' +
      '<video id="slFilmV" src="media/sectora-launch-film.mp4?v=1" poster="media/sectora-launch-film-poster.jpg?v=1" muted loop playsinline preload="metadata"></video>' +
      '<button class="sl-film-ov" id="slFilmPlay" type="button" aria-label="' + esc(t("film_play")) + '"><span class="sl-film-play"><svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="#fff"/></svg></span><span class="sl-film-lbl">' + esc(t("film_play")) + "</span></button></div></div></section>";
  }
  function heroViz() {
    var W = 560, H = 385, x0 = 46, x1 = 514, y0 = 318, y1 = 58, N = 48, p0 = V_SECT0 / V_TOK0, pg = (V_SECT0 + GRAD_RAISE) / (V_TOK0 - CURVE_TOKENS);
    var pts = [];
    for (var i = 0; i <= N; i++) {
      var sold = CURVE_TOKENS * i / N, vt = V_TOK0 - sold, pr = V_SECT0 * V_TOK0 / vt / vt;
      pts.push([x0 + (x1 - x0) * i / N, y0 - (y0 - y1) * (pr - p0) / (pg - p0)]);
    }
    var d = pts.map(function (q, i) { return (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" ");
    var grid = "";
    for (var gx = x0; gx <= x1 + 1; gx += 52) grid += '<line x1="' + gx + '" y1="30" x2="' + gx + '" y2="' + y0 + '"/>';
    for (var gy = y0; gy >= 30; gy -= 48) grid += '<line x1="' + x0 + '" y1="' + gy + '" x2="' + x1 + '" y2="' + gy + '"/>';
    var embers = [0.3, 0.46, 0.6, 0.72, 0.84].map(function (f, i) {
      var q = pts[Math.round(f * N)];
      return '<circle class="ember" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="1.8" style="animation-delay:' + (i * 0.9) + 's"/>';
    }).join("");
    var e = pts[N];
    return '<div class="sl-viz" aria-hidden="true"><svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMid meet">' +
      '<defs><linearGradient id="vzG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1569ff"/><stop offset=".7" stop-color="#4d8dff"/><stop offset="1" stop-color="#3ecf8e"/></linearGradient>' +
      '<linearGradient id="vzA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1569ff" stop-opacity=".22"/><stop offset="1" stop-color="#1569ff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="vzS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#34e7ff" stop-opacity="0"/><stop offset=".5" stop-color="#34e7ff" stop-opacity=".55"/><stop offset="1" stop-color="#34e7ff" stop-opacity="0"/></linearGradient></defs>' +
      '<rect class="scanv" x="0" y="0" width="' + W + '" height="1.5" fill="url(#vzS)"/>' +
      '<g class="grid">' + grid + "</g>" +
      '<path class="area" d="' + d + " L" + x1 + " " + y0 + " L" + x0 + " " + y0 + ' Z"/>' +
      '<line class="thr" x1="' + x1 + '" y1="30" x2="' + x1 + '" y2="' + y0 + '"/>' +
      '<path id="vzP" class="curve" d="' + d + '"/>' + embers +
      '<circle class="ring" cx="' + e[0].toFixed(1) + '" cy="' + e[1].toFixed(1) + '" r="9"/>' +
      '<circle cx="' + e[0].toFixed(1) + '" cy="' + e[1].toFixed(1) + '" r="3.2" fill="#3ecf8e"/>' +
      '<circle class="runner" r="4"><animateMotion dur="6s" begin="2.4s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .55 1"><mpath href="#vzP"/></animateMotion></circle>' +
      '<text x="' + x0 + '" y="22">' + esc(t("viz_price")) + "</text>" +
      '<text x="' + x1 + '" y="' + (y0 + 22) + '" text-anchor="end">' + esc(t("viz_sold")) + "</text>" +
      '<text x="' + (x0 + 6) + '" y="' + (y0 - 10) + '">' + esc(t("viz_launch")) + "</text>" +
      '<text class="t-live" x="' + (e[0] - 22) + '" y="' + (e[1] + 4) + '" text-anchor="end">' + esc(t("viz_grad")) + "</text>" +
      '<text class="t-amber" x="' + (pts[Math.round(0.6 * N)][0] - 16) + '" y="' + (pts[Math.round(0.6 * N)][1] - 34) + '" text-anchor="end">' + esc(t("viz_burn")) + "</text>" +
      '</svg><div class="sl-viz-tags"><span>' + esc(t("tag1")) + "</span><span>" + esc(t("tag2")) + "</span><span>" + esc(t("tag3")) + "</span><span>" + esc(t("tag4")) + "</span></div></div>";
  }

  /* ---------- Create ---------- */
  var draft = { img: "", name: "", sym: "", desc: "", web: "", x: "", tg: "", dev: "", verify: false };
  function devTokens(sectIn) {
    if (!(sectIn > 0)) return 0;
    var net = sectIn * (1 - FEE);
    return V_TOK0 - (V_SECT0 * V_TOK0) / (V_SECT0 + net);
  }
  var DEV_MAX_SECT = (function () {
    var tok = DEV_MAX * SUPPLY, net = (V_SECT0 * V_TOK0) / (V_TOK0 - tok) - V_SECT0;
    return Math.floor(net / (1 - FEE) * 100) / 100;
  })();
  function createErrors() {
    var e = {}, sym = draft.sym.toUpperCase();
    if (!draft.name.trim() || draft.name.trim().length > 32) e.name = t("e_name");
    if (!/^[A-Z0-9]{2,10}$/.test(sym)) e.sym = t("e_ticker");
    else if (RESERVED.indexOf(sym) >= 0) e.sym = t("e_reserved");
    else if (coinsList().some(function (c) { return c.sym === sym; })) e.sym = t("e_taken");
    var d = parseFloat(draft.dev) || 0;
    if (d > DEV_MAX_SECT + 1e-9) e.dev = t("e_dev");
    return e;
  }
  function createSummary() {
    var a = acct(), d = parseFloat(draft.dev) || 0, total = LAUNCH_FEE + d;
    var tok = devTokens(d);
    var sim = (draft.name || draft.sym) ? similarTo(draft.name, draft.sym.toUpperCase(), null) : null;
    var errs = createErrors(), ok = !Object.keys(errs).length && a && a.bal >= total;
    var html = '<div class="sl-panel"><h3>' + ico("coins") + esc(t("preview")) + "</h3>" +
      '<div class="sl-card" style="pointer-events:none;border-color:var(--border-strong)">' +
      '<div class="sl-card-h"><img class="sl-logo" src="' + coinLogo({ img: draft.img, sym: (draft.sym || "?").toUpperCase() }) + '" alt=""><div><b>' + esc(draft.name || "—") + "</b><span>$" + esc((draft.sym || "—").toUpperCase()) + "</span></div>" + scoreTag(sim ? 92 : 100) + "</div>" +
      '<p class="sl-card-d">' + esc(draft.desc || "") + "</p>" +
      '<div class="sl-card-m"><span class="dim">' + esc(t("mc")) + "</span><span><b>" + compact(V_SECT0 / V_TOK0 * SUPPLY) + ' SECT</b> <span class="faint">' + usd(V_SECT0 / V_TOK0 * SUPPLY) + "</span></span></div>" +
      '<div class="sl-prog"><i style="width:' + (tok / CURVE_TOKENS * 100).toFixed(2) + '%"></i></div></div></div>' +
      '<div class="sl-panel sl-cost"><h3>' + ico("scale") + esc(t("cost_t")) + "</h3>" +
      '<div class="sl-kv"><span>' + esc(t("cost_fee")) + '</span><b class="num">' + nf(LAUNCH_FEE, 0) + " SECT</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("cost_dev")) + '</span><b class="num">' + nf(d, 2) + " SECT</b></div>" +
      (tok > 0 ? '<div class="sl-kv"><span></span><b class="dim" style="font-size:12.5px">' + esc(t("dev_tokens", { t: compact(tok), p: nf(tok / SUPPLY * 100, 2) })) + "</b></div>" : "") +
      '<div class="sl-kv total"><span>' + esc(t("cost_total")) + '</span><b class="num">' + nf(total, 2) + " SECT</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("cost_bal")) + '</span><b class="num">' + (a ? nf(a.bal, 2) + " SECT" : "—") + "</b></div>" +
      '<div style="margin-top:14px">' +
      (!a ? '<button class="sl-btn sl-btn-p sl-btn-w" data-a="newacct">' + esc(t("connect")) + "</button>"
        : a.bal < total ? '<a class="sl-btn sl-btn-w" href="#/me">' + esc(t("need_funds")) + "</a>"
        : '<button class="sl-btn sl-btn-p sl-btn-w" data-a="launch"' + (ok ? "" : " disabled") + ">" + ico("rocket").replace("<svg", '<svg width="17" height="17"') + esc(t("btn_launch")) + "</button>") +
      (a && a.bal >= total && !ok && (draft.name || draft.sym || draft.dev) ? '<p class="sl-note" style="color:var(--amber)">' + esc(errs[Object.keys(errs)[0]]) + "</p>" : "") +
      "</div></div>" +
      '<div class="sl-panel"><h3>' + ico("shield") + esc(t("rules_t")) + '</h3><div class="sl-checks">' +
      ["r1", "r2", "r3", "r4"].map(function (r) { return '<div class="sl-chk pass"><i>' + ico("check") + "</i><div><span>" + esc(t(r, { raise: nf(GRAD_RAISE, 0) })) + "</span></div></div>"; }).join("") +
      "</div></div>";
    return html;
  }
  function vCreate() {
    var errs = createErrors(), sim = (draft.name || draft.sym) ? similarTo(draft.name, draft.sym.toUpperCase(), null) : null;
    function f(id, label, val, attrs, err) {
      return '<div class="sl-field"><label for="' + id + '">' + esc(label) + '</label><input class="sl-input' + (err ? " is-bad" : "") + '" id="' + id + '" value="' + esc(val) + '" ' + (attrs || "") + ">" + (err ? '<small style="color:var(--red)">' + esc(err) + "</small>" : "") + "</div>";
    }
    var touched = draft._touched || {};
    return '<a class="sl-back" href="#/">' + ico("back") + esc(t("back")) + "</a>" +
      '<div class="sl-pagehead"><span class="sl-eyebrow"><i class="rule"></i>Sectora Launch</span><h1>' + esc(t("launch_t")) + "</h1><p>" + esc(t("launch_s")) + "</p></div>" +
      '<div class="sl-2col"><div><div class="sl-panel">' +
      '<div class="sl-field"><span class="sl-label">' + esc(t("f_logo")) + '</span><div class="sl-upload"><img class="sl-logo" id="slLogoPv" src="' + coinLogo({ img: draft.img, sym: (draft.sym || "?").toUpperCase() }) + '" alt="">' +
      '<div><label class="sl-btn sl-btn-sm" for="slLogo">' + ico("upload").replace("<svg", '<svg width="15" height="15"') + esc(t("f_logo_btn")) + '</label><input type="file" id="slLogo" accept="image/png,image/jpeg,image/webp,image/gif" hidden><small style="display:block;margin-top:6px">' + esc(t("f_logo_hint")) + "</small></div></div></div>" +
      '<div class="sl-row2">' + f("slName", t("f_name"), draft.name, 'maxlength="32" autocomplete="off"', touched.name && errs.name) +
      f("slSym", t("f_ticker"), draft.sym.toUpperCase(), 'maxlength="10" autocomplete="off" autocapitalize="characters" style="text-transform:uppercase;font-family:var(--mono)"', touched.sym && errs.sym) + "</div>" +
      '<div class="sl-warn-list" id="slSim">' + simHtml(sim) + "</div>" +
      '<div class="sl-field"><label for="slDesc">' + esc(t("f_desc")) + '</label><textarea class="sl-textarea" id="slDesc" maxlength="280">' + esc(draft.desc) + "</textarea></div>" +
      '<div class="sl-row3">' + f("slWeb", t("f_web"), draft.web, 'inputmode="url" placeholder="https://"') + f("slX", t("f_x"), draft.x, 'inputmode="url" placeholder="https://x.com/…"') + f("slTg", t("f_tg"), draft.tg, 'inputmode="url" placeholder="https://t.me/…"') + "</div>" +
      '<div class="sl-field"><span class="sl-label">' + esc(t("f_pair")) + '</span><div class="sl-input" style="color:var(--dim)">' + esc(t("f_pair_v")) + "</div></div>" +
      '<div class="sl-field"><label for="slDev">' + esc(t("f_dev")) + '</label><div class="sl-input-wrap"><input class="sl-input num' + (errs.dev ? " is-bad" : "") + '" id="slDev" inputmode="decimal" placeholder="0" value="' + esc(draft.dev) + '"><span class="unit">SECT</span></div>' +
      '<div class="sl-quick" style="margin:6px 0 0">' + [100, 500, 1000].map(function (v) { return '<button type="button" data-a="dev" data-v="' + v + '">' + nf(v, 0) + "</button>"; }).join("") + '<button type="button" data-a="dev" data-v="' + DEV_MAX_SECT + '">' + esc(t("max")) + " 5 %</button></div>" +
      "<small>" + esc(errs.dev || t("f_dev_hint")) + "</small></div>" +
      '<label class="sl-check"><input type="checkbox" id="slVerify"' + (draft.verify ? " checked" : "") + "><span>" + esc(t("f_verify")) + "</span></label>" +
      '</div></div><div class="sl-sticky" id="slSummary">' + createSummary() + "</div></div>";
  }

  /* ---------- Coin page ---------- */
  function coinTrades(c) { return S.trades.filter(function (tr) { return tr.c === c.addr; }); }
  function chartSvg(c) {
    var pts = coinTrades(c).filter(function (tr) { return tr.s === "buy" || tr.s === "sell"; }).slice().reverse();
    var series = [{ t: c.created, p: V_SECT0 / V_TOK0 }];
    pts.forEach(function (tr) { series.push({ t: tr.t, p: tr.pa || tr.p }); });
    var W = 800, H = 260, padT = 14, padB = 22;
    if (series.length < 2) return '<div class="sl-chart-wrap"><svg class="sl-chart" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none"><line x1="0" y1="' + (H - 40) + '" x2="' + W + '" y2="' + (H - 40) + '" stroke="rgba(255,255,255,.12)" stroke-dasharray="4 6"/></svg><div class="sl-chart-empty">' + esc(t("chart_empty")) + "</div></div>";
    var ys = series.map(function (s) { return s.p; }), mn = Math.min.apply(null, ys), mx = Math.max.apply(null, ys);
    if (mx === mn) { mx *= 1.05; mn *= 0.95; }
    var n = series.length;
    var coords = series.map(function (s, i) {
      var x = n === 1 ? W : (i / (n - 1)) * W;
      var y = padT + (1 - (s.p - mn) / (mx - mn)) * (H - padT - padB);
      return [x, y];
    });
    var line = coords.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    var up = ys[ys.length - 1] >= ys[0];
    var col = up ? "#14e0a0" : "#ff5c6c";
    var area = line + " L" + W + " " + H + " L0 " + H + " Z";
    return '<div class="sl-chart-wrap"><svg class="sl-chart" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none"><defs><linearGradient id="slG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + col + '" stop-opacity=".28"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient></defs>' +
      '<path class="ar-path" d="' + area + '" fill="url(#slG)"/><path class="ln-path" pathLength="1" d="' + line + '" fill="none" stroke="' + col + '" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" style="filter:drop-shadow(0 0 5px ' + col + '88)"/></svg>' +
      '<span class="pt" style="position:absolute;right:0;top:' + (coords[coords.length - 1][1] / H * 100).toFixed(2) + '%;width:9px;height:9px;margin:-4.5px -2px 0 0;border-radius:50%;background:' + col + ';box-shadow:0 0 0 4px ' + col + '33,0 0 14px ' + col + '"></span></div>';
  }
  function tradePanel(c) {
    var a = acct(), side = ui.side;
    var head = '<div class="sl-trade-tabs"><button class="buy' + (side === "buy" ? " on" : "") + '" data-a="side" data-v="buy">' + esc(t("buy")) + '</button><button class="sell' + (side === "sell" ? " on" : "") + '" data-a="side" data-v="sell">' + esc(t("sell")) + "</button></div>";
    var fair = !c.grad && inFair(c) ? '<div class="sl-alert is-info" style="margin-bottom:14px" id="slFair">' + ico("clock") + "<span>" + esc(t("fair_on", { m: dur(c.created + FAIR_WINDOW - Date.now()) })) + "</span></div>" : "";
    var balLine, quick, unit;
    if (side === "buy") {
      unit = "SECT";
      balLine = '<div class="sl-bal"><span>' + esc(t("balance")) + '</span><span class="num">' + (a ? nf(a.bal, 2) + " SECT" : "—") + "</span></div>";
      quick = [100, 500, 1000, 5000].map(function (v) { return '<button data-a="amt" data-v="' + v + '">' + compact(v) + "</button>"; }).join("");
    } else {
      unit = "$" + esc(c.sym);
      var sl = a ? sellable(c, a.addr) : 0, lk = a ? lockedOf(c, a.addr) : 0;
      balLine = '<div class="sl-bal"><span>' + esc(t("balance")) + '</span><span class="num">' + (a ? compact(bal(c, a.addr)) + " " + esc(c.sym) : "—") + "</span></div>" +
        (lk > 0 ? '<div class="sl-bal"><span>' + ico("lock").replace("<svg", '<svg width="12" height="12"') + " " + esc(t("locked_note", { a: compact(lk) })) + "</span><span></span></div>" : "");
      quick = [0.25, 0.5, 0.75, 1].map(function (f) { return '<button data-a="pct" data-v="' + f + '">' + (f === 1 ? esc(t("max")) : f * 100 + "%") + "</button>"; }).join("");
    }
    var btn = !a ? '<button class="sl-btn sl-btn-p sl-btn-w" data-a="newacct">' + esc(t("connect")) + "</button>"
      : '<button class="sl-btn sl-btn-w ' + (side === "buy" ? "sl-btn-g" : "sl-btn-r") + '" data-a="trade" id="slTradeBtn" disabled>' + esc(side === "buy" ? t("buy") : t("sell")) + " $" + esc(c.sym) + "</button>";
    return '<div class="sl-panel">' + head + fair +
      '<div class="sl-field" style="margin-bottom:12px"><div class="sl-input-wrap"><input class="sl-input num" id="slAmt" inputmode="decimal" placeholder="0.0" autocomplete="off"><span class="unit">' + unit + "</span></div></div>" +
      balLine + '<div class="sl-quick">' + quick + "</div>" +
      '<div class="sl-quote" id="slQuote">' + quoteHtml(c, 0) + "</div>" +
      '<div id="slTradeErr"></div>' + btn + "</div>";
  }
  function quoteHtml(c, amt) {
    var side = ui.side, rows = [];
    if (side === "buy") {
      var q = quoteBuy(c, amt);
      rows.push(["you_get", q.tokens > 0 ? compact(q.tokens) + " $" + esc(c.sym) : "—"]);
      rows.push(["impact", q.tokens > 0 ? nf(q.impact * 100, 2) + " %" : "—"]);
      rows.push(["fee_total", q.fee > 0 ? nf(q.fee, 4) + " SECT" : "—"]);
    } else {
      var s = quoteSell(c, amt);
      rows.push(["you_get", s.out > 0 ? nf(s.out, 2) + " SECT" : "—"]);
      rows.push(["impact", s.out > 0 ? nf(s.impact * 100, 2) + " %" : "—"]);
      rows.push(["fee_total", s.fee > 0 ? nf(s.fee, 4) + " SECT" : "—"]);
    }
    return rows.map(function (r) { return '<div class="sl-kv"><span>' + esc(t(r[0])) + '</span><b class="num">' + r[1] + "</b></div>"; }).join("");
  }
  function curvePanel(c) {
    if (c.grad) {
      return '<div class="sl-panel"><h3>' + ico("check") + esc(t("grad_t")) + '</h3><div class="sl-prog is-done"><i style="width:100%"></i></div><p class="sl-note">' +
        esc(t("grad_p", { s: compact(c.pool.s), k: compact(c.pool.t) })) + "</p></div>";
    }
    var pr = progress(c);
    return '<div class="sl-panel"><h3>' + ico("chart") + esc(t("curve_t")) + '</h3><div class="sl-prog"><i style="width:' + (pr * 100).toFixed(2) + '%"></i></div><p class="sl-note">' +
      esc(t("curve_p", { p: nf(pr * 100, 2), r: compact(raised(c)), g: compact(GRAD_RAISE) })) + "</p></div>";
  }
  function feesPanel(c) {
    var a = acct(), mine = a && a.addr === c.creator, unclaimed = (c.creatorFees || 0) - (c.creatorClaimed || 0);
    var html = '<div class="sl-panel"><h3>' + ico("scale") + esc(t("fees_t")) + '</h3><div class="sl-fees"><i style="flex:5"></i><i style="flex:3"></i><i style="flex:2"></i></div>' +
      '<div class="sl-legend"><div style="--c:var(--blue)">' + nf(0.5, 1) + " % · " + esc(t("to_creator")) + "<b>" + nf(c.creatorFees || 0, 2) + '</b></div><div style="--c:var(--amber)">' + nf(0.3, 1) + " % · " + esc(t("to_burn")) + "<b>" + nf(c.burnVia || 0, 2) + '</b></div><div style="--c:var(--violet)">' + nf(0.2, 1) + " % · " + esc(t("to_protocol")) + "<b>" + nf(((c.creatorFees || 0) / SPLIT.creator) * SPLIT.protocol, 2) + "</b></div></div>";
    if (mine) {
      html += '<div class="sl-kv" style="margin-top:12px"><span>' + esc(t("claimable")) + '</span><b class="num">' + nf(unclaimed, 4) + " SECT</b></div>" +
        '<button class="sl-btn sl-btn-p sl-btn-w" style="margin-top:10px" data-a="claim" data-v="' + c.addr + '"' + (unclaimed > 1e-6 ? "" : " disabled") + ">" + esc(t("claim")) + "</button>";
    }
    html += "</div>";
    if (c.dev) {
      var lk = lockedOf(c, c.creator), v = c.dev.amt - lk;
      html += '<div class="sl-panel"><h3>' + ico("lock") + esc(t("vest_t")) + '</h3><div class="sl-prog"><i style="width:' + (v / c.dev.amt * 100).toFixed(1) + '%"></i></div><p class="sl-note">' +
        esc(t("vest_p", { v: compact(v), a: compact(c.dev.amt), d: dateStr(c.dev.start + VEST_TOTAL) })) + "</p></div>";
    }
    return html;
  }
  function shieldHtml(c) {
    var sh = shield(c), col = sh.score >= 85 ? "var(--green)" : sh.score >= 65 ? "var(--amber)" : "var(--red)";
    var circ = 2 * Math.PI * 31, off = circ * (1 - sh.score / 100);
    return '<div class="sl-shield-top"><div class="sl-ring"><svg viewBox="0 0 74 74"><circle cx="37" cy="37" r="31" fill="none" stroke="var(--panel-3)" stroke-width="7"/><circle cx="37" cy="37" r="31" fill="none" stroke="' + col + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg><b>' + sh.score + "</b></div>" +
      "<div><b>" + esc(t("sh_t")) + '</b><p class="sl-note" style="margin-top:4px">' + esc(t("sh_score")) + " · " + sh.checks.filter(function (x) { return x.st === "pass"; }).length + "/" + sh.checks.length + "</p></div></div>" +
      '<div class="sl-checks">' + sh.checks.map(function (x) {
        var ic = x.st === "pass" ? "check" : x.st === "info" ? "info" : x.st === "warn" ? "alert" : "x";
        return '<div class="sl-chk ' + x.st + '"><i>' + ico(ic) + "</i><div><b>" + esc(x.title) + "</b><span>" + x.d + "</span></div></div>";
      }).join("") + "</div>";
  }
  function tradesTable(list, c) {
    if (!list.length) return '<p class="dim" style="margin:6px 0">' + esc(t("no_trades")) + "</p>";
    return '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th>' + esc(t("th_time")) + "</th><th>" + esc(t("th_type")) + "</th><th>" + esc(t("th_acct")) + '</th><th class="r">' + esc(t("th_sect")) + '</th><th class="r">' + esc(t("th_tok")) + '</th><th class="r sl-hide-sm">' + esc(t("th_price")) + '</th><th class="sl-hide-sm">' + esc(t("th_tx")) + "</th></tr></thead><tbody>" +
      list.slice(0, 60).map(function (tr) {
        var type = tr.s === "buy" ? '<span class="sl-side-pill buy">' + esc(t("buy")) + "</span>" : tr.s === "sell" ? '<span class="sl-side-pill sell">' + esc(t("sell")) + "</span>" : '<span class="sl-side-pill ev">' + esc(tr.s === "grad" ? t("ev_grad") : t("ev_launch")) + "</span>";
        return "<tr" + (tr.h === ui.fresh ? ' class="nueva"' : "") + "><td class=\"mono dim\">" + esc(timeStr(tr.t)) + "</td><td>" + type + "</td><td>" + (tr.s === "grad" ? "Sectora DEX" : acctName(tr.a)) + '</td><td class="r num">' + nf(tr.x, 2) + '</td><td class="r num">' + compact(tr.k) + '</td><td class="r num sl-hide-sm">' + fmtPrice(tr.p) + '</td><td class="mono faint sl-hide-sm">' + esc(short(tr.h)) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }
  function holdersTable(c) {
    var rows = Object.keys(c.holders).map(function (a) { return [a, c.holders[a]]; }).filter(function (r) { return r[1] > 1e-6; });
    if (!c.grad) rows.push(["curve", CURVE_TOKENS - sold(c) + POOL_TOKENS]);
    else rows.push(["pool", c.pool.t]);
    rows.sort(function (x, y) { return y[1] - x[1]; });
    return '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th>#</th><th>' + esc(t("th_acct")) + '</th><th class="r">' + esc(t("th_tok")) + '</th><th class="r">%</th></tr></thead><tbody>' +
      rows.slice(0, 30).map(function (r, i) {
        var name = r[0] === "curve" ? esc(t("curve_holder")) : r[0] === "pool" ? esc(t("pool_holder")) : acctName(r[0]) + (r[0] === c.creator ? ' <span class="sl-tag is-blue">' + esc(t("creator")) + "</span>" : "");
        return '<tr><td class="faint">' + (i + 1) + "</td><td>" + name + '</td><td class="r num">' + compact(r[1]) + '</td><td class="r num">' + nf(r[1] / SUPPLY * 100, 2) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }
  function aboutHtml(c) {
    var links = [["web", t("f_web")], ["x", t("f_x")], ["tg", t("f_tg")]].filter(function (l) { return c.links && c.links[l[0]]; });
    return '<p style="margin:0 0 14px;color:var(--dim)">' + esc(c.desc || "—") + "</p>" +
      '<div class="sl-kv"><span>' + esc(t("contract")) + '</span><b class="mono">' + esc(short(c.addr)) + "</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("creator")) + "</span><b>" + acctName(c.creator) + "</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("created")) + "</span><b>" + esc(dateStr(c.created)) + " · " + esc(timeStr(c.created)) + "</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("f_pair")) + "</span><b>SECT</b></div>" +
      (links.length ? '<div class="sl-kv"><span>' + esc(t("about_links")) + '</span><b style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end">' +
        links.map(function (l) { return '<a href="' + esc(c.links[l[0]]) + '" target="_blank" rel="noopener nofollow" style="color:var(--blue)">' + esc(l[1]) + "</a>"; }).join("") + "</b></div>" : "");
  }
  function vCoin(addr) {
    var c = S.coins[addr];
    if (!c) return '<a class="sl-back" href="#/">' + ico("back") + esc(t("back")) + '</a><div class="sl-empty"><p>' + esc(t("empty_f")) + "</p></div>";
    var hs = Object.keys(c.holders).filter(function (a) { return c.holders[a] > 1e-6; }).length;
    var itabs = [["trades", "tab_trades"], ["holders", "tab_holders"], ["shield", "tab_shield"], ["about", "tab_about"]];
    var body = ui.ctab === "holders" ? holdersTable(c) : ui.ctab === "shield" ? shieldHtml(c) : ui.ctab === "about" ? aboutHtml(c) : tradesTable(coinTrades(c), c);
    return '<a class="sl-back" href="#/">' + ico("back") + esc(t("back")) + "</a>" +
      '<div class="sl-2col"><div>' +
      '<div class="sl-coinhead"><img class="sl-logo sl-logo-lg" src="' + coinLogo(c) + '" alt=""><div><h1>' + esc(c.name) + " <span>$" + esc(c.sym) + "</span>" + scoreTag(shield(c).score) + "</h1>" +
      '<div class="meta"><button class="sl-addr" data-a="copy" data-v="' + c.addr + '">' + esc(short(c.addr)) + ico("copy") + "</button>" +
      (c.grad ? '<span class="sl-tag is-good">' + ico("check") + esc(t("graduated")) + "</span>" : "") +
      (c.verified === true ? '<span class="sl-tag is-blue">' + ico("badge") + esc(t("verified")) + "</span>" : c.verify ? '<span class="sl-tag">' + ico("clock") + esc(t("pending")) + "</span>" : "") +
      '<span class="faint" style="font-size:12.5px">' + esc(ago(c.created)) + "</span></div></div></div>" +
      '<div class="sl-panel"><div class="sl-pricebar">' +
      "<div><span>" + esc(t("price")) + '</span><b>' + fmtPrice(price(c)) + ' <small>SECT</small></b><small style="margin:0">' + usd(price(c)) + "</small></div>" +
      "<div><span>" + esc(t("mc")) + '</span><b>' + compact(mcap(c)) + ' <small>SECT</small></b><small style="margin:0">' + usd(mcap(c)) + "</small></div>" +
      "<div><span>" + esc(t("vol")) + '</span><b>' + compact(c.volume || 0) + ' <small>SECT</small></b></div>' +
      "<div><span>" + esc(t("holders")) + '</span><b>' + nf(hs, 0) + "</b></div></div>" + chartSvg(c) + "</div>" +
      '<div class="sl-panel"><div class="sl-itabs">' + itabs.map(function (x) { return '<button data-a="ctab" data-v="' + x[0] + '"' + (ui.ctab === x[0] ? ' class="on"' : "") + ">" + esc(t(x[1])) + "</button>"; }).join("") + "</div>" + body + "</div>" +
      '</div><div class="sl-sticky">' + tradePanel(c) + curvePanel(c) + feesPanel(c) + "</div></div>";
  }

  /* ---------- Tokenize ---------- */
  var adraft = { cls: "re", name: "", sym: "", desc: "", jur: "", cust: "", val: "", frac: "", price: "", priceAuto: true, att: "q", docs: [], decl: false, _t: {} };
  function aErrors() {
    var e = {}, sym = adraft.sym.toUpperCase();
    if (!adraft.name.trim()) e.name = t("e_aname");
    if (!/^[A-Z0-9]{2,8}$/.test(sym)) e.sym = t("e_asym");
    else if (assetsList().some(function (x) { return x.sym === "x" + sym; })) e.sym = t("e_ataken");
    if (!(parseFloat(adraft.val) > 0)) e.val = t("e_aval");
    if (!(parseInt(adraft.frac, 10) > 0)) e.frac = t("e_afrac");
    if (!(parseFloat(adraft.price) > 0)) e.price = t("e_aprice");
    if (!adraft.docs.length) e.docs = t("e_adocs");
    if (!adraft.decl) e.decl = t("e_adecl");
    return e;
  }
  function autoPrice() {
    var v = parseFloat(adraft.val), f = parseInt(adraft.frac, 10);
    if (adraft.priceAuto && v > 0 && f > 0 && SECT_USD > 0) adraft.price = String(+(v / f / SECT_USD).toFixed(4));
  }
  function aSummary() {
    var a = acct(), errs = aErrors(), ok = !Object.keys(errs).length && a;
    var v = parseFloat(adraft.val) || 0, f = parseInt(adraft.frac, 10) || 0, p = parseFloat(adraft.price) || 0;
    return '<div class="sl-panel"><h3>' + ico("building") + esc(t("preview")) + "</h3>" +
      '<div class="sl-card-h" style="margin-bottom:14px"><div class="sl-rwa-icon">' + ico(clsIcon(adraft.cls)) + "</div><div><b>" + esc(adraft.name || "—") + '</b><span class="mono">x' + esc((adraft.sym || "—").toUpperCase()) + '</span></div><span class="sl-tag is-gold">' + esc(t("cl_" + adraft.cls)) + "</span></div>" +
      '<div class="sl-kv"><span>' + esc(t("valuation")) + '</span><b class="num">' + (v ? "$" + nf(v, 0) : "—") + "</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("fractions")) + '</span><b class="num">' + (f ? nf(f, 0) : "—") + "</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("per_frac")) + '</span><b class="num">' + (p ? nf(p, 4) + " SECT" : "—") + "</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("a_docs")) + '</span><b class="num">' + adraft.docs.length + "</b></div>" +
      '<p class="sl-note">' + esc(t("rwa_fee")) + "</p>" +
      '<div style="margin-top:14px">' + (!a ? '<button class="sl-btn sl-btn-p sl-btn-w" data-a="newacct">' + esc(t("connect")) + "</button>"
        : '<button class="sl-btn sl-btn-gold sl-btn-w" data-a="tokenize"' + (ok ? "" : " disabled") + ">" + esc(t("a_submit")) + "</button>") +
      (a && !ok ? '<p class="sl-note">' + esc(errs[Object.keys(errs)[0]] || "") + "</p>" : "") + "</div></div>" +
      '<div class="sl-panel"><h3>' + ico("shield") + esc(t("tl3")) + '</h3><p class="sl-note" style="margin:0">' + esc(t("tl_note")) + "</p></div>";
  }
  function vTokenize() {
    var tt = adraft._t, errs = aErrors();
    function f(id, label, val, attrs, ek, unit) {
      var err = tt[ek] && errs[ek];
      var input = '<input class="sl-input' + (err ? " is-bad" : "") + (unit ? " num" : "") + '" id="' + id + '" value="' + esc(val) + '" ' + (attrs || "") + ">";
      return '<div class="sl-field"><label for="' + id + '">' + esc(label) + "</label>" + (unit ? '<div class="sl-input-wrap">' + input + '<span class="unit">' + unit + "</span></div>" : input) + (err ? '<small style="color:var(--red)">' + esc(err) + "</small>" : "") + "</div>";
    }
    return '<a class="sl-back" href="#/assets">' + ico("back") + esc(t("back")) + "</a>" +
      '<div class="sl-pagehead"><span class="sl-eyebrow"><i class="rule"></i>Sectora Launch</span><h1>' + esc(t("tok_t")) + "</h1><p>" + esc(t("tok_s")) + "</p></div>" +
      '<div class="sl-2col"><div><div class="sl-panel">' +
      '<span class="sl-label">' + esc(t("cls")) + '</span><div class="sl-classes" style="margin-top:8px">' +
      CLASSES.map(function (c) { return '<button type="button" class="sl-class' + (adraft.cls === c.id ? " on" : "") + '" data-a="acls" data-v="' + c.id + '">' + ico(c.i) + esc(t("cl_" + c.id)) + "</button>"; }).join("") + "</div>" +
      '<div class="sl-row2">' + f("aName", t("a_name"), adraft.name, 'maxlength="48" autocomplete="off"', "name") +
      f("aSym", t("a_sym") + " (x…)", adraft.sym.toUpperCase(), 'maxlength="8" autocomplete="off" autocapitalize="characters" style="text-transform:uppercase;font-family:var(--mono)"', "sym") + "</div>" +
      '<div class="sl-field"><label for="aDesc">' + esc(t("a_desc")) + '</label><textarea class="sl-textarea" id="aDesc" maxlength="500">' + esc(adraft.desc) + "</textarea></div>" +
      '<div class="sl-row2">' + f("aJur", t("a_jur"), adraft.jur, 'maxlength="60"') + f("aCust", t("a_cust"), adraft.cust, 'maxlength="80"') + "</div>" +
      '<div class="sl-row3">' + f("aVal", t("a_val"), adraft.val, 'inputmode="decimal"', "val", "USD") + f("aFrac", t("a_frac"), adraft.frac, 'inputmode="numeric"', "frac") +
      f("aPrice", t("a_price"), adraft.price, 'inputmode="decimal"', "price", "SECT") + "</div>" +
      (SECT_USD > 0 ? '<p class="sl-note" style="margin:-8px 0 14px">' + esc(t("a_auto")) + " · 1 SECT = $" + nf(SECT_USD, 4) + "</p>" : "") +
      '<div class="sl-field"><label for="aAtt">' + esc(t("a_att")) + '</label><select class="sl-select" id="aAtt"><option value="m"' + (adraft.att === "m" ? " selected" : "") + ">" + esc(t("att_m")) + '</option><option value="q"' + (adraft.att === "q" ? " selected" : "") + ">" + esc(t("att_q")) + "</option></select></div>" +
      '<div class="sl-field"><span class="sl-label">' + esc(t("a_docs")) + '</span><label class="sl-drop" for="aDocs">' + ico("file") + "<b>" + esc(t("a_docs_btn")) + "</b><span>" + esc(t("a_docs_hint")) + '</span></label><input type="file" id="aDocs" multiple hidden>' +
      '<div class="sl-docs" id="aDocList">' + adraft.docs.map(function (d) { return '<div class="sl-doc"><span>' + esc(d.n) + '</span><span title="' + esc(d.h) + '">' + esc(d.h.slice(0, 18)) + "…</span></div>"; }).join("") + "</div>" +
      (tt.docs && errs.docs ? '<small style="color:var(--red)">' + esc(errs.docs) + "</small>" : "") + "</div>" +
      '<label class="sl-check"><input type="checkbox" id="aDecl"' + (adraft.decl ? " checked" : "") + "><span>" + esc(t("a_decl")) + "</span></label>" +
      '</div></div><div class="sl-sticky" id="aSummary">' + aSummary() + "</div></div>";
  }
  function assetCard(x) {
    var pct = x.supply ? x.soldQ / x.supply : 0;
    return '<a class="sl-card" href="#/asset/' + x.addr + '"><div class="sl-card-h"><div class="sl-rwa-icon">' + ico(clsIcon(x.cls)) + "</div><div><b>" + esc(x.name) + '</b><span>' + esc(x.sym) + "</span></div>" +
      (x.status === "approved" ? '<span class="sl-tag is-good">' + ico("check") + esc(t("st_approved")) + "</span>" : '<span class="sl-tag is-mid">' + ico("clock") + esc(t("st_review")) + "</span>") + "</div>" +
      '<p class="sl-card-d">' + esc(x.desc || "") + "</p>" +
      '<div class="sl-card-m"><span class="dim">' + esc(t("valuation")) + "</span><b>$" + compact(x.val) + "</b></div>" +
      '<div class="sl-card-m"><span class="dim">' + esc(t("per_frac")) + "</span><b>" + nf(x.price, 4) + ' SECT</b></div>' +
      '<div class="sl-prog"><i style="width:' + (pct * 100).toFixed(1) + '%;background:var(--gold)"></i></div>' +
      '<div class="sl-card-f"><span>' + nf(pct * 100, 1) + " % " + esc(t("sold").toLowerCase()) + "</span><span>" + esc(t("cl_" + x.cls)) + "</span></div></a>";
  }
  function vAssets() {
    var xs = assetsList().slice().sort(function (a, b) { return b.created - a.created; });
    return '<div class="sl-sec-h"><div class="sl-pagehead" style="margin:0"><span class="sl-eyebrow"><i class="rule"></i>Sectora Launch · RWA</span><h1>' + esc(t("assets_t")) + "</h1><p>" + esc(t("assets_s")) + '</p></div><a class="sl-btn sl-btn-gold" href="#/tokenize">' + esc(t("cta_tokenize")) + "</a></div>" +
      '<div class="sl-grid" style="margin-top:8px">' + (xs.length ? xs.map(assetCard).join("") :
        '<div class="sl-empty">' + ico("building") + "<h3>" + esc(t("assets_empty")) + "</h3><p>" + esc(t("assets_empty_p")) + '</p><a class="sl-btn sl-btn-gold" href="#/tokenize">' + esc(t("cta_tokenize")) + "</a></div>") + "</div>";
  }
  function assetStep(x) {
    var el = Date.now() - x.created;
    return x.status === "approved" ? 4 : el > 2600 ? 3 : 2;
  }
  function vAsset(addr) {
    var x = S.assets[addr];
    if (!x) return '<a class="sl-back" href="#/assets">' + ico("back") + esc(t("back")) + '</a><div class="sl-empty"><p>' + esc(t("assets_empty")) + "</p></div>";
    var a = acct(), step = assetStep(x), left = x.supply - x.soldQ;
    var tl = [["tl1", x.created], ["tl2", x.created], ["tl3", x.created + 2600], ["tl4", x.approvedAt]].map(function (s, i) {
      var st = i + 1 < step ? "done" : i + 1 === step ? (x.status === "approved" ? "done" : "now") : "";
      return '<div class="sl-tl ' + st + '"><i>' + ico(st === "done" ? "check" : st === "now" ? "clock" : "dots") + "</i><div><b>" + esc(t(s[0])) + "</b><span>" + (st === "done" && s[1] ? esc(dateStr(s[1]) + " · " + timeStr(s[1])) : "") + "</span></div></div>";
    }).join("");
    var holders = Object.keys(x.holders || {}).map(function (h) { return [h, x.holders[h]]; }).sort(function (p, q) { return q[1] - p[1]; });
    var buy;
    if (x.status !== "approved") buy = '<p class="dim" style="margin:0">' + esc(t("not_ready")) + "</p>";
    else if (left <= 0) buy = '<p class="dim" style="margin:0">' + esc(t("sold_out")) + "</p>";
    else buy = '<div class="sl-field"><label for="rQty">' + esc(t("qty")) + '</label><div class="sl-input-wrap"><input class="sl-input num" id="rQty" inputmode="numeric" placeholder="0"><span class="unit">' + esc(x.sym) + "</span></div></div>" +
      '<div class="sl-bal"><span>' + esc(t("balance")) + '</span><span class="num">' + (a ? nf(a.bal, 2) + " SECT" : "—") + "</span></div>" +
      '<div class="sl-quote" id="rQuote">' + rQuote(x, 0) + "</div>" +
      (a ? '<button class="sl-btn sl-btn-gold sl-btn-w" data-a="rbuy" data-v="' + x.addr + '" id="rBtn" disabled>' + esc(t("buy_frac")) + "</button>" : '<button class="sl-btn sl-btn-p sl-btn-w" data-a="newacct">' + esc(t("connect")) + "</button>");
    var next = x.approvedAt ? x.approvedAt + (x.att === "m" ? 30 : 91) * 864e5 : 0;
    return '<a class="sl-back" href="#/assets">' + ico("back") + esc(t("back")) + "</a>" +
      '<div class="sl-2col"><div>' +
      '<div class="sl-coinhead"><div class="sl-rwa-icon lg">' + ico(clsIcon(x.cls)) + "</div><div><h1>" + esc(x.name) + " <span>" + esc(x.sym) + "</span></h1>" +
      '<div class="meta"><button class="sl-addr" data-a="copy" data-v="' + x.addr + '">' + esc(short(x.addr)) + ico("copy") + "</button>" +
      '<span class="sl-tag is-gold">' + esc(t("cl_" + x.cls)) + "</span>" +
      (x.status === "approved" ? '<span class="sl-tag is-good">' + ico("check") + esc(t("st_approved")) + "</span>" : '<span class="sl-tag is-mid">' + ico("clock") + esc(t("st_review")) + "</span>") + "</div></div></div>" +
      '<div class="sl-panel"><div class="sl-pricebar">' +
      "<div><span>" + esc(t("valuation")) + "</span><b>$" + nf(x.val, 0) + "</b></div>" +
      "<div><span>" + esc(t("per_frac")) + "</span><b>" + nf(x.price, 4) + ' <small>SECT</small></b><small style="margin:0">' + usd(x.price) + "</small></div>" +
      "<div><span>" + esc(t("fractions")) + "</span><b>" + nf(x.supply, 0) + "</b></div>" +
      "<div><span>" + esc(t("sold")) + "</span><b>" + nf(x.soldQ / x.supply * 100, 1) + " %</b></div></div>" +
      '<div class="sl-prog"><i style="width:' + (x.soldQ / x.supply * 100).toFixed(1) + '%;background:var(--gold)"></i></div>' +
      (x.desc ? '<p style="color:var(--dim);margin:16px 0 0">' + esc(x.desc) + "</p>" : "") + "</div>" +
      '<div class="sl-panel"><h3>' + ico("file") + esc(t("docs_t")) + '</h3><div class="sl-docs" style="margin:0">' +
      x.docs.map(function (d) { return '<div class="sl-doc"><span>' + esc(d.n) + '</span><span class="mono" title="' + esc(d.h) + '">' + esc(d.h) + "</span></div>"; }).join("") + "</div></div>" +
      '<div class="sl-panel"><h3>' + ico("info") + esc(t("tab_about")) + "</h3>" +
      '<div class="sl-kv"><span>' + esc(t("issuer")) + "</span><b>" + acctName(x.issuer) + "</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("custodian")) + "</span><b>" + esc(x.cust || "—") + "</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("jurisdiction")) + "</span><b>" + esc(x.jur || "—") + "</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("attestation")) + "</span><b>" + esc(x.att === "m" ? t("att_m") : t("att_q")) + "</b></div>" +
      (next ? '<div class="sl-kv"><span>' + esc(t("next_att")) + "</span><b>" + esc(dateStr(next)) + "</b></div>" : "") +
      '<div class="sl-kv"><span>' + esc(t("created")) + "</span><b>" + esc(dateStr(x.created)) + "</b></div>" +
      (holders.length ? '<h3 style="margin-top:18px">' + ico("users") + esc(t("holders")) + '</h3><div class="sl-table-wrap"><table class="sl-table"><tbody>' +
        holders.map(function (h) { return "<tr><td>" + acctName(h[0]) + '</td><td class="r num">' + nf(h[1], 0) + '</td><td class="r num">' + nf(h[1] / x.supply * 100, 2) + " %</td></tr>"; }).join("") + "</tbody></table></div>" : "") +
      '<div class="sl-alert" style="margin-top:14px">' + ico("info") + "<span>" + esc(t("rwa_risk")) + "</span></div></div>" +
      '</div><div class="sl-sticky"><div class="sl-panel"><h3>' + ico("clock") + esc(t("tl3")) + '</h3><div class="sl-timeline">' + tl + '</div><p class="sl-note">' + esc(t("tl_note")) + "</p></div>" +
      '<div class="sl-panel"><h3>' + ico("coins") + esc(t("buy_frac")) + "</h3>" + buy + '<p class="sl-note">' + esc(t("rwa_fee")) + "</p></div></div></div>";
  }
  function rQuote(x, q) {
    var cost = q * x.price, fee = cost * FEE;
    return '<div class="sl-kv"><span>' + esc(t("cost")) + '</span><b class="num">' + (q ? nf(cost, 4) + " SECT" : "—") + "</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("fee1")) + '</span><b class="num">' + (q ? nf(fee, 4) + " SECT" : "—") + "</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("total")) + '</span><b class="num">' + (q ? nf(cost + fee, 4) + " SECT" : "—") + "</b></div>";
  }

  /* ---------- Account ---------- */
  function vMe() {
    var a = acct();
    if (!a) {
      return '<div class="sl-pagehead"><span class="sl-eyebrow"><i class="rule"></i>Sectora Launch</span><h1>' + esc(t("me_t")) + "</h1><p>" + esc(t("me_s")) + '</p></div><div class="sl-empty">' + ico("user") + "<h3>" + esc(t("need_acct")) + '</h3><p></p><button class="sl-btn sl-btn-p" data-a="newacct">' + esc(t("connect")) + "</button></div>";
    }
    var wait = a.faucetAt ? a.faucetAt + FAUCET_EVERY - Date.now() : 0;
    var mine = coinsList().filter(function (c) { return c.creator === a.addr; });
    var holds = coinsList().filter(function (c) { return bal(c, a.addr) > 1e-6; });
    var rwa = assetsList().filter(function (x) { return x.holders && x.holders[a.addr] > 0; });
    return '<div class="sl-pagehead"><span class="sl-eyebrow"><i class="rule"></i>Sectora Launch</span><h1>' + esc(t("me_t")) + "</h1><p>" + esc(t("me_s")) + "</p></div>" +
      '<div class="sl-2col"><div>' +
      '<div class="sl-panel"><div class="sl-acctcard"><img class="sl-avatar" src="' + avatar(a.addr) + '" alt=""><div style="flex:1;min-width:0"><b style="font-size:17px">' + esc(a.name) + '</b><div><button class="sl-addr" data-a="copy" data-v="' + a.addr + '">' + esc(short(a.addr)) + ico("copy") + "</button></div></div>" +
      '<div style="text-align:right"><div class="dim" style="font-size:12.5px">' + esc(t("balance")) + '</div><b class="num" style="font-size:22px">' + nf(a.bal, 2) + ' <small class="dim">SECT</small></b></div></div>' +
      '<div style="margin-top:16px">' + (wait > 0 ? '<button class="sl-btn sl-btn-w" disabled>' + esc(t("faucet_wait", { m: dur(wait) })) + "</button>" : '<button class="sl-btn sl-btn-p sl-btn-w" data-a="faucet">' + ico("coins").replace("<svg", '<svg width="17" height="17"') + esc(t("faucet", { n: nf(FAUCET, 0) })) + "</button>") + "</div></div>" +
      '<div class="sl-panel"><h3>' + ico("rocket") + esc(t("my_coins")) + "</h3>" + (mine.length ? '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th></th><th class="r">' + esc(t("mc")) + '</th><th class="r">' + esc(t("earned")) + '</th><th class="r">' + esc(t("claimable")) + "</th><th></th></tr></thead><tbody>" +
        mine.map(function (c) {
          var un = (c.creatorFees || 0) - (c.creatorClaimed || 0);
          return '<tr><td><a href="#/coin/' + c.addr + '" style="display:flex;align-items:center;gap:8px"><img class="sl-logo" style="width:28px;height:28px;border-radius:8px" src="' + coinLogo(c) + '" alt=""><b>$' + esc(c.sym) + '</b></a></td><td class="r num">' + compact(mcap(c)) + '</td><td class="r num">' + nf(c.creatorFees || 0, 2) + '</td><td class="r num">' + nf(un, 2) + '</td><td class="r"><button class="sl-btn sl-btn-sm" data-a="claim" data-v="' + c.addr + '"' + (un > 1e-6 ? "" : " disabled") + ">" + esc(t("claim")) + "</button></td></tr>";
        }).join("") + "</tbody></table></div>" : '<p class="dim" style="margin:0">' + esc(t("none")) + "</p>") + "</div>" +
      '<div class="sl-panel"><h3>' + ico("coins") + esc(t("my_hold")) + "</h3>" + (holds.length ? '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th></th><th class="r">' + esc(t("th_tok")) + '</th><th class="r">' + esc(t("value")) + "</th></tr></thead><tbody>" +
        holds.map(function (c) {
          var b = bal(c, a.addr);
          return '<tr><td><a href="#/coin/' + c.addr + '" style="display:flex;align-items:center;gap:8px"><img class="sl-logo" style="width:28px;height:28px;border-radius:8px" src="' + coinLogo(c) + '" alt=""><b>$' + esc(c.sym) + '</b></a></td><td class="r num">' + compact(b) + '</td><td class="r num">' + nf(b * price(c), 2) + ' SECT <span class="faint">' + usd(b * price(c)) + "</span></td></tr>";
        }).join("") + "</tbody></table></div>" : '<p class="dim" style="margin:0">' + esc(t("none")) + "</p>") + "</div>" +
      '<div class="sl-panel"><h3>' + ico("building") + esc(t("my_rwa")) + "</h3>" + (rwa.length ? '<div class="sl-table-wrap"><table class="sl-table"><tbody>' +
        rwa.map(function (x) { return '<tr><td><a href="#/asset/' + x.addr + '"><b>' + esc(x.sym) + '</b> <span class="dim">' + esc(x.name) + '</span></a></td><td class="r num">' + nf(x.holders[a.addr], 0) + '</td><td class="r num">' + nf(x.holders[a.addr] * x.price, 2) + " SECT</td></tr>"; }).join("") + "</tbody></table></div>" : '<p class="dim" style="margin:0">' + esc(t("none")) + "</p>") + "</div>" +
      '</div><div class="sl-sticky"><div class="sl-panel"><h3>' + ico("users") + esc(t("switch")) + '</h3><div class="sl-acctlist">' +
      S.accounts.map(function (x, i) { return '<button class="sl-acctrow' + (i === S.active ? " on" : "") + '" data-a="switch" data-v="' + i + '"><img class="sl-avatar" src="' + avatar(x.addr) + '" alt=""><b>' + esc(x.name) + "</b><span>" + compact(x.bal) + " SECT</span></button>"; }).join("") +
      "</div>" + (S.accounts.length < MAX_ACCOUNTS ? '<button class="sl-btn sl-btn-w" style="margin-top:10px" data-a="newacct">' + esc(t("add_acct")) + "</button>" : "") + "</div>" +
      '<div class="sl-panel"><button class="sl-btn sl-btn-sm" data-a="reset" style="color:var(--red)">' + esc(t("reset")) + "</button></div></div></div>";
  }

  /* ---------- Transparency ---------- */
  function vStats() {
    var p = S.proto, raise = nf(GRAD_RAISE, 0);
    var params = [
      ["p_supply", nf(SUPPLY, 0)], ["p_curve", nf(CURVE_TOKENS, 0) + " (80 %)"], ["p_pool", nf(POOL_TOKENS, 0) + " (20 %)"], ["p_grad", t("v_grad", { raise: raise })],
      ["p_fee", "1 % · 0.5 / 0.3 / 0.2"], ["p_launch", t("v_launch")], ["p_dev", t("v_dev")], ["p_vest", t("v_vest")], ["p_fair", t("v_fair")], ["p_burn", t("v_burn")]
    ];
    return '<div class="sl-pagehead"><span class="sl-eyebrow"><i class="rule"></i>Sectora Launch</span><h1>' + esc(t("tr_t")) + "</h1><p>" + esc(t("tr_s")) + "</p></div>" + statTiles() +
      '<div class="sl-2col" style="margin-top:20px"><div>' +
      '<div class="sl-panel"><h3>' + ico("scale") + esc(t("tr_split")) + '</h3><div class="sl-fees"><i style="flex:5"></i><i style="flex:3"></i><i style="flex:2"></i></div>' +
      '<div class="sl-legend"><div style="--c:var(--blue)">' + esc(t("to_creator")) + "<b>" + nf(p.creator, 2) + ' SECT</b></div><div style="--c:var(--amber)">' + esc(t("to_burn")) + "<b>" + nf(p.burned + p.burnQueue, 2) + ' SECT</b></div><div style="--c:var(--violet)">' + esc(t("to_protocol")) + "<b>" + nf(p.protocol, 2) + " SECT</b></div></div>" +
      '<div class="sl-kv" style="margin-top:12px"><span>' + esc(t("st_burn")) + '</span><b class="num" id="slBurn2">' + nf(p.burned + p.launchBurned, 4) + " SECT</b></div>" +
      '<div class="sl-kv"><span>' + esc(t("st_queue")) + '</span><b class="num" id="slQueue2">' + nf(p.burnQueue, 4) + " SECT</b></div></div>" +
      '<div class="sl-panel"><h3>' + ico("fire") + esc(t("tr_burns")) + '</h3><div id="slBurns">' + burnsTable() + "</div></div>" +
      '</div><div class="sl-sticky"><div class="sl-panel"><h3>' + ico("file") + esc(t("tr_params")) + "</h3>" +
      params.map(function (r) { return '<div class="sl-kv"><span>' + esc(t(r[0])) + '</span><b class="num">' + esc(r[1]) + "</b></div>"; }).join("") +
      '<p class="sl-note">' + esc(t("tr_note")) + "</p></div></div></div>";
  }
  function burnsTable() {
    var b = S.proto.burns;
    if (!b.length) return '<p class="dim" style="margin:0">' + esc(t("tr_none")) + "</p>";
    return '<div class="sl-table-wrap"><table class="sl-table"><thead><tr><th>' + esc(t("th_time")) + '</th><th class="r">SECT</th><th class="sl-hide-sm">' + esc(t("th_tx")) + "</th></tr></thead><tbody>" +
      b.slice(0, 15).map(function (x) { return '<tr><td class="mono dim">' + esc(timeStr(x.t)) + '</td><td class="r num" style="color:var(--amber)">' + nf(x.x, 4) + '</td><td class="mono faint sl-hide-sm">' + esc(short(x.h)) + "</td></tr>"; }).join("") + "</tbody></table></div>";
  }
  function liveUpdate() {
    var el = document.getElementById("slBurn");
    if (el) {
      var nv = bigVal(S.proto.burned + S.proto.launchBurned, "c", "SECT");
      if (el.innerHTML !== nv) { el.innerHTML = nv; el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
      var u = document.getElementById("slBurnU"); if (u) u.textContent = compact(S.proto.burnQueue) + " " + t("st_queue");
    }
    var b2 = document.getElementById("slBurn2"); if (b2) b2.textContent = nf(S.proto.burned + S.proto.launchBurned, 4) + " SECT";
    var q2 = document.getElementById("slQueue2"); if (q2) q2.textContent = nf(S.proto.burnQueue, 4) + " SECT";
    var bt = document.getElementById("slBurns"); if (bt) bt.innerHTML = burnsTable();
    var blk = document.getElementById("slBlk"); if (blk) blk.textContent = nf(S.block, 0);
    if (view === "coin") {
      var c = S.coins[arg], fair = document.getElementById("slFair");
      if (c && fair) {
        if (inFair(c)) fair.querySelector("span").textContent = t("fair_on", { m: dur(c.created + FAIR_WINDOW - Date.now()) });
        else fair.remove();
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * Wiring                                                               *
   * ------------------------------------------------------------------ */
  function num(v) { v = String(v || "").replace(/\s/g, "").replace(",", "."); var n = parseFloat(v); return isFinite(n) ? n : 0; }
  function wire() {
    var q = document.getElementById("slQ");
    if (q) q.addEventListener("input", function () { ui.q = q.value; document.getElementById("slGrid").innerHTML = gridHtml(); });

    if (view === "create") wireCreate();
    if (view === "tokenize") wireTokenize();
    if (view === "coin") wireTrade();
    if (view === "asset") wireRwaBuy();
  }
  function simHtml(sim) { return sim ? '<div class="sl-alert">' + ico("alert") + "<span>" + esc(t("w_similar", { n: sim })) + "</span></div>" : ""; }
  function refreshSimilar() {
    var el = document.getElementById("slSim"); if (!el) return;
    el.innerHTML = simHtml((draft.name || draft.sym) ? similarTo(draft.name, draft.sym.toUpperCase(), null) : null);
  }
  function refreshCreateSummary() {
    var s = document.getElementById("slSummary"); if (s) s.innerHTML = createSummary();
  }
  function wireCreate() {
    draft._touched = draft._touched || {};
    function bind(id, key, upper) {
      var el = document.getElementById(id); if (!el) return;
      el.addEventListener("input", function () {
        draft[key] = upper ? el.value.toUpperCase().replace(/[^A-Z0-9]/g, "") : el.value;
        if (upper) el.value = draft[key];
        refreshCreateSummary();
      });
      if (key === "name" || key === "sym") el.addEventListener("input", refreshSimilar);
    }
    bind("slName", "name"); bind("slSym", "sym", true); bind("slDesc", "desc"); bind("slWeb", "web"); bind("slX", "x"); bind("slTg", "tg");
    var dev = document.getElementById("slDev");
    if (dev) dev.addEventListener("input", function () { draft.dev = dev.value.replace(/[^0-9.,]/g, ""); refreshCreateSummary(); dev.classList.toggle("is-bad", num(draft.dev) > DEV_MAX_SECT); });
    var ver = document.getElementById("slVerify");
    if (ver) ver.addEventListener("change", function () { draft.verify = ver.checked; });
    var logo = document.getElementById("slLogo");
    if (logo) logo.addEventListener("change", function () {
      var f = logo.files && logo.files[0]; if (!f) return;
      var img = new Image(), url = URL.createObjectURL(f);
      img.onload = function () {
        var cv = document.createElement("canvas"); cv.width = cv.height = 128;
        var cx = cv.getContext("2d"), s = Math.min(img.width, img.height);
        cx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 128, 128);
        draft.img = cv.toDataURL("image/jpeg", 0.85);
        URL.revokeObjectURL(url);
        var pv = document.getElementById("slLogoPv"); if (pv) pv.src = draft.img;
        refreshCreateSummary();
      };
      img.src = url;
    });
  }
  function wireTrade() {
    var c = S.coins[arg], inp = document.getElementById("slAmt");
    if (!c || !inp) return;
    function upd() {
      var a = acct(), v = num(inp.value), qb = document.getElementById("slQuote"), btn = document.getElementById("slTradeBtn"), er = document.getElementById("slTradeErr");
      qb.innerHTML = quoteHtml(c, v);
      var msg = "";
      if (a && v > 0) {
        if (ui.side === "buy") {
          if (v > a.bal + 1e-9) msg = t("need_funds");
          else if (!c.grad && inFair(c)) {
            var qq = quoteBuy(c, v);
            if (bal(c, a.addr) - lockedOf(c, a.addr) + qq.tokens > FAIR_MAX + 1e-6) msg = t("fair_cap");
          }
        } else {
          if (sellable(c, a.addr) <= 0) msg = t("no_tokens");
          else if (v > sellable(c, a.addr) + 1e-6) msg = t("locked_note", { a: compact(lockedOf(c, a.addr)) });
        }
      }
      er.innerHTML = msg ? '<div class="sl-alert is-bad" style="margin-bottom:12px">' + ico("alert") + "<span>" + esc(msg) + "</span></div>" : "";
      if (btn) btn.disabled = !(a && v > 0 && !msg);
    }
    inp.addEventListener("input", upd);
    inp._upd = upd;
  }
  function wireRwaBuy() {
    var x = S.assets[arg], inp = document.getElementById("rQty");
    if (!x || !inp) return;
    inp.addEventListener("input", function () {
      var qn = Math.floor(num(inp.value)), a = acct(), left = x.supply - x.soldQ;
      document.getElementById("rQuote").innerHTML = rQuote(x, qn);
      var btn = document.getElementById("rBtn");
      if (btn) btn.disabled = !(a && qn > 0 && qn <= left && qn * x.price * (1 + FEE) <= a.bal + 1e-9);
    });
  }
  function refreshASummary() { var s = document.getElementById("aSummary"); if (s) s.innerHTML = aSummary(); }
  function sha256(buf) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve("unavailable");
    return crypto.subtle.digest("SHA-256", buf).then(function (h) { return Array.prototype.map.call(new Uint8Array(h), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); });
  }
  function wireTokenize() {
    function bind(id, key, opts) {
      var el = document.getElementById(id); if (!el) return;
      el.addEventListener("input", function () {
        var v = el.value;
        if (opts === "sym") { v = v.toUpperCase().replace(/[^A-Z0-9]/g, ""); el.value = v; }
        if (opts === "num") { v = v.replace(/[^0-9.,]/g, ""); }
        adraft[key] = v;
        if (key === "price") adraft.priceAuto = false;
        if (key === "val" || key === "frac") { autoPrice(); var pe = document.getElementById("aPrice"); if (pe && adraft.priceAuto) pe.value = adraft.price; }
        refreshASummary();
      });
      el.addEventListener("blur", function () { if (!adraft._t[key]) { adraft._t[key] = true; } });
    }
    bind("aName", "name"); bind("aSym", "sym", "sym"); bind("aDesc", "desc"); bind("aJur", "jur"); bind("aCust", "cust");
    bind("aVal", "val", "num"); bind("aFrac", "frac", "num"); bind("aPrice", "price", "num");
    var att = document.getElementById("aAtt"); if (att) att.addEventListener("change", function () { adraft.att = att.value; });
    var decl = document.getElementById("aDecl"); if (decl) decl.addEventListener("change", function () { adraft.decl = decl.checked; refreshASummary(); });
    var docs = document.getElementById("aDocs");
    if (docs) docs.addEventListener("change", function () {
      var files = Array.prototype.slice.call(docs.files || []).slice(0, 12);
      Promise.all(files.map(function (f) {
        return (f.arrayBuffer ? f.arrayBuffer() : new Response(f).arrayBuffer()).then(sha256).then(function (h) { return { n: f.name, s: f.size, h: h }; });
      })).then(function (list) {
        list.forEach(function (d) { if (!adraft.docs.some(function (x) { return x.h === d.h; })) adraft.docs.push(d); });
        adraft._t.docs = true;
        document.getElementById("aDocList").innerHTML = adraft.docs.map(function (d) { return '<div class="sl-doc"><span>' + esc(d.n) + '</span><span title="' + esc(d.h) + '">' + esc(d.h.slice(0, 18)) + "…</span></div>"; }).join("");
        refreshASummary();
      });
      docs.value = "";
    });
  }

  function newAccount() {
    if (S.accounts.length >= MAX_ACCOUNTS) return;
    var a = { addr: newAddr(), name: t("acct_n", { n: S.accounts.length + 1 }), bal: 0, faucetAt: 0 };
    S.accounts.push(a); S.active = S.accounts.length - 1; save();
    toast(esc(a.name) + " · " + esc(short(a.addr)), "ok");
    render();
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-a]"); if (!el) return;
    var act = el.getAttribute("data-a"), v = el.getAttribute("data-v");
    if (el.tagName === "SELECT") return;
    if (act === "newacct") { e.preventDefault(); newAccount(); }
    else if (act === "tab") { ui.tab = v; render(); }
    else if (act === "ctab") { ui.ctab = v; render(); }
    else if (act === "side") { ui.side = v; render(); }
    else if (act === "copy") {
      e.preventDefault();
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () { toast(esc(t("t_copied"))); }, function () {});
    }
    else if (act === "dev") { draft.dev = String(v); render(); }
    else if (act === "amt") { var i1 = document.getElementById("slAmt"); if (i1) { i1.value = v; i1._upd && i1._upd(); } }
    else if (act === "pct") {
      var c0 = S.coins[arg], a0 = acct(), i2 = document.getElementById("slAmt");
      if (c0 && a0 && i2) { var amt = sellable(c0, a0.addr) * parseFloat(v); i2.value = amt > 0 ? String(+(amt.toFixed(2))) : ""; i2._upd && i2._upd(); }
    }
    else if (act === "acls") { adraft.cls = v; render(); }
    else if (act === "switch") { S.active = +v; save(); render(); }
    else if (act === "faucet") {
      var a = acct(); if (!a) return;
      if (a.faucetAt && Date.now() - a.faucetAt < FAUCET_EVERY) return;
      txModal(function () {
        a.bal += FAUCET; a.faucetAt = Date.now(); var b = nextBlock(), h = newTx(); save();
        return { msg: esc(t("t_faucet", { n: nf(FAUCET, 0) })), block: b, hash: h };
      });
    }
    else if (act === "reset") {
      if (confirm(t("reset_q"))) { S = fresh(); MEM = null; save(); location.hash = "#/"; render(); }
    }
    else if (act === "launch") doLaunch();
    else if (act === "trade") doTrade();
    else if (act === "claim") {
      var c1 = S.coins[v], a1 = acct(); if (!c1 || !a1 || c1.creator !== a1.addr) return;
      var un = (c1.creatorFees || 0) - (c1.creatorClaimed || 0); if (!(un > 1e-6)) return;
      txModal(function () {
        a1.bal += un; c1.creatorClaimed = (c1.creatorClaimed || 0) + un; var b = nextBlock(), h = newTx(); save();
        return { msg: esc(t("t_claimed", { n: nf(un, 4) })), block: b, hash: h };
      });
    }
    else if (act === "tokenize") doTokenize();
    else if (act === "rbuy") doRwaBuy(v);
  });
  document.addEventListener("change", function (e) {
    var el = e.target;
    if (el && el.getAttribute && el.getAttribute("data-a") === "lang") {
      L = el.value; try { localStorage.setItem(LKEY, L); } catch (x) {}
      render();
    }
  });

  function doLaunch() {
    var a = acct(); if (!a) return;
    var errs = createErrors(); if (Object.keys(errs).length) { draft._touched = { name: 1, sym: 1 }; render(); return; }
    var d = num(draft.dev), total = LAUNCH_FEE + d;
    if (a.bal < total) return;
    txModal(function () {
      var c = {
        addr: newAddr(), name: draft.name.trim(), sym: draft.sym.toUpperCase(), desc: draft.desc.trim(), img: draft.img,
        links: { web: safeUrl(draft.web), x: safeUrl(draft.x), tg: safeUrl(draft.tg) },
        creator: a.addr, created: Date.now(), vs: V_SECT0, vt: V_TOK0, grad: false, holders: {}, dev: null,
        verify: !!draft.verify, verified: false, creatorFees: 0, creatorClaimed: 0, volume: 0, burnVia: 0
      };
      a.bal -= LAUNCH_FEE;
      S.proto.launchBurned += LAUNCH_FEE;
      S.coins[c.addr] = c; S.order.unshift(c.addr);
      var ev = record(c, "launch", a.addr, LAUNCH_FEE, 0, c.vs / c.vt);
      if (d > 0) {
        a.bal -= d;
        var r = doBuy(c, a.addr, d, { dev: true });
        if (r) c.dev = { amt: r.q.tokens, start: c.created };
      }
      save();
      draft = { img: "", name: "", sym: "", desc: "", web: "", x: "", tg: "", dev: "", verify: false };
      return { msg: esc(t("t_launched")) + " · <b>$" + esc(c.sym) + "</b>", block: ev.b, hash: ev.h, go: "#/coin/" + c.addr };
    });
  }
  function doTrade() {
    var c = S.coins[arg], a = acct(), inp = document.getElementById("slAmt");
    if (!c || !a || !inp) return;
    var v = num(inp.value); if (!(v > 0)) return;
    if (ui.side === "buy") {
      if (v > a.bal + 1e-9) return;
      if (!c.grad && inFair(c)) { var qq = quoteBuy(c, v); if (bal(c, a.addr) - lockedOf(c, a.addr) + qq.tokens > FAIR_MAX + 1e-6) return; }
      txModal(function () {
        var r = doBuy(c, a.addr, v); if (!r) return null;
        a.bal -= r.q.used; save();
        ui.fresh = r.tr.h;
        return { msg: esc(t("t_bought", { t: compact(r.q.tokens), s: "$" + c.sym })), block: r.tr.b, hash: r.tr.h };
      });
    } else {
      if (v > sellable(c, a.addr) + 1e-6) return;
      v = Math.min(v, sellable(c, a.addr));
      txModal(function () {
        var r = doSell(c, a.addr, v); if (!r) return null;
        a.bal += r.q.out; save();
        ui.fresh = r.tr.h;
        return { msg: esc(t("t_sold", { t: compact(v), s: "$" + c.sym })), block: r.tr.b, hash: r.tr.h };
      });
    }
  }
  function doTokenize() {
    var a = acct(); if (!a) return;
    var errs = aErrors();
    if (Object.keys(errs).length) { adraft._t = { name: 1, sym: 1, val: 1, frac: 1, price: 1, docs: 1 }; render(); return; }
    txModal(function () {
      var x = {
        addr: newAddr(), cls: adraft.cls, name: adraft.name.trim(), sym: "x" + adraft.sym.toUpperCase(), desc: adraft.desc.trim(),
        jur: adraft.jur.trim(), cust: adraft.cust.trim(), val: num(adraft.val), supply: Math.floor(num(adraft.frac)), price: num(adraft.price),
        att: adraft.att, docs: adraft.docs.slice(), issuer: a.addr, created: Date.now(), approvedAt: 0, status: "review", soldQ: 0, holders: {}
      };
      S.assets[x.addr] = x; S.aorder.unshift(x.addr);
      var b = nextBlock(), h = newTx(); save();
      adraft = { cls: "re", name: "", sym: "", desc: "", jur: "", cust: "", val: "", frac: "", price: "", priceAuto: true, att: "q", docs: [], decl: false, _t: {} };
      setTimeout(function () { approve(x.addr); }, 5200);
      return { msg: esc(t("t_rwa")) + " · <b>" + esc(x.sym) + "</b>", block: b, hash: h, go: "#/asset/" + x.addr };
    });
  }
  function approve(addr) {
    var x = S.assets[addr]; if (!x || x.status === "approved") return;
    x.status = "approved"; x.approvedAt = Date.now(); save();
    if (view === "asset" && arg === addr) render();
    if (view === "assets" || view === "home") render();
  }
  function doRwaBuy(addr) {
    var x = S.assets[addr], a = acct(), inp = document.getElementById("rQty");
    if (!x || !a || !inp || x.status !== "approved") return;
    var qn = Math.floor(num(inp.value)), left = x.supply - x.soldQ;
    if (!(qn > 0) || qn > left) return;
    var cost = qn * x.price, fee = cost * FEE;
    if (cost + fee > a.bal + 1e-9) return;
    txModal(function () {
      a.bal -= cost + fee;
      var iss = acctBy(x.issuer); if (iss) iss.bal += cost;
      x.soldQ += qn; x.holders[a.addr] = (x.holders[a.addr] || 0) + qn;
      S.proto.burnQueue += fee * RWA_SPLIT.burn; S.proto.protocol += fee * RWA_SPLIT.protocol; S.proto.volume += cost;
      var b = nextBlock(), h = newTx(); save();
      return { msg: esc(t("t_rwa_buy", { q: nf(qn, 0), s: x.sym })), block: b, hash: h };
    });
  }

  document.addEventListener("pointermove", function (e) {
    var el = e.target.closest && e.target.closest(".sl-panel, .sl-card, .sl-why-i, .sl-step, .sl-stat");
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty("--gx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
    el.style.setProperty("--gy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
  }, { passive: true });
  var sprog = null;
  window.addEventListener("scroll", function () {
    if (!sprog) sprog = document.querySelector(".sl-sprog i");
    if (!sprog) return;
    var h = document.documentElement.scrollHeight - innerHeight;
    sprog.style.transform = "scaleX(" + (h > 0 ? Math.min(1, scrollY / h) : 0) + ")";
  }, { passive: true });

  /* ------------------------------------------------------------------ *
   * Boot                                                                 *
   * ------------------------------------------------------------------ */
  // assets submitted in an earlier visit finish their (testnet) review on load
  assetsList().forEach(function (x) { if (x.status !== "approved") setTimeout(function () { approve(x.addr); }, Math.max(0, x.created + 5200 - Date.now())); });
  burnTick(true);
  window.addEventListener("hashchange", route);
  window.addEventListener("storage", function (e) { if (e.key === KEY) { S = load(); render(); } });
  setInterval(function () { burnTick(false); }, BURN_TICK);
  var blkTick = 0;
  setInterval(function () {
    if (++blkTick % 2 === 0) {
      S.block += 1;
      var bk = document.getElementById("slBlk");
      if (bk) { bk.textContent = nf(S.block, 0); bk.classList.remove("flash"); void bk.offsetWidth; bk.classList.add("flash"); }
    }
    if (view === "coin") liveUpdate();
    if (view === "asset") { var x = S.assets[arg]; if (x && x.status !== "approved") render(); }
  }, 1000);
  route();
  fetchSectPrice();
})();
