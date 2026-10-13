# Build status and how to resume

All work is saved as plain files in this folder. Nothing lives only inside a Claude session. If a session ends mid-build, everything written so far is still here and can be picked up from this page.

## Current work: public release and 14 Oct 2026 update (in progress)

If a session stopped part-way, this is where things stand. Everything listed as done is committed in git.

**Done**
- Phone layouts fixed and tested on every page at 320, 360, 390, 768 and 1280 px (light and dark).
- GitHub Pages files: `.nojekyll` (needed because `data/_registry.js` starts with an underscore), `manifest.webmanifest`, `assets/icons/`, social tags in `index.html`, public `README.md`, `?v=` release dates on asset URLs.
- New features: "Report a mistake" links (GitHub issues), an About card in Settings, a "Current affairs" practice set (all questions with `asOf`).
- Current affairs to 14 Oct 2026: International Affairs (ia-0147 to ia-0214, ia-f101 to ia-f149; notes ia-current, ia-misc, ia-economy, ia-un, ia-orgs, ia-conflicts, ia-treaties), Science/ICT/Geography (sci-0111+, ict-0114+, geo-0081+, matching flashcards; 9 notes). The surprising claims were spot-checked against news sources (UK PM, the 2026 Nobels, Brazil, Morocco, West Bengal, OPEC, the UN Security Council, sports results, index ranks, Rooppur).

**Still to do**
1. Bangladesh Affairs update (ids bd-0141+, bd-f101+). Its interim findings, including BCS/PSC news, are saved in the session scratchpad as `bd_interim_report.md`. If it is lost, rerun the Bangladesh part of the brief.
2. Fact-check the new Bangladesh items, then update the exam guide timeline (`assets/js/views/guide.js`), the dashboard's "Exam date not set" text and `BCS.meta.lastVerified` in `data/syllabus.js` with the latest BCS circular news.
3. Run `node tools/validate.js` (it must show 0 errors) and commit.
4. Make the GitHub repository `AbirHasanPiash/bcs-prep` public, then turn on Pages (branch `main`, folder `/`): `gh api -X POST repos/AbirHasanPiash/bcs-prep/pages -f "source[branch]=main" -f "source[path]=/"`.
5. Check the live site at https://abirhasanpiash.github.io/bcs-prep/ on a phone.

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
