import { Card } from "@/components/ui/card";
import { AdminMetricsPanel } from "@/components/admin/admin-metrics-panel";
import { AdminOrganizationsPanel } from "@/components/admin/admin-organizations-panel";
import { AdminSupportPanel } from "@/components/admin/admin-support-panel";
import { AdminUsersPanel } from "@/components/admin/admin-users-panel";
import { getAdminAccess, getAdminMetrics, getAdminOrganizations, getAdminSupportTickets, getAdminUsers } from "@/lib/queries/admin";

export default async function AdminPage() {
  const access = await getAdminAccess();

  if (!access.canAccess) {
    return (
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Admin SaaS</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Acceso restringido</h1>
        <p className="mt-2 text-sm text-slate-600">
          Esta vista requiere estar en <span className="font-semibold">platform_admins</span> o tener rol <span className="font-semibold">admin_global</span>.
          Corre primero la migration <span className="font-semibold">0017_super_admin_platform.sql</span> para habilitar la base técnica.
        </p>
      </Card>
    );
  }

  const [metrics, organizations, users, supportTickets] = await Promise.all([
    getAdminMetrics(),
    getAdminOrganizations(),
    getAdminUsers(),
    getAdminSupportTickets(),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Super admin</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Control global de plataforma</h1>
        <p className="mt-2 text-sm text-slate-600">
          Vista consolidada de organizaciones, usuarios, soporte interno y métricas globales para operar FlowTask como SaaS.
        </p>
      </Card>

      <AdminMetricsPanel metrics={metrics} />
      <AdminOrganizationsPanel items={organizations} />
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <AdminUsersPanel items={users} />
        <AdminSupportPanel items={supportTickets} />
      </div>
    </div>
  );
}
