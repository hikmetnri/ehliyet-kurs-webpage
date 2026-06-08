import { getCategoryTreeIds, normalizeId } from './wrongAnswers';

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const parseDate = (value) => {
  const date = new Date(value || '');
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSameLocalDay = (a, b) => (
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()
);

const getResultCategoryId = (result) => (
  normalizeId(result?.categoryId || result?.category)
);

export const filterResultsToCategoryTree = (results = [], categories = [], rootId = '') => {
  if (!rootId) return results;
  const scopedIds = getCategoryTreeIds(categories, rootId);
  if (scopedIds.size === 0) return results;
  return results.filter((result) => scopedIds.has(getResultCategoryId(result)));
};

export const buildScopedStats = ({
  baseStats = {},
  results = [],
  categories = [],
  selectedCategoryId = '',
}) => {
  if (!selectedCategoryId) {
    return { stats: baseStats, results, scope: 'all' };
  }

  const scopedResults = filterResultsToCategoryTree(results, categories, selectedCategoryId);
  const totalExams = scopedResults.length;
  const totalQuestions = scopedResults.reduce((sum, result) => sum + toNumber(result.totalQuestions), 0);
  const totalCorrect = scopedResults.reduce((sum, result) => sum + toNumber(result.correctCount), 0);
  const totalWrong = scopedResults.reduce((sum, result) => sum + toNumber(result.wrongCount), 0);
  const passedCount = scopedResults.filter((result) => result.passed === true).length;
  const totalDuration = scopedResults.reduce((sum, result) => sum + toNumber(result.duration), 0);
  const today = new Date();
  const todayQuestions = scopedResults.reduce((sum, result) => {
    const date = parseDate(result.createdAt || result.date || result._queuedAt);
    return date && isSameLocalDay(date, today)
      ? sum + toNumber(result.totalQuestions)
      : sum;
  }, 0);
  const successRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalDuration / totalQuestions) : 0;

  return {
    stats: {
      ...baseStats,
      totalExams,
      totalQuestions,
      totalCorrect,
      totalWrong,
      passedCount,
      failedCount: Math.max(0, totalExams - passedCount),
      successRate,
      todayQuestions,
      totalDuration,
      avgTimePerQuestion,
      scope: 'selected_category',
    },
    results: scopedResults,
    scope: 'selected_category',
  };
};
