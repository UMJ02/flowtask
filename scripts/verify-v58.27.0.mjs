#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.27.0-client-final-release-candidate";
const expectedRelease = "v58.27.0 Client Final Release Candidate";

const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== expectedVersion) failures.push(`package version must be ${expectedVersion}`);
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.27.0") failures.push("verify:current must target verify:v58.27.0");
if ((pkg.scripts ?? {})["workspace:release-candidate:ready"] !== "node scripts/workspace-release-candidate-readiness-check.mjs") failures.push("workspace:release-candidate:ready script missing");

for (const rel of [
  "scripts/verify-v58.27.0.mjs",
  "scripts/workspace-release-candidate-readiness-check.mjs",
  "docs/release/V58_27_0_CLIENT_FINAL_RELEASE_CANDIDATE.md",
  "docs/qa/FLOWTASK_V58_27_0_CLIENT_FINAL_RELEASE_CANDIDATE_QA.md",
  "docs/qa/FLOWTASK_V58_27_0_CLIENT_FINAL_RELEASE_CHECKLIST.md",
  "docs/release/FLOWTASK_MASTER_CONTEXT_V58_27_0.md",
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
requireIncludes("README.md", "v58.27.0 — Client Final Release Candidate");
requireIncludes("src/app/globals.css", "v58.27.0 — Client Final Release Candidate");
requireIncludes("package.json", "workspace:release-candidate:ready");

if (failures.length) {
  console.error("[verify:v58.27.0] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.27.0] OK — Client Final Release Candidate aligned.");
