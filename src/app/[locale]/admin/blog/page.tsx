'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

const data = [
  { id: '1', title: 'The Future of Digital Experience', author: 'Alex Mercer', date: '2025-12-15', status: 'published' },
  { id: '2', title: 'Building Performant Next.js Apps', author: 'David Kim', date: '2025-11-28', status: 'published' },
  { id: '3', title: 'Data-Driven Brand Strategy', author: 'Priya Sharma', date: '2025-11-10', status: 'draft' },
];

export default function AdminBlogPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.blog')}
      subtitle="Manage blog posts and articles"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'author', label: 'Author' },
        { key: 'date', label: 'Date', render: (v) => formatDate(v) },
        { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'published' ? 'success' : 'warning'}>{v}</Badge> },
      ]}
      data={data}
      formFields={[
        { key: 'title', label: 'Title' },
        { key: 'author', label: 'Author' },
        { key: 'status', label: 'Status' },
      ]}
      onSave={() => toast.success('Blog post saved')}
      onDelete={() => toast.success('Blog post deleted')}
    />
  );
}
