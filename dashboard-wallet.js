(() => {
  const root = document.getElementById("dashWallet");
  const btn = document.getElementById("dashWalletBtn");
  const btnLabel = document.getElementById("dashWalletBtnLabel");
  const dot = document.getElementById("dashWalletDot");
  const panel = document.getElementById("dashWalletPanel");
  const picker = document.getElementById("dashWalletPicker");
  const list = document.getElementById("dashWalletList");
  const pickerError = document.getElementById("dashWalletError");
  const qrView = document.getElementById("dashWalletQr");
  const qrBox = document.getElementById("dashWalletQrBox");
  const qrWalletName = document.getElementById("dashWalletQrWalletName");
  const qrBack = document.getElementById("dashWalletQrBack");
  const panelConnected = document.getElementById("dashWalletPanelConnected");
  const addrEl = document.getElementById("dashWalletAddress");
  const networkEl = document.getElementById("dashWalletNetwork");
  const balanceEl = document.getElementById("dashWalletBalance");
  const copyBtn = document.getElementById("dashWalletCopy");
  const disconnectBtn = document.getElementById("dashWalletDisconnect");
  if (!root || !btn) return;

  const WC_PROJECT_ID = "a491fc0784a2751d886adfc7a687c8cb";
  const WC_SCRIPT_SRC = "walletconnect-provider.min.js?v=20260809a";
  const QR_SCRIPT_SRC = "qrcode-generator.min.js?v=20260809a";
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

  // Popular wallets offered even when not detected as a browser extension.
  // Wallets with a confirmed deep-link/universal-link format open directly
  // in that app on mobile; the rest fall back to the raw wc: URI, which
  // most WalletConnect-compatible wallets also register as a URL scheme
  // handler. On desktop, every entry renders as a scannable QR code.
  const POPULAR_WALLETS = [
    {
      rdns: "io.metamask",
      name: "MetaMask",
      color: "#f6851b",
      mono: "M",
      deepLink: (uri) => "https://metamask.app.link/wc?uri=" + encodeURIComponent(uri),
    },
    {
      rdns: "com.trustwallet.app",
      name: "Trust Wallet",
      color: "#3375bb",
      mono: "T",
      deepLink: (uri) => "https://link.trustwallet.com/wc?uri=" + encodeURIComponent(uri),
    },
    {
      rdns: "com.coinbase.wallet",
      name: "Coinbase Wallet",
      color: "#0052ff",
      mono: "C",
      deepLink: (uri) => "https://go.cb-w.com/wc?uri=" + encodeURIComponent(uri),
    },
    {
      rdns: "me.rainbow",
      name: "Rainbow",
      color: "#001e59",
      mono: "R",
      deepLink: (uri) => "https://rnbwapp.com/wc?uri=" + encodeURIComponent(uri),
    },
    {
      rdns: "com.okex.wallet",
      name: "OKX Wallet",
      color: "#000000",
      mono: "O",
      deepLink: (uri) => "okx://wallet/wc?uri=" + encodeURIComponent(uri),
    },
    {
      rdns: "io.zerion.wallet",
      name: "Zerion",
      color: "#2962ef",
      mono: "Z",
      deepLink: (uri) => "zerion://wc?uri=" + encodeURIComponent(uri),
    },
    {
      rdns: "im.token.app",
      name: "imToken",
      color: "#11c4d1",
      mono: "I",
      deepLink: (uri) => "imtokenv2://wc?uri=" + encodeURIComponent(uri),
    },
    {
      rdns: "pro.tokenpocket.app",
      name: "TokenPocket",
      color: "#2980fe",
      mono: "TP",
    },
    {
      rdns: "io.safepal.wallet",
      name: "SafePal",
      color: "#472ff3",
      mono: "SP",
    },
    {
      rdns: "io.1inch.wallet",
      name: "1inch Wallet",
      color: "#dc2f43",
      mono: "1",
    },
    {
      rdns: "com.bitget.web3",
      name: "Bitget Wallet",
      color: "#00b578",
      mono: "B",
    },
  ];

  const GENERIC_WC = {
    rdns: "walletconnect",
    name: "Other wallets",
    color: "#3b99fc",
    mono: "◈",
    deepLink: (uri) => uri,
  };

  let account = null;
  let panelOpen = false;
  let activeProvider = null;
  let wcProviderPromise = null;
  let wcScriptPromise = null;
  let qrScriptPromise = null;
  let pendingWalletName = "";

  // ---- EIP-6963 discovery: real installed extensions announce themselves
  // with their own name/icon, instead of us guessing from window.ethereum ----
  const injectedProviders = new Map(); // rdns -> { info, provider }
  window.addEventListener("eip6963:announceProvider", (e) => {
    const { info, provider } = e.detail || {};
    if (info && provider) injectedProviders.set(info.rdns, { info, provider });
  });
  window.dispatchEvent(new Event("eip6963:requestProvider"));

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

  function showView(name) {
    picker.hidden = name !== "picker";
    qrView.hidden = name !== "qr";
    panelConnected.hidden = name !== "connected";
    if (panelOpen) positionPanel();
  }

  function positionPanel() {
    const margin = 18;
    const rect = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const openUpward = spaceBelow < 200 && spaceAbove > spaceBelow;

    if (openUpward) {
      panel.style.bottom = window.innerHeight - rect.top + 10 + "px";
      panel.style.top = "auto";
      panel.style.maxHeight = Math.max(160, spaceAbove) + "px";
    } else {
      panel.style.top = rect.bottom + 10 + "px";
      panel.style.bottom = "auto";
      panel.style.maxHeight = Math.max(160, spaceBelow) + "px";
    }
    panel.style.left = rect.left + "px";
    panel.style.overflowY = "auto";

    requestAnimationFrame(() => {
      const panelRect = panel.getBoundingClientRect();
      const overflowRight = panelRect.right - (window.innerWidth - margin);
      if (overflowRight > 0) {
        panel.style.left = Math.max(margin, rect.left - overflowRight) + "px";
      }
    });
  }

  function openPanel() {
    panelOpen = true;
    panel.hidden = false;
    positionPanel();
    window.addEventListener("scroll", closePanel, { passive: true, once: true });
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
    addrEl.textContent = truncate(addr);
    showView("connected");
    refreshBalanceAndNetwork();
  }

  function showError(message) {
    pickerError.textContent = message;
    pickerError.hidden = false;
    showView("picker");
  }

  // ---- wallet list rendering ----
  function walletRow({ key, name, icon, subtitle }) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "dash-wallet-row";
    row.dataset.wallet = key;
    row.innerHTML =
      icon +
      '<span class="dash-wallet-row-text"><span class="dash-wallet-row-name"></span>' +
      (subtitle ? '<span class="dash-wallet-row-sub"></span>' : "") +
      "</span>";
    row.querySelector(".dash-wallet-row-name").textContent = name;
    if (subtitle) row.querySelector(".dash-wallet-row-sub").textContent = subtitle;
    return row;
  }

  function monogramIcon(w) {
    const bg =
      w.rdns === "me.rainbow"
        ? "linear-gradient(135deg,#ff5757,#ffa640,#5ce6a4,#4ba9ff,#9b6bff)"
        : w.color;
    return (
      '<span class="dash-wallet-row-icon" style="background:' +
      bg +
      '">' +
      w.mono +
      "</span>"
    );
  }

  function renderList() {
    list.innerHTML = "";
    pickerError.hidden = true;

    const detected = Array.from(injectedProviders.values());
    const detectedRdns = new Set(detected.map((d) => d.info.rdns));

    detected.forEach(({ info, provider }) => {
      const icon = info.icon
        ? '<img class="dash-wallet-row-icon" src="' + info.icon + '" alt="" />'
        : monogramIcon({ color: "#888", mono: info.name?.[0] || "?", rdns: info.rdns });
      const row = walletRow({ key: "injected:" + info.rdns, name: info.name, icon, subtitle: "Detected" });
      row.addEventListener("click", () => connectInjected(provider, info.name));
      list.appendChild(row);
    });

    // Legacy fallback: an injected wallet that predates EIP-6963.
    if (!detected.length && window.ethereum) {
      const row = walletRow({
        key: "injected:legacy",
        name: "Browser Wallet",
        icon: monogramIcon({ color: "#888", mono: "W", rdns: "" }),
        subtitle: "Detected",
      });
      row.addEventListener("click", () => connectInjected(window.ethereum, "Browser Wallet"));
      list.appendChild(row);
    }

    POPULAR_WALLETS.filter((w) => !detectedRdns.has(w.rdns)).forEach((w) => {
      const row = walletRow({ key: w.rdns, name: w.name, icon: monogramIcon(w) });
      row.addEventListener("click", () => connectViaWalletConnect(w));
      list.appendChild(row);
    });

    const wcRow = walletRow({ key: "walletconnect", name: GENERIC_WC.name, icon: monogramIcon(GENERIC_WC) });
    wcRow.addEventListener("click", () => connectViaWalletConnect(GENERIC_WC));
    list.appendChild(wcRow);
  }

  function loadScript(src, promiseRef, globalCheck) {
    if (globalCheck()) return Promise.resolve();
    if (promiseRef.p) return promiseRef.p;
    promiseRef.p = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("script-load-failed: " + src));
      document.head.appendChild(s);
    });
    return promiseRef.p;
  }

  const wcScriptRef = {};
  const qrScriptRef = {};
  function loadWcScript() {
    return loadScript(WC_SCRIPT_SRC, wcScriptRef, () => !!window.WalletConnectEthereumProvider);
  }
  function loadQrScript() {
    return loadScript(QR_SCRIPT_SRC, qrScriptRef, () => !!window.SectoraQR);
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

  function renderQr(uri) {
    const qr = window.SectoraQR(0, "M");
    qr.addData(uri);
    qr.make();
    qrBox.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2 });
  }

  async function connectInjected(provider, name) {
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length) {
        activeProvider = provider;
        setConnectedUI(accounts[0]);
      }
    } catch (e) {
      showError(name + " rejected the connection request.");
    }
  }

  async function connectViaWalletConnect(walletDef) {
    pendingWalletName = walletDef.name;
    qrWalletName.textContent = walletDef.name;
    try {
      await loadWcScript();
      const provider = await getWcProvider();

      const onUri = (uri) => {
        if (IS_MOBILE_OS) {
          const deepLink = (walletDef.deepLink || GENERIC_WC.deepLink)(uri);
          const evt = new CustomEvent("sectora:wallet-deeplink", {
            detail: { url: deepLink, wallet: walletDef.name },
            cancelable: true,
          });
          if (window.dispatchEvent(evt)) window.location.href = deepLink;
        } else {
          loadQrScript()
            .then(() => {
              renderQr(uri);
              showView("qr");
              openPanel();
            })
            .catch(() => showError("Couldn't load the QR code generator."));
        }
      };
      provider.on("display_uri", onUri);

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 90000)
      );
      const accounts = await Promise.race([provider.enable(), timeout]);
      provider.removeListener?.("display_uri", onUri);

      if (accounts && accounts.length) {
        activeProvider = provider;
        setConnectedUI(accounts[0]);
      }
    } catch (e) {
      wcProviderPromise = null;
      showError("Couldn't connect to " + pendingWalletName + ". " + (IS_MOBILE_OS ? "Make sure the app is installed and try again." : "The request may have expired — try again."));
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
    } else if (activeProvider && activeProvider.request) {
      try {
        await activeProvider.request({
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
    showView("picker");
    closePanel();
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (account) {
      panelOpen ? closePanel() : openPanel();
      return;
    }
    if (panelOpen) {
      closePanel();
      return;
    }
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    renderList();
    showView("picker");
    openPanel();
  });

  qrBack.addEventListener("click", (e) => {
    e.stopPropagation();
    showView("picker");
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

  // Silent restore on load: only for an already-authorized injected wallet
  // (no popup). A prior WalletConnect session is not eagerly restored to
  // avoid loading the 2MB SDK for visitors who never use it.
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
