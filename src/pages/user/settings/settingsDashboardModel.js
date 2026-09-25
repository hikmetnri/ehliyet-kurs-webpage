export function weekActivityFromStats(weeklyActivity, today = new Date()) {
  if (!Array.isArray(weeklyActivity)) return Array(7).fill(false);
  const activeDays = new Set(weeklyActivity.filter(day => day.isActive).map(day => day.date));
  const current = new Date(today);
  current.setHours(0, 0, 0, 0);
  const todayIndex = (current.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, index) => {
    if (index > todayIndex) return false;
    const day = new Date(current);
    day.setDate(day.getDate() - (todayIndex - index));
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    return activeDays.has(key);
  });
}
