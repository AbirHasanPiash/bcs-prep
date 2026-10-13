/*
 * BCS Preliminary Test: exam facts + subject/topic structure.
 * Marks follow the distribution PSC introduced with the 50th BCS (syllabus published 9 Dec 2025).
 * Topic ids are the contract between the app and every content file. Do not rename them.
 */
(function (root) {
  var BCS = (root.BCS = root.BCS || {});

  BCS.meta = {
    lastVerified: '2026-10-14',
    currentAffairs: '2026-10-14',   // time-sensitive questions and notes checked up to this date
    syllabusBasis: '50th BCS preliminary syllabus (PSC, published 9 Dec 2025)'
  };

  BCS.exam = {
    totalMarks: 200,
    questions: 200,
    durationMin: 120,
    negative: 0.5,
    markPerQuestion: 1
  };

  BCS.subjects = [
    {
      id: 'bangla', prefix: 'bn', marks: 30, mono: 'অ',
      bn: 'বাংলা ভাষা ও সাহিত্য', en: 'Bangla Language & Literature',
      groups: [
        { id: 'lang', bn: 'বাংলা ভাষা (ব্যাকরণ)', en: 'Language', share: 0.5 },
        { id: 'lit', bn: 'বাংলা সাহিত্য', en: 'Literature', share: 0.5 }
      ],
      topics: [
        { id: 'bn-lang-origin', group: 'lang', bn: 'ভাষা ও বাংলা ভাষার উদ্ভব', en: 'Language & origin of Bangla',
          covers: 'ভাষার সংজ্ঞা ও বৈশিষ্ট্য, বাংলা ভাষার উৎপত্তি ও বিকাশ (ইন্দো-ইউরোপীয় থেকে বাংলা), উপভাষা, সাধু ও চলিত রীতি, ব্যাকরণের সংজ্ঞা ও আলোচ্য বিষয়, বাংলা লিপি' },
        { id: 'bn-lang-phonology', group: 'lang', bn: 'ধ্বনিতত্ত্ব, বর্ণ ও ধ্বনি পরিবর্তন', en: 'Phonology & sound change',
          covers: 'স্বরধ্বনি ও ব্যঞ্জনধ্বনি, উচ্চারণস্থান, বর্ণ ও যুক্তবর্ণ, মাত্রা, অক্ষর, ধ্বনি পরিবর্তন (অপিনিহিতি, অভিশ্রুতি, স্বরসংগতি, সমীভবন, বিপর্যাস ইত্যাদি), ণত্ব ও ষত্ব বিধান, উচ্চারণের নিয়ম' },
        { id: 'bn-lang-sandhi', group: 'lang', bn: 'সন্ধি', en: 'Sandhi',
          covers: 'স্বরসন্ধি, ব্যঞ্জনসন্ধি, বিসর্গসন্ধি, নিপাতনে সিদ্ধ সন্ধি, সন্ধিবিচ্ছেদ' },
        { id: 'bn-lang-words', group: 'lang', bn: 'শব্দ, পদ ও শব্দের শ্রেণিবিভাগ', en: 'Words & parts of speech',
          covers: 'উৎপত্তি অনুসারে শব্দ (তৎসম, অর্ধ-তৎসম, তদ্ভব, দেশি, বিদেশি), গঠন ও অর্থ অনুসারে শব্দ (যৌগিক, রূঢ়ি, যোগরূঢ়), পদ প্রকরণ (বিশেষ্য, বিশেষণ, সর্বনাম, অব্যয়, ক্রিয়া), লিঙ্গ, বচন, পুরুষ, ক্রিয়ার কাল ও ভাব, দ্বিরুক্ত শব্দ' },
        { id: 'bn-lang-samas', group: 'lang', bn: 'সমাস', en: 'Samas (compounds)',
          covers: 'দ্বন্দ্ব, কর্মধারয়, তৎপুরুষ, বহুব্রীহি, দ্বিগু, অব্যয়ীভাব, নিত্য সমাস ও প্রাদি সমাস; ব্যাসবাক্য' },
        { id: 'bn-lang-karak', group: 'lang', bn: 'কারক, বিভক্তি ও অনুসর্গ', en: 'Karak & case endings',
          covers: 'কর্তা, কর্ম, করণ, সম্প্রদান, অপাদান ও অধিকরণ কারক; শব্দ ও ক্রিয়া বিভক্তি; অনুসর্গ' },
        { id: 'bn-lang-prokriti', group: 'lang', bn: 'প্রকৃতি-প্রত্যয় ও উপসর্গ', en: 'Roots, suffixes & prefixes',
          covers: 'ধাতু ও প্রকৃতি, কৃৎ ও তদ্ধিত প্রত্যয়, বাংলা-তৎসম-বিদেশি উপসর্গ, উপসর্গের অর্থবাচকতা' },
        { id: 'bn-lang-banan', group: 'lang', bn: 'বানান, শব্দশুদ্ধি ও বাক্যশুদ্ধি', en: 'Spelling & correction',
          covers: 'বাংলা একাডেমির প্রমিত বানানরীতি, শুদ্ধ বানান নির্ণয়, শব্দশুদ্ধি, বাক্যশুদ্ধি, প্রয়োগ-অপপ্রয়োগ' },
        { id: 'bn-lang-meaning', group: 'lang', bn: 'সমার্থক ও বিপরীতার্থক শব্দ', en: 'Synonyms & antonyms',
          covers: 'সমার্থক শব্দ, বিপরীতার্থক শব্দ, শব্দের অর্থ ও অর্থের পরিবর্তন' },
        { id: 'bn-lang-idiom', group: 'lang', bn: 'বাগধারা, প্রবাদ, এককথায় প্রকাশ ও পারিভাষিক শব্দ', en: 'Idioms, one-word & terms',
          covers: 'বাগধারা ও বাগ্‌বিধি, প্রবাদ-প্রবচন, বাক্য সংকোচন/এককথায় প্রকাশ, পারিভাষিক শব্দ (ইংরেজি পরিভাষার বাংলা)' },
        { id: 'bn-lang-sentence', group: 'lang', bn: 'বাক্য, বাচ্য, উক্তি ও বিরামচিহ্ন', en: 'Sentence, voice & punctuation',
          covers: 'বাক্যের গুণ ও প্রকারভেদ (সরল, জটিল, যৌগিক), বাক্য রূপান্তর, বাচ্য ও বাচ্য পরিবর্তন, উক্তি পরিবর্তন, বিরামচিহ্ন ও এদের বিরতিকাল' },
        { id: 'bn-lit-ancient', group: 'lit', bn: 'প্রাচীন যুগ: চর্যাপদ', en: 'Ancient period: Charyapada',
          covers: 'চর্যাপদ আবিষ্কার ও প্রকাশ, পদকর্তা, ভাষা ও ছন্দ, বিষয়বস্তু, সমাজচিত্র, সন্ধ্যাভাষা' },
        { id: 'bn-lit-medieval', group: 'lit', bn: 'মধ্যযুগ', en: 'Medieval period',
          covers: 'অন্ধকার যুগ, শ্রীকৃষ্ণকীর্তন, বৈষ্ণব পদাবলি, মঙ্গলকাব্য (মনসা, চণ্ডী, অন্নদা, ধর্মমঙ্গল), অনুবাদ সাহিত্য, রোমান্টিক প্রণয়োপাখ্যান, আরাকান রাজসভা, জীবনী সাহিত্য, পুঁথি সাহিত্য, লোকসাহিত্য ও গীতিকা, কবিওয়ালা ও শায়ের' },
        { id: 'bn-lit-modern-early', group: 'lit', bn: 'আধুনিক যুগের সূচনা (উনিশ শতক)', en: '19th-century foundations',
          covers: 'ফোর্ট উইলিয়াম কলেজ, রাজা রামমোহন রায়, ঈশ্বরচন্দ্র বিদ্যাসাগর, প্যারীচাঁদ মিত্র, কালীপ্রসন্ন সিংহ, মাইকেল মধুসূদন দত্ত, বঙ্কিমচন্দ্র চট্টোপাধ্যায়, দীনবন্ধু মিত্র, মীর মশাররফ হোসেন, কায়কোবাদ, ঈশ্বরচন্দ্র গুপ্ত, প্রথম যুগের সাময়িকপত্র' },
        { id: 'bn-lit-rabindranath', group: 'lit', bn: 'রবীন্দ্রনাথ ঠাকুর', en: 'Rabindranath Tagore',
          covers: 'জীবন, কাব্যগ্রন্থ, উপন্যাস, ছোটগল্প, নাটক, প্রবন্ধ, গান, নোবেল পুরস্কার, পত্রিকা সম্পাদনা, বিখ্যাত পঙক্তি' },
        { id: 'bn-lit-nazrul', group: 'lit', bn: 'কাজী নজরুল ইসলাম', en: 'Kazi Nazrul Islam',
          covers: 'জীবন, কাব্যগ্রন্থ, উপন্যাস, গল্প, নাটক, প্রবন্ধ, পত্রিকা, বাজেয়াপ্ত গ্রন্থ, সংগীত, জাতীয় কবি' },
        { id: 'bn-lit-20c', group: 'lit', bn: 'বিশ শতকের সাহিত্য ও সাহিত্যিক', en: '20th-century literature',
          covers: 'শরৎচন্দ্র চট্টোপাধ্যায়, প্রমথ চৌধুরী (সবুজপত্র), বেগম রোকেয়া, জীবনানন্দ দাশ, জসীমউদ্‌দীন, বিভূতিভূষণ, তারাশঙ্কর ও মানিক বন্দ্যোপাধ্যায়, সুকান্ত ভট্টাচার্য, তিরিশের কবিগোষ্ঠী, কল্লোল যুগ, মুসলিম সাহিত্য সমাজ (শিখা), ফররুখ আহমদ, মোতাহের হোসেন চৌধুরী, কাজী আবদুল ওদুদ' },
        { id: 'bn-lit-bangladesh', group: 'lit', bn: 'বাংলাদেশের সাহিত্য', en: 'Literature of Bangladesh',
          covers: 'শামসুর রাহমান, আল মাহমুদ, সৈয়দ ওয়ালীউল্লাহ, শওকত ওসমান, মুনীর চৌধুরী, শহীদুল্লা কায়সার, জহির রায়হান, সৈয়দ শামসুল হক, আখতারুজ্জামান ইলিয়াস, হাসান আজিজুল হক, হুমায়ূন আহমেদ, সেলিনা হোসেন, রফিক আজাদ, নির্মলেন্দু গুণ, হেলাল হাফিজ; ভাষা আন্দোলন ও মুক্তিযুদ্ধভিত্তিক সাহিত্য' },
        { id: 'bn-lit-misc', group: 'lit', bn: 'ছদ্মনাম, উপাধি, সাময়িকপত্র ও বিবিধ', en: 'Pen names, titles & misc.',
          covers: 'সাহিত্যিকদের ছদ্মনাম ও উপাধি, গুরুত্বপূর্ণ সাময়িকপত্র ও সম্পাদক, বাংলা সাহিত্যে প্রথম, বিখ্যাত উক্তি ও পঙক্তি, চরিত্র ও গ্রন্থ, সাহিত্য পুরস্কার' }
      ]
    },
    {
      id: 'english', prefix: 'en', marks: 30, mono: 'En',
      bn: 'ইংরেজি ভাষা ও সাহিত্য', en: 'English Language & Literature',
      groups: [
        { id: 'lang', bn: 'ইংরেজি ভাষা', en: 'Language', share: 0.5 },
        { id: 'lit', bn: 'ইংরেজি সাহিত্য', en: 'Literature', share: 0.5 }
      ],
      topics: [
        { id: 'en-lang-parts', group: 'lang', bn: 'Parts of Speech', en: 'Parts of speech & articles',
          covers: 'Noun, pronoun, adjective, verb, adverb, preposition, conjunction, interjection; articles and determiners; number, gender and case' },
        { id: 'en-lang-verbs', group: 'lang', bn: 'Verbs & Tense', en: 'Verbs, tense, voice & narration',
          covers: 'Tense and sequence of tense, subject-verb agreement, modals, non-finites (gerund, participle, infinitive), conditionals, voice change, direct and indirect speech' },
        { id: 'en-lang-prep', group: 'lang', bn: 'Prepositions', en: 'Prepositions & phrasal verbs',
          covers: 'Appropriate prepositions, prepositions after specific words, phrasal (group) verbs' },
        { id: 'en-lang-sentence', group: 'lang', bn: 'Sentence', en: 'Sentence types & transformation',
          covers: 'Simple, complex and compound sentences; clauses and phrases; transformation of sentences; degree of comparison; question tags' },
        { id: 'en-lang-correction', group: 'lang', bn: 'Correction', en: 'Error detection & correction',
          covers: 'Spotting errors, correct form of sentences, common usage errors, redundancy' },
        { id: 'en-lang-vocab', group: 'lang', bn: 'Vocabulary', en: 'Vocabulary & analogy',
          covers: 'Synonyms, antonyms, word meanings, one-word substitution, analogy, commonly confused words' },
        { id: 'en-lang-idioms', group: 'lang', bn: 'Idioms', en: 'Idioms & phrases',
          covers: 'Meanings of common idioms and phrases, proverbs' },
        { id: 'en-lang-spelling', group: 'lang', bn: 'Spelling', en: 'Spelling & word formation',
          covers: 'Correct spelling, prefixes and suffixes, word formation, plural forms, foreign words and phrases (Latin, French) used in English' },
        { id: 'en-lit-early', group: 'lit', bn: 'Old & Middle English', en: 'Old & Middle English period',
          covers: 'Anglo-Saxon period, Beowulf, Caedmon, Bede; Middle English, Chaucer and The Canterbury Tales, Langland, Malory' },
        { id: 'en-lit-renaissance', group: 'lit', bn: 'Renaissance', en: 'Elizabethan & Jacobean age',
          covers: 'Renaissance in England, University Wits, Marlowe, Spenser, Sidney, Shakespeare (plays, sonnets, characters, famous lines), Bacon, Ben Jonson, metaphysical poets (Donne)' },
        { id: 'en-lit-neoclassical', group: 'lit', bn: 'Neo-classical', en: 'Puritan, Restoration & Neo-classical age',
          covers: 'Milton, Bunyan, Dryden, Restoration comedy, Pope, Swift, Addison and Steele, Defoe, Richardson, Fielding, Samuel Johnson, Goldsmith, Sheridan, Gray' },
        { id: 'en-lit-romantic', group: 'lit', bn: 'Romantic', en: 'Romantic period',
          covers: 'Lyrical Ballads (1798), Blake, Wordsworth, Coleridge, Byron, Shelley, Keats, Charles Lamb, Jane Austen, Walter Scott, Mary Shelley' },
        { id: 'en-lit-victorian', group: 'lit', bn: 'Victorian', en: 'Victorian period',
          covers: 'Tennyson, Robert and Elizabeth Browning, Arnold, the Rossettis, Dickens, Thackeray, the Brontes, George Eliot, Thomas Hardy, Oscar Wilde, Lewis Carroll, R. L. Stevenson' },
        { id: 'en-lit-modern', group: 'lit', bn: 'Modern', en: 'Modern & postmodern period',
          covers: 'Yeats, T. S. Eliot, Joyce, Virginia Woolf, D. H. Lawrence, Conrad, E. M. Forster, G. B. Shaw, Orwell, Huxley, Golding, Beckett, Pinter, Osborne, Ted Hughes, Seamus Heaney; modernist movements' },
        { id: 'en-lit-american', group: 'lit', bn: 'American & World', en: 'American & world literature in English',
          covers: 'Poe, Hawthorne, Melville, Whitman, Emily Dickinson, Mark Twain, Robert Frost, Hemingway, Faulkner, Steinbeck, Arthur Miller, Toni Morrison; Achebe, Naipaul, Rushdie, Tagore in English; Nobel laureates in literature' },
        { id: 'en-lit-terms', group: 'lit', bn: 'Literary terms', en: 'Literary terms, genres & lines',
          covers: 'Sonnet, ode, elegy, epic, ballad, blank verse, soliloquy, tragedy, comedy, satire, allegory, irony, alliteration and other figures of speech; famous opening lines and quotations' }
      ]
    },
    {
      id: 'bangladesh', prefix: 'bd', marks: 25, mono: 'বা',
      bn: 'বাংলাদেশ বিষয়াবলি', en: 'Bangladesh Affairs',
      topics: [
        { id: 'bd-ancient', bn: 'প্রাচীন ও মধ্যযুগের বাংলা', en: 'Ancient & medieval Bengal',
          covers: 'প্রাচীন জনপদ, মৌর্য ও গুপ্ত যুগ, শশাঙ্ক, মাৎস্যন্যায়, পাল ও সেন বংশ, সুলতানি আমল, মুঘল আমল, বারো ভূঁইয়া, সুবেদার ও নবাবি আমল, প্রাচীন নিদর্শন' },
        { id: 'bd-british', bn: 'ব্রিটিশ শাসনামল', en: 'British period',
          covers: 'পলাশী ও বক্সারের যুদ্ধ, দেওয়ানি লাভ, ছিয়াত্তরের মন্বন্তর, চিরস্থায়ী বন্দোবস্ত, ফরায়েজি ও তিতুমীরের আন্দোলন, নীল বিদ্রোহ, সিপাহি বিদ্রোহ, বঙ্গভঙ্গ (১৯০৫), মুসলিম লীগ (১৯০৬), লাহোর প্রস্তাব (১৯৪০), দেশভাগ (১৯৪৭)' },
        { id: 'bd-pakistan', bn: 'পাকিস্তান আমল (১৯৪৭–১৯৭০)', en: 'Pakistan period',
          covers: 'ভাষা আন্দোলন (১৯৪৮–১৯৫২), যুক্তফ্রন্ট নির্বাচন (১৯৫৪), সামরিক শাসন, ছয় দফা (১৯৬৬), আগরতলা ষড়যন্ত্র মামলা, ঊনসত্তরের গণঅভ্যুত্থান, ১৯৭০ সালের নির্বাচন' },
        { id: 'bd-liberation', bn: 'মহান মুক্তিযুদ্ধ (১৯৭১)', en: 'Liberation War 1971',
          covers: 'অসহযোগ আন্দোলন, ৭ মার্চের ভাষণ, অপারেশন সার্চলাইট, স্বাধীনতার ঘোষণা, মুজিবনগর সরকার, সেক্টর ও বাহিনী, বীরত্বসূচক খেতাব, বুদ্ধিজীবী হত্যা, আন্তর্জাতিক প্রতিক্রিয়া, বিজয় ও আত্মসমর্পণ' },
        { id: 'bd-post71', bn: 'স্বাধীনতা-পরবর্তী ও সাম্প্রতিক বাংলাদেশ', en: 'Post-1971 & recent Bangladesh',
          covers: 'স্বাধীনতা-পরবর্তী রাজনৈতিক ঘটনাপ্রবাহ, ১৯৯০ সালের গণঅভ্যুত্থান, তত্ত্বাবধায়ক সরকার, ২০২৪ সালের জুলাই গণঅভ্যুত্থান, অন্তর্বর্তী সরকার ও সংস্কার কমিশন, ২০২৬ সালের জাতীয় সংসদ নির্বাচন' },
        { id: 'bd-constitution', bn: 'বাংলাদেশের সংবিধান', en: 'Constitution',
          covers: 'সংবিধান প্রণয়ন ও গণপরিষদ, প্রস্তাবনা, ভাগ ও গুরুত্বপূর্ণ অনুচ্ছেদ, রাষ্ট্র পরিচালনার মূলনীতি, মৌলিক অধিকার, তফসিল, সংবিধান সংশোধনী' },
        { id: 'bd-govt', bn: 'রাষ্ট্রব্যবস্থা, সরকার ও সাংবিধানিক প্রতিষ্ঠান', en: 'Government & institutions',
          covers: 'রাষ্ট্রপতি, প্রধানমন্ত্রী ও মন্ত্রিসভা, জাতীয় সংসদ, সুপ্রিম কোর্ট ও বিচার বিভাগ, নির্বাচন কমিশন, সরকারি কর্ম কমিশন, মহা হিসাব-নিরীক্ষক, অ্যাটর্নি জেনারেল, স্থানীয় সরকার, প্রশাসনিক কাঠামো' },
        { id: 'bd-economy', bn: 'বাংলাদেশের অর্থনীতি', en: 'Economy',
          covers: 'জিডিপি ও প্রবৃদ্ধি, মাথাপিছু আয়, বাজেট ও রাজস্ব, কৃষি ও খাদ্য, শিল্প ও তৈরি পোশাক, রপ্তানি-আমদানি, রেমিট্যান্স, ব্যাংকিং ও আর্থিক প্রতিষ্ঠান, এলডিসি উত্তরণ, অর্থনৈতিক অঞ্চল ও ইপিজেড, উন্নয়ন পরিকল্পনা' },
        { id: 'bd-resources', bn: 'জনসংখ্যা, সম্পদ ও অবকাঠামো', en: 'Population, resources & infrastructure',
          covers: 'জনশুমারি ও জনসংখ্যা, খনিজ সম্পদ (গ্যাস, কয়লা, কঠিন শিলা, চুনাপাথর), বিদ্যুৎ ও জ্বালানি, বড় অবকাঠামো প্রকল্প (পদ্মা সেতু, মেট্রোরেল, রূপপুর, কর্ণফুলী টানেল), সড়ক-রেল-নৌ ও বন্দর, যোগাযোগ' },
        { id: 'bd-culture', bn: 'সংস্কৃতি, ঐতিহ্য ও জাতীয় বিষয়াবলি', en: 'Culture, heritage & national symbols',
          covers: 'জাতীয় প্রতীক ও জাতীয় বিষয়াবলি, প্রত্নস্থান ও স্থাপত্য, বিশ্ব ঐতিহ্য, ক্ষুদ্র নৃগোষ্ঠী, উৎসব ও লোকসংস্কৃতি, শিল্পকলা, ভৌগোলিক নির্দেশক (জিআই) পণ্য, খেলাধুলা, পুরস্কার ও পদক' },
        { id: 'bd-foreign', bn: 'বৈদেশিক সম্পর্ক ও আন্তর্জাতিক অঙ্গনে বাংলাদেশ', en: 'Foreign relations',
          covers: 'জাতিসংঘসহ আন্তর্জাতিক সংস্থায় সদস্যপদ, শান্তিরক্ষা মিশন, সমুদ্রসীমা নিষ্পত্তি, স্থলসীমান্ত চুক্তি ও ছিটমহল বিনিময়, গঙ্গা পানিচুক্তি, রোহিঙ্গা সংকট, প্রতিবেশী দেশের সঙ্গে সম্পর্ক' }
      ]
    },
    {
      id: 'international', prefix: 'ia', marks: 25, mono: 'আ',
      bn: 'আন্তর্জাতিক বিষয়াবলি', en: 'International Affairs',
      topics: [
        { id: 'ia-concepts', bn: 'আন্তর্জাতিক সম্পর্ক: ধারণা ও পরিভাষা', en: 'IR concepts & terms',
          covers: 'রাষ্ট্র ও সার্বভৌমত্ব, জাতীয় স্বার্থ, শক্তিসাম্য, কূটনীতি, পররাষ্ট্রনীতি, ভূরাজনীতি, বিশ্বায়ন, গুরুত্বপূর্ণ পরিভাষা (ভেটো, দাঁতাত, গ্লাসনস্ত, ব্রেক্সিট ইত্যাদি)' },
        { id: 'ia-history', bn: 'বিশ্ব ইতিহাস ও রাজনৈতিক ঘটনাপ্রবাহ', en: 'World history',
          covers: 'প্রাচীন সভ্যতা, আমেরিকান-ফরাসি-রুশ-চীনা বিপ্লব, প্রথম ও দ্বিতীয় বিশ্বযুদ্ধ, লিগ অব নেশনস, স্নায়ুযুদ্ধ, উপনিবেশবাদ ও স্বাধীনতা আন্দোলন, সোভিয়েত ইউনিয়নের পতন' },
        { id: 'ia-un', bn: 'জাতিসংঘ ও এর সংস্থাসমূহ', en: 'United Nations',
          covers: 'জাতিসংঘ প্রতিষ্ঠা ও সনদ, প্রধান অঙ্গসংস্থা, নিরাপত্তা পরিষদ ও ভেটো, মহাসচিব, বিশেষায়িত সংস্থা ও সদর দপ্তর, শান্তিরক্ষা, টেকসই উন্নয়ন লক্ষ্যমাত্রা (এসডিজি)' },
        { id: 'ia-orgs', bn: 'আঞ্চলিক ও আন্তর্জাতিক সংস্থা', en: 'Regional & global organizations',
          covers: 'সার্ক, আসিয়ান, ইইউ, আফ্রিকান ইউনিয়ন, ওআইসি, আরব লীগ, ন্যাটো, কমনওয়েলথ, জি-৭, জি-২০, ব্রিকস, এসসিও, ওপেক, বিমসটেক, ডি-৮, আইএমএফ, বিশ্বব্যাংক, এডিবি, এআইআইবি, ডব্লিউটিও' },
        { id: 'ia-treaties', bn: 'আন্তর্জাতিক চুক্তি, সম্মেলন ও কনভেনশন', en: 'Treaties & conventions',
          covers: 'শান্তিচুক্তি, অস্ত্র নিয়ন্ত্রণ (এনপিটি, সিটিবিটি), জলবায়ু চুক্তি (ইউএনএফসিসিসি, কিয়োটো, প্যারিস, কপ সম্মেলন), সমুদ্র আইন (আনক্লস), জেনেভা ও ভিয়েনা কনভেনশন, গুরুত্বপূর্ণ সম্মেলন' },
        { id: 'ia-conflicts', bn: 'আন্তর্জাতিক সংকট ও ভূরাজনীতি', en: 'Conflicts & geopolitics',
          covers: 'ফিলিস্তিন-ইসরায়েল ও মধ্যপ্রাচ্য, কাশ্মীর, রোহিঙ্গা সংকট, রাশিয়া-ইউক্রেন যুদ্ধ, কোরীয় উপদ্বীপ, দক্ষিণ চীন সাগর, আফ্রিকা ও অন্যান্য অঞ্চলের সংকট' },
        { id: 'ia-countries', bn: 'বিশ্বের দেশ ও অঞ্চল', en: 'Countries & regions',
          covers: 'রাজধানী, মুদ্রা, আইনসভা, গুরুত্বপূর্ণ সীমারেখা ও প্রণালী, দেশের পূর্বনাম ও উপনাম, স্থলবেষ্টিত দেশ, নতুন রাষ্ট্র' },
        { id: 'ia-economy', bn: 'বিশ্ব অর্থনীতি ও উন্নয়ন', en: 'World economy & development',
          covers: 'বাণিজ্য জোট ও মুক্ত বাণিজ্য, বৈশ্বিক সূচক (মানব উন্নয়ন সূচক ইত্যাদি) ও প্রকাশকারী সংস্থা, অর্থনৈতিক পরিভাষা, আন্তর্জাতিক মুদ্রাব্যবস্থা' },
        { id: 'ia-misc', bn: 'পুরস্কার, খেলাধুলা, ব্যক্তিত্ব ও বিবিধ', en: 'Awards, sports & personalities',
          covers: 'নোবেল ও অন্যান্য আন্তর্জাতিক পুরস্কার, অলিম্পিক ও বিশ্বকাপ, বিখ্যাত ব্যক্তিত্ব ও উক্তি, আন্তর্জাতিক দিবস, সংবাদ সংস্থা ও গণমাধ্যম' },
        { id: 'ia-current', bn: 'সাম্প্রতিক বিশ্ব (২০২৪–২০২৬)', en: 'Current world affairs',
          covers: 'সাম্প্রতিক নির্বাচন ও নেতৃত্ব পরিবর্তন, শীর্ষ সম্মেলন, চলমান সংঘাত ও শান্তি উদ্যোগ, সাম্প্রতিক জলবায়ু সম্মেলন। (তারিখসহ যাচাই করে পড়ুন)' }
      ]
    },
    {
      id: 'geography', prefix: 'geo', marks: 10, mono: 'ভূ',
      bn: 'ভূগোল (বাংলাদেশ ও বিশ্ব), পরিবেশ ও দুর্যোগ ব্যবস্থাপনা', en: 'Geography, Environment & Disaster Management',
      topics: [
        { id: 'geo-physical', bn: 'ভৌত ভূগোল ও সৌরজগৎ', en: 'Physical geography & solar system',
          covers: 'সৌরজগৎ ও পৃথিবী, পৃথিবীর গতি, অক্ষাংশ-দ্রাঘিমাংশ ও সময়, পৃথিবীর অভ্যন্তরীণ গঠন, শিলা, ভূমিরূপ, বায়ুমণ্ডলের স্তর, সমুদ্রস্রোত, জোয়ার-ভাটা' },
        { id: 'geo-bangladesh', bn: 'বাংলাদেশের ভূগোল', en: 'Geography of Bangladesh',
          covers: 'অবস্থান, আয়তন ও সীমানা, ভূপ্রকৃতি, নদ-নদী, দ্বীপ ও চর, বনাঞ্চল, হাওর-বাঁওড়, ঋতু ও জলবায়ু, প্রশাসনিক বিভাগ' },
        { id: 'geo-world', bn: 'বিশ্ব ভূগোল', en: 'World geography',
          covers: 'মহাদেশ ও মহাসাগর, পর্বত ও শৃঙ্গ, নদী ও হ্রদ, মরুভূমি, প্রণালী ও খাল, দ্বীপ, জলপ্রপাত, তৃণভূমি' },
        { id: 'geo-climate', bn: 'আবহাওয়া, জলবায়ু ও জলবায়ু পরিবর্তন', en: 'Weather, climate & climate change',
          covers: 'আবহাওয়া ও জলবায়ুর উপাদান, বায়ুপ্রবাহ ও মৌসুমি বায়ু, বৃষ্টিপাত, গ্রিনহাউস প্রভাব, বৈশ্বিক উষ্ণায়ন, সমুদ্রপৃষ্ঠের উচ্চতা বৃদ্ধি, জলবায়ু অভিযোজন ও প্রশমন' },
        { id: 'geo-environment', bn: 'পরিবেশ, প্রতিবেশ ও দূষণ', en: 'Environment & ecology',
          covers: 'বাস্তুতন্ত্র ও খাদ্যশৃঙ্খল, জীববৈচিত্র্য, বন ও বন্যপ্রাণী সংরক্ষণ, রক্ষিত এলাকা ও রামসার সাইট, বায়ু-পানি-মাটি-শব্দদূষণ, ওজোন স্তর, পরিবেশ আইন ও আন্তর্জাতিক উদ্যোগ' },
        { id: 'geo-disaster', bn: 'দুর্যোগ ও দুর্যোগ ব্যবস্থাপনা', en: 'Disasters & disaster management',
          covers: 'ঘূর্ণিঝড়, বন্যা, জলোচ্ছ্বাস, ভূমিকম্প, সুনামি, খরা, নদীভাঙন, বজ্রপাত, ভূমিধস; দুর্যোগ ব্যবস্থাপনা চক্র, দুর্যোগ ব্যবস্থাপনা আইন ২০১২, দুর্যোগ বিষয়ক স্থায়ী আদেশাবলি, সেন্দাই ফ্রেমওয়ার্ক, সতর্কসংকেত' }
      ]
    },
    {
      id: 'science', prefix: 'sci', marks: 15, mono: 'বি',
      bn: 'সাধারণ বিজ্ঞান', en: 'General Science',
      topics: [
        { id: 'sci-physics', bn: 'পদার্থবিজ্ঞান', en: 'Physics',
          covers: 'পরিমাপ ও একক, বল ও গতি, মহাকর্ষ, কাজ-শক্তি-ক্ষমতা, চাপ, তাপ ও তাপমাত্রা, আলো, শব্দ, স্থির ও চল বিদ্যুৎ, চুম্বকত্ব, ইলেকট্রনিক্স' },
        { id: 'sci-chemistry', bn: 'রসায়ন', en: 'Chemistry',
          covers: 'পদার্থের অবস্থা, পরমাণুর গঠন, পর্যায় সারণি, রাসায়নিক বন্ধন ও বিক্রিয়া, অম্ল-ক্ষার-লবণ ও পিএইচ, ধাতু ও অধাতু, দৈনন্দিন জীবনে রসায়ন, পলিমার, জ্বালানি' },
        { id: 'sci-biology', bn: 'জীববিজ্ঞান', en: 'Biology',
          covers: 'কোষ ও কোষ বিভাজন, জীবের শ্রেণিবিন্যাস, উদ্ভিদের গঠন ও সালোকসংশ্লেষণ, প্রাণিজগৎ, বংশগতি ও জিন, বিবর্তন, অণুজীব' },
        { id: 'sci-human', bn: 'মানবদেহ, খাদ্য ও স্বাস্থ্য', en: 'Human body, nutrition & health',
          covers: 'পরিপাক, শ্বসন, রক্ত সংবহন ও রক্তের গ্রুপ, স্নায়ু ও হরমোন, খাদ্য উপাদান, ভিটামিন ও খনিজ, রোগ ও রোগের কারণ, টিকা ও রোগ প্রতিরোধ' },
        { id: 'sci-modern', bn: 'আধুনিক বিজ্ঞান ও প্রযুক্তি', en: 'Modern science & technology',
          covers: 'তেজস্ক্রিয়তা ও পারমাণবিক শক্তি, জৈবপ্রযুক্তি ও জিন প্রকৌশল, ন্যানো প্রযুক্তি, মহাকাশ বিজ্ঞান ও কৃত্রিম উপগ্রহ, লেজার, চিকিৎসা প্রযুক্তি, নবায়নযোগ্য শক্তি' }
      ]
    },
    {
      id: 'ict', prefix: 'ict', marks: 15, mono: 'IT',
      bn: 'কম্পিউটার ও তথ্যপ্রযুক্তি', en: 'Computer & Information Technology',
      topics: [
        { id: 'ict-basics', bn: 'কম্পিউটারের ইতিহাস ও শ্রেণিবিভাগ', en: 'History & types of computers',
          covers: 'কম্পিউটারের বিকাশ ও জনক, প্রজন্ম, অ্যানালগ-ডিজিটাল-হাইব্রিড, সুপার-মেইনফ্রেম-মিনি-মাইক্রো কম্পিউটার' },
        { id: 'ict-hardware', bn: 'হার্ডওয়্যার ও মেমোরি', en: 'Hardware & memory',
          covers: 'ইনপুট ও আউটপুট ডিভাইস, সিপিইউ ও এর অংশ, প্রাথমিক মেমোরি (র‍্যাম, রম, ক্যাশ), সহায়ক মেমোরি, পোর্ট ও বাস' },
        { id: 'ict-software', bn: 'সফটওয়্যার, অপারেটিং সিস্টেম ও প্রোগ্রামিং', en: 'Software, OS & programming',
          covers: 'সিস্টেম ও অ্যাপ্লিকেশন সফটওয়্যার, অপারেটিং সিস্টেম, প্রোগ্রামিং ভাষার প্রজন্ম, অনুবাদক প্রোগ্রাম, অ্যালগরিদম ও ফ্লোচার্ট, ওপেন সোর্স' },
        { id: 'ict-number', bn: 'সংখ্যা পদ্ধতি ও ডিজিটাল লজিক', en: 'Number systems & logic',
          covers: 'বাইনারি, অক্টাল, ডেসিমাল ও হেক্সাডেসিমাল রূপান্তর, কোড (ASCII, Unicode, BCD), বুলিয়ান অ্যালজেব্রা, লজিক গেট' },
        { id: 'ict-network', bn: 'ডেটা কমিউনিকেশন ও নেটওয়ার্ক', en: 'Data communication & networks',
          covers: 'ডেটা ট্রান্সমিশন মোড ও মাধ্যম, ব্যান্ডউইথ, নেটওয়ার্ক টপোলজি, ল্যান-ম্যান-ওয়্যান, নেটওয়ার্ক ডিভাইস, OSI মডেল ও প্রোটোকল, মোবাইল প্রজন্ম, ওয়াই-ফাই ও ব্লুটুথ' },
        { id: 'ict-internet', bn: 'ইন্টারনেট, ওয়েব ও ই-মেইল', en: 'Internet, web & email',
          covers: 'ইন্টারনেটের ইতিহাস, WWW, URL, ডোমেইন ও DNS, IP ঠিকানা, HTTP/HTTPS, ব্রাউজার ও সার্চ ইঞ্জিন, ই-মেইল, HTML, সামাজিক যোগাযোগমাধ্যম' },
        { id: 'ict-database', bn: 'ডেটাবেজ ও অফিস অ্যাপ্লিকেশন', en: 'Database & office apps',
          covers: 'ডেটাবেজ ও DBMS, SQL, প্রাইমারি কি, ওয়ার্ড প্রসেসর, স্প্রেডশিট ও ফাংশন, প্রেজেন্টেশন, কি-বোর্ড শর্টকাট' },
        { id: 'ict-emerging', bn: 'সাইবার নিরাপত্তা ও আধুনিক প্রযুক্তি', en: 'Cyber security & emerging tech',
          covers: 'ভাইরাস ও ম্যালওয়্যার, হ্যাকিং ও ফিশিং, এনক্রিপশন ও ফায়ারওয়াল, কৃত্রিম বুদ্ধিমত্তা, মেশিন লার্নিং, আইওটি, ক্লাউড কম্পিউটিং, ব্লকচেইন, ভার্চুয়াল রিয়েলিটি, রোবটিক্স, বায়োমেট্রিক্স, ই-কমার্স ও ই-গভর্নেন্স' }
      ]
    },
    {
      id: 'math', prefix: 'mat', marks: 20, mono: '∑',
      bn: 'গাণিতিক যুক্তি', en: 'Mathematical Reasoning',
      topics: [
        { id: 'mat-number', bn: 'সংখ্যা, ল.সা.গু-গ.সা.গু ও ভগ্নাংশ', en: 'Numbers, LCM-HCF & fractions',
          covers: 'বাস্তব সংখ্যা, মৌলিক সংখ্যা, বিভাজ্যতা, ল.সা.গু ও গ.সা.গু, ভগ্নাংশ ও দশমিক, বর্গ ও বর্গমূল, সরলীকরণ' },
        { id: 'mat-percent', bn: 'শতকরা, লাভ-ক্ষতি ও সুদকষা', en: 'Percentage, profit-loss & interest',
          covers: 'শতকরা, লাভ-ক্ষতি, সরল মুনাফা ও চক্রবৃদ্ধি মুনাফা' },
        { id: 'mat-ratio', bn: 'অনুপাত, গড় ও প্রায়োগিক সমস্যা', en: 'Ratio, average & word problems',
          covers: 'অনুপাত ও সমানুপাত, অংশীদারি কারবার, গড়, বয়স, কাজ ও সময়, নল ও চৌবাচ্চা, সময়-দূরত্ব-গতি, নৌকা ও স্রোত, মিশ্রণ' },
        { id: 'mat-algebra', bn: 'বীজগাণিতিক সূত্র, উৎপাদক ও সমীকরণ', en: 'Algebra & equations',
          covers: 'বীজগাণিতিক সূত্রাবলি, উৎপাদকে বিশ্লেষণ, বীজগাণিতিক ল.সা.গু-গ.সা.গু, সরল ও দ্বিঘাত সমীকরণ, সহসমীকরণ, অসমতা' },
        { id: 'mat-exponent', bn: 'সূচক, লগারিদম ও ধারা', en: 'Indices, logarithms & series',
          covers: 'সূচকের নিয়ম, লগারিদমের সূত্র, সমান্তর ও গুণোত্তর ধারা, ধারার সমষ্টি' },
        { id: 'mat-set', bn: 'সেট ও ফাংশন', en: 'Sets & functions',
          covers: 'সেট প্রকাশের পদ্ধতি, উপসেট ও শক্তি সেট, সংযোগ-ছেদ-অন্তর, ভেনচিত্রভিত্তিক সমস্যা, অন্বয় ও ফাংশন' },
        { id: 'mat-geometry', bn: 'জ্যামিতি', en: 'Geometry',
          covers: 'রেখা ও কোণ, ত্রিভুজ ও এর ধর্ম, পিথাগোরাসের উপপাদ্য, চতুর্ভুজ, বহুভুজ ও এর কোণ, বৃত্ত, স্পর্শক, সদৃশতা' },
        { id: 'mat-mensuration', bn: 'পরিমিতি', en: 'Mensuration',
          covers: 'ত্রিভুজ, চতুর্ভুজ ও বৃত্তের ক্ষেত্রফল ও পরিসীমা, ঘনক, আয়তঘন, বেলন, কোণক ও গোলকের আয়তন ও পৃষ্ঠতল' },
        { id: 'mat-trig', bn: 'ত্রিকোণমিতি', en: 'Trigonometry',
          covers: 'ত্রিকোণমিতিক অনুপাত, আদর্শ কোণের মান, অভেদাবলি, উচ্চতা ও দূরত্ব' },
        { id: 'mat-stat', bn: 'পরিসংখ্যান, বিন্যাস-সমাবেশ ও সম্ভাবনা', en: 'Statistics, permutation & probability',
          covers: 'গড়, মধ্যক, প্রচুরক, বিন্যাস ও সমাবেশ, সম্ভাবনার মৌলিক ধারণা' }
      ]
    },
    {
      id: 'mental', prefix: 'men', marks: 15, mono: 'ম',
      bn: 'মানসিক দক্ষতা', en: 'Mental Ability',
      topics: [
        { id: 'men-verbal', bn: 'ভাষাগত যৌক্তিক বিচার', en: 'Verbal reasoning',
          covers: 'সাদৃশ্য (অ্যানালজি), শ্রেণিকরণ ও বেমানান নির্ণয়, সিদ্ধান্ত গ্রহণ (সিলোজিজম), রক্তের সম্পর্ক, দিক নির্ণয়, কোডিং-ডিকোডিং' },
        { id: 'men-numerical', bn: 'সংখ্যাগত ক্ষমতা', en: 'Numerical ability',
          covers: 'সংখ্যা ও বর্ণের ধারা, অনুপস্থিত সংখ্যা, সংখ্যার প্যাটার্ন, দ্রুত হিসাব' },
        { id: 'men-problem', bn: 'সমস্যা সমাধান', en: 'Problem solving',
          covers: 'ঘড়ি, ক্যালেন্ডার, ক্রম ও অবস্থান নির্ণয়, বসার বিন্যাস, যৌক্তিক ধাঁধা' },
        { id: 'men-mechanical', bn: 'যান্ত্রিক দক্ষতা', en: 'Mechanical reasoning',
          covers: 'গিয়ার ও চাকা, পুলি, লিভার ও ভারসাম্য, সরল যন্ত্র, চাপ, ঘর্ষণ ও দৈনন্দিন যন্ত্রকৌশল' },
        { id: 'men-spatial', bn: 'স্থানিক ও দৃশ্যমান সম্পর্ক', en: 'Spatial visualization',
          covers: 'ঘনক ও ছক্কা, রং করা ঘনক কাটা, আয়না ও পানির প্রতিবিম্ব, কাগজ ভাঁজ, চিত্র ও রেখা গণনা' },
        { id: 'men-language', bn: 'বানান ও ভাষা', en: 'Spelling & language',
          covers: 'শুদ্ধ বানান (বাংলা ও ইংরেজি), শব্দের অর্থ, সমার্থক ও বিপরীত শব্দ, শূন্যস্থান পূরণ' }
      ]
    },
    {
      id: 'ethics', prefix: 'eth', marks: 15, mono: 'নৈ',
      bn: 'নৈতিকতা, মূল্যবোধ ও সুশাসন', en: 'Ethics, Values & Good Governance',
      topics: [
        { id: 'eth-ethics', bn: 'নৈতিকতা: ধারণা, উৎস ও দর্শন', en: 'Ethics: concepts & philosophers',
          covers: 'নৈতিকতা ও নীতিবিদ্যার সংজ্ঞা ও ব্যুৎপত্তি, নৈতিকতার উৎস, নৈতিক ও আইনগত বাধ্যবাধকতা, সক্রেটিস, প্লেটো, অ্যারিস্টটল, কান্ট, বেন্থাম ও মিলের মতবাদ' },
        { id: 'eth-values', bn: 'মূল্যবোধ ও মূল্যবোধ শিক্ষা', en: 'Values',
          covers: 'মূল্যবোধের সংজ্ঞা ও প্রকারভেদ (সামাজিক, নৈতিক, রাজনৈতিক, গণতান্ত্রিক, সাংস্কৃতিক, ধর্মীয়), মূল্যবোধ শিক্ষা, শিষ্টাচার, সহনশীলতা, শৃঙ্খলা, মূল্যবোধের অবক্ষয়' },
        { id: 'eth-law', bn: 'আইন, স্বাধীনতা, সাম্য ও মানবাধিকার', en: 'Law, liberty, equality & rights',
          covers: 'আইনের সংজ্ঞা ও উৎস, আইনের শাসন, স্বাধীনতা ও সাম্য, নাগরিকের অধিকার ও কর্তব্য, মানবাধিকারের সর্বজনীন ঘোষণা (১৯৪৮)' },
        { id: 'eth-governance', bn: 'সুশাসন: ধারণা ও উপাদান', en: 'Good governance',
          covers: 'সুশাসনের সংজ্ঞা ও বৈশিষ্ট্য (জাতিসংঘ, ইউএনডিপি, বিশ্বব্যাংক, এডিবি), জবাবদিহিতা, স্বচ্ছতা, অংশগ্রহণ, আইনের শাসন, ই-গভর্নেন্স, সুশাসন প্রতিষ্ঠার অন্তরায় ও উপায়' },
        { id: 'eth-integrity', bn: 'শুদ্ধাচার ও দুর্নীতি প্রতিরোধ', en: 'Integrity & anti-corruption',
          covers: 'জাতীয় শুদ্ধাচার কৌশল (২০১২), দুর্নীতি দমন কমিশন, তথ্য অধিকার আইন (২০০৯) ও তথ্য কমিশন, ন্যায়পাল, জাতীয় মানবাধিকার কমিশন, নাগরিক সনদ, অভিযোগ প্রতিকার ব্যবস্থা, টিআইবি ও দুর্নীতির ধারণাসূচক, জাতিসংঘের দুর্নীতিবিরোধী কনভেনশন' },
        { id: 'eth-public', bn: 'সরকারি সেবা ও পেশাগত নৈতিকতা', en: 'Public service ethics',
          covers: 'সরকারি কর্মচারীর আচরণ বিধিমালা, পেশাগত নৈতিকতা, স্বার্থের দ্বন্দ্ব, নিরপেক্ষতা ও দায়বদ্ধতা, সেবাপ্রদানে নৈতিকতা' }
      ]
    }
  ];

  // Lookups used across the app.
  BCS.subjectById = {};
  BCS.topicById = {};
  BCS.subjects.forEach(function (s) {
    BCS.subjectById[s.id] = s;
    s.topics.forEach(function (t) {
      t.subject = s.id;
      BCS.topicById[t.id] = t;
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
