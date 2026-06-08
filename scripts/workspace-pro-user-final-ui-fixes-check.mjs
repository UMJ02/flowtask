import fs from "node:fs";

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
const pkg = JSON.parse(read("package.json"));
const page = read("src/components/workspace-pro/workspace-pro-page.tsx");
const spaces = read("src/components/workspace-system/workspace-spaces-manager.tsx");
const css = read("src/app/globals.css");
const allowedVersions = [
  "58.28.1-workspace-pro-user-final-ui-fixes",
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
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.19-ux-copy-empty-states-final",
  "58.28.20-mobile-responsive-final-pass",
  "58.28.21-supabase-rls-client-readiness-final",
  "58.28.21.3-classic-reports-data-integrity-checklist-progress-export",
  "58.28.21.4-share-landing-short-link-stored-report-tokens",
  "58.28.21.5-radar-analytics-due-state-integrity",
  "58.28.21.6-data-integrity-live-sync-audit",
  "58.28.10-workspace-pro-no-motion-board-portal-home-colors",
  "58.28.11-workspace-pro-nav-shape-home-alignment",
  "58.28.12-workspace-pro-home-hero-solid-card-colors",
  "58.28.15-workspace-pro-deep-component-extraction-lazy-view-loading",
  "58.28.16-task-data-sync-status-source-of-truth",
  "58.28.16.1-task-data-sync-cli-hotfix",
  "58.28.16.2-classic-pro-status-parity",
  "58.28.17-classic-pro-unified-data-qa-final-user-flow",
  "58.28.17.1-unified-data-qa-inline-status-type-hotfix",
  "58.28.19-ux-copy-empty-states-final",
  "58.28.20-mobile-responsive-final-pass",
  "58.28.21-supabase-rls-client-readiness-final",
  "58.28.21.3-classic-reports-data-integrity-checklist-progress-export",
  "58.28.21.4-share-landing-short-link-stored-report-tokens",
  "58.28.21.5-radar-analytics-due-state-integrity",
  "58.28.21.6-data-integrity-live-sync-audit",
];
const allowedVerifyTargets = ["npm run verify:v58.28.1", "npm run verify:v58.28.2", "npm run verify:v58.28.3", "npm run verify:v58.28.4", "npm run verify:v58.28.5",
  "npm run verify:v58.28.6",
  "npm run verify:v58.28.7",
  "npm run verify:v58.28.8",
  "npm run verify:v58.28.9",
  "npm run verify:v58.28.10", "npm run verify:v58.28.11", "npm run verify:v58.28.12", "npm run verify:v58.28.15", "npm run verify:v58.28.16", "npm run verify:v58.28.16.1", "npm run verify:v58.28.16.2", "npm run verify:v58.28.17",
  "npm run verify:v58.28.17.1",
  "npm run verify:v58.28.19", "npm run verify:v58.28.20", "npm run verify:v58.28.21",
  "npm run verify:v58.28.21.3",
  "npm run verify:v58.28.21.4", "npm run verify:v58.28.21.5",
  "npm run verify:v58.28.21.6", "npm run verify:v58.28.21.6", "npm run verify:v58.28.21",
  "npm run verify:v58.28.21.3",
  "npm run verify:v58.28.21.4", "npm run verify:v58.28.21.5",
  "npm run verify:v58.28.21.6", "npm run verify:v58.28.21.6"];

if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target an active v58.28.x verify script");

const pageMarkers = [
  "ws-pro-editor-inline-action",
  "w-[min(1120px,calc(100vw-1.5rem))]",
];
for (const marker of pageMarkers) if (!page.includes(marker)) failures.push(`workspace-pro-page.tsx missing marker: ${marker}`);
if (!page.includes("ws-pro-task-editor-toolbar") && !page.includes("ws-pro-task-editor-inline-row")) failures.push("workspace-pro-page.tsx missing task editor inline controls marker");

const spaceMarkers = [
  "ft-ws-spaces-manager-head",
  "ft-ws-spaces-setup-grid",
  "ft-ws-space-create-grid",
  "ft-ws-spaces-status-card",
  "ft-ws-spaces-list-grid",
];
for (const marker of spaceMarkers) if (!spaces.includes(marker)) failures.push(`workspace-spaces-manager.tsx missing marker: ${marker}`);

const cssMarkers = [
  "v58.28.1 — Workspace Pro User Final UI Fixes",
  "ft-ws-space-create-grid",
  "@media (max-width: 980px)",
];
for (const marker of cssMarkers) if (!css.includes(marker)) failures.push(`globals.css missing marker: ${marker}`);
if (!css.includes("ws-pro-task-editor-toolbar") && !css.includes("ws-pro-task-editor-inline-row")) failures.push("globals.css missing task editor inline controls marker");

if (failures.length) {
  console.error("[workspace:user-final-ui:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:user-final-ui:ready] OK — Workspace Pro user final UI fixes aligned.");
