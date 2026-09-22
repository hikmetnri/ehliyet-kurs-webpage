import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  User, Lock, Bell, Loader2, Save, AlertCircle, CheckCircle2, Trash2,
  Trophy, Award, HelpCircle, ChevronDown,
  Settings, Building2,
} from 'lucide-react';
// Lucide icon name → component map ve BadgeIcon userSettingsBits.jsx'e taşındı.

import useAuthStore from '../../store/authStore';
import api from '../../api';
import { TURKEY_CITIES, getDistrictsForCity } from '../../data/turkeyLocations';
import CategorySelectorModal from '../../components/user/CategorySelectorModal';
import { soundService } from '../../services/soundService';
import { registerWebPushToken } from '../../services/webPushService';
import {
  BadgeIcon,
  renderMobileModal,
} from './userSettingsBits';
import {
  buildDefaultBadges,
  formatExamDate,
  getSortedBadges,
} from './userSettingsHelpers';

// ─── Extracted Modules (SRP) ─────────────────────────────────────
import { getStoredExamDateInput } from './settings/settingsHelpers';
import { DesktopSettingsView, MobileSettingsView } from './settings/SettingsViews';

const UserSettings = () => {
  const { themeMode, changeThemeMode, isThemeLocked } = useOutletContext() || {};
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
  // Son 7 günün aktif olup olmadığını tutan dizi (gerçek exam result tarihlerinden)
  const [weekActivity, setWeekActivity] = useState([false, false, false, false, false, false, false]);

  // Load stats + son 7 gün aktivite
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, resultsRes] = await Promise.allSettled([
          api.get('/exam-results/stats'),
          api.get('/exam-results?limit=200'),
        ]);

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data?.stats || statsRes.value.data || {});
        }

        if (resultsRes.status === 'fulfilled') {
          const results = resultsRes.value.data?.data ||
                          resultsRes.value.data?.results ||
                          (Array.isArray(resultsRes.value.data) ? resultsRes.value.data : []);

          // Son 7 günü Pazartesi=0 ... Pazar=6 sırasına göre hesapla
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          // todayIndex: Pzt=0 ... Paz=6
          const todayDow = (today.getDay() + 6) % 7;

          const active = Array.from({ length: 7 }, (_, i) => {
            // i=0 → Pzt ... i=todayDow → bugün
            if (i > todayDow) return false; // henüz gelmemiş gün
            const offset = todayDow - i; // kaç gün önce
            const day = new Date(today);
            day.setDate(day.getDate() - offset);
            const dayEnd = new Date(day);
            dayEnd.setDate(dayEnd.getDate() + 1);
            return results.some(r => {
              const d = new Date(r.createdAt);
              return d >= day && d < dayEnd;
            });
          });

          setWeekActivity(active);
        }
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
    soundEnabled: localStorage.getItem('sound_enabled') !== 'false',
    theme: user?.theme || 'default',
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
    if (passwordData.newPassword.length < 12) {
      showMessage('error', 'Yeni şifre en az 12 karakter olmalıdır.');
      return false;
    }
    setLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      useAuthStore.getState().clearSession();
      window.location.href = '/login';
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
        examDate: notifData.examDate || null,
        theme: notifData.theme || 'default'
      });
      if (res.data.success) {
        if (notifData.examDate) localStorage.setItem('exam_date', new Date(notifData.examDate).toISOString());
        else localStorage.removeItem('exam_date');
        soundService.setSoundEnabled(notifData.soundEnabled);
        soundService.playSave();
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

  const handleThemeChange = async (newTheme) => {
    setNotifData(prev => ({ ...prev, theme: newTheme }));
    try {
      const res = await api.put('/auth/profile', {
        theme: newTheme
      });
      if (res.data.success) {
        soundService.playSave();
        setAuth({ ...user, ...res.data.user }, token);
        showMessage('success', 'Tema tercihi başarıyla güncellendi.');
      }
    } catch {
      showMessage('error', 'Tema güncellenirken hata oluştu.');
    }
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


  const desktopTabs = [
    { id: 'profile', icon: User, label: 'Profil Bilgileri' },
    { id: 'account', icon: Lock, label: 'Hesap Güvenliği' },
    { id: 'notifications', icon: Bell, label: 'Tercihler & Hedefler' },
    { id: 'driving-schools', icon: Building2, label: 'Sürücü Kursları' },
    { id: 'badges', icon: Award, label: 'Kazanılan Rozetler' },
    { id: 'leaderboard', icon: Trophy, label: 'Liderlik Tablosu' },
    { id: 'faq', icon: HelpCircle, label: 'Yardım & SSS' },
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
  // weekActivity: backend exam-results'tan hesaplanan gerçek aktivite günleri
  const activeDays = weekActivity;
  const activeCount = activeDays.filter(Boolean).length;

  // Static badge fallback list
  const DEFAULT_BADGES = buildDefaultBadges(stats, user);

  const displayName = [profileData.firstName, profileData.lastName].filter(Boolean).join(' ') || user?.name || 'Sürücü Adayı';
  const reminderLabel = `${String(notifData.notifHour).padStart(2, '0')}:${String(notifData.notifMinute).padStart(2, '0')}`;
  const examDateLabel = formatExamDate(notifData.examDate);
  const activeBadgeList = badges.length > 0 ? badges : DEFAULT_BADGES;
  const earnedBadges = activeBadgeList.filter((badge) => badge.isEarned).length;
  const sortedBadges = getSortedBadges(activeBadgeList);
  const profileCompletionItems = [
    Boolean(profileData.firstName && profileData.lastName),
    Boolean(profileData.phone),
    Boolean(profileData.city && profileData.district),
    Boolean(profileData.bio),
    Boolean(user?.avatarUrl),
  ];
  const profileCompletion = Math.round((profileCompletionItems.filter(Boolean).length / profileCompletionItems.length) * 100);
  const profileChecklist = [
    { label: 'Ad soyad', detail: 'Panelde görünen kimlik', done: Boolean(profileData.firstName && profileData.lastName) },
    { label: 'Telefon', detail: 'Kurs ve destek iletişimi', done: Boolean(profileData.phone) },
    { label: 'Konum', detail: 'Yakındaki kurs önerileri', done: Boolean(profileData.city && profileData.district) },
    { label: 'Hakkımda', detail: 'Profil özet alanı', done: Boolean(profileData.bio) },
    { label: 'Fotoğraf', detail: 'Kişisel görünüm', done: Boolean(user?.avatarUrl) },
  ];

  return (
    <div className="pb-0 text-white lg:pb-24">
      {message.text && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`sticky top-4 mb-6 z-40 p-4 rounded-2xl flex items-center gap-3 border backdrop-blur-md shadow-lg shadow-black/25 ${
            message.type === 'success'
              ? 'bg-success/15 border-success/20 text-success'
              : 'bg-danger/15 border-danger/20 text-danger'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-success" /> : <AlertCircle className="w-5 h-5 shrink-0 text-danger" />}
          <p className="font-black text-xs uppercase tracking-wide">{message.text}</p>
        </Motion.div>
      )}

      {/* ── DESKTOP VIEW ── */}
      <DesktopSettingsView
        activeCount={activeCount}
        activeDays={activeDays}
        activeFaq={activeFaq}
        activeTab={activeTab}
        badgesLoading={badgesLoading}
        days={days}
        desktopTabs={desktopTabs}
        displayName={displayName}
        earnedBadges={earnedBadges}
        examDateInputRef={examDateInputRef}
        examDateLabel={examDateLabel}
        faqs={faqs}
        faqsLoading={faqsLoading}
        handleAvatarClick={handleAvatarClick}
        handleNotifChange={handleNotifChange}
        handlePasswordChange={handlePasswordChange}
        handleProfileChange={handleProfileChange}
        handleProfileCityChange={handleProfileCityChange}
        handleThemeChange={handleThemeChange}
        leaderboardData={leaderboardData}
        leaderboardLoading={leaderboardLoading}
        leaderboardPeriod={leaderboardPeriod}
        levelInfo={levelInfo}
        loading={loading}
        logout={logout}
        navigate={navigate}
        notifData={notifData}
        openExamDatePicker={openExamDatePicker}
        passwordData={passwordData}
        profileChecklist={profileChecklist}
        profileCompletion={profileCompletion}
        profileData={profileData}
        profileDistrictOptions={profileDistrictOptions}
        reminderLabel={reminderLabel}
        savePassword={savePassword}
        savePreferences={savePreferences}
        saveProfile={saveProfile}
        setActiveFaq={setActiveFaq}
        setActiveTab={setActiveTab}
        setIsCategoryModalOpen={setIsCategoryModalOpen}
        setLeaderboardPeriod={setLeaderboardPeriod}
        setNotifData={setNotifData}
        showMessage={showMessage}
        sortedBadges={sortedBadges}
        stats={stats}
        todayIndex={todayIndex}
        user={user}
      />

      {/* ── MOBILE VIEW (Aligns with Flutter profile_screen.dart) ── */}
      <MobileSettingsView
        activeCount={activeCount}
        activeDays={activeDays}
        changeThemeMode={changeThemeMode}
        days={days}
        fileInputRef={fileInputRef}
        handleAvatarChange={handleAvatarChange}
        handleAvatarClick={handleAvatarClick}
        handleThemeChange={handleThemeChange}
        isThemeLocked={isThemeLocked}
        levelInfo={levelInfo}
        loading={loading}
        logout={logout}
        notifData={notifData}
        setIsBadgesOpen={setIsBadgesOpen}
        setIsCategoryModalOpen={setIsCategoryModalOpen}
        setIsChangePasswordOpen={setIsChangePasswordOpen}
        setIsEditProfileOpen={setIsEditProfileOpen}
        setIsFaqOpen={setIsFaqOpen}
        setIsLeaderboardOpen={setIsLeaderboardOpen}
        setIsNotifSettingsOpen={setIsNotifSettingsOpen}
        showMessage={showMessage}
        stats={stats}
        themeMode={themeMode}
        todayIndex={todayIndex}
        user={user}
      />

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
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary focus:bg-primary/5 font-bold"
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
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary font-bold"
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
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary font-bold"
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
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary font-bold"
              >
                {[0, 15, 30, 45].map(m => (
                  <option key={m} value={m} className="bg-[#1c1d24]">{m.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Cihaz Bildirimleri</label>
            <button
              type="button"
              onClick={async () => {
                try {
                  const token = await registerWebPushToken();
                  if (token) {
                    showMessage('success', 'Harika! Bu cihaz için anlık bildirim izinleri başarıyla tanımlandı.');
                  } else {
                    showMessage('error', 'Bildirim izni alınamadı veya engellendi. Lütfen tarayıcı/sistem ayarlarına izin verin.');
                  }
                } catch (err) {
                  showMessage('error', 'İzin alınırken hata: ' + err.message);
                }
              }}
              className="w-full flex h-11 items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 cursor-pointer hover:bg-primary/10 transition text-xs font-semibold text-primary-light"
            >
              <span>Bu Cihazda Bildirimleri Aktif Et</span>
              <Bell className="w-4 h-4 text-primary" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">Uygulama Sesleri</label>
            <label className="flex h-11 items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 cursor-pointer hover:bg-white/10 transition">
              <span className="text-xs font-semibold text-white">Ses Efektleri</span>
              <input
                type="checkbox"
                name="soundEnabled"
                checked={notifData.soundEnabled}
                onChange={handleNotifChange}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-primary focus:ring-primary/40 focus:ring-offset-0 focus:outline-none"
              />
            </label>
          </div>

          <button
            onClick={async () => {
              const success = await savePreferences();
              if (success) setIsNotifSettingsOpen(false);
            }}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
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
            const activeBadgeList = sortedBadges;
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
                          key={badge._id || badge.id}
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
                            <BadgeIcon name={badge.icon} className="h-6 w-6" />
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
