(function (PL) {
  var ICONS = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="8" cy="10" r="3" fill="#4a90e2"/><circle cx="16" cy="10" r="3" fill="#4a90e2"/><circle cx="12" cy="16" r="3" fill="#f08c00"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="4" y="14" width="16" height="6" fill="#4a90e2"/><rect x="8" y="8" width="8" height="4" rx="2" fill="#6c757d"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><ellipse cx="12" cy="14" rx="7" ry="5" fill="#4a90e2"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="10" y="3" width="4" height="18" fill="none" stroke="#6b7785" stroke-width="2"/><rect x="11" y="10" width="2" height="10" fill="#4a90e2"/></svg>',
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><ellipse cx="6" cy="16" rx="3" ry="2" fill="#e07a1f"/><ellipse cx="12" cy="15" rx="3.5" ry="2.5" fill="#1565c0"/><ellipse cx="18" cy="14" rx="4" ry="3" fill="#2b8a3e"/></svg>'
  ];
  var TITLES = [
    'sim.surface-tension.tabMolecules',
    'sim.surface-tension.tabNeedle',
    'sim.surface-tension.tabDrop',
    'sim.surface-tension.tabCapillary',
    'sim.surface-tension.tabCompare'
  ];
  var shared = null;
  function sharedModel() {
    if (!shared) shared = PL.sims['surface-tension'].createModel();
    return shared;
  }
  var screens = [];
  var i;
  for (i = 0; i < 5; i++) {
    (function (idx) {
      screens.push({
        id: ['molecules', 'needle', 'drop', 'capillary', 'compare'][idx],
        title: TITLES[idx],
        icon: ICONS[idx],
        createModel: sharedModel,
        createView: function (model) {
          return PL.sims['surface-tension'].createView(model, idx);
        }
      });
    })(i);
  }
  PL.Shell.start({
    id: 'surface-tension',
    screens: screens
  }, document.body);
})(window.PL);
