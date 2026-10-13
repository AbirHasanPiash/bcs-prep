# Content writer briefs

The question banks, notes and flashcards were written by one AI writer per subject, using the briefs below. They are kept here so any subject can be finished, extended or rewritten later with the same instructions.

**To relaunch a writer** (for example in a new Claude Code session), give it the *Common brief* plus that subject's section. If the subject's files already exist, add the *Resume rule*.

---

## Common brief

You are writing study content for a local BCS (Bangladesh Civil Service) Preliminary exam preparation website (this repository).

Read first:
1. `docs/CONTENT_GUIDE.md`: the schema, formatting and accuracy rules (including the verified 2024–2026 context in section 5). Follow it exactly.
2. Your subject's block in `data/syllabus.js`: its topic ids and the `covers` text that lists what each topic must cover.

Create exactly three files and touch nothing else: `data/questions/<subject>.js`, `data/notes/<subject>.js`, `data/flashcards/<subject>.js`.

- **Questions:** mix difficulty at about 30% easy, 50% medium and 20% hard. Model them on real BCS preliminary questions: the facts that are actually asked, phrased the way the exam phrases them.
- **Notes:** one note per topic. High-yield revision notes with tables and the callouts described in the guide.
- **Flashcards:** the most memorisable facts, spread across topics.

**How to write:** in batches of 25–40 items. Create the file with the first batch, then append each further batch as another `BCS.add…("<subject>", [ ... ]);` block, for example with a Bash heredoc using a quoted delimiter (`cat >> file <<'EOF' … EOF`). Keep ids sequential. Save every batch as soon as it is drafted, and never hold more than one batch in memory. Run `node tools/validate.js <subject>` after each append and fix every error. Finish with 0 errors.

**Accuracy:** this is used for real exam preparation, so every answer key must be correct. Before finishing, do a dedicated review pass: re-read each question, confirm the keyed answer is right and the other three options are wrong, and fix or delete anything doubtful. WebSearch and WebFetch can be used for verification; time-sensitive facts need `asOf`.

**Report:** counts (questions per topic, notes, flashcards), the validator result, facts verified on the web (with sources), and anything left out or uncertain. Do not paste the content.

## Resume rule

If the subject's files already exist: read them first, run `node tools/validate.js <subject>` to see per-topic counts, and continue from the highest existing id. Fill the topics with the fewest questions first, add missing notes and flashcards, and never renumber or delete existing ids (the app stores progress by id).

---

## Subject sections

### bangla: Bangla Language & Literature (বাংলা ভাষা ও সাহিত্য), prefix `bn`, 30 marks
- 160 MCQs (minimum 140): about 75 across the 11 `bn-lang-*` topics (at least 6 each) and 85 across the 8 `bn-lit-*` topics (at least 9 each).
- Literature: author–work pairs, first works, publication years, pen names and titles, characters, periodicals and editors, famous lines, "প্রথম" facts. Language: সন্ধিবিচ্ছেদ, সমাস, কারক-বিভক্তি, প্রকৃতি-প্রত্যয়, উপসর্গ, শুদ্ধ বানান, বাক্যশুদ্ধি, বাগধারা, এককথায় প্রকাশ, সমার্থক/বিপরীত শব্দ, পারিভাষিক শব্দ, ধ্বনি পরিবর্তন, বাচ্য/উক্তি.
- 19 notes and 100 flashcards.
- For disputed items (চর্যাপদের পদসংখ্যা, শ্রীকৃষ্ণকীর্তনের রচনাকাল, "প্রথম" claims), give the accepted exam answer and mention the disagreement. Avoid grammar questions whose answer depends on the textbook edition.

### english: English Language & Literature, prefix `en`, 30 marks (written in English)
- 160 MCQs (minimum 140): about 80 language (at least 8 per `en-lang-*` topic) and 80 literature (at least 8 per `en-lit-*` topic).
- Language: prepositions, exam-favourite synonyms and antonyms, idioms, spelling, parts of speech, voice and narration, error spotting, one-word substitution, analogy, foreign phrases. Literature: author–work, periods and dates, quotations, characters, literary terms, Nobel laureates.
- 16 notes and 100 flashcards.
- Grammar items must have exactly one defensible answer. Treat 2025 as the latest Nobel prize unless verified otherwise.

### bangladesh: Bangladesh Affairs (বাংলাদেশ বিষয়াবলি), prefix `bd`, 25 marks
- 140 MCQs (minimum 120), at least 10 per topic. 11 notes and 100 flashcards.
- History, the Liberation War (sectors, gallantry awards), constitution articles, constitutional bodies, economy, resources, mega projects, culture and national symbols, GI products, maritime verdicts (2012, 2014), the enclave exchange (2015), the Ganges treaty (1996), the Rohingya crisis.
- Highest risk of stale facts. Verify and add `asOf` to everything after 2024 (the July uprising, interim government, reform commissions, the July Charter and 2026 election/referendum, renamed institutions, cancelled national days), current economic figures, census 2022 figures (state whether preliminary or final), and constitution changes since 2024.

### international: International Affairs (আন্তর্জাতিক বিষয়াবলি), prefix `ia`, 25 marks
- 130 MCQs (minimum 110), at least 10 per topic, with 8–12 in `ia-current`. 10 notes and 100 flashcards.
- UN organs and agencies, organisations (founding, HQ, members), treaties, wars and revolutions, borders and straits, capitals and currencies, former country names, Nobel Peace Prize, international days, IR terms.
- Verify membership counts (UN, NATO, ASEAN, BRICS, OPEC, Commonwealth, OIC, G20), office holders, the UN Secretary-General selection (Guterres' term ends 31 Dec 2026), and the latest COP. `ia-current` must contain only verified facts with `asOf`.

### geography: Geography, Environment & Disaster Management, prefix `geo`, 10 marks
- 80 MCQs (minimum 65), at least 11 per topic. 6 notes and 60 flashcards.
- Bangladesh's location, borders, rivers, islands, haors, forests and peaks; earth and atmosphere; world geography; ecology, pollution, ozone and Ramsar sites; disasters, warning signals, the Disaster Management Act 2012, Standing Orders on Disaster, Hyogo and Sendai frameworks.
- Figures that vary by source (area, borders, peak heights, forest cover) must use the standard reference figure, note the variation, or be avoided.

### science: General Science (সাধারণ বিজ্ঞান), prefix `sci`, 15 marks
- 110 MCQs (minimum 95), at least 18 per topic. 5 notes and 80 flashcards.
- NCTB class 6–10 level physics, chemistry, biology, human health and modern technology. Compute numeric answers, and verify any satellite or space facts that may have changed since 2024.

### ict: Computer & Information Technology, prefix `ict`, 15 marks
- 110 MCQs (minimum 95), at least 12 per topic. 8 notes and 80 flashcards.
- Generations, pioneers, hardware, memory, OS, programming languages, number systems (compute every conversion), logic gates, networks, OSI and TCP/IP, internet, email protocols, mobile generations, cloud, DBMS and SQL, Office shortcuts, security, AI, IoT, blockchain, e-commerce, e-governance.
- Verify Bangladesh-specific facts that may have changed since 2024.

### math: Mathematical Reasoning (গাণিতিক যুক্তি), prefix `mat`, 20 marks
- 120 MCQs (minimum 100), at least 9 per topic, more for percentages, ratios and word problems, algebra and geometry. 10 notes (formula sheets, methods, worked examples) and 60 flashcards.
- Compute every answer with code before writing it. Distractors should be the results of typical mistakes. The explanation shows the working.

### mental: Mental Ability (মানসিক দক্ষতা), prefix `men`, 15 marks
- 100 MCQs (minimum 85), at least 14 per topic. 6 notes and 50 flashcards.
- Text-only (no images): analogies, odd one out, syllogisms, blood relations, directions, coding, series, clocks, calendars, ranking, seating, gears, pulleys and levers, painted cubes, dice from described views, mirror images, spelling and word meanings.
- Every puzzle must have exactly one valid answer, verified with code.

### ethics: Ethics, Values & Good Governance (নৈতিকতা, মূল্যবোধ ও সুশাসন), prefix `eth`, 15 marks
- 100 MCQs (minimum 85), at least 13 per topic. 6 notes and 60 flashcards.
- Definitions and etymology, branches of ethics, philosophers and their works, types of values, law, liberty and equality, the UDHR, good-governance definitions (World Bank, UNDP, ADB), the National Integrity Strategy 2012, the ACC, the RTI Act 2009 and Information Commission, the Ombudsman, NHRC, citizen's charter, GRS, TIB and the CPI, UNCAC, the conduct rules, conflict of interest.
- Prefer primary sources (bdlaws.minlaw.gov.bd, the NIS document, UN, UNDP and World Bank). Laws may have been amended in 2024–2026, so verify and add `asOf`, or ask about the original law explicitly.
