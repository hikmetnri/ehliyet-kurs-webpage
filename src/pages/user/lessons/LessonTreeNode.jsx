import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, FileText, FolderOpen, Folder, CheckCircle2, ChevronRight } from 'lucide-react';
import { resolveMediaUrl } from '../../../utils/mediaUrl';

const MotionDiv = motion.div;

// Recursive Tree Node
export const TreeNode = ({ node, level = 0, selectedId, onSelect, expandedIds, toggleExpand, user, completedIds }) => {
  const hasChildren = node.children && node.children.length > 0;
  const hasContent = node.content && node.content.trim().length > 0;
  const isExpanded = expandedIds.has(node._id);
  const isSelected = selectedId === node._id;
  const isLocked = node.isPro && !user?.proStatus;
  const isCompleted = completedIds.includes(node._id);
  const statusLabel = hasContent ? 'Ders içeriği' : `${node.children?.length || 0} alt konu`;
  const visualLevel = Math.min(level, 2);
  const imageUrl = node.image ? resolveMediaUrl(node.image) : '';

  const handleClick = () => {
    if (isLocked) return;
    if (hasChildren) toggleExpand(node._id);
    if (hasContent) onSelect(node);
    else if (hasChildren) {/* already toggled */}
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 group
          ${isSelected
            ? 'border-l-4 border-l-primary border-y-white/5 border-r-white/5 bg-gradient-to-r from-primary/15 to-transparent text-white shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
            : 'border-l-4 border-l-transparent border-y-white/[0.02] border-r-white/[0.02] bg-white/[0.01] text-text-secondary hover:border-l-primary/35 hover:bg-white/[0.04] hover:text-white'
          }
          ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{ paddingLeft: `${12 + visualLevel * 8}px` }}
      >
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 ${
          isSelected
            ? 'bg-gradient-to-br from-primary/20 to-accent/20 border-primary/40 text-primary-light shadow-[0_0_12px_rgba(99,102,241,0.25)]'
            : 'bg-black/40 border-white/5 text-text-muted group-hover:border-white/15 group-hover:bg-black/25 group-hover:text-white'
        }`}>
          {isLocked ? (
            <Lock className="w-4 h-4 text-warning" />
          ) : imageUrl ? (
            <img src={imageUrl} alt="" className="w-full h-full rounded-lg object-cover" />
          ) : hasContent ? (
            <FileText className="w-4 h-4" />
          ) : isExpanded ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className={`block text-sm font-black leading-snug line-clamp-2 ${isCompleted && !isSelected ? 'text-success/80' : ''}`}>
            {node.name}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
            {statusLabel}
            {isCompleted && hasContent && <span className="text-success">Tamam</span>}
          </span>
        </span>

        <span className="flex items-center gap-2 shrink-0">
          {isCompleted && hasContent && (
            <CheckCircle2 className="w-4 h-4 text-success" />
          )}

          {node.isPro && (
            <span className="px-1.5 py-0.5 bg-warning/15 text-warning border border-warning/20 rounded text-[8px] font-black uppercase">PRO</span>
          )}

          {hasChildren && (
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${isSelected ? 'text-primary-light' : 'text-text-muted'}`}
            />
          )}
        </span>
      </button>

      {/* Children */}
      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <MotionDiv
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-1.5 space-y-1 border-l border-white/5 pl-2" style={{ marginLeft: `${18 + visualLevel * 8}px` }}>
              {node.children.map(child => (
                <TreeNode
                  key={child._id}
                  node={child}
                  level={level + 1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                  user={user}
                  completedIds={completedIds}
                />
              ))}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};
