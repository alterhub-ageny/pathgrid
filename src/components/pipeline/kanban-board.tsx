'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Calendar, Trash2, Edit2, Save, X } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn, formatCurrency, formatDateShort } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { LeadStage } from '@/types';

const DEFAULT_STAGES = [
  { key: 'cold', label: 'pipeline.cold', color: '#3b82f6' },
  { key: 'contacted', label: 'pipeline.contacted', color: '#eab308' },
  { key: 'meeting', label: 'pipeline.meeting', color: '#a855f7' },
  { key: 'proposal', label: 'pipeline.proposal', color: '#f97316' },
  { key: 'won', label: 'pipeline.won', color: '#22c55e' },
  { key: 'lost', label: 'pipeline.lost', color: '#ef4444' },
];

export function KanbanBoard({ editId }: { editId?: string }) {
  const { t, isRtl } = useTranslation();
  const [stages, setStages] = useState<{ key: string; label: string; color: string }[]>(DEFAULT_STAGES);
  const [leads, setLeads] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [detailModal, setDetailModal] = useState<{ lead: any; stage: string } | null>(null);
  const [draggedLead, setDraggedLead] = useState<{ lead: any; stage: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ lead: any; stage: string } | null>(null);
  const [editingLead, setEditingLead] = useState<{ lead: any; stage: string } | null>(null);

  const fetchStages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/data?type=stages');
      const json = await res.json();
      const items = Array.isArray(json) ? json : [];
      if (items.length > 0) {
        const mapped = items
          .filter((s: any) => s.key)
          .sort((a: any, b: any) => a.order - b.order)
          .map((s: any) => ({ key: s.key, label: s.label, color: s.color }));
        setStages(mapped);
      }
    } catch { /* use defaults */ }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/data?type=leads');
      const json = await res.json();
      const items = Array.isArray(json) ? json : json.data || [];
      const stageKeys = stages.map(s => s.key);
      const grouped: Record<string, any[]> = {};
      stageKeys.forEach(k => { grouped[k] = []; });
      items.forEach((item: any) => {
        const stage = item.stage || stages[0]?.key || 'cold';
        if (grouped[stage]) grouped[stage].push(item);
        else if (stages[0]) grouped[stages[0].key].push(item);
      });
      setLeads(grouped);
    } catch {
      setLeads({});
    } finally {
      setLoading(false);
    }
  }, [stages]);

  useEffect(() => { fetchStages(); }, []);
  useEffect(() => { if (stages.length > 0) fetchLeads(); }, [stages, fetchLeads]);

  const handleDrop = async (targetStage: string) => {
    if (!draggedLead) return;
    setDragOverStage(null);
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'leads', action: 'update', data: { id: draggedLead.lead.id, stage: targetStage } }),
      });
      fetchLeads();
    } catch { toast.error('Failed to move lead'); }
    setDraggedLead(null);
  };

  const addLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'leads', action: 'create',
          data: {
            name: fd.get('name'), email: fd.get('email'), company: fd.get('company'),
            value: Number(fd.get('value')) || 0, nextFollowUp: fd.get('nextFollowUp') || null,
            stage: stages[0]?.key || 'cold',
          },
        }),
      });
      toast.success('Lead added');
      setAddModal(false);
      fetchLeads();
    } catch { toast.error('Failed to add lead'); }
  };

  const updateLead = async (leadId: string, data: any) => {
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'leads', action: 'update', data: { id: leadId, ...data } }),
      });
      fetchLeads();
    } catch { toast.error('Failed to update'); }
  };

  const deleteLead = async (leadId: string) => {
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'leads', action: 'delete', data: { id: leadId } }),
      });
      fetchLeads();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => { setEditingLead(null); setAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-xl text-sm font-medium hover:bg-navy-800 dark:hover:bg-gold-400 transition-colors">
          <Plus className="w-4 h-4" /> {t('pipeline.addLead')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageLeads = leads[stage.key] || [];
          const totalValue = stageLeads.reduce((s: number, l: any) => s + (l.value || 0), 0);
          return (
            <div key={stage.key}
              onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.key); }}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={() => handleDrop(stage.key)}
              className={cn(
                'rounded-2xl bg-navy-50/50 dark:bg-navy-800/30 p-3 transition-colors',
                dragOverStage === stage.key && 'bg-navy-100 dark:bg-navy-700/50 ring-2 ring-navy-500'
              )}
            >
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                  <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-200">{t(stage.label) || stage.label}</h3>
                  <span className="text-xs text-navy-400 dark:text-navy-200 bg-navy-100 dark:bg-navy-700 px-1.5 py-0.5 rounded-full">{stageLeads.length}</span>
                </div>
              </div>

              {totalValue > 0 && (
                <p className="text-xs text-navy-400 dark:text-navy-200 mb-3 px-2">{formatCurrency(totalValue)}</p>
              )}

              <div className="space-y-2">
                <AnimatePresence>
                  {stageLeads.map((lead: any) => (
                    <motion.div
                      key={lead.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      draggable
                      onDragStart={() => setDraggedLead({ lead, stage: stage.key })}
                      onClick={() => setDetailModal({ lead, stage: stage.key })}
                      className="bg-white dark:bg-navy-900 rounded-xl p-3 shadow-sm border border-navy-100 dark:border-navy-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-navy-900 dark:text-white">{lead.name}</p>
                        <GripVertical className="w-3 h-3 text-navy-300 flex-shrink-0 mt-0.5" />
                      </div>
                      {lead.company && (
                        <p className="text-xs text-navy-400 dark:text-navy-200 mb-2">{lead.company}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {lead.score && (
                            <span className={cn(
                              'text-xs px-1.5 py-0.5 rounded-full font-medium',
                              lead.score >= 80 ? 'bg-green-100 text-green-700' :
                              lead.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            )}>
                              {lead.score}
                            </span>
                          )}
                        </div>
                        {lead.value > 0 && (
                          <span className="text-xs font-medium text-navy-700 dark:text-gold-500">{formatCurrency(lead.value)}</span>
                        )}
                      </div>
                      {lead.nextFollowUp && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-navy-400 dark:text-navy-200">
                          <Calendar className="w-3 h-3" />
                          {formatDateShort(lead.nextFollowUp)}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={addModal} onClose={() => setAddModal(false)} title={t('pipeline.addLead')}>
        <form onSubmit={addLead} className="space-y-4">
          <Input name="name" label="Name" required />
          <Input name="email" label="Email" type="email" required />
          <Input name="company" label="Company" />
          <Input name="value" label="Value ($)" type="number" />
          <Input name="nextFollowUp" label="Next Follow Up" type="date" />
          <Button type="submit" className="w-full">{t('common.create')}</Button>
        </form>
      </Modal>

      <Modal open={!!detailModal && !editingLead} onClose={() => setDetailModal(null)} title={detailModal?.lead.name || ''}>
        {detailModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {stages.find(s => s.key === detailModal.stage) && (
                <div>
                  <p className="text-xs text-navy-400 dark:text-navy-200">Stage</p>
                  <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full mt-1 bg-navy-100 dark:bg-navy-700"
                    style={{ color: stages.find(s => s.key === detailModal.stage)?.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stages.find(s => s.key === detailModal.stage)?.color }} />
                    {t(`pipeline.${detailModal.stage}`) || detailModal.stage}
                  </span>
                </div>
              )}
              <div>
                <p className="text-xs text-navy-400 dark:text-navy-200">{t('pipeline.value')}</p>
                <p className="text-sm font-medium">{formatCurrency(detailModal.lead.value || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400 dark:text-navy-200">{t('pipeline.source')}</p>
                <p className="text-sm font-medium">{detailModal.lead.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400 dark:text-navy-200">{t('pipeline.leadScore')}</p>
                <p className="text-sm font-medium">{detailModal.lead.score || 'N/A'}</p>
              </div>
            </div>
            {detailModal.lead.notes && (
              <div>
                <p className="text-xs text-navy-400 dark:text-navy-200 mb-1">Notes</p>
                <p className="text-sm">{detailModal.lead.notes}</p>
              </div>
            )}
            {detailModal.lead.nextFollowUp && (
              <div>
                <p className="text-xs text-navy-400 dark:text-navy-200 mb-1">Next Follow Up</p>
                <p className="text-sm">{formatDateShort(detailModal.lead.nextFollowUp)}</p>
              </div>
            )}
            {detailModal.lead.phone && (
              <div>
                <p className="text-xs text-navy-400 dark:text-navy-200 mb-1">Phone</p>
                <p className="text-sm">{detailModal.lead.phone}</p>
              </div>
            )}
            <AIScoreInfo leadId={detailModal.lead.id} />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditingLead(detailModal)}>
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => { setDeleteConfirm(detailModal); }}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {editingLead && (
        <Modal open={true} onClose={() => setEditingLead(null)} title={`Edit ${editingLead.lead.name}`}>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const fd = new FormData(form);
            const data: any = {
              name: fd.get('name'), email: fd.get('email'), company: fd.get('company'),
              phone: fd.get('phone'), value: Number(fd.get('value')) || 0,
              stage: fd.get('stage'), notes: fd.get('notes'),
              nextFollowUp: fd.get('nextFollowUp') || null,
            };
            updateLead(editingLead.lead.id, data);
            setEditingLead(null);
            setDetailModal(null);
          }} className="space-y-4">
            <Input name="name" label="Name" defaultValue={editingLead.lead.name} required />
            <Input name="email" label="Email" type="email" defaultValue={editingLead.lead.email} required />
            <Input name="company" label="Company" defaultValue={editingLead.lead.company || ''} />
            <Input name="phone" label="Phone" defaultValue={editingLead.lead.phone || ''} />
            <Input name="value" label="Value ($)" type="number" defaultValue={editingLead.lead.value || 0} />
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">Stage</label>
              <select name="stage" defaultValue={editingLead.stage}
                className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500">
                {stages.map((s) => (
                  <option key={s.key} value={s.key}>{t(s.label) || s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">Notes</label>
              <textarea name="notes" defaultValue={editingLead.lead.notes || ''} rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500 resize-none" />
            </div>
            <Input name="nextFollowUp" label="Next Follow Up" type="date" defaultValue={editingLead.lead.nextFollowUp ? editingLead.lead.nextFollowUp.slice(0, 10) : ''} />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1"><Save className="w-4 h-4 mr-1" /> Save</Button>
              <Button variant="outline" className="flex-1" onClick={() => setEditingLead(null)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
            </div>
          </form>
        </Modal>
      )}

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete" size="sm">
        <p className="text-navy-600 dark:text-navy-300 text-sm mb-6">Delete {deleteConfirm?.lead.name}? They will be moved to trash.</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => {
            if (deleteConfirm) deleteLead(deleteConfirm.lead.id);
            setDeleteConfirm(null);
            setDetailModal(null);
          }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

function AIScoreInfo({ leadId }: { leadId: string }) {
  const { t } = useTranslation();
  const [data, setData] = useState<{ score: number; recommendation: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchScore = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/lead-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });
      const json = await res.json();
      if (json.score !== undefined) setData(json);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [leadId]);

  useEffect(() => { fetchScore(); }, [leadId]);

  if (!data && !loading) return null;

  return (
    <div className="p-3 rounded-xl bg-navy-50 dark:bg-navy-800/50 border border-navy-100 dark:border-navy-700">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-navy-400 dark:text-navy-200 font-medium">AI Score</p>
        <button onClick={fetchScore} disabled={loading}
          className="text-[10px] text-navy-400 dark:text-navy-200 hover:text-navy-600 dark:hover:text-navy-200 disabled:opacity-50">
          {loading ? '...' : 'Recalculate'}
        </button>
      </div>
      {data ? (
        <>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-1.5 bg-navy-200 dark:bg-navy-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${data.score}%`, backgroundColor: data.score >= 80 ? '#22c55e' : data.score >= 50 ? '#eab308' : '#ef4444' }} />
            </div>
            <span className="text-sm font-bold">{data.score}</span>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400">{data.recommendation}</p>
        </>
      ) : (
        <p className="text-xs text-navy-400 dark:text-navy-200">Calculating...</p>
      )}
    </div>
  );
}
