'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('../helpers/load.js');

function ctx() {
  return load(['sims/u-tube/strings.js', 'sims/u-tube/model.js', 'sims/u-tube/settle-model.js']);
}

function dt() {
  return 1 / 60;
}

function run(model, seconds) {
  var n = Math.round(seconds / dt());
  var i;
  for (i = 0; i < n; i++) model.step(dt());
}

function finishPending(model) {
  var guard = 0;
  while (model.pending > 0 && guard < 20000) {
    model.step(dt());
    guard++;
  }
}

function pourCm(model, arm, total) {
  model.pourArm.value = arm;
  var left = total;
  var chunk;
  while (left > 1e-9) {
    chunk = Math.min(6, left);
    model.pourAmount.value = chunk;
    model.pour();
    if (!(model.pending > 0)) break;
    finishPending(model);
    left -= chunk;
  }
}

function settle(model) {
  var guard = 0;
  while (!model.settled.value && guard < 20000) {
    model.step(dt());
    guard++;
  }
}

describe('u-tube settle model', () => {
  it('equilibrium oil 4 and 12 on the left', () => {
    const { PL } = ctx();
    const S = PL.sims['u-tube'].settle;
    var e = S.equilibrium(4, 0, 30, 920, 1000);
    assert.ok(Math.abs((e.wr - e.wl) - 3.68) < 1e-9);
    assert.ok(Math.abs(e.wl + e.wr - 30) < 1e-9);
    assert.ok(Math.abs(920 * 4 - 1000 * 3.68) < 1e-9);
    e = S.equilibrium(12, 0, 30, 920, 1000);
    assert.ok(Math.abs(e.wl - 9.48) < 1e-9);
    assert.ok(Math.abs(e.wr - 20.52) < 1e-9);
  });

  it('initial state is still after 1000 steps and gauge is 1470 Pa', () => {
    const { PL } = ctx();
    const model = PL.sims['u-tube'].settle.createModel();
    assert.strictEqual(model.wl, 15);
    assert.strictEqual(model.wr, 15);
    assert.strictEqual(model.gaugePressurePa('L'), 1470);
    assert.strictEqual(model.gaugePressurePa('R'), 1470);
    assert.strictEqual(model.settled.value, false);
    var i;
    for (i = 0; i < 1000; i++) model.step(dt());
    assert.strictEqual(model.wl, 15);
    assert.strictEqual(model.wr, 15);
    assert.strictEqual(model.settled.value, false);
  });

  it('conserves water and top liquid after pour and steps', () => {
    const { PL } = ctx();
    const model = PL.sims['u-tube'].settle.createModel();
    pourCm(model, 'L', 4);
    run(model, 2);
    assert.ok(Math.abs(model.wl + model.wr - 30) < 1e-9);
    assert.ok(Math.abs(model.tl + model.tr - 4) < 1e-9);
  });

  it('pour left lowers left water; pour right does the opposite', () => {
    const { PL } = ctx();
    var model = PL.sims['u-tube'].settle.createModel();
    pourCm(model, 'L', 4);
    run(model, 1);
    assert.ok(model.wl < 15);
    assert.ok(model.wr > 15);
    model = PL.sims['u-tube'].settle.createModel();
    pourCm(model, 'R', 4);
    run(model, 1);
    assert.ok(model.wr < 15);
    assert.ok(model.wl > 15);
  });

  it('head never grows after pouring stops and settles within 30 s', () => {
    const { PL } = ctx();
    const S = PL.sims['u-tube'].settle;
    const model = S.createModel();
    pourCm(model, 'L', 12);
    var prev = Math.abs(model.headCm());
    var i, h;
    for (i = 0; i < 30 * 60; i++) {
      model.step(dt());
      h = Math.abs(model.headCm());
      assert.ok(h <= prev + 1e-9, 'head grew ' + h + ' > ' + prev);
      prev = h;
      if (model.settled.value) break;
    }
    assert.strictEqual(model.settled.value, true);
    assert.ok(Math.abs(model.gaugePressurePa('L') - model.gaugePressurePa('R')) < 1);
    var eq = S.equilibrium(model.tl, model.tr, 30, model.rhoTop(), 1000);
    assert.ok(Math.abs(model.wl - eq.wl) < 1e-9);
    assert.ok(Math.abs(model.wr - eq.wr) < 1e-9);
  });

  it('equal pour on both arms keeps water levels equal', () => {
    const { PL } = ctx();
    const model = PL.sims['u-tube'].settle.createModel();
    pourCm(model, 'L', 4);
    settle(model);
    pourCm(model, 'R', 4);
    settle(model);
    assert.ok(Math.abs(model.wl - 15) < 1e-6);
    assert.ok(Math.abs(model.wr - 15) < 1e-6);
    assert.ok(Math.abs(model.gaugePressurePa('L') - model.gaugePressurePa('R')) < 1e-6);
  });

  it('clamps at TOP_MAX and never exceeds TUBE_H', () => {
    const { PL } = ctx();
    const C = PL.sims['u-tube'].settle.CONST;
    const model = PL.sims['u-tube'].settle.createModel();
    pourCm(model, 'L', 20);
    assert.ok(model.tl <= C.TOP_MAX + 1e-9);
    settle(model);
    pourCm(model, 'R', 20);
    assert.ok(model.tr <= C.TOP_MAX + 1e-9);
    var i;
    for (i = 0; i < 2000; i++) {
      model.step(dt());
      assert.ok(model.wl + model.tl <= C.TUBE_H + 1e-6);
      assert.ok(model.wr + model.tr <= C.TUBE_H + 1e-6);
    }
  });

  it('locks topLiquid and prediction after the first pour', () => {
    const { PL } = ctx();
    const model = PL.sims['u-tube'].settle.createModel();
    model.prediction.value = 'up';
    model.topLiquid.value = 'oil';
    pourCm(model, 'L', 4);
    var rho = model.rhoTop();
    model.topLiquid.value = 'kerosene';
    assert.strictEqual(model.topLiquid.value, 'oil');
    assert.strictEqual(model.rhoTop(), rho);
    model.prediction.value = 'down';
    assert.strictEqual(model.prediction.value, 'up');
  });

  it('kerosene 4 cm gives a smaller level difference than oil', () => {
    const { PL } = ctx();
    const S = PL.sims['u-tube'].settle;
    var oil = S.createModel();
    pourCm(oil, 'L', 4);
    settle(oil);
    var kero = S.createModel();
    kero.topLiquid.value = 'kerosene';
    pourCm(kero, 'L', 4);
    settle(kero);
    assert.ok(Math.abs((kero.wr - kero.wl) - 3.2) < 1e-6);
    assert.ok((kero.wr - kero.wl) < (oil.wr - oil.wl) - 0.1);
  });

  it('predictionCorrect is true only for up', () => {
    const { PL } = ctx();
    const S = PL.sims['u-tube'].settle;
    assert.strictEqual(S.predictionCorrect('up', 'L'), true);
    assert.strictEqual(S.predictionCorrect('down', 'L'), false);
    assert.strictEqual(S.predictionCorrect('same', 'R'), false);
    assert.strictEqual(S.predictionCorrect(null, 'L'), false);
  });

  it('reset restores mid-pour state', () => {
    const { PL } = ctx();
    const model = PL.sims['u-tube'].settle.createModel();
    model.prediction.value = 'up';
    pourCm(model, 'L', 4);
    model.step(dt());
    model.reset();
    assert.strictEqual(model.wl, 15);
    assert.strictEqual(model.wr, 15);
    assert.strictEqual(model.tl, 0);
    assert.strictEqual(model.tr, 0);
    assert.strictEqual(model.pending, 0);
    assert.strictEqual(model.settled.value, false);
    assert.strictEqual(model.explained.value, false);
    assert.strictEqual(model.prediction.value, null);
    assert.strictEqual(model.topLiquid.value, 'oil');
  });

  it('pendingArm stays the pour arm if pourArm changes mid-pour', () => {
    const { PL } = ctx();
    const model = PL.sims['u-tube'].settle.createModel();
    model.pourArm.value = 'L';
    model.pourAmount.value = 6;
    model.pour();
    model.pourArm.value = 'R';
    model.step(dt());
    assert.strictEqual(model.pendingArm, 'L');
    assert.ok(model.tl > 0);
    assert.strictEqual(model.tr, 0);
  });

  it('same pour sequence is deterministic', () => {
    const { PL } = ctx();
    const S = PL.sims['u-tube'].settle;
    function seq() {
      var m = S.createModel();
      pourCm(m, 'L', 4);
      run(m, 3);
      return { wl: m.wl, wr: m.wr, tl: m.tl, tr: m.tr, pending: m.pending };
    }
    assert.deepStrictEqual(seq(), seq());
  });
});
