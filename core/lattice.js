(function (PL) {
  function dist(a, b) {
    var s = 0;
    var i;
    for (i = 0; i < a.length; i++) s += (a[i] - b[i]) * (a[i] - b[i]);
    return Math.sqrt(s);
  }

  function minDistance(sites) {
    var m = Infinity;
    var i, j, d;
    for (i = 0; i < sites.length; i++) {
      for (j = i + 1; j < sites.length; j++) {
        d = dist(sites[i], sites[j]);
        if (d < m) m = d;
      }
    }
    return m;
  }

  function pack2d(opts) {
    var n = opts.n;
    var rng = opts.rng;
    var m = opts.margin;
    var minD = opts.minPlace;
    var relax = opts.relax;
    var pts = [];
    var tries = 0;
    var maxTries = opts.tries != null ? opts.tries : 200000;
    var iterations = opts.iterations != null ? opts.iterations : 60;
    var i, j, it, x, y, ok, a, b, dx, dy, d, t, f;
    while (pts.length < n && tries < maxTries) {
      tries++;
      x = m + rng() * (1 - 2 * m);
      y = m + rng() * (1 - 2 * m);
      ok = true;
      for (i = 0; i < pts.length; i++) {
        a = pts[i][0] - x;
        b = pts[i][1] - y;
        if (a * a + b * b < minD * minD) {
          ok = false;
          break;
        }
      }
      if (ok) pts.push([x, y]);
    }
    while (pts.length < n) pts.push([m + rng() * (1 - 2 * m), m + rng() * (1 - 2 * m)]);
    for (it = 0; it < iterations; it++) {
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          dx = pts[j][0] - pts[i][0];
          dy = pts[j][1] - pts[i][1];
          d = Math.hypot(dx, dy);
          t = relax;
          if (d < t && d > 1e-9) {
            f = (t - d) / d * 0.25;
            pts[i][0] -= dx * f;
            pts[i][1] -= dy * f;
            pts[j][0] += dx * f;
            pts[j][1] += dy * f;
          }
        }
      }
      for (i = 0; i < n; i++) {
        pts[i][0] = Math.min(1 - m, Math.max(m, pts[i][0]));
        pts[i][1] = Math.min(1 - m, Math.max(m, pts[i][1]));
      }
    }
    return pts;
  }

  function pack3d(opts) {
    var n = opts.n;
    var rng = opts.rng;
    var L = opts.halfExtent;
    var minD = opts.minPlace;
    var relax = opts.relax;
    var pts = [];
    var tries = 0;
    var maxTries = opts.tries != null ? opts.tries : 100000;
    var iterations = opts.iterations != null ? opts.iterations : 80;
    var i, j, it, c, p, ok, d, f, dd;
    function rnd() {
      return [(rng() * 2 - 1) * L, (rng() * 2 - 1) * L, (rng() * 2 - 1) * L];
    }
    while (pts.length < n && tries < maxTries) {
      tries++;
      p = rnd();
      ok = true;
      for (i = 0; i < pts.length; i++) {
        if (dist(p, pts[i]) < minD) {
          ok = false;
          break;
        }
      }
      if (ok) pts.push(p);
    }
    while (pts.length < n) pts.push(rnd());
    for (it = 0; it < iterations; it++) {
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          d = dist(pts[i], pts[j]);
          if (d < relax && d > 1e-9) {
            f = (relax - d) / d * 0.25;
            for (c = 0; c < 3; c++) {
              dd = (pts[j][c] - pts[i][c]) * f;
              pts[i][c] -= dd;
              pts[j][c] += dd;
            }
          }
        }
      }
      for (i = 0; i < n; i++) {
        for (c = 0; c < 3; c++) pts[i][c] = Math.max(-L, Math.min(L, pts[i][c]));
      }
    }
    return pts;
  }

  function build(sites, cut) {
    var dim = sites[0] && sites[0].length === 3 ? 3 : 2;
    var p = sites.map(function (s) {
      var q = { x: s[0], y: s[1], dx: 0, dy: 0, vx: 0, vy: 0 };
      if (dim === 3) {
        q.z = s[2];
        q.dz = 0;
        q.vz = 0;
      }
      return q;
    });
    var b = [];
    var n = p.length;
    var i, j, a, c;
    for (i = 0; i < n; i++) {
      for (j = i + 1; j < n; j++) {
        a = dim === 3 ? [p[i].x, p[i].y, p[i].z] : [p[i].x, p[i].y];
        c = dim === 3 ? [p[j].x, p[j].y, p[j].z] : [p[j].x, p[j].y];
        if (dist(a, c) < cut) b.push([i, j]);
      }
    }
    return { p: p, b: b };
  }

  function step(sys, opts) {
    var T = opts.T;
    var rms = opts.rmsMax * Math.sqrt(T / 100);
    var K = opts.K;
    var G = opts.G;
    var dt = opts.dt;
    var rng = opts.rng;
    var kT = K * rms * rms;
    var sig = Math.sqrt(2 * G * kT * dt);
    var dim = sys.p[0] && sys.p[0].z != null ? 3 : 2;
    var i, q;
    for (i = 0; i < sys.p.length; i++) {
      q = sys.p[i];
      q.vx += (-K * q.dx - G * q.vx) * dt + sig * PL.math.gauss(rng);
      q.vy += (-K * q.dy - G * q.vy) * dt + sig * PL.math.gauss(rng);
      q.dx += q.vx * dt;
      q.dy += q.vy * dt;
      if (dim === 3) {
        q.vz += (-K * q.dz - G * q.vz) * dt + sig * PL.math.gauss(rng);
        q.dz += q.vz * dt;
      }
    }
  }

  function rms(sys) {
    var s = 0;
    var i, q;
    var dim = sys.p[0] && sys.p[0].z != null ? 3 : 2;
    for (i = 0; i < sys.p.length; i++) {
      q = sys.p[i];
      s += q.dx * q.dx + q.dy * q.dy;
      if (dim === 3) s += q.dz * q.dz;
    }
    return Math.sqrt(s / sys.p.length);
  }

  function coordination(sys, index) {
    var n = 0;
    var i, e;
    for (i = 0; i < sys.b.length; i++) {
      e = sys.b[i];
      if (e[0] === index || e[1] === index) n++;
    }
    return n;
  }

  PL.lattice = {
    dist: dist,
    minDistance: minDistance,
    pack2d: pack2d,
    pack3d: pack3d,
    build: build,
    step: step,
    rms: rms,
    coordination: coordination
  };
})(window.PL = window.PL || {});
