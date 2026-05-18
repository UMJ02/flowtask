#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected ${JSON.stringify(text)} in ${rel}`); };

for (const rel of [
  "src/components/workspace-pro/workspace-pro-page.tsx",
  "src/components/workspace-system/workspace-system-page.tsx",
  "src/app/globals.css",
  "src/lib/release/version.ts",
]) requireFile(rel);

const allowedVersions = ["58.27.6-workspace-pro-deep-cleanup-2026-ui-controls-system", "58.27.7-workspace-pro-render-diet-dead-ui-removal", "58.27.7.1-workspace-pro-render-diet-cli-hotfix", "58.27.8-workspace-pro-visual-density-final-ui-polish", "58.27.8.1-workspace-pro-vercel-readiness-hotfix",
  "58.27.9-workspace-pro-interaction-hardening-real-editing-flow",
  "58.28.0-workspace-pro-production-ux-final", "58.28.1-workspace-pro-user-final-ui-fixes",
  "58.28.2-workspace-pro-action-model-progressive-disclosure",
  "58.28.3-workspace-pro-user-language-timeline-flow",
  "58.28.4-workspace-pro-board-overlay-status-alignment",
  "58.28.5-workspace-pro-brand-accent-pro-navigation-identity",
  "58.28.6-workspace-pro-completed-filter-anchored-actions",
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
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix"];
if (!allowedVersions.some((version) => read("src/lib/release/version.ts").includes(version))) failures.push("Expected an allowed v58.27.x/v58.28.x Workspace Pro version in src/lib/release/version.ts");
requireIncludes("src/lib/release/version.ts", "APP_RELEASE_STAGE");
requireIncludes("src/components/workspace-system/workspace-system-page.tsx", "WorkspaceProPage");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "ws-pro-shell");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProSidebar");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProHome");
requireIncludes("src/components/workspace-pro/workspace-pro-page.tsx", "WorkspaceProRightPanel");
if (!read("src/components/workspace-pro/workspace-pro-page.tsx").includes("WorkspaceTaskInlineEditor") && !read("src/components/workspace-pro/workspace-pro-page.tsx").includes("ws-pro-task-editor-inline-row")) failures.push("Expected inline task editor controls in src/components/workspace-pro/workspace-pro-page.tsx");
requireIncludes("src/app/globals.css", "v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System");
requireIncludes("src/app/globals.css", "ws-pro-primary-button");
requireIncludes("src/app/globals.css", "ws-pro-hide-scrollbar");

if (failures.length) {
  console.error("[workspace:design-reset:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:design-reset:ready] OK — Workspace Pro design reset and enterprise UI system aligned.");
