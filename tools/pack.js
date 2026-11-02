#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

var ROOT = path.join(__dirname, '..');
var OUT = path.join(ROOT, 'dist/physics-lab.zip');

var SKIP_DIR = {
  '.git': 1,
  node_modules: 1,
  legacy: 1,
  tests: 1,
  tools: 1,
  dist: 1
};

var SKIP_FILE = {
  '.gitignore': 1,
  'css/phet.css': 1
};

var CRC_TABLE = (function () {
  var t = new Uint32Array(256);
  var n, c, k;
  for (n = 0; n < 256; n++) {
    c = n;
    for (k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  var c = 0xffffffff;
  var i;
  for (i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function posix(rel) {
  return rel.split(path.sep).join('/');
}

function shouldSkip(rel) {
  var parts = rel.split('/');
  var i;
  if (SKIP_FILE[rel]) return true;
  if (SKIP_DIR[parts[0]]) return true;
  for (i = 0; i < parts.length; i++) {
    if (parts[i].charAt(0) === '.') return true;
  }
  return false;
}

function walk(dir, acc, prefix) {
  var names = fs.readdirSync(dir);
  var i, name, rel, full, st;
  names.sort();
  for (i = 0; i < names.length; i++) {
    name = names[i];
    rel = prefix ? prefix + '/' + name : name;
    if (shouldSkip(rel)) continue;
    full = path.join(dir, name);
    st = fs.statSync(full);
    if (st.isDirectory()) walk(full, acc, rel);
    else if (st.isFile()) acc.push(rel);
  }
  return acc;
}

function listFiles() {
  return walk(ROOT, [], '');
}

function u16(n) {
  var b = Buffer.alloc(2);
  b.writeUInt16LE(n, 0);
  return b;
}

function u32(n) {
  var b = Buffer.alloc(4);
  b.writeUInt32LE(n, 0);
  return b;
}

function zipBuffer(files) {
  var locals = [];
  var centrals = [];
  var offset = 0;
  var i, rel, data, deflated, nameBuf, crc, local, central;
  for (i = 0; i < files.length; i++) {
    rel = files[i];
    data = fs.readFileSync(path.join(ROOT, rel));
    deflated = zlib.deflateRawSync(data);
    nameBuf = Buffer.from(rel, 'utf8');
    crc = crc32(data);
    local = Buffer.concat([
      u32(0x04034b50),
      u16(20),
      u16(0x0800),
      u16(8),
      u16(0),
      u16(0),
      u32(crc),
      u32(deflated.length),
      u32(data.length),
      u16(nameBuf.length),
      u16(0),
      nameBuf,
      deflated
    ]);
    central = Buffer.concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0x0800),
      u16(8),
      u16(0),
      u16(0),
      u32(crc),
      u32(deflated.length),
      u32(data.length),
      u16(nameBuf.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBuf
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  var centralBuf = Buffer.concat(centrals);
  var eocd = Buffer.concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralBuf.length),
    u32(offset),
    u16(0)
  ]);
  return Buffer.concat(locals.concat([centralBuf, eocd]));
}

function write(outPath) {
  var dest = outPath || OUT;
  var files = listFiles();
  var buf = zipBuffer(files);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return { out: dest, files: files, bytes: buf.length };
}

function main() {
  var result = write();
  console.log('wrote ' + path.relative(ROOT, result.out) + ' (' + result.files.length + ' files, ' + result.bytes + ' bytes)');
}

if (require.main === module) main();

module.exports = { listFiles: listFiles, write: write, OUT: OUT };
