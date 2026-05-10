'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';

export default function AdminTeamPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.team')}
      subtitle={t('admin.fields.manageTeam')}
      type="team"
      columns={[
        { key: 'name', label: t('admin.fields.name') },
        { key: 'role', label: t('admin.fields.role') },
        { key: 'email', label: t('admin.fields.email') },
        { key: 'active', label: t('admin.fields.status'), render: (v) => <Badge variant={v ? 'success' : 'warning'}>{v ? t('admin.active') : t('admin.inactive')}</Badge> },
      ]}
      formFields={[
        { key: 'name', label: t('admin.fields.name') },
        { key: 'slug', label: t('admin.fields.slug') },
        { key: 'role', label: t('admin.fields.role') },
        { key: 'bio', label: t('admin.fields.bio'), type: 'textarea' },
        { key: 'image', label: t('admin.fields.image'), type: 'image' },
        { key: 'email', label: t('admin.fields.email') },
        { key: 'linkedin', label: t('admin.fields.linkedin') },
        { key: 'twitter', label: t('admin.fields.twitter') },
        { key: 'order', label: t('admin.fields.order'), type: 'number' },
        { key: 'active', label: t('admin.fields.active'), type: 'checkbox' },
      ]}
    />
  );
}
