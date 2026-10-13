/* Small dependency-free SVG charts. Colors come from CSS custom properties so light/dark themes just work. */
(function () {
  'use strict';
  var U = App.util;
  var NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(el);
    return el;
  }

  function makeTooltip(host) {
    var tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.hidden = true;
    host.appendChild(tip);
    return {
      show: function (lines, x, y) {
        tip.textContent = '';
        lines.forEach(function (l, i) {
          var row = document.createElement('div');
          row.className = i === 0 ? 'tip-value' : 'tip-label';
          row.textContent = l;
          tip.appendChild(row);
        });
        tip.hidden = false;
        var hw = host.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
        var left = Math.min(Math.max(4, x - tw / 2), hw - tw - 4);
        var top = y - th - 12;
        if (top < 0) top = y + 14;
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
      },
      hide: function () { tip.hidden = true; }
    };
  }

  function observe(el, render) {
    render();
    if ('ResizeObserver' in window) {
      var last = el.clientWidth;
      var ro = new ResizeObserver(function () {
        if (Math.abs(el.clientWidth - last) > 4) { last = el.clientWidth; render(); }
      });
      ro.observe(el);
      return function () { ro.disconnect(); };
    }
    return function () {};
  }

  /*
   * Line chart, one series on a 0..yMax scale.
   * opts.points: [{ label: 'x-axis text', y: number, tip: ['value line', 'label line', ...] }]
   * opts.target: optional reference value drawn as a labelled threshold line.
   */
  function line(host, opts) {
    host.classList.add('chart');
    var yMax = opts.yMax || 100;
    var H = opts.height || 220;
    var pad = { t: 16, r: 64, b: 30, l: 40 };

    return observe(host, function render() {
      host.textContent = '';
      var W = Math.max(200, host.clientWidth);
      var pts = opts.points;
      var svg = svgEl('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': opts.ariaLabel || 'Line chart' }, host);
      var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
      var x = function (i) { return pad.l + (pts.length === 1 ? iw / 2 : (i * iw) / (pts.length - 1)); };
      var y = function (v) { return pad.t + ih - (U.clamp(v, 0, yMax) / yMax) * ih; };

      // grid + y ticks
      var ticks = opts.ticks || [0, 25, 50, 75, 100];
      ticks.forEach(function (t) {
        svgEl('line', { x1: pad.l, x2: W - pad.r, y1: y(t), y2: y(t), class: t === 0 ? 'axis-line' : 'grid-line' }, svg);
        var lab = svgEl('text', { x: pad.l - 8, y: y(t) + 4, class: 'axis-text', 'text-anchor': 'end' }, svg);
        lab.textContent = (opts.yFormat || String)(t);
      });

      // x labels: first, last and a middle one when there is room
      var xi = pts.length > 2 && iw > 360 ? [0, Math.floor((pts.length - 1) / 2), pts.length - 1] : (pts.length > 1 ? [0, pts.length - 1] : [0]);
      xi.forEach(function (i, k) {
        var anchor = pts.length === 1 ? 'middle' : k === 0 ? 'start' : k === xi.length - 1 ? 'end' : 'middle';
        var t = svgEl('text', { x: x(i), y: H - 8, class: 'axis-text', 'text-anchor': anchor }, svg);
        t.textContent = pts[i].label;
      });

      // target threshold
      if (opts.target != null) {
        svgEl('line', { x1: pad.l, x2: W - pad.r, y1: y(opts.target), y2: y(opts.target), class: 'target-line' }, svg);
        var tl = svgEl('text', { x: W - pad.r + 6, y: y(opts.target) + 4, class: 'axis-text target-text' }, svg);
        tl.textContent = opts.targetLabel || 'Target';
      }

      // area wash + line
      if (pts.length > 1) {
        var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.y).toFixed(1); }).join(' ');
        svgEl('path', { d: d + ' L' + x(pts.length - 1).toFixed(1) + ' ' + y(0) + ' L' + x(0).toFixed(1) + ' ' + y(0) + ' Z', class: 'series-area' }, svg);
        svgEl('path', { d: d, class: 'series-line' }, svg);
      }
      // markers (only when sparse enough to read) + end marker
      pts.forEach(function (p, i) {
        if (pts.length <= 24 || i === pts.length - 1) svgEl('circle', { cx: x(i), cy: y(p.y), r: 4, class: 'series-dot' }, svg);
      });
      // direct label on the last point
      var last = pts[pts.length - 1];
      var el = svgEl('text', { x: x(pts.length - 1) + 9, y: y(last.y) + 4, class: 'end-label' }, svg);
      el.textContent = (opts.yFormat || String)(Math.round(last.y));

      // crosshair + tooltip (pointer and keyboard)
      var cross = svgEl('line', { x1: 0, x2: 0, y1: pad.t, y2: pad.t + ih, class: 'crosshair', visibility: 'hidden' }, svg);
      var focusDot = svgEl('circle', { cx: 0, cy: 0, r: 5, class: 'series-dot focus-dot', visibility: 'hidden' }, svg);
      var tip = makeTooltip(host);
      var cur = -1;
      function showAt(i) {
        cur = i;
        var px = x(i), py = y(pts[i].y);
        cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.setAttribute('visibility', 'visible');
        focusDot.setAttribute('cx', px); focusDot.setAttribute('cy', py); focusDot.setAttribute('visibility', 'visible');
        tip.show(pts[i].tip, px, py);
      }
      function hide() { cur = -1; cross.setAttribute('visibility', 'hidden'); focusDot.setAttribute('visibility', 'hidden'); tip.hide(); }
      svg.addEventListener('pointermove', function (e) {
        var r = svg.getBoundingClientRect();
        var mx = e.clientX - r.left;
        var i = pts.length === 1 ? 0 : Math.round(((mx - pad.l) / iw) * (pts.length - 1));
        showAt(U.clamp(i, 0, pts.length - 1));
      });
      svg.addEventListener('pointerleave', hide);
      svg.setAttribute('tabindex', '0');
      svg.addEventListener('focus', function () { showAt(pts.length - 1); });
      svg.addEventListener('blur', hide);
      svg.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); showAt(Math.max(0, (cur < 0 ? pts.length : cur) - 1)); }
        if (e.key === 'ArrowRight') { e.preventDefault(); showAt(Math.min(pts.length - 1, cur + 1)); }
      });
    });
  }

  /*
   * Activity calendar: one cell per day for the last `weeks` weeks, darker = more study.
   * opts.value(dayKey) -> number, opts.levels: thresholds for steps 1..4, opts.tip(dayKey) -> lines
   */
  function heatmap(host, opts) {
    host.classList.add('chart');
    var weeks = opts.weeks || 18;
    return observe(host, function render() {
      host.textContent = '';
      var today = U.dayKey();
      var labelW = 30, top = 18, gap = 3;
      var W = host.clientWidth;
      var fit = Math.max(4, Math.floor((W - labelW) / (9 + gap)) - 1); // weeks that fit at the smallest cell size
      var shown = Math.min(weeks, fit);
      var start = U.addDays(today, -(shown * 7 - 1));
      start = U.addDays(start, -U.parseDay(start).getDay()); // align to Sunday
      var cols = Math.ceil((U.daysBetween(start, today) + 1) / 7);
      var cell = Math.max(9, Math.min(16, Math.floor((W - labelW) / cols) - gap));
      var w = labelW + cols * (cell + gap), h = top + 7 * (cell + gap);
      var svg = svgEl('svg', { width: w, height: h, viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': opts.ariaLabel || 'Study activity calendar' }, host);
      ['Mon', 'Wed', 'Fri'].forEach(function (d, i) {
        var t = svgEl('text', { x: 0, y: top + (i * 2 + 1) * (cell + gap) + cell - 2, class: 'axis-text' }, svg);
        t.textContent = d;
      });
      var tip = makeTooltip(host);
      var lastMonth = -1;
      for (var c = 0; c < cols; c++) {
        for (var r = 0; r < 7; r++) {
          var day = U.addDays(start, c * 7 + r);
          if (day > today) continue;
          var d = U.parseDay(day);
          if (r === 0 && d.getMonth() !== lastMonth && d.getDate() <= 7) {
            lastMonth = d.getMonth();
            var ml = svgEl('text', { x: labelW + c * (cell + gap), y: 11, class: 'axis-text' }, svg);
            ml.textContent = U.MONTHS[d.getMonth()];
          }
          var v = opts.value(day);
          var lvl = 0;
          (opts.levels || [1, 10, 25, 40]).forEach(function (th, i) { if (v >= th) lvl = i + 1; });
          var rect = svgEl('rect', {
            x: labelW + c * (cell + gap), y: top + r * (cell + gap), width: cell, height: cell, rx: 2.5,
            class: 'heat heat-' + lvl + (day === today ? ' heat-today' : '')
          }, svg);
          rect.dataset.day = day;
        }
      }
      svg.addEventListener('pointermove', function (e) {
        var t = e.target;
        if (!t.dataset || !t.dataset.day) { tip.hide(); return; }
        var hr = host.getBoundingClientRect(), rr = t.getBoundingClientRect();
        tip.show(opts.tip(t.dataset.day), rr.left - hr.left + rr.width / 2, rr.top - hr.top);
      });
      svg.addEventListener('pointerleave', function () { tip.hide(); });
    });
  }

  App.charts = { line: line, heatmap: heatmap };
})();
