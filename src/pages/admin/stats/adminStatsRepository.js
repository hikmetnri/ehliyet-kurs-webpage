import { normalizeCategoryStats, normalizeRegistrationTrend } from '../../../utils/statsData';

export async function loadRootCategories(client) {
  const response = await client.get('/categories/all');
  const list = Array.isArray(response.data?.data)
    ? response.data.data
    : Array.isArray(response.data) ? response.data : [];
  return list.filter(category => !category.parent);
}

export async function loadDashboardStats(client, categoryId) {
  const params = new URLSearchParams();
  if (categoryId !== 'all') params.set('categoryId', categoryId);
  const query = params.size ? `?${params}` : '';
  const endpoints = [
    'overview', 'categories', 'difficult-questions', 'qr',
    'registration-trend', 'daily-goals',
  ];
  const results = await Promise.allSettled(
    endpoints.map(endpoint => client.get(`/admin/stats/${endpoint}${query}`)),
  );
  const data = index => results[index].status === 'fulfilled' ? results[index].value.data : null;
  return {
    overview: data(0),
    categoryStats: data(1) ? normalizeCategoryStats(data(1)) : [],
    difficultQuestions: data(2) || [],
    qrStats: data(3) || { count: 0, daily: {} },
    registrationTrend: data(4) ? normalizeRegistrationTrend(data(4)) : [],
    dailyGoals: data(5) || [],
  };
}

export async function loadJourneyStats(client, { days, source, categoryId }) {
  const params = new URLSearchParams({ days });
  if (source !== 'all') params.set('source', source);
  if (categoryId !== 'all') params.set('categoryId', categoryId);
  const response = await client.get(`/admin/stats/journey?${params}`);
  return response.data;
}

export async function loadTimeline(client, userId) {
  const response = await client.get(`/analytics/users/${userId}/timeline?limit=80`);
  return response.data?.data || [];
}
