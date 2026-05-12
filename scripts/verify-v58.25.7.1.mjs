#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.25.7.1-deep-density-component-refactor-hardcoded-style-cleanup";
const expectedRelease = "v58.25.7.1 Deep Density Component Refactor + Hardcoded Style Cleanup";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.7.1");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.7.1") failures.push("verify:current must target verify:v58.25.7.1");
if ((pkg.scripts ?? {})["verify:v58.25.7.1"] !== "node scripts/verify-v58.25.7.1.mjs") failures.push("verify:v58.25.7.1 script missing");
if ((pkg.scripts ?? {})["density:guard:strict"] !== "node scripts/density-guard.mjs --strict") failures.push("density:guard:strict script missing");

requireFile("docs/release/V58_25_7_1_DEEP_DENSITY_COMPONENT_REFACTOR_HARDCODED_STYLE_CLEANUP.md");
requireFile("docs/qa/FLOWTASK_V58_25_7_1_DEEP_DENSITY_COMPONENT_REFACTOR_HARDCODED_STYLE_CLEANUP_QA.md");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("scripts/density-guard.mjs", "process.argv.includes(\"--strict\")");

for (const rel of [
  "src/components/dashboard/interactive-dashboard-board.tsx",
  "src/components/clients/client-manager-panel.tsx",
  "src/components/boards/properties-panel.tsx",
  "src/components/workspace/workspace-home.tsx",
  "src/components/tasks/task-action-list.tsx",
  "src/components/tasks/task-form.tsx",
  "src/components/projects/project-planning-timeline.tsx",
  "src/components/projects/project-detail-pro.tsx",
  "src/components/notifications/notifications-live-panel.tsx",
  "src/components/organization/organization-members-panel.tsx"
]) {
  requireFile(rel);
  requireNotIncludes(rel, "rounded-[24px]");
  requireNotIncludes(rel, "rounded-[28px]");
  requireNotIncludes(rel, "rounded-[34px]");
  requireNotIncludes(rel, "p-6");
  requireNotIncludes(rel, "px-6");
  requireNotIncludes(rel, "py-6");
  requireNotIncludes(rel, "shadow-[");
}

if (failures.length) {
  console.error("[verify:v58.25.7.1] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.7.1] OK — Deep density component refactor aligned.");
