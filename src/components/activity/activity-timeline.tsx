"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/dates";
import type { ActivityItem } from "@/lib/queries/activity";

const labels: Record<string, string> = {
  task_created: "Tarea creada",
  task_updated: "Tarea actualizada",
  task_deleted: "Tarea eliminada",
  task_status_changed: "Estado de tarea cambiado",
  task_assignee_added: "Responsable agregado",
  task_assignee_removed: "Responsable removido",
  project_created: "Proyecto creado",
  project_updated: "Proyecto actualizado",
  project_deleted: "Proyecto eliminado",
  project_status_changed: "Estado de proyecto cambiado",
  project_member_added: "Miembro agregado al proyecto",
  project_member_updated: "Rol de miembro actualizado",
  project_member_removed: "Miembro removido del proyecto",
  client_created: "Cliente creado",
  client_updated: "Cliente actualizado",
  client_deleted: "Cliente eliminado",
  organization_member_created: "Miembro agregado a la organización",
  organization_member_updated: "Rol de organización actualizado",
  organization_member_deleted: "Miembro removido de la organización",
  organization_invite_created: "Invitación creada",
  organization_invite_revoked: "Invitación revocada",
  client_permission_created: "Permiso de cliente creado",
  client_permission_updated: "Permiso de cliente actualizado",
  client_permission_deleted: "Permiso de cliente eliminado",
  attachment_uploaded: "Adjunto cargado",
  attachment_deleted: "Adjunto eliminado",
  comment_added: "Comentario agregado",
  reminder_sent: "Recordatorio disparado",
};

const entityStyles: Record<string, string> = {
  task: "bg-blue-50 text-blue-700 ring-blue-100",
  task_assignee: "bg-blue-50 text-blue-700 ring-blue-100",
  project: "bg-violet-50 text-violet-700 ring-violet-100",
  project_member: "bg-violet-50 text-violet-700 ring-violet-100",
  client: "bg-amber-50 text-amber-700 ring-amber-100",
  client_permission: "bg-amber-50 text-amber-700 ring-amber-100",
  organization_member: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  organization_invite: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  attachment: "bg-slate-100 text-slate-700 ring-slate-200",
  comment: "bg-amber-50 text-amber-700 ring-amber-100",
  reminder: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

function resolveEntityLabel(item: ActivityItem) {
  if (item.entity_type === "task") return "Tarea";
  if (item.entity_type === "task_assignee") return "Responsable";
  if (item.entity_type === "project") return "Proyecto";
  if (item.entity_type === "project_member") return "Proyecto";
  if (item.entity_type === "client") return "Cliente";
  if (item.entity_type === "client_permission") return "Permiso";
  if (item.entity_type === "organization_member") return "Equipo";
  if (item.entity_type === "organization_invite") return "Invitación";
  if (item.entity_type === "attachment") return "Adjunto";
  if (item.action.includes("comment")) return "Comentario";
  if (item.action.includes("reminder")) return "Recordatorio";
  return "Actividad";
}

function resolveEntityStyle(item: ActivityItem) {
  if (item.entity_type && entityStyles[item.entity_type]) return entityStyles[item.entity_type];
  if (item.action.includes("comment")) return entityStyles.comment;
  if (item.action.includes("reminder")) return entityStyles.reminder;
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function extractDetail(item: ActivityItem) {
  const title = typeof item.metadata?.title === "string"
    ? item.metadata.title
    : typeof item.metadata?.name === "string"
      ? item.metadata.name
      : typeof item.metadata?.file_name === "string"
        ? item.metadata.file_name
        : typeof item.metadata?.email === "string"
          ? item.metadata.email
          : null;
  const status = typeof item.metadata?.status === "string" ? item.metadata.status : null;
  const description = typeof item.metadata?.description === "string"
    ? item.metadata.description
    : typeof item.metadata?.notes === "string"
      ? item.metadata.notes
      : null;
  const role = typeof item.metadata?.role === "string" ? item.metadata.role : null;
  const previousRole = typeof item.metadata?.previous_role === "string" ? item.metadata.previous_role : null;

  return { title, status, description, role, previousRole };
}

export function ActivityTimeline({
  items,
  title = "Actividad reciente",
  description = "Últimos cambios registrados.",
  compact = false,
  defaultVisibleCount,
  expandLabel = "Ver más movimientos",
  collapseLabel = "Ver menos movimientos",
}: {
  items: ActivityItem[];
  title?: string;
  description?: string;
  compact?: boolean;
  defaultVisibleCount?: number;
  expandLabel?: string;
  collapseLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const shouldClamp = typeof defaultVisibleCount === "number" && defaultVisibleCount > 0;
  const visibleItems = useMemo(() => {
    if (!shouldClamp) return items;
    return expanded ? items : items.slice(0, defaultVisibleCount);
  }, [defaultVisibleCount, expanded, items, shouldClamp]);

  return (
    <Card className={compact ? "border border-slate-200 bg-white" : undefined}>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className={compact ? "mt-4 space-y-2" : "mt-4 space-y-3"}>
        {visibleItems.length ? (
          visibleItems.map((item) => {
            const detail = extractDetail(item);
            return (
              <div key={item.id} className={compact ? "rounded-xl border border-slate-200 bg-white px-3 py-2.5" : "rounded-2xl border border-slate-200 bg-white px-4 py-3"}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${resolveEntityStyle(item)}`}>
                      {resolveEntityLabel(item)}
                    </span>
                    <p className={compact ? "text-[13px] font-semibold text-slate-900" : "text-sm font-medium text-slate-900"}>{labels[item.action] ?? item.action}</p>
                  </div>
                  <p className="text-xs text-slate-500">{formatDate(item.created_at)}</p>
                </div>
                {detail.title ? <p className={compact ? "mt-1.5 text-[13px] text-slate-700" : "mt-2 text-sm text-slate-700"}>{detail.title}</p> : null}
                {detail.role ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Rol{detail.previousRole ? `: ${detail.previousRole} → ${detail.role}` : `: ${detail.role}`}
                  </p>
                ) : null}
                {!compact && detail.description ? <p className="mt-2 text-sm text-slate-500">{detail.description}</p> : null}
                {detail.status ? <p className="mt-2 text-xs text-slate-500">Estado: {detail.status}</p> : null}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">Todavía no hay movimientos registrados.</p>
        )}
      </div>
      {shouldClamp && items.length > defaultVisibleCount ? (
        <div className="mt-4 flex justify-center">
          <Button type="button" variant="secondary" className="h-10 rounded-xl px-4" onClick={() => setExpanded((value) => !value)}>
            {expanded ? collapseLabel : expandLabel}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
