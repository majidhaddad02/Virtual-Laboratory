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

function scripts(html) {
  const srcRe = /<script\s+src="([^"]+)"/g;
  const srcs = [];
  var m;
  srcRe.lastIndex = 0;
  while ((m = srcRe.exec(html))) srcs.push(m[1]);
  return srcs;
}

function between(html, start, end) {
  var i0 = html.indexOf(start);
  var i1 = html.indexOf(end);
  assert.ok(i0 !== -1 && i1 !== -1 && i1 > i0, 'run npm run sync-pages');
  return html.slice(i0, i1 + end.length);
}

describe('pages', () => {
  it('sim index pages load core in manifest order and have no modules or forbidden URLs', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'core/manifest.json'), 'utf8'));
    const pages = listSimIndex();
    assert.ok(pages.length >= 1);
    var i, j, html, src, expected, rel, abs, coreHtml, sharedHtml, simHtml, srcs, coreSrcs, sharedSrcs;
    const urlRe = /https?:\/\//g;
    for (i = 0; i < pages.length; i++) {
      html = fs.readFileSync(pages[i], 'utf8');
      assert.ok(html.indexOf('type="module"') === -1, pages[i] + ' has module');
      srcs = scripts(html);
      expected = [];
      for (j = 0; j < manifest.length; j++) expected.push('../../' + manifest[j]);
      coreHtml = between(html, '<!-- core:start -->', '<!-- core:end -->');
      coreSrcs = scripts(coreHtml);
      assert.deepStrictEqual(coreSrcs, expected, pages[i] + ': run npm run sync-pages');
      sharedHtml = between(html, '<!-- shared:start -->', '<!-- shared:end -->');
      sharedSrcs = scripts(sharedHtml);
      for (j = 0; j < sharedSrcs.length; j++) {
        abs = path.normalize(path.join(path.dirname(pages[i]), sharedSrcs[j]));
        assert.ok(fs.existsSync(abs), 'missing shared ' + abs);
        assert.ok(sharedSrcs[j].indexOf('../../shared/') === 0, pages[i] + ' shared path');
      }
      simHtml = between(html, '<!-- sim:start -->', '<!-- sim:end -->');
      var corePos = html.indexOf('<!-- core:start -->');
      var sharedPos = html.indexOf('<!-- shared:start -->');
      var simPos = html.indexOf('<!-- sim:start -->');
      assert.ok(corePos < sharedPos && sharedPos < simPos, pages[i] + ' marker order');
      if (sharedSrcs.length) {
        var stringsIdx = srcs.indexOf('strings.js');
        var lastShared = srcs.indexOf(sharedSrcs[sharedSrcs.length - 1]);
        assert.ok(lastShared !== -1 && stringsIdx !== -1 && lastShared < stringsIdx, pages[i] + ' shared before strings.js');
      }
      for (j = 0; j < srcs.length; j++) {
        src = srcs[j];
        if (/^(https?:)?\/\//.test(src)) assert.fail('remote script ' + src);
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

  it('catalog core tags match the manifest', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'core/manifest.json'), 'utf8'));
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const coreHtml = between(html, '<!-- core:start -->', '<!-- core:end -->');
    const expected = manifest.map(function (f) { return f; });
    assert.deepStrictEqual(scripts(coreHtml), expected, 'run npm run sync-pages');
    assert.ok(html.indexOf('data/topics.js') !== -1);
    assert.ok(html.indexOf('data/registry.js') !== -1);
    assert.ok(html.indexOf('data/topics.js') < html.indexOf('data/registry.js'));
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
