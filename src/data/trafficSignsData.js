const signFiles = {
  tehlike: {
    folder: 'Tehlike_T',
    titlePrefix: 'Tehlike Uyarı İşareti',
    description: 'Bu trafik işareti tehlike uyarı grubunda yer alır. Sürücülerin hızını azaltıp yol koşullarına göre dikkatli ilerlemesi gerekir.',
    files: 't-10.png t-11.png t-12.png t-13.png t-14a.png t-14b.png t-15.png t-16.png t-17.png t-18.png t-19.png t-1a.png t-1b.png t-20.png t-21.png t-22a.png t-22b.png t-22c.png t-22d.png t-22e.png t-23a.png t-23b.png t-24.png t-25.png t-26.png t-27a.png t-27b.png t-28a-b.png t-29a-b.png t-2a.png t-2b.png t-30a-b.png t-31a-b.png t-32.png t-33a.png t-33b.png t-33d-e.png t-33f.png t-34a-b.png t-35.png t-36.png t-37.png t-38.png t-39.png t-3a.png t-3b.png t-4a.png t-4b.png t-4c.png t-5.png t-6.png t-7.png t-8.png t-9.png'.split(' '),
  },
  tanzim: {
    folder: 'Tanzim_TT',
    titlePrefix: 'Trafik Tanzim İşareti',
    description: 'Bu trafik işareti tanzim grubunda yer alır. Sürücülerin yasaklama, kısıtlama, öncelik veya mecburi yönlendirme kurallarına uyması gerekir.',
    files: 'b-14e.png b-14f.png b-37.png b-38.png b-39.png tt-1.png tt-10a.png tt-10b.png tt-11.png tt-12.png tt-13.png tt-14.png tt-15.png tt-16a.png tt-16b.png tt-17.png tt-18.png tt-19.png tt-2.png tt-20.png tt-21.png tt-22.png tt-23.png tt-24.png tt-25.png tt-26a.png tt-26b.png tt-26c.png tt-27.png tt-28.png tt-29-130.png tt-29-140.png tt-29-30.png tt-29-40.png tt-29-50.png tt-29-60.png tt-29-70.png tt-29-80.png tt-29-90.png tt-29b.png tt-2a.png tt-3.png tt-30.png tt-31.png tt-32.png tt-33-30.png tt-33-40.png tt-33-50.png tt-33-60.png tt-33-70.png tt-33-80.png tt-33-90.png tt-33b.png tt-34a.png tt-34b.png tt-35a.png tt-35b.png tt-35c.png tt-35d.png tt-35e.png tt-35f.png tt-35g.png tt-35h.png tt-36a.png tt-36b.png tt-36c.png tt-37.png tt-38a.png tt-38b.png tt-39a.png tt-39b.png tt-4.png tt-40a.png tt-40b.png tt-41a-30.png tt-41b-30.png tt-42a.png tt-42b.png tt-43.png tt-43a.png tt-43b.png tt-43c.png tt-44a.png tt-44b.png tt-45a.png tt-45b.png tt-5.png tt-6.png tt-7.png tt-8.png tt-9.png'.split(' '),
  },
  bilgi: {
    folder: 'Bilgi_B',
    titlePrefix: 'Bilgi İşareti',
    description: 'Bu trafik işareti bilgi grubunda yer alır. Sürücü ve yayalara yol, yön, hizmet veya yer bilgisi verir.',
    files: 'b-10.png b-11a.png b-11b.png b-11c.png b-11d.png b-12a.png b-12b.png b-12c.png b-12d.png b-12e.png b-12f.png b-12g.png b-12h.png b-12i.png b-13a.png b-13b.png b-14a.png b-14b.png b-14c.png b-14d.png b-15.png b-16.png b-16b.png b-17.png b-18.png b-19.png b-1a.png b-1b.png b-1c.png b-1d.png b-20.png b-21.png b-22.png b-23.png b-24.png b-25.png b-26.png b-27.png b-28.png b-29.png b-2a.png b-2b.png b-2c.png b-2d.png b-3.png b-30.png b-31.png b-32.png b-33.png b-34.png b-35.png b-36.png b-4.png b-40.png b-41.png b-42.png b-43.png b-44.png b-45a.png b-45b.png b-45c.png b-45d.png b-46.png b-47.png b-48.png b-49.png b-49b.png b-50a.png b-50b.png b-50c.png b-50d.png b-50e.png b-50f.png b-51a.png b-51b.png b-51c.png b-51d.png b-52.png b-52b.png b-53a.png b-53b.png b-53c.png b-54.png b-55a.png b-55b.png b-55c.png b-55d.png b-55e.png b-56.png b-57.png b-58a.png b-58b.png b-59.png b-5a.png b-5b.png b-5c.png b-5d.png b-60.png b-61a.png b-61b.png b-61c.png b-61d.png b-61e.png b-61f.png b-61g.png b-62.png b-63a.png b-63b.png b-63c.png b-63d.png b-64.png b-6a.png b-6b.png b-7.png b-8a.png b-8b.png b-8c.png b-9.png'.split(' '),
  },
  durma: {
    folder: 'Park_P',
    titlePrefix: 'Durma ve Park Etme İşareti',
    description: 'Bu trafik işareti durma ve park etme grubunda yer alır. Sürücülerin duraklama, park veya park alanı kurallarına uyması gerekir.',
    files: 'p-1.png p-2.png p-3a.png p-3b.png p-3c.png p-3d.png'.split(' '),
  },
};

const knownSigns = {
  'Tehlike_T/t-1a.png': {
    title: 'Sağa Tehlikeli Viraj',
    description: 'İleride sağa doğru tehlikeli bir viraj olduğunu bildirir. Hız azaltılmalı ve viraja girerken şerit takip edilmelidir.',
  },
  'Tehlike_T/t-1b.png': {
    title: 'Sola Tehlikeli Viraj',
    description: 'İleride sola doğru tehlikeli bir viraj olduğunu bildirir. Hız azaltılmalı ve dikkatli olunmalıdır.',
  },
  'Tehlike_T/t-2a.png': {
    title: 'Sağa Tehlikeli Devamlı Virajlar',
    description: 'İleride ilki sağa olmak üzere birbirini takip eden tehlikeli virajlar olduğunu bildirir.',
  },
  'Tehlike_T/t-2b.png': {
    title: 'Sola Tehlikeli Devamlı Virajlar',
    description: 'İleride ilki sola olmak üzere birbirini takip eden tehlikeli virajlar olduğunu bildirir.',
  },
  'Tehlike_T/t-3a.png': {
    title: 'Tehlikeli Eğim (İniş)',
    description: 'İleride araçların güvenli inişini zorlaştıracak derecede dik bir iniş eğimi olduğunu bildirir.',
  },
  'Tehlike_T/t-3b.png': {
    title: 'Tehlikeli Eğim (Çıkış)',
    description: 'İleride dik bir çıkış eğimi olduğunu bildirir.',
  },
  'Tehlike_T/t-4a.png': {
    title: 'Her İki Yandan Daralan Kaplama',
    description: 'İleride yolun her iki taraftan daralacağını bildirir.',
  },
  'Tehlike_T/t-11.png': {
    title: 'Yaya Geçidi',
    description: 'İleride yaya geçidi olduğunu bildirir. Yavaşlanmalı, yayalara ilk geçiş hakkı verilmelidir.',
  },
  'Tehlike_T/t-12.png': {
    title: 'Okul Geçidi',
    description: 'İleride okul geçidi olduğunu bildirir. Çocukların yola çıkabileceği düşünülerek yavaşlanmalıdır.',
  },
  'Tehlike_T/t-21.png': {
    title: 'Kontrolsüz Kavşak',
    description: 'İleride trafik işareti veya görevlisi bulunmayan bir kavşak olduğunu bildirir. Geçiş üstünlüğü kurallarına uyulmalıdır.',
  },
  'Tanzim_TT/tt-1.png': {
    title: 'Yol Ver',
    description: 'Kavşaklarda ana yoldaki araçlara yol verilmesi gerektiğini belirtir.',
  },
  'Tanzim_TT/tt-2.png': {
    title: 'DUR',
    description: 'Kavşağa girmeden önce mutlaka durulması ve yolun kontrol edilmesi gerektiğini belirtir.',
  },
  'Tanzim_TT/tt-3.png': {
    title: 'Girilmez',
    description: 'Yolun bu yönde trafiğe kapalı olduğunu belirtir.',
  },
  'Tanzim_TT/tt-4.png': {
    title: 'Taşıt Trafiğine Kapalı Yol',
    description: 'Yolun her iki yönde de taşıt trafiğine kapalı olduğunu belirtir.',
  },
  'Tanzim_TT/tt-5.png': {
    title: 'Motosiklet Hariç Motorlu Taşıt Trafiğine Kapalı Yol',
    description: 'Motosiklet dışındaki motorlu taşıtların girmesinin yasak olduğunu belirtir.',
  },
  'Tanzim_TT/tt-26a.png': {
    title: 'Sağa Dönülmez',
    description: 'Kavşakta sağa dönmenin yasak olduğunu belirtir.',
  },
  'Tanzim_TT/tt-26b.png': {
    title: 'Sola Dönülmez',
    description: 'Kavşakta sola dönmenin yasak olduğunu belirtir.',
  },
  'Tanzim_TT/tt-26c.png': {
    title: 'U Dönüşü Yapılmaz',
    description: 'İleriden veya kavşaktan geriye dönüşün yasak olduğunu belirtir.',
  },
  'Tanzim_TT/tt-27.png': {
    title: 'Öndeki Taşıtı Geçmek Yasaktır',
    description: 'Bu levhadan sonra öndeki taşıtın geçilmesinin yasak olduğunu belirtir.',
  },
  'Tanzim_TT/tt-29-50.png': {
    title: 'Hız Sınırlaması (50 km/s)',
    description: 'Azami hızın saatte 50 kilometreyi geçemeyeceğini belirtir.',
  },
  'Bilgi_B/b-1a.png': {
    title: 'İl Sınırı',
    description: 'Bir ilin mülki sınırına girildiğini bildirir.',
  },
  'Bilgi_B/b-2a.png': {
    title: 'Meskun Mahal Başlangıcı',
    description: 'Şehir veya kasaba gibi yerleşim yerlerine girildiğini bildirir.',
  },
  'Bilgi_B/b-15.png': {
    title: 'Hastane',
    description: 'Yakınlarda bir hastane olduğunu ve gürültü yapmamaya dikkat edilmesi gerektiğini bildirir.',
  },
  'Bilgi_B/b-16.png': {
    title: 'İlk Yardım',
    description: 'Yakınlarda bir ilk yardım merkezi bulunduğunu bildirir.',
  },
  'Bilgi_B/b-17.png': {
    title: 'Tamirhane',
    description: 'Yakınlarda araç tamirhanesi bulunduğunu bildirir.',
  },
  'Bilgi_B/b-19.png': {
    title: 'Akaryakıt İstasyonu',
    description: 'Yakınlarda bir akaryakıt istasyonu bulunduğunu bildirir.',
  },
  'Bilgi_B/b-22.png': {
    title: 'Durak',
    description: 'Kamu hizmeti yapan yolcu taşıtlarının durak yerlerini belirtir.',
  },
  'Bilgi_B/b-32.png': {
    title: 'Otoyol Başlangıcı',
    description: 'Otoyolun başladığını ve otoyol kurallarının geçerli olduğunu bildirir.',
  },
  'Park_P/p-1.png': {
    title: 'Duraklamak ve Park Etmek Yasaktır',
    description: 'Yolun bu kesiminde hem duraklamanın hem de park etmenin yasak olduğunu belirtir.',
  },
  'Park_P/p-2.png': {
    title: 'Park Etmek Yasaktır',
    description: 'Yolun bu kesiminde park etmenin yasak olduğunu, ancak kısa süreli duraklamanın yapılabileceğini belirtir.',
  },
  'Park_P/p-3a.png': {
    title: 'Park Yeri',
    description: 'Taşıtların park edebileceği alanı belirtir.',
  },
};

const formatCode = (file) => file.replace('.png', '').toUpperCase();

export const trafficSignsData = Object.entries(signFiles).flatMap(([category, config]) =>
  config.files.map((file) => {
    const imageKey = `${config.folder}/${file}`;
    const known = knownSigns[imageKey];
    const code = formatCode(file);

    return {
      id: imageKey,
      title: known?.title || `${config.titlePrefix} ${code}`,
      description: known?.description || `${config.description} Levha kodu: ${code}.`,
      category,
      image: `/images/signs/${imageKey}`,
      code,
    };
  })
);

export const categories = [
  { id: 'all', label: 'Tümü' },
  { id: 'tehlike', label: 'Tehlike Uyarı İşaretleri' },
  { id: 'tanzim', label: 'Trafik Tanzim İşaretleri' },
  { id: 'bilgi', label: 'Bilgi İşaretleri' },
  { id: 'durma', label: 'Durma ve Park Etme İşaretleri' },
];
