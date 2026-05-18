#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = fs.readFileSync("src/lib/release/version.ts", "utf8");
const page = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const failures = [];
if (pkg.version !== "58.28.6-workspace-pro-completed-filter-anchored-actions",
  "58.28.7-workspace-pro-performance-pass-fast-view-switching") failures.push("package.json version must be v58.28.6 completed filter slug");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.6",
  "npm run verify:v58.28.7") failures.push("verify:current must target verify:v58.28.6");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:board-active-actions:ready")) failures.push("build:preflight must include workspace:board-active-actions:ready");
if (!version.includes("58.28.6-workspace-pro-completed-filter-anchored-actions",
  "58.28.7-workspace-pro-performance-pass-fast-view-switching")) failures.push("release version must be v58.28.6");
if (!page.includes("activeTasks") || !page.includes("hiddenDoneCount") || !page.includes("!isDone(task.status)")) failures.push("Workspace must filter completed tasks out of active views");
if (!page.includes("BoardActionAnchor") || !page.includes("openTaskActions") || !page.includes("anchor.top") || !page.includes("anchor.left")) failures.push("Board action panel must be anchored to selected task button");
if (!css.includes("v58.28.6 — Workspace Pro Active Views + Anchored Board Actions")) failures.push("globals.css must include v58.28.6 CSS layer");
if (failures.length) { console.error("[verify:v58.28.6] FAIL"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[verify:v58.28.6] OK — completed task filter and anchored board actions aligned.");
