'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';

const testimonials = [
  {
    name: 'Sarah Chen',
    company: 'TechVentures Inc.',
    content: 'Pathgrid transformed our digital presence completely. The strategic approach and attention to detail exceeded our expectations.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    company: 'Elevate Brand Studio',
    content: 'Working with Pathgrid was a game-changer. Their team understood our vision and delivered beyond what we imagined.',
    rating: 5,
  },
  {
    name: 'Aisha Rahman',
    company: 'NexGen Solutions',
    content: 'The level of creativity and professionalism is outstanding. Our conversion rates increased by 200% after the redesign.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-4">{t('home.testimonialsTitle')}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, i) => (
            <Card key={i} delay={i * 0.15} className="relative">
              <Quote className="w-8 h-8 text-gold-500/30 absolute top-6 right-6" />
              <div className="mb-4 flex gap-1">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <span key={j} className="text-gold-500 text-lg">★</span>
                ))}
              </div>
              <p className="text-navy-600 dark:text-navy-300 mb-6 leading-relaxed text-sm">&ldquo;{item.content}&rdquo;</p>
              <div>
                <p className="font-semibold text-navy-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-navy-400">{item.company}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
