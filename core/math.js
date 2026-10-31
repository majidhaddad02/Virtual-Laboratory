(function (PL) {
  PL.math = {
    clamp: function (x, a, b) {
      return Math.min(b, Math.max(a, x));
    },
    lerp: function (a, b, t) {
      return a + (b - a) * t;
    },
    mulberry32: function (seed) {
      var s = seed | 0;
      return function () {
        s = (s + 0x6D2B79F5) | 0;
        var t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    gauss: function (rng) {
      var rand = rng || Math.random;
      var u = 1 - rand();
      if (u < 1e-12) u = 1e-12;
      var v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
  };
})(window.PL = window.PL || {});
