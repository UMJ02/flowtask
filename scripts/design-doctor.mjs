#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx|ts|css)$/.test(entry.name)) files.push(full);
  }
}
walk(src);
const read = (file) => fs.readFileSync(file, 'utf8');
const count = (pattern) => files.reduce((sum, file) => sum + (read(file).match(new RegExp(pattern, 'g'))?.length ?? 0), 0);
const metrics = {
  arbitraryRadius: count('rounded-\\['),
  hardBorder: count('border\\[#E5EAF1\\]|border-\\[#E5EAF1\\]'),
  hardTextMain: count('text\\[#0F172A\\]|text-\\[#0F172A\\]'),
  hardTextMuted: count('text\\[#64748B\\]|text-\\[#64748B\\]'),
  customShadow: count('shadow-\\['),
  hoverLift: count('hover:-translate'),
  appRoot: read(path.join(root, 'src/components/layout/app-shell.tsx')).includes('ft-app-root') ? 1 : 0,
  globalFormControls: read(path.join(root, 'src/app/globals.css')).includes(".ft-app-root :where(input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='file']), select, textarea)") ? 1 : 0,
};
console.log('[design:doctor] FlowTask design system audit');
for (const [key, value] of Object.entries(metrics)) console.log(`- ${key}: ${value}`);
const failures = [];
if (!metrics.appRoot) failures.push('AppShell must include ft-app-root.');
if (!metrics.globalFormControls) failures.push('Global form controls must be scoped under ft-app-root.');
if (metrics.hoverLift > 0) failures.push('hover:-translate is not allowed in app source.');
if (metrics.hardBorder > 80) failures.push('Too many hardcoded #E5EAF1 borders remain.');
if (metrics.hardTextMain > 90) failures.push('Too many hardcoded main text colors remain.');
if (metrics.hardTextMuted > 90) failures.push('Too many hardcoded muted text colors remain.');
if (metrics.customShadow > 80) failures.push('Too many custom shadows remain; use design tokens.');
if (failures.length) {
  console.error('[design:doctor] FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('[design:doctor] OK — design system guardrails are aligned.');
