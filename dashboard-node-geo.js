/* Hash Node: la ubicacion del nodo se rellena sola para registrarlo con un solo clic.
   Se toma la ubicacion aproximada de la conexion (get.geojs.io, y si falla freeipapi.com o ipwho.is)
   y se redondea a 0,1 grados (unos 11 km): en la red queda la ciudad, nunca la direccion.
   El nombre del nodo tambien se propone solo. Todo se puede cambiar a mano con "Cambiar". */
(function () {
  "use strict";
  var lat = document.getElementById("nLat"), lon = document.getElementById("nLon"), nm = document.getElementById("nName"), btn = document.getElementById("bReg");
  if (!lat || !lon || !btn) return;
  var form = lat.closest(".form"), card = form && form.parentNode;
  if (!form || !card) return;
  var KEY = "sectora:node-geo", TTL = 7 * 864e5;
  var state = "wait", place = "";

  function tr(k, f, v) {
    var s = f;
    if (window.SECTORA_T) { var x = window.SECTORA_T(k); if (x && x !== k) s = x; }
    if (v) for (var i in v) s = s.split("{" + i + "}").join(v[i]);
    return s;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- interfaz: una linea con la ubicacion y los campos de coordenadas ocultos ---------- */
  var st = document.createElement("style");
  st.textContent = ".form.geo-auto .fld-geo{display:none}" +
    ".node-geo{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin:0 0 14px;padding:11px 14px;border:1px solid var(--hair,rgba(255,255,255,.12));font-size:13.5px;line-height:1.5;color:var(--ink-2,#c6ccd8)}" +
    ".node-geo i{flex:none;width:8px;height:8px;border-radius:50%;background:#3ecf8e;box-shadow:0 0 0 3px rgba(62,207,142,.18)}" +
    ".node-geo.wait i{background:#e0a030;box-shadow:0 0 0 3px rgba(224,160,48,.18)}" +
    ".node-geo.fail i{background:#e0a030}" +
    ".node-geo b{color:#fff;font-weight:500}" +
    ".node-geo button{margin-left:auto;padding:4px 0;color:var(--blue-l,#4d8dff);font:inherit;font-size:12.5px;background:none;border:0;cursor:pointer;text-decoration:underline}" +
    ".node-geo-n{margin:-6px 0 14px;color:var(--ink-3,#7c8496);font-size:12px;line-height:1.5}";
  document.head.appendChild(st);
  [lat, lon].forEach(function (el) { var f = el.closest(".fld"); if (f) f.classList.add("fld-geo"); });
  form.classList.add("geo-auto");
  var line = document.createElement("p"); line.className = "node-geo wait"; line.id = "nGeo"; line.setAttribute("aria-live", "polite");
  var note = document.createElement("p"); note.className = "node-geo-n";
  card.insertBefore(line, form); card.insertBefore(note, form);

  function paint() {
    line.className = "node-geo " + state;
    var txt = state === "ok" ? tr("hashdash.node.geoOk", "Node location: {c} · approximate, detected automatically", { c: "<b>" + esc(place) + "</b>" })
      : state === "fail" ? esc(tr("hashdash.node.geoFail", "We couldn't detect the location. Enter it below."))
      : esc(tr("hashdash.node.geoWait", "Detecting your node's location…"));
    line.innerHTML = "<i></i><span>" + txt + "</span>" + (state === "ok" && form.classList.contains("geo-auto") ? '<button type="button">' + esc(tr("hashdash.node.geoEdit", "Change")) + "</button>" : "");
    var b = line.querySelector("button");
    if (b) b.addEventListener("click", function () { form.classList.remove("geo-auto"); paint(); lat.focus(); });
    note.textContent = tr("hashdash.node.geoNote", "Only an approximate location (city level) is saved on the network, never your address.");
  }

  /* ---------- ubicacion aproximada de la conexion ---------- */
  function getJSON(u) {
    var c = new AbortController(), t = setTimeout(function () { c.abort(); }, 6000);
    return fetch(u, { signal: c.signal, cache: "no-store" }).then(function (r) { clearTimeout(t); if (!r.ok) throw new Error("http"); return r.json(); });
  }
  var SRC = [
    function () { return getJSON("https://get.geojs.io/v1/ip/geo.json").then(function (j) { return { lat: +j.latitude, lon: +j.longitude, city: j.city || j.region || "", cc: j.country_code || "", country: j.country || "" }; }); },
    function () { return getJSON("https://freeipapi.com/api/json").then(function (j) { return { lat: +j.latitude, lon: +j.longitude, city: j.cityName || j.regionName || "", cc: j.countryCode || "", country: j.countryName || "" }; }); },
    function () { return getJSON("https://ipwho.is/").then(function (j) { return { lat: +j.latitude, lon: +j.longitude, city: j.city || j.region || "", cc: j.country_code || "", country: j.country || "" }; }); }
  ];
  function valid(g) { return g && isFinite(g.lat) && isFinite(g.lon) && Math.abs(g.lat) <= 90 && Math.abs(g.lon) <= 180 && !(g.lat === 0 && g.lon === 0); }
  function locate() {
    try { var c = JSON.parse(localStorage.getItem(KEY) || "null"); if (c && valid(c) && Date.now() - c.t < TTL) return Promise.resolve(c); } catch (e) {}
    var i = 0;
    function next() {
      if (i >= SRC.length) return Promise.reject(new Error("geo"));
      return SRC[i++]().then(function (g) { if (!valid(g)) throw new Error("bad"); return g; }).catch(next);
    }
    return next().then(function (g) { g.t = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(g)); } catch (e) {} return g; });
  }
  function r1(x) { return Math.round(x * 10) / 10; }
  function clean(s) { return String(s || "").replace(/[^\p{L}\p{N} .'-]/gu, "").trim().slice(0, 30); }

  // si se pulsa "Registrar" antes de tener la ubicacion, se muestran los campos para escribirla
  btn.addEventListener("click", function () { if (!lat.value || !lon.value) { form.classList.remove("geo-auto"); paint(); } }, true);

  paint();
  locate().then(function (g) {
    var city = clean(g.city), country = clean(g.cc || g.country);
    place = [city, country].filter(Boolean).join(", ") || r1(g.lat) + ", " + r1(g.lon);
    // no se pisa lo que ya este escrito (por ejemplo, un nodo ya registrado)
    if (!lat.value) lat.value = String(Math.max(-85, Math.min(85, r1(g.lat))));
    if (!lon.value) lon.value = String(r1(g.lon));
    if (nm && !nm.value.trim()) nm.value = ("Sectora Node " + (city || country || "")).trim().slice(0, 48);
    state = "ok"; paint();
  }).catch(function () {
    // sin ubicacion: se muestran los campos para escribirla a mano
    state = "fail"; form.classList.remove("geo-auto"); paint();
  });
  document.addEventListener("sectora:langchange", paint);
})();
