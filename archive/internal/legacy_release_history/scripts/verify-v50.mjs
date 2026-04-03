import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [
  ['core nav links', fs.readFileSync(path.join(root,'src/components/layout/nav-links.ts'),'utf8').includes('/app/notifications')],
  ['task detail route exists', fs.existsSync(path.join(root,'src/app/(app)/app/tasks/[id]/page.tsx'))],
  ['task edit route exists', fs.existsSync(path.join(root,'src/app/(app)/app/tasks/[id]/edit/page.tsx'))],
  ['project detail route exists', fs.existsSync(path.join(root,'src/app/(app)/app/projects/[id]/page.tsx'))],
  ['project edit route exists', fs.existsSync(path.join(root,'src/app/(app)/app/projects/[id]/edit/page.tsx'))],
  ['client detail route exists', fs.existsSync(path.join(root,'src/app/(app)/app/clients/[id]/page.tsx'))],
  ['client manager exists', fs.existsSync(path.join(root,'src/components/clients/client-manager-panel.tsx'))],
];
let failures=0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures++;
}
if (failures) process.exit(1);
console.log('\n[verify:v50] V50 checks OK.\n');
