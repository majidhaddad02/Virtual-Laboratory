'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('../helpers/load.js');

function ctx() {
  return load(['sims/u-tube/strings.js', 'sims/u-tube/model.js']);
}

function connectingSpan(model) {
  var left = model.left();
  var right = model.right();
  var hL = left[0] ? left[0].h : 0;
  var hR = right[0] ? right[0].h : 0;
  return Math.min(hL, hR);
}

function heights(model) {
  function arm(a) {
    return a.map(function (x) { return x.h; });
  }
  return { L: arm(model.left()), R: arm(model.right()) };
}

describe('u-tube model', () => {
  it('same connected fluid at several elevations has equal pressure', () => {
    const { PL } = ctx();
    var i, y, span, levels;
    for (i = 0; i < 3; i++) {
      const model = PL.sims['u-tube'].createModel();
      model.caseIndex.value = i;
      span = connectingSpan(model);
      levels = [0, span * 0.25, span * 0.5, span * 0.75];
      assert.ok(span > 1, 'case ' + i + ' connecting span');
      for (y of levels) {
        assert.strictEqual(model.fluidAt('L', y), model.connectingId(), 'case ' + i + ' L y=' + y);
        assert.strictEqual(model.fluidAt('R', y), model.connectingId(), 'case ' + i + ' R y=' + y);
        assert.ok(
          Math.abs(model.pressAt('L', y) - model.pressAt('R', y)) < 1e-6,
          'case ' + i + ' y=' + y + ' L=' + model.pressAt('L', y) + ' R=' + model.pressAt('R', y)
        );
      }
    }
  });

  it('changing g scales pressures but leaves layer heights unchanged', () => {
    const { PL } = ctx();
    var i;
    for (i = 0; i < 3; i++) {
      const model = PL.sims['u-tube'].createModel();
      model.caseIndex.value = i;
      model.g.value = 9.8;
      const h0 = heights(model);
      const pL = model.pressAt('L', 0);
      const pR = model.pressAt('R', 0);
      model.g.value = 10;
      const h1 = heights(model);
      assert.deepStrictEqual(h1, h0, 'case ' + i + ' heights');
      const scale = 10 / 9.8;
      const atm = PL.sims['u-tube'].PATM;
      assert.ok(Math.abs((model.pressAt('L', 0) - atm) - (pL - atm) * scale) < 1e-6, 'case ' + i + ' L');
      assert.ok(Math.abs((model.pressAt('R', 0) - atm) - (pR - atm) * scale) < 1e-6, 'case ' + i + ' R');
    }
  });

  it('sum of rho g h above the join is equal in both arms', () => {
    const { PL } = ctx();
    const U = PL.sims['u-tube'];
    var i;
    for (i = 0; i < 3; i++) {
      const model = U.createModel();
      model.caseIndex.value = i;
      const sL = model.columnSum('L', 0);
      const sR = model.columnSum('R', 0);
      assert.ok(Math.abs(sL - sR) < 1e-6, 'case ' + i + ' sL=' + sL + ' sR=' + sR);
    }
  });

  it('case builders conserve liquid volume', () => {
    const { PL } = ctx();
    const U = PL.sims['u-tube'];
    const one = U.buildOne();
    assert.strictEqual(U.volumeOf(one.L, one.R, 'w'), 36);
    const two = U.buildTwo();
    assert.ok(Math.abs(U.volumeOf(two.L, two.R, 'w') - 24) < 1e-9);
    assert.ok(Math.abs(U.volumeOf(two.L, two.R, 'o') - 10) < 1e-9);
    const three = U.buildThree();
    assert.ok(Math.abs(U.volumeOf(three.L, three.R, 'gy') - 20) < 1e-9);
    assert.ok(Math.abs(U.volumeOf(three.L, three.R, 'o') - 8) < 1e-9);
    assert.ok(Math.abs(U.volumeOf(three.L, three.R, 'w') - 10) < 1e-9);
  });

  it('water/oil/glycerin heights satisfy density relations', () => {
    const { PL } = ctx();
    const U = PL.sims['u-tube'];
    const two = U.buildTwo();
    const dhOil = two.L[1].h;
    const hWL = two.L[0].h;
    const hWR = two.R[0].h;
    assert.ok(Math.abs(U.LIQ.w.rho * (hWR - hWL) - U.LIQ.o.rho * dhOil) < 1e-6);
    const three = U.buildThree();
    const hGyL = three.L[0].h;
    const hGyR = three.R[0].h;
    const hOil = three.L[1].h;
    const hW = three.R[1].h;
    const left = U.LIQ.gy.rho * hGyL + U.LIQ.o.rho * hOil;
    const right = U.LIQ.gy.rho * hGyR + U.LIQ.w.rho * hW;
    assert.ok(Math.abs(left - right) < 1e-6);
  });

  it('unknown height from the equation equals the model height', () => {
    const { PL } = ctx();
    var i, y, span;
    for (i = 0; i < 3; i++) {
      const model = PL.sims['u-tube'].createModel();
      model.caseIndex.value = i;
      span = connectingSpan(model);
      y = span * 0.4;
      const atJoin = model.solveUnknown();
      const atY = model.solveUnknown(y);
      assert.ok(atJoin != null, 'case ' + i);
      assert.ok(Math.abs(atJoin - model.unkH()) < 1e-6, 'case ' + i + ' y=0 solved=' + atJoin + ' unk=' + model.unkH());
      assert.ok(Math.abs(atY - model.unkH()) < 1e-6, 'case ' + i + ' y=' + y + ' solved=' + atY + ' unk=' + model.unkH());
    }
  });

  it('exactly one equation term is the unknown at valid reference levels', () => {
    const { PL } = ctx();
    const U = PL.sims['u-tube'];
    var i, y, span, levels, tL, tR, n;
    for (i = 0; i < 3; i++) {
      const model = U.createModel();
      model.caseIndex.value = i;
      span = connectingSpan(model);
      levels = [0, span * 0.4];
      for (y of levels) {
        tL = model.equationTerms('L', y);
        tR = model.equationTerms('R', y);
        n = U.unknownTermCount(tL, tR);
        assert.strictEqual(n, 1, 'case ' + i + ' y=' + y + ' count=' + n);
      }
    }
  });

  it('rejects same height in different liquids', () => {
    const { PL } = ctx();
    const model = PL.sims['u-tube'].createModel();
    model.caseIndex.value = 1;
    const yOil = model.left()[0].h + 1;
    model.setRef(yOil);
    model.phase.value = 2;
    model.setPoint('L');
    model.setPoint('R');
    model.compare();
    assert.strictEqual(model.valid.value, false);
  });
});
