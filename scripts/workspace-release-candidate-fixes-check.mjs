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
if (scripts["workspace:rc-fixes:ready"] !== "node scripts/workspace-release-candidate-fixes-check.mjs") failures.push("workspace:rc-fixes:ready script missing");
if (!String(scripts["build:preflight"] ?? "").includes("workspace:rc-fixes:ready")) failures.push("build:preflight must include workspace:rc-fixes:ready");

for (const rel of [
  "scripts/verify-v58.27.1.mjs",
  "scripts/workspace-release-candidate-readiness-check.mjs",
  "scripts/workspace-release-candidate-fixes-check.mjs",
  "docs/release/V58_27_1_RELEASE_CANDIDATE_FIXES.md",
  "docs/qa/FLOWTASK_V58_27_1_RELEASE_CANDIDATE_FIXES_QA.md",
  "docs/qa/FLOWTASK_V58_27_1_RELEASE_CANDIDATE_FIXES_CHECKLIST.md",
  "docs/release/FLOWTASK_MASTER_CONTEXT_V58_27_1.md",
  "src/app/(app)/app/workspace/page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/components/workspace-system/workspace-command-center.tsx",
  "src/components/workspace-system/workspace-share-panel.tsx",
  "src/components/workspace-system/workspace-recovery-panel.tsx",
  "src/components/workspace-system/views/home-view.tsx",
  "src/lib/workspace-system/performance.ts",
]) requireFile(rel);

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.27.1 — Release Candidate Fixes");
requireIncludes("src/app/globals.css", "v58.27.1 — Release Candidate Fixes");
requireIncludes("docs/qa/FLOWTASK_V58_27_1_RELEASE_CANDIDATE_FIXES_CHECKLIST.md", "workspace:rc-fixes:ready");
requireIncludes("docs/release/FLOWTASK_MASTER_CONTEXT_V58_27_1.md", "Workspace-First");

if (failures.length) {
  console.error("[workspace:rc-fixes:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:rc-fixes:ready] OK — Release Candidate Fixes aligned.");
