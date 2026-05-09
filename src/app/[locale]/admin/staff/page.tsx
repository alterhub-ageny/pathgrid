'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';

export default function AdminStaffPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.staff')}
      subtitle={t('admin.fields.manageStaff')}
      type="clients"
      columns={[
        { key: 'name', label: t('admin.fields.name') },
        { key: 'email', label: t('admin.fields.email') },
        { key: 'role', label: t('admin.fields.role'), render: (v) => <Badge variant={v === 'admin' ? 'info' : 'default'}>{v}</Badge> },
      ]}
      formFields={[
        { key: 'name', label: t('admin.fields.name') },
        { key: 'email', label: t('admin.fields.email') },
        { key: 'role', label: t('admin.fields.role') },
      ]}
    />
  );
}
