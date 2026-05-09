'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminInvoicesPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.invoices')}
      subtitle="Manage invoices"
      type="invoices"
      columns={[
        { key: 'number', label: 'Number' },
        { key: 'amount', label: 'Amount', render: (v) => formatCurrency(v) },
        { key: 'status', label: 'Status', render: (v) =>
          <Badge variant={v === 'paid' ? 'success' : v === 'overdue' ? 'danger' : v === 'sent' ? 'info' : 'warning'}>{v}</Badge>
        },
        { key: 'createdAt', label: 'Date', render: (v) => formatDate(v) },
      ]}
      formFields={[
        { key: 'number', label: 'Invoice Number' },
        { key: 'amount', label: 'Amount', type: 'number' },
        { key: 'currency', label: 'Currency' },
        { key: 'status', label: 'Status' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'dueDate', label: 'Due Date' },
      ]}
    />
  );
}
