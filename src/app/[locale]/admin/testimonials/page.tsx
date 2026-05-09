'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';

export default function AdminTestimonialsPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.testimonials')}
      subtitle="Manage client testimonials"
      type="testimonials"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'company', label: 'Company' },
        { key: 'rating', label: 'Rating', render: (v) => '★'.repeat(v) + '☆'.repeat(5 - v) },
        { key: 'active', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'danger'}>{v ? 'Active' : 'Inactive'}</Badge> },
      ]}
      formFields={[
        { key: 'name', label: 'Name' },
        { key: 'company', label: 'Company' },
        { key: 'role', label: 'Role' },
        { key: 'content', label: 'Content', type: 'textarea' },
        { key: 'rating', label: 'Rating', type: 'number' },
        { key: 'image', label: 'Image', type: 'image' },
        { key: 'featured', label: 'Featured', type: 'checkbox' },
        { key: 'active', label: 'Active', type: 'checkbox' },
      ]}
    />
  );
}
