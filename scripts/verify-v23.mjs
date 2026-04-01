import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'src/components/workspace/floating-actions.tsx');
const text = fs.readFileSync(file, 'utf8');

const checks = [
  ['tab more exposed', text.includes("-translate-x-[92%]")],
  ['taller tab', text.includes("h-[206px]")],
  ['single-line vertical text', text.includes("whitespace-nowrap")],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v23] V23 checks OK.\n');
