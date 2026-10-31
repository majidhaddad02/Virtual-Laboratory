(function (PL) {
  function notify(list, value, old) {
    var i, copy;
    copy = list.slice();
    for (i = 0; i < copy.length; i++) copy[i](value, old);
  }

  function Property(initial, options) {
    this._initial = initial;
    this._value = initial;
    this._listeners = [];
    this._options = options || {};
    this._disposed = false;
    var self = this;
    Object.defineProperty(this, 'value', {
      configurable: true,
      enumerable: true,
      get: function () {
        return self._value;
      },
      set: function (v) {
        if (self._disposed) return;
        if (Object.is(v, self._value)) return;
        var range = self._options.range;
        if (range && typeof v === 'number' && (v < range[0] || v > range[1])) {
          console.warn('Property value out of range', v, range);
        }
        var old = self._value;
        self._value = v;
        notify(self._listeners, v, old);
      }
    });
  }

  Property.prototype.link = function (fn) {
    this._listeners.push(fn);
    fn(this._value, this._value);
    return fn;
  };

  Property.prototype.lazyLink = function (fn) {
    this._listeners.push(fn);
    return fn;
  };

  Property.prototype.unlink = function (fn) {
    this._listeners = this._listeners.filter(function (f) {
      return f !== fn;
    });
  };

  Property.prototype.reset = function () {
    this.value = this._initial;
  };

  Property.prototype.dispose = function () {
    this._listeners = [];
    this._disposed = true;
  };

  function derive(deps, fn) {
    function compute() {
      var args = [];
      var i;
      for (i = 0; i < deps.length; i++) args.push(deps[i].value);
      return fn.apply(null, args);
    }
    var p = new Property(compute());
    function recompute() {
      var next = compute();
      if (Object.is(next, p._value)) return;
      var old = p._value;
      p._value = next;
      notify(p._listeners, next, old);
    }
    var i;
    for (i = 0; i < deps.length; i++) deps[i].lazyLink(recompute);
    Object.defineProperty(p, 'value', {
      configurable: true,
      enumerable: true,
      get: function () {
        return p._value;
      },
      set: function () {
        console.warn('derived Property is read-only');
      }
    });
    p.reset = function () {
      recompute();
    };
    p.dispose = function () {
      var j;
      for (j = 0; j < deps.length; j++) deps[j].unlink(recompute);
      Property.prototype.dispose.call(p);
    };
    return p;
  }

  function Emitter() {
    this._fns = [];
  }
  Emitter.prototype.add = function (fn) {
    this._fns.push(fn);
  };
  Emitter.prototype.remove = function (fn) {
    this._fns = this._fns.filter(function (f) {
      return f !== fn;
    });
  };
  Emitter.prototype.emit = function () {
    var args = arguments;
    var copy = this._fns.slice();
    var i;
    for (i = 0; i < copy.length; i++) copy[i].apply(null, args);
  };

  PL.Property = Property;
  PL.derive = derive;
  PL.Emitter = Emitter;
})(window.PL = window.PL || {});
