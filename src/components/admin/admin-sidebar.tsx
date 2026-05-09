'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, Image, FileText, Users, MessageSquare,
  DollarSign, TrendingUp, Calendar, UserCog, Settings, X, ChevronLeft,
  Target, BarChart3
} from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'admin.dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
  { label: 'admin.services', href: '/admin/services', icon: Briefcase, roles: ['admin', 'staff'] },
  { label: 'admin.portfolio', href: '/admin/portfolio', icon: Image, roles: ['admin', 'staff'] },
  { label: 'admin.blog', href: '/admin/blog', icon: FileText, roles: ['admin', 'staff'] },
  { label: 'admin.team', href: '/admin/team', icon: Users, roles: ['admin', 'staff'] },
  { label: 'admin.testimonials', href: '/admin/testimonials', icon: MessageSquare, roles: ['admin', 'staff'] },
  { label: 'admin.clients', href: '/admin/clients', icon: Users, roles: ['admin'] },
  { label: 'admin.pipeline', href: '/admin/pipeline', icon: Target, roles: ['admin', 'staff'] },
  { label: 'admin.accounting', href: '/admin/accounting', icon: BarChart3, roles: ['admin'] },
  { label: 'admin.invoices', href: '/admin/invoices', icon: DollarSign, roles: ['admin', 'staff'] },
  { label: 'admin.calendar', href: '/admin/calendar', icon: Calendar, roles: ['admin', 'staff'] },
  { label: 'admin.staff', href: '/admin/staff', icon: UserCog, roles: ['admin'] },
  { label: 'admin.settings', href: '/admin/settings', icon: Settings, roles: ['admin'] },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { t, locale } = useTranslation();
  const isRtl = useAppStore((s) => s.isRtl);
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'staff';

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  const localePath = `/${locale}`;

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed top-0 bottom-0 z-50 w-64 bg-white dark:bg-navy-900 border-r border-navy-100 dark:border-navy-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          isRtl ? 'right-0' : 'left-0',
          sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-navy-100 dark:border-navy-800">
          <Link href={`/${locale}/admin/dashboard`} className="text-lg font-bold font-serif">
            {t('common.siteName')}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {visibleItems.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-navy-100 dark:bg-navy-800 text-navy-900 dark:text-white'
                    : 'text-navy-500 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800/50 hover:text-navy-900 dark:hover:text-white'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {t(item.label)}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
