import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = fs.readFileSync('src/lib/release/version.ts', 'utf8');
const inlineActions = fs.readFileSync('src/components/workspace-system/workspace-task-inline-actions.tsx', 'utf8');
const failures = [];

const expected = '58.28.17.1-unified-data-qa-inline-status-type-hotfix';
if (pkg.version !== expected) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.['verify:current'] !== 'npm run verify:v58.28.17.1') failures.push('verify:current must target verify:v58.28.17.1');
if (!version.includes(expected)) failures.push('src/lib/release/version.ts must contain v58.28.17.1 slug');
if (!pkg.scripts?.['workspace:unified-data-qa:ready']) failures.push('Missing workspace:unified-data-qa:ready script');
if (!inlineActions.includes('import type { TaskStatus }')) failures.push('Inline task actions must import TaskStatus');
if (!inlineActions.includes('function isTaskStatus')) failures.push('Inline task actions must guard select string values before setStatus');
if (!inlineActions.includes('if (!isTaskStatus(value)) return;')) failures.push('Inline task actions must prevent invalid status strings');

if (failures.length) {
  console.error('[verify:v58.28.17.1] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[verify:v58.28.17.1] OK — Unified data QA inline status type hotfix aligned.');
