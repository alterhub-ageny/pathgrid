'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Loader2, GripVertical } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const COLORS = [
  '#3b82f6', '#eab308', '#a855f7', '#f97316', '#22c55e', '#ef4444',
  '#06b6d4', '#ec4899', '#14b8a6', '#f43f5e', '#8b5cf6', '#84cc16',
];

export default function PipelineStagesPage() {
  const { t } = useTranslation();
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; edit?: any }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchStages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/data?type=stages');
      const json = await res.json();
      setStages(Array.isArray(json) ? json.sort((a: any, b: any) => a.order - b.order) : []);
    } catch { setStages([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStages(); }, [fetchStages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const data = {
      key: (fd.get('key') as string).toLowerCase().replace(/\s+/g, '-'),
      label: fd.get('label') as string,
      color: fd.get('color') as string || '#6366f1',
      order: Number(fd.get('order')) || stages.length,
    };

    try {
      if (modal.edit?.id) {
        await fetch('/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'stages', action: 'update', data: { id: modal.edit.id, ...data } }),
        });
        toast.success('Stage updated');
      } else {
        await fetch('/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'stages', action: 'create', data }),
        });
        toast.success('Stage created');
      }
      setModal({ open: false });
      fetchStages();
    } catch {
      toast.error('Failed to save stage');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'stages', action: 'delete', data: { id } }),
      });
      toast.success('Stage deleted');
      setDeleteConfirm(null);
      fetchStages();
    } catch {
      toast.error('Cannot delete stage — it may be in use');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-navy-400 dark:text-navy-200" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy-900 dark:text-white">Pipeline Stages</h1>
          <p className="text-navy-500 dark:text-navy-300 mt-1">Manage your sales pipeline stages</p>
        </div>
        <button onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Stage
        </button>
      </div>

      <div className="space-y-2">
        {stages.length === 0 ? (
          <Card hover={false} className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-navy-400 dark:text-navy-200">No stages yet. Add your first pipeline stage.</p>
          </Card>
        ) : stages.map((stage, i) => (
          <motion.div key={stage.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card hover={false} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <GripVertical className="w-4 h-4 text-navy-300 shrink-0" />
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-900 dark:text-white truncate">{stage.label}</p>
                  <p className="text-xs text-navy-400 dark:text-navy-200">{stage.key} · Order {stage.order}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setModal({ open: true, edit: stage })}
                  className="p-1.5 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors">
                  <Edit2 className="w-4 h-4 text-navy-400 dark:text-navy-200" />
                </button>
                <button onClick={() => setDeleteConfirm(stage.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.edit ? 'Edit Stage' : 'Add Stage'} size="md">
          <form key={modal.edit?.id || 'new'} onSubmit={handleSubmit} className="space-y-4">
            <Input name="key" label="Key (slug)" defaultValue={modal.edit?.key || ''}
              placeholder="e.g. qualified" required />
          <Input name="label" label="Label" defaultValue={modal.edit?.label || ''}
            placeholder="e.g. Qualified Lead" required />
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" name="color" defaultValue={modal.edit?.color || '#6366f1'}
                className="w-10 h-10 rounded-lg border border-navy-200 dark:border-navy-600 cursor-pointer" />
              <div className="flex gap-1 flex-wrap">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => {
                    const input = document.querySelector<HTMLInputElement>('input[name="color"]');
                    if (input) input.value = c;
                  }}
                    className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          <Input name="order" label="Order" type="number" defaultValue={modal.edit?.order ?? stages.length} />
          <Button type="submit" className="w-full">{modal.edit ? 'Update Stage' : 'Create Stage'}</Button>
        </form>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Stage" size="sm">
        <p className="text-navy-600 dark:text-navy-300 text-sm mb-6">
          Are you sure? Leads in this stage may need reassignment.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => handleDelete(deleteConfirm!)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
