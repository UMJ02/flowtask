#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const page = fs.readFileSync(path.join(root, "src/components/workspace-pro/workspace-pro-page.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
const version = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");

if (pkg.version !== "58.28.10-workspace-pro-no-motion-board-portal-home-colors") failures.push("Unexpected package version");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.10") failures.push("verify:current must target verify:v58.28.10");
if (!version.includes("58.28.10-workspace-pro-no-motion-board-portal-home-colors")) failures.push("version.ts must contain v58.28.10 slug");
if (!page.includes("createPortal")) failures.push("Board action panel must render through createPortal");
if (!page.includes("openActionAnchor")) failures.push("Board action anchor state is missing");
if (page.includes("Actualizando vista")) failures.push("Actualizando vista UI must be removed");
if (!css.includes("v58.28.10 — Workspace Pro No Motion + Board Portal + Home Board Colors")) failures.push("v58.28.10 CSS block missing");

if (failures.length) {
  console.error("[v58.28.10] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[v58.28.10] OK — no motion, board portal and Home board colors aligned.");
