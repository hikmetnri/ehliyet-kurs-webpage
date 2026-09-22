export const getStoredExamDateInput = () => {
  try {
    const value = localStorage.getItem('exam_date');
    if (!value) return '';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
  } catch {
    return '';
  }
};
