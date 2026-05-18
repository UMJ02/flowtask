#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
const page = fs.readFileSync(path.join(root, "src/components/workspace-pro/workspace-pro-page.tsx"), "utf8");
const version = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");

if (pkg.version !== "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.14-workspace-pro-component-split-runtime-slimdown") failures.push("Unexpected package version");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.12", "npm run verify:v58.28.14") failures.push("verify:current must target verify:v58.28.12");
if (!version.includes("58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.14-workspace-pro-component-split-runtime-slimdown")) failures.push("version.ts must contain v58.28.12 slug");
if (!css.includes("v58.28.12 — Workspace Pro Home Hero + Solid Card Colors")) failures.push("v58.28.12 CSS block missing");
if (!css.includes("grid-template-columns: minmax(22rem, 1fr) auto")) failures.push("Home hero desktop alignment missing");
if (!css.includes(".ws-pro-card-tone-blue") || !css.includes(".ws-pro-card-tone-amber") || !css.includes(".ws-pro-card-tone-violet") || !css.includes(".ws-pro-card-tone-emerald")) failures.push("Solid card tone classes missing");
if (!page.includes('className="ws-pro-card-tone-blue"') || !page.includes('className="ws-pro-card-tone-amber"') || !page.includes('className="ws-pro-card-tone-violet"') || !page.includes('className="ws-pro-card-tone-emerald"')) failures.push("Home cards must use distributed solid tones");

if (failures.length) {
  console.error("[v58.28.12] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[v58.28.12] OK — Home hero alignment and solid card colors are aligned.");
