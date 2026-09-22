import { TEST_TYPES } from '../../../constants/testTypes';

export const analysisGuideItems = [
  {
    title: 'Genel Bakış',
    shows: 'Toplam üye, aktif kullanıcı, PRO oranı, genel başarı, kayıt ve QR hareketlerini gösterir.',
    interpret: 'Aktiflik veya yeni kayıt düşerken toplam üye artıyorsa kullanıcıların uygulamaya geri dönüşü zayıflıyor olabilir.',
    action: 'Kayıt düşüşünde pazarlamayı; aktiflik düşüşünde bildirim ve kullanıcı yolculuğunu incele.',
  },
  {
    title: 'Kullanıcı Yolculuğu',
    shows: 'Kayıttan kategori seçimine, ilk teste, yanlış tekrarına ve PRO ilgisine kadar geçişleri gösterir.',
    interpret: 'Bir adımdan sonraki adıma geçiş oranı belirgin düşüyorsa kullanıcılar o aşamada takılıyor demektir.',
    action: 'Düşüş yaşanan ekranı sadeleştir, yönlendirme metnini güçlendir veya ilgili kullanıcı grubuna bildirim gönder.',
  },
  {
    title: 'Etkileşim ve Dönüşüm',
    shows: 'Kayıt kaynaklarını, bildirim açılmalarını, paywall tıklamalarını ve riskli kullanıcıları gösterir.',
    interpret: 'Yüksek görüntülenme ancak düşük tıklama, mesajın veya teklifin kullanıcıyı ikna etmediğini gösterir.',
    action: 'Kaynak bazlı sonuçları karşılaştır; düşük dönüşümlü kampanya, bildirim veya paywall metnini iyileştir.',
  },
  {
    title: 'Eğitim Performansı',
    shows: 'Konu başarı oranlarını, çözüm sayılarını ve öğrencilerin en çok zorlandığı soruları gösterir.',
    interpret: '%50 altı konular öncelikli; yüksek hata alan sorular ise içerik veya soru kalitesi açısından kontrol edilmelidir.',
    action: 'Zayıf konu anlatımını geliştir, kritik soruların görselini, açıklamasını ve doğru cevabını doğrula.',
  },
];

export const formatShortDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const eventLabels = {
  register_completed: 'Kayıt tamamlandı',
  app_tour_started: 'Uygulama tanıtımına başladı',
  app_tour_step_viewed: 'Tanıtım adımını gördü',
  app_tour_completed: 'Uygulama tanıtımını tamamladı',
  app_tour_skipped: 'Uygulama tanıtımını atladı',
  login_completed: 'Giriş yaptı',
  category_selected: 'Kategori seçti',
  daily_goal_set: 'Günlük hedef',
  exam_date_set: 'Sınav tarihi',
  test_started: 'Test başladı',
  test_completed: 'Test bitti',
  first_test_completed: 'İlk test bitti',
  wrong_answer_added: 'Yanlış eklendi',
  wrong_review_started: 'Yanlış tekrar başladı',
  wrong_review_completed: 'Yanlış tekrar bitti',
  wrong_review_item_reviewed: 'Yanlış soru tekrarlandı',
  wrong_answer_mastered: 'Yanlış tamamlandı',
  paywall_seen: 'Paywall görüldü',
  pro_clicked: 'PRO tıklandı',
  pro_purchase_completed: 'PRO satın alma',
  pro_manual_toggled: 'PRO admin değişimi',
  notification_sent: 'Bildirim gönderildi',
  notification_opened: 'Bildirim açıldı',
  notification_mark_all_read: 'Bildirimler okundu',
  source_visit: 'Kaynak ziyareti',
};

export const sourceLabels = {
  direct: 'Doğrudan',
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google',
  tiktok: 'TikTok',
  owned_web: 'Web sitesi',
  unknown: 'Bilinmiyor',
};

export const platformLabels = {
  web: 'Web',
  mobile: 'Mobil',
  backend: 'Sistem',
  unknown: 'Bilinmiyor',
};

export const getTimelineSourceLabel = (event) => {
  if (event.metadata?.derived) return 'Geçmiş veri';

  const platform = platformLabels[event.platform] || event.platform || 'Bilinmiyor';
  const source = sourceLabels[event.source] || event.source || 'Doğrudan';
  return `${platform} · ${source}`;
};

export const getVisibleTimelineMetadata = (metadata = {}) => (
  Object.fromEntries(Object.entries(metadata).filter(([key]) => key !== 'derived'))
);

export const timelineMetadataLabels = {
  step: 'Tanıtım adımı',
  stepId: 'Tanıtılan bölüm',
  version: 'Tur sürümü',
  email: 'E-posta',
  name: 'Ad soyad',
  selectedCategoryId: 'Kategori ID',
  selectedCategoryName: 'Kategori',
  resultId: 'Sonuç ID',
  examId: 'Test ID',
  examName: 'Test',
  testType: 'Test türü',
  categoryId: 'Kategori ID',
  categoryName: 'Kategori',
  totalQuestions: 'Toplam soru',
  correctCount: 'Doğru',
  wrongCount: 'Yanlış',
  emptyCount: 'Boş',
  score: 'Puan',
  passed: 'Durum',
  duration: 'Süre',
  questionId: 'Soru ID',
  subject: 'Konu',
  result: 'Tekrar sonucu',
  reviewStage: 'Tekrar aşaması',
  nextReviewAt: 'Sonraki tekrar',
  mastered: 'Öğrenildi',
  mode: 'İşlem',
};

export const testTypeLabels = {
  [TEST_TYPES.SHORT_TEST]: 'Kısa test',
  [TEST_TYPES.MOCK_EXAM]: 'Deneme sınavı',
  [TEST_TYPES.REAL_EXAM]: 'Gerçek sınav',
  [TEST_TYPES.EXAM]: 'Test',
  [TEST_TYPES.WRONG_REVIEW]: 'Yanlış tekrar',
  [TEST_TYPES.WRONG_ANSWERS]: 'Yanlışlar testi',
};

export const resultLabels = {
  correct: 'Doğru',
  wrong: 'Yanlış',
  skip: 'Atlandı',
  mastered: 'Öğrenildi',
  reviewed: 'Tekrarlandı',
};

export const modeLabels = {
  create: 'Yeni kayıt',
  update: 'Güncelleme',
};

export const formatTimelineMetadataValue = (key, value) => {
  if (value === null || value === undefined || value === '') return '';
  if (key === 'passed') return value ? 'Geçti' : 'Kaldı';
  if (key === 'mastered') return value ? 'Evet' : 'Hayır';
  if (typeof value === 'boolean') return value ? 'Evet' : 'Hayır';
  if (key === 'duration') {
    const seconds = Number(value) || 0;
    if (seconds <= 0) return '';
    if (seconds < 60) return `${seconds} sn`;
    return `${Math.round(seconds / 60)} dk`;
  }
  if (key === 'testType') return testTypeLabels[value] || value;
  if (key === 'result') return resultLabels[value] || value;
  if (key === 'mode') return modeLabels[value] || value;
  if (key.endsWith('At')) return formatDateTime(value);
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'object') return Object.values(value).filter(Boolean).join(', ');
  return String(value);
};

export const getTimelineMetadataItems = (metadata = {}) => (
  Object.entries(getVisibleTimelineMetadata(metadata))
    .map(([key, value]) => ({
      key,
      label: timelineMetadataLabels[key] || key,
      value: formatTimelineMetadataValue(key, value),
    }))
    .filter(item => item.value)
);

export const getTimelineDescription = (event, metadata) => {
  if (event.eventType === 'app_tour_started') return 'Yeni kullanıcı uygulama tanıtımına başladı.';
  if (event.eventType === 'app_tour_step_viewed') return `${metadata.step ?? ''}. tanıtım adımına geçti.`;
  if (event.eventType === 'app_tour_completed') return 'Tanıtımı bitirip Sınavlar bölümüne geçti.';
  if (event.eventType === 'app_tour_skipped') return `${metadata.step ?? ''}. adımda tanıtımı atladı.`;
  const examName = metadata.examName || metadata.categoryName || 'Test';
  const categoryName = metadata.selectedCategoryName || metadata.categoryName || 'Kategori';

  if (event.eventType === 'register_completed') {
    return metadata.name ? `${metadata.name} kayıt oldu.` : 'Kullanıcı kayıt oldu.';
  }
  if (event.eventType === 'category_selected') {
    return `${categoryName} seçildi.`;
  }
  if (event.eventType === 'test_started') {
    return `${examName} başlatıldı.`;
  }
  if (event.eventType === 'test_completed' || event.eventType === 'first_test_completed') {
    const scoreText = metadata.score !== undefined ? ` Puan: ${metadata.score}.` : '';
    return `${examName} tamamlandı.${scoreText}`;
  }
  if (event.eventType === 'wrong_answer_added') {
    return `${metadata.categoryName || metadata.subject || 'Bir soru'} yanlış havuzuna eklendi.`;
  }
  if (event.eventType === 'wrong_review_started') {
    return 'Yanlış tekrar oturumu başladı.';
  }
  if (event.eventType === 'wrong_review_completed') {
    return 'Yanlış tekrar oturumu tamamlandı.';
  }
  if (event.eventType === 'wrong_review_item_reviewed') {
    const result = resultLabels[metadata.result] || metadata.result || 'Tekrarlandı';
    return `Yanlış soru tekrarlandı. Sonuç: ${result}.`;
  }
  if (event.eventType === 'wrong_answer_mastered') {
    return 'Yanlış soru öğrenildi olarak işaretlendi.';
  }
  if (event.eventType === 'paywall_seen') {
    return 'PRO ekranı görüntülendi.';
  }
  if (event.eventType === 'pro_clicked') {
    return 'PRO satın alma butonuna tıklandı.';
  }
  if (event.eventType === 'pro_purchase_completed') {
    return 'PRO satın alma tamamlandı.';
  }
  if (event.eventType === 'notification_sent') {
    return 'Bildirim gönderildi.';
  }
  if (event.eventType === 'notification_opened') {
    return 'Bildirim açıldı.';
  }
  return '';
};
