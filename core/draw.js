(function (PL) {
  PL.draw = {
    fitCanvas: function (canvas, cssW, cssH, dpr) {
      var w = Math.max(1, Math.round(cssW * dpr));
      var h = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
      return { w: w, h: h, dpr: dpr };
    }
  };
})(window.PL = window.PL || {});
