#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.25.8.9-workspace-activity-timeline-files-upload-entry-polish";

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
  "scripts/verify-v58.25.8.9.mjs",
  "docs/release/V58_25_8_9_WORKSPACE_ACTIVITY_TIMELINE_FILES_UPLOAD_ENTRY_POLISH.md",
  "docs/qa/FLOWTASK_V58_25_8_9_WORKSPACE_ACTIVITY_TIMELINE_FILES_UPLOAD_ENTRY_POLISH_QA.md",
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
  "src/components/workspace-system/views/files-view.tsx",
  "src/app/globals.css"
]) requireFile(rel);

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (scripts["verify:current"] !== "npm run verify:v58.25.8.9") failures.push("verify:current must target verify:v58.25.8.9");
if (scripts["verify:v58.25.8.9"] !== "node scripts/verify-v58.25.8.9.mjs") failures.push("verify:v58.25.8.9 must target scripts/verify-v58.25.8.9.mjs");

const vercel = JSON.parse(read("vercel.json"));
if (vercel.framework !== "nextjs") failures.push("vercel.json framework must be nextjs");
if (vercel.buildCommand !== "npm run vercel:build") failures.push("vercel.json buildCommand must be npm run vercel:build");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/components/boards/boards-home.tsx", "board-home-hero-compact-actions");
requireIncludes("src/components/boards/boards-home.tsx", "board-home-create-preview-red");
requireIncludes("src/components/notifications/notifications-command-center.tsx", "ft-notifications-hero-balanced");
requireIncludes("src/app/globals.css", "v58.25.8.9 Workspace Activity Timeline + Files Upload Entry Polish");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getTasks({ includeCompleted: true })");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceIdentity()");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "invalidProjectId");
requireIncludes("src/components/workspace-system/workspace-sidebar-pro.tsx", "Espacios reales");
requireIncludes("src/components/workspace-system/workspace-view-tabs.tsx", "router.replace(`/app/workspace?");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceActivity");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "getWorkspaceFiles");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "Línea de actividad");
requireIncludes("src/components/workspace-system/views/files-view.tsx", "Adjuntos recientes");
requireIncludes("src/components/workspace-system/views/files-view.tsx", "WorkspaceFilesUploadEntry");
requireFile("src/components/workspace-system/workspace-files-upload-entry.tsx");
requireFile("src/components/workspace-system/workspace-activity-timeline.tsx");
requireIncludes("src/components/workspace-system/workspace-right-panel.tsx", "WorkspaceActivityTimeline");
requireIncludes("src/components/workspace-system/workspace-files-upload-entry.tsx", `supabase.storage.from("attachments").upload`);
requireIncludes("src/components/workspace-system/workspace-files-upload-entry.tsx", `supabase.from("attachments").insert`);
requireIncludes("src/app/globals.css", "ft-ws-upload-entry");
requireIncludes("src/app/globals.css", "ft-ws-activity-timeline");
requireIncludes("src/app/globals.css", "ft-ws-file-card");


if (failures.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK — v58.25.8.9 workspace activity timeline + files upload entry polish readiness aligned.");
