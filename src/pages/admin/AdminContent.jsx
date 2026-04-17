import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle, Trash2, RefreshCw, FilePlus
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
const CategoryTreeItem = ({ cat, allCategories, selectedId, onSelect, onEdit, level = 0 }) => {
  const children = allCategories.filter(c => (c.parent?._id || c.parent) === cat._id);
  const hasChildren = children.length > 0;
  const isSelected = selectedId === cat._id;
  const [isOpen, setIsOpen] = useState(level < 1);

  return (
    <div className={level > 0 ? 'ml-3 border-l border-white/5 pl-2' : ''}>
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

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {children.map(child => (
              <CategoryTreeItem
                key={child._id}
                cat={child}
                allCategories={allCategories}
                selectedId={selectedId}
                onSelect={onSelect}
                onEdit={onEdit}
                level={level + 1}
              />
            ))}
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
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'preview' | 'editor'
  const [previewZoom, setPreviewZoom] = useState(false);

  // Image preview
  const [previewImage, setPreviewImage] = useState(null);

  // Category modal
  const [catModal, setCatModal] = useState({ open: false, cat: null });
  const [catForm, setCatForm] = useState({ name: '', description: '', color: '#6366f1', isPro: false, isActive: true, parent: null });
  const [catSaving, setCatSaving] = useState(false);

  const textareaRef = useRef(null);

  const selectedCat = allCategories.find(c => c._id === selectedCatId);

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    if (selectedCat) {
      setEditContent(selectedCat.content || '');
      setIsEditing(false);
    }
  }, [selectedCatId, allCategories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories/all');
      setAllCategories(res.data.data || []);
    } catch (err) {
      console.error('Kategoriler alınamadı:', err);
    } finally {
      setLoading(false);
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
      });
    } else {
      setCatForm({ name: '', description: '', color: '#6366f1', isPro: false, isActive: true, parent: selectedCatId });
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
  const rootCats = allCategories.filter(c => !c.parent?._id && !c.parent);
  const filteredRoots = searchTerm
    ? allCategories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : rootCats;

  // Custom markdown image renderer with click-to-zoom
  const markdownComponents = {
    img: ({ src, alt }) => {
      const resolvedSrc = resolveMediaUrl(src);
      return (
      <div className="my-4">
        <div
          className="relative group cursor-zoom-in inline-block max-w-full"
          onClick={() => setPreviewImage(resolvedSrc)}
        >
          <img
            src={resolvedSrc}
            alt={alt}
            className="max-w-full rounded-2xl border border-white/10 shadow-xl object-contain max-h-[500px]"
            onError={e => { e.target.style.opacity = '0.3'; }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
            <ZoomIn className="w-8 h-8 text-white" />
          </div>
        </div>
        {alt && <p className="text-xs text-text-muted mt-2 text-center italic">{alt}</p>}
      </div>
      );
    },
    h1: ({ children }) => <h1 className="text-2xl font-black text-white mt-8 mb-4 pb-2 border-b border-white/10">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-black text-white mt-6 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold text-primary-light mt-5 mb-2">{children}</h3>,
    p: ({ children }) => <p className="text-text-secondary leading-relaxed mb-4">{children}</p>,
    strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
    em: ({ children }) => <em className="text-primary-light">{children}</em>,
    code: ({ inline, children }) => inline
      ? <code className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary-light text-sm font-mono">{children}</code>
      : <code className="block bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-mono text-green-400 overflow-x-auto my-4">{children}</code>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/50 pl-4 my-4 italic text-text-secondary bg-primary/5 py-3 pr-4 rounded-r-xl">
        {children}
      </blockquote>
    ),
    ul: ({ children }) => <ul className="list-none space-y-1 mb-4">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-4 text-text-secondary">{children}</ol>,
    li: ({ children }) => (
      <li className="flex items-start gap-2 text-text-secondary">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
        <span>{children}</span>
      </li>
    ),
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="text-primary-light underline underline-offset-2 hover:text-white transition-colors">
        {children}
      </a>
    ),
    hr: () => <hr className="border-white/10 my-6" />,
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border border-white/10 bg-white/5 px-4 py-2 text-left font-black text-white">{children}</th>,
    td: ({ children }) => <td className="border border-white/10 px-4 py-2 text-text-secondary">{children}</td>,
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
              (searchTerm ? filteredRoots : rootCats).map(cat => (
                <CategoryTreeItem
                  key={cat._id}
                  cat={cat}
                  allCategories={allCategories}
                  selectedId={selectedCatId}
                  onSelect={setSelectedCatId}
                  onEdit={openCatModal}
                  level={0}
                />
              ))
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

                {/* Preview Pane */}
                {(!isEditing || viewMode === 'preview' || viewMode === 'split') && (
                  <div className={`flex flex-col overflow-hidden ${isEditing && viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                    {isEditing && (
                      <div className="px-4 py-2 bg-black/20 border-b border-white/5 flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Canlı Önizleme</span>
                      </div>
                    )}
                    <div className="flex-1 overflow-y-auto p-6 xl:p-10">
                      {(isEditing ? editContent : selectedCat?.content) ? (
                        <div className="max-w-3xl mx-auto">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={markdownComponents}
                          >
                            {isEditing ? editContent : (selectedCat?.content || '')}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                          <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center mb-6">
                            <BookOpen className="w-10 h-10 text-white/10" />
                          </div>
                          <p className="text-text-muted font-medium mb-2">Bu kategori için henüz içerik eklenmemiş.</p>
                          <button
                            onClick={() => { setIsEditing(true); setViewMode('split'); }}
                            className="mt-4 px-6 py-2.5 bg-primary/20 text-primary-light border border-primary/30 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all"
                          >
                            + İçerik Ekle
                          </button>
                        </div>
                      )}
                    </div>
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
