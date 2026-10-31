(function (PL) {
  var PATM = 101325;
  var LIQ = {
    w: { id: 'w', nameKey: 'sim.u-tube.water', rho: 1000, fill: '#3d9be8', deep: '#155a96', shine: '#c5e8ff' },
    o: { id: 'o', nameKey: 'sim.u-tube.oil', rho: 920, fill: '#e8c44a', deep: '#8a6d10', shine: '#fff3b0' },
    gy: { id: 'gy', nameKey: 'sim.u-tube.glycerin', rho: 1260, fill: '#7fbf7a', deep: '#3d6a32', shine: '#d7f0c8' }
  };
  var PHASE_COUNT = 5;
  var HMAX = 36;

  function cloneArm(a) {
    return a.map(function (x) {
      return { id: x.id, h: x.h };
    });
  }

  function sumH(a) {
    var s = 0;
    var i;
    for (i = 0; i < a.length; i++) s += a[i].h;
    return s;
  }

  function volumeOf(left, right, id) {
    var s = 0;
    var i;
    for (i = 0; i < left.length; i++) if (left[i].id === id) s += left[i].h;
    for (i = 0; i < right.length; i++) if (right[i].id === id) s += right[i].h;
    return s;
  }

  function buildOne() {
    return {
      L: [{ id: 'w', h: 18 }],
      R: [{ id: 'w', h: 18 }],
      unk: { arm: 'R', i: 0, name: 'ارتفاع راست' }
    };
  }

  function buildTwo() {
    var Vo = 10;
    var Vw = 24;
    var dh = LIQ.o.rho * Vo / LIQ.w.rho;
    var a = (Vw - dh) / 2;
    return {
      L: [{ id: 'w', h: a }, { id: 'o', h: Vo }],
      R: [{ id: 'w', h: Vw - a }],
      unk: { arm: 'L', i: 1, name: 'ارتفاع روغن' }
    };
  }

  function buildThree() {
    var Vo = 8;
    var Vw = 10;
    var Vg = 20;
    var diff = (LIQ.w.rho * Vw - LIQ.o.rho * Vo) / LIQ.gy.rho;
    return {
      L: [{ id: 'gy', h: (Vg + diff) / 2 }, { id: 'o', h: Vo }],
      R: [{ id: 'gy', h: (Vg - diff) / 2 }, { id: 'w', h: Vw }],
      unk: { arm: 'L', i: 1, name: 'ارتفاع روغن' }
    };
  }

  var CASES = [
    { id: 'one', nameKey: 'sim.u-tube.caseOne', make: buildOne },
    { id: 'two', nameKey: 'sim.u-tube.caseTwo', make: buildTwo },
    { id: 'three', nameKey: 'sim.u-tube.caseThree', make: buildThree }
  ];

  function fluidAt(arm, y) {
    if (y < -0.05) return 'none';
    var pos = 0;
    var i;
    for (i = 0; i < arm.length; i++) {
      if (y <= pos + arm[i].h + 1e-6) return arm[i].id;
      pos += arm[i].h;
    }
    return 'air';
  }

  function layersAbove(arm, y) {
    var out = [];
    var pos = sumH(arm);
    var i, bot, take;
    for (i = arm.length - 1; i >= 0; i--) {
      bot = pos - arm[i].h;
      if (y >= pos - 1e-9) {
        pos = bot;
        continue;
      }
      take = pos - Math.max(y, bot);
      if (take > 0.02) out.push({ id: arm[i].id, h: take });
      pos = bot;
      if (y >= bot - 1e-9) break;
    }
    return out.reverse();
  }

  function pressAt(arm, y, g) {
    var p = PATM;
    var L = layersAbove(arm, y);
    var i;
    for (i = 0; i < L.length; i++) p += LIQ[L[i].id].rho * g * (L[i].h / 100);
    return p;
  }

  function columnSum(arm, y, g) {
    var L = layersAbove(arm, y);
    var s = 0;
    var i;
    for (i = 0; i < L.length; i++) s += LIQ[L[i].id].rho * g * (L[i].h / 100);
    return s;
  }

  function snaps(left, right) {
    var out = [0];
    var pos = 0;
    var i;
    for (i = 0; i < left.length; i++) {
      pos += left[i].h;
      out.push(pos);
    }
    pos = 0;
    for (i = 0; i < right.length; i++) {
      pos += right[i].h;
      out.push(pos);
    }
    return out;
  }

  function snapY(y, left, right) {
    var list = snaps(left, right);
    var i, best = y, d = 0.55;
    for (i = 0; i < list.length; i++) {
      if (Math.abs(list[i] - y) < d) {
        d = Math.abs(list[i] - y);
        best = list[i];
      }
    }
    return Math.max(0, Math.min(HMAX, best));
  }

  function createModel() {
    var caseIndex = new PL.Property(1);
    var g = new PL.Property(9.8);
    var phase = new PL.Property(0);
    var ref = new PL.Property(null);
    var pointL = new PL.Property(false);
    var pointR = new PL.Property(false);
    var compared = new PL.Property(false);
    var revealed = new PL.Property(false);
    var guess = new PL.Property(null);
    var valid = new PL.Property(null);
    var reasonKey = new PL.Property('');
    var reasonName = new PL.Property('');
    var left = [];
    var right = [];
    var unk = null;

    function applyCase() {
      var c = CASES[caseIndex.value].make();
      left = cloneArm(c.L);
      right = cloneArm(c.R);
      unk = { arm: c.unk.arm, i: c.unk.i, name: c.unk.name };
      ref.value = null;
      pointL.value = false;
      pointR.value = false;
      valid.value = null;
      reasonKey.value = '';
      reasonName.value = '';
      guess.value = null;
      revealed.value = false;
      compared.value = false;
      phase.value = 0;
    }

    applyCase();
    caseIndex.lazyLink(function () {
      applyCase();
    });

    function connectingId() {
      return (left[0] && right[0] && left[0].id === right[0].id) ? left[0].id : null;
    }

    function unkH() {
      return (unk.arm === 'L' ? left : right)[unk.i].h;
    }

    function judge() {
      if (ref.value == null) {
        valid.value = null;
        reasonKey.value = 'sim.u-tube.needRef';
        reasonName.value = '';
        return;
      }
      if (!pointL.value || !pointR.value) {
        valid.value = null;
        reasonKey.value = 'sim.u-tube.needBoth';
        reasonName.value = '';
        return;
      }
      var y = ref.value;
      var fL = fluidAt(left, y);
      var fR = fluidAt(right, y);
      var conn = connectingId();
      if (fL === 'air' && fR === 'air') {
        valid.value = false;
        reasonKey.value = 'sim.u-tube.bothAir';
        return;
      }
      if (fL === 'air' || fR === 'air') {
        valid.value = false;
        reasonKey.value = 'sim.u-tube.airVsLiquid';
        return;
      }
      if (fL !== fR) {
        valid.value = false;
        reasonKey.value = 'sim.u-tube.diffLiquid';
        return;
      }
      if (!conn || fL !== conn) {
        valid.value = false;
        reasonKey.value = 'sim.u-tube.notConnected';
        return;
      }
      valid.value = true;
      reasonKey.value = 'sim.u-tube.valid';
      reasonName.value = LIQ[conn].nameKey;
    }

    function armContrib(arm, y, unkIndex) {
      var pos = 0;
      var sum = 0;
      var coeff = 0;
      var i, bot, top, take, rho;
      for (i = 0; i < arm.length; i++) {
        bot = pos;
        top = pos + arm[i].h;
        pos = top;
        rho = LIQ[arm[i].id].rho;
        if (i === unkIndex) {
          if (y >= top - 1e-9) continue;
          coeff += rho;
          if (y > bot + 1e-9) sum -= rho * (y - bot);
        } else {
          if (y >= top - 1e-9) continue;
          take = top - Math.max(y, bot);
          if (take > 0.02) sum += rho * take;
        }
      }
      return { sum: sum, coeff: coeff };
    }

    function solveUnknown(refY) {
      var conn = connectingId();
      if (!conn || !unk) return null;
      var y = refY == null ? 0 : refY;
      var L = armContrib(left, y, unk.arm === 'L' ? unk.i : -1);
      var R = armContrib(right, y, unk.arm === 'R' ? unk.i : -1);
      if (L.coeff !== 0) return (R.sum - L.sum) / L.coeff;
      if (R.coeff !== 0) return (L.sum - R.sum) / R.coeff;
      return null;
    }

    return {
      timeBased: false,
      caseIndex: caseIndex,
      g: g,
      phase: phase,
      ref: ref,
      pointL: pointL,
      pointR: pointR,
      compared: compared,
      revealed: revealed,
      guess: guess,
      valid: valid,
      reasonKey: reasonKey,
      reasonName: reasonName,
      step: function () {},
      reset: function () {
        caseIndex.reset();
        g.reset();
        applyCase();
      },
      left: function () { return left; },
      right: function () { return right; },
      unk: function () { return unk; },
      connectingId: connectingId,
      fluidAt: function (side, y) {
        return fluidAt(side === 'L' ? left : right, y);
      },
      layersAbove: function (side, y) {
        return layersAbove(side === 'L' ? left : right, y);
      },
      pressAt: function (side, y) {
        return pressAt(side === 'L' ? left : right, y, g.value);
      },
      columnSum: function (side, y) {
        return columnSum(side === 'L' ? left : right, y, g.value);
      },
      snapY: function (y) {
        return snapY(y, left, right);
      },
      unkH: unkH,
      judge: judge,
      solveUnknown: solveUnknown,
      setRef: function (h) {
        ref.value = h;
        compared.value = false;
        valid.value = null;
        reasonKey.value = '';
        if (phase.value < 1) phase.value = 1;
      },
      setPoint: function (side) {
        if (side === 'L') pointL.value = true;
        else if (side === 'R') pointR.value = true;
        else {
          pointL.value = false;
          pointR.value = false;
        }
      },
      compare: function () {
        if (phase.value < 2) phase.value = 2;
        pointL.value = true;
        pointR.value = true;
        compared.value = true;
        if (ref.value == null) {
          reasonKey.value = 'sim.u-tube.placeFirst';
          valid.value = null;
          return;
        }
        judge();
        if (valid.value && phase.value < 3) phase.value = 3;
      },
      checkGuess: function (n) {
        if (!(n >= 0)) return { ok: false, need: true };
        var ans = unkH();
        var err = Math.abs(n - ans);
        guess.value = n;
        revealed.value = true;
        phase.value = 4;
        return { ok: err <= 0.2, err: err, ans: ans, guess: n };
      },
      volumeOf: function (id) {
        return volumeOf(left, right, id);
      }
    };
  }

  PL.sims = PL.sims || {};
  PL.sims['u-tube'] = {
    PATM: PATM,
    LIQ: LIQ,
    CASES: CASES,
    PHASE_COUNT: PHASE_COUNT,
    HMAX: HMAX,
    buildOne: buildOne,
    buildTwo: buildTwo,
    buildThree: buildThree,
    sumH: sumH,
    volumeOf: volumeOf,
    layersAbove: layersAbove,
    pressAt: pressAt,
    createModel: createModel
  };
})(window.PL = window.PL || {});
