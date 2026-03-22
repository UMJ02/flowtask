import Link from 'next/link';
import { Plus, Sparkles, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

const actions = [
  { href: '/app/tasks/new', label: 'Nueva tarea', hint: 'Crea un pendiente.', icon: Plus },
  { href: '/app/projects/new', label: 'Nuevo proyecto', hint: 'Organiza un trabajo.', icon: Sparkles },
  { href: '/app/projects/new', label: 'Con tu equipo', hint: 'Invita personas.', icon: Users },
];

export function QuickActions() {
  return (
    <Card>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Acciones rápidas</h2>
        <p className="text-sm text-slate-500">Haz lo más importante sin dar vueltas.</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} className="rounded-[24px] border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50" href={action.href}>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-900">{action.label}</p>
              <p className="mt-1 text-sm text-slate-500">{action.hint}</p>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
