import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const home = fs.readFileSync(path.join(root, 'src/app/(public)/page.tsx'), 'utf8');

const checks = [
  ['uses exact user path style', home.includes('src="videos/videointro.mp4"')],
  ['video tag remains desktop background', home.includes('absolute inset-0 hidden lg:block')],
  ['poster fallback exists', home.includes('poster="/icons/icon.png"')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v38] V38 checks OK.\n');
