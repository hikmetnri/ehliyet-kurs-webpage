export const trafficSignsData = [
  // Tehlike Uyarı İşaretleri (Tehlike_T)
  {
    id: 1,
    title: "Sağa Tehlikeli Viraj",
    description: "İleride sağa doğru tehlikeli bir viraj olduğunu bildirir. Hız azaltılmalı ve viraja girerken şerit takip edilmelidir.",
    category: "tehlike",
    image: "/images/signs/Tehlike_T/t-1a.png"
  },
  {
    id: 2,
    title: "Sola Tehlikeli Viraj",
    description: "İleride sola doğru tehlikeli bir viraj olduğunu bildirir. Hız azaltılmalı ve dikkatli olunmalıdır.",
    category: "tehlike",
    image: "/images/signs/Tehlike_T/t-1b.png"
  },
  {
    id: 3,
    title: "Sağa Tehlikeli Devamlı Virajlar",
    description: "İleride ilki sağa olmak üzere birbirini takip eden tehlikeli virajlar olduğunu bildirir.",
    category: "tehlike",
    image: "/images/signs/Tehlike_T/t-2a.png"
  },
  {
    id: 4,
    title: "Sola Tehlikeli Devamlı Virajlar",
    description: "İleride ilki sola olmak üzere birbirini takip eden tehlikeli virajlar olduğunu bildirir.",
    category: "tehlike",
    image: "/images/signs/Tehlike_T/t-2b.png"
  },
  {
    id: 5,
    title: "Tehlikeli Eğim (İniş)",
    description: "İleride araçların güvenli inişini zorlaştıracak derecede dik bir iniş eğimi olduğunu bildirir.",
    category: "tehlike",
    image: "/images/signs/Tehlike_T/t-3a.png"
  },
  {
    id: 6,
    title: "Tehlikeli Eğim (Çıkış)",
    description: "İleride dik bir çıkış eğimi olduğunu bildirir.",
    category: "tehlike",
    image: "/images/signs/Tehlike_T/t-3b.png"
  },
  {
    id: 7,
    title: "Her İki Yandan Daralan Kaplama",
    description: "İleride yolun her iki taraftan daralacağını bildirir.",
    category: "tehlike",
    image: "/images/signs/Tehlike_T/t-4a.png"
  },
  {
    id: 8,
    title: "Yaya Geçidi",
    description: "İleride yaya geçidi olduğunu bildirir. Yavaşlanmalı, yayalara ilk geçiş hakkı verilmelidir.",
    category: "tehlike",
    image: "/images/signs/Tehlike_T/t-11.png"
  },
  {
    id: 9,
    title: "Okul Geçidi",
    description: "İleride okul geçidi olduğunu bildirir. Çocukların yola çıkabileceği düşünülerek yavaşlanmalıdır.",
    category: "tehlike",
    image: "/images/signs/Tehlike_T/t-12.png"
  },
  {
    id: 10,
    title: "Kontrolsüz Kavşak",
    description: "İleride trafik işareti veya görevlisi bulunmayan bir kavşak olduğunu bildirir. Geçiş üstünlüğü kurallarına uyulmalıdır.",
    category: "tehlike",
    image: "/images/signs/Tehlike_T/t-21.png"
  },

  // Trafik Tanzim İşaretleri (Tanzim_TT)
  {
    id: 11,
    title: "Yol Ver",
    description: "Kavşaklarda ana yoldaki araçlara yol verilmesi gerektiğini belirtir.",
    category: "tanzim",
    image: "/images/signs/Tanzim_TT/tt-1.png"
  },
  {
    id: 12,
    title: "DUR",
    description: "Kavşağa girmeden önce mutlaka durulması ve yolun kontrol edilmesi gerektiğini belirtir.",
    category: "tanzim",
    image: "/images/signs/Tanzim_TT/tt-2.png"
  },
  {
    id: 13,
    title: "Girilmez",
    description: "Yolun bu yönde trafiğe kapalı olduğunu belirtir.",
    category: "tanzim",
    image: "/images/signs/Tanzim_TT/tt-3.png"
  },
  {
    id: 14,
    title: "Taşıt Trafiğine Kapalı Yol",
    description: "Yolun her iki yönde de taşıt trafiğine kapalı olduğunu belirtir.",
    category: "tanzim",
    image: "/images/signs/Tanzim_TT/tt-4.png"
  },
  {
    id: 15,
    title: "Motosiklet Hariç Motorlu Taşıt Trafiğine Kapalı Yol",
    description: "Motosiklet dışındaki motorlu taşıtların girmesinin yasak olduğunu belirtir.",
    category: "tanzim",
    image: "/images/signs/Tanzim_TT/tt-5.png"
  },
  {
    id: 16,
    title: "Hız Sınırlaması (50 km/s)",
    description: "Azami hızın saatte 50 kilometreyi geçemeyeceğini belirtir.",
    category: "tanzim",
    image: "/images/signs/Tanzim_TT/tt-29-50.png"
  },
  {
    id: 17,
    title: "Sağa Dönülmez",
    description: "Kavşakta sağa dönmenin yasak olduğunu belirtir.",
    category: "tanzim",
    image: "/images/signs/Tanzim_TT/tt-26a.png"
  },
  {
    id: 18,
    title: "Sola Dönülmez",
    description: "Kavşakta sola dönmenin yasak olduğunu belirtir.",
    category: "tanzim",
    image: "/images/signs/Tanzim_TT/tt-26b.png"
  },
  {
    id: 19,
    title: "U Dönüşü Yapılmaz",
    description: "İleriden veya kavşaktan geriye dönüşün yasak olduğunu belirtir.",
    category: "tanzim",
    image: "/images/signs/Tanzim_TT/tt-26c.png"
  },
  {
    id: 20,
    title: "Öndeki Taşıtı Geçmek Yasaktır",
    description: "Bu levhadan sonra öndeki taşıtın geçilmesinin yasak olduğunu belirtir.",
    category: "tanzim",
    image: "/images/signs/Tanzim_TT/tt-27.png"
  },

  // Bilgi İşaretleri (Bilgi_B)
  {
    id: 21,
    title: "İl Sınırı",
    description: "Bir ilin mülki sınırına girildiğini bildirir.",
    category: "bilgi",
    image: "/images/signs/Bilgi_B/b-1a.png"
  },
  {
    id: 22,
    title: "Meskun Mahal Başlangıcı",
    description: "Şehir veya kasaba gibi yerleşim yerlerine girildiğini bildirir.",
    category: "bilgi",
    image: "/images/signs/Bilgi_B/b-2a.png"
  },
  {
    id: 23,
    title: "Hastane",
    description: "Yakınlarda bir hastane olduğunu ve gürültü yapmamaya dikkat edilmesi gerektiğini bildirir.",
    category: "bilgi",
    image: "/images/signs/Bilgi_B/b-15.png"
  },
  {
    id: 24,
    title: "İlk Yardım",
    description: "Yakınlarda bir ilk yardım merkezi bulunduğunu bildirir.",
    category: "bilgi",
    image: "/images/signs/Bilgi_B/b-16.png"
  },
  {
    id: 25,
    title: "Tamirhane",
    description: "Yakınlarda araç tamirhanesi bulunduğunu bildirir.",
    category: "bilgi",
    image: "/images/signs/Bilgi_B/b-17.png"
  },
  {
    id: 26,
    title: "Akaryakıt İstasyonu",
    description: "Yakınlarda bir akaryakıt istasyonu bulunduğunu bildirir.",
    category: "bilgi",
    image: "/images/signs/Bilgi_B/b-19.png"
  },
  {
    id: 27,
    title: "Durak",
    description: "Kamu hizmeti yapan yolcu taşıtlarının durak yerlerini belirtir.",
    category: "bilgi",
    image: "/images/signs/Bilgi_B/b-22.png"
  },
  {
    id: 28,
    title: "Otoyol Başlangıcı",
    description: "Otoyolun başladığını ve otoyol kurallarının geçerli olduğunu bildirir.",
    category: "bilgi",
    image: "/images/signs/Bilgi_B/b-32.png"
  },

  // Durma ve Park Etme İşaretleri (Park_P)
  {
    id: 29,
    title: "Duraklamak ve Park Etmek Yasaktır",
    description: "Yolun bu kesiminde hem duraklamanın hem de park etmenin yasak olduğunu belirtir.",
    category: "durma",
    image: "/images/signs/Park_P/p-1.png"
  },
  {
    id: 30,
    title: "Park Etmek Yasaktır",
    description: "Yolun bu kesiminde park etmenin yasak olduğunu, ancak kısa süreli duraklamanın yapılabileceğini belirtir.",
    category: "durma",
    image: "/images/signs/Park_P/p-2.png"
  },
  {
    id: 31,
    title: "Park Yeri",
    description: "Taşıtların park edebileceği alanı belirtir.",
    category: "durma",
    image: "/images/signs/Park_P/p-3a.png"
  }
];

export const categories = [
  { id: "all", label: "Tümü" },
  { id: "tehlike", label: "Tehlike Uyarı İşaretleri" },
  { id: "tanzim", label: "Trafik Tanzim İşaretleri" },
  { id: "bilgi", label: "Bilgi İşaretleri" },
  { id: "durma", label: "Durma ve Park Etme İşaretleri" }
];
