
import { ReactNode } from 'react';
import { isAppInstalled, getGeneralSettingsAdmin, verifyLicensePeriodically } from '@/lib/data.actions';
import { redirect } from 'next/navigation';
import { AdminLayoutShell } from '@/components/admin/admin-layout-shell';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  // 1. Server-side check for installation
  const installed = await isAppInstalled();
  if (!installed) {
    redirect('/install');
  }

  // 2. Periodic License Check
  const headersList = await headers();
  const domain = headersList.get('host') || 'localhost';
  const isLicenseValid = await verifyLicensePeriodically(domain);
  if (!isLicenseValid) {
    redirect('/activate');
  }

  const settings = await getGeneralSettingsAdmin();

  // 2. Render with Firebase Provider for Auth compatibility
  return (
    <FirebaseClientProvider lang="en" settings={settings}>
        <AdminLayoutShell initialSettings={settings}>{children}</AdminLayoutShell>
        <Toaster />
    </FirebaseClientProvider>
  );
}

