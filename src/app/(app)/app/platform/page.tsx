import { redirect } from 'next/navigation';
import { AdminMetricsPanel } from '@/components/admin/admin-metrics-panel';
import { AdminOrganizationsPanel } from '@/components/admin/admin-organizations-panel';
import { AdminUsersPanel } from '@/components/admin/admin-users-panel';
import { AdminSupportPanel } from '@/components/admin/admin-support-panel';
import { Card } from '@/components/ui/card';
import { getAdminAccess, getAdminMetrics, getAdminOrganizations, getAdminSupportTickets, getAdminUsers } from '@/lib/queries/admin';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function PlatformPage() {
  const access = await safeServerCall('getAdminAccess', () => getAdminAccess(), { canAccess: false, userId: null });
  if (!access?.canAccess) {
    redirect('/app/dashboard');
  }

  const [metrics, organizations, users, tickets] = await Promise.all([
    safeServerCall('getAdminMetrics', () => getAdminMetrics(), { organizations: 0, users: 0, activeSubscriptions: 0, openSupportTickets: 0 }),
    safeServerCall('getAdminOrganizations', () => getAdminOrganizations(), []),
    safeServerCall('getAdminUsers', () => getAdminUsers(), []),
    safeServerCall('getAdminSupportTickets', () => getAdminSupportTickets(), []),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Platform command center</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Operación SaaS, soporte y cuentas</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">Vista ejecutiva para administración global de organizaciones, suscripciones y casos internos de plataforma desde una sola pantalla.</p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Platform readiness</p>
            <p className="mt-1 text-3xl font-bold">{Math.max(0, 100 - metrics.openSupportTickets * 3)}%</p>
            <p className="mt-2 text-sm text-slate-300">{metrics.activeSubscriptions} suscripciones bajo observación</p>
          </div>
        </div>
      </Card>
      <AdminMetricsPanel metrics={metrics} />
      <AdminOrganizationsPanel items={organizations} />
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminUsersPanel items={users} />
        <AdminSupportPanel items={tickets} />
      </div>
    </div>
  );
}
