export const createSettingsDataRepository = (client) => ({
  async loadStats(offsetMinutes) {
    const response = await client.get('/exam-results/stats', { params: { offsetMinutes } });
    return response.data?.stats || response.data || {};
  },

  async loadBadges() {
    const response = await client.get('/badges/my');
    return response.data || [];
  },

  async loadLeaderboard(period) {
    const response = await client.get('/exam-results/leaderboard', { params: { period } });
    return response.data || [];
  },

  async loadFaqs() {
    const response = await client.get('/faqs');
    return response.data || [];
  },
});
