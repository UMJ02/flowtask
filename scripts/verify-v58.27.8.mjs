#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const pkg = JSON.parse(read("package.json") || "{}");

if (pkg.version !== "58.27.8-workspace-pro-visual-density-final-ui-polish", "58.27.8.1-workspace-pro-vercel-readiness-hotfix") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.27.8", "npm run verify:v58.27.8.1") failures.push("verify:current must target verify:v58.27.8");
if (pkg.scripts?.["workspace:visual-density:ready"] !== "node scripts/workspace-pro-visual-density-final-ui-polish-check.mjs") failures.push("Missing workspace:visual-density:ready script");

const required = [
  ["src/lib/release/version.ts", "v58.27.8 Workspace Pro Visual Density + Final UI Polish"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-utility-dock"],
  ["src/components/workspace-pro/workspace-pro-page.tsx", "max-w-[1440px]"],
  ["src/app/globals.css", "ws-pro-content"],
  ["src/app/globals.css", "ws-pro-tabs-strip"],
  ["docs/release/V58_27_8_WORKSPACE_PRO_VISUAL_DENSITY_FINAL_UI_POLISH.md", "v58.27.8"],
  ["docs/qa/FLOWTASK_V58_27_8_WORKSPACE_PRO_VISUAL_DENSITY_FINAL_UI_POLISH_QA.md", "v58.27.8"],
];
for (const [rel, text] of required) {
  if (!read(rel).includes(text)) failures.push(`Expected ${JSON.stringify(text)} in ${rel}`);
}

if (failures.length) {
  console.error("[verify:v58.27.8] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.27.8] OK — Workspace Pro visual density and final UI polish aligned.");
