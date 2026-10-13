/* Shared helpers. Everything hangs off the global App namespace (no build step, works from file://). */
(function () {
  'use strict';
  var App = (window.App = window.App || { views: {} });

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(v) { return v == null ? '' : String(v).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }

  /* ---------- numbers ---------- */
  function fmtNum(n) { return Number(n || 0).toLocaleString('en-US'); }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function round1(n) { return Math.round(n * 10) / 10; }
  /* Marks like 132.5 keep the half; whole numbers stay whole. */
  function fmtMarks(n) { var r = Math.round(n * 2) / 2; return (r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)); }
  var BN_DIGITS = '০১২৩৪৫৬৭৮৯';
  function toBn(v) { return String(v).replace(/[0-9]/g, function (d) { return BN_DIGITS[d]; }); }

  /* ---------- dates (local calendar days as YYYY-MM-DD) ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseDay(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(s, n) { var d = parseDay(s); d.setDate(d.getDate() + n); return dayKey(d); }
  function daysBetween(a, b) { return Math.round((parseDay(b) - parseDay(a)) / 86400000); }
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function fmtDay(s, withWeekday) {
    var d = typeof s === 'number' ? new Date(s) : parseDay(s);
    return (withWeekday ? WEEKDAYS[d.getDay()] + ', ' : '') + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }
  function fmtDayShort(s) { var d = parseDay(s); return d.getDate() + ' ' + MONTHS[d.getMonth()]; }
  function fmtDateTime(ts) {
    var d = new Date(ts);
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear() + ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  /* 3725 -> "1:02:05", 125 -> "2:05" */
  function fmtClock(sec) {
    sec = Math.max(0, Math.round(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + pad(m) : m) + ':' + pad(s);
  }
  /* 3725 -> "1h 2m", 125 -> "2m 5s" */
  function fmtDuration(sec) {
    sec = Math.max(0, Math.round(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h) return h + 'h ' + m + 'm';
    if (m) return m + 'm' + (s ? ' ' + s + 's' : '');
    return s + 's';
  }

  /* ---------- randomness ---------- */
  function rng(seed) { // mulberry32
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function shuffle(arr, rand) {
    rand = rand || Math.random;
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function debounce(fn, ms) {
    var t;
    return function () { var args = arguments, self = this; clearTimeout(t); t = setTimeout(function () { fn.apply(self, args); }, ms); };
  }

  /* ---------- subject helpers ---------- */
  function optionLabels(subjectId) { return subjectId === 'english' ? ['A', 'B', 'C', 'D'] : ['ক', 'খ', 'গ', 'ঘ']; }
  function isBnText(subjectId) { return subjectId !== 'english'; }

  /* ---------- icons (24px stroke icons) ---------- */
  var ICONS = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h4.5v-6h4v6h4.5V10"/>',
    guide: '<path d="M2 5h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 5h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
    syllabus: '<path d="m3.5 6.5 1.8 1.8L8.5 5"/><path d="m3.5 13 1.8 1.8 3.2-3.3"/><path d="M12 7h9"/><path d="M12 13.5h9"/><path d="M12 20h9"/><path d="M5 20h.01"/>',
    notes: '<path d="M14 3H6.5A2.5 2.5 0 0 0 4 5.5v13A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V9z"/><path d="M14 3v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    practice: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    mock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9.5 2.5h5"/>',
    cards: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5.5A2.5 2.5 0 0 0 13.5 3h-8A2.5 2.5 0 0 0 3 5.5v8A2.5 2.5 0 0 0 5.5 16H8"/>',
    review: '<path d="M3 12a9 9 0 1 0 2.6-6.4"/><path d="M3 4v5h5"/><path d="M12 8v4l3 2"/>',
    planner: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h3"/>',
    settings: '<path d="M4 6h9"/><path d="M17 6h3"/><path d="M4 12h3"/><path d="M11 12h9"/><path d="M4 18h11"/><path d="M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
    moon: '<path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.6 6.6 0 0 0 9.7 9.7z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="m5 12.5 4.5 4.5L19.5 7"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    bookmark: '<path d="M18.5 21 12 16.5 5.5 21V5.5A2.5 2.5 0 0 1 8 3h8a2.5 2.5 0 0 1 2.5 2.5z"/>',
    flag: '<path d="M5 21.5V4"/><path d="M5 4h12.5l-2.3 4.3 2.3 4.2H5"/>',
    play: '<path d="M7 4.5v15l12.5-7.5z"/>',
    refresh: '<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6l2.5 2.5"/><path d="M20.5 3.5V8.5h-5"/>',
    download: '<path d="M12 3.5v12"/><path d="m7 10.5 5 5 5-5"/><path d="M5 20.5h14"/>',
    upload: '<path d="M12 20.5v-12"/><path d="m7 13.5 5-5 5 5"/><path d="M5 3.5h14"/>',
    trash: '<path d="M3.5 6.5h17"/><path d="M9 6.5V4h6v2.5"/><path d="M6 6.5 7 21h10l1-14.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.5h.01"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
    flame: '<path d="M12 21.5c3.9 0 6.8-2.6 6.8-6.3 0-3.4-2.4-5.4-3.9-7.8-1 1.9-1.9 2.9-3.4 3.4.4-2.8.4-5.6-1.6-8.3C7.8 6.4 5.2 9.3 5.2 15.2c0 3.7 2.9 6.3 6.8 6.3z"/>',
    bolt: '<path d="M13 2.5 4.5 14H11l-1 7.5L18.5 10H12z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    edit: '<path d="M4 20h4L19.5 8.5l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    trophy: '<path d="M8 21h8M12 16.5V21M7 3.5h10V8a5 5 0 0 1-10 0z"/><path d="M17 5h3v1.5A3.5 3.5 0 0 1 16.6 10M7 5H4v1.5A3.5 3.5 0 0 0 7.4 10"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16.2 9.5"/>',
    bad: '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
    skip: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
    target: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5h5"/>',
    layers: '<path d="M12 3 2.5 8 12 13l9.5-5z"/><path d="m2.5 12.5 9.5 5 9.5-5"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'
  };
  function icon(name, size, cls) {
    size = size || 18;
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------- toasts ---------- */
  function toast(msg, kind) {
    var host = $('#toasts');
    if (!host) return;
    var el = document.createElement('div');
    el.className = 'toast' + (kind ? ' toast-' + kind : '');
    el.setAttribute('role', kind === 'bad' ? 'alert' : 'status');
    el.innerHTML = icon(kind === 'bad' ? 'bad' : kind === 'warn' ? 'info' : 'ok', 18) + '<span></span>';
    el.querySelector('span').textContent = msg;
    host.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('in'); });
    setTimeout(function () { el.classList.remove('in'); setTimeout(function () { el.remove(); }, 250); }, 3400);
  }

  /* ---------- modal dialog (replaces confirm/alert, which block the page) ---------- */
  function modal(opts) {
    return new Promise(function (resolve) {
      var prevFocus = document.activeElement;
      var wrap = document.createElement('div');
      wrap.className = 'modal-wrap';
      var actions = opts.actions || [{ label: 'OK', value: true, kind: 'primary' }];
      wrap.innerHTML =
        '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
          '<h2 id="modal-title" class="modal-title"></h2>' +
          '<div class="modal-body">' + (opts.html || '') + '</div>' +
          '<div class="modal-actions">' +
            actions.map(function (a, i) {
              return '<button type="button" class="btn ' + (a.kind === 'primary' ? 'btn-primary' : a.kind === 'danger' ? 'btn-danger' : 'btn-ghost') + '" data-i="' + i + '">' + esc(a.label) + '</button>';
            }).join('') +
          '</div>' +
        '</div>';
      wrap.querySelector('.modal-title').textContent = opts.title || '';
      if (opts.text) {
        var p = document.createElement('p');
        p.textContent = opts.text;
        wrap.querySelector('.modal-body').prepend(p);
      }
      document.body.appendChild(wrap);
      function close(val) {
        document.removeEventListener('keydown', onKey, true);
        wrap.remove();
        if (prevFocus && prevFocus.focus) prevFocus.focus();
        resolve(val);
      }
      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(opts.cancelValue !== undefined ? opts.cancelValue : null); }
        if (e.key === 'Tab') { // keep focus inside the dialog
          var f = $$('button, input, select, textarea', wrap);
          if (!f.length) return;
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      }
      document.addEventListener('keydown', onKey, true);
      wrap.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-i]');
        if (b) close(actions[+b.dataset.i].value);
        else if (e.target === wrap) close(opts.cancelValue !== undefined ? opts.cancelValue : null);
      });
      var primary = wrap.querySelector('.btn-primary, .btn-danger') || wrap.querySelector('button');
      if (primary) primary.focus();
    });
  }
  function confirmBox(title, text, okLabel, danger) {
    return modal({
      title: title, text: text, cancelValue: false,
      actions: [{ label: 'Cancel', value: false }, { label: okLabel || 'OK', value: true, kind: danger ? 'danger' : 'primary' }]
    });
  }

  function download(filename, text, type) {
    var blob = new Blob([text], { type: type || 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- project links (the public site and its GitHub repository) ---------- */
  var REPO = 'https://github.com/AbirHasanPiash/bcs-prep';
  App.links = {
    repo: REPO,
    site: 'https://abirhasanpiash.github.io/bcs-prep/',
    /* A prefilled "new issue" link, so a mistake can be reported in two clicks. */
    issue: function (title, body) {
      return REPO + '/issues/new?title=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(body || '');
    },
    reportQuestion: function (q) {
      return App.links.issue('Mistake in question ' + q.id, 'Question ' + q.id + ' (' + q.t + '):\n' + q.q +
        '\n\nWhat is wrong, and a source if you have one:\n');
    }
  };

  App.util = {
    $: $, $$: $$, esc: esc, fmtNum: fmtNum, pct: pct, clamp: clamp, round1: round1, fmtMarks: fmtMarks, toBn: toBn,
    dayKey: dayKey, parseDay: parseDay, addDays: addDays, daysBetween: daysBetween, fmtDay: fmtDay, fmtDayShort: fmtDayShort,
    fmtDateTime: fmtDateTime, fmtClock: fmtClock, fmtDuration: fmtDuration, MONTHS: MONTHS, WEEKDAYS: WEEKDAYS,
    rng: rng, hash: hash, shuffle: shuffle, uid: uid, debounce: debounce,
    optionLabels: optionLabels, isBnText: isBnText, icon: icon, toast: toast, modal: modal, confirmBox: confirmBox, download: download
  };

  /* ---------- small render helpers shared by views ---------- */
  App.ui = {
    meter: function (value, max, cls) {
      var v = max ? clamp((value / max) * 100, 0, 100) : 0;
      return '<div class="meter' + (cls ? ' ' + cls : '') + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(v) + '"><span style="--v:' + v.toFixed(1) + '%"></span></div>';
    },
    meterRow: function (value, max, label, cls) {
      return '<div class="meter-row">' + App.ui.meter(value, max, cls) + '<span class="val">' + esc(label) + '</span></div>';
    },
    stat: function (label, value, sub, ic) {
      return '<div class="card stat">' +
        '<div class="stat-label">' + (ic ? icon(ic, 16) : '') + esc(label) + '</div>' +
        '<div class="stat-value">' + value + '</div>' +
        (sub ? '<div class="stat-sub">' + sub + '</div>' : '') + '</div>';
    },
    mono: function (subject, small) {
      return '<span class="mono' + (small ? ' sm' : '') + '" aria-hidden="true">' + esc(subject.mono) + '</span>';
    },
    subjectName: function (subject) {
      return '<span lang="' + (subject.id === 'english' ? 'en' : 'bn') + '">' + esc(subject.bn) + '</span>';
    },
    topicName: function (topic) {
      return '<span lang="' + (topic.subject === 'english' ? 'en' : 'bn') + '">' + esc(topic.bn) + '</span>';
    },
    empty: function (title, text, actionHtml) {
      return '<div class="card empty"><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p>' + (actionHtml || '') + '</div>';
    },
    callout: function (html, kind, ic) {
      return '<div class="callout' + (kind ? ' ' + kind : '') + '">' + icon(ic || (kind === 'warn' ? 'info' : kind === 'good' ? 'ok' : 'info'), 18) + '<div>' + html + '</div></div>';
    }
  };
})();
