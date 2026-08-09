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

  const WC_PROJECT_ID = "a491fc0784a2751d886adfc7a687c8cb";
  const WC_SCRIPT_SRC = "walletconnect-provider.min.js?v=20260809a";
  const WC_CHAINS = [1];
  const WC_OPTIONAL_CHAINS = [137, 10, 42161, 8453, 56, 43114, 11155111];
  const IS_MOBILE_OS = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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

  let account = null;
  let panelOpen = false;
  let activeProvider = null;
  let wcProviderPromise = null;
  let wcScriptPromise = null;

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
    return CHAIN_NAMES[hex] || "Chain " + parseInt(hex, 16);
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

  function setConnectingUI(isConnecting) {
    root.classList.toggle("is-connecting", isConnecting);
    btn.disabled = isConnecting;
    if (isConnecting) {
      btnLabel.textContent = "Connecting…";
    } else if (!account) {
      btnLabel.textContent = "Connect Wallet";
    }
  }

  function showHint(html) {
    installHint.innerHTML = html;
    installHint.hidden = false;
    panelConnected.hidden = true;
    openPanel();
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
    if (!account || !activeProvider) return;
    try {
      const chainId = await activeProvider.request({ method: "eth_chainId" });
      networkEl.textContent = chainName(chainId);
    } catch (e) {
      networkEl.textContent = "—";
    }
    try {
      const balanceHex = await activeProvider.request({
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

  function loadWcScript() {
    if (window.WalletConnectEthereumProvider) return Promise.resolve();
    if (wcScriptPromise) return wcScriptPromise;
    wcScriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = WC_SCRIPT_SRC;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("wc-script-load-failed"));
      document.head.appendChild(s);
    });
    return wcScriptPromise;
  }

  function getWcProvider() {
    if (wcProviderPromise) return wcProviderPromise;
    wcProviderPromise = window.WalletConnectEthereumProvider.EthereumProvider.init({
      projectId: WC_PROJECT_ID,
      chains: WC_CHAINS,
      optionalChains: WC_OPTIONAL_CHAINS,
      showQrModal: false,
      metadata: {
        name: "Sectora Testnet Dashboard",
        description: "Live network overview for the Sectora testnet.",
        url: window.location.origin,
        icons: [],
      },
    }).then((provider) => {
      provider.on("accountsChanged", (accounts) => {
        if (accounts && accounts.length) {
          setConnectedUI(accounts[0]);
        } else {
          disconnect();
        }
      });
      provider.on("chainChanged", () => {
        if (account) refreshBalanceAndNetwork();
      });
      provider.on("session_delete", () => disconnect());
      provider.on("disconnect", () => disconnect());
      return provider;
    });
    return wcProviderPromise;
  }

  async function connectInjected() {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length) {
        activeProvider = window.ethereum;
        setConnectedUI(accounts[0]);
      }
    } catch (e) {
      // user rejected the connection request — no-op
    }
  }

  async function connectWalletConnect() {
    setConnectingUI(true);
    try {
      await loadWcScript();
      const provider = await getWcProvider();

      const onUri = (uri) => {
        const deepLink = "https://metamask.app.link/wc?uri=" + encodeURIComponent(uri);
        const evt = new CustomEvent("sectora:wallet-deeplink", {
          detail: { url: deepLink },
          cancelable: true,
        });
        if (window.dispatchEvent(evt)) window.location.href = deepLink;
      };
      provider.on("display_uri", onUri);

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 30000)
      );
      const accounts = await Promise.race([provider.enable(), timeout]);
      provider.removeListener?.("display_uri", onUri);

      if (accounts && accounts.length) {
        activeProvider = provider;
        setConnectedUI(accounts[0]);
      }
    } catch (e) {
      showHint(
        'Couldn\'t open MetaMask, or the connection request was rejected. <button class="dash-wallet-retry" id="dashWalletRetry" type="button">Try again</button>'
      );
      document.getElementById("dashWalletRetry")?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        connectWalletConnect();
      });
    } finally {
      setConnectingUI(false);
    }
  }

  async function connect() {
    if (window.ethereum) {
      connectInjected();
    } else if (IS_MOBILE_OS) {
      connectWalletConnect();
    } else {
      showHint(
        'No wallet detected in this browser. <a href="https://metamask.io/download" target="_blank" rel="noopener">Install MetaMask</a> to connect a real wallet.'
      );
    }
  }

  async function disconnect() {
    if (activeProvider && activeProvider !== window.ethereum && activeProvider.disconnect) {
      try {
        await activeProvider.disconnect();
      } catch (e) {
        // relay already closed — no-op
      }
      wcProviderPromise = null;
    } else if (window.ethereum && window.ethereum.request) {
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch (e) {
        // not all wallets support permission revocation — falls back to local-only disconnect
      }
    }
    account = null;
    activeProvider = null;
    setDisconnectedUI();
    closePanel();
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (account) {
      panelOpen ? closePanel() : openPanel();
    } else if (!window.ethereum && panelOpen) {
      closePanel();
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

  if (window.ethereum) {
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts && accounts.length) {
          activeProvider = window.ethereum;
          setConnectedUI(accounts[0]);
        }
      })
      .catch(() => {});

    window.ethereum.on?.("accountsChanged", (accounts) => {
      if (activeProvider !== window.ethereum) return;
      if (accounts && accounts.length) {
        setConnectedUI(accounts[0]);
      } else {
        disconnect();
      }
    });

    window.ethereum.on?.("chainChanged", () => {
      if (activeProvider === window.ethereum && account) refreshBalanceAndNetwork();
    });
  }
})();
