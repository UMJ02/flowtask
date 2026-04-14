import { Building2, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { OrganizationSummary } from '@/types/organization';

export function OrganizationIdentityCard({
  organization,
}: {
  organization: OrganizationSummary;
  member?: { userId: string; fullName: string; email: string; role: 'admin_global' | 'manager' | 'member' | 'viewer' } | null;
}) {
  return (
    <Card className="rounded-[24px] border border-emerald-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,251,249,0.98))] p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">Workspace activo</p>
              <h2 className="truncate text-xl font-bold text-slate-950">{organization.name}</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">Este espacio reúne lo compartido por tu equipo: miembros, permisos, clientes, tareas y proyectos. Tu trabajo personal sigue separado.</p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start rounded-2xl border border-emerald-100 bg-white/90 px-3 py-2 text-sm text-slate-700">
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          Separado de tu espacio personal
        </div>
      </div>
    </Card>
  );
}
