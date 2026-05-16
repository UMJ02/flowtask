#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected ${JSON.stringify(text)} in ${rel}`); };
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing ${rel}`); };

const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== "58.27.2-workspace-pro-design-reset-enterprise-ui-system") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.27.2") failures.push("verify:current must target verify:v58.27.2");
if (pkg.scripts?.["workspace:design-reset:ready"] !== "node scripts/workspace-pro-design-reset-check.mjs") failures.push("workspace:design-reset:ready script missing");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:design-reset:ready")) failures.push("build:preflight must include workspace:design-reset:ready");

for (const rel of [
  "scripts/verify-v58.27.2.mjs",
  "scripts/workspace-pro-design-reset-check.mjs",
  "src/components/workspace-pro/workspace-pro-page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "docs/release/V58_27_2_WORKSPACE_PRO_DESIGN_RESET_ENTERPRISE_UI_SYSTEM.md",
  "docs/qa/FLOWTASK_V58_27_2_WORKSPACE_PRO_DESIGN_RESET_QA.md",
]) requireFile(rel);

requireIncludes("src/lib/release/version.ts", "v58.27.2 Workspace Pro Design Reset + Enterprise UI System");
requireIncludes("src/lib/release/version.ts", "APP_RELEASE_STAGE");
requireIncludes("package-lock.json", "58.27.2-workspace-pro-design-reset-enterprise-ui-system");
requireIncludes("README.md", "v58.27.2 — Workspace Pro Design Reset + Enterprise UI System");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "Workspace Pro");
requireIncludes("src/app/globals.css", "ws-pro-tab-active");

if (failures.length) {
  console.error("[verify:v58.27.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.27.2] OK — Workspace Pro Design Reset + Enterprise UI System aligned.");
