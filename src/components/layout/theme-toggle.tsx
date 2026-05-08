'use client';

import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </button>
  );
}
