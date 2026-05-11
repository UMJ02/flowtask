#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
const expectedVersion = '58.22.3-workspace-board-column-visibility-production-migration-hotfix';
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!exists(rel)) { failures.push(`Missing required file: ${rel}`); return; } if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
function forbidIncludes(rel, text) { if (exists(rel) && read(rel).includes(text)) failures.push(`Forbidden '${text}' in ${rel}`); }

requireFile('package.json');
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.22.3') failures.push('verify:current must target verify:v58.22.3');
if ((pkg.scripts ?? {})['verify:v58.22.3'] !== 'node scripts/verify-v58.22.3.mjs') failures.push('verify:v58.22.3 script missing or incorrect');

for (const rel of [
  'docs/release/V58_22_3_WORKSPACE_BOARD_COLUMN_VISIBILITY_PRODUCTION_MIGRATION_HOTFIX.md',
  'docs/qa/FLOWTASK_V58_22_3_WORKSPACE_COLUMNS_QA.md',
  'docs/design-system/FLOWTASK_WORKSPACE_BOARD_COLUMN_VISIBILITY.md',
  'supabase/migrations/0044_v58_22_2_task_status_production.sql',
]) requireFile(rel);

requireIncludes('src/lib/release/version.ts', expectedVersion);
requireIncludes('src/lib/release/version.ts', 'v58.22.3 Workspace Board Column Visibility + Production Migration Hotfix');
requireIncludes('src/components/workspace/workspace-home.tsx', 'WORKSPACE_VISIBLE_COLUMNS_KEY');
requireIncludes('src/components/workspace/workspace-home.tsx', 'Columnas');
requireIncludes('src/components/workspace/workspace-home.tsx', 'toggleVisibleColumn');
requireIncludes('src/components/workspace/workspace-home.tsx', 'visibleStatuses={visibleStatusColumns}');
requireIncludes('src/components/tasks/task-kanban-board.tsx', 'visibleStatuses?: string[]');
requireIncludes('src/components/tasks/task-kanban-board.tsx', 'activeColumns');
requireIncludes('supabase/migrations/0044_v58_22_2_task_status_production.sql', "to_regclass('public.task_statuses')");
requireIncludes('supabase/migrations/0044_v58_22_2_task_status_production.sql', "'produccion'");

if (failures.length) { console.error('[verify:v58.22.3] FAIL'); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log('[verify:v58.22.3] OK — Workspace column visibility and production migration hotfix aligned.');
