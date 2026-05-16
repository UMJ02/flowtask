#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.27.1-release-candidate-fixes";
const expectedRelease = "v58.27.1 Release Candidate Fixes";

const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json") || "{}");
const scripts = pkg.scripts ?? {};

if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if (scripts["verify:current"] !== "npm run verify:v58.27.1") failures.push("verify:current must target verify:v58.27.1");
if (scripts["verify:v58.27.1"] !== "node scripts/verify-v58.27.1.mjs") failures.push("verify:v58.27.1 script missing");
if (scripts["workspace:release-candidate:ready"] !== "node scripts/workspace-release-candidate-readiness-check.mjs") failures.push("workspace:release-candidate:ready script missing");
if (!String(scripts["build:preflight"] ?? "").includes("workspace:release-candidate:ready")) failures.push("build:preflight must include workspace:release-candidate:ready");

for (const rel of [
  "src/app/(app)/app/workspace/page.tsx",
  "src/app/(app)/app/workspace/error.tsx",
  "src/app/(app)/app/workspace/loading.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/components/workspace-system/workspace-sidebar-pro.tsx",
  "src/components/workspace-system/workspace-context-header.tsx",
  "src/components/workspace-system/workspace-view-tabs.tsx",
  "src/components/workspace-system/workspace-right-panel.tsx",
  "src/components/workspace-system/workspace-command-center.tsx",
  "src/components/workspace-system/workspace-empty-state.tsx",
  "src/components/workspace-system/workspace-recovery-panel.tsx",
  "src/components/workspace-system/workspace-share-panel.tsx",
  "src/components/workspace-system/workspace-saved-views-manager.tsx",
  "src/components/workspace-system/workspace-spaces-manager.tsx",
  "src/components/workspace-system/workspace-members-permissions.tsx",
  "src/components/workspace-system/views/home-view.tsx",
  "src/components/workspace-system/views/list-view.tsx",
  "src/components/workspace-system/views/board-view.tsx",
  "src/components/workspace-system/views/timeline-view.tsx",
  "src/components/workspace-system/views/table-view.tsx",
  "src/components/workspace-system/views/canvas-view.tsx",
  "src/components/workspace-system/views/files-view.tsx",
  "src/components/workspace-system/views/reports-view.tsx",
  "src/lib/workspace-system/server-data.ts",
  "src/lib/workspace-system/performance.ts",
  "src/lib/workspace-system/view-state.ts",
  "src/lib/workspace-system/adapters.ts",
  "supabase/migrations/0056_v58_25_9_workspace_persistence_foundation.sql",
  "supabase/migrations/0057_v58_25_9_4_workspace_space_project_assignments.sql",
  "supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql",
  "supabase/migrations/0059_v58_26_1_workspace_real_environment_hardening.sql",
  "scripts/workspace-persistence-doctor.mjs",
  "scripts/workspace-production-readiness-check.mjs",
  "scripts/workspace-real-environment-hardening-check.mjs",
  "scripts/workspace-performance-readiness-check.mjs",
  "scripts/workspace-notifications-automation-readiness-check.mjs",
  "scripts/workspace-collaboration-share-readiness-check.mjs",
  "scripts/workspace-error-recovery-final-qa-check.mjs",
  "scripts/workspace-release-candidate-readiness-check.mjs",
  "docs/release/V58_27_1_RELEASE_CANDIDATE_FIXES.md",
  "docs/qa/FLOWTASK_V58_27_1_RELEASE_CANDIDATE_FIXES_QA.md",
  "docs/qa/FLOWTASK_V58_27_1_RELEASE_CANDIDATE_FIXES_CHECKLIST.md",
  "docs/release/FLOWTASK_MASTER_CONTEXT_V58_27_1.md",
]) requireFile(rel);

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.27.1");
requireIncludes("src/app/globals.css", "v58.27.1 — Release Candidate Fixes");
requireIncludes("docs/qa/FLOWTASK_V58_27_1_RELEASE_CANDIDATE_FIXES_CHECKLIST.md", "/app/workspace");
requireIncludes("docs/qa/FLOWTASK_V58_27_1_RELEASE_CANDIDATE_FIXES_CHECKLIST.md", "/app/tasks");
requireIncludes("docs/qa/FLOWTASK_V58_27_1_RELEASE_CANDIDATE_FIXES_CHECKLIST.md", "workspace_spaces");
requireIncludes("docs/qa/FLOWTASK_V58_27_1_RELEASE_CANDIDATE_FIXES_CHECKLIST.md", "safe_delete_visual_board");
requireIncludes("docs/release/FLOWTASK_MASTER_CONTEXT_V58_27_1.md", "Workspace-First");
requireIncludes("docs/release/FLOWTASK_MASTER_CONTEXT_V58_27_1.md", "v58.27.1");

if (failures.length) {
  console.error("[workspace:release-candidate:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:release-candidate:ready] OK — Release Candidate Fixes aligned.");
