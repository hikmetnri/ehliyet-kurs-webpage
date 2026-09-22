import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, ArrowRight, Award, BarChart2, Bell, BookOpen, Camera, CheckCircle2, ChevronDown, ChevronRight, HelpCircle, Info, LayoutGrid, Loader2, Lock, LogOut, MapPinned, Monitor, Moon, PlayCircle, RefreshCw, Save, Settings, ShieldCheck, Sparkles, Star, Sun, Target, Trash2, Trophy, User,
} from 'lucide-react';
import { TURKEY_CITIES } from '../../../data/turkeyLocations';
import { registerWebPushToken } from '../../../services/webPushService';
import UserDrivingSchools from '../UserDrivingSchools';
import { BadgeIcon, DesktopField } from '../userSettingsBits';
import { desktopFieldClass } from '../userSettingsHelpers';
import { Link } from 'react-router-dom';

export const DesktopSettingsView = ({
  activeCount,
  activeDays,
  activeFaq,
  activeTab,
  badgesLoading,
  days,
  desktopTabs,
  displayName,
  earnedBadges,
  examDateInputRef,
  examDateLabel,
  faqs,
  faqsLoading,
  handleAvatarClick,
  handleNotifChange,
  handlePasswordChange,
  handleProfileChange,
  handleProfileCityChange,
  handleThemeChange,
  leaderboardData,
  leaderboardLoading,
  leaderboardPeriod,
  levelInfo,
  loading,
  logout,
  navigate,
  notifData,
  openExamDatePicker,
  passwordData,
  profileChecklist,
  profileCompletion,
  profileData,
  profileDistrictOptions,
  reminderLabel,
  savePassword,
  savePreferences,
  saveProfile,
  setActiveFaq,
  setActiveTab,
  setIsCategoryModalOpen,
  setLeaderboardPeriod,
  setNotifData,
  showMessage,
  sortedBadges,
  stats,
  todayIndex,
  user,
}) => (
<div className="hidden lg:block">
        <div className="mx-auto max-w-[1360px] px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_340px] gap-6 items-start">
            
            {/* Column 1: Left Sidebar */}
            <aside className="space-y-5">
              {/* Profile Card */}
              <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#111528] to-[#0a0d16] p-5 shadow-xl shadow-black/30 backdrop-blur-xl">
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
              <nav className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#111528] to-[#0a0d16] p-3 shadow-xl shadow-black/30 space-y-1 backdrop-blur-xl">
                {desktopTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                        isActive
                          ? 'border-primary/20 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent text-white shadow-inner shadow-primary/5'
                          : 'border-transparent bg-transparent text-text-muted hover:bg-white/[0.02] hover:text-white'
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
                <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#111528] to-[#0a0d16] p-5 shadow-xl shadow-black/30 backdrop-blur-xl">
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
                <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#111528] to-[#0a0d16] p-5 shadow-xl shadow-black/30 space-y-4 backdrop-blur-xl">
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
            <main className="min-w-0 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#111528] to-[#0a0d16] p-6 shadow-xl shadow-black/30 backdrop-blur-xl">
              
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
                    {activeTab === 'driving-schools' && 'Şehrinizdeki sürücü kurslarını inceleyin, konumlarını bulun ve doğrudan başvurun.'}
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

                      <div className="md:col-span-2 space-y-3 pt-3 border-t border-border-color">
                        <label className="text-xs font-black text-text-muted uppercase tracking-wider block">Sistem Teması</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {/* Klasik Mor (Default) */}
                          <button
                            type="button"
                            onClick={() => handleThemeChange('default')}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-[100px] cursor-pointer ${
                              notifData.theme === 'default'
                                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                : 'border-border-color bg-bg-card hover:bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="w-5 h-5 rounded-full bg-[#6C63FF] border-2 border-white/20" />
                              {notifData.theme === 'default' && (
                                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                              )}
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-white">Klasik Mor</h5>
                              <p className="text-[10px] text-text-muted mt-0.5">Varsayılan Tema</p>
                            </div>
                          </button>

                          {/* Zümrüt Yeşili (PRO) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!user?.proStatus) {
                                showMessage('error', "Zümrüt Yeşili teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                              } else {
                                handleThemeChange('emerald');
                              }
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-[100px] cursor-pointer relative ${
                              notifData.theme === 'emerald'
                                ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                : 'border-border-color bg-bg-card hover:bg-white/[0.02]'
                            }`}
                          >
                            {!user?.proStatus && (
                              <Lock className="absolute top-4 right-4 w-3.5 h-3.5 text-text-muted/65" />
                            )}
                            <div className="flex items-center justify-between w-full">
                              <span className="w-5 h-5 rounded-full bg-[#10B981] border-2 border-white/20" />
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-white flex items-center gap-1">
                                Zümrüt Yeşili
                                {!user?.proStatus && <span className="text-[8px] bg-warning/15 text-warning px-1 py-0.5 rounded border border-warning/20">PRO</span>}
                              </h5>
                              <p className="text-[10px] text-text-muted mt-0.5">Canlı Yeşil Tonları</p>
                            </div>
                          </button>

                          {/* Gece Mavisi (PRO) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!user?.proStatus) {
                                showMessage('error', "Gece Mavisi teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                              } else {
                                handleThemeChange('midnight');
                              }
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-[100px] cursor-pointer relative ${
                              notifData.theme === 'midnight'
                                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                : 'border-border-color bg-bg-card hover:bg-white/[0.02]'
                            }`}
                          >
                            {!user?.proStatus && (
                              <Lock className="absolute top-4 right-4 w-3.5 h-3.5 text-text-muted/65" />
                            )}
                            <div className="flex items-center justify-between w-full">
                              <span className="w-5 h-5 rounded-full bg-[#3B82F6] border-2 border-white/20" />
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-white flex items-center gap-1">
                                Gece Mavisi
                                {!user?.proStatus && <span className="text-[8px] bg-warning/15 text-warning px-1 py-0.5 rounded border border-warning/20">PRO</span>}
                              </h5>
                              <p className="text-[10px] text-text-muted mt-0.5">Kraliyet Mavisi</p>
                            </div>
                          </button>

                          {/* Obsidyen AMOLED (PRO) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!user?.proStatus) {
                                showMessage('error', "Obsidyen AMOLED teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                              } else {
                                handleThemeChange('obsidian');
                              }
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-[100px] cursor-pointer relative ${
                              notifData.theme === 'obsidian'
                                ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                : 'border-border-color bg-bg-card hover:bg-white/[0.02]'
                            }`}
                          >
                            {!user?.proStatus && (
                              <Lock className="absolute top-4 right-4 w-3.5 h-3.5 text-text-muted/65" />
                            )}
                            <div className="flex items-center justify-between w-full">
                              <span className="w-5 h-5 rounded-full bg-black border-2 border-amber-500/50" />
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-white flex items-center gap-1">
                                Obsidyen AMOLED
                                {!user?.proStatus && <span className="text-[8px] bg-warning/15 text-warning px-1 py-0.5 rounded border border-warning/20">PRO</span>}
                              </h5>
                              <p className="text-[10px] text-text-muted mt-0.5">Sonsuz Siyah & Altın</p>
                            </div>
                          </button>

                          {/* Gün Batımı (PRO) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!user?.proStatus) {
                                showMessage('error', "Gün Batımı teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                              } else {
                                handleThemeChange('sunset');
                              }
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-[100px] cursor-pointer relative ${
                              notifData.theme === 'sunset'
                                ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                                : 'border-border-color bg-bg-card hover:bg-white/[0.02]'
                            }`}
                          >
                            {!user?.proStatus && (
                              <Lock className="absolute top-4 right-4 w-3.5 h-3.5 text-text-muted/65" />
                            )}
                            <div className="flex items-center justify-between w-full">
                              <span className="w-5 h-5 rounded-full bg-[#f97316] border-2 border-white/20" />
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-white flex items-center gap-1">
                                Gün Batımı
                                {!user?.proStatus && <span className="text-[8px] bg-warning/15 text-warning px-1 py-0.5 rounded border border-warning/20">PRO</span>}
                              </h5>
                              <p className="text-[10px] text-text-muted mt-0.5">Sıcak Turuncu Tonları</p>
                            </div>
                          </button>

                          {/* Lavanta Rüyası (PRO) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!user?.proStatus) {
                                showMessage('error', "Lavanta Rüyası teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                              } else {
                                handleThemeChange('lavender');
                              }
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-[100px] cursor-pointer relative ${
                              notifData.theme === 'lavender'
                                ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_15px_rgba(217,70,239,0.2)]'
                                : 'border-border-color bg-bg-card hover:bg-white/[0.02]'
                            }`}
                          >
                            {!user?.proStatus && (
                              <Lock className="absolute top-4 right-4 w-3.5 h-3.5 text-text-muted/65" />
                            )}
                            <div className="flex items-center justify-between w-full">
                              <span className="w-5 h-5 rounded-full bg-[#d946ef] border-2 border-white/20" />
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-white flex items-center gap-1">
                                Lavanta Rüyası
                                {!user?.proStatus && <span className="text-[8px] bg-warning/15 text-warning px-1 py-0.5 rounded border border-warning/20">PRO</span>}
                              </h5>
                              <p className="text-[10px] text-text-muted mt-0.5">Eflatun & Lavanta</p>
                            </div>
                          </button>

                          {/* Yakut Kırmızısı (PRO) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!user?.proStatus) {
                                showMessage('error', "Yakut Kırmızısı teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                              } else {
                                handleThemeChange('ruby');
                              }
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-[100px] cursor-pointer relative ${
                              notifData.theme === 'ruby'
                                ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                                : 'border-border-color bg-bg-card hover:bg-white/[0.02]'
                            }`}
                          >
                            {!user?.proStatus && (
                              <Lock className="absolute top-4 right-4 w-3.5 h-3.5 text-text-muted/65" />
                            )}
                            <div className="flex items-center justify-between w-full">
                              <span className="w-5 h-5 rounded-full bg-[#dc2626] border-2 border-white/20" />
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-white flex items-center gap-1">
                                Yakut Kırmızısı
                                {!user?.proStatus && <span className="text-[8px] bg-warning/15 text-warning px-1 py-0.5 rounded border border-warning/20">PRO</span>}
                              </h5>
                              <p className="text-[10px] text-text-muted mt-0.5">Derin Kırmızı & Gül</p>
                            </div>
                          </button>

                          {/* Kutup Ayazı (PRO) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!user?.proStatus) {
                                showMessage('error', "Kutup Ayazı teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                              } else {
                                handleThemeChange('arctic');
                              }
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-[100px] cursor-pointer relative ${
                              notifData.theme === 'arctic'
                                ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                : 'border-border-color bg-bg-card hover:bg-white/[0.02]'
                            }`}
                          >
                            {!user?.proStatus && (
                              <Lock className="absolute top-4 right-4 w-3.5 h-3.5 text-text-muted/65" />
                            )}
                            <div className="flex items-center justify-between w-full">
                              <span className="w-5 h-5 rounded-full bg-[#06b6d4] border-2 border-white/20" />
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-white flex items-center gap-1">
                                Kutup Ayazı
                                {!user?.proStatus && <span className="text-[8px] bg-warning/15 text-warning px-1 py-0.5 rounded border border-warning/20">PRO</span>}
                              </h5>
                              <p className="text-[10px] text-text-muted mt-0.5">Futuristik Buz Mavisi</p>
                            </div>
                          </button>

                          {/* Ametist (PRO) */}
                          <button
                            type="button"
                            onClick={() => {
                              if (!user?.proStatus) {
                                showMessage('error', "Ametist teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                              } else {
                                handleThemeChange('amethyst');
                              }
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-[100px] cursor-pointer relative ${
                              notifData.theme === 'amethyst'
                                ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                                : 'border-border-color bg-bg-card hover:bg-white/[0.02]'
                            }`}
                          >
                            {!user?.proStatus && (
                              <Lock className="absolute top-4 right-4 w-3.5 h-3.5 text-text-muted/65" />
                            )}
                            <div className="flex items-center justify-between w-full">
                              <span className="w-5 h-5 rounded-full bg-[#8b5cf6] border-2 border-white/20" />
                            </div>
                            <div>
                              <h5 className="text-xs font-black text-white flex items-center gap-1">
                                Ametist
                                {!user?.proStatus && <span className="text-[8px] bg-warning/15 text-warning px-1 py-0.5 rounded border border-warning/20">PRO</span>}
                              </h5>
                              <p className="text-[10px] text-text-muted mt-0.5">Asil Kristal Moru</p>
                            </div>
                          </button>
                        </div>
                      </div>

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

                        <DesktopField label="Cihaz Push Bildirimleri">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const token = await registerWebPushToken();
                                if (token) {
                                  showMessage('success', 'Harika! Bu cihaz için anlık bildirim izinleri başarıyla tanımlandı.');
                                } else {
                                  showMessage('error', 'Bildirim izni alınamadı veya engellendi. Tarayıcı adres çubuğundaki kilit ikonundan izin vermeniz gerekebilir.');
                                }
                              } catch (err) {
                                showMessage('error', 'İzin alınırken bir sorun oluştu: ' + err.message);
                              }
                            }}
                            className="w-full flex h-[46px] items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 cursor-pointer hover:bg-primary/10 transition text-sm font-semibold text-primary-light"
                          >
                            <span>Bu Cihazda Bildirimleri Etkinleştir</span>
                            <Bell className="w-4 h-4 text-primary" />
                          </button>
                        </DesktopField>

                        <DesktopField label="Ses Tercihleri">
                          <label className="flex h-[46px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.015] px-4 cursor-pointer hover:bg-white/[0.03] transition">
                            <span className="text-sm font-semibold text-white">Uygulama Sesleri</span>
                            <input
                              type="checkbox"
                              name="soundEnabled"
                              checked={notifData.soundEnabled}
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
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-primary/25 cursor-pointer"
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
                            {sortedBadges.filter(b => b.isEarned).length} / {sortedBadges.length}
                          </span>
                          <span className="text-[10px] text-text-muted block font-black uppercase tracking-wider">Kazanılan</span>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg font-black text-xs text-bg-dark">
                          {sortedBadges.length > 0 ? Math.round((sortedBadges.filter(b => b.isEarned).length / sortedBadges.length) * 100) : 0}%
                        </div>
                      </div>
                    </div>

                    {badgesLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {sortedBadges.map((badge) => {
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
                                <BadgeIcon
                                  name={badge.icon}
                                  className="w-7 h-7"
                                  style={{ color: isEarned ? badgeColor : '#666' }}
                                />
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
                          const isSelf = item.userId
                            ? String(item.userId) === String(user?._id)
                            : (user?._id === item._id || user?.id === item.id);

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

                {activeTab === 'driving-schools' && (
                  <Motion.div
                    key="driving-schools"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <UserDrivingSchools />
                  </Motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Column 3: Right Sidebar */}
            <aside className="space-y-5 hidden xl:block">
              {/* Profile Completion Checklist */}
              <section className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#111528] to-[#0a0d16] p-5 shadow-xl shadow-black/30 backdrop-blur-xl">
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
              <section className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#111528] to-[#0a0d16] p-5 shadow-xl shadow-black/30 space-y-4 backdrop-blur-xl">
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
              <section className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#111528] to-[#0a0d16] p-5 shadow-xl shadow-black/30 space-y-3.5 backdrop-blur-xl">
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
);

export const MobileSettingsView = ({
  activeCount,
  activeDays,
  changeThemeMode,
  days,
  fileInputRef,
  handleAvatarChange,
  handleAvatarClick,
  handleThemeChange,
  isThemeLocked,
  levelInfo,
  loading,
  logout,
  notifData,
  setIsBadgesOpen,
  setIsCategoryModalOpen,
  setIsChangePasswordOpen,
  setIsEditProfileOpen,
  setIsFaqOpen,
  setIsLeaderboardOpen,
  setIsNotifSettingsOpen,
  showMessage,
  stats,
  themeMode,
  todayIndex,
  user,
}) => (
<div className="flutter-mobile flutter-profile block lg:hidden">
        <section className="flutter-profile-header">
          <button type="button" className="flutter-profile-avatar" onClick={handleAvatarClick} aria-label="Profil fotoğrafını değiştir" style={{ '--level-color': levelInfo.hex, '--level-progress': `${levelInfo.progress * 100}%` }}>
            <span className="flutter-profile-avatar-inner">
              {/* eslint-disable-next-line react-hooks/refs -- ref okuma yalnizca gecici spinner kosulu; tasinan koddan birebir korundu */}
              {loading && fileInputRef.current?.files?.length > 0 ? <Loader2 className="animate-spin" /> : user?.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <User size={36} />}
            </span>
            <span className="flutter-avatar-camera"><Camera size={13} /></span>
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          <div className="flutter-profile-identity">
            <div className="flutter-profile-name"><h1>{user?.firstName} {user?.lastName}</h1><button aria-label="Profili düzenle" onClick={() => setIsEditProfileOpen(true)}><User size={13} /></button></div>
            <span className="flutter-level-chip" style={{ '--level-color': levelInfo.hex }}>{levelInfo.name}</span>
            <div className="flutter-profile-points"><span><Star size={13} /> {user?.totalScore || 0} Puan</span>{user?.proStatus && <strong>PRO</strong>}</div>
          </div>
          {user?.bio && <p className="flutter-profile-bio">{user.bio}</p>}
        </section>

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
                className="flex items-center gap-2 px-2.5 py-2 bg-purple-500/12 border border-purple-500/18 rounded-xl text-purple-400 font-black text-[11px] hover:bg-purple-500/20 transition-colors"
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
                className="flex flex-col items-center justify-center text-center p-2 h-[76px] rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-text-primary leading-none truncate max-w-full">Dersler</span>
              </Link>

              {/* Video */}
              <Link
                to="/dashboard/videos"
                className="flex flex-col items-center justify-center text-center p-2 h-[76px] rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-text-primary leading-none truncate max-w-full">Video</span>
              </Link>

              {/* Rozetler */}
              <button
                onClick={() => setIsBadgesOpen(true)}
                className="flex flex-col items-center justify-center text-center p-2 h-[76px] rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Award className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-text-primary leading-none truncate max-w-full">Rozetler</span>
              </button>

              {/* Sıralama */}
              <button
                onClick={() => setIsLeaderboardOpen(true)}
                className="flex flex-col items-center justify-center text-center p-2 h-[76px] rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Trophy className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-text-primary leading-none truncate max-w-full">Sıralama</span>
              </button>

              {/* Favoriler */}
              <Link
                to="/dashboard/favorites"
                className="flex flex-col items-center justify-center text-center p-2 h-[76px] rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Star className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-text-primary leading-none truncate max-w-full">Favoriler</span>
              </Link>

              {/* Sürücü Kursu */}
              <Link
                to="/dashboard/driving-schools"
                className="flex flex-col items-center justify-center text-center p-2 h-[76px] rounded-2xl bg-bg-card border border-white/5 shadow-md hover:bg-white/[0.02] transition-all gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <MapPinned className="w-[18px] h-[18px] text-purple-400" />
                </div>
                <span className="text-[10px] font-black text-text-primary leading-none truncate max-w-full">S. Kursu</span>
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

        <section className="flutter-profile-stats">
          <h2><BarChart2 size={16} /> İstatistikler</h2>
          <div className="flutter-profile-stats-grid">
            {[
              { icon: Star, label: 'Puan', value: user?.totalScore || 0, color: '#ffd700' },
              { icon: BookOpen, label: 'Sınav', value: stats.totalExams || 0, color: 'var(--color-primary)' },
              { icon: HelpCircle, label: 'Soru', value: stats.totalQuestions || 0, color: 'var(--color-accent)' },
              { icon: CheckCircle2, label: 'Doğru', value: stats.totalCorrect || 0, color: '#4caf50' },
              { icon: Target, label: 'Başarı', value: `%${stats.successRate || 0}`, color: '#ffb74d' },
              { icon: Trophy, label: 'Seviye', value: user?.level || 1, color: '#ff7043' },
            ].map(({ icon: Icon, label, value, color }) => <div key={label} style={{ '--stat-color': color }}><span><Icon size={20} /></span><strong>{value}</strong><small>{label}</small></div>)}
          </div>
        </section>

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
                    onClick={() => showMessage('error', "Premium abonelik işlemleri web sürümünde desteklenmemektedir. Güvenlik ve faturalandırma kuralları nedeniyle premium abonelik işlemleri şu an için yalnızca Android uygulamamız (Google Play) üzerinden gerçekleştirilebilir.")}
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

              <div className="w-full flex flex-col gap-3 p-4 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-white">Tema</div>
                    <div className="text-[10px] text-text-muted mt-1 font-bold">
                      {isThemeLocked
                        ? "Özel tema aktifken renk modu değiştirilemez"
                        : themeMode === 'dark'
                          ? "Karanlık Mod aktif"
                          : themeMode === 'system'
                            ? "Sistem varsayılanı aktif"
                            : "Aydınlık Mod aktif"}
                    </div>
                  </div>
                  {isThemeLocked && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-text-muted opacity-60">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {!isThemeLocked && (
                  <div className="grid grid-cols-3 bg-white/[0.02] border border-white/5 rounded-2xl p-1 gap-1">
                    {/* Aydınlık */}
                    <button
                      onClick={() => changeThemeMode('light')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        themeMode === 'light'
                          ? 'bg-primary text-white shadow-md'
                          : 'text-text-muted hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Açık</span>
                    </button>
                    
                    {/* Karanlık */}
                    <button
                      onClick={() => changeThemeMode('dark')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        themeMode === 'dark'
                          ? 'bg-primary text-white shadow-md'
                          : 'text-text-muted hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Koyu</span>
                    </button>
                    
                    {/* Sistem */}
                    <button
                      onClick={() => changeThemeMode('system')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        themeMode === 'system'
                          ? 'bg-primary text-white shadow-md'
                          : 'text-text-muted hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Sistem</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="w-full flex flex-col gap-2 p-4 text-left border-t border-white/5">
                <div className="text-xs font-black text-white">Arayüz Teması</div>
                <div className="flex gap-3 overflow-x-auto pb-2 pt-1 custom-scrollbar">
                  {/* Klasik Mor */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange('default')}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 cursor-pointer transition ${
                      notifData.theme === 'default' ? 'border-[#6C63FF] bg-[#6C63FF]/15' : 'border-border-color bg-bg-card'
                    }`}
                    title="Klasik Mor"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#6C63FF]" />
                  </button>

                  {/* Zümrüt Yeşili */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!user?.proStatus) {
                        showMessage('error', "Zümrüt Yeşili teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                      } else {
                        handleThemeChange('emerald');
                      }
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 cursor-pointer transition relative ${
                      notifData.theme === 'emerald' ? 'border-[#10B981] bg-[#10B981]/15' : 'border-border-color bg-bg-card'
                    }`}
                    title="Zümrüt Yeşili"
                  >
                    {!user?.proStatus && <Lock className="absolute -top-1 -right-1 w-3 h-3 text-text-muted" />}
                    <span className="w-5 h-5 rounded-full bg-[#10B981]" />
                  </button>

                  {/* Gece Mavisi */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!user?.proStatus) {
                        showMessage('error', "Gece Mavisi teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                      } else {
                        handleThemeChange('midnight');
                      }
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 cursor-pointer transition relative ${
                      notifData.theme === 'midnight' ? 'border-[#3B82F6] bg-[#3B82F6]/15' : 'border-border-color bg-bg-card'
                    }`}
                    title="Gece Mavisi"
                  >
                    {!user?.proStatus && <Lock className="absolute -top-1 -right-1 w-3 h-3 text-text-muted" />}
                    <span className="w-5 h-5 rounded-full bg-[#3B82F6]" />
                  </button>

                  {/* Obsidyen */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!user?.proStatus) {
                        showMessage('error', "Obsidyen AMOLED teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                      } else {
                        handleThemeChange('obsidian');
                      }
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 cursor-pointer transition relative ${
                      notifData.theme === 'obsidian' ? 'border-amber-500 bg-amber-500/15' : 'border-border-color bg-bg-card'
                    }`}
                    title="Obsidyen AMOLED"
                  >
                    {!user?.proStatus && <Lock className="absolute -top-1 -right-1 w-3 h-3 text-text-muted" />}
                    <span className="w-5 h-5 rounded-full bg-black border border-amber-500/50" />
                  </button>

                  {/* Gün Batımı */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!user?.proStatus) {
                        showMessage('error', "Gün Batımı teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                      } else {
                        handleThemeChange('sunset');
                      }
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 cursor-pointer transition relative ${
                      notifData.theme === 'sunset' ? 'border-orange-500 bg-orange-500/15' : 'border-border-color bg-bg-card'
                    }`}
                    title="Gün Batımı"
                  >
                    {!user?.proStatus && <Lock className="absolute -top-1 -right-1 w-3 h-3 text-text-muted" />}
                    <span className="w-5 h-5 rounded-full bg-[#f97316]" />
                  </button>

                  {/* Lavanta Rüyası */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!user?.proStatus) {
                        showMessage('error', "Lavanta Rüyası teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                      } else {
                        handleThemeChange('lavender');
                      }
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 cursor-pointer transition relative ${
                      notifData.theme === 'lavender' ? 'border-fuchsia-500 bg-fuchsia-500/15' : 'border-border-color bg-bg-card'
                    }`}
                    title="Lavanta Rüyası"
                  >
                    {!user?.proStatus && <Lock className="absolute -top-1 -right-1 w-3 h-3 text-text-muted" />}
                    <span className="w-5 h-5 rounded-full bg-[#d946ef]" />
                  </button>

                  {/* Yakut Kırmızısı */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!user?.proStatus) {
                        showMessage('error', "Yakut Kırmızısı teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                      } else {
                        handleThemeChange('ruby');
                      }
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 cursor-pointer transition relative ${
                      notifData.theme === 'ruby' ? 'border-red-500 bg-red-500/15' : 'border-border-color bg-bg-card'
                    }`}
                    title="Yakut Kırmızısı"
                  >
                    {!user?.proStatus && <Lock className="absolute -top-1 -right-1 w-3 h-3 text-text-muted" />}
                    <span className="w-5 h-5 rounded-full bg-[#dc2626]" />
                  </button>

                  {/* Kutup Ayazı */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!user?.proStatus) {
                        showMessage('error', "Kutup Ayazı teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                      } else {
                        handleThemeChange('arctic');
                      }
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 cursor-pointer transition relative ${
                      notifData.theme === 'arctic' ? 'border-cyan-500 bg-cyan-500/15' : 'border-border-color bg-bg-card'
                    }`}
                    title="Kutup Ayazı"
                  >
                    {!user?.proStatus && <Lock className="absolute -top-1 -right-1 w-3 h-3 text-text-muted" />}
                    <span className="w-5 h-5 rounded-full bg-[#06b6d4]" />
                  </button>

                  {/* Ametist */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!user?.proStatus) {
                        showMessage('error', "Ametist teması yalnızca PRO üyeler içindir! Android uygulamamız (Google Play) üzerinden premium üyelik edinebilirsiniz.");
                      } else {
                        handleThemeChange('amethyst');
                      }
                    }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 cursor-pointer transition relative ${
                      notifData.theme === 'amethyst' ? 'border-purple-500 bg-purple-500/15' : 'border-border-color bg-bg-card'
                    }`}
                    title="Ametist"
                  >
                    {!user?.proStatus && <Lock className="absolute -top-1 -right-1 w-3 h-3 text-text-muted" />}
                    <span className="w-5 h-5 rounded-full bg-[#8b5cf6]" />
                  </button>
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
);
