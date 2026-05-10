'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FolderKanban, FileText, MessageSquare, Download, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ClientPortalPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const locale = pathname?.match(/^\/(en|fr|ar)/)?.[1] || 'en';
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/client/data?type=stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const portalSections = [
    { label: 'My Projects', href: '/client-portal/projects', icon: FolderKanban, desc: 'View active projects and track progress', count: stats?.projectCount },
    { label: 'My Invoices', href: '/client-portal/invoices', icon: FileText, desc: 'View and download invoices', count: stats?.invoiceCount },
    { label: 'Messages', href: '/client-portal/messages', icon: MessageSquare, desc: 'Communicate with the agency team', count: stats?.unreadMessages, badge: true },
    { label: 'Assets & Downloads', href: '/client-portal/assets', icon: Download, desc: 'Download project assets and reports', count: null },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl lg:text-5xl font-serif font-bold text-navy-900 dark:text-white mb-2">
          Client Portal
        </h1>
        <p className="text-navy-500 dark:text-navy-300 mb-10">
          Welcome back, {session?.user?.name}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portalSections.map((section, i) => (
          <Link key={i} href={`/${locale}${section.href}`}>
            <Card delay={i * 0.1} className="group relative">
              <section.icon className="w-8 h-8 text-gold-500 mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-gold-600 transition-colors text-navy-900 dark:text-white">
                {section.label}
              </h3>
              <p className="text-navy-500 dark:text-navy-400 text-sm">{section.desc}</p>
              {section.count !== null && section.count !== undefined && (
                <span className="absolute top-4 right-4 text-xs text-navy-400">
                  {section.badge ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gold-500 text-white text-xs font-bold rounded-full">
                      {section.count > 9 ? '9+' : section.count}
                    </span>
                  ) : (
                    `${section.count} total`
                  )}
                </span>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
