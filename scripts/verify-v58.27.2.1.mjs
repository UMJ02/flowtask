import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = fs.readFileSync('src/lib/release/version.ts', 'utf8');
const failures = [];
if (pkg.version !== '58.27.2.1-workspace-pro-layout-simplification-interaction-cleanup') failures.push('package version mismatch');
if (pkg.scripts?.['verify:current'] !== 'npm run verify:v58.27.2.1') failures.push('verify:current must point to v58.27.2.1');
if (pkg.scripts?.['workspace:layout-cleanup:ready'] !== 'node scripts/workspace-pro-layout-cleanup-check.mjs') failures.push('workspace:layout-cleanup:ready script missing');
if (!String(pkg.scripts?.['build:preflight'] ?? '').includes('workspace:layout-cleanup:ready')) failures.push('build:preflight must include workspace:layout-cleanup:ready');
if (!version.includes('v58.27.2.1 Workspace Pro Layout Simplification + Interaction Cleanup')) failures.push('release name mismatch');
if (!fs.existsSync('docs/release/V58_27_2_1_WORKSPACE_PRO_LAYOUT_SIMPLIFICATION_INTERACTION_CLEANUP.md')) failures.push('release doc missing');
if (!fs.existsSync('docs/qa/FLOWTASK_V58_27_2_1_WORKSPACE_PRO_LAYOUT_SIMPLIFICATION_INTERACTION_CLEANUP_QA.md')) failures.push('QA doc missing');
if (failures.length) {
  console.error('[verify:v58.27.2.1] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[verify:v58.27.2.1] OK — Workspace Pro layout simplification and interaction cleanup aligned.');
