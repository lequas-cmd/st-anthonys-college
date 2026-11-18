import type { Locale } from './locale';

export const ETHIOPIAN_MONTHS = [
  'መስከረም',
  'ጥቅምት',
  'ህዳር',
  'ታህሳስ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሀሴ',
  'ጳጉሜ',
] as const;

export const ETHIOPIAN_MONTHS_EN = [
  'Meskerem',
  'Tikemt',
  'Hidar',
  'Tahsas',
  'Ter',
  'Yekatit',
  'Megabit',
  'Miazia',
  'Ginbot',
  'Sene',
  'Hamle',
  'Nehase',
  'Pagume',
] as const;

function gregorianToJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function julianDayToEthiopian(jd: number): { year: number; month: number; day: number } {
  const year = Math.floor((4 * (jd - 1723856) + 1463) / 1461);
  const annualStart = 1723856 + (year - 1) * 365 + Math.floor((year - 1) / 4);
  const month = Math.min(13, Math.max(1, Math.floor((jd - annualStart) / 30) + 1));
  const day = jd - (annualStart + (month - 1) * 30) + 1;

  return { year, month, day };
}

export function gregorianToEthiopianDate(value: string | Date): { year: number; month: number; day: number } {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { year: 0, month: 1, day: 1 };
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return julianDayToEthiopian(gregorianToJulianDay(year, month, day));
}

export function formatDisplayDate(value: string | Date | null | undefined, locale: Locale = 'en'): string {
  if (!value) {
    return locale === 'am' ? 'በአሁኑ ጊዜ' : 'Recently';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return locale === 'am' ? 'በአሁኑ ጊዜ' : 'Recently';
  }

  if (locale === 'am') {
    const { year, month, day } = gregorianToEthiopianDate(date);
    return `${ETHIOPIAN_MONTHS[month - 1]} ${day}, ${year}`;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
