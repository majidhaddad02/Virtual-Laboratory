'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('./helpers/load.js');

describe('Property', () => {
  it('link calls immediately', () => {
    const { PL } = load();
    const p = new PL.Property(3);
    let seen = null;
    p.link(function (v) { seen = v; });
    assert.strictEqual(seen, 3);
  });

  it('lazyLink does not call immediately', () => {
    const { PL } = load();
    const p = new PL.Property(3);
    let called = false;
    p.lazyLink(function () { called = true; });
    assert.strictEqual(called, false);
    p.value = 4;
    assert.strictEqual(called, true);
  });

  it('does not notify if value is unchanged', () => {
    const { PL } = load();
    const p = new PL.Property(1);
    let n = 0;
    p.lazyLink(function () { n++; });
    p.value = 1;
    assert.strictEqual(n, 0);
    p.value = 2;
    assert.strictEqual(n, 1);
  });

  it('reset restores initial', () => {
    const { PL } = load();
    const p = new PL.Property(10);
    p.value = 99;
    p.reset();
    assert.strictEqual(p.value, 10);
  });

  it('derive updates when a dep changes', () => {
    const { PL } = load();
    const a = new PL.Property(2);
    const b = new PL.Property(3);
    const s = PL.derive([a, b], function (x, y) { return x + y; });
    assert.strictEqual(s.value, 5);
    a.value = 7;
    assert.strictEqual(s.value, 10);
  });
});
