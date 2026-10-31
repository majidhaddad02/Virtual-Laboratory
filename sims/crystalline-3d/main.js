(function (PL) {
  var ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="8" cy="8" r="3" fill="#64b0ff"/><circle cx="16" cy="12" r="3" fill="#ff6fa8"/><circle cx="10" cy="18" r="3" fill="#ffb347"/></svg>';
  PL.Shell.start({
    id: 'crystalline-3d',
    screens: [{
      id: 'main',
      title: 'sim.crystalline-3d.screen',
      icon: ICON,
      createModel: function () {
        return PL.sims['crystalline-3d'].createModel();
      },
      createView: function (model) {
        return PL.sims['crystalline-3d'].createView(model);
      }
    }]
  }, document.body);
})(window.PL);
