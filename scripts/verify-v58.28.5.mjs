#!/usr/bin/env node
import fs from "node:fs";

const failures = [];
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = fs.readFileSync("src/lib/release/version.ts", "utf8");
const nav = fs.readFileSync("src/components/layout/nav-links.ts", "utf8");
const appSidebar = fs.readFileSync("src/components/layout/app-sidebar.tsx", "utf8");
const workspace = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");

if (pkg.version !== "58.28.5-workspace-pro-brand-accent-pro-navigation-identity",
  "58.28.6-workspace-pro-completed-filter-anchored-actions",
  "58.28.7-workspace-pro-performance-pass-fast-view-switching") failures.push("package.json version must be v58.28.5 brand accent slug");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.5",
  "npm run verify:v58.28.6",
  "npm run verify:v58.28.7") failures.push("verify:current must target verify:v58.28.5");
if (!version.includes("58.28.5-workspace-pro-brand-accent-pro-navigation-identity",
  "58.28.6-workspace-pro-completed-filter-anchored-actions",
  "58.28.7-workspace-pro-performance-pass-fast-view-switching")) failures.push("release version must be v58.28.5");
if (!nav.includes("Crown") || !nav.includes("isPro: true")) failures.push("Workspace Pro nav must use Crown icon and isPro marker");
if (!appSidebar.includes("ft-app-nav-pro") || !appSidebar.includes(">Pro<")) failures.push("App sidebar must render Pro visual treatment and badge");
if (!workspace.includes("ws-pro-brand-mark") || !workspace.includes("FlowTask Pro") || !workspace.includes("ws-pro-status-dot-pro")) failures.push("Workspace Pro shell must include pro brand marker and pro status pill");
if (!css.includes("v58.28.5 — Workspace Pro Brand Accent + Pro Navigation Identity")) failures.push("globals.css must include v58.28.5 brand accent layer");
if (!css.includes(".ft-app-nav-pro-active") || !css.includes(".ws-pro-brand-mark")) failures.push("brand accent CSS selectors are missing");

if (failures.length) {
  console.error("[verify:v58.28.5] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[verify:v58.28.5] OK — Workspace Pro brand accent and navigation identity aligned.");
