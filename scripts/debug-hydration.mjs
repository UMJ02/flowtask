import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = [
  'src/components/dashboard/interactive-dashboard-board.tsx',
  'src/components/tasks/task-list.tsx',
  'src/components/tasks/task-detail-summary.tsx',
  'src/components/projects/project-detail-summary.tsx',
  'src/components/projects/project-sidebar.tsx',
  'src/app/(app)/app/layout.tsx',
  'V_Report/VERSION_REPORT_v13.0.0-typefix-hydration-followup.md',
];

let failures = 0;

console.log('\n[debug-hydration] Flowtask V13 follow-up\n');

for (const file of targets) {
  const ok = fs.existsSync(path.join(root, file));
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${file}`);
  if (!ok) failures += 1;
}

console.log('\n[debug-hydration] Next step if React 418 persists');
console.log('1. Run the app in dev mode');
console.log('2. Open the exact route that crashes');
console.log('3. Capture the full non-minified hydration warning from the browser');
console.log('4. Use that route and component name as the next hotfix target');

if (failures > 0) {
  console.error(`\n[debug-hydration] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log('\n[debug-hydration] Follow-up files are present.\n');
