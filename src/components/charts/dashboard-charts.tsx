'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { motion } from 'framer-motion';
import { Download, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';
import { formatCurrency } from '@/lib/utils';

const revenueData = [
  { month: 'Jan', revenue: 45000, expenses: 28000 },
  { month: 'Feb', revenue: 52000, expenses: 31000 },
  { month: 'Mar', revenue: 48000, expenses: 27000 },
  { month: 'Apr', revenue: 61000, expenses: 33000 },
  { month: 'May', revenue: 58000, expenses: 29000 },
  { month: 'Jun', revenue: 72000, expenses: 35000 },
  { month: 'Jul', revenue: 68000, expenses: 32000 },
  { month: 'Aug', revenue: 75000, expenses: 38000 },
  { month: 'Sep', revenue: 82000, expenses: 36000 },
  { month: 'Oct', revenue: 78000, expenses: 34000 },
  { month: 'Nov', revenue: 85000, expenses: 39000 },
  { month: 'Dec', revenue: 95000, expenses: 42000 },
];

type PipelineDataItem = { stage: string; count: number; value: number; color: string };

const DEFAULT_PIPELINE_COLORS = ['#3b82f6', '#eab308', '#a855f7', '#f97316', '#22c55e', '#ef4444'];

const trafficData = [
  { month: 'Jan', organic: 4200, paid: 1800, referral: 1200 },
  { month: 'Feb', organic: 4800, paid: 2000, referral: 1400 },
  { month: 'Mar', organic: 5100, paid: 2200, referral: 1600 },
  { month: 'Apr', organic: 5600, paid: 2400, referral: 1800 },
  { month: 'May', organic: 6200, paid: 2600, referral: 2000 },
  { month: 'Jun', organic: 6800, paid: 2800, referral: 2200 },
];

const expenseByCategory = [
  { name: 'Salaries', value: 45 },
  { name: 'Infrastructure', value: 20 },
  { name: 'Marketing', value: 15 },
  { name: 'Operations', value: 12 },
  { name: 'Other', value: 8 },
];

const COLORS_LIGHT = ['#1a2f5e', '#d4a61e', '#00b8d4', '#4a67af', '#f6d154'];
const COLORS_DARK = ['#d4a61e', '#60a5fa', '#22d3ee', '#a78bfa', '#fbbf24'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-navy-800 p-3 rounded-xl shadow-lg border border-navy-100 dark:border-navy-700">
        <p className="text-sm font-medium text-navy-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('expense') || entry.name === 'value'
              ? formatCurrency(entry.value) : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardCharts() {
  const { t } = useTranslation();
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';
  const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT;
  const [pipelineData, setPipelineData] = useState<PipelineDataItem[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(true);

  const fetchPipelineData = useCallback(async () => {
    setPipelineLoading(true);
    try {
      const [stagesRes, leadsRes] = await Promise.all([
        fetch('/api/admin/data?type=stages'),
        fetch('/api/admin/data?type=leads'),
      ]);
      const stages = await stagesRes.json();
      const leads = await leadsRes.json();
      const stageArr = Array.isArray(stages) ? stages : [];
      const leadsArr = Array.isArray(leads) ? leads : leads.data || [];

      const stageMap = new Map<string, { label: string; color: string }>();
      const stageOrder = new Map<string, number>();
      stageArr.forEach((s: any, i: number) => {
        if (s.key) {
          stageMap.set(s.key, { label: s.label || s.key, color: s.color || DEFAULT_PIPELINE_COLORS[i % DEFAULT_PIPELINE_COLORS.length] });
          stageOrder.set(s.key, s.order ?? i);
        }
      });

      const grouped = new Map<string, { count: number; value: number }>();
      leadsArr.forEach((l: any) => {
        const sk = l.stage || 'cold';
        if (!grouped.has(sk)) grouped.set(sk, { count: 0, value: 0 });
        const g = grouped.get(sk)!;
        g.count++;
        g.value += l.value || 0;
      });

      const sorted = Array.from(stageOrder.entries()).sort((a, b) => a[1] - b[1]);
      const data: PipelineDataItem[] = sorted.map(([key]) => {
        const info = stageMap.get(key)!;
        const g = grouped.get(key) || { count: 0, value: 0 };
        return { stage: info.label, count: g.count, value: g.value, color: info.color };
      });
      setPipelineData(data);
    } catch {
      setPipelineData([]);
    } finally {
      setPipelineLoading(false);
    }
  }, []);

  useEffect(() => { fetchPipelineData(); }, [fetchPipelineData]);
  const gridStroke = isDark ? '#334155' : '#e5e7eb';
  const navyColor = isDark ? '#d4a61e' : '#1a2f5e';
  const goldColor = isDark ? '#fbbf24' : '#d4a61e';
  const cyanColor = '#00b8d4';

  const handleExport = (format: 'pdf' | 'csv') => {
    if (format === 'csv') {
      const headers = 'Month,Revenue,Expenses\n';
      const rows = revenueData.map(d => `${d.month},${d.revenue},${d.expenses}`).join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">{t('admin.statsOverview')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-navy-200 dark:border-navy-600 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('admin.exportCsv')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={navyColor} stopOpacity={isDark ? 0.2 : 0.3} />
                  <stop offset="95%" stopColor={navyColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={goldColor} stopOpacity={isDark ? 0.2 : 0.3} />
                  <stop offset="95%" stopColor={goldColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke={navyColor} fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke={goldColor} fill="url(#expGrad)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pipeline Funnel</h3>
          {pipelineLoading ? (
            <div className="flex items-center justify-center h-[300px] text-navy-400 dark:text-navy-200">Loading...</div>
          ) : pipelineData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-navy-400 dark:text-navy-200">No pipeline stages configured</div>
          ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="stage" type="category" stroke="#9ca3af" fontSize={12} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="value">
                {pipelineData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Web Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: isDark ? '#cbd5e1' : undefined }} />
              <Line type="monotone" dataKey="organic" stroke={navyColor} strokeWidth={2} dot={false} name="Organic" />
              <Line type="monotone" dataKey="paid" stroke={goldColor} strokeWidth={2} dot={false} name="Paid" />
              <Line type="monotone" dataKey="referral" stroke={cyanColor} strokeWidth={2} dot={false} name="Referral" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {expenseByCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
