'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useData } from '@/hooks/use-data';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function ServicesPage() {
  const { t } = useTranslation();
  const { data: services, loading } = useData<any>('services');
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="pt-24 lg:pt-28">
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mb-16">
            <h1 className="text-5xl lg:text-7xl font-serif font-bold mb-6">{t('services.title')}</h1>
            <p className="text-xl text-navy-500 dark:text-navy-300">{t('services.subtitle')}</p>
          </motion.div>

          <div className="space-y-4">
            {(loading ? [] : services).map((service: any, i: number) => {
              const features = service.features ? service.features.split(',').map((f: string) => f.trim()) : [];
              return (
                <Card key={service.id} hover={false} className="overflow-hidden">
                  <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full flex items-center justify-between text-left">
                    <h3 className="text-2xl font-serif font-semibold">{service.title}</h3>
                    <ChevronDown className={cn('w-5 h-5 transition-transform', expanded === i && 'rotate-180')} />
                  </button>

                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <div className="pt-6 border-t border-navy-100 dark:border-navy-700 mt-4">
                          <p className="text-navy-500 dark:text-navy-300 mb-8 leading-relaxed">{service.description}</p>
                          {features.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3">Features</h4>
                              <ul className="space-y-2">
                                {features.map((f: string, j: number) => (
                                  <li key={j} className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300">
                                    <Check className="w-4 h-4 text-gold-500 flex-shrink-0" />{f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {service.priceTier && (
                            <div className="mt-6 p-4 rounded-xl bg-navy-50 dark:bg-navy-700/50">
                              <span className="font-medium">{t('services.pricing')}: </span>
                              <span className="text-gold-600 dark:text-gold-500 font-semibold">{service.priceTier}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
