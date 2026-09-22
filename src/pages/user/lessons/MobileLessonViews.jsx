import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen, ChevronLeft, Loader2,
  Search, Lock, Folder, FolderOpen, FileText, X,
  Zap, Play, CheckCircle2, ArrowRight, ZoomIn, Volume2, VolumeX,
  LayoutGrid, Clock, Languages
} from 'lucide-react';
import { resolveMediaUrl } from '../../../utils/mediaUrl';
import { getVoiceKey, getVoiceLabel } from './lessonsHelpers';
import { MobileCategoryCard } from './MobileCategoryCard';

export const MobileLessonBrowser = ({
  loading,
  searchTerm,
  setSearchTerm,
  filteredFlat,
  topicCategories,
  activeTopicId,
  handleTopicClick,
  contentLessons,
  navigate,
  user,
  handleMobileNodeClick,
  mobileNavStack,
  setMobileNavStack,
  setActiveTopicId,
  selectedLesson,
  handleSelect,
  isVoiceMenuOpen,
  setIsVoiceMenuOpen,
  availableVoices,
  selectedVoiceKey,
  handleSelectVoice,
  selectedVoice,
  setIsSyllabusOpen,
  completedIds,
  allCategories,
}) => {
    const currentCategory = mobileNavStack[mobileNavStack.length - 1] || null;

    if (!currentCategory) {
      // Root Topics View
      return (
        <div className="flutter-lesson-browser relative flex flex-col flex-1 px-4 py-3">
          {/* Header Block */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary-light" />
                </span>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Dersler</h2>
                    {user?.selectedCategoryName && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/25 text-[9px] font-black text-primary-light uppercase tracking-wider">
                        {user.selectedCategoryName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-text-secondary">
                {contentLessons.length} konu
              </span>
            </div>

            {/* Search Input */}
            <div className="flex items-center rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 mb-4">
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

            {/* Video Dersler Quick Entry */}
            <button
              type="button"
              onClick={() => navigate('/dashboard/videos')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-accent-light transition hover:border-accent/35 hover:bg-accent/15"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Video Dersler
            </button>
          </div>

          {/* Topic selection tabs */}
          {topicCategories.length > 0 && !searchTerm && (
            <div className="mb-4">
              <label className="mb-1.5 block text-[9px] font-black uppercase tracking-widest text-text-muted">Konu Kategorisi</label>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => handleTopicClick('all')}
                  className={`shrink-0 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition ${
                    activeTopicId === 'all'
                      ? 'border-primary/45 bg-primary/10 text-primary-light shadow-[0_0_10px_rgba(99,102,241,0.15)]'
                      : 'border-white/5 bg-white/[0.015] text-text-muted'
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
                        : 'border-white/5 bg-white/[0.015] text-text-muted'
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid / List Content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Yükleniyor...</span>
              </div>
            ) : searchTerm ? (
              // Search Results
              <div className="space-y-2">
                {filteredFlat && filteredFlat.length > 0 ? (
                  filteredFlat.map(cat => (
                    <button
                      key={cat._id}
                      disabled={cat.isPro && !user?.proStatus}
                      onClick={() => cat.content?.trim() && handleSelect(cat)}
                      className={`w-full flex items-center gap-3 rounded-2xl p-3 text-left border ${
                        selectedLesson?._id === cat._id 
                          ? 'border-primary/35 bg-primary/10 text-white' 
                          : 'border-white/5 bg-white/[0.02] text-text-secondary'
                      } ${cat.isPro && !user?.proStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="w-10 h-10 rounded-xl bg-black/20 border border-white/5 flex items-center justify-center shrink-0">
                        {cat.image ? (
                          <img src={resolveMediaUrl(cat.image)} alt="" className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <FileText className="w-5 h-5 text-text-muted" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-black text-white truncate">{cat.name}</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Arama sonucu</span>
                      </span>
                      {completedIds.includes(cat._id) && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-text-muted italic text-center py-8">Sonuç bulunamadı.</p>
                )}
              </div>
            ) : (
              // 2-Column Grid of Topics / Active Category children
              <div className="grid grid-cols-2 gap-3 pb-6">
                {(activeTopicId === 'all' ? topicCategories : topicCategories.filter(c => c._id === activeTopicId)).map((cat) => (
                  <MobileCategoryCard
                    key={cat._id}
                    category={cat}
                    parentColor="#6c63ff"
                    onClick={handleMobileNodeClick}
                    user={user}
                    completedIds={completedIds}
                    allCategories={allCategories}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // Subcategories Grid View (SubCategoryScreen Parity)
      const children = currentCategory.children || [];
      const catColor = currentCategory.color && currentCategory.color !== '#6C63FF' ? currentCategory.color : '#6c63ff';

      return (
        <div className="flex flex-col flex-1 px-4 py-3">
          {/* Header with back button */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <button
              onClick={() => {
                setMobileNavStack(prev => prev.slice(0, -1));
                if (mobileNavStack.length <= 1) {
                  setActiveTopicId('all');
                }
              }}
              className="p-1 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 min-w-0 flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                style={{ backgroundColor: `${catColor}20`, borderColor: `${catColor}30`, color: catColor }}
              >
                <FolderOpen className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider truncate">
                {currentCategory.name}
              </h2>
            </div>

            <button
              onClick={() => setIsSyllabusOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsVoiceMenuOpen((prev) => !prev)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white"
                aria-label={selectedVoice ? `Anlatıcı seç (${getVoiceLabel(selectedVoice)})` : 'Anlatıcı seç'}
                title={selectedVoice ? `Anlatıcı: ${getVoiceLabel(selectedVoice)}` : 'Anlatıcı seç'}
              >
                <Languages className="w-4 h-4" />
              </button>
              {isVoiceMenuOpen && (
                <div className="absolute right-0 top-12 z-30 w-72 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#121521] p-2 shadow-2xl shadow-black/40">
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

          {currentCategory.description && (
            <p className="text-xs text-text-muted mb-4 px-1 leading-relaxed">
              {currentCategory.description}
            </p>
          )}

          {/* Children Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {children.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Folder className="w-12 h-12 text-text-muted opacity-20 mb-3" />
                <p className="text-sm font-bold text-text-muted">Henüz alt başlık eklenmedi</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-6">
                {children.map((cat) => (
                  <MobileCategoryCard
                    key={cat._id}
                    category={cat}
                    parentColor={catColor}
                    onClick={handleMobileNodeClick}
                    user={user}
                    completedIds={completedIds}
                    allCategories={allCategories}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
  };

export const MobileLessonReader = ({
  selectedLesson,
  setSelectedLesson,
  setIsSyllabusOpen,
  handleToggleLessonReading,
  user,
  isReadingLesson,
  isVoiceMenuOpen,
  setIsVoiceMenuOpen,
  availableVoices,
  selectedVoiceKey,
  handleSelectVoice,
  selectedVoice,
  scrollProgress,
  handleScroll,
  setPreviewImage,
  navigate,
  passedTestIds,
  handleMarkComplete,
  completedIds,
  getNextLesson,
  handleSelect,
  allCategories,
  setMobileNavStack,
  selectedLessonImage,
  contentIncludesSelectedImage,
  handleProInterest,
}) => {
    const wordCount = selectedLesson.content ? selectedLesson.content.split(/\s+/).filter(Boolean).length : 0;
    const readingTimeMin = Math.ceil(wordCount / 200);
    const readingTimeStr = readingTimeMin > 1 ? `${readingTimeMin} dk` : '1 dk';

    const nextLesson = getNextLesson();

    return (
      <div className="flex flex-col flex-1 h-full bg-[#0b0d12]">
        {/* Header */}
        <div className="relative flex items-center justify-between gap-3 p-4 border-b border-white/10 bg-[#11141b]">
          <button
            onClick={() => setSelectedLesson(null)}
            className="p-1 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="flex-1 text-xs font-black text-white uppercase tracking-wider truncate text-center px-2">
            {selectedLesson.name}
          </h2>

          <button
            onClick={() => setIsSyllabusOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleLessonReading}
            disabled={selectedLesson.isPro && !user?.proStatus}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={isReadingLesson ? 'Dinletmeyi durdur' : 'Konuyu dinlet'}
            title={isReadingLesson ? 'Dinletmeyi durdur' : 'Konuyu dinlet'}
          >
            {isReadingLesson ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setIsVoiceMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white"
              aria-label={selectedVoice ? `Anlatıcı seç (${getVoiceLabel(selectedVoice)})` : 'Anlatıcı seç'}
              title={selectedVoice ? `Anlatıcı: ${getVoiceLabel(selectedVoice)}` : 'Anlatıcı seç'}
            >
              <Languages className="w-4 h-4" />
            </button>
            {isVoiceMenuOpen && (
              <div className="absolute right-0 top-12 z-30 w-72 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#121521] p-2 shadow-2xl shadow-black/40">
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

        {/* Scroll Progress Bar */}
        <div className="sticky top-0 left-0 w-full h-[2px] bg-white/5 z-20">
          <div className="h-full bg-[#3ecfcf] transition-all duration-100" style={{ width: `${scrollProgress * 100}%` }} />
        </div>

        {/* Reader Scroll Body */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-5 space-y-6 custom-scrollbar"
          onScroll={handleScroll}
        >
          {/* Cover Card */}
          <div className="w-full p-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-[#1a1e38] to-[#111428] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#3ecfcf] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#6c63ff]/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-black text-white leading-tight truncate">{selectedLesson.name}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-text-secondary">
                <Clock className="w-3.5 h-3.5" />
                <span>{readingTimeStr} okuma süresi</span>
              </div>
            </div>
          </div>

          {/* Main Markdown Body */}
          {selectedLesson.isPro && !user?.proStatus ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <div className="w-16 h-16 rounded-[24px] border-2 border-dashed border-warning/30 flex items-center justify-center">
                <Lock className="w-8 h-8 text-warning/30" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">PRO İçerik</h4>
                <p className="text-text-muted text-xs max-w-xs mt-2 leading-relaxed">
                  Bu ders içeriği yalnızca PRO üyelere açıktır. Premium abonelik işlemleri web sürümünde desteklenmemektedir; şu an için yalnızca Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={handleProInterest}
                className="rounded-xl bg-warning px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-warning/15 transition-all"
              >
                PRO'ya Geç
              </button>
            </div>
          ) : (
            <div className="prose prose-invert prose-xs max-w-none 
              prose-headings:font-black prose-headings:tracking-tight prose-headings:text-white
              prose-h1:text-lg prose-h2:text-base prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
              prose-p:text-slate-200/90 prose-p:text-xs prose-p:leading-6
              prose-strong:text-white prose-strong:font-black
              prose-img:rounded-xl prose-img:shadow-md prose-img:border prose-img:border-white/10 prose-img:mx-auto prose-img:max-h-[220px] prose-img:object-contain
              prose-li:text-white/85 prose-li:leading-6 prose-ul:space-y-1
              prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-white/[0.01] prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-blockquote:text-text-secondary
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ src, alt }) => (
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ src: resolveMediaUrl(src), alt: alt || selectedLesson.name })}
                      className="not-prose group relative mx-auto my-4 block overflow-hidden rounded-xl border border-white/10 bg-black/20"
                    >
                      <img
                        src={resolveMediaUrl(src)}
                        alt={alt || ''}
                        className="max-h-[220px] max-w-full object-contain"
                      />
                      <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/70 text-white shadow-lg">
                        <ZoomIn className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  ),
                }}
              >
                {selectedLesson.content}
              </ReactMarkdown>

              {selectedLessonImage && !contentIncludesSelectedImage && (
                <div className="not-prose mt-6">
                   <button
                     type="button"
                     onClick={() => setPreviewImage({ src: selectedLessonImage, alt: selectedLesson.name })}
                     className="group relative mx-auto block w-full overflow-hidden rounded-xl border border-white/10 bg-black/20"
                   >
                     <img
                       src={selectedLessonImage}
                       alt={selectedLesson.name}
                       className="w-full object-contain"
                     />
                     <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/70 text-white shadow-lg">
                       <ZoomIn className="h-3.5 w-3.5" />
                     </span>
                   </button>
                </div>
              )}

              {/* Pekiştirme Kartı */}
              <div className="mt-12 pt-8 border-t border-white/10 pb-6 not-prose">
                <div className="relative overflow-hidden rounded-3xl border border-success/20 bg-gradient-to-br from-[#12221b] via-[#0d0f14] to-transparent p-5 text-center shadow-xl">
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-success" />
                    </div>
                    <h4 className="text-base font-black text-white tracking-tight">Bu Konuyu Öğrendin mi?</h4>
                    <p className="text-xs font-semibold text-text-secondary mt-2 leading-relaxed">
                      Konuyu pekiştirmek için sana özel hazırlanan değerlendirme testine gir. Yanlışlarını anında detaylı açıklamalarla gör.
                    </p>
                    
                    <button 
                      onClick={() => navigate(`/dashboard/exams/short-test/${selectedLesson._id}`)}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-success hover:bg-success/90 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-success/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white text-white" />
                      Konu Testini Başlat
                    </button>

                    <div className="mt-4 flex flex-col w-full gap-2.5">
                      {passedTestIds.includes(selectedLesson._id) ? (
                        <button
                          onClick={handleMarkComplete}
                          className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                            completedIds.includes(selectedLesson._id)
                              ? 'bg-success/20 border border-success/30 text-success'
                              : 'bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {completedIds.includes(selectedLesson._id) ? 'TAMAMLANDI ✓' : 'KONUYU TAMAMLANDI İŞARETLE'}
                        </button>
                      ) : (
                        <div className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-text-muted text-xs font-black uppercase tracking-widest opacity-50 cursor-not-allowed">
                          <Lock className="w-4 h-4" />
                          Önce testi geçmelisin
                        </div>
                      )}

                      {nextLesson && (
                        <button
                          onClick={() => {
                            if (nextLesson.content?.trim()) {
                              handleSelect(nextLesson);
                            } else {
                              setSelectedLesson(null);
                              const parentId = nextLesson.parent?._id || nextLesson.parent;
                              const parentNode = allCategories.find(c => c._id === parentId);
                              if (parentNode && parentNode._id !== user?.selectedCategoryId) {
                                setMobileNavStack([parentNode, nextLesson]);
                              } else {
                                setMobileNavStack([nextLesson]);
                              }
                            }
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary/15 border border-primary/20 text-primary-light rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/25 transition-all cursor-pointer"
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
      </div>
    );
  };
