'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check, Trash2, Loader2, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [adding, setAdding] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/data?type=tasks');
      const json = await res.json();
      setTasks((Array.isArray(json) ? json : json.data || []).filter((t: Task) => t.status !== 'done'));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async () => {
    const title = newTask.trim();
    if (!title) return;
    setAdding(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tasks', action: 'create', data: { title, status: 'pending' } }),
      });
      const json = await res.json();
      if (json.success) {
        setNewTask('');
        toast.success('Task added');
        fetchTasks();
      } else {
        toast.error(json.error || 'Failed to add task');
      }
    } catch {
      toast.error('Failed to add task');
    } finally {
      setAdding(false);
    }
  };

  const completeTask = async (task: Task) => {
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tasks', action: 'update', data: { id: task.id, status: 'done' } }),
      });
      toast.success('Task completed');
      fetchTasks();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tasks', action: 'delete', data: { id } }),
      });
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const suggestTasks = async () => {
    setAiThinking(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Suggest 3 specific actionable tasks for a digital agency team today. Return them as a simple numbered list with just the task names, one per line.',
          sessionId: 'task-suggestions',
        }),
      });
      const json = await res.json();
      if (json.reply) {
        const suggestions = json.reply.split('\n').filter((l: string) => l.match(/^\d+\./) || l.match(/^- /)).map((l: string) => l.replace(/^\d+\.\s*|^-\s*/, '').trim()).filter(Boolean);
        for (const title of suggestions.slice(0, 3)) {
          await fetch('/api/admin/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'tasks', action: 'create', data: { title, status: 'pending' } }),
          });
        }
        toast.success(`Added ${Math.min(suggestions.length, 3)} AI-suggested tasks`);
        fetchTasks();
      }
    } catch {
      toast.error('Failed to get suggestions');
    } finally {
      setAiThinking(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Task Manager</h3>
        <button onClick={suggestTasks} disabled={aiThinking}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-600 transition-colors disabled:opacity-50">
          <Sparkles className="w-3.5 h-3.5" />
          {aiThinking ? 'Thinking...' : 'AI Suggest'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task..."
          className="flex-1 px-3 py-2 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
        <button onClick={addTask} disabled={adding || !newTask.trim()}
          className="p-2 rounded-lg bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 hover:opacity-90 disabled:opacity-50">
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-navy-400" /></div>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-navy-400 text-center py-4">No tasks yet</p>
        ) : (
          tasks.map((task, i) => (
            <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-50 dark:bg-navy-800/50 group">
              <button onClick={() => completeTask(task)}
                className="p-0.5 rounded border border-navy-300 dark:border-navy-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <Check className="w-3.5 h-3.5 text-transparent group-hover:text-green-500" />
              </button>
              <span className="flex-1 text-sm text-navy-900 dark:text-white truncate">{task.title}</span>
              <button onClick={() => deleteTask(task.id)}
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
}
