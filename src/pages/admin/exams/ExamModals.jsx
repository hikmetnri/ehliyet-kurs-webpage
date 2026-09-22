import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../api';
import { TEST_TYPES } from '../../../constants/testTypes';
import { motion } from 'framer-motion';
import {
  Loader2, CheckCircle2, X, Save, AlertCircle, Folder,
  PenTool, UploadCloud, Zap, Clock, BarChart2,
  Shield, AlignLeft, FileText, FileX,
} from 'lucide-react';
import { isVideoCategory } from '../../../utils/categoryContent';
import { getErrorMessage, executeAPICall } from '../../../utils/apiErrorHandler';
import { parseCSV } from '../../../utils/csvParser';
import {
  CSV_EXAMPLE,
  B_CLASS_SUBJECTS,
  IS_MAKINESI_SUBJECTS,
  getCategoryGroupFromText,
  getExamCategoryGroup,
  defaultDurationForGroup,
  resolveExamTestType,
} from './examConstants';

// ─── Exam Form Modal ───────────────────────────────────────────────────────────
const ExamFormModal = ({
  isOpen,
  onClose,
  onSaved,
  categories,
  existingExam,
  forceMiniTest = false,
  testType = TEST_TYPES.MOCK_EXAM,
  lockTestType = false,
  initialCategoryGroup = 'b_class',
}) => {
  const isEdit = !!existingExam;
  // Tür bazlı etiketler — deneme/gerçek/kısa test karışmasın
  const typeLabel = forceMiniTest
    ? 'Kısa Test'
    : testType === TEST_TYPES.REAL_EXAM
      ? 'Gerçek Sınav'
      : 'Deneme Sınavı';
  // Gerçek sınav ekranında yalnızca B Sınıfı ve İş Makinesi kökleri seçilebilir.
  const catOptions = useMemo(() => {
    return categories
      .filter(c => !isVideoCategory(c) && !c.parent?._id && !c.parent)
      .filter(c => !lockTestType || Boolean(getCategoryGroupFromText(c.name)))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories, lockTestType]);

  const [form, setForm] = useState({ name: '', description: '', duration: String(defaultDurationForGroup(initialCategoryGroup)), categoryId: '', isPro: false, isMiniTest: forceMiniTest, testType, passingScore: '70' });
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
          testType: existingExam.isMiniTest ? TEST_TYPES.SHORT_TEST : resolveExamTestType(existingExam),
          passingScore: String(existingExam.passingScore || 70),
        });
      } else {
        const initialCategory =
          catOptions.find(category => getCategoryGroupFromText(category.name) === initialCategoryGroup) ||
          catOptions[0];
        const initialGroup = getCategoryGroupFromText(initialCategory?.name) || initialCategoryGroup;
        setForm({ name: '', description: '', duration: String(defaultDurationForGroup(initialGroup)), categoryId: initialCategory?._id || '', isPro: false, isMiniTest: forceMiniTest, testType: forceMiniTest ? TEST_TYPES.SHORT_TEST : testType, passingScore: '70' });
      }
      setError('');
    }
  }, [isOpen, existingExam, forceMiniTest, testType, catOptions, initialCategoryGroup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Sınav adı zorunludur.'); return; }
    if (lockTestType && !form.categoryId) { setError('B Sınıfı veya İş Makinesi kategorisi seçilmelidir.'); return; }
    const duration = Number(form.duration);
    const passingScore = Number(form.passingScore);
    if (!Number.isInteger(duration) || duration < 1 || duration > 180) { setError('Süre 1-180 dakika arasında tam sayı olmalıdır.'); return; }
    if (!Number.isInteger(passingScore) || passingScore < 0 || passingScore > 100) { setError('Geçme notu 0-100 arasında tam sayı olmalıdır.'); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        duration,
        categoryId: form.categoryId || null,
        isPro: form.isPro,
        isMiniTest: form.isMiniTest,
        testType: form.isMiniTest ? TEST_TYPES.SHORT_TEST : lockTestType ? testType : form.testType,
        passingScore,
      };
      if (isEdit) {
        await api.put(`/exams/${existingExam._id}`, payload);
      } else {
        await api.post('/exams', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Hata oluştu.');
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
                  { id: TEST_TYPES.MOCK_EXAM, label: 'Deneme Sınavı', icon: Zap },
                  { id: TEST_TYPES.REAL_EXAM, label: 'Gerçek Sınav', icon: Shield },
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
                          ? type.id === TEST_TYPES.REAL_EXAM
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
                type="number" min="1" max="180" step="1"
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
                type="number" min="0" max="100" step="1"
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
                onChange={e => {
                  const categoryId = e.target.value;
                  const category = catOptions.find(item => item._id === categoryId);
                  const group = getCategoryGroupFromText(category?.name) || initialCategoryGroup;
                  setForm(current => ({ ...current, categoryId, duration: String(defaultDurationForGroup(group)) }));
                }}
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
                  <AlertCircle className="w-3 h-3" /> {typeLabel} için kategori seçin
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
const CsvImportModal = ({ isOpen, onClose, onImported, exams, categories, testType = TEST_TYPES.MOCK_EXAM }) => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [csv, setCsv] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => { if (isOpen) { setCsv(''); setResult(null); setError(''); setSelectedExamId(''); setSelectedSubject(''); } }, [isOpen]);

  const selectedExam = exams.find(exam => exam._id === selectedExamId);
  const selectedGroup = selectedExam ? getExamCategoryGroup(selectedExam, categories) : null;
  const availableSubjects = selectedGroup === 'is_makinesi' ? IS_MAKINESI_SUBJECTS : B_CLASS_SUBJECTS;

  const handleImport = async () => {
    if (!selectedExamId) {
      setError('Soruların bağlanacağı sınavı seçin.');
      return;
    }
    if (!selectedSubject) {
      setError('Tüm sorular için bir branş seçin.');
      return;
    }
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
            examId: selectedExamId,
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
            <label className="text-xs font-bold text-text-secondary mb-2 block">Sınav Seçimi <span className="text-danger">*</span></label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-primary/40 transition-colors"
              value={selectedExamId}
              onChange={e => { setSelectedExamId(e.target.value); setSelectedSubject(''); setError(''); }}
            >
              <option value="" className="bg-bg-card text-white/40">Sınav seçin...</option>
              {exams.map(ex => <option key={ex._id} value={ex._id} className="bg-bg-card">{ex.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-text-secondary mb-2 block">Soru Konusu / Branş <span className="text-danger">*</span> (tüm liste için)</label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-primary/40 transition-colors"
              value={selectedSubject}
              disabled={!selectedExamId}
              onChange={e => { setSelectedSubject(e.target.value); setError(''); }}
            >
              <option value="" className="bg-bg-card text-white/40">{selectedExamId ? 'Branş seçin...' : 'Önce sınav seçin'}</option>
              {availableSubjects.map(subject => (
                <option key={subject.value} value={subject.value} className="bg-bg-card">{subject.emoji} {subject.label}</option>
              ))}
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

export { ExamFormModal, CsvImportModal };
