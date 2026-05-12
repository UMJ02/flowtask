#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const expectedVersion = "58.25.7-global-productivity-density-system-ui-scale-refactor";
const expectedRelease = "v58.25.7 Global Productivity Density System + UI Scale Refactor";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25.7");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25.7") failures.push("verify:current must target verify:v58.25.7");
if ((pkg.scripts ?? {})["verify:v58.25.7"] !== "node scripts/verify-v58.25.7.mjs") failures.push("verify:v58.25.7 script missing");
if ((pkg.scripts ?? {})["density:guard"] !== "node scripts/density-guard.mjs") failures.push("density:guard script missing");

requireFile("docs/release/V58_25_7_GLOBAL_PRODUCTIVITY_DENSITY_SYSTEM_UI_SCALE_REFACTOR.md");
requireFile("docs/qa/FLOWTASK_V58_25_7_GLOBAL_PRODUCTIVITY_DENSITY_SYSTEM_UI_SCALE_REFACTOR_QA.md");
requireFile("scripts/density-guard.mjs");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);

for (const token of [
  "v58.25.7 — Global Productivity Density System + UI Scale Refactor",
  "--ft-density-page-gap",
  "--ft-density-card-padding",
  "--ft-density-panel-padding",
  "--ft-density-control-height",
  "--ft-density-row-height",
  "--ft-density-title-page",
  ".ft-dashboard-screen",
  ".ft-projects-screen",
  ".ft-settings-screen",
  ".ft-notifications-ui-screen",
  ".ft-org-screen",
  ".board-inspector",
  ".ft-kanban-card"
]) {
  requireIncludes("src/app/globals.css", token);
}

requireIncludes("scripts/density-guard.mjs", "large Tailwind padding detected");
requireIncludes("scripts/density-guard.mjs", "heavy custom shadow detected");

if (failures.length) {
  console.error("[verify:v58.25.7] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25.7] OK — Global productivity density system aligned.");
