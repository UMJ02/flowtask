"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const ROLE_OPTIONS = [
  { value: "manager", label: "Manager" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

export function OrganizationInviteForm({ organizationId }: { organizationId?: string | null }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!organizationId || !email.trim()) return;
    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/organization/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId, email: email.trim(), role }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(payload?.error ?? "No se pudo crear la invitación.");
      setLoading(false);
      return;
    }

    setStatus("Invitación creada correctamente.");
    setEmail("");
    setRole("member");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.2fr_0.7fr_auto] md:items-end">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Invitar miembro</p>
        <Input type="email" placeholder="correo@empresa.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={!organizationId || loading} />
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Rol</p>
        <Select value={role} onChange={(event) => setRole(event.target.value)} disabled={!organizationId || loading}>
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={!organizationId || loading}>{loading ? "Enviando..." : "Crear invitación"}</Button>
      {status ? <p className="md:col-span-3 text-sm text-slate-600">{status}</p> : null}
    </form>
  );
}
