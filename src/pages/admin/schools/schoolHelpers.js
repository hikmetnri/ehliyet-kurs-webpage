export const emptyForm = {
  name: '',
  city: '',
  district: '',
  address: '',
  phone: '',
  locationUrl: '',
  websiteUrl: '',
  contactEmail: '',
  licenseClasses: '',
  description: '',
  isSponsored: false,
  sponsorLabel: 'Sponsorlu',
  sponsorPriority: 0,
  sponsorStartAt: '',
  sponsorEndAt: '',
  sponsorNote: '',
  isActive: true,
};

export const readList = (payload) => {
  const data = payload?.data?.data || payload?.data?.schools || payload?.data;
  return Array.isArray(data) ? data : [];
};

export const withProtocol = (value) => {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

export const sponsorDefaults = {
  sponsorLabel: 'Sponsorlu',
  sponsorStartAt: '',
  sponsorEndAt: '',
  sponsorNote: '',
};

export const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export const addMonthsForInput = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
};

export const todayInput = () => new Date().toISOString().slice(0, 10);

export const sponsorDateTime = (value, boundary = 'start') => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const date = boundary === 'end'
      ? new Date(year, month - 1, day, 23, 59, 59, 999)
      : new Date(year, month - 1, day, 0, 0, 0, 0);
    return date.getTime();
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

export const isSponsorActive = (school) => {
  if (!school?.isSponsored) return false;
  if (school.sponsorIsActive === false) return false;
  const now = Date.now();
  const startAt = sponsorDateTime(school.sponsorStartAt, 'start');
  const endAt = sponsorDateTime(school.sponsorEndAt, 'end');
  if (startAt && startAt > now) return false;
  if (endAt && endAt < now) return false;
  return true;
};
