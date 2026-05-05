import { requireAuth, getProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayoutClient from '@/components/layout/DashboardLayout';
import { Toaster } from 'sonner';
import { Suspense } from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const profile = await getProfile();

  if (!profile) {
    redirect('/login');
  }

  return (
    <>
      <DashboardLayoutClient user={user} profile={profile}>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          </div>
        }>
          {children}
        </Suspense>
      </DashboardLayoutClient>
      <Toaster position="top-right" richColors />
    </>
  );
}