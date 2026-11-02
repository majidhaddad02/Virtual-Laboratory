(function (PL) {
  var RHO_HG = 13595.1;
  var RHO_W = 1000;
  var G = 9.80665;
  var P_STD = 101325;
  var MMHG = RHO_HG * G / 1000;
  var KAPPA = 0.8;
  var TUBE_HG = 1.00;
  var TUBE_W = 12.0;

  function atmPressure(altM, seaLevelPa) {
    if (seaLevelPa == null) seaLevelPa = P_STD;
    altM = PL.math.clamp(altM, 0, 11000);
    return seaLevelPa * Math.pow(1 - 2.25577e-5 * altM, 5.25588);
  }

  function eqHeight(P, rho) {
    return P / (rho * G);
  }

  function units(P) {
    return {
      Pa: P,
      kPa: P / 1000,
      cmHg: P / (MMHG * 10),
      mmHg: P / MMHG,
      atm: P / P_STD
    };
  }

  function column(opts) {
    var P = opts.P;
    var rho = opts.rho;
    var L = opts.L;
    var tiltDeg = opts.tiltDeg;
    var tilt = (tiltDeg * Math.PI) / 180;
    var cos = Math.cos(tilt);
    if (cos < 1e-12) cos = 1e-12;
    var E = L * cos;
    var hEq = eqHeight(P, rho);
    var full = E < hEq;
    var hV = full ? E : hEq;
    var pTop = full ? P - rho * G * E : 0;
    var along = hV / cos;
    if (along > L) along = L;
    var vacuum = L - along;
    return {
      full: full,
      hV: hV,
      pTop: pTop,
      along: along,
      vacuum: vacuum,
      hEq: hEq,
      E: E
    };
  }

  function pressureAtHeight(P, rho, y, hV) {
    if (y < 0) y = 0;
    if (y > hV) y = hV;
    return P - rho * G * y;
  }

  function forceBalance(opts) {
    var r = opts.rCm / 100;
    var tilt = (opts.tiltDeg * Math.PI) / 180;
    var cos = Math.cos(tilt);
    if (cos < 1e-12) cos = 1e-12;
    var A_h = Math.PI * r * r / cos;
    var F_air = opts.P * A_h;
    var W = opts.rho * G * Math.PI * r * r * opts.along;
    return { F_air: F_air, W: W };
  }

  var physics = {
    RHO_HG: RHO_HG,
    RHO_W: RHO_W,
    G: G,
    P_STD: P_STD,
    MMHG: MMHG,
    KAPPA: KAPPA,
    TUBE_HG: TUBE_HG,
    TUBE_W: TUBE_W,
    atmPressure: atmPressure,
    eqHeight: eqHeight,
    units: units,
    column: column,
    pressureAtHeight: pressureAtHeight,
    forceBalance: forceBalance
  };

  PL.sims = PL.sims || {};
  PL.sims.barometer = PL.sims.barometer || {};
  PL.sims.barometer.physics = physics;
})(window.PL = window.PL || {});
