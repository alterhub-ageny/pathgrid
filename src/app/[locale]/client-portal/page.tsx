'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FolderKanban, FileText, MessageSquare, Download } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';

const portalSections = [
  { label: 'client.projects', href: '/client-portal/projects', icon: FolderKanban, desc: 'View your active projects and track progress' },
  { label: 'client.invoices', href: '/client-portal/invoices', icon: FileText, desc: 'View and download your invoices' },
  { label: 'client.messages', href: '/client-portal/messages', icon: MessageSquare, desc: 'Communicate with the agency team' },
  { label: 'client.assets', href: '/client-portal/assets', icon: Download, desc: 'Download project assets and reports' },
];

export default function ClientPortalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, locale } = useTranslation();

  useEffect(() => {
    if (status === 'unauthenticated') router.push(`/${locale}/auth/login`);
  }, [status, router, locale]);

  if (status !== 'authenticated') return null;

  return (
    <div className="pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-2">{t('client.portal')}</h1>
          <p className="text-navy-500 dark:text-navy-300 mb-10">Welcome back, {session.user?.name}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portalSections.map((section, i) => (
            <Link key={i} href={`/${locale}${section.href}`}>
              <Card delay={i * 0.1} className="group">
                <section.icon className="w-8 h-8 text-gold-500 mb-4" />
                <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-gold-600 transition-colors">{t(section.label)}</h3>
                <p className="text-navy-500 dark:text-navy-400 text-sm">{section.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
