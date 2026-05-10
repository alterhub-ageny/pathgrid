'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Target, FileText, Loader2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DashboardCharts } from '@/components/charts/dashboard-charts';
import { AISummary } from '@/components/dashboard/ai-summary';
import { TaskManager } from '@/components/dashboard/task-manager';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { formatCurrency } from '@/lib/utils';

const SECTIONS_KEY = 'admin-dashboard-sections';

const defaultSections = [
  { id: 'stats', label: 'Statistics Cards', visible: true },
  { id: 'charts', label: 'Charts', visible: true },
  { id: 'bottom', label: 'AI Summary, Tasks & Activity', visible: true },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState(defaultSections);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setStats([]); return; }
        setStats([
          { label: 'admin.revenue', value: data.revenue, change: `${formatCurrency(data.invoiced || 0)} this month`, icon: DollarSign },
          { label: 'admin.leads', value: data.leads, change: `+${data.newLeads || 0} new this month`, icon: Target },
          { label: 'admin.clients', value: data.clients, change: 'Active', icon: Users },
          { label: 'admin.projects', value: data.projects, change: 'Active', icon: FileText },
        ]);
      })
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SECTIONS_KEY);
      if (saved) setSections(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const toggleSection = (id: string) => {
    const updated = sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    setSections(updated);
    localStorage.setItem(SECTIONS_KEY, JSON.stringify(updated));
  };

  const statSection = sections.find(s => s.id === 'stats');
  const chartSection = sections.find(s => s.id === 'charts');
  const bottomSection = sections.find(s => s.id === 'bottom');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-navy-500 dark:text-navy-400 mt-1">Stats Overview</p>
        </div>
        <div className="flex items-center gap-2">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => toggleSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                s.visible
                  ? 'bg-navy-100 dark:bg-navy-800 border-navy-200 dark:border-navy-600 text-navy-700 dark:text-navy-300'
                  : 'bg-white dark:bg-navy-900 border-navy-200 dark:border-navy-700 text-navy-400 dark:text-navy-500'
              }`}
              title={s.visible ? `Hide ${s.label}` : `Show ${s.label}`}
            >
              {s.visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span className="hidden sm:inline">{s.visible ? 'Hide' : 'Show'}</span>
            </button>
          ))}
        </div>
      </div>

      {statSection?.visible && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-navy-400" /></div>
          ) : stats?.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-navy-700 dark:text-gold-500" />
                  </div>
                  <span className="text-xs font-medium text-navy-400">{stat.change}</span>
                </div>
                <p className="text-2xl font-bold font-serif text-navy-900 dark:text-white">
                  {stat.label === 'admin.revenue' ? formatCurrency(stat.value) : stat.value}
                </p>
                <p className="text-xs text-navy-400 mt-1">{stat.label === 'admin.revenue' ? 'Revenue' : stat.label === 'admin.leads' ? 'Leads' : stat.label === 'admin.clients' ? 'Clients' : 'Projects'}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {chartSection?.visible && <DashboardCharts />}

      {bottomSection?.visible && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AISummary />
          <TaskManager />
          <RecentActivity />
        </div>
      )}
    </div>
  );
}
