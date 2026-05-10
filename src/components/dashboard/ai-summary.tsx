'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function AISummary() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchSummary = async () => {
    setRefreshing(true);
    setError(false);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Give me a brief executive summary of the current state of the agency. Keep it to 3-4 short bullet points.',
          sessionId: 'dashboard-summary',
        }),
      });
      const json = await res.json();
      if (json.reply) {
        setSummary(json.reply);
      } else {
        setSummary('• Dashboard overview ready\n• Check Pipeline for lead status\n• Review Invoices for pending payments\n• Team is active on current projects');
      }
    } catch {
      setError(true);
      setSummary('• Dashboard overview ready\n• Check Pipeline for lead status\n• Review Invoices for pending payments\n• Team is active on current projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-gold-600 dark:text-gold-400" />
          </div>
          <h3 className="text-lg font-semibold">AI Summary</h3>
        </div>
        <button onClick={fetchSummary} disabled={refreshing}
          className="p-1.5 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors">
          <RefreshCw className={`w-4 h-4 text-navy-400 dark:text-navy-200 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {error && (
        <div className="mb-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5" />
          AI mode inactive — showing default overview
        </div>
      )}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-navy-400 dark:text-navy-200">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating summary...
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-navy-600 dark:text-navy-300 leading-relaxed whitespace-pre-line">
          {summary}
        </motion.div>
      )}
    </Card>
  );
}
