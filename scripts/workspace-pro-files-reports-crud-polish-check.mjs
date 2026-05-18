#!/usr/bin/env node
import fs from 'node:fs';
const failures = [];
function read(file) { return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''; }
const pkg = JSON.parse(read('package.json') || '{}');
const allowedVersions = ['58.27.6-workspace-pro-deep-cleanup-2026-ui-controls-system', '58.27.7-workspace-pro-render-diet-dead-ui-removal', '58.27.7.1-workspace-pro-render-diet-cli-hotfix', '58.27.8-workspace-pro-visual-density-final-ui-polish', '58.27.8.1-workspace-pro-vercel-readiness-hotfix', '58.27.9-workspace-pro-interaction-hardening-real-editing-flow', '58.28.0-workspace-pro-production-ux-final', '58.28.1-workspace-pro-user-final-ui-fixes', '58.28.2-workspace-pro-action-model-progressive-disclosure', '58.28.3-workspace-pro-user-language-timeline-flow', '58.28.4-workspace-pro-board-overlay-status-alignment', '58.28.5-workspace-pro-brand-accent-pro-navigation-identity', '58.28.6-workspace-pro-completed-filter-anchored-actions', '58.28.7-workspace-pro-performance-pass-fast-view-switching'];
const allowedVerifyTargets = ['npm run verify:v58.27.6', 'npm run verify:v58.27.7', 'npm run verify:v58.27.7.1', 'npm run verify:v58.27.8', 'npm run verify:v58.27.8.1', 'npm run verify:v58.27.9', 'npm run verify:v58.28.0', 'npm run verify:v58.28.1', 'npm run verify:v58.28.2', 'npm run verify:v58.28.3', 'npm run verify:v58.28.4', 'npm run verify:v58.28.5', 'npm run verify:v58.28.6', 'npm run verify:v58.28.7'];
if (!allowedVersions.includes(String(pkg.version ?? ''))) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.['verify:current'])) failures.push('verify:current must target the active v58.27.x/v58.28.x verify script');
if (!read('src/components/workspace-pro/workspace-pro-page.tsx').includes('WorkspaceProFileRow')) failures.push('WorkspaceProFileRow missing');
if (!read('src/components/workspace-pro/workspace-pro-page.tsx').includes('WorkspaceFilesUploadEntry')) failures.push('Upload entry not integrated in Workspace Pro files view');
if (!read('src/components/workspace-pro/workspace-pro-page.tsx').includes('ReportAction')) failures.push('ReportAction cards missing');
if (!read('src/components/workspace-pro/workspace-pro-page.tsx').includes('supabase.from("attachments").update')) failures.push('Attachment rename action missing');
if (!read('src/components/workspace-pro/workspace-pro-page.tsx').includes('supabase.from("attachments").delete')) failures.push('Attachment delete action missing');
if (!read('src/app/globals.css').includes('v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System')) failures.push('CSS marker missing');
if (failures.length) {
  console.error('[workspace:files-reports:ready] FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('[workspace:files-reports:ready] OK — Workspace Pro files CRUD and report generation polish aligned.');
