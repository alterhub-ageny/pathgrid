export const locales = ['en', 'fr', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
};

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  fr: 'ltr',
  ar: 'rtl',
};

export const localeFonts: Record<Locale, { heading: string; body: string }> = {
  en: { heading: 'var(--font-serif)', body: 'var(--font-sans)' },
  fr: { heading: 'var(--font-serif)', body: 'var(--font-sans)' },
  ar: { heading: 'var(--font-arabic)', body: 'var(--font-arabic)' },
};

import en from '../../public/locales/en.json';
import fr from '../../public/locales/fr.json';
import ar from '../../public/locales/ar.json';

const dictionaries: Record<Locale, Record<string, any>> = { en, fr, ar };

export function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries.en;
}

export function t(path: string, locale: Locale, params?: Record<string, string | number>): string {
  const dict = getDictionary(locale);
  const keys = path.split('.');
  let value: any = dict;

  for (const key of keys) {
    value = value?.[key];
  }

  if (typeof value !== 'string') return path;

  if (params) {
    return Object.entries(params).reduce((str, [key, val]) => {
      return str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    }, value);
  }

  return value;
}

export async function getTranslations(locale: Locale) {
  return {
    t: (path: string, params?: Record<string, string | number>) => t(path, locale, params),
    locale,
    dir: localeDirections[locale],
    isRtl: localeDirections[locale] === 'rtl',
  };
}
