#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
const expectedVersion = '58.23.7-board-realtime-collaboration';
function read(rel){ const full = path.join(root, rel); return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : ''; }
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function needFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function needIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push(`Expected package version ${expectedVersion}, got ${pkg.version}`);
if (pkg.scripts?.['verify:current'] !== 'npm run verify:v58.23.7') failures.push('verify:current must target verify:v58.23.7');
if (pkg.scripts?.['verify:v58.23.7'] !== 'node scripts/verify-v58.23.7.mjs') failures.push('verify:v58.23.7 script must target scripts/verify-v58.23.7.mjs');
for (const rel of [
  'scripts/verify-v58.23.7.mjs',
  'docs/release/V58_23_7_BOARD_REALTIME_COLLABORATION.md',
  'docs/qa/FLOWTASK_V58_23_7_BOARD_REALTIME_QA.md',
  'docs/boards/FLOWTASK_BOARD_REALTIME_COLLABORATION.md',
  'supabase/migrations/0049_v58_23_7_board_realtime_collaboration.sql',
  'src/components/boards/board-realtime-cursors.tsx',
  'src/components/boards/board-page.tsx',
  'src/lib/boards/board-types.ts'
]) needFile(rel);
needIncludes('src/lib/release/version.ts', expectedVersion);
needIncludes('src/lib/release/version.ts', 'v58.23.7 Board Realtime Collaboration');
needIncludes('src/lib/boards/board-types.ts', 'VisualBoardPresence');
needIncludes('src/components/boards/board-page.tsx', 'supabase.channel(`visual-board:${boardId}`');
needIncludes('src/components/boards/board-page.tsx', 'postgres_changes');
needIncludes('src/components/boards/board-page.tsx', 'presence');
needIncludes('src/components/boards/board-page.tsx', 'publishRealtimeCursor');
needIncludes('src/components/boards/board-page.tsx', '<BoardRealtimeCursors');
needIncludes('src/components/boards/board-realtime-cursors.tsx', 'BoardRealtimeCursors');
needIncludes('supabase/migrations/0049_v58_23_7_board_realtime_collaboration.sql', 'supabase_realtime');
needIncludes('supabase/migrations/0049_v58_23_7_board_realtime_collaboration.sql', 'visual_board_elements');
needIncludes('supabase/migrations/0049_v58_23_7_board_realtime_collaboration.sql', 'visual_board_comments');
needIncludes('package-lock.json', expectedVersion);
if (failures.length) {
  console.error('[verify:v58.23.7] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[verify:v58.23.7] OK — Board realtime collaboration aligned.');
