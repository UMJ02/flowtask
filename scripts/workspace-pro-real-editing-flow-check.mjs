#!/usr/bin/env node
import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json") || "{}");
const page = read("src/components/workspace-pro/workspace-pro-page.tsx");
const quickCreate = read("src/components/workspace-system/workspace-quick-create.tsx");
const css = read("src/app/globals.css");

const allowedVersions = [
  "58.27.9-workspace-pro-interaction-hardening-real-editing-flow",
  "58.28.0-workspace-pro-production-ux-final",
  "58.28.1-workspace-pro-user-final-ui-fixes",
  "58.28.2-workspace-pro-action-model-progressive-disclosure",
  "58.28.3-workspace-pro-user-language-timeline-flow",
  "58.28.4-workspace-pro-board-overlay-status-alignment",
  "58.28.5-workspace-pro-brand-accent-pro-navigation-identity",
  "58.28.6-workspace-pro-completed-filter-anchored-actions",
  "58.28.7-workspace-pro-performance-pass-fast-view-switching",
  "58.28.8-workspace-pro-client-performance-anchored-popovers",
  "58.28.9-workspace-pro-brand-pastel-loading-system",
  "58.28.10-workspace-pro-no-motion-board-portal-home-colors",
  "58.28.11-workspace-pro-nav-shape-home-alignment",
  "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.15-workspace-pro-deep-component-extraction-lazy-view-loading",
  "58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity",
  "58.28.17-classic-pro-unified-data-qa-final-user-flow",
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.19-ux-copy-empty-states-final",
  "58.28.10-workspace-pro-no-motion-board-portal-home-colors",
  "58.28.11-workspace-pro-nav-shape-home-alignment",
  "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.15-workspace-pro-deep-component-extraction-lazy-view-loading",
  "58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity",
  "58.28.17-classic-pro-unified-data-qa-final-user-flow",
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.19-ux-copy-empty-states-final",
];
const allowedVerifyTargets = ["npm run verify:v58.27.9", "npm run verify:v58.28.0", "npm run verify:v58.28.1", "npm run verify:v58.28.2", "npm run verify:v58.28.3", "npm run verify:v58.28.4", "npm run verify:v58.28.5",
  "npm run verify:v58.28.6",
  "npm run verify:v58.28.7",
  "npm run verify:v58.28.8",
  "npm run verify:v58.28.9",
  "npm run verify:v58.28.10", "npm run verify:v58.28.11", "npm run verify:v58.28.12", "npm run verify:v58.28.15", "npm run verify:v58.28.16", "npm run verify:v58.28.16.1", "npm run verify:v58.28.16.2", "npm run verify:v58.28.17",
  "npm run verify:v58.28.17.1",
  "npm run verify:v58.28.19"];
if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target an active Workspace Pro real editing verify script");

const requiredPageMarkers = [
  "WorkspaceProListTaskEditor",
  "WorkspaceProBoardTaskEditor",
  "onMove(next.id)",
  "taskCompletionPercent",
  "visibleColumns",
  "Mostrar concluidas",
  "Editar completa",
];
for (const marker of requiredPageMarkers) {
  if (!page.includes(marker)) failures.push(`workspace-pro-page.tsx missing marker: ${marker}`);
}
if (!page.includes(".from(\"tasks\")") || !page.includes(".update({")) failures.push("workspace-pro-page.tsx missing task core update marker");
if (!page.includes(".delete()")) failures.push("workspace-pro-page.tsx missing task delete marker");
if (!page.includes("ws-pro-task-editor-inline-row")) failures.push("workspace-pro-page.tsx missing compact inline task editor row");

const requiredQuickCreateMarkers = [
  "type DraftMode = \"task\" | \"project\"",
  "task_checklist_items",
  "Tarea",
  "Proyecto",
  "Sin checklist: la tarea inicia en 0%",
];
for (const marker of requiredQuickCreateMarkers) {
  if (!quickCreate.includes(marker)) failures.push(`workspace-quick-create.tsx missing marker: ${marker}`);
}

if (!css.includes("v58.27.9 — Workspace Pro Interaction Hardening + Real Editing Flow")) failures.push("CSS marker missing");
if (!css.includes("ws-pro-danger-button")) failures.push("danger button CSS missing");

if (failures.length) {
  console.error("[workspace:real-editing:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:real-editing:ready] OK — Workspace Pro real editing flow aligned.");
