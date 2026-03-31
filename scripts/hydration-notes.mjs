import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/app/(app)/app/layout.tsx',
  'src/components/tasks/task-list.tsx',
  'src/components/tasks/task-detail-summary.tsx',
  'src/components/projects/project-detail-summary.tsx',
  'src/components/projects/project-sidebar.tsx',
  'src/components/dashboard/interactive-dashboard-board.tsx',
  'V_Report/VERSION_REPORT_v12.0.0-hydration-hotfix.md',
  'README_V12_HYDRATION.md',
];

let failures = 0;
console.log('\n[hydration-notes] Flowtask V12 hydration hotfix\n');

for (const file of files) {
  const ok = fs.existsSync(path.join(root, file));
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) failures += 1;
}

console.log('\n[hydration-notes] Manual checks');
console.log('1. Run npm run dev');
console.log('2. Open the route that was throwing React 418');
console.log('3. Confirm the minified hydration error no longer appears');
console.log('4. Check dashboard, tasks, task detail, projects and project detail');

if (failures > 0) {
  console.error(`\n[hydration-notes] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log('\n[hydration-notes] Hydration hotfix files are present.\n');
