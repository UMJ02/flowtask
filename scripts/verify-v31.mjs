import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const taskPage = fs.readFileSync(path.join(root, 'src/app/(app)/app/tasks/page.tsx'), 'utf8');
const projectPage = fs.readFileSync(path.join(root, 'src/app/(app)/app/projects/page.tsx'), 'utf8');
const taskPanel = fs.readFileSync(path.join(root, 'src/components/tasks/task-search-panel.tsx'), 'utf8');
const projectPanel = fs.readFileSync(path.join(root, 'src/components/projects/project-search-panel.tsx'), 'utf8');

const checks = [
  ['tasks use smart panel', taskPage.includes('TaskSearchPanel')],
  ['projects use smart panel', projectPage.includes('ProjectSearchPanel')],
  ['task advanced toggle exists', taskPanel.includes('Búsqueda avanzada')],
  ['project advanced toggle exists', projectPanel.includes('Búsqueda avanzada')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v31] V31 checks OK.\n');
