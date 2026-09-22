export const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];
export const REVIEW_SESSION_LIMIT = 20;

// Fisher-Yates shuffle — uniform dağılım sağlar (Math.random() comparator yanlıdır).
export const shuffleArray = (input) => {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const cleanOptionText = (option, index) => {
  if (typeof option !== 'string') return `${OPTION_LABELS[index] || index + 1} Şıkkı`;
  const label = OPTION_LABELS[index];
  const cleaned = label
    ? option.replace(new RegExp(`^\\s*${label}\\s*[).:\\-]\\s*`, 'i'), '').trim()
    : option.trim();
  return cleaned || `${label || index + 1} Şıkkı`;
};
