import type { WorkspaceViewId } from "@/lib/workspace-system/view-state";

// v58.28.14 — keep view navigation fully client-side unless a future view explicitly needs server resync.
export const WORKSPACE_PRO_SERVER_SYNC_VIEWS = new Set<WorkspaceViewId>([]);

export function buildWorkspaceProViewHref(view: WorkspaceViewId, currentSearch: string) {
  const next = new URLSearchParams(currentSearch);
  if (view === "home") next.delete("view");
  else next.set("view", view);
  next.delete("savedViewId");
  const query = next.toString();
  return query ? `/app/workspace?${query}` : "/app/workspace";
}

export function isWorkspaceProLightweightView(view: WorkspaceViewId) {
  return !WORKSPACE_PRO_SERVER_SYNC_VIEWS.has(view);
}
