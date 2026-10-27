/* Guia del Airdrop Genesis · Português (misma estructura que en.js) */
module.exports = {
  name: "Português", locale: "pt-BR", dir: "ltr",
  meta: {
    title: "Guia do Airdrop Genesis — Sectora Foundation",
    desc: "Guia passo a passo para participar do Airdrop Genesis da Sectora: coloque seus #SECT em staking, ligue seu Hash Node com a mesma carteira e confira seu airdrop. Com capturas de tela e PDF para baixar."
  },
  nav: { sub: "Guia do airdrop", back: "Página do airdrop", pdf: "PDF", lang: "Idioma" },
  common: {
    part: "Parte", step: "Passo", stepOf: "Passo {n} de 16", illus: "Ilustração · sua carteira pode parecer um pouco diferente",
    example: "As capturas mostram uma carteira de exemplo (0x4b2f…4b3c) e valores de exemplo. Na sua tela você verá os seus.",
    phone: "No celular", computer: "No computador", yes: "SIM", no: "NÃO", minutes: "minutos", page: "página",
    stakingEnglish: "A página de staking está em inglês. Aqui você vê cada botão como ele aparece, com a tradução entre parênteses."
  },
  cover: {
    tag: "Guia oficial · Edição 1.1", kicker: "Airdrop Genesis · Guia para participar",
    h1: "Como participar<br>do <b>airdrop</b> da Sectora.",
    p: "Passo a passo e com capturas: do seu primeiro clique até um Hash Node ligado e somando. Leia um passo, faça e vá para o próximo.",
    parts: [["Parte A", "Coloque seus #SECT em staking", "Ethereum · passos 1–7"], ["Parte B", "Ligue seu nó", "Testnet grátis · passos 8–14"], ["Parte C", "Confira seu airdrop", "Um minuto · passos 15–16"]],
    issued: "Emitido por", entity: "Entidade", activity: "Atividade", activityV: "Empresa de cibersegurança", location: "Local", locationV: "Chicago, Illinois, Estados Unidos",
    file: "Registro em Illinois", ein: "EIN", contracts: "Contratos oficiais · Ethereum mainnet", token: "Token #SECT", staking: "Staking", web: "Site", support: "Suporte",
    date: "Outubro 2026 · Português"
  },
  toc: { k: "Conteúdo", h: "Tudo o que há neste guia", start: "Comece aqui", before: "Antes de começar", problems: "Problemas e suporte" },
  hero: {
    k: "Airdrop Genesis · Guia passo a passo",
    h1: "Como participar do airdrop da Sectora, <b>passo a passo.</b>",
    lede: "Este guia leva você do seu <strong>primeiro clique</strong> até um <strong>Hash Node ligado e somando</strong>. Cada passo diz exatamente o que tocar, o que você deve ver e o que não fazer, com uma captura. Leia um passo, faça e vá para o próximo. <strong>Cerca de 20 minutos.</strong>",
    pdf: "Baixar o guia em PDF", start: "Começar o guia"
  },
  need: {
    k: "Todo o airdrop em uma frase", h: "Você só precisa de duas coisas, <b>com a mesma carteira:</b>",
    r1: ["#SECT em staking", "Pelo menos 100 #SECT no staking oficial, na Ethereum. Parte A."],
    r2: ["Seu Hash Node ligado", "Na rede de testes da Sectora. 100% grátis. Parte B."],
    foot: "Quando as duas coisas são verdade, sua contagem do airdrop começa sozinha. <b>Sem cadastro, sem formulários.</b>"
  },
  already: {
    h: "Já faz staking de #SECT? Você já está dentro.",
    p: "Você não precisa fazer mais nada com seu staking. <b>Não retire nada.</b> Pule a Parte A e vá direto para a Parte B: só ligue seu Hash Node <b>com a mesma carteira do seu staking</b> e você começa a participar.",
    btn: "Ir para a Parte B"
  },
  map: [
    ["Parte A · passos 1–7", "Coloque seus #SECT em staking", "Ethereum mainnet. Usa seus #SECT reais e um pouco de ETH para a taxa.", "≈ 5 minutos"],
    ["Parte B · passos 8–14", "Ligue seu Hash Node", "Rede de testes da Sectora. Moedas de teste grátis: você não gasta dinheiro real.", "≈ 10 minutos"],
    ["Parte C · passos 15–16", "Confira seu airdrop", "Veja seu nível, seu prêmio e sua contagem subindo.", "≈ 1 minuto"]
  ],
  before: {
    k: "00 · Antes de começar", h: "Tenha prontas estas <b>quatro coisas.</b>",
    items: [
      ["01", "Uma carteira cripto", "MetaMask, Trust Wallet, Coinbase Wallet, OKX, Binance Wallet ou qualquer carteira Ethereum. No celular ou no computador."],
      ["02", "Pelo menos 100 #SECT", "Nessa carteira. Ainda não tem? Compre na Uniswap com o nosso <a href=\"/guide/pt/\">guia de compra passo a passo</a>."],
      ["03", "Um pouco de ETH", "Na Ethereum, na mesma carteira. Paga as taxas da rede (alguns dólares)."],
      ["04 · O mais importante", "UMA carteira para tudo", "Seu staking e seu nó devem usar o <b>mesmo endereço de carteira</b>. Usar duas carteiras diferentes é o erro mais comum."]
    ],
    rulesH: "Três regras de segurança. Nunca quebre nenhuma.",
    rules: "<b>1.</b> Nunca dê a ninguém sua frase secreta de recuperação (as 12 ou 24 palavras) nem sua chave privada. A Sectora nunca vai pedir. <b>2.</b> Use só <b>sectoraorg.com</b>: confira a barra de endereços sempre. <b>3.</b> Ninguém da Sectora vai escrever para você primeiro para “ajudar”. Se alguém fizer isso, é golpe."
  },
  phone: {
    k: "No celular", h: "Vai usar o celular? <b>Leia isto primeiro.</b>",
    p: "Tudo neste guia funciona no celular. Você só precisa ter instalado o app da sua carteira (MetaMask, Trust Wallet, Coinbase Wallet…).",
    steps: [
      "<b>Staking (Parte A):</b> abra <b>sectoraorg.com/staking</b> no Chrome ou Safari e toque em {en:Connect wallet} (Conectar carteira). Toque no app da sua carteira na lista, aprove lá e volte ao navegador.",
      "<b>Nó (Parte B):</b> abra <b>sectoraorg.com/dashboard</b> e toque em {ui:connect}. No celular aparece {ui:openMM} (ou sua carteira): toque e o dashboard abre <b>dentro do app da sua carteira</b>. Continue lá.",
      "<b>Dentro do app da carteira</b> tudo se conecta direto. Use o mesmo app de carteira para tudo."
    ],
    note: "Se o app da carteira não abrir, abra você mesmo, procure o navegador interno (costuma se chamar <b>Navegador</b>, <b>Explorar</b> ou <b>Descobrir</b>) e digite o endereço lá."
  },
  parts: {
    A: { k: "Parte A · Passos 1–7 · ≈ 5 minutos", h: "Coloque seus #SECT em staking", sub: "Você coloca seus #SECT no staking oficial. Eles continuam seus, ganham recompensas a cada segundo e contam para o airdrop. Já faz staking? <a href=\"#part-b\">Pule para a Parte B</a>.", tags: ["Ethereum mainnet · #SECT reais", "Precisa de um pouco de ETH para taxas", "Sem bloqueio"] },
    B: { k: "Parte B · Passos 8–14 · ≈ 10 minutos", h: "Ligue seu Hash Node", sub: "O Hash Node funciona na rede de testes da Sectora (Sepolia). <b>Tudo na Parte B é grátis:</b> você usa moedas de teste gratuitas sem valor. Aqui você nunca gasta dinheiro real.", tags: ["Grátis · rede de testes", "A mesma carteira do staking", "Fica ligado sozinho"] },
    C: { k: "Parte C · Passos 15–16 · ≈ 1 minuto", h: "Confira seu airdrop", sub: "Veja seu nível, seu prêmio e os três requisitos, lidos ao vivo da blockchain. Olhar é grátis: sem assinatura, sem transação.", tags: ["Só leitura · grátis", "Quando quiser"] }
  },
  s: {
    1: { k: "Navegador", h: "Abra a página de staking",
      do: ["Abra seu navegador: Chrome, Safari ou o navegador dentro do app da sua carteira.", "Digite exatamente <b>sectoraorg.com/staking</b> e abra.", "Desça até ver o quadro branco chamado <b>“Staking console”</b>."],
      warn: "<b>Confira a barra de endereços.</b> A única página real é <b>sectoraorg.com/staking</b>. Se aparecer outra coisa, feche." },
    2: { k: "Console de staking", h: "Toque em “Connect wallet”",
      do: ["Embaixo do Staking console há um botão azul grande.", "Toque em {en:Connect wallet} (Conectar carteira)."],
      cap: "O Staking console. O botão que você toca está marcado em azul." },
    3: { k: "Sua carteira", h: "Escolha sua carteira",
      do: ["Abre uma lista embaixo do botão.", "<b>No computador:</b> clique na sua carteira (por exemplo <b>MetaMask</b>). Sua carteira abre: clique em <b>Conectar</b>.", "<b>No celular (Chrome ou Safari):</b> toque no app da sua carteira. O app abre: toque em <b>Conectar</b> lá e depois <b>volte para a aba do navegador</b>."],
      capPc: "No computador: a carteira do navegador aparece primeiro.", capPhone: "No celular: a lista de apps de carteira." },
    4: { k: "Conferir", h: "Confira se você está conectado",
      do: ["Olhe o botão azul grande: agora mostra <b>o endereço da sua carteira</b>, abreviado, como <code>0x4b2f…4b3c</code>.", "Embaixo aparecem três botões: {en:Deposit #SECT} (Depositar) {en:Withdraw} (Retirar) {en:Withdraw all} (Retirar tudo)."],
      see: "<b>Deu certo</b> se você vê seu endereço no botão.",
      warn: "<b>Mensagem vermelha “Switch your wallet to the Ethereum network”?</b> Quer dizer “mude sua carteira para a rede Ethereum”. Abra a carteira, mude a rede para <b>Ethereum</b> (Ethereum Mainnet) e recarregue a página." },
    5: { k: "Quantidade", h: "Digite quantos #SECT vai colocar em staking",
      do: ["Toque no quadro <b>“You deposit”</b> (Você deposita).", "Digite o número de #SECT. Só o número, por exemplo <b>1000</b>. Sem pontos nem vírgulas."],
      how: "<b>Quanto?</b> Pelo menos <b>100 #SECT</b> para participar do airdrop. Quanto mais você coloca, maior seu nível:",
      prize: "prêmio {n} SECT", nomax: "sem máximo" },
    6: { k: "Carteira · confirmação 1 de 2", h: "Toque em “Deposit #SECT” e aprove",
      do: ["Toque em {en:Deposit #SECT} (Depositar #SECT).", "Sua carteira abre e pede para você <b>aprovar</b> um “limite de gasto”. Isso só permite que o contrato de staking pegue <b>exatamente</b> a quantidade que você digitou, nunca mais. Ainda não sai nada.", "Confira os dados abaixo e toque em <b>Confirmar</b> na carteira.", "<b>Espere.</b> Não feche a página. Leva de alguns segundos a um minuto."],
      checkH: "Confira isto na carteira antes de tocar em Confirmar",
      check: [["Pedido", "Aprovar · limite de gasto"], ["Quantidade", "Exatamente os #SECT que você digitou"], ["Contrato", "<code>0x79Cb8B3B3e81a2B25C6d7250c3C5a742aa8320E0</code>"], ["Taxa", "Um pouco de ETH (a carteira mostra)"]] },
    7: { k: "Carteira · confirmação 2 de 2", h: "Confirme o depósito",
      do: ["Quando a aprovação termina, a carteira abre <b>uma segunda vez</b> sozinha, agora para o <b>depósito</b>.", "Toque em <b>Confirmar</b> de novo. Espere alguns segundos.", "Aparece um quadro verde: <b>“Your rewards · accruing every second”</b> (suas recompensas, somando a cada segundo), com <b>“Deposited”</b> (depositado) e sua quantidade."],
      cap: "Seu staking está feito: o depósito aparece e suas recompensas sobem a cada segundo.",
      warn: "<b>Deixe seus #SECT no staking.</b> Só os #SECT em staking contam para o airdrop. Deixe-os lá até completar seu tempo. Você continua ganhando suas recompensas normais de staking.",
      done: ["Parte A concluída.", "Seus #SECT estão em staking. Agora ligue seu nó com esta mesma carteira."] },
    8: { k: "Dashboard", h: "Abra o dashboard e toque em “{ui:connect}”",
      do: ["Abra <b>sectoraorg.com/dashboard</b>.", "No canto superior direito, toque em {ui:connect}.", "<b>No celular (Chrome ou Safari):</b> aparece uma lista. Toque em {ui:openMM} (ou na sua carteira) e o dashboard abre dentro do app da carteira. Lá, toque em {ui:connect} de novo."],
      warn: "<b>Use a MESMA carteira do seu staking.</b> Se o seu nó estiver em outra carteira, ele não conta para o seu airdrop.",
      lang: "O dashboard abre em inglês. Mude para português no menu de bandeiras lá em cima: assim você verá igual a estas capturas.",
      capPhone: "No celular: {ui:connect} no topo.", capPhone2: "No celular sem carteira: {ui:openMM}." },
    9: { k: "Sua carteira", h: "Escolha sua carteira e aceite a rede de testes",
      do: ["Na lista <b>“{ui:wselTitle}”</b>, toque na sua carteira (aparece <b>{ui:detected}</b>).", "Na carteira, toque em <b>Conectar</b>.", "O dashboard muda sua carteira para a rede de testes <b>Sepolia</b> sozinho. Se a carteira pedir para trocar ou adicionar a rede, toque em <b>Aprovar</b> ou <b>Trocar rede</b>."],
      tip: "<b>Sua carteira não mostra a Sepolia?</b> Abra as configurações da carteira e ative <b>“Mostrar redes de teste”</b>. Depois tente de novo." },
    10: { k: "Gas grátis", h: "Pegue ETH da Sepolia grátis para o gas",
      do: ["Cada ação na rede de testes precisa de um pouco de <b>ETH da Sepolia</b>. É uma moeda de teste grátis e sem valor.", "Desça até <b>“{ui:tnTitle}”</b>. No quadro <b>“{ui:faucetCard}”</b>, toque em {ui:gasLink}.", "Abre uma página do Google Cloud (em inglês). Confira que a rede é <b>Ethereum Sepolia</b>, cole o endereço da sua carteira em <b>“Wallet address or ENS name”</b> e toque em <b>Get 0.05 Sepolia ETH</b>. Se pedir, entre com uma conta Google.", "Volte para a aba do dashboard."],
      copy: "<b>Como copio meu endereço?</b> Abra a carteira e toque no nome da conta ou no endereço lá em cima: ele é copiado sozinho.",
      warn: "<b>O Google diz que você precisa de 0.001 ETH na Ethereum Mainnet?</b> A torneira do Google só dá ETH da Sepolia para carteiras com pelo menos 0,001 ETH real na Ethereum. Deixe um pouco de ETH na carteira (você precisa dele na Parte A de qualquer jeito) e tente de novo.",
      capDash: "No dashboard: o link para a torneira.", capGoogle: "A torneira do Google Cloud: (1) seu endereço · (2) Get 0.05 Sepolia ETH." },
    11: { k: "Tokens de teste grátis", h: "Resgate 5.000 tSECT grátis",
      do: ["No mesmo quadro, toque em {ui:faucetBtn}.", "A carteira abre: toque em <b>Confirmar</b>.", "Espere alguns segundos. <b>“{ui:balance}”</b> agora mostra <b>5.000 tSECT</b>."],
      tip: "tSECT são <b>tokens de teste sem valor em dinheiro</b>. Você pode resgatar de novo a cada 24 horas." },
    12: { k: "Mercado de hash", h: "Compre o Node Kit · 50 TH/s",
      do: ["Desça até <b>“{ui:market}”</b>.", "Abra a aba {ui:physical} <b>(1)</b>.", "Toque no cartão <b>50 TH/s · 4.300 tSECT</b>, marcado <b>{ui:airdropPlan}</b> <b>(2)</b>. É o nó que vale para o airdrop.", "Toque em {ui:buy50} <b>(3)</b>.", "A carteira abre <b>duas vezes</b>: primeiro para permitir o pagamento, depois para confirmar a compra. Toque em <b>Confirmar</b> nas duas."],
      cap1: "(1) {ui:physical} · (2) 50 TH/s · {ui:airdropPlan}", cap2: "(3) {ui:buy50}",
      see: "Os 4.300 tSECT saem dos 5.000 tSECT grátis do passo 11. <b>Sem dinheiro real.</b>" },
    13: { k: "Seu nó", h: "Registre seu nó. A localização é automática.",
      do: ["Desça até <b>“{ui:node}”</b>.", "A localização do seu nó já está <b>detectada (1)</b> e o nome já está <b>preenchido</b>. Você não digita nada.", "Toque em {ui:register} <b>(2)</b>.", "A carteira abre: toque em <b>Confirmar</b>."],
      cap: "(1) Localização detectada automaticamente · (2) {ui:register}",
      tip: "<b>Sobre a localização.</b> Nossos sistemas detectam a localização aproximada do seu nó pela sua conexão e preenchem para você. Na rede só fica salva a <b>cidade</b>, <b>nunca seu endereço</b>. A localização está errada (por exemplo por causa de uma VPN)? Toque em <b>“{ui:change}”</b> e corrija.",
      planH: "Passo 13 · Plano B · só se aparecer “{ui:geoFail}”",
      plan: [["Por quê", "Às vezes uma VPN, um bloqueador de anúncios ou um navegador muito rígido impede a detecção. Aí aparecem dois campos: <b>{ui:lat}</b> e <b>{ui:lon}</b>."],
        ["Ache os números", "Abra o Google Maps e procure <b>sua cidade</b>. No computador, clique com o botão direito no centro da cidade; no celular, toque e segure. Você vê dois números, como <code>40.4168, -3.7038</code>."],
        ["Preencha", "O <b>primeiro</b> número vai em <b>{ui:lat} (1)</b>. O <b>segundo</b> número vai em <b>{ui:lon} (2)</b>. Se tiver sinal de menos, mantenha."],
        ["Depois", "Toque em {ui:register} e confirme na carteira. Use sua cidade, não sua casa."]],
      planCap: "Só quando a localização não pôde ser detectada: (1) {ui:lat} · (2) {ui:lon}" },
    14: { k: "Pronto", h: "Pronto: seu nó está ligado",
      do: ["O botão muda para {ui:registered}.", "Seu nó aparece no mapa da rede. A partir de agora, ele conta."],
      onoff: [["SIM", "Você pode fechar a aba", "Seu nó continua ligado na rede sozinho."], ["SIM", "Você pode desligar o computador", "Seu nó não depende do seu computador nem do seu celular."], ["NÃO", "Nunca desative seu nó", "Um nó desativado para de contar até você ligar de novo."]],
      done: ["Parte B concluída. Você está no airdrop.", "Staking + nó ligado, com a mesma carteira. Sua contagem está correndo."] },
    15: { k: "Meu Airdrop", h: "Abra o Meu Airdrop",
      do: ["Abra <b>sectoraorg.com/myairdrop</b>.", "Toque em {ui:myConnect}, ou cole o endereço da sua carteira e toque em {ui:myCheck}.", "Você vê quanto já gerou, seu <b>nível</b>, seu <b>prêmio</b> e os três requisitos."],
      cap: "Exemplo: 1.000 #SECT em staking = Guardian, prêmio 750 SECT.",
      checkH: "Os três requisitos",
      check: [["✓ 100+ SECT em staking", "Feito na Parte A."], ["✓ Hash Node ligado", "Feito na Parte B."], ["30 dias dentro", "Começa sozinho quando os dois de cima são verdade. Só espere e não mexa em nada."]] },
    16: { k: "Página do airdrop", h: "Conferência rápida na página do airdrop",
      do: ["Abra a página do airdrop, <b>sectoraorg.com/airdroptesting</b>, e toque em {ui:takePart}.", "Conecte sua carteira. A janela <b>“Seu airdrop”</b> mostra quanto você já gerou, seu prêmio e seu nível."],
      cap1: "A página do airdrop: toque em {ui:takePart}.", cap2: "Exemplo da janela “Seu airdrop”.",
      see: "<b>Quando recebo meus SECT?</b> Na SectoraEVM, no seu lançamento na mainnet. Você poderá acompanhar no <a href=\"/sectorascan/\">SectoraScan</a>." }
  },
  wallet: {
    site: "sectoraorg.com",
    connect: { h: "Conectar a este site", p: "sectoraorg.com quer ver o endereço da sua conta e pedir que você aprove ações.", no: "Cancelar", yes: "Conectar" },
    approve: { h: "Pedido de limite de gasto", rows: [["Token", "#SECT"], ["Limite de gasto", "1.000 SECT"], ["Autorizado", "0x79Cb…20E0"], ["Taxa de rede", "paga em ETH"]], no: "Rejeitar", yes: "Confirmar" },
    deposit: { h: "Pedido de transação", rows: [["Interage com", "0x79Cb…20E0"], ["Ação", "Depositar"], ["Taxa de rede", "paga em ETH"]], no: "Rejeitar", yes: "Confirmar" },
    sw: { h: "Permitir que este site troque a rede?", from: "Ethereum", to: "Sepolia", no: "Cancelar", yes: "Trocar rede" }
  },
  faq: {
    k: "Problemas · respostas rápidas", h: "Algo não funcionou? <b>Veja aqui primeiro.</b>",
    items: [
      ["“Not enough ETH” na página de staking", "A Parte A usa Ethereum real. Adicione um pouco de ETH (na Ethereum) à mesma carteira e tente de novo."],
      ["“Gas insuficiente” no dashboard", "A Parte B usa ETH da Sepolia grátis. Repita o <a href=\"#step-10\">passo 10</a>."],
      ["A torneira do Google pede 0.001 ETH na Ethereum", "Sua carteira precisa de pelo menos 0,001 ETH real na Ethereum para usar a torneira do Google. Deixe um pouco de ETH nela e tente de novo, ou escreva ao suporte."],
      ["Minha carteira não mostra a Sepolia", "Nas configurações da carteira, ative “Mostrar redes de teste”. Depois recarregue o dashboard."],
      ["“Switch your wallet to the Ethereum network”", "Você está na página de staking com a rede errada. Na carteira, escolha Ethereum (Ethereum Mainnet) e recarregue."],
      ["“You do not have that many #SECT in your wallet”", "Quer dizer que você não tem tantos #SECT. Digite um valor menor ou compre mais #SECT com o nosso <a href=\"/guide/pt/\">guia de compra</a>."],
      ["Não tenho tSECT suficientes para o Node Kit", "Resgate 5.000 tSECT no <a href=\"#step-11\">passo 11</a>. Já resgatou hoje? Espere 24 horas e resgate de novo."],
      ["Usei outra carteira para o nó", "Não conta. Conecte sua <b>carteira do staking</b> no dashboard e repita a Parte B com ela."],
      ["A localização não foi detectada, ou está errada", "Toque em “{ui:change}”, ou siga o Plano B do <a href=\"#step-13\">passo 13</a>. Use sua cidade, não sua casa."],
      ["A janela da carteira não abriu", "Abra você mesmo o app ou a extensão da carteira: o pedido está esperando lá. No celular, depois de aprovar, volte para a aba do navegador."],
      ["Preciso deixar o computador ligado?", "Não. Depois de registrado, seu nó fica ligado sozinho. Só nunca desative."],
      ["Preciso retirar meu staking para participar?", "Não. Nunca. Seus #SECT em staking contam como estão, e você continua ganhando suas recompensas de staking."],
      ["A Parte B custa dinheiro?", "Não. tSECT e ETH da Sepolia são moedas de teste grátis e sem valor."]
    ]
  },
  help: {
    k: "Suporte", h: "Ainda travado? <b>Escreva para nós.</b>",
    p: "Mande um e-mail para o nosso suporte com o assunto <b>“Airdrop Connection”</b>. Para ajudarmos rápido, inclua:",
    list: ["O endereço <b>público</b> da sua carteira (começa com 0x).", "O <b>número do passo</b> em que você travou.", "Uma <b>captura de tela</b> do erro."],
    email: "E-mail", subject: "Assunto", subjectV: "Airdrop Connection", btn: "Escrever ao suporte",
    never: "<b>Nunca</b> mande sua frase de recuperação (12 ou 24 palavras) nem sua chave privada. Nem para nós, nem para ninguém."
  },
  foot: {
    legal: "<b>Sectora Foundation IL</b> · Empresa de cibersegurança · Chicago, Illinois, Estados Unidos · Registro em Illinois 18523639 · EIN 32-0868576",
    token: "Token #SECT (Ethereum, ERC-20)", staking: "Contrato de staking", support: "Suporte: support@sectoraorg.com · Assunto “Airdrop Connection”",
    online: "Versão online com links: sectoraorg.com/airdrop-guide/pt",
    nav: ["Airdrop", "Staking", "Hash Node", "Meu Airdrop", "Legal"]
  }
};
