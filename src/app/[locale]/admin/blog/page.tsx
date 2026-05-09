'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';

export default function AdminBlogPage() {
  const { t } = useTranslation();

  const categories = ['Technology', 'Design', 'Strategy', 'Development', 'Business', 'AI', 'Marketing'];

  return (
    <CrudTable
      title={t('admin.blog')}
      subtitle={t('admin.fields.manageBlog')}
      type="blog"
      columns={[
        { key: 'title', label: t('admin.fields.title') },
        { key: 'author', label: t('admin.fields.author') },
        { key: 'category', label: t('admin.fields.category'), render: (v) => v && <Badge variant="info">{v}</Badge> },
        {
          key: 'published',
          label: t('admin.fields.status'),
          render: (v) => <Badge variant={v ? 'success' : 'warning'}>{v ? t('admin.published') : t('admin.draft')}</Badge>,
        },
        {
          key: 'featured',
          label: t('admin.fields.featured'),
          render: (v) => (v ? '⭐' : '—'),
        },
      ]}
      formFields={[
        { key: 'title', label: t('admin.fields.title') },
        { key: 'slug', label: t('admin.fields.slug') },
        { key: 'excerpt', label: t('admin.fields.excerpt'), type: 'textarea' },
        { key: 'content', label: t('admin.fields.content'), type: 'richtext' },
        { key: 'image', label: t('admin.fields.image'), type: 'image' },
        { key: 'category', label: t('admin.fields.category'), type: 'select', options: categories },
        { key: 'tags', label: t('admin.fields.tags') },
        { key: 'author', label: t('admin.fields.author') },
        { key: 'published', label: t('admin.fields.published'), type: 'checkbox' },
        { key: 'featured', label: t('admin.fields.featured'), type: 'checkbox' },
      ]}
    />
  );
}
