'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, FileText } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { DashboardCharts } from '@/components/charts/dashboard-charts';
import { AISummary } from '@/components/dashboard/ai-summary';
import { TaskManager } from '@/components/dashboard/task-manager';
import { formatCurrency } from '@/lib/utils';

const stats = [
  { label: 'admin.revenue', value: 789000, change: '+12.5%', icon: DollarSign, trend: 'up', color: 'text-green-600' },
  { label: 'admin.expenses', value: 398000, change: '+3.2%', icon: TrendingDown, trend: 'up', color: 'text-red-600' },
  { label: 'admin.profit', value: 391000, change: '+18.7%', icon: TrendingUp, trend: 'up', color: 'text-green-600' },
  { label: 'admin.projects', value: 24, change: '+4', icon: FileText, trend: 'up', color: 'text-blue-600' },
  { label: 'admin.leads', value: 128, change: '+32', icon: Target, trend: 'up', color: 'text-purple-600' },
  { label: 'admin.clients', value: 18, change: '+3', icon: Users, trend: 'up', color: 'text-cyan-600' },
];

export default function AdminDashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">{t('admin.dashboard')}</h1>
        <p className="text-navy-500 dark:text-navy-400 mt-1">{t('admin.statsOverview')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
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
                <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold font-serif">
                {stat.label === 'admin.projects' || stat.label === 'admin.leads' || stat.label === 'admin.clients'
                  ? stat.value
                  : formatCurrency(stat.value)}
              </p>
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
