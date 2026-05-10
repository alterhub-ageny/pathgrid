'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';

const eventTypes = ['meeting', 'internal', 'deadline', 'general'];

export default function AdminCalendarPage() {
  const { t } = useTranslation();

  return (
    <CrudTable
      title={t('admin.calendar')}
      subtitle="Schedule and manage events"
      type="calendar-events"
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'start', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
        { key: 'type', label: 'Type', render: (v) => (
          <Badge variant={
            v === 'meeting' ? 'info' : v === 'internal' ? 'warning' : v === 'deadline' ? 'danger' : 'info'
          }>{v}</Badge>
        )},
      ]}
      formFields={[
        { key: 'title', label: 'Title' },
        { key: 'start', label: 'Date', type: 'datetime-local' },
        { key: 'type', label: 'Type', type: 'select', options: eventTypes },
      ]}
    />
  );
}
