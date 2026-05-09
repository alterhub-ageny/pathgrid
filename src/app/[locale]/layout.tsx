'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Inter, Playfair_Display, Noto_Naskh_Arabic } from 'next/font/google';
import { Toaster } from 'sonner';
import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAppStore } from '@/store/app-store';
import { localeDirections } from '@/lib/i18n';
import type { Locale } from '@/types';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
});

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as Locale) || 'en';
  const { setLocale } = useAppStore();

  const isAdmin = pathname?.includes('/admin/') || pathname?.endsWith('/admin');
  const isClientPortal = pathname?.includes('/client-portal/') || pathname?.endsWith('/client-portal');
  const isAuth = pathname?.includes('/auth/');

  useEffect(() => {
    setLocale(locale);
  }, [locale, setLocale]);

  const dir = localeDirections[locale as keyof typeof localeDirections] || 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

  return (
    <SessionProvider>
      <html
        lang={locale}
        dir={dir}
        className={`${inter.variable} ${playfair.variable} ${notoNaskh.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen bg-white dark:bg-navy-900 text-navy-900 dark:text-white antialiased">
          <Toaster position={dir === 'rtl' ? 'top-left' : 'top-right'} richColors />
          {!isAdmin && !isClientPortal && !isAuth && <Header />}
          <main className="min-h-screen">{children}</main>
          {!isAdmin && !isClientPortal && !isAuth && <Footer />}
        </body>
      </html>
    </SessionProvider>
  );
}
