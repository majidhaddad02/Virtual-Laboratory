(function (PL) {
  var phys = null;
  var ANIM = 1.5;
  var SNAP = 0.0005;

  function predictionCorrect(prediction) {
    return prediction === 'column';
  }

  function createModel() {
    phys = PL.sims.barometer.physics;
    var prediction = new PL.Property(null);
    var settled = new PL.Property(false);
    var explained = new PL.Property(false);
    var playing = new PL.Property(true);
    var speed = new PL.Property(1);
    var ignorePred = false;
    var lockedPrediction = null;
    var released = false;

    prediction.lazyLink(function (v) {
      if (ignorePred) return;
      if (released && v !== lockedPrediction) {
        ignorePred = true;
        prediction.value = lockedPrediction;
        ignorePred = false;
      }
    });

    var step = 0;
    var animationT = 0;
    var animating = false;
    var fromStep = 0;
    var toStep = 0;
    var fill = 0;
    var invert = 0;
    var fingerT = 0;
    var h = 0;
    var falling = false;

    function hEq() {
      return phys.eqHeight(phys.P_STD, phys.RHO_HG);
    }

    function publish() {
      model.phase = step;
      model.animationT = animationT;
      model.animating = animating;
      model.fill = fill;
      model.invert = invert;
      model.fingerT = fingerT;
      model.finger = fingerT > 0.5;
      model.h = h;
      model.falling = falling;
    }

    function canAdvance() {
      if (animating || falling) return false;
      if (step >= 4) return false;
      if (step === 3 && prediction.value == null) return false;
      return true;
    }

    function next() {
      if (!canAdvance()) return false;
      animating = true;
      animationT = 0;
      fromStep = step;
      toStep = step + 1;
      if (toStep === 4) {
        lockedPrediction = prediction.value;
        released = true;
      }
      publish();
      return true;
    }

    function finishAnim() {
      animating = false;
      animationT = 0;
      step = toStep;
      if (step === 1) fill = 1;
      if (step === 2) {
        fill = 1;
        fingerT = 1;
      }
      if (step === 3) {
        fill = 1;
        fingerT = 1;
        invert = 1;
        h = phys.TUBE_HG;
      }
      if (step === 4) {
        fill = 1;
        invert = 1;
        fingerT = 0;
        h = phys.TUBE_HG;
        falling = true;
      }
    }

    function tickAnim(dt) {
      animationT += dt;
      var u = animationT / ANIM;
      if (u > 1) u = 1;
      if (fromStep === 0) fill = u;
      if (fromStep === 1) {
        fill = 1;
        fingerT = u;
      }
      if (fromStep === 2) {
        fill = 1;
        fingerT = 1;
        invert = u;
        h = phys.TUBE_HG;
      }
      if (fromStep === 3) {
        fill = 1;
        invert = 1;
        fingerT = 1 - u;
        h = phys.TUBE_HG;
      }
      if (animationT >= ANIM) finishAnim();
    }

    function tickFall(dt) {
      var eq = hEq();
      h += phys.KAPPA * (eq - h) * dt;
      if (Math.abs(h - eq) < SNAP) {
        h = eq;
        falling = false;
        settled.value = true;
        if (!explained.value) explained.value = true;
      }
    }

    function stepFn(dt) {
      if (!(dt > 0)) return;
      if (animating) tickAnim(dt);
      else if (falling) tickFall(dt);
      publish();
    }

    function reset() {
      ignorePred = true;
      prediction.reset();
      settled.reset();
      explained.reset();
      playing.reset();
      speed.reset();
      ignorePred = false;
      lockedPrediction = null;
      released = false;
      step = 0;
      animationT = 0;
      animating = false;
      fromStep = 0;
      toStep = 0;
      fill = 0;
      invert = 0;
      fingerT = 0;
      h = 0;
      falling = false;
      publish();
    }

    var model = {
      timeBased: true,
      fixedDt: 1 / 60,
      prediction: prediction,
      settled: settled,
      explained: explained,
      playing: playing,
      speed: speed,
      step: stepFn,
      reset: reset,
      next: next,
      canAdvance: canAdvance,
      hEq: hEq
    };
    publish();
    return model;
  }

  PL.sims = PL.sims || {};
  PL.sims.barometer = PL.sims.barometer || {};
  PL.sims.barometer.steps = {
    createModel: createModel,
    predictionCorrect: predictionCorrect
  };
})(window.PL = window.PL || {});
