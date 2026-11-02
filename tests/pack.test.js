'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const pack = require('../tools/pack.js');

describe('pack', () => {
  it('lists runtime files and omits legacy, tests, and tools', () => {
    const files = pack.listFiles();
    const set = {};
    var i;
    for (i = 0; i < files.length; i++) set[files[i]] = true;
    assert.ok(set['index.html']);
    assert.ok(set['css/tokens.css']);
    assert.ok(set['core/activity.js']);
    assert.ok(set['fonts/Vazirmatn-Regular.woff2']);
    assert.ok(set['fonts/Vazirmatn-Bold.woff2']);
    assert.ok(set['data/registry.js']);
    assert.ok(!set['css/phet.css']);
    for (i = 0; i < files.length; i++) {
      assert.ok(files[i].indexOf('legacy/') !== 0, files[i]);
      assert.ok(files[i].indexOf('tests/') !== 0, files[i]);
      assert.ok(files[i].indexOf('tools/') !== 0, files[i]);
      assert.ok(files[i].indexOf('dist/') !== 0, files[i]);
      assert.ok(files[i].indexOf('.git') !== 0, files[i]);
    }
  });

  it('writes a zip with local index and fonts', () => {
    const dest = path.join(os.tmpdir(), 'physics-lab-pack-test.zip');
    const result = pack.write(dest);
    assert.ok(fs.existsSync(dest));
    const buf = fs.readFileSync(dest);
    assert.strictEqual(buf[0], 0x50);
    assert.strictEqual(buf[1], 0x4b);
    const zipText = buf.toString('binary');
    assert.ok(zipText.indexOf('index.html') !== -1);
    assert.ok(zipText.indexOf('fonts/Vazirmatn-Regular.woff2') !== -1);
    assert.ok(zipText.indexOf('legacy/') === -1);
    assert.strictEqual(result.files.length, pack.listFiles().length);
  });
});
