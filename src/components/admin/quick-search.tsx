'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Users, Target, FileText, StickyNote, DollarSign, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';

const searchTypes = [
  { key: 'leads', icon: Target, href: '/admin/pipeline', label: 'Leads' },
  { key: 'clients', icon: Users, href: '/admin/clients', label: 'Clients' },
  { key: 'invoices', icon: DollarSign, href: '/admin/invoices', label: 'Invoices' },
  { key: 'notes', icon: StickyNote, href: '/admin/notes', label: 'Notes' },
  { key: 'tasks', icon: FileText, href: '/admin/dashboard', label: 'Tasks' },
];

export function QuickSearch({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!open) {
      setQuery('');
      setResults({});
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({});
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.toLowerCase();
      const all: Record<string, any[]> = {};
      await Promise.all(searchTypes.map(async (t) => {
        try {
          const res = await fetch(`/api/admin/data?type=${t.key}`);
          const json = await res.json();
          const items = Array.isArray(json) ? json : [];
          all[t.key] = items.filter((item: any) =>
            (item.name || item.title || item.number || '').toLowerCase().includes(q) ||
            (item.email || '').toLowerCase().includes(q) ||
            (item.company || '').toLowerCase().includes(q)
          ).slice(0, 5);
        } catch { all[t.key] = []; }
      }));
      setResults(all);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (type: string, id: string) => {
    setOpen(false);
    router.push(`/${locale}/admin/${type}?edit=${id}`);
  };

  const totalResults = Object.values(results).reduce((s, arr) => s + arr.length, 0);

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-navy-400 bg-navy-100 dark:bg-navy-800 rounded-lg hover:bg-navy-200 dark:hover:bg-navy-700 transition-colors">
        <Search className="w-3.5 h-3.5" />
        Search...
        <kbd className="px-1 py-0.5 text-[10px] rounded bg-navy-200 dark:bg-navy-600 text-navy-500 dark:text-navy-300 ml-4">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-navy-100 dark:border-navy-700 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-navy-100 dark:border-navy-700">
                <Search className="w-4 h-4 text-navy-400 shrink-0" />
                <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search leads, clients, invoices, notes..."
                  className="flex-1 text-sm bg-transparent outline-none text-navy-900 dark:text-white placeholder:text-navy-400" />
                {loading && <Loader2 className="w-4 h-4 animate-spin text-navy-400" />}
                <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-navy-100 dark:bg-navy-700 text-navy-400">ESC</kbd>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {query.length >= 2 && totalResults === 0 && !loading && (
                  <p className="text-sm text-navy-400 text-center py-8">No results found</p>
                )}
                {searchTypes.map((t) => {
                  const items = results[t.key] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={t.key}>
                      <div className="flex items-center gap-2 px-4 py-2 bg-navy-50 dark:bg-navy-900/50">
                        <t.icon className="w-3.5 h-3.5 text-navy-400" />
                        <span className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider">{t.label}</span>
                      </div>
                      {items.map((item: any) => (
                        <button key={item.id} onClick={() => handleSelect(t.key, item.id)}
                          className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-navy-50 dark:hover:bg-navy-700/50 transition-colors border-b border-navy-50 dark:border-navy-700/50 last:border-0">
                          <t.icon className="w-4 h-4 text-navy-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-navy-900 dark:text-white truncate">{item.name || item.title || item.number}</p>
                            <p className="text-xs text-navy-400 truncate">{item.email || item.company || item.description || item.category || ''}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
