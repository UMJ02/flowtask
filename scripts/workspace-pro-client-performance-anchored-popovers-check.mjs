#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const page = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const failures = [];
const allowedVersions = [
  "58.28.8-workspace-pro-client-performance-anchored-popovers",
  "58.28.9-workspace-pro-brand-pastel-loading-system",
  "58.28.10-workspace-pro-no-motion-board-portal-home-colors",
  "58.28.11-workspace-pro-nav-shape-home-alignment",
  "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.14-workspace-pro-component-split-runtime-slimdown",
  "58.28.10-workspace-pro-no-motion-board-portal-home-colors",
  "58.28.11-workspace-pro-nav-shape-home-alignment",
  "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.14-workspace-pro-component-split-runtime-slimdown",
];
const allowedVerifyTargets = ["npm run verify:v58.28.8", "npm run verify:v58.28.9",
  "npm run verify:v58.28.10", "npm run verify:v58.28.11", "npm run verify:v58.28.12", "npm run verify:v58.28.14"];
if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target verify:v58.28.8 or verify:v58.28.9");
if (!page.includes("window.history.replaceState") || page.includes("SERVER_SYNC_VIEWS.has(view)") || page.includes("setViewFlash(true)")) failures.push("View changes must be instant client-side without loading flash or server-sync branches");
if (!page.includes("setLocalTasks((items)") || !page.includes("createPortal") || !page.includes("openActionAnchor")) failures.push("Board must use optimistic local state and portal-based action anchoring");
if (!page.includes("ws-pro-board-action-popover")) failures.push("Board action panel must render as an item-anchored popover");
if (!css.includes("ws-pro-board-action-popover") || !css.includes("content-visibility: visible !important") || !css.includes("animation: none !important")) failures.push("CSS must include anchored popover and no-motion performance overrides");
if (failures.length) { console.error("[workspace:client-performance:ready] FAIL"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[workspace:client-performance:ready] OK — client switching, optimistic board updates and anchored popovers aligned.");
