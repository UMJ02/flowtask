#!/usr/bin/env node
import fs from 'node:fs';
const checks = [
  ['package.json', '58.27.7-workspace-pro-render-diet-dead-ui-removal'],
  ['package.json', 'workspace:render-diet:ready'],
  ['package.json', 'verify:v58.27.7'],
  ['src/lib/release/version.ts', 'v58.27.7 Workspace Pro Render Diet + Dead UI Removal'],
  ['src/lib/workspace-system/render-diet.ts', 'getWorkspaceProDerivedData'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'getWorkspaceProDerivedData'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'derived.projectTaskMap'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'boardColumns={derived.boardColumns}'],
  ['scripts/workspace-pro-render-diet-dead-ui-removal-check.mjs', 'workspace:render-diet:ready'],
  ['src/app/globals.css', 'v58.27.7 — Workspace Pro Render Diet + Dead UI Removal'],
];
const errors = [];
for (const [file, marker] of checks) {
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (!text.includes(marker)) errors.push(`${file} missing ${marker}`);
}
if (errors.length) {
  console.error('[verify:v58.27.7] FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('[verify:v58.27.7] OK — Workspace Pro render diet and dead UI removal aligned.');
