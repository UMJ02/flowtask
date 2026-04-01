import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const floating = fs.readFileSync(path.join(root, 'src/components/workspace/floating-actions.tsx'), 'utf8');

const checks = [
  ['uses portal', floating.includes('createPortal(')],
  ['renders into document.body', floating.includes('document.body')],
  ['panel still fixed and independent', floating.includes('fixed right-6 top-[132px] z-[100]')],
  ['inline button still exists', floating.includes('Acción rápida')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v30] V30 checks OK.\n');
