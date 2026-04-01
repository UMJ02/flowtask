import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/app/(app)/app/dashboard/page.tsx',
  'src/app/(app)/app/board/page.tsx',
  'src/components/layout/nav-links.ts',
  'src/components/workspace/quick-actions.tsx',
  'src/components/dashboard/dashboard-hero.tsx',
  'V_Report/VERSION_REPORT_v16.0.0-dashboard-cleanup-board-move.md',
];

let failures = 0;
for (const file of files) {
  const ok = fs.existsSync(path.join(root, file));
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v16] V16 structure OK.\n');
