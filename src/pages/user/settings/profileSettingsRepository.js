export const createProfileSettingsRepository = (client) => ({
  async saveProfile(profile) {
    const response = await client.put('/auth/profile', profile);
    return response.data;
  },

  async savePreferences(preferences) {
    const response = await client.put('/auth/profile', {
      dailyGoal: preferences.dailyGoal,
      notifEnabled: preferences.notifEnabled,
      notifHour: preferences.notifHour,
      notifMinute: preferences.notifMinute,
      examDate: preferences.examDate || null,
      theme: preferences.theme || 'default',
    });
    return response.data;
  },

  async saveTheme(theme) {
    const response = await client.put('/auth/profile', { theme });
    return response.data;
  },

  async uploadAvatar(file) {
    const body = new FormData();
    body.append('avatar', file);
    const response = await client.post('/auth/avatar', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
});
