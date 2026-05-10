'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ResetPasswordConfirmPage() {
  const { locale } = useParams();
  const router = useRouter();
  const { t, isRtl } = useTranslation();
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));

    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: data.password }),
      });
      const json = await res.json();
      if (res.ok) {
        setDone(true);
      } else {
        setError(json.message || 'Failed');
        toast.error(json.message || 'Failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 pb-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold mb-2">{t('auth.passwordResetSuccess')}</h1>
            <p className="text-navy-500 dark:text-navy-400 text-sm mb-6">{t('auth.passwordResetSuccessMessage')}</p>
            <Link href={`/${locale}/auth/login`} className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-700 dark:bg-gold-500 text-white dark:text-navy-900 rounded-xl text-sm font-medium">
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
            <Lock className="w-12 h-12 text-navy-400 mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-bold mb-2">{t('auth.setNewPassword')}</h1>
            <p className="text-navy-500 dark:text-navy-400 text-sm">{t('auth.enterNewPassword')}</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="password" name="password" label={t('auth.password')} type="password" required />
            <Input id="confirmPassword" name="confirmPassword" label={t('auth.confirmPassword')} type="password" required />
            <Button type="submit" loading={loading} className="w-full">{t('auth.resetPassword')}</Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
