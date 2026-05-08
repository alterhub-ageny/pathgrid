'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Download } from 'lucide-react';

const invoices = [
  { number: 'INV-2025-0042', amount: 15000, status: 'paid', date: '2026-04-28', description: 'Website Redesign - Phase 2' },
  { number: 'INV-2025-0045', amount: 25000, status: 'pending', date: '2026-05-01', description: 'Mobile App - Milestone 1' },
  { number: 'INV-2025-0047', amount: 8000, status: 'overdue', date: '2026-04-15', description: 'Brand Identity - Final' },
];

export default function ClientInvoicesPage() {
  const { t } = useTranslation();

  return (
    <div className="pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif font-bold mb-10">{t('client.invoices')}</h1>
        <div className="space-y-4">
          {invoices.map((inv, i) => (
            <Card key={i} hover={false} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold">{inv.number}</span>
                  <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'}>{inv.status}</Badge>
                </div>
                <p className="text-sm text-navy-500 dark:text-navy-400">{inv.description}</p>
                <p className="text-xs text-navy-400 mt-1">{formatDate(inv.date)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-serif">{formatCurrency(inv.amount)}</p>
                <button className="flex items-center gap-1 text-xs text-gold-600 dark:text-gold-500 hover:underline mt-1">
                  <Download className="w-3 h-3" /> Download PDF
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
