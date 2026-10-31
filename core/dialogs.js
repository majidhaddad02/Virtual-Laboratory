(function (PL) {
  function backdrop() {
    var b = document.createElement('div');
    b.className = 'pl-dialog-backdrop';
    b.setAttribute('role', 'presentation');
    return b;
  }

  function close(node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
  }

  PL.dialogs = {
    about: function (entry) {
      var bg = backdrop();
      var d = document.createElement('div');
      d.className = 'pl-dialog';
      d.setAttribute('role', 'dialog');
      d.setAttribute('aria-modal', 'true');
      var h = document.createElement('h2');
      h.textContent = PL.t('ui.about');
      d.appendChild(h);
      if (entry) {
        var i;
        if (entry.goals && entry.goals.length) {
          var gTitle = document.createElement('p');
          gTitle.style.fontWeight = '800';
          gTitle.textContent = PL.t('ui.goals');
          d.appendChild(gTitle);
          var ul = document.createElement('ul');
          for (i = 0; i < entry.goals.length; i++) {
            var li = document.createElement('li');
            li.textContent = entry.goals[i];
            ul.appendChild(li);
          }
          d.appendChild(ul);
        }
        if (entry.modelNotes && entry.modelNotes.length) {
          var nTitle = document.createElement('p');
          nTitle.style.fontWeight = '800';
          nTitle.textContent = PL.t('ui.modelNotes');
          d.appendChild(nTitle);
          var ul2 = document.createElement('ul');
          for (i = 0; i < entry.modelNotes.length; i++) {
            var li2 = document.createElement('li');
            li2.textContent = entry.modelNotes[i];
            ul2.appendChild(li2);
          }
          d.appendChild(ul2);
        }
        var ver = document.createElement('p');
        ver.textContent = PL.t('ui.version') + ' ' + (entry.version || '');
        d.appendChild(ver);
      }
      var row = document.createElement('div');
      row.className = 'row';
      var ok = document.createElement('button');
      ok.type = 'button';
      ok.textContent = PL.t('ui.close');
      ok.addEventListener('click', function () {
        close(bg);
      });
      row.appendChild(ok);
      d.appendChild(row);
      bg.appendChild(d);
      bg.addEventListener('click', function (e) {
        if (e.target === bg) close(bg);
      });
      document.body.appendChild(bg);
      ok.focus();
      return { close: function () { close(bg); } };
    },
    confirmReset: function (onYes) {
      var bg = backdrop();
      var d = document.createElement('div');
      d.className = 'pl-dialog';
      d.setAttribute('role', 'dialog');
      d.setAttribute('aria-modal', 'true');
      var h = document.createElement('h2');
      h.textContent = PL.t('ui.resetAll');
      d.appendChild(h);
      var p = document.createElement('p');
      p.textContent = PL.t('ui.resetConfirm');
      d.appendChild(p);
      var row = document.createElement('div');
      row.className = 'row';
      var no = document.createElement('button');
      no.type = 'button';
      no.textContent = PL.t('ui.cancel');
      var yes = document.createElement('button');
      yes.type = 'button';
      yes.className = 'danger';
      yes.textContent = PL.t('ui.resetAll');
      no.addEventListener('click', function () {
        close(bg);
      });
      yes.addEventListener('click', function () {
        close(bg);
        onYes();
      });
      row.appendChild(no);
      row.appendChild(yes);
      d.appendChild(row);
      bg.appendChild(d);
      bg.addEventListener('click', function (e) {
        if (e.target === bg) close(bg);
      });
      document.body.appendChild(bg);
      no.focus();
      return { close: function () { close(bg); } };
    }
  };

  PL.i18n.add('fa', {
    'ui.about': 'درباره‌ی مدل',
    'ui.goals': 'هدف‌ها',
    'ui.modelNotes': 'فرض‌ها و محدودیت‌ها',
    'ui.version': 'نسخه',
    'ui.close': 'بستن',
    'ui.resetAll': 'بازنشانی همه',
    'ui.resetConfirm': 'همه کنترل‌ها و حالت مدل به مقدار اولیه برگردند؟',
    'ui.cancel': 'انصراف',
    'ui.play': 'پخش',
    'ui.pause': 'توقف',
    'ui.step': 'گام',
    'ui.speed': 'سرعت',
    'ui.back': 'فیزیک‌لب'
  });
})(window.PL = window.PL || {});
