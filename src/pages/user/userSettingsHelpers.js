import {
  Award, Star, Trophy, Zap, Crown, Target, Flame, Shield, Gem, Medal, Rocket, Heart, BookOpen, CheckCircle2
} from 'lucide-react';

// Lucide icon name → component map (backend badge icon alanı string gelir)
export const BADGE_ICON_MAP = {
  Award, Star, Trophy, Zap, Crown, Target, Flame, Shield, Gem, Medal, Rocket, Heart, BookOpen, CheckCircle2
};

export const formatExamDate = (value) => {
  if (!value) return 'Tarih seçilmedi';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return 'Tarih seçilmedi';
  return new Date(year, month - 1, day).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const getSortedBadges = (badgeList) => {
  const typeOrder = {
    'exam_count': 1,
    'streak': 2,
    'question_count': 3,
    'correct_count': 4,
    'daily_goal': 5,
    'success_rate': 6
  };
  return [...badgeList].sort((a, b) => {
    const orderA = typeOrder[a.type] || 99;
    const orderB = typeOrder[b.type] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return (Number(a.requiredValue) || 0) - (Number(b.requiredValue) || 0);
  });
};

export const desktopFieldClass = "w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-primary/50 focus:bg-primary/5 focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50";

// Static badge fallback list (stats + user bağımlılığı parametreye çevrildi)
export const buildDefaultBadges = (stats, user) => [
  // Sınav Tamamlama Rozetleri
  { id: '1', name: 'İlk Adım', description: 'İlk sınavını tamamla.', icon: '🎯', color: '#6C63FF', isEarned: stats.totalExams >= 1 },
  { id: '2', name: 'Sınav Dostu', description: '5 sınav tamamla.', icon: '💪', color: '#3ECFCF', isEarned: stats.totalExams >= 5 },
  { id: '3', name: 'Çalışkan', description: '20 sınav tamamla.', icon: '📚', color: '#FFB74D', isEarned: stats.totalExams >= 20 },
  { id: '4', name: 'Uzman', description: '50 sınav tamamla.', icon: '🎓', color: '#4CAF50', isEarned: stats.totalExams >= 50 },
  { id: '4_2', name: 'Kral Sürücü', description: '100 sınav tamamla.', icon: '👑', color: '#D32F2F', isEarned: stats.totalExams >= 100 },

  // Günlük Seri Rozetleri
  { id: '5', name: '3 Gün Serisi', description: '3 gün üst üste çalış.', icon: '🔥', color: '#FF7043', isEarned: (user?.streak || 0) >= 3 },
  { id: '6', name: 'Haftalık Kahraman', description: '7 gün üst üste çalış.', icon: '⚡', color: '#FFB74D', isEarned: (user?.streak || 0) >= 7 },
  { id: '7', name: 'Efsane', description: '30 gün kesintisiz çalış.', icon: '👑', color: '#FFD700', isEarned: (user?.streak || 0) >= 30 },

  // Toplam Soru Çözme Rozetleri (Backend ve Veritabanı Varsayılanları)
  { id: '8', name: 'Çaylak', description: '200 soru çöz.', icon: '🥉', color: '#CD7F32', isEarned: stats.totalQuestions >= 200 },
  { id: '9', name: 'Azimli', description: '400 soru çöz.', icon: '🥈', color: '#C0C0C0', isEarned: stats.totalQuestions >= 400 },
  { id: '10', name: 'Kararlı', description: '600 soru çöz.', icon: '🥇', color: '#FFD700', isEarned: stats.totalQuestions >= 600 },
  { id: '11', name: 'Tecrübeli', description: '900 soru çöz.', icon: '🔮', color: '#9C27B0', isEarned: stats.totalQuestions >= 900 },
  { id: '12', name: 'Usta', description: '1200 soru çöz.', icon: '💎', color: '#00BCD4', isEarned: stats.totalQuestions >= 1200 },
  { id: '13', name: 'Efsane Sürücü', description: '1600 soru çöz.', icon: '🔥', color: '#FF5722', isEarned: stats.totalQuestions >= 1600 },
  { id: '14', name: 'Şampiyon', description: '2000 soru çöz.', icon: '👑', color: '#F44336', isEarned: stats.totalQuestions >= 2000 },
  { id: '14_2', name: 'Yolun Hakimi', description: '3000 soru çöz.', icon: '👮', color: '#1E88E5', isEarned: stats.totalQuestions >= 3000 },

  // Doğru Soru Çözme Rozetleri
  { id: '15', name: 'Yüzlük', description: '100 doğru cevap ver.', icon: '✅', color: '#4CAF50', isEarned: stats.totalCorrect >= 100 },
  { id: '16', name: 'Doğruluk Ustası', description: '500 doğru cevap ver.', icon: '🌟', color: '#6C63FF', isEarned: stats.totalCorrect >= 500 },
  { id: '16_2', name: 'Doğruluk Abidesi', description: '1000 doğru cevap ver.', icon: '🎯', color: '#FFEB3B', isEarned: stats.totalCorrect >= 1000 },
  { id: '17', name: 'Mükemmel', description: 'Bir sınavdan 100% al.', icon: '🏆', color: '#FFD700', isEarned: stats.successRate >= 99 }
];
