'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';
import { toast } from 'sonner';

const data = [
  { id: '1', title: 'NexGen Platform', client: 'NexGen Solutions', industry: 'Technology', status: 'published' },
  { id: '2', title: 'Elevate Brand Identity', client: 'Elevate Brand Studio', industry: 'Branding', status: 'published' },
  { id: '3', title: 'FinFlow Dashboard', client: 'FinFlow Inc.', industry: 'Fintech', status: 'draft' },
];

export default function AdminPortfolioPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.portfolio')}
      subtitle="Manage your case studies and portfolio items"
      columns={[
        { key: 'title', label: 'Project' },
        { key: 'client', label: 'Client' },
        { key: 'industry', label: 'Industry' },
        { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'published' ? 'success' : 'warning'}>{v}</Badge> },
      ]}
      data={data}
      formFields={[
        { key: 'title', label: 'Title' },
        { key: 'client', label: 'Client' },
        { key: 'industry', label: 'Industry' },
        { key: 'status', label: 'Status' },
      ]}
      onSave={() => toast.success('Portfolio item saved')}
      onDelete={() => toast.success('Portfolio item deleted')}
    />
  );
}
