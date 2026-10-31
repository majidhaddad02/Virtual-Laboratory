'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('../helpers/load.js');

function ctx() {
  return load(['shared/crystals/lattice.js', 'sims/crystalline/model.js']);
}

describe('crystalline model', () => {
  it('crystal and amorphous have equal site counts', () => {
    const { PL } = ctx();
    const rng = PL.math.mulberry32(1);
    const model = PL.sims.crystalline.createModel({ rng: rng });
    assert.strictEqual(model.getCrystal().p.length, PL.sims.crystalline.N);
    assert.strictEqual(model.getAmorphous().p.length, PL.sims.crystalline.N);
    assert.strictEqual(model.getCrystal().p.length, model.getAmorphous().p.length);
  });

  it('amorphous minimum distance is at least the measured packing floor', () => {
    // Seeds 1-20 (mulberry32): minD in [0.080985598369851, 0.08346923565931895], mean ~0.08248.
    // MIN_PLACE=0.66*D~0.06286, RELAX=0.88*D~0.08381. Floor is 0.90 of the measured minimum
    // so a packing regression fails; vibration can still go closer.
    const MEASURED_MIN = 0.080985598369851;
    const FLOOR = MEASURED_MIN * 0.90;
    const { PL } = ctx();
    var seed, sites, minD;
    for (seed = 1; seed <= 20; seed++) {
      sites = PL.sims.crystalline.amorphSites(PL.math.mulberry32(seed));
      minD = PL.sims.crystalline.minDistance(sites);
      assert.ok(
        minD + 1e-12 >= FLOOR,
        'seed=' + seed + ' minD=' + minD + ' floor=' + FLOOR
      );
    }
  });

  it('at T=0 displacement stays exactly 0', () => {
    const { PL } = ctx();
    const rng = PL.math.mulberry32(3);
    const model = PL.sims.crystalline.createModel({ rng: rng });
    model.temperature.value = 0;
    var i;
    for (i = 0; i < 200; i++) model.step(model.fixedDt);
    var p = model.getCrystal().p;
    for (i = 0; i < p.length; i++) {
      assert.strictEqual(p[i].dx, 0);
      assert.strictEqual(p[i].dy, 0);
    }
  });

  it('vibration rms scales with sqrt(T)', () => {
    const { PL } = ctx();
    function runAt(T, seed) {
      const model = PL.sims.crystalline.createModel({ rng: PL.math.mulberry32(seed) });
      model.temperature.value = T;
      var i;
      for (i = 0; i < 4000; i++) model.step(model.fixedDt);
      return model.rms('crystal');
    }
    const r25 = runAt(25, 11);
    const r100 = runAt(100, 11);
    assert.ok(r25 > 0 && r100 > 0, 'r25=' + r25 + ' r100=' + r100);
    const ratio = r100 / r25;
    assert.ok(Math.abs(ratio - 2) < 0.8, 'ratio=' + ratio);
  });
});
