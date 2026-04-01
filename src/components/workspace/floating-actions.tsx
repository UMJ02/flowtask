'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CalendarDays,
  FolderKanban,
  LayoutPanelTop,
  Sparkles,
  UserRoundPlus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { asRoute } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils/classnames';

const ACTIONS = [
  {
    href: asRoute('/app/tasks/new'),
    title: 'Nueva tarea',
    description: 'Crea algo rápido y sigue.',
    icon: UserRoundPlus,
  },
  {
    href: asRoute('/app/projects/new'),
    title: 'Nuevo proyecto',
    description: 'Abre un frente con contexto.',
    icon: FolderKanban,
  },
  {
    href: asRoute('/app/board'),
    title: 'Pizarra',
    description: 'Mueve foco y trabajo.',
    icon: LayoutPanelTop,
  },
  {
    href: asRoute('/app/planning'),
    title: 'Planificación',
    description: 'Revisa semana y prioridades.',
    icon: CalendarDays,
  },
  {
    href: asRoute('/app/tasks?priority=alta'),
    title: 'Prioridad alta',
    description: 'Filtra lo crítico primero.',
    icon: AlertTriangle,
  },
] as const;

export function WorkspaceFloatingActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed right-0 top-[32vh] z-30 hidden xl:block">
      <div className="pointer-events-auto relative flex items-start">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Ocultar accesos rápidos' : 'Mostrar accesos rápidos'}
          className={cn(
            'absolute left-0 top-1/2 z-10 flex h-[206px] w-[54px] -translate-x-[92%] -translate-y-1/2 flex-col items-center justify-center gap-3 rounded-l-[22px] border border-r-0 px-2 py-4 text-center text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] transition duration-300',
            open
              ? 'border-emerald-300 bg-[linear-gradient(180deg,#10b981,#0f766e)]'
              : 'border-sky-300 bg-[linear-gradient(180deg,#38bdf8,#2563eb)] animate-[float-tab_2.6s_ease-in-out_infinite]'
          )}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white shadow-sm backdrop-blur">
            {open ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </span>
          <span className="text-center text-[10px] font-semibold uppercase leading-none tracking-[0.10em] [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
            A un click de empezar
          </span>
        </button>

        <div
          className={cn(
            'overflow-hidden rounded-l-[28px] border border-r-0 border-emerald-200 bg-white/[0.98] shadow-[0_24px_54px_rgba(15,23,42,0.14)] transition-all duration-300',
            open ? 'max-w-[340px] translate-x-0 opacity-100' : 'max-w-0 translate-x-8 opacity-0'
          )}
        >
          <div className="w-[340px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Accesos rápidos
                </p>
                <h3 className="mt-3 text-lg font-bold text-slate-900">Hazlo sin rodeos</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Entradas directas para empezar sin cargar el dashboard de tarjetas repetidas.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group flex items-start gap-3 rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-[0_12px_28px_rgba(16,185,129,0.10)]"
                  >
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition group-hover:bg-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900">{action.title}</span>
                      <span className="mt-1 block text-sm leading-5 text-slate-500">{action.description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
