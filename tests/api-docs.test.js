'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { load, ROOT } = require('./helpers/load.js');

describe('API docs', () => {
  it('every key of PL.ui, PL.dialogs, PL.format and PL.shared.crystals appears in docs/API.md', () => {
    const { PL } = load(['shared/crystals/lattice.js']);
    const text = fs.readFileSync(path.join(ROOT, 'docs/API.md'), 'utf8');
    function check(obj) {
      var k;
      for (k in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
        assert.ok(text.indexOf(k) !== -1, 'docs/API.md missing ' + k);
      }
    }
    check(PL.ui);
    check(PL.dialogs);
    check(PL.format);
    check(PL.shared.crystals);
  });
});
