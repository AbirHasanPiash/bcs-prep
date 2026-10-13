/* Dashboard: where you stand today and what to do next. */
(function () {
  'use strict';
  var U = App.util, S = App.store, D = App.data, UI = App.ui, B = window.BCS;
  var esc = U.esc;

  function greeting() {
    var h = new Date().getHours();
    var part = h < 5 ? 'Good evening' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    return part + (S.settings.name ? ', ' + S.settings.name : '');
  }

  function last7Accuracy() {
    var q = 0, c = 0;
    for (var i = 0; i < 7; i++) {
      var d = S.state.activity[U.addDays(U.dayKey(), -i)];
      if (d) { q += d.q || 0; c += d.c || 0; }
    }
    return q ? { pct: U.pct(c, q), q: q } : null;
  }

  function bestStreak() {
    var days = Object.keys(S.state.activity).filter(function (k) {
      var d = S.state.activity[k];
      return d && (d.q || d.f || d.n || d.m);
    }).sort();
    var best = 0, run = 0, prev = null;
    days.forEach(function (k) {
      run = prev && U.daysBetween(prev, k) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = k;
    });
    return best;
  }

  function countdownCard() {
    var st = S.settings;
    if (st.examDate) {
      var left = U.daysBetween(U.dayKey(), st.examDate);
      var prog = D.syllabusProgress();
      var remaining = prog.total - prog.done;
      var weeks = Math.max(1, left / 7);
      var pace = left > 0 && remaining > 0 ? '<div class="stat-sub mt-8">' + remaining + ' topics left · about ' + Math.ceil(remaining / weeks) + ' a week to finish on time</div>' : '';
      return '<div class="card countdown-card">' +
        '<div class="stat-label">' + U.icon('planner', 16) + esc(st.examLabel || 'Exam') + '</div>' +
        '<div class="hero-num mt-8">' + (left >= 0 ? left : 0) + ' <small>' + (left === 1 ? 'day' : 'days') + ' left</small></div>' +
        '<div class="stat-sub mt-8">' + (left >= 0 ? 'Exam on ' + U.fmtDay(st.examDate, true) : 'The date you set has passed. Update it in Settings.') + '</div>' + pace +
        '</div>';
    }
    return '<div class="card countdown-card">' +
      '<div class="stat-label">' + U.icon('planner', 16) + 'Exam date not set</div>' +
      '<p class="small dim mt-8">PSC expects to publish the next general BCS circular around November 2026. The 50th BCS prelim came about 9 weeks after its circular.</p>' +
      '<a class="btn btn-soft btn-sm" href="#/settings">Set a target date</a></div>';
  }

  function subjectRows() {
    var head = '<div class="subject-row head"><div>Subject</div><div>Marks</div><div>Syllabus done</div><div>Practice accuracy</div><div></div></div>';
    return head + B.subjects.map(function (s) {
      var prog = D.syllabusProgress(s.id);
      var st = D.subjectStats(s.id);
      var acc = st.accuracy == null ? '<span class="muted small">Not practised yet</span>' :
        UI.meterRow(st.accuracy * 100, 100, Math.round(st.accuracy * 100) + '%');
      return '<div class="subject-row">' +
        '<div class="name">' + UI.mono(s, true) + '<div><div class="t">' + UI.subjectName(s) + '</div><div class="s">' + esc(s.en) + '</div></div></div>' +
        '<div class="marks">' + s.marks + '</div>' +
        '<div class="m-syl">' + UI.meterRow(prog.done, prog.total, prog.done + '/' + prog.total) + '</div>' +
        '<div class="m-acc">' + acc + (st.attempted ? '<div class="tiny muted">' + st.attempted + ' of ' + st.total + ' questions tried</div>' : '') + '</div>' +
        '<div class="go"><a class="btn btn-ghost btn-sm" href="#/practice?s=' + s.id + '">Practice</a></div>' +
        '</div>';
    }).join('');
  }

  function todayCard() {
    var t = S.today();
    var goal = S.settings.dailyGoal;
    var due = D.dueCards().length;
    var newLeft = Math.min(D.newCardsLeftToday(), D.newCards().length);
    var wrong = D.pool({ filter: 'wrong' }).length;
    var tasks = App.planner ? App.planner.todayTasks() : null;
    var html = '<div class="card"><div class="card-h"><h2>Today</h2><span class="sub">' + U.fmtDay(U.dayKey(), true) + '</span></div>' +
      '<div class="stat-label">Daily question goal</div>' +
      '<div class="row mt-8"><div class="stat-value">' + t.q + '<small> / ' + goal + '</small></div>' +
      (t.q ? '<span class="badge badge-good">' + U.icon('ok', 14) + U.pct(t.c, t.q) + '% correct</span>' : '') + '</div>' +
      '<div class="mt-8">' + UI.meter(t.q, goal, 'thick') + '</div>' +
      '<div class="row wrap mt-16">' +
        '<a class="btn btn-primary" href="#/practice?mode=smart&n=20&go=1">' + U.icon('bolt', 17) + 'Practise 20 recommended</a>' +
        '<a class="btn btn-ghost" href="#/practice">Choose topics</a>' +
      '</div>' +
      '<div class="list mt-16 card flat pad-0">' +
        '<a class="list-row" href="#/flashcards">' + U.icon('cards', 18) + '<div class="grow"><div class="title">Flashcards</div><div class="meta">' +
          (due ? due + ' due for review' : 'Nothing due') + (newLeft ? ' · ' + newLeft + ' new available today' : '') + '</div></div>' + U.icon('right', 16) + '</a>' +
        '<a class="list-row" href="#/review">' + U.icon('review', 18) + '<div class="grow"><div class="title">Mistakes to re-do</div><div class="meta">' +
          (wrong ? wrong + ' questions you last got wrong' : 'No open mistakes') + '</div></div>' + U.icon('right', 16) + '</a>' +
      '</div>';
    if (tasks && tasks.length) {
      html += '<div class="mt-16"><div class="stat-label mb-8">From your study plan</div><div class="tasks" id="dash-tasks">' +
        tasks.map(function (tk) {
          return '<label class="task' + (tk.done ? ' done' : '') + '"><input type="checkbox" data-day="' + tk.day + '" data-i="' + tk.i + '"' + (tk.done ? ' checked' : '') + '>' +
            '<span class="task-text">' + tk.html + '</span></label>';
        }).join('') + '</div></div>';
    } else if (S.state.plan) {
      html += '<p class="small muted mt-16 mb-0">No study-plan tasks today. Use the time for flashcards and mistakes, or see the <a href="#/planner">planner</a>.</p>';
    } else {
      html += '<p class="small muted mt-16 mb-0">Tip: create a <a href="#/planner">study plan</a> and today\'s topics will show up here.</p>';
    }
    return html + '</div>';
  }

  function render(root) {
    var all = D.overallStats();
    var prog = D.syllabusProgress();
    var mocks = S.state.mocks;
    var best = mocks.reduce(function (b, m) { var p = m.score.net / m.score.total; return p > b ? p : b; }, -1);
    var acc7 = last7Accuracy();
    var streak = S.streak();

    var noContent = !D.all.length;
    var html = '';
    if (noContent) {
      html += UI.callout('<strong>No questions are loaded.</strong> The files in <code>data/questions/</code> are missing or failed to load. Run <code>node tools/validate.js</code> to see why.', 'warn');
    }
    html += '<div class="welcome section">' +
      '<div class="card greet">' +
        '<h2>' + esc(greeting()) + '</h2>' +
        '<p>Your preparation space for the BCS Preliminary Test: 200 MCQs in 2 hours, with 0.50 marks deducted for each wrong answer. ' +
        'New here? Start with the <a href="#/guide">exam guide</a>, then work through the <a href="#/syllabus">syllabus</a>.</p>' +
      '</div>' + countdownCard() + '</div>';

    html += '<div class="grid cols-5 section">' +
      UI.stat('Syllabus covered', U.pct(prog.done, prog.total) + '%', prog.done + ' of ' + prog.total + ' topics done' + (prog.started - prog.done > 0 ? ' · ' + (prog.started - prog.done) + ' in progress' : ''), 'syllabus') +
      UI.stat('Questions practised', U.fmtNum(all.attempted), 'of ' + U.fmtNum(all.total) + ' in the bank', 'practice') +
      UI.stat('Accuracy', all.accuracy == null ? '–' : Math.round(all.accuracy * 100) + '%', acc7 ? 'Last 7 days: ' + acc7.pct + '% over ' + acc7.q + ' answers' : 'Answer some questions to see this', 'target') +
      UI.stat('Best mock score', best < 0 ? '–' : Math.round(best * 100) + '%', mocks.length ? mocks.length + ' mock test' + (mocks.length > 1 ? 's' : '') + ' taken' : 'No mock tests yet', 'trophy') +
      UI.stat('Study streak', streak + '<small> ' + (streak === 1 ? 'day' : 'days') + '</small>', 'Best: ' + bestStreak() + (bestStreak() === 1 ? ' day' : ' days'), 'flame') +
      '</div>';

    html += '<div class="grid cols-2 section">' + todayCard() +
      '<div class="card"><div class="card-h"><div><h2>Mock test scores</h2><div class="sub">% of total marks, after negative marking</div></div>' +
      '<div class="actions"><a class="btn btn-ghost btn-sm" href="#/mock">All tests</a></div></div>' +
      (mocks.length ? '<div id="mock-chart"></div>' :
        '<div class="empty"><p>Take a mock test to start tracking your score.</p><a class="btn btn-primary" href="#/mock">' + U.icon('mock', 17) + 'Take a mock test</a></div>') +
      '</div></div>';

    html += '<div class="section"><div class="section-h"><div><h2>Subject readiness</h2><p>Marks follow the 50th BCS distribution. Spend time where the marks are.</p></div></div>' +
      '<div class="card pad-0">' + subjectRows() + '</div></div>';

    var weak = D.weakTopics(5);
    html += '<div class="grid cols-2 section">' +
      '<div class="card"><div class="card-h"><div><h2>Study activity</h2><div class="sub">Questions and flashcards answered per day</div></div></div>' +
        '<div id="heat"></div>' +
        '<div class="row mt-8 between wrap"><span class="tiny muted" id="heat-summary"></span>' +
        '<span class="heat-legend">Less <i style="background:var(--heat-0)"></i><i style="background:var(--heat-1)"></i><i style="background:var(--heat-2)"></i><i style="background:var(--heat-3)"></i><i style="background:var(--heat-4)"></i> More</span></div>' +
      '</div>' +
      '<div class="card pad-0"><div class="card-h" style="padding:20px 20px 0"><div><h2>Weakest topics</h2><div class="sub">Lowest accuracy, at least 4 answers</div></div></div>' +
        (weak.length ? '<div class="list">' + weak.map(function (w) {
          var s = B.subjectById[w.topic.subject];
          return '<div class="list-row"><div class="grow"><div class="title">' + UI.topicName(w.topic) + '</div>' +
            '<div class="meta">' + esc(s.en) + ' · ' + Math.round(w.stats.accuracy * 100) + '% over ' + w.stats.attempts + ' answers</div></div>' +
            '<a class="btn btn-soft btn-sm" href="#/notes/' + s.id + '/' + w.topic.id + '">Notes</a>' +
            '<a class="btn btn-ghost btn-sm" href="#/practice?t=' + w.topic.id + '&go=1">Practise</a></div>';
        }).join('') + '</div>' : '<div class="empty"><p>Practise a few topics and your weakest ones will appear here.</p></div>') +
      '</div></div>';

    root.innerHTML = html;

    var cleanups = [];
    if (mocks.length) {
      var pts = mocks.slice(-30).map(function (m) {
        var p = (m.score.net / m.score.total) * 100;
        return {
          label: U.fmtDayShort(U.dayKey(new Date(m.finishedAt))), y: Math.max(0, p),
          tip: [U.fmtMarks(m.score.net) + ' / ' + m.score.total + ' (' + Math.round(p) + '%)', m.title, U.fmtDateTime(m.finishedAt)]
        };
      });
      cleanups.push(App.charts.line(U.$('#mock-chart', root), {
        points: pts, yMax: 100, target: S.settings.targetPct, targetLabel: 'Target ' + S.settings.targetPct + '%',
        yFormat: function (v) { return v + '%'; }, ariaLabel: 'Mock test scores over time'
      }));
    }
    var goal = Math.max(10, S.settings.dailyGoal);
    cleanups.push(App.charts.heatmap(U.$('#heat', root), {
      weeks: 18,
      levels: [1, Math.round(goal * 0.25), Math.round(goal * 0.6), goal],
      value: function (day) { var d = S.state.activity[day]; return d ? (d.q || 0) + (d.f || 0) : 0; },
      tip: function (day) {
        var d = S.state.activity[day] || {};
        var parts = [];
        if (d.q) parts.push(d.q + ' questions');
        if (d.f) parts.push(d.f + ' flashcards');
        if (d.n) parts.push(d.n + ' notes read');
        if (d.m) parts.push(d.m + ' mock test' + (d.m > 1 ? 's' : ''));
        return [parts.length ? parts.join(' · ') : 'No study', U.fmtDay(day, true)];
      }
    }));
    var activeDays = 0, weekQ = 0;
    for (var i = 0; i < 28; i++) {
      var d = S.state.activity[U.addDays(U.dayKey(), -i)];
      if (d && (d.q || d.f || d.n || d.m)) activeDays++;
      if (i < 7 && d) weekQ += d.q || 0;
    }
    U.$('#heat-summary', root).textContent = activeDays + (activeDays === 1 ? ' active day' : ' active days') + ' in the last 4 weeks · ' + weekQ + (weekQ === 1 ? ' question' : ' questions') + ' this week';

    var tasksEl = U.$('#dash-tasks', root);
    if (tasksEl) {
      tasksEl.addEventListener('change', function (e) {
        var cb = e.target;
        if (!cb.dataset.day) return;
        App.planner.setTask(cb.dataset.day, +cb.dataset.i, cb.checked);
        cb.closest('.task').classList.toggle('done', cb.checked);
      });
    }
    return function () { cleanups.forEach(function (f) { if (f) f(); }); };
  }

  App.views.dashboard = { title: 'Dashboard', render: render };
})();
