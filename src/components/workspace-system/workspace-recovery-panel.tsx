"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, DatabaseZap, Home, RefreshCcw, ShieldAlert, WifiOff } from "lucide-react";
import type { WorkspaceContext, WorkspacePersistenceGuardStatus, WorkspacePermissionSummary } from "@/lib/workspace-system/view-state";

type WorkspaceRecoveryReason = "error" | "invalid-project" | "invalid-saved-view" | "migration" | "permissions" | "network";

const reasonIcon = {
  error: AlertTriangle,
  "invalid-project": ShieldAlert,
  "invalid-saved-view": ShieldAlert,
  migration: DatabaseZap,
  permissions: ShieldAlert,
  network: WifiOff,
} as const;

const reasonTone: Record<WorkspaceRecoveryReason, string> = {
  error: "rose",
  "invalid-project": "amber",
  "invalid-saved-view": "amber",
  migration: "blue",
  permissions: "slate",
  network: "violet",
};

export function WorkspaceRecoveryPanel({
  title,
  description,
  reason = "error",
  context,
  persistenceStatus,
  permissions,
  details = [],
  onRetry,
}: {
  title: string;
  description: string;
  reason?: WorkspaceRecoveryReason;
  context?: Partial<WorkspaceContext> | null;
  persistenceStatus?: WorkspacePersistenceGuardStatus | null;
  permissions?: Partial<WorkspacePermissionSummary> | null;
  details?: string[];
  onRetry?: () => void;
}) {
  const Icon = reasonIcon[reason];
  const tone = reasonTone[reason];
  const workspaceHref = buildWorkspaceRecoveryHref(context);
  const projectHref = context?.projectId ? `/app/projects/${context.projectId}` : "/app/projects";

  return (
    <section className={`ft-ws-recovery-panel is-${tone}`}>
      <div className="ft-ws-recovery-icon">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">Workspace recovery</p>
        <h2>{title}</h2>
        <p>{description}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <RecoveryFact label="Workspace" value={context?.workspaceName ?? "No disponible"} />
          <RecoveryFact label="Proyecto" value={context?.projectTitle ?? "Sin proyecto activo"} />
          <RecoveryFact label="Permiso" value={permissions?.isReadOnly ? "Solo lectura" : permissions?.canEdit ? "Puede editar" : "No confirmado"} />
        </div>

        {persistenceStatus ? (
          <div className="ft-ws-recovery-status mt-4">
            <DatabaseZap className="h-4 w-4" />
            <span>
              Persistencia: <b>{persistenceStatus.status}</b> · {persistenceStatus.message}
            </span>
          </div>
        ) : null}

        {details.length ? (
          <ul className="mt-4 space-y-2 text-sm font-bold text-slate-600">
            {details.slice(0, 6).map((detail) => (
              <li key={detail} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {onRetry ? (
            <button type="button" onClick={onRetry} className="ft-ws-recovery-action is-primary">
              <RefreshCcw className="h-4 w-4" /> Reintentar
            </button>
          ) : null}
          <Link href={workspaceHref} className="ft-ws-recovery-action is-primary">
            <Home className="h-4 w-4" /> Volver al Workspace Home
          </Link>
          <Link href={projectHref} className="ft-ws-recovery-action">
            <ArrowLeft className="h-4 w-4" /> Abrir proyectos
          </Link>
          <Link href="/app/dashboard" className="ft-ws-recovery-action">
            Dashboard clásico
          </Link>
        </div>
      </div>
    </section>
  );
}

function RecoveryFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="ft-ws-recovery-fact">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function buildWorkspaceRecoveryHref(context?: Partial<WorkspaceContext> | null) {
  const params = new URLSearchParams();
  if (context?.projectId) params.set("projectId", context.projectId);
  params.set("view", "home");
  return `/app/workspace?${params.toString()}`;
}
