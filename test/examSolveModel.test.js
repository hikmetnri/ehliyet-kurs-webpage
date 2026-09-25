import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { TEST_TYPES } from '../src/constants/testTypes.js';

async function loadModule(path, dependencies) {
  const context = vm.createContext({ console });
  const module = new vm.SourceTextModule(await readFile(path, 'utf8'), { context });
  await module.link(name => {
    const values = dependencies[name];
    assert.ok(values, `Unknown dependency: ${name}`);
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await module.evaluate();
  return module.namespace;
}

test('exam mode and answer summary are independent of the screen', async () => {
  const model = await loadModule('src/pages/user/examSolve/examResultModel.js', {
    '../../../constants/testTypes': { TEST_TYPES },
  });
  assert.equal(model.resolveExamMode({ customType: TEST_TYPES.WRONG_REVIEW }), 'review');
  assert.equal(model.resolveExamMode({ exam: { testType: TEST_TYPES.REAL_EXAM } }), 'real');
  assert.equal(model.resolveExamMode({ exam: { name: 'Deneme Sınavı' } }), 'mock');
  const summary = model.summarizeAnswers([
    { _id: 'a', correctAnswer: 1, options: [] },
    { _id: 'b', correctAnswer: 0, options: [] },
    { _id: 'c', options: [] },
  ], { 0: 1, 1: 2 });
  assert.equal(summary.correct, 1);
  assert.equal(summary.wrong, 1);
  assert.equal(summary.empty, 1);
  assert.equal(summary.hiddenAnswers, true);
  assert.equal(summary.wrongQuestions[0].questionId, 'b');
  const verified = model.applyAnswerKey(
    [{ _id: 'a' }, { _id: 'b' }], { 0: 1, 1: 2 },
    new Map([['a', 1], ['b', 0]]), 70,
  );
  assert.equal(verified.correct, 1);
  assert.equal(verified.wrong, 1);
  assert.equal(verified.passed, false);
});

test('attempt gateway routes guest and member persistence through injected dependencies', async () => {
  const calls = [];
  const values = new Map();
  const gatewayModule = await loadModule('src/pages/user/examSolve/examAttemptGateway.js', {
    '../../../api': { default: {} },
    '../../../services/resultOutbox': { queueOperation: () => {}, flushOperations: () => {} },
  });
  const gateway = gatewayModule.createExamAttemptGateway({
    client: {
      post: async (path, body) => { calls.push([path, body]); return { data: { attemptId: 'attempt-1', correctCount: 1 } }; },
      get: async path => { calls.push([path]); return { data: { answers: [{ questionId: 'q1', correctAnswer: 2 }] } }; },
    },
    queue: (...args) => calls.push(args),
    flush: async owner => { calls.push(['flush', owner]); return true; },
    storage: {
      getItem: key => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
    },
  });
  assert.equal(await gateway.startAttempt({ questionIds: ['q1'] }), 'attempt-1');
  assert.equal((await gateway.finishGuest('attempt-1', 20, [{ questionId: 'q1', answer: 2 }])).correctCount, 1);
  gateway.saveGuestResult({ examId: 'exam-1' });
  assert.equal(JSON.parse(values.get('guest_saved_results')).length, 1);
  assert.equal(values.get('guest_solved_test_count'), '1');
  assert.equal(await gateway.saveUserResult('user-1', { attemptId: 'attempt-1' }), true);
  assert.equal((await gateway.getAnswerKey('attempt-1', [{ _id: 'q1' }])).get('q1'), 2);
  assert.equal(calls[3][0], 'flush');
});

test('session loader uses the injected client and question source', async () => {
  const loader = await loadModule('src/pages/user/examSolve/loadExamSession.js', {
    '../../../constants/testTypes': { TEST_TYPES },
    '../../../utils/wrongAnswers': {
      filterQuestionsToCategoryTree: items => items,
      hydrateWrongAnswers: async (_, items) => items,
      normalizeId: id => id,
      readApiList: response => response.data,
    },
    '../../../utils/questionPages': { fetchAllQuestions: async () => { throw Error('global source used'); } },
    './examSolveUtils': { REVIEW_SESSION_LIMIT: 100, shuffleArray: items => items },
  });
  const calls = [];
  const session = await loader.loadExamSession({
    apiClient: { get: async path => { calls.push(path); return { data: { data: { name: 'Trafik' } } }; } },
    loadQuestions: async (params, client) => {
      assert.ok(client);
      assert.equal(params.category, 'category-1');
      return [{ _id: 'question-1' }];
    },
    customType: TEST_TYPES.SHORT_TEST,
    categoryId: 'category-1',
  });
  assert.equal(session.questions.length, 1);
  assert.equal(session.exam.name, 'Trafik Kısa Testi');
  assert.deepEqual(calls, ['/categories/category-1']);
});
