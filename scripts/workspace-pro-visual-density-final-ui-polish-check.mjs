#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const requireIncludes = (rel, text) => {
  if (!read(rel).includes(text)) failures.push(`Expected ${JSON.stringify(text)} in ${rel}`);
};

const pkg = JSON.parse(read("package.json") || "{}");
if (pkg.version !== "58.27.8-workspace-pro-visual-density-final-ui-polish") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.27.8") failures.push("verify:current must target verify:v58.27.8");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:visual-density:ready")) failures.push("build:preflight must include workspace:visual-density:ready");

requireIncludes("src/lib/release/version.ts", "58.27.8-workspace-pro-visual-density-final-ui-polish");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "v58.27.8");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-header");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-content");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-tabs-strip");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-view-frame");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-clean-card");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-utility-dock");
requireIncludes("src/app/globals.css", "v58.27.8 — Workspace Pro Visual Density + Final UI Polish");
requireIncludes("src/app/globals.css", ".ws-pro-view-frame");
requireIncludes("src/app/globals.css", ".ws-pro-clean-card");
requireIncludes("src/app/globals.css", ".ws-pro-utility-dock");

if (failures.length) {
  console.error("[workspace:visual-density:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:visual-density:ready] OK — Workspace Pro visual density and final UI polish aligned.");
