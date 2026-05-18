#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const page = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const allowedVersions = [
  "58.28.7-workspace-pro-performance-pass-fast-view-switching",
  "58.28.8-workspace-pro-client-performance-anchored-popovers",
  "58.28.9-workspace-pro-brand-pastel-loading-system",
  "58.28.10-workspace-pro-no-motion-board-portal-home-colors",
  "58.28.11-workspace-pro-nav-shape-home-alignment",
  "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.15-workspace-pro-deep-component-extraction-lazy-view-loading",
  "58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity",
  "58.28.17-classic-pro-unified-data-qa-final-user-flow",
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.18.1-dependency-security-public-registry-lockfile-hotfix",
  "58.28.10-workspace-pro-no-motion-board-portal-home-colors",
  "58.28.11-workspace-pro-nav-shape-home-alignment",
  "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.15-workspace-pro-deep-component-extraction-lazy-view-loading",
  "58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity",
  "58.28.17-classic-pro-unified-data-qa-final-user-flow",
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.18.1-dependency-security-public-registry-lockfile-hotfix",
];
const failures = [];
if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!String(pkg.scripts?.["verify:current"] ?? "").startsWith("npm run verify:v58.28.")) failures.push("verify:current must target the active v58.28.x verify script");
if (!page.includes("setDisplayedView(view)") || !page.includes("window.history.replaceState")) failures.push("Tab switching must update local view and URL without server refresh");
if (page.includes('router.refresh();\n  }\n\n  function openView')) failures.push("openView/setWorkspaceParam must not chain router.refresh after router.replace");
if (!css.includes("transition-duration: 90ms") || !css.includes("cursor: pointer") || !css.includes("backdrop-filter: none")) failures.push("Performance CSS must reduce expensive animation/backdrop and improve hover/click feedback");
if (failures.length) { console.error("[workspace:performance-pass:ready] FAIL"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[workspace:performance-pass:ready] OK — fast view switching, hover feedback and render-cost reduction aligned.");
