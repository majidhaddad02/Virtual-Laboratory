(function (PL) {
  function createView(model) {
    var canvases = [];
    var widgets = [];
    var yaw = 0.7;
    var pitch = -0.5;
    var dragging = false;
    var lastX = 0;
    var lastY = 0;
    var lastAuto = 0;
    var barFill;
    var onTemp;
    var CAM = PL.sims['crystalline-3d'].CAM;

    function rot(x, y, z) {
      var cy = Math.cos(yaw);
      var sy = Math.sin(yaw);
      var cp = Math.cos(pitch);
      var sp = Math.sin(pitch);
      var x1 = cy * x + sy * z;
      var z1 = -sy * x + cy * z;
      return [x1, cp * y - sp * z1, sp * y + cp * z1];
    }

    function render(sys, canvas) {
      var ctx = canvas.getContext('2d');
      var W = canvas.width;
      var H = canvas.height;
      var S = sys.scale * Math.min(W, H);
      var P = [];
      var i, e, q, r, f, n, p, h, rad, g, base, ord;
      ctx.clearRect(0, 0, W, H);
      var col = sys.col;
      var acc = '#ff6fa8';
      for (i = 0; i < sys.p.length; i++) {
        q = sys.p[i];
        r = rot(q.x + q.dx, q.y + q.dy, q.z + q.dz);
        f = CAM / (CAM + r[2]);
        P.push({ x: W / 2 + r[0] * f * S, y: H / 2 - r[1] * f * S, z: r[2], f: f });
      }
      var useHl = sys.hl && (model.showCell.value || sys.always);
      ctx.lineCap = 'round';
      if (model.showBonds.value) {
        ctx.strokeStyle = col;
        ctx.globalAlpha = 0.42;
        ctx.lineWidth = Math.max(1.4, W / 260);
        ctx.beginPath();
        for (i = 0; i < sys.b.length; i++) {
          if (useHl && sys.he[i]) continue;
          e = sys.b[i];
          ctx.moveTo(P[e[0]].x, P[e[0]].y);
          ctx.lineTo(P[e[1]].x, P[e[1]].y);
        }
        ctx.stroke();
      }
      if (useHl) {
        ctx.strokeStyle = acc;
        ctx.globalAlpha = 1;
        ctx.lineWidth = Math.max(2.2, W / 100);
        ctx.beginPath();
        for (i = 0; i < sys.b.length; i++) {
          if (!sys.he[i]) continue;
          e = sys.b[i];
          ctx.moveTo(P[e[0]].x, P[e[0]].y);
          ctx.lineTo(P[e[1]].x, P[e[1]].y);
        }
        ctx.stroke();
      }
      ord = P.map(function (_, k) { return k; }).sort(function (a, b) { return P[b].z - P[a].z; });
      for (n = 0; n < ord.length; n++) {
        i = ord[n];
        p = P[i];
        h = useHl && sys.hl[i];
        rad = (h ? 0.22 : 0.16) * S * p.f;
        g = ctx.createRadialGradient(p.x - rad * 0.3, p.y - rad * 0.3, rad * 0.15, p.x, p.y, rad);
        base = h ? acc : col;
        g.addColorStop(0, '#fff');
        g.addColorStop(0.4, base);
        g.addColorStop(1, '#1a2030');
        ctx.globalAlpha = Math.max(0.45, Math.min(1, 0.8 - p.z * 0.18));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function bindDrag(c) {
      c.addEventListener('pointerdown', function (e) {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        if (c.setPointerCapture) c.setPointerCapture(e.pointerId);
      });
      c.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        yaw += (e.clientX - lastX) * 0.01;
        pitch = Math.max(-1.5, Math.min(1.5, pitch + (e.clientY - lastY) * 0.01));
        lastX = e.clientX;
        lastY = e.clientY;
      });
      c.addEventListener('pointerup', function () { dragging = false; });
      c.addEventListener('pointercancel', function () { dragging = false; });
    }

    function pane(badgeClass, badgeKey, ariaKey) {
      var sec = document.createElement('section');
      sec.className = 'view ghost';
      var badge = document.createElement('span');
      badge.className = 'badge ' + badgeClass;
      badge.textContent = PL.t(badgeKey);
      var canvas = document.createElement('canvas');
      canvas.setAttribute('aria-label', PL.t(ariaKey));
      sec.appendChild(badge);
      sec.appendChild(canvas);
      bindDrag(canvas);
      canvases.push(canvas);
      return sec;
    }

    return {
      mount: function (stage, panel) {
        canvases = [];
        widgets = [];
        stage.className = 'sim-stage dark';
        stage.innerHTML = '';
        panel.innerHTML = '';
        var grid = document.createElement('div');
        grid.className = 'stage-grid three';
        grid.appendChild(pane('cry', 'sim.crystalline-3d.crystal', 'sim.crystalline-3d.canvasCrystal'));
        grid.appendChild(pane('acc', 'sim.crystalline-3d.cell', 'sim.crystalline-3d.canvasCell'));
        grid.appendChild(pane('amo', 'sim.crystalline-3d.amorphous', 'sim.crystalline-3d.canvasAmorphous'));
        stage.appendChild(grid);
        var hint = document.createElement('div');
        hint.className = 'hint';
        hint.textContent = PL.t('sim.crystalline-3d.hint');
        stage.appendChild(hint);

        var sTemp = PL.ui.slider(model.temperature, {
          min: 0, max: 100, step: 1, label: PL.t('sim.crystalline-3d.temp')
        });
        barFill = document.createElement('i');
        barFill.style.background = '#e07a1f';
        var bar = document.createElement('div');
        bar.className = 'bar';
        bar.appendChild(barFill);
        sTemp.el.appendChild(bar);
        onTemp = function (v) { barFill.style.width = v + '%'; };
        model.temperature.link(onTemp);
        panel.appendChild(sTemp.el);
        widgets.push(sTemp);

        var cBonds = PL.ui.checkbox(model.showBonds, { label: PL.t('sim.crystalline-3d.bonds') });
        var cCell = PL.ui.checkbox(model.showCell, { label: PL.t('sim.crystalline-3d.showCell') });
        var cSpin = PL.ui.checkbox(model.spin, { label: PL.t('sim.crystalline-3d.spin') });
        var cAuto = PL.ui.checkbox(model.autoCell, { label: PL.t('sim.crystalline-3d.auto') });
        var box = PL.ui.box(PL.t('sim.crystalline-3d.display'), [cBonds.el, cCell.el, cSpin.el, cAuto.el]);
        panel.appendChild(box.el);
        widgets.push(cBonds, cCell, cSpin, cAuto);

        var tools = document.createElement('div');
        tools.className = 'tools';
        var next = PL.ui.button({
          label: PL.t('sim.crystalline-3d.next'),
          onClick: function () { model.nextCell(); }
        });
        var regen = PL.ui.button({
          className: 'ico-btn reset',
          title: PL.t('sim.crystalline-3d.regen'),
          html: '<svg viewBox="0 0 24 24"><path d="M12 6V2L7 7l5 5V8c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/></svg>',
          onClick: function () { model.regenerateAmorphous(); }
        });
        regen.el.setAttribute('aria-label', PL.t('sim.crystalline-3d.regen'));
        tools.appendChild(next.el);
        tools.appendChild(regen.el);
        panel.appendChild(tools);
        widgets.push(next, regen);
      },
      layout: function (w, h, dpr) {
        var i, r;
        for (i = 0; i < canvases.length; i++) {
          r = canvases[i].getBoundingClientRect();
          PL.draw.fitCanvas(canvases[i], r.width, r.height, dpr);
        }
      },
      draw: function () {
        if (canvases.length < 3) return;
        if (model.spin.value && !dragging) yaw += 0.004;
        var now = typeof performance !== 'undefined' && performance.now ? performance.now() : 0;
        if (model.autoCell.value && now - lastAuto > 1500) {
          lastAuto = now;
          model.nextCell();
        }
        render(model.getCrystal(), canvases[0]);
        render(model.getAmorphous(), canvases[2]);
        render(model.getUnitCell(), canvases[1]);
      },
      reset: function () {
        yaw = 0.7;
        pitch = -0.5;
        dragging = false;
        lastAuto = 0;
      },
      dispose: function () {
        var i;
        if (onTemp) {
          model.temperature.unlink(onTemp);
          onTemp = null;
        }
        for (i = 0; i < widgets.length; i++) {
          if (widgets[i].dispose) widgets[i].dispose();
        }
        widgets = [];
        canvases = [];
      }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims['crystalline-3d'] = PL.sims['crystalline-3d'] || {};
  PL.sims['crystalline-3d'].createView = createView;
})(window.PL = window.PL || {});
