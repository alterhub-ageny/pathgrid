'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useSinglePost } from '@/hooks/use-data';

export default function BlogPostPage() {
  const { locale, slug } = useParams();
  const { t, isRtl } = useTranslation();
  const { post, loading } = useSinglePost(slug as string);

  if (loading) {
    return <div className="pt-24 lg:pt-28"><div className="max-w-3xl mx-auto px-4 py-20 text-center text-navy-400">{t('common.loading')}</div></div>;
  }

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
            <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 text-sm text-navy-500 dark:text-navy-300 hover:text-navy-700 dark:hover:text-white mb-8 transition-colors">
              <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              {t('blog.backToBlog')}
            </Link>

            <div className="flex items-center gap-4 text-sm text-navy-400 mb-4">
              {post.category && <span className="px-3 py-1 rounded-full bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300">{post.category}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.createdAt).toLocaleDateString()}</span>
              {post.author && <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>}
            </div>

            {post.image && (
              <div className="mb-8 rounded-2xl overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-64 object-cover" />
              </div>
            )}

            <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-8">{post.title}</h1>

            <div className="prose prose-lg dark:prose-invert max-w-none text-navy-600 dark:text-navy-300 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </motion.div>
        </div>
      </article>
    </div>
  );
}
