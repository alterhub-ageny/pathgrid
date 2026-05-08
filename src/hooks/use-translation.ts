'use client';

import { useAppStore } from '@/store/app-store';
import { t, type Locale } from '@/lib/i18n';

export function useTranslation() {
  const locale = useAppStore((s) => s.locale);

  return {
    t: (path: string, params?: Record<string, string | number>) => t(path, locale as Locale, params),
    locale: locale as Locale,
    dir: locale === 'ar' ? 'rtl' : 'ltr' as 'ltr' | 'rtl',
    isRtl: locale === 'ar',
  };
}
