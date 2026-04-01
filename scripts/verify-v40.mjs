import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const home = fs.readFileSync(path.join(root, 'src/app/(public)/page.tsx'), 'utf8');

const checks = [
  ['desktop wrapper no longer uses gradient overlay bg class', home.includes('bg-slate-50 lg:bg-transparent')],
  ['video still uses absolute path', home.includes('src="/videos/videointro.mp4"')],
  ['main card uses white transparent bg', home.includes('bg-white/68')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v40] V40 checks OK.\n');
