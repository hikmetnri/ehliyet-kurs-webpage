import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Bell, Camera, Loader2, Save, AlertCircle, CheckCircle2, ShieldAlert, CalendarDays, Trash2, MapPinned, ArrowRight,
  BarChart2, Star, Headphones, PlayCircle, TriangleAlert, MessagesSquare, BookOpen, Trophy, Award, HelpCircle, Info, LogOut, ChevronRight, X, Sparkles
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api';
import { TURKEY_CITIES, getDistrictsForCity } from '../../data/turkeyLocations';

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
    if (!isBadgesOpen) return;
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
  }, [isBadgesOpen]);

  // Fetch Leaderboard
  useEffect(() => {
    if (!isLeaderboardOpen) return;
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
  }, [isLeaderboardOpen, leaderboardPeriod]);

  // Fetch FAQs
  useEffect(() => {
    if (!isFaqOpen) return;
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
  }, [isFaqOpen]);

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

  // Helper to render responsive slide-up sheets
  const renderMobileModal = (isOpen, onClose, title, children) => (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
          onClick={() => onClose(false)}
        >
          <Motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2rem] bg-[#111218] border-t border-x border-white/5 p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[85vh] text-white"
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
    </AnimatePresence>
  );

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
      <div className="hidden lg:block space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary-light" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary-light">Yönetim Paneli</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">Ayarlar</h2>
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">
              Hesap detaylarını, bildirimleri ve tercihlerini yönet
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/driving-schools"
          className="group relative block overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/15 via-white/[0.035] to-primary/10 p-5 transition-all hover:-translate-y-0.5 hover:border-accent/35 sm:p-6"
        >
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl transition group-hover:bg-accent/20" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10">
                <MapPinned className="h-6 w-6 text-accent-light" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Yakındaki Sürücü Kursları</h3>
                <p className="mt-1 text-sm font-semibold text-text-secondary">
                  Profil şehrine göre kurs, telefon, konum ve kayıt linklerini gör.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-black text-accent-light">
              Kursları Gör <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Tabs - Sliding Pill */}
          <div className="relative flex gap-2 overflow-x-auto pb-1 custom-scrollbar lg:col-span-1 lg:block lg:space-y-2.5 lg:overflow-visible lg:pb-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-wider transition-all duration-300 lg:w-full lg:px-5 lg:py-4 z-10 cursor-pointer ${
                    isActive 
                      ? 'text-primary-light' 
                      : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <Motion.div
                      layoutId="activeSettingsTab"
                      className="absolute inset-0 bg-primary/10 border border-primary/25 rounded-2xl z-[-1] shadow-lg shadow-primary/5"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <tab.icon className={`w-5 h-5 ${isActive ? 'text-primary-light' : 'opacity-40'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <Motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="glass-card relative overflow-hidden rounded-3xl border border-white/5 p-5 sm:p-8 lg:rounded-[2.5rem]"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none rounded-full" />
                  <h3 className="text-2xl font-black mb-8 relative z-10">Kişisel Bilgiler</h3>
                  
                  <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-primary/50 transition-colors relative z-10 bg-bg-dark">
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                              <User className="w-12 h-12 text-primary-light" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full border-4 border-bg-card flex items-center justify-center z-20 shadow-lg">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleAvatarChange} 
                      />
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Tıkla ve Değiştir<br/>(Max 5MB)</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={saveProfile} className="flex-1 space-y-6 w-full">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Adınız</label>
                          <input
                            type="text"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleProfileChange}
                            className="input-field bg-white/5 border-white/10 focus:border-primary focus:bg-primary/5"
                            placeholder="Adınız"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Soyadınız</label>
                          <input
                            type="text"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleProfileChange}
                            className="input-field bg-white/5 border-white/10 focus:border-primary focus:bg-primary/5"
                            placeholder="Soyadınız"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Telefon</label>
                          <input
                            type="text"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="input-field bg-white/5 border-white/10 focus:border-primary focus:bg-primary/5"
                            placeholder="555 555 55 55"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Şehir</label>
                          <select
                            name="city"
                            value={profileData.city}
                            onChange={handleProfileCityChange}
                            className="input-field bg-white/5 border-white/10 focus:border-primary focus:bg-primary/5"
                          >
                            <option value="" className="bg-bg-card">Şehir seç</option>
                            {TURKEY_CITIES.map((city) => (
                              <option key={city} value={city} className="bg-bg-card">{city}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">İlçe</label>
                          <select
                            name="district"
                            value={profileData.district}
                            onChange={handleProfileChange}
                            disabled={!profileData.city}
                            className="input-field bg-white/5 border-white/10 focus:border-primary focus:bg-primary/5"
                          >
                            <option value="" className="bg-bg-card">{profileData.city ? 'İlçe seç' : 'Önce şehir seç'}</option>
                            {profileDistrictOptions.map((district) => (
                              <option key={district} value={district} className="bg-bg-card">{district}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Hakkımda</label>
                        <textarea
                          name="bio"
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          rows={4}
                          className="input-field bg-white/5 border-white/10 focus:border-primary focus:bg-primary/5 resize-none"
                          placeholder="Kendinizden kısaca bahsedin..."
                        />
                      </div>

                      <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 sm:w-auto">
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Değişiklikleri Kaydet
                        </button>
                      </div>
                    </form>
                  </div>
                </Motion.div>
              )}

              {activeTab === 'account' && (
                <Motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="glass-card relative overflow-hidden rounded-3xl border border-white/5 p-5 sm:p-8 lg:rounded-[2.5rem]"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none rounded-full" />
                  <h3 className="text-2xl font-black mb-8 relative z-10 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-accent" />
                    Güvenlik & Şifre
                  </h3>

                  <div className="relative z-10 mb-10 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">E-Posta Adresi</p>
                      <p className="break-all font-medium">{user?.email}</p>
                    </div>
                    <div className="px-3 py-1 bg-success/20 text-success text-[10px] font-black uppercase tracking-widest rounded-full border border-success/30">
                      Doğrulandı
                    </div>
                  </div>

                  <form onSubmit={savePassword} className="space-y-6 max-w-lg relative z-10">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Mevcut Şifre</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        className="input-field bg-white/5 border-white/10 focus:border-accent focus:bg-accent/5"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Yeni Şifre</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className="input-field bg-white/5 border-white/10 focus:border-accent focus:bg-accent/5"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Yeni Şifre (Tekrar)</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className="input-field bg-white/5 border-white/10 focus:border-accent focus:bg-accent/5"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="flex justify-start pt-4">
                      <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 bg-gradient-to-r from-accent to-accent-light shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] sm:w-auto">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                        Şifreyi Güncelle
                      </button>
                    </div>
                  </form>
                  
                  {/* Hesabı Silme Alanı */}
                  <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
                    <div className="flex flex-col items-stretch justify-between gap-6 rounded-2xl border border-danger/20 bg-danger/5 p-5 sm:p-6 md:flex-row md:items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-danger/20 rounded-full flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-6 h-6 text-danger" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-1">Hesabımı Kalıcı Olarak Sil</h4>
                          <p className="text-sm text-text-muted">Silme işlemi resmi hesap silme sayfasından yapılır. Tüm adımları ve e-posta alternatifini orada görebilirsiniz.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate('/delete-account')}
                        className="px-6 py-3 bg-danger hover:bg-red-600 text-white font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 text-sm"
                      >
                        Hesap Silme Sayfasına Git
                      </button>
                    </div>
                  </div>
                </Motion.div>
              )}

              {activeTab === 'notifications' && (
                <Motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="glass-card relative overflow-hidden rounded-3xl border border-white/5 p-5 sm:p-8 lg:rounded-[2.5rem]"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 blur-[100px] pointer-events-none rounded-full" />
                  <h3 className="text-2xl font-black mb-8 relative z-10 flex items-center gap-3">
                    <Bell className="w-6 h-6 text-success" />
                    Tercihler ve Hedefler
                  </h3>

                  <div className="space-y-8 relative z-10 max-w-xl">
                    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                      <div>
                        <h4 className="font-bold mb-1">Günlük Çalışma Hedefi</h4>
                        <p className="text-xs text-text-muted">Günlük çözmeniz gereken soru sayısını belirleyin.</p>
                      </div>
                      <select 
                        name="dailyGoal" 
                        value={notifData.dailyGoal} 
                        onChange={handleNotifChange}
                        className="bg-bg-dark border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-success focus:ring-2 focus:ring-success/20 font-bold"
                      >
                        <option value={10}>10 Soru</option>
                        <option value={20}>20 Soru</option>
                        <option value={30}>30 Soru</option>
                        <option value={50}>50 Soru</option>
                        <option value={100}>100 Soru</option>
                      </select>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
                            <CalendarDays className="w-5 h-5 text-success" />
                          </div>
                          <div>
                            <h4 className="font-bold mb-1">Sınav Tarihi</h4>
                            <p className="text-xs text-text-muted">Dashboardda sınava kaç gün kaldığını göstermek için tarihi girin.</p>
                          </div>
                        </div>
                        <div className="flex w-full items-center gap-2 sm:w-auto">
                          <input
                            ref={examDateInputRef}
                            type="date"
                            name="examDate"
                            value={notifData.examDate}
                            onChange={handleNotifChange}
                            onClick={openExamDatePicker}
                            className="min-w-0 flex-1 cursor-pointer rounded-xl border border-white/10 bg-bg-dark px-3 py-2 font-bold text-white outline-none focus:border-success focus:ring-2 focus:ring-success/20 sm:flex-none sm:px-4"
                          />
                          <button
                            type="button"
                            onClick={openExamDatePicker}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-success/20 bg-success/10 px-3 text-xs font-black uppercase tracking-widest text-success transition-colors hover:bg-success/20"
                            title="Takvimi aç"
                          >
                            <CalendarDays className="h-4 w-4" />
                            <span className="hidden sm:inline">Takvim</span>
                          </button>
                          {notifData.examDate && (
                            <button
                              type="button"
                              onClick={() => setNotifData({ ...notifData, examDate: '' })}
                              className="w-10 h-10 rounded-xl border border-danger/20 bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20 transition-colors"
                              title="Sınav tarihini temizle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 opacity-50 sm:p-6 cursor-not-allowed" title="Bu özellik yakında mobil uygulamada aktif olacak">
                      <div>
                        <h4 className="font-bold mb-1">E-Posta Bildirimleri</h4>
                        <p className="text-xs text-text-muted">Önemli güncellemeler ve sınav hatırlatıcıları (Yakında).</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-not-allowed">
                        <input type="checkbox" className="sr-only peer" disabled checked={notifData.notifEnabled} />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                      </label>
                    </div>

                    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                      <div>
                        <h4 className="font-bold mb-1">Hatırlatıcı Saati</h4>
                        <p className="text-xs text-text-muted">Günlük çalışmanı hatırlatmamız için bir saat seç.</p>
                      </div>
                      <div className="flex gap-2">
                        <select 
                          name="notifHour" 
                          value={notifData.notifHour} 
                          onChange={handleNotifChange}
                          className="bg-bg-dark border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-success focus:ring-2 focus:ring-success/20 font-bold"
                        >
                          {[...Array(24).keys()].map(h => (
                            <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                        <span className="flex items-center">:</span>
                        <select 
                          name="notifMinute" 
                          value={notifData.notifMinute} 
                          onChange={handleNotifChange}
                          className="bg-bg-dark border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-success focus:ring-2 focus:ring-success/20 font-bold"
                        >
                          {[0, 15, 30, 45].map(m => (
                            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-start pt-4">
                      <button 
                        onClick={savePreferences} 
                        disabled={loading}
                        className="btn-primary flex w-full items-center justify-center gap-2 bg-gradient-to-r from-success to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] sm:w-auto"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Değişiklikleri Kaydet
                      </button>
                    </div>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── MOBILE VIEW (Aligns with Flutter profile_screen.dart) ── */}
      <div className="block lg:hidden space-y-6 px-1">
        {/* Header Block */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#20193A] to-[#101827] p-5 shadow-lg shadow-black/25">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex flex-col items-center">
            {/* Avatar inside Progress Ring */}
            <div className="relative cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-24 h-24 rounded-full flex items-center justify-center relative">
                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 transform -rotate-90" width="96" height="96">
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

        {/* Quick Actions Grid */}
        <div className="space-y-4">
          <div>
            <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider ml-1">Öğrenme</h4>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Link to="/dashboard/lessons" className="flex items-center gap-3 p-3.5 rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Dersler</div>
                  <div className="text-[10px] text-text-muted font-bold mt-0.5">Müfredat & İçerik</div>
                </div>
              </Link>

              <Link to="/dashboard/stats" className="flex items-center gap-3 p-3.5 rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <BarChart2 className="w-5 h-5 text-primary-light" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">İstatistik</div>
                  <div className="text-[10px] text-text-muted font-bold mt-0.5">Performans Analizi</div>
                </div>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-black text-text-muted uppercase tracking-wider ml-1">Araçlar</h4>
            <div className="grid grid-cols-3 gap-2.5 mt-2">
              <button onClick={() => setIsBadgesOpen(true)} className="flex flex-col items-center text-center p-3 rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-1.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-white/95 leading-none">Rozetler</span>
              </button>

              <button onClick={() => setIsLeaderboardOpen(true)} className="flex flex-col items-center text-center p-3 rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-1.5">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <span className="text-[10px] font-black text-white/95 leading-none">Sıralama</span>
              </button>

              <Link to="/dashboard/favorites" className="flex flex-col items-center text-center p-3 rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-1.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[10px] font-black text-white/95 leading-none">Favoriler</span>
              </Link>

              <Link to="/dashboard/support" className="flex flex-col items-center text-center p-3 rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-1.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-black text-white/95 leading-none">Destek</span>
              </Link>

              <Link to="/dashboard/driving-schools" className="flex flex-col items-center text-center p-3 rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-1.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <MapPinned className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-[10px] font-black text-white/95 leading-none">Kurslar</span>
              </Link>

              <button onClick={() => setIsNotifSettingsOpen(true)} className="flex flex-col items-center text-center p-3 rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-1.5">
                <div className="w-9 h-9 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-success" />
                </div>
                <span className="text-[10px] font-black text-white/95 leading-none">Ayarlar</span>
              </button>
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
    </div>
  );
};

export default UserSettings;
