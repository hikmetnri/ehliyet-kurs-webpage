import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function createRepository(client) {
  const context = vm.createContext({ Math });
  const module = new vm.SourceTextModule(
    await readFile('src/pages/admin/schools/schoolAdminRepository.js', 'utf8'),
    { context },
  );
  await module.link(name => {
    const values = name === '../../../api'
      ? { default: {} }
      : { readList: response => response.data.data };
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await module.evaluate();
  return module.namespace.createSchoolAdminRepository(client);
}

test('school repository scopes pages and sends updates to the chosen record', async () => {
  const calls = [];
  const client = {
    get: async (path, options) => {
      calls.push([path, options]);
      return { data: { data: [{ _id: 'school-1' }], pagination: { total: 101, limit: 50 } } };
    },
    put: async (path, body) => { calls.push([path, body]); return { data: { data: body } }; },
    delete: async path => { calls.push([path]); },
  };
  const repository = await createRepository(client);
  const schools = await repository.listSchools({
    page: 2, city: 'Ankara', district: 'Çankaya', query: 'kurs', sponsored: true,
  });
  assert.equal(schools.pages, 3);
  assert.equal(schools.items[0]._id, 'school-1');
  assert.equal(calls[0][1].params.city, 'Ankara');
  assert.equal(calls[0][1].params.isSponsored, true);
  await repository.updateApplication('app-1', 'approved');
  assert.equal(calls[1][0], '/driving-schools/applications/app-1');
  assert.equal(calls[1][1].status, 'approved');
});
