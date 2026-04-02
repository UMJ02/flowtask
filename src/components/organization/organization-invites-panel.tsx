'use client';

import { useMemo, useState } from "react";
import { Ban } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { OrganizationInviteSummary } from "@/types/organization";

export function OrganizationInvitesPanel({ organizationId, invites, canManageInvites = false }: { organizationId?: string | null; invites: OrganizationInviteSummary[]; canManageInvites?: boolean; canInviteManagers?: boolean; }) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState(invites);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function revokeInvite(inviteId: string) {
    setRevokingId(inviteId);
    const previous = items;
    setItems((current) => current.map((item) => (item.id === inviteId ? { ...item, status: "revoked" } : item)));
    const { error } = await supabase.from("organization_invites").update({ status: "revoked" }).eq("id", inviteId);
    if (error) setItems(previous);
    setRevokingId(null);
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Invitaciones</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Bandeja de acceso</h2>
          <p className="mt-2 text-sm text-slate-600">Controla correos invitados y el rol que recibirán al entrar en la organización.</p>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr><th className="pb-2 pr-4 font-medium">Correo</th><th className="pb-2 pr-4 font-medium">Rol</th><th className="pb-2 pr-4 font-medium">Estado</th><th className="pb-2 pr-4 font-medium">Fecha</th>{canManageInvites ? <th className="pb-2 pr-4 font-medium">Acción</th> : null}</tr>
          </thead>
          <tbody>
            {items.length ? items.map((invite) => (
              <tr key={invite.id} className="border-t border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">{invite.email}</td>
                <td className="py-3 pr-4 text-slate-600">{invite.role}</td>
                <td className="py-3 pr-4 text-slate-600">{invite.status}</td>
                <td className="py-3 pr-4 text-slate-600">{invite.createdAtLabel}</td>
                {canManageInvites ? <td className="py-3 pr-4">{invite.status === "pending" ? <Button type="button" variant="secondary" className="h-9 rounded-xl" onClick={() => revokeInvite(invite.id)} disabled={revokingId === invite.id}><Ban className="h-4 w-4" />{revokingId === invite.id ? "Revocando..." : "Revocar"}</Button> : <span className="text-xs text-slate-400">Sin acción</span>}</td> : null}
              </tr>
            )) : <tr><td colSpan={canManageInvites ? 5 : 4} className="py-6 text-sm text-slate-500">{canManageInvites ? "Todavía no hay invitaciones para esta organización." : "No tienes acceso a la bandeja de invitaciones de esta organización."}</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
