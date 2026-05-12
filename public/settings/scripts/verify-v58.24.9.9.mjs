#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const expectedVersion = "58.24.9.9-visual-system-cleanup-apple-workspace-ui-polish";
const expectedRelease = "v58.24.9.9 Visual System Cleanup + Apple Workspace UI Polish";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9.9");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9.9") failures.push("verify:current must target verify:v58.24.9.9");
if ((pkg.scripts ?? {})["verify:v58.24.9.9"] !== "node scripts/verify-v58.24.9.9.mjs") failures.push("verify:v58.24.9.9 script must be available");

requireFile("scripts/verify-v58.24.9.9.mjs");
requireFile("docs/release/V58_24_9_9_VISUAL_SYSTEM_CLEANUP_APPLE_WORKSPACE_UI_POLISH.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_9_VISUAL_SYSTEM_CLEANUP_APPLE_WORKSPACE_UI_POLISH_QA.md");
requireFile("docs/design/FLOWTASK_VISUAL_SYSTEM_V58_24_9_9.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9.9");

requireIncludes("src/app/globals.css", "v58.24.9.9 Visual System Cleanup");
requireIncludes("src/app/globals.css", "--ft-apple-bg");
requireIncludes("src/app/globals.css", ".ft-apple-card");
requireIncludes("src/app/globals.css", ".ft-apple-panel");
requireIncludes("src/app/globals.css", ".ft-apple-button");
requireIncludes("src/app/globals.css", ".ft-apple-chip");
requireIncludes("src/app/globals.css", ".ft-skeleton-line");
requireIncludes("src/app/globals.css", "prefers-reduced-motion");

requireIncludes("src/app/(app)/app/tasks/page.tsx", "ft-apple-panel");
requireIncludes("src/app/(app)/app/tasks/page.tsx", "ft-apple-button-primary");
requireIncludes("src/components/tasks/task-trash-recovery.tsx", "ft-apple-panel");
requireIncludes("src/components/tasks/task-action-list.tsx", "ft-apple-panel");
requireIncludes("src/components/tasks/task-kanban-board.tsx", "ft-apple-panel");
requireIncludes("docs/design/FLOWTASK_VISUAL_SYSTEM_V58_24_9_9.md", "FlowTask OS");

if (failures.length) {
  console.error("[verify:v58.24.9.9] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9.9] OK — Visual system cleanup and Apple workspace UI polish aligned.");
