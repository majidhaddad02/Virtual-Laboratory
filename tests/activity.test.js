'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { load, ROOT } = require('./helpers/load.js');

function simIds() {
  const simsDir = path.join(ROOT, 'sims');
  const names = fs.readdirSync(simsDir);
  const out = [];
  var i, p;
  for (i = 0; i < names.length; i++) {
    p = path.join(simsDir, names[i], 'activity.js');
    if (fs.existsSync(p)) out.push(names[i]);
  }
  return out;
}

function extras(id) {
  const files = [];
  if (id === 'crystalline' || id === 'crystalline-3d') files.push('shared/crystals/lattice.js');
  files.push('sims/' + id + '/meta.js');
  files.push('sims/' + id + '/strings.js');
  files.push('sims/' + id + '/model.js');
  if (id === 'barometer') files.push('sims/barometer/free-model.js');
  files.push('sims/' + id + '/activity.js');
  return files;
}

function goodChallenge(goal) {
  return {
    id: 'c' + goal,
    title: 't',
    question: 'q',
    options: ['a', 'b'],
    answerIndex: 0,
    goal: goal,
    experiment: 'e',
    explanation: 'x'
  };
}

describe('activity', () => {
  it('isCorrect and checkAnswer are pure', () => {
    const { PL } = load();
    const ch = {
      id: 'c1',
      title: 't',
      question: 'q',
      options: ['a', 'b', 'c'],
      answerIndex: 1,
      goal: 0,
      experiment: 'e',
      explanation: 'why'
    };
    assert.strictEqual(PL.Activity.isCorrect(ch, 1), true);
    assert.strictEqual(PL.Activity.isCorrect(ch, 0), false);
    assert.strictEqual(PL.Activity.isCorrect(ch, 2), false);
    const ok = PL.Activity.checkAnswer(ch, 1);
    assert.strictEqual(ok.correct, true);
    assert.strictEqual(ok.explanation, 'why');
    const bad = PL.Activity.checkAnswer(ch, 0);
    assert.strictEqual(bad.correct, false);
    assert.strictEqual(bad.selected, 0);
    assert.strictEqual(bad.answerIndex, 1);
  });

  it('validate accepts 1–5 challenges and rejects out-of-range answers', () => {
    const { PL } = load();
    const good = goodChallenge(0);
    assert.strictEqual(PL.Activity.validateChallenge(good).ok, true);
    assert.strictEqual(PL.Activity.validateChallenge({
      id: 'c1', title: 't', question: 'q', options: ['a'], answerIndex: 0, goal: 0, experiment: 'e', explanation: 'x'
    }).ok, false);
    assert.strictEqual(PL.Activity.validateChallenge({
      id: 'c1', title: 't', question: 'q', options: ['a', 'b'], answerIndex: 2, goal: 0, experiment: 'e', explanation: 'x'
    }).ok, false);
    assert.strictEqual(PL.Activity.validate({ challenges: [good] }).ok, true);
    assert.strictEqual(PL.Activity.validate({ challenges: [] }).ok, false);
    assert.strictEqual(PL.Activity.validate({
      challenges: [good, good, good, good, good, good]
    }).ok, false);
  });

  it('coverGoals requires every meta goal and in-range indices', () => {
    const { PL } = load();
    const goals = ['a', 'b', 'c'];
    const ok = PL.Activity.coverGoals({
      challenges: [goodChallenge(0), goodChallenge(1), goodChallenge(2)]
    }, goals);
    assert.strictEqual(ok.ok, true);
    const missing = PL.Activity.coverGoals({
      challenges: [goodChallenge(0), goodChallenge(1)]
    }, goals);
    assert.strictEqual(missing.ok, false);
    const oob = PL.Activity.coverGoals({
      challenges: [goodChallenge(0), goodChallenge(1), goodChallenge(3)]
    }, goals);
    assert.strictEqual(oob.ok, false);
  });

  it('applyPreset writes only Property fields', () => {
    const { PL } = load();
    const temperature = new PL.Property(10);
    const model = { temperature: temperature, reset: function () {}, step: function () {} };
    PL.Activity.applyPreset(model, { temperature: 80 });
    assert.strictEqual(model.temperature.value, 80);
    assert.strictEqual(PL.Activity.presetKeysValid({ temperature: 1 }, model), true);
    assert.strictEqual(PL.Activity.presetKeysValid({ nope: 1 }, model), false);
    assert.strictEqual(PL.Activity.presetKeysValid({ screen: 'free', temperature: 1 }, model), true);
    assert.strictEqual(PL.Activity.presetKeysValid({ screen: 'free', nope: 1 }, model), false);
  });

  it('every activity.js covers meta goals and preset keys are Properties', () => {
    const ids = simIds();
    assert.ok(ids.length >= 5, 'expected five activity files');
    var i, j, context, PL, def, v, cover, model, ch, known;
    known = { crystalline: 1, 'crystalline-3d': 1, hydrostatic: 1, 'u-tube': 1, 'surface-tension': 1 };
    for (i = 0; i < ids.length; i++) {
      context = load(extras(ids[i]));
      PL = context.PL;
      def = PL.activities[ids[i]];
      assert.ok(def, ids[i] + ' missing PL.activities entry');
      v = PL.Activity.validate(def);
      assert.ok(v.ok, ids[i] + ' ' + v.errors.join(','));
      if (known[ids[i]]) {
        assert.ok(def.challenges.length >= 3, ids[i] + ' challenges');
      }
      cover = PL.Activity.coverGoals(def, PL.meta[ids[i]].goals);
      assert.ok(cover.ok, ids[i] + ' goals ' + cover.errors.join(','));
      if (ids[i] === 'barometer') model = PL.sims.barometer.free.createModel();
      else model = PL.sims[ids[i]].createModel();
      for (j = 0; j < def.challenges.length; j++) {
        ch = def.challenges[j];
        assert.ok(PL.Activity.presetKeysValid(ch.preset, model), ids[i] + ' ' + ch.id + ' preset');
      }
    }
  });
});
