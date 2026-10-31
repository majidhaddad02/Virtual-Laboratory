'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('./helpers/load.js');

describe('format', () => {
  it('formats Persian digits and separators', () => {
    const { PL } = load();
    assert.strictEqual(PL.format.num(1.5, 1), '۱٫۵');
    assert.strictEqual(PL.format.num(-2, 0), '−۲');
    assert.strictEqual(PL.format.parseNum('۱٫۵'), 1.5);
  });
});
