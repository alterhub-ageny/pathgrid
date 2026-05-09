'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, LogOut, Bell, X, Check, AlertCircle, Info } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LanguageSwitcher } from '@/components/layout/language-switcher';

const notifications = [
  { id: '1', type: 'info', text: 'New lead from TechVentures', time: '2 min ago' },
  { id: '2', type: 'success', text: 'Invoice INV-2025-0042 paid', time: '1 hour ago' },
  { id: '3', type: 'warning', text: 'Project deadline approaching', time: '3 hours ago' },
  { id: '4', type: 'alert', text: 'Server backup completed', time: '5 hours ago' },
];

const icons: Record<string, any> = {
  info: Info,
  success: Check,
  warning: AlertCircle,
  alert: AlertCircle,
};

const colors: Record<string, string> = {
  info: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  success: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  warning: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
  alert: 'text-red-500 bg-red-100 dark:bg-red-900/30',
};

export function AdminHeader() {
  const { data: session } = useSession();
  const { toggleSidebar } = useAppStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [list, setList] = useState(notifications);

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
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors relative">
              <Bell className="w-4 h-4" />
              {list.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-navy-100 dark:border-navy-700 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100 dark:border-navy-700">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    {list.length > 0 && (
                      <button onClick={() => setList([])} className="text-xs text-navy-400 hover:text-navy-600 dark:hover:text-navy-200">
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {list.length === 0 ? (
                      <p className="text-center text-sm text-navy-400 py-8">No notifications</p>
                    ) : (
                      list.map((n) => {
                        const Icon = icons[n.type];
                        return (
                          <button key={n.id} onClick={() => setList((prev) => prev.filter((x) => x.id !== n.id))}
                            className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-navy-50 dark:hover:bg-navy-700/50 transition-colors border-b border-navy-50 dark:border-navy-700/50 last:border-0">
                            <span className={`p-1.5 rounded-full shrink-0 ${colors[n.type]}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-navy-900 dark:text-white">{n.text}</p>
                              <p className="text-xs text-navy-400 mt-0.5">{n.time}</p>
                            </div>
                            <X className="w-3.5 h-3.5 text-navy-300 shrink-0 mt-1" />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
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
