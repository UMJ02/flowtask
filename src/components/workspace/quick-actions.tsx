import Link from 'next/link';
import { AlertCircle, BrainCircuit, FolderKanban, Plus, Sparkles, UserRoundPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { projectNewRoute, taskNewRoute } from '@/lib/navigation/routes';

const ACTIONS = [
  {
    href: taskNewRoute(),
    title: 'Nueva tarea',
    description: 'Crea algo pendiente y súbelo al tablero.',
    icon: Plus,
  },
  {
    href: projectNewRoute(),
    title: 'Nuevo proyecto',
    description: 'Abre un frente nuevo con fechas y cliente.',
    icon: FolderKanban,
  },
  {
    href: '/app/tasks?status=blocked',
    title: 'Ver bloqueos',
    description: 'Entra directo a lo que está frenando el avance.',
    icon: AlertCircle,
  },
  {
    href: '/app/intelligence',
    title: 'Abrir insights',
    description: 'Revisa riesgo, foco y capacidad sin dar vueltas.',
    icon: BrainCircuit,
  },
];

export function WorkspaceQuickActions() {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Acciones rápidas</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">Hazlo rápido</h3>
          <p className="mt-1 text-sm text-slate-500">Las acciones más usadas, sin salir del flujo.</p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <Sparkles className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.href} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 ring-1 ring-slate-200">
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
        <Link href="/app/organization">
          <Button variant="secondary">
            <UserRoundPlus className="h-4 w-4" /> Equipo
          </Button>
        </Link>
        <Link href="/app/reports">
          <Button variant="ghost">Resumen</Button>
        </Link>
      </div>
    </Card>
  );
}
