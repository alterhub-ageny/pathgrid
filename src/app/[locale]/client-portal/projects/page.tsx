'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const projects = [
  { title: 'Website Redesign', status: 'active', progress: 75, deadline: '2026-06-15', budget: 45000 },
  { title: 'Mobile App Development', status: 'active', progress: 45, deadline: '2026-08-01', budget: 85000 },
  { title: 'Brand Identity Package', status: 'completed', progress: 100, deadline: '2026-04-01', budget: 25000 },
];

export default function ClientProjectsPage() {
  const { t, locale } = useTranslation();

  return (
    <div className="pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif font-bold mb-10">{t('client.projects')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <Card key={i} delay={i * 0.1}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-serif font-semibold">{project.title}</h3>
                <Badge variant={project.status === 'active' ? 'info' : 'success'}>{project.status}</Badge>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-navy-400 mb-1">
                  <span>{t('client.projectProgress')}</span>
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
                <span>Deadline: {project.deadline}</span>
                <span className="font-medium">${project.budget.toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
