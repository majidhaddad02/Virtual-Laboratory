(function (PL) {
  var G = 9.8;
  var Patm = 101325;
  var HMAX = 0.22;
  var LIQUIDS = {
    1000: { fill: '#3d9be8', deep: '#1b5f9a', shine: '#b9e4ff', nameKey: 'sim.hydrostatic.water' },
    800: { fill: '#e3b341', deep: '#9a6b10', shine: '#ffe9a8', nameKey: 'sim.hydrostatic.oil' },
    13600: { fill: '#9aa4ae', deep: '#3e464e', shine: '#eef2f6', nameKey: 'sim.hydrostatic.mercury' }
  };

  function heightM(depth) {
    return (depth / 100) * HMAX;
  }

  function pressurePa(depth, rho) {
    return Patm + rho * G * heightM(depth);
  }

  function createModel() {
    var depth = new PL.Property(42, { range: [6, 78] });
    var rho = new PL.Property(1000);
    var showP = new PL.Property(true);
    var showH = new PL.Property(true);
    var showEq = new PL.Property(true);

    return {
      timeBased: false,
      depth: depth,
      rho: rho,
      showP: showP,
      showH: showH,
      showEq: showEq,
      step: function () {},
      reset: function () {
        depth.reset();
        rho.reset();
        showP.reset();
        showH.reset();
        showEq.reset();
      },
      heightM: function () {
        return heightM(depth.value);
      },
      pressurePa: function () {
        return pressurePa(depth.value, rho.value);
      },
      pressureAt: function (d, r) {
        return pressurePa(d, r);
      },
      liquid: function () {
        return LIQUIDS[rho.value] || LIQUIDS[1000];
      }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims.hydrostatic = {
    G: G,
    Patm: Patm,
    HMAX: HMAX,
    LIQUIDS: LIQUIDS,
    heightM: heightM,
    pressurePa: pressurePa,
    createModel: createModel
  };
})(window.PL = window.PL || {});
