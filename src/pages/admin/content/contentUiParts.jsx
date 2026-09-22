import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Loader2, Bold, Italic, UploadCloud,
  List, Link as LinkIcon,
  Heading1, Heading2, Quote, Code,
  ChevronRight, Folder, FileText,
  X, Crown, Settings2,
  GripVertical, History, Clock3, RotateCcw,
  Minus, Hash,
} from 'lucide-react';
import {
  QUESTION_DIFFICULTY_META,
  categoryHasDraft,
  getPublicationMeta,
  getContentVersions,
  formatContentDate,
} from './contentHelpers';

const MotionDiv = motion.div;
const MotionImg = motion.img;

// ─── Markdown Toolbar ───────────────────────────────────────────────────────
export const MarkdownToolbar = ({ onInsert, onImageUpload, uploading }) => {
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
    <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 bg-black/20 border-b border-white/10">
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
export const CategoryTreeItem = ({ cat, allCategories, selectedId, onSelect, onEdit, onReorder, level = 0 }) => {
  const children = allCategories
    .filter(c => (c.parent?._id || c.parent) === cat._id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const hasChildren = children.length > 0;
  const isSelected = selectedId === cat._id;
  const [isOpen, setIsOpen] = useState(level < 1);

  return (
    <div className={level > 0 ? 'ml-3 border-l border-white/10 pl-2' : ''}>
      <Reorder.Item
        value={cat}
        id={cat._id}
        className="relative"
      >
        <div
          className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all mb-0.5 border
            ${isSelected
              ? 'bg-primary/20 border-primary/30 text-white shadow-sm'
              : 'hover:bg-white/[0.04] text-text-secondary hover:text-white border-transparent'}`}
          onClick={() => {
            onSelect(cat._id);
            if (hasChildren) setIsOpen(o => !o);
          }}
        >
          {/* DRAG HANDLE */}
          <div className="opacity-0 group-hover:opacity-40 cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-white/10 rounded-xl transition-all">
             <GripVertical className="w-3 h-3" />
          </div>

          {hasChildren ? (
            <MotionDiv animate={{ rotate: isOpen ? 90 : 0 }} className="shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            </MotionDiv>
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
            <span className="text-[9px] font-bold text-danger/60 uppercase bg-danger/10 px-1.5 py-0.5 rounded-md">
              GİZLİ
            </span>
          )}
          {categoryHasDraft(cat) && (
            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${getPublicationMeta(cat).badge}`}>
              {getPublicationMeta(cat).shortLabel}
            </span>
          )}
          {cat.isPro && <Crown className="w-3 h-3 text-warning/60 shrink-0" />}

          <button
            onClick={e => { e.stopPropagation(); onEdit(cat); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all shrink-0"
          >
            <Settings2 className="w-3 h-3" />
          </button>
        </div>
      </Reorder.Item>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <MotionDiv
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
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Image Preview Modal ────────────────────────────────────────────────────
export const ImagePreviewModal = ({ src, onClose }) => (
  <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8" onClick={onClose}>
    <MotionImg
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

export const DifficultyPill = ({ difficulty }) => {
  const meta = QUESTION_DIFFICULTY_META[difficulty] || QUESTION_DIFFICULTY_META.medium;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.badge}`}>
      {meta.label}
    </span>
  );
};

export const ContentVersionHistory = ({ category, onLoadVersion }) => {
  const versions = getContentVersions(category).slice(0, 6);
  if (versions.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 xl:px-12 2xl:px-24 pb-12">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary-light" />
            <p className="text-sm font-bold text-white">Sürüm Geçmişi</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-text-muted">
            {versions.length}
          </span>
        </div>
        <div className="space-y-2">
          {versions.map((version, index) => (
            <div key={version._id || `${version.savedAt}-${index}`} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.015] p-3 sm:flex-row sm:items-center sm:justify-between hover:bg-white/[0.025] transition-all">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-bold text-text-muted">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatContentDate(version.savedAt || version.publishedAt)}
                </div>
                <p className="mt-1 line-clamp-1 text-xs font-semibold text-text-secondary">
                  {(version.content || '').replace(/\s+/g, ' ').slice(0, 140) || 'Boş içerik'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onLoadVersion(version.content || '')}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest text-primary-light transition-all hover:bg-primary hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Yükle
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
