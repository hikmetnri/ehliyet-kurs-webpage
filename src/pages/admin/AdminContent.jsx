import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Loader2, Search, Plus, Layers,
  Eye, EyeOff, Crown, Settings2, FileText,
  X, Save, Type, ChevronRight, ArrowLeft,
  FolderOpen, BookOpen, Bold, Italic,
  List, Link as LinkIcon, Image as ImageIcon,
  Heading1, Heading2, Quote, Edit3, Check, RotateCcw,
  ChevronDown, Folder, Hash, AlignLeft, Code,
  Minus, UploadCloud, ZoomIn, ZoomOut, Maximize2,
  PanelLeft, PanelRight, SplitSquareVertical,
  AlertCircle, Trash2, RefreshCw, FilePlus, ExternalLink, Activity, GripVertical
} from 'lucide-react';

// ─── Media URL Helpers ──────────────────────────────────────────────────────
const API_BASE = 'http://localhost:3000';

// AdminExams ile aynı mantık: Flutter asset yollarını tam URL'ye çevirir
// DB'de: "assets/images/signs/Tanzim_TT/tt-1.png"
// Web'de: "http://localhost:3000/signs/Tanzim_TT/tt-1.png"
const resolveMediaUrl = (src) => {
  if (!src) return src;
  if (src.startsWith('http')) return src;                        // zaten tam URL
  if (src.startsWith('/uploads/')) return `${API_BASE}${src}`;   // yüklenen dosya
  if (src.startsWith('assets/images/signs/')) {                  // Flutter sign asset
    const signPath = src.replace('assets/images/signs/', '');
    return `${API_BASE}/signs/${signPath}`;
  }
  if (src.startsWith('assets/images/')) {                        // diğer Flutter asset'leri
    const assetPath = src.replace('assets/images/', '');
    return `${API_BASE}/images/${assetPath}`;
  }
  if (src.startsWith('assets/content/')) {                       // döküman içerikleri resimleri
    const contentPath = src.replace('assets/content/', '');
    return `${API_BASE}/content/${contentPath}`;
  }
  return `${API_BASE}/${src}`;
};

const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append('image', file);
  const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data.url || res.data.path || '';
};

// ─── Markdown Toolbar ───────────────────────────────────────────────────────
const MarkdownToolbar = ({ onInsert, onImageUpload, uploading }) => {
  const tools = [
    { icon: Bold, label: 'Kalın', action: () => onInsert('**', '**') },
    { icon: Italic, label: 'İtalik', action: () => onInsert('*', '*') },
    { type: 'sep' },
    { icon: Heading1, label: 'Başlık 1', action: () => onInsert('# ', '') },
    { icon: Heading2, label: 'Başlık 2', action: () => onInsert('## ', '') },
    { type: 'sep' },
    { icon: List, label: 'Liste', action: () => onInsert('- ', '') },
    { icon: Hash, label: 'Numaralı Liste', action: () => onInsert('1. ', '') },
    { icon: Quote, label: 'Alıntı', action: () => onInsert('> ', '') },
    { type: 'sep' },
    { icon: Code, label: 'Kod', action: () => onInsert('`', '`') },
    { icon: Minus, label: 'Yatay Çizgi', action: () => onInsert('\n---\n', '') },
    { icon: LinkIcon, label: 'Bağlantı', action: () => onInsert('[', '](url)') },
  ];

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 bg-black/20 border-b border-white/5">
      {tools.map((tool, i) =>
        tool.type === 'sep' ? (
          <div key={i} className="w-px h-5 bg-white/10 mx-1" />
        ) : (
          <button
            key={i}
            type="button"
            onClick={tool.action}
            title={tool.label}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <tool.icon className="w-4 h-4" />
          </button>
        )
      )}
      {/* Image upload button */}
      <div className="w-px h-5 bg-white/10 mx-1" />
      <label className={`p-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 text-xs font-bold
        ${uploading ? 'text-primary-light animate-pulse' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
        title="Görsel Yükle">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageUpload}
        />
      </label>
    </div>
  );
};

// ─── Category Tree Item ─────────────────────────────────────────────────────
const CategoryTreeItem = ({ cat, allCategories, selectedId, onSelect, onEdit, onReorder, level = 0 }) => {
  const children = allCategories
    .filter(c => (c.parent?._id || c.parent) === cat._id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
    
  const hasChildren = children.length > 0;
  const isSelected = selectedId === cat._id;
  const [isOpen, setIsOpen] = useState(level < 1);

  return (
    <div className={level > 0 ? 'ml-3 border-l border-white/5 pl-2' : ''}>
      <Reorder.Item 
        value={cat}
        id={cat._id}
        className="relative"
      >
        <div
          className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-0.5
            ${isSelected
              ? 'bg-primary/20 border border-primary/30 text-white'
              : 'hover:bg-white/5 text-text-secondary hover:text-white border border-transparent'}`}
          onClick={() => {
            onSelect(cat._id);
            if (hasChildren) setIsOpen(o => !o);
          }}
        >
          {/* DRAG HANDLE */}
          <div className="opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-white/10 rounded-md transition-all">
             <GripVertical className="w-3 h-3" />
          </div>

          {hasChildren ? (
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }} className="shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            </motion.div>
          ) : (
            <div className="w-3.5 h-3.5 shrink-0" />
          )}

          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white"
            style={{ backgroundColor: cat.color || '#6366f1' }}
          >
            {hasChildren ? <Folder className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
          </div>

          <span className={`flex-1 text-sm font-semibold truncate ${isSelected ? 'text-white' : ''}`}>
            {cat.name}
          </span>

          {!cat.isActive && (
            <span className="text-[9px] font-black text-danger/60 uppercase bg-danger/10 px-1.5 py-0.5 rounded-md">
              GİZLİ
            </span>
          )}
          {cat.isPro && <Crown className="w-3 h-3 text-warning/60 shrink-0" />}

          <button
            onClick={e => { e.stopPropagation(); onEdit(cat); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/10 text-white/30 hover:text-white transition-all shrink-0"
          >
            <Settings2 className="w-3 h-3" />
          </button>
        </div>
      </Reorder.Item>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
             <Reorder.Group 
               axis="y" 
               values={children} 
               onReorder={(newOrder) => onReorder(cat._id, newOrder)}
               className="space-y-0.5"
             >
                {children.map(child => (
                  <CategoryTreeItem
                    key={child._id}
                    cat={child}
                    allCategories={allCategories}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onEdit={onEdit}
                    onReorder={onReorder}
                    level={level + 1}
                  />
                ))}
             </Reorder.Group>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Image Preview Modal ────────────────────────────────────────────────────
const ImagePreviewModal = ({ src, onClose }) => (
  <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8" onClick={onClose}>
    <motion.img
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      src={src}
      alt="Büyük görsel"
      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
      onClick={e => e.stopPropagation()}
    />
    <button
      onClick={onClose}
      className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
    >
      <X className="w-6 h-6" />
    </button>
  </div>
);

// ─── Main AdminContent Component ────────────────────────────────────────────
const AdminContent = () => {
  const navigate = useNavigate();
  const [allCategories, setAllCategories] = useState([]);
  const [shortTestQuestions, setShortTestQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState('split');
  // New Test Modal State
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [newTestForm, setNewTestForm] = useState({ name: '', duration: '15' }); // 'split' | 'preview' | 'editor'
  const [previewZoom, setPreviewZoom] = useState(false);

  // Image preview
  const [previewImage, setPreviewImage] = useState(null);

  // Category modal
  const [catModal, setCatModal] = useState({ open: false, cat: null });
  const [catForm, setCatForm] = useState({ name: '', description: '', color: '#6366f1', isPro: false, isActive: true, parent: null, image: '' });
  const [catSaving, setCatSaving] = useState(false);

  const textareaRef = useRef(null);

  const selectedCat = allCategories.find(c => c._id === selectedCatId);

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    if (selectedCat) {
      setEditContent(selectedCat.content || '');
      setIsEditing(false);
      fetchShortTestQuestions(selectedCat._id);
    }
  }, [selectedCatId, allCategories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const catRes = await api.get('/categories/all');
      setAllCategories(catRes.data.data || []);
    } catch (err) {
      console.error('Kategoriler alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortTestQuestions = async (catId) => {
    if (!catId) return;
    setLoadingQuestions(true);
    try {
      const res = await api.get('/questions', { params: { testType: 'short_test', category: catId } });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setShortTestQuestions(data.filter(q => (q.category?._id || q.category) === catId));
    } catch (err) {
      console.error('Sorular alınamadı:', err);
    } finally {
      setLoadingQuestions(false);
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
      const orders = newOrder.map((cat, index) => ({
        id: cat._id,
        order: index,
        parent: parentId // usually same
      }));
      await api.put('/categories/reorder', { orders });
    } catch (err) {
      console.error('Sıralama kaydedilemedi:', err);
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
      const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
      insertMarkdown(`\n![${file.name}](${fullUrl})\n`, '');
    } catch {
      alert('Görsel yüklenemedi.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // ── Save content ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedCatId) return;
    setSaveLoading(true);
    try {
      await api.put(`/categories/${selectedCatId}`, { ...selectedCat, content: editContent });
      await fetchCategories();
      setIsEditing(false);
    } catch {
      alert('İçerik kaydedilemedi.');
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Short Test Question Handlers ─────────────────────────────────────────
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [questionForm, setQuestionForm] = useState({ text: '', options: ['', '', '', ''], correctAnswer: 0, difficulty: 'medium' });
  const [questionSaving, setQuestionSaving] = useState(false);

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Bu soruyu silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/questions/${qId}`);
      fetchShortTestQuestions(selectedCatId);
    } catch (err) {
      alert('Soru silinemedi: ' + err.message);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const filled = questionForm.options.filter(o => o.trim());
    if (!questionForm.text.trim() || filled.length < 2) {
      alert('Soru metni ve en az 2 şık zorunludur.'); return;
    }
    setQuestionSaving(true);
    try {
      await api.post('/questions', {
        text: questionForm.text.trim(),
        options: questionForm.options.filter(o => o.trim()),
        correctAnswer: questionForm.correctAnswer,
        difficulty: questionForm.difficulty,
        testType: 'short_test',
        category: selectedCatId,
      });
      setShowAddQuestionModal(false);
      setQuestionForm({ text: '', options: ['', '', '', ''], correctAnswer: 0, difficulty: 'medium' });
      fetchShortTestQuestions(selectedCatId);
    } catch (err) {
      alert('Soru eklenemedi: ' + (err.response?.data?.message || err.message));
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
      if (catModal.cat) {
        await api.put(`/categories/${catModal.cat._id}`, catForm);
      } else {
        await api.post('/categories', catForm);
      }
      await fetchCategories();
      setCatModal({ open: false, cat: null });
    } catch {
      alert('Hata oluştu.');
    } finally {
      setCatSaving(false);
    }
  };

  const handleToggleActive = async (cat) => {
    await api.put(`/categories/${cat._id}`, { ...cat, isActive: !cat.isActive });
    setAllCategories(prev => prev.map(c => c._id === cat._id ? { ...c, isActive: !cat.isActive } : c));
  };

  // Root categories for tree
  const rootCats = allCategories
    .filter(c => !c.parent?._id && !c.parent)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const filteredRoots = searchTerm
    ? allCategories
        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    : rootCats;

  // Custom markdown image renderer with click-to-zoom and extremely premium typography
  const markdownComponents = {
    img: ({ src, alt }) => {
      const resolvedSrc = resolveMediaUrl(src);
      return (
      <div className="my-10 w-full max-w-4xl mx-auto group">
        <div
          className="relative cursor-zoom-in rounded-[32px] p-2 bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.01] overflow-hidden"
          onClick={() => setPreviewImage(resolvedSrc)}
        >
          <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-50 transition-all duration-700"></div>
          <img
            src={resolvedSrc}
            alt={alt}
            className="w-full h-auto rounded-[24px] object-cover relative z-10"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px] flex items-center justify-center z-20">
            <ZoomIn className="w-10 h-10 text-white" />
          </div>
        </div>
        {alt && <p className="text-[11px] text-text-muted mt-4 text-center font-bold tracking-widest uppercase">{alt}</p>}
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
      <blockquote className="relative border-l-4 border-primary pl-6 my-8 py-4 bg-gradient-to-r from-primary/10 to-transparent rounded-r-2xl overflow-hidden group">
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
        <span className="mt-2 w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary group-hover:scale-125 transition-all shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
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

  const hasUnsaved = isEditing && editContent !== (selectedCat?.content || '');

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">İçerik Kütüphanesi</h1>
          <p className="text-text-secondary text-sm mt-1">Ders içeriklerini ve kategori yapısını yönetin.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCategories()}
            className="p-2.5 rounded-xl hover:bg-white/5 border border-white/10 text-text-muted hover:text-white transition-all"
            title="Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => openCatModal()}
            className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-xl transition-all font-bold text-sm shadow-lg shadow-primary/20"
          >
            <FilePlus className="w-4 h-4" /> Yeni Kategori
          </button>
        </div>
      </div>

      {/* ── Main Split Layout ─────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-1 overflow-hidden" style={{ minHeight: '600px' }}>

        {/* LEFT: Category Tree Panel */}
        <div className="w-64 xl:w-72 shrink-0 flex flex-col bg-bg-card border border-white/5 rounded-2xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-white/5">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 gap-2">
              <Search className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Kategori ara..."
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/30"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')}>
                  <X className="w-3.5 h-3.5 text-text-muted" />
                </button>
              )}
            </div>
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredRoots.length === 0 ? (
              <div className="py-10 text-center text-text-muted text-sm">
                <Folder className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>Kategori bulunamadı.</p>
              </div>
            ) : (
              <Reorder.Group 
                axis="y" 
                values={searchTerm ? filteredRoots : rootCats} 
                onReorder={(newOrder) => handleReorder(null, newOrder)}
                className="space-y-0.5"
              >
                {(searchTerm ? filteredRoots : rootCats).map(cat => (
                  <CategoryTreeItem
                    key={cat._id}
                    cat={cat}
                    allCategories={allCategories}
                    selectedId={selectedCatId}
                    onSelect={setSelectedCatId}
                    onEdit={openCatModal}
                    onReorder={handleReorder}
                    level={0}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/5 text-[10px] text-text-muted font-bold uppercase tracking-widest text-center">
            {allCategories.length} Kategori
          </div>
        </div>

        {/* RIGHT: Content Panel */}
        <div className="flex-1 flex flex-col bg-bg-card border border-white/5 rounded-2xl overflow-hidden min-w-0">
          {selectedCat ? (
            <>
              {/* Content Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between gap-3 bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: selectedCat.color || '#6366f1' }}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-white truncate">{selectedCat.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      {selectedCat.isPro && (
                        <span className="text-[9px] font-black text-warning uppercase bg-warning/10 px-1.5 py-0.5 rounded-md border border-warning/20">PRO</span>
                      )}
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border
                        ${selectedCat.isActive
                          ? 'text-success bg-success/10 border-success/20'
                          : 'text-danger bg-danger/10 border-danger/20'}`}>
                        {selectedCat.isActive ? 'AKTİF' : 'GİZLİ'}
                      </span>
                      {hasUnsaved && (
                        <span className="text-[9px] font-black text-warning uppercase bg-warning/10 px-1.5 py-0.5 rounded-md border border-warning/20 animate-pulse">
                          ● KAYDEDİLMEDİ
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* View mode toggle */}
                  {isEditing && (
                    <div className="flex p-0.5 bg-white/5 border border-white/10 rounded-xl">
                      {[
                        { id: 'editor', icon: AlignLeft, label: 'Editör' },
                        { id: 'split', icon: SplitSquareVertical, label: 'Split' },
                        { id: 'preview', icon: Eye, label: 'Önizleme' },
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => setViewMode(m.id)}
                          title={m.label}
                          className={`p-2 rounded-lg transition-all ${viewMode === m.id
                            ? 'bg-primary/20 text-primary-light'
                            : 'text-text-muted hover:text-white'}`}
                        >
                          <m.icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => openCatModal(selectedCat)}
                    className="p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all border border-white/10"
                    title="Kategori Ayarları"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleActive(selectedCat)}
                    className={`p-2 rounded-xl transition-all border ${selectedCat.isActive
                      ? 'hover:bg-danger/10 text-text-muted hover:text-danger border-white/10'
                      : 'bg-success/10 text-success border-success/20'}`}
                    title={selectedCat.isActive ? 'Gizle' : 'Göster'}
                  >
                    {selectedCat.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {isEditing ? (
                    <>
                      <button
                        onClick={() => { setIsEditing(false); setEditContent(selectedCat.content || ''); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-all text-xs font-bold border border-white/10"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> İptal
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success text-white text-xs font-black shadow-lg shadow-success/20 hover:-translate-y-0.5 transition-all disabled:opacity-60"
                      >
                        {saveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Kaydet
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setIsEditing(true); setViewMode('split'); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/20 text-primary-light border border-primary/30 hover:bg-primary hover:text-white text-xs font-black transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> İçeriği Düzenle
                    </button>
                  )}
                </div>
              </div>

              {/* Markdown Toolbar (only in edit mode) */}
              {isEditing && (
                <MarkdownToolbar
                  onInsert={insertMarkdown}
                  onImageUpload={handleImageUpload}
                  uploading={uploadingImage}
                />
              )}

              {/* Content Area */}
              <div className="flex-1 flex overflow-hidden">
                {/* Editor Pane */}
                {isEditing && (viewMode === 'editor' || viewMode === 'split') && (
                  <div className={`flex flex-col overflow-hidden ${viewMode === 'split' ? 'w-1/2 border-r border-white/5' : 'w-full'}`}>
                    <div className="px-4 py-2 bg-black/20 border-b border-white/5 flex items-center gap-2">
                      <AlignLeft className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Markdown Editör</span>
                      <span className="ml-auto text-[10px] text-text-muted">{editContent.length} karakter</span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm leading-relaxed resize-none p-5 placeholder:text-white/20"
                      placeholder="# Ders başlığı&#10;&#10;İçeriğinizi buraya yazın..&#10;&#10;Görsel eklemek için toolbar'daki 📷 butonunu kullanın."
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                    />
                  </div>
                )}

                {/* Preview Pane / Read Mode */}
                {(!isEditing || viewMode === 'preview' || viewMode === 'split') && (
                  <div className={`flex flex-col overflow-y-auto custom-scrollbar ${isEditing && viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                    {isEditing && (
                      <div className="px-4 py-2 bg-black/20 border-b border-white/5 flex items-center gap-2 sticky top-0 z-30 backdrop-blur-xl">
                        <Eye className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Canlı Önizleme</span>
                      </div>
                    )}
                    
                    <div className="p-6 xl:p-12 2xl:px-24">
                      {selectedCat?.image && (
                        <div className="mb-10 max-w-4xl mx-auto">
                          <img 
                            src={resolveMediaUrl(selectedCat.image)} 
                            alt={selectedCat.name} 
                            className="w-full h-auto rounded-[24px] object-cover shadow-2xl border border-white/10 max-h-[300px]"
                          />
                        </div>
                      )}
                      {(isEditing ? editContent : selectedCat?.content) ? (
                        <div className="max-w-4xl mx-auto w-full">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={markdownComponents}
                          >
                            {isEditing ? editContent : (selectedCat?.content || '')}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="w-24 h-24 rounded-[32px] border border-white/10 bg-white/5 shadow-2xl flex items-center justify-center mb-6">
                            <BookOpen className="w-10 h-10 text-white/20" />
                          </div>
                          <p className="text-text-muted font-medium mb-2 text-sm">Bu konuya henüz ders içeriği metni eklenmemiş.</p>
                          <button
                            onClick={() => { setIsEditing(true); setViewMode('split'); }}
                            className="mt-4 px-6 py-3 bg-gradient-to-br from-primary to-accent text-white rounded-xl text-xs uppercase tracking-widest font-black shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02]"
                          >
                            Ders İçeriği Yaz
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Konu Sonu Kısa Test Soruları */}
                    {(!isEditing || viewMode === 'preview') && selectedCat && (
                      <div className="max-w-4xl mx-auto w-full px-6 xl:px-12 2xl:px-24 pb-12 mt-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-bg-dark">
                                <Activity className="w-3.5 h-3.5 text-accent" />
                                <span className="text-[10px] font-black tracking-widest uppercase text-white/50">Konu Sonu Kısa Test Soruları</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        </div>

                        <div className="glass-card p-6 rounded-3xl border border-white/5 shadow-2xl bg-black/20 space-y-4">
                          {/* Header row */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-white">
                                {loadingQuestions ? 'Yükleniyor...' : `${shortTestQuestions.length} Soru`}
                              </p>
                              <p className="text-[10px] text-text-muted mt-0.5">Bu konuyu bitiren kullanıcı bu soruları çözecek. Flutter otomatik olarak gösterir.</p>
                            </div>
                            <button
                              onClick={() => setShowAddQuestionModal(true)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-lg shadow-accent/20"
                            >
                              <Plus className="w-4 h-4" /> Soru Ekle
                            </button>
                          </div>

                          {/* Questions list */}
                          {loadingQuestions ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-accent" />
                            </div>
                          ) : shortTestQuestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                              <BookOpen className="w-10 h-10 text-white/10 mb-3" />
                              <p className="text-sm text-text-muted">Bu konuya henüz kısa test sorusu eklenmemiş.</p>
                              <button
                                onClick={() => setShowAddQuestionModal(true)}
                                className="mt-3 text-xs text-accent font-bold hover:underline"
                              >
                                + İlk soruyu ekleyerek başlayın
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {shortTestQuestions.map((q, idx) => (
                                <div key={q._id} className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-[11px] font-black text-white/30">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{q.text}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        q.difficulty === 'easy' ? 'bg-success/10 text-success' :
                                        q.difficulty === 'hard' ? 'bg-danger/10 text-danger' :
                                        'bg-warning/10 text-warning'
                                      }`}>
                                        {q.difficulty === 'easy' ? 'Kolay' : q.difficulty === 'hard' ? 'Zor' : 'Orta'}
                                      </span>
                                      <span className="text-[10px] text-text-muted">{q.options?.length || 0} Şık</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteQuestion(q._id)}
                                    className="w-8 h-8 rounded-lg bg-danger/0 hover:bg-danger/10 text-transparent hover:text-danger flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </>
          ) : (
            /* No selection state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Layers className="w-9 h-9 text-white/20" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">Kategori Seçin</h3>
              <p className="text-text-muted text-sm max-w-xs">
                Sol panelden bir kategori seçerek içeriğini görüntüleyin ve düzenleyin.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Category Settings Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {catModal.open && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: catForm.color || '#6366f1' }}
                  >
                    {catModal.cat ? <Settings2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className="font-black text-white text-sm">{catModal.cat ? 'Kategori Ayarları' : 'Yeni Kategori'}</h2>
                    <p className="text-[11px] text-text-muted">{catModal.cat?.name || 'Yeni öğe oluştur'}</p>
                  </div>
                </div>
                <button onClick={() => setCatModal({ open: false, cat: null })} className="p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Kategori Adı *</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-primary/50 transition-all"
                    placeholder="Kategori adı..."
                    value={catForm.name}
                    onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Kısa Açıklama</label>
                  <textarea
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 transition-all resize-none placeholder:text-white/20"
                    placeholder="Kısa açıklama..."
                    value={catForm.description}
                    onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Kapak Görseli Yolu</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 transition-all font-mono"
                    placeholder="Örn: assets/content/motor.png"
                    value={catForm.image}
                    onChange={e => setCatForm(f => ({ ...f, image: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Üst Kategori</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-primary/50 transition-all"
                    value={catForm.parent || ''}
                    onChange={e => setCatForm(f => ({ ...f, parent: e.target.value || null }))}
                  >
                    <option value="" className="bg-bg-card">(Root — Ana Dizin)</option>
                    {allCategories.filter(c => c._id !== catModal.cat?._id).map(c => (
                      <option key={c._id} value={c._id} className="bg-bg-card">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Renk</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        className="w-12 h-10 bg-transparent cursor-pointer rounded-xl border-none"
                        value={catForm.color}
                        onChange={e => setCatForm(f => ({ ...f, color: e.target.value }))}
                      />
                      <span className="text-sm text-text-secondary font-mono">{catForm.color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Durum</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCatForm(f => ({ ...f, isActive: !f.isActive }))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all ${catForm.isActive
                          ? 'bg-success/10 border-success/30 text-success'
                          : 'bg-danger/10 border-danger/30 text-danger'}`}
                      >
                        {catForm.isActive ? '✓ Aktif' : '✗ Gizli'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCatForm(f => ({ ...f, isPro: !f.isPro }))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all ${catForm.isPro
                          ? 'bg-warning/10 border-warning/30 text-warning'
                          : 'bg-white/5 border-white/10 text-text-muted'}`}
                      >
                        {catForm.isPro ? '💎 PRO' : '🔓 Free'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-white/5 flex items-center justify-end gap-3">
                <button onClick={() => setCatModal({ open: false, cat: null })} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">İptal</button>
                <button
                  onClick={handleCatSave}
                  disabled={catSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-60"
                >
                  {catSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {catModal.cat ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Sınav Oluşturma Hızlı Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showNewTestModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-bg-card border border-white/10 rounded-3xl shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">Hızlı Test Oluştur</h3>
                  <p className="text-[10px] text-text-muted">Bulunduğun konuya eklenecektir.</p>
                </div>
              </div>
              
              <form onSubmit={handleCreateMiniTest} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary mb-2 block">Test Adı</label>
                  <input 
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-accent/50 transition-all"
                    placeholder="Örn: Trafik Adabı Tarama Testi"
                    value={newTestForm.name}
                    onChange={e => setNewTestForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary mb-2 block">Süre (Dakika)</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-accent/50 transition-all"
                    value={newTestForm.duration}
                    onChange={e => setNewTestForm(f => ({ ...f, duration: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                  <button type="button" onClick={() => setShowNewTestModal(false)} className="text-xs font-bold text-text-muted hover:text-white px-3 transition-colors">İptal</button>
                  <button 
                    type="submit"
                    disabled={saveLoading || !newTestForm.name.trim()}
                    className="px-6 py-3 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-light transition-all disabled:opacity-50 shadow-xl shadow-accent/20"
                  >
                    {saveLoading ? 'Oluşturuluyor...' : 'Oluştur'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Soru Ekle Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddQuestionModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-bg-card border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Kısa Test Sorusu Ekle</h3>
                  <p className="text-[10px] text-text-muted">{selectedCat?.name} konusuna eklenecek</p>
                </div>
                <button onClick={() => setShowAddQuestionModal(false)} className="ml-auto p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddQuestion} className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Soru metni */}
                <div>
                  <label className="text-xs font-bold text-text-secondary mb-2 block">Soru Metni *</label>
                  <textarea
                    autoFocus
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-accent/50 transition-all resize-none placeholder:text-white/20"
                    placeholder="Soruyu buraya yazın..."
                    value={questionForm.text}
                    onChange={e => setQuestionForm(f => ({ ...f, text: e.target.value }))}
                  />
                </div>

                {/* Şıklar */}
                <div>
                  <label className="text-xs font-bold text-text-secondary mb-2 block">Şıklar (Doğru şıkkı seçmek için soldaki butona tıklayın)</label>
                  <div className="space-y-2">
                    {questionForm.options.map((opt, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${questionForm.correctAnswer === i ? 'border-success/50 bg-success/5' : 'border-white/5 bg-white/[0.02]'}`}>
                        <button
                          type="button"
                          onClick={() => setQuestionForm(f => ({ ...f, correctAnswer: i }))}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs transition-all ${questionForm.correctAnswer === i ? 'bg-success text-white' : 'bg-white/10 text-white/30 hover:bg-white/20'}`}
                        >
                          {String.fromCharCode(65 + i)}
                        </button>
                        <input
                          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20"
                          placeholder={`${String.fromCharCode(65 + i)} şıkkını girin...`}
                          value={opt}
                          onChange={e => {
                            const opts = [...questionForm.options];
                            opts[i] = e.target.value;
                            setQuestionForm(f => ({ ...f, options: opts }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Zorluk */}
                <div>
                  <label className="text-xs font-bold text-text-secondary mb-2 block">Zorluk Seviyesi</label>
                  <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                    {[['easy','🟢 Kolay','bg-success'],['medium','🟡 Orta','bg-warning'],['hard','🔴 Zor','bg-danger']].map(([val, label, cls]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setQuestionForm(f => ({ ...f, difficulty: val }))}
                        className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${questionForm.difficulty === val ? `${cls} text-white` : 'text-text-muted hover:text-white'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                  <button type="button" onClick={() => setShowAddQuestionModal(false)} className="text-xs font-bold text-text-muted hover:text-white transition-colors px-3">İptal</button>
                  <button
                    type="submit"
                    disabled={questionSaving || !questionForm.text.trim()}
                    className="px-6 py-3 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-light transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
                  >
                    {questionSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
