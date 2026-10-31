(function (PL) {
  var G = 9.8;
  var RADII = [0.5, 1, 2];
  var TYP = [130, 30, 5];
  var NEEDLE_L = 0.035;
  var GAMMA0 = 0.072;
  var SOAP_FACTOR = 0.4;
  var LIQ = {
    water: {
      id: 'water',
      g: 0.072,
      rho: 1000,
      th: 10,
      fill: '#4a90e2',
      stroke: '#2b6cb0',
      light: '#c5e6ff',
      dark: '#1e4e86',
      nameKey: 'sim.surface-tension.water'
    },
    mercury: {
      id: 'mercury',
      g: 0.485,
      rho: 13600,
      th: 140,
      fill: '#9aa3ad',
      stroke: '#4a5158',
      light: '#e8edf2',
      dark: '#2f353c',
      nameKey: 'sim.surface-tension.mercury'
    }
  };

  function thetaFromS(s) {
    return s >= 1 ? 0 : Math.acos(2 * s - 1) * 180 / Math.PI;
  }

  function sFromTheta(th) {
    return Math.min(1.1, (1 + Math.cos(th * Math.PI / 180)) / 2);
  }

  function capHeightMm(rMm, thetaDeg, liqId) {
    var L = LIQ[liqId] || LIQ.water;
    return 2 * L.g * Math.cos(thetaDeg * Math.PI / 180) / (L.rho * G * (rMm / 1000)) * 1000;
  }

  function needleGamma(soap) {
    return GAMMA0 * (soap ? SOAP_FACTOR : 1);
  }

  function needleForce(soap) {
    return 2 * needleGamma(soap) * NEEDLE_L * 1000;
  }

  function needleWeight(mass) {
    return mass * 1e-3 * G * 1000;
  }

  function needleSinks(mass, soap) {
    return needleWeight(mass) > needleForce(soap);
  }

  function neighborNet(depth) {
    var D = 1;
    var nc = 9;
    var nr = 8;
    var pts = [];
    var k;
    var i;
    for (k = 0; k < nr; k++) {
      for (i = 0; i < nc; i++) {
        pts.push({
          x: (i - Math.floor(nc / 2)) * D + (k & 1) * D / 2,
          y: k * D * 0.866,
          k: k,
          i: i
        });
      }
    }
    var hl = null;
    for (i = 0; i < pts.length; i++) {
      if (pts[i].k === depth && pts[i].i === Math.floor(nc / 2)) hl = pts[i];
    }
    var sx = 0;
    var sy = 0;
    if (!hl) return { mag: 0, sx: 0, sy: 0 };
    for (i = 0; i < pts.length; i++) {
      var p2 = pts[i];
      if (p2 === hl) continue;
      var dx = p2.x - hl.x;
      var dy = p2.y - hl.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < D * 1.05) {
        sx += dx / dist;
        sy += dy / dist;
      }
    }
    return { mag: Math.sqrt(sx * sx + sy * sy), sx: sx, sy: sy };
  }

  function createModel() {
    var depth = new PL.Property(3, { range: [0, 3] });
    var cohesion = new PL.Property(1, { range: [0.5, 2] });
    var allsurf = new PL.Property(false);
    var needleMass = new PL.Property(0.25, { range: [0.1, 0.6] });
    var soap = new PL.Property(false);
    var adhesion = new PL.Property(0.75, { range: [0, 1.1] });
    var dropHg = new PL.Property(false);
    var capMode = new PL.Property('radii');
    var liquid = new PL.Property('water');
    var contactAngle = new PL.Property(10, { range: [0, 180] });
    var substrate = new PL.Property(10);
    var needleAnim = { sunk: false, y: 0, vy: 0 };
    var hcurW = [0, 0, 0];
    var hcurM = [0, 0, 0];

    function resetNeedle() {
      needleAnim.sunk = false;
      needleAnim.y = 0;
      needleAnim.vy = 0;
    }

    function resetCapHeights() {
      hcurW[0] = 0;
      hcurW[1] = 0;
      hcurW[2] = 0;
      hcurM[0] = 0;
      hcurM[1] = 0;
      hcurM[2] = 0;
    }

    function applyLiquid(id) {
      contactAngle.value = LIQ[id].th;
      substrate.value = LIQ[id].th;
      liquid.value = id;
      resetCapHeights();
    }

    function applySubstrate(deg) {
      substrate.value = deg;
      contactAngle.value = deg;
      resetCapHeights();
    }

    function applyDropPreset(th, hg) {
      dropHg.value = !!hg;
      adhesion.value = sFromTheta(th);
    }

    return {
      timeBased: false,
      depth: depth,
      cohesion: cohesion,
      allsurf: allsurf,
      needleMass: needleMass,
      soap: soap,
      adhesion: adhesion,
      dropHg: dropHg,
      capMode: capMode,
      liquid: liquid,
      contactAngle: contactAngle,
      substrate: substrate,
      needleAnim: needleAnim,
      hcurW: hcurW,
      hcurM: hcurM,
      step: function () {},
      resetNeedle: resetNeedle,
      resetCapHeights: resetCapHeights,
      applyLiquid: applyLiquid,
      applySubstrate: applySubstrate,
      applyDropPreset: applyDropPreset,
      reset: function () {
        depth.reset();
        cohesion.reset();
        allsurf.reset();
        needleMass.reset();
        soap.reset();
        adhesion.reset();
        dropHg.reset();
        capMode.reset();
        liquid.reset();
        contactAngle.reset();
        substrate.reset();
        resetNeedle();
        resetCapHeights();
      },
      thetaFromAdhesion: function () {
        return thetaFromS(adhesion.value);
      },
      needleForce: function () {
        return needleForce(soap.value);
      },
      needleWeight: function () {
        return needleWeight(needleMass.value);
      },
      needleSinks: function () {
        return needleSinks(needleMass.value, soap.value);
      },
      capHeight: function (rMm, thetaDeg, liqId) {
        return capHeightMm(rMm, thetaDeg != null ? thetaDeg : contactAngle.value, liqId || liquid.value);
      },
      neighborNet: function () {
        return neighborNet(depth.value);
      },
      liquidInfo: function (id) {
        return LIQ[id || liquid.value] || LIQ.water;
      }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims['surface-tension'] = {
    G: G,
    RADII: RADII,
    TYP: TYP,
    NEEDLE_L: NEEDLE_L,
    GAMMA0: GAMMA0,
    SOAP_FACTOR: SOAP_FACTOR,
    LIQ: LIQ,
    thetaFromS: thetaFromS,
    sFromTheta: sFromTheta,
    capHeightMm: capHeightMm,
    needleForce: needleForce,
    needleWeight: needleWeight,
    needleSinks: needleSinks,
    neighborNet: neighborNet,
    createModel: createModel
  };
})(window.PL = window.PL || {});
