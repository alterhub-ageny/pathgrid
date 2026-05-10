'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';

const statuses = ['active', 'completed', 'on-hold', 'cancelled'];

export default function AdminProjectsPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.projects')}
      subtitle={t('admin.fields.manageProjects')}
      type="projects"
      columns={[
        { key: 'title', label: t('admin.fields.title') },
        { key: 'status', label: t('admin.fields.status'), render: (v) => {
          const variants: Record<string, string> = { active: 'info', completed: 'success', 'on-hold': 'warning', cancelled: 'danger' };
          return <Badge variant={(variants[v] as any) || 'info'}>{v}</Badge>;
        }},
        { key: 'progress', label: t('admin.fields.progress'), render: (v) => `${v || 0}%` },
      ]}
      formFields={[
        { key: 'title', label: t('admin.fields.title') },
        { key: 'description', label: t('admin.fields.description'), type: 'textarea' },
        { key: 'status', label: t('admin.fields.status'), type: 'select', options: statuses },
        { key: 'clientId', label: t('admin.fields.client'), type: 'select', optionsFromApi: 'clients', optionsLabelKey: 'name', optionsValueKey: 'id' },
        { key: 'budget', label: t('admin.fields.budget'), type: 'number' },
        { key: 'progress', label: t('admin.fields.progress'), type: 'number' },
        { key: 'startDate', label: t('admin.fields.startDate'), type: 'date' },
        { key: 'deadline', label: t('admin.fields.deadline'), type: 'date' },
      ]}
    />
  );
}
