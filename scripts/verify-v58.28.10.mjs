#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const page = fs.readFileSync(path.join(root, "src/components/workspace-pro/workspace-pro-page.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
const version = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");

if (!["58.28.10-workspace-pro-no-motion-board-portal-home-colors", "58.28.11-workspace-pro-nav-shape-home-alignment", "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.15-workspace-pro-deep-component-extraction-lazy-view-loading",
  "58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity"].includes(pkg.version)) failures.push("Unexpected package version");
if (!["npm run verify:v58.28.10", "npm run verify:v58.28.11", "npm run verify:v58.28.12", "npm run verify:v58.28.15", "npm run verify:v58.28.16", "npm run verify:v58.28.16.1", "npm run verify:v58.28.16.2"].includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target verify:v58.28.10");
if (!version.includes("58.28.10-workspace-pro-no-motion-board-portal-home-colors") && !version.includes("58.28.11-workspace-pro-nav-shape-home-alignment") && !version.includes("58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.15-workspace-pro-deep-component-extraction-lazy-view-loading",
  "58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity")) failures.push("version.ts must contain a v58.28.10+ compatible slug");
if (!page.includes("createPortal")) failures.push("Board action panel must render through createPortal");
if (!page.includes("openActionAnchor")) failures.push("Board action anchor state is missing");
if (page.includes("Actualizando vista")) failures.push("Actualizando vista UI must be removed");
if (!css.includes("v58.28.10 — Workspace Pro No Motion + Board Portal + Home Board Colors")) failures.push("v58.28.10 CSS block missing");

if (failures.length) {
  console.error("[v58.28.10] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[v58.28.10] OK — no motion, board portal and Home board colors aligned.");
