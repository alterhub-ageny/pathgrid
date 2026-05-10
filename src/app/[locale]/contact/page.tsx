'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ContactPage() {
  const { t, locale } = useTranslation();
  const siteSettings = useAppStore((s) => s.siteSettings);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const setChatOpen = useAppStore((s) => s.setChatOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubmitted(true);
        form.reset();
        if (json.conversationId) {
          localStorage.setItem('pathgrid_chat_handoff', JSON.stringify({
            name: data.name,
            email: data.email,
            conversationId: json.conversationId,
          }));
        }
      } else {
        toast.error(json.message || 'Failed to send message');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openChat = () => setChatOpen(true);

  return (
    <div className="pt-24 lg:pt-28">
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mb-16"
          >
            <h1 className="text-5xl lg:text-7xl font-serif font-bold mb-6">{t('contact.title')}</h1>
            <p className="text-xl text-navy-500 dark:text-navy-300">{t('contact.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {submitted ? (
                <div className="p-8 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 space-y-6">
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">{t('contact.successMessage')}</h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">We'll review your message and get back to you. In the meantime, you can reach us directly:</p>
                  <div className="space-y-3">
                    <a href={`mailto:${siteSettings.email || 'hello@pathgrid.agency'}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-navy-800 border border-green-200 dark:border-green-700 hover:border-green-400 transition-all group">
                      <Mail className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-navy-900 dark:text-white group-hover:text-green-600 transition-colors">Email us directly</span>
                      <ExternalLink className="w-3.5 h-3.5 text-green-500 ml-auto" />
                    </a>
                    {siteSettings.whatsapp && (
                      <a href={`https://wa.me/${siteSettings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-navy-800 border border-green-200 dark:border-green-700 hover:border-green-400 transition-all group">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-navy-900 dark:text-white group-hover:text-green-600 transition-colors">Chat on WhatsApp</span>
                        <ExternalLink className="w-3.5 h-3.5 text-green-500 ml-auto" />
                      </a>
                    )}
                    <button onClick={openChat}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white font-medium hover:from-gold-600 hover:to-gold-700 transition-all">
                      <MessageCircle className="w-5 h-5" />
                      Open live chat
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input id="name" name="name" label={t('contact.formName')} required />
                    <Input id="email" name="email" label={t('contact.formEmail')} type="email" required />
                  </div>
                  <Input id="company" name="company" label={t('contact.formCompany')} />
                  <Input id="subject" name="subject" label={t('contact.formSubject')} required />
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-navy-700 dark:text-white mb-1.5">
                      {t('contact.formMessage')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-lg border border-navy-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-500 resize-none"
                      required
                    />
                  </div>
                  <Button type="submit" loading={loading} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    {t('contact.formSubmit')}
                  </Button>
                </form>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-navy-700 dark:text-gold-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('contact.email')}</h3>
                  <p className="text-navy-500 dark:text-navy-300">{siteSettings.email || 'hello@pathgrid.agency'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-navy-700 dark:text-gold-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('contact.phone')}</h3>
                  <p className="text-navy-500 dark:text-navy-300">{siteSettings.phone || '+1 (555) 123-4567'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-navy-700 dark:text-gold-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('contact.address')}</h3>
                  <p className="text-navy-500 dark:text-navy-300">{siteSettings.address || 'San Francisco, CA'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
