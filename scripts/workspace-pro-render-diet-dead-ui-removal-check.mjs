#!/usr/bin/env node
import fs from 'node:fs';

const failures = [];
const read = (file) => fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const pkg = JSON.parse(read('package.json'));
const page = read('src/components/workspace-pro/workspace-pro-page.tsx');
const helper = read('src/lib/workspace-system/render-diet.ts');
const css = read('src/app/globals.css');

if (!['58.27.7-workspace-pro-render-diet-dead-ui-removal', '58.27.7.1-workspace-pro-render-diet-cli-hotfix', '58.27.8-workspace-pro-visual-density-final-ui-polish', '58.27.8.1-workspace-pro-vercel-readiness-hotfix', '58.27.9-workspace-pro-interaction-hardening-real-editing-flow', '58.28.0-workspace-pro-production-ux-final', '58.28.1-workspace-pro-user-final-ui-fixes', '58.28.2-workspace-pro-action-model-progressive-disclosure', '58.28.3-workspace-pro-user-language-timeline-flow', '58.28.4-workspace-pro-board-overlay-status-alignment', '58.28.5-workspace-pro-brand-accent-pro-navigation-identity', '58.28.6-workspace-pro-completed-filter-anchored-actions', '58.28.7-workspace-pro-performance-pass-fast-view-switching', '58.28.8-workspace-pro-client-performance-anchored-popovers', '58.28.9-workspace-pro-brand-pastel-loading-system', '58.28.10-workspace-pro-no-motion-board-portal-home-colors',
  "58.28.11-workspace-pro-nav-shape-home-alignment"].includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!['npm run verify:v58.27.7', 'npm run verify:v58.27.7.1', 'npm run verify:v58.27.8', 'npm run verify:v58.27.8.1', 'npm run verify:v58.27.9', 'npm run verify:v58.28.0', 'npm run verify:v58.28.1', 'npm run verify:v58.28.2', 'npm run verify:v58.28.3', 'npm run verify:v58.28.4', 'npm run verify:v58.28.5', 'npm run verify:v58.28.6', 'npm run verify:v58.28.7', 'npm run verify:v58.28.8', 'npm run verify:v58.28.9', 'npm run verify:v58.28.10', "npm run verify:v58.28.11"].includes(pkg.scripts?.['verify:current'])) failures.push('verify:current must target verify:v58.27.7, verify:v58.27.7.1 or verify:v58.27.8');
if (!pkg.scripts?.['build:preflight']?.includes('workspace:render-diet:ready')) failures.push('build:preflight must include workspace:render-diet:ready');
if (!helper.includes('getWorkspaceProDerivedData')) failures.push('render-diet helper missing');
if (!helper.includes('projectTaskMap')) failures.push('projectTaskMap must be derived outside project render');
if (!helper.includes('boardColumns')) failures.push('boardColumns must be derived outside board render');
if (!page.includes('getWorkspaceProDerivedData') || !page.includes('useMemo')) failures.push('WorkspaceProPage must memoize derived data once');
if (page.includes('const done = tasks.filter')) failures.push('Repeated done filter still lives in WorkspaceProPage render');
if (page.includes('const projectTasks = tasks.filter')) failures.push('Project render still filters all tasks per project');
if (page.includes('const items = tasks.filter((task) => column.match')) failures.push('Board render still filters all tasks per column');
if (!page.includes('commandCenterOpen ?')) failures.push('Command Center must stay closed/unmounted until opened');
if (!page.includes('sharePanelOpen ?')) failures.push('Share Panel must stay closed/unmounted until opened');
if (!css.includes('v58.27.7 — Workspace Pro Render Diet + Dead UI Removal')) failures.push('CSS marker missing');

if (failures.length) {
  console.error('[workspace:render-diet:ready] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[workspace:render-diet:ready] OK — Workspace Pro render diet and dead UI removal aligned.');
