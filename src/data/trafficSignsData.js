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
    title: 'Tehlikeli Çıkış Eğimi',
    description: 'İleride dik bir çıkış eğimi olduğunu bildirir. Araçların yeterli güçle tırmanması gerekir.',
  },
  'Tehlike_T/t-3b.png': {
    title: 'Tehlikeli İniş Eğimi',
    description: 'İleride dik bir iniş eğimi olduğunu bildirir. Hız kontrolüne ve fren kullanımına dikkat edilmelidir.',
  },
  'Tehlike_T/t-4a.png': {
    title: 'Her İki Yandan Daralan Kaplama',
    description: 'İleride yolun her iki taraftan daralacağını bildirir.',
  },
  'Tehlike_T/t-4b.png': {
    title: 'Sağdan Daralan Kaplama',
    description: 'Yolun sağ taraftan daralacağını bildirir.',
  },
  'Tehlike_T/t-4c.png': {
    title: 'Soldan Daralan Kaplama',
    description: 'Yolun sol taraftan daralacağını bildirir.',
  },
  'Tehlike_T/t-5.png': {
    title: 'Açılır Köprü',
    description: 'İleride açılır (çekilir) köprü bulunduğunu bildirir; köprü açık olabilir, geçişten önce kontrol ediniz.',
  },
  'Tehlike_T/t-6.png': {
    title: 'Rıhtım veya Su Kenarı',
    description: 'İleride yolun su kanalı veya rıhtım kenarında devam ettiğini ve araçların suya düşme tehlikesi bulunduğunu bildirir.',
  },
  'Tehlike_T/t-7.png': {
    title: 'Köprü',
    description: 'İleride köprü bulunduğunu bildirir. Köprü üzerinde hız sınırına ve yük sınırlamalarına uyulmalıdır.',
  },
  'Tehlike_T/t-8.png': {
    title: 'Yol Üzerinde Tümsek',
    description: 'Yolda yapay tümsek (hız kesici) bulunduğunu bildirir. Hız azaltılmalı ve tümsek yavaşça geçilmelidir.',
  },
  'Tehlike_T/t-9.png': {
    title: 'Gevşek Malzeme (Çakıl)',
    description: 'Yolda gevşek çakıl veya taş parçaları bulunduğunu bildirir; geçen araçlardan taş fırlayabilir, güvenli mesafe korunmalıdır.',
  },
  'Tehlike_T/t-10.png': {
    title: 'Buzlanma veya Kar Tehlikesi',
    description: 'Yolda buzlanma ya da kar olabileceğini bildirir; dikkatli olunmalıdır.',
  },
  'Tehlike_T/t-11.png': {
    title: 'Yaya Geçidi',
    description: 'İleride yaya geçidi olduğunu bildirir. Yavaşlanmalı, yayalara ilk geçiş hakkı verilmelidir.',
  },
  'Tehlike_T/t-12.png': {
    title: 'Okul Geçidi',
    description: 'İleride okul geçidi olduğunu bildirir. Çocukların yola çıkabileceği düşünülerek yavaşlanmalıdır.',
  },
  'Tehlike_T/t-13.png': {
    title: 'Bisiklet Geçebilir',
    description: 'Bisikletlilerin yola cikabilecegi yeri bildirir.',
  },
  'Tehlike_T/t-14a.png': {
    title: 'Ehli Hayvanlar Gecebilir',
    description: 'Ileride evcil veya suru hayvanlarinin yola cikabilecegini bildirir.',
  },
  'Tehlike_T/t-14b.png': {
    title: 'Vahsi Hayvanlar Gecebilir',
    description: 'Ileride vahsi hayvanlarin yola cikabilecegini bildirir.',
  },
  'Tehlike_T/t-15.png': {
    title: 'Yol Calismasi',
    description: 'Ileride yol calismasi oldugunu bildirir; hiz azaltilmali ve uyarilara uyulmalidír.',
  },
  'Tehlike_T/t-16.png': {
    title: 'Isikli Isaret Cihazi',
    description: 'Ileride trafik isigi bulundugunu bildirir.',
  },
  'Tehlike_T/t-17.png': {
    title: 'Alçak Uçuş veya Hava Alanı Yakını',
    description: 'Yakınlarda hava alanı veya alçak irtifada uçuş yapılan bir bölge olduğunu bildirir.',
  },
  'Tehlike_T/t-18.png': {
    title: 'Yan Rüzgar',
    description: 'İleride kuvvetli yan rüzgar tehlikesi olduğunu bildirir; araçların savrulmasına dikkat edilmelidir.',
  },
  'Tehlike_T/t-19.png': {
    title: 'İki Yönlü Trafik',
    description: 'İleride tek yönlü trafiğin sona erip iki yönlü trafiğe geçildiğini bildirir; karşıdan gelen araçlara dikkat edilmelidir.',
  },
  'Tehlike_T/t-20.png': {
    title: 'Diğer Tehlikeler',
    description: 'Yukarıdaki kategorilere girmeyen başka bir tehlikenin varlığını bildirir; ek levha veya tabelayla tehlikenin türü açıklanır.',
  },
  'Tehlike_T/t-21.png': {
    title: 'Kontrolsüz Kavşak',
    description: 'İleride trafik işareti veya görevlisi bulunmayan bir kavşak olduğunu bildirir. Geçiş üstünlüğü kurallarına uyulmalıdır.',
  },
  'Tehlike_T/t-22a.png': {
    title: 'Ana Yol - Tali Yol Kavsagi (Her Iki Yandan)',
    description: 'Ana yola her iki yandan tali yol baglantisi bulunan kavsaga yaklasildigi bildirilir.',
  },
  'Tehlike_T/t-22b.png': {
    title: 'Ana Yol - Tali Yol Kavsagi (Sagdan)',
    description: 'Ana yola sagdan tali yol baglantisi bulunan kavsaga yaklasildigi bildirilir.',
  },
  'Tehlike_T/t-22c.png': {
    title: 'Ana Yol - Tali Yol Kavsagi (Soldan)',
    description: 'Ana yola soldan tali yol baglantisi bulunan kavsaga yaklasildigi bildirilir.',
  },
  'Tehlike_T/t-22d.png': {
    title: 'Ana Yol - Yakın Aralıklı Tali Yol Kavşakları',
    description: 'İleride ana yola farklı seviyelerde sağdan ve soldan tali yol bağlantıları bulunan ardışık kavşaklara yaklaşıldığını bildirir.',
  },
  'Tehlike_T/t-22e.png': {
    title: 'T Kavsagi (Sola)',
    description: 'Ileride sola T kavsagi bulundugunu bildirir.',
  },
  'Tehlike_T/t-23a.png': {
    title: 'Hemzemin Gecit - Sagdan Tren',
    description: 'Ileride sagdan gelen trenin bulundugu hemzemin gecit oldugunu bildirir.',
  },
  'Tehlike_T/t-23b.png': {
    title: 'Hemzemin Gecit - Soldan Tren',
    description: 'Ileride soldan gelen trenin bulundugu hemzemin gecit oldugunu bildirir.',
  },
  'Tehlike_T/t-27a.png': {
    title: 'Demiryolu Gecidine 240 m',
    description: 'Demiryolu gecidine 240 metre mesafe kaldigini bildirir.',
  },
  'Tehlike_T/t-27b.png': {
    title: 'Demiryolu Gecidine 160 m',
    description: 'Demiryolu gecidine 160 metre mesafe kaldigini bildirir.',
  },
  'Tehlike_T/t-28a-b.png': {
    title: 'Demiryolu Gecidine 80 m',
    description: 'Demiryolu gecidine 80 metre mesafe kaldigini bildirir.',
  },
  'Tehlike_T/t-29a-b.png': {
    title: 'Tek Hatli Demiryolu Gecidi',
    description: 'Ileride tek hatli demiryolu gecidi oldugunu bildirir.',
  },
  'Tehlike_T/t-30a-b.png': {
    title: 'Cok Hatli Demiryolu Gecidi',
    description: 'Ileride cok hatli demiryolu gecidi oldugunu bildirir.',
  },
  'Tehlike_T/t-31a-b.png': {
    title: 'Tramvay Gecidi',
    description: 'Ileride tramvay gecidi oldugunu bildirir.',
  },
  'Tehlike_T/t-32.png': {
    title: 'Kuvvetli Yan Ruzgar',
    description: 'Ileride kuvvetli yan ruzgar tehlikesi oldugunu bildirir.',
  },
  'Tehlike_T/t-33a.png': {
    title: 'Iki Yonlu Trafik',
    description: 'Ileride tek serit yerine iki yonlu trafige gecildigini bildirir.',
  },
  'Tehlike_T/t-33b.png': {
    title: 'Trafik Sikisikligi',
    description: 'Ileride trafik sikisikligi olusabilecegini bildirir.',
  },
  'Tehlike_T/t-33d-e.png': {
    title: 'Yol Darligi',
    description: 'Ileride yolun darladigini bildirir.',
  },
  'Tehlike_T/t-33f.png': {
    title: 'Rampa Sonu',
    description: 'Cikis rampasinin sona erdigini bildirir.',
  },
  'Tehlike_T/t-34a-b.png': {
    title: 'Otoyol Birlesme Seridi',
    description: 'Otoyolda seritlerin birlesmekte oldugunu bildirir.',
  },
  'Tehlike_T/t-35.png': {
    title: 'Diger Tehlikeler',
    description: 'Yukarida belirtilmeyen farkli bir tehlike oldugunu bildirir.',
  },
  'Tehlike_T/t-36.png': {
    title: 'Engelli Yayalar',
    description: 'Yolda engelli yayalarin bulunabilecegini bildirir.',
  },
  'Tehlike_T/t-37.png': {
    title: 'Cocuk Oyun Alani',
    description: 'Yakinlarda cocuk oyun alani bulundugunu bildirir; dikkatli olunmalidir.',
  },
  'Tehlike_T/t-38.png': {
    title: 'Hastane Bolgesi',
    description: 'Yakinlarda hastane bulundugunu ve gurultu yapilmamasi gerektigini bildirir.',
  },
  'Tehlike_T/t-24.png': {
    title: 'Yaya Yolu Yakını',
    description: 'İleride yaya yolunun taşıt yoluyla kesiştiğini bildirir. Yayalara dikkat edilmelidir.',
  },
  'Tehlike_T/t-25.png': {
    title: 'Çocuklar',
    description: 'Yakınlarda okul, oyun alanı veya çocuk geçişi bulunduğunu bildirir. Özellikle yavaş ilerlenmesi gerekir.',
  },
  'Tehlike_T/t-26.png': {
    title: 'Engelli Geçişi',
    description: 'Bu bölgede engelli bireylerin yola çıkabileceğini bildirir. Hız azaltılmalı ve dikkatli olunmalıdır.',
  },
  'Tehlike_T/t-39.png': {
    title: 'Yangın Tehlikesi',
    description: 'Yakınlarda yangın tehlikesi olduğunu bildirir.',
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
  'Tanzim_TT/tt-6.png': {
    title: 'Motosiklet Haric Motorlu Tasit Trafiğine Kapali Yol',
    description: 'Motosiklet disindaki motorlu tasitlerin bu yola girmesi yasaktir.',
  },
  'Tanzim_TT/tt-7.png': {
    title: 'Motorlu Tasit Trafiğine Kapali Yol',
    description: 'Yol her iki yonde motorlu tasit trafiğine kapalidir.',
  },
  'Tanzim_TT/tt-8.png': {
    title: 'Kamyon Giremez',
    description: 'Kamyon ve agir tasitlerin bu yola girmesi yasaktir.',
  },
  'Tanzim_TT/tt-9.png': {
    title: 'Motorlu Bisiklet Giremez',
    description: 'Motorlu bisikletlerin bu yola girmesi yasaktir.',
  },
  'Tanzim_TT/tt-10a.png': {
    title: 'Azami Genislik Siniri',
    description: 'Belli genisligin uzerindeki tasitlerin gecisi yasaktir.',
  },
  'Tanzim_TT/tt-10b.png': {
    title: 'Azami Yukseklik Siniri',
    description: 'Belli yuksekliğin uzerindeki tasitlerin gecisi yasaktir.',
  },
  'Tanzim_TT/tt-11.png': {
    title: 'Azami Uzunluk Siniri',
    description: 'Belli uzunluğun uzerindeki tasitlerin gecisi yasaktir.',
  },
  'Tanzim_TT/tt-12.png': {
    title: 'Azami Agirlik Siniri',
    description: 'Belli agirlığin uzerindeki tasitlerin gecisi yasaktir.',
  },
  'Tanzim_TT/tt-13.png': {
    title: 'Azami Aks Agirliği Siniri',
    description: 'Belli aks agirlığinin uzerindeki tasitlerin gecisi yasaktir.',
  },
  'Tanzim_TT/tt-14.png': {
    title: 'Tehlikeli Madde Tasimak Yasaktir',
    description: 'Tehlikeli madde tasiyan tasitlerin bu yolu kullanmasi yasaktir.',
  },
  'Tanzim_TT/tt-15.png': {
    title: 'Patlayici Madde Tasimak Yasaktir',
    description: 'Patlayici madde tasiyan tasitlerin bu yolu kullanmasi yasaktir.',
  },
  'Tanzim_TT/tt-16a.png': {
    title: 'Mecburi Saga Don',
    description: 'Kavsaklarda saga donmek mecburidir.',
  },
  'Tanzim_TT/tt-16b.png': {
    title: 'Mecburi Sola Don',
    description: 'Kavsaklarda sola donmek mecburidir.',
  },
  'Tanzim_TT/tt-17.png': {
    title: 'Mecburi Ileri Git',
    description: 'Yolda sadece duz ilerlenmesi mecburidir.',
  },
  'Tanzim_TT/tt-18.png': {
    title: 'Mecburi Ileri veya Saga',
    description: 'Duz ileri veya saga donmek mecburidir.',
  },
  'Tanzim_TT/tt-19.png': {
    title: 'Mecburi Ileri veya Sola',
    description: 'Duz ileri veya sola donmek mecburidir.',
  },
  'Tanzim_TT/tt-20.png': {
    title: 'Sagdan Gecilecek',
    description: 'Engelin veya refujun saginden gecilmesi mecburidir.',
  },
  'Tanzim_TT/tt-21.png': {
    title: 'Soldan Gecilecek',
    description: 'Engelin veya refujun solundan gecilmesi mecburidir.',
  },
  'Tanzim_TT/tt-22.png': {
    title: 'Donel Kavsak',
    description: 'Donel kavsak isaretidir; ici doneli trafige gore hareket edilir.',
  },
  'Tanzim_TT/tt-23.png': {
    title: 'Yayalara Mahsus Yol',
    description: 'Bu yol sadece yayalarin kullanmasina ayrılmistir.',
  },
  'Tanzim_TT/tt-24.png': {
    title: 'Bisiklete Mahsus Yol',
    description: 'Bu yol sadece bisikletlilerin kullanmasina ayrılmistir.',
  },
  'Tanzim_TT/tt-25.png': {
    title: 'Ondeki Tasiti Yakindan Takip Etmek Yasaktir',
    description: 'Levhada belirtilen mesafeden daha yakin takip yapilamaz.',
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
  'Tanzim_TT/tt-28.png': {
    title: 'Kamyonlar Icin Ondeki Tasiti Gecmek Yasaktir',
    description: 'Kamyonlarin ondeki tasiti gecmesi yasaktir.',
  },
  'Tanzim_TT/tt-29-30.png': {
    title: 'Azami Hiz 30 km/s',
    description: 'Azami hizin saatte 30 kilometreyi gecemeyecegini belirtir.',
  },
  'Tanzim_TT/tt-29-40.png': {
    title: 'Azami Hiz 40 km/s',
    description: 'Azami hizin saatte 40 kilometreyi gecemeyecegini belirtir.',
  },
  'Tanzim_TT/tt-29-50.png': {
    title: 'Hız Sınırlaması (50 km/s)',
    description: 'Azami hızın saatte 50 kilometreyi geçemeyeceğini belirtir.',
  },
  'Tanzim_TT/tt-29-60.png': {
    title: 'Azami Hiz 60 km/s',
    description: 'Azami hizin saatte 60 kilometreyi gecemeyecegini belirtir.',
  },
  'Tanzim_TT/tt-29-70.png': {
    title: 'Azami Hiz 70 km/s',
    description: 'Azami hizin saatte 70 kilometreyi gecemeyecegini belirtir.',
  },
  'Tanzim_TT/tt-29-80.png': {
    title: 'Azami Hiz 80 km/s',
    description: 'Azami hizin saatte 80 kilometreyi gecemeyecegini belirtir.',
  },
  'Tanzim_TT/tt-29-90.png': {
    title: 'Azami Hiz 90 km/s',
    description: 'Azami hizin saatte 90 kilometreyi gecemeyecegini belirtir.',
  },
  'Tanzim_TT/tt-29-130.png': {
    title: 'Azami Hiz 130 km/s',
    description: 'Azami hizin saatte 130 kilometreyi gecemeyecegini belirtir.',
  },
  'Tanzim_TT/tt-29-140.png': {
    title: 'Azami Hiz 140 km/s',
    description: 'Azami hizin saatte 140 kilometreyi gecemeyecegini belirtir.',
  },
  'Tanzim_TT/tt-29b.png': {
    title: 'Asgari Hiz Siniri',
    description: 'Bu yolda en az belirtilen hizla gidilmesi zorunludur.',
  },
  'Tanzim_TT/tt-2a.png': {
    title: 'Girisi Olmayan Yol',
    description: 'Bu yonden arac girisinin yasak oldugunu ve yolun karsı yonden tek yonlu kullanilabilecegini belirtir.',
  },
  'Tanzim_TT/tt-30.png': {
    title: 'Azami Hiz Bolgesi Baslangiç',
    description: 'Hiz bölgesinin basladigini bildirir.',
  },
  'Tanzim_TT/tt-31.png': {
    title: 'Gecme Yasagi Sonu',
    description: 'Onceki gecme yasak bolgesinin sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-32.png': {
    title: 'Kamyonlar Icin Gecme Yasagi Sonu',
    description: 'Kamyonlara yonelik gecme yasak bolgesinin sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-33b.png': {
    title: 'Azami Hiz Bolgesi Sonu',
    description: 'Azami hiz bolge sinirlamasinin sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-33-30.png': {
    title: 'Azami Hiz Bolgesi 30 km/s Sonu',
    description: '30 km/s hiz sinirlamasi bolgesinin sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-33-40.png': {
    title: 'Azami Hiz Bolgesi 40 km/s Sonu',
    description: '40 km/s hiz sinirlamasi bolgesinin sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-33-50.png': {
    title: 'Azami Hiz Bolgesi 50 km/s Sonu',
    description: '50 km/s hiz sinirlamasi bolgesinin sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-33-60.png': {
    title: 'Azami Hiz Bolgesi 60 km/s Sonu',
    description: '60 km/s hiz sinirlamasi bolgesinin sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-33-70.png': {
    title: 'Azami Hiz Bolgesi 70 km/s Sonu',
    description: '70 km/s hiz sinirlamasi bolgesinin sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-33-80.png': {
    title: 'Azami Hiz Bolgesi 80 km/s Sonu',
    description: '80 km/s hiz sinirlamasi bolgesinin sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-33-90.png': {
    title: 'Azami Hiz Bolgesi 90 km/s Sonu',
    description: '90 km/s hiz sinirlamasi bolgesinin sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-34a.png': {
    title: 'Trafik Isiklari (Saga)',
    description: 'Sagdaki seride trafik isikli duzenleme uygulandigini belirtir.',
  },
  'Tanzim_TT/tt-34b.png': {
    title: 'Trafik Isiklari (Sola)',
    description: 'Soldaki seride trafik isikli duzenleme uygulandigini belirtir.',
  },
  'Tanzim_TT/tt-35a.png': {
    title: 'Yaya Bolgesi Baslangici',
    description: 'Yaya bolgesinin basladigini bildirir.',
  },
  'Tanzim_TT/tt-35b.png': {
    title: 'Yaya Bolgesi Sonu',
    description: 'Yaya bolgesinin sona erdigini bildirir.',
  },
  'Tanzim_TT/tt-35c.png': {
    title: 'Oyun Yolu Baslangici',
    description: 'Cocuklarin oyun oynayabilecegi oyun yolunun basladigini belirtir.',
  },
  'Tanzim_TT/tt-35d.png': {
    title: 'Oyun Yolu Sonu',
    description: 'Oyun yolunun sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-35e.png': {
    title: 'Konut Bolgesi Baslangici',
    description: 'Konut bolgesinin basladigini ve ilgili kurallarin gecerli olduğunu bildirir.',
  },
  'Tanzim_TT/tt-35f.png': {
    title: 'Konut Bolgesi Sonu',
    description: 'Konut bolgesinin sona erdigini bildirir.',
  },
  'Tanzim_TT/tt-35g.png': {
    title: 'Sehir Merkezi Baslangici',
    description: 'Sehir merkezi bolgesinin basladigini bildirir.',
  },
  'Tanzim_TT/tt-35h.png': {
    title: 'Sehir Merkezi Sonu',
    description: 'Sehir merkezi bolgesinin sona erdigini bildirir.',
  },
  'Tanzim_TT/tt-36a.png': {
    title: 'Tek Yon (Saga)',
    description: 'Yolun tek yonlu oldugunu ve saga dogru kullanilacagini belirtir.',
  },
  'Tanzim_TT/tt-36b.png': {
    title: 'Tek Yon (Sola)',
    description: 'Yolun tek yonlu oldugunu ve sola dogru kullanilacagini belirtir.',
  },
  'Tanzim_TT/tt-36c.png': {
    title: 'Tek Yon (Duz)',
    description: 'Yolun tek yonlu oldugunu ve duz ilerleneceğini belirtir.',
  },
  'Tanzim_TT/tt-37.png': {
    title: 'Bir Yon',
    description: 'Bu isaret bir yol basinda bulunur ve yolun tek yonlu oldugunu gosterir.',
  },
  'Tanzim_TT/tt-38a.png': {
    title: 'Otoyol Baslangici',
    description: 'Otoyolun basladigini ve otoyol kurallarinin gecerli oldugunu bildirir.',
  },
  'Tanzim_TT/tt-38b.png': {
    title: 'Otoyol Sonu',
    description: 'Otoyolun sona erdigini ve otoyol kurallarinin bittigini bildirir.',
  },
  'Tanzim_TT/tt-39a.png': {
    title: 'Ekspres Yol Baslangici',
    description: 'Ekspres yolun basladigini bildirir.',
  },
  'Tanzim_TT/tt-39b.png': {
    title: 'Ekspres Yol Sonu',
    description: 'Ekspres yolun sona erdigini bildirir.',
  },
  'Tanzim_TT/tt-40a.png': {
    title: 'Sinir Kapisina Giris',
    description: 'Sinir kapisina girisi bildirir.',
  },
  'Tanzim_TT/tt-40b.png': {
    title: 'Sinir Kapisi Sonu',
    description: 'Sinir kapisi alaninin sona erdigini bildirir.',
  },
  'Tanzim_TT/tt-41a-30.png': {
    title: 'Okul Bolgesi Hiz Siniri (30 km/s)',
    description: 'Okul bolgesinde azami hizin 30 km/s oldugunu bildirir.',
  },
  'Tanzim_TT/tt-41b-30.png': {
    title: 'Okul Bolgesi Hiz Siniri Sonu',
    description: 'Okul bolgesindeki hiz sinirlamasinin sona erdigini bildirir.',
  },
  'Tanzim_TT/tt-42a.png': {
    title: 'Yayalara Mahsus Yol Baslangici',
    description: 'Yayalara ozgu yolun basladigini belirtir.',
  },
  'Tanzim_TT/tt-42b.png': {
    title: 'Yayalara Mahsus Yol Sonu',
    description: 'Yayalara ozgu yolun sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-43.png': {
    title: 'Bisiklet Yolu Baslangici',
    description: 'Bisikletlilere ayrilan bisiklet yolunun basladigini belirtir.',
  },
  'Tanzim_TT/tt-43a.png': {
    title: 'Paylasimli Yaya-Bisiklet Yolu',
    description: 'Yaya ve bisikletlilerin paylasimli kullandigi yolu belirtir.',
  },
  'Tanzim_TT/tt-43b.png': {
    title: 'Ayri Yaya-Bisiklet Yolu',
    description: 'Yaya ve bisikletlilerin ayri seritlerde kullandigi yolu belirtir.',
  },
  'Tanzim_TT/tt-43c.png': {
    title: 'Bisiklet Yolu Sonu',
    description: 'Bisiklet yolunun sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-44a.png': {
    title: 'Bisiklet ve Yaya Yolu Baslangici',
    description: 'Bisiklet ve yaya yolunun birlikte basladigini belirtir.',
  },
  'Tanzim_TT/tt-44b.png': {
    title: 'Bisiklet ve Yaya Yolu Sonu',
    description: 'Bisiklet ve yaya yolunun sona erdigini belirtir.',
  },
  'Tanzim_TT/tt-45a.png': {
    title: 'Elektrikli Mikro Mobilite Yolu Baslangici',
    description: 'Elektrikli mikro mobilite araclarinin kullanabilecegi yolun basladigini belirtir.',
  },
  'Tanzim_TT/tt-45b.png': {
    title: 'Elektrikli Mikro Mobilite Yolu Sonu',
    description: 'Elektrikli mikro mobilite araclarinin kullanabilecegi yolun sona erdigini belirtir.',
  },
  'Bilgi_B/b-1a.png': {
    title: 'İl Sınırı',
    description: 'Bir ilin mülki sınırına girildiğini bildirir.',
  },
  'Bilgi_B/b-2a.png': {
    title: 'Meskun Mahal Başlangıcı',
    description: 'Şehir veya kasaba gibi yerleşim yerlerine girildiğini bildirir.',
  },
  'Bilgi_B/b-1b.png': {
    title: 'Il Siniri Sonu',
    description: 'Bir ilin mulki sinirinin bittigini bildirir.',
  },
  'Bilgi_B/b-1c.png': {
    title: 'Ilce Siniri',
    description: 'Bir ilcenin sinirına girildigini bildirir.',
  },
  'Bilgi_B/b-1d.png': {
    title: 'Ilce Siniri Sonu',
    description: 'Bir ilcenin sinirinin bittigini bildirir.',
  },
  'Bilgi_B/b-2b.png': {
    title: 'Meskun Mahal Bitis',
    description: 'Yerlesim yerinin sona erdigini bildirir.',
  },
  'Bilgi_B/b-2c.png': {
    title: 'Koy veya Belde Baslangici',
    description: 'Koy veya belde yerlesim alanina girildigini bildirir.',
  },
  'Bilgi_B/b-2d.png': {
    title: 'Koy veya Belde Bitis',
    description: 'Koy veya belde yerlesim alaninin sona erdigini bildirir.',
  },
  'Bilgi_B/b-3.png': {
    title: 'Otoban',
    description: 'Otoyol veya otoban girisini bildirir.',
  },
  'Bilgi_B/b-4.png': {
    title: 'Yol Numarasi',
    description: 'Bulunulan yolun numarasini gosterir.',
  },
  'Bilgi_B/b-5a.png': {
    title: 'Mesafe Gosterge Levhasi (Saga)',
    description: 'Sagdaki hedefe olan mesafeyi gosterir.',
  },
  'Bilgi_B/b-5b.png': {
    title: 'Mesafe Gosterge Levhasi (Sola)',
    description: 'Soldaki hedefe olan mesafeyi gosterir.',
  },
  'Bilgi_B/b-5c.png': {
    title: 'Mesafe Gosterge Levhasi (Duz)',
    description: 'Ilerideki hedefe olan mesafeyi gosterir.',
  },
  'Bilgi_B/b-5d.png': {
    title: 'Mesafe Gosterge Levhasi (Karma)',
    description: 'Birden fazla hedefe olan mesafeleri gosterir.',
  },
  'Bilgi_B/b-6a.png': {
    title: 'Yol Ayrimi On Uyari (Saga)',
    description: 'Ileride yolun saga ayrilacagini on bildirim olarak gosterir.',
  },
  'Bilgi_B/b-6b.png': {
    title: 'Yol Ayrimi On Uyari (Sola)',
    description: 'Ileride yolun sola ayrilacagini on bildirim olarak gosterir.',
  },
  'Bilgi_B/b-7.png': {
    title: 'Kavsakta Yol Tarifi',
    description: 'Kavsakta hangi yona gidilecegini gosterir.',
  },
  'Bilgi_B/b-8a.png': {
    title: 'Cikis Levhasi (Saga)',
    description: 'Saga cikis yolunu gosterir.',
  },
  'Bilgi_B/b-8b.png': {
    title: 'Cikis Levhasi (Sola)',
    description: 'Sola cikis yolunu gosterir.',
  },
  'Bilgi_B/b-8c.png': {
    title: 'Cikis Levhasi (Onceden)',
    description: 'Yaklasmakta olan cikis yolunu gosterir.',
  },
  'Bilgi_B/b-9.png': {
    title: 'Donel Kavsak Yol Tarifi',
    description: 'Donel kavsakta yon bilgisi verir.',
  },
  'Bilgi_B/b-10.png': {
    title: 'Trafik Lambasi Olmayan Kavsakta Yol Tarifi',
    description: 'Trafik lambasi bulunmayan kavsakta yol tarifi verir.',
  },
  'Bilgi_B/b-11a.png': {
    title: 'Yon Levhasi (Saga)',
    description: 'Belirtilen hedefe sagdan gidilecegini gosterir.',
  },
  'Bilgi_B/b-11b.png': {
    title: 'Yon Levhasi (Sola)',
    description: 'Belirtilen hedefe soldan gidilecegini gosterir.',
  },
  'Bilgi_B/b-11c.png': {
    title: 'Yon Levhasi (Ileri Saga)',
    description: 'Belirtilen hedefe ileri sagdan gidilecegini gosterir.',
  },
  'Bilgi_B/b-11d.png': {
    title: 'Yon Levhasi (Ileri Sola)',
    description: 'Belirtilen hedefe ileri soldan gidilecegini gosterir.',
  },
  'Bilgi_B/b-12a.png': {
    title: 'Servis Yolu Girisi (Saga)',
    description: 'Saga servis yoluna giris noktasini gosterir.',
  },
  'Bilgi_B/b-12b.png': {
    title: 'Servis Yolu Girisi (Sola)',
    description: 'Sola servis yoluna giris noktasini gosterir.',
  },
  'Bilgi_B/b-12c.png': {
    title: 'Servis Yolu Cikisi (Saga)',
    description: 'Saga servis yolundan cikis noktasini gosterir.',
  },
  'Bilgi_B/b-12d.png': {
    title: 'Servis Yolu Cikisi (Sola)',
    description: 'Sola servis yolundan cikis noktasini gosterir.',
  },
  'Bilgi_B/b-12e.png': {
    title: 'Servis Yolu Bilgi 1',
    description: 'Servis yoluna iliskin ek bilgi levhasidir.',
  },
  'Bilgi_B/b-12f.png': {
    title: 'Servis Yolu Bilgi 2',
    description: 'Servis yoluna iliskin ek bilgi levhasidir.',
  },
  'Bilgi_B/b-12g.png': {
    title: 'Servis Yolu Bilgi 3',
    description: 'Servis yoluna iliskin ek bilgi levhasidir.',
  },
  'Bilgi_B/b-12h.png': {
    title: 'Servis Yolu Bilgi 4',
    description: 'Servis yoluna iliskin ek bilgi levhasidir.',
  },
  'Bilgi_B/b-12i.png': {
    title: 'Servis Yolu Bilgi 5',
    description: 'Servis yoluna iliskin ek bilgi levhasidir.',
  },
  'Bilgi_B/b-13a.png': {
    title: 'Cikis Numarasi (Saga)',
    description: 'Saga cikis noktasinin numarasini gosterir.',
  },
  'Bilgi_B/b-13b.png': {
    title: 'Cikis Numarasi (Sola)',
    description: 'Sola cikis noktasinin numarasini gosterir.',
  },
  'Bilgi_B/b-14a.png': {
    title: 'Sapma Levhasi (Saga)',
    description: 'Sagda yol sapmasinin oldugunu bildirir.',
  },
  'Bilgi_B/b-14b.png': {
    title: 'Sapma Levhasi (Sola)',
    description: 'Solda yol sapmasinin oldugunu bildirir.',
  },
  'Bilgi_B/b-14c.png': {
    title: 'Sapma Levhasi (Ileri Saga)',
    description: 'Ileri sagda yol sapmasinin oldugunu bildirir.',
  },
  'Bilgi_B/b-14d.png': {
    title: 'Sapma Levhasi (Ileri Sola)',
    description: 'Ileri solda yol sapmasinin oldugunu bildirir.',
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
    title: 'Otoyol Sonu',
    description: 'Otoyolun sona erdiğini ve otoyol kurallarının bittiğini bildirir.',
  },
  'Bilgi_B/b-22.png': {
    title: 'Durak',
    description: 'Kamu hizmeti yapan yolcu taşıtlarının durak yerlerini belirtir.',
  },
  'Bilgi_B/b-16b.png': {
    title: 'Ilk Yardim Merkezi',
    description: 'Yakinlarda ilk yardim merkezi bulundugunu bildirir.',
  },
  'Bilgi_B/b-18.png': {
    title: 'Telefon',
    description: 'Yakinlarda telefon bulundugunu bildirir.',
  },
  'Bilgi_B/b-20.png': {
    title: 'Akaryakit Istasyonu',
    description: 'Yakinlarda akaryakit istasyonu bulundugunu bildirir.',
  },
  'Bilgi_B/b-21.png': {
    title: 'Motel veya Otel',
    description: 'Yakinlarda konaklama tesisi bulundugunu bildirir.',
  },
  'Bilgi_B/b-23.png': {
    title: 'Otopark',
    description: 'Yakinlarda otopark bulundugunu bildirir.',
  },
  'Bilgi_B/b-24.png': {
    title: 'Yaya Gecidi',
    description: 'Yakinlarda yaya gecidi bulundugunu bildirir.',
  },
  'Bilgi_B/b-25.png': {
    title: 'Bisiklet Gecidi',
    description: 'Yakinlarda bisiklet gecidi bulundugunu bildirir.',
  },
  'Bilgi_B/b-26.png': {
    title: 'Tren Istasyonu',
    description: 'Yakinlarda tren istasyonu bulundugunu bildirir.',
  },
  'Bilgi_B/b-27.png': {
    title: 'Havaalan',
    description: 'Yakinlarda havaalani bulundugunu bildirir.',
  },
  'Bilgi_B/b-28.png': {
    title: 'Liman',
    description: 'Yakinlarda deniz limani bulundugunu bildirir.',
  },
  'Bilgi_B/b-29.png': {
    title: 'Kamp Alani',
    description: 'Yakinlarda kamp alani bulundugunu bildirir.',
  },
  'Bilgi_B/b-30.png': {
    title: 'Karavan Alani',
    description: 'Yakinlarda karavan alani bulundugunu bildirir.',
  },
  'Bilgi_B/b-31.png': {
    title: 'Dinlenme Alani',
    description: 'Yakinlarda dinlenme alani bulundugunu bildirir.',
  },
  'Bilgi_B/b-32.png': {
    title: 'Otoyol Başlangıcı',
    description: 'Otoyolun başladığını ve otoyol kurallarının geçerli olduğunu bildirir.',
  },
  'Bilgi_B/b-33.png': {
    title: 'Turistik Yer',
    description: 'Yakinlarda turistik veya tarihi yer bulundugunu bildirir.',
  },
  'Bilgi_B/b-34.png': {
    title: 'Piknik Alani',
    description: 'Yakinlarda piknik alani bulundugunu bildirir.',
  },
  'Bilgi_B/b-35.png': {
    title: 'Spor Merkezi',
    description: 'Yakinlarda spor merkezi bulundugunu bildirir.',
  },
  'Bilgi_B/b-36.png': {
    title: 'Engelli Olanaklar',
    description: 'Engelli bireylere uygun tesislerin bulundugunu bildirir.',
  },
  'Bilgi_B/b-40.png': {
    title: 'Elektronik Hiz Denetimi',
    description: 'Bu bolgede elektronik hiz denetimi uygulandigini bildirir.',
  },
  'Bilgi_B/b-41.png': {
    title: 'Hiz Denetim Kamerasi',
    description: 'Yolda hiz kamerasi bulundugunu bildirir.',
  },
  'Bilgi_B/b-42.png': {
    title: 'Ortalama Hiz Denetimi',
    description: 'Bu bolgede ortalama hiz denetimi uygulandigini bildirir.',
  },
  'Bilgi_B/b-43.png': {
    title: 'Serit Kontrol Kamerasi',
    description: 'Yolda serit ihlali kamerasi bulundugunu bildirir.',
  },
  'Bilgi_B/b-44.png': {
    title: 'Kirmizi Isik Kamerasi',
    description: 'Kavsakta kirmizi isik ihlali kamerasi bulundugunu bildirir.',
  },
  'Bilgi_B/b-45a.png': {
    title: 'Yol Bilgi Paneli 1',
    description: 'Yol durumuyla ilgili bilgi levhasidir.',
  },
  'Bilgi_B/b-45b.png': {
    title: 'Yol Bilgi Paneli 2',
    description: 'Yol durumuyla ilgili bilgi levhasidir.',
  },
  'Bilgi_B/b-45c.png': {
    title: 'Yol Bilgi Paneli 3',
    description: 'Yol durumuyla ilgili bilgi levhasidir.',
  },
  'Bilgi_B/b-45d.png': {
    title: 'Yol Bilgi Paneli 4',
    description: 'Yol durumuyla ilgili bilgi levhasidir.',
  },
  'Bilgi_B/b-46.png': {
    title: 'Trafik Kamerasi',
    description: 'Yolda trafik izleme kamerasi bulundugunu bildirir.',
  },
  'Bilgi_B/b-47.png': {
    title: 'Elektronik Ucret Toplama',
    description: 'Bu noktada elektronik ucret toplama sistemi kullanildigini bildirir.',
  },
  'Bilgi_B/b-48.png': {
    title: 'Gecis Ucreti Gisesi',
    description: 'Ileride gecis ucreti odeme gisesi bulundugunu bildirir.',
  },
  'Bilgi_B/b-49.png': {
    title: 'Tasit Tartisi',
    description: 'Ileride tasit tartisi bulundugunu bildirir.',
  },
  'Bilgi_B/b-49b.png': {
    title: 'Tasit Tartisi Gecis',
    description: 'Tasit tartisi gecis bilgisini gosterir.',
  },
  'Bilgi_B/b-50a.png': {
    title: 'Trafik Sinyali Bilgisi 1',
    description: 'Trafik sinyal duzeniyle ilgili bilgi verir.',
  },
  'Bilgi_B/b-50b.png': {
    title: 'Trafik Sinyali Bilgisi 2',
    description: 'Trafik sinyal duzeniyle ilgili bilgi verir.',
  },
  'Bilgi_B/b-50c.png': {
    title: 'Trafik Sinyali Bilgisi 3',
    description: 'Trafik sinyal duzeniyle ilgili bilgi verir.',
  },
  'Bilgi_B/b-50d.png': {
    title: 'Trafik Sinyali Bilgisi 4',
    description: 'Trafik sinyal duzeniyle ilgili bilgi verir.',
  },
  'Bilgi_B/b-50e.png': {
    title: 'Trafik Sinyali Bilgisi 5',
    description: 'Trafik sinyal duzeniyle ilgili bilgi verir.',
  },
  'Bilgi_B/b-50f.png': {
    title: 'Trafik Sinyali Bilgisi 6',
    description: 'Trafik sinyal duzeniyle ilgili bilgi verir.',
  },
  'Bilgi_B/b-51a.png': {
    title: 'Serit Bilgi Levhasi 1',
    description: 'Serit duzeniyle ilgili bilgi verir.',
  },
  'Bilgi_B/b-51b.png': {
    title: 'Serit Bilgi Levhasi 2',
    description: 'Serit duzeniyle ilgili bilgi verir.',
  },
  'Bilgi_B/b-51c.png': {
    title: 'Serit Bilgi Levhasi 3',
    description: 'Serit duzeniyle ilgili bilgi verir.',
  },
  'Bilgi_B/b-51d.png': {
    title: 'Serit Bilgi Levhasi 4',
    description: 'Serit duzeniyle ilgili bilgi verir.',
  },
  'Bilgi_B/b-52.png': {
    title: 'Serit Azalma',
    description: 'Ileride serit sayisinin azaladigini bildirir.',
  },
  'Bilgi_B/b-52b.png': {
    title: 'Serit Azalma (Sola)',
    description: 'Solda serit sayisinin azaladigini bildirir.',
  },
  'Bilgi_B/b-53a.png': {
    title: 'Serit Kapatma 1',
    description: 'Bir seridin kapandigini bildirir.',
  },
  'Bilgi_B/b-53b.png': {
    title: 'Serit Kapatma 2',
    description: 'Iki seridin kapandigini bildirir.',
  },
  'Bilgi_B/b-53c.png': {
    title: 'Serit Kapatma 3',
    description: 'Uc seridin kapandigini bildirir.',
  },
  'Bilgi_B/b-54.png': {
    title: 'Ters Serit Uyarisi',
    description: 'Karsidan gelen trafige dikkat edilmesi gereken ters seridin oldugunu bildirir.',
  },
  'Bilgi_B/b-55a.png': {
    title: 'Acil Durak Sahasi (Saga)',
    description: 'Sagda acil durak sahasi bulundugunu bildirir.',
  },
  'Bilgi_B/b-55b.png': {
    title: 'Acil Durak Sahasi (Sola)',
    description: 'Solda acil durak sahasi bulundugunu bildirir.',
  },
  'Bilgi_B/b-55c.png': {
    title: 'Acil Durak Sahasi Baslangici',
    description: 'Acil durak sahasinin basladigini bildirir.',
  },
  'Bilgi_B/b-55d.png': {
    title: 'Acil Durak Sahasi Sonu',
    description: 'Acil durak sahasinin sona erdigini bildirir.',
  },
  'Bilgi_B/b-55e.png': {
    title: 'Acil Durak Sahasi Bilgi',
    description: 'Acil durak sahasina iliskin bilgi verir.',
  },
  'Bilgi_B/b-56.png': {
    title: 'Tomruk Yolu',
    description: 'Yakinlarda orman veya tomruk yolu bulundugunu bildirir.',
  },
  'Bilgi_B/b-57.png': {
    title: 'Gumruk',
    description: 'Ileride gumruk kapisi bulundugunu bildirir.',
  },
  'Bilgi_B/b-58a.png': {
    title: 'Ulke Siniri (Giris)',
    description: 'Ulke siniri girisini bildirir.',
  },
  'Bilgi_B/b-58b.png': {
    title: 'Ulke Siniri (Cikis)',
    description: 'Ulke siniri cikisini bildirir.',
  },
  'Bilgi_B/b-59.png': {
    title: 'Yabanci Plaka Kontrol',
    description: 'Yabanci plakalı tasitlerin kontrol noktasini bildirir.',
  },
  'Bilgi_B/b-60.png': {
    title: 'Serit Kullanim Bilgisi',
    description: 'Hangi araclarin hangi seridi kullanabilecegini gosterir.',
  },
  'Bilgi_B/b-61a.png': {
    title: 'Yol Numarasi Levhasi 1',
    description: 'Yol veya otoban numarasini gosterir.',
  },
  'Bilgi_B/b-61b.png': {
    title: 'Yol Numarasi Levhasi 2',
    description: 'Yol veya otoban numarasini gosterir.',
  },
  'Bilgi_B/b-61c.png': {
    title: 'Yol Numarasi Levhasi 3',
    description: 'Yol veya otoban numarasini gosterir.',
  },
  'Bilgi_B/b-61d.png': {
    title: 'Yol Numarasi Levhasi 4',
    description: 'Yol veya otoban numarasini gosterir.',
  },
  'Bilgi_B/b-61e.png': {
    title: 'Yol Numarasi Levhasi 5',
    description: 'Yol veya otoban numarasini gosterir.',
  },
  'Bilgi_B/b-61f.png': {
    title: 'Yol Numarasi Levhasi 6',
    description: 'Yol veya otoban numarasini gosterir.',
  },
  'Bilgi_B/b-61g.png': {
    title: 'Yol Numarasi Levhasi 7',
    description: 'Yol veya otoban numarasini gosterir.',
  },
  'Bilgi_B/b-62.png': {
    title: 'Kuzey Yonu',
    description: 'Kuzey yonunu gosterir.',
  },
  'Bilgi_B/b-63a.png': {
    title: 'Acil Yardim Noktasi 1',
    description: 'Yakinlarda acil yardim noktasi bulundugunu bildirir.',
  },
  'Bilgi_B/b-63b.png': {
    title: 'Acil Yardim Noktasi 2',
    description: 'Yakinlarda acil yardim noktasi bulundugunu bildirir.',
  },
  'Bilgi_B/b-63c.png': {
    title: 'Acil Yardim Noktasi 3',
    description: 'Yakinlarda acil yardim noktasi bulundugunu bildirir.',
  },
  'Bilgi_B/b-63d.png': {
    title: 'Acil Yardim Noktasi 4',
    description: 'Yakinlarda acil yardim noktasi bulundugunu bildirir.',
  },
  'Bilgi_B/b-64.png': {
    title: 'Genel Bilgi Levhasi',
    description: 'Suruculere genel bilgi veren levhadir.',
  },
  'Bilgi_B/b-37.png': {
    title: 'Trafik Tanzim Levhasi B-37',
    description: 'Tanzim amacli bilgi levhasidir.',
  },
  'Bilgi_B/b-38.png': {
    title: 'Trafik Tanzim Levhasi B-38',
    description: 'Tanzim amacli bilgi levhasidir.',
  },
  'Bilgi_B/b-39.png': {
    title: 'Trafik Tanzim Levhasi B-39',
    description: 'Tanzim amacli bilgi levhasidir.',
  },
  'Bilgi_B/b-14e.png': {
    title: 'Sapma Levhasi (Ek 1)',
    description: 'Yol sapmasina iliskin ek bilgi levhasidir.',
  },
  'Bilgi_B/b-14f.png': {
    title: 'Sapma Levhasi (Ek 2)',
    description: 'Yol sapmasina iliskin ek bilgi levhasidir.',
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
  'Park_P/p-3b.png': {
    title: 'Park Yeri (Sağ Taraf)',
    description: 'Yolun sağ tarafında park yapılabileceğini belirtir.',
  },
  'Park_P/p-3c.png': {
    title: 'Park Yeri (Sol Taraf)',
    description: 'Yolun sol tarafında park yapılabileceğini belirtir.',
  },
  'Park_P/p-3d.png': {
    title: 'Park Yeri (Her İki Taraf)',
    description: 'Yolun her iki tarafında park yapılabileceğini belirtir.',
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
      image: `trafik-levhalari/${imageKey}`,
      code,
      library: 'traffic',
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
