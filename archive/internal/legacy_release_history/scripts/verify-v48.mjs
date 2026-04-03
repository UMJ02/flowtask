import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mobile = fs.readFileSync(path.join(root, 'src/components/layout/mobile-nav.tsx'), 'utf8');

const checks = [
  ['mobile menu filters same desktop main links', mobile.includes('const mainNavLinks = appNavLinks.filter')),
  ['organization/account extra menu removed', !mobile.includes('Equipo y cuenta')),
  ['single nav section remains', mobile.includes('groups.main.map')),
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v48] V48 checks OK.\n');
