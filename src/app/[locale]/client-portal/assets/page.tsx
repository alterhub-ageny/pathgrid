'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Card } from '@/components/ui/card';
import { Download, File, Image, FileText } from 'lucide-react';

const assets = [
  { name: 'Brand Guidelines.pdf', type: 'pdf', size: '2.4 MB', date: '2026-04-28' },
  { name: 'Logo Package.zip', type: 'zip', size: '8.1 MB', date: '2026-04-25' },
  { name: 'Website Mockups.fig', type: 'figma', size: '15 MB', date: '2026-04-20' },
  { name: 'Social Media Kit.png', type: 'image', size: '3.2 MB', date: '2026-04-18' },
  { name: 'Monthly Report Q2.pdf', type: 'pdf', size: '1.8 MB', date: '2026-04-15' },
];

const typeIcons: Record<string, any> = { pdf: FileText, zip: File, image: Image, figma: File };

export default function ClientAssetsPage() {
  const { t } = useTranslation();

  return (
    <div className="pt-24 lg:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif font-bold mb-10">{t('client.assets')}</h1>
        <div className="space-y-3">
          {assets.map((asset, i) => {
            const Icon = typeIcons[asset.type] || File;
            return (
              <Card key={i} hover={false} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-navy-600 dark:text-gold-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{asset.name}</p>
                    <p className="text-xs text-navy-400">{asset.size} · {asset.date}</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm border border-navy-200 dark:border-navy-600 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors">
                  <Download className="w-4 h-4" /> Download
                </button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
