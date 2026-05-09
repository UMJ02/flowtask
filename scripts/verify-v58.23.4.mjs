#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const failures = [];
const expectedVersion = '58.23.4-board-sharing-collaboration-layer';
function read(rel){ const full = path.join(root, rel); return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : ''; }
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function needFile(rel){ if(!exists(rel)) failures.push(`Missing required file: ${rel}`); }
function needIncludes(rel, text){ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); }
const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push(`Expected package version ${expectedVersion}, got ${pkg.version}`);
if (pkg.scripts?.['verify:current'] !== 'npm run verify:v58.23.4') failures.push('verify:current must target verify:v58.23.4');
if (pkg.scripts?.['verify:v58.23.4'] !== 'node scripts/verify-v58.23.4.mjs') failures.push('verify:v58.23.4 script must target scripts/verify-v58.23.4.mjs');
for (const rel of [
  'scripts/verify-v58.23.4.mjs',
  'docs/release/V58_23_4_BOARD_SHARING_COLLABORATION_LAYER.md',
  'docs/qa/FLOWTASK_V58_23_4_BOARD_SHARING_COLLABORATION_QA.md',
  'docs/boards/FLOWTASK_BOARD_SHARING_COLLABORATION.md',
  'supabase/migrations/0047_v58_23_4_board_sharing_collaboration.sql',
  'src/components/boards/board-sharing-panel.tsx',
  'src/components/boards/board-share-view.tsx',
  'src/app/(public)/share/boards/[token]/page.tsx'
]) needFile(rel);
needIncludes('src/lib/release/version.ts', expectedVersion);
needIncludes('src/lib/release/version.ts', 'v58.23.4 Board Sharing + Collaboration Layer');
needIncludes('supabase/migrations/0047_v58_23_4_board_sharing_collaboration.sql', 'visual_board_collaborators');
needIncludes('supabase/migrations/0047_v58_23_4_board_sharing_collaboration.sql', 'share_token');
needIncludes('supabase/migrations/0047_v58_23_4_board_sharing_collaboration.sql', "visibility = 'public_link'");
needIncludes('src/components/boards/board-topbar.tsx', 'onOpenShare');
needIncludes('src/components/boards/board-page.tsx', 'BoardSharingPanel');
needIncludes('src/components/boards/board-page.tsx', 'updateBoardSharing');
needIncludes('src/components/boards/board-page.tsx', 'inviteBoardCollaborator');
needIncludes('src/components/boards/board-share-view.tsx', 'BoardShareView');
needIncludes('src/lib/boards/board-types.ts', 'VisualBoardCollaborator');
needIncludes('src/lib/boards/board-serialization.ts', 'mapBoardCollaboratorRow');
needIncludes('package-lock.json', expectedVersion);
if (failures.length) {
  console.error('[verify:v58.23.4] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[verify:v58.23.4] OK — Board Sharing + Collaboration Layer aligned.');
