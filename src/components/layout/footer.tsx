'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';

export function Footer() {
  const { t, locale } = useTranslation();
  const siteSettings = useAppStore((s) => s.siteSettings);

  const footerLinks = [
    { label: t('nav.services'), href: `/${locale}/services` },
    { label: t('nav.portfolio'), href: `/${locale}/portfolio` },
    { label: t('nav.blog'), href: `/${locale}/blog` },
    { label: t('nav.about'), href: `/${locale}/about` },
    { label: t('nav.contact'), href: `/${locale}/contact` },
  ];

  return (
    <footer className="bg-navy-900 dark:bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-serif font-bold mb-4">{siteSettings.siteName || t('common.siteName')}</h3>
            <p className="text-navy-200 max-w-md leading-relaxed">
              {siteSettings.tagline || t('common.tagline')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-500 mb-4">
              {t('nav.services')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-navy-300 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-500 mb-4">
              {t('common.contactUs')}
            </h4>
            <ul className="space-y-3 text-navy-300 text-sm">
              <li>{siteSettings.email || 'hello@pathgrid.agency'}</li>
              <li>{siteSettings.phone || '+1 (555) 123-4567'}</li>
              <li>{siteSettings.address || 'San Francisco, CA'}</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-navy-400 text-sm">
            &copy; {new Date().getFullYear()} {siteSettings.siteName || t('common.siteName')}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {siteSettings.twitter ? (
              <a href={siteSettings.twitter} target="_blank" rel="noopener noreferrer" className="text-navy-400 hover:text-white transition-colors text-sm">Twitter</a>
            ) : (
              <a href="#" className="text-navy-400 hover:text-white transition-colors text-sm">Twitter</a>
            )}
            {siteSettings.linkedin ? (
              <a href={siteSettings.linkedin} target="_blank" rel="noopener noreferrer" className="text-navy-400 hover:text-white transition-colors text-sm">LinkedIn</a>
            ) : (
              <a href="#" className="text-navy-400 hover:text-white transition-colors text-sm">LinkedIn</a>
            )}
            {siteSettings.dribbble ? (
              <a href={siteSettings.dribbble} target="_blank" rel="noopener noreferrer" className="text-navy-400 hover:text-white transition-colors text-sm">Dribbble</a>
            ) : (
              <a href="#" className="text-navy-400 hover:text-white transition-colors text-sm">Dribbble</a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
