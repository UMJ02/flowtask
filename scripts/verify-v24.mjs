import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'src/components/workspace/floating-actions.tsx');
const text = fs.readFileSync(file, 'utf8');

const checks = [
  ['tab exposed more', text.includes("-translate-x-[82%]")],
  ['tab stays visible as separate button', text.includes("absolute left-0 top-1/2 z-20")],
  ['single message', text.includes("A un click de empezar")],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v24] V24 checks OK.\n');
