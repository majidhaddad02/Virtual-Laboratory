'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('../helpers/load.js');

describe('hydrostatic model', () => {
  it('P = P0 + rho*g*depth, same at A B C', () => {
    const { PL } = load(['sims/hydrostatic/model.js']);
    const H = PL.sims.hydrostatic;
    const model = H.createModel();
    const expected = H.Patm + 1000 * H.G * H.heightM(42);
    assert.strictEqual(model.pressurePa(), expected);
    assert.strictEqual(H.pressurePa(42, 1000), expected);
    const pA = model.pressurePa();
    const pB = model.pressurePa();
    const pC = model.pressurePa();
    assert.strictEqual(pA, pB);
    assert.strictEqual(pB, pC);
  });

  it('pressure depends on depth and density, not vessel shape', () => {
    const { PL } = load(['sims/hydrostatic/model.js']);
    const H = PL.sims.hydrostatic;
    const water = H.pressurePa(50, 1000);
    const oil = H.pressurePa(50, 800);
    const deep = H.pressurePa(70, 1000);
    assert.ok(oil < water);
    assert.ok(deep > water);
    assert.strictEqual(water, H.Patm + 1000 * H.G * H.heightM(50));
  });
});
