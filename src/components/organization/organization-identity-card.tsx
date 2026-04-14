import { Building2, Crown, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { OrganizationSummary } from '@/types/organization';
import { formatOrganizationRole } from '@/lib/organization/labels';

type OrganizationMemberIdentity = {
  userId: string;
  fullName: string;
  email: string;
  role: 'admin_global' | 'manager' | 'member' | 'viewer';
};

export function OrganizationIdentityCard({
  organization,
  member,
}: {
  organization: OrganizationSummary;
  member?: OrganizationMemberIdentity | null;
}) {
  return (
    <Card className="rounded-[24px] border-emerald-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(236,253,245,0.96))] p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">Workspace activo</p>
              <h2 className="truncate text-xl font-bold text-slate-950">{organization.name}</h2>
              <p className="truncate text-sm text-slate-600">Ahora estás gestionando datos, miembros y permisos del canal organización.</p>
            </div>
          </div>
          {member ? (
            <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white/90 px-3.5 py-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                {(member.fullName || member.email || 'U').slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{member.fullName || 'Usuario sin nombre'}</p>
                <p className="truncate text-sm text-slate-500">{member.email}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100">
                <Crown className="h-3.5 w-3.5" />
                Owner principal
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                {formatOrganizationRole(member.role)}
              </span>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 text-sm text-slate-700">
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          Organización separada del workspace personal
        </div>
      </div>
    </Card>
  );
}
