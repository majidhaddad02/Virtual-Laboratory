(function (PL) {
  function pathA(ctx, x, ySurf, yBase, d) {
    var n = 22 * d, m = ySurf + (yBase - ySurf) * 0.46, w = 52 * d;
    ctx.beginPath();
    ctx.moveTo(x - n, ySurf); ctx.lineTo(x + n, ySurf);
    ctx.lineTo(x + n, m); ctx.lineTo(x + w, m + 16 * d); ctx.lineTo(x + w, yBase);
    ctx.lineTo(x - w, yBase); ctx.lineTo(x - w, m + 16 * d); ctx.lineTo(x - n, m); ctx.closePath();
  }
  function pathB(ctx, x, ySurf, yBase, d) {
    var w = 36 * d;
    ctx.beginPath();
    ctx.moveTo(x - w, ySurf); ctx.lineTo(x + w, ySurf); ctx.lineTo(x + w, yBase); ctx.lineTo(x - w, yBase); ctx.closePath();
  }
  function pathC(ctx, x, ySurf, yBase, d) {
    var n = 24 * d, m = ySurf + (yBase - ySurf) * 0.28, w = 58 * d, b = 28 * d;
    ctx.beginPath();
    ctx.moveTo(x - n, ySurf); ctx.lineTo(x + n, ySurf);
    ctx.lineTo(x + n, m); ctx.lineTo(x + w, yBase - 8 * d); ctx.lineTo(x + b, yBase);
    ctx.lineTo(x - b, yBase); ctx.lineTo(x - w, yBase - 8 * d); ctx.lineTo(x - n, m); ctx.closePath();
  }
  var PATHS = { A: pathA, B: pathB, C: pathC };

  function glassStroke(ctx, d) {
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 7 * d; ctx.stroke();
    ctx.strokeStyle = '#5d6b79'; ctx.lineWidth = 3.2 * d; ctx.stroke();
  }

  function drawGauge(ctx, x, y, val, max, label, d) {
    var R = 28 * d;
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, R + 6 * d, 0, 6.2832);
    ctx.fillStyle = '#f4f1ea'; ctx.fill();
    ctx.strokeStyle = '#5a4630'; ctx.lineWidth = 3 * d; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, R, 0, 6.2832);
    ctx.fillStyle = '#fffdf6'; ctx.fill();
    ctx.strokeStyle = '#2c2418'; ctx.lineWidth = 2 * d; ctx.stroke();
    var start = -Math.PI * 0.75, end = Math.PI * 0.75, n = 10, i, a, inner;
    for (i = 0; i <= n; i++) {
      a = start + (end - start) * i / n;
      inner = i % 2 === 0 ? R - 10 * d : R - 6 * d;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * inner, y + Math.sin(a) * inner);
      ctx.lineTo(x + Math.cos(a) * (R - 2 * d), y + Math.sin(a) * (R - 2 * d));
      ctx.strokeStyle = '#2c2418'; ctx.lineWidth = (i % 2 === 0 ? 2 : 1) * d; ctx.stroke();
    }
    var ang = start + (end - start) * Math.min(1, val / max);
    ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2.4 * d; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang) * (R - 8 * d), y + Math.sin(ang) * (R - 8 * d)); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 4 * d, 0, 6.2832); ctx.fillStyle = '#2c2418'; ctx.fill();
    ctx.fillStyle = '#1c2430'; ctx.font = (11 * d) + 'px Tahoma,sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(label, x, y + R + 14 * d);
    ctx.restore();
  }

  function createView(model) {
    var canvas, banner, gaugesEl, widgets, barFill, dpr = 1, dragging = false;

    function yToDepth(clientY) {
      var r = canvas.getBoundingClientRect();
      var H = canvas.height;
      var y = (clientY - r.top) * dpr;
      var ySurf = H * 0.18, yBase = H * 0.78;
      var tt = (y - ySurf) / (yBase - ySurf);
      return Math.max(6, Math.min(78, tt * 100));
    }

    function paint() {
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var W = canvas.width, H = canvas.height, d = dpr;
      var now = (typeof performance !== 'undefined' && performance.now) ? performance.now() / 1000 : 0;
      ctx.clearRect(0, 0, W, H);
      var sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#c9e7f8'); sky.addColorStop(0.55, '#eaf4c8'); sky.addColorStop(1, '#c9b48a');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      var yBase = H * 0.78, ySurf = H * 0.18, yBot = H * 0.92, yTable = H * 0.94;
      var lineY = ySurf + (yBase - ySurf) * (model.depth.value / 100);
      var xs = [W * 0.23, W * 0.5, W * 0.77], kinds = ['A', 'B', 'C'];
      var C = model.liquid();
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(0, yTable, W, H - yTable);
      ctx.fillStyle = '#6e4220'; ctx.fillRect(0, yTable, W, 8 * d);
      var k;
      for (k = 0; k < 8; k++) {
        ctx.fillStyle = k % 2 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)';
        ctx.fillRect(k * (W / 8), yTable + 8 * d, W / 8, H - yTable);
      }
      var tankX = W * 0.07, tankW = W * 0.86, tankH = yBot - yBase;
      var lg = ctx.createLinearGradient(0, yBase, 0, yBot);
      lg.addColorStop(0, C.fill); lg.addColorStop(1, C.deep);
      ctx.fillStyle = lg; ctx.fillRect(tankX, yBase, tankW, tankH);
      ctx.strokeStyle = '#5d6b79'; ctx.lineWidth = 4 * d;
      ctx.beginPath(); ctx.moveTo(tankX, yBase); ctx.lineTo(tankX, yBot); ctx.lineTo(tankX + tankW, yBot); ctx.lineTo(tankX + tankW, yBase); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(tankX + 6 * d, yBase + 4 * d, 10 * d, tankH - 8 * d);
      var i;
      for (i = 0; i < 3; i++) {
        ctx.save();
        PATHS[kinds[i]](ctx, xs[i], ySurf, yBase, d);
        ctx.clip();
        var vg = ctx.createLinearGradient(0, ySurf, 0, yBase);
        vg.addColorStop(0, C.shine); vg.addColorStop(0.25, C.fill); vg.addColorStop(1, C.deep);
        ctx.fillStyle = vg; ctx.fillRect(xs[i] - 80 * d, ySurf, 160 * d, yBase - ySurf);
        ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff'; ctx.fillRect(xs[i] - 18 * d, ySurf, 8 * d, yBase - ySurf);
        ctx.globalAlpha = 1;
        var wave = Math.sin(now * 2 + i) * 2 * d;
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2 * d;
        ctx.beginPath(); ctx.moveTo(xs[i] - 70 * d, ySurf + wave);
        ctx.quadraticCurveTo(xs[i], ySurf - 4 * d - wave, xs[i] + 70 * d, ySurf + wave); ctx.stroke();
        ctx.restore();
        PATHS[kinds[i]](ctx, xs[i], ySurf - 2 * d, yBase, d);
        glassStroke(ctx, d);
        ctx.strokeStyle = '#5d6b79'; ctx.lineWidth = 4 * d;
        ctx.beginPath();
        ctx.moveTo(xs[i] - 22 * d, ySurf - 2 * d); ctx.lineTo(xs[i] + 22 * d, ySurf - 2 * d);
        if (kinds[i] === 'B') { ctx.moveTo(xs[i] - 36 * d, ySurf - 2 * d); ctx.lineTo(xs[i] + 36 * d, ySurf - 2 * d); }
        ctx.stroke();
      }
      ctx.setLineDash([10 * d, 7 * d]); ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 2.6 * d;
      ctx.beginPath(); ctx.moveTo(W * 0.08, lineY); ctx.lineTo(W * 0.92, lineY); ctx.stroke(); ctx.setLineDash([]);
      var P = model.pressurePa();
      var Pk = P / 1000;
      var labels = ['A', 'B', 'C'];
      var maxP = PL.sims.hydrostatic.Patm + 13600 * PL.sims.hydrostatic.G * PL.sims.hydrostatic.HMAX;
      if (model.showH.value) {
        ctx.strokeStyle = '#1c2430'; ctx.lineWidth = 1.8 * d;
        ctx.beginPath(); ctx.moveTo(W * 0.085, ySurf); ctx.lineTo(W * 0.085, lineY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W * 0.07, ySurf); ctx.lineTo(W * 0.1, ySurf); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W * 0.07, lineY); ctx.lineTo(W * 0.1, lineY); ctx.stroke();
        ctx.fillStyle = '#1c2430'; ctx.font = (16 * d) + 'px "Times New Roman",serif'; ctx.textAlign = 'center';
        ctx.fillText('h', W * 0.055, (ySurf + lineY) / 2 + 6 * d);
        ctx.setLineDash([4 * d, 4 * d]); ctx.strokeStyle = '#2b8a3e'; ctx.lineWidth = 1.6 * d;
        ctx.beginPath(); ctx.moveTo(W * 0.1, ySurf); ctx.lineTo(W * 0.9, ySurf); ctx.stroke(); ctx.setLineDash([]);
      }
      for (i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(xs[i], lineY, 9 * d, 0, 6.2832);
        ctx.fillStyle = '#c0392b'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4 * d; ctx.stroke();
        ctx.fillStyle = '#1c2430'; ctx.font = (20 * d) + 'px Tahoma,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(labels[i], xs[i], lineY - 16 * d);
        if (model.showP.value) {
          var gy = Math.min(H * 0.72, lineY + 52 * d);
          ctx.strokeStyle = '#5a4630'; ctx.lineWidth = 2 * d;
          ctx.beginPath(); ctx.moveTo(xs[i], lineY + 9 * d); ctx.lineTo(xs[i], gy - 34 * d); ctx.stroke();
          drawGauge(ctx, xs[i], gy, P, maxP, Pk.toFixed(1) + ' kPa', d);
        }
      }
      if (banner) banner.style.display = model.showEq.value ? 'block' : 'none';
      if (gaugesEl) {
        var html = '';
        for (i = 0; i < 3; i++) {
          html += '<div class="gauge gauge-card"><div class="row"><span class="formula">P<sub>' + labels[i] + '</sub></span><span>' + Pk.toFixed(1) + ' kPa</span></div></div>';
        }
        html += '<div class="gauge"><div class="eq"><span class="formula">P = P<sub>0</sub> + ρgh</span></div></div>';
        gaugesEl.innerHTML = html;
      }
      if (barFill) barFill.style.width = model.depth.value + '%';
    }

    return {
      mount: function (stage, panel) {
        widgets = [];
        stage.className = 'sim-stage lab';
        stage.innerHTML = '';
        panel.innerHTML = '';
        banner = document.createElement('div');
        banner.className = 'eq-banner';
        banner.innerHTML = '<span class="formula">P<sub>A</sub> = P<sub>B</sub> = P<sub>C</sub> = P<sub>0</sub> + ρgh</span>';
        canvas = document.createElement('canvas');
        canvas.setAttribute('aria-label', PL.t('sim.hydrostatic.canvas'));
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        stage.appendChild(banner);
        stage.appendChild(canvas);
        canvas.addEventListener('pointerdown', function (e) {
          dragging = true;
          model.depth.value = yToDepth(e.clientY);
          if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
        });
        canvas.addEventListener('pointermove', function (e) {
          if (!dragging) return;
          model.depth.value = yToDepth(e.clientY);
        });
        canvas.addEventListener('pointerup', function () { dragging = false; });
        canvas.addEventListener('pointercancel', function () { dragging = false; });

        var sDepth = PL.ui.slider(model.depth, {
          min: 6, max: 78, step: 1, label: PL.t('sim.hydrostatic.depth')
        });
        barFill = document.createElement('i');
        barFill.style.background = '#9b59b6';
        var bar = document.createElement('div');
        bar.className = 'bar';
        bar.appendChild(barFill);
        sDepth.el.appendChild(bar);
        panel.appendChild(sDepth.el);
        widgets.push(sDepth);

        var liqBox = document.createElement('div');
        liqBox.className = 'box';
        var liqH = document.createElement('h3');
        liqH.textContent = PL.t('sim.hydrostatic.liquid');
        var tog = document.createElement('div');
        tog.className = 'liq-toggle';
        function liqBtn(value, label, cls) {
          var b = document.createElement('button');
          b.type = 'button';
          b.textContent = label;
          b.setAttribute('aria-pressed', 'false');
          b.addEventListener('click', function () { model.rho.value = value; });
          tog.appendChild(b);
          return { el: b, value: value, cls: cls };
        }
        var btns = [
          liqBtn(1000, PL.t('sim.hydrostatic.water'), 'water'),
          liqBtn(800, PL.t('sim.hydrostatic.oil'), 'oil'),
          liqBtn(13600, PL.t('sim.hydrostatic.mercury'), 'hg')
        ];
        function syncLiq(v) {
          var i;
          for (i = 0; i < btns.length; i++) {
            var on = btns[i].value === v;
            btns[i].el.className = on ? 'on ' + btns[i].cls : (btns[i].cls === 'oil' || btns[i].cls === 'hg' ? btns[i].cls : '');
            btns[i].el.setAttribute('aria-pressed', on ? 'true' : 'false');
          }
        }
        model.rho.link(syncLiq);
        liqBox.appendChild(liqH);
        liqBox.appendChild(tog);
        panel.appendChild(liqBox);
        widgets.push({
          dispose: function () { model.rho.unlink(syncLiq); }
        });

        var cP = PL.ui.checkbox(model.showP, { label: PL.t('sim.hydrostatic.showP') });
        var cH = PL.ui.checkbox(model.showH, { label: PL.t('sim.hydrostatic.showH') });
        var cEq = PL.ui.checkbox(model.showEq, { label: PL.t('sim.hydrostatic.showEq') });
        var box = PL.ui.box(PL.t('sim.hydrostatic.display'), [cP.el, cH.el, cEq.el]);
        panel.appendChild(box.el);
        widgets.push(cP, cH, cEq);

        gaugesEl = document.createElement('div');
        gaugesEl.className = 'gauges';
        gaugesEl.setAttribute('aria-live', 'polite');
        panel.appendChild(gaugesEl);
        var vis = document.createElement('div');
        vis.className = 'vis-state ok';
        vis.innerHTML = '<span class="formula">P<sub>A</sub> = P<sub>B</sub> = P<sub>C</sub></span>';
        panel.appendChild(vis);
      },
      layout: function (w, h, nextDpr) {
        dpr = nextDpr;
        if (!canvas) return;
        var r = canvas.getBoundingClientRect();
        PL.draw.fitCanvas(canvas, r.width, r.height, dpr);
      },
      draw: paint,
      reset: function () { dragging = false; },
      dispose: function () {
        var i;
        if (widgets) {
          for (i = 0; i < widgets.length; i++) {
            if (widgets[i].dispose) widgets[i].dispose();
          }
        }
        widgets = [];
        canvas = banner = gaugesEl = barFill = null;
      }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims.hydrostatic = PL.sims.hydrostatic || {};
  PL.sims.hydrostatic.createView = createView;
})(window.PL = window.PL || {});
