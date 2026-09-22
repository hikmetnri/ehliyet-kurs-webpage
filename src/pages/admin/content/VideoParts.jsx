import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, Video, Edit3, Trash2, PlayCircle, ExternalLink, X,
} from 'lucide-react';
import api from '../../../api';
import {
  getVideoNotes,
  getVideoUrl,
  isVideoCategory,
  isVideoCourse,
} from '../../../utils/categoryContent';
import { createVideoCategoryPayload, createVideoPayload } from './contentHelpers';

const MotionDiv = motion.div;

const VideoManagementWorkspace = ({ allCategories, onRefresh }) => {
  const [categoryModal, setCategoryModal] = useState(null);
  const [videoModal, setVideoModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const videos = useMemo(
    () => allCategories.filter(isVideoCourse).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'tr')),
    [allCategories]
  );
  const videoCategories = useMemo(() => {
    const parentIds = new Set(videos.map((video) => video.parent?._id || video.parent).filter(Boolean));
    return allCategories
      .filter((category) => isVideoCategory(category) || parentIds.has(category._id))
      .sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name, 'tr'));
  }, [allCategories, videos]);
  const videoCategoryIds = new Set(videoCategories.map((category) => category._id));
  const uncategorizedVideos = videos.filter((video) => !videoCategoryIds.has(video.parent?._id || video.parent));

  const saveCategory = async (form) => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = createVideoCategoryPayload(form);
      if (form._id) await api.put(`/categories/${form._id}`, payload);
      else await api.post('/categories', payload);
      setCategoryModal(null);
      await onRefresh();
    } catch (err) {
      alert('Video kategorisi kaydedilemedi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const saveVideo = async (form) => {
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      const selectedCategory = videoCategories.find((category) => category._id === form.categoryId);
      const payload = createVideoPayload(form, selectedCategory);
      if (form._id) await api.put(`/categories/${form._id}`, payload);
      else await api.post('/categories', payload);
      setVideoModal(null);
      await onRefresh();
    } catch (err) {
      alert('Video kaydedilemedi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`"${category.name}" video kategorisini silmek istiyor musunuz?`)) return;
    try {
      await api.delete(`/categories/${category._id}`);
      await onRefresh();
    } catch (err) {
      alert('Kategori silinemedi: ' + (err.response?.data?.message || err.message));
    }
  };

  const deleteVideo = async (video) => {
    if (!window.confirm(`"${video.name}" videosunu silmek istiyor musunuz?`)) return;
    try {
      await api.delete(`/categories/${video._id}`);
      await onRefresh();
    } catch (err) {
      alert('Video silinemedi: ' + (err.response?.data?.message || err.message));
    }
  };

  const openCategoryModal = (category = null) => setCategoryModal({
    _id: category?._id || '',
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || '#E040FB',
    isPro: Boolean(category?.isPro),
    isActive: category?.isActive !== false,
  });

  const openVideoModal = (video = null, categoryId = '') => setVideoModal({
    _id: video?._id || '',
    title: video?.name || '',
    description: video?.description || '',
    categoryId: video ? (video.parent?._id || video.parent || '') : categoryId,
    url: video ? getVideoUrl(video) : '',
    notes: video ? getVideoNotes(video) : '',
    isPro: Boolean(video?.isPro),
  });

  return (
    <div className="flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.02] p-4 custom-scrollbar sm:p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Video Yönetimi</p>
          <h2 className="mt-1 text-xl font-bold text-white">Video Dersler</h2>
          <p className="mt-1 text-sm text-text-secondary">Online video bağlantılarını kategori altında yayınlayın.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => openCategoryModal()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-light transition hover:bg-primary hover:text-white"
          >
            <Folder className="h-4 w-4" /> Kategori Oluştur
          </button>
          <button
            type="button"
            onClick={() => openVideoModal()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-accent/10 hover:bg-accent/90 transition-all"
          >
            <Video className="h-4 w-4" /> Video Ekle
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary-light">Kategori</p>
          <p className="mt-1 text-2xl font-bold text-white">{videoCategories.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.015] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent-light">Video</p>
          <p className="mt-1 text-2xl font-bold text-white">{videos.length}</p>
        </div>
      </div>

      {videoCategories.length === 0 && videos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.01] px-5 py-16 text-center">
          <Video className="mx-auto mb-4 h-14 w-14 text-white/15" />
          <h3 className="text-lg font-bold text-white">Henüz video içeriği yok</h3>
          <p className="mt-2 text-sm text-text-muted">Önce kategori oluşturabilir veya doğrudan video bağlantısı ekleyebilirsiniz.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {videoCategories.map((category) => {
            const categoryVideos = videos.filter((video) => (video.parent?._id || video.parent) === category._id);
            return (
              <div key={category._id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015]">
                <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between bg-black/20">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <Folder className="h-5 w-5 text-primary-light" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-white">{category.name}</h3>
                      <p className="mt-1 truncate text-xs font-semibold text-text-muted">
                        {category.description || `${categoryVideos.length} video`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openVideoModal(null, category._id)} title="Video Ekle" className="rounded-xl border border-accent/20 bg-accent/10 p-2 text-accent-light hover:bg-accent hover:text-white transition-all"><Video className="h-4 w-4" /></button>
                    <button onClick={() => openCategoryModal(category)} title="Düzenle" className="rounded-xl border border-white/10 bg-white/5 p-2 text-text-muted hover:bg-white/10 hover:text-white transition-all"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => deleteCategory(category)} title="Sil" className="rounded-xl border border-danger/20 bg-danger/10 p-2 text-danger hover:bg-danger hover:text-white transition-all"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                {categoryVideos.length === 0 ? (
                  <p className="p-4 text-sm font-medium text-text-muted">Bu kategoriye henüz video eklenmedi.</p>
                ) : (
                  <div className="divide-y divide-white/10">
                    {categoryVideos.map((video) => (
                      <VideoRow key={video._id} video={video} onEdit={openVideoModal} onDelete={deleteVideo} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {uncategorizedVideos.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015]">
              <div className="border-b border-white/10 p-4 bg-black/20">
                <h3 className="text-sm font-bold text-white">Kategorisiz Videolar ({uncategorizedVideos.length})</h3>
              </div>
              <div className="divide-y divide-white/10">
                {uncategorizedVideos.map((video) => (
                  <VideoRow key={video._id} video={video} onEdit={openVideoModal} onDelete={deleteVideo} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {categoryModal && (
          <VideoCategoryModal
            form={categoryModal}
            saving={saving}
            onChange={setCategoryModal}
            onClose={() => setCategoryModal(null)}
            onSave={saveCategory}
          />
        )}
        {videoModal && (
          <VideoFormModal
            form={videoModal}
            categories={videoCategories}
            saving={saving}
            onChange={setVideoModal}
            onClose={() => setVideoModal(null)}
            onSave={saveVideo}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const VideoRow = ({ video, onEdit, onDelete }) => {
  const url = getVideoUrl(video);
  return (
    <div className="flex items-center gap-3 p-4 hover:bg-white/[0.025] transition-all">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/5">
        <PlayCircle className="h-5 w-5 text-accent-light" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-white">{video.name}</p>
          {video.isPro && <span className="rounded-full border border-warning/20 bg-warning/10 px-2 py-0.5 text-[9px] font-bold text-warning">PRO</span>}
        </div>
        <p className="mt-1 truncate text-xs font-semibold text-text-muted">{url || video.description}</p>
      </div>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="hidden rounded-xl border border-white/10 bg-white/5 p-2 text-text-muted hover:bg-white/10 hover:text-white transition-all sm:block">
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      <button onClick={() => onEdit(video)} title="Düzenle" className="rounded-xl border border-white/10 bg-white/5 p-2 text-text-muted hover:bg-white/10 hover:text-white transition-all"><Edit3 className="h-4 w-4" /></button>
      <button onClick={() => onDelete(video)} title="Sil" className="rounded-xl border border-danger/20 bg-danger/10 p-2 text-danger hover:bg-danger hover:text-white transition-all"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
};

const VideoCategoryModal = ({ form, saving, onChange, onClose, onSave }) => (
  <ModalShell title={form._id ? 'Video Kategorisini Düzenle' : 'Video Kategorisi Oluştur'} onClose={onClose}>
    <div className="space-y-4">
      <FormField label="Kategori adı">
        <input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} className="input-field py-3" />
      </FormField>
      <FormField label="Açıklama">
        <textarea rows={3} value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} className="input-field resize-none py-3" />
      </FormField>
      <FormField label="Renk">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.color}
            onChange={(e) => onChange({ ...form, color: e.target.value })}
            className="w-12 h-10 bg-transparent cursor-pointer rounded-xl border-none"
          />
          <span className="text-sm text-text-secondary font-mono">{form.color}</span>
        </div>
      </FormField>
      <ToggleField label="PRO kategori" checked={form.isPro} onClick={() => onChange({ ...form, isPro: !form.isPro })} />
      <button
        disabled={saving || !form.name.trim()}
        onClick={() => onSave(form)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-md shadow-primary/10 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:translate-y-0"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </div>
  </ModalShell>
);

const VideoFormModal = ({ form, categories, saving, onChange, onClose, onSave }) => (
  <ModalShell title={form._id ? 'Videoyu Düzenle' : 'Video Ekle'} onClose={onClose}>
    <div className="space-y-4">
      <FormField label="Kategori">
        <select value={form.categoryId} onChange={(e) => onChange({ ...form, categoryId: e.target.value })} className="input-field py-3">
          <option value="" className="bg-bg-card">Kategorisiz</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id} className="bg-bg-card">{category.name}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Video başlığı">
        <input value={form.title} onChange={(e) => onChange({ ...form, title: e.target.value })} className="input-field py-3" />
      </FormField>
      <FormField label="Video bağlantısı">
        <input value={form.url} onChange={(e) => onChange({ ...form, url: e.target.value })} placeholder="YouTube, Vimeo, MP4 veya HLS bağlantısı" className="input-field py-3" />
      </FormField>
      <FormField label="Kısa açıklama">
        <textarea rows={2} value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} className="input-field resize-none py-3" />
      </FormField>
      <FormField label="Ders notları">
        <textarea rows={4} value={form.notes} onChange={(e) => onChange({ ...form, notes: e.target.value })} className="input-field resize-none py-3" />
      </FormField>
      <ToggleField label="PRO içerik" checked={form.isPro} onClick={() => onChange({ ...form, isPro: !form.isPro })} />
      <button
        disabled={saving || !form.title.trim() || !form.url.trim()}
        onClick={() => onSave(form)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-md shadow-primary/10 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:translate-y-0"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </div>
  </ModalShell>
);

const ModalShell = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
    <MotionDiv
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.96, opacity: 0 }}
      className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-bg-card p-5 shadow-2xl custom-scrollbar"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 p-2 text-text-muted hover:bg-white/10 hover:text-white transition-all"><X className="h-5 w-5" /></button>
      </div>
      {children}
    </MotionDiv>
  </div>
);

const FormField = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</span>
    {children}
  </label>
);

const ToggleField = ({ label, checked, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all ${
      checked ? 'border-warning/20 bg-warning/5 text-warning' : 'border-white/10 bg-black/20 text-text-secondary hover:bg-black/30'
    }`}
  >
    <span>{label}</span>
    <div className={`relative h-6 w-11 rounded-full p-1 transition-colors duration-200 ease-in-out ${checked ? 'bg-warning' : 'bg-white/10'}`}>
      <div className={`h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </button>
);

export default VideoManagementWorkspace;
