#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
const version = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");

if (!["58.28.11-workspace-pro-nav-shape-home-alignment", "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.13-workspace-pro-final-cleanup-audit-safe-dead-surface-removal"].includes(pkg.version)) failures.push("Unexpected package version");
if (!["npm run verify:v58.28.11", "npm run verify:v58.28.12", "npm run verify:v58.28.13"].includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target verify:v58.28.11");
if (!version.includes("58.28.11-workspace-pro-nav-shape-home-alignment") && !version.includes("58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.13-workspace-pro-final-cleanup-audit-safe-dead-surface-removal")) failures.push("version.ts must contain v58.28.11 slug");
if (!css.includes("v58.28.11 — Workspace Pro Nav Shape + Home Alignment")) failures.push("v58.28.11 CSS block missing");
if (!css.includes(".ws-pro-home-summary") || !css.includes("grid-template-columns: minmax(0, 1fr) auto")) failures.push("Home alignment override missing");
if (!css.includes(".ws-pro-tabs-strip .ws-pro-tab-active") || !css.includes("border-radius: 999px")) failures.push("Nav pill shape override missing");

if (failures.length) {
  console.error("[v58.28.11] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[v58.28.11] OK — nav pill shape and Home alignment are production aligned.");
