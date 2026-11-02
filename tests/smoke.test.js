'use strict';

const { describe, it } = require('node:test');
const assert = require('assert');
const { load } = require('./helpers/load.js');

function stubCtx() {
  return new Proxy({}, {
    get: function (t, prop) {
      if (prop === 'createRadialGradient' || prop === 'createLinearGradient') {
        return function () {
          return { addColorStop: function () {} };
        };
      }
      if (typeof prop === 'symbol') return undefined;
      return function () { return t[prop]; };
    },
    set: function (t, prop, v) {
      t[prop] = v;
      return true;
    }
  });
}

describe('smoke', () => {
  it('crystalline view.draw does not throw', () => {
    const context = load([
      'data/registry.js',
      'shared/crystals/lattice.js',
      'sims/crystalline/strings.js',
      'sims/crystalline/model.js',
      'sims/crystalline/view.js'
    ]);
    const PL = context.PL;
    const model = PL.sims.crystalline.createModel({ rng: PL.math.mulberry32(1) });
    const view = PL.sims.crystalline.createView(model);
    const stage = context.document.createElement('div');
    const panel = context.document.createElement('div');
    view.mount(stage, panel);
    const canvases = [];
    function grab(node) {
      var i;
      if (node.tagName === 'CANVAS') canvases.push(node);
      if (node.children) {
        for (i = 0; i < node.children.length; i++) grab(node.children[i]);
      }
    }
    grab(stage);
    assert.ok(canvases.length >= 2, 'expected two canvases');
    canvases[0].getContext = function () { return stubCtx(); };
    canvases[1].getContext = function () { return stubCtx(); };
    canvases[0].width = 200;
    canvases[0].height = 200;
    canvases[1].width = 200;
    canvases[1].height = 200;
    view.layout(400, 300, 2);
    assert.doesNotThrow(function () { view.draw(); });
  });

  it('crystalline-3d view.draw does not throw', () => {
    const context = load([
      'data/registry.js',
      'shared/crystals/lattice.js',
      'sims/crystalline-3d/strings.js',
      'sims/crystalline-3d/model.js',
      'sims/crystalline-3d/view.js'
    ]);
    const PL = context.PL;
    const model = PL.sims['crystalline-3d'].createModel({ rng: PL.math.mulberry32(1) });
    const view = PL.sims['crystalline-3d'].createView(model);
    const stage = context.document.createElement('div');
    const panel = context.document.createElement('div');
    view.mount(stage, panel);
    const canvases = [];
    function grab(node) {
      var i;
      if (node.tagName === 'CANVAS') canvases.push(node);
      if (node.children) {
        for (i = 0; i < node.children.length; i++) grab(node.children[i]);
      }
    }
    grab(stage);
    assert.ok(canvases.length >= 3, 'expected three canvases');
    var i;
    for (i = 0; i < canvases.length; i++) {
      canvases[i].getContext = function () { return stubCtx(); };
      canvases[i].width = 200;
      canvases[i].height = 200;
    }
    view.layout(600, 300, 2);
    assert.doesNotThrow(function () { view.draw(); });
  });

  it('hydrostatic view.draw does not throw', () => {
    const context = load([
      'data/registry.js',
      'sims/hydrostatic/strings.js',
      'sims/hydrostatic/model.js',
      'sims/hydrostatic/view.js'
    ]);
    const PL = context.PL;
    const model = PL.sims.hydrostatic.createModel();
    const view = PL.sims.hydrostatic.createView(model);
    const stage = context.document.createElement('div');
    const panel = context.document.createElement('div');
    view.mount(stage, panel);
    const canvases = [];
    function grab(node) {
      var i;
      if (node.tagName === 'CANVAS') canvases.push(node);
      if (node.children) {
        for (i = 0; i < node.children.length; i++) grab(node.children[i]);
      }
    }
    grab(stage);
    assert.ok(canvases.length >= 1, 'expected canvas');
    canvases[0].getContext = function () { return stubCtx(); };
    canvases[0].width = 400;
    canvases[0].height = 300;
    view.layout(400, 300, 2);
    assert.doesNotThrow(function () { view.draw(); });
  });

  it('u-tube view.draw does not throw', () => {
    const context = load([
      'data/registry.js',
      'sims/u-tube/strings.js',
      'sims/u-tube/model.js',
      'sims/u-tube/view.js'
    ]);
    const PL = context.PL;
    const model = PL.sims['u-tube'].createModel();
    const view = PL.sims['u-tube'].createView(model);
    const stage = context.document.createElement('div');
    const panel = context.document.createElement('div');
    view.mount(stage, panel);
    const canvases = [];
    function grab(node) {
      var i;
      if (node.tagName === 'CANVAS') canvases.push(node);
      if (node.children) {
        for (i = 0; i < node.children.length; i++) grab(node.children[i]);
      }
    }
    grab(stage);
    assert.ok(canvases.length >= 1, 'expected canvas');
    canvases[0].getContext = function () { return stubCtx(); };
    canvases[0].width = 400;
    canvases[0].height = 300;
    view.layout(400, 300, 2);
    assert.doesNotThrow(function () { view.draw(); });
  });

  it('u-tube settle view.draw does not throw', () => {
    const context = load([
      'data/registry.js',
      'sims/u-tube/strings.js',
      'sims/u-tube/model.js',
      'sims/u-tube/view.js',
      'sims/u-tube/settle-model.js',
      'sims/u-tube/settle-view.js'
    ]);
    const PL = context.PL;
    const model = PL.sims['u-tube'].settle.createModel();
    const view = PL.sims['u-tube'].createSettleView(model);
    const stage = context.document.createElement('div');
    const panel = context.document.createElement('div');
    view.mount(stage, panel);
    const canvases = [];
    function grab(node) {
      var i;
      if (node.tagName === 'CANVAS') canvases.push(node);
      if (node.children) {
        for (i = 0; i < node.children.length; i++) grab(node.children[i]);
      }
    }
    grab(stage);
    assert.ok(canvases.length >= 1, 'expected canvas');
    canvases[0].getContext = function () { return stubCtx(); };
    canvases[0].width = 400;
    canvases[0].height = 300;
    view.layout(400, 300, 2);
    assert.doesNotThrow(function () { view.draw(); });
    view.dispose();
  });

  it('surface-tension view.draw does not throw', () => {
    const context = load([
      'data/registry.js',
      'sims/surface-tension/strings.js',
      'sims/surface-tension/model.js',
      'sims/surface-tension/view.js'
    ]);
    const PL = context.PL;
    const model = PL.sims['surface-tension'].createModel();
    var mode;
    for (mode = 0; mode < 5; mode++) {
      const view = PL.sims['surface-tension'].createView(model, mode);
      const stage = context.document.createElement('div');
      const panel = context.document.createElement('div');
      view.mount(stage, panel);
      const canvases = [];
      function grab(node) {
        var i;
        if (node.tagName === 'CANVAS') canvases.push(node);
        if (node.children) {
          for (i = 0; i < node.children.length; i++) grab(node.children[i]);
        }
      }
      grab(stage);
      assert.ok(canvases.length >= 1, 'mode ' + mode);
      var i;
      for (i = 0; i < canvases.length; i++) {
        canvases[i].getContext = function () { return stubCtx(); };
        canvases[i].width = 400;
        canvases[i].height = 300;
      }
      view.layout(400, 300, 2);
      assert.doesNotThrow(function () { view.draw(); }, 'mode ' + mode);
    }
  });
});
