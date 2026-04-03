import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const home = fs.readFileSync(path.join(root, 'src/app/(public)/page.tsx'), 'utf8');
const showcase = fs.readFileSync(path.join(root, 'src/components/public/home-showcase-card.tsx'), 'utf8');

const checks = [
  ['video is full background layer', home.includes('absolute inset-0 hidden lg:block') && home.includes('/videos/videointro.mp4')],
  ['single right card remains', home.includes('max-w-[540px] rounded-[32px]')],
  ['showcase cleaned up', showcase.includes('bg-white/42')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v37] V37 checks OK.\n');
