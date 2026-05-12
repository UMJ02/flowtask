#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
const expectedVersion = '58.23.5-board-history-shortcuts-minimap';
function read(rel){ const full = path.join(root, rel); return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : ''; }
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function needFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function needIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push(`Expected package version ${expectedVersion}, got ${pkg.version}`);
if (pkg.scripts?.['verify:current'] !== 'npm run verify:v58.23.5') failures.push('verify:current must target verify:v58.23.5');
if (pkg.scripts?.['verify:v58.23.5'] !== 'node scripts/verify-v58.23.5.mjs') failures.push('verify:v58.23.5 script must target scripts/verify-v58.23.5.mjs');
for (const rel of [
  'scripts/verify-v58.23.5.mjs',
  'docs/release/V58_23_5_BOARD_HISTORY_SHORTCUTS_MINIMAP.md',
  'docs/qa/FLOWTASK_V58_23_5_BOARD_HISTORY_SHORTCUTS_MINIMAP_QA.md',
  'docs/boards/FLOWTASK_BOARD_HISTORY_SHORTCUTS_MINIMAP.md',
  'src/components/boards/board-minimap.tsx',
  'src/components/boards/board-page.tsx'
]) needFile(rel);
needIncludes('src/lib/release/version.ts', expectedVersion);
needIncludes('src/lib/release/version.ts', 'v58.23.5 Board History + Shortcuts + Minimap');
needIncludes('src/components/boards/board-page.tsx', 'historyPast');
needIncludes('src/components/boards/board-page.tsx', 'historyFuture');
needIncludes('src/components/boards/board-page.tsx', 'undoBoardChange');
needIncludes('src/components/boards/board-page.tsx', 'redoBoardChange');
needIncludes('src/components/boards/board-page.tsx', 'event.key.toLowerCase() === "z"');
needIncludes('src/components/boards/board-page.tsx', 'event.key.toLowerCase() === "d"');
needIncludes('src/components/boards/board-page.tsx', 'event.key.toLowerCase() === "s"');
needIncludes('src/components/boards/board-page.tsx', 'setActiveTool("hand")');
needIncludes('src/components/boards/board-page.tsx', 'handleCanvasWheel');
needIncludes('src/components/boards/board-page.tsx', '<BoardMiniMap');
needIncludes('src/components/boards/board-minimap.tsx', 'BoardMiniMap');
needIncludes('src/components/boards/board-minimap.tsx', 'getBounds');
needIncludes('src/components/boards/board-minimap.tsx', 'Click para navegar');
needIncludes('package-lock.json', expectedVersion);
if (failures.length) {
  console.error('[verify:v58.23.5] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[verify:v58.23.5] OK — Board history, shortcuts and real minimap aligned.');
