# Agent Talimatları: Ehliyet Yolu — Tüm Proje

Bu dosya, Ehliyet Yolu'nun Flutter mobil uygulama, React web paneli ve Node.js backend projelerinde çalışan AI ajanları için özel davranış kurallarını içerir.

## 🤖 Otomatik Özellik Takibi Kuralı

Bu üçlü proje yapısındaki geliştirme süreci, proje kökündeki `.agent/workflows/features/` dizinindeki checklist dosyaları üzerinden takip edilmektedir.

**ANA KAYNAK:**
- Ana hafıza klasörü her zaman üst proje dizinindeki `.agent` klasörüdür: `/Users/hikmet/Desktop/Proje/.agent`
- Flutter, React web veya backend klasörlerinden biri içinde çalışılsa bile ajan önce üst dizindeki bu `.agent` klasörünü aramalıdır.
- Alt projelerin içinde ayrıca `.agent` kopyası varsa, bu kopya ana kaynak değil yedek/commit kopyası kabul edilir. Güncel kararlar üst dizindeki `.agent` üzerinden alınır.

**KURAL:**
1. Herhangi bir Flutter, React veya backend API bileşeni, sayfası, endpoint'i ya da özelliği oluşturulduğunda/güncellendiğinde; ajan, bu değişikliğin proje kökündeki `.agent/workflows/features/` altındaki hangi dökümana karşılık geldiğini kontrol etmelidir.
2. İlgili özellik başarıyla uygulandıysa, ajan ilgili markdown dosyasındaki platform işaretini güncellemelidir: `[x][F]` Flutter tamamlandı, `[x][R]` React tamamlandı. Diğer platform henüz yapılmadıysa `[-][R]` veya `[-][F]` olarak bırakılabilir.
3. Backend'e özel davranışlar `api-reference.md`, `technical-spec.md` veya ilgili admin/kullanıcı bölümüne kısa not olarak eklenmelidir.
4. Yeni davranış checklist'te yoksa ilgili bölüme kısa bir madde eklenmelidir. Özellikle Flutter'da eklenen davranışlar React'e taşınacak referans olarak, React'te eklenen davranışlar Flutter'a taşınacak referans olarak yazılmalıdır.
5. Bu güncelleme için kullanıcıdan onay beklenmesine gerek yoktur; her başarılı "Feature" implementasyonu sonrası bu takip dökümanları güncel tutulmalıdır.

## Feature Hafıza Kapanış Kontrolü

Her geliştirme turunun sonunda ajan aşağıdaki kontrolü yapmak zorundadır:

1. Yapılan iş yeni bir özellik, yeni ekran, yeni kullanıcı akışı, yeni admin akışı, yeni API endpoint'i, yeni veri modeli alanı, yeni entegrasyon veya platformlar arası fark oluşturuyor mu?
2. Cevap evet ise `.agent/workflows/features/` altındaki ilgili dosya hemen güncellenir.
3. Cevap hayır ise final cevapta kısaca "features güncellemesi gerekmedi" denir ve nedeni yazılır.
4. Sadece görsel/UI modernizasyon yapıldıysa:
   - Davranış veya akış değişmediyse feature dosyası yerine ilgili UI görev dosyası güncellenir.
   - Navigasyon, filtre, modal, form, yönetim aksiyonu, kullanıcı aksiyonu veya platform farkı oluştuysa feature dosyası da güncellenir.
5. Kullanıcı hatırlatmasa bile ajan bu kontrolü kendi yapar.

## Platform Karşılaştırma Kuralı

Feature dosyaları sadece "neler yapıldı" listesi değildir; aynı zamanda "webde var Flutter'da yok", "Flutter'da var webde yok", "backend var ama UI yok" hafızasıdır.

- React web'de tamamlanan ama Flutter'da olmayan özellik: `[ ][F] [x][R]` veya bilinçli kapsam dışıysa `[-][F] [x][R]`
- Flutter'da tamamlanan ama React web'de olmayan özellik: `[x][F] [ ][R]` veya bilinçli kapsam dışıysa `[x][F] [-][R]`
- Backend hazır ama iki UI'da da uygulanmamış özellik ilgili API/teknik notta tutulur; UI maddeleri açık bırakılır.
- Planlanan fikirler açık madde olarak kalabilir, fakat "tamamlandı" gibi yazılmaz.

## Final Cevap Raporlama Kuralı

Kod değişikliği yapılan her final cevapta ajan şunlardan birini belirtmelidir:

- "Features güncellendi: ..." ve dosya adı/madde özeti.
- "Features güncellemesi gerekmedi: sadece görsel/UI düzenleme yapıldı, davranış değişmedi."
- "Features kontrolü yapıldı; mevcut maddeler zaten kapsıyor."

## 📂 Dökümantasyon Yapısı

- `admin-panel.md`: Admin ekranları takibi.
- `user-panel.md`: Kullanıcı ekranları takibi.
- `api-reference.md`: Backend entegrasyon takibi.
- `technical-spec.md`: Veri modelleri ve kurallar.
- `other-features.md`: Ek özellikler.
