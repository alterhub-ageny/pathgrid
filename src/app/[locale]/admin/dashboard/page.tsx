'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Users, Target, FileText, Loader2, SlidersHorizontal, Check } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setStats([]); return; }
        setStats([
          { label: 'Revenue', value: data.revenue, change: `${formatCurrency(data.invoiced || 0)} this month`, icon: DollarSign },
          { label: 'Leads', value: data.leads, change: `+${data.newLeads || 0} new this month`, icon: Target },
          { label: 'Clients', value: data.clients, change: 'Active', icon: Users },
          { label: 'Projects', value: data.projects, change: 'Active', icon: FileText },
        ]);
      })
      .catch(() => setStats([]))
      .finally(() => setLoading(false));

    try {
      const saved = localStorage.getItem(SECTIONS_KEY);
      if (saved) setSections(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Layout</span>
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-navy-100 dark:border-navy-700 z-50 overflow-hidden origin-top-right"
              >
                <div className="px-4 py-3 border-b border-navy-100 dark:border-navy-700">
                  <p className="text-xs font-semibold text-navy-500 dark:text-navy-400 uppercase tracking-wider">Dashboard Sections</p>
                </div>
                <div className="p-2 space-y-1">
                  {sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggleSection(s.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-navy-50 dark:hover:bg-navy-700/50 transition-colors group"
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        s.visible
                          ? 'bg-gold-500 border-gold-500'
                          : 'border-navy-300 dark:border-navy-500 group-hover:border-gold-400'
                      }`}>
                        {s.visible && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm ${s.visible ? 'text-navy-900 dark:text-white font-medium' : 'text-navy-400 dark:text-navy-500'}`}>
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                  {stat.label === 'Revenue' ? formatCurrency(stat.value) : stat.value}
                </p>
                <p className="text-xs text-navy-400 mt-1">{stat.label}</p>
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
