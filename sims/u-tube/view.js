(function (PL) {
  var LIQ = null;

  function geometry(W, H, d) {
    var bore = Math.max(16 * d, Math.min(22 * d, W * 0.028));
    var gap = Math.min(W * 0.28, 168 * d);
    var HMAX = 36;
    var armH = Math.min(H * 0.70, 360 * d);
    var yJoin = H * 0.10 + armH;
    var yOpen = yJoin - armH;
    return {
      w: bore, HMAX: HMAX, armH: armH, yOpen: yOpen, yJoin: yJoin,
      xl: W * 0.48 - gap / 2, xr: W * 0.48 + gap / 2, cx: W * 0.48,
      Rout: gap / 2 + bore, Rin: Math.max(bore * 0.4, gap / 2 - bore),
      px: armH / HMAX
    };
  }
  function yPix(g, h) { return g.yJoin - h * g.px; }
  function hFromY(g, py) { return (g.yJoin - py) / g.px; }
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
  function atm(ctx, x, y, d) {
    ctx.strokeStyle = '#2b8a3e';
    ctx.fillStyle = '#2b8a3e';
    ctx.lineWidth = 2.2 * d;
    ctx.lineCap = 'round';
    var i;
    for (i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 7 * d, y - 22 * d);
      ctx.lineTo(x + i * 7 * d, y - 3 * d);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + i * 7 * d, y);
      ctx.lineTo(x + i * 7 * d - 5 * d, y - 9 * d);
      ctx.lineTo(x + i * 7 * d + 5 * d, y - 9 * d);
      ctx.closePath();
      ctx.fill();
    }
    ctx.font = (11 * d) + 'px Tahoma,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(PL.t('sim.u-tube.atm'), x, y - 28 * d);
  }
  function ruler(ctx, g, d) {
    var x = g.xl - g.w - 22 * d, cm, yy;
    ctx.strokeStyle = '#1c2430';
    ctx.lineWidth = 1.4 * d;
    ctx.beginPath();
    ctx.moveTo(x, g.yOpen);
    ctx.lineTo(x, g.yJoin);
    ctx.stroke();
    ctx.font = (10 * d) + 'px Tahoma,sans-serif';
    ctx.textAlign = 'right';
    for (cm = 0; cm <= g.HMAX; cm += 2) {
      yy = yPix(g, cm);
      var long = cm % 4 === 0;
      ctx.beginPath();
      ctx.moveTo(x - (long ? 8 : 4) * d, yy);
      ctx.lineTo(x, yy);
      ctx.stroke();
      if (long) {
        ctx.fillStyle = '#1c2430';
        ctx.fillText(String(cm), x - 10 * d, yy + 3 * d);
      }
    }
    ctx.fillText('cm', x, g.yOpen - 8 * d);
  }
  function point(ctx, x, y, lab, on, ok, d) {
    ctx.beginPath();
    ctx.arc(x, y, 8 * d, 0, 6.2832);
    ctx.fillStyle = !on ? '#95a5a6' : (ok === false ? '#c0392b' : '#8e44ad');
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.2 * d;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = (11 * d) + 'px Tahoma,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(lab, x, y + 4 * d);
  }

  function liqName(id) {
    return PL.t(LIQ[id].nameKey);
  }

  function formulaOf(layers) {
    if (!layers.length) return 'P<sub>atm</sub>';
    var s = 'P<sub>atm</sub>';
    var i;
    for (i = 0; i < layers.length; i++) s += ' + ρ<sub>' + liqName(layers[i].id) + '</sub>gh<sub>' + (i + 1) + '</sub>';
    return s;
  }

  function formulaNum(layers, hideUnk, model) {
    if (!layers.length) return 'P<sub>atm</sub>';
    var s = 'P<sub>atm</sub>';
    var i, h;
    for (i = 0; i < layers.length; i++) {
      h = layers[i].h;
      if (hideUnk && !model.revealed.value && layers[i].unknown) {
        s += ' + ρ<sub>' + liqName(layers[i].id) + '</sub> g (؟)';
      } else {
        s += ' + ρ<sub>' + liqName(layers[i].id) + '</sub> g (' + h.toFixed(1) + ')';
      }
    }
    return s;
  }

  function createView(model) {
    LIQ = PL.sims['u-tube'].LIQ;
    var canvas, readout, probe, widgets, dpr = 1, geo = null;
    var hoverH = null, meas = null, drag = null;
    var els = {};
    var unsubs = [];

    function drawArm(ctx, x, g, arm, d, hideI) {
      var y = g.yJoin, i, y2, hide;
      for (i = 0; i < arm.length; i++) {
        y2 = y - arm[i].h * g.px;
        layerFill(ctx, x, g.w, y, y2, LIQ[arm[i].id], d);
        ctx.strokeStyle = 'rgba(28,36,48,.35)';
        ctx.lineWidth = 1 * d;
        ctx.beginPath();
        ctx.moveTo(x - g.w, y2);
        ctx.lineTo(x + g.w, y2);
        ctx.stroke();
        hide = hideI === i && !model.revealed.value;
        ctx.font = (11 * d) + 'px Tahoma,sans-serif';
        ctx.textAlign = 'center';
        if (hide) {
          ctx.fillStyle = '#c0392b';
          ctx.fillText('؟', x, (y + y2) / 2 + 4 * d);
        } else if (model.phase.value >= 1) {
          ctx.fillStyle = '#1c2430';
          ctx.fillText(arm[i].h.toFixed(1), x, (y + y2) / 2 + 4 * d);
        }
        y = y2;
      }
      ctx.strokeStyle = 'rgba(255,255,255,.9)';
      ctx.lineWidth = 2 * d;
      ctx.beginPath();
      ctx.moveTo(x - g.w, y);
      ctx.quadraticCurveTo(x, y - 3.5 * d, x + g.w, y);
      ctx.stroke();
      return y;
    }

    function caliper(ctx, g, d) {
      if (!meas) return;
      var y1 = yPix(g, meas.a), y2 = yPix(g, meas.b), x = g.xr + g.w + 28 * d;
      var dh = Math.abs(meas.b - meas.a);
      ctx.strokeStyle = '#c0392b';
      ctx.fillStyle = '#c0392b';
      ctx.lineWidth = 1.8 * d;
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(g.xr + g.w + 4 * d, y1);
      ctx.lineTo(x + 6 * d, y1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(g.xr + g.w + 4 * d, y2);
      ctx.lineTo(x + 6 * d, y2);
      ctx.stroke();
      ctx.font = (12 * d) + 'px Tahoma,sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(dh.toFixed(1) + ' cm', x + 10 * d, (y1 + y2) / 2 + 4 * d);
    }

    function paint() {
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var W = canvas.width, H = canvas.height, d = dpr;
      ctx.clearRect(0, 0, W, H);
      var sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#cfeaf8');
      sky.addColorStop(0.55, '#e8f3c4');
      sky.addColorStop(1, '#d2c09a');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      var yTable = H * 0.93;
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(0, yTable, W, H - yTable);
      ctx.fillStyle = '#6e4220';
      ctx.fillRect(0, yTable, W, 7 * d);
      var g = geometry(W, H, d);
      geo = g;
      var conn = model.connectingId();
      var Fb = conn ? LIQ[conn] : LIQ.w;
      ctx.save();
      tubeClip(ctx, g);
      ctx.clip();
      var bg = ctx.createLinearGradient(g.xl, g.yJoin, g.xr, g.yJoin + g.Rout);
      bg.addColorStop(0, Fb.fill);
      bg.addColorStop(1, Fb.deep);
      ctx.fillStyle = bg;
      ctx.fillRect(g.xl - g.w - 6, g.yJoin - 2, g.xr - g.xl + 2 * g.w + 12, g.Rout + 10);
      var unk = model.unk();
      var yLs = drawArm(ctx, g.xl, g, model.left(), d, unk.arm === 'L' ? unk.i : -1);
      var yRs = drawArm(ctx, g.xr, g, model.right(), d, unk.arm === 'R' ? unk.i : -1);
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(g.xl - g.w, g.yOpen);
      ctx.lineTo(g.xl - g.w, g.yJoin);
      ctx.arc(g.cx, g.yJoin, g.Rout, Math.PI, 0, true);
      ctx.lineTo(g.xr + g.w, g.yOpen);
      ctx.moveTo(g.xr - g.w, g.yOpen);
      ctx.lineTo(g.xr - g.w, g.yJoin);
      ctx.arc(g.cx, g.yJoin, g.Rin, 0, Math.PI, false);
      ctx.lineTo(g.xl + g.w, g.yOpen);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,.55)';
      ctx.lineWidth = 8 * d;
      ctx.stroke();
      ctx.strokeStyle = '#5d6b79';
      ctx.lineWidth = 3 * d;
      ctx.stroke();
      ctx.strokeStyle = '#5d6b79';
      ctx.lineWidth = 3.4 * d;
      ctx.beginPath();
      ctx.moveTo(g.xl - g.w - 2 * d, g.yOpen);
      ctx.lineTo(g.xl + g.w + 2 * d, g.yOpen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(g.xr - g.w - 2 * d, g.yOpen);
      ctx.lineTo(g.xr + g.w + 2 * d, g.yOpen);
      ctx.stroke();
      ctx.fillStyle = '#1c2430';
      ctx.font = (14 * d) + 'px Tahoma,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(PL.t('sim.u-tube.left'), g.xl, g.yOpen - 10 * d);
      ctx.fillText(PL.t('sim.u-tube.right'), g.xr, g.yOpen - 10 * d);
      atm(ctx, g.xl, yLs - 4 * d, d);
      atm(ctx, g.xr, yRs - 4 * d, d);
      ruler(ctx, g, d);
      if (model.ref.value != null) {
        var yr = yPix(g, model.ref.value);
        ctx.setLineDash([9 * d, 6 * d]);
        ctx.strokeStyle = model.valid.value === false ? '#c0392b' : (model.valid.value ? '#8e44ad' : '#e67e22');
        ctx.lineWidth = 2.4 * d;
        ctx.beginPath();
        ctx.moveTo(g.xl - g.w - 48 * d, yr);
        ctx.lineTo(g.xr + g.w + 48 * d, yr);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = (12 * d) + 'px Tahoma,sans-serif';
        ctx.fillText(PL.t('sim.u-tube.ref'), g.cx, yr - 8 * d);
        if (model.phase.value >= 2) {
          point(ctx, g.xl, yr, 'آ', model.pointL.value, model.valid.value, d);
          point(ctx, g.xr, yr, 'ب', model.pointR.value, model.valid.value, d);
        }
      }
      caliper(ctx, g, d);
      if (hoverH != null) {
        var yh = yPix(g, hoverH);
        ctx.setLineDash([3 * d, 3 * d]);
        ctx.strokeStyle = 'rgba(28,36,48,.35)';
        ctx.lineWidth = 1 * d;
        ctx.beginPath();
        ctx.moveTo(g.xl - g.w - 40 * d, yh);
        ctx.lineTo(g.xr + g.w + 40 * d, yh);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (probe) {
        var txt = 'ارتفاع: —';
        if (hoverH != null) txt = 'ارتفاع: ' + PL.format.num(hoverH, 1) + ' cm';
        if (meas) txt += '   اندازه: ' + PL.format.num(Math.abs(meas.b - meas.a), 1) + ' cm';
        probe.textContent = txt;
      }
    }

    function reasonText() {
      var k = model.reasonKey.value;
      if (!k) return '';
      if (k === 'sim.u-tube.valid') return PL.t(k, { name: PL.t(model.reasonName.value) });
      return PL.t(k);
    }

    function syncPanel() {
      if (!els.cases) return;
      var i, b, used, ids, k, html, left, right;
      els.cases.innerHTML = '';
      for (i = 0; i < PL.sims['u-tube'].CASES.length; i++) {
        b = document.createElement('button');
        b.type = 'button';
        b.className = model.caseIndex.value === i ? 'on' : '';
        b.textContent = PL.t(PL.sims['u-tube'].CASES[i].nameKey);
        (function (idx) {
          b.addEventListener('click', function () { model.caseIndex.value = idx; });
        })(i);
        els.cases.appendChild(b);
      }
      used = {};
      ids = [];
      left = model.left();
      right = model.right();
      function add(a) {
        for (k = 0; k < a.length; k++) {
          if (!used[a[k].id]) {
            used[a[k].id] = 1;
            ids.push(a[k].id);
          }
        }
      }
      add(left);
      add(right);
      els.leg.innerHTML = ids.map(function (id) {
        return '<span><i style="background:' + LIQ[id].fill + '"></i>' + liqName(id) + ' ' + LIQ[id].rho + ' kg/m³</span>';
      }).join('');
      els.phases.innerHTML = '';
      var keys = ['Explore', 'Measure', 'Points', 'Equation', 'Solve'];
      for (i = 0; i < 5; i++) {
        b = document.createElement('button');
        b.type = 'button';
        b.className = model.phase.value === i ? 'on' : '';
        b.textContent = PL.t('sim.u-tube.phase' + keys[i]);
        (function (idx) {
          b.addEventListener('click', function () { model.phase.value = idx; });
        })(i);
        els.phases.appendChild(b);
      }
      els.hint.textContent = PL.t('sim.u-tube.hint' + keys[model.phase.value]);
      els.calcBox.style.display = model.phase.value >= 4 ? 'block' : 'none';
      var v = model.valid.value;
      els.ust.className = 'vis-state ' + (v === false ? 'bad' : 'ok');
      els.ust.textContent = v === true ? PL.t('sim.u-tube.validPts') : (v === false ? PL.t('sim.u-tube.invalidPts') : PL.t('sim.u-tube.phase' + keys[model.phase.value]));
      els.g98.className = model.g.value === 9.8 ? 'on' : '';
      els.g10.className = model.g.value === 10 ? 'on' : '';
      if (!model.compared.value) {
        els.eqbox.innerHTML = '<span class="formula">P = P<sub>atm</sub> + Σ ρ g h</span>';
        els.why.className = 'why';
        els.why.textContent = reasonText() || PL.t('sim.u-tube.compareHint');
        return;
      }
      model.judge();
      var aL = model.equationTerms('L', model.ref.value);
      var aR = model.equationTerms('R', model.ref.value);
      html = '<div>' + PL.t('sim.u-tube.left') + ': <span class="formula">' + formulaNum(aL, true, model) + '</span></div>';
      html += '<div>' + PL.t('sim.u-tube.right') + ': <span class="formula">' + formulaNum(aR, true, model) + '</span></div>';
      if (model.valid.value) {
        html += '<span class="formula">P<sub>L</sub> = P<sub>R</sub></span>';
        html += '<span class="formula">' + formulaOf(aL).replace('P<sub>atm</sub> + ', '') + ' = ' + formulaOf(aR).replace('P<sub>atm</sub> + ', '') + '</span>';
      }
      els.eqbox.innerHTML = html;
      els.why.className = 'why ' + (model.valid.value ? 'ok' : 'bad');
      els.why.textContent = reasonText();
    }

    function local(e) {
      var r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
    }
    function nearArm(g, x, side) {
      var ax = side === 'L' ? g.xl : g.xr;
      return Math.abs(x - ax) < g.w + 18 * dpr;
    }

    function bindCanvas() {
      canvas.addEventListener('pointerdown', function (e) {
        if (!geo) return;
        var p = local(e), g = geo, h = model.snapY(hFromY(g, p.y));
        if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
        if (model.phase.value >= 1 && p.x > g.xr + g.w + 8) {
          drag = 'meas';
          meas = { a: h, b: h };
          return;
        }
        if (model.phase.value >= 1 && model.ref.value != null && Math.abs(p.y - yPix(g, model.ref.value)) < 10 * dpr) {
          drag = 'ref';
          return;
        }
        model.setRef(h);
        if (model.phase.value >= 2) {
          if (nearArm(g, p.x, 'L')) model.setPoint('L');
          else if (nearArm(g, p.x, 'R')) model.setPoint('R');
          else model.setPoint(null);
        }
        drag = 'ref';
        syncPanel();
      });
      canvas.addEventListener('pointermove', function (e) {
        if (!geo) return;
        var p = local(e), g = geo, h = hFromY(g, p.y);
        hoverH = Math.max(0, Math.min(g.HMAX, h));
        if (!drag) return;
        var sh = model.snapY(hoverH);
        if (drag === 'ref') model.setRef(sh);
        if (drag === 'meas' && meas) meas.b = sh;
      });
      canvas.addEventListener('pointerup', function () {
        drag = null;
        syncPanel();
      });
      canvas.addEventListener('pointercancel', function () { drag = null; });
    }

    return {
      mount: function (stage, panel) {
        widgets = [];
        els = {};
        hoverH = null;
        meas = null;
        drag = null;
        stage.className = 'sim-stage lab';
        stage.innerHTML = '';
        panel.innerHTML = '';
        readout = document.createElement('div');
        readout.className = 'readout';
        probe = document.createElement('span');
        probe.className = 'probe';
        probe.id = 'probe';
        probe.setAttribute('aria-live', 'polite');
        probe.textContent = 'cm';
        readout.appendChild(probe);
        canvas = document.createElement('canvas');
        canvas.setAttribute('aria-label', PL.t('sim.u-tube.canvas'));
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        stage.appendChild(readout);
        stage.appendChild(canvas);
        bindCanvas();

        function box(title) {
          var d = document.createElement('div');
          d.className = 'box';
          var h = document.createElement('h3');
          h.textContent = title;
          d.appendChild(h);
          return d;
        }

        var bCases = box(PL.t('sim.u-tube.layout'));
        els.cases = document.createElement('div');
        els.cases.className = 'row';
        els.leg = document.createElement('div');
        els.leg.className = 'leg';
        bCases.appendChild(els.cases);
        bCases.appendChild(els.leg);
        panel.appendChild(bCases);

        var bWork = box(PL.t('sim.u-tube.work'));
        els.phases = document.createElement('div');
        els.phases.className = 'phases';
        els.hint = document.createElement('p');
        els.hint.className = 'hint';
        bWork.appendChild(els.phases);
        bWork.appendChild(els.hint);
        panel.appendChild(bWork);

        var bPts = box(PL.t('sim.u-tube.points'));
        var cmp = document.createElement('button');
        cmp.type = 'button';
        cmp.textContent = PL.t('sim.u-tube.compare');
        cmp.addEventListener('click', function () {
          model.compare();
          syncPanel();
        });
        els.why = document.createElement('p');
        els.why.className = 'why';
        bPts.appendChild(cmp);
        bPts.appendChild(els.why);
        panel.appendChild(bPts);

        var bEq = box(PL.t('sim.u-tube.equation'));
        els.eqbox = document.createElement('div');
        els.eqbox.className = 'eqbox';
        bEq.appendChild(els.eqbox);
        panel.appendChild(bEq);

        els.calcBox = box(PL.t('sim.u-tube.predict'));
        var num = document.createElement('div');
        num.className = 'num-row';
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.min = '0';
        inp.max = '40';
        inp.step = '0.1';
        inp.placeholder = 'cm';
        inp.setAttribute('aria-label', PL.t('sim.u-tube.predict'));
        var sp = document.createElement('span');
        sp.textContent = 'cm';
        var chk = document.createElement('button');
        chk.type = 'button';
        chk.textContent = PL.t('sim.u-tube.check');
        els.chk = document.createElement('p');
        els.chk.className = 'why';
        chk.addEventListener('click', function () {
          var n = PL.format.parseNum(inp.value);
          var r = model.checkGuess(n);
          if (r.need) {
            els.chk.className = 'why bad';
            els.chk.textContent = PL.t('sim.u-tube.needNumber');
            syncPanel();
            return;
          }
          els.chk.className = 'why ' + (r.ok ? 'ok' : 'bad');
          els.chk.textContent = 'پاسخ تو ' + PL.format.num(r.guess, 1) + ' cm — مدل ' + PL.format.num(r.ans, 1) + ' cm — اختلاف ' + PL.format.num(r.err, 1) + (r.ok ? ' — تأیید' : ' — از معادله دوباره حساب کن');
          syncPanel();
        });
        num.appendChild(inp);
        num.appendChild(sp);
        num.appendChild(chk);
        els.calcBox.appendChild(num);
        els.calcBox.appendChild(els.chk);
        panel.appendChild(els.calcBox);

        var bG = document.createElement('div');
        bG.className = 'box';
        var rowG = document.createElement('div');
        rowG.className = 'row';
        els.g98 = document.createElement('button');
        els.g98.type = 'button';
        els.g98.textContent = PL.t('sim.u-tube.g98');
        els.g10 = document.createElement('button');
        els.g10.type = 'button';
        els.g10.textContent = PL.t('sim.u-tube.g10');
        els.g98.addEventListener('click', function () { model.g.value = 9.8; });
        els.g10.addEventListener('click', function () { model.g.value = 10; });
        rowG.appendChild(els.g98);
        rowG.appendChild(els.g10);
        bG.appendChild(rowG);
        panel.appendChild(bG);

        els.ust = document.createElement('div');
        els.ust.className = 'vis-state ok';
        panel.appendChild(els.ust);

        unsubs = [];
        function track(prop) {
          prop.lazyLink(syncPanel);
          unsubs.push(function () { prop.unlink(syncPanel); });
        }
        track(model.caseIndex);
        track(model.phase);
        track(model.g);
        track(model.compared);
        track(model.valid);
        track(model.revealed);
        syncPanel();
      },
      layout: function (w, h, nextDpr) {
        dpr = nextDpr;
        if (!canvas) return;
        var r = canvas.getBoundingClientRect();
        PL.draw.fitCanvas(canvas, r.width, r.height, dpr);
      },
      draw: paint,
      reset: function () {
        hoverH = null;
        meas = null;
        drag = null;
        if (els.chk) els.chk.textContent = '';
        syncPanel();
      },
      dispose: function () {
        var i;
        for (i = 0; i < unsubs.length; i++) unsubs[i]();
        unsubs = [];
        canvas = readout = probe = null;
        els = {};
        widgets = [];
      }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims['u-tube'] = PL.sims['u-tube'] || {};
  PL.sims['u-tube'].createView = createView;
})(window.PL = window.PL || {});
