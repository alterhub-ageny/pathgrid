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
      subtitle="Manage blog posts and articles"
      type="blog"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'author', label: 'Author' },
        { key: 'category', label: 'Category', render: (v) => v && <Badge variant="info">{v}</Badge> },
        {
          key: 'published',
          label: 'Status',
          render: (v) => <Badge variant={v ? 'success' : 'warning'}>{v ? 'Published' : 'Draft'}</Badge>,
        },
        {
          key: 'featured',
          label: 'Featured',
          render: (v) => (v ? '⭐' : '—'),
        },
      ]}
      formFields={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
        { key: 'content', label: 'Content', type: 'textarea' },
        { key: 'image', label: 'Image', type: 'image' },
        { key: 'category', label: 'Category', type: 'select', options: categories },
        { key: 'tags', label: 'Tags (comma separated)' },
        { key: 'author', label: 'Author' },
        { key: 'published', label: 'Published', type: 'checkbox' },
        { key: 'featured', label: 'Featured', type: 'checkbox' },
      ]}
    />
  );
}
