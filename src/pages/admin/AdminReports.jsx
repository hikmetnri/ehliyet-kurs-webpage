import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import {
  Loader2, Search, ShieldAlert, User, RefreshCw,
  CheckCircle2, Clock, XCircle, AlertTriangle,
  Inbox, Trash2, FileText, MessageSquare,
  AlertCircle, ChevronRight, ExternalLink, Calendar
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:   { label: 'BEKLEMEDE', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   dot: 'bg-amber-400 animate-pulse' },
  reviewed:  { label: 'İNCELENDİ', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', dot: 'bg-indigo-400' },
  resolved:  { label: 'ÇÖZÜLDÜ',   color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  dismissed: { label: 'REDDEDİLDİ', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 opacity-80', dot: 'bg-rose-400' },
  rejected:  { label: 'REDDEDİLDİ', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 opacity-80', dot: 'bg-rose-400' },
};

const TARGET_CONFIG = {
  question: { icon: FileText,     label: 'Soru',           color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  user:     { icon: User,         label: 'Kullanıcı',      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  post:     { icon: MessageSquare, label: 'Akış Gönderisi', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
};

const ACTIONS = [
  { id: 'pending',   label: 'Beklemede', icon: Clock,         hover: 'hover:bg-amber-500 hover:border-amber-500 hover:text-white' },
  { id: 'reviewed',  label: 'İncelendi', icon: Search,        hover: 'hover:bg-indigo-500 hover:border-indigo-500 hover:text-white' },
  { id: 'resolved',  label: 'Çözüldü',  icon: CheckCircle2,  hover: 'hover:bg-emerald-500 hover:border-emerald-500 hover:text-white' },
  { id: 'dismissed', label: 'Reddet',   icon: XCircle,       hover: 'hover:bg-rose-500 hover:border-rose-500 hover:text-white' },
];

const FILTERS = [
  { id: 'all',      label: 'Tümü' },
  { id: 'pending',  label: 'Açık' },
  { id: 'resolved', label: 'Çözüldü' },
  { id: 'dismissed', label: 'Reddedilen' },
];

// Import Search icon for ACTIONS (already imported above as Search from lucide)

const AdminReports = () => {
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedReport, setSelected] = useState(null);
  const [searchTerm, setSearch]       = useState('');
  const [statusFilter, setFilter]     = useState('all');
  const [updating, setUpdating]       = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      const data = res.data.success ? res.data.data : res.data;
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Raporlar alınamadı:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      setUpdating(true);
      await api.put(`/reports/${reportId}/status`, { status: newStatus });
      setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: newStatus } : r));
      if (selectedReport?._id === reportId) {
        setSelected(prev => ({ ...prev, status: newStatus }));
      }
    } catch {
      alert('Durum güncellenirken hata oluştu.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Bu raporu sistemden kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      setUpdating(true);
      await api.delete(`/reports/${reportId}`);
      setReports(prev => prev.filter(r => r._id !== reportId));
      if (selectedReport?._id === reportId) setSelected(null);
    } catch {
      alert('Rapor silinemedi.');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = reports.filter(r => {
    const term = searchTerm.toLowerCase();
    const reporterName = r.reporter ? `${r.reporter.firstName} ${r.reporter.lastName}`.toLowerCase() : '';
    const match =
      (r.reason || '').toLowerCase().includes(term) ||
      (r.details || '').toLowerCase().includes(term) ||
      reporterName.includes(term);
    const statusMatch = statusFilter === 'all' || r.status === statusFilter;
    return match && statusMatch;
  });

  const counts = {
    all:       reports.length,
    pending:   reports.filter(r => r.status === 'pending').length,
    resolved:  reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed' || r.status === 'rejected').length,
  };

  const targetCfg = (type) => TARGET_CONFIG[type] || { icon: AlertCircle, label: 'İçerik', color: 'text-text-muted bg-white/5 border-white/10' };
  const statusCfg = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <div className="flex flex-col gap-5 sm:gap-6 pb-8">

      {/* Page Header */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-primary-light uppercase tracking-widest">Moderasyon</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">Rapor & Şikayet Merkezi</h1>
            <p className="mt-1 text-sm text-text-muted max-w-2xl">
              Soru hataları veya topluluk kurallarını ihlal eden içerikleri denetleyin.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <p className="text-lg font-black text-white">{counts.pending}</p>
                <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Açık</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                <p className="text-lg font-black text-white">{counts.resolved}</p>
                <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Çözüldü</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2">
                <p className="text-lg font-black text-white">{counts.all}</p>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Toplam</p>
              </div>
            </div>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="p-3 rounded-2xl border border-white/10 bg-white/[0.02] text-text-muted hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row flex-1 gap-5 sm:gap-6 md:min-h-[calc(100vh-300px)]">

        {/* Left: Report List */}
        <div className="md:w-[380px] w-full flex flex-col gap-3 shrink-0">

          {/* Search + Filter */}
          <div className="bg-white/[0.02] p-3 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center gap-3 bg-black/20 rounded-2xl px-4 py-3 border border-white/10 focus-within:border-primary/40 transition-all">
              <Search className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Rapor / Kullanıcı Ara..."
                className="bg-transparent outline-none text-sm w-full text-white placeholder:text-white/25 font-medium"
                value={searchTerm}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 p-1 bg-black/20 rounded-2xl border border-white/10">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    statusFilter === f.id
                      ? 'bg-primary/20 text-primary-light'
                      : 'text-text-muted hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {f.label}
                  {f.id !== 'all' && counts[f.id] > 0 && (
                    <span className="ml-1 text-[8px]">({counts[f.id]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar max-h-[60vh] md:max-h-none pr-0.5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-white/10 bg-white/[0.015]">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                <span className="text-xs font-bold text-primary-light uppercase tracking-widest">Taranıyor...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                <Inbox className="w-12 h-12 text-white/10 mb-3" />
                <span className="text-sm font-bold text-text-muted">Rapor bulunamadı</span>
              </div>
            ) : (
              filtered.map(report => {
                const scfg = statusCfg(report.status);
                const tcfg = targetCfg(report.targetType);
                const isSelected = selectedReport?._id === report._id;

                return (
                  <motion.button
                    key={report._id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelected(report)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all relative ${
                      isSelected
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-white/[0.015] border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                    }`}
                  >
                    {isSelected && <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-primary" />}
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${tcfg.color}`}>
                        <tcfg.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border ${scfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${scfg.dot}`} />
                            {scfg.label}
                          </span>
                          <span className="text-[9px] text-text-muted/60">
                            {new Date(report.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className={`text-sm font-bold leading-snug truncate ${isSelected ? 'text-white' : 'text-white/90'}`}>
                          {report.reason}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${tcfg.color}`}>
                            {tcfg.label}
                          </span>
                          {report.reporter && (
                            <span className="text-[10px] text-text-muted truncate">
                              {report.reporter.firstName} {report.reporter.lastName}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-text-muted shrink-0 mt-1 transition-transform ${isSelected ? 'rotate-90 text-primary-light' : ''}`} />
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detail */}
        <div className="flex-1 min-h-[480px] md:min-h-0 bg-white/[0.02] rounded-3xl border border-white/10 flex flex-col overflow-hidden">
          {selectedReport ? (
            <>
              {/* Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-white/10 bg-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-white leading-tight truncate">{selectedReport.reason}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      {selectedReport.reporter && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <User className="w-3 h-3 opacity-50" />
                          {selectedReport.reporter.firstName} {selectedReport.reporter.lastName}
                        </span>
                      )}
                      <span className="text-[9px] font-bold text-primary-light bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        #{selectedReport._id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border ${statusCfg(selectedReport.status).color}`}>
                        {statusCfg(selectedReport.status).label}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(selectedReport._id)}
                  disabled={updating}
                  className="p-2 rounded-xl bg-white/[0.02] border border-white/10 text-text-muted hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all disabled:opacity-50 shrink-0"
                  title="Raporu sil"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">

                {/* Status Actions */}
                <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.015] space-y-3">
                  <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">Durum Güncelle</p>
                  <div className="flex flex-wrap gap-2">
                    {ACTIONS.map(action => {
                      const isActive = selectedReport.status === action.id;
                      return (
                        <button
                          key={action.id}
                          disabled={updating}
                          onClick={() => handleUpdateStatus(selectedReport._id, action.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border disabled:opacity-50 ${
                            isActive
                              ? 'bg-white text-black border-white shadow-sm'
                              : `bg-white/[0.03] text-white/50 border-white/10 ${action.hover}`
                          }`}
                        >
                          <action.icon className="w-3.5 h-3.5" />
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Şikayet Detayı */}
                  <div>
                    <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest mb-2">Şikayet Detayı</p>
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-sm text-white/90 leading-relaxed italic min-h-[80px]">
                      "{selectedReport.details || 'Detay belirtilmemiş.'}"
                    </div>
                  </div>

                  {/* Şikayet Tarihi */}
                  <div>
                    <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest mb-2">Raporlama Bilgisi</p>
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-text-muted" />
                        <span className="text-white font-bold">
                          {new Date(selectedReport.createdAt).toLocaleString('tr-TR', {
                            day: 'numeric', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {selectedReport.reporter?.email && (
                        <div className="text-xs text-text-muted truncate">
                          {selectedReport.reporter.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Şikayet edilen içerik */}
                <div>
                  <p className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest mb-2">Şikayet Edilen İçerik</p>
                  <div className={`flex items-center gap-4 p-4 rounded-2xl border ${targetCfg(selectedReport.targetType).color}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${targetCfg(selectedReport.targetType).color}`}>
                      {React.createElement(targetCfg(selectedReport.targetType).icon, { className: 'w-5 h-5' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{targetCfg(selectedReport.targetType).label}</p>
                      <p className="text-[10px] text-text-muted font-mono mt-0.5 truncate">
                        ID: {selectedReport.targetId}
                      </p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 text-text-muted rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
                      <ExternalLink className="w-3 h-3" /> Git
                    </button>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-5">
                <ShieldAlert className="w-7 h-7 text-white/15" />
              </div>
              <h3 className="text-base font-bold text-white">Rapor Seçilmedi</h3>
              <p className="text-text-secondary text-sm max-w-xs mt-2 leading-relaxed">
                Sol taraftaki listeden bir rapor seçerek incelemeye başlayın.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Re-export Search for ACTIONS (already used directly)
export default AdminReports;
