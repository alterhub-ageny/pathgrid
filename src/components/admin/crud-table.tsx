'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Upload, Loader2, Download, FileUp } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface FormField {
  key: string;
  label: string;
  type?: string;
  options?: string[];
}

interface CrudTableProps {
  title: string;
  subtitle?: string;
  columns: Column[];
  data?: any[];
  type: string;
  formFields?: FormField[];
}

export function CrudTable({ title, subtitle, columns, data: initialData, type, formFields }: CrudTableProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; edit?: any }>({ open: false });
  const [data, setData] = useState<any[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [uploading, setUploading] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const [richtextValues, setRichtextValues] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    if (initialData) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/data?type=${type}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : json.data || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [type, initialData]);

  useEffect(() => {
    if (!initialData && type) fetchData();
  }, [type, initialData, fetchData]);

  useEffect(() => {
    if (initialData) setData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (!modal.open) { setImagePreviews({}); setRichtextValues({}); }
  }, [modal.open]);

  useEffect(() => {
    if (modal.edit && modal.open) {
      const vals: Record<string, string> = {};
      formFields?.forEach((f) => {
        if (f.type === 'richtext') vals[f.key] = modal.edit[f.key] || '';
      });
      setRichtextValues((prev) => ({ ...prev, ...vals }));
    }
  }, [modal.edit, modal.open, formFields]);

  const filtered = data.filter((row) =>
    Object.values(row).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  const callApi = useCallback(async (action: string, payload: any) => {
    const res = await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, action, data: payload }),
    });
    return res.json();
  }, [type]);

  const handleImageUpload = async (fieldKey: string, file: File) => {
    setUploading(fieldKey);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) {
        setImagePreviews(prev => ({ ...prev, [fieldKey]: json.url }));
        toast.success('Image uploaded');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const item: any = {};

    formFields?.forEach((f) => {
      if (f.type === 'checkbox') {
        item[f.key] = formData.get(f.key) === 'on';
      } else if (f.type === 'image') {
        item[f.key] = imagePreviews[f.key] || modal.edit?.[f.key] || '';
      } else if (f.type === 'richtext') {
        item[f.key] = richtextValues[f.key] || '';
      } else {
        item[f.key] = formData.get(f.key) || '';
      }
    });

    try {
      if (modal.edit?.id) {
        await callApi('update', { id: modal.edit.id, ...item });
        toast.success('Updated');
      } else {
        await callApi('create', item);
        toast.success('Created');
      }
      setModal({ open: false });
      if (!initialData) fetchData();
      else setTimeout(() => window.location.reload(), 500);
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await callApi('delete', { id });
      toast.success('Deleted');
      if (!initialData) fetchData();
      else setTimeout(() => window.location.reload(), 500);
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleExport = () => {
    const exportData = data.map((row: any) => {
      const obj: Record<string, any> = {};
      columns.forEach((col) => {
        obj[col.label] = row[col.key] !== undefined ? String(row[col.key]) : '';
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([buf], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} rows`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);

      if (rows.length === 0) {
        toast.error('No data found in file');
        return;
      }

      const colKeyMap: Record<string, string> = {};
      columns.forEach((col) => { colKeyMap[col.label.toLowerCase()] = col.key; });
      formFields?.forEach((f) => { colKeyMap[f.label.toLowerCase()] = f.key; });

      let imported = 0;
      for (const row of rows) {
        const item: any = {};
        for (const [header, value] of Object.entries(row)) {
          const key = colKeyMap[header.toLowerCase()] || header;
          item[key] = value;
        }
        try {
          await callApi('create', item);
          imported++;
        } catch {
          // skip failed rows
        }
      }

      toast.success(`Imported ${imported} of ${rows.length} rows`);
      if (!initialData) fetchData();
      else setTimeout(() => window.location.reload(), 500);
    } catch {
      toast.error('Import failed');
    } finally {
      setImporting(false);
      if (importRef.current) importRef.current.value = '';
    }
  };

  const renderFormField = (field: FormField) => {
    const currentValue = modal.edit?.[field.key] || '';
    const previewUrl = imagePreviews[field.key] || currentValue;

    if (field.type === 'textarea') {
      return (
        <div key={field.key}>
          <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">{field.label}</label>
          <textarea name={field.key} defaultValue={currentValue} rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500 resize-none" />
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.key}>
          <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">{field.label}</label>
          <select name={field.key} defaultValue={currentValue}
            className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500">
            <option value="">Select {field.label}</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <div key={field.key} className="flex items-center gap-3">
          <input type="checkbox" name={field.key} defaultChecked={modal.edit?.[field.key] === true}
            className="w-5 h-5 rounded border-navy-300 dark:border-navy-600 text-navy-700 dark:text-gold-500 focus:ring-navy-500" />
          <label className="text-sm font-medium text-navy-700 dark:text-white">{field.label}</label>
        </div>
      );
    }

    if (field.type === 'richtext') {
      return (
        <div key={field.key}>
          <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">{field.label}</label>
          <RichTextEditor
            value={richtextValues[field.key] ?? modal.edit?.[field.key] ?? ''}
            onChange={(val) => setRichtextValues((prev) => ({ ...prev, [field.key]: val }))}
            placeholder={field.label}
          />
        </div>
      );
    }

    if (field.type === 'image') {
      return (
        <div key={field.key}>
          <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">{field.label}</label>
          {previewUrl && (
            <div className="mb-2 relative inline-block">
              <img src={previewUrl} alt="Preview" className="h-24 w-auto rounded-lg object-cover border border-navy-200 dark:border-navy-600" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <input type="hidden" name={field.key} value={previewUrl} />
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-700 dark:text-white cursor-pointer hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors text-sm">
              <Upload className="w-4 h-4" />
              {uploading === field.key ? 'Uploading...' : 'Choose Image'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading === field.key}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(field.key, file);
                }} />
            </label>
            {uploading === field.key && <Loader2 className="w-4 h-4 animate-spin text-navy-400" />}
          </div>
        </div>
      );
    }

    return (
      <Input key={field.key} name={field.key} label={field.label} type={field.type || 'text'} defaultValue={currentValue} required />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">{title}</h1>
          {subtitle && <p className="text-navy-500 dark:text-navy-400 mt-1 text-sm">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          <button onClick={() => importRef.current?.click()} disabled={importing}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 text-navy-700 dark:text-white hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors text-sm font-medium disabled:opacity-50">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
            {t('common.import')}
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 text-navy-700 dark:text-white hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            {t('common.export')}
          </button>
          <button onClick={() => setModal({ open: true })}
            className="flex items-center gap-2 px-4 py-2.5 bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" />{t('common.create')}
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
        <input type="text" placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
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
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="py-12 text-center text-navy-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </td></tr>
              ) : filtered.map((row, i) => (
                <motion.tr key={row.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-navy-50 dark:border-navy-800 hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="py-3 px-4">
                      {col.render ? col.render(row[col.key], row) : row[col.key] || '—'}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setModal({ open: true, edit: row })}
                      className="p-1.5 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors">
                      <Edit2 className="w-4 h-4 text-navy-400" />
                    </button>
                    <button onClick={() => handleDelete(row.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-1">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="py-12 text-center text-navy-400">{t('common.noResults')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.edit ? t('common.edit') : t('common.create')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields?.map(renderFormField)}
          <Button type="submit" className="w-full">{modal.edit ? t('common.save') : t('common.create')}</Button>
        </form>
      </Modal>
    </div>
  );
}
