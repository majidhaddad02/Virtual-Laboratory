(function (PL) {
  var ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="4" y="16" width="16" height="5" rx="2" fill="#9aa0a8"/><path d="M11 16 V5 h2 v11" fill="#9aa0a8"/></svg>';
  PL.Shell.start({
    id: 'barometer',
    fit: true,
    screens: [
      {
        id: 'steps',
        title: 'sim.barometer.screenSteps',
        icon: ICON,
        createModel: function () {
          return PL.sims.barometer.steps.createModel();
        },
        createView: function (model) {
          return PL.sims.barometer.createStepsView(model);
        }
      },
      {
        id: 'free',
        title: 'sim.barometer.screenFree',
        icon: ICON,
        createModel: function () {
          return PL.sims.barometer.free.createModel();
        },
        createView: function (model) {
          return PL.sims.barometer.createFreeView(model);
        }
      }
    ]
  }, document.body);
})(window.PL);
