/* Study planner: spreads the remaining syllabus over the days left, then a revision phase with full mock tests. */
(function () {
  'use strict';
  var U = App.util, S = App.store, D = App.data, UI = App.ui, B = window.BCS;
  var esc = U.esc;
  var showPast = false;

  /* ---------- plan generation ---------- */
  function generate(opts) {
    var start = opts.start, end = opts.end; // end = exam day (not a study day)
    var days = [];
    for (var d = start; d < end; d = U.addDays(d, 1)) {
      if (opts.studyDays[U.parseDay(d).getDay()]) days.push(d);
    }
    if (!days.length) return null;

    // Remaining topics, interleaved so every subject advances at the same pace.
    var queues = B.subjects.map(function (s) {
      return { s: s, list: s.topics.filter(function (t) { return S.topicStatus(t.id) < 2; }), taken: 0 };
    }).filter(function (q) { return q.list.length; });
    var ordered = [];
    while (queues.some(function (q) { return q.taken < q.list.length; })) {
      var next = queues.filter(function (q) { return q.taken < q.list.length; })
        .sort(function (a, b) { return a.taken / a.list.length - b.taken / b.list.length || b.s.marks - a.s.marks; })[0];
      ordered.push(next.list[next.taken++]);
    }

    var revDays = days.length >= 10 ? U.clamp(Math.round(days.length * 0.2), 3, 30) : Math.min(2, days.length - 1);
    var learnDays = Math.max(1, days.length - revDays);
    var plan = { createdAt: Date.now(), start: start, end: end, studyDays: opts.studyDays, days: [] };

    days.forEach(function (day, i) {
      var tasks = [];
      if (i < learnDays) {
        // Rounding (not flooring) gives day one a topic; spare days fall evenly through the plan.
        var from = Math.round((i * ordered.length) / learnDays), to = Math.round(((i + 1) * ordered.length) / learnDays);
        ordered.slice(from, to).forEach(function (t) { tasks.push({ k: 'topic', id: t.id }); });
        if ((i + 1) % 7 === 0) tasks.push({ k: 'mock', m: 'half' }, { k: 'mistakes' });
      } else {
        var r = i - learnDays;
        if (r % 2 === 0) tasks.push({ k: 'mock', m: 'full' }, { k: 'mistakes' });
        else {
          // Revise two subjects per day, highest marks first, cycling.
          var order = B.subjects.slice().sort(function (a, b) { return b.marks - a.marks; });
          var k = Math.floor(r / 2) * 2;
          tasks.push({ k: 'rev', s: order[k % order.length].id }, { k: 'rev', s: order[(k + 1) % order.length].id });
        }
      }
      if (!tasks.length) tasks.push({ k: 'practice' });
      plan.days.push({ d: day, tasks: tasks, done: tasks.map(function () { return false; }) });
    });
    return plan;
  }

  /* ---------- task helpers (also used by the dashboard) ---------- */
  function taskHtml(t) {
    if (t.k === 'topic') {
      var tp = B.topicById[t.id];
      if (!tp) return 'Topic removed';
      return '<span class="kind">Topic</span><a href="#/notes/' + tp.subject + '/' + tp.id + '">' + UI.topicName(tp) + '</a> <span class="muted">· ' + esc(B.subjectById[tp.subject].en) + ': read the notes, then practise</span>';
    }
    if (t.k === 'mock') return '<span class="kind">Test</span><a href="#/mock">' + (t.m === 'full' ? 'Full model test (200 Qs, 2 h)' : 'Half model test (100 Qs, 1 h)') + '</a>';
    if (t.k === 'mistakes') return '<span class="kind">Review</span><a href="#/review">Re-do this week\'s mistakes</a>';
    if (t.k === 'rev') return '<span class="kind">Revise</span><a href="#/practice?s=' + t.s + '">' + esc(B.subjectById[t.s].en) + '</a> <span class="muted">· weakest topics, notes and flashcards</span>';
    return '<span class="kind">Practice</span><a href="#/practice?mode=smart&n=30&go=1">30 recommended questions</a>';
  }

  function setTask(day, i, done) {
    var plan = S.state.plan;
    if (!plan) return;
    var d = plan.days.filter(function (x) { return x.d === day; })[0];
    if (!d || !d.tasks[i]) return;
    d.done[i] = !!done;
    var t = d.tasks[i];
    if (done && t.k === 'topic' && S.topicStatus(t.id) < 2) S.setTopicStatus(t.id, 2);
    S.save();
  }

  function todayTasks() {
    var plan = S.state.plan;
    if (!plan) return null;
    var today = U.dayKey();
    var d = plan.days.filter(function (x) { return x.d === today; })[0];
    if (!d) return [];
    return d.tasks.map(function (t, i) { return { day: d.d, i: i, done: d.done[i], html: taskHtml(t) }; });
  }

  function progress(plan) {
    var today = U.dayKey(), total = 0, done = 0, overdue = 0;
    plan.days.forEach(function (d) {
      d.tasks.forEach(function (t, i) {
        total++;
        if (d.done[i]) done++;
        else if (d.d < today) overdue++;
      });
    });
    return { total: total, done: done, overdue: overdue };
  }

  /* ---------- view ---------- */
  function setupForm(st, plan) {
    var sd = plan ? plan.studyDays : [true, true, true, true, true, true, true];
    return '<div class="card"><div class="card-h"><h2>' + (plan ? 'Rebuild your plan' : 'Create your study plan') + '</h2></div>' +
      '<div class="grid cols-2">' +
        '<div class="field"><label for="p-exam">Exam date</label><input class="input" type="date" id="p-exam" value="' + esc(st.examDate) + '" min="' + U.addDays(U.dayKey(), 1) + '">' +
          '<span class="hint">Use your best estimate until the circular gives the real date. You can rebuild the plan any time.</span></div>' +
        '<div class="field"><span class="field-label">Study days</span><div class="chips" id="p-days">' +
          U.WEEKDAYS.map(function (w, i) { return '<button type="button" class="chip' + (sd[i] ? ' on' : '') + '" data-d="' + i + '" aria-pressed="' + !!sd[i] + '">' + w + '</button>'; }).join('') +
          '</div><span class="hint">Leave out a day if you take a weekly break.</span></div>' +
      '</div>' +
      '<p class="small dim mt-16">The plan covers every topic you have not marked <strong>Done</strong>. About 80% of the days are for learning, with a half mock each week; the last 20% are for full mocks and revision.</p>' +
      '<button type="button" class="btn btn-primary" id="p-make">' + U.icon('planner', 16) + (plan ? 'Rebuild from today' : 'Create plan') + '</button></div>';
  }

  function render(root) {
    var st = S.settings;
    var plan = S.state.plan;
    var today = U.dayKey();
    var html = '';

    if (!plan) {
      html += '<div class="grid cols-2"><div>' + setupForm(st, null) + '</div>' +
        '<div class="card prose"><h2>How the plan works</h2><ul>' +
        '<li>Subjects are interleaved, so each day mixes different subjects and every subject finishes at about the same time.</li>' +
        '<li>Ticking off a topic marks it <strong>Done</strong> in your syllabus.</li>' +
        '<li>Fell behind? Press <em>Rebuild from today</em> and the remaining topics are spread over the days you have left.</li>' +
        '<li>Today\'s tasks also appear on the dashboard.</li></ul></div></div>';
    } else {
      var pr = progress(plan);
      var left = U.daysBetween(today, plan.end);
      html += '<div class="card section"><div class="row wrap">' +
        '<div style="flex:1;min-width:240px"><div class="stat-label">' + U.icon('planner', 16) + 'Plan to ' + U.fmtDay(plan.end, true) + '</div>' +
        '<div class="stat-value">' + U.pct(pr.done, pr.total) + '%<small> · ' + pr.done + ' of ' + pr.total + ' tasks done</small></div>' +
        '<div class="stat-sub">' + (left >= 0 ? left + ' days to the exam' : 'Exam date passed') + (pr.overdue ? ' · <span class="bad-text strong">' + pr.overdue + ' overdue task' + (pr.overdue > 1 ? 's' : '') + '</span>' : ' · on track') + '</div></div>' +
        '<button type="button" class="btn btn-ghost" id="p-rebuild">' + U.icon('refresh', 16) + 'Rebuild from today</button>' +
        '<button type="button" class="btn btn-ghost" id="p-delete">' + U.icon('trash', 16) + 'Delete plan</button>' +
        '</div><div class="mt-16">' + UI.meter(pr.done, pr.total, 'thick') + '</div>' +
        (pr.overdue > 3 ? '<div class="mt-16">' + UI.callout('You are ' + pr.overdue + ' tasks behind. Rebuilding spreads what is left over the remaining days, which beats trying to catch up all at once.', 'warn') + '</div>' : '') +
        '</div>';
      html += '<div id="p-form-wrap" hidden class="section">' + setupForm(st, plan) + '</div>';

      // Group days by week.
      var weeks = [], cur = null;
      plan.days.forEach(function (d) {
        if (!showPast && d.d < today && d.done.every(Boolean)) return;
        var wk = U.addDays(d.d, -U.parseDay(d.d).getDay());
        if (!cur || cur.wk !== wk) weeks.push(cur = { wk: wk, days: [] });
        cur.days.push(d);
      });
      html += '<div class="row between section mb-8"><h2 style="font-size:17px">Schedule</h2>' +
        '<label class="check small"><input type="checkbox" id="p-past"' + (showPast ? ' checked' : '') + '> Show completed past days</label></div>';
      html += weeks.map(function (w) {
        return '<div class="plan-week"><h3>Week of ' + U.fmtDay(w.wk) + '</h3><div class="card pad-0">' + w.days.map(function (d) {
          return '<div class="plan-day' + (d.d === today ? ' today' : d.d < today ? ' past' : '') + '" id="day-' + d.d + '">' +
            '<div class="d">' + (d.d === today ? 'Today' : U.WEEKDAYS[U.parseDay(d.d).getDay()]) + '<small>' + U.fmtDay(d.d) + '</small></div>' +
            '<div class="tasks">' + d.tasks.map(function (t, i) {
              return '<label class="task' + (d.done[i] ? ' done' : '') + '"><input type="checkbox" data-day="' + d.d + '" data-i="' + i + '"' + (d.done[i] ? ' checked' : '') + '><span class="task-text">' + taskHtml(t) + '</span></label>';
            }).join('') + '</div></div>';
        }).join('') + '</div></div>';
      }).join('') || UI.empty('All caught up', 'Every past day is complete. Tick "Show completed past days" to see them.');
    }
    root.innerHTML = '<div class="stack">' + html + '</div>';

    // events
    var daysEl = U.$('#p-days', root);
    if (daysEl) daysEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-d]');
      if (!b) return;
      b.classList.toggle('on');
      b.setAttribute('aria-pressed', b.classList.contains('on'));
    });
    var make = U.$('#p-make', root);
    if (make) make.addEventListener('click', function () {
      var exam = U.$('#p-exam', root).value;
      if (!exam || exam <= today) { U.toast('Pick an exam date after today.', 'warn'); return; }
      var sd = U.$$('#p-days [data-d]', root).map(function (b) { return b.classList.contains('on'); });
      if (!sd.some(Boolean)) { U.toast('Choose at least one study day.', 'warn'); return; }
      st.examDate = exam;
      var p = generate({ start: today, end: exam, studyDays: sd });
      if (!p) { U.toast('There are no study days before that date.', 'warn'); return; }
      S.state.plan = p;
      S.save();
      U.toast('Plan created: ' + p.days.length + ' study days.');
      App.refresh();
    });
    var rb = U.$('#p-rebuild', root);
    if (rb) rb.addEventListener('click', function () {
      var w = U.$('#p-form-wrap', root);
      w.hidden = !w.hidden;
      if (!w.hidden) w.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    var del = U.$('#p-delete', root);
    if (del) del.addEventListener('click', function () {
      U.confirmBox('Delete the study plan?', 'Your syllabus progress stays. Only the schedule is removed.', 'Delete', true).then(function (ok) {
        if (ok) { S.state.plan = null; S.save(); App.refresh(); }
      });
    });
    var past = U.$('#p-past', root);
    if (past) past.addEventListener('change', function (e) { showPast = e.target.checked; App.refresh(); });
    root.addEventListener('change', onCheck);
    function onCheck(e) {
      var cb = e.target;
      if (!cb.dataset || !cb.dataset.day) return;
      setTask(cb.dataset.day, +cb.dataset.i, cb.checked);
      cb.closest('.task').classList.toggle('done', cb.checked);
    }
    return function () { root.removeEventListener('change', onCheck); };
  }

  App.planner = { todayTasks: todayTasks, setTask: setTask, generate: generate };
  App.views.planner = { title: 'Study planner', render: render };
})();
