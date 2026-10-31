'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('./helpers/load.js');

describe('i18n', () => {
  it('interpolates params', () => {
    const { PL } = load();
    PL.i18n.add('fa', { 'ui.hello': 'سلام {name}' });
    assert.strictEqual(PL.t('ui.hello', { name: 'آوا' }), 'سلام آوا');
  });

  it('marks missing keys', () => {
    const { PL } = load();
    const warn = console.warn;
    let warned = false;
    console.warn = function () { warned = true; };
    try {
      assert.strictEqual(PL.t('no.such.key'), '⟦no.such.key⟧');
      assert.strictEqual(warned, true);
    } finally {
      console.warn = warn;
    }
  });
});
