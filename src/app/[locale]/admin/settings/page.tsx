'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useAppStore();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/data?type=settings')
      .then(r => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSettings(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getSetting = (key: string, fallback: string) => {
    return settings.find((s: any) => s.key === key)?.value || fallback;
  };

  const getSettingId = (key: string) => {
    return settings.find((s: any) => s.key === key)?.id;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const updates = [
        { key: 'siteName', value: formData.get('siteName') as string },
        { key: 'tagline', value: formData.get('tagline') as string },
        { key: 'email', value: formData.get('email') as string },
      ];

      for (const item of updates) {
        const id = getSettingId(item.key);
        if (id) {
          await fetch('/api/admin/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'settings', action: 'update', data: { id, ...item } }),
          });
        } else {
          await fetch('/api/admin/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'settings', action: 'create', data: item }),
          });
        }
      }

      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-navy-400" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">{t('admin.settings')}</h1>
        <p className="text-navy-500 dark:text-navy-400 mt-1">Configure your application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <Input name="siteName" label="Site Name" defaultValue={getSetting('siteName', 'Pathgrid Agency')} />
            <Input name="tagline" label="Tagline" defaultValue={getSetting('tagline', 'Where Strategy Meets Creativity')} />
            <Input name="email" label="Contact Email" defaultValue={getSetting('email', 'hello@pathgrid.agency')} />
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">Theme</label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${theme === 'light' ? 'bg-navy-700 text-white border-navy-700 dark:bg-gold-500 dark:text-navy-900 dark:border-gold-500' : 'border-navy-200 dark:border-navy-600 hover:bg-navy-50 dark:hover:bg-navy-800'}`}>
                  {t('admin.lightMode')}
                </button>
                <button type="button" onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${theme === 'dark' ? 'bg-navy-700 text-white border-navy-700 dark:bg-gold-500 dark:text-navy-900 dark:border-gold-500' : 'border-navy-200 dark:border-navy-600 hover:bg-navy-50 dark:hover:bg-navy-800'}`}>
                  {t('admin.darkMode')}
                </button>
              </div>
            </div>
            <Button type="submit" loading={saving}>{t('common.save')}</Button>
          </form>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const currentPassword = formData.get('currentPassword') as string;
            const newPassword = formData.get('newPassword') as string;
            const confirmPassword = formData.get('confirmPassword') as string;

            if (!currentPassword || !newPassword || !confirmPassword) {
              toast.error('All fields are required');
              return;
            }
            if (newPassword.length < 6) {
              toast.error('New password must be at least 6 characters');
              return;
            }
            if (newPassword !== confirmPassword) {
              toast.error('New passwords do not match');
              return;
            }

            setChangingPassword(true);
            try {
              const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
              });
              const json = await res.json();
              if (res.ok) {
                toast.success('Password changed successfully');
                form.reset();
              } else {
                toast.error(json.error || 'Failed to change password');
              }
            } catch {
              toast.error('Failed to change password');
            } finally {
              setChangingPassword(false);
            }
          }} className="space-y-4">
            <Input name="currentPassword" label="Current Password" type="password" required />
            <Input name="newPassword" label="New Password" type="password" required />
            <Input name="confirmPassword" label="Confirm Password" type="password" required />
            <Button type="submit" loading={changingPassword}>{t('common.save')}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
