'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminRootPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const locale = pathname?.match(/^\/(en|fr|ar)/)?.[1] || 'en';
    router.replace(`/${locale}/admin/dashboard`);
  }, [router, pathname]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-navy-300 border-t-navy-700 rounded-full animate-spin" />
    </div>
  );
}
