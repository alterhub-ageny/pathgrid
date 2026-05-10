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
      subtitle={t('admin.fields.managePortfolio')}
      type="portfolio"
      columns={[
        { key: 'title', label: t('admin.fields.title') },
        { key: 'client', label: t('admin.fields.client') },
        { key: 'industry', label: t('admin.fields.industry') },
        { key: 'published', label: t('admin.fields.status'), render: (v) => <Badge variant={v ? 'success' : 'warning'}>{v ? t('admin.published') : t('admin.draft')}</Badge> },
      ]}
      formFields={[
        { key: 'title', label: t('admin.fields.title') },
        { key: 'slug', label: t('admin.fields.slug') },
        { key: 'description', label: t('admin.fields.description'), type: 'richtext', aiPrompt: 'Write a compelling description for a portfolio project in a digital agency. Describe the project scope and approach.' },
        { key: 'client', label: t('admin.fields.client') },
        { key: 'category', label: t('admin.fields.category') },
        { key: 'industry', label: t('admin.fields.industry'), type: 'select', options: industries },
        { key: 'technologies', label: t('admin.fields.technologies') },
        { key: 'result', label: t('admin.fields.result'), type: 'richtext', aiPrompt: 'Write a brief summary of project results and outcomes. Mention metrics and achievements.' },
        { key: 'image', label: t('admin.fields.image'), type: 'image' },
        { key: 'url', label: t('admin.fields.url') },
        { key: 'tags', label: t('admin.fields.tags') },
        { key: 'order', label: t('admin.fields.order'), type: 'number' },
        { key: 'featured', label: t('admin.fields.featured'), type: 'checkbox' },
        { key: 'published', label: t('admin.fields.published'), type: 'checkbox' },
      ]}
    />
  );
}
