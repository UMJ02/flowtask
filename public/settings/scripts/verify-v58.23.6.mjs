#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
const expectedVersion = '58.23.6-board-anchored-comments-files';
function read(rel){ const full = path.join(root, rel); return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : ''; }
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function needFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function needIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push(`Expected package version ${expectedVersion}, got ${pkg.version}`);
if (pkg.scripts?.['verify:current'] !== 'npm run verify:v58.23.6') failures.push('verify:current must target verify:v58.23.6');
if (pkg.scripts?.['verify:v58.23.6'] !== 'node scripts/verify-v58.23.6.mjs') failures.push('verify:v58.23.6 script must target scripts/verify-v58.23.6.mjs');
for (const rel of [
  'scripts/verify-v58.23.6.mjs',
  'docs/release/V58_23_6_BOARD_ANCHORED_COMMENTS_FILES.md',
  'docs/qa/FLOWTASK_V58_23_6_BOARD_COMMENTS_FILES_QA.md',
  'docs/boards/FLOWTASK_BOARD_ANCHORED_COMMENTS_FILES.md',
  'supabase/migrations/0048_v58_23_6_board_anchored_comments_files.sql',
  'src/components/boards/board-comment-pins.tsx',
  'src/components/boards/board-page.tsx',
  'src/components/boards/board-element.tsx'
]) needFile(rel);
needIncludes('src/lib/release/version.ts', expectedVersion);
needIncludes('src/lib/release/version.ts', 'v58.23.6 Board Anchored Comments + Files');
needIncludes('src/lib/boards/board-types.ts', 'type: "image"');
needIncludes('src/lib/boards/board-types.ts', 'type: "file"');
needIncludes('src/lib/boards/board-tools.ts', 'id: "comment"');
needIncludes('src/lib/boards/board-tools.ts', 'id: "image"');
needIncludes('src/lib/boards/board-tools.ts', 'id: "file"');
needIncludes('src/components/boards/board-page.tsx', 'visual-board-files');
needIncludes('src/components/boards/board-page.tsx', 'handleBoardFileSelected');
needIncludes('src/components/boards/board-page.tsx', 'pendingCommentTarget');
needIncludes('src/components/boards/board-page.tsx', '<BoardCommentPins');
needIncludes('src/components/boards/board-element.tsx', 'element.type === "image"');
needIncludes('src/components/boards/board-element.tsx', 'element.type === "file"');
needIncludes('supabase/migrations/0048_v58_23_6_board_anchored_comments_files.sql', "'image','file'");
needIncludes('supabase/migrations/0048_v58_23_6_board_anchored_comments_files.sql', 'visual-board-files');
needIncludes('package-lock.json', expectedVersion);
if (failures.length) {
  console.error('[verify:v58.23.6] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[verify:v58.23.6] OK — Board anchored comments, images and files aligned.');
