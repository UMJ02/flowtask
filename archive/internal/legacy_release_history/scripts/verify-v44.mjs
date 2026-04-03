import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const showcase = fs.readFileSync(path.join(root, 'src/components/public/home-showcase-card.tsx'), 'utf8');

const checks = [
  ['mobile active emerald card has filled bg', showcase.includes('bg-emerald-500/90 lg:bg-emerald-50/72')),
  ['mobile active sky card has filled bg', showcase.includes('bg-sky-500/90 lg:bg-sky-50/72')),
  ['mobile active violet card has filled bg', showcase.includes('bg-violet-500/90 lg:bg-violet-50/72')),
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v44] V44 checks OK.\n');
