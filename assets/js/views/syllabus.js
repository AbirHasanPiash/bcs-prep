/* Syllabus tracker: every topic of the preliminary syllabus with a study status. */
(function () {
  'use strict';
  var U = App.util, S = App.store, D = App.data, UI = App.ui, B = window.BCS;
  var esc = U.esc;

  var STATUS = ['Not started', 'Studying', 'Done', 'Revised'];
  var open = {}; // subjectId -> expanded (kept while the app is open)

  function subjectHeadStats(s) {
    var p = D.syllabusProgress(s.id);
    return { p: p, text: p.done + ' of ' + p.total + ' topics done' + (p.started - p.done ? ' · ' + (p.started - p.done) + ' studying' : '') };
  }

  function topicRow(t) {
    var st = S.topicStatus(t.id);
    var qs = D.byTopic[t.id].length;
    var ts = D.topicStats(t.id);
    var hasNote = !!D.notesByTopic[t.id];
    var badges = [];
    badges.push('<span class="badge">' + qs + ' questions</span>');
    if (ts.attempts) badges.push('<span class="badge badge-brand">' + Math.round(ts.accuracy * 100) + '% accuracy</span>');
    if (S.isNoteRead(t.id)) badges.push('<span class="badge badge-good">' + U.icon('check', 13) + 'Notes read</span>');
    return '<div class="topic-row" data-topic="' + t.id + '">' +
      '<div><div class="t">' + UI.topicName(t) + (t.subject !== 'english' ? ' <span class="muted small">· ' + esc(t.en) + '</span>' : '') + '</div>' +
        '<div class="covers"' + (t.subject === 'english' ? ' lang="en"' : ' lang="bn"') + '>' + esc(t.covers) + '</div>' +
        '<div class="meta">' + badges.join('') + '</div></div>' +
      '<div class="ctl">' +
        '<div class="seg status-seg" role="group" aria-label="Status of this topic">' +
          STATUS.map(function (label, v) {
            return '<button type="button" data-v="' + v + '" class="' + (st === v ? 'on' : '') + '" aria-pressed="' + (st === v) + '">' + label + '</button>';
          }).join('') +
        '</div>' +
        (hasNote ? '<a class="btn btn-ghost btn-sm" href="#/notes/' + t.subject + '/' + t.id + '">' + U.icon('notes', 15) + 'Notes</a>' : '') +
        (qs ? '<a class="btn btn-soft btn-sm" href="#/practice?t=' + t.id + '&go=1">' + U.icon('practice', 15) + 'Practise</a>' : '') +
      '</div></div>';
  }

  function subjectCard(s) {
    var h = subjectHeadStats(s);
    var isOpen = !!open[s.id];
    return '<div class="card subj-card' + (isOpen ? ' open' : '') + '" data-subject="' + s.id + '">' +
      '<button type="button" class="subj-head" aria-expanded="' + isOpen + '">' +
        UI.mono(s) +
        '<div class="grow"><div class="t">' + UI.subjectName(s) + ' <span class="badge">' + s.marks + ' marks</span></div>' +
          '<div class="s">' + esc(s.en) + ' · <span class="head-text">' + h.text + '</span></div>' +
          '<div class="mt-8" style="max-width:420px">' + UI.meter(h.p.done, h.p.total) + '</div></div>' +
        U.icon('down', 20, 'chev') +
      '</button>' +
      '<div class="subj-body"' + (isOpen ? '' : ' hidden') + '>' + s.topics.map(topicRow).join('') + '</div>' +
      '</div>';
  }

  function summaryHtml() {
    var p = D.syllabusProgress();
    var counts = [0, 0, 0, 0];
    Object.keys(B.topicById).forEach(function (id) { counts[S.topicStatus(id)]++; });
    return '<div class="row wrap between">' +
        '<div><div class="stat-label">Overall syllabus progress</div>' +
        '<div class="stat-value">' + U.pct(p.done, p.total) + '%<small> · ' + p.done + ' of ' + p.total + ' topics done</small></div></div>' +
        '<div class="row wrap">' +
          '<span class="badge">' + counts[0] + ' not started</span>' +
          '<span class="badge badge-warn">' + counts[1] + ' studying</span>' +
          '<span class="badge badge-good">' + counts[2] + ' done</span>' +
          '<span class="badge badge-brand">' + counts[3] + ' revised</span>' +
        '</div>' +
      '</div>' +
      '<div class="mt-16">' + UI.meter(p.done, p.total, 'thick') + '</div>';
  }

  function render(root, params, query) {
    if (query.s && B.subjectById[query.s]) open[query.s] = true;

    root.innerHTML =
      '<div class="card section">' +
        '<div id="syl-summary">' + summaryHtml() + '</div>' +
        '<p class="small muted mt-16 mb-0">Topics follow the PSC preliminary syllabus, grouped the way questions are usually asked. Mark a topic <strong>Done</strong> once you have read its notes and practised it, and <strong>Revised</strong> after a second pass. Status is saved in this browser.</p>' +
      '</div>' +
      '<div class="section-h section"><div><h2>Subjects</h2><p>Click a subject to see its topics.</p></div>' +
        '<div class="actions"><button type="button" class="btn btn-ghost btn-sm" id="expand-all">Expand all</button><button type="button" class="btn btn-ghost btn-sm" id="collapse-all">Collapse all</button></div></div>' +
      '<div class="stack" id="subjects">' + B.subjects.map(subjectCard).join('') + '</div>';

    var list = U.$('#subjects', root);
    list.addEventListener('click', function (e) {
      var head = e.target.closest('.subj-head');
      if (head) {
        var card = head.closest('.subj-card');
        var id = card.dataset.subject;
        open[id] = !open[id];
        card.classList.toggle('open', open[id]);
        head.setAttribute('aria-expanded', open[id]);
        U.$('.subj-body', card).hidden = !open[id];
        return;
      }
      var btn = e.target.closest('.status-seg button');
      if (btn) {
        var row = btn.closest('.topic-row');
        var v = +btn.dataset.v;
        S.setTopicStatus(row.dataset.topic, v);
        U.$$('.status-seg button', row).forEach(function (b) {
          var on = +b.dataset.v === v;
          b.classList.toggle('on', on);
          b.setAttribute('aria-pressed', on);
        });
        var card2 = row.closest('.subj-card');
        var s = B.subjectById[card2.dataset.subject];
        var h = subjectHeadStats(s);
        U.$('.head-text', card2).textContent = h.text;
        U.$('.subj-head .meter', card2).outerHTML = UI.meter(h.p.done, h.p.total);
        U.$('#syl-summary', root).innerHTML = summaryHtml();
      }
    });
    U.$('#expand-all', root).addEventListener('click', function () {
      B.subjects.forEach(function (s) { open[s.id] = true; });
      App.refresh();
    });
    U.$('#collapse-all', root).addEventListener('click', function () {
      open = {};
      App.refresh();
    });
    if (query.s) {
      var el = U.$('[data-subject="' + query.s + '"]', root);
      if (el) setTimeout(function () { el.scrollIntoView({ block: 'start' }); }, 30);
    }
  }

  App.views.syllabus = { title: 'Syllabus', render: render };
})();
