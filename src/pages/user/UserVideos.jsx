import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  FolderOpen,
  Loader2,
  PlayCircle,
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
  const visibleVideos = selectedCategoryId
    ? showingUncategorized
      ? videos.filter((video) => !categoryIds.has(video.parent?._id || video.parent))
      : videos.filter((video) => (video.parent?._id || video.parent) === selectedCategoryId)
    : videos.filter((video) => !categoryIds.has(video.parent?._id || video.parent));

  const hasCategories = categories.length > 0;
  const showCategoryGrid = hasCategories && !selectedCategoryId;

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
      
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary-light flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Video Eğitimler
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            {showingUncategorized ? 'Kategorisiz Videolar' : selectedCategory ? selectedCategory.name : 'Video Dersler'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-text-secondary">
            {selectedCategory?.description || 'Görsel ders anlatımları, püf noktaları ve direksiyon eğitim videoları.'}
          </p>
        </div>
        {(selectedCategory || showingUncategorized) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategoryId('');
              setSelectedVideo(null);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4.5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Kategorilere Dön
          </button>
        )}
      </div>

      {videos.length === 0 && categories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-16 text-center">
          <Video className="mx-auto mb-4 h-14 w-14 text-white/15" />
          <h2 className="text-lg font-black">Henüz video ders yok</h2>
          <p className="mt-2 text-sm font-semibold text-text-muted">Admin panelinden video kategorisi veya video bağlantısı eklenmeli.</p>
        </div>
      ) : showCategoryGrid ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const count = videos.filter((video) => (video.parent?._id || video.parent) === category._id).length;
            return (
              <motion.button
                key={category._id}
                whileHover={{ y: -4 }}
                type="button"
                onClick={() => setSelectedCategoryId(category._id)}
                className="group flex min-h-40 items-center gap-4 rounded-[2rem] border border-white/5 bg-[#131522]/80 backdrop-blur-xl p-6 text-left transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-[0_0_30px_-10px_rgba(139,92,246,0.2)] cursor-pointer"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <FolderOpen className="h-7 w-7 text-primary-light" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-black text-white group-hover:text-primary-light transition-colors">{category.name}</h2>
                  <p className="mt-2 line-clamp-2 text-xs font-semibold leading-relaxed text-text-muted">
                    {category.description || `${count} adet video ders içeriyor.`}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-light">
                    {count} video ders
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1.5" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,400px)_1fr]">
          
          {/* Left Panel: Video list in selected category */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {visibleVideos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-8 text-center">
                <PlayCircle className="mx-auto mb-3 h-10 w-10 text-white/15" />
                <p className="text-sm font-bold text-text-muted">Bu kategoride henüz video yok.</p>
              </div>
            ) : (
              visibleVideos.map((video) => {
                const active = selectedVideo?._id === video._id;
                return (
                  <button
                    key={video._id}
                    type="button"
                    onClick={() => setSelectedVideo(video)}
                    className={`group flex w-full items-center gap-4.5 rounded-2xl border p-4.5 text-left transition-all duration-300 cursor-pointer ${
                      active
                        ? 'border-primary/45 bg-primary/15 shadow-[0_0_20px_-8px_rgba(139,92,246,0.3)]'
                        : 'border-white/5 bg-[#131522]/60 hover:border-white/15 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                      active ? 'border-primary/40 bg-primary/20 text-white' : 'border-white/10 bg-black/20 text-text-muted group-hover:scale-105 group-hover:text-white'
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

          {/* Right Panel: Video player preview */}
          <VideoPreview video={selectedVideo || visibleVideos[0]} />
        </div>
      )}

      {!selectedCategory && videos.some((video) => !categoryIds.has(video.parent?._id || video.parent)) && hasCategories && (
        <button
          type="button"
          onClick={() => setSelectedCategoryId('__uncategorized__')}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4.5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer"
        >
          Kategorisiz Videolar
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
      } catch (e) {}
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
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-white/5 bg-[#131522]/40 text-center p-6">
        <PlayCircle className="w-12 h-12 text-white/15 mb-3" />
        <p className="text-sm font-bold text-text-muted">İzlemek istediğiniz ders videosunu sol menüden seçin.</p>
      </div>
    );
  }

  const url = getVideoUrl(video);
  const notes = getVideoNotes(video);
  const resolvedUrl = resolveMediaUrl(url);
  const embedUrl = getEmbedUrl(url);

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#131522]/80 backdrop-blur-xl shadow-2xl">
      {/* Ambient glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      
      <div className="border-b border-white/5 p-6 sm:p-8 relative z-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Ders Videosu</p>
        <h2 className="mt-2 text-xl font-black text-white">{video.name}</h2>
        {video.description && <p className="mt-2 text-xs font-semibold text-text-muted">{video.description}</p>}
      </div>

      <div className="p-6 sm:p-8 relative z-10">
        {url && isDirectVideoUrl(url) ? (
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-lg">
            <video
              src={resolvedUrl}
              controls
              className="aspect-video w-full"
            />
          </div>
        ) : embedUrl ? (
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-lg">
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
          <div className="flex aspect-video flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-6 text-center shadow-lg">
            <ExternalLink className="mb-4 h-12 w-12 text-primary-light" />
            <p className="max-w-md text-sm font-semibold text-text-secondary">Bu bağlantı harici bir video platformunda açılmaktadır.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/20"
            >
              Videoyu Yeni Sekmede Aç
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        {notes && (
          <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/5 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-light flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
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
