'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function AdminSecurityPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const twoFactorEnabled = (session?.user as any)?.twoFactorEnabled || false;

  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [setupStep, setSetupStep] = useState<'idle' | 'generated' | 'enabled'>('idle');

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/totp');
      const json = await res.json();
      if (json.qrCode && json.secret) {
        setQrCode(json.qrCode);
        setSecret(json.secret);
        setSetupStep('generated');
      } else {
        toast.error('Failed to generate TOTP secret');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (!code || code.length < 6) {
      toast.error('Enter a valid 6-digit code');
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch('/api/auth/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enable', code }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Two-factor authentication enabled');
        setSetupStep('enabled');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(json.error || 'Invalid code');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('Disable two-factor authentication? This reduces account security.')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable' }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Two-factor authentication disabled');
        setSetupStep('idle');
        setSecret('');
        setQrCode('');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(json.error || 'Failed to disable');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-navy-900 dark:text-white">{t('admin.security')}</h1>
        <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">{t('admin.fields.manageSecurity')}</p>
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-100 dark:border-navy-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center">
            <Shield className="w-5 h-5 text-navy-700 dark:text-gold-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-navy-900 dark:text-white">{t('auth.twoFactorTitle')}</h2>
            <p className="text-sm text-navy-500 dark:text-navy-400">Add an extra layer of security to your account</p>
          </div>
        </div>

        {twoFactorEnabled && setupStep !== 'enabled' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm">
              <CheckCircle className="w-4 h-4" />
              Two-factor authentication is currently enabled
            </div>
            <Button onClick={handleDisable} loading={loading} variant="danger" className="w-full sm:w-auto">
              Disable 2FA
            </Button>
          </div>
        ) : setupStep === 'generated' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm">
              <Smartphone className="w-4 h-4" />
              Scan the QR code with your authenticator app, then enter the 6-digit code below
            </div>

            {qrCode && (
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code" className="w-48 h-48 border-2 border-navy-200 dark:border-navy-600 rounded-xl" />
              </div>
            )}

            {secret && (
              <div className="text-center">
                <p className="text-xs text-navy-400 mb-1">Or enter this key manually:</p>
                <code className="px-3 py-1.5 rounded-lg bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-200 text-sm font-mono select-all">{secret}</code>
              </div>
            )}

            <div className="max-w-xs mx-auto space-y-3">
              <Input
                id="code"
                label="Verification Code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <Button onClick={handleEnable} loading={verifying} className="w-full">
                Verify & Enable
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-navy-500 dark:text-navy-400">
              When enabled, you'll need to enter a verification code from your authenticator app in addition to your password when logging in.
            </p>
            <Button onClick={handleSetup} loading={loading} className="w-full sm:w-auto">
              <Key className="w-4 h-4 mr-2" />
              Set up Two-Factor Authentication
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
