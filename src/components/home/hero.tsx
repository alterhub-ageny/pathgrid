'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function HeroSection() {
  const { t, locale, isRtl } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-navy-500/10 rounded-full blur-3xl animate-float" />

      <motion.div style={{ y, opacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy-100 dark:bg-navy-800 rounded-full text-sm text-navy-700 dark:text-navy-200 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
            {t('common.tagline')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-serif font-bold leading-[1.1] tracking-tight mb-6"
          >
            {t('home.heroTitle')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg sm:text-xl text-navy-500 dark:text-navy-300 max-w-2xl mb-10 leading-relaxed"
          >
            {t('home.heroSubtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href={`/${locale}/contact`}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-2xl font-medium hover:bg-navy-800 dark:hover:bg-gold-400 transition-all duration-300 shadow-lg shadow-navy-700/20 dark:shadow-gold-500/20"
            >
              {t('home.heroCta')}
              <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>
            <Link
              href={`/${locale}/portfolio`}
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-navy-300 dark:border-navy-600 text-navy-700 dark:text-white rounded-2xl font-medium hover:bg-navy-50 dark:hover:bg-navy-800 transition-all duration-300"
            >
              <Play className="w-5 h-5" />
              {t('portfolio.viewProject')}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-navy-400 dark:border-navy-500 flex items-start justify-center p-1.5"
        >
          <div className="w-1.5 h-3 rounded-full bg-navy-400 dark:bg-navy-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
