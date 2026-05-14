"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eye, Link2, Lock, Share2, ShieldCheck, UserPlus, UsersRound, X } from "lucide-react";
import type { WorkspaceContext, WorkspaceMemberSummary, WorkspacePermissionSummary, WorkspaceProjectViewPreference, WorkspaceViewId } from "@/lib/workspace-system/view-state";

function roleLabel(role?: string | null) {
  const normalized = String(role ?? "viewer").toLowerCase();
  if (normalized === "owner") return "Owner";
  if (normalized === "editor") return "Editor";
  if (normalized === "viewer") return "Viewer";
  if (normalized === "admin" || normalized === "admin_global") return "Admin";
  if (normalized === "manager") return "Manager";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "FT";
}

function buildWorkspaceUrl(path: string) {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

function workspacePath(context: WorkspaceContext, updates: Record<string, string | null | undefined> = {}) {
  const params = new URLSearchParams();
  if (context.activeFilters?.space) params.set("space", context.activeFilters.space);
  if (context.projectId ?? context.activeFilters?.projectId) params.set("projectId", context.projectId ?? context.activeFilters?.projectId ?? "");
  if (context.activeFilters?.view) params.set("view", context.activeFilters.view);
  if (context.activeFilters?.status) params.set("status", context.activeFilters.status);
  if (context.activeFilters?.groupBy && context.activeFilters.groupBy !== "status") params.set("groupBy", context.activeFilters.groupBy);
  if (context.activeFilters?.sort && context.activeFilters.sort !== "updated") params.set("sort", context.activeFilters.sort);
  if (context.activeFilters?.savedViewId) params.set("savedViewId", context.activeFilters.savedViewId);
  for (const [key, value] of Object.entries(updates)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  const query = params.toString();
  return query ? `/app/workspace?${query}` : "/app/workspace";
}

async function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

// Copiar link interno del workspace sin saltar permisos/RLS.
function ShareLinkRow({ label, description, href, disabled }: { label: string; description: string; href: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    if (disabled) return;
    await copyText(buildWorkspaceUrl(href));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <button type="button" disabled={disabled} onClick={onCopy} className="ft-ws-share-link-row">
      <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-emerald-50 text-emerald-700"><Link2 className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1 text-left">
        <b>{label}</b>
        <small>{description}</small>
      </span>
      <span className={copied ? "ft-ws-share-copy is-copied" : "ft-ws-share-copy"}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copiado" : "Copiar"}</span>
    </button>
  );
}

export function WorkspaceSharePanel({
  open,
  onOpenChange,
  context,
  members,
  permissions,
  projectViews,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: WorkspaceContext;
  members: WorkspaceMemberSummary[];
  permissions: WorkspacePermissionSummary;
  projectViews: WorkspaceProjectViewPreference[];
}) {
  const activeView = context.activeFilters?.view ?? "home";
  const visibleMembers = members.slice(0, 8);
  const activeSavedView = context.activeSavedView;
  const shareLinks = useMemo(() => {
    const view = activeView as WorkspaceViewId;
    return {
      workspace: workspacePath(context, { view: "home", savedViewId: null }),
      project: workspacePath(context, { view: "home", savedViewId: null }),
      activeView: workspacePath(context, { view, savedViewId: null }),
      savedView: activeSavedView ? workspacePath(context, { view: activeSavedView.viewType, savedViewId: activeSavedView.id }) : null,
    };
  }, [activeSavedView, activeView, context]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button type="button" aria-label="Cerrar panel de compartir" className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <aside className="ft-ws-share-panel absolute right-0 top-0 h-full w-[min(94vw,460px)] overflow-y-auto bg-white p-5 shadow-2xl">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[.18em] text-emerald-600">Compartir y colaborar</p>
            <h2 className="mt-1 truncate text-2xl font-black tracking-[-.04em] text-slate-950">{context.projectTitle ?? "Workspace"}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">{context.workspaceName} · {context.mode === "organization" ? "Organización" : "Personal"}</p>
          </div>
          <button type="button" onClick={() => onOpenChange(false)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"><X className="h-4 w-4" /></button>
        </header>

        <section className={permissions.canShare ? "ft-ws-share-permission mt-5" : "ft-ws-share-permission mt-5 is-locked"}>
          {permissions.canShare ? <ShieldCheck className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          <div>
            <b>{permissions.canShare ? "Compartir habilitado" : "Compartir limitado"}</b>
            <p>{permissions.canShare ? "Podés copiar links del workspace, proyecto y vistas. El acceso sigue protegido por permisos y RLS." : "Podés copiar enlaces internos, pero no invitar ni modificar accesos desde este rol."}</p>
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-black text-slate-900"><Share2 className="mr-2 inline h-4 w-4 text-emerald-600" /> Links rápidos</h3>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-slate-500">Acceso interno</span>
          </div>
          <div className="mt-4 space-y-2">
            <ShareLinkRow label="Workspace Home" description="Abre el inicio del workspace/proyecto actual." href={shareLinks.workspace} />
            <ShareLinkRow label="Proyecto activo" description={context.hasProjectFilter ? "Link directo al Home del proyecto." : "Link al contexto general del workspace."} href={shareLinks.project} />
            <ShareLinkRow label="Vista actual" description={`Comparte la vista ${activeView} con filtros visibles.`} href={shareLinks.activeView} />
            <ShareLinkRow label="Vista guardada activa" description={activeSavedView ? activeSavedView.title : "No hay vista guardada aplicada."} href={shareLinks.savedView ?? shareLinks.activeView} disabled={!activeSavedView} />
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-black text-slate-900"><UsersRound className="mr-2 inline h-4 w-4 text-blue-600" /> Miembros y roles</h3>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-700">{members.length} visibles</span>
          </div>
          <div className="mt-4 space-y-2">
            {visibleMembers.length ? visibleMembers.map((member) => (
              <div key={member.id} className="ft-ws-share-member-row">
                <span className="ft-ws-member-avatar">{initials(member.name)}</span>
                <span className="min-w-0 flex-1">
                  <b>{member.name}</b>
                  <small>{member.email ?? member.source}</small>
                </span>
                <em>{roleLabel(member.role)}</em>
              </div>
            )) : (
              <p className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">No hay miembros visibles para este contexto. El acceso sigue protegido por Supabase/RLS.</p>
            )}
          </div>
          <button type="button" disabled={!permissions.canManageMembers} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[16px] border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-55">
            <UserPlus className="h-4 w-4" /> {permissions.canManageMembers ? "Gestionar acceso" : "Gestión de acceso bloqueada"}
          </button>
        </section>

        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4">
          <h3 className="font-black text-slate-900"><Eye className="mr-2 inline h-4 w-4 text-violet-600" /> Vistas compartibles</h3>
          <div className="mt-4 space-y-2">
            {projectViews.length ? projectViews.slice(0, 6).map((view) => (
              <ShareLinkRow key={view.id} label={view.title} description={`${view.viewType}${view.isDefault ? " · default" : ""}`} href={workspacePath(context, { view: view.viewType, savedViewId: view.id })} />
            )) : (
              <p className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">Todavía no hay vistas guardadas para compartir. Guardá una vista desde el Workspace y aparecerá aquí.</p>
            )}
          </div>
        </section>

        <section className="mt-5 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          <Lock className="mr-2 inline h-4 w-4" /> Los links no saltan permisos: usuarios sin acceso al proyecto o workspace verán bloqueo por RLS o modo solo lectura.
        </section>
      </aside>
    </div>
  );
}
