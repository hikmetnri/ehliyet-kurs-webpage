import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ChevronRight, ChevronDown, Loader2,
  Search, Lock, Folder, FolderOpen, FileText, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import useAuthStore from '../../store/authStore';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
const resolveMediaUrl = (src) => {
  if (!src || src.startsWith('http')) return src;
  if (src.startsWith('assets/content/')) return `${API_BASE}/content/${src.replace('assets/content/', '')}`;
  if (src.startsWith('assets/images/')) return `${API_BASE}/images/${src.replace('assets/images/', '')}`;
  if (src.startsWith('assets/')) return `${API_BASE}/images/${src.replace('assets/', '')}`;
  return src;
};

// Build a tree from a flat list
const buildTree = (items, parentId = null) => {
  return items
    .filter(item => {
      const itemParent = item.parent?._id || item.parent || null;
      return itemParent === parentId;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(item => ({
      ...item,
      children: buildTree(items, item._id),
    }));
};

// Recursive Tree Node
const TreeNode = ({ node, level = 0, selectedId, onSelect, expandedIds, toggleExpand, user }) => {
  const hasChildren = node.children && node.children.length > 0;
  const hasContent = node.content && node.content.trim().length > 0;
  const isExpanded = expandedIds.has(node._id);
  const isSelected = selectedId === node._id;
  const isLocked = node.isPro && !user?.proStatus;

  const handleClick = () => {
    if (isLocked) return;
    if (hasChildren) toggleExpand(node._id);
    if (hasContent) onSelect(node);
    else if (hasChildren) {/* already toggled */}
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group
          ${isSelected
            ? 'bg-primary/15 text-primary-light border border-primary/25 shadow-sm'
            : 'hover:bg-white/5 text-text-secondary hover:text-white border border-transparent'
          }
          ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {/* Expand/collapse arrow for folders */}
        <span className="w-4 shrink-0 flex items-center justify-center">
          {hasChildren ? (
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${isSelected ? 'text-primary' : 'text-text-muted'}`}
            />
          ) : (
            <span className="w-3.5" />
          )}
        </span>

        {/* Icon */}
        <span className="shrink-0">
          {isLocked ? (
            <Lock className="w-4 h-4 text-warning" />
          ) : hasContent ? (
            <FileText className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-text-muted group-hover:text-white'}`} />
          ) : isExpanded ? (
            <FolderOpen className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-text-muted group-hover:text-white'}`} />
          ) : (
            <Folder className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-text-muted group-hover:text-white'}`} />
          )}
        </span>

        {/* Label */}
        <span className={`text-sm font-semibold truncate flex-1 ${isSelected ? 'text-primary-light font-bold' : ''}`}>
          {node.name}
        </span>

        {/* PRO badge */}
        {node.isPro && (
          <span className="shrink-0 px-1.5 py-0.5 bg-warning/15 text-warning border border-warning/20 rounded text-[8px] font-black uppercase">PRO</span>
        )}
      </button>

      {/* Children */}
      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={`mt-0.5 space-y-0.5 border-l border-white/5 ml-${4 + level * 4}`} style={{ marginLeft: `${20 + level * 16}px` }}>
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
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const UserLessons = () => {
  const { user } = useAuthStore();
  const [allCategories, setAllCategories] = useState([]);
  const [tree, setTree] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await api.get('/categories/all');
        const cats = res.data?.data || [];
        setAllCategories(cats);
        setTree(buildTree(cats));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((node) => {
    setSelectedLesson(node);
  }, []);

  // Filter tree based on search (returns matching nodes as flat list)
  const filteredFlat = searchTerm.trim()
    ? allCategories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : null;

  return (
    <div className="flex h-[calc(100vh-128px)] gap-0 overflow-hidden rounded-3xl border border-white/5 shadow-2xl glass-card bg-bg-card/60">
      
      {/* ─── LEFT: Category Tree Sidebar ─────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col border-r border-white/5 h-full">
        
        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Dersler</h2>
          </div>
          {/* Search */}
          <div className="flex items-center bg-black/30 border border-white/10 rounded-xl px-3 py-2 focus-within:border-primary/40 transition-colors">
            <Search className="w-3.5 h-3.5 text-text-muted mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Konu ara..."
              className="bg-transparent outline-none text-xs text-white placeholder-text-muted w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="ml-1">
                <X className="w-3 h-3 text-text-muted hover:text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Tree Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-primary mb-2" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Yükleniyor...</span>
            </div>
          ) : filteredFlat !== null ? (
            // Flat search results
            filteredFlat.length === 0 ? (
              <p className="text-xs text-text-muted italic text-center py-8">Sonuç bulunamadı.</p>
            ) : (
              filteredFlat.map(cat => (
                <button
                  key={cat._id}
                  disabled={cat.isPro && !user?.proStatus}
                  onClick={() => cat.content?.trim() && handleSelect(cat)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all
                    ${selectedLesson?._id === cat._id ? 'bg-primary/15 text-primary-light border border-primary/25' : 'hover:bg-white/5 text-text-secondary hover:text-white border border-transparent'}
                    ${cat.isPro && !user?.proStatus ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <FileText className="w-4 h-4 shrink-0 text-text-muted" />
                  <span className="text-sm font-medium truncate">{cat.name}</span>
                </button>
              ))
            )
          ) : (
            // Full tree
            tree.map(node => (
              <TreeNode
                key={node._id}
                node={node}
                level={0}
                selectedId={selectedLesson?._id}
                onSelect={handleSelect}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                user={user}
              />
            ))
          )}
        </div>
      </div>

      {/* ─── RIGHT: Content Reader ────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedLesson ? (
            <motion.div
              key={selectedLesson._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col h-full"
            >
              {/* Content Header */}
              <div className="px-8 py-5 border-b border-white/5 bg-gradient-to-r from-primary/10 via-transparent to-transparent flex items-center gap-5 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center shrink-0">
                  {selectedLesson.image ? (
                    <img src={resolveMediaUrl(selectedLesson.image)} alt="" className="w-8 h-8 object-contain" />
                  ) : (
                    <FileText className="w-6 h-6 text-primary-light" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-black text-white tracking-tight truncate">{selectedLesson.name}</h2>
                  {selectedLesson.description && (
                    <p className="text-xs text-text-muted mt-1 line-clamp-1">{selectedLesson.description}</p>
                  )}
                </div>
                {selectedLesson.isPro && (
                  <span className="px-3 py-1.5 bg-warning/10 border border-warning/20 text-warning rounded-xl text-[10px] font-black uppercase shrink-0">
                    PRO İçerik
                  </span>
                )}
              </div>

              {/* Markdown Body */}
              <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                {selectedLesson.isPro && !user?.proStatus ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-5">
                    <div className="w-24 h-24 rounded-[32px] border-2 border-dashed border-warning/30 flex items-center justify-center">
                      <Lock className="w-12 h-12 text-warning/30" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">PRO İçerik</h3>
                      <p className="text-text-muted text-sm max-w-sm mt-2 font-medium">
                        Bu ders içeriği yalnızca PRO üyelere açıktır. Mobil uygulamamız üzerinden premium üyelik edinebilirsiniz.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-3xl mx-auto
                    prose-headings:font-black prose-headings:tracking-tight prose-headings:text-white
                    prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-3
                    prose-p:text-white/85 prose-p:leading-relaxed
                    prose-strong:text-white prose-strong:font-black
                    prose-img:rounded-2xl prose-img:shadow-xl prose-img:border prose-img:border-white/10 prose-img:mx-auto
                    prose-li:text-white/85 prose-ul:space-y-1
                    prose-a:text-primary-light hover:prose-a:text-white prose-a:no-underline prose-a:font-semibold
                    prose-blockquote:border-l-primary prose-blockquote:text-text-secondary
                    prose-code:bg-white/5 prose-code:border prose-code:border-white/10 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-primary-light
                    prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl
                    prose-table:border-collapse prose-th:border prose-th:border-white/10 prose-th:bg-white/5 prose-th:p-3
                    prose-td:border prose-td:border-white/5 prose-td:p-3
                  ">
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw]}
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({ src, alt, ...props }) => (
                          <img
                            src={resolveMediaUrl(src)}
                            alt={alt || ''}
                            className="rounded-2xl shadow-xl border border-white/10 max-w-full my-6 mx-auto"
                          />
                        ),
                      }}
                    >
                      {selectedLesson.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-12"
            >
              <div className="w-28 h-28 rounded-[36px] bg-white/[0.03] border-2 border-dashed border-white/10 flex items-center justify-center mb-6">
                <BookOpen className="w-14 h-14 text-white/10" />
              </div>
              <h3 className="text-xl font-black text-white/60 tracking-tight">Bir ders seçin</h3>
              <p className="text-text-muted text-sm max-w-xs mt-2 font-medium leading-relaxed">
                Sol taraftaki menüden bir kategori veya ders seçerek okumaya başlayabilirsiniz.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default UserLessons;
