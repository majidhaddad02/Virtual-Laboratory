'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('./helpers/load.js');

function make(PL, extras) {
  extras = extras || {};
  let steps = 0;
  const model = {
    fixedDt: extras.fixedDt || 1 / 60,
    timeBased: true,
    step: function () { steps++; }
  };
  const view = { draw: function () {} };
  const playing = new PL.Property(extras.playing !== false);
  const speed = new PL.Property(extras.speed != null ? extras.speed : 1);
  const loop = new PL.Loop({ model: model, view: view, playing: playing, speed: speed });
  return { loop: loop, playing: playing, steps: function () { return steps; } };
}

describe('Loop', () => {
  it('60 frames of 16.667 ms at speed 1 yield about 60 steps', () => {
    const { PL } = load();
    const x = make(PL);
    let i;
    for (i = 0; i < 60; i++) x.loop.tickForTest(16.667);
    assert.ok(Math.abs(x.steps() - 60) <= 2, 'steps=' + x.steps());
  });

  it('paused yields 0 steps', () => {
    const { PL } = load();
    const x = make(PL, { playing: false });
    let i;
    for (i = 0; i < 30; i++) x.loop.tickForTest(16.667);
    assert.strictEqual(x.steps(), 0);
  });

  it('stepOnce advances exactly one step', () => {
    const { PL } = load();
    const x = make(PL, { playing: false });
    x.loop.stepOnce();
    assert.strictEqual(x.steps(), 1);
  });

  it('speed 2 yields about double steps', () => {
    const { PL } = load();
    const a = make(PL, { speed: 1 });
    const b = make(PL, { speed: 2 });
    let i;
    for (i = 0; i < 30; i++) {
      a.loop.tickForTest(16.667);
      b.loop.tickForTest(16.667);
    }
    assert.ok(Math.abs(b.steps() - a.steps() * 2) <= 3, 'a=' + a.steps() + ' b=' + b.steps());
  });

  it('clamps a 2 s frame', () => {
    const { PL } = load();
    const x = make(PL);
    x.loop.tickForTest(2000);
    assert.ok(x.steps() <= 8, 'steps=' + x.steps());
    assert.ok(x.steps() >= 1, 'steps=' + x.steps());
  });
});
