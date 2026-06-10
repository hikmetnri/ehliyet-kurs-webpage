import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, Bell, Camera, Loader2, Save, AlertCircle, CheckCircle2, ShieldAlert, ShieldCheck, CalendarDays, Trash2, MapPinned, ArrowRight,
  BarChart2, Star, Headphones, PlayCircle, TriangleAlert, MessagesSquare, BookOpen, Trophy, Award, HelpCircle, Info, LogOut, ChevronRight, ChevronDown, X, Sparkles, Bot,
  Settings, RefreshCw, LayoutGrid
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api';
import { TURKEY_CITIES, getDistrictsForCity } from '../../data/turkeyLocations';
import CategorySelectorModal from '../../components/user/CategorySelectorModal';

const getStoredExamDateInput = () => {
  try {
    const value = localStorage.getItem('exam_date');
    if (!value) return '';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
  } catch {
    return '';
  }
};

const getProfileSignLibraryLabel = (categoryName) => {
  const normalized = String(categoryName || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[ç]/g, 'c')
    .replace(/[ğ]/g, 'g')
    .replace(/[ıi]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ş]/g, 's')
    .replace(/[ü]/g, 'u');

  const isWorkSafety = [
    'is makinesi',
    'operator',
    'forklift',
    'vinc',
    'kepce',
    'g sinif',
    'is guvenligi',
    'isg',
  ].some((keyword) => normalized.includes(keyword));

  return isWorkSafety ? 'İş Sağlığı Levhaları' : 'Trafik Levhaları';
};

const UserSettings = () => {
  const { user, setAuth, token, logout } = useAuthStore();
  const fileInputRef = useRef(null);
  const examDateInputRef = useRef(null);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Mobile Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isNotifSettingsOpen, setIsNotifSettingsOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Modal Data States
  const [badges, setBadges] = useState([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('weekly');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const [stats, setStats] = useState({ totalExams: 0, totalQuestions: 0, totalCorrect: 0, successRate: 0 });

  // Load stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/exam-results/stats');
        setStats(res.data?.stats || res.data || {});
      } catch (err) {
        console.error("Stats load err:", err);
      }
    };
    fetchStats();
  }, []);

  // Fetch Badges
  useEffect(() => {
    if (!isBadgesOpen && activeTab !== 'badges') return;
    const fetchBadges = async () => {
      setBadgesLoading(true);
      try {
        const res = await api.get('/badges/my');
        setBadges(res.data || []);
      } catch (err) {
        console.error("Badges load err:", err);
      } finally {
        setBadgesLoading(false);
      }
    };
    fetchBadges();
  }, [isBadgesOpen, activeTab]);

  // Fetch Leaderboard
  useEffect(() => {
    if (!isLeaderboardOpen && activeTab !== 'leaderboard') return;
    const fetchLeaderboard = async () => {
      setLeaderboardLoading(true);
      try {
        const res = await api.get(`/exam-results/leaderboard?period=${leaderboardPeriod}`);
        setLeaderboardData(res.data || []);
      } catch (err) {
        console.error("Leaderboard load err:", err);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    fetchLeaderboard();
  }, [isLeaderboardOpen, leaderboardPeriod, activeTab]);

  // Fetch FAQs
  useEffect(() => {
    if (!isFaqOpen && activeTab !== 'faq') return;
    const fetchFaqs = async () => {
      setFaqsLoading(true);
      try {
        const res = await api.get('/faqs');
        setFaqs(res.data || []);
      } catch (err) {
        console.error("Faqs load err:", err);
      } finally {
        setFaqsLoading(false);
      }
    };
    fetchFaqs();
  }, [isFaqOpen, activeTab]);

  // Tab 1: Profile
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    city: TURKEY_CITIES.includes(user?.city) ? user.city : '',
    district: getDistrictsForCity(user?.city).includes(user?.district) ? user.district : '',
    bio: user?.bio || '',
  });

  // Tab 2: Account (Password)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Tab 3: Notifications
  const [notifData, setNotifData] = useState({
    notifEnabled: user?.notifEnabled ?? true,
    dailyGoal: user?.dailyGoal || 20,
    notifHour: user?.notifHour || 20,
    notifMinute: user?.notifMinute || 0,
    examDate: user?.examDate ? user.examDate.slice(0, 10) : getStoredExamDateInput(),
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileCityChange = (e) => {
    const city = e.target.value;
    setProfileData((current) => ({
      ...current,
      city,
      district: getDistrictsForCity(city).includes(current.district) ? current.district : '',
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleNotifChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotifData({ ...notifData, [name]: type === 'checkbox' ? checked : value });
  };

  const openExamDatePicker = () => {
    const input = examDateInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        return;
      } catch {
        // Bazı tarayıcılar showPicker çağrısını kısıtlayabiliyor; focus/click fallback yeterli.
      }
    }

    input.focus();
    input.click();
  };

  const saveProfile = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        setAuth({ ...user, ...res.data.user }, token);
        showMessage('success', 'Profil bilgileriniz başarıyla güncellendi.');
        return true;
      }
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Profil güncellenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
    return false;
  };

  const savePassword = async (e) => {
    if (e) e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'Yeni şifreler eşleşmiyor.');
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Yeni şifre en az 6 karakter olmalıdır.');
      return false;
    }
    setLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        showMessage('success', 'Şifreniz başarıyla değiştirildi.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        return true;
      }
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Şifre değiştirilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
    return false;
  };

  const savePreferences = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        dailyGoal: notifData.dailyGoal,
        notifEnabled: notifData.notifEnabled,
        notifHour: notifData.notifHour,
        notifMinute: notifData.notifMinute,
        examDate: notifData.examDate || null
      });
      if (res.data.success) {
        if (notifData.examDate) localStorage.setItem('exam_date', new Date(notifData.examDate).toISOString());
        else localStorage.removeItem('exam_date');
        setAuth({ ...user, ...res.data.user }, token);
        showMessage('success', 'Tercihleriniz başarıyla kaydedildi.');
        return true;
      }
    } catch {
      showMessage('error', 'Tercihler kaydedilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    try {
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setAuth({ ...user, avatarUrl: res.data.avatarUrl }, token);
        showMessage('success', 'Profil fotoğrafı başarıyla güncellendi.');
      }
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'Fotoğraf yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profil Bilgileri' },
    { id: 'account', icon: Lock, label: 'Hesap Güvenliği' },
    { id: 'notifications', icon: Bell, label: 'Tercihler' },
  ];

  const desktopTabs = [
    { id: 'profile', icon: User, label: 'Profil Bilgileri' },
    { id: 'account', icon: Lock, label: 'Hesap Güvenliği' },
    { id: 'notifications', icon: Bell, label: 'Tercihler & Hedefler' },
    { id: 'badges', icon: Award, label: 'Kazanılan Rozetler' },
    { id: 'leaderboard', icon: Trophy, label: 'Liderlik Tablosu' },
    { id: 'faq', icon: HelpCircle, label: 'Yardım & SSS' },
  ];

  const settingsShortcutGroups = [
    {
      title: 'Çalışma Kısayolları',
      items: [
        { to: '/dashboard/stats', icon: BarChart2, label: 'İstatistikler', description: 'Performans ve gelişim' },
        { to: '/dashboard/ai-chat', icon: Bot, label: 'Sınav Koçu', description: 'Tam sayfa sohbet' },
        { to: '/dashboard/favorites', icon: Star, label: 'Favoriler', description: 'Kaydedilen sorular' },
        { to: '/dashboard/traffic-signs', icon: TriangleAlert, label: 'Trafik İşaretleri', description: 'Levha kütüphanesi' },
        { to: '/dashboard/videos', icon: PlayCircle, label: 'Video Dersler', description: 'Görsel anlatımlar' },
      ],
    },
    {
      title: 'Hesap ve Destek',
      items: [
        { to: '/dashboard/driving-schools', icon: MapPinned, label: 'Sürücü Kursları', description: 'Kurs arama' },
        { to: '/dashboard/support', icon: Headphones, label: 'Destek Talepleri', description: 'Mesaj ve yardım' },
      ],
    },
  ];

  const profileDistrictOptions = getDistrictsForCity(profileData.city);

  // Level calculation helper
  const getLevelInfo = (score) => {
    const s = Number(score) || 0;
    if (s < 100) {
      return {
        name: 'Stajyer Sürücü',
        color: 'text-cyan-400',
        borderColor: 'border-cyan-400',
        bgColor: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 border-cyan-500/30',
        progress: s / 100,
        hex: '#06b6d4'
      };
    } else if (s < 500) {
      return {
        name: 'Usta Adayı',
        color: 'text-purple-400',
        borderColor: 'border-purple-400',
        bgColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400 border-purple-500/30',
        progress: (s - 100) / 400,
        hex: '#a855f7'
      };
    } else if (s < 1000) {
      return {
        name: 'İleri Seviye',
        color: 'text-orange-400',
        borderColor: 'border-orange-400',
        bgColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400 border-orange-500/30',
        progress: (s - 500) / 500,
        hex: '#f97316'
      };
    } else {
      return {
        name: 'Usta Sürücü',
        color: 'text-yellow-400',
        borderColor: 'border-yellow-400',
        bgColor: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 border-yellow-500/30',
        progress: 1.0,
        hex: '#eab308'
      };
    }
  };

  const levelInfo = getLevelInfo(user?.totalScore);

  // Weekly Heatmap Activity calculation
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const activeDays = Array.from({ length: 7 }, (_, index) => {
    return index <= todayIndex && (index % 2 === 0 || index === todayIndex);
  });
  const activeCount = activeDays.filter(Boolean).length;

  // Static badge fallback list
  const DEFAULT_BADGES = [
    { id: '1', name: 'İlk Adım', description: 'İlk deneme sınavını tamamla.', icon: '🎓', color: '#06b6d4', isEarned: stats.totalExams >= 1 },
    { id: '2', name: 'Hızlı Sürücü', description: '5 deneme sınavını tamamla.', icon: '⚡', color: '#a855f7', isEarned: stats.totalExams >= 5 },
    { id: '3', name: 'Usta Yolcu', description: '10 deneme sınavını tamamla.', icon: '🏆', color: '#eab308', isEarned: stats.totalExams >= 10 },
    { id: '4', name: 'Kusursuz', description: 'Bir sınavda %90+ başarı elde et.', icon: '✨', color: '#ec4899', isEarned: stats.successRate >= 90 },
    { id: '5', name: 'Kararlı', description: 'Toplam 50 soru çöz.', icon: '🔥', color: '#f97316', isEarned: stats.totalQuestions >= 50 },
    { id: '6', name: 'Bilge', description: 'Toplam 100 soru çöz.', icon: '📚', color: '#10b981', isEarned: stats.totalQuestions >= 100 }
  ];

  const desktopFieldClass = "w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-primary/50 focus:bg-primary/5 focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50";

  const DesktopSection = ({ icon: Icon, title, description, children, action, tone = 'primary' }) => {
    const toneClass = {
      primary: 'text-primary-light bg-primary/10 border-primary/20',
      accent: 'text-accent-light bg-accent/10 border-accent/20',
      success: 'text-success bg-success/10 border-success/20',
      danger: 'text-danger bg-danger/10 border-danger/20',
    }[tone] || 'text-primary-light bg-primary/10 border-primary/20';

    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">{title}</h3>
              {description && <p className="mt-1 max-w-xl text-sm font-semibold leading-relaxed text-text-muted">{description}</p>}
            </div>
          </div>
          {action}
        </div>
        {children}
      </section>
    );
  };

  const DesktopField = ({ label, children }) => (
    <div className="space-y-2">
      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</label>
      {children}
    </div>
  );

  const formatExamDate = (value) => {
    if (!value) return 'Tarih seçilmedi';
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return 'Tarih seçilmedi';
    return new Date(year, month - 1, day).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const displayName = [profileData.firstName, profileData.lastName].filter(Boolean).join(' ') || user?.name || 'Sürücü Adayı';
  const locationLabel = [profileData.district, profileData.city].filter(Boolean).join(' / ') || 'Konum eklenmedi';
  const reminderLabel = `${String(notifData.notifHour).padStart(2, '0')}:${String(notifData.notifMinute).padStart(2, '0')}`;
  const examDateLabel = formatExamDate(notifData.examDate);
  const earnedBadges = DEFAULT_BADGES.filter((badge) => badge.isEarned).length;
  const profileCompletionItems = [
    Boolean(profileData.firstName && profileData.lastName),
    Boolean(profileData.phone),
    Boolean(profileData.city && profileData.district),
    Boolean(profileData.bio),
    Boolean(user?.avatarUrl),
  ];
  const profileCompletion = Math.round((profileCompletionItems.filter(Boolean).length / profileCompletionItems.length) * 100);
  const desktopProfileHighlights = [
    {
      label: 'Eğitim Paketi',
      value: user?.selectedCategoryName || 'Kategori seçilmedi',
      detail: user?.selectedCategoryId ? 'Web arayüzünde sabit' : 'İlk seçim bekleniyor',
      icon: LayoutGrid,
      tone: 'primary',
    },
    {
      label: 'Konum',
      value: locationLabel,
      detail: profileData.city ? 'Kurs önerileri için kullanılır' : 'Profilinden ekleyebilirsin',
      icon: MapPinned,
      tone: 'accent',
    },
    {
      label: 'Günlük Hedef',
      value: `${notifData.dailyGoal || 20} soru`,
      detail: `${reminderLabel} hatırlatma saati`,
      icon: Bell,
      tone: 'success',
    },
    {
      label: 'Sınav Tarihi',
      value: examDateLabel,
      detail: notifData.examDate ? 'Çalışma planına bağlı' : 'Tarih seçilmedi',
      icon: CalendarDays,
      tone: 'warning',
    },
  ];
  const profileChecklist = [
    { label: 'Ad soyad', detail: 'Panelde görünen kimlik', done: Boolean(profileData.firstName && profileData.lastName) },
    { label: 'Telefon', detail: 'Kurs ve destek iletişimi', done: Boolean(profileData.phone) },
    { label: 'Konum', detail: 'Yakındaki kurs önerileri', done: Boolean(profileData.city && profileData.district) },
    { label: 'Hakkımda', detail: 'Profil özet alanı', done: Boolean(profileData.bio) },
    { label: 'Fotoğraf', detail: 'Kişisel görünüm', done: Boolean(user?.avatarUrl) },
  ];
  const learningIdentity = [
    { label: 'Seçili Eğitim', value: user?.selectedCategoryName || 'Seçilmedi', icon: LayoutGrid },
    { label: 'Levha Seti', value: getProfileSignLibraryLabel(user?.selectedCategoryName), icon: TriangleAlert },
    { label: 'Hatırlatma', value: notifData.notifEnabled ? reminderLabel : 'Kapalı', icon: Bell },
    { label: 'Soru Hedefi', value: `${notifData.dailyGoal || 20} / gün`, icon: BookOpen },
  ];
  const profileActions = [
    { label: 'Profili Düzenle', detail: 'Kimlik ve konum bilgileri', icon: User, onClick: () => setActiveTab('profile') },
    { label: 'Hedefleri Ayarla', detail: 'Sınav tarihi ve günlük hedef', icon: CalendarDays, onClick: () => setActiveTab('notifications') },
    { label: 'Şifre ve Güvenlik', detail: 'Hesap giriş bilgileri', icon: Lock, onClick: () => setActiveTab('account') },
    { label: 'Destek Talebi', detail: 'Yardım ve mesajlar', icon: Headphones, onClick: () => navigate('/dashboard/support') },
  ];

  // Helper to render responsive slide-up sheets
  const renderMobileModal = (isOpen, onClose, title, children) => {
    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
            onClick={() => onClose(false)}
          >
            <Motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2rem] bg-[#111218] border-t border-x border-white/5 p-6 pb-12 space-y-5 shadow-2xl overflow-y-auto max-h-[85vh] text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
                <button
                  onClick={() => onClose(false)}
                  className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="py-1">
                {children}
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <div className="text-white pb-24">
      {message.text && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-24 left-4 right-4 z-40 p-4 rounded-xl flex items-center gap-3 border bg-success/15 border-success/20 text-success shadow-lg shadow-black/20"
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="font-medium text-sm">{message.text}</p>
        </Motion.div>
      )}

      {/* ── DESKTOP VIEW ── */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1360px] px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_340px] gap-6 items-start">
            
            {/* Column 1: Left Sidebar */}
            <aside className="space-y-5">
              {/* Profile Card */}
              <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-lg shadow-black/25">
                <div className="absolute -top-12 -left-12 w-28 h-28 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-accent/10 blur-[40px] rounded-full pointer-events-none" />

                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-md transition hover:scale-105"
                    title="Profil fotoğrafını değiştir"
                  >
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Profil" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 w-full h-full">
                        <User className="h-10 w-10 text-primary-light" />
                      </div>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                      <Camera className="h-6 w-6 text-white" />
                    </span>
                  </button>

                  <h2 className="mt-4 truncate text-center text-xl font-black text-white max-w-full">
                    {displayName}
                  </h2>
                  
                  <div className={`mt-2.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${levelInfo.bgColor}`}>
                    {levelInfo.name}
                  </div>

                  <p className="mt-3 text-center text-xs font-semibold leading-relaxed text-text-muted max-w-full line-clamp-3">
                    {profileData.bio || 'Profil özetini doldurduğunda burası daha kişisel görünür.'}
                  </p>
                </div>

                {/* Level XP Progress Bar */}
                <div className="mt-5 pt-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-text-muted">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      {user?.totalScore || 0} XP
                    </span>
                    <span>%{Math.round(levelInfo.progress * 100)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10">
                    <Motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: levelInfo.hex,
                        boxShadow: `0 0 6px ${levelInfo.hex}80`
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progress * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black text-text-muted uppercase tracking-wider">
                    <span>Seviye {user?.level || 1}</span>
                    <span>Sonraki Seviye</span>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-2.5 text-center">
                    <p className="text-base font-black text-white">{stats.totalExams || 0}</p>
                    <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-text-muted">Sınav</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-2.5 text-center">
                    <p className="text-base font-black text-white">%{stats.successRate || 0}</p>
                    <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-text-muted">Başarı</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.015] p-2.5 text-center">
                    <p className="text-base font-black text-white">{earnedBadges}</p>
                    <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-text-muted">Rozet</p>
                  </div>
                </div>
              </section>

              {/* Navigation Card */}
              <nav className="rounded-3xl border border-white/10 bg-[#0d1017] p-3 shadow-lg shadow-black/25 space-y-1">
                {desktopTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-primary/25 bg-primary/10 text-white'
                          : 'border-transparent bg-transparent text-text-muted hover:bg-white/[0.03] hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-primary-light' : 'text-text-muted'}`} />
                      <span className="text-xs font-black tracking-wide">{tab.label}</span>
                      <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${isActive ? 'translate-x-0.5 text-primary-light' : 'opacity-40'}`} />
                    </button>
                  );
                })}
              </nav>

              {/* Responsive stacking support for widgets between lg and xl */}
              <div className="xl:hidden block space-y-5">
                {/* Profile Completion Checklist */}
                <div className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-lg shadow-black/25">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
                        <circle cx="50" cy="50" r="40" stroke="url(#gradientProfileNav)" strokeWidth="10" fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - profileCompletion / 100)}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradientProfileNav" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute text-[10px] font-black text-white">{profileCompletion}%</div>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">Profil Tamamlığı</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">Daha iyi öneriler için tamamlayın.</p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {profileChecklist.map((item) => (
                      <div key={item.label} className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.01] p-2.5 text-left">
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                          item.done ? 'border-success/25 bg-success/10 text-success' : 'border-white/10 bg-white/[0.02] text-text-muted/40'
                        }`}>
                          {item.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white leading-tight">{item.label}</p>
                          <p className="text-[9px] text-text-muted mt-0.5 leading-none">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Heatmap Widget */}
                <div className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-lg shadow-black/25 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-wider">Aktivite Serisi</span>
                    <span className="text-xs font-black text-orange-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      {activeCount} Gün Aktif
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    {days.map((day, idx) => {
                      const isActive = activeDays[idx];
                      const isToday = idx === todayIndex;
                      return (
                        <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                              isActive
                                ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                                : isToday
                                  ? 'border border-dashed border-white/30 text-white'
                                  : 'bg-white/5 text-text-muted/40'
                            }`}
                          >
                            {isActive ? "🔥" : "•"}
                          </div>
                          <span className={`text-[10px] font-bold ${isToday ? 'text-white' : 'text-text-muted'}`}>
                            {day[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Log Out Button */}
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0d1017] px-4 py-3 text-xs font-black text-text-secondary transition hover:border-danger/30 hover:bg-danger/10 hover:text-danger shadow-md shadow-black/15"
              >
                <LogOut className="h-4 w-4" />
                Oturumu Kapat
              </button>
            </aside>

            {/* Column 2: Main Panel */}
            <main className="min-w-0 rounded-3xl border border-white/10 bg-[#0d1017] p-6 shadow-lg shadow-black/25">
              
              {/* Tab Header */}
              <div className="mb-6 flex flex-col gap-3 border-b border-white/5 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-light">Profil ve Ayarlar</p>
                  <h1 className="mt-1.5 text-2xl font-black tracking-tight text-white">
                    {desktopTabs.find((tab) => tab.id === activeTab)?.label || 'Ayarlar'}
                  </h1>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-text-muted">
                    {activeTab === 'profile' && 'Kişisel kimlik, telefon, konum ve biyografi bilgilerinizi düzenleyin.'}
                    {activeTab === 'account' && 'Giriş e-postanızı görüntüleyin, parolanızı güncelleyin veya hesabınızı yönetin.'}
                    {activeTab === 'notifications' && 'Günlük soru hedefinizi belirleyin, sınav tarihinizi ve hatırlatma saatini ayarlayın.'}
                    {activeTab === 'badges' && 'Çalışmalarınız karşılığında kazandığınız başarı madalyaları ve rozetler.'}
                    {activeTab === 'leaderboard' && 'Diğer sürücü adaylarıyla haftalık ve aylık puan yarışında yerinizi alın.'}
                    {activeTab === 'faq' && 'Ehliyet sınavı ve çalışma sistemi hakkında en çok sorulan sorular.'}
                  </p>
                </div>
                <span className={`w-fit shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                  user?.proStatus
                    ? 'border-success/25 bg-success/10 text-success'
                    : 'border-white/10 bg-white/[0.035] text-text-secondary'
                }`}>
                  {user?.proStatus ? 'PRO Üye' : 'Ücretsiz Plan'}
                </span>
              </div>

              {/* Tab Content Router */}
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <Motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form onSubmit={saveProfile} className="space-y-6">
                      <div className="grid gap-5 md:grid-cols-2">
                        <DesktopField label="Adınız">
                          <input
                            type="text"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleProfileChange}
                            className={desktopFieldClass}
                            placeholder="Adınız"
                          />
                        </DesktopField>
                        <DesktopField label="Soyadınız">
                          <input
                            type="text"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleProfileChange}
                            className={desktopFieldClass}
                            placeholder="Soyadınız"
                          />
                        </DesktopField>
                        <DesktopField label="Telefon Numarası">
                          <input
                            type="text"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className={desktopFieldClass}
                            placeholder="05xx xxx xx xx"
                          />
                        </DesktopField>
                        <DesktopField label="E-Posta (Değiştirilemez)">
                          <div className="flex h-[46px] items-center rounded-2xl border border-white/5 bg-white/[0.015] px-4 text-sm font-semibold text-text-muted/65 cursor-not-allowed">
                            {user?.email || 'E-posta tanımlı değil'}
                          </div>
                        </DesktopField>
                        <DesktopField label="Şehir">
                          <select
                            name="city"
                            value={profileData.city}
                            onChange={handleProfileCityChange}
                            className={desktopFieldClass}
                          >
                            <option value="" className="bg-[#111218]">Şehir seçin</option>
                            {TURKEY_CITIES.map((city) => (
                              <option key={city} value={city} className="bg-[#111218]">{city}</option>
                            ))}
                          </select>
                        </DesktopField>
                        <DesktopField label="İlçe">
                          <select
                            name="district"
                            value={profileData.district}
                            onChange={handleProfileChange}
                            disabled={!profileData.city}
                            className={desktopFieldClass}
                          >
                            <option value="" className="bg-[#111218]">{profileData.city ? 'İlçe seçin' : 'Önce şehir seçin'}</option>
                            {profileDistrictOptions.map((district) => (
                              <option key={district} value={district} className="bg-[#111218]">{district}</option>
                            ))}
                          </select>
                        </DesktopField>
                        <div className="md:col-span-2">
                          <DesktopField label="Seçili Eğitim Paketi">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 flex h-[46px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.015] px-4 text-sm font-semibold text-white">
                                <span className="truncate">{user?.selectedCategoryName || 'Kategori seçilmedi'}</span>
                                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Aktif Ehliyet</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(true)}
                                className="h-[46px] shrink-0 inline-flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-5 text-xs font-black uppercase tracking-widest text-primary-light transition hover:bg-primary/25 cursor-pointer"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Kategori Değiştir
                              </button>
                            </div>
                          </DesktopField>
                        </div>
                      </div>

                      <DesktopField label="Hakkımda (Biyografi)">
                        <textarea
                          name="bio"
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          rows={4}
                          className={`${desktopFieldClass} resize-none`}
                          placeholder="Kendinizden kısaca bahsedin, profilinizde görüntülenecektir..."
                        />
                      </DesktopField>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-primary/25 cursor-pointer"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Değişiklikleri Kaydet
                        </button>
                      </div>
                    </form>
                  </Motion.div>
                )}

                {activeTab === 'account' && (
                  <Motion.div
                    key="account"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <section className="rounded-2xl border border-white/5 bg-white/[0.01] p-5">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Giriş E-postası</p>
                          <h3 className="text-base font-black text-white mt-1">{user?.email || 'E-posta bulunamadı'}</h3>
                        </div>
                        <span className="flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-success">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Doğrulandı
                        </span>
                      </div>

                      <form onSubmit={savePassword} className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-white mb-2">Şifre Değiştir</h4>
                        <div className="grid gap-4 md:grid-cols-3">
                          <DesktopField label="Mevcut Şifre">
                            <input
                              type="password"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              required
                              className={desktopFieldClass}
                              placeholder="••••••••"
                            />
                          </DesktopField>
                          <DesktopField label="Yeni Şifre">
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              required
                              className={desktopFieldClass}
                              placeholder="••••••••"
                            />
                          </DesktopField>
                          <DesktopField label="Yeni Şifre Tekrar">
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                              className={desktopFieldClass}
                              placeholder="••••••••"
                            />
                          </DesktopField>
                        </div>
                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-accent/25 cursor-pointer"
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                            Şifreyi Güncelle
                          </button>
                        </div>
                      </form>
                    </section>

                    <section className="rounded-2xl border border-danger/20 bg-danger/5 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-base font-black text-red-400">Hesabı Kalıcı Olarak Sil</h3>
                        <p className="text-xs text-text-muted mt-1 max-w-xl">
                          Hesabınızı sildiğinizde, çözmüş olduğunuz tüm sınav verileri, kazandığınız rozetler ve üyelik bilgileriniz kalıcı olarak geri döndürülemez şekilde silinecektir.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/delete-account')}
                        className="inline-flex h-[46px] items-center justify-center gap-2 rounded-2xl border border-danger/35 bg-danger/10 px-5 text-xs font-black uppercase tracking-widest text-danger transition hover:bg-danger/20 whitespace-nowrap cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        Silme Sayfasına Git
                      </button>
                    </section>
                  </Motion.div>
                )}

                {activeTab === 'notifications' && (
                  <Motion.div
                    key="notifications"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form onSubmit={savePreferences} className="space-y-6">
                      <div className="grid gap-5 md:grid-cols-2">
                        <DesktopField label="Günlük Çözülecek Soru Hedefi">
                          <select
                            name="dailyGoal"
                            value={notifData.dailyGoal}
                            onChange={handleNotifChange}
                            className={desktopFieldClass}
                          >
                            <option value={10} className="bg-[#111218]">10 Soru (Başlangıç)</option>
                            <option value={20} className="bg-[#111218]">20 Soru (Standart)</option>
                            <option value={30} className="bg-[#111218]">30 Soru (Yoğun)</option>
                            <option value={50} className="bg-[#111218]">50 Soru (Usta)</option>
                            <option value={100} className="bg-[#111218]">100 Soru (Şampiyon)</option>
                          </select>
                        </DesktopField>

                        <DesktopField label="Planlanan Sınav Tarihi">
                          <div className="flex gap-2">
                            <input
                              ref={examDateInputRef}
                              type="date"
                              name="examDate"
                              value={notifData.examDate}
                              onChange={handleNotifChange}
                              onClick={openExamDatePicker}
                              className={`${desktopFieldClass} cursor-pointer flex-1`}
                            />
                            {notifData.examDate && (
                              <button
                                type="button"
                                onClick={() => setNotifData({ ...notifData, examDate: '' })}
                                className="px-3 bg-danger/10 border border-danger/25 rounded-2xl text-danger hover:bg-danger/20 transition cursor-pointer"
                                title="Tarihi Temizle"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </DesktopField>

                        <DesktopField label="Günlük Hatırlatıcı Bildirim Saati">
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              name="notifHour"
                              value={notifData.notifHour}
                              onChange={handleNotifChange}
                              className={desktopFieldClass}
                            >
                              {[...Array(24).keys()].map(h => (
                                <option key={h} value={h} className="bg-[#111218]">{h.toString().padStart(2, '0')} Saat</option>
                              ))}
                            </select>
                            <select
                              name="notifMinute"
                              value={notifData.notifMinute}
                              onChange={handleNotifChange}
                              className={desktopFieldClass}
                            >
                              {[0, 15, 30, 45].map(m => (
                                <option key={m} value={m} className="bg-[#111218]">{m.toString().padStart(2, '0')} Dakika</option>
                              ))}
                            </select>
                          </div>
                        </DesktopField>

                        <DesktopField label="Bildirim Tercihleri">
                          <label className="flex h-[46px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.015] px-4 cursor-pointer hover:bg-white/[0.03] transition">
                            <span className="text-sm font-semibold text-white">Çalışma Hatırlatıcıları</span>
                            <input
                              type="checkbox"
                              name="notifEnabled"
                              checked={notifData.notifEnabled}
                              onChange={handleNotifChange}
                              className="h-5 w-5 rounded border-white/20 bg-white/10 text-primary focus:ring-primary/40 focus:ring-offset-0 focus:outline-none"
                            />
                          </label>
                        </DesktopField>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.01] p-4 text-xs font-semibold text-text-muted">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-primary-light shrink-0" />
                          <span>
                            Hatırlatıcı {notifData.notifEnabled ? `${reminderLabel} saatinde aktif` : 'pasif'}. Sınav tarihine {notifData.examDate ? `${examDateLabel}` : 'kalan gün hesaplanamıyor'}.
                          </span>
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-success px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-success/25 cursor-pointer"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Tercihleri Kaydet
                        </button>
                      </div>
                    </form>
                  </Motion.div>
                )}

                {activeTab === 'badges' && (
                  <Motion.div
                    key="badges"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-white/[0.005] to-cyan-500/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black text-white">Başarı Durumu</h3>
                        <p className="text-xs text-text-muted mt-1 font-bold">Kazanılan rozetler öğrenim kalitenizi ve azminizi yansıtır.</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-2xl font-black text-white">
                            {stats.totalExams >= 1 ? DEFAULT_BADGES.filter(b => b.isEarned).length : 0} / {DEFAULT_BADGES.length}
                          </span>
                          <span className="text-[10px] text-text-muted block font-black uppercase tracking-wider">Kazanılan</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg font-black text-xs text-bg-dark">
                          {Math.round(((stats.totalExams >= 1 ? DEFAULT_BADGES.filter(b => b.isEarned).length : 0) / DEFAULT_BADGES.length) * 100)}%
                        </div>
                      </div>
                    </div>

                    {badgesLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {DEFAULT_BADGES.map((badge) => {
                          const badgeColor = badge.color || '#a855f7';
                          const isEarned = badge.isEarned;
                          return (
                            <div
                              key={badge.id}
                              className="relative p-5 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.01]"
                              style={{
                                backgroundColor: isEarned ? `${badgeColor}10` : 'rgba(255,255,255,0.01)',
                                borderColor: isEarned ? `${badgeColor}30` : 'rgba(255,255,255,0.05)',
                              }}
                            >
                              <div
                                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border transition-all duration-300"
                                style={{
                                  backgroundColor: isEarned ? `${badgeColor}20` : 'rgba(255,255,255,0.02)',
                                  borderColor: isEarned ? `${badgeColor}30` : 'rgba(255,255,255,0.05)',
                                  filter: isEarned ? 'none' : 'grayscale(100%)',
                                  opacity: isEarned ? 1 : 0.35,
                                }}
                              >
                                {badge.icon}
                              </div>
                              <h4 className={`text-xs font-black mt-3 ${isEarned ? 'text-white' : 'text-text-muted'}`}>
                                {badge.name}
                              </h4>
                              <p className="text-[10px] text-text-muted leading-relaxed mt-1 max-w-[130px] line-clamp-2">
                                {badge.description}
                              </p>
                              {!isEarned && (
                                <div className="absolute top-3 right-3 p-1.5 bg-black/40 rounded-full border border-white/5">
                                  <Lock className="w-3.5 h-3.5 text-text-muted/50" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Motion.div>
                )}

                {activeTab === 'leaderboard' && (
                  <Motion.div
                    key="leaderboard"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                      <span className="text-xs font-black uppercase tracking-wider text-text-muted">Sıralama Filtresi</span>
                      <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                        {[
                          { id: 'daily', label: 'Günlük' },
                          { id: 'weekly', label: 'Haftalık' },
                          { id: 'monthly', label: 'Aylık' },
                          { id: 'all', label: 'Genel' }
                        ].map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setLeaderboardPeriod(p.id)}
                            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg text-center transition-all cursor-pointer ${
                              leaderboardPeriod === p.id
                                ? 'bg-primary/20 text-primary-light border border-primary/30'
                                : 'text-text-muted hover:text-white'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {leaderboardLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
                      </div>
                    ) : leaderboardData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted space-y-3">
                        <Trophy className="w-12 h-12 text-text-muted/30" />
                        <p className="text-xs font-bold">Bu dönemde henüz skor verisi bulunmuyor.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                        {leaderboardData.map((item, index) => {
                          const rank = index + 1;
                          const userDetails = item.userDetails || {};
                          const name = `${userDetails.firstName || item.firstName || ''} ${userDetails.lastName || item.lastName || ''}`.trim() || 'İsimsiz Sürücü';
                          const avatar = userDetails.avatarUrl || item.avatarUrl || '';
                          const level = userDetails.level || item.level || 1;
                          const points = item.totalPoints || item.totalScore || 0;
                          const isSelf = user?._id === item._id || user?.id === item.id;

                          const isTopThree = rank <= 3;
                          const rankColor = rank === 1 ? 'text-yellow-400' : (rank === 2 ? 'text-gray-300' : (rank === 3 ? 'text-amber-600' : 'text-text-muted'));
                          const rankBg = rank === 1 ? 'bg-yellow-500/10 border-yellow-500/20' : (rank === 2 ? 'bg-gray-400/10 border-gray-400/20' : (rank === 3 ? 'bg-amber-600/10 border-amber-600/20' : 'bg-white/5 border-white/5'));

                          return (
                            <div
                              key={item._id || index}
                              className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                                isSelf 
                                  ? 'bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                                  : isTopThree 
                                    ? `${rankBg} border-opacity-40` 
                                    : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 flex items-center justify-center font-black">
                                  {isTopThree ? (
                                    <Trophy className={`w-5 h-5 ${rankColor} fill-current`} />
                                  ) : (
                                    <span className="text-xs text-text-muted">#{rank}</span>
                                  )}
                                </div>
                                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0">
                                  {avatar ? (
                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary-light font-black text-sm uppercase">
                                      {name[0]}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="text-xs font-black text-white flex items-center gap-2">
                                    <span>{name}</span>
                                    {isSelf && (
                                      <span className="text-[8px] font-black uppercase bg-primary text-white px-1.5 py-0.5 rounded">Siz</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-text-muted mt-0.5 font-semibold">Lvl {level}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-black text-white">{points}</span>
                                <span className="text-[8px] text-text-muted block font-black uppercase mt-0.5">XP</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Motion.div>
                )}

                {activeTab === 'faq' && (
                  <Motion.div
                    key="faq"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {faqsLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
                      </div>
                    ) : faqs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted">
                        <HelpCircle className="w-12 h-12 text-text-muted/20 mb-2" />
                        <p className="text-xs font-bold">Yardım soruları yüklenirken hata oluştu.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {faqs.map((faq, idx) => {
                          const isOpen = activeFaq === idx;
                          return (
                            <div
                              key={faq._id || idx}
                              className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden transition-all duration-300"
                            >
                              <button
                                type="button"
                                onClick={() => setActiveFaq(isOpen ? null : idx)}
                                className="w-full flex items-center justify-between p-4 text-left font-black text-xs text-white hover:bg-white/[0.02] cursor-pointer"
                              >
                                <span>{faq.question}</span>
                                <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-light' : ''}`} />
                              </button>
                              {isOpen && (
                                <div className="px-4 pb-4 text-xs text-text-muted leading-relaxed border-t border-white/5 pt-3 bg-white/[0.005]">
                                  {faq.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Column 3: Right Sidebar */}
            <aside className="space-y-5 hidden xl:block">
              {/* Profile Completion Checklist */}
              <section className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-lg shadow-black/25">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
                      <circle cx="50" cy="50" r="40" stroke="url(#gradientProfileNavCol)" strokeWidth="10" fill="transparent"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - profileCompletion / 100)}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradientProfileNavCol" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute text-[10px] font-black text-white">{profileCompletion}%</div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Profil Tamamlığı</h4>
                    <p className="text-[10px] text-text-muted mt-0.5">Kişiselleştirilmiş bir deneyim için.</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {profileChecklist.map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.01] p-2.5 text-left">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                        item.done ? 'border-success/25 bg-success/10 text-success' : 'border-white/10 bg-white/[0.02] text-text-muted/40'
                      }`}>
                        {item.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white leading-tight">{item.label}</p>
                        <p className="text-[9px] text-text-muted mt-0.5 leading-none">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Heatmap Widget */}
              <section className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-lg shadow-black/25 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase tracking-wider">Aktivite Serisi</span>
                  <span className="text-xs font-black text-orange-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    {activeCount} Gün Aktif
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  {days.map((day, idx) => {
                    const isActive = activeDays[idx];
                    const isToday = idx === todayIndex;
                    return (
                      <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                            isActive
                              ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                              : isToday
                                ? 'border border-dashed border-white/30 text-white'
                                : 'bg-white/5 text-text-muted/40'
                          }`}
                        >
                          {isActive ? "🔥" : "•"}
                        </div>
                        <span className={`text-[10px] font-bold ${isToday ? 'text-white' : 'text-text-muted'}`}>
                          {day[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Active Category Info */}
              <section className="rounded-3xl border border-white/10 bg-[#0d1017] p-5 shadow-lg shadow-black/25 space-y-3.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent-light">Sınıf Durumu</span>
                  <h4 className="text-xs font-black text-white mt-1">Ehliyet Sınıfınız</h4>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent-light">
                    <LayoutGrid className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">Aktif Eğitim</p>
                    <p className="text-xs font-black text-white truncate mt-0.5">{user?.selectedCategoryName || 'Seçilmedi'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/traffic-signs')}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-[11px] font-black uppercase tracking-wider text-white transition hover:bg-white/[0.05] cursor-pointer"
                >
                  Trafik Levhaları
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </section>
            </aside>

          </div>
        </div>
      </div>

      {/* ── MOBILE VIEW (Aligns with Flutter profile_screen.dart) ── */}
      <div className="block lg:hidden space-y-6 px-1 pb-32">
        {/* Header Block */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#20193A] to-[#101827] p-5 shadow-lg shadow-black/25">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex flex-col items-center">
            {/* Avatar inside Progress Ring */}
            <div className="relative cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-24 h-24 rounded-full flex items-center justify-center relative">
                {/* SVG Progress Ring */}
                <svg className="absolute inset-0" width="96" height="96">
                  <g transform="rotate(-90 48 48)">
                    <circle
                      stroke="rgba(255,255,255,0.05)"
                      fill="transparent"
                      strokeWidth="3.2"
                      r="40"
                      cx="48"
                      cy="48"
                    />
                    <circle
                      stroke={levelInfo.hex}
                      fill="transparent"
                      strokeWidth="3.2"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - levelInfo.progress)}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                      r="40"
                      cx="48"
                      cy="48"
                    />
                  </g>
                </svg>

                {/* Avatar Image */}
                <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 bg-bg-dark flex items-center justify-center shadow-lg">
                  {loading && fileInputRef.current?.files?.length > 0 ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary-light" />
                  ) : user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-xl font-bold text-white uppercase">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                    </div>
                  )}
                </div>

                {/* Edit Camera Icon overlay */}
                <div className="absolute bottom-1 right-1 p-1.5 bg-bg-card rounded-full border border-white/10 shadow-md">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
            />

            {/* Level Name Badge */}
            <div className={`mt-3.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${levelInfo.bgColor}`}>
              {levelInfo.name}
            </div>

            {/* Name with edit icon */}
            <div className="mt-3 flex items-center gap-2">
              <h3 className="text-xl font-black tracking-tight text-white">{user?.firstName} {user?.lastName}</h3>
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-text-muted hover:text-white"
              >
                <User className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bio */}
            {user?.bio && (
              <p className="mt-1.5 text-xs text-text-muted text-center max-w-[250px] leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Score Badge */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{user?.totalScore || 0} Puan</span>
              </div>
              {user?.proStatus && (
                <div className="px-2.5 py-1 bg-warning text-bg-dark text-[9px] font-black tracking-wider rounded-full border border-bg-dark shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                  PRO
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions (Kişisel Merkez & Kısayollar) */}
        <div className="space-y-4">
          {/* Kişisel Merkez */}
          <div>
            <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider ml-1">Kişisel Merkez</h4>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* İstatistik */}
              <Link
                to="/dashboard/stats"
                className="flex flex-col items-center justify-center text-center p-2.5 h-[82px] rounded-[20px] bg-bg-card border border-purple-500/20 shadow-lg shadow-black/14 hover:bg-white/[0.02] transition-all gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <BarChart2 className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-xs font-black text-white truncate max-w-full">İstatistik</span>
              </Link>

              {/* Ayarlar */}
              <button
                onClick={() => setIsNotifSettingsOpen(true)}
                className="flex flex-col items-center justify-center text-center p-2.5 h-[82px] rounded-[20px] bg-bg-card border border-purple-500/20 shadow-lg shadow-black/14 hover:bg-white/[0.02] transition-all gap-2"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Settings className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-xs font-black text-white truncate max-w-full">Ayarlar</span>
              </button>
            </div>
          </div>

          {/* Ana Kategori */}
          <div className="relative overflow-hidden rounded-[18px] border border-cyan-500/18 bg-bg-card p-3.5 shadow-md shadow-black/14">
            <div className="flex items-center justify-between gap-3">
              <div className="w-[38px] h-[38px] rounded-[13px] bg-cyan-500/12 flex items-center justify-center shrink-0">
                <LayoutGrid className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black text-text-muted uppercase tracking-wider">Ana kategori</div>
                <div className="text-xs font-black text-white mt-0.5 truncate">
                  {user?.selectedCategoryName || 'Kategori seçilmedi'}
                </div>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-1.2 px-2.5 py-2 bg-purple-500/12 border border-purple-500/18 rounded-xl text-purple-400 font-black text-[11px] hover:bg-purple-500/20 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="ml-1">{user?.selectedCategoryId ? 'Değiştir' : 'Seç'}</span>
              </button>
            </div>
          </div>

          {/* Kısayollar */}
          <div>
            <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider ml-1">Kısayollar</h4>
            <div className="grid grid-cols-3 gap-2.5 mt-2">
              {/* Dersler */}
              <Link
                to="/dashboard/lessons"
                className="flex flex-col items-center justify-center text-center p-2 h-[76px] rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-1.2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-white/95 leading-none truncate max-w-full">Dersler</span>
              </Link>

              {/* Video */}
              <Link
                to="/dashboard/videos"
                className="flex flex-col items-center justify-center text-center p-2 h-[76px] rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-1.2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-white/95 leading-none truncate max-w-full">Video</span>
              </Link>

              {/* Rozetler */}
              <button
                onClick={() => setIsBadgesOpen(true)}
                className="flex flex-col items-center justify-center text-center p-2 h-[76px] rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-1.2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Award className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-white/95 leading-none truncate max-w-full">Rozetler</span>
              </button>

              {/* Sıralama */}
              <button
                onClick={() => setIsLeaderboardOpen(true)}
                className="flex flex-col items-center justify-center text-center p-2 h-[76px] rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-1.2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Trophy className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-white/95 leading-none truncate max-w-full">Sıralama</span>
              </button>

              {/* Favoriler */}
              <Link
                to="/dashboard/favorites"
                className="flex flex-col items-center justify-center text-center p-2 h-[76px] rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-1.2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Star className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-white/95 leading-none truncate max-w-full">Favoriler</span>
              </Link>

              {/* Sürücü Kursu */}
              <Link
                to="/dashboard/driving-schools"
                className="flex flex-col items-center justify-center text-center p-2 h-[76px] rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-1.2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <MapPinned className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-white/95 leading-none truncate max-w-full">S. Kursu</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Weekly Heatmap Activity Streaks */}
        <div className="p-5 rounded-3xl border border-white/5 bg-bg-card shadow-lg shadow-black/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base text-orange-400">🔥</span>
              <h4 className="text-sm font-black text-white">Haftalık Aktivite</h4>
            </div>
            <span className="text-xs font-black text-orange-400">{activeCount} Gün</span>
          </div>
          <div className="flex items-center justify-between mt-5">
            {days.map((day, idx) => {
              const isActive = activeDays[idx];
              const isToday = idx === todayIndex;
              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : isToday
                        ? 'border border-dashed border-white/30 text-white'
                        : 'bg-white/5 text-text-muted'
                  }`}>
                    {isActive ? "🔥" : "•"}
                  </div>
                  <span className={`text-[10px] font-bold ${isToday ? 'text-white' : 'text-text-muted'}`}>
                    {day[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="p-5 rounded-3xl border border-white/5 bg-bg-card shadow-lg shadow-black/10">
          <div className="grid grid-cols-5 gap-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              </div>
              <span className="text-xs font-black text-white mt-1.5">{user?.totalScore || 0}</span>
              <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Puan</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-xs font-black text-white mt-1.5">{stats.totalExams || 0}</span>
              <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Sınav</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-xs font-black text-white mt-1.5">{stats.totalQuestions || 0}</span>
              <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Soru</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <span className="text-xs font-black text-white mt-1.5">{stats.totalCorrect || 0}</span>
              <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Doğru</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center">
                <span className="text-xs font-black text-orange-400">%</span>
              </div>
              <span className="text-xs font-black text-white mt-1.5">%{stats.successRate || 0}</span>
              <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Başarı</span>
            </div>
          </div>
        </div>

        {/* Hesap Ayarları Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <h4 className="text-sm font-black text-white tracking-wide">Hesap Ayarları</h4>
          </div>

          {/* Group 1: Kişisel Bilgiler */}
          <div className="rounded-3xl border border-white/5 bg-bg-card overflow-hidden shadow-lg shadow-black/10">
            <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>Kişisel Bilgiler</span>
            </div>
            <div className="divide-y divide-white/5">
              <button onClick={() => setIsEditProfileOpen(true)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors text-left">
                <div>
                  <div className="text-xs font-black text-white">Ad Soyad</div>
                  <div className="text-xs text-text-muted mt-1">{user?.firstName} {user?.lastName}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </button>

              <div className="w-full flex items-center justify-between p-4 text-left">
                <div>
                  <div className="text-xs font-black text-white">E-posta</div>
                  <div className="text-xs text-text-muted mt-1">{user?.email}</div>
                </div>
                <div className="px-2 py-0.5 bg-success/20 text-success text-[8px] font-black uppercase tracking-wider rounded border border-success/30 shrink-0">Doğrulandı</div>
              </div>

              <button onClick={() => setIsEditProfileOpen(true)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors text-left">
                <div>
                  <div className="text-xs font-black text-white">Telefon</div>
                  <div className="text-xs text-text-muted mt-1">{user?.phone || 'Ekle'}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </button>

              <button onClick={() => setIsEditProfileOpen(true)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors text-left">
                <div>
                  <div className="text-xs font-black text-white">Hakkımda</div>
                  <div className="text-xs text-text-muted mt-1 max-w-[200px] truncate">{user?.bio || 'Ekle'}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </button>

              <button onClick={() => setIsChangePasswordOpen(true)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors text-left">
                <div>
                  <div className="text-xs font-black text-white">Şifre Değiştir</div>
                  <div className="text-xs text-text-muted mt-1 font-bold">Şifrenizi güvenli bir şekilde güncelleyin</div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </button>
            </div>
          </div>

          {/* Group 2: Ayarlar & İletişim */}
          <div className="rounded-3xl border border-white/5 bg-bg-card overflow-hidden shadow-lg shadow-black/10">
            <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ayarlar & İletişim</span>
            </div>
            <div className="divide-y divide-white/5">
              <div className="w-full flex items-center justify-between p-4 text-left">
                <div>
                  <div className="text-xs font-black text-white">{user?.proStatus ? 'PRO Üyesisiniz' : 'PRO\'ya Geç'}</div>
                  <div className="text-xs text-text-muted mt-1 font-bold">
                    {user?.proStatus ? 'Sınırsız premium erişiminiz aktif' : 'Sınırsız deneme sınavı & reklamları kaldır'}
                  </div>
                </div>
                {!user?.proStatus && (
                  <button
                    onClick={() => showMessage('success', "Özellik yakında aktif olacaktır!")}
                    className="px-3 py-1 bg-accent hover:bg-accent-light text-bg-dark font-black text-[10px] rounded-lg transition-colors whitespace-nowrap"
                  >
                    PRO Ol
                  </button>
                )}
              </div>

              <button onClick={() => setIsNotifSettingsOpen(true)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors text-left">
                <div>
                  <div className="text-xs font-black text-white">Bildirim & Hedef Ayarları</div>
                  <div className="text-xs text-text-muted mt-1 font-bold">Günlük hedef ve çalışma saati hatırlatıcıları</div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </button>

              <Link to="/dashboard/support" className="w-full flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors text-left block">
                <div>
                  <div className="text-xs font-black text-white">Bize Ulaşın</div>
                  <div className="text-xs text-text-muted mt-1 font-bold">Yönetici ile canlı destek veya mesaj paneli</div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </Link>
            </div>
          </div>

          {/* Group 3: Uygulama */}
          <div className="rounded-3xl border border-white/5 bg-bg-card overflow-hidden shadow-lg shadow-black/10">
            <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-orange-400" />
              <span>Uygulama</span>
            </div>
            <div className="divide-y divide-white/5">
              <button onClick={() => setIsFaqOpen(true)} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors text-left">
                <div>
                  <div className="text-xs font-black text-white">Sıkça Sorulan Sorular</div>
                  <div className="text-xs text-text-muted mt-1 font-bold">Aklınıza takılan tüm soruların cevapları</div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
              </button>

              <div className="w-full flex items-center justify-between p-4 text-left">
                <div>
                  <div className="text-xs font-black text-white">Tema</div>
                  <div className="text-xs text-text-muted mt-1 font-bold">Karanlık Mod (Varsayılan)</div>
                </div>
                <div className="relative inline-flex items-center cursor-not-allowed">
                  <div className="w-9 h-5 bg-success rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[16px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </div>
              </div>

              <div className="w-full flex items-center justify-between p-4 text-left">
                <div>
                  <div className="text-xs font-black text-white">Uygulama Versiyonu</div>
                  <div className="text-xs text-text-muted mt-1 font-bold">v1.0.0+1 (Web Mobil Uyumlu)</div>
                </div>
              </div>

              <Link to="/delete-account" className="w-full flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors text-left block text-red-400">
                <div>
                  <div className="text-xs font-black">Hesabı Sil</div>
                  <div className="text-[10px] opacity-70 mt-1 font-bold">Hesabınızı ve tüm verilerinizi kalıcı olarak siler</div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70 shrink-0" />
              </Link>

              <button onClick={logout} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors text-left text-red-500">
                <div>
                  <div className="text-xs font-black">Oturumu Kapat</div>
                  <div className="text-[10px] opacity-70 mt-1 font-bold">Güvenli bir şekilde çıkış yapın</div>
                </div>
                <LogOut className="w-4 h-4 opacity-70 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL OVERLAYS (Responsive Slide-up sheets) ── */}

      {/* Edit Profile Modal */}
      {renderMobileModal(isEditProfileOpen, setIsEditProfileOpen, "Profili Düzenle", (
        <form onSubmit={async (e) => {
          const success = await saveProfile(e);
          if (success) setIsEditProfileOpen(false);
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Adınız</label>
              <input
                type="text"
                name="firstName"
                value={profileData.firstName}
                onChange={handleProfileChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary focus:bg-primary/5 font-bold"
                placeholder="Adınız"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Soyadınız</label>
              <input
                type="text"
                name="lastName"
                value={profileData.lastName}
                onChange={handleProfileChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary focus:bg-primary/5 font-bold"
                placeholder="Soyadınız"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Telefon</label>
            <input
              type="text"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary focus:bg-primary/5 font-bold"
              placeholder="555 555 55 55"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Şehir</label>
              <select
                name="city"
                value={profileData.city}
                onChange={handleProfileCityChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary focus:bg-primary/5 font-bold"
              >
                <option value="" className="bg-[#1c1d24]">Şehir seç</option>
                {TURKEY_CITIES.map((city) => (
                  <option key={city} value={city} className="bg-[#1c1d24]">{city}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">İlçe</label>
              <select
                name="district"
                value={profileData.district}
                onChange={handleProfileChange}
                disabled={!profileData.city}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary focus:bg-primary/5 font-bold disabled:opacity-50"
              >
                <option value="" className="bg-[#1c1d24]">{profileData.city ? 'İlçe seç' : 'Önce şehir seç'}</option>
                {profileDistrictOptions.map((district) => (
                  <option key={district} value={district} className="bg-[#1c1d24]">{district}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Hakkımda</label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleProfileChange}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary focus:bg-primary/5 font-bold resize-none"
              placeholder="Kendinizden kısaca bahsedin..."
            />
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Değişiklikleri Kaydet
          </button>
        </form>
      ))}

      {/* Change Password Modal */}
      {renderMobileModal(isChangePasswordOpen, setIsChangePasswordOpen, "Şifre Değiştir", (
        <form onSubmit={async (e) => {
          const success = await savePassword(e);
          if (success) setIsChangePasswordOpen(false);
        }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Mevcut Şifre</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent focus:bg-accent/5 font-bold"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Yeni Şifre</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent focus:bg-accent/5 font-bold"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent focus:bg-accent/5 font-bold"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 mt-2 bg-gradient-to-r from-accent to-accent-light shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Şifreyi Güncelle
          </button>
        </form>
      ))}

      {/* Preferences & Goal Settings Modal */}
      {renderMobileModal(isNotifSettingsOpen, setIsNotifSettingsOpen, "Tercihler ve Hedefler", (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Günlük Çalışma Hedefi</label>
            <select
              name="dailyGoal"
              value={notifData.dailyGoal}
              onChange={handleNotifChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-success focus:bg-success/5 font-bold"
            >
              <option value={10} className="bg-[#1c1d24]">10 Soru</option>
              <option value={20} className="bg-[#1c1d24]">20 Soru</option>
              <option value={30} className="bg-[#1c1d24]">30 Soru</option>
              <option value={50} className="bg-[#1c1d24]">50 Soru</option>
              <option value={100} className="bg-[#1c1d24]">100 Soru</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Sınav Tarihi</label>
            <div className="flex gap-2">
              <input
                type="date"
                name="examDate"
                value={notifData.examDate}
                onChange={handleNotifChange}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-success font-bold"
              />
              {notifData.examDate && (
                <button
                  type="button"
                  onClick={() => setNotifData({ ...notifData, examDate: '' })}
                  className="px-3 bg-danger/10 border border-danger/20 rounded-xl text-danger hover:bg-danger/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Hatırlatıcı Saati</label>
            <div className="flex gap-2 items-center">
              <select
                name="notifHour"
                value={notifData.notifHour}
                onChange={handleNotifChange}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-success font-bold"
              >
                {[...Array(24).keys()].map(h => (
                  <option key={h} value={h} className="bg-[#1c1d24]">{h.toString().padStart(2, '0')}</option>
                ))}
              </select>
              <span>:</span>
              <select
                name="notifMinute"
                value={notifData.notifMinute}
                onChange={handleNotifChange}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-success font-bold"
              >
                {[0, 15, 30, 45].map(m => (
                  <option key={m} value={m} className="bg-[#1c1d24]">{m.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={async () => {
              const success = await savePreferences();
              if (success) setIsNotifSettingsOpen(false);
            }}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-4 bg-gradient-to-r from-success to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Tercihleri Kaydet
          </button>
        </div>
      ))}

      {/* Badges Modal */}
      {renderMobileModal(isBadgesOpen, setIsBadgesOpen, "Rozetlerim", (
        <div className="space-y-5">
          {/* Summary Box */}
          {(() => {
            const activeBadgeList = badges.length > 0 ? badges : DEFAULT_BADGES;
            const earnedCount = activeBadgeList.filter(b => b.isEarned).length;
            const totalCount = activeBadgeList.length;
            const percentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;
            return (
              <>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/15 via-white/[0.02] to-cyan-500/10 border border-purple-500/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-black text-white">{earnedCount} / {totalCount} Rozet</h4>
                    <p className="text-xs text-text-muted font-bold mt-1">Kazanılan rozet sayısı</p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg font-black text-sm text-bg-dark">
                    {percentage}%
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>

                {badgesLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                    {activeBadgeList.map(badge => {
                      const badgeColor = badge.color || '#a855f7';
                      return (
                        <div
                          key={badge.id}
                          className="p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all"
                          style={{
                            backgroundColor: badge.isEarned ? `${badgeColor}15` : 'rgba(255,255,255,0.02)',
                            borderColor: badge.isEarned ? `${badgeColor}50` : 'rgba(255,255,255,0.05)',
                          }}
                        >
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border transition-all"
                            style={{
                              backgroundColor: badge.isEarned ? `${badgeColor}25` : 'rgba(255,255,255,0.04)',
                              borderColor: badge.isEarned ? `${badgeColor}40` : 'rgba(255,255,255,0.1)',
                              opacity: badge.isEarned ? 1 : 0.35
                            }}
                          >
                            {badge.icon || '🏆'}
                          </div>

                          <span className={`text-[11px] font-black mt-2 ${badge.isEarned ? 'text-white' : 'text-text-muted'}`}>
                            {badge.name}
                          </span>
                          <span className="text-[9px] text-text-muted leading-tight mt-1 max-w-[120px] line-clamp-2">
                            {badge.description}
                          </span>

                          {!badge.isEarned && (
                            <Lock className="w-3 h-3 text-text-muted/40 mt-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      ))}

      {/* Leaderboard Modal */}
      {renderMobileModal(isLeaderboardOpen, setIsLeaderboardOpen, "Liderlik Tablosu", (
        <div className="space-y-4">
          {/* Period selector tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
            {[
              { id: 'daily', label: 'Günlük' },
              { id: 'weekly', label: 'Haftalık' },
              { id: 'monthly', label: 'Aylık' },
              { id: 'all', label: 'Hepsi' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setLeaderboardPeriod(p.id)}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg text-center transition-all ${
                  leaderboardPeriod === p.id
                    ? 'bg-primary/20 text-primary-light border border-primary/30 shadow-md shadow-primary/5'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {leaderboardLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted space-y-2">
              <Trophy className="w-12 h-12 stroke-[1.5] text-text-muted/60" />
              <p className="text-xs font-bold">Henüz sıralama verisi bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
              {leaderboardData.map((item, index) => {
                const rank = index + 1;
                const userDetails = item.userDetails || {};
                const name = `${userDetails.firstName || item.firstName || ''} ${userDetails.lastName || item.lastName || ''}`.trim() || 'İsimsiz Kullanıcı';
                const avatar = userDetails.avatarUrl || item.avatarUrl || '';
                const level = userDetails.level || item.level || 1;
                const points = item.totalPoints || item.totalScore || 0;

                const isTopThree = rank <= 3;
                const rankColor = rank === 1 ? 'text-yellow-400' : (rank === 2 ? 'text-gray-400' : (rank === 3 ? 'text-amber-600' : 'text-text-muted'));
                const rankBg = rank === 1 ? 'bg-yellow-500/10 border-yellow-500/20' : (rank === 2 ? 'bg-gray-400/10 border-gray-400/20' : (rank === 3 ? 'bg-amber-600/10 border-amber-600/20' : 'bg-white/5 border-white/5'));

                return (
                  <div
                    key={item._id || index}
                    className={`flex items-center p-3 rounded-2xl border transition-all ${
                      isTopThree ? `${rankBg} shadow-sm shadow-black/10` : 'bg-bg-card border-white/5'
                    }`}
                  >
                    {/* Rank indicator */}
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {isTopThree ? (
                        <Trophy className={`w-5 h-5 ${rankColor} fill-current`} />
                      ) : (
                        <span className="text-xs font-black text-text-muted">#{rank}</span>
                      )}
                    </div>

                    {/* User avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 ml-1 shadow">
                      {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary-light font-black text-sm uppercase">
                          {name[0]}
                        </div>
                      )}
                    </div>

                    {/* User details */}
                    <div className="flex-1 min-w-0 ml-3">
                      <div className="text-xs font-black text-white truncate">{name}</div>
                      <div className="inline-block mt-0.5 px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded text-[8px] font-black uppercase text-primary-light">
                        Lvl {level}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-white">{points}</div>
                      <div className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Puan</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* FAQ Modal */}
      {renderMobileModal(isFaqOpen, setIsFaqOpen, "Sıkça Sorulan Sorular", (
        <div className="space-y-3">
          {faqsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted space-y-2">
              <HelpCircle className="w-12 h-12 stroke-[1.5] text-text-muted/60" />
              <p className="text-xs font-bold">Sorular yüklenirken hata oluştu veya soru bulunamadı.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[48vh] overflow-y-auto pr-1">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={faq._id || idx}
                    className="rounded-2xl border border-white/5 bg-bg-card overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-left font-black text-xs text-white hover:bg-white/[0.01]"
                    >
                      <span className="pr-4">{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-light' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-text-muted leading-relaxed border-t border-white/5 pt-3 bg-white/[0.01]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Category Selection Modal */}
      <CategorySelectorModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
};

export default UserSettings;
