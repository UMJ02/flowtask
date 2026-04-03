import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hero = fs.readFileSync(path.join(root, 'src/components/dashboard/dashboard-hero.tsx'), 'utf8');
const floating = fs.readFileSync(path.join(root, 'src/components/workspace/floating-actions.tsx'), 'utf8');

const checks = [
  ['quick action button label', floating.includes('Acción rápida')],
  ['hero includes inline quick actions', hero.includes('<WorkspaceFloatingActions />')],
  ['floating card has close button', floating.includes('Cerrar accesos rápidos')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v27] V27 checks OK.\n');
