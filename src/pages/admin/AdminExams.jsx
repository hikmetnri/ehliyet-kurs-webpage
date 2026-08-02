import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Search, Plus, FileEdit, Trash2, CheckCircle2, XCircle,
  Image as ImageIcon, X, Save, AlertCircle, FolderOpen, ChevronRight,
  ChevronDown, ArrowLeft, PenTool, Clock, HelpCircle, FileText,
  Copy, Zap, UploadCloud, Star, Shield, BookOpen, BarChart2,
  Folder, AlertTriangle, RefreshCw, Eye, EyeOff, Hash, Link,
  HardHat, Wrench, Leaf, UserCheck, FlameKindling, AlignLeft,
  Send, FileX, Download,
} from 'lucide-react';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { trafficSignsData } from '../../data/trafficSignsData';
import { isgSignsData } from '../../data/isgSignsData';
import { isVideoCategory } from '../../utils/categoryContent';

// ─── New Utility Imports ───────────────────────────────────────────────────
import { validateQuestionForm } from '../../utils/formValidation';
import { getErrorMessage, executeAPICall } from '../../utils/apiErrorHandler';
import { parseCSV } from '../../utils/csvParser';
import { uploadImage } from '../../utils/imageUpload';

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
  short_test: { label: 'Kısa Test', icon: '📚' },
  mock_exam: { label: 'Deneme Sınavı', icon: '⚡' },
  real_exam: { label: 'Gerçek Sınav', icon: '🛡️' },
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

// Tüm konuları birleştirerek subject değerinden label bul
const ALL_SUBJECTS_MAP = {};
[...B_CLASS_SUBJECTS, ...IS_MAKINESI_SUBJECTS].forEach(s => { ALL_SUBJECTS_MAP[s.value] = s; });

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
  if (testType === 'exam') return 'mock_exam';
  return testType || '';
};

const questionExamId = (question) => question.exam?._id || question.exam || '';

const inferExamTypeFromName = (exam) => {
  const text = `${exam?.name || ''} ${exam?.description || ''}`.toLocaleLowerCase('tr-TR');
  if (/(gerçek|gercek|meb|e-sınav|e sinav|simülatör|simulator)/i.test(text)) return 'real_exam';
  if (/(deneme|mock|trial)/i.test(text)) return 'mock_exam';
  return '';
};

const resolveExamTestType = (exam, questions = []) => {
  if (exam?.isMiniTest) return 'short_test';
  if (normalizeTestType(exam?._resolvedTestType)) return normalizeTestType(exam._resolvedTestType);

  const relatedQuestions = questions.filter(q => questionExamId(q) === exam?._id);
  const realQuestionCount = relatedQuestions.filter(q => normalizeTestType(q.testType) === 'real_exam').length;
  const mockQuestionCount = relatedQuestions.filter(q => normalizeTestType(q.testType) === 'mock_exam').length;

  if (realQuestionCount > 0 && mockQuestionCount === 0) return 'real_exam';
  if (mockQuestionCount > 0 && realQuestionCount === 0) return 'mock_exam';
  if (realQuestionCount > mockQuestionCount) return 'real_exam';
  if (mockQuestionCount > realQuestionCount) return 'mock_exam';

  const inferred = inferExamTypeFromName(exam);
  if (inferred) return inferred;

  return normalizeTestType(exam?.testType) || 'mock_exam';
};

const fetchSignsInCategory = async (category) => {
  const prefix = `${category}/`;
  return trafficSignsData
    .map(sign => sign.id)
    .filter(id => id.startsWith(prefix))
    .map(id => id.replace(prefix, ''))
    .sort((a, b) => a.localeCompare(b));
};

// ─── Utility Components ───────────────────────────────────────────────────────
const Badge = ({ label, color = 'white', size = 'sm' }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-${color} bg-${color}/10 border border-${color}/20 text-${size === 'xs' ? '[10px]' : 'xs'} font-bold`}>
    {label}
  </span>
);

const DifficultyBadge = ({ difficulty }) => {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const SectionLabel = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-2">
    {Icon && <Icon className="w-4 h-4 text-white/40" />}
    <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{children}</span>
  </div>
);

const InputField = ({ label, icon: Icon, required, error, children }) => (
  <div>
    {label && (
      <div className="flex items-center gap-1.5 mb-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
        <span className="text-xs font-bold text-text-secondary">{label}</span>
        {required && <span className="text-danger text-xs">(Zorunlu)</span>}
      </div>
    )}
    {children}
    {error && <p className="text-danger text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

// ─── Question Card ─────────────────────────────────────────────────────────────
const QuestionCard = ({ q, idx, onEdit, onDelete, onCopy, isShortTest }) => {
  const [expanded, setExpanded] = useState(false);
  const total = (q.correctCount || 0) + (q.wrongCount || 0);
  const rate = total > 0 ? Math.round((q.correctCount / total) * 100) : null;

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/20 hover:bg-white/[0.035] overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        {/* Görsel küçük thumbnail — varsa */}
        {q.media ? (
          <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              src={resolveMediaUrl(q.media)}
              alt="Levha"
              className="w-full h-full object-contain p-1"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
            />
            <div className="hidden w-full h-full items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white/20" />
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs font-black text-white/20">#{idx + 1}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-relaxed line-clamp-2">{q.text}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <DifficultyBadge difficulty={q.difficulty} />
            {q.media && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-light bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                <ImageIcon className="w-2.5 h-2.5" /> Görselli
              </span>
            )}
            {total > 0 && (
              <>
                <span className="text-[10px] font-bold text-success flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />{q.correctCount}
                </span>
                <span className="text-[10px] font-bold text-danger flex items-center gap-1">
                  <XCircle className="w-3 h-3" />{q.wrongCount}
                </span>
                {rate !== null && (
                  <span className={`text-[10px] font-bold ${rate >= 50 ? 'text-success' : 'text-danger'}`}>
                    %{rate} Başarı
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setExpanded(e => !e)} className="p-2 rounded-xl text-text-muted hover:bg-white/[0.07] hover:text-white transition-colors" title="Şıkları Göster">
            {expanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => onCopy(q)} className="p-2 rounded-xl text-text-muted hover:bg-white/[0.07] hover:text-white transition-colors" title="Kopyala">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(q)} className={`p-2 rounded-xl text-text-muted transition-colors ${isShortTest ? 'hover:bg-accent/15 hover:text-accent-light' : 'hover:bg-primary/10 hover:text-primary-light'}`} title="Düzenle">
            <FileEdit className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(q._id)} className="p-2 rounded-xl text-text-muted hover:bg-rose-500/10 hover:text-rose-300 transition-colors" title="Sil">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Options (expandable) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, i) => (
                <div key={i} className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm ${i === q.correctAnswer ? 'bg-success/5 border-success/30 text-success' : 'bg-white/[0.02] border-white/5 text-white/50'}`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${i === q.correctAnswer ? 'bg-success text-white' : 'bg-white/10 text-white/40'}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="leading-tight">{opt}</span>
                  {i === q.correctAnswer && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" />}
                </div>
              ))}
            </div>
            {q.explanation && (
              <div className="mx-4 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-primary-light">
                <span className="font-bold">💡 Açıklama: </span>{q.explanation}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BASE_EMPTY_FORM = {
  text: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  difficulty: 'medium',
  explanation: '',
  coefficient: '1.0',
  media: '',
  subject: '',
};

// ─── Question Form Modal ───────────────────────────────────────────────────────
const QuestionFormModal = ({ isOpen, onClose, onSaved, testType, categories, exams, initialCategoryId, initialExamId, existingQuestion, isCopy, initialExamCategory = 'b_class' }) => {
  const isEdit = existingQuestion && !isCopy;
  const isShortTest = testType === 'short_test';
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(() => ({
    ...BASE_EMPTY_FORM,
    category: initialCategoryId || '',
    exam: initialExamId || '',
    testType,
  }));
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [signPickerOpen, setSignPickerOpen] = useState(false);
  const [imageTab, setImageTab] = useState('sign'); // 'sign' | 'upload' | 'url'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [draftSavedAt, setDraftSavedAt] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const draftTimer = useRef(null);
  // Ehliyet kategorisi seçimi: 'b_class' | 'is_makinesi' — prop'tan başlangıç değerini al
  const [examCategory, setExamCategory] = useState(initialExamCategory);

  // Modal her açıldığında initialExamCategory prop'u değişirse güncelle
  useEffect(() => {
    if (isOpen) {
      setExamCategory(initialExamCategory);
    }
  }, [isOpen, initialExamCategory]);

  // Taslak otomatik kaydetme — form değişince 1.5s sonra yaz
  useEffect(() => {
    if (!isOpen || isEdit) return;
    clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      if (!form.text.trim() && form.options.every(o => !o.trim())) return;
      saveDraft({ form, imageTab, imagePreview: imagePreview?.startsWith('data:') ? null : imagePreview });
      setDraftSavedAt(new Date());
    }, 1500);
    return () => clearTimeout(draftTimer.current);
  }, [form, imageTab, imagePreview, isOpen, isEdit]);

  useEffect(() => {
    if (isOpen) {
      if (existingQuestion) {
        setForm({
          text: existingQuestion.text || '',
          options: existingQuestion.options?.length >= 2 ? existingQuestion.options : ['', '', '', ''],
          correctAnswer: existingQuestion.correctAnswer || 0,
          category: existingQuestion.category?._id || existingQuestion.category || initialCategoryId || '',
          exam: existingQuestion.exam?._id || existingQuestion.exam || initialExamId || '',
          difficulty: existingQuestion.difficulty || 'medium',
          explanation: existingQuestion.explanation || '',
          testType: existingQuestion.testType || testType,
          coefficient: String(existingQuestion.coefficient || 1.0),
          media: existingQuestion.media || '',
          subject: existingQuestion.subject || '',
        });
        if (existingQuestion.media) {
          setImagePreview(resolveMediaUrl(existingQuestion.media));
          if (existingQuestion.media.startsWith('http')) setImageTab('url');
          else if (existingQuestion.media.includes('/signs/')) setImageTab('sign');
          else setImageTab('upload');
        }
        setHasDraft(false);
      } else {
        const draft = loadDraft();
        if (draft && !isCopy) {
          setHasDraft(true);
        } else {
          setForm({ ...BASE_EMPTY_FORM, category: initialCategoryId || '', exam: initialExamId || '', testType });
          setImagePreview(null);
          setHasDraft(false);
        }
      }
      setImageFile(null);
      setErrors({});
      setDraftSavedAt(null);
    }
  }, [isOpen, existingQuestion, initialCategoryId, initialExamId, testType, isCopy]);

  const applyDraft = () => {
    const draft = loadDraft();
    if (!draft) return;
    setForm(draft.form || { ...BASE_EMPTY_FORM, category: initialCategoryId || '', exam: initialExamId || '', testType });
    setImageTab(draft.imageTab || 'sign');
    if (draft.imagePreview) setImagePreview(draft.imagePreview);
    setHasDraft(false);
  };

  const discardDraft = () => {
    clearDraft();
    setForm({ ...BASE_EMPTY_FORM, category: initialCategoryId || '', exam: initialExamId || '', testType });
    setImagePreview(null);
    setHasDraft(false);
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const examMatchesType = (exam, type) => normalizeTestType(exam._resolvedTestType || exam.testType) === type;

  // Sınav İş Makinesi'ne ait mi? Kategori adı veya sınav adından tespit et
  const IS_MAKINESI_KEYWORDS = ['iş makinesi', 'is makinesi', 'forklift', 'vinç', 'vinc', 'ekskavatör',
    'ekskavatör', 'operatör', 'operator', 'inşaat', 'insaat', 'isg', 'iş güvenliği', 'is guvenligi',
    'kepçe', 'kepce', 'beko', 'dozer', 'kazıcı', 'kazici'];

  const isExamIsMakinesi = (exam) => {
    const examName = (exam.name || '').toLowerCase();
    // Önce sınav adına bak
    if (IS_MAKINESI_KEYWORDS.some(k => examName.includes(k))) return true;
    // Sonra kategori adına bak
    const examCatId = (exam.categoryId?._id || exam.categoryId)?.toString();
    if (!examCatId) return false;
    const cat = categories.find(c => c._id?.toString() === examCatId);
    const catName = (cat?.name || '').toLowerCase();
    return IS_MAKINESI_KEYWORDS.some(k => catName.includes(k));
  };

  const examsForCategory = exams.filter(exam => {
    const isIM = isExamIsMakinesi(exam);
    if (examCategory === 'is_makinesi') return isIM;
    // B Sınıfı: İş Makinesi olmayanlar + kategorisiz (genel) sınavlar
    const examCatId = (exam.categoryId?._id || exam.categoryId)?.toString();
    if (!examCatId) return true;
    return !isIM;
  });

  const selectableExams = isShortTest ? exams : examsForCategory.filter(exam => examMatchesType(exam, form.testType));
  const selectedExam = exams.find(exam => exam._id === form.exam);
  const examOptions = selectedExam && !selectableExams.some(exam => exam._id === selectedExam._id)
    ? [selectedExam, ...selectableExams]
    : selectableExams;

  // Seçili sınavın kategorisine göre konu listesini belirle
  // Branş listesi doğrudan seçilen ehliyet kategorisinden belirlenir
  const subjectList = examCategory === 'is_makinesi' ? IS_MAKINESI_SUBJECTS : B_CLASS_SUBJECTS;
  const selectedExamCatName = examCategory === 'is_makinesi' ? 'İş Makinesi' : 'B Sınıfı';

  // Video olmayan kategorileri filtrele
  const nonVideoCategories = categories.filter(c => !isVideoCategory(c));

  const setOption = (i, val) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm(f => ({ ...f, options: opts }));
  };

  const addOption = () => {
    if (form.options.length < 5) setForm(f => ({ ...f, options: [...f.options, ''] }));
  };

  const removeOption = (i) => {
    if (form.options.length <= 2) return;
    const opts = form.options.filter((_, idx) => idx !== i);
    setForm(f => ({
      ...f,
      options: opts,
      correctAnswer: f.correctAnswer >= opts.length ? 0 : (f.correctAnswer === i ? 0 : f.correctAnswer > i ? f.correctAnswer - 1 : f.correctAnswer),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    // Use comprehensive validation utility
    const validation = validateQuestionForm(form);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      let mediaUrl = form.media;

      // Upload image if selected with retry logic
      if (imageFile && imageTab === 'upload') {
        const uploadResult = await uploadImage(imageFile, {
          apiEndpoint: '/api/upload',
          compress: true,
          config: { maxRetries: 3 },
        });

        if (!uploadResult.success) {
          setErrors({ media: uploadResult.error || 'Görsel yüklenemedi' });
          setLoading(false);
          return;
        }

        mediaUrl = uploadResult.url;
      } else if (imageTab === 'url') {
        mediaUrl = form.media;
      } else if (!imagePreview) {
        mediaUrl = '';
      }

      const payload = {
        text: form.text.trim(),
        options: form.options.filter(o => o.trim()),
        correctAnswer: form.correctAnswer,
        category: form.category || null,
        exam: form.exam || null,
        difficulty: form.difficulty,
        explanation: form.explanation.trim(),
        testType: form.testType || testType,
        coefficient: parseFloat(form.coefficient) || 1.0,
        media: mediaUrl,
        subject: form.subject || '',
      };

      // API call with retry logic
      const result = await executeAPICall(
        async () => {
          if (isEdit) {
            return await api.put(`/questions/${existingQuestion._id}`, payload);
          } else {
            return await api.post('/questions', payload);
          }
        },
        isEdit ? 'Soru Güncelleme' : 'Soru Oluşturma',
        { maxRetries: 3 }
      );

      if (!result.success) {
        setErrors({ submit: result.error });
        setLoading(false);
        return;
      }

      clearDraft();
      onSaved();
      onClose();
    } catch (err) {
      console.error('[handleSubmit]', err);
      const errorMsg = getErrorMessage(err);
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Build category tree for dropdown — video kategorileri hariç
  const buildCategoryOptions = (filterVideos = false) => {
    const sourceCategories = filterVideos ? nonVideoCategories : categories;
    const roots = sourceCategories.filter(c => !c.parent?._id && !c.parent);
    const result = [];
    const addLevel = (cats, level) => {
      cats.forEach(cat => {
        const children = sourceCategories.filter(c => (c.parent?._id || c.parent) === cat._id);
        const isLeaf = children.length === 0;
        result.push({ ...cat, _level: level, _isLeaf: isLeaf });
        if (children.length > 0) addLevel(children, level + 1);
      });
    };
    addLevel(roots, 0);
    return result;
  };

  // Seçili ehliyet kategorisine göre sadece o kökün alt kategorilerini göster
  const catOptions = useMemo(() => {
    const all = buildCategoryOptions(true); // video hariç
    return all.filter(cat => getCategoryGroup(cat, categories) === examCategory);
  }, [categories, examCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl p-0 sm:p-4">
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.97 }}
        className="relative flex max-h-[95vh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#11131a] shadow-xl shadow-black/40 sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isShortTest ? 'border-accent/30 bg-accent/15 text-accent-light' : 'border-primary/30 bg-primary/15 text-primary-light'}`}>
              {isShortTest ? <BookOpen className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-white truncate">
                {isEdit ? 'Soruyu Düzenle' : isCopy ? 'Soruyu Kopyala' : isShortTest ? 'Kısa Test Sorusu Ekle' : 'Sınav Sorusu Ekle'}
              </h2>
              <p className="text-xs text-text-muted truncate">
                {isShortTest ? 'Kategoriye kısa test sorusu ekle' : 'Deneme / gerçek sınav sorusu ekle'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {draftSavedAt && !isEdit && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-success/70 bg-success/10 border border-success/20 px-2 py-1 rounded-lg">
                <CheckCircle2 className="w-3 h-3" /> Taslak kaydedildi
              </span>
            )}
            <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-white/[0.07] text-text-muted hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Taslak Bildirim Bandı */}
        {hasDraft && (
          <div className="flex items-center justify-between gap-3 bg-amber-500/10 border-b border-amber-500/20 px-5 py-3 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs font-bold text-amber-300 truncate">Kaydedilmemiş bir taslak var. Kaldığınız yerden devam etmek ister misiniz?</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={applyDraft} className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl hover:bg-amber-500/30 transition-all">Devam Et</button>
              <button onClick={discardDraft} className="px-3 py-1.5 bg-white/5 border border-white/10 text-text-muted text-xs font-bold rounded-xl hover:bg-white/10 hover:text-white transition-all">Sil</button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Ehliyet Kategorisi Seçimi — hem sınav hem kısa test soruları için */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Folder className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-text-secondary">Ehliyet Kategorisi</span>
            </div>
            <div className="flex p-1 bg-black/20 border border-white/10 rounded-2xl gap-1">
              {[
                { id: 'b_class', label: '🚗 B Sınıfı', desc: 'Trafik, Motor, İlkyardım, Adap' },
                { id: 'is_makinesi', label: '🏗️ İş Makinesi', desc: 'MEB ortak 4 teorik branş' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setExamCategory(cat.id); setField('subject', ''); }}
                  className={`flex-1 flex flex-col items-center py-2.5 px-3 rounded-xl transition-all ${
                    examCategory === cat.id
                      ? 'bg-primary/20 border border-primary/40 text-primary-light'
                      : 'text-text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs font-black">{cat.label}</span>
                  <span className="text-[10px] text-text-muted mt-0.5">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category / Exam Selection */}
          {isShortTest ? (
            <InputField label="Kategori / Konu" icon={Folder} required error={errors.category}>
              <select
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/40 transition-all"
                value={form.category}
                onChange={e => setField('category', e.target.value)}
              >
                <option value="" className="bg-bg-card text-white/40">Kategori seçin...</option>
                {catOptions.map(cat => (
                  <option
                    key={cat._id}
                    value={cat._id}
                    disabled={!cat._isLeaf}
                    className={`bg-bg-card ${!cat._isLeaf ? 'text-white/30' : 'text-white'}`}
                  >
                    {'— '.repeat(cat._level)}{!cat._isLeaf ? '📁 ' : '📄 '}{cat.name}{!cat._isLeaf ? ' (grup)' : ''}
                  </option>
                ))}
              </select>
            </InputField>
          ) : (
            <InputField label="Sınav Bağlantısı (Opsiyonel)" icon={PenTool}>
              <select
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/40 transition-all"
                value={form.exam}
                onChange={e => setField('exam', e.target.value)}
              >
                <option value="" className="bg-bg-card text-white/40">Sınav ata (opsiyonel)</option>
                {examOptions.map(exam => (
                  <option key={exam._id} value={exam._id} className="bg-bg-card text-white">
                    {EXAM_TYPES[normalizeTestType(exam._resolvedTestType || exam.testType)]?.icon || '📋'} {exam.name} ({exam.duration} dk)
                  </option>
                ))}
              </select>
            </InputField>
          )}

          {/* Konu Seçimi — sınav kategorisine göre dinamik liste */}
          {!isShortTest && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-text-secondary">Soru Konusu / Branş</span>
                <span className="text-danger text-xs">(Zorunlu)</span>
                {selectedExamCatName && (
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-text-muted truncate max-w-[160px]">
                    📂 {selectedExamCatName}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subjectList.map(subj => (
                  <button
                    key={subj.value}
                    type="button"
                    onClick={() => setField('subject', subj.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                      form.subject === subj.value
                        ? 'bg-primary/20 border-primary/40 text-primary-light'
                        : 'bg-black/20 border-white/10 text-text-muted hover:border-white/20 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base leading-none shrink-0">{subj.emoji}</span>
                    <span className="leading-tight">{subj.label}</span>
                  </button>
                ))}
              </div>
              {/* Seçili değil ise uyarı */}
              {!form.subject && (
                <p className="text-[11px] text-text-muted mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-warning/60" /> Bir konu seçin (filtreleme ve istatistikler için kullanılır)
                </p>
              )}
            </div>
          )}

          {/* Sınav Türü Seçimi (Sadece sınavlar için) */}
          {!isShortTest && (
            <InputField label="Sınav Grubu (Deneme / Gerçek)" icon={RefreshCw}>
              <div className="flex p-1 bg-black/20 border border-white/10 rounded-2xl">
                {[
                  { id: 'mock_exam', label: '📊 Deneme Sınavı' },
                  { id: 'real_exam', label: '🛡️ Gerçek Sınav' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      testType: t.id,
                      exam: exams.some(exam => exam._id === f.exam && examMatchesType(exam, t.id)) ? f.exam : '',
                    }))}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${form.testType === t.id
                      ? `${t.id === 'real_exam' ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300' : 'bg-primary/20 border border-primary/30 text-primary-light'}`
                      : 'text-text-muted hover:bg-white/[0.04] hover:text-white'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </InputField>
          )}

          {/* Question Text */}
          <InputField label="Soru Metni" icon={FileText} required error={errors.text}>
            <textarea
              rows={3}
              className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/40 transition-colors resize-none placeholder:text-white/20"
              placeholder="Soru metnini buraya yazın..."
              value={form.text}
              onChange={e => setField('text', e.target.value)}
            />
          </InputField>

          {/* Görsel Ekle — İki mod: Levha Seç / Dosya Yükle */}
          <InputField label="Soru Görseli (Opsiyonel)" icon={ImageIcon}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

            {/* Mod seçici */}
            <div className="flex p-1 bg-black/20 border border-white/10 rounded-2xl mb-3">
              <button type="button" onClick={() => setImageTab('sign')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  imageTab === 'sign' ? 'bg-primary/20 border border-primary/30 text-primary-light' : 'text-text-muted hover:bg-white/[0.04] hover:text-white'}`}>
                🚦 Levha seç
              </button>
              <button type="button" onClick={() => setImageTab('upload')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  imageTab === 'upload' ? 'bg-primary/20 border border-primary/30 text-primary-light' : 'text-text-muted hover:bg-white/[0.04] hover:text-white'}`}>
                <UploadCloud className="w-3.5 h-3.5" /> Dosya yükle
              </button>
              <button type="button" onClick={() => setImageTab('url')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  imageTab === 'url' ? 'bg-primary/20 border border-primary/30 text-primary-light' : 'text-text-muted hover:bg-white/[0.04] hover:text-white'}`}>
                <Link className="w-3.5 h-3.5" /> Bağlantı (URL)
              </button>
            </div>

            {/* Seçili görsel önizleme */}
            {imagePreview && (
              <div className="relative mb-3">
                <div className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center">
                  <img src={imagePreview} alt="Önizleme" className="max-h-full max-w-full object-contain p-2" />
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button type="button"
                    onClick={() => { setImagePreview(null); setImageFile(null); setField('media', ''); }}
                    className="w-7 h-7 rounded-full bg-danger/90 flex items-center justify-center text-white shadow-lg">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-text-muted text-center truncate px-2">
                  {form.media || 'İçeride dosya'}
                </p>
              </div>
            )}

            {/* Levha Seç modu */}
            {imageTab === 'sign' && (
              <button type="button"
                onClick={() => setSignPickerOpen(true)}
                className={`w-full py-3 border border-dashed rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                  examCategory === 'is_makinesi'
                    ? 'border-orange-500/30 text-orange-300 hover:bg-orange-500/10'
                    : 'border-primary/30 text-primary-light hover:bg-primary/10'
                }`}>
                {examCategory === 'is_makinesi' ? '🦺' : '🚦'} {imagePreview ? 'Başka Levha Seç' : examCategory === 'is_makinesi' ? 'İSG Levhası Seç (296 levha)' : 'Trafik Levhası Seç (269 levha)'}
              </button>
            )}

            {/* Dosya Yükle modu */}
            {imageTab === 'upload' && !imagePreview && (
              <button type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-white/30 hover:border-primary/40 hover:text-primary-light transition-colors">
                <UploadCloud className="w-7 h-7" />
                <span className="text-xs font-medium">Görsel seçmek için tıklayın</span>
                <span className="text-[10px]">JPEG, PNG, WebP • Max 5MB</span>
              </button>
            )}
            {imageTab === 'upload' && imagePreview && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 text-xs font-bold text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-all">
                Başka Dosya Seç
              </button>
            )}

            {/* URL modu */}
            {imageTab === 'url' && (
              <div className="mt-1 w-full relative">
                <input
                  type="text"
                  placeholder="Resim veya Video URL'si (http://...)"
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/40 transition-colors placeholder:text-white/20"
                  value={form.media.startsWith('http') ? form.media : ''}
                  onChange={e => {
                    const val = e.target.value;
                    setField('media', val);
                    setImageFile(null); // clear if there was a file
                    if (val.match(/\.(jpeg|jpg|gif|png|webp)$/i) || val.trim() === '') {
                      setImagePreview(val);
                    } else {
                      setImagePreview(val); // fallback for all urls, let image tag handle it
                    }
                  }}
                />
              </div>
            )}
          </InputField>

          {/* Difficulty + Coefficient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Zorluk Seviyesi" icon={Zap}>
              <div className="flex p-1 bg-black/20 border border-white/10 rounded-2xl">
                {['easy', 'medium', 'hard'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setField('difficulty', d)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${form.difficulty === d
                      ? d === 'hard' ? 'bg-danger/20 border border-danger/30 text-rose-300' : d === 'medium' ? 'bg-warning/20 border border-warning/30 text-amber-300' : 'bg-success/20 border border-success/30 text-emerald-300'
                      : 'text-text-muted hover:bg-white/[0.04] hover:text-white'}`}
                  >
                    {d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'} {DIFFICULTY_CONFIG[d].label}
                  </button>
                ))}
              </div>
            </InputField>
            <InputField label="Katsayı" icon={Star}>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="5"
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/40 transition-colors"
                value={form.coefficient}
                onChange={e => setField('coefficient', e.target.value)}
              />
            </InputField>
          </div>

          {/* Explanation */}
          <InputField label="Açıklama (Opsiyonel - doğru cevabın nedeni)" icon={HelpCircle}>
            <textarea
              rows={2}
              className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/40 transition-colors resize-none placeholder:text-white/20"
              placeholder="Doğru cevabın neden doğru olduğunu açıklayın..."
              value={form.explanation}
              onChange={e => setField('explanation', e.target.value)}
            />
          </InputField>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-white/40" />
                <span className="text-xs font-black text-white/40 uppercase tracking-widest">Şıklar (En az 2)</span>
              </div>
              {form.options.length < 5 && (
                <button type="button" onClick={addOption}
                  className="flex items-center gap-1 text-xs font-bold text-primary-light hover:text-white transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Şık Ekle
                </button>
              )}
            </div>
            {errors.options && <p className="text-danger text-xs mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.options}</p>}
            <div className="space-y-3">
              {form.options.map((opt, i) => {
                const isCorrect = form.correctAnswer === i;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${isCorrect ? 'border-success/30 bg-success/10' : 'border-white/10 bg-black/20'}`}>
                    <button
                      type="button"
                      onClick={() => setField('correctAnswer', i)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${isCorrect ? 'bg-success text-white' : 'bg-white/[0.06] text-white/40 hover:bg-white/[0.1] hover:text-white'}`}
                    >
                      {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : String.fromCharCode(65 + i)}
                    </button>
                    <input
                      className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 font-medium"
                      placeholder={`${String.fromCharCode(65 + i)} şıkkını girin...`}
                      value={opt}
                      onChange={e => setOption(i, e.target.value)}
                    />
                    {i >= 2 && (
                      <button type="button" onClick={() => removeOption(i)} className="text-danger/40 hover:text-danger transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {errors.submit && (
            <div className="p-4 bg-danger/10 border border-danger/30 rounded-2xl flex items-center gap-3 text-danger text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />{errors.submit}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#0d0f14] px-6 py-4 shrink-0 gap-4">
          <button type="button" onClick={onClose} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-white transition-colors disabled:opacity-60 ${isShortTest ? 'bg-accent hover:bg-accent/80' : 'bg-primary hover:bg-primary-light'}`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </motion.div>
      {/* Levha Seçici Modal */}
      <AnimatePresence>
        {signPickerOpen && (
          <SignPickerModal
            mode={examCategory === 'is_makinesi' ? 'isg' : 'traffic'}
            onClose={() => setSignPickerOpen(false)}
            onSelect={(assetPath, previewUrl) => {
              setField('media', assetPath);
              setImagePreview(previewUrl);
              setSignPickerOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Sign Picker Modal ────────────────────────────────────────────────────────
// Trafik levhası id → title hızlı lookup (array'den map oluştur)
const trafficSignsMap = new Map(trafficSignsData.map(s => [s.id, s.title]));

const SignPickerModal = ({ onClose, onSelect, mode = 'traffic' }) => {
  const isIsg = mode === 'isg';

  // Trafik levhaları için state
  const [activeCat, setActiveCat] = useState(SIGN_CATEGORIES[0].key);
  const [signs, setSigns] = useState([]);
  const [loadingSigns, setLoadingSigns] = useState(false);
  const [prevActiveCat, setPrevActiveCat] = useState(activeCat);

  // İSG levhaları için state
  const [activeIsgCat, setActiveIsgCat] = useState(() => isgSignsData[0]?.category || '');
  const [search, setSearch] = useState('');

  // İSG kategorilerini hesapla
  const isgCategories = useMemo(() => {
    const cats = [...new Set(isgSignsData.map(s => s.category))];
    return cats.map(cat => ({
      key: cat,
      label: isgSignsData.find(s => s.category === cat)?.categoryLabel || cat,
    }));
  }, []);

  if (!isIsg && activeCat !== prevActiveCat) {
    setPrevActiveCat(activeCat);
    setLoadingSigns(true);
    setSigns([]);
  }

  useEffect(() => {
    if (isIsg) return;
    let active = true;
    fetchSignsInCategory(activeCat).then(files => {
      if (active) {
        setSigns(files);
        setLoadingSigns(false);
      }
    });
    return () => { active = false; };
  }, [activeCat, isIsg]);

  // İSG filtrelenmiş levhalar
  const isgFiltered = useMemo(() => {
    if (!isIsg) return [];
    let list = activeIsgCat ? isgSignsData.filter(s => s.category === activeIsgCat) : isgSignsData;
    if (search) list = list.filter(s => (s.title || s.id || '').toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [isIsg, activeIsgCat, search]);

  // Trafik filtrelenmiş levhalar
  const filtered = search
    ? signs.filter(f => f.toLowerCase().includes(search.toLowerCase()))
    : signs;

  const totalCount = isIsg ? isgSignsData.length : 269;
  const catCount = isIsg ? isgCategories.length : 4;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl bg-bg-card border border-white/10 rounded-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: '88vh' }}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center gap-3 shrink-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${isIsg ? 'bg-orange-500/20 text-orange-400' : 'bg-warning/20 text-warning'}`}>
            {isIsg ? '🦺' : '🚦'}
          </div>
          <div>
            <h2 className="font-black text-white">{isIsg ? 'İSG Levhası Seç' : 'Trafik Levhası Seç'}</h2>
            <p className="text-xs text-text-muted">{totalCount} levha · {catCount} kategori</p>
          </div>
          <button onClick={onClose} className="ml-auto p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 p-3 border-b border-white/5 shrink-0 overflow-x-auto">
          {isIsg ? (
            isgCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => { setActiveIsgCat(cat.key); setSearch(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeIsgCat === cat.key
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))
          ) : (
            SIGN_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => { setActiveCat(cat.key); setSearch(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCat === cat.key
                    ? `${cat.bg} ${cat.color} border ${cat.border}`
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))
          )}
        </div>

        {/* Search */}
        <div className="px-4 py-3 shrink-0">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 gap-3">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={isIsg ? "Levha adı veya kodu ara..." : "Levha adı ara... (örn: tt-1, t-22)"}
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-text-muted" /></button>}
          </div>
        </div>

        {/* Signs grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isIsg ? (
            isgFiltered.length === 0 ? (
              <div className="py-16 text-center text-text-muted text-sm">Sonuç bulunamadı</div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                {isgFiltered.map(sign => {
                  const previewUrl = resolveMediaUrl(sign.image);
                  return (
                    <button
                      key={sign.id}
                      onClick={() => onSelect(sign.image, previewUrl)}
                      className="group flex flex-col items-center gap-1.5 p-2 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-orange-500/40 hover:bg-orange-500/10 transition-all"
                      title={sign.title}
                    >
                      <div className="w-full aspect-square bg-white/5 rounded-xl flex items-center justify-center overflow-hidden p-1">
                        <img
                          src={previewUrl}
                          alt={sign.title}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          onError={e => { e.target.style.opacity = '0.2'; }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-text-muted group-hover:text-orange-300 transition-colors truncate w-full text-center">
                        {sign.code || sign.title?.slice(0, 12)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )
          ) : loadingSigns ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-text-muted text-sm">Sonuç bulunamadı</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {filtered.map(filename => {
                const assetPath = `assets/images/signs/${activeCat}/${filename}`;
                const previewUrl = resolveMediaUrl(assetPath);
                const code = filename.replace('.png', '');
                const signKey = `${activeCat}/${filename}`;
                const signTitle = trafficSignsMap.get(signKey) || code;
                return (
                  <button
                    key={filename}
                    onClick={() => onSelect(assetPath, previewUrl)}
                    className="group flex flex-col items-center gap-1.5 p-2 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/10 transition-all"
                    title={`${code} — ${signTitle}`}
                  >
                    <div className="w-full aspect-square bg-transparent flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt={signTitle}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={e => { e.target.style.opacity = '0.2'; }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-primary-light/60 group-hover:text-primary-light transition-colors truncate w-full text-center">{code}</span>
                    <span className="text-[8px] text-text-muted group-hover:text-white/60 transition-colors line-clamp-2 w-full text-center leading-tight">{signTitle !== code ? signTitle : ''}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 shrink-0 flex items-center justify-between">
          <span className="text-xs text-text-muted">{filtered.length} levha gösteriliyor</span>
          <button onClick={onClose} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">İptal</button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Exam Form Modal ───────────────────────────────────────────────────────────
const ExamFormModal = ({
  isOpen,
  onClose,
  onSaved,
  categories,
  existingExam,
  forceMiniTest = false,
  testType = 'mock_exam',
  lockTestType = false,
  initialCategoryGroup = 'b_class',
}) => {
  const isEdit = !!existingExam;
  // Tür bazlı etiketler — deneme/gerçek/kısa test karışmasın
  const typeLabel = forceMiniTest
    ? 'Kısa Test'
    : testType === 'real_exam'
      ? 'Gerçek Sınav'
      : 'Deneme Sınavı';
  // Gerçek sınav ekranında yalnızca B Sınıfı ve İş Makinesi kökleri seçilebilir.
  const catOptions = useMemo(() => {
    return categories
      .filter(c => !isVideoCategory(c) && !c.parent?._id && !c.parent)
      .filter(c => !lockTestType || Boolean(getCategoryGroupFromText(c.name)))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories, lockTestType]);

  const [form, setForm] = useState({ name: '', description: '', duration: '45', categoryId: '', isPro: false, isMiniTest: forceMiniTest, testType, passingScore: '70' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (existingExam) {
        setForm({
          name: existingExam.name || '',
          description: existingExam.description || '',
          duration: String(existingExam.duration || 45),
          categoryId: existingExam.categoryId?._id || existingExam.categoryId || '',
          isPro: existingExam.isPro || false,
          isMiniTest: existingExam.isMiniTest || false,
          testType: existingExam.isMiniTest ? 'short_test' : resolveExamTestType(existingExam),
          passingScore: String(existingExam.passingScore || 70),
        });
      } else {
        const initialCategory =
          catOptions.find(category => getCategoryGroupFromText(category.name) === initialCategoryGroup) ||
          catOptions[0];
        setForm({ name: '', description: '', duration: '45', categoryId: initialCategory?._id || '', isPro: false, isMiniTest: forceMiniTest, testType: forceMiniTest ? 'short_test' : testType, passingScore: '70' });
      }
      setError('');
    }
  }, [isOpen, existingExam, forceMiniTest, testType, catOptions, initialCategoryGroup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Sınav adı zorunludur.'); return; }
    if (lockTestType && !form.categoryId) { setError('B Sınıfı veya İş Makinesi kategorisi seçilmelidir.'); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        duration: parseInt(form.duration) || 45,
        categoryId: form.categoryId || null,
        isPro: form.isPro,
        isMiniTest: form.isMiniTest,
        testType: form.isMiniTest ? 'short_test' : lockTestType ? testType : form.testType,
        passingScore: parseInt(form.passingScore) || 70,
      };
      if (isEdit) {
        await api.put(`/exams/${existingExam._id}`, payload);
      } else {
        await api.post('/exams', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl p-0 sm:p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#11131a] shadow-xl shadow-black/40 max-h-[96vh] sm:max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-warning/30 bg-warning/15 text-warning">
              <PenTool className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-white text-base truncate">{isEdit ? `${typeLabel} Düzenle` : `Yeni ${typeLabel} Oluştur`}</h2>
              <p className="text-xs text-text-muted truncate">{typeLabel} bilgilerini girin</p>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 ml-2 rounded-xl p-2 transition-colors hover:bg-white/[0.07] text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Sınav Adı */}
          <div>
            <label className="text-xs font-bold text-text-secondary mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-warning" /> {typeLabel} Adı <span className="text-danger">*</span>
            </label>
            <input
              className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-warning/40 transition-colors placeholder:text-white/20"
              placeholder={`Örn: 2024 ${typeLabel} 1`}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Sınav Türü */}
          {!forceMiniTest && !lockTestType && (
            <div>
              <label className="text-xs font-bold text-text-secondary mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-warning" /> Sınav Türü
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 border border-white/10 rounded-2xl">
                {[
                  { id: 'mock_exam', label: 'Deneme Sınavı', icon: Zap },
                  { id: 'real_exam', label: 'Gerçek Sınav', icon: Shield },
                ].map(type => {
                  const Icon = type.icon;
                  const active = form.testType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, testType: type.id }))}
                      className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                        active
                          ? type.id === 'real_exam'
                            ? 'bg-warning/20 border border-warning/30 text-amber-300'
                            : 'bg-primary/20 border border-primary/30 text-primary-light'
                          : 'text-text-muted hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Açıklama */}
          <div>
            <label className="text-xs font-bold text-text-secondary mb-2 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-warning" /> Açıklama <span className="text-text-muted font-normal">(Opsiyonel)</span>
            </label>
            <textarea
              rows={2}
              className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-warning/40 transition-colors resize-none placeholder:text-white/20"
              placeholder="Sınav hakkında kısa bir açıklama..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Süre + Geçme Notu + Sınav Kategorisi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-secondary mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-warning" /> Süre (Dakika)
              </label>
              <input
                type="number" min="1"
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-warning/40 transition-colors"
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary mb-2 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-warning" /> Geçme Notu (%)
              </label>
              <input
                type="number" min="0" max="100"
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-warning/40 transition-colors"
                value={form.passingScore}
                onChange={e => setForm(f => ({ ...f, passingScore: e.target.value }))}
              />
            </div>
          </div>

          {/* Sınav Kategorisi */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-bold text-text-secondary mb-2 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-warning" /> {typeLabel} Kategorisi <span className="text-danger">*</span>
              </label>
              <select
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-warning/40 transition-colors"
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="" className="bg-bg-card text-white/40">Kategori seçin...</option>
                {catOptions.map(c => (
                  <option key={c._id} value={c._id} className="bg-bg-card text-white">
                    {c.name}
                  </option>
                ))}
              </select>
              {!form.categoryId && (
                <p className="text-[11px] text-warning mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Deneme sınavları için kategori seçin
                </p>
              )}
            </div>
          </div>

          {/* PRO Toggle */}
          <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${form.isPro ? 'border-warning/30 bg-warning/10' : 'border-white/10 bg-black/20'}`}>
            <input type="checkbox" checked={form.isPro} onChange={e => setForm(f => ({ ...f, isPro: e.target.checked }))} className="hidden" />
            <div className={`w-9 h-5 rounded-full shrink-0 transition-colors relative ${form.isPro ? 'bg-warning' : 'bg-white/10'}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${form.isPro ? 'left-5' : 'left-0.5'}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white flex items-center gap-2 truncate">
                <Shield className="w-4 h-4 text-warning shrink-0" /> PRO Üyelik Gerekli
              </p>
              <p className="text-[10px] text-text-muted truncate">Sadece PRO hesaplara özel</p>
            </div>
          </label>

          {error && (
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
        </form>

        {/* Footer — sticky */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#0d0f14] px-5 py-4 shrink-0 gap-3">
          <button type="button" onClick={onClose} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">İptal</button>
          <div className="flex items-center gap-2">
            {!isEdit && (
              <p className="text-[10px] text-text-muted hidden sm:block">
                {typeLabel} olarak taslak oluşturulur, soruları ekledikten sonra yayınlayabilirsiniz
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-warning px-6 py-3 text-xs font-black text-white transition-colors hover:bg-warning/80 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? <Save className="w-4 h-4" /> : <FileX className="w-4 h-4" />}
              {isEdit ? 'Güncelle' : `${typeLabel} Oluştur`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── CSV Import Modal ──────────────────────────────────────────────────────────
const CsvImportModal = ({ isOpen, onClose, onImported, exams, testType = 'mock_exam' }) => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [csv, setCsv] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => { if (isOpen) { setCsv(''); setResult(null); setError(''); setSelectedExamId(''); } }, [isOpen]);

  const handleImport = async () => {
    if (!csv.trim()) {
      setError('CSV içeriği boş olamaz.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Parse CSV with improved parser
      const parseResult = parseCSV(csv);

      if (!parseResult.success && parseResult.errors.length > 0) {
        // Show first error message
        setError(parseResult.errors[0] || 'CSV ayrıştırma hatası');
        setLoading(false);
        return;
      }

      if (parseResult.data.length === 0) {
        setError('CSV dosyasında geçerli veri satırı bulunamadı');
        setLoading(false);
        return;
      }

      // Show warnings if any
      if (parseResult.warnings.length > 0) {
        console.warn('CSV Warnings:', parseResult.warnings);
      }

      // Import with retry logic
      const importResult = await executeAPICall(
        async () => {
          return await api.post('/questions/bulk-csv', {
            questions: parseResult.data,
            examId: selectedExamId || null,
            testType,
            subject: selectedSubject,
          });
        },
        'CSV İçe Aktarma',
        { maxRetries: 3 }
      );

      if (!importResult.success) {
        setError(importResult.error || 'İçe aktarma hatası');
        setLoading(false);
        return;
      }

      setResult({
        count: importResult.data?.count || importResult.data?.imported || parseResult.data.length,
        skipped: importResult.data?.skipped || 0,
        imported: parseResult.data.length,
        warnings: parseResult.warnings,
      });

      onImported();
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      console.error('[handleImport]', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl p-0 sm:p-4">
      <motion.div initial={{ y: 60, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 60, opacity: 0, scale: 0.97 }} className="relative flex max-h-[95vh] sm:max-h-[90vh] w-full sm:max-w-2xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#11131a] shadow-xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15 text-primary-light">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-white">CSV ile Toplu Soru Ekle</h2>
              <p className="text-xs text-text-muted">Sınav soruları için CSV formatı</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-white/[0.07] text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-text-secondary mb-2 block">Sınav Seçimi (Opsiyonel)</label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-primary/40 transition-colors"
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
            >
              <option value="" className="bg-bg-card text-white/40">Sınav atamadan ekle</option>
              {exams.map(ex => <option key={ex._id} value={ex._id} className="bg-bg-card">{ex.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary mb-2 block">Soru Konusu / Branş (Tüm liste için geçerli)</label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-primary/40 transition-colors"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="" className="bg-bg-card text-white/40">Konu seçilmedi</option>
              <option value="trafik" className="bg-bg-card">🚦 Trafik ve Çevre Bilgisi</option>
              <option value="ilkyardim" className="bg-bg-card">🚑 İlk Yardım Bilgisi</option>
              <option value="motor" className="bg-bg-card">🔧 Motor ve Araç Tekniği</option>
              <option value="adabi" className="bg-bg-card">🤝 Trafik Adabı</option>
            </select>
          </div>

          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl space-y-1.5 text-primary-light">
            <p className="text-xs font-bold">📋 CSV Formatı:</p>
            <p className="text-[11px] text-text-muted font-mono leading-relaxed">
              text, seçenek1, seçenek2, seçenek3, seçenek4, doğruCevap, zorluk, açıklama<br />
              • doğruCevap: 0=A, 1=B, 2=C, 3=D<br />
              • zorluk: easy / medium / hard<br />
              • açıklama: opsiyonel, boş bırakılabilir<br />
              • İlk satır (başlık) atlanır
            </p>
            <button type="button" onClick={() => setCsv(CSV_EXAMPLE)} className="text-xs font-bold text-primary-light hover:text-white transition-colors hover:underline">
              ▶ Örnek yapıştır
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary mb-2 block">CSV İçeriği</label>
            <textarea
              rows={12}
              className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white font-mono outline-none resize-none focus:border-primary/40 transition-colors placeholder:text-white/20"
              placeholder="CSV içeriğini buraya yapıştırın..."
              value={csv}
              onChange={e => { setCsv(e.target.value); setError(''); }}
            />
          </div>

          {error && (
            <div className="p-4 bg-danger/10 border border-danger/30 rounded-2xl text-danger text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-success/10 border border-success/30 rounded-2xl flex items-center gap-3 text-success">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold text-sm">{result.count || result.imported || '?'} soru başarıyla eklendi!</p>
                {result.skipped > 0 && <p className="text-xs text-text-muted">{result.skipped} satır atlandı (format hatası)</p>}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 bg-[#0d0f14] px-6 py-4 shrink-0 gap-3">
          <button onClick={onClose} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">
            {result ? 'Kapat' : 'İptal'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-black text-white transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {loading ? 'Yükleniyor...' : 'Yükle'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Short Test Tab ────────────────────────────────────────────────────────────
const ShortTestTab = ({ questions, categories, exams, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterMedia, setFilterMedia] = useState('all');
  const [formModal, setFormModal] = useState({ open: false, question: null, isCopy: false, categoryId: null });
  const [examModal, setExamModal] = useState({ open: false, exam: null });
  const [openCats, setOpenCats] = useState({});
  const toggleCat = (id) => setOpenCats(s => ({ ...s, [id]: !s[id] }));

  const expandAll = () => {
    const next = {};
    categories.forEach(c => next[c._id] = true);
    setOpenCats(next);
  };
  const collapseAll = () => setOpenCats({});

  const shortQuestions = questions.filter(q => q.testType === 'short_test');

  const filtered = shortQuestions.filter(q => {
    const matchesSearch = !search || q.text.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    const matchesMedia = filterMedia === 'all' || (filterMedia === 'has_media' ? !!q.media : !q.media);
    return matchesSearch && matchesDifficulty && matchesMedia;
  });

  const getQuestionsForCat = (catId) => filtered.filter(q => (q.category?._id || q.category) === catId);

  const handleDelete = async (id) => {
    if (!window.confirm('Bu soruyu silmek istediğinize emin misiniz?')) return;
    try { await api.delete(`/questions/${id}`); onRefresh(); } catch { alert('Soru silinemedi.'); }
  };

  const roots = categories.filter(c => !c.parent?._id && !c.parent);

  const renderCategory = (cat, level = 0) => {
    const children = categories.filter(c => (c.parent?._id || c.parent) === cat._id);
    const isLeaf = children.length === 0;
    const catQuestions = isLeaf ? getQuestionsForCat(cat._id) : [];
    const isOpen = openCats[cat._id] === true;
    const totalDeep = isLeaf ? catQuestions.length : categories
      .filter(c => (c.parent?._id || c.parent) === cat._id)
      .reduce((acc, child) => acc + getQuestionsForCat(child._id).length, 0);

    return (
      <div key={cat._id} className={`mb-3 transition-all duration-300 ${level > 0 ? 'ml-6 border-l border-white/10 pl-4' : ''}`}>
        <div className={`
          relative overflow-hidden rounded-2xl border transition-all duration-300
          ${isOpen
            ? 'bg-white/[0.035] border-accent/30 shadow-lg'
            : 'bg-white/[0.015] border-white/10 hover:border-white/20 hover:bg-white/[0.025]'}
        `}>
          {/* Category Header */}
          <button
            className="w-full flex items-center gap-4 p-4 text-left transition-all"
            onClick={() => toggleCat(cat._id)}
          >
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0
              ${isOpen ? 'bg-accent/20 text-accent border-accent/30' : 'bg-white/5 text-text-muted border-white/5'}
            `}>
              {level === 0 ? <Folder className="w-5 h-5" /> : isLeaf ? <BookOpen className="w-4 h-4" /> : <FolderOpen className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`font-bold tracking-tight transition-colors ${isOpen ? 'text-white' : 'text-text-secondary'} text-${level === 0 ? 'base' : 'sm'}`}>
                  {cat.name}
                </p>
                {!isLeaf && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] text-text-muted font-bold uppercase tracking-widest">
                    Klasör
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 opacity-60" />
                  {totalDeep} Soru
                </span>
                {!isLeaf && (
                  <span className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                    <Folder className="w-3.5 h-3.5 opacity-60" />
                    {children.length} Alt Konu
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isLeaf && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormModal({ open: true, question: null, isCopy: false, categoryId: cat._id });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-accent/20 border border-accent/30 text-accent text-[11px] font-bold hover:bg-accent hover:text-white transition-all"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 inline" /> Soru Ekle
                </button>
              )}
              <div className={`p-1.5 rounded-full transition-colors ${isOpen ? 'bg-accent/15 text-accent' : 'text-text-muted hover:bg-white/5'}`}>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          {/* Content */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-black/15"
              >
                <div className="p-4 pt-0 space-y-3">
                  <div className="h-px w-full bg-white/5 mb-4" />

                  {isLeaf ? (
                    <div className="space-y-3">
                      {catQuestions.length === 0 ? (
                        <div className="py-8 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                          <HelpCircle className="w-8 h-8 mx-auto mb-2 text-white/20" />
                          <p className="text-xs text-text-muted">Bu kategoriye henüz soru eklenmedi.</p>
                          <button
                            onClick={() => setFormModal({ open: true, question: null, isCopy: false, categoryId: cat._id })}
                            className="mt-2 text-xs text-accent font-bold hover:underline"
                          >
                            + İlk soruyu ekleyerek başlayın
                          </button>
                        </div>
                      ) : (
                        catQuestions.map((q, idx) => (
                          <QuestionCard
                            key={q._id} q={q} idx={idx} isShortTest
                            onEdit={(q) => setFormModal({ open: true, question: q, isCopy: false, categoryId: null })}
                            onDelete={handleDelete}
                            onCopy={(q) => setFormModal({ open: true, question: q, isCopy: true, categoryId: null })}
                          />
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {children.map(child => renderCategory(child, level + 1))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar & Filters */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] flex items-center bg-black/20 border border-white/10 rounded-2xl px-4 py-2.5 transition-colors focus-within:border-accent/50 focus-within:bg-transparent">
            <Search className="w-4 h-4 text-text-muted mr-3" />
            <input
              type="text" placeholder="Soru metninde ara..."
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/30"
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-text-muted hover:text-white" /></button>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFormModal({ open: true, question: null, isCopy: false, categoryId: null })}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-bold text-sm rounded-2xl shadow-md shadow-accent/10 hover:bg-accent/90 hover:-translate-y-0.5 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Soru Ekle
            </button>
            <button
              onClick={() => setExamModal({ open: true, exam: null })}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.05] border border-white/10 text-text-secondary font-bold text-sm rounded-2xl hover:bg-white/[0.1] hover:text-white transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Test Oluştur
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-black/20 border border-white/10 rounded-xl">
            <span className="text-[10px] font-bold text-text-muted uppercase px-2">Zorluk:</span>
            {['all', 'easy', 'medium', 'hard'].map(d => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterDifficulty === d ? 'bg-accent/20 text-accent border border-accent/20' : 'text-text-muted hover:text-white border border-transparent'
                }`}
              >
                {d === 'all' ? 'Hepsi' : d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
              </button>
            ))}
          </div>

          {/* Media Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-black/20 border border-white/10 rounded-xl">
            <span className="text-[10px] font-bold text-text-muted uppercase px-2">Görsel:</span>
            {[
              { id: 'all', label: 'Hepsi' },
              { id: 'has_media', label: 'Görselli' },
              { id: 'no_media', label: 'Görselsiz' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setFilterMedia(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterMedia === m.id ? 'bg-primary/20 text-primary-light border border-primary/20' : 'text-text-muted hover:text-white border border-transparent'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {(search || filterDifficulty !== 'all' || filterMedia !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterDifficulty('all'); setFilterMedia('all'); }}
              className="text-xs font-bold text-danger uppercase hover:underline"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Summary & Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-3 text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary border-r border-white/10 pr-4">
            <BookOpen className="w-4 h-4 text-accent" />
            <span><strong className="text-white">{shortQuestions.length}</strong> Soru</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <FolderOpen className="w-4 h-4 text-primary-light" />
            <span><strong className="text-white">{categories.length}</strong> Kategori</span>
          </div>
          {search && <span className="text-text-muted text-[11px] ml-auto">• Aramada {filtered.length} sonuç</span>}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="px-4 py-2 text-xs font-bold tracking-tight text-accent bg-accent/10 border border-accent/20 rounded-xl hover:bg-accent/20 transition-all">Tümünü Aç</button>
          <button onClick={collapseAll} className="px-4 py-2 text-xs font-bold tracking-tight text-text-muted bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-text-secondary transition-all">Tümünü Kapat</button>
        </div>
      </div>

      {/* Category Tree */}
      {roots.length === 0 ? (
        <div className="py-20 text-center text-text-muted">
          <Folder className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Önce İçerik Yönetimi'nden kategori oluşturun.</p>
        </div>
      ) : (
        roots.map(root => renderCategory(root, 0))
      )}

      {/* Modal */}
      <AnimatePresence>
        {formModal.open && (
          <QuestionFormModal
            isOpen={formModal.open}
            onClose={() => setFormModal({ open: false })}
            onSaved={onRefresh}
            testType="short_test"
            categories={categories}
            exams={exams}
            initialCategoryId={formModal.categoryId}
            initialExamCategory={
              formModal.categoryId
                ? getCategoryGroup(formModal.categoryId, categories) || 'b_class'
                : 'b_class'
            }
            existingQuestion={formModal.question}
            isCopy={formModal.isCopy}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {examModal.open && (
          <ExamFormModal
            isOpen={examModal.open}
            onClose={() => setExamModal({ open: false, exam: null })}
            onSaved={onRefresh}
            categories={categories}
            existingExam={examModal.exam}
            forceMiniTest
            testType="short_test"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Exam Questions Tab ────────────────────────────────────────────────────────
const ExamQuestionsTab = ({ questions, categories, exams, onRefresh, testType = 'exam', title = 'Sınav', activeCatFilter = 'b_class' }) => {
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterMedia, setFilterMedia] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [openExams, setOpenExams] = useState({});
  const [formModal, setFormModal] = useState({ open: false, question: null, isCopy: false, examId: null });
  const [examModal, setExamModal] = useState({ open: false, exam: null });
  const [csvModal, setCsvModal] = useState(false);
  const activeSubjects = useMemo(
    () => activeCatFilter === 'is_makinesi' ? IS_MAKINESI_SUBJECTS : B_CLASS_SUBJECTS,
    [activeCatFilter],
  );

  const toggleExam = (id) => setOpenExams(s => ({ ...s, [id]: !s[id] }));

  const expandAll = () => {
    const next = {};
    tabExams.forEach(e => next[e._id] = true);
    setOpenExams(next);
  };
  const collapseAll = () => setOpenExams({});

  // Exclude mini tests from exam tabs and keep Deneme/Gerçek lists separate.
  const typedExams = exams
    .filter(e => !e.isMiniTest)
    .map(e => ({ ...e, _resolvedTestType: resolveExamTestType(e, questions) }));
  const tabExams = typedExams.filter(e => e._resolvedTestType === testType);

  const tabQuestions = questions.filter(q => normalizeTestType(q.testType) === testType);

  const filtered = tabQuestions.filter(q => {
    const matchesSearch = !search || q.text.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    const matchesMedia = filterMedia === 'all' || (filterMedia === 'has_media' ? !!q.media : !q.media);
    const matchesSubject = filterSubject === 'all' || q.subject === filterSubject;
    return matchesSearch && matchesDifficulty && matchesMedia && matchesSubject;
  });

  const getQuestionsForExam = (examId) => filtered.filter(q => (q.exam?._id || q.exam) === examId);
  const unassigned = filtered.filter(q => !q.exam);

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Bu soruyu silmek istediğinize emin misiniz?')) return;
    try { await api.delete(`/questions/${id}`); onRefresh(); } catch { alert('Soru silinemedi.'); }
  };

  const handleDeleteExam = async (exam) => {
    if (!window.confirm(`"${exam.name}" ${title.toLowerCase()}ını silmek istediğinizden emin misiniz?\n\nBu ${title.toLowerCase()}daki sorular silinmez, atama kaldırılır.`)) return;
    try { await api.delete(`/exams/${exam._id}`); onRefresh(); } catch { alert('Sınav silinemedi.'); }
  };

  const handlePublishExam = async (exam) => {
    if (!window.confirm(`"${exam.name}" sınavını yayınlamak istediğinizden emin misiniz?\n\nYayınlandıktan sonra tüm kullanıcılara bildirim gönderilecek.`)) return;
    try {
      await api.put(`/exams/${exam._id}/publish`);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Sınav yayınlanamadı.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar & Filters */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] flex items-center bg-black/20 border border-white/10 rounded-2xl px-4 py-2.5 transition-colors focus-within:border-primary/50 focus-within:bg-transparent">
            <Search className="w-4 h-4 text-text-muted mr-3" />
            <input
              type="text" placeholder="Soru metninde ara..."
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/30"
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-text-muted hover:text-white" /></button>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCsvModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.05] border border-white/10 text-text-secondary font-bold text-sm rounded-2xl hover:bg-white/[0.1] hover:text-white transition-all whitespace-nowrap"
            >
              <UploadCloud className="w-4 h-4" /> CSV Aktar
            </button>
            <button
              onClick={() => setExamModal({ open: true, exam: null })}
              className="flex items-center gap-2 px-6 py-3 bg-warning hover:bg-warning/90 text-white font-black text-sm rounded-2xl shadow-lg shadow-warning/20 transition-all whitespace-nowrap"
            >
              <Plus className="w-5 h-5" /> + Yeni {title} Oluştur
            </button>
            <button
              onClick={() => setFormModal({ open: true, question: null, isCopy: false, examId: null })}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-2xl shadow-md shadow-primary/10 hover:bg-primary/90 hover:-translate-y-0.5 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Soru Ekle
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-black/20 border border-white/10 rounded-xl">
            <span className="text-[10px] font-bold text-text-muted uppercase px-2">Zorluk:</span>
            {['all', 'easy', 'medium', 'hard'].map(d => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterDifficulty === d ? 'bg-primary/20 text-white border border-primary/20' : 'text-text-muted hover:text-white border border-transparent'
                }`}
              >
                {d === 'all' ? 'Hepsi' : d === 'easy' ? 'Kolay' : d === 'medium' ? 'Orta' : 'Zor'}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-black/20 border border-white/10 rounded-xl">
            <span className="text-[10px] font-bold text-text-muted uppercase px-2">Branş:</span>
            {[{ value: 'all', label: 'Hepsi', emoji: '' }, ...activeSubjects].map(s => (
              <button
                key={s.value}
                onClick={() => setFilterSubject(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterSubject === s.value ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-text-muted hover:text-white border border-transparent'
                }`}
              >
                {s.emoji ? `${s.emoji} ` : ''}{s.label}
              </button>
            ))}
          </div>

          {/* Media Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-black/20 border border-white/10 rounded-xl">
            <span className="text-[10px] font-bold text-text-muted uppercase px-2">Görsel:</span>
            {[
              { id: 'all', label: 'Hepsi' },
              { id: 'has_media', label: 'Görselli' },
              { id: 'no_media', label: 'Görselsiz' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setFilterMedia(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterMedia === m.id ? 'bg-success/20 text-success border border-success/30' : 'text-text-muted hover:text-white border border-transparent'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {(search || filterDifficulty !== 'all' || filterMedia !== 'all' || filterSubject !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterDifficulty('all'); setFilterMedia('all'); setFilterSubject('all'); }}
              className="text-xs font-bold text-danger uppercase hover:underline"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Summary & Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-3 text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary border-r border-white/10 pr-4">
            <PenTool className={`w-4 h-4 ${testType === 'trial_exam' ? 'text-warning' : 'text-primary'}`} />
            <span><strong className="text-white">{tabExams.length}</strong> Aktif {title}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <HelpCircle className="w-4 h-4 text-primary-light" />
            <span><strong className="text-white">{tabQuestions.length}</strong> Soru</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="px-4 py-2 text-xs font-bold tracking-tight text-warning bg-warning/10 border border-warning/20 rounded-xl hover:bg-warning/20 transition-all">Tümünü Aç</button>
          <button onClick={collapseAll} className="px-4 py-2 text-xs font-bold tracking-tight text-text-muted bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-text-secondary transition-all">Tümünü Kapat</button>
        </div>
      </div>

      {/* Premium Global Summary Panel */}
      <div className="p-6 bg-white/[0.025] border border-white/10 rounded-3xl flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex items-center gap-4 lg:w-1/3">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 text-accent flex items-center justify-center shrink-0 border border-accent/30">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-white font-black text-lg">{title} Dağılımı</h3>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">{tabQuestions.length} Toplam Soru</p>
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-3 lg:w-2/3 ${activeSubjects.length === 5 ? 'sm:grid-cols-5' : 'sm:grid-cols-4'}`}>
          {activeSubjects.map((subject, index) => {
            const tones = [
              'bg-success/15 border-success/20 text-success',
              'bg-danger/15 border-danger/20 text-danger',
              'bg-warning/15 border-warning/20 text-warning',
              'bg-purple-500/15 border-purple-500/20 text-purple-400',
              'bg-blue-500/15 border-blue-500/20 text-blue-400',
            ];
            return (
              <div key={subject.value} className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${tones[index % tones.length]}`}>
                <span className="mb-1 text-xl">{subject.emoji}</span>
                <span className="mb-1 text-xl font-black leading-none text-white">
                  {tabQuestions.filter(q => q.subject === subject.value).length}
                </span>
                <span className="line-clamp-2 text-[9px] font-bold uppercase tracking-wider">
                  {subject.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exam Groups */}
      {tabExams.length === 0 ? (
        <div className="py-20 text-center text-text-muted">
          <PenTool className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="mb-2">Henüz {title.toLowerCase()} oluşturulmadı.</p>
          <button onClick={() => setExamModal({ open: true, exam: null })} className="text-warning text-sm font-bold hover:text-white transition-colors">
            + İlk sınavı oluştur
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tabExams.map(exam => {
            const examQs = getQuestionsForExam(exam._id);
            const eqCount = examQs.length;
            const examCategoryGroup = getExamCategoryGroup(exam, categories) || activeCatFilter;
            const examSubjects = examCategoryGroup === 'is_makinesi'
              ? IS_MAKINESI_SUBJECTS
              : B_CLASS_SUBJECTS;
            const isOpen = openExams[exam._id] === true;
            const catName = examCategoryGroup === 'is_makinesi' ? 'İş Makinesi' : 'B Sınıfı';

            return (
              <div key={exam._id} className={`
                group border transition-all duration-300 rounded-3xl overflow-hidden
                ${isOpen
                  ? 'bg-white/[0.035] border-warning/30 shadow-lg'
                  : exam.isPublished === false
                    ? 'bg-white/[0.015] border-dashed border-white/20 hover:border-amber-500/40 hover:bg-white/[0.025]'
                    : 'bg-white/[0.015] border-white/10 hover:border-warning/30 hover:bg-white/[0.025]'}
              `}>
                <button
                  className="w-full flex items-center gap-5 p-6 text-left"
                  onClick={() => toggleExam(exam._id)}
                >
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0
                    ${isOpen ? 'bg-warning/20 text-warning border-warning/30' : 'bg-white/5 text-warning/50 border-white/5'}
                  `}>
                    <PenTool className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className={`text-base font-bold tracking-tight transition-colors ${isOpen ? 'text-white' : 'text-text-secondary'} truncate`}>
                        {exam.name}
                      </h3>
                      {exam.isPublished === false && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[9px] font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap">
                          <FileX className="w-2.5 h-2.5" /> Taslak
                        </div>
                      )}
                      <div className="px-2 py-0.5 rounded-md bg-warning/10 border border-warning/20 text-[9px] font-bold text-warning uppercase tracking-wider whitespace-nowrap">
                        {catName || 'Genel'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-muted font-medium">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 opacity-55" />
                        {eqCount} Soru
                      </span>
                      <span className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                        <Clock className="w-3.5 h-3.5 opacity-55" />
                        {exam.duration} Dakika
                      </span>
                      {eqCount > 0 && !isOpen && (
                        <div className="hidden items-center gap-1 border-l border-white/10 pl-4 xl:flex">
                          {examSubjects.map(subject => (
                            <span key={subject.value} className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-text-secondary">
                              {subject.emoji} {examQs.filter(q => q.subject === subject.value).length}
                            </span>
                          ))}
                        </div>
                      )}
                      {exam.isPro && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded text-[9px] font-bold uppercase tracking-wider">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-100 transition-all duration-300 lg:opacity-0 lg:group-hover:opacity-100">
                    {!exam.isPublished && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePublishExam(exam); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-success/20 border border-success/30 text-success text-xs font-bold rounded-xl hover:bg-success hover:text-white transition-all"
                        title="Yayınla — tüm kullanıcılara bildirim gönderilir"
                      >
                        <Send className="w-3.5 h-3.5" /> Yayınla
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setFormModal({ open: true, question: null, isCopy: false, examId: exam._id }); }}
                      className="p-2.5 bg-warning/20 border border-warning/30 text-warning rounded-xl hover:bg-warning hover:text-white transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setExamModal({ open: true, exam }); }}
                      className="p-2.5 bg-white/5 border border-white/10 text-text-secondary rounded-xl hover:bg-white/10 hover:text-white transition-all"
                    >
                      <FileEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam); }}
                      className="p-2.5 bg-error/10 border border-error/20 text-error rounded-xl hover:bg-error hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className={`
                    ml-4 p-1.5 rounded-full transition-colors duration-300
                    ${isOpen ? 'bg-warning/20 text-warning' : 'text-text-muted hover:bg-white/5'}
                  `}>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "circOut" }}
                      className="overflow-hidden border-t border-white/10 bg-black/15"
                    >
                      <div className="p-6 space-y-4">
                        {eqCount > 0 && (
                          <div className="flex flex-wrap gap-2 p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
                             <span className="text-[10px] font-bold uppercase text-white/30 mr-2 flex items-center">Dağılım:</span>
                             {examSubjects.map(subject => (
                               <SubjectBadge
                                 key={subject.value}
                                 label={`${subject.emoji} ${subject.label}`}
                                 count={examQs.filter(q => q.subject === subject.value).length}
                                 color="bg-white/5 text-text-secondary border-white/10"
                               />
                             ))}
                          </div>
                        )}
                        {eqCount === 0 ? (
                          <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                            <HelpCircle className="w-10 h-10 mx-auto mb-3 text-white/20" />
                            <p className="text-text-muted text-sm font-medium">Bu sınavda henüz soru bulunmuyor.</p>
                            <button
                              onClick={() => setFormModal({ open: true, question: null, isCopy: false, examId: exam._id })}
                              className="mt-3 px-4 py-2 bg-warning/20 border border-warning/30 text-warning text-xs font-bold rounded-xl hover:bg-warning hover:text-white transition-all"
                            >
                              + Hemen Soru Ekle
                            </button>
                          </div>
                        ) : (
                          getQuestionsForExam(exam._id).map((q, idx) => (
                            <QuestionCard key={q._id} q={q} idx={idx} isShortTest={false}
                              onEdit={(q) => setFormModal({ open: true, question: q, isCopy: false, examId: null })}
                              onDelete={handleDeleteQuestion}
                              onCopy={(q) => setFormModal({ open: true, question: q, isCopy: true, examId: null })}
                            />
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Unassigned questions */}
          {unassigned.length > 0 && (
            <div className="bg-white/[0.015] border border-white/10 rounded-3xl overflow-hidden mt-6">
              <div className="p-5 flex items-center gap-3 border-b border-white/5 bg-white/[0.01]">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-warning/70" />
                </div>
                <div>
                  <p className="font-bold text-white/80 text-sm">Sınav Atanmamış Sorular</p>
                  <p className="text-xs text-text-muted">{unassigned.length} Soru</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {unassigned.map((q, idx) => (
                  <QuestionCard key={q._id} q={q} idx={idx} isShortTest={false}
                    onEdit={(q) => setFormModal({ open: true, question: q, isCopy: false, examId: null })}
                    onDelete={handleDeleteQuestion}
                    onCopy={(q) => setFormModal({ open: true, question: q, isCopy: true, examId: null })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {formModal.open && (
          <QuestionFormModal
            isOpen={formModal.open}
            onClose={() => setFormModal({ open: false })}
            onSaved={onRefresh}
            testType={testType}
            categories={categories}
            exams={typedExams}
            initialExamId={formModal.examId}
            existingQuestion={formModal.question}
            isCopy={formModal.isCopy}
            initialExamCategory={
              activeCatFilter === 'is_makinesi' ? 'is_makinesi' : 'b_class'
            }
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {examModal.open && (
          <ExamFormModal
            isOpen={examModal.open}
            onClose={() => setExamModal({ open: false })}
            onSaved={onRefresh}
            categories={categories}
            existingExam={examModal.exam}
            testType={testType}
            lockTestType
            initialCategoryGroup={activeCatFilter === 'is_makinesi' ? 'is_makinesi' : 'b_class'}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {csvModal && (
          <CsvImportModal
            isOpen={csvModal}
            onClose={() => setCsvModal(false)}
            onImported={onRefresh}
            exams={tabExams}
            testType={testType}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ExamOverviewCard = ({ icon: Icon, label, value, detail, color, bg, border }) => (
  <div className="group flex min-h-[104px] items-center justify-between gap-3 rounded-2xl border border-[#243044] bg-[#101725] p-4 transition-all hover:border-[#35445e] hover:bg-[#151E2E]">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#8F9BB0]">{label}</p>
      <h3 className="mt-2 text-2xl font-black leading-none tracking-tight text-white">{value}</h3>
      {detail && <p className="mt-1.5 text-[10px] font-medium text-white/40">{detail}</p>}
    </div>
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${border} ${bg} ${color} transition-transform group-hover:scale-105`}>
      <Icon className="h-[18px] w-[18px]" />
    </div>
  </div>
);

// ─── Main AdminExams Component ────────────────────────────────────────────────
const AdminExams = () => {
  const [activeCatFilter, setActiveCatFilter] = useState('b_class');
  const [activeTypeFilter, setActiveTypeFilter] = useState('real_exam'); // 'real_exam' | 'mock_exam' | 'short_test'
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [qRes, cRes, eRes] = await Promise.all([
        api.get('/questions'),
        api.get('/categories/all'),
        api.get('/exams?admin=true'), // Admin: taslaklar dahil tüm sınavlar
      ]);
      setQuestions(Array.isArray(qRes.data) ? qRes.data : (qRes.data.data || []));
      setCategories(cRes.data.data || []);
      setExams(Array.isArray(eRes.data) ? eRes.data : (eRes.data.data || eRes.data || []));
    } catch (err) {
      console.error('Veri çekme hatası:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData, refreshKey]);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  // Sınav Merkezi yalnızca gerçek sınavların iki resmi kökünü gösterir.
  const rootCategories = categories.filter(c => !c.parent?._id && !c.parent && !isVideoCategory(c));
  const examCategoryRoots = rootCategories.filter(category => Boolean(getCategoryGroupFromText(category.name)));

  // Tür bazlı sınav/soru filtreleme
  const allTypedExams = exams
    .filter(exam => !exam.isMiniTest)
    .map(exam => ({ ...exam, _resolvedTestType: resolveExamTestType(exam, questions) }));
  const typeExams = allTypedExams.filter(
    exam => exam._resolvedTestType === activeTypeFilter,
  );
  const filteredExams = typeExams.filter(
    exam => getExamCategoryGroup(exam, categories) === activeCatFilter,
  );
  const filteredExamIds = new Set(filteredExams.map(exam => exam._id?.toString()));
  const filteredQuestions = questions.filter(question => {
    if (normalizeTestType(question.testType) !== activeTypeFilter) return false;
    const examId = questionExamId(question)?.toString();
    if (examId) return filteredExamIds.has(examId);
    return getCategoryGroup(question.category, categories) === activeCatFilter;
  });

  const realCount = filteredQuestions.length;
  const activeExamCount = filteredExams.filter(e => e.isActive !== false).length;
  const publishedExamCount = filteredExams.filter(e => e.isPublished !== false).length;
  const imageQuestionCount = filteredQuestions.filter(q => q.media).length;

  // Sekme başlığı ve açıklamaları
  const typeMeta = {
    real_exam: {
      kicker: 'Gerçek Sınav Yönetimi',
      title: 'Sınav Merkezi',
      desc: 'B Sınıfı ve İş Makinesi gerçek sınavlarını, soru dağılımlarını ve yayın durumlarını yönetin.',
      label: 'Gerçek Sınav',
    },
    mock_exam: {
      kicker: 'Deneme Sınavı Yönetimi',
      title: 'Deneme Sınavları',
      desc: 'B Sınıfı ve İş Makinesi deneme sınavlarını, soru dağılımlarını ve yayın durumlarını yönetin.',
      label: 'Deneme Sınavı',
    },
    short_test: {
      kicker: 'Kısa Test Yönetimi',
      title: 'Kısa Testler',
      desc: 'Konu bazlı kısa testleri ve soru dağılımlarını yönetin.',
      label: 'Kısa Test',
    },
  }[activeTypeFilter];

  const isShort = activeTypeFilter === 'short_test';

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <section className="rounded-[26px] border border-[#243044] bg-[#101725] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFB85C]">{typeMeta.kicker}</p>
            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-white">{typeMeta.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-[#8F9BB0]">{typeMeta.desc}</p>
          </div>
          <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-text-secondary hover:text-white hover:bg-white/10 transition-all self-start sm:self-auto">
            <RefreshCw className="w-4 h-4" /> Yenile
          </button>
        </div>

        {/* Sınav Türü Seçimi */}
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-[#243044] bg-[#0B1220] p-1.5 sm:max-w-lg">
          {[
            { id: 'real_exam', label: 'Gerçek Sınav', icon: Shield, color: 'text-[#AFA5FF]' },
            { id: 'mock_exam', label: 'Deneme Sınavı', icon: Zap, color: 'text-[#FFB85C]' },
            { id: 'short_test', label: 'Kısa Test', icon: BookOpen, color: 'text-[#6EE7B7]' },
          ].map(item => {
            const Icon = item.icon;
            const active = activeTypeFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTypeFilter(item.id)}
                className={`flex min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black transition-all ${
                  active
                    ? 'border-[#7C6CFF]/35 bg-[#7C6CFF]/15 text-white'
                    : 'border-transparent text-[#8F9BB0] hover:bg-[#151E2E] hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? item.color : ''}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Kategori Filtresi (Kısa Test hariç) */}
        {!isShort && (
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-[#243044] bg-[#0B1220] p-1.5 sm:max-w-lg">
          {[
            { id: 'b_class', label: 'B Sınıfı', icon: Shield, color: 'text-[#AFA5FF]' },
            { id: 'is_makinesi', label: 'İş Makinesi', icon: HardHat, color: 'text-[#FFB85C]' },
          ].map(item => {
            const Icon = item.icon;
            const active = activeCatFilter === item.id;
            const categoryExists = examCategoryRoots.some(
              category => getCategoryGroupFromText(category.name) === item.id,
            );
            const count = typeExams.filter(
              exam => getExamCategoryGroup(exam, categories) === item.id,
            ).length;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveCatFilter(item.id)}
                className={`flex min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-black transition-all ${
                  active
                    ? 'border-[#7C6CFF]/35 bg-[#7C6CFF]/15 text-white'
                    : 'border-transparent text-[#8F9BB0] hover:bg-[#151E2E] hover:text-white'
                }`}
                title={categoryExists ? undefined : 'Bu kategori henüz oluşturulmamış'}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? item.color : ''}`} />
                <span className="truncate">{item.label}</span>
                <span className="rounded-lg bg-white/[0.06] px-1.5 py-0.5 text-[10px]">{count}</span>
              </button>
            );
          })}
          </div>
        )}
      </section>

      {!isShort && (
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <ExamOverviewCard icon={Shield} label={typeMeta.label} value={filteredExams.length} detail={`${activeExamCount} aktif`} color="text-warning" bg="bg-warning/10" border="border-warning/20" />
        <ExamOverviewCard icon={HelpCircle} label="Toplam Soru" value={realCount} color="text-primary-light" bg="bg-primary/10" border="border-primary/20" />
        <ExamOverviewCard icon={Send} label="Yayında" value={publishedExamCount} color="text-accent" bg="bg-accent/10" border="border-accent/20" />
        <ExamOverviewCard icon={ImageIcon} label="Görselli Soru" value={imageQuestionCount} color="text-success" bg="bg-success/10" border="border-success/20" />
      </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest">Yükleniyor...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTypeFilter + activeCatFilter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {isShort ? (
              <ShortTestTab
                questions={questions}
                categories={categories}
                exams={exams}
                onRefresh={handleRefresh}
              />
            ) : (
              <ExamQuestionsTab
                questions={filteredQuestions}
                categories={categories}
                exams={filteredExams}
                onRefresh={handleRefresh}
                testType={activeTypeFilter}
                title={activeTypeFilter === 'mock_exam' ? 'Deneme Sınavı' : 'Gerçek Sınav'}
                activeCatFilter={activeCatFilter}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

const SubjectBadge = ({ label, count, color }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold tracking-tight ${color}`}>
    <span>{label}</span>
    <div className="px-1.5 py-0.5 bg-white/10 rounded-md min-w-[1.2rem] text-center text-[10px]">{count}</div>
  </div>
);

export default AdminExams;
