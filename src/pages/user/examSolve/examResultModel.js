import { TEST_TYPES } from '../../../constants/testTypes';

export function resolveExamMode({ forceRealMode, customType, exam }) {
  if (forceRealMode) return 'real';
  const modes = {
    [TEST_TYPES.SHORT_TEST]: 'short',
    [TEST_TYPES.WRONG_REVIEW]: 'review',
    [TEST_TYPES.WRONG_ANSWERS]: 'wrong',
    [TEST_TYPES.REAL_TEST]: 'real',
    [TEST_TYPES.REAL_EXAM]: 'real',
    [TEST_TYPES.MOCK_EXAM]: 'mock',
  };
  if (customType && modes[customType]) return modes[customType];
  if (exam?.testType && modes[exam.testType]) return modes[exam.testType];
  const name = exam?.name?.toLowerCase() || '';
  return name && !name.includes('deneme') && !name.includes('mock') ? 'real' : 'mock';
}

export function summarizeAnswers(questions, answers) {
  let correct = 0;
  let wrong = 0;
  const wrongQuestions = [];
  questions.forEach((q, i) => {
    const answer = answers[i];
    if (Number.isInteger(q.correctAnswer) && answer === q.correctAnswer) {
      correct++;
    } else if (answer !== undefined) {
      wrong++;
      wrongQuestions.push({
        questionId: q._id,
        questionText: q.text,
        options: q.options,
        userAnswer: answer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        media: q.media || '',
        mediaDescription: q.mediaDescription || '',
        categoryId: typeof q.category === 'object' ? q.category?._id : q.category,
        categoryName: typeof q.category === 'object' ? q.category?.name : '',
        testType: q.testType,
        subject: q.subject || '',
      });
    }
  });
  return {
    correct, wrong, wrongQuestions,
    empty: questions.length - Object.keys(answers).length,
    hiddenAnswers: questions.some(q => !Number.isInteger(q.correctAnswer)),
  };
}

export function answerPayload(questions, answers) {
  return questions.map((question, index) => ({
    questionId: question._id,
    answer: answers[index] ?? -1,
  }));
}

export function applyAnswerKey(questions, answers, key, passingScore) {
  const verifiedQuestions = questions.map(question => ({
    ...question, correctAnswer: key.get(question._id),
  }));
  const correct = verifiedQuestions.reduce((count, question, index) => (
    answers[index] === question.correctAnswer ? count + 1 : count
  ), 0);
  const wrong = verifiedQuestions.reduce((count, question, index) => (
    answers[index] !== undefined && answers[index] !== question.correctAnswer ? count + 1 : count
  ), 0);
  return {
    questions: verifiedQuestions,
    correct,
    wrong,
    passed: questions.length > 0 && correct * 100 >= passingScore * questions.length,
  };
}
