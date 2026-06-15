import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  FolderOpen,
  Inbox,
  Loader2,
  PlayCircle,
  Search,
  Video,
  Sparkles,
} from 'lucide-react';
import {
  getVideoNotes,
  getVideoUrl,
  isVideoCategory,
  isVideoCourse,
} from '../../utils/categoryContent';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const MotionDiv = motion.div;

const isDirectVideoUrl = (url) => /\.(mp4|m3u8|mov|m4v|webm)(\?|#|$)/i.test(url);

const sortByOrderAndName = (a, b) => {
  const order = (a.order || 0) - (b.order || 0);
  return order !== 0 ? order : String(a.name || '').localeCompare(String(b.name || ''), 'tr');
};

const UserVideos = () => {
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await api.get('/categories/all');
        const all = res.data?.data || res.data || [];
        const videoRows = all.filter(isVideoCourse).sort(sortByOrderAndName);
        const parentIds = new Set(videoRows.map((video) => video.parent?._id || video.parent).filter(Boolean));
        const categoryRows = all
          .filter((category) => isVideoCategory(category) || parentIds.has(category._id))
          .sort(sortByOrderAndName);

        if (!active) return;
        setCategories(categoryRows);
        setVideos(videoRows);
      } catch (err) {
        console.error('Video dersler alınamadı:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchVideos();
    return () => { active = false; };
  }, []);

  const categoryIds = useMemo(() => new Set(categories.map((category) => category._id)), [categories]);
  const selectedCategory = categories.find((category) => category._id === selectedCategoryId);
  const showingUncategorized = selectedCategoryId === '__uncategorized__';
  const uncategorizedVideos = videos.filter((video) => !categoryIds.has(video.parent?._id || video.parent));
  const visibleVideos = selectedCategoryId
    ? showingUncategorized
      ? uncategorizedVideos
      : videos.filter((video) => (video.parent?._id || video.parent) === selectedCategoryId)
    : uncategorizedVideos;
  const filteredVisibleVideos = visibleVideos.filter((video) => {
    const query = searchQuery.trim().toLocaleLowerCase('tr-TR');
    if (!query) return true;
    return `${video.name || ''} ${video.description || ''}`.toLocaleLowerCase('tr-TR').includes(query);
  });
  const categoryCards = categories.map((category) => ({
    ...category,
    count: videos.filter((video) => (video.parent?._id || video.parent) === category._id).length,
  }));
  const proVideoCount = videos.filter((video) => video.isPro).length;

  const hasCategories = categories.length > 0;
  const showCategoryGrid = hasCategories && !selectedCategoryId;
  const previewVideo = selectedVideo || filteredVisibleVideos[0] || visibleVideos[0] || null;

  const selectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedVideo(null);
    setSearchQuery('');
  };

  const resetCategory = () => {
    setSelectedCategoryId('');
    setSelectedVideo(null);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Video dersler hazırlanıyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 text-white">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary-light" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary-light">Video Eğitimler</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            {showingUncategorized ? 'Kategorisiz Videolar' : selectedCategory ? selectedCategory.name : 'Video Dersler'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-text-secondary">
            {selectedCategory?.description || 'Görsel ders anlatımları, püf noktaları ve direksiyon eğitim videoları.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <div className="grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-white/[0.025] p-2">
            {[
              ['Video', videos.length],
              ['Kategori', categories.length],
              ['PRO', proVideoCount],
            ].map(([label, value]) => (
              <div key={label} className="min-w-24 rounded-2xl bg-white/[0.035] px-4 py-3 text-center">
                <p className="text-lg font-black text-white">{value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</p>
              </div>
            ))}
          </div>

          {(selectedCategory || showingUncategorized) && (
            <button
              type="button"
              onClick={resetCategory}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Kategorilere Dön
            </button>
          )}
        </div>
      </div>

      {videos.length === 0 && categories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-16 text-center">
          <Video className="mx-auto mb-4 h-14 w-14 text-white/15" />
          <h2 className="text-lg font-black">Henüz video ders yok</h2>
          <p className="mt-2 text-sm font-semibold text-text-muted">Admin panelinden video kategorisi veya video bağlantısı eklenmeli.</p>
        </div>
      ) : showCategoryGrid ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categoryCards.map((category) => (
              <motion.button
                key={category._id}
                type="button"
                onClick={() => selectCategory(category._id)}
                className="group flex min-h-40 items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-5 text-left transition hover:border-primary/25 hover:bg-white/[0.04]"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <FolderOpen className="h-7 w-7 text-primary-light transition group-hover:scale-105" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 flex-1 truncate text-lg font-black text-white transition group-hover:text-primary-light">{category.name}</h2>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-black text-text-muted">
                      {category.count}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-text-muted">
                    {category.description || `${category.count} adet video ders içeriyor.`}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-light">
                    Video listesine geç
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1.5" />
                  </span>
                </div>
              </motion.button>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,400px)_1fr]">
          <aside className="min-h-0 space-y-4">
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
                <Search className="mr-3 h-5 w-5 text-primary-light" />
                <input
                  type="text"
                  placeholder="Bu kategoride video ara..."
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSelectedVideo(null);
                  }}
                  className="w-full border-none bg-transparent text-sm font-semibold text-white outline-none placeholder:text-text-muted"
                />
              </div>
              <div className="mt-3 flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-widest text-text-muted">
                <span>{filteredVisibleVideos.length}/{visibleVideos.length} video listeleniyor</span>
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-primary-light hover:text-white">
                    Aramayı temizle
                  </button>
                )}
              </div>
            </section>

            <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              {visibleVideos.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
                  <PlayCircle className="mx-auto mb-3 h-10 w-10 text-white/15" />
                  <p className="text-sm font-bold text-text-muted">Bu kategoride henüz video yok.</p>
                </div>
              ) : filteredVisibleVideos.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
                  <Inbox className="mx-auto mb-3 h-10 w-10 text-white/15" />
                  <p className="text-sm font-bold text-text-muted">Aramana uygun video bulunamadı.</p>
                </div>
              ) : (
                filteredVisibleVideos.map((video) => {
                const active = selectedVideo?._id === video._id;
                return (
                  <button
                    key={video._id}
                    type="button"
                    onClick={() => setSelectedVideo(video)}
                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      active
                        ? 'border-primary/45 bg-primary/15'
                        : 'border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                      active ? 'border-primary/40 bg-primary/20 text-white' : 'border-white/10 bg-white/[0.035] text-text-muted group-hover:text-white'
                    }`}>
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`truncate text-sm font-black transition-colors ${active ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>{video.name}</h3>
                      <p className="mt-1 truncate text-xs font-semibold text-text-muted">{video.description || 'Ders videosunu izlemek için tıklayın.'}</p>
                    </div>
                    {video.isPro && (
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[9px] font-black text-amber-500">PRO</span>
                    )}
                  </button>
                );
                })
              )}
            </div>
          </aside>

          <VideoPreview video={previewVideo} />
        </div>
      )}

      {!selectedCategory && uncategorizedVideos.length > 0 && hasCategories && (
        <button
          type="button"
          onClick={() => selectCategory('__uncategorized__')}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10"
        >
          Kategorisiz Videolar ({uncategorizedVideos.length})
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const getEmbedUrl = (url) => {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();
  
  // YouTube link
  if (lowerUrl.includes('youtube.com/watch') || lowerUrl.includes('youtu.be/') || lowerUrl.includes('youtube.com/embed/') || lowerUrl.includes('youtube.com/shorts/')) {
    let videoId = '';
    if (lowerUrl.includes('youtube.com/watch')) {
      try {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v') || '';
      } catch {
        // ignore url params parse errors
      }
    } else if (lowerUrl.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('/')[0] || '';
    } else if (lowerUrl.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
    } else if (lowerUrl.includes('youtube.com/shorts/')) {
      videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0] || '';
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
  }

  // Google Drive video
  if (lowerUrl.includes('drive.google.com/')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
  }

  // Vimeo video
  if (lowerUrl.includes('vimeo.com/')) {
    const vimeoIdMatch = url.match(/vimeo\.com\/([0-9]+)/);
    if (vimeoIdMatch && vimeoIdMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoIdMatch[1]}?autoplay=1`;
    }
  }

  return null;
};

const VideoPreview = ({ video }) => {
  if (!video) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025] p-6 text-center">
        <PlayCircle className="mb-3 h-12 w-12 text-white/15" />
        <p className="text-sm font-bold text-text-muted">İzlemek istediğiniz ders videosunu sol menüden seçin.</p>
      </div>
    );
  }

  const url = getVideoUrl(video);
  const notes = getVideoNotes(video);
  const resolvedUrl = resolveMediaUrl(url);
  const embedUrl = getEmbedUrl(url);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Ders Videosu</p>
        <h2 className="mt-2 text-xl font-black text-white">{video.name}</h2>
        {video.description && <p className="mt-2 text-xs font-semibold text-text-muted">{video.description}</p>}
      </div>

      <div className="p-5 sm:p-6">
        {url && isDirectVideoUrl(url) ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            <video
              src={resolvedUrl}
              controls
              className="aspect-video w-full"
            />
          </div>
        ) : embedUrl ? (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            <iframe
              src={embedUrl}
              title={video.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="aspect-video w-full"
            />
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-6 text-center">
            <ExternalLink className="mb-4 h-12 w-12 text-primary-light" />
            <p className="max-w-md text-sm font-semibold text-text-secondary">Bu bağlantı harici bir video platformunda açılmaktadır.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-primary-light"
            >
              Videoyu Yeni Sekmede Aç
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        {notes && (
          <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/5 p-5">
            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary-light">
              <Sparkles className="h-3 w-3" />
              Eğitmen Notları
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-text-secondary">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserVideos;
