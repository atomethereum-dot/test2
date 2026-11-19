/* Sectora Launch — one-time factory deployment per network (team only). */
(function () {
  "use strict";
  var E = window.ethers, C = window.SLLive.chains, ORDER = window.SLLive.order;
  // default virtual reserve and launch fee per network (native coin), sized for a ~$10k raise at graduation
  var DEF = { bsc: ["6", "0.002"], base: ["2", "0.0005"], ethereum: ["2", "0.0005"], arbitrum: ["2", "0.0005"], polygon: ["42000", "12"], optimism: ["2", "0.0005"], avalanche: ["480", "0.15"], local: ["2", "0.0005"] };
  var GRAD_X = 1073 / 273 - 1; // native raised at graduation = virtual reserve × 2.9304
  var $ = function (id) { return document.getElementById(id); };
  var W = null, me = "", ok = false, usd = {}, runId = 0;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var ICO = {
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"/></svg>',
    bad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    wait: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>'
  };
  var providers = [];
  window.addEventListener("eip6963:announceProvider", function (e) { if (e.detail && e.detail.provider) providers.push(e.detail); });
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  ORDER.forEach(function (k) {
    var o = document.createElement("option"); o.value = k; o.textContent = C[k].name + " (" + C[k].id + ")"; $("dpNet").appendChild(o);
  });
  function net() { return $("dpNet").value; }
  function setDefaults() {
    var k = net(), d = DEF[k] || ["2", "0.0005"];
    $("dpV0").value = d[0]; $("dpLF").value = d[1]; $("dpU1").textContent = C[k].sym; $("dpU2").textContent = C[k].sym;
    loadUsd(k); preview(); runChecks();
  }
  function loadUsd(k) {
    var ch = C[k]; if (!ch.wnative || usd[k]) return;
    fetch("https://api.dexscreener.com/latest/dex/tokens/" + ch.wnative).then(function (r) { return r.json(); }).then(function (j) {
      var best = null;
      (j.pairs || []).forEach(function (p) {
        if (!p.baseToken || p.baseToken.address.toLowerCase() !== ch.wnative.toLowerCase() || p.chainId !== ch.ds) return;
        if (!/^(USDT|USDC|USDC\.E|BUSD|DAI|USDBC|USDT0)$/i.test(p.quoteToken.symbol)) return;
        var l = (p.liquidity && p.liquidity.usd) || 0; if (!best || l > best.l) best = { l: l, p: +p.priceUsd };
      });
      if (best) { usd[k] = best.p; preview(); }
    }).catch(function () {});
  }
  function fmtUsd(v) { return "$" + Math.round(v).toLocaleString("es-ES"); }
  function preview() {
    var k = net(), v0 = parseFloat($("dpV0").value) || 0, lf = parseFloat($("dpLF").value) || 0, p = usd[k], s = C[k].sym;
    var g = v0 * GRAD_X, mc = v0 * 1073 / 273 / 273e6 * 1e9;
    $("dpGrad").textContent = "Se gradúa al reunir ≈ " + g.toLocaleString("es-ES", { maximumFractionDigits: 3 }) + " " + s + (p ? " (≈ " + fmtUsd(g * p) + ")" : "") + " · cap. de mercado al graduar ≈ " + mc.toLocaleString("es-ES", { maximumFractionDigits: 2 }) + " " + s + (p ? " (≈ " + fmtUsd(mc * p) + ")" : "");
    $("dpLFu").textContent = p ? "≈ $" + (lf * p).toLocaleString("es-ES", { maximumFractionDigits: 2 }) + " por moneda" : "";
  }
  function row(st, txt, code) { return '<div class="dp-chk ' + st + '"><i>' + ICO[st] + "</i><div><span>" + esc(txt) + "</span>" + (code ? "<br><code>" + esc(code) + "</code>" : "") + "</div></div>"; }
  function reader(k) { return new E.JsonRpcProvider(C[k].rpc[0], C[k].id, { staticNetwork: E.Network.from(C[k].id) }); }
  function runChecks() {
    var k = net(), ch = C[k], id = ++runId, box = $("dpChecks");
    ok = false; updateBtn();
    if (!ch.dexFactory || !ch.router || !ch.wnative) { box.innerHTML = row("bad", "Faltan direcciones del DEX para esta red."); return; }
    box.innerHTML = row("wait", "Comprobando en la cadena…");
    var p = reader(k);
    var F = new E.Contract(ch.dexFactory, ["function allPairsLength() view returns (uint)"], p);
    var R = new E.Contract(ch.router, ["function factory() view returns (address)", "function WETH() view returns (address)"], p);
    var T = new E.Contract(ch.wnative, ["function symbol() view returns (string)"], p);
    Promise.all([
      p.getNetwork().then(function (n) { return Number(n.chainId); }),
      p.getCode(ch.dexFactory), F.allPairsLength().catch(function () { return -1n; }),
      p.getCode(ch.wnative), T.symbol().catch(function () { return ""; }),
      R.factory().catch(function () { return ""; }), R.WETH().catch(function () { return ""; })
    ]).then(function (r) {
      if (id !== runId) return;
      var same = function (a, b) { return a && b && a.toLowerCase() === b.toLowerCase(); };
      var c = [
        [r[0] === ch.id, "RPC conectado a " + ch.name + " (chain id " + r[0] + ")", ch.rpc[0]],
        [r[1] !== "0x" && r[2] > 0n, ch.dex + ": fábrica con " + (r[2] > 0n ? Number(r[2]).toLocaleString("es-ES") + " pools" : "sin código"), ch.dexFactory],
        [r[3] !== "0x" && /^W/.test(r[4]), "Moneda envuelta: " + (r[4] || "no encontrada"), ch.wnative],
        [same(r[5], ch.dexFactory) && same(r[6], ch.wnative), "Router del DEX apunta a la misma fábrica y moneda envuelta", ch.router]
      ];
      ok = c.every(function (x) { return x[0]; });
      var dep = (window.SL_DEPLOYMENTS || {})[k];
      box.innerHTML = c.map(function (x) { return row(x[0] ? "ok" : "bad", x[1], x[2]); }).join("") +
        (dep ? row("bad", "Ya hay un contrato publicado para esta red en la web. Desplegar otro no lo sustituye hasta que se actualice la web.", dep) : "");
      updateBtn();
    }).catch(function (e) { if (id === runId) box.innerHTML = row("bad", "No se pudo leer la red: " + (e.shortMessage || e.message)); });
  }
  function updateBtn() {
    var good = ok && !!W && E.isAddress($("dpOwner").value.trim()) && E.isAddress($("dpFee").value.trim()) && parseFloat($("dpV0").value) > 0 && parseFloat($("dpLF").value) >= 0;
    $("dpDeploy").disabled = !good;
    $("dpDeploy").textContent = "Desplegar en " + C[net()].name;
  }
  $("dpConnect").addEventListener("click", function () {
    var prov = providers.length ? providers[0].provider : window.ethereum;
    if (!prov) { $("dpWho").textContent = "No hay wallet en este navegador"; return; }
    prov.request({ method: "eth_requestAccounts" }).then(function (a) {
      W = prov; me = E.getAddress(a[0]);
      $("dpWho").textContent = me;
      if (!$("dpOwner").value) $("dpOwner").value = me;
      if (!$("dpFee").value) $("dpFee").value = me;
      updateBtn();
    }, function (e) { $("dpWho").textContent = e.message || "Cancelado"; });
  });
  ["dpOwner", "dpFee", "dpV0", "dpLF"].forEach(function (id) { $(id).addEventListener("input", function () { preview(); updateBtn(); }); });
  $("dpNet").addEventListener("change", setDefaults);

  function ensureChain(k) {
    var ch = C[k], hexId = "0x" + ch.id.toString(16);
    return W.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexId }] }).catch(function (err) {
      if (err && err.code === 4902 && ch.exp) return W.request({ method: "wallet_addEthereumChain", params: [{ chainId: hexId, chainName: ch.name, nativeCurrency: { name: ch.sym, symbol: ch.sym, decimals: 18 }, rpcUrls: [ch.rpc[0]], blockExplorerUrls: [ch.exp] }] });
      throw err;
    });
  }
  $("dpDeploy").addEventListener("click", function () {
    var k = net(), ch = C[k], btn = $("dpDeploy"), st = $("dpState"), out = $("dpResult");
    var args = [E.getAddress($("dpOwner").value.trim()), E.getAddress($("dpFee").value.trim()), ch.wnative, ch.dexFactory, E.parseEther($("dpV0").value.trim()), E.parseEther($("dpLF").value.trim())];
    btn.disabled = true; st.textContent = "Confirma en tu wallet…"; out.innerHTML = "";
    ensureChain(k).then(function () {
      var signer = new E.BrowserProvider(W, "any").getSigner();
      return signer.then(function (s) { var f = new E.ContractFactory(window.SL_ABI.factory, window.SL_BYTECODE, s); return f.deploy.apply(f, args); });
    }).then(function (c) {
      var tx = c.deploymentTransaction();
      st.textContent = "Enviado. Esperando confirmación…";
      out.innerHTML = '<div class="dp-out">Transacción: ' + esc(tx.hash) + "</div>";
      return c.waitForDeployment().then(function () { return c.getAddress(); }).then(function (addr) {
        return Promise.all([c.virtualNative(), c.launchFee(), c.owner(), c.feeRecipient(), c.tokenImplementation()]).then(function (v) {
          try { var o = JSON.parse(localStorage.getItem("sectoraLaunch.factories") || "{}"); o[k] = addr; localStorage.setItem("sectoraLaunch.factories", JSON.stringify(o)); } catch (e) {}
          var enc = E.AbiCoder.defaultAbiCoder().encode(["address", "address", "address", "address", "uint256", "uint256"], args).slice(2);
          var exp = ch.exp ? ch.exp + "/address/" + addr : "";
          st.textContent = "Desplegado.";
          out.innerHTML = '<div class="sl-alert is-ok">' + ICO.ok.replace("<svg", '<svg width="15" height="15"') + "<span>Sectora Launch ya funciona en " + esc(ch.name) + " desde este navegador. Envía la dirección para publicarla en la web para todo el mundo.</span></div>" +
            '<div class="dp-out" style="margin-top:12px">' + esc(k) + ': "' + esc(addr) + '"</div>' +
            '<div class="sl-kv"><span>Reserva virtual</span><b class="num">' + esc(E.formatEther(v[0])) + " " + esc(ch.sym) + "</b></div>" +
            '<div class="sl-kv"><span>Comisión de lanzamiento</span><b class="num">' + esc(E.formatEther(v[1])) + " " + esc(ch.sym) + "</b></div>" +
            '<div class="sl-kv"><span>Dueño</span><b class="mono">' + esc(v[2]) + "</b></div>" +
            '<div class="sl-kv"><span>Comisiones a</span><b class="mono">' + esc(v[3]) + "</b></div>" +
            '<div class="sl-kv"><span>Token base (clones)</span><b class="mono">' + esc(v[4]) + "</b></div>" +
            '<div class="dp-row">' + (exp ? '<a class="sl-btn" href="' + esc(exp) + '" target="_blank" rel="noopener">Ver en el explorador</a>' : "") + '<a class="sl-btn" href="./">Abrir Sectora Launch</a></div>' +
            '<p class="sl-note" style="margin-top:16px">Verificación del código en el explorador: compilador v0.8.24, optimización 200, EVM paris, archivo <a href="contracts/SectoraLaunch.standard-input.json" download>SectoraLaunch.standard-input.json</a>, contrato SectoraLaunchFactory. Argumentos del constructor:</p><div class="dp-out">' + esc(enc) + "</div>";
        });
      });
    }).catch(function (e) {
      btn.disabled = false;
      st.textContent = (e && (e.code === 4001 || e.code === "ACTION_REJECTED")) ? "Cancelado en la wallet." : "Error: " + (e.shortMessage || e.message);
    });
  });
  setDefaults();
})();
