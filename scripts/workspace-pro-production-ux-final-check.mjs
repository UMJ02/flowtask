#!/usr/bin/env node
import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json") || "{}");
const page = read("src/components/workspace-pro/workspace-pro-page.tsx");
const css = read("src/app/globals.css");
const allowedVersions = [
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
  "58.28.18.1-dependency-security-public-registry-lockfile-hotfix",
  "58.28.10-workspace-pro-no-motion-board-portal-home-colors",
  "58.28.11-workspace-pro-nav-shape-home-alignment",
  "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.15-workspace-pro-deep-component-extraction-lazy-view-loading",
  "58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity",
  "58.28.17-classic-pro-unified-data-qa-final-user-flow",
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.18.1-dependency-security-public-registry-lockfile-hotfix",
];

if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!["npm run verify:v58.28.0", "npm run verify:v58.28.1", "npm run verify:v58.28.2", "npm run verify:v58.28.3", "npm run verify:v58.28.4", "npm run verify:v58.28.5",
  "npm run verify:v58.28.6",
  "npm run verify:v58.28.7",
  "npm run verify:v58.28.8",
  "npm run verify:v58.28.9",
  "npm run verify:v58.28.10", "npm run verify:v58.28.11", "npm run verify:v58.28.12", "npm run verify:v58.28.15", "npm run verify:v58.28.16", "npm run verify:v58.28.16.1", "npm run verify:v58.28.16.2", "npm run verify:v58.28.17",
  "npm run verify:v58.28.17.1",
  "npm run verify:v58.28.18.1"].includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target the active v58.28.x verify script");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:production-ux:ready")) failures.push("build:preflight must include workspace:production-ux:ready");

const baseMarkers = [
  "actionLabel=\"Volver al Home\"",
  "actionLabel=\"Ir al Home\"",
  "actionLabel=\"Abrir Lista\"",
];
for (const marker of baseMarkers) if (!page.includes(marker)) failures.push(`workspace-pro-page.tsx missing marker: ${marker}`);
if (!page.includes("WorkspaceProProductionUXStrip") && !page.includes("WorkspaceProUser Language") && !page.includes("v58.28.3") && !page.includes("v58.28.4") && !page.includes("v58.28.8") && !page.includes("v58.28.10")) failures.push("workspace-pro-page.tsx missing production/user-language marker");
if (page.includes("Production UX Final") && pkg.version.includes("58.28.3")) failures.push("v58.28.3 must not expose Production UX Final banner text");

for (const marker of ["v58.28.0 — Workspace Pro Production UX Final", ":focus-visible", "scroll-padding"]) {
  if (!css.includes(marker)) failures.push(`globals.css missing marker: ${marker}`);
}
if (!css.includes("ws-pro-production-ux-strip") && !css.includes("v58.28.3 — Workspace Pro User Language + Timeline Flow")) failures.push("globals.css missing production/user language CSS marker");

if (failures.length) {
  console.error("[workspace:production-ux:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:production-ux:ready] OK — Workspace Pro production UX final aligned.");
