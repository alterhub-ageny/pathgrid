import { create } from 'zustand';
import type { Locale } from '@/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AppState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  locale: Locale;
  isRtl: boolean;
  siteSettings: Record<string, string>;
  chatOpen: boolean;
  chatMessages: ChatMessage[];
  chatSessionId: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setLocale: (locale: Locale) => void;
  fetchSettings: () => Promise<void>;
  setChatOpen: (open: boolean) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChatMessages: (msgs: ChatMessage[]) => void;
  setChatSessionId: (id: string | null) => void;
  resetChat: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  locale: 'en',
  isRtl: false,
  siteSettings: {},
  chatOpen: false,
  chatMessages: [{ role: 'assistant', content: 'Hi! I\'m PathgridAI. How can I help you today?' }],
  chatSessionId: null,
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
  setChatOpen: (open) => set({ chatOpen: open }),
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  setChatMessages: (msgs) => set({ chatMessages: msgs }),
  setChatSessionId: (id) => set({ chatSessionId: id }),
  resetChat: () => set({ chatMessages: [{ role: 'assistant', content: 'Hi! I\'m PathgridAI. How can I help you today?' }], chatSessionId: null }),
}));
