#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const pkg = JSON.parse(read("package.json") || "{}");
const allowedVersions = ["58.27.6-workspace-pro-deep-cleanup-2026-ui-controls-system", "58.27.7-workspace-pro-render-diet-dead-ui-removal", "58.27.7.1-workspace-pro-render-diet-cli-hotfix"];
const allowedVerifyTargets = ["npm run verify:v58.27.6", "npm run verify:v58.27.7", "npm run verify:v58.27.7.1"];
if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target the active v58.27.x verify script");
const pro = read("src/components/workspace-pro/workspace-pro-page.tsx");
const quick = read("src/components/workspace-system/workspace-quick-create.tsx");
const viewState = read("src/lib/workspace-system/view-state.ts");
const adapters = read("src/lib/workspace-system/adapters.ts");
const css = read("src/app/globals.css");
for (const marker of ["WorkspaceProProjects", "BOARD_COLUMN_DEFS", "WorkspaceProUtilityDock", "Mostrar concluidas", "draggable", "WorkspaceTaskInlineEditor"]){
  if (!pro.includes(marker)) failures.push(`Missing interaction marker ${marker} in workspace pro page`);
}
for (const marker of ["mode: DraftMode", "task_checklist_items", "Crear proyecto", "Crear tarea", "Tarea individual"]){
  if (!quick.includes(marker)) failures.push(`Missing quick create marker ${marker}`);
}
if (!viewState.includes('"projects"')) failures.push("WorkspaceViewId must include projects view");
if (!adapters.includes('"projects"')) failures.push("normalizeWorkspaceView must allow projects view");
if (!css.includes("v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System")) failures.push("globals.css must include v58.27.6 marker");
if (failures.length) {
  console.error("[workspace:interaction:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:interaction:ready] OK — Workspace Pro interaction model and task/project UX aligned.");
