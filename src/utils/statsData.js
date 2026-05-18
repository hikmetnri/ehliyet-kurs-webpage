export const readList = (body) => {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== 'object') return [];

  for (const key of ['data', 'items', 'results', 'reports', 'posts']) {
    if (Array.isArray(body[key])) return body[key];
  }

  return [];
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const normalizeRegistrationTrend = (body) => readList(body).map((item, index) => {
  const label = item.label || item.name || item.date || `Gün ${index + 1}`;
  const count = toNumber(item.count ?? item.users);

  return {
    ...item,
    date: item.date || '',
    label,
    count,
    name: item.name || label,
    users: count,
  };
});

export const normalizeCategoryStats = (body) => readList(body)
  .map((item) => {
    const name = item.categoryName || item.name || 'Genel Sınav';
    const avgSuccessRate = toNumber(item.avgSuccessRate ?? item.successRate ?? item.oran);

    return {
      ...item,
      categoryName: name,
      totalAttempts: toNumber(item.totalAttempts),
      totalSolved: toNumber(item.totalSolved),
      avgSuccessRate,
      name,
      oran: avgSuccessRate,
    };
  })
  .filter((item) => item.name);

export const hasChartValue = (rows, key) => rows.some((row) => toNumber(row[key]) > 0);
