#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var START = '<!-- core:start -->';
var END = '<!-- core:end -->';

function manifest() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'core/manifest.json'), 'utf8'));
}

function coreBlock(prefix) {
  var files = manifest();
  var lines = [START];
  var i;
  for (i = 0; i < files.length; i++) {
    lines.push('<script src="' + prefix + files[i] + '"></script>');
  }
  lines.push(END);
  return lines.join('\n');
}

function listPages() {
  var pages = [{ file: path.join(ROOT, 'index.html'), prefix: '' }];
  var simsDir = path.join(ROOT, 'sims');
  var names = fs.readdirSync(simsDir);
  var i, p;
  for (i = 0; i < names.length; i++) {
    p = path.join(simsDir, names[i], 'index.html');
    if (fs.existsSync(p)) pages.push({ file: p, prefix: '../../' });
  }
  return pages;
}

function rewriteHtml(html, prefix) {
  var i0 = html.indexOf(START);
  var i1 = html.indexOf(END);
  if (i0 === -1 || i1 === -1 || i1 < i0) {
    throw new Error('missing core markers');
  }
  var before = html.slice(0, i0);
  var after = html.slice(i1 + END.length);
  return before + coreBlock(prefix) + after;
}

function sync() {
  var pages = listPages();
  var i, html, next, rel;
  for (i = 0; i < pages.length; i++) {
    html = fs.readFileSync(pages[i].file, 'utf8');
    rel = path.relative(ROOT, pages[i].file);
    try {
      next = rewriteHtml(html, pages[i].prefix);
    } catch (err) {
      throw new Error(rel + ': ' + err.message);
    }
    if (next !== html) fs.writeFileSync(pages[i].file, next);
  }
}

function check() {
  var pages = listPages();
  var i, html, next, rel;
  var ok = true;
  for (i = 0; i < pages.length; i++) {
    html = fs.readFileSync(pages[i].file, 'utf8');
    rel = path.relative(ROOT, pages[i].file);
    try {
      next = rewriteHtml(html, pages[i].prefix);
    } catch (err) {
      console.error('run npm run sync-pages');
      console.error(rel + ': ' + err.message);
      process.exitCode = 1;
      return;
    }
    if (next !== html) {
      console.error('run npm run sync-pages');
      ok = false;
    }
  }
  if (!ok) process.exitCode = 1;
}

function main() {
  if (process.argv.indexOf('--check') !== -1) {
    check();
    if (process.exitCode) process.exit(process.exitCode);
    return;
  }
  sync();
}

if (require.main === module) main();

module.exports = { sync: sync, check: check, coreBlock: coreBlock };
