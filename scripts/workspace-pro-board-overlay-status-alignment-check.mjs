#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const page = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const validation = fs.readFileSync("src/lib/validations/task.ts", "utf8");
const failures = [];
if (!["58.28.4-workspace-pro-board-overlay-status-alignment", "58.28.5-workspace-pro-brand-accent-pro-navigation-identity",
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
  "58.28.18.1-dependency-security-public-registry-lockfile-hotfix"].includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!["npm run verify:v58.28.4", "npm run verify:v58.28.5",
  "npm run verify:v58.28.6",
  "npm run verify:v58.28.7",
  "npm run verify:v58.28.8",
  "npm run verify:v58.28.9",
  "npm run verify:v58.28.10", "npm run verify:v58.28.11", "npm run verify:v58.28.12", "npm run verify:v58.28.15", "npm run verify:v58.28.16", "npm run verify:v58.28.16.1", "npm run verify:v58.28.16.2", "npm run verify:v58.28.17",
  "npm run verify:v58.28.17.1",
  "npm run verify:v58.28.18.1"].includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target verify:v58.28.4");
for (const marker of ["WorkspaceProBoardActionPanel", "gridTemplateColumns", "setBoardMessage"]) {
  if (!page.includes(marker)) failures.push(`Missing board overlay marker: ${marker}`);
}
if (!page.includes("ws-pro-board-action-layer") && !page.includes("ws-pro-board-action-popover")) failures.push("Missing board action overlay/popover marker");
for (const status of ["pendiente", "revision"]) {
  if (!validation.includes(status)) failures.push(`Task validation must allow ${status}`);
}
if (!fs.existsSync("supabase/migrations/0055_v58_28_4_task_status_pending_review.sql")) failures.push("Missing status alignment migration");
for (const marker of ["ws-pro-column-toggle-pendiente", "ws-pro-action-pill-revision", "ws-pro-board-column-revision"]) {
  if (!css.includes(marker)) failures.push(`Missing board color/progressive CSS marker: ${marker}`);
}
if (failures.length) {
  console.error("[workspace:board-overlay:ready] FAIL");
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}
console.log("[workspace:board-overlay:ready] OK — board overlay, flexible columns and status schema alignment ready.");
