#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
const expectedVersion = '58.22.4-data-sync-reliability-mutation-confirmation';
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!exists(rel)) { failures.push(`Missing required file: ${rel}`); return; } if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }

requireFile('package.json');
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.22.4') failures.push('verify:current must target verify:v58.22.4');
if ((pkg.scripts ?? {})['verify:v58.22.4'] !== 'node scripts/verify-v58.22.4.mjs') failures.push('verify:v58.22.4 script missing or incorrect');

for (const rel of [
  'docs/release/V58_22_4_DATA_SYNC_RELIABILITY_MUTATION_CONFIRMATION.md',
  'docs/qa/FLOWTASK_V58_22_4_DATA_SYNC_QA.md',
  'docs/data-sync/FLOWTASK_DATA_SYNC_RELIABILITY.md',
  'src/lib/supabase/mutation-confirmation.ts',
]) requireFile(rel);

requireIncludes('src/lib/release/version.ts', expectedVersion);
requireIncludes('src/lib/release/version.ts', 'v58.22.4 Data Sync Reliability + Mutation Confirmation');
requireIncludes('src/lib/release/version.ts', 'production-candidate');

for (const [rel, text] of [
  ['src/components/tasks/task-workspace-inline.tsx', '.select("id,title,status,priority,due_date,client_name,department_id,updated_at")'],
  ['src/components/tasks/task-workspace-inline.tsx', 'error || !data'],
  ['src/components/projects/project-hero-inline-editor.tsx', 'confirmedProject'],
  ['src/components/projects/project-hero-inline-editor.tsx', '.select("id,title,status,client_id,client_name,department_id,due_date,country,is_collaborative,updated_at")'],
  ['src/components/projects/project-inline-tasks.tsx', 'confirmedTask'],
  ['src/components/projects/project-inline-tasks.tsx', 'deletedRows'],
  ['src/components/tasks/task-kanban-board.tsx', 'confirmedTask'],
  ['src/components/tasks/task-inline-actions.tsx', 'confirmedTask'],
  ['src/components/tasks/task-status-form.tsx', 'confirmedTask'],
  ['src/components/tasks/task-action-list.tsx', 'confirmedTasks'],
  ['src/components/attachments/entity-attachments.tsx', 'No pudimos confirmar la eliminación del adjunto'],
  ['docs/data-sync/FLOWTASK_DATA_SYNC_RELIABILITY.md', 'Ninguna acción crítica debe marcarse como guardada'],
]) requireIncludes(rel, text);

if (failures.length) { console.error('[verify:v58.22.4] FAIL'); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log('[verify:v58.22.4] OK — Data sync reliability and mutation confirmation aligned.');
