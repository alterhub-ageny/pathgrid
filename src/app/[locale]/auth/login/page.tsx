'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials');
      setLoading(false);
      return;
    }

    // Full page reload ensures fresh session cookie
    window.location.href = `/${locale}/`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold mb-2">{t('auth.login')}</h1>
            <p className="text-navy-500 dark:text-navy-400 text-sm">{t('common.tagline')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="email" name="email" label={t('auth.email')} type="email" required />
            <Input id="password" name="password" label={t('auth.password')} type="password" required />
            <div className="text-right">
              <Link href={`/${locale}/auth/reset-password`} className="text-sm text-gold-600 dark:text-gold-500 hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <Button type="submit" loading={loading} className="w-full">
              {t('auth.login')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-400">
            {t('auth.noAccount')}{' '}
            <Link href={`/${locale}/auth/register`} className="text-gold-600 dark:text-gold-500 hover:underline font-medium">
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
