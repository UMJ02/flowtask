#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const failures = [];
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const page = fs.readFileSync(path.join(root, "src/components/workspace-pro/workspace-pro-page.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
const version = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");
const allowed = ["58.28.10-workspace-pro-no-motion-board-portal-home-colors", "58.28.11-workspace-pro-nav-shape-home-alignment", "58.28.12-workspace-pro-home-hero-solid-card-colors", "58.28.14-workspace-pro-component-split-runtime-slimdown"];
const allowedVerify = ["npm run verify:v58.28.10", "npm run verify:v58.28.11", "npm run verify:v58.28.12", "npm run verify:v58.28.14"];
if (!allowed.includes(pkg.version)) failures.push("Unexpected package version");
if (!allowedVerify.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target verify:v58.28.10+");
if (!allowed.some((item) => version.includes(item))) failures.push("version.ts must contain a v58.28.10+ compatible slug");
if (!page.includes("createPortal")) failures.push("Board actions must use portal rendering");
if (!css.includes(".ws-pro-view-switching")) failures.push("View switching override missing");
if (!css.includes("animation: none !important")) failures.push("Workspace no-motion override missing");
if (!css.includes("#0ea5e9") || !css.includes("#7c3aed") || !css.includes("#10b981")) failures.push("Home board color palette missing");
if (failures.length) { console.error("[workspace:no-motion-board-portal:ready] FAIL"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[workspace:no-motion-board-portal:ready] OK — no motion, board portal and Home board colors aligned.");
