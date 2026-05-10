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

const SETTING_KEYS = [
  'siteName', 'tagline', 'email', 'phone', 'address', 'whatsapp',
  'twitter', 'linkedin', 'dribbble',
];

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme, fetchSettings } = useAppStore();
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
      for (const key of SETTING_KEYS) {
        const value = formData.get(key) as string;
        const id = getSettingId(key);
        if (id) {
          await fetch('/api/admin/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'settings', action: 'update', data: { id, key, value } }),
          });
        } else {
          await fetch('/api/admin/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'settings', action: 'create', data: { key, value } }),
          });
        }
      }

      toast.success('Settings saved');
      fetchSettings();
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-navy-400 dark:text-navy-200" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-navy-900 dark:text-white">{t('admin.settings')}</h1>
        <p className="text-navy-500 dark:text-navy-300 mt-1">Configure your application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-navy-900 dark:text-white">Site Information</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <Input name="siteName" label="Site Name" defaultValue={getSetting('siteName', 'Pathgrid Agency')} />
            <Input name="tagline" label="Tagline" defaultValue={getSetting('tagline', 'Where Strategy Meets Creativity')} />
            <Input name="email" label="Contact Email" defaultValue={getSetting('email', 'hello@pathgrid.agency')} type="email" />
            <Input name="phone" label="Phone" defaultValue={getSetting('phone', '+1 (555) 123-4567')} />
            <Input name="address" label="Address" defaultValue={getSetting('address', 'San Francisco, CA')} />
            <Input name="whatsapp" label="WhatsApp Number" defaultValue={getSetting('whatsapp', '')} placeholder="+212600000000" />
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

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4 text-navy-900 dark:text-white">Social Links</h3>
            <form onSubmit={handleSave} className="space-y-4" id="social-form">
              <Input name="twitter" label="Twitter URL" defaultValue={getSetting('twitter', '')} placeholder="https://twitter.com/yourhandle" />
              <Input name="linkedin" label="LinkedIn URL" defaultValue={getSetting('linkedin', '')} placeholder="https://linkedin.com/company/yourpage" />
              <Input name="dribbble" label="Dribbble URL" defaultValue={getSetting('dribbble', '')} placeholder="https://dribbble.com/yourhandle" />
            </form>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4 text-navy-900 dark:text-white">Change Password</h3>
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
    </div>
  );
}
