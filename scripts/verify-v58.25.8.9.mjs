#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.25.8.9-workspace-activity-timeline-files-upload-entry-polish";
const expectedRelease = "v58.25.8.9 Workspace Activity Timeline + Files Upload Entry Polish";
const pkg = JSON.parse(read("package.json"));

if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.8.9 workspace project activity files context polish");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.8.9") failures.push("verify:current must target verify:v58.25.8.9");
if ((pkg.scripts ?? {})["verify:v58.25.8.9"] !== "node scripts/verify-v58.25.8.9.mjs") failures.push("verify:v58.25.8.9 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireFile("src/app/(app)/app/workspace/page.tsx");
requireFile("src/components/workspace-system/workspace-system-page.tsx");
requireFile("src/components/workspace-system/workspace-quick-create.tsx");
requireFile("src/components/workspace-system/views/canvas-view.tsx");
requireFile("src/components/workspace-system/views/files-view.tsx");
requireFile("src/components/workspace-system/workspace-files-upload-entry.tsx");
requireFile("src/components/workspace-system/workspace-activity-timeline.tsx");
requireFile("src/lib/workspace-system/server-data.ts");

requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceQuickCreate");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "showQuickCreate");
requireIncludes("src/components/workspace-system/workspace-quick-create.tsx", "Quick create");
requireIncludes("src/components/workspace-system/workspace-quick-create.tsx", "supabase.from(\"tasks\").insert(payload)");
requireIncludes("src/components/workspace-system/workspace-quick-create.tsx", "context.organizationId");
requireIncludes("src/components/workspace-system/workspace-quick-create.tsx", "router.refresh()");
requireIncludes("src/components/workspace-system/views/canvas-view.tsx", "WorkspaceBoardPreviewCard");
requireIncludes("src/components/workspace-system/views/canvas-view.tsx", "Board preview");
requireIncludes("src/components/workspace-system/views/canvas-view.tsx", "thumbnailUrl");
requireIncludes("src/components/workspace-system/views/canvas-view.tsx", "boardRoute(board.id)");
requireIncludes("src/components/workspace-system/views/canvas-view.tsx", "Preview principal");
requireIncludes("src/app/globals.css", "v58.25.8.9 Workspace Activity Timeline + Files Upload Entry Polish");
requireIncludes("src/app/globals.css", "ft-ws-quick-create");
requireIncludes("src/app/globals.css", "ft-ws-board-preview-card");

requireNotIncludes("src/app/(app)/app/workspace/page.tsx", "workspace_spaces");
requireNotIncludes("src/app/(app)/app/workspace/page.tsx", "project_views");
requireNotIncludes("src/components/workspace-system/views/canvas-view.tsx", "BoardPage(");

requireIncludes("src/components/layout/app-shell.tsx", "isWorkspaceFullScreen");
requireIncludes("src/components/layout/app-shell.tsx", "ft-workspace-fullscreen-root");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "ft-ws-fullscreen");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "setStatusFilter");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Workspace Pro");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Vistas del proyecto");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Biblioteca de pizarras");
requireIncludes("src/components/layout/nav-links.ts", "Workspace Pro");
requireIncludes("src/app/globals.css", "ft-ws-sidebar-nav-active");

requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "mobileSidebarOpen");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "rightPanelOpen");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "compactHeader");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "onNavigate");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "ft-ws-progress-ring");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "ft-ws-mini-metric");
requireIncludes("src/app/globals.css", "ft-ws-right-panel");
requireIncludes("src/app/globals.css", "ft-ws-action-bar");
requireIncludes("src/app/globals.css", "ft-ws-progress-ring");

requireFile("src/components/workspace-system/workspace-task-inline-actions.tsx");
requireIncludes("src/components/workspace-system/workspace-task-inline-actions.tsx", "supabase.from(\"tasks\").update");
requireIncludes("src/components/workspace-system/workspace-task-inline-actions.tsx", "WorkspaceTaskInlineEditor");
requireIncludes("src/components/workspace-system/workspace-task-inline-actions.tsx", "WorkspaceTaskQuickMove");
requireIncludes("src/components/workspace-system/views/list-view.tsx", "WorkspaceTaskInlineEditor");
requireIncludes("src/components/workspace-system/views/board-view.tsx", "WorkspaceTaskQuickMove");
requireIncludes("src/components/workspace-system/views/table-view.tsx", "WorkspaceTaskInlineEditor");
requireIncludes("src/app/globals.css", "v58.25.8.9 Workspace Activity Timeline + Files Upload Entry Polish");
requireIncludes("src/app/globals.css", "ft-ws-inline-editor");
requireIncludes("src/app/globals.css", "ft-ws-board-interactive-card");


requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceActivity");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceFiles");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "activity={activity}");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "files={files}");
requireIncludes("src/lib/workspace-system/view-state.ts", "WorkspaceActivityItem");
requireIncludes("src/lib/workspace-system/view-state.ts", "WorkspaceFileSummary");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspaceActivity");
requireIncludes("src/lib/workspace-system/server-data.ts", "getWorkspaceFiles");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "Línea de actividad");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "Archivos recientes");
requireIncludes("src/components/workspace-system/views/files-view.tsx", "Adjuntos recientes");
requireIncludes("src/components/workspace-system/views/files-view.tsx", "WorkspaceFileSummary");
requireIncludes("src/components/workspace-system/views/files-view.tsx", "WorkspaceFilesUploadEntry");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "WorkspaceActivityTimeline");
requireIncludes("src/components/workspace-system/workspace-activity-timeline.tsx", "ft-ws-activity-timeline");
requireIncludes("src/components/workspace-system/workspace-files-upload-entry.tsx", "Subir archivo al workspace");
requireIncludes("src/components/workspace-system/workspace-files-upload-entry.tsx", `supabase.storage.from("attachments").upload`);
requireIncludes("src/components/workspace-system/workspace-files-upload-entry.tsx", `supabase.from("attachments").insert`);
requireIncludes("src/app/globals.css", "v58.25.8.9 Workspace Activity Timeline + Files Upload Entry Polish");
requireIncludes("src/app/globals.css", "ft-ws-activity-item");
requireIncludes("src/app/globals.css", "ft-ws-file-card");
requireIncludes("src/app/globals.css", "ft-ws-upload-entry");
requireIncludes("src/app/globals.css", "ft-ws-upload-drop");
requireIncludes("src/app/globals.css", "ft-ws-activity-timeline");

requireFile("docs/release/V58_25_8_9_WORKSPACE_ACTIVITY_TIMELINE_FILES_UPLOAD_ENTRY_POLISH.md");
requireFile("docs/qa/FLOWTASK_V58_25_8_9_WORKSPACE_ACTIVITY_TIMELINE_FILES_UPLOAD_ENTRY_POLISH_QA.md");

if (failures.length) {
  console.error("[verify:v58.25.8.9] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.8.9] OK — Workspace activity timeline + files upload entry polish aligned without new DB tables.");
