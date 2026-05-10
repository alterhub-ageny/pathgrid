'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TotpPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uid) router.replace(`/${locale}/auth/login`);
  }, [uid, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    setLoading(true);
    setError('');

    const result = await signIn('totp', {
      uid,
      code,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid verification code');
      setLoading(false);
      return;
    }

    // Fetch session to determine redirect
    try {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const role = session?.user?.role;
      window.location.href = role === 'client' ? `/${locale}/client-portal` : `/${locale}/admin/dashboard`;
    } catch {
      window.location.href = `/${locale}/admin/dashboard`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-20 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-xl border border-navy-100 dark:border-navy-700 p-8">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-navy-400 mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-bold mb-2">{t('auth.twoFactorTitle')}</h1>
            <p className="text-navy-500 dark:text-navy-400 text-sm">{t('auth.twoFactorInstructions')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="code"
              name="code"
              label="Authentication Code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
            <Button type="submit" loading={loading} className="w-full">{t('auth.verify')}</Button>
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
