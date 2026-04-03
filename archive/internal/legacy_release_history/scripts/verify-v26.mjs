import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'src/components/workspace/floating-actions.tsx');
const text = fs.readFileSync(file, 'utf8');

const checks = [
  ['button group more exposed', text.includes('-translate-x-[90%]')],
  ['closed blue state', text.includes('#38bdf8') && text.includes('#2563eb')],
  ['open green state', text.includes('#10b981') && text.includes('#0f766e')],
  ['visible z-index', text.includes('z-20')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v26] V26 checks OK.\n');
