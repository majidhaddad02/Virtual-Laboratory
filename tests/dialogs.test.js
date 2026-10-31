'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('./helpers/load.js');

describe('dialogs', () => {
  it('nextFocusIndex wraps Tab and Shift+Tab', () => {
    const { PL } = load();
    assert.strictEqual(PL.dialogs.nextFocusIndex(0, 3, false), 1);
    assert.strictEqual(PL.dialogs.nextFocusIndex(2, 3, false), 0);
    assert.strictEqual(PL.dialogs.nextFocusIndex(0, 3, true), 2);
    assert.strictEqual(PL.dialogs.nextFocusIndex(1, 3, true), 0);
    assert.strictEqual(PL.dialogs.nextFocusIndex(0, 0, false), 0);
    assert.strictEqual(PL.dialogs.nextFocusIndex(0, 1, false), 0);
    assert.strictEqual(PL.dialogs.nextFocusIndex(0, 1, true), 0);
  });

  it('shouldClose accepts Escape', () => {
    const { PL } = load();
    assert.strictEqual(PL.dialogs.shouldClose('Escape'), true);
    assert.strictEqual(PL.dialogs.shouldClose('Esc'), true);
    assert.strictEqual(PL.dialogs.shouldClose('Enter'), false);
    assert.strictEqual(PL.dialogs.shouldClose('Tab'), false);
  });
});
