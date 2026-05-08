'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));

    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });

      if (res.ok) {
        toast.success(t('auth.registerSuccess'));
        router.push(`/${locale}/auth/login`);
      } else {
        const err = await res.json();
        toast.error(err.message || 'Registration failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-20 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-bold mb-2">{t('auth.register')}</h1>
            <p className="text-navy-500 dark:text-navy-400 text-sm">{t('common.tagline')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" name="name" label={t('auth.name')} required />
            <Input id="email" name="email" label={t('auth.email')} type="email" required />
            <Input id="password" name="password" label={t('auth.password')} type="password" required />
            <Input id="confirmPassword" name="confirmPassword" label={t('auth.confirmPassword')} type="password" required />
            <Button type="submit" loading={loading} className="w-full">{t('auth.register')}</Button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-400">
            {t('auth.hasAccount')}{' '}
            <Link href={`/${locale}/auth/login`} className="text-gold-600 dark:text-gold-500 hover:underline font-medium">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
