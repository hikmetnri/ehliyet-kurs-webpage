import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function createRepository(client) {
  const context = vm.createContext({});
  const module = new vm.SourceTextModule(
    await readFile('src/pages/admin/settings/adminSettingsRepository.js', 'utf8'),
    { context },
  );
  await module.link(() => new vm.SyntheticModule(['limitQuoteText'], function () {
    this.setExport('limitQuoteText', text => String(text || '').trim().slice(0, 350));
  }, { context }));
  await module.evaluate();
  return module.namespace.createAdminSettingsRepository(client);
}

test('admin settings map is normalized and maintenance follows server response', async () => {
  const calls = [];
  const repository = await createRepository({
    get: async path => {
      calls.push(path);
      return { data: path === '/admin/settings-map' ? { privacy_policy: 'Policy' } : [] };
    },
    post: async (path, body) => {
      calls.push([path, body]);
      return { data: { isMaintenance: true } };
    },
  });
  const settings = await repository.loadSettings();
  assert.equal(settings.privacy_policy, 'Policy');
  assert.equal(settings.app_version_android, '1.0.0');
  assert.equal(await repository.setMaintenance(true), true);
  assert.equal(calls[1][0], '/admin/maintenance');
  assert.equal(calls[1][1].enabled, true);
});

test('quotes are trimmed before they are sent', async () => {
  const calls = [];
  const repository = await createRepository({
    post: async (path, body) => { calls.push([path, body]); return { data: {} }; },
  });
  await repository.saveQuote(null, { text: '  Learn  ', author: '  Instructor  ' });
  assert.equal(calls[0][0], '/quotes');
  assert.equal(calls[0][1].text, 'Learn');
  assert.equal(calls[0][1].author, 'Instructor');
});
