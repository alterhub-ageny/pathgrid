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
      subtitle={t('admin.fields.manageClients')}
      type="clients"
      columns={[
        { key: 'name', label: t('admin.fields.name') },
        { key: 'email', label: t('admin.fields.email') },
        { key: 'company', label: t('admin.fields.company') },
        { key: 'role', label: t('admin.fields.role'), render: (v) => <Badge variant="info">{v || 'client'}</Badge> },
        { key: 'createdAt', label: t('admin.fields.date'), render: (v) => formatDate(v) },
      ]}
      formFields={[
        { key: 'name', label: t('admin.fields.name') },
        { key: 'email', label: t('admin.fields.email') },
        { key: 'company', label: t('admin.fields.company') },
        { key: 'phone', label: t('admin.fields.phone') },
        { key: 'role', label: t('admin.fields.role') },
      ]}
    />
  );
}
