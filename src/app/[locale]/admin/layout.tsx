'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const localePath = useMemo(() => {
    const match = pathname?.match(/^\/(en|fr|ar)/);
    return match?.[1] || 'en';
  }, [pathname]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy-300 border-t-navy-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const role = (session.user as any)?.role;
  if (role === 'client') {
    router.push(`/${localePath}/client-portal`);
    return null;
  }

  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>  
  );
}
