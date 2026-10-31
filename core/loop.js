(function (PL) {
  function Loop(opts) {
    this.model = opts.model;
    this.view = opts.view;
    this.playing = opts.playing;
    this.speed = opts.speed;
    this._acc = 0;
    this._raf = 0;
    this._last = 0;
    this._running = false;
    this._hiddenPause = false;
    this._onVis = this._onVis.bind(this);
    this._tick = this._tick.bind(this);
    this.stepCount = 0;
  }

  Loop.prototype._dt = function () {
    return this.model.fixedDt || 1 / 60;
  };

  Loop.prototype._onVis = function () {
    if (typeof document === 'undefined') return;
    if (document.hidden) {
      if (this.playing.value) {
        this._hiddenPause = true;
        this.playing.value = false;
      }
    } else if (this._hiddenPause) {
      this._hiddenPause = false;
      this.playing.value = true;
    }
  };

  Loop.prototype.start = function () {
    if (this._running) return;
    this._running = true;
    this._last = 0;
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this._onVis);
    }
    if (typeof requestAnimationFrame !== 'undefined') {
      this._raf = requestAnimationFrame(this._tick);
    }
  };

  Loop.prototype.stop = function () {
    this._running = false;
    if (this._raf && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this._raf);
    }
    this._raf = 0;
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this._onVis);
    }
  };

  Loop.prototype._advance = function (elapsedMs) {
    var playing = this.playing && this.playing.value;
    if (this.model.timeBased && playing) {
      var dt = this._dt();
      var speed = this.speed ? this.speed.value : 1;
      var frame = Math.min(elapsedMs / 1000, 0.1) * speed;
      this._acc += frame;
      var n = 0;
      while (this._acc >= dt && n < 8) {
        this.model.step(dt);
        this.stepCount += 1;
        this._acc -= dt;
        n += 1;
      }
      if (this._acc >= dt) this._acc = 0;
    }
    if (this.view && this.view.draw) this.view.draw();
  };

  Loop.prototype._tick = function (now) {
    if (!this._running) return;
    if (!this._last) this._last = now;
    var elapsed = now - this._last;
    this._last = now;
    this._advance(elapsed);
    if (typeof requestAnimationFrame !== 'undefined') {
      this._raf = requestAnimationFrame(this._tick);
    }
  };

  Loop.prototype.stepOnce = function () {
    var dt = this._dt();
    this.model.step(dt);
    this.stepCount += 1;
    if (this.view && this.view.draw) this.view.draw();
  };

  Loop.prototype.tickForTest = function (elapsedMs) {
    this._advance(elapsedMs);
  };

  PL.Loop = Loop;
})(window.PL = window.PL || {});
