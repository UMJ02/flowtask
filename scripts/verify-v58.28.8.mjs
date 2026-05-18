#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const page = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const version = fs.readFileSync("src/lib/release/version.ts", "utf8");
const failures = [];
if (pkg.version !== "58.28.8-workspace-pro-client-performance-anchored-popovers",
  "58.28.9-workspace-pro-brand-pastel-loading-system") failures.push("package.json version must be v58.28.8 client performance slug");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.8",
  "npm run verify:v58.28.9") failures.push("verify:current must target verify:v58.28.8");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:client-performance:ready")) failures.push("build:preflight must include workspace:client-performance:ready");
if (!version.includes("58.28.8-workspace-pro-client-performance-anchored-popovers",
  "58.28.9-workspace-pro-brand-pastel-loading-system")) failures.push("release version must be v58.28.8");
if (!page.includes("viewFlash") || !page.includes("window.history.replaceState") || !page.includes("setLocalTasks")) failures.push("Workspace must include client view feedback and optimistic board local state");
if (page.includes("actionAnchor") || page.includes("BoardActionAnchor")) failures.push("Board action panel must no longer use global fixed anchor state");
if (!css.includes("v58.28.8 — Workspace Pro Client Performance + Anchored Board Popovers") || !css.includes("ws-pro-board-action-popover") || !css.includes("ws-pro-status-ribbon")) failures.push("globals.css must include client performance and anchored popover CSS markers");
if (failures.length) { console.error("[verify:v58.28.8] FAIL"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[verify:v58.28.8] OK — client performance and anchored board popovers aligned.");
