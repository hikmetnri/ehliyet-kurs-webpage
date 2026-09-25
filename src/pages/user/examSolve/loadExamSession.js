import { TEST_TYPES } from '../../../constants/testTypes';
import { filterQuestionsToCategoryTree, hydrateWrongAnswers, normalizeId, readApiList } from '../../../utils/wrongAnswers';
import { fetchAllQuestions } from '../../../utils/questionPages';
import { REVIEW_SESSION_LIMIT, shuffleArray } from './examSolveUtils';

async function loadShortTest({ apiClient, categoryId, loadQuestions }) {
  const [questions, category] = await Promise.all([
    loadQuestions({ category: categoryId, testType: TEST_TYPES.SHORT_TEST }, apiClient),
    apiClient.get(`/categories/${categoryId}`),
  ]);
  const sessionQuestions = questions.length > 500 ? shuffleArray(questions).slice(0, 500) : questions;
  const categoryName = category.data?.data?.name;
  return {
    questions: sessionQuestions,
    exam: {
      _id: `short_test_${categoryId}`,
      name: `${categoryName || 'Konu'} Kısa Testi`,
      categoryName: categoryName || 'Konu Testi',
      description: 'Bu kategorideki konulardan oluşan özel test.',
      duration: Math.max(10, Math.ceil(sessionQuestions.length * 1.5)),
      categoryId,
    },
  };
}

async function loadRealTest({ apiClient, categoryId, loadQuestions }) {
  const questions = (await loadQuestions({}, apiClient)).filter(question => (
    [TEST_TYPES.REAL_EXAM, TEST_TYPES.MOCK_EXAM, TEST_TYPES.EXAM].includes(question.testType)
  ));
  const sessionQuestions = shuffleArray(questions).slice(0, 50);
  return {
    questions: sessionQuestions,
    exam: {
      _id: `real_test_${categoryId}`,
      name: 'E-Sınav Simülatörü',
      categoryName: 'Karma Simülasyon',
      description: `MEB formatında ${sessionQuestions.length} soruluk elektronik sınav simülasyonu. Anında geri bildirim yoktur, süreyi verimli kullanın.`,
      duration: 45,
      categoryId,
    },
  };
}

async function loadWrongPool({ apiClient, user, review }) {
  const [wrongResponse, categoryResponse] = await Promise.all([
    apiClient.get(review ? '/wrong-answers/review-due?limit=100' : '/wrong-answers'),
    user?.selectedCategoryId
      ? apiClient.get('/categories/all').catch(() => ({ data: [] }))
      : Promise.resolve({ data: [] }),
  ]);
  const hydrated = await hydrateWrongAnswers(apiClient, readApiList(wrongResponse));
  const scoped = filterQuestionsToCategoryTree(
    hydrated, readApiList(categoryResponse), normalizeId(user?.selectedCategoryId),
  );
  const valid = scoped.filter(question => (
    question._id && question.text && Array.isArray(question.options) && question.options.length > 0
  ));
  const sessionQuestions = review
    ? valid.slice(0, REVIEW_SESSION_LIMIT)
    : valid.length > 500 ? shuffleArray(valid).slice(0, 500) : valid;
  return {
    questions: sessionQuestions,
    exam: review ? {
      _id: 'wrong_review_today',
      name: 'Bugün Çözülecek Yanlışlar',
      categoryName: 'Yanlış Tekrarı',
      description: 'Bugün yeniden çözmen gereken yanlış sorulardan oluşan kişisel çalışma testi.',
      duration: Math.max(10, Math.ceil(sessionQuestions.length * 1.5)),
      categoryId: user?.selectedCategoryId || null,
      reviewTotalCount: scoped.length,
      reviewSessionLimit: REVIEW_SESSION_LIMIT,
      testType: TEST_TYPES.WRONG_REVIEW,
    } : {
      _id: 'wrong_answers_all',
      name: 'Yanlışlar Testi',
      categoryName: 'Yanlışlarım',
      description: 'Yanlış yaptığın sorulardan oluşan kişisel tekrar testi.',
      duration: Math.max(10, Math.ceil(sessionQuestions.length * 1.5)),
      categoryId: user?.selectedCategoryId || null,
      testType: TEST_TYPES.WRONG_ANSWERS,
    },
  };
}

async function loadPublishedExam({ apiClient, examId, loadQuestions }) {
  const [examResponse, questions] = await Promise.all([
    apiClient.get(`/exams/${examId}`),
    loadQuestions({ exam: examId }, apiClient),
  ]);
  const exam = examResponse.data?.exam || examResponse.data;
  return {
    questions,
    exam: {
      ...exam,
      categoryName: exam.categoryId?.name || exam.categoryName || 'Genel Sınav',
    },
  };
}

const sessionLoaders = {
  [TEST_TYPES.SHORT_TEST]: loadShortTest,
  [TEST_TYPES.REAL_TEST]: loadRealTest,
  [TEST_TYPES.WRONG_REVIEW]: context => loadWrongPool({ ...context, review: true }),
  [TEST_TYPES.WRONG_ANSWERS]: context => loadWrongPool({ ...context, review: false }),
};

export function loadExamSession({ apiClient, customType, examId, categoryId, user, loadQuestions = fetchAllQuestions }) {
  const context = { apiClient, customType, examId, categoryId, user, loadQuestions };
  return (sessionLoaders[customType] || loadPublishedExam)(context);
}
