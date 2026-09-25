import { TEST_TYPES } from '../../../constants/testTypes';

export const createContentAdminRepository = ({ client, loadQuestions }) => ({
  async loadCategories() {
    try {
      const response = await client.get('/categories/admin/all');
      return response.data?.data || [];
    } catch (error) {
      if (error.response?.status !== 404) throw error;
      const response = await client.get('/categories/all');
      return response.data?.data || [];
    }
  },

  async loadShortTestQuestions(categoryId) {
    const questions = await loadQuestions({ testType: TEST_TYPES.SHORT_TEST, category: categoryId });
    return questions.filter(question => (question.category?._id || question.category) === categoryId);
  },

  reorderCategories(parentId, categories) {
    const orders = categories.map((category, index) => ({
      id: category._id, order: index, parent: parentId,
    }));
    return client.put('/categories/reorder', { orders });
  },

  saveDraft(categoryId, content) {
    return client.put(`/categories/${categoryId}`, {
      publicationAction: 'save_draft', draftContent: content,
    });
  },

  publish(categoryId, content) {
    return client.put(`/categories/${categoryId}`, {
      publicationAction: 'publish', content,
    });
  },

  deleteQuestion(questionId) {
    return client.delete(`/questions/${questionId}`);
  },

  async saveQuestion(questionId, payload) {
    const response = questionId
      ? await client.put(`/questions/${questionId}`, payload)
      : await client.post('/questions', payload);
    return response.data;
  },

  saveCategory(categoryId, form) {
    return categoryId
      ? client.put(`/categories/${categoryId}`, form)
      : client.post('/categories', form);
  },

  setCategoryActive(categoryId, isActive) {
    return client.put(`/categories/${categoryId}`, { isActive });
  },
});

export function buildShortTestQuestionPayload(form, categoryId) {
  const options = form.options
    .map((value, index) => ({ value: value.trim(), index }))
    .filter(option => option.value);
  if (!form.text.trim() || options.length < 2) {
    return { error: 'Soru metni ve en az 2 şık zorunludur.' };
  }
  const correctAnswer = options.findIndex(option => option.index === form.correctAnswer);
  if (correctAnswer === -1) {
    return { error: 'Doğru cevap olarak seçilen şık boş olamaz.' };
  }
  return {
    payload: {
      text: form.text.trim(),
      options: options.map(option => option.value),
      correctAnswer,
      difficulty: form.difficulty,
      explanation: form.explanation.trim(),
      media: form.media.trim(),
      testType: TEST_TYPES.SHORT_TEST,
      category: categoryId,
    },
  };
}
