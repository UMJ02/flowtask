import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileArchive, FolderKanban, LayoutDashboard, ListChecks, LockKeyhole, Plus, SearchX, ShieldCheck, Sparkles } from "lucide-react";
import type { WorkspacePermissionSummary, WorkspacePersistenceGuardStatus } from "@/lib/workspace-system/view-state";

type EmptyStateTone = "neutral" | "success" | "warning" | "danger" | "blue" | "violet";

type WorkspaceEmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: "tasks" | "projects" | "spaces" | "boards" | "files" | "permissions" | "migration" | "search" | "sparkles";
  tone?: EmptyStateTone;
  compact?: boolean;
};

const toneClass: Record<EmptyStateTone, string> = {
  neutral: "ft-ws-empty-neutral",
  success: "ft-ws-empty-success",
  warning: "ft-ws-empty-warning",
  danger: "ft-ws-empty-danger",
  blue: "ft-ws-empty-blue",
  violet: "ft-ws-empty-violet",
};

function EmptyIcon({ icon }: { icon: WorkspaceEmptyStateProps["icon"] }) {
  const className = "h-5 w-5";
  if (icon === "tasks") return <ListChecks className={className} />;
  if (icon === "projects") return <FolderKanban className={className} />;
  if (icon === "spaces") return <FolderKanban className={className} />;
  if (icon === "boards") return <LayoutDashboard className={className} />;
  if (icon === "files") return <FileArchive className={className} />;
  if (icon === "permissions") return <LockKeyhole className={className} />;
  if (icon === "migration") return <ShieldCheck className={className} />;
  if (icon === "sparkles") return <Sparkles className={className} />;
  return <SearchX className={className} />;
}

export function WorkspaceEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
  icon = "search",
  tone = "neutral",
  compact = false,
}: WorkspaceEmptyStateProps) {
  const content = (
    <>
      <span className="ft-ws-empty-icon"><EmptyIcon icon={icon} /></span>
      <span className="min-w-0 flex-1">
        <b>{title}</b>
        <small>{description}</small>
      </span>
    </>
  );

  return (
    <div className={`ft-ws-empty-state ${toneClass[tone]} ${compact ? "is-compact" : ""}`}>
      <div className="flex min-w-0 items-start gap-3">{content}</div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="ft-ws-empty-action"><Plus className="h-4 w-4" /> {actionLabel}</Link>
      ) : null}
      {!actionHref && onAction && actionLabel ? (
        <button type="button" onClick={onAction} className="ft-ws-empty-action"><Plus className="h-4 w-4" /> {actionLabel}</button>
      ) : null}
    </div>
  );
}

export function WorkspacePermissionEmptyState({ permissions, action = "editar este elemento" }: { permissions: WorkspacePermissionSummary; action?: string }) {
  if (!permissions.isReadOnly) return null;
  return (
    <WorkspaceEmptyState
      icon="permissions"
      tone="warning"
      title="Modo solo lectura"
      description={`Tu rol actual no permite ${action}. Podés revisar el workspace sin modificar datos.`}
      compact
    />
  );
}

export function WorkspaceMigrationEmptyState({ persistenceStatus }: { persistenceStatus: WorkspacePersistenceGuardStatus }) {
  if (persistenceStatus.enabled) return null;
  return (
    <WorkspaceEmptyState
      icon="migration"
      tone={persistenceStatus.status === "blocked" ? "danger" : "warning"}
      title="Persistencia workspace en modo seguro"
      description={persistenceStatus.message}
      compact
    />
  );
}

export function WorkspaceHealthPanel({
  persistenceStatus,
  permissions,
  counts,
}: {
  persistenceStatus: WorkspacePersistenceGuardStatus;
  permissions: WorkspacePermissionSummary;
  counts: { tasks: number; projects: number; spaces: number; boards: number; files: number; views: number; activity: number };
}) {
  const checks = [
    { label: "Persistence", ok: persistenceStatus.enabled, helper: persistenceStatus.status },
    { label: "Spaces", ok: persistenceStatus.workspaceSpacesReady, helper: `${counts.spaces} espacios` },
    { label: "Saved views", ok: persistenceStatus.projectViewsReady, helper: `${counts.views} vistas` },
    { label: "Assignments", ok: Boolean(persistenceStatus.projectSpaceLinksReady), helper: "space links" },
    { label: "Permissions", ok: !permissions.isReadOnly, helper: permissions.role ?? "rol" },
    { label: "Data", ok: counts.tasks > 0 || counts.projects > 0 || counts.boards > 0 || counts.files > 0, helper: `${counts.tasks} tareas` },
  ];

  return (
    <section className="ft-ws-card ft-ws-health-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[.18em] text-emerald-600">Client QA</p>
          <h3 className="mt-1 font-extrabold text-slate-950">Workspace Health</h3>
        </div>
        <span className={checks.every((check) => check.ok) ? "ft-ws-health-pill is-ok" : "ft-ws-health-pill is-warn"}>
          {checks.every((check) => check.ok) ? "OK" : "Revisar"}
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        {checks.map((check) => (
          <div key={check.label} className="ft-ws-health-row" data-ok={check.ok ? "true" : "false"}>
            {check.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <b>{check.label}</b>
            <span>{check.helper}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
