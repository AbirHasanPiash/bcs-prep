# Build status and how to resume

All work is saved as plain files in this folder. Nothing lives only inside a Claude session. If a session ends mid-build, everything written so far is still here and can be picked up from this page.

## Public release and the 14 Oct 2026 update

Done on 14 Oct 2026, committed in git:
- Phone layouts fixed and tested on every page at 320, 360, 390, 768 and 1280 px, in light and dark mode. All 97 notes checked at 360 px.
- GitHub Pages files: `.nojekyll` (needed because `data/_registry.js` starts with an underscore), `manifest.webmanifest`, `assets/icons/`, social tags in `index.html`, the public `README.md`, and `?v=` release dates on asset URLs.
- New features: "Report a mistake" links (GitHub issues), an About card in Settings, and a "Current affairs" practice set (every question with `asOf`).
- Current affairs updated to 14 Oct 2026 in Bangladesh Affairs, International Affairs, Science, ICT and Geography: 141 new questions, 102 new flashcards and 25 updated notes. Surprising claims were spot-checked against news sources.
- Exam guide: BCS news as of 14 Oct 2026, covering the 50th BCS progress, the 51st (special, doctors), the 52nd as the next general BCS, the viva rule, the new PSC chairman and the syllabus review.

Totals: 1,372 questions, 97 notes, 892 flashcards. `node tools/validate.js` reports 0 errors.

**Facts due for refresh** (dates in 2026 unless noted):
- 16 Oct onward: UN Security Council straw polls for the next Secretary-General.
- 25 Oct: Brazil runoff; 51st BCS applications close.
- 26 Oct: Ballon d'Or.
- 29 Oct: Thakurgaon-1 by-election.
- November: the 52nd BCS circular (marks, dates and posts); COP31 in Antalya (9–20 Nov); APEC Shenzhen (18–19 Nov).
- 9 Nov: Booker Prize.
- By 24 Nov: the UN General Assembly decision on deferring LDC graduation.
- About 20 Nov: Rooppur start-up.
- 25 Nov: 50th BCS final result.
- December: the Ganges Treaty expires; Nobel ceremonies on 10 Dec; G20 in Doral; Guterres' term ends on 31 Dec.

## Done

- **The app:** `index.html`, `assets/` (dashboard, exam guide, syllabus tracker, notes reader, practice, mock tests, flashcards, review, planner, settings, search). Tested in headless Chrome: every page loads with no errors, the main flows work, and a mock test survives a page reload.
- **Exam facts** (verified 7 Oct 2026): `data/syllabus.js` (new 50th-BCS marks, 97 topics) and the exam guide page.
- **Tools and docs:** `tools/validate.js` (content checker), `docs/CONTENT_GUIDE.md` (format and rules), `docs/CONTENT_BRIEFS.md` (the writer briefs), `README.md`.

## Content: complete (2026-10-08)

All ten subjects are finished and validated: `node tools/validate.js` reports **0 errors, 0 warnings**.

| Subject | Marks | Questions | Notes | Flashcards |
|---|---|---|---|---|
| Bangla Language & Literature | 30 | 162 | 19 | 100 |
| English Language & Literature | 30 | 160 | 16 | 100 |
| Bangladesh Affairs | 25 | 140 | 11 | 100 |
| International Affairs | 25 | 146 | 10 | 100 |
| Geography, Environment & Disaster Mgmt | 10 | 80 | 6 | 60 |
| General Science | 15 | 110 | 5 | 80 |
| Computer & IT | 15 | 113 | 8 | 80 |
| Mathematical Reasoning | 20 | 120 | 10 | 60 |
| Mental Ability | 15 | 100 | 6 | 50 |
| Ethics, Values & Good Governance | 15 | 100 | 6 | 60 |
| **Total** | **200** | **1,231** | **97 (every topic)** | **790** |

**Quality checks done:**
- Each writer did its own review pass, and each subject's report is in `docs/CONTENT_REPORTS.md`.
- 192 randomly sampled questions across nine subjects were checked by hand, with no errors found.
- The most surprising recent facts were re-verified against news sources.
- An end-to-end browser test passed: every page, a full 200-question mock from start to result, flashcards, the planner, dark mode and the mobile layout.

**Facts to refresh soon:**
- The 2026 Nobel Prizes, announced from 8 Oct 2026 (Literature) and about 9–10 Oct (Peace).
- The next UN Secretary-General, once chosen.
- The Ganges water treaty, which expires in Dec 2026.
- The next general BCS circular, expected around Nov 2026: check the marks distribution and the dates in the exam guide.

## If the session ended before everything finished

1. **See where things stand:** run `node tools/validate.js --quiet`. It lists the counts per subject and any errors.
2. **Fix a file cut off mid-write** (rare; it shows as a "failed to load" error): open the file and delete the last, incomplete `BCS.add…(...)` block, then validate again. The site skips a file that fails to load, so everything else keeps working.
3. **Finish a subject:** start a Claude Code session in this folder and say:
   > Finish the `<subject>` content using docs/CONTENT_BRIEFS.md (common brief + the subject's section + the resume rule).
4. **Final quality pass** once every subject is done:
   - `node tools/validate.js` must report 0 errors.
   - `node tools/validate.js --keys` lists questions whose explanation names a wrong option. Check each one.
   - Spot-check a sample of questions per subject by hand.
   - Open `index.html` and try a full mock test.

The site works with whatever content exists. A subject with no files yet just shows "0 questions" until it is filled in.
