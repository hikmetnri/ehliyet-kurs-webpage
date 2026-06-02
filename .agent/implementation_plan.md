# Uygulama Planı - Kalan Kullanıcı Sayfalarının Masaüstü Görünümlerinin (Desktop UI) Yeniden Tasarımı

Bu plan, React web uygulamasının henüz el değmemiş veya temel düzeyde olan diğer kullanıcı sayfalarının masaüstü görünümlerini, modern tasarım sistemimizle (glassmorphism, animasyonlu geçişler, HSL parlamaları ve sliding pill tab'ler) uyumlu hale getirmeyi amaçlamaktadır.

## Önerilen Değişiklikler

---

### 1. Ders Notları Sayfası (Lessons)
#### [MODIFY] [UserLessons.jsx](file:///Users/hikmet/Desktop/Proje/ehliyet-kurs-webpage-main/src/pages/user/UserLessons.jsx)
- **Sol Sidebar (Kategori Ağacı)**:
  - Ders başlıklarının listelendiği ağaç yapısının (`TreeNode`) kenarlıkları, ikon yuvaları ve seçilme durumları parıltılı cam efekti (`glass-card`) ile güçlendirilecek.
  - Arama girdi kutusu modern animasyonlu odaklanma sınırları ile güncellenecek.
- **Sağ İçerik Okuyucu (Reader Panel)**:
  - Makale başlığı üst barına yumuşak bir gradyan ve gölge eklenecek.
  - Markdown nesneleri (başlıklar, listeler, kod blokları) için daha geniş ve okunabilir tipografi (`prose-invert` özelleştirmeleri) kullanılacak.
  - Ders sonundaki "Konu Testini Çöz" paneli, büyük ve parlayan bir başarı kartına dönüştürülecek.

---

### 2. Ayarlar ve Profil Sayfası (Settings)
#### [MODIFY] [UserSettings.jsx](file:///Users/hikmet/Desktop/Proje/ehliyet-kurs-webpage-main/src/pages/user/UserSettings.jsx)
- **Gelişmiş Sekme Geçişi (Tab Switcher)**:
  - Dikey sekme çubuğu, üzerine gelindiğinde veya seçildiğinde dikey hareket eden şık zemin animasyonuna (`layoutId="activeSettingsTab"`) sahip sliding pill yapısına kavuşturulacak.
- **Kişisel Bilgiler, Güvenlik ve Tercihler Formları**:
  - Girdi alanları (`input-field`), select kutuları ve butonlar cam kart tasarımı ve odaklanma parlamaları ile donatılacak.
  - Avatar yükleme alanı üzerine gelindiğinde yumuşak animasyonla beliren kamera ikonu ve gölgelerle zenginleştirilecek.

---

### 3. Topluluk Akışı ve Detay Sayfaları (Community Feed)
#### [MODIFY] [UserFeed.jsx](file:///Users/hikmet/Desktop/Proje/ehliyet-kurs-webpage-main/src/pages/user/UserFeed.jsx)
- **Topluluk Kahraman Kartı (Hero Banner)**:
  - En üstteki topluluk istatistik ve paylaşım başlığı, mor/turkuaz HSL gradyanlar ve parıldayan dairesel ışıklar içeren premium bir banner haline getirilecek.
- **Gönderi Kartları ve Arama Çubuğu**:
  - Gönderi listesindeki her bir kart, tür etiketlerine (discussion, question, vb.) ve hover esnasında hafifçe yükselen yumuşak gölgelere kavuşturulacak.
  - Yorum yazma ve listeleme alanları, dikey daralmayı önleyen ferah bir düzenle kaplanacak.

#### [MODIFY] [UserFeedDetail.jsx](file:///Users/hikmet/Desktop/Proje/ehliyet-kurs-webpage-main/src/pages/user/UserFeedDetail.jsx)
- **Gönderi Detay Paneli**:
  - Geri dönüş butonu, gönderi metni ve yorum balonları, cam paneller içerisinde şık birer sohbet akışı gibi yapılandırılacak.

---

### 4. Destek Merkezi (Support)
#### [MODIFY] [UserSupport.jsx](file:///Users/hikmet/Desktop/Proje/ehliyet-kurs-webpage-main/src/pages/user/UserSupport.jsx)
- **İki Sütunlu Masaüstü Düzeni (Dual Pane Layout)**:
  - Sol tarafta mevcut destek taleplerinin ferah kartlar halinde listelendiği bir kılavuz, sağ tarafta ise seçili talebin chat tarzındaki akışını ve mesaj kutusunu içeren interaktif bir sohbet alanı konumlandırılacak.
  - Yeni talep oluşturma formu modern bir modal penceresiyle sunulacak.

---

### 5. Diğer Varlıklar (Videos, Favorites, Driving Schools)
#### [MODIFY] [UserVideos.jsx](file:///Users/hikmet/Desktop/Proje/ehliyet-kurs-webpage-main/src/pages/user/UserVideos.jsx)
- **Video Ders Kartları**:
  - Video kursları ve kategorileri, üzerine tıklandığında video oynatıcısını açan, parlayan kenarlıklara ve oynatma ikonlarına sahip modern ızgara kartlarına dönüştürülecek.

#### [MODIFY] [UserFavorites.jsx](file:///Users/hikmet/Desktop/Proje/ehliyet-kurs-webpage-main/src/pages/user/UserFavorites.jsx)
- **Favori Sorular Listesi**:
  - Masaüstünde favoriye eklenen sorular ve doğru/yanlış analizleri ferah bir cam kart listesi haline getirilecek.

#### [MODIFY] [UserDrivingSchools.jsx](file:///Users/hikmet/Desktop/Proje/ehliyet-kurs-webpage-main/src/pages/user/UserDrivingSchools.jsx)
- **Sürücü Kursları Listesi**:
  - Türkiye il/ilçe filtreleme barı ve sürücü kursu iletişim kartları masaüstü görünümü için zenginleştirilecek.

---

## Doğrulama Planı

### Otomatik Derleme
- Yapılan tüm değişikliklerin ardından `npm run build` çalıştırılarak Vite derleme doğrulaması yapılacaktır.

### Manuel Arayüz Doğrulaması
- Değiştirilen 7 sayfanın masaüstü geniş ekranlarda yerleşimleri, responsive davranışları ve hover animasyonları tek tek incelenecektir.
