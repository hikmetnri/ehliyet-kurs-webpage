import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function loadRepository() {
  const context = vm.createContext({});
  const module = new vm.SourceTextModule(
    await readFile('src/pages/admin/content/contentAdminRepository.js', 'utf8'),
    { context },
  );
  await module.link(() => new vm.SyntheticModule(['TEST_TYPES'], function () {
    this.setExport('TEST_TYPES', { SHORT_TEST: 'short_test' });
  }, { context }));
  await module.evaluate();
  return module.namespace;
}

test('content repository falls back only for an unavailable admin category route', async () => {
  const { createContentAdminRepository } = await loadRepository();
  const calls = [];
  const repository = createContentAdminRepository({
    client: {
      get: async path => {
        calls.push(path);
        if (path === '/categories/admin/all') throw { response: { status: 404 } };
        return { data: { data: [{ _id: 'lesson-1' }] } };
      },
    },
    loadQuestions: async () => [],
  });
  assert.equal((await repository.loadCategories())[0]._id, 'lesson-1');
  assert.deepEqual(calls, ['/categories/admin/all', '/categories/all']);
});

test('short test payload preserves the selected answer after blank options are removed', async () => {
  const { buildShortTestQuestionPayload } = await loadRepository();
  const form = {
    text: ' Question ', options: ['First', ' ', 'Second'], correctAnswer: 2,
    difficulty: 'easy', explanation: ' Details ', media: '',
  };
  const { payload } = buildShortTestQuestionPayload(form, 'category-1');
  assert.deepEqual(Array.from(payload.options), ['First', 'Second']);
  assert.equal(payload.correctAnswer, 1);
  assert.equal(payload.category, 'category-1');
  assert.equal(buildShortTestQuestionPayload({ ...form, correctAnswer: 1 }, 'category-1').error,
    'Doğru cevap olarak seçilen şık boş olamaz.');
});
