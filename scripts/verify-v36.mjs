import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const home = fs.readFileSync(path.join(root, 'src/app/(public)/page.tsx'), 'utf8');
const showcase = fs.readFileSync(path.join(root, 'src/components/public/home-showcase-card.tsx'), 'utf8');

const checks = [
  ['desktop video block exists', home.includes('/videos/videointro.mp4') && home.includes('hidden') && home.includes('lg:block')],
  ['mobile hides video naturally', home.includes('hidden min-h-[520px]') && home.includes('lg:block')],
  ['info card centered', home.includes('items-center justify-center')],
  ['rotating showcase exists', showcase.includes('8000') && showcase.includes('ITEMS')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v36] V36 checks OK.\n');
