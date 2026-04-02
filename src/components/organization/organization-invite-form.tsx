'use client';

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const ROLE_OPTIONS = [
  { value: "manager", label: "Manager" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
] as const;

export function OrganizationInviteForm({ organizationId, canInviteManagers = false }: { organizationId?: string | null; canInviteManagers?: boolean; }) {
  const supabase = useMemo(() => createClient(), []);
  const availableRoles = useMemo(() => ROLE_OPTIONS.filter((option) => canInviteManagers || option.value !== "manager"), [canInviteManagers]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>(availableRoles[0]?.value ?? "member");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organizationId || !email.trim()) return;
    setLoading(true);
    setStatus(null);
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.from("organization_invites").insert({ organization_id: organizationId, email: normalizedEmail, role, status: "pending" }).select('id').single();
    if (error) { setStatus(error.message); setLoading(false); return; }
    setStatus("Invitación creada correctamente.");
    setEmail("");
    setRole(availableRoles[0]?.value ?? "member");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.2fr_0.7fr_auto] md:items-end">
      <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Invitar miembro</p><Input type="email" placeholder="correo@empresa.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={!organizationId || loading} /></div>
      <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Rol</p><Select value={role} onChange={(event) => setRole(event.target.value)} disabled={!organizationId || loading}>{availableRoles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></div>
      <Button type="submit" loading={loading} className="h-11">{loading ? "Enviando..." : "Invitar"}</Button>
      {status ? <p className="md:col-span-3 text-sm text-slate-600">{status}</p> : null}
    </form>
  );
}
