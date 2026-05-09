#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
const expectedVersion = '58.22.2-task-status-production-attachment-list-inline-department-edit';
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function requireIncludes(rel, text) { if (!exists(rel)) { failures.push(`Missing required file: ${rel}`); return; } if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
requireFile('package.json');
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.22.2') failures.push('verify:current must target verify:v58.22.2');
if ((pkg.scripts ?? {})['verify:v58.22.2'] !== 'node scripts/verify-v58.22.2.mjs') failures.push('verify:v58.22.2 script missing or incorrect');
for (const rel of [
  'docs/release/V58_22_2_TASK_STATUS_PRODUCTION_ATTACHMENT_LIST_INLINE_DEPARTMENT_EDIT.md',
  'docs/qa/FLOWTASK_V58_22_2_TASK_STATUS_ATTACHMENTS_DEPARTMENT_QA.md',
  'docs/design-system/FLOWTASK_TASK_ATTACHMENT_LIST_PATTERN.md',
  'supabase/migrations/0044_v58_22_2_task_status_production.sql',
]) requireFile(rel);
requireIncludes('src/lib/release/version.ts', expectedVersion);
requireIncludes('src/lib/release/version.ts', 'v58.22.2 Task Status Production + Attachment List + Inline Department Edit');
for (const rel of ['src/lib/constants/task-status.ts','src/lib/validations/task.ts','src/types/task.ts','src/lib/tasks/status.ts','src/components/tasks/task-workspace-inline.tsx']) requireIncludes(rel, 'produccion');
requireIncludes('supabase/migrations/0044_v58_22_2_task_status_production.sql', "'produccion'");
requireIncludes('src/components/attachments/entity-attachments.tsx', 'variant?: "cards" | "list"');
requireIncludes('src/components/tasks/task-workspace-inline.tsx', 'variant="list"');
requireIncludes('src/components/tasks/task-workspace-inline.tsx', 'department_id: form.departmentId');
requireIncludes('src/components/tasks/task-workspace-inline.tsx', 'setDepartmentOptions');
if (failures.length) { console.error('[verify:v58.22.2] FAIL'); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log('[verify:v58.22.2] OK — Production status, task attachment list and inline department edit aligned.');
