'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Download, File, Image, FileText, Loader2, Package } from 'lucide-react';

const typeIcons: Record<string, any> = { pdf: FileText, zip: Package, image: Image, figma: File, doc: FileText, file: File };

export default function ClientAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/client/data?type=assets')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAssets(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-navy-900 dark:text-white mb-10">Assets & Downloads</h1>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-navy-400" /></div>
      ) : assets.length === 0 ? (
        <Card hover={false} className="flex flex-col items-center justify-center py-16">
          <Package className="w-16 h-16 text-navy-300 dark:text-navy-600 mb-4" />
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-2">No assets available</h3>
          <p className="text-sm text-navy-400">Project assets will appear here once shared</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {assets.map((asset, i) => {
            const Icon = typeIcons[asset.type] || File;
            return (
              <Card key={asset.id} hover={false} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-navy-600 dark:text-gold-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-900 dark:text-white">{asset.name}</p>
                    <p className="text-xs text-navy-400">
                      {asset.size ? `${(asset.size / 1024 / 1024).toFixed(1)} MB · ` : ''}
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href={asset.url}
                  download={asset.name}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-navy-200 dark:border-navy-600 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-800 transition-colors text-navy-700 dark:text-navy-300"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
