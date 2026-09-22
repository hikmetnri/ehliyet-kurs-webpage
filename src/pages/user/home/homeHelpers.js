import {
  Activity, AlertCircle, BookOpen, FileQuestion, GraduationCap, RefreshCcw, Settings2, ShieldCheck, Target,
} from 'lucide-react';
import { TEST_TYPES } from '../../../constants/testTypes';

export const getStoredExamDate = () => {
  try {
    return localStorage.getItem('exam_date') || '';
  } catch {
    return '';
  }
};

export const getExamCountdown = (dateValue) => {
  if (!dateValue) return null;

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const examStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const diffDays = Math.ceil((examStart - todayStart) / 86400000);

  return {
    date: parsed,
    days: Math.abs(diffDays),
    isPast: diffDays < 0,
    isToday: diffDays === 0,
    formatted: parsed.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
  };
};

export const planIconByType = {
  select_category: ShieldCheck,
  [TEST_TYPES.WRONG_REVIEW]: RefreshCcw,
  weak_topic: BookOpen,
  lesson: BookOpen,
  daily_goal: Target,
  [TEST_TYPES.SHORT_TEST]: FileQuestion,
  [TEST_TYPES.MOCK_EXAM]: GraduationCap,
};

export const planRouteByAction = {
  [TEST_TYPES.WRONG_REVIEW]: '/dashboard/exams/wrong-review',
  weak_topic: '/dashboard/lessons',
  lesson: '/dashboard/lessons',
  daily_goal: '/dashboard/exams',
  [TEST_TYPES.SHORT_TEST]: '/dashboard/exams',
  [TEST_TYPES.MOCK_EXAM]: '/dashboard/exams',
  stats: '/dashboard/stats',
};

export const getCategoryIcon = (name) => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('trafik') || lowercaseName.includes('levha') || lowercaseName.includes('işaret')) {
    return AlertCircle;
  }
  if (lowercaseName.includes('motor') || lowercaseName.includes('araç') || lowercaseName.includes('teknik')) {
    return Settings2;
  }
  if (lowercaseName.includes('ilkyardım') || lowercaseName.includes('ilk yardım') || lowercaseName.includes('sağlık')) {
    return Activity;
  }
  if (lowercaseName.includes('adab') || lowercaseName.includes('çevre') || lowercaseName.includes('davranış')) {
    return ShieldCheck;
  }
  return BookOpen;
};

export const getCategoryColor = (name) => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('trafik')) return '#06b6d4'; // Cyan
  if (lowercaseName.includes('motor')) return '#f59e0b'; // Amber/Orange
  if (lowercaseName.includes('ilkyardım')) return '#ef4444'; // Red
  if (lowercaseName.includes('adab')) return '#10b981'; // Green
  return '#6366f1'; // Purple/Indigo
};
