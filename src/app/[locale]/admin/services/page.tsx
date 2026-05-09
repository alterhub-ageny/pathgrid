'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';

export default function AdminServicesPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.services')}
      subtitle="Manage your service offerings"
      type="services"
      columns={[
        { key: 'title', label: 'Service' },
        { key: 'priceTier', label: 'Pricing' },
        { key: 'order', label: 'Order' },
        { key: 'active', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'warning'}>{v ? 'Active' : 'Inactive'}</Badge> },
      ]}
      formFields={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'icon', label: 'Icon' },
        { key: 'priceTier', label: 'Price Tier' },
        { key: 'features', label: 'Features (comma separated)' },
        { key: 'order', label: 'Order', type: 'number' },
        { key: 'active', label: 'Active', type: 'checkbox' },
      ]}
    />
  );
}
