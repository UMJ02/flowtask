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
  "58.28.13-workspace-pro-final-cleanup-audit-safe-dead-surface-removal",
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
