'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Filter } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const projects = [
  { title: 'NexGen Platform Redesign', client: 'NexGen Solutions', industry: 'Technology', result: '200% increase in user engagement', image: '', tags: ['React', 'Node.js', 'AWS'] },
  { title: 'Elevate Brand Identity', client: 'Elevate Brand Studio', industry: 'Branding', result: 'Brand recognition up 150%', image: '', tags: ['Design', 'Strategy', 'Branding'] },
  { title: 'FinFlow Dashboard', client: 'FinFlow Inc.', industry: 'Fintech', result: '40% faster reporting', image: '', tags: ['Next.js', 'D3.js', 'Python'] },
  { title: 'HealthPlus Mobile App', client: 'HealthPlus', industry: 'Healthcare', result: '4.8★ app store rating', image: '', tags: ['React Native', 'Firebase', 'AI'] },
  { title: 'GreenLeaf E-commerce', client: 'GreenLeaf Co.', industry: 'E-commerce', result: '300% revenue growth', image: '', tags: ['Shopify', 'Liquid', 'Vue.js'] },
  { title: 'CityGuide Travel Portal', client: 'CityGuide', industry: 'Travel', result: '1M+ monthly visitors', image: '', tags: ['Next.js', 'GraphQL', 'Docker'] },
];

const industries = ['All', 'Technology', 'Branding', 'Fintech', 'Healthcare', 'E-commerce', 'Travel'];

export default function PortfolioPage() {
  const { t, locale } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All' ? projects : projects.filter(p => p.industry === activeFilter);

  return (
    <div className="pt-24 lg:pt-28">
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mb-12"
          >
            <h1 className="text-5xl lg:text-7xl font-serif font-bold mb-6">{t('portfolio.title')}</h1>
            <p className="text-xl text-navy-500 dark:text-navy-300">{t('portfolio.subtitle')}</p>
          </motion.div>

          <div className="flex flex-wrap gap-2 mb-12">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setActiveFilter(industry)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  activeFilter === industry
                    ? 'bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900'
                    : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-700'
                )}
              >
                {industry}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, i) => (
              <Card key={i} delay={i * 0.1} className="group cursor-pointer">
                <div className="aspect-video rounded-xl bg-navy-100 dark:bg-navy-700 mb-4 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-navy-300 dark:text-navy-500 font-serif text-4xl">
                    {project.title[0]}
                  </div>
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-serif font-semibold">{project.title}</h3>
                  <ExternalLink className="w-4 h-4 text-navy-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-navy-400 mb-1">{project.client}</p>
                <p className="text-sm text-gold-600 dark:text-gold-500 font-medium mb-3">{project.result}</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag, j) => (
                    <span key={j} className="px-2 py-0.5 bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300 rounded-md text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
