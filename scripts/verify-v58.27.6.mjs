#!/usr/bin/env node
import fs from 'node:fs';
const checks = [
  ['package.json', '58.27.6-workspace-pro-deep-cleanup-2026-ui-controls-system'],
  ['package.json', 'workspace:deep-cleanup:ready'],
  ['package.json', 'verify:v58.27.6'],
  ['src/lib/release/version.ts', 'v58.27.6 Workspace Pro Deep Cleanup + 2026 UI Controls System'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'WorkspaceProFilterBar'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'WorkspaceProControlSelect'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'sharePanelOpen ?'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'commandCenterOpen ?'],
  ['src/app/globals.css', 'v58.27.6 — Workspace Pro Deep Cleanup + 2026 UI Controls System'],
  ['scripts/workspace-pro-deep-cleanup-2026-ui-controls-check.mjs', 'workspace:deep-cleanup:ready'],
];
const errors = [];
for (const [file, marker] of checks) {
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (!text.includes(marker)) errors.push(`${file} missing ${marker}`);
}
if (errors.length) {
  console.error('[verify:v58.27.6] FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('[verify:v58.27.6] OK — Workspace Pro deep cleanup and 2026 UI controls system aligned.');
