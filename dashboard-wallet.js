(() => {
  const root = document.getElementById("dashWallet");
  const btn = document.getElementById("dashWalletBtn");
  const btnLabel = document.getElementById("dashWalletBtnLabel");
  const dot = document.getElementById("dashWalletDot");
  const panel = document.getElementById("dashWalletPanel");
  const panelConnected = document.getElementById("dashWalletPanelConnected");
  const installHint = document.getElementById("dashWalletInstallHint");
  const addrEl = document.getElementById("dashWalletAddress");
  const networkEl = document.getElementById("dashWalletNetwork");
  const balanceEl = document.getElementById("dashWalletBalance");
  const copyBtn = document.getElementById("dashWalletCopy");
  const disconnectBtn = document.getElementById("dashWalletDisconnect");
  if (!root || !btn) return;

  const CHAIN_NAMES = {
    "0x1": "Ethereum Mainnet",
    "0xaa36a7": "Sepolia Testnet",
    "0x5": "Goerli Testnet",
    "0x89": "Polygon",
    "0x13881": "Polygon Mumbai",
    "0xa4b1": "Arbitrum One",
    "0xa": "Optimism",
    "0x38": "BNB Smart Chain",
    "0x61": "BNB Testnet",
    "0xa86a": "Avalanche C-Chain",
    "0x2105": "Base",
    "0x14a34": "Base Sepolia",
  };

  const eth = window.ethereum;
  let account = null;
  let panelOpen = false;

  function truncate(addr) {
    return addr.slice(0, 6) + "…" + addr.slice(-4);
  }

  function formatEther(weiHex) {
    const wei = BigInt(weiHex);
    const base = 10n ** 18n;
    const whole = wei / base;
    const frac = (wei % base).toString().padStart(18, "0").slice(0, 4);
    return whole.toString() + "." + frac;
  }

  function chainName(hex) {
    return CHAIN_NAMES[hex] || ("Chain " + parseInt(hex, 16));
  }

  function openPanel() {
    panelOpen = true;
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  }
  function closePanel() {
    panelOpen = false;
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  }

  function setDisconnectedUI() {
    root.classList.remove("is-connected");
    btnLabel.textContent = "Connect Wallet";
    dot.hidden = true;
    panelConnected.hidden = true;
    addrEl.textContent = "—";
    networkEl.textContent = "—";
    balanceEl.textContent = "—";
  }

  async function refreshBalanceAndNetwork() {
    if (!account) return;
    try {
      const chainId = await eth.request({ method: "eth_chainId" });
      networkEl.textContent = chainName(chainId);
    } catch (e) {
      networkEl.textContent = "—";
    }
    try {
      const balanceHex = await eth.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      });
      balanceEl.textContent = formatEther(balanceHex) + " ETH";
    } catch (e) {
      balanceEl.textContent = "—";
    }
  }

  function setConnectedUI(addr) {
    account = addr;
    root.classList.add("is-connected");
    btnLabel.textContent = truncate(addr);
    dot.hidden = false;
    panelConnected.hidden = false;
    installHint.hidden = true;
    addrEl.textContent = truncate(addr);
    refreshBalanceAndNetwork();
  }

  async function connect() {
    if (!eth) {
      openPanel();
      installHint.hidden = false;
      panelConnected.hidden = true;
      return;
    }
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length) setConnectedUI(accounts[0]);
    } catch (e) {
      // user rejected the connection request — no-op
    }
  }

  async function disconnect() {
    if (eth && eth.request) {
      try {
        await eth.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (e) {
        // not all wallets support permission revocation — falls back to local-only disconnect
      }
    }
    account = null;
    setDisconnectedUI();
    closePanel();
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (account) {
      panelOpen ? closePanel() : openPanel();
    } else if (!eth) {
      panelOpen ? closePanel() : connect();
    } else {
      connect();
    }
  });

  copyBtn?.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account);
      copyBtn.classList.add("is-copied");
      setTimeout(() => copyBtn.classList.remove("is-copied"), 1500);
    } catch (e) {
      // clipboard access denied — no-op
    }
  });

  disconnectBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    disconnect();
  });

  document.addEventListener("click", (e) => {
    if (panelOpen && !root.contains(e.target)) closePanel();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panelOpen) closePanel();
  });

  if (eth) {
    eth
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts && accounts.length) setConnectedUI(accounts[0]);
      })
      .catch(() => {});

    eth.on?.("accountsChanged", (accounts) => {
      if (accounts && accounts.length) {
        setConnectedUI(accounts[0]);
      } else {
        account = null;
        setDisconnectedUI();
        closePanel();
      }
    });

    eth.on?.("chainChanged", () => {
      if (account) refreshBalanceAndNetwork();
    });
  }
})();
