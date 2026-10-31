(function (PL) {
  var ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="4" y="14" width="16" height="6" fill="#3d9be8"/><rect x="6" y="4" width="4" height="10" fill="#3d9be8"/><rect x="14" y="6" width="4" height="8" fill="#3d9be8"/></svg>';
  PL.Shell.start({
    id: 'hydrostatic',
    screens: [{
      id: 'main',
      title: 'sim.hydrostatic.screen',
      icon: ICON,
      createModel: function () {
        return PL.sims.hydrostatic.createModel();
      },
      createView: function (model) {
        return PL.sims.hydrostatic.createView(model);
      }
    }]
  }, document.body);
})(window.PL);
