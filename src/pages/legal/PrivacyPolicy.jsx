import React from 'react';
import { ShieldAlert } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="animate-fade-in" style={{ padding: '60px 5%', maxWidth: 800, margin: '0 auto', color: 'var(--text-main)', lineHeight: 1.6 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <ShieldAlert size={48} color="var(--primary)" style={{ marginBottom: 16 }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: 8 }}>Gizlilik Politikası</h1>
        <p className="text-muted">Son Güncelleme: Mart 2026</p>
      </div>

      <div className="glass-panel" style={{ padding: '40px', borderRadius: 16 }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16, color: 'var(--primary)' }}>1. Veri Toplama ve Kullanım</h2>
        <p style={{ marginBottom: 24, color: 'var(--text-muted)' }}>
          Uygulamamız (MachAcademy / Ehliyet Yolu) kullanıcı deneyimini sağlamak için temel hesap bilgilerini (E-posta, İsim) kaydeder.
          Sınav istatistikleriniz ve soru çözme verileriniz, başarı durumunuzu analiz etmek amacıyla toplanmaktadır.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginBottom: 16, color: 'var(--primary)' }}>2. Üçüncü Taraf Hizmetler</h2>
        <p style={{ marginBottom: 24, color: 'var(--text-muted)' }}>
          Hizmetimizi sunabilmek adına Firebase Cloud Messaging (bildirimler için) gibi Google hizmetlerini kullanmaktayız. 
          Bu hizmetler aracılığıyla toplanan veriler şifrelenmektedir. Bilgileriniz reklam ajanslarına veya 3. parti diğer kurumlara satılmaz.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginBottom: 16, color: 'var(--primary)' }}>3. Hesap Silme</h2>
        <p style={{ marginBottom: 24, color: 'var(--text-muted)' }}>
          İstediğiniz zaman hesap ayarları bölümünden verilerinizin tamamen silinmesini (Right to be Forgotten) talep edebilirsiniz.
          Bu işlem, tüm kişisel bilgilerinizi veritabanlarımızdan geri döndürülemez şekilde yok eder.
        </p>

        <h2 style={{ fontSize: '1.5rem', marginBottom: 16, color: 'var(--primary)' }}>4. İletişim</h2>
        <p style={{ marginBottom: 24, color: 'var(--text-muted)' }}>
          Gizlilik ile ilgili tüm soru ve önerileriniz için aşağıdaki e-posta adresinden bize ulaşabilirsiniz:
          <br /><br />
          <strong>Destek:</strong> admin@machacademy.com
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
