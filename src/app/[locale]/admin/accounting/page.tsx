'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, FileText, Loader2, Sparkles, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS = [
  '#3b82f6', '#eab308', '#a855f7', '#f97316', '#22c55e', '#ef4444',
  '#06b6d4', '#ec4899', '#14b8a6', '#f43f5e', '#8b5cf6', '#84cc16',
  '#64748b', '#f59e0b', '#6366f1', '#d946ef',
];

export default function AccountingPage() {
  const { t } = useTranslation();
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';
  const [showInvoice, setShowInvoice] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, invRes] = await Promise.all([
        fetch('/api/admin/data?type=transactions'),
        fetch('/api/admin/data?type=invoices'),
      ]);
      const txs = await txRes.json();
      const invs = await invRes.json();
      setTransactions(Array.isArray(txs) ? txs : []);
      setInvoices(Array.isArray(invs) ? invs : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleDateString('en', { month: 'short' }));
  const monthlyData = months.map((month, i) => {
    const monthTx = transactions.filter((tx: any) => {
      const d = new Date(tx.date);
      return d.getMonth() === i && d.getFullYear() === 2026;
    });
    const revenue = monthTx.filter((tx: any) => tx.type === 'income').reduce((s: number, tx: any) => s + tx.amount, 0);
    const expenses = monthTx.filter((tx: any) => tx.type === 'expense').reduce((s: number, tx: any) => s + tx.amount, 0);
    return { month, revenue, expenses, profit: revenue - expenses };
  });

  const totalRevenue = transactions.filter((tx: any) => tx.type === 'income').reduce((s: number, tx: any) => s + tx.amount, 0);
  const totalExpenses = transactions.filter((tx: any) => tx.type === 'expense').reduce((s: number, tx: any) => s + tx.amount, 0);
  const pendingInvoices = invoices.filter((i: any) => i.status !== 'paid').length;

  // Intelligent expenses breakdown
  const expenseTransactions = transactions.filter((tx: any) => tx.type === 'expense');
  const expenseCategories = useMemo(() => {
    const grouped: Record<string, { total: number; count: number; label: string }> = {};
    expenseTransactions.forEach((tx: any) => {
      const cat = tx.category || 'Uncategorized';
      if (!grouped[cat]) grouped[cat] = { total: 0, count: 0, label: cat };
      grouped[cat].total += tx.amount;
      grouped[cat].count += 1;
    });
    return Object.entries(grouped)
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => b.total - a.total);
  }, [expenseTransactions]);

  const totalExpenseAmount = expenseCategories.reduce((s, c) => s + c.total, 0);

  // Category averages & trends
  const categoryInsights = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    return expenseCategories.map((cat, i) => {
      const catTx = expenseTransactions.filter((tx: any) => (tx.category || 'Uncategorized') === cat.key && tx.amount > 0);
      const currentTx = catTx.filter((tx: any) => new Date(tx.date).getMonth() === currentMonth);
      const prevTx = catTx.filter((tx: any) => new Date(tx.date).getMonth() === prevMonth);
      const currentTotal = currentTx.reduce((s, tx) => s + tx.amount, 0);
      const prevTotal = prevTx.reduce((s, tx) => s + tx.amount, 0);
      const avgMonthly = catTx.length > 0 ? cat.total / Math.max(1, new Set(catTx.map((tx: any) => `${new Date(tx.date).getMonth()}-${new Date(tx.date).getFullYear()}`)).size) : 0;
      const change = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;
      const isAnomaly = avgMonthly > 0 && currentTotal > avgMonthly * 1.5 && catTx.length >= 3;
      return { ...cat, avgMonthly, currentTotal, prevTotal, change, isAnomaly, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] };
    });
  }, [expenseCategories, expenseTransactions]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'invoices', action: 'create',
          data: {
            number: fd.get('number'),
            amount: Number(fd.get('amount')),
            description: fd.get('description'),
            dueDate: fd.get('dueDate') || undefined,
            status: 'draft',
            clientId: 'placeholder',
          },
        }),
      });
      toast.success('Invoice created');
      setShowInvoice(false);
      fetchData();
    } catch { toast.error('Failed to create invoice'); }
    finally { setSaving(false); }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transactions', action: 'create',
          data: {
            label: fd.get('label'),
            amount: Number(fd.get('amount')),
            type: fd.get('type') || 'expense',
            category: fd.get('category') || '',
            date: new Date().toISOString(),
          },
        }),
      });
      toast.success('Transaction added');
      setShowTransaction(false);
      fetchData();
    } catch { toast.error('Failed to add transaction'); }
    finally { setSaving(false); }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white dark:bg-navy-800 p-3 rounded-xl shadow-lg border border-navy-100 dark:border-navy-700">
          <p className="text-sm font-medium mb-1 text-navy-900 dark:text-white">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-sm" style={{ color: entry.color }}>{entry.name}: {formatCurrency(entry.value)}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white dark:bg-navy-800 p-3 rounded-xl shadow-lg border border-navy-100 dark:border-navy-700">
          <p className="text-sm font-semibold text-navy-900 dark:text-white">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].payload.color }}>{formatCurrency(payload[0].value)} ({payload[0].payload.percent}%)</p>
          <p className="text-xs text-navy-400 dark:text-navy-200">{payload[0].payload.count} transaction(s)</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-navy-400 dark:text-navy-200" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-navy-900 dark:text-white">{t('accounting.title')}</h1>
          <p className="text-navy-500 dark:text-navy-400 mt-1">{t('admin.statsOverview')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTransaction(true)}>
            <Plus className="w-4 h-4 mr-1" />{t('accounting.addTransaction')}
          </Button>
          <Button size="sm" onClick={() => setShowInvoice(true)}>
            <FileText className="w-4 h-4 mr-1" />{t('accounting.createInvoice')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('accounting.totalRevenue'), value: totalRevenue, icon: TrendingUp, color: 'text-green-600 dark:text-green-400' },
          { label: t('accounting.totalExpenses'), value: totalExpenses, icon: TrendingDown, color: 'text-red-600 dark:text-red-400' },
          { label: t('accounting.netProfit'), value: totalRevenue - totalExpenses, icon: DollarSign, color: 'text-blue-600 dark:text-blue-400' },
          { label: t('accounting.pendingInvoices'), value: pendingInvoices, icon: FileText, color: 'text-orange-600 dark:text-orange-400' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold font-serif text-navy-900 dark:text-white">{typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}</p>
              <p className="text-sm text-navy-400 dark:text-navy-200 mt-1">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-navy-900 dark:text-white">{t('accounting.profitLoss')}</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? '#d4a61e' : '#1a2f5e'} stopOpacity={isDark ? 0.2 : 0.3} />
                  <stop offset="95%" stopColor={isDark ? '#d4a61e' : '#1a2f5e'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke={isDark ? '#d4a61e' : '#1a2f5e'} fill="url(#profitGrad)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="expenses" stroke={isDark ? '#f97316' : '#d4a61e'} fill="url(#profitGrad)" strokeWidth={2} name="Expenses" />
              <Area type="monotone" dataKey="profit" stroke={isDark ? '#22d3ee' : '#00b8d4'} fill="url(#profitGrad)" strokeWidth={2} name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {expenseCategories.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
                <Sparkles className="w-4 h-4 inline mr-1.5 text-gold-500" />
                Expenses Breakdown
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryInsights.map(c => ({ name: c.key, value: c.total, color: c.color, percent: totalExpenseAmount > 0 ? ((c.total / totalExpenseAmount) * 100).toFixed(1) : 0, count: c.count }))}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={2} dataKey="value"
                >
                  {categoryInsights.map((entry, i) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {categoryInsights.map((cat) => {
                const percent = totalExpenseAmount > 0 ? ((cat.total / totalExpenseAmount) * 100).toFixed(1) : 0;
                return (
                  <div key={cat.key} className="flex items-center justify-between text-sm px-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-navy-700 dark:text-navy-200 truncate">{cat.key}</span>
                      {cat.isAnomaly && (
                        <span title="Spending anomaly detected"><Sparkles className="w-3 h-3 text-amber-500 animate-pulse shrink-0" /></span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-navy-900 dark:text-white font-medium">{formatCurrency(cat.total)}</span>
                      <span className="text-navy-400 dark:text-navy-300 text-xs">{percent}%</span>
                      {cat.change !== 0 && (
                        <span className={cn(
                          'flex items-center gap-0.5 text-xs font-medium',
                          cat.change > 0 ? 'text-red-500' : 'text-green-500'
                        )}>
                          {cat.change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {Math.abs(cat.change).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {totalExpenseAmount > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-gold-500" />
            <h3 className="text-lg font-semibold text-navy-900 dark:text-white">Intelligent Expense Analysis</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-800 dark:to-navy-900 border border-navy-100 dark:border-navy-700">
              <p className="text-xs text-navy-500 dark:text-navy-400 mb-1">Monthly Average</p>
              <p className="text-xl font-bold text-navy-900 dark:text-white">{formatCurrency(totalExpenseAmount / 12)}</p>
              <p className="text-xs text-navy-400 dark:text-navy-300 mt-1">across {new Set(transactions.filter(t => t.type === 'expense').map(t => new Date(t.date).getMonth())).size} months</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-800 dark:to-navy-900 border border-navy-100 dark:border-navy-700">
              <p className="text-xs text-navy-500 dark:text-navy-400 mb-1">Top Category</p>
              <p className="text-xl font-bold text-navy-900 dark:text-white truncate">{expenseCategories[0]?.key || 'N/A'}</p>
              <p className="text-xs text-navy-400 dark:text-navy-300 mt-1">{expenseCategories[0] ? `${formatCurrency(expenseCategories[0].total)} (${totalExpenseAmount > 0 ? ((expenseCategories[0].total / totalExpenseAmount) * 100).toFixed(1) : 0}%)` : ''}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-800 dark:to-navy-900 border border-navy-100 dark:border-navy-700">
              <p className="text-xs text-navy-500 dark:text-navy-400 mb-1">Transaction Count</p>
              <p className="text-xl font-bold text-navy-900 dark:text-white">{expenseTransactions.length}</p>
              <p className="text-xs text-navy-400 dark:text-navy-300 mt-1">across {expenseCategories.length} categories</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-navy-50 to-navy-100 dark:from-navy-800 dark:to-navy-900 border border-navy-100 dark:border-navy-700">
              <p className="text-xs text-navy-500 dark:text-navy-400 mb-1">Avg per Transaction</p>
              <p className="text-xl font-bold text-navy-900 dark:text-white">{formatCurrency(expenseTransactions.length > 0 ? totalExpenseAmount / expenseTransactions.length : 0)}</p>
              <p className="text-xs text-navy-400 dark:text-navy-300 mt-1">category range: {formatCurrency(Math.min(...expenseCategories.map(c => c.total)))} – {formatCurrency(Math.max(...expenseCategories.map(c => c.total)))}</p>
            </div>
          </div>
          {categoryInsights.filter(c => c.isAnomaly).length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Anomalies detected:</span>
                <span>{categoryInsights.filter(c => c.isAnomaly).map(c => c.key).join(', ')} — spending is 50%+ above monthly average</span>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white">{t('accounting.invoices')}</h3>
          <button onClick={() => {
            const csv = [['Number','Amount','Status','Date'], ...invoices.map((i: any) => [i.number, i.amount, i.status, i.createdAt])].map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'invoices.csv'; a.click();
            URL.revokeObjectURL(url);
          }} className="flex items-center gap-1 text-sm text-navy-400 dark:text-navy-200 hover:text-navy-600 dark:hover:text-navy-200 transition-colors">
            <Download className="w-4 h-4" /> {t('admin.exportCsv')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 dark:border-navy-700">
                <th className="text-left py-3 font-medium text-navy-400 dark:text-navy-200">Invoice</th>
                <th className="text-right py-3 font-medium text-navy-400 dark:text-navy-200">Amount</th>
                <th className="text-center py-3 font-medium text-navy-400 dark:text-navy-200">Status</th>
                <th className="text-right py-3 font-medium text-navy-400 dark:text-navy-200">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-b border-navy-50 dark:border-navy-800 hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors">
                  <td className="py-3 font-medium">{inv.number}</td>
                  <td className="py-3 text-right font-medium">{formatCurrency(inv.amount)}</td>
                  <td className="py-3 text-center">
                    <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : inv.status === 'sent' ? 'info' : 'warning'}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-navy-400 dark:text-navy-200">{formatDate(inv.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showInvoice} onClose={() => setShowInvoice(false)} title={t('accounting.createInvoice')}>
        <form className="space-y-4" onSubmit={handleCreateInvoice}>
          <Input name="number" label="Invoice Number" required />
          <Input name="amount" label="Amount ($)" type="number" required />
          <Input name="description" label="Description" />
          <Input name="dueDate" label="Due Date" type="date" />
          <Button type="submit" loading={saving} className="w-full">{t('common.create')}</Button>
        </form>
      </Modal>

      <Modal open={showTransaction} onClose={() => setShowTransaction(false)} title={t('accounting.addTransaction')}>
        <form className="space-y-4" onSubmit={handleCreateTransaction}>
          <Input name="label" label="Label" required />
          <Input name="amount" label="Amount ($)" type="number" required />
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">Type</label>
            <select name="type" className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white">
              <option value="income">{t('accounting.income')}</option>
              <option value="expense">{t('accounting.expenses')}</option>
            </select>
          </div>
          <Input name="category" label="Category (e.g. Marketing, Hosting, Salaries)" />
          <Button type="submit" loading={saving} className="w-full">{t('common.create')}</Button>
        </form>
      </Modal>
    </div>
  );
}
