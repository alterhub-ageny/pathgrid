'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, FileText } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { DashboardCharts } from '@/components/charts/dashboard-charts';
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
        <Card>
          <h3 className="text-lg font-semibold mb-4">{t('admin.recentActivity')}</h3>
          <div className="space-y-4">
            {[
              { action: 'New lead added', detail: 'Sarah Johnson - TechCorp', time: '2 min ago' },
              { action: 'Invoice paid', detail: 'INV-2025-0042 - $12,000', time: '15 min ago' },
              { action: 'Project updated', detail: 'NexGen Platform - Progress: 75%', time: '1 hour ago' },
              { action: 'Meeting completed', detail: 'Q4 Strategy with Elevate', time: '2 hours ago' },
              { action: 'Proposal sent', detail: 'HealthPlus Mobile App', time: '3 hours ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-navy-100 dark:border-navy-700 last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-gold-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 dark:text-white">{item.action}</p>
                  <p className="text-xs text-navy-400">{item.detail}</p>
                </div>
                <span className="text-xs text-navy-400 whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">{t('admin.quickActions')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Lead', desc: 'New pipeline entry' },
              { label: 'Create Invoice', desc: 'Bill a client' },
              { label: 'New Project', desc: 'Start a project' },
              { label: 'Write Blog', desc: 'Publish article' },
            ].map((action, i) => (
              <button
                key={i}
                className="p-4 rounded-xl border border-navy-200 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors text-left"
              >
                <p className="text-sm font-semibold text-navy-900 dark:text-white">{action.label}</p>
                <p className="text-xs text-navy-400 mt-0.5">{action.desc}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
