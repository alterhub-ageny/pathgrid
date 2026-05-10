'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, AlertTriangle, Loader2, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const typeColors: Record<string, string> = {
  invoices: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  leads: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  projects: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  notes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  tasks: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'calendar-events': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  transactions: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  clients: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  conversations: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  messages: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

export default function AdminTrashPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [restoring, setRestoring] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string[]>([]);

  const fetchTrash = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/trash');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchTrash().finally(() => setLoading(false)); }, [fetchTrash]);

  const restore = async (id: string, type: string) => {
    setRestoring((p) => [...p, id]);
    try {
      const res = await fetch('/api/admin/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', data: { id, type } }),
      });
      if (res.ok) {
        setItems((p) => p.filter((i) => i.id !== id));
        toast.success('Item restored');
      }
    } catch { toast.error('Failed to restore'); }
    finally { setRestoring((p) => p.filter((x) => x !== id)); }
  };

  const forceDelete = async (id: string, type: string) => {
    if (!confirm('Permanently delete this item? This cannot be undone.')) return;
    setDeleting((p) => [...p, id]);
    try {
      const res = await fetch('/api/admin/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'force-delete', data: { id, type } }),
      });
      if (res.ok) {
        setItems((p) => p.filter((i) => i.id !== id));
        toast.success('Item permanently deleted');
      }
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting((p) => p.filter((x) => x !== id)); }
  };

  const emptyTrash = async () => {
    if (!confirm('Permanently delete ALL items in trash? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'empty-trash' }),
      });
      if (res.ok) {
        setItems([]);
        toast.success('Trash emptied');
      }
    } catch { toast.error('Failed'); }
  };

  const types = [...new Set(items.map((i) => i.type))];
  const filtered = items.filter((i) => {
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    if (search && !i.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy-900 dark:text-white">Trash</h1>
          <p className="text-navy-500 dark:text-navy-400 mt-1">Items are kept for 30 days before permanent deletion</p>
        </div>
        {items.length > 0 && (
          <Button variant="danger" onClick={emptyTrash}>
            <Trash2 className="w-4 h-4 mr-2" /> Empty Trash
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 dark:text-navy-200" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trash..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500"
        >
          <option value="all">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-navy-400 dark:text-navy-200" /></div>
      ) : filtered.length === 0 ? (
        <Card hover={false} className="flex flex-col items-center justify-center py-16">
          <Trash2 className="w-16 h-16 text-navy-300 dark:text-navy-600 mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">Trash is empty</h3>
          <p className="text-sm text-navy-400 dark:text-navy-200">Deleted items will appear here</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-navy-400 dark:text-navy-200">{filtered.length} item(s) in trash</p>
          {filtered.map((item, i) => (
            <motion.div
              key={`${item.type}-${item.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Card hover={false} className="flex items-center justify-between gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={typeColors[item.type] || ''}>{item.label}</Badge>
                    <span className="text-sm font-semibold text-navy-900 dark:text-white truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-navy-400 dark:text-navy-200">
                    <span>Deleted {item.daysAgo}d ago</span>
                    {item.expiresIn > 0 ? (
                      <span className="text-amber-500">Expires in {item.expiresIn}d</span>
                    ) : (
                      <span className="text-red-500">Expired</span>
                    )}
                    {item.clientName && <span>Client: {item.clientName}</span>}
                    {item.senderName && <span>Sender: {item.senderName}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => restore(item.id, item.type)}
                    loading={restoring.includes(item.id)}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" /> Restore
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => forceDelete(item.id, item.type)}
                    loading={deleting.includes(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
