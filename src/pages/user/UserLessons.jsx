import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, ChevronRight, ChevronDown, Loader2,
  Search, Lock, Folder, FolderOpen, FileText, X,
  Zap, Play, CheckCircle2, ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import useAuthStore from '../../store/authStore';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const MotionDiv = motion.div;

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

// Tamamlanan dersleri localStorage'dan oku/yaz
const COMPLETED_KEY = 'completedLessons';
const getCompletedLessons = () => {
  try { return JSON.parse(localStorage.getItem(COMPLETED_KEY) || '[]'); } catch { return []; }
};
const toggleLessonComplete = (id) => {
  const list = getCompletedLessons();
  const idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(id);
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(list));
  return list;
};

// Recursive Tree Node
const TreeNode = ({ node, level = 0, selectedId, onSelect, expandedIds, toggleExpand, user, completedIds }) => {
  const hasChildren = node.children && node.children.length > 0;
  const hasContent = node.content && node.content.trim().length > 0;
  const isExpanded = expandedIds.has(node._id);
  const isSelected = selectedId === node._id;
  const isLocked = node.isPro && !user?.proStatus;
  const isCompleted = completedIds.includes(node._id);
  const statusLabel = hasContent ? 'Ders içeriği' : `${node.children?.length || 0} alt konu`;
  const visualLevel = Math.min(level, 2);

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
          w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all duration-200 group
          ${isSelected
            ? 'bg-gradient-to-r from-primary/20 to-accent/10 text-white border border-primary/35 shadow-lg shadow-primary/10'
            : 'bg-white/[0.025] hover:bg-white/[0.06] text-text-secondary hover:text-white border border-white/[0.04] hover:border-white/10'
          }
          ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{ paddingLeft: `${12 + visualLevel * 8}px` }}
      >
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
          isSelected
            ? 'bg-primary/20 border-primary/30 text-primary-light'
            : 'bg-black/20 border-white/5 text-text-muted group-hover:text-white'
        }`}>
          {isLocked ? (
            <Lock className="w-4 h-4 text-warning" />
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
            <div className="mt-1.5 space-y-1.5 border-l border-white/5 pl-2" style={{ marginLeft: `${18 + visualLevel * 8}px` }}>
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

// ─── Main Component ───────────────────────────────────────────────────────────
const UserLessons = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [allCategories, setAllCategories] = useState([]);
  const [tree, setTree] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [completedIds, setCompletedIds] = useState(getCompletedLessons());
  const [passedTestIds, setPassedTestIds] = useState([]); // Testi geçilen kategori ID'leri

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await api.get('/categories/all');
        const cats = res.data?.data || [];
        
        let finalTree = buildTree(cats);
        let finalFlat = cats;

        if (user?.selectedCategoryId) {
          const mainNode = cats.find(c => c._id === user.selectedCategoryId);
          if (mainNode) {
            const rootTree = buildTree(cats, user.selectedCategoryId);
            finalTree = [{ ...mainNode, children: rootTree }];
            
            const flat = [];
            const extract = (nodes) => {
              for (const n of nodes) {
                flat.push(n);
                if (n.children) extract(n.children);
              }
            };
            extract(finalTree);
            finalFlat = flat;
            
            // Seçili ana kategoriyi ilk açılışta açık olarak (expanded) işaretle
            setExpandedIds(prev => new Set(prev).add(mainNode._id));
          }
        }

        setAllCategories(finalFlat);
        setTree(finalTree);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user?.selectedCategoryId]);

  // Sınav sonuçlarını çek — hangi konularda test geçilmiş?
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/exam-results');
        const results = res.data?.data || res.data?.results || res.data;
        if (Array.isArray(results)) {
          const passed = results
            .filter(r => r.passed && r.categoryId)
            .map(r => r.categoryId);
          setPassedTestIds([...new Set(passed)]);
          
          // Otomatik tamamlama: testi geçilen dersler otomatik tamamlandı işaretlenir
          const currentCompleted = getCompletedLessons();
          let changed = false;
          passed.forEach(id => {
            if (!currentCompleted.includes(id)) {
              currentCompleted.push(id);
              changed = true;
            }
          });
          if (changed) {
            localStorage.setItem(COMPLETED_KEY, JSON.stringify(currentCompleted));
            setCompletedIds([...currentCompleted]);
          }
        }
      } catch (err) {
        console.error('Sınav sonuçları alınamadı:', err);
      }
    };
    fetchResults();
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

  const handleMarkComplete = useCallback(() => {
    if (!selectedLesson) return;
    const updated = toggleLessonComplete(selectedLesson._id);
    setCompletedIds([...updated]);
  }, [selectedLesson]);

  // İçeriği olan tüm derslerin düz listesi (sıradaki ders için)
  const contentLessons = allCategories.filter(c => c.content && c.content.trim().length > 0);

  const getNextLesson = useCallback(() => {
    if (!selectedLesson) return null;
    const idx = contentLessons.findIndex(c => c._id === selectedLesson._id);
    if (idx >= 0 && idx < contentLessons.length - 1) return contentLessons[idx + 1];
    return null;
  }, [selectedLesson, contentLessons]);

  // Filter tree based on search (returns matching nodes as flat list)
  const filteredFlat = searchTerm.trim()
    ? allCategories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : null;
  const mobileLessons = (filteredFlat ?? contentLessons).filter(c => c.content && c.content.trim().length > 0);
  const completedContentCount = contentLessons.filter(c => completedIds.includes(c._id)).length;

  return (
    <div className="flex flex-col xl:flex-row min-h-[calc(100vh-88px)] xl:h-[calc(100vh-128px)] gap-0 overflow-visible xl:overflow-hidden rounded-2xl xl:rounded-3xl border border-white/5 shadow-2xl glass-card bg-bg-card/60">
      
      {/* ─── LEFT: Category Tree Sidebar ─────────────────────────── */}
      <div className="w-full xl:w-[420px] 2xl:w-[440px] shrink-0 flex flex-col border-b xl:border-b-0 xl:border-r border-white/5 xl:max-h-none xl:h-full">
        
        {/* Sidebar header */}
        <div className="px-4 py-3 xl:py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-light" />
              </span>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Dersler</h2>
                <p className="text-[10px] font-bold text-text-muted">{completedContentCount}/{contentLessons.length} tamamlandı</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-text-secondary">
              {mobileLessons.length} konu
            </span>
          </div>
          {/* Search */}
          <div className="flex items-center bg-black/30 border border-white/10 rounded-2xl px-3 py-2.5 focus-within:border-primary/40 focus-within:bg-primary/5 transition-colors">
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

        {/* Mobile horizontal lesson rail */}
        <div className="xl:hidden p-3">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : mobileLessons.length === 0 ? (
            <p className="text-xs text-text-muted italic text-center py-5">Sonuç bulunamadı.</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory custom-scrollbar">
              {mobileLessons.map((cat, index) => {
                const isSelected = selectedLesson?._id === cat._id;
                const isCompleted = completedIds.includes(cat._id);
                const isLocked = cat.isPro && !user?.proStatus;

                return (
                  <button
                    key={cat._id}
                    disabled={isLocked}
                    onClick={() => handleSelect(cat)}
                    className={`snap-start w-[82vw] max-w-[360px] min-h-[132px] shrink-0 rounded-2xl sm:rounded-3xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-primary/25 via-primary/10 to-accent/10 border-primary/35 shadow-xl shadow-primary/10'
                        : 'bg-white/[0.035] border-white/10 hover:bg-white/[0.06]'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                        isSelected ? 'bg-primary/20 border-primary/30 text-primary-light' : 'bg-black/20 border-white/10 text-text-muted'
                      }`}>
                        {isLocked ? <Lock className="w-5 h-5 text-warning" /> : <FileText className="w-5 h-5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-text-muted">
                          Ders {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="mt-1 block text-[15px] font-black text-white leading-snug line-clamp-3">
                          {cat.name}
                        </span>
                      </span>
                      {isCompleted && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
                    </div>
                    {cat.description && (
                      <p className="mt-3 text-xs font-medium text-text-secondary line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop tree scroll area */}
        <div className="hidden xl:block flex-1 min-h-0 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
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
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all
                    ${selectedLesson?._id === cat._id ? 'bg-gradient-to-r from-primary/20 to-accent/10 text-white border border-primary/35 shadow-lg shadow-primary/10' : 'bg-white/[0.025] hover:bg-white/[0.06] text-text-secondary hover:text-white border border-white/[0.04] hover:border-white/10'}
                    ${cat.isPro && !user?.proStatus ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <span className="w-9 h-9 rounded-xl bg-black/20 border border-white/5 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-text-muted" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black leading-snug line-clamp-2">{cat.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Arama sonucu</span>
                  </span>
                  {completedIds.includes(cat._id) && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}
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
                completedIds={completedIds}
              />
            ))
          )}
        </div>
      </div>

      {/* ─── RIGHT: Content Reader ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-[62vh] xl:h-full overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedLesson ? (
            <MotionDiv
              key={selectedLesson._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col h-full min-h-[62vh]"
            >
              {/* Content Header */}
              <div className="px-4 sm:px-6 xl:px-8 py-4 xl:py-5 border-b border-white/5 bg-gradient-to-r from-primary/10 via-transparent to-transparent flex items-start gap-3 sm:gap-5 shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center shrink-0">
                  {selectedLesson.image ? (
                    <img src={resolveMediaUrl(selectedLesson.image)} alt="" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                  ) : (
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary-light" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug sm:truncate break-words">{selectedLesson.name}</h2>
                  {selectedLesson.description && (
                    <p className="text-xs text-text-muted mt-1 line-clamp-2 sm:line-clamp-1">{selectedLesson.description}</p>
                  )}
                </div>
                {selectedLesson.isPro && (
                  <span className="hidden sm:inline-flex px-3 py-1.5 bg-warning/10 border border-warning/20 text-warning rounded-xl text-[10px] font-black uppercase shrink-0">
                    PRO İçerik
                  </span>
                )}
              </div>

              {/* Markdown Body */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 xl:px-8 py-5 sm:py-7 xl:py-8 custom-scrollbar">
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
                  <div className="prose prose-invert prose-sm sm:prose-base max-w-none xl:max-w-3xl mx-auto
                    prose-headings:font-black prose-headings:tracking-tight prose-headings:text-white
                    prose-h1:text-xl sm:prose-h1:text-2xl prose-h2:text-lg sm:prose-h2:text-xl prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-3
                    prose-p:text-white/85 prose-p:leading-relaxed
                    prose-strong:text-white prose-strong:font-black
                    prose-img:rounded-2xl prose-img:shadow-xl prose-img:border prose-img:border-white/10 prose-img:mx-auto prose-img:max-h-[320px] sm:prose-img:max-h-[460px] prose-img:object-contain
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
                        img: ({ src, alt }) => (
                          <img
                            src={resolveMediaUrl(src)}
                            alt={alt || ''}
                            className="rounded-2xl shadow-xl border border-white/10 max-w-full max-h-[320px] sm:max-h-[460px] object-contain my-5 sm:my-6 mx-auto"
                          />
                        ),
                      }}
                    >
                      {selectedLesson.content}
                    </ReactMarkdown>

                    {/* Konu Sonu: Kısa Teste Geçiş */}
                    <div className="mt-10 sm:mt-16 pt-8 sm:pt-10 border-t border-white/5 flex flex-col items-center justify-center text-center pb-6 sm:pb-8 not-prose">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mb-5 sm:mb-6 shadow-2xl shadow-success/10">
                        <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3">Konuyu Öğrendin mi?</h3>
                      <p className="text-sm font-medium text-text-muted max-w-sm mb-6 sm:mb-8 leading-relaxed">
                        Konuyu pekiştirmek için sana özel hazırlanan hızlı mini teste gir. Yanlışlarını detaylı açıklamalarla anında öğren.
                      </p>
                      
                      <button 
                        onClick={() => navigate(`/dashboard/exams/short-test/${selectedLesson._id}`)}
                        className="w-full sm:w-auto justify-center flex items-center gap-3 px-6 sm:px-8 py-4 bg-success text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-success/20 hover:scale-105 active:scale-95 transition-all group"
                      >
                        <Play className="w-5 h-5 group-hover:text-white/80" />
                        Konu Testini Çöz
                      </button>

                      {/* Tamamlandı & Sıradaki Ders */}
                      <div className="mt-8 w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
                        {passedTestIds.includes(selectedLesson._id) ? (
                          <button
                            onClick={handleMarkComplete}
                            className={`justify-center flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                              completedIds.includes(selectedLesson._id)
                                ? 'bg-success/20 border border-success/30 text-success'
                                : 'bg-white/5 border border-white/10 text-text-muted hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            {completedIds.includes(selectedLesson._id) ? 'Tamamlandı ✓' : 'Konuyu Tamamla'}
                          </button>
                        ) : (
                          <div className="justify-center flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-text-muted text-sm font-bold opacity-50 cursor-not-allowed">
                            <Lock className="w-4 h-4" />
                            Önce testi geçmelisiniz
                          </div>
                        )}

                        {getNextLesson() && (
                          <button
                            onClick={() => handleSelect(getNextLesson())}
                            className="justify-center flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 text-primary-light rounded-xl font-bold text-sm hover:bg-primary/20 transition-all"
                          >
                            Sıradaki Ders <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </MotionDiv>
          ) : (
            <MotionDiv
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-12 min-h-[58vh]"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[32px] sm:rounded-[36px] bg-white/[0.03] border-2 border-dashed border-white/10 flex items-center justify-center mb-6">
                <BookOpen className="w-12 h-12 sm:w-14 sm:h-14 text-white/10" />
              </div>
              <h3 className="text-xl font-black text-white/60 tracking-tight">Bir ders seçin</h3>
              <p className="text-text-muted text-sm max-w-xs mt-2 font-medium leading-relaxed">
                Sol taraftaki menüden bir kategori veya ders seçerek okumaya başlayabilirsiniz.
              </p>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default UserLessons;
