import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/components/dashboard/interactive-dashboard-board.tsx',
  'src/components/tasks/task-list.tsx',
  'src/components/tasks/task-detail-summary.tsx',
  'src/components/projects/project-detail-summary.tsx',
  'src/components/projects/project-sidebar.tsx',
  'src/app/(app)/app/layout.tsx',
  'V_Report/VERSION_REPORT_v14.0.0-hydration-typefix-pro.md',
];

let failures = 0;
console.log('\n[debug-hydration] Flowtask V14 hydration/typefix pass\n');

for (const file of files) {
  const ok = fs.existsSync(path.join(root, file));
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) failures += 1;
}

console.log('\n[debug-hydration] Manual verification');
console.log('1. npm run typecheck');
console.log('2. npm run build');
console.log('3. npm run dev');
console.log('4. Open the route where React 418 appears');
console.log('5. Confirm whether the hydration error persists');

if (failures > 0) process.exit(1);
console.log('\n[debug-hydration] V14 files are present.\n');
