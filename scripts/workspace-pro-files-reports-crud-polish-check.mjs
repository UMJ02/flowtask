#!/usr/bin/env node
import fs from 'node:fs';
const failures = [];
function read(file) { return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''; }
const pkg = JSON.parse(read('package.json') || '{}');
if (!String(pkg.version ?? '').includes('58.27.5')) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.['verify:current'] !== 'npm run verify:v58.27.5') failures.push('verify:current must target verify:v58.27.5');
if (!read('src/components/workspace-pro/workspace-pro-page.tsx').includes('WorkspaceProFileRow')) failures.push('WorkspaceProFileRow missing');
if (!read('src/components/workspace-pro/workspace-pro-page.tsx').includes('WorkspaceFilesUploadEntry')) failures.push('Upload entry not integrated in Workspace Pro files view');
if (!read('src/components/workspace-pro/workspace-pro-page.tsx').includes('ReportAction')) failures.push('ReportAction cards missing');
if (!read('src/components/workspace-pro/workspace-pro-page.tsx').includes('supabase.from("attachments").update')) failures.push('Attachment rename action missing');
if (!read('src/components/workspace-pro/workspace-pro-page.tsx').includes('supabase.from("attachments").delete')) failures.push('Attachment delete action missing');
if (!read('src/app/globals.css').includes('v58.27.5 — Workspace Pro Files + Reports CRUD Polish')) failures.push('CSS marker missing');
if (failures.length) {
  console.error('[workspace:files-reports:ready] FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('[workspace:files-reports:ready] OK — Workspace Pro files CRUD and report generation polish aligned.');
