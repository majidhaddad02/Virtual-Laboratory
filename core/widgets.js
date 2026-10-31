(function (PL) {
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    var k;
    if (attrs) {
      for (k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        if (k === 'className') n.className = attrs[k];
        else if (k === 'text') n.textContent = attrs[k];
        else if (k === 'html') n.innerHTML = attrs[k];
        else n.setAttribute(k, attrs[k]);
      }
    }
    if (kids) {
      var i;
      for (i = 0; i < kids.length; i++) n.appendChild(kids[i]);
    }
    return n;
  }

  function bindInput(input, prop, parse, write) {
    function fromProp(v) {
      write(input, v);
    }
    prop.link(fromProp);
    input.addEventListener('input', function () {
      prop.value = parse(input);
    });
    input.addEventListener('change', function () {
      prop.value = parse(input);
    });
    return function () {
      prop.unlink(fromProp);
    };
  }

  var ui = {};

  ui.slider = function (prop, opts) {
    opts = opts || {};
    var min = opts.min != null ? opts.min : 0;
    var max = opts.max != null ? opts.max : 100;
    var step = opts.step != null ? opts.step : 1;
    var label = opts.label || '';
    var wrap = el('div', { className: 'ui-slider box' });
    var head = el('div', { className: 'ui-slider-head' });
    var lab = el('span', { text: label });
    var val = el('span', { className: 'val', 'aria-live': 'polite' });
    head.appendChild(lab);
    head.appendChild(val);
    var input = el('input', {
      type: 'range',
      min: String(min),
      max: String(max),
      step: String(step),
      'aria-label': label
    });
    wrap.appendChild(head);
    wrap.appendChild(input);
    function show(v) {
      val.textContent = PL.format ? PL.format.num(v, opts.decimals || 0) : String(v);
    }
    var un = bindInput(
      input,
      prop,
      function (inp) {
        return Number(inp.value);
      },
      function (inp, v) {
        inp.value = String(v);
        show(v);
      }
    );
    return { el: wrap, dispose: un };
  };

  ui.checkbox = function (prop, opts) {
    opts = opts || {};
    var lab = el('label', { className: 'ui-check' });
    var input = el('input', { type: 'checkbox' });
    lab.appendChild(input);
    lab.appendChild(document.createTextNode(' ' + (opts.label || '')));
    var un = bindInput(
      input,
      prop,
      function (inp) {
        return inp.checked;
      },
      function (inp, v) {
        inp.checked = !!v;
      }
    );
    return { el: lab, dispose: un };
  };

  ui.radio = function (prop, opts) {
    opts = opts || {};
    var wrap = el('div', { className: 'ui-radio-group box' });
    if (opts.title) wrap.appendChild(el('h3', { text: opts.title }));
    var name = opts.name || ('r' + Math.random().toString(36).slice(2));
    var items = opts.items || [];
    var unsubs = [];
    var i;
    for (i = 0; i < items.length; i++) {
      (function (item) {
        var lab = el('label', { className: 'ui-radio' });
        var input = el('input', { type: 'radio', name: name, value: String(item.value) });
        lab.appendChild(input);
        lab.appendChild(document.createTextNode(' ' + item.label));
        wrap.appendChild(lab);
        function fromProp(v) {
          input.checked = Object.is(v, item.value) || String(v) === String(item.value);
        }
        prop.link(fromProp);
        input.addEventListener('change', function () {
          if (input.checked) prop.value = item.value;
        });
        unsubs.push(function () {
          prop.unlink(fromProp);
        });
      })(items[i]);
    }
    return {
      el: wrap,
      dispose: function () {
        var j;
        for (j = 0; j < unsubs.length; j++) unsubs[j]();
      }
    };
  };

  ui.stepper = function (prop, opts) {
    opts = opts || {};
    var wrap = el('div', { className: 'ui-stepper num-row' });
    var minus = el('button', { type: 'button', text: '−', 'aria-label': opts.minusLabel || '−' });
    var plus = el('button', { type: 'button', text: '+', 'aria-label': opts.plusLabel || '+' });
    var input = el('input', { type: 'number', 'aria-label': opts.label || '' });
    wrap.appendChild(minus);
    wrap.appendChild(input);
    wrap.appendChild(plus);
    var step = opts.step != null ? opts.step : 1;
    minus.addEventListener('click', function () {
      prop.value = (opts.min != null ? Math.max(opts.min, prop.value - step) : prop.value - step);
    });
    plus.addEventListener('click', function () {
      prop.value = (opts.max != null ? Math.min(opts.max, prop.value + step) : prop.value + step);
    });
    var un = bindInput(
      input,
      prop,
      function (inp) {
        return PL.format.parseNum(inp.value);
      },
      function (inp, v) {
        inp.value = String(v);
      }
    );
    return { el: wrap, dispose: un };
  };

  ui.button = function (opts) {
    opts = opts || {};
    var b = el('button', {
      type: 'button',
      className: opts.className || '',
      text: opts.label || ''
    });
    if (opts.title) b.setAttribute('title', opts.title);
    if (opts.html) b.innerHTML = opts.html;
    if (opts.onClick) b.addEventListener('click', opts.onClick);
    return {
      el: b,
      dispose: function () {}
    };
  };

  ui.box = function (title, children) {
    var box = el('div', { className: 'box' });
    if (title) box.appendChild(el('h3', { text: title }));
    var i;
    for (i = 0; i < children.length; i++) box.appendChild(children[i]);
    return {
      el: box,
      dispose: function () {}
    };
  };

  ui.legend = function (items) {
    var wrap = el('div', { className: 'legend-dots' });
    var i;
    for (i = 0; i < items.length; i++) {
      var row = el('div');
      var dot = el('b');
      dot.style.background = items[i].color;
      row.appendChild(dot);
      row.appendChild(document.createTextNode(items[i].label));
      wrap.appendChild(row);
    }
    return { el: wrap, dispose: function () {} };
  };

  ui.readout = function (prop, opts) {
    opts = opts || {};
    var span = el('span', { className: 'ui-readout', 'aria-live': 'polite' });
    function render(v) {
      if (opts.html) span.innerHTML = opts.html(v);
      else span.textContent = opts.format ? opts.format(v) : String(v);
    }
    prop.link(render);
    return {
      el: span,
      dispose: function () {
        prop.unlink(render);
      }
    };
  };

  PL.ui = ui;
  PL.dom = { el: el };
})(window.PL = window.PL || {});
