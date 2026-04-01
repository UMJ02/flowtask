import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const home = fs.readFileSync(path.join(root, 'src/app/(public)/page.tsx'), 'utf8');
const showcase = fs.readFileSync(path.join(root, 'src/components/public/home-showcase-card.tsx'), 'utf8');

const checks = [
  ['desktop description now white', home.includes('lg:text-white lg:[text-shadow:0_8px_24px_rgba(15,23,42,0.28)]')),
  ['active label switches to white', showcase.includes("active && 'text-white lg:text-white'")),
  ['active value switches to white', showcase.includes("active && 'text-white animate-[fade-rise_500ms_ease-out]'")),
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v43] V43 checks OK.\n');
