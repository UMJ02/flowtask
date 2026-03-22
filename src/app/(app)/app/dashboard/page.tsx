import Link from 'next/link';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { BoardOverview } from '@/components/dashboard/board-overview';
import { DeadlineLanes } from '@/components/dashboard/deadline-lanes';
import { ClientPortfolio } from '@/components/dashboard/client-portfolio';
import { DepartmentMetrics } from '@/components/dashboard/department-metrics';
import { FocusPanel } from '@/components/dashboard/focus-panel';
import { OrganizationOverview } from '@/components/dashboard/organization-overview';
import { OrganizationPlanWidget } from '@/components/dashboard/organization-plan-widget';
import { ProjectHealth } from '@/components/dashboard/project-health';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Card } from '@/components/ui/card';
import { getOrganizationBillingSummary } from '@/lib/queries/billing';
import { getClientDashboardItems } from '@/lib/queries/clients';
import { getDashboardData } from '@/lib/queries/dashboard';
import { getOrganizationContext } from '@/lib/queries/organization';

function SectionTitle({ title, description, href, cta }: { title: string; description: string; href?: string; cta?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {href && cta ? (
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export default async function DashboardPage() {
  const [data, organizationContext, clientItems, billingSummary] = await Promise.all([
    getDashboardData(),
    getOrganizationContext(),
    getClientDashboardItems(),
    getOrganizationBillingSummary(),
  ]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-[linear-gradient(135deg,#06291d_0%,#0f172a_58%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.20)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">Inicio</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Lo principal de tu día</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Revisa pendientes, proyectos y clientes sin tener que entrar a cada módulo.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[320px]">
            <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Tareas activas</p>
              <p className="mt-2 text-3xl font-bold">{data?.activeTasks ?? 0}</p>
            </div>
            <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Proyectos activos</p>
              <p className="mt-2 text-3xl font-bold">{data?.activeProjects ?? 0}</p>
            </div>
          </div>
        </div>
      </Card>

      <BoardOverview
        activeProjects={data?.activeProjects ?? 0}
        activeTasks={data?.activeTasks ?? 0}
        completedTasks={data?.completedTasks ?? 0}
      />

      <QuickActions />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <SectionTitle
            title="Prioridades"
            description="Accesos que guardaste para volver más rápido a lo importante."
          />
          <FocusPanel />
        </div>
        <Card className="flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Agenda semanal</h3>
              <p className="mt-1 text-sm text-slate-500">Mira lo que viene hoy y en los próximos días.</p>
            </div>
          </div>
          <DeadlineLanes
            overdueTasks={data?.overdueTasks ?? 0}
            dueSoonTasks={data?.dueSoonTasks ?? 0}
            waitingTasks={data?.waitingTasks ?? 0}
          />
          <div className="flex justify-end">
            <Link
              href="/app/calendar"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Abrir calendario
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <OrganizationOverview
          activeOrganization={organizationContext?.activeOrganization ?? null}
          organizations={organizationContext?.organizations ?? []}
          clientPermissions={organizationContext?.clientPermissions ?? []}
        />
        <OrganizationPlanWidget summary={billingSummary} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <ProjectHealth
          activeProjects={data?.activeProjects ?? 0}
          completedProjects={data?.completedProjects ?? 0}
          collaborativeProjects={data?.collaborativeProjects ?? 0}
        />
        <DepartmentMetrics items={data?.departmentMetrics ?? []} />
      </div>

      <div className="space-y-4">
        <SectionTitle
          title="Clientes"
          description="Revisa rápidamente quién requiere más atención."
          href="/app/clients"
          cta="Ver clientes"
        />
        <ClientPortfolio items={clientItems} />
      </div>

      <div className="space-y-4">
        <SectionTitle
          title="Actividad reciente"
          description="Cambios recientes para mantener seguimiento sin abrir más pantallas."
          href="/app/notifications"
          cta="Ver notificaciones"
        />
        <RecentActivity />
      </div>
    </div>
  );
}
