# React Web UI Modernization Tasks

Bu dosya, web arayüzünü sayfa sayfa modernleştirmek için kalıcı görev listesidir. Konuşma sıkışırsa veya token biterse buradan devam et.

## Devam Kuralı

1. Önce `git status --short` ile mevcut değişiklikleri kontrol et.
2. Bu dosyada `NEXT` satırını bul.
3. Sadece sıradaki sayfa veya küçük sayfa grubuna dokun.
4. Her adım sonunda `npm run build` çalıştır.
5. Büyük tasarım değişikliklerinde dev server veya Browser Use ile desktop web görünümünü kontrol et.
6. İş bitince bu dosyada ilgili görevi `DONE` yap ve `NEXT` satırını güncelle.

## Tasarım İlkeleri

- Sadece UI/UX iyileştir, API sözleşmelerini ve iş mantığını gereksiz yere değiştirme.
- Şimdilik mobil görünüme dokunma. Flutter'a benzetilmiş React mobil görünüm korunacak.
- UI modernizasyonu React web desktop tarafıyla sınırlı yapılacak.
- Web desktop görünümü daha profesyonel, taranabilir ve az tekrar eden CTA yapısında olmalı.
- Aynı iş için tek ana buton kullan. Özellikle kategori seçimi, sınav başlatma, ayar değiştirme gibi CTA'ları çoğaltma.
- Mobil sınıfları, `lg:hidden` blokları ve mobil dashboard akışı sadece açık bir regresyon varsa düzeltilecek.
- Admin tarafı SaaS panel gibi sakin ve yoğun bilgi taşıyacak; gereksiz hero, dekoratif kalabalık ve fazla gradient azaltılacak.
- Ortak bileşenleri iyileştirirken tüm sayfalara etkisini kontrol et.
- Her sayfa için loading, empty, error ve başarı durumları tasarlanmış olmalı.

## Halihazırda Yapılanlar

- DONE: Web kullanıcı dashboard mobil görünümü Flutter tarzına yaklaştırıldı.
- DONE: Web kategori onboarding zorunlu hale getirildi. Kategorisi olmayan kullanıcı modalı kapatamıyor.
- DONE: Web kategori değiştir CTA'sı desktop dashboard'da tek noktaya indirildi.
- DONE: Mobil uygulamada kayıt sonrası kategori seçimine yönlendirme yapıldı.
- DONE: Mobil uygulamada eski kategori cache'i yeni kullanıcıyı atlatmasın diye temizleniyor.

## NEXT

NEXT: Task 2.12 - Desktop web'de `UserFeed.jsx` ve `UserFeedDetail.jsx` feed ekranlarını modernize et.

## Task 0 - Ortak Temel

- DONE 0.1: Kullanıcı ortak desktop bileşenlerini sadeleştir.
  - Dosyalar: `src/components/user/UserLayout.jsx`, `UserSidebar.jsx`, `NotificationPanel.jsx`, `CategorySelectorModal.jsx`.
  - Hedef: Desktop web'de tekrarlı gölgeler, fazla gradient, karışık nav davranışları ve CTA tekrarları azaltılsın.
  - Dokunma: `UserBottomNav.jsx`, `lg:hidden` mobil blokları ve Flutter'a benzetilmiş mobil dashboard görünümü.
  - Kontrol: Desktop 1440px ve 1280px görünümde nav, modal ve bildirim paneli düzgün açılmalı.

- TODO 0.2: Ortak boş, yükleniyor ve hata durumları için küçük UI standardı oluştur.
  - Hedef: Sayfalarda aynı boş durum dili, ikon ölçüsü ve aksiyon yapısı kullanılsın.
  - Not: Yeni büyük component sistemi kurma; mevcut stil sınıflarıyla küçük yardımcı bileşenler yeterli.
  - Öncelik notu: Kullanıcı isteğiyle dersler ve sınavlar sayfalarından sonraya ertelendi.

- TODO 0.3: Renk ve spacing taraması yap.
  - Hedef: Aşırı mor, koyu kart, yoğun glow ve tekrar eden dekoratif arka planları azalt.
  - Kontrol: `src/index.css` ve ana sayfa CSS sınıfları incelensin.

## Task 1 - Auth ve Onboarding Sayfaları

- TODO 1.1: `src/pages/Login.jsx`
  - Form daha kompakt, hata mesajları daha net, admin giriş varyantı daha anlaşılır olsun.
  - Öncelik desktop web. Mobil görünüm korunacak.

- TODO 1.2: `src/pages/Register.jsx`
  - Kayıt sonrası kategori seçimine giden akış daha anlaşılır kopyayla desteklensin.
  - Form alanları, şifre koşulları ve loading durumu sadeleştirilsin.

- TODO 1.3: `src/pages/ForgotPassword.jsx`
  - Form, başarı ve hata durumları modernize edilsin.

- TODO 1.4: `src/components/MaintenanceScreen.jsx`
  - Kullanıcı ve admin erişim durumları netleştirilsin.

- TODO 1.5: `LandingPage.jsx`, `PrivacyPolicy.jsx`, `AccountDeletion.jsx`
  - Landing varsa ilk viewport marka ve ürün sinyali güçlü olmalı.
  - Policy/account deletion okunabilirlik odaklı sadeleştirilsin.

## Task 2 - Kullanıcı Paneli Sayfaları

- PARTIAL 2.1: `src/pages/user/UserHome.jsx`
  - Yapıldı: Mobil Flutter hissi, zorunlu kategori onboarding, kategori CTA sadeleştirme.
  - Kalan: Desktop bilgi yoğunluğu ve kart hiyerarşisi bir tur daha sadeleştirilecek.

- DONE 2.2: `src/pages/user/UserLessons.jsx`
  - Yapıldı: Desktop ders ağacı sakinleştirildi, okuma ilerlemesi görünür hale getirildi, okuyucu alanı daha geniş ve net yapıldı.
  - Hedef: Kullanıcı hangi konuya devam edeceğini 5 saniyede anlayabilsin.

- DONE 2.3: `src/pages/user/UserExams.jsx`
  - Yapıldı: Desktop sınav merkezi, metrikler, sekmeler, yanlış tekrar kartı ve sınav kartları daha sade ve karşılaştırılabilir hale getirildi.
  - CTA sayısı azaltılsın, sınav kartları karşılaştırılabilir olsun.

- DONE 2.4: `src/pages/user/UserExamSolve.jsx`
  - Yapıldı: Desktop çözme ekranı soru haritası, odaklı soru alanı, zaman/durum paneli ve sade alt aksiyonlarla modernize edildi.
  - Mobilde soru listesi alt panel davranışı korunarak aksiyonlar daha stabil hale getirildi.

- DONE 2.5: `src/pages/user/UserStats.jsx`
  - Yapıldı: Özet metrikler daha taranabilir hale getirildi, performans grafiği boş durumda da anlamlı aksiyon gösteriyor.
  - Konu başarıları, rozetler ve son sınavlar daha sakin kart hiyerarşisiyle düzenlendi.

- DONE 2.6: `src/pages/user/UserSettings.jsx`
  - Yapıldı: Desktop ayarlar ekranı sol profil özeti ve sağda profil/güvenlik/tercih bölümleriyle yeniden düzenlendi.
  - Profil, konum, sınav tarihi, günlük hedef, hatırlatıcı ve hesap silme alanları daha taranabilir hale getirildi.

- DONE 2.7: `src/pages/user/UserFavorites.jsx` ve `UserWrongAnswers.jsx`
  - Yapıldı: Favori soru listesi arama, konu filtresi, özet metrikler ve daha sade detay paneliyle yenilendi.
  - Yanlış sorulara arama, tekrar filtresi, özet metrikler ve daha net tekil çözme aksiyonu eklendi.

- DONE 2.8: `src/pages/user/UserTrafficSigns.jsx`
  - Yapıldı: Levha kütüphanesi özet metrikler, arama/kategori şeridi, daha stabil görsel kartlar ve geniş detay modalıyla yenilendi.

- DONE 2.9: `src/pages/user/UserVideos.jsx`
  - Yapıldı: Video ekranına özet metrikler, daha sakin kategori kartları, kategori içi arama ve sade video oynatıcı alanı eklendi.

- DONE 2.10: `src/pages/user/UserDrivingSchools.jsx`
  - Yapıldı: Sürücü kursları ekranı özet metrikler, sade filtre paneli ve daha taranabilir kurs kartlarıyla düzenlendi.

- DONE 2.11: `src/pages/user/UserSupport.jsx`
  - Yapıldı: Desktop destek ekranına talep arama/durum filtresi eklendi; mesaj paneli ve yeni talep modalı daha sade hale getirildi.

- TODO 2.12: `src/pages/user/UserFeed.jsx` ve `UserFeedDetail.jsx`
  - Feed kartları, detay okuma ve aksiyonlar modernize edilecek.

## Task 3 - Admin Ortak Panel

- TODO 3.1: `src/components/admin/AdminLayout.jsx`, `AdminSidebar.jsx`, `AdminBottomNav.jsx`, `AdminNotifications.jsx`
  - Admin shell daha sakin, dense ve profesyonel hale getirilecek.
  - Mobil admin nav taşma ve menü erişimi kontrol edilecek.

- TODO 3.2: `src/pages/AdminDashboard.jsx`
  - Ana metrikler, grafikler ve son aktiviteler daha taranabilir yapılacak.

## Task 4 - Admin Sayfaları

- TODO 4.1: `src/pages/admin/AdminUsers.jsx`
  - Tablo, filtre, kullanıcı detay ve aksiyonlar sadeleştirilecek.

- TODO 4.2: `src/pages/admin/AdminExams.jsx`
  - Soru/sınav yönetimi formları daha okunur ve daha az yorucu olacak.

- TODO 4.3: `src/pages/admin/AdminContent.jsx`
  - İçerik düzenleme, kategori ağacı, draft/publish durumları netleştirilecek.

- TODO 4.4: `src/pages/admin/AdminStats.jsx`
  - Dashboard analitiği daha chart-first ve daha az metinli olacak.

- TODO 4.5: `src/pages/admin/AdminSupport.jsx`
  - Destek mesajları ve durum yönetimi sadeleştirilecek.

- TODO 4.6: `src/pages/admin/AdminFeed.jsx`, `AdminReports.jsx`
  - Moderasyon akışı daha hızlı karar verilebilir hale getirilecek.

- TODO 4.7: `src/pages/admin/AdminBadges.jsx`, `AdminMarketing.jsx`
  - Kampanya, badge ve pazarlama içerikleri daha tutarlı kart/tablolarla düzenlenecek.

- TODO 4.8: `src/pages/admin/AdminDrivingSchools.jsx`
  - Sürücü kursu yönetimi liste, form ve harita/lokasyon kullanımına göre iyileştirilecek.

- TODO 4.9: `src/pages/admin/AdminSettings.jsx`, `AdminProfile.jsx`
  - Ayarlar ve profil formları daha temiz bölümlenecek.

## Task 5 - Final QA

- TODO 5.1: `npm run build`.
- TODO 5.2: Desktop smoke test: login, register, dashboard, category select, lessons, exams, settings, admin dashboard.
- TODO 5.3: Mobile regression smoke test: 390x844 ve 430x932 genişliklerinde mevcut mobil görünüm bozulmamış mı kontrol et; yeni mobil tasarım yapma.
- TODO 5.4: CTA tekrar kontrolü: Her sayfada ana iş için tek güçlü aksiyon.
- TODO 5.5: Boş/veri yok/hata/loading durumları.
- TODO 5.6: Son `git diff` gözden geçirme.

## Resume Notları

- Dev server gerekirse: `npm run dev -- --host 127.0.0.1`
- Build kontrolü: `npm run build`
- Ana uygulama: `src/App.jsx`
- User shell: `src/components/user/UserLayout.jsx`
- Admin shell: `src/components/admin/AdminLayout.jsx`
