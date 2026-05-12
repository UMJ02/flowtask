#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), 'utf8') : '';
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = '58.25.6-design-system-consolidation-app-ui-hardening';
const expectedRelease = 'v58.25.6 Design System Consolidation + App UI Architecture Hardening';
const pkg = JSON.parse(read('package.json'));

if (pkg.version !== expectedVersion) failures.push('package version must be v58.25.6');
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.25.6') failures.push('verify:current must target verify:v58.25.6');
if ((pkg.scripts ?? {})['verify:v58.25.6'] !== 'node scripts/verify-v58.25.6.mjs') failures.push('verify:v58.25.6 script missing');
if ((pkg.scripts ?? {})['design:doctor'] !== 'node scripts/design-doctor.mjs') failures.push('design:doctor script missing');

requireFile('scripts/verify-v58.25.6.mjs');
requireFile('scripts/design-doctor.mjs');
requireFile('src/lib/design-system/ui.ts');
requireFile('docs/design/FLOWTASK_UI_ARCHITECTURE_V58_25_6.md');
requireFile('docs/release/V58_25_6_DESIGN_SYSTEM_CONSOLIDATION_APP_UI_HARDENING.md');
requireFile('docs/qa/FLOWTASK_V58_25_6_DESIGN_SYSTEM_CONSOLIDATION_APP_UI_HARDENING_QA.md');

requireIncludes('src/lib/release/version.ts', expectedVersion);
requireIncludes('src/lib/release/version.ts', expectedRelease);
requireIncludes('package-lock.json', expectedVersion);
requireIncludes('README.md', 'v58.25.6');
requireIncludes('src/components/layout/app-shell.tsx', 'ft-app-root');
requireIncludes('src/app/globals.css', 'v58.25.6 — FlowTask Design System Consolidation');
requireIncludes('src/app/globals.css', '.ft-app-root :where(input:not([type=\'checkbox\']):not([type=\'radio\']):not([type=\'range\']):not([type=\'file\']), select, textarea)');
requireIncludes('src/app/globals.css', '.ft-switch');
requireIncludes('src/app/globals.css', '.ft-metric-card');
requireIncludes('src/app/globals.css', '.ft-danger-zone');
requireIncludes('src/app/globals.css', '--ft-shadow-sm');
requireIncludes('src/lib/design-system/ui.ts', 'ftui');
requireIncludes('src/lib/design-system/ui.ts', 'ft-switch');
requireIncludes('src/lib/design-system/tokens.ts', 'designSystemConsolidationLayer');
requireIncludes('src/components/notifications/notification-preferences-form.tsx', 'ft-switch');
requireIncludes('src/components/settings/intelligent-attention-settings-card.tsx', 'ft-switch');
requireNotIncludes('src/app/globals.css', 'hover:-translate-y-[1px]');
requireNotIncludes('src/components/settings/settings-account-overview.tsx', 'hover:-translate-y-0.5');

if (failures.length) {
  console.error('[verify:v58.25.6] FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[verify:v58.25.6] OK — Design system consolidation and app UI hardening aligned.');
