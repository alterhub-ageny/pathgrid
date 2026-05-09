'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Palette, Code, BarChart, Globe, Smartphone, Pen } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useData } from '@/hooks/use-data';
import { Card } from '@/components/ui/card';

const iconMap: Record<string, any> = { Palette, Code, BarChart, Globe, Smartphone, Pen };

export function ServicesPreview() {
  const { t, locale, isRtl } = useTranslation();
  const { data: services, loading } = useData<any>('services');

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-navy-50/50 dark:bg-navy-800/30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-4">{t('home.servicesTitle')}</h2>
          <p className="text-navy-500 dark:text-navy-300 max-w-2xl mx-auto text-lg">{t('home.servicesSubtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(loading ? [] : services).slice(0, 6).map((service: any, i: number) => {
            const Icon = iconMap[service.icon] || Code;
            return (
              <Card key={service.id} delay={i * 0.1}>
                <div className="w-12 h-12 rounded-xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-navy-700 dark:text-gold-500" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-2">{service.title}</h3>
                <p className="text-navy-500 dark:text-navy-400 text-sm leading-relaxed">{service.description}</p>
              </Card>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
          <Link href={`/${locale}/services`} className="inline-flex items-center gap-2 px-6 py-3 border-2 border-navy-700 dark:border-white text-navy-700 dark:text-white rounded-xl font-medium hover:bg-navy-700 hover:text-white dark:hover:bg-white dark:hover:text-navy-900 transition-all duration-300 group">
            {t('common.viewAll')}
            <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
