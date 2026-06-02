# 3. DİĞER ÖZELLİKLER VE TEKNİK DETAYLAR

## 3.1 Ekstra Özellikler

### Trafik İşaretleri Kütüphanesi
- [x][F] [x][R] Kategorize edilmiş trafik işaretleri listesi
- [x][F] [x][R] Görseller local assets'ten (React'te `signs/` klasöründen sunuluyor)

### Video Eğitimler
- [x][F] [x][R] Video ders listesi ve detay sayfası (Markdown içinde video desteği mevcut)
- [x][F] [x][R] Flutter video eğitimleri admin paneldeki video kategorilerine göre gruplanır; kullanıcı önce kategori kartlarını, sonra seçili kategori videolarını görür
- [x][F] [x][R] Flutter video detayında doğrudan dosya linkleri (`.mp4`, `.m3u8`, `.mov`, `.m4v`, `.webm`) uygulama içinde oynatılır; YouTube/Vimeo/Google Drive linkleri `webview_flutter` ile uygulama içi embed olarak oynatılır
- [x][F] [x][R] React web video detayında YouTube/Vimeo/Google Drive linkleri `iframe` embed olarak oynatılır; `getEmbedUrl` helper fonksiyonu URL parse işlemi yapar
- [x][F] [x][R] Video kategori kaydı yoksa mevcut/kategorisiz videolar eski davranışla listelenmeye devam eder
- [ ][F] [-][R] Canlı ders entegrasyonu (Kapsam Dışı)

### Pazarlama Araçları
- [x][F] [x][R] Marketing QR kodu oluşturma ve paylaşma
- [ ][F] [ ][R] QR tarama istatistikleri (Gelecek faz)
- [ ][F] [ ][R] Sürücü kursu başvuru/lead sistemi (Gelecek faz; uygulama kullanıcı trafiği artınca değerlendirilecek)

### Sistem Güvenliği ve Bakım
- [x][F] [x][R] Bakım Modu: Admin toggle → kullanıcılar erişemez, bakım mesajı görür
- [x][F] [x][R] Bakım modu API davranışı: `/api/status` public kalır, admin token'ı bakım modunda middleware'den geçer, kullanıcılar 503 + bakım mesajı alır
- [x][F] [-][R] Flutter bakım modu route gate'i: açılışta ve ana kullanıcı route'larında `/status` kontrolü yapılır; admin bakım modundayken panele erişmeye devam eder
- [x][F] [x][R] Veri Yedekleme: JSON export (admin panelinden)
- [x][F] [x][R] Açılışta versiyon kontrolü, güncelleme zorunlu kılınabilir

---

## 3.2 Akıllı Sistemler (Planlanan / Kısmi)

### Yapay Zeka Analizi
- [x][F] [x][R] Zayıf konulara özel sınav önerisi (Admin Dashboard stats bazlı öneri)
- [x][F] [x][R] Adaptif öğrenme: Yanlış yapılan sorulara göre tekrar algoritması
- [x][F] [x][R] Aralıklı tekrar listesi: `WrongAnswer.reviewStage`, `nextReviewAt`, review geçmişi, 4 doğru sonrası otomatik tamamlandı ve "Öğrendim" akışı
