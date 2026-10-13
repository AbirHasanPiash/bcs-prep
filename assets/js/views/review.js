/* Review: questions you got wrong last time, bookmarks, and the ones you miss most. */
(function () {
  'use strict';
  var U = App.util, S = App.store, D = App.data, UI = App.ui, B = window.BCS;
  var esc = U.esc;
  var PAGE = 60;

  function lists() {
    var attempted = D.all.filter(function (q) { return S.qStat(q.id); });
    return {
      mistakes: attempted.filter(function (q) { return S.qStat(q.id).l === 0; })
        .sort(function (a, b) { return S.qStat(b.id).t - S.qStat(a.id).t; }),
      bookmarks: D.all.filter(function (q) { return S.isBookmarked(q.id); })
        .sort(function (a, b) { return S.state.bookmarks[b.id] - S.state.bookmarks[a.id]; }),
      missed: attempted.filter(function (q) { var st = S.qStat(q.id); return st.n - st.c >= 2; })
        .sort(function (a, b) { var x = S.qStat(a.id), y = S.qStat(b.id); return (y.n - y.c) - (x.n - x.c) || x.c / x.n - y.c / y.n; })
    };
  }

  function item(q) {
    var st = S.qStat(q.id);
    var labels = U.optionLabels(q.s);
    var lng = q.s === 'english' ? 'en' : 'bn';
    var bm = S.isBookmarked(q.id);
    var last = st && st.la != null ? st.la : null;
    return '<div class="pq" style="padding:16px 18px">' +
      '<div class="q-meta"><span class="badge badge-brand">' + esc(B.subjectById[q.s].en) + '</span><span lang="' + lng + '">' + esc(B.topicById[q.t].bn) + '</span>' +
        (st ? '<span>· answered ' + st.n + '×, ' + st.c + ' correct</span>' : '<span>· not attempted yet</span>') + '<span class="spacer"></span>' +
        '<button type="button" class="btn btn-ghost btn-sm bm-btn' + (bm ? ' on' : '') + '" data-bm="' + q.id + '" aria-pressed="' + bm + '">' + U.icon('bookmark', 14) + (bm ? 'Bookmarked' : 'Bookmark') + '</button></div>' +
      '<div class="pq-text" lang="' + lng + '">' + esc(q.q) + '</div>' +
      '<div class="pq-opts" style="margin-left:0" lang="' + lng + '">' + q.o.map(function (o, k) {
        var cls = 'pq-opt' + (k === q.a ? ' correct' : k === last && st && st.l === 0 ? ' wrong' : '');
        return '<div class="' + cls + '"><span class="bubble">' + labels[k] + '</span><span>' + esc(o) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="explain mt-8" style="margin-left:0"><div lang="' + lng + '">' + esc(q.e) + '</div>' +
      (q.asOf ? '<div class="asof">' + U.icon('clock', 13) + ' Correct as of ' + esc(q.asOf) + '.</div>' : '') +
      '<div class="explain-foot"><a class="report-link" href="' + esc(App.links.reportQuestion(q)) + '" target="_blank" rel="noopener">Report a mistake</a></div></div></div>';
  }

  function render(root, params, query) {
    var tab = query.tab || 'mistakes';
    var subj = query.s || '';
    var shown = +query.more || PAGE;
    var L = lists();
    var list = (L[tab] || L.mistakes).filter(function (q) { return !subj || q.s === subj; });
    var tabs = [['mistakes', 'Mistakes to re-do', L.mistakes.length], ['bookmarks', 'Bookmarked', L.bookmarks.length], ['missed', 'Most missed', L.missed.length]];
    var help = {
      mistakes: 'Questions whose most recent answer was wrong. Answer one correctly and it leaves this list.',
      bookmarks: 'Questions you saved with the bookmark button.',
      missed: 'Questions you have got wrong at least twice. Make a flashcard or a note for these.'
    }[tab];
    var bySubj = {};
    (L[tab] || []).forEach(function (q) { bySubj[q.s] = (bySubj[q.s] || 0) + 1; });

    root.innerHTML =
      '<div class="tabs" id="tabs">' + tabs.map(function (t) {
        return '<button type="button" class="tab' + (tab === t[0] ? ' on' : '') + '" data-tab="' + t[0] + '">' + t[1] + '<span class="badge">' + t[2] + '</span></button>';
      }).join('') + '</div>' +
      '<div class="row wrap between mb-16"><p class="dim small mb-0" style="max-width:560px">' + help + '</p>' +
        (list.length ? '<button type="button" class="btn btn-primary" id="practise">' + U.icon('play', 16) + 'Practise ' + (list.length > 50 ? '50 of these' : 'these ' + list.length) + '</button>' : '') + '</div>' +
      '<div class="chips mb-16" id="subj-chips"><button type="button" class="chip' + (!subj ? ' on' : '') + '" data-s="">All <span class="count">' + (L[tab] || []).length + '</span></button>' +
        B.subjects.filter(function (s) { return bySubj[s.id]; }).map(function (s) {
          return '<button type="button" class="chip' + (subj === s.id ? ' on' : '') + '" data-s="' + s.id + '">' + esc(s.en) + ' <span class="count">' + bySubj[s.id] + '</span></button>';
        }).join('') + '</div>' +
      (list.length
        ? '<div class="card pad-0" id="items">' + list.slice(0, shown).map(item).join('') + '</div>' +
          (list.length > shown ? '<div class="center mt-16"><button type="button" class="btn btn-ghost" id="more">Show more (' + (list.length - shown) + ' left)</button></div>' : '')
        : UI.empty(tab === 'bookmarks' ? 'No bookmarks yet' : 'Nothing here', tab === 'bookmarks' ? 'Use the bookmark button on any question to save it here.' : 'Great: no questions in this list right now.', '<a class="btn btn-primary" href="#/practice">Practise</a>'));

    function nav(t, s, more) {
      location.replace('#/review?keepScroll=1&tab=' + t + (s ? '&s=' + s : '') + (more ? '&more=' + more : ''));
    }
    U.$('#tabs', root).addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (b) nav(b.dataset.tab, ''); });
    U.$('#subj-chips', root).addEventListener('click', function (e) { var b = e.target.closest('[data-s]'); if (b) nav(tab, b.dataset.s); });
    var more = U.$('#more', root);
    if (more) more.addEventListener('click', function () { nav(tab, subj, shown + PAGE); });
    var pr = U.$('#practise', root);
    if (pr) pr.addEventListener('click', function () {
      App.practice.start({ qids: U.shuffle(list).slice(0, 50).map(function (q) { return q.id; }), mode: 'learn', title: tabs.filter(function (t) { return t[0] === tab; })[0][1] });
    });
    var items = U.$('#items', root);
    if (items) items.addEventListener('click', function (e) {
      var b = e.target.closest('[data-bm]');
      if (!b) return;
      var on = S.toggleBookmark(b.dataset.bm);
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
      b.innerHTML = U.icon('bookmark', 14) + (on ? 'Bookmarked' : 'Bookmark');
    });
  }

  App.views.review = { title: 'Review', render: render };
})();
