#!/usr/bin/env node
import fs from "node:fs";
const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json") || "{}");
const page = read("src/components/workspace-pro/workspace-pro-page.tsx");
const spaces = read("src/components/workspace-system/workspace-spaces-manager.tsx");
const css = read("src/app/globals.css");
const allowedVersions = [
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
  "58.28.14-workspace-pro-component-split-runtime-slimdown",
  "58.28.10-workspace-pro-no-motion-board-portal-home-colors",
  "58.28.11-workspace-pro-nav-shape-home-alignment",
  "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.14-workspace-pro-component-split-runtime-slimdown",
];
const allowedVerifyTargets = ["npm run verify:v58.28.2", "npm run verify:v58.28.3", "npm run verify:v58.28.4", "npm run verify:v58.28.5",
  "npm run verify:v58.28.6",
  "npm run verify:v58.28.7",
  "npm run verify:v58.28.8",
  "npm run verify:v58.28.9",
  "npm run verify:v58.28.10", "npm run verify:v58.28.11", "npm run verify:v58.28.12", "npm run verify:v58.28.14"];
if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target the active v58.28 action model verify script");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:action-model:ready")) failures.push("build:preflight must include workspace:action-model:ready");
const pageMarkers = ["TASK_PRIORITY_ACTIONS", "updateTaskPriority", "Vista limpia", "Gestionar"];
for (const marker of pageMarkers) if (!page.includes(marker)) failures.push(`workspace-pro-page.tsx missing marker: ${marker}`);
if (!page.includes("ws-pro-action-menu-item") && !page.includes("WorkspaceProBoardActionPanel")) failures.push("workspace-pro-page.tsx missing action disclosure marker");
if (page.includes("Mover a Pendiente") || page.includes("Mover a En curso") || page.includes("Mover a En espera")) failures.push("Board cards must not expose repeated visible move chips");
if (page.includes("ws-pro-board-status-chip")) failures.push("Board cards must use menu disclosure instead of status chips");
const spaceMarkers = ["Organización del workspace", "Cómo usar espacios", "Asignar proyecto"];
for (const marker of spaceMarkers) if (!spaces.includes(marker)) failures.push(`workspace-spaces-manager.tsx missing marker: ${marker}`);
const cssMarkers = ["ws-pro-table-action", "ft-ws-spaces-help-card"];
for (const marker of cssMarkers) if (!css.includes(marker)) failures.push(`globals.css missing marker: ${marker}`);
if (!css.includes("ws-pro-action-menu") && !css.includes("ws-pro-board-action-panel")) failures.push("globals.css missing action disclosure CSS marker");
if (failures.length) { console.error("[workspace:action-model:ready] FAIL"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[workspace:action-model:ready] OK — Workspace Pro action model and progressive disclosure aligned.");
