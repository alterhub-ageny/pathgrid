'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { toast } from 'sonner';

const data = [
  { id: '1', name: 'Alex Mercer', role: 'CEO & Founder', email: 'alex@pathgrid.agency' },
  { id: '2', name: 'Lena Park', role: 'Creative Director', email: 'lena@pathgrid.agency' },
  { id: '3', name: 'David Kim', role: 'Technical Lead', email: 'david@pathgrid.agency' },
];

export default function AdminTeamPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.team')}
      subtitle="Manage your team members"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'email', label: 'Email' },
      ]}
      data={data}
      formFields={[
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'email', label: 'Email' },
      ]}
      onSave={() => toast.success('Team member saved')}
      onDelete={() => toast.success('Team member deleted')}
    />
  );
}
