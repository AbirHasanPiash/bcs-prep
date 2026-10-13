# Content guide

How questions, notes and flashcards are stored, and the rules they follow. Read this before adding or editing anything in `data/`.

After any change, run:

```bash
node tools/validate.js            # everything
node tools/validate.js bangla     # one subject
```

It must finish with `0 error(s)`.

---

## 1. Files

Each subject has exactly three content files. The subject ids and topic ids are defined in `data/syllabus.js` and must not be changed.

| Kind | File | Registers with |
|---|---|---|
| MCQ questions | `data/questions/<subject>.js` | `BCS.addQuestions('<subject>', [ ... ]);` |
| Study notes | `data/notes/<subject>.js` | `BCS.addNotes('<subject>', [ ... ]);` |
| Flashcards | `data/flashcards/<subject>.js` | `BCS.addFlashcards('<subject>', [ ... ]);` |

Subjects: `bangla`, `english`, `bangladesh`, `international`, `geography`, `science`, `ict`, `math`, `mental`, `ethics`.

A file may call its `add…` function several times. That is how large files are written in batches: append another `BCS.add…('<subject>', [ ... ]);` block at the end of the file. Files are plain browser scripts. No `import`, `export`, `require` or modules.

## 2. Questions

```js
BCS.addQuestions("bangla", [
  { id: "bn-0001", t: "bn-lit-ancient", d: 1,
    q: "চর্যাপদের পুঁথি কোথা থেকে আবিষ্কৃত হয়?",
    o: ["নেপালের রাজদরবারের গ্রন্থাগার", "তিব্বতের একটি বৌদ্ধবিহার", "বিষ্ণুপুরের একটি গোয়ালঘর", "আরাকান রাজসভা"],
    a: 0,
    e: "১৯০৭ সালে হরপ্রসাদ শাস্ত্রী নেপালের রাজদরবারের গ্রন্থাগার থেকে চর্যাপদের পুঁথি আবিষ্কার করেন; ১৯১৬ সালে তা বঙ্গীয় সাহিত্য পরিষৎ থেকে প্রকাশিত হয়।" },
]);
```

| Key | Required | Meaning |
|---|---|---|
| `id` | yes | `<prefix>-NNNN`, four digits, unique. Prefixes: bangla `bn`, english `en`, bangladesh `bd`, international `ia`, geography `geo`, science `sci`, ict `ict`, math `mat`, mental `men`, ethics `eth`. Number sequentially from 0001. Never reuse or renumber an id (the app stores progress by id). |
| `t` | yes | A topic id of this subject from `data/syllabus.js`. |
| `q` | yes | Question text. Plain text only. `\n` is allowed for line breaks (e.g., statements i, ii, iii). |
| `o` | yes | Exactly 4 distinct options, plain text. |
| `a` | yes | Index of the correct option: 0, 1, 2 or 3. |
| `e` | yes | Explanation, 1–3 sentences: why the answer is right, plus one closely related fact worth remembering. For math, show the short working. |
| `d` | no | Difficulty: 1 easy, 2 medium, 3 hard. |
| `asOf` | no | `"YYYY-MM"` for facts that can change (office holders, latest statistics, rankings, recent events). Required for anything time-sensitive. |

Formatting rules:

- **No HTML** in `q`, `o`, `e`. Use Unicode for maths: `x² y³ √ π ≤ ≥ ≠ × ÷ ° ∠ △ ∩ ∪ ⊂ ∈ ½ ¾`.
- Use double-quoted JS strings. Quote titles in Bangla with ‘ ’ (e.g., ‘অগ্নিবীণা’) and in English with ' or “ ”.
- Bangla-medium subjects are written in Bangla with Bangla digits (১৯৫২, ২০ শতাংশ), as in the real exam. Exponents use superscripts (x², a³). Variables stay Latin (x, y, a, b).
- The English subject is written in English.
- One clearly correct answer. Distractors must be plausible but unambiguously wrong.
- Spread correct answers across positions 0–3 roughly evenly.
- If you use “সবগুলো / কোনোটিই নয় / All of the above / None of these”, put it as the last option.
- Keep stems short and exam-like. Avoid trick wording and double negatives.

## 3. Notes

One note per topic, with the topic id in `t`. Notes are concise, exam-focused summaries: the facts that get asked, organised so they can be revised fast.

```js
BCS.addNotes("bangla", [
  { t: "bn-lit-ancient", title: "প্রাচীন যুগ: চর্যাপদ", html: `
<p>চর্যাপদ বাংলা সাহিত্যের প্রাচীনতম নিদর্শন ...</p>
<div class="remember"><strong>মনে রাখুন:</strong> ...</div>
<table><thead><tr><th>বিষয়</th><th>তথ্য</th></tr></thead>
<tbody><tr><td>আবিষ্কারক</td><td>হরপ্রসাদ শাস্ত্রী (১৯০৭)</td></tr></tbody></table>
` },
]);
```

- `html` is a template literal. **Never use a backtick or `${` inside it.**
- Allowed tags: `h3 h4 p ul ol li table thead tbody tr th td strong b em i mark br blockquote div span small sup sub code hr`. Allowed attributes: `class`, `colspan`, `rowspan`. No `h1`/`h2`, links, images, scripts or inline styles.
- Callout boxes (use `<div class="…">`):
  - `remember`: must-remember facts
  - `tip`: exam tip, shortcut or memory trick
  - `caution`: common confusion or trap
- `<ul class="cols">` renders a long list in two columns.
- Use tables for lists of pairs (author → works, organisation → HQ, formula → meaning).
- Use `<h3>` for sections inside a note and `<h4>` for sub-sections.
- Length: roughly 300–1,200 words per topic. Dense, no filler.

## 4. Flashcards

Atomic facts for spaced repetition. Front = cue, back = short answer.

```js
BCS.addFlashcards("bangla", [
  { id: "bn-f001", t: "bn-lit-nazrul", f: "‘অগ্নিবীণা’ কার লেখা, কবে প্রকাশিত?", b: "কাজী নজরুল ইসলাম; ১৯২২ সালে প্রকাশিত তাঁর প্রথম কাব্যগ্রন্থ" },
]);
```

- `id`: `<prefix>-fNNN`, unique, never reused.
- `t`: topic id. `f` and `b`: plain text, no HTML.

## 5. Accuracy rules (most important)

A study tool with wrong facts is worse than none.

1. Include only facts you are confident are correct. **When in doubt, leave it out.** Accuracy beats quantity.
2. Where reputable sources disagree (e.g., a count, a date or a "first"), either avoid the question or state the commonly accepted exam answer and note the disagreement in `e`.
3. Never claim a question appeared in a specific BCS or other exam.
4. **Time-sensitive facts** (as of 2026-10): verify with a web search before using, add `asOf`, and phrase the stem so it stays true (e.g., “২০২৬ সালের ফেব্রুয়ারিতে অনুষ্ঠিত …”). Prefer stable facts.
5. Bangladesh changed fast in 2024–2026. Verified context:
   - The July–August 2024 mass uprising ended with Sheikh Hasina resigning and leaving the country on 5 August 2024.
   - The interim government, with Dr. Muhammad Yunus as Chief Adviser, was sworn in on 8 August 2024. It formed reform commissions.
   - The 13th parliamentary election was held on 12 February 2026, together with the July Charter referendum (68.26% "yes"). BNP won a majority, and Tarique Rahman was sworn in as Prime Minister on 17 February 2026.
   - President Mohammed Shahabuddin resigned on 24 July 2026. **Mirza Fakhrul Islam Alamgir** was elected the 23rd President on 20 August 2026 and sworn in on 21 August.
   - Many institutions, projects and days named after Sheikh Mujibur Rahman or his family were renamed or changed after August 2024. Some national days were cancelled in October 2024. Verify any such name or day before using it, or avoid it.
   - BCS rules: age limit 21–32, no limit on attempts, viva 100 marks (from the 47th BCS), preliminary marks redistributed from the 50th BCS.
6. Maths and reasoning: compute every answer (for example with `node -e`) before writing it, and check that exactly one option matches.
7. Bangla grammar: follow the standard NCTB grammar used in BCS preparation. Where newer and older NCTB books classify differently (e.g., the number of পদ), avoid the question or mention both in `e`.
8. Use Bangla Academy standard spelling (প্রমিত বানান) throughout.
