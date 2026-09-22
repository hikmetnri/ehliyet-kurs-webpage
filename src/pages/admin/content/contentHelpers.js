import api from '../../../api';
import { VIDEO_CATEGORY_MARKER } from '../../../utils/categoryContent';

export const uploadImage = async (file) => {
  const fd = new FormData();
  fd.append('image', file);
  const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data.url || res.data.path || '';
};

export const QUESTION_DIFFICULTY_META = {
  easy: { label: 'Kolay', badge: 'bg-success/10 text-success border-success/20', active: 'bg-success text-white shadow-success/20' },
  medium: { label: 'Orta', badge: 'bg-warning/10 text-warning border-warning/20', active: 'bg-warning text-white shadow-warning/20' },
  hard: { label: 'Zor', badge: 'bg-danger/10 text-danger border-danger/20', active: 'bg-danger text-white shadow-danger/20' },
};

export const createQuestionForm = (question = null) => ({
  text: question?.text || '',
  options: question?.options?.length
    ? [...question.options, ...Array(Math.max(0, 4 - question.options.length)).fill('')]
    : ['', '', '', ''],
  correctAnswer: Number.isInteger(question?.correctAnswer) ? question.correctAnswer : 0,
  difficulty: question?.difficulty || 'medium',
  explanation: question?.explanation || '',
  media: question?.media || '',
});

export const optionLabel = (index) => String.fromCharCode(65 + index);

export const getQuestionPerformance = (question) => {
  const total = (question.correctCount || 0) + (question.wrongCount || 0);
  return {
    total,
    rate: total > 0 ? Math.round(((question.correctCount || 0) / total) * 100) : null,
  };
};

export const PUBLICATION_META = {
  draft: {
    label: 'TASLAK',
    shortLabel: 'Taslak',
    badge: 'border-warning/20 bg-warning/10 text-warning',
  },
  published: {
    label: 'YAYINDA',
    shortLabel: 'Yayında',
    badge: 'border-success/20 bg-success/10 text-success',
  },
  published_with_draft: {
    label: 'TASLAK VAR',
    shortLabel: 'Taslak',
    badge: 'border-primary/20 bg-primary/10 text-primary-light',
  },
};

export const getPublicationStatus = (category) => category?.publicationStatus || 'published';
export const categoryHasDraft = (category) => ['draft', 'published_with_draft'].includes(getPublicationStatus(category));
export const getEditableCategoryContent = (category) => {
  if (!category) return '';
  return categoryHasDraft(category) ? (category.draftContent || '') : (category.content || '');
};
export const getPublicationMeta = (category) => PUBLICATION_META[getPublicationStatus(category)] || PUBLICATION_META.published;
export const getContentVersions = (category) => (category?.contentVersions || []).filter(version => (version?.content || '').trim());
export const formatContentDate = (value) => {
  if (!value) return 'Tarih yok';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export const createVideoCategoryPayload = (form) => ({
  name: form.name.trim(),
  description: form.description.trim(),
  content: VIDEO_CATEGORY_MARKER,
  icon: 'video_library',
  color: form.color || '#E040FB',
  isPro: Boolean(form.isPro),
  isActive: form.isActive !== false,
  parent: null,
});

export const createVideoPayload = (form, category) => {
  const notes = form.notes.trim();
  const url = form.url.trim();
  return {
    name: form.title.trim(),
    description: form.description.trim(),
    parent: form.categoryId || null,
    content: notes ? `@[video](${url})\n\n${notes}` : `@[video](${url})`,
    icon: 'play_circle',
    color: category?.color || '#6C63FF',
    isPro: Boolean(form.isPro),
    isActive: true,
  };
};
