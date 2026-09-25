import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Loader2, Search, Lock, FileText, X,
  Zap, Play, CheckCircle2, ArrowRight, ZoomIn, Volume2, VolumeX,
  Languages
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useAuthStore from '../../store/authStore';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { trackEvent } from '../../utils/analytics';
import { clearAiPageContext, compactLessonContext, setAiPageContext } from '../../utils/aiPageContext';

// ─── Extracted Modules (SRP) ─────────────────────────────────────
import {
  getVoiceKey,
  getVoiceLabel,
  COMPLETED_KEY,
  getCompletedLessons,
  toggleLessonComplete,
} from './lessons/lessonsHelpers';
import { MobileLessonBrowser, MobileLessonReader } from './lessons/MobileLessonViews';
import MobileSyllabusDrawer from './lessons/MobileSyllabusDrawer';
import LessonPreviewModal from './lessons/LessonPreviewModal';
import { TreeNode } from './lessons/LessonTreeNode';
import { useLessonReader } from './lessons/useLessonReader';
import { createLessonCatalogRepository } from './lessons/lessonCatalogRepository';

const MotionDiv = motion.div;
const lessonCatalog = createLessonCatalogRepository(api);

// ─── Main Component ───────────────────────────────────────────────────────────
const UserLessons = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [allCategories, setAllCategories] = useState([]);
  const [topicCategories, setTopicCategories] = useState([]);
  const [activeTopicId, setActiveTopicId] = useState('all');
  const [tree, setTree] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [completedIds, setCompletedIds] = useState(getCompletedLessons());
  const [passedTestIds, setPassedTestIds] = useState([]); // Testi geçilen kategori ID'leri
  const [previewImage, setPreviewImage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1280);
  const [mobileNavStack, setMobileNavStack] = useState([]);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const {
    isReadingLesson, availableVoices, selectedVoiceKey, isVoiceMenuOpen,
    setIsVoiceMenuOpen, handleSelectVoice, handleToggleLessonReading, selectedVoice,
  } = useLessonReader({ selectedLesson, proStatus: user?.proStatus });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1280);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setScrollProgress(0);
  }, [selectedLesson?._id]);

  useEffect(() => {
    if (!selectedLesson) {
      clearAiPageContext('lesson_reader');
      return undefined;
    }

    setAiPageContext(compactLessonContext(selectedLesson, {
      categoryName: user?.selectedCategoryName || '',
    }));

    return () => clearAiPageContext('lesson_reader');
  }, [selectedLesson, user?.selectedCategoryName]);

  const handleScroll = (e) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollHeight - target.clientHeight;
    if (maxScroll > 0) {
      setScrollProgress(target.scrollTop / maxScroll);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const catalog = await lessonCatalog.load(user?.selectedCategoryId);
        if (!active) return;
        setAllCategories(catalog.categories);
        setTree(catalog.tree);
        setTopicCategories(catalog.topics);
        setExpandedIds(catalog.rootId ? new Set([catalog.rootId]) : new Set());
        setActiveTopicId(catalog.topics[0]?._id || 'all');
        setSelectedLesson(null);
      } catch (err) {
        if (active) console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchAll();
    return () => { active = false; };
  }, [user?.selectedCategoryId]);

  const handleTopicClick = (topicId) => {
    setActiveTopicId(topicId);
    if (topicId !== 'all') {
      const topicNode = topicCategories.find(c => c._id === topicId);
      if (topicNode) {
        setMobileNavStack([topicNode]);
      } else {
        setMobileNavStack([]);
      }
      setExpandedIds(prev => {
        const next = new Set(prev);
        next.add(topicId);
        return next;
      });
    } else {
      setMobileNavStack([]);
    }
    setSelectedLesson(null);
  };

  // Sınav sonuçlarını çek — hangi konularda test geçilmiş?
  useEffect(() => {
    let active = true;
    const fetchResults = async () => {
      try {
        const passed = await lessonCatalog.loadPassedCategoryIds();
        if (!active) return;
        if (passed.length) {
          setPassedTestIds(passed);
          
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
        if (active) console.error('Sınav sonuçları alınamadı:', err);
      }
    };
    fetchResults();
    return () => { active = false; };
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
    try {
      localStorage.setItem('last_visited_id', node._id);
      localStorage.setItem('last_visited_name', node.name);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleMarkComplete = useCallback(() => {
    if (!selectedLesson) return;
    const updated = toggleLessonComplete(selectedLesson._id);
    setCompletedIds([...updated]);
  }, [selectedLesson]);

  // İçeriği olan tüm derslerin düz listesi (sıradaki ders için)
  const contentLessons = useMemo(
    () => allCategories.filter(c => c.content && c.content.trim().length > 0),
    [allCategories]
  );

  const filteredContentLessons = useMemo(() => {
    if (activeTopicId === 'all') return contentLessons;
    return contentLessons.filter(lesson => {
      let current = lesson;
      while (current) {
        const parentId = current.parent?._id || current.parent;
        if (!parentId) break;
        if (parentId === activeTopicId) return true;
        current = allCategories.find(c => c._id === parentId);
      }
      return false;
    });
  }, [contentLessons, activeTopicId, allCategories]);

  const displayTree = useMemo(() => {
    if (activeTopicId === 'all' || tree.length === 0) return tree;
    const rootNode = tree[0];
    if (!rootNode) return tree;
    const filteredChildren = (rootNode.children || []).filter(c => c._id === activeTopicId);
    return [{ ...rootNode, children: filteredChildren }];
  }, [tree, activeTopicId]);

  useEffect(() => {
    if (isMobile) return;
    if (loading || filteredContentLessons.length === 0) return;
    const isStillValid = selectedLesson && filteredContentLessons.some((lesson) => lesson._id === selectedLesson._id);
    if (!isStillValid) {
      setSelectedLesson(filteredContentLessons[0]);
    }
  }, [filteredContentLessons, loading, isMobile, selectedLesson]);

  const getSyllabusLessons = useCallback(() => {
    const activeNode = selectedLesson || mobileNavStack[mobileNavStack.length - 1];
    if (!activeNode) return topicCategories;
    
    const parentId = activeNode.parent?._id || activeNode.parent;
    if (!parentId || parentId === user?.selectedCategoryId) {
      return topicCategories;
    }
    
    const parentNode = allCategories.find(c => c._id === parentId);
    return parentNode?.children || [];
  }, [selectedLesson, mobileNavStack, topicCategories, user?.selectedCategoryId, allCategories]);

  const getNextLesson = useCallback(() => {
    if (!selectedLesson) return null;
    if (isMobile) {
      const syllabus = getSyllabusLessons();
      const currentIndex = syllabus.findIndex(c => c._id === selectedLesson._id);
      if (currentIndex !== -1 && currentIndex + 1 < syllabus.length) {
        return syllabus[currentIndex + 1];
      }
      return null;
    } else {
      const idx = filteredContentLessons.findIndex(c => c._id === selectedLesson._id);
      if (idx >= 0 && idx < filteredContentLessons.length - 1) return filteredContentLessons[idx + 1];
      return null;
    }
  }, [selectedLesson, isMobile, getSyllabusLessons, filteredContentLessons]);

  // Filter tree based on search (returns matching nodes as flat list)
  const filteredFlat = searchTerm.trim()
    ? allCategories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : null;
  const mobileLessons = (filteredFlat ?? filteredContentLessons).filter(c => c.content && c.content.trim().length > 0);
  const completedContentCount = filteredContentLessons.filter(c => completedIds.includes(c._id)).length;
  const lessonProgressPercent = filteredContentLessons.length
    ? Math.round((completedContentCount / filteredContentLessons.length) * 100)
    : 0;
  const selectedLessonIndex = selectedLesson
    ? filteredContentLessons.findIndex((lesson) => lesson._id === selectedLesson._id) + 1
    : 0;
  const selectedLessonImage = selectedLesson?.image ? resolveMediaUrl(selectedLesson.image) : '';
  const selectedLessonImageFile = selectedLesson?.image?.split('/').pop()?.normalize('NFC') || '';
  const contentIncludesSelectedImage = Boolean(
    selectedLessonImageFile &&
    selectedLesson?.content?.normalize('NFC').includes(selectedLessonImageFile)
  );

  useEffect(() => {
    if (!selectedLesson?.isPro || user?.proStatus) return;
    trackEvent('paywall_seen', {
      surface: 'lesson_reader',
      contentType: 'lesson',
      contentId: selectedLesson._id,
      contentName: selectedLesson.name,
    });
  }, [selectedLesson?._id, selectedLesson?.isPro, selectedLesson?.name, user?.proStatus]);

  const handleProInterest = useCallback(() => {
    if (!selectedLesson) return;
    trackEvent('pro_clicked', {
      surface: 'lesson_lock',
      contentType: 'lesson',
      contentId: selectedLesson._id,
      contentName: selectedLesson.name,
    });
    alert("Premium abonelik işlemleri web sürümünde desteklenmemektedir. Güvenlik ve faturalandırma kuralları nedeniyle premium abonelik işlemleri şu an için yalnızca Android uygulamamız (Google Play) üzerinden gerçekleştirilebilir.");
  }, [selectedLesson]);

  const handleMobileNodeClick = (node) => {
    const hasChildren = node.children && node.children.length > 0;
    const hasContent = node.content && node.content.trim().length > 0;

    if (hasContent) {
      handleSelect(node);
    } else if (hasChildren) {
      setMobileNavStack(prev => [...prev, node]);
      setActiveTopicId(node._id);
    }
  };









  if (isMobile) {
    return (
      <div className="flutter-mobile flutter-lessons min-h-[calc(100vh-88px)] bg-[#0b0d12] text-white flex flex-col relative pb-20">
        {selectedLesson ? (
          <MobileLessonReader
            selectedLesson={selectedLesson}
            setSelectedLesson={setSelectedLesson}
            setIsSyllabusOpen={setIsSyllabusOpen}
            handleToggleLessonReading={handleToggleLessonReading}
            user={user}
            isReadingLesson={isReadingLesson}
            isVoiceMenuOpen={isVoiceMenuOpen}
            setIsVoiceMenuOpen={setIsVoiceMenuOpen}
            availableVoices={availableVoices}
            selectedVoiceKey={selectedVoiceKey}
            handleSelectVoice={handleSelectVoice}
            selectedVoice={selectedVoice}
            scrollProgress={scrollProgress}
            handleScroll={handleScroll}
            setPreviewImage={setPreviewImage}
            navigate={navigate}
            passedTestIds={passedTestIds}
            handleMarkComplete={handleMarkComplete}
            completedIds={completedIds}
            getNextLesson={getNextLesson}
            handleSelect={handleSelect}
            allCategories={allCategories}
            setMobileNavStack={setMobileNavStack}
            selectedLessonImage={selectedLessonImage}
            contentIncludesSelectedImage={contentIncludesSelectedImage}
            handleProInterest={handleProInterest}
          />
        ) : (
          <MobileLessonBrowser
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredFlat={filteredFlat}
            topicCategories={topicCategories}
            activeTopicId={activeTopicId}
            handleTopicClick={handleTopicClick}
            contentLessons={contentLessons}
            navigate={navigate}
            user={user}
            handleMobileNodeClick={handleMobileNodeClick}
            mobileNavStack={mobileNavStack}
            setMobileNavStack={setMobileNavStack}
            setActiveTopicId={setActiveTopicId}
            selectedLesson={selectedLesson}
            handleSelect={handleSelect}
            isVoiceMenuOpen={isVoiceMenuOpen}
            setIsVoiceMenuOpen={setIsVoiceMenuOpen}
            availableVoices={availableVoices}
            selectedVoiceKey={selectedVoiceKey}
            handleSelectVoice={handleSelectVoice}
            selectedVoice={selectedVoice}
            setIsSyllabusOpen={setIsSyllabusOpen}
            completedIds={completedIds}
            allCategories={allCategories}
          />
        )}
        <MobileSyllabusDrawer
          isSyllabusOpen={isSyllabusOpen}
          setIsSyllabusOpen={setIsSyllabusOpen}
          selectedLesson={selectedLesson}
          mobileNavStack={mobileNavStack}
          handleSelect={handleSelect}
          setSelectedLesson={setSelectedLesson}
          setMobileNavStack={setMobileNavStack}
          setActiveTopicId={setActiveTopicId}
          allCategories={allCategories}
          user={user}
          completedIds={completedIds}
          getSyllabusLessons={getSyllabusLessons}
        />
        <LessonPreviewModal previewImage={previewImage} onClose={() => setPreviewImage(null)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-88px)] flex-col gap-3 overflow-visible xl:h-[calc(100vh-128px)] xl:flex-row xl:gap-0 xl:overflow-hidden xl:rounded-3xl xl:border xl:border-white/[0.08] xl:bg-[#080a10] xl:shadow-2xl xl:shadow-black/50">
      
      {/* ─── LEFT: Category Tree Sidebar ─────────────────────────── */}
      <div className="flex w-full shrink-0 flex-col rounded-2xl border border-white/5 bg-bg-card/80 xl:h-full xl:max-h-none xl:w-[340px] xl:rounded-none xl:border-0 xl:border-r xl:border-white/[0.08] xl:bg-[#0c0e15] 2xl:w-[380px]">
        
        {/* Sidebar header — premium */}
        <div className="border-b border-white/[0.07] bg-gradient-to-b from-[#0f1220] to-[#0c0e15] px-3 py-3 sm:px-4 xl:py-5">
          {/* Title row */}
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/15">
                <BookOpen className="h-4 w-4 text-primary-light" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Dersler</h2>
                {user?.selectedCategoryName && (
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-primary-light/80">{user.selectedCategoryName}</p>
                )}
              </div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-black text-text-secondary">
              {contentLessons.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mb-3 hidden xl:block">
            <div className="mb-1.5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
              <span className="text-text-muted">İlerleme</span>
              <span className={completedContentCount === contentLessons.length && contentLessons.length > 0 ? 'text-success' : 'text-primary-light'}>
                {completedContentCount}/{contentLessons.length} tamamlandı
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${completedContentCount === contentLessons.length && contentLessons.length > 0 ? 'bg-success' : 'bg-gradient-to-r from-primary to-accent'}`}
                style={{ width: `${lessonProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Konu Kategorisi Seçici Sekmeleri */}
          {topicCategories.length > 0 && (
            <div className="mb-3.5">
              <label className="mb-1.5 block text-[9px] font-black uppercase tracking-widest text-text-muted">Konu Kategorisi</label>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => handleTopicClick('all')}
                  className={`shrink-0 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition ${
                    activeTopicId === 'all'
                      ? 'border-primary/45 bg-primary/10 text-primary-light shadow-[0_0_10px_rgba(99,102,241,0.15)]'
                      : 'border-white/5 bg-white/[0.015] text-text-muted hover:border-white/15 hover:text-white'
                  }`}
                >
                  Tümü
                </button>
                {topicCategories.map(topic => (
                  <button
                    key={topic._id}
                    type="button"
                    onClick={() => handleTopicClick(topic._id)}
                    className={`shrink-0 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition ${
                      activeTopicId === topic._id
                        ? 'border-primary/45 bg-primary/10 text-primary-light shadow-[0_0_10px_rgba(99,102,241,0.15)]'
                        : 'border-white/5 bg-white/[0.015] text-text-muted hover:border-white/15 hover:text-white'
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Search */}
          <div className="flex items-center rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 transition-colors focus-within:border-primary/40 focus-within:bg-primary/5 sm:rounded-2xl xl:rounded-lg xl:bg-black/20 xl:py-2">
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
          <button
            type="button"
            onClick={() => navigate('/dashboard/videos')}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-accent-light transition hover:border-accent/35 hover:bg-accent/15 sm:rounded-2xl xl:rounded-lg xl:py-2"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Video Dersler
          </button>
        </div>

        {/* Mobile horizontal lesson rail */}
        <div className="xl:hidden p-2.5 sm:p-3">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : mobileLessons.length === 0 ? (
            <p className="text-xs text-text-muted italic text-center py-5">Sonuç bulunamadı.</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1.5 snap-x snap-mandatory custom-scrollbar">
              {mobileLessons.map((cat, index) => {
                const isSelected = selectedLesson?._id === cat._id;
                const isCompleted = completedIds.includes(cat._id);
                const isLocked = cat.isPro && !user?.proStatus;
                const imageUrl = cat.image ? resolveMediaUrl(cat.image) : '';

                return (
                  <button
                    key={cat._id}
                    disabled={isLocked}
                    onClick={() => handleSelect(cat)}
                    className={`snap-start flex w-[72vw] max-w-[290px] shrink-0 items-center gap-3 rounded-2xl border p-3 text-left transition-all sm:w-[46vw] sm:max-w-[330px] ${
                      isSelected
                        ? 'bg-gradient-to-br from-primary/25 via-primary/10 to-accent/10 border-primary/35 shadow-xl shadow-primary/10'
                        : 'bg-white/[0.035] border-white/10 hover:bg-white/[0.06]'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        isSelected ? 'bg-primary/20 border-primary/30 text-primary-light' : 'bg-black/20 border-white/10 text-text-muted'
                      }`}>
                        {isLocked ? (
                          <Lock className="h-4 w-4 text-warning" />
                        ) : imageUrl ? (
                          <img src={imageUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[9px] font-black uppercase tracking-widest text-text-muted">
                        Ders {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="mt-0.5 block text-sm font-black leading-snug text-white line-clamp-2">
                        {cat.name}
                      </span>
                    </span>
                    {isCompleted && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop tree scroll area */}
        <div className="hidden xl:block flex-1 min-h-0 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
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
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all
                    ${selectedLesson?._id === cat._id ? 'border border-primary/35 bg-primary/10 text-white shadow-sm shadow-primary/10' : 'border border-white/[0.04] bg-white/[0.018] text-text-secondary hover:border-white/10 hover:bg-white/[0.055] hover:text-white'}
                    ${cat.isPro && !user?.proStatus ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <span className="w-8 h-8 rounded-lg bg-black/20 border border-white/5 flex items-center justify-center shrink-0">
                    {cat.image ? (
                      <img src={resolveMediaUrl(cat.image)} alt="" className="w-full h-full rounded-lg object-cover" />
                    ) : (
                      <FileText className="w-4 h-4 text-text-muted" />
                    )}
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
            displayTree.map(node => (
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
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/5 bg-bg-card/70 xl:h-full xl:min-h-[62vh] xl:rounded-none xl:border-0 xl:bg-[#0f1117]">
        <AnimatePresence mode="wait">
          {selectedLesson ? (
            <MotionDiv
              key={selectedLesson._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex h-full min-h-[62vh] flex-col"
            >
              {/* Content Header — premium */}
              <div className="relative shrink-0 border-b border-white/[0.07] bg-gradient-to-b from-[#0f1220] to-[#0a0c12] px-5 py-4 sm:px-6 xl:px-8 xl:py-5">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-primary-light shadow-[0_0_12px_rgba(99,102,241,0.15)]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary-light">Ders {selectedLessonIndex > 0 ? selectedLessonIndex : '–'} / {contentLessons.length || '–'}</span>
                      {completedIds.includes(selectedLesson._id) && (
                        <span className="rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[9px] font-black text-success">✓ Tamamlandı</span>
                      )}
                      {selectedLesson.isPro && (
                        <span className="rounded border border-warning/20 bg-warning/10 px-1.5 py-0.5 text-[8px] font-black uppercase text-warning">PRO</span>
                      )}
                    </div>
                    <h2 className="mt-1 text-lg font-black leading-snug tracking-tight text-white break-words sm:text-xl xl:text-2xl">
                      {selectedLesson.name}
                    </h2>
                    {selectedLesson.description && (
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-text-muted line-clamp-1">{selectedLesson.description}</p>
                    )}
                    <div className="mt-3 hidden flex-wrap items-center gap-2 xl:flex">
                      <button
                        type="button"
                        onClick={handleToggleLessonReading}
                        disabled={selectedLesson.isPro && !user?.proStatus}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-30 ${
                          isReadingLesson
                            ? 'border-primary/30 bg-primary/15 text-primary-light hover:bg-primary/25'
                            : 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]'
                        }`}
                      >
                        {isReadingLesson ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                        <span>{isReadingLesson ? 'Durdur' : 'Sesli Oku'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative ml-auto hidden xl:block">
                  {isVoiceMenuOpen && (
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsVoiceMenuOpen(false)}
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setIsVoiceMenuOpen((prev) => !prev)}
                    className="mt-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white hover:bg-white/[0.06]"
                    aria-label="Anlatıcı seç"
                    title="Anlatıcı seç"
                  >
                    <Languages className="h-4 w-4" />
                  </button>
                  {isVoiceMenuOpen && (
                    <div className="absolute right-0 top-14 z-30 w-80 max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#121521] p-2 shadow-2xl shadow-black/40">
                      <div className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-text-muted">
                        Anlatıcı Seç
                      </div>
                      {availableVoices.length === 0 ? (
                        <div className="px-2 py-3 text-xs text-text-muted">Anlatıcılar hazırlanıyor...</div>
                      ) : (
                        availableVoices.map((voice) => {
                          const key = getVoiceKey(voice);
                          const isSelected = key === selectedVoiceKey;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleSelectVoice(key)}
                              className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                                isSelected
                                  ? 'bg-primary/15 text-white'
                                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-semibold">{getVoiceLabel(voice)}</span>
                                <span className="block text-[10px] text-text-muted">
                                  {voice.localService ? 'Yerel anlatıcı' : 'Çevrim içi anlatıcı'}
                                </span>
                              </span>
                              {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Markdown Body */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 custom-scrollbar sm:px-6 sm:py-7 xl:px-10 xl:py-8">
                {selectedLesson.isPro && !user?.proStatus ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-5">
                    <div className="w-24 h-24 rounded-[32px] border-2 border-dashed border-warning/30 flex items-center justify-center">
                      <Lock className="w-12 h-12 text-warning/30" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">PRO İçerik</h3>
                      <p className="text-text-muted text-sm max-w-sm mt-2 font-medium">
                        Bu ders içeriği yalnızca PRO üyelere açıktır. Premium abonelik işlemleri web sürümünde desteklenmemektedir; şu an için yalnızca Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleProInterest}
                      className="rounded-2xl bg-warning px-6 py-3 text-xs font-black uppercase tracking-widest text-black shadow-xl shadow-warning/10 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      PRO'ya Geç
                    </button>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm mx-auto max-w-none sm:prose-base xl:max-w-4xl
                    prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-white
                    prose-h1:text-xl sm:prose-h1:text-2xl prose-h2:text-lg sm:prose-h2:text-xl prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-3
                    prose-p:text-slate-200/90 prose-p:leading-7 sm:prose-p:leading-relaxed
                    prose-strong:text-white prose-strong:font-black
                    prose-img:rounded-2xl prose-img:shadow-xl prose-img:border prose-img:border-white/10 prose-img:mx-auto prose-img:max-h-[320px] sm:prose-img:max-h-[460px] prose-img:object-contain
                    prose-li:text-white/85 prose-li:leading-7 prose-ul:space-y-1
                    prose-a:text-primary-light hover:prose-a:text-white prose-a:no-underline prose-a:font-semibold
                    prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-white/[0.02] prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:rounded-r-2xl prose-blockquote:border-y prose-blockquote:border-r prose-blockquote:border-white/[0.03] prose-blockquote:text-text-secondary
                    prose-code:bg-white/5 prose-code:border prose-code:border-white/10 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-primary-light
                    prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-2xl
                    prose-table:border-collapse prose-th:border prose-th:border-white/10 prose-th:bg-white/5 prose-th:p-3
                    prose-td:border prose-td:border-white/5 prose-td:p-3
                  ">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({ src, alt }) => (
                          <button
                            type="button"
                            onClick={() => setPreviewImage({ src: resolveMediaUrl(src), alt: alt || selectedLesson.name })}
                            className="not-prose group relative mx-auto my-5 block overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-xl sm:my-6"
                          >
                            <img
                              src={resolveMediaUrl(src)}
                              alt={alt || ''}
                              className="max-h-[320px] max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02] sm:max-h-[460px]"
                            />
                            <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/70 text-white shadow-lg opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                              <ZoomIn className="h-4 w-4" />
                            </span>
                          </button>
                        ),
                      }}
                    >
                      {selectedLesson.content}
                    </ReactMarkdown>

                    {selectedLessonImage && !contentIncludesSelectedImage && (
                      <div className="not-prose mt-8 sm:mt-10">
                         <button
                           type="button"
                           onClick={() => setPreviewImage({ src: selectedLessonImage, alt: selectedLesson.name })}
                           className="group relative mx-auto block w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-2xl"
                         >
                           <img
                             src={selectedLessonImage}
                             alt={selectedLesson.name}
                             className="w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                           />
                           <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/70 text-white shadow-lg opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                             <ZoomIn className="h-4 w-4" />
                           </span>
                         </button>
                      </div>
                    )}

                    {/* Konu Sonu: Kısa Teste Geçiş */}
                    <div className="mt-16 pt-12 border-t border-white/10 pb-8 not-prose">
                      <div className="relative overflow-hidden rounded-[2.5rem] border border-success/20 bg-gradient-to-br from-[#12221b] via-[#0d0f14] to-transparent p-6 sm:p-10 text-center shadow-2xl shadow-success/5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 blur-[120px] pointer-events-none rounded-full" />
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="w-16 h-16 rounded-3xl bg-success/10 border border-success/30 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse">
                            <Zap className="w-8 h-8 text-success" />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Bu Konuyu Öğrendin mi?</h3>
                          <p className="text-sm font-semibold text-text-secondary max-w-md mt-2.5 leading-relaxed">
                            Konuyu pekiştirmek için sana özel hazırlanan değerlendirme testine gir. Yanlışlarını anında detaylı açıklamalarla gör.
                          </p>
                          
                          <button 
                            onClick={() => navigate(`/dashboard/exams/short-test/${selectedLesson._id}`)}
                            className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-success hover:bg-success/90 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.03] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            Konu Testini Başlat
                          </button>

                          {/* Tamamlandı & Sıradaki Ders */}
                          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            {passedTestIds.includes(selectedLesson._id) ? (
                              <button
                                onClick={handleMarkComplete}
                                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                                  completedIds.includes(selectedLesson._id)
                                    ? 'bg-success/20 border border-success/30 text-success'
                                    : 'bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                {completedIds.includes(selectedLesson._id) ? 'TAMAMLANDI ✓' : 'KONUYU TAMAMLANDI İŞARETLE'}
                              </button>
                            ) : (
                              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-text-muted text-xs font-black uppercase tracking-widest opacity-50 cursor-not-allowed">
                                <Lock className="w-4 h-4" />
                                Önce testi geçmelisin
                              </div>
                            )}

                            {getNextLesson() && (
                              <button
                                onClick={() => handleSelect(getNextLesson())}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-primary/15 border border-primary/20 text-primary-light rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/25 transition-all cursor-pointer"
                              >
                                Sıradaki Derse Geç <ArrowRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
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
              className="flex min-h-[46vh] flex-1 flex-col items-center justify-center p-6 text-center sm:min-h-[58vh] sm:p-12"
            >
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] border-2 border-dashed border-white/10 bg-white/[0.03] sm:mb-6 sm:h-28 sm:w-28 sm:rounded-[36px]">
                <BookOpen className="h-10 w-10 text-white/10 sm:h-14 sm:w-14" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-white/70 sm:text-xl">Bir ders seçin</h3>
              <p className="text-text-muted text-sm max-w-xs mt-2 font-medium leading-relaxed">
                Üstteki ders listesinden bir konu seçerek okumaya başlayabilirsiniz.
              </p>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>

<LessonPreviewModal previewImage={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
};

export default UserLessons;
