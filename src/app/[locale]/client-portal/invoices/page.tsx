'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Download, Loader2, FileText } from 'lucide-react';

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/client/data?type=invoices')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setInvoices(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-navy-900 dark:text-white mb-10">My Invoices</h1>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-navy-400" /></div>
      ) : invoices.length === 0 ? (
        <Card hover={false} className="flex flex-col items-center justify-center py-16">
          <FileText className="w-16 h-16 text-navy-300 dark:text-navy-600 mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">No invoices yet</h3>
          <p className="text-sm text-navy-400">Invoices will appear here once issued</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <Card key={inv.id} hover={false} className="flex items-center justify-between p-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-navy-900 dark:text-white">{inv.number}</span>
                  <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'}>
                    {inv.status}
                  </Badge>
                </div>
                <p className="text-sm text-navy-500 dark:text-navy-400">{inv.description || ''}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-navy-400">
                  <span>{inv.dueDate ? formatDate(inv.dueDate) : ''}</span>
                  <span>{inv.type}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-serif text-navy-900 dark:text-white">{formatCurrency(inv.amount)}</p>
                <button className="flex items-center gap-1 text-xs text-gold-600 dark:text-gold-500 hover:underline mt-1">
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
