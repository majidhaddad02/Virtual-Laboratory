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
var scripts = manifest.map(function (f) {
  return '<script src="../../' + f + '"></script>';
}).join('\n');

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
  scripts,
  '<script src="../../data/registry.js"></script>',
  '<script src="strings.js"></script>',
  '<script src="model.js"></script>',
  '<script src="view.js"></script>',
  '<script src="main.js"></script>',
  '</body>',
  '</html>',
  ''
].join('\n');

var brief = [
  '# Sim brief: ' + id,
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

fs.mkdirSync(dir);
fs.writeFileSync(path.join(dir, 'index.html'), index);
fs.writeFileSync(path.join(dir, 'SIM-BRIEF.md'), brief);
fs.writeFileSync(path.join(dir, 'strings.js'), strings);
fs.writeFileSync(path.join(dir, 'model.js'), model);
fs.writeFileSync(path.join(dir, 'view.js'), view);
fs.writeFileSync(path.join(dir, 'main.js'), main);

console.log('created sims/' + id + '/');
console.log('add a registry entry in data/registry.js before opening the catalog card');
