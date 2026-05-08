'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const data = [
  { id: '1', name: 'Sarah Chen', company: 'TechVentures Inc', rating: 5, status: 'active' },
  { id: '2', name: 'Marcus Johnson', company: 'Elevate Brand Studio', rating: 5, status: 'active' },
  { id: '3', name: 'Aisha Rahman', company: 'NexGen Solutions', rating: 4, status: 'active' },
];

export default function AdminTestimonialsPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.testimonials')}
      subtitle="Manage client testimonials"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'company', label: 'Company' },
        { key: 'rating', label: 'Rating', render: (v) => '★'.repeat(v) + '☆'.repeat(5 - v) },
        { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'danger'}>{v}</Badge> },
      ]}
      data={data}
      formFields={[
        { key: 'name', label: 'Name' },
        { key: 'company', label: 'Company' },
        { key: 'rating', label: 'Rating', type: 'number' },
        { key: 'status', label: 'Status' },
      ]}
      onSave={() => toast.success('Testimonial saved')}
      onDelete={() => toast.success('Testimonial deleted')}
    />
  );
}
