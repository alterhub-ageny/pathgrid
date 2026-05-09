'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';
import { formatDate } from '@/lib/utils';

export default function AdminClientsPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.clients')}
      subtitle="Manage your clients"
      type="clients"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'company', label: 'Company' },
        { key: 'role', label: 'Role', render: (v) => <Badge variant="info">{v || 'client'}</Badge> },
        { key: 'createdAt', label: 'Client Since', render: (v) => formatDate(v) },
      ]}
      formFields={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'company', label: 'Company' },
        { key: 'phone', label: 'Phone' },
        { key: 'role', label: 'Role' },
      ]}
    />
  );
}
