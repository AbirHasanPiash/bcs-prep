/* Settings: goals, exam date, theme, and backup/restore of all progress. */
(function () {
  'use strict';
  var U = App.util, S = App.store, D = App.data, UI = App.ui, B = window.BCS;
  var esc = U.esc;

  function render(root) {
    var st = S.settings;
    var totals = { q: 0, n: 0, f: 0 };
    var rows = B.subjects.map(function (s) {
      var q = D.bySubject[s.id].length;
      var n = s.topics.filter(function (t) { return D.notesByTopic[t.id]; }).length;
      var f = D.cardsBySubject[s.id].length;
      totals.q += q; totals.n += n; totals.f += f;
      return '<tr><td>' + esc(s.en) + '</td><td class="num">' + s.marks + '</td><td class="num">' + q + '</td><td class="num hide-sm">' + n + ' / ' + s.topics.length + '</td><td class="num">' + f + '</td></tr>';
    }).join('');

    root.innerHTML = '<div class="stack">' +
      '<div class="grid cols-2">' +
        '<div class="card"><div class="card-h"><h2>You and your exam</h2></div><div class="stack">' +
          '<div class="field"><label for="s-name">Your name</label><input class="input" id="s-name" value="' + esc(st.name) + '" placeholder="Shown in the dashboard greeting" maxlength="40"></div>' +
          '<div class="field"><label for="s-label">Exam you are preparing for</label><input class="input" id="s-label" value="' + esc(st.examLabel) + '" maxlength="60"></div>' +
          '<div class="field"><label for="s-date">Exam date</label><input class="input" type="date" id="s-date" value="' + esc(st.examDate) + '">' +
            '<span class="hint">Not announced yet? Enter an estimate (for example mid-February 2027) and update it when the circular is out.</span></div>' +
        '</div></div>' +
        '<div class="card"><div class="card-h"><h2>Goals</h2></div><div class="stack">' +
          '<div class="field"><label for="s-goal">Questions per day</label><input class="input" type="number" id="s-goal" min="5" max="500" step="5" value="' + st.dailyGoal + '"><span class="hint">40–60 a day adds up to well over 1,000 questions a month.</span></div>' +
          '<div class="field"><label for="s-cards">New flashcards per day</label><input class="input" type="number" id="s-cards" min="0" max="200" step="5" value="' + st.newCardsPerDay + '"></div>' +
          '<div class="field"><label for="s-target">Mock test target (% of total marks)</label><input class="input" type="number" id="s-target" min="30" max="95" step="5" value="' + st.targetPct + '">' +
            '<span class="hint">PSC does not publish a pass mark for the preliminary and it changes from exam to exam. Set a target that keeps you comfortably safe.</span></div>' +
        '</div></div>' +
      '</div>' +

      '<div class="grid cols-2">' +
        '<div class="card"><div class="card-h"><h2>Appearance and tests</h2></div><div class="stack">' +
          '<div class="field"><span class="field-label">Theme</span><div class="seg" id="s-theme">' +
            [['system', 'Match system'], ['light', 'Light'], ['dark', 'Dark']].map(function (t) {
              return '<button type="button" data-v="' + t[0] + '" class="' + (st.theme === t[0] ? 'on' : '') + '" aria-pressed="' + (st.theme === t[0]) + '">' + t[1] + '</button>';
            }).join('') + '</div></div>' +
          '<label class="check"><input type="checkbox" id="s-lock"' + (st.lockAnswers ? ' checked' : '') + '><span><strong>Lock answers in mock tests</strong><br><span class="small muted">Once a bubble is filled it can\'t be changed, like a real OMR sheet.</span></span></label>' +
        '</div></div>' +
        '<div class="card"><div class="card-h"><h2>Your data</h2></div>' +
          '<p class="small dim">Progress is stored only in this browser, on this device. Nothing is uploaded anywhere. Export a backup now and then, especially before clearing browser data or switching devices.</p>' +
          '<div class="row wrap">' +
            '<button type="button" class="btn btn-primary" id="s-export">' + U.icon('download', 16) + 'Export backup</button>' +
            '<label class="btn btn-ghost" for="s-import">' + U.icon('upload', 16) + 'Import backup</label><input type="file" id="s-import" accept=".json,application/json" hidden>' +
          '</div>' +
          '<hr style="border:0;border-top:1px solid var(--border);margin:18px 0">' +
          '<div class="row wrap between"><div><strong>Reset everything</strong><div class="small muted">Deletes all progress, results and the plan.</div></div>' +
          '<button type="button" class="btn btn-danger" id="s-reset">' + U.icon('trash', 16) + 'Reset</button></div>' +
        '</div>' +
      '</div>' +

      '<div class="card prose"><h2>About BCS Prep</h2>' +
        '<p>A free study site for the BCS Preliminary Test. There is no account and nothing to install: everything you do is saved in this browser only.</p>' +
        '<p>Questions and notes are written for practice in the style of the exam; they are not copied from past papers. Time-sensitive facts show the date they were checked. Always confirm exam rules with the official circular at <strong>bpsc.gov.bd</strong>.</p>' +
        '<div class="row wrap">' +
          '<a class="btn btn-soft" href="' + esc(App.links.issue('Report a mistake or suggestion', '')) + '" target="_blank" rel="noopener">' + U.icon('flag', 16) + 'Report a mistake</a>' +
          '<a class="btn btn-ghost" href="' + esc(App.links.repo) + '" target="_blank" rel="noopener">Source code on GitHub</a>' +
        '</div>' +
      '</div>' +

      '<div class="card pad-0"><div class="card-h" style="padding:18px 18px 0"><h2>Content in this copy</h2><span class="sub">Syllabus basis: ' + esc(B.meta.syllabusBasis) + '</span></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Subject</th><th class="num">Marks</th><th class="num">Questions</th><th class="num hide-sm">Topics with notes</th><th class="num">Flashcards</th></tr></thead>' +
        '<tbody>' + rows + '</tbody><tfoot><tr><td>Total</td><td class="num">200</td><td class="num">' + totals.q + '</td><td class="num hide-sm">' + totals.n + ' / ' + Object.keys(B.topicById).length + '</td><td class="num">' + totals.f + '</td></tr></tfoot></table></div>' +
        '<p class="small muted" style="padding:0 18px 18px;margin-top:12px">Exam facts were checked on ' + esc(B.meta.lastVerified) + '. Questions marked as time-sensitive show the date they were correct. To add your own questions or notes, see <code>docs/CONTENT_GUIDE.md</code>, and check your changes with <code>node tools/validate.js</code>.</p>' +
      '</div>' +
      '</div>';

    function bindText(id, key, transform) {
      U.$(id, root).addEventListener('change', function (e) {
        var v = transform ? transform(e.target.value) : e.target.value.trim();
        if (v === null) { e.target.value = st[key]; return; }
        st[key] = v;
        S.save();
        App.renderNav();
        U.toast('Saved.');
      });
    }
    var num = function (lo, hi) { return function (v) { var n = Math.round(+v); return isFinite(n) && v !== '' ? U.clamp(n, lo, hi) : null; }; };
    bindText('#s-name', 'name');
    bindText('#s-label', 'examLabel');
    bindText('#s-date', 'examDate');
    bindText('#s-goal', 'dailyGoal', num(5, 500));
    bindText('#s-cards', 'newCardsPerDay', num(0, 200));
    bindText('#s-target', 'targetPct', num(30, 95));

    U.$('#s-theme', root).addEventListener('click', function (e) {
      var b = e.target.closest('[data-v]');
      if (!b) return;
      st.theme = b.dataset.v;
      S.save();
      App.applyTheme();
      U.$$('#s-theme button', root).forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    });
    U.$('#s-lock', root).addEventListener('change', function (e) { st.lockAnswers = e.target.checked; S.save(); U.toast('Saved.'); });
    U.$('#s-export', root).addEventListener('click', function () {
      S.saveNow();
      U.download('bcs-prep-backup-' + U.dayKey() + '.json', S.exportJSON());
    });
    U.$('#s-import', root).addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        U.confirmBox('Replace your current progress?', 'Everything in this browser will be replaced by the backup from “' + file.name + '”.', 'Import').then(function (ok) {
          if (!ok) return;
          try {
            S.importJSON(String(reader.result));
            App.applyTheme();
            U.toast('Backup imported.');
            App.refresh();
          } catch (err) {
            U.toast(err.message || 'Could not read that file.', 'bad');
          }
        });
      };
      reader.readAsText(file);
      e.target.value = '';
    });
    U.$('#s-reset', root).addEventListener('click', function () {
      U.confirmBox('Reset all progress?', 'This deletes your answers, mock results, flashcard schedule, notes, syllabus status and plan in this browser. Export a backup first if you might want it back.', 'Delete everything', true).then(function (ok) {
        if (!ok) return;
        S.reset();
        App.applyTheme();
        U.toast('All progress has been reset.');
        App.go('#/');
      });
    });
  }

  App.views.settings = { title: 'Settings', render: render };
})();
