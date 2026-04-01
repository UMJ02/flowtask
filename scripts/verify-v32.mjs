import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const taskWorkspace = fs.readFileSync(path.join(root, 'src/components/tasks/task-workspace.tsx'), 'utf8');
const taskList = fs.readFileSync(path.join(root, 'src/components/tasks/task-action-list.tsx'), 'utf8');
const projects = fs.readFileSync(path.join(root, 'src/app/(app)/app/projects/page.tsx'), 'utf8');

const checks = [
  ['tasks use action list', taskWorkspace.includes('TaskActionList')],
  ['task conclude button exists', taskList.includes('Finalizar')],
  ['completed toggle exists', taskList.includes('Ver tareas concluidas')],
  ['projects have colorful accents', projects.includes('radial-gradient(circle_at_top_left')),
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v32] V32 checks OK.\n');
