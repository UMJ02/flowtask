#!/usr/bin/env node
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const css = fs.readFileSync("src/app/globals.css", "utf8");
const failures = [];
const allowedVersions = [
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
  "58.28.20-mobile-responsive-final-pass",
  "58.28.21-supabase-rls-client-readiness-final",
  "58.28.21.3-classic-reports-data-integrity-checklist-progress-export",
];

if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!css.includes("--ws-pro-mint-pastel")) failures.push("Missing Workspace Pro pastel token set");
if (!css.includes("ws-pro-home-summary")) failures.push("Missing home color refinements");
if (pkg.version.includes("58.28.9") && !css.includes("ws-pro-view-switching::before")) failures.push("Missing full-width loading ribbon pseudo element for v58.28.9");
if (pkg.version.includes("58.28.10") && !css.includes(".ws-pro-view-switching")) failures.push("Missing v58.28.10 view switching override");

if (failures.length) {
  console.error("[workspace:brand-pastel:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:brand-pastel:ready] OK — Workspace Pro brand colors aligned.");
