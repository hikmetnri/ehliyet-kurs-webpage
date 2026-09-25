import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function createRepository(client) {
  const context = vm.createContext({});
  const module = new vm.SourceTextModule(
    await readFile('src/pages/user/lessons/lessonCatalogRepository.js', 'utf8'),
    { context },
  );
  await module.link((name) => {
    const values = name.includes('categoryContent')
      ? { isVideoRecord: category => category.content?.startsWith('@[video_category]') }
      : {
        buildTree: (categories, parentId = null) => categories
          .filter(category => (category.parent || null) === parentId)
          .map(category => ({
            ...category,
            children: categories.filter(child => child.parent === category._id),
          })),
      };
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await module.evaluate();
  return module.namespace.createLessonCatalogRepository(client);
}

test('lesson catalog scopes selected branch and excludes video records', async () => {
  const calls = [];
  const client = { get: async path => {
    calls.push(path);
    return path === '/categories/all'
      ? { data: { data: [
        { _id: 'a', name: 'A' },
        { _id: 'a1', parent: 'a', name: 'A1' },
        { _id: 'b', name: 'B' },
        { _id: 'video', parent: 'a', content: '@[video_category]' },
      ] } }
      : { data: { passedCategoryIds: ['a1', 'a1'] } };
  } };
  const repository = await createRepository(client);

  const catalog = await repository.load('a');
  assert.deepEqual(Array.from(catalog.categories, item => item._id), ['a', 'a1']);
  assert.equal(catalog.rootId, 'a');
  assert.equal(catalog.topics.length, 1);
  assert.deepEqual(Array.from(await repository.loadPassedCategoryIds()), ['a1']);
  assert.deepEqual(calls, ['/categories/all', '/exam-results/overview']);
});
