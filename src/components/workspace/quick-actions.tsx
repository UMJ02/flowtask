import Link from 'next/link';
import { AlertCircle, Flag, FolderKanban, Plus, Sparkles, UserRoundPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { projectNewRoute, taskNewRoute } from '@/lib/navigation/routes';

const ACTIONS = [
  {
    href: taskNewRoute(),
    title: 'Tarea',
    description: 'Crea una tarea y súbela al tablero.',
    icon: Plus,
  },
  {
    href: projectNewRoute(),
    title: 'Proyecto',
    description: 'Abre un frente nuevo con fechas y cliente.',
    icon: FolderKanban,
  },
  {
    href: '/app/tasks?view=list',
    title: 'Asignar',
    description: 'Entra rápido a repartir pendientes.',
    icon: UserRoundPlus,
  },
  {
    href: '/app/tasks?status=alta',
    title: 'Prioridad',
    description: 'Mira primero lo más urgente.',
    icon: Flag,
  },
];

export function WorkspaceQuickActions() {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Acciones rápidas</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">Hazlo rápido</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">Cuatro atajos para entrar, ver y actuar.</p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Sparkles className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href} className="rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-white text-emerald-700 ring-1 ring-slate-200">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/app/tasks?status=blocked">
          <Button variant="secondary">
            <AlertCircle className="h-4 w-4" /> Bloqueos
          </Button>
        </Link>
        <Link href="/app/reports">
          <Button variant="ghost">Resumen</Button>
        </Link>
      </div>
    </Card>
  );
}
