/* Exam guide: what the BCS is, how the preliminary works, and how to approach it. Facts verified on 7 Oct 2026. */
(function () {
  'use strict';
  var U = App.util, UI = App.ui, B = window.BCS;
  var esc = U.esc;

  var OLD_MARKS = { bangla: 35, english: 35, bangladesh: 30, international: 20, geography: 10, science: 15, ict: 15, math: 15, mental: 15, ethics: 10 };

  function marksTable() {
    var max = Math.max.apply(null, B.subjects.map(function (s) { return s.marks; }));
    var rows = B.subjects.map(function (s) {
      var diff = s.marks - OLD_MARKS[s.id];
      var d = diff > 0 ? '<span class="delta-up">+' + diff + '</span>' : diff < 0 ? '<span class="delta-down">' + diff + '</span>' : '<span class="muted">–</span>';
      return '<tr><td><div class="strong">' + UI.subjectName(s) + '</div><div class="tiny muted hide-sm">' + esc(s.en) + '</div></td>' +
        '<td class="num strong">' + s.marks + '</td><td class="num muted">' + OLD_MARKS[s.id] + '</td><td class="num">' + d + '</td>' +
        '<td class="hide-sm" style="width:28%"><span class="bar" style="--v:' + (s.marks / max * 100).toFixed(0) + '%"></span></td>' +
        '<td class="num muted hide-sm">' + Math.round(s.marks * 0.6) + ' min</td></tr>';
    }).join('');
    return '<div class="table-wrap"><table class="table marks-table"><thead><tr><th>Subject</th><th class="num">Marks now</th><th class="num">Before</th><th class="num">Change</th><th class="hide-sm">Share</th><th class="num hide-sm">Time at 36 s/Q</th></tr></thead>' +
      '<tbody>' + rows + '</tbody><tfoot><tr><td>Total</td><td class="num">200</td><td class="num">200</td><td></td><td class="hide-sm"></td><td class="num hide-sm">120 min</td></tr></tfoot></table></div>';
  }

  function render(root) {
    root.innerHTML =
      '<div class="stack">' +

      UI.callout('<strong>Checked on 7 October 2026.</strong> PSC rules change. Always confirm with the official circular on <strong>bpsc.gov.bd</strong> before you apply or plan around a date.', '', 'info') +

      '<div class="grid cols-2">' +
        '<div class="card prose"><h2>Which BCS is next?</h2>' +
          '<ol class="timeline">' +
            '<li><div class="when">26 Nov 2025</div><strong>50th BCS circular</strong> (general): 2,150 posts (1,755 cadre, 395 non-cadre).</li>' +
            '<li><div class="when">30 Jan 2026</div><strong>50th BCS preliminary</strong> held with the new marks distribution, with about 290,000 applicants.</li>' +
            '<li><div class="when">24 Sep 2026</div><strong>51st BCS circular</strong>: a <em>special</em> BCS for 5,000 doctors (assistant and dental surgeons). Preliminary plus a 100-mark viva, no written exam. Applications run 1–25 Oct 2026.</li>' +
            '<li class="next"><div class="when">Expected Nov 2026</div><strong>Next general BCS circular</strong>, most likely numbered the 52nd. PSC has said it plans to publish it in November in line with its calendar. Not yet confirmed.</li>' +
            '<li><div class="when">Estimate: early 2027</div><strong>Its preliminary.</strong> The 50th BCS prelim came about 9 weeks after its circular. If the next one follows the same pattern, expect roughly January–February 2027. This is an estimate, not an announcement.</li>' +
          '</ol>' +
          '<p class="small muted mb-0">If you are a doctor, the 51st (special) BCS is open now. Everyone else should prepare for the next general BCS.</p>' +
        '</div>' +

        '<div class="card prose"><h2>How the BCS works</h2>' +
          '<div class="stack-sm">' +
            '<div class="row top"><span class="stage"><span class="n">1</span></span><div><strong>Preliminary test (MCQ)</strong>: 200 marks, 2 hours. It is a screening test: you must pass it, but its marks do not count in the final merit list. <em>This site prepares you for this stage.</em></div></div>' +
            '<div class="row top"><span class="stage"><span class="n">2</span></span><div><strong>Written exam</strong>: 900 marks for general or technical/professional cadres. Candidates who choose both kinds of cadre also sit 200 marks of technical-subject papers.</div></div>' +
            '<div class="row top"><span class="stage"><span class="n">3</span></span><div><strong>Viva voce</strong>: 100 marks, cut from 200 from the 47th BCS onward. That makes the final total 1,000 (written + viva).</div></div>' +
          '</div>' +
          '<h3>Eligibility and application (current rules)</h3>' +
          '<ul>' +
            '<li><strong>Age: 21 to 32</strong> for everyone. Since the December 2024 gazette, the earlier extra years for some categories no longer apply.</li>' +
            '<li><strong>No limit on attempts</strong> while you are within the age range.</li>' +
            '<li>A bachelor\'s degree is required. The circular lists the exact qualification and result conditions.</li>' +
            '<li><strong>Application fee: Tk 200</strong> (Tk 50 for ethnic-minority, disabled and third-gender candidates), from the 50th BCS onward. You apply online through <strong>bpsc.teletalk.com.bd</strong>.</li>' +
          '</ul>' +
        '</div>' +
      '</div>' +

      '<div class="card"><div class="card-h"><h2>The preliminary paper</h2><span class="sub">Distribution introduced with the 50th BCS (syllabus published 9 Dec 2025)</span></div>' +
        '<div class="grid cols-4 mb-16">' +
          '<div class="stat"><div class="stat-label">Questions</div><div class="stat-value">200</div><div class="stat-sub">1 mark each, MCQ on an OMR sheet</div></div>' +
          '<div class="stat"><div class="stat-label">Time</div><div class="stat-value">2 hours</div><div class="stat-sub">36 seconds a question on average</div></div>' +
          '<div class="stat"><div class="stat-label">Wrong answer</div><div class="stat-value">−0.50</div><div class="stat-sub">No penalty for leaving one blank</div></div>' +
          '<div class="stat"><div class="stat-label">Language</div><div class="stat-value" style="font-size:22px">Bangla</div><div class="stat-sub">The English section is in English</div></div>' +
        '</div>' +
        marksTable() +
        '<p class="small muted mt-16 mb-0">International Affairs, Mathematical Reasoning and Ethics gained 5 marks each. Bangla, English and Bangladesh Affairs lost 5 each. A lot of guidebooks and websites still show the old split, so plan with the new one.</p>' +
      '</div>' +

      '<div class="grid cols-2">' +
        '<div class="card prose"><h2>Negative marking: when to guess</h2>' +
          '<p>Each wrong answer costs half a mark, so a blind guess loses marks on average. What decides it is how many options you can rule out:</p>' +
          '<div class="table-wrap"><table class="table"><thead><tr><th>Options you can rule out</th><th class="num">Chance of being right</th><th class="num">Expected marks</th><th>Decision</th></tr></thead><tbody>' +
            '<tr><td>None (blind guess)</td><td class="num">25%</td><td class="num bad-text">−0.125</td><td>Skip</td></tr>' +
            '<tr><td>One</td><td class="num">33%</td><td class="num">0.000</td><td>Break-even</td></tr>' +
            '<tr><td>Two</td><td class="num">50%</td><td class="num ok-text">+0.250</td><td>Answer</td></tr>' +
            '<tr><td>You know it</td><td class="num">≈100%</td><td class="num ok-text">+1.000</td><td>Answer</td></tr>' +
          '</tbody></table></div>' +
          '<p class="mt-16"><strong>Rule of thumb:</strong> answer when you can rule out two options, skip pure guesses. Mock-test results on this site show how many marks negative marking cost you.</p>' +
        '</div>' +

        '<div class="card prose"><h2>Managing the 2 hours</h2>' +
          '<ol>' +
            '<li><strong>First pass (≈70 min):</strong> answer every question you know at once. Most factual questions take 10–20 seconds.</li>' +
            '<li><strong>Second pass (≈35 min):</strong> come back for calculations, reasoning and the questions where you can rule out two options.</li>' +
            '<li><strong>Last 10–15 min:</strong> check the OMR sheet: roll number, registration number and set code, and that every bubble is fully filled.</li>' +
          '</ol>' +
          '<p>Fill a bubble only when you are sure: an OMR answer cannot be changed. The mock tests here have an optional <em>lock answers</em> mode to practise exactly that.</p>' +
          '<h3>Exam-day checklist</h3>' +
          '<ul><li>Admit card, plus whatever ID the admit card asks for</li><li>Two or more black ballpoint pens</li><li>Arrive early. Phones, calculators, smart watches and other electronic devices are not allowed in the hall.</li></ul>' +
        '</div>' +
      '</div>' +

      '<div class="grid cols-2">' +
        '<div class="card prose"><h2>A study approach that works</h2>' +
          '<ol>' +
            '<li><strong>Foundation:</strong> work through every syllabus topic. Read the notes here, then practise that topic in <em>Learn</em> mode so each answer comes with its explanation.</li>' +
            '<li><strong>Daily habits:</strong> some maths and English every day (they reward steady practice), plus 15 minutes of flashcards.</li>' +
            '<li><strong>Weekly check:</strong> one mock test, then re-do every mistake in <a href="#/review">Review</a>.</li>' +
            '<li><strong>Final 4–6 weeks:</strong> two or three full 200-mark mocks a week under real timing, your bookmarked questions, and current affairs.</li>' +
          '</ol>' +
          '<p>The <a href="#/planner">study planner</a> spreads all 97 topics over the days you have left and builds in revision and mock days.</p>' +
        '</div>' +

        '<div class="card prose"><h2>Where else to read</h2>' +
          '<ul>' +
            '<li><strong>NCTB textbooks</strong> (classes 6–10): Bangla grammar, Bangladesh and global studies, science, ICT and maths. A large share of questions is at this level.</li>' +
            '<li><strong>The Constitution of Bangladesh</strong>, on bdlaws.minlaw.gov.bd.</li>' +
            '<li><strong>Bangladesh Economic Review</strong> (Finance Division, published each June) for economy figures.</li>' +
            '<li><strong>A daily newspaper and a monthly current-affairs digest</strong>. International Affairs is now worth 25 marks.</li>' +
            '<li><strong>Previous BCS question papers.</strong> Solve them under time. Topics repeat often.</li>' +
          '</ul>' +
          '<p class="small muted mb-0">This site\'s questions are written to match the syllabus and the style of the exam. They are not copied from past papers, so use real past papers as well.</p>' +
        '</div>' +
      '</div>' +

      '<div class="card prose"><h2>Sources</h2>' +
        '<ul class="small">' +
          '<li>Prothom Alo, “50th BCS preliminary: Changes in marks distribution” (1 Dec 2025) and “50th BCS preliminary exam syllabus published” (10 Dec 2025)</li>' +
          '<li>Prothom Alo, “51st special BCS circular issued with 5,000 posts” (24 Sep 2026) and “51st BCS circular in November” (14 Aug 2026)</li>' +
          '<li>Dhaka Tribune, “Gazette published increasing the maximum age for the BCS exam to 32” (11 Dec 2024)</li>' +
          '<li>Prothom Alo / bdnews24 reports on the viva cut from 200 to 100 marks (from the 47th BCS) and the fee cut to Tk 200</li>' +
          '<li>Bangladesh Public Service Commission: bpsc.gov.bd</li>' +
        '</ul></div>' +

      '</div>';
  }

  App.views.guide = { title: 'Exam guide', render: render };
})();
