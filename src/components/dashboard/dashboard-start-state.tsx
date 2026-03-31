import Link from 'next/link';
import { ArrowRight, FolderKanban, ClipboardList, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { projectNewRoute, taskNewRoute } from '@/lib/navigation/routes';

export function DashboardStartState() {
  const steps = [
    {
      title: 'Crea tu primer proyecto',
      description: 'Define un frente de trabajo para agrupar tareas, cliente y fechas.',
      href: projectNewRoute(),
      cta: 'Nuevo proyecto',
      icon: FolderKanban,
    },
    {
      title: 'Agrega una tarea accionable',
      description: 'Empieza con una tarea corta y una fecha para ver el flujo real de la app.',
      href: taskNewRoute(),
      cta: 'Nueva tarea',
      icon: ClipboardList,
    },
  ];

  return (
    <Card className="rounded-[28px] border border-dashed border-slate-300 bg-gradient-to-br from-white to-slate-50 p-6 md:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 ring-1 ring-emerald-100">
            <Sparkles className="h-3.5 w-3.5" />
            Inicio rápido
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Tu workspace está listo para arrancar</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Ya tienes la estructura base. El siguiente paso es crear un proyecto o una tarea para empezar a usar el dashboard con datos reales.
          </p>
        </div>

        <div className="grid gap-3 lg:min-w-[360px] lg:max-w-[420px]">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.title}
                href={step.href}
                className="group rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{step.description}</p>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-800">
                      {step.cta}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
