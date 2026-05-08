'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface CrudTableProps {
  title: string;
  subtitle?: string;
  columns: Column[];
  data: any[];
  onSave?: (item: any) => void;
  onDelete?: (id: string) => void;
  formFields?: { key: string; label: string; type?: string }[];
}

export function CrudTable({ title, subtitle, columns, data, onSave, onDelete, formFields }: CrudTableProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; edit?: any }>({ open: false });

  const filtered = data.filter((row) =>
    Object.values(row).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const item: any = {};
    formFields?.forEach((f) => { item[f.key] = formData.get(f.key); });
    if (modal.edit?.id) item.id = modal.edit.id;
    onSave?.(item);
    setModal({ open: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">{title}</h1>
          {subtitle && <p className="text-navy-500 dark:text-navy-400 mt-1 text-sm">{subtitle}</p>}
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-xl text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {t('common.create')}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
        <input
          type="text"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
        />
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-100 dark:border-navy-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 dark:border-navy-700 bg-navy-50 dark:bg-navy-800/50">
                {columns.map((col) => (
                  <th key={col.key} className="text-left py-3 px-4 font-medium text-navy-400">{col.label}</th>
                ))}
                <th className="text-right py-3 px-4 font-medium text-navy-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <motion.tr
                  key={row.id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-navy-50 dark:border-navy-800 hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="py-3 px-4">
                      {col.render ? col.render(row[col.key], row) : row[col.key] || '—'}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setModal({ open: true, edit: row })}
                      className="p-1.5 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-navy-400" />
                    </button>
                    <button
                      onClick={() => onDelete?.(row.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center text-navy-400">{t('common.noResults')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.edit ? t('common.edit') : t('common.create')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields?.map((field) => (
            <Input
              key={field.key}
              name={field.key}
              label={field.label}
              type={field.type || 'text'}
              defaultValue={modal.edit?.[field.key] || ''}
              required
            />
          ))}
          <Button type="submit" className="w-full">{modal.edit ? t('common.save') : t('common.create')}</Button>
        </form>
      </Modal>
    </div>
  );
}
