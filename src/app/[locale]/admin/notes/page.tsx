'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';

export default function AdminNotesPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.notes')}
      subtitle={t('admin.fields.manageNotes')}
      type="notes"
      columns={[
        { key: 'title', label: t('admin.fields.title') },
        { key: 'category', label: t('admin.fields.category') },
        {
          key: 'pinned',
          label: t('admin.fields.pinned'),
          render: (v) => v ? <Badge variant="success">Pinned</Badge> : '—',
        },
        { key: 'updatedAt', label: t('admin.fields.date'), render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
      formFields={[
        { key: 'title', label: t('admin.fields.title') },
        { key: 'content', label: t('admin.fields.content'), type: 'textarea' },
        { key: 'category', label: t('admin.fields.category') },
        { key: 'pinned', label: t('admin.fields.pinned'), type: 'checkbox' },
      ]}
    />
  );
}
