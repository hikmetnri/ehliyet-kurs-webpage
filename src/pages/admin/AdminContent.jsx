import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api';
import { fetchAllQuestions } from '../../utils/questionPages';
import { AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Loader2, Layers, Settings2, FileText,
  Eye, EyeOff, Save, Edit3, RotateCcw,
  Send, RefreshCw, FilePlus, Activity,
  Video, BookOpen, AlignLeft, SplitSquareVertical,
  ZoomIn, Quote, ExternalLink,
} from 'lucide-react';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { isVideoRecord } from '../../utils/categoryContent';

// ─── Extracted Modules (SRP) ──────────────────────────────────────────────────
import {
  uploadImage,
  createQuestionForm,
  getEditableCategoryContent,
  getPublicationStatus,
  getPublicationMeta,
  categoryHasDraft,
  getContentVersions,
} from './content/contentHelpers';
import { MarkdownToolbar, ImagePreviewModal, ContentVersionHistory } from './content/contentUiParts';
import { TopicQuestionsWorkspace } from './content/TopicQuestionParts';
import VideoManagementWorkspace from './content/VideoParts';
import CategoryModal from './content/CategoryModal';
import CategoryTreePanel from './content/CategoryTreePanel';
import { createContentAdminRepository, buildShortTestQuestionPayload } from './content/contentAdminRepository';

const contentAdmin = createContentAdminRepository({ client: api, loadQuestions: fetchAllQuestions });

// ─── Main AdminContent Component ────────────────────────────────────────────
const AdminContent = () => {
  const [allCategories, setAllCategories] = useState([]);
  const [shortTestQuestions, setShortTestQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePanel, setActivePanel] = useState('content');

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saveLoading, setSaveLoading] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState('split');

  // Image preview
  const [previewImage, setPreviewImage] = useState(null);

  // Category modal
  const [catModal, setCatModal] = useState({ open: false, cat: null });
  const [catForm, setCatForm] = useState({ name: '', description: '', color: '#6366f1', isPro: false, isActive: true, parent: null, image: '' });
  const [catSaving, setCatSaving] = useState(false);

  // Question workspace
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState('all');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState(createQuestionForm());
  const [questionSaving, setQuestionSaving] = useState(false);

  const textareaRef = useRef(null);
  const categoryRequest = useRef(0);
  const questionRequest = useRef(0);

  useEffect(() => () => {
    categoryRequest.current++;
    questionRequest.current++;
  }, []);

  const contentCategories = allCategories.filter((category) => !isVideoRecord(category));
  const selectedCat = contentCategories.find(c => c._id === selectedCatId);

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    const currentCategory = allCategories.find(category => category._id === selectedCatId && !isVideoRecord(category));
    if (currentCategory) {
      setEditContent(getEditableCategoryContent(currentCategory));
      setIsEditing(false);
      setEditingQuestionId(null);
      setQuestionForm(createQuestionForm());
      setQuestionSearch('');
      setQuestionDifficultyFilter('all');
      fetchShortTestQuestions(currentCategory._id);
    }
  }, [selectedCatId, allCategories]);

  const fetchCategories = async () => {
    const request = ++categoryRequest.current;
    try {
      setLoading(true);
      const categories = await contentAdmin.loadCategories();
      if (request === categoryRequest.current) setAllCategories(categories);
    } catch (err) {
      console.error('Kategoriler alınamadı:', err);
    } finally {
      if (request === categoryRequest.current) setLoading(false);
    }
  };

  const fetchShortTestQuestions = async (catId) => {
    if (!catId) return;
    const request = ++questionRequest.current;
    setLoadingQuestions(true);
    try {
      const questions = await contentAdmin.loadShortTestQuestions(catId);
      if (request === questionRequest.current) setShortTestQuestions(questions);
    } catch (err) {
      console.error('Sorular alınamadı:', err);
    } finally {
      if (request === questionRequest.current) setLoadingQuestions(false);
    }
  };

  const handleReorder = async (parentId, newOrder) => {
    // 1. Update local state for instant feedback
    const updatedAll = [...allCategories];
    newOrder.forEach((cat, index) => {
       const foundIndex = updatedAll.findIndex(c => c._id === cat._id);
       if (foundIndex !== -1) {
         updatedAll[foundIndex] = { ...updatedAll[foundIndex], order: index };
       }
    });
    setAllCategories(updatedAll);

    // 2. Persist to backend
    try {
      await contentAdmin.reorderCategories(parentId, newOrder);
    } catch (err) {
      console.error('Sıralama kaydedilemedi:', err);
      await fetchCategories();
    }
  };

  // ── Markdown insert ──────────────────────────────────────────────────────
  const insertMarkdown = useCallback((prefix, suffix = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = editContent.substring(start, end);
    const before = editContent.substring(0, start);
    const after = editContent.substring(end);
    const newContent = before + prefix + selected + suffix + after;
    setEditContent(newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length + selected.length + suffix.length, start + prefix.length + selected.length + suffix.length);
    }, 10);
  }, [editContent]);

  // ── Image upload ─────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      // url zaten '/uploads/...' formatında gelir; göreceli yol olarak kullan
      const fullUrl = url.startsWith('http') ? url : url;
      insertMarkdown(`\n![${file.name}](${fullUrl})\n`, '');
    } catch {
      alert('Görsel yüklenemedi.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // ── Draft / publish content ─────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!selectedCatId) return;
    setSaveLoading('draft');
    try {
      await contentAdmin.saveDraft(selectedCatId, editContent);
      await fetchCategories();
      setIsEditing(false);
    } catch (err) {
      alert('Taslak kaydedilemedi: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
    } finally {
      setSaveLoading(null);
    }
  };

  const handlePublish = async (contentOverride) => {
    if (!selectedCatId) return;
    const contentToPublish = typeof contentOverride === 'string' ? contentOverride : editContent;
    setSaveLoading('publish');
    try {
      await contentAdmin.publish(selectedCatId, contentToPublish);
      await fetchCategories();
      setEditContent(contentToPublish);
      setIsEditing(false);
    } catch (err) {
      alert('İçerik yayınlanamadı: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
    } finally {
      setSaveLoading(null);
    }
  };

  const handleLoadVersion = (content) => {
    setActivePanel('content');
    setEditContent(content);
    setIsEditing(true);
    setViewMode('split');
  };

  // ── Short Test Question Handlers ─────────────────────────────────────────
  const handleNewQuestion = () => {
    setEditingQuestionId(null);
    setQuestionForm(createQuestionForm());
    setActivePanel('questions');
  };

  const handleEditQuestion = (question) => {
    setEditingQuestionId(question._id);
    setQuestionForm(createQuestionForm(question));
    setActivePanel('questions');
  };

  const handleDuplicateQuestion = (question) => {
    setEditingQuestionId(null);
    setQuestionForm(createQuestionForm(question));
    setActivePanel('questions');
  };

  const handleQuestionFormChange = (key, value) => {
    setQuestionForm(form => ({ ...form, [key]: value }));
  };

  const handleQuestionOptionChange = (index, value) => {
    setQuestionForm(form => ({
      ...form,
      options: form.options.map((option, i) => (i === index ? value : option)),
    }));
  };

  const handleQuestionAddOption = () => {
    setQuestionForm(form => (
      form.options.length >= 6 ? form : { ...form, options: [...form.options, ''] }
    ));
  };

  const handleQuestionRemoveOption = (index) => {
    setQuestionForm(form => {
      if (form.options.length <= 2) return form;
      const options = form.options.filter((_, i) => i !== index);
      let correctAnswer = form.correctAnswer;
      if (correctAnswer === index) correctAnswer = 0;
      else if (correctAnswer > index) correctAnswer -= 1;
      if (correctAnswer >= options.length) correctAnswer = 0;
      return { ...form, options, correctAnswer };
    });
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Bu soruyu silmek istediğinize emin misiniz?')) return;
    try {
      await contentAdmin.deleteQuestion(qId);
      if (editingQuestionId === qId) handleNewQuestion();
      await fetchShortTestQuestions(selectedCatId);
    } catch (err) {
      alert('Soru silinemedi: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCatId) return;

    const { payload, error } = buildShortTestQuestionPayload(questionForm, selectedCatId);
    if (error) return alert(error);

    setQuestionSaving(true);
    try {
      const saved = await contentAdmin.saveQuestion(editingQuestionId, payload);

      await fetchShortTestQuestions(selectedCatId);

      if (editingQuestionId) {
        setQuestionForm(createQuestionForm(saved));
      } else {
        setQuestionForm(createQuestionForm());
        setEditingQuestionId(null);
      }
    } catch (err) {
      alert('Soru kaydedilemedi: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
    } finally {
      setQuestionSaving(false);
    }
  };

  // ── Category modal ──────────────────────────────────────────────────────
  const openCatModal = (cat = null) => {
    if (cat) {
      setCatForm({
        name: cat.name || '',
        description: cat.description || '',
        color: cat.color || '#6366f1',
        isPro: cat.isPro || false,
        isActive: cat.isActive !== undefined ? cat.isActive : true,
        parent: cat.parent?._id || cat.parent || null,
        image: cat.image || '',
      });
    } else {
      setCatForm({ name: '', description: '', color: '#6366f1', isPro: false, isActive: true, parent: selectedCatId, image: '' });
    }
    setCatModal({ open: true, cat });
  };

  const handleCatSave = async () => {
    if (!catForm.name.trim()) return alert('İsim zorunludur.');
    setCatSaving(true);
    try {
      await contentAdmin.saveCategory(catModal.cat?._id, catForm);
      await fetchCategories();
      setCatModal({ open: false, cat: null });
    } catch {
      alert('Hata oluştu.');
    } finally {
      setCatSaving(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      await contentAdmin.setCategoryActive(cat._id, !cat.isActive);
      setAllCategories(prev => prev.map(c => c._id === cat._id ? { ...c, isActive: !cat.isActive } : c));
    } catch (err) {
      alert('Kategori durumu güncellenemedi: ' + (err.response?.data?.error || err.message));
    }
  };

  // Root categories for tree
  const rootCats = contentCategories
    .filter(c => !c.parent?._id && !c.parent)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const filteredRoots = searchTerm
    ? contentCategories
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    : rootCats;

  const normalizedQuestionSearch = questionSearch.trim().toLowerCase();
  const visibleShortTestQuestions = shortTestQuestions.filter(question => {
    const matchesDifficulty = questionDifficultyFilter === 'all' || question.difficulty === questionDifficultyFilter;
    const searchable = [
      question.text,
      question.explanation,
      ...(question.options || []),
    ].join(' ').toLowerCase();
    const matchesSearch = !normalizedQuestionSearch || searchable.includes(normalizedQuestionSearch);
    return matchesDifficulty && matchesSearch;
  });

  // Custom markdown image renderer with click-to-zoom.
  const markdownComponents = {
    img: ({ src, alt }) => {
      const resolvedSrc = resolveMediaUrl(src);
      return (
      <div className="my-10 w-full max-w-4xl mx-auto group">
        <div
          className="relative cursor-zoom-in overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] p-2 transition-colors hover:bg-white/[0.04]"
          onClick={() => setPreviewImage(resolvedSrc)}
        >
          <img
            src={resolvedSrc}
            alt={alt}
            className="relative z-10 h-auto w-full rounded-2xl object-contain"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn className="w-10 h-10 text-white" />
          </div>
        </div>
        {alt && <p className="mt-4 text-center text-xs font-bold text-text-muted">{alt}</p>}
      </div>
      );
    },
    h1: ({ children }) => <h1 className="text-4xl md:text-5xl font-black text-white mt-12 mb-6 tracking-tight leading-tight">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-10 mb-5 tracking-tight border-b border-white/10 pb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold text-primary-light mt-8 mb-4">{children}</h3>,
    p: ({ children }) => <p className="text-text-secondary text-base leading-[1.8] font-medium mb-6">{children}</p>,
    strong: ({ children }) => <strong className="text-white font-black bg-white/5 px-1.5 py-0.5 rounded-lg border border-white/5">{children}</strong>,
    em: ({ children }) => <em className="text-primary-light italic">{children}</em>,
    code: ({ inline, children }) => inline
      ? <code className="px-2 py-1 bg-[#1e1e1e] border border-white/10 rounded-lg text-primary-light text-sm font-mono tracking-wide">{children}</code>
      : <code className="block bg-[#161618] border border-white/10 rounded-2xl p-6 text-sm font-mono text-green-400 overflow-x-auto my-8 shadow-xl custom-scrollbar">{children}</code>,
    blockquote: ({ children }) => (
      <blockquote className="group relative my-8 overflow-hidden rounded-r-2xl border border-white/10 border-l-4 border-l-primary bg-white/[0.025] py-4 pl-6">
        <Quote className="absolute right-4 top-4 w-12 h-12 text-primary/10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        <div className="relative z-10 text-lg leading-relaxed text-text-secondary italic font-medium">
            {children}
        </div>
      </blockquote>
    ),
    ul: ({ children }) => <ul className="flex flex-col gap-3 my-6 pl-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside space-y-3 my-6 text-text-secondary font-medium text-base">{children}</ol>,
    li: ({ children }) => (
      <li className="flex items-start gap-4 text-text-secondary font-medium text-base group">
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary/40 transition-all group-hover:scale-125 group-hover:bg-primary" />
        <span className="leading-relaxed">{children}</span>
      </li>
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-primary-light font-bold hover:text-white transition-all underline decoration-primary/30 underline-offset-4 hover:decoration-white">
        {children} <ExternalLink className="w-3 h-3" />
      </a>
    ),
    hr: () => <hr className="border-white/5 my-12" />,
    table: ({ children }) => (
      <div className="overflow-x-auto my-8 rounded-2xl border border-white/10 bg-black/20 shadow-2xl">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border-b border-white/10 bg-white/5 px-6 py-4 text-left font-black text-white text-xs uppercase tracking-widest">{children}</th>,
    td: ({ children }) => <td className="border-b border-white/5 px-6 py-4 text-text-secondary font-medium align-middle">{children}</td>,
  };

  const selectedEditableContent = getEditableCategoryContent(selectedCat);
  const selectedDisplayContent = isEditing ? editContent : selectedEditableContent;
  const selectedPublicationMeta = getPublicationMeta(selectedCat);
  const selectedHasDraft = categoryHasDraft(selectedCat);
  const selectedVersions = getContentVersions(selectedCat);
  const hasUnsaved = isEditing && editContent !== selectedEditableContent;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-96px)] md:min-h-[calc(100vh-120px)]">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold text-primary-light uppercase tracking-widest">İçerik Yönetimi</p>
            <h1 className="mt-1.5 text-xl sm:text-2xl font-bold text-white tracking-tight">İçerik Kütüphanesi</h1>
            <p className="text-text-secondary text-sm mt-1">Ders içeriklerini ve kategori yapısını yönetin.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2">
                <p className="text-base font-black text-white">{contentCategories.length}</p>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Kategori</p>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <p className="text-base font-black text-white">{contentCategories.filter(c => c.isPro).length}</p>
                <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">PRO</p>
              </div>
            </div>
            <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
              {[
                { id: 'content', label: 'Dersler', icon: BookOpen },
                { id: 'videos', label: 'Videolar', icon: Video },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePanel(item.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest transition ${
                    (item.id === 'content' ? activePanel !== 'videos' : activePanel === item.id)
                      ? 'bg-primary/20 text-primary-light'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => fetchCategories()}
              className="p-2.5 rounded-xl hover:bg-white/5 border border-white/10 text-text-muted hover:text-white transition-all"
              title="Yenile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {activePanel !== 'videos' && (
              <button
                onClick={() => openCatModal()}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-xl transition-all font-bold text-sm"
              >
                <FilePlus className="w-4 h-4" /> Yeni Kategori
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Main Split Layout ─────────────────────────────────────────────── */}
      {activePanel === 'videos' ? (
        <VideoManagementWorkspace allCategories={allCategories} onRefresh={fetchCategories} />
      ) : (
      <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0 overflow-visible xl:overflow-hidden">

        {/* LEFT: Category Tree Panel */}
        <CategoryTreePanel
          loading={loading}
          categories={contentCategories}
          rootCats={rootCats}
          filteredRoots={filteredRoots}
          searchTerm={searchTerm}
          selectedCatId={selectedCatId}
          onSearchChange={setSearchTerm}
          onSelect={setSelectedCatId}
          onEdit={openCatModal}
          onReorder={handleReorder}
        />

        {/* RIGHT: Content Panel */}
        <div className="flex-1 flex flex-col bg-white/[0.025] border border-white/10 rounded-3xl overflow-hidden min-w-0 min-h-[70vh] xl:min-h-0">
          {selectedCat ? (
            <>
              {/* Content Header */}
              <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/[0.015] shrink-0">
                <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: selectedCat.color || '#6366f1' }}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-white truncate">{selectedCat.name}</h2>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {selectedCat.isPro && (
                        <span className="text-[9px] font-bold text-warning uppercase bg-warning/10 px-1.5 py-0.5 rounded border border-warning/20">PRO</span>
                      )}
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border
                        ${selectedCat.isActive
                          ? 'text-success bg-success/10 border-success/20'
                          : 'text-danger bg-danger/10 border-danger/20'}`}>
                        {selectedCat.isActive ? 'AKTİF' : 'GİZLİ'}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${selectedPublicationMeta.badge}`}>
                        {selectedPublicationMeta.label}
                      </span>
                      {hasUnsaved && (
                        <span className="text-[9px] font-bold text-warning uppercase bg-warning/10 px-1.5 py-0.5 rounded border border-warning/20 animate-pulse">
                          ● KAYDEDİLMEDİ
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                  <div className="flex p-1 bg-black/20 border border-white/10 rounded-2xl shrink-0">
                    {[
                      { id: 'content', icon: BookOpen, label: 'Ders İçeriği', count: null },
                      { id: 'questions', icon: Activity, label: 'Kısa Test', count: shortTestQuestions.length },
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActivePanel(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${activePanel === item.id
                          ? 'bg-accent/20 text-accent border-accent/20'
                          : 'text-text-muted hover:text-white border-transparent'}`}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{item.label}</span>
                        {item.count !== null && (
                          <span className={`rounded px-1.5 py-0.5 text-[10px] ${activePanel === item.id ? 'bg-accent/20 text-accent-light' : 'bg-white/10 text-white/40'}`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* View mode toggle */}
                  {activePanel === 'content' && isEditing && (
                    <div className="flex p-1 bg-black/20 border border-white/10 rounded-2xl">
                      {[
                        { id: 'editor', icon: AlignLeft, label: 'Editör' },
                        { id: 'split', icon: SplitSquareVertical, label: 'Split' },
                        { id: 'preview', icon: Eye, label: 'Önizleme' },
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => setViewMode(m.id)}
                          title={m.label}
                          className={`p-1.5 rounded-xl transition-all border ${viewMode === m.id
                            ? 'bg-primary/20 text-primary-light border-primary/20'
                            : 'text-text-muted hover:text-white border-transparent'}`}
                        >
                          <m.icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => openCatModal(selectedCat)}
                    className="p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all border border-white/10 bg-white/5"
                    title="Kategori Ayarları"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleActive(selectedCat)}
                    className={`p-2 rounded-xl transition-all border ${selectedCat.isActive
                      ? 'hover:bg-danger/10 text-text-muted hover:text-danger border-white/10 bg-white/5'
                      : 'bg-success/15 text-success border-success/30'}`}
                    title={selectedCat.isActive ? 'Gizle' : 'Göster'}
                  >
                    {selectedCat.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {activePanel === 'content' && (isEditing ? (
                    <>
                      <button
                        onClick={() => { setIsEditing(false); setEditContent(selectedEditableContent); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-all text-xs font-bold border border-white/10 shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> İptal
                      </button>
                      <button
                        onClick={handleSaveDraft}
                        disabled={Boolean(saveLoading)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-warning/30 bg-warning/15 text-warning text-xs font-bold hover:bg-warning hover:text-white transition-all disabled:opacity-60 shrink-0"
                      >
                        {saveLoading === 'draft' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Taslak
                      </button>
                      <button
                        onClick={() => handlePublish()}
                        disabled={Boolean(saveLoading)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success text-white text-xs font-bold shadow-md shadow-success/10 hover:-translate-y-0.5 transition-all disabled:opacity-60 shrink-0"
                      >
                        {saveLoading === 'publish' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Yayınla
                      </button>
                    </>
                  ) : (
                    <>
                      {selectedHasDraft && (
                        <button
                          onClick={() => handlePublish(selectedEditableContent)}
                          disabled={Boolean(saveLoading) || !selectedEditableContent.trim()}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success text-white text-xs font-bold shadow-md shadow-success/10 hover:-translate-y-0.5 transition-all disabled:opacity-60 shrink-0"
                        >
                          {saveLoading === 'publish' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Yayınla
                        </button>
                      )}
                      <button
                        onClick={() => { setIsEditing(true); setViewMode('split'); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/20 text-primary-light border border-primary/30 hover:bg-primary hover:text-white text-xs font-bold transition-all shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> {selectedHasDraft ? 'Taslağı Düzenle' : 'İçeriği Düzenle'}
                      </button>
                    </>
                  ))}
                </div>
              </div>

              {/* Markdown Toolbar (only in edit mode) */}
              {activePanel === 'content' && isEditing && (
                <MarkdownToolbar
                  onInsert={insertMarkdown}
                  onImageUpload={handleImageUpload}
                  uploading={uploadingImage}
                />
              )}

              {/* Content Area */}
              {activePanel === 'questions' ? (
                <TopicQuestionsWorkspace
                  selectedCat={selectedCat}
                  questions={shortTestQuestions}
                  visibleQuestions={visibleShortTestQuestions}
                  loadingQuestions={loadingQuestions}
                  search={questionSearch}
                  difficultyFilter={questionDifficultyFilter}
                  editingQuestionId={editingQuestionId}
                  questionForm={questionForm}
                  questionSaving={questionSaving}
                  onSearchChange={setQuestionSearch}
                  onDifficultyFilterChange={setQuestionDifficultyFilter}
                  onRefresh={() => fetchShortTestQuestions(selectedCat._id)}
                  onNewQuestion={handleNewQuestion}
                  onEditQuestion={handleEditQuestion}
                  onDuplicateQuestion={handleDuplicateQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onQuestionSubmit={handleQuestionSubmit}
                  onQuestionFormChange={handleQuestionFormChange}
                  onQuestionOptionChange={handleQuestionOptionChange}
                  onQuestionAddOption={handleQuestionAddOption}
                  onQuestionRemoveOption={handleQuestionRemoveOption}
                />
              ) : (
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                {/* Editor Pane */}
                {isEditing && (viewMode === 'editor' || viewMode === 'split') && (
                  <div className={`flex flex-col overflow-hidden min-h-[420px] lg:min-h-0 ${viewMode === 'split' ? 'w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-white/10' : 'w-full'}`}>
                    <div className="px-4 py-2 bg-black/20 border-b border-white/10 flex items-center gap-2">
                      <AlignLeft className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Markdown Editör</span>
                      <span className="ml-auto text-[10px] text-text-muted">{editContent.length} karakter</span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      className="flex-1 min-h-0 bg-transparent border-none outline-none text-white font-mono text-sm leading-relaxed resize-none p-4 sm:p-5 placeholder:text-white/20"
                      placeholder="# Ders başlığı&#10;&#10;İçeriğinizi buraya yazın..&#10;&#10;Görsel eklemek için toolbar'daki 📷 butonunu kullanın."
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                    />
                  </div>
                )}

                {/* Preview Pane / Read Mode */}
                {(!isEditing || viewMode === 'preview' || viewMode === 'split') && (
                  <div className={`flex flex-col min-h-0 overflow-y-auto custom-scrollbar ${isEditing && viewMode === 'split' ? 'w-full lg:w-1/2' : 'w-full'}`}>
                    {isEditing && (
                      <div className="px-4 py-2 bg-black/20 border-b border-white/10 flex items-center gap-2 sticky top-0 z-30 backdrop-blur-xl">
                        <Eye className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Canlı Önizleme</span>
                      </div>
                    )}

                    <div className="p-4 sm:p-6 xl:p-12 2xl:px-24">
                      {!isEditing && selectedHasDraft && (
                        <div className="max-w-4xl mx-auto mb-6 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                          <div className="flex items-start gap-3">
                            <Save className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" />
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-primary-light">
                                {getPublicationStatus(selectedCat) === 'draft' ? 'Yayınlanmamış taslak' : 'Taslak değişiklik'}
                              </p>
                              <p className="mt-1 text-xs font-semibold leading-relaxed text-text-secondary">
                                {getPublicationStatus(selectedCat) === 'draft'
                                  ? 'Bu içerik yayınlanana kadar kullanıcı tarafında görünmez.'
                                  : 'Bu önizleme taslak metni gösterir; kullanıcılar son yayınlanan sürümü görür.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedDisplayContent ? (
                        <div className="max-w-4xl mx-auto w-full">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {selectedDisplayContent}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
                            <BookOpen className="w-10 h-10 text-white/20" />
                          </div>
                          <p className="text-text-muted font-medium mb-2 text-sm">Bu konuya henüz ders içeriği metni eklenmemiş.</p>
                          <button
                            onClick={() => { setIsEditing(true); setViewMode('split'); }}
                            className="mt-4 rounded-xl border border-primary/30 bg-primary/15 px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-primary/25"
                          >
                            Ders İçeriği Yaz
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Kısa test yönetimine hızlı geçiş */}
                    {(!isEditing || viewMode === 'preview') && selectedCat && (
                      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 xl:px-12 2xl:px-24 pb-12 mt-8 sm:mt-10">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-accent" />
                                <p className="text-sm font-bold text-white">Konu Sonu Kısa Test</p>
                              </div>
                              <p className="mt-1 text-xs text-text-muted">
                                {loadingQuestions ? 'Sorular yükleniyor...' : `${shortTestQuestions.length} soru bağlı. Soruları alt alta görmek ve düzenlemek için çalışma alanını açın.`}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActivePanel('questions')}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-accent/10 hover:bg-accent-light"
                            >
                              <Edit3 className="h-4 w-4" /> Kısa Testi Yönet
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {(!isEditing || viewMode === 'preview') && selectedVersions.length > 0 && (
                      <ContentVersionHistory category={selectedCat} onLoadVersion={handleLoadVersion} />
                    )}

                  </div>
                )}
              </div>
              )}
            </>
          ) : (
            /* No selection state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Layers className="w-9 h-9 text-white/20" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Kategori Seçin</h3>
              <p className="text-text-muted text-sm max-w-xs">
                Sol panelden bir kategori seçerek içeriğini görüntüleyin ve düzenleyin.
              </p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* ── Category Settings Modal ─────────────────────────────────────────── */}
      <CategoryModal
        open={catModal.open}
        cat={catModal.cat}
        form={catForm}
        saving={catSaving}
        categories={contentCategories}
        onChange={setCatForm}
        onClose={() => setCatModal({ open: false, cat: null })}
        onSave={handleCatSave}
      />

      {/* ── Image Preview Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {previewImage && (
          <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminContent;
