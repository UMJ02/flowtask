#!/usr/bin/env node
import fs from 'node:fs';
const files = {
  page: 'src/components/workspace-pro/workspace-pro-page.tsx',
  version: 'src/lib/release/version.ts',
  pkg: 'package.json'
};
const errors = [];
for (const [name, path] of Object.entries(files)) if (!fs.existsSync(path)) errors.push(`Missing ${name}: ${path}`);
const page = fs.existsSync(files.page) ? fs.readFileSync(files.page, 'utf8') : '';
const pkg = fs.existsSync(files.pkg) ? fs.readFileSync(files.pkg, 'utf8') : '';
for (const marker of [
  'WorkspaceProBoardTaskEditor',
  'onDragOver',
  'onDrop',
  'dataTransfer.setData("text/task-id"',
  'workspace:board-pro:ready',
  'ws-pro-board-column',
  'ws-pro-board-card',
  'Mostrar concluidas'
]) {
  const source = marker === 'workspace:board-pro:ready' ? pkg : page;
  if (!source.includes(marker)) errors.push(`Missing marker: ${marker}`);
}
if (!pkg.includes('verify:v58.27.6') && !pkg.includes('verify:v58.27.7') && !pkg.includes('verify:v58.27.7.1') && !pkg.includes('verify:v58.27.8') && !pkg.includes('verify:v58.27.8.1') && !pkg.includes('verify:v58.27.9') && !pkg.includes('verify:v58.28.0')) errors.push('verify:current is not aligned to active v58.27.x/v58.28.x');
if (errors.length) {
  console.error('[workspace:board-pro:ready] FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('[workspace:board-pro:ready] OK — board drag/drop, columns and task editor are aligned.');
