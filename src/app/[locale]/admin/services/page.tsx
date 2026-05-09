'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';

export default function AdminServicesPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.services')}
      subtitle={t('admin.fields.manageServices')}
      type="services"
      columns={[
        { key: 'title', label: t('admin.fields.title') },
        { key: 'priceTier', label: t('admin.fields.priceTier') },
        { key: 'order', label: t('admin.fields.order') },
        { key: 'active', label: t('admin.fields.status'), render: (v) => <Badge variant={v ? 'success' : 'warning'}>{v ? t('admin.active') : t('admin.inactive')}</Badge> },
      ]}
      formFields={[
        { key: 'title', label: t('admin.fields.title') },
        { key: 'slug', label: t('admin.fields.slug') },
        { key: 'description', label: t('admin.fields.description'), type: 'textarea' },
        { key: 'icon', label: t('admin.fields.icon') },
        { key: 'priceTier', label: t('admin.fields.priceTier') },
        { key: 'features', label: t('admin.fields.features') },
        { key: 'order', label: t('admin.fields.order'), type: 'number' },
        { key: 'active', label: t('admin.fields.active'), type: 'checkbox' },
      ]}
    />
  );
}
