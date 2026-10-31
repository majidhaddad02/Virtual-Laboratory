(function (PL) {
  var PAUSE_SVG = '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>';
  var PLAY_SVG = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  var STEP_SVG = '<svg viewBox="0 0 24 24"><path d="M8 5v14l8-7z"/><rect x="17" y="5" width="3" height="14"/></svg>';
  var LOGO = '<svg width="28" height="28" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#521764"/><circle cx="32" cy="32" r="22" fill="#f5d547"/></svg>';

  function findEntry(id) {
    var list = PL.registry || [];
    var i;
    for (i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function start(simDef, rootEl) {
    var entry = findEntry(simDef.id);
    var screens = simDef.screens;
    var active = 0;
    var models = [];
    var views = [];
    var loops = [];
    var i;
    for (i = 0; i < screens.length; i++) {
      models[i] = screens[i].createModel();
      views[i] = screens[i].createView(models[i]);
    }

    rootEl.className = simDef.fit ? 'sim-app fit' : 'sim-app';
    rootEl.innerHTML = '';

    var top = document.createElement('header');
    top.className = 'sim-top';
    var back = document.createElement('a');
    back.href = '../../index.html';
    back.innerHTML = LOGO + ' ' + PL.t('ui.back');
    var title = document.createElement('h1');
    title.textContent = entry ? entry.title : simDef.id;
    var about = document.createElement('button');
    about.type = 'button';
    about.className = 'about-btn';
    about.textContent = PL.t('ui.about');
    about.addEventListener('click', function () {
      PL.dialogs.about(entry);
    });
    top.appendChild(back);
    top.appendChild(title);
    top.appendChild(about);

    var body = document.createElement('div');
    body.className = 'sim-body';
    var stage = document.createElement('div');
    stage.className = 'sim-stage';
    var panel = document.createElement('aside');
    panel.className = 'sim-panel';
    body.appendChild(stage);
    body.appendChild(panel);

    var bottom = document.createElement('div');
    bottom.className = 'sim-bottom';
    var tabs = document.createElement('div');
    tabs.className = 'screen-tabs' + (screens.length < 2 ? ' hidden' : '');
    for (i = 0; i < screens.length; i++) {
      (function (idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = PL.t(screens[idx].title);
        if (idx === 0) b.className = 'on';
        b.addEventListener('click', function () {
          switchScreen(idx);
        });
        tabs.appendChild(b);
      })(i);
    }
    var timeBox = document.createElement('div');
    timeBox.className = 'time-controls';
    var playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'ico-btn';
    playBtn.setAttribute('aria-label', PL.t('ui.pause'));
    playBtn.innerHTML = PAUSE_SVG;
    var stepBtn = document.createElement('button');
    stepBtn.type = 'button';
    stepBtn.className = 'ico-btn';
    stepBtn.setAttribute('aria-label', PL.t('ui.step'));
    stepBtn.innerHTML = STEP_SVG;
    var speedSel = document.createElement('select');
    speedSel.setAttribute('aria-label', PL.t('ui.speed'));
    var speeds = [0.25, 0.5, 1, 2];
    for (i = 0; i < speeds.length; i++) {
      var opt = document.createElement('option');
      opt.value = String(speeds[i]);
      opt.textContent = '×' + speeds[i];
      if (speeds[i] === 1) opt.selected = true;
      speedSel.appendChild(opt);
    }
    timeBox.appendChild(playBtn);
    timeBox.appendChild(stepBtn);
    timeBox.appendChild(speedSel);

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'reset-all-btn';
    resetBtn.textContent = PL.t('ui.resetAll');
    resetBtn.addEventListener('click', function () {
      PL.dialogs.confirmReset(resetAll);
    });

    bottom.appendChild(tabs);
    bottom.appendChild(timeBox);
    bottom.appendChild(resetBtn);

    rootEl.appendChild(top);
    rootEl.appendChild(body);
    rootEl.appendChild(bottom);

    function layout() {
      var r = stage.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      var v = views[active];
      if (v && v.layout) v.layout(r.width, r.height, dpr);
    }

    function syncTimeChrome(model) {
      if (model.timeBased) {
        timeBox.classList.remove('hidden');
        var playing = model.playing.value;
        playBtn.innerHTML = playing ? PAUSE_SVG : PLAY_SVG;
        playBtn.setAttribute('aria-label', playing ? PL.t('ui.pause') : PL.t('ui.play'));
        speedSel.value = String(model.speed.value);
      } else {
        timeBox.classList.add('hidden');
      }
    }

    var didMount = false;
    function switchScreen(idx) {
      if (didMount) {
        if (loops[active]) loops[active].stop();
        if (views[active] && views[active].dispose) views[active].dispose();
      }
      didMount = true;
      active = idx;
      var tabBtns = tabs.querySelectorAll('button');
      var t;
      for (t = 0; t < tabBtns.length; t++) {
        tabBtns[t].className = t === idx ? 'on' : '';
      }
      stage.innerHTML = '';
      panel.innerHTML = '';
      views[idx].mount(stage, panel);
      layout();
      views[idx].draw();
      var model = models[idx];
      if (!model.playing) model.playing = new PL.Property(true);
      if (!model.speed) model.speed = new PL.Property(1);
      loops[idx] = new PL.Loop({
        model: model,
        view: views[idx],
        playing: model.playing,
        speed: model.speed
      });
      loops[idx].start();
      if (model.timeBased) {
        model.playing.link(function () {
          syncTimeChrome(model);
        });
      }
      syncTimeChrome(model);
    }

    function resetAll() {
      var j;
      for (j = 0; j < models.length; j++) {
        models[j].reset();
        if (views[j] && views[j].reset) views[j].reset();
      }
      views[active].draw();
    }

    playBtn.addEventListener('click', function () {
      var m = models[active];
      if (m.playing) m.playing.value = !m.playing.value;
    });
    stepBtn.addEventListener('click', function () {
      var m = models[active];
      if (m.playing) m.playing.value = false;
      if (loops[active]) loops[active].stepOnce();
    });
    speedSel.addEventListener('change', function () {
      var m = models[active];
      if (m.speed) m.speed.value = Number(speedSel.value);
    });

    window.addEventListener('resize', layout);
    switchScreen(0);

    return {
      resetAll: resetAll,
      dispose: function () {
        var j;
        for (j = 0; j < loops.length; j++) if (loops[j]) loops[j].stop();
        window.removeEventListener('resize', layout);
      }
    };
  }

  PL.Shell = { start: start };
})(window.PL = window.PL || {});
