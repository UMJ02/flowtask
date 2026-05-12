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

const expectedVersion = '58.25.6.3-dashboard-analytics-ui-system-migration';
const expectedRelease = 'v58.25.6.3 Dashboard + Analytics UI System Migration';

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push('package version must be v58.25.6.3');
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.25.6.3') failures.push('verify:current must target verify:v58.25.6.3');
if ((pkg.scripts ?? {})['verify:v58.25.6.3'] !== 'node scripts/verify-v58.25.6.3.mjs') failures.push('verify:v58.25.6.3 script missing');

requireFile('docs/release/V58_25_6_3_DASHBOARD_ANALYTICS_UI_SYSTEM_MIGRATION.md');
requireFile('docs/qa/FLOWTASK_V58_25_6_3_DASHBOARD_ANALYTICS_UI_SYSTEM_MIGRATION_QA.md');
requireIncludes('src/lib/release/version.ts', expectedVersion);
requireIncludes('src/lib/release/version.ts', expectedRelease);

requireIncludes('src/app/globals.css', 'v58.25.6.3 — Dashboard + Analytics UI System Migration');
requireIncludes('src/app/globals.css', '.ft-dashboard-screen');
requireIncludes('src/app/globals.css', '.ft-dashboard-hero');
requireIncludes('src/app/globals.css', '.ft-dashboard-metric');
requireIncludes('src/app/globals.css', '.ft-analytics-screen');
requireIncludes('src/app/globals.css', '.ft-analytics-panel');
requireIncludes('src/app/globals.css', '.ft-analytics-metric');
requireIncludes('src/app/globals.css', '.ft-reports-screen');
requireIncludes('src/app/globals.css', '.ft-report-card');
requireIncludes('src/app/globals.css', '.ft-chart-frame');

requireIncludes('src/components/dashboard/dashboard-hero.tsx', 'ft-dashboard-hero');
requireIncludes('src/components/dashboard/dashboard-hero.tsx', 'ft-dashboard-title');
requireIncludes('src/components/dashboard/dashboard-hero.tsx', 'ft-dashboard-metric-grid');
requireIncludes('src/components/dashboard/interactive-dashboard-board.tsx', 'ft-dashboard-screen');

requireIncludes('src/components/analytics/analytics-overview.tsx', 'ft-analytics-screen');
requireIncludes('src/components/analytics/analytics-overview.tsx', 'ft-analytics-panel');
requireIncludes('src/components/analytics/analytics-overview.tsx', 'ft-analytics-metric');

requireIncludes('src/components/reports/operations-overview.tsx', 'ft-reports-screen');
requireIncludes('src/components/reports/operations-overview.tsx', 'ft-report-card');
requireIncludes('src/components/reports/operations-overview.tsx', 'ft-report-row');

requireNotIncludes('src/components/dashboard/dashboard-hero.tsx', 'hover:translate-y-0');
requireNotIncludes('src/components/dashboard/interactive-dashboard-board.tsx', 'hover:translate-y-0');
requireNotIncludes('src/components/analytics/analytics-overview.tsx', 'hover:translate-y-0');
requireNotIncludes('src/components/reports/operations-overview.tsx', 'hover:translate-y-0');

if (failures.length) {
  console.error('[verify:v58.25.6.3] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[verify:v58.25.6.3] OK — Dashboard + Analytics UI system migration aligned.');
