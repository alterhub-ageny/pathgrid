'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';

export default function AdminTeamPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.team')}
      subtitle="Manage your team members"
      type="team"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'email', label: 'Email' },
        { key: 'active', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'warning'}>{v ? 'Active' : 'Inactive'}</Badge> },
      ]}
      formFields={[
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'role', label: 'Role' },
        { key: 'bio', label: 'Bio', type: 'textarea' },
        { key: 'image', label: 'Image', type: 'image' },
        { key: 'email', label: 'Email' },
        { key: 'linkedin', label: 'LinkedIn URL' },
        { key: 'order', label: 'Order', type: 'number' },
        { key: 'active', label: 'Active', type: 'checkbox' },
      ]}
    />
  );
}
