import api from '../api';

export const fetchAllQuestions = async (params = {}, apiClient = api) => {
  const questions = [];
  for (let page = 1; page <= 10000; page += 1) {
    const response = await apiClient.get('/questions', { params: { ...params, limit: 200, page } });
    const batch = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    questions.push(...batch);
    if (batch.length < 200) return questions;
  }
  throw new Error('Soru listesi tamamlanamadı.');
};
