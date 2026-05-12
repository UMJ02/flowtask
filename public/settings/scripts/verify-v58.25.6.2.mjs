#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : '';
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = '58.25.6.2-projects-ui-system-migration';
const expectedRelease = 'v58.25.6.2 Projects UI System Migration';

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push('package version must be v58.25.6.2');
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.25.6.2') failures.push('verify:current must target verify:v58.25.6.2');
if ((pkg.scripts ?? {})['verify:v58.25.6.2'] !== 'node scripts/verify-v58.25.6.2.mjs') failures.push('verify:v58.25.6.2 script missing');

requireFile('docs/release/V58_25_6_2_PROJECTS_UI_SYSTEM_MIGRATION.md');
requireFile('docs/qa/FLOWTASK_V58_25_6_2_PROJECTS_UI_SYSTEM_MIGRATION_QA.md');
requireIncludes('src/lib/release/version.ts', expectedVersion);
requireIncludes('src/lib/release/version.ts', expectedRelease);

requireIncludes('src/app/globals.css', 'v58.25.6.2 — Projects UI System Migration');
requireIncludes('src/app/globals.css', '.ft-projects-screen');
requireIncludes('src/app/globals.css', '.ft-projects-hero');
requireIncludes('src/app/globals.css', '.ft-project-metric-card');
requireIncludes('src/app/globals.css', '.ft-project-action');
requireIncludes('src/app/globals.css', '.ft-project-form-panel');
requireIncludes('src/app/globals.css', '.ft-project-inline-task-row');
requireIncludes('src/app/globals.css', '.ft-project-timeline-panel');

requireIncludes('src/app/(app)/app/projects/page.tsx', 'ft-projects-screen');
requireIncludes('src/app/(app)/app/projects/page.tsx', 'ft-projects-hero');
requireIncludes('src/app/(app)/app/projects/page.tsx', 'ft-projects-filter-panel');
requireIncludes('src/app/(app)/app/projects/page.tsx', 'ft-project-metric-card');
requireIncludes('src/components/projects/project-detail-summary.tsx', 'ft-project-detail-panel');
requireIncludes('src/components/projects/project-form.tsx', 'ft-project-form-panel');
requireIncludes('src/components/projects/project-filters.tsx', 'ft-projects-filter-panel');
requireIncludes('src/components/projects/project-inline-tasks.tsx', 'ft-project-inline-task-row');
requireIncludes('src/components/projects/project-planning-timeline.tsx', 'ft-project-timeline-panel');
requireIncludes('src/components/projects/project-detail-pro.tsx', 'ft-project-metric-card');

requireNotIncludes('src/components/projects/project-form.tsx', 'hover:translate-y-0');
requireNotIncludes('src/components/projects/project-detail-summary.tsx', 'hover:translate-y-0');
requireNotIncludes('src/components/projects/project-detail-pro.tsx', 'hover:translate-y-0');

if (failures.length) {
  console.error('[verify:v58.25.6.2] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[verify:v58.25.6.2] OK — Projects UI system migration aligned.');
