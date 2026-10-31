(function (PL) {
  function createView(model) {
    var stageEl, panelEl, c1, c2, widgets, barFill;
    var layoutW = 1, layoutH = 1, layoutDpr = 1;

    function makeCanvas(labelKey) {
      var canvas = document.createElement('canvas');
      canvas.setAttribute('aria-label', PL.t(labelKey));
      return canvas;
    }

    function paint(canvas, sys, color, dark) {
      var ctx = canvas.getContext('2d');
      var W = canvas.width;
      var H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      var S = Math.min(W, H) * 0.92;
      var ox = (W - S) / 2;
      var oy = (H - S) / 2;
      var i, a, b, q, x, y, r, g;
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      if (model.showBonds.value) {
        ctx.globalAlpha = 0.38;
        ctx.lineWidth = Math.max(1.5, W / 240);
        ctx.beginPath();
        for (i = 0; i < sys.b.length; i++) {
          a = sys.p[sys.b[i][0]];
          b = sys.p[sys.b[i][1]];
          ctx.moveTo(ox + (a.x + a.dx) * S, oy + (a.y + a.dy) * S);
          ctx.lineTo(ox + (b.x + b.dx) * S, oy + (b.y + b.dy) * S);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < sys.p.length; i++) {
        q = sys.p[i];
        x = ox + (q.x + q.dx) * S;
        y = oy + (q.y + q.dy) * S;
        r = 0.3 * PL.sims.crystalline.D * S;
        g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
        g.addColorStop(0, '#fff');
        g.addColorStop(0.35, color);
        g.addColorStop(1, dark);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.2832);
        ctx.fill();
      }
    }

    return {
      mount: function (stage, panel) {
        stageEl = stage;
        panelEl = panel;
        widgets = [];
        stage.innerHTML = '';
        panel.innerHTML = '';
        var grid = document.createElement('div');
        grid.className = 'stage-grid two';
        var v1 = document.createElement('section');
        v1.className = 'view';
        var b1 = document.createElement('span');
        b1.className = 'badge cry';
        b1.textContent = PL.t('sim.crystalline.crystal');
        c1 = makeCanvas('sim.crystalline.canvasCrystal');
        v1.appendChild(b1);
        v1.appendChild(c1);
        var v2 = document.createElement('section');
        v2.className = 'view';
        var b2 = document.createElement('span');
        b2.className = 'badge amo';
        b2.textContent = PL.t('sim.crystalline.amorphous');
        c2 = makeCanvas('sim.crystalline.canvasAmorphous');
        v2.appendChild(b2);
        v2.appendChild(c2);
        grid.appendChild(v1);
        grid.appendChild(v2);
        stage.appendChild(grid);

        var sTemp = PL.ui.slider(model.temperature, {
          min: 0, max: 100, step: 1, label: PL.t('sim.crystalline.temp')
        });
        barFill = document.createElement('i');
        barFill.style.background = '#e07a1f';
        var meter = document.createElement('div');
        meter.className = 'meters';
        var bar = document.createElement('div');
        bar.className = 'bar';
        bar.appendChild(barFill);
        meter.appendChild(bar);
        sTemp.el.appendChild(meter);
        model.temperature.link(function (v) {
          barFill.style.width = v + '%';
        });
        panel.appendChild(sTemp.el);
        widgets.push(sTemp);

        var chk = PL.ui.checkbox(model.showBonds, { label: PL.t('sim.crystalline.bonds') });
        var box = PL.ui.box(PL.t('sim.crystalline.display'), [chk.el]);
        panel.appendChild(box.el);
        widgets.push(chk);

        var tools = document.createElement('div');
        tools.className = 'tools';
        var regen = PL.ui.button({
          className: 'ico-btn reset',
          title: PL.t('sim.crystalline.regen'),
          html: '<svg viewBox="0 0 24 24"><path d="M12 6V2L7 7l5 5V8c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/></svg>',
          onClick: function () {
            model.regenerateAmorphous();
          }
        });
        regen.el.setAttribute('aria-label', PL.t('sim.crystalline.regen'));
        tools.appendChild(regen.el);
        panel.appendChild(tools);
        widgets.push(regen);
      },
      layout: function (w, h, dpr) {
        layoutW = w;
        layoutH = h;
        layoutDpr = dpr;
        if (!c1) return;
        var r1 = c1.getBoundingClientRect();
        var r2 = c2.getBoundingClientRect();
        PL.draw.fitCanvas(c1, r1.width, r1.height, dpr);
        PL.draw.fitCanvas(c2, r2.width, r2.height, dpr);
      },
      draw: function () {
        if (!c1) return;
        paint(c1, model.getCrystal(), '#1565c0', '#0d3a78');
        paint(c2, model.getAmorphous(), '#e07a1f', '#9a4a00');
      },
      reset: function () {},
      dispose: function () {
        var i;
        if (widgets) {
          for (i = 0; i < widgets.length; i++) {
            if (widgets[i].dispose) widgets[i].dispose();
          }
        }
        widgets = [];
        c1 = c2 = null;
      }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims.crystalline = PL.sims.crystalline || {};
  PL.sims.crystalline.createView = createView;
})(window.PL = window.PL || {});
