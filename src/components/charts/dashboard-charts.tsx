'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';
import { formatCurrency } from '@/lib/utils';

const CATEGORY_COLORS = ['#3b82f6', '#eab308', '#a855f7', '#f97316', '#22c55e', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6', '#f43f5e'];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

type PipelineDataItem = { stage: string; count: number; value: number; color: string };

const DEFAULT_PIPELINE_COLORS = ['#3b82f6', '#eab308', '#a855f7', '#f97316', '#22c55e', '#ef4444'];

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
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; expenses: number }[]>([]);
  const [expenseData, setExpenseData] = useState<{ name: string; value: number }[]>([]);
  const [pipelineData, setPipelineData] = useState<PipelineDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCharts = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, stagesRes, leadsRes] = await Promise.all([
        fetch('/api/admin/data?type=transactions'),
        fetch('/api/admin/data?type=stages'),
        fetch('/api/admin/data?type=leads'),
      ]);
      const txJson = await txRes.json();
      const stages = await stagesRes.json();
      const leads = await leadsRes.json();
      const txs = Array.isArray(txJson) ? txJson : [];
      const stageArr = Array.isArray(stages) ? stages : [];
      const leadsArr = Array.isArray(leads) ? leads : leads.data || [];

      // Revenue vs Expenses by month
      const monthMap = new Map<string, { revenue: number; expenses: number }>();
      MONTHS.forEach(m => monthMap.set(m, { revenue: 0, expenses: 0 }));
      txs.forEach((tx: any) => {
        if (tx.deletedAt) return;
        const d = new Date(tx.date);
        const m = MONTHS[d.getMonth()];
        const entry = monthMap.get(m)!;
        if (tx.type === 'income') entry.revenue += tx.amount;
        else entry.expenses += tx.amount;
      });
      setRevenueData(MONTHS.map(m => ({ month: m, ...monthMap.get(m)! })));

      // Expense breakdown by category
      const catMap = new Map<string, number>();
      txs.forEach((tx: any) => {
        if (tx.deletedAt || tx.type !== 'expense') return;
        const cat = tx.category || 'Other';
        catMap.set(cat, (catMap.get(cat) || 0) + tx.amount);
      });
      setExpenseData(Array.from(catMap.entries()).map(([name, value]) => ({ name, value: Math.round(value) })));

      // Pipeline funnel
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
      setPipelineData(sorted.map(([key]) => {
        const info = stageMap.get(key)!;
        const g = grouped.get(key) || { count: 0, value: 0 };
        return { stage: info.label, count: g.count, value: g.value, color: info.color };
      }));
    } catch {
      setRevenueData([]);
      setExpenseData([]);
      setPipelineData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCharts(); }, [fetchCharts]);

  const isEmpty = !loading && revenueData.length === 0 && expenseData.length === 0 && pipelineData.length === 0;

  const gridStroke = isDark ? '#334155' : '#e5e7eb';
  const navyColor = isDark ? '#d4a61e' : '#1a2f5e';
  const goldColor = isDark ? '#fbbf24' : '#d4a61e';

  const handleExport = (format: 'pdf' | 'csv') => {
    if (format === 'csv' && revenueData.length > 0) {
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

      {loading ? (
        <div className="flex items-center justify-center py-16 text-navy-400 dark:text-navy-200">Loading charts...</div>
      ) : isEmpty ? (
        <div className="flex items-center justify-center py-16 text-navy-400 dark:text-navy-200">No transaction data yet</div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {revenueData.length > 0 && (
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
        )}

        {pipelineData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pipeline Funnel</h3>
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
        </Card>
        )}

        {expenseData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
              >
                {expenseData.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        )}
      </div>
      )}
    </div>
  );
}
