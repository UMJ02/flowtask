import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const shell = fs.readFileSync(path.join(root, 'src/components/layout/app-shell.tsx'), 'utf8');
const header = fs.readFileSync(path.join(root, 'src/components/layout/app-header.tsx'), 'utf8');

const checks = [
  ['outer header wrapper removed', !shell.includes('glass-strip sticky top-2 z-20 rounded-[26px] p-2')],
  ['header has green palette', header.includes('text-emerald-600') && header.includes('border-emerald-100/90')],
  ['app icon circle is black', header.includes('rounded-full bg-slate-950')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v33] V33 checks OK.\n');
