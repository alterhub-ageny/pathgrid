'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { FolderKanban, Loader2 } from 'lucide-react';

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/client/data?type=projects')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProjects(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-navy-900 dark:text-white mb-10">My Projects</h1>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-navy-400" /></div>
      ) : projects.length === 0 ? (
        <Card hover={false} className="flex flex-col items-center justify-center py-16">
          <FolderKanban className="w-16 h-16 text-navy-300 dark:text-navy-600 mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">No active projects</h3>
          <p className="text-sm text-navy-400">Your projects will appear here</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <Card key={project.id} delay={i * 0.1}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-serif font-semibold text-navy-900 dark:text-white">{project.title}</h3>
                <Badge variant={project.status === 'active' ? 'info' : project.status === 'completed' ? 'success' : 'warning'}>
                  {project.status}
                </Badge>
              </div>
              {project.description && (
                <p className="text-sm text-navy-500 dark:text-navy-400 mb-3 line-clamp-2">{project.description}</p>
              )}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-navy-400 mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-navy-100 dark:bg-navy-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                    className="h-full bg-navy-700 dark:bg-gold-500 rounded-full"
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm text-navy-500 dark:text-navy-400">
                <span>{project.deadline ? `Deadline: ${new Date(project.deadline).toLocaleDateString()}` : ''}</span>
                <span className="font-medium">{project.budget ? formatCurrency(project.budget) : ''}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
