import { cn } from '@/lib/utils/classnames';

const STATUS_STYLES: Record<string, string> = {
  activo: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  completado: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  completed: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  concluido: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  en_progreso: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
  in_progress: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
  pendiente: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  por_hacer: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  todo: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  en_espera: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
  waiting: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
  cerrado: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  paused: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  en_pausa: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  open: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  resolved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  trial: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
  past_due: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  error: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  critical: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
  low: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  normal: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
  high: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
};

function toLabel(value?: string | null) {
  if (!value) return 'Sin estado';
  return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function StatusBadge({ value, className }: { value?: string | null; className?: string }) {
  const key = value?.toLowerCase() ?? '';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]',
        STATUS_STYLES[key] ?? 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
        className,
      )}
    >
      {toLabel(value)}
    </span>
  );
}
