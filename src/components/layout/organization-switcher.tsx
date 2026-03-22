"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import type { OrganizationSummary } from "@/types/organization";

function formatRole(role?: string | null) {
  if (!role) return "Miembro";
  return role.replaceAll("_", " ").replace(/^./, (match) => match.toUpperCase());
}

export function OrganizationSwitcher({
  organizations,
  activeOrganization,
}: {
  organizations: OrganizationSummary[];
  activeOrganization?: OrganizationSummary | null;
}) {
  const [open, setOpen] = useState(false);
  const label = activeOrganization?.name ?? "Sin organización";

  return (
    <div className="relative min-w-0 w-full">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-[26px] border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-emerald-200 hover:bg-white"
      >
        <div className="min-w-0 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Building2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Organización</p>
            <p className="truncate text-sm font-semibold text-slate-900">{label}</p>
            <p className="truncate text-xs text-slate-500">Rol: {formatRole(activeOrganization?.role)}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-full min-w-[240px] rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_24px_50px_rgba(15,23,42,0.16)]">
          <div className="space-y-2">
            {organizations.length ? organizations.slice(0, 5).map((organization) => (
              <div
                key={organization.id}
                className={`flex items-center justify-between rounded-2xl px-3 py-2 ${organization.id === activeOrganization?.id ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-700"}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{organization.name}</p>
                  <p className="text-xs opacity-80">{formatRole(organization.role)}</p>
                </div>
                {organization.id === activeOrganization?.id ? <Check className="h-4 w-4 shrink-0" /> : null}
              </div>
            )) : (
              <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-600">Todavía no tienes una organización activa.</div>
            )}
          </div>
          <Link
            href="/app/organization"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Ver detalles
          </Link>
        </div>
      ) : null}
    </div>
  );
}
