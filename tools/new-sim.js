#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var id = process.argv[2];

if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) {
  console.error('usage: node tools/new-sim.js <id>');
  console.error('id: lowercase letters, digits, hyphen; must start with a letter');
  process.exit(1);
}

var dir = path.join(ROOT, 'sims', id);
if (fs.existsSync(dir)) {
  console.error('already exists: sims/' + id);
  process.exit(1);
}

var manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'core/manifest.json'), 'utf8'));
var coreTags = ['<!-- core:start -->'].concat(manifest.map(function (f) {
  return '<script src="../../' + f + '"></script>';
})).concat(['<!-- core:end -->']).join('\n');

var nextOrder = 1;
var simsDir = path.join(ROOT, 'sims');
var names = fs.readdirSync(simsDir);
var i, metaPath, txt, m;
for (i = 0; i < names.length; i++) {
  metaPath = path.join(simsDir, names[i], 'meta.js');
  if (!fs.existsSync(metaPath)) continue;
  txt = fs.readFileSync(metaPath, 'utf8');
  m = txt.match(/order:\s*(\d+)/);
  if (m) nextOrder = Math.max(nextOrder, Number(m[1]) + 1);
}

var index = [
  '<!DOCTYPE html>',
  '<html lang="fa" dir="rtl">',
  '<head>',
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1">',
  '<title>' + id + '</title>',
  '<link rel="stylesheet" href="../../css/tokens.css">',
  '<link rel="stylesheet" href="../../css/shell.css">',
  '</head>',
  '<body>',
  coreTags,
  '<!-- shared:start -->',
  '<!-- shared:end -->',
  '<script src="../../data/registry.js"></script>',
  '<!-- sim:start -->',
  '<script src="strings.js"></script>',
  '<script src="model.js"></script>',
  '<script src="view.js"></script>',
  '<script src="main.js"></script>',
  '<!-- sim:end -->',
  '</body>',
  '</html>',
  ''
].join('\n');

var brief = [
  '# ' + id,
  '',
  '1. Learning goals (3, Persian in the registry):',
  '   - ',
  '   - ',
  '   - ',
  '2. Model assumptions and validity range:',
  '   - ',
  '3. Controls (each a Property) and Reset All:',
  '   - ',
  '4. Screens:',
  '   - one screen unless modes are different experiments',
  '5. Representations (canvas, gauges, equation) and sync:',
  '   - ',
  ''
].join('\n');

var strings = [
  '(function (PL) {',
  "  PL.i18n.add('fa', {",
  "    'sim." + id + ".screen': '" + id + "',",
  "    'sim." + id + ".canvas': '" + id + "'",
  '  });',
  '})(window.PL = window.PL || {});',
  ''
].join('\n');

var model = [
  '(function (PL) {',
  '  function createModel() {',
  '    return {',
  '      timeBased: false,',
  '      step: function () {},',
  '      reset: function () {}',
  '    };',
  '  }',
  '  PL.sims = PL.sims || {};',
  "  PL.sims['" + id + "'] = { createModel: createModel };",
  '})(window.PL = window.PL || {});',
  ''
].join('\n');

var view = [
  '(function (PL) {',
  '  function createView(model) {',
  '    var canvas;',
  '    return {',
  '      mount: function (stage, panel) {',
  '        stage.innerHTML = \'\';',
  '        panel.innerHTML = \'\';',
  '        canvas = document.createElement(\'canvas\');',
  "        canvas.setAttribute('aria-label', PL.t('sim." + id + ".canvas'));",
  '        stage.appendChild(canvas);',
  '      },',
  '      layout: function (w, h, dpr) {',
  '        if (!canvas) return;',
  '        var r = canvas.getBoundingClientRect();',
  '        PL.draw.fitCanvas(canvas, r.width, r.height, dpr);',
  '      },',
  '      draw: function () {',
  '        if (!canvas) return;',
  '        var ctx = canvas.getContext(\'2d\');',
  '        ctx.clearRect(0, 0, canvas.width, canvas.height);',
  '      },',
  '      reset: function () {},',
  '      dispose: function () { canvas = null; }',
  '    };',
  '  }',
  '  PL.sims = PL.sims || {};',
  "  PL.sims['" + id + "'] = PL.sims['" + id + "'] || {};",
  "  PL.sims['" + id + "'].createView = createView;",
  '})(window.PL = window.PL || {});',
  ''
].join('\n');

var main = [
  '(function (PL) {',
  "  var ICON = '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"8\" fill=\"#521764\"/></svg>';",
  '  PL.Shell.start({',
  "    id: '" + id + "',",
  '    screens: [{',
  "      id: 'main',",
  "      title: 'sim." + id + ".screen',",
  '      icon: ICON,',
  '      createModel: function () {',
  "        return PL.sims['" + id + "'].createModel();",
  '      },',
  '      createView: function (model) {',
  "        return PL.sims['" + id + "'].createView(model);",
  '      }',
  '    }]',
  '  }, document.body);',
  '})(window.PL);',
  ''
].join('\n');

var meta = [
  '(function (PL) {',
  '  PL.meta = PL.meta || {};',
  "  PL.meta['" + id + "'] = {",
  "    id: '" + id + "',",
  "    title: '" + id + "',",
  "    topics: ['molecular'],",
  "    level: 'grade10',",
  '    goals: [',
  "      'هدف ۱',",
  "      'هدف ۲',",
  "      'هدف ۳'",
  '    ],',
  '    modelNotes: [',
  "      'فرض مدل را اینجا بنویسید.'",
  '    ],',
  "    status: 'draft',",
  "    version: '0.1.0',",
  '    order: ' + nextOrder + ',',
  "    path: 'sims/" + id + "/index.html',",
  '    tags: [],',
  "    curriculum: { grade: '', chapter: '' }",
  '  };',
  '})(window.PL = window.PL || {});',
  ''
].join('\n');

var thumb = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#cfe9f8"/><circle cx="160" cy="100" r="36" fill="#521764"/></svg>\n';

var test = [
  "'use strict';",
  '',
  "const { describe, it } = require('node:test');",
  "const assert = require('assert');",
  "const { load } = require('../helpers/load.js');",
  '',
  "describe('" + id + " model', () => {",
  "  it('createModel returns a resettable model', () => {",
  "    const { PL } = load(['sims/" + id + "/model.js']);",
  "    const model = PL.sims['" + id + "'].createModel();",
  '    assert.ok(model);',
  "    assert.strictEqual(typeof model.reset, 'function');",
  '    model.reset();',
  '  });',
  '});',
  ''
].join('\n');

fs.mkdirSync(dir);
fs.mkdirSync(path.join(ROOT, 'docs/sims'), { recursive: true });
fs.writeFileSync(path.join(dir, 'index.html'), index);
fs.writeFileSync(path.join(ROOT, 'docs/sims', id + '.md'), brief);
fs.writeFileSync(path.join(dir, 'strings.js'), strings);
fs.writeFileSync(path.join(dir, 'model.js'), model);
fs.writeFileSync(path.join(dir, 'view.js'), view);
fs.writeFileSync(path.join(dir, 'main.js'), main);
fs.writeFileSync(path.join(dir, 'meta.js'), meta);
fs.writeFileSync(path.join(dir, 'thumb.svg'), thumb);
fs.writeFileSync(path.join(ROOT, 'tests/sims', id + '.test.js'), test);

require('./build-registry.js').write();
require('./sync-pages.js').sync();

console.log('created sims/' + id + '/');
