'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const { t, locale, isRtl } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const email = new FormData(form).get('email') as string;

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 pb-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold mb-2">{t('auth.resetPassword')}</h1>
            <p className="text-navy-500 dark:text-navy-400 text-sm mb-6">{t('auth.resetSent')}</p>
            <Link href={`/${locale}/auth/login`} className="inline-flex items-center gap-2 text-sm text-gold-600 dark:text-gold-500 hover:underline font-medium">
              <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              {t('auth.login')}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-20 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 p-8">
          <div className="text-center mb-8">
            <Mail className="w-12 h-12 text-navy-400 mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-bold mb-2">{t('auth.resetPassword')}</h1>
            <p className="text-navy-500 dark:text-navy-400 text-sm">{t('auth.resetInstructions')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="email" name="email" label={t('auth.email')} type="email" required />
            <Button type="submit" loading={loading} className="w-full">{t('auth.sendResetLink')}</Button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-400">
            <Link href={`/${locale}/auth/login`} className="text-gold-600 dark:text-gold-500 hover:underline font-medium">
              {t('auth.backToLogin')}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
