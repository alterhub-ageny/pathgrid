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
      return;
    }
    if (status === 'authenticated' && session) {
      const role = (session.user as any)?.role;
      if (role === 'client') {
        window.location.href = `/${localePath}/client-portal`;
      }
    }
  }, [status, session, router, localePath]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy-300 border-t-navy-700 rounded-full animate-spin" />
      </div>
    );
  }

  const role = (session?.user as any)?.role;

  // Client should never see admin layout — redirect before rendering
  if (role === 'client') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-navy-300 border-t-navy-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-900 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 lg:p-8 overflow-auto text-navy-900 dark:text-white">
          {children}
        </main>
      </div>
    </div>  
  );
}
