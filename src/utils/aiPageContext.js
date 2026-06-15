const CONTEXT_KEY = 'ehliyet_yolu_ai_page_context';

const trimText = (value = '', max = 1400) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);

const filenameHints = [
  [/yol[-_\s]*ver|yield|tt[-_]?1\b/i, 'Görselde "Yol Ver" levhası yer alıyor. Kavşakta geçiş üstünlüğü olan araçlara yol verilmesi gerektiğini belirtir.'],
  [/\bdur\b|stop|tt[-_]?2\b/i, 'Görselde "DUR" levhası yer alıyor. Tam durup yol kontrolü yapılması gerektiğini belirtir.'],
  [/girilmez|no[-_\s]*entry|tt[-_]?3\b/i, 'Görselde "Girilmez" levhası yer alıyor. Bu yönden araç girişinin yasak olduğunu belirtir.'],
  [/yaya[-_\s]*ge[cç]idi|pedestrian|t[-_]?11\b/i, 'Görselde "Yaya Geçidi" işareti yer alıyor. Yayalara dikkat edilmesi gerektiğini bildirir.'],
  [/okul[-_\s]*ge[cç]idi|school|t[-_]?12\b/i, 'Görselde "Okul Geçidi" işareti yer alıyor. Çocuklara karşı dikkatli olunması gerektiğini bildirir.'],
  [/kontrols[uü]z[-_\s]*kav[sş]ak|t[-_]?21\b/i, 'Görselde "Kontrolsüz Kavşak" işareti yer alıyor. Geçiş hakkı kurallarına dikkat edilmelidir.'],
  [/park[-_\s]*etmek[-_\s]*yasak|p[-_]?2\b/i, 'Görselde "Park Etmek Yasaktır" levhası yer alıyor. Yolun bu kesiminde park edilmez.'],
  [/hastane|hospital|b[-_]?15\b/i, 'Görselde "Hastane" bilgi işareti yer alıyor. Yakında hastane bulunduğunu bildirir.'],
  [/ilk[-_\s]*yard[iı]m|first[-_\s]*aid|b[-_]?16\b/i, 'Görselde "İlk Yardım" bilgi işareti yer alıyor. Yakında ilk yardım merkezi bulunduğunu bildirir.'],
  [/akaryak[iı]t|fuel|petrol|b[-_]?19\b/i, 'Görselde "Akaryakıt İstasyonu" bilgi işareti yer alıyor. Yakında yakıt alınabilecek yer olduğunu bildirir.'],
  [/kaygan|slippery|t[-_]?8\b/i, 'Görselde "Kaygan Yol" uyarı işareti yer alıyor. Yol yüzeyi kaygan olabilir.'],
  [/kasis|bump|t[-_]?7\b/i, 'Görselde "Kasisli Yol" uyarı işareti yer alıyor. İleride kasis veya tümsek olduğunu bildirir.'],
  [/trafik[_-\s]*gorevlisi.*ge[cç]\b|\/ge[cç]\./i, 'Görselde trafik görevlisinin geç işareti yer alıyor. Geçişe izin verilen yöndeki araçlar kontrollü ilerleyebilir.'],
  [/trafik[_-\s]*gorevlisi.*yavasla|yavasla\./i, 'Görselde trafik görevlisinin yavaşla işareti yer alıyor. Sürücülerin hızını azaltması gerekir.'],
  [/trafik[_-\s]*gorevlisi.*hizlan|hizlan\./i, 'Görselde trafik görevlisinin hızlan işareti yer alıyor. Trafik akışının hızlandırılması istenir.'],
  [/trafik[_-\s]*gorevlisi.*dur|\/dur\./i, 'Görselde trafik görevlisinin dur işareti yer alıyor. Sürücülerin durması gerekir.'],
];

const getMediaFilenameHint = (media = '') => {
  const decoded = decodeURIComponent(String(media || '')).toLocaleLowerCase('tr-TR');
  if (!decoded) return '';
  const match = filenameHints.find(([pattern]) => pattern.test(decoded));
  if (match) return match[1];
  if (decoded.includes('trafik-levhalari') || decoded.includes('assets/images/signs')) {
    const filename = decoded.split('/').pop()?.replace(/\.(png|jpe?g|webp|gif|svg|avif).*$/i, '').replace(/[-_]+/g, ' ').trim();
    return filename ? `Görselde trafik levhası/işareti yer alıyor. Dosya adı veya levha kodu: ${filename}.` : '';
  }
  return '';
};

export const setAiPageContext = (context = {}) => {
  try {
    const payload = {
      ...context,
      updatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('ai-page-context-change', { detail: payload }));
  } catch {
    // Context is optional; chat still works without it.
  }
};

export const clearAiPageContext = (page) => {
  try {
    const current = getAiPageContext();
    if (!page || current?.page === page) {
      sessionStorage.removeItem(CONTEXT_KEY);
      window.dispatchEvent(new CustomEvent('ai-page-context-change', { detail: null }));
    }
  } catch {
    // noop
  }
};

export const getAiPageContext = () => {
  try {
    const raw = sessionStorage.getItem(CONTEXT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const compactLessonContext = (lesson, extra = {}) => {
  if (!lesson) return null;
  return {
    page: 'lesson_reader',
    lessonId: lesson._id || lesson.id || '',
    title: lesson.name || '',
    categoryName: extra.categoryName || lesson.categoryName || '',
    description: trimText(lesson.description, 300),
    contentExcerpt: trimText(lesson.content, 1800),
  };
};

export const compactQuestionContext = ({ question, exam, index, total, answerIndex, showAnswer }) => {
  if (!question) return null;
  const explicitMediaDescription = String(question.mediaDescription || question.imageDescription || question.visualHint || '').trim();
  const fallbackMediaDescription = getMediaFilenameHint(question.media);
  const mediaDescription = explicitMediaDescription || fallbackMediaDescription;
  return {
    page: 'exam_solve',
    questionId: question._id || question.id || '',
    questionNumber: Number(index || 0) + 1,
    totalQuestions: total || 0,
    examName: exam?.name || exam?.examName || '',
    categoryName: question.categoryName || exam?.categoryName || '',
    questionText: trimText(question.text, 1400),
    media: question.media || '',
    mediaDescription: trimText(mediaDescription, 1000),
    mediaDescriptionSource: explicitMediaDescription
      ? 'stored'
      : (fallbackMediaDescription ? 'filename_hint' : 'none'),
    options: Array.isArray(question.options)
      ? question.options.slice(0, 6).map((option) => trimText(option, 300))
      : [],
    userAnswerIndex: answerIndex ?? null,
    correctAnswerIndex: showAnswer ? question.correctAnswer : null,
    explanation: showAnswer ? trimText(question.explanation, 1000) : '',
  };
};

export const compactStatsContext = ({ stats, catStats, recentResults, scopeLabel, selectedCategoryName }) => ({
  page: 'stats',
  scopeLabel: scopeLabel || selectedCategoryName || '',
  selectedCategoryName: selectedCategoryName || '',
  totalExams: stats?.totalExams || 0,
  totalQuestions: stats?.totalQuestions || 0,
  totalCorrect: stats?.totalCorrect || 0,
  totalWrong: stats?.totalWrong || 0,
  successRate: stats?.successRate || 0,
  weakestTopics: (catStats || [])
    .slice()
    .sort((a, b) => Number(a.successRate || 0) - Number(b.successRate || 0))
    .slice(0, 5)
    .map((item) => ({
      categoryName: item.categoryName || item.name || '',
      successRate: item.successRate || 0,
      totalAttempts: item.totalAttempts || item.totalExams || 0,
      wrongCount: item.totalWrongAnswers || item.totalWrong || item.wrongCount || 0,
    })),
  recentResults: (recentResults || []).slice(0, 3).map((result) => ({
    examName: result.examName || result.categoryName || 'Sınav',
    score: result.score || 0,
    correctCount: result.correctCount || result.correctAnswers || 0,
    wrongCount: result.wrongCount || result.wrongAnswers || 0,
  })),
});
