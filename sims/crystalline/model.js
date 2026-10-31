(function (PL) {
  var D = 1 / 10.5;
  var COLS = 10;
  var ROWS = 11;
  var N = COLS * ROWS;
  var RMS_MAX = 0.09 * D;
  var K = 400;
  var G = 8;
  var MIN_PLACE = 0.66 * D;
  var RELAX = 0.88 * D;
  var CUT = 1.3 * D;

  function crystalSites() {
    var s = [];
    var y0 = (1 - 8.66 * D) / 2;
    var r, c;
    for (r = 0; r < ROWS; r++) {
      for (c = 0; c < COLS; c++) {
        s.push([D * (c + 0.75 + 0.5 * (r & 1)), y0 + D * 0.866 * r]);
      }
    }
    return s;
  }

  function amorphSites(rng) {
    return PL.shared.crystals.pack2d({
      n: N,
      rng: rng,
      margin: 0.06,
      minPlace: MIN_PLACE,
      relax: RELAX,
      tries: 200000,
      iterations: 60
    });
  }

  function createModel(opts) {
    opts = opts || {};
    var rng = opts.rng || Math.random;
    var temperature = new PL.Property(35, { range: [0, 100] });
    var showBonds = new PL.Property(true);
    var playing = new PL.Property(true);
    var speed = new PL.Property(1);
    var crystal, amorphous;

    function rebuild() {
      crystal = PL.shared.crystals.build(crystalSites(), CUT);
      amorphous = PL.shared.crystals.build(amorphSites(rng), CUT);
    }

    rebuild();

    function stepOpts(dt) {
      return {
        T: temperature.value,
        rmsMax: RMS_MAX,
        K: K,
        G: G,
        dt: dt,
        rng: rng
      };
    }

    return {
      fixedDt: 1 / 120,
      timeBased: true,
      temperature: temperature,
      showBonds: showBonds,
      playing: playing,
      speed: speed,
      step: function (dt) {
        var o = stepOpts(dt);
        PL.shared.crystals.step(crystal, o);
        PL.shared.crystals.step(amorphous, o);
      },
      reset: function () {
        temperature.reset();
        showBonds.reset();
        playing.reset();
        speed.reset();
        rebuild();
      },
      regenerateAmorphous: function () {
        amorphous = PL.shared.crystals.build(amorphSites(rng), CUT);
      },
      getCrystal: function () { return crystal; },
      getAmorphous: function () { return amorphous; },
      rms: function (which) {
        return PL.shared.crystals.rms(which === 'amorphous' ? amorphous : crystal);
      }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims.crystalline = {
    D: D,
    COLS: COLS,
    ROWS: ROWS,
    N: N,
    RMS_MAX: RMS_MAX,
    K: K,
    G: G,
    MIN_PLACE: MIN_PLACE,
    crystalSites: crystalSites,
    amorphSites: amorphSites,
    minDistance: PL.shared.crystals.minDistance,
    createModel: createModel
  };
})(window.PL = window.PL || {});
