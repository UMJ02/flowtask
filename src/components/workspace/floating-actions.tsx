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
  X,
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
    <div className="relative">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={cn(
            'inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5',
            open
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-sky-200 bg-sky-50 text-sky-800'
          )}
          aria-label={open ? 'Ocultar acciones rápidas' : 'Mostrar acciones rápidas'}
        >
          <Sparkles className="h-4 w-4" />
          Acción rápida
        </button>
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          open ? 'mt-4 max-h-[900px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="rounded-[28px] border border-emerald-200 bg-white/[0.98] p-4 shadow-[0_24px_54px_rgba(15,23,42,0.10)]">
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

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Cerrar accesos rápidos"
            >
              <X className="h-4 w-4" />
            </button>
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
  );
}
