import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary p-6 md:p-12 selection:bg-primary/30">
      <div className="max-w-4xl mx-auto glass-card rounded-[3rem] p-8 md:p-16 border border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-10 font-bold uppercase tracking-widest text-xs"
        >
          <ChevronLeft className="w-4 h-4" /> Geri Dön
        </button>

        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight text-white">Gizlilik Politikası <span className="text-primary-light">ve KVKK Aydınlatma Metni</span></h1>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:text-white prose-p:text-text-secondary prose-a:text-primary-light hover:prose-a:text-white prose-li:text-text-secondary">
          
          <p>Son Güncelleme: 10 Nisan 2026</p>

          <p>Ehliyet Yolu olarak gizliliğinize ve kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu "Gizlilik Politikası", kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklamaktadır.</p>

          <h2>1. Toplanan Bilgiler</h2>
          <p>Hizmetlerimizi kullanırken aşağıdaki bilgileri toplayabiliriz:</p>
          <ul>
            <li><strong>Kayıt Bilgileri:</strong> Ad, soyad, e-posta adresi, cihaz bilgileri.</li>
            <li><strong>Kullanım Verileri:</strong> Çözdüğünüz sınavlar, uygulama içindeki ilerlemeniz, istatistikleriniz (başarı oranı vb.).</li>
            <li><strong>İletişim Bilgileri:</strong> Destek taleplerinde sağladığınız mesaj içerikleri.</li>
          </ul>

          <h2>2. Bilgilerin Kullanımı</h2>
          <p>Topladığımız kişisel verileri aşağıdaki amaçlarla kullanmaktayız:</p>
          <ul>
            <li>Hizmetlerimizi sunmak, sürdürmek ve iyileştirmek.</li>
            <li>Hesabınızı oluşturmak ve yönetmek.</li>
            <li>Size özel içerik (örn. zayıf konular belirlenmesi) sunmak.</li>
            <li>Yükümlülüklerimizi (örn. hukuki uyuşmazlıklar) yerine getirmek.</li>
          </ul>

          <h2>3. Bilgi Paylaşımı</h2>
          <p>Kişisel verileriniz, izniniz olmadan üçüncü taraflarla reklam amacıyla paylaşılmaz. Sadece aşağıdaki durumlarda paylaşılabilir:</p>
          <ul>
            <li>Sunucu barındırma hizmeti sunan altyapı sağlayıcıları (örn. Google Cloud, AWS) ile operasyonel nedenlerle gizlilik sözleşmeleri çatısı altında.</li>
            <li>Yasalar çerçevesinde yetkili kamu kurum ve kuruluşları talep ettiğinde.</li>
          </ul>

          <h2>4. Veri Güvenliği</h2>
          <p>Verilerinizi yetkisiz erişime, değiştirilmeye veya imha edilmeye karşı korumak için endüstri standardı güvenlik önlemleri alıyoruz. Tüm veri transferleri HTTPS ile şifrelenmektedir.</p>

          <h2>5. Çerezler (Cookies) ve Cihaz İzinleri</h2>
          <p>Kullanıcı giriş oturumunu sürdürmek ve güvenlik amacıyla gerekli çerezleri/yerel depolama özelliklerini (Local Storage) kullanıyoruz. Android Mobil Uygulamamız, bildirim gönderebilmek adına (isteğe bağlı) Bildirim izinleri isteyebilir.</p>

          <h2 id="hesap-silme">6. Hesap Silme ve Veri İmhası (Account Deletion)</h2>
          <p>Kullanıcılarımız diledikleri zaman hesaplarını ve buna bağlı tüm verilerini silme hakkına sahiptir. Verilerinizi silmek için iki yöntem bulunmaktadır:</p>
          <ul>
            <li><strong>Uygulama İçinden:</strong> Profil sayfanızda bulunan "Hesabımı Sil" butonu ile hesabınızı anında kapatabilir ve verilerinizin kalıcı olarak silinmesini sağlayabilirsiniz.</li>
            <li><strong>Web/E-posta ile Talep:</strong> Uygulamayı cihazınızdan sildiyseniz veya erişemiyorsanız, <strong>destek@ehliyetyolu.com</strong> adresine kayıtlı e-posta adresinizden "Hesap Silme Talebi" konulu bir mesaj atarak verilerinizin 7 iş günü içerisinde tamamen silinmesini talep edebilirsiniz.</li>
          </ul>

          <h2>7. Haklarınız ve İletişim (KVKK 11. Madde)</h2>
          <p>Kişisel verilerinizle ilgili olarak; verilerinizin işlenip işlenmediğini öğrenme, yanlış ise düzeltilmesini isteme hakkınız bulunmaktadır. Tüm talepleriniz için destek ekibi ile iletişime geçebilirsiniz.</p>

          <p>İletişim: <strong>destek@ehliyetyolu.com</strong></p>

          <hr className="border-white/10 my-10" />
          <p className="text-sm">Bu belge, Google Play ve App Store geliştirici politikaları gereği oluşturulmuş ve yayımlanmıştır.</p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
