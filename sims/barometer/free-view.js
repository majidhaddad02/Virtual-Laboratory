(function (PL) {
  var HG = { fill: '#9aa0a8', deep: '#5c636c' };
  var WATER = { fill: '#3d9be8', deep: '#155a96' };

  function createView(model) {
    var canvas, statusEl, forceEl, widgets, unsubs, detailsEl;
    var dpr = 1;
    var phys = PL.sims.barometer.physics;

    function statusText() {
      if (model.statusKind === 'down') return PL.t('sim.barometer.hDown');
      if (model.statusKind === 'up') return PL.t('sim.barometer.hUp');
      return PL.t('sim.barometer.hSettled');
    }

    function syncForce() {
      if (!forceEl) return;
      var fb = model.forceReadout();
      if (!fb) {
        forceEl.innerHTML = '<p>' + PL.t('sim.barometer.fullNoEq') + '</p>';
        return;
      }
      var html = '<p>' + PL.t('sim.barometer.fAir') + ': <span class="ltr">' + PL.format.num(fb.F_air, 2) + ' N</span></p>';
      html += '<p>' + PL.t('sim.barometer.weight') + ': <span class="ltr">' + PL.format.num(fb.W, 2) + ' N</span></p>';
      html += '<p class="why">' + PL.t('sim.barometer.forceNote') + '</p>';
      forceEl.innerHTML = html;
    }

    function syncDetails() {
      if (!detailsEl) return;
      var P = model.pressurePa();
      var u = phys.units(P);
      var c = model.columns();
      var ratio = c.w.hV / c.hg.hV;
      var html = '<table class="pl-worksheet-table"><tbody>';
      html += '<tr><th class="ltr">Pa</th><td class="ltr">' + PL.format.num(u.Pa, 0) + '</td></tr>';
      html += '<tr><th class="ltr">kPa</th><td class="ltr">' + PL.format.num(u.kPa, 3) + '</td></tr>';
      html += '<tr><th class="ltr">cmHg</th><td class="ltr">' + PL.format.num(u.cmHg, 3) + '</td></tr>';
      html += '<tr><th class="ltr">mmHg</th><td class="ltr">' + PL.format.num(u.mmHg, 2) + '</td></tr>';
      html += '<tr><th class="ltr">atm</th><td class="ltr">' + PL.format.num(u.atm, 4) + '</td></tr>';
      html += '</tbody></table>';
      html += '<p>' + PL.t('sim.barometer.ratio', { n: PL.format.num(ratio, 1) }) + '</p>';
      var maxH = Math.max(c.hg.hV, c.w.hV, 0.01);
      html += '<div class="bar" style="margin:6px 0"><i style="width:' + (100 * c.hg.hV / maxH) + '%;background:' + HG.fill + '"></i></div>';
      html += '<div class="bar" style="margin:6px 0"><i style="width:' + (100 * c.w.hV / maxH) + '%;background:' + WATER.fill + '"></i></div>';
      var body = detailsEl.children[1];
      if (body) body.innerHTML = html;
    }

    function drawTube(ctx, x, baseY, Lpx, tw, col, hNow, L, seaH, fill, d, label) {
      var tilt = (model.tilt.value * Math.PI) / 180;
      var mouthX = x;
      var mouthY = baseY + 8 * d;
      var closedX = mouthX + Math.sin(tilt) * Lpx;
      var closedY = mouthY - Math.cos(tilt) * Lpx;
      var ux = closedX - mouthX;
      var uy = closedY - mouthY;
      var len = Math.sqrt(ux * ux + uy * uy) || 1;
      ux /= len;
      uy /= len;
      var px = -uy;
      var py = ux;
      var alongPx = (hNow / L) * Lpx;
      if (alongPx > Lpx) alongPx = Lpx;

      ctx.fillStyle = fill.deep;
      ctx.beginPath();
      ctx.ellipse(x, baseY + 14 * d, tw * 3.2, 12 * d, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fill.fill;
      ctx.beginPath();
      ctx.ellipse(x, baseY, tw * 3.2, 10 * d, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(mouthX + px * tw, mouthY + py * tw);
      ctx.lineTo(closedX + px * tw, closedY + py * tw);
      ctx.arc(closedX, closedY, tw, Math.atan2(py, px), Math.atan2(py, px) + Math.PI, false);
      ctx.lineTo(mouthX - px * tw, mouthY - py * tw);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = '#d7eef9';
      ctx.fill();
      ctx.fillStyle = fill.fill;
      ctx.beginPath();
      ctx.moveTo(mouthX + px * tw, mouthY + py * tw);
      ctx.lineTo(mouthX + px * tw + ux * alongPx, mouthY + py * tw + uy * alongPx);
      ctx.lineTo(mouthX - px * tw + ux * alongPx, mouthY - py * tw + uy * alongPx);
      ctx.lineTo(mouthX - px * tw, mouthY - py * tw);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(mouthX + px * tw, mouthY + py * tw);
      ctx.lineTo(closedX + px * tw, closedY + py * tw);
      ctx.arc(closedX, closedY, tw, Math.atan2(py, px), Math.atan2(py, px) + Math.PI, false);
      ctx.lineTo(mouthX - px * tw, mouthY - py * tw);
      ctx.closePath();
      ctx.strokeStyle = '#5d6b79';
      ctx.lineWidth = 2.4 * d;
      ctx.stroke();

      var seaPx = (seaH / L) * Lpx;
      ctx.save();
      ctx.setLineDash([5 * d, 4 * d]);
      ctx.strokeStyle = '#1c2430';
      ctx.lineWidth = 1.2 * d;
      ctx.beginPath();
      ctx.moveTo(mouthX + ux * seaPx - 18 * d, mouthY + uy * seaPx);
      ctx.lineTo(mouthX + ux * seaPx + 18 * d, mouthY + uy * seaPx);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#1c2430';
      ctx.font = (10 * d) + 'px Vazirmatn,Tahoma,sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(PL.t('sim.barometer.seaLine'), mouthX + ux * seaPx + 20 * d, mouthY + uy * seaPx);

      var n, t, y;
      ctx.strokeStyle = '#1c2430';
      ctx.lineWidth = 1 * d;
      ctx.font = (9 * d) + 'px Vazirmatn,Tahoma,sans-serif';
      for (n = 0; n <= L; n += L >= 5 ? 2 : 0.2) {
        t = (n / L) * Lpx;
        ctx.beginPath();
        ctx.moveTo(mouthX - px * (tw + 4 * d) + ux * t, mouthY - py * (tw + 4 * d) + uy * t);
        ctx.lineTo(mouthX - px * (tw + 10 * d) + ux * t, mouthY - py * (tw + 10 * d) + uy * t);
        ctx.stroke();
      }

      ctx.fillStyle = '#1c2430';
      ctx.font = (12 * d) + 'px Vazirmatn,Tahoma,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, baseY + 36 * d);
    }

    function paint() {
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var W = canvas.width;
      var H = canvas.height;
      var d = dpr;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#d7eef9';
      ctx.fillRect(0, 0, W, H * 0.72);
      ctx.fillStyle = '#efe6d2';
      ctx.fillRect(0, H * 0.72, W, H * 0.28);

      var c = model.columns();
      var rPx = (8 + model.radius.value * 6) * d;
      var baseY = H * 0.72;
      var Lhg = Math.min(H * 0.55, 280 * d);
      var Lw = Math.min(H * 0.55, 280 * d);
      drawTube(ctx, W * 0.28, baseY, Lhg, rPx, c.hg, model.hHg, phys.TUBE_HG, 0.76, HG, d, PL.t('sim.barometer.mercury'));
      drawTube(ctx, W * 0.72, baseY, Lw, rPx, c.w, model.hW, phys.TUBE_W, 10.33, WATER, d, PL.t('sim.barometer.water'));

      ctx.fillStyle = '#1c2430';
      ctx.font = (12 * d) + 'px Vazirmatn,Tahoma,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(PL.t('sim.barometer.scaleNote'), W / 2, 22 * d);

      function readout(x, col, hNow, isHg) {
        var lines = [];
        if (isHg) lines.push(PL.format.num(hNow * 100, 2) + ' cm');
        else lines.push(PL.format.num(hNow, 2) + ' m');
        if (model.tilt.value > 0) {
          lines.push(PL.format.num(isHg ? col.along * 100 : col.along, 2) + (isHg ? ' cm' : ' m'));
        }
        lines.push(col.full ? PL.t('sim.barometer.tubeFull') : PL.t('sim.barometer.vacAbove'));
        if (col.full) {
          lines.push(PL.t('sim.barometer.pTop') + ' ' + PL.format.num(col.pTop / 1000, 2) + ' kPa');
        }
        ctx.font = (11 * d) + 'px Vazirmatn,Tahoma,sans-serif';
        ctx.textAlign = 'center';
        var i;
        for (i = 0; i < lines.length; i++) ctx.fillText(lines[i], x, 40 * d + i * 16 * d);
      }
      readout(W * 0.28, c.hg, model.hHg, true);
      readout(W * 0.72, c.w, model.hW, false);

      if (statusEl) statusEl.textContent = statusText();
      if (canvas) canvas.setAttribute('aria-label', PL.t('sim.barometer.canvasFree') + ' — ' + statusText());
      syncForce();
      syncDetails();
    }

    function presetBtn(labelKey, alt, box) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = PL.t(labelKey);
      b.title = PL.t('sim.barometer.altApprox');
      b.setAttribute('aria-description', PL.t('sim.barometer.altApprox'));
      b.addEventListener('click', function () {
        model.altitude.value = alt;
      });
      box.appendChild(b);
    }

    return {
      mount: function (stage, panel) {
        widgets = [];
        unsubs = [];
        stage.className = 'sim-stage lab';
        stage.innerHTML = '';
        panel.innerHTML = '';
        canvas = document.createElement('canvas');
        canvas.setAttribute('aria-label', PL.t('sim.barometer.canvasFree'));
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        stage.appendChild(canvas);

        var altBox = document.createElement('div');
        altBox.className = 'box';
        var slA = PL.ui.slider(model.altitude, {
          min: 0, max: 9000, step: 50, decimals: 0,
          label: PL.t('sim.barometer.alt')
        });
        widgets.push(slA);
        altBox.appendChild(slA.el);
        var row = document.createElement('div');
        row.className = 'row';
        presetBtn('sim.barometer.sea', 0, row);
        presetBtn('sim.barometer.tehran', 1200, row);
        presetBtn('sim.barometer.damavand', 5610, row);
        presetBtn('sim.barometer.everest', 8849, row);
        altBox.appendChild(row);
        var note = document.createElement('p');
        note.className = 'hint';
        note.style.position = 'static';
        var everestP = phys.atmPressure(8849);
        var everestMm = phys.units(everestP).mmHg;
        note.innerHTML = PL.t('sim.barometer.everestNote', { mm: PL.format.num(everestMm, 0) });
        altBox.appendChild(note);
        panel.appendChild(altBox);

        var slP = PL.ui.slider(model.seaLevelKPa, {
          min: 98, max: 104, step: 0.1, decimals: 3,
          label: PL.t('sim.barometer.weather')
        });
        widgets.push(slP);
        panel.appendChild(slP.el);

        var slT = PL.ui.slider(model.tilt, {
          min: 0, max: 60, step: 1, decimals: 0,
          label: PL.t('sim.barometer.tilt')
        });
        widgets.push(slT);
        panel.appendChild(slT.el);

        var slR = PL.ui.slider(model.radius, {
          min: 0.3, max: 2, step: 0.1, decimals: 1,
          label: PL.t('sim.barometer.radius')
        });
        widgets.push(slR);
        panel.appendChild(slR.el);

        forceEl = document.createElement('div');
        forceEl.className = 'box';
        panel.appendChild(forceEl);

        detailsEl = document.createElement('details');
        detailsEl.className = 'box';
        var openWide = (typeof window !== 'undefined' && window.innerWidth ? window.innerWidth : 1024) >= 760;
        if (openWide) detailsEl.setAttribute('open', '');
        var sum = document.createElement('summary');
        sum.textContent = PL.t('sim.barometer.details');
        sum.style.minHeight = '44px';
        detailsEl.appendChild(sum);
        var body = document.createElement('div');
        detailsEl.appendChild(body);
        panel.appendChild(detailsEl);

        statusEl = document.createElement('p');
        statusEl.className = 'hint';
        statusEl.style.position = 'static';
        statusEl.setAttribute('aria-live', 'polite');
        panel.appendChild(statusEl);

        function onChange() { syncForce(); }
        model.settled.link(onChange);
        model.tilt.link(onChange);
        model.radius.link(onChange);
        unsubs.push(function () { model.settled.unlink(onChange); });
        unsubs.push(function () { model.tilt.unlink(onChange); });
        unsubs.push(function () { model.radius.unlink(onChange); });
        syncForce();
        syncDetails();
      },
      layout: function (w, h, nextDpr) {
        dpr = nextDpr;
        if (!canvas) return;
        var r = canvas.getBoundingClientRect();
        PL.draw.fitCanvas(canvas, r.width, r.height, dpr);
      },
      draw: paint,
      reset: function () {
        syncForce();
        syncDetails();
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
        canvas = statusEl = forceEl = detailsEl = null;
      }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims.barometer = PL.sims.barometer || {};
  PL.sims.barometer.createFreeView = createView;
})(window.PL = window.PL || {});
