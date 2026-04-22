import React, { useState, useEffect } from 'react';
import api from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Search, Share2, User, Filter, 
  CheckCircle2, XCircle, Trash2, MessageSquare,
  ThumbsUp, Calendar, AlertCircle, Clock,
  MoreVertical, ShieldCheck, ShieldAlert, Tag,
  ExternalLink, Eye, Check, X
} from 'lucide-react';

const AdminFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' ? '/posts/admin/all' : `/posts/admin/all?status=${statusFilter}`;
      const res = await api.get(url);
      setPosts(res.data);
    } catch (err) {
      console.error('Gönderiler alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      setProcessingId(postId);
      await api.patch(`/posts/${postId}/approve`);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, status: 'approved' } : p));
    } catch (err) {
      alert("Gönderi onaylanamadı.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (postId) => {
    const note = window.prompt("Reddetme sebebi (isteğe bağlı):");
    if (note === null) return;

    try {
      setProcessingId(postId);
      await api.patch(`/posts/${postId}/reject`, { adminNote: note });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, status: 'rejected', adminNote: note } : p));
    } catch (err) {
      alert("Gönderi reddedilemedi.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Bu gönderiyi kalıcı olarak silmek istediğinize emin misiniz?")) return;

    try {
      setProcessingId(postId);
      await api.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      alert("Gönderi silinemedi.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredPosts = posts.filter(p => 
    (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.userName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return { label: 'BEKLEMEDE', icon: Clock, color: 'text-warning bg-warning/10 border-warning/20' };
      case 'approved': return { label: 'ONAYLANDI', icon: ShieldCheck, color: 'text-success bg-success/10 border-success/20' };
      case 'rejected': return { label: 'REDDEDİLDİ', icon: ShieldAlert, color: 'text-danger bg-danger/10 border-danger/20' };
      default: return { label: status, icon: AlertCircle, color: 'text-text-muted bg-white/5 border-white/10' };
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
        case 'discussion': return '💬 Tartışma';
        case 'question': return '❓ Soru';
        case 'exam_share': return '🏆 Sınav Paylaşımı';
        case 'tip': return '💡 İpucu';
        default: return '📄 Gönderi';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Akış Kontrol Merkezi</h1>
          <p className="text-text-secondary text-sm mt-1">Paylaşılan tüm gönderileri denetleyin, onaylayın veya topluluk kurallarına göre silin.</p>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-bg-card border border-white/5 p-4 rounded-2xl flex items-center justify-between">
              <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Bekleyenler</p>
                  <p className="text-xl font-black text-warning">{posts.filter(p => p.status === 'pending').length}</p>
              </div>
              <Clock className="w-6 h-6 text-warning/50" />
          </div>
          <div className="bg-bg-card border border-white/5 p-3 rounded-2xl md:col-span-3 flex items-center gap-4">
             <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full focus-within:border-primary/50 transition-colors">
                <Search className="w-4 h-4 text-text-muted mr-3" />
                <input 
                    type="text" 
                    placeholder="Gönderi içeriği veya kullanıcı ara..." 
                    className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-text-muted"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex bg-black/20 p-1 rounded-xl">
                 {['all', 'pending', 'approved', 'rejected'].map(f => (
                     <button 
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                            statusFilter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'
                        }`}
                     >
                         {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyen' : f === 'approved' ? 'Onaylı' : 'Red'}
                     </button>
                 ))}
             </div>
          </div>
      </div>

      {/* Posts Table / List */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden shadow-2xl bg-bg-card/50">
          <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm text-text-secondary border-collapse min-w-[900px]">
              <thead className="bg-black/20 text-white/40 font-black uppercase text-[10px] tracking-widest border-b border-white/5">
                  <tr>
                      <th className="px-6 py-4">Kullanıcı & Tarih</th>
                      <th className="px-6 py-4">Gönderi İçeriği</th>
                      <th className="px-6 py-4">Kategori & Tip</th>
                      <th className="px-6 py-4">Durum</th>
                      <th className="px-6 py-4 text-right">İşlemler</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                  {loading ? (
                      <tr>
                          <td colSpan="5" className="px-6 py-20 text-center">
                              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Veriler Derleniyor...</span>
                          </td>
                      </tr>
                  ) : filteredPosts.length === 0 ? (
                      <tr>
                          <td colSpan="5" className="px-6 py-20 text-center text-text-muted italic">Kriterlere uygun gönderi bulunamadı.</td>
                      </tr>
                  ) : (
                      filteredPosts.map(post => {
                          const status = getStatusBadge(post.status);
                          return (
                              <tr key={post._id} className="hover:bg-white/[0.02] transition-colors group">
                                  {/* User & Date */}
                                  <td className="px-6 py-6">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                              <User className="w-5 h-5 text-text-muted" />
                                          </div>
                                          <div>
                                              <p className="font-bold text-white text-xs">{post.userName}</p>
                                              <div className="flex items-center gap-1 text-[10px] text-text-muted mt-1 font-medium">
                                                  <Calendar className="w-3 h-3" />
                                                  {new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                              </div>
                                          </div>
                                      </div>
                                  </td>

                                  {/* Content */}
                                  <td className="px-6 py-6 max-w-md">
                                      <div>
                                          <h4 className="font-black text-sm text-white/90 tracking-tight leading-tight mb-1">{post.title}</h4>
                                          <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed italic border-l-2 border-white/10 pl-3">
                                              {post.content}
                                          </p>
                                          {post.adminNote && (
                                              <div className="mt-2 text-[10px] text-danger font-bold flex items-center gap-1.5 bg-danger/5 p-1.5 rounded-lg border border-danger/10">
                                                  <ShieldAlert className="w-3 h-3" /> Red Nedeni: {post.adminNote}
                                              </div>
                                          )}
                                      </div>
                                  </td>

                                  {/* Type & Engagement */}
                                  <td className="px-6 py-6">
                                      <div className="space-y-2">
                                          <span className="text-[10px] font-black uppercase text-text-muted tracking-wider block">
                                              {getTypeBadge(post.type)}
                                          </span>
                                          <div className="flex items-center gap-3">
                                              <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                                                <ThumbsUp className="w-3 h-3" /> {post.likes?.length || 0}
                                              </div>
                                              <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                                                <MessageSquare className="w-3 h-3" /> {post.comments?.length || 0}
                                              </div>
                                          </div>
                                      </div>
                                  </td>

                                  {/* Status */}
                                  <td className="px-6 py-6">
                                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                          <status.icon className="w-3.5 h-3.5" />
                                          {status.label}
                                      </div>
                                  </td>

                                  {/* Actions */}
                                  <td className="px-6 py-6 text-right">
                                      {processingId === post._id ? (
                                          <Loader2 className="w-5 h-5 animate-spin text-primary ml-auto" />
                                      ) : (
                                          <div className="flex items-center justify-end gap-2">
                                              {post.status !== 'approved' && (
                                                  <button 
                                                      onClick={() => handleApprove(post._id)}
                                                      className="p-2.5 bg-success/10 text-success border border-success/30 rounded-xl hover:bg-success hover:text-white transition-all shadow-lg shadow-success/5"
                                                      title="Onayla"
                                                  >
                                                      <Check className="w-4 h-4" />
                                                  </button>
                                              )}
                                              {post.status !== 'rejected' && (
                                                  <button 
                                                      onClick={() => handleReject(post._id)}
                                                      className="p-2.5 bg-warning/10 text-warning border border-warning/30 rounded-xl hover:bg-warning hover:text-white transition-all shadow-lg shadow-warning/5"
                                                      title="Reddet"
                                                  >
                                                      <ShieldAlert className="w-4 h-4" />
                                                  </button>
                                              )}
                                              <button 
                                                  onClick={() => handleDelete(post._id)}
                                                  className="p-2.5 bg-danger/10 text-danger border border-danger/30 rounded-xl hover:bg-danger hover:text-white transition-all shadow-lg shadow-danger/5"
                                                  title="Sil"
                                              >
                                                  <Trash2 className="w-4 h-4" />
                                              </button>
                                          </div>
                                      )}
                                  </td>
                              </tr>
                          );
                      })
                  )}
              </tbody>
          </table>
          </div>
      </div>

    </div>
  );
};

export default AdminFeed;
