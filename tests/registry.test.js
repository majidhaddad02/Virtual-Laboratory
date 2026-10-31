'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { load, ROOT } = require('./helpers/load.js');
const builder = require('../tools/build-registry.js');

const REQUIRED = ['id', 'title', 'topics', 'level', 'goals', 'modelNotes', 'status', 'version', 'order', 'thumbnail', 'path'];

describe('registry', () => {
  it('ids unique, fields present, topics exist, files exist', () => {
    const ctx = load(['data/topics.js', 'data/registry.js']);
    const PL = ctx.PL;
    const ids = {};
    const topicIds = {};
    var i, j, e;
    for (i = 0; i < PL.topics.length; i++) topicIds[PL.topics[i].id] = true;
    for (i = 0; i < PL.registry.length; i++) {
      e = PL.registry[i];
      for (j = 0; j < REQUIRED.length; j++) {
        assert.ok(e[REQUIRED[j]] != null, 'missing ' + REQUIRED[j] + ' on ' + e.id);
      }
      assert.ok(!ids[e.id], 'duplicate id ' + e.id);
      ids[e.id] = true;
      assert.ok(e.goals.length >= 1, 'empty goals ' + e.id);
      assert.ok(String(e.thumbnail).indexOf('<svg') === 0, 'thumbnail ' + e.id);
      for (j = 0; j < e.topics.length; j++) {
        assert.ok(topicIds[e.topics[j]], 'unknown topic ' + e.topics[j]);
      }
      assert.ok(fs.existsSync(path.join(ROOT, e.path)), 'missing path ' + e.path);
    }
  });

  it('committed registry matches the builder', () => {
    const result = builder.build();
    assert.deepStrictEqual(result.errors, []);
    const current = fs.readFileSync(path.join(ROOT, 'data/registry.js'), 'utf8');
    assert.strictEqual(current, result.code, 'run npm run build-registry');
  });
});
