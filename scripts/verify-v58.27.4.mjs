#!/usr/bin/env node
import fs from 'node:fs';
const checks = [
  ['package.json', '58.27.4-workspace-pro-board-drag-drop-inline-editing'],
  ['src/lib/release/version.ts', 'v58.27.4 Workspace Pro Board Drag Drop + Inline Editing'],
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
  console.error('[verify:v58.27.4] FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('[verify:v58.27.4] OK — Workspace Pro board drag/drop and inline editing aligned.');
