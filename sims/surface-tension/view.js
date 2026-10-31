(function (PL) {
  var RESET_SVG = '<svg viewBox="0 0 24 24"><path d="M12 6V2L7 7l5 5V8c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/></svg>';
  var ST = null;

  function arrow(ctx, x0, y0, x1, y1, col, lw, hs) {
    var a = Math.atan2(y1 - y0, x1 - x0);
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1 - Math.cos(a) * hs * 0.6, y1 - Math.sin(a) * hs * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - hs * Math.cos(a - 0.42), y1 - hs * Math.sin(a - 0.42));
    ctx.lineTo(x1 - hs * Math.cos(a + 0.42), y1 - hs * Math.sin(a + 0.42));
    ctx.closePath();
    ctx.fill();
  }

  function drawCap(ctx, W, H, d, theta, A, base, withArc, cx, hg) {
    var ys = base;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#c8b48a';
    ctx.fillRect(0, ys, W, H - ys);
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = d;
    ctx.beginPath();
    var k;
    for (k = -H; k < W; k += 14 * d) {
      ctx.moveTo(k, H);
      ctx.lineTo(k + (H - ys), ys);
    }
    ctx.stroke();
    var th = Math.max(theta, 0.09);
    var sn = Math.sin(th);
    var cs = Math.cos(th);
    var R = Math.sqrt(A / (th - sn * cs));
    var yc = ys + R * cs;
    var aR = Math.atan2(-cs, sn);
    var aL = Math.atan2(-cs, -sn);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, ys + 1);
    ctx.clip();
    var g = ctx.createRadialGradient(cx, ys - 20 * d, 10 * d, cx, ys, R);
    if (hg) {
      g.addColorStop(0, '#e8edf2');
      g.addColorStop(1, '#4a5158');
    } else {
      g.addColorStop(0, '#9fd0f5');
      g.addColorStop(1, '#2b6cb0');
    }
    ctx.fillStyle = g;
    ctx.strokeStyle = hg ? '#2f353c' : '#1e4e86';
    ctx.lineWidth = 2 * d;
    ctx.beginPath();
    ctx.arc(cx, yc, R, aR, aL, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    if (withArc) {
      var px = cx + R * sn;
      var py = ys;
      var tx = sn;
      var ty = -cs;
      var tang = Math.atan2(ty, tx);
      if (tang < 0) tang += 6.2832;
      if (px < W - 20 * d && px > 20 * d) {
        ctx.strokeStyle = '#f08c00';
        ctx.lineWidth = 4 * d;
        ctx.beginPath();
        ctx.arc(px, py, 26 * d, Math.PI, Math.max(Math.PI, tang), false);
        ctx.stroke();
      }
    }
  }

  function drawMeniscusFill(ctx, xl, xr, cx, y0, yE, yCtl, ybot, up, L, d) {
    var g = ctx.createLinearGradient(xl, 0, xr, 0);
    g.addColorStop(0, L.dark);
    g.addColorStop(0.35, L.light);
    g.addColorStop(1, L.fill);
    ctx.beginPath();
    if (!up) {
      ctx.fillStyle = '#efe6d2';
      ctx.fillRect(xl, y0 - 2 * d, xr - xl, Math.max(yE, y0) - y0 + 4 * d);
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.92;
      ctx.moveTo(xl, yE);
      ctx.quadraticCurveTo(cx, yCtl, xr, yE);
      ctx.lineTo(xr, ybot);
      ctx.lineTo(xl, ybot);
      ctx.closePath();
    } else {
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.88;
      ctx.moveTo(xl, y0);
      ctx.lineTo(xl, yE);
      ctx.quadraticCurveTo(cx, yCtl, xr, yE);
      ctx.lineTo(xr, y0);
      ctx.closePath();
    }
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = L.stroke;
    ctx.lineWidth = 2.5 * d;
    ctx.beginPath();
    ctx.moveTo(xl, yE);
    ctx.quadraticCurveTo(cx, yCtl, xr, yE);
    ctx.stroke();
  }

  function drawTube(ctx, xl, xr, ytop, ybot, d) {
    ctx.strokeStyle = '#6b7785';
    ctx.lineWidth = 4 * d;
    ctx.beginPath();
    ctx.moveTo(xl - 2 * d, ytop);
    ctx.lineTo(xl - 2 * d, ybot);
    ctx.moveTo(xr + 2 * d, ytop);
    ctx.lineTo(xr + 2 * d, ybot);
    ctx.stroke();
  }

  function drawBath(ctx, W, H, y0, L, d) {
    ctx.fillStyle = L.fill;
    ctx.globalAlpha = 0.38;
    ctx.fillRect(0, y0, W, H - y0);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = L.stroke;
    ctx.lineWidth = 3 * d;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(W, y0);
    ctx.stroke();
  }

  function capillaryColumn(ctx, W, H, d, opts) {
    var liq = opts.liq;
    var th = opts.th;
    var r = opts.r;
    var cx = opts.cx;
    var harr = opts.harr;
    var idx = opts.idx;
    var L = ST.LIQ[liq];
    var sc = opts.sc;
    var y0 = opts.y0;
    var ytop = opts.ytop;
    var ybot = opts.ybot;
    var showLabel = opts.label;
    var cth = Math.cos(th * Math.PI / 180);
    var ht = ST.capHeightMm(r, th, liq);
    harr[idx] += (ht - harr[idx]) * 0.03;
    var h = harr[idx];
    var rp = r * sc;
    var yc = y0 - h * sc;
    var R = rp / Math.max(0.05, Math.abs(cth));
    var ds = Math.min(rp * 1.4, R - Math.sqrt(Math.max(0, R * R - rp * rp)));
    var sag = (cth >= 0 ? 1 : -1) * ds;
    var xl = cx - rp;
    var xr = cx + rp;
    yc = Math.max(ytop + 36 * d, Math.min(ybot - 6 * d, yc));
    var yE = yc - sag;
    var yCtl = 2 * yc - yE;
    var up = cth >= 0;
    drawMeniscusFill(ctx, xl, xr, cx, y0, yE, yCtl, ybot, up, L, d);
    drawTube(ctx, xl, xr, ytop, ybot, d);
    if (showLabel) {
      ctx.fillStyle = '#1c2430';
      ctx.font = (13 * d) + 'px Tahoma,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(showLabel, cx, ytop + 16 * d);
    }
    var Fw = 2 * Math.PI * (r / 1000) * L.g * Math.abs(cth) * 18000 * d;
    var Wg = Math.PI * (r / 1000) * (r / 1000) * L.rho * 9.8 * Math.abs(h) / 1000 * 18000 * d;
    Fw = Math.min(Fw, H * 0.28);
    Wg = Math.min(Wg, H * 0.28);
    var px = xr + 18 * d;
    if (Fw > 2 * d) {
      arrow(ctx, px, yc, px, up ? yc - Fw : yc + Fw, '#2e86c1', 3.5 * d, 10 * d);
      if (Wg > 2 * d) arrow(ctx, px + 12 * d, yc, px + 12 * d, up ? yc + Wg : yc - Wg, '#c92a2a', 3.5 * d, 10 * d);
    }
    return { up: up, h: h, ht: ht, L: L };
  }

  function bar(color) {
    var wrap = document.createElement('div');
    wrap.className = 'bar';
    var i = document.createElement('i');
    i.style.background = color;
    wrap.appendChild(i);
    return { el: wrap, fill: i };
  }

  function visEl() {
    var d = document.createElement('div');
    d.className = 'vis-state ok';
    return d;
  }

  function setVis(el, ok, text) {
    if (!el) return;
    el.className = 'vis-state ' + (ok ? 'ok' : 'bad');
    el.textContent = text;
  }

  function resetBtn(label, onClick) {
    var b = PL.ui.button({
      className: 'ico-btn reset',
      title: label,
      html: RESET_SVG,
      onClick: onClick
    });
    b.el.setAttribute('aria-label', label);
    var tools = document.createElement('div');
    tools.className = 'tools';
    tools.appendChild(b.el);
    return { el: tools, dispose: b.dispose };
  }

  function createView(model, mode) {
    ST = PL.sims['surface-tension'];
    var canvas;
    var canvases;
    var widgets;
    var dpr = 1;
    var els;
    var unsubs;
    var persist;

    function paintMolecules() {
      var ctx = canvas.getContext('2d');
      var W = canvas.width;
      var H = canvas.height;
      var d = dpr;
      var depth = model.depth.value;
      var coh = model.cohesion.value;
      if (els.g1) els.g1.style.width = (coh / 2 * 100) + '%';
      if (els.depl) els.depl.textContent = PL.t('sim.surface-tension.depth' + depth);
      var D = W * 0.065;
      var ys = H * 0.32;
      var yb = ys - D * 0.5;
      var nc = Math.ceil(W / D) + 2;
      var nr = Math.ceil((H - ys) / (D * 0.866)) + 1;
      var pts = [];
      var i;
      var k;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(74,144,226,.22)';
      ctx.fillRect(0, yb, W, H - yb);
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = 4 * d;
      ctx.beginPath();
      ctx.moveTo(0, yb);
      ctx.lineTo(W, yb);
      ctx.stroke();
      for (k = 0; k < nr; k++) {
        for (i = 0; i < nc; i++) {
          pts.push({
            x: W / 2 + (i - Math.floor(nc / 2)) * D + (k & 1) * D / 2,
            y: ys + k * D * 0.866,
            k: k,
            i: i
          });
        }
      }
      var hl = null;
      for (i = 0; i < pts.length; i++) {
        if (pts[i].k === depth && pts[i].i === Math.floor(nc / 2)) hl = pts[i];
      }
      var rr = D * 0.3;
      for (i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (p.x < -D || p.x > W + D) continue;
        var g = ctx.createRadialGradient(p.x - rr * 0.3, p.y - rr * 0.3, 1, p.x, p.y, rr);
        if (p === hl) {
          g.addColorStop(0, '#fff');
          g.addColorStop(1, '#f08c00');
        } else {
          g.addColorStop(0, '#d6ecff');
          g.addColorStop(1, '#3a7fc4');
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p === hl ? rr * 1.28 : rr, 0, 6.2832);
        ctx.fill();
      }
      if (!hl) return;
      if (model.allsurf.value) {
        for (i = 0; i < pts.length; i++) {
          var q = pts[i];
          if (q.k !== 0 || q.x < 0 || q.x > W) continue;
          arrow(ctx, q.x, q.y, q.x, q.y + D * 0.5 * coh, 'rgba(201,42,42,.55)', 2 * d, 7 * d);
        }
      }
      var sx = 0;
      var sy = 0;
      var len = D * (0.45 + 0.25 * coh);
      for (i = 0; i < pts.length; i++) {
        var p2 = pts[i];
        if (p2 === hl) continue;
        var dx = p2.x - hl.x;
        var dy = p2.y - hl.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < D * 1.05) {
          sx += dx / dist;
          sy += dy / dist;
          arrow(ctx, hl.x, hl.y, hl.x + dx / dist * len, hl.y + dy / dist * len, '#6b7785', 2.5 * d, 9 * d);
        }
      }
      var mag = Math.sqrt(sx * sx + sy * sy);
      if (mag > 0.05) {
        arrow(ctx, hl.x, hl.y, hl.x + sx / mag * mag * D * 0.5 * coh, hl.y + sy / mag * mag * D * 0.5 * coh, '#c92a2a', 5 * d, 15 * d);
      }
      setVis(els.st, mag <= 0.05, mag > 0.05 ? PL.t('sim.surface-tension.netIn') : PL.t('sim.surface-tension.netZero'));
    }

    function paintNeedle() {
      var ctx = canvas.getContext('2d');
      var W = canvas.width;
      var H = canvas.height;
      var d = dpr;
      var soap = model.soap.value;
      var m = model.needleMass.value;
      var F = model.needleForce();
      var Wt = model.needleWeight();
      var ratio = Wt / F;
      var nd = model.needleAnim;
      if (els.nfb) els.nfb.style.width = Math.min(100, F / 6 * 100) + '%';
      if (els.nwb) els.nwb.style.width = Math.min(100, Wt / 6 * 100) + '%';
      if (ratio > 1) nd.sunk = true;
      var y0 = H * 0.42;
      var cx = W / 2;
      var rr = Math.max(10, H * 0.05);
      var depth = nd.sunk ? 0 : Math.min(ratio, 1) * rr * 3.2;
      var s = rr * 3.4;
      ctx.clearRect(0, 0, W, H);
      function surf(x) {
        return y0 + depth * Math.exp(-Math.pow((x - cx) / s, 2));
      }
      ctx.fillStyle = 'rgba(74,144,226,.45)';
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, surf(0));
      var x;
      for (x = 0; x <= W; x += 4) ctx.lineTo(x, surf(x));
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#2b6cb0';
      ctx.lineWidth = 3 * d;
      ctx.beginPath();
      for (x = 0; x <= W; x += 4) {
        if (x === 0) ctx.moveTo(x, surf(x));
        else ctx.lineTo(x, surf(x));
      }
      ctx.stroke();
      var ny;
      if (nd.sunk) {
        nd.vy += 0.35 * d;
        nd.y = Math.min(nd.y + nd.vy, H - rr - 4 * d);
        ny = y0 - rr * 0.2 + nd.y;
      } else {
        nd.y = 0;
        nd.vy = 0;
        ny = y0 + depth - rr * 0.25;
      }
      var g = ctx.createRadialGradient(cx - rr * 0.3, ny - rr * 0.3, 2, cx, ny, rr);
      g.addColorStop(0, '#cfd4da');
      g.addColorStop(1, '#4a5158');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, ny, rr, 0, 6.2832);
      ctx.fill();
      if (!nd.sunk) {
        var phi = Math.asin(Math.min(1, ratio));
        var len = Math.max(24 * d, F * 14 * d);
        var sg;
        for (sg = -1; sg <= 1; sg += 2) {
          arrow(ctx, cx + sg * rr * 1.5, ny + rr * 0.6, cx + sg * rr * 1.5 + sg * Math.cos(phi) * len, ny + rr * 0.6 - Math.sin(phi) * len, '#2e86c1', 3 * d, 11 * d);
        }
        arrow(ctx, cx, ny, cx, ny + Wt * 14 * d + 20 * d, '#c92a2a', 3 * d, 11 * d);
      }
      setVis(els.st, !nd.sunk, nd.sunk ? PL.t('sim.surface-tension.sink') : PL.t('sim.surface-tension.float'));
    }

    function paintDrop() {
      var ctx = canvas.getContext('2d');
      var W = canvas.width;
      var H = canvas.height;
      var d = dpr;
      var s = model.adhesion.value;
      var th = ST.thetaFromS(s);
      var A = Math.PI / 2 * Math.pow(H * 0.22, 2);
      drawCap(ctx, W, H, d, th * Math.PI / 180, A, H * 0.78, true, W / 2, model.dropHg.value);
      if (els.bcoh) els.bcoh.style.width = (1 / 1.1 * 100) + '%';
      if (els.badh) els.badh.style.width = (s / 1.1 * 100) + '%';
      var text;
      if (model.dropHg.value) text = PL.t('sim.surface-tension.hgConvex');
      else text = th >= 90 ? PL.t('sim.surface-tension.bead') : PL.t('sim.surface-tension.spread');
      setVis(els.st, th < 90 && !model.dropHg.value, text);
    }

    function paintCapillary() {
      var ctx = canvas.getContext('2d');
      var W = canvas.width;
      var H = canvas.height;
      var d = dpr;
      ctx.clearRect(0, 0, W, H);
      var sc = Math.min(W, H) * 0.018;
      var y0 = H * 0.58;
      var ytop = H * 0.07;
      var ybot = H * 0.95;
      if (model.capMode.value === 'compare') {
        var mid = W * 0.5;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, mid - 3, H);
        ctx.clip();
        drawBath(ctx, W, H, y0, ST.LIQ.water, d);
        capillaryColumn(ctx, W, H, d, { liq: 'water', th: 10, r: 0.5, cx: W * 0.16, harr: model.hcurW, idx: 0, sc: sc, y0: y0, ytop: ytop, ybot: ybot, label: '0.5 mm' });
        capillaryColumn(ctx, W, H, d, { liq: 'water', th: 10, r: 1.5, cx: W * 0.36, harr: model.hcurW, idx: 1, sc: sc, y0: y0, ytop: ytop, ybot: ybot, label: '1.5 mm' });
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.rect(mid + 3, 0, W - mid, H);
        ctx.clip();
        drawBath(ctx, W, H, y0, ST.LIQ.mercury, d);
        capillaryColumn(ctx, W, H, d, { liq: 'mercury', th: 140, r: 0.5, cx: W * 0.64, harr: model.hcurM, idx: 0, sc: sc, y0: y0, ytop: ytop, ybot: ybot, label: '0.5 mm' });
        capillaryColumn(ctx, W, H, d, { liq: 'mercury', th: 140, r: 1.5, cx: W * 0.84, harr: model.hcurM, idx: 1, sc: sc, y0: y0, ytop: ytop, ybot: ybot, label: '1.5 mm' });
        ctx.restore();
        ctx.strokeStyle = '#8a7a60';
        ctx.setLineDash([6 * d, 6 * d]);
        ctx.lineWidth = 2 * d;
        ctx.beginPath();
        ctx.moveTo(mid, ytop);
        ctx.lineTo(mid, ybot);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = (15 * d) + 'px Tahoma,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1c2430';
        ctx.fillText(PL.t('sim.surface-tension.water'), W * 0.26, H - 10 * d);
        ctx.fillText(PL.t('sim.surface-tension.mercury'), W * 0.74, H - 10 * d);
        setVis(els.st, true, PL.t('sim.surface-tension.waterUp'));
        setVis(els.stb, false, PL.t('sim.surface-tension.hgDown'));
        return;
      }
      var liq = model.liquid.value;
      var L = ST.LIQ[liq];
      var th = model.contactAngle.value;
      drawBath(ctx, W, H, y0, L, d);
      var last = null;
      var i;
      for (i = 0; i < 3; i++) {
        last = capillaryColumn(ctx, W, H, d, {
          liq: liq,
          th: th,
          r: ST.RADII[i],
          cx: W * (0.2 + 0.3 * i),
          harr: liq === 'water' ? model.hcurW : model.hcurM,
          idx: i,
          sc: sc,
          y0: y0,
          ytop: ytop,
          ybot: ybot,
          label: ST.RADII[i] + ' mm'
        });
      }
      setVis(els.st, last && last.up, last && last.up ? PL.t('sim.surface-tension.up') : PL.t('sim.surface-tension.down'));
    }

    function paintCompare() {
      if (!canvases) return;
      var k;
      for (k = 0; k < 3; k++) {
        var c = canvases[k];
        if (!c) continue;
        var ctx = c.getContext('2d');
        var W = c.width;
        var H = c.height;
        var rect = c.getBoundingClientRect();
        var d = W / (rect.width || 1);
        var A = Math.PI / 2 * Math.pow(H * 0.24, 2);
        var th = ST.TYP[k] * Math.PI / 180;
        drawCap(ctx, W, H, d, th, A, H * 0.8, true, W / 2, false);
      }
    }

    function paint() {
      if (mode === 4) {
        paintCompare();
        return;
      }
      if (!canvas) return;
      if (mode === 0) paintMolecules();
      else if (mode === 1) paintNeedle();
      else if (mode === 2) paintDrop();
      else if (mode === 3) paintCapillary();
    }

    function disposeWidgets() {
      var i;
      if (widgets) {
        for (i = 0; i < widgets.length; i++) {
          if (widgets[i].dispose) widgets[i].dispose();
        }
      }
      widgets = [];
      if (unsubs) {
        for (i = 0; i < unsubs.length; i++) unsubs[i]();
      }
      unsubs = [];
    }

    function fillPanel(panel) {
      disposeWidgets();
      panel.innerHTML = '';
      els = {};
      if (mode === 0) {
        var sDep = PL.ui.slider(model.depth, { min: 0, max: 3, step: 1, label: PL.t('sim.surface-tension.depth') });
        els.depl = document.createElement('div');
        els.depl.className = 'legend-dots';
        sDep.el.appendChild(els.depl);
        panel.appendChild(sDep.el);
        widgets.push(sDep);
        var sCoh = PL.ui.slider(model.cohesion, { min: 0.5, max: 2, step: 0.05, decimals: 2, label: PL.t('sim.surface-tension.cohesion') });
        var b1 = bar('#4a90e2');
        els.g1 = b1.fill;
        sCoh.el.appendChild(b1.el);
        panel.appendChild(sCoh.el);
        widgets.push(sCoh);
        var chk = PL.ui.checkbox(model.allsurf, { label: PL.t('sim.surface-tension.allsurf') });
        var box = PL.ui.box('', [chk.el]);
        panel.appendChild(box.el);
        widgets.push(chk);
        els.st = visEl();
        panel.appendChild(els.st);
      } else if (mode === 1) {
        var sNm = PL.ui.slider(model.needleMass, { min: 0.1, max: 0.6, step: 0.01, decimals: 2, label: PL.t('sim.surface-tension.needleMass') });
        var meters = document.createElement('div');
        meters.className = 'meters';
        var liftLab = document.createElement('span');
        liftLab.textContent = PL.t('sim.surface-tension.lift');
        var bF = bar('#2e86c1');
        els.nfb = bF.fill;
        var wLab = document.createElement('span');
        wLab.textContent = PL.t('sim.surface-tension.weight');
        var bW = bar('#c92a2a');
        els.nwb = bW.fill;
        meters.appendChild(liftLab);
        meters.appendChild(bF.el);
        meters.appendChild(wLab);
        meters.appendChild(bW.el);
        sNm.el.appendChild(meters);
        panel.appendChild(sNm.el);
        widgets.push(sNm);
        var soap = PL.ui.checkbox(model.soap, { label: PL.t('sim.surface-tension.soap') });
        var soapBox = PL.ui.box('', [soap.el]);
        panel.appendChild(soapBox.el);
        widgets.push(soap);
        var nre = resetBtn(PL.t('sim.surface-tension.resetNeedle'), function () {
          model.resetNeedle();
        });
        panel.appendChild(nre.el);
        widgets.push(nre);
        els.st = visEl();
        panel.appendChild(els.st);
      } else if (mode === 2) {
        var sAdh = PL.ui.slider(model.adhesion, { min: 0, max: 1.1, step: 0.01, decimals: 2, label: PL.t('sim.surface-tension.adhesion') });
        var cohLab = document.createElement('span');
        cohLab.textContent = PL.t('sim.surface-tension.cohesion');
        var bCoh = bar('#4a90e2');
        els.bcoh = bCoh.fill;
        var adhLab = document.createElement('span');
        adhLab.textContent = PL.t('sim.surface-tension.adhesion');
        var bAdh = bar('#f08c00');
        els.badh = bAdh.fill;
        sAdh.el.appendChild(cohLab);
        sAdh.el.appendChild(bCoh.el);
        sAdh.el.appendChild(adhLab);
        sAdh.el.appendChild(bAdh.el);
        panel.appendChild(sAdh.el);
        widgets.push(sAdh);
        var adhInp = sAdh.el.children[1];
        if (adhInp && adhInp.addEventListener) {
          adhInp.addEventListener('input', function () {
            model.dropHg.value = false;
          });
        }
        var presets = document.createElement('div');
        presets.className = 'tools';
        function pre(th, label, hg) {
          var b = document.createElement('button');
          b.type = 'button';
          b.textContent = label;
          b.addEventListener('click', function () {
            model.applyDropPreset(th, hg);
          });
          presets.appendChild(b);
        }
        pre(130, PL.t('sim.surface-tension.wax'), false);
        pre(30, PL.t('sim.surface-tension.glass'), false);
        pre(5, PL.t('sim.surface-tension.hydro'), false);
        pre(140, PL.t('sim.surface-tension.mercury'), true);
        panel.appendChild(presets);
        els.st = visEl();
        panel.appendChild(els.st);
      } else if (mode === 3) {
        var bMode = document.createElement('div');
        bMode.className = 'box';
        var hMode = document.createElement('h3');
        hMode.textContent = PL.t('sim.surface-tension.display');
        var tog = document.createElement('div');
        tog.className = 'liq-toggle';
        function modeBtn(value, label) {
          var b = document.createElement('button');
          b.type = 'button';
          b.textContent = label;
          b.addEventListener('click', function () {
            model.capMode.value = value;
          });
          tog.appendChild(b);
          return b;
        }
        var bRadii = modeBtn('radii', PL.t('sim.surface-tension.radii'));
        var bCmp = modeBtn('compare', PL.t('sim.surface-tension.compare'));
        function syncMode(v) {
          bRadii.className = v === 'radii' ? 'on mode' : '';
          bCmp.className = v === 'compare' ? 'on mode' : '';
        }
        model.capMode.link(syncMode);
        unsubs.push(function () { model.capMode.unlink(syncMode); });
        bMode.appendChild(hMode);
        bMode.appendChild(tog);
        panel.appendChild(bMode);
        if (model.capMode.value === 'radii') {
          var bLiq = document.createElement('div');
          bLiq.className = 'box';
          var hLiq = document.createElement('h3');
          hLiq.textContent = PL.t('sim.surface-tension.liquid');
          var togL = document.createElement('div');
          togL.className = 'liq-toggle';
          function liqBtn(id, cls) {
            var b = document.createElement('button');
            b.type = 'button';
            b.textContent = PL.t('sim.surface-tension.' + (id === 'mercury' ? 'mercury' : 'water'));
            b.addEventListener('click', function () {
              model.applyLiquid(id);
            });
            togL.appendChild(b);
            return { el: b, id: id, cls: cls };
          }
          var lb = [liqBtn('water', 'water'), liqBtn('mercury', 'hg')];
          function syncLiq(v) {
            var i;
            for (i = 0; i < lb.length; i++) {
              var on = lb[i].id === v;
              lb[i].el.className = on ? 'on ' + lb[i].cls : '';
              lb[i].el.setAttribute('aria-pressed', on ? 'true' : 'false');
            }
          }
          model.liquid.link(syncLiq);
          unsubs.push(function () { model.liquid.unlink(syncLiq); });
          bLiq.appendChild(hLiq);
          bLiq.appendChild(togL);
          panel.appendChild(bLiq);
          var sTh = PL.ui.slider(model.contactAngle, { min: 0, max: 180, step: 1, label: PL.t('sim.surface-tension.theta') });
          var sel = document.createElement('select');
          sel.setAttribute('aria-label', PL.t('sim.surface-tension.theta'));
          function addOpt(val, key) {
            var o = document.createElement('option');
            o.value = String(val);
            o.textContent = PL.t(key);
            sel.appendChild(o);
          }
          if (model.liquid.value === 'water') {
            addOpt(10, 'sim.surface-tension.glass');
            addOpt(0, 'sim.surface-tension.hydro');
            addOpt(110, 'sim.surface-tension.wax');
          } else {
            addOpt(140, 'sim.surface-tension.glass');
          }
          sel.value = String(model.substrate.value);
          sel.addEventListener('change', function () {
            model.applySubstrate(+sel.value);
          });
          sTh.el.appendChild(sel);
          panel.appendChild(sTh.el);
          widgets.push(sTh);
        } else {
          var bGlass = document.createElement('div');
          bGlass.className = 'box';
          var hG = document.createElement('h3');
          hG.textContent = PL.t('sim.surface-tension.glass');
          bGlass.appendChild(hG);
          bGlass.appendChild(PL.ui.legend([
            { color: '#4a90e2', label: PL.t('sim.surface-tension.waterMeniscus') },
            { color: '#8b949e', label: PL.t('sim.surface-tension.hgMeniscus') }
          ]).el);
          panel.appendChild(bGlass);
        }
        panel.appendChild(PL.ui.legend([
          { color: '#2e86c1', label: PL.t('sim.surface-tension.wall') },
          { color: '#c92a2a', label: PL.t('sim.surface-tension.column') }
        ]).el);
        var crs = resetBtn(PL.t('sim.surface-tension.resetCap'), function () {
          model.resetCapHeights();
        });
        panel.appendChild(crs.el);
        widgets.push(crs);
        els.st = visEl();
        panel.appendChild(els.st);
        if (model.capMode.value === 'compare') {
          els.stb = visEl();
          panel.appendChild(els.stb);
        }
      } else if (mode === 4) {
        var b3 = document.createElement('div');
        b3.className = 'box';
        var h3 = document.createElement('h3');
        h3.textContent = PL.t('sim.surface-tension.threeSurfaces');
        b3.appendChild(h3);
        b3.appendChild(PL.ui.legend([
          { color: '#e07a1f', label: PL.t('sim.surface-tension.wax') },
          { color: '#1565c0', label: PL.t('sim.surface-tension.glass') },
          { color: '#2b8a3e', label: PL.t('sim.surface-tension.hydro') }
        ]).el);
        panel.appendChild(b3);
        var st4 = visEl();
        st4.textContent = PL.t('sim.surface-tension.sameVolume');
        panel.appendChild(st4);
      }
    }

    return {
      mount: function (stage, panel) {
        widgets = [];
        unsubs = [];
        persist = [];
        els = {};
        canvases = null;
        canvas = null;
        stage.className = 'sim-stage lab';
        stage.innerHTML = '';
        if (mode === 4) {
          var cmp = document.createElement('div');
          cmp.className = 'compare';
          var labels = [
            { cls: 'badge amo', key: 'sim.surface-tension.wax', aria: 'sim.surface-tension.canvasWax' },
            { cls: 'badge cry', key: 'sim.surface-tension.glass', aria: 'sim.surface-tension.canvasGlass' },
            { cls: 'badge', key: 'sim.surface-tension.hydro', aria: 'sim.surface-tension.canvasHydro' }
          ];
          canvases = [];
          var i;
          for (i = 0; i < 3; i++) {
            var sec = document.createElement('section');
            sec.className = 'view';
            var badge = document.createElement('span');
            badge.className = labels[i].cls;
            if (i === 2) badge.style.color = '#2b8a3e';
            badge.textContent = PL.t(labels[i].key);
            var c = document.createElement('canvas');
            c.setAttribute('aria-label', PL.t(labels[i].aria));
            sec.appendChild(badge);
            sec.appendChild(c);
            cmp.appendChild(sec);
            canvases.push(c);
          }
          stage.appendChild(cmp);
        } else {
          canvas = document.createElement('canvas');
          var aria = [
            'sim.surface-tension.canvasMolecules',
            'sim.surface-tension.canvasNeedle',
            'sim.surface-tension.canvasDrop',
            'sim.surface-tension.canvasCapillary'
          ][mode];
          canvas.setAttribute('aria-label', PL.t(aria));
          canvas.style.position = 'absolute';
          canvas.style.inset = '0';
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          stage.appendChild(canvas);
        }
        fillPanel(panel);
        if (mode === 3) {
          var rebuild = function () { fillPanel(panel); };
          model.capMode.lazyLink(rebuild);
          model.liquid.lazyLink(rebuild);
          persist.push(function () {
            model.capMode.unlink(rebuild);
            model.liquid.unlink(rebuild);
          });
        }
      },
      layout: function (w, h, nextDpr) {
        dpr = nextDpr;
        var r;
        if (canvas) {
          r = canvas.getBoundingClientRect();
          PL.draw.fitCanvas(canvas, r.width, r.height, dpr);
        }
        if (canvases) {
          var i;
          for (i = 0; i < canvases.length; i++) {
            r = canvases[i].getBoundingClientRect();
            PL.draw.fitCanvas(canvases[i], r.width, r.height, dpr);
          }
        }
      },
      draw: paint,
      reset: function () {},
      dispose: function () {
        var i;
        disposeWidgets();
        if (persist) {
          for (i = 0; i < persist.length; i++) persist[i]();
        }
        persist = [];
        canvas = null;
        canvases = null;
        els = {};
      }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims['surface-tension'] = PL.sims['surface-tension'] || {};
  PL.sims['surface-tension'].createView = createView;
})(window.PL = window.PL || {});
