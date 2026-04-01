import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const home = fs.readFileSync(path.join(root, 'src/app/(public)/page.tsx'), 'utf8');
const showcase = fs.readFileSync(path.join(root, 'src/components/public/home-showcase-card.tsx'), 'utf8');
const globals = fs.readFileSync(path.join(root, 'src/app/globals.css'), 'utf8');

const checks = [
  ['desktop title turns white', home.includes('lg:text-white')],
  ['desktop description turns white', home.includes('lg:text-white/88')],
  ['showcase has animated glow styles', showcase.includes('pulse-outline') && showcase.includes('glow-emerald')),
  ['globals include glow classes', globals.includes('.glow-emerald') && globals.includes('@keyframes pulse-outline')),
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}
if (failures > 0) process.exit(1);
console.log('\n[verify:v42] V42 checks OK.\n');
