#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const page = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const version = fs.readFileSync("src/lib/release/version.ts", "utf8");
const failures = [];
if (pkg.version !== "58.28.7-workspace-pro-performance-pass-fast-view-switching") failures.push("package.json version must be v58.28.7 performance pass slug");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.7",
  "npm run verify:v58.28.8") failures.push("verify:current must target verify:v58.28.7");
if (!String(pkg.scripts?.["build:preflight"] ?? "").includes("workspace:performance-pass:ready")) failures.push("build:preflight must include workspace:performance-pass:ready");
if (!version.includes("58.28.7-workspace-pro-performance-pass-fast-view-switching")) failures.push("release version must be v58.28.7");
if (!page.includes("displayedView") || !page.includes("window.history.replaceState") || page.includes('router.refresh();\n  }\n\n  function openView')) failures.push("Workspace view changes must be optimistic and must not force router.refresh");
if (!css.includes("v58.28.7 — Workspace Pro Performance Pass + Fast View Switching") || !css.includes("ws-pro-view-switching") || !css.includes("content-visibility: auto")) failures.push("globals.css must include performance pass CSS markers");
if (failures.length) { console.error("[verify:v58.28.7] FAIL"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[verify:v58.28.7] OK — performance pass and fast view switching aligned.");
