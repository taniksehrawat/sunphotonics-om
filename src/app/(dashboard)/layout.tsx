import { requireAuth, getProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayoutClient from '@/components/layout/DashboardLayout';
import { Toaster } from 'sonner';

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
        {children}
      </DashboardLayoutClient>
      <Toaster position="top-right" richColors />
    </>
  );
}