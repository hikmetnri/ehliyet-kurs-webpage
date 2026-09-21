/**
 * Test türü tel (wire) değerleri — Flutter/web/backend ortak sözleşmesi.
 * Mevcut değerler DEĞİŞTİRİLEMEZ (veritabanı ve istemcilerle birebir uyumlu).
 */
export const TEST_TYPES = Object.freeze({
  SHORT_TEST: 'short_test',
  QUICK_TEST: 'quick_test',
  MOCK_EXAM: 'mock_exam',
  REAL_EXAM: 'real_exam',
  EXAM: 'exam',
  WRONG_REVIEW: 'wrong_review',
  WRONG_ANSWERS: 'wrong_answers',
  REAL_TEST: 'real_test', // eski kayıtlar
});

// Question ve Exam aynı kümeyi paylaşır ('exam' legacy olarak korunur)
export const QUESTION_TEST_TYPES = Object.freeze([
  TEST_TYPES.SHORT_TEST,
  TEST_TYPES.MOCK_EXAM,
  TEST_TYPES.REAL_EXAM,
  TEST_TYPES.EXAM,
]);
export const EXAM_TEST_TYPES = QUESTION_TEST_TYPES;

export const EXAM_RESULT_TEST_TYPES = Object.freeze([
  ...QUESTION_TEST_TYPES,
  TEST_TYPES.WRONG_REVIEW,
  TEST_TYPES.WRONG_ANSWERS,
  TEST_TYPES.REAL_TEST,
]);

// Sınav benzeri türler (sınav kimliği gerektirenler)
export const EXAM_LIKE_TEST_TYPES = Object.freeze([
  TEST_TYPES.MOCK_EXAM,
  TEST_TYPES.REAL_EXAM,
  TEST_TYPES.EXAM,
]);

// Yanlış tekrarı ailesi
export const WRONG_REVIEW_TEST_TYPES = Object.freeze([
  TEST_TYPES.WRONG_REVIEW,
  TEST_TYPES.WRONG_ANSWERS,
]);
