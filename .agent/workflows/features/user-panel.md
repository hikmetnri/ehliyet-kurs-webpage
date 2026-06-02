# 2. KULLANICI PANELİ

Durum notu: `[F]` Flutter, `[R]` React web anlamına gelir. `[x]` tamamlandı, `[ ]` bekliyor, `[-]` ise o platform için uygulanmaz / kapsam dışı demektir.

## 2.1 Navigasyon
- [x][F] [x][R] Sidebar (desktop) / Drawer sidebar (mobil): Ana Sayfa, Dersler, Sınav Merkezi, İstatistiklerim, Topluluk, Destek Talepleri, Ayarlar
- [-][F] [x][R] React web mobil alt navigasyon Flutter ana sekme düzenine yaklaştırıldı: Ana Sayfa, Sorular, Sınavlar, Akış, Profil (`UserBottomNav` + `UserLayout`)

---

## 2.2 Auth
- [x][F] [x][R] Kayıt ol (ad, soyad, e-posta, şifre)
- [x][F] [x][R] Giriş yap (e-posta + şifre)
- [x][F] [x][R] Google ile giriş
- [x][F] [x][R] İlk girişte ehliyet türü seçimi
- [x][F] [x][R] Seçim localStorage + backend'e kaydedilir
- [x][F] [x][R] Motivasyon sözü: giriş/çıkışta random söz
- [-][F] [x][R] Auth ekranlarında logo okunurluğu: Login, Register ve ForgotPassword sayfalarında mavi logo beyaz/yuvarlatılmış zemin içinde gösterilir

---

## 2.3 Ana Sayfa

### Kategori Seçim Ekranı
- [x][F] [x][R] Ana kategoriler (Dersler sayfasında listelenir)
- [x][F] [x][R] Seçim kaydedilir, tekrar sorulmaz
- [x][F] [x][R] Ana sayfada "Değiştir" butonu

### Header
- [x][F] [x][R] Kullanıcı avatarı + "Merhaba, [ad]! 👋" (Home dashboard)
- [x][F] [x][R] Dashboard üst header kompakt tek satır düzene çekildi: logo/avatar, uzun adlarda küçülen kullanıcı adı, bildirim butonu ve tema toggle aynı hatta kalır; header gereksiz yükseklik kaplamaz
- [x][F] [x][R] Bildirim butonu (okunmamış badge)
- [x][F] [x][R] Bildirim listesi: başlık, mesaj, tarih, okundu/sil
- [x][F] [x][R] Bildirim tipleri: sistem, uyarı, sınav, duyuru, hedefli bildirim, destek mesajı (`chat_message`) ve akış bildirimleri
- [x][F] [x][R] Push bildirimleri FCM token ile eşleşir; uygulama açılışında ve login sonrası token tekrar kaydedilir
- [x][F] [x][R] Dark/Light mod toggle (animasyonlu)

### Widget'lar
- [x][F] [x][R] Streak kartı (ateş ikonu + gün sayısı)
- [x][F] [x][R] Günlük hedef kartı (bugün/hedef + progress bar + %)
- [x][F] [x][R] Motivasyon sözü kartı (yazar + söz)
- [x][F] [x][R] Dashboard "Günün Sözü" kayan yazısı harf kırpmadan akar; kenar fade/mask kaldırıldı, yazı 350 karakterle sınırlandı ve uzun sözlerde glyph güvenlik payı kullanılır
- [x][F] [-][R] Flutter özel "Kaldığın Yerden Devam Et" kartı: son okunan ders/test `SharedPreferences` ile tutulur; web tarafında bunun yerine günlük plan/aksiyon kartı kullanılır
- [x][F] [-][R] Flutter özel Dashboard "Hızlı Teste Başla": seçili eğitim alanındaki tamamlanmamış `short_test` kategorisini sırayla açar; başarıyla tamamlanan testleri tekrar seçmez
- [x][F] [-][R] Flutter özel Dashboard "Kaldığın Yerden Devam Et": `last_visited_type` ile konu/test ayrımı yapar; test başarıyla geçildiyse sıradaki tamamlanmamış kısa teste yönlendirir
- [x][F] [x][R] Kişisel günlük çalışma planı / "Bugün ne yapmalıyım?" kartı: backend plan endpoint'i sınav tarihi, günlük hedef, zayıf konular ve zamanı gelen yanlışlara göre görev üretir; web ve Flutter dashboard bu planı kullanır
- [-][F] [x][R] React web özel öğrenci dashboard mobil deneyimi Flutter hissine yaklaştırıldı: kompakt topbar, safe-area uyumlu alt nav, dar ekran paddingleri
- [-][F] [x][R] React web özel dashboard ve sınav navigasyonu Flutter mantığına yaklaştırıldı: alt navdaki Sorular/Sınavlar sekmeleri sınav merkezinin ilgili tablarını açar
- [-][F] [x][R] React web dashboard önceki akışa yakınlaştırıldı: en üstte kayan "Günün Sözü" şeridi korundu; büyük öğrenci kartı aktif paket, toplam sınav, doğru cevap, seri, bugünkü soru, seviye, sınav özeti ve hızlı erişim aksiyonlarıyla dolduruldu; sağ çalışma panelinde "Bugün Ne Yapmalıyım?", yanlış tekrar ve plan görevleri gösterilir
- [-][F] [x][R] React web masaüstü dashboard arayüzü premium görünümle yenilendi: bağımsız 4 sütunlu şık metrik kartları, Sparkles içeren karşılama bannerı, XP ve Soru İlerleme çubukları, dikey zaman tüneli plan akışı ve üzerine gelindiğinde HSL renklerinde parlayan konu müfredat kartları.

### Kategori Grid
- [x][F] [x][R] 2 sütunlu grid (seçili kategorinin alt konuları)
- [x][F] [x][R] Her kart: ikon, isim, tamamlanma % progress bar, PRO badge
- [x][F] [x][R] İçerikli konu → ContentReaderScreen
- [x][F] [x][R] Alt kategorli konu → SubCategoryScreen
- [x][F] [x][R] Trafik işaretleri → TrafficSignsScreen
- [x][F] [x][R] Video kısayolu → VideoCoursesScreen; videolar admin tarafından oluşturulan video kategorilerine göre gruplanır, kategori seçilince o kategoriye ait videolar listelenir
- [x][F] [x][R] PRO kilitli → Paywall (Üyelik uyarısı)

### İçerik Okuma Ekranı
- [x][F] [x][R] Okuma progress bar (Markdown scroll)
- [x][F] [x][R] Başlık kartı: ikon, kategori adı, tahmini okuma süresi
- [x][F] [x][R] Markdown render: H1/H2/H3, liste, kalın/italik, resim, video, ayraç
- [x][F] [x][R] Müfredat drawer (sağdan açılır, aktif konu vurgulanır)
- [x][F] [-][R] PDF export butonu (Kapsam Dışı)
- [x][F] [x][R] "Kısa Teste Başla" butonu (Her sayfa sonunda değil, sadece testi olanlarda)
- [x][F] [x][R] Testi geçince konu "tamamlandı" işaretlenir
- [x][F] [x][R] "Sıradaki Derse Geç" butonu

---

## 2.4 Kısa Testler ve Genel Denemeler (Pekiştirme)
- [x][F] [x][R] 3 Sekmeli Yapı: Kısa Testler / Deneme / Yanlışlarım
- [x][F] [x][R] Kısa Testler sekmesinde Accordion (Modül bazlı aç-kapa) gruplandırma
- [x][F] [x][R] Tamamlanan konular yeşil işaretlenir
- [x][F] [x][R] İlk 5 test ücretsiz, sonrası kilitli (Paywall entegrasyonu)
- [x][F] [x][R] Teste Başla → İşaretleme sonrası anında geri bildirim (Mock mode)
- [x][F] [x][R] Yanlış cevaplanan sorular için "Doğru Cevap + Açıklama" gösterimi
- [x][F] [x][R] Deneme sınavları `mock_exam` sorularını `examId` ile çeker; gerçek sınavlardan ayrı listelenir
- [x][F] [x][R] Deneme ve gerçek sınav soruları `subject` alanıyla ayrılır: `trafik`, `ilkyardim`, `motor`, `adabi`
- [x][F] [x][R] Yanlışlarım sekmesi backend ve lokal yanlış cevap kayıtlarını birleştirir
- [x][F] [x][R] Akıllı yanlış tekrar sistemi backend'de ortak çalışır: zamanı gelen yanlışlar en fazla 20 soruluk "Bugün Çözülecek Yanlışlar" testine girer; doğru yapılan soru sonraki güne ertelenir, yanlış yapılırsa tekrar seviyesi sıfırlanır, aynı soru 4 farklı doğru tekrardan sonra otomatik tamamlanır; "Öğrendim" ile manuel çıkarılabilir
- [x][F] [x][R] React web Yanlışlarım akışı tamamlandı: ana sayfa ve Sınav Merkezi zamanı gelen yanlış sayısını gösterir, `/dashboard/exams/wrong-review` route'u akıllı tekrar testini açar, yanlış soru medya/resimleri ve temiz şık metinleri gösterilir
- [x][F] [x][R] Flutter Yanlışlarım akışı web ile aynı mantığa getirildi: dashboard "Yanlışları Çöz" aksiyonu `QuizScreen(testType: 'wrong_review')` açar, kategori filtresi uygulanmadan tüm zamanı gelen yanlışlar alınır, sonuç ekranı tekrar moduna göre davranır, resimli sorular ve şık metinleri web ile uyumludur
- [x][F] [x][R] Denemelerde süre opsiyonel, gerçek sınav modunda geri sayım zorunludur
- [x][F] [-][R] DateTime bazlı güvenli timer (arka plana atılınca süre kaybolmaz)
- [x][F] [-][R] Sınavdan çıkış onay diyaloğu (PopScope ile veri kaybı önlenir)
- [x][F] [-][R] Başarı kutlama animasyonu (Konfeti - CustomPainter)
- [x][F] [-][R] Quiz akışlarına soru listesi bottom sheet'i eklendi; kullanıcı soru numaralarına hızlı geçiş yapabilir
- [x][F] [x][R] Test sonucu: doğru, yanlış, başarı %, skor hesapları
- [x][F] [x][R] Konu Okuma sonrası bitişe "Konu Testini Çöz" yönlendirmesi eklendi
- [-][F] [x][R] React web masaüstü Sınav Merkezi arayüzü premium görünümle yenilendi: 3 sütunlu istatistik kartları, dikey zemin kaymalı sekme çubuğu (sliding pill switcher), kategori filtresi butonları ve kilit/başarı durumlarına göre neon parıltılı sınav listesi kartları.
- [x][F] [-][R] `%70+` başarıyla geçilen kısa test `completed_category_<categoryId>` olarak kaydedilir ve dashboard hızlı test havuzundan çıkarılır
- [x][F] [-][R] Başarılı kısa test sonrası devam kartı önce sıradaki tamamlanmamış kısa testi, yoksa sıradaki konu anlatımını hedefler

---

## 2.5 MEB E-Sınav Simülasyonu (Gerçek Sınav)
- [x][F] [x][R] Sınavlar ekranı yalnızca gerçek sınavları listeler; deneme isimli sınavlar bu ekranda gizlenir
- [x][F] [x][R] Kompakt üst kart: sınav sayısı, süre, soru sayısı ve sonuçlara hızlı erişim
- [x][F] [x][R] Gerçek sınav kartları: ikon, süre rozeti, karma test rozeti, kilit/aksiyon durumu
- [x][F] [x][R] MEB E-Sınav Simülatörü Kartı (backend sınav kaydı + `real_exam` soruları)
- [x][F] [x][R] Başlatma Info Ekranı (Girilen test moduna göre dinamik kurallar)
- [x][F] [x][R] Geri sayım timer (Normal/Uyarı/Tehlike renk bildirimleri)
- [x][F] [x][R] İlerleme çubuğu (X/toplam) navigasyon tracker
- [x][F] [x][R] Şık seçimi (Anında cevap yok, seçim silinebilir/değiştirilebilir)
- [x][F] [x][R] Soru listesi / hızlı soru navigasyonu: quiz ve gerçek sınav modlarında sorulara bottom sheet/liste üzerinden geçiş desteklenir
- [x][F] [x][R] Önceki/Sonraki butonları + Footer nokta navigasyonu
- [x][F] [x][R] Soruyu raporla butonu
- [x][F] [x][R] Sınavı teslim et onay dialogu
- [x][F] [x][R] Analiz Sonucu: Geçti/Kaldı (70 Puan Eşiği), karne ve XP
- [x][F] [x][R] Sınav sonucu backend'e postlanır
- [x][F] [x][R] Geçmiş deneme sınav sonuçları arşivi (Ayrıntılı liste)
- [x][F] [x][R] Sınav detayı görüntüleme (Hatalı soruların listesi)

---

## 2.6 Akış (Topluluk Feed)
- [x][F] [x][R] Gönderi listesi (onaylanmış, `/posts` API, sayfalama)
- [x][F] [x][R] Arama: başlık, içerik, kullanıcı, etiket
- [x][F] [x][R] Filtre: Hepsi / Tartışma / Soru / Sınav Paylaşımı / İpucu (tab bar)
- [x][F] [x][R] Yeni gönderi (tür seçimi + başlık + içerik + etiket, modal form)
- [x][F] [x][R] Beğeni toggle (optimistic UI)
- [x][F] [x][R] Yorum listesi + yazma alanı (bubble chat UI, açılır panel)
- [x][F] [x][R] Gönderi detay sayfası (ayrı route: `/dashboard/feed/:postId`; web liste ve bildirim yönlendirmesi bağlı)
- [x][F] [x][R] Yorum gelince bildirim (backend tarafında `Notification` oluşturuluyor)
- [x][F] [x][R] Gönderi oluşturma sonrası başarı animasyonu
- [x][F] [x][R] Hero banner (toplam gönderi & yorum istatistikleri)
- [x][F] [x][R] İskelton yükleme (skeleton loader)
- [x][F] [x][R] Renkli avatar initial (kullanıcı adından otomatik renk)
- [x][F] [x][R] Zaman formatı ("5 dk önce" formatı)
- [x][F] [-][R] Akış gönderi kartları yenilendi: renkli tür bandı, daha belirgin avatar/header, okunabilir içerik, modern etiketler ve aksiyon barı
- [x][F] [-][R] Akış gönderi kartları kompaktlaştırıldı: padding, avatar, pill, etiket, referans kutusu ve metrik buton boyutları düşürüldü; başlık/icerik tek satır ellipsis davranışına alındı
- [x][F] [-][R] Feed detay ve liste ekranlarında sunucu medya URL düzeltmeleri yapıldı; backend'den gelen relative media path'ler uygulamada normalize edilir
- ⚠️ Yeni gönderiler admin onayından sonra (`pending → approved`) yayınlanır

---

## 2.7 Profil

### Header
- [x][F] [x][R] Avatar (Topbar'da profil baş harfi)
- [x][F] [x][R] Level progress bar
- [x][F] [x][R] Level badge (Stajyer Sürücü / Usta Adayı / İleri Seviye / Usta Sürücü)
- [x][F] [x][R] Ad, soyad
- [x][F] [x][R] Toplam puan + PRO badge

### İstatistik Kartları
- [x][F] [x][R] Puan, Sınav, Soru, Doğru, Başarı %

### Profil Ana Ekranı (Tab Yapısı Kaldırıldı)
- [x][F] [x][R] CustomScrollView tabanlı dikey profil akışı
- [x][F] [x][R] Hızlı işlem butonları gridi (Hesap Ayarları, Şifre, Çıkış, Sil)
- [x][F] [-][R] Flutter profil hızlı erişimleri 3 kolonlu yapıya taşındı; Dersler, Levhalar ve Ayarlar kısayolları eklendi
- [x][F] [x][R] Favoriler ekranına gitmek için üst bar ikonu
- [x][F] [x][R] Profil sayfasından "Yakındaki Sürücü Kursları" ekranına geçiş; kullanıcının şehir/konum bilgisine göre yakın kursları listeler

### Favoriler (Bağımsız Sayfa)
- [x][F] [x][R] Favori sorular listesi, favoriden çıkar

### Yakındaki Sürücü Kursları (Profil Bağlantılı Sayfa)
- [x][F] [x][R] Kullanıcının bulunduğu şehir veya seçtiği şehir üzerinden sürücü kursu listesi gösterilir
- [x][F] [x][R] Profilde kayıtlı şehir/ilçe kurs ekranında varsayılan seçili gelir; kullanıcı sayfa içinde geçici olarak farklı filtre seçebilir
- [x][F] [x][R] Kurs kartlarında ad, şehir/ilçe, adres, telefon, konum linki, web/başvuru linki ve verilen ehliyet sınıfları gösterilir
- [x][F] [x][R] Arama, şehir ve ilçe filtresi Türkiye il/ilçe listesinden seçilebilir yapıdadır
- [x][F] [x][R] Telefon, konum ve web bağlantıları uygulama/cihaz dışı bağlantı olarak açılır

### Analytics (Ayrı Sayfa - Premium UI)
- [x][F] [x][R] Kompakt Streak + Günlük hedef kartları
- [x][F] [x][R] 12'li İstatistik Gridi (Sınav ve Soru Özeti & İleri Düzey Analiz)
- [x][F] [x][R] Yeni Metrikler: Toplam Süre, Doğruluk %, Soru Başına Hız, Toplam Puan
- [x][F] [x][R] Son 10 sınav bar grafiği
- [x][F] [x][R] Zayıf konularım (en düşük 6 kategori, progress bar)
- [-][F] [x][R] React web masaüstü İstatistikler sayfası arayüzü premium görünümle yenilendi: dairesel SVG doğruluk halkası içeren geniş Performans Özeti kartı, 12 metrikli detaylı istatistik ızgaraları, Recharts bar grafiği ve detaylı sınav geçmişi tablosu.

### Rozetler (ayrı sayfa)
- [x][F] [x][R] Kazanılan/kilitli rozetler grid
- [x][F] [x][R] Rozet detayında kazanım kriteri okunur metinle gösterilir: sınav sayısı, soru sayısı, doğru cevap, seri, günlük hedef veya başarı oranı

### Liderboard (ayrı sayfa)
- [x][F] [x][R] 4 tab: Günlük / Haftalık / Aylık / Hepsi
- [x][F] [x][R] Backend leaderboard cevabında hem düz kullanıcı alanları (`firstName`, `lastName`, `totalPoints`) hem eski `userDetails` formatı desteklenir

### Destek (ayrı sayfa)
- [x][F] [x][R] Talep listesi (konu, son mesaj, durum badge)
- [x][F] [x][R] Kompakt destek merkezi kartı + hızlı yeni talep aksiyonu
- [x][F] [x][R] Bağlantı/API hatası durumunda tekrar deneme ekranı
- [x][F] [x][R] Durum badge'leri (Yeni / Okundu / Cevaplandı / Kapatıldı)
- [x][F] [x][R] Yeni talep: konu + mesaj (ipucu kutusuyla)
- [x][F] [x][R] Chat UI (çift yönlü, admin sol / kullanıcı sağ bubble)
- [x][F] [x][R] Kapatılmış taleplerde yanıt kutusu gizlenir
- [x][F] [x][R] Destek mesajlaşmasında iki yönlü uygulama içi bildirim + FCM push gönderilir

### Sıkça Sorulan Sorular (S.S.S.) (ayrı sayfa)
- [x][F] [x][R] Dinamik SSS listesi (Backend bağlantılı)
- [x][F] [x][R] Accordion (Açılır/Kapanır) liste yapısı

### Kullanıcı Ayarları (ayrı sayfa)
- [x][F] [x][R] Günlük hedef seçici (Zorluk seviyesi)
- [x][F] [x][R] Günlük hatırlatıcı toggle + saat/dakika seçici
- [x][F] [x][R] Hatırlatıcı ayarı backend'e kaydedilir (`notifEnabled`, `notifHour`, `notifMinute`) ve backend cron seçilen saatte push gönderir
- [x][F] [x][R] Eski lokal hatırlatıcılar temizlenir; çift bildirim oluşması engellenir
- [x][F] [x][R] Ayarlar açılırken backend ayarları lokal SharedPreferences ile senkronize edilir
- [x][F] [x][R] Sınav tarihi geri sayım widget (Dashboard)
- [-][F] [x][R] Web Tercihler ekranında sınav tarihi alanı native takvim açacak şekilde güçlendirildi; tarih inputuna veya Takvim butonuna basınca date picker açılır

### Abonelik / Paywall
- [x][F] [-][R] Pro özellikleri listele + satın al (Kapsam Dışı)
- ⚠️ Abonelik sistemi şu an kapsam dışıdır.

---

## 3. Sistem & Altyapı (Technical Quality)

### Veri Güvenliği
- [x][F] [-][R] Offline Bekleyen Kayıtlar: İnternet yoksa sınav sonuçları `SharedPreferences`'a alınır, açılışta `flushQueue()` ile gönderilir
- [x][F] [-][R] Local ↔ Cloud Sync: Her login/açılışta backend'deki `totalScore` ve `streak` yerel belleğe senkronize edilir (büyük olan kazanır)
- [x][F] [-][R] Notification JSON parse güvenliği: `Map<dynamic, dynamic>` cevaplar `Map<String, dynamic>` formatına normalize edilir

### Sınav Güvenliği
- [x][F] [-][R] `PopScope` çıkış onayı: Sınav aktifken geri tuşu veya X butonu onay diyaloğu gösterir
- [x][F] [-][R] `DateTime` bazlı güvenli timer: Arka plana atılsa bile süre kaybolmaz

### Teknik Borç (Tamamlandı)
- [x][F] [-][R] `quiz_screen.dart` modüler bileşenlere bölündü (1700 → 1375 satır):
  - `widgets/quiz_confetti.dart` → Konfeti sistem
  - `widgets/quiz_option_tile.dart` → Şık widgetı
  - `widgets/quiz_report_dialog.dart` → Raporlama dialogu
