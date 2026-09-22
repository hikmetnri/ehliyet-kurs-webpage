export const COLORS = {
  background: '#080D18',
  surface: '#101725',
  raised: '#151E2E',
  border: '#243044',
  text: '#F4F7FB',
  muted: '#8F9BB0',
  primary: '#7C6CFF',
  cyan: '#42D6C6',
  amber: '#FFB85C',
  red: '#FF647C',
  blue: '#70A4FF',
  green: '#64D98B',
};

export const numberValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getPayload = (response) => response?.data?.data ?? response?.data ?? {};

export const formatNumber = (value) => numberValue(value).toLocaleString('tr-TR');

export const formatDate = () => {
  const raw = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date());

  return raw.toLocaleUpperCase('tr-TR');
};
