'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useData } from '@/hooks/use-data';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function PortfolioPage() {
  const { t, locale } = useTranslation();
  const { data: projects, loading } = useData<any>('portfolio');
  const [activeFilter, setActiveFilter] = useState('All');

  const industries = useMemo(() => {
    const set = new Set(projects.map((p: any) => p.industry).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [projects]);

  const filtered = activeFilter === 'All' ? projects : projects.filter((p: any) => p.industry === activeFilter);

  return (
    <div className="pt-24 lg:pt-28">
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mb-12">
            <h1 className="text-5xl lg:text-7xl font-serif font-bold mb-6">{t('portfolio.title')}</h1>
            <p className="text-xl text-navy-500 dark:text-navy-300">{t('portfolio.subtitle')}</p>
          </motion.div>

          <div className="flex flex-wrap gap-2 mb-12">
            {industries.map((industry) => (
              <button key={industry} onClick={() => setActiveFilter(industry)}
                className={cn('px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  activeFilter === industry
                    ? 'bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900'
                    : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-700'
                )}>
                {industry}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(loading ? [] : filtered).map((project: any, i: number) => {
              const tags = project.tags ? project.tags.split(',').map((t: string) => t.trim()) : project.technologies ? project.technologies.split(',').map((t: string) => t.trim()) : [];
              return (
                <Card key={project.id} delay={i * 0.1} className="group cursor-pointer">
                  <div className="aspect-video rounded-xl bg-navy-100 dark:bg-navy-700 mb-4 overflow-hidden flex items-center justify-center text-navy-300 dark:text-navy-500 font-serif text-4xl">
                    {project.title[0]}
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-serif font-semibold">{project.title}</h3>
                    <ExternalLink className="w-4 h-4 text-navy-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {project.client && <p className="text-sm text-navy-400 mb-1">{project.client}</p>}
                  {project.result && <p className="text-sm text-gold-600 dark:text-gold-500 font-medium mb-3">{project.result}</p>}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.slice(0, 4).map((tag: string, j: number) => (
                        <span key={j} className="px-2 py-0.5 bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300 rounded-md text-xs">{tag}</span>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
