import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Search, Plus, FileEdit, Trash2, CheckCircle2, XCircle,
  Image as ImageIcon, X, Save, AlertCircle, FolderOpen, ChevronRight,
  ChevronDown, ArrowLeft, PenTool, Clock, HelpCircle, FileText,
  Copy, Zap, UploadCloud, Star, Shield, BookOpen, BarChart2,
  Folder, AlertTriangle, RefreshCw, Eye, EyeOff, Hash, Link,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const DIFFICULTY_CONFIG = {
  easy: { label: 'Kolay', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', dot: 'bg-success' },
  medium: { label: 'Orta', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', dot: 'bg-warning' },
  hard: { label: 'Zor', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30', dot: 'bg-danger' },
};

const CSV_EXAMPLE = `text,option1,option2,option3,option4,correctAnswer,difficulty,explanation
Emniyet şeridi nedir?,Sol şerit,Sağ şerit,Orta şerit,Acil durum şeridi,3,easy,Sağ kenardaki şerit acil durumlara ayrılmıştır.
Hız limiti şehir içinde nedir?,30 km/h,50 km/h,70 km/h,90 km/h,1,medium,`;

// ─── Media / Sign Helpers ─────────────────────────────────────────────────────
// Backend, Flutter asset yolunu /signs/ prefix'iyle sunuyor
// DB'de: "assets/images/signs/Tanzim_TT/tt-1.png"
// Web'de: "http://localhost:3000/signs/Tanzim_TT/tt-1.png"
const API_BASE = 'http://localhost:3000';

const resolveMediaUrl = (media) => {
  if (!media) return null;
  if (media.startsWith('http')) return media;          // zaten tam URL
  if (media.startsWith('/uploads/')) return `${API_BASE}${media}`; // yüklenen dosya
  if (media.startsWith('assets/images/signs/')) {      // Flutter sign asset
    const signPath = media.replace('assets/images/signs/', '');
    return `${API_BASE}/signs/${signPath}`;
  }
  if (media.startsWith('assets/images/')) {            // diğer Flutter asset'leri
    const assetPath = media.replace('assets/images/', '');
    return `${API_BASE}/images/${assetPath}`;
  }
  if (media.startsWith('assets/content/')) {           // döküman içerikleri
    const contentPath = media.replace('assets/content/', '');
    return `${API_BASE}/content/${contentPath}`;
  }
  return `${API_BASE}/${media}`;
};

// 4 Levha Kategorisi + İçindeki dosyalar (backend'deki klasör yapısıyla aynı)
const SIGN_CATEGORIES = [
  { key: 'Tehlike_T',  label: 'Tehlike Levhaları',  emoji: '🔺', color: 'text-danger',   bg: 'bg-danger/10',   border: 'border-danger/30'   },
  { key: 'Tanzim_TT', label: 'Tanzim Levhaları',    emoji: '🔵', color: 'text-primary-light', bg: 'bg-primary/10', border: 'border-primary/30' },
  { key: 'Bilgi_B',   label: 'Bilgi Levhaları',     emoji: '🟦', color: 'text-accent',    bg: 'bg-accent/10',   border: 'border-accent/30'   },
  { key: 'Park_P',    label: 'Park Levhaları',       emoji: '🅿️', color: 'text-success',   bg: 'bg-success/10',  border: 'border-success/30'  },
];

// Her kategorideki levha isimleri  (fetch ile backend'den alacağız)
const fetchSignsInCategory = async (category) => {
  try {
    // Backend'e özel bir endpoint açmak yerine,
    // burada bilinen levha listesini hardcode edebilir veya
    // bir signs-list endpoint'i ekleyebiliriz.
    // Şimdilik /api/signs-list endpoint'ini çağırıyoruz:
    const res = await fetch(`${API_BASE}/signs-list/${category}`);
    if (res.ok) return await res.json();
  } catch {}
  return [];
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
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        {/* Görsel küçük thumbnail — varsa */}
        {q.media ? (
          <div className="w-14 h-14 rounded-xl bg-black/30 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
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
          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
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
          <button onClick={() => setExpanded(e => !e)} className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all" title="Şıkları Göster">
            {expanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => onCopy(q)} className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all" title="Kopyala">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(q)} className={`p-2 rounded-lg hover:bg-primary/20 text-text-muted transition-all ${isShortTest ? 'hover:text-accent' : 'hover:text-primary-light'}`} title="Düzenle">
            <FileEdit className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(q._id)} className="p-2 rounded-lg hover:bg-danger/20 text-text-muted hover:text-danger transition-all" title="Sil">
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

// ─── Question Form Modal ───────────────────────────────────────────────────────
const QuestionFormModal = ({ isOpen, onClose, onSaved, testType, categories, exams, initialCategoryId, initialExamId, existingQuestion, isCopy }) => {
  const isEdit = existingQuestion && !isCopy;
  const isShortTest = testType === 'short_test';
  const fileInputRef = useRef(null);

  const emptyForm = {
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: initialCategoryId || '',
    exam: initialExamId || '',
    difficulty: 'medium',
    explanation: '',
    testType,
    coefficient: '1.0',
    media: '',
    subject: '',
  };

  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState(null); // görüntülenecek URL
  const [imageFile, setImageFile] = useState(null);       // dosya yükleme için
  const [signPickerOpen, setSignPickerOpen] = useState(false);
  const [imageTab, setImageTab] = useState('sign'); // 'sign' | 'upload'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
          // Flutter asset yolu ise tam URL'ye çevir, yoksa direkt kullan
          setImagePreview(resolveMediaUrl(existingQuestion.media));
          if (existingQuestion.media.startsWith('http')) {
            setImageTab('url');
          } else if (existingQuestion.media.includes('/signs/')) {
            setImageTab('sign');
          } else {
            setImageTab('upload');
          }
        }
      } else {
        setForm({ ...emptyForm, category: initialCategoryId || '', exam: initialExamId || '', testType });
        setImagePreview(null);
      }
      setImageFile(null);
      setErrors({});
    }
  }, [isOpen, existingQuestion, initialCategoryId, initialExamId, testType]);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

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
    const e = {};
    if (!form.text.trim()) e.text = 'Soru metni zorunludur.';
    if (isShortTest && !form.category) e.category = 'Kategori seçimi zorunludur.';
    const filled = form.options.filter(o => o.trim());
    if (filled.length < 2) e.options = 'En az 2 şık dolu olmalıdır.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let mediaUrl = form.media;

      // Upload image if selected
      if (imageFile && imageTab === 'upload') {
        const fd = new FormData();
        fd.append('image', imageFile);
        const uploadRes = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        mediaUrl = uploadRes.data.url || uploadRes.data.path || '';
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

      if (isEdit) {
        await api.put(`/questions/${existingQuestion._id}`, payload);
      } else {
        await api.post('/questions', payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.response?.data?.message || 'Bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  // Build category tree for dropdown
  const buildCategoryOptions = () => {
    const roots = categories.filter(c => !c.parent?._id && !c.parent);
    const result = [];
    const addLevel = (cats, level) => {
      cats.forEach(cat => {
        const children = categories.filter(c => (c.parent?._id || c.parent) === cat._id);
        const isLeaf = children.length === 0;
        result.push({ ...cat, _level: level, _isLeaf: isLeaf });
        if (children.length > 0) addLevel(children, level + 1);
      });
    };
    addLevel(roots, 0);
    return result;
  };

  const catOptions = buildCategoryOptions();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl p-0 sm:p-4">
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.97 }}
        className="w-full sm:max-w-2xl bg-bg-card border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isShortTest ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary-light'}`}>
              {isShortTest ? <BookOpen className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {isEdit ? 'Soruyu Düzenle' : isCopy ? 'Soruyu Kopyala' : isShortTest ? 'Kısa Test Sorusu Ekle' : 'Sınav Sorusu Ekle'}
              </h2>
              <p className="text-xs text-text-muted">
                {isShortTest ? 'Seçilen kategoriye kısa test sorusu' : 'Deneme sınavı sorusu'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Category / Exam Selection */}
          {isShortTest ? (
            <InputField label="Kategori / Konu" icon={Folder} required error={errors.category}>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/50 transition-all"
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
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/50 transition-all"
                value={form.exam}
                onChange={e => setField('exam', e.target.value)}
              >
                <option value="" className="bg-bg-card text-white/40">Sınav ata (opsiyonel)</option>
                {exams.map(exam => (
                  <option key={exam._id} value={exam._id} className="bg-bg-card text-white">
                    📋 {exam.name} ({exam.duration} dk)
                  </option>
                ))}
              </select>
            </InputField>
          )}

          {/* Konu Seçimi (Sadece sınav soruları için: Trafik, Motor, İlkyardim) */}
          {!isShortTest && (
            <InputField label="Soru Konusu / Branş (Zorunlu)" icon={Zap}>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/50 transition-all font-bold"
                value={form.subject}
                onChange={e => setField('subject', e.target.value)}
              >
                <option value="" className="bg-bg-card text-white/40">Konu seçin...</option>
                <option value="trafik" className="bg-bg-card text-white font-bold">🚦 Trafik ve Çevre Bilgisi</option>
                <option value="ilkyardim" className="bg-bg-card text-white font-bold">🚑 İlk Yardım Bilgisi</option>
                <option value="motor" className="bg-bg-card text-white font-bold">🔧 Motor ve Araç Tekniği</option>
                <option value="adabi" className="bg-bg-card text-white font-bold">🤝 Trafik Adabı</option>
              </select>
            </InputField>
          )}

          {/* Sınav Türü Seçimi (Sadece sınavlar için) */}
          {!isShortTest && (
            <InputField label="Sınav Grubu (Deneme / Gerçek)" icon={RefreshCw}>
              <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                {[
                  { id: 'mock_exam', label: '📊 Deneme Sınavı', color: 'bg-primary' },
                  { id: 'real_exam', label: '🛡️ Gerçek Sınav', color: 'bg-purple-600' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setField('testType', t.id)}
                    className={`flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all ${form.testType === t.id
                      ? `${t.color} text-white shadow-lg`
                      : 'text-text-muted hover:text-white'}`}
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/50 transition-all resize-none placeholder:text-white/20"
              placeholder="Soru metnini buraya yazın..."
              value={form.text}
              onChange={e => setField('text', e.target.value)}
            />
          </InputField>

          {/* Görsel Ekle — İki mod: Levha Seç / Dosya Yükle */}
          <InputField label="Soru Görseli (Opsiyonel)" icon={ImageIcon}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            
            {/* Mod seçici */}
            <div className="flex p-0.5 bg-white/5 border border-white/10 rounded-xl mb-3">
              <button type="button" onClick={() => setImageTab('sign')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  imageTab === 'sign' ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:text-white'}`}>
                🚦 Levha seç
              </button>
              <button type="button" onClick={() => setImageTab('upload')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  imageTab === 'upload' ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:text-white'}`}>
                <UploadCloud className="w-3.5 h-3.5" /> Dosya yükle
              </button>
              <button type="button" onClick={() => setImageTab('url')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  imageTab === 'url' ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:text-white'}`}>
                <Link className="w-3.5 h-3.5" /> Bağlantı (URL)
              </button>
            </div>

            {/* Seçili görsel önizleme */}
            {imagePreview && (
              <div className="relative mb-3">
                <div className="w-full h-40 bg-black/30 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center">
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
                className="w-full py-3 border border-dashed border-primary/30 rounded-2xl text-primary-light text-xs font-bold hover:bg-primary/10 transition-all flex items-center justify-center gap-2">
                🚦 {imagePreview ? 'Başka Levha Seç' : 'Trafik Levhası Seç (269 levha)'}
              </button>
            )}

            {/* Dosya Yükle modu */}
            {imageTab === 'upload' && !imagePreview && (
              <button type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-white/30 hover:border-primary/40 hover:text-primary-light transition-all">
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
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
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
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Zorluk Seviyesi" icon={Zap}>
              <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                {['easy', 'medium', 'hard'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setField('difficulty', d)}
                    className={`flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all ${form.difficulty === d
                      ? d === 'hard' ? 'bg-danger text-white' : d === 'medium' ? 'bg-warning text-white' : 'bg-success text-white'
                      : 'text-text-muted hover:text-white'}`}
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
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/50 transition-all"
                value={form.coefficient}
                onChange={e => setField('coefficient', e.target.value)}
              />
            </InputField>
          </div>

          {/* Explanation */}
          <InputField label="Açıklama (Opsiyonel - doğru cevabın nedeni)" icon={HelpCircle}>
            <textarea
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-medium outline-none focus:border-primary/50 transition-all resize-none placeholder:text-white/20"
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
                  <div key={i} className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${isCorrect ? 'border-success/50 bg-success/5' : 'border-white/5 bg-white/[0.02]'}`}>
                    <button
                      type="button"
                      onClick={() => setField('correctAnswer', i)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm transition-all ${isCorrect ? 'bg-success text-white shadow-lg shadow-success/30' : 'bg-white/10 text-white/30 hover:bg-white/20'}`}
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
        <div className="p-5 border-t border-white/5 flex items-center justify-between gap-4 shrink-0">
          <button type="button" onClick={onClose} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm text-white shadow-2xl transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 ${isShortTest ? 'bg-accent hover:bg-accent/80 shadow-accent/30' : 'bg-primary hover:bg-primary-light shadow-primary/30'}`}
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
const SignPickerModal = ({ onClose, onSelect }) => {
  const [activeCat, setActiveCat] = useState(SIGN_CATEGORIES[0].key);
  const [signs, setSigns] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingSigns, setLoadingSigns] = useState(false);

  useEffect(() => {
    setLoadingSigns(true);
    setSigns([]);
    fetchSignsInCategory(activeCat).then(files => {
      setSigns(files);
      setLoadingSigns(false);
    });
  }, [activeCat]);

  const filtered = search
    ? signs.filter(f => f.toLowerCase().includes(search.toLowerCase()))
    : signs;

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
          <div className="w-10 h-10 rounded-2xl bg-warning/20 text-warning flex items-center justify-center text-xl">🚦</div>
          <div>
            <h2 className="font-black text-white">Trafik Levhası Seç</h2>
            <p className="text-xs text-text-muted">269 levha · 4 kategori</p>
          </div>
          <button onClick={onClose} className="ml-auto p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 p-3 border-b border-white/5 shrink-0 overflow-x-auto">
          {SIGN_CATEGORIES.map(cat => (
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
          ))}
        </div>

        {/* Search */}
        <div className="px-4 py-3 shrink-0">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 gap-3">
            <Search className="w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Levha adı ara... (örn: tt-1, t-22)"
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-text-muted" /></button>}
          </div>
        </div>

        {/* Signs grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loadingSigns ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-text-muted text-sm">Sonuç bulunamadı</div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
              {filtered.map(filename => {
                const previewUrl = `${API_BASE}/signs/${activeCat}/${filename}`;
                const assetPath = `assets/images/signs/${activeCat}/${filename}`;
                const name = filename.replace('.png', '');
                return (
                  <button
                    key={filename}
                    onClick={() => onSelect(assetPath, previewUrl)}
                    className="group flex flex-col items-center gap-1.5 p-2 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/10 transition-all"
                    title={name}
                  >
                    <div className="w-full aspect-square bg-transparent flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt={name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={e => { e.target.style.opacity = '0.2'; }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-text-muted group-hover:text-primary-light transition-colors truncate w-full text-center">
                      {name}
                    </span>
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
const ExamFormModal = ({ isOpen, onClose, onSaved, categories, existingExam }) => {
  const isEdit = !!existingExam;
  const rootCats = categories.filter(c => !c.parent?._id && !c.parent);

  const [form, setForm] = useState({ name: '', description: '', duration: '45', categoryId: '', isPro: false });
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
        });
      } else {
        setForm({ name: '', description: '', duration: '45', categoryId: rootCats[0]?._id || '', isPro: false });
      }
      setError('');
    }
  }, [isOpen, existingExam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Sınav adı zorunludur.'); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        duration: parseInt(form.duration) || 45,
        categoryId: form.categoryId || null,
        isPro: form.isPro,
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-warning/20 text-warning flex items-center justify-center">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-white">{isEdit ? 'Sınavı Düzenle' : 'Yeni Sınav Oluştur'}</h2>
            <p className="text-xs text-text-muted">Sınav bilgilerini girin</p>
          </div>
          <button onClick={onClose} className="ml-auto p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-text-secondary mb-2 block">Sınav Adı *</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-warning/50 transition-all"
              placeholder="Örn: 2024 Deneme Sınavı 1"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary mb-2 block">Açıklama (Opsiyonel)</label>
            <textarea
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-warning/50 transition-all resize-none placeholder:text-white/20"
              placeholder="Sınav hakkında kısa bir açıklama..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-secondary mb-2 block flex items-center gap-1"><Clock className="w-3 h-3" /> Süre (Dakika)</label>
              <input
                type="number" min="1"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-warning/50 transition-all"
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary mb-2 block">Kategori</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-warning/50 transition-all"
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="" className="bg-bg-card">Seçiniz</option>
                {rootCats.map(c => <option key={c._id} value={c._id} className="bg-bg-card">{c.name}</option>)}
              </select>
            </div>
          </div>

          <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${form.isPro ? 'border-warning/40 bg-warning/5' : 'border-white/5 bg-white/[0.02]'}`}>
            <input type="checkbox" checked={form.isPro} onChange={e => setForm(f => ({ ...f, isPro: e.target.checked }))} className="hidden" />
            <div className={`w-10 h-6 rounded-full transition-all relative ${form.isPro ? 'bg-warning' : 'bg-white/10'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${form.isPro ? 'left-5' : 'left-1'}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-2"><Shield className="w-4 h-4 text-warning" /> PRO Üyelik Gerekli</p>
              <p className="text-xs text-text-muted">Sadece PRO kullanıcılar görebilir</p>
            </div>
          </label>

          {error && (
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">İptal</button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-warning text-white font-black text-sm rounded-2xl shadow-xl shadow-warning/30 hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── CSV Import Modal ──────────────────────────────────────────────────────────
const CsvImportModal = ({ isOpen, onClose, onImported, exams }) => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [csv, setCsv] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => { if (isOpen) { setCsv(''); setResult(null); setError(''); setSelectedExamId(''); } }, [isOpen]);

  const handleImport = async () => {
    if (!csv.trim()) { setError('CSV içeriği boş olamaz.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post('/questions/bulk-csv', {
        csvText: csv,
        examId: selectedExamId || null,
        testType: 'mock_exam', // Default to mock_exam for CSV import
        subject: selectedSubject,
      });
      setResult(res.data);
      onImported();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'İçe aktarma hatası.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl bg-bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/5 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary-light flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-white">CSV ile Toplu Soru Ekle</h2>
            <p className="text-xs text-text-muted">Sınav soruları için CSV formatı</p>
          </div>
          <button onClick={onClose} className="ml-auto p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-text-secondary mb-2 block">Sınav Seçimi (Opsiyonel)</label>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none"
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
            >
              <option value="" className="bg-bg-card">Sınav atamadan ekle</option>
              {exams.map(ex => <option key={ex._id} value={ex._id} className="bg-bg-card">{ex.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary mb-2 block">Soru Konusu / Branş (Tüm liste için geçerli)</label>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none font-bold"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="" className="bg-bg-card">Konu seçilmedi</option>
              <option value="trafik" className="bg-bg-card">🚦 Trafik ve Çevre Bilgisi</option>
              <option value="ilkyardim" className="bg-bg-card">🚑 İlk Yardım Bilgisi</option>
              <option value="motor" className="bg-bg-card">🔧 Motor ve Araç Tekniği</option>
              <option value="adabi" className="bg-bg-card">🤝 Trafik Adabı</option>
            </select>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-1">
            <p className="text-xs font-bold text-primary-light">📋 CSV Formatı:</p>
            <p className="text-[11px] text-text-muted font-mono leading-relaxed">
              text, seçenek1, seçenek2, seçenek3, seçenek4, doğruCevap, zorluk, açıklama<br />
              • doğruCevap: 0=A, 1=B, 2=C, 3=D<br />
              • zorluk: easy / medium / hard<br />
              • açıklama: opsiyonel, boş bırakılabilir<br />
              • İlk satır (başlık) atlanır
            </p>
            <button type="button" onClick={() => setCsv(CSV_EXAMPLE)} className="text-[11px] font-bold text-primary-light hover:text-white transition-colors">
              ▶ Örnek yapıştır
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary mb-2 block">CSV İçeriği</label>
            <textarea
              rows={12}
              className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white font-mono outline-none resize-none focus:border-primary/50 transition-all placeholder:text-white/20"
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
        <div className="p-5 border-t border-white/5 flex items-center justify-end gap-3 shrink-0">
          <button onClick={onClose} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">
            {result ? 'Kapat' : 'İptal'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-60"
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
  const [formModal, setFormModal] = useState({ open: false, question: null, isCopy: false, categoryId: null });
  const [openCats, setOpenCats] = useState({});
  const toggleCat = (id) => setOpenCats(s => ({ ...s, [id]: !s[id] }));

  const expandAll = () => {
    const next = {};
    categories.forEach(c => next[c._id] = true);
    setOpenCats(next);
  };
  const collapseAll = () => setOpenCats({});

  const shortQuestions = questions.filter(q => q.testType === 'short_test');
  const filtered = search
    ? shortQuestions.filter(q => q.text.toLowerCase().includes(search.toLowerCase()))
    : shortQuestions;

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
      <div key={cat._id} className={`mb-3 transition-all duration-300 ${level > 0 ? 'ml-6 border-l border-white/5 pl-4' : ''}`}>
        <div className={`
          relative overflow-hidden rounded-2xl border transition-all duration-500
          ${isOpen 
            ? 'bg-white/[0.04] border-accent/30 shadow-2xl shadow-accent/5' 
            : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}
        `}>
          {/* Category Header */}
          <button
            className="w-full flex items-center gap-4 p-4 text-left transition-all"
            onClick={() => toggleCat(cat._id)}
          >
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500
              ${isOpen ? 'bg-accent text-white rotate-6 shadow-lg shadow-accent/20' : 'bg-white/5 text-text-muted'}
            `}>
              {level === 0 ? <Folder className="w-5 h-5" /> : isLeaf ? <BookOpen className="w-4 h-4" /> : <FolderOpen className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`font-black tracking-tight transition-colors ${isOpen ? 'text-white' : 'text-text-secondary'} text-${level === 0 ? 'base' : 'sm'}`}>
                  {cat.name}
                </p>
                {!isLeaf && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] text-text-muted font-bold uppercase tracking-widest">
                    Klasör
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-text-muted">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3 h-3 opacity-50" />
                  {totalDeep} Soru
                </span>
                {!isLeaf && (
                  <span className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                    <Folder className="w-3 h-3 opacity-50" />
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
                  className="px-3 py-1.5 rounded-xl bg-accent/20 text-accent text-[10px] font-black uppercase tracking-tighter hover:bg-accent hover:text-white transition-all shadow-lg shadow-accent/5"
                >
                  <Plus className="w-3 h-3 mr-1 inline" /> Soru Ekle
                </button>
              )}
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className={`p-1 rounded-full ${isOpen ? 'bg-accent/10 text-accent' : 'text-white/20'}`}>
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </div>
          </button>

          {/* Content */}
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                className="overflow-hidden bg-black/20"
              >
                <div className="p-4 pt-0 space-y-2">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent mb-4" />
                  
                  {isLeaf ? (
                    <div className="space-y-3">
                      {catQuestions.length === 0 ? (
                        <div className="py-10 text-center rounded-2xl border-2 border-dashed border-white/5">
                          <HelpCircle className="w-10 h-10 mx-auto mb-3 text-white/10" />
                          <p className="text-sm text-text-muted italic">Bu kategoriye henüz soru eklenmedi.</p>
                          <button
                            onClick={() => setFormModal({ open: true, question: null, isCopy: false, categoryId: cat._id })}
                            className="mt-3 text-xs text-accent font-bold hover:underline"
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
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <Search className="w-4 h-4 text-text-muted mr-3" />
          <input
            type="text" placeholder="Soru ara..."
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/30"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-text-muted" /></button>}
        </div>
        <button
          onClick={() => setFormModal({ open: true, question: null, isCopy: false, categoryId: null })}
          className="flex items-center gap-2 px-5 py-3 bg-accent text-white font-black text-sm rounded-2xl shadow-xl shadow-accent/30 hover:-translate-y-0.5 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Soru Ekle
        </button>
      </div>

      {/* Summary & Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 text-sm flex-1">
          <div className="flex items-center gap-2 text-text-secondary border-r border-white/5 pr-4">
            <BookOpen className="w-4 h-4 text-accent" />
            <span><strong className="text-white">{shortQuestions.length}</strong> Soru</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <FolderOpen className="w-4 h-4 text-primary-light" />
            <span><strong className="text-white">{categories.length}</strong> Kategori</span>
          </div>
          {search && <span className="text-text-muted text-[11px] ml-auto">• Aramada {filtered.length} sonuç</span>}
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="px-3 py-2 text-[10px] font-black uppercase tracking-tighter text-accent bg-accent/5 border border-accent/20 rounded-xl hover:bg-accent/10 transition-all">Tümünü Aç</button>
          <button onClick={collapseAll} className="px-3 py-2 text-[10px] font-black uppercase tracking-tighter text-white/40 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all">Tümünü Kapat</button>
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
            existingQuestion={formModal.question}
            isCopy={formModal.isCopy}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Exam Questions Tab ────────────────────────────────────────────────────────
const ExamQuestionsTab = ({ questions, categories, exams, onRefresh, testType = 'exam', title = 'Sınav' }) => {
  const [search, setSearch] = useState('');
  const [openExams, setOpenExams] = useState({});
  const [formModal, setFormModal] = useState({ open: false, question: null, isCopy: false, examId: null });
  const [examModal, setExamModal] = useState({ open: false, exam: null });
  const [csvModal, setCsvModal] = useState(false);

  const toggleExam = (id) => setOpenExams(s => ({ ...s, [id]: !s[id] }));

  const expandAll = () => {
    const next = {};
    exams.forEach(e => next[e._id] = true);
    setOpenExams(next);
  };
  const collapseAll = () => setOpenExams({});

  const tabQuestions = questions.filter(q => q.testType === testType);
  const filtered = search ? tabQuestions.filter(q => q.text.toLowerCase().includes(search.toLowerCase())) : tabQuestions;

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

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <Search className="w-4 h-4 text-text-muted mr-3" />
          <input
            type="text" placeholder="Soru ara..."
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/30"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-text-muted" /></button>}
        </div>
        <button
          onClick={() => setCsvModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-text-secondary font-bold text-sm rounded-2xl hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
        >
          <UploadCloud className="w-4 h-4" /> CSV Aktar
        </button>
        <button
          onClick={() => setExamModal({ open: true, exam: null })}
          className="flex items-center gap-2 px-4 py-3 bg-warning/20 border border-warning/30 text-warning font-bold text-sm rounded-2xl hover:bg-warning/30 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Sınav Oluştur
        </button>
        <button
          onClick={() => setFormModal({ open: true, question: null, isCopy: false, examId: null })}
          className="flex items-center gap-2 px-4 py-3 bg-primary text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/30 hover:-translate-y-0.5 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Soru Ekle
        </button>
      </div>

      {/* Summary & Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 text-sm flex-1">
          <div className="flex items-center gap-2 text-text-secondary border-r border-white/5 pr-4">
            <PenTool className={`w-4 h-4 ${testType === 'trial_exam' ? 'text-warning' : 'text-primary'}`} />
            <span><strong className="text-white">{exams.length}</strong> Aktif {title}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <HelpCircle className="w-4 h-4 text-primary-light" />
            <span><strong className="text-white">{tabQuestions.length}</strong> Soru</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="px-3 py-2 text-[10px] font-black uppercase tracking-tighter text-warning bg-warning/5 border border-warning/20 rounded-xl hover:bg-warning/10 transition-all">Tümünü Aç</button>
          <button onClick={collapseAll} className="px-3 py-2 text-[10px] font-black uppercase tracking-tighter text-white/40 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all">Tümünü Kapat</button>
        </div>
      </div>

      {/* Premium Global Summary Panel */}
      <div className="p-6 bg-[#131626] border border-white/5 rounded-3xl flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex items-center gap-4 lg:w-1/3">
          <div className="w-14 h-14 rounded-2xl bg-accent/20 text-accent flex items-center justify-center shrink-0">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-white font-black text-lg">{title} Dağılımı</h3>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">{tabQuestions.length} Toplam Soru</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:w-2/3">
          <div className="p-3 bg-success/10 border border-success/20 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-1 drop-shadow-md">🚦</span>
            <span className="text-xl font-black text-white leading-none mb-1">{tabQuestions.filter(q => q.subject === 'trafik').length}</span>
            <span className="text-[10px] font-bold text-success uppercase tracking-widest">Trafik</span>
          </div>
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-1 drop-shadow-md">🚑</span>
            <span className="text-xl font-black text-white leading-none mb-1">{tabQuestions.filter(q => q.subject === 'ilkyardim').length}</span>
            <span className="text-[10px] font-bold text-danger uppercase tracking-widest">İlk Yrd.</span>
          </div>
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-1 drop-shadow-md">🔧</span>
            <span className="text-xl font-black text-white leading-none mb-1">{tabQuestions.filter(q => q.subject === 'motor').length}</span>
            <span className="text-[10px] font-bold text-warning uppercase tracking-widest">Motor</span>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-2xl mb-1 drop-shadow-md">🤝</span>
            <span className="text-xl font-black text-white leading-none mb-1">{tabQuestions.filter(q => q.subject === 'adabi').length}</span>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Adap</span>
          </div>
        </div>
      </div>

      {/* Exam Groups */}
      {exams.length === 0 ? (
        <div className="py-20 text-center text-text-muted">
          <PenTool className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="mb-2">Henüz sınav oluşturulmadı.</p>
          <button onClick={() => setExamModal({ open: true, exam: null })} className="text-warning text-sm font-bold hover:text-white transition-colors">
            + İlk sınavı oluştur
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map(exam => {
            const examQs = getQuestionsForExam(exam._id);
            const eqCount = examQs.length;
            const dist = {
              traffic: examQs.filter(q => q.subject === 'trafik').length,
              aid: examQs.filter(q => q.subject === 'ilkyardim').length,
              engine: examQs.filter(q => q.subject === 'motor').length,
              ethics: examQs.filter(q => q.subject === 'adabi').length,
            };
            const isOpen = openExams[exam._id] === true;
            const catName = categories.find(c => c._id === (exam.categoryId?._id || exam.categoryId))?.name;

            return (
              <div key={exam._id} className={`
                group border transition-all duration-500 rounded-3xl overflow-hidden shadow-sm
                ${isOpen 
                  ? 'bg-white/[0.05] border-warning/30 shadow-2xl shadow-warning/5 translate-y--1' 
                  : 'bg-white/[0.02] border-white/5 hover:border-warning/20 hover:bg-white/[0.03]'}
              `}>
                <button
                  className="w-full flex items-center gap-5 p-6 text-left"
                  onClick={() => toggleExam(exam._id)}
                >
                  <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                    ${isOpen ? 'bg-warning text-white rotate-6 shadow-xl shadow-warning/30' : 'bg-white/5 text-warning/50'}
                  `}>
                    <PenTool className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-lg font-black tracking-tight transition-colors ${isOpen ? 'text-white' : 'text-text-secondary'} truncate`}>
                        {exam.name}
                      </h3>
                      <div className="px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20 text-[10px] font-black text-warning uppercase tracking-widest whitespace-nowrap">
                        {catName || 'Genel'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-text-muted font-medium">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 opacity-50" />
                        {eqCount} Soru
                      </span>
                      <span className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                        <Clock className="w-3.5 h-3.5 opacity-50" />
                        {exam.duration} Dakika
                      </span>
                      {eqCount > 0 && !isOpen && (
                        <div className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                          <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-black border border-success/20">🚦 {dist.traffic}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-danger/10 text-danger text-[10px] font-black border border-danger/20">🚑 {dist.aid}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-warning/10 text-warning text-[10px] font-black border border-warning/20">🔧 {dist.engine}</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-black border border-purple-500/20">🤝 {dist.ethics}</span>
                          </div>
                        </div>
                      )}
                      {exam.isPro && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded text-[9px] font-black uppercase">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => { e.stopPropagation(); setFormModal({ open: true, question: null, isCopy: false, examId: exam._id }); }}
                      className="p-3 bg-warning/20 text-warning rounded-xl hover:bg-warning hover:text-white shadow-lg shadow-warning/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setExamModal({ open: true, exam }); }}
                      className="p-3 bg-white/5 text-text-secondary rounded-xl hover:bg-white/10 hover:text-white transition-all"
                    >
                      <FileEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteExam(exam); }}
                      className="p-3 bg-error/10 text-error rounded-xl hover:bg-error hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className={`
                    ml-4 p-2 rounded-full transition-all duration-300
                    ${isOpen ? 'bg-warning/20 text-warning rotate-180' : 'text-text-muted'}
                  `}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "circOut" }}
                      className="overflow-hidden border-t border-white/5 bg-black/30"
                    >
                      <div className="p-6 space-y-4">
                        {eqCount > 0 && (
                          <div className="flex flex-wrap gap-2 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                             <span className="text-[10px] font-black uppercase text-white/30 mr-2 flex items-center">Dağılım:</span>
                             <SubjectBadge label="🚦 Trafik" count={dist.traffic} color="bg-success/10 text-success border-success/30" />
                             <SubjectBadge label="🚑 İlk Yrd." count={dist.aid} color="bg-danger/10 text-danger border-danger/30" />
                             <SubjectBadge label="🔧 Motor" count={dist.engine} color="bg-warning/10 text-warning border-warning/30" />
                             <SubjectBadge label="🤝 Adap" count={dist.ethics} color="bg-purple-500/10 text-purple-400 border-purple-500/30" />
                          </div>
                        )}
                        {eqCount === 0 ? (
                          <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-white/5" />
                            <p className="text-text-muted font-medium">Bu sınavda henüz soru bulunmuyor.</p>
                            <button
                              onClick={() => setFormModal({ open: true, question: null, isCopy: false, examId: exam._id })}
                              className="mt-4 px-6 py-2 bg-warning text-white font-black text-xs rounded-xl shadow-lg shadow-warning/20 hover:scale-105 transition-all"
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
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 text-white/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white/60 text-sm">Sınav Atanmamış</p>
                  <p className="text-xs text-text-muted">{unassigned.length} Soru</p>
                </div>
              </div>
              <div className="px-4 pb-4 space-y-2">
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
            exams={exams}
            initialExamId={formModal.examId}
            existingQuestion={formModal.question}
            isCopy={formModal.isCopy}
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
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {csvModal && (
          <CsvImportModal
            isOpen={csvModal}
            onClose={() => setCsvModal(false)}
            onImported={onRefresh}
            exams={exams}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main AdminExams Component ────────────────────────────────────────────────
const AdminExams = () => {
  const [tab, setTab] = useState('short_test'); // 'short_test' | 'mock_exam' | 'real_exam'
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
        api.get('/exams'),
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

  const shortCount = questions.filter(q => q.testType === 'short_test').length;
  const mockCount = questions.filter(q => q.testType === 'mock_exam').length;
  const realCount = questions.filter(q => q.testType === 'real_exam').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Soru Bankası</h1>
          <p className="text-text-secondary text-sm mt-1">Tüm soruları kategorilere ve sınavlara göre yönetin.</p>
        </div>
        <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-text-secondary hover:text-white hover:bg-white/10 transition-all self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" /> Yenile
        </button>
      </div>

      {/* Tab Selector */}
      <div className="flex p-1 bg-bg-card2 border border-white/5 rounded-2xl w-full max-w-lg">
        <button
          onClick={() => setTab('short_test')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${tab === 'short_test' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-text-secondary hover:text-white'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Kısa Testler</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${tab === 'short_test' ? 'bg-white/20' : 'bg-white/5'}`}>{shortCount}</span>
        </button>
        <button
          onClick={() => setTab('mock_exam')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${tab === 'mock_exam' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-text-secondary hover:text-white'}`}
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Deneme Sınavları</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${tab === 'mock_exam' ? 'bg-white/20' : 'bg-white/5'}`}>{mockCount}</span>
        </button>
        <button
          onClick={() => setTab('real_exam')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all ${tab === 'real_exam' ? 'bg-warning text-white shadow-lg shadow-warning/30' : 'text-text-secondary hover:text-white'}`}
        >
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Gerçek Sınavlar</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${tab === 'real_exam' ? 'bg-white/20' : 'bg-white/5'}`}>{realCount}</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-text-muted text-sm font-bold uppercase tracking-widest">Yükleniyor...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'short_test' ? (
              <ShortTestTab questions={questions} categories={categories} exams={exams} onRefresh={handleRefresh} />
            ) : tab === 'mock_exam' ? (
              <ExamQuestionsTab questions={questions} categories={categories} exams={exams} onRefresh={handleRefresh} testType="mock_exam" title="Deneme Sınavı" />
            ) : (
              <ExamQuestionsTab questions={questions} categories={categories} exams={exams} onRefresh={handleRefresh} testType="real_exam" title="Gerçek Sınav" />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

const SubjectBadge = ({ label, count, color }) => (
  <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-[11px] font-black tracking-tight ${color}`}>
    <span>{label}</span>
    <div className="px-1.5 py-0.5 bg-white/10 rounded-md min-w-[1.2rem] text-center">{count}</div>
  </div>
);

export default AdminExams;
