#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
const expectedVersion = '58.24.0-board-canvas-layout-alignment';
function read(rel){ const full = path.join(root, rel); return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : ''; }
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function needFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function needIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push(`Expected package version ${expectedVersion}, got ${pkg.version}`);
if (pkg.scripts?.['verify:current'] !== 'npm run verify:v58.24.0') failures.push('verify:current must target verify:v58.24.0');
if (pkg.scripts?.['verify:v58.24.0'] !== 'node scripts/verify-v58.24.0.mjs') failures.push('verify:v58.24.0 script must target scripts/verify-v58.24.0.mjs');
for (const rel of [
  'scripts/verify-v58.24.0.mjs',
  'docs/release/V58_24_BOARD_CANVAS_LAYOUT_ALIGNMENT.md',
  'docs/qa/FLOWTASK_V58_24_BOARD_LAYOUT_QA.md',
  'docs/boards/FLOWTASK_BOARD_LAYOUT_ALIGNMENT.md',
  'src/components/boards/board-workspace-rail.tsx',
  'src/components/boards/board-toolbox.tsx',
  'src/components/boards/board-comments-activity.tsx',
  'src/components/boards/board-page.tsx',
  'src/app/globals.css'
]) needFile(rel);
needIncludes('src/lib/release/version.ts', expectedVersion);
needIncludes('src/lib/release/version.ts', 'v58.24 Board Canvas Layout Alignment');
needIncludes('src/components/boards/board-page.tsx', '<BoardWorkspaceRail');
needIncludes('src/components/boards/board-page.tsx', 'lg:grid-cols-[76px_1fr]');
needIncludes('src/components/boards/board-toolbox.tsx', 'w-[92px]');
needIncludes('src/components/boards/board-comments-activity.tsx', 'Seguimiento');
needIncludes('src/components/boards/board-comments-activity.tsx', 'setTab("comments")');
needIncludes('src/components/boards/board-comments-activity.tsx', 'overflow-y-auto');
needIncludes('src/app/globals.css', '.board-panel');
needIncludes('package-lock.json', expectedVersion);
if (failures.length) {
  console.error('[verify:v58.24.0] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[verify:v58.24.0] OK — Board canvas layout aligned with blueprint.');
