import api from '../../../api';
import { queueOperation, flushOperations } from '../../../services/resultOutbox';

export function createExamAttemptGateway({
  client = api,
  queue = queueOperation,
  flush = flushOperations,
  storage = null,
} = {}) {
  return {
    async startAttempt(request) {
      const response = await client.post('/exam-results/attempts', request);
      return response.data.attemptId;
    },
    async finishGuest(attemptId, duration, answers) {
      const response = await client.post(`/exam-results/attempts/${attemptId}/guest-finish`, {
        duration, answers,
      });
      return response.data;
    },
    saveGuestResult(payload) {
      const target = storage || globalThis.localStorage;
      const results = JSON.parse(target.getItem('guest_saved_results') || '[]');
      results.push(payload);
      target.setItem('guest_saved_results', JSON.stringify(results));
      const count = parseInt(target.getItem('guest_solved_test_count') || '0', 10);
      target.setItem('guest_solved_test_count', String(count + 1));
    },
    async saveUserResult(owner, payload) {
      queue(owner, '/exam-results', payload);
      return flush(owner);
    },
    async getAnswerKey(attemptId, questions) {
      const response = await client.get(`/exam-results/attempts/${attemptId}/review`);
      const key = new Map((response.data?.answers || []).map(item => [item.questionId, item.correctAnswer]));
      if (key.size !== questions.length || questions.some(question => !key.has(question._id))) {
        throw new Error('Cevap anahtarı eksik.');
      }
      return key;
    },
  };
}
