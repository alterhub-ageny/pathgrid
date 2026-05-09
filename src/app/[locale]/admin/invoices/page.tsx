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
      subtitle={t('admin.fields.manageInvoices')}
      type="invoices"
      columns={[
        { key: 'number', label: t('admin.fields.number') },
        { key: 'amount', label: t('admin.fields.amount'), render: (v) => formatCurrency(v) },
        { key: 'status', label: t('admin.fields.status'), render: (v) =>
          <Badge variant={v === 'paid' ? 'success' : v === 'overdue' ? 'danger' : v === 'sent' ? 'info' : 'warning'}>{v}</Badge>
        },
        { key: 'createdAt', label: t('admin.fields.date'), render: (v) => formatDate(v) },
      ]}
      formFields={[
        { key: 'number', label: t('admin.fields.number') },
        { key: 'amount', label: t('admin.fields.amount'), type: 'number' },
        { key: 'currency', label: t('admin.fields.currency') },
        { key: 'status', label: t('admin.fields.status') },
        { key: 'description', label: t('admin.fields.description'), type: 'textarea' },
        { key: 'dueDate', label: t('admin.fields.dueDate') },
      ]}
    />
  );
}
