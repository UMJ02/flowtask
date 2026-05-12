#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), 'utf8') : '';
const exists = (rel) => fs.existsSync(path.join(root, rel));
const required = [
  'package.json','package-lock.json','vercel.json','next.config.ts','.env.example',
  'scripts/runtime-check.mjs','scripts/validate-env.mjs','scripts/verify-v58.25.6.mjs','scripts/design-doctor.mjs',
  'src/components/layout/app-shell.tsx','src/app/globals.css','src/lib/design-system/ui.ts',
  'docs/design/FLOWTASK_UI_ARCHITECTURE_V58_25_6.md',
  'docs/release/V58_25_6_DESIGN_SYSTEM_CONSOLIDATION_APP_UI_HARDENING.md',
  'docs/qa/FLOWTASK_V58_25_6_DESIGN_SYSTEM_CONSOLIDATION_APP_UI_HARDENING_QA.md'
];
for (const rel of required) if (!exists(rel)) failures.push(`Missing ${rel}`);
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '58.25.6-design-system-consolidation-app-ui-hardening') failures.push('package version mismatch');
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.25.6') failures.push('verify current mismatch');
if ((pkg.scripts ?? {})['design:doctor'] !== 'node scripts/design-doctor.mjs') failures.push('design doctor missing');
if (!read('src/components/layout/app-shell.tsx').includes('ft-app-root')) failures.push('ft-app-root missing');
if (!read('src/app/globals.css').includes('v58.25.6 — FlowTask Design System Consolidation')) failures.push('v58.25.6 css layer missing');
if (!read('src/lib/design-system/ui.ts').includes('ftui')) failures.push('ftui export missing');
const vercel = JSON.parse(read('vercel.json'));
if (vercel.framework !== 'nextjs') failures.push('vercel framework mismatch');
if (vercel.buildCommand !== 'npm run vercel:build') failures.push('vercel build command mismatch');
if (failures.length) {
  console.error('[readiness] FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('[readiness] OK — v58.25.6 design system readiness aligned.');
