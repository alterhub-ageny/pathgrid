'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { localeNames, type Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale } = useAppStore();
  const isRtl = useAppStore((s) => s.isRtl);

  const switchLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    setOpen(false);
    const segments = pathname.split('/').filter(Boolean);
    if (['en', 'fr', 'ar'].includes(segments[0])) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    router.push(`/${segments.join('/')}`);
  };

  const locales: Locale[] = ['en', 'fr', 'ar'];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              'absolute top-full mt-1 z-50 bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-navy-100 dark:border-navy-700 py-1 min-w-[140px]',
              isRtl ? 'left-0' : 'right-0'
            )}
          >
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className={cn(
                  'w-full px-4 py-2 text-sm text-left hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors',
                  locale === l ? 'text-navy-900 dark:text-white font-medium' : 'text-navy-500 dark:text-navy-300'
                )}
              >
                {localeNames[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
