/* Search across notes and questions. */
(function () {
  'use strict';
  var U = App.util, D = App.data, UI = App.ui, B = window.BCS;
  var esc = U.esc;

  function highlight(text, q) {
    text = text.normalize('NFC');
    var lower = text.toLowerCase(), ql = q.toLowerCase();
    var out = '', i = 0, j;
    while ((j = lower.indexOf(ql, i)) >= 0) {
      out += esc(text.slice(i, j)) + '<mark>' + esc(text.slice(j, j + q.length)) + '</mark>';
      i = j + q.length;
    }
    return out + esc(text.slice(i));
  }

  function render(root, params, query) {
    var q = (query.q || '').trim().normalize('NFC');
    U.$('#search-input').value = q;
    var res = D.search(q, 80);
    if (q.length < 2) { root.innerHTML = UI.empty('Type at least two characters', 'Search works in Bangla and English, across notes and questions.'); return; }
    var html = '<p class="dim">' + res.notes.length + ' note' + (res.notes.length === 1 ? '' : 's') + ' and ' + res.questions.length + (res.questions.length >= 80 ? '+' : '') + ' question' + (res.questions.length === 1 ? '' : 's') + ' for “' + esc(q) + '”</p>';
    if (res.notes.length) {
      html += '<div class="section"><div class="section-h"><h2>Notes</h2></div><div class="card pad-0">' + res.notes.map(function (r) {
        var lng = r.topic.subject === 'english' ? 'en' : 'bn';
        return '<a class="search-hit" href="#/notes/' + r.topic.subject + '/' + r.topic.id + '"><div class="t" lang="' + lng + '">' + esc(r.note.title) + ' <span class="muted small">· ' + esc(B.subjectById[r.topic.subject].en) + '</span></div>' +
          '<div class="snip" lang="' + lng + '">' + highlight(r.snippet, q) + '</div></a>';
      }).join('') + '</div></div>';
    }
    if (res.questions.length) {
      html += '<div class="section"><div class="section-h"><h2>Questions</h2><div class="actions"><button type="button" class="btn btn-soft btn-sm" id="practise-hits">' + U.icon('play', 15) + 'Practise these</button></div></div><div class="card pad-0">' +
        res.questions.map(function (x) {
          var lng = x.s === 'english' ? 'en' : 'bn';
          var labels = U.optionLabels(x.s);
          return '<div class="search-hit"><div class="t" lang="' + lng + '">' + highlight(x.q, q) + '</div>' +
            '<div class="snip" lang="' + lng + '"><span class="badge badge-good">' + labels[x.a] + '</span> ' + highlight(x.o[x.a], q) + '</div>' +
            '<div class="snip muted" lang="' + lng + '">' + highlight(x.e, q) + '</div></div>';
        }).join('') + '</div></div>';
    }
    if (!res.notes.length && !res.questions.length) html += UI.empty('No matches', 'Try a shorter word, or a different spelling.');
    root.innerHTML = html;
    var pb = U.$('#practise-hits', root);
    if (pb) pb.addEventListener('click', function () {
      App.practice.start({ qids: res.questions.slice(0, 50).map(function (x) { return x.id; }), mode: 'learn', title: 'Search: ' + q });
    });
  }

  App.views.search = { title: 'Search', nav: 'none', render: render };
})();
