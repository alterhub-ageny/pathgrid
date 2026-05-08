'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, GripVertical, User, DollarSign, Calendar } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn, getStageColor, formatCurrency, formatDateShort } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { LeadStage } from '@/types';

const stages: { key: LeadStage; label: string }[] = [
  { key: 'cold', label: 'pipeline.cold' },
  { key: 'contacted', label: 'pipeline.contacted' },
  { key: 'meeting', label: 'pipeline.meeting' },
  { key: 'proposal', label: 'pipeline.proposal' },
  { key: 'won', label: 'pipeline.won' },
  { key: 'lost', label: 'pipeline.lost' },
];

const initialLeads: Record<LeadStage, any[]> = {
  cold: [
    { id: '1', name: 'Sarah Johnson', company: 'TechCorp', email: 'sarah@techcorp.com', value: 50000, stage: 'cold', score: 65, nextFollowUp: '2026-05-15' },
    { id: '2', name: 'Michael Chen', company: 'DataFlow Inc', email: 'michael@dataflow.io', value: 35000, stage: 'cold', score: 42 },
  ],
  contacted: [
    { id: '3', name: 'Emma Williams', company: 'GreenLeaf Co', email: 'emma@greenleaf.com', value: 75000, stage: 'contacted', score: 78, nextFollowUp: '2026-05-12' },
    { id: '4', name: 'James Rodriguez', company: 'BuildRight', email: 'james@buildright.com', value: 45000, stage: 'contacted', score: 55 },
  ],
  meeting: [
    { id: '5', name: 'Lisa Park', company: 'FinFlow', email: 'lisa@finflow.com', value: 120000, stage: 'meeting', score: 88, nextFollowUp: '2026-05-10' },
  ],
  proposal: [
    { id: '6', name: 'Robert Kim', company: 'HealthPlus', email: 'robert@healthplus.com', value: 200000, stage: 'proposal', score: 92, nextFollowUp: '2026-05-08' },
  ],
  won: [
    { id: '7', name: 'Amanda Foster', company: 'Elevate Studio', email: 'amanda@elevate.com', value: 150000, stage: 'won', score: 95 },
  ],
  lost: [
    { id: '8', name: 'Tom Baker', company: 'OldTech', email: 'tom@oldtech.com', value: 25000, stage: 'lost', score: 30 },
  ],
};

export function KanbanBoard() {
  const { t, isRtl } = useTranslation();
  const [leads, setLeads] = useState(initialLeads);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [detailModal, setDetailModal] = useState<{ lead: any; stage: LeadStage } | null>(null);
  const [draggedLead, setDraggedLead] = useState<{ lead: any; stage: LeadStage } | null>(null);

  const handleDragStart = (lead: any, stage: LeadStage) => {
    setDraggedLead({ lead, stage });
  };

  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = (targetStage: LeadStage) => {
    if (!draggedLead) return;
    if (draggedLead.stage === targetStage) {
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
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const addLead = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const newLead = {
      id: Math.random().toString(36).slice(2),
      name: data.get('name') as string,
      email: data.get('email') as string,
      company: data.get('company') as string,
      value: Number(data.get('value')) || 0,
      stage: 'cold' as LeadStage,
      score: Math.floor(Math.random() * 50) + 30,
      nextFollowUp: data.get('nextFollowUp') as string || undefined,
    };
    setLeads((prev) => ({ ...prev, cold: [...prev.cold, newLead] }));
    setAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">{t('pipeline.title')}</h1>
          <p className="text-navy-500 dark:text-navy-400 mt-1">Manage your sales pipeline and track leads</p>
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

      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.lead.name || ''}>
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
            <div>
              <p className="text-xs text-navy-400 mb-2">{t('pipeline.interactions')}</p>
              <div className="space-y-2">
                {[
                  { type: 'Email Sent', note: 'Initial outreach email', date: '2026-05-01', user: 'Alex' },
                  { type: 'Call', note: 'Discussed project scope', date: '2026-05-03', user: 'Alex' },
                ].map((interaction, i) => (
                  <div key={i} className="p-3 rounded-lg bg-navy-50 dark:bg-navy-800 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{interaction.type}</span>
                      <span className="text-xs text-navy-400">{interaction.date}</span>
                    </div>
                    <p className="text-navy-500 dark:text-navy-400 text-xs mt-1">{interaction.note}</p>
                    <span className="text-xs text-navy-400">by {interaction.user}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">{t('pipeline.scheduleTask')}</Button>
              <Button variant="primary" className="flex-1">{t('pipeline.followUp')}</Button>
            </div>
          </div>
        )}
      </Modal>
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
