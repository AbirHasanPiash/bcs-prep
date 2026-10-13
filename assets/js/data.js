/* Indexes over the content in window.BCS, plus question selection for practice and mock tests. */
(function () {
  'use strict';
  var U = App.util, S = App.store, B = window.BCS;

  var all = [], byId = {}, bySubject = {}, byTopic = {};
  var notesByTopic = {};
  var cards = [], cardById = {}, cardsBySubject = {};

  B.subjects.forEach(function (s) {
    bySubject[s.id] = [];
    cardsBySubject[s.id] = [];
    s.topics.forEach(function (t) { byTopic[t.id] = []; });

    (B.questions[s.id] || []).forEach(function (q) {
      // Skip anything malformed so one bad entry can't break the app.
      if (!q || !q.id || byId[q.id] || !byTopic[q.t] || !Array.isArray(q.o) || q.o.length !== 4) return;
      q.s = s.id;
      all.push(q);
      byId[q.id] = q;
      bySubject[s.id].push(q);
      byTopic[q.t].push(q);
    });

    (B.notes[s.id] || []).forEach(function (n) {
      if (n && byTopic[n.t] && !notesByTopic[n.t]) notesByTopic[n.t] = n;
    });

    (B.flashcards[s.id] || []).forEach(function (c) {
      if (!c || !c.id || cardById[c.id] || !byTopic[c.t]) return;
      c.s = s.id;
      cards.push(c);
      cardById[c.id] = c;
      cardsBySubject[s.id].push(c);
    });
  });

  /* ---------- stats ---------- */
  function statsFor(list) {
    var attempted = 0, attempts = 0, correct = 0, mastered = 0, wrongNow = 0;
    list.forEach(function (q) {
      var st = S.qStat(q.id);
      if (!st) return;
      attempted++;
      attempts += st.n;
      correct += st.c;
      if (st.l === 1) mastered++; else wrongNow++;
    });
    return {
      total: list.length, attempted: attempted, attempts: attempts, correct: correct,
      accuracy: attempts ? correct / attempts : null, mastered: mastered, wrongNow: wrongNow
    };
  }
  function subjectStats(sid) { return statsFor(bySubject[sid] || []); }
  function topicStats(tid) { return statsFor(byTopic[tid] || []); }
  function overallStats() { return statsFor(all); }

  function syllabusProgress(sid) {
    var topics = sid ? B.subjectById[sid].topics : Object.keys(B.topicById).map(function (k) { return B.topicById[k]; });
    var done = 0, started = 0;
    topics.forEach(function (t) {
      var st = S.topicStatus(t.id);
      if (st >= 2) done++;
      if (st >= 1) started++;
    });
    return { total: topics.length, done: done, started: started };
  }

  /* Topics with enough attempts, weakest first. */
  function weakTopics(limit, minAttempts) {
    minAttempts = minAttempts || 4;
    var rows = [];
    Object.keys(byTopic).forEach(function (tid) {
      var st = topicStats(tid);
      if (st.attempts >= minAttempts) rows.push({ topic: B.topicById[tid], stats: st });
    });
    rows.sort(function (a, b) { return a.stats.accuracy - b.stats.accuracy; });
    return rows.slice(0, limit || 5);
  }

  /* ---------- selection ---------- */
  function pool(opts) {
    opts = opts || {};
    var list;
    if (opts.qids) list = opts.qids.map(function (id) { return byId[id]; }).filter(Boolean);
    else if (opts.topics && opts.topics.length) list = [].concat.apply([], opts.topics.map(function (t) { return byTopic[t] || []; }));
    else if (opts.subjects && opts.subjects.length) list = [].concat.apply([], opts.subjects.map(function (s) { return bySubject[s] || []; }));
    else list = all.slice();
    var f = opts.filter || 'all';
    if (f === 'new') list = list.filter(function (q) { return !S.qStat(q.id); });
    else if (f === 'wrong') list = list.filter(function (q) { var st = S.qStat(q.id); return st && st.l === 0; });
    else if (f === 'bookmarked') list = list.filter(function (q) { return S.isBookmarked(q.id); });
    else if (f === 'current') list = list.filter(function (q) { return !!q.asOf; }); // time-sensitive facts
    return list;
  }

  /* Unseen questions first (random order), then the ones seen longest ago. */
  function pick(list, n, rand) {
    rand = rand || Math.random;
    var unseen = [], seen = [];
    list.forEach(function (q) { (S.qStat(q.id) ? seen : unseen).push(q); });
    var out = U.shuffle(unseen, rand);
    if (out.length < n) {
      seen = U.shuffle(seen, rand).sort(function (a, b) { return (S.qStat(a.id).t || 0) - (S.qStat(b.id).t || 0); });
      out = out.concat(seen);
    }
    return out.slice(0, n);
  }

  /* Like pick(), but spreads the questions evenly across topics. */
  function pickSpread(list, n, rand) {
    rand = rand || Math.random;
    var groups = {};
    list.forEach(function (q) { (groups[q.t] = groups[q.t] || []).push(q); });
    var queues = U.shuffle(Object.keys(groups), rand).map(function (t) { return pick(groups[t], groups[t].length, rand); });
    var out = [];
    while (out.length < n && queues.some(function (qq) { return qq.length; })) {
      queues.forEach(function (qq) { if (out.length < n && qq.length) out.push(qq.shift()); });
    }
    return U.shuffle(out, rand);
  }

  /* Split a total across weights with the largest-remainder method. */
  function apportion(total, weights) {
    var sum = weights.reduce(function (a, b) { return a + b; }, 0);
    var raw = weights.map(function (w) { return (w * total) / sum; });
    var base = raw.map(Math.floor);
    var left = total - base.reduce(function (a, b) { return a + b; }, 0);
    raw.map(function (r, i) { return { i: i, f: r - Math.floor(r) }; })
      .sort(function (a, b) { return b.f - a.f; })
      .slice(0, left)
      .forEach(function (x) { base[x.i]++; });
    return base;
  }

  var MOCK_TYPES = {
    full: { title: 'Full model test', n: 200, min: 120, blurb: 'The real thing: 200 questions in 2 hours with the official subject distribution.' },
    half: { title: 'Half model test', n: 100, min: 60, blurb: '100 questions in 1 hour, same proportions as the real paper.' },
    quick: { title: 'Quick mock', n: 50, min: 30, blurb: '50 questions in 30 minutes for a weekday check-in.' },
    subject: { title: 'Subject test', n: 0, min: 0, blurb: 'One subject at exam size and exam speed (36 seconds a question).' }
  };

  function subjectPlan(kind, subjectId) {
    if (kind === 'subject') {
      var s = B.subjectById[subjectId];
      var o = {}; o[s.id] = s.marks;
      return o;
    }
    var counts = apportion(MOCK_TYPES[kind].n, B.subjects.map(function (s) { return s.marks; }));
    var plan = {};
    B.subjects.forEach(function (s, i) { plan[s.id] = counts[i]; });
    return plan;
  }

  /* Returns question ids grouped in paper order (subject by subject, language before literature). */
  function buildMock(kind, subjectId) {
    var plan = subjectPlan(kind, subjectId);
    var rand = U.rng(U.hash(U.uid()));
    var qids = [], shortfall = 0;
    B.subjects.forEach(function (s) {
      var need = plan[s.id];
      if (!need) return;
      var chosen = [];
      if (s.groups) {
        var gNeed = apportion(need, s.groups.map(function (g) { return g.share; }));
        s.groups.forEach(function (g, i) {
          var list = bySubject[s.id].filter(function (q) { return B.topicById[q.t].group === g.id; });
          chosen = chosen.concat(pickSpread(list, gNeed[i], rand));
        });
        if (chosen.length < need) { // top up from any group
          var have = {}; chosen.forEach(function (q) { have[q.id] = 1; });
          chosen = chosen.concat(pick(bySubject[s.id].filter(function (q) { return !have[q.id]; }), need - chosen.length, rand));
        }
      } else {
        chosen = pickSpread(bySubject[s.id], need, rand);
      }
      shortfall += need - chosen.length;
      qids = qids.concat(chosen.map(function (q) { return q.id; }));
    });
    return { qids: qids, shortfall: shortfall };
  }

  /* Net marks with negative marking, overall and per subject. */
  function score(qids, answers) {
    var neg = B.exam.negative;
    var res = { correct: 0, wrong: 0, skipped: 0, total: qids.length, net: 0, bySubject: {} };
    qids.forEach(function (id) {
      var q = byId[id];
      if (!q) return;
      var b = res.bySubject[q.s] || (res.bySubject[q.s] = { correct: 0, wrong: 0, skipped: 0, total: 0, net: 0 });
      b.total++;
      var a = answers[id];
      if (a == null) { res.skipped++; b.skipped++; }
      else if (a === q.a) { res.correct++; b.correct++; b.net += 1; }
      else { res.wrong++; b.wrong++; b.net -= neg; }
    });
    res.net = res.correct - res.wrong * neg;
    return res;
  }

  /* ---------- search ---------- */
  var plainCache = {};
  function plainNote(n) {
    if (!plainCache[n.t]) {
      var div = document.createElement('div');
      div.innerHTML = n.html.replace(/<\/(td|th|li|p|h3|h4|tr|div)>|<br\s*\/?>/gi, '$& ');
      plainCache[n.t] = (div.textContent || '').replace(/\s+/g, ' ').trim().normalize('NFC');
    }
    return plainCache[n.t];
  }
  function snippet(text, idx, len) {
    var start = Math.max(0, idx - 60);
    var s = (start ? '…' : '') + text.slice(start, idx + len + 90);
    return s + (idx + len + 90 < text.length ? '…' : '');
  }
  // NFC turns precomposed য়/ড়/ঢ় into base letter + nukta, the form the content is stored in.
  function nfc(s) { return s.normalize ? s.normalize('NFC') : s; }
  function search(query, limit) {
    var q = nfc(String(query || '').trim()).toLowerCase();
    var res = { notes: [], questions: [] };
    if (q.length < 2) return res;
    Object.keys(notesByTopic).forEach(function (tid) {
      var n = notesByTopic[tid];
      var text = plainNote(n);
      var hay = nfc(n.title + ' ' + text).toLowerCase();
      var i = hay.indexOf(q);
      if (i >= 0) {
        var ti = nfc(text).toLowerCase().indexOf(q);
        res.notes.push({ note: n, topic: B.topicById[tid], snippet: ti >= 0 ? snippet(text, ti, q.length) : text.slice(0, 150) + '…' });
      }
    });
    for (var i = 0; i < all.length && res.questions.length < (limit || 60); i++) {
      var qq = all[i];
      var hay = nfc(qq.q + ' ' + qq.o.join(' ') + ' ' + qq.e).toLowerCase();
      if (hay.indexOf(q) >= 0) res.questions.push(qq);
    }
    return res;
  }

  /* ---------- flashcards (Leitner boxes) ---------- */
  var BOX_DAYS = [0, 0, 1, 3, 7, 15, 30]; // index = box; box 6 counts as mastered
  function cardState(id) { return S.state.cards[id]; }
  function dueCards(sid) {
    var today = U.dayKey();
    return (sid ? cardsBySubject[sid] : cards).filter(function (c) {
      var st = cardState(c.id);
      return st && st.due <= today;
    });
  }
  function newCards(sid) {
    return (sid ? cardsBySubject[sid] : cards).filter(function (c) { return !cardState(c.id); });
  }
  function newCardsLeftToday() {
    var cn = S.state.cardsNew;
    var used = cn.day === U.dayKey() ? cn.n : 0;
    return Math.max(0, S.settings.newCardsPerDay - used);
  }
  function gradeCard(id, knew) {
    var st = S.state.cards[id];
    if (!st) {
      st = S.state.cards[id] = { box: 1, due: U.dayKey(), seen: 0 };
      var cn = S.state.cardsNew;
      if (cn.day !== U.dayKey()) { cn.day = U.dayKey(); cn.n = 0; }
      cn.n++;
    }
    st.seen++;
    st.box = knew ? Math.min(6, st.box + 1) : 1;
    st.due = U.addDays(U.dayKey(), BOX_DAYS[st.box]);
    S.logFlashcard();
    return st;
  }

  App.data = {
    all: all, byId: byId, bySubject: bySubject, byTopic: byTopic, notesByTopic: notesByTopic,
    cards: cards, cardById: cardById, cardsBySubject: cardsBySubject,
    subjectStats: subjectStats, topicStats: topicStats, overallStats: overallStats, statsFor: statsFor,
    syllabusProgress: syllabusProgress, weakTopics: weakTopics,
    pool: pool, pick: pick, pickSpread: pickSpread, apportion: apportion,
    MOCK_TYPES: MOCK_TYPES, subjectPlan: subjectPlan, buildMock: buildMock, score: score,
    search: search, plainNote: plainNote,
    cardState: cardState, dueCards: dueCards, newCards: newCards, newCardsLeftToday: newCardsLeftToday, gradeCard: gradeCard,
    BOX_DAYS: BOX_DAYS
  };
})();
