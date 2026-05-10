'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';

export default function AdminBlogPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/distinct?field=blog-categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

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
          render: (v, row) => {
            if (!v) return <Badge variant="warning">{t('admin.draft')}</Badge>;
            const pubAt = row.publishAt ? new Date(row.publishAt) : null;
            if (pubAt && pubAt > new Date()) return <Badge variant="warning">{t('admin.scheduled')}</Badge>;
            return <Badge variant="success">{t('admin.published')}</Badge>;
          },
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
        { key: 'excerpt', label: t('admin.fields.excerpt'), type: 'textarea', aiPrompt: 'Write a 2-sentence excerpt for a blog post about digital agency topics. Keep it concise.' },
        { key: 'content', label: t('admin.fields.content'), type: 'richtext', aiPrompt: 'Write a full blog post about digital agency services, strategy, and best practices. Use markdown formatting with headings, lists, and paragraphs.' },
        { key: 'image', label: t('admin.fields.image'), type: 'image' },
        { key: 'category', label: t('admin.fields.category'), type: 'select', options: categories.length ? categories : ['Technology', 'Design', 'Strategy', 'Development', 'Business', 'AI', 'Marketing'] },
        { key: 'tags', label: t('admin.fields.tags') },
        { key: 'author', label: t('admin.fields.author') },
        { key: 'publishAt', label: t('admin.fields.schedulePublish'), type: 'datetime-local' },
        { key: 'published', label: t('admin.fields.published'), type: 'checkbox' },
        { key: 'featured', label: t('admin.fields.featured'), type: 'checkbox' },
      ]}
    />
  );
}
