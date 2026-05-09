'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';

export default function AdminPortfolioPage() {
  const { t } = useTranslation();

  const industries = ['Technology', 'Fintech', 'Branding', 'E-commerce', 'Healthcare', 'Education', 'Real Estate'];

  return (
    <CrudTable
      title={t('admin.portfolio')}
      subtitle="Manage your case studies and portfolio items"
      type="portfolio"
      columns={[
        { key: 'title', label: 'Project' },
        { key: 'client', label: 'Client' },
        { key: 'industry', label: 'Industry' },
        { key: 'published', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'warning'}>{v ? 'Published' : 'Draft'}</Badge> },
      ]}
      formFields={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'client', label: 'Client' },
        { key: 'industry', label: 'Industry', type: 'select', options: industries },
        { key: 'technologies', label: 'Technologies' },
        { key: 'result', label: 'Result', type: 'textarea' },
        { key: 'image', label: 'Image', type: 'image' },
        { key: 'url', label: 'Project URL' },
        { key: 'tags', label: 'Tags (comma separated)' },
        { key: 'featured', label: 'Featured', type: 'checkbox' },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
