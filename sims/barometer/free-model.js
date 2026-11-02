(function (PL) {
  var SNAP_FRAC = 0.0005;

  function createModel() {
    var phys = PL.sims.barometer.physics;
    var altitude = new PL.Property(0, { range: [0, 9000] });
    var seaLevelKPa = new PL.Property(101.325, { range: [98, 104] });
    var tilt = new PL.Property(0, { range: [0, 60] });
    var radius = new PL.Property(0.8, { range: [0.3, 2] });
    var settled = new PL.Property(true);
    var playing = new PL.Property(true);
    var speed = new PL.Property(1);
    var hHg = phys.eqHeight(phys.P_STD, phys.RHO_HG);
    var hW = phys.eqHeight(phys.P_STD, phys.RHO_W);
    var lastTarget = hHg;
    var statusKind = 'settled';

    function pressurePa() {
      return phys.atmPressure(altitude.value, seaLevelKPa.value * 1000);
    }

    function columns() {
      var P = pressurePa();
      return {
        P: P,
        hg: phys.column({ P: P, rho: phys.RHO_HG, L: phys.TUBE_HG, tiltDeg: tilt.value }),
        w: phys.column({ P: P, rho: phys.RHO_W, L: phys.TUBE_W, tiltDeg: tilt.value })
      };
    }

    function forceReadout() {
      var c = columns();
      if (c.hg.full) return null;
      return phys.forceBalance({
        P: c.P,
        rho: phys.RHO_HG,
        rCm: radius.value,
        tiltDeg: tilt.value,
        hV: c.hg.hV,
        along: c.hg.along
      });
    }

    function markMoving() {
      var t = columns().hg.hV;
      if (t < lastTarget - 1e-6) statusKind = 'down';
      else if (t > lastTarget + 1e-6) statusKind = 'up';
      lastTarget = t;
      settled.value = false;
    }

    altitude.lazyLink(markMoving);
    seaLevelKPa.lazyLink(markMoving);
    tilt.lazyLink(markMoving);

    function publish() {
      model.hHg = hHg;
      model.hW = hW;
      model.statusKind = statusKind;
    }

    function stepFn(dt) {
      if (!(dt > 0)) return;
      var c = columns();
      var th = c.hg.hV;
      var tw = c.w.hV;
      hHg += phys.KAPPA * (th - hHg) * dt;
      hW += phys.KAPPA * (tw - hW) * dt;
      var okHg = Math.abs(hHg - th) < SNAP_FRAC * phys.TUBE_HG;
      var okW = Math.abs(hW - tw) < SNAP_FRAC * phys.TUBE_W;
      if (okHg) hHg = th;
      if (okW) hW = tw;
      if (okHg && okW) {
        settled.value = true;
        statusKind = 'settled';
        lastTarget = th;
      }
      publish();
    }

    function reset() {
      altitude.reset();
      seaLevelKPa.reset();
      tilt.reset();
      radius.reset();
      playing.reset();
      speed.reset();
      hHg = phys.eqHeight(phys.P_STD, phys.RHO_HG);
      hW = phys.eqHeight(phys.P_STD, phys.RHO_W);
      lastTarget = hHg;
      statusKind = 'settled';
      settled.value = true;
      publish();
    }

    var model = {
      timeBased: true,
      fixedDt: 1 / 60,
      altitude: altitude,
      seaLevelKPa: seaLevelKPa,
      tilt: tilt,
      radius: radius,
      settled: settled,
      playing: playing,
      speed: speed,
      step: stepFn,
      reset: reset,
      pressurePa: pressurePa,
      columns: columns,
      forceReadout: forceReadout
    };
    publish();
    return model;
  }

  PL.sims = PL.sims || {};
  PL.sims.barometer = PL.sims.barometer || {};
  PL.sims.barometer.free = { createModel: createModel };
})(window.PL = window.PL || {});
