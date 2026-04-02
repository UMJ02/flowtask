'use client';

import { useMemo, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { OrganizationSummary } from "@/types/organization";

type OrganizationMemberItem = { id: string; userId: string; role: "admin_global" | "manager" | "member" | "viewer"; isDefault: boolean; fullName: string; email: string; };

const ROLE_OPTIONS = [
  { value: "admin_global", label: "Admin global" },
  { value: "manager", label: "Manager" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
] as const;

function describeRole(role: OrganizationMemberItem["role"]) {
  if (role === "admin_global") return "Gobierna roles, invitaciones y operación.";
  if (role === "manager") return "Coordina clientes, proyectos y equipo.";
  if (role === "viewer") return "Solo lectura para seguimiento.";
  return "Participa en la operación diaria.";
}

export function OrganizationMembersPanel({ activeOrganization, members, canManageRoles = false }: { activeOrganization?: OrganizationSummary | null; members: OrganizationMemberItem[]; canManageRoles?: boolean; }) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState(members);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function updateRole(memberId: string, role: OrganizationMemberItem["role"]) {
    setSavingId(memberId);
    setStatus(null);
    const previous = items;
    setItems((current) => current.map((item) => (item.id === memberId ? { ...item, role } : item)));
    const { error } = await supabase.from("organization_members").update({ role }).eq("id", memberId);
    if (error) { setItems(previous); setStatus(error.message); } else { setStatus("Rol actualizado correctamente."); }
    setSavingId(null);
  }

  const counters = useMemo(() => ({
    admin_global: items.filter((item) => item.role === "admin_global").length,
    manager: items.filter((item) => item.role === "manager").length,
    member: items.filter((item) => item.role === "member").length,
    viewer: items.filter((item) => item.role === "viewer").length,
  }), [items]);

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Equipo de organización</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">{activeOrganization ? activeOrganization.name : "Miembros y roles"}</h2>
          <p className="mt-2 text-sm text-slate-600">Visualiza quién forma parte de la organización activa y ajusta roles desde una sola vista.</p>
        </div>
        {activeOrganization ? <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"><p><strong>Slug:</strong> /{activeOrganization.slug}</p><p><strong>Tu rol:</strong> {activeOrganization.role}</p></div> : null}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Admins" value={counters.admin_global} />
        <Metric title="Managers" value={counters.manager} />
        <Metric title="Members" value={counters.member} />
        <Metric title="Viewers" value={counters.viewer} />
      </div>
      {status ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{status}</div> : null}
      <div className="mt-4 space-y-3">
        {items.length ? items.map((member) => (
          <div key={member.id} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">{(member.fullName || member.email || "U").slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{member.fullName || "Usuario sin nombre"}</p><p className="truncate text-sm text-slate-500">{member.email}</p></div>
                  {member.isDefault ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Organización por defecto</span> : null}
                </div>
                <p className="mt-3 text-sm text-slate-600">{describeRole(member.role)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                {canManageRoles ? <Select className="min-w-[180px]" value={member.role} onChange={(event) => updateRole(member.id, event.target.value as OrganizationMemberItem["role"])} disabled={savingId === member.id}>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</Select> : <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{member.role}</span>}
                {savingId === member.id ? <span className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600"><ShieldCheck className="h-4 w-4" />Guardando...</span> : canManageRoles ? <span className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700"><Check className="h-4 w-4" />Editable</span> : null}
              </div>
            </div>
          </div>
        )) : <div className="rounded-[22px] border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">No hay miembros para mostrar en esta organización.</div>}
      </div>
    </Card>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white"><p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{title}</p><p className="mt-1 text-lg font-bold">{value}</p></div>;
}
