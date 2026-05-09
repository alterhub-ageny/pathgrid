'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';

export default function AdminStaffPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.staff')}
      subtitle="Manage staff and track hours"
      type="clients"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role', render: (v) => <Badge variant={v === 'admin' ? 'info' : 'default'}>{v}</Badge> },
      ]}
      formFields={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
      ]}
    />
  );
}
