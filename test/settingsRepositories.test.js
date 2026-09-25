import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function loadModule(name) {
  const module = new vm.SourceTextModule(
    await readFile(`src/pages/user/settings/${name}.js`, 'utf8'),
    { context: vm.createContext({ Date, FormData }) },
  );
  await module.link(() => { throw new Error('Unexpected import'); });
  await module.evaluate();
  return module.namespace;
}

test('password failure leaves the session intact and success signs out', async () => {
  const { createAccountSecurityRepository, changePasswordAndSignOut } =
    await loadModule('accountSecurityRepository');
  const calls = [];
  let success = false;
  const repository = createAccountSecurityRepository({
    put: async (path, body) => {
      calls.push([path, body]);
      return { data: { success } };
    },
  });
  const effects = [];
  const args = {
    repository, currentPassword: 'old', newPassword: 'new',
    clearSession: () => effects.push('clear'),
    redirect: path => effects.push(path),
  };

  await changePasswordAndSignOut(args);
  assert.deepEqual(effects, []);
  success = true;
  await changePasswordAndSignOut(args);
  assert.deepEqual(effects, ['clear', '/login']);
  assert.equal(calls[0][0], '/auth/change-password');
  assert.equal(calls[0][1].newPassword, 'new');
});

test('settings repositories keep data and profile requests separate', async () => {
  const { createSettingsDataRepository } = await loadModule('settingsDataRepository');
  const { createProfileSettingsRepository } = await loadModule('profileSettingsRepository');
  const calls = [];
  const client = {
    get: async (path, options) => {
      calls.push([path, options]);
      return { data: { stats: { totalExams: 2 } } };
    },
    put: async (path, body) => {
      calls.push([path, body]);
      return { data: { success: true, user: {} } };
    },
  };
  const data = createSettingsDataRepository(client);
  const profile = createProfileSettingsRepository(client);
  assert.equal((await data.loadStats(180)).totalExams, 2);
  await profile.savePreferences({ dailyGoal: 10, examDate: '' });
  assert.equal(calls[0][1].params.offsetMinutes, 180);
  assert.equal(calls[1][1].examDate, null);
});

test('weekly activity excludes future days', async () => {
  const { weekActivityFromStats } = await loadModule('settingsDashboardModel');
  const activity = weekActivityFromStats(
    [{ date: '2026-09-21', isActive: true }, { date: '2026-09-27', isActive: true }],
    new Date('2026-09-23T12:00:00'),
  );
  assert.deepEqual(Array.from(activity), [true, false, false, false, false, false, false]);
});
