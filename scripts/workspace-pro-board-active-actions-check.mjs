#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const page = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const failures = [];
const allowedVersions = [
  "58.28.6-workspace-pro-completed-filter-anchored-actions",
  "58.28.7-workspace-pro-performance-pass-fast-view-switching",
  "58.28.8-workspace-pro-client-performance-anchored-popovers",
  "58.28.9-workspace-pro-brand-pastel-loading-system",
  "58.28.10-workspace-pro-no-motion-board-portal-home-colors",
  "58.28.11-workspace-pro-nav-shape-home-alignment",
  "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.13-workspace-pro-final-cleanup-audit-safe-dead-surface-removal",
  "58.28.10-workspace-pro-no-motion-board-portal-home-colors",
  "58.28.11-workspace-pro-nav-shape-home-alignment",
  "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.13-workspace-pro-final-cleanup-audit-safe-dead-surface-removal",
];
const allowedVerifyTargets = ["npm run verify:v58.28.6", "npm run verify:v58.28.7",
  "npm run verify:v58.28.8",
  "npm run verify:v58.28.9",
  "npm run verify:v58.28.10", "npm run verify:v58.28.11", "npm run verify:v58.28.12", "npm run verify:v58.28.13"];
if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target verify:v58.28.6 or verify:v58.28.7");
for (const marker of ["activeTasks", "hiddenDoneCount", "activeBoardColumns", "openTaskActions", "ws-pro-board-action-popover"]) { if (!page.includes(marker)) failures.push(`Missing board active action marker: ${marker}`); }
for (const marker of ["ws-pro-board-grid { width: 100%", "ws-pro-column-toggle-produccion.is-active"]) { if (!css.includes(marker)) failures.push(`Missing CSS marker: ${marker}`); }
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:board-active-actions:ready")) failures.push("build:preflight must include workspace:board-active-actions:ready");
if (failures.length) { console.error("[workspace:board-active-actions:ready] FAIL"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[workspace:board-active-actions:ready] OK — completed tasks hidden and board action panel anchored.");
