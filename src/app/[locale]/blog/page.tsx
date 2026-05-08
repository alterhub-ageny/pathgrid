'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';

const posts = [
  { title: 'The Future of Digital Experience Design', excerpt: 'Exploring how AI and personalization are reshaping how users interact with digital products.', slug: 'future-digital-experience', category: 'Design', author: 'Alex Mercer', date: '2025-12-15' },
  { title: 'Building Performant Next.js Applications', excerpt: 'Best practices for building blazing-fast web applications with the latest Next.js features.', slug: 'performant-nextjs', category: 'Development', author: 'David Kim', date: '2025-11-28' },
  { title: 'Data-Driven Brand Strategy', excerpt: 'How leveraging analytics can transform your brand strategy and deliver measurable results.', slug: 'data-driven-brand-strategy', category: 'Strategy', author: 'Priya Sharma', date: '2025-11-10' },
  { title: 'Designing for Accessibility First', excerpt: 'Why inclusive design should be at the core of every digital product and how to implement it.', slug: 'accessibility-first-design', category: 'Design', author: 'Lena Park', date: '2025-10-22' },
];

const categories = ['All', 'Design', 'Development', 'Strategy'];

export default function BlogPage() {
  const { t, locale, isRtl } = useTranslation();
  const [category, setCategory] = useState('All');

  const filtered = category === 'All' ? posts : posts.filter(p => p.category === category);

  return (
    <div className="pt-24 lg:pt-28">
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mb-12"
          >
            <h1 className="text-5xl lg:text-7xl font-serif font-bold mb-6">{t('blog.title')}</h1>
            <p className="text-xl text-navy-500 dark:text-navy-300">{t('blog.subtitle')}</p>
          </motion.div>

          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  category === cat
                    ? 'bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900'
                    : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-700'
                }`}
              >
                {cat === 'All' ? t('portfolio.all') : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((post, i) => (
              <Link key={i} href={`/${locale}/blog/${post.slug}`}>
                <Card delay={i * 0.1}>
                  <div className="flex items-center gap-2 text-xs text-navy-400 mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300">{post.category}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-gold-600 transition-colors">{post.title}</h3>
                  <p className="text-navy-500 dark:text-navy-400 text-sm mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-navy-400">By {post.author}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 dark:text-gold-500 group-hover:gap-2 transition-all">
                      {t('blog.readMore')}
                      <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
