'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useData } from '@/hooks/use-data';
import { Card } from '@/components/ui/card';

export function TestimonialsSection() {
  const { t } = useTranslation();
  const { data: testimonials } = useData<any>('testimonials');

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-4">{t('home.testimonialsTitle')}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(testimonials.length > 0 ? testimonials : []).slice(0, 3).map((item: any, i: number) => (
            <Card key={item.id} delay={i * 0.15} className="relative">
              <Quote className="w-8 h-8 text-gold-500/30 absolute top-6 right-6" />
              <div className="mb-4 flex gap-1">
                {Array.from({ length: item.rating || 5 }).map((_, j) => (
                  <span key={j} className="text-gold-500 text-lg">★</span>
                ))}
              </div>
              <p className="text-navy-600 dark:text-navy-300 mb-6 leading-relaxed text-sm">&ldquo;{item.content}&rdquo;</p>
              <div>
                <p className="font-semibold text-navy-900 dark:text-white">{item.name}</p>
                {item.company && <p className="text-sm text-navy-400">{item.company}</p>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
