import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const home = fs.readFileSync(path.join(root, 'src/app/(public)/page.tsx'), 'utf8');

const checks = [
  ['video layer has z-0 and content z-10', home.includes('z-0 hidden lg:block') && home.includes('relative z-10 min-h-screen')],
  ['video is absolutely pinned full bleed', home.includes('absolute inset-0 h-full w-full object-cover')],
  ['wrapper no longer uses desktop background overlay', !home.includes('lg:bg-transparent') && home.includes('bg-slate-50 lg:bg-slate-950')],
  ['main card is translucent white', home.includes('bg-white/72')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v41] V41 checks OK.\n');
