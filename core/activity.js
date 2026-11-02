(function (PL) {
  function isNonEmptyString(v) {
    return typeof v === 'string' && v.length > 0;
  }

  function isProperty(x) {
    return !!(x && typeof x === 'object' && typeof x.link === 'function' && typeof x.reset === 'function');
  }

  function applyPreset(model, preset) {
    if (!model || !preset) return;
    var k;
    for (k in preset) {
      if (!Object.prototype.hasOwnProperty.call(preset, k)) continue;
      if (k === 'screen') continue;
      if (isProperty(model[k])) model[k].value = preset[k];
    }
  }

  function presetKeysValid(preset, model) {
    if (!preset) return true;
    if (typeof preset !== 'object') return false;
    var k;
    for (k in preset) {
      if (!Object.prototype.hasOwnProperty.call(preset, k)) continue;
      if (k === 'screen') continue;
      if (!isProperty(model[k])) return false;
    }
    return true;
  }

  function validateChallenge(ch) {
    if (!ch || typeof ch !== 'object') return { ok: false, reason: 'missing' };
    if (!isNonEmptyString(ch.id)) return { ok: false, reason: 'id' };
    if (!isNonEmptyString(ch.title)) return { ok: false, reason: 'title' };
    if (!isNonEmptyString(ch.question)) return { ok: false, reason: 'question' };
    if (!Array.isArray(ch.options) || ch.options.length < 2) return { ok: false, reason: 'options' };
    var i;
    for (i = 0; i < ch.options.length; i++) {
      if (!isNonEmptyString(ch.options[i])) return { ok: false, reason: 'options' };
    }
    if (typeof ch.answerIndex !== 'number' || ch.answerIndex < 0 || ch.answerIndex >= ch.options.length) {
      return { ok: false, reason: 'answerIndex' };
    }
    if (typeof ch.goal !== 'number' || ch.goal !== (ch.goal | 0) || ch.goal < 0) {
      return { ok: false, reason: 'goal' };
    }
    if (!isNonEmptyString(ch.experiment)) return { ok: false, reason: 'experiment' };
    if (!isNonEmptyString(ch.explanation)) return { ok: false, reason: 'explanation' };
    if (ch.preset != null && (typeof ch.preset !== 'object' || Array.isArray(ch.preset))) {
      return { ok: false, reason: 'preset' };
    }
    return { ok: true, reason: '' };
  }

  function validate(def) {
    var errors = [];
    var i, ch, v, sec, j;
    if (!def || typeof def !== 'object') {
      return { ok: false, errors: ['missing'] };
    }
    if (!Array.isArray(def.challenges) || def.challenges.length < 1 || def.challenges.length > 5) {
      errors.push('challenges');
    } else {
      for (i = 0; i < def.challenges.length; i++) {
        ch = def.challenges[i];
        v = validateChallenge(ch);
        if (!v.ok) errors.push('challenge:' + (ch && ch.id ? ch.id : i) + ':' + v.reason);
      }
    }
    if (def.worksheet) {
      if (!def.worksheet.sections || !Array.isArray(def.worksheet.sections)) {
        errors.push('worksheet.sections');
      } else {
        for (i = 0; i < def.worksheet.sections.length; i++) {
          sec = def.worksheet.sections[i];
          if (!sec || !isNonEmptyString(sec.title)) errors.push('section.title');
          if (sec.columns && !Array.isArray(sec.columns)) errors.push('section.columns');
          if (sec.rows && !Array.isArray(sec.rows)) errors.push('section.rows');
          if (sec.rows) {
            for (j = 0; j < sec.rows.length; j++) {
              if (!Array.isArray(sec.rows[j])) errors.push('section.rows');
            }
          }
          if (sec.textareas && !Array.isArray(sec.textareas)) errors.push('section.textareas');
        }
      }
    }
    return { ok: errors.length === 0, errors: errors };
  }

  function coverGoals(def, goals) {
    var errors = [];
    var n = goals && goals.length ? goals.length : 0;
    var seen = [];
    var i, g;
    if (!n) errors.push('goals');
    if (!def || !Array.isArray(def.challenges)) {
      errors.push('challenges');
      return { ok: false, errors: errors };
    }
    for (i = 0; i < n; i++) seen[i] = false;
    for (i = 0; i < def.challenges.length; i++) {
      g = def.challenges[i] && def.challenges[i].goal;
      if (typeof g !== 'number' || g !== (g | 0) || g < 0 || g >= n) {
        errors.push('goalRange:' + i);
      } else {
        seen[g] = true;
      }
    }
    for (i = 0; i < n; i++) {
      if (!seen[i]) errors.push('goalUncovered:' + i);
    }
    return { ok: errors.length === 0, errors: errors };
  }

  function isCorrect(challenge, selectedIndex) {
    if (!challenge) return false;
    return selectedIndex === challenge.answerIndex;
  }

  function checkAnswer(challenge, selectedIndex) {
    var ok = isCorrect(challenge, selectedIndex);
    return {
      correct: ok,
      selected: selectedIndex,
      answerIndex: challenge ? challenge.answerIndex : -1,
      explanation: challenge && challenge.explanation ? challenge.explanation : ''
    };
  }

  function selectedIndexOf(name, root) {
    var nodes = root.querySelectorAll('input[type="radio"][name="' + name + '"]');
    var i;
    for (i = 0; i < nodes.length; i++) {
      if (nodes[i].checked) return i;
    }
    return -1;
  }

  function mount(containerEl, activityDef, ids, opts) {
    opts = opts || {};
    var prefix = typeof ids === 'string' && ids ? ids : 'act';
    var def = activityDef || { challenges: [] };
    var i, j, k, ch, sec, art, h, p, field, lab, inp, btn, live, table, tr, th, td, ta, wrap, actions;
    containerEl.className = (containerEl.className ? containerEl.className + ' ' : '') + 'pl-activity';
    containerEl.innerHTML = '';

    var list = document.createElement('div');
    list.className = 'pl-challenges';
    for (i = 0; i < (def.challenges || []).length; i++) {
      ch = def.challenges[i];
      art = document.createElement('article');
      art.className = 'pl-challenge';
      h = document.createElement('h3');
      h.textContent = ch.title;
      art.appendChild(h);

      wrap = document.createElement('section');
      wrap.className = 'pl-step';
      h = document.createElement('h4');
      h.textContent = PL.t('ui.activityPredict');
      wrap.appendChild(h);
      p = document.createElement('p');
      p.textContent = ch.question;
      wrap.appendChild(p);
      field = document.createElement('fieldset');
      field.className = 'pl-options';
      lab = document.createElement('legend');
      lab.textContent = ch.question;
      field.appendChild(lab);
      for (j = 0; j < ch.options.length; j++) {
        lab = document.createElement('label');
        lab.className = 'pl-option';
        inp = document.createElement('input');
        inp.type = 'radio';
        inp.name = prefix + '-' + ch.id;
        inp.value = String(j);
        lab.appendChild(inp);
        lab.appendChild(document.createTextNode(ch.options[j]));
        field.appendChild(lab);
      }
      wrap.appendChild(field);
      art.appendChild(wrap);

      wrap = document.createElement('section');
      wrap.className = 'pl-step';
      h = document.createElement('h4');
      h.textContent = PL.t('ui.activityExperiment');
      wrap.appendChild(h);
      p = document.createElement('p');
      p.textContent = ch.experiment;
      wrap.appendChild(p);
      if (ch.preset && opts.onPreset) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pl-preset';
        btn.textContent = PL.t('ui.activityPreset');
        (function (preset) {
          btn.addEventListener('click', function () {
            opts.onPreset(preset);
          });
        })(ch.preset);
        wrap.appendChild(btn);
      }
      art.appendChild(wrap);

      wrap = document.createElement('section');
      wrap.className = 'pl-step';
      h = document.createElement('h4');
      h.textContent = PL.t('ui.activityResult');
      wrap.appendChild(h);
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pl-reveal';
      btn.textContent = PL.t('ui.activityReveal');
      live = document.createElement('div');
      live.className = 'pl-reveal-live';
      live.setAttribute('aria-live', 'polite');
      (function (challenge, name, liveEl) {
        btn.addEventListener('click', function () {
          var sel = selectedIndexOf(name, containerEl);
          var result;
          if (sel < 0) {
            liveEl.className = 'pl-reveal-live';
            liveEl.textContent = PL.t('ui.activityNeedChoice');
            return;
          }
          result = checkAnswer(challenge, sel);
          liveEl.className = 'pl-reveal-live ' + (result.correct ? 'ok' : 'bad');
          liveEl.textContent = (result.correct ? PL.t('ui.activityCorrect') : PL.t('ui.activityIncorrect')) + ' ' + result.explanation;
        });
      })(ch, prefix + '-' + ch.id, live);
      wrap.appendChild(btn);
      wrap.appendChild(live);
      art.appendChild(wrap);
      list.appendChild(art);
    }
    containerEl.appendChild(list);

    if (def.worksheet && def.worksheet.sections) {
      wrap = document.createElement('div');
      wrap.className = 'pl-worksheet';
      h = document.createElement('h3');
      h.textContent = PL.t('ui.activityWorksheet');
      wrap.appendChild(h);
      field = document.createElement('div');
      field.className = 'pl-worksheet-meta';
      lab = document.createElement('label');
      lab.textContent = PL.t('ui.activityName');
      inp = document.createElement('input');
      inp.type = 'text';
      inp.setAttribute('aria-label', PL.t('ui.activityName'));
      lab.appendChild(inp);
      field.appendChild(lab);
      lab = document.createElement('label');
      lab.textContent = PL.t('ui.activityDate');
      inp = document.createElement('input');
      inp.type = 'text';
      inp.setAttribute('aria-label', PL.t('ui.activityDate'));
      lab.appendChild(inp);
      field.appendChild(lab);
      wrap.appendChild(field);

      for (i = 0; i < def.worksheet.sections.length; i++) {
        sec = def.worksheet.sections[i];
        art = document.createElement('section');
        art.className = 'pl-worksheet-section';
        h = document.createElement('h4');
        h.textContent = sec.title;
        art.appendChild(h);
        if (sec.columns && sec.columns.length) {
          table = document.createElement('table');
          table.className = 'pl-worksheet-table';
          tr = document.createElement('tr');
          for (j = 0; j < sec.columns.length; j++) {
            th = document.createElement('th');
            th.textContent = sec.columns[j];
            tr.appendChild(th);
          }
          table.appendChild(tr);
          for (j = 0; j < (sec.rows || []).length; j++) {
            tr = document.createElement('tr');
            for (k = 0; k < sec.columns.length; k++) {
              td = document.createElement('td');
              inp = document.createElement('input');
              inp.type = 'text';
              inp.setAttribute('aria-label', sec.columns[k] + ' ' + (j + 1));
              if (sec.rows[j] && sec.rows[j][k]) inp.placeholder = sec.rows[j][k];
              td.appendChild(inp);
              tr.appendChild(td);
            }
            table.appendChild(tr);
          }
          art.appendChild(table);
        }
        if (sec.textareas) {
          for (j = 0; j < sec.textareas.length; j++) {
            lab = document.createElement('label');
            lab.className = 'pl-textarea';
            lab.textContent = sec.textareas[j];
            ta = document.createElement('textarea');
            ta.rows = 3;
            ta.setAttribute('aria-label', sec.textareas[j]);
            lab.appendChild(ta);
            art.appendChild(lab);
          }
        }
        wrap.appendChild(art);
      }

      actions = document.createElement('div');
      actions.className = 'pl-worksheet-actions';
      btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = PL.t('ui.activityPrint');
      btn.addEventListener('click', function () {
        if (window.print) window.print();
      });
      actions.appendChild(btn);
      btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = PL.t('ui.activityClear');
      btn.addEventListener('click', function () {
        var nodes = wrap.querySelectorAll('input, textarea');
        var n;
        for (n = 0; n < nodes.length; n++) nodes[n].value = '';
      });
      actions.appendChild(btn);
      wrap.appendChild(actions);
      containerEl.appendChild(wrap);
    }

    return { el: containerEl };
  }

  PL.Activity = {
    validateChallenge: validateChallenge,
    validate: validate,
    coverGoals: coverGoals,
    isCorrect: isCorrect,
    checkAnswer: checkAnswer,
    isProperty: isProperty,
    applyPreset: applyPreset,
    presetKeysValid: presetKeysValid,
    mount: mount
  };
})(window.PL = window.PL || {});
