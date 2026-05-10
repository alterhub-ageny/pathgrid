'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminInvoicesPage() {
  const { t } = useTranslation();
  const [statuses, setStatuses] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/distinct?field=invoice-statuses')
      .then(r => r.json())
      .then(setStatuses)
      .catch(() => {});
    fetch('/api/admin/distinct?field=transaction-types')
      .then(r => r.json())
      .then(setTypes)
      .catch(() => {});
  }, []);

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
        { key: 'clientId', label: 'Client', type: 'select', optionsFromApi: 'clients', optionsLabelKey: 'name', optionsValueKey: 'id' },
        { key: 'amount', label: t('admin.fields.amount'), type: 'number' },
        { key: 'currency', label: t('admin.fields.currency') },
        { key: 'type', label: 'Type', type: 'select', options: types.length ? types : ['income', 'expense'] },
        { key: 'status', label: t('admin.fields.status'), type: 'select', options: statuses.length ? statuses : ['draft', 'sent', 'paid', 'overdue', 'cancelled'] },
        { key: 'dueDate', label: t('admin.fields.dueDate'), type: 'date' },
        { key: 'description', label: t('admin.fields.description'), type: 'textarea' },
      ]}
    />
  );
}
