#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const pkg = JSON.parse(read("package.json") || "{}");

const required = [
  ["package.json", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
  ["package.json", "verify:v58.27.8.1"],
  ["src/lib/release/version.ts", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
  ["src/lib/release/version.ts", "v58.27.8.1 Workspace Pro Vercel Readiness Hotfix"],
  ["scripts/workspace-production-readiness-check.mjs", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
  ["scripts/workspace-real-environment-hardening-check.mjs", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
  ["scripts/workspace-performance-readiness-check.mjs", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
  ["scripts/workspace-notifications-automation-readiness-check.mjs", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
  ["scripts/workspace-collaboration-share-readiness-check.mjs", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
  ["scripts/workspace-error-recovery-final-qa-check.mjs", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
  ["scripts/workspace-release-candidate-readiness-check.mjs", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
  ["scripts/workspace-release-candidate-fixes-check.mjs", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
  ["scripts/build-deploy-readiness.mjs", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
  ["scripts/deploy-production-readiness.mjs", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
  ["scripts/workspace-pro-visual-density-final-ui-polish-check.mjs", "58.27.8.1-workspace-pro-vercel-readiness-hotfix"],
];

if (pkg.version !== "58.27.8.1-workspace-pro-vercel-readiness-hotfix") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.27.8.1") failures.push("verify:current must target verify:v58.27.8.1");
for (const [rel, marker] of required) {
  if (!read(rel).includes(marker)) failures.push(`Expected ${JSON.stringify(marker)} in ${rel}`);
}
for (const script of [
  "workspace:production:ready",
  "workspace:real-env:ready",
  "workspace:performance:ready",
  "workspace:automation:ready",
  "workspace:collaboration:ready",
  "workspace:error-recovery:ready",
  "workspace:release-candidate:ready",
  "workspace:rc-fixes:ready",
  "deploy:readiness",
  "deploy:production:ready",
  "workspace:visual-density:ready",
]) {
  const command = pkg.scripts?.[script] ?? "";
  if (!command) failures.push(`Missing ${script} script`);
}

if (failures.length) {
  console.error("[verify:v58.27.8.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.27.8.1] OK — Vercel readiness hotfix aligned for Workspace Pro visual density.");
