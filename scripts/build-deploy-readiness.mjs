#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.8.5-workspace-full-screen-shell-navigation-polish";

function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : ""; }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function requireNotIncludes(rel, text) { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); }

for (const rel of [
  "package.json",
  "package-lock.json",
  "vercel.json",
  "next.config.ts",
  ".nvmrc",
  ".env.example",
  "scripts/runtime-check.mjs",
  "scripts/validate-env.mjs",
  "scripts/design-doctor.mjs",
  "scripts/density-guard.mjs",
  "scripts/verify-v58.25.8.5.mjs",
  "docs/release/V58_25_8_5_WORKSPACE_FULL_SCREEN_SHELL_NAVIGATION_POLISH.md",
  "docs/qa/FLOWTASK_V58_25_8_5_WORKSPACE_FULL_SCREEN_SHELL_NAVIGATION_POLISH_QA.md",
  "src/components/boards/boards-home.tsx",
  "src/components/notifications/notifications-command-center.tsx",
  "src/app/(app)/app/workspace/page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/components/workspace-system/workspace-sidebar-pro.tsx",
  "src/components/workspace-system/workspace-view-tabs.tsx",
  "src/components/workspace-system/views/list-view.tsx",
  "src/components/workspace-system/views/board-view.tsx",
  "src/components/workspace-system/views/timeline-view.tsx",
  "src/components/workspace-system/views/table-view.tsx",
  "src/components/workspace-system/views/canvas-view.tsx",
  "src/components/workspace-system/views/reports-view.tsx",
  "src/app/globals.css"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.25.8.5") failures.push("verify:current must target verify:v58.25.8.5");
if (scripts["verify:v58.25.8.5"] !== "node scripts/verify-v58.25.8.5.mjs") failures.push("verify:v58.25.8.5 must target scripts/verify-v58.25.8.5.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/components/boards/boards-home.tsx", "board-home-hero-compact-actions");
requireIncludes("src/components/boards/boards-home.tsx", "board-home-create-preview-red");
requireIncludes("src/components/notifications/notifications-command-center.tsx", "ft-notifications-hero-balanced");
requireIncludes("src/app/globals.css", "v58.25.8.5 Workspace Full-Screen Shell + Navigation Polish");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getTasks({ includeCompleted: true })");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceIdentity()");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "invalidProjectId");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Espacios reales");
requireIncludes("src/components/workspace-system/workspace-view-tabs.tsx", "router.replace(`/app/workspace?");

if (failures.length) {
  console.error("[build-deploy-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[build-deploy-readiness] OK — v58.25.8.5 workspace full-screen shell + navigation polish readiness aligned.");
