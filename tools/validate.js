#!/usr/bin/env node
/*
 * Content validator for the BCS prep site.
 *
 *   node tools/validate.js                 # validate every subject
 *   node tools/validate.js bangla math     # validate only these subjects
 *   node tools/validate.js --quiet         # errors only, no per-topic table
 *
 * Loads the data files exactly the way the browser does (plain scripts that call
 * BCS.addQuestions / addNotes / addFlashcards) and checks them against the schema
 * described in docs/CONTENT_GUIDE.md. Exits with code 1 when any error is found.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const keyCheck = args.includes('--keys'); // heuristic: explanation names a wrong option but not the keyed one
const only = args.filter((a) => !a.startsWith('--'));

const ctx = vm.createContext({ console });
function load(file) {
  const code = fs.readFileSync(file, 'utf8');
  vm.runInContext(code, ctx, { filename: path.relative(ROOT, file) });
}

let errors = 0;
let warnings = 0;
const err = (where, msg) => { errors++; console.log('  ERROR  ' + where + ': ' + msg); };
const warn = (where, msg) => { warnings++; console.log('  warn   ' + where + ': ' + msg); };

load(path.join(DATA, '_registry.js'));
load(path.join(DATA, 'syllabus.js'));
const BCS = ctx.BCS;

const subjects = BCS.subjects.filter((s) => !only.length || only.includes(s.id));
if (only.length && subjects.length !== only.length) {
  const known = BCS.subjects.map((s) => s.id).join(', ');
  console.log('Unknown subject in: ' + only.join(', ') + '\nKnown subjects: ' + known);
  process.exit(1);
}

// Load content files. A file that throws is reported and skipped.
for (const kind of ['questions', 'notes', 'flashcards']) {
  for (const s of subjects) {
    const file = path.join(DATA, kind, s.id + '.js');
    if (!fs.existsSync(file)) continue;
    try {
      load(file);
    } catch (e) {
      err(path.relative(ROOT, file), 'failed to load: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e));
    }
  }
}

const HTML_IN_TEXT = /<\/?[a-zA-Z][^>]*>/;
const ALLOWED_TAGS = new Set(['h3', 'h4', 'p', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'strong', 'b', 'em', 'i', 'mark', 'br', 'blockquote', 'div', 'span', 'small', 'sup', 'sub', 'code', 'hr']);
const VOID_TAGS = new Set(['br', 'hr']);
const ALLOWED_ATTRS = new Set(['class', 'colspan', 'rowspan']);

function checkHtml(where, html) {
  const stack = [];
  const re = /<(\/?)([a-zA-Z0-9]+)([^>]*)>/g;
  let m;
  while ((m = re.exec(html))) {
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const attrs = m[3];
    if (!ALLOWED_TAGS.has(tag)) { err(where, 'tag <' + tag + '> is not allowed'); continue; }
    if (!closing) {
      const attrRe = /([a-zA-Z-:]+)\s*=/g;
      let a;
      while ((a = attrRe.exec(attrs))) {
        if (!ALLOWED_ATTRS.has(a[1].toLowerCase())) err(where, 'attribute "' + a[1] + '" is not allowed on <' + tag + '>');
      }
      if (!VOID_TAGS.has(tag) && !/\/\s*$/.test(attrs)) stack.push(tag);
    } else if (!VOID_TAGS.has(tag)) {
      const top = stack.pop();
      if (top !== tag) { err(where, 'mismatched </' + tag + '> (expected </' + (top || 'nothing') + '>)'); return; }
    }
  }
  if (stack.length) err(where, 'unclosed tag(s): ' + stack.join(', '));
}

const norm = (s) => String(s).replace(/\s+/g, ' ').trim().toLowerCase();
const seenIds = new Set();
const seenCardIds = new Set();
const report = [];

for (const s of subjects) {
  const where = 'questions/' + s.id;
  const qs = BCS.questions[s.id] || [];
  const topicIds = new Set(s.topics.map((t) => t.id));
  const perTopic = Object.fromEntries(s.topics.map((t) => [t.id, 0]));
  const answerPos = [0, 0, 0, 0];
  const seenText = new Map();
  const idRe = new RegExp('^' + s.prefix + '-\\d{4}$');

  qs.forEach((q, i) => {
    const w = where + '[' + i + ']' + (q && q.id ? ' ' + q.id : '');
    if (!q || typeof q !== 'object') { err(w, 'not an object'); return; }
    const allowedKeys = ['id', 't', 'q', 'o', 'a', 'e', 'd', 'asOf'];
    Object.keys(q).forEach((k) => { if (!allowedKeys.includes(k)) err(w, 'unknown key "' + k + '"'); });
    if (typeof q.id !== 'string' || !idRe.test(q.id)) err(w, 'id must look like "' + s.prefix + '-0001"');
    else if (seenIds.has(q.id)) err(w, 'duplicate id');
    else seenIds.add(q.id);
    if (!topicIds.has(q.t)) err(w, 'unknown topic "' + q.t + '"');
    else perTopic[q.t]++;
    if (typeof q.q !== 'string' || !q.q.trim()) err(w, 'q (question text) missing');
    if (!Array.isArray(q.o) || q.o.length !== 4) err(w, 'o must have exactly 4 options');
    else {
      q.o.forEach((opt, j) => { if (typeof opt !== 'string' || !String(opt).trim()) err(w, 'option ' + j + ' empty'); });
      const uniq = new Set(q.o.map(norm));
      if (uniq.size !== 4) err(w, 'options are not distinct');
    }
    if (!Number.isInteger(q.a) || q.a < 0 || q.a > 3) err(w, 'a must be an integer 0-3');
    else answerPos[q.a]++;
    if (typeof q.e !== 'string' || !q.e.trim()) err(w, 'e (explanation) missing');
    if (q.d !== undefined && ![1, 2, 3].includes(q.d)) err(w, 'd must be 1, 2 or 3');
    if (q.asOf !== undefined && !/^\d{4}-\d{2}$/.test(q.asOf)) err(w, 'asOf must look like "2026-10"');
    [q.q, q.e].concat(q.o || []).forEach((txt) => {
      if (typeof txt === 'string' && HTML_IN_TEXT.test(txt)) err(w, 'HTML tags are not allowed in questions/options/explanations');
    });
    if (typeof q.q === 'string') {
      const key = norm(q.q) + '||' + (Array.isArray(q.o) ? q.o.map(norm).sort().join('|') : '');
      if (seenText.has(key)) warn(w, 'same question and options as ' + seenText.get(key));
      else seenText.set(key, q.id);
    }
    // Calculation subjects are skipped: their working naturally mentions other numbers.
    // "Which is NOT …" questions are skipped too: their explanation lists the other options by design.
    const negative = typeof q.q === 'string' && /নেই|নয়|নহে|ব্যতীত|ছাড়া|বেমানান|\bnot\b|\bexcept\b|odd one/i.test(q.q);
    if (keyCheck && !negative && !['math', 'mental'].includes(s.id) && Array.isArray(q.o) && q.o.length === 4 && Number.isInteger(q.a) && typeof q.e === 'string') {
      const e = norm(q.e);
      const right = norm(q.o[q.a]);
      const words = right.split(/[\s,;:()'"‘’“”.\-–—/]+/).filter((wd) => wd.length >= 3);
      const mentionsRight = e.includes(right) || words.some((wd) => e.includes(wd));
      const named = q.o.map(norm).filter((x, j) => j !== q.a && x.length >= 4 && e.includes(x) && !right.includes(x));
      if (!mentionsRight && named.length) {
        console.log('  check  ' + q.id + ': keyed "' + q.o[q.a] + '" but explanation names "' + named.join('", "') + '"\n         Q: ' + q.q.slice(0, 120));
      }
    }
  });

  // Notes
  const notes = BCS.notes[s.id] || [];
  const noteTopics = new Set();
  notes.forEach((n, i) => {
    const w = 'notes/' + s.id + '[' + i + ']' + (n && n.t ? ' ' + n.t : '');
    if (!n || typeof n !== 'object') { err(w, 'not an object'); return; }
    Object.keys(n).forEach((k) => { if (!['t', 'title', 'html'].includes(k)) err(w, 'unknown key "' + k + '"'); });
    if (!topicIds.has(n.t)) err(w, 'unknown topic "' + n.t + '"');
    else if (noteTopics.has(n.t)) err(w, 'more than one note for this topic (merge them)');
    else noteTopics.add(n.t);
    if (typeof n.title !== 'string' || !n.title.trim()) err(w, 'title missing');
    if (typeof n.html !== 'string' || n.html.trim().length < 200) err(w, 'html missing or too short');
    else checkHtml(w, n.html);
  });

  // Flashcards
  const cards = BCS.flashcards[s.id] || [];
  const cardRe = new RegExp('^' + s.prefix + '-f\\d{3,4}$');
  cards.forEach((c, i) => {
    const w = 'flashcards/' + s.id + '[' + i + ']' + (c && c.id ? ' ' + c.id : '');
    if (!c || typeof c !== 'object') { err(w, 'not an object'); return; }
    Object.keys(c).forEach((k) => { if (!['id', 't', 'f', 'b'].includes(k)) err(w, 'unknown key "' + k + '"'); });
    if (typeof c.id !== 'string' || !cardRe.test(c.id)) err(w, 'id must look like "' + s.prefix + '-f001"');
    else if (seenCardIds.has(c.id)) err(w, 'duplicate id');
    else seenCardIds.add(c.id);
    if (!topicIds.has(c.t)) err(w, 'unknown topic "' + c.t + '"');
    if (typeof c.f !== 'string' || !c.f.trim()) err(w, 'f (front) missing');
    if (typeof c.b !== 'string' || !c.b.trim()) err(w, 'b (back) missing');
    [c.f, c.b].forEach((txt) => { if (typeof txt === 'string' && HTML_IN_TEXT.test(txt)) err(w, 'HTML tags are not allowed in flashcards'); });
  });

  const missingNotes = s.topics.filter((t) => !noteTopics.has(t.id)).map((t) => t.id);
  if (notes.length && missingNotes.length) warn('notes/' + s.id, 'no note yet for: ' + missingNotes.join(', '));

  report.push({ s, qs: qs.length, notes: notes.length, cards: cards.length, perTopic, answerPos });
}

console.log('');
for (const r of report) {
  const pct = r.answerPos.map((n) => (r.qs ? Math.round((n / r.qs) * 100) : 0) + '%').join(' / ');
  console.log(r.s.id.padEnd(14) + String(r.qs).padStart(5) + ' questions  ' + String(r.notes).padStart(3) + ' notes  ' +
    String(r.cards).padStart(4) + ' flashcards   answer A/B/C/D: ' + pct);
  if (!quiet) {
    r.s.topics.forEach((t) => {
      const n = r.perTopic[t.id];
      console.log('    ' + t.id.padEnd(22) + String(n).padStart(4) + (n === 0 && r.qs ? '   <- no questions' : ''));
    });
  }
}
console.log('\n' + errors + ' error(s), ' + warnings + ' warning(s)');
process.exit(errors ? 1 : 0);
