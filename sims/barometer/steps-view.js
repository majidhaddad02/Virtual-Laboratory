(function (PL) {
  var HG = { fill: '#9aa0a8', deep: '#5c636c', shine: '#d5d8dc' };

  function reducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function collectRadios(root) {
    var out = [];
    function walk(n) {
      var i;
      if (n.tagName === 'INPUT') out.push(n);
      if (n.children) {
        for (i = 0; i < n.children.length; i++) walk(n.children[i]);
      }
    }
    walk(root);
    return out;
  }

  function createView(model) {
    var canvas, statusEl, persistEl, explainEl, nextBtn, widgets, unsubs;
    var predRadios = [];
    var dpr = 1;
    var phys = PL.sims.barometer.physics;

    function statusText() {
      if (model.settled.value) return PL.t('sim.barometer.settled');
      if (model.falling) return PL.t('sim.barometer.falling');
      if (model.phase === 0) return PL.t('sim.barometer.status0');
      if (model.phase === 1) return PL.t('sim.barometer.status1');
      if (model.phase === 2) return PL.t('sim.barometer.status2');
      if (model.phase === 3) return PL.t('sim.barometer.status3');
      return PL.t('sim.barometer.status4');
    }

    function syncLocks() {
      var i;
      var showPred = model.phase >= 3;
      var locked = model.phase >= 4 || model.falling;
      if (widgets && widgets[0]) {
        widgets[0].el.className = showPred ? 'ui-radio-group box' : 'ui-radio-group box hidden';
      }
      for (i = 0; i < predRadios.length; i++) predRadios[i].disabled = locked;
      if (nextBtn) {
        nextBtn.disabled = !model.canAdvance();
        nextBtn.className = model.phase >= 4 && !model.animating ? 'hidden' : '';
      }
    }

    function syncExplain() {
      if (!explainEl) return;
      if (!model.explained.value) {
        explainEl.className = 'box hidden';
        explainEl.innerHTML = '';
        if (persistEl) persistEl.className = 'hint hidden';
        return;
      }
      if (persistEl) {
        persistEl.className = 'hint';
        persistEl.style.position = 'static';
        persistEl.textContent = PL.t('sim.barometer.persist');
      }
      explainEl.className = 'box';
      var ok = PL.sims.barometer.steps.predictionCorrect(model.prediction.value);
      var html = '<h3>' + PL.t('sim.barometer.whyTitle') + '</h3>';
      html += '<ol><li>' + PL.t('sim.barometer.why1') + '</li>';
      html += '<li>' + PL.t('sim.barometer.why2') + '</li>';
      html += '<li>' + PL.t('sim.barometer.why3') + '</li>';
      html += '<li>' + PL.t('sim.barometer.why4') + '</li></ol>';
      html += '<p class="' + (ok ? 'why ok' : 'why bad') + '">';
      html += ok ? PL.t('sim.barometer.predOk') : PL.t('sim.barometer.predBad');
      html += '</p>';
      explainEl.innerHTML = html;
    }

    function drawScene(ctx, W, H, d, invert) {
      var dishY = H * 0.78;
      var dishW = Math.min(120 * d, W * 0.28);
      var dishH = 26 * d;
      var Lpx = Math.min(H * 0.52, 260 * d);
      var tw = 16 * d;
      var cx = W * 0.42;
      var mouthX = cx;
      var mouthY0 = dishY - 36 * d - Lpx;
      var mouthY1 = dishY + 10 * d;
      var mouthY = mouthY0 + (mouthY1 - mouthY0) * invert;
      var ang = Math.PI * invert;
      var dx = Math.sin(ang) * 0;
      var dy = Math.cos(ang);
      var closedX = mouthX + dx * Lpx;
      var closedY = mouthY + dy * Lpx;
      if (invert > 0.5) {
        closedX = mouthX;
        closedY = mouthY - Lpx;
        mouthY = dishY + 10 * d;
        closedY = mouthY - Lpx;
      } else {
        mouthY = dishY - 36 * d - Lpx;
        closedY = mouthY + Lpx;
      }
      if (invert > 0 && invert < 1 && !reducedMotion()) {
        var a = Math.PI * invert;
        mouthY = mouthY0 + (mouthY1 - mouthY0) * invert;
        closedX = mouthX + Math.sin(a) * Lpx;
        closedY = mouthY + Math.cos(a) * Lpx;
      } else if (invert >= 1) {
        mouthY = mouthY1;
        closedX = mouthX;
        closedY = mouthY - Lpx;
      } else {
        mouthY = mouthY0;
        closedX = mouthX;
        closedY = mouthY + Lpx;
      }

      ctx.fillStyle = '#efe6d2';
      ctx.fillRect(0, dishY + dishH * 0.35, W, H - dishY);

      ctx.fillStyle = HG.deep;
      ctx.beginPath();
      ctx.ellipse(cx, dishY + dishH * 0.35, dishW, dishH * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = HG.fill;
      ctx.beginPath();
      ctx.ellipse(cx, dishY, dishW, dishH * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      var ux = closedX - mouthX;
      var uy = closedY - mouthY;
      var len = Math.sqrt(ux * ux + uy * uy) || 1;
      ux /= len;
      uy /= len;
      var px = -uy;
      var py = ux;

      function tubePath() {
        ctx.beginPath();
        ctx.moveTo(mouthX + px * tw, mouthY + py * tw);
        ctx.lineTo(closedX + px * tw, closedY + py * tw);
        ctx.arc(closedX, closedY, tw, Math.atan2(py, px), Math.atan2(py, px) + Math.PI, false);
        ctx.lineTo(mouthX - px * tw, mouthY - py * tw);
        ctx.closePath();
      }

      ctx.save();
      tubePath();
      ctx.clip();
      ctx.fillStyle = '#d7eef9';
      ctx.fill();

      var fillAmt = model.fill;
      var hPx;
      if (invert > 0.85 && (model.phase >= 3 || model.falling || model.settled.value)) {
        hPx = (model.h / phys.TUBE_HG) * Lpx;
        var colX0 = mouthX - px * tw;
        var colY0 = mouthY - py * tw;
        ctx.fillStyle = HG.fill;
        ctx.beginPath();
        ctx.moveTo(mouthX + px * tw, mouthY + py * tw);
        ctx.lineTo(mouthX + px * tw + ux * hPx, mouthY + py * tw + uy * hPx);
        ctx.lineTo(mouthX - px * tw + ux * hPx, mouthY - py * tw + uy * hPx);
        ctx.lineTo(mouthX - px * tw, mouthY - py * tw);
        ctx.closePath();
        ctx.fill();
        if (model.h < phys.TUBE_HG - 0.002) {
          ctx.save();
          ctx.strokeStyle = '#5d6b79';
          ctx.lineWidth = 1.2 * d;
          var i;
          for (i = 0; i < 8; i++) {
            var t0 = hPx + i * 8 * d;
            if (t0 > Lpx) break;
            ctx.beginPath();
            ctx.moveTo(mouthX + px * tw + ux * t0, mouthY + py * tw + uy * t0);
            ctx.lineTo(mouthX - px * tw + ux * (t0 + 6 * d), mouthY - py * tw + uy * (t0 + 6 * d));
            ctx.stroke();
          }
          ctx.restore();
          ctx.fillStyle = '#1c2430';
          ctx.font = (11 * d) + 'px Vazirmatn,Tahoma,sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(PL.t('sim.barometer.vacuum'), closedX, closedY + 18 * d);
        }
      } else if (fillAmt > 0) {
        var fPx = fillAmt * Lpx;
        ctx.fillStyle = HG.fill;
        ctx.fillRect(
          Math.min(mouthX, closedX) - tw,
          closedY - (closedY > mouthY ? fPx : 0),
          tw * 2,
          fPx
        );
        if (invert < 0.5) {
          ctx.fillRect(mouthX - tw, closedY - fPx, tw * 2, fPx);
        }
      }
      ctx.restore();

      tubePath();
      ctx.strokeStyle = '#5d6b79';
      ctx.lineWidth = 3 * d;
      ctx.stroke();

      var n, yTick, cm;
      if (invert > 0.85) {
        ctx.strokeStyle = '#1c2430';
        ctx.fillStyle = '#1c2430';
        ctx.lineWidth = 1 * d;
        ctx.font = (9 * d) + 'px Vazirmatn,Tahoma,sans-serif';
        ctx.textAlign = 'left';
        for (n = 0; n <= 100; n += 10) {
          cm = n / 100;
          yTick = mouthY + uy * (cm / phys.TUBE_HG) * Lpx;
          ctx.beginPath();
          ctx.moveTo(mouthX + tw + 4 * d, yTick);
          ctx.lineTo(mouthX + tw + 12 * d, yTick);
          ctx.stroke();
          ctx.fillText(PL.format.num(n, 0), mouthX + tw + 14 * d, yTick + 3 * d);
        }
      }

      if (model.fingerT > 0.05) {
        var f = model.fingerT;
        ctx.globalAlpha = f;
        ctx.fillStyle = '#e8b89a';
        ctx.beginPath();
        ctx.arc(mouthX, mouthY, 10 * d, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8a5a40';
        ctx.lineWidth = 2 * d;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (model.settled.value) {
        var hLabel = model.h * 100;
        var topY = mouthY + uy * (model.h / phys.TUBE_HG) * Lpx;
        ctx.fillStyle = '#1c2430';
        ctx.font = (12 * d) + 'px Vazirmatn,Tahoma,sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(PL.format.num(hLabel, 1) + ' cm', mouthX - tw - 8 * d, topY);
        ctx.beginPath();
        ctx.arc(mouthX, dishY, 5 * d, 0, Math.PI * 2);
        ctx.fillStyle = '#c92a2a';
        ctx.fill();
        ctx.fillStyle = '#1c2430';
        ctx.font = (12 * d) + 'px Vazirmatn,Tahoma,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('A', mouthX, dishY - 8 * d);
        ctx.beginPath();
        ctx.arc(cx + dishW * 0.55, dishY, 5 * d, 0, Math.PI * 2);
        ctx.fillStyle = '#c92a2a';
        ctx.fill();
        ctx.fillStyle = '#1c2430';
        ctx.fillText('B', cx + dishW * 0.55, dishY - 8 * d);
        ctx.fillText(PL.t('sim.barometer.eqAB', { h: PL.format.num(hLabel, 1) }), W * 0.72, dishY - 28 * d);

        ctx.strokeStyle = '#c92a2a';
        ctx.fillStyle = '#c92a2a';
        ctx.lineWidth = 3 * d;
        var ax = cx + dishW * 0.2;
        ctx.beginPath();
        ctx.moveTo(ax, dishY - 52 * d);
        ctx.lineTo(ax, dishY - 8 * d);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax, dishY - 8 * d);
        ctx.lineTo(ax - 6 * d, dishY - 18 * d);
        ctx.lineTo(ax + 6 * d, dishY - 18 * d);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#1c2430';
        ctx.font = (11 * d) + 'px Vazirmatn,Tahoma,sans-serif';
        ctx.fillText(PL.t('sim.barometer.airP'), ax, dishY - 58 * d);

        var barX = mouthX + tw + 48 * d;
        var barW = 10 * d;
        var barH = (model.h / phys.TUBE_HG) * Lpx;
        ctx.fillStyle = '#eee6d4';
        ctx.strokeStyle = '#8a6a10';
        ctx.lineWidth = 1.2 * d;
        ctx.fillRect(barX, mouthY + uy * barH - barH, barW, barH);
        ctx.strokeRect(barX, mouthY + uy * barH - barH, barW, barH);
        var g = ctx.createLinearGradient(0, mouthY + uy * barH, 0, mouthY + uy * barH - barH);
        g.addColorStop(0, '#2e86c1');
        g.addColorStop(1, '#d7eef9');
        ctx.fillStyle = g;
        ctx.fillRect(barX, mouthY + uy * barH - barH, barW, barH);
        ctx.fillStyle = '#1c2430';
        ctx.font = (9 * d) + 'px Vazirmatn,Tahoma,sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(PL.format.num(hLabel, 0), barX + barW + 4 * d, mouthY + uy * barH);
        ctx.fillText('۰', barX + barW + 4 * d, mouthY + uy * barH - barH);
      }
    }

    function paint() {
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var W = canvas.width;
      var H = canvas.height;
      var d = dpr;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#d7eef9';
      ctx.fillRect(0, 0, W, H * 0.78);
      var inv = model.invert;
      if (reducedMotion() && inv > 0 && inv < 1) {
        ctx.globalAlpha = 1 - inv;
        drawScene(ctx, W, H, d, 0);
        ctx.globalAlpha = inv;
        drawScene(ctx, W, H, d, 1);
        ctx.globalAlpha = 1;
      } else {
        drawScene(ctx, W, H, d, inv);
      }
      if (statusEl) statusEl.textContent = statusText();
      if (canvas) canvas.setAttribute('aria-label', PL.t('sim.barometer.canvasSteps') + ' — ' + statusText());
      syncLocks();
      syncExplain();
    }

    return {
      mount: function (stage, panel) {
        widgets = [];
        unsubs = [];
        predRadios = [];
        stage.className = 'sim-stage lab';
        stage.innerHTML = '';
        panel.innerHTML = '';
        canvas = document.createElement('canvas');
        canvas.setAttribute('aria-label', PL.t('sim.barometer.canvasSteps'));
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        stage.appendChild(canvas);

        var pred = PL.ui.radio(model.prediction, {
          title: PL.t('sim.barometer.predictTitle'),
          name: 'baro-pred',
          items: [
            { value: 'all', label: PL.t('sim.barometer.predAll') },
            { value: 'column', label: PL.t('sim.barometer.predColumn') },
            { value: 'none', label: PL.t('sim.barometer.predNone') }
          ]
        });
        var q = document.createElement('p');
        q.className = 'hint';
        q.style.position = 'static';
        q.textContent = PL.t('sim.barometer.predictQ');
        pred.el.insertBefore(q, pred.el.children[1] || null);
        predRadios = collectRadios(pred.el);
        widgets.push(pred);
        panel.appendChild(pred.el);

        var box = document.createElement('div');
        box.className = 'box';
        nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.textContent = PL.t('sim.barometer.next');
        nextBtn.addEventListener('click', function () {
          model.next();
        });
        box.appendChild(nextBtn);
        var again = document.createElement('button');
        again.type = 'button';
        again.textContent = PL.t('sim.barometer.again');
        again.addEventListener('click', function () {
          model.reset();
          syncLocks();
          syncExplain();
        });
        box.appendChild(again);
        panel.appendChild(box);

        statusEl = document.createElement('p');
        statusEl.className = 'hint';
        statusEl.style.position = 'static';
        statusEl.setAttribute('aria-live', 'polite');
        panel.appendChild(statusEl);

        persistEl = document.createElement('p');
        persistEl.className = 'hint hidden';
        persistEl.style.position = 'static';
        panel.appendChild(persistEl);

        explainEl = document.createElement('div');
        explainEl.className = 'box hidden';
        panel.appendChild(explainEl);

        function onChange() { syncLocks(); }
        function onExplain() { syncExplain(); }
        model.settled.link(onChange);
        model.explained.link(onExplain);
        model.prediction.link(onChange);
        unsubs.push(function () { model.settled.unlink(onChange); });
        unsubs.push(function () { model.explained.unlink(onExplain); });
        unsubs.push(function () { model.prediction.unlink(onChange); });
        syncLocks();
        syncExplain();
      },
      layout: function (w, h, nextDpr) {
        dpr = nextDpr;
        if (!canvas) return;
        var r = canvas.getBoundingClientRect();
        PL.draw.fitCanvas(canvas, r.width, r.height, dpr);
      },
      draw: paint,
      reset: function () {
        syncLocks();
        syncExplain();
      },
      dispose: function () {
        var i;
        for (i = 0; i < unsubs.length; i++) {
          if (typeof unsubs[i] === 'function') unsubs[i]();
        }
        unsubs = [];
        if (widgets) {
          for (i = 0; i < widgets.length; i++) {
            if (widgets[i] && widgets[i].dispose) widgets[i].dispose();
          }
        }
        widgets = [];
        canvas = statusEl = persistEl = explainEl = nextBtn = null;
        predRadios = [];
      }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims.barometer = PL.sims.barometer || {};
  PL.sims.barometer.createStepsView = createView;
})(window.PL = window.PL || {});
