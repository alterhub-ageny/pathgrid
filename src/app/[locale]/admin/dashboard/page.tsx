'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, FileText, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { DashboardCharts } from '@/components/charts/dashboard-charts';
import { AISummary } from '@/components/dashboard/ai-summary';
import { TaskManager } from '@/components/dashboard/task-manager';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setStats([]);
          return;
        }
        setStats([
          { label: 'admin.revenue', value: data.revenue, change: `$${data.invoiced?.toLocaleString()} this month`, icon: DollarSign, color: 'text-green-600' },
          { label: 'admin.leads', value: data.leads, change: `+${data.newLeads} new this month`, icon: Target, color: 'text-purple-600' },
          { label: 'admin.clients', value: data.clients, change: 'Active', icon: Users, color: 'text-cyan-600' },
          { label: 'admin.projects', value: data.projects, change: 'Active', icon: FileText, color: 'text-blue-600' },
        ]);
      })
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">{t('admin.dashboard')}</h1>
        <p className="text-navy-500 dark:text-navy-400 mt-1">{t('admin.statsOverview')}</p>
      </div>

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
              <p className="text-2xl font-bold font-serif">{stat.label === 'admin.revenue' ? formatCurrency(stat.value) : stat.value}</p>
              <p className="text-xs text-navy-400 mt-1">{t(stat.label)}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <DashboardCharts />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AISummary />
        <TaskManager />
      </div>
    </div>
  );
}
