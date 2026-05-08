'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

const monthlyData = [
  { month: 'Jan', revenue: 45000, expenses: 28000, profit: 17000 },
  { month: 'Feb', revenue: 52000, expenses: 31000, profit: 21000 },
  { month: 'Mar', revenue: 48000, expenses: 27000, profit: 21000 },
  { month: 'Apr', revenue: 61000, expenses: 33000, profit: 28000 },
  { month: 'May', revenue: 58000, expenses: 29000, profit: 29000 },
  { month: 'Jun', revenue: 72000, expenses: 35000, profit: 37000 },
  { month: 'Jul', revenue: 68000, expenses: 32000, profit: 36000 },
  { month: 'Aug', revenue: 75000, expenses: 38000, profit: 37000 },
  { month: 'Sep', revenue: 82000, expenses: 36000, profit: 46000 },
  { month: 'Oct', revenue: 78000, expenses: 34000, profit: 44000 },
  { month: 'Nov', revenue: 85000, expenses: 39000, profit: 46000 },
  { month: 'Dec', revenue: 95000, expenses: 42000, profit: 53000 },
];

const invoices = [
  { id: '1', number: 'INV-2025-0042', client: 'TechVentures Inc', amount: 15000, status: 'paid', date: '2026-04-28' },
  { id: '2', number: 'INV-2025-0043', client: 'Elevate Brand Studio', amount: 25000, status: 'sent', date: '2026-05-01' },
  { id: '3', number: 'INV-2025-0044', client: 'FinFlow Inc', amount: 12000, status: 'overdue', date: '2026-04-15' },
  { id: '4', number: 'INV-2025-0045', client: 'NexGen Solutions', amount: 35000, status: 'draft', date: '2026-05-05' },
  { id: '5', number: 'INV-2025-0046', client: 'HealthPlus', amount: 8000, status: 'paid', date: '2026-04-20' },
];

export default function AccountingPage() {
  const { t } = useTranslation();
  const [showInvoice, setShowInvoice] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);

  const totalRevenue = monthlyData.reduce((s, d) => s + d.revenue, 0);
  const totalExpenses = monthlyData.reduce((s, d) => s + d.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white dark:bg-navy-800 p-3 rounded-xl shadow-lg border">
          <p className="text-sm font-medium mb-1 text-navy-900 dark:text-white">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-sm" style={{ color: entry.color }}>{entry.name}: {formatCurrency(entry.value)}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">{t('accounting.title')}</h1>
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
          { label: t('accounting.totalRevenue'), value: totalRevenue, icon: TrendingUp, color: 'text-green-600' },
          { label: t('accounting.totalExpenses'), value: totalExpenses, icon: TrendingDown, color: 'text-red-600' },
          { label: t('accounting.netProfit'), value: netProfit, icon: DollarSign, color: 'text-blue-600' },
          { label: t('accounting.pendingInvoices'), value: invoices.filter(i => i.status !== 'paid').length, icon: FileText, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold font-serif">{formatCurrency(stat.value)}</p>
              <p className="text-sm text-navy-400 mt-1">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('accounting.profitLoss')}</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a2f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1a2f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#1a2f5e" fill="url(#profitGrad)" strokeWidth={2} name="Revenue" />
            <Area type="monotone" dataKey="expenses" stroke="#d4a61e" fill="url(#profitGrad)" strokeWidth={2} name="Expenses" />
            <Area type="monotone" dataKey="profit" stroke="#00b8d4" fill="url(#profitGrad)" strokeWidth={2} name="Profit" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('accounting.invoices')}</h3>
          <button className="flex items-center gap-1 text-sm text-navy-400 hover:text-navy-600 dark:hover:text-navy-200 transition-colors">
            <Download className="w-4 h-4" /> {t('admin.exportCsv')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 dark:border-navy-700">
                <th className="text-left py-3 font-medium text-navy-400">Invoice</th>
                <th className="text-left py-3 font-medium text-navy-400">Client</th>
                <th className="text-right py-3 font-medium text-navy-400">Amount</th>
                <th className="text-center py-3 font-medium text-navy-400">Status</th>
                <th className="text-right py-3 font-medium text-navy-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-navy-50 dark:border-navy-800 hover:bg-navy-50 dark:hover:bg-navy-800/50 transition-colors">
                  <td className="py-3 font-medium">{inv.number}</td>
                  <td className="py-3 text-navy-500 dark:text-navy-300">{inv.client}</td>
                  <td className="py-3 text-right font-medium">{formatCurrency(inv.amount)}</td>
                  <td className="py-3 text-center">
                    <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : inv.status === 'sent' ? 'info' : 'warning'}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-navy-400">{formatDate(inv.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={showInvoice} onClose={() => setShowInvoice(false)} title={t('accounting.createInvoice')}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowInvoice(false); }}>
          <Input name="client" label="Client Name" required />
          <Input name="amount" label="Amount ($)" type="number" required />
          <Input name="description" label="Description" />
          <Input name="dueDate" label="Due Date" type="date" />
          <Button type="submit" className="w-full">{t('common.create')}</Button>
        </form>
      </Modal>

      <Modal open={showTransaction} onClose={() => setShowTransaction(false)} title={t('accounting.addTransaction')}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowTransaction(false); }}>
          <Input name="label" label="Label" required />
          <Input name="amount" label="Amount ($)" type="number" required />
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">Type</label>
            <select name="type" className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white">
              <option value="income">{t('accounting.income')}</option>
              <option value="expense">{t('accounting.expenses')}</option>
            </select>
          </div>
          <Input name="category" label="Category" />
          <Button type="submit" className="w-full">{t('common.create')}</Button>
        </form>
      </Modal>
    </div>
  );
}
