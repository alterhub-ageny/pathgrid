import { create } from 'zustand';
import type { Locale } from '@/types';

interface AppState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  locale: Locale;
  isRtl: boolean;
  siteSettings: Record<string, string>;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setLocale: (locale: Locale) => void;
  fetchSettings: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  locale: 'en',
  isRtl: false,
  siteSettings: {},
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  },
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'light' ? 'dark' : 'light';
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next === 'dark');
      }
      return { theme: next };
    }),
  setLocale: (locale) =>
    set({
      locale,
      isRtl: locale === 'ar',
    }),
  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (typeof data === 'object' && !Array.isArray(data)) {
        set({ siteSettings: data });
      }
    } catch { /* ignore */ }
  },
}));
