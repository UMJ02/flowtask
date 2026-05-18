#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const failures = [];
if (!["58.28.3-workspace-pro-user-language-timeline-flow", "58.28.4-workspace-pro-board-overlay-status-alignment",
  "58.28.5-workspace-pro-brand-accent-pro-navigation-identity",
  "58.28.6-workspace-pro-completed-filter-anchored-actions",
  "58.28.7-workspace-pro-performance-pass-fast-view-switching",
  "58.28.8-workspace-pro-client-performance-anchored-popovers",
  "58.28.9-workspace-pro-brand-pastel-loading-system",
  "58.28.10-workspace-pro-no-motion-board-portal-home-colors",
  "58.28.11-workspace-pro-nav-shape-home-alignment",
  "58.28.12-workspace-pro-home-hero-solid-card-colors"].includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!["npm run verify:v58.28.3", "npm run verify:v58.28.4", "npm run verify:v58.28.5",
  "npm run verify:v58.28.6",
  "npm run verify:v58.28.7",
  "npm run verify:v58.28.8",
  "npm run verify:v58.28.9",
  "npm run verify:v58.28.10", "npm run verify:v58.28.11", "npm run verify:v58.28.12"].includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target the active v58.28.x verify script");
const page = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const spaces = fs.readFileSync("src/components/workspace-system/workspace-spaces-manager.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
if (page.includes("Usá ⋯")) failures.push("Board cards must not include robotic helper text.");
if (page.includes("Arrastrá para actualizar estado")) failures.push("Board column helper text must be removed.");
if (page.includes("Production UX Final")) failures.push("Production QA banner must not be visible in Workspace Home.");
if (!page.includes("ws-pro-task-editor-inline-row")) failures.push("Task editor must use one inline action row.");
if (!page.includes("ws-pro-timeline-row")) failures.push("Timeline must use the improved timeline rows.");
if (spaces.includes("Diagnóstico técnico") || spaces.includes("Migration Guard")) failures.push("Spaces UI must not expose technical diagnostics.");
if (!css.includes("v58.28.3 — Workspace Pro User Language + Timeline Flow") && !css.includes("v58.28.4 — Workspace Pro Board Overlay + Status Schema Alignment")) failures.push("Missing active Workspace Pro CSS marker.");
if (failures.length) {
  console.error("[workspace:user-language:ready] FAIL");
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}
console.log("[workspace:user-language:ready] OK — user-facing copy, task editor and timeline flow aligned.");
