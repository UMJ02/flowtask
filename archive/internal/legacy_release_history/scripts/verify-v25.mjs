import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'src/components/workspace/floating-actions.tsx');
const text = fs.readFileSync(file, 'utf8');

const checks = [
  ['tab uses V21 left placement', text.includes('-translate-x-full')],
  ['tab centered to card', text.includes('top-1/2') && text.includes('-translate-y-1/2')],
  ['single-line vertical text', text.includes('A un click de empezar') && text.includes('whitespace-nowrap')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v25] V25 checks OK.\n');
