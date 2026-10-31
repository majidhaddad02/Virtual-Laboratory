'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { ROOT } = require('./helpers/load.js');

function listSimIndex() {
  const simsDir = path.join(ROOT, 'sims');
  const out = [];
  const names = fs.readdirSync(simsDir);
  var i, p;
  for (i = 0; i < names.length; i++) {
    p = path.join(simsDir, names[i], 'index.html');
    if (fs.existsSync(p)) out.push(p);
  }
  return out;
}

describe('pages', () => {
  it('sim index pages load core in manifest order and have no modules or forbidden URLs', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'core/manifest.json'), 'utf8'));
    const pages = listSimIndex();
    assert.ok(pages.length >= 1);
    var i, j, html, src, expected, m, rel, abs;
    const srcRe = /<script\s+src="([^"]+)"/g;
    const urlRe = /https?:\/\//g;
    for (i = 0; i < pages.length; i++) {
      html = fs.readFileSync(pages[i], 'utf8');
      assert.ok(html.indexOf('type="module"') === -1, pages[i] + ' has module');
      const srcs = [];
      srcRe.lastIndex = 0;
      while ((m = srcRe.exec(html))) srcs.push(m[1]);
      expected = [];
      for (j = 0; j < manifest.length; j++) {
        expected.push('../../' + manifest[j]);
      }
      assert.deepStrictEqual(srcs.slice(0, expected.length), expected, pages[i] + ' core order');
      for (j = 0; j < srcs.length; j++) {
        src = srcs[j];
        if (/^(https?:)?\/\//.test(src)) {
          assert.fail('remote script ' + src);
        }
        rel = src;
        abs = path.normalize(path.join(path.dirname(pages[i]), rel));
        assert.ok(fs.existsSync(abs), 'missing ' + abs);
      }
      urlRe.lastIndex = 0;
      var u;
      while ((u = urlRe.exec(html))) {
        var slice = html.slice(u.index, u.index + 80);
        assert.ok(slice.indexOf('http://www.w3.org/2000/svg') !== -1, 'forbidden URL in ' + pages[i] + ': ' + slice);
      }
    }
  });

  it('source files outside tests/tools have no forbidden URLs', () => {
    function walk(dir, acc) {
      const names = fs.readdirSync(dir);
      var i, p, st;
      for (i = 0; i < names.length; i++) {
        if (names[i] === '.git' || names[i] === 'node_modules' || names[i] === '.opencode' || names[i] === '.monkeycode-tmp-files') continue;
        p = path.join(dir, names[i]);
        st = fs.statSync(p);
        if (st.isDirectory()) walk(p, acc);
        else if (/\.(js|html|css|md|json)$/.test(names[i])) acc.push(p);
      }
      return acc;
    }
    const files = walk(ROOT, []);
    var i, rel, text, m, slice;
    const urlRe = /https?:\/\//g;
    for (i = 0; i < files.length; i++) {
      rel = path.relative(ROOT, files[i]).replace(/\\/g, '/');
      if (rel.indexOf('tests/') === 0 || rel.indexOf('tools/') === 0) continue;
      if (rel.indexOf('docs/') === 0 || rel.indexOf('legacy/') === 0) continue;
      if (rel === 'package.json' || rel === 'AGENTS.md') continue;
      text = fs.readFileSync(files[i], 'utf8');
      urlRe.lastIndex = 0;
      while ((m = urlRe.exec(text))) {
        slice = text.slice(m.index, m.index + 80);
        assert.ok(
          slice.indexOf('http://www.w3.org/2000/svg') !== -1,
          'forbidden URL in ' + rel + ': ' + slice
        );
      }
    }
  });
});
