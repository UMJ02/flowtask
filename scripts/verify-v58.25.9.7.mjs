#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.9.7-workspace-empty-states-client-qa-hardening";
const expectedRelease = "v58.25.9.7 Workspace Empty States + Client QA Hardening";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.9.7") failures.push("verify:current must target verify:v58.25.9.7");
if ((pkg.scripts ?? {})["verify:v58.25.9.7"] !== "node scripts/verify-v58.25.9.7.mjs") failures.push("verify:v58.25.9.7 script missing");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireFile("src/components/workspace-system/workspace-empty-state.tsx");
requireIncludes("src/components/workspace-system/workspace-empty-state.tsx", "WorkspaceEmptyState");
requireIncludes("src/components/workspace-system/workspace-empty-state.tsx", "WorkspaceHealthPanel");
requireIncludes("src/components/workspace-system/workspace-empty-state.tsx", "WorkspacePermissionEmptyState");
requireIncludes("src/components/workspace-system/workspace-empty-state.tsx", "WorkspaceMigrationEmptyState");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceMigrationEmptyState");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "Workspace sin proyectos visibles");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "WorkspaceHealthPanel");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "Sin archivos recientes");
requireIncludes("src/components/workspace-system/views/files-view.tsx", "WorkspacePermissionEmptyState");
requireIncludes("src/components/workspace-system/views/board-view.tsx", "Sin tareas en");
requireIncludes("src/components/workspace-system/views/timeline-view.tsx", "Timeline sin fechas");
requireIncludes("src/components/workspace-system/views/reports-view.tsx", "Reportes sin tareas visibles");
requireIncludes("src/app/globals.css", "v58.25.9.7 — Workspace Empty States + Client QA Hardening");
requireIncludes("src/app/globals.css", "ft-ws-empty-state");
requireIncludes("src/app/globals.css", "ft-ws-health-panel");
requireFile("docs/release/V58_25_9_7_WORKSPACE_EMPTY_STATES_CLIENT_QA_HARDENING.md");
requireFile("docs/qa/FLOWTASK_V58_25_9_7_WORKSPACE_EMPTY_STATES_CLIENT_QA_HARDENING_QA.md");

if (failures.length) {
  console.error("[verify:v58.25.9.7] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.9.7] OK — Workspace Empty States + Client QA Hardening aligned.");
