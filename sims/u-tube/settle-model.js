(function (PL) {
  var CONST = {
    S: 30,
    W0: 15,
    TOP_MAX: 12,
    TUBE_H: 36,
    POUR_RATE: 3,
    KAPPA: 0.4,
    SETTLE_EPS: 0.02,
    G: 9.8,
    RHO_WATER: 1000
  };

  var TOPS = {
    oil: { id: 'oil', nameKey: 'sim.u-tube.oil', rho: 920, fill: '#e8c44a', deep: '#8a6d10', shine: '#fff3b0' },
    kerosene: { id: 'kerosene', nameKey: 'sim.u-tube.settle.kerosene', rho: 800, fill: '#f08c3a', deep: '#a84e12', shine: '#ffd0a0' }
  };

  function equilibrium(tl, tr, S, rhoTop, rhoWater) {
    var wl = (S - (rhoTop / rhoWater) * (tl - tr)) / 2;
    var wr = (S + (rhoTop / rhoWater) * (tl - tr)) / 2;
    return { wl: wl, wr: wr };
  }

  function gaugePressurePa(topH, waterH, rhoTop) {
    return CONST.G * (rhoTop * topH + CONST.RHO_WATER * waterH) / 100;
  }

  function predictionCorrect(prediction) {
    return prediction === 'up';
  }

  function headCm(tl, tr, wl, wr, rhoTop) {
    return (rhoTop * (tl - tr)) / CONST.RHO_WATER + (wl - wr);
  }

  function createModel() {
    var pourAmount = new PL.Property(4, { range: [1, 6] });
    var pourArm = new PL.Property('L');
    var topLiquid = new PL.Property('oil');
    var prediction = new PL.Property(null);
    var settled = new PL.Property(false);
    var explained = new PL.Property(false);
    var playing = new PL.Property(true);
    var speed = new PL.Property(1);

    var wl = CONST.W0;
    var wr = CONST.W0;
    var tl = 0;
    var tr = 0;
    var pending = 0;
    var pendingArm = null;
    var pouredAny = false;
    var firstPourArm = null;
    var lockedLiquid = null;
    var lockedPrediction = null;
    var ignoreTop = false;
    var ignorePred = false;

    topLiquid.lazyLink(function (v) {
      if (ignoreTop) return;
      if (lockedLiquid && v !== lockedLiquid) {
        ignoreTop = true;
        topLiquid.value = lockedLiquid;
        ignoreTop = false;
      }
    });
    prediction.lazyLink(function (v) {
      if (ignorePred) return;
      if (pouredAny && v !== lockedPrediction) {
        ignorePred = true;
        prediction.value = lockedPrediction;
        ignorePred = false;
      }
    });

    function rhoTop() {
      var id = lockedLiquid || topLiquid.value;
      return TOPS[id] ? TOPS[id].rho : TOPS.oil.rho;
    }

    function topId() {
      return lockedLiquid || topLiquid.value;
    }

    function cap(arm) {
      return CONST.TOP_MAX - (arm === 'L' ? tl : tr);
    }

    function publish() {
      model.wl = wl;
      model.wr = wr;
      model.tl = tl;
      model.tr = tr;
      model.pending = pending;
      model.pendingArm = pendingArm;
      model.pouredAny = pouredAny;
      model.firstPourArm = firstPourArm;
    }

    function pour() {
      if (pending > 0) return;
      var arm = pourArm.value;
      var room = cap(arm);
      if (room <= 0) return;
      var amt = pourAmount.value;
      if (amt > room) amt = room;
      if (amt <= 0) return;
      if (!pouredAny) {
        lockedLiquid = topLiquid.value;
        lockedPrediction = prediction.value;
        firstPourArm = arm;
        pouredAny = true;
      }
      pending = amt;
      pendingArm = arm;
      settled.value = false;
      publish();
    }

    function step(dt) {
      if (!(dt > 0)) return;
      var rho = rhoTop();
      if (pending > 0) {
        var m = Math.min(CONST.POUR_RATE * dt, pending);
        var arm = pendingArm || pourArm.value;
        var room = cap(arm);
        if (m > room) m = room;
        if (arm === 'L') tl += m;
        else tr += m;
        pending -= m;
        if (pending < 1e-12) pending = 0;
      }
      var H = headCm(tl, tr, wl, wr, rho);
      var dwl = -CONST.KAPPA * H * dt;
      wl += dwl;
      wr -= dwl;
      H = headCm(tl, tr, wl, wr, rho);
      if (pending === 0 && pouredAny && Math.abs(H) < CONST.SETTLE_EPS) {
        var eq = equilibrium(tl, tr, CONST.S, rho, CONST.RHO_WATER);
        wl = eq.wl;
        wr = eq.wr;
        settled.value = true;
        if (!explained.value) explained.value = true;
      }
      publish();
    }

    function reset() {
      ignoreTop = true;
      ignorePred = true;
      pourAmount.reset();
      pourArm.reset();
      topLiquid.reset();
      prediction.reset();
      settled.reset();
      explained.reset();
      playing.reset();
      speed.reset();
      ignoreTop = false;
      ignorePred = false;
      wl = CONST.W0;
      wr = CONST.W0;
      tl = 0;
      tr = 0;
      pending = 0;
      pendingArm = null;
      pouredAny = false;
      firstPourArm = null;
      lockedLiquid = null;
      lockedPrediction = null;
      publish();
    }

    function pressure(arm) {
      var topH = arm === 'L' ? tl : tr;
      var waterH = arm === 'L' ? wl : wr;
      return gaugePressurePa(topH, waterH, rhoTop());
    }

    var model = {
      timeBased: true,
      fixedDt: 1 / 60,
      pourAmount: pourAmount,
      pourArm: pourArm,
      topLiquid: topLiquid,
      prediction: prediction,
      settled: settled,
      explained: explained,
      playing: playing,
      speed: speed,
      step: step,
      reset: reset,
      pour: pour,
      cap: cap,
      rhoTop: rhoTop,
      topId: topId,
      headCm: function () {
        return headCm(tl, tr, wl, wr, rhoTop());
      },
      gaugePressurePa: pressure,
      topSpec: function () {
        return TOPS[topId()] || TOPS.oil;
      }
    };
    publish();
    return model;
  }

  PL.sims = PL.sims || {};
  PL.sims['u-tube'] = PL.sims['u-tube'] || {};
  PL.sims['u-tube'].settle = {
    createModel: createModel,
    equilibrium: equilibrium,
    gaugePressurePa: gaugePressurePa,
    predictionCorrect: predictionCorrect,
    CONST: CONST,
    TOPS: TOPS
  };
})(window.PL = window.PL || {});
