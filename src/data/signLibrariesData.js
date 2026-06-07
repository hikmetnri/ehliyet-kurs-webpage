import { trafficSignsData, categories as trafficCategories } from './trafficSignsData';
import { isgSignsData, isgCategories } from './isgSignsData';

const normalizeCategoryName = (value) => String(value || '')
  .toLocaleLowerCase('tr-TR')
  .replace(/[ç]/g, 'c')
  .replace(/[ğ]/g, 'g')
  .replace(/[ıi]/g, 'i')
  .replace(/[ö]/g, 'o')
  .replace(/[ş]/g, 's')
  .replace(/[ü]/g, 'u')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const ISG_CATEGORY_KEYWORDS = [
  'is makinesi',
  'operator',
  'forklift',
  'vinc',
  'kazici',
  'yukleyici',
  'ekskavator',
  'greyder',
  'dozer',
  'kepce',
  'isg',
  'is guvenligi',
  'g sinif',
];

export const signLibraries = {
  traffic: {
    id: 'traffic',
    folder: 'trafik-levhalari',
    title: 'Trafik Levhaları',
    shortTitle: 'Trafik',
    kicker: 'B sınıfı ve ehliyet sınavları',
    description: 'B sınıfı ehliyet ve trafik sınavlarında kullanılan tehlike, tanzim, bilgi, durma ve park levhaları.',
    signs: trafficSignsData,
    categories: trafficCategories,
    accent: 'text-amber-300',
  },
  isg: {
    id: 'isg',
    folder: 'isg',
    title: 'İş Sağlığı ve İş Makinesi Levhaları',
    shortTitle: 'İş Sağlığı',
    kicker: 'İş makinesi ve çalışma güvenliği',
    description: 'İş makinesi, operatörlük ve iş sağlığı eğitimlerinde kullanılan uyarı, yasak, zorunlu talimat ve acil durum levhaları.',
    signs: isgSignsData,
    categories: isgCategories,
    accent: 'text-cyan-300',
  },
};

export const signLibraryList = [signLibraries.traffic, signLibraries.isg];

export const getSignLibraryForCategoryName = (categoryName) => {
  const normalized = normalizeCategoryName(categoryName);
  if (ISG_CATEGORY_KEYWORDS.some((keyword) => normalized.includes(normalizeCategoryName(keyword)))) {
    return signLibraries.isg;
  }
  return signLibraries.traffic;
};
