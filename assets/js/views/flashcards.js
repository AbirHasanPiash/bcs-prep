/* Flashcards with Leitner spaced repetition: known cards come back after 1, 3, 7, 15 and 30 days; missed cards start over. */
(function () {
  'use strict';
  var U = App.util, S = App.store, D = App.data, UI = App.ui, B = window.BCS;
  var esc = U.esc;
  var session = null;

  function deckStats(sid) {
    var list = sid ? D.cardsBySubject[sid] : D.cards;
    var today = U.dayKey(), due = 0, fresh = 0, mastered = 0, learning = 0;
    list.forEach(function (c) {
      var st = D.cardState(c.id);
      if (!st) { fresh++; return; }
      if (st.due <= today) due++;
      if (st.box >= 6) mastered++; else learning++;
    });
    return { total: list.length, due: due, fresh: fresh, mastered: mastered, learning: learning };
  }

  function buildQueue(sid, extraNew) {
    var due = U.shuffle(D.dueCards(sid));
    var newAllowed = extraNew != null ? extraNew : D.newCardsLeftToday();
    // Take new cards in syllabus order so related facts come together.
    var fresh = D.newCards(sid).slice(0, newAllowed);
    return due.concat(fresh).map(function (c) { return c.id; });
  }

  function renderHome(root) {
    var all = deckStats();
    var newToday = Math.min(D.newCardsLeftToday(), all.fresh);
    root.innerHTML =
      '<div class="grid cols-4 section">' +
        UI.stat('Due for review', all.due, 'Cards whose review date has come', 'review') +
        UI.stat('New today', newToday, 'Daily limit ' + S.settings.newCardsPerDay + ' (change in Settings)', 'spark') +
        UI.stat('Learning', all.learning, 'Seen, not yet mastered', 'layers') +
        UI.stat('Mastered', all.mastered, 'Known 5 times in a row, reviewed monthly', 'trophy') +
      '</div>' +
      '<div class="card highlight section"><div class="row wrap">' +
        '<div style="flex:1;min-width:240px"><h2 style="font-size:18px">Today\'s review</h2><p class="dim small mb-0">' +
          (all.due + newToday ? all.due + ' due + ' + newToday + ' new cards across all subjects. About ' + Math.max(1, Math.round((all.due + newToday) * 8 / 60)) + ' minutes.' : 'You are all caught up. Come back tomorrow, or learn extra cards from a subject below.') + '</p></div>' +
        '<a class="btn btn-primary btn-lg' + (all.due + newToday ? '' : '" aria-disabled="true" tabindex="-1') + '" href="#/flashcards/study">' + U.icon('play', 18) + 'Start review</a>' +
      '</div></div>' +
      '<div class="section"><div class="section-h"><div><h2>Decks</h2><p>One deck per subject. A card you know moves up a box and comes back later; one you miss starts again at box 1.</p></div></div>' +
      '<div class="grid auto-fill">' + B.subjects.map(function (s) {
        var st = deckStats(s.id);
        return '<div class="card"><div class="subject-tile">' + UI.mono(s) + '<div style="flex:1;min-width:0"><div class="t">' + UI.subjectName(s) + '</div><div class="s">' + esc(s.en) + '</div></div></div>' +
          '<div class="row wrap mt-16"><span class="badge badge-warn">' + st.due + ' due</span><span class="badge">' + st.fresh + ' new</span><span class="badge badge-good">' + st.mastered + ' mastered</span></div>' +
          '<div class="mt-8">' + UI.meterRow(st.mastered, st.total, st.total ? Math.round(st.mastered / st.total * 100) + '%' : '–') + '</div>' +
          '<div class="row wrap mt-8">' +
            '<a class="btn btn-soft btn-sm" href="#/flashcards/study?s=' + s.id + '"' + (st.total ? '' : ' aria-disabled="true"') + '>Study</a>' +
            (st.fresh ? '<a class="btn btn-ghost btn-sm" href="#/flashcards/study?s=' + s.id + '&extra=10">+10 new</a>' : '') +
          '</div></div>';
      }).join('') + '</div></div>';
  }

  function renderStudy(root, query) {
    var sid = query.s && B.subjectById[query.s] ? query.s : null;
    var key = (sid || 'all') + '|' + (query.extra || '');
    if (!session || session.key !== key || session.done) {
      session = { key: key, sid: sid, queue: buildQueue(sid, query.extra ? +query.extra : null), pos: 0, knew: 0, again: 0, flipped: false, repeats: {}, done: false };
    }
    var keyHandler = null;

    function draw() {
      var name = sid ? B.subjectById[sid].en : 'All subjects';
      if (session.pos >= session.queue.length) {
        session.done = session.queue.length > 0;
        var total = session.knew + session.again;
        root.innerHTML = '<div class="flash-stage stack">' +
          '<div class="card empty"><h2>' + (total ? 'Session complete' : 'Nothing to review right now') + '</h2>' +
          '<p>' + (total ? 'You reviewed ' + total + ' card' + (total > 1 ? 's' : '') + ' and knew ' + U.pct(session.knew, total) + '% of them.' : 'No cards are due and today\'s new-card limit is used up.') + '</p>' +
          '<div class="row wrap" style="justify-content:center">' +
            (D.newCards(sid).length ? '<a class="btn btn-primary" href="#/flashcards/study?' + (sid ? 's=' + sid + '&' : '') + 'extra=10">Learn 10 more new cards</a>' : '') +
            '<a class="btn btn-ghost" href="#/flashcards">All decks</a></div></div></div>';
        App.renderNav();
        return;
      }
      var c = D.cardById[session.queue[session.pos]];
      var st = D.cardState(c.id);
      var lng = c.s === 'english' ? 'en' : 'bn';
      var left = session.queue.length - session.pos;
      root.innerHTML = '<div class="flash-stage">' +
        '<div class="row wrap mb-16"><strong>' + esc(name) + '</strong><span class="muted small">' + left + ' card' + (left > 1 ? 's' : '') + ' left</span>' +
          '<span class="badge badge-good">' + session.knew + ' knew</span><span class="badge badge-bad">' + session.again + ' again</span><span class="spacer"></span>' +
          '<a class="btn btn-ghost btn-sm" href="#/flashcards">End</a></div>' +
        UI.meter(session.pos, session.queue.length) +
        '<div class="flash mt-16' + (session.flipped ? ' flipped' : '') + '" id="flash" tabindex="0" role="button" aria-label="Flashcard. Press space to flip.">' +
          '<div class="flash-inner">' +
            '<div class="flash-face flash-front"><span class="side">' + (st ? 'Review · box ' + st.box : 'New card') + '</span><span class="topic" lang="' + lng + '">' + esc(B.topicById[c.t].bn) + '</span>' +
              '<div class="txt" lang="' + lng + '">' + esc(c.f) + '</div><div class="small muted"><span class="hint-pointer">Click or press Space to see the answer</span><span class="hint-touch">Tap the card to see the answer</span></div></div>' +
            '<div class="flash-face flash-back"><span class="side">Answer</span><span class="topic" lang="' + lng + '">' + esc(B.topicById[c.t].bn) + '</span>' +
              '<div class="txt" lang="' + lng + '">' + esc(c.b) + '</div></div>' +
          '</div></div>' +
        '<div class="flash-actions"' + (session.flipped ? '' : ' hidden') + ' id="grade">' +
          '<button type="button" class="btn btn-ghost btn-lg" data-g="0">' + U.icon('refresh', 18) + 'Didn\'t know <kbd>1</kbd></button>' +
          '<button type="button" class="btn btn-primary btn-lg" data-g="1">' + U.icon('check', 18) + 'Knew it <kbd>2</kbd></button>' +
        '</div>' +
        (session.flipped ? '<p class="shortcut-hint">Be honest. A card you knew comes back in ' + D.BOX_DAYS[Math.min(6, (st ? st.box : 1) + 1)] + ' day(s).</p>' : '<p class="shortcut-hint kbd-hint"><kbd>Space</kbd> to flip</p>') +
        '</div>';
      var flash = U.$('#flash', root);
      flash.addEventListener('click', flip);
      U.$('#grade', root).addEventListener('click', function (e) {
        var b = e.target.closest('[data-g]');
        if (b) grade(b.dataset.g === '1');
      });
      if (!session.flipped) flash.focus({ preventScroll: true });
    }

    function flip() {
      session.flipped = !session.flipped;
      draw();
      if (session.flipped) { var kb = U.$('[data-g="1"]', root); if (kb) kb.focus({ preventScroll: true }); }
    }

    function grade(knew) {
      var id = session.queue[session.pos];
      D.gradeCard(id, knew);
      if (knew) session.knew++;
      else {
        session.again++;
        session.repeats[id] = (session.repeats[id] || 0) + 1;
        if (session.repeats[id] <= 3) { // show it again a few cards later
          var at = Math.min(session.queue.length, session.pos + 4);
          session.queue.splice(at, 0, id);
        }
      }
      session.pos++;
      session.flipped = false;
      draw();
    }

    keyHandler = function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (session.pos >= session.queue.length) return;
      if (e.key === ' ' || (e.key === 'Enter' && !session.flipped)) { e.preventDefault(); flip(); }
      else if (session.flipped && e.key === '1') { e.preventDefault(); grade(false); }
      else if (session.flipped && e.key === '2') { e.preventDefault(); grade(true); }
    };
    document.addEventListener('keydown', keyHandler);
    draw();
    return function () { document.removeEventListener('keydown', keyHandler); };
  }

  App.views.flashcards = {
    title: function (r) { return r.params[0] === 'study' ? 'Flashcard review' : 'Flashcards'; },
    render: function (root, params, query) {
      if (params[0] === 'study') return renderStudy(root, query);
      return renderHome(root);
    }
  };
})();
