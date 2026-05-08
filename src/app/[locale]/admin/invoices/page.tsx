'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '@/lib/utils';

const data = [
  { id: '1', number: 'INV-2025-0042', client: 'TechVentures', amount: 15000, status: 'paid', date: '2026-04-28' },
  { id: '2', number: 'INV-2025-0043', client: 'Elevate Studio', amount: 25000, status: 'sent', date: '2026-05-01' },
  { id: '3', number: 'INV-2025-0044', client: 'FinFlow Inc', amount: 12000, status: 'overdue', date: '2026-04-15' },
];

export default function AdminInvoicesPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.invoices')}
      subtitle="Manage invoices"
      columns={[
        { key: 'number', label: 'Number' },
        { key: 'client', label: 'Client' },
        { key: 'amount', label: 'Amount', render: (v) => formatCurrency(v) },
        { key: 'status', label: 'Status', render: (v) =>
          <Badge variant={v === 'paid' ? 'success' : v === 'overdue' ? 'danger' : v === 'sent' ? 'info' : 'warning'}>{v}</Badge>
        },
        { key: 'date', label: 'Date', render: (v) => formatDate(v) },
      ]}
      data={data}
      formFields={[
        { key: 'number', label: 'Invoice Number' },
        { key: 'client', label: 'Client' },
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'status', label: 'Status' },
      ]}
      onSave={() => toast.success('Invoice saved')}
      onDelete={() => toast.success('Invoice deleted')}
    />
  );
}
