#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : '';
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const expectedVersion = '58.25.6.4.1-kanban-overflow-compact-action-fix';
const expectedRelease = 'v58.25.6.4.1 Kanban Overflow + Compact Action Fix';

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push('package version must be v58.25.6.4.1');
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.25.6.4.1') failures.push('verify:current must target verify:v58.25.6.4.1');
if ((pkg.scripts ?? {})['verify:v58.25.6.4.1'] !== 'node scripts/verify-v58.25.6.4.1.mjs') failures.push('verify:v58.25.6.4.1 script missing');

requireFile('docs/release/V58_25_6_4_1_KANBAN_OVERFLOW_COMPACT_ACTION_FIX.md');
requireFile('docs/qa/FLOWTASK_V58_25_6_4_1_KANBAN_OVERFLOW_COMPACT_ACTION_FIX_QA.md');
requireIncludes('src/lib/release/version.ts', expectedVersion);
requireIncludes('src/lib/release/version.ts', expectedRelease);

requireIncludes('src/app/globals.css', 'v58.25.6.4.1 — Kanban overflow compact action fix');
requireIncludes('src/app/globals.css', '.ft-kanban-card-actions');
requireIncludes('src/app/globals.css', '.ft-kanban-action-strip');
requireIncludes('src/app/globals.css', '.ft-kanban-action-button');
requireIncludes('src/app/globals.css', '.ft-kanban-date-pill');
requireIncludes('src/app/globals.css', 'overflow-x: auto');
requireIncludes('src/components/tasks/task-kanban-board.tsx', 'ft-kanban-card-actions');
requireIncludes('src/components/tasks/task-kanban-board.tsx', 'ft-kanban-action-strip');
requireIncludes('src/components/tasks/task-kanban-board.tsx', 'ft-kanban-action-button');
requireIncludes('src/components/tasks/task-kanban-board.tsx', 'ft-kanban-date-pill');

if (failures.length) {
  console.error('[verify:v58.25.6.4.1] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[verify:v58.25.6.4.1] OK — Kanban overflow compact action fix aligned.');
