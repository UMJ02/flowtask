import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const floating = fs.readFileSync(path.join(root, 'src/components/workspace/floating-actions.tsx'), 'utf8');

const checks = [
  ['inline trigger button exists', floating.includes('Acción rápida')],
  ['panel is fixed floating layer', floating.includes('fixed right-6 top-[132px] z-50')),
  ['panel is independent from hero flow', floating.includes('pointer-events-auto rounded-[28px]')),
  ['close x remains in panel header', floating.includes('Cerrar accesos rápidos')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v29] V29 checks OK.\n');
