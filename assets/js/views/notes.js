/* Study notes: subject list -> topic list -> note reader. */
(function () {
  'use strict';
  var U = App.util, S = App.store, D = App.data, UI = App.ui, B = window.BCS;
  var esc = U.esc;

  function readCount(s) {
    return s.topics.filter(function (t) { return S.isNoteRead(t.id); }).length;
  }
  function noteCount(s) {
    return s.topics.filter(function (t) { return D.notesByTopic[t.id]; }).length;
  }

  function renderSubjects(root) {
    root.innerHTML =
      '<div class="section-h"><div><h2>Pick a subject</h2><p>Concise, exam-focused notes for every syllabus topic. Read a topic, then practise it straight away.</p></div></div>' +
      '<div class="grid auto-fill">' + B.subjects.map(function (s) {
        var n = noteCount(s), r = readCount(s);
        return '<a class="card subject-tile" href="#/notes/' + s.id + '">' + UI.mono(s) +
          '<div class="grow" style="flex:1;min-width:0"><div class="t">' + UI.subjectName(s) + '</div><div class="s">' + esc(s.en) + ' · ' + s.marks + ' marks</div>' +
          '<div class="mt-8">' + UI.meterRow(r, s.topics.length, r + '/' + s.topics.length) + '</div>' +
          '<div class="tiny muted">' + (n < s.topics.length ? n + ' of ' + s.topics.length + ' topics have notes' : s.topics.length + ' topics') + ' · ' + r + ' read</div></div></a>';
      }).join('') + '</div>';
  }

  function renderSubject(root, s) {
    var firstUnread = s.topics.filter(function (t) { return D.notesByTopic[t.id] && !S.isNoteRead(t.id); })[0];
    root.innerHTML =
      '<div class="crumbs mb-16"><a href="#/notes">Notes</a>' + U.icon('right', 14) + '<span>' + esc(s.en) + '</span></div>' +
      '<div class="card section"><div class="row wrap">' + UI.mono(s) +
        '<div style="flex:1;min-width:200px"><h2 style="font-size:20px">' + UI.subjectName(s) + '</h2><div class="muted small">' + esc(s.en) + ' · ' + s.marks + ' marks · ' + s.topics.length + ' topics</div></div>' +
        (firstUnread ? '<a class="btn btn-primary" href="#/notes/' + s.id + '/' + firstUnread.id + '">' + U.icon('play', 16) + 'Continue reading</a>' : '') +
        '<a class="btn btn-ghost" href="#/practice?s=' + s.id + '">Practise subject</a>' +
      '</div></div>' +
      '<div class="card pad-0 section"><div class="list">' + s.topics.map(function (t, i) {
        var has = !!D.notesByTopic[t.id];
        var read = S.isNoteRead(t.id);
        return '<a class="list-row" href="#/notes/' + s.id + '/' + t.id + '">' +
          '<span class="badge ' + (read ? 'badge-good' : '') + '" style="min-width:34px;justify-content:center">' + (read ? U.icon('check', 14) : (i + 1)) + '</span>' +
          '<div class="grow"><div class="title">' + UI.topicName(t) + '</div><div class="meta"' + (s.id === 'english' ? '' : ' lang="bn"') + '>' + esc(t.covers) + '</div></div>' +
          '<span class="tiny muted nowrap">' + (has ? D.byTopic[t.id].length + ' Qs' : 'No notes yet') + '</span>' + U.icon('right', 16) + '</a>';
      }).join('') + '</div></div>';
  }

  function renderNote(root, s, t) {
    var idx = s.topics.indexOf(t);
    var prev = s.topics[idx - 1], next = s.topics[idx + 1];
    var note = D.notesByTopic[t.id];
    var lang = s.id === 'english' ? 'en' : 'bn';
    var qn = D.byTopic[t.id].length;
    var read = S.isNoteRead(t.id);

    var toc = '<nav class="card note-toc" aria-label="Topics in this subject">' + s.topics.map(function (x) {
      return '<a href="#/notes/' + s.id + '/' + x.id + '" class="' + (x === t ? 'on' : '') + '">' +
        (S.isNoteRead(x.id) ? U.icon('check', 15) : '<span class="dot"></span>') + '<span lang="' + lang + '">' + esc(x.bn) + '</span></a>';
    }).join('') + '</nav>';

    var body = note
      ? '<div class="note-body" lang="' + lang + '">' + note.html + '</div>'
      : '<div class="note-body"><div class="empty"><h3>Notes for this topic are not available yet</h3><p lang="' + lang + '">' + esc(t.covers) + '</p></div></div>';

    root.innerHTML =
      '<div class="note-layout">' + toc +
      '<div class="stack">' +
        '<article class="card pad-0">' +
          '<header class="note-head">' +
            '<div class="crumbs"><a href="#/notes">Notes</a>' + U.icon('right', 14) + '<a href="#/notes/' + s.id + '">' + esc(s.en) + '</a></div>' +
            '<h2 lang="' + lang + '">' + esc(note && note.title || t.bn) + '</h2>' +
            '<div class="row wrap"><span class="badge">' + esc(t.en) + '</span><span class="badge">' + qn + ' practice questions</span>' +
            (read ? '<span class="badge badge-good">' + U.icon('check', 13) + 'Read</span>' : '') + '</div>' +
          '</header>' +
          body +
          '<footer class="note-foot">' +
            '<button type="button" class="btn ' + (read ? 'btn-ghost' : 'btn-soft') + '" id="mark-read">' + U.icon('check', 16) + (read ? 'Marked as read' : 'Mark as read') + '</button>' +
            (qn ? '<a class="btn btn-primary" href="#/practice?t=' + t.id + '&go=1">' + U.icon('practice', 16) + 'Practise this topic</a>' : '') +
            '<span class="spacer"></span>' +
            '<a class="btn btn-text report-link" href="' + esc(App.links.issue('Mistake in note ' + t.id, 'Note: ' + t.id + ' (' + (note && note.title || t.bn) + ')\n\nWhat is wrong, and a source if you have one:\n')) + '" target="_blank" rel="noopener">Report a mistake</a>' +
            (prev ? '<a class="btn btn-ghost" href="#/notes/' + s.id + '/' + prev.id + '">' + U.icon('left', 16) + 'Previous</a>' : '') +
            (next ? '<a class="btn btn-ghost" href="#/notes/' + s.id + '/' + next.id + '">Next' + U.icon('right', 16) + '</a>' : '') +
          '</footer>' +
        '</article>' +
        '<div class="card"><div class="card-h"><h3>My notes</h3><span class="sub">Your own points, mnemonics or corrections. Saved automatically in this browser.</span></div>' +
          '<textarea class="textarea" id="my-note" lang="' + lang + '" placeholder="Write something to remember about this topic…"></textarea>' +
          '<div class="tiny muted mt-8" id="my-note-status"></div></div>' +
      '</div></div>';

    // Wide tables scroll inside their own box instead of stretching the page.
    U.$$('.note-body table', root).forEach(function (tb) {
      var wrap = document.createElement('div');
      wrap.className = 'table-scroll';
      tb.parentNode.insertBefore(wrap, tb);
      wrap.appendChild(tb);
    });

    U.$('#mark-read', root).addEventListener('click', function () {
      var nowRead = !S.isNoteRead(t.id);
      S.setNoteRead(t.id, nowRead);
      if (nowRead && S.topicStatus(t.id) === 0) {
        S.setTopicStatus(t.id, 1);
        U.toast('Marked as read. Topic set to “Studying” in your syllabus.');
      }
      App.refresh();
    });

    var ta = U.$('#my-note', root);
    var status = U.$('#my-note-status', root);
    ta.value = S.myNote(t.id);
    if (ta.value) status.textContent = 'Saved.';
    var saveNote = U.debounce(function () {
      S.setMyNote(t.id, ta.value);
      status.textContent = 'Saved.';
    }, 400);
    ta.addEventListener('input', function () { status.textContent = 'Saving…'; saveNote(); });

    function onKey(e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight' && next) location.hash = '#/notes/' + s.id + '/' + next.id;
      if (e.key === 'ArrowLeft' && prev) location.hash = '#/notes/' + s.id + '/' + prev.id;
    }
    document.addEventListener('keydown', onKey);
    return function () { document.removeEventListener('keydown', onKey); };
  }

  function render(root, params) {
    var s = params[0] && B.subjectById[params[0]];
    if (!s) return renderSubjects(root);
    var t = params[1] && B.topicById[params[1]];
    if (!t || t.subject !== s.id) return renderSubject(root, s);
    return renderNote(root, s, t);
  }

  App.views.notes = {
    title: function (r) {
      var t = r.params[1] && B.topicById[r.params[1]];
      var s = r.params[0] && B.subjectById[r.params[0]];
      return t ? t.en : s ? s.en + ' notes' : 'Study notes';
    },
    render: render
  };
})();
