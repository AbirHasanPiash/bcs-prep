/*
 * Data registry. Loaded before every other data file.
 * Content files call BCS.addQuestions / addNotes / addFlashcards with a subject id.
 * Works in the browser (window) and in Node (tools/validate.js) via globalThis.
 */
(function (root) {
  var BCS = (root.BCS = root.BCS || {});
  BCS.questions = BCS.questions || {};
  BCS.notes = BCS.notes || {};
  BCS.flashcards = BCS.flashcards || {};

  function adder(store) {
    return function (subject, list) {
      if (!Array.isArray(list)) throw new Error('BCS: expected an array for "' + subject + '"');
      (store[subject] = store[subject] || []).push.apply(store[subject], list);
    };
  }

  BCS.addQuestions = adder(BCS.questions);
  BCS.addNotes = adder(BCS.notes);
  BCS.addFlashcards = adder(BCS.flashcards);
})(typeof window !== 'undefined' ? window : globalThis);
