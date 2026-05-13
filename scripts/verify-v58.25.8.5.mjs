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

const expectedVersion = "58.25.8.5-workspace-full-screen-shell-navigation-polish";
const expectedRelease = "v58.25.8.5 Workspace Full-Screen Shell + Navigation Polish";
const pkg = JSON.parse(read("package.json"));

if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.8.5 workspace full-screen shell + navigation polish");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.8.5") failures.push("verify:current must target verify:v58.25.8.5");
if ((pkg.scripts ?? {})["verify:v58.25.8.5"] !== "node scripts/verify-v58.25.8.5.mjs") failures.push("verify:v58.25.8.5 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireFile("src/app/(app)/app/workspace/page.tsx");
requireFile("src/components/workspace-system/workspace-system-page.tsx");
requireFile("src/components/workspace-system/workspace-quick-create.tsx");
requireFile("src/components/workspace-system/views/canvas-view.tsx");
requireFile("src/components/workspace-system/views/files-view.tsx");
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
requireIncludes("src/app/globals.css", "v58.25.8.5 Workspace Full-Screen Shell + Navigation Polish");
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


requireFile("docs/release/V58_25_8_5_WORKSPACE_FULL_SCREEN_SHELL_NAVIGATION_POLISH.md");
requireFile("docs/qa/FLOWTASK_V58_25_8_5_WORKSPACE_FULL_SCREEN_SHELL_NAVIGATION_POLISH_QA.md");

if (failures.length) {
  console.error("[verify:v58.25.8.5] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.8.5] OK — Workspace full-screen shell and navigation polish aligned without new DB tables.");
