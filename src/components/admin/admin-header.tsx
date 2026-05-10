'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, LogOut, Bell, X, Check, AlertCircle, Info, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { QuickSearch } from '@/components/admin/quick-search';

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

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function AdminHeader() {
  const { data: session } = useSession();
  const { toggleSidebar } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.match(/^\/(en|fr|ar)/)?.[1] || 'en';
  const [notifOpen, setNotifOpen] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifs(true);
    try {
      const res = await fetch('/api/admin/notifications');
      const json = await res.json();
      if (Array.isArray(json)) setList(json);
    } catch {
      // silent
    } finally {
      setLoadingNotifs(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read', data: { id } }),
      });
      setList((prev) => prev.filter((x) => x.id !== id));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read' }),
      });
      setList([]);
    } catch { /* silent */ }
  };

  const handleNotifClick = (n: any) => {
    if (n.link) router.push(n.link);
    markRead(n.id);
    setNotifOpen(false);
  };

  return (
    <header className="h-16 border-b border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900">
      <div className="flex items-center justify-between h-full px-6">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors text-navy-900 dark:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block flex-1 max-w-md mx-4">
          <QuickSearch locale={locale} />
        </div>

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
                      <button onClick={markAllRead} className="text-xs text-navy-400 dark:text-navy-200 hover:text-navy-600 dark:hover:text-navy-200">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {loadingNotifs && list.length === 0 ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-navy-400 dark:text-navy-200" /></div>
                    ) : list.length === 0 ? (
                      <p className="text-center text-sm text-navy-400 dark:text-navy-200 py-8">No notifications</p>
                    ) : (
                      list.map((n) => {
                        const Icon = icons[n.type] || Info;
                        return (
                          <button key={n.id} onClick={() => handleNotifClick(n)}
                            className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-navy-50 dark:hover:bg-navy-700/50 transition-colors border-b border-navy-50 dark:border-navy-700/50 last:border-0">
                            <span className={`p-1.5 rounded-full shrink-0 ${colors[n.type] || colors.info}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-navy-900 dark:text-white">{n.title}</p>
                              {n.message && <p className="text-xs text-navy-400 dark:text-navy-200 mt-0.5">{n.message}</p>}
                              <p className="text-xs text-navy-300 mt-0.5">{formatRelativeTime(n.createdAt)}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); markRead(n.id); }} className="shrink-0 mt-1">
                              <X className="w-3.5 h-3.5 text-navy-300 hover:text-navy-600" />
                            </button>
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
              <p className="text-xs text-navy-400 dark:text-navy-200">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors text-navy-500 dark:text-navy-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
