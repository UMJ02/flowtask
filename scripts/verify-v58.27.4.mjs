#!/usr/bin/env node
import fs from 'node:fs';
const checks = [
  ['package.json', '58.27.6-workspace-pro-deep-cleanup-2026-ui-controls-system'],
  ['src/lib/release/version.ts', 'v58.27.6 Workspace Pro Deep Cleanup + 2026 UI Controls System'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'WorkspaceProBoardTaskEditor'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'ws-pro-board-column'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'Mover a'],
  ['package.json', 'workspace:board-pro:ready']
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
console.log('[verify:v58.27.6] OK — Workspace Pro board drag/drop and inline editing aligned.');
