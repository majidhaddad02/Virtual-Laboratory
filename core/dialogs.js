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

  function focusables(root) {
    var sel = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    var nodes = root.querySelectorAll(sel);
    var out = [];
    var i;
    for (i = 0; i < nodes.length; i++) {
      if (!nodes[i].disabled) out.push(nodes[i]);
    }
    return out;
  }

  function nextFocusIndex(current, count, shift) {
    if (count <= 0) return 0;
    if (shift) return current <= 0 ? count - 1 : current - 1;
    return current >= count - 1 ? 0 : current + 1;
  }

  function shouldClose(key) {
    return key === 'Escape' || key === 'Esc';
  }

  function bindDialog(bg, dialogEl, initialFocus, onClose, opts) {
    opts = opts || {};
    var persist = !!opts.persist;
    var opener = document.activeElement;
    function finish() {
      document.removeEventListener('keydown', onKey, true);
      bg._plFinish = null;
      if (persist) bg.classList.add('hidden');
      else close(bg);
      if (opener && opener.focus) opener.focus();
      if (onClose) onClose();
    }
    function onKey(e) {
      if (shouldClose(e.key)) {
        if (e.preventDefault) e.preventDefault();
        finish();
        return;
      }
      if (e.key !== 'Tab') return;
      var items = focusables(dialogEl);
      if (!items.length) return;
      var i;
      var idx = 0;
      for (i = 0; i < items.length; i++) {
        if (items[i] === document.activeElement) {
          idx = i;
          break;
        }
      }
      if (e.preventDefault) e.preventDefault();
      items[nextFocusIndex(idx, items.length, !!e.shiftKey)].focus();
    }
    document.addEventListener('keydown', onKey, true);
    if (!bg._plBackdropBound) {
      bg._plBackdropBound = true;
      bg.addEventListener('click', function (e) {
        if (e.target === bg && bg._plFinish) bg._plFinish();
      });
    }
    bg._plFinish = finish;
    if (!bg.parentNode) document.body.appendChild(bg);
    bg.classList.remove('hidden');
    if (initialFocus && initialFocus.focus) initialFocus.focus();
    return finish;
  }

  PL.dialogs = {
    nextFocusIndex: nextFocusIndex,
    shouldClose: shouldClose,
    bind: bindDialog,
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
      row.appendChild(ok);
      d.appendChild(row);
      bg.appendChild(d);
      var finish = bindDialog(bg, d, ok);
      ok.addEventListener('click', finish);
      return { close: finish };
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
      row.appendChild(no);
      row.appendChild(yes);
      d.appendChild(row);
      bg.appendChild(d);
      var finish = bindDialog(bg, d, no);
      no.addEventListener('click', finish);
      yes.addEventListener('click', function () {
        finish();
        onYes();
      });
      return { close: finish };
    }
  };
})(window.PL = window.PL || {});
