# 1. ADMIN PANELİ

## 1.1 Navigasyon
- [x][F] [x][R] Sol sidebar navigasyon (web'de bottom nav yerine)
   - Ana Sayfa (Akış + Destek)
   - İçerik (Kategoriler + Sorular + Sözler)
   - Sınavlar
   - İstatistik
   - Profil / Yönetim Merkezi

---

## 1.2 Ana Sayfa (Dashboard)

### İstatistikler ve Grafikler
- [x][F] [x][R] 6 Temel özet kartı: Kullanıcı, Sınav, Başarı, Bekleyen Gönderi, Destek, Raporlar
- [x][F] [x][R] Dinamik Kayıt Trendi Grafiği (Son 7 Gün - Area Chart)
- [x][F] [x][R] Kategori Başarı Oranları (Bar Chart)

### Kısayollar ve Araçlar
- [x][F] [x][R] Hızlı İşlem Butonları (Sınav Ekle, Duyuru Gönder, Ayarlar)
- [x][F] [x][R] Hızlı Not Defteri (Admin içi lokal kayıtlı mini notlar)
- [x][F] [x][R] Sistem Aktiviteleri Zaman Çizelgesi (Loglar - Timeline)

### Hızlı Aksiyon Kutuları (Quick Actions)
- [x][F] [x][R] Bekleyen Gönderiler (Hızlı onay/reddet butonları)
- [x][F] [x][R] Destek Talepleri özeti (Okundu/Yeni/Yanıtlandı/Kapatıldı durumu)
- [x][F] [x][R] Destek mesajlaşmasında kullanıcıdan gelen yeni talep ve yanıtlar adminlere in-app + FCM push olarak gider
- [x][F] [x][R] Şikayetler/Raporlar özeti (Hızlı kapatma eylemi)
- [x][F] [x][R] Her panel için "Tümü" kısayol navigasyonu

---

## 1.3 İçerik Yönetimi

### Kategoriler
- [x][F] [x][R] Kategori listesi (Tree View yapısı)
- [x][F] [x][R] Sürükle-bırak sıralama (Framer Motion Reorder)
- [x][F] [x][R] Ana kategoriler (ehliyet türleri: A, B, C...)
- [x][F] [x][R] Alt kategori ekleme
- [x][F] [x][R] Her kategori: isim, renk seçici, ikon seçici, Pro toggle
- [x][F] [x][R] Markdown içerik editörü (H1/H2/H3 toolbar, kalın/italik, liste, ayraç, kelime sayacı)
- [x][F] [x][R] İçerikte görsel/video URL desteği
- [x][F] [x][R] Kaydedilmemiş değişiklik uyarısı
- [-][F] [x][R] Taslak / yayın / sürüm geçmişi akışı: React admin içerik editöründe taslak kaydet, yayınla ve eski yayınlanmış sürümü yükle; Flutter admin için kapsam dışı bırakıldı, içerik yayın akışı web adminden yönetilecek; backend public kategori endpointleri taslak kayıtları göstermez
- [x][F] [x][R] Düzenle / Sil

### Sorular — Kısa Testler
- [x][F] [x][R] 3 seviyeli accordion: Ana kategori → Alt kategori → Konu
- [x][F] [x][R] Her konunun altında soru listesi
- [x][F] [x][R] Soru arama (metin bazlı)
- [x][F] [x][R] Her soru: metin, şıklar (A/B/C/D), doğru cevap, açıklama, görsel URL
- [x][F] [x][R] "Bu Kategoriye Soru Ekle" butonu
- [x][F] [x][R] Ekle / Düzenle / Sil

### Sorular — Sınav Soruları
- [x][F] [x][R] Sınav bazlı accordion (her sınav bir grup)
- [x][F] [x][R] Sınav başlığında: kategori adı, soru sayısı, süre, düzenle/sil
- [x][F] [x][R] Her sınavın altında soru listesi + "Bu Sınava Soru Ekle"
- [x][F] [x][R] Sınav oluştur: başlık, açıklama, süre (dk), kategori, Pro toggle
- [x][F] [x][R] CSV import ile toplu soru ekleme
- [x][F] [x][R] Sınav atanmamış sorular ayrı grupta
- [x][F] [x][R] Deneme ve gerçek sınav soruları ayrı `testType` ile tutulur: `mock_exam`, `real_exam` (`exam` legacy fallback)
- [x][F] [x][R] Sınav sorularında konu ayrımı zorunlu veri alanı olarak kullanılır: `trafik`, `ilkyardim`, `motor`, `adabi`

### Sözler (Motivasyon)
- [x][F] [x][R] Söz listesi: yazar + söz metni
- [x][F] [x][R] Aktif / Pasif toggle
- [x][F] [ ][R] Söz metni ekleme/düzenleme alanı 350 karakterle sınırlandı; liste ve dashboard eski uzun kayıtları da 350 karaktere kırparak gösterir
- [x][F] [x][R] Ekle / Düzenle / Sil

### Videolar
- [x][F] [ ][R] İçerik yönetimine "Videolar" sekmesi eklendi; Kategoriler, Sorular ve Sözler sekmeleriyle aynı içerik modülünde yer alır
- [x][F] [ ][R] Video kategorisi oluşturma/düzenleme/silme: kategori adı, açıklama ve PRO toggle desteklenir
- [x][F] [ ][R] Video ekleme/düzenleme/silme: başlık, açıklama, kategori seçimi, online video bağlantısı/URL, notlar ve PRO toggle desteklenir
- [x][F] [ ][R] Video listesi kategoriye göre gruplanır; kategori oluşturulmadıysa/kategori seçilmediyse videolar "Kategorisiz" altında gösterilir
- [x][F] [ ][R] Doğrudan oynatılabilir video linkleri uygulama içinde açılır; YouTube/Vimeo gibi harici bağlantılar dış uygulama/tarayıcı ile açılır

---

## 1.4 Sınav Yönetimi
- [x][F] [x][R] Sınav listesi
- [x][F] [x][R] Deneme sınavları ve gerçek sınavlar admin arayüzünde ayrı yönetilir; `mock_exam` ve `real_exam` `testType` değerleri korunur
- [x][F] [-][R] Flutter admin sınav ekranı modern yönetim görünümüne çekildi: kompakt arama/filtre, özet kartları, inline soru yönetimi, düzenle/sil aksiyonları
- [x][F] [x][R] Yeni sınav oluştur: isim, süre, kategori, Pro toggle
- [x][F] [x][R] Sınava soru ekle/çıkar
- [x][F] [x][R] Sınav sonuçlarını görüntüle
- [x][F] [x][R] Yeni sınav oluşturulunca tüm kullanıcılara uygulama içi bildirim + FCM push gönderilir
- [x][F] [x][R] Sınav bildirimi gönderiminde geçersiz FCM token'lar otomatik temizlenir
- [x][F] [x][R] Bildirim gönder (Duyuru modülü üzerinden)

---

## 1.5 İstatistik

### Platform Sekmesi
- [x][F] [x][R] Toplam kullanıcı sayısı
- [x][F] [x][R] Aktif kullanıcı (bugün giriş yapan)
- [x][F] [x][R] Toplam soru çözümü
- [x][F] [x][R] Genel başarı oranı (%)
- [x][F] [x][R] Premium (Pro) üye sayısı
- [x][F] [x][R] Yeni kayıtlar (bu hafta)
- [x][F] [x][R] Günlük hedef dağılımı grafiği
- [x][F] [x][R] Bildirim saat analizi grafiği
- [x][F] [x][R] Bildirim açık/kapalı kullanıcı sayısı
- [-][F] [x][R] Sabit QR tıklanma istatistikleri: toplam, son tıklama ve günlük grafik
- [x][F] [x][R] Dönüşüm hunisi: kayıt, kategori seçimi, ilk test, yanlış havuzu, yanlış tekrar, PRO
- [x][F] [x][R] Kullanıcı yolculuğu trendi: günlük kayıt, ilk test ve yanlış tekrar hareketi
- [x][F] [x][R] Aksiyon segmentleri: kategori seçmeyen, kategori seçip test çözmeyen, yanlışı olup tekrar çözmeyen, aktif Free PRO adayları
- [x][F] [x][R] Son kayıtların yolculuk listesi: kategori, test sayısı, due yanlış, tekrar sayısı ve durum etiketi
- [x][F] [x][R] Tarih ve kaynak filtresi: 7/30/90 gün ve acquisition source kırılımı
- [x][F] [x][R] Kampanya altyapısı: `utm_source` filtreye, `utm_campaign/medium/content` event metadata'sına yazılır
- [x][F] [x][R] Event bazlı huni: kayıt, kategori, ilk test, yanlış tekrar, paywall, PRO tıklama ve satın alma
- [x][F] [x][R] Kaynak performansı: kaynağa göre kayıt, ilk test, PRO ve aktivasyon oranı
- [x][F] [x][R] Kohort aktivasyonu: kayıt gününe göre ilk test ve yanlış tekrar geçişi
- [x][F] [x][R] Bildirim ve paywall etkisi: kampanya, in-app/push, açılma, paywall görme/tıklama/satın alma
- [x][F] [x][R] Riskli kullanıcılar ve kullanıcı timeline modalı
- [x][F] [x][R] İstatistik sayfası sekmeli yapıya ayrıldı: Genel, Yolculuk, Etkileşim, Konu, Zorluk, Rozetler
- [x][F] [x][R] Kullanıcı timeline modalı eski event kaydı olmayan kullanıcılar için kayıt/test/yanlış tekrar geçmişini backend verisinden "Geçmiş veri" olarak gösterir
- [x][F] [x][R] Timeline detayları JSON yerine okunur metin ve etiketlerle gösterilir: kategori, test, puan, doğru/yanlış, süre, durum, tekrar sonucu
- [x][F] [-][R] Flutter istatistik sayfası modern bölüm rayına taşındı: Genel, Yolculuk, Etkileşim, Konu, Zorluk, Rozetler kartları
- [x][F] [-][R] Flutter Genel istatistik sekmesinde karar/komuta özeti eklendi: aktiflik, PRO oranı, bildirim, yeni üye sinyalleri

### Konu Sekmesi
- [x][F] [x][R] Kategori bazlı başarı oranları

### Zorluk Sekmesi
- [x][F] [x][R] En çok yanlış yapılan sorular

### Rozetler Sekmesi
- [x][F] [x][R] Rozet listesi
- [x][F] [x][R] Ekle / Düzenle / Sil / Dinamik İkon Seçici (Award, Trophy vb.)
- [x][F] [x][R] Rozet kazanım kriterleri admin panelinden yönetilir: `exam_count`, `question_count`, `correct_count`, `streak`, `daily_goal`, `success_rate`
- [x][F] [x][R] Rozet kartlarında hedef değeri ve rozeti kazanan kullanıcı sayısı (`earnedCount`) gösterilir
- [x][F] [x][R] "Kimlerin Aldığını Gör" aksiyonu ile rozeti kazanan kullanıcılar modalda ad, e-posta ve kazanım tarihiyle listelenir

---

## 1.6 Profil / Yönetim Merkezi

### Profil Bilgileri
- [x][F] [x][R] Avatar yükleme (Edit Profile)
- [x][F] [x][R] Ad, soyad, e-posta, telefon
- [x][F] [x][R] Şifre değiştirme
- [x][F] [x][R] Profil düzenleme

### Kullanıcı Yönetimi
- [x][F] [x][R] Özet kartlar: Toplam, Admin, Pro sayısı, askıdaki kullanıcı sayısı
- [x][F] [x][R] Kullanıcı listesi (sayfalama: 50/sayfa)
- [x][F] [x][R] Arama: ad, soyad, e-posta
- [x][F] [x][R] Filtre: Tümü / Kullanıcı / Admin / Pro / Aktif / Askıda / Online
- [x][F] [x][R] Sıralama: en yeni, son aktif, alfabetik, puan, seviye, PRO, admin, askıda, online
- [x][F] [x][R] Kullanıcı kartı: avatar, isim, e-posta, level, puan, son aktif, online badge
- [x][F] [x][R] Detay modal: bilgiler, istatistikler, rol değiştir, Pro ver/kaldır, askıya al/aktif et, sil
- [x][F] [x][R] Kullanıcı özellerine bildirim gönderme (Tekli ve Çoklu Seçim)

### Rapor Yönetimi
- [x][F] [x][R] Şikayet edilen içerikler listesi
- [x][F] [x][R] Her rapor: şikayet eden, içerik, sebep, tarih
- [x][F] [x][R] İçeriği görüntüle / sil, raporu kapat
- [x][F] [x][R] Filtre: açık / çözüldü / reddedildi
- [x][F] [-][R] Flutter rapor ekranı özet strip + segment filtre + taşma güvenli pill yapısına taşındı

### Bildirim Yönetimi (Broadcast)
- [x][F] [x][R] Hedef kitle: Herkes / Pro Üyeler / Ücretsiz / Seçili Kişiler
- [x][F] [x][R] Form: başlık + mesaj + görsel URL
- [x][F] [-][R] Flutter duyuru oluşturma formunda gönderim aksiyonu tam genişlik butona taşındı; küçük ekran taşmaları azaltıldı
- [x][F] [x][R] Duyuru geçmişi: başlık, hedef, kaç kişi, tarih, sil
- [x][F] [x][R] Broadcast gönderimi hem uygulama içi bildirim oluşturur hem FCM push yollar
- [x][F] [x][R] Gönderim sonucu: toplam kullanıcı, token sayısı, başarılı push sayısı ve push uyarısı admin panelinde gösterilir
- [x][F] [x][R] Bildirim tipleri: `broadcast`, `targeted`, `system`, `exam`, `alert`, `chat_message`
- [x][F] [x][R] FCM token debug endpoint'i ile token istatistikleri kontrol edilebilir
- [x][F] [x][R] Gizlilik politikası ve KVKK metinleri Markdown/GFM olarak kaydedilip public sayfada Markdown renderer ile gösterilir

### Abonelik Yönetimi
- [x][F] [x][R] Abonelik satış durumu admin pazarlama ekranından açılıp kapatılabilir; mobil uygulamadaki PRO satış ekranı ve plan görünürlüğünü etkiler
- [x][F] [x][R] Satın alma doğrulaması aktif/pasif durumu admin ekranında bilgilendirme olarak gösterilir
- [x][F] [-][R] Planlar: Haftalık / Aylık / Yıllık (Kapsam Dışı)
- [x][F] [-][R] Aktif abonelikler (Kapsam Dışı)
- [x][F] [-][R] Kupon yönetimi (Kapsam Dışı)
- ⚠️ Plan/kupon/aktif abonelik yönetimi şu an kapsam dışıdır; satış ekranı aç/kapat kontrolü aktiftir.

### Reklam ve Pazarlama Yönetimi
- [x][F] [x][R] Google AdMob Reklam Yönetimi (Banner / Interstitial / Rewarded)
- [x][F] [x][R] Reklamlar Aktif/Pasif toggle, reklam birim ID yönetimi
- [x][F] [x][R] QR Kod Oluşturucu: sabit takip URL'si ile Play Store yönlendirme, indirme ve tarama sayımı
- [-][F] [x][R] Pazarlama ekranı AdMob bilgilerini veritabanındaki `ad_config` kaydından okur ve günceller

### Sistem Araçları
- [x][F] [x][R] İşlem günlükleri (Admin Dashboard özetleri)
- [x][F] [x][R] İşlem günlükleri ikinci sekmesi gerçek crash log değil, `ExamResult.score < 50` kayıtlarından oluşan "Düşük Skorlar" listesidir
- [x][F] [x][R] Bakım modu toggle
- [x][F] [x][R] Bakım modu durumu hem `isMaintenance` hem `enabled` alanlarıyla okunur; admin bakım modunda panele erişmeye devam eder
- [x][F] [x][R] Veri yedekleme (JSON export)
