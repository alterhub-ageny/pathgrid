'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

const navItems = [
  { key: 'home', href: '' },
  { key: 'about', href: '/about' },
  { key: 'services', href: '/services' },
  { key: 'portfolio', href: '/portfolio' },
  { key: 'blog', href: '/blog' },
  { key: 'contact', href: '/contact' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const isRtl = useAppStore((s) => s.isRtl);
  const siteSettings = useAppStore((s) => s.siteSettings);

  const localePath = `/${locale}`;

  const isActive = (href: string) => {
    if (href === '') return pathname === localePath || pathname === `${localePath}/`;
    return pathname.startsWith(`${localePath}${href}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-white/80 dark:bg-navy-900/80 backdrop-blur-xl border-b border-navy-100 dark:border-navy-800" />
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link
            href={`/${locale}`}
            className="relative z-10 text-xl font-bold tracking-tight text-navy-900 dark:text-white"
          >
            <span className="font-serif">{siteSettings.siteName || t('common.siteName')}</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive(item.href)
                    ? 'text-navy-900 dark:text-white bg-navy-100 dark:bg-navy-800'
                    : 'text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white hover:bg-navy-50 dark:hover:bg-navy-800/50'
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <Link
              href={`/${locale}/auth/register`}
              className="hidden lg:inline-flex px-4 py-2 text-sm font-medium bg-gold-500 text-white rounded-lg hover:bg-gold-400 transition-colors"
            >
              {t('nav.register')}
            </Link>
            <Link
              href={`/${locale}/auth/login`}
              className="hidden lg:inline-flex px-4 py-2 text-sm font-medium text-navy-700 dark:text-white border border-navy-300 dark:border-navy-600 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="hidden lg:inline-flex px-5 py-2 text-sm font-medium bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-lg hover:bg-navy-800 dark:hover:bg-gold-400 transition-colors"
            >
              {t('common.getStarted')}
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors text-navy-900 dark:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-navy-900 border-b border-navy-100 dark:border-navy-800 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={`/${locale}${item.href}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                    isActive(item.href)
                      ? 'text-navy-900 dark:text-white bg-navy-100 dark:bg-navy-800'
                      : 'text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800/50'
                  )}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
              <hr className="my-3 border-navy-100 dark:border-navy-700" />
              <Link
                href={`/${locale}/auth/register`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-center bg-gold-500 text-white rounded-xl"
              >
                {t('nav.register')}
              </Link>
              <Link
                href={`/${locale}/auth/login`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-center text-navy-700 dark:text-white border border-navy-300 dark:border-navy-600 rounded-xl"
              >
                {t('nav.login')}
              </Link>
              <Link
                href={`/${locale}/contact`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-center bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-xl"
              >
                {t('common.getStarted')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
