// Mode demo: dimuat sebelum aplikasi HP. Permintaan ke /api/* (di produksi: VPS) dilayani
// server demo di halaman induk; permintaan lain tetap ke jaringan.
(function () {
  var host = null;
  try {
    host = window.parent !== window ? window.parent.__timbanganDemo : null;
  } catch (e) {
    host = null;
  }
  if (!host) {
    location.replace(new URL('../?app=hp', location.href).href);
    return;
  }
  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var req = new Request(input, init);
    var url = new URL(req.url);
    if (url.origin !== location.origin || url.pathname.indexOf('/api/') !== 0) return realFetch(input, init);
    return req
      .text()
      .then(function (body) {
        var headers = {};
        req.headers.forEach(function (v, k) {
          headers[k] = v;
        });
        return host.hpFetch({ method: req.method, path: url.pathname + url.search, headers: headers, body: body || undefined });
      })
      .then(function (r) {
        var empty = r.status === 204 || r.status === 304;
        return new Response(empty ? null : r.body, { status: r.status, statusText: r.statusText, headers: r.headers });
      });
  };
})();
