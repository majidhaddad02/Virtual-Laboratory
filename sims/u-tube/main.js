(function (PL) {
  var ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 3 v10 a5 5 0 0 0 10 0 V3" fill="none" stroke="#3d9be8" stroke-width="3"/></svg>';
  PL.Shell.start({
    id: 'u-tube',
    fit: true,
    screens: [
      {
        id: 'settle',
        title: 'sim.u-tube.settle.screen',
        icon: ICON,
        createModel: function () {
          return PL.sims['u-tube'].settle.createModel();
        },
        createView: function (model) {
          return PL.sims['u-tube'].createSettleView(model);
        }
      },
      {
        id: 'main',
        title: 'sim.u-tube.screenMeasure',
        icon: ICON,
        createModel: function () {
          return PL.sims['u-tube'].createModel();
        },
        createView: function (model) {
          return PL.sims['u-tube'].createView(model);
        }
      }
    ]
  }, document.body);
})(window.PL);
