import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Search, ShieldAlert, User, Filter,
  ChevronRight, CheckCircle2, Clock, XCircle,
  AlertTriangle, Inbox, Trash2, MoreVertical, ExternalLink,
  MessageSquare, FileText, AlertCircle
} from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports');
      // Admin dashboard expected data: { success: true, data: [...] } OR [...]
      const data = res.data.success ? res.data.data : res.data;
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Raporlar alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      setUpdating(true);
      const res = await api.put(`/reports/${reportId}/status`, { status: newStatus });
      if (res.data.success || res.status === 200) {
        setReports(prev => prev.map(r => r._id === reportId ? { ...r, status: newStatus } : r));
        if (selectedReport?._id === reportId) {
          setSelectedReport(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      alert("Durum güncellenirken hata oluştu.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Bu raporu sistemden tamamen silmek istediğinize emin misiniz?")) return;
    try {
      setUpdating(true);
      const res = await api.delete(`/reports/${reportId}`);
      if (res.status === 200 || res.data.success) {
        setReports(prev => prev.filter(r => r._id !== reportId));
        if (selectedReport?._id === reportId) setSelectedReport(null);
      }
    } catch (err) {
      alert("Rapor silinemedi.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const term = searchTerm.toLowerCase();
    const reporterName = r.reporter ? `${r.reporter.firstName} ${r.reporter.lastName}`.toLowerCase() : '';
    const matchesSearch = r.reason?.toLowerCase().includes(term) ||
                          r.details?.toLowerCase().includes(term) ||
                          reporterName.includes(term);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return { label: 'BEKLEMEDE', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' };
      case 'reviewed': return { label: 'İNCELENDİ', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', dot: 'bg-indigo-400' };
      case 'resolved': return { label: 'ÇÖZÜLDÜ', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' };
      case 'dismissed': return { label: 'REDDEDİLDİ', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 opacity-70', dot: 'bg-rose-400' };
      default: return { label: status?.toUpperCase(), color: 'bg-white/5 text-text-muted border-white/10', dot: 'bg-white/50' };
    }
  };

  const getTargetIcon = (type) => {
    switch (type) {
      case 'question': return <FileText className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'post': return <MessageSquare className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTargetLabel = (type) => {
    switch (type) {
      case 'question': return 'SORU';
      case 'user': return 'KULLANICI';
      case 'post': return 'AKAK GÖNDERİSİ';
      default: return 'İÇERİK';
    }
  };

  return (
    <div className="flex flex-col md:h-[calc(100vh-120px)] gap-5 sm:gap-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">Rapor & Şikayet Merkezi</h1>
          <p className="text-text-secondary text-sm mt-1">Soru hataları veya topluluk kurallarını ihlal eden içerikleri denetleyin.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-5 sm:gap-6 md:min-h-0">

        {/* Left Side: Report List */}
        <div className="md:w-96 w-full flex flex-col gap-4 shrink-0 md:min-h-0">

          <div className="bg-white/[0.02] p-3 rounded-3xl border border-white/10 flex flex-col gap-3 shadow-sm">
            <div className="flex items-center bg-white/[0.02] rounded-2xl px-4 py-3 w-full border border-white/10 transition-all focus-within:border-primary/50 focus-within:bg-black/20">
              <Search className="w-5 h-5 text-primary-light mr-3" />
              <input
                type="text"
                placeholder="Rapor / Kullanıcı Ara..."
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-text-muted font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-1.5 p-1 bg-white/[0.02] rounded-2xl border border-white/10">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'pending', label: 'Açık' },
                { id: 'resolved', label: 'Çözülü' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    statusFilter === f.id
                        ? 'bg-primary/20 text-primary-light border-primary/30'
                        : 'bg-transparent border-transparent text-text-muted hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:flex-1 max-h-[48vh] md:max-h-none overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] border border-white/10 rounded-3xl">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <span className="text-[10px] font-bold text-primary-light uppercase tracking-widest animate-pulse">Sistem Taranıyor...</span>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] border border-white/10 rounded-3xl">
                     <Inbox className="w-16 h-16 text-white/10 mb-4" />
                    <span className="text-sm font-bold text-text-muted">Aktif rapor bulunamadı.</span>
                </div>
            ) : (
                filteredReports.map((report) => {
                    const statusInfo = getStatusBadge(report.status);
                    const isSelected = selectedReport?._id === report._id;

                    return (
                        <motion.button
                            key={report._id}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSelectedReport(report)}
                            className={`w-full text-left p-5 rounded-3xl border transition-all duration-300 relative group overflow-hidden ${
                                isSelected
                                ? 'bg-primary/5 border-primary/40 shadow-sm'
                                : 'bg-white/[0.015] border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
                            }`}
                        >
                            {isSelected && <div className="absolute left-0 top-[20%] bottom-[20%] w-1 rounded-r-full bg-primary"></div>}

                            <div className="flex justify-between items-start mb-3">
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${statusInfo.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span> {statusInfo.label}
                                </span>
                                <span className="text-[10px] text-text-muted font-bold flex items-center gap-1 opacity-70">
                                    <Clock className="w-3 h-3" /> {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                            </div>

                            <h3 className="font-bold text-sm line-clamp-1 mb-2 text-white">
                                {report.reason}
                            </h3>

                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[9px] font-bold text-primary-light bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/25 inline-flex items-center gap-1.5 uppercase">
                                    {getTargetIcon(report.targetType)} {getTargetLabel(report.targetType)}
                                </span>
                            </div>

                            <div className="text-xs text-text-muted line-clamp-2 italic bg-white/[0.01] px-3.5 py-2.5 rounded-2xl border border-white/10">
                                "{report.details}"
                            </div>
                        </motion.button>
                    );
                })
            )}
          </div>
        </div>

        {/* Right Side: Detail Area */}
        <div className="flex-1 min-h-[560px] md:min-h-0 bg-white/[0.02] rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-sm">
          {selectedReport ? (
            <>
              <div className="px-4 sm:px-8 py-5 border-b border-white/10 bg-white/[0.015] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white leading-tight tracking-tight truncate">{selectedReport.reason}</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs">
                        <span className="text-text-muted font-semibold flex items-center gap-1.5"><User className="w-3.5 h-3.5 opacity-50" /> {selectedReport.reporter?.firstName} {selectedReport.reporter?.lastName}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20"></div>
                        <span className="text-[9px] font-bold text-primary-light uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/25">
                            #{selectedReport._id.substring(selectedReport._id.length - 6)}
                        </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleDeleteReport(selectedReport._id)}
                        className="p-2.5 bg-rose-500/10 text-rose-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                        title="Raporu Sil"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 custom-scrollbar">

                {/* Status Update */}
                <div className="bg-white/[0.015] rounded-3xl border border-white/10 p-5 sm:p-6">
                    <h3 className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest mb-4">Operasyonel Durum</h3>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'pending', label: 'Beklemede', icon: Clock, color: 'hover:bg-amber-500 hover:border-amber-500' },
                            { id: 'reviewed', label: 'İncelendi', icon: Search, color: 'hover:bg-indigo-500 hover:border-indigo-500' },
                            { id: 'resolved', label: 'Çözüldü', icon: CheckCircle2, color: 'hover:bg-emerald-500 hover:border-emerald-500' },
                            { id: 'dismissed', label: 'Reddet', icon: XCircle, color: 'hover:bg-rose-500 hover:border-rose-500' }
                        ].map(st => (
                            <button
                                key={st.id}
                                disabled={updating}
                                onClick={() => handleUpdateStatus(selectedReport._id, st.id)}
                                className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                    selectedReport.status === st.id
                                    ? 'bg-white text-black border-white shadow-sm'
                                    : `bg-white/5 text-white/50 border-white/10 ${st.color} hover:text-white`
                                }`}
                            >
                                <st.icon className="w-4 h-4" /> {st.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest mb-2.5">Şikayet Detayı</h3>
                            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 text-sm text-white/90 leading-relaxed italic">
                                "{selectedReport.details}"
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest mb-2.5">Şikayet Edilen İçerik</h3>
                            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-5 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary-light border border-primary/20">
                                        {getTargetIcon(selectedReport.targetType)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white">{getTargetLabel(selectedReport.targetType)}</p>
                                        <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">ID: {selectedReport.targetId}</p>
                                    </div>
                                </div>
                                <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10">
                                    <ExternalLink className="w-3.5 h-3.5" /> İçeriğe Git
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/[0.015] rounded-3xl border border-white/10 p-6 flex flex-col justify-center items-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-white/30" />
                        </div>
                        <h4 className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest mb-1.5">Rapor Tarihi</h4>
                        <p className="text-xl font-bold text-primary-light">{new Date(selectedReport.createdAt).toLocaleDateString('tr-TR')}</p>
                        <p className="text-[10px] text-text-muted font-bold mt-1 uppercase">{new Date(selectedReport.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-transparent">
                <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-6">
                    <ShieldAlert className="w-8 h-8 text-white/20" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">Rapor Seçilmedi</h3>
                <p className="text-text-secondary text-sm max-w-sm mt-2.5 font-medium">
                    İnceleme başlatmak için sol taraftaki listeden bir rapor seçiniz.
                </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminReports;
