/* Mock tests: exam-style paper with a timer and OMR grid, saved continuously so a reload doesn't lose progress. */
(function () {
  'use strict';
  var U = App.util, S = App.store, D = App.data, UI = App.ui, B = window.BCS;
  var esc = U.esc;
  var SEC_PER_Q = 36;

  function lang(q) { return q.s === 'english' ? 'en' : 'bn'; }
  function timeLeft(m) { return m.durationSec - (Date.now() - m.startedAt) / 1000; }

  /* ---------- start / finish ---------- */
  function startMock(kind, subjectId) {
    if (S.state.activeMock) { U.toast('Finish or abandon the test in progress first.', 'warn'); return; }
    var built = D.buildMock(kind, subjectId);
    if (!built.qids.length) { U.toast('The question bank has no questions for this test yet.', 'bad'); return; }
    var type = D.MOCK_TYPES[kind];
    var title = kind === 'subject' ? 'Subject test: ' + B.subjectById[subjectId].en : type.title;
    S.state.activeMock = {
      id: U.uid(), kind: kind, subject: subjectId || null, title: title,
      qids: built.qids, answers: {}, flags: {},
      startedAt: Date.now(), durationSec: built.qids.length * SEC_PER_Q,
      lock: !!S.settings.lockAnswers
    };
    S.saveNow();
    if (built.shortfall) U.toast('The bank is short of ' + built.shortfall + ' questions for this test, so it has ' + built.qids.length + '.', 'warn');
    App.go('#/mock/run');
  }

  function finishMock() {
    var m = S.state.activeMock;
    if (!m) return;
    var res = D.score(m.qids, m.answers);
    m.qids.forEach(function (id) {
      var a = m.answers[id];
      if (a != null && D.byId[id]) S.recordAnswer(id, a, a === D.byId[id].a);
    });
    var now = Date.now();
    S.state.mocks.push({
      id: m.id, kind: m.kind, subject: m.subject, title: m.title, qids: m.qids, answers: m.answers, flags: m.flags,
      startedAt: m.startedAt, finishedAt: now, durationSec: m.durationSec,
      usedSec: Math.min(m.durationSec, Math.round((now - m.startedAt) / 1000)), lock: m.lock,
      score: { correct: res.correct, wrong: res.wrong, skipped: res.skipped, total: res.total, net: res.net },
      bySubject: res.bySubject
    });
    S.state.activeMock = null;
    S.logMock();
    S.saveNow();
    location.replace('#/mock/result/' + m.id);
  }

  /* ---------- setup + history ---------- */
  function renderHome(root) {
    var am = S.state.activeMock;
    if (am && timeLeft(am) <= 0) { finishMock(); return; }
    var plan = D.subjectPlan('full');
    var subjOpts = B.subjects.map(function (s) {
      return '<option value="' + s.id + '">' + esc(s.en) + ' (' + s.marks + ' Qs · ' + Math.round(s.marks * SEC_PER_Q / 60) + ' min)</option>';
    }).join('');

    var html = '';
    if (am) {
      var answered = Object.keys(am.answers).length;
      html += '<div class="card highlight section"><div class="row wrap">' +
        '<div style="flex:1;min-width:220px"><div class="stat-label">' + U.icon('clock', 16) + 'Test in progress</div>' +
        '<div class="stat-value" style="font-size:22px">' + esc(am.title) + '</div>' +
        '<div class="stat-sub">' + answered + ' of ' + am.qids.length + ' answered · ' + U.fmtClock(timeLeft(am)) + ' left. The clock keeps running while you are away.</div></div>' +
        '<a class="btn btn-primary" href="#/mock/run">' + U.icon('play', 16) + 'Resume</a>' +
        '<button type="button" class="btn btn-ghost" id="submit-active">Submit now</button>' +
        '<button type="button" class="btn btn-ghost" id="abandon">Abandon</button></div></div>';
    }

    html += '<div class="grid cols-2 section">' + ['full', 'half', 'quick'].map(function (k) {
      var t = D.MOCK_TYPES[k];
      return '<div class="card' + (k === 'full' ? ' highlight' : '') + '"><div class="card-h"><h2>' + t.title + '</h2><span class="badge">' + t.n + ' Qs · ' + t.min + ' min</span></div>' +
        '<p class="dim small">' + t.blurb + '</p>' +
        '<button type="button" class="btn ' + (k === 'full' ? 'btn-primary' : 'btn-ghost') + '" data-start="' + k + '"' + (am ? ' disabled' : '') + '>' + U.icon('play', 16) + 'Start</button></div>';
    }).join('') +
      '<div class="card"><div class="card-h"><h2>Subject test</h2><span class="badge">exam size</span></div>' +
        '<p class="dim small">' + D.MOCK_TYPES.subject.blurb + '</p>' +
        '<div class="row wrap"><select class="select" id="subj-select" style="flex:1 1 100%">' + subjOpts + '</select>' +
        '<button type="button" class="btn btn-ghost" data-start="subject"' + (am ? ' disabled' : '') + '>' + U.icon('play', 16) + 'Start</button></div></div>' +
    '</div>';

    html += '<div class="card section"><div class="row wrap between">' +
      '<label class="check"><input type="checkbox" id="lock"' + (S.settings.lockAnswers ? ' checked' : '') + '>' +
      '<span><strong>Lock answers once marked</strong><br><span class="small muted">Like a real OMR sheet: no changing an answer. Good practice for the final weeks.</span></span></label>' +
      '<span class="small muted">Scoring: +1 correct, −' + B.exam.negative + ' wrong, 0 skipped. Questions you haven\'t seen are used first.</span></div></div>';

    html += '<div class="section"><div class="section-h"><div><h2>Full test layout</h2><p>Questions per subject in a 200-question model test, following the 50th BCS marks.</p></div></div>' +
      '<div class="card pad-0"><div class="table-wrap"><table class="table"><thead><tr><th>Subject</th><th class="num">Questions</th><th class="num">In your bank</th></tr></thead><tbody>' +
      B.subjects.map(function (s) {
        var have = D.bySubject[s.id].length;
        return '<tr><td>' + UI.subjectName(s) + ' <span class="muted small hide-sm">· ' + esc(s.en) + '</span></td><td class="num">' + plan[s.id] + '</td><td class="num' + (have < plan[s.id] ? ' bad-text' : '') + '">' + have + '</td></tr>';
      }).join('') + '</tbody></table></div></div></div>';

    var mocks = S.state.mocks.slice().reverse();
    html += '<div class="section"><div class="section-h"><div><h2>Your results</h2><p>' + (mocks.length ? mocks.length + ' test' + (mocks.length > 1 ? 's' : '') + ' taken. The score trend chart is on the dashboard.' : 'Finished tests will appear here.') + '</p></div></div>' +
      (mocks.length ? '<div class="card pad-0"><div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Test</th><th class="num">Score</th><th class="num">%</th><th class="num hide-sm">Correct</th><th class="num hide-sm">Wrong</th><th class="num hide-sm">Skipped</th><th class="num hide-sm">Time</th><th></th></tr></thead><tbody>' +
        mocks.map(function (m) {
          var sc = m.score;
          return '<tr><td class="nowrap">' + U.fmtDateTime(m.finishedAt) + '</td><td>' + esc(m.title) + (m.lock ? ' <span class="badge" title="Answers were locked">' + U.icon('lock', 12) + '</span>' : '') + '</td>' +
            '<td class="num strong">' + U.fmtMarks(sc.net) + ' / ' + sc.total + '</td><td class="num">' + Math.round(Math.max(0, sc.net) / sc.total * 100) + '%</td>' +
            '<td class="num hide-sm">' + sc.correct + '</td><td class="num hide-sm">' + sc.wrong + '</td><td class="num hide-sm">' + sc.skipped + '</td><td class="num hide-sm">' + U.fmtDuration(m.usedSec) + '</td>' +
            '<td class="nowrap"><a class="btn btn-ghost btn-sm" href="#/mock/result/' + m.id + '">Review</a> <button type="button" class="icon-btn" style="width:32px;height:32px" data-del="' + m.id + '" aria-label="Delete this result">' + U.icon('trash', 15) + '</button></td></tr>';
        }).join('') + '</tbody></table></div></div>' : UI.empty('No tests yet', 'Your first full model test gives you a baseline. Don\'t wait until you feel ready.')) + '</div>';

    root.innerHTML = html;

    root.querySelectorAll('[data-start]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.start;
        startMock(k, k === 'subject' ? U.$('#subj-select', root).value : null);
      });
    });
    U.$('#lock', root).addEventListener('change', function (e) { S.settings.lockAnswers = e.target.checked; S.save(); });
    var ab = U.$('#abandon', root);
    if (ab) ab.addEventListener('click', function () {
      U.confirmBox('Abandon this test?', 'Your answers in this test will be discarded and nothing will be scored.', 'Abandon', true).then(function (ok) {
        if (!ok) return;
        S.state.activeMock = null; S.saveNow(); App.refresh();
      });
    });
    var sa = U.$('#submit-active', root);
    if (sa) sa.addEventListener('click', function () {
      U.confirmBox('Submit the test now?', 'Unanswered questions will count as skipped.', 'Submit').then(function (ok) { if (ok) finishMock(); });
    });
    root.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        U.confirmBox('Delete this result?', 'It will be removed from your history and the score chart. Your per-question practice stats stay.', 'Delete', true).then(function (ok) {
          if (!ok) return;
          S.state.mocks = S.state.mocks.filter(function (m) { return m.id !== b.dataset.del; });
          S.saveNow(); App.refresh();
        });
      });
    });
  }

  /* ---------- the exam ---------- */
  function renderRun(root) {
    var m = S.state.activeMock;
    if (!m) { location.replace('#/mock'); return; }
    if (timeLeft(m) <= 0) { U.toast('Time ran out while you were away. The test has been submitted.', 'warn'); finishMock(); return; }

    // Group question numbers by subject, in paper order.
    var sections = [];
    m.qids.forEach(function (id, i) {
      var q = D.byId[id];
      if (!q) return;
      var last = sections[sections.length - 1];
      if (!last || last.s !== q.s) sections.push(last = { s: q.s, items: [] });
      last.items.push({ q: q, i: i });
    });

    var paper = sections.map(function (sec) {
      var s = B.subjectById[sec.s];
      return '<section class="paper-sec"><div class="paper-sec-h"><h3>' + UI.subjectName(s) + '</h3><span class="muted small">' + esc(s.en) + ' · ' + sec.items.length + ' questions</span></div>' +
        sec.items.map(function (it) {
          var q = it.q, labels = U.optionLabels(q.s), a = m.answers[q.id];
          return '<div class="pq" id="pq-' + it.i + '" data-q="' + q.id + '" data-i="' + it.i + '">' +
            '<div class="pq-top"><span class="pq-num">' + (it.i + 1) + '.</span><div class="pq-text" lang="' + lang(q) + '">' + esc(q.q) + '</div>' +
            '<button type="button" class="pq-flag' + (m.flags[q.id] ? ' on' : '') + '" data-flag aria-pressed="' + !!m.flags[q.id] + '" title="Mark to revisit" aria-label="Mark question ' + (it.i + 1) + ' to revisit">' + U.icon('flag', 17) + '</button></div>' +
            '<div class="pq-opts" lang="' + lang(q) + '">' + q.o.map(function (o, k) {
              return '<button type="button" class="pq-opt' + (a === k ? ' on' : '') + '" data-k="' + k + '" aria-pressed="' + (a === k) + '"><span class="bubble">' + labels[k] + '</span><span>' + esc(o) + '</span></button>';
            }).join('') + '</div></div>';
        }).join('') + '</section>';
    }).join('');

    var omr = sections.map(function (sec) {
      return '<div class="sec-label">' + esc(B.subjectById[sec.s].en) + '</div><div class="palette">' + sec.items.map(function (it) {
        var id = it.q.id;
        return '<button type="button" class="pal' + (m.answers[id] != null ? ' answered' : '') + (m.flags[id] ? ' flagged' : '') + '" data-jump="' + it.i + '" id="pal-' + it.i + '">' + (it.i + 1) + '</button>';
      }).join('') + '</div>';
    }).join('');

    root.innerHTML =
      '<div class="exam-bar">' +
        '<strong class="exam-title">' + esc(m.title) + '</strong>' + (m.lock ? '<span class="badge lock-badge">' + U.icon('lock', 12) + 'Answers lock</span>' : '') +
        '<span class="muted small" id="answered-count"></span>' +
        '<span class="spacer"></span>' +
        '<span class="timer" id="timer">' + U.icon('clock', 20) + '<span>' + U.fmtClock(timeLeft(m)) + '</span></span>' +
        '<button type="button" class="btn btn-ghost omr-toggle" id="omr-toggle" aria-controls="omr" aria-expanded="false" title="Answer sheet">' + U.icon('grid', 17) + '<span id="omr-count"></span><span class="sr-only"> answered. Open the answer sheet</span></button>' +
        '<button type="button" class="btn btn-primary" id="submit">Submit</button>' +
      '</div>' +
      '<div class="exam-layout"><div class="card paper">' + paper + '</div>' +
      '<div class="omr-scrim" id="omr-scrim"></div>' +
      '<aside class="card omr" id="omr" aria-label="Answer sheet"><div class="card-h"><h3>Answer sheet</h3>' +
        '<button type="button" class="icon-btn omr-close" id="omr-close" aria-label="Close the answer sheet">' + U.icon('x', 18) + '</button></div>' + omr +
        '<div class="legend-row"><span><i class="answered"></i>Answered</span><span><i></i>Not answered</span><span><i class="flagged"></i>Marked to revisit</span></div></aside></div>';

    function updateCounts() {
      var n = Object.keys(m.answers).length, f = Object.keys(m.flags).length;
      U.$('#answered-count', root).textContent = n + ' of ' + m.qids.length + ' answered' + (f ? ' · ' + f + ' marked' : '');
      U.$('#omr-count', root).textContent = n + '/' + m.qids.length;
    }
    updateCounts();

    // On narrow screens the answer sheet is a bottom sheet.
    var omrEl = U.$('#omr', root), omrScrim = U.$('#omr-scrim', root), omrBtn = U.$('#omr-toggle', root);
    function setSheet(open) {
      omrEl.classList.toggle('open', open);
      omrScrim.classList.toggle('open', open);
      omrBtn.setAttribute('aria-expanded', open);
      if (open) { var cur = U.$('.pal:not(.answered)', omrEl); (cur || U.$('#omr-close', root)).focus({ preventScroll: true }); }
    }
    omrBtn.addEventListener('click', function () { setSheet(!omrEl.classList.contains('open')); });
    U.$('#omr-close', root).addEventListener('click', function () { setSheet(false); omrBtn.focus({ preventScroll: true }); });
    omrScrim.addEventListener('click', function () { setSheet(false); });
    function onSheetKey(e) { if (e.key === 'Escape' && omrEl.classList.contains('open')) { setSheet(false); omrBtn.focus({ preventScroll: true }); } }
    document.addEventListener('keydown', onSheetKey);

    var paperEl = U.$('.paper', root);
    paperEl.addEventListener('click', function (e) {
      var pq = e.target.closest('.pq');
      if (!pq) return;
      var id = pq.dataset.q, i = +pq.dataset.i;
      if (e.target.closest('[data-flag]')) {
        if (m.flags[id]) delete m.flags[id]; else m.flags[id] = 1;
        var fb = U.$('[data-flag]', pq);
        fb.classList.toggle('on', !!m.flags[id]);
        fb.setAttribute('aria-pressed', !!m.flags[id]);
        U.$('#pal-' + i, root).classList.toggle('flagged', !!m.flags[id]);
        S.save(); updateCounts();
        return;
      }
      var opt = e.target.closest('.pq-opt');
      if (!opt) return;
      var k = +opt.dataset.k;
      var cur = m.answers[id];
      if (m.lock && cur != null) { U.toast('Answers are locked in this test, like an OMR sheet.', 'warn'); return; }
      if (cur === k) delete m.answers[id]; else m.answers[id] = k; // clicking the marked option again clears it
      U.$$('.pq-opt', pq).forEach(function (b) {
        var on = m.answers[id] === +b.dataset.k;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on);
      });
      U.$('#pal-' + i, root).classList.toggle('answered', m.answers[id] != null);
      S.save(); updateCounts();
    });
    U.$('.omr', root).addEventListener('click', function (e) {
      var b = e.target.closest('[data-jump]');
      if (!b) return;
      if (omrEl.classList.contains('open')) setSheet(false);
      var el = U.$('#pq-' + b.dataset.jump, root);
      el.scrollIntoView({ block: 'start', behavior: 'smooth' });
      var first = U.$('.pq-opt', el);
      if (first) first.focus({ preventScroll: true });
    });
    U.$('#submit', root).addEventListener('click', function () {
      var left = m.qids.length - Object.keys(m.answers).length;
      var flagged = Object.keys(m.flags).length;
      U.confirmBox('Submit your test?', (left ? left + ' unanswered question' + (left > 1 ? 's' : '') + ' will count as skipped. ' : 'All questions answered. ') +
        (flagged ? flagged + ' question' + (flagged > 1 ? 's are' : ' is') + ' marked to revisit. ' : '') + 'Time left: ' + U.fmtClock(timeLeft(m)) + '.', 'Submit').then(function (ok) {
        if (ok) finishMock();
      });
    });

    var warned = {};
    var timer = setInterval(function () {
      var left = timeLeft(m);
      var el = U.$('#timer', root);
      if (el) { el.lastChild.textContent = U.fmtClock(left); el.classList.toggle('low', left < 300); }
      [30, 10, 5, 1].forEach(function (min) {
        if (left <= min * 60 && left > min * 60 - 2 && !warned[min] && m.durationSec > min * 60 * 2) {
          warned[min] = 1;
          U.toast(min + ' minute' + (min > 1 ? 's' : '') + ' left.', 'warn');
        }
      });
      if (left <= 0) {
        clearInterval(timer);
        U.toast('Time is up. Your test has been submitted.', 'warn');
        finishMock();
      }
    }, 1000);
    return function () { clearInterval(timer); document.removeEventListener('keydown', onSheetKey); S.saveNow(); };
  }

  /* ---------- result ---------- */
  function renderResult(root, id, query) {
    var m = S.state.mocks.filter(function (x) { return x.id === id; })[0];
    if (!m) { root.innerHTML = UI.empty('Result not found', 'It may have been deleted.', '<a class="btn btn-primary" href="#/mock">Mock tests</a>'); return; }
    var sc = m.score, neg = B.exam.negative;
    var pctNet = Math.max(0, sc.net) / sc.total * 100;
    var target = S.settings.targetPct;
    var targetMarks = sc.total * target / 100;
    var attempted = sc.correct + sc.wrong;
    var filter = query.f || 'all';
    var subjFilter = query.s || '';

    var rows = B.subjects.filter(function (s) { return m.bySubject[s.id]; }).map(function (s) {
      var b = m.bySubject[s.id];
      var p = Math.max(0, b.net) / b.total * 100;
      return { s: s, b: b, p: p };
    });
    var weakest = rows.slice().sort(function (a, b) { return a.p - b.p; })[0];
    var strongest = rows.slice().sort(function (a, b) { return b.p - a.p; })[0];

    var list = m.qids.filter(function (qid) {
      var q = D.byId[qid];
      if (!q) return false;
      if (subjFilter && q.s !== subjFilter) return false;
      var a = m.answers[qid];
      if (filter === 'wrong') return a != null && a !== q.a;
      if (filter === 'skipped') return a == null;
      if (filter === 'flagged') return !!(m.flags && m.flags[qid]);
      return true;
    });
    var wrongIds = m.qids.filter(function (qid) { var a = m.answers[qid]; return a != null && D.byId[qid] && a !== D.byId[qid].a; });

    var verdict = [];
    if (rows.length > 1 && strongest.p > weakest.p) verdict.push('Strongest: <strong>' + esc(strongest.s.en) + '</strong> (' + Math.round(strongest.p) + '%). Weakest: <strong>' + esc(weakest.s.en) + '</strong> (' + Math.round(weakest.p) + '%).');
    if (sc.wrong) verdict.push('Negative marking cost you <strong>' + U.fmtMarks(sc.wrong * neg) + ' marks</strong>.');
    if (attempted) verdict.push('Accuracy on attempted questions: <strong>' + U.pct(sc.correct, attempted) + '%</strong>' + (U.pct(sc.correct, attempted) < 67 && sc.wrong > 5 ? '. Below about 67%, guessing is hurting more than helping, so skip more of the questions you can\'t narrow down.' : '.'));

    root.innerHTML = '<div class="stack">' +
      '<div class="card"><div class="result-hero">' +
        '<div><div class="stat-label">' + esc(m.title) + ' · ' + U.fmtDateTime(m.finishedAt) + '</div>' +
        '<div class="hero-num mt-8">' + U.fmtMarks(sc.net) + ' <small>/ ' + sc.total + '</small></div>' +
        '<div class="stat-sub mt-8">' + Math.round(pctNet) + '% · target ' + target + '% (' + U.fmtMarks(targetMarks) + ' marks): ' +
          (sc.net >= targetMarks ? '<span class="ok-text strong">' + U.icon('ok', 14) + ' reached, ' + U.fmtMarks(sc.net - targetMarks) + ' above</span>' : '<span class="bad-text strong">' + U.fmtMarks(targetMarks - sc.net) + ' marks short</span>') + '</div></div>' +
        '<div class="split">' +
          '<div class="stat"><div class="stat-label">' + U.icon('ok', 15) + 'Correct</div><div class="stat-value ok-text">' + sc.correct + '</div></div>' +
          '<div class="stat"><div class="stat-label">' + U.icon('bad', 15) + 'Wrong</div><div class="stat-value bad-text">' + sc.wrong + '</div></div>' +
          '<div class="stat"><div class="stat-label">' + U.icon('skip', 15) + 'Skipped</div><div class="stat-value">' + sc.skipped + '</div></div>' +
          '<div class="stat"><div class="stat-label">' + U.icon('clock', 15) + 'Time used</div><div class="stat-value">' + U.fmtDuration(m.usedSec) + '</div><div class="stat-sub">of ' + U.fmtDuration(m.durationSec) + '</div></div>' +
        '</div></div>' +
        '<p class="verdict mt-16">' + verdict.join(' ') + '</p>' +
        '<div class="row wrap">' +
          (wrongIds.length ? '<button type="button" class="btn btn-primary" id="redo">' + U.icon('refresh', 16) + 'Re-do the ' + wrongIds.length + ' wrong in Learn mode</button>' : '') +
          (weakest ? '<a class="btn btn-ghost" href="#/practice?s=' + weakest.s.id + '">Practise ' + esc(weakest.s.en) + '</a>' : '') +
          '<a class="btn btn-ghost" href="#/mock">Mock tests</a>' +
        '</div></div>' +

      '<div class="card pad-0"><div class="card-h" style="padding:18px 18px 0"><h2>By subject</h2><span class="sub">Net marks after −' + neg + ' per wrong answer</span></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Subject</th><th class="num hide-sm">Qs</th><th class="num">Correct</th><th class="num">Wrong</th><th class="num hide-sm">Skipped</th><th class="num">Net</th><th class="netcol">Net %</th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr><td>' + UI.subjectName(r.s) + '<div class="tiny muted hide-sm">' + esc(r.s.en) + '</div></td><td class="num hide-sm">' + r.b.total + '</td><td class="num">' + r.b.correct + '</td><td class="num">' + r.b.wrong + '</td><td class="num hide-sm">' + r.b.skipped + '</td>' +
            '<td class="num strong">' + U.fmtMarks(r.b.net) + '</td><td><div class="meter-row"><div class="net-bar"><span style="--v:' + r.p.toFixed(1) + '%"></span></div><span class="val">' + Math.round(r.p) + '%</span></div></td></tr>';
        }).join('') +
        '</tbody><tfoot><tr><td>Total</td><td class="num hide-sm">' + sc.total + '</td><td class="num">' + sc.correct + '</td><td class="num">' + sc.wrong + '</td><td class="num hide-sm">' + sc.skipped + '</td><td class="num">' + U.fmtMarks(sc.net) + '</td><td>' + Math.round(pctNet) + '%</td></tr></tfoot></table></div></div>' +

      '<div class="card pad-0"><div class="card-h" style="padding:18px 18px 0"><h2>Answers</h2>' +
        '<div class="actions"><select class="select" id="subj-filter" style="height:34px;width:auto"><option value="">All subjects</option>' +
        rows.map(function (r) { return '<option value="' + r.s.id + '"' + (subjFilter === r.s.id ? ' selected' : '') + '>' + esc(r.s.en) + '</option>'; }).join('') + '</select></div></div>' +
        '<div class="tabs" style="padding:0 12px;margin:8px 0 0" id="ftabs">' +
          [['all', 'All'], ['wrong', 'Wrong'], ['skipped', 'Skipped'], ['flagged', 'Marked']].map(function (t) {
            return '<button type="button" class="tab' + (filter === t[0] ? ' on' : '') + '" data-f="' + t[0] + '">' + t[1] + '</button>';
          }).join('') + '</div>' +
        '<div>' + (list.length ? list.map(function (qid) { return App.practice.reviewItem(D.byId[qid], m.answers[qid], m.qids.indexOf(qid)); }).join('') : '<div class="empty"><p>No questions in this view.</p></div>') + '</div>' +
      '</div></div>';

    var redo = U.$('#redo', root);
    if (redo) redo.addEventListener('click', function () { App.practice.start({ qids: wrongIds, mode: 'learn', title: 'Mistakes from ' + m.title }); });
    function setQuery(f, s) {
      location.replace('#/mock/result/' + m.id + '?keepScroll=1' + (f && f !== 'all' ? '&f=' + f : '') + (s ? '&s=' + s : ''));
    }
    U.$('#ftabs', root).addEventListener('click', function (e) {
      var b = e.target.closest('[data-f]');
      if (b) setQuery(b.dataset.f, subjFilter);
    });
    U.$('#subj-filter', root).addEventListener('change', function (e) { setQuery(filter, e.target.value); });
  }

  App.mock = { start: startMock, finish: finishMock };
  App.views.mock = {
    title: function (r) { return r.params[0] === 'run' ? 'Mock test' : r.params[0] === 'result' ? 'Test result' : 'Mock tests'; },
    render: function (root, params, query) {
      if (params[0] === 'run') return renderRun(root);
      if (params[0] === 'result') return renderResult(root, params[1], query);
      return renderHome(root);
    }
  };
})();
