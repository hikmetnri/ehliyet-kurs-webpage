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
  'Bilgi_B/b-10.png': {
    title: 'Meskun Mahal Sonu Levhası (B-10)',
    description: 'Meskun mahal sonu levhası, yerleşim yerinin bittiğini ve buradan itibaren şehir içi trafik kurallarının yerini şehirler arası kurallara bıraktığını bildirir. Meskun mahal içindeki hız sınırı ve diğer kısıtlamalar bu noktadan sonra sona erer.',
  },
  'Bilgi_B/b-11a.png': {
    title: 'Coğrafi Bilgi Levhası - Dağ Geçidi (B-11a)',
    description: 'Coğrafi bilgi levhası, yol güzergahındaki coğrafi özellikleri (dağ geçidi, rakım vb.) sürücülere bildirir. Bu örnekte dağ geçidi bilgisi ve rakım yüksekliği gösterilmektedir.',
  },
  'Bilgi_B/b-11b.png': {
    title: 'Coğrafi Bilgi Levhası - Nehir (B-11b)',
    description: 'Coğrafi bilgi levhası, yol güzergahındaki coğrafi özellikleri (nehir, göl, dağ vb.) sürücülere bildirir. Bu örnekte nehir bilgisi gösterilmektedir.',
  },
  'Bilgi_B/b-11c.png': {
    title: 'Coğrafi Bilgi Levhası - Dağ (B-11c)',
    description: 'Coğrafi bilgi levhası, yol güzergahındaki coğrafi özellikleri sürücülere bildirir. Bu örnekte dağ bilgisi gösterilmektedir.',
  },
  'Bilgi_B/b-11d.png': {
    title: 'Coğrafi Bilgi Levhası - Göl (B-11d)',
    description: 'Coğrafi bilgi levhası, yol güzergahındaki coğrafi özellikleri sürücülere bildirir. Bu örnekte göl bilgisi gösterilmektedir.',
  },
  'Bilgi_B/b-12a.png': {
    title: 'Karayolları Teşkilatına Ait Bilgi Levhası (B-12a)',
    description: 'Karayolları teşkilatına ait bilgi levhası, Karayolları Genel Müdürlüğünün bölge ve şube teşkilatlarını sürücülere tanıtır. Yol güzergahında karayollarına ait tesis ve birimlere yönlendirme yapar.',
  },
  'Bilgi_B/b-12b.png': {
    title: 'Karayolları Teşkilatına Ait Bilgi Levhası (B-12b)',
    description: 'Karayolları teşkilatına ait bilgi levhası, Karayolları Genel Müdürlüğünün bölge ve şube teşkilatlarını sürücülere tanıtır. Yol güzergahında karayollarına ait tesis ve birimlere yönlendirme yapar.',
  },
  'Bilgi_B/b-12c.png': {
    title: 'Karayolları Teşkilatına Ait Bilgi Levhası (B-12c)',
    description: 'Karayolları teşkilatına ait bilgi levhası, Karayolları Genel Müdürlüğünün bölge ve şube teşkilatlarını sürücülere tanıtır. Yol güzergahında karayollarına ait tesis ve birimlere yönlendirme yapar.',
  },
  'Bilgi_B/b-12d.png': {
    title: 'Karayolları Teşkilatına Ait Bilgi Levhası (B-12d)',
    description: 'Karayolları teşkilatına ait bilgi levhası, Karayolları Genel Müdürlüğünün bölge ve şube teşkilatlarını sürücülere tanıtır. Yol güzergahında karayollarına ait tesis ve birimlere yönlendirme yapar.',
  },
  'Bilgi_B/b-12e.png': {
    title: 'Karayolları Teşkilatına Ait Bilgi Levhası (B-12e)',
    description: 'Karayolları teşkilatına ait bilgi levhası, Karayolları Genel Müdürlüğünün bölge ve şube teşkilatlarını sürücülere tanıtır. Yol güzergahında karayollarına ait tesis ve birimlere yönlendirme yapar.',
  },
  'Bilgi_B/b-12f.png': {
    title: 'Karayolları Teşkilatına Ait Bilgi Levhası (B-12f)',
    description: 'Karayolları teşkilatına ait bilgi levhası, Karayolları Genel Müdürlüğünün bölge ve şube teşkilatlarını sürücülere tanıtır. Yol güzergahında karayollarına ait tesis ve birimlere yönlendirme yapar.',
  },
  'Bilgi_B/b-12g.png': {
    title: 'Karayolları Teşkilatına Ait Bilgi Levhası (B-12g)',
    description: 'Karayolları teşkilatına ait bilgi levhası, Karayolları Genel Müdürlüğünün bölge ve şube teşkilatlarını sürücülere tanıtır. Yol güzergahında karayollarına ait tesis ve birimlere yönlendirme yapar.',
  },
  'Bilgi_B/b-12h.png': {
    title: 'Karayolları Teşkilatına Ait Bilgi Levhası (B-12h)',
    description: 'Karayolları teşkilatına ait bilgi levhası, Karayolları Genel Müdürlüğünün bölge ve şube teşkilatlarını sürücülere tanıtır. Yol güzergahında karayollarına ait tesis ve birimlere yönlendirme yapar.',
  },
  'Bilgi_B/b-12i.png': {
    title: 'Karayolları Teşkilatına Ait Bilgi Levhası (B-12i)',
    description: 'Karayolları teşkilatına ait bilgi levhası, Karayolları Genel Müdürlüğünün bölge ve şube teşkilatlarını sürücülere tanıtır. Yol güzergahında karayollarına ait tesis ve birimlere yönlendirme yapar.',
  },
  'Bilgi_B/b-13a.png': {
    title: 'Meskun Mahal ve Kavşak Çıkışı Mesafe Levhası (B-13a)',
    description: 'Meskun mahal ve kavşak çıkışı mesafe levhası, yerleşim yerlerine ve kavşaklara kalan mesafeyi sürücülere bildirir. Sürücüler bu levha sayesinde gidecekleri yere ne kadar uzaklıkta olduklarını öğrenir.',
  },
  'Bilgi_B/b-13b.png': {
    title: 'Mesafe Levhası (B-13b)',
    description: 'Mesafe levhası, belirtilen yerleşim yerlerine veya önemli noktalara kalan mesafeyi sürücülere bildirir. Sürücüler gidecekleri yön ve mesafe hakkında bilgi sahibi olur.',
  },
  'Bilgi_B/b-14a.png': {
    title: 'Yaya Geçidi (B-14a)',
    description: 'Yaya geçidi levhası, yayaların karşıdan karşıya geçebileceği güvenli geçiş noktasını gösterir. Sürücüler bu noktaya yaklaşırken hızlarını azaltmalı ve yayalara yol vermelidir.',
  },
  'Bilgi_B/b-14b.png': {
    title: 'Okul Geçidi (B-14b)',
    description: 'Okul geçidi levhası, okul öğrencilerinin karşıdan karşıya geçtiği güvenli geçiş noktasını gösterir. Sürücüler okul geçidine yaklaşırken çok dikkatli olmalı, hızlarını azaltmalı ve öğrencilere yol vermelidir.',
  },
  'Bilgi_B/b-14c.png': {
    title: 'Yaya Bölgesi (B-14c)',
    description: 'Yaya bölgesi levhası, belirtilen alanın yayalara ayrılmış olduğunu ve bu bölgede yayaların öncelikli olduğunu gösterir. Sürücüler bu bölgede yayalara karşı azami dikkat göstermelidir.',
  },
  'Bilgi_B/b-14d.png': {
    title: 'Yaya Bölgesi (B-14d)',
    description: 'Yaya bölgesi levhası, belirtilen alanın yayalara ayrılmış olduğunu ve bu bölgede yayaların öncelikli olduğunu gösterir. Sürücüler bu bölgede yayalara karşı azami dikkat göstermelidir.',
  },
  'Bilgi_B/b-15.png': {
    title: 'Hastane (B-15)',
    description: 'Hastane levhası, yol güzergahında bir hastanenin bulunduğunu ve hastaneye gidiş yönünü gösterir. Acil durumlarda en yakın hastaneye ulaşmak için bu levhaları takip etmek gerekir.',
  },
  'Bilgi_B/b-16.png': {
    title: 'Tek Yön (B-16)',
    description: 'Tek yön levhası, üzerinde bulunduğu yolun sadece gösterilen yönde tek yönlü trafiğe açık olduğunu bildirir. Sürücüler bu yola ters yönden giremez.',
  },
  'Bilgi_B/b-16b.png': {
    title: 'İleri Tek Yönlü Yol (B-16b)',
    description: 'İleri tek yönlü yol levhası, ilerideki yolun tek yönlü olduğunu ve trafiğin sadece belirtilen yönde akacağını önceden bildirir.',
  },
  'Bilgi_B/b-17.png': {
    title: 'İleri Çıkmaz Yol (B-17)',
    description: 'İleri çıkmaz yol levhası, ilerideki yolun çıkmaz bir yol olduğunu ve sonunun olmadığını sürücülere önceden bildirir. Bu yola giren araçlar geri dönmek zorunda kalabilir.',
  },
  'Bilgi_B/b-18.png': {
    title: 'Otoyol Başlangıcı (B-18)',
    description: 'Otoyol başlangıcı levhası, otoyolun başladığını bildirir. Bu noktadan itibaren otoyol kuralları geçerlidir: yaya ve bisiklet girişi yasaktır, geri dönüş yapılamaz, asgari hız sınırı uygulanır.',
  },
  'Bilgi_B/b-19.png': {
    title: 'Otoyol Sonu (B-19)',
    description: 'Otoyol sonu levhası, otoyolun bittiğini ve bu noktadan itibaren normal yol kurallarının geçerli olduğunu bildirir.',
  },
  'Bilgi_B/b-1a.png': {
    title: 'Kavşak Öncesi Yön Levhası (B-1a)',
    description: 'Kavşak öncesi yön levhası, ilerideki kavşaktan gidilebilecek yerleri ve yönleri önceden gösterir. Sürücüler kavşağa gelmeden şerit seçimini bu levhaya göre yapmalıdır.',
  },
  'Bilgi_B/b-1b.png': {
    title: 'Yön Levhası (B-1b)',
    description: 'Yön levhası, belirtilen yerleşim yerlerine veya tesislere gidiş yönünü gösterir. Sürücüler gidecekleri yöne göre levhayı takip eder.',
  },
  'Bilgi_B/b-1c.png': {
    title: 'Kaplama Üstü Yön Levhası (B-1c)',
    description: 'Kaplama üstü yön levhası, yol kaplaması üzerinde gidilecek yönleri gösterir. Sürücülere gidecekleri yerin hangi şeritten gidileceğini bildirir.',
  },
  'Bilgi_B/b-1d.png': {
    title: 'Otoyol Çıkış Bildirim/Yön Levhası (B-1d)',
    description: 'Otoyol çıkış bildirim/yön levhası, otoyoldan çıkış yapacak sürücülere çıkış yönünü ve gidilecek yerleri gösterir. Sürücüler çıkışa uygun şeride zamanında geçmelidir.',
  },
  'Bilgi_B/b-20.png': {
    title: 'Motorlu Taşıt Yolu Başlangıcı (B-20)',
    description: 'Motorlu taşıt yolu başlangıcı levhası, motorlu taşıt yolunun başladığını bildirir. Bu yolda yaya, bisiklet ve motorlu olmayan taşıtların girmesi yasaktır.',
  },
  'Bilgi_B/b-21.png': {
    title: 'Motorlu Taşıt Yolu Sonu (B-21)',
    description: 'Motorlu taşıt yolu sonu levhası, motorlu taşıt yolunun bittiğini bildirir. Bu noktadan itibaren diğer taşıt ve yayaların yola girebileceği normal kurallar geçerli olur.',
  },
  'Bilgi_B/b-22.png': {
    title: 'Durak (B-22)',
    description: 'Durak levhası, toplu taşıma araçlarının (otobüs, minibüs vb.) yolcu indirip bindirdiği durağı gösterir. Sürücüler durak yakınında dikkatli olmalı ve duraklayan toplu taşıma araçlarına yol vermelidir.',
  },
  'Bilgi_B/b-23.png': {
    title: 'İlk Yardım (B-23)',
    description: 'İlk yardım levhası, yol güzergahında ilk yardım hizmeti veren sağlık tesisini gösterir. Acil durumlarda ilk yardım noktasına ulaşmak için bu levha takip edilir.',
  },
  'Bilgi_B/b-24.png': {
    title: 'Tamirhane (B-24)',
    description: 'Tamirhane levhası, yol güzergahında araç tamir hizmeti veren bir tamirhanenin bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-25.png': {
    title: 'Telefon (B-25)',
    description: 'Telefon levhası, yol güzergahında bir telefonun bulunduğunu gösterir. Acil durumlarda haberleşme için bu nokta kullanılabilir.',
  },
  'Bilgi_B/b-26.png': {
    title: 'Akaryakıt İstasyonu (B-26)',
    description: 'Akaryakıt istasyonu levhası, yol güzergahında bir akaryakıt istasyonunun bulunduğunu ve yönünü gösterir. Yakıtı azalan sürücüler bu levhayı takip ederek istasyona ulaşabilir.',
  },
  'Bilgi_B/b-27.png': {
    title: 'Otel veya Motel (B-27)',
    description: 'Otel veya motel levhası, yol güzergahında konaklama imkanı sunan otel veya motelin bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-28.png': {
    title: 'Lokanta (B-28)',
    description: 'Lokanta levhası, yol güzergahında yemek yeme imkanı sunan bir lokantanın bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-29.png': {
    title: 'Çayhane veya Kafeterya (B-29)',
    description: 'Çayhane veya kafeterya levhası, yol güzergahında içecek ve ikram hizmeti sunan bir çayhane veya kafeteryanın bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-2a.png': {
    title: 'Girişi Olmayan Yol Kavşağı (B-2a)',
    description: 'Girişi olmayan yol kavşağı levhası, ilerideki kavşakta girişi olmayan (kapalı) bir yol bulunduğunu gösterir. Sürücüler bu yola giremez.',
  },
  'Bilgi_B/b-2b.png': {
    title: 'Girişi Olmayan Yol Kavşağı (B-2b)',
    description: 'Girişi olmayan yol kavşağı levhası, ilerideki kavşakta girişi olmayan (kapalı) bir yol bulunduğunu gösterir. Sürücüler bu yola giremez.',
  },
  'Bilgi_B/b-2c.png': {
    title: 'Girişi Olmayan Yol Kavşağı (B-2c)',
    description: 'Girişi olmayan yol kavşağı levhası, ilerideki kavşakta girişi olmayan (kapalı) bir yol bulunduğunu gösterir. Sürücüler bu yola giremez.',
  },
  'Bilgi_B/b-2d.png': {
    title: 'Girişi Olmayan Yol Kavşağı (B-2d)',
    description: 'Girişi olmayan yol kavşağı levhası, ilerideki kavşakta girişi olmayan (kapalı) bir yol bulunduğunu gösterir. Sürücüler bu yola giremez.',
  },
  'Bilgi_B/b-3.png': {
    title: 'İleriki Kavşakta Sola Dönüş Yasağını Gösteren İşaret Levhası (B-3)',
    description: 'İleriki kavşakta sola dönüş yasağını gösteren işaret levhası, ilerideki kavşaktan sola dönüşün yasak olduğunu önceden bildirir. Sürücüler sağa veya ileri yönde devam etmelidir.',
  },
  'Bilgi_B/b-30.png': {
    title: 'Çeşme (B-30)',
    description: 'Çeşme levhası, yol güzergahında bir çeşmenin bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-31.png': {
    title: 'Piknik Yeri (B-31)',
    description: 'Piknik yeri levhası, yol güzergahında piknik yapmaya ayrılmış bir alanın bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-32.png': {
    title: 'Yürüyüş Başlangıcı (B-32)',
    description: 'Yürüyüş başlangıcı levhası, doğa yürüyüşü parkurunun başladığını gösterir.',
  },
  'Bilgi_B/b-33.png': {
    title: 'Kamp Yeri (B-33)',
    description: 'Kamp yeri levhası, yol güzergahında kamp yapmaya ayrılmış bir alanın bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-34.png': {
    title: 'Karavanlı Kamp Yeri (B-34)',
    description: 'Karavanlı kamp yeri levhası, yol güzergahında karavanlarla kamp yapılabilecek bir alanın bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-35.png': {
    title: 'Çadırlı ve Karavanlı Kamp Yeri (B-35)',
    description: 'Çadırlı ve karavanlı kamp yeri levhası, yol güzergahında hem çadır hem karavanla kamp yapılabilecek bir alanın bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-36.png': {
    title: 'Gençlik Kampı (B-36)',
    description: 'Gençlik kampı levhası, yol güzergahında bir gençlik kampının bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-4.png': {
    title: 'Kavşak Öncesi Şerit Seçimi Levhası (B-4)',
    description: 'Kavşak öncesi şerit seçimi levhası, kavşaktan gidilecek yönlere göre hangi şeridin kullanılacağını gösterir. Sürücüler kavşağa gelmeden uygun şeride geçmelidir.',
  },
  'Bilgi_B/b-40.png': {
    title: 'Jandarma (B-40)',
    description: 'Jandarma levhası, yol güzergahında bir jandarma karakolunun bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-41.png': {
    title: 'Polis (B-41)',
    description: 'Polis levhası, yol güzergahında bir polis karakolunun bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-42.png': {
    title: 'Yangın Tehlikesi (B-42)',
    description: 'Yangın tehlikesi levhası, yol güzergahında yangın çıkma ihtimali olan ormanlık bölgeleri ve yangın tehlikesini bildirir. Sürücüler bu bölgelerde yanıcı madde atmamalı ve dikkatli olmalıdır.',
  },
  'Bilgi_B/b-43.png': {
    title: 'Radyo (B-43)',
    description: 'Radyo levhası, yol güzergahında trafik ve yol durumu hakkında bilgi veren radyo yayınını (frekansını) gösterir. Sürücüler bu frekanstan yol bilgilerini takip edebilir.',
  },
  'Bilgi_B/b-44.png': {
    title: 'Turizm Danışma (B-44)',
    description: 'Turizm danışma levhası, yol güzergahında turistlere bilgi veren turizm danışma bürosunun bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-45a.png': {
    title: 'Alt Geçit (B-45a)',
    description: 'Alt geçit levhası, yayaların karşıdan karşıya güvenle geçebilmesi için yolun altından geçen yaya alt geçidini gösterir.',
  },
  'Bilgi_B/b-45b.png': {
    title: 'Üst Geçit (B-45b)',
    description: 'Üst geçit levhası, yayaların karşıdan karşıya güvenle geçebilmesi için yolun üzerinden geçen yaya üst geçidini gösterir.',
  },
  'Bilgi_B/b-45c.png': {
    title: 'Rampalı Yaya Üst Geçidi (B-45c)',
    description: 'Rampalı yaya üst geçidi levhası, tekerlekli sandalye ve bebek arabası kullanıcılarının da kullanabileceği rampalı yaya üst geçidini gösterir.',
  },
  'Bilgi_B/b-45d.png': {
    title: 'Rampalı Yaya Alt Geçidi (B-45d)',
    description: 'Rampalı yaya alt geçidi levhası, tekerlekli sandalye ve bebek arabası kullanıcılarının da kullanabileceği rampalı yaya alt geçidini gösterir.',
  },
  'Bilgi_B/b-46.png': {
    title: 'Yüzme Yeri (B-46)',
    description: 'Yüzme yeri levhası, yol güzergahında yüzmeye ayrılmış güvenli bir yüzme alanının bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-47.png': {
    title: 'Yüzülmez (B-47)',
    description: 'Yüzülmez levhası, belirtilen su alanında yüzmenin tehlikeli ve yasak olduğunu bildirir.',
  },
  'Bilgi_B/b-48.png': {
    title: 'Bölünmüş Yol Öncesi Yol Levhası (B-48)',
    description: 'Bölünmüş yol öncesi yol levhası, ileride bölünmüş yolun başlayacağını ve trafiğin ayrı yönlerde aktığını bildirir.',
  },
  'Bilgi_B/b-49.png': {
    title: 'Tünel (B-49)',
    description: 'Tünel levhası, yol güzergahında bir tünelin bulunduğunu bildirir. Sürücüler tünelde farlarını yakmalı ve hız sınırına uymalıdır.',
  },
  'Bilgi_B/b-49b.png': {
    title: 'Su Altı Tüneli (B-49b)',
    description: 'Su altı tüneli levhası, yol güzergahında su altından geçen bir tünelin bulunduğunu bildirir.',
  },
  'Bilgi_B/b-50a.png': {
    title: 'Şerit Düzenleme Levhası (B-50a)',
    description: 'Şerit düzenleme levhası, otoyol ve bölünmüş yollarda şerit kullanımını ve şeritlerin hangi amaçla ayrıldığını gösterir.',
  },
  'Bilgi_B/b-50b.png': {
    title: 'Şerit Düzenleme Levhası (B-50b)',
    description: 'Şerit düzenleme levhası, otoyol ve bölünmüş yollarda şerit kullanımını ve şeritlerin hangi amaçla ayrıldığını gösterir.',
  },
  'Bilgi_B/b-50c.png': {
    title: 'Asgari Azami Hız Limiti Levhası - Şerit Düzenleme (B-50c)',
    description: 'Asgari azami hız limiti levhası, şeritlerde uygulanacak asgari ve azami hız sınırlarını şerit bazında gösterir.',
  },
  'Bilgi_B/b-50d.png': {
    title: 'Mecburi Asgari Hız Sonu Levhası - Şerit Düzenleme (B-50d)',
    description: 'Mecburi asgari hız sonu levhası, şeritlerde uygulanan mecburi asgari hız sınırlamasının sona erdiğini gösterir.',
  },
  'Bilgi_B/b-50e.png': {
    title: 'Şerit Düzenleme Levhası (B-50e)',
    description: 'Şerit düzenleme levhası, otoyol ve bölünmüş yollarda şerit kullanımını ve şeritlerin hangi amaçla ayrıldığını gösterir.',
  },
  'Bilgi_B/b-50f.png': {
    title: 'Şerit Düzenleme Levhası (B-50f)',
    description: 'Şerit düzenleme levhası, otoyol ve bölünmüş yollarda şerit kullanımını ve şeritlerin hangi amaçla ayrıldığını gösterir.',
  },
  'Bilgi_B/b-51a.png': {
    title: 'Şerit Düzenleme Levhası (B-51a)',
    description: 'Şerit düzenleme levhası, otoyol ve bölünmüş yollarda şerit kullanımını ve şeritlerin hangi amaçla ayrıldığını gösterir.',
  },
  'Bilgi_B/b-51b.png': {
    title: 'Şerit Düzenleme Levhası (B-51b)',
    description: 'Şerit düzenleme levhası, otoyol ve bölünmüş yollarda şerit kullanımını ve şeritlerin hangi amaçla ayrıldığını gösterir.',
  },
  'Bilgi_B/b-51c.png': {
    title: 'Şerit Düzenleme Levhası (B-51c)',
    description: 'Şerit düzenleme levhası, otoyol ve bölünmüş yollarda şerit kullanımını ve şeritlerin hangi amaçla ayrıldığını gösterir.',
  },
  'Bilgi_B/b-51d.png': {
    title: 'Tırmanma Şeridi Levhası - Şerit Düzenleme (B-51d)',
    description: 'Tırmanma şeridi levhası, eğimli yollarda ağır taşıtların kullanması için ayrılmış tırmanma şeridini gösterir.',
  },
  'Bilgi_B/b-52.png': {
    title: 'İki Yönlü Yol (B-52)',
    description: 'İki yönlü yol levhası, üzerinde bulunulan yolun iki yönlü trafiğe açık olduğunu bildirir. Sürücüler karşı yönden gelen araçlara dikkat etmelidir.',
  },
  'Bilgi_B/b-52b.png': {
    title: 'İki Yönlü Trafik Levhası (B-52b)',
    description: 'İki yönlü trafik levhası, ilerideki yolda iki yönlü trafik olduğunu bildirir. Sürücüler karşı yönden gelen araçlara karşı dikkatli olmalıdır.',
  },
  'Bilgi_B/b-53a.png': {
    title: 'U Dönüşü Levhası (B-53a)',
    description: 'U dönüşü levhası, belirtilen noktada U dönüşü yapılabileceğini gösterir.',
  },
  'Bilgi_B/b-53b.png': {
    title: 'U Dönüşü Levhası (B-53b)',
    description: 'U dönüşü levhası, belirtilen noktada U dönüşü yapılabileceğini gösterir.',
  },
  'Bilgi_B/b-53c.png': {
    title: 'U Dönüşü Levhası (B-53c)',
    description: 'U dönüşü levhası, belirtilen noktada U dönüşü yapılabileceğini gösterir.',
  },
  'Bilgi_B/b-54.png': {
    title: 'Karayolları Bilgi Levhası (B-54)',
    description: 'Karayolları bilgi levhası, Karayolları Genel Müdürlüğüne ait yol güzergahı bilgilerini ve hizmetleri sürücülere tanıtır.',
  },
  'Bilgi_B/b-55a.png': {
    title: 'Kaçış Rampası (Sağ) (B-55a)',
    description: 'Kaçış rampası (sağ) levhası, freni bozulan araçların güvenle durabilmesi için yolun sağında bulunan kaçış rampasını gösterir.',
  },
  'Bilgi_B/b-55b.png': {
    title: 'Kaçış Rampası (Sol) (B-55b)',
    description: 'Kaçış rampası (sol) levhası, freni bozulan araçların güvenle durabilmesi için yolun solunda bulunan kaçış rampasını gösterir.',
  },
  'Bilgi_B/b-55c.png': {
    title: 'Kaçış Rampası 500m (B-55c)',
    description: 'Kaçış rampası 500m levhası, ileride kaçış rampası bulunduğunu 500 metre kala önceden bildirir.',
  },
  'Bilgi_B/b-55d.png': {
    title: 'Kaçış Rampası (Sağ) (B-55d)',
    description: 'Kaçış rampası (sağ) bilgi levhası, yolun sağında bulunan kaçış rampasına giriş yönünü gösterir.',
  },
  'Bilgi_B/b-55e.png': {
    title: 'Kaçış Rampası (Sol) (B-55e)',
    description: 'Kaçış rampası (sol) bilgi levhası, yolun solunda bulunan kaçış rampasına giriş yönünü gösterir.',
  },
  'Bilgi_B/b-56.png': {
    title: 'Yaya Öncelikli Yol (B-56)',
    description: 'Yaya öncelikli yol levhası, belirtilen yolda yayaların öncelikli olduğunu ve araçların yayalara yol vermesi gerektiğini bildirir.',
  },
  'Bilgi_B/b-57.png': {
    title: 'Yaya Öncelikli Yolun Sonu (B-57)',
    description: 'Yaya öncelikli yolun sonu levhası, yaya öncelikli yol uygulamasının bittiğini bildirir.',
  },
  'Bilgi_B/b-58a.png': {
    title: 'İstasyon (B-58a)',
    description: 'İstasyon levhası, yol güzergahında bir tren istasyonunun bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-58b.png': {
    title: 'Otogar (B-58b)',
    description: 'Otogar levhası, yol güzergahında bir otogarın bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-59.png': {
    title: 'Tramvay Durağı (B-59)',
    description: 'Tramvay durağı levhası, yol güzergahında bir tramvay durağının bulunduğunu gösterir. Sürücüler durak yakınında dikkatli olmalıdır.',
  },
  'Bilgi_B/b-5a.png': {
    title: 'Kavşak Öncesi Yön Levhası (B-5A)',
    description: 'Kavşak öncesi yön levhası, ilerideki kavşaktan gidilebilecek yerlere ulaşım yönünü gösterir.',
  },
  'Bilgi_B/b-5b.png': {
    title: 'Kavşak İçi Yön Levhası (Turistik Mahal) (B-5b)',
    description: 'Kavşak içi yön levhası (Turistik Mahal), kavşak içinde turistik mahallere gidiş yönünü gösterir.',
  },
  'Bilgi_B/b-5c.png': {
    title: 'Kavşak İçi Yön Levhası (Metro) (B-5c)',
    description: 'Kavşak içi yön levhası (Metro), kavşak içinde metro istasyonuna gidiş yönünü gösterir.',
  },
  'Bilgi_B/b-5d.png': {
    title: 'Kavşak İçi Yön Levhası (Köy ve Mahalle) (B-5d)',
    description: 'Kavşak içi yön levhası (Köy ve Mahalle), kavşak içinde köy veya mahalleye gidiş yönünü gösterir.',
  },
  'Bilgi_B/b-60.png': {
    title: 'Sanayi Bölgesi (OSB) (B-60)',
    description: 'Sanayi bölgesi (OSB) levhası, yol güzergahında organize sanayi bölgesinin bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-61a.png': {
    title: 'Elektronik Denetleme Sistemi (EDS) (B-61a)',
    description: 'Elektronik Denetleme Sistemi (EDS) levhası, yol üzerinde elektronik denetleme sistemi bulunduğunu bildirir. Sürücüler hız ve trafik kurallarına uymalıdır.',
  },
  'Bilgi_B/b-61b.png': {
    title: 'Elektronik Denetleme Sistemi (EDS) (B-61b)',
    description: 'Elektronik Denetleme Sistemi (EDS) levhası, yol üzerinde elektronik denetleme sistemi bulunduğunu bildirir. Sürücüler hız ve trafik kurallarına uymalıdır.',
  },
  'Bilgi_B/b-61c.png': {
    title: 'Elektronik Denetleme Sistemi (EDS) (B-61c)',
    description: 'Elektronik Denetleme Sistemi (EDS) levhası, yol üzerinde elektronik denetleme sistemi bulunduğunu bildirir. Sürücüler hız ve trafik kurallarına uymalıdır.',
  },
  'Bilgi_B/b-61d.png': {
    title: 'Elektronik Denetleme Sistemi (EDS) (B-61d)',
    description: 'Elektronik Denetleme Sistemi (EDS) levhası, yol üzerinde elektronik denetleme sistemi bulunduğunu bildirir. Sürücüler hız ve trafik kurallarına uymalıdır.',
  },
  'Bilgi_B/b-61e.png': {
    title: 'Elektronik Denetleme Sistemi (EDS) (B-61e)',
    description: 'Elektronik Denetleme Sistemi (EDS) levhası, yol üzerinde elektronik denetleme sistemi bulunduğunu bildirir. Sürücüler hız ve trafik kurallarına uymalıdır.',
  },
  'Bilgi_B/b-61f.png': {
    title: 'Elektronik Denetleme Sistemi (EDS) (B-61f)',
    description: 'Elektronik Denetleme Sistemi (EDS) levhası, yol üzerinde elektronik denetleme sistemi bulunduğunu bildirir. Sürücüler hız ve trafik kurallarına uymalıdır.',
  },
  'Bilgi_B/b-61g.png': {
    title: 'Elektronik Denetleme Sistemi (EDS) (B-61g)',
    description: 'Elektronik Denetleme Sistemi (EDS) levhası, yol üzerinde elektronik denetleme sistemi bulunduğunu bildirir. Sürücüler hız ve trafik kurallarına uymalıdır.',
  },
  'Bilgi_B/b-62.png': {
    title: 'Trafik Cebi Levhası (B-62)',
    description: 'Trafik cebi levhası, yol kenarında araçların durması için ayrılmış trafik cebini (cephe alanı) gösterir.',
  },
  'Bilgi_B/b-63a.png': {
    title: 'Karayolu Denetim İstasyonu 300m (B-63a)',
    description: 'Karayolu Denetim İstasyonu 300m levhası, ileride karayolu denetim istasyonu bulunduğunu 300 metre kala bildirir. Sürücüler durma ihtimaline karşı hazırlıklı olmalıdır.',
  },
  'Bilgi_B/b-63b.png': {
    title: 'Karayolu Denetim İstasyonu (Sol) (B-63b)',
    description: 'Karayolu Denetim İstasyonu (sol) levhası, yolun solunda karayolu denetim istasyonu bulunduğunu ve yönünü gösterir.',
  },
  'Bilgi_B/b-63c.png': {
    title: 'Karayolu Denetim İstasyonu (B-63c)',
    description: 'Karayolu Denetim İstasyonu levhası, yol güzergahında karayolu denetim istasyonunun bulunduğunu gösterir. Sürücüler kontrole hazır olmalıdır.',
  },
  'Bilgi_B/b-63d.png': {
    title: 'Karayolu Denetim İstasyonu (B-63d)',
    description: 'Karayolu Denetim İstasyonu levhası, yol güzergahında karayolu denetim istasyonunun bulunduğunu gösterir. Sürücüler kontrole hazır olmalıdır.',
  },
  'Bilgi_B/b-64.png': {
    title: 'Hız Sınırı Bölgesi Levhası (B-64)',
    description: 'Hız sınırı bölgesi levhası, belirtilen bölge içinde hız sınırlaması uygulandığını ve bölge sonuna kadar geçerli olduğunu bildirir.',
  },
  'Bilgi_B/b-6a.png': {
    title: 'Kavşak İçi Yön Levhası (Havalimanı) (B-6a)',
    description: 'Kavşak içi yön levhası (Havalimanı), kavşak içinde havalimanına gidiş yönünü gösterir.',
  },
  'Bilgi_B/b-6b.png': {
    title: 'Kavşak İçi Yön Levhası (Havalimanı) (B-6b)',
    description: 'Kavşak içi yön levhası (Havalimanı), kavşak içinde havalimanına gidiş yönünü gösterir.',
  },
  'Bilgi_B/b-7.png': {
    title: 'Kavşak İçi Yön Levhası (Kamp Yeri) (B-7)',
    description: 'Kavşak içi yön levhası (Kamp Yeri), kavşak içinde kamp yerine gidiş yönünü gösterir.',
  },
  'Bilgi_B/b-8a.png': {
    title: 'Türkiye Devlet Sınırı Levhası (B-8a)',
    description: 'Türkiye devlet sınırı levhası, Türkiye Cumhuriyeti devlet sınırına gelindiğini bildirir.',
  },
  'Bilgi_B/b-8b.png': {
    title: 'İl Sınırı Levhası (B-8b)',
    description: 'İl sınırı levhası, bir ilin sınırına gelindiğini ve başka bir ile girildiğini bildirir.',
  },
  'Bilgi_B/b-8c.png': {
    title: 'Türkiye Hız Sınırları Levhası (B-8c)',
    description: 'Türkiye hız sınırları levhası, Türkiye karayollarında geçerli olan genel hız sınırlarını sürücülere hatırlatır.',
  },
  'Bilgi_B/b-9.png': {
    title: 'Meskun Mahal Levhası (B-9)',
    description: 'Meskun mahal levhası, yerleşim yerine girildiğini bildirir. Bu noktadan itibaren meskun mahal hız sınırı (genellikle 50 km/s) ve şehir içi trafik kuralları geçerlidir.',
  },
  'Park_P/p-1.png': {
    title: 'Park Etmek Yasaktır (P-1)',
    description: 'Bu levha, levhanın bulunduğu yerden itibaren park etmenin yasak olduğunu bildirir. Belirtilen alanda hiçbir araç park edilemez. Yasağın süresi ve mesafesi ek levha ile belirtilmediyse bir sonraki kavşağa kadar geçerlidir.',
  },
  'Park_P/p-2.png': {
    title: 'Duraklamak ve Park Etmek Yasaktır (P-2)',
    description: 'Bu levha, belirtilen alanda duraklamanın ve park etmenin yasak olduğunu bildirir. Trafik zorunluluğu dışında hiçbir araç bu bölgede durdurulamaz ve park edilemez.',
  },
  'Park_P/p-3a.png': {
    title: 'Park Yeri (P-3a)',
    description: 'Bu levha, belirtilen alanın araç park etmeye ayrılmış bir park yeri olduğunu gösterir. Sürücüler bu alanda araçlarını park edebilir.',
  },
  'Park_P/p-3b.png': {
    title: 'Park Yeri (P-3b)',
    description: 'Bu levha, belirtilen alanın araç park etmeye ayrılmış bir park yeri olduğunu gösterir. Sürücüler bu alanda araçlarını park edebilir.',
  },
  'Park_P/p-3c.png': {
    title: 'Park Yeri (P-3c)',
    description: 'Bu levha, belirtilen alanın araç park etmeye ayrılmış bir park yeri olduğunu gösterir. Sürücüler bu alanda araçlarını park edebilir.',
  },
  'Park_P/p-3d.png': {
    title: 'Park Yeri (P-3d)',
    description: 'Bu levha, belirtilen alanın araç park etmeye ayrılmış bir park yeri olduğunu gösterir. Sürücüler bu alanda araçlarını park edebilir.',
  },
  'Tanzim_TT/b-14e.png': {
    title: 'Yaya Bölgesi (B-14e)',
    description: 'Yaya bölgesi levhası, belirtilen alanın yayalara ayrılmış olduğunu ve bu bölgede yayaların öncelikli olduğunu gösterir. Sürücüler bu bölgede yayalara karşı azami dikkat göstermelidir.',
  },
  'Tanzim_TT/b-14f.png': {
    title: 'Yaya Bölgesi (B-14f)',
    description: 'Yaya bölgesi levhası, belirtilen alanın yayalara ayrılmış olduğunu ve bu bölgede yayaların öncelikli olduğunu gösterir. Sürücüler bu bölgede yayalara karşı azami dikkat göstermelidir.',
  },
  'Tanzim_TT/b-37.png': {
    title: 'Önceliği Olan Yol (B-37)',
    description: 'Önceliği olan yol levhası, üzerinde bulunulan yolun, kavşaklarda diğer yollara göre öncelikli olduğunu bildirir. Sürücüler bu yolda öncelikle geçme hakkına sahiptir.',
  },
  'Tanzim_TT/b-38.png': {
    title: 'Anayol (B-38)',
    description: 'Anayol levhası, üzerinde bulunulan yolun anayol olduğunu ve kavşaklarda geçiş önceliğine sahip olduğunu bildirir.',
  },
  'Tanzim_TT/b-39.png': {
    title: 'Anayol Sonu (B-39)',
    description: 'Anayol sonu levhası, anayolun bittiğini ve bu noktadan itibaren geçiş önceliği kuralının değiştiğini bildirir.',
  },
  'Tanzim_TT/tt-1.png': {
    title: 'Yol Ver (TT-1)',
    description: 'Yol ver levhası, sürücülerin ana yoldan gelen araçlara yol vermesi gerektiğini bildirir. Sürücüler kavşağa yaklaşırken hızını azaltmalı, ana yoldaki trafiğe göre durup geçiş hakkı vermelidir.',
  },
  'Tanzim_TT/tt-10a.png': {
    title: 'Kamyon Giremez (TT-10a)',
    description: 'Kamyon giremez levhası, belirtilen yola kamyonların girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-10b.png': {
    title: 'Otobüs Giremez (TT-10b)',
    description: 'Otobüs giremez levhası, belirtilen yola otobüslerin girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-11.png': {
    title: 'Treyler Giremez (TT-11)',
    description: 'Treyler (yarı römork) giremez levhası, belirtilen yola treyler çeken araçların girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-12.png': {
    title: 'Yaya Giremez (TT-12)',
    description: 'Yaya giremez levhası, belirtilen yola yayaların girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-13.png': {
    title: 'At Arabası Giremez (TT-13)',
    description: 'At arabası giremez levhası, belirtilen yola at arabalarının girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-14.png': {
    title: 'El Arabası Giremez (TT-14)',
    description: 'El arabası giremez levhası, belirtilen yola el arabalarının girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-15.png': {
    title: 'Traktör Giremez (TT-15)',
    description: 'Traktör giremez levhası, belirtilen yola traktörlerin girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-16a.png': {
    title: 'Patlayıcı ve Parlayıcı Madde Taşıyan Taşıt Giremez (TT-16a)',
    description: 'Belirli miktardan fazla patlayıcı ve parlayıcı madde taşıyan taşıtların giremeyeceğini bildirir.',
  },
  'Tanzim_TT/tt-16b.png': {
    title: 'Tehlikeli Madde Taşıyan Taşıt Giremez (TT-16b)',
    description: 'Tehlikeli madde taşıyan taşıt giremez levhası, belirtilen yola tehlikeli madde taşıyan taşıtların girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-17.png': {
    title: 'Su Kirletici Madde Taşıyan Taşıt Giremez (TT-17)',
    description: 'Belirli miktardan fazla su kirletici madde taşıyan taşıt giremez levhası, belirtilen yola su kirletici madde taşıyan taşıtların girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-18.png': {
    title: 'Motorlu Taşıt Giremez (TT-18)',
    description: 'Motorlu taşıt giremez levhası, belirtilen yola motorlu taşıtların girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-19.png': {
    title: 'Taşıt Giremez (TT-19)',
    description: 'Taşıt giremez levhası, belirtilen yola tüm taşıtların girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-2.png': {
    title: 'Dur (TT-2)',
    description: 'Dur levhası, sürücülerin bu noktada tamamen durması zorunlu olduğunu bildirir. Sürücüler durduktan sonra trafik durumuna göre yola devam etmelidir.',
  },
  'Tanzim_TT/tt-20.png': {
    title: 'Genişliği ... metreden Fazla Olan Taşıt Giremez (TT-20)',
    description: 'Genişliği belirtilen metreden fazla olan taşıtların giremeyeceğini bildirir. Araç genişliği sınırı aşıyorsa bu yola girilmemelidir.',
  },
  'Tanzim_TT/tt-21.png': {
    title: 'Yüksekliği ... metreden Fazla Olan Taşıt Giremez (TT-21)',
    description: 'Yüksekliği belirtilen metreden fazla olan taşıtların giremeyeceğini bildirir. Araç yüksekliği sınırı aşıyorsa bu yola girilmemelidir.',
  },
  'Tanzim_TT/tt-22.png': {
    title: 'Uzunluğu ... metreden Fazla Olan Taşıt Giremez (TT-22)',
    description: 'Uzunluğu belirtilen metreden fazla olan taşıtların giremeyeceğini bildirir.',
  },
  'Tanzim_TT/tt-23.png': {
    title: 'Dingil Ağırlığı ... tondan Fazla Olan Taşıt Giremez (TT-23)',
    description: 'Dingil başına belirtilen tondan fazla yük düşen taşıtların giremeyeceğini bildirir.',
  },
  'Tanzim_TT/tt-24.png': {
    title: 'Yüklü Ağırlığı ... tondan Fazla Olan Taşıt Giremez (TT-24)',
    description: 'Yüklü ağırlığı belirtilen tondan fazla olan taşıtların giremeyeceğini bildirir.',
  },
  'Tanzim_TT/tt-25.png': {
    title: 'Öndeki Taşıt ... metreden Yakın Takip Edilemez (TT-25)',
    description: 'Öndeki taşıtı belirtilen metreden daha yakın takip etmenin yasak olduğunu bildirir. Sürücüler güvenli takip mesafesini korumalıdır.',
  },
  'Tanzim_TT/tt-26a.png': {
    title: 'Sağa Dönülemez (TT-26a)',
    description: 'Sağa dönülemez levhası, bu noktada sağa dönüşün yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-26b.png': {
    title: 'Sola Dönülemez (TT-26b)',
    description: 'Sola dönülemez levhası, bu noktada sola dönüşün yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-26c.png': {
    title: 'U Dönüşü Yapılamaz (TT-26c)',
    description: 'U dönüşü yapılamaz levhası, bu noktada U dönüşünün yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-27.png': {
    title: 'Öndeki Taşıtı Geçmek Yasaktır (TT-27)',
    description: 'Öndeki taşıtı geçmek yasaktır levhası, bu bölgede öndeki taşıtı geçmenin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-28.png': {
    title: 'Kamyonlar İçin Öndeki Taşıtı Geçmek Yasaktır (TT-28)',
    description: 'Kamyonlar için öndeki taşıtı geçmek yasaktır levhası, kamyonların bu bölgede öndeki taşıtı geçmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-29-130.png': {
    title: 'Azami Hız Sınırlaması 130 km (TT-29a)',
    description: 'Azami hız sınırlaması levhası, bu noktadan itibaren azami hızın 130 km/s olduğunu bildirir. Sürücüler bu hızı aşmamalıdır.',
  },
  'Tanzim_TT/tt-29-140.png': {
    title: 'Azami Hız Sınırlaması 140 km (TT-29a)',
    description: 'Azami hız sınırlaması levhası, bu noktadan itibaren azami hızın 140 km/s olduğunu bildirir. Sürücüler bu hızı aşmamalıdır.',
  },
  'Tanzim_TT/tt-29-30.png': {
    title: 'Azami Hız Sınırlaması 30 km (TT-29a)',
    description: 'Azami hız sınırlaması levhası, bu noktadan itibaren azami hızın 30 km/s olduğunu bildirir. Sürücüler bu hızı aşmamalıdır.',
  },
  'Tanzim_TT/tt-29-40.png': {
    title: 'Azami Hız Sınırlaması 40 km (TT-29a)',
    description: 'Azami hız sınırlaması levhası, bu noktadan itibaren azami hızın 40 km/s olduğunu bildirir. Sürücüler bu hızı aşmamalıdır.',
  },
  'Tanzim_TT/tt-29-50.png': {
    title: 'Azami Hız Sınırlaması 50 km (TT-29a)',
    description: 'Azami hız sınırlaması levhası, bu noktadan itibaren azami hızın 50 km/s olduğunu bildirir. Sürücüler bu hızı aşmamalıdır.',
  },
  'Tanzim_TT/tt-29-60.png': {
    title: 'Azami Hız Sınırlaması 60 km (TT-29a)',
    description: 'Azami hız sınırlaması levhası, bu noktadan itibaren azami hızın 60 km/s olduğunu bildirir. Sürücüler bu hızı aşmamalıdır.',
  },
  'Tanzim_TT/tt-29-70.png': {
    title: 'Azami Hız Sınırlaması 70 km (TT-29a)',
    description: 'Azami hız sınırlaması levhası, bu noktadan itibaren azami hızın 70 km/s olduğunu bildirir. Sürücüler bu hızı aşmamalıdır.',
  },
  'Tanzim_TT/tt-29-80.png': {
    title: 'Azami Hız Sınırlaması 80 km (TT-29a)',
    description: 'Azami hız sınırlaması levhası, bu noktadan itibaren azami hızın 80 km/s olduğunu bildirir. Sürücüler bu hızı aşmamalıdır.',
  },
  'Tanzim_TT/tt-29-90.png': {
    title: 'Azami Hız Sınırlaması 90 km (TT-29a)',
    description: 'Azami hız sınırlaması levhası, bu noktadan itibaren azami hızın 90 km/s olduğunu bildirir. Sürücüler bu hızı aşmamalıdır.',
  },
  'Tanzim_TT/tt-29b.png': {
    title: 'Okul Bölgesi Azami Hız Sınırı (TT-29b)',
    description: 'Okul bölgesi azami hız sınırı levhası, okul bölgesinde belirtilen hız sınırına uyulması gerektiğini bildirir. Öğrencilerin yoğun olduğu bu bölgelerde çok dikkatli olunmalıdır.',
  },
  'Tanzim_TT/tt-2a.png': {
    title: 'Çocuklar İçin Dur (TT-2a)',
    description: 'Çocuklar için dur levhası, okul geçitleri ve çocukların yoğun olduğu noktalarda sürücülerin tamamen durması gerektiğini bildirir.',
  },
  'Tanzim_TT/tt-3.png': {
    title: 'Karşıdan Gelene Yol Ver (TT-3)',
    description: 'Karşıdan gelene yol ver levhası, daralan yollarda karşı yönden gelen araçlara yol verilmesi gerektiğini bildirir.',
  },
  'Tanzim_TT/tt-30.png': {
    title: 'Sesli İkaz Cihazlarının Kullanımı Yasaktır (TT-30)',
    description: 'Sesli ikaz cihazlarının (korna) kullanımı yasaktır levhası, belirtilen bölgede korna çalmanın yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-31.png': {
    title: 'Gümrük (TT-31)',
    description: 'Gümrük levhası, ileride gümrük kontrol noktası bulunduğunu bildirir. Sürücüler gümrük noktasında durmalıdır.',
  },
  'Tanzim_TT/tt-32.png': {
    title: 'Bütün Yasaklama ve Kısıtlamaların Sonu (TT-32)',
    description: 'Bütün yasaklama ve kısıtlamaların sonu levhası, bu noktadan itibaren daha önce konulmuş tüm yasaklama ve kısıtlamaların sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-33-30.png': {
    title: 'Hız Sınırlaması Sonu 30 km (TT-33a)',
    description: 'Hız sınırlaması sonu levhası, 30 km/s hız sınırlamasının bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-33-40.png': {
    title: 'Hız Sınırlaması Sonu 40 km (TT-33a)',
    description: 'Hız sınırlaması sonu levhası, 40 km/s hız sınırlamasının bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-33-50.png': {
    title: 'Hız Sınırlaması Sonu 50 km (TT-33a)',
    description: 'Hız sınırlaması sonu levhası, 50 km/s hız sınırlamasının bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-33-60.png': {
    title: 'Hız Sınırlaması Sonu 60 km (TT-33a)',
    description: 'Hız sınırlaması sonu levhası, 60 km/s hız sınırlamasının bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-33-70.png': {
    title: 'Hız Sınırlaması Sonu 70 km (TT-33a)',
    description: 'Hız sınırlaması sonu levhası, 70 km/s hız sınırlamasının bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-33-80.png': {
    title: 'Hız Sınırlaması Sonu 80 km (TT-33a)',
    description: 'Hız sınırlaması sonu levhası, 80 km/s hız sınırlamasının bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-33-90.png': {
    title: 'Hız Sınırlaması Sonu 90 km (TT-33a)',
    description: 'Hız sınırlaması sonu levhası, 90 km/s hız sınırlamasının bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-33b.png': {
    title: 'Azami Hız Bölgesi Sonu (TT-33b)',
    description: 'Azami hız bölgesi sonu levhası, azami hız bölgesinin bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-34a.png': {
    title: 'Geçme Yasağı Sonu (TT-34a)',
    description: 'Geçme yasağı sonu levhası, öndeki taşıtı geçme yasağının bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-34b.png': {
    title: 'Kamyonlar İçin Geçme Yasağı Sonu (TT-34b)',
    description: 'Kamyonlar için geçme yasağı sonu levhası, kamyonlar için öndeki taşıtı geçme yasağının bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-35a.png': {
    title: 'Sağa Mecburi Yön (TT-35a)',
    description: 'Sağa mecburi yön levhası, sürücülerin bu noktada sadece sağa dönmek zorunda olduğunu bildirir.',
  },
  'Tanzim_TT/tt-35b.png': {
    title: 'Sola Mecburi Yön (TT-35b)',
    description: 'Sola mecburi yön levhası, sürücülerin bu noktada sadece sola dönmek zorunda olduğunu bildirir.',
  },
  'Tanzim_TT/tt-35c.png': {
    title: 'İleri Mecburi Yön (TT-35c)',
    description: 'İleri mecburi yön levhası, sürücülerin bu noktada sadece ileri gitmek zorunda olduğunu bildirir.',
  },
  'Tanzim_TT/tt-35d.png': {
    title: 'İleri ve Sağa Mecburi Yön (TT-35d)',
    description: 'İleri ve sağa mecburi yön levhası, sürücülerin bu noktada sadece ileri veya sağa gidebileceğini bildirir.',
  },
  'Tanzim_TT/tt-35e.png': {
    title: 'İleri ve Sola Mecburi Yön (TT-35e)',
    description: 'İleri ve sola mecburi yön levhası, sürücülerin bu noktada sadece ileri veya sola gidebileceğini bildirir.',
  },
  'Tanzim_TT/tt-35f.png': {
    title: 'Sağa ve Sola Mecburi Yön (TT-35f)',
    description: 'Sağa ve sola mecburi yön levhası, sürücülerin bu noktada sağa veya sola gidebileceğini, ileri gidemeyeceğini bildirir.',
  },
  'Tanzim_TT/tt-35g.png': {
    title: 'İleriden Sağa Mecburi Yön (TT-35g)',
    description: 'İleriden sağa mecburi yön levhası, sürücülerin ilerideki kavşaktan sağa dönmek zorunda olduğunu bildirir.',
  },
  'Tanzim_TT/tt-35h.png': {
    title: 'İleriden Sola Mecburi Yön (TT-35h)',
    description: 'İleriden sola mecburi yön levhası, sürücülerin ilerideki kavşaktan sola dönmek zorunda olduğunu bildirir.',
  },
  'Tanzim_TT/tt-36a.png': {
    title: 'Sağdan Gidiniz (TT-36a)',
    description: 'Sağdan gidiniz levhası, engel veya çalışma alanı bulunan noktada araçların sağdan geçmesi gerektiğini bildirir.',
  },
  'Tanzim_TT/tt-36b.png': {
    title: 'Soldan Gidiniz (TT-36b)',
    description: 'Soldan gidiniz levhası, engel veya çalışma alanı bulunan noktada araçların soldan geçmesi gerektiğini bildirir.',
  },
  'Tanzim_TT/tt-36c.png': {
    title: 'Her İki Yandan Gidiniz (TT-36c)',
    description: 'Her iki yandan gidiniz levhası, engel bulunan noktada araçların hem sağdan hem soldan geçebileceğini bildirir.',
  },
  'Tanzim_TT/tt-37.png': {
    title: 'Ada Etrafında Dönünüz (TT-37)',
    description: 'Ada etrafında dönünüz levhası, trafik adası bulunan noktada araçların ada etrafından dönerek geçmesi gerektiğini bildirir.',
  },
  'Tanzim_TT/tt-38a.png': {
    title: 'Mecburi Bisiklet Yolu (TT-38a)',
    description: 'Mecburi bisiklet yolu levhası, belirtilen yolun sadece bisikletliler tarafından kullanılması zorunlu olduğunu bildirir.',
  },
  'Tanzim_TT/tt-38b.png': {
    title: 'Mecburi Bisiklet Yolu Sonu (TT-38b)',
    description: 'Mecburi bisiklet yolu sonu levhası, mecburi bisiklet yolunun bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-39a.png': {
    title: 'Mecburi Yaya Yolu (TT-39a)',
    description: 'Mecburi yaya yolu levhası, belirtilen yolun sadece yayalar tarafından kullanılması zorunlu olduğunu bildirir.',
  },
  'Tanzim_TT/tt-39b.png': {
    title: 'Mecburi Yaya Yolu Sonu (TT-39b)',
    description: 'Mecburi yaya yolu sonu levhası, mecburi yaya yolunun bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-4.png': {
    title: 'Girişi Olmayan Yol (TT-4)',
    description: 'Girişi olmayan yol levhası, belirtilen yola araç girişinin yasak olduğunu bildirir. Bu yolun aksi yönde tek yönlü olduğunu gösterir.',
  },
  'Tanzim_TT/tt-40a.png': {
    title: 'Mecburi Atlı Yolu (TT-40a)',
    description: 'Mecburi atlı yolu levhası, belirtilen yolun sadece atlılar tarafından kullanılması zorunlu olduğunu bildirir.',
  },
  'Tanzim_TT/tt-40b.png': {
    title: 'Mecburi Atlı Yolu Sonu (TT-40b)',
    description: 'Mecburi atlı yolu sonu levhası, mecburi atlı yolunun bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-41a-30.png': {
    title: 'Mecburi Asgari Hız 30 km (TT-41a)',
    description: 'Mecburi asgari hız levhası, bu yolda araçların 30 km/s altında hızla gidemeyeceğini bildirir.',
  },
  'Tanzim_TT/tt-41b-30.png': {
    title: 'Mecburi Asgari Hız Sonu (TT-41b)',
    description: 'Mecburi asgari hız sonu levhası, mecburi asgari hız sınırlamasının bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-42a.png': {
    title: 'Zincir Takmak Mecburidir (TT-42a)',
    description: 'Zincir takmak mecburidir levhası, kış şartlarında bu yolda araçlara zincir takmanın zorunlu olduğunu bildirir.',
  },
  'Tanzim_TT/tt-42b.png': {
    title: 'Zincir Takmak Mecburiyeti Sonu (TT-42b)',
    description: 'Zincir takmak mecburiyeti sonu levhası, zincir takma zorunluluğunun bu noktada sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-43.png': {
    title: 'Ağır Taşıtlar ve Tehlikeli Madde Taşıyan Taşıtlar İçin Mecburi Yön (TT-43)',
    description: 'Ağır taşıtlar ve tehlikeli madde taşıyan taşıtlar için mecburi yön levhası, bu araçların belirtilen yöne gitmek zorunda olduğunu bildirir.',
  },
  'Tanzim_TT/tt-43a.png': {
    title: 'Tehlikeli Madde Taşıyan Taşıtların Mecburi Yönü (TT-43a)',
    description: 'Tehlikeli madde taşıyan taşıtların izleyecekleri mecburi yönü gösterir.',
  },
  'Tanzim_TT/tt-43b.png': {
    title: 'Tehlikeli Madde Taşıyan Taşıtların Mecburi Yönü (TT-43b)',
    description: 'Tehlikeli madde taşıyan taşıtların izleyecekleri mecburi yönü gösterir.',
  },
  'Tanzim_TT/tt-43c.png': {
    title: 'Tehlikeli Madde Taşıyan Taşıtların Mecburi Yönü (TT-43c)',
    description: 'Tehlikeli madde taşıyan taşıtların izleyecekleri mecburi yönü gösterir.',
  },
  'Tanzim_TT/tt-44a.png': {
    title: 'Yayalar ve Bisikletliler Tarafından Kullanılabilen Yol (TT-44a)',
    description: 'Yayalar ve bisikletliler tarafından kullanılabilen yol levhası, belirtilen yolun yayalar ve bisikletliler tarafından kullanılabileceğini gösterir.',
  },
  'Tanzim_TT/tt-44b.png': {
    title: 'Yayalar ve Bisikletliler Yolunun Sonu (TT-44b)',
    description: 'Yayalar ve bisikletliler tarafından kullanılabilen yolun sonu levhası, bu uygulamanın sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-45a.png': {
    title: 'Yayalar ve Bisikletliler İçin Ayrı Ayrı Kullanılabilen Yol (TT-45a)',
    description: 'Yayalar ve bisikletliler için ayrı ayrı kullanılabilen yol levhası, belirtilen yolun yayalar ve bisikletliler için ayrılmış bölümlerden oluştuğunu gösterir.',
  },
  'Tanzim_TT/tt-45b.png': {
    title: 'Yayalar ve Bisikletliler İçin Ayrı Yolun Sonu (TT-45b)',
    description: 'Yayalar ve bisikletliler için ayrı ayrı kullanılabilen yolun sonu levhası, bu uygulamanın sona erdiğini bildirir.',
  },
  'Tanzim_TT/tt-5.png': {
    title: 'Taşıt Trafiğine Kapalı Yol (TT-5)',
    description: 'Taşıt trafiğine kapalı yol levhası, belirtilen yolun tüm taşıt trafiğine kapalı olduğunu bildirir. Sadece yayalar kullanabilir.',
  },
  'Tanzim_TT/tt-6.png': {
    title: 'Araba Giremez (TT-6)',
    description: 'Araba giremez levhası, belirtilen yola otomobil ve benzeri araçların girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-7.png': {
    title: 'Motosiklet Giremez (TT-7)',
    description: 'Motosiklet giremez levhası, belirtilen yola motosikletlerin girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-8.png': {
    title: 'Bisiklet Giremez (TT-8)',
    description: 'Bisiklet giremez levhası, belirtilen yola bisikletlerin girmesinin yasak olduğunu bildirir.',
  },
  'Tanzim_TT/tt-9.png': {
    title: 'Motorlu Bisiklet Giremez (TT-9)',
    description: 'Motorlu bisiklet giremez levhası, belirtilen yola motorlu bisikletlerin girmesinin yasak olduğunu bildirir.',
  },
  'Tehlike_T/t-10.png': {
    title: 'Gevşek Şev (T-10)',
    description: 'Gevşek şev levhası, yol kenarındaki şevin (yamaç) gevşek olduğunu ve kayma riski bulunduğunu bildirir.',
  },
  'Tehlike_T/t-11.png': {
    title: 'Yaya Geçidi (T-11)',
    description: 'Yaya geçidi levhası, ileride yayaların karşıdan karşıya geçebileceği bir yaya geçidi bulunduğunu bildirir. Sürücüler hızını azaltmalı ve yayalara yol vermelidir.',
  },
  'Tehlike_T/t-12.png': {
    title: 'Okul Geçidi (T-12)',
    description: 'Okul geçidi levhası, ileride öğrencilerin karşıdan karşıya geçtiği bir okul geçidi bulunduğunu bildirir. Sürücüler çok dikkatli olmalı ve hızını azaltmalıdır.',
  },
  'Tehlike_T/t-13.png': {
    title: 'Bisiklet Geçebilir (T-13)',
    description: 'Bisiklet geçebilir levhası, yol üzerinde bisikletlilerin geçebileceğini bildirir. Sürücüler bisikletlilere dikkat etmelidir.',
  },
  'Tehlike_T/t-14a.png': {
    title: 'Ehli Hayvanlar Geçebilir (T-14a)',
    description: 'Ehli hayvanlar geçebilir levhası, yol üzerinde evcil hayvanların geçebileceğini bildirir. Sürücüler hayvanlara dikkat etmelidir.',
  },
  'Tehlike_T/t-14b.png': {
    title: 'Vahşi Hayvanlar Geçebilir (T-14b)',
    description: 'Vahşi hayvanlar geçebilir levhası, yol üzerinde vahşi hayvanların geçebileceğini bildirir. Sürücüler özellikle gece çok dikkatli olmalıdır.',
  },
  'Tehlike_T/t-15.png': {
    title: 'Yolda Çalışma (T-15)',
    description: 'Yolda çalışma levhası, ileride yol yapım, bakım ve onarım çalışması yapıldığını bildirir. Sürücüler hızını azaltmalı ve çalışma alanında dikkatli ilerlemelidir.',
  },
  'Tehlike_T/t-16.png': {
    title: 'Işıklı İşaret Cihazı (T-16)',
    description: 'Işıklı işaret cihazı levhası, ileride trafik ışıkları (sinyalizasyon) bulunduğunu önceden bildirir.',
  },
  'Tehlike_T/t-17.png': {
    title: 'Havalimanı - Alçak Uçuş (T-17)',
    description: 'Havalimanı (alçak uçuş) levhası, yol üzerinde alçak uçan uçak bulunabileceğini ve havalimanına yaklaşıldığını bildirir.',
  },
  'Tehlike_T/t-18.png': {
    title: 'Yandan Rüzgar (T-18)',
    description: 'Yandan rüzgar levhası, yolun bu kesiminde kuvvetli yandan rüzgar olabileceğini bildirir. Sürücüler direksiyon hakimiyetine dikkat etmelidir.',
  },
  'Tehlike_T/t-19.png': {
    title: 'İki Yönlü Trafik (T-19)',
    description: 'İki yönlü trafik levhası, tek yönlü yolun sona erip iki yönlü trafiğin başladığını bildirir. Sürücüler karşı yönden gelen araçlara dikkat etmelidir.',
  },
  'Tehlike_T/t-1a.png': {
    title: 'Sağa Tehlikeli Viraj (T-1a)',
    description: 'Sağa tehlikeli viraj levhası, ileride sağa doğru tehlikeli bir viraj bulunduğunu bildirir. Sürücüler hızını azaltmalıdır.',
  },
  'Tehlike_T/t-1b.png': {
    title: 'Sola Tehlikeli Viraj (T-1b)',
    description: 'Sola tehlikeli viraj levhası, ileride sola doğru tehlikeli bir viraj bulunduğunu bildirir. Sürücüler hızını azaltmalıdır.',
  },
  'Tehlike_T/t-20.png': {
    title: 'Dikkat (T-20)',
    description: 'Dikkat levhası, yol güzergahında ek levhalarla belirtilecek bir tehlike veya durum bulunduğunu bildirir. Sürücüler dikkatli olmalıdır.',
  },
  'Tehlike_T/t-21.png': {
    title: 'Kontrolsüz Kavşak (T-21)',
    description: 'Kontrolsüz kavşak levhası, ileride trafik ışığı veya trafik işaretçisi bulunmayan bir kavşak bulunduğunu bildirir. Sürücüler hızını azaltmalı ve dikkatli geçmelidir.',
  },
  'Tehlike_T/t-22a.png': {
    title: 'Ana Yol - Tali Yol Kavşağı (T-22a)',
    description: 'Ana yol - tali yol kavşağı levhası, ileride ana yola tali yolun katıldığı bir kavşak bulunduğunu bildirir.',
  },
  'Tehlike_T/t-22b.png': {
    title: 'Ana Yol - Tali Yol Kavşağı (T-22b)',
    description: 'Ana yol - tali yol kavşağı levhası, ileride ana yola tali yolun katıldığı bir kavşak bulunduğunu bildirir.',
  },
  'Tehlike_T/t-22c.png': {
    title: 'Ana Yol - Tali Yol Kavşağı (T-22c)',
    description: 'Ana yol - tali yol kavşağı levhası, ileride ana yola tali yolun katıldığı bir kavşak bulunduğunu bildirir.',
  },
  'Tehlike_T/t-22d.png': {
    title: 'Ana Yol - Tali Yol Kavşağı (T-22d)',
    description: 'Ana yol - tali yol kavşağı levhası, ileride ana yola tali yolun katıldığı bir kavşak bulunduğunu bildirir.',
  },
  'Tehlike_T/t-22e.png': {
    title: 'Ana Yol - Tali Yol Kavşağı (T-22e)',
    description: 'Ana yol - tali yol kavşağı levhası, ileride ana yola tali yolun katıldığı bir kavşak bulunduğunu bildirir.',
  },
  'Tehlike_T/t-23a.png': {
    title: 'Sağdan Ana Yola Giriş (T-23a)',
    description: 'Sağdan ana yola giriş levhası, tali yoldan sağdan ana yola girildiğini ve ana yoldaki araçlara yol verilmesi gerektiğini bildirir.',
  },
  'Tehlike_T/t-23b.png': {
    title: 'Soldan Ana Yola Giriş (T-23b)',
    description: 'Soldan ana yola giriş levhası, tali yoldan soldan ana yola girildiğini ve ana yoldaki araçlara yol verilmesi gerektiğini bildirir.',
  },
  'Tehlike_T/t-24.png': {
    title: 'Dönel Kavşak (T-24)',
    description: 'Dönel kavşak levhası, ileride bir dönel kavşak (ada) bulunduğunu bildirir. Sürücüler hızını azaltmalı ve dönel kavşak içindeki araçlara yol vermelidir.',
  },
  'Tehlike_T/t-25.png': {
    title: 'Kontrollü Demiryolu Geçidi (T-25)',
    description: 'Kontrollü demiryolu geçidi levhası, ileride bariyerli ve ışıklı kontrollü bir demiryolu geçidi bulunduğunu bildirir.',
  },
  'Tehlike_T/t-26.png': {
    title: 'Kontrolsüz Demiryolu Geçidi (T-26)',
    description: 'Kontrolsüz demiryolu geçidi levhası, ileride bariyeri olmayan kontrolsüz bir demiryolu geçidi bulunduğunu bildirir. Sürücüler tren gelip gelmediğini kontrol ederek geçmelidir.',
  },
  'Tehlike_T/t-27a.png': {
    title: 'Kontrolsüz Demiryolu Geçidi - Tek Hat (T-27a)',
    description: 'Kontrolsüz demiryolu geçidi (tek hat) levhası, ileride tek hatlı kontrolsüz bir demiryolu geçidi bulunduğunu bildirir.',
  },
  'Tehlike_T/t-27b.png': {
    title: 'Kontrolsüz Demiryolu Geçidi - Çift Hat (T-27b)',
    description: 'Kontrolsüz demiryolu geçidi (çift hat) levhası, ileride çift hatlı kontrolsüz bir demiryolu geçidi bulunduğunu bildirir.',
  },
  'Tehlike_T/t-28a-b.png': {
    title: 'Demiryolu Hemzemin Geçit Yaklaşımı (T-28a-b)',
    description: 'Demiryolu hemzemin geçit yaklaşımı levhası, demiryolu geçidine yaklaşıldığını bildirir. Sürücüler dikkatli olmalıdır.',
  },
  'Tehlike_T/t-29a-b.png': {
    title: 'Demiryolu Hemzemin Geçit Yaklaşımı (T-29a-b)',
    description: 'Demiryolu hemzemin geçit yaklaşımı levhası, demiryolu geçidine yaklaşıldığını bildirir. Sürücüler dikkatli olmalıdır.',
  },
  'Tehlike_T/t-2a.png': {
    title: 'Sağa Tehlikeli Devamlı Virajlar (T-2a)',
    description: 'Sağa tehlikeli devamlı virajlar levhası, ileride sağa doğru birbirini takip eden tehlikeli virajlar bulunduğunu bildirir. Sürücüler hızını azaltmalıdır.',
  },
  'Tehlike_T/t-2b.png': {
    title: 'Sola Tehlikeli Devamlı Virajlar (T-2b)',
    description: 'Sola tehlikeli devamlı virajlar levhası, ileride sola doğru birbirini takip eden tehlikeli virajlar bulunduğunu bildirir. Sürücüler hızını azaltmalıdır.',
  },
  'Tehlike_T/t-30a-b.png': {
    title: 'Demiryolu Hemzemin Geçit Yaklaşımı (T-30a-b)',
    description: 'Demiryolu hemzemin geçit yaklaşımı levhası, demiryolu geçidine yaklaşıldığını bildirir. Sürücüler dikkatli olmalıdır.',
  },
  'Tehlike_T/t-31a-b.png': {
    title: 'Köprü Başı Levhası (T-31a-b)',
    description: 'Köprü başı levhası, köprüye yaklaşıldığını bildirir. Sürücüler köprüye girmeden önce dikkatli olmalı ve trafik durumuna göre hızını ayarlamalıdır.',
  },
  'Tehlike_T/t-32.png': {
    title: 'Engel İşareti (T-32)',
    description: 'Engel işareti levhası, yol üzerinde veya yol kenarında bir engel bulunduğunu bildirir. Sürücüler engelden güvenle geçmek için dikkatli olmalıdır.',
  },
  'Tehlike_T/t-33a.png': {
    title: 'Tehlikeli Viraj Yön Levhası (T-33a)',
    description: 'Tehlikeli viraj yön levhası, tehlikeli virajın bulunduğu yönü gösterir. Sürücüler viraja uygun hızda girmelidir.',
  },
  'Tehlike_T/t-33b.png': {
    title: 'Tehlikeli Viraj Yön Levhası (T-33b)',
    description: 'Tehlikeli viraj yön levhası, tehlikeli virajın bulunduğu yönü gösterir. Sürücüler viraja uygun hızda girmelidir.',
  },
  'Tehlike_T/t-33d-e.png': {
    title: 'Onarım Yaklaşım Levhası (T-33d-e)',
    description: 'Onarım yaklaşım levhası, yol onarım çalışmasının bulunduğu bölgeye yaklaşıldığını bildirir. Sürücüler hızını azaltmalıdır.',
  },
  'Tehlike_T/t-33f.png': {
    title: 'Onarım Yaklaşım Levhası (T-33f)',
    description: 'Onarım yaklaşım levhası, yol onarım çalışmasının bulunduğu bölgeye yaklaşıldığını bildirir. Sürücüler hızını azaltmalıdır.',
  },
  'Tehlike_T/t-34a-b.png': {
    title: 'Refüj Başı Ek Levhası (T-34a-b)',
    description: 'Refüj başı ek levhası, refüjün (orta ayırıcı) başladığını bildirir. Sürücüler refüjün bulunduğu bölgede dikkatli olmalıdır.',
  },
  'Tehlike_T/t-35.png': {
    title: 'Dönüş Adası Ek Levhası (T-35)',
    description: 'Dönüş adası ek levhası, yol üzerinde dönüş adası bulunduğunu bildirir. Sürücüler ada etrafında dikkatli dönmelidir.',
  },
  'Tehlike_T/t-36.png': {
    title: 'Düşük Banket (T-36)',
    description: 'Düşük banket levhası, yolun banketinin (kenar kısmı) düşük olduğunu bildirir. Sürücüler yolun kenarına yaklaşırken dikkatli olmalıdır.',
  },
  'Tehlike_T/t-37.png': {
    title: 'Gizli Buzlanma (T-37)',
    description: 'Gizli buzlanma levhası, yolun bu kesiminde görünmeyen buzlanma riski bulunduğunu bildirir. Sürücüler özellikle kış aylarında hızını azaltmalıdır.',
  },
  'Tehlike_T/t-38.png': {
    title: 'Olası Trafik Sıkışıklığı (T-38)',
    description: 'Olası trafik sıkışıklığı levhası, ileride trafik sıkışıklığı olabileceğini bildirir. Sürücüler hızını azaltmalı ve kuyruğa hazırlıklı olmalıdır.',
  },
  'Tehlike_T/t-39.png': {
    title: 'Tramvay Hattı ile Oluşan Kavşak (T-39)',
    description: 'Tramvay hattı ile oluşan kavşak levhası, ileride tramvay hattı ile yolun kesiştiği bir kavşak bulunduğunu bildirir. Sürücüler tramvaya dikkat etmelidir.',
  },
  'Tehlike_T/t-3a.png': {
    title: 'Tehlikeli Eğim - İniş (T-3a)',
    description: 'Tehlikeli eğim (iniş) levhası, ileride tehlikeli bir iniş eğimi bulunduğunu bildirir. Sürücüler fren sistemine dikkat etmeli ve düşük viteste inmeli.',
  },
  'Tehlike_T/t-3b.png': {
    title: 'Tehlikeli Eğim - Çıkış (T-3b)',
    description: 'Tehlikeli eğim (çıkış) levhası, ileride tehlikeli bir çıkış eğimi bulunduğunu bildirir. Sürücüler uygun vitesle çıkmalıdır.',
  },
  'Tehlike_T/t-4a.png': {
    title: 'Her İki Taraftan Daralan Kaplama (T-4a)',
    description: 'Her iki taraftan daralan kaplama levhası, yolun her iki taraftan daraldığını bildirir. Sürücüler hızını azaltmalıdır.',
  },
  'Tehlike_T/t-4b.png': {
    title: 'Sağdan Daralan Kaplama (T-4b)',
    description: 'Sağdan daralan kaplama levhası, yolun sağ taraftan daraldığını bildirir. Sürücüler hızını azaltmalıdır.',
  },
  'Tehlike_T/t-4c.png': {
    title: 'Soldan Daralan Kaplama (T-4c)',
    description: 'Soldan daralan kaplama levhası, yolun sol taraftan daraldığını bildirir. Sürücüler hızını azaltmalıdır.',
  },
  'Tehlike_T/t-5.png': {
    title: 'Açılan Köprü (T-5)',
    description: 'Açılan köprü levhası, ileride açılır kapanır bir köprü bulunduğunu bildirir. Sürücüler köprünün açık olduğu durumlarda durmalıdır.',
  },
  'Tehlike_T/t-6.png': {
    title: 'Deniz veya Nehir Kıyısında Biten Yol (T-6)',
    description: 'Deniz veya nehir kıyısında biten yol levhası, yolun deniz veya nehir kıyısında sona erdiğini bildirir. Sürücüler dikkatli olmalıdır.',
  },
  'Tehlike_T/t-7.png': {
    title: 'Kasisli Yol (T-7)',
    description: 'Kasisli yol levhası, yol üzerinde kasis (hız tümseği) bulunduğunu bildirir. Sürücüler hızını azaltmalıdır.',
  },
  'Tehlike_T/t-8.png': {
    title: 'Kaygan Yol (T-8)',
    description: 'Kaygan yol levhası, yolun bu kesiminin kaygan olabileceğini bildirir. Sürücüler hızını azaltmalı ve ani fren yapmamalıdır.',
  },
  'Tehlike_T/t-9.png': {
    title: 'Gevşek Malzemeli Zemin (T-9)',
    description: 'Gevşek malzemeli zemin levhası, yol yüzeyinde gevşek malzeme (çakıl, kum vb.) bulunabileceğini bildirir. Sürücüler hızını azaltmalı ve dikkatli olmalıdır.',
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
