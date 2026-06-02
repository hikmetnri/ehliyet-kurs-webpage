# TEKNİK ŞARTNAME VE VERİ MODELLERİ

## 5. PRO / FREE AYRIMI

- Bazı kategoriler `isPro: true` → kilitli görünür
- Test listesinde: ilk 5 ücretsiz, `index >= 5` → kilitli
- Kilitli → "Ödüllü Reklam İzle" modal veya Paywall
- Pro üyede her şey açık
- Admin panelinden manuel Pro verilebilir

## 5.1 WEB AUTH VE OTURUM GÜVENLİĞİ

- Web auth token kalıcı `localStorage` yerine `sessionStorage` içinde tutulur; eski `localStorage.token` her API başlangıcında temizlenir.
- `401` veya askıya alınmış kullanıcı `403` cevabında token, kullanıcı ve son ziyaret kategori cache'i temizlenerek login ekranına dönülür.
- Hesap silme sayfası web token'ı `sessionStorage` üzerinden okur; başarılı silme sonrası `sessionStorage` ve `localStorage` oturum verilerini temizler.

---

## 6. PUAN / LEVEL / ROZET SİSTEMİ

| Puan | Seviye | Renk |
|------|--------|------|
| 0–99 | Stajyer Sürücü | Cyan |
| 100–499 | Usta Adayı | Purple |
| 500–999 | İleri Seviye | Orange |
| 1000+ | Usta Sürücü | Gold |

- Profil header'ında dairesel progress bar
- Rozet sistemi: 2000 soruya kadar tanımlı
- Streak: üst üste çalışılan gün sayısı
- Günlük hedef: kullanıcı belirler (5-100 soru)

---

## 7. TEKNİK NOTLAR

- JWT: `Authorization: Bearer <token>` header
- Token: localStorage
- Admin kontrolü: `role === 'admin'`
- Online: son 5 dakika içinde aktif
- Markdown: `react-markdown` önerilir
- Günün sözü: mobilde söz metni 350 karakterle sınırlandı; web de aynı sınırı input `maxLength` ve görüntüleme kırpmasıyla uygulamalı. Kayan yazı/fade maskesi harfleri kırpmamalı, özellikle Türkçe karakterlerde kenar payı bırakılmalı.
- Video eğitimleri için yeni backend endpoint eklenmedi; Flutter tarafı mevcut `Category` kaydını içerik marker'larıyla kullanır. Video kategorileri `content` içinde `@[video_category]`, video kayıtları `content` içinde `@[video](url)` marker'ı ve notlar taşır. Normal kategori listelerinde bu marker'lı kayıtlar filtrelenir.
- Ders içeriği taslak/yayın/sürüm geçmişi yönetimi React web admin akışıdır. Flutter kullanıcı tarafı yalnızca public kategori endpointlerinden yayınlanmış `content` alanını okur; Flutter admin tarafında taslak UI bilinçli olarak kapsam dışıdır.
- Sürükle-bırak: `@dnd-kit/sortable`
- Tarih: ISO 8601
- Sayfalama: `?page=1&limit=50`
- Profil açılışında backend'den reload yap (puan önbellek sorunu)
- Dark/Light tema: tüm ekranlarda uyumlu olmalı
- Uygulama açılışında `GET /auth/config` çağır → versiyon kontrolü + reklam config
- Flutter production/release APK uzak sunucuyu kullanır: `https://api.ehliyetyolu.com/api`. Emulator/local test için ayrıca `--dart-define=API_BASE_URL=http://10.0.2.2:3000/api` verilir; telefona production APK atarken bu define kullanılmaz.
- Bakım modu public kontrolü `GET /api/status` ile yapılır. Bakım aktifken admin token'ı middleware'den geçer; normal kullanıcılar `503` ve `{ maintenance: true }` cevabı alır. Admin maintenance endpoint cevaplarında uyumluluk için hem `isMaintenance` hem `enabled` döner.
- Flutter kullanıcı route'ları bakım modunu açılışta ve periyodik gate kontrolüyle okur; admin panele erişim bakım modunda kilitlenmez. Aktif API istekleri 503 alırsa ekranda snack/uyarı görülebilir.
- İşlem günlükleri ekranındaki "Düşük Skorlar" sekmesi crash log değildir; `GET /admin/user-logs` `ExamResult.score < 50` kayıtlarını sınav adı, kategori, doğru/yanlış ve skor ile döndürür.
- Gerçek mobil crash/error kayıtları `POST /logs` üzerinden `logs/mobile_errors.log` dosyasına yazılır; şu an admin log UI'da ayrı dosya okuyucu yoktur.
- WrongAnswers backend DB'de tutulur (localStorage değil)
- Akıllı yanlış tekrar sistemi `WrongAnswer.reviewStage`, `nextReviewAt`, `lastReviewedAt`, `masteredAt` ve `reviewHistory` alanlarını kullanır; `wrong_review` test türü doğru cevapları ileriki bir güne bırakıp yanlışları bugüne geri alır; aynı soru 4 kez doğru yapılınca otomatik `masteredAt` set edilerek normal tekrar listesinden çıkarılır
- Yanlış tekrar endpointi `questionId` üzerinden orijinal `Question` kaydını da okuyarak soru metni, şıklar, doğru cevap, açıklama ve `media` alanını tamamlar; eski yanlış kayıtları API'yi patlatmadan tekrar testinde görselli gelir
- Admin dönüşüm/yolculuk analitiği hibrit çalışır: temel huni `User`, `ExamResult`, `WrongAnswer` kayıtlarından türetilir; kaynak, paywall, bildirim, kohort ve kullanıcı timeline verileri `AnalyticsEvent` üzerinden hesaplanır. `GET /admin/stats/journey?days=&source=` kayıt, kategori seçimi, ilk test, yanlış havuzu, yanlış tekrar, paywall ve PRO adımlarını; drop-off segmentlerini, event hunisini, kaynak performansını, kohortları ve riskli kullanıcıları döndürür.
- Admin kullanıcı timeline endpoint'i canlı `AnalyticsEvent` kayıtlarını öncelikli kullanır; eski kullanıcılar için `User`, `ExamResult` ve `WrongAnswer` kayıtlarından kayıt, kategori, test, yanlış tekrar ve öğrenildi hareketlerini türetir. Bu türetilmiş kayıtlar admin web ve Flutter UI'da teknik kaynak olarak değil "Geçmiş veri" olarak gösterilir.
- Web ve Flutter admin timeline UI JSON metadata bloğu göstermez; eventleri okunur açıklama ve etiketlere çevirir. Örnek etiketler: kategori, test, puan, doğru, yanlış, süre, durum, tekrar sonucu.
- Web ve Flutter client-only temaslar `POST /analytics/events` ile `platform`, `source`, `sessionId` ve `metadata` gönderir; server-side akışlar aynı modeli `analyticsService.trackEvent` ile besler.
- Kampanya takibi UTM mantığıyla yapılır:
  - `utm_source`: ana kaynak. Admin panelindeki kaynak filtresi bu alanı kullanır. Örnek: `instagram`, `google`, `tiktok`, `qr_poster`.
  - `utm_medium`: kanal tipi. Örnek: `story`, `reels`, `bio`, `cpc`, `poster`.
  - `utm_campaign`: kampanya adı. Örnek: `mayis_pro`, `direksiyon_baslangic`, `yaz_kampanyasi`.
  - `utm_content`: aynı kampanya içindeki kreatif/varyant. Örnek: `video_1`, `story_a`, `mavi_gorsel`.
  - `utm_term`: ücretli arama anahtar kelimesi için opsiyonel.
- Örnek Instagram story linki: `https://ehliyetyolu.com/register?utm_source=instagram&utm_medium=story&utm_campaign=mayis_pro&utm_content=story_a`
- Web helper bu değerleri `analytics_acquisition_context` olarak localStorage'a yazar; kayıt/giriş event'lerinde `metadata.acquisition` içinde backend'e gider. Admin kaynak filtresi şimdilik `source` kırılımını gösterir; kampanya bazlı rapor istendiğinde `AnalyticsEvent.metadata.acquisition.campaign` üzerinden group yapılmalıdır.
- selectedCategoryId hem localStorage hem backend DB'de saklanır
- Kişisel günlük çalışma planı `GET /stats/daily-plan` ile üretilir. Endpoint kullanıcının sınav tarihini, günlük hedefini, bugünkü soru sayısını, zamanı gelen yanlışlarını ve konu bazlı başarı oranlarını okuyarak dashboard için `title`, `subtitle`, `primaryAction`, `progress`, `dueWrong`, `weakTopics` ve sıralı `tasks[]` döndürür. Öncelik sırası: sınıf seçimi, zamanı gelen yanlışlar, zayıf konu, günlük hedef, yakın sınav için deneme sınavı.
- Flutter `SharedPreferences` ilerleme anahtarları:
  - `completed_category_<categoryId>`: kısa test `%70+` başarıyla geçildiğinde `true`
  - `last_visited_id`, `last_visited_name`, `last_visited_icon`: devam kartının hedefi
  - `last_visited_type`: `content` veya `short_test`; dashboard devam kartı konu/test ayrımını bununla yapar
  - `last_visited_ts`: son ziyaret zamanı
- FCM token: giriş sonrası `POST /notifications/fcm-token` ile kaydet
- FCM token: uygulama zaten login halde açılırsa da tekrar kaydedilir; token yenilenirse backend'e yazılır
- Günlük hatırlatıcı: kullanıcı `notifEnabled`, `notifHour`, `notifMinute` değerlerini kaydeder; backend cron Türkiye saatiyle her dakika kontrol edip seçilen saatte push + in-app bildirim gönderir
- Lokal günlük hatırlatıcılar çift bildirim riski nedeniyle temizlenir; ana kaynak backend cron'dur
- Admin broadcast / hedefli bildirim / yeni sınav / destek mesajı akışları hem `Notification` kaydı hem FCM push üretir
- Web push için FCM web SDK kullanılacak
- Rate limiting: backend'de mevcut, 429 hatalarını handle et

---

## 8. VERİ MODELLERİ (Gerçek Backend Alanları)

```
User {
  _id, email, firstName, lastName, phone, role (user|admin),
  proStatus, totalScore, level, avatarUrl, bio,
  fcmToken, isActive, selectedCategoryId, selectedCategoryName,
  lastActiveAt, dailyGoal, notifEnabled, notifHour, notifMinute,
  earnedBadges[{ badgeId, earnedAt }]
}

Category {
  _id, name, color, icon, isPro, content (markdown),
  draftContent, publicationStatus (draft|published|published_with_draft),
  publishedAt, lastDraftSavedAt, contentVersions[],
  order, parentId (null = ana kategori), description
  # video marker kullanımı:
  # content contains "@[video_category]" => video kategori kaydı
  # content contains "@[video](url)" => video ders kaydı
}

Question {
  _id, text, options[], correctAnswer (index),
  testType (short_test|mock_exam|real_exam|exam), subject (trafik|ilkyardim|motor|adabi|''),
  media (URL), explanation,
  difficulty (easy|medium|hard), coefficient,
  category (ref), exam (ref),
  correctCount, wrongCount, isActive
}

Exam {
  _id, name, description, duration (dk), categoryId,
  isPro, isActive, isMiniTest, testType (short_test|mock_exam|real_exam|exam), order
}

ExamResult {
  _id, user (ref), examId, examName, testType,
  categoryId, categoryName,
  totalQuestions, correctCount, wrongCount,
  score, passed, duration (saniye),
  wrongQuestions[{ questionId, questionText, userAnswer, correctAnswer, options, explanation, media }]
}

WrongAnswer {
  _id, user (ref), questionId, questionText,
  options[], correctAnswer, userAnswer, explanation,
  categoryId, categoryName, testType,
  wrongCount, lastWrongAt,
  reviewStage, nextReviewAt, lastReviewedAt, masteredAt,
  reviewHistory[{ result, reviewedAt, stageBefore, stageAfter }],
  media
}

AnalyticsEvent {
  _id, user (ref|null), eventType,
  source, platform, sessionId,
  metadata, ip, userAgent,
  createdAt, updatedAt
}

Post {
  _id, userId, userName, type (discussion|question|exam_share|tip),
  title, content, tags[], status (pending|approved|rejected),
  likes[], comments[{ userId, userName, text }]
}

ContactMessage {
  _id, userId, subject,
  messages[{ sender (user|admin), text, sentAt }],
  status (new|read|replied|closed)
}

Quote { _id, text, author, isActive }
# Client kuralı: text max 350 karakter

Badge {
  _id, name, description, icon, color,
  type (exam_count|question_count|correct_count|streak|daily_goal|success_rate),
  requiredValue, earnedCount, isActive
}

Notification {
  _id, user (ref), title, message,
  type (system|social|achievement|alert|feed|exam|broadcast|targeted|chat_message|support),
  isRead, data, createdAt
}

BroadcastHistory {
  _id, title, body, target (all|pro|free),
  sentCount, createdBy
}

SubscriptionPlan {
  _id, planId, name, description, price, currency,
  period (monthly|yearly|lifetime|biweekly),
  discountPercent, isActive, features[], sortOrder
}

Coupon {
  _id, code, discountType (percent|fixed), discountValue,
  applicablePlans[], maxUsage, usedCount,
  maxUsagePerUser, expiresAt, isActive, description
}
```
