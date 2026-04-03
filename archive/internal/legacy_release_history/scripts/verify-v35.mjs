import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const header = fs.readFileSync(path.join(root, 'src/components/layout/app-header.tsx'), 'utf8');
const install = fs.readFileSync(path.join(root, 'src/components/pwa/install-app-button.tsx'), 'utf8');

const checks = [
  ['header icon 48px wrapper', header.includes('h-12 w-12') && header.includes('rounded-full bg-slate-950')],
  ['header icon smaller inside', header.includes('width={28}') && header.includes('className="h-7 w-7 object-contain')],
  ['install compact button square', install.includes('rounded-2xl')],
  ['install icon larger fill', install.includes('width={30}') && install.includes('h-[30px] w-[30px]')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v35] V35 checks OK.\n');
