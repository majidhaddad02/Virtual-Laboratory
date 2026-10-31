'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('../helpers/load.js');

function ctx() {
  return load(['sims/crystalline-3d/model.js']);
}

describe('crystalline-3d model', () => {
  it('unit cell has 8 corners and 1 atom per cell', () => {
    const { PL } = ctx();
    const S = PL.sims['crystalline-3d'];
    assert.strictEqual(S.cellSites().length, 8);
    assert.strictEqual(S.CORNERS, 8);
    assert.strictEqual(S.ATOMS_PER_CELL, 1);
    const model = S.createModel({ rng: PL.math.mulberry32(1) });
    assert.strictEqual(model.getUnitCell().p.length, 8);
  });

  it('bulk coordination of simple cubic is 6', () => {
    const { PL } = ctx();
    const S = PL.sims['crystalline-3d'];
    const cry = PL.lattice.build(S.crystalSites(), 1.1);
    const idx = S.interiorIndex();
    assert.strictEqual(PL.lattice.coordination(cry, idx), S.BULK_COORD);
  });

  it('cell cycling visits all 27 cells', () => {
    const { PL } = ctx();
    const model = PL.sims['crystalline-3d'].createModel({ rng: PL.math.mulberry32(2) });
    model.cellIndex.value = 0;
    const seen = {};
    var i;
    for (i = 0; i < 27; i++) {
      seen[model.cellIndex.value] = true;
      model.nextCell();
    }
    assert.strictEqual(Object.keys(seen).length, 27);
    assert.strictEqual(model.cellIndex.value, 0);
  });
});
