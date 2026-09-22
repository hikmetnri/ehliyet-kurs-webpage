export const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '0dk';
  if (seconds < 60) return `${seconds}sn`;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    const remMin = minutes % 60;
    return remMin > 0 ? `${hours}sa ${remMin}dk` : `${hours}sa`;
  }
  return `${minutes}dk`;
};
