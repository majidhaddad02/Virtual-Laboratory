(function (PL) {
  var packs = {};
  PL.locale = 'fa';
  PL.i18n = {
    add: function (locale, map) {
      if (!packs[locale]) packs[locale] = {};
      var k;
      for (k in map) {
        if (Object.prototype.hasOwnProperty.call(map, k)) packs[locale][k] = map[k];
      }
    },
    _packs: packs
  };
  PL.t = function (key, params) {
    var pack = packs[PL.locale] || {};
    var s = pack[key];
    if (s == null) {
      console.warn('missing i18n key: ' + key);
      return '⟦' + key + '⟧';
    }
    if (params) {
      s = s.replace(/\{(\w+)\}/g, function (_, n) {
        return params[n] != null ? String(params[n]) : '{' + n + '}';
      });
    }
    return s;
  };
})(window.PL = window.PL || {});
