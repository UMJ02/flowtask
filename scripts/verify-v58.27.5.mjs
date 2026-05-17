#!/usr/bin/env node
import fs from 'node:fs';
const checks = [
  ['package.json', '58.27.5-workspace-pro-files-reports-crud-polish'],
  ['package.json', 'workspace:files-reports:ready'],
  ['src/lib/release/version.ts', 'v58.27.5 Workspace Pro Files + Reports CRUD Polish'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'WorkspaceProFileRow'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'WorkspaceFilesUploadEntry'],
  ['src/components/workspace-pro/workspace-pro-page.tsx', 'ReportAction'],
  ['src/app/globals.css', 'v58.27.5 — Workspace Pro Files + Reports CRUD Polish']
];
const errors = [];
for (const [file, marker] of checks) {
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (!text.includes(marker)) errors.push(`${file} missing ${marker}`);
}
if (errors.length) {
  console.error('[verify:v58.27.5] FAIL');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('[verify:v58.27.5] OK — Workspace Pro files and reports CRUD polish aligned.');
