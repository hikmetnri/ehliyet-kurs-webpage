import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  FolderOpen,
  Loader2,
  PlayCircle,
  Video,
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
    <div className="space-y-5 pb-20 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Video Eğitimler</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            {showingUncategorized ? 'Kategorisiz Videolar' : selectedCategory ? selectedCategory.name : 'Video Dersler'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-text-secondary">
            {selectedCategory?.description || 'Online video bağlantıları ve ders notları tek yerde.'}
          </p>
        </div>
        {(selectedCategory || showingUncategorized) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategoryId('');
              setSelectedVideo(null);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Kategoriler
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
              <button
                key={category._id}
                type="button"
                onClick={() => setSelectedCategoryId(category._id)}
                className="group flex min-h-40 items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <FolderOpen className="h-7 w-7 text-primary-light" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-black">{category.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-relaxed text-text-muted">
                    {category.description || `${count} video ders`}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-light">
                    {count} video
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,420px)_1fr]">
          <div className="space-y-3">
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
                    className={`group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      active
                        ? 'border-primary/35 bg-primary/15'
                        : 'border-white/10 bg-white/[0.035] hover:border-primary/25 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                      <PlayCircle className="h-5 w-5 text-accent-light" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-black">{video.name}</h3>
                      <p className="mt-1 truncate text-xs font-semibold text-text-muted">{video.description || getVideoUrl(video)}</p>
                    </div>
                    {video.isPro && (
                      <span className="rounded-full bg-warning/10 px-2 py-1 text-[9px] font-black text-warning">PRO</span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <VideoPreview video={selectedVideo || visibleVideos[0]} />
        </div>
      )}

      {!selectedCategory && videos.some((video) => !categoryIds.has(video.parent?._id || video.parent)) && hasCategories && (
        <button
          type="button"
          onClick={() => setSelectedCategoryId('__uncategorized__')}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white/10"
        >
          Kategorisiz Videolar
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const VideoPreview = ({ video }) => {
  if (!video) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025] text-center">
        <p className="text-sm font-bold text-text-muted">Bir video seçin.</p>
      </div>
    );
  }

  const url = getVideoUrl(video);
  const notes = getVideoNotes(video);
  const resolvedUrl = resolveMediaUrl(url);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-bg-card/80">
      <div className="border-b border-white/10 p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-accent-light">Video Ders</p>
        <h2 className="mt-2 text-xl font-black">{video.name}</h2>
        {video.description && <p className="mt-2 text-sm font-semibold text-text-muted">{video.description}</p>}
      </div>

      <div className="p-5">
        {url && isDirectVideoUrl(url) ? (
          <video
            src={resolvedUrl}
            controls
            className="aspect-video w-full rounded-2xl border border-white/10 bg-black"
          />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-6 text-center">
            <ExternalLink className="mb-4 h-10 w-10 text-primary-light" />
            <p className="max-w-md text-sm font-semibold text-text-secondary">Bu bağlantı harici bir video platformunda açılır.</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-primary-light"
            >
              Videoyu Aç
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        {notes && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Ders Notları</p>
            <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-text-secondary">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserVideos;
