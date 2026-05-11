import Link from 'next/link';
import { AlertTriangle, CalendarDays, FolderKanban, Plus, Sparkles, UserRoundPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { asRoute, projectNewRoute, taskNewRoute, type AppRoute } from '@/lib/navigation/routes';

const ACTIONS: Array<{ href: AppRoute; title: string; description: string; helper: string; icon: typeof Plus; accent: string }> = [
  {
    href: taskNewRoute(),
    title: 'Tarea',
    description: 'Crea una tarea nueva y súbela al flujo activo.',
    helper: 'Alta rápida',
    icon: Plus,
    accent: 'from-emerald-50 to-white',
  },
  {
    href: projectNewRoute(),
    title: 'Proyecto',
    description: 'Abre un frente nuevo con fechas, cliente y contexto.',
    helper: 'Inicio guiado',
    icon: FolderKanban,
    accent: 'from-sky-50 to-white',
  },
  {
    href: asRoute('/app/tasks?view=list'),
    title: 'Lista de tareas',
    description: 'Entra directo al listado para ordenar, filtrar y revisar detalle.',
    helper: 'Vista rápida',
    icon: UserRoundPlus,
    accent: 'from-rose-50 to-white',
  },
  {
    href: asRoute('/app/planning'),
    title: 'Planificación',
    description: 'Revisa prioridades, capacidad y próximos vencimientos.',
    helper: 'Semana actual',
    icon: CalendarDays,
    accent: 'from-amber-50 to-white',
  },
  {
    href: asRoute('/app/tasks?priority=alta'),
    title: 'Prioridad alta',
    description: 'Filtra primero lo crítico para decidir sin rodeos.',
    helper: 'Foco inmediato',
    icon: AlertTriangle,
    accent: 'from-teal-50 to-white',
  },
];

export function WorkspaceQuickActions() {
  return (
    <Card className="rounded-[24px] border border-slate-200/90 p-5 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Accesos directos</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">Inicia rápido</h3>
          <p className="mt-1 max-w-md text-sm leading-5 text-slate-500">Entradas claras para crear, ordenar y revisar lo importante sin perder el hilo.</p>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <Sparkles className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className={`group rounded-[20px] border border-slate-200 bg-gradient-to-br ${action.accent} px-4 py-4 transition duration-200 hover:translate-y-0 hover:border-emerald-200 hover:`}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white text-emerald-700 ring-1 ring-slate-200 shadow-none transition group-hover:ring-emerald-200">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-slate-900">{action.title}</p>
                    <span className="inline-flex rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
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
