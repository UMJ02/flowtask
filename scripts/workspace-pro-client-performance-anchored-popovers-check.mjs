#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const page = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const failures = [];
const allowedVersions = [
  "58.28.8-workspace-pro-client-performance-anchored-popovers",
  "58.28.9-workspace-pro-brand-pastel-loading-system",
];
const allowedVerifyTargets = ["npm run verify:v58.28.8", "npm run verify:v58.28.9"];
if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target verify:v58.28.8 or verify:v58.28.9");
if (!page.includes("setViewFlash(true)") || page.includes("SERVER_SYNC_VIEWS.has(view)")) failures.push("View changes must be instant client-side and avoid server-sync branches");
if (!page.includes("setLocalTasks((items)") || page.includes("setActionAnchor")) failures.push("Board must use optimistic local state and no global action anchor");
if (!page.includes("ws-pro-board-action-popover")) failures.push("Board action panel must render as an item-anchored popover");
if (!css.includes("ws-pro-status-ribbon") || !css.includes("ws-pro-board-action-popover") || !css.includes("content-visibility: visible !important")) failures.push("CSS must include animated status ribbon and anchored popover performance overrides");
if (failures.length) { console.error("[workspace:client-performance:ready] FAIL"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[workspace:client-performance:ready] OK — client switching, optimistic board updates and anchored popovers aligned.");
