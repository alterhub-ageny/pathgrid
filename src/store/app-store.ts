import { create } from 'zustand';
import type { Locale } from '@/types';

interface AppState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  locale: Locale;
  isRtl: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setLocale: (locale: Locale) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  locale: 'en',
  isRtl: false,
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
}));
