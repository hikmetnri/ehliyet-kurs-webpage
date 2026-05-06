import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import {
  Loader2, Search, Plus, Layers,
  Eye, EyeOff, Crown, Settings2, FileText,
  X, Save, ChevronRight,
  BookOpen, Bold, Italic,
  List, Link as LinkIcon, Image as ImageIcon,
  Heading1, Heading2, Quote, Edit3, Check, RotateCcw,
  ChevronDown, Folder, Hash, AlignLeft, Code,
  Minus, UploadCloud, ZoomIn,
  SplitSquareVertical,
  Trash2, RefreshCw, FilePlus, ExternalLink, Activity, GripVertical
} from 'lucide-react';
import { resolveMediaUrl } from '../../utils/mediaUrl';


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

const QUESTION_DIFFICULTY_META = {
  easy: { label: 'Kolay', badge: 'bg-success/10 text-success border-success/20', active: 'bg-success text-white shadow-success/20' },
  medium: { label: 'Orta', badge: 'bg-warning/10 text-warning border-warning/20', active: 'bg-warning text-white shadow-warning/20' },
  hard: { label: 'Zor', badge: 'bg-danger/10 text-danger border-danger/20', active: 'bg-danger text-white shadow-danger/20' },
};

const createQuestionForm = (question = null) => ({
  text: question?.text || '',
  options: question?.options?.length
    ? [...question.options, ...Array(Math.max(0, 4 - question.options.length)).fill('')]
    : ['', '', '', ''],
  correctAnswer: Number.isInteger(question?.correctAnswer) ? question.correctAnswer : 0,
  difficulty: question?.difficulty || 'medium',
  explanation: question?.explanation || '',
  media: question?.media || '',
});

const optionLabel = (index) => String.fromCharCode(65 + index);

const getQuestionPerformance = (question) => {
  const total = (question.correctCount || 0) + (question.wrongCount || 0);
  return {
    total,
    rate: total > 0 ? Math.round(((question.correctCount || 0) / total) * 100) : null,
  };
};

const DifficultyPill = ({ difficulty }) => {
  const meta = QUESTION_DIFFICULTY_META[difficulty] || QUESTION_DIFFICULTY_META.medium;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${meta.badge}`}>
      {meta.label}
    </span>
  );
};

const TopicQuestionCard = ({ question, index, active, onEdit, onDuplicate, onDelete }) => {
  const performance = getQuestionPerformance(question);

  return (
    <div className={`group rounded-2xl border bg-white/[0.02] transition-all ${active ? 'border-accent/40 bg-accent/5 shadow-xl shadow-accent/5' : 'border-white/5 hover:border-white/10'}`}>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          {question.media ? (
            <button
              type="button"
              onClick={() => onEdit(question)}
              className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30"
              title="Soruyu düzenle"
            >
              <img src={resolveMediaUrl(question.media)} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onEdit(question)}
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[11px] font-black text-white/30 hover:text-white"
              title="Soruyu düzenle"
            >
              {index + 1}
            </button>
          )}

          <button type="button" onClick={() => onEdit(question)} className="min-w-0 flex-1 text-left">
            <p className="break-words text-sm font-bold leading-relaxed text-white">{question.text}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DifficultyPill difficulty={question.difficulty} />
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-text-secondary">
                {question.options?.length || 0} Şık
              </span>
              {performance.rate !== null && (
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${performance.rate >= 50 ? 'border-success/20 bg-success/10 text-success' : 'border-danger/20 bg-danger/10 text-danger'}`}>
                  %{performance.rate} Başarı
                </span>
              )}
              {question.media && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary-light">
                  <ImageIcon className="h-2.5 w-2.5" /> Görselli
                </span>
              )}
            </div>
          </button>

          <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={() => onEdit(question)} title="Düzenle" className="rounded-lg p-2 text-text-muted hover:bg-primary/10 hover:text-primary-light">
              <Edit3 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => onDuplicate(question)} title="Kopyala" className="rounded-lg p-2 text-text-muted hover:bg-white/10 hover:text-white">
              <FilePlus className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => onDelete(question._id)} title="Sil" className="rounded-lg p-2 text-text-muted hover:bg-danger/10 hover:text-danger">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(question.options || []).map((option, i) => {
            const isCorrect = i === question.correctAnswer;
            return (
              <div key={`${question._id}-${i}`} className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs ${isCorrect ? 'border-success/30 bg-success/10 text-success' : 'border-white/5 bg-black/10 text-text-secondary'}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${isCorrect ? 'bg-success text-white' : 'bg-white/10 text-white/40'}`}>
                  {optionLabel(i)}
                </span>
                <span className="min-w-0 flex-1 break-words leading-snug">{option}</span>
                {isCorrect && <Check className="h-3.5 w-3.5 shrink-0" />}
              </div>
            );
          })}
        </div>

        {question.explanation && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs leading-relaxed text-primary-light">
            {question.explanation}
          </div>
        )}
      </div>
    </div>
  );
};

const TopicQuestionEditor = ({
  selectedCat,
  form,
  editingQuestionId,
  saving,
  onSubmit,
  onChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onReset,
}) => (
  <form onSubmit={onSubmit} className="flex h-full min-h-[620px] flex-col overflow-hidden rounded-2xl border border-white/5 bg-bg-card2/80">
    <div className="shrink-0 border-b border-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-accent">{selectedCat?.name}</p>
          <h3 className="mt-1 truncate text-base font-black text-white">
            {editingQuestionId ? 'Soruyu Düzenle' : 'Yeni Kısa Test Sorusu'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 rounded-xl border border-white/10 p-2 text-text-muted transition-all hover:bg-white/5 hover:text-white"
          title="Yeni soru"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>

    <div className="flex-1 space-y-5 overflow-y-auto p-4 custom-scrollbar">
      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-secondary">
          <FileText className="h-3.5 w-3.5 text-accent" /> Soru Metni
        </label>
        <textarea
          rows={4}
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium leading-relaxed text-white outline-none transition-all placeholder:text-white/20 focus:border-accent/50"
          placeholder="Soruyu buraya yazın..."
          value={form.text}
          onChange={e => onChange('text', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-secondary">
          <ImageIcon className="h-3.5 w-3.5 text-accent" /> Görsel Yolu
        </label>
        <input
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-xs text-white outline-none transition-all placeholder:text-white/20 focus:border-accent/50"
          placeholder="assets/signs/... veya https://..."
          value={form.media}
          onChange={e => onChange('media', e.target.value)}
        />
        {form.media && (
          <div className="mt-3 flex h-28 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <img src={resolveMediaUrl(form.media)} alt="Soru görseli" className="max-h-full max-w-full object-contain p-2" />
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-text-secondary">
            <Hash className="h-3.5 w-3.5 text-accent" /> Şıklar
          </label>
          {form.options.length < 6 && (
            <button type="button" onClick={onAddOption} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-accent hover:bg-accent/10 hover:text-white">
              <Plus className="h-3.5 w-3.5" /> Şık Ekle
            </button>
          )}
        </div>
        <div className="space-y-2">
          {form.options.map((option, i) => {
            const isCorrect = form.correctAnswer === i;
            return (
              <div key={i} className={`flex items-center gap-2 rounded-2xl border p-2.5 transition-all ${isCorrect ? 'border-success/40 bg-success/5' : 'border-white/5 bg-white/[0.02]'}`}>
                <button
                  type="button"
                  onClick={() => onChange('correctAnswer', i)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all ${isCorrect ? 'bg-success text-white shadow-lg shadow-success/20' : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'}`}
                  title="Doğru cevap"
                >
                  {isCorrect ? <Check className="h-4 w-4" /> : optionLabel(i)}
                </button>
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                  placeholder={`${optionLabel(i)} şıkkı`}
                  value={option}
                  onChange={e => onOptionChange(i, e.target.value)}
                />
                {form.options.length > 2 && (
                  <button type="button" onClick={() => onRemoveOption(i)} className="rounded-lg p-2 text-text-muted hover:bg-danger/10 hover:text-danger" title="Şıkkı sil">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-secondary">
          <Activity className="h-3.5 w-3.5 text-accent" /> Zorluk
        </label>
        <div className="flex rounded-2xl border border-white/10 bg-black/20 p-1">
          {Object.entries(QUESTION_DIFFICULTY_META).map(([value, meta]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange('difficulty', value)}
              className={`flex-1 rounded-xl py-2 text-xs font-black transition-all ${form.difficulty === value ? `${meta.active} shadow-lg` : 'text-text-muted hover:text-white'}`}
            >
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-bold text-text-secondary">
          <AlignLeft className="h-3.5 w-3.5 text-accent" /> Açıklama
        </label>
        <textarea
          rows={3}
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium leading-relaxed text-white outline-none transition-all placeholder:text-white/20 focus:border-accent/50"
          placeholder="Doğru cevabın kısa açıklaması..."
          value={form.explanation}
          onChange={e => onChange('explanation', e.target.value)}
        />
      </div>
    </div>

    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/5 p-4">
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-text-muted transition-all hover:bg-white/5 hover:text-white"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Temizle
      </button>
      <button
        type="submit"
        disabled={saving || !form.text.trim()}
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-light disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {editingQuestionId ? 'Güncelle' : 'Kaydet'}
      </button>
    </div>
  </form>
);

const TopicQuestionsWorkspace = ({
  selectedCat,
  questions,
  visibleQuestions,
  loadingQuestions,
  search,
  difficultyFilter,
  editingQuestionId,
  questionForm,
  questionSaving,
  onSearchChange,
  onDifficultyFilterChange,
  onRefresh,
  onNewQuestion,
  onEditQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onQuestionSubmit,
  onQuestionFormChange,
  onQuestionOptionChange,
  onQuestionAddOption,
  onQuestionRemoveOption,
}) => {
  const counts = {
    all: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
  };

  return (
    <div className="flex-1 overflow-y-auto bg-black/10 p-3 sm:p-4 custom-scrollbar">
      <div className="grid min-h-full grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-bg-card2/60">
          <div className="shrink-0 border-b border-white/5 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-accent">Konu Sonu Testi</p>
                <h3 className="mt-1 truncate text-lg font-black text-white">{selectedCat?.name}</h3>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={onRefresh}
                  className="rounded-xl border border-white/10 p-2.5 text-text-muted transition-all hover:bg-white/5 hover:text-white"
                  title="Soruları yenile"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingQuestions ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={onNewQuestion}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-light"
                >
                  <Plus className="h-4 w-4" /> Yeni Soru
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {[
                ['all', 'Toplam', counts.all],
                ['easy', 'Kolay', counts.easy],
                ['medium', 'Orta', counts.medium],
                ['hard', 'Zor', counts.hard],
              ].map(([key, label, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onDifficultyFilterChange(key)}
                  className={`rounded-xl border px-3 py-2 text-left transition-all ${difficultyFilter === key ? 'border-accent/40 bg-accent/10' : 'border-white/5 bg-black/20 hover:border-white/10'}`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</p>
                  <p className="mt-1 text-lg font-black text-white">{value}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-text-muted" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                placeholder="Soru, şık veya açıklama ara..."
                value={search}
                onChange={e => onSearchChange(e.target.value)}
              />
              {search && (
                <button type="button" onClick={() => onSearchChange('')} className="rounded-lg p-1 text-text-muted hover:bg-white/10 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {loadingQuestions ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-accent" />
              </div>
            ) : visibleQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
                <BookOpen className="mb-3 h-10 w-10 text-white/10" />
                <p className="text-sm font-bold text-text-secondary">
                  {questions.length === 0 ? 'Bu konuya henüz kısa test sorusu eklenmemiş.' : 'Filtreyle eşleşen soru bulunamadı.'}
                </p>
                <button type="button" onClick={onNewQuestion} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent/15 px-4 py-2 text-xs font-black text-accent hover:bg-accent hover:text-white">
                  <Plus className="h-4 w-4" /> Soru Ekle
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleQuestions.map((question, index) => (
                  <TopicQuestionCard
                    key={question._id}
                    question={question}
                    index={index}
                    active={editingQuestionId === question._id}
                    onEdit={onEditQuestion}
                    onDuplicate={onDuplicateQuestion}
                    onDelete={onDeleteQuestion}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <div className="2xl:sticky 2xl:top-0">
            <TopicQuestionEditor
              selectedCat={selectedCat}
              form={questionForm}
              editingQuestionId={editingQuestionId}
              saving={questionSaving}
              onSubmit={onQuestionSubmit}
              onChange={onQuestionFormChange}
              onOptionChange={onQuestionOptionChange}
              onAddOption={onQuestionAddOption}
              onRemoveOption={onQuestionRemoveOption}
              onReset={onNewQuestion}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [saveLoading, setSaveLoading] = useState(false);
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

  const selectedCat = allCategories.find(c => c._id === selectedCatId);

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    if (selectedCat) {
      setEditContent(selectedCat.content || '');
      setIsEditing(false);
      setEditingQuestionId(null);
      setQuestionForm(createQuestionForm());
      setQuestionSearch('');
      setQuestionDifficultyFilter('all');
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
      await api.delete(`/questions/${qId}`);
      if (editingQuestionId === qId) handleNewQuestion();
      await fetchShortTestQuestions(selectedCatId);
    } catch (err) {
      alert('Soru silinemedi: ' + (err.response?.data?.error || err.response?.data?.message || err.message));
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCatId) return;

    const filledOptions = questionForm.options
      .map((value, index) => ({ value: value.trim(), index }))
      .filter(option => option.value);

    if (!questionForm.text.trim() || filledOptions.length < 2) {
      alert('Soru metni ve en az 2 şık zorunludur.');
      return;
    }

    const correctAnswer = filledOptions.findIndex(option => option.index === questionForm.correctAnswer);
    if (correctAnswer === -1) {
      alert('Doğru cevap olarak seçilen şık boş olamaz.');
      return;
    }

    const payload = {
      text: questionForm.text.trim(),
      options: filledOptions.map(option => option.value),
      correctAnswer,
      difficulty: questionForm.difficulty,
      explanation: questionForm.explanation.trim(),
      media: questionForm.media.trim(),
      testType: 'short_test',
      category: selectedCatId,
    };

    setQuestionSaving(true);
    try {
      const res = editingQuestionId
        ? await api.put(`/questions/${editingQuestionId}`, payload)
        : await api.post('/questions', payload);

      await fetchShortTestQuestions(selectedCatId);

      if (editingQuestionId) {
        setQuestionForm(createQuestionForm(res.data));
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
            className="w-full h-auto rounded-[24px] object-contain relative z-10"
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
    <div className="flex flex-col h-full min-h-[calc(100vh-96px)] md:min-h-[calc(100vh-120px)]">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">İçerik Kütüphanesi</h1>
          <p className="text-text-secondary text-sm mt-1">Ders içeriklerini ve kategori yapısını yönetin.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchCategories()}
            className="p-2.5 rounded-xl hover:bg-white/5 border border-white/10 text-text-muted hover:text-white transition-all"
            title="Yenile"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => openCatModal()}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-xl transition-all font-bold text-sm shadow-lg shadow-primary/20"
          >
            <FilePlus className="w-4 h-4" /> Yeni Kategori
          </button>
        </div>
      </div>

      {/* ── Main Split Layout ─────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0 overflow-visible xl:overflow-hidden">

        {/* LEFT: Category Tree Panel */}
        <div className="w-full xl:w-72 shrink-0 flex flex-col bg-bg-card border border-white/5 rounded-2xl overflow-hidden max-h-[42vh] sm:max-h-[360px] xl:max-h-none">
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
          <div className="flex-1 min-h-0 overflow-y-auto p-2 custom-scrollbar">
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
        <div className="flex-1 flex flex-col bg-bg-card border border-white/5 rounded-2xl overflow-hidden min-w-0 min-h-[70vh] xl:min-h-0">
          {selectedCat ? (
            <>
              {/* Content Header */}
              <div className="p-3 sm:p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: selectedCat.color || '#6366f1' }}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-black text-white truncate">{selectedCat.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
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

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
                  <div className="flex p-0.5 bg-white/5 border border-white/10 rounded-xl shrink-0">
                    {[
                      { id: 'content', icon: BookOpen, label: 'Ders İçeriği', count: null },
                      { id: 'questions', icon: Activity, label: 'Kısa Test', count: shortTestQuestions.length },
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActivePanel(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all ${activePanel === item.id
                          ? 'bg-accent/20 text-accent'
                          : 'text-text-muted hover:text-white'}`}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{item.label}</span>
                        {item.count !== null && (
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activePanel === item.id ? 'bg-accent/20 text-accent-light' : 'bg-white/10 text-white/40'}`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* View mode toggle */}
                  {activePanel === 'content' && isEditing && (
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

                  {activePanel === 'content' && (isEditing ? (
                    <>
                      <button
                        onClick={() => { setIsEditing(false); setEditContent(selectedCat.content || ''); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-all text-xs font-bold border border-white/10 shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> İptal
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-success text-white text-xs font-black shadow-lg shadow-success/20 hover:-translate-y-0.5 transition-all disabled:opacity-60 shrink-0"
                      >
                        {saveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Kaydet
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setIsEditing(true); setViewMode('split'); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/20 text-primary-light border border-primary/30 hover:bg-primary hover:text-white text-xs font-black transition-all shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> İçeriği Düzenle
                    </button>
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
                  <div className={`flex flex-col overflow-hidden min-h-[420px] lg:min-h-0 ${viewMode === 'split' ? 'w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-white/5' : 'w-full'}`}>
                    <div className="px-4 py-2 bg-black/20 border-b border-white/5 flex items-center gap-2">
                      <AlignLeft className="w-3.5 h-3.5 text-white/30" />
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Markdown Editör</span>
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
                      <div className="px-4 py-2 bg-black/20 border-b border-white/5 flex items-center gap-2 sticky top-0 z-30 backdrop-blur-xl">
                        <Eye className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Canlı Önizleme</span>
                      </div>
                    )}
                    
                    <div className="p-4 sm:p-6 xl:p-12 2xl:px-24">
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

                    {/* Kısa test yönetimine hızlı geçiş */}
                    {(!isEditing || viewMode === 'preview') && selectedCat && (
                      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 xl:px-12 2xl:px-24 pb-12 mt-8 sm:mt-10">
                        <div className="rounded-2xl border border-white/5 bg-black/20 p-4 sm:p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-accent" />
                                <p className="text-sm font-black text-white">Konu Sonu Kısa Test</p>
                              </div>
                              <p className="mt-1 text-xs text-text-muted">
                                {loadingQuestions ? 'Sorular yükleniyor...' : `${shortTestQuestions.length} soru bağlı. Soruları alt alta görmek ve düzenlemek için çalışma alanını açın.`}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActivePanel('questions')}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent-light"
                            >
                              <Edit3 className="h-4 w-4" /> Kısa Testi Yönet
                            </button>
                          </div>
                        </div>
                      </div>
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
