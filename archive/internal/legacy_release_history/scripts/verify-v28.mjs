import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hero = fs.readFileSync(path.join(root, 'src/components/dashboard/dashboard-hero.tsx'), 'utf8');
const floating = fs.readFileSync(path.join(root, 'src/components/workspace/floating-actions.tsx'), 'utf8');

const checks = [
  ['buttons same line intent', hero.includes('lg:flex-nowrap')],
  ['quick action button label', floating.includes('Acción rápida')],
  ['slideout panel from right', floating.includes('translate-x-full') && floating.includes('fixed right-0 top-0')),
  ['close x in panel header', floating.includes('Cerrar accesos rápidos')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v28] V28 checks OK.\n');
