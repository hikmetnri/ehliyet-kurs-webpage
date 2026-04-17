import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const StatCard = ({ title, value, icon: Icon, colorClass, gradient, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card rounded-2xl p-6 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-20 transition-opacity`}></div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <h3 className="text-text-secondary font-medium mb-1">{title}</h3>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    avgSuccessRate: 0,
    pendingPostsCount: 0,
    activeSupportCount: 0
  });
  
  const [pendingPosts, setPendingPosts] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Axios requests paralelde çalıştırıyoruz
      const [overviewRes, postsRes, ticketsRes] = await Promise.all([
        api.get('/admin/stats/overview'),            // Genel istatistikler
        api.get('/posts/admin/pending'),       // Bekleyen Akış paylaşımları
        api.get('/contact')                    // Tüm destek talepleri
      ]);

      const overviewData = overviewRes.data;
      const postsData = postsRes.data.data || [];
      const ticketsData = ticketsRes.data.data || [];

      // Destek mesajlarından statüsü 'Yeni' veya 'read' (cevap bekleyen) olanların sayısını bul
      const activeTickets = ticketsData.filter(t => t.status === 'unread' || t.status === 'read' || t.status === 'Yeni');

      setStats({
        totalUsers: overviewData.totalUsers || 0,
        totalExams: overviewData.totalExams || 0,
        avgSuccessRate: overviewData.avgSuccessRate || 0,
        pendingPostsCount: postsData.length,
        activeSupportCount: activeTickets.length
      });

      setPendingPosts(postsData.slice(0, 5)); // Sadece ilk 5
      setSupportTickets(ticketsData.slice(0, 5)); // Sadece ilk 5

    } catch (err) {
      console.error('Veriler çekilirken hata oluştu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprovePost = async (id) => {
    try {
      await api.patch(`/posts/${id}/approve`);
      setPendingPosts(prev => prev.filter(p => p._id !== id));
      setStats(prev => ({...prev, pendingPostsCount: prev.pendingPostsCount - 1}));
    } catch (err) {
      alert("Gönderi onaylanamadı.");
    }
  };

  const handleRejectPost = async (id) => {
    try {
      await api.patch(`/posts/${id}/reject`);
      setPendingPosts(prev => prev.filter(p => p._id !== id));
      setStats(prev => ({...prev, pendingPostsCount: prev.pendingPostsCount - 1}));
    } catch (err) {
      alert("Gönderi reddedilemedi.");
    }
  };

  const statCards = [
    { title: 'Toplam Kullanıcı', value: stats.totalUsers.toLocaleString('tr-TR'), icon: Users, colorClass: 'bg-primary', gradient: 'from-primary to-primary-light', delay: 0.1 },
    { title: 'Çözülen Sınav', value: stats.totalExams.toLocaleString('tr-TR'), icon: FileText, colorClass: 'bg-accent', gradient: 'from-accent to-accent-light', delay: 0.2 },
    { title: 'Bekleyen Gönderi', value: stats.pendingPostsCount.toString(), icon: Clock, colorClass: 'bg-warning', gradient: 'from-warning to-yellow-300', delay: 0.3 },
    { title: 'Açık Destek Bilet.', value: stats.activeSupportCount.toString(), icon: CheckCircle, colorClass: 'bg-success', gradient: 'from-success to-emerald-400', delay: 0.4 },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Gösterge Paneli</h1>
        <p className="text-text-secondary">Sistemin genel durumunu ve bekleyen işleri buradan takip edin.</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Akış Moderasyonu Özeti */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Bekleyen Gönderiler</h2>
              <p className="text-sm text-text-secondary">Topluluk akışında onay bekleyen içerikler</p>
            </div>
            <button className="text-sm text-primary-light hover:text-white transition-colors font-medium">Tümünü Gör</button>
          </div>
          
          <div className="space-y-4">
            {pendingPosts.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">Bekleyen gönderi yok.</p>
            ) : (
              pendingPosts.map(post => (
                <div key={post._id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex justify-between items-center">
                  <div className="flex-1 mr-4 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/10 text-text-secondary">{post.category || 'Tartışma'}</span>
                      <span className="text-sm text-white font-medium truncate">{post.title || post.content?.substring(0,30)}</span>
                    </div>
                    <div className="text-xs text-text-muted flex items-center gap-2">
                      <span>{post.user?.firstName || 'İsimsiz'} {post.user?.lastName || ''}</span>
                      <span>•</span>
                      <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('tr-TR') : '-'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprovePost(post._id)}
                      className="p-2 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-colors border border-success/20"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleRejectPost(post._id)}
                      className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors text-xs font-bold border border-danger/20"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Son Destek Talepleri Özeti */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Güncel Destek Talepleri</h2>
              <p className="text-sm text-text-secondary">Kullanıcılardan gelen son mesajlar</p>
            </div>
            <button className="text-sm text-primary-light hover:text-white transition-colors font-medium">Tümünü Gör</button>
          </div>
          
          <div className="space-y-4">
            {supportTickets.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">Açık destek bileti yok.</p>
            ) : (
              supportTickets.map(ticket => (
                <div key={ticket._id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex justify-between items-center cursor-pointer">
                  <div className="flex-1 mr-4 overflow-hidden">
                    <h3 className="text-sm text-white font-medium mb-1 truncate">{ticket.subject || 'Konusuz'}</h3>
                    <div className="text-xs text-text-muted flex items-center gap-2">
                      <span>{ticket.userId?.firstName || 'Bilinmiyor'} {ticket.userId?.lastName || ''}</span>
                      <span>•</span>
                      <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('tr-TR') : '-'}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border whitespace-nowrap ${
                      ticket.status === 'unread' || ticket.status === 'read' || typeof ticket.status === 'undefined'
                      ? 'bg-warning/10 text-warning border-warning/20' 
                      : 'bg-primary/10 text-primary-light border-primary/20'
                    }`}>
                      {ticket.status === 'replied' ? 'Yanıtlandı' : ticket.status === 'closed' ? 'Kapatıldı' : 'Cevap Bekliyor'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;
