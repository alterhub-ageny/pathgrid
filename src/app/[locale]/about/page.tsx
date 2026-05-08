'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Target, Eye, Users } from 'lucide-react';

const team = [
  { name: 'Alex Mercer', role: 'CEO & Founder', bio: 'Visionary leader with 15+ years in digital strategy.' },
  { name: 'Lena Park', role: 'Creative Director', bio: 'Award-winning designer passionate about brand storytelling.' },
  { name: 'David Kim', role: 'Technical Lead', bio: 'Full-stack architect building scalable digital solutions.' },
  { name: 'Priya Sharma', role: 'Strategy Director', bio: 'Data-driven strategist focused on measurable growth.' },
];

export default function AboutPage() {
  const { t, locale } = useTranslation();

  return (
    <div className="pt-24 lg:pt-28">
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl lg:text-7xl font-serif font-bold mb-6">{t('about.title')}</h1>
            <p className="text-xl text-navy-500 dark:text-navy-300 leading-relaxed">{t('about.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-navy-50/50 dark:bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: t('about.mission'), text: t('about.missionText') },
              { icon: Eye, title: t('about.vision'), text: t('about.visionText') },
              { icon: Users, title: t('about.culture'), text: 'Collaborative, innovative, and relentlessly focused on delivering excellence.' },
            ].map((item, i) => (
              <Card key={i} delay={i * 0.1}>
                <item.icon className="w-8 h-8 text-gold-500 mb-4" />
                <h3 className="text-xl font-serif font-semibold mb-2">{item.title}</h3>
                <p className="text-navy-500 dark:text-navy-400 text-sm leading-relaxed">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-serif font-bold mb-12"
          >
            {t('about.team')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <Card key={i} delay={i * 0.1}>
                <div className="w-16 h-16 rounded-full bg-navy-100 dark:bg-navy-700 flex items-center justify-center mb-4">
                  <span className="text-xl font-serif font-bold text-navy-700 dark:text-gold-500">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-semibold">{member.name}</h3>
                <p className="text-sm text-gold-600 dark:text-gold-500 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-navy-500 dark:text-navy-400 leading-relaxed">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
