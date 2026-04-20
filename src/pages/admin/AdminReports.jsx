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
      case 'pending': return { label: 'BEKLEMEDE', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' };
      case 'reviewed': return { label: 'İNCELENDİ', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', dot: 'bg-indigo-400' };
      case 'resolved': return { label: 'ÇÖZÜLDÜ', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' };
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
    <div className="flex flex-col h-[calc(100vh-120px)] gap-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Rapor & Şikayet Merkezi</h1>
          <p className="text-text-secondary text-sm mt-1">Soru hataları veya topluluk kurallarını ihlal eden içerikleri denetleyin.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-6 min-h-0">
        
        {/* Left Side: Report List */}
        <div className="md:w-96 w-full flex flex-col gap-4 shrink-0">
          
          <div className="glass-card p-2 rounded-[24px] border border-white/5 flex flex-col gap-2">
            <div className="flex items-center bg-black/40 rounded-[18px] px-4 py-3 w-full border border-white/5 transition-all focus-within:border-primary/50">
              <Search className="w-5 h-5 text-primary-light mr-3" />
              <input 
                type="text" 
                placeholder="Rapor / Kullanıcı Ara..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-text-muted font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-1 p-1 bg-black/40 rounded-[20px] border border-white/5">
              {[
                { id: 'all', label: 'Tümü' }, 
                { id: 'pending', label: 'Açık' }, 
                { id: 'resolved', label: 'Çözülü' }
              ].map(f => (
                <button 
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`flex-1 px-3 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-widest transition-all ${
                    statusFilter === f.id 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-text-muted hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-bg-card border border-white/5 rounded-[24px]">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <span className="text-[10px] font-black text-primary-light uppercase tracking-widest animate-pulse">Sistem Taranıyor...</span>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-bg-card border border-white/5 rounded-[24px]">
                     <Inbox className="w-16 h-16 text-white/5 mb-4" />
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
                            className={`w-full text-left p-5 rounded-[24px] border transition-all duration-300 relative group ${
                                isSelected 
                                ? 'bg-primary/[0.03] border-primary/30 shadow-2xl' 
                                : 'bg-bg-card border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusInfo.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span> {statusInfo.label}
                                </span>
                                <span className="text-[10px] text-text-muted font-bold flex items-center gap-1 opacity-70">
                                    <Clock className="w-3 h-3" /> {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                            
                            <h3 className="font-black text-[15px] line-clamp-1 mb-2 text-white">
                                {report.reason}
                            </h3>
                            
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-black text-primary-light bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1.5 uppercase">
                                    {getTargetIcon(report.targetType)} {getTargetLabel(report.targetType)}
                                </span>
                            </div>
                            
                            <div className="text-xs text-text-muted line-clamp-2 italic bg-black/30 px-3 py-2.5 rounded-xl border border-white/5">
                                "{report.details}"
                            </div>
                        </motion.button>
                    );
                })
            )}
          </div>
        </div>

        {/* Right Side: Detail Area */}
        <div className="flex-1 glass-card rounded-[32px] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
          {selectedReport ? (
            <>
              <div className="px-8 py-5 border-b border-white/5 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[20px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-rose-500/20 blur-xl opacity-50"></div>
                    <AlertTriangle className="w-6 h-6 text-rose-400 relative z-10" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white leading-none tracking-tight">{selectedReport.reason}</h2>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-text-muted font-semibold flex items-center gap-1.5"><User className="w-3.5 h-3.5 opacity-50" /> {selectedReport.reporter?.firstName} {selectedReport.reporter?.lastName}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20"></div>
                        <span className="text-[10px] font-black text-primary-light/70 uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                            #{selectedReport._id.substring(selectedReport._id.length - 6)}
                        </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleDeleteReport(selectedReport._id)}
                        className="p-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                        title="Raporu Sil"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar">
                
                {/* Status Update */}
                <div className="bg-black/30 rounded-[32px] border border-white/5 p-8">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">Operasyonel Durum</h3>
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
                                className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                                    selectedReport.status === st.id 
                                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                    : `bg-white/5 text-white/50 border-white/10 ${st.color} hover:text-white`
                                }`}
                            >
                                <st.icon className="w-4 h-4" /> {st.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Şikayet Detayı</h3>
                            <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 text-sm text-white/90 leading-relaxed italic">
                                "{selectedReport.details}"
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Şikayet Edilen İçerik</h3>
                            <div className="bg-primary/5 border border-primary/20 rounded-[28px] p-6 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary-light">
                                        {getTargetIcon(selectedReport.targetType)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white">{getTargetLabel(selectedReport.targetType)}</p>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">ID: {selectedReport.targetId}</p>
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5">
                                    <ExternalLink className="w-3.5 h-3.5" /> İçeriğe Git
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-bg-card to-black rounded-[32px] border border-white/5 p-8 flex flex-col justify-center items-center text-center">
                        <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/5 flex items-center justify-center mb-6">
                            <Clock className="w-10 h-10 text-white/20" />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Rapor Tarihi</h4>
                        <p className="text-2xl font-black text-primary-light">{new Date(selectedReport.createdAt).toLocaleDateString('tr-TR')}</p>
                        <p className="text-xs text-text-muted font-bold mt-1 uppercase">{new Date(selectedReport.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-32 h-32 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
                    <ShieldAlert className="w-12 h-12 text-white/10 relative z-10" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Rapor Seçilmedi</h3>
                <p className="text-text-secondary text-sm max-w-sm mt-3 font-medium">
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
