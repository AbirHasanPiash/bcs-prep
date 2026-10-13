/* Persistent progress, kept in localStorage under one key so it can be exported and imported as a single file. */
(function () {
  'use strict';
  var U = App.util;
  var KEY = 'bcsprep:v1';

  function defaults() {
    return {
      version: 1,
      createdAt: Date.now(),
      settings: {
        name: '',
        examDate: '',            // YYYY-MM-DD, set by the user once the circular is out
        examLabel: 'Next general BCS (52nd)',
        dailyGoal: 40,           // questions per day
        newCardsPerDay: 20,
        theme: 'system',         // system | light | dark
        targetPct: 60,           // mock-test target, % of total marks
        lockAnswers: false       // OMR-style: an answer can't be changed in mock tests
      },
      topics: {},      // topicId -> 0 not started, 1 studying, 2 done, 3 revised
      notesRead: {},   // topicId -> timestamp
      myNotes: {},     // topicId -> text the user typed
      q: {},           // questionId -> { n: attempts, c: correct, l: last result 1/0, la: last answer, t: timestamp }
      bookmarks: {},   // questionId -> timestamp
      activity: {},    // YYYY-MM-DD -> { q, c, f, n, m }
      mocks: [],       // finished mock tests (newest last)
      activeMock: null,
      cards: {},       // cardId -> { box: 1..6, due: YYYY-MM-DD, seen }
      cardsNew: { day: '', n: 0 },
      plan: null
    };
  }

  var available = true;
  var state = defaults();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) state = merge(defaults(), JSON.parse(raw));
    } catch (e) {
      available = false;
    }
    return state;
  }

  function merge(base, saved) {
    if (!saved || typeof saved !== 'object') return base;
    Object.keys(saved).forEach(function (k) {
      if (k === 'settings') base.settings = Object.assign(base.settings, saved.settings || {});
      else base[k] = saved[k];
    });
    return base;
  }

  function saveNow() {
    if (!available) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      available = false;
      U.toast('Could not save progress: browser storage is full or blocked.', 'bad');
    }
  }
  var save = U.debounce(saveNow, 250);
  window.addEventListener('beforeunload', saveNow);
  document.addEventListener('visibilitychange', function () { if (document.hidden) saveNow(); });

  function act(field, n) {
    var k = U.dayKey();
    var d = state.activity[k] || (state.activity[k] = { q: 0, c: 0, f: 0, n: 0, m: 0 });
    d[field] = (d[field] || 0) + (n == null ? 1 : n);
  }

  var Store = {
    get state() { return state; },
    get settings() { return state.settings; },
    get available() { return available; },
    load: load,
    save: save,
    saveNow: saveNow,

    recordAnswer: function (qid, choice, correct) {
      var s = state.q[qid] || (state.q[qid] = { n: 0, c: 0 });
      s.n++;
      if (correct) s.c++;
      s.l = correct ? 1 : 0;
      s.la = choice;
      s.t = Date.now();
      act('q');
      if (correct) act('c');
      save();
    },
    qStat: function (qid) { return state.q[qid]; },

    isBookmarked: function (qid) { return !!state.bookmarks[qid]; },
    toggleBookmark: function (qid) {
      if (state.bookmarks[qid]) delete state.bookmarks[qid];
      else state.bookmarks[qid] = Date.now();
      save();
      return !!state.bookmarks[qid];
    },

    topicStatus: function (id) { return state.topics[id] || 0; },
    setTopicStatus: function (id, st) {
      if (st) state.topics[id] = st; else delete state.topics[id];
      save();
    },

    isNoteRead: function (id) { return !!state.notesRead[id]; },
    setNoteRead: function (id, read) {
      if (read) { if (!state.notesRead[id]) act('n'); state.notesRead[id] = Date.now(); }
      else delete state.notesRead[id];
      save();
    },
    myNote: function (id) { return state.myNotes[id] || ''; },
    setMyNote: function (id, text) {
      if (text && text.trim()) state.myNotes[id] = text; else delete state.myNotes[id];
      save();
    },

    logFlashcard: function () { act('f'); save(); },
    logMock: function () { act('m'); save(); },

    today: function () { return state.activity[U.dayKey()] || { q: 0, c: 0, f: 0, n: 0, m: 0 }; },

    /* Consecutive days with any study activity, ending today (or yesterday if today is still empty). */
    streak: function () {
      var day = U.dayKey();
      var has = function (k) { var d = state.activity[k]; return d && (d.q || d.f || d.n || d.m); };
      if (!has(day)) day = U.addDays(day, -1);
      var n = 0;
      while (has(day)) { n++; day = U.addDays(day, -1); }
      return n;
    },

    exportJSON: function () {
      return JSON.stringify({ app: 'bcs-prep', exportedAt: new Date().toISOString(), data: state }, null, 1);
    },
    importJSON: function (text) {
      var parsed = JSON.parse(text);
      var data = parsed && parsed.app === 'bcs-prep' ? parsed.data : parsed;
      if (!data || typeof data !== 'object' || !data.settings || !data.q) throw new Error('This file is not a BCS Prep backup.');
      state = merge(defaults(), data);
      saveNow();
    },
    reset: function () {
      var keepTheme = state.settings.theme;
      state = defaults();
      state.settings.theme = keepTheme;
      saveNow();
    }
  };

  App.store = Store;
  load();
})();
