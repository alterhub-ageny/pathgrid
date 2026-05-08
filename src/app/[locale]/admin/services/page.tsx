'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';
import { toast } from 'sonner';

const data = [
  { id: '1', title: 'UI/UX Design', price: '$5,000 - $15,000', status: 'active', order: 1 },
  { id: '2', title: 'Web Development', price: '$10,000 - $30,000', status: 'active', order: 2 },
  { id: '3', title: 'Digital Strategy', price: '$3,000 - $10,000', status: 'active', order: 3 },
];

export default function AdminServicesPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.services')}
      subtitle="Manage your service offerings"
      columns={[
        { key: 'title', label: 'Service' },
        { key: 'price', label: 'Pricing' },
        { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'warning'}>{v}</Badge> },
        { key: 'order', label: 'Order' },
      ]}
      data={data}
      formFields={[
        { key: 'title', label: 'Title' },
        { key: 'price', label: 'Pricing' },
        { key: 'status', label: 'Status' },
        { key: 'order', label: 'Order', type: 'number' },
      ]}
      onSave={() => toast.success('Service saved')}
      onDelete={() => toast.success('Service deleted')}
    />
  );
}
