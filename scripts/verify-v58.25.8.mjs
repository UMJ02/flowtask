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

const expectedVersion = "58.25.8-workspace-first-foundation";
const expectedRelease = "v58.25.8 Workspace-First Foundation";
const pkg = JSON.parse(read("package.json"));

if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.8 workspace-first foundation");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.8") failures.push("verify:current must target verify:v58.25.8");
if ((pkg.scripts ?? {})["verify:v58.25.8"] !== "node scripts/verify-v58.25.8.mjs") failures.push("verify:v58.25.8 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);

requireFile("src/app/(app)/app/workspace/page.tsx");
requireFile("src/lib/workspace-system/view-state.ts");
requireFile("src/lib/workspace-system/adapters.ts");
requireFile("src/components/workspace-system/workspace-system-page.tsx");
requireFile("src/components/workspace-system/workspace-sidebar-pro.tsx");
requireFile("src/components/workspace-system/workspace-context-header.tsx");
requireFile("src/components/workspace-system/workspace-view-tabs.tsx");
requireFile("src/components/workspace-system/workspace-right-panel.tsx");
requireFile("src/components/workspace-system/views/list-view.tsx");
requireFile("src/components/workspace-system/views/board-view.tsx");
requireFile("src/components/workspace-system/views/timeline-view.tsx");
requireFile("src/components/workspace-system/views/table-view.tsx");
requireFile("src/components/workspace-system/views/canvas-view.tsx");
requireFile("src/components/workspace-system/views/files-view.tsx");
requireFile("src/components/workspace-system/views/reports-view.tsx");

requireIncludes("src/app/(app)/app/workspace/page.tsx", "getTasks({ includeCompleted: true })");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getProjects({})");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getReportsOverview()");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "projectId");
requireIncludes("src/components/workspace-system/workspace-view-tabs.tsx", "router.replace(`/app/workspace?");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Espacios");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Proyectos");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "IA Assistant");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceRightPanel");
requireIncludes("src/components/workspace-system/views/canvas-view.tsx", "Canvas listo para conectar BoardPage");
requireIncludes("src/components/workspace-system/views/reports-view.tsx", "ReportsOverview");
requireIncludes("src/app/globals.css", "v58.25.8 Workspace-First Foundation");
requireIncludes("src/app/globals.css", ".ft-ws-shell");
requireIncludes("src/app/globals.css", ".ft-ws-sidebar");
requireIncludes("src/app/globals.css", ".ft-ws-tabs");

requireNotIncludes("src/app/(app)/app/workspace/page.tsx", "workspace_spaces");
requireNotIncludes("src/app/(app)/app/workspace/page.tsx", "project_views");

requireFile("docs/release/V58_25_8_WORKSPACE_FIRST_FOUNDATION.md");
requireFile("docs/qa/FLOWTASK_V58_25_8_WORKSPACE_FIRST_FOUNDATION_QA.md");

if (failures.length) {
  console.error("[verify:v58.25.8] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.8] OK — Workspace-First foundation files, route, views and release metadata aligned.");
