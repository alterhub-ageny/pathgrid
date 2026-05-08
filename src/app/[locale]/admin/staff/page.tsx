'use client';

import { useTranslation } from '@/hooks/use-translation';
import { CrudTable } from '@/components/admin/crud-table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const data = [
  { id: '1', name: 'Alex Mercer', email: 'alex@pathgrid.agency', role: 'admin', hours: 40 },
  { id: '2', name: 'Lena Park', email: 'lena@pathgrid.agency', role: 'staff', hours: 38 },
  { id: '3', name: 'David Kim', email: 'david@pathgrid.agency', role: 'staff', hours: 42 },
  { id: '4', name: 'Priya Sharma', email: 'priya@pathgrid.agency', role: 'staff', hours: 36 },
];

export default function AdminStaffPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.staff')}
      subtitle="Manage staff and track hours"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role', render: (v) => <Badge variant={v === 'admin' ? 'info' : 'default'}>{v}</Badge> },
        { key: 'hours', label: 'Hours/Week' },
      ]}
      data={data}
      formFields={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'hours', label: 'Hours/Week', type: 'number' },
      ]}
      onSave={() => toast.success('Staff member saved')}
      onDelete={() => toast.success('Staff member deleted')}
    />
  );
}
