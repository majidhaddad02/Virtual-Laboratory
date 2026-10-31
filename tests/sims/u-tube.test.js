'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('../helpers/load.js');

function ctx() {
  return load(['sims/u-tube/strings.js', 'sims/u-tube/model.js']);
}

describe('u-tube model', () => {
  it('same connected fluid at same elevation has equal pressure', () => {
    const { PL } = ctx();
    const model = PL.sims['u-tube'].createModel();
    model.caseIndex.value = 1;
    const y = 0;
    assert.strictEqual(model.connectingId(), 'w');
    assert.strictEqual(model.fluidAt('L', y), 'w');
    assert.strictEqual(model.fluidAt('R', y), 'w');
    assert.ok(Math.abs(model.pressAt('L', y) - model.pressAt('R', y)) < 1e-6);
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
    var i;
    for (i = 0; i < 3; i++) {
      const model = PL.sims['u-tube'].createModel();
      model.caseIndex.value = i;
      const solved = model.solveUnknown();
      assert.ok(solved != null, 'case ' + i);
      assert.ok(Math.abs(solved - model.unkH()) < 1e-6, 'case ' + i + ' solved=' + solved + ' unk=' + model.unkH());
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
