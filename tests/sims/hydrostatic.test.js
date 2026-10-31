'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('../helpers/load.js');

describe('hydrostatic model', () => {
  it('gauge pressure is proportional to depth', () => {
    const { PL } = load(['sims/hydrostatic/model.js']);
    const H = PL.sims.hydrostatic;
    const p0 = H.Patm;
    const shallow = H.pressurePa(30, 1000) - p0;
    const deep = H.pressurePa(60, 1000) - p0;
    assert.ok(Math.abs(deep - 2 * shallow) < 1e-9, 'deep=' + deep + ' 2*shallow=' + (2 * shallow));
  });

  it('gauge pressure is proportional to rho', () => {
    const { PL } = load(['sims/hydrostatic/model.js']);
    const H = PL.sims.hydrostatic;
    const p0 = H.Patm;
    const water = H.pressurePa(50, 1000) - p0;
    const oil = H.pressurePa(50, 800) - p0;
    assert.ok(Math.abs(oil / water - 800 / 1000) < 1e-9, 'oil=' + oil + ' water=' + water);
  });

  it('P at depth 0 equals P0', () => {
    const { PL } = load(['sims/hydrostatic/model.js']);
    const H = PL.sims.hydrostatic;
    assert.strictEqual(H.pressurePa(0, 1000), H.Patm);
    assert.strictEqual(H.pressurePa(0, 800), H.Patm);
    assert.strictEqual(H.pressurePa(0, 13600), H.Patm);
  });
});
