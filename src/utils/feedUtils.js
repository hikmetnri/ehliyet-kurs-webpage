import {
  FileText, HelpCircle, Lightbulb, MessageSquare,
} from 'lucide-react';

export const POST_TYPES = {
  discussion: {
    label: 'Tartışma',
    icon: MessageSquare,
    color: '#3b82f6',
    tw: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
  },
  question: {
    label: 'Soru',
    icon: HelpCircle,
    color: '#f97316',
    tw: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/40',
  },
  exam_share: {
    label: 'Sınav',
    icon: FileText,
    color: '#a855f7',
    tw: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/40',
  },
  tip: {
    label: 'İpucu',
    icon: Lightbulb,
    color: '#10b981',
    tw: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
  },
};

const AVATAR_COLORS = [
  'from-violet-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
];

export function getAvatarGrad(name = '') {
  const code = name.charCodeAt(0) || 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export function timeAgo(dateString) {
  if (!dateString) return '-';

  const diff = (Date.now() - new Date(dateString)) / 1000;
  if (!Number.isFinite(diff)) return '-';
  if (diff < 60) return 'Az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;

  return new Date(dateString).toLocaleDateString('tr-TR');
}

export function normalizeUserId(user) {
  return user?.id || user?._id || '';
}

export function getPostTypeConfig(type) {
  return POST_TYPES[type] || POST_TYPES.discussion;
}
