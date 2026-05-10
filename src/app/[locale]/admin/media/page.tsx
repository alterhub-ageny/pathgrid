'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Image, FileText, Copy, Trash2, Upload, Loader2, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from 'sonner';

interface MediaItem {
  name: string;
  url: string;
  size: number;
  lastModified: string;
  isImage: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) {
        toast.success('Uploaded');
        fetchMedia();
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      if (res.ok) {
        toast.success('Deleted');
        fetchMedia();
      } else {
        toast.error('Delete failed');
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
    toast.success('URL copied');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">{t('admin.media')}</h1>
          <p className="text-navy-500 dark:text-navy-400 mt-1 text-sm">{t('admin.fields.manageMedia')}</p>
        </div>
        <label className="flex items-center gap-2 px-4 py-2.5 bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-xl text-sm font-medium cursor-pointer hover:bg-navy-600 dark:hover:bg-gold-400 transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {t('common.upload')}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="py-20 text-center text-navy-400">
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-navy-400">{t('common.noResults')}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="group relative bg-white dark:bg-navy-800 rounded-xl border border-navy-100 dark:border-navy-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-navy-50 dark:bg-navy-900 flex items-center justify-center overflow-hidden">
                {item.isImage ? (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <FileText className="w-12 h-12 text-navy-300 dark:text-navy-500" />
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium text-navy-700 dark:text-navy-200 truncate" title={item.name}>{item.name}</p>
                <p className="text-xs text-navy-400 mt-0.5">{formatSize(item.size)}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleCopyUrl(item.url)}
                  className="p-1.5 rounded-lg bg-white/90 dark:bg-navy-900/90 hover:bg-white dark:hover:bg-navy-900 shadow-sm transition-colors">
                  {copied === item.url ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-navy-500" />}
                </button>
                <button onClick={() => handleDelete(item.name)}
                  className="p-1.5 rounded-lg bg-white/90 dark:bg-navy-900/90 hover:bg-white dark:hover:bg-navy-900 shadow-sm transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
