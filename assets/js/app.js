/* Shell: hash router, navigation, theme, global shortcuts. Loaded last. */
(function () {
  'use strict';
  var U = App.util, S = App.store, D = App.data;
  var $ = U.$;

  var NAV = [
    { id: 'dashboard', href: '#/', label: 'Dashboard', icon: 'home' },
    { id: 'guide', href: '#/guide', label: 'Exam guide', icon: 'guide' },
    { id: 'syllabus', href: '#/syllabus', label: 'Syllabus', icon: 'syllabus' },
    { id: 'notes', href: '#/notes', label: 'Study notes', icon: 'notes' },
    { id: 'practice', href: '#/practice', label: 'Practice', icon: 'practice' },
    { id: 'mock', href: '#/mock', label: 'Mock tests', icon: 'mock' },
    { id: 'flashcards', href: '#/flashcards', label: 'Flashcards', icon: 'cards' },
    { id: 'review', href: '#/review', label: 'Review', icon: 'review' },
    { id: 'planner', href: '#/planner', label: 'Study planner', icon: 'planner' },
    { id: 'settings', href: '#/settings', label: 'Settings', icon: 'settings' }
  ];
  var ROUTES = {
    '': 'dashboard', guide: 'guide', syllabus: 'syllabus', notes: 'notes', practice: 'practice', mock: 'mock',
    flashcards: 'flashcards', review: 'review', planner: 'planner', settings: 'settings', search: 'search'
  };

  var cleanup = null;

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    var qi = h.indexOf('?');
    var path = qi >= 0 ? h.slice(0, qi) : h;
    var query = {};
    if (qi >= 0) {
      h.slice(qi + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        var p = kv.split('=');
        query[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || '').replace(/\+/g, ' '));
      });
    }
    var parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    return { name: ROUTES[parts[0] || ''] || 'notfound', params: parts.slice(1), query: query };
  }

  function renderNav(active) {
    var review = D.pool({ filter: 'wrong' }).length;
    var due = D.dueCards().length;
    $('#nav').innerHTML = NAV.map(function (n) {
      var badge = '';
      if (n.id === 'review' && review) badge = '<span class="nav-badge" title="Questions to re-do">' + review + '</span>';
      if (n.id === 'flashcards' && due) badge = '<span class="nav-badge" title="Cards due today">' + due + '</span>';
      if (n.id === 'mock' && S.state.activeMock) badge = '<span class="nav-badge live" title="A test is in progress">Live</span>';
      return '<a href="' + n.href + '" class="nav-link' + (n.id === active ? ' active' : '') + '"' + (n.id === active ? ' aria-current="page"' : '') + '>' +
        U.icon(n.icon, 19) + '<span>' + n.label + '</span>' + badge + '</a>';
    }).join('');
    renderSidebarFoot();
  }

  function renderSidebarFoot() {
    var st = S.settings;
    var foot = $('#sidebar-foot');
    if (st.examDate) {
      var left = U.daysBetween(U.dayKey(), st.examDate);
      foot.innerHTML = '<a class="countdown-mini" href="#/settings">' +
        '<span class="cd-num">' + (left >= 0 ? left : 0) + '</span>' +
        '<span class="cd-text">' + (left === 1 ? 'day' : 'days') + ' to ' + U.esc(st.examLabel || 'the exam') + '<br><small>' + U.fmtDay(st.examDate) + '</small></span></a>';
    } else {
      foot.innerHTML = '<a class="countdown-mini cd-empty" href="#/settings">' + U.icon('planner', 18) + '<span class="cd-text">Set your exam date<br><small>for a countdown and study plan</small></span></a>';
    }
  }

  function route() {
    var r = parseHash();
    var view = App.views[r.name];
    if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { console.error(e); } }
    cleanup = null;
    closeMenu();
    var main = $('#main');
    main.className = 'page page-' + r.name;
    main.innerHTML = '';
    if (!view) {
      document.title = 'Not found · BCS Prep';
      $('#page-title').textContent = 'Page not found';
      main.innerHTML = '<div class="empty card"><h2>Nothing here</h2><p>That page does not exist.</p><a class="btn btn-primary" href="#/">Go to dashboard</a></div>';
      renderNav('');
      return;
    }
    if (r.name !== 'search') $('#search-input').value = '';
    var title = typeof view.title === 'function' ? view.title(r) : view.title;
    $('#page-title').textContent = title;
    document.title = title + ' · BCS Prep';
    renderNav(view.nav || r.name);
    try {
      cleanup = view.render(main, r.params, r.query);
    } catch (e) {
      console.error(e);
      main.innerHTML = '<div class="empty card"><h2>Something went wrong</h2><p></p><a class="btn btn-ghost" href="#/">Back to dashboard</a></div>';
      main.querySelector('p').textContent = String(e && e.message || e);
    }
    if (!r.query.keepScroll) window.scrollTo(0, 0);
  }

  /* Re-render the current view in place (after a state change) without resetting scroll. */
  App.refresh = function () {
    var y = window.scrollY;
    route();
    window.scrollTo(0, y);
  };
  App.go = function (hash) {
    if (location.hash === hash) App.refresh(); else location.hash = hash;
  };
  App.renderNav = function () { renderNav((App.views[parseHash().name] || {}).nav || parseHash().name); };

  /* ---------- theme ---------- */
  function effectiveTheme() {
    var t = S.settings.theme;
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  App.applyTheme = function () {
    var t = S.settings.theme;
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
    var btn = $('#theme-btn');
    var dark = effectiveTheme() === 'dark';
    U.$$('meta[name="theme-color"]').forEach(function (m) { m.setAttribute('content', dark ? '#0d100f' : '#f4f5f2'); });
    btn.innerHTML = U.icon(dark ? 'sun' : 'moon', 19);
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = btn.getAttribute('aria-label');
  };
  $('#theme-btn').addEventListener('click', function () {
    S.settings.theme = effectiveTheme() === 'dark' ? 'light' : 'dark';
    S.save();
    App.applyTheme();
  });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(App.applyTheme);
  }

  /* ---------- mobile menu ---------- */
  function openMenu() {
    document.body.classList.add('menu-open');
    $('#scrim').hidden = false;
    $('#menu-btn').setAttribute('aria-expanded', 'true');
    $('#sidebar-close').focus({ preventScroll: true });
  }
  function closeMenu() {
    var wasOpen = document.body.classList.contains('menu-open');
    document.body.classList.remove('menu-open');
    $('#scrim').hidden = true;
    $('#menu-btn').setAttribute('aria-expanded', 'false');
    if (wasOpen && $('#sidebar').contains(document.activeElement)) $('#menu-btn').focus();
  }
  $('#menu-btn').innerHTML = U.icon('menu', 20);
  $('#menu-btn').addEventListener('click', function () {
    if (document.body.classList.contains('menu-open')) closeMenu(); else openMenu();
  });
  $('#sidebar-close').innerHTML = U.icon('x', 19);
  $('#sidebar-close').addEventListener('click', closeMenu);
  $('#scrim').addEventListener('click', closeMenu);

  /* ---------- search ---------- */
  $('.search-icon').innerHTML = U.icon('search', 17);
  // The full placeholder gets cut off on phones.
  if (window.matchMedia) {
    var narrow = window.matchMedia('(max-width: 480px)');
    var setPlaceholder = function () { $('#search-input').placeholder = narrow.matches ? 'Search' : 'Search notes & questions'; };
    setPlaceholder();
    (narrow.addEventListener ? narrow.addEventListener.bind(narrow, 'change') : narrow.addListener.bind(narrow))(setPlaceholder);
  }
  $('#search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = $('#search-input').value.trim();
    if (q) App.go('#/search?q=' + encodeURIComponent(q));
  });
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      $('#search-input').focus();
    }
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) closeMenu();
  });

  /* ---------- boot ---------- */
  App.applyTheme();
  window.addEventListener('hashchange', route);
  if (!S.available) {
    setTimeout(function () { U.toast('Browser storage is blocked, so progress will not be saved in this window.', 'warn'); }, 600);
  }
  route();
})();
