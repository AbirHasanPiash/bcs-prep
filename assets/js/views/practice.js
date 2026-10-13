/* Practice: build a question set, then answer it in Learn mode (instant feedback) or Test mode (timed, scored at the end). */
(function () {
  'use strict';
  var U = App.util, S = App.store, D = App.data, UI = App.ui, B = window.BCS;
  var esc = U.esc;

  var SEC_PER_Q = 36;
  var DIFF = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
  var session = null;
  var setup = { subjects: [], topics: [], filter: 'all', count: 20, mode: 'learn' };

  function lang(q) { return q.s === 'english' ? 'en' : 'bn'; }

  /* ---------- starting sessions ---------- */
  function start(cfg, replace) {
    if (!cfg.qids || !cfg.qids.length) { U.toast('No questions match that selection.', 'warn'); return false; }
    session = {
      mode: cfg.mode === 'test' ? 'test' : 'learn',
      title: cfg.title || 'Practice',
      qids: cfg.qids.slice(),
      idx: 0,
      answers: {},
      revealed: {},
      startedAt: Date.now(),
      timeLimit: cfg.mode === 'test' ? cfg.qids.length * SEC_PER_Q : 0,
      finished: false,
      reviewFilter: 'all'
    };
    if (replace) location.replace('#/practice/session'); else App.go('#/practice/session');
    return true;
  }

  /* Recommended set: a quarter re-tries earlier mistakes, the rest leans toward high-mark and weak subjects. */
  function smartQids(n) {
    var rand = U.rng(U.hash(U.uid()));
    var wrong = U.shuffle(D.pool({ filter: 'wrong' }), rand).slice(0, Math.floor(n * 0.25));
    var taken = {};
    wrong.forEach(function (q) { taken[q.id] = 1; });
    var subs = B.subjects.filter(function (s) { return D.bySubject[s.id].length; });
    var weights = subs.map(function (s) {
      var st = D.subjectStats(s.id);
      var acc = st.accuracy == null ? 0.5 : st.accuracy;
      return s.marks * (1.4 - acc);
    });
    var counts = D.apportion(n - wrong.length, weights);
    var out = wrong.slice();
    subs.forEach(function (s, i) {
      var list = D.bySubject[s.id].filter(function (q) { return !taken[q.id]; });
      out = out.concat(D.pickSpread(list, counts[i], rand));
    });
    return U.shuffle(out, rand).map(function (q) { return q.id; });
  }

  function poolFor(c) {
    return D.pool({ subjects: c.subjects, topics: c.topics, filter: c.filter });
  }
  function setupPool() { return poolFor(setup); }

  function titleFor(c) {
    if (c.topics.length === 1) return B.topicById[c.topics[0]].en;
    if (c.subjects.length === 1) return B.subjectById[c.subjects[0]].en;
    if (c.subjects.length > 1) return c.subjects.length + ' subjects';
    return 'All subjects';
  }

  function startFromSetup(replace, conf) {
    var c = conf || setup;
    var list = poolFor(c);
    var n = c.count === 'all' ? list.length : Math.min(c.count, list.length);
    var picked = c.topics.length || c.subjects.length === 1 ? D.pickSpread(list, n) : D.pick(list, n);
    var filterNote = { all: '', new: ' · new', wrong: ' · mistakes', bookmarked: ' · bookmarked', current: ' · current affairs' }[c.filter] || '';
    return start({ qids: picked.map(function (q) { return q.id; }), mode: c.mode, title: titleFor(c) + filterNote }, replace);
  }

  /* ---------- setup screen ---------- */
  function renderSetup(root, query) {
    if (query.go === '1') {
      // One-click links start right away with a temporary selection and leave the builder's choices alone.
      if (query.mode === 'smart') {
        var n = +query.n || 20;
        if (!start({ qids: smartQids(n), mode: 'learn', title: 'Recommended ' + n }, true)) location.replace('#/practice');
        return;
      }
      var tmp = { subjects: [], topics: [], filter: query.filter || 'all', count: query.n === 'all' ? 'all' : (+query.n || 20), mode: query.mode === 'test' ? 'test' : 'learn' };
      if (query.t && B.topicById[query.t]) { tmp.topics = [query.t]; tmp.subjects = [B.topicById[query.t].subject]; }
      else if (query.s && B.subjectById[query.s]) tmp.subjects = [query.s];
      if (!startFromSetup(true, tmp)) location.replace('#/practice');
      return;
    }
    if (query.t && B.topicById[query.t]) { setup.topics = [query.t]; setup.subjects = [B.topicById[query.t].subject]; }
    else if (query.s && B.subjectById[query.s]) { setup.subjects = [query.s]; setup.topics = []; }
    if (query.filter) setup.filter = query.filter;
    draw();

    function draw() {
      var pool = setupPool();
      var resume = session && !session.finished
        ? UI.callout('<strong>You have an unfinished session:</strong> ' + esc(session.title) + ' (' + Object.keys(session.mode === 'learn' ? session.revealed : session.answers).length + ' of ' + session.qids.length + ' answered). <a href="#/practice/session">Resume it</a>.', 'warn')
        : '';
      var subjChips = '<button type="button" class="chip' + (!setup.subjects.length ? ' on' : '') + '" data-subj="">All subjects <span class="count">' + D.all.length + '</span></button>' +
        B.subjects.map(function (s) {
          var on = setup.subjects.indexOf(s.id) >= 0;
          return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-subj="' + s.id + '" aria-pressed="' + on + '">' + esc(s.en) + ' <span class="count">' + D.bySubject[s.id].length + '</span></button>';
        }).join('');
      var topicBlock = '';
      if (setup.subjects.length === 1) {
        var s = B.subjectById[setup.subjects[0]];
        topicBlock = '<div class="field mt-16"><span class="field-label">Topics <span class="muted">(none selected = whole subject)</span></span><div class="chips">' +
          s.topics.map(function (t) {
            var on = setup.topics.indexOf(t.id) >= 0;
            return '<button type="button" class="chip' + (on ? ' on' : '') + '" data-topic="' + t.id + '" aria-pressed="' + on + '">' + UI.topicName(t) + ' <span class="count">' + D.byTopic[t.id].length + '</span></button>';
          }).join('') + '</div></div>';
      }
      var seg = function (name, opts, cur) {
        return '<div class="seg" role="group" data-seg="' + name + '">' + opts.map(function (o) {
          return '<button type="button" data-v="' + o[0] + '" class="' + (String(cur) === String(o[0]) ? 'on' : '') + '" aria-pressed="' + (String(cur) === String(o[0])) + '">' + o[1] + '</button>';
        }).join('') + '</div>';
      };
      var n = setup.count === 'all' ? pool.length : Math.min(setup.count, pool.length);

      root.innerHTML = '<div id="pset">' + resume +
        '<div class="grid qa-grid section">' +
          '<a class="card qa" href="#/practice?mode=smart&n=20&go=1">' + U.icon('bolt', 22) + '<span class="t">Recommended 20</span><span class="s">Weighted toward high-mark and weak subjects, plus a few earlier mistakes.</span></a>' +
          '<a class="card qa" href="#/practice?filter=current&n=30&go=1">' + U.icon('spark', 22) + '<span class="t">Current affairs</span><span class="s">30 of the ' + D.pool({ filter: 'current' }).length + ' time-sensitive questions, updated to ' + U.fmtDay(B.meta.currentAffairs) + '.</span></a>' +
          '<a class="card qa" href="#/practice?filter=wrong&n=all&go=1">' + U.icon('review', 22) + '<span class="t">Re-do mistakes</span><span class="s">' + D.pool({ filter: 'wrong' }).length + ' questions you last answered wrong.</span></a>' +
          '<a class="card qa" href="#/mock">' + U.icon('mock', 22) + '<span class="t">Full mock test</span><span class="s">200 questions, 2 hours, negative marking.</span></a>' +
        '</div>' +
        '<div class="card section"><div class="card-h"><h2>Build a practice set</h2></div>' +
          '<div class="field"><span class="field-label">Subjects</span><div class="chips" id="subj-chips">' + subjChips + '</div></div>' +
          topicBlock +
          '<div class="grid cols-2 mt-16">' +
            '<div class="field"><span class="field-label">Questions to include</span>' +
              seg('filter', [['all', 'All'], ['new', 'Not attempted'], ['wrong', 'Got wrong'], ['bookmarked', 'Bookmarked'], ['current', 'Current affairs']], setup.filter) + '</div>' +
            '<div class="field"><span class="field-label">How many</span>' +
              seg('count', [[10, '10'], [20, '20'], [30, '30'], [50, '50'], ['all', 'All']], setup.count) + '</div>' +
          '</div>' +
          '<div class="field mt-16"><span class="field-label">Mode</span>' +
            seg('mode', [['learn', 'Learn: feedback after each answer'], ['test', 'Timed test: 36 s per question, −0.5 per wrong']], setup.mode) + '</div>' +
          '<div class="row wrap mt-24">' +
            '<button type="button" class="btn btn-primary btn-lg" id="start"' + (n ? '' : ' disabled') + '>' + U.icon('play', 18) + 'Start ' + n + ' question' + (n === 1 ? '' : 's') + '</button>' +
            '<span class="muted small">' + pool.length + ' question' + (pool.length === 1 ? '' : 's') + ' match' + (pool.length === 1 ? 'es' : '') + ' this selection' +
            (setup.mode === 'test' && n ? ' · time limit ' + U.fmtDuration(n * SEC_PER_Q) : '') + '</span>' +
          '</div>' +
        '</div>' +
        '<p class="small muted center kbd-hint">Keyboard: <kbd>1</kbd>–<kbd>4</kbd> to answer, <kbd>Enter</kbd> for next, <kbd>B</kbd> to bookmark.</p></div>';

      U.$('#pset', root).addEventListener('click', function (e) {
        var c = e.target.closest('[data-subj]');
        if (c) {
          var id = c.dataset.subj;
          if (!id) setup.subjects = [];
          else if (setup.subjects.indexOf(id) >= 0) setup.subjects = setup.subjects.filter(function (x) { return x !== id; });
          else setup.subjects = setup.subjects.concat(id);
          setup.topics = [];
          return draw();
        }
        var t = e.target.closest('[data-topic]');
        if (t) {
          var tid = t.dataset.topic;
          if (setup.topics.indexOf(tid) >= 0) setup.topics = setup.topics.filter(function (x) { return x !== tid; });
          else setup.topics = setup.topics.concat(tid);
          return draw();
        }
        var b = e.target.closest('[data-seg] button');
        if (b) {
          var g = b.closest('[data-seg]').dataset.seg;
          if (g === 'count') setup.count = b.dataset.v === 'all' ? 'all' : +b.dataset.v;
          else setup[g] = b.dataset.v;
          return draw();
        }
        if (e.target.closest('#start')) startFromSetup(false);
      });
    }
  }

  /* ---------- session ---------- */
  function answeredCount() { return Object.keys(session.mode === 'learn' ? session.revealed : session.answers).length; }

  function questionCard(q, i) {
    var labels = U.optionLabels(q.s);
    var chosen = session.answers[q.id];
    var revealed = session.mode === 'learn' && session.revealed[q.id];
    var subj = B.subjectById[q.s], topic = B.topicById[q.t];
    var hist = S.qStat(q.id);
    var bm = S.isBookmarked(q.id);
    var opts = q.o.map(function (o, k) {
      var cls = 'opt', tag = '';
      if (revealed) {
        if (k === q.a) { cls += ' correct'; tag = U.icon('ok', 15) + '<span class="opt-tag-text">Correct answer</span>'; }
        else if (k === chosen) { cls += ' wrong'; tag = U.icon('bad', 15) + '<span class="opt-tag-text">Your answer</span>'; }
        else cls += ' faded';
      } else if (k === chosen) cls += ' selected';
      return '<button type="button" class="' + cls + '" data-k="' + k + '"' + (revealed ? ' disabled' : '') + ' lang="' + lang(q) + '">' +
        '<span class="opt-key">' + labels[k] + '</span><span class="opt-text">' + esc(o) + '</span>' +
        (tag ? '<span class="opt-tag">' + tag + '</span>' : '') + '</button>';
    }).join('');
    var explain = '';
    if (revealed) {
      var ok = chosen === q.a;
      explain = '<div class="explain ' + (ok ? 'good' : 'bad') + '"><div class="head">' + U.icon(ok ? 'ok' : 'bad', 18) +
        (ok ? 'Correct' : 'Not quite. The answer is ' + labels[q.a] + '.') + '</div>' +
        '<div lang="' + lang(q) + '">' + esc(q.e) + '</div>' +
        (q.asOf ? '<div class="asof">' + U.icon('clock', 13) + ' Time-sensitive fact, correct as of ' + esc(q.asOf) + '. Check for later changes.</div>' : '') +
        '<div class="explain-foot"><a class="report-link" href="' + esc(App.links.reportQuestion(q)) + '" target="_blank" rel="noopener">Report a mistake</a></div></div>';
    }
    return '<div class="card q-card" id="qcard">' +
      '<div class="q-meta"><span class="badge badge-brand">' + esc(subj.en) + '</span><span lang="' + lang(q) + '">' + esc(topic.bn) + '</span>' +
        (q.d ? '<span>· ' + DIFF[q.d] + '</span>' : '') +
        (hist ? '<span>· You have answered this ' + hist.n + '× (' + hist.c + ' correct)</span>' : '') + '</div>' +
      '<div class="q-text" lang="' + lang(q) + '"><span class="muted">' + (i + 1) + '. </span>' + esc(q.q) + '</div>' +
      '<div class="opts" id="opts">' + opts + '</div>' + explain +
      '<div class="q-actions">' +
        '<button type="button" class="btn btn-ghost btn-sm bm-btn' + (bm ? ' on' : '') + '" id="bm" aria-pressed="' + bm + '">' + U.icon('bookmark', 15) + (bm ? 'Bookmarked' : 'Bookmark') + '</button>' +
        '<span class="spacer"></span>' +
        (session.mode === 'test' && i > 0 ? '<button type="button" class="btn btn-ghost" id="prev">' + U.icon('left', 16) + 'Previous</button>' : '') +
        (session.mode === 'test'
          ? (i < session.qids.length - 1 ? '<button type="button" class="btn btn-primary" id="next">Next' + U.icon('right', 16) + '</button>' : '<button type="button" class="btn btn-primary" id="submit">Submit test</button>')
          : (revealed ? (i < session.qids.length - 1 ? '<button type="button" class="btn btn-primary" id="next">Next question' + U.icon('right', 16) + '</button>' : '<button type="button" class="btn btn-primary" id="finish">See results</button>') : '<span class="muted small">Choose an answer</span>')) +
      '</div></div>';
  }

  function sessionTop() {
    var n = session.qids.length, done = answeredCount();
    var right = '', score = '';
    if (session.mode === 'learn') {
      var c = 0, w = 0;
      Object.keys(session.revealed).forEach(function (id) { if (session.answers[id] === D.byId[id].a) c++; else w++; });
      score = '<span class="badge badge-good">' + U.icon('ok', 13) + c + ' correct</span><span class="badge badge-bad">' + U.icon('bad', 13) + w + ' wrong</span>';
    } else {
      right = '<span class="timer" id="timer">' + U.icon('clock', 20) + '<span>' + U.fmtClock(timeLeft()) + '</span></span>';
    }
    return '<div class="quiz-top"><div class="row wrap"><strong>' + esc(session.title) + '</strong><span class="muted small">' +
      (session.mode === 'learn' ? 'Learn mode' : 'Timed test') + ' · ' + done + ' of ' + n + ' answered</span>' + score +
      '<span class="spacer"></span>' + right +
      '<button type="button" class="btn btn-ghost btn-sm" id="end">' + (session.mode === 'test' ? 'Submit' : 'End session') + '</button></div>' +
      UI.meter(session.idx + 1, n) + '</div>';
  }

  function timeLeft() { return session.timeLimit - (Date.now() - session.startedAt) / 1000; }

  function palette() {
    if (session.mode !== 'test') return '';
    return '<div class="card mt-16"><div class="card-h"><h3>Questions</h3><span class="sub">Jump to any question</span></div><div class="palette" id="palette">' +
      session.qids.map(function (id, i) {
        var cls = 'pal' + (session.answers[id] != null ? ' answered' : '') + (i === session.idx ? ' current' : '');
        return '<button type="button" class="' + cls + '" data-i="' + i + '" aria-label="Question ' + (i + 1) + (session.answers[id] != null ? ', answered' : '') + '">' + (i + 1) + '</button>';
      }).join('') + '</div></div>';
  }

  function finish() {
    if (session.finished) return;
    if (session.mode === 'test') {
      session.qids.forEach(function (id) {
        var a = session.answers[id];
        if (a != null) S.recordAnswer(id, a, a === D.byId[id].a);
      });
    }
    session.finished = true;
    session.finishedAt = Date.now();
    App.refresh();
  }

  function renderSession(root) {
    if (!session) { location.replace('#/practice'); return; }
    if (session.finished) return renderSummary(root);
    var timer = null;

    function draw() {
      var q = D.byId[session.qids[session.idx]];
      root.innerHTML = '<div class="quiz-wrap">' + sessionTop() + questionCard(q, session.idx) + palette() +
        '<p class="shortcut-hint kbd-hint"><kbd>1</kbd>–<kbd>4</kbd> answer · <kbd>Enter</kbd> next' + (session.mode === 'test' ? ' · <kbd>←</kbd> previous' : '') + ' · <kbd>B</kbd> bookmark</p></div>';
      bind(q);
    }

    function choose(q, k) {
      if (session.mode === 'learn') {
        if (session.revealed[q.id]) return;
        session.answers[q.id] = k;
        session.revealed[q.id] = true;
        S.recordAnswer(q.id, k, k === q.a);
      } else {
        session.answers[q.id] = k;
      }
      draw();
      if (session.mode === 'learn') {
        var ex = U.$('.explain', root);
        if (ex) {
          var r = ex.getBoundingClientRect();
          if (r.bottom > window.innerHeight) ex.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        var nb = U.$('#next', root) || U.$('#finish', root);
        if (nb) nb.focus({ preventScroll: true });
      }
    }

    function go(i) {
      session.idx = U.clamp(i, 0, session.qids.length - 1);
      draw();
      var card = U.$('#qcard', root);
      if (card && card.getBoundingClientRect().top < 60) card.scrollIntoView({ block: 'start' });
    }

    function bind(q) {
      U.$('#opts', root).addEventListener('click', function (e) {
        var b = e.target.closest('.opt');
        if (b && !b.disabled) choose(q, +b.dataset.k);
      });
      U.$('#bm', root).addEventListener('click', function () {
        var on = S.toggleBookmark(q.id);
        U.toast(on ? 'Bookmarked. Find it under Review.' : 'Bookmark removed.');
        draw();
      });
      var nx = U.$('#next', root); if (nx) nx.addEventListener('click', function () { go(session.idx + 1); });
      var pv = U.$('#prev', root); if (pv) pv.addEventListener('click', function () { go(session.idx - 1); });
      var fin = U.$('#finish', root); if (fin) fin.addEventListener('click', finish);
      var sub = U.$('#submit', root); if (sub) sub.addEventListener('click', confirmSubmit);
      U.$('#end', root).addEventListener('click', confirmSubmit);
      var pal = U.$('#palette', root);
      if (pal) pal.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) go(+b.dataset.i); });
    }

    function confirmSubmit() {
      var left = session.qids.length - answeredCount();
      if (!left) return finish();
      U.confirmBox(session.mode === 'test' ? 'Submit the test?' : 'End this session?',
        left + ' question' + (left === 1 ? ' is' : 's are') + ' still unanswered' + (session.mode === 'test' ? ' and will count as skipped.' : '.'),
        session.mode === 'test' ? 'Submit' : 'End session').then(function (ok) { if (ok) finish(); });
    }

    function onKey(e) {
      if (document.querySelector('.modal-wrap')) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
      var q = D.byId[session.qids[session.idx]];
      var map = { '1': 0, '2': 1, '3': 2, '4': 3 };
      var k = e.key.toLowerCase();
      if (k === 'b') { e.preventDefault(); U.$('#bm', root).click(); return; }
      if (map[k] != null) { e.preventDefault(); choose(q, map[k]); return; }
      if (k === 'enter' || k === 'arrowright') {
        if (e.target.tagName === 'BUTTON' && k === 'enter') return; // let the focused button act
        if (session.mode === 'test' || session.revealed[q.id]) {
          e.preventDefault();
          if (session.idx < session.qids.length - 1) go(session.idx + 1);
          else if (session.mode === 'learn') finish();
        }
      }
      if (k === 'arrowleft' && session.mode === 'test') { e.preventDefault(); go(session.idx - 1); }
    }
    document.addEventListener('keydown', onKey);

    if (session.mode === 'test') {
      timer = setInterval(function () {
        var left = timeLeft();
        var el = U.$('#timer', root);
        if (el) { el.lastChild.textContent = U.fmtClock(left); el.classList.toggle('low', left < 60); }
        if (left <= 0) { clearInterval(timer); U.toast('Time is up. Your test has been submitted.', 'warn'); finish(); }
      }, 1000);
    }
    draw();
    return function () { document.removeEventListener('keydown', onKey); if (timer) clearInterval(timer); };
  }

  /* ---------- summary ---------- */
  function renderSummary(root) {
    var qids = session.qids;
    var res = D.score(qids, session.answers);
    var used = Math.round(((session.finishedAt || Date.now()) - session.startedAt) / 1000);
    var wrongIds = qids.filter(function (id) { var a = session.answers[id]; return a != null && a !== D.byId[id].a; });
    var answered = res.correct + res.wrong;
    var filter = session.reviewFilter;

    var list = qids.filter(function (id) {
      var a = session.answers[id], q = D.byId[id];
      if (filter === 'wrong') return a != null && a !== q.a;
      if (filter === 'skipped') return a == null;
      return true;
    });

    root.innerHTML = '<div class="quiz-wrap stack">' +
      '<div class="card"><div class="result-hero">' +
        '<div><div class="stat-label">' + esc(session.title) + ' · ' + (session.mode === 'test' ? 'timed test' : 'learn mode') + '</div>' +
        (session.mode === 'test'
          ? '<div class="hero-num mt-8">' + U.fmtMarks(res.net) + ' <small>/ ' + res.total + ' marks</small></div>'
          : '<div class="hero-num mt-8">' + U.pct(res.correct, answered || 1) + '% <small>correct</small></div>') + '</div>' +
        '<div class="split">' +
          '<div class="stat"><div class="stat-label">' + U.icon('ok', 15) + 'Correct</div><div class="stat-value ok-text">' + res.correct + '</div></div>' +
          '<div class="stat"><div class="stat-label">' + U.icon('bad', 15) + 'Wrong</div><div class="stat-value bad-text">' + res.wrong + '</div></div>' +
          '<div class="stat"><div class="stat-label">' + U.icon('skip', 15) + 'Skipped</div><div class="stat-value">' + res.skipped + '</div></div>' +
          '<div class="stat"><div class="stat-label">' + U.icon('clock', 15) + 'Time</div><div class="stat-value">' + U.fmtDuration(used) + '</div></div>' +
        '</div></div>' +
        (session.mode === 'test' && res.wrong ? '<p class="verdict mt-16 mb-0">Negative marking cost you <strong>' + U.fmtMarks(res.wrong * B.exam.negative) + ' marks</strong> here. Skipping questions you can\'t narrow down to two options avoids that.</p>' : '') +
        '<div class="row wrap mt-16">' +
          (wrongIds.length ? '<button type="button" class="btn btn-primary" id="retry-wrong">' + U.icon('refresh', 16) + 'Re-do the ' + wrongIds.length + ' wrong</button>' : '') +
          '<a class="btn btn-ghost" href="#/practice">New practice set</a>' +
          '<a class="btn btn-ghost" href="#/">Dashboard</a>' +
        '</div></div>' +
      '<div class="card pad-0"><div class="tabs" style="padding:0 12px;margin:0" id="rtabs">' +
        [['all', 'All', qids.length], ['wrong', 'Wrong', res.wrong], ['skipped', 'Skipped', res.skipped]].map(function (t) {
          return '<button type="button" class="tab' + (filter === t[0] ? ' on' : '') + '" data-f="' + t[0] + '">' + t[1] + '<span class="badge">' + t[2] + '</span></button>';
        }).join('') + '</div>' +
        '<div>' + (list.length ? list.map(function (id) { return reviewItem(D.byId[id], session.answers[id], qids.indexOf(id)); }).join('') : '<div class="empty"><p>Nothing here.</p></div>') + '</div>' +
      '</div></div>';

    var rw = U.$('#retry-wrong', root);
    if (rw) rw.addEventListener('click', function () { start({ qids: wrongIds, mode: 'learn', title: 'Re-do: ' + session.title }); });
    U.$('#rtabs', root).addEventListener('click', function (e) {
      var b = e.target.closest('[data-f]');
      if (!b) return;
      session.reviewFilter = b.dataset.f;
      renderSummary(root);
    });
    App.renderNav();
  }

  /* One answered question with the correct answer and explanation (also used by Review and mock results). */
  function reviewItem(q, chosen, i) {
    var labels = U.optionLabels(q.s);
    var ok = chosen === q.a;
    var status = chosen == null ? '<span class="badge">' + U.icon('skip', 13) + 'Skipped</span>' :
      ok ? '<span class="badge badge-good">' + U.icon('ok', 13) + 'Correct</span>' : '<span class="badge badge-bad">' + U.icon('bad', 13) + 'Wrong</span>';
    return '<div class="pq" style="padding:16px 18px">' +
      '<div class="pq-top"><span class="pq-num">' + (i + 1) + '.</span><div class="pq-text" lang="' + lang(q) + '">' + esc(q.q) + '</div>' + status + '</div>' +
      '<div class="pq-opts" lang="' + lang(q) + '">' + q.o.map(function (o, k) {
        var cls = 'pq-opt' + (k === q.a ? ' correct' : k === chosen ? ' wrong' : '');
        return '<div class="' + cls + '"><span class="bubble">' + labels[k] + '</span><span>' + esc(o) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="explain mt-8"><div lang="' + lang(q) + '">' + esc(q.e) + '</div>' +
      (q.asOf ? '<div class="asof">' + U.icon('clock', 13) + ' Correct as of ' + esc(q.asOf) + '.</div>' : '') +
      '<div class="explain-foot"><a class="report-link" href="' + esc(App.links.reportQuestion(q)) + '" target="_blank" rel="noopener">Report a mistake</a></div></div></div>';
  }

  App.practice = { start: start, smartQids: smartQids, reviewItem: reviewItem };
  App.views.practice = {
    title: function (r) { return r.params[0] === 'session' ? 'Practice session' : 'Practice'; },
    render: function (root, params, query) {
      if (params[0] === 'session') return renderSession(root);
      return renderSetup(root, query);
    }
  };
})();
