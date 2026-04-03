export const dynamic = 'force-dynamic';

import { ShieldCheck, Activity } from 'lucide-react';
import { redirect } from 'next/navigation';
import { AdminActivationCodesPanel } from '@/components/admin/admin-activation-codes-panel';
import { AdminErrorsPanel } from '@/components/admin/admin-errors-panel';
import { AdminMetricsPanel } from '@/components/admin/admin-metrics-panel';
import { AdminOrganizationsPanel } from '@/components/admin/admin-organizations-panel';
import { AdminPlatformPulseCard } from '@/components/admin/admin-platform-pulse';
import { AdminSupportPanel } from '@/components/admin/admin-support-panel';
import { AdminUsagePanel } from '@/components/admin/admin-usage-panel';
import { AdminUsersPanel } from '@/components/admin/admin-users-panel';
import { PageIntro } from '@/components/ui/page-intro';
import {
  getAdminAccess,
  getAdminActivationCodes,
  getAdminErrorLogs,
  getAdminMetrics,
  getAdminOrganizations,
  getAdminPlatformPulse,
  getAdminSupportTickets,
  getAdminUsageInsights,
  getAdminUsers,
} from '@/lib/queries/admin';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function PlatformPage() {
  const access = await safeServerCall('getAdminAccess', () => getAdminAccess(), { canAccess: false, userId: null });
  if (!access?.canAccess) {
    redirect('/app/dashboard');
  }

  const [metrics, organizations, users, tickets, errors, usageInsights, activationCodes] = await Promise.all([
    safeServerCall('getAdminMetrics', () => getAdminMetrics(), {
      organizations: 0,
      users: 0,
      activeSubscriptions: 0,
      openSupportTickets: 0,
      usageEvents7d: 0,
      criticalErrors7d: 0,
    }),
    safeServerCall('getAdminOrganizations', () => getAdminOrganizations(), []),
    safeServerCall('getAdminUsers', () => getAdminUsers(), []),
    safeServerCall('getAdminSupportTickets', () => getAdminSupportTickets(), []),
    safeServerCall('getAdminErrorLogs', () => getAdminErrorLogs(), []),
    safeServerCall('getAdminUsageInsights', () => getAdminUsageInsights(), { topEvents: [], recentEvents: [] }),
    safeServerCall('getAdminActivationCodes', () => getAdminActivationCodes(), []),
  ]);

  const pulse = getAdminPlatformPulse(metrics);

  return (
    <div className="space-y-4">
      <PageIntro
        eyebrow="Platform control"
        title="Centro de control SaaS"
        description="Operación global para cuentas, observabilidad, soporte y adopción de la plataforma. Esta vista es exclusiva para platform admins y no modifica el dashboard operativo del usuario final."
        actions={
          <>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Admin only
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              <Activity className="h-4 w-4 text-slate-500" />
              V57 · Platform control
            </div>
          </>
        }
        aside={
          <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-900">
            Aquí monitoreas la salud operativa del SaaS, errores recientes, uso real y la cola interna de soporte desde una sola vista.
          </div>
        }
      />

      <AdminPlatformPulseCard pulse={pulse} metrics={metrics} />
      <AdminMetricsPanel metrics={metrics} />
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminUsagePanel insights={usageInsights} />
        <AdminErrorsPanel items={errors} />
      </div>
      <AdminActivationCodesPanel items={activationCodes} />
      <AdminOrganizationsPanel items={organizations} />
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminUsersPanel items={users} />
        <AdminSupportPanel items={tickets} />
      </div>
    </div>
  );
}
