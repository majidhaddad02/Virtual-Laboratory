(function (PL) {
  var ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="8" cy="8" r="3" fill="#1565c0"/><circle cx="16" cy="8" r="3" fill="#1565c0"/><circle cx="12" cy="16" r="3" fill="#e07a1f"/></svg>';
  PL.Shell.start({
    id: 'crystalline',
    screens: [{
      id: 'main',
      title: 'sim.crystalline.screen',
      icon: ICON,
      createModel: function () {
        return PL.sims.crystalline.createModel();
      },
      createView: function (model) {
        return PL.sims.crystalline.createView(model);
      }
    }]
  }, document.body);
})(window.PL);
