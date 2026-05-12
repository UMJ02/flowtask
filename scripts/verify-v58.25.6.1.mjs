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

const expectedVersion = '58.25.6.1-tasks-kanban-ui-system-migration';
const expectedRelease = 'v58.25.6.1 Tasks + Kanban UI System Migration';

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push('package version must be v58.25.6.1');
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.25.6.1') failures.push('verify:current must target verify:v58.25.6.1');
if ((pkg.scripts ?? {})['verify:v58.25.6.1'] !== 'node scripts/verify-v58.25.6.1.mjs') failures.push('verify:v58.25.6.1 script missing');

requireFile('docs/release/V58_25_6_1_TASKS_KANBAN_UI_SYSTEM_MIGRATION.md');
requireFile('docs/qa/FLOWTASK_V58_25_6_1_TASKS_KANBAN_UI_SYSTEM_MIGRATION_QA.md');
requireIncludes('src/lib/release/version.ts', expectedVersion);
requireIncludes('src/lib/release/version.ts', expectedRelease);

requireIncludes('src/app/globals.css', 'v58.25.6.1 — Tasks + Kanban UI System Migration');
requireIncludes('src/app/globals.css', '.ft-tasks-screen');
requireIncludes('src/app/globals.css', '.ft-tasks-table');
requireIncludes('src/app/globals.css', '.ft-tasks-row');
requireIncludes('src/app/globals.css', '.ft-kanban-grid');
requireIncludes('src/app/globals.css', '.ft-kanban-column');
requireIncludes('src/app/globals.css', '.ft-kanban-card');
requireIncludes('src/app/globals.css', '.ft-task-star-active');
requireIncludes('src/app/globals.css', '.ft-task-icon-button');

requireIncludes('src/components/tasks/task-action-list.tsx', 'ft-tasks-screen');
requireIncludes('src/components/tasks/task-action-list.tsx', 'ft-tasks-table');
requireIncludes('src/components/tasks/task-action-list.tsx', 'ft-tasks-row');
requireIncludes('src/components/tasks/task-action-list.tsx', 'ft-tasks-row-important');
requireIncludes('src/components/tasks/task-action-list.tsx', 'ft-task-star');
requireIncludes('src/components/tasks/task-action-list.tsx', 'ft-task-icon-button');

requireIncludes('src/components/tasks/task-kanban-board.tsx', 'ft-kanban-grid');
requireIncludes('src/components/tasks/task-kanban-board.tsx', 'ft-kanban-column');
requireIncludes('src/components/tasks/task-kanban-board.tsx', 'ft-kanban-card');
requireIncludes('src/components/tasks/task-kanban-board.tsx', 'ft-kanban-card-important');
requireIncludes('src/components/tasks/task-kanban-board.tsx', 'ft-kanban-drop-target');

requireIncludes('src/components/tasks/task-filters.tsx', 'ft-task-filter-panel');
requireIncludes('src/components/tasks/task-form.tsx', 'ft-task-form-panel');
requireNotIncludes('src/components/tasks/task-action-list.tsx', 'animate-[importantPulse');
requireNotIncludes('src/components/tasks/task-kanban-board.tsx', 'animate-[importantPulse');
requireNotIncludes('src/components/tasks/task-form.tsx', 'hover:translate-y-0');

if (failures.length) {
  console.error('[verify:v58.25.6.1] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[verify:v58.25.6.1] OK — Tasks + Kanban UI system migration aligned.');
