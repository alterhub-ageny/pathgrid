'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FolderKanban, FileText, MessageSquare, Download, Menu, X, LogOut, Loader2, Bell } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'client.projects', href: '/client-portal/projects', icon: FolderKanban },
  { label: 'client.invoices', href: '/client-portal/invoices', icon: FileText },
  { label: 'client.messages', href: '/client-portal/messages', icon: MessageSquare },
  { label: 'client.assets', href: '/client-portal/assets', icon: Download },
];

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const isRtl = useAppStore((s) => s.isRtl);

  const locale = useMemo(() => {
    const match = pathname?.match(/^\/(en|fr|ar)/);
    return match?.[1] || 'en';
  }, [pathname]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/${locale}/auth/login`);
    }
  }, [status, router, locale]);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchUnread = async () => {
        try {
          const res = await fetch('/api/client/data?type=stats');
          const data = await res.json();
          if (data?.unreadMessages) setUnread(data.unreadMessages);
        } catch { /* silent */ }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 15000);
      return () => clearInterval(interval);
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy-300 border-t-navy-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const isActive = (href: string) => pathname.includes(href);

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900">
      {/* Client Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-navy-900/90 backdrop-blur-xl border-b border-navy-100 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link href={`/${locale}/client-portal`} className="text-lg font-bold font-serif text-navy-900 dark:text-white">
                Pathgrid
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors relative',
                    isActive(item.href)
                      ? 'bg-navy-100 dark:bg-navy-800 text-navy-900 dark:text-white'
                      : 'text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white hover:bg-navy-50 dark:hover:bg-navy-800/50'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label === 'client.messages' ? 'Messages' : item.label === 'client.projects' ? 'Projects' : item.label === 'client.invoices' ? 'Invoices' : 'Assets'}</span>
                  {item.label === 'client.messages' && unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
              <div className="flex items-center gap-3 pl-3 border-l border-navy-100 dark:border-navy-700">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-navy-900 dark:text-white">{session.user?.name}</p>
                  <p className="text-xs text-navy-400">Client</p>
                </div>
                <button
                  onClick={() => router.push(`/${locale}/auth/login`)}
                  className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors text-navy-500"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="lg:hidden border-t border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors relative',
                    isActive(item.href)
                      ? 'bg-navy-100 dark:bg-navy-800 text-navy-900 dark:text-white'
                      : 'text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800/50'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label === 'client.messages' ? 'Messages' : item.label === 'client.projects' ? 'Projects' : item.label === 'client.invoices' ? 'Invoices' : 'Assets'}</span>
                  {item.label === 'client.messages' && unread > 0 && (
                    <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Link>
              ))}
              <hr className="my-2 border-navy-100 dark:border-navy-700" />
              <button
                onClick={() => router.push(`/${locale}/auth/login`)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl w-full"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </header>

      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
