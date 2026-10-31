(function (PL) {
  var FA = '۰۱۲۳۴۵۶۷۸۹';

  function toFaDigits(s) {
    return String(s).replace(/[0-9]/g, function (d) {
      return FA[Number(d)];
    });
  }

  PL.format = {
    num: function (x, decimals) {
      var n = Number(x);
      var sign = n < 0 ? '−' : '';
      n = Math.abs(n);
      if (decimals == null) decimals = 0;
      var s = n.toFixed(decimals);
      var parts = s.split('.');
      var out = toFaDigits(parts[0]);
      if (decimals > 0) out += '٫' + toFaDigits(parts[1]);
      return sign + out;
    },
    unit: function (x, decimals, unitStr) {
      return PL.format.num(x, decimals) + ' <span class="ltr">' + unitStr + '</span>';
    },
    parseNum: function (str) {
      var s = String(str);
      s = s.replace(/[۰-۹]/g, function (d) {
        return String(FA.indexOf(d));
      });
      s = s.replace(/٫/g, '.').replace(/−/g, '-');
      return parseFloat(s);
    }
  };
})(window.PL = window.PL || {});
