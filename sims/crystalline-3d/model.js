(function (PL) {
  var CAM = 9;
  var RMS_MAX = 0.11;
  var K = 400;
  var G = 8;
  var N = 64;
  var CELL_COUNT = 27;
  var CORNERS = 8;
  var ATOMS_PER_CELL = 1;
  var BULK_COORD = 6;
  var MIN_PLACE = 0.6;
  var RELAX = 0.85;
  var HALF = 1.85;

  function crystalSites() {
    var s = [];
    var i, j, k;
    for (i = 0; i < 4; i++) {
      for (j = 0; j < 4; j++) {
        for (k = 0; k < 4; k++) s.push([i - 1.5, j - 1.5, k - 1.5]);
      }
    }
    return s;
  }

  function cellSites() {
    var s = [];
    var i, j, k;
    for (i = 0; i < 2; i++) {
      for (j = 0; j < 2; j++) {
        for (k = 0; k < 2; k++) s.push([i - 0.5, j - 0.5, k - 0.5]);
      }
    }
    return s;
  }

  function amorphSites(rng) {
    return PL.lattice.pack3d({
      n: N,
      rng: rng,
      halfExtent: HALF,
      minPlace: MIN_PLACE,
      relax: RELAX,
      tries: 100000,
      iterations: 80
    });
  }

  function decorate(sys, scale, col) {
    sys.scale = scale;
    sys.col = col;
    sys.hl = null;
    sys.he = null;
    sys.always = false;
    return sys;
  }

  function applyCell(cry, idx) {
    var cx = Math.floor(idx / 9);
    var cy = Math.floor(idx / 3) % 3;
    var cz = idx % 3;
    var set = {};
    var a, b, c;
    for (a = 0; a < 2; a++) {
      for (b = 0; b < 2; b++) {
        for (c = 0; c < 2; c++) set[(cx + a) * 16 + (cy + b) * 4 + (cz + c)] = true;
      }
    }
    cry.hl = set;
    cry.he = cry.b.map(function (e) {
      return !!(set[e[0]] && set[e[1]]);
    });
  }

  function markUnitCell(cel) {
    var q;
    cel.hl = {};
    cel.he = [];
    for (q = 0; q < 8; q++) cel.hl[q] = true;
    for (q = 0; q < cel.b.length; q++) cel.he.push(true);
    cel.always = true;
  }

  function interiorIndex() {
    return 1 * 16 + 1 * 4 + 1;
  }

  function createModel(opts) {
    opts = opts || {};
    var rng = opts.rng || Math.random;
    var temperature = new PL.Property(30, { range: [0, 100] });
    var showBonds = new PL.Property(true);
    var showCell = new PL.Property(true);
    var spin = new PL.Property(true);
    var autoCell = new PL.Property(false);
    var cellIndex = new PL.Property(13);
    var playing = new PL.Property(true);
    var speed = new PL.Property(1);
    var crystal, amorphous, unit;

    function rebuild() {
      crystal = decorate(PL.lattice.build(crystalSites(), 1.1), 0.095, '#64b0ff');
      amorphous = decorate(PL.lattice.build(amorphSites(rng), 1.2), 0.095, '#ffb347');
      unit = decorate(PL.lattice.build(cellSites(), 1.1), 0.30, '#64b0ff');
      markUnitCell(unit);
      applyCell(crystal, cellIndex.value);
    }

    rebuild();

    cellIndex.lazyLink(function (v) {
      if (crystal) applyCell(crystal, v);
    });

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
      showCell: showCell,
      spin: spin,
      autoCell: autoCell,
      cellIndex: cellIndex,
      playing: playing,
      speed: speed,
      step: function (dt) {
        var o = stepOpts(dt);
        PL.lattice.step(crystal, o);
        PL.lattice.step(amorphous, o);
        PL.lattice.step(unit, o);
      },
      reset: function () {
        temperature.reset();
        showBonds.reset();
        showCell.reset();
        spin.reset();
        autoCell.reset();
        cellIndex.reset();
        playing.reset();
        speed.reset();
        rebuild();
      },
      nextCell: function () {
        cellIndex.value = (cellIndex.value + 1) % CELL_COUNT;
      },
      regenerateAmorphous: function () {
        amorphous = decorate(PL.lattice.build(amorphSites(rng), 1.2), 0.095, '#ffb347');
      },
      getCrystal: function () { return crystal; },
      getAmorphous: function () { return amorphous; },
      getUnitCell: function () { return unit; }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims['crystalline-3d'] = {
    CAM: CAM,
    N: N,
    CELL_COUNT: CELL_COUNT,
    CORNERS: CORNERS,
    ATOMS_PER_CELL: ATOMS_PER_CELL,
    BULK_COORD: BULK_COORD,
    MIN_PLACE: MIN_PLACE,
    crystalSites: crystalSites,
    cellSites: cellSites,
    amorphSites: amorphSites,
    interiorIndex: interiorIndex,
    createModel: createModel
  };
})(window.PL = window.PL || {});
