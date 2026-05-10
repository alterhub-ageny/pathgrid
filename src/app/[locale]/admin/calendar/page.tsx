'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminCalendarPage() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [today, setToday] = useState(new Date().getDate());

  useEffect(() => { setToday(new Date().getDate()); }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/data?type=calendar-events');
      const json = await res.json();
      setEvents(Array.isArray(json) ? json : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'calendar-events', action: 'create',
          data: {
            title: fd.get('title'),
            start: new Date(fd.get('date') as string).toISOString(),
            type: fd.get('type') || 'general',
          },
        }),
      });
      toast.success('Event created');
      setShowModal(false);
      fetchEvents();
    } catch { toast.error('Failed to create event'); }
    finally { setSaving(false); }
  };

  const daysInMonth = 31;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-navy-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">{t('admin.calendar')}</h1>
          <p className="text-navy-500 dark:text-navy-400 mt-1">Schedule and manage events</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-xl text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-navy-400 py-2">{d}</div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => (
            <div key={i}
              className={`text-center py-2 text-sm rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800 cursor-pointer transition-colors ${
                i + 1 === today ? 'bg-navy-700 text-white dark:bg-gold-500 dark:text-navy-900' : ''
              }`}>
              {i + 1}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold p-6 pb-0">Upcoming Events</h3>
        <div className="p-6 space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-navy-400 text-center py-8">No upcoming events</p>
          ) : events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-navy-600 dark:text-gold-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-navy-400">{new Date(event.start).toLocaleDateString()} · {event.type}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                event.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                event.type === 'internal' ? 'bg-blue-100 text-blue-700' :
                'bg-orange-100 text-orange-700'
              }`}>{event.type}</span>
            </motion.div>
          ))}
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Event">
        <form className="space-y-4" onSubmit={handleAddEvent}>
          <Input name="title" label="Title" required />
          <Input name="date" label="Date" type="date" required />
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">Type</label>
            <select name="type" className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800">
              <option value="meeting">Meeting</option>
              <option value="internal">Internal</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>
          <Button type="submit" loading={saving} className="w-full">{t('common.create')}</Button>
        </form>
      </Modal>
    </div>
  );
}
