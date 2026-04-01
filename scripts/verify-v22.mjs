import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'src/components/workspace/floating-actions.tsx');
const text = fs.readFileSync(target, 'utf8');

const checks = [
  ['single message', text.includes('A un click de empezar')],
  ['centered tab placement', text.includes('top-1/2') && text.includes('-translate-y-1/2')],
  ['closed blue state', text.includes('#38bdf8') && text.includes('#2563eb')],
  ['open green state', text.includes('#10b981') && text.includes('#0f766e')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v22] V22 checks OK.\n');
