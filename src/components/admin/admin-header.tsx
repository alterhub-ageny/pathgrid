'use client';

import { useSession, signOut } from 'next-auth/react';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LanguageSwitcher } from '@/components/layout/language-switcher';

export function AdminHeader() {
  const { data: session } = useSession();
  const { toggleSidebar } = useAppStore();

  return (
    <header className="h-16 border-b border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900">
      <div className="flex items-center justify-between h-full px-6">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
          <button className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-navy-100 dark:border-navy-700">
            <div className="text-right">
              <p className="text-sm font-medium text-navy-900 dark:text-white">{session?.user?.name || 'Admin'}</p>
              <p className="text-xs text-navy-400">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors text-navy-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
