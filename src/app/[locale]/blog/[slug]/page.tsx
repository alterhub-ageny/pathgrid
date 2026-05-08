'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const posts = {
  'future-digital-experience': {
    title: 'The Future of Digital Experience Design',
    content: `
      The digital landscape is evolving at an unprecedented pace. Artificial intelligence, machine learning, and advanced personalization are fundamentally changing how users interact with digital products.

      ## The Rise of AI-Driven Design

      AI is not just a tool for automation—it's becoming a core part of the design process. From generating design variations to predicting user behavior, AI helps designers create more intuitive and personalized experiences.

      ## Personalization at Scale

      Modern users expect experiences tailored to their preferences. With advanced data analytics and machine learning algorithms, we can now deliver personalized experiences at scale without sacrificing performance.

      ## The Importance of Emotional Design

      As technology becomes more sophisticated, the human element becomes more critical. Emotional design focuses on creating connections between users and products through thoughtful interactions, delightful micro-animations, and meaningful content.

      ## Key Takeaways

      - AI and personalization are reshaping UX design
      - Emotional connection drives user engagement
      - Performance and accessibility remain paramount
      - The future is human-centered, technology-enabled
    `,
    author: 'Alex Mercer',
    date: '2025-12-15',
    category: 'Design',
  },
};

export default function BlogPostPage() {
  const { locale, slug } = useParams();
  const { t, isRtl } = useTranslation();
  const post = posts[slug as keyof typeof posts];

  if (!post) {
    return (
      <div className="pt-24 lg:pt-28">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-serif font-bold mb-4">{t('errors.notFound')}</h1>
          <Link href={`/${locale}/blog`} className="text-gold-600 dark:text-gold-500 hover:underline">{t('blog.backToBlog')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-28">
      <article className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 text-sm text-navy-500 dark:text-navy-300 hover:text-navy-700 dark:hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              {t('blog.backToBlog')}
            </Link>

            <div className="flex items-center gap-4 text-sm text-navy-400 mb-4">
              <span className="px-3 py-1 rounded-full bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300">{post.category}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-8">{post.title}</h1>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {post.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-serif font-bold mt-10 mb-4">{line.slice(3)}</h2>;
                if (line.startsWith('- ')) return <li key={i} className="text-navy-600 dark:text-navy-300 ml-4">{line.slice(2)}</li>;
                if (line.trim() === '') return <br key={i} />;
                return <p key={i} className="text-navy-600 dark:text-navy-300 leading-relaxed mb-4">{line}</p>;
              })}
            </div>
          </motion.div>
        </div>
      </article>
    </div>
  );
}
