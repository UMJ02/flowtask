import { ShieldCheck } from 'lucide-react';

export function TaskPermissionBadge({
  canEdit,
  canManage,
  canShare,
}: {
  canEdit: boolean;
  canManage: boolean;
  canShare: boolean;
}) {
  const isFull = canEdit && canManage && canShare;

  return (
    <div className="rounded-[20px] border border-slate-200/90 bg-white/[0.92] px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Acceso operativo</p>
          <p className="mt-1 text-sm text-slate-600">El detalle completo de permisos vive ahora en Settings para mantener la tarea más limpia.</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
            isFull
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
              : 'bg-amber-50 text-amber-700 ring-amber-100'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {isFull ? 'Permiso full' : 'Permiso limitado'}
        </span>
      </div>
    </div>
  );
}
