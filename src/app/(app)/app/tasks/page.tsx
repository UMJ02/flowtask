import Link from 'next/link';
import { ClipboardList, FolderKanban, Plus } from 'lucide-react';
import { TaskFilters } from '@/components/tasks/task-filters';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { FilterPresets } from '@/components/ui/filter-presets';
import { ExpandableBar } from '@/components/ui/expandable-bar';
import { projectNewRoute, taskNewRoute } from '@/lib/navigation/routes';
import { getTasks } from '@/lib/queries/tasks';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { normalizeTaskFilters, toQueryString, type SearchParamsRecord } from '@/lib/runtime/search-params';

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsRecord>;
}) {
  const filters = normalizeTaskFilters((await searchParams) ?? {});
  const currentQuery = toQueryString(filters);
  const tasks = await safeServerCall('getTasks', () => getTasks(filters), null as Awaited<ReturnType<typeof getTasks>> | null);

  if (tasks === null) {
    return (
      <ErrorState
        title="No pudimos abrir tareas"
        description="La vista no pudo cargar la lista en este intento. Vuelve a probar o entra al dashboard para seguir trabajando."
        action={
          <Link href="/app/dashboard">
            <Button>Ir al dashboard</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Seguimiento simple"
        title="Tareas"
        description="Busca, filtra y actualiza pendientes sin perder tiempo. Puedes usar vista lista o tablero con una interfaz más limpia y legible."
        icon={<ClipboardList className="h-5 w-5" />}
        actions={
          <Link href={taskNewRoute()}>
            <Button>Nueva tarea</Button>
          </Link>
        }
      />

      <Card className="rounded-[28px] border border-slate-200/90 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:hidden">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Seguimiento simple</p>
            <h2 className="mt-1 text-[1.15rem] font-bold tracking-tight text-slate-900">Inicia rápido</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">Accesos directos para entrar a tareas o proyectos sin ruido extra.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link href={taskNewRoute()} className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-[0_10px_20px_rgba(16,185,129,0.08)]">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-emerald-500 text-white shadow-sm"><Plus className="h-5 w-5" /></span>
            <p className="mt-3 text-base font-semibold text-slate-900">Tareas +</p>
          </Link>
          <Link href={projectNewRoute()} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-slate-100 text-slate-800 shadow-sm"><FolderKanban className="h-5 w-5" /></span>
            <p className="mt-3 text-base font-semibold text-slate-900">Proyectos +</p>
          </Link>
        </div>
      </Card>

      <div className="hidden md:block">
        <ExpandableBar
          title="Busca tus tareas"
          description="Abre esta barra para encontrar tareas por estado, área o fecha."
        >
          <TaskFilters filters={filters} />
        </ExpandableBar>
      </div>

      <div className="hidden md:block">
        <FilterPresets
          storageKey="flowtask:filters:tasks"
          basePath="/app/tasks"
          currentQuery={currentQuery}
          title="Vistas rápidas de tareas"
          emptyLabel="Guarda combinaciones de tablero, estado y fechas para volver sin reconstruir filtros."
        />
      </div>
      {tasks.length ? (
        <TaskWorkspace tasks={tasks} filters={filters} />
      ) : (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title="No hay tareas con estos filtros"
          description="Ajusta la búsqueda, cambia los filtros o crea una tarea nueva para empezar a trabajar desde esta vista."
          action={
            <Link href={taskNewRoute()}>
              <Button>Crear tarea</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
