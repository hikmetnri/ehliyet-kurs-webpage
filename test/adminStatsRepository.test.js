import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function repository() {
  const context = vm.createContext({ URLSearchParams });
  const module = new vm.SourceTextModule(
    await readFile('src/pages/admin/stats/adminStatsRepository.js', 'utf8'), { context },
  );
  await module.link(() => new vm.SyntheticModule(
    ['normalizeCategoryStats', 'normalizeRegistrationTrend'],
    function () {
      this.setExport('normalizeCategoryStats', rows => rows);
      this.setExport('normalizeRegistrationTrend', rows => rows);
    }, { context },
  ));
  await module.evaluate();
  return module.namespace;
}

test('admin dashboard keeps successful sections when one endpoint fails', async () => {
  const stats = await repository();
  const calls = [];
  const client = { get: async path => {
    calls.push(path);
    if (path.includes('difficult-questions')) throw Error('offline');
    return { data: path.includes('overview') ? { totalUsers: 7 } : [] };
  } };
  const result = await stats.loadDashboardStats(client, 'category-1');
  assert.equal(result.overview.totalUsers, 7);
  assert.equal(result.difficultQuestions.length, 0);
  assert.equal(calls.length, 6);
  assert.ok(calls.every(path => path.includes('categoryId=category-1')));
});

test('journey and timeline requests preserve their filters', async () => {
  const stats = await repository();
  const paths = [];
  const client = { get: async path => {
    paths.push(path);
    return { data: path.includes('timeline') ? { data: [{ eventType: 'login' }] } : { summary: {} } };
  } };
  await stats.loadJourneyStats(client, { days: '30', source: 'web', categoryId: 'all' });
  const timeline = await stats.loadTimeline(client, 'user-1');
  assert.ok(paths[0].includes('days=30&source=web'));
  assert.equal(timeline[0].eventType, 'login');
  assert.equal(paths[1], '/analytics/users/user-1/timeline?limit=80');
});
