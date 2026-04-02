import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const taskDetail = fs.readFileSync(path.join(root, 'src/app/(app)/app/tasks/[id]/page.tsx'), 'utf8');
const projectDetail = fs.readFileSync(path.join(root, 'src/app/(app)/app/projects/[id]/page.tsx'), 'utf8');
const taskNew = fs.readFileSync(path.join(root, 'src/app/(app)/app/tasks/new/page.tsx'), 'utf8');
const projectNew = fs.readFileSync(path.join(root, 'src/app/(app)/app/projects/new/page.tsx'), 'utf8');
const clientPanels = fs.readFileSync(path.join(root, 'src/components/clients/client-detail-panels.tsx'), 'utf8');

const checks = [
  ['task detail includes attachments', taskDetail.includes('EntityAttachments entityType="task"')),
  ['project detail includes attachments', projectDetail.includes('EntityAttachments entityType="project"')),
  ['task new supports prefill from relations', taskNew.includes('projectId') && taskNew.includes('clientName')),
  ['project new supports client prefill', projectNew.includes('clientName')),
  ['client detail includes creation CTAs', clientPanels.includes('Nuevo proyecto') && clientPanels.includes('Nueva tarea')),
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v51] V51 checks OK.\n');
