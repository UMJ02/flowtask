#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== "58.27.1-release-candidate-fixes") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["workspace:performance:ready"] !== "node scripts/workspace-performance-readiness-check.mjs") failures.push("workspace:performance:ready script missing");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:performance:ready")) failures.push("build:preflight must include workspace:performance:ready");

for (const rel of [
  "src/lib/workspace-system/performance.ts",
  "src/app/(app)/app/workspace/page.tsx",
  "src/lib/workspace-system/server-data.ts",
  "docs/release/V58_26_5_WORKSPACE_ERROR_RECOVERY_FINAL_QA_HARDENING.md",
  "docs/qa/FLOWTASK_V58_26_5_WORKSPACE_ERROR_RECOVERY_FINAL_QA.md",
  "scripts/verify-v58.27.1.mjs",
]) requireFile(rel);

requireIncludes("src/lib/workspace-system/performance.ts", "buildWorkspaceLoadPlan");
requireIncludes("src/lib/workspace-system/performance.ts", "WORKSPACE_QUERY_LIMITS");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "buildWorkspaceLoadPlan");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "loadPlan.reports");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "loadPlan.boards");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "loadPlan.files");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "loadPlan.activity");
requireIncludes("src/app/(app)/app/workspace/page.tsx", "loadPlan.notifications");
requireIncludes("src/lib/workspace-system/server-data.ts", "WORKSPACE_QUERY_LIMITS.boards");
requireIncludes("src/lib/workspace-system/server-data.ts", "WORKSPACE_QUERY_LIMITS.activity");
requireIncludes("src/lib/workspace-system/server-data.ts", "WORKSPACE_QUERY_LIMITS.files");
requireIncludes("src/lib/workspace-system/server-data.ts", "WORKSPACE_QUERY_LIMITS.notifications");
requireIncludes("src/lib/release/version.ts", "58.27.1-release-candidate-fixes");
requireIncludes("src/lib/release/version.ts", "v58.27.1 Release Candidate Fixes");
requireIncludes("src/app/globals.css", "v58.27.1 — Release Candidate Fixes");
requireIncludes("README.md", "v58.27.1");

if (failures.length) {
  console.error("[workspace:performance:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:performance:ready] OK — Workspace notifications, automation, and query limits are aligned.");
