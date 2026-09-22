import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../../api';
import { TEST_TYPES } from '../../../constants/testTypes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Search, CheckCircle2, X, Save, AlertCircle, Folder,
  PenTool, UploadCloud, Star, BookOpen, HelpCircle, Hash,
  Link, Image as ImageIcon, Plus, Zap, RefreshCw, FileText,
} from 'lucide-react';
import { resolveMediaUrl } from '../../../utils/mediaUrl';
import { trafficSignsData } from '../../../data/trafficSignsData';
import { isgSignsData } from '../../../data/isgSignsData';
import { isVideoCategory } from '../../../utils/categoryContent';
import { validateQuestionForm } from '../../../utils/formValidation';
import { getErrorMessage, executeAPICall } from '../../../utils/apiErrorHandler';
import { uploadImage } from '../../../utils/imageUpload';
import { InputField } from './ExamUiBits';
import {
  DIFFICULTY_CONFIG,
  EXAM_TYPES,
  SIGN_CATEGORIES,
  B_CLASS_SUBJECTS,
  IS_MAKINESI_SUBJECTS,
  saveDraft,
  loadDraft,
  clearDraft,
  normalizeTestType,
  getExamCategoryGroup,
  getCategoryGroup,
  fetchSignsInCategory,
} from './examConstants';

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
  const isShortTest = testType === TEST_TYPES.SHORT_TEST;
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
          testType: isShortTest ? (existingQuestion.testType || testType) : testType,
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
  }, [isOpen, existingQuestion, initialCategoryId, initialExamId, testType, isCopy, isShortTest]);

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

  // Seçili ehliyet kategorisine göre sınavları filtrele
  // (getExamCategoryGroup ana bileşenle aynı mantığı kullanır — tutarlılık sağlar)
  const examsForCategory = exams.filter(exam => {
    const group = getExamCategoryGroup(exam, categories);
    if (examCategory === 'is_makinesi') {
      return group === 'is_makinesi';
    }
    // B Sınıfı: İş Makinesi olmayanlar + kategorisi tespit edilemeyen (genel) sınavlar
    return group !== 'is_makinesi';
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
  const catOptions = buildCategoryOptions(true)
    .filter(cat => getCategoryGroup(cat, categories) === examCategory);

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
                  onClick={() => { setExamCategory(cat.id); setField('subject', ''); setField('exam', ''); }}
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
            <InputField label="Sınav Bağlantısı" icon={PenTool} required error={errors.exam}>
              <select
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/40 transition-all"
                value={form.exam}
                onChange={e => {
                  const examId = e.target.value;
                  const nextExam = exams.find(exam => exam._id === examId);
                  const nextGroup = nextExam ? getExamCategoryGroup(nextExam, categories) : examCategory;
                  if (nextGroup) setExamCategory(nextGroup);
                  setForm(current => ({
                    ...current,
                    exam: examId,
                    subject: nextGroup && nextGroup !== examCategory ? '' : current.subject,
                    testType,
                  }));
                }}
              >
                <option value="" className="bg-bg-card text-white/40">Sınav seçin...</option>
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
                <p className={`text-[11px] mt-2 flex items-center gap-1 ${errors.subject ? 'text-danger' : 'text-text-muted'}`}>
                  <AlertCircle className={`w-3 h-3 ${errors.subject ? 'text-danger' : 'text-warning/60'}`} /> {errors.subject || 'Bir konu seçin (dağılım ve istatistiklerde kullanılır)'}
                </p>
              )}
            </div>
          )}

          {/* Tür aktif sekmeden gelir; soru yanlışlıkla diğer sınav grubuna taşınamaz. */}
          {!isShortTest && (
            <InputField label="Sınav Grubu" icon={RefreshCw}>
              <div className={`rounded-2xl border px-4 py-3 text-xs font-black ${testType === TEST_TYPES.REAL_EXAM ? 'border-purple-500/30 bg-purple-500/15 text-purple-300' : 'border-primary/30 bg-primary/15 text-primary-light'}`}>
                {testType === TEST_TYPES.REAL_EXAM ? '🛡️ Gerçek Sınav' : '📊 Deneme Sınavı'}
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

export { QuestionFormModal, SignPickerModal };
