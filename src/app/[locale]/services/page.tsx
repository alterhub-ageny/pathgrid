'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const services = [
  {
    title: 'UI/UX Design',
    description: 'We craft intuitive, beautiful interfaces that users love. Our design process combines research, prototyping, and rigorous testing to deliver experiences that drive engagement.',
    features: ['User Research & Testing', 'Wireframing & Prototyping', 'Visual Design & Branding', 'Design Systems', 'Accessibility Audits'],
    pricing: [
      { tier: 'Starter', price: '$5,000', items: ['UX Audit', 'Wireframes', 'Homepage Design'] },
      { tier: 'Professional', price: '$15,000', items: ['Full UI Design', 'Design System', 'User Testing', 'Prototype'] },
      { tier: 'Enterprise', price: 'Custom', items: ['End-to-end Design', 'Design Operations', 'Dedicated Team', 'Strategic Consulting'] },
    ],
  },
  {
    title: 'Web Development',
    description: 'High-performance web applications built with cutting-edge technologies. From SPAs to complex platforms, we deliver scalable, maintainable code.',
    features: ['React/Next.js Development', 'Node.js Backend', 'CMS Integration', 'API Development', 'Performance Optimization'],
    pricing: [
      { tier: 'Starter', price: '$10,000', items: ['Landing Page', 'Basic CMS', 'Responsive Design'] },
      { tier: 'Professional', price: '$30,000', items: ['Full Web App', 'Custom Backend', 'Database Design', 'API Integration'] },
      { tier: 'Enterprise', price: 'Custom', items: ['Complex Platform', 'Microservices', 'Cloud Infrastructure', '24/7 Support'] },
    ],
  },
  {
    title: 'Digital Strategy',
    description: 'Data-driven strategies that align with your business goals and deliver measurable results.',
    features: ['Market Research', 'Competitive Analysis', 'Growth Strategy', 'Conversion Optimization', 'Analytics Setup'],
    pricing: [
      { tier: 'Starter', price: '$3,000', items: ['Audit & Assessment', 'Strategy Report', 'Recommendations'] },
      { tier: 'Professional', price: '$10,000', items: ['Full Strategy', 'Roadmap', 'KPI Framework', 'Monthly Review'] },
      { tier: 'Enterprise', price: 'Custom', items: ['Ongoing Consulting', 'Full Analytics', 'CRO Program', 'Executive Reports'] },
    ],
  },
];

export default function ServicesPage() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="pt-24 lg:pt-28">
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mb-16"
          >
            <h1 className="text-5xl lg:text-7xl font-serif font-bold mb-6">{t('services.title')}</h1>
            <p className="text-xl text-navy-500 dark:text-navy-300">{t('services.subtitle')}</p>
          </motion.div>

          <div className="space-y-4">
            {services.map((service, i) => (
              <Card key={i} hover={false} className="overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <h3 className="text-2xl font-serif font-semibold">{service.title}</h3>
                  <ChevronDown className={cn('w-5 h-5 transition-transform', expanded === i && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 border-t border-navy-100 dark:border-navy-700 mt-4">
                        <p className="text-navy-500 dark:text-navy-300 mb-8 leading-relaxed">{service.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="font-semibold mb-3">Features</h4>
                            <ul className="space-y-2">
                              {service.features.map((f, j) => (
                                <li key={j} className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-300">
                                  <Check className="w-4 h-4 text-gold-500 flex-shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3">{t('services.pricing')}</h4>
                            <div className="space-y-3">
                              {service.pricing.map((p, j) => (
                                <div key={j} className="p-4 rounded-xl bg-navy-50 dark:bg-navy-700/50">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm">{p.tier}</span>
                                    <span className="text-gold-600 dark:text-gold-500 font-semibold">{p.price}</span>
                                  </div>
                                  <ul className="text-xs text-navy-500 dark:text-navy-400 space-y-0.5">
                                    {p.items.map((item, k) => (
                                      <li key={k}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
