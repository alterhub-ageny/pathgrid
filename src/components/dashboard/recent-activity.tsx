'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

const typeIcons: Record<string, string> = {
  create: 'text-green-500',
  update: 'text-blue-500',
  delete: 'text-red-500',
};

export function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/activity');
      const json = await res.json();
      setActivities(Array.isArray(json) ? json : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-navy-400" /></div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-navy-400 text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {activities.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors">
              <span className={`p-1 rounded-full mt-0.5 ${typeIcons[a.type] || 'text-navy-400'} bg-navy-100 dark:bg-navy-700`}>
                <Clock className="w-3 h-3" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-navy-900 dark:text-white truncate">{a.description}</p>
                <div className="flex items-center gap-2 text-xs text-navy-400 mt-0.5">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{a.user?.name || 'System'}</span>
                  <span>{formatTime(a.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
