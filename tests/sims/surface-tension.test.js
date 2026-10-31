'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('../helpers/load.js');

function ctx() {
  return load(['sims/surface-tension/strings.js', 'sims/surface-tension/model.js']);
}

describe('surface-tension model', () => {
  it('surface molecule has inward net force, bulk is near zero', () => {
    const { PL } = ctx();
    const ST = PL.sims['surface-tension'];
    const surface = ST.neighborNet(0);
    const bulk = ST.neighborNet(3);
    assert.ok(surface.mag > 0.05, 'surface mag=' + surface.mag);
    assert.ok(surface.sy > 0, 'inward is +y');
    assert.ok(bulk.mag < 0.05, 'bulk mag=' + bulk.mag);
  });

  it('capillary height is inverse in radius and opposite for mercury', () => {
    const { PL } = ctx();
    const ST = PL.sims['surface-tension'];
    const h05 = ST.capHeightMm(0.5, 10, 'water');
    const h1 = ST.capHeightMm(1, 10, 'water');
    const h2 = ST.capHeightMm(2, 10, 'water');
    assert.ok(h05 > 0);
    assert.ok(Math.abs(h05 - 2 * h1) < 1e-9);
    assert.ok(Math.abs(h05 - 4 * h2) < 1e-9);
    const hg = ST.capHeightMm(0.5, 140, 'mercury');
    assert.ok(hg < 0);
    const expected = 2 * ST.LIQ.water.g * Math.cos(10 * Math.PI / 180) / (ST.LIQ.water.rho * ST.G * 0.0005) * 1000;
    assert.ok(Math.abs(h05 - expected) < 1e-9);
  });

  it('soap reduces lift and can sink a floating needle', () => {
    const { PL } = ctx();
    const ST = PL.sims['surface-tension'];
    assert.ok(Math.abs(ST.needleForce(false) - ST.needleForce(true) / ST.SOAP_FACTOR) < 1e-9);
    assert.strictEqual(ST.needleSinks(0.25, false), false);
    assert.strictEqual(ST.needleSinks(0.25, true), true);
    assert.strictEqual(ST.needleSinks(0.6, false), true);
    const F = 2 * ST.GAMMA0 * ST.NEEDLE_L * 1000;
    const Wt = 0.25 * 1e-3 * ST.G * 1000;
    assert.ok(Math.abs(ST.needleForce(false) - F) < 1e-9);
    assert.ok(Math.abs(ST.needleWeight(0.25) - Wt) < 1e-9);
  });

  it('adhesion maps to contact angle and drop presets', () => {
    const { PL } = ctx();
    const ST = PL.sims['surface-tension'];
    assert.ok(Math.abs(ST.thetaFromS(0.75) - 60) < 1e-6);
    assert.strictEqual(ST.thetaFromS(1), 0);
    const model = ST.createModel();
    model.applyDropPreset(30, false);
    assert.strictEqual(model.dropHg.value, false);
    assert.ok(Math.abs(model.adhesion.value - ST.sFromTheta(30)) < 1e-9);
    assert.ok(model.thetaFromAdhesion() < 90);
    model.applyDropPreset(140, true);
    assert.strictEqual(model.dropHg.value, true);
    assert.ok(model.thetaFromAdhesion() > 90);
  });

  it('Reset All restores defaults including needle and capillary heights', () => {
    const { PL } = ctx();
    const model = PL.sims['surface-tension'].createModel();
    model.depth.value = 0;
    model.cohesion.value = 2;
    model.allsurf.value = true;
    model.needleMass.value = 0.5;
    model.soap.value = true;
    model.needleAnim.sunk = true;
    model.needleAnim.y = 40;
    model.applyLiquid('mercury');
    model.capMode.value = 'compare';
    model.hcurW[0] = 12;
    model.reset();
    assert.strictEqual(model.depth.value, 3);
    assert.strictEqual(model.cohesion.value, 1);
    assert.strictEqual(model.allsurf.value, false);
    assert.strictEqual(model.needleMass.value, 0.25);
    assert.strictEqual(model.soap.value, false);
    assert.strictEqual(model.needleAnim.sunk, false);
    assert.strictEqual(model.needleAnim.y, 0);
    assert.strictEqual(model.liquid.value, 'water');
    assert.strictEqual(model.contactAngle.value, 10);
    assert.strictEqual(model.capMode.value, 'radii');
    assert.strictEqual(model.hcurW[0], 0);
  });
});
