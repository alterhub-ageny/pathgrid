'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Calendar, Trash2, Edit2, Save, X } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn, getStageColor, formatCurrency, formatDateShort } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { LeadStage } from '@/types';

const stages: { key: LeadStage; label: string }[] = [
  { key: 'cold', label: 'pipeline.cold' },
  { key: 'contacted', label: 'pipeline.contacted' },
  { key: 'meeting', label: 'pipeline.meeting' },
  { key: 'proposal', label: 'pipeline.proposal' },
  { key: 'won', label: 'pipeline.won' },
  { key: 'lost', label: 'pipeline.lost' },
];

export function KanbanBoard({ editId }: { editId?: string }) {
  const { t, isRtl } = useTranslation();
  const [leads, setLeads] = useState<Record<LeadStage, any[]>>({
    cold: [], contacted: [], meeting: [], proposal: [], won: [], lost: [],
  });
  const [loading, setLoading] = useState(true);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [detailModal, setDetailModal] = useState<{ lead: any; stage: LeadStage } | null>(null);
  const [draggedLead, setDraggedLead] = useState<{ lead: any; stage: LeadStage } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ lead: any; stage: LeadStage } | null>(null);
  const [editingLead, setEditingLead] = useState<{ lead: any; stage: LeadStage } | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/data?type=leads');
      const json = await res.json();
      const items = Array.isArray(json) ? json : json.data || [];
      const grouped: Record<LeadStage, any[]> = {
        cold: [], contacted: [], meeting: [], proposal: [], won: [], lost: [],
      };
      items.forEach((item: any) => {
        const stage = (item.stage as LeadStage) || 'cold';
        if (grouped[stage]) grouped[stage].push(item);
        else grouped.cold.push(item);
      });
      setLeads(grouped);
    } catch {
      // keep empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Auto-open detail/edit modal from ?edit= URL param
  useEffect(() => {
    if (!editId || !Object.values(leads).some((arr) => arr.length > 0)) return;
    for (const stage of Object.keys(leads) as LeadStage[]) {
      const found = leads[stage].find((l: any) => l.id === editId);
      if (found) {
        setDetailModal({ lead: found, stage });
        return;
      }
    }
  }, [editId, leads]);

  const handleDragStart = (lead: any, stage: LeadStage) => {
    setDraggedLead({ lead, stage });
  };

  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = async (targetStage: LeadStage) => {
    if (!draggedLead || draggedLead.stage === targetStage) {
      setDragOverStage(null);
      return;
    }

    setLeads((prev) => {
      const updated = { ...prev };
      updated[draggedLead.stage] = updated[draggedLead.stage].filter(
        (l: any) => l.id !== draggedLead.lead.id
      );
      updated[targetStage] = [
        ...updated[targetStage],
        { ...draggedLead.lead, stage: targetStage },
      ];
      return updated;
    });

    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'leads',
          action: 'update',
          data: { id: draggedLead.lead.id, stage: targetStage },
        }),
      });
    } catch {
      toast.error('Failed to update lead stage');
      fetchLeads();
    }

    setDraggedLead(null);
    setDragOverStage(null);
  };

  const addLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const payload = {
      name: data.get('name') as string,
      email: data.get('email') as string,
      company: (data.get('company') as string) || '',
      value: Number(data.get('value')) || 0,
      stage: 'cold' as LeadStage,
      score: Math.floor(Math.random() * 50) + 30,
      nextFollowUp: (data.get('nextFollowUp') as string) || null,
    };

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'leads', action: 'create', data: payload }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Lead added');
        setAddModal(false);
        fetchLeads();
      } else {
        toast.error('Failed to add lead');
      }
    } catch {
      toast.error('Failed to add lead');
    }
  };

  const saveLeadEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const payload = {
      id: editingLead.lead.id,
      name: data.get('name') as string,
      email: data.get('email') as string,
      company: (data.get('company') as string) || '',
      value: Number(data.get('value')) || 0,
      score: Number(data.get('score')) || 0,
      stage: data.get('stage') as string,
      notes: (data.get('notes') as string) || '',
      phone: (data.get('phone') as string) || '',
      nextFollowUp: (data.get('nextFollowUp') as string) || null,
    };

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'leads', action: 'update', data: payload }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Lead updated');
        setEditingLead(null);
        setDetailModal(null);
        fetchLeads();
      } else {
        toast.error('Failed to update lead');
      }
    } catch {
      toast.error('Failed to update lead');
    }
  };

  const deleteLead = async () => {
    if (!deleteConfirm) return;
    const { lead } = deleteConfirm;

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'leads', action: 'delete', data: { id: lead.id } }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Lead deleted');
        setDeleteConfirm(null);
        setDetailModal(null);
        fetchLeads();
      } else {
        toast.error('Failed to delete lead');
      }
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const totalLeads = Object.values(leads).reduce((sum, arr) => sum + arr.length, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-navy-300 border-t-navy-700 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">{t('pipeline.title')}</h1>
          <p className="text-navy-500 dark:text-navy-400 mt-1">{totalLeads} total leads</p>
        </div>
        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-xl text-sm font-medium hover:bg-navy-800 dark:hover:bg-gold-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('pipeline.addLead')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-h-[600px]">
        {stages.map((stage) => {
          const stageLeads = leads[stage.key] || [];
          const totalValue = stageLeads.reduce((sum: number, l: any) => sum + (l.value || 0), 0);
          return (
            <div
              key={stage.key}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={() => setDragOverStage(null)}
              onDrop={() => handleDrop(stage.key)}
              className={cn(
                'rounded-2xl bg-navy-50/50 dark:bg-navy-800/30 p-3 transition-colors',
                dragOverStage === stage.key && 'bg-navy-100 dark:bg-navy-700/50 ring-2 ring-navy-500'
              )}
            >
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', getStageBg(stage.key))} />
                  <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-200">{t(stage.label)}</h3>
                  <span className="text-xs text-navy-400 bg-navy-100 dark:bg-navy-700 px-1.5 py-0.5 rounded-full">{stageLeads.length}</span>
                </div>
              </div>

              {totalValue > 0 && (
                <p className="text-xs text-navy-400 mb-3 px-2">{formatCurrency(totalValue)}</p>
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
                      onDragStart={() => handleDragStart(lead, stage.key)}
                      onClick={() => setDetailModal({ lead, stage: stage.key })}
                      className="bg-white dark:bg-navy-900 rounded-xl p-3 shadow-sm border border-navy-100 dark:border-navy-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-navy-900 dark:text-white">{lead.name}</p>
                        <GripVertical className="w-3 h-3 text-navy-300 flex-shrink-0 mt-0.5" />
                      </div>
                      {lead.company && (
                        <p className="text-xs text-navy-400 mb-2">{lead.company}</p>
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
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-navy-400">
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
              <div>
                <p className="text-xs text-navy-400">{t('pipeline.source')}</p>
                <p className="text-sm font-medium">{detailModal.lead.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400">{t('pipeline.value')}</p>
                <p className="text-sm font-medium">{formatCurrency(detailModal.lead.value || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400">{t('pipeline.leadScore')}</p>
                <p className="text-sm font-medium">{detailModal.lead.score || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400">Stage</p>
                <span className={cn('inline-block text-xs px-2 py-0.5 rounded-full mt-1', getStageColor(detailModal.stage))}>{t(`pipeline.${detailModal.stage}`)}</span>
              </div>
            </div>
            {detailModal.lead.notes && (
              <div>
                <p className="text-xs text-navy-400 mb-1">Notes</p>
                <p className="text-sm">{detailModal.lead.notes}</p>
              </div>
            )}
            {detailModal.lead.nextFollowUp && (
              <div>
                <p className="text-xs text-navy-400 mb-1">Next Follow Up</p>
                <p className="text-sm">{formatDateShort(detailModal.lead.nextFollowUp)}</p>
              </div>
            )}
            {detailModal.lead.phone && (
              <div>
                <p className="text-xs text-navy-400 mb-1">Phone</p>
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

      <Modal open={!!editingLead} onClose={() => setEditingLead(null)} title={`Edit: ${editingLead?.lead.name || ''}`} size="lg">
        {editingLead && (
          <form onSubmit={saveLeadEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input name="name" label="Name" defaultValue={editingLead.lead.name} required />
              <Input name="email" label="Email" type="email" defaultValue={editingLead.lead.email} required />
              <Input name="company" label="Company" defaultValue={editingLead.lead.company || ''} />
              <Input name="phone" label="Phone" defaultValue={editingLead.lead.phone || ''} />
              <Input name="value" label="Value ($)" type="number" defaultValue={editingLead.lead.value || 0} />
              <Input name="score" label="Score" type="number" defaultValue={editingLead.lead.score || 0} />
              <Input name="nextFollowUp" label="Next Follow Up" type="date" defaultValue={editingLead.lead.nextFollowUp ? editingLead.lead.nextFollowUp.slice(0, 10) : ''} />
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">Stage</label>
                <select name="stage" defaultValue={editingLead.stage}
                  className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500">
                  {stages.map((s) => (
                    <option key={s.key} value={s.key}>{t(s.label)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">Notes</label>
              <textarea name="notes" rows={3} defaultValue={editingLead.lead.notes || ''}
                className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingLead(null)}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-1" /> Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Lead">
        <div className="space-y-4">
          <p className="text-sm text-navy-500 dark:text-navy-400">
            Are you sure you want to delete <strong>{deleteConfirm?.lead?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={deleteLead}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AIScoreInfo({ leadId }: { leadId: string }) {
  const [data, setData] = useState<{ score: number; recommendation: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchScore = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lead-score?id=${leadId}`);
      const json = await res.json();
      if (json.score !== undefined) setData(json);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchScore(); }, [leadId]);

  if (!data && !loading) return null;

  return (
    <div className="p-3 rounded-xl bg-navy-50 dark:bg-navy-800/50 border border-navy-100 dark:border-navy-700">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-navy-400 font-medium">AI Score</p>
        <button onClick={fetchScore} disabled={loading}
          className="text-[10px] text-navy-400 hover:text-navy-600 dark:hover:text-navy-200 disabled:opacity-50">
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
        <p className="text-xs text-navy-400">Calculating...</p>
      )}
    </div>
  );
}

function getStageBg(stage: string): string {
  const colors: Record<string, string> = {
    cold: 'bg-blue-500',
    contacted: 'bg-yellow-500',
    meeting: 'bg-purple-500',
    proposal: 'bg-orange-500',
    won: 'bg-green-500',
    lost: 'bg-red-500',
  };
  return colors[stage] || 'bg-gray-500';
}
