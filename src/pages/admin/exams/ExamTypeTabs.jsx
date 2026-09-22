import React, { useState, useMemo } from 'react';
import api from '../../../api';
import { TEST_TYPES } from '../../../constants/testTypes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, FileEdit, Trash2, CheckCircle2, XCircle,
  Image as ImageIcon, X, FolderOpen, ChevronDown, Clock, HelpCircle,
  FileText, Copy, Eye, EyeOff, Shield, BookOpen, BarChart2,
  Folder, AlertTriangle, HardHat, UploadCloud, PenTool, FileX, Send,
} from 'lucide-react';
import { resolveMediaUrl } from '../../../utils/mediaUrl';
import { isVideoCategory } from '../../../utils/categoryContent';
import { DifficultyBadge, SubjectBadge } from './ExamUiBits';
import { QuestionFormModal } from './QuestionEditor';
import { ExamFormModal, CsvImportModal } from './ExamModals';
import {
  B_CLASS_SUBJECTS,
  IS_MAKINESI_SUBJECTS,
  normalizeTestType,
  getCategoryGroup,
  getCategoryGroupFromText,
  getExamCategoryGroup,
  resolveExamTestType,
} from './examConstants';

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

// ─── Short Test Tab ────────────────────────────────────────────────────────────
const ShortTestTab = ({ questions, categories, onRefresh }) => {
  const [activeCatFilter, setActiveCatFilter] = useState('b_class');
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterMedia, setFilterMedia] = useState('all');
  const [formModal, setFormModal] = useState({ open: false, question: null, isCopy: false, categoryId: null });
  const [openCats, setOpenCats] = useState({});
  const toggleCat = (id) => setOpenCats(s => ({ ...s, [id]: !s[id] }));

  const expandAll = () => {
    const next = {};
    categories.forEach(c => next[c._id] = true);
    setOpenCats(next);
  };
  const collapseAll = () => setOpenCats({});

  const shortQuestions = questions.filter(q =>
    normalizeTestType(q.testType) === TEST_TYPES.SHORT_TEST &&
    getCategoryGroup(q.category, categories) === activeCatFilter
  );

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

  const roots = categories.filter(c =>
    !isVideoCategory(c) &&
    !c.parent?._id &&
    !c.parent &&
    getCategoryGroupFromText(c.name) === activeCatFilter
  );

  const countQuestionsDeep = (categoryId) => {
    const ownCount = getQuestionsForCat(categoryId).length;
    return categories
      .filter(category => (category.parent?._id || category.parent) === categoryId)
      .reduce((total, child) => total + countQuestionsDeep(child._id), ownCount);
  };

  const renderCategory = (cat, level = 0) => {
    const children = categories.filter(c => (c.parent?._id || c.parent) === cat._id);
    const isLeaf = children.length === 0;
    const catQuestions = isLeaf ? getQuestionsForCat(cat._id) : [];
    const isOpen = openCats[cat._id] === true;
    const totalDeep = countQuestionsDeep(cat._id);

    return (
      <div key={cat._id} className={`mb-3 transition-all duration-300 ${level > 0 ? 'ml-6 border-l border-white/10 pl-4' : ''}`}>
        <div className={`
          relative overflow-hidden rounded-2xl border transition-all duration-300
          ${isOpen
            ? 'bg-white/[0.035] border-accent/30 shadow-lg'
            : 'bg-white/[0.015] border-white/10 hover:border-white/20 hover:bg-white/[0.025]'}
        `}>
          {/* Category Header */}
          <div
            role="button"
            tabIndex={0}
            className="w-full flex items-center gap-4 p-4 text-left transition-all"
            onClick={() => toggleCat(cat._id)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleCat(cat._id);
              }
            }}
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
          </div>

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
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#243044] bg-[#0B1220] p-1.5">
        {[
          { id: 'b_class', label: 'B Sınıfı', icon: Shield },
          { id: 'is_makinesi', label: 'İş Makinesi', icon: HardHat },
        ].map(item => {
          const Icon = item.icon;
          const active = activeCatFilter === item.id;
          const count = questions.filter(question =>
            normalizeTestType(question.testType) === TEST_TYPES.SHORT_TEST &&
            getCategoryGroup(question.category, categories) === item.id
          ).length;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => { setActiveCatFilter(item.id); setOpenCats({}); }}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-black transition-all ${active ? 'border-[#7C6CFF]/35 bg-[#7C6CFF]/15 text-white' : 'border-transparent text-[#8F9BB0] hover:bg-[#151E2E] hover:text-white'}`}
            >
              <Icon className="h-4 w-4" /> {item.label}
              <span className="rounded-lg bg-white/[0.06] px-1.5 py-0.5 text-[10px]">{count}</span>
            </button>
          );
        })}
      </div>

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

          <button
            onClick={() => setFormModal({ open: true, question: null, isCopy: false, categoryId: null })}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-white font-bold text-sm rounded-2xl shadow-md shadow-accent/10 hover:bg-accent/90 hover:-translate-y-0.5 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Soru Ekle
          </button>
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-3 text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary border-r border-white/10 pr-4">
            <BookOpen className="w-4 h-4 text-accent" />
            <span><strong className="text-white">{shortQuestions.length}</strong> Soru</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <FolderOpen className="w-4 h-4 text-primary-light" />
            <span><strong className="text-white">{categories.filter(category => !isVideoCategory(category) && getCategoryGroup(category._id, categories) === activeCatFilter).length}</strong> Kategori</span>
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
            testType={TEST_TYPES.SHORT_TEST}
            categories={categories}
            exams={[]}
            initialCategoryId={formModal.categoryId}
            initialExamCategory={
              formModal.categoryId
                ? getCategoryGroup(formModal.categoryId, categories) || 'b_class'
                : activeCatFilter
            }
            existingQuestion={formModal.question}
            isCopy={formModal.isCopy}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Exam Questions Tab ────────────────────────────────────────────────────────
const ExamQuestionsTab = ({ questions, categories, exams, allTypeExams, onRefresh, testType = TEST_TYPES.EXAM, title = 'Sınav', activeCatFilter = 'b_class' }) => {
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
    if (!window.confirm(`"${exam.name}" ${title.toLowerCase()}ını kaldırmak istediğinizden emin misiniz?\n\nSınav ve bağlı aktif sorular kullanıcı görünümünden kaldırılır.`)) return;
    try { await api.delete(`/exams/${exam._id}`); onRefresh(); } catch { alert('Sınav silinemedi.'); }
  };

  const handlePublishExam = async (exam) => {
    const audience = activeCatFilter === 'is_makinesi' ? 'İş Makinesi' : 'B Sınıfı';
    if (!window.confirm(`"${exam.name}" sınavını yayınlamak istediğinizden emin misiniz?\n\nBildirim ${audience} kategorisindeki uygun kullanıcılara gönderilir.`)) return;
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                <div
                  role="button"
                  tabIndex={0}
                  className="w-full flex items-center gap-5 p-6 text-left"
                  onClick={() => toggleExam(exam._id)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleExam(exam._id);
                    }
                  }}
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
                        title="Yayınla — ilgili kategori kullanıcılarına bildirim gönderilir"
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
                </div>

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
            exams={allTypeExams || typedExams}
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
            categories={categories}
            testType={testType}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export { QuestionCard, ShortTestTab, ExamQuestionsTab };
