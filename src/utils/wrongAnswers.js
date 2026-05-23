export const readApiList = (payload) => {
  const data = payload?.data?.data || payload?.data?.items || payload?.data;
  return Array.isArray(data) ? data : [];
};

export const normalizeId = (value) => {
  if (!value) return '';
  if (typeof value === 'object') return String(value._id || value.id || '');
  return String(value);
};

export const getQuestionCategoryId = (question) => (
  normalizeId(question?.category) || normalizeId(question?.categoryId)
);

export const getCategoryTreeIds = (categories = [], rootId = '') => {
  if (!rootId) return new Set();

  const childrenByParent = new Map();
  categories
    .filter((category) => category?.isActive !== false)
    .forEach((category) => {
      const parentId = normalizeId(category.parent);
      if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
      childrenByParent.get(parentId).push(normalizeId(category._id || category.id));
    });

  const ids = new Set([rootId]);
  const walk = (parentId) => {
    (childrenByParent.get(parentId) || []).forEach((childId) => {
      if (!childId || ids.has(childId)) return;
      ids.add(childId);
      walk(childId);
    });
  };

  walk(rootId);
  return ids;
};

export const filterQuestionsToCategoryTree = (questions = [], categories = [], rootId = '') => {
  if (!rootId) return questions;
  const scopedIds = getCategoryTreeIds(categories, rootId);
  if (scopedIds.size === 0) return questions;
  return questions.filter((question) => scopedIds.has(getQuestionCategoryId(question)));
};

const mapWrongAnswerToQuestion = (item, source) => {
  const questionId = normalizeId(item?.questionId || source?._id || source?.id);
  const options = Array.isArray(source?.options) && source.options.length
    ? source.options
    : Array.isArray(item?.options)
      ? item.options
      : [];
  const sourceCategory = source?.category;

  return {
    ...source,
    _id: questionId,
    questionId,
    text: source?.text || item?.questionText || '',
    options,
    correctAnswer: source?.correctAnswer ?? item?.correctAnswer ?? 0,
    userAnswer: item?.userAnswer,
    explanation: source?.explanation || item?.explanation || '',
    media: source?.media || item?.media || '',
    category: sourceCategory || item?.categoryId || '',
    categoryName: sourceCategory?.name || item?.categoryName || '',
    testType: source?.testType || item?.testType || 'wrong_answers',
    subject: source?.subject || item?.subject || '',
    wrongCount: item?.wrongCount || 1,
    nextReviewAt: item?.nextReviewAt || null,
    lastWrongAt: item?.lastWrongAt || item?.updatedAt || null,
  };
};

export const hydrateWrongAnswers = async (api, wrongItems = []) => {
  const ids = [...new Set(wrongItems.map((item) => normalizeId(item?.questionId)).filter(Boolean))];
  const sourceQuestions = ids.length > 0
    ? await api.get(`/questions?ids=${ids.join(',')}`)
      .then((res) => readApiList(res))
      .catch(() => [])
    : [];
  const sourceMap = new Map(sourceQuestions.map((question) => [normalizeId(question._id || question.id), question]));

  return wrongItems
    .map((item) => mapWrongAnswerToQuestion(item, sourceMap.get(normalizeId(item?.questionId))))
    .filter((question) => question._id && question.text);
};
