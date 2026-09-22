import {
  BarChart3, Brain, CarFront, CheckCircle2, Map, PlayCircle, ShieldCheck, Sparkles, Target, Trophy, Users, Zap,
} from 'lucide-react';

export const FALLBACK_FAQS = [
  { _id: '1', question: "Ehliyet sınavına hazırlık için bu sistem yeterli mi?", answer: "Kesinlikle! MEB'in güncel 2026 müfredatına %100 uyumlu, daha önce çıkmış ve çıkma ihtimali yüksek sorulardan oluşan yapay zeka destekli havuzumuz tek başına yeterlidir." },
  { _id: '2', question: "Animasyonlu sorular müfredata uygun mu?", answer: "Evet, MEB'in yeni nesil e-sınav sisteminde yer alan tüm animasyonlu ve videolu soru tiplerini sistemimizde birebir simüle ediyoruz." },
  { _id: '3', question: "Uygulamayı indirmek ücretli mi?", answer: "Uygulamamızı indirmek ve temel testleri çözmek tamamen ücretsizdir. Daha kapsamlı analizler ve premium özellikler için opsiyonel PRO paketlerimiz bulunur." },
  { _id: '4', question: "Kişiselleştirilmiş analiz tam olarak nedir?", answer: "Çözdüğünüz her test sistemimiz tarafından analiz edilir. Yapay zeka, hata yaptığınız veya yavaş kaldığınız konuları tespit ederek karşınıza bu zayıflıkları giderecek özel testler çıkarır." },
  { _id: '5', question: "Testler gerçek sınav formatında mı?", answer: "Birebir aynı! Elektronik sınav (e-sınav) merkezlerinde karşılaşacağınız arayüzün aynısını simüle ediyoruz, böylece sınav günü hiçbir yabancılık çekmezsiniz." },
  { _id: '6', question: "İnternetsiz kullanabilir miyim?", answer: "Mobil uygulamamız üzerinden favoriye aldığınız soruları ve daha önce indirdiğiniz konu anlatımlarını çevrimdışı (internetsiz) olarak da çalışabilirsiniz." }
];

export const features = [
  { icon: Brain, color: "from-orange-500 to-amber-400", title: "Yapay Zeka Destekli Analiz", desc: "Zayıf noktalarını bul, sadece ihtiyacın olanı çalış. Akıllı algoritmamızla zaman kazan ve netlerini hızla artır." },
  { icon: Target, color: "from-rose-500 to-pink-500", title: "Birebir MEB Simülasyonu", desc: "Gerçek e-sınav arayüzünün birebir kopyası ile sınav stresi yaşamadan pratik yap. Sürprizlere yer yok." },
  { icon: PlayCircle, color: "from-rose-500 to-orange-400", title: "Yeni Nesil Animasyonlu Sorular", desc: "MEB'in yeni müfredatındaki videolu ve hareketli sorulara tam uyumlu, en güncel soru havuzu." },
  { icon: Sparkles, color: "from-amber-400 to-yellow-500", title: "Oyunlaştırma (Gamification)", desc: "Günlük hedefler, rozetler ve Türkiye geneli liderlik tablosu ile çalışmayı sıkıcı bir görevden eğlenceye çevir." },
  { icon: Map, color: "from-emerald-400 to-teal-500", title: "Görsel ve 3D Anlatımlar", desc: "Sıkıcı uzun metinler yok. Tüm karmaşık trafik kurallarını, motor parçalarını ve ilkyardım adımlarını görsel haritalarla öğren." },
  { icon: BarChart3, color: "from-fuchsia-500 to-pink-500", title: "Detaylı Performans Raporları", desc: "Gelişimini anlık takip et. Hangi konuda ne kadar başarılı olduğunu görerek çalışma stratejini optimize et." }
];

export const steps = [
  { num: "01", title: "Hedefini Belirle", desc: "Sınav tarihini ve hedeflediğin puanı girerek sana özel çalışma planını oluştur." },
  { num: "02", title: "Akıllı Testleri Çöz", desc: "Günde sadece 20 dakikanı ayırarak MEB uyumlu güncel soruları çöz." },
  { num: "03", title: "Eksiklerini Kapat", desc: "Yapay zeka analizleriyle zayıf olduğun konulara odaklan ve hızla geliş." },
  { num: "04", title: "Sınavı Geç!", desc: "Hazırlık seviyen %100'e ulaştığında gerçek sınava gir ve tek seferde kazan." }
];

export const testimonials = [
  { name: "Ayşe Yılmaz", role: "Öğrenci", score: "96 Puan", text: "Daha önce iki kez kalmıştım. Bu platformdaki animasyonlu sorular ve yapay zeka analizleri sayesinde eksiklerimi gördüm ve 96 alarak geçtim!" },
  { name: "Mehmet K.", role: "Üniversite Öğrencisi", score: "100 Puan", text: "Otobüste, molalarda sadece mobilden çözdüm. Gerçek sınav arayüzünün aynısı olması sınav anındaki heyecanımı sıfıra indirdi. Harika!" },
  { name: "Elif Şahin", role: "Öğrenci", score: "92 Puan", text: "Sıkıcı kitaplardan çalışmak yerine oyunlaştırılmış sistemle rozet kazanarak çalışmak çok keyifliydi. Kesinlikle tavsiye ediyorum." }
];

export const courseCategories = [
  { title: "Trafik ve Çevre", icon: Map, count: "850+ Soru", color: "text-blue-400", bg: "bg-blue-400/10" },
  { title: "İlk Yardım", icon: ShieldCheck, count: "400+ Soru", color: "text-red-400", bg: "bg-red-400/10" },
  { title: "Motor ve Araç", icon: CarFront, count: "550+ Soru", color: "text-amber-400", bg: "bg-amber-400/10" },
  { title: "Trafik Adabı", icon: Users, count: "200+ Soru", color: "text-emerald-400", bg: "bg-emerald-400/10" }
];

export const normalizeText = (value) => String(value || '').toLocaleLowerCase('tr-TR');

export const badges = [
  { name: "Hızlı Sürücü", icon: Zap, color: "text-yellow-400" },
  { name: "Hatasız Haftalık", icon: CheckCircle2, color: "text-green-400" },
  { name: "Bilgi Kurdu", icon: Brain, color: "text-purple-400" },
  { name: "Sınav Şampiyonu", icon: Trophy, color: "text-orange-400" }
];
