'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Building2, ChevronDown, Check } from 'lucide-react';
import type { OrganizationSummary } from '@/types/organization';
import { formatOrganizationRole } from '@/lib/organization/labels';

function formatRole(role?: string | null) {
  if (!role) return 'Miembro';
  return role.replaceAll('_', ' ').replace(/^./, (match) => match.toUpperCase());
}

export function OrganizationSwitcher({
  organizations,
  activeOrganization,
  compact = false,
  dark = false,
  collapsed = false,
}: {
  organizations: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
  compact?: boolean;
  dark?: boolean;
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const label = activeOrganization?.name ?? 'Sin organización';

  if (collapsed) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          title={label}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-emerald-300 transition hover:border-emerald-400/30 hover:bg-white/10"
        >
          <Building2 className="h-5 w-5" />
        </button>

        {open ? (
          <div className="absolute bottom-[calc(100%+10px)] left-1/2 z-30 w-64 -translate-x-1/2 rounded-[24px] border border-white/10 bg-slate-950 p-3 text-white shadow-[0_24px_50px_rgba(15,23,42,0.16)]">
            <div className="space-y-2">
              {organizations.length ? organizations.slice(0, 5).map((organization) => (
                <div
                  key={organization.id}
                  className={`flex items-center justify-between rounded-2xl px-3 py-2 ${organization.id === activeOrganization?.id ? 'bg-emerald-500/15 text-emerald-200' : 'bg-white/5 text-slate-200'}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{organization.name}</p>
                    <p className="text-xs opacity-80">{formatOrganizationRole(organization.role)}</p>
                  </div>
                  {organization.id === activeOrganization?.id ? <Check className="h-4 w-4 shrink-0" /> : null}
                </div>
              )) : (
                <div className="rounded-2xl bg-white/5 px-3 py-3 text-sm text-slate-300">Todavía no tienes una organización activa.</div>
              )}
            </div>
            <Link href="/app/organization" onClick={() => setOpen(false)} className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">
              Ver detalles
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative min-w-0 w-full">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-[26px] border px-4 py-3 text-left transition ${dark ? 'border-white/10 bg-white/6 hover:border-emerald-400/30 hover:bg-white/10' : 'border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-white'}`}
      >
        <div className="min-w-0 flex items-center gap-3">
          <span className={`inline-flex shrink-0 items-center justify-center rounded-2xl ${compact ? 'h-10 w-10' : 'h-10 w-10'} ${dark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
            <Building2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Organización</p>
            <p className={`truncate text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{label}</p>
            <p className={`truncate text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Rol: {formatRole(activeOrganization?.role)}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? 'rotate-180' : ''} ${dark ? 'text-slate-400' : 'text-slate-500'}`} />
      </button>

      {open ? (
        <div className={`absolute ${dark ? 'bottom-[calc(100%+10px)]' : 'top-[calc(100%+10px)]'} right-0 z-30 w-full min-w-[240px] rounded-[24px] border p-3 shadow-[0_24px_50px_rgba(15,23,42,0.16)] ${dark ? 'border-white/10 bg-slate-950 text-white' : 'border-slate-200 bg-white'}`}>
          <div className="space-y-2">
            {organizations.length ? organizations.slice(0, 5).map((organization) => (
              <div
                key={organization.id}
                className={`flex items-center justify-between rounded-2xl px-3 py-2 ${organization.id === activeOrganization?.id ? dark ? 'bg-emerald-500/15 text-emerald-200' : 'bg-emerald-50 text-emerald-700' : dark ? 'bg-white/5 text-slate-200' : 'bg-slate-50 text-slate-700'}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{organization.name}</p>
                  <p className="text-xs opacity-80">{formatOrganizationRole(organization.role)}</p>
                </div>
                {organization.id === activeOrganization?.id ? <Check className="h-4 w-4 shrink-0" /> : null}
              </div>
            )) : (
              <div className={`rounded-2xl px-3 py-3 text-sm ${dark ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>Todavía no tienes una organización activa.</div>
            )}
          </div>
          <Link
            href="/app/organization"
            onClick={() => setOpen(false)}
            className={`mt-3 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold ${dark ? 'bg-white text-slate-950' : 'bg-slate-900 text-white'}`}
          >
            Ver detalles
          </Link>
        </div>
      ) : null}
    </div>
  );
}
