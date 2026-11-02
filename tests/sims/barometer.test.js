'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('../helpers/load.js');

function files(extra) {
  const base = [
    'data/registry.js',
    'sims/barometer/strings.js',
    'sims/barometer/model.js',
    'sims/barometer/steps-model.js',
    'sims/barometer/free-model.js'
  ];
  return extra ? base.concat(extra) : base;
}

function ctx(extra) {
  return load(files(extra));
}

function dt() {
  return 1 / 60;
}

function run(model, seconds) {
  var n = Math.round(seconds / dt());
  var i;
  for (i = 0; i < n; i++) model.step(dt());
}

function advance(model) {
  assert.ok(model.next(), 'next should start');
  run(model, 2);
}

function stubCtx() {
  return new Proxy({}, {
    get: function (t, prop) {
      if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
        return function () {
          return { addColorStop: function () {} };
        };
      }
      if (typeof prop === 'symbol') return undefined;
      return function () { return t[prop]; };
    },
    set: function (t, prop, v) {
      t[prop] = v;
      return true;
    }
  });
}

function grabCanvases(node, out) {
  var i;
  if (node.tagName === 'CANVAS') out.push(node);
  if (node.children) {
    for (i = 0; i < node.children.length; i++) grabCanvases(node.children[i], out);
  }
}

describe('barometer physics', () => {
  it('reference numbers at sea level and altitudes', () => {
    const { PL } = ctx();
    const p = PL.sims.barometer.physics;
    var hHg = p.eqHeight(p.P_STD, p.RHO_HG);
    var hW = p.eqHeight(p.P_STD, p.RHO_W);
    assert.ok(Math.abs(hHg - 0.76) < 1e-4);
    assert.ok(Math.abs(hW - 10.3323) < 1e-3);
    assert.ok(Math.abs(hW / hHg - 13.5951) < 1e-9);
    var alts = [1000, 1190, 2000, 5610, 8849];
    var Pa = [89874.6, 87822.5, 79495.2, 49759.3, 31439.3];
    var cm = [67.41, 65.87, 59.63, 37.32, 23.58];
    var wm = [9.165, 8.955, 8.106, 5.074, 3.206];
    var i, P;
    for (i = 0; i < alts.length; i++) {
      P = p.atmPressure(alts[i]);
      assert.ok(Math.abs(P - Pa[i]) < 5, 'P ' + alts[i]);
      assert.ok(Math.abs(p.eqHeight(P, p.RHO_HG) * 100 - cm[i]) < 0.02, 'Hg ' + alts[i]);
      assert.ok(Math.abs(p.eqHeight(P, p.RHO_W) - wm[i]) < 0.005, 'W ' + alts[i]);
    }
    var u = p.units(101325);
    assert.ok(Math.abs(u.cmHg - 76) < 1e-3);
    assert.ok(Math.abs(u.mmHg - 760) < 1e-3);
    assert.ok(Math.abs(u.atm - 1) < 1e-3);
    assert.ok(Math.abs(u.kPa - 101.325) < 1e-3);
  });

  it('hV independent of radius and ratio is density ratio', () => {
    const { PL } = ctx();
    const p = PL.sims.barometer.physics;
    var radii = [0.3, 0.8, 2];
    var pressures = [p.P_STD, 90000, 50000];
    var i, j, c0, c;
    for (i = 0; i < pressures.length; i++) {
      c0 = p.column({ P: pressures[i], rho: p.RHO_HG, L: p.TUBE_HG, tiltDeg: 0 });
      for (j = 0; j < radii.length; j++) {
        c = p.column({ P: pressures[i], rho: p.RHO_HG, L: p.TUBE_HG, tiltDeg: 0 });
        assert.ok(Math.abs(c.hV - c0.hV) < 1e-12);
      }
      assert.ok(Math.abs(p.eqHeight(pressures[i], p.RHO_W) / p.eqHeight(pressures[i], p.RHO_HG) - p.RHO_HG / p.RHO_W) < 1e-9);
    }
  });

  it('tilt cases, critical angle, pTop and length bounds', () => {
    const { PL } = ctx();
    const p = PL.sims.barometer.physics;
    var hEq = p.eqHeight(p.P_STD, p.RHO_HG);
    var crit = Math.acos(hEq / p.TUBE_HG) * 180 / Math.PI;
    assert.ok(Math.abs(crit - 40.536) < 0.01);
    var c30 = p.column({ P: p.P_STD, rho: p.RHO_HG, L: p.TUBE_HG, tiltDeg: 30 });
    assert.strictEqual(c30.full, false);
    assert.ok(Math.abs(c30.hV - 0.76) < 1e-4);
    assert.ok(Math.abs(c30.along - 0.8776) < 1e-4);
    var c45 = p.column({ P: p.P_STD, rho: p.RHO_HG, L: p.TUBE_HG, tiltDeg: 45 });
    assert.strictEqual(c45.full, true);
    assert.ok(Math.abs(c45.hV - 0.7071) < 5e-4);
    var c60 = p.column({ P: p.P_STD, rho: p.RHO_HG, L: p.TUBE_HG, tiltDeg: 60 });
    assert.strictEqual(c60.full, true);
    assert.ok(Math.abs(c60.hV - 0.5) < 1e-4);
    assert.ok(Math.abs(c60.pTop - 34664) < 5);
    var wCrit = Math.acos(p.eqHeight(p.P_STD, p.RHO_W) / p.TUBE_W) * 180 / Math.PI;
    assert.ok(Math.abs(wCrit - 30.568) < 0.01);
    var tilts = [0, 15, 30, 45, 60];
    var i, c;
    for (i = 0; i < tilts.length; i++) {
      c = p.column({ P: p.P_STD, rho: p.RHO_HG, L: p.TUBE_HG, tiltDeg: tilts[i] });
      assert.ok(c.pTop >= 0);
      assert.ok(c.along <= p.TUBE_HG + 1e-12);
      assert.ok(Math.abs(c.vacuum + c.along - p.TUBE_HG) < 1e-12);
    }
  });

  it('force balance matches when the mercury tube is not full', () => {
    const { PL } = ctx();
    const p = PL.sims.barometer.physics;
    var radii = [0.3, 0.6, 0.8, 1.2, 2];
    var tilts = [0, 10, 20, 30, 35];
    var i, j, c, fb;
    for (i = 0; i < radii.length; i++) {
      for (j = 0; j < tilts.length; j++) {
        c = p.column({ P: p.P_STD, rho: p.RHO_HG, L: p.TUBE_HG, tiltDeg: tilts[j] });
        assert.strictEqual(c.full, false);
        fb = p.forceBalance({
          P: p.P_STD, rho: p.RHO_HG, rCm: radii[i], tiltDeg: tilts[j], hV: c.hV, along: c.along
        });
        assert.ok(Math.abs(fb.F_air - fb.W) / fb.W < 1e-9);
      }
    }
  });
});

describe('barometer steps', () => {
  it('transitions are sequential, forward only, and need a prediction', () => {
    const { PL } = ctx();
    const model = PL.sims.barometer.steps.createModel();
    assert.strictEqual(model.phase, 0);
    assert.strictEqual(model.next(), true);
    assert.strictEqual(model.next(), false);
    run(model, 2);
    assert.strictEqual(model.phase, 1);
    advance(model);
    assert.strictEqual(model.phase, 2);
    advance(model);
    assert.strictEqual(model.phase, 3);
    assert.strictEqual(model.next(), false);
    model.prediction.value = 'column';
    advance(model);
    assert.strictEqual(model.phase, 4);
    assert.strictEqual(model.next(), false);
  });

  it('after release h falls monotonically to 0.7600 m within 15 s', () => {
    const { PL } = ctx();
    const model = PL.sims.barometer.steps.createModel();
    advance(model);
    advance(model);
    advance(model);
    model.prediction.value = 'column';
    assert.ok(model.next());
    var i, h;
    for (i = 0; i < 3 * 60 && model.phase !== 4; i++) model.step(dt());
    assert.strictEqual(model.phase, 4);
    assert.ok(Math.abs(model.h - 1) < 1e-6);
    var prev = model.h;
    for (i = 0; i < 15 * 60; i++) {
      model.step(dt());
      h = model.h;
      assert.ok(h <= prev + 1e-12, 'h grew');
      prev = h;
      if (model.settled.value) break;
    }
    assert.strictEqual(model.settled.value, true);
    assert.ok(Math.abs(model.h - 0.76) < 1e-4);
  });

  it('locks prediction after release and predictionCorrect is only column', () => {
    const { PL } = ctx();
    const S = PL.sims.barometer.steps;
    assert.strictEqual(S.predictionCorrect('column'), true);
    assert.strictEqual(S.predictionCorrect('all'), false);
    assert.strictEqual(S.predictionCorrect('none'), false);
    assert.strictEqual(S.predictionCorrect(null), false);
    const model = S.createModel();
    advance(model);
    advance(model);
    advance(model);
    model.prediction.value = 'all';
    model.next();
    model.prediction.value = 'column';
    assert.strictEqual(model.prediction.value, 'all');
  });

  it('reset mid-animation restores everything', () => {
    const { PL } = ctx();
    const model = PL.sims.barometer.steps.createModel();
    model.prediction.value = 'column';
    model.next();
    run(model, 0.4);
    assert.strictEqual(model.animating, true);
    model.reset();
    assert.strictEqual(model.phase, 0);
    assert.strictEqual(model.animating, false);
    assert.strictEqual(model.fill, 0);
    assert.strictEqual(model.h, 0);
    assert.strictEqual(model.settled.value, false);
    assert.strictEqual(model.explained.value, false);
    assert.strictEqual(model.prediction.value, null);
  });

  it('prediction option labels contain no digits', () => {
    const { PL } = ctx();
    var keys = ['sim.barometer.predAll', 'sim.barometer.predColumn', 'sim.barometer.predNone'];
    var i, s;
    for (i = 0; i < keys.length; i++) {
      s = PL.t(keys[i]);
      assert.ok(!/[0-9۰-۹]/.test(s), s);
    }
  });
});

describe('barometer free', () => {
  it('altitude 5610 moves both columns monotonically to the ISA heights', () => {
    const { PL } = ctx();
    const model = PL.sims.barometer.free.createModel();
    model.altitude.value = 5610;
    var prevHg = model.hHg;
    var prevW = model.hW;
    var i;
    for (i = 0; i < 20 * 60; i++) {
      model.step(dt());
      assert.ok(model.hHg <= prevHg + 1e-12);
      assert.ok(model.hW <= prevW + 1e-12);
      prevHg = model.hHg;
      prevW = model.hW;
      if (model.settled.value) break;
    }
    assert.strictEqual(model.settled.value, true);
    assert.ok(Math.abs(model.hHg - 0.3732) < 0.001);
    assert.ok(Math.abs(model.hW - 5.074) < 0.005);
  });

  it('tilt 60 deg fills the mercury tube at hV 0.5000 m and hides force readout', () => {
    const { PL } = ctx();
    const model = PL.sims.barometer.free.createModel();
    model.tilt.value = 60;
    run(model, 8);
    var c = model.columns();
    assert.strictEqual(c.hg.full, true);
    assert.ok(Math.abs(c.hg.hV - 0.5) < 1e-4);
    assert.strictEqual(model.forceReadout(), null);
  });

  it('same step sequence is deterministic and activity presets are Properties', () => {
    const { PL } = ctx();
    function seq() {
      var m = PL.sims.barometer.free.createModel();
      m.altitude.value = 1200;
      m.tilt.value = 10;
      run(m, 2);
      return { hHg: m.hHg, hW: m.hW, tilt: m.tilt.value };
    }
    assert.deepStrictEqual(seq(), seq());
    var free = PL.sims.barometer.free.createModel();
    var def = PL.activities && PL.activities.barometer;
    load(files(['sims/barometer/activity.js']));
    const ctx2 = load(files(['sims/barometer/meta.js', 'sims/barometer/activity.js']));
    const def2 = ctx2.PL.activities.barometer;
    var j, ch;
    for (j = 0; j < def2.challenges.length; j++) {
      ch = def2.challenges[j];
      assert.ok(ctx2.PL.Activity.presetKeysValid(ch.preset, free), ch.id);
    }
  });
});

describe('barometer activity', () => {
  it('has five challenges covering every meta goal', () => {
    const { PL } = load(files(['sims/barometer/meta.js', 'sims/barometer/activity.js']));
    const def = PL.activities.barometer;
    assert.strictEqual(def.challenges.length, 5);
    var v = PL.Activity.validate(def);
    assert.ok(v.ok, v.errors.join(','));
    var cover = PL.Activity.coverGoals(def, PL.meta.barometer.goals);
    assert.ok(cover.ok, cover.errors.join(','));
    var i, ch;
    for (i = 0; i < def.challenges.length; i++) {
      ch = def.challenges[i];
      assert.ok(ch.answerIndex >= 0 && ch.answerIndex < ch.options.length);
      assert.ok(ch.goal >= 0 && ch.goal < PL.meta.barometer.goals.length);
    }
  });
});

describe('barometer smoke', () => {
  it('steps and free views draw without throwing', () => {
    const context = load(files([
      'sims/barometer/steps-view.js',
      'sims/barometer/free-view.js'
    ]));
    const PL = context.PL;
    const stage = context.document.createElement('div');
    const panel = context.document.createElement('div');
    const steps = PL.sims.barometer.steps.createModel();
    const sView = PL.sims.barometer.createStepsView(steps);
    sView.mount(stage, panel);
    var canvases = [];
    grabCanvases(stage, canvases);
    assert.ok(canvases.length >= 1);
    canvases[0].getContext = function () { return stubCtx(); };
    canvases[0].width = 400;
    canvases[0].height = 300;
    sView.layout(400, 300, 2);
    var phase;
    for (phase = 0; phase <= 4; phase++) {
      steps.phase = phase;
      steps.fill = phase >= 1 ? 1 : 0;
      steps.fingerT = phase >= 2 && phase < 4 ? 1 : 0;
      steps.invert = phase >= 3 ? 1 : 0;
      steps.h = phase >= 3 ? 1 : 0;
      steps.falling = false;
      steps.settled.value = false;
      assert.doesNotThrow(function () { sView.draw(); }, 'phase ' + phase);
    }
    steps.settled.value = true;
    steps.h = 0.76;
    steps.invert = 1;
    steps.fill = 1;
    steps.phase = 4;
    assert.doesNotThrow(function () { sView.draw(); }, 'settled');
    sView.dispose();

    const free = PL.sims.barometer.free.createModel();
    const fView = PL.sims.barometer.createFreeView(free);
    const stage2 = context.document.createElement('div');
    const panel2 = context.document.createElement('div');
    fView.mount(stage2, panel2);
    canvases = [];
    grabCanvases(stage2, canvases);
    assert.ok(canvases.length >= 1);
    canvases[0].getContext = function () { return stubCtx(); };
    canvases[0].width = 400;
    canvases[0].height = 300;
    fView.layout(400, 300, 2);
    free.tilt.value = 60;
    assert.doesNotThrow(function () { fView.draw(); }, 'free tilt 60');
    fView.dispose();
  });
});
