import Link from 'next/link';
import { CalendarDays, Flag, FolderKanban, LayoutPanelTop, Plus, Sparkles, UserRoundPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { asRoute, projectNewRoute, taskNewRoute, type AppRoute } from '@/lib/navigation/routes';

const ACTIONS: Array<{ href: AppRoute; title: string; description: string; helper: string; icon: typeof Plus }> = [
  {
    href: taskNewRoute(),
    title: 'Tarea',
    description: 'Crea una tarea nueva y súbela al flujo activo.',
    helper: 'Alta rápida',
    icon: Plus,
  },
  {
    href: projectNewRoute(),
    title: 'Proyecto',
    description: 'Abre un frente nuevo con fechas, cliente y contexto.',
    helper: 'Inicio guiado',
    icon: FolderKanban,
  },
  {
    href: asRoute('/app/dashboard?view=board'),
    title: 'Pizarra',
    description: 'Abre el tablero interactivo para mover trabajo y foco.',
    helper: 'Vista operativa',
    icon: LayoutPanelTop,
  },
  {
    href: asRoute('/app/planning'),
    title: 'Planificación',
    description: 'Revisa prioridades, capacidad y próximos vencimientos.',
    helper: 'Semana actual',
    icon: CalendarDays,
  },
  {
    href: asRoute('/app/tasks?view=list'),
    title: 'Asignar',
    description: 'Entra directo a repartir pendientes y responsables.',
    helper: 'Gestión rápida',
    icon: UserRoundPlus,
  },
  {
    href: asRoute('/app/tasks?status=alta'),
    title: 'Prioridad',
    description: 'Filtra primero lo más urgente y decide sin rodeos.',
    helper: 'Alta urgencia',
    icon: Flag,
  },
];

export function WorkspaceQuickActions() {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Accesos directos</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">Acciona sin rodeos</h3>
          <p className="mt-1 max-w-md text-sm leading-5 text-slate-500">Atajos listos para crear, ordenar y revisar sin salir del flujo.</p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Sparkles className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href} className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-emerald-700 ring-1 ring-slate-200">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                    <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                      {action.helper}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
