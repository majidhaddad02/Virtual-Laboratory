(function (PL) {
  var WATER = { fill: '#3d9be8', deep: '#155a96', shine: '#c5e8ff' };

  function geometry(W, H, d) {
    var bore = Math.max(16 * d, Math.min(22 * d, W * 0.028));
    var gap = Math.min(W * 0.28, 168 * d);
    var HMAX = 36;
    var armH = Math.min(H * 0.62, 320 * d);
    var yJoin = H * 0.18 + armH;
    var yOpen = yJoin - armH;
    return {
      w: bore, HMAX: HMAX, armH: armH, yOpen: yOpen, yJoin: yJoin,
      xl: W * 0.50 - gap / 2, xr: W * 0.50 + gap / 2, cx: W * 0.50,
      Rout: gap / 2 + bore, Rin: Math.max(bore * 0.4, gap / 2 - bore),
      px: armH / HMAX
    };
  }

  function yPix(g, h) { return g.yJoin - h * g.px; }

  function tubeClip(ctx, g) {
    ctx.beginPath();
    ctx.moveTo(g.xl - g.w, g.yOpen);
    ctx.lineTo(g.xl - g.w, g.yJoin);
    ctx.arc(g.cx, g.yJoin, g.Rout, Math.PI, 0, true);
    ctx.lineTo(g.xr + g.w, g.yOpen);
    ctx.lineTo(g.xr - g.w, g.yOpen);
    ctx.lineTo(g.xr - g.w, g.yJoin);
    ctx.arc(g.cx, g.yJoin, g.Rin, 0, Math.PI, false);
    ctx.lineTo(g.xl + g.w, g.yOpen);
    ctx.closePath();
  }

  function layerFill(ctx, x, w, yBot, yTop, F, d) {
    if (yBot - yTop < 0.4) return;
    var gr = ctx.createLinearGradient(x - w, 0, x + w, 0);
    gr.addColorStop(0, F.deep);
    gr.addColorStop(0.28, F.shine);
    gr.addColorStop(1, F.fill);
    ctx.fillStyle = gr;
    ctx.fillRect(x - w, yTop, 2 * w, yBot - yTop);
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    ctx.fillRect(x - w + 3 * d, yTop, 5 * d, yBot - yTop);
  }

  function reducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function createView(model) {
    var canvas, statusEl, explainEl, pourBtn, pourCap, widgets, unsubs;
    var dpr = 1, t0 = 0;
    var predRadios = [];
    var liqRadios = [];

    function liquidName() {
      return PL.t(model.topSpec().nameKey);
    }

    function otherArm(arm) {
      return arm === 'L' ? 'R' : 'L';
    }

    function armLabel(arm) {
      return arm === 'L' ? PL.t('sim.u-tube.left') : PL.t('sim.u-tube.right');
    }

    function statusText() {
      if (model.pending > 0) return PL.t('sim.u-tube.settle.pouring');
      if (model.settled.value) return PL.t('sim.u-tube.settle.settled');
      if (model.pouredAny) {
        var dP = model.gaugePressurePa('L') - model.gaugePressurePa('R');
        var hi = dP > 0 ? 'L' : 'R';
        return PL.t('sim.u-tube.settle.imbalance', {
          arm: armLabel(hi),
          other: armLabel(otherArm(hi))
        });
      }
      return PL.t('sim.u-tube.settle.idle');
    }

    function ariaLabel() {
      return PL.t('sim.u-tube.settle.canvas') + ' — ' + statusText();
    }

    function syncLocks() {
      var i, locked = model.pouredAny;
      for (i = 0; i < predRadios.length; i++) predRadios[i].disabled = locked;
      for (i = 0; i < liqRadios.length; i++) liqRadios[i].disabled = locked;
      var full = model.cap(model.pourArm.value) <= 0;
      var busy = model.pending > 0;
      if (pourBtn) pourBtn.disabled = busy || full;
      if (pourCap) pourCap.className = full ? '' : 'hidden';
    }

    function syncExplain() {
      if (!explainEl) return;
      if (!model.explained.value) {
        explainEl.className = 'box hidden';
        explainEl.innerHTML = '';
        return;
      }
      explainEl.className = 'box';
      var arm = model.firstPourArm || 'L';
      var name = liquidName();
      var ok = PL.sims['u-tube'].settle.predictionCorrect(model.prediction.value, arm);
      var html = '<h3>' + PL.t('sim.u-tube.settle.whyTitle') + '</h3>';
      html += '<ol><li>' + PL.t('sim.u-tube.settle.why1') + '</li>';
      html += '<li>' + PL.t('sim.u-tube.settle.why2', { liquid: name, arm: armLabel(arm) }) + '</li>';
      html += '<li>' + PL.t('sim.u-tube.settle.why3') + '</li>';
      html += '<li>' + PL.t('sim.u-tube.settle.why4') + '</li></ol>';
      html += '<p class="' + (ok ? 'why ok' : 'why bad') + '">';
      html += ok ? PL.t('sim.u-tube.settle.predOk') : PL.t('sim.u-tube.settle.predBad');
      html += '</p>';
      explainEl.innerHTML = html;
    }

    function paint() {
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var W = canvas.width, H = canvas.height, d = dpr;
      ctx.clearRect(0, 0, W, H);
      var g = geometry(W, H, d);
      var top = model.topSpec();
      var now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
      if (!t0) t0 = now;

      ctx.fillStyle = '#1c2430';
      ctx.font = (12 * d) + 'px Vazirmatn,Tahoma,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(PL.t('sim.u-tube.settle.openTops'), W / 2, g.yOpen - 18 * d);

      ctx.save();
      tubeClip(ctx, g);
      ctx.clip();
      ctx.fillStyle = '#d7eef9';
      ctx.fill();
      layerFill(ctx, g.xl, g.w, g.yJoin, yPix(g, model.wl), WATER, d);
      layerFill(ctx, g.xr, g.w, g.yJoin, yPix(g, model.wr), WATER, d);
      if (model.tl > 0.02) {
        layerFill(ctx, g.xl, g.w, yPix(g, model.wl), yPix(g, model.wl + model.tl), top, d);
      }
      if (model.tr > 0.02) {
        layerFill(ctx, g.xr, g.w, yPix(g, model.wr), yPix(g, model.wr + model.tr), top, d);
      }
      ctx.fillStyle = WATER.deep;
      ctx.beginPath();
      ctx.arc(g.cx, g.yJoin, g.Rout, Math.PI, 0, true);
      ctx.arc(g.cx, g.yJoin, g.Rin, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.save();
      tubeClip(ctx, g);
      ctx.strokeStyle = '#5d6b79';
      ctx.lineWidth = 3 * d;
      ctx.stroke();
      ctx.restore();

      function labelLayer(x, yMid, text) {
        if (!(yMid > 0)) return;
        ctx.fillStyle = '#1c2430';
        ctx.font = (11 * d) + 'px Vazirmatn,Tahoma,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, x, yMid);
      }
      labelLayer(g.xl, (g.yJoin + yPix(g, model.wl)) / 2, PL.t('sim.u-tube.settle.waterLabel'));
      labelLayer(g.xr, (g.yJoin + yPix(g, model.wr)) / 2, PL.t('sim.u-tube.settle.waterLabel'));
      if (model.tl > 1) {
        labelLayer(g.xl, (yPix(g, model.wl) + yPix(g, model.wl + model.tl)) / 2,
          liquidName() + ' · ' + PL.format.num(top.rho, 0));
      }
      if (model.tr > 1) {
        labelLayer(g.xr, (yPix(g, model.wr) + yPix(g, model.wr + model.tr)) / 2,
          liquidName() + ' · ' + PL.format.num(top.rho, 0));
      }

      var pL = model.gaugePressurePa('L');
      var pR = model.gaugePressurePa('R');
      var dP = pL - pR;
      drawBar(ctx, g.xl, g.yJoin + 16 * d, pL, model.wl, model.tl, top, d);
      drawBar(ctx, g.xr, g.yJoin + 16 * d, pR, model.wr, model.tr, top, d);
      ctx.fillStyle = '#1c2430';
      ctx.font = (10 * d) + 'px Vazirmatn,Tahoma,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(PL.t('sim.u-tube.settle.barTitle'), g.cx, g.yJoin + 78 * d);

      if (!model.settled.value && Math.abs(dP) > 5) {
        var dir = dP > 0 ? 1 : -1;
        var len = Math.min(g.Rout * 0.9, 18 * d + Math.abs(dP) / 40);
        var yA = g.yJoin + g.Rout * 0.35;
        var x0 = g.cx - dir * len;
        var x1 = g.cx + dir * len;
        ctx.strokeStyle = '#c92a2a';
        ctx.fillStyle = '#c92a2a';
        ctx.lineWidth = 3 * d;
        ctx.beginPath();
        ctx.moveTo(x0, yA);
        ctx.lineTo(x1, yA);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1, yA);
        ctx.lineTo(x1 - dir * 10 * d, yA - 6 * d);
        ctx.lineTo(x1 - dir * 10 * d, yA + 6 * d);
        ctx.closePath();
        ctx.fill();
        ctx.font = (11 * d) + 'px Vazirmatn,Tahoma,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(PL.t('sim.u-tube.settle.dP'), g.cx, yA - 10 * d);
      }

      if (!model.settled.value && model.pouredAny) {
        drawFlow(ctx, g, dP, now, d);
      }

      if (model.settled.value) {
        var hiTop = Math.max(model.wl + model.tl, model.wr + model.tr);
        var yDash = yPix(g, hiTop);
        ctx.save();
        ctx.setLineDash([6 * d, 4 * d]);
        ctx.strokeStyle = '#1c2430';
        ctx.lineWidth = 1.4 * d;
        ctx.beginPath();
        ctx.moveTo(g.xl - g.w - 20 * d, yDash);
        ctx.lineTo(g.xr + g.w + 20 * d, yDash);
        ctx.stroke();
        ctx.restore();
      }

      if (statusEl) statusEl.textContent = statusText();
      if (canvas) canvas.setAttribute('aria-label', ariaLabel());
      syncLocks();
      syncExplain();
    }

    function drawBar(ctx, x, y, pPa, waterH, topH, top, d) {
      var maxPa = 3000;
      var h = 48 * d;
      var w = 18 * d;
      ctx.fillStyle = '#eee6d4';
      ctx.strokeStyle = '#8a6a10';
      ctx.lineWidth = 1.2 * d;
      ctx.fillRect(x - w / 2, y, w, h);
      ctx.strokeRect(x - w / 2, y, w, h);
      var waterPa = PL.sims['u-tube'].settle.CONST.G * 1000 * waterH / 100;
      var topPa = PL.sims['u-tube'].settle.CONST.G * top.rho * topH / 100;
      var hW = Math.min(h, h * waterPa / maxPa);
      var hT = Math.min(h - hW, h * topPa / maxPa);
      ctx.fillStyle = WATER.fill;
      ctx.fillRect(x - w / 2 + 1, y + h - hW, w - 2, hW);
      ctx.fillStyle = top.fill;
      ctx.fillRect(x - w / 2 + 1, y + h - hW - hT, w - 2, hT);
      ctx.fillStyle = '#1c2430';
      ctx.font = (10 * d) + 'px Vazirmatn,Tahoma,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(PL.format.num(pPa / 1000, 2), x, y + h + 14 * d);
    }

    function drawFlow(ctx, g, dP, now, d) {
      if (!(Math.abs(dP) > 5)) return;
      var dir = dP > 0 ? 1 : -1;
      var y = g.yJoin + (g.Rout + g.Rin) * 0.25;
      var x0 = g.xl;
      var x1 = g.xr;
      var i, x;
      ctx.fillStyle = '#c92a2a';
      ctx.strokeStyle = '#c92a2a';
      if (reducedMotion()) {
        for (i = 0; i < 5; i++) {
          x = x0 + (i + 0.5) / 5 * (x1 - x0);
          ctx.beginPath();
          ctx.moveTo(x - dir * 6 * d, y - 5 * d);
          ctx.lineTo(x + dir * 6 * d, y);
          ctx.lineTo(x - dir * 6 * d, y + 5 * d);
          ctx.stroke();
        }
        return;
      }
      var speed = Math.min(2, Math.abs(dP) / 80);
      var shift = ((now - t0) / 400 * speed) % 1;
      for (i = 0; i < 8; i++) {
        var t = (i / 8 + (dir > 0 ? shift : 1 - shift)) % 1;
        x = x0 + t * (x1 - x0);
        ctx.beginPath();
        ctx.arc(x, y, 3 * d, 0, 6.2832);
        ctx.fill();
      }
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

    return {
      mount: function (stage, panel) {
        widgets = [];
        unsubs = [];
        predRadios = [];
        liqRadios = [];
        t0 = 0;
        stage.className = 'sim-stage lab';
        stage.innerHTML = '';
        panel.innerHTML = '';
        canvas = document.createElement('canvas');
        canvas.setAttribute('aria-label', PL.t('sim.u-tube.settle.canvas'));
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        stage.appendChild(canvas);

        var pred = PL.ui.radio(model.prediction, {
          title: PL.t('sim.u-tube.settle.predictTitle'),
          name: 'settle-pred',
          items: [
            { value: 'up', label: PL.t('sim.u-tube.settle.predUp') },
            { value: 'down', label: PL.t('sim.u-tube.settle.predDown') },
            { value: 'same', label: PL.t('sim.u-tube.settle.predSame') }
          ]
        });
        var q = document.createElement('p');
        q.className = 'hint';
        q.style.position = 'static';
        q.textContent = PL.t('sim.u-tube.settle.predictQ');
        pred.el.insertBefore(q, pred.el.children[1] || null);
        predRadios = collectRadios(pred.el);
        widgets.push(pred);
        panel.appendChild(pred.el);

        var liq = PL.ui.radio(model.topLiquid, {
          title: PL.t('sim.u-tube.settle.liquid'),
          name: 'settle-liq',
          items: [
            { value: 'oil', label: PL.t('sim.u-tube.settle.oilRadio') },
            { value: 'kerosene', label: PL.t('sim.u-tube.settle.keroRadio') }
          ]
        });
        liqRadios = collectRadios(liq.el);
        widgets.push(liq);
        panel.appendChild(liq.el);

        var arm = PL.ui.radio(model.pourArm, {
          title: PL.t('sim.u-tube.settle.arm'),
          name: 'settle-arm',
          items: [
            { value: 'L', label: PL.t('sim.u-tube.settle.armL') },
            { value: 'R', label: PL.t('sim.u-tube.settle.armR') }
          ]
        });
        widgets.push(arm);
        panel.appendChild(arm.el);

        var sl = PL.ui.slider(model.pourAmount, {
          min: 1,
          max: 6,
          step: 0.5,
          decimals: 1,
          label: PL.t('sim.u-tube.settle.amount')
        });
        widgets.push(sl);
        panel.appendChild(sl.el);

        var bPour = document.createElement('div');
        bPour.className = 'box';
        pourBtn = document.createElement('button');
        pourBtn.type = 'button';
        pourBtn.textContent = PL.t('sim.u-tube.settle.pour');
        pourBtn.addEventListener('click', function () {
          model.pour();
        });
        pourCap = document.createElement('p');
        pourCap.className = 'hidden';
        pourCap.textContent = PL.t('sim.u-tube.settle.full');
        bPour.appendChild(pourBtn);
        bPour.appendChild(pourCap);
        panel.appendChild(bPour);

        statusEl = document.createElement('p');
        statusEl.className = 'hint';
        statusEl.style.position = 'static';
        statusEl.setAttribute('aria-live', 'polite');
        panel.appendChild(statusEl);

        explainEl = document.createElement('div');
        explainEl.className = 'box hidden';
        panel.appendChild(explainEl);

        function onChange() { syncLocks(); }
        function onExplain() { syncExplain(); }
        model.settled.link(onChange);
        model.explained.link(onExplain);
        model.pourArm.link(onChange);
        unsubs.push(function () { model.settled.unlink(onChange); });
        unsubs.push(function () { model.explained.unlink(onExplain); });
        unsubs.push(function () { model.pourArm.unlink(onChange); });
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
        t0 = 0;
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
        canvas = statusEl = explainEl = pourBtn = pourCap = null;
        predRadios = [];
        liqRadios = [];
      }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims['u-tube'] = PL.sims['u-tube'] || {};
  PL.sims['u-tube'].createSettleView = createView;
})(window.PL = window.PL || {});
