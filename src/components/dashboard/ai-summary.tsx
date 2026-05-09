'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function AISummary() {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Give me a brief executive summary of the current state of the agency - key metrics, active projects, recent wins, and areas needing attention. Keep it to 3-4 short bullets.',
          sessionId: 'dashboard-summary',
        }),
      });
      const json = await res.json();
      if (json.reply) setSummary(json.reply);
    } catch {
      setSummary('Unable to generate summary right now.');
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
          <RefreshCw className={`w-4 h-4 text-navy-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-navy-400">
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
