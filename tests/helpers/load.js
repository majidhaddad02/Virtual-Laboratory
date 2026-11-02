'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '../..');

function stubDocument() {
  function el(tag) {
    var node = {
      tagName: String(tag).toUpperCase(),
      children: [],
      style: {},
      className: '',
      innerHTML: '',
      textContent: '',
      parentNode: null,
      attributes: {},
      setAttribute: function (k, v) { this.attributes[k] = v; },
      getAttribute: function (k) { return this.attributes[k]; },
      appendChild: function (c) {
        c.parentNode = this;
        this.children.push(c);
        return c;
      },
      insertBefore: function (c, ref) {
        c.parentNode = this;
        var i = ref ? this.children.indexOf(ref) : -1;
        if (i < 0) this.children.push(c);
        else this.children.splice(i, 0, c);
        return c;
      },
      addEventListener: function () {},
      removeEventListener: function () {},
      querySelectorAll: function () { return []; },
      querySelector: function () { return null; },
      getBoundingClientRect: function () {
        return { width: 200, height: 200, top: 0, left: 0 };
      },
      focus: function () {},
      getContext: function () {
        return {
          fillStyle: '',
          strokeStyle: '',
          globalAlpha: 1,
          lineWidth: 1,
          clearRect: function () {},
          beginPath: function () {},
          moveTo: function () {},
          lineTo: function () {},
          stroke: function () {},
          fill: function () {},
          arc: function () {},
          createRadialGradient: function () {
            return { addColorStop: function () {} };
          },
          createLinearGradient: function () {
            return { addColorStop: function () {} };
          },
          ellipse: function () {},
          save: function () {},
          restore: function () {},
          setLineDash: function () {},
          fillText: function () {},
          fillRect: function () {},
          strokeRect: function () {},
          closePath: function () {},
          clip: function () {}
        };
      }
    };
    Object.defineProperty(node, 'width', { value: 200, writable: true, configurable: true });
    Object.defineProperty(node, 'height', { value: 200, writable: true, configurable: true });
    return node;
  }
  var body = el('body');
  return {
    body: body,
    hidden: false,
    createElement: el,
    createTextNode: function (t) {
      return { nodeType: 3, textContent: String(t), data: String(t) };
    },
    addEventListener: function () {},
    removeEventListener: function () {}
  };
}

function load(extraRelativePaths) {
  extraRelativePaths = extraRelativePaths || [];
  var manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'core/manifest.json'), 'utf8'));
  var context = {
    console: console,
    Object: Object,
    Math: Math,
    Number: Number,
    String: String,
    Array: Array,
    JSON: JSON,
    parseFloat: parseFloat,
    parseInt: parseInt,
    isNaN: isNaN,
    Infinity: Infinity,
    NaN: NaN,
    Error: Error,
    TypeError: TypeError,
    Date: Date,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout
  };
  context.window = context;
  context.globalThis = context;
  context.document = stubDocument();
  vm.createContext(context);
  var files = manifest.concat(extraRelativePaths);
  var i, code, file;
  for (i = 0; i < files.length; i++) {
    file = files[i];
    code = fs.readFileSync(path.join(ROOT, file), 'utf8');
    vm.runInContext(code, context, { filename: file });
  }
  return context;
}

module.exports = { load: load, ROOT: ROOT };
