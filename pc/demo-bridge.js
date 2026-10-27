// Mode demo: dimuat sebelum aplikasi PC. `window.bridge` (di aplikasi Windows disediakan
// preload Electron) diarahkan ke runtime demo di halaman induk. Dibuka langsung tanpa halaman
// demo -> kembali ke halaman demo.
(function () {
  var host = null;
  try {
    host = window.parent !== window ? window.parent.__timbanganDemo : null;
  } catch (e) {
    host = null;
  }
  if (!host) {
    location.replace(new URL('../?app=pc', location.href).href);
    return;
  }
  // langganan event dilepas saat halaman ini ditutup/dimuat ulang (React tidak sempat unmount)
  var subs = [];
  window.addEventListener('pagehide', function () {
    subs.splice(0).forEach(function (off) {
      off();
    });
  });
  window.bridge = {
    call: function (method, args) {
      return host.pcCall(method, args).then(function (r) {
        return structuredClone(r);
      });
    },
    on: function (channel, cb) {
      var off = host.pcOn(channel, function (p) {
        cb(structuredClone(p));
      });
      subs.push(off);
      return function () {
        var i = subs.indexOf(off);
        if (i >= 0) subs.splice(i, 1);
        off();
      };
    },
  };
})();
