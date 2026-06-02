# GitHub Feature Audit - 2026-06-02

Kaynak repo: `https://github.com/hikmetnri/ehliyet-kurs-webpage.git`
Kontrol edilen branch: `origin/main`
Kontrol tarihi: 2026-06-02

## Kontrol Kapsami

- Son 15 gun commitleri kontrol edildi.
- Eski feature dokumanlarinin Mayis 2026 son haftasindan beri kacirdigi fonksiyonel maddeler tarandi.
- Sadece UI modernizasyonu olan commitler feature kapsaminda yeni madde olarak sayilmadi; fonksiyon, API, veri modeli veya kullanici akisi degisenler eklendi.

## GitHub'da Son 15 Gun Commitleri

- `7e3762f` - Add maintenance and analytics tracking
- `a672579` - Genel guncelleme: kullanici paneli, admin paneli, CSS ve yeni sayfalar
- `7b11369` - feat(web): redesign mobile screens (home, exams, feed, profile, stats) to align with Flutter
- `70a6fde` - feat(web): premium desktop ui redesign and in-app video player integration
- `a46dc3e` - Improve user dashboard learning flows
- `be8fad0` - Harden web auth and subscription controls
- `eb21939` - Modernize web exam solving screen
- `452a0f1` - Modernize web stats dashboard
- `b6db486` - Modernize web settings screen
- `943babe` - Modernize web question review lists
- `5222ac6` - Modernize web traffic signs screen
- `e35a537` - Modernize web videos screen
- `943c378` - Modernize web driving schools screen
- `ac1b98d` - Modernize web support screen
- `bd0da12` - Modernize web feed screens
- `b5a238d` - Modernize admin shell
- `174b975` - Modernize admin dashboard
- `47fb0ec` - Modernize remaining admin pages

## Zaten Dokumanda Olanlar

- Bakim modu ve `/status` kontrolu.
- Admin istatistik yolculuk analitigi, UTM/kaynak takibi, event funnel, kohort ve timeline.
- Akilli yanlis tekrar sistemi.
- Video ders kategorileri, video linkleri ve web video oynatici.
- QR takip ve pazarlama istatistikleri.
- Bildirim/broadcast/targeted notification akislari.
- Web UI modernizasyon gorevleri `UI_MODERNIZATION_TASKS.md` icinde takip ediliyor.

## Bu Audit Sonrasi Feature Dosyalarina Eklenenler

- Rozet kazanma kriter tipleri: `exam_count`, `question_count`, `correct_count`, `streak`, `daily_goal`, `success_rate`.
- Rozet kartlarinda `earnedCount` ve "Kimlerin Aldigini Gor" modal akisi.
- `GET /badges/:id/earned-users` endpoint referansi.
- Abonelik satis ekranini admin pazarlama ekranindan ac/kapat kontrolu.
- `GET /subscriptions/settings` ve `PUT /subscriptions/settings` endpoint referanslari.
- Web auth token saklama karari: `sessionStorage`, eski `localStorage.token` temizligi, askidaki kullanici/401 logout davranisi.
- Gizlilik politikasi ve KVKK metinlerinin Markdown/GFM olarak render edilmesi.

## Dikkat

Audit sirasinda `.agent/workflows/features` klasoru proje repo'sunun disinda duruyordu; bu dosyalar o ana kadarki GitHub commit gecmisinde gorunmuyordu. Bu yuzden GitHub karsilastirmasi `origin/main` commitleri uzerinden, feature dosyasi karsilastirmasi ise lokal dokuman icerigi uzerinden yapildi.
