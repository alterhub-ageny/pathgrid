'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';

export default function AdminTestimonialsPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.testimonials')}
      subtitle={t('admin.fields.manageTestimonials')}
      type="testimonials"
      columns={[
        { key: 'name', label: t('admin.fields.name') },
        { key: 'company', label: t('admin.fields.company') },
        { key: 'rating', label: t('admin.fields.rating'), render: (v) => '★'.repeat(v) + '☆'.repeat(5 - v) },
        { key: 'active', label: t('admin.fields.status'), render: (v) => <Badge variant={v ? 'success' : 'danger'}>{v ? t('admin.active') : t('admin.inactive')}</Badge> },
      ]}
      formFields={[
        { key: 'name', label: t('admin.fields.name') },
        { key: 'company', label: t('admin.fields.company') },
        { key: 'role', label: t('admin.fields.role') },
        { key: 'content', label: t('admin.fields.content'), type: 'textarea' },
        { key: 'rating', label: t('admin.fields.rating'), type: 'number' },
        { key: 'image', label: t('admin.fields.image'), type: 'image' },
        { key: 'featured', label: t('admin.fields.featured'), type: 'checkbox' },
        { key: 'active', label: t('admin.fields.active'), type: 'checkbox' },
      ]}
    />
  );
}
