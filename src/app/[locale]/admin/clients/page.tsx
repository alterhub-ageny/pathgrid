'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

const data = [
  { id: '1', name: 'John Smith', email: 'john@techventures.com', company: 'TechVentures', status: 'active', since: '2025-01-15' },
  { id: '2', name: 'Emily Davis', email: 'emily@elevate.com', company: 'Elevate Studio', status: 'active', since: '2025-03-01' },
  { id: '3', name: 'Mark Wilson', email: 'mark@finflow.com', company: 'FinFlow Inc', status: 'inactive', since: '2025-02-10' },
];

export default function AdminClientsPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.clients')}
      subtitle="Manage your clients"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'company', label: 'Company' },
        { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'warning'}>{v}</Badge> },
        { key: 'since', label: 'Client Since', render: (v) => formatDate(v) },
      ]}
      data={data}
      formFields={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'company', label: 'Company' },
        { key: 'status', label: 'Status' },
      ]}
      onSave={() => toast.success('Client saved')}
      onDelete={() => toast.success('Client deleted')}
    />
  );
}
