import { TEST_TYPES } from '../../../constants/testTypes';
import { trafficSignsData } from '../../../data/trafficSignsData';

// ─── Constants ────────────────────────────────────────────────────────────────
const DIFFICULTY_CONFIG = {
  easy: { label: 'Kolay', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', dot: 'bg-success' },
  medium: { label: 'Orta', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', dot: 'bg-warning' },
  hard: { label: 'Zor', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', dot: 'bg-danger' },
};

const CSV_EXAMPLE = `text,option1,option2,option3,option4,correctAnswer,difficulty,explanation
Emniyet şeridi nedir?,Sol şerit,Sağ şerit,Orta şerit,Acil durum şeridi,3,easy,Sağ kenardaki şerit acil durumlara ayrılmıştır.
Hız limiti şehir içinde nedir?,30 km/h,50 km/h,70 km/h,90 km/h,1,medium,`;

// 4 Levha Kategorisi + İçindeki dosyalar (backend'deki klasör yapısıyla aynı)
const SIGN_CATEGORIES = [
  { key: 'Tehlike_T',  label: 'Tehlike Levhaları',  emoji: '🔺', color: 'text-danger',   bg: 'bg-danger/10',   border: 'border-danger/30'   },
  { key: 'Tanzim_TT', label: 'Tanzim Levhaları',    emoji: '🔵', color: 'text-primary-light', bg: 'bg-primary/10', border: 'border-primary/30' },
  { key: 'Bilgi_B',   label: 'Bilgi Levhaları',     emoji: '🟦', color: 'text-accent',    bg: 'bg-accent/10',   border: 'border-accent/30'   },
  { key: 'Park_P',    label: 'Park Levhaları',       emoji: '🅿️', color: 'text-success',   bg: 'bg-success/10',  border: 'border-success/30'  },
];

const EXAM_TYPES = {
  [TEST_TYPES.SHORT_TEST]: { label: 'Kısa Test', icon: '📚' },
  [TEST_TYPES.MOCK_EXAM]: { label: 'Deneme Sınavı', icon: '⚡' },
  [TEST_TYPES.REAL_EXAM]: { label: 'Gerçek Sınav', icon: '🛡️' },
};

// Konu/Branş konfigürasyonu — kategori adına göre otomatik seçim
// B sınıfı ehliyet konuları
const B_CLASS_SUBJECTS = [
  { value: 'trafik',    label: 'Trafik ve Çevre',       emoji: '🚦' },
  { value: 'ilkyardim', label: 'İlk Yardım',            emoji: '🚑' },
  { value: 'motor',     label: 'Motor ve Araç Bilgisi', emoji: '🔧' },
  { value: 'adabi',     label: 'Trafik Adabı',           emoji: '🤝' },
];

// İş makinesi operatörü sınav konuları
const IS_MAKINESI_SUBJECTS = [
  { value: 'operator_isg',       label: 'İSG, Çevre ve Kalite', emoji: '🦺' },
  { value: 'operator_machines',  label: 'İş Makinesi Türleri', emoji: '🏗️' },
  { value: 'operator_transport', label: 'Nakil ve Trafik Güvenliği', emoji: '🚚' },
  { value: 'operator_ethics',    label: 'Meslek Etiği ve Gelişim', emoji: '🤝' },
];

const normalizeCategoryText = (value = '') => value
  .toLocaleLowerCase('tr-TR')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/ı/g, 'i');

const getCategoryGroupFromText = (value) => {
  const text = normalizeCategoryText(value);
  if ([
    'is makinesi', 'operator', 'forklift', 'ekskavator', 'vinc', 'kepce',
    'beko', 'dozer', 'isg', 'is sagligi', 'is guvenligi',
  ].some(keyword => text.includes(keyword))) return 'is_makinesi';
  if (['b sinifi', 'b ehliyet', 'otomobil'].some(keyword => text.includes(keyword))) return 'b_class';
  return '';
};

const getCategoryGroup = (categoryId, categories) => {
  let currentId = (categoryId?._id || categoryId)?.toString();
  const visited = new Set();
  const names = [];

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const category = categories.find(item => item._id?.toString() === currentId);
    if (!category) break;
    names.push(category.name || '');
    currentId = (category.parent?._id || category.parent)?.toString();
  }

  for (const name of names.reverse()) {
    const group = getCategoryGroupFromText(name);
    if (group) return group;
  }
  return '';
};

const getExamCategoryGroup = (exam, categories) => {
  const categoryGroup = getCategoryGroup(exam?.categoryId, categories);
  if (categoryGroup) return categoryGroup;
  return getCategoryGroupFromText(`${exam?.name || ''} ${exam?.description || ''}`);
};

// localStorage taslak yardımcıları
const DRAFT_KEY = 'exam_question_draft';
const saveDraft = (data) => {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, _savedAt: Date.now() })); } catch { /* localStorage kullanılamıyorsa taslak atlanır */ }
};
const loadDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // 24 saatten eski taslakları sil
    if (parsed._savedAt && Date.now() - parsed._savedAt > 86400000) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch { return null; }
};
const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* localStorage kullanılamıyorsa atlanır */ } };

const normalizeTestType = (testType) => {
  // Legacy `exam` kayıtları kullanıcı tarafında gerçek sınav fallback'idir.
  if (testType === TEST_TYPES.EXAM) return TEST_TYPES.REAL_EXAM;
  return testType || '';
};

const defaultDurationForGroup = (group) => group === 'is_makinesi' ? 50 : 45;

const questionExamId = (question) => question.exam?._id || question.exam || '';

const inferExamTypeFromName = (exam) => {
  const text = `${exam?.name || ''} ${exam?.description || ''}`.toLocaleLowerCase('tr-TR');
  if (/(gerçek|gercek|meb|e-sınav|e sinav|simülatör|simulator)/i.test(text)) return TEST_TYPES.REAL_EXAM;
  if (/(deneme|mock|trial)/i.test(text)) return TEST_TYPES.MOCK_EXAM;
  return '';
};

const resolveExamTestType = (exam, questions = []) => {
  if (exam?.isMiniTest) return TEST_TYPES.SHORT_TEST;
  if (normalizeTestType(exam?._resolvedTestType)) return normalizeTestType(exam._resolvedTestType);

  const relatedQuestions = questions.filter(q => questionExamId(q) === exam?._id);
  const realQuestionCount = relatedQuestions.filter(q => normalizeTestType(q.testType) === TEST_TYPES.REAL_EXAM).length;
  const mockQuestionCount = relatedQuestions.filter(q => normalizeTestType(q.testType) === TEST_TYPES.MOCK_EXAM).length;

  if (realQuestionCount > 0 && mockQuestionCount === 0) return TEST_TYPES.REAL_EXAM;
  if (mockQuestionCount > 0 && realQuestionCount === 0) return TEST_TYPES.MOCK_EXAM;
  if (realQuestionCount > mockQuestionCount) return TEST_TYPES.REAL_EXAM;
  if (mockQuestionCount > realQuestionCount) return TEST_TYPES.MOCK_EXAM;

  const inferred = inferExamTypeFromName(exam);
  if (inferred) return inferred;

  return normalizeTestType(exam?.testType) || TEST_TYPES.MOCK_EXAM;
};

const fetchSignsInCategory = async (category) => {
  const prefix = `${category}/`;
  return trafficSignsData
    .map(sign => sign.id)
    .filter(id => id.startsWith(prefix))
    .map(id => id.replace(prefix, ''))
    .sort((a, b) => a.localeCompare(b));
};

export {
  DIFFICULTY_CONFIG,
  CSV_EXAMPLE,
  SIGN_CATEGORIES,
  EXAM_TYPES,
  B_CLASS_SUBJECTS,
  IS_MAKINESI_SUBJECTS,
  normalizeCategoryText,
  getCategoryGroupFromText,
  getCategoryGroup,
  getExamCategoryGroup,
  saveDraft,
  loadDraft,
  clearDraft,
  normalizeTestType,
  defaultDurationForGroup,
  questionExamId,
  inferExamTypeFromName,
  resolveExamTestType,
  fetchSignsInCategory,
};
