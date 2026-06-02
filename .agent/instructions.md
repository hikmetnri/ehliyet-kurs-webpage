# Agent Talimatları: Ehliyet Yolu — Tüm Proje

Bu dosya, Ehliyet Yolu'nun Flutter mobil uygulama, React web paneli ve Node.js backend projelerinde çalışan AI ajanları için özel davranış kurallarını içerir.

## 🤖 Otomatik Özellik Takibi Kuralı

Bu üçlü proje yapısındaki geliştirme süreci, proje kökündeki `.agent/workflows/features/` dizinindeki checklist dosyaları üzerinden takip edilmektedir.

**KURAL:**
1. Herhangi bir Flutter, React veya backend API bileşeni, sayfası, endpoint'i ya da özelliği oluşturulduğunda/güncellendiğinde; ajan, bu değişikliğin proje kökündeki `.agent/workflows/features/` altındaki hangi dökümana karşılık geldiğini kontrol etmelidir.
2. İlgili özellik başarıyla uygulandıysa, ajan ilgili markdown dosyasındaki platform işaretini güncellemelidir: `[x][F]` Flutter tamamlandı, `[x][R]` React tamamlandı. Diğer platform henüz yapılmadıysa `[-][R]` veya `[-][F]` olarak bırakılabilir.
3. Backend'e özel davranışlar `api-reference.md`, `technical-spec.md` veya ilgili admin/kullanıcı bölümüne kısa not olarak eklenmelidir.
4. Yeni davranış checklist'te yoksa ilgili bölüme kısa bir madde eklenmelidir. Özellikle Flutter'da eklenen davranışlar React'e taşınacak referans olarak, React'te eklenen davranışlar Flutter'a taşınacak referans olarak yazılmalıdır.
5. Bu güncelleme için kullanıcıdan onay beklenmesine gerek yoktur; her başarılı "Feature" implementasyonu sonrası bu takip dökümanları güncel tutulmalıdır.

## 📂 Dökümantasyon Yapısı

- `admin-panel.md`: Admin ekranları takibi.
- `user-panel.md`: Kullanıcı ekranları takibi.
- `api-reference.md`: Backend entegrasyon takibi.
- `technical-spec.md`: Veri modelleri ve kurallar.
- `other-features.md`: Ek özellikler.
