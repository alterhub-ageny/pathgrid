'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { Badge } from '@/components/ui/badge';
import { CrudTable } from '@/components/admin/crud-table';

const defaultEventTypes = ['meeting', 'internal', 'deadline', 'general'];

export default function AdminCalendarPage() {
  const { t } = useTranslation();
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/admin/distinct?field=event-types')
      .then(r => r.json())
      .then(setEventTypes)
      .catch(() => {});
  }, []);

  const types = eventTypes.length ? eventTypes : defaultEventTypes;

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
        { key: 'type', label: 'Type', type: 'select', options: types },
      ]}
    />
  );
}
